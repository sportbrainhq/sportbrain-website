'use client';

import { useState } from 'react';
import type { AttemptQuestion } from '@sportbrain/contracts';
import { ReportQuestionDialog } from './report-question-dialog';

interface QuestionReviewItemProps {
  question: AttemptQuestion;
  position: number;
  quizAttemptPublicCode: string;
}

/** One question in the result review (Part 43-44): answer/correct-answer/explanation, plus "Report Question". */
export function QuestionReviewItem({
  question,
  position,
  quizAttemptPublicCode,
}: QuestionReviewItemProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const selectedOption = question.options.find((o) => o.optionCode === question.selectedOptionCode);
  const correctOption = question.options.find((o) => o.optionCode === question.correctOptionCode);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <span>Question {position}</span>
        <span
          className={
            question.isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-destructive'
          }
        >
          {question.isCorrect ? '✓ Correct' : '✕ Incorrect'}
        </span>
      </div>

      <p className="mt-2 text-sm font-medium text-card-foreground">{question.questionText}</p>

      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">Your answer</dt>
          <dd className="text-card-foreground">{selectedOption?.optionText ?? '—'}</dd>
        </div>
        {!question.isCorrect && (
          <div>
            <dt className="text-xs text-muted-foreground">Correct answer</dt>
            <dd className="text-card-foreground">{correctOption?.optionText ?? '—'}</dd>
          </div>
        )}
      </dl>

      {question.explanation && (
        <p className="mt-3 text-sm text-muted-foreground">{question.explanation}</p>
      )}

      <button
        type="button"
        onClick={() => setReportOpen(true)}
        className="mt-3 text-xs font-medium text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
      >
        Report Question
      </button>

      <ReportQuestionDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        questionId={question.questionId}
        attemptQuestionId={question.id}
        quizAttemptPublicCode={quizAttemptPublicCode}
      />
    </div>
  );
}
