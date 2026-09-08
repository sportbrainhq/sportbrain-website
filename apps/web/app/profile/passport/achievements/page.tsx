import { achievementsResponseSchema } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';

export const metadata = { title: 'Achievements' };

/**
 * Earned / in-progress / locked (Part 30). Hidden achievements never appear
 * in the locked list pre-earn — the API already omits them; nothing here
 * needs to special-case that.
 */
export default async function PassportAchievementsPage() {
  const achievements = await apiGetAuthed(
    '/v1/me/passport/achievements',
    achievementsResponseSchema,
  );

  if (!achievements) {
    return (
      <p className="text-sm text-muted-foreground">
        We couldn’t load your achievements right now. Try again shortly.
      </p>
    );
  }

  const { earned, inProgress, locked } = achievements;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">{earned.length} earned</p>
      </header>

      {earned.length === 0 && inProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Your first achievement is closer than you think. Complete a quiz to get started.
        </p>
      ) : (
        <>
          {earned.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Earned
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {earned.map((a) => (
                  <li
                    key={a.achievement.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <p className="text-sm font-semibold text-card-foreground">
                      {a.achievement.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {a.achievement.description}
                    </p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Earned{' '}
                      {new Date(a.earnedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {inProgress.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                In Progress
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {inProgress.map((p) => {
                  const pct = Math.min(100, Math.round((p.current / p.target) * 100));
                  return (
                    <li
                      key={p.achievement.id}
                      className="rounded-lg border border-border bg-card p-4"
                    >
                      <p className="text-sm font-semibold text-card-foreground">
                        {p.achievement.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.achievement.description}
                      </p>
                      <div className="mt-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {p.current} / {p.target}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {locked.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Locked
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {locked.map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-dashed border-border p-4 opacity-70"
              >
                <p className="text-sm font-semibold text-card-foreground">{a.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
