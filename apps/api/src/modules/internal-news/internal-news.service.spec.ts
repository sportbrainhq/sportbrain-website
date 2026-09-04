import { describe, expect, it, vi } from 'vitest';
import type { MetricsService, MetricsSnapshot } from '../../infrastructure/metrics/metrics.service';
import { InternalNewsService, METRIC_NAMES } from './internal-news.service';
import type { InternalNewsRepository, SourceHealthRow } from './internal-news.repository';

function makeRepository(overrides: Partial<InternalNewsRepository> = {}): InternalNewsRepository {
  return {
    findSourceCounts: vi.fn(async () => ({
      active: 10,
      healthy: 8,
      degraded: 1,
      failing: 1,
      disabled: 0,
    })),
    findLastSuccessfulFetchAt: vi.fn(async () => new Date('2026-09-04T10:00:00Z')),
    findPipelineCounts: vi.fn(async () => ({
      feedsFetchedLastHour: 12,
      articlesCreatedLastHour: 34,
      publishedTotal: 500,
      rejectedTotal: 3,
    })),
    countClassificationNeedsReview: vi.fn(async () => 7),
    findSourceHealth: vi.fn(async () => []),
    ...overrides,
  } as unknown as InternalNewsRepository;
}

function makeMetrics(snapshot: MetricsSnapshot): MetricsService {
  return {
    incrementCounter: vi.fn(),
    observeHistogram: vi.fn(),
    setGauge: vi.fn(),
    getSnapshot: vi.fn(() => snapshot),
  } as unknown as MetricsService;
}

describe('InternalNewsService.getStatus', () => {
  it('combines repository aggregates with the metrics snapshot', async () => {
    const snapshot: MetricsSnapshot = {
      counters: [
        { name: METRIC_NAMES.RSS_ITEMS_RECEIVED, labels: { sourceId: 's1' }, value: 20 },
        { name: METRIC_NAMES.RSS_ITEMS_RECEIVED, labels: { sourceId: 's2' }, value: 15 },
        { name: METRIC_NAMES.ARTICLES_DEDUPLICATED, labels: {}, value: 9 },
        { name: METRIC_NAMES.CLASSIFICATION_FAILURE_TOTAL, labels: {}, value: 2 },
        { name: METRIC_NAMES.QUEUE_FAILURE_TOTAL, labels: {}, value: 1 },
      ],
      gauges: [],
      histograms: [],
    };

    const repository = makeRepository();
    const metrics = makeMetrics(snapshot);
    const service = new InternalNewsService(repository, metrics);

    const status = await service.getStatus();

    expect(status.sources).toEqual({
      active: 10,
      healthy: 8,
      degraded: 1,
      failing: 1,
      disabled: 0,
    });
    expect(status.lastSuccessfulFetchAt).toBe('2026-09-04T10:00:00.000Z');
    expect(status.lastHour).toEqual({
      feedsFetched: 12,
      rawArticlesFound: 35,
      newUniqueArticles: 34,
      duplicates: 9,
    });
    expect(status.pipeline.published).toBe(500);
    expect(status.pipeline.rejected).toBe(3);
    expect(status.pipeline.classificationFailures).toEqual({
      needsReviewInDb: 7,
      counterSinceRestart: 2,
    });
    expect(status.pipeline.queueFailures).toBe(1);
    expect(status.metrics).toBe(snapshot);
  });

  it('reports null lastSuccessfulFetchAt when no source has ever succeeded', async () => {
    const repository = makeRepository({
      findLastSuccessfulFetchAt: vi.fn(async () => null),
    });
    const metrics = makeMetrics({ counters: [], gauges: [], histograms: [] });
    const service = new InternalNewsService(repository, metrics);

    const status = await service.getStatus();

    expect(status.lastSuccessfulFetchAt).toBeNull();
  });

  it('defaults metric-derived counts to zero when no matching series exist', async () => {
    const repository = makeRepository();
    const metrics = makeMetrics({ counters: [], gauges: [], histograms: [] });
    const service = new InternalNewsService(repository, metrics);

    const status = await service.getStatus();

    expect(status.lastHour.rawArticlesFound).toBe(0);
    expect(status.lastHour.duplicates).toBe(0);
    expect(status.pipeline.classificationFailures.counterSinceRestart).toBe(0);
    expect(status.pipeline.queueFailures).toBe(0);
  });
});

describe('InternalNewsService.getSources', () => {
  it('maps source rows to the public shape, converting numeric fields', async () => {
    const row: SourceHealthRow = {
      slug: 'bbc-football',
      name: 'BBC Football',
      healthStatus: 'healthy',
      isActive: true,
      lastFetchAt: new Date('2026-09-04T09:00:00Z'),
      lastSuccessAt: new Date('2026-09-04T09:00:00Z'),
      consecutiveFailures: 0,
      priority: 10,
      trustScore: '0.750',
    };
    const repository = makeRepository({ findSourceHealth: vi.fn(async () => [row]) });
    const metrics = makeMetrics({ counters: [], gauges: [], histograms: [] });
    const service = new InternalNewsService(repository, metrics);

    const sources = await service.getSources();

    expect(sources).toEqual([
      {
        slug: 'bbc-football',
        name: 'BBC Football',
        healthStatus: 'healthy',
        isActive: true,
        lastFetchAt: '2026-09-04T09:00:00.000Z',
        lastSuccessAt: '2026-09-04T09:00:00.000Z',
        consecutiveFailures: 0,
        priority: 10,
        trustScore: 0.75,
      },
    ]);
  });

  it('handles a source that has never fetched successfully', async () => {
    const row: SourceHealthRow = {
      slug: 'new-source',
      name: 'New Source',
      healthStatus: 'healthy',
      isActive: true,
      lastFetchAt: null,
      lastSuccessAt: null,
      consecutiveFailures: 0,
      priority: 100,
      trustScore: '0.500',
    };
    const repository = makeRepository({ findSourceHealth: vi.fn(async () => [row]) });
    const metrics = makeMetrics({ counters: [], gauges: [], histograms: [] });
    const service = new InternalNewsService(repository, metrics);

    const [source] = await service.getSources();

    expect(source.lastFetchAt).toBeNull();
    expect(source.lastSuccessAt).toBeNull();
  });
});
