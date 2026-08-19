import type { StatisticGroup, StatisticValue } from '@sportbrain/contracts';

/**
 * Renders statistics for any sport, without knowing which sport it is.
 *
 * This component is the payoff for the registry in the database. Every value
 * arrives labelled, categorised and formatted, so a cricketer's Test and T20I
 * blocks and a footballer's single block render through the same code. Adding a
 * sport requires no change here.
 *
 * The one rule it enforces: nothing renders that the registry has not described.
 * That is what stops a raw provider key ever appearing as a column heading.
 */

export function StatisticsPanel({ groups }: { groups: StatisticGroup[] }) {
  const populated = groups.filter((group) => group.statistics.length > 0);

  if (populated.length === 0) {
    // Honest rather than blank. Entity data comes from a free source that holds
    // no match statistics, so this state is expected and should say so rather
    // than implying the page is broken.
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        No statistics recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {populated.map((group, index) => (
        <section key={group.discipline?.key ?? `group-${index}`}>
          {/* Only labelled when the sport actually has divisions. A footballer
              should not see a heading saying "—". */}
          {group.discipline && (
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {group.discipline.label}
            </h3>
          )}

          <StatisticGrid statistics={group.statistics} appearances={group.appearances} />
        </section>
      ))}
    </div>
  );
}

function StatisticGrid({
  statistics,
  appearances,
}: {
  statistics: StatisticValue[];
  appearances: number | null;
}) {
  // Grouped by the registry's category, which is what turns a flat list into
  // "Batting" and "Bowling" on a cricketer's page.
  const byCategory = new Map<string, StatisticValue[]>();
  for (const statistic of statistics) {
    const key = statistic.category ?? 'General';
    byCategory.set(key, [...(byCategory.get(key) ?? []), statistic]);
  }

  return (
    <div className="space-y-6">
      {appearances !== null && appearances > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {appearances.toLocaleString('en-GB')}
          </span>{' '}
          appearances
        </p>
      )}

      {[...byCategory].map(([category, values]) => (
        <div key={category}>
          {byCategory.size > 1 && (
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {category}
            </h4>
          )}
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {values.map((statistic) => (
              <div key={statistic.key} className="bg-card p-4">
                <dt
                  className="text-xs font-medium text-muted-foreground"
                  // The registry's definition, surfaced on hover. This is the
                  // data layer meeting the explainer mission.
                  title={statistic.description ?? undefined}
                >
                  {statistic.label}
                </dt>
                <dd className="mt-1 font-mono text-xl font-bold tabular-nums">
                  {formatValue(statistic)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}

/**
 * Formats a value according to its registry entry.
 *
 * The formatting rules live in the database rather than here, so a sport can
 * declare that its averages take two decimals without a front-end change.
 */
function formatValue(statistic: StatisticValue): string {
  const { value, format, precision } = statistic;

  if (value === null) return '—';
  if (typeof value === 'string') return value;

  switch (format) {
    case 'decimal':
      return value.toFixed(precision || 2);
    case 'percentage':
      return `${value.toFixed(precision || 1)}%`;
    case 'ratio':
      return value.toFixed(precision || 2);
    case 'duration': {
      const minutes = Math.floor(value / 60);
      const seconds = Math.round(value % 60);
      return `${minutes}:${String(seconds).padStart(2, '0')}`;
    }
    default:
      return value.toLocaleString('en-GB');
  }
}
