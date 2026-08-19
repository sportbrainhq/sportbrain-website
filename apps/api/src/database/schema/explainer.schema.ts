import { index, integer, jsonb, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, publicationStatusEnum, timestamps } from './_shared';
import { contentSource } from './overview.schema';
import { sport } from './sport.schema';

/**
 * The explainer layer: a knowledge graph of sporting concepts.
 *
 * Deliberately separate from `content`, which holds stories, articles and facts.
 * That table models a piece of writing: one slug, one body, one category. An
 * explainer is a different shape in three ways that no amount of columns on
 * `content` would fix.
 *
 * The first is categorisation. `content.category` is a text column, so it is
 * single-valued, and gegenpressing genuinely belongs under both Pressing and
 * Playing Styles. Two rows for one concept is the failure mode the whole feature
 * exists to avoid, so category membership has to be a relation.
 *
 * The second is structure. A rule, a formation and a metric are not the same
 * article with different words in it: a formation needs player coordinates, a
 * metric needs a section on how providers disagree, a rule needs the clause it
 * is paraphrasing. Sections are rows with a type, so a template is a query
 * rather than a parser.
 *
 * The third is the graph. `content_entity` links writing to entities, which is a
 * different edge from the one needed here: offside relates to the high defensive
 * line, which relates to pressing. Concept-to-concept edges are what let a
 * reader travel, and travelling is the product.
 *
 * Nothing here is football-specific. Categories are rows keyed by sport, so
 * cricket's taxonomy is dismissals and formats rather than formations and
 * pressing, and the framework does not change.
 */

/**
 * What kind of thing the explainer describes.
 *
 * Chooses the page template. An enum rather than free text because the frontend
 * switches on it, and a typo would silently fall through to the default layout.
 */
export const explainerTypeEnum = pgEnum('explainer_type', [
  /** Prose with the standard section set. */
  'standard',
  /** A short glossary entry. Not every term needs an essay. */
  'definition',
  /** A law of the game. Sourced from the governing body, never from memory. */
  'rule',
  /** Carries positional coordinates for a pitch diagram. */
  'formation',
  'tactical_concept',
  /** A metric. Needs the provider-differences section that others do not. */
  'statistic',
  'position_role',
]);

/** Reader level. Data rather than a UI constant, so it can be filtered on. */
export const explainerDifficultyEnum = pgEnum('explainer_difficulty', [
  'beginner',
  'intermediate',
  'advanced',
]);

/**
 * A section of an explainer.
 *
 * Typed rather than positional: templates differ by explainer type, and a reader
 * of the seed data should be able to see that a formation has no "in one
 * sentence" without counting rows.
 */
export const explainerSectionTypeEnum = pgEnum('explainer_section_type', [
  // Shared across templates.
  'one_sentence',
  'simple_explanation',
  'how_it_works',
  'example',
  'why_it_matters',
  'common_misunderstandings',
  'key_takeaways',
  // Rules.
  'the_law',
  'in_practice',
  /** The restart and any card, kept apart from the mechanics of the offence. */
  'sanctions',
  /** A named sub-topic within a rule: deliberate play, semi-automated offside. */
  'edge_cases',
  // Formations and roles.
  'basic_structure',
  'in_possession',
  'out_of_possession',
  'strengths',
  'weaknesses',
  'variations',
  'player_profiles',
  'movement',
  'responsibilities',
  // Statistics.
  'what_it_measures',
  'how_it_is_calculated',
  'how_to_interpret',
  'what_it_does_not_tell_you',
  'provider_differences',
  // Tactical.
  'tactical_application',
  'historical_context',
]);

/**
 * How two explainers relate.
 *
 * Typed edges rather than a bare "related" list, because the relationship
 * carries the meaning: needing to understand the offside line before pressing is
 * a different fact from pressing contrasting with a low block, and a reader
 * following the graph benefits from knowing which.
 */
export const explainerRelationTypeEnum = pgEnum('explainer_relation_type', [
  'related_to',
  /** Target should be read first. */
  'requires_understanding',
  'part_of',
  'contrasts_with',
  'used_in',
  'variation_of',
  'measured_by',
]);

/**
 * A category within one sport's taxonomy.
 *
 * Rows rather than an enum, and keyed by sport, which is the single decision
 * that makes this reusable: football's categories are formations and pressing,
 * cricket's are dismissals and formats, and neither is in the code.
 */
export const explainerCategory = pgTable(
  'explainer_category',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    slug: text('slug').notNull(),
    name: text('name').notNull(),

    /** One line, shown under the heading on the landing page. */
    description: text('description'),

    /** Short form for the category navigation, where "Rules" beats "Rules & Laws". */
    shortName: text('short_name'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_category_slug_idx').on(table.sportId, table.slug),
    index('explainer_category_order_idx').on(table.sportId, table.displayOrder),
  ],
);

/**
 * One concept.
 *
 * The row is metadata only. Body text lives in `explainer_section`, so a
 * template is a set of typed rows rather than a blob a renderer has to parse.
 *
 * `status` defaults to draft on purpose. The taxonomy is seeded far ahead of the
 * writing, so most rows exist before they have content, and the default has to
 * be the state that does not publish an empty page.
 */
export const explainer = pgTable(
  'explainer',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    slug: text('slug').notNull(),
    title: text('title').notNull(),

    /** Optional qualifier: "Juego de Posición" under "Positional Play". */
    subtitle: text('subtitle'),

    /** One line for cards, search results and the meta description. */
    shortDescription: text('short_description'),

    type: explainerTypeEnum('type').notNull().default('standard'),
    difficulty: explainerDifficultyEnum('difficulty').notNull().default('beginner'),

    /**
     * The category the breadcrumb shows.
     *
     * Denormalised from `explainer_category_link` deliberately: a concept in
     * three categories still has one home, and deriving it from the link table
     * would need a tiebreak the data does not carry.
     */
    primaryCategoryId: entityRef('primary_category_id').references(() => explainerCategory.id, {
      onDelete: 'set null',
    }),

    /** Stored rather than computed, so an editor can override a bad estimate. */
    readMinutes: integer('read_minutes'),

    /** Promoted into the beginner path on the landing page. */
    isStartHere: text('is_start_here').notNull().default('false'),
    isFeatured: text('is_featured').notNull().default('false'),

    status: publicationStatusEnum('status').notNull().default('draft'),
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_slug_idx').on(table.sportId, table.slug),
    /** The landing-page query: published explainers for a sport, in order. */
    index('explainer_listing_idx').on(table.sportId, table.status, table.displayOrder),
    index('explainer_category_lookup_idx').on(table.primaryCategoryId, table.status),
    index('explainer_start_here_idx').on(table.sportId, table.isStartHere, table.status),
  ],
);

/**
 * Category membership, many-to-many.
 *
 * The table that stops gegenpressing existing twice. Primary category is on the
 * explainer row; this carries every category it appears under, including that
 * one, so a category listing is one join rather than a union.
 */
export const explainerCategoryLink = pgTable(
  'explainer_category_link',
  {
    id: primaryId(),
    explainerId: entityRef('explainer_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),
    categoryId: entityRef('category_id')
      .notNull()
      .references(() => explainerCategory.id, { onDelete: 'cascade' }),

    /** Position within this category, which can differ from the global order. */
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_category_link_unique_idx').on(table.explainerId, table.categoryId),
    index('explainer_category_link_lookup_idx').on(table.categoryId, table.displayOrder),
  ],
);

/**
 * A typed block of an explainer.
 *
 * `structuredData` is what keeps the schema open. A formation stores its player
 * coordinates there, a metric stores a worked example, and neither needs a
 * column that every other section type would leave null. Prose stays in `body`
 * as markdown, so the two are never confused.
 */
export const explainerSection = pgTable(
  'explainer_section',
  {
    id: primaryId(),
    explainerId: entityRef('explainer_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),

    type: explainerSectionTypeEnum('type').notNull(),

    /** Overrides the type's default heading where the concept needs its own. */
    heading: text('heading'),

    /** Markdown. Rendered as React elements, never as raw HTML. */
    body: text('body'),

    /**
     * Non-prose payload for this section.
     *
     * Formation coordinates, comparison rows, a diagram spec. Shape is decided
     * by `type` and validated at the contract boundary rather than here, because
     * a jsonb check constraint per section type would be unmaintainable.
     */
    structuredData: jsonb('structured_data'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    // One section per type per explainer: the templates are fixed sets, and a
    // duplicate would render the same heading twice.
    uniqueIndex('explainer_section_unique_idx').on(table.explainerId, table.type),
    index('explainer_section_order_idx').on(table.explainerId, table.displayOrder),
  ],
);

/**
 * An alternative name for a concept.
 *
 * Carries the search terms a reader actually types: "xG" for expected goals,
 * "CB" for centre-back. Also the deduplication mechanism, since "counterpress"
 * and "counter-pressing" resolve to one row through here rather than becoming
 * two articles.
 */
export const explainerAlias = pgTable(
  'explainer_alias',
  {
    id: primaryId(),
    explainerId: entityRef('explainer_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),

    alias: text('alias').notNull(),

    /**
     * Lowercased, punctuation-stripped form used for matching.
     *
     * Stored rather than computed per query so the lookup can use an index, and
     * so "Juego de Posición" and "juego de posicion" resolve to the same row.
     */
    normalised: text('normalised').notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_alias_unique_idx').on(table.explainerId, table.normalised),
    /** The search path. Not unique across explainers: an ambiguous alias is possible. */
    index('explainer_alias_lookup_idx').on(table.normalised),
  ],
);

/**
 * A directed edge between two concepts.
 *
 * Directed because the relations are not all symmetric: a false nine is a
 * variation of a striker and not the reverse. Where an edge should read both
 * ways, the seed writes both rows, which is cheaper than a reciprocal flag the
 * queries would all have to honour.
 */
export const explainerRelation = pgTable(
  'explainer_relation',
  {
    id: primaryId(),
    sourceId: entityRef('source_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),
    targetId: entityRef('target_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),

    relationType: explainerRelationTypeEnum('relation_type').notNull().default('related_to'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_relation_unique_idx').on(
      table.sourceId,
      table.targetId,
      table.relationType,
    ),
    index('explainer_relation_lookup_idx').on(table.sourceId, table.displayOrder),
  ],
);

/**
 * Which sources an explainer draws on.
 *
 * Points at `content_source`, the table the Overview already uses, rather than a
 * second provenance mechanism. One IFAB citation therefore serves every rule
 * explainer, and refreshing its revision is one update instead of twenty.
 */
export const explainerSource = pgTable(
  'explainer_source',
  {
    id: primaryId(),
    explainerId: entityRef('explainer_id')
      .notNull()
      .references(() => explainer.id, { onDelete: 'cascade' }),
    sourceId: entityRef('source_id')
      .notNull()
      .references(() => contentSource.id, { onDelete: 'cascade' }),

    /** Which part of the source: a law number, a section heading. */
    locator: text('locator'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_source_unique_idx').on(table.explainerId, table.sourceId),
    index('explainer_source_lookup_idx').on(table.explainerId, table.displayOrder),
  ],
);
