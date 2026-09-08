import { createHmac } from 'node:crypto';
import type { ExecutionContext } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { describe, expect, it } from 'vitest';
import type { AppConfig } from '../../config';
import { AppException } from '../../common/errors/app.exception';
import { NewsletterWebhookGuard } from './newsletter-webhook.guard';

function sign(secret: string, body: unknown): string {
  return createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex');
}

function makeContext(headers: Record<string, string | undefined>, body: unknown): ExecutionContext {
  const request = {
    method: 'POST',
    originalUrl: '/webhooks/email/generic',
    header: (name: string) => headers[name.toLowerCase()],
    body,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

function makeConfig(secret: string | undefined): ConfigService<AppConfig, true> {
  return {
    get: () => secret,
  } as unknown as ConfigService<AppConfig, true>;
}

describe('NewsletterWebhookGuard', () => {
  const body = {
    type: 'delivered',
    providerMessageId: 'stub_abc',
    timestamp: '2026-09-07T08:00:00.000Z',
  };

  it('allows a request with a valid signature', () => {
    const guard = new NewsletterWebhookGuard(makeConfig('correct-secret'));
    const signature = sign('correct-secret', body);
    const context = makeContext({ 'x-newsletter-webhook-signature': signature }, body);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a request with an invalid signature', () => {
    const guard = new NewsletterWebhookGuard(makeConfig('correct-secret'));
    const context = makeContext({ 'x-newsletter-webhook-signature': 'wrong-signature' }, body);

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('rejects a request with no signature header at all', () => {
    const guard = new NewsletterWebhookGuard(makeConfig('correct-secret'));
    const context = makeContext({}, body);

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('fails closed when NEWSLETTER_WEBHOOK_SECRET is not configured, even with a signature supplied', () => {
    const guard = new NewsletterWebhookGuard(makeConfig(undefined));
    const signature = sign('anything', body);
    const context = makeContext({ 'x-newsletter-webhook-signature': signature }, body);

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });

  it('rejects a signature computed over a different body (tamper detection)', () => {
    const guard = new NewsletterWebhookGuard(makeConfig('correct-secret'));
    const signature = sign('correct-secret', { ...body, providerMessageId: 'stub_other' });
    const context = makeContext({ 'x-newsletter-webhook-signature': signature }, body);

    expect(() => guard.canActivate(context)).toThrow(AppException);
  });
});
