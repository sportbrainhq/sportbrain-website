/**
 * Hand-entered appearance and goalscoring leaderboards.
 *
 * Ingestion reads these tables from a club or country's Wikipedia records
 * article. Around a hundred notable teams have no such article, or have one
 * that states records only in prose, and no amount of parser work reaches them:
 * Ghana, Egypt, Cameroon and Senegal have no records article at all, Serbia has
 * a list of internationals with no tables in it, Atlético Madrid has only a list
 * of seasons, and Lazio's article covers team records without naming a player.
 *
 * Those teams are filled from here instead. Rows are written with
 * `MANUAL_RANKING_SOURCE` as their `source_title`, which the ingestion upsert
 * refuses to overwrite, so a later crawl cannot replace a curated leaderboard
 * with a worse table it happens to find.
 *
 * ## Rules for adding to this file
 *
 * 1. **Every ranking carries the URL it was read from.** A figure without a
 *    source is indistinguishable from a guess once it is in the database.
 * 2. **Omit rather than approximate.** A team whose figures cannot be sourced
 *    confidently is left out; there is a list of those at the foot of this file.
 * 3. `asOf` records when the figures were last true. Active players' totals go
 *    stale, and a stale number presented as current is the failure mode that
 *    matters here.
 * 4. Confidence is `partial`, never `high`. These are published figures rather
 *    than a maintained records article, and the UI says so.
 *
 * Keyed by team slug, matching the convention in `entity-editorial.ts`.
 */

export interface TeamRankingEntrySeed {
  rank: number;
  name: string;
  value: number;
  /** Career span or club, shown beside the figure where it aids reading. */
  detail?: string;
}

export interface TeamRankingSeed {
  kind: 'most_appearances' | 'top_scorers';
  label: string;
  /** Where the figures came from. Rendered as the table's provenance note. */
  source: string;
  /** ISO date the figures were last verified true. */
  asOf: string;
  entries: TeamRankingEntrySeed[];
}

export const TEAM_RANKING_SEEDS: Record<string, TeamRankingSeed[]> = {};

/**
 * Teams deliberately left out, and why.
 *
 * Recorded so the next person does not spend the afternoon rediscovering it.
 *
 * - **Lazio** publishes an appearance and a goalscoring record holder in prose
 *   and no leaderboard anywhere, on either its own article or its records page.
 *   One name is not a table.
 * - **Palermo, Atalanta, Genoa, Werder Bremen, Zenit** state a handful of club
 *   records in prose without a ranked list behind them.
 * - **Yugoslavia** is defunct and its records are split between successor
 *   federations, which is an editorial decision rather than a data one.
 *
 * Anything here is a candidate for a licensed feed, not for hand entry: a
 * ten-row table typed from a forum post is worse than an absent one, because
 * nothing on the page tells a reader which it is.
 */
export const RANKINGS_WITHOUT_A_SOURCE = [
  'ss-lazio',
  'palermo-f-c',
  'atalanta-bc',
  'genoa-cfc',
  'sv-werder-bremen',
  'fc-zenit-saint-petersburg',
  'yugoslavia-men-s-national-football-team',
] as const;
