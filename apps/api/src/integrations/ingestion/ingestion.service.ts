import { Injectable, Logger } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import {
  competition,
  externalMapping,
  honour,
  ingestionRun,
  person,
  personTeam,
  sport,
  team,
  venue,
} from '../../database/schema';
import { ProviderError, type SportsDataProvider } from '../providers/provider.types';
import { EntityResolutionService } from './entity-resolution.service';

/**
 * Drives a provider adapter and writes what it returns into the canonical schema.
 *
 * Three properties this must have, all of which shape the code more than they
 * look like they should:
 *
 *   1. **Idempotent.** Re-running must correct rather than duplicate. Providers
 *      restate history, and normalisation bugs mean reprocessing the same source
 *      data more than once.
 *   2. **Resumable.** Historical backfill runs beneath a daily request budget
 *      for days or weeks, so it must stop and continue rather than restart. The
 *      cursor is persisted on the run record for exactly this.
 *   3. **Honest about failure.** A single bad record must not abort a run of
 *      thousands, and must not be silently swallowed either. Failures are
 *      counted and logged per record.
 */
@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly resolution: EntityResolutionService,
  ) {}

  /**
   * Ingests every team a provider knows about for one sport.
   *
   * Returns the run summary rather than throwing on partial failure: a run that
   * wrote 900 of 1,000 records succeeded at something, and the caller needs the
   * numbers to decide whether to continue.
   */
  async ingestTeams(
    provider: SportsDataProvider,
    sportSlug: string,
    options: { maxPages?: number; variant?: 'club' | 'international' } = {},
  ): Promise<IngestionSummary> {
    if (!provider.capabilities.teams || !provider.fetchTeams) {
      // Declared capabilities, checked before spending a request. A provider
      // that has no teams should never be asked for them.
      return this.skipped(provider.key, `teams:${sportSlug}`, 'provider does not supply teams');
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(provider.key, `teams:${sportSlug}`, `unknown sport "${sportSlug}"`);
    }

    const variant = options.variant ?? 'club';
    const run = await this.startRun(provider.key, `teams:${sportSlug}:${variant}`);
    const summary: IngestionSummary = {
      runId: run.id,
      read: 0,
      written: 0,
      failed: 0,
      queued: 0,
      requestsUsed: 0,
      status: 'succeeded',
    };

    let cursor: string | undefined;
    let page = 0;
    const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY;

    try {
      do {
        const result = await provider.fetchTeams(sportSlug, cursor, variant);
        summary.requestsUsed += result.requestsUsed;
        summary.read += result.items.length;

        for (const item of result.items) {
          try {
            const outcome = await this.upsertTeam(provider.key, sportId, item);
            if (outcome === 'written') summary.written += 1;
            if (outcome === 'queued') summary.queued += 1;
          } catch (error) {
            // One malformed record must not end the run. Counted and logged so
            // a systematic problem is visible in the totals rather than hidden.
            summary.failed += 1;
            this.logger.warn(
              `Failed to ingest team "${item.name}" (${item.externalId}): ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        cursor = result.cursor ?? undefined;
        page += 1;
        await this.updateRunProgress(run.id, summary, cursor);
      } while (cursor && page < maxPages);
    } catch (error) {
      summary.status = 'failed';
      const message = error instanceof Error ? error.message : String(error);
      await this.finishRun(run.id, summary, message);

      // A non-retryable provider error is a bug in our query or mapping, and
      // should surface rather than be recorded as a bad day.
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /** Ingests people. Same contract and failure handling as `ingestTeams`. */
  async ingestPeople(
    provider: SportsDataProvider,
    sportSlug: string,
    options: { maxPages?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.capabilities.people || !provider.fetchPeople) {
      return this.skipped(provider.key, `people:${sportSlug}`, 'provider does not supply people');
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(provider.key, `people:${sportSlug}`, `unknown sport "${sportSlug}"`);
    }

    const run = await this.startRun(provider.key, `people:${sportSlug}`);
    const summary: IngestionSummary = {
      runId: run.id,
      read: 0,
      written: 0,
      failed: 0,
      queued: 0,
      requestsUsed: 0,
      status: 'succeeded',
    };

    let cursor: string | undefined;
    let page = 0;
    const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY;

    try {
      do {
        const result = await provider.fetchPeople(sportSlug, cursor);
        summary.requestsUsed += result.requestsUsed;
        summary.read += result.items.length;

        for (const item of result.items) {
          try {
            const outcome = await this.upsertPerson(provider.key, sportId, item);
            if (outcome === 'written') summary.written += 1;
            if (outcome === 'queued') summary.queued += 1;
          } catch (error) {
            summary.failed += 1;
            this.logger.warn(
              `Failed to ingest person "${item.name}" (${item.externalId}): ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        cursor = result.cursor ?? undefined;
        page += 1;
        await this.updateRunProgress(run.id, summary, cursor);
      } while (cursor && page < maxPages);
    } catch (error) {
      summary.status = 'failed';
      const message = error instanceof Error ? error.message : String(error);
      await this.finishRun(run.id, summary, message);
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /**
   * Ingests competitions for one sport.
   *
   * Simpler than teams or people: competitions are few, their names are
   * distinctive, and there is little duplicate risk, so the resolution step is
   * a mapping lookup and an insert rather than a similarity search.
   */
  async ingestCompetitions(
    provider: SportsDataProvider,
    sportSlug: string,
    options: { maxPages?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.capabilities.competitions || !provider.fetchCompetitions) {
      return this.skipped(
        provider.key,
        `competitions:${sportSlug}`,
        'provider does not supply competitions',
      );
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(
        provider.key,
        `competitions:${sportSlug}`,
        `unknown sport "${sportSlug}"`,
      );
    }

    const run = await this.startRun(provider.key, `competitions:${sportSlug}`);
    const summary = this.newSummary(run.id);
    let cursor: string | undefined;
    let page = 0;
    const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY;

    try {
      do {
        const result = await provider.fetchCompetitions(sportSlug, cursor);
        summary.requestsUsed += result.requestsUsed;
        summary.read += result.items.length;

        for (const item of result.items) {
          try {
            const existing = await this.resolution.findExistingMapping(
              provider.key,
              'competition',
              item.externalId,
            );
            if (existing) {
              summary.written += 1;
              continue;
            }

            const [created] = await this.database.db
              .insert(competition)
              .values({
                sportId,
                // Inferred from whether a country is present: a competition
                // tied to one country is domestic, one that is not is
                // international. Crude, and correct far more often than not.
                kind: item.fields.country ? 'domestic' : 'international',
                format: 'league',
                slug: this.slugify(item.fields.name),
                name: item.fields.name,
                country: item.fields.country,
                foundedYear: item.fields.foundedYear,
                logoUrl: item.fields.logoUrl,
                notability: item.notability ?? 0,
                confidence: 'provisional',
              })
              .onConflictDoNothing({ target: [competition.sportId, competition.slug] })
              .returning({ id: competition.id });

            if (!created) {
              summary.queued += 1;
              continue;
            }

            await this.resolution.recordMapping({
              provider: provider.key,
              entityType: 'competition',
              externalId: item.externalId,
              entityId: created.id,
              matchMethod: 'deterministic',
              matchConfidence: 1,
            });
            summary.written += 1;
          } catch (error) {
            summary.failed += 1;
            this.logger.warn(
              `Failed to ingest competition "${item.name}": ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        cursor = result.cursor ?? undefined;
        page += 1;
        await this.updateRunProgress(run.id, summary, cursor);
      } while (cursor && page < maxPages);
    } catch (error) {
      summary.status = 'failed';
      await this.finishRun(run.id, summary, error instanceof Error ? error.message : String(error));
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /**
   * Ingests venues.
   *
   * Venues are not scoped to a sport in the schema, because the same ground
   * hosts football and cricket and duplicating it per sport would double-count
   * its capacity and location. The sport is only used to decide which venues to
   * ask the provider for.
   */
  async ingestVenues(
    provider: SportsDataProvider,
    sportSlug: string,
    options: { maxPages?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.capabilities.venues || !provider.fetchVenues) {
      return this.skipped(provider.key, `venues:${sportSlug}`, 'provider does not supply venues');
    }

    const run = await this.startRun(provider.key, `venues:${sportSlug}`);
    const summary = this.newSummary(run.id);
    let cursor: string | undefined;
    let page = 0;
    const maxPages = options.maxPages ?? Number.POSITIVE_INFINITY;

    try {
      do {
        const result = await provider.fetchVenues(sportSlug, cursor);
        summary.requestsUsed += result.requestsUsed;
        summary.read += result.items.length;

        for (const item of result.items) {
          try {
            const existing = await this.resolution.findExistingMapping(
              provider.key,
              'venue',
              item.externalId,
            );
            if (existing) {
              summary.written += 1;
              continue;
            }

            const [created] = await this.database.db
              .insert(venue)
              .values({
                slug: this.slugify(item.fields.name),
                name: item.fields.name,
                city: item.fields.city,
                country: item.fields.country,
                capacity: item.fields.capacity,
                openedYear: item.fields.openedYear,
                confidence: 'provisional',
              })
              .onConflictDoNothing({ target: [venue.slug] })
              .returning({ id: venue.id });

            if (!created) {
              // Already present, most likely ingested for another sport. That is
              // the shared-venue case working as intended, not a failure.
              summary.written += 1;
              continue;
            }

            await this.resolution.recordMapping({
              provider: provider.key,
              entityType: 'venue',
              externalId: item.externalId,
              entityId: created.id,
              matchMethod: 'deterministic',
              matchConfidence: 1,
            });
            summary.written += 1;
          } catch (error) {
            summary.failed += 1;
            this.logger.warn(
              `Failed to ingest venue "${item.name}": ${
                error instanceof Error ? error.message : String(error)
              }`,
            );
          }
        }

        cursor = result.cursor ?? undefined;
        page += 1;
        await this.updateRunProgress(run.id, summary, cursor);
      } while (cursor && page < maxPages);
    } catch (error) {
      summary.status = 'failed';
      await this.finishRun(run.id, summary, error instanceof Error ? error.message : String(error));
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /**
   * Fetches honours for people already ingested, in batches.
   *
   * Runs as a second pass rather than as part of person ingestion, because
   * honours are one-to-many: joining them into the person query would multiply
   * each person's row once per award, and the `SAMPLE` that keeps that query
   * sane would then throw all but one away.
   *
   * Awards are filtered against a keyword list. Wikidata mixes sporting honours
   * with civic ones (Cristiano Ronaldo holds the Order of Prince Henry), and a
   * player page listing state decorations alongside the Ballon d'Or is noise.
   * The filter is deliberately conservative: it keeps recognisably sporting
   * awards and drops the rest, accepting that it will miss some obscure ones.
   */
  async ingestHonours(
    provider: SportsDataProvider & {
      fetchHonours?: (
        qids: readonly string[],
      ) => Promise<Map<string, { title: string; year?: number }[]>>;
    },
    sportSlug: string,
    options: { batchSize?: number; maxBatches?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.fetchHonours) {
      return this.skipped(provider.key, `honours:${sportSlug}`, 'provider does not supply honours');
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(provider.key, `honours:${sportSlug}`, `unknown sport "${sportSlug}"`);
    }

    const run = await this.startRun(provider.key, `honours:${sportSlug}`);
    const summary = this.newSummary(run.id);
    const batchSize = options.batchSize ?? 50;
    const maxBatches = options.maxBatches ?? Number.POSITIVE_INFINITY;

    // Only people this provider mapped can be asked about, since the query is
    // keyed by the provider's own identifiers.
    const mapped = await this.database.db.execute<{ entity_id: string; external_id: string }>(sql`
      SELECT em.entity_id, em.external_id
      FROM external_mapping em
      JOIN person p ON p.id = em.entity_id
      WHERE em.provider = ${provider.key}
        AND em.entity_type = 'person'
        AND p.primary_sport_id = ${sportId}
    `);

    try {
      for (
        let index = 0, batch = 0;
        index < mapped.length && batch < maxBatches;
        index += batchSize, batch += 1
      ) {
        const slice = mapped.slice(index, index + batchSize);
        const byQid = await provider.fetchHonours(slice.map((row) => row.external_id));
        summary.requestsUsed += 1;

        for (const row of slice) {
          const awards = byQid.get(row.external_id) ?? [];
          for (const award of awards) {
            summary.read += 1;
            if (!IngestionService.isSportingHonour(award.title)) continue;

            try {
              await this.database.db
                .insert(honour)
                .values({
                  sportId,
                  personId: row.entity_id,
                  kind: 'award',
                  title: award.title,
                  year: award.year,
                })
                // Targets the partial unique index, so a re-run updates
                // nothing rather than inserting a second copy.
                .onConflictDoNothing({
                  target: [honour.personId, honour.title, honour.year],
                });
              summary.written += 1;
            } catch (error) {
              summary.failed += 1;
              this.logger.warn(
                `Failed to ingest honour "${award.title}": ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }

        await this.updateRunProgress(run.id, summary, String(index + batchSize));
      }
    } catch (error) {
      summary.status = 'failed';
      await this.finishRun(run.id, summary, error instanceof Error ? error.message : String(error));
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /**
   * Whether an award looks like a sporting honour rather than a civic one.
   *
   * Keyword matching, which is inelegant and works. The alternative would be
   * classifying every award item in Wikidata, which is a far larger job for a
   * marginal gain on a list that a human will curate anyway.
   */
  private static isSportingHonour(title: string): boolean {
    const lower = title.toLowerCase();

    // Civic decorations dominate the false positives and are easy to name.
    const excluded = ['order of', 'medal of merit', 'knight', 'officer of', 'commander of'];
    if (excluded.some((term) => lower.includes(term))) return false;

    const included = [
      'ballon',
      'player of the year',
      'team of the year',
      'golden',
      'top scorer',
      'mvp',
      'most valuable',
      'award',
      'trophy',
      'cup',
      'championship',
      'best ',
      'hall of fame',
      'sportsperson',
      'footballer of the year',
      'cricketer of the year',
    ];
    return included.some((term) => lower.includes(term));
  }

  /**
   * Titles and awards for teams already ingested.
   *
   * Kept separate from person honours because the two draw on different
   * properties: a club's trophies come from competitions that name it as
   * winner, not from awards given to it. See `teamHonoursQuery`.
   *
   * The sporting-honour keyword filter is not applied here. A club's honours are
   * competitions it won, which are sporting by definition, and the filter exists
   * to strip civic decorations from people.
   */
  async ingestTeamHonours(
    provider: SportsDataProvider & {
      fetchTeamHonours?: (
        qids: readonly string[],
      ) => Promise<Map<string, { title: string; year?: number; kind: string }[]>>;
    },
    sportSlug: string,
    options: { batchSize?: number; maxBatches?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.fetchTeamHonours) {
      return this.skipped(
        provider.key,
        `team-honours:${sportSlug}`,
        'provider does not supply team honours',
      );
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(
        provider.key,
        `team-honours:${sportSlug}`,
        `unknown sport "${sportSlug}"`,
      );
    }

    const run = await this.startRun(provider.key, `team-honours:${sportSlug}`);
    const summary = this.newSummary(run.id);
    const batchSize = options.batchSize ?? 40;
    const maxBatches = options.maxBatches ?? Number.POSITIVE_INFINITY;

    const mapped = await this.database.db.execute<{ entity_id: string; external_id: string }>(sql`
      SELECT em.entity_id, em.external_id
      FROM external_mapping em
      JOIN team t ON t.id = em.entity_id
      WHERE em.provider = ${provider.key}
        AND em.entity_type = 'team'
        AND t.sport_id = ${sportId}
    `);

    try {
      for (
        let index = 0, batch = 0;
        index < mapped.length && batch < maxBatches;
        index += batchSize, batch += 1
      ) {
        const slice = mapped.slice(index, index + batchSize);
        const byQid = await provider.fetchTeamHonours(slice.map((row) => row.external_id));
        summary.requestsUsed += 1;

        for (const row of slice) {
          for (const award of byQid.get(row.external_id) ?? []) {
            summary.read += 1;
            try {
              // Checked rather than left to ON CONFLICT. `year` is nullable, and
              // Postgres cannot match a partial unique index over a nullable
              // column from an ON CONFLICT target, so the conflict clause fails
              // outright rather than silently skipping.
              const [existing] = await this.database.db
                .select({ id: honour.id })
                .from(honour)
                .where(
                  and(
                    eq(honour.teamId, row.entity_id),
                    eq(honour.title, award.title),
                    award.year === undefined ? isNull(honour.year) : eq(honour.year, award.year),
                  ),
                )
                .limit(1);

              if (existing) continue;

              await this.database.db.insert(honour).values({
                sportId,
                teamId: row.entity_id,
                kind: award.kind,
                title: award.title,
                year: award.year,
              });
              summary.written += 1;
            } catch (error) {
              summary.failed += 1;
              this.logger.warn(
                `Failed to ingest team honour "${award.title}": ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }

        await this.updateRunProgress(run.id, summary, String(index + batchSize));
      }
    } catch (error) {
      summary.status = 'failed';
      await this.finishRun(run.id, summary, error instanceof Error ? error.message : String(error));
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  /**
   * Club spells, which turn a player page into a career timeline.
   *
   * Only memberships whose club is already in our database are written. A spell
   * at a club we do not hold cannot be linked, and inventing a placeholder team
   * to hang it from would put entities in the catalogue that no ingestion run
   * asked for.
   */
  async ingestMemberships(
    provider: SportsDataProvider & {
      fetchMemberships?: (
        qids: readonly string[],
      ) => Promise<
        Map<string, { teamExternalId: string; teamName: string; start?: string; end?: string }[]>
      >;
    },
    sportSlug: string,
    options: { batchSize?: number; maxBatches?: number } = {},
  ): Promise<IngestionSummary> {
    if (!provider.fetchMemberships) {
      return this.skipped(
        provider.key,
        `memberships:${sportSlug}`,
        'provider does not supply memberships',
      );
    }

    const sportId = await this.sportIdBySlug(sportSlug);
    if (!sportId) {
      return this.skipped(provider.key, `memberships:${sportSlug}`, `unknown sport "${sportSlug}"`);
    }

    const run = await this.startRun(provider.key, `memberships:${sportSlug}`);
    const summary = this.newSummary(run.id);
    const batchSize = options.batchSize ?? 40;
    const maxBatches = options.maxBatches ?? Number.POSITIVE_INFINITY;

    const people = await this.database.db.execute<{ entity_id: string; external_id: string }>(sql`
      SELECT em.entity_id, em.external_id
      FROM external_mapping em
      JOIN person p ON p.id = em.entity_id
      WHERE em.provider = ${provider.key}
        AND em.entity_type = 'person'
        AND p.primary_sport_id = ${sportId}
    `);

    // One lookup of every mapped team, rather than a query per membership.
    const teamRows = await this.database.db
      .select({ entityId: externalMapping.entityId, externalId: externalMapping.externalId })
      .from(externalMapping)
      .where(
        and(
          eq(externalMapping.provider, provider.key as never),
          eq(externalMapping.entityType, 'team'),
        ),
      );
    const teamByQid = new Map(teamRows.map((row) => [row.externalId, row.entityId]));

    try {
      for (
        let index = 0, batch = 0;
        index < people.length && batch < maxBatches;
        index += batchSize, batch += 1
      ) {
        const slice = people.slice(index, index + batchSize);
        const byQid = await provider.fetchMemberships(slice.map((row) => row.external_id));
        summary.requestsUsed += 1;

        for (const row of slice) {
          for (const membership of byQid.get(row.external_id) ?? []) {
            summary.read += 1;

            const teamId = teamByQid.get(membership.teamExternalId);
            if (!teamId) {
              // Counted rather than failed: a spell at a club outside our
              // catalogue is missing data, not an error.
              summary.queued += 1;
              continue;
            }

            try {
              await this.database.db
                .insert(personTeam)
                .values({
                  personId: row.entity_id,
                  teamId,
                  role: 'player',
                  startDate: membership.start,
                  endDate: membership.end,
                  confidence: 'provisional',
                })
                .onConflictDoNothing();
              summary.written += 1;
            } catch (error) {
              summary.failed += 1;
              this.logger.warn(
                `Failed to ingest membership: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              );
            }
          }
        }

        await this.updateRunProgress(run.id, summary, String(index + batchSize));
      }
    } catch (error) {
      summary.status = 'failed';
      await this.finishRun(run.id, summary, error instanceof Error ? error.message : String(error));
      if (error instanceof ProviderError && !error.retryable) throw error;
      return summary;
    }

    await this.finishRun(run.id, summary);
    return summary;
  }

  // ---------------------------------------------------------------------------
  // Upserts
  // ---------------------------------------------------------------------------

  private async upsertTeam(
    providerKey: string,
    sportId: string,
    item: Awaited<ReturnType<NonNullable<SportsDataProvider['fetchTeams']>>>['items'][number],
  ): Promise<'written' | 'queued'> {
    const existingId = await this.resolution.findExistingMapping(
      providerKey,
      'team',
      item.externalId,
    );

    if (existingId) {
      // Known entity. Update the fields this provider is authoritative for,
      // leaving anything a human has locked untouched.
      await this.database.db
        .update(team)
        .set({
          country: item.fields.country,
          foundedYear: item.fields.foundedYear,
          logoUrl: item.fields.logoUrl,
          notability: item.notability ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(team.id, existingId));

      await this.resolution.recordMapping({
        provider: providerKey,
        entityType: 'team',
        externalId: item.externalId,
        entityId: existingId,
        matchMethod: 'deterministic',
        matchConfidence: 1,
      });
      return 'written';
    }

    // Unknown to this provider. Does it match something we already hold?
    // Country is passed so that two similarly named clubs in different
    // countries are never considered the same entity.
    const match = await this.resolution.findByNameSimilarity(
      'team',
      sportId,
      item.fields.name,
      item.fields.country,
    );

    if (match && this.resolution.isAutoAcceptable(match.score)) {
      await this.resolution.recordMapping({
        provider: providerKey,
        entityType: 'team',
        externalId: item.externalId,
        entityId: match.entityId,
        matchMethod: 'probabilistic',
        matchConfidence: match.score,
      });
      return 'written';
    }

    if (match) {
      // Close but not close enough. A human decides.
      await this.resolution.queueForReview({
        provider: providerKey,
        entityType: 'team',
        externalId: item.externalId,
        externalName: item.fields.name,
        candidateEntityId: match.entityId,
        score: match.score,
        evidence: { comparedOn: 'name', country: item.fields.country },
      });
      return 'queued';
    }

    // Nothing resembling it exists, so this is a new entity.
    const [created] = await this.database.db
      .insert(team)
      .values({
        sportId,
        kind: (item.fields.kind ?? 'club') as never,
        slug: this.slugify(item.fields.name),
        name: item.fields.name,
        shortName: item.fields.shortName,
        country: item.fields.country,
        foundedYear: item.fields.foundedYear,
        logoUrl: item.fields.logoUrl,
        notability: item.notability ?? 0,
        // Provisional until corroborated: a single free source is not enough to
        // put a row in front of the public.
        confidence: 'provisional',
      })
      .onConflictDoNothing({ target: [team.sportId, team.slug] })
      .returning({ id: team.id });

    if (!created) {
      // Slug collision with a different entity: two clubs whose names normalise
      // identically. Not resolvable automatically.
      await this.resolution.queueForReview({
        provider: providerKey,
        entityType: 'team',
        externalId: item.externalId,
        externalName: item.fields.name,
        evidence: { reason: 'slug collision', slug: this.slugify(item.fields.name) },
      });
      return 'queued';
    }

    await this.resolution.recordMapping({
      provider: providerKey,
      entityType: 'team',
      externalId: item.externalId,
      entityId: created.id,
      matchMethod: 'deterministic',
      matchConfidence: 1,
    });
    return 'written';
  }

  private async upsertPerson(
    providerKey: string,
    sportId: string,
    item: Awaited<ReturnType<NonNullable<SportsDataProvider['fetchPeople']>>>['items'][number],
  ): Promise<'written' | 'queued'> {
    const existingId = await this.resolution.findExistingMapping(
      providerKey,
      'person',
      item.externalId,
    );

    if (existingId) {
      await this.database.db
        .update(person)
        .set({
          dateOfBirth: item.fields.dateOfBirth,
          dateOfDeath: item.fields.dateOfDeath,
          nationality: item.fields.nationality,
          imageUrl: item.fields.imageUrl,
          notability: item.notability ?? 0,
          // Merged rather than replaced: a second provider contributing one
          // attribute must not erase what the first supplied.
          attributes: sql`${person.attributes} || ${JSON.stringify(item.fields.attributes ?? {})}::jsonb`,
          updatedAt: new Date(),
        })
        .where(eq(person.id, existingId));

      await this.resolution.recordMapping({
        provider: providerKey,
        entityType: 'person',
        externalId: item.externalId,
        entityId: existingId,
        matchMethod: 'deterministic',
        matchConfidence: 1,
      });
      return 'written';
    }

    const match = await this.resolution.findByNameSimilarity(
      'person',
      sportId,
      item.fields.fullName,
    );

    if (match && this.resolution.isAutoAcceptable(match.score)) {
      await this.resolution.recordMapping({
        provider: providerKey,
        entityType: 'person',
        externalId: item.externalId,
        entityId: match.entityId,
        matchMethod: 'probabilistic',
        matchConfidence: match.score,
      });
      return 'written';
    }

    if (match) {
      await this.resolution.queueForReview({
        provider: providerKey,
        entityType: 'person',
        externalId: item.externalId,
        externalName: item.fields.fullName,
        candidateEntityId: match.entityId,
        score: match.score,
        // Date of birth is the strongest corroborating signal for a person, and
        // is what a reviewer will look at first.
        evidence: { comparedOn: 'name', dateOfBirth: item.fields.dateOfBirth },
      });
      return 'queued';
    }

    const [created] = await this.database.db
      .insert(person)
      .values({
        primarySportId: sportId,
        slug: this.slugify(item.fields.fullName),
        fullName: item.fields.fullName,
        displayName: item.fields.displayName,
        dateOfBirth: item.fields.dateOfBirth,
        dateOfDeath: item.fields.dateOfDeath,
        nationality: item.fields.nationality,
        imageUrl: item.fields.imageUrl,
        attributes: item.fields.attributes ?? {},
        notability: item.notability ?? 0,
        confidence: 'provisional',
      })
      // Refreshed rather than skipped. `DO NOTHING` meant a re-run could never
      // correct an existing row, so when `displayName` began being populated and
      // notability began being stored, every person already in the table kept
      // the old blank and the old zero. Only provider-owned fields are touched,
      // and a row a human has curated is left alone.
      .onConflictDoUpdate({
        target: [person.primarySportId, person.slug],
        set: {
          displayName: item.fields.displayName,
          notability: item.notability ?? 0,
          nationality: item.fields.nationality,
          imageUrl: item.fields.imageUrl,
          updatedAt: new Date(),
        },
        setWhere: sql`${person.confidence} <> 'curated'`,
      })
      .returning({ id: person.id });

    if (!created) {
      // Two people with the same normalised name in one sport. Common enough to
      // expect, and never safe to merge automatically.
      await this.resolution.queueForReview({
        provider: providerKey,
        entityType: 'person',
        externalId: item.externalId,
        externalName: item.fields.fullName,
        evidence: {
          reason: 'slug collision',
          slug: this.slugify(item.fields.fullName),
          dateOfBirth: item.fields.dateOfBirth,
        },
      });
      return 'queued';
    }

    await this.resolution.recordMapping({
      provider: providerKey,
      entityType: 'person',
      externalId: item.externalId,
      entityId: created.id,
      matchMethod: 'deterministic',
      matchConfidence: 1,
    });
    return 'written';
  }

  // ---------------------------------------------------------------------------
  // Run bookkeeping
  // ---------------------------------------------------------------------------

  private async startRun(providerKey: string, job: string): Promise<{ id: string }> {
    const [run] = await this.database.db
      .insert(ingestionRun)
      .values({ provider: providerKey as never, job, status: 'running' })
      .returning({ id: ingestionRun.id });

    if (!run) throw new Error('Failed to create ingestion run record');
    return run;
  }

  /** Persists the cursor after each page, which is what makes a run resumable. */
  private async updateRunProgress(
    runId: string,
    summary: IngestionSummary,
    cursor: string | undefined,
  ): Promise<void> {
    await this.database.db
      .update(ingestionRun)
      .set({
        recordsRead: summary.read,
        recordsWritten: summary.written,
        recordsFailed: summary.failed,
        requestsUsed: summary.requestsUsed,
        cursor: cursor ? { offset: cursor } : null,
        updatedAt: new Date(),
      })
      .where(eq(ingestionRun.id, runId));
  }

  private async finishRun(runId: string, summary: IngestionSummary, error?: string): Promise<void> {
    await this.database.db
      .update(ingestionRun)
      .set({
        status: summary.status,
        finishedAt: new Date(),
        recordsRead: summary.read,
        recordsWritten: summary.written,
        recordsFailed: summary.failed,
        requestsUsed: summary.requestsUsed,
        error,
        updatedAt: new Date(),
      })
      .where(eq(ingestionRun.id, runId));
  }

  private async skipped(
    providerKey: string,
    job: string,
    reason: string,
  ): Promise<IngestionSummary> {
    this.logger.log(`Skipping ${job}: ${reason}`);
    const [run] = await this.database.db
      .insert(ingestionRun)
      .values({
        provider: providerKey as never,
        job,
        status: 'skipped',
        finishedAt: new Date(),
        error: reason,
      })
      .returning({ id: ingestionRun.id });

    return {
      runId: run?.id ?? '',
      read: 0,
      written: 0,
      failed: 0,
      queued: 0,
      requestsUsed: 0,
      status: 'skipped',
    };
  }

  private newSummary(runId: string): IngestionSummary {
    return {
      runId,
      read: 0,
      written: 0,
      failed: 0,
      queued: 0,
      requestsUsed: 0,
      status: 'succeeded',
    };
  }

  private async sportIdBySlug(slug: string): Promise<string | null> {
    const [row] = await this.database.db
      .select({ id: sport.id })
      .from(sport)
      .where(eq(sport.slug, slug))
      .limit(1);
    return row?.id ?? null;
  }

  /**
   * Builds a URL segment from a name.
   *
   * Diacritics are folded rather than stripped, so "Atlético" becomes
   * "atletico" and not "atltico". Slugs are public URLs and must stay stable, so
   * this deliberately does nothing clever: any change to it invalidates links
   * and search-engine results.
   */
  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120);
  }
}

/** What one ingestion run did. Returned rather than thrown, so partial success is visible. */
export interface IngestionSummary {
  runId: string;
  read: number;
  written: number;
  /** Sent to the review queue rather than written. Not a failure. */
  queued: number;
  failed: number;
  requestsUsed: number;
  status: 'succeeded' | 'failed' | 'skipped';
}
