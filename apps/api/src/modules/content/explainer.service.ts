import { Injectable } from '@nestjs/common';
import type { ExplainerDetail, ExplainerLibrary, ExplainerSummary } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { ExplainerRepository } from './explainer.repository';

/**
 * The explainer library.
 *
 * Cached for the same reason the rest of the editorial layer is: the content
 * changes when somebody publishes, not when an ingestion run finishes, so a long
 * TTL costs nothing and the landing page assembles several queries.
 */
@Injectable()
export class ExplainerService {
  private static readonly CACHE_PREFIX = 'explainer:';
  private static readonly CACHE_TTL_SECONDS = 1_800;

  constructor(
    private readonly repository: ExplainerRepository,
    private readonly cache: CacheService,
  ) {}

  /** The landing page: start-here, categories with previews, and the search index. */
  async library(sportSlug: string): Promise<ExplainerLibrary> {
    return this.cache.wrap(
      `${ExplainerService.CACHE_PREFIX}library:${sportSlug}`,
      async () => {
        const sport = await this.repository.sport(sportSlug);
        if (!sport) throw AppException.notFound(`No sport with slug "${sportSlug}"`);

        const [startHere, categories, searchIndex] = await Promise.all([
          this.repository.startHere(sport.id),
          this.repository.categories(sport.id),
          this.repository.searchIndex(sport.id),
        ]);

        return {
          sport: { slug: sport.slug, name: sport.name },
          startHere,
          // Categories with nothing published are dropped here rather than in
          // the query, so the repository stays a plain read and the decision
          // about what an empty category means lives in one place.
          categories: categories.filter((category) => category.explainers.length > 0),
          searchIndex,
        };
      },
      ExplainerService.CACHE_TTL_SECONDS,
    );
  }

  async detail(sportSlug: string, slug: string): Promise<ExplainerDetail> {
    return this.cache.wrap(
      `${ExplainerService.CACHE_PREFIX}detail:${sportSlug}:${slug}`,
      async () => {
        const sport = await this.repository.sport(sportSlug);
        if (!sport) throw AppException.notFound(`No sport with slug "${sportSlug}"`);

        const explainer = await this.repository.detail(sport.id, slug);
        if (!explainer) throw AppException.notFound(`No explainer with slug "${slug}"`);
        return explainer;
      },
      ExplainerService.CACHE_TTL_SECONDS,
    );
  }

  async byCategory(sportSlug: string, categorySlug: string): Promise<ExplainerSummary[]> {
    const sport = await this.repository.sport(sportSlug);
    if (!sport) throw AppException.notFound(`No sport with slug "${sportSlug}"`);
    return this.repository.byCategory(sport.id, categorySlug);
  }
}
