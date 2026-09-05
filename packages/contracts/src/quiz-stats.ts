import { z } from 'zod';
import { questionCategorySchema, questionDifficultySchema } from './question';

/**
 * Account quiz statistics (Part 49-52). Server-computed only — the frontend
 * never derives an aggregate itself (Part 49: "do not derive important
 * account metrics separately in frontend"), and every insight here states a
 * sample size alongside the number rather than a confident-sounding label
 * (Part 50: no "Expert at World Cup history" after two questions).
 */

export const lifetimeQuizStatsSchema = z.object({
  quizzesCompleted: z.number().int().nonnegative(),
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  incorrectAnswers: z.number().int().nonnegative(),
  overallAccuracy: z.number().min(0).max(100),
  bestPercentage: z.number().min(0).max(100).nullable(),
  averagePercentage: z.number().min(0).max(100).nullable(),
  lastQuizAt: z.string().nullable(),
  /** Days completing at least one quiz counts toward — see `quizStreakSchema` for the two headline numbers. */
  currentStreakDays: z.number().int().nonnegative(),
  longestStreakDays: z.number().int().nonnegative(),
});
export type LifetimeQuizStats = z.infer<typeof lifetimeQuizStatsSchema>;

export const sportQuizStatsSchema = z.object({
  sportId: z.string(),
  sportName: z.string(),
  quizzesCompleted: z.number().int().nonnegative(),
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  incorrectAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
  bestPercentage: z.number().min(0).max(100).nullable(),
});
export type SportQuizStats = z.infer<typeof sportQuizStatsSchema>;

/** Only returned for a category once `questionsAnswered` reaches the configured minimum sample size (Part 50). */
export const categoryQuizStatsSchema = z.object({
  category: questionCategorySchema,
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
});
export type CategoryQuizStats = z.infer<typeof categoryQuizStatsSchema>;

export const difficultyQuizStatsSchema = z.object({
  difficulty: questionDifficultySchema,
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100),
});
export type DifficultyQuizStats = z.infer<typeof difficultyQuizStatsSchema>;

export const recentQuizStatsSchema = z.object({
  last5QuizAccuracy: z.number().min(0).max(100).nullable(),
  last10QuizAccuracy: z.number().min(0).max(100).nullable(),
  last30DaysQuestions: z.number().int().nonnegative(),
  last30DaysAccuracy: z.number().min(0).max(100).nullable(),
});
export type RecentQuizStats = z.infer<typeof recentQuizStatsSchema>;

/**
 * The month-over-month comparison (Part 51). Every `vsPreviousMonth`-style
 * field is null when the previous month has no data — "only show
 * comparisons when sufficient data exists."
 */
export const monthlyQuizSummarySchema = z.object({
  questionsAnswered: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracy: z.number().min(0).max(100).nullable(),
  accuracyDeltaVsPreviousMonth: z.number().nullable(),
  mostPlayedSportId: z.string().nullable(),
  mostPlayedSportName: z.string().nullable(),
  /** Highest-accuracy category meeting the minimum sample size this month; null if none qualifies. */
  strongestCategory: questionCategorySchema.nullable(),
});
export type MonthlyQuizSummary = z.infer<typeof monthlyQuizSummarySchema>;
