import { boolean, index, integer, pgTable, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { question } from './question.schema';
import { users } from './user.schema';

/**
 * What a user has seen, per canonical question — the record the no-repeat
 * policy (Part 26-27) is built on. One row per `(userId, questionId)`,
 * updated (never inserted a second time) every time that question is served
 * again after a cooldown expires.
 *
 * Deliberately not derived from `quiz_attempt_question` at read time: the
 * unseen-first / cooldown-fallback selection in `QuizGenerationService` runs
 * on every quiz start, and a query against this table (indexed on
 * `userId + lastSeenAt`) is the difference between an indexed lookup and a
 * join across every historical attempt a user has ever taken.
 */
export const questionExposure = pgTable(
  'question_exposure',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: entityRef('question_id')
      .notNull()
      .references(() => question.id, { onDelete: 'cascade' }),

    firstSeenAt: timestamp('first_seen_at', { withTimezone: true }).notNull(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),

    timesSeen: integer('times_seen').notNull().default(0),
    timesCorrect: integer('times_correct').notNull().default(0),
    timesIncorrect: integer('times_incorrect').notNull().default(0),

    /** Null until the most recent serving of this question has been answered — e.g. the attempt was abandoned first. */
    lastAnsweredCorrectly: boolean('last_answered_correctly'),
    lastAnsweredAt: timestamp('last_answered_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('question_exposure_user_question_idx').on(table.userId, table.questionId),
    /** `QuizGenerationService`'s cooldown-fallback query: this user's oldest-seen eligible questions. */
    index('question_exposure_user_last_seen_idx').on(table.userId, table.lastSeenAt),
  ],
);
