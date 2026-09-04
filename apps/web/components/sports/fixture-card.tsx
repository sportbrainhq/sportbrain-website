import type { Fixture } from '@sportbrain/contracts';
import { Avatar } from '@/components/sports/avatar';

/**
 * One fixture, in the today/results lists.
 *
 * Not a `Link`, unlike the entity cards in `entity-card.tsx`: a fixture has
 * no page of its own yet (there is no match-detail route), so this renders as
 * a plain row rather than promising a destination that does not exist.
 *
 * Score display is deliberately a string comparison, not a number one. Some
 * providers report scores that are not meaningfully numeric — cricket's
 * "runs/wickets" shape and a not-yet-started match's absent score both arrive
 * as strings or nulls from the API, and the contract keeps them that way
 * rather than coercing to a number that would lie about the precision.
 */
export function FixtureCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Avatar text={fixture.homeTeam} imageUrl={fixture.homeTeamLogo} size={24} />
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{fixture.homeTeam}</span>
        <ScoreValue value={fixture.homeScore} />
      </div>

      <StatusBadge fixture={fixture} />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ScoreValue value={fixture.awayScore} align="right" />
        <span className="min-w-0 flex-1 truncate text-right text-sm font-medium">
          {fixture.awayTeam}
        </span>
        <Avatar text={fixture.awayTeam} imageUrl={fixture.awayTeamLogo} size={24} />
      </div>
    </div>
  );
}

function ScoreValue({ value, align = 'left' }: { value: string | null; align?: 'left' | 'right' }) {
  if (value === null) return null;
  return (
    <span
      className={`shrink-0 text-sm font-bold tabular-nums ${align === 'right' ? 'text-right' : ''}`}
    >
      {value}
    </span>
  );
}

/**
 * Kickoff time or live/finished state, centred between the two teams.
 *
 * `liveMinute` is shown only for `live`, and only when the provider actually
 * sent one: TheSportsDB never populates it (see `TheSportsDbProvider`), and a
 * blank "'" reads worse than no minute at all.
 */
function StatusBadge({ fixture }: { fixture: Fixture }) {
  if (fixture.status === 'live') {
    return (
      <span className="flex shrink-0 flex-col items-center gap-0.5 px-2 text-xs font-semibold text-emerald-500">
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
          Live
        </span>
        {fixture.liveMinute && (
          <span className="text-2xs text-muted-foreground">{fixture.liveMinute}&apos;</span>
        )}
      </span>
    );
  }

  if (fixture.status === 'finished') {
    return (
      <span className="shrink-0 px-2 text-xs font-medium text-muted-foreground">Full-time</span>
    );
  }

  return (
    <span className="shrink-0 px-2 text-center text-xs font-medium text-muted-foreground">
      {formatKickoff(fixture.startTime)}
    </span>
  );
}

/** "14:30" for today, "Fri 14:30" otherwise — a bare time is ambiguous once a list spans more than one day. */
function formatKickoff(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

  const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(
    date,
  );
  if (sameDay) return time;

  const day = new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(date);
  return `${day} ${time}`;
}

/** A labelled group of fixtures, for the live/upcoming/finished buckets. */
export function FixtureGroup({ label, fixtures }: { label: string; fixtures: Fixture[] }) {
  if (fixtures.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </h3>
      <div className="space-y-1.5">
        {fixtures.map((fixture) => (
          <FixtureCard key={fixture.id} fixture={fixture} />
        ))}
      </div>
    </div>
  );
}
