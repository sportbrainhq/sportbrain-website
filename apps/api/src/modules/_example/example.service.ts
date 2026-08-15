import { Injectable } from '@nestjs/common';
import { AppException } from '../../common';
import { CacheService } from '../../infrastructure/cache/cache.service';
import { ExampleRepository } from './example.repository';

/**
 * Service layer: the domain's business logic.
 *
 * This is where decisions live. It knows nothing about HTTP (no request,
 * no response, no status codes) and nothing about SQL, which is what lets it
 * be called from a controller, a scheduled job or another service without
 * changing.
 *
 * Errors are thrown as `AppException`, never returned. The global exception
 * filter turns them into the standard `{ error: { code, message } }` envelope,
 * so no controller needs a try/catch.
 */
@Injectable()
export class ExampleService {
  /** Cache namespace for this domain. Prefixed so it can be invalidated wholesale. */
  private static readonly CACHE_PREFIX = 'example:';
  private static readonly CACHE_TTL_SECONDS = 300;

  constructor(
    private readonly repository: ExampleRepository,
    private readonly cache: CacheService,
  ) {}

  /**
   * A read-through cached fetch. `wrap` returns the cached value or computes,
   * stores and returns it, so the cache cannot be populated inconsistently.
   *
   * ```ts
   * async findBySlug(slug: string): Promise<Example> {
   *   const found = await this.cache.wrap(
   *     `${ExampleService.CACHE_PREFIX}${slug}`,
   *     () => this.repository.findBySlug(slug),
   *     ExampleService.CACHE_TTL_SECONDS,
   *   );
   *
   *   // Throwing here, not in the controller: "this slug does not exist" is a
   *   // domain fact, and every caller should get the same answer.
   *   if (!found) throw AppException.notFound(`No example with slug "${slug}"`);
   *
   *   return found;
   * }
   * ```
   */
  async findAll(): Promise<never[]> {
    return this.cache.wrap(
      `${ExampleService.CACHE_PREFIX}all`,
      () => this.repository.findAll(),
      ExampleService.CACHE_TTL_SECONDS,
    );
  }

  /** Invalidate the whole namespace after a write. */
  async invalidate(): Promise<void> {
    await this.cache.deleteByPrefix(ExampleService.CACHE_PREFIX);
  }

  /** Referenced so the import is not unused. Delete with this file. */
  protected notFound(slug: string): AppException {
    return AppException.notFound(`No example with slug "${slug}"`);
  }
}
