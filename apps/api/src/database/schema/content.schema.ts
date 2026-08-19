import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, publicationStatusEnum, timestamps } from './_shared';
import { sport } from './sport.schema';

/**
 * Editorial content: the part of the product we own outright.
 *
 * Four of the seven sections per sport are ours rather than a provider's:
 * Overview, Explainers, Quiz and Social Media Stories. They carry no licensing
 * constraint, no provider dependency and no refresh cadence, which makes them
 * the opposite of everything in the sports-data tables.
 *
 * That difference is strategic, not just architectural. Every competitor can buy
 * the same fixtures. The explainer that makes a statistic meaningful is the
 * defensible asset, so it is modelled as a first-class citizen rather than as
 * text hung off an entity row.
 *
 * The hard rule: **content and entities live in separate tables joined by an
 * explicit link table.** Content references entities; entities never own
 * content. Otherwise a scheduled ingestion run can overwrite a human-written
 * paragraph, which is exactly what happens when editorial fields sit on the
 * entity.
 */

export const contentTypeEnum = pgEnum('content_type', [
  'overview',
  'explainer',
  'story',
  'article',
  'fact',
]);

/**
 * A piece of editorial writing.
 *
 * One table for all types rather than one per type: they share every field that
 * matters (slug, title, body, publication state, entity links) and differ only
 * in where they are rendered. Separate tables would triplicate the link table
 * and the publication logic.
 */
export const content = pgTable(
  'content',
  {
    id: primaryId(),

    /** Null for cross-sport pieces. Set for everything that appears in a sport's tabs. */
    sportId: entityRef('sport_id').references(() => sport.id, { onDelete: 'cascade' }),

    type: contentTypeEnum('type').notNull(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),

    /** One-line summary for cards and meta description. */
    excerpt: text('excerpt'),

    /**
     * The body, as markdown.
     *
     * Rendered server-side. Note that this is the field that makes a Content
     * Security Policy necessary: the repository defers CSP explicitly until real
     * content exists, on the grounds that stored XSS from a content pipeline is
     * the highest-likelihood serious vulnerability for this site. That trigger
     * fires when this table is first populated.
     */
    body: text('body'),

    /**
     * Editorial grouping within a tab: "Rules", "Formats", "Tactics",
     * "Concepts".
     *
     * The Explainers tab needs these headings and they differ per sport, so they
     * are data rather than an enum.
     */
    category: text('category'),

    heroImageUrl: text('hero_image_url'),

    status: publicationStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    /** Ordering within a category. */
    displayOrder: integer('display_order').notNull().default(100),

    /** Reading time, tags, author. Editorial metadata that varies by type. */
    metadata: jsonb('metadata').notNull().default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('content_slug_idx').on(table.type, table.slug),
    /** The tab query: published explainers for this sport, in order. */
    index('content_sport_type_idx').on(table.sportId, table.type, table.status, table.displayOrder),
    index('content_published_idx').on(table.status, table.publishedAt),
  ],
);

/**
 * Links a piece of content to the entities it is about.
 *
 * Many-to-many by nature: one explainer about offside relates to football,
 * several competitions and many players; one player relates to many stories.
 * Only a link table expresses that, and it is what powers the "related
 * SportBrainHQ stories" panel on an entity page.
 */
export const contentEntity = pgTable(
  'content_entity',
  {
    id: primaryId(),
    contentId: entityRef('content_id')
      .notNull()
      .references(() => content.id, { onDelete: 'cascade' }),

    /** Which canonical table the target lives in. Mirrors `mapped_entity`. */
    entityType: text('entity_type').notNull(),
    entityId: entityRef('entity_id').notNull(),

    /**
     * How central the entity is to the piece: `primary` or `mentioned`.
     *
     * A player page should surface stories that are about them, not every story
     * that name-checks them in passing.
     */
    relevance: text('relevance').notNull().default('mentioned'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('content_entity_unique_idx').on(table.contentId, table.entityType, table.entityId),
    /** The entity-page query: stories about this player, most relevant first. */
    index('content_entity_lookup_idx').on(table.entityType, table.entityId, table.relevance),
  ],
);

/**
 * A quiz: per sport, or the cross-sport Master Quiz in the sidebar.
 */
export const quiz = pgTable(
  'quiz',
  {
    id: primaryId(),

    /** Null for the Master Quiz, which spans sports. */
    sportId: entityRef('sport_id').references(() => sport.id, { onDelete: 'cascade' }),

    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description'),

    /** `easy`, `medium`, `hard`. */
    difficulty: text('difficulty').notNull().default('medium'),

    status: publicationStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('quiz_slug_idx').on(table.slug),
    index('quiz_sport_idx').on(table.sportId, table.status),
  ],
);

/**
 * One question.
 *
 * Options are JSONB rather than a fourth table: they are always read with their
 * question, never queried across, and never joined. A table would add a join to
 * every quiz load for no query capability anyone needs.
 *
 * `entityId` is the interesting column. A question linked to a canonical entity
 * can be generated from statistics rather than hand-written, which is how the
 * quiz stays fresh without an editor writing every question. That is the answer
 * to "how do we get new ones" from the brief.
 */
export const quizQuestion = pgTable(
  'quiz_question',
  {
    id: primaryId(),
    quizId: entityRef('quiz_id')
      .notNull()
      .references(() => quiz.id, { onDelete: 'cascade' }),

    prompt: text('prompt').notNull(),

    /** `[{ id, text }]`. Shuffled at render time, not stored shuffled. */
    options: jsonb('options').notNull(),

    /** The `id` of the correct option. */
    correctOptionId: text('correct_option_id').notNull(),

    /** Shown after answering. The explainer mission again, at question level. */
    explanation: text('explanation'),

    /** Optional link to the entity the question is about, enabling generated questions. */
    entityType: text('entity_type'),
    entityId: entityRef('entity_id'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [index('quiz_question_quiz_idx').on(table.quizId, table.displayOrder)],
);

export const contentRelations = relations(content, ({ one, many }) => ({
  sport: one(sport, { fields: [content.sportId], references: [sport.id] }),
  entities: many(contentEntity),
}));

export const contentEntityRelations = relations(contentEntity, ({ one }) => ({
  content: one(content, { fields: [contentEntity.contentId], references: [content.id] }),
}));

export const quizRelations = relations(quiz, ({ one, many }) => ({
  sport: one(sport, { fields: [quiz.sportId], references: [sport.id] }),
  questions: many(quizQuestion),
}));

export const quizQuestionRelations = relations(quizQuestion, ({ one }) => ({
  quiz: one(quiz, { fields: [quizQuestion.quizId], references: [quiz.id] }),
}));
