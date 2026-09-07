import { Injectable } from '@nestjs/common';
import { and, eq, gte, inArray, lte, notInArray, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { person, personTeam, team } from '../../../database/schema';

/**
 * Only club/franchise spells are "club history" in the sense this generator
 * asks about — an international call-up isn't a transfer, and wording the
 * question "which club did X play for" would be simply wrong for a
 * national-team spell (see the schema's `teamKindEnum` for the full set).
 * Filtering at the source rather than after the fact means the generator
 * never has to branch its wording per kind.
 */
const CLUB_TEAM_KINDS: ('club' | 'franchise')[] = ['club', 'franchise'];

export interface ClubSpellFact {
  personTeamId: string;
  personId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  /** club/international/franchise/etc — so distractors never mix a national side into a club-spell question or vice versa (Part 4/45). */
  teamKind: string;
  startYear: number;
  endYear: number;
}

/**
 * Reads `person_team` (club-history spells) as eligible facts for
 * `ClubHistoryGenerator`. Restricted to `role = 'player'` with both dates
 * set — a coach/manager spell or an open-ended ("still there") spell isn't
 * the same kind of fact and would need different wording, so this
 * generator only asks about closed player spells.
 */
@Injectable()
export class ClubHistoryRepository {
  constructor(private readonly database: DatabaseService) {}

  async findClubSpells(sportId: string, limit: number): Promise<ClubSpellFact[]> {
    const rows = await this.database.db
      .select({
        personTeamId: personTeam.id,
        personId: personTeam.personId,
        playerName: sql<string>`coalesce(${person.displayName}, ${person.fullName})`,
        teamId: personTeam.teamId,
        teamName: team.name,
        teamKind: team.kind,
        startDate: personTeam.startDate,
        endDate: personTeam.endDate,
      })
      .from(personTeam)
      .innerJoin(person, eq(personTeam.personId, person.id))
      .innerJoin(team, eq(personTeam.teamId, team.id))
      .where(
        and(
          eq(team.sportId, sportId),
          inArray(team.kind, CLUB_TEAM_KINDS),
          eq(personTeam.role, 'player'),
          sql`${personTeam.startDate} is not null`,
          sql`${personTeam.endDate} is not null`,
        ),
      )
      .orderBy(sql`random()`)
      .limit(limit);

    return rows
      .filter((row) => row.startDate && row.endDate)
      .map((row) => ({
        personTeamId: row.personTeamId,
        personId: row.personId,
        playerName: row.playerName,
        teamId: row.teamId,
        teamName: row.teamName,
        teamKind: row.teamKind,
        startYear: new Date(row.startDate as unknown as string).getUTCFullYear(),
        endYear: new Date(row.endDate as unknown as string).getUTCFullYear(),
      }));
  }

  /**
   * Every team a given player has a spell at, for excluding "secretly also
   * correct" distractors — a player who spent 2011-2016 at both Club A and
   * Club B (a loan, a return) must never see Club B offered as a wrong
   * answer for the 2011-2016 Club A question.
   */
  async findPlayersOtherTeamIds(personId: string): Promise<string[]> {
    const rows = await this.database.db
      .select({ teamId: personTeam.teamId })
      .from(personTeam)
      .where(eq(personTeam.personId, personId));
    return rows.map((row) => row.teamId);
  }

  /**
   * Other teams (same sport) with at least one player spell overlapping the
   * given era — keeps distractors roughly contemporaneous rather than
   * offering a club that didn't exist yet or folded decades earlier.
   * `excludeTeamIds` removes every team the fact's own player has ever
   * played for (see `findPlayersOtherTeamIds`), not just the correct one.
   */
  async findEraMatchedDistractorTeamNames(
    sportId: string,
    teamKind: string,
    startYear: number,
    endYear: number,
    excludeTeamIds: string[],
    count: number,
  ): Promise<string[]> {
    const eraStart = `${startYear}-01-01`;
    const eraEnd = `${endYear}-12-31`;
    const rows = await this.database.db
      .select({ name: team.name })
      .from(personTeam)
      .innerJoin(team, eq(personTeam.teamId, team.id))
      .where(
        and(
          eq(team.sportId, sportId),
          eq(team.kind, teamKind as (typeof team.kind.enumValues)[number]),
          eq(personTeam.role, 'player'),
          lte(personTeam.startDate, eraEnd),
          gte(personTeam.endDate, eraStart),
          excludeTeamIds.length > 0 ? notInArray(personTeam.teamId, excludeTeamIds) : undefined,
        ),
      )
      .groupBy(team.id, team.name)
      .orderBy(sql`random()`)
      .limit(count);
    return rows.map((row) => row.name);
  }
}
