import { describe, expect, it } from 'vitest';
import { SportBrainScoringService, type ScoredAttemptQuestion } from './sportbrain-scoring.service';

const service = new SportBrainScoringService();

let questionIdCounter = 0;

function makeAnswers(
  count: number,
  opts: Partial<ScoredAttemptQuestion> & { correctFraction?: number } = {},
): ScoredAttemptQuestion[] {
  const { correctFraction = 1, ...overrides } = opts;
  const correctCount = Math.round(count * correctFraction);
  return Array.from({ length: count }, (_, i) => ({
    questionId: `q-${questionIdCounter++}`,
    sportId: 'sport-football',
    category: 'RULES',
    difficulty: 'MEDIUM' as const,
    isCorrect: i < correctCount,
    answeredAt: new Date(2026, 0, 1 + i),
    ...overrides,
  }));
}

describe('SportBrainScoringService', () => {
  describe('zero / insufficient sample', () => {
    it('returns zero score and UNRATED for no questions', () => {
      const result = service.computeSportScore('sport-1', []);
      expect(result.score).toBe(0);
      expect(result.level).toBe('UNRATED');
    });

    it('does not assign NEWCOMER below the minimum sample even at 100% accuracy', () => {
      const answers = makeAnswers(2, { correctFraction: 1 });
      const result = service.computeSportScore('sport-1', answers);
      expect(result.level).toBe('UNRATED');
    });

    it('requires minimum sample at every level boundary', () => {
      // 14 questions, perfect accuracy: score alone may clear EXPLORER's
      // threshold, but sample (14) is below EXPLORER's minSample (15).
      const answers = makeAnswers(14, { correctFraction: 1, difficulty: 'EXPERT' });
      const result = service.computeSportScore('sport-1', answers);
      expect(result.level).not.toBe('EXPLORER');
    });
  });

  describe('volume diminishing returns', () => {
    it('does not scale confidence linearly with question count', () => {
      const c20 = service.computeVolumeConfidence(20);
      const c100 = service.computeVolumeConfidence(100);
      const c500 = service.computeVolumeConfidence(500);
      const c5000 = service.computeVolumeConfidence(5000);

      // Monotonic increasing...
      expect(c100).toBeGreaterThan(c20);
      expect(c500).toBeGreaterThan(c100);
      // ...but far from linear: 5x the questions (20->100) gains much more
      // confidence than another 10x (500->5000, which is capped at 1).
      const gain20to100 = c100 - c20;
      const gain500to5000 = c5000 - c500;
      expect(gain20to100).toBeGreaterThan(gain500to5000 * 3);
      expect(c5000).toBeLessThanOrEqual(1);
    });

    it('a 9/10 perfect small sample does not outscore an 850/1000 large sample', () => {
      const small = service.computeSportScore('sport-1', makeAnswers(10, { correctFraction: 0.9 }));
      const large = service.computeSportScore(
        'sport-1',
        makeAnswers(1000, { correctFraction: 0.85 }),
      );
      expect(large.score).toBeGreaterThan(small.score);
    });
  });

  describe('difficulty weighting', () => {
    it('EXPERT correct answers score higher than EASY correct answers at equal accuracy/volume', () => {
      const easy = service.computeSportScore(
        'sport-1',
        makeAnswers(100, { correctFraction: 0.8, difficulty: 'EASY' }),
      );
      const expert = service.computeSportScore(
        'sport-1',
        makeAnswers(100, { correctFraction: 0.8, difficulty: 'EXPERT' }),
      );
      expect(expert.score).toBeGreaterThan(easy.score);
    });

    it('does not disproportionately punish a single incorrect EXPERT answer', () => {
      const allCorrect = service.computeSportScore(
        'sport-1',
        makeAnswers(100, { correctFraction: 1, difficulty: 'EXPERT' }),
      );
      const oneWrong = service.computeSportScore(
        'sport-1',
        makeAnswers(100, { correctFraction: 0.99, difficulty: 'EXPERT' }),
      );
      // One wrong answer out of 100 should cost single-digit points, not a cliff.
      expect(allCorrect.score - oneWrong.score).toBeLessThan(30);
    });
  });

  describe('breadth contribution', () => {
    it('rewards category breadth within a sport but caps the bonus', () => {
      const narrow = service.computeSportScore(
        'sport-1',
        makeAnswers(200, { correctFraction: 0.8, category: 'RULES' }),
      );
      const wideAnswers = [
        ...makeAnswers(50, { correctFraction: 0.8, category: 'RULES' }),
        ...makeAnswers(50, { correctFraction: 0.8, category: 'HISTORY' }),
        ...makeAnswers(50, { correctFraction: 0.8, category: 'PLAYERS' }),
        ...makeAnswers(50, { correctFraction: 0.8, category: 'TEAMS' }),
      ];
      const wide = service.computeSportScore('sport-1', wideAnswers);
      expect(wide.score).toBeGreaterThan(narrow.score);
    });

    it('does not let a specialist be blocked from EXPERT purely by narrowness, given enough categories for the threshold', () => {
      const answers = [
        ...makeAnswers(60, { correctFraction: 0.95, difficulty: 'EXPERT', category: 'RULES' }),
        ...makeAnswers(60, { correctFraction: 0.95, difficulty: 'EXPERT', category: 'HISTORY' }),
        ...makeAnswers(60, { correctFraction: 0.95, difficulty: 'EXPERT', category: 'PLAYERS' }),
      ];
      const result = service.computeSportScore('sport-1', answers);
      expect(result.level).toBe('EXPERT');
    });
  });

  describe('repeated questions', () => {
    it('a correctly-answered repeat contributes near-zero additional evidence', () => {
      const base = makeAnswers(50, { correctFraction: 1 });
      const withoutRepeats = service.computeDifficultyWeightedAccuracy(base);

      const repeatedCorrect: ScoredAttemptQuestion[] = [
        ...base,
        { ...base[0], answeredAt: new Date(2026, 1, 1) }, // same questionId, answered again correctly
      ];
      const withRepeat = service.computeDifficultyWeightedAccuracy(repeatedCorrect);

      // weightedTotal should barely grow (0.05 weight) vs adding a fresh question (1.0 weight)
      const freshAdd = service.computeDifficultyWeightedAccuracy([
        ...base,
        { ...base[0], questionId: 'brand-new', answeredAt: new Date(2026, 1, 1) },
      ]);
      const repeatGrowth = withRepeat.weightedTotal - withoutRepeats.weightedTotal;
      const freshGrowth = freshAdd.weightedTotal - withoutRepeats.weightedTotal;
      expect(repeatGrowth).toBeLessThan(freshGrowth * 0.2);
    });

    it('a repeat after an incorrect answer contributes reduced (not full, not zero) weight', () => {
      const first: ScoredAttemptQuestion = {
        questionId: 'q-x',
        sportId: 'sport-1',
        category: 'RULES',
        difficulty: 'MEDIUM',
        isCorrect: false,
        answeredAt: new Date(2026, 0, 1),
      };
      const retry: ScoredAttemptQuestion = {
        ...first,
        isCorrect: true,
        answeredAt: new Date(2026, 0, 5),
      };
      const result = service.computeDifficultyWeightedAccuracy([first, retry]);
      // total weight = 1.0 (first) + 0.5 (retry) = 1.5, not 2.0 and not 1.0
      expect(result.weightedTotal).toBeCloseTo(1.5 * 1.2, 5); // ×1.2 for MEDIUM difficulty weight
    });
  });

  describe('level promotion and demotion hysteresis', () => {
    it('promotes to a new level once threshold + sample are met', () => {
      const level = service.determineLevel({ score: 560, sampleSize: 50 });
      expect(level).toBe('KNOWLEDGEABLE');
    });

    it('does not demote when score drops just under the promotion threshold but stays within the hysteresis band', () => {
      // ADVANCED promotion threshold is 730; holding ADVANCED, score dips to 715 (>= 730-20=710) should NOT demote.
      const level = service.determineLevel({
        score: 715,
        sampleSize: 100,
        previousLevel: 'ADVANCED',
      });
      expect(level).toBe('ADVANCED');
    });

    it('demotes once score drops below the hysteresis band', () => {
      // 700 < 730-20=710, should demote below ADVANCED.
      const level = service.determineLevel({
        score: 700,
        sampleSize: 100,
        previousLevel: 'ADVANCED',
      });
      expect(level).not.toBe('ADVANCED');
    });

    it('still allows promotion past a held level when a higher threshold is newly met', () => {
      const level = service.determineLevel({
        score: 900,
        sampleSize: 200,
        previousLevel: 'ADVANCED',
        categoriesExplored: 5,
        hardExpertAnswered: 20,
      });
      expect(level).toBe('EXPERT');
    });
  });

  describe('determinism', () => {
    it('produces identical output for identical input across repeated calls', () => {
      const answers = [
        ...makeAnswers(30, { correctFraction: 0.9, difficulty: 'HARD', category: 'HISTORY' }),
        ...makeAnswers(30, { correctFraction: 0.7, difficulty: 'EASY', category: 'RULES' }),
      ];
      const first = service.computeSportScore('sport-1', answers);
      const second = service.computeSportScore('sport-1', answers);
      expect(first).toEqual(second);
    });
  });

  describe('overall score', () => {
    it('weights sport scores by their own volume confidence rather than averaging blindly', () => {
      const strongLowSample = service.computeSportScore(
        'sport-a',
        makeAnswers(10, { correctFraction: 1, sportId: 'sport-a' }),
      );
      const solidHighSample = service.computeSportScore(
        'sport-b',
        makeAnswers(400, { correctFraction: 0.8, sportId: 'sport-b' }),
      );
      const overall = service.computeOverallScore([strongLowSample, solidHighSample]);
      // Overall should sit closer to the high-sample sport's score than a naive average would.
      const naiveAverage = (strongLowSample.score + solidHighSample.score) / 2;
      expect(Math.abs(overall.score - solidHighSample.score)).toBeLessThan(
        Math.abs(naiveAverage - solidHighSample.score),
      );
    });

    it('returns UNRATED/0 with no sports played', () => {
      const overall = service.computeOverallScore([]);
      expect(overall.score).toBe(0);
      expect(overall.level).toBe('UNRATED');
      expect(overall.sportsExplored).toBe(0);
    });
  });

  describe('category score', () => {
    it('withholds a level below the minimum category sample', () => {
      const result = service.computeCategoryScore(
        'HISTORY',
        makeAnswers(7, { correctFraction: 1 }),
      );
      expect(result.level).toBeNull();
    });

    it('assigns a level once minimum category sample is met', () => {
      const result = service.computeCategoryScore(
        'HISTORY',
        makeAnswers(50, { correctFraction: 0.9, difficulty: 'HARD' }),
      );
      expect(result.level).not.toBeNull();
    });
  });
});
