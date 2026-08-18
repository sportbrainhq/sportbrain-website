/**
 * Manual ingestion entry point.
 *
 * ```bash
 * pnpm --filter @sportbrain/api ingest wikidata teams football --max-pages=1
 * pnpm --filter @sportbrain/api ingest wikidata people cricket
 * ```
 *
 * A CLI rather than a cron job at this stage, deliberately. Backfill is a
 * long-running operation against a free public endpoint and should be started by
 * a person who is watching it, at least until its behaviour on each sport is
 * understood. Scheduled incremental syncs come later, and they will need the
 * Postgres advisory lock discussed in `jobs.module.ts`: in-process cron runs on
 * every replica, and double-ingesting wastes quota against providers that
 * suspend accounts for exactly that.
 *
 * ## Why this does not boot the Nest application
 *
 * It follows `database/migrate.ts`, which makes the same choice for the same
 * reason. This script runs under `tsx`, whose esbuild transform strips the
 * decorator metadata Nest's dependency injection reads at runtime, so
 * `NestFactory.createApplicationContext` resolves constructor parameters as
 * `undefined`. The API itself is compiled by the Nest CLI and unaffected; only
 * standalone scripts hit it.
 *
 * Wiring the three services by hand is a few lines, keeps this script fast to
 * start, and avoids adding a second TypeScript toolchain to the repository for
 * one command. The cost is that this list must be updated when a service gains a
 * dependency, which a failing run makes obvious immediately.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import * as schema from '../database/schema';
import { DatabaseService } from '../database/database.service';
import { EntityResolutionService } from './ingestion/entity-resolution.service';
import { IngestionService } from './ingestion/ingestion.service';
import { WikidataProvider } from './providers/wikidata/wikidata.provider';
import { SUPPORTED_SPORT_SLUGS } from './providers/wikidata/wikidata.sources';

// Outside the Nest context, so ConfigModule's .env loading does not apply.
// Repository root first, where the shared .env lives, then this app's own.
for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , providerKey, entityType, sportSlug, ...flags] = process.argv;

  if (!providerKey || !entityType || !sportSlug) {
    process.stderr.write(
      'Usage: ingest <provider> <all|teams|people|competitions|venues|honours> <sport-slug> [--max-pages=N]\n',
    );
    process.stderr.write(`Supported sports: ${SUPPORTED_SPORT_SLUGS.join(', ')}\n`);
    process.exitCode = 1;
    return;
  }

  const maxPagesFlag = flags.find((flag) => flag.startsWith('--max-pages='));
  const maxPages = maxPagesFlag ? Number.parseInt(maxPagesFlag.split('=')[1] ?? '', 10) : undefined;

  const config = loadConfiguration();
  const client = postgres(config.database.url, {
    max: 2,
    ssl: config.database.ssl ? 'require' : false,
    onnotice: () => {},
  });

  // A structural stand-in for DatabaseService. The ingestion services only ever
  // read `.db`, so this satisfies them without the DI container, and going via
  // `unknown` states plainly that the lifecycle methods are deliberately absent
  // rather than accidentally missing: nothing here calls them.
  const database = { db: drizzle(client, { schema }) } as unknown as DatabaseService;

  const resolution = new EntityResolutionService(database);
  const ingestion = new IngestionService(database, resolution);

  try {
    if (providerKey !== 'wikidata') throw new Error(`Unknown provider "${providerKey}"`);
    const provider = new WikidataProvider();

    process.stdout.write(`Ingesting ${entityType} for ${sportSlug} from ${providerKey}\n`);
    const startedAt = Date.now();

    // `all` runs the passes in dependency order: competitions and venues are
    // referenced by events later, and honours need people to already exist.
    const types =
      entityType === 'all'
        ? ['competitions', 'venues', 'teams', 'people', 'honours']
        : [entityType];

    let failed = false;

    for (const type of types) {
      const typeStartedAt = Date.now();
      const summary =
        type === 'teams'
          ? await ingestion.ingestTeams(provider, sportSlug, { maxPages })
          : type === 'people'
            ? await ingestion.ingestPeople(provider, sportSlug, { maxPages })
            : type === 'competitions'
              ? await ingestion.ingestCompetitions(provider, sportSlug, { maxPages })
              : type === 'venues'
                ? await ingestion.ingestVenues(provider, sportSlug, { maxPages })
                : type === 'honours'
                  ? await ingestion.ingestHonours(provider, sportSlug, { maxBatches: maxPages })
                  : (() => {
                      throw new Error(`Unknown entity type "${type}"`);
                    })();

      const seconds = ((Date.now() - typeStartedAt) / 1_000).toFixed(1);
      process.stdout.write(
        `  ${type.padEnd(13)} ${summary.status.padEnd(9)} ${seconds}s  ` +
          `read ${summary.read}, written ${summary.written}, ` +
          `queued ${summary.queued}, failed ${summary.failed}, requests ${summary.requestsUsed}\n`,
      );

      if (summary.status === 'failed') failed = true;
    }

    const total = ((Date.now() - startedAt) / 1_000).toFixed(1);
    process.stdout.write(`Done in ${total}s\n`);
    process.exitCode = failed ? 1 : 0;
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
