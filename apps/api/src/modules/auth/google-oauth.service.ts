import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as client from 'openid-client';
import type { AppConfig } from '../../config';
import { AppException } from '../../common';

export interface GoogleAuthorizationRequest {
  /** The URL to redirect the browser to. */
  authorizationUrl: string;
  /** Opaque values to stash in short-lived cookies and re-check on callback. */
  state: string;
  codeVerifier: string;
}

export interface GoogleIdentity {
  subject: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Thin wrapper around Google's OIDC discovery document, using `openid-client`
 * rather than Passport: this repo has no Passport anywhere (see
 * `common/guards/internal-api-key.guard.ts`'s header comment), and the
 * authorize/exchange/verify flow is a handful of calls, not a framework's
 * worth of strategy/middleware machinery. `openid-client` is used only for
 * what a hand-rolled implementation would get wrong by hand: PKCE, JWKS
 * fetching, and ID-token signature/issuer/audience verification.
 *
 * The discovery document is fetched lazily and cached for the process
 * lifetime — it changes essentially never, and fetching it on every login
 * would be a needless round trip to Google on every request.
 */
@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private configPromise: Promise<client.Configuration> | null = null;

  constructor(private readonly appConfig: ConfigService<AppConfig, true>) {}

  private async getClientConfig(): Promise<client.Configuration> {
    if (!this.configPromise) {
      const google = this.appConfig.get('auth.google', { infer: true });
      this.configPromise = client.discovery(
        new URL('https://accounts.google.com'),
        google.clientId,
        google.clientSecret,
      );
    }
    return this.configPromise;
  }

  /** Builds the URL to send the browser to, plus the values the callback must verify against. */
  async buildAuthorizationRequest(): Promise<GoogleAuthorizationRequest> {
    const config = await this.getClientConfig();
    const google = this.appConfig.get('auth.google', { infer: true });

    const codeVerifier = client.randomPKCECodeVerifier();
    const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
    const state = client.randomState();

    const authorizationUrl = client.buildAuthorizationUrl(config, {
      redirect_uri: google.callbackUrl,
      scope: 'openid email profile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    return { authorizationUrl: authorizationUrl.toString(), state, codeVerifier };
  }

  /**
   * Exchanges the callback's authorization code for tokens and returns the
   * verified identity. Throws `AppException.unauthorized` on any failure
   * (bad code, state/PKCE mismatch, invalid ID token) — the caller does not
   * need to distinguish why the exchange failed, only that login did.
   */
  async exchangeCodeForIdentity(params: {
    callbackUrl: URL;
    expectedState: string;
    codeVerifier: string;
  }): Promise<GoogleIdentity> {
    const config = await this.getClientConfig();

    let tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers;
    try {
      tokens = await client.authorizationCodeGrant(config, params.callbackUrl, {
        expectedState: params.expectedState,
        pkceCodeVerifier: params.codeVerifier,
      });
    } catch (error) {
      this.logger.warn(
        `Google OAuth code exchange failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw AppException.unauthorized('Google sign-in failed. Please try again.');
    }

    const claims = tokens.claims();
    if (!claims) {
      throw AppException.unauthorized('Google sign-in did not return an identity token.');
    }

    const subject = claims.sub;
    const email = typeof claims.email === 'string' ? claims.email : null;
    if (!email) {
      throw AppException.unauthorized('Google account has no email to sign in with.');
    }

    const name = typeof claims.name === 'string' ? claims.name : email;
    const picture = typeof claims.picture === 'string' ? claims.picture : null;

    return { subject, email, displayName: name, avatarUrl: picture };
  }
}
