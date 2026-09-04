/**
 * News Engine manual triggers.
 *
 * ```bash
 * pnpm --filter @sportbrain/api news fetch-source <slug>
 * pnpm --filter @sportbrain/api news fetch-due
 * pnpm --filter @sportbrain/api news reprocess-fetch <fetchId>
 * pnpm --filter @sportbrain/api news reprocess-article <articleId>
 * ```
 *
 * This CLI runs the same `NewsFetcherService`/`NewsProcessorService` logic
 * the BullMQ workers use, but synchronously and in this process, bypassing
 * the queue entirely. That makes it useful for manual testing and
 * troubleshooting a specific source or fetch without needing Redis running,
 * and it is exactly why that logic lives in plain injectable services rather
 * than being written directly inside `queue/news-fetch.worker.ts`.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadConfiguration } from '../config/configuration';
import type { TypedConfigService } from '../config';
import type { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { NewsFetcherService } from '../modules/news/news-fetcher.service';
import { NewsProcessorService } from '../modules/news/news-processor.service';
import { NewsWorkerRepository } from '../modules/news/news-worker.repository';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    process.stderr.write(
      'Usage: news <fetch-source|fetch-due|reprocess-fetch|reprocess-article> [arg]\n',
    );
    process.exitCode = 1;
    return;
  }

  const config = loadConfiguration();
  const client = postgres(config.database.url, { max: 2, onnotice: () => {} });
  const database = { db: drizzle(client, { schema }) } as unknown as DatabaseService;

  const repository = new NewsWorkerRepository(database);
  // Minimal stand-in satisfying the TypedConfigService shape the services
  // need (`.get(key, { infer: true })`), without booting Nest's ConfigModule
  // for a one-shot CLI process. Mirrors how other *.cli.ts files construct
  // services directly rather than through the DI container.
  const typedConfig = {
    get: (key: string) => getByPath(config, key),
  } as unknown as TypedConfigService;

  const fetcher = new NewsFetcherService(repository, typedConfig);
  const processor = new NewsProcessorService(repository);

  const startedAt = Date.now();

  try {
    switch (command) {
      case 'fetch-source': {
        const [slug] = args;
        if (!slug) throw new Error('Usage: news fetch-source <slug>');

        const source = await repository.findSourceBySlug(slug);
        if (!source) throw new Error(`No news_sources row with slug "${slug}"`);

        const result = await fetcher.fetchSource(source);
        process.stdout.write(`${slug}: ${JSON.stringify(result)}\n`);
        break;
      }

      case 'fetch-due': {
        const dueSources = await repository.findDueSources();
        process.stdout.write(`${dueSources.length} source(s) due\n`);

        for (const source of dueSources) {
          try {
            const result = await fetcher.fetchSource(source);
            process.stdout.write(`  ${source.slug}: ${JSON.stringify(result)}\n`);
          } catch (error) {
            process.stdout.write(
              `  ${source.slug}: ERROR ${error instanceof Error ? error.message : String(error)}\n`,
            );
          }
        }
        break;
      }

      case 'reprocess-fetch': {
        const [fetchId] = args;
        if (!fetchId) throw new Error('Usage: news reprocess-fetch <fetchId>');

        const result = await processor.processFetch(fetchId);
        process.stdout.write(
          `fetch ${fetchId}: ${result.inserted} inserted, ${result.skippedDuplicate} duplicate, ` +
            `${result.skippedMalformed} malformed${result.warnings.length > 0 ? `\nwarnings:\n  ${result.warnings.join('\n  ')}` : ''}\n`,
        );
        break;
      }

      case 'reprocess-article': {
        // Stub for Phase 2: classification/dedupe-fingerprint/clustering are
        // Phase 4/5 work (see task scope). An article, once ingested, has
        // nothing yet to "reprocess" beyond what `reprocess-fetch` already
        // does at insert time. This command exists as a documented
        // placeholder so the CLI's shape does not need to change again when
        // that pipeline is built.
        const [articleId] = args;
        if (!articleId) throw new Error('Usage: news reprocess-article <articleId>');
        process.stdout.write(
          `reprocess-article is a no-op in Phase 2 (article ${articleId}): ` +
            `classification/clustering do not exist yet.\n`,
        );
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

/** Reads a dot-path (e.g. "news.rss") out of the plain AppConfig object, mirroring what ConfigService.get infers from a typed key. */
function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

void main();
