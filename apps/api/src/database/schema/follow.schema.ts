import { index, pgEnum, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { entityRef, timestamps, primaryId } from './_shared';
import { users } from './user.schema';

/**
 * What a reader has chosen to follow.
 *
 * Polymorphic (`entityType` + `entityId`) rather than four separate join
 * tables (userFollowedTeam, userFollowedPlayer, ...), because "everything a
 * user follows" is one query the profile/personalization/newsletter
 * features all need, and four tables turn that into a union every time.
 * `entityId` is not a hard foreign key for the same reason: it points at
 * whichever canonical table `entityType` names, which a single column
 * cannot express as a real FK constraint.
 *
 * Only `createdAt` is kept, not the usual `timestamps` pair: a follow is
 * create-or-delete, never edited in place, so `updatedAt` would never change.
 */
export const followEntityTypeEnum = pgEnum('follow_entity_type', [
  'sport',
  'team',
  'player',
  'competition',
]);

export const userFollows = pgTable(
  'user_follows',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    entityType: followEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    uniqueIndex('user_follows_user_entity_idx').on(table.userId, table.entityType, table.entityId),
    /** "Who follows this team" — future personalization/notification fan-out. */
    index('user_follows_entity_idx').on(table.entityType, table.entityId),
  ],
);
