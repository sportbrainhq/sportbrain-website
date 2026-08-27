import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FactPanel, RankingPanel, SectionPanel } from '@/components/sports/entity-profile';
import { HonoursList } from '@/components/sports/entity-card';
import { ApiError, fetchTeam } from '@/lib/api';
import { Avatar } from '@/components/sports/avatar';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  try {
    const team = await fetchTeam(sport, slug);
    return buildMetadata({
      title: team.name,
      description: `${team.name}: honours, squad and statistics.`,
      path: `/sports/${sport}/teams/${slug}`,
    });
  } catch {
    return buildMetadata({ title: 'Team', path: `/sports/${sport}/teams/${slug}` });
  }
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}) {
  const { sport: sportSlug, slug } = await params;

  let team;
  try {
    team = await fetchTeam(sportSlug, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        {team.logoUrl && (
          <Avatar text={team.name} imageUrl={team.logoUrl} size={80} className="rounded-lg" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Link href={`/sports/${sportSlug}/teams`} className="hover:underline">
              {team.sport.name}
            </Link>
            <span className="ml-2 capitalize">{team.kind}</span>
          </p>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">{team.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[team.country, team.foundedYear && `founded ${team.foundedYear}`]
              .filter(Boolean)
              .join(' · ')}
            {/* Defunct clubs stay in the archive rather than being deleted, so
                the page has to say so. */}
            {!team.isActive && <span className="ml-2 text-muted-foreground">· defunct</span>}
          </p>
        </div>
      </header>

      <FactPanel facts={team.profile.facts} />

      <SectionPanel sections={team.profile.sections} />

      {team.about && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="max-w-2xl leading-relaxed">{team.about}</p>
        </section>
      )}

      {team.honours.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Honours
          </h2>
          <HonoursList honours={team.honours} />
        </section>
      )}

      <RankingPanel rankings={team.profile.rankings} sportSlug={sportSlug} />
    </article>
  );
}
