import { boolean, jsonb, pgEnum, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * One row per user, everything that isn't already tracked elsewhere.
 *
 * Deliberately does not carry a "favourite sports" list: that's a subset of
 * `userFollows` (entityType = 'sport'), and duplicating it here would give
 * the Preferences page and the Following page two different sources of truth
 * for the same fact. This table is only the settings that have no other
 * natural home — which content types to surface, and email opt-ins.
 */

export const contentPrefTypeEnum = pgEnum('content_pref_type', [
  'news',
  'explainers',
  'history',
  'stats',
  'quizzes',
  'stories',
]);

export const userPreferences = pgTable(
  'user_preferences',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    /** Subset of `contentPrefTypeEnum` values; jsonb since it's small, ordered, and read-mostly. */
    contentTypes: jsonb('content_types').notNull().default([]),

    newsletterWeekly: boolean('newsletter_weekly').notNull().default(false),
    productUpdates: boolean('product_updates').notNull().default(false),

    ...timestamps,
  },
  (table) => [uniqueIndex('user_preferences_user_id_idx').on(table.userId)],
);
