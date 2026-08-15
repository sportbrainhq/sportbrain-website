import { Global, Module } from '@nestjs/common';
import { CacheService, InMemoryCacheService } from './cache.service';

/**
 * Binds the cache contract to its current implementation.
 *
 * This one line is the entire cost of moving to Redis later: provide a
 * RedisCacheService for the CacheService token instead. Nothing that injects
 * CacheService is aware of which implementation it received.
 */
@Global()
@Module({
  providers: [{ provide: CacheService, useClass: InMemoryCacheService }],
  exports: [CacheService],
})
export class CacheModule {}
