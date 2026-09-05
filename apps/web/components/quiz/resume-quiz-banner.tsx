'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { QuizType } from '@sportbrain/contracts';
import { abandonQuiz, fetchActiveAttempt } from '@/lib/quiz-api';
import { useAuth } from '@/components/auth/auth-provider';

interface ResumeQuizBannerProps {
  quizType: QuizType;
  sportId?: string;
  label: string;
}

/**
 * "CONTINUE YOUR QUIZ" (Part 38). Client-side because it depends on the
 * session cookie and on a per-visit check ("is there an active attempt right
 * now") that has no reason to block the page's initial server render.
 * Renders nothing while loading and nothing when there's no active attempt
 * — this is a bonus prompt, not a required part of the page.
 */
export function ResumeQuizBanner({ quizType, sportId, label }: ResumeQuizBannerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState<Awaited<ReturnType<typeof fetchActiveAttempt>>>(null);
  const [confirmingNew, setConfirmingNew] = useState(false);
  const [abandoning, setAbandoning] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    fetchActiveAttempt(quizType, sportId ?? null).then((result) => {
      if (!cancelled) setActive(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user, quizType, sportId]);

  if (!user || !active) return null;

  async function handleAbandonAndStartNew() {
    if (!active) return;
    setAbandoning(true);
    await abandonQuiz(active.publicCode);
    setActive(null);
    setConfirmingNew(false);
    setAbandoning(false);
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
      {!confirmingNew ? (
        <>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Continue your quiz
          </p>
          <p className="mt-1 text-sm text-card-foreground">
            {label} · {active.answeredCount} / {active.actualQuestionCount} answered
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/quiz/attempt/${active.publicCode}`)}
              className="rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Resume
            </button>
            <button
              type="button"
              onClick={() => setConfirmingNew(true)}
              className="rounded-sm border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Start New
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-card-foreground">
            You already have a {label.toLowerCase()} in progress.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => router.push(`/quiz/attempt/${active.publicCode}`)}
              className="rounded-sm bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Resume Current
            </button>
            <button
              type="button"
              onClick={handleAbandonAndStartNew}
              disabled={abandoning}
              className="rounded-sm border border-destructive/40 px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
            >
              {abandoning ? 'Abandoning…' : 'Abandon & Start New'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
