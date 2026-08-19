import { Injectable } from '@nestjs/common';
import type { Sport, SportDetail } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { SportsRepository } from './sports.repository';

/**
 * Sports business logic.
 *
 * Read-through cached with a long TTL, because the sport list is the most
 * requested and least volatile data in the system: it renders in the sidebar of
 * every page and changes when somebody launches a new sport, which is a
 * deliberate act rather than an ingestion side effect.
 */
@Injectable()
export class SportsService {
  private static readonly CACHE_PREFIX = 'sports:';
  private static readonly CACHE_TTL_SECONDS = 3_600;

  constructor(
    private readonly repository: SportsRepository,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Sport[]> {
    return this.cache.wrap(
      `${SportsService.CACHE_PREFIX}all`,
      () => this.repository.findAll(),
      SportsService.CACHE_TTL_SECONDS,
    );
  }

  async findBySlug(slug: string): Promise<SportDetail> {
    const found = await this.cache.wrap(
      `${SportsService.CACHE_PREFIX}${slug}`,
      () => this.repository.findBySlug(slug),
      SportsService.CACHE_TTL_SECONDS,
    );

    // Thrown here rather than in the controller: "no such sport" is a domain
    // fact, and a scheduled job asking the same question deserves the same
    // answer as an HTTP request.
    if (!found) throw AppException.notFound(`No sport with slug "${slug}"`);

    return found;
  }

  /** Clears the namespace. Called after ingestion or an editorial change. */
  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(SportsService.CACHE_PREFIX);
  }
}
