import type { Metadata } from 'next';
import { PlayerCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
import { EntitySearch } from '@/components/sports/entity-search';
import { fetchPlayers, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const [{ sport: slug }, query] = await Promise.all([params, searchParams]);

  // A search result is not a page worth indexing, and letting a crawler index
  // one URL per query is how a listing turns into thousands of near-duplicates.
  return buildMetadata({
    title: query.q ? `Players matching "${query.q}"` : 'Players',
    path: `/sports/${slug}/players`,
    noIndex: Boolean(query.q),
  });
}

export default async function PlayersPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const [{ sport: slug }, query] = await Promise.all([params, searchParams]);
  const page = Number.parseInt(query.page ?? '1', 10) || 1;

  // Trimmed and length-capped before it reaches the API. The term becomes a
  // LIKE pattern, so an unbounded string is a cheap way to make the database
  // scan every row for nothing.
  const term = (query.q ?? '').trim().slice(0, 80);

  const [sport, result] = await Promise.all([
    fetchSport(slug),
    fetchPlayers(slug, { page, limit: 24, ...(term ? { q: term } : {}) }),
  ]);

  return (
    <EntityListShell
      title={`${sport.name} players`}
      pagination={result.pagination}
      // Carried into the pagination links, so page two of a search is still
      // that search rather than the unfiltered list.
      basePath={`/sports/${slug}/players${term ? `?q=${encodeURIComponent(term)}` : ''}`}
      search={
        <EntitySearch
          basePath={`/sports/${slug}/players`}
          initialValue={term}
          placeholder="Search players"
        />
      }
      emptyMessage={term ? `No players match “${term}”.` : undefined}
    >
      {result.data.map((item) => (
        <PlayerCard key={item.id} sportSlug={slug} player={item} />
      ))}
    </EntityListShell>
  );
}
