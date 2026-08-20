import type { CareerSummaryEntry, StatisticGroup, StatisticValue } from '@sportbrain/contracts';

/**
 * A player's or team's statistics: one section, uniform across a sport.
 *
 * Two kinds of number arrive here and both render as the same kind of tile.
 *
 * The `summary` is the sport's fixed set, shown by every player of that sport
 * in the same order whether or not the archive holds a figure for them, because
 * a profile that changes shape from player to player reads as broken rather
 * than as incomplete. A missing value shows as a dash.
 *
 * The `groups` are the registry-driven detail, which varies with what has been
 * ingested. Every value arrives labelled, categorised and formatted, so a
 * cricketer's Test and T20I blocks and a footballer's single block render
 * through the same code and adding a sport requires no change here.
 *
 * The one rule it enforces: nothing renders that the registry has not
 * described. That is what stops a raw provider key appearing as a heading.
 */

export function StatisticsPanel({
  groups,
  summary = [],
}: {
  groups: StatisticGroup[];
  summary?: CareerSummaryEntry[];
}) {
  const populated = groups.filter((group) => group.statistics.length > 0);

  if (summary.length === 0 && populated.length === 0) {
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
    <div className="space-y-px">
      {summary.length > 0 && (
        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
          {summary.map((entry) => (
            <Tile
              key={entry.key}
              label={entry.label}
              description={entry.description}
              value={entry.value === null ? null : entry.value.toLocaleString('en-GB')}
            />
          ))}
        </dl>
      )}

      {populated.map((group, index) => (
        <StatisticGrid
          key={group.discipline?.key ?? `group-${index}`}
          statistics={group.statistics}
          // Deliberately not rendered as its own labelled sub-block. A reader
          // wants one set of statistics, not a page that splits a footballer's
          // numbers under an "Outfield" heading they never asked about.
          appearances={null}
        />
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
  return (
    <div className="space-y-px">
      {appearances !== null && appearances > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {appearances.toLocaleString('en-GB')}
          </span>{' '}
          appearances
        </p>
      )}

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
        {statistics.map((statistic) => (
          <Tile
            key={statistic.key}
            label={statistic.label}
            description={statistic.description}
            value={formatValue(statistic)}
          />
        ))}
      </dl>
    </div>
  );
}

/** One number and its label. The same shape whichever list it came from. */
function Tile({
  label,
  description,
  value,
}: {
  label: string;
  description: string | null;
  value: string | null;
}) {
  return (
    <div className="bg-card p-4">
      <dt
        className="text-xs font-medium text-muted-foreground"
        // The registry's definition, surfaced on hover. This is the data layer
        // meeting the explainer mission.
        title={description ?? undefined}
      >
        {label}
      </dt>
      <dd className="mt-1 font-mono text-2xl font-bold tabular-nums">
        {value === null ? <span className="text-muted-foreground">—</span> : value}
      </dd>
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
