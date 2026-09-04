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
  /**
   * The cricket templates.
   *
   * Added rather than folded into `rule` and `standard` because each one is a
   * genuinely different page. A dismissal has a decision sequence; a delivery
   * has a release and what the batter expects; a fielding position has
   * coordinates on a circular field, which no football type carries.
   */
  'dismissal',
  'bowling_delivery',
  'batting_technique',
  'field_position',
  'format',
  'technology',
  /**
   * The basketball templates.
   *
   * `play` is a designed action with actors and a sequence, which is a
   * different page from a `tactical_concept` like spacing: it carries a
   * diagram and steps. `court_area` is a region of the floor. `officiating`
   * covers violations and fouls, whose shape is what it is, how it is judged,
   * and how the competitions differ.
   */
  'play',
  'court_area',
  'officiating',
  /**
   * The tennis templates.
   *
   * `shot` is a stroke: what it is, when it is used, what it wins and what it
   * costs. It is not a `play`, because nobody diagrams a forehand as a designed
   * sequence with actors. `playing_style` is how a player combines strokes, and
   * is not a `position_role`, because tennis has no positions to hold.
   * `surface` is its own type because the surface is the axis the sport's
   * records and rankings are split along, and `ranking_concept` covers the
   * points machinery, which is neither a rule of play nor a statistic.
   */
  'shot',
  'playing_style',
  'surface',
  'equipment',
  'ranking_concept',
  /**
   * The Formula 1 templates.
   *
   * `car_component` is the one motorsport cannot borrow: a front wing is not a
   * region of a playing area and not `equipment` in the tennis sense, where a
   * racket is chosen by a player and a diffuser is designed by a team.
   * `procedure` covers the sequences the sport conducts rather than plays (the
   * start, a pit stop, a restart), `strategy_concept` separates pit-wall
   * arithmetic from a pattern of play, `circuit` is the axis performance is
   * split along the way a tennis surface is, and `penalty` and `flag` answer
   * the mid-race lookup a reader actually arrives with.
   */
  'car_component',
  'procedure',
  'strategy_concept',
  'circuit',
  'penalty',
  'flag',
  /**
   * The golf templates.
   *
   * `club` is the one golf cannot borrow: a driver is not `equipment` in the
   * tennis sense of a racket, because the bag is a set of fourteen graded tools
   * and loft, lie, bounce and shaft flex are concepts about the set rather than
   * about a single object. `hole` is golf's `surface` and `circuit`: the ground
   * is the axis performance splits along. `swing_element` is a phase of the
   * motion, which is a different page from a `shot`, the outcome the motion is
   * trying to produce. `handicap_concept` covers the arithmetic that decides
   * who wins a club competition, which is neither a rule of play nor a
   * statistic. `scoring_term` covers par, birdie and the rest: the sport's most
   * common lookup, and worth filtering for without the whole glossary.
   */
  'club',
  'hole',
  'swing_element',
  'handicap_concept',
  'scoring_term',
  /**
   * The MMA templates.
   *
   * `technique` is a strike, takedown or submission: what it is, how it works,
   * when it is used and what it risks, the same shape golf's `shot` types take
   * but for a combat sport rather than a ball-flight one. `position` is a
   * ground or clinch position, which carries a diagram the way golf's `hole`
   * does, but of bodies rather than terrain. `ruleset_concept` covers scoring,
   * fouls and judging mechanics, which are neither a `rule` in football's
   * single-code sense (MMA's rules are a promotion-adopted standard, not a
   * law from one body) nor a `statistic`. `promotion` covers UFC, PFL, ONE and
   * the rest: an organisation that runs events, which is closer to `circuit`
   * than to a `format`, but distinct enough (a promotion sets its own rules
   * and weight limits, a circuit does not) to warrant its own type.
   * `fight_result` covers the ways a bout ends: KO, TKO, decision and the
   * rest, which is the sport's single most common lookup and, like golf's
   * `scoring_term`, worth filtering for without the whole glossary.
   */
  'technique',
  'position',
  'ruleset_concept',
  'promotion',
  'fight_result',
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
  // ── Cricket ──────────────────────────────────────────────────────────────
  // Shared additions. Format differences is the one every cricket concept
  // needs: a statistic, a tactic and a rule all mean different things in a
  // Test and a T20, and burying that inside `how_it_works` is how a reader
  // ends up applying a T20 benchmark to a Test average.
  'format_differences',
  'when_you_will_see_it',
  'step_by_step',
  /** The decision sequence for a dismissal, one clause at a time. */
  'decision_sequence',
  /** How the officials and the technology handle the concept. */
  'reviews_and_technology',
  // Deliveries and technique.
  'grip_and_release',
  'what_the_batter_expects',
  'what_actually_happens',
  'how_batters_counter_it',
  'footwork_and_bat_path',
  'scoring_area',
  'risk',
  'common_mistakes',
  // Fielding positions.
  'position_on_the_field',
  'purpose',
  'when_it_is_used',
  // Formats and structure.
  'duration_and_structure',
  'result_types',
  'who_plays_it',
  // Scoring.
  /**
   * Worked readings of a scoreline, driven by structured data.
   *
   * Three types rather than one, because the unique index on
   * (explainer_id, type) means one explainer can hold only one section per
   * type, and the scoring explainer needs to show a team score, a batting line
   * and a bowling analysis side by side.
   */
  'reading_the_score',
  'reading_a_batting_line',
  'reading_a_bowling_analysis',
  // ── Basketball ───────────────────────────────────────────────────────────
  /**
   * How the leagues differ on this concept.
   *
   * The basketball equivalent of `format_differences`, and the section that
   * keeps one concept on one page. Travelling, the shot clock and a quarter's
   * length are all officiated or timed differently by the NBA, FIBA, the NCAA
   * and the WNBA, and an explainer that silently describes only the NBA teaches
   * the reader that the NBA's rules are basketball's rules.
   */
  'rule_differences',
  /** Reading a box score or a shooting split, as opposed to computing one. */
  'how_to_read_it',
  /** The sequence of an offensive action, usually with a diagram per step. */
  'the_action',
  'how_it_is_defended',
  'counters',
  /** Which part of the floor a concept belongs to. */
  'where_it_happens',
  // ── Tennis ───────────────────────────────────────────────────────────────
  /** The stroke itself: grip, swing path, contact, what the ball then does. */
  'the_shot',
  /** The situations a stroke or a style is chosen in. */
  'when_players_use_it',
  /**
   * What it wins, and what it costs.
   *
   * Two types rather than one `strengths` section, because a drop shot's upside
   * and its downside are the two halves a reader weighs against each other, and
   * a single heading turns a decision into a paragraph.
   */
  'advantages',
  'risks',
  /** Who is associated with the shot, the style or the surface. */
  'notable_players',
  /** Arithmetic rather than illustration: ranking points, a percentage, a sum. */
  'worked_example',
  /** How a format, a draw or a doubles rotation is actually conducted. */
  'how_it_is_played',
  // ── Formula 1 ────────────────────────────────────────────────────────────
  /**
   * A sequence that is conducted rather than played.
   *
   * The starting procedure, a pit stop, a safety car restart, scrutineering.
   * The F1 analogue of basketball's `the_action`: the steps come before the
   * justification, because a reader asking what happens at lights out is not
   * yet asking why it happens that way.
   */
  'the_procedure',
  /** Which part of the car this is, and what it attaches to. */
  'on_the_car',
  /**
   * What it means for the pit wall.
   *
   * Kept apart from `why_it_matters` deliberately. A safety car matters to a
   * spectator because the field closes up and to a strategist because the cost
   * of a pit stop halves, and one paragraph trying to be both serves neither.
   */
  'strategic_implications',
  /** What the driver is physically doing: braking, steering, throttle. */
  'driver_technique',
  /**
   * Which season or regulation era the content describes.
   *
   * A section rather than only `source_revision` on the row, because this one
   * has to be visible. F1's points system, power unit and aerodynamic rules
   * have each been rewritten repeatedly, and an explainer that does not say
   * which era it means is wrong for every other era without admitting it.
   */
  'regulation_era',
  // ── Golf ─────────────────────────────────────────────────────────────────
  /**
   * What the body and the club are doing.
   *
   * Golf's analogue of tennis's `the_shot`, for the swing-mechanics category.
   * Kept separate from `the_shot` rather than folded into it, because a fade is
   * a shot and the downswing is a phase of the motion that produces one, and
   * the unique index on (explainer_id, type) means an explainer covering both
   * could otherwise hold only one of them.
   */
  'the_swing',
  /**
   * Where a feature is on the ground and what it looks like.
   *
   * The course, design and conditions categories all want this before they want
   * how it plays. Basketball's `where_it_happens` is close but describes an
   * action's location; this describes the ground itself.
   */
  'on_the_course',
  /**
   * Which club the concept implies.
   *
   * The decision every golf explainer eventually reaches. Wind, elevation, lie,
   * altitude and temperature each end in "so take one more club", and that is
   * the sentence the reader arrived for: buried inside `how_it_works` it is the
   * one thing they have to hunt for.
   */
  'club_selection',
  /**
   * What a rule costs and what relief it permits.
   *
   * Separate from the mechanics of the rule for the same reason football's
   * `sanctions` is: the stroke count and the relief area are a different
   * paragraph from the definition, and the reader consulting it mid-round wants
   * only that paragraph.
   */
  'penalty_and_relief',
  // ── MMA ──────────────────────────────────────────────────────────────────
  /**
   * What the fighter is physically doing.
   *
   * MMA's analogue of tennis's `the_shot` and golf's `the_swing`: the
   * mechanics of a strike, takedown or submission, kept apart from `example`
   * (a real-fight scenario) and `how_it_works` (the shared, sport-agnostic
   * fallback) because a technique explainer needs both a mechanical
   * description and a scenario, and the unique index on (explainer_id, type)
   * means one explainer can hold only one of each.
   */
  'the_technique',
  /**
   * What a viewer actually sees during a fight.
   *
   * The brief's explicit "how to recognize it" field: distinct from
   * `the_technique` because recognising a guillotine from the broadcast angle
   * is a different skill, and a different paragraph, from knowing how the
   * choke itself works.
   */
  'recognition',
  /**
   * Why a technique or position ends a fight, and what stops it.
   *
   * Submissions and strikes carry a stoppage criterion (a tap, a referee's
   * judgment of "intelligent defense") that a rule of football or a shot in
   * tennis has no equivalent of. Kept apart from `the_technique` so the
   * mechanics and the danger are each their own paragraph.
   */
  'danger_and_stoppage',
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

    /**
     * Whether the content depends on a rule that changes.
     *
     * A no-ball, a powerplay and a DRS protocol are all rewritten periodically
     * by the MCC or by a competition's playing conditions; a cover drive is
     * not. Flagged as data rather than inferred from the type, because the two
     * do not line up: the powerplay explainer is a tactical concept and still
     * needs auditing when the playing conditions change.
     */
    isRuleSensitive: text('is_rule_sensitive').notNull().default('false'),

    /**
     * Which edition of the governing text this was written against.
     *
     * Free text ("MCC 2017 Code, 4th edition, 2022") rather than a foreign key,
     * because the same explainer can be pinned to a Law edition and a set of
     * playing conditions at once, and the value is for a human auditor.
     */
    sourceRevision: text('source_revision'),

    /** When somebody last checked the content against the current rules. */
    lastReviewedAt: text('last_reviewed_at'),

    status: publicationStatusEnum('status').notNull().default('draft'),
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('explainer_slug_idx').on(table.sportId, table.slug),
    /** The audit query: everything rule-sensitive, oldest review first. */
    index('explainer_rule_review_idx').on(
      table.sportId,
      table.isRuleSensitive,
      table.lastReviewedAt,
    ),
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
