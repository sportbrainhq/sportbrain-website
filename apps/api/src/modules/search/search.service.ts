import { Injectable } from '@nestjs/common';
import type { SearchQuery, SearchResult } from '@sportbrain/contracts';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { SearchRepository } from './search.repository';

@Injectable()
export class SearchService {
  private static readonly CACHE_PREFIX = 'search:';
  /**
   * Short TTL. Search results are cheap to recompute and go stale as soon as
   * ingestion adds an entity, so caching here is about absorbing repeated
   * keystrokes on the same term rather than about avoiding work.
   */
  private static readonly CACHE_TTL_SECONDS = 120;

  constructor(
    private readonly repository: SearchRepository,
    private readonly cache: CacheService,
  ) {}

  async search(query: SearchQuery): Promise<SearchResult[]> {
    // Normalised so that "Messi", "messi" and " messi " share one cache entry.
    const key = `${SearchService.CACHE_PREFIX}${JSON.stringify({
      ...query,
      q: query.q.trim().toLowerCase(),
    })}`;

    return this.cache.wrap(
      key,
      () => this.repository.search(query),
      SearchService.CACHE_TTL_SECONDS,
    );
  }
}
