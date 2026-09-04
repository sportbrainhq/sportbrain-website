import { describe, expect, it } from 'vitest';
import type { TypedConfigService } from '../config';
import { QueueService } from './queue.service';

function configWith(redisUrl: string | undefined): TypedConfigService {
  return {
    get: (key: string) => {
      if (key === 'redis.url') return redisUrl;
      throw new Error(`Unexpected config key requested in test: ${key}`);
    },
  } as unknown as TypedConfigService;
}

describe('QueueService without REDIS_URL', () => {
  it('does not throw at construction, and reports disabled', () => {
    const service = new QueueService(configWith(undefined));
    expect(service.enabled).toBe(false);
    expect(service.getFetchQueue()).toBeUndefined();
    expect(service.getProcessQueue()).toBeUndefined();
    expect(service.getConnection()).toBeUndefined();
  });

  it('enqueueFetch logs a warning and resolves without throwing', async () => {
    const service = new QueueService(configWith(undefined));
    await expect(service.enqueueFetch({ sourceId: 'abc' })).resolves.toBeUndefined();
  });

  it('enqueueProcess logs a warning and resolves without throwing', async () => {
    const service = new QueueService(configWith(undefined));
    await expect(service.enqueueProcess({ fetchId: 'abc' })).resolves.toBeUndefined();
  });

  it('onModuleDestroy is a no-op when nothing was constructed', async () => {
    const service = new QueueService(configWith(undefined));
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
