import { Injectable, Logger } from '@nestjs/common';
import {
  ProviderError,
  type ProviderCapabilities,
  type ProviderFixture,
  type SportsDataProvider,
} from '../provider.types';

/**
 * Formula 1, via the Ergast-compatible community API at `api.jolpi.ca`.
 *
 * The original Ergast API (`ergast.com/api/f1`) shut down; `jolpi.ca` is the
 * community-run replacement carrying the same schema, confirmed live and
 * free with no key. Chosen over ESPN for F1 specifically because a race
 * weekend does not fit the two-competitor `home`/`away` shape every other
 * sport here uses — `EspnProvider`'s `toFixture` has nowhere to put a
 * twenty-driver classification, whereas Ergast's `Results` array is built
 * for exactly that.
 *
 * `ProviderFixture` is a stretch for a race in the same way: `homeTeam`
 * carries the winning driver, `awayTeam` the constructor, and `homeScore` /
 * `awayScore` are left null rather than forced into a head-to-head score
 * that does not exist for this sport. A dedicated race-result shape would be
 * more honest; not built yet because nothing downstream needs it beyond the
 * "today/recent" list this satisfies.
 *
 * No lap-by-lap timing here — that is OpenF1's (`api.openf1.org`) territory,
 * confirmed live with genuine telemetry-grade data, and worth adding
 * alongside this if in-session detail is ever needed. Not wired in yet:
 * nothing today's fixtures view needs beyond race results and the calendar.
 */
@Injectable()
export class ErgastProvider implements SportsDataProvider {
  private static readonly BASE = 'https://api.jolpi.ca/ergast/f1';
  private static readonly TIMEOUT_MS = 8_000;

  private readonly logger = new Logger(ErgastProvider.name);

  readonly key = 'ergast';

  readonly capabilities: ProviderCapabilities = {
    people: false,
    teams: false,
    competitions: false,
    venues: false,
    fixtures: true,
    statistics: true,
    live: false, // Race weekends are published after each session, not streamed; see class doc re: OpenF1 for anything closer to live.
  };

  /**
   * "Today" for F1 is the most recent completed race, not a same-day
   * scoreboard — Ergast has no live feed, so `fetchFixtures` is the honest
   * best-effort: the latest result if one exists, otherwise nothing.
   */
  async fetchFixtures(sportSlug: string): Promise<ProviderFixture[]> {
    if (sportSlug !== 'formula-1') return [];

    const body = await this.getJson<ErgastResultsResponse>(
      `${ErgastProvider.BASE}/current/last/results.json`,
    );

    const race = body.MRData.RaceTable.Races[0];
    return race ? [this.toFixture(race)] : [];
  }

  async fetchCompetitionFixtures(
    sportSlug: string,
    _competitionRef: string,
    window: 'past' | 'next',
  ): Promise<ProviderFixture[]> {
    if (sportSlug !== 'formula-1') return [];

    // Ergast has no separate "next race" results endpoint — a race with no
    // results yet simply has an empty `Results` array, which `toFixture`
    // reports as `scheduled`. The current season's full calendar is fetched
    // either way and filtered by date, since that is the only place future
    // rounds appear at all.
    const body = await this.getJson<ErgastRaceTableResponse>(`${ErgastProvider.BASE}/current.json`);
    const races = body.MRData.RaceTable.Races;
    const now = Date.now();

    const filtered = races.filter((race) => {
      const raceTime = new Date(`${race.date}T${race.time ?? '00:00:00Z'}`).getTime();
      return window === 'past' ? raceTime < now : raceTime >= now;
    });

    return filtered.map((race) => this.toFixture(race));
  }

  private toFixture(race: ErgastRace): ProviderFixture {
    const winner = race.Results?.[0];

    return {
      externalId: `${race.season}-${race.round}`,
      name: race.raceName,
      fields: {
        sport: 'formula-1',
        competitionName: 'Formula 1',
        homeTeam: winner ? `${winner.Driver.givenName} ${winner.Driver.familyName}` : race.raceName,
        awayTeam: winner?.Constructor.name ?? '',
        homeScore: null,
        awayScore: null,
        status: winner ? 'finished' : 'scheduled',
        statusText: winner ? `Winner: ${winner.Driver.familyName}` : race.Circuit.circuitName,
        startTime: `${race.date}T${race.time ?? '00:00:00Z'}`,
      },
    };
  }

  private async getJson<T>(url: string): Promise<T> {
    let response: Response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(ErgastProvider.TIMEOUT_MS) });
    } catch (error) {
      throw new ProviderError('ergast', 'request failed', true, error);
    }

    if (!response.ok) {
      const retryable = response.status === 429 || response.status >= 500;
      throw new ProviderError('ergast', `HTTP ${response.status}`, retryable);
    }

    const body = (await response.json()) as T;
    this.logger.debug(`GET ${url} -> 200`);
    return body;
  }
}

interface ErgastDriver {
  givenName: string;
  familyName: string;
}

interface ErgastConstructor {
  name: string;
}

interface ErgastResult {
  Driver: ErgastDriver;
  Constructor: ErgastConstructor;
}

interface ErgastRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitName: string };
  Results?: ErgastResult[];
}

interface ErgastRaceTableResponse {
  MRData: { RaceTable: { Races: ErgastRace[] } };
}

interface ErgastResultsResponse {
  MRData: { RaceTable: { Races: ErgastRace[] } };
}
