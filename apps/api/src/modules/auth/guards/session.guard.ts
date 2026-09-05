import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { AppException } from '../../../common';
import type { AuthenticatedUser } from '../../../common/auth/authenticated-user';
import { AuthRepository } from '../auth.repository';
import { SessionService } from '../session.service';

/**
 * Requires a valid session cookie. Attaches the safe `AuthenticatedUser`
 * shape to `request.user` for `@CurrentUser()` to read.
 *
 * Applied per-controller/per-route, not globally via `APP_GUARD`: this
 * codebase's existing style is explicit-over-implicit (see `@Throttle`
 * overrides in `contact.controller.ts`), and a global auth guard would make
 * "is this route public" something you have to check for an exemption
 * decorator rather than see directly on the route.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly sessions: SessionService,
    private readonly repository: AuthRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();

    const cookieValue = (request.cookies as Record<string, string> | undefined)?.[
      this.sessions.cookieName
    ];
    const session = await this.sessions.validateSessionCookie(cookieValue);
    if (!session) {
      throw AppException.unauthorized('Sign in to continue.');
    }

    const user = await this.repository.findUserById(session.userId);
    if (!user || user.status !== 'active') {
      throw AppException.unauthorized('Sign in to continue.');
    }

    request.user = { id: user.id, role: user.role, status: user.status };
    return true;
  }
}
