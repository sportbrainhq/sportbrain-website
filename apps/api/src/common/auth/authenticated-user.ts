/**
 * The safe, request-scoped shape `SessionGuard` attaches to `request.user`.
 *
 * Deliberately not the full `users` row: no email, no timestamps, nothing a
 * guard or a `@Roles()` check needs beyond "who is this and what can they
 * do". A handler that needs more reads it back from its own repository,
 * scoped to `id`.
 *
 * Lives in `common/` rather than `modules/auth/` because guards and
 * decorators across several future modules (`modules/users`,
 * `modules/saved-entities`, ...) need this type without importing from
 * `modules/auth` — a cross-module import that would invert the intended
 * dependency direction (feature modules depend on `common/`, not on each
 * other).
 */
export interface AuthenticatedUser {
  id: string;
  role: 'user' | 'editor' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
}
