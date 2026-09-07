import Link from 'next/link';
import { z } from 'zod';
import { quizHistoryItemSchema, type QuizHistoryItem } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'Quiz History' };

const listSchema = z.object({ data: z.array(quizHistoryItemSchema) });

/**
 * Quiz history (Part 47-48): every completed/abandoned attempt for the
 * signed-in user, most recent first — sourced straight from
 * `GET /users/me/quiz-attempts`, the same endpoint the abandoned-in-place
 * stub this replaces was waiting on. No client-side filtering UI yet
 * (Part 47's ALL/MASTER/per-sport pills, 7/30/all-time window) — the API
 * doesn't take those as query params yet, so building filter controls now
 * would be decoration with nothing behind it; the list itself is real.
 */
export default async function QuizHistoryPage() {
  const result = await apiGetAuthed('/v1/users/me/quiz-attempts', listSchema);
  const attempts = result?.data ?? [];

  const completed = attempts.filter((attempt) => attempt.status === 'COMPLETED');

  if (completed.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h1 className="text-lg font-semibold text-card-foreground">Your scoreboard is empty.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Take your first quiz.</p>
      </div>
    );
  }

  const summary = summarize(completed);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Quiz History</h1>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Quizzes Completed" value={summary.quizzesCompleted} />
        <Stat label="Questions Answered" value={summary.questionsAnswered} />
        <Stat label="Correct Answers" value={summary.correctAnswers} />
        <Stat label="Overall Accuracy" value={`${summary.overallAccuracy}%`} />
      </dl>

      <ul className="space-y-3">
        {completed.map((attempt) => (
          <HistoryItem key={attempt.id} attempt={attempt} />
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-card-foreground">{value}</dd>
    </div>
  );
}

function HistoryItem({ attempt }: { attempt: QuizHistoryItem }) {
  const label = attempt.quizType === 'MASTER' ? 'Master Quiz' : (attempt.sportSlug ?? 'Quiz');
  const percentage = attempt.scorePercentage !== null ? Math.round(attempt.scorePercentage) : null;

  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {label} · {attempt.mode}
          </p>
          <p className="mt-1 text-lg font-bold text-card-foreground">
            {attempt.correctCount} / {attempt.actualQuestionCount}
            {percentage !== null && (
              <span className="ml-2 text-sm font-medium text-muted-foreground">{percentage}%</span>
            )}
          </p>
        </div>
        <Link
          href={`/quiz/attempt/${attempt.publicCode}`}
          className="whitespace-nowrap rounded-sm border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View Results
        </Link>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {attempt.completedAt ? formatDate(attempt.completedAt) : ''}
        {attempt.durationSeconds !== null && ` · ${formatDuration(attempt.durationSeconds)}`}
      </p>
    </li>
  );
}

function summarize(attempts: QuizHistoryItem[]) {
  const questionsAnswered = attempts.reduce((sum, a) => sum + a.correctCount + a.incorrectCount, 0);
  const correctAnswers = attempts.reduce((sum, a) => sum + a.correctCount, 0);
  return {
    quizzesCompleted: attempts.length,
    questionsAnswered,
    correctAnswers,
    overallAccuracy:
      questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0,
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}
