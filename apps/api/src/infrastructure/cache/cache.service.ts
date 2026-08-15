import { Injectable, Logger } from '@nestjs/common';

/**
 * The cache contract the application codes against.
 *
 * Deliberately narrow. Everything here is satisfiable by an in-memory Map, by
 * Redis, or by a CDN-backed store, so swapping the implementation later does
 * not require touching a single call site.
 */
export abstract class CacheService {
  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  abstract delete(key: string): Promise<void>;
  /** Clears keys under a prefix. Used to invalidate a whole entity family. */
  abstract deleteByPrefix(prefix: string): Promise<void>;
  abstract clear(): Promise<void>;

  /**
   * Read-through helper: returns the cached value, or computes, stores and
   * returns it. This is the method most call sites should use, because it
   * makes the cache impossible to populate inconsistently.
   */
  async wrap<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) return cached;

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}

interface CacheEntry {
  value: unknown;
  expiresAt: number | null;
}

/**
 * In-memory cache, the default implementation.
 *
 * Chosen over Redis for the foundation because there is nothing to cache yet
 * and Redis is a service to run, monitor and pay for. This implementation is
 * correct for a single instance and is genuinely useful for short-TTL caching
 * of expensive reads.
 *
 * Its limits are real and are the trigger to switch:
 *
 *   - Not shared between instances. Two replicas keep two caches.
 *   - Lost on restart.
 *   - Bounded only by MAX_ENTRIES, evicted oldest-first.
 *
 * When any of those becomes a problem, add a RedisCacheService implementing
 * the same abstract class and rebind the provider in CacheModule. No other
 * file changes.
 */
@Injectable()
export class InMemoryCacheService extends CacheService {
  private readonly logger = new Logger(InMemoryCacheService.name);
  private readonly store = new Map<string, CacheEntry>();

  /** Guards against unbounded growth in a long-running process. */
  private static readonly MAX_ENTRIES = 5_000;

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    if (this.store.size >= InMemoryCacheService.MAX_ENTRIES && !this.store.has(key)) {
      // Map preserves insertion order, so the first key is the oldest.
      const oldest = this.store.keys().next();
      if (!oldest.done) {
        this.store.delete(oldest.value);
        this.logger.debug('Cache at capacity, evicted the oldest entry');
      }
    }

    this.store.set(key, {
      value,
      expiresAt: ttlSeconds === undefined ? null : Date.now() + ttlSeconds * 1_000,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<void> {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
