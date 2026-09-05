import { integer, numeric, pgTable, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';
import { sport } from './sport.schema';

/**
 * A completed quiz, as history rather than content.
 *
 * `quizId` is a bare uuid, not yet a foreign key: there is no quiz-content
 * model (questions/options/correct answers) in the schema yet, so this table
 * exists ahead of it — the profile's quiz-history surfaces can be built and
 * tested against seeded rows before the quiz-taking feature that will
 * eventually write them for real. Wire the FK once that table lands.
 *
 * Score is written by the server after grading, never trusted from the
 * client: whatever submits a completed attempt must send answers, not a
 * score, and this row is what the grading step produces.
 */
export const quizAttempts = pgTable(
  'quiz_attempts',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    quizId: uuid('quiz_id').notNull(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),

    score: integer('score').notNull(),
    correctAnswers: integer('correct_answers').notNull(),
    totalQuestions: integer('total_questions').notNull(),
    percentage: numeric('percentage', { precision: 5, scale: 2 }).notNull(),

    durationSeconds: integer('duration_seconds'),

    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull(),

    ...timestamps,
  },
  (table) => [
    /** Recent-activity / quiz-history listing: newest first, per user. */
    index('quiz_attempts_user_id_idx').on(table.userId, table.completedAt),
    /** The by-sport breakdown on `/profile/quizzes`. */
    index('quiz_attempts_user_sport_idx').on(table.userId, table.sportId),
  ],
);
