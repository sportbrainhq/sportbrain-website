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

// --- Rich entity detail -----------------------------------------------------

/** An ingested fact: nickname, motto, venue, coach. */
export const entityFactSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.string(),
  /** `identity`, `people`, `venue` or `commercial`. Groups facts on the page. */
  category: z.string(),
});
export type EntityFact = z.infer<typeof entityFactSchema>;

/** Authored prose about an entity: history, culture, notable eras. */
export const entitySectionSchema = z.object({
  kind: z.string(),
  heading: z.string(),
  body: z.string(),
});
export type EntitySection = z.infer<typeof entitySectionSchema>;

/**
 * A derived leaderboard.
 *
 * `confidence` is carried to the client on purpose. Several of these are
 * aggregated from a community-edited source with partial coverage, and a table
 * that looks authoritative while being roughly a third complete misleads. The
 * page renders the caveat alongside the numbers.
 */
export const entityRankingSchema = z.object({
  kind: z.string(),
  label: z.string(),
  confidence: z.enum(['high', 'partial', 'indicative']),
  note: z.string().nullable(),
  entries: z.array(
    z.object({
      rank: z.number().int(),
      name: z.string(),
      value: z.union([z.number(), z.string(), z.null()]),
      detail: z.string().nullable(),
      /**
       * Slug of the player's own page, when we hold one.
       *
       * Resolved server-side from the source link rather than by matching names
       * in the browser: the tables print "Raúl" where the entity is "Raúl
       * (footballer)", and name matching across two thousand players is exactly
       * the guessing the mapping table exists to avoid. Null where the player
       * is not in the database, which is most of the long tail, and the row is
       * then rendered as plain text.
       */
      playerSlug: z.string().nullable().optional(),
    }),
  ),
});
export type EntityRanking = z.infer<typeof entityRankingSchema>;

/** The bundle that turns a thin entity page into a rich one. */
export const entityProfileSchema = z.object({
  facts: z.array(entityFactSchema),
  sections: z.array(entitySectionSchema),
  rankings: z.array(entityRankingSchema),
});
export type EntityProfile = z.infer<typeof entityProfileSchema>;

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
  /** Facts, authored prose and derived tables. Empty until the entity is enriched. */
  profile: entityProfileSchema,
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
  profile: entityProfileSchema,
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
  profile: entityProfileSchema,
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

/** A generated headline card for the discovery panels. */
export const highlightSchema = z.object({
  id: z.string(),
  kind: z.enum(['record', 'honour', 'milestone', 'entity']),
  sportSlug: z.string(),
  sportName: z.string(),
  title: z.string(),
  subtitle: z.string().nullable(),
  href: z.string(),
  imageUrl: z.string().nullable(),
});
export type Highlight = z.infer<typeof highlightSchema>;

// --- Editorial content ------------------------------------------------------

/**
 * A piece of editorial writing: an overview, explainer, story or article.
 *
 * This is the half of the product that is ours outright. The sports data is
 * commodity, available to anyone who pays the same provider; the explainer that
 * makes a statistic meaningful is not. It carries no licensing constraint and no
 * refresh cadence, which makes it the opposite of everything else in this file.
 */
export const contentSummarySchema = z.object({
  id: z.string(),
  type: z.enum(['overview', 'explainer', 'story', 'article', 'fact']),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  /** Editorial grouping within a tab: "Rules", "Tactics", "Concepts". */
  category: z.string().nullable(),
  heroImageUrl: z.string().nullable(),
  publishedAt: z.string().nullable(),
});
export type ContentSummary = z.infer<typeof contentSummarySchema>;

export const contentDetailSchema = contentSummarySchema.extend({
  /** Markdown. Rendered server-side; see the CSP note in the schema. */
  body: z.string().nullable(),
  sport: z.object({ slug: z.string(), name: z.string() }).nullable(),
  /** Entities this piece is about, for cross-linking back to their pages. */
  related: z.array(
    z.object({
      entityType: z.string(),
      entityId: z.string(),
      relevance: z.string(),
    }),
  ),
});
export type ContentDetail = z.infer<typeof contentDetailSchema>;

/** A quiz, with its questions but without their answers. */
export const quizSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  difficulty: z.string(),
  questionCount: z.number().int().nonnegative(),
});
export type QuizSummary = z.infer<typeof quizSummarySchema>;

/**
 * One question as delivered to a player.
 *
 * `correctOptionId` is deliberately absent. Sending the answer alongside the
 * question puts it in the page source, where anybody can read it, so answers
 * are checked server-side instead.
 */
export const quizQuestionSchema = z.object({
  id: z.string(),
  prompt: z.string(),
  options: z.array(z.object({ id: z.string(), text: z.string() })),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

export const quizDetailSchema = quizSummarySchema.extend({
  sport: z.object({ slug: z.string(), name: z.string() }).nullable(),
  questions: z.array(quizQuestionSchema),
});
export type QuizDetail = z.infer<typeof quizDetailSchema>;

// --- Sport overview ---------------------------------------------------------

/**
 * The overview payload.
 *
 * Structured rather than a rendered blob, so the page composes sections and the
 * same data can drive a condensed view, a search index or another sport's page
 * without reparsing prose.
 */

/** A cited source, surfaced in the "About this information" panel. */
export const contentSourceSchema = z.object({
  id: z.string(),
  provider: z.string(),
  title: z.string(),
  url: z.string(),
  license: z.string().nullable(),
  retrievedAt: z.string(),
});
export type ContentSource = z.infer<typeof contentSourceSchema>;

/** One dated milestone. */
export const timelineEventSchema = z.object({
  id: z.string(),
  year: z.number().int(),
  /** Set when the entry covers a period rather than a single year. */
  endYear: z.number().int().nullable(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().nullable(),
  category: z.string(),
  isMajorMilestone: z.boolean(),
  /** `established`, `approximate` or `disputed`. Rendered as a qualifier, not hidden. */
  certainty: z.string(),
  sourceId: z.string().nullable(),
});
export type TimelineEvent = z.infer<typeof timelineEventSchema>;

/** A governing body, with its children nested beneath it. */
export const governingBodySchema: z.ZodType<{
  id: string;
  slug: string;
  shortName: string;
  name: string;
  level: string;
  region: string | null;
  foundedYear: number | null;
  memberCount: number | null;
  headquarters: string | null;
  websiteUrl: string | null;
  children: unknown[];
}> = z.object({
  id: z.string(),
  slug: z.string(),
  shortName: z.string(),
  name: z.string(),
  level: z.string(),
  region: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  memberCount: z.number().int().nullable(),
  headquarters: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  children: z.array(z.lazy(() => governingBodySchema)),
});
export type GoverningBody = z.infer<typeof governingBodySchema>;

/** One authored section: the "What is football?" prose and its siblings. */
export const overviewSectionSchema = z.object({
  kind: z.string(),
  heading: z.string(),
  body: z.string(),
});
export type OverviewSection = z.infer<typeof overviewSectionSchema>;

export const sportOverviewSchema = z.object({
  sport: sportSchema,
  /** Structured quick facts, grouped by category for display. */
  quickFacts: z.array(entityFactSchema),
  /** Authored prose, keyed by kind: `introduction`, `basics`, `evolution`, `womens`. */
  sections: z.array(overviewSectionSchema),
  history: z.array(timelineEventSchema),
  /** The world body with its confederations nested. */
  governance: z.array(governingBodySchema),
  sources: z.array(contentSourceSchema),
});
export type SportOverview = z.infer<typeof sportOverviewSchema>;
