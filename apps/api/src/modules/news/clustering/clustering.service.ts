import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import { CacheService } from '../../../infrastructure/cache/cache.service';
import { ImportanceScorer } from '../ranking/importance-scorer';
import { RankingRepository } from '../ranking/ranking.repository';
import { NewsWorkerRepository } from '../news-worker.repository';
import { ClusteringRepository } from './clustering.repository';
import { selectPrimaryArticle, type ArticleForPrimarySelection } from './primary-selection';
import { combinedSimilarity } from './similarity';

export interface ClusterAndPublishOutcome {
  articleId: string;
  status: 'published' | 'rejected';
  clusterId: string | null;
  importanceScore: number;
  reason: string;
}

/**
 * Orchestrates Phase 3.5 for one classified article: find-or-create its
 * story cluster, (re-)select the cluster's primary article, compute
 * importance for both the article and the cluster, and carry the article's
 * `processingStatus` from `classified` through `clustered` to `published`
 * (or `rejected`).
 *
 * PUBLISH RULE (the product decision this phase most needs reviewed):
 * every `classified` article that reaches this service auto-publishes
 * immediately after clustering + scoring, with **no additional human-review
 * gate** in v1. Rationale: Phase 1's public read API
 * (`NewsRepository.findPublished`) already restricts every field it returns
 * to what the source's licence terms allow (`display*Allowed`), so
 * "published" here means "safe and ready to show publicly", not
 * "editorially vetted" - there is no human-review step anywhere in this
 * pipeline to gate on, and inventing one (e.g. an importance-score floor
 * below which an article is silently held back) would hide legitimate,
 * low-importance-but-true articles (a lower-tier competition's result)
 * from readers for a reason no one asked for. The only rejection path kept
 * is a **defensive sanity check**, not a business/editorial gate: an
 * article reaching this service with an empty headline or with
 * `sportId` null (should not happen - only `classified` articles, which by
 * construction have a resolved `sportSlug`, ever reach here; see
 * `ClassificationService.classifyArticle`) is rejected with a recorded
 * reason rather than silently published with broken data, per the "a
 * processing failure must not silently disappear" requirement. This is a
 * v1 default and is expected to be revisited (e.g. an importance floor for
 * the "top stories" placement, or a manual-review queue) once there is an
 * actual editorial process to gate on.
 *
 * Idempotent/retry-safe: `findClusterForArticle` short-circuits clustering
 * if the article is already a member of a cluster, and primary
 * selection/importance scoring are pure recomputations safe to repeat.
 */
@Injectable()
export class ClusteringService {
  private readonly logger = new Logger(ClusteringService.name);

  constructor(
    private readonly clusteringRepository: ClusteringRepository,
    private readonly newsWorkerRepository: NewsWorkerRepository,
    private readonly rankingRepository: RankingRepository,
    private readonly importanceScorer: ImportanceScorer,
    private readonly cache: CacheService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async clusterAndPublish(articleId: string): Promise<ClusterAndPublishOutcome> {
    const article = await this.newsWorkerRepository.findArticleForClustering(articleId);
    if (!article) {
      throw new Error(`No news_articles row with id "${articleId}"`);
    }

    // Defensive sanity check only - see the publish-rule doc comment above.
    if (!article.headline || article.headline.trim().length === 0 || !article.sportId) {
      const reason = !article.sportId
        ? 'Article has no sportId at the clustering stage (should be unreachable for a classified article).'
        : 'Article has an empty headline.';

      await this.newsWorkerRepository.markRejected(articleId, reason);
      this.logger.warn(`Article "${articleId}" rejected during clustering: ${reason}`);

      return { articleId, status: 'rejected', clusterId: null, importanceScore: 0, reason };
    }

    const clusterId = await this.findOrCreateCluster({
      articleId,
      sportId: article.sportId,
      headline: article.headline,
      publishedAt: article.publishedAt,
    });

    await this.recomputePrimaryAndImportance(clusterId);

    // Re-read this article's own importance score, set by recomputePrimaryAndImportance.
    const importanceScore = await this.newsWorkerRepository.findImportanceScore(articleId);

    await this.newsWorkerRepository.markClustered(articleId);
    await this.newsWorkerRepository.markPublished(articleId);

    await this.invalidatePublicCache(article.sportId);

    this.logger.log(
      `Article "${articleId}" published (cluster "${clusterId}", importance ${importanceScore.toFixed(2)}).`,
    );

    return {
      articleId,
      status: 'published',
      clusterId,
      importanceScore,
      reason:
        'Clustered and scored; no additional publish gate in v1 (see ClusteringService doc comment).',
    };
  }

  /**
   * Recomputes primary-article selection and importance scoring for an
   * existing cluster id, without re-running the find-or-create step. Used
   * both by `clusterAndPublish` (right after attaching/creating) and by the
   * `reprocess-cluster` CLI command (after tuning scoring weights).
   */
  async recomputeCluster(clusterId: string): Promise<void> {
    await this.recomputePrimaryAndImportance(clusterId);
  }

  private async findOrCreateCluster(params: {
    articleId: string;
    sportId: string;
    headline: string;
    publishedAt: Date;
  }): Promise<string> {
    // Idempotency: if this article is already clustered (a retried run),
    // reuse that cluster rather than comparing against candidates again and
    // potentially attaching to a different one.
    const existingClusterId = await this.clusteringRepository.findClusterForArticle(
      params.articleId,
    );
    if (existingClusterId) return existingClusterId;

    const clusteringConfig = this.config.get('news.clustering', { infer: true });
    const timeWindowHours = clusteringConfig.timeWindowHours;

    const sinceLastUpdatedAt = new Date(
      params.publishedAt.getTime() - timeWindowHours * 60 * 60 * 1_000,
    );

    const candidates = await this.clusteringRepository.findCandidateClusters({
      sportId: params.sportId,
      sinceLastUpdatedAt,
      limit: clusteringConfig.candidateLimit,
    });

    const articleEntityIds = await this.clusteringRepository.findArticleEntityIds(params.articleId);

    let bestClusterId: string | null = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      if (!candidate.primaryArticleId) continue;

      const candidateEntityIds = await this.clusteringRepository.findArticleEntityIds(
        candidate.primaryArticleId,
      );

      const score = combinedSimilarity({
        headlineA: params.headline,
        headlineB: candidate.canonicalHeadline,
        entityIdsA: articleEntityIds,
        entityIdsB: candidateEntityIds,
        publishedAtA: params.publishedAt,
        publishedAtB: candidate.lastUpdatedAt,
        timeWindowHours,
        weights: {
          headlineWeight: clusteringConfig.headlineWeight,
          entityWeight: clusteringConfig.entityWeight,
          timeWeight: clusteringConfig.timeWeight,
        },
      });

      if (score > bestScore) {
        bestScore = score;
        bestClusterId = candidate.id;
      }
    }

    if (bestClusterId && bestScore >= clusteringConfig.similarityThreshold) {
      await this.clusteringRepository.attachArticleToCluster({
        clusterId: bestClusterId,
        articleId: params.articleId,
        similarityScore: bestScore,
      });
      return bestClusterId;
    }

    return this.clusteringRepository.createCluster({
      articleId: params.articleId,
      headline: params.headline,
    });
  }

  /**
   * Re-selects the cluster's primary article and recomputes importance for
   * every member article plus the cluster itself. Cluster importance =
   * the primary article's own importance score: the primary is, by
   * construction, the best single representative of the story (see
   * `selectPrimaryArticle`), so its score is a reasonable stand-in for "how
   * important is this story" without needing a second, separate formula -
   * and it keeps the number shown for a story consistent with the number
   * shown on the card actually displayed for it.
   */
  private async recomputePrimaryAndImportance(clusterId: string): Promise<void> {
    const members = await this.clusteringRepository.findClusterMemberArticles(clusterId);
    if (members.length === 0) return;

    const primaryCandidates: ArticleForPrimarySelection[] = members.map((member) => ({
      id: member.id,
      headline: member.headline,
      summary: member.summary,
      imageUrl: member.imageUrl,
      publishedAt: member.publishedAt,
      sourceId: member.sourceId,
      sourcePriority: member.sourcePriority,
      sourceTrustScore: member.sourceTrustScore,
    }));

    const primary = selectPrimaryArticle(primaryCandidates);

    await this.clusteringRepository.setPrimaryArticle({
      clusterId,
      primaryArticleId: primary.id,
      canonicalHeadline: primary.headline,
    });

    const sourceCount = members.length;
    const now = new Date();

    for (const member of members) {
      const topics = await this.newsWorkerRepository.findArticleTopics(member.id);
      const entityNotabilityScores = await this.rankingRepository.findLinkedEntityNotabilityScores(
        member.id,
      );

      const score = this.importanceScorer.compute({
        sourceTrustScore: member.sourceTrustScore,
        publishedAt: member.publishedAt,
        now,
        entityNotabilityScores,
        topics,
        clusterSourceCount: sourceCount,
      });

      await this.newsWorkerRepository.setArticleImportanceScore(member.id, score);
    }

    const primaryScore = await this.newsWorkerRepository.findImportanceScore(primary.id);
    await this.clusteringRepository.setClusterImportanceScore(clusterId, primaryScore);
  }

  /**
   * Scoped cache invalidation: clears the unfiltered "latest" keys and the
   * affected sport's keys only, matching `NewsService.cacheKey`'s scheme
   * (`news:latest:*`, `news:sport:{slug}:*`, plus the detail key for this
   * article). A full `deleteByPrefix('news:')` would also be correct but
   * would blow away every sport's cached list on every single publish,
   * which defeats the point of caching at all under any real ingestion
   * volume.
   */
  private async invalidatePublicCache(sportId: string): Promise<void> {
    const sportSlug = await this.newsWorkerRepository.findSportSlugById(sportId);

    await this.cache.deleteByPrefix('news:latest:');
    if (sportSlug) {
      await this.cache.deleteByPrefix(`news:sport:${sportSlug}:`);
    }
    // Non-latest/non-sport filter combinations (competition/team/player/topic/source
    // filters, and any cursor-paginated page) use the `news:query:*` key shape
    // and are intentionally left to expire on their own short TTL
    // (`news.cacheTtlSeconds`) rather than tracked and invalidated
    // individually here, which would require indexing every filter
    // combination a new article might match.
  }
}
