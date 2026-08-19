import { Injectable } from '@nestjs/common';
import { and, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { externalMapping, resolutionCandidate } from '../../database/schema';

/**
 * Decides which canonical entity a provider's record refers to.
 *
 * This is the expensive half of multi-source ingestion. Mapping is trivial once
 * you know that two records describe the same thing; establishing that, across
 * thousands of entities and several providers, is where these architectures
 * usually fail. Names disagree ("Barcelona", "FC Barcelona"), transliterations
 * vary, and different entities share names across sports and countries.
 *
 * Three tiers, cheapest and most reliable first:
 *
 *   1. **Known mapping.** We have seen this provider identifier before.
 *   2. **Cross-reference.** The provider publishes an identifier that another
 *      provider also publishes, so the match is deterministic. Verified during
 *      development: every Premier League footballer sampled on Wikidata carried
 *      a Transfermarkt identifier, so person matching is usually exact.
 *   3. **Name similarity**, scored, and only accepted above a threshold.
 *      Everything below it goes to a review queue rather than being guessed.
 *
 * The asymmetry between people and clubs is real and shapes the design. Clubs on
 * Wikidata carry far fewer cross-references than people do (Real Madrid has 79
 * external identifiers, almost none pointing at sports databases; Messi has
 * 184 including Transfermarkt). Club matching therefore leans on tier 3 far more
 * often, which is precisely why the review queue is mandatory rather than
 * optional.
 */
@Injectable()
export class EntityResolutionService {
  /**
   * Similarity at or above which a name match is accepted without review.
   *
   * Set high deliberately. An incorrect merge is far more damaging than an
   * unresolved duplicate: it silently corrupts statistics for two entities at
   * once and is hard to detect afterwards, whereas a duplicate is visible and
   * cheap to fix. When in doubt, queue it.
   */
  private static readonly AUTO_ACCEPT_THRESHOLD = 0.92;

  constructor(private readonly database: DatabaseService) {}

  /**
   * Looks up an existing canonical id for a provider's identifier.
   *
   * The fast path, and the one that makes re-running ingestion cheap: once an
   * entity is mapped, later runs resolve it with a single indexed read.
   */
  async findExistingMapping(
    provider: string,
    entityType: string,
    externalId: string,
  ): Promise<string | null> {
    const [row] = await this.database.db
      .select({ entityId: externalMapping.entityId })
      .from(externalMapping)
      .where(
        and(
          eq(externalMapping.provider, provider as never),
          eq(externalMapping.entityType, entityType as never),
          eq(externalMapping.externalId, externalId),
        ),
      )
      .limit(1);

    return row?.entityId ?? null;
  }

  /**
   * Records that a provider identifier corresponds to one of our entities.
   *
   * Idempotent: re-running ingestion updates the sync timestamp rather than
   * failing on the unique constraint or creating a second mapping.
   */
  async recordMapping(params: {
    provider: string;
    entityType: string;
    externalId: string;
    entityId: string;
    matchMethod: 'deterministic' | 'probabilistic' | 'manual';
    matchConfidence?: number;
  }): Promise<void> {
    await this.database.db
      .insert(externalMapping)
      .values({
        provider: params.provider as never,
        entityType: params.entityType as never,
        externalId: params.externalId,
        entityId: params.entityId,
        matchMethod: params.matchMethod,
        matchConfidence: params.matchConfidence?.toFixed(3),
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [externalMapping.provider, externalMapping.entityType, externalMapping.externalId],
        set: { lastSyncedAt: new Date(), updatedAt: new Date() },
      });
  }

  /**
   * Minimum similarity worth showing a human at all.
   *
   * Raised from 0.4 to 0.75 after watching the first real ingestion run, which
   * is a cautionary tale worth recording. At 0.4 the queue filled with pairs
   * that merely share a place name, every one of them a false positive:
   *
   *   Manchester City F.C. vs Manchester United F.C.   0.577
   *   Torino FC            vs FC Torinese              0.571
   *   Olympique Lyonnais   vs Olympique Lillois        0.480
   *   Paris Saint-Germain  vs Paris FC                 0.409
   *   Inter Milan          vs AC Milan                 0.400
   *
   * Those are eight distinct clubs, several of them among the most prominent in
   * Europe. Worse than the noise is the consequence: each one was withheld from
   * the database pending review, so the site would have been missing Manchester
   * City until somebody worked through a queue full of obvious non-matches.
   *
   * Football club names are unusually adversarial for trigram matching, because
   * a city name shared between rivals is exactly the substring the algorithm
   * rewards. The floor is therefore set well above what a general-purpose
   * fuzzy match would use.
   */
  private static readonly REVIEW_FLOOR = 0.75;

  /**
   * Finds the best name match among existing entities of one type.
   *
   * Uses trigram similarity, which is why `pg_trgm` is created in the first
   * migration: sports entities are proper nouns that providers and people spell
   * inconsistently. `unaccent` means a match does not depend on diacritics
   * surviving two providers and a database driver intact.
   *
   * `country` is a discriminator rather than a scoring input. Two clubs in
   * different countries are different clubs, whatever their names look like, and
   * excluding them outright is cheaper and more reliable than trying to express
   * that as a weighting. It is passed as optional because not every provider
   * supplies it and an absent country must not silently exclude everything.
   *
   * Returns null rather than a weak guess when nothing is close enough.
   */
  async findByNameSimilarity(
    table: 'person' | 'team' | 'competition',
    sportId: string,
    name: string,
    country?: string,
  ): Promise<{ entityId: string; score: number } | null> {
    // The name column differs per table; the rest of the query does not, so the
    // column is chosen here rather than by duplicating the statement.
    const nameColumn = table === 'person' ? 'full_name' : 'name';
    const sportColumn = table === 'person' ? 'primary_sport_id' : 'sport_id';

    // Only applied when both sides know the country, so a null on either side
    // falls back to name similarity alone rather than excluding the row.
    const countryFilter =
      country && table !== 'person'
        ? sql`AND (country IS NULL OR unaccent(lower(country)) = unaccent(lower(${country})))`
        : sql``;

    const rows = await this.database.db.execute<{ id: string; score: number }>(sql`
      SELECT id,
             similarity(unaccent(lower(${sql.raw(nameColumn)})), unaccent(lower(${name}))) AS score
      FROM ${sql.raw(table)}
      WHERE ${sql.raw(sportColumn)} = ${sportId}
        AND similarity(unaccent(lower(${sql.raw(nameColumn)})), unaccent(lower(${name})))
            >= ${EntityResolutionService.REVIEW_FLOOR}
        ${countryFilter}
      ORDER BY score DESC
      LIMIT 1
    `);

    const best = rows[0];
    if (!best) return null;

    return { entityId: best.id, score: Number(best.score) };
  }

  /** Whether a similarity score is strong enough to act on without a human. */
  isAutoAcceptable(score: number): boolean {
    return score >= EntityResolutionService.AUTO_ACCEPT_THRESHOLD;
  }

  /**
   * Queues an uncertain match for human review.
   *
   * Deliberately a queue and not a guess. See the class comment: the asymmetry
   * of harm between a wrong merge and an unresolved duplicate is what justifies
   * the manual step.
   */
  async queueForReview(params: {
    provider: string;
    entityType: string;
    externalId: string;
    externalName: string;
    candidateEntityId?: string;
    score?: number;
    evidence?: Record<string, unknown>;
  }): Promise<void> {
    await this.database.db
      .insert(resolutionCandidate)
      .values({
        provider: params.provider as never,
        entityType: params.entityType as never,
        externalId: params.externalId,
        externalName: params.externalName,
        candidateEntityId: params.candidateEntityId,
        score: params.score?.toFixed(3),
        evidence: params.evidence ?? {},
        status: 'pending',
      })
      .onConflictDoNothing({
        target: [
          resolutionCandidate.provider,
          resolutionCandidate.entityType,
          resolutionCandidate.externalId,
        ],
      });
  }
}
