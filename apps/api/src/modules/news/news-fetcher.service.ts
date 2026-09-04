import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config/configuration';
import { MetricsService } from '../../infrastructure/metrics/metrics.service';
import { fetchRssFeed } from './lib/rss-fetcher';
import { NewsWorkerRepository, type DueSource } from './news-worker.repository';

export type FetchSourceResult =
  | { outcome: 'processed'; fetchId: string }
  | { outcome: 'unchanged' }
  | { outcome: 'rejected'; reason: string }
  | { outcome: 'failed'; errorMessage: string };

/**
 * Business logic for fetching one source's feed and persisting the outcome.
 *
 * Sits between the BullMQ `news-fetch` worker and the fetcher/repository
 * primitives, so the worker itself stays a thin adapter over queue
 * mechanics (see `queue/news-fetch.processor.ts`), and the same logic is
 * reachable from the manual CLI trigger without going through a queue at
 * all.
 */
@Injectable()
export class NewsFetcherService {
  private readonly logger = new Logger(NewsFetcherService.name);

  constructor(
    private readonly repository: NewsWorkerRepository,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly metrics: MetricsService,
  ) {}

  async fetchSource(source: DueSource): Promise<FetchSourceResult> {
    const rssConfig = this.config.get('news.rss', { infer: true });
    const autoDisableThreshold = this.config.get('news.autoDisableFailureThreshold', {
      infer: true,
    });

    const previousContentHash = await this.repository.findLatestContentHash(source.id);

    const metricLabels = { sourceId: source.id, sourceSlug: source.slug };
    this.metrics.incrementCounter('rss_fetch_total', metricLabels);
    const startedAt = Date.now();

    const result = await fetchRssFeed({
      url: source.feedUrl,
      timeoutMs: rssConfig.timeoutMs,
      maxResponseBytes: rssConfig.maxResponseBytes,
      retryCount: rssConfig.retryCount,
      etag: source.etag,
      lastModified: source.lastModified,
      previousContentHash,
    });

    this.metrics.observeHistogram('rss_fetch_duration', Date.now() - startedAt, metricLabels);

    if (result.outcome === 'failed' || result.outcome === 'rejected') {
      this.metrics.incrementCounter('rss_fetch_failure_total', metricLabels);
    } else {
      this.metrics.incrementCounter('rss_fetch_success_total', metricLabels);
    }

    switch (result.outcome) {
      case 'rejected': {
        this.logger.warn(`Fetch rejected for source "${source.slug}": ${result.reason}`);
        await this.repository.recordFetchOutcome(
          { result: 'failure', sourceId: source.id, httpStatus: null, errorMessage: result.reason },
          autoDisableThreshold,
        );
        return { outcome: 'rejected', reason: result.reason };
      }

      case 'failed': {
        this.logger.warn(`Fetch failed for source "${source.slug}": ${result.errorMessage}`);
        await this.repository.recordFetchOutcome(
          {
            result: 'failure',
            sourceId: source.id,
            httpStatus: result.httpStatus,
            errorMessage: result.errorMessage,
          },
          autoDisableThreshold,
        );
        return { outcome: 'failed', errorMessage: result.errorMessage };
      }

      case 'not_modified': {
        this.logger.log(`Source "${source.slug}" returned 304 Not Modified`);
        await this.repository.recordFetchOutcome(
          {
            result: 'not_modified',
            sourceId: source.id,
            etag: result.etag,
            lastModified: result.lastModified,
          },
          autoDisableThreshold,
        );
        return { outcome: 'unchanged' };
      }

      case 'success': {
        const fetchId = await this.repository.recordFetchOutcome(
          {
            result: 'success',
            sourceId: source.id,
            httpStatus: result.httpStatus,
            etag: result.etag,
            lastModified: result.lastModified,
            contentHash: result.contentHash,
            rawBody: result.body,
            unchanged: result.unchanged,
          },
          autoDisableThreshold,
        );

        if (result.unchanged || !fetchId) {
          this.logger.log(
            `Source "${source.slug}" content unchanged (hash match), skipping reprocessing`,
          );
          return { outcome: 'unchanged' };
        }

        this.logger.log(`Fetched new content for source "${source.slug}" (fetch ${fetchId})`);
        return { outcome: 'processed', fetchId };
      }
    }
  }
}
