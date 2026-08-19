import { z } from 'zod';

/**
 * Sports-domain contracts.
 *
 * These are the shapes the API promises and the website consumes. Two rules
 * hold throughout, and both matter more than they look:
 *
 *   1. **Nothing provider-shaped appears here.** No Wikidata QIDs, no
 *      API-Sports identifiers, no field named after somebody else's JSON. The
 *      website must not learn where a fact came from, because the source is
 *      expected to change.
 *   2. **Canonical identifiers are opaque strings.** They are UUIDs today. The
 *      website should treat them as tokens it passes back, never as anything it
 *      parses or sorts on.
 */

/**
 * Structural facts about a sport, used by the website to decide what to render.
 *
 * This is the mechanism that keeps the front end free of per-sport branching.
 * Tennis has no teams, Formula 1 has no league table, and rather than the
 * website knowing that, it asks. Every field is optional because the set will
 * grow as sports are added, and an older client must not break when it does.
 */
export const sportTraitsSchema = z
  .object({
    hasTeams: z.boolean().optional(),
    hasLeagueTable: z.boolean().optional(),
    individualCompetitors: z.boolean().optional(),
    scoringModel: z.string().optional(),
  })
  .passthrough();
export type SportTraits = z.infer<typeof sportTraitsSchema>;

export const sportSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  /** Two-letter badge for the sidebar. */
  shortCode: z.string(),
  traits: sportTraitsSchema,
  /** Editorial prose for the Overview tab. Null until somebody writes it. */
  summary: z.string().nullable(),
});
export type Sport = z.infer<typeof sportSchema>;

/**
 * A sport with the counts behind each of its tabs.
 *
 * Returned by the sport detail endpoint so the navigation can show how much is
 * there, and hide a tab that is empty, without the website issuing five
 * separate requests to find out.
 */
export const sportDetailSchema = sportSchema.extend({
  counts: z.object({
    teams: z.number().int().nonnegative(),
    players: z.number().int().nonnegative(),
    competitions: z.number().int().nonnegative(),
  }),
  /** Editorial groupings for the Teams tab: "International teams", "Club Teams". */
  sections: z.array(
    z.object({
      id: z.string(),
      tab: z.string(),
      label: z.string(),
      slug: z.string(),
    }),
  ),
});
export type SportDetail = z.infer<typeof sportDetailSchema>;

/** A team in a list: the fields a card needs, and no more. */
export const teamSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  /** `international`, `club`, `franchise` or `invitational`. Drives grouping. */
  kind: z.string(),
  country: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  logoUrl: z.string().nullable(),
});
export type TeamSummary = z.infer<typeof teamSummarySchema>;

/** One statistic, rendered generically from the registry rather than hard-coded. */
export const statisticValueSchema = z.object({
  key: z.string(),
  label: z.string(),
  shortLabel: z.string().nullable(),
  /** Grouping heading: "Batting", "Bowling", "Goalkeeping". */
  category: z.string().nullable(),
  /** `integer`, `decimal`, `percentage`, `duration`, `ratio` or `text`. */
  format: z.string(),
  precision: z.number().int(),
  higherIsBetter: z.boolean(),
  /** Editorial definition, which is what makes this an intelligence product. */
  description: z.string().nullable(),
  value: z.union([z.number(), z.string(), z.null()]),
});
export type StatisticValue = z.infer<typeof statisticValueSchema>;

/**
 * A block of statistics for one division of a sport.
 *
 * `discipline` is null for sports that have no divisions. Where it is set, the
 * website renders one block per discipline: a cricketer's Test, ODI and T20
 * records sit side by side and are never summed together.
 */
export const statisticGroupSchema = z.object({
  discipline: z
    .object({
      key: z.string(),
      label: z.string(),
      kind: z.string(),
    })
    .nullable(),
  scope: z.string(),
  appearances: z.number().int().nullable(),
  statistics: z.array(statisticValueSchema),
});
export type StatisticGroup = z.infer<typeof statisticGroupSchema>;

/** A trophy, award or record. Fills the panel above the statistics. */
export const honourSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  year: z.number().int().nullable(),
  note: z.string().nullable(),
});
export type Honour = z.infer<typeof honourSchema>;

export const teamDetailSchema = teamSummarySchema.extend({
  sport: z.object({ slug: z.string(), name: z.string() }),
  about: z.string().nullable(),
  isActive: z.boolean(),
  honours: z.array(honourSchema),
  statistics: z.array(statisticGroupSchema),
});
export type TeamDetail = z.infer<typeof teamDetailSchema>;

/** A person in a list. */
export const playerSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  fullName: z.string(),
  displayName: z.string().nullable(),
  nationality: z.string().nullable(),
  dateOfBirth: z.string().nullable(),
  imageUrl: z.string().nullable(),
  /** Sport-specific facts: position, current club, height. Varies by sport. */
  attributes: z.record(z.unknown()),
});
export type PlayerSummary = z.infer<typeof playerSummarySchema>;

export const playerDetailSchema = playerSummarySchema.extend({
  sport: z.object({ slug: z.string(), name: z.string() }),
  dateOfDeath: z.string().nullable(),
  biography: z.string().nullable(),
  honours: z.array(honourSchema),
  statistics: z.array(statisticGroupSchema),
  /** Clubs and national sides, most recent first. */
  teams: z.array(
    z.object({
      team: teamSummarySchema,
      role: z.string(),
      startDate: z.string().nullable(),
      endDate: z.string().nullable(),
    }),
  ),
});
export type PlayerDetail = z.infer<typeof playerDetailSchema>;

export const competitionSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().nullable(),
  /** `international`, `domestic`, `continental` or `friendly`. */
  kind: z.string(),
  /** `league`, `knockout`, `group_knockout`, `series`, `championship` or `tour`. */
  format: z.string(),
  country: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  logoUrl: z.string().nullable(),
});
export type CompetitionSummary = z.infer<typeof competitionSummarySchema>;

/**
 * A competition record: an extreme value together with whoever holds it.
 *
 * The holder is a person or a team or neither, the last being a plain aggregate
 * such as "matches played". The website renders all three from this one shape.
 */
export const competitionRecordSchema = z.object({
  statKey: z.string(),
  label: z.string(),
  value: z.number().nullable(),
  note: z.string().nullable(),
  holder: z
    .object({
      type: z.enum(['person', 'team']),
      id: z.string(),
      slug: z.string(),
      name: z.string(),
    })
    .nullable(),
});
export type CompetitionRecord = z.infer<typeof competitionRecordSchema>;

export const competitionDetailSchema = competitionSummarySchema.extend({
  sport: z.object({ slug: z.string(), name: z.string() }),
  about: z.string().nullable(),
  isActive: z.boolean(),
  seasons: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      startYear: z.number().int(),
      isCurrent: z.boolean(),
    }),
  ),
  records: z.array(competitionRecordSchema),
});
export type CompetitionDetail = z.infer<typeof competitionDetailSchema>;

/**
 * One search hit.
 *
 * Deliberately uniform across entity types, so the search box renders a single
 * list rather than three, and so adding a searchable type later needs no client
 * change.
 */
export const searchResultSchema = z.object({
  type: z.enum(['team', 'player', 'competition', 'venue']),
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().nullable(),
  sport: z.object({ slug: z.string(), name: z.string() }).nullable(),
});
export type SearchResult = z.infer<typeof searchResultSchema>;

export const searchQuerySchema = z.object({
  q: z.string().min(2, 'Search needs at least two characters').max(100),
  /** Restrict to one sport. Omit to search everything. */
  sport: z.string().optional(),
  type: z.enum(['team', 'player', 'competition', 'venue']).optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});
export type SearchQuery = z.infer<typeof searchQuerySchema>;

/** Query parameters shared by the entity list endpoints. */
export const entityListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
  /** Filter teams by `international` or `club`, matching the Teams tab grouping. */
  kind: z.string().optional(),
  country: z.string().optional(),
  /** Free-text filter within a list, distinct from global search. */
  q: z.string().max(100).optional(),
});
export type EntityListQuery = z.infer<typeof entityListQuerySchema>;
