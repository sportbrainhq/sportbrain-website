import { Injectable } from '@nestjs/common';
import { and, eq, isNull, lte, or, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { newsArticles, newsFeedFetches, newsSources, sport } from '../../database/schema';
import type { newsSourceHealthStatusEnum } from '../../database/schema/news.schema';

export interface ArticleForClustering {
  id: string;
  headline: string;
  sportId: string | null;
  publishedAt: Date;
}

type HealthStatus = (typeof newsSourceHealthStatusEnum.enumValues)[number];

export interface DueSource {
  id: string;
  slug: string;
  name: string;
  feedUrl: string;
  etag: string | null;
  lastModified: string | null;
}

export interface FetchOutcomeSuccess {
  result: 'success';
  sourceId: string;
  httpStatus: number;
  etag: string | null;
  lastModified: string | null;
  contentHash: string;
  rawBody: string;
  unchanged: boolean;
}

export interface FetchOutcomeNotModified {
  result: 'not_modified';
  sourceId: string;
  etag: string | null;
  lastModified: string | null;
}

export interface FetchOutcomeFailure {
  result: 'failure';
  sourceId: string;
  httpStatus: number | null;
  errorMessage: string;
}

export type FetchOutcome = FetchOutcomeSuccess | FetchOutcomeNotModified | FetchOutcomeFailure;

/**
 * The only place holding SQL for the News Engine's write/worker side
 * (fetching, processing). Kept separate from `NewsRepository`, which is the
 * public read path (`processingStatus = 'published'` only): the worker
 * repository writes rows in every processing status and touches
 * `news_sources` health bookkeeping the public API never needs to see.
 */
@Injectable()
export class NewsWorkerRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Sources due for a fetch: active, and either never fetched or past their
   * configured interval. `defaultFetchIntervalSeconds` is compared against
   * `fetchIntervalSeconds` on each row (already NOT NULL with a default), so
   * this needs no fallback to the config default at query time.
   */
  async findDueSources(): Promise<DueSource[]> {
    const rows = await this.database.db
      .select({
        id: newsSources.id,
        slug: newsSources.slug,
        name: newsSources.name,
        feedUrl: newsSources.feedUrl,
        etag: newsSources.etag,
        lastModified: newsSources.lastModified,
      })
      .from(newsSources)
      .where(
        and(
          eq(newsSources.isActive, true),
          or(
            isNull(newsSources.lastFetchAt),
            lte(
              sql`${newsSources.lastFetchAt} + (${newsSources.fetchIntervalSeconds} * interval '1 second')`,
              sql`now()`,
            ),
          ),
        ),
      );

    return rows;
  }

  async findSourceById(id: string): Promise<DueSource | null> {
    const [row] = await this.database.db
      .select({
        id: newsSources.id,
        slug: newsSources.slug,
        name: newsSources.name,
        feedUrl: newsSources.feedUrl,
        etag: newsSources.etag,
        lastModified: newsSources.lastModified,
      })
      .from(newsSources)
      .where(eq(newsSources.id, id))
      .limit(1);
    return row ?? null;
  }

  async findSourceBySlug(slug: string): Promise<DueSource | null> {
    const [row] = await this.database.db
      .select({
        id: newsSources.id,
        slug: newsSources.slug,
        name: newsSources.name,
        feedUrl: newsSources.feedUrl,
        etag: newsSources.etag,
        lastModified: newsSources.lastModified,
      })
      .from(newsSources)
      .where(eq(newsSources.slug, slug))
      .limit(1);
    return row ?? null;
  }

  /** The content hash of the source's most recent fetch that actually received a body (200, not 304). */
  async findLatestContentHash(sourceId: string): Promise<string | null> {
    const [row] = await this.database.db
      .select({ contentHash: newsFeedFetches.contentHash })
      .from(newsFeedFetches)
      .where(
        and(
          eq(newsFeedFetches.sourceId, sourceId),
          sql`${newsFeedFetches.contentHash} IS NOT NULL`,
        ),
      )
      .orderBy(sql`${newsFeedFetches.fetchedAt} DESC`)
      .limit(1);
    return row?.contentHash ?? null;
  }

  /**
   * Persists one fetch attempt's outcome: the `news_feed_fetches` row plus
   * `news_sources` health bookkeeping, in one transaction. Called
   * unconditionally by the `news-fetch` worker regardless of whether the
   * BullMQ job that triggered it goes on to succeed or fail — this
   * persistence must not depend on that.
   *
   * Returns the inserted fetch row's id (`null` for the not-modified /
   * unchanged cases, since nothing new needs processing).
   */
  async recordFetchOutcome(
    outcome: FetchOutcome,
    autoDisableThreshold: number,
  ): Promise<string | null> {
    return this.database.db.transaction(async (tx) => {
      const now = new Date();

      if (outcome.result === 'success') {
        const [fetchRow] = await tx
          .insert(newsFeedFetches)
          .values({
            sourceId: outcome.sourceId,
            httpStatus: outcome.httpStatus,
            etag: outcome.etag,
            lastModified: outcome.lastModified,
            contentHash: outcome.contentHash,
            rawBody: outcome.rawBody,
            fetchedAt: now,
            // An unchanged-content fetch has nothing new to process; mark it
            // processed immediately rather than leaving it 'pending' forever
            // (nothing will ever enqueue a process job for it).
            processingStatus: outcome.unchanged ? 'processed' : 'pending',
          })
          .returning({ id: newsFeedFetches.id });

        await tx
          .update(newsSources)
          .set({
            lastFetchAt: now,
            lastSuccessAt: now,
            consecutiveFailures: 0,
            healthStatus: 'healthy',
            etag: outcome.etag,
            lastModified: outcome.lastModified,
            updatedAt: now,
          })
          .where(eq(newsSources.id, outcome.sourceId));

        return outcome.unchanged ? null : (fetchRow?.id ?? null);
      }

      if (outcome.result === 'not_modified') {
        await tx.insert(newsFeedFetches).values({
          sourceId: outcome.sourceId,
          httpStatus: 304,
          etag: outcome.etag,
          lastModified: outcome.lastModified,
          fetchedAt: now,
          processingStatus: 'processed',
        });

        await tx
          .update(newsSources)
          .set({
            lastFetchAt: now,
            lastSuccessAt: now,
            consecutiveFailures: 0,
            healthStatus: 'healthy',
            ...(outcome.etag ? { etag: outcome.etag } : {}),
            ...(outcome.lastModified ? { lastModified: outcome.lastModified } : {}),
            updatedAt: now,
          })
          .where(eq(newsSources.id, outcome.sourceId));

        return null;
      }

      // failure
      await tx.insert(newsFeedFetches).values({
        sourceId: outcome.sourceId,
        httpStatus: outcome.httpStatus,
        fetchedAt: now,
        processingStatus: 'failed',
        errorMessage: outcome.errorMessage,
      });

      const [source] = await tx
        .select({ consecutiveFailures: newsSources.consecutiveFailures })
        .from(newsSources)
        .where(eq(newsSources.id, outcome.sourceId))
        .limit(1);

      const consecutiveFailures = (source?.consecutiveFailures ?? 0) + 1;
      const healthStatus = healthStatusFor(consecutiveFailures, autoDisableThreshold);

      await tx
        .update(newsSources)
        .set({
          lastFetchAt: now,
          consecutiveFailures,
          healthStatus,
          updatedAt: now,
        })
        .where(eq(newsSources.id, outcome.sourceId));

      return null;
    });
  }

  async findFetchById(id: string): Promise<{
    id: string;
    sourceId: string;
    rawBody: string | null;
    processingStatus: string;
  } | null> {
    const [row] = await this.database.db
      .select({
        id: newsFeedFetches.id,
        sourceId: newsFeedFetches.sourceId,
        rawBody: newsFeedFetches.rawBody,
        processingStatus: newsFeedFetches.processingStatus,
      })
      .from(newsFeedFetches)
      .where(eq(newsFeedFetches.id, id))
      .limit(1);
    return row ?? null;
  }

  async markFetchProcessed(id: string): Promise<void> {
    await this.database.db
      .update(newsFeedFetches)
      .set({ processingStatus: 'processed', updatedAt: new Date() })
      .where(eq(newsFeedFetches.id, id));
  }

  async markFetchFailed(id: string, errorMessage: string): Promise<void> {
    await this.database.db
      .update(newsFeedFetches)
      .set({ processingStatus: 'failed', errorMessage, updatedAt: new Date() })
      .where(eq(newsFeedFetches.id, id));
  }

  /** Whether an article already exists for this (sourceId, canonicalUrlHash) — the idempotent-reprocessing check. */
  async findExistingArticle(
    sourceId: string,
    canonicalUrlHash: string,
  ): Promise<{ id: string } | null> {
    const [row] = await this.database.db
      .select({ id: newsArticles.id })
      .from(newsArticles)
      .where(
        and(
          eq(newsArticles.sourceId, sourceId),
          eq(newsArticles.canonicalUrlHash, canonicalUrlHash),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async insertArticle(values: {
    sourceId: string;
    externalId: string | null;
    guid: string | null;
    headline: string;
    summary: string | null;
    originalUrl: string;
    canonicalUrl: string;
    canonicalUrlHash: string;
    imageUrl: string | null;
    language: string;
    publishedAt: Date;
    rawMetadata: Record<string, unknown>;
  }): Promise<{ id: string }> {
    const [row] = await this.database.db
      .insert(newsArticles)
      .values({ ...values, processingStatus: 'ingested' })
      .returning({ id: newsArticles.id });
    if (!row) throw new Error('Insert of news_articles row returned no id');
    return row;
  }

  // --- Clustering / ranking (Phase 3.5) -----------------------------------
  //
  // These methods operate on `news_articles`, the same table this
  // repository already owns the write path for, so they live here rather
  // than duplicating a second `news_articles`-writing repository inside
  // `modules/news/clustering`. `ClusteringRepository` and `RankingRepository`
  // own the *new* Phase 3.5 tables/joins (`news_story_clusters`,
  // `news_story_cluster_articles`, and the entity-notability lookups)
  // instead.

  /** An article's clustering-relevant fields, for `ClusteringService.clusterAndPublish`. */
  async findArticleForClustering(id: string): Promise<ArticleForClustering | null> {
    const [row] = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        sportId: newsArticles.sportId,
        publishedAt: newsArticles.publishedAt,
      })
      .from(newsArticles)
      .where(eq(newsArticles.id, id))
      .limit(1);
    return row ?? null;
  }

  /** This article's classified topics (`rawMetadata.topics`), or `[]` if none. */
  async findArticleTopics(id: string): Promise<string[]> {
    const [row] = await this.database.db
      .select({ rawMetadata: newsArticles.rawMetadata })
      .from(newsArticles)
      .where(eq(newsArticles.id, id))
      .limit(1);

    const metadata = (row?.rawMetadata ?? {}) as { topics?: unknown };
    return Array.isArray(metadata.topics) ? (metadata.topics as string[]) : [];
  }

  async findImportanceScore(articleId: string): Promise<number> {
    const [row] = await this.database.db
      .select({ importanceScore: newsArticles.importanceScore })
      .from(newsArticles)
      .where(eq(newsArticles.id, articleId))
      .limit(1);
    return row ? Number(row.importanceScore) : 0;
  }

  async setArticleImportanceScore(articleId: string, importanceScore: number): Promise<void> {
    await this.database.db
      .update(newsArticles)
      .set({ importanceScore: importanceScore.toFixed(3), updatedAt: new Date() })
      .where(eq(newsArticles.id, articleId));
  }

  async markClustered(articleId: string): Promise<void> {
    await this.database.db
      .update(newsArticles)
      .set({ processingStatus: 'clustered', updatedAt: new Date() })
      .where(eq(newsArticles.id, articleId));
  }

  async markPublished(articleId: string): Promise<void> {
    await this.database.db
      .update(newsArticles)
      .set({ processingStatus: 'published', updatedAt: new Date() })
      .where(eq(newsArticles.id, articleId));
  }

  /**
   * Marks an article `rejected` with a reason recorded in `rawMetadata`, per
   * the "a processing failure must not silently disappear" requirement —
   * mirrors `ClassificationRepository.markNeedsReview`'s approach of
   * recording the reason on the row itself rather than only in a log line.
   */
  async markRejected(articleId: string, reason: string): Promise<void> {
    const [row] = await this.database.db
      .select({ rawMetadata: newsArticles.rawMetadata })
      .from(newsArticles)
      .where(eq(newsArticles.id, articleId))
      .limit(1);

    const existingMetadata = (row?.rawMetadata ?? {}) as Record<string, unknown>;

    await this.database.db
      .update(newsArticles)
      .set({
        processingStatus: 'rejected',
        rawMetadata: {
          ...existingMetadata,
          rejection: { reason, rejectedAt: new Date().toISOString() },
        },
        updatedAt: new Date(),
      })
      .where(eq(newsArticles.id, articleId));
  }

  async findSportSlugById(sportId: string): Promise<string | null> {
    const [row] = await this.database.db
      .select({ slug: sport.slug })
      .from(sport)
      .where(eq(sport.id, sportId))
      .limit(1);
    return row?.slug ?? null;
  }
}

/**
 * Health-status escalation thresholds.
 *
 * These exact numbers are this implementation's judgement call (the spec
 * left them unspecified): `healthy` through 2 consecutive failures (a single
 * blip — network hiccup, a feed briefly 500ing — is normal and not worth an
 * operator's attention); `degraded` from 3 failures (worth surfacing, not
 * yet urgent); `failing` from a point 60% of the way to the auto-disable
 * threshold (the feed has been down for a while and disablement is close);
 * `disabled` once `consecutiveFailures` reaches `NEWS_AUTO_DISABLE_FAILURE_THRESHOLD`.
 * The 60% mark is deliberately threshold-relative rather than a second fixed
 * constant, so a deployment that raises or lowers the auto-disable threshold
 * gets a proportionally-scaled "failing" warning zone for free.
 */
function healthStatusFor(consecutiveFailures: number, autoDisableThreshold: number): HealthStatus {
  if (consecutiveFailures >= autoDisableThreshold) return 'disabled';
  if (consecutiveFailures >= Math.ceil(autoDisableThreshold * 0.6)) return 'failing';
  if (consecutiveFailures >= 3) return 'degraded';
  return 'healthy';
}
