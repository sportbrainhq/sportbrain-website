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
 * Only `club` and `international` are offered, because those are the two
 * groupings that mean something to a reader looking at football: everything
 * else in the enum (`franchise`, `invitational`) belongs to other sports and
 * would appear as an empty tab here.
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
  { value: 'club', label: 'Clubs' },
  { value: 'international', label: 'International' },
] as const;

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

  const [sport, result] = await Promise.all([
    fetchSport(slug),
    fetchTeams(slug, { page, limit: 24, ...(kind ? { kind } : {}), ...(term ? { q: term } : {}) }),
  ]);

  const title =
    kind === 'club'
      ? `${sport.name} clubs`
      : kind === 'international'
        ? `${sport.name} international teams`
        : `${sport.name} teams`;

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
        <nav aria-label="Filter teams" className="flex gap-1">
          {KINDS.map((entry) => {
            const isActive = entry.value === kind;
            return (
              <Link
                key={entry.value || 'all'}
                href={`/sports/${slug}/teams${buildQuery({ kind: entry.value, q: term })}`}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground/20 hover:bg-muted/50'
                }`}
              >
                {entry.label}
              </Link>
            );
          })}
        </nav>
      }
    >
      {result.data.map((item) => (
        <TeamCard key={item.id} sportSlug={slug} team={item} />
      ))}
    </EntityListShell>
  );
}
