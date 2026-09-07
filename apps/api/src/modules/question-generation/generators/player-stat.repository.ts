import { Injectable } from '@nestjs/common';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { person, personStatistic } from '../../../database/schema';

export interface PlayerStatRow {
  personId: string;
  displayName: string;
  value: number;
}

/**
 * Reads `person_statistic.stats` (a per-sport jsonb bag — cricket's `runs`,
 * basketball's `points_per_game`, F1's `wins`, etc, see
 * `PLAYER_STAT_FIELDS_BY_SPORT`) as eligible facts for
 * `PlayerStatSuperlativeGenerator`. Deliberately samples from `career`-scope
 * rows only (verified: 100% of seeded `person_statistic` rows are
 * `scope = 'career'` today) rather than joining season/competition context,
 * since career totals are the one number guaranteed comparable across every
 * player regardless of which competitions/seasons got ingested for them.
 */
@Injectable()
export class PlayerStatRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * `sampleSize` distinct players who have a numeric value for `statKey`,
   * random order — the caller (the generator) decides how many to draw and
   * whether the sample has a clear, untied maximum. Every option this
   * produces is a real player with a real number for the same stat, which
   * is what makes this fact type inherently distractor-safe (Part 4/45):
   * there is no "obviously wrong" option to construct, only a "which of
   * these four is highest" judgement.
   */
  async sampleWithStat(
    sportId: string,
    statKey: string,
    sampleSize: number,
  ): Promise<PlayerStatRow[]> {
    const rows = await this.database.db
      .select({
        personId: personStatistic.personId,
        displayName: sql<string>`coalesce(${person.displayName}, ${person.fullName})`,
        value: sql<number>`(${personStatistic.stats}->>${statKey})::numeric`,
      })
      .from(personStatistic)
      .innerJoin(person, eq(personStatistic.personId, person.id))
      .where(
        and(
          eq(personStatistic.sportId, sportId),
          eq(personStatistic.scope, 'career'),
          isNotNull(sql`${personStatistic.stats}->>${statKey}`),
        ),
      )
      .orderBy(sql`random()`)
      .limit(sampleSize * 3); // oversample: some rows will collide on personId (a player can have more than one career row) or tie in value, filtered by the caller

    return rows.map((row) => ({ ...row, value: Number(row.value) }));
  }
}
