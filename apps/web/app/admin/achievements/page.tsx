import { adminAchievementsListSchema } from '@sportbrain/contracts';
import { apiGetAuthed, requireAdmin } from '@/lib/auth';
import { AchievementActiveToggle } from '@/components/admin/passport/achievement-active-toggle';

export const metadata = { title: 'Achievements — Admin' };

/**
 * Achievement administration (Part 73-74): view definitions, activate/
 * deactivate, and see how many users have earned each. Deliberately no UI
 * for editing `criteriaType`/`criteriaConfig` here — those are treated as
 * immutable once an achievement has been earned by real users (Part 73);
 * changing what an achievement means ships as a new `code` via the seed
 * script, not an edit form.
 */
export default async function AdminAchievementsPage() {
  await requireAdmin();
  const data = await apiGetAuthed('/v1/admin/achievements', adminAchievementsListSchema);

  if (!data) {
    return <p className="text-sm text-muted-foreground">Couldn’t load achievements.</p>;
  }

  const byCategory = groupBy(data.achievements, (a) => a.category);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Achievements</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.achievements.length} defined · {data.achievements.filter((a) => a.isActive).length}{' '}
          active
        </p>
      </header>

      {Object.entries(byCategory).map(([category, achievements]) => (
        <section key={category}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {category}
          </h2>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary text-xs uppercase text-secondary-foreground">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Tier</th>
                  <th className="px-3 py-2">Criteria Type</th>
                  <th className="px-3 py-2">Earned</th>
                  <th className="px-3 py-2">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {achievements.map((a) => (
                  <tr key={a.id}>
                    <td className="px-3 py-2 font-mono text-xs">{a.code}</td>
                    <td className="px-3 py-2">
                      {a.name}
                      {a.isHidden && (
                        <span className="ml-1 text-xs text-muted-foreground">(hidden)</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{a.tier ?? '—'}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{a.criteriaType}</td>
                    <td className="px-3 py-2">{a.earnedCount}</td>
                    <td className="px-3 py-2">
                      <AchievementActiveToggle achievementId={a.id} isActive={a.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of items) {
    const k = key(item);
    (result[k] ??= []).push(item);
  }
  return result;
}
