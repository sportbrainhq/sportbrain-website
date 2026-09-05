'use client';

import { use, useEffect, useState } from 'react';
import { Container } from '@/components/layout/container';
import { ActiveQuizRunner } from '@/components/quiz/active-quiz-runner';
import { QuizResult } from '@/components/quiz/quiz-result';
import { QuizApiError, fetchAttempt } from '@/lib/quiz-api';
import type { QuizAttempt } from '@sportbrain/contracts';

/**
 * `/quiz/attempt/:publicCode` (Part 34). A client page throughout: the
 * attempt is per-user data behind the session cookie, answering happens
 * one question at a time without a page navigation (Part 34/35), and a
 * completed attempt shows its result in place rather than redirecting —
 * all three are client-side concerns, so there is no server-rendered shell
 * worth keeping here.
 */
export default function QuizAttemptPage({ params }: { params: Promise<{ publicCode: string }> }) {
  const { publicCode } = use(params);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAttempt(publicCode)
      .then((result) => {
        if (!cancelled) setAttempt(result);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof QuizApiError && err.status === 404) {
          setError('This quiz attempt does not exist.');
        } else if (err instanceof QuizApiError && err.status === 403) {
          setError('This quiz attempt belongs to someone else.');
        } else {
          setError("We couldn't load this quiz right now.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [publicCode]);

  if (error) {
    return (
      <Container className="py-16 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </Container>
    );
  }

  if (!attempt) {
    return (
      <Container className="py-16 text-center">
        <p className="text-sm text-muted-foreground">Building your quiz…</p>
      </Container>
    );
  }

  if (attempt.status === 'COMPLETED') {
    return (
      <Container size="narrow" className="py-8">
        <QuizResult attempt={attempt} />
      </Container>
    );
  }

  if (attempt.status !== 'IN_PROGRESS') {
    return (
      <Container className="py-16 text-center">
        <p className="text-sm text-muted-foreground">
          This quiz is {attempt.status.toLowerCase().replace('_', ' ')}.
        </p>
      </Container>
    );
  }

  return (
    <Container size="narrow" className="py-8">
      <ActiveQuizRunner initialAttempt={attempt} onCompleted={setAttempt} />
    </Container>
  );
}
