import { index, integer, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, publicationStatusEnum, timestamps } from './_shared';

/**
 * The sport overview layer: timelines, governance and provenance.
 *
 * Three tables, added because nothing existing covers them. Editorial prose
 * already has a home in `entity_section` and structured facts in `entity_fact`,
 * and both are reused rather than duplicated here.
 *
 * The design is sport-agnostic on purpose. Football is the first
 * implementation, but a timeline entry, a governing body and a citation mean
 * the same thing for cricket and basketball, so none of these tables carries a
 * football-specific column.
 */

/**
 * A cited source, shared by every fact and section that draws on it.
 *
 * A table rather than columns on each consumer, because one Wikipedia article
 * supports a dozen facts and a shared row means one `retrievedAt` to update
 * rather than a dozen. It also makes "About this information" a real query
 * instead of a hand-maintained list.
 *
 * `revisionId` matters more than it looks: a Wikipedia article is a moving
 * target, and recording which revision a fact came from is the difference
 * between a citation and a guess about what a page said months ago.
 */
export const contentSource = pgTable(
  'content_source',
  {
    id: primaryId(),

    /** `wikipedia`, `wikidata`, `ifab`, `fifa`, `commons`. */
    provider: text('provider').notNull(),

    /** Article or entity title as the provider gives it. */
    title: text('title').notNull(),

    url: text('url').notNull(),

    /** The provider's own identifier: a QID, a page id. */
    externalId: text('external_id'),

    /**
     * Which revision was read.
     *
     * Wikipedia changes continuously, so a citation without a revision says
     * only that a page once contained something.
     */
    revisionId: text('revision_id'),

    /** `CC BY-SA 4.0`, `CC0`, or a bare name where the provider states one. */
    license: text('license'),

    retrievedAt: timestamp('retrieved_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    // One row per provider and URL, so re-running ingestion refreshes the
    // revision rather than accumulating near-duplicate citations.
    uniqueIndex('content_source_unique_idx').on(table.provider, table.url),
    index('content_source_provider_idx').on(table.provider),
  ],
);

/**
 * One dated milestone in a sport's history.
 *
 * Structured rather than a prose blob, which is what lets the same rows serve
 * both the full history timeline and the condensed milestones strip without a
 * second source of truth.
 *
 * `endYear` exists because some milestones are periods rather than moments: the
 * English ban on women's football ran from 1921 to 1971, and recording only its
 * start misrepresents it.
 */
export const sportTimelineEvent = pgTable(
  'sport_timeline_event',
  {
    id: primaryId(),
    sportId: entityRef('sport_id').notNull(),

    year: integer('year').notNull(),

    /** Set when the entry describes a period rather than a single year. */
    endYear: integer('end_year'),

    title: text('title').notNull(),
    shortDescription: text('short_description').notNull(),
    longDescription: text('long_description'),

    /**
     * `origins`, `codification`, `governance`, `competition`, `professionalism`,
     * `technology`, `womens`, `global`.
     *
     * Drives filtering and the visual grouping of a long timeline.
     */
    category: text('category').notNull(),

    /**
     * Whether this belongs in the condensed milestones strip.
     *
     * A flag rather than a separate table, so the two views cannot drift: the
     * strip is a filter over the timeline, not a copy of it.
     */
    isMajorMilestone: text('is_major_milestone').notNull().default('false'),

    /**
     * How confident the dating is.
     *
     * `established` for a documented event, `approximate` where sources give a
     * decade, `disputed` where they disagree. Ancient predecessor games are the
     * reason this exists: claiming a definite origin year for football would be
     * inventing precision the record does not support.
     */
    certainty: text('certainty').notNull().default('established'),

    sourceId: entityRef('source_id').references(() => contentSource.id, { onDelete: 'set null' }),

    status: publicationStatusEnum('status').notNull().default('published'),
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    // Keyed on the title as well as the year, because a year can hold more than
    // one milestone and ingestion must update rather than duplicate.
    uniqueIndex('sport_timeline_unique_idx').on(table.sportId, table.year, table.title),
    index('sport_timeline_lookup_idx').on(table.sportId, table.status, table.year),
    index('sport_timeline_milestone_idx').on(table.sportId, table.isMajorMilestone),
  ],
);

/**
 * A governing body in a sport's organisational hierarchy.
 *
 * Self-referencing through `parentId`, which is what represents FIFA above its
 * six confederations without a table per level. The same shape holds the ICC
 * above its members and FIBA above its zones.
 *
 * Deliberately not folded into `team`: a confederation does not compete, and
 * giving it a row in a table whose every other row plays fixtures would corrupt
 * both counts and queries.
 */
export const governingBody = pgTable(
  'governing_body',
  {
    id: primaryId(),
    sportId: entityRef('sport_id').notNull(),

    /** Null for the world body; set for a confederation beneath it. */
    parentId: entityRef('parent_id'),

    slug: text('slug').notNull(),

    /** `FIFA`, `UEFA`, `CONMEBOL`. */
    shortName: text('short_name').notNull(),
    name: text('name').notNull(),

    /** `world`, `continental`, `national`. */
    level: text('level').notNull(),

    /** The territory it covers, as prose: "Europe", "South America". */
    region: text('region'),

    foundedYear: integer('founded_year'),

    /** Member associations, where the source states a figure. */
    memberCount: integer('member_count'),

    headquarters: text('headquarters'),
    websiteUrl: text('website_url'),
    logoUrl: text('logo_url'),

    sourceId: entityRef('source_id').references(() => contentSource.id, { onDelete: 'set null' }),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('governing_body_slug_idx').on(table.sportId, table.slug),
    index('governing_body_parent_idx').on(table.sportId, table.parentId, table.displayOrder),
  ],
);
