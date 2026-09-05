import { index, jsonb, pgEnum, pgTable } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * A lightweight, product-facing activity log — not analytics.
 *
 * Powers the profile's "Recent Activity" feed and nothing else: it is
 * written once by the service that performed the action (quiz submission,
 * save, follow), never read by anything but that one feed query, and every
 * event type here is something the user themself deliberately did and would
 * recognise in the list. `metadata` is jsonb because each activity type
 * carries a different payload (score for a quiz, entity type/id for a
 * save/follow) and none of it needs to be queried by SQL, only rendered.
 */
export const activityTypeEnum = pgEnum('activity_type', [
  'quiz_completed',
  'content_saved',
  'entity_followed',
]);

export const userActivities = pgTable(
  'user_activities',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    activityType: activityTypeEnum('activity_type').notNull(),
    metadata: jsonb('metadata').notNull().default({}),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    /** The Recent Activity feed's only access pattern: newest first, per user. */
    index('user_activities_user_id_idx').on(table.userId, table.createdAt),
  ],
);
