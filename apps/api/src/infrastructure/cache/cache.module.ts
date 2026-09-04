import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { CacheService, InMemoryCacheService } from './cache.service';
import { RedisCacheService } from './redis-cache.service';

const logger = new Logger('CacheModule');

/**
 * Binds the cache contract to its current implementation.
 *
 * Redis when `REDIS_URL` is configured; the in-memory implementation
 * otherwise. This is the fallback `cache.service.ts` describes: development
 * and any environment that has not provisioned Redis yet keep working with a
 * per-process cache rather than failing to boot, at the cost of the cache
 * being unshared and reset on every restart. Production is expected to
 * configure `REDIS_URL`; nothing here enforces that, because the API's job is
 * to run correctly with either.
 */
@Global()
@Module({
  providers: [
    {
      provide: CacheService,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppConfig, true>) => {
        const redisUrl = config.get('redis.url', { infer: true });
        if (redisUrl) {
          logger.log('REDIS_URL configured, using RedisCacheService');
          return new RedisCacheService(config);
        }
        logger.warn(
          'REDIS_URL not configured, falling back to InMemoryCacheService (per-process, non-durable)',
        );
        return new InMemoryCacheService();
      },
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
