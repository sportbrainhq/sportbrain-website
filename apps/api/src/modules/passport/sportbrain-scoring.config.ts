import type { KnowledgeLevel } from '@sportbrain/contracts';

/**
 * SportBrain scoring configuration — SB_SCORE_V1.
 *
 * Deliberately a plain constants module rather than threaded through
 * `env.schema.ts`/`ConfigService` (Part 72): the scoring formula has ~15
 * interdependent knobs that must change together as one reviewed unit, and
 * env vars invite changing one in production without the others. A
 * methodology change ships as a new `SB_SCORE_V2` constant + a new version of
 * this file, never a silent edit here (Part 7).
 */
export const SB_SCORE_V1 = 'SB_SCORE_V1';

export const SCORE_MAX = 1000;

/** A correct EXPERT answer counts for nearly double a correct EASY answer as evidence of knowledge (Part 9). */
export const DIFFICULTY_WEIGHTS = {
  EASY: 1.0,
  MEDIUM: 1.2,
  HARD: 1.5,
  EXPERT: 1.8,
} as const;

/**
 * Volume confidence: `min(1, log(1+n) / log(1+cap))`. Diminishing returns —
 * doubling from 250 to 500 questions moves confidence far less than doubling
 * from 10 to 20 (Part 8). `cap` is the sample size beyond which additional
 * volume no longer meaningfully raises confidence.
 */
export const VOLUME_CONFIDENCE_CAP = 500;

/**
 * Repeat-question evidence weight (Part 63/13.62-63): a question's first
 * attempt is full evidence. A later repeat of a question already answered
 * *correctly* is treated as near-zero new evidence (prevents farming one
 * memorised question). A repeat after an earlier *incorrect* answer counts
 * for less than a fresh question too, since the user has since seen the
 * correct answer.
 */
export const REPEAT_WEIGHTS = {
  FIRST_ENCOUNTER: 1.0,
  REPEAT_AFTER_CORRECT: 0.05,
  REPEAT_AFTER_INCORRECT: 0.5,
};

/**
 * Breadth bonus: diminishing additive bonus (points, pre-scale) based on
 * distinct categories (sport score) / distinct sports (overall score)
 * explored, capped so breadth alone can never dominate demonstrated accuracy
 * (Part 10) — a specialist with one deep sport can still reach EXPERT.
 */
export const CATEGORY_BREADTH_BONUS_PER_CATEGORY = 0.02; // fraction of score, diminishing via sqrt
export const CATEGORY_BREADTH_BONUS_CAP = 0.12; // max +12% of weighted-accuracy score

export const SPORT_BREADTH_BONUS_PER_SPORT = 0.015;
export const SPORT_BREADTH_BONUS_CAP = 0.1;

/**
 * Level thresholds — BOTH `score` and `minSample` must be met (Part 11/13).
 * EXPERT additionally requires category breadth + hard/expert exposure so a
 * narrow high scorer can't reach it on volume-confidence alone.
 */
export interface LevelThreshold {
  level: KnowledgeLevel;
  score: number;
  minSample: number;
  minCategoriesExplored?: number;
  minHardExpertAnswered?: number;
}

export const LEVEL_THRESHOLDS: LevelThreshold[] = [
  {
    level: 'EXPERT',
    score: 860,
    minSample: 150,
    minCategoriesExplored: 3,
    minHardExpertAnswered: 10,
  },
  { level: 'ADVANCED', score: 730, minSample: 80 },
  { level: 'KNOWLEDGEABLE', score: 550, minSample: 40 },
  { level: 'EXPLORER', score: 350, minSample: 15 },
  { level: 'NEWCOMER', score: 1, minSample: 5 },
];

/**
 * Demotion hysteresis (Part 46): once a level is held, it is only lost if the
 * score falls at least this many points *below* that level's own promotion
 * threshold — not merely below it. Prevents a single weak quiz from flapping
 * a level back and forth across a boundary.
 */
export const DEMOTION_HYSTERESIS_POINTS = 20;

/** Minimum sample before a category gets *any* level (score still shown once >=1 question answered). Part 18. */
export const CATEGORY_LEVEL_MIN_SAMPLE = 15;

/** Snapshot cadence: at most one `SportBrainScoreSnapshot` row per user per calendar day (Part 40). */
export const SNAPSHOT_MAX_PER_DAY = 1;
