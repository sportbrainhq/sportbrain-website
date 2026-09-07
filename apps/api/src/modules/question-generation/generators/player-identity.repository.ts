import { Injectable } from '@nestjs/common';
import { and, eq, isNotNull, ne, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { entityFact, person } from '../../../database/schema';

export interface PlayerAttributeFact {
  factId: string;
  personId: string;
  playerName: string;
  attributeValue: string;
}

/**
 * Reads `entity_fact` (`entity_type = 'person'`) as eligible facts for
 * `PlayerIdentityGenerator` — "which player was born in {birthplace}?" /
 * "what position does {player} play?" style questions. Only the keys
 * verified populated in real ingested data (position, birthplace,
 * current_club — see `QUIZ_CONTENT_PLAN.md`'s stat-key audit) are wired;
 * height/weight/full_name/nickname are numeric-or-trivial and don't make
 * interesting MCQ facts on their own.
 */
@Injectable()
export class PlayerIdentityRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Random players who have a value for `factKey`, restricted to values
   * that at least `minGroupSize` distinct players share — a birthplace or
   * position only one player in the whole sport has can't produce
   * distractors sharing the *other* attribute values distinct from the
   * correct one (see `findOtherPlayersWithDifferentValue`), so it's
   * filtered out at the source rather than discovered too late per-fact.
   */
  async findPlayersWithFact(
    sportId: string,
    factKey: string,
    limit: number,
  ): Promise<PlayerAttributeFact[]> {
    const rows = await this.database.db
      .select({
        factId: entityFact.id,
        personId: entityFact.entityId,
        playerName: sql<string>`coalesce(${person.displayName}, ${person.fullName})`,
        attributeValue: entityFact.value,
      })
      .from(entityFact)
      .innerJoin(person, eq(entityFact.entityId, person.id))
      .where(
        and(
          eq(entityFact.entityType, 'person'),
          eq(entityFact.key, factKey),
          eq(person.primarySportId, sportId),
          isNotNull(entityFact.value),
          // Excludes values with a parenthetical annotation — ingestion has
          // been observed to append a role qualifier onto `current_club`
          // ("France (goalkeeping coach)"), which would make the question
          // itself misleading rather than merely obscure. A clean value with
          // no annotation is the only kind this generator can present
          // honestly as "which player currently plays for X".
          sql`${entityFact.value} not like '%(%'`,
        ),
      )
      .orderBy(sql`random()`)
      .limit(limit);
    return rows;
  }

  /**
   * Distinct other real values for `factKey` in this sport, excluding
   * `excludeValue` — the distractor pool for player-first questions ("what
   * position does X play?"): every option must be a real value some other
   * player in the sport actually has for the same attribute, not an
   * invented one.
   */
  async findOtherAttributeValues(
    sportId: string,
    factKey: string,
    excludeValue: string,
    count: number,
  ): Promise<string[]> {
    // Postgres refuses `SELECT DISTINCT ... ORDER BY random()` (the ORDER BY
    // expression must appear in the SELECT list under DISTINCT) — oversample
    // without DISTINCT and dedupe in JS instead, which is fine at this
    // volume (a handful of rows per call).
    const rows = await this.database.db
      .select({ value: entityFact.value })
      .from(entityFact)
      .innerJoin(person, eq(entityFact.entityId, person.id))
      .where(
        and(
          eq(entityFact.entityType, 'person'),
          eq(entityFact.key, factKey),
          eq(person.primarySportId, sportId),
          isNotNull(entityFact.value),
          ne(entityFact.value, excludeValue),
          sql`${entityFact.value} not like '%(%'`,
        ),
      )
      .orderBy(sql`random()`)
      .limit(count * 5);

    const seen = new Set<string>();
    const distinct: string[] = [];
    for (const row of rows) {
      const value = row.value as string;
      if (seen.has(value)) continue;
      seen.add(value);
      distinct.push(value);
      if (distinct.length >= count) break;
    }
    return distinct;
  }

  /**
   * Other players in the same sport whose value for `factKey` is different
   * from `excludeValue` — the distractor pool for "which player has
   * attribute X" questions. Different-value is the plausibility constraint
   * here (Part 4/45): every option must be a real player with a real value
   * for the same attribute, just not the one the question asks about.
   */
  async findOtherPlayersWithDifferentValue(
    sportId: string,
    factKey: string,
    excludeValue: string,
    excludePersonId: string,
    count: number,
  ): Promise<string[]> {
    const rows = await this.database.db
      .select({ name: sql<string>`coalesce(${person.displayName}, ${person.fullName})` })
      .from(entityFact)
      .innerJoin(person, eq(entityFact.entityId, person.id))
      .where(
        and(
          eq(entityFact.entityType, 'person'),
          eq(entityFact.key, factKey),
          eq(person.primarySportId, sportId),
          isNotNull(entityFact.value),
          ne(entityFact.value, excludeValue),
          ne(entityFact.entityId, excludePersonId),
          sql`${entityFact.value} not like '%(%'`,
        ),
      )
      .orderBy(sql`random()`)
      .limit(count);
    return rows.map((row) => row.name);
  }
}
