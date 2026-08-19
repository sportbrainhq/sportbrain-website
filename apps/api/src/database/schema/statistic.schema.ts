import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { competition, person, season, team } from './entity.schema';
import { discipline, sport } from './sport.schema';

/**
 * The statistics model.
 *
 * The design problem: football counts goals, assists and clean sheets; cricket
 * counts runs, wickets, strike rate and economy; Formula 1 counts poles, podiums
 * and fastest laps. Fifteen sports means fifteen incompatible vocabularies, and
 * the schema has to absorb that without a migration per sport.
 *
 * Three rejected approaches, and why:
 *
 *   - **A table per sport** gives fast queries and full type safety, but every
 *     new sport is new tables, new repositories and new API surface, and any
 *     cross-sport question needs a union across all of them.
 *   - **EAV** (one row per statistic) is maximally flexible and unusable: every
 *     entity page becomes a pivot, every leaderboard a self-join, and row counts
 *     reach the hundreds of millions.
 *   - **Pure JSONB** invites silent drift, where one ingestion run writes
 *     `goals` and the next writes `goals_scored`, and nothing notices.
 *
 * What is used instead: **split by query pattern, governed by a registry.**
 * Statistics that are sorted, filtered or ranked get typed columns. Everything
 * else lives in a JSONB payload whose keys are validated against
 * `statisticDefinition` on write. The registry is what separates this from the
 * rejected pure-JSONB approach.
 */

/**
 * How a statistic combines when rolling season rows up into a career total.
 *
 * Without this declared as data, something has to hard-code that runs sum and
 * batting average does not, and that logic will be wrong for at least one sport.
 * `none` means the value is meaningless outside its own row.
 */
export const aggregationEnum = pgEnum('stat_aggregation', [
  'sum',
  'average',
  'max',
  'min',
  'last',
  'none',
  'derived',
]);

/** Controls rendering: an integer, a two-decimal average, a percentage, a duration. */
export const statFormatEnum = pgEnum('stat_format', [
  'integer',
  'decimal',
  'percentage',
  'duration',
  'ratio',
  'text',
]);

/**
 * The vocabulary of every statistic the system understands.
 *
 * This table is the reason a new sport is data entry rather than a migration.
 * It earns its place four times over:
 *
 *   1. **Validation.** Ingestion rejects unregistered keys, so drift is caught
 *      at write time rather than discovered on a page.
 *   2. **Presentation.** The website renders statistics generically from this
 *      metadata, so adding a sport needs no front-end work to display its
 *      numbers correctly.
 *   3. **Aggregation.** Career totals are computed from `aggregation`, not from
 *      hard-coded rules.
 *   4. **Explainers.** SportBrainHQ is an intelligence product, and this is
 *      where "what is a strike rate" lives, next to the number itself.
 */
export const statisticDefinition = pgTable(
  'statistic_definition',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    /**
     * The discipline this definition belongs to, where the sport has them.
     *
     * Null means the statistic applies to the sport as a whole. Set means it is
     * specific to one division of it: `batting_average` is meaningful in Test
     * cricket and in T20, but they are different statistics with different
     * typical values, and a player page shows them side by side rather than
     * merged.
     *
     * This is also what lets one sport hold two disjoint statistic sets: a
     * goalkeeper's registry entries and an outfielder's need never collide.
     */
    disciplineId: entityRef('discipline_id').references(() => discipline.id, {
      onDelete: 'cascade',
    }),

    /** The JSONB payload key: `goals`, `runs`, `wickets`, `pole_positions`. */
    key: text('key').notNull(),

    /** Column heading: "Goals", "Runs", "Pole Positions". */
    label: text('label').notNull(),

    /** Compact heading for dense tables: "G", "R", "W". */
    shortLabel: text('short_label'),

    /**
     * Which subject this statistic describes.
     *
     * `player`, `team`, or `both`. Prevents a team-only statistic being offered
     * on a player page.
     */
    appliesTo: text('applies_to').notNull().default('player'),

    /**
     * Grouping on the entity page: "Batting", "Bowling", "Fielding",
     * "Goalkeeping", "Discipline".
     *
     * The screenshots call for exactly this: a team page shows most runs and
     * most wickets under different headings.
     */
    category: text('category'),

    aggregation: aggregationEnum('aggregation').notNull().default('sum'),
    format: statFormatEnum('format').notNull().default('integer'),

    /** Decimal places when `format` is decimal. */
    precision: integer('precision').notNull().default(0),

    /** Whether a higher value is better. Drives leaderboard sort direction and colouring. */
    higherIsBetter: boolean('higher_is_better').notNull().default(true),

    /** Ordering within its category. */
    displayOrder: integer('display_order').notNull().default(100),

    /**
     * Whether this statistic appears in the summary strip at the top of an
     * entity page, as opposed to the full table lower down.
     */
    isHeadline: boolean('is_headline').notNull().default(false),

    /** Editorial definition. The data layer meeting the explainer mission. */
    description: text('description'),

    /**
     * For `derived` aggregation: how to compute it from other keys.
     *
     * Example: batting average is runs divided by dismissals, not the mean of
     * per-season averages. Interpreted by the aggregation job, never by SQL.
     */
    formula: jsonb('formula'),
    ...timestamps,
  },
  (table) => [
    /**
     * Keyed by discipline as well as sport, because `batting_average` must be
     * definable once for Test and again for T20 without colliding.
     *
     * Postgres treats nulls as distinct in a unique index, so sport-wide
     * definitions (discipline null) are additionally guarded by the partial
     * index below rather than by this one.
     */
    uniqueIndex('statistic_definition_unique_idx').on(table.sportId, table.disciplineId, table.key),
    /** Enforces uniqueness for sport-wide definitions, which the index above cannot. */
    uniqueIndex('statistic_definition_sport_wide_idx')
      .on(table.sportId, table.key)
      .where(sql`${table.disciplineId} IS NULL`),
    index('statistic_definition_sport_idx').on(table.sportId, table.category, table.displayOrder),
  ],
);

/**
 * A person's aggregated statistics for one scope.
 *
 * "Scope" is the trick that collapses what would otherwise be three tables
 * (career, season, competition) into one. A row is identified by which of the
 * optional foreign keys are set:
 *
 *   - season set, competition set  -> "Messi, La Liga 2011/12"
 *   - season null, competition set -> "Messi, La Liga, all time"
 *   - both null                    -> "Messi, career"
 *
 * Every row here is **derived** from `participation` and can be dropped and
 * rebuilt. Nothing writes to it except the aggregation job.
 */
export const personStatistic = pgTable(
  'person_statistic',
  {
    id: primaryId(),
    personId: entityRef('person_id')
      .notNull()
      .references(() => person.id, { onDelete: 'cascade' }),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    /** Null for career-level rows. */
    competitionId: entityRef('competition_id').references(() => competition.id, {
      onDelete: 'cascade',
    }),

    /** Null for all-time rows. */
    seasonId: entityRef('season_id').references(() => season.id, { onDelete: 'cascade' }),

    /** Null for scopes that span clubs, set when the scope is club-specific. */
    teamId: entityRef('team_id').references(() => team.id, { onDelete: 'cascade' }),

    /**
     * Which division of the sport this row measures.
     *
     * Null means the sport as a whole. Set means the row is confined to one
     * discipline, which is what keeps Kohli's Test career and his T20 career as
     * two rows that are never summed. Without this column they would collide on
     * the unique index below and one would silently overwrite the other.
     */
    disciplineId: entityRef('discipline_id').references(() => discipline.id, {
      onDelete: 'cascade',
    }),

    /**
     * Denormalised scope discriminator: `career`, `season`, `competition`,
     * `competition_season`, `team`.
     *
     * Redundant with the null-pattern above, and worth it: a partial index on a
     * text equality is far cheaper than one on four IS NULL predicates, and
     * every query filters on exactly this.
     */
    scope: text('scope').notNull(),

    /**
     * Universal typed columns.
     *
     * Deliberately few. These are the ones that are sorted, filtered or shown in
     * league tables for nearly every sport, so they need real indexes. Resist
     * growing this set: each addition is a migration across all sports.
     */
    appearances: integer('appearances').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    draws: integer('draws').notNull().default(0),
    losses: integer('losses').notNull().default(0),

    /**
     * The sport's headline scoring quantity: goals in football, runs in cricket,
     * championship points in F1.
     *
     * `numeric` rather than integer because some sports score in fractions.
     * Which statistic this represents is declared per sport in the registry.
     */
    primaryValue: numeric('primary_value', { precision: 12, scale: 3 }),

    /**
     * Everything else, keyed by `statistic_definition.key`.
     *
     * Read with the entity and displayed on its page. Not used for cross-entity
     * sorting; anything that becomes hot gets promoted to a typed column or a
     * generated column with an index over the JSONB path.
     */
    stats: jsonb('stats').notNull().default({}),

    /** When the aggregation job last rebuilt this row. */
    computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    /**
     * Nulls are coalesced to a sentinel UUID before being indexed.
     *
     * A plain unique index over these columns does not do what it looks like it
     * does: Postgres treats nulls as distinct, so a career row (competition,
     * season, team and discipline all null) never conflicts with itself and the
     * seeder inserted a fresh duplicate on every run. Messi ended up with four
     * identical honours rows, which the API dutifully rendered four times.
     *
     * Coalescing makes the null case a real value, so the constraint applies to
     * exactly the rows it was always meant to cover. The sentinel is the nil
     * UUID, which cannot collide with a generated one.
     */
    uniqueIndex('person_statistic_unique_idx').on(
      table.personId,
      table.scope,
      sql`coalesce(${table.competitionId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(${table.seasonId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(${table.teamId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(${table.disciplineId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
    ),
    index('person_statistic_lookup_idx').on(table.personId, table.scope, table.disciplineId),
    /** Serves leaderboards: "most Test runs", "most goals in La Liga 2011/12". */
    index('person_statistic_leaderboard_idx').on(
      table.sportId,
      table.scope,
      table.disciplineId,
      table.competitionId,
      table.seasonId,
      table.primaryValue,
    ),
  ],
);

/**
 * A team's aggregated statistics. Same scope mechanism as `personStatistic`.
 *
 * Separate table rather than a shared one with a nullable subject, because the
 * two are queried differently and a shared table would need every index twice
 * over with a discriminator, for no benefit.
 */
export const teamStatistic = pgTable(
  'team_statistic',
  {
    id: primaryId(),
    teamId: entityRef('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),
    competitionId: entityRef('competition_id').references(() => competition.id, {
      onDelete: 'cascade',
    }),
    seasonId: entityRef('season_id').references(() => season.id, { onDelete: 'cascade' }),

    /** Same purpose as on `person_statistic`: India's Test record is not their T20 record. */
    disciplineId: entityRef('discipline_id').references(() => discipline.id, {
      onDelete: 'cascade',
    }),

    scope: text('scope').notNull(),

    played: integer('played').notNull().default(0),
    wins: integer('wins').notNull().default(0),
    draws: integer('draws').notNull().default(0),
    losses: integer('losses').notNull().default(0),

    /** Points where the sport has them; null where it does not. */
    points: numeric('points', { precision: 12, scale: 3 }),

    /** Position in the table at the end of the scope. Null for knockout formats. */
    position: integer('position'),

    stats: jsonb('stats').notNull().default({}),
    computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    /** Same null-coalescing as `person_statistic`, for the same reason. */
    uniqueIndex('team_statistic_unique_idx').on(
      table.teamId,
      table.scope,
      sql`coalesce(${table.competitionId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(${table.seasonId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
      sql`coalesce(${table.disciplineId}, '00000000-0000-0000-0000-000000000000'::uuid)`,
    ),
    index('team_statistic_standings_idx').on(table.seasonId, table.position),
    index('team_statistic_lookup_idx').on(table.teamId, table.scope, table.disciplineId),
  ],
);

/**
 * A competition's own statistics, for the Competitions tab.
 *
 * The third subject, alongside people and teams, and genuinely distinct from
 * both. "Most goals in World Cup history" is a fact about the World Cup that
 * happens to name a player; it is not a fact about that player's career, and
 * storing it on `person_statistic` would make it unfindable from the
 * competition page without scanning every player.
 *
 * Two kinds of row live here, distinguished by whether `recordPersonId` or
 * `recordTeamId` is set:
 *
 *   - **Aggregates**: totals and averages describing the competition itself,
 *     such as matches played, total goals, average runs per over.
 *   - **Records**: an extreme value together with who holds it, such as the
 *     highest team total in the IPL or the fastest lap at Monaco.
 *
 * Scope follows the same convention as the other statistics tables: a null
 * `seasonId` means all-time, a set one means that season.
 */
export const competitionStatistic = pgTable(
  'competition_statistic',
  {
    id: primaryId(),
    competitionId: entityRef('competition_id')
      .notNull()
      .references(() => competition.id, { onDelete: 'cascade' }),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    /** Null for all-time competition records; set for a single season's. */
    seasonId: entityRef('season_id').references(() => season.id, { onDelete: 'cascade' }),

    /** Confines the row to one division, as elsewhere. */
    disciplineId: entityRef('discipline_id').references(() => discipline.id, {
      onDelete: 'cascade',
    }),

    /** `all_time` or `season`. Denormalised for the same indexing reason as elsewhere. */
    scope: text('scope').notNull(),

    /**
     * Which statistic this row records, matching `statistic_definition.key`.
     *
     * A column rather than a JSONB payload because these rows are queried
     * individually ("show me the goals record") and listed per competition,
     * rather than read as one blob per entity. The other statistics tables hold
     * many statistics per row; this one holds one statistic per row, because a
     * record has a holder attached and a payload cannot carry that.
     */
    statKey: text('stat_key').notNull(),

    /** The value itself. Numeric for records and countable aggregates. */
    value: numeric('value', { precision: 14, scale: 3 }),

    /** Set when this row is a record held by a person. */
    recordPersonId: entityRef('record_person_id').references(() => person.id, {
      onDelete: 'set null',
    }),

    /** Set when this row is a record held by a team. */
    recordTeamId: entityRef('record_team_id').references(() => team.id, { onDelete: 'set null' }),

    /** When the record was set, where known. Null for aggregates. */
    achievedOn: timestamp('achieved_on', { withTimezone: true }),

    /** Editorial framing for records carrying context no provider supplies. */
    note: text('note'),

    /** Supporting detail: opponent, venue, margin. Varies per record type. */
    context: jsonb('context').notNull().default({}),

    computedAt: timestamp('computed_at', { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('competition_statistic_unique_idx').on(
      table.competitionId,
      table.scope,
      table.seasonId,
      table.disciplineId,
      table.statKey,
    ),
    /** The competition page query: every statistic for this competition. */
    index('competition_statistic_lookup_idx').on(
      table.competitionId,
      table.scope,
      table.disciplineId,
    ),
    /** Reverse lookup: "which competition records does this player hold". */
    index('competition_statistic_holder_idx').on(table.recordPersonId),
  ],
);

/**
 * A notable achievement: a trophy won, a record held, a milestone reached.
 *
 * This is what fills the "they won how many things" panel above the statistics
 * on a team or player page. Deliberately not derived from results: many honours
 * predate any data we can ingest, and Wikidata carries them under a licence that
 * permits storage without restriction.
 *
 * The subject is polymorphic (a person or a team), enforced in the application
 * layer rather than by two nullable foreign keys with a check constraint,
 * because honours are read as a list per entity and never joined across.
 */
export const honour = pgTable(
  'honour',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'cascade' }),

    personId: entityRef('person_id').references(() => person.id, { onDelete: 'cascade' }),
    teamId: entityRef('team_id').references(() => team.id, { onDelete: 'cascade' }),

    competitionId: entityRef('competition_id').references(() => competition.id, {
      onDelete: 'set null',
    }),
    seasonId: entityRef('season_id').references(() => season.id, { onDelete: 'set null' }),

    /** `title`, `award`, `record`, `milestone`. */
    kind: text('kind').notNull(),

    /** "Ballon d'Or", "World Cup", "Most runs in a calendar year". */
    title: text('title').notNull(),

    /** Denormalised for display and sorting where no season row exists. */
    year: integer('year'),

    /** Editorial framing, for records that carry context no provider supplies. */
    note: text('note'),
    ...timestamps,
  },
  (table) => [
    index('honour_person_idx').on(table.personId, table.year),
    index('honour_team_idx').on(table.teamId, table.year),
    index('honour_competition_idx').on(table.competitionId),
    /**
     * Stops the same award being recorded twice for one subject.
     *
     * Ingestion already used `onConflictDoNothing`, but with no constraint to
     * conflict against it did nothing at all, and re-running produced duplicate
     * honours that reached the API: Messi's page listed the 2023 Ballon d'Or
     * twice. Partial indexes because the subject is either a person or a team,
     * never both, and Postgres treats nulls as distinct in a plain unique index.
     */
    uniqueIndex('honour_person_unique_idx')
      .on(table.personId, table.title, table.year)
      .where(sql`${table.personId} IS NOT NULL`),
    uniqueIndex('honour_team_unique_idx')
      .on(table.teamId, table.title, table.year)
      .where(sql`${table.teamId} IS NOT NULL`),
  ],
);

export const statisticDefinitionRelations = relations(statisticDefinition, ({ one }) => ({
  sport: one(sport, { fields: [statisticDefinition.sportId], references: [sport.id] }),
  discipline: one(discipline, {
    fields: [statisticDefinition.disciplineId],
    references: [discipline.id],
  }),
}));

export const competitionStatisticRelations = relations(competitionStatistic, ({ one }) => ({
  competition: one(competition, {
    fields: [competitionStatistic.competitionId],
    references: [competition.id],
  }),
  season: one(season, { fields: [competitionStatistic.seasonId], references: [season.id] }),
  discipline: one(discipline, {
    fields: [competitionStatistic.disciplineId],
    references: [discipline.id],
  }),
  recordHolder: one(person, {
    fields: [competitionStatistic.recordPersonId],
    references: [person.id],
  }),
  recordTeam: one(team, { fields: [competitionStatistic.recordTeamId], references: [team.id] }),
}));

export const personStatisticRelations = relations(personStatistic, ({ one }) => ({
  person: one(person, { fields: [personStatistic.personId], references: [person.id] }),
  competition: one(competition, {
    fields: [personStatistic.competitionId],
    references: [competition.id],
  }),
  season: one(season, { fields: [personStatistic.seasonId], references: [season.id] }),
  team: one(team, { fields: [personStatistic.teamId], references: [team.id] }),
  discipline: one(discipline, {
    fields: [personStatistic.disciplineId],
    references: [discipline.id],
  }),
}));

export const teamStatisticRelations = relations(teamStatistic, ({ one }) => ({
  team: one(team, { fields: [teamStatistic.teamId], references: [team.id] }),
  competition: one(competition, {
    fields: [teamStatistic.competitionId],
    references: [competition.id],
  }),
  season: one(season, { fields: [teamStatistic.seasonId], references: [season.id] }),
  discipline: one(discipline, {
    fields: [teamStatistic.disciplineId],
    references: [discipline.id],
  }),
}));
