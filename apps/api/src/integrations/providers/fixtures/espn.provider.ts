import { Injectable, Logger } from '@nestjs/common';
import {
  ProviderError,
  type ProviderCapabilities,
  type ProviderFixture,
  type SportsDataProvider,
} from '../provider.types';

/**
 * ESPN's undocumented "site API" (`site.api.espn.com/apis/site/v2/sports`).
 *
 * Replaces `SportScoreProvider` for football, basketball and tennis, and
 * `TheSportsDbProvider` for golf, cricket, american-football and mma. One
 * adapter rather than two, because ESPN exposes all seven under the same
 * `scoreboard`/`summary` shape — only the per-sport path and a handful of
 * field quirks differ (see `toFixture`).
 *
 * ## Why this replaced the previous providers
 *
 * A live POC (see repo conversation history / PR description) confirmed
 * granularity neither prior provider had:
 *
 *   - **Cricket**: `competitors[].score` is a real string like
 *     `"161/5 (18/20 ov, target 156)"` — runs, wickets and overs. SportScore
 *     returned the literal string `"-"` for a live cricket match; this is the
 *     gap that originally kept cricket off SportScore.
 *   - **Golf**: `competitors[].linescores` breaks a round down **per hole**,
 *     not just a round total.
 *   - **Basketball / American football**: `linescores` is genuinely
 *     quarter-by-quarter, and `summary?event=` returns a full box score plus
 *     (NFL) play-by-play `drives`.
 *   - **Tennis**: `linescores` is per-set, including tiebreak points.
 *   - **MMA**: `status.period` is the round the fight ended in, and
 *     `details[]` carries typed events (takedown, submission attempt, round
 *     end) — enough to infer method of victory. `summary?event=` reliably
 *     404s for MMA, though, so judge scorecards are not available here.
 *
 * ## What this is not
 *
 * An official, documented, or rate-limited-by-contract API. There is no key,
 * which also means there is no support channel and no published quota.
 * ESPN can change or block this endpoint without notice — the entire reason
 * `SportsDataProvider` exists as a swappable interface rather than this
 * class being called directly from the fixtures service.
 *
 * Boxing is deliberately absent from `SPORT_PATHS`: ESPN has no boxing
 * league on this API at all (`/boxing/scoreboard` 404s, and the core API
 * rejects `boxing` as an invalid sport). Boxing stays on `TheSportsDbProvider`.
 */
@Injectable()
export class EspnProvider implements SportsDataProvider {
  private static readonly BASE = 'https://site.api.espn.com/apis/site/v2/sports';
  private static readonly TIMEOUT_MS = 6_000;

  /**
   * `sport/league` path segments, confirmed live per sport.
   *
   * Football lists several major leagues rather than one: ESPN has no
   * sport-wide soccer scoreboard, only per-competition ones, so "today's
   * football" is built by fetching each of these in parallel and merging —
   * the same shape ESPN's own fixtures page uses (confirmed by comparing
   * `espn.in/football/fixtures` against these six leagues directly: same
   * fixtures, same day). This is still a curated list, not every league
   * ESPN or the world has — `possiblyIncomplete` stays true for football
   * for exactly that reason.
   *
   * Every other sport lists one competition, for now: the flagship league a
   * mainstream reader means by that sport's name. Extending any of them to
   * several leagues is the same pattern as football, not a different one.
   */
  private static readonly SPORT_PATHS: Record<string, string[]> = {
    football: [
      'soccer/eng.1',
      'soccer/esp.1',
      'soccer/ita.1',
      'soccer/ger.1',
      'soccer/fra.1',
      'soccer/por.1',
    ],
    basketball: ['basketball/nba'],
    tennis: ['tennis/atp'],
    golf: ['golf/pga'],
    cricket: ['cricket/8048'], // Indian Premier League — the one cricket competition confirmed live; see class doc.
    'american-football': ['football/nfl'],
    mma: ['mma/ufc'],
  };

  private readonly logger = new Logger(EspnProvider.name);

  readonly key = 'espn';

  readonly capabilities: ProviderCapabilities = {
    people: false,
    teams: false,
    competitions: false,
    venues: false,
    fixtures: true,
    statistics: true,
    live: true,
  };

  async fetchFixtures(sportSlug: string): Promise<ProviderFixture[]> {
    const paths = EspnProvider.SPORT_PATHS[sportSlug];
    if (!paths) return [];

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    // One request per competition, in parallel, and one competition failing
    // does not lose the rest — `Promise.allSettled` rather than `Promise.all`,
    // because a single-league outage should shrink today's list, not empty
    // it. Errors are logged, not thrown, matching how the fixtures service
    // already treats a whole-provider failure as "return nothing" rather
    // than a 500.
    const results = await Promise.allSettled(
      paths.map((path) =>
        this.getJson<EspnScoreboardResponse>(
          `${EspnProvider.BASE}/${path}/scoreboard?dates=${today}`,
        ),
      ),
    );

    return results.flatMap((result, index) => {
      if (result.status === 'rejected') {
        this.logger.warn(
          `fetchFixtures(${sportSlug}) via ${paths[index]} failed: ${String(result.reason)}`,
        );
        return [];
      }
      return (result.value.events ?? []).flatMap((event) => this.toFixtures(sportSlug, event));
    });
  }

  /**
   * A specific competition's fixtures, where `competitionRef` is ESPN's own
   * `sport/league` path (e.g. `soccer/esp.1` for La Liga) rather than one of
   * our slugs — the fixtures service passes this straight through, so it is
   * the caller's job to know ESPN's path for the competition it wants.
   *
   * `window` is not applied server-side: ESPN's `scoreboard` without a date
   * returns whatever it considers current, and there is no separate
   * past/next endpoint the way TheSportsDB has one. Callers bucket the
   * returned fixtures by `startTime` themselves if they need past vs next.
   */
  async fetchCompetitionFixtures(
    _sportSlug: string,
    competitionRef: string,
  ): Promise<ProviderFixture[]> {
    const body = await this.getJson<EspnScoreboardResponse>(
      `${EspnProvider.BASE}/${competitionRef}/scoreboard`,
    );

    const sportSlug = Object.entries(EspnProvider.SPORT_PATHS).find(([, paths]) =>
      paths.includes(competitionRef),
    )?.[0];

    return (body.events ?? []).flatMap((event) => this.toFixtures(sportSlug ?? 'unknown', event));
  }

  /**
   * One ESPN "event" to zero or more `ProviderFixture`s.
   *
   * Not a 1:1 mapping, because ESPN's `scoreboard` shape genuinely differs by
   * sport, confirmed live rather than assumed uniform:
   *
   *   - **Team sports and MMA** (football, basketball, american-football,
   *     cricket, mma): the event *is* the match — `competitions[0]` holds
   *     two `competitors`, one fixture out.
   *   - **Tennis**: the top-level event is a whole tournament with no
   *     `competitions` of its own; individual matches are nested inside
   *     `groupings[].competitions[]`, one per draw (men's/women's
   *     singles/doubles). Flattened here into one fixture per match, or the
   *     tournament fans out into nothing rather than being reported as a
   *     single fixture with no players.
   *   - **Golf**: the event is a whole tournament with a `competitions[0]`
   *     that carries no `competitors` at all — the leaderboard is
   *     per-player standings, not a two-way score, and is not exposed by
   *     this endpoint. Represented as one tournament-level fixture with
   *     both scores left null rather than invented; a golf leaderboard is a
   *     different shape of data this contract does not attempt to carry.
   */
  private toFixtures(sportSlug: string, event: EspnEvent): ProviderFixture[] {
    if (sportSlug === 'tennis') {
      return (event.groupings ?? []).flatMap((grouping) =>
        (grouping.competitions ?? []).map((competition) =>
          this.matchFixture(sportSlug, event, competition),
        ),
      );
    }

    const competition = event.competitions?.[0];
    if (!competition) return [];

    if (!competition.competitors || competition.competitors.length === 0) {
      // Golf's shape: a tournament with no head-to-head competitors.
      const statusType = event.status?.type ?? competition.status?.type;
      return [
        {
          externalId: event.id,
          name: event.name ?? event.shortName ?? '',
          fields: {
            sport: sportSlug,
            competitionName: event.name ?? '',
            homeTeam: event.name ?? event.shortName ?? '',
            awayTeam: '',
            homeScore: null,
            awayScore: null,
            status: mapStatus(statusType),
            statusText: statusType?.shortDetail ?? statusType?.description ?? '',
            startTime: event.date ?? new Date().toISOString(),
          },
        },
      ];
    }

    return [this.matchFixture(sportSlug, event, competition)];
  }

  private matchFixture(
    sportSlug: string,
    event: EspnEvent,
    competition: EspnCompetition,
  ): ProviderFixture {
    const competitors = competition.competitors ?? [];

    // MMA has no home/away: two `competitors` still exist, ordered by
    // `order`, so the same indexing that works for team sports works here
    // too — the "home" slot is just whichever fighter ESPN lists first.
    const home = competitors.find((c) => c.homeAway === 'home') ?? competitors[0];
    const away = competitors.find((c) => c.homeAway === 'away') ?? competitors[1];

    const statusType = event.status?.type ?? competition.status?.type;

    return {
      externalId: competition.id ?? event.id,
      name: event.name ?? event.shortName ?? '',
      fields: {
        sport: sportSlug,
        competitionName: event.season?.slug ?? competition.type?.text ?? event.name ?? '',
        homeTeam: home?.team?.displayName ?? home?.athlete?.displayName ?? '',
        awayTeam: away?.team?.displayName ?? away?.athlete?.displayName ?? '',
        homeTeamLogo: home?.team?.logo,
        awayTeamLogo: away?.team?.logo,
        // Not coerced to a number: cricket's score is a compound string
        // ("161/5 (18/20 ov, ...)"), and forcing that through `Number()`
        // would silently produce `NaN` rather than surface the mismatch.
        // Tennis has no flat `score` field at all — it is derived from
        // `linescores`, one entry per set, joined the way a scoreline reads
        // ("6-4 7-6"). A tiebreak's point count is dropped from the display
        // string on purpose: ESPN's own `notes[].text` already renders it
        // correctly ("7-6 (7-3)") and ours would need the opponent's
        // tiebreak score alongside it to do the same, which lives on the
        // *other* competitor's linescore entry, not this one.
        homeScore: home?.score ?? scoreFromLinescores(home?.linescores),
        awayScore: away?.score ?? scoreFromLinescores(away?.linescores),
        status: mapStatus(statusType),
        statusText: statusType?.shortDetail ?? statusType?.description ?? '',
        startTime: event.date ?? new Date().toISOString(),
        liveMinute:
          statusType?.state === 'in' ? (statusType.detail ?? statusType.shortDetail) : null,
      },
    };
  }

  private async getJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(EspnProvider.TIMEOUT_MS) });
    } catch (error) {
      throw new ProviderError('espn', 'request failed', true, error);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('espn', `HTTP ${response.status}`, retryable);
    }

    const body = (await response.json()) as T;
    this.logger.debug(`GET ${url} -> 200`);
    return body;
  }
}

/** "6-4 7-6" from a tennis competitor's per-set `linescores`. Null when absent, never an empty string. */
function scoreFromLinescores(linescores?: EspnLinescore[]): string | null {
  if (!linescores || linescores.length === 0) return null;
  return linescores.map((set) => String(set.value)).join('-');
}

function mapStatus(type?: EspnStatusType): 'scheduled' | 'live' | 'finished' | 'unknown' {
  switch (type?.state) {
    case 'pre':
      return 'scheduled';
    case 'in':
      return 'live';
    case 'post':
      return 'finished';
    default:
      return 'unknown';
  }
}

interface EspnStatusType {
  state?: 'pre' | 'in' | 'post';
  description?: string;
  shortDetail?: string;
  detail?: string;
}

interface EspnLinescore {
  value: number;
  tiebreak?: number;
  winner?: boolean;
}

interface EspnCompetitor {
  homeAway?: 'home' | 'away';
  score?: string;
  /** Present for tennis instead of a flat `score`; see `scoreFromLinescores`. */
  linescores?: EspnLinescore[];
  team?: { displayName?: string; logo?: string };
  /** MMA fighters arrive here instead of `team`. */
  athlete?: { displayName?: string };
}

interface EspnCompetition {
  id?: string;
  type?: { text?: string };
  competitors?: EspnCompetitor[];
  status?: { type?: EspnStatusType };
}

interface EspnGrouping {
  competitions?: EspnCompetition[];
}

interface EspnEvent {
  id: string;
  name?: string;
  shortName?: string;
  date?: string;
  season?: { slug?: string };
  status?: { type?: EspnStatusType };
  competitions?: EspnCompetition[];
  /** Tennis only: a tournament event fans out into matches through here rather than `competitions`. */
  groupings?: EspnGrouping[];
}

interface EspnScoreboardResponse {
  events?: EspnEvent[];
}
