import { index, pgEnum, pgTable, uniqueIndex, uuid } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * A reader's personal library.
 *
 * Same polymorphic shape as `userFollows` and for the same reason: "saved"
 * spans six unrelated content types (article, explainer, story, player,
 * team, competition) and the profile's Saved page needs to list and filter
 * across all of them in one query. Only `createdAt` is kept — a save is
 * create-or-delete, never edited.
 */
export const savedEntityTypeEnum = pgEnum('saved_entity_type', [
  'article',
  'explainer',
  'story',
  'player',
  'team',
  'competition',
]);

export const savedEntities = pgTable(
  'saved_entities',
  {
    id: primaryId(),
    userId: entityRef('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    entityType: savedEntityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    uniqueIndex('saved_entities_user_entity_idx').on(
      table.userId,
      table.entityType,
      table.entityId,
    ),
    /** The Saved page's default listing: newest first, per user. */
    index('saved_entities_user_id_idx').on(table.userId, table.createdAt),
  ],
);
