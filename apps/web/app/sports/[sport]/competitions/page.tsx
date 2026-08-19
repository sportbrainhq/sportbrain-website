import type { Metadata } from 'next';
import { CompetitionCard } from '@/components/sports/entity-card';
import { EntityListShell } from '@/components/sports/entity-list';
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

export default async function CompetitionsPage({
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
    fetchCompetitions(slug, { page, limit: 24 }),
  ]);

  return (
    <EntityListShell
      title={`${sport.name} competitions`}
      pagination={result.pagination}
      basePath={`/sports/${slug}/competitions`}
    >
      {result.data.map((item) => (
        <CompetitionCard key={item.id} sportSlug={slug} competition={item} />
      ))}
    </EntityListShell>
  );
}
