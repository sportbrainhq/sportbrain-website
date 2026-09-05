import { SetMetadata } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/authenticated-user';

export const ROLES_KEY = 'roles';

/** Marks a route as requiring one of the given roles. Read by `RolesGuard`. Apply alongside `SessionGuard`, never instead of it. */
export const Roles = (...roles: AuthenticatedUser['role'][]) => SetMetadata(ROLES_KEY, roles);
