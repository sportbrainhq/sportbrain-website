import type { QuizAttempt } from '@sportbrain/contracts';
import { QuestionReviewItem } from './question-review-item';

const RESULT_LABEL_THRESHOLDS: [number, string][] = [
  [90, 'Outstanding'],
  [75, 'Strong Result'],
  [50, 'Solid Effort'],
  [0, 'Keep Learning'],
];

function resultLabel(percentage: number): string {
  return (
    RESULT_LABEL_THRESHOLDS.find(([threshold]) => percentage >= threshold)?.[1] ?? 'Keep Learning'
  );
}

function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—';
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes > 0 ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

/**
 * The result screen (Part 42-43): score, correct/incorrect/accuracy/time,
 * performance broken down by difficulty and category, then full question
 * review. Deliberately unexaggerated — no confetti, no badge unlock copy
 * (Part 42: "Avoid exaggerated gamification").
 */
export function QuizResult({ attempt }: { attempt: QuizAttempt }) {
  const percentage = attempt.scorePercentage ?? 0;
  const answered = attempt.questions;

  const byDifficulty = groupBy(answered, (q) => q.difficulty);
  const byCategory = groupBy(answered, (q) => q.category);

  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {attempt.quizType === 'MASTER' ? 'Master Quiz' : 'Quiz'} · {attempt.mode}
        </p>
        <p className="mt-3 text-4xl font-black text-foreground">
          {attempt.correctCount} / {attempt.actualQuestionCount}
        </p>
        <p className="text-lg font-semibold text-muted-foreground">{Math.round(percentage)}%</p>
        <p className="mt-1 text-sm font-medium text-primary">{resultLabel(percentage)}</p>
      </header>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Correct" value={attempt.correctCount} />
        <Stat label="Incorrect" value={attempt.incorrectCount} />
        <Stat label="Accuracy" value={`${Math.round(percentage)}%`} />
        <Stat label="Time" value={formatDuration(attempt.durationSeconds)} />
      </dl>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Performance by difficulty
        </h2>
        <ul className="mt-3 space-y-2">
          {Object.entries(byDifficulty).map(([difficulty, questions]) => (
            <BreakdownRow
              key={difficulty}
              label={difficulty}
              correct={questions.filter((q) => q.isCorrect).length}
              total={questions.length}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Performance by category
        </h2>
        <ul className="mt-3 space-y-2">
          {Object.entries(byCategory).map(([category, questions]) => (
            <BreakdownRow
              key={category}
              label={category.replace(/_/g, ' ')}
              correct={questions.filter((q) => q.isCorrect).length}
              total={questions.length}
            />
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Question review
        </h2>
        <div className="mt-3 space-y-4">
          {answered.map((question, index) => (
            <QuestionReviewItem
              key={question.id}
              question={question}
              position={index + 1}
              quizAttemptPublicCode={attempt.publicCode}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-center">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-card-foreground">{value}</dd>
    </div>
  );
}

function BreakdownRow({
  label,
  correct,
  total,
}: {
  label: string;
  correct: number;
  total: number;
}) {
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-2.5">
      <span className="text-sm font-medium capitalize text-card-foreground">
        {label.toLowerCase()}
      </span>
      <span className="text-sm text-muted-foreground">
        {correct} / {total} ({percent}%)
      </span>
    </li>
  );
}

function groupBy<T, K extends string>(items: T[], keyFn: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const key = keyFn(item);
    (result[key] ??= []).push(item);
  }
  return result;
}
