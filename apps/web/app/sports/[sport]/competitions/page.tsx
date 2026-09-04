import Link from 'next/link';
import type { Metadata } from 'next';
import { CompetitionCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
import { EntitySearch } from '@/components/sports/entity-search';
import { fetchCompetitions, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  return buildMetadata({ title: 'Competitions', path: `/sports/${slug}/competitions` });
}

/**
 * Joins the filter and the search term into one query string.
 *
 * Both have to survive each other: switching to Leagues while searching should
 * keep the search, and paging through a search should keep the filter.
 */
function buildQuery(parts: { kind?: string; q?: string }): string {
  const search = new URLSearchParams();
  if (parts.kind) search.set('kind', parts.kind);
  if (parts.q) search.set('q', parts.q);
  const rendered = search.toString();
  return rendered ? `?${rendered}` : '';
}

/**
 * The groupings a reader can filter by.
 *
 * The split is club football against national-team football, which is the
 * distinction a reader is actually making. "Leagues" therefore holds the
 * continental club cups as well as the domestic leagues: the Champions League
 * is contested by the same clubs as La Liga, so it belongs beside them rather
 * than beside the World Cup. The API expands each group across the stored
 * kinds rather than matching a single value.
 */
const KINDS = [
  { value: '', label: 'All' },
  { value: 'international', label: 'International' },
  { value: 'league', label: 'Leagues' },
] as const;

export default async function CompetitionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ page?: string; kind?: string; q?: string }>;
}) {
  const [{ sport: slug }, query] = await Promise.all([params, searchParams]);
  const page = Number.parseInt(query.page ?? '1', 10) || 1;

  // Validated against the known list rather than passed through, so a
  // hand-typed value cannot reach the API as a filter it does not recognise.
  const kind = KINDS.some((entry) => entry.value === query.kind) ? (query.kind ?? '') : '';
  const term = (query.q ?? '').trim().slice(0, 80);

  const [sport, result, ...kindCounts] = await Promise.all([
    fetchSport(slug),
    fetchCompetitions(slug, {
      page,
      limit: 24,
      ...(kind ? { kind } : {}),
      ...(term ? { q: term } : {}),
    }),
    // One count per filter, so a tab that holds nothing for this sport (MMA
    // has no international competitions once curated to the UFC alone) can be
    // hidden rather than offered and then found empty. Mirrors the teams page.
    ...KINDS.filter((entry) => entry.value).map((entry) =>
      fetchCompetitions(slug, { page: 1, limit: 1, kind: entry.value }).catch(() => null),
    ),
  ]);

  // A tab survives if it holds anything, or if it is the one currently
  // selected: a filter reached by URL must render its own empty state rather
  // than silently losing its tab.
  const filterableKinds = KINDS.filter((entry) => {
    if (!entry.value) return true;
    const index = KINDS.filter((candidate) => candidate.value).indexOf(entry);
    const total = kindCounts[index]?.pagination.total ?? 0;
    return total > 0 || entry.value === kind;
  });

  const title =
    kind === 'international'
      ? `${sport.name} international competitions`
      : kind === 'league'
        ? `${sport.name} leagues and club cups`
        : `${sport.name} competitions`;

  return (
    <EntityListShell
      title={title}
      pagination={result.pagination}
      // Carried into the pagination links, so page two of the leagues list is
      // still the leagues list.
      basePath={`/sports/${slug}/competitions${buildQuery({ kind, q: term })}`}
      search={
        <EntitySearch
          basePath={`/sports/${slug}/competitions${kind ? `?kind=${kind}` : ''}`}
          initialValue={term}
          placeholder="Search competitions"
        />
      }
      emptyMessage={term ? `No competitions match “${term}”.` : undefined}
      toolbar={
        <nav aria-label="Filter competitions" className="flex gap-1">
          {filterableKinds.map((entry) => {
            const isActive = entry.value === kind;
            return (
              <Link
                key={entry.value || 'all'}
                href={`/sports/${slug}/competitions${buildQuery({ kind: entry.value, q: term })}`}
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
        <CompetitionCard key={item.id} sportSlug={slug} competition={item} />
      ))}
    </EntityListShell>
  );
}
