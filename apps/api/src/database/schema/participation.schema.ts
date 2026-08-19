import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import {
  confidenceEnum,
  entityRef,
  eventStatusEnum,
  participantRoleEnum,
  primaryId,
  timestamps,
} from './_shared';
import { competition, person, season, team, venue } from './entity.schema';
import { sport } from './sport.schema';

/**
 * Who was where, when, and what happened.
 *
 * The distinction between the two relationship tables here is the single most
 * important modelling decision in the schema, and conflating them is expensive
 * to undo:
 *
 *   - `personTeam` is a **contractual span**: X belonged to Y from date A to
 *     date B, in role R. It answers "who was in the 2011/12 Barcelona squad"
 *     and exists whether or not they ever played.
 *   - `participation` is an **appearance**: X took part in event E for team Y.
 *     It answers "did Messi play in that match" and is the grain every
 *     statistic aggregates from.
 *
 * Deriving either from the other loses information in both directions: squad
 * members never selected, and loanees appearing for a side they are not
 * contracted to.
 */

/**
 * A person's spell at a team.
 *
 * Open-ended when `endDate` is null, which is how a current squad is queried.
 */
export const personTeam = pgTable(
  'person_team',
  {
    id: primaryId(),
    personId: entityRef('person_id')
      .notNull()
      .references(() => person.id, { onDelete: 'cascade' }),
    teamId: entityRef('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),

    /** Player, coach, manager. The reason `person` is one table rather than several. */
    role: participantRoleEnum('role').notNull(),

    startDate: date('start_date'),

    /** Null means the spell is current. */
    endDate: date('end_date'),

    /** Squad number during this spell. Changes between spells, so it belongs here. */
    shirtNumber: integer('shirt_number'),

    /** Loan, transfer fee, position played. Sport-specific and sparse. */
    attributes: jsonb('attributes').notNull().default({}),

    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    ...timestamps,
  },
  (table) => [
    index('person_team_person_idx').on(table.personId, table.startDate),
    index('person_team_team_idx').on(table.teamId, table.role),
    index('person_team_current_idx').on(table.teamId, table.endDate),
    /**
     * Stops the same spell being recorded twice.
     *
     * Ingestion used `onConflictDoNothing` with nothing to conflict against, so
     * re-running a career import inserted a second copy of every spell rather
     * than skipping it: 1,010 of 6,344 rows were duplicates, and they reached
     * the API as repeated entries on a player's timeline.
     *
     * Dates are coalesced to sentinels because they are nullable and Postgres
     * treats nulls as distinct, which would leave open-ended spells
     * unconstrained. The same trap as the statistics indexes.
     */
    uniqueIndex('person_team_unique_idx').on(
      table.personId,
      table.teamId,
      table.role,
      sql`coalesce(${table.startDate}, '1000-01-01'::date)`,
      sql`coalesce(${table.endDate}, '9999-12-31'::date)`,
    ),
  ],
);

/**
 * A single match, race or fixture.
 *
 * Deliberately thin. It carries what every sport shares (when, where, which
 * season, what status) and nothing else. Sport-specific detail lives in
 * `attributes` or in the statistics tables, because a column set that satisfies
 * football, cricket and Formula 1 simultaneously is a column set that is mostly
 * null for all three.
 */
export const event = pgTable(
  'event',
  {
    id: primaryId(),
    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id, { onDelete: 'restrict' }),
    seasonId: entityRef('season_id').references(() => season.id, { onDelete: 'set null' }),
    venueId: entityRef('venue_id').references(() => venue.id, { onDelete: 'set null' }),

    /** "Matchweek 12", "Race 4", "2nd Test". Free text: every sport names these differently. */
    round: text('round'),

    /** Display name, mainly for events that are not team-vs-team ("Monaco Grand Prix"). */
    name: text('name'),

    startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
    status: eventStatusEnum('status').notNull().default('scheduled'),

    /**
     * Sport-specific result detail: scores, innings, lap counts.
     *
     * JSONB because the shape is genuinely per-sport, and because this is read
     * with the event row and never aggregated across events. Anything that
     * needs aggregating belongs in the statistics tables.
     */
    result: jsonb('result').notNull().default({}),

    attributes: jsonb('attributes').notNull().default({}),

    /**
     * When the event reached a terminal state.
     *
     * Set once, on transition to `final`. Some competitions have no live feed
     * and settle hours later, so finalisation is a sweep rather than only an
     * event hook, and this column is how the sweep finds what it has not yet
     * processed.
     */
    finalisedAt: timestamp('finalised_at', { withTimezone: true }),

    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    ...timestamps,
  },
  (table) => [
    index('event_season_date_idx').on(table.seasonId, table.startsAt),
    index('event_sport_date_idx').on(table.sportId, table.startsAt),
    index('event_status_idx').on(table.status, table.startsAt),
  ],
);

/**
 * A team's involvement in one event.
 *
 * Separate from person-level participation because team statistics are a first
 * class need (the Teams tab shows them) and deriving a team's result by
 * aggregating its players' rows is both slow and wrong: a clean sheet is not the
 * sum of anything.
 *
 * `side` rather than home/away booleans, because Formula 1 has neither.
 */
export const eventTeam = pgTable(
  'event_team',
  {
    id: primaryId(),
    eventId: entityRef('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    teamId: entityRef('team_id')
      .notNull()
      .references(() => team.id, { onDelete: 'cascade' }),

    /** `home`, `away`, or null where the concept does not apply. */
    side: text('side'),

    /** Denormalised for league tables, which would otherwise join to `result` JSONB. */
    score: integer('score'),

    /** `win`, `loss`, `draw`, `no_result`. Drives the W/D/L form strips in the UI. */
    outcome: text('outcome'),

    /**
     * Team statistics for this single event.
     *
     * Validated against `statistic_definition` on write, so this is a governed
     * payload rather than arbitrary JSON. See statistic.schema.ts.
     */
    stats: jsonb('stats').notNull().default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('event_team_unique_idx').on(table.eventId, table.teamId),
    index('event_team_team_idx').on(table.teamId),
  ],
);

/**
 * A person's appearance in one event. The base grain of the entire statistics model.
 *
 * Every aggregate above this level (season totals, career totals, leaderboards)
 * is derived from these rows and can be recomputed from them. That property is
 * what makes a normalisation bug repairable by reprocessing rather than by
 * manual data surgery, and it is why these rows must never be edited in place
 * to "fix" a total.
 */
export const participation = pgTable(
  'participation',
  {
    id: primaryId(),
    eventId: entityRef('event_id')
      .notNull()
      .references(() => event.id, { onDelete: 'cascade' }),
    personId: entityRef('person_id')
      .notNull()
      .references(() => person.id, { onDelete: 'cascade' }),

    /** Null for individual sports where the person competes alone. */
    teamId: entityRef('team_id').references(() => team.id, { onDelete: 'set null' }),

    role: participantRoleEnum('role').notNull().default('player'),

    /** Started, or came on. Null where the sport has no such concept. */
    isStarter: boolean('is_starter'),

    /**
     * The per-event statistics payload: goals and assists, runs and wickets,
     * laps and pit stops.
     *
     * Governed by `statistic_definition`: ingestion rejects keys that are not
     * registered for the sport, which is what stops one run writing `goals` and
     * the next writing `goals_scored`.
     */
    stats: jsonb('stats').notNull().default({}),

    confidence: confidenceEnum('confidence').notNull().default('provisional'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('participation_unique_idx').on(table.eventId, table.personId, table.role),
    index('participation_person_idx').on(table.personId),
    index('participation_team_idx').on(table.teamId),
  ],
);

export const personTeamRelations = relations(personTeam, ({ one }) => ({
  person: one(person, { fields: [personTeam.personId], references: [person.id] }),
  team: one(team, { fields: [personTeam.teamId], references: [team.id] }),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
  sport: one(sport, { fields: [event.sportId], references: [sport.id] }),
  season: one(season, { fields: [event.seasonId], references: [season.id] }),
  venue: one(venue, { fields: [event.venueId], references: [venue.id] }),
  teams: many(eventTeam),
  participants: many(participation),
}));

export const eventTeamRelations = relations(eventTeam, ({ one }) => ({
  event: one(event, { fields: [eventTeam.eventId], references: [event.id] }),
  team: one(team, { fields: [eventTeam.teamId], references: [team.id] }),
}));

export const participationRelations = relations(participation, ({ one }) => ({
  event: one(event, { fields: [participation.eventId], references: [event.id] }),
  person: one(person, { fields: [participation.personId], references: [person.id] }),
  team: one(team, { fields: [participation.teamId], references: [team.id] }),
}));

/** Re-exported so competition-scoped queries can reach it without a second import. */
export { competition };
