import Link from 'next/link';
import type { CompetitionSummary, PlayerSummary, TeamSummary } from '@sportbrain/contracts';
import { Avatar } from '@/components/sports/avatar';

/**
 * Cards for the list views.
 *
 * Three variants rather than one generic component, because the meaningful
 * secondary line differs: a team shows country and founding year, a player
 * shows nationality and position, a competition shows its kind. A single card
 * taking a props bag would hide that difference behind conditionals.
 */

const cardClass =
  'flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-muted/50';

export function TeamCard({ sportSlug, team }: { sportSlug: string; team: TeamSummary }) {
  return (
    <Link href={`/sports/${sportSlug}/teams/${team.slug}`} className={cardClass}>
      <Avatar text={team.name} imageUrl={team.logoUrl} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{team.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{teamSubtitle(team)}</span>
      </span>
    </Link>
  );
}

/**
 * The card's secondary line.
 *
 * Differs by kind, because the useful identifier does. A national side is
 * identified by its country; a county or state side by the country it plays
 * in; a franchise by its **abbreviation**, which is how the team is actually
 * referred to. "India · 2008" told a reader nothing that distinguished Punjab
 * Kings from four other 2008 IPL sides, and the founding year of a franchise is
 * closer to trivia than to identification.
 *
 * Falls back to country where no abbreviation is recorded, and to the kind
 * label rather than a bare "Team", so an unlabelled card still says something.
 */
function teamSubtitle(team: TeamSummary): string {
  if (team.kind === 'franchise') {
    // Only an abbreviation, and only a real one: a "short name" as long as the
    // name itself is not an abbreviation and helps nobody.
    const abbreviation =
      team.shortName && team.shortName.length <= 6 && team.shortName !== team.name
        ? team.shortName
        : null;
    return abbreviation ?? team.country ?? 'Franchise';
  }

  return (
    [team.country, team.foundedYear].filter(Boolean).join(' · ') || KIND_LABELS[team.kind] || 'Team'
  );
}

/** Human labels for the team kinds, for the fallback line. */
const KIND_LABELS: Record<string, string> = {
  international: 'International',
  representative: 'Domestic',
  franchise: 'Franchise',
  club: 'Club',
  development: 'Age-group',
  invitational: 'Invitational',
};

export function PlayerCard({ sportSlug, player }: { sportSlug: string; player: PlayerSummary }) {
  // Position lives in `attributes` because it means different things per sport
  // and is absent in several. Read defensively.
  const position =
    typeof player.attributes.position === 'string' ? player.attributes.position : null;

  // A count of the sport's biggest prize, where the sport has one and the
  // player has won it. Golf states it as `majorWins`, and it is the single most
  // useful thing a golf card can say: a list of names with nothing but a
  // nationality gives a reader no way to tell Jack Nicklaus from a club
  // professional. Read defensively, and absent for every sport that does not
  // set it.
  const majors =
    typeof player.attributes.majorWins === 'number' && player.attributes.majorWins > 0
      ? player.attributes.majorWins
      : null;

  const detail =
    [player.nationality, position, majors ? `${majors} major${majors === 1 ? '' : 's'}` : null]
      .filter(Boolean)
      .join(' · ') || 'Player';

  return (
    <Link href={`/sports/${sportSlug}/players/${player.slug}`} className={cardClass}>
      <Avatar text={player.fullName} imageUrl={player.imageUrl} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="truncate font-medium">{player.displayName ?? player.fullName}</span>
          <CareerStatusDot status={player.careerStatus} />
        </span>
        <span className="block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </Link>
  );
}

/**
 * The active/retired marker for a listing card.
 *
 * A dot rather than the full `CareerStatusBadge` used on a profile: a card is
 * one line of a grid of twenty-four, and a pill reading "RETIRED" beside every
 * name would dominate the listing and push the name itself to a truncation.
 *
 * The colour is not the message. It carries a `title` and a visually hidden
 * word, so the state is available to a screen reader and on hover, and a reader
 * who cannot separate green from orange loses nothing that the page depends on:
 * the status is a useful annotation here, not the reason to click.
 */
function CareerStatusDot({ status }: { status: 'active' | 'retired' | null }) {
  if (!status) return null;

  const active = status === 'active';

  return (
    <span
      title={active ? 'Active' : 'Retired'}
      className={`size-1.5 shrink-0 rounded-full ${active ? 'bg-emerald-500' : 'bg-orange-400'}`}
    >
      <span className="sr-only">{active ? 'Active' : 'Retired'}</span>
    </span>
  );
}

export function CompetitionCard({
  sportSlug,
  competition,
}: {
  sportSlug: string;
  competition: CompetitionSummary;
}) {
  return (
    <Link href={`/sports/${sportSlug}/competitions/${competition.slug}`} className={cardClass}>
      <Avatar text={competition.name} imageUrl={competition.logoUrl} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{competition.name}</span>
        <span className="block truncate text-xs capitalize text-muted-foreground">
          {[competition.kind, competition.country].filter(Boolean).join(' · ')}
        </span>
      </span>
    </Link>
  );
}

/** Trophies and awards, shown above the statistics on an entity page. */
export function HonoursList({
  honours,
}: {
  honours: { id: string; title: string; year: number | null }[];
}) {
  if (honours.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {honours.slice(0, 24).map((honour) => (
        <li key={honour.id} className="rounded-full border border-border bg-card px-3 py-1 text-xs">
          {honour.title}
          {honour.year && <span className="ml-1.5 text-muted-foreground">{honour.year}</span>}
        </li>
      ))}
      {honours.length > 24 && (
        <li className="px-3 py-1 text-xs text-muted-foreground">and {honours.length - 24} more</li>
      )}
    </ul>
  );
}
