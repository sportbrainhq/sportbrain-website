import { notFound } from 'next/navigation';
import { quizShareSchema } from '@sportbrain/contracts';
import { apiGet } from '@/lib/api';

/**
 * Quiz-result share page (Part 52): score + per-sport breakdown for a
 * completed attempt, no question text/answers exposed. Unauthenticated,
 * addressed by `publicCode` — the same identifier the result URL uses.
 */
export default async function QuizSharePage({
  params,
}: {
  params: Promise<{ publicCode: string }>;
}) {
  const { publicCode } = await params;

  let share;
  try {
    share = await apiGet(`/v1/share/quiz/${publicCode}`, quizShareSchema, { noStore: true });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-16 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrainHQ
      </p>
      <h1 className="text-xl font-bold text-foreground">
        {share.quizType === 'MASTER' ? 'Master Quiz' : (share.sportName ?? 'Quiz')}
      </h1>
      <p className="text-5xl font-black text-foreground">
        {share.correctCount} / {share.totalCount}
      </p>
      {share.scorePercentage !== null && (
        <p className="text-lg font-semibold text-muted-foreground">
          {Math.round(share.scorePercentage)}%
        </p>
      )}

      {share.sportBreakdown && share.sportBreakdown.length > 0 && (
        <ul className="space-y-1 text-left text-sm">
          {share.sportBreakdown.map((row) => (
            <li key={row.sportName} className="flex items-center justify-between">
              <span className="text-muted-foreground">{row.sportName}</span>
              <span className="font-semibold text-foreground">
                {row.correctCount}/{row.totalCount}
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-muted-foreground">Can you beat this score?</p>
    </div>
  );
}
