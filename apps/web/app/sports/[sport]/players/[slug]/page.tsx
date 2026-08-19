import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FactPanel, RankingPanel, SectionPanel } from '@/components/sports/entity-profile';
import { HonoursList } from '@/components/sports/entity-card';
import { StatisticsPanel } from '@/components/sports/statistics-panel';
import { ApiError, fetchPlayer } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  try {
    const player = await fetchPlayer(sport, slug);
    return buildMetadata({
      title: player.fullName,
      description: `${player.fullName}: career, honours and statistics.`,
      path: `/sports/${sport}/players/${slug}`,
    });
  } catch {
    return buildMetadata({ title: 'Player', path: `/sports/${sport}/players/${slug}` });
  }
}

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}) {
  const { sport: sportSlug, slug } = await params;

  let player;
  try {
    player = await fetchPlayer(sportSlug, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  // Only strings are rendered: `attributes` is an open JSONB payload and a
  // nested object would render as "[object Object]".
  const facts = Object.entries(player.attributes)
    .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
    .slice(0, 6);

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        {player.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- third-party host, see entity-card
          <img src={player.imageUrl} alt="" className="size-24 rounded-lg object-cover" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Link href={`/sports/${sportSlug}/players`} className="hover:underline">
              {player.sport.name} player
            </Link>
          </p>
          <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
            {player.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[player.nationality, player.dateOfBirth && `born ${formatDate(player.dateOfBirth)}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </header>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {facts.map(([key, value]) => (
            <div key={key} className="bg-card p-3">
              <dt className="text-xs capitalize text-muted-foreground">{humanise(key)}</dt>
              <dd className="mt-0.5 font-medium">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <FactPanel facts={player.profile.facts} />

      <SectionPanel sections={player.profile.sections} />

      {player.biography && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="max-w-2xl leading-relaxed">{player.biography}</p>
        </section>
      )}

      {player.honours.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Honours
          </h2>
          <HonoursList honours={player.honours} />
        </section>
      )}

      {player.teams.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Career
          </h2>
          <ul className="space-y-1.5">
            {player.teams.map((entry) => (
              <li key={`${entry.team.id}-${entry.startDate ?? ''}`} className="flex gap-3 text-sm">
                <Link
                  href={`/sports/${sportSlug}/teams/${entry.team.slug}`}
                  className="font-medium hover:underline"
                >
                  {entry.team.name}
                </Link>
                <span className="text-muted-foreground">
                  {[entry.startDate?.slice(0, 4), entry.endDate?.slice(0, 4) ?? 'present']
                    .filter(Boolean)
                    .join('–')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <RankingPanel rankings={player.profile.rankings} />

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Statistics
        </h2>
        <StatisticsPanel groups={player.statistics} />
      </section>
    </article>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** `heightCm` becomes "height cm". Good enough for an open attribute bag. */
function humanise(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').toLowerCase();
}
