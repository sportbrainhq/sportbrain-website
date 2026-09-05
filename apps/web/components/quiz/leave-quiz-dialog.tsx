'use client';

import { useEffect, useRef } from 'react';

interface LeaveQuizDialogProps {
  open: boolean;
  onContinue: () => void;
  onLeave: () => void;
}

/**
 * "LEAVE QUIZ?" (Part 39). Leaving never abandons the attempt — it stays
 * IN_PROGRESS (resumable, or expires after the configured window) — this
 * dialog only navigates away; it does not call `abandonQuiz`.
 */
export function LeaveQuizDialog({ open, onContinue, onLeave }: LeaveQuizDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onContinue();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-quiz-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onContinue();
      }}
    >
      <div ref={dialogRef} className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <h2 id="leave-quiz-title" className="text-lg font-semibold text-card-foreground">
          Leave Quiz?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">Your progress has been saved.</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onContinue}
            autoFocus
            className="flex-1 rounded-sm bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue Quiz
          </button>
          <button
            type="button"
            onClick={onLeave}
            className="flex-1 rounded-sm border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
