import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FactPanel, RankingPanel, SectionPanel } from '@/components/sports/entity-profile';
import {
  CareerHighlights,
  CareerStatusBadge,
  GrandSlamPanel,
  HonoursPanel,
  type CareerHighlight,
} from '@/components/sports/player-profile';
import { Avatar } from '@/components/sports/avatar';
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
  // `careerEnd` is a contract end date for anyone still playing, not a
  // retirement, and 461 active football players carry one. Rendered as "Career
  // End" it read as a retirement date on the page of a player mid-career, so it
  // is shown only once the person is actually retired.
  //
  // `currentClub` goes the same way for a retired player: the provider records
  // the last club someone played for, and the club history below says so
  // properly with its dates.
  //
  // `currentClub` also goes for a sport that says its players do not have one:
  // a cricketer turns out for a national side, a first-class side and one or
  // more franchises at once, so a single box naming one of them is a choice the
  // page has no basis to make. Tendulkar's read "Marylebone Cricket Club".
  const showsCurrentClub =
    player.sport.traits.playersHaveCurrentClub !== false && player.careerStatus !== 'retired';

  // Pulled out of the generic grid: it is a list of objects, and that grid
  // prints only strings and numbers, so it would render as "[object Object]".
  const highlights = Array.isArray(player.attributes.careerHighlights)
    ? (player.attributes.careerHighlights as CareerHighlight[]).filter(
        (entry): entry is CareerHighlight =>
          typeof entry?.label === 'string' &&
          (entry.times === null || typeof entry.times === 'number'),
      )
    : [];

  // Attributes whose fact the panels below already show, so the same value does
  // not appear twice on one page. The fact is the better of the two: it comes
  // from the Wikipedia infobox and is fuller, where the attribute comes from
  // Wikidata and is terser. LeBron carried "Career start 2003" in this grid and
  // again under the facts, and his position twice over as "point forward" here
  // against "Small forward / power forward" there, which read as a
  // contradiction rather than as two sources agreeing.
  const factKeys = new Set(player.profile.facts.map((fact) => fact.key));
  const supersededByFact: Record<string, string> = {
    position: 'position',
    heightCm: 'height',
    careerEnd: 'career_end',
    currentClub: 'current_club',
  };

  // Basketball dates a career by the draft, not by a first appearance, so the
  // draft year is the figure the sport quotes and a career start beside it is
  // noise: LeBron James's profile carried the same 2003 twice. The ingest no
  // longer stores a career-start fact, and this drops the Wikidata attribute
  // that would otherwise take its place in the grid.
  //
  // Suppressed by sport rather than by the presence of a draft-year fact. Only
  // 386 basketball people have that fact ingested while 2,915 carry the
  // attribute, so keying off the fact left the great majority still showing it,
  // Michael Jordan among them, whose 1981 is his college start rather than his
  // 1984 NBA draft.
  const hidden = new Set<string>([
    ...(sportSlug === 'basketball' ? ['careerStart'] : []),
    ...(player.careerStatus === 'active' ? ['careerEnd'] : []),
    ...(showsCurrentClub ? [] : ['currentClub']),
    ...Object.entries(supersededByFact)
      .filter(([, factKey]) => factKeys.has(factKey))
      .map(([attribute]) => attribute),
    'careerHighlights',
  ]);

  // Nickname first, because it identifies the person rather than describing
  // them: a reader scanning this block wants "King James" before a height in
  // centimetres. Everything else keeps the order the attributes arrived in.
  const facts = Object.entries(player.attributes)
    .filter(([key]) => !hidden.has(key))
    .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
    .sort(([a], [b]) => Number(b === 'nickname') - Number(a === 'nickname'))
    .slice(0, 6);

  return (
    <article className="space-y-8">
      <header className="flex flex-wrap items-start gap-4">
        {player.imageUrl && (
          // Through `Avatar` rather than a bare `<img>`: these are Wikimedia
          // `Special:FilePath` URLs, which are `http://` and unsized, so a bare
          // tag renders as a broken image. `object-cover` overrides the crest
          // default, since a player portrait should fill the square.
          <Avatar
            text={player.fullName}
            imageUrl={player.imageUrl}
            size={96}
            className="rounded-lg object-cover"
          />
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Link href={`/sports/${sportSlug}/players`} className="hover:underline">
              {player.sport.name} player
            </Link>
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{player.fullName}</h1>
            <CareerStatusBadge status={player.careerStatus} />
          </div>
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

      <FactPanel facts={player.profile.facts} suppressCurrentClub={!showsCurrentClub} />

      <SectionPanel sections={player.profile.sections} />

      {player.biography && (
        <section>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            About
          </h2>
          <p className="max-w-2xl leading-relaxed">{player.biography}</p>
        </section>
      )}

      {/* Tennis's headline block, and the nearest thing the sport has to the
          goals or points other sports lead with. Rendered above the honours
          list rather than inside it because it answers the first question a
          reader has about a tennis player, and the list below then carries the
          same titles in date order alongside everything else. */}
      <GrandSlamPanel honours={player.honours} />

      {(highlights.length > 0 || player.honours.length > 0) && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Honours
          </h2>
          {/* The sport's own summary wins where we have it. It states counts
              ("22× NBA All-Star") and is ordered by prestige, which the honours
              list cannot do: that list comes from Wikidata's award property,
              which holds no All-Star selections and gives every award its own
              dated row, so it sprawled over thirty lines and buried what the
              career is actually remembered for. The full list is still the
              fallback for players and sports without a highlights field. */}
          {highlights.length > 0 ? (
            <CareerHighlights highlights={highlights} />
          ) : (
            <HonoursPanel honours={player.honours} />
          )}
        </section>
      )}

      {player.teams.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Career
          </h2>
          <ul className="space-y-1.5">
            {player.teams.map((entry, index) => (
              // Keyed by index as well as identity: a club and a start date do
              // not identify a spell, because the same spell can be held twice
              // with different end-date precision (Carragher's Liverpool years
              // end both 2013-01-01 and 2013-12-31). Role and end date are in
              // the database's own unique index and would be enough here, but
              // the index keeps the key stable even if a further duplicate slips
              // through, since a duplicate key breaks rendering outright.
              <li
                key={`${entry.team.id}-${entry.role ?? ''}-${entry.startDate ?? ''}-${entry.endDate ?? ''}-${index}`}
                className="flex gap-3 text-sm"
              >
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

      <RankingPanel rankings={player.profile.rankings} sportSlug={sportSlug} />

      {/* No "Statistics" heading of its own. Where a career divides into formats
          the panel renders a titled table per format and department, and a
          heading above them was a second label for the same thing. */}
      <StatisticsPanel groups={player.statistics} summary={player.careerSummary} />
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
