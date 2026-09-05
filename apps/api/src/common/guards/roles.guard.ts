import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AppException } from '../errors/app.exception';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-user';

/**
 * Enforces `@Roles(...)`. Always applied after `SessionGuard`, which is what
 * puts `request.user` there for this guard to read — a route with `@Roles`
 * but no `SessionGuard` is a wiring bug, not a request this guard can serve.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AuthenticatedUser['role'][]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    if (!request.user) {
      throw new Error('RolesGuard used on a route without SessionGuard applied');
    }

    if (!requiredRoles.includes(request.user.role)) {
      throw AppException.forbidden('Not permitted.');
    }
    return true;
  }
}
