import { Injectable } from '@nestjs/common';
import type { SafeUser } from '@sportbrain/contracts';
import { AuthRepository, type UserRow } from './auth.repository';
import { GoogleOAuthService, type GoogleIdentity } from './google-oauth.service';
import { SessionService } from './session.service';

/**
 * Orchestrates the login flow. Everything Google-shaped stays inside
 * `GoogleOAuthService`; everything database-shaped stays inside
 * `AuthRepository`. This service is the "what happens on a successful
 * callback" business rule: find-or-create the account, touch last login,
 * open a session — nothing here talks to Google or Postgres directly.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly google: GoogleOAuthService,
    private readonly sessions: SessionService,
  ) {}

  async buildGoogleAuthorizationRequest() {
    return this.google.buildAuthorizationRequest();
  }

  async completeGoogleLogin(params: {
    callbackUrl: URL;
    expectedState: string;
    codeVerifier: string;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<{ cookieValue: string; expiresAt: Date }> {
    const identity = await this.google.exchangeCodeForIdentity({
      callbackUrl: params.callbackUrl,
      expectedState: params.expectedState,
      codeVerifier: params.codeVerifier,
    });

    const user = await this.findOrCreateUser(identity);
    await this.repository.touchLastLogin(user.id);

    return this.sessions.createSession({
      userId: user.id,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    });
  }

  private async findOrCreateUser(identity: GoogleIdentity): Promise<UserRow> {
    const existingIdentity = await this.repository.findIdentity('google', identity.subject);
    if (existingIdentity) {
      const user = await this.repository.findUserById(existingIdentity.userId);
      if (!user) {
        // An identity row pointing at a missing user is a data-integrity
        // bug, not a case to paper over by creating a duplicate account.
        throw new Error(`user_identities row ${existingIdentity.id} has no matching user`);
      }
      return user;
    }

    // First login for this Google account: create the account and its
    // identity link together (see AuthRepository.createUserWithIdentity for
    // why that's one transaction).
    return this.repository.createUserWithIdentity({
      email: identity.email,
      displayName: identity.displayName,
      avatarUrl: identity.avatarUrl,
      provider: 'google',
      providerSubject: identity.subject,
      providerEmail: identity.email,
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revokeSession(sessionId);
  }

  toSafeUser(user: UserRow): SafeUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      memberSince: user.createdAt.toISOString(),
    };
  }
}
