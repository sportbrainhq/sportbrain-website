import Link from 'next/link';
import type { Metadata } from 'next';
import { TeamCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
import { EntitySearch } from '@/components/sports/entity-search';
import { fetchTeams, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  return buildMetadata({ title: 'Teams', path: `/sports/${slug}/teams` });
}

/**
 * The kinds a reader can filter by.
 *
 * Every kind a sport actually uses is offered, because a kind with no tab is a
 * set of teams no reader can reach. That was a real defect rather than a
 * theoretical one: cricket's 269 franchises, including every IPL side, and its
 * 329 state and county sides belonged to no tab, so the listing showed 956
 * teams while its two filters totalled 367 and the IPL was invisible.
 *
 * Tabs whose kind holds nothing for the current sport are hidden rather than
 * rendered empty, which is what lets one list serve football (clubs and
 * internationals) and cricket (five kinds) without per-sport branching here.
 */
/**
 * Joins the filter and the search term into one query string.
 *
 * Both have to survive each other: switching to Clubs while searching should
 * keep the search, and paging through a search should keep the filter.
 */
function buildQuery(parts: { kind?: string; q?: string }): string {
  const search = new URLSearchParams();
  if (parts.kind) search.set('kind', parts.kind);
  if (parts.q) search.set('q', parts.q);
  const rendered = search.toString();
  return rendered ? `?${rendered}` : '';
}

const KINDS = [
  { value: '', label: 'All' },
  { value: 'international', label: 'International' },
  // Ordered to match the Overview's International / Domestic / Franchise
  // explanation, so the vocabulary a reader met there still applies here.
  { value: 'representative', label: 'Domestic' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'club', label: 'Clubs' },
  { value: 'development', label: 'Age-group' },
] as const;

/** Headings per kind. Keyed rather than nested ternaries, which did not scale. */
const KIND_TITLES: Record<string, (sport: string) => string> = {
  international: (sport) => `${sport} international teams`,
  representative: (sport) => `${sport} domestic teams`,
  franchise: (sport) => `${sport} franchise teams`,
  club: (sport) => `${sport} clubs`,
  development: (sport) => `${sport} age-group teams`,
};

/**
 * Per-sport wording for a kind, where the generic word is wrong for the sport.
 *
 * Basketball is the case this exists for. Its sides are stored as `club`,
 * because that is the least wrong default for a mixed set and because Real
 * Madrid Baloncesto, FC Barcelona Bàsquet and Panathinaikos genuinely are member
 * clubs. But the tab is overwhelmingly NBA and WNBA, and those are franchises in
 * the sense `team_kind` defines: sides created for and owned within a
 * competition. A reader looking at a list headed by the Lakers and the Bulls
 * does not read "Clubs".
 *
 * Presentation only, deliberately. Relabelling here keeps one honest `kind` in
 * the database and avoids asserting that Barcelona is a franchise, which
 * reclassifying the rows would have done. If the NBA and WNBA sides are ever
 * reclassified to `franchise` properly, this override becomes redundant and
 * should go rather than be extended.
 */
const KIND_LABEL_OVERRIDES: Record<string, Record<string, string>> = {
  basketball: { club: 'Franchises' },
};

/** Per-sport heading overrides, mirroring `KIND_LABEL_OVERRIDES`. */
const KIND_TITLE_OVERRIDES: Record<string, Record<string, (sport: string) => string>> = {
  basketball: { club: (sport) => `${sport} franchises` },
};

/**
 * A sport's teams.
 *
 * Split by kind, because a flat list mixes Barcelona with Brazil and the two
 * are not comparable: one has a founding year and a league, the other plays a
 * handful of matches a year and belongs to a confederation. Presenting them
 * interleaved makes the list harder to scan than either half would be alone.
 *
 * The filter lives in the URL rather than in component state, so a filtered
 * list can be linked to, survives a refresh, and is rendered on the server like
 * every other listing.
 */
export default async function TeamsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ page?: string; kind?: string; q?: string }>;
}) {
  const [{ sport: slug }, query] = await Promise.all([params, searchParams]);
  const page = Number.parseInt(query.page ?? '1', 10) || 1;

  // Validated against the known list rather than passed through, so a hand-typed
  // value cannot reach the API as a filter it does not recognise.
  const kind = KINDS.some((entry) => entry.value === query.kind) ? (query.kind ?? '') : '';
  const term = (query.q ?? '').trim().slice(0, 80);

  const [sport, result, ...kindCounts] = await Promise.all([
    fetchSport(slug),
    fetchTeams(slug, { page, limit: 24, ...(kind ? { kind } : {}), ...(term ? { q: term } : {}) }),
    // One count per filter, so a tab that holds nothing for this sport can be
    // hidden rather than offered and then found empty. Asked for a single row
    // each: only `pagination.total` is read, and requesting 24 teams to count
    // them would fetch six pages of cards nobody renders.
    //
    // Six small parallel requests rather than a new endpoint. They are cached
    // by the same tags as the listing itself, so a repeat view costs nothing,
    // and the alternative was a per-kind aggregate on the sport payload that
    // every other page would carry without using.
    ...KINDS.filter((entry) => entry.value).map((entry) =>
      fetchTeams(slug, { page: 1, limit: 1, kind: entry.value }).catch(() => null),
    ),
  ]);

  // A tab survives if it holds anything, or if it is the one currently
  // selected: a filter reached by URL must render its own empty state rather
  // than silently losing its tab.
  const filterable = KINDS.filter((entry) => {
    if (!entry.value) return true;
    const index = KINDS.filter((candidate) => candidate.value).indexOf(entry);
    const total = kindCounts[index]?.pagination.total ?? 0;
    return total > 0 || entry.value === kind;
  });

  const title = (
    KIND_TITLE_OVERRIDES[slug]?.[kind] ??
    KIND_TITLES[kind] ??
    ((name: string) => `${name} teams`)
  )(sport.name);

  return (
    <EntityListShell
      title={title}
      pagination={result.pagination}
      // Carried into the pagination links, so page two of the clubs list is
      // still the clubs list.
      basePath={`/sports/${slug}/teams${buildQuery({ kind, q: term })}`}
      search={
        <EntitySearch
          basePath={`/sports/${slug}/teams${kind ? `?kind=${kind}` : ''}`}
          initialValue={term}
          placeholder="Search teams"
        />
      }
      emptyMessage={term ? `No teams match \u201c${term}\u201d.` : undefined}
      toolbar={
        // Scrolls rather than wraps, and every pill is a single line.
        // `flex-wrap` put "Age-group" on two lines and stretched that one pill
        // taller than its neighbours, which is what made the row look broken.
        <nav aria-label="Filter teams" className="scrollbar-thin -mx-1 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-1.5 px-1 py-0.5">
            {filterable.map((entry) => {
              const isActive = entry.value === kind;
              return (
                <li key={entry.value || 'all'}>
                  <Link
                    href={`/sports/${slug}/teams${buildQuery({ kind: entry.value, q: term })}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium leading-5 transition-colors ${
                      isActive
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/50'
                    }`}
                  >
                    {KIND_LABEL_OVERRIDES[slug]?.[entry.value] ?? entry.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      }
    >
      {result.data.map((item) => (
        <TeamCard key={item.id} sportSlug={slug} team={item} />
      ))}
    </EntityListShell>
  );
}
