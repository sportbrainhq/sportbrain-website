import { relations, sql } from 'drizzle-orm';
import {
  boolean,
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
import { question, questionCategoryEnum, questionDifficultyEnum } from './question.schema';
import { sport } from './sport.schema';
import { users } from './user.schema';

/**
 * The real quiz-taking model (Part 29-30), superseding the pre-Phase-C
 * `quiz_attempts`/`quiz`/`quiz_question` placeholder tables — those are left
 * in place rather than migrated, since nothing has ever written to them (see
 * `quiz-attempt.schema.ts`'s own header). Named with a `_v2` suffix
 * specifically to avoid colliding with that placeholder rather than out of
 * any real versioning scheme; a future cleanup migration can drop the old
 * tables and this suffix in the same pass.
 *
 * A `QuizAttempt` never owns question content — it is a session over
 * references to the canonical Question Bank (`question`), each one snapshot
 * into `quizAttemptQuestionV2` at the moment it's served, so an editorial
 * edit to a `question` row afterwards can never change a historical result
 * (Part 10).
 */

export const quizTypeEnum = pgEnum('quiz_type', ['SPORT', 'MASTER']);

/** SPORT modes and MASTER modes are different sets of literal values sharing one column; `QuizGenerationService` is the only place that knows which set applies to which `quizType`. */
export const quizModeEnum = pgEnum('quiz_mode', ['QUICK', 'STANDARD', 'CHALLENGE', 'MARATHON']);

export const quizAttemptStatusEnum = pgEnum('quiz_attempt_status', [
  'IN_PROGRESS',
  'COMPLETED',
  'ABANDONED',
  'EXPIRED',
]);

export const quizAttemptV2 = pgTable(
  'quiz_attempt_v2',
  {
    id: primaryId(),

    /**
     * Short, shareable/loggable identifier for the attempt — the route
     * `/quiz/attempt/:publicCode` uses this, never the UUID, for the same
     * "don't expose the internal id" reason `question.questionCode` exists.
     */
    publicCode: text('public_code').notNull(),

    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /**
     * Reserved for the anonymous-quiz flow (Part 40), not yet wired: Phase C3
     * ships the authenticated path only (`userId` is required at the
     * service layer even though the column allows it). Column present now
     * so the anonymous flow, when built, is a service-layer change and not
     * another migration.
     */
    anonymousSessionId: text('anonymous_session_id'),

    quizType: quizTypeEnum('quiz_type').notNull(),
    /** Null for MASTER; required for SPORT. Enforced at the service layer, not the database, since which is required depends on `quizType`. */
    sportId: entityRef('sport_id').references(() => sport.id),
    mode: quizModeEnum('mode').notNull(),

    status: quizAttemptStatusEnum('status').notNull().default('IN_PROGRESS'),

    requestedQuestionCount: integer('requested_question_count').notNull(),
    /**
     * How many questions were actually assembled — may be less than
     * requested when inventory is exhausted (Part 28: "do not silently
     * invent or duplicate questions to reach configured count").
     */
    actualQuestionCount: integer('actual_question_count').notNull(),

    correctCount: integer('correct_count').notNull().default(0),
    incorrectCount: integer('incorrect_count').notNull().default(0),
    scorePercentage: numeric('score_percentage', { precision: 5, scale: 2 }),

    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    abandonedAt: timestamp('abandoned_at', { withTimezone: true }),
    durationSeconds: integer('duration_seconds'),

    /** What `QuizGenerationService` decided and why — difficulty distribution actually achieved, per-sport allocation for MASTER, inventory shortfall notes. Debugging/audit only, never rendered to the quiz-taker. */
    generationMetadata: jsonb('generation_metadata').notNull().default({}),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('quiz_attempt_v2_public_code_idx').on(table.publicCode),
    index('quiz_attempt_v2_user_idx').on(table.userId, table.status),
    /**
     * "One active SPORT attempt per user + sport" (Part 38). Postgres treats
     * NULL as distinct in a unique index, so a `sportId`-inclusive index only
     * enforces uniqueness for SPORT attempts (`sportId` is never null there)
     * — MASTER's "one active attempt" rule is covered by the second index
     * below, which needs no `sportId` at all.
     */
    uniqueIndex('quiz_attempt_v2_one_active_sport_idx')
      .on(table.userId, table.sportId)
      .where(sql`${table.status} = 'IN_PROGRESS' AND ${table.quizType} = 'SPORT'`),
    /** "One active MASTER attempt per user" (Part 38). */
    uniqueIndex('quiz_attempt_v2_one_active_master_idx')
      .on(table.userId)
      .where(sql`${table.status} = 'IN_PROGRESS' AND ${table.quizType} = 'MASTER'`),
    index('quiz_attempt_v2_completed_idx').on(table.userId, table.completedAt),
  ],
);

export const quizAttemptQuestionV2 = pgTable(
  'quiz_attempt_question_v2',
  {
    id: primaryId(),
    quizAttemptId: entityRef('quiz_attempt_id')
      .notNull()
      .references(() => quizAttemptV2.id, { onDelete: 'cascade' }),
    questionId: entityRef('question_id')
      .notNull()
      .references(() => question.id),

    position: integer('position').notNull(),

    /** Frozen at serve time (Part 10). `question` may change or retire afterwards without altering this row's meaning. */
    questionTextSnapshot: text('question_text_snapshot').notNull(),
    /** `[{ optionCode, optionText, displayOrder }]` — never includes `isCorrect`; that lives only in `correctOptionSnapshot`, and only server-side logic ever reads it before the question is answered. */
    optionsSnapshot: jsonb('options_snapshot').notNull(),
    /** The `optionCode` (A/B/C/D) that was correct at serve time. */
    correctOptionSnapshot: text('correct_option_snapshot').notNull(),
    explanationSnapshot: text('explanation_snapshot'),
    difficultySnapshot: questionDifficultyEnum('difficulty_snapshot').notNull(),
    categorySnapshot: questionCategoryEnum('category_snapshot').notNull(),

    selectedOptionCode: text('selected_option_code'),
    selectedOptionTextSnapshot: text('selected_option_text_snapshot'),
    isCorrect: boolean('is_correct'),
    answeredAt: timestamp('answered_at', { withTimezone: true }),
    responseTimeMs: integer('response_time_ms'),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    /** Part 7.3: the same canonical question can never appear twice in one attempt. */
    uniqueIndex('quiz_attempt_question_v2_unique_idx').on(table.quizAttemptId, table.questionId),
    index('quiz_attempt_question_v2_attempt_idx').on(table.quizAttemptId, table.position),
  ],
);

export const quizAttemptV2Relations = relations(quizAttemptV2, ({ one, many }) => ({
  user: one(users, { fields: [quizAttemptV2.userId], references: [users.id] }),
  sport: one(sport, { fields: [quizAttemptV2.sportId], references: [sport.id] }),
  questions: many(quizAttemptQuestionV2),
}));

export const quizAttemptQuestionV2Relations = relations(quizAttemptQuestionV2, ({ one }) => ({
  attempt: one(quizAttemptV2, {
    fields: [quizAttemptQuestionV2.quizAttemptId],
    references: [quizAttemptV2.id],
  }),
  question: one(question, {
    fields: [quizAttemptQuestionV2.questionId],
    references: [question.id],
  }),
}));
