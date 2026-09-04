/**
 * News Engine manual triggers.
 *
 * ```bash
 * pnpm --filter @sportbrain/api news fetch-source <slug>
 * pnpm --filter @sportbrain/api news fetch-due
 * pnpm --filter @sportbrain/api news reprocess-fetch <fetchId>
 * pnpm --filter @sportbrain/api news reprocess-article <articleId>
 * pnpm --filter @sportbrain/api news reclassify-all
 * pnpm --filter @sportbrain/api news cluster-and-publish <articleId>
 * pnpm --filter @sportbrain/api news reprocess-cluster <clusterId>
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
import { ClassificationRepository } from '../modules/news/classification/classification.repository';
import { ClassificationService } from '../modules/news/classification/classification.service';
import { EntityClassificationRepository } from '../modules/news/classification/entity-classification.repository';
import { EntityClassifier } from '../modules/news/classification/entity-classifier';
import { NoopLlmClassificationFallback } from '../modules/news/classification/llm-classification-fallback';
import { SportClassifier } from '../modules/news/classification/sport-classifier';
import { TopicClassifier } from '../modules/news/classification/topic-classifier';
import { ClusteringRepository } from '../modules/news/clustering/clustering.repository';
import { ClusteringService } from '../modules/news/clustering/clustering.service';
import { NewsFetcherService } from '../modules/news/news-fetcher.service';
import { NewsProcessorService } from '../modules/news/news-processor.service';
import { NewsWorkerRepository } from '../modules/news/news-worker.repository';
import { ImportanceScorer } from '../modules/news/ranking/importance-scorer';
import { RankingRepository } from '../modules/news/ranking/ranking.repository';
import { InMemoryCacheService } from '../infrastructure/cache/cache.service';

for (const candidate of [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')]) {
  if (existsSync(candidate)) loadDotenv({ path: candidate });
}

async function main(): Promise<void> {
  const [, , command, ...args] = process.argv;

  if (!command) {
    process.stderr.write(
      'Usage: news <fetch-source|fetch-due|reprocess-fetch|reprocess-article|reclassify-all|' +
        'cluster-and-publish|reprocess-cluster> [arg]\n',
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

  const classificationRepository = new ClassificationRepository(database);
  const entityClassificationRepository = new EntityClassificationRepository(database);
  const classificationService = new ClassificationService(
    classificationRepository,
    new SportClassifier(),
    new EntityClassifier(entityClassificationRepository),
    new TopicClassifier(),
    new NoopLlmClassificationFallback(),
    typedConfig,
  );
  const clusteringRepository = new ClusteringRepository(database);
  const rankingRepository = new RankingRepository(database);
  const importanceScorer = new ImportanceScorer(typedConfig);
  // A plain in-memory cache, not the shared app instance: this CLI is a
  // separate one-shot process (see the module doc comment above), so
  // there is no running API process's cache to invalidate here anyway.
  // `ClusteringService.clusterAndPublish`'s invalidation call is still
  // exercised (against this throwaway cache) so the CLI runs the same code
  // path as the queue worker rather than a special-cased variant of it.
  const cache = new InMemoryCacheService();
  const clusteringService = new ClusteringService(
    clusteringRepository,
    repository,
    rankingRepository,
    importanceScorer,
    cache,
    typedConfig,
  );

  const processor = new NewsProcessorService(repository, classificationService, clusteringService);

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
        // Real implementation of the Phase 2 stub: reclassifies one article
        // by id, regardless of its current processingStatus. Useful after a
        // sport-keyword-rules or entity-alias change to re-run a single
        // article without touching everything stuck at 'ingested'.
        const [articleId] = args;
        if (!articleId) throw new Error('Usage: news reprocess-article <articleId>');

        const outcome = await classificationService.classifyArticle(articleId);
        process.stdout.write(
          `article ${articleId}: ${outcome.status} sport=${outcome.sportSlug ?? 'null'} ` +
            `topics=[${outcome.topics.join(', ')}] entities=${outcome.entityMatchCount} ` +
            `confidence=${outcome.overallConfidence.toFixed(2)} (${outcome.reason})\n`,
        );
        break;
      }

      case 'reclassify-all': {
        // Batch-reclassifies every article stuck at processingStatus =
        // 'ingested', capped by NEWS_CLASSIFICATION_BATCH_LIMIT so a manual
        // run can never be unbounded.
        const outcomes = await classificationService.classifyAllIngested();
        const classified = outcomes.filter((o) => o.status === 'classified').length;
        const needsReview = outcomes.length - classified;

        process.stdout.write(
          `${outcomes.length} article(s) processed: ${classified} classified, ${needsReview} left for manual review\n`,
        );
        for (const outcome of outcomes) {
          process.stdout.write(
            `  ${outcome.articleId}: ${outcome.status} sport=${outcome.sportSlug ?? 'null'} ` +
              `topics=[${outcome.topics.join(', ')}] confidence=${outcome.overallConfidence.toFixed(2)}\n`,
          );
        }
        break;
      }

      case 'cluster-and-publish': {
        const [articleId] = args;
        if (!articleId) throw new Error('Usage: news cluster-and-publish <articleId>');

        const outcome = await clusteringService.clusterAndPublish(articleId);
        process.stdout.write(
          `article ${articleId}: ${outcome.status} cluster=${outcome.clusterId ?? 'null'} ` +
            `importance=${outcome.importanceScore.toFixed(2)} (${outcome.reason})\n`,
        );
        break;
      }

      case 'reprocess-cluster': {
        // Recomputes primary-article selection and importance scoring for an
        // existing cluster without re-running the find-or-create step. Useful
        // after tuning `NEWS_CLUSTERING_*`/`NEWS_RANKING_*` weights, so
        // existing clusters reflect the new weights without re-ingesting.
        const [clusterId] = args;
        if (!clusterId) throw new Error('Usage: news reprocess-cluster <clusterId>');

        await clusteringService.recomputeCluster(clusterId);
        process.stdout.write(`cluster ${clusterId}: recomputed\n`);
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
