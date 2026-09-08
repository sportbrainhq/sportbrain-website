import { Injectable } from '@nestjs/common';
import type { KnowledgeLevel } from '@sportbrain/contracts';
import {
  CATEGORY_BREADTH_BONUS_CAP,
  CATEGORY_BREADTH_BONUS_PER_CATEGORY,
  CATEGORY_LEVEL_MIN_SAMPLE,
  DEMOTION_HYSTERESIS_POINTS,
  DIFFICULTY_WEIGHTS,
  LEVEL_THRESHOLDS,
  SB_SCORE_V1,
  SCORE_MAX,
  SPORT_BREADTH_BONUS_CAP,
  SPORT_BREADTH_BONUS_PER_SPORT,
  VOLUME_CONFIDENCE_CAP,
} from './sportbrain-scoring.config';

export type QuestionDifficulty = keyof typeof DIFFICULTY_WEIGHTS;

/**
 * The minimal shape the scoring engine needs from a
 * `quizAttemptQuestionV2` row — deliberately narrow so any caller (real
 * repository row, test fixture) can supply it without depending on Drizzle
 * types.
 */
export interface ScoredAttemptQuestion {
  questionId: string;
  sportId: string;
  category: string;
  difficulty: QuestionDifficulty;
  isCorrect: boolean;
  answeredAt: Date;
}

export interface WeightedAccuracyResult {
  /** Sum of (difficulty weight × evidence weight) for correct answers. */
  weightedCorrect: number;
  /** Sum of (difficulty weight × evidence weight) across all answers — the denominator. */
  weightedTotal: number;
  /** `weightedCorrect / weightedTotal`, 0 when there is no evidence at all. */
  weightedAccuracy: number;
  /**
   * Evidence-weighted average difficulty weight actually attempted (e.g.
   * ~1.0 if everything was EASY, ~1.8 if everything was EXPERT). A ratio
   * like `weightedAccuracy` cancels difficulty out on its own — this is what
   * lets the score reward attempting (and clearing) harder questions rather
   * than only reward *accuracy on whatever difficulty was served* (Part 9).
   */
  averageDifficultyWeight: number;
  sampleSize: number;
}

export interface SportScoreResult {
  sportId: string;
  score: number;
  level: KnowledgeLevel;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  categoriesExplored: number;
  hardExpertQuestions: number;
  hardExpertCorrect: number;
  hardExpertAccuracy: number;
}

export interface CategoryScoreResult {
  category: string;
  score: number;
  level: KnowledgeLevel | null;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
}

export interface OverallScoreResult {
  score: number;
  level: KnowledgeLevel;
  sportsExplored: number;
}

/**
 * SportBrainScoringService — the single owner of every score calculation in
 * the product (Part 6). Every method here is a pure function of its inputs:
 * no DB access, no wall-clock dependence beyond what is explicitly passed in
 * as `answeredAt`, no randomness. Same input + `SB_SCORE_V1` always produces
 * the same output (Part 86).
 *
 * Callers (`PassportService`) are responsible for loading attempt-question
 * history and persisting the results into the cache tables — this service
 * only computes.
 */
@Injectable()
export class SportBrainScoringService {
  readonly scoringVersion = SB_SCORE_V1;

  /**
   * Evidence weight for one answer, given the full ordered (by `answeredAt`)
   * history of answers to that same `questionId` up to and including this
   * one (Part 62-63). The first time a question is ever answered it is full
   * evidence; a later repeat contributes less, and contributes almost
   * nothing if the user already answered it correctly once — otherwise a
   * user could farm score by replaying one memorised question.
   */
  private evidenceWeight(
    priorAnswersToSameQuestion: ScoredAttemptQuestion[],
    thisAnswerIndexWithinQuestion: number,
  ): number {
    if (thisAnswerIndexWithinQuestion === 0) return 1.0;
    const previous = priorAnswersToSameQuestion[thisAnswerIndexWithinQuestion - 1];
    return previous?.isCorrect ? 0.05 : 0.5;
  }

  /**
   * Volume confidence: `min(1, log(1+n) / log(1+cap))` (Part 8). Rapid
   * growth early, flattening after `cap` — 20 questions is meaningfully less
   * confident than 100, but 5,000 does not dominate everyone who has 500.
   */
  computeVolumeConfidence(sampleSize: number, cap: number = VOLUME_CONFIDENCE_CAP): number {
    if (sampleSize <= 0) return 0;
    const confidence = Math.log1p(sampleSize) / Math.log1p(cap);
    return Math.min(1, confidence);
  }

  /**
   * Difficulty- and repeat-weighted accuracy across a set of answers to
   * (assumed) a single sport/category/scope. Groups answers by `questionId`
   * and orders each group by `answeredAt` to compute the correct evidence
   * weight per Part 62-63, then weights each answer additionally by its
   * difficulty (Part 9).
   */
  computeDifficultyWeightedAccuracy(answers: ScoredAttemptQuestion[]): WeightedAccuracyResult {
    const byQuestion = new Map<string, ScoredAttemptQuestion[]>();
    for (const answer of answers) {
      const list = byQuestion.get(answer.questionId) ?? [];
      list.push(answer);
      byQuestion.set(answer.questionId, list);
    }

    let weightedCorrect = 0;
    let weightedTotal = 0;
    let evidenceWeightSum = 0;
    let evidenceWeightedDifficultySum = 0;

    for (const group of byQuestion.values()) {
      const ordered = [...group].sort((a, b) => a.answeredAt.getTime() - b.answeredAt.getTime());
      ordered.forEach((answer, index) => {
        const evidenceWeight = this.evidenceWeight(ordered, index);
        const difficultyWeight = DIFFICULTY_WEIGHTS[answer.difficulty] ?? 1.0;
        const weight = evidenceWeight * difficultyWeight;
        weightedTotal += weight;
        if (answer.isCorrect) weightedCorrect += weight;

        evidenceWeightSum += evidenceWeight;
        evidenceWeightedDifficultySum += evidenceWeight * difficultyWeight;
      });
    }

    return {
      weightedCorrect,
      weightedTotal,
      weightedAccuracy: weightedTotal > 0 ? weightedCorrect / weightedTotal : 0,
      averageDifficultyWeight:
        evidenceWeightSum > 0 ? evidenceWeightedDifficultySum / evidenceWeightSum : 1.0,
      sampleSize: answers.length,
    };
  }

  /**
   * Difficulty bonus (Part 9): a ratio like `weightedAccuracy` cancels
   * difficulty weight out on its own (correct/total scale together), so this
   * turns the evidence-weighted *average* difficulty attempted into a small
   * bounded multiplicative bonus — attempting and clearing harder questions
   * scores higher than the same accuracy on easy ones, without a single hard
   * miss being able to swing the score on its own (that risk lives in
   * `weightedAccuracy`'s denominator, which this bonus does not touch).
   * EASY-only play (avg weight 1.0) gets +0%; EXPERT-only play (avg weight
   * 1.8) gets the ~+16% cap.
   */
  private difficultyBonus(averageDifficultyWeight: number): number {
    const maxWeight = Math.max(...Object.values(DIFFICULTY_WEIGHTS));
    const normalized = Math.max(0, averageDifficultyWeight - 1.0) / (maxWeight - 1.0);
    return normalized * 0.16;
  }

  /**
   * Breadth bonus (Part 10): a diminishing (sqrt) additive percentage of the
   * base score, capped so breadth alone never dominates demonstrated
   * accuracy — a one-sport specialist can still reach EXPERT.
   */
  private breadthBonus(distinctUnits: number, perUnit: number, cap: number): number {
    if (distinctUnits <= 0) return 0;
    return Math.min(cap, perUnit * Math.sqrt(distinctUnits));
  }

  /**
   * Level assignment requires BOTH a score threshold and a minimum question
   * sample (Part 11/13); EXPERT additionally requires category breadth and
   * hard/expert exposure (Part 13). Thresholds are checked in descending
   * order so the highest level whose full requirements are met wins.
   *
   * When `previousLevel` is supplied, applies demotion hysteresis (Part 46):
   * a level already held is only lost once the score falls at least
   * `DEMOTION_HYSTERESIS_POINTS` below that level's own promotion threshold,
   * not merely below it — so a score bouncing near a boundary does not flap
   * the displayed level after every quiz.
   */
  determineLevel(params: {
    score: number;
    sampleSize: number;
    previousLevel?: KnowledgeLevel | null;
    categoriesExplored?: number;
    hardExpertAnswered?: number;
  }): KnowledgeLevel {
    const {
      score,
      sampleSize,
      previousLevel,
      categoriesExplored = 0,
      hardExpertAnswered = 0,
    } = params;

    const meetsThreshold = (t: (typeof LEVEL_THRESHOLDS)[number]): boolean => {
      if (sampleSize < t.minSample) return false;
      if (t.minCategoriesExplored && categoriesExplored < t.minCategoriesExplored) return false;
      if (t.minHardExpertAnswered && hardExpertAnswered < t.minHardExpertAnswered) return false;
      return score >= t.score;
    };

    // If the user already holds a level, check whether they still clear that
    // level's threshold minus the hysteresis band before considering demotion.
    if (previousLevel && previousLevel !== 'UNRATED') {
      const heldThreshold = LEVEL_THRESHOLDS.find((t) => t.level === previousLevel);
      if (heldThreshold) {
        const stillHolds =
          sampleSize >= heldThreshold.minSample &&
          (!heldThreshold.minCategoriesExplored ||
            categoriesExplored >= heldThreshold.minCategoriesExplored) &&
          (!heldThreshold.minHardExpertAnswered ||
            hardExpertAnswered >= heldThreshold.minHardExpertAnswered) &&
          score >= heldThreshold.score - DEMOTION_HYSTERESIS_POINTS;

        if (stillHolds) {
          // Still allow *promotion* past the held level if a higher threshold is now met.
          const higher = LEVEL_THRESHOLDS.filter(
            (t) => this.levelRank(t.level) > this.levelRank(previousLevel),
          );
          const promoted = higher.find(meetsThreshold);
          return promoted ? promoted.level : previousLevel;
        }
      }
    }

    const matched = LEVEL_THRESHOLDS.find(meetsThreshold);
    return matched ? matched.level : 'UNRATED';
  }

  private levelRank(level: KnowledgeLevel): number {
    const order: KnowledgeLevel[] = [
      'UNRATED',
      'NEWCOMER',
      'EXPLORER',
      'KNOWLEDGEABLE',
      'ADVANCED',
      'EXPERT',
    ];
    return order.indexOf(level);
  }

  /**
   * One sport's score (Part 14): difficulty+repeat-weighted accuracy scaled
   * to `SCORE_MAX`, volume-confidence-dampened (a high accuracy on very few
   * questions cannot reach the top of the scale), plus a capped category
   * breadth bonus.
   */
  computeSportScore(
    sportId: string,
    answers: ScoredAttemptQuestion[],
    previousLevel?: KnowledgeLevel | null,
  ): SportScoreResult {
    const weighted = this.computeDifficultyWeightedAccuracy(answers);
    const confidence = this.computeVolumeConfidence(weighted.sampleSize);
    const categories = new Set(answers.map((a) => a.category));
    const breadth = this.breadthBonus(
      categories.size,
      CATEGORY_BREADTH_BONUS_PER_CATEGORY,
      CATEGORY_BREADTH_BONUS_CAP,
    );

    const difficultyBonus = this.difficultyBonus(weighted.averageDifficultyWeight);
    const baseScore = weighted.weightedAccuracy * confidence;
    const score = Math.round(
      Math.min(1, baseScore * (1 + breadth) * (1 + difficultyBonus)) * SCORE_MAX,
    );

    const hardExpert = answers.filter((a) => a.difficulty === 'HARD' || a.difficulty === 'EXPERT');
    const hardExpertCorrect = hardExpert.filter((a) => a.isCorrect).length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    const level = this.determineLevel({
      score,
      sampleSize: answers.length,
      previousLevel,
      categoriesExplored: categories.size,
      hardExpertAnswered: hardExpert.length,
    });

    return {
      sportId,
      score,
      level,
      questionsAnswered: answers.length,
      correctAnswers,
      accuracy: answers.length > 0 ? round2((correctAnswers / answers.length) * 100) : 0,
      categoriesExplored: categories.size,
      hardExpertQuestions: hardExpert.length,
      hardExpertCorrect,
      hardExpertAccuracy:
        hardExpert.length > 0 ? round2((hardExpertCorrect / hardExpert.length) * 100) : 0,
    };
  }

  /**
   * One category's score within a sport (Part 16): same weighted-accuracy +
   * volume-confidence approach as a sport score, no breadth bonus (a
   * category is itself the breadth unit). Level is null until
   * `CATEGORY_LEVEL_MIN_SAMPLE` is met (Part 18) — never a level from a
   * handful of lucky answers.
   */
  computeCategoryScore(
    category: string,
    answers: ScoredAttemptQuestion[],
    previousLevel?: KnowledgeLevel | null,
  ): CategoryScoreResult {
    const weighted = this.computeDifficultyWeightedAccuracy(answers);
    const confidence = this.computeVolumeConfidence(weighted.sampleSize);
    const difficultyBonus = this.difficultyBonus(weighted.averageDifficultyWeight);
    const score = Math.round(
      Math.min(1, weighted.weightedAccuracy * confidence * (1 + difficultyBonus)) * SCORE_MAX,
    );
    const correctAnswers = answers.filter((a) => a.isCorrect).length;

    const level =
      answers.length >= CATEGORY_LEVEL_MIN_SAMPLE
        ? this.determineLevel({ score, sampleSize: answers.length, previousLevel })
        : null;

    return {
      category,
      score,
      level,
      questionsAnswered: answers.length,
      correctAnswers,
      accuracy: answers.length > 0 ? round2((correctAnswers / answers.length) * 100) : 0,
    };
  }

  /**
   * Overall SportBrain score (Part 6/14): per-sport scores combined
   * weighted by each sport's own volume confidence — so a strong sport
   * backed by little evidence pulls the overall average less than a strong
   * sport backed by substantial evidence — plus a capped cross-sport
   * breadth bonus. Master Quiz questions are not counted separately: they
   * already appear in `answers` as ordinary sport-tagged attempt-questions
   * (Part 21), so breadth and accuracy both already reflect Master Quiz
   * play without any double count.
   */
  computeOverallScore(
    sportScores: SportScoreResult[],
    previousLevel?: KnowledgeLevel | null,
  ): OverallScoreResult {
    const withEvidence = sportScores.filter((s) => s.questionsAnswered > 0);
    if (withEvidence.length === 0) {
      return { score: 0, level: 'UNRATED', sportsExplored: 0 };
    }

    let weightedSum = 0;
    let weightTotal = 0;
    for (const sport of withEvidence) {
      const confidence = this.computeVolumeConfidence(sport.questionsAnswered);
      weightedSum += sport.score * confidence;
      weightTotal += confidence;
    }
    const base = weightTotal > 0 ? weightedSum / weightTotal : 0;

    const breadth = this.breadthBonus(
      withEvidence.length,
      SPORT_BREADTH_BONUS_PER_SPORT,
      SPORT_BREADTH_BONUS_CAP,
    );
    const score = Math.round(Math.min(SCORE_MAX, base * (1 + breadth)));

    const totalQuestions = withEvidence.reduce((sum, s) => sum + s.questionsAnswered, 0);
    const totalHardExpert = withEvidence.reduce((sum, s) => sum + s.hardExpertQuestions, 0);
    const maxCategories = Math.max(...withEvidence.map((s) => s.categoriesExplored));

    const level = this.determineLevel({
      score,
      sampleSize: totalQuestions,
      previousLevel,
      categoriesExplored: maxCategories,
      hardExpertAnswered: totalHardExpert,
    });

    return { score, level, sportsExplored: withEvidence.length };
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
