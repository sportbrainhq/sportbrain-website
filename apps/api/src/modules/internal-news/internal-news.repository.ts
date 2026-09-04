import { Injectable } from '@nestjs/common';
import { and, count, eq, gte, isNotNull, max, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { newsArticles, newsFeedFetches, newsSources } from '../../database/schema';

const ONE_HOUR_MS = 60 * 60 * 1_000;

export interface SourceCounts {
  active: number;
  healthy: number;
  degraded: number;
  failing: number;
  disabled: number;
}

export interface PipelineCounts {
  feedsFetchedLastHour: number;
  articlesCreatedLastHour: number;
  publishedTotal: number;
  rejectedTotal: number;
}

export interface SourceHealthRow {
  slug: string;
  name: string;
  healthStatus: string;
  isActive: boolean;
  lastFetchAt: Date | null;
  lastSuccessAt: Date | null;
  consecutiveFailures: number;
  priority: number;
  trustScore: string;
}

/**
 * Read-only aggregation queries backing `GET /internal/news/status` and
 * `GET /internal/news/sources`.
 *
 * Deliberately separate from `NewsWorkerRepository`/`NewsRepository`: those
 * serve the ingestion pipeline and the public read API respectively, and
 * this module's queries are a third, distinct concern (operational
 * aggregation) that happens to read the same tables. See the individual
 * method docs for what each figure can and cannot precisely represent given
 * the current schema — some of the spec's requested figures (raw items
 * received, duplicate count) are not persisted anywhere in Postgres and are
 * intentionally sourced from `MetricsService` in the service layer instead;
 * see `internal-news.service.ts`.
 */
@Injectable()
export class InternalNewsRepository {
  constructor(private readonly database: DatabaseService) {}

  async findSourceCounts(): Promise<SourceCounts> {
    const rows = await this.database.db
      .select({
        healthStatus: newsSources.healthStatus,
        isActive: newsSources.isActive,
        total: count(),
      })
      .from(newsSources)
      .groupBy(newsSources.healthStatus, newsSources.isActive);

    const result: SourceCounts = { active: 0, healthy: 0, degraded: 0, failing: 0, disabled: 0 };
    for (const row of rows) {
      const total = Number(row.total);
      if (row.isActive) result.active += total;
      if (row.healthStatus === 'healthy') result.healthy += total;
      else if (row.healthStatus === 'degraded') result.degraded += total;
      else if (row.healthStatus === 'failing') result.failing += total;
      else if (row.healthStatus === 'disabled') result.disabled += total;
    }
    return result;
  }

  /** Max `lastSuccessAt` across every source, or null if no source has ever succeeded. */
  async findLastSuccessfulFetchAt(): Promise<Date | null> {
    const [row] = await this.database.db
      .select({ value: max(newsSources.lastSuccessAt) })
      .from(newsSources);
    return row?.value ?? null;
  }

  /**
   * Count of `news_feed_fetches` rows fetched in the last hour, regardless of
   * outcome. This is the precise, schema-backed reading of "feeds fetched
   * last hour" — it counts fetch attempts (poll events), not RSS `<item>`
   * elements found inside them; the schema does not persist a per-fetch item
   * count, so "raw articles found" is approximated via
   * `articlesCreatedLastHour` below (documented there) rather than fabricated
   * here.
   */
  async countFeedsFetchedLastHour(): Promise<number> {
    const since = new Date(Date.now() - ONE_HOUR_MS);
    const [row] = await this.database.db
      .select({ total: count() })
      .from(newsFeedFetches)
      .where(gte(newsFeedFetches.fetchedAt, since));
    return Number(row?.total ?? 0);
  }

  /**
   * Count of `news_articles` rows created (by `createdAt`) in the last hour.
   * This is the practical, schema-backed proxy for both "raw articles found"
   * and "new unique articles" in the spec's status shape: `news_articles`
   * rows are only ever inserted for items that survived per-source dedupe
   * (`NewsProcessorService.findExistingArticle`), so this table has no
   * concept of "raw items seen before dedupe" to count separately. The
   * pre-dedupe item count and duplicate count are not persisted anywhere;
   * see `MetricsService`-backed figures in `internal-news.service.ts` for
   * those.
   */
  async countArticlesCreatedLastHour(): Promise<number> {
    const since = new Date(Date.now() - ONE_HOUR_MS);
    const [row] = await this.database.db
      .select({ total: count() })
      .from(newsArticles)
      .where(gte(newsArticles.createdAt, since));
    return Number(row?.total ?? 0);
  }

  async findPipelineCounts(): Promise<PipelineCounts> {
    const [feedsFetchedLastHour, articlesCreatedLastHour, statusRows] = await Promise.all([
      this.countFeedsFetchedLastHour(),
      this.countArticlesCreatedLastHour(),
      this.database.db
        .select({ processingStatus: newsArticles.processingStatus, total: count() })
        .from(newsArticles)
        .groupBy(newsArticles.processingStatus),
    ]);

    let publishedTotal = 0;
    let rejectedTotal = 0;
    for (const row of statusRows) {
      if (row.processingStatus === 'published') publishedTotal = Number(row.total);
      else if (row.processingStatus === 'rejected') rejectedTotal = Number(row.total);
    }

    return { feedsFetchedLastHour, articlesCreatedLastHour, publishedTotal, rejectedTotal };
  }

  /**
   * Count of articles left at `processingStatus = 'ingested'` that carry a
   * `rawMetadata.classificationReview` marker — i.e. articles
   * `ClassificationService.markNeedsReview` has visibly flagged for manual
   * review, as opposed to articles merely awaiting their first
   * classification pass. This is the DB-persisted half of "classification
   * failures"; see `internal-news.service.ts` for how it is combined with
   * the metrics-based `classification_failure_total` counter.
   */
  async countClassificationNeedsReview(): Promise<number> {
    const [row] = await this.database.db
      .select({ total: count() })
      .from(newsArticles)
      .where(
        and(
          eq(newsArticles.processingStatus, 'ingested'),
          isNotNull(sql`${newsArticles.rawMetadata} -> 'classificationReview'`),
        ),
      );
    return Number(row?.total ?? 0);
  }

  async findSourceHealth(): Promise<SourceHealthRow[]> {
    const rows = await this.database.db
      .select({
        slug: newsSources.slug,
        name: newsSources.name,
        healthStatus: newsSources.healthStatus,
        isActive: newsSources.isActive,
        lastFetchAt: newsSources.lastFetchAt,
        lastSuccessAt: newsSources.lastSuccessAt,
        consecutiveFailures: newsSources.consecutiveFailures,
        priority: newsSources.priority,
        trustScore: newsSources.trustScore,
      })
      .from(newsSources)
      .orderBy(newsSources.priority, newsSources.name);

    return rows;
  }
}
