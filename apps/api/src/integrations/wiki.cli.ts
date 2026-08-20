/**
 * Wikipedia ingestion.
 *
 * ```bash
 * pnpm --filter @sportbrain/api wiki map teams football 500
 * pnpm --filter @sportbrain/api wiki facts teams football 200
 * pnpm --filter @sportbrain/api wiki crests football 300
 * pnpm --filter @sportbrain/api wiki crests all 3000 overwrite
 * pnpm --filter @sportbrain/api wiki rankings football 60
 * pnpm --filter @sportbrain/api wiki cricket-stats 300
 * pnpm --filter @sportbrain/api wiki careers 300
 * pnpm --filter @sportbrain/api wiki career-totals 400
 * pnpm --filter @sportbrain/api wiki all football 200
 * ```
 *
 * `map` must run before anything else for a given entity type: it resolves
 * Wikipedia titles from the Wikidata identifiers already held, and every other
 * command reads those titles.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import type { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { InMemoryCacheService } from '../infrastructure/cache/cache.service';
import { WikipediaIngestionService } from './ingestion/wikipedia-ingestion.service';
import { WikipediaClient } from './providers/wikipedia/wikipedia.client';
import { WikipediaProvider } from './providers/wikipedia/wikipedia.provider';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    process.stderr.write(
      'Usage: wiki <map|facts|crests|rankings|cricket-stats|basketball-stats|careers|career-totals|all> [entityType] [sport] [limit]\n',
    );
    process.exitCode = 1;
    return;
  }

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const database = { db: drizzle(client, { schema }) } as unknown as DatabaseService;
  // A no-op cache, deliberately. This CLI is its own process, so the running
  // API's in-memory cache is not reachable from here and clearing a local one
  // would be theatre. The web revalidation call below is what makes the change
  // visible; an API served from a long-lived process still needs restarting or
  // its own invalidation endpoint, which is why the cache TTLs are short.
  const cache = new InMemoryCacheService();
  const ingestion = new WikipediaIngestionService(
    database,
    new WikipediaProvider(new WikipediaClient()),
    cache,
  );

  const startedAt = Date.now();

  try {
    switch (command) {
      case 'map': {
        const [entityType, sport, limit] = args;
        const mapped = await ingestion.mapTitles(
          (entityType ?? 'team') as 'team',
          sport === 'all' ? null : (sport ?? null),
          Number(limit ?? 500),
        );
        process.stdout.write(`Mapped ${mapped} Wikipedia titles\n`);
        break;
      }

      case 'facts': {
        const [entityType, sport, limit, slug] = args;
        const result = await ingestion.ingestFacts(
          (entityType ?? 'team') as 'team',
          sport === 'all' ? null : (sport ?? null),
          Number(limit ?? 100),
          // A fourth argument names one entity. Needed because the default
          // ordering is by honours held, and an entity whose honours are
          // recorded against a differently named article sorts last however
          // high the limit goes: FC Barcelona fell outside the top 400 clubs.
          slug,
        );
        process.stdout.write(`${result.entities} entities, ${result.facts} facts\n`);
        break;
      }

      case 'rankings': {
        const [sport, limit] = args;
        const result = await ingestion.ingestTeamRankings(sport ?? 'football', Number(limit ?? 40));
        process.stdout.write(`${result.teams} teams, ${result.rankings} tables\n`);
        break;
      }

      case 'crests': {
        const [sport, limit, mode] = args;
        const result = await ingestion.ingestTeamCrests(
          sport === 'all' ? null : (sport ?? 'football'),
          Number(limit ?? 200),
          mode === 'overwrite',
        );
        process.stdout.write(
          `${result.examined} scanned, ${result.resolved} crests, ${result.written} teams updated\n`,
        );
        break;
      }

      case 'basketball-stats': {
        const result = await ingestion.ingestBasketballStats(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.blocks} stat blocks\n`);
        break;
      }

      case 'cricket-stats': {
        const result = await ingestion.ingestCricketStats(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.blocks} stat blocks\n`);
        break;
      }

      /**
       * Football's three headline tiles: appearances, goals, trophies.
       *
       * Football only, matching the registry. Other sports count a career in
       * their own terms and get their own command when their data is done.
       */
      case 'career-totals': {
        const result = await ingestion.ingestFootballCareerTotals(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players examined, ${result.written} written\n`);
        break;
      }

      case 'careers': {
        const result = await ingestion.ingestFootballCareers(Number(args[0] ?? 200));
        process.stdout.write(`${result.players} players, ${result.spells} club spells\n`);
        break;
      }

      /**
       * The full pipeline for one sport, in dependency order.
       *
       * Titles first, because nothing else can run without them, then the four
       * layers outward from the sport itself.
       */
      case 'all': {
        const [sport, limit] = args;
        const sportSlug = sport ?? 'football';
        const cap = Number(limit ?? 150);

        for (const entityType of ['sport', 'competition', 'team', 'person'] as const) {
          const mapped = await ingestion.mapTitles(
            entityType,
            entityType === 'sport' ? null : sportSlug,
            1_000,
          );
          const result = await ingestion.ingestFacts(
            entityType,
            entityType === 'sport' ? null : sportSlug,
            cap,
          );
          process.stdout.write(
            `  ${entityType.padEnd(12)} mapped ${String(mapped).padStart(4)}  ` +
              `${String(result.entities).padStart(4)} entities  ${result.facts} facts\n`,
          );
        }

        const crests = await ingestion.ingestTeamCrests(sportSlug, cap);
        process.stdout.write(
          `  crests       ${crests.written} teams updated from ${crests.resolved} files\n`,
        );

        const rankings = await ingestion.ingestTeamRankings(sportSlug, Math.min(cap, 60));
        process.stdout.write(
          `  rankings     ${rankings.teams} teams, ${rankings.rankings} tables\n`,
        );

        if (sportSlug === 'cricket') {
          const stats = await ingestion.ingestCricketStats(cap);
          process.stdout.write(`  stats        ${stats.players} players, ${stats.blocks} blocks\n`);
        }

        if (sportSlug === 'basketball') {
          const stats = await ingestion.ingestBasketballStats(cap);
          process.stdout.write(`  stats        ${stats.players} players, ${stats.blocks} blocks\n`);
        }

        if (sportSlug === 'football') {
          const careers = await ingestion.ingestFootballCareers(cap);
          process.stdout.write(
            `  careers      ${careers.players} players, ${careers.spells} spells\n`,
          );

          // Last, because the trophy count reads the honours the fact passes
          // above have just written.
          const totals = await ingestion.ingestFootballCareerTotals(cap);
          process.stdout.write(
            `  headline     ${totals.written}/${totals.players} players with career totals\n`,
          );
        }
        break;
      }

      default:
        throw new Error(`Unknown command "${command}"`);
    }

    process.stdout.write(`Done in ${((Date.now() - startedAt) / 1_000).toFixed(1)}s\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  } finally {
    await client.end({ timeout: 5 });
  }
}

void main();
