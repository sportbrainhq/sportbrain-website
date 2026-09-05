'use client';

import { useState } from 'react';
import type { QuestionReportReason } from '@sportbrain/contracts';
import { QuizApiError, reportQuestion } from '@/lib/quiz-api';

const REASONS: { value: QuestionReportReason; label: string }[] = [
  { value: 'incorrect_answer', label: 'Incorrect answer' },
  { value: 'outdated_information', label: 'Outdated information' },
  { value: 'ambiguous_wording', label: 'Ambiguous wording' },
  { value: 'duplicate_question', label: 'Duplicate question' },
  { value: 'typo_formatting', label: 'Typo / formatting' },
  { value: 'other', label: 'Other' },
];

interface ReportQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  questionId: string;
  attemptQuestionId: string;
  quizAttemptPublicCode: string;
}

/** "REPORT QUESTION" (Part 44) — reason picker plus optional detail, auto-attaches question/attempt context server-side. */
export function ReportQuestionDialog({
  open,
  onClose,
  questionId,
  attemptQuestionId,
  quizAttemptPublicCode,
}: ReportQuestionDialogProps) {
  const [reason, setReason] = useState<QuestionReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceCode: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  function handleClose() {
    setReason(null);
    setDetails('');
    setResult(null);
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await reportQuestion(questionId, {
        reason,
        details: details.trim() || undefined,
        attemptQuestionId,
        quizAttemptPublicCode,
        context: 'quiz_result_review',
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof QuizApiError ? err.message : "Couldn't submit the report right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-question-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        {result ? (
          <>
            <h2 id="report-question-title" className="text-lg font-semibold text-card-foreground">
              Thanks for the report
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Reference: <span className="font-mono">{result.referenceCode}</span>
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 w-full rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </>
        ) : (
          <>
            <h2 id="report-question-title" className="text-lg font-semibold text-card-foreground">
              Report Question
            </h2>
            <fieldset className="mt-4 space-y-2">
              <legend className="sr-only">Reason</legend>
              {REASONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 text-sm text-card-foreground"
                >
                  <input
                    type="radio"
                    name="report-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="h-4 w-4"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            {reason === 'other' && (
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                placeholder="Describe the issue"
                rows={3}
                className="mt-3 w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground"
              />
            )}

            {error && <p className="mt-2 text-xs text-destructive">{error}</p>}

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!reason || submitting || (reason === 'other' && !details.trim())}
                className="flex-1 rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-sm border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
