'use client';

import {
  activeQuizAttemptSchema,
  lifetimeQuizStatsSchema,
  quizAttemptSchema,
  reportQuestionResultSchema,
  sportQuizStatsSchema,
  submitAnswerResponseSchema,
  type ActiveQuizAttempt,
  type LifetimeQuizStats,
  type QuizAttempt,
  type QuizType,
  type ReportQuestionRequest,
  type ReportQuestionResult,
  type SportQuizStats,
  type StartQuizRequest,
  type SubmitAnswerResponse,
} from '@sportbrain/contracts';
import { z } from 'zod';
import { clientEnv } from './env';

/**
 * Client-side quiz-taking calls: every mutation a quiz-taking session makes
 * (start, answer, complete, abandon) plus the resume-prompt lookup. Follows
 * `lib/auth-client.ts`'s pattern exactly — `credentials: 'include'` direct
 * to the API, no server-side proxy — because the quiz-taking flow lives
 * entirely in client components (one question visible at a time, answered
 * without a full page navigation per Part 34/35).
 */

export class QuizApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'QuizApiError';
  }
}

async function parseOrThrow<T>(
  response: Response,
  schema: { safeParse: (v: unknown) => { success: boolean; data?: T } },
): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) message = body.error.message;
    } catch {
      // Body wasn't JSON; keep the generic message.
    }
    throw new QuizApiError(response.status, message);
  }
  const json = await response.json();
  const parsed = schema.safeParse(json);
  if (!parsed.success || parsed.data === undefined) {
    throw new QuizApiError(response.status, 'Unexpected response shape from the quiz API.');
  }
  return parsed.data;
}

const dataEnvelope = <T>(schema: {
  safeParse: (v: unknown) => { success: boolean; data?: T };
}) => ({
  safeParse: (value: unknown) => {
    const envelope = value as { data?: unknown };
    return schema.safeParse(envelope?.data);
  },
});

export async function startQuiz(request: StartQuizRequest): Promise<QuizAttempt> {
  const response = await fetch(new URL('/v1/quiz/attempts', clientEnv.NEXT_PUBLIC_API_URL), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return parseOrThrow(response, dataEnvelope(quizAttemptSchema));
}

export async function fetchAttempt(publicCode: string): Promise<QuizAttempt> {
  const response = await fetch(
    new URL(`/v1/quiz/attempts/${publicCode}`, clientEnv.NEXT_PUBLIC_API_URL),
    { credentials: 'include', headers: { Accept: 'application/json' } },
  );
  return parseOrThrow(response, dataEnvelope(quizAttemptSchema));
}

export async function submitAnswer(
  publicCode: string,
  attemptQuestionId: string,
  selectedOptionCode: 'A' | 'B' | 'C' | 'D',
): Promise<SubmitAnswerResponse> {
  const response = await fetch(
    new URL(
      `/v1/quiz/attempts/${publicCode}/questions/${attemptQuestionId}/answer`,
      clientEnv.NEXT_PUBLIC_API_URL,
    ),
    {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedOptionCode }),
    },
  );
  return parseOrThrow(response, dataEnvelope(submitAnswerResponseSchema));
}

export async function completeQuiz(publicCode: string): Promise<QuizAttempt> {
  const response = await fetch(
    new URL(`/v1/quiz/attempts/${publicCode}/complete`, clientEnv.NEXT_PUBLIC_API_URL),
    {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  return parseOrThrow(response, dataEnvelope(quizAttemptSchema));
}

export async function abandonQuiz(publicCode: string): Promise<void> {
  await fetch(new URL(`/v1/quiz/attempts/${publicCode}/abandon`, clientEnv.NEXT_PUBLIC_API_URL), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
}

/** Part 38's resume prompt data source. Returns null rather than throwing on 401 — an anonymous visitor simply has nothing to resume. */
export async function fetchActiveAttempt(
  quizType: QuizType,
  sportId: string | null,
): Promise<ActiveQuizAttempt | null> {
  const url = new URL('/v1/users/me/quiz-active', clientEnv.NEXT_PUBLIC_API_URL);
  url.searchParams.set('quizType', quizType);
  if (sportId) url.searchParams.set('sportId', sportId);

  const response = await fetch(url, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const json = await response.json();
  const parsed = dataEnvelope(activeQuizAttemptSchema).safeParse(json);
  return parsed.success ? (parsed.data ?? null) : null;
}

/** "YOUR FOOTBALL STATS" / "MASTER QUIZZES" blocks (Part 32-33). Null when signed out or the call fails — these blocks simply don't render rather than erroring the page. */
export async function fetchLifetimeQuizStats(): Promise<LifetimeQuizStats | null> {
  const response = await fetch(new URL('/v1/users/me/quiz-stats', clientEnv.NEXT_PUBLIC_API_URL), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return null;
  const parsed = dataEnvelope(lifetimeQuizStatsSchema).safeParse(await response.json());
  return parsed.success ? (parsed.data ?? null) : null;
}

const sportStatsListSchema = z.array(sportQuizStatsSchema);

/** This user's per-sport breakdown, filtered to one sport for the sport-quiz landing page's stats block. */
export async function fetchSportQuizStats(sportId: string): Promise<SportQuizStats | null> {
  const response = await fetch(
    new URL('/v1/users/me/quiz-stats/sports', clientEnv.NEXT_PUBLIC_API_URL),
    {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  if (!response.ok) return null;
  const parsed = dataEnvelope(sportStatsListSchema).safeParse(await response.json());
  if (!parsed.success || !parsed.data) return null;
  return parsed.data.find((row) => row.sportId === sportId) ?? null;
}

/** "Report Question" (Part 44). Authenticated only — see `QuestionReportsController`'s header. */
export async function reportQuestion(
  questionId: string,
  request: ReportQuestionRequest,
): Promise<ReportQuestionResult> {
  const response = await fetch(
    new URL(`/v1/questions/${questionId}/report`, clientEnv.NEXT_PUBLIC_API_URL),
    {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  );
  return parseOrThrow(response, dataEnvelope(reportQuestionResultSchema));
}
