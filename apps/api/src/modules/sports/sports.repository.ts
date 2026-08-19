import { Injectable } from '@nestjs/common';
import { asc, eq, sql } from 'drizzle-orm';
import type { Sport, SportDetail } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { sport, sportSection } from '../../database/schema';

/**
 * Sports data access. The only place in this module that touches the database.
 *
 * One filter is applied in this layer rather than by callers: unlaunched sports
 * are never returned to the public. Doing that per controller means one
 * forgotten predicate exposes a sport that is not ready, and the sidebar
 * deliberately shows some sports as locked.
 */
@Injectable()
export class SportsRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Every launched sport, in sidebar order. */
  async findAll(): Promise<Sport[]> {
    const rows = await this.database.db
      .select({
        id: sport.id,
        slug: sport.slug,
        name: sport.name,
        shortCode: sport.shortCode,
        traits: sport.traits,
        summary: sport.summary,
      })
      .from(sport)
      .where(eq(sport.isLaunched, true))
      .orderBy(asc(sport.displayOrder));

    return rows.map((row) => ({
      ...row,
      traits: (row.traits ?? {}) as Sport['traits'],
    }));
  }

  /**
   * One sport with the counts behind its tabs.
   *
   * The counts are correlated subqueries rather than joins, deliberately.
   * Joining three one-to-many relationships in a single statement multiplies
   * rows and gives the product of the three counts instead of each of them,
   * which is a bug that hides well because the numbers look plausible.
   */
  async findBySlug(slug: string): Promise<SportDetail | null> {
    const [row] = await this.database.db
      .select({
        id: sport.id,
        slug: sport.slug,
        name: sport.name,
        shortCode: sport.shortCode,
        traits: sport.traits,
        summary: sport.summary,
        // Written with raw identifiers rather than by interpolating the table
        // objects. Drizzle renders an embedded table inside a `sql` template
        // with its query alias, which in a correlated subquery produces a
        // reference that resolves to the wrong scope and silently returns zero.
        // The lists were right while these counts read 0, which is exactly the
        // kind of disagreement that survives a code review.
        teams: sql<number>`(select count(*) from "team" where "team"."sport_id" = "sport"."id")`,
        players: sql<number>`(select count(*) from "person" where "person"."primary_sport_id" = "sport"."id")`,
        competitions: sql<number>`(select count(*) from "competition" where "competition"."sport_id" = "sport"."id")`,
      })
      .from(sport)
      .where(eq(sport.slug, slug))
      .limit(1);

    if (!row) return null;

    const sections = await this.database.db
      .select({
        id: sportSection.id,
        tab: sportSection.tab,
        label: sportSection.label,
        slug: sportSection.slug,
      })
      .from(sportSection)
      .where(eq(sportSection.sportId, row.id))
      .orderBy(asc(sportSection.displayOrder));

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      shortCode: row.shortCode,
      traits: (row.traits ?? {}) as Sport['traits'],
      summary: row.summary,
      counts: {
        // Postgres returns count() as bigint, which the driver hands back as a
        // string. Coerced here so the contract's number type is honest.
        teams: Number(row.teams),
        players: Number(row.players),
        competitions: Number(row.competitions),
      },
      sections,
    };
  }
}
