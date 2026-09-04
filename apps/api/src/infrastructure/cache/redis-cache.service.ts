import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import type { AppConfig } from '../../config/configuration';
import { CacheService } from './cache.service';

/**
 * Redis-backed cache, for when a single in-memory Map is no longer enough.
 *
 * The trigger for switching to this, per `cache.service.ts`'s own doc comment,
 * is running more than one API replica or needing the cache to survive a
 * restart. `CacheModule` binds this in place of `InMemoryCacheService`
 * whenever `REDIS_URL` is configured; nothing that injects `CacheService` has
 * to know which one it got.
 *
 * Every method fails open: a Redis error is logged and treated as a cache
 * miss (for reads) or a no-op (for writes), never rethrown. A cache is an
 * optimisation, and a request should return correct data slowly rather than
 * fail outright because the cache happened to be unreachable.
 */
@Injectable()
export class RedisCacheService extends CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly client: Redis;

  constructor(config: ConfigService<AppConfig, true>) {
    super();
    const url = config.get('redis.url', { infer: true });
    if (!url) {
      // CacheModule only constructs this class when a URL is configured, so
      // reaching here means that invariant broke. Failing fast is correct:
      // silently falling back would leave the operator believing Redis is in
      // use when it is not.
      throw new Error('RedisCacheService constructed without redis.url configured');
    }

    this.client = new Redis(url, {
      // Bounded retry rather than ioredis's default of retrying forever, so a
      // Redis outage surfaces as cache-miss behaviour (see the fail-open
      // methods below) instead of an ever-growing queue of pending commands.
      maxRetriesPerRequest: 2,
      lazyConnect: false,
    });

    this.client.on('error', (error) => {
      this.logger.warn(
        `Redis connection error, cache reads/writes will fail open: ${error.message}`,
      );
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit().catch(() => undefined);
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const raw = await this.client.get(key);
      if (raw === null) return undefined;
      return JSON.parse(raw) as T;
    } catch (error) {
      this.logger.warn(
        `Cache get failed for "${key}", treating as a miss: ${this.describe(error)}`,
      );
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const serialised = JSON.stringify(value);
      if (ttlSeconds === undefined) await this.client.set(key, serialised);
      else await this.client.set(key, serialised, 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(
        `Cache set failed for "${key}", continuing without caching it: ${this.describe(error)}`,
      );
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(`Cache delete failed for "${key}": ${this.describe(error)}`);
    }
  }

  /**
   * Clears keys under a prefix using `SCAN` rather than `KEYS`, so this never
   * blocks the Redis event loop the way `KEYS` does on a large keyspace.
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          200,
        );
        cursor = nextCursor;
        if (keys.length > 0) await this.client.del(...keys);
      } while (cursor !== '0');
    } catch (error) {
      this.logger.warn(`Cache deleteByPrefix failed for "${prefix}": ${this.describe(error)}`);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      this.logger.warn(`Cache clear failed: ${this.describe(error)}`);
    }
  }

  private describe(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
