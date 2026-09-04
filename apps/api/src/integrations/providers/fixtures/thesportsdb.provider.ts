import { Injectable, Logger } from '@nestjs/common';
import {
  ProviderError,
  type ProviderCapabilities,
  type ProviderFixture,
  type SportsDataProvider,
} from '../provider.types';

/**
 * TheSportsDB (`thesportsdb.com/api/v1/json/123`), free test key.
 *
 * Down to one sport: boxing. Every other sport that used to live here (golf,
 * cricket, american-football, mma) moved to `EspnProvider`, which returns
 * genuinely granular data — per-hole golf scores, runs/wickets/overs for
 * cricket, round/method-of-victory signals for MMA — none of which
 * TheSportsDB's free tier carries (`intHomeScore`/`intAwayScore` here are
 * aggregate final scores only, confirmed by live probe). Formula 1 moved to
 * `ErgastProvider` + OpenF1 for the same reason: real standings and lap data
 * beat TheSportsDB's fixture-list-only coverage.
 *
 * Boxing stayed because there is nowhere better: ESPN's site API has no
 * boxing league at all (`/boxing/scoreboard` 404s, and its core API rejects
 * `boxing` as an invalid sport — confirmed live). TheSportsDB's `strResult`
 * field does carry method-of-victory/round/scorecards as free text for
 * completed boxing cards (e.g. "... — Decision (split) (47–48, 48–47,
 * 48–47) — Round 5"), which is more than the structured fields
 * (`intHomeScore`/`intRound`) suggest on their own — parsing that text is
 * future work if boxing result detail becomes a priority.
 *
 * ## Free key `123` is not a general catalogue
 *
 * `all_leagues.php` returns ten leagues, all soccer. `lookupleague.php`,
 * `eventsnextleague.php` and `eventspastleague.php` all worked against
 * Boxing's league id in a live probe despite it not appearing in
 * `all_leagues.php` — there is no free-tier endpoint that *lists* every
 * league the key can reach. `LEAGUE_IDS` below is the result of probing a
 * candidate id (via `searchevents.php` to find a known fixture and read its
 * `idLeague` back) until it resolved, not a documented registry entry.
 */
@Injectable()
export class TheSportsDbProvider implements SportsDataProvider {
  private static readonly BASE = 'https://www.thesportsdb.com/api/v1/json/123';
  private static readonly TIMEOUT_MS = 8_000;

  /**
   * League ids confirmed by live probe. `strSport` here is TheSportsDB's own
   * label, kept only as a comment for anyone re-verifying — the sport key on
   * the left is ours (`sport.slug`) and is what every call site uses.
   */
  private static readonly LEAGUE_IDS: Record<string, number> = {
    boxing: 4445,
  };

  private readonly logger = new Logger(TheSportsDbProvider.name);

  readonly key = 'thesportsdb';

  readonly capabilities: ProviderCapabilities = {
    people: true,
    teams: true,
    competitions: true,
    venues: true,
    fixtures: true,
    statistics: false,
    live: false, // eventsday/eventsnextleague are not a live feed; no minute-by-minute score updates observed for this key.
  };

  async fetchFixtures(sportSlug: string): Promise<ProviderFixture[]> {
    const leagueId = TheSportsDbProvider.LEAGUE_IDS[sportSlug];
    if (leagueId === undefined) return [];

    const today = new Date().toISOString().slice(0, 10);
    const body = await this.getJson<TheSportsDbEventsResponse>(
      `${TheSportsDbProvider.BASE}/eventsday.php?d=${today}&l=${leagueId}`,
    );

    return (body.events ?? []).map((event) => this.toFixture(sportSlug, event));
  }

  async fetchCompetitionFixtures(
    sportSlug: string,
    _competitionRef: string,
    window: 'past' | 'next',
  ): Promise<ProviderFixture[]> {
    const leagueId = TheSportsDbProvider.LEAGUE_IDS[sportSlug];
    if (leagueId === undefined) return [];

    const endpoint = window === 'past' ? 'eventspastleague.php' : 'eventsnextleague.php';
    const body = await this.getJson<TheSportsDbEventsResponse>(
      `${TheSportsDbProvider.BASE}/${endpoint}?id=${leagueId}`,
    );

    return (body.events ?? []).map((event) => this.toFixture(sportSlug, event));
  }

  /**
   * A team's own history, going back further than any league-scoped call:
   * confirmed live to return real final scores, not just fixture metadata.
   * Not part of `SportsDataProvider` (no `teamExternalId` concept there yet)
   * — called directly by the fixtures service for a team's results tab.
   */
  async fetchTeamResults(teamExternalId: string): Promise<ProviderFixture[]> {
    const body = await this.getJson<TheSportsDbResultsResponse>(
      `${TheSportsDbProvider.BASE}/eventslast.php?id=${teamExternalId}`,
    );

    return (body.results ?? []).map((event) => this.toFixture(event.strSport ?? 'unknown', event));
  }

  private toFixture(sportSlug: string, event: TheSportsDbEvent): ProviderFixture {
    return {
      externalId: event.idEvent,
      name: event.strEvent,
      fields: {
        sport: sportSlug,
        competitionName: event.strLeague,
        competitionLogo: event.strLeagueBadge || undefined,
        homeTeam: event.strHomeTeam ?? event.strEvent,
        awayTeam: event.strAwayTeam ?? '',
        homeScore: event.intHomeScore ?? null,
        awayScore: event.intAwayScore ?? null,
        status: mapStatus(event),
        statusText: event.strStatus || (event.intHomeScore !== null ? 'Finished' : 'Scheduled'),
        startTime: toIso(event.strTimestamp, event.dateEvent, event.strTime),
      },
    };
  }

  private async getJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, {
        signal: AbortSignal.timeout(TheSportsDbProvider.TIMEOUT_MS),
      });
    } catch (error) {
      throw new ProviderError('thesportsdb', 'request failed', true, error);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('thesportsdb', `HTTP ${response.status}`, retryable);
    }

    const body = (await response.json()) as T;
    this.logger.debug(`GET ${url} -> 200`);
    return body;
  }
}

/**
 * TheSportsDB has no live status enum worth trusting on the free key — a
 * probed response carried a final score with no explicit "finished" flag.
 * Inferred instead: a non-null score means finished, a start time in the
 * future means scheduled, anything else is reported `unknown` rather than
 * guessed at, because a wrong "live" label is worse than an honest "unknown"
 * one for a section meant to be trustworthy.
 */
function mapStatus(event: TheSportsDbEvent): 'scheduled' | 'live' | 'finished' | 'unknown' {
  if (event.intHomeScore !== null && event.intHomeScore !== undefined) return 'finished';
  const start = toIso(event.strTimestamp, event.dateEvent, event.strTime);
  if (start && new Date(start).getTime() > Date.now()) return 'scheduled';
  return 'unknown';
}

function toIso(timestamp?: string, date?: string, time?: string): string {
  if (timestamp) return `${timestamp}${timestamp.endsWith('Z') ? '' : 'Z'}`;
  if (date) return `${date}T${time ?? '00:00:00'}Z`;
  return new Date().toISOString();
}

interface TheSportsDbEvent {
  idEvent: string;
  strEvent: string;
  strSport?: string;
  strTimestamp?: string;
  dateEvent?: string;
  strTime?: string;
  strLeague: string;
  strLeagueBadge?: string;
  strHomeTeam?: string;
  strAwayTeam?: string;
  intHomeScore?: string | null;
  intAwayScore?: string | null;
  strStatus?: string;
}

interface TheSportsDbEventsResponse {
  events: TheSportsDbEvent[] | null;
}

interface TheSportsDbResultsResponse {
  results: TheSportsDbEvent[] | null;
}
