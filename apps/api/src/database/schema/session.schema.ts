import { index, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * Server-side session store.
 *
 * The session cookie carries only this row's id (HMAC-signed to reject
 * tampering before a lookup), never a JWT: a database row is the only way to
 * get real "log out everywhere" and immediate revocation, which a stateless
 * token can't do without also maintaining a denylist — at which point it's a
 * worse version of this table. Postgres rather than Redis for the same
 * reason `REDIS_URL` is optional in `env.schema.ts`: a store that may not be
 * configured in a given deployment cannot be where authentication lives.
 */
export const userSessions = pgTable(
  'user_sessions',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    /** Audit context captured at creation; never used to authorize a request. */
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),

    /**
     * Set on logout instead of deleting the row, so a revoked session leaves
     * an audit trail rather than disappearing. `validateSession` treats
     * `revokedAt IS NOT NULL OR expiresAt < now()` as invalid either way.
     */
    revokedAt: timestamp('revoked_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    /** "Log out everywhere" and the profile's active-sessions view, if ever built. */
    index('user_sessions_user_id_idx').on(table.userId),
    /** The expiry-sweep cleanup job's access pattern. */
    index('user_sessions_expires_at_idx').on(table.expiresAt),
  ],
);
