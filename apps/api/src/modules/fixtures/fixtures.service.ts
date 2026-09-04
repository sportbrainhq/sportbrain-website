import { Injectable, Logger } from '@nestjs/common';
import type { Fixture, TodayBucket } from '@sportbrain/contracts';
import { CacheService } from '../../infrastructure/cache/cache.service';
import {
  ProviderError,
  type ProviderFixture,
  type SportsDataProvider,
} from '../../integrations/providers/provider.types';
import { EspnProvider } from '../../integrations/providers/fixtures/espn.provider';
import { ErgastProvider } from '../../integrations/providers/fixtures/ergast.provider';
import { TheSportsDbProvider } from '../../integrations/providers/fixtures/thesportsdb.provider';

/**
 * Routes each sport to whichever fixtures provider actually covers it, and
 * normalises all three into one `Fixture` shape.
 *
 * The routing table reflects a live POC (see repo conversation history), not
 * an accident of whichever adapter happened to be written first:
 *
 *   - football / basketball / tennis / golf / cricket / american-football /
 *     mma → ESPN's hidden site API. Confirmed live to carry granularity the
 *     previous providers (SportScore, TheSportsDB) did not have for these
 *     sports — see `EspnProvider`'s class doc for the specifics per sport.
 *   - boxing → TheSportsDB. ESPN has no boxing league at all; TheSportsDB is
 *     the only free option that returns anything.
 *   - formula-1 → Ergast (jolpi.ca). A race weekend has no two-competitor
 *     home/away shape, so it never fit ESPN's or TheSportsDB's schema well;
 *     Ergast is purpose-built for race results and standings.
 *
 * SportScore is gone entirely: every sport it covered is better served by
 * ESPN, and it added a provider with no advantage left to justify keeping.
 *
 * No provider is written to the database here. Every fixture read is a
 * cache-fronted passthrough (see TTLs below); persisting finished results
 * remains future work.
 */
@Injectable()
export class FixturesService {
  private readonly logger = new Logger(FixturesService.name);

  /** Seconds. Matched to provider freshness, not guessed — ESPN's scoreboard has no documented cache, so this is deliberately conservative rather than assumed near-live. */
  private static readonly TTL = {
    today: 60,
    competitionFixtures: 1_800,
  };

  private readonly providersBySport: ReadonlyMap<string, SportsDataProvider>;

  constructor(
    private readonly cache: CacheService,
    espn: EspnProvider,
    theSportsDb: TheSportsDbProvider,
    ergast: ErgastProvider,
  ) {
    this.providersBySport = new Map<string, SportsDataProvider>([
      ['football', espn],
      ['basketball', espn],
      ['tennis', espn],
      ['golf', espn],
      ['cricket', espn],
      ['american-football', espn],
      ['mma', espn],
      ['boxing', theSportsDb],
      ['formula-1', ergast],
    ]);
  }

  /**
   * One sport's fixtures, bucketed into live/upcoming/finished for the day.
   *
   * `possiblyIncomplete` is the honest version of "Today's Matches": true
   * whenever the underlying fetch cannot itself guarantee completeness.
   * ESPN's `scoreboard` is scoped to one competition per call (see
   * `EspnProvider.SPORT_PATHS`) — a sport with more than one active
   * competition on a given day (football beyond the Premier League, for
   * instance) is under-covered by construction, not by a row-count cap the
   * way SportScore was. Flagged unconditionally for every ESPN-backed sport
   * for that reason. Formula 1 is the one exception: Ergast's "today" is
   * always the single most recent race, which is complete by definition.
   */
  async today(sportSlug: string): Promise<TodayBucket> {
    const provider = this.providersBySport.get(sportSlug);
    if (!provider) {
      return { live: [], upcoming: [], finished: [], possiblyIncomplete: false };
    }

    const cacheKey = `fixtures:today:${sportSlug}`;
    return this.cache.wrap(
      cacheKey,
      async () => {
        const raw = await this.fetchWithFallback(provider, sportSlug);
        const fixtures = raw.map((item) => toFixture(provider.key, item));

        const live = fixtures.filter((f) => f.status === 'live');
        const upcoming = fixtures.filter((f) => f.status === 'scheduled');
        const finished = fixtures.filter((f) => f.status === 'finished');

        const possiblyIncomplete = provider instanceof ErgastProvider ? false : true;

        return { live, upcoming, finished, possiblyIncomplete };
      },
      FixturesService.TTL.today,
    );
  }

  /** One competition's recent results or upcoming fixtures. `competitionRef` is provider-specific — ESPN's own `sport/league` path for ESPN-backed sports (see `EspnProvider.fetchCompetitionFixtures`), a TheSportsDB league id for boxing. */
  async competitionFixtures(
    sportSlug: string,
    competitionRef: string,
    window: 'past' | 'next',
  ): Promise<Fixture[]> {
    const provider = this.providersBySport.get(sportSlug);
    if (!provider?.fetchCompetitionFixtures) return [];

    const cacheKey = `fixtures:competition:${sportSlug}:${competitionRef}:${window}`;
    return this.cache.wrap(
      cacheKey,
      async () => {
        const raw = await provider.fetchCompetitionFixtures!(sportSlug, competitionRef, window);
        return raw.map((item) => toFixture(provider.key, item));
      },
      FixturesService.TTL.competitionFixtures,
    );
  }

  private async fetchWithFallback(
    provider: SportsDataProvider,
    sportSlug: string,
  ): Promise<ProviderFixture[]> {
    try {
      return (await provider.fetchFixtures?.(sportSlug)) ?? [];
    } catch (error) {
      if (error instanceof ProviderError && !error.retryable) throw error;

      // Retryable failure (timeout, 429, 5xx): swallow and return nothing
      // rather than let a provider outage 500 the endpoint. `cache.wrap`
      // still stores this empty result under the normal TTL, which is a
      // known trade-off — a brief outage produces a brief empty section
      // rather than one that self-heals within the request. Acceptable at
      // today's TTLs (`today` = 60s); would need a stale-while-error path if
      // this section becomes more prominent.
      this.logger.warn(`fetchFixtures(${sportSlug}) via ${provider.key} failed: ${String(error)}`);
      return [];
    }
  }
}

function toFixture(provider: string, item: ProviderFixture): Fixture {
  return {
    id: item.externalId,
    provider,
    sport: item.fields.sport,
    competitionName: item.fields.competitionName,
    competitionLogo: item.fields.competitionLogo ?? null,
    homeTeam: item.fields.homeTeam,
    awayTeam: item.fields.awayTeam,
    homeTeamLogo: item.fields.homeTeamLogo ?? null,
    awayTeamLogo: item.fields.awayTeamLogo ?? null,
    homeScore: item.fields.homeScore,
    awayScore: item.fields.awayScore,
    status: item.fields.status,
    statusText: item.fields.statusText,
    startTime: item.fields.startTime,
    liveMinute: item.fields.liveMinute ?? null,
    updatedAt: new Date().toISOString(),
  };
}
