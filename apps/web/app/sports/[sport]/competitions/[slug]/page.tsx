import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, fetchCompetition } from '@/lib/api';
import { buildMetadata } from '@/lib/seo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}): Promise<Metadata> {
  const { sport, slug } = await params;
  try {
    const competition = await fetchCompetition(sport, slug);
    return buildMetadata({
      title: competition.name,
      description: `${competition.name}: records, seasons and statistics.`,
      path: `/sports/${sport}/competitions/${slug}`,
    });
  } catch {
    return buildMetadata({ title: 'Competition', path: `/sports/${sport}/competitions/${slug}` });
  }
}

export default async function CompetitionPage({
  params,
}: {
  params: Promise<{ sport: string; slug: string }>;
}) {
  const { sport: sportSlug, slug } = await params;

  let competition;
  try {
    competition = await fetchCompetition(sportSlug, slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <article className="space-y-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Link href={`/sports/${sportSlug}/competitions`} className="hover:underline">
            {competition.sport.name}
          </Link>
          <span className="ml-2 capitalize">
            {competition.kind} {competition.format.replace('_', ' ')}
          </span>
        </p>
        <h1 className="mt-1.5 text-3xl font-black tracking-tight sm:text-4xl">
          {competition.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {[competition.country, competition.foundedYear && `since ${competition.foundedYear}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {competition.about && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="max-w-2xl leading-relaxed">{competition.about}</p>
        </section>
      )}

      {competition.records.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Records
          </h2>
          <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
            {competition.records.map((record) => (
              <div key={record.statKey} className="bg-card p-4">
                <dt className="text-xs text-muted-foreground">{record.label}</dt>
                <dd className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-xl font-bold tabular-nums">
                    {record.value?.toLocaleString('en-GB') ?? '—'}
                  </span>
                  {/* A record may be held by a person, a team, or nobody: a
                      plain aggregate such as "matches played" has no holder. */}
                  {record.holder && (
                    <Link
                      href={`/sports/${sportSlug}/${
                        record.holder.type === 'person' ? 'players' : 'teams'
                      }/${record.holder.slug}`}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {record.holder.name}
                    </Link>
                  )}
                </dd>
                {record.note && <p className="mt-1 text-xs text-muted-foreground">{record.note}</p>}
              </div>
            ))}
          </dl>
        </section>
      )}

      {competition.seasons.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Seasons
          </h2>
          <ul className="flex flex-wrap gap-2">
            {competition.seasons.map((season) => (
              <li
                key={season.id}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs"
              >
                {season.label}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
