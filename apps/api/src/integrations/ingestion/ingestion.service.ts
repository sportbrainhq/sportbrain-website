import { Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { ingestionRun, person, sport, team } from '../../database/schema';
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
    options: { maxPages?: number } = {},
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

    const run = await this.startRun(provider.key, `teams:${sportSlug}`);
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
        const result = await provider.fetchTeams(sportSlug, cursor);
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
        confidence: 'provisional',
      })
      .onConflictDoNothing({ target: [person.primarySportId, person.slug] })
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
