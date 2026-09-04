import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import type { AppConfig } from '../../config';
import { AppException } from '../errors/app.exception';
import { InternalApiKeyGuard } from './internal-api-key.guard';

function makeContext(headers: Record<string, string | undefined>): ExecutionContext {
  const request = {
    method: 'GET',
    originalUrl: '/internal/news/status',
    header: (name: string) => headers[name.toLowerCase()],
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function makeConfig(internalApiKey: string | undefined): ConfigService<AppConfig, true> {
  return {
    get: () => internalApiKey,
  } as unknown as ConfigService<AppConfig, true>;
}

describe('InternalApiKeyGuard', () => {
  it('allows a request with the correct key', () => {
    const guard = new InternalApiKeyGuard(makeConfig('correct-secret'));
    const context = makeContext({ 'x-internal-api-key': 'correct-secret' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request with the wrong key', () => {
    const guard = new InternalApiKeyGuard(makeConfig('correct-secret'));
    const context = makeContext({ 'x-internal-api-key': 'wrong-secret' });

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('rejects a request with no key header at all', () => {
    const guard = new InternalApiKeyGuard(makeConfig('correct-secret'));
    const context = makeContext({});

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('fails closed when INTERNAL_API_KEY is not configured, even with a key supplied', () => {
    const guard = new InternalApiKeyGuard(makeConfig(undefined));
    const context = makeContext({ 'x-internal-api-key': 'anything' });

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('does not throw an unhandled error on a length mismatch (timingSafeEqual guard)', () => {
    const guard = new InternalApiKeyGuard(makeConfig('a-very-long-configured-secret-value'));
    const context = makeContext({ 'x-internal-api-key': 'short' });

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('rejects an empty-string key header', () => {
    const guard = new InternalApiKeyGuard(makeConfig('correct-secret'));
    const context = makeContext({ 'x-internal-api-key': '' });

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });
});
