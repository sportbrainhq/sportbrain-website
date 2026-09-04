import { Injectable } from '@nestjs/common';
import { MetricsService } from '../../infrastructure/metrics/metrics.service';
import { InternalNewsRepository, type SourceHealthRow } from './internal-news.repository';

export interface InternalNewsStatusResponse {
  timestamp: string;
  sources: {
    active: number;
    healthy: number;
    degraded: number;
    failing: number;
    disabled: number;
  };
  lastSuccessfulFetchAt: string | null;
  lastHour: {
    /** Count of `news_feed_fetches` rows fetched, i.e. poll attempts, not RSS items. */
    feedsFetched: number;
    /**
     * RSS/Atom items seen across all feed parses in the last hour, from the
     * `rss_items_received` counter (see `MetricsService`). This is a
     * process-lifetime-scoped, in-memory figure (not persisted), so it
     * under-reports after a restart; see the field's report note.
     */
    rawArticlesFound: number;
    /** `news_articles` rows created (survived per-source dedupe) in the last hour. DB-backed, precise. */
    newUniqueArticles: number;
    /** From the `articles_deduplicated` counter (in-memory, since last restart). See caveat above. */
    duplicates: number;
  };
  pipeline: {
    /** Total `news_articles` rows currently at `processingStatus = 'published'`. */
    published: number;
    /** Total `news_articles` rows currently at `processingStatus = 'rejected'`. */
    rejected: number;
    /**
     * Articles left at `ingested` with a `rawMetadata.classificationReview`
     * marker (DB-backed, precise, all-time), plus the in-memory
     * `classification_failure_total` counter (since last restart) for
     * comparison.
     */
    classificationFailures: {
      needsReviewInDb: number;
      counterSinceRestart: number;
    };
    /** From the `queue_failure_total` counter (in-memory, since last restart). */
    queueFailures: number;
  };
  metrics: ReturnType<MetricsService['getSnapshot']>;
}

export interface InternalNewsSourceStatus {
  slug: string;
  name: string;
  healthStatus: string;
  isActive: boolean;
  lastFetchAt: string | null;
  lastSuccessAt: string | null;
  consecutiveFailures: number;
  priority: number;
  trustScore: number;
}

/**
 * Metric names this service reads from `MetricsService.getSnapshot()`.
 * Kept as constants so the instrumentation call sites (rss-fetcher,
 * news-processor, classification, clustering, queue workers) and this
 * reader never drift apart silently.
 */
export const METRIC_NAMES = {
  RSS_FETCH_TOTAL: 'rss_fetch_total',
  RSS_FETCH_SUCCESS_TOTAL: 'rss_fetch_success_total',
  RSS_FETCH_FAILURE_TOTAL: 'rss_fetch_failure_total',
  RSS_FETCH_DURATION: 'rss_fetch_duration',
  RSS_ITEMS_RECEIVED: 'rss_items_received',
  ARTICLES_CREATED: 'articles_created',
  ARTICLES_DEDUPLICATED: 'articles_deduplicated',
  ARTICLES_PUBLISHED: 'articles_published',
  CLASSIFICATION_FAILURE_TOTAL: 'classification_failure_total',
  QUEUE_FAILURE_TOTAL: 'queue_failure_total',
  SOURCE_HEALTH: 'source_health',
} as const;

@Injectable()
export class InternalNewsService {
  constructor(
    private readonly repository: InternalNewsRepository,
    private readonly metrics: MetricsService,
  ) {}

  async getStatus(): Promise<InternalNewsStatusResponse> {
    const [sourceCounts, lastSuccessfulFetchAt, pipelineCounts, classificationNeedsReview] =
      await Promise.all([
        this.repository.findSourceCounts(),
        this.repository.findLastSuccessfulFetchAt(),
        this.repository.findPipelineCounts(),
        this.repository.countClassificationNeedsReview(),
      ]);

    const snapshot = this.metrics.getSnapshot();
    const sumCounter = (name: string): number =>
      snapshot.counters
        .filter((counter) => counter.name === name)
        .reduce((total, counter) => total + counter.value, 0);

    return {
      timestamp: new Date().toISOString(),
      sources: sourceCounts,
      lastSuccessfulFetchAt: lastSuccessfulFetchAt ? lastSuccessfulFetchAt.toISOString() : null,
      lastHour: {
        feedsFetched: pipelineCounts.feedsFetchedLastHour,
        rawArticlesFound: sumCounter(METRIC_NAMES.RSS_ITEMS_RECEIVED),
        newUniqueArticles: pipelineCounts.articlesCreatedLastHour,
        duplicates: sumCounter(METRIC_NAMES.ARTICLES_DEDUPLICATED),
      },
      pipeline: {
        published: pipelineCounts.publishedTotal,
        rejected: pipelineCounts.rejectedTotal,
        classificationFailures: {
          needsReviewInDb: classificationNeedsReview,
          counterSinceRestart: sumCounter(METRIC_NAMES.CLASSIFICATION_FAILURE_TOTAL),
        },
        queueFailures: sumCounter(METRIC_NAMES.QUEUE_FAILURE_TOTAL),
      },
      metrics: snapshot,
    };
  }

  async getSources(): Promise<InternalNewsSourceStatus[]> {
    const rows = await this.repository.findSourceHealth();
    return rows.map(toSourceStatus);
  }
}

function toSourceStatus(row: SourceHealthRow): InternalNewsSourceStatus {
  return {
    slug: row.slug,
    name: row.name,
    healthStatus: row.healthStatus,
    isActive: row.isActive,
    lastFetchAt: row.lastFetchAt ? row.lastFetchAt.toISOString() : null,
    lastSuccessAt: row.lastSuccessAt ? row.lastSuccessAt.toISOString() : null,
    consecutiveFailures: row.consecutiveFailures,
    priority: row.priority,
    trustScore: Number(row.trustScore),
  };
}
