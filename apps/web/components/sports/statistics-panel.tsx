import type { CareerSummaryEntry, StatisticGroup, StatisticValue } from '@sportbrain/contracts';

/**
 * A player's or team's statistics.
 *
 * Two shapes, chosen by the data rather than by the sport.
 *
 * **Record tables** where a group carries a discipline and its statistics carry
 * categories. That is how a career divided into formats is read everywhere it
 * is published: one row per format, one table per department, so a cricketer's
 * page shows Test Batting, Test Bowling, ODI Batting and so on. A grid of tiles
 * was showing the same numbers as forty-odd unaligned boxes, which made a
 * batting average impossible to compare against the one below it.
 *
 * **Tiles** for a sport with one undivided statistical world, where there is no
 * second row to align against and a table of one row reads worse than a tile.
 *
 * The `summary` is the sport's fixed set, shown by every player of that sport
 * in the same order whether or not the archive holds a figure for them, because
 * a profile that changes shape from player to player reads as broken rather
 * than as incomplete. A missing value shows as a dash.
 *
 * The one rule this enforces throughout: nothing renders that the registry has
 * not described. That is what stops a raw provider key appearing as a heading.
 */

export function StatisticsPanel({
  groups,
  summary = [],
}: {
  groups: StatisticGroup[];
  summary?: CareerSummaryEntry[];
}) {
  const populated = groups.filter((group) => group.statistics.length > 0);
  const tables = recordTables(populated);

  if (summary.length === 0 && populated.length === 0) {
    /*
     * Nothing at all, rather than a placeholder saying so.
     *
     * This previously rendered "No statistics recorded yet." on the reasoning
     * that absent data should be stated rather than hidden. On a page that is
     * otherwise full, that reads as a defect: a tennis profile carrying a full
     * honours board and a slam breakdown ended with an empty dashed box, which
     * tells the reader nothing they need and implies something failed to load.
     *
     * The section heading is rendered by the caller only when this returns
     * content, so an entity with no statistics simply ends after its honours.
     */
    return null;
  }

  return (
    <div className="space-y-8">
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

      {tables.length > 0 ? (
        tables.map((table) => <RecordTable key={table.heading} table={table} />)
      ) : (
        // The tiles carry no headings of their own, so the section needs one.
        // The tables do carry them, one per format and department, and a
        // "Statistics" heading above those was a second label for the same set.
        <section>
          {populated.length > 0 && (
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Statistics
            </h2>
          )}
          <div className="space-y-6">
            {populated.map((group, index) => (
              <div key={group.discipline?.key ?? `group-${index}`}>
                {/* Named where the group says what it is. Basketball splits a
                    career into regular season and playoffs, and both blocks
                    rendered unlabelled: two identical grids of Games Played,
                    PPG and shooting percentages, one above the other, with
                    nothing to say which was which. The discipline label is
                    already on the group and was simply not being drawn.

                    Only shown when there is more than one group. A single
                    unlabelled block sits under the "Statistics" heading and
                    needs no second one. */}
                {populated.length > 1 && group.discipline && (
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.discipline.label}
                    {group.appearances !== null && (
                      <span className="ml-2 font-normal normal-case tracking-normal">
                        {group.appearances.toLocaleString('en-GB')} games
                      </span>
                    )}
                  </h3>
                )}
                <StatisticGrid statistics={group.statistics} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/**
 * Categories that are context rather than a department of their own.
 *
 * Matches played belongs at the front of every table for the format: it is what
 * a run tally and a wicket tally are both judged against, and it is not a
 * record in itself.
 */
const SHARED_CATEGORIES = new Set(['General']);

/**
 * The departments that get a table, in render order.
 *
 * A fixed list rather than whatever the data happens to carry, because the page
 * promises a batting and a bowling record per format and a third table wedged
 * between them changes what the reader is looking at. Fielding figures are held
 * and are not lost: they belong with the format's own record once there is a
 * fielding table worth the name, rather than as a two-column afterthought.
 */
const TABLE_CATEGORIES = ['Batting', 'Bowling'] as const;

/** One table: a discipline and a category, such as "Test Batting Record". */
interface RecordTableModel {
  heading: string;
  statistics: StatisticValue[];
}

/**
 * Splits grouped statistics into one table per discipline and category.
 *
 * Empty for a sport whose statistics carry no discipline, which is the signal
 * to fall back to tiles. A category is required too: an uncategorised value has
 * no table to belong to, and inventing one would put a heading on the page that
 * nobody wrote.
 *
 * The order is the order the API sent, which is the registry's display order:
 * disciplines by their own, statistics by theirs. So the columns of a batting
 * table are laid out where they are declared rather than here, and a sport can
 * change them without a front-end release.
 *
 * A format the player never played produces no group, and therefore no table.
 * That is the whole reason this is derived rather than fixed: a T20I specialist
 * should not carry an empty Test table, and a player with no bowling figures
 * should not carry a bowling one.
 */
function recordTables(groups: StatisticGroup[]): RecordTableModel[] {
  const tables: RecordTableModel[] = [];

  for (const group of groups) {
    if (!group.discipline) continue;

    // Insertion-ordered, so the categories appear as the registry ordered their
    // statistics rather than alphabetically: batting before bowling, because
    // that is how a scorecard reads.
    const byCategory = new Map<string, StatisticValue[]>();
    const shared: StatisticValue[] = [];

    for (const statistic of group.statistics) {
      // A statistic recorded as nothing is not a statistic. Rendering the key
      // with a dash would claim the player has a record in a department they
      // never appeared in: a batter who never bowled would carry a bowling
      // table of five dashes.
      if (statistic.value === null) continue;

      // "General" is not a department a career is divided into, it is the
      // matches count both departments are read against, and a table of one
      // column headed "Test General Record" is nobody's idea of a record.
      // Prepended to every table for the format instead.
      if (!statistic.category || SHARED_CATEGORIES.has(statistic.category)) {
        shared.push(statistic);
        continue;
      }

      byCategory.set(statistic.category, [
        ...(byCategory.get(statistic.category) ?? []),
        statistic,
      ]);
    }

    for (const category of TABLE_CATEGORIES) {
      const statistics = byCategory.get(category);
      if (!statistics || statistics.length === 0) continue;

      tables.push({
        heading: `${group.discipline.label} ${category} Record`,
        statistics: [...shared, ...statistics],
      });
    }
  }

  return tables;
}

/**
 * One record table.
 *
 * A single row, because these are career totals rather than a season by season
 * breakdown. It is still a table rather than a list of tiles: the labels are
 * the abbreviations a scorecard uses, the numbers align in a column under
 * them, and a reader comparing two formats can scan across.
 */
function RecordTable({ table }: { table: RecordTableModel }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {table.heading}
      </h3>

      {/* Scrolls rather than wraps. Ten columns do not fit a phone, and a
          wrapped header row separates a figure from the label above it, which
          is worse than a scroll for a table whose whole value is the
          alignment. */}
      <div className="scrollbar-thin overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {table.statistics.map((statistic) => (
                <th
                  key={statistic.key}
                  scope="col"
                  // The registry's definition, surfaced on hover, and the full
                  // label as the accessible name: "Avg" is a column heading a
                  // cricket reader knows and a screen reader should not have to
                  // guess at.
                  title={statistic.description ?? undefined}
                  aria-label={statistic.label}
                  className="whitespace-nowrap px-3 py-2 text-left text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {statistic.shortLabel ?? statistic.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {table.statistics.map((statistic) => (
                <td
                  key={statistic.key}
                  className="whitespace-nowrap px-3 py-2.5 font-mono font-semibold tabular-nums"
                >
                  {formatValue(statistic)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** The tile layout, for a sport whose statistics carry no discipline. */
function StatisticGrid({ statistics }: { statistics: StatisticValue[] }) {
  return (
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
  // Already text, and text for a reason: a highest score of "248*" carries the
  // fact that the innings was unbeaten, and a bowling return of "5/32" is two
  // numbers that mean nothing apart.
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
