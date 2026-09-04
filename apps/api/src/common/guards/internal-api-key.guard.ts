import { timingSafeEqual } from 'node:crypto';
import { type CanActivate, type ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { AppConfig } from '../../config';
import { AppException } from '../errors/app.exception';

const INTERNAL_API_KEY_HEADER = 'x-internal-api-key';

/**
 * V1 STOPGAP AUTH — read before relying on this in production.
 *
 * This repo has no auth system (no `@nestjs/passport`, no session/JWT
 * handling, no roles) anywhere yet. Rather than inventing one speculatively
 * for this one set of internal endpoints, this guard implements the minimal
 * thing that stops `/internal/news/*` from being wide open: a single shared
 * secret, `INTERNAL_API_KEY`, compared against the `X-Internal-Api-Key`
 * request header.
 *
 * This is explicitly NOT a real auth/authz system: there is one shared
 * secret for every caller, no per-user identity, no roles, no rotation
 * story, and no audit trail beyond request logging. A real system (session-
 * based admin auth, roles, per-operator credentials) is a decision for the
 * team, not something to fabricate here.
 *
 * FAILS CLOSED: if `INTERNAL_API_KEY` is not configured, every request to a
 * guarded route is rejected with 401, and a warning is logged on every such
 * rejection. An unconfigured secret must never be treated as "no auth
 * required" — that would leave operational data (source health, pipeline
 * throughput) on a publicly reachable route.
 */
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(InternalApiKeyGuard.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const configuredKey = this.config.get('security.internalApiKey', { infer: true });

    if (!configuredKey) {
      this.logger.warn(
        `Rejected request to ${request.method} ${request.originalUrl ?? request.url}: ` +
          'INTERNAL_API_KEY is not configured, failing closed.',
      );
      throw AppException.unauthorized('Internal API is not configured.');
    }

    const providedKey = request.header(INTERNAL_API_KEY_HEADER);
    if (!providedKey || !constantTimeEquals(providedKey, configuredKey)) {
      this.logger.warn(
        `Rejected request to ${request.method} ${request.originalUrl ?? request.url}: ` +
          'missing or invalid X-Internal-Api-Key.',
      );
      throw AppException.unauthorized('Invalid or missing internal API key.');
    }

    return true;
  }
}

/**
 * Constant-time string comparison via `crypto.timingSafeEqual`, which throws
 * on a buffer-length mismatch rather than returning false. A naive
 * `provided === configured` check, or letting that throw propagate, both
 * leak timing/error information about the secret's length; this normalises
 * both cases to a plain `false`.
 */
function constantTimeEquals(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, 'utf8');
  const bufferB = Buffer.from(b, 'utf8');
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}
