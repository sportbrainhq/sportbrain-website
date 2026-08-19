import type { Metadata } from 'next';
import { TeamCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
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

export default async function TeamsPage({
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
    fetchTeams(slug, { page, limit: 24 }),
  ]);

  return (
    <EntityListShell
      title={`${sport.name} teams`}
      pagination={result.pagination}
      basePath={`/sports/${slug}/teams`}
    >
      {result.data.map((item) => (
        <TeamCard key={item.id} sportSlug={slug} team={item} />
      ))}
    </EntityListShell>
  );
}
