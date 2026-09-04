import { describe, expect, it } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../../config/configuration';
import { ImportanceScorer, type ImportanceScoringInput } from './importance-scorer';

const RANKING_WEIGHTS: AppConfig['news']['ranking'] = {
  sourceAuthorityWeight: 2.5,
  recencyWeight: 2.5,
  entityImportanceWeight: 2,
  topicImportanceWeight: 1,
  sourceCountWeight: 1.5,
  breakingBonus: 0.5,
  recencyHalfLifeHours: 18,
};

function fakeConfig(
  overrides: Partial<AppConfig['news']['ranking']> = {},
): ConfigService<AppConfig, true> {
  const ranking = { ...RANKING_WEIGHTS, ...overrides };
  return {
    get: (key: string) => {
      if (key === 'news.ranking') return ranking;
      throw new Error(`fakeConfig: unexpected key "${key}"`);
    },
  } as unknown as ConfigService<AppConfig, true>;
}

function baseInput(overrides: Partial<ImportanceScoringInput> = {}): ImportanceScoringInput {
  const now = new Date('2026-01-01T12:00:00Z');
  return {
    sourceTrustScore: 0.5,
    publishedAt: now,
    now,
    entityNotabilityScores: [],
    topics: [],
    clusterSourceCount: 1,
    ...overrides,
  };
}

describe('ImportanceScorer', () => {
  it('produces the full source-authority weight for a maximally trusted, brand-new article with no other signal', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const score = scorer.compute(baseInput({ sourceTrustScore: 1 }));
    // sourceAuthority = 1 * 2.5 = 2.5; recency at age 0 = full 2.5;
    // topicImportance = DEFAULT_TOPIC_IMPORTANCE (0.4, no topics) * weight 1 = 0.4; rest 0.
    expect(score).toBeCloseTo(5.4, 6);
  });

  it('recency decays by half at the configured half-life', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const now = new Date('2026-01-01T12:00:00Z');
    const publishedAt = new Date(now.getTime() - 18 * 60 * 60 * 1_000);
    const score = scorer.compute(baseInput({ sourceTrustScore: 0, now, publishedAt }));
    // recency = 0.5 * 2.5 = 1.25; default topic importance = 0.4; everything else 0.
    expect(score).toBeCloseTo(1.65, 6);
  });

  it('contributes ~0 recency far beyond the half-life and never goes negative', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const now = new Date('2026-01-01T12:00:00Z');
    const publishedAt = new Date(now.getTime() - 500 * 60 * 60 * 1_000);
    const score = scorer.compute(baseInput({ sourceTrustScore: 0, now, publishedAt }));
    expect(score).toBeGreaterThanOrEqual(0);
    // Only the default topic-importance contribution (0.4) should remain.
    expect(score).toBeCloseTo(0.4, 2);
  });

  it('scores higher entity notability higher, saturating at the configured cap', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const low = scorer.compute(baseInput({ sourceTrustScore: 0, entityNotabilityScores: [5] }));
    const high = scorer.compute(baseInput({ sourceTrustScore: 0, entityNotabilityScores: [100] }));
    expect(high).toBeGreaterThan(low);
    // Both a score of 40 and 100 should saturate to the same (full) contribution.
    const atCap = scorer.compute(baseInput({ sourceTrustScore: 0, entityNotabilityScores: [40] }));
    expect(high).toBeCloseTo(atCap, 6);
  });

  it('takes the highest notability among multiple linked entities, not an average', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const mixed = scorer.compute(
      baseInput({ sourceTrustScore: 0, entityNotabilityScores: [2, 40] }),
    );
    const highOnly = scorer.compute(
      baseInput({ sourceTrustScore: 0, entityNotabilityScores: [40] }),
    );
    expect(mixed).toBeCloseTo(highOnly, 6);
  });

  it('weighs topic importance by the highest-weighted topic present', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const rumourOnly = scorer.compute(baseInput({ sourceTrustScore: 0, topics: ['rumour'] }));
    const resultOnly = scorer.compute(baseInput({ sourceTrustScore: 0, topics: ['result'] }));
    const both = scorer.compute(baseInput({ sourceTrustScore: 0, topics: ['rumour', 'result'] }));
    expect(resultOnly).toBeGreaterThan(rumourOnly);
    expect(both).toBeCloseTo(resultOnly, 6);
  });

  it('adds the breaking bonus plus the topic-importance jump when "breaking" joins the topics', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    // "result" alone: topicImportance = 0.8. Adding "breaking" raises the
    // highest-weighted topic to 1.0 *and* adds the flat breaking bonus, so
    // the total delta is (1.0 - 0.8) * topicImportanceWeight + breakingBonus.
    const resultOnly = scorer.compute(baseInput({ sourceTrustScore: 0, topics: ['result'] }));
    const resultAndBreaking = scorer.compute(
      baseInput({ sourceTrustScore: 0, topics: ['result', 'breaking'] }),
    );
    const expectedDelta =
      (1.0 - 0.8) * RANKING_WEIGHTS.topicImportanceWeight + RANKING_WEIGHTS.breakingBonus;
    expect(resultAndBreaking - resultOnly).toBeCloseTo(expectedDelta, 6);
  });

  it('adds exactly the breaking bonus when "breaking" does not change the highest topic weight', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    // "breaking" alone is already the max-weight topic (1.0), so adding a
    // second breaking-tier topic isolates the flat bonus from any
    // topic-importance shift.
    const breakingOnly = scorer.compute(baseInput({ sourceTrustScore: 0, topics: ['breaking'] }));
    const breakingAndResult = scorer.compute(
      baseInput({ sourceTrustScore: 0, topics: ['breaking', 'result'] }),
    );
    expect(breakingAndResult).toBeCloseTo(breakingOnly, 6);
  });

  it('rewards more independent sources reporting the story, saturating at the configured count', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const oneSource = scorer.compute(baseInput({ sourceTrustScore: 0, clusterSourceCount: 1 }));
    const twoSources = scorer.compute(baseInput({ sourceTrustScore: 0, clusterSourceCount: 2 }));
    const fourSources = scorer.compute(baseInput({ sourceTrustScore: 0, clusterSourceCount: 4 }));
    const tenSources = scorer.compute(baseInput({ sourceTrustScore: 0, clusterSourceCount: 10 }));
    expect(twoSources).toBeGreaterThan(oneSource);
    expect(fourSources).toBeGreaterThan(twoSources);
    expect(tenSources).toBeCloseTo(fourSources, 6);
  });

  it('never exceeds 10 even with every factor maxed out', () => {
    const scorer = new ImportanceScorer(fakeConfig());
    const score = scorer.compute(
      baseInput({
        sourceTrustScore: 1,
        entityNotabilityScores: [1000],
        topics: ['breaking'],
        clusterSourceCount: 50,
      }),
    );
    expect(score).toBeLessThanOrEqual(10);
  });

  it('respects reconfigured weights', () => {
    const scorer = new ImportanceScorer(fakeConfig({ sourceAuthorityWeight: 5 }));
    const score = scorer.compute(
      baseInput({ sourceTrustScore: 1, publishedAt: new Date(0), now: new Date(0) }),
    );
    // sourceAuthority (reconfigured to 5) + full recency (2.5) + default topic importance (0.4).
    expect(score).toBeCloseTo(5 + RANKING_WEIGHTS.recencyWeight + 0.4, 6);
  });
});
