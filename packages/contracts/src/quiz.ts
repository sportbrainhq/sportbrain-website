import { z } from 'zod';
import { questionCategorySchema, questionDifficultySchema } from './question';

/**
 * The quiz-taking surface (Part 29-43): starting an attempt, answering,
 * completing/abandoning, and resuming. A quiz here is a session over
 * references to the canonical Question Bank — nothing in this file
 * describes question content, only which question is at which position and
 * what was snapshotted/answered.
 */

export const quizTypeSchema = z.enum(['SPORT', 'MASTER']);
export type QuizType = z.infer<typeof quizTypeSchema>;

export const sportQuizModeSchema = z.enum(['QUICK', 'STANDARD', 'CHALLENGE']);
export type SportQuizMode = z.infer<typeof sportQuizModeSchema>;

export const masterQuizModeSchema = z.enum(['QUICK', 'STANDARD', 'MARATHON']);
export type MasterQuizMode = z.infer<typeof masterQuizModeSchema>;

/** The column's full value set; which subset is valid depends on `quizType` (see `sportQuizModeSchema`/`masterQuizModeSchema`). */
export const quizModeSchema = z.enum(['QUICK', 'STANDARD', 'CHALLENGE', 'MARATHON']);
export type QuizMode = z.infer<typeof quizModeSchema>;

export const quizAttemptStatusSchema = z.enum(['IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED']);
export type QuizAttemptStatus = z.infer<typeof quizAttemptStatusSchema>;

export const startQuizRequestSchema = z
  .object({
    quizType: quizTypeSchema,
    sportId: z.string().uuid().nullable().optional(),
    mode: quizModeSchema,
  })
  .refine((value) => value.quizType !== 'SPORT' || Boolean(value.sportId), {
    message: 'sportId is required for a SPORT quiz',
    path: ['sportId'],
  })
  .refine(
    (value) => value.quizType !== 'SPORT' || sportQuizModeSchema.safeParse(value.mode).success,
    {
      message: 'mode must be QUICK, STANDARD or CHALLENGE for a SPORT quiz',
      path: ['mode'],
    },
  )
  .refine(
    (value) => value.quizType !== 'MASTER' || masterQuizModeSchema.safeParse(value.mode).success,
    {
      message: 'mode must be QUICK, STANDARD or MARATHON for a MASTER quiz',
      path: ['mode'],
    },
  );
export type StartQuizRequest = z.infer<typeof startQuizRequestSchema>;

/** One option as the quiz-taking UI receives it — never the answer key. */
export const attemptQuestionOptionSchema = z.object({
  optionCode: z.enum(['A', 'B', 'C', 'D']),
  optionText: z.string(),
  displayOrder: z.number().int(),
});
export type AttemptQuestionOption = z.infer<typeof attemptQuestionOptionSchema>;

/** One question within an attempt, as returned before it's answered — no `isCorrect`, no `correctOptionSnapshot`. */
export const attemptQuestionSchema = z.object({
  id: z.string(),
  /** The canonical Question Bank id this position snapshots — needed by "Report Question" (`POST /questions/:questionId/report`), which addresses the canonical question, not the attempt-question row. */
  questionId: z.string(),
  position: z.number().int(),
  questionCode: z.string().optional(),
  questionText: z.string(),
  options: z.array(attemptQuestionOptionSchema),
  category: questionCategorySchema,
  difficulty: questionDifficultySchema,
  /** Present only once this position has been answered. */
  selectedOptionCode: z.enum(['A', 'B', 'C', 'D']).nullable(),
  isCorrect: z.boolean().nullable(),
  /** Revealed once answered; null before then. */
  correctOptionCode: z.enum(['A', 'B', 'C', 'D']).nullable(),
  explanation: z.string().nullable(),
});
export type AttemptQuestion = z.infer<typeof attemptQuestionSchema>;

export const quizAttemptSchema = z.object({
  id: z.string(),
  publicCode: z.string(),
  quizType: quizTypeSchema,
  sportId: z.string().nullable(),
  mode: quizModeSchema,
  status: quizAttemptStatusSchema,
  requestedQuestionCount: z.number().int(),
  actualQuestionCount: z.number().int(),
  correctCount: z.number().int(),
  incorrectCount: z.number().int(),
  scorePercentage: z.number().nullable(),
  startedAt: z.string(),
  lastActivityAt: z.string(),
  completedAt: z.string().nullable(),
  abandonedAt: z.string().nullable(),
  durationSeconds: z.number().int().nullable(),
  questions: z.array(attemptQuestionSchema),
});
export type QuizAttempt = z.infer<typeof quizAttemptSchema>;

/**
 * Lightweight row for lists (Part 47-48) — no `questions` array. Named
 * distinctly from `user.ts`'s `quizAttemptSummarySchema`, a pre-Phase-C
 * placeholder over the old `quiz_attempts` table nothing currently writes
 * to; that name collision is left for a follow-up cleanup once the old
 * placeholder is retired.
 */
export const quizHistoryItemSchema = quizAttemptSchema.omit({ questions: true });
export type QuizHistoryItem = z.infer<typeof quizHistoryItemSchema>;

export const submitAnswerRequestSchema = z.object({
  selectedOptionCode: z.enum(['A', 'B', 'C', 'D']),
});
export type SubmitAnswerRequest = z.infer<typeof submitAnswerRequestSchema>;

export const submitAnswerResponseSchema = z.object({
  isCorrect: z.boolean(),
  correctOptionCode: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string().nullable(),
  /** Whether every question in the attempt has now been answered — the client's cue to call `/complete` next. */
  attemptComplete: z.boolean(),
});
export type SubmitAnswerResponse = z.infer<typeof submitAnswerResponseSchema>;

/** `GET /me/quiz-active` — the resume prompt's data source (Part 38). */
export const activeQuizAttemptSchema = z.object({
  publicCode: z.string(),
  quizType: quizTypeSchema,
  sportId: z.string().nullable(),
  mode: quizModeSchema,
  actualQuestionCount: z.number().int(),
  answeredCount: z.number().int(),
  startedAt: z.string(),
  lastActivityAt: z.string(),
});
export type ActiveQuizAttempt = z.infer<typeof activeQuizAttemptSchema>;
