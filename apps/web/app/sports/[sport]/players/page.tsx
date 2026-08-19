import type { Metadata } from 'next';
import { PlayerCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
import { fetchPlayers, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  return buildMetadata({ title: 'Players', path: `/sports/${slug}/players` });
}

export default async function PlayersPage({
  params,
  searchParams,
}: {
  params: Promise<{ sport: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const [{ sport: slug }, query] = await Promise.all([params, searchParams]);
  const page = Number.parseInt(query.page ?? '1', 10) || 1;

  const [sport, result] = await Promise.all([
    fetchSport(slug),
    fetchPlayers(slug, { page, limit: 24 }),
  ]);

  return (
    <EntityListShell
      title={`${sport.name} players`}
      pagination={result.pagination}
      basePath={`/sports/${slug}/players`}
    >
      {result.data.map((item) => (
        <PlayerCard key={item.id} sportSlug={slug} player={item} />
      ))}
    </EntityListShell>
  );
}
