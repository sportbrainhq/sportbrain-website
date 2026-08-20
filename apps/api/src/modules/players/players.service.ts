import { Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  type EntityListQuery,
  type Paginated,
  type PlayerDetail,
  type PlayerSummary,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { ProfileAssembler } from '../shared/profile.assembler';
import { StatisticsAssembler } from '../shared/statistics.assembler';
import { PlayersRepository } from './players.repository';

@Injectable()
export class PlayersService {
  private static readonly CACHE_PREFIX = 'players:';
  private static readonly CACHE_TTL_SECONDS = 900;

  constructor(
    private readonly repository: PlayersRepository,
    private readonly statistics: StatisticsAssembler,
    private readonly cache: CacheService,
    private readonly profiles: ProfileAssembler,
  ) {}

  async list(sportSlug: string, query: EntityListQuery): Promise<Paginated<PlayerSummary>> {
    return this.cache.wrap(
      `${PlayersService.CACHE_PREFIX}${sportSlug}:${JSON.stringify(query)}`,
      async () => {
        const { rows, total } = await this.repository.findBySport(sportSlug, query);
        return { data: rows, pagination: buildPaginationMeta(total, query) };
      },
      PlayersService.CACHE_TTL_SECONDS,
    );
  }

  async findBySlug(sportSlug: string, slug: string): Promise<PlayerDetail> {
    const found = await this.cache.wrap(
      `${PlayersService.CACHE_PREFIX}${sportSlug}:${slug}`,
      async () => {
        const row = await this.repository.findBySlug(sportSlug, slug);
        if (!row) return null;

        const [honours, careerSummary, statistics, teams, profile] = await Promise.all([
          this.statistics.honoursFor({ personId: row.id }),
          this.statistics.careerSummaryFor(row.id, row.sportId),
          this.statistics.forPerson(row.id, row.sportId),
          this.repository.teamsFor(row.id),
          this.profiles.forEntity('person', row.id),
        ]);

        const detail: PlayerDetail = {
          id: row.id,
          slug: row.slug,
          fullName: row.fullName,
          displayName: row.displayName,
          nationality: row.nationality,
          dateOfBirth: row.dateOfBirth,
          dateOfDeath: row.dateOfDeath,
          imageUrl: row.imageUrl,
          biography: row.biography,
          attributes: (row.attributes ?? {}) as Record<string, unknown>,
          sport: { slug: row.sportSlug, name: row.sportName },
          honours,
          careerSummary,
          statistics,
          teams: teams.map((entry) => ({
            team: {
              id: entry.id,
              slug: entry.slug,
              name: entry.name,
              shortName: entry.shortName,
              kind: entry.kind,
              country: entry.country,
              foundedYear: entry.foundedYear,
              logoUrl: entry.logoUrl,
            },
            role: entry.role,
            startDate: entry.startDate,
            endDate: entry.endDate,
          })),
          profile,
        };

        return detail;
      },
      PlayersService.CACHE_TTL_SECONDS,
    );

    if (!found) throw AppException.notFound(`No player "${slug}" in ${sportSlug}`);

    return found;
  }

  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(PlayersService.CACHE_PREFIX);
  }
}
