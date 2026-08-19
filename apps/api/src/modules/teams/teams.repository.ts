import { Injectable } from '@nestjs/common';
import { and, asc, count, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { EntityListQuery, TeamSummary } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { sport, team } from '../../database/schema';

@Injectable()
export class TeamsRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Teams for one sport, filtered and paginated.
   *
   * The count runs as a separate statement rather than a window function. A
   * window function would compute the total on every row of the page, and the
   * two-query form is clearer about what it costs.
   */
  async findBySport(
    sportSlug: string,
    query: EntityListQuery,
  ): Promise<{ rows: TeamSummary[]; total: number }> {
    const predicates: SQL[] = [eq(sport.slug, sportSlug)];

    // `kind` drives the International/Club split the Teams tab renders.
    if (query.kind) predicates.push(eq(team.kind, query.kind as never));
    if (query.country) predicates.push(eq(team.country, query.country));
    if (query.q) predicates.push(ilike(team.name, `%${query.q}%`));

    const where = and(...predicates);

    const rows = await this.database.db
      .select({
        id: team.id,
        slug: team.slug,
        name: team.name,
        shortName: team.shortName,
        kind: team.kind,
        country: team.country,
        foundedYear: team.foundedYear,
        logoUrl: team.logoUrl,
      })
      .from(team)
      .innerJoin(sport, eq(sport.id, team.sportId))
      .where(where)
      // Named teams before unnamed, then alphabetical. Founding year is not the
      // sort key: it is null often enough that it would scatter the list.
      .orderBy(asc(team.name))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [totals] = await this.database.db
      .select({ total: count() })
      .from(team)
      .innerJoin(sport, eq(sport.id, team.sportId))
      .where(where);

    return { rows, total: Number(totals?.total ?? 0) };
  }

  /** One team, with the sport it belongs to. */
  async findBySlug(sportSlug: string, slug: string) {
    const [row] = await this.database.db
      .select({
        id: team.id,
        slug: team.slug,
        name: team.name,
        shortName: team.shortName,
        kind: team.kind,
        country: team.country,
        foundedYear: team.foundedYear,
        logoUrl: team.logoUrl,
        about: team.about,
        isActive: team.isActive,
        sportId: team.sportId,
        sportSlug: sport.slug,
        sportName: sport.name,
      })
      .from(team)
      .innerJoin(sport, eq(sport.id, team.sportId))
      .where(and(eq(sport.slug, sportSlug), eq(team.slug, slug)))
      .limit(1);

    return row ?? null;
  }

  /** Distinct countries present for a sport, for the filter control. */
  async countriesForSport(sportSlug: string): Promise<string[]> {
    const rows = await this.database.db
      .selectDistinct({ country: team.country })
      .from(team)
      .innerJoin(sport, eq(sport.id, team.sportId))
      .where(and(eq(sport.slug, sportSlug), sql`${team.country} is not null`))
      .orderBy(asc(team.country));

    return rows.map((row) => row.country).filter((value): value is string => value !== null);
  }
}
