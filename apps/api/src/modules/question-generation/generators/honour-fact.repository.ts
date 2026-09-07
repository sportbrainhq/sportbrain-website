import { Injectable } from '@nestjs/common';
import { and, eq, isNotNull, ne, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { honour, team } from '../../../database/schema';

export interface TitleWinnerFact {
  honourId: string;
  title: string;
  /** `title` with its leading/trailing season prefix or suffix stripped — see `extractCompetitionKey`. Used to scope distractors to the same competition rather than merely the same sport (Part 4/45's plausibility bar). */
  competitionKey: string;
  winningTeamId: string;
  winningTeamName: string;
  /** club/franchise/international/etc — used to keep distractors within the same kind (Part 4's implicit expectation of plausible wrong answers: a national side is not a plausible distractor for a club-cup question). */
  winningTeamKind: string;
  /** `team.notability` — the only free proxy for "is this a plausible contender" (Part 4/45: a minor associate nation is not a believable wrong answer next to a major tournament's actual winner). Used to keep distractors within the same rough notability tier as the correct answer, not merely the same competition. */
  winningTeamNotability: number;
  prestige: number | null;
}

/**
 * Strips a season/year affix from an honour title, leaving the competition
 * name alone — "1969–70 La Liga" -> "La Liga", "Saudi Premier League
 * 2004–05" -> "Saudi Premier League", "2004 Intercontinental Cup" ->
 * "Intercontinental Cup". This is the fix for the cross-competition
 * distractor bug (an IPL question drawing a non-IPL team as a wrong
 * answer): `honour.title` is free ingested text with no `competition_id`
 * populated for almost every row (verified: 1 populated row out of 4,810
 * football team-titles), so the season-affix pattern is the only reliable
 * signal left to group "same competition, different year" honours without
 * a curated alias table per competition per provider.
 *
 * Deliberately conservative: only strips a recognisable `YYYY`,
 * `YYYY-YY`/`YYYY–YY` token from either end. A title this doesn't match
 * (rare, e.g. "Coppa del Mediterraneo 1992" strips fine, but a title with no
 * year at all is left whole) still works as its own competition key — it
 * just won't group with anything else, which only narrows the distractor
 * pool for that one fact rather than producing a wrong grouping.
 */
export function extractCompetitionKey(title: string): string {
  return title
    .replace(/^\d{4}[-–]\d{2,4}\s+/, '')
    .replace(/^\d{4}\s+/, '')
    .replace(/\s+\d{4}[-–]\d{2,4}$/, '')
    .replace(/\s+\d{4}$/, '')
    .trim();
}

/**
 * Whether a team name marks itself as a women's side ("India women's
 * cricket team", "Odisha women's cricket team"). No `person`/`team` column
 * carries this as structured data — it only exists embedded in ingested
 * names — so a substring check is the only signal available. Used to keep
 * a men's competition's distractors from including a women's team (or vice
 * versa), the same "obviously wrong by category" problem the competition-key
 * scoping fixes for cross-competition mixing, applied to cross-gender
 * mixing instead.
 */
function isWomensTeamName(name: string): boolean {
  return /women'?s|ladies/i.test(name);
}

/**
 * Reads `honour` rows as eligible facts for TEMPLATE question generation —
 * the fact-discovery step Phase C2 explicitly left unwired ("no
 * fact-discovery source is wired yet", see `TemplateGenerator`'s original
 * header). `honour` is ingested free text (`title` embeds season and
 * competition together, e.g. "1969–70 La Liga") rather than a structured
 * `{competition, season, winner}` triple, so the template built on this
 * source asks "Which team won {title}?" rather than templating the
 * competition/season apart — safe because `title` already reads as natural
 * English, and doing otherwise would mean parsing free text that varies in
 * format across three different providers' ingestion conventions.
 */
@Injectable()
export class HonourFactRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Team-title honours for a sport, excluding titles more than one team is
   * recorded as winning — a shared/joint trophy has no single correct
   * answer, and Part 6's "same fact, different wording" duplicate-detection
   * concern doesn't apply here; this is "same fact, genuinely ambiguous
   * answer," which the question format simply cannot represent honestly.
   * Ordered prestige-first (1 = highest) since higher-prestige honours make
   * better-recognised questions, with unranked (`prestige IS NULL`) rows
   * last rather than excluded — most rows carry no prestige at all, and
   * dropping them would starve every sport's inventory.
   */
  async findUnambiguousTeamTitles(sportId: string, limit: number): Promise<TitleWinnerFact[]> {
    // Titles where exactly one distinct team_id won them.
    const singleWinnerTitles = this.database.db
      .select({ title: honour.title })
      .from(honour)
      .where(and(eq(honour.sportId, sportId), eq(honour.kind, 'title'), isNotNull(honour.teamId)))
      .groupBy(honour.title)
      .having(sql`count(distinct ${honour.teamId}) = 1`);

    const rows = await this.database.db
      .select({
        honourId: honour.id,
        title: honour.title,
        winningTeamId: honour.teamId,
        winningTeamName: team.name,
        winningTeamKind: team.kind,
        winningTeamNotability: team.notability,
        prestige: honour.prestige,
      })
      .from(honour)
      .innerJoin(team, eq(honour.teamId, team.id))
      .where(
        and(
          eq(honour.sportId, sportId),
          eq(honour.kind, 'title'),
          isNotNull(honour.teamId),
          sql`${honour.title} in ${singleWinnerTitles}`,
        ),
      )
      .orderBy(sql`${honour.prestige} asc nulls last`)
      .limit(limit);

    return rows
      .filter((row) => row.winningTeamId !== null)
      .map((row) => ({
        ...row,
        winningTeamId: row.winningTeamId as string,
        competitionKey: extractCompetitionKey(row.title),
      }));
  }

  /**
   * Other teams that have won a *different* honour whose title reduces to
   * the same `competitionKey` (Part 4/45: distractors must be plausible,
   * not merely same-sport) — e.g. for "2019 Indian Premier League", this
   * returns teams that won some *other* year's Indian Premier League, never
   * a team from an unrelated cricket competition. Falls back to
   * `findDistractorTeamNames` (sport+kind only) when fewer than `count`
   * competition-scoped candidates exist, since a competition with very few
   * distinct winners (a young or small competition) would otherwise starve
   * that fact's inventory entirely.
   */
  async findCompetitionScopedDistractorNames(
    sportId: string,
    competitionKey: string,
    excludeTeamId: string,
    winningTeamName: string,
    winningTeamNotability: number,
    count: number,
  ): Promise<string[]> {
    const genderFilter = isWomensTeamName(winningTeamName)
      ? sql`${team.name} ~* 'women''?s|ladies'`
      : sql`${team.name} !~* 'women''?s|ladies'`;
    // Ordered by closeness to the winner's own notability, not random — a
    // minor associate nation is not a believable wrong answer next to a
    // major tournament's actual winner (Part 4/45). Still shuffled by the
    // generator afterwards so option order doesn't leak which one is real.
    const rows = await this.database.db
      .select({ name: team.name })
      .from(honour)
      .innerJoin(team, eq(honour.teamId, team.id))
      .where(
        and(
          eq(honour.sportId, sportId),
          eq(honour.kind, 'title'),
          isNotNull(honour.teamId),
          ne(honour.teamId, excludeTeamId),
          sql`regexp_replace(regexp_replace(regexp_replace(regexp_replace(${honour.title}, '^\\d{4}[-–]\\d{2,4}\\s+', ''), '^\\d{4}\\s+', ''), '\\s+\\d{4}[-–]\\d{2,4}$', ''), '\\s+\\d{4}$', '') = ${competitionKey}`,
          genderFilter,
        ),
      )
      .groupBy(team.id, team.name, team.notability)
      .orderBy(sql`abs(${team.notability} - ${winningTeamNotability})`)
      .limit(count);
    return rows.map((row) => row.name);
  }

  /**
   * A pool of other team names for distractor selection — sport-scoped (no
   * cricket teams in a football question) and kind-matched (no national
   * side offered as a distractor for a club trophy, or vice versa). This is
   * the fallback used only when the competition-scoped pool
   * (`findCompetitionScopedDistractorNames`) can't fill all the requested
   * slots on its own — every wrong option is at least a plausible answer by
   * sport/kind, even if not guaranteed to be from the exact same
   * competition.
   */
  async findDistractorTeamNames(
    sportId: string,
    excludeTeamId: string,
    kind: string,
    winningTeamName: string,
    winningTeamNotability: number,
    count: number,
  ): Promise<string[]> {
    const genderFilter = isWomensTeamName(winningTeamName)
      ? sql`${team.name} ~* 'women''?s|ladies'`
      : sql`${team.name} !~* 'women''?s|ladies'`;
    const rows = await this.database.db
      .select({ name: team.name })
      .from(team)
      .where(
        and(
          eq(team.sportId, sportId),
          eq(team.kind, kind as (typeof team.kind.enumValues)[number]),
          sql`${team.id} != ${excludeTeamId}`,
          genderFilter,
        ),
      )
      .orderBy(sql`abs(${team.notability} - ${winningTeamNotability})`)
      .limit(count);
    return rows.map((row) => row.name);
  }
}
