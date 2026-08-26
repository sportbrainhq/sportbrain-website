import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
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

    /**
     * When `memberCount` was read.
     *
     * Membership changes: the ICC has suspended, expelled and admitted members
     * within the last few years, and a bare count with no date silently becomes
     * a false claim. The page renders the figure with its date, so a stale
     * number reads as a historical fact rather than a current one.
     */
    memberCountAsOf: timestamp('member_count_as_of', { withTimezone: true }),

    /**
     * The membership class this body holds within its parent, where the parent
     * grades its members: `full`, `associate`, or null where it does not.
     *
     * Football has no equivalent, because FIFA's confederations are peers that
     * divide the world geographically. The ICC grades its members instead, and
     * Full Membership is what confers Test status, so the distinction is
     * structural rather than cosmetic. Null for every football row.
     */
    membershipTier: text('membership_tier'),

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

/**
 * One format a sport is played in, and where it sits in the format hierarchy.
 *
 * Added because cricket cannot be described honestly without it. Football has
 * one format and its Overview needs no such table; cricket has a taxonomy whose
 * distinctions are routinely got wrong, and getting them wrong in the database
 * guarantees getting them wrong on every page built on top of it.
 *
 * The three columns that matter are `matchClass`, `isInternational` and
 * `parentId`, and they are separate on purpose:
 *
 *   - **Test cricket is not all first-class cricket.** Both are multi-day and
 *     both give each side two innings, but a Test is the international subset.
 *     A County Championship match is first-class and not a Test.
 *   - **An ODI is not all List A cricket.** Same relationship one level down.
 *   - **A T20I is not all T20 cricket.** The IPL is not international.
 *
 * A single `format` string would collapse those pairs, which is exactly the
 * error this table exists to prevent. `matchClass` carries what kind of cricket
 * it is; `isInternational` carries who is playing it; the two vary
 * independently.
 *
 * Sport-agnostic despite the motivation: a `matchClass` of `multi_day` and a
 * null `oversPerSide` describe a Test, and the same columns would describe
 * rugby sevens against fifteens or tennis best-of-three against best-of-five.
 */
export const sportFormat = pgTable(
  'sport_format',
  {
    id: primaryId(),
    sportId: entityRef('sport_id').notNull(),

    /** Stable key: `test`, `first_class`, `odi`, `list_a`, `t20i`, `t20`. */
    key: text('key').notNull(),

    /** Displayed name: "Test cricket", "First-class cricket". */
    label: text('label').notNull(),

    /**
     * The parent in the taxonomy, or null for a top-level branch.
     *
     * Self-referencing so the tree renders as a tree. `test` hangs beneath
     * `multi_day`, not beside it, and the nesting is what tells a reader that a
     * Test is a kind of multi-day cricket rather than an alternative to it.
     */
    parentId: entityRef('parent_id'),

    /**
     * The structural class of the match: `multi_day`, `limited_overs`, or a
     * grouping node such as `one_day` or `t20`.
     *
     * Distinct from `key` because several formats share a class. Test and
     * first-class are both `multi_day`; ODI and List A are both
     * `limited_overs`.
     */
    matchClass: text('match_class').notNull(),

    /**
     * Whether this format is played between representative national sides.
     *
     * `true` for Test, ODI and T20I; `false` for first-class, List A and
     * domestic T20; null for a grouping node where the question does not apply.
     *
     * The column that stops `Test = first-class`. Nullable rather than
     * defaulted, because "not applicable" and "not international" are different
     * answers and a default would silently merge them.
     */
    isInternational: boolean('is_international'),

    /** Overs available to each side, or null where the format sets no limit. */
    oversPerSide: integer('overs_per_side'),

    /**
     * Innings each side normally has: two for multi-day, one for limited overs.
     *
     * "Normally" is doing real work. A Test side may bat once if the match ends
     * early, and the follow-on changes the order rather than the entitlement,
     * so this is the standard structure and not a guarantee about any given
     * match.
     */
    inningsPerSide: integer('innings_per_side'),

    /** Typical maximum duration in days, where the format has one. */
    maxDays: integer('max_days'),

    /** Whether a match can end with no winner and no tie. */
    drawPossible: boolean('draw_possible'),

    /** One or two sentences. Overview-level; mechanics belong in Explainers. */
    description: text('description'),

    /**
     * Which body's rules define the format's playing conditions.
     *
     * Recorded because the MCC Laws and a competition's playing conditions are
     * not the same document, and a page that presents an ICC over limit as a
     * Law of Cricket is wrong. `mcc` for the Laws, `icc` for international
     * playing conditions, a board or competition name otherwise.
     */
    conditionsAuthority: text('conditions_authority'),

    sourceId: entityRef('source_id').references(() => contentSource.id, { onDelete: 'set null' }),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('sport_format_unique_idx').on(table.sportId, table.key),
    index('sport_format_tree_idx').on(table.sportId, table.parentId, table.displayOrder),
  ],
);

/**
 * A term a newcomer must know before the sport makes sense.
 *
 * The Overview's job is to introduce vocabulary, not to teach rules, and this
 * table holds exactly that: "a wicket is three things depending on context" is
 * an Overview fact, while what constitutes a legitimate delivery is not.
 *
 * `explainerSlug` is the boundary made concrete. Each concept points at the
 * Explainer that teaches it properly, so the Overview can stay short and still
 * lead somewhere. Nullable, and deliberately not a foreign key: the Overview is
 * written before the Explainers exist, and a constraint here would either block
 * that or force placeholder explainers to be created to satisfy it. The API
 * checks which slugs resolve and the page links only those.
 */
export const sportConcept = pgTable(
  'sport_concept',
  {
    id: primaryId(),
    sportId: entityRef('sport_id').notNull(),

    /** Stable key: `batter`, `bowler`, `wicket`, `pitch`, `over`, `innings`. */
    key: text('key').notNull(),

    /** The term as a reader meets it: "Wicket", "Wicketkeeper". */
    term: text('term').notNull(),

    /** One or two sentences. If it needs three, it belongs in an Explainer. */
    summary: text('summary').notNull(),

    /**
     * Grouping: `role` for the people, `equipment` and `area` for the
     * furniture, `structure` for units of play such as an over or an innings.
     */
    category: text('category').notNull().default('concept'),

    /**
     * Set where the term means more than one thing.
     *
     * "Wicket" is the reason this exists: it is the stumps, a dismissal, and
     * colloquially the pitch. Flattening that into one definition teaches a
     * newcomer something they will have to unlearn.
     */
    ambiguityNote: text('ambiguity_note'),

    /** Slug of the Explainer that teaches this properly. Not a foreign key; see above. */
    explainerSlug: text('explainer_slug'),

    sourceId: entityRef('source_id').references(() => contentSource.id, { onDelete: 'set null' }),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('sport_concept_unique_idx').on(table.sportId, table.key),
    index('sport_concept_lookup_idx').on(table.sportId, table.category, table.displayOrder),
  ],
);

/**
 * A canonical entity featured in a sport's Overview.
 *
 * The Overview names real people, clubs and competitions: Michael Jordan under
 * icons, the Boston Celtics under the teams that shaped the sport, the NBA
 * under major competitions. Those are rows we already hold, and the whole
 * reason to model this rather than write the names into prose is that a card
 * should link to the canonical entity instead of duplicating it.
 *
 * So this table stores the *editorial* part only: which entity, in which
 * section, in what order, and the one line of context explaining why it is
 * there. Name, image and career detail are read from the entity itself at query
 * time, which means a player's page and their Overview card can never disagree.
 *
 * ## Why a nullable entity id
 *
 * `entityId` resolves at seed time and is allowed to stay null. Coverage of the
 * canonical tables is uneven and always will be: at the time of writing the
 * database has Michael Jordan and the Celtics but not Wilt Chamberlain, and it
 * has the NBA and EuroLeague but not EuroBasket. A card with no entity still
 * renders from `displayName` and `blurb`, simply without a link.
 *
 * The alternative, dropping any card whose entity is missing, would silently
 * shorten the icons list to whoever happens to have been ingested, which is an
 * editorial decision made by an ingestion gap. Better to show the name and gain
 * the link later, and `entity_id IS NULL` is then a work queue.
 *
 * Sport-agnostic, like everything else in this file. Football's legendary
 * clubs and cricket's great sides are the same shape.
 */
export const overviewEntityRef = pgTable(
  'overview_entity_ref',
  {
    id: primaryId(),
    sportId: entityRef('sport_id').notNull(),

    /** Which Overview block this belongs to: `icons`, `teams`, `competitions`. */
    section: text('section').notNull(),

    /** `person`, `team` or `competition`. Decides which table `entityId` points at. */
    entityType: text('entity_type').notNull(),

    /**
     * The canonical row, where one exists.
     *
     * Not a foreign key, because the target table varies by `entityType` and
     * Postgres has no polymorphic reference. Resolved by slug at seed time.
     */
    entityId: entityRef('entity_id'),

    /** The slug the seed looked for. Kept so an unresolved card can be retried. */
    entitySlug: text('entity_slug'),

    /** Shown on the card. Authored rather than read from the entity, so the
     * card reads well even when nothing is linked. */
    displayName: text('display_name').notNull(),

    /** Why this entity is here: one line, editorial. "Six titles with the Bulls." */
    blurb: text('blurb'),

    /** Free context for the card: an era, a country, a founding year. */
    meta: text('meta'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('overview_entity_ref_unique_idx').on(
      table.sportId,
      table.section,
      table.displayName,
    ),
    index('overview_entity_ref_lookup_idx').on(table.sportId, table.section, table.displayOrder),
  ],
);
