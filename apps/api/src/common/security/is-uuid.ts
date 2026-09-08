const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Guards a route param before it reaches a `uuid`-typed column.
 *
 * Postgres throws `invalid input syntax for type uuid` for anything that
 * isn't a well-formed UUID, and that throws as a raw 500 rather than the
 * 404 a not-found lookup should return — a public, unguessable-id route
 * (share links, public Passport) is exactly where an attacker or a stale
 * bookmark is most likely to hand back garbage. Callers check this first
 * and treat a `false` result as "not found", not as an error.
 */
export function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}
