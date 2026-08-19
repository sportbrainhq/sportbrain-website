import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiError, fetchSport } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string }>;
}): Promise<Metadata> {
  const { sport: slug } = await params;
  try {
    const sport = await fetchSport(slug);
    return buildMetadata({
      title: sport.name,
      description:
        sport.summary ??
        `${sport.name} teams, players, competitions and statistics on SportBrainHQ.`,
      path: `/sports/${slug}`,
    });
  } catch {
    // Metadata must never throw: it would fail the whole route before the page
    // has a chance to render its own 404.
    return buildMetadata({ title: 'Sport', path: `/sports/${slug}` });
  }
}

/** A sport's Overview tab: what is here, and how much of it. */
export default async function SportOverviewPage({
  params,
}: {
  params: Promise<{ sport: string }>;
}) {
  const { sport: slug } = await params;

  let sport;
  try {
    sport = await fetchSport(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const tiles = [
    { label: 'Teams', value: sport.counts.teams, href: `/sports/${slug}/teams` },
    { label: 'Players', value: sport.counts.players, href: `/sports/${slug}/players` },
    {
      label: 'Competitions',
      value: sport.counts.competitions,
      href: `/sports/${slug}/competitions`,
    },
  ].filter((tile) => tile.value > 0);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Sport
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{sport.name}</h1>
        {sport.summary && <p className="mt-3 max-w-2xl text-muted-foreground">{sport.summary}</p>}
      </header>

      {tiles.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <Link
              key={tile.label}
              href={tile.href}
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/20 hover:bg-muted/50"
            >
              <p className="font-mono text-2xl font-bold tabular-nums">
                {tile.value.toLocaleString('en-GB')}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">{tile.label}</p>
            </Link>
          ))}
        </div>
      )}

      {/* Named honestly. These sections are planned and unbuilt, and saying so
          is better than a tab that leads nowhere. */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Coming soon
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explainers, quizzes and stories for {sport.name} are not written yet.
        </p>
      </section>
    </div>
  );
}
