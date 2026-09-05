import { z } from 'zod';

/**
 * Accounts, and everything a signed-in reader owns.
 *
 * `safeUserSchema` is deliberately the only user shape any endpoint returns:
 * there is no "full user" schema crossing this boundary, because there is no
 * endpoint that should ever return a session id, a provider token, or any
 * other field a client must not see. If a future field belongs only in an
 * admin surface, it gets its own schema rather than widening this one.
 */

export const userRoleSchema = z.enum(['user', 'editor', 'admin']);
export type UserRole = z.infer<typeof userRoleSchema>;

/** What `/auth/me` and `/users/me` return. Never a session id, never a provider token. */
export const safeUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullable(),
  role: userRoleSchema,
  memberSince: z.string(),
});
export type SafeUser = z.infer<typeof safeUserSchema>;

export const updateUserRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(200).optional(),
  avatarUrl: z.string().trim().url().max(2_000).optional(),
});
export type UpdateUserRequest = z.infer<typeof updateUserRequestSchema>;

/** The aggregate stats block on `/profile` — the "SportBrain Snapshot". */
export const userSnapshotSchema = z.object({
  quizzesPlayed: z.number().int().nonnegative(),
  correctAnswers: z.number().int().nonnegative(),
  accuracyPercent: z.number().min(0).max(100),
  currentQuizStreak: z.number().int().nonnegative(),
  bestQuizScore: z.number().int().nonnegative().nullable(),
  sportsExplored: z.number().int().nonnegative(),
  savedItems: z.number().int().nonnegative(),
  following: z.number().int().nonnegative(),
});
export type UserSnapshot = z.infer<typeof userSnapshotSchema>;

// --- Preferences -----------------------------------------------------------

export const contentPrefTypeSchema = z.enum([
  'news',
  'explainers',
  'history',
  'stats',
  'quizzes',
  'stories',
]);
export type ContentPrefType = z.infer<typeof contentPrefTypeSchema>;

export const userPreferencesSchema = z.object({
  contentTypes: z.array(contentPrefTypeSchema),
  newsletterWeekly: z.boolean(),
  productUpdates: z.boolean(),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

export const updateUserPreferencesRequestSchema = userPreferencesSchema.partial();
export type UpdateUserPreferencesRequest = z.infer<typeof updateUserPreferencesRequestSchema>;

// --- Following ---------------------------------------------------------------

export const followEntityTypeSchema = z.enum(['sport', 'team', 'player', 'competition']);
export type FollowEntityType = z.infer<typeof followEntityTypeSchema>;

export const userFollowSchema = z.object({
  entityType: followEntityTypeSchema,
  entityId: z.string(),
  createdAt: z.string(),
});
export type UserFollow = z.infer<typeof userFollowSchema>;

// --- Saved content -----------------------------------------------------------

export const savedEntityTypeSchema = z.enum([
  'article',
  'explainer',
  'story',
  'player',
  'team',
  'competition',
]);
export type SavedEntityType = z.infer<typeof savedEntityTypeSchema>;

export const savedEntitySchema = z.object({
  entityType: savedEntityTypeSchema,
  entityId: z.string(),
  createdAt: z.string(),
});
export type SavedEntity = z.infer<typeof savedEntitySchema>;

// --- Quiz history --------------------------------------------------------------

/**
 * History of a completed quiz. Written by the (not-yet-built) quiz-taking
 * flow's grading step, never by the client directly — a submitted score is
 * never trusted, only answers are, and grading produces this row.
 */
export const quizAttemptSummarySchema = z.object({
  id: z.string(),
  quizId: z.string(),
  sportId: z.string(),
  score: z.number().int(),
  correctAnswers: z.number().int().nonnegative(),
  totalQuestions: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  durationSeconds: z.number().int().nonnegative().nullable(),
  completedAt: z.string(),
});
export type QuizAttemptSummary = z.infer<typeof quizAttemptSummarySchema>;

/**
 * Derived, non-authoritative knowledge level per sport. Thresholds live
 * server-side and are transparent, not certified — this is a reading of a
 * user's own quiz history, not a claim SportBrainHQ stands behind.
 */
export const sportKnowledgeLevelSchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
export type SportKnowledgeLevel = z.infer<typeof sportKnowledgeLevelSchema>;

export const sportKnowledgeSchema = z.object({
  sportId: z.string(),
  sportName: z.string(),
  quizzesPlayed: z.number().int().nonnegative(),
  accuracyPercent: z.number().min(0).max(100),
  level: sportKnowledgeLevelSchema,
});
export type SportKnowledge = z.infer<typeof sportKnowledgeSchema>;

// --- Activity -----------------------------------------------------------------

export const activityTypeSchema = z.enum(['quiz_completed', 'content_saved', 'entity_followed']);
export type ActivityType = z.infer<typeof activityTypeSchema>;

export const userActivitySchema = z.object({
  id: z.string(),
  activityType: activityTypeSchema,
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});
export type UserActivity = z.infer<typeof userActivitySchema>;
