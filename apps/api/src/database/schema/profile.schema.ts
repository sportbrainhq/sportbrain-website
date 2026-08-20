import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, publicationStatusEnum, timestamps } from './_shared';

/**
 * The rich detail behind an entity page.
 *
 * Three tables, separated by where their content comes from and who is allowed
 * to change it. That separation is the whole point: an ingestion run must be
 * able to refresh facts without touching a paragraph somebody wrote, and an
 * editor must be able to publish without waiting for a sync.
 *
 *   - `entityFact`     ingested key/value facts. Overwritten freely.
 *   - `entitySection`  authored prose. Never touched by ingestion.
 *   - `entityRanking`  derived leaderboards. Recomputed, never edited.
 */

/**
 * A single ingested fact about an entity: nickname, motto, venue, coach.
 *
 * A table rather than more columns on `team`, for two reasons. The set of
 * interesting facts differs per sport and grows constantly, and a column per
 * fact produces a table that is mostly null. More importantly, facts carry
 * provenance and a display order, which a column cannot.
 *
 * Coverage varies enormously between entities, and the page has to survive
 * that: Barcelona carries a motto, an anthem and 49 chairmen, while Real Madrid
 * has none of the first two and one of the third. Rendering is driven by what
 * is present, never by what is expected.
 */
export const entityFact = pgTable(
  'entity_fact',
  {
    id: primaryId(),

    /** `team`, `person` or `competition`. */
    entityType: text('entity_type').notNull(),
    entityId: entityRef('entity_id').notNull(),

    /** Stable key: `nickname`, `motto`, `home_venue`, `head_coach`. */
    key: text('key').notNull(),

    /** Displayed heading. Stored rather than derived so it can be corrected. */
    label: text('label').notNull(),

    /** The fact itself, as display text. */
    value: text('value').notNull(),

    /**
     * Grouping on the page: `identity`, `people`, `commercial`, `venue`.
     *
     * Lets the page render "Nickname" and "Motto" together under Identity
     * without knowing what either means.
     */
    category: text('category').notNull().default('identity'),

    /** Year the fact applies to, where it is historic rather than current. */
    year: integer('year'),

    /**
     * Whether this is the current value of a historic series.
     *
     * Coaches and chairmen are recorded as long lists with start and end dates.
     * The page wants the incumbent by default and the list on request, and this
     * flag is what separates them without a date comparison in every query.
     */
    isCurrent: text('is_current').notNull().default('true'),

    /** Where it came from, so a wrong fact can be traced to its source. */
    source: text('source').notNull().default('wikidata'),

    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('entity_fact_unique_idx').on(
      table.entityType,
      table.entityId,
      table.key,
      table.value,
    ),
    index('entity_fact_lookup_idx').on(table.entityType, table.entityId, table.category),
  ],
);

/**
 * Authored prose about an entity: history, culture, notable eras.
 *
 * This is the part no provider sells. "Barcelona's best eras" is not a fact
 * anybody publishes as data, and writing it is what makes the page worth
 * reading rather than a table dump.
 *
 * Deliberately separate from `entityFact` so that ingestion, which overwrites
 * facts on every run, can never destroy it.
 */
export const entitySection = pgTable(
  'entity_section',
  {
    id: primaryId(),
    entityType: text('entity_type').notNull(),
    entityId: entityRef('entity_id').notNull(),

    /** `history`, `culture`, `eras`, `rivalries`, `legacy`. */
    kind: text('kind').notNull(),

    heading: text('heading').notNull(),

    /** Markdown, rendered without raw HTML. See the note in the web renderer. */
    body: text('body').notNull(),

    status: publicationStatusEnum('status').notNull().default('draft'),
    displayOrder: integer('display_order').notNull().default(100),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('entity_section_unique_idx').on(table.entityType, table.entityId, table.kind),
    index('entity_section_lookup_idx').on(table.entityType, table.entityId, table.status),
  ],
);

/**
 * `source_title` for a leaderboard entered by hand rather than ingested.
 *
 * Around a hundred notable teams have no Wikipedia records article and no
 * parseable list of internationals, so their leaderboards cannot be crawled at
 * all. Those rows are seeded from published figures and marked with this
 * sentinel, which the ingestion upsert refuses to overwrite.
 */
export const MANUAL_RANKING_SOURCE = 'seed:manual';

/**
 * A derived leaderboard: notable scorers, most appearances, roll of honour.
 *
 * Materialised rather than computed per request, because the underlying
 * aggregation walks every membership an entity has and the result changes only
 * when ingestion runs.
 *
 * `confidence` is not decoration. These tables are aggregated from a
 * community-edited source with partial coverage: only about 38% of Barcelona's
 * player spells carry a goals figure, and the raw aggregation surfaces at least
 * one figure that is verifiably wrong. So the rows are shipped as "notable"
 * rather than as a definitive all-time ranking, and this column is what lets
 * the page say so.
 */
export const entityRanking = pgTable(
  'entity_ranking',
  {
    id: primaryId(),
    entityType: text('entity_type').notNull(),
    entityId: entityRef('entity_id').notNull(),

    /** `top_scorers`, `most_appearances`, `roll_of_honour`, `champions`. */
    kind: text('kind').notNull(),

    /** Displayed heading, phrased honestly for the data behind it. */
    label: text('label').notNull(),

    /**
     * The rows, as an ordered array of `{ rank, name, slug, value, detail }`.
     *
     * JSONB rather than a row per entry: a leaderboard is always read whole,
     * never joined across, and a table would add a join to every entity page
     * for no query capability anyone needs.
     */
    entries: jsonb('entries').notNull().default([]),

    /**
     * How much to trust it: `high`, `partial` or `indicative`.
     *
     * Surfaced in the UI. A leaderboard built from 38% coverage is genuinely
     * useful and genuinely not authoritative, and saying which is the difference
     * between an intelligence product and a stats dump that misleads.
     */
    confidence: text('confidence').notNull().default('partial'),

    /** Shown beneath the table: what it was built from and what it omits. */
    note: text('note'),

    /**
     * The article this leaderboard was read from.
     *
     * Recorded because without it a wrong table is undetectable. Atlético
     * Madrid, Real Sociedad and, absurdly, the San Antonio Spurs all held Real
     * Madrid's footballers, and nothing on the row said where the figures came
     * from, so the only way to find the contamination was to hash the entries
     * and look for duplicates across teams. With the source stored, a table
     * whose article does not name its own team is a query.
     */
    sourceTitle: text('source_title'),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('entity_ranking_unique_idx').on(table.entityType, table.entityId, table.kind),
    index('entity_ranking_lookup_idx').on(table.entityType, table.entityId),
  ],
);

export const entityFactRelations = relations(entityFact, () => ({}));
export const entitySectionRelations = relations(entitySection, () => ({}));
export const entityRankingRelations = relations(entityRanking, () => ({}));
