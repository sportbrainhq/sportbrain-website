import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import type { CacheService } from '../../../infrastructure/cache/cache.service';
import type { MetricsService } from '../../../infrastructure/metrics/metrics.service';
import type { ArticleForClustering, NewsWorkerRepository } from '../news-worker.repository';
import { ImportanceScorer } from '../ranking/importance-scorer';
import type { RankingRepository } from '../ranking/ranking.repository';
import { ClusteringService } from './clustering.service';
import type {
  CandidateCluster,
  ClusterMemberArticle,
  ClusteringRepository,
} from './clustering.repository';

const CLUSTERING_CONFIG: AppConfig['news']['clustering'] = {
  headlineWeight: 0.5,
  entityWeight: 0.3,
  timeWeight: 0.2,
  similarityThreshold: 0.5,
  timeWindowHours: 72,
  candidateLimit: 50,
};

const RANKING_CONFIG: AppConfig['news']['ranking'] = {
  sourceAuthorityWeight: 2.5,
  recencyWeight: 2.5,
  entityImportanceWeight: 2,
  topicImportanceWeight: 1,
  sourceCountWeight: 1.5,
  breakingBonus: 0.5,
  recencyHalfLifeHours: 18,
};

function fakeConfig(): ConfigService<AppConfig, true> {
  return {
    get: (key: string) => {
      if (key === 'news.clustering') return CLUSTERING_CONFIG;
      if (key === 'news.ranking') return RANKING_CONFIG;
      throw new Error(`fakeConfig: unexpected key "${key}"`);
    },
  } as unknown as ConfigService<AppConfig, true>;
}

interface Fixture {
  articles: Map<string, ArticleForClustering & { importanceScore: number; topics: string[] }>;
  clusters: Map<
    string,
    { id: string; canonicalHeadline: string; primaryArticleId: string | null; lastUpdatedAt: Date }
  >;
  memberships: Map<string, { articleId: string; similarityScore: number }[]>;
  sourceMeta: Map<string, { priority: number; trustScore: number }>;
  entityIds: Map<string, Set<string>>;
  nextClusterId: number;
}

function makeFixture(): Fixture {
  return {
    articles: new Map(),
    clusters: new Map(),
    memberships: new Map(),
    sourceMeta: new Map(),
    entityIds: new Map(),
    nextClusterId: 1,
  };
}

function addArticle(
  fixture: Fixture,
  article: ArticleForClustering & {
    sourceId: string;
    summary?: string | null;
    imageUrl?: string | null;
    entityIds?: string[];
  },
): void {
  fixture.articles.set(article.id, {
    ...article,
    importanceScore: 0,
    topics: [],
  });
  fixture.entityIds.set(article.id, new Set(article.entityIds ?? []));
  if (!fixture.sourceMeta.has(article.sourceId)) {
    fixture.sourceMeta.set(article.sourceId, { priority: 100, trustScore: 0.5 });
  }
}

function makeClusteringRepository(fixture: Fixture): ClusteringRepository {
  return {
    findCandidateClusters: vi.fn(async ({ sportId: _sportId }): Promise<CandidateCluster[]> => {
      return [...fixture.clusters.values()];
    }),
    findArticleEntityIds: vi.fn(async (articleId: string) => {
      return fixture.entityIds.get(articleId) ?? new Set<string>();
    }),
    isArticleInCluster: vi.fn(async (clusterId: string, articleId: string) => {
      return (fixture.memberships.get(clusterId) ?? []).some((m) => m.articleId === articleId);
    }),
    findClusterForArticle: vi.fn(async (articleId: string) => {
      for (const [clusterId, members] of fixture.memberships) {
        if (members.some((m) => m.articleId === articleId)) return clusterId;
      }
      return null;
    }),
    createCluster: vi.fn(
      async ({ articleId, headline }: { articleId: string; headline: string }) => {
        const id = `cluster-${fixture.nextClusterId++}`;
        fixture.clusters.set(id, {
          id,
          canonicalHeadline: headline,
          primaryArticleId: articleId,
          lastUpdatedAt: new Date(),
        });
        fixture.memberships.set(id, [{ articleId, similarityScore: 1 }]);
        return id;
      },
    ),
    attachArticleToCluster: vi.fn(
      async ({
        clusterId,
        articleId,
        similarityScore,
      }: {
        clusterId: string;
        articleId: string;
        similarityScore: number;
      }) => {
        const members = fixture.memberships.get(clusterId) ?? [];
        if (!members.some((m) => m.articleId === articleId)) {
          members.push({ articleId, similarityScore });
        }
        fixture.memberships.set(clusterId, members);
        const cluster = fixture.clusters.get(clusterId);
        if (cluster) cluster.lastUpdatedAt = new Date();
      },
    ),
    findClusterMemberArticles: vi.fn(async (clusterId: string): Promise<ClusterMemberArticle[]> => {
      const members = fixture.memberships.get(clusterId) ?? [];
      return members.map(({ articleId }) => {
        const article = fixture.articles.get(articleId)!;
        const meta = fixture.sourceMeta.get(article.sourceId)!;
        return {
          id: article.id,
          headline: article.headline,
          summary: article.summary ?? null,
          imageUrl: article.imageUrl ?? null,
          publishedAt: article.publishedAt,
          sourceId: article.sourceId,
          sourcePriority: meta.priority,
          sourceTrustScore: meta.trustScore,
        };
      });
    }),
    setPrimaryArticle: vi.fn(
      async ({
        clusterId,
        primaryArticleId,
        canonicalHeadline,
      }: {
        clusterId: string;
        primaryArticleId: string;
        canonicalHeadline: string;
      }) => {
        const cluster = fixture.clusters.get(clusterId);
        if (cluster) {
          cluster.primaryArticleId = primaryArticleId;
          cluster.canonicalHeadline = canonicalHeadline;
        }
      },
    ),
    setClusterImportanceScore: vi.fn(async () => {}),
    countClusterArticles: vi.fn(async (clusterId: string) => {
      return (fixture.memberships.get(clusterId) ?? []).length;
    }),
  } as unknown as ClusteringRepository;
}

function makeNewsWorkerRepository(fixture: Fixture): NewsWorkerRepository {
  return {
    findArticleForClustering: vi.fn(async (id: string): Promise<ArticleForClustering | null> => {
      const article = fixture.articles.get(id);
      if (!article) return null;
      return {
        id: article.id,
        headline: article.headline,
        sportId: article.sportId,
        publishedAt: article.publishedAt,
      };
    }),
    findArticleTopics: vi.fn(async (id: string) => fixture.articles.get(id)?.topics ?? []),
    findImportanceScore: vi.fn(
      async (id: string) => fixture.articles.get(id)?.importanceScore ?? 0,
    ),
    setArticleImportanceScore: vi.fn(async (id: string, score: number) => {
      const article = fixture.articles.get(id);
      if (article) article.importanceScore = score;
    }),
    markClustered: vi.fn(async () => {}),
    markPublished: vi.fn(async () => {}),
    markRejected: vi.fn(async () => {}),
    findSportSlugById: vi.fn(async () => 'football'),
  } as unknown as NewsWorkerRepository;
}

function makeRankingRepository(): RankingRepository {
  return {
    findLinkedEntityNotabilityScores: vi.fn(async () => []),
  } as unknown as RankingRepository;
}

function makeCache(): CacheService {
  return {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    deleteByPrefix: vi.fn(async () => {}),
    clear: vi.fn(),
    wrap: vi.fn(),
  } as unknown as CacheService;
}

function makeMetrics(): MetricsService {
  return {
    incrementCounter: vi.fn(),
    observeHistogram: vi.fn(),
    setGauge: vi.fn(),
    getSnapshot: vi.fn(() => ({ counters: [], gauges: [], histograms: [] })),
  } as unknown as MetricsService;
}

function buildService(fixture: Fixture) {
  const clusteringRepository = makeClusteringRepository(fixture);
  const newsWorkerRepository = makeNewsWorkerRepository(fixture);
  const rankingRepository = makeRankingRepository();
  const cache = makeCache();
  const metrics = makeMetrics();
  const config = fakeConfig();
  const importanceScorer = new ImportanceScorer(config);

  const service = new ClusteringService(
    clusteringRepository,
    newsWorkerRepository,
    rankingRepository,
    importanceScorer,
    cache,
    config,
    metrics,
  );

  return { service, clusteringRepository, newsWorkerRepository, cache };
}

describe('ClusteringService.clusterAndPublish', () => {
  it('creates a new cluster when no candidate clears the threshold', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: 'Arsenal complete signing of Player X',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
      entityIds: ['team-arsenal'],
    });

    const { service, clusteringRepository, newsWorkerRepository } = buildService(fixture);

    const outcome = await service.clusterAndPublish('article-1');

    expect(outcome.status).toBe('published');
    expect(clusteringRepository.createCluster).toHaveBeenCalledTimes(1);
    expect(clusteringRepository.attachArticleToCluster).not.toHaveBeenCalled();
    expect(newsWorkerRepository.markClustered).toHaveBeenCalledWith('article-1');
    expect(newsWorkerRepository.markPublished).toHaveBeenCalledWith('article-1');
  });

  it('joins an existing cluster when a candidate clears the threshold', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: 'Arsenal complete signing of Player X from Rivalton',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
      entityIds: ['team-arsenal', 'player-x'],
    });
    addArticle(fixture, {
      id: 'article-2',
      headline: 'Arsenal confirm Player X transfer from Rivalton',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:30:00Z'),
      sourceId: 'source-bbc',
      entityIds: ['team-arsenal', 'player-x'],
    });

    const { service, clusteringRepository } = buildService(fixture);

    await service.clusterAndPublish('article-1');
    const outcome = await service.clusterAndPublish('article-2');

    expect(outcome.status).toBe('published');
    expect(clusteringRepository.createCluster).toHaveBeenCalledTimes(1);
    expect(clusteringRepository.attachArticleToCluster).toHaveBeenCalledTimes(1);
    expect(outcome.clusterId).toBe('cluster-1');
  });

  it('is idempotent: re-running on an already-clustered article does not create a duplicate cluster or membership', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: 'Arsenal complete signing of Player X',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
      entityIds: ['team-arsenal'],
    });

    const { service, clusteringRepository } = buildService(fixture);

    const first = await service.clusterAndPublish('article-1');
    const second = await service.clusterAndPublish('article-1');

    expect(first.clusterId).toBe(second.clusterId);
    expect(clusteringRepository.createCluster).toHaveBeenCalledTimes(1);
    expect(fixture.memberships.get('cluster-1')).toHaveLength(1);
  });

  it('rejects an article with no sportId as a defensive sanity check', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: 'Some headline',
      sportId: null,
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
    });

    const { service, newsWorkerRepository, clusteringRepository } = buildService(fixture);

    const outcome = await service.clusterAndPublish('article-1');

    expect(outcome.status).toBe('rejected');
    expect(newsWorkerRepository.markRejected).toHaveBeenCalledWith(
      'article-1',
      expect.stringContaining('sportId'),
    );
    expect(clusteringRepository.createCluster).not.toHaveBeenCalled();
  });

  it('rejects an article with an empty headline', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: '   ',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
    });

    const { service, newsWorkerRepository } = buildService(fixture);
    const outcome = await service.clusterAndPublish('article-1');

    expect(outcome.status).toBe('rejected');
    expect(newsWorkerRepository.markRejected).toHaveBeenCalledWith(
      'article-1',
      expect.stringContaining('headline'),
    );
  });

  it('invalidates the public cache latest and sport-scoped keys on publish', async () => {
    const fixture = makeFixture();
    addArticle(fixture, {
      id: 'article-1',
      headline: 'Arsenal complete signing of Player X',
      sportId: 'sport-football',
      publishedAt: new Date('2026-01-01T12:00:00Z'),
      sourceId: 'source-espn',
    });

    const { service, cache } = buildService(fixture);
    await service.clusterAndPublish('article-1');

    expect(cache.deleteByPrefix).toHaveBeenCalledWith('news:latest:');
    expect(cache.deleteByPrefix).toHaveBeenCalledWith('news:sport:football:');
  });
});
