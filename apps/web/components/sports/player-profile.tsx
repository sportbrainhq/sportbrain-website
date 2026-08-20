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
