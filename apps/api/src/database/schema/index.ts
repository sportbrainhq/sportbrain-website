/**
 * Drizzle schema barrel.
 *
 * Drizzle infers the database client's types from these exports, so a table is
 * queryable the moment it appears here and invisible until then.
 *
 * The schema is organised by role rather than by sport, which is the decision
 * everything else follows from. There is no `football_player` table and never
 * will be: sports differ in their statistics, not in their structure, and the
 * structural differences that do exist are carried as data (`sport.traits`,
 * `statistic_definition`) rather than as tables.
 *
 * Reading order, if you are new to it:
 *
 *   1. `_shared`        the primitives and enums every table uses
 *   2. `sport`          the root of the navigation
 *   3. `entity`         person, team, competition, season, venue
 *   4. `participation`  who played where, and the events they played in
 *   5. `statistic`      the registry, and the aggregates derived from events
 *   6. `provider`       provider identifiers and ingestion bookkeeping
 *   7. `content`        the editorial layer we own outright
 *
 * To add a table: create the file, re-export it here, run `pnpm db:generate`,
 * read the generated SQL by hand, then `pnpm db:migrate`.
 */

export * from './_shared';
export * from './sport.schema';
export * from './entity.schema';
export * from './participation.schema';
export * from './statistic.schema';
export * from './profile.schema';
export * from './overview.schema';
export * from './provider.schema';
export * from './content.schema';
