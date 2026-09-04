import { Injectable, Logger } from '@nestjs/common';
import { ClassificationService } from './classification/classification.service';
import { resolveAdapter } from './lib/feed-adapter';
import { parseFeed } from './lib/feed-parser';
import { NewsWorkerRepository } from './news-worker.repository';

export interface ProcessFetchResult {
  inserted: number;
  skippedDuplicate: number;
  skippedMalformed: number;
  warnings: string[];
}

/**
 * Turns one `news_feed_fetches` row's raw body into `news_articles` rows.
 *
 * Idempotent by construction: every item's canonical URL hash is checked
 * against existing articles for the same source before insert (see
 * `NewsWorkerRepository.findExistingArticle`), so reprocessing the same
 * fetch (a re-run of the CLI, a retried job) never creates duplicates.
 *
 * One malformed item never fails the whole batch: per-item errors are
 * caught, logged and counted, and processing continues. Only a failure to
 * load the fetch row at all, or an XML parse failure so total that
 * `parseFeed` returns zero items, is treated as fetch-level failure by the
 * caller (`queue/news-process.processor.ts`).
 *
 * Phase 3 wiring decision: classification runs in the same job as ingestion,
 * immediately after each article is inserted, rather than as a separate
 * queue/step. A dedicated `news-classify` queue was considered and rejected
 * as unnecessary complexity for this phase — `news-process` already handles
 * items one at a time in a loop (see below), classification per article is
 * cheap (no external network call in this phase, since the LLM fallback is a
 * noop), and a third queue would add operational surface (another worker,
 * another BullMQ queue, another failure mode to monitor) for no benefit
 * until classification actually needs to scale independently of ingestion
 * (e.g. once a real LLM fallback makes some articles slow/expensive to
 * classify). Classification failures are caught per-article, exactly like
 * normalization failures above, so one bad article never fails the batch.
 */
@Injectable()
export class NewsProcessorService {
  private readonly logger = new Logger(NewsProcessorService.name);

  constructor(
    private readonly repository: NewsWorkerRepository,
    private readonly classificationService: ClassificationService,
  ) {}

  async processFetch(fetchId: string): Promise<ProcessFetchResult> {
    const fetch = await this.repository.findFetchById(fetchId);
    if (!fetch) {
      throw new Error(`No news_feed_fetches row with id "${fetchId}"`);
    }

    if (!fetch.rawBody) {
      const message = `Fetch "${fetchId}" has no rawBody to process`;
      this.logger.warn(message);
      await this.repository.markFetchFailed(fetchId, message);
      return { inserted: 0, skippedDuplicate: 0, skippedMalformed: 0, warnings: [message] };
    }

    const source = await this.repository.findSourceById(fetch.sourceId);
    if (!source) {
      const message = `Fetch "${fetchId}" references unknown source "${fetch.sourceId}"`;
      this.logger.error(message);
      await this.repository.markFetchFailed(fetchId, message);
      return { inserted: 0, skippedDuplicate: 0, skippedMalformed: 0, warnings: [message] };
    }

    const parsed = parseFeed(fetch.rawBody);
    const warnings = [...parsed.warnings];
    if (parsed.warnings.length > 0) {
      this.logger.warn(
        `Feed parse warnings for fetch "${fetchId}" (source "${source.slug}"): ${parsed.warnings.join('; ')}`,
      );
    }

    const adapter = resolveAdapter({ id: source.id, feedUrl: source.feedUrl });
    const fetchedAt = new Date();

    let inserted = 0;
    let skippedDuplicate = 0;
    let skippedMalformed = 0;

    for (const item of parsed.items) {
      try {
        const normalized = adapter.normalize(
          item,
          { id: source.id, feedUrl: source.feedUrl },
          fetchedAt,
        );

        const existing = await this.repository.findExistingArticle(
          source.id,
          normalized.canonicalUrlHash,
        );
        if (existing) {
          skippedDuplicate++;
          continue;
        }

        const insertedArticle = await this.repository.insertArticle({
          sourceId: source.id,
          externalId: normalized.externalId,
          guid: normalized.guid,
          headline: normalized.headline,
          summary: normalized.summary,
          originalUrl: normalized.originalUrl,
          canonicalUrl: normalized.canonicalUrl,
          canonicalUrlHash: normalized.canonicalUrlHash,
          imageUrl: normalized.imageUrl,
          language: normalized.language,
          publishedAt: normalized.publishedAt,
          rawMetadata: normalized.rawMetadata,
        });
        inserted++;

        // Classification failure never fails the batch, mirroring the
        // per-item resilience above: the article stays at 'ingested' (see
        // ClassificationService.markNeedsReview / the catch below), visibly
        // unclassified rather than silently lost, and a later CLI batch
        // reclassify or a retried job can pick it up.
        try {
          await this.classificationService.classifyArticle(insertedArticle.id);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          warnings.push(`Classification failed for article "${insertedArticle.id}": ${message}`);
          this.logger.warn(
            `Classification failed for article "${insertedArticle.id}" in fetch "${fetchId}": ${message}`,
          );
        }
      } catch (error) {
        skippedMalformed++;
        const message = error instanceof Error ? error.message : String(error);
        warnings.push(`Item failed to normalize/insert: ${message}`);
        this.logger.warn(`Skipped malformed item in fetch "${fetchId}": ${message}`);
      }
    }

    await this.repository.markFetchProcessed(fetchId);

    this.logger.log(
      `Processed fetch "${fetchId}" (source "${source.slug}"): ${inserted} inserted, ${skippedDuplicate} duplicate, ${skippedMalformed} malformed`,
    );

    return { inserted, skippedDuplicate, skippedMalformed, warnings };
  }
}
