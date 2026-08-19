import { Injectable } from '@nestjs/common';
import { and, asc, count, desc, eq, ilike, sql, type SQL } from 'drizzle-orm';
import type { EntityListQuery, PlayerSummary } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { person, personTeam, sport, team } from '../../database/schema';

@Injectable()
export class PlayersRepository {
  constructor(private readonly database: DatabaseService) {}

  async findBySport(
    sportSlug: string,
    query: EntityListQuery,
  ): Promise<{ rows: PlayerSummary[]; total: number }> {
    const predicates: SQL[] = [eq(sport.slug, sportSlug)];

    if (query.q) predicates.push(ilike(person.fullName, `%${query.q}%`));
    if (query.country) predicates.push(eq(person.nationality, query.country));

    const where = and(...predicates);

    const rows = await this.database.db
      .select({
        id: person.id,
        slug: person.slug,
        fullName: person.fullName,
        displayName: person.displayName,
        nationality: person.nationality,
        dateOfBirth: person.dateOfBirth,
        imageUrl: person.imageUrl,
        attributes: person.attributes,
      })
      .from(person)
      .innerJoin(sport, eq(sport.id, person.primarySportId))
      .where(where)
      // Most widely documented first, then players with a portrait, then
      // alphabetically. Notability is the stronger signal; image presence is
      // kept as a tiebreak because a list of faceless names reads as broken
      // even when the data behind it is correct.
      .orderBy(desc(person.notability), sql`(${person.imageUrl} is null)`, asc(person.fullName))
      .limit(query.limit)
      .offset((query.page - 1) * query.limit);

    const [totals] = await this.database.db
      .select({ total: count() })
      .from(person)
      .innerJoin(sport, eq(sport.id, person.primarySportId))
      .where(where);

    return {
      rows: rows.map((row) => ({
        ...row,
        attributes: (row.attributes ?? {}) as Record<string, unknown>,
      })),
      total: Number(totals?.total ?? 0),
    };
  }

  async findBySlug(sportSlug: string, slug: string) {
    const [row] = await this.database.db
      .select({
        id: person.id,
        slug: person.slug,
        fullName: person.fullName,
        displayName: person.displayName,
        nationality: person.nationality,
        dateOfBirth: person.dateOfBirth,
        dateOfDeath: person.dateOfDeath,
        imageUrl: person.imageUrl,
        biography: person.biography,
        attributes: person.attributes,
        sportId: person.primarySportId,
        sportSlug: sport.slug,
        sportName: sport.name,
      })
      .from(person)
      .innerJoin(sport, eq(sport.id, person.primarySportId))
      .where(and(eq(sport.slug, sportSlug), eq(person.slug, slug)))
      .limit(1);

    return row ?? null;
  }

  /**
   * A person's clubs and national sides, most recent first.
   *
   * Ordered so that current spells (a null end date) come first, which is what
   * a reader expects at the top of a career timeline.
   */
  async teamsFor(personId: string) {
    return this.database.db
      .select({
        role: personTeam.role,
        startDate: personTeam.startDate,
        endDate: personTeam.endDate,
        id: team.id,
        slug: team.slug,
        name: team.name,
        shortName: team.shortName,
        kind: team.kind,
        country: team.country,
        foundedYear: team.foundedYear,
        logoUrl: team.logoUrl,
      })
      .from(personTeam)
      .innerJoin(team, eq(team.id, personTeam.teamId))
      .where(eq(personTeam.personId, personId))
      .orderBy(sql`${personTeam.endDate} desc nulls first`, desc(personTeam.startDate))
      .limit(50);
  }
}
