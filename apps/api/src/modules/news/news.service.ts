import { Injectable } from '@nestjs/common';
import type {
  CursorPaginated,
  NewsArticleDetail,
  NewsArticleSummary,
  NewsListQuery,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import type { TypedConfigService } from '../../config';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { NewsRepository } from './news.repository';

@Injectable()
export class NewsService {
  private static readonly CACHE_PREFIX = 'news:';

  constructor(
    private readonly repository: NewsRepository,
    private readonly cache: CacheService,
    private readonly config: TypedConfigService,
  ) {}

  async list(query: NewsListQuery): Promise<CursorPaginated<NewsArticleSummary>> {
    const ttlSeconds = this.config.get('news.cacheTtlSeconds', { infer: true });

    return this.cache.wrap(
      this.cacheKey(query),
      async () => {
        const { rows, nextCursor } = await this.repository.findPublished(query);
        return {
          data: rows,
          pagination: { limit: query.limit, nextCursor, hasMore: nextCursor !== undefined },
        };
      },
      ttlSeconds,
    );
  }

  async findById(id: string): Promise<NewsArticleDetail> {
    const ttlSeconds = this.config.get('news.cacheTtlSeconds', { infer: true });

    const found = await this.cache.wrap(
      `${NewsService.CACHE_PREFIX}article:${id}`,
      () => this.repository.findPublishedById(id),
      ttlSeconds,
    );

    if (!found) throw AppException.notFound(`No published article "${id}"`);

    return found;
  }

  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(NewsService.CACHE_PREFIX);
  }

  /**
   * One cache key per distinct filter combination, with the two most common
   * cases (the unfiltered feed, and a single sport) kept short and readable
   * for anyone inspecting the cache; everything else falls back to a stable
   * serialisation of the whole query.
   */
  private cacheKey(query: NewsListQuery): string {
    const onlyFilter = (keys: (keyof NewsListQuery)[]) =>
      Object.keys(query).every(
        (key) =>
          keys.includes(key as keyof NewsListQuery) ||
          query[key as keyof NewsListQuery] === undefined,
      );

    if (onlyFilter(['limit', 'cursor']) && !query.cursor) {
      return `${NewsService.CACHE_PREFIX}latest:${query.limit}`;
    }
    if (onlyFilter(['sport', 'limit', 'cursor']) && query.sport && !query.cursor) {
      return `${NewsService.CACHE_PREFIX}sport:${query.sport}:${query.limit}`;
    }

    return `${NewsService.CACHE_PREFIX}query:${JSON.stringify(query)}`;
  }
}
