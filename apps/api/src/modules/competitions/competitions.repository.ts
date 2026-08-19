import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { CompetitionRecord, CompetitionSummary, EntityListQuery } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import {
  competition,
  competitionStatistic,
  person,
  season,
  sport,
  statisticDefinition,
  team,
} from '../../database/schema';

@Injectable()
export class CompetitionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async findBySport(
    sportSlug: string,
    query: EntityListQuery,
  ): Promise<{ rows: CompetitionSummary[]; total: number }> {
    const predicates: SQL[] = [eq(sport.slug, sportSlug)];

    // `kind` separates international from domestic, matching the tab grouping.
    if (query.kind) predicates.push(eq(competition.kind, query.kind as never));
    if (query.country) predicates.push(eq(competition.country, query.country));
    if (query.q) predicates.push(ilike(competition.name, `%${query.q}%`));

    const where = and(...predicates);

    const rows = await this.database.db
      .select({
        id: competition.id,
        slug: competition.slug,
        name: competition.name,
        shortName: competition.shortName,
        kind: competition.kind,
        format: competition.format,
        country: competition.country,
        foundedYear: competition.foundedYear,
        logoUrl: competition.logoUrl,
      })
      .from(competition)
      .innerJoin(sport, eq(sport.id, competition.sportId))
      .where(where)
      // Tier first, because it is the column that says the Premier League
      // matters more than a regional cup, then notability within a tier.
      .orderBy(asc(competition.tier), desc(competition.notability), asc(competition.name))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [totals] = await this.database.db
      .select({ total: count() })
      .from(competition)
      .innerJoin(sport, eq(sport.id, competition.sportId))
      .where(where);

    return { rows, total: Number(totals?.total ?? 0) };
  }

  async findBySlug(sportSlug: string, slug: string) {
    const [row] = await this.database.db
      .select({
        id: competition.id,
        slug: competition.slug,
        name: competition.name,
        shortName: competition.shortName,
        kind: competition.kind,
        format: competition.format,
        country: competition.country,
        foundedYear: competition.foundedYear,
        logoUrl: competition.logoUrl,
        about: competition.about,
        isActive: competition.isActive,
        sportSlug: sport.slug,
        sportName: sport.name,
      })
      .from(competition)
      .innerJoin(sport, eq(sport.id, competition.sportId))
      .where(and(eq(sport.slug, sportSlug), eq(competition.slug, slug)))
      .limit(1);

    return row ?? null;
  }

  async seasonsFor(competitionId: string) {
    return this.database.db
      .select({
        id: season.id,
        label: season.label,
        startYear: season.startYear,
        isCurrent: season.isCurrent,
      })
      .from(season)
      .where(eq(season.competitionId, competitionId))
      .orderBy(sql`${season.startYear} desc`)
      .limit(100);
  }

  /**
   * Records and aggregates for a competition, with their holders resolved.
   *
   * Both holder joins are left joins because a row may be held by a person, by
   * a team, or by neither: "matches played" is a plain aggregate with no holder
   * at all, and all three render from the same shape.
   */
  async recordsFor(competitionId: string, sportId: string): Promise<CompetitionRecord[]> {
    const rows = await this.database.db
      .select({
        statKey: competitionStatistic.statKey,
        value: competitionStatistic.value,
        note: competitionStatistic.note,
        label: statisticDefinition.label,
        personId: person.id,
        personSlug: person.slug,
        personName: person.fullName,
        teamId: team.id,
        teamSlug: team.slug,
        teamName: team.name,
      })
      .from(competitionStatistic)
      .leftJoin(person, eq(person.id, competitionStatistic.recordPersonId))
      .leftJoin(team, eq(team.id, competitionStatistic.recordTeamId))
      .leftJoin(
        statisticDefinition,
        and(
          eq(statisticDefinition.sportId, sportId),
          eq(statisticDefinition.key, competitionStatistic.statKey),
        ),
      )
      .where(eq(competitionStatistic.competitionId, competitionId))
      .limit(100);

    return rows.map((row) => ({
      statKey: row.statKey,
      // Falls back to the raw key when the registry has no entry, so a record
      // still renders rather than vanishing. Unlike entity statistics, a
      // competition record is a single labelled fact and showing it with an
      // unpolished name beats hiding it.
      label: row.label ?? row.statKey,
      value: row.value === null ? null : Number(row.value),
      note: row.note,
      holder: row.personId
        ? {
            type: 'person' as const,
            id: row.personId,
            slug: row.personSlug!,
            name: row.personName!,
          }
        : row.teamId
          ? { type: 'team' as const, id: row.teamId, slug: row.teamSlug!, name: row.teamName! }
          : null,
    }));
  }
}
