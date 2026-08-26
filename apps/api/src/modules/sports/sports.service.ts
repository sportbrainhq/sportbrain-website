import { Injectable } from '@nestjs/common';
import type { Sport, SportDetail, SportOverview } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { OverviewRepository } from './overview.repository';
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
    private readonly overview: OverviewRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * The full overview payload.
   *
   * Cached for an hour, matching the sport list: this is encyclopedia content
   * that changes when somebody publishes, not when a match finishes.
   */
  async findOverview(slug: string): Promise<SportOverview> {
    return this.cache.wrap(
      `${SportsService.CACHE_PREFIX}overview:${slug}`,
      async () => {
        const sport = await this.findBySlug(slug);

        // Independent reads, so they run together rather than in series.
        const [quickFacts, sections, history, governance, formats, concepts, membership, featured] =
          await Promise.all([
            this.overview.facts(sport.id),
            this.overview.sections(sport.id),
            this.overview.timeline(sport.id),
            this.overview.governance(sport.id),
            this.overview.formats(sport.id),
            this.overview.concepts(sport.id),
            this.overview.membership(sport.id),
            this.overview.featured(sport.id, sport.slug),
          ]);

        // Only sources the page actually cites are listed, which is what makes
        // the provenance panel meaningful rather than a dump of every row.
        const sourceIds = [
          ...new Set(history.map((event) => event.sourceId).filter((id): id is string => !!id)),
        ];

        return {
          sport: {
            id: sport.id,
            slug: sport.slug,
            name: sport.name,
            shortCode: sport.shortCode,
            traits: sport.traits,
            summary: sport.summary,
          },
          quickFacts,
          sections,
          history,
          governance,
          formats,
          concepts,
          membership,
          featured,
          sources: await this.overview.sources(sourceIds),
        };
      },
      SportsService.CACHE_TTL_SECONDS,
    );
  }

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
