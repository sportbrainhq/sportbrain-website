import { z } from 'zod';
import { questionCategorySchema } from './question';

/**
 * SportBrain Passport (Phase E) — the curated sports-knowledge identity
 * derived from quiz activity. Server-computed only, same rule as
 * `quiz-stats.ts`: the frontend renders these numbers, it never derives them.
 *
 * Every level/score here carries the `scoringVersion` that produced it
 * indirectly via `passportSummarySchema.scoringVersion` — a methodology
 * change ships as a new version rather than reinterpreting history.
 */

export const knowledgeLevelSchema = z.enum([
  'UNRATED',
  'NEWCOMER',
  'EXPLORER',
  'KNOWLEDGEABLE',
  'ADVANCED',
  'EXPERT',
]);
export type KnowledgeLevel = z.infer<typeof knowledgeLevelSchema>;

export const achievementCategorySchema = z.enum([
  'QUIZ',
  'KNOWLEDGE',
  'SPORT',
  'BREADTH',
  'STREAK',
  'MASTERY',
  'SPECIAL',
]);
export type AchievementCategory = z.infer<typeof achievementCategorySchema>;

export const achievementTierSchema = z.enum(['BRONZE', 'SILVER', 'GOLD', 'ELITE']);
export type AchievementTier = z.infer<typeof achievementTierSchema>;

export const achievementDefinitionSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  category: achievementCategorySchema,
  tier: achievementTierSchema.nullable(),
  iconKey: z.string(),
  isHidden: z.boolean(),
});
export type AchievementDefinitionDto = z.infer<typeof achievementDefinitionSchema>;

export const userAchievementSchema = z.object({
  /** `UserAchievement.id` — an opaque random primary key, safe to use as the public share token (Part 81). */
  userAchievementId: z.string(),
  achievement: achievementDefinitionSchema,
  earnedAt: z.string(),
});
export type UserAchievementDto = z.infer<typeof userAchievementSchema>;

/** Only present for measurable criteria types (question counts, sport counts) — score-based criteria omit progress (Part 28). */
export const achievementProgressSchema = z.object({
  achievement: achievementDefinitionSchema,
  current: z.number().nonnegative(),
  target: z.number().positive(),
});
export type AchievementProgressDto = z.infer<typeof achievementProgressSchema>;

export const achievementsResponseSchema = z.object({
  earned: z.array(userAchievementSchema),
  inProgress: z.array(achievementProgressSchema),
  locked: z.array(achievementDefinitionSchema),
});
export type AchievementsResponse = z.infer<typeof achievementsResponseSchema>;

export const passportSportKnowledgeSchema = z.object({
  sportId: z.string(),
  sportSlug: z.string(),
  sportName: z.string(),
  score: z.number().int().min(0).max(1000),
  level: knowledgeLevelSchema,
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  categoriesExplored: z.number().int().nonnegative(),
  hardExpertAccuracy: z.number().min(0).max(100).nullable(),
  strongestCategory: questionCategorySchema.nullable(),
});
export type PassportSportKnowledgeDto = z.infer<typeof passportSportKnowledgeSchema>;

export const categoryKnowledgeSchema = z.object({
  category: questionCategorySchema,
  score: z.number().int().min(0).max(1000),
  /** Null when sample is below the minimum required to assign a level (Part 18) — UI must show "more questions needed" instead. */
  level: knowledgeLevelSchema.nullable(),
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
});
export type CategoryKnowledgeDto = z.infer<typeof categoryKnowledgeSchema>;

export const passportSportDetailSchema = z.object({
  sport: passportSportKnowledgeSchema,
  quizzesCompleted: z.number().int().nonnegative(),
  categories: z.array(categoryKnowledgeSchema),
});
export type PassportSportDetailDto = z.infer<typeof passportSportDetailSchema>;

export const strengthAreaSchema = z.object({
  sportName: z.string(),
  category: questionCategorySchema,
  score: z.number().int().min(0).max(1000),
});
export type StrengthAreaDto = z.infer<typeof strengthAreaSchema>;

export const masterQuizSummarySchema = z.object({
  quizzesCompleted: z.number().int().nonnegative(),
  questionsAnswered: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  bestPercentage: z.number().min(0).max(100).nullable(),
  sportsCovered: z.number().int().nonnegative(),
});
export type MasterQuizSummaryDto = z.infer<typeof masterQuizSummarySchema>;

export const streakSummarySchema = z.object({
  currentWeeklyStreak: z.number().int().nonnegative(),
  longestWeeklyStreak: z.number().int().nonnegative(),
  currentDailyStreak: z.number().int().nonnegative(),
  longestDailyStreak: z.number().int().nonnegative(),
});
export type StreakSummaryDto = z.infer<typeof streakSummarySchema>;

/** Null when the account has not yet reached the minimum evidence for a level anywhere (Part 59: new-user empty state, not a "0" score). */
export const passportSummarySchema = z.object({
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  memberSince: z.string(),

  hasEstablishedPassport: z.boolean(),
  overallScore: z.number().int().min(0).max(1000).nullable(),
  overallLevel: knowledgeLevelSchema.nullable(),

  questionsAnswered: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100).nullable(),
  sportsExplored: z.number().int().nonnegative(),
  achievementCount: z.number().int().nonnegative(),

  topSports: z.array(passportSportKnowledgeSchema),
  strengths: z.array(strengthAreaSchema),
  areasToExplore: z.array(strengthAreaSchema),
  masterQuiz: masterQuizSummarySchema,
  streak: streakSummarySchema,
  recentAchievements: z.array(userAchievementSchema),

  scoringVersion: z.string(),
  lastCalculatedAt: z.string().nullable(),

  isPublic: z.boolean(),
  publicId: z.string().nullable(),
});
export type PassportSummary = z.infer<typeof passportSummarySchema>;

export const passportPrivacySettingsSchema = z.object({
  isPublic: z.boolean(),
  showAvatarPublicly: z.boolean(),
  showActivityPublicly: z.boolean(),
  showStreakPublicly: z.boolean(),
  showAchievementsPublicly: z.boolean(),
  allowSearchIndexing: z.boolean(),
  publicId: z.string().nullable(),
});
export type PassportPrivacySettings = z.infer<typeof passportPrivacySettingsSchema>;

export const updatePassportPrivacySchema = z.object({
  isPublic: z.boolean().optional(),
  showAvatarPublicly: z.boolean().optional(),
  showActivityPublicly: z.boolean().optional(),
  showStreakPublicly: z.boolean().optional(),
  showAchievementsPublicly: z.boolean().optional(),
  allowSearchIndexing: z.boolean().optional(),
});
export type UpdatePassportPrivacyRequest = z.infer<typeof updatePassportPrivacySchema>;

export const scoreSnapshotPointSchema = z.object({
  date: z.string(),
  overallScore: z.number().int().min(0).max(1000),
  overallLevel: knowledgeLevelSchema,
});
export type ScoreSnapshotPoint = z.infer<typeof scoreSnapshotPointSchema>;

export const passportProgressSchema = z.object({
  points: z.array(scoreSnapshotPointSchema),
  currentScore: z.number().int().min(0).max(1000).nullable(),
  scoreNDaysAgo: z.number().int().min(0).max(1000).nullable(),
  change: z.number().int().nullable(),
});
export type PassportProgress = z.infer<typeof passportProgressSchema>;

export const activityDaySchema = z.object({
  date: z.string(),
  quizzesCompleted: z.number().int().nonnegative(),
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
});
export type ActivityDayDto = z.infer<typeof activityDaySchema>;

export const passportActivitySchema = z.object({
  days: z.array(activityDaySchema),
});
export type PassportActivity = z.infer<typeof passportActivitySchema>;

export const passportMethodologySchema = z.object({
  scoringVersion: z.string(),
  considers: z.array(z.string()),
  doesNotMeasure: z.array(z.string()),
  levelDescriptions: z.record(knowledgeLevelSchema, z.string()),
});
export type PassportMethodology = z.infer<typeof passportMethodologySchema>;

/** One side (overall or sport) of a `PassportImpact` — omitted entirely by the caller when nothing meaningfully changed (Part 44: "do not force +0 display"). */
export const scoreImpactSchema = z.object({
  previousScore: z.number().int().min(0).max(1000).nullable(),
  currentScore: z.number().int().min(0).max(1000),
  delta: z.number().int(),
  previousLevel: knowledgeLevelSchema.nullable(),
  currentLevel: knowledgeLevelSchema,
  levelChanged: z.boolean(),
});
export type ScoreImpact = z.infer<typeof scoreImpactSchema>;

export const streakImpactSchema = z.object({
  currentWeeklyStreak: z.number().int().nonnegative(),
  streakChanged: z.boolean(),
});
export type StreakImpact = z.infer<typeof streakImpactSchema>;

export const passportImpactSchema = z.object({
  overall: scoreImpactSchema,
  sport: z
    .object({
      sportId: z.string(),
      sportName: z.string(),
    })
    .merge(scoreImpactSchema)
    .nullable(),
  newAchievements: z.array(userAchievementSchema),
  streak: streakImpactSchema,
});
export type PassportImpact = z.infer<typeof passportImpactSchema>;

/** Public passport (Part 48) — deliberately a distinct, narrower shape rather than a filtered `PassportSummary`, so a new private field can never leak by being added to the wrong schema. */
export const publicPassportSchema = z.object({
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  memberSince: z.string(),
  overallScore: z.number().int().min(0).max(1000).nullable(),
  overallLevel: knowledgeLevelSchema.nullable(),
  sports: z.array(passportSportKnowledgeSchema),
  questionsAnswered: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100).nullable(),
  achievementCount: z.number().int().nonnegative(),
  achievements: z.array(achievementDefinitionSchema).nullable(),
  currentWeeklyStreak: z.number().int().nullable(),
  allowSearchIndexing: z.boolean(),
});
export type PublicPassport = z.infer<typeof publicPassportSchema>;

export const scoringConfigSchema = z.object({
  scoringVersion: z.string(),
  difficultyWeights: z.record(z.string(), z.number()),
  volumeConfidenceCap: z.number(),
  levelThresholds: z.array(
    z.object({
      level: knowledgeLevelSchema,
      score: z.number(),
      minSample: z.number(),
      minCategoriesExplored: z.number().optional(),
      minHardExpertAnswered: z.number().optional(),
    }),
  ),
  demotionHysteresisPoints: z.number(),
});
export type ScoringConfigDto = z.infer<typeof scoringConfigSchema>;

export const adminAchievementDefinitionSchema = achievementDefinitionSchema.extend({
  criteriaType: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number().int(),
  earnedCount: z.number().int().nonnegative(),
});
export type AdminAchievementDefinitionDto = z.infer<typeof adminAchievementDefinitionSchema>;

export const adminAchievementsListSchema = z.object({
  achievements: z.array(adminAchievementDefinitionSchema),
});
export type AdminAchievementsList = z.infer<typeof adminAchievementsListSchema>;

export const setAchievementActiveRequestSchema = z.object({
  isActive: z.boolean(),
});
export type SetAchievementActiveRequest = z.infer<typeof setAchievementActiveRequestSchema>;

/** Public achievement-share data (Part 53-54, 81) — only returned when the earning user's Passport and achievements are both public. */
export const publicAchievementShareSchema = z.object({
  achievement: achievementDefinitionSchema,
  displayName: z.string(),
  earnedAt: z.string(),
});
export type PublicAchievementShare = z.infer<typeof publicAchievementShareSchema>;

export const recalculateBatchRequestSchema = z.object({
  userIds: z.array(z.string()).min(1).max(500),
});
export type RecalculateBatchRequest = z.infer<typeof recalculateBatchRequestSchema>;
