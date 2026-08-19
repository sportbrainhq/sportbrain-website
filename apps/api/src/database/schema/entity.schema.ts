import { relations } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  competitionFormatEnum,
  competitionKindEnum,
  confidenceEnum,
  entityRef,
  primaryId,
  teamKindEnum,
  timestamps,
} from './_shared';
import { sport, sportSection } from './sport.schema';

/**
 * The canonical entities.
 *
 * Four rules hold across all of them, and they are what make the model survive
 * a fifteenth sport being added:
 *
 *   1. No provider identifier appears here. Those live in `external_mapping`.
 *      A foreign key to `api_sports_team_id` would weld the schema to a vendor
 *      we may have to replace at short notice.
 *   2. Sport-specific facts go in `attributes` (JSONB), not in columns. A
 *      column that is null for fourteen of fifteen sports is a column in the
 *      wrong table.
 *   3. Every entity carries `confidence` and `lockedFields`, because rows are
 *      assembled from mixed-quality free sources and edited by hand.
 *   4. Slugs are stable and unique per sport, because they are public URLs.
 */

/**
 * A human being. Players, coaches, managers, drivers and officials.
 *
 * Deliberately one table rather than separate `player` and `coach` tables.
 * People change role over a career, and modelling role on the person splits
 * Guardiola into two unrelated rows, making his career timeline unqueryable.
 * Role is carried on `person_team` and `participation` instead.
 */
export const person = pgTable(
  'person',
  {
    id: primaryId(),

    /**
     * People can appear in more than one sport (rare but real: dual-code
     * athletes). The sport here is their primary one, used for navigation;
     * actual involvement is derived from their memberships.
     */
    primarySportId: entityRef('primary_sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'restrict' }),

    slug: text('slug').notNull(),

    /** Full name as displayed. */
    fullName: text('full_name').notNull(),

    /** Short form for cards and tables: "Messi", "Kohli". */
    displayName: text('display_name'),

    /**
     * Alternative spellings, transliterations and former names.
     *
     * Populated during entity resolution and reused by search, so that
     * "Ronaldinho" finds the person whose `fullName` is
     * "Ronaldo de Assis Moreira".
     */
    aliases: text('aliases').array().notNull().default([]),

    dateOfBirth: date('date_of_birth'),
    dateOfDeath: date('date_of_death'),

    /** ISO 3166-1 alpha-3 where known. Text rather than an enum: nationalities change and historic states exist. */
    nationality: text('nationality'),

    /** Editorial prose for the entity page. Never written by ingestion. */
    biography: text('biography'),

    /**
     * Sport-specific facts: batting style, preferred foot, racing number.
     *
     * These are genuinely per-sport and there are dozens of them. As columns
     * they would produce a table that is mostly null.
     */
    attributes: jsonb('attributes').notNull().default({}),

    /**
     * Image URL, not an image.
     *
     * Stored as a link because neither recommended provider grants rights to
     * the photographs they surface: API-Sports disclaims ownership of images
     * entirely and Sportmonks requires you to clear them yourself. Hot-linking
     * is a weaker claim than copying into our own storage, and the column being
     * a URL keeps that decision reversible.
     */
    imageUrl: text('image_url'),

    /** See `team.notability`. Orders player lists so famous names come first. */
    notability: integer('notability').notNull().default(0),

    confidence: confidenceEnum('confidence').notNull().default('provisional'),

    /**
     * Field names a human has edited, which ingestion must not overwrite.
     *
     * Per-field rather than per-row so a curated biography survives while the
     * same person's date of birth keeps syncing.
     */
    lockedFields: text('locked_fields').array().notNull().default([]),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('person_slug_idx').on(table.primarySportId, table.slug),
    index('person_name_idx').on(table.fullName),
    index('person_sport_idx').on(table.primarySportId),
    index('person_notability_idx').on(table.primarySportId, table.notability),
  ],
);

/**
 * A competing organisation: national sides, clubs, franchises, F1 constructors.
 *
 * "Team" is understood as an organisation that competes, which is what lets an
 * F1 constructor share this table with Real Madrid. A golfer does not fit and
 * should not be forced in; individual-sport competitors are people.
 */
export const team = pgTable(
  'team',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'restrict' }),

    /** Drives the International/Club grouping on the Teams tab. */
    kind: teamKindEnum('kind').notNull(),

    /**
     * Optional editorial grouping this team appears under.
     *
     * `kind` is the machine-readable fact; this is the display arrangement,
     * which differs per sport and is curated.
     */
    sectionId: entityRef('section_id').references(() => sportSection.id, { onDelete: 'set null' }),

    slug: text('slug').notNull(),
    name: text('name').notNull(),

    /** "Man Utd", "CSK". Used in cards where the full name will not fit. */
    shortName: text('short_name'),
    aliases: text('aliases').array().notNull().default([]),

    country: text('country'),
    foundedYear: integer('founded_year'),

    /** Editorial prose: the "about Real Madrid" copy above the statistics. */
    about: text('about'),

    /** Crest URL. Same rights reasoning as `person.imageUrl`. */
    logoUrl: text('logo_url'),

    /** Brand colours, for the entity page accent. */
    attributes: jsonb('attributes').notNull().default({}),

    /**
     * How widely documented this entity is, used to order lists.
     *
     * The count of Wikipedia language editions carrying an article on it, which
     * is the best notability proxy available for free. Alphabetical ordering
     * puts Abkhazia and Anguilla on the first page of national teams while
     * Brazil and India sit hundreds of rows down, and nothing else in the schema
     * distinguishes a side anybody searches for from one nobody does.
     *
     * Zero means unmeasured rather than obscure: entities ingested before this
     * existed carry no score until they are refreshed.
     */
    notability: integer('notability').notNull().default(0),

    /**
     * Whether the team still competes.
     *
     * Historical sides must remain queryable: a defunct club still appears in
     * the record books, and deleting it would orphan decades of results.
     */
    isActive: boolean('is_active').notNull().default(true),

    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    lockedFields: text('locked_fields').array().notNull().default([]),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('team_slug_idx').on(table.sportId, table.slug),
    index('team_sport_kind_idx').on(table.sportId, table.kind),
    index('team_notability_idx').on(table.sportId, table.kind, table.notability),
    index('team_name_idx').on(table.name),
  ],
);

/**
 * A recurring contest: the World Cup, La Liga, the IPL, the F1 championship.
 *
 * Separate from `season`, which is one instance of it. Conflating them makes
 * "who has won the most Champions Leagues" impossible to ask without string
 * matching on names.
 */
export const competition = pgTable(
  'competition',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'restrict' }),

    kind: competitionKindEnum('kind').notNull(),

    /** Decides whether a table, a bracket or a championship standing is rendered. */
    format: competitionFormatEnum('format').notNull(),

    sectionId: entityRef('section_id').references(() => sportSection.id, { onDelete: 'set null' }),

    slug: text('slug').notNull(),
    name: text('name').notNull(),
    shortName: text('short_name'),
    aliases: text('aliases').array().notNull().default([]),

    /** Country for domestic competitions; null for international ones. */
    country: text('country'),

    foundedYear: integer('founded_year'),
    about: text('about'),
    logoUrl: text('logo_url'),
    attributes: jsonb('attributes').notNull().default({}),

    /**
     * Rough importance, used to order lists and decide what to ingest first.
     *
     * The request quota does not stretch to every competition, so this column
     * is what tells the backfill job that the Premier League matters more than
     * a regional cup.
     */
    tier: integer('tier').notNull().default(3),

    /** See `team.notability`. */
    notability: integer('notability').notNull().default(0),

    isActive: boolean('is_active').notNull().default(true),
    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    lockedFields: text('locked_fields').array().notNull().default([]),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('competition_slug_idx').on(table.sportId, table.slug),
    index('competition_sport_kind_idx').on(table.sportId, table.kind),
    index('competition_tier_idx').on(table.sportId, table.tier),
  ],
);

/**
 * One instance of a competition: La Liga 2011/12, the 2016 World T20.
 *
 * The label and the dates are stored separately on purpose. Season naming is
 * wildly inconsistent across sports ("2011/12" in European football, "2016" in
 * cricket and F1), and any code that parses the label to find the year will be
 * wrong for at least one sport. Sort and filter on the dates; display the label.
 */
export const season = pgTable(
  'season',
  {
    id: primaryId(),
    competitionId: entityRef('competition_id')
      .notNull()
      .references(() => competition.id, { onDelete: 'cascade' }),

    /** Displayed exactly as given: "2011/12", "2016". Never parsed. */
    label: text('label').notNull(),

    /** Canonical sort key. For "2011/12" this is 2011. */
    startYear: integer('start_year').notNull(),

    startDate: date('start_date'),
    endDate: date('end_date'),

    /** The current season for its competition. Drives "this season" views without a date comparison. */
    isCurrent: boolean('is_current').notNull().default(false),

    attributes: jsonb('attributes').notNull().default({}),
    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('season_unique_idx').on(table.competitionId, table.label),
    index('season_year_idx').on(table.competitionId, table.startYear),
    index('season_current_idx').on(table.isCurrent),
  ],
);

/**
 * A place where events happen. Stadiums, grounds, circuits.
 *
 * Not scoped to a sport: the same ground hosts football and cricket, and
 * duplicating it per sport would double-count capacity and location facts.
 */
export const venue = pgTable(
  'venue',
  {
    id: primaryId(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    aliases: text('aliases').array().notNull().default([]),
    city: text('city'),
    country: text('country'),
    capacity: integer('capacity'),
    openedYear: integer('opened_year'),
    attributes: jsonb('attributes').notNull().default({}),
    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    ...timestamps,
  },
  (table) => [uniqueIndex('venue_slug_idx').on(table.slug), index('venue_name_idx').on(table.name)],
);

export const personRelations = relations(person, ({ one }) => ({
  primarySport: one(sport, { fields: [person.primarySportId], references: [sport.id] }),
}));

export const teamRelations = relations(team, ({ one }) => ({
  sport: one(sport, { fields: [team.sportId], references: [sport.id] }),
  section: one(sportSection, { fields: [team.sectionId], references: [sportSection.id] }),
}));

export const competitionRelations = relations(competition, ({ one, many }) => ({
  sport: one(sport, { fields: [competition.sportId], references: [sport.id] }),
  section: one(sportSection, { fields: [competition.sectionId], references: [sportSection.id] }),
  seasons: many(season),
}));

export const seasonRelations = relations(season, ({ one }) => ({
  competition: one(competition, {
    fields: [season.competitionId],
    references: [competition.id],
  }),
}));
