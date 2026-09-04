import { Injectable, Logger } from '@nestjs/common';
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
 */
@Injectable()
export class NewsProcessorService {
  private readonly logger = new Logger(NewsProcessorService.name);

  constructor(private readonly repository: NewsWorkerRepository) {}

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

        await this.repository.insertArticle({
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
