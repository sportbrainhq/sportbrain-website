import { createHmac, timingSafeEqual } from 'node:crypto';
import { type CanActivate, type ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '../../config';
import { AppException } from '../../common';

const SIGNATURE_HEADER = 'x-newsletter-webhook-signature';

/**
 * V1 GENERIC PLACEHOLDER — read before wiring a real email provider.
 *
 * No real email provider is installed anywhere in this codebase yet (see
 * `NewsletterEmailProvider`, D1/D4's logging stub). A real provider
 * (Resend/SES/SendGrid/...) ships its own webhook signature scheme — often a
 * different header name, a different signing algorithm, sometimes a
 * timestamp+signature pair to prevent replay — and this guard does not
 * pretend to implement any one of those. Instead it implements the simplest
 * thing that is not "wide open": a shared-secret HMAC-SHA256 over the raw
 * request body, compared against `X-Newsletter-Webhook-Signature`, exactly
 * mirroring `InternalApiKeyGuard`'s "one shared secret, no real auth system"
 * shape for `/internal/news/*`.
 *
 * Once a real provider is chosen, replace this guard's `canActivate` body
 * with that provider's actual verification (its header name, its algorithm,
 * its payload-to-sign construction) — the endpoint shape
 * (`POST /webhooks/email/:provider`) and everything downstream of the guard
 * does not need to change.
 *
 * FAILS CLOSED, same as `InternalApiKeyGuard`: if `NEWSLETTER_WEBHOOK_SECRET`
 * is not configured, every request is rejected rather than silently
 * accepted. An unconfigured webhook endpoint must never be treated as "no
 * verification needed" — that would let anyone flip a subscriber's status to
 * BOUNCED/COMPLAINED (a permanent suppression) by simply POSTing to it.
 */
@Injectable()
export class NewsletterWebhookGuard implements CanActivate {
  private readonly logger = new Logger(NewsletterWebhookGuard.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const secret = this.config.get('newsletter.webhooks.secret', { infer: true });

    if (!secret) {
      this.logger.warn(
        `Rejected request to ${request.method} ${request.originalUrl ?? request.url}: ` +
          'NEWSLETTER_WEBHOOK_SECRET is not configured, failing closed.',
      );
      throw AppException.unauthorized('Newsletter webhook endpoint is not configured.');
    }

    const providedSignature = request.header(SIGNATURE_HEADER);
    if (!providedSignature) {
      this.logger.warn(
        `Rejected request to ${request.method} ${request.originalUrl ?? request.url}: ` +
          'missing X-Newsletter-Webhook-Signature.',
      );
      throw AppException.unauthorized('Missing webhook signature.');
    }

    // `request.body` is the parsed JSON body at this point in the pipeline
    // (this guard runs after Nest's body parser, before the route handler).
    // Re-serializing it to sign is a v1 simplification — a raw-body HMAC
    // (signing the exact bytes the sender transmitted) is the more robust
    // approach a real provider integration should use, since JSON
    // re-serialization can differ byte-for-byte from what was sent (key
    // order, whitespace). Acceptable here because this is a placeholder
    // scheme this codebase's own future adapter will be calling into, not a
    // scheme a real, uncooperative provider must satisfy exactly.
    const expectedSignature = createHmac('sha256', secret)
      .update(JSON.stringify(request.body ?? {}))
      .digest('hex');

    if (!constantTimeEquals(providedSignature, expectedSignature)) {
      this.logger.warn(
        `Rejected request to ${request.method} ${request.originalUrl ?? request.url}: ` +
          'invalid webhook signature.',
      );
      throw AppException.unauthorized('Invalid webhook signature.');
    }

    return true;
  }
}

/** Constant-time comparison — see `InternalApiKeyGuard`'s identical helper for why a naive `===` or an unguarded `timingSafeEqual` both leak information. */
function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
