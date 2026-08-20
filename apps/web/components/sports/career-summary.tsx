import type { CareerSummaryEntry } from '@sportbrain/contracts';

/**
 * The three headline numbers on a player page: games, a scoring total, trophies.
 *
 * Deliberately not driven by what has been ingested. The registry-backed
 * `StatisticsPanel` below varies in shape from player to player, which is
 * correct for detailed statistics and wrong for a profile's headline: a page
 * that shows three tiles for one footballer and one for the next reads as
 * broken. So this renders exactly three tiles, always, and a value the archive
 * does not hold shows as a dash rather than disappearing.
 *
 * The middle label arrives with the data rather than being written here,
 * because it is goals in football, runs in cricket and race wins in Formula 1.
 */
export function CareerSummary({ entries }: { entries: CareerSummaryEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {entries.map((entry) => (
        <div key={entry.key} className="bg-card p-4">
          <dt
            className="text-xs font-medium text-muted-foreground"
            // The registry's definition, surfaced on hover: this is where a
            // derived figure such as a basketball points total explains itself.
            title={entry.description ?? undefined}
          >
            {entry.label}
          </dt>
          <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
            {entry.value === null ? (
              <span className="text-muted-foreground">—</span>
            ) : (
              entry.value.toLocaleString('en-GB')
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
