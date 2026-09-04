import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, ne } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import {
  newsArticleEntities,
  newsArticles,
  newsSources,
  newsStoryClusterArticles,
  newsStoryClusters,
} from '../../../database/schema';

export interface CandidateCluster {
  id: string;
  canonicalHeadline: string;
  primaryArticleId: string | null;
  lastUpdatedAt: Date;
}

export interface ClusterMemberArticle {
  id: string;
  headline: string;
  summary: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  sourceId: string;
  sourcePriority: number;
  sourceTrustScore: number;
}

/**
 * Write/read path for clustering. Separate from `ClassificationRepository`
 * and `NewsRepository` for the same reason those two are separate from each
 * other: this owns `news_story_clusters` / `news_story_cluster_articles`
 * writes and a different read slice of `news_articles` (any article moving
 * from `classified` onward), which neither of those repositories touches.
 */
@Injectable()
export class ClusteringRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Candidate existing clusters a newly classified article might belong to.
   *
   * Scoping, so this never scans every cluster ever created:
   *   - same `sportId` only (a cluster's sport is its primary article's
   *     sport; joined here) - cross-sport stories are not attempted in v1.
   *   - `lastUpdatedAt` within `timeWindowHours` of now - a cluster nobody
   *     has added to in days is not a plausible match for `timeProximity`
   *     anyway (see similarity.ts), so excluding it at the SQL level avoids
   *     fetching and scoring clusters that could not clear the threshold.
   *   - capped at `candidateLimit` most-recently-updated clusters within
   *     that window, so a single very active sport/day cannot make one
   *     article's clustering pass cost unboundedly many comparisons.
   */
  async findCandidateClusters(params: {
    sportId: string;
    sinceLastUpdatedAt: Date;
    limit: number;
  }): Promise<CandidateCluster[]> {
    const rows = await this.database.db
      .select({
        id: newsStoryClusters.id,
        canonicalHeadline: newsStoryClusters.canonicalHeadline,
        primaryArticleId: newsStoryClusters.primaryArticleId,
        lastUpdatedAt: newsStoryClusters.lastUpdatedAt,
      })
      .from(newsStoryClusters)
      .innerJoin(newsArticles, eq(newsArticles.id, newsStoryClusters.primaryArticleId))
      .where(
        and(
          eq(newsArticles.sportId, params.sportId),
          gte(newsStoryClusters.lastUpdatedAt, params.sinceLastUpdatedAt),
        ),
      )
      .orderBy(desc(newsStoryClusters.lastUpdatedAt))
      .limit(params.limit);

    return rows;
  }

  /**
   * An article's linked entity id set, excluding `entityType: 'sport'` (see
   * `entityOverlap`'s doc comment in `similarity.ts` for why sport links are
   * excluded rather than merely down-weighted: candidates are already
   * sport-scoped, so including them would inflate every comparison by a
   * near-constant amount).
   */
  async findArticleEntityIds(articleId: string): Promise<Set<string>> {
    const rows = await this.database.db
      .select({ entityId: newsArticleEntities.entityId })
      .from(newsArticleEntities)
      .where(
        and(
          eq(newsArticleEntities.articleId, articleId),
          ne(newsArticleEntities.entityType, 'sport'),
        ),
      );

    return new Set(rows.map((row) => row.entityId));
  }

  /** Whether `articleId` is already a member of `clusterId`. Used to make attaching idempotent. */
  async isArticleInCluster(clusterId: string, articleId: string): Promise<boolean> {
    const [row] = await this.database.db
      .select({ articleId: newsStoryClusterArticles.articleId })
      .from(newsStoryClusterArticles)
      .where(
        and(
          eq(newsStoryClusterArticles.clusterId, clusterId),
          eq(newsStoryClusterArticles.articleId, articleId),
        ),
      )
      .limit(1);
    return row !== undefined;
  }

  /** The cluster (if any) `articleId` already belongs to. Used to make `clusterAndPublish` idempotent on retry. */
  async findClusterForArticle(articleId: string): Promise<string | null> {
    const [row] = await this.database.db
      .select({ clusterId: newsStoryClusterArticles.clusterId })
      .from(newsStoryClusterArticles)
      .where(eq(newsStoryClusterArticles.articleId, articleId))
      .limit(1);
    return row?.clusterId ?? null;
  }

  /**
   * Creates a new cluster with `articleId` as its sole (and initially
   * primary) member. `similarityScore` is stored as 1.0: the cluster's own
   * first article trivially matches itself, per the spec's guidance for the
   * "no existing cluster clears the threshold" case.
   */
  async createCluster(params: { articleId: string; headline: string }): Promise<string> {
    return this.database.db.transaction(async (tx) => {
      const [cluster] = await tx
        .insert(newsStoryClusters)
        .values({
          canonicalHeadline: params.headline,
          primaryArticleId: params.articleId,
        })
        .returning({ id: newsStoryClusters.id });

      if (!cluster) throw new Error('Insert of news_story_clusters row returned no id');

      await tx.insert(newsStoryClusterArticles).values({
        clusterId: cluster.id,
        articleId: params.articleId,
        similarityScore: '1.000',
      });

      return cluster.id;
    });
  }

  /**
   * Attaches `articleId` to an existing cluster and bumps `lastUpdatedAt`.
   * Idempotent: if the membership row already exists (a retried run), this
   * only refreshes `lastUpdatedAt` rather than inserting a duplicate, which
   * the composite primary key on `(clusterId, articleId)` would reject
   * anyway - this check avoids relying on that constraint throwing.
   */
  async attachArticleToCluster(params: {
    clusterId: string;
    articleId: string;
    similarityScore: number;
  }): Promise<void> {
    const alreadyMember = await this.isArticleInCluster(params.clusterId, params.articleId);

    await this.database.db.transaction(async (tx) => {
      if (!alreadyMember) {
        await tx.insert(newsStoryClusterArticles).values({
          clusterId: params.clusterId,
          articleId: params.articleId,
          similarityScore: params.similarityScore.toFixed(3),
        });
      }

      await tx
        .update(newsStoryClusters)
        .set({ lastUpdatedAt: new Date(), updatedAt: new Date() })
        .where(eq(newsStoryClusters.id, params.clusterId));
    });
  }

  /** Every article currently in a cluster, with the source fields primary-selection and ranking need. */
  async findClusterMemberArticles(clusterId: string): Promise<ClusterMemberArticle[]> {
    const rows = await this.database.db
      .select({
        id: newsArticles.id,
        headline: newsArticles.headline,
        summary: newsArticles.summary,
        imageUrl: newsArticles.imageUrl,
        publishedAt: newsArticles.publishedAt,
        sourceId: newsSources.id,
        sourcePriority: newsSources.priority,
        sourceTrustScore: newsSources.trustScore,
      })
      .from(newsStoryClusterArticles)
      .innerJoin(newsArticles, eq(newsArticles.id, newsStoryClusterArticles.articleId))
      .innerJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .where(eq(newsStoryClusterArticles.clusterId, clusterId));

    return rows.map((row) => ({ ...row, sourceTrustScore: Number(row.sourceTrustScore) }));
  }

  /** Updates a cluster's chosen primary article and canonical headline (taken from that primary). */
  async setPrimaryArticle(params: {
    clusterId: string;
    primaryArticleId: string;
    canonicalHeadline: string;
  }): Promise<void> {
    await this.database.db
      .update(newsStoryClusters)
      .set({
        primaryArticleId: params.primaryArticleId,
        canonicalHeadline: params.canonicalHeadline,
        updatedAt: new Date(),
      })
      .where(eq(newsStoryClusters.id, params.clusterId));
  }

  /** Updates a cluster's `importanceScore`. */
  async setClusterImportanceScore(clusterId: string, importanceScore: number): Promise<void> {
    await this.database.db
      .update(newsStoryClusters)
      .set({ importanceScore: importanceScore.toFixed(3), updatedAt: new Date() })
      .where(eq(newsStoryClusters.id, clusterId));
  }

  /** Number of distinct articles (i.e. independent sources) in a cluster, the "multiple publishers confirm" signal for ranking. */
  async countClusterArticles(clusterId: string): Promise<number> {
    const rows = await this.database.db
      .select({ articleId: newsStoryClusterArticles.articleId })
      .from(newsStoryClusterArticles)
      .where(eq(newsStoryClusterArticles.clusterId, clusterId));
    return rows.length;
  }
}
