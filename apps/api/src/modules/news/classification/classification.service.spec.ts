import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ClassificationService } from './classification.service';
import type { ClassificationRepository } from './classification.repository';
import type { EntityClassifier } from './entity-classifier';
import type { NoopLlmClassificationFallback } from './llm-classification-fallback';
import type { SportClassifier } from './sport-classifier';
import type { TopicClassifier } from './topic-classifier';

const baseArticle = {
  id: 'article-1',
  headline: 'Test headline',
  summary: 'Test summary',
  sourceId: 'source-1',
  defaultSportSlug: 'football',
  rawMetadata: {},
  processingStatus: 'ingested',
};

function makeService(options: {
  sportConfidence: number;
  sportSlug: string | null;
  entityMatches?: number;
  topics?: string[];
  threshold: number;
  fallbackAvailable?: boolean;
}) {
  const repository = {
    findArticleById: vi.fn().mockResolvedValue(baseArticle),
    findIngestedArticles: vi.fn().mockResolvedValue([baseArticle]),
    findSportIdBySlug: vi.fn().mockResolvedValue(options.sportSlug ? 'sport-id-1' : null),
    persistClassified: vi.fn().mockResolvedValue(undefined),
    markNeedsReview: vi.fn().mockResolvedValue(undefined),
  } as unknown as ClassificationRepository;

  const sportClassifier = {
    classify: vi.fn().mockReturnValue({
      sportSlug: options.sportSlug,
      confidence: options.sportConfidence,
      reason: 'test reason',
    }),
  } as unknown as SportClassifier;

  const entityMatches = Array.from({ length: options.entityMatches ?? 0 }, (_, i) => ({
    entityType: 'team' as const,
    entityId: `team-${i}`,
    name: `Team ${i}`,
    matchedText: `Team ${i}`,
    confidence: 0.8,
  }));

  const entityClassifier = {
    classify: vi.fn().mockResolvedValue({ matches: entityMatches }),
  } as unknown as EntityClassifier;

  const topicClassifier = {
    classify: vi.fn().mockReturnValue({
      topics: options.topics ?? [],
      confidence: (options.topics?.length ?? 0) > 0 ? 0.7 : 0,
      reason: 'test',
    }),
  } as unknown as TopicClassifier;

  const llmFallback = {
    classify: vi
      .fn()
      .mockResolvedValue(
        options.fallbackAvailable
          ? { available: true, sportSlug: 'football', topics: ['analysis'], confidence: 0.9 }
          : { available: false, unavailableReason: 'no fallback wired' },
      ),
  } as unknown as NoopLlmClassificationFallback;

  const config = {
    get: vi.fn().mockReturnValue(options.threshold),
  } as unknown as import('../../../config').TypedConfigService;

  const service = new ClassificationService(
    repository,
    sportClassifier,
    entityClassifier,
    topicClassifier,
    llmFallback,
    config,
  );

  return { service, repository, llmFallback };
}

describe('ClassificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks the article classified when overall confidence is above the threshold', async () => {
    const { service, repository } = makeService({
      sportSlug: 'football',
      sportConfidence: 0.9,
      entityMatches: 1,
      topics: ['transfer'],
      threshold: 0.6,
    });

    const outcome = await service.classifyArticle('article-1');

    expect(outcome.status).toBe('classified');
    expect(repository.persistClassified).toHaveBeenCalledTimes(1);
    expect(repository.markNeedsReview).not.toHaveBeenCalled();
  });

  it('leaves the article for manual review (ingested, noop fallback invoked) when confidence is below the threshold', async () => {
    const { service, repository, llmFallback } = makeService({
      sportSlug: 'football',
      sportConfidence: 0.3,
      entityMatches: 0,
      topics: [],
      threshold: 0.6,
    });

    const outcome = await service.classifyArticle('article-1');

    expect(outcome.status).toBe('needs_review');
    expect(llmFallback.classify).toHaveBeenCalledTimes(1);
    expect(repository.markNeedsReview).toHaveBeenCalledTimes(1);
    expect(repository.persistClassified).not.toHaveBeenCalled();
  });

  it('leaves the article for review when there is no sport match at all, even above a zero threshold', async () => {
    const { service, repository } = makeService({
      sportSlug: null,
      sportConfidence: 0,
      threshold: 0,
    });

    const outcome = await service.classifyArticle('article-1');

    expect(outcome.status).toBe('needs_review');
    expect(repository.markNeedsReview).toHaveBeenCalledTimes(1);
  });

  it('uses a real fallback result when the fallback reports itself available', async () => {
    const { service, repository } = makeService({
      sportSlug: 'football',
      sportConfidence: 0.2,
      threshold: 0.6,
      fallbackAvailable: true,
    });

    const outcome = await service.classifyArticle('article-1');

    expect(outcome.status).toBe('classified');
    expect(repository.persistClassified).toHaveBeenCalledTimes(1);
  });

  it('classifyAllIngested processes every article returned by the repository and reports a per-article outcome', async () => {
    const { service, repository } = makeService({
      sportSlug: 'football',
      sportConfidence: 0.9,
      entityMatches: 1,
      topics: ['transfer'],
      threshold: 0.6,
    });

    const outcomes = await service.classifyAllIngested();

    expect(repository.findIngestedArticles).toHaveBeenCalledTimes(1);
    expect(outcomes).toHaveLength(1);
    expect(outcomes[0]!.status).toBe('classified');
  });
});
