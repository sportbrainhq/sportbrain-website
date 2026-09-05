import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';

/**
 * Account identity.
 *
 * `users` is the account a reader has with SportBrainHQ; `userIdentities` is
 * how they prove it. Splitting them, rather than putting a `googleSubject`
 * column on `users` directly, is what lets a second provider show up later as
 * a new row instead of a schema migration and a "which provider is this"
 * branch on every query.
 */

export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'deleted']);

export const userRoleEnum = pgEnum('user_role', ['user', 'editor', 'admin']);

export const users = pgTable(
  'users',
  {
    id: primaryId(),

    /**
     * Display/contact email, kept for lookup and UI. Not the authentication
     * key: two Google accounts can theoretically share a recovery email, and
     * a provider can change what email it reports. `userIdentities` is what
     * `/auth/google/callback` actually authenticates against.
     */
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    avatarUrl: text('avatar_url'),

    status: userStatusEnum('status').notNull().default('active'),
    role: userRoleEnum('role').notNull().default('user'),

    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),

    /**
     * Set by account deletion instead of removing the row, so that rows this
     * user owns elsewhere (quiz attempts, activity) keep a valid foreign key
     * without carrying personally identifying data. The deletion service is
     * responsible for scrubbing `email`/`displayName`/`avatarUrl` at the same
     * time it sets this.
     */
    deletedAt: timestamp('deleted_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [uniqueIndex('users_email_idx').on(table.email)],
);

export const authProviderEnum = pgEnum('auth_provider', ['google']);

export const userIdentities = pgTable(
  'user_identities',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    provider: authProviderEnum('provider').notNull(),

    /**
     * The provider's stable subject identifier (Google's `sub`), never the
     * email: this is the actual authentication key, so that a user changing
     * their Google account's email doesn't sever the link to their
     * SportBrainHQ account.
     */
    providerSubject: text('provider_subject').notNull(),

    /** The email the provider reported at last login, for display/support only. */
    providerEmail: text('provider_email').notNull(),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    uniqueIndex('user_identities_provider_subject_idx').on(table.provider, table.providerSubject),
    index('user_identities_user_id_idx').on(table.userId),
  ],
);
