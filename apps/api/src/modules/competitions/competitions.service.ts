import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import {
  buildPaginationMeta,
  type CompetitionDetail,
  type CompetitionSummary,
  type EntityListQuery,
  type Paginated,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { DatabaseService } from '../../database/database.service';
import { sport } from '../../database/schema';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { CompetitionsRepository } from './competitions.repository';

@Injectable()
export class CompetitionsService {
  private static readonly CACHE_PREFIX = 'competitions:';
  private static readonly CACHE_TTL_SECONDS = 900;

  constructor(
    private readonly repository: CompetitionsRepository,
    private readonly database: DatabaseService,
    private readonly cache: CacheService,
  ) {}

  async list(sportSlug: string, query: EntityListQuery): Promise<Paginated<CompetitionSummary>> {
    return this.cache.wrap(
      `${CompetitionsService.CACHE_PREFIX}${sportSlug}:${JSON.stringify(query)}`,
      async () => {
        const { rows, total } = await this.repository.findBySport(sportSlug, query);
        return { data: rows, pagination: buildPaginationMeta(total, query) };
      },
      CompetitionsService.CACHE_TTL_SECONDS,
    );
  }

  async findBySlug(sportSlug: string, slug: string): Promise<CompetitionDetail> {
    const found = await this.cache.wrap(
      `${CompetitionsService.CACHE_PREFIX}${sportSlug}:${slug}`,
      async () => {
        const row = await this.repository.findBySlug(sportSlug, slug);
        if (!row) return null;

        const [sportRow] = await this.database.db
          .select({ id: sport.id })
          .from(sport)
          .where(eq(sport.slug, sportSlug))
          .limit(1);

        const [seasons, records] = await Promise.all([
          this.repository.seasonsFor(row.id),
          sportRow ? this.repository.recordsFor(row.id, sportRow.id) : Promise.resolve([]),
        ]);

        const detail: CompetitionDetail = {
          id: row.id,
          slug: row.slug,
          name: row.name,
          shortName: row.shortName,
          kind: row.kind,
          format: row.format,
          country: row.country,
          foundedYear: row.foundedYear,
          logoUrl: row.logoUrl,
          about: row.about,
          isActive: row.isActive,
          sport: { slug: row.sportSlug, name: row.sportName },
          seasons,
          records,
        };

        return detail;
      },
      CompetitionsService.CACHE_TTL_SECONDS,
    );

    if (!found) throw AppException.notFound(`No competition "${slug}" in ${sportSlug}`);

    return found;
  }

  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(CompetitionsService.CACHE_PREFIX);
  }
}
