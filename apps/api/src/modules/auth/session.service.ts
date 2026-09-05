import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { signCookieValue, verifySignedCookieValue } from '../../common';
import { AuthRepository, type UserSessionRow } from './auth.repository';

export const SESSION_COOKIE_NAME = 'sbh_session';

/**
 * Server-side session lifecycle: create, validate, revoke.
 *
 * The cookie carries only `user_sessions.id`, HMAC-signed — never a JWT, and
 * never the user id directly, so revoking a session (logout, "log out
 * everywhere", account deletion) is a single database write rather than
 * something a stateless token needs a denylist to achieve. See
 * `database/schema/session.schema.ts` for the full rationale.
 */
@Injectable()
export class SessionService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async createSession(input: {
    userId: string;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<{ cookieValue: string; expiresAt: Date }> {
    const session = this.config.get('auth.session', { infer: true });
    const expiresAt = new Date(Date.now() + session.ttlSeconds * 1000);

    const row = await this.repository.createSession({
      userId: input.userId,
      expiresAt,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return { cookieValue: signCookieValue(row.id, session.secret), expiresAt };
  }

  /** Returns the valid session row, or null if the cookie is missing, tampered, expired, or revoked. */
  async validateSessionCookie(cookieValue: string | undefined): Promise<UserSessionRow | null> {
    if (!cookieValue) return null;

    const session = this.config.get('auth.session', { infer: true });
    const sessionId = verifySignedCookieValue(cookieValue, session.secret);
    if (!sessionId) return null;

    const row = await this.repository.findSessionById(sessionId);
    if (!row) return null;
    if (row.revokedAt) return null;
    if (row.expiresAt.getTime() <= Date.now()) return null;

    return row;
  }

  async revokeSession(sessionId: string): Promise<void> {
    await this.repository.revokeSession(sessionId);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.repository.revokeAllSessionsForUser(userId);
  }

  get cookieName(): string {
    return SESSION_COOKIE_NAME;
  }
}
