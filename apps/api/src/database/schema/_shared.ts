import { sql } from 'drizzle-orm';
import { pgEnum, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * Primitives shared by every sports-data table.
 *
 * Defined once so that "what does an id look like" and "what does a timestamp
 * column look like" have exactly one answer. A schema where half the tables use
 * `serial` and half use `uuid` is a schema nobody can write a generic query
 * against.
 */

/**
 * Canonical identifier for every entity we own.
 *
 * UUIDs rather than serial integers, for one decisive reason: ingestion creates
 * entities from several providers concurrently, and a sequence is a contention
 * point that also leaks row counts. Generated in the database so an insert never
 * has to round-trip to find out what it just created.
 */
export const primaryId = () => uuid('id').primaryKey().defaultRandom();

/** Foreign key to a canonical id, without the primary-key or default. */
export const entityRef = (column: string) => uuid(column);

/**
 * Audit columns.
 *
 * `updatedAt` is set by the application on write rather than by a trigger:
 * ingestion upserts millions of rows and a per-row trigger is a measurable cost
 * for information we already have at the call site.
 */
export const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
};

/**
 * How much we trust a row, and therefore whether it may be shown.
 *
 * This exists because the ingestion strategy deliberately mixes a permissively
 * licensed but patchy source (Wikidata) with sparse free feeds. Some rows will
 * be complete and some will be a name and nothing else, and the website must be
 * able to ask for "only rows good enough to render a page" without every query
 * re-deriving what that means.
 *
 *   - `provisional`: created by entity resolution, not yet corroborated. Not
 *     shown publicly.
 *   - `verified`: corroborated across sources, or human-checked. Shown.
 *   - `curated`: a human has edited it. Shown, and ingestion must not overwrite
 *     the fields listed in `lockedFields`.
 */
export const confidenceEnum = pgEnum('confidence', ['provisional', 'verified', 'curated']);

/**
 * Editorial publication state, separate from confidence.
 *
 * Confidence is "do we believe this data"; status is "do we intend to show it".
 * A record can be verified and still deliberately hidden, and conflating the two
 * means you cannot unpublish something without corrupting its data quality flag.
 */
export const publicationStatusEnum = pgEnum('publication_status', [
  'draft',
  'published',
  'archived',
]);

/**
 * Distinguishes a national side from a club side.
 *
 * A first-class column rather than a UI filter, because the website groups by it
 * on every sport's Teams tab (Argentina vs Real Madrid, India vs Chennai Super
 * Kings) and a grouping the database cannot express becomes a grouping the API
 * has to hard-code per sport.
 *
 * `franchise` is separated from `club` on purpose: IPL and BBL sides are drafted
 * franchises without the continuous historical identity a football club has, and
 * flattening them into `club` makes "oldest club" style queries wrong.
 *
 * `representative` and `development` were added for cricket, where the football
 * club/franchise pair does not cover the ground:
 *
 *   - **`representative`** is a state, county, province, region or territory
 *     side: Yorkshire, Queensland, Otago, Bengal. It is neither a club, having
 *     no members and no independent existence, nor a franchise, having not been
 *     created for a competition. One value rather than one per territory type,
 *     because the schema must not assert that every country organises domestic
 *     cricket the same way; England has counties and India has states, and which
 *     it is belongs on the team rather than in this enum.
 *   - **`development`** is an age-group, academy or A-side. Separated because an
 *     under-19 record and a senior record are not the same career, and because
 *     these otherwise inflate a "teams" count that readers reasonably take as a
 *     measure of how much of a sport is covered.
 *
 * Both were introduced correcting a real defect: cricket ingestion defaulted
 * every non-national side to `franchise`, which labelled 814 teams a franchise
 * when most were representative sides or clubs.
 */
export const teamKindEnum = pgEnum('team_kind', [
  'international',
  'club',
  'franchise',
  'representative',
  'development',
  'invitational',
]);

/** Mirrors `team_kind` for competitions: the World Cup and La Liga group apart. */
export const competitionKindEnum = pgEnum('competition_kind', [
  'international',
  'domestic',
  'continental',
  'friendly',
]);

/**
 * The shape of a competition, which decides what a "standing" even means.
 *
 * Without this the presentation layer has to know that La Liga has a table and
 * the World Cup has a bracket, which is precisely the sport-specific branching
 * the canonical model exists to avoid.
 */
export const competitionFormatEnum = pgEnum('competition_format', [
  'league',
  'knockout',
  'group_knockout',
  'series',
  'championship',
  'tour',
]);

/**
 * What a person was doing in a given relationship.
 *
 * Carried on the relationship, never on the person, because people change role:
 * a player becomes a manager, a driver becomes a team principal. Storing role on
 * `person` would split one human being into two unrelated rows and break exactly
 * the career-timeline feature the product is for.
 */
export const participantRoleEnum = pgEnum('participant_role', [
  'player',
  'coach',
  'manager',
  'assistant_coach',
  'captain',
  'official',
  'driver',
  'staff',
]);

/** Lifecycle of a scheduled event. `final` is the only state that may be aggregated. */
export const eventStatusEnum = pgEnum('event_status', [
  'scheduled',
  'live',
  'final',
  'postponed',
  'cancelled',
  'abandoned',
]);
