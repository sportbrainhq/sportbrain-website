import type { Honour } from '@sportbrain/contracts';

/**
 * Whether a competitor is still competing.
 *
 * Rendered only when the data says so. `null` is a real state, not a gap: the
 * evidence for retirement is a career end year, a closed final club spell or a
 * date of death, and where none of those exists the honest answer is silence.
 * A green "Active" on someone who retired twenty years ago is worse than no
 * badge at all, and that is exactly what a default would have produced for the
 * players whose club history we have not ingested.
 */
export function CareerStatusBadge({ status }: { status: 'active' | 'retired' | null }) {
  if (!status) return null;

  const active = status === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider ${
        active
          ? 'border-emerald-600/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
          : 'border-orange-600/30 bg-orange-500/10 text-orange-700 dark:text-orange-400'
      }`}
    >
      {/* A dot rather than colour alone, so the distinction survives for a
          reader who cannot separate green from orange. The word carries the
          meaning; the colour only reinforces it. */}
      <span
        aria-hidden
        className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-orange-500'}`}
      />
      {active ? 'Active' : 'Retired'}
    </span>
  );
}

/**
 * A player's honours, led by what the career is remembered for.
 *
 * The flat list this replaces was ordered by year, so Messi's page opened with
 * a ceremonial award from 2026 and his eight Ballons d'Or were somewhere in the
 * middle. Sorting by prestige is not enough on its own either: a reader
 * scanning thirty identical pills still cannot tell which three matter.
 *
 * So the top tier is given its own row with the count of repeats folded in
 * ("Ballon d'Or ×8"), and everything below it stays a quiet list. Repeats are
 * counted rather than listed because eight separate Ballon d'Or pills crowd out
 * the rest of the career.
 */
export function HonoursPanel({ honours }: { honours: Honour[] }) {
  if (honours.length === 0) return null;

  const major = honours.filter((honour) => honour.prestige === 1);
  const rest = honours.filter((honour) => honour.prestige !== 1);

  return (
    <div className="space-y-4">
      {major.length > 0 && <MajorHonours honours={major} />}

      {rest.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {rest.slice(0, 24).map((honour) => (
            <li
              key={honour.id}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs"
            >
              {honour.title}
              {honour.year && <span className="ml-1.5 text-muted-foreground">{honour.year}</span>}
            </li>
          ))}
          {rest.length > 24 && (
            <li className="px-3 py-1 text-xs text-muted-foreground">and {rest.length - 24} more</li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * Folds an award's historical names into one.
 *
 * The Ballon d'Or and the FIFA World Player of the Year merged in 2010 and
 * separated again in 2016, so Wikidata records Messi's eight under three
 * different titles. Grouped by the raw title the page showed "Ballon d'Or x4"
 * beside "FIFA Ballon d'Or x4", which is the same award counted twice and reads
 * as an error.
 *
 * Only names that are genuinely the same prize are merged. The FIFA World
 * Player of the Year before the merger was a separate award and keeps its own
 * name, which is why the mapping is a short explicit list rather than a rule
 * about stripping prefixes.
 */
function canonicalTitle(title: string): string {
  if (/^(fifa )?ballon d.or$/i.test(title.trim())) return "Ballon d'Or";
  return title;
}

/**
 * The four majors, in calendar order, with the titles the profile has.
 *
 * Tennis is the one sport here with no counting statistic. A footballer has
 * goals, a cricketer runs, a basketball player points; a tennis player has
 * none of those, and the thing their career is actually measured in is Grand
 * Slam titles. So this panel is tennis's headline statistic block, built from
 * the honours rather than from a statistics table, because the majors are
 * honours and duplicating them into a stat row would put the same fact in two
 * places that could then disagree.
 *
 * Calendar order rather than most-won-first, deliberately, and it is the one
 * place in this file that does not sort by count. The four majors are a fixed
 * set played in a fixed order, and a reader scanning for "how did they do at
 * Wimbledon" wants Wimbledon in the same position on every player's page. A
 * count-ordered list moves it, and the zero is as informative as the number:
 * Sampras never won the French, and a panel that omitted it would hide the
 * single most-discussed gap in his career.
 */
const SLAM_ORDER = ['Australian Open', 'French Open', 'Wimbledon', 'US Open'] as const;

export function GrandSlamPanel({ honours }: { honours: Honour[] }) {
  // Singles only. The doubles titles are real and are counted separately by
  // the sport itself: nobody's "23 majors" includes their doubles, and adding
  // the two together would state something tennis does not recognise. The
  // ingester writes doubles as "Wimbledon (doubles)", so the bracket is what
  // separates them.
  const singles = honours.filter(
    (honour) => honour.kind === 'title' && !honour.title.includes('(doubles)'),
  );

  const years = new Map<string, number[]>();
  for (const honour of singles) {
    if (!SLAM_ORDER.includes(honour.title as (typeof SLAM_ORDER)[number])) continue;
    const list = years.get(honour.title) ?? [];
    if (honour.year) list.push(honour.year);
    years.set(honour.title, list);
  }

  const total = SLAM_ORDER.reduce((sum, slam) => sum + (years.get(slam)?.length ?? 0), 0);
  // A player with no majors gets no panel. Most of the catalogue has none, and
  // four zeroes says less than nothing: it implies we checked and they lost.
  if (total === 0) return null;

  const doubles = honours.filter(
    (honour) => honour.kind === 'title' && honour.title.includes('(doubles)'),
  ).length;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Grand Slam titles
      </h2>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-5">
        {SLAM_ORDER.map((slam) => {
          const won = years.get(slam) ?? [];
          return (
            <div key={slam} className="bg-card p-3">
              <p className="text-xs text-muted-foreground">{slam}</p>
              <p
                className={`mt-0.5 font-mono text-2xl font-bold tabular-nums ${
                  won.length === 0 ? 'text-muted-foreground/40' : ''
                }`}
              >
                {won.length}
              </p>
              {won.length > 0 && (
                <p className="mt-1 text-2xs leading-relaxed tabular-nums text-muted-foreground">
                  {[...won].sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>
          );
        })}

        {/* The total last rather than first: the four are what a reader scans,
            and the sum is the number they quote afterwards. */}
        <div className="bg-card p-3">
          <p className="text-xs font-medium">Total</p>
          <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">{total}</p>
          {doubles > 0 && (
            <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
              +{doubles} doubles
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The four men's majors and the five women's, in calendar order.
 *
 * Two sets rather than one, because the tours genuinely differ: the women's
 * game recognises five majors and the men's four, and a single nine-column
 * grid would state that every golfer competes for nine. Which set a player
 * belongs to is decided by where their wins actually are, not by any gender
 * field: a player with a Chevron and an Evian is on the women's tour, and the
 * data says so without the page having to assert it.
 *
 * Calendar order rather than most-won-first, matching `SLAM_ORDER` and for the
 * same reason. A reader scanning for "how did they do at the Masters" wants the
 * Masters in the same position on every page, and the zero is as informative as
 * the number: Arnold Palmer never won a PGA Championship, and that missing leg
 * of the career Grand Slam is among the most-discussed gaps in the sport.
 */
const MENS_MAJORS = [
  'Masters Tournament',
  'PGA Championship',
  'U.S. Open',
  'The Open Championship',
] as const;

const WOMENS_MAJORS = [
  'The Chevron Championship',
  "Women's PGA Championship",
  "U.S. Women's Open",
  "AIG Women's Open",
  'The Evian Championship',
] as const;

/**
 * A golfer's majors, by championship.
 *
 * The golf counterpart of `GrandSlamPanel`, and the same argument applies: the
 * majors are the unit a golf career is measured in, they are honours rather
 * than statistics, and counting them from the honour rows rather than from a
 * stat field keeps one fact in one place.
 *
 * Discontinued majors (the du Maurier Classic, the Titleholders, the Women's
 * Western Open) are counted into the total but get no column of their own. They
 * are real major wins and a total that omitted them would understate a record,
 * and a column for an event abolished in 2000 would be dead space on every
 * other player's page.
 */
export function GolfMajorsPanel({ honours }: { honours: Honour[] }) {
  const titles = honours.filter((honour) => honour.kind === 'title');

  const years = new Map<string, number[]>();
  for (const honour of titles) {
    const list = years.get(honour.title) ?? [];
    if (honour.year) list.push(honour.year);
    years.set(honour.title, list);
  }

  const countFor = (names: readonly string[]) =>
    names.reduce((sum, name) => sum + (years.get(name)?.length ?? 0), 0);

  const mens = countFor(MENS_MAJORS);
  const womens = countFor(WOMENS_MAJORS);

  // A golfer with no majors gets no panel. Most of the catalogue has none, and
  // a row of zeroes says less than nothing: it implies we checked and they
  // lost, where the truth is usually that they never contended.
  if (mens === 0 && womens === 0) return null;

  // Whichever tour the wins are actually on. A player with both (none exist,
  // but the data does not forbid it) is shown the larger set.
  const columns = womens > mens ? WOMENS_MAJORS : MENS_MAJORS;
  const shown = countFor(columns);

  // Majors won at events no longer played, which have no column above.
  const discontinued = titles.filter(
    (honour) =>
      !MENS_MAJORS.includes(honour.title as (typeof MENS_MAJORS)[number]) &&
      !WOMENS_MAJORS.includes(honour.title as (typeof WOMENS_MAJORS)[number]),
  ).length;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Major championships
      </h2>

      <div
        className={`grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border ${
          columns.length === 5 ? 'sm:grid-cols-6' : 'sm:grid-cols-5'
        }`}
      >
        {columns.map((major) => {
          const won = years.get(major) ?? [];
          return (
            <div key={major} className="bg-card p-3">
              <p className="text-xs text-muted-foreground">{major}</p>
              <p
                className={`mt-0.5 font-mono text-2xl font-bold tabular-nums ${
                  won.length === 0 ? 'text-muted-foreground/40' : ''
                }`}
              >
                {won.length}
              </p>
              {won.length > 0 && (
                <p className="mt-1 text-2xs leading-relaxed tabular-nums text-muted-foreground">
                  {[...won].sort((a, b) => a - b).join(', ')}
                </p>
              )}
            </div>
          );
        })}

        {/* The total last rather than first: the columns are what a reader
            scans, and the sum is the number they quote afterwards. */}
        <div className="bg-card p-3">
          <p className="text-xs font-medium">Total</p>
          <p className="mt-0.5 font-mono text-2xl font-bold tabular-nums">{shown + discontinued}</p>
          {discontinued > 0 && (
            <p className="mt-1 text-2xs leading-relaxed text-muted-foreground">
              includes {discontinued} at discontinued majors
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * A golfer's win counts, by tour.
 *
 * The other half of a golf record, and the half the majors panel cannot show.
 * Sam Snead won 82 PGA Tour events and seven majors; a profile showing only the
 * seven describes a different player. This is how golf is actually presented:
 * every tour publishes a career win count, and a player is introduced by their
 * professional total and their major total together.
 *
 * Counts rather than dated wins, because that is what the source states. The
 * individual tournaments behind a 73-win PGA Tour career are not in this
 * catalogue and listing them would be a different feature.
 *
 * Ordered by how a golf profile leads: the professional total, the majors, then
 * the tours in rough order of standing. Anything absent is omitted rather than
 * shown as zero, since a missing count means the article did not state one, not
 * that the player won none.
 */
const WIN_COUNT_ORDER: { key: string; label: string }[] = [
  { key: 'proWins', label: 'Professional wins' },
  { key: 'pgaTourWins', label: 'PGA Tour' },
  { key: 'europeanTourWins', label: 'European Tour' },
  { key: 'lpgaTourWins', label: 'LPGA Tour' },
  { key: 'letWins', label: 'Ladies European Tour' },
  { key: 'japanTourWins', label: 'Japan Golf Tour' },
  { key: 'asianTourWins', label: 'Asian Tour' },
  { key: 'ausTourWins', label: 'PGA Tour of Australasia' },
  { key: 'sunshineTourWins', label: 'Sunshine Tour' },
  { key: 'championsTourWins', label: 'PGA Tour Champions' },
  { key: 'otherWins', label: 'Other wins' },
];

export function GolfRecordPanel({ attributes }: { attributes: Record<string, unknown> }) {
  const counts = WIN_COUNT_ORDER.map((entry) => ({
    ...entry,
    value: typeof attributes[entry.key] === 'number' ? (attributes[entry.key] as number) : null,
  })).filter((entry) => entry.value !== null && entry.value > 0);

  if (counts.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Career wins
      </h2>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
        {counts.map((entry) => (
          <div key={entry.key} className="bg-card p-3">
            <dt className="text-xs text-muted-foreground">{entry.label}</dt>
            <dd className="mt-0.5 font-mono text-xl font-bold tabular-nums">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * A boxer's professional record: wins, losses, draws and stoppages.
 *
 * The one figure a boxing career is actually introduced by. "50-0 (27 KO)"
 * says more about Floyd Mayweather in five characters than any statistics
 * table this catalogue holds for the sport, which is why it renders as a
 * single headline line rather than the grid the other sport-specific panels
 * use: a win-loss record is one fact, not several to compare side by side.
 *
 * Reads `attributes.boxingRecord` rather than a dedicated column. See
 * `boxing-cleanup.ts` for why: it is sport-specific structured data of
 * exactly the kind `attributes` already carries for every other sport, and a
 * column that is null for every other sport in the catalogue is a column in
 * the wrong table.
 */
export function BoxingRecordPanel({ attributes }: { attributes: Record<string, unknown> }) {
  const record = attributes.boxingRecord;
  if (!record || typeof record !== 'object') return null;

  const { wins, losses, draws, koWins, noContests } = record as Record<string, unknown>;
  if (typeof wins !== 'number' || typeof losses !== 'number' || typeof draws !== 'number') {
    return null;
  }

  const koSuffix = typeof koWins === 'number' ? ` (${koWins} KO)` : '';
  const ncSuffix = typeof noContests === 'number' && noContests > 0 ? `, ${noContests} NC` : '';

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Professional record
      </h2>
      <p className="font-mono text-3xl font-black tabular-nums">
        {wins}-{losses}-{draws}
        <span className="ml-2 text-lg font-semibold text-muted-foreground">
          {koSuffix}
          {ncSuffix}
        </span>
      </p>
    </section>
  );
}

/**
 * A boxer's weight division, height, reach and stance.
 *
 * Boxing's version of the profile detail block other sports get from the
 * generic facts grid, pulled into its own panel because `weightDivision` is
 * not one of the profile attributes the generic grid on the player page
 * knows to render specially, and a boxer's division is the first thing a
 * reader wants beside the record above.
 */
export function BoxingDetailsPanel({ attributes }: { attributes: Record<string, unknown> }) {
  const entries = [
    { label: 'Division', value: attributes.weightDivision },
    {
      label: 'Height',
      value: typeof attributes.heightCm === 'number' ? `${attributes.heightCm} cm` : null,
    },
    {
      label: 'Reach',
      value: typeof attributes.reachCm === 'number' ? `${attributes.reachCm} cm` : null,
    },
    { label: 'Stance', value: attributes.stance },
  ].filter(
    (entry): entry is { label: string; value: string } =>
      typeof entry.value === 'string' && entry.value.length > 0,
  );

  if (entries.length === 0) return null;

  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {entries.map((entry) => (
        <div key={entry.label} className="bg-card p-3">
          <dt className="text-xs text-muted-foreground">{entry.label}</dt>
          <dd className="mt-0.5 font-medium">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * The honours that define a career, grouped by title.
 *
 * Given real weight rather than a pill, because these are the reason a reader
 * opened the page. Years are listed alongside the count so the run is legible:
 * eight Ballons d'Or is a fact, and which eight years is the interesting part.
 */
function MajorHonours({ honours }: { honours: Honour[] }) {
  const byTitle = new Map<string, number[]>();
  for (const honour of honours) {
    const title = canonicalTitle(honour.title);
    const years = byTitle.get(title) ?? [];
    if (honour.year) years.push(honour.year);
    byTitle.set(title, years);
  }

  // Most-won first, so the defining achievement leads.
  const grouped = [...byTitle.entries()].sort(
    (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]),
  );

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {grouped.map(([title, years]) => (
        <li
          key={title}
          className="flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            {years.length > 0 && (
              <span className="mt-0.5 block text-2xs tabular-nums text-muted-foreground">
                {[...years].sort((a, b) => b - a).join(', ')}
              </span>
            )}
          </span>
          {years.length > 1 && (
            <span className="shrink-0 font-mono text-sm font-bold tabular-nums">
              ×{years.length}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** One line of a player's career highlights, as stored by the ingest. */
export interface CareerHighlight {
  label: string;
  times: number | null;
}

/**
 * A basketball career as the sport itself summarises it.
 *
 * Replaces the honours list for players who have this, because the list could
 * not answer the question a basketball reader asks. It is built from Wikidata's
 * `P166`, which holds no All-Star selections at all and records every award as a
 * separate dated row, so LeBron James's page ran to nineteen ESPY and BET lines
 * plus a Golden Raspberry for Worst Actor, and never once said he is a 22-time
 * All-Star.
 *
 * These come from the Wikipedia infobox's own `highlights` field, which states
 * counts: "22× NBA All-Star", "4× NBA champion", "4× NBA Most Valuable Player".
 * The order is the article's, which is roughly by prestige with championships
 * first, and is editorial work by people who know the sport.
 *
 * The count leads each row because it is the number a reader is scanning for.
 */
export function CareerHighlights({ highlights }: { highlights: CareerHighlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <ul className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
      {highlights.map((highlight) => (
        <li
          key={`${highlight.times ?? 1}-${highlight.label}`}
          className="flex items-baseline gap-2.5 bg-card px-3 py-2.5 text-sm"
        >
          {/* Fixed-width and tabular, so the counts line up down the column and
              a one-off sits flush with a 22×. */}
          <span className="w-9 shrink-0 text-right font-mono text-xs font-bold tabular-nums text-muted-foreground">
            {highlight.times === null ? '—' : `${highlight.times}×`}
          </span>
          <span className="font-medium leading-snug">{highlight.label}</span>
        </li>
      ))}
    </ul>
  );
}
