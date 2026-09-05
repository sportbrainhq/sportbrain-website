'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizMode, QuizType } from '@sportbrain/contracts';
import { QuizApiError, startQuiz } from '@/lib/quiz-api';
import { useAuth } from '@/components/auth/auth-provider';
import { googleSignInUrl } from '@/lib/auth-client';

interface QuizModeCardProps {
  title: string;
  questionCount: number;
  minutes: number;
  quizType: QuizType;
  mode: QuizMode;
  sportId?: string;
}

/**
 * One mode card ("QUICK / 5 Questions / ~2 min / [Start]") — Part 32/33.
 * Starting a quiz is a write (`POST /quiz/attempts`), so this is a client
 * component that starts the attempt then navigates to it, rather than a
 * plain link to a route that doesn't exist until the attempt does.
 *
 * Anonymous quiz-taking isn't wired yet (see `QuizAttemptsController`'s
 * header — Phase C3 is authenticated-only), so a signed-out click opens the
 * sign-in redirect instead of attempting to start.
 */
export function QuizModeCard({
  title,
  questionCount,
  minutes,
  quizType,
  mode,
  sportId,
}: QuizModeCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      const attempt = await startQuiz({ quizType, mode, sportId: sportId ?? null });
      router.push(`/quiz/attempt/${attempt.publicCode}`);
    } catch (err) {
      if (err instanceof QuizApiError && err.status === 409) {
        setError('You already have a quiz like this in progress.');
      } else if (err instanceof QuizApiError && err.status === 400) {
        setError(err.message);
      } else {
        setError("We couldn't start this quiz right now. Try again.");
      }
      setStarting(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="mt-3 text-2xl font-bold text-card-foreground">{questionCount} Questions</p>
      <p className="mt-1 text-sm text-muted-foreground">~{minutes} min</p>

      {user ? (
        <button
          type="button"
          onClick={handleStart}
          disabled={starting}
          className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {starting ? 'Building your quiz…' : 'Start'}
        </button>
      ) : (
        <a
          href={googleSignInUrl(
            typeof window !== 'undefined' ? window.location.pathname : undefined,
          )}
          className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Sign in to start
        </a>
      )}

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
