import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import type { LogoutResponse, SafeUser } from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import {
  CurrentUser,
  resolveSafeRedirect,
  signCookieValue,
  verifySignedCookieValue,
} from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { SessionGuard } from './guards/session.guard';
import { SESSION_COOKIE_NAME } from './session.service';

/** Short-lived cookie carrying the OAuth `state`/PKCE verifier/post-login destination between the two legs of the redirect. */
const OAUTH_HANDOFF_COOKIE = 'sbh_oauth';
const OAUTH_HANDOFF_TTL_MS = 10 * 60 * 1000;

interface OAuthHandoffPayload {
  state: string;
  codeVerifier: string;
  next: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  /**
   * Basic auth audit trail: login/logout/failed-callback, at info/warn level
   * so it lands in the same log pipeline as everything else (see
   * `nestjs-pino` wiring) without a dedicated audit-log table. Deliberately
   * minimal — this is "did auth succeed or fail and for whom", not
   * invasive tracking.
   */
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly authRepository: AuthRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Starts the Google login flow. `next` is where the user lands after a
   * successful login — validated against `FRONTEND_URL` before ever being
   * followed, in `resolveSafeRedirect`, since it's a caller-controlled query
   * param and otherwise an open-redirect vector.
   */
  @Get('google')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Start Google sign-in' })
  async startGoogleLogin(@Req() request: Request, @Res() response: Response): Promise<void> {
    const frontendUrl = this.config.get('auth.frontendUrl', { infer: true });
    const next = resolveSafeRedirect(
      typeof request.query.next === 'string' ? request.query.next : undefined,
      frontendUrl,
    );

    const { authorizationUrl, state, codeVerifier } =
      await this.authService.buildGoogleAuthorizationRequest();

    const payload: OAuthHandoffPayload = { state, codeVerifier, next };
    this.setHandoffCookie(response, payload);

    response.redirect(authorizationUrl);
  }

  /**
   * Google redirects here after the user approves (or denies) access.
   * Verifies `state` against the handoff cookie (CSRF protection for the
   * OAuth flow itself), exchanges the code, opens a session, and redirects
   * to wherever the login started from.
   */
  @Get('google/callback')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleCallback(@Req() request: Request, @Res() response: Response): Promise<void> {
    const frontendUrl = this.config.get('auth.frontendUrl', { infer: true });
    const handoff = this.readHandoffCookie(request);
    this.clearHandoffCookie(response);

    if (!handoff) {
      // No valid handoff cookie: either it expired, was tampered with, or
      // this request didn't come from `startGoogleLogin`. Fail safe to the
      // frontend home rather than attempting the exchange with nothing to
      // verify `state` against.
      this.logger.warn('Google OAuth callback rejected: missing or invalid handoff cookie');
      response.redirect(frontendUrl);
      return;
    }

    const providedState = typeof request.query.state === 'string' ? request.query.state : '';
    if (providedState !== handoff.state) {
      this.logger.warn('Google OAuth callback rejected: state mismatch');
      response.redirect(resolveSafeRedirect(handoff.next, frontendUrl));
      return;
    }

    try {
      const callbackUrl = new URL(
        `${request.protocol}://${request.get('host')}${request.originalUrl}`,
      );

      const { cookieValue, expiresAt } = await this.authService.completeGoogleLogin({
        callbackUrl,
        expectedState: handoff.state,
        codeVerifier: handoff.codeVerifier,
        userAgent: request.header('user-agent') ?? null,
        ipAddress: request.ip ?? null,
      });

      this.setSessionCookie(response, cookieValue, expiresAt);
      this.logger.log('Google sign-in succeeded');
    } catch (error) {
      // Any failure in the exchange (bad code, Google error, verification
      // failure) lands the user back on the frontend, logged out, rather
      // than exposing exchange internals via an error page.
      this.logger.warn(
        `Google OAuth callback failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      response.redirect(resolveSafeRedirect(handoff.next, frontendUrl));
      return;
    }

    response.redirect(resolveSafeRedirect(handoff.next, frontendUrl));
  }

  @Post('logout')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'End the current session' })
  @ApiOkResponse({ description: 'Session revoked and cookie cleared' })
  async logout(@Req() request: Request, @Res() response: Response): Promise<void> {
    const cookieValue = (request.cookies as Record<string, string> | undefined)?.[
      SESSION_COOKIE_NAME
    ];
    const sessionSecret = this.config.get('auth.session.secret', { infer: true });
    const sessionId = cookieValue ? verifySignedCookieValue(cookieValue, sessionSecret) : null;

    if (sessionId) {
      await this.authService.logout(sessionId);
      this.logger.log('Session logged out');
    }

    this.clearSessionCookie(response);
    const body: LogoutResponse = { loggedOut: true };
    response.status(HttpStatus.OK).json(body);
  }

  @Get('me')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: "The signed-in user's safe account info" })
  @ApiOkResponse({ description: 'Safe, user-facing account fields only' })
  async me(@CurrentUser() authUser: AuthenticatedUser): Promise<SafeUser> {
    const user = await this.authRepository.findUserById(authUser.id);
    if (!user) throw new UnauthorizedException('Sign in to continue.');
    return this.authService.toSafeUser(user);
  }

  // --- Cookie helpers --------------------------------------------------------

  private cookieOptions(maxAgeMs: number): CookieOptions {
    const isProduction = this.config.get('isProduction', { infer: true });
    const cookieDomain = this.config.get('auth.session.cookieDomain', { infer: true });
    return {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      domain: cookieDomain,
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  private setSessionCookie(response: Response, cookieValue: string, expiresAt: Date): void {
    response.cookie(
      SESSION_COOKIE_NAME,
      cookieValue,
      this.cookieOptions(expiresAt.getTime() - Date.now()),
    );
  }

  private clearSessionCookie(response: Response): void {
    response.clearCookie(SESSION_COOKIE_NAME, this.cookieOptions(0));
  }

  private setHandoffCookie(response: Response, payload: OAuthHandoffPayload): void {
    const secret = this.config.get('auth.session.secret', { infer: true });
    const signed = signCookieValue(JSON.stringify(payload), secret);
    response.cookie(OAUTH_HANDOFF_COOKIE, signed, {
      ...this.cookieOptions(OAUTH_HANDOFF_TTL_MS),
      // The handoff cookie only needs to survive Google's redirect back to
      // this same host; it does not need the shared parent domain a
      // multi-subdomain session cookie does.
      domain: undefined,
    });
  }

  private readHandoffCookie(request: Request): OAuthHandoffPayload | null {
    const raw = (request.cookies as Record<string, string> | undefined)?.[OAUTH_HANDOFF_COOKIE];
    if (!raw) return null;

    const secret = this.config.get('auth.session.secret', { infer: true });
    const verified = verifySignedCookieValue(raw, secret);
    if (!verified) return null;

    try {
      const parsed = JSON.parse(verified) as Partial<OAuthHandoffPayload>;
      if (
        typeof parsed.state !== 'string' ||
        typeof parsed.codeVerifier !== 'string' ||
        typeof parsed.next !== 'string'
      ) {
        return null;
      }
      return { state: parsed.state, codeVerifier: parsed.codeVerifier, next: parsed.next };
    } catch {
      return null;
    }
  }

  private clearHandoffCookie(response: Response): void {
    response.clearCookie(OAUTH_HANDOFF_COOKIE, { path: '/' });
  }
}
