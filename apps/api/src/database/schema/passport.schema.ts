import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { questionCategoryEnum } from './question.schema';
import { sport } from './sport.schema';
import { users } from './user.schema';

/**
 * SportBrain Passport (Phase E) — the derived sports-knowledge identity built
 * on top of the Question Bank / QuizAttempt data Phase C already owns.
 *
 * `quizAttemptQuestionV2` remains the single source of truth. Every table in
 * this file is a *cache*: reproducible from that source via
 * `SportBrainScoringService` + `PassportService.recalculateUserScore`, never
 * hand-edited, and always tagged with the `scoringVersion` that produced it
 * (`SB_SCORE_V1` today) so a future methodology change never silently
 * reinterprets a historical number.
 */

export const knowledgeLevelEnum = pgEnum('knowledge_level', [
  'UNRATED',
  'NEWCOMER',
  'EXPLORER',
  'KNOWLEDGEABLE',
  'ADVANCED',
  'EXPERT',
]);

export const achievementCategoryEnum = pgEnum('achievement_category', [
  'QUIZ',
  'KNOWLEDGE',
  'SPORT',
  'BREADTH',
  'STREAK',
  'MASTERY',
  'SPECIAL',
]);

export const achievementTierEnum = pgEnum('achievement_tier', [
  'BRONZE',
  'SILVER',
  'GOLD',
  'ELITE',
]);

export const streakTypeEnum = pgEnum('streak_type', ['DAILY_QUIZ', 'WEEKLY_SPORTBRAIN']);

/**
 * A definition is immutable once achievements have actually been earned
 * against it (Part 73): change `displayOrder`/`description`/`isActive`
 * freely, but treat `criteriaType`/`criteriaConfig` as append-only — ship a
 * new `code` rather than reinterpret an existing one's meaning.
 */
export const achievementDefinition = pgTable(
  'achievement_definition',
  {
    id: primaryId(),

    /** Stable machine name, e.g. `FIRST_WHISTLE`. Never reused for a different meaning. */
    code: text('code').notNull(),

    name: text('name').notNull(),
    description: text('description').notNull(),

    category: achievementCategoryEnum('category').notNull(),
    /** Null for achievements with no tiered progression (e.g. `FIRST_WHISTLE`). */
    tier: achievementTierEnum('tier'),

    iconKey: text('icon_key').notNull(),

    /**
     * One of a small closed set the `AchievementEvaluationService` switches
     * on: `QUESTIONS_ANSWERED_TOTAL`, `PERFECT_SCORE`, `SPORTS_EXPLORED_COUNT`,
     * `SPORT_LEVEL_REACHED`, `CATEGORY_LEVEL_REACHED`, `MASTER_QUIZ_SCORE`,
     * `HARD_EXPERT_CORRECT_COUNT`, `WEEKLY_STREAK_REACHED`. Kept as free text
     * rather than a pgEnum so a new criteria type never needs a migration.
     */
    criteriaType: text('criteria_type').notNull(),
    /** Shape depends on `criteriaType`, e.g. `{ threshold: 500 }` or `{ level: "ADVANCED", sportSlug: "football" }`. */
    criteriaConfig: jsonb('criteria_config').notNull().default({}),

    isActive: boolean('is_active').notNull().default(true),
    /** Hidden achievements never appear in the locked list pre-earn (Part 29) — only in EARNED once granted. */
    isHidden: boolean('is_hidden').notNull().default(false),
    displayOrder: integer('display_order').notNull().default(0),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('achievement_definition_code_idx').on(table.code),
    index('achievement_definition_active_idx').on(table.isActive, table.category),
  ],
);

export const userAchievement = pgTable(
  'user_achievement',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    achievementId: entityRef('achievement_id')
      .notNull()
      .references(() => achievementDefinition.id, { onDelete: 'cascade' }),

    earnedAt: timestamp('earned_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    /** What triggered the grant, e.g. `{ quizAttemptId, sportId }` — audit/debugging, never rendered directly. */
    triggerContext: jsonb('trigger_context'),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    /** Grant idempotency (Part 27): the same achievement can never be earned twice. */
    uniqueIndex('user_achievement_unique_idx').on(table.userId, table.achievementId),
    index('user_achievement_user_earned_idx').on(table.userId, table.earnedAt),
  ],
);

/**
 * Weekly is the primary streak SportBrainHQ surfaces (Part 32: a knowledge
 * product, not a daily habit app); daily is retained for the Stats page.
 * `currentPeriodStart` is the first day of the current qualifying period
 * (ISO week Monday, or the calendar day) so a repeat qualification within the
 * same period is a cheap comparison rather than a re-derivation.
 */
export const userStreak = pgTable(
  'user_streak',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    streakType: streakTypeEnum('streak_type').notNull(),

    currentCount: integer('current_count').notNull().default(0),
    longestCount: integer('longest_count').notNull().default(0),
    currentPeriodStart: date('current_period_start'),
    lastQualifiedAt: timestamp('last_qualified_at', { withTimezone: true }),

    updatedAt: timestamps.updatedAt,
  },
  (table) => [uniqueIndex('user_streak_unique_idx').on(table.userId, table.streakType)],
);

/**
 * Daily aggregate powering the activity calendar without re-scanning
 * `quizAttemptQuestionV2` on every Passport page load. `sportsPlayed` is the
 * distinct `sportId` list for that day (jsonb array), not a count, so the
 * detail tooltip can name them without a second query.
 */
export const userQuizActivityDaily = pgTable(
  'user_quiz_activity_daily',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: date('date').notNull(),

    quizzesCompleted: integer('quizzes_completed').notNull().default(0),
    questionsAnswered: integer('questions_answered').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    sportsPlayed: jsonb('sports_played').notNull().default([]),

    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    uniqueIndex('user_quiz_activity_daily_unique_idx').on(table.userId, table.date),
    index('user_quiz_activity_daily_user_idx').on(table.userId, table.date),
  ],
);

/**
 * One row per user — the Passport's cached headline state, and the only
 * table `PATCH /me/passport/privacy` writes to. `publicId` is a random
 * URL-safe token generated on first enabling public sharing, never derived
 * from `userId`/email (Part 47): leaking it exposes only what the privacy
 * flags allow, never an internal identifier.
 */
export const userSportBrainProfile = pgTable(
  'user_sportbrain_profile',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    overallScore: integer('overall_score').notNull().default(0),
    overallLevel: knowledgeLevelEnum('overall_level').notNull().default('UNRATED'),

    questionsAnswered: integer('questions_answered').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
    sportsExplored: integer('sports_explored').notNull().default(0),
    achievementCount: integer('achievement_count').notNull().default(0),

    currentWeeklyStreak: integer('current_weekly_streak').notNull().default(0),
    longestWeeklyStreak: integer('longest_weekly_streak').notNull().default(0),

    scoringVersion: text('scoring_version').notNull(),
    lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }),

    /** Random URL-safe token; null until the user first enables public sharing. */
    publicId: text('public_id'),
    isPublic: boolean('is_public').notNull().default(false),
    showAvatarPublicly: boolean('show_avatar_publicly').notNull().default(true),
    showActivityPublicly: boolean('show_activity_publicly').notNull().default(true),
    showStreakPublicly: boolean('show_streak_publicly').notNull().default(true),
    showAchievementsPublicly: boolean('show_achievements_publicly').notNull().default(true),
    /** Separate from `isPublic` (Part 80): a public-via-link passport defaults NOINDEX unless the user explicitly opts into search discoverability. */
    allowSearchIndexing: boolean('allow_search_indexing').notNull().default(false),

    updatedAt: timestamps.updatedAt,
  },
  (table) => [
    uniqueIndex('user_sportbrain_profile_user_idx').on(table.userId),
    uniqueIndex('user_sportbrain_profile_public_id_idx').on(table.publicId),
  ],
);

export const userSportKnowledge = pgTable(
  'user_sport_knowledge',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),

    score: integer('score').notNull().default(0),
    level: knowledgeLevelEnum('level').notNull().default('UNRATED'),

    questionsAnswered: integer('questions_answered').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),
    categoriesExplored: integer('categories_explored').notNull().default(0),

    hardExpertQuestions: integer('hard_expert_questions').notNull().default(0),
    hardExpertCorrect: integer('hard_expert_correct').notNull().default(0),
    hardExpertAccuracy: numeric('hard_expert_accuracy', { precision: 5, scale: 2 })
      .notNull()
      .default('0'),

    scoringVersion: text('scoring_version').notNull(),
    lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('user_sport_knowledge_unique_idx').on(table.userId, table.sportId),
    index('user_sport_knowledge_user_idx').on(table.userId, table.score),
  ],
);

export const userCategoryKnowledge = pgTable(
  'user_category_knowledge',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),
    category: questionCategoryEnum('category').notNull(),

    score: integer('score').notNull().default(0),
    /** Null until the minimum sample for this category is met (Part 18) — never a fabricated level from one lucky question. */
    level: knowledgeLevelEnum('level'),

    questionsAnswered: integer('questions_answered').notNull().default(0),
    correctAnswers: integer('correct_answers').notNull().default(0),
    accuracy: numeric('accuracy', { precision: 5, scale: 2 }).notNull().default('0'),

    scoringVersion: text('scoring_version').notNull(),
    lastCalculatedAt: timestamp('last_calculated_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('user_category_knowledge_unique_idx').on(
      table.userId,
      table.sportId,
      table.category,
    ),
  ],
);

/**
 * At most one row per user per calendar day (Part 40): `recalculateUserScore`
 * upserts today's row rather than inserting a new one on every quiz, so a
 * user playing ten quizzes in a day still produces one progression point.
 */
export const sportBrainScoreSnapshot = pgTable(
  'sportbrain_score_snapshot',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    overallScore: integer('overall_score').notNull(),
    overallLevel: knowledgeLevelEnum('overall_level').notNull(),
    /** `[{ sportId, score, level }]` — denormalised for cheap history rendering, not queried by SQL. */
    sportScores: jsonb('sport_scores').notNull().default([]),

    scoringVersion: text('scoring_version').notNull(),
    snapshotDate: date('snapshot_date').notNull(),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    uniqueIndex('sportbrain_score_snapshot_unique_idx').on(table.userId, table.snapshotDate),
    index('sportbrain_score_snapshot_version_idx').on(table.userId, table.scoringVersion),
  ],
);

export const achievementDefinitionRelations = relations(achievementDefinition, ({ many }) => ({
  userAchievements: many(userAchievement),
}));

export const userAchievementRelations = relations(userAchievement, ({ one }) => ({
  user: one(users, { fields: [userAchievement.userId], references: [users.id] }),
  achievement: one(achievementDefinition, {
    fields: [userAchievement.achievementId],
    references: [achievementDefinition.id],
  }),
}));

export const userSportKnowledgeRelations = relations(userSportKnowledge, ({ one }) => ({
  user: one(users, { fields: [userSportKnowledge.userId], references: [users.id] }),
  sport: one(sport, { fields: [userSportKnowledge.sportId], references: [sport.id] }),
}));

export const userCategoryKnowledgeRelations = relations(userCategoryKnowledge, ({ one }) => ({
  user: one(users, { fields: [userCategoryKnowledge.userId], references: [users.id] }),
  sport: one(sport, { fields: [userCategoryKnowledge.sportId], references: [sport.id] }),
}));
