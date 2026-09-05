'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AttemptQuestion, QuizAttempt } from '@sportbrain/contracts';
import { completeQuiz, submitAnswer } from '@/lib/quiz-api';
import { LeaveQuizDialog } from './leave-quiz-dialog';

const DIFFICULTY_LABEL: Record<AttemptQuestion['difficulty'], string> = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
  EXPERT: 'Expert',
};

interface ActiveQuizRunnerProps {
  initialAttempt: QuizAttempt;
  onCompleted: (attempt: QuizAttempt) => void;
}

/**
 * The active quiz-taking surface (Part 34-37): one question visible at a
 * time, an answer locks immediately on selection with server-side grading
 * (never client-computed correctness), and the explanation shows before
 * "Next question" appears. `position` in local state, not derived from
 * which questions have `answeredAt` set, because a resumed quiz should
 * always continue from the first unanswered position — see the
 * `findFirstUnanswered` call below.
 */
export function ActiveQuizRunner({ initialAttempt, onCompleted }: ActiveQuizRunnerProps) {
  const router = useRouter();
  const [questions, setQuestions] = useState(initialAttempt.questions);
  const [position, setPosition] = useState(() =>
    findFirstUnansweredIndex(initialAttempt.questions),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  const current = questions[position];
  const answeredCount = questions.filter((q) => q.selectedOptionCode !== null).length;

  // Warn on tab close / browser back while genuinely mid-quiz — the
  // in-page "Leave Quiz?" dialog (Part 39) handles the in-app back button;
  // this covers the tab-close case the dialog can't intercept.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (answeredCount < questions.length) {
        event.preventDefault();
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answeredCount, questions.length]);

  if (!current) {
    return <p className="text-sm text-muted-foreground">Nothing left to answer.</p>;
  }

  async function handleSelect(optionCode: 'A' | 'B' | 'C' | 'D') {
    const question = questions[position];
    if (!question || question.selectedOptionCode || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitAnswer(initialAttempt.publicCode, question.id, optionCode);
      setQuestions((prev) =>
        prev.map((q, index) =>
          index === position
            ? {
                ...q,
                selectedOptionCode: optionCode,
                isCorrect: result.isCorrect,
                correctOptionCode: result.correctOptionCode,
                explanation: result.explanation,
              }
            : q,
        ),
      );
    } catch {
      setError("Couldn't submit that answer. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    if (position + 1 < questions.length) {
      setPosition(position + 1);
      return;
    }
    setSubmitting(true);
    try {
      const completed = await completeQuiz(initialAttempt.publicCode);
      onCompleted(completed);
    } catch {
      setError("Couldn't finish this quiz right now. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPercent = Math.round(((position + 1) / questions.length) * 100);
  const answered = current.selectedOptionCode !== null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setLeaveDialogOpen(true)}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Leave
        </button>
        <span className="text-sm font-medium text-muted-foreground">
          Question {position + 1} / {questions.length}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>{current.category.replace(/_/g, ' ')}</span>
          <span>{DIFFICULTY_LABEL[current.difficulty]}</span>
        </div>
        <h1 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
          {current.questionText}
        </h1>
      </div>

      <div className="space-y-3">
        {current.options.map((option) => {
          const isSelected = current.selectedOptionCode === option.optionCode;
          const isCorrectOption = answered && current.correctOptionCode === option.optionCode;
          const isWrongSelected = answered && isSelected && current.isCorrect === false;

          return (
            <button
              key={option.optionCode}
              type="button"
              onClick={() => handleSelect(option.optionCode)}
              disabled={answered || submitting}
              aria-pressed={isSelected}
              className={optionClassName({ answered, isCorrectOption, isWrongSelected })}
            >
              <span>{option.optionText}</span>
              {isCorrectOption && (
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  ✓ Correct
                </span>
              )}
              {isWrongSelected && (
                <span className="font-semibold text-destructive">✕ Incorrect</span>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {answered && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p
            className={
              current.isCorrect
                ? 'text-sm font-semibold text-emerald-700 dark:text-emerald-400'
                : 'text-sm font-semibold text-destructive'
            }
          >
            {current.isCorrect ? '✓ Correct' : '✕ Incorrect'}
          </p>
          {current.explanation && (
            <p className="mt-2 text-sm text-muted-foreground">{current.explanation}</p>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="mt-4 inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {position + 1 < questions.length
              ? 'Next Question'
              : submitting
                ? 'Finishing…'
                : 'See Results'}
          </button>
        </div>
      )}

      <LeaveQuizDialog
        open={leaveDialogOpen}
        onContinue={() => setLeaveDialogOpen(false)}
        onLeave={() => router.push('/')}
      />
    </div>
  );
}

function findFirstUnansweredIndex(questions: AttemptQuestion[]): number {
  const index = questions.findIndex((q) => q.selectedOptionCode === null);
  return index === -1 ? Math.max(0, questions.length - 1) : index;
}

function optionClassName({
  answered,
  isCorrectOption,
  isWrongSelected,
}: {
  answered: boolean;
  isCorrectOption: boolean;
  isWrongSelected: boolean;
}): string {
  const base =
    'flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm font-medium transition-colors';

  if (!answered) {
    return `${base} border-border bg-card text-card-foreground hover:border-foreground/30 hover:bg-muted/50`;
  }
  if (isCorrectOption) {
    return `${base} border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100`;
  }
  if (isWrongSelected) {
    return `${base} border-destructive/40 bg-destructive/5 text-destructive`;
  }
  return `${base} border-border bg-card text-muted-foreground opacity-60`;
}
