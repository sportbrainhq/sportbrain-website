import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../auth/authenticated-user';

/**
 * Pulls the authenticated user `SessionGuard` attached to the request.
 *
 * Every handler using this must also apply `SessionGuard` — this decorator
 * does not check auth itself, only reads what the guard already verified.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user) {
      // A wiring bug (SessionGuard missing from this route), not something
      // the caller can fix by retrying.
      throw new Error('@CurrentUser() used on a route without SessionGuard applied');
    }
    return request.user;
  },
);
