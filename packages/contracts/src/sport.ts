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
    /**
     * Whether a player's club is a fact worth showing as a present-tense one.
     *
     * False for cricket, and not a data gap: a cricketer belongs to a national
     * side, a first-class side and one or more franchises at the same time, and
     * a single "Current club" box picks one of them arbitrarily. Football has
     * one club at a time and the box means something there.
     */
    playersHaveCurrentClub: z.boolean().optional(),
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
       *
       * Where no source link exists, as on the curated competition tables, the
       * name itself is matched against the players we hold and is only accepted
       * when exactly one matches.
       */
      playerSlug: z.string().nullable().optional(),
      /**
       * Slug of the team's own page, when we hold one.
       *
       * A roll of honour lists clubs and nations rather than people, so the
       * same row can resolve to a team instead of a player. Never both: a name
       * that matches an entity of each type is left unlinked rather than
       * guessed at.
       */
      teamSlug: z.string().nullable().optional(),
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

/**
 * A player's headline career numbers, uniform across every player of a sport.
 *
 * Separate from `statistics` on purpose. The registry-driven blocks vary by how
 * much has been ingested, so the panel they render changes shape from player to
 * player. These tiles do not: every footballer shows games, goals and trophies,
 * in that order, so one profile reads like the next.
 *
 * Empty for a sport that has not declared its own trio. Only football has so
 * far; the others count a career in their own terms and are worked through one
 * at a time. `label` therefore travels with the value rather than being fixed
 * by the key. A null `value` renders as an em dash: not yet ingested, rather
 * than zero.
 */
export const careerSummaryEntrySchema = z.object({
  key: z.enum(['career_games', 'career_goals', 'career_trophies']),
  label: z.string(),
  value: z.number().nullable(),
  description: z.string().nullable(),
});
export type CareerSummaryEntry = z.infer<typeof careerSummaryEntrySchema>;

/** A trophy, award or record. Fills the panel above the statistics. */
export const honourSchema = z.object({
  id: z.string(),
  kind: z.string(),
  title: z.string(),
  year: z.number().int().nullable(),
  note: z.string().nullable(),
  /**
   * Prestige tier, 1 (highest) to 4, or null where the sport's list does not
   * cover the honour. Carried to the client so the page can lead with what a
   * career is remembered for instead of with whatever happened most recently.
   */
  prestige: z.number().int().nullable(),
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
  /**
   * Traits travel with the player so the page can ask what kind of sport this
   * is rather than testing the slug: whether a current club is a fact worth
   * showing, for one, which is false for cricket and true for football.
   */
  sport: z.object({ slug: z.string(), name: z.string(), traits: sportTraitsSchema }),
  dateOfDeath: z.string().nullable(),
  /**
   * `active`, `retired`, or null where the evidence does not say.
   *
   * Null is a real state rather than a gap to fill in: the page shows no badge
   * at all, because labelling someone Active who retired twenty years ago is
   * worse than labelling them nothing.
   */
  careerStatus: z.enum(['active', 'retired']).nullable(),
  biography: z.string().nullable(),
  honours: z.array(honourSchema),
  /** Three entries in a fixed order, or empty where the sport declares none. */
  careerSummary: z.array(careerSummaryEntrySchema),
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

/**
 * One node in a sport's format taxonomy.
 *
 * `matchClass` and `isInternational` are separate fields because they vary
 * independently, and collapsing them is the single most common error in cricket
 * data. Test and first-class cricket share a match class and differ only in
 * international status; ODI and List A likewise; T20I and domestic T20 likewise.
 * A client that renders only one of the two will state something false.
 *
 * `isInternational` is nullable rather than defaulted: null means the question
 * does not apply, which is the correct answer for a grouping node such as
 * "limited-overs cricket" and is not the same answer as false.
 */
export const sportFormatSchema: z.ZodType<{
  id: string;
  key: string;
  label: string;
  matchClass: string;
  isInternational: boolean | null;
  oversPerSide: number | null;
  inningsPerSide: number | null;
  maxDays: number | null;
  drawPossible: boolean | null;
  description: string | null;
  conditionsAuthority: string | null;
  children: unknown[];
}> = z.object({
  id: z.string(),
  key: z.string(),
  label: z.string(),
  /** `multi_day` or `limited_overs`. What kind of match it is. */
  matchClass: z.string(),
  /** Whether national sides contest it. Null where the question does not apply. */
  isInternational: z.boolean().nullable(),
  oversPerSide: z.number().int().nullable(),
  inningsPerSide: z.number().int().nullable(),
  maxDays: z.number().int().nullable(),
  drawPossible: z.boolean().nullable(),
  description: z.string().nullable(),
  /**
   * Which document governs it: `mcc` for the Laws, `icc` for international
   * playing conditions, a board or competition otherwise.
   *
   * Carried to the client because the Laws and a competition's playing
   * conditions are different documents, and presenting an over limit as a Law
   * of Cricket is wrong.
   */
  conditionsAuthority: z.string().nullable(),
  children: z.array(z.lazy(() => sportFormatSchema)),
});
export type SportFormat = z.infer<typeof sportFormatSchema>;

/**
 * A term the Overview introduces before the Explainers teach it.
 *
 * `explainerSlug` is present only when an Explainer with that slug actually
 * exists, resolved server-side. The Overview is written before the Explainer
 * library is, so the alternative is a page full of links to nothing.
 */
export const sportConceptSchema = z.object({
  key: z.string(),
  term: z.string(),
  summary: z.string(),
  /** `role`, `equipment`, `area` or `structure`. Groups the concepts. */
  category: z.string(),
  /**
   * Set where the term carries more than one meaning.
   *
   * Cricket's "wicket" is the motivating case: the stumps, a dismissal, and
   * colloquially the pitch. A single definition teaches something a reader will
   * have to unlearn.
   */
  ambiguityNote: z.string().nullable(),
  /** Only populated when the target Explainer exists. */
  explainerSlug: z.string().nullable(),
});
export type SportConcept = z.infer<typeof sportConceptSchema>;

/**
 * A class of membership within a governing body.
 *
 * Distinct from `governingBodySchema` because a membership class is not a body
 * in the hierarchy. The ICC's Full and Associate Membership grades its members;
 * FIFA's confederations divide the world geographically. Modelling the former
 * as children of the world body would say something false about both.
 *
 * `asOf` is mandatory, not decorative. Membership changes, and four sources
 * consulted for the ICC's own figures gave four different totals, so a count
 * without a date is a claim that quietly expires.
 */
export const membershipTierSchema = z.object({
  tier: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
  /** ISO date the count was read from the governing body. */
  asOf: z.string(),
  description: z.string(),
});
export type MembershipTier = z.infer<typeof membershipTierSchema>;

/**
 * A canonical entity featured on the Overview.
 *
 * `href` is present only where the entity resolved to a real row, so a card
 * either links to a page that exists or renders as plain text. The client never
 * has to construct a URL and hope.
 */
export const overviewEntityRefSchema = z.object({
  section: z.string(),
  entityType: z.enum(['person', 'team', 'competition']),
  displayName: z.string(),
  blurb: z.string().nullable(),
  meta: z.string().nullable(),
  /** Relative path to the entity's page, or null where we hold no such row. */
  href: z.string().nullable(),
  imageUrl: z.string().nullable(),
});
export type OverviewEntityRef = z.infer<typeof overviewEntityRefSchema>;

export const sportOverviewSchema = z.object({
  sport: sportSchema,
  /** Structured quick facts, grouped by category for display. */
  quickFacts: z.array(entityFactSchema),
  /** Authored prose, keyed by kind: `introduction`, `basics`, `evolution`, `womens`. */
  sections: z.array(overviewSectionSchema),
  history: z.array(timelineEventSchema),
  /** The world body with its confederations nested. */
  governance: z.array(governingBodySchema),
  /**
   * The format taxonomy, nested as a tree. Empty for a sport played one way.
   *
   * Required rather than optional, and the API always sends it: an empty array
   * for football, a populated tree for cricket. Neither `.default()` nor
   * `.catch()` is used, both for the same reason the recursive `governance`
   * field avoids them. A default makes the field optional on the schema's input
   * type while leaving it required on the output, so `z.infer` and the parser
   * disagree; and either wrapper around an array of a recursively-annotated
   * `z.ZodType` erases the element type back to `unknown`.
   */
  formats: z.array(sportFormatSchema),
  /** Vocabulary a newcomer needs. Empty where none has been authored. */
  concepts: z.array(sportConceptSchema),
  /** Membership classes of the world body, where it grades its members. */
  membership: z.array(membershipTierSchema),
  /**
   * Featured people, clubs and competitions, keyed by the block they appear in.
   *
   * Empty for a sport with none authored, which is what football and cricket
   * currently return.
   */
  featured: z.array(overviewEntityRefSchema),
  sources: z.array(contentSourceSchema),
});
export type SportOverview = z.infer<typeof sportOverviewSchema>;
