import { Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  type EntityListQuery,
  type Paginated,
  type TeamDetail,
  type TeamSummary,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { StatisticsAssembler } from '../shared/statistics.assembler';
import { TeamsRepository } from './teams.repository';

@Injectable()
export class TeamsService {
  private static readonly CACHE_PREFIX = 'teams:';
  /** Shorter than sports: team data changes with each ingestion run. */
  private static readonly CACHE_TTL_SECONDS = 900;

  constructor(
    private readonly repository: TeamsRepository,
    private readonly statistics: StatisticsAssembler,
    private readonly cache: CacheService,
  ) {}

  async list(sportSlug: string, query: EntityListQuery): Promise<Paginated<TeamSummary>> {
    // The cache key carries every filter, or two different filters would share
    // an entry and serve each other's results.
    const key = `${TeamsService.CACHE_PREFIX}${sportSlug}:${JSON.stringify(query)}`;

    return this.cache.wrap(
      key,
      async () => {
        const { rows, total } = await this.repository.findBySport(sportSlug, query);
        return { data: rows, pagination: buildPaginationMeta(total, query) };
      },
      TeamsService.CACHE_TTL_SECONDS,
    );
  }

  async findBySlug(sportSlug: string, slug: string): Promise<TeamDetail> {
    const found = await this.cache.wrap(
      `${TeamsService.CACHE_PREFIX}${sportSlug}:${slug}`,
      async () => {
        const row = await this.repository.findBySlug(sportSlug, slug);
        if (!row) return null;

        // Honours and statistics in parallel: neither depends on the other, and
        // running them in sequence doubles the latency of every team page.
        const [honours, statistics] = await Promise.all([
          this.statistics.honoursFor({ teamId: row.id }),
          this.statistics.forTeam(row.id, row.sportId),
        ]);

        const detail: TeamDetail = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          shortName: row.shortName,
          kind: row.kind,
          country: row.country,
          foundedYear: row.foundedYear,
          logoUrl: row.logoUrl,
          about: row.about,
          isActive: row.isActive,
          sport: { slug: row.sportSlug, name: row.sportName },
          honours,
          statistics,
        };

        return detail;
      },
      TeamsService.CACHE_TTL_SECONDS,
    );

    if (!found) throw AppException.notFound(`No team "${slug}" in ${sportSlug}`);

    return found;
  }

  async countries(sportSlug: string): Promise<string[]> {
    return this.cache.wrap(
      `${TeamsService.CACHE_PREFIX}${sportSlug}:countries`,
      () => this.repository.countriesForSport(sportSlug),
      TeamsService.CACHE_TTL_SECONDS,
    );
  }

  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(TeamsService.CACHE_PREFIX);
  }
}
