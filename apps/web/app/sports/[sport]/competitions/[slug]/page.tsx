import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FactPanel, RankingPanel, SectionPanel } from '@/components/sports/entity-profile';
import { Avatar } from '@/components/sports/avatar';
import { NewsList } from '@/components/news/news-list';
import { ApiError, fetchCompetition, fetchNews } from '@/lib/api';
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

  // News is supplementary to the competition's record, not its subject, so a
  // failed fetch degrades to an empty list rather than failing the whole page.
  const news = await fetchNews({ competition: slug, limit: 6 }).then(
    (result) => result.data,
    () => [],
  );

  // `continental` is accurate in the schema and means nothing to a reader: the
  // Champions League is a club competition played across Europe, not a
  // "continental" one.
  const competitionType =
    competition.kind === 'continental'
      ? 'International club'
      : competition.kind === 'international'
        ? 'International'
        : 'Domestic league';

  const hasRankings = competition.profile.rankings.some((r) => r.entries.length > 0);
  const hasDetail =
    hasRankings ||
    competition.records.length > 0 ||
    competition.seasons.length > 0 ||
    competition.profile.facts.length > 0 ||
    competition.profile.sections.length > 0 ||
    Boolean(competition.about);

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        {/* `object-contain` rather than the crest default: a competition logo is
            usually a wordmark, and cropping one to a square cuts the name in
            half. */}
        {competition.logoUrl && (
          <Avatar
            text={competition.name}
            imageUrl={competition.logoUrl}
            size={80}
            className="rounded-lg object-contain"
          />
        )}
        <div className="min-w-0">
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
        </div>
      </header>

      {/* The competition's own columns, rendered as facts.
          `profile.facts` is enrichment's output and is empty for most
          competitions, which left pages showing a heading and nothing else even
          though the row itself carried a type, a country and a founding year.
          These come from the competition record rather than a provider, so they
          are present whenever the competition is. */}
      <dl className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Type', value: competitionType },
          { label: 'Format', value: competition.format.replace('_', ' ') },
          { label: 'Country', value: competition.country },
          { label: 'Founded', value: competition.foundedYear?.toString() ?? null },
        ]
          .filter((fact) => fact.value)
          .map((fact) => (
            <div key={fact.label} className="bg-card p-4">
              <dt className="text-xs text-muted-foreground">{fact.label}</dt>
              <dd className="mt-1 font-medium capitalize">{fact.value}</dd>
            </div>
          ))}
      </dl>

      <FactPanel facts={competition.profile.facts} />

      <SectionPanel sections={competition.profile.sections} />

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

      <RankingPanel rankings={competition.profile.rankings} sportSlug={sportSlug} />

      {/* An honest empty state. Winners and records come from enrichment, which
          has not reached every competition, and a page that simply stops after
          the header reads as broken rather than as incomplete. */}
      {!hasDetail && (
        <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
          We do not have the honours or records for this competition yet.
        </p>
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

      <NewsList
        heading={`Latest ${competition.name} News`}
        articles={news}
        emptyMessage={`No news yet for ${competition.name}, check back soon.`}
      />
    </article>
  );
}
