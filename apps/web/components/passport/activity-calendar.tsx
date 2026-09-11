import type { PassportActivity } from '@sportbrain/contracts';

/**
 * Tasteful GitHub-style activity grid (Part 37-38): intensity is questions
 * answered that day, never an invented "XP". Weeks run Monday-first to
 * match the streak's own week definition. Accessible text summary
 * alongside the grid (Part 82) — the grid itself is `aria-hidden`.
 */
export function ActivityCalendar({ activity }: { activity: PassportActivity }) {
  const byDate = new Map(activity.days.map((d) => [d.date, d]));
  const totalDays = activity.days.filter((d) => d.questionsAnswered > 0).length;

  if (totalDays === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your activity will appear here as you complete more quizzes.
      </p>
    );
  }

  const maxQuestions = Math.max(1, ...activity.days.map((d) => d.questionsAnswered));
  const weeks = buildWeeks(activity.days.length);

  return (
    <div>
      <div aria-hidden="true" className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((offset) => {
              const date = dateFromOffset(offset);
              const day = byDate.get(date);
              const intensity = day ? Math.min(1, day.questionsAnswered / maxQuestions) : 0;
              return (
                <div
                  key={date}
                  title={
                    day && day.questionsAnswered > 0
                      ? `${formatDate(date)} · ${day.quizzesCompleted} quiz${day.quizzesCompleted === 1 ? '' : 'zes'} · ${day.questionsAnswered} question${day.questionsAnswered === 1 ? '' : 's'} · ${day.correctAnswers} correct`
                      : formatDate(date)
                  }
                  className="size-3 rounded-sm"
                  style={{
                    backgroundColor:
                      intensity === 0
                        ? 'var(--color-secondary, #e5e7eb)'
                        : `color-mix(in srgb, var(--color-primary, #2563eb) ${Math.round(20 + intensity * 80)}%, transparent)`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {totalDays} active day{totalDays === 1 ? '' : 's'} in the last {activity.days.length} days.
      </p>
    </div>
  );
}

function buildWeeks(dayCount: number): number[][] {
  const weeks: number[][] = [];
  let current: number[] = [];
  for (let i = dayCount - 1; i >= 0; i--) {
    current.push(i);
    if (current.length === 7) {
      weeks.unshift(current);
      current = [];
    }
  }
  if (current.length > 0) weeks.unshift(current);
  return weeks;
}

function dateFromOffset(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}
