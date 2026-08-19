import Link from 'next/link';
import type { CompetitionSummary, PlayerSummary, TeamSummary } from '@sportbrain/contracts';

/**
 * Cards for the list views.
 *
 * Three variants rather than one generic component, because the meaningful
 * secondary line differs: a team shows country and founding year, a player
 * shows nationality and position, a competition shows its kind. A single card
 * taking a props bag would hide that difference behind conditionals.
 */

function Avatar({ text, imageUrl }: { text: string; imageUrl?: string | null }) {
  const initials = text
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return imageUrl ? (
    // eslint-disable-next-line @next/next/no-img-element -- Remote hosts are not
    // in next.config's remotePatterns, and adding them would turn the deployment
    // into an open image proxy. These are third-party URLs we do not control.
    <img
      src={imageUrl}
      alt=""
      loading="lazy"
      className="size-10 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
    >
      {initials}
    </span>
  );
}

const cardClass =
  'flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/20 hover:bg-muted/50';

export function TeamCard({ sportSlug, team }: { sportSlug: string; team: TeamSummary }) {
  return (
    <Link href={`/sports/${sportSlug}/teams/${team.slug}`} className={cardClass}>
      <Avatar text={team.name} imageUrl={team.logoUrl} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{team.name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {[team.country, team.foundedYear].filter(Boolean).join(' · ') || 'Team'}
        </span>
      </span>
    </Link>
  );
}

export function PlayerCard({ sportSlug, player }: { sportSlug: string; player: PlayerSummary }) {
  // Position lives in `attributes` because it means different things per sport
  // and is absent in several. Read defensively.
  const position =
    typeof player.attributes.position === 'string' ? player.attributes.position : null;

  return (
    <Link href={`/sports/${sportSlug}/players/${player.slug}`} className={cardClass}>
      <Avatar text={player.fullName} imageUrl={player.imageUrl} />
      <span className="min-w-0">
        <span className="block truncate font-medium">{player.displayName ?? player.fullName}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {[player.nationality, position].filter(Boolean).join(' · ') || 'Player'}
        </span>
      </span>
    </Link>
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
