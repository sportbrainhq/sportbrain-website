import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';

/**
 * Provider identity mapping and ingestion bookkeeping.
 *
 * This is the layer that makes replacing a provider a contained piece of work.
 * It matters more here than in a typical integration, because the cheapest
 * viable provider grants no publication licence and reserves the right to
 * terminate access without refund following a rights-holder complaint. A
 * replacement is more likely than a normal vendor swap and may need to happen
 * quickly.
 *
 * The rule the rest of the schema depends on: **no provider identifier appears
 * in any canonical table.** They exist only here.
 */

/**
 * Sources we ingest from.
 *
 * An enum rather than free text so that adding a source is a deliberate,
 * reviewed change, and so that a typo cannot silently create a fifth "provider"
 * that no adapter serves.
 */
export const providerEnum = pgEnum('provider', [
  'wikidata',
  'wikipedia',
  'api_sports',
  'thesportsdb',
  'cricapi',
  'jolpica_f1',
  'football_data',
  'manual',
]);

/** Which canonical table a mapping points at. */
export const mappedEntityEnum = pgEnum('mapped_entity', [
  'sport',
  'person',
  'team',
  'competition',
  'season',
  'venue',
  'event',
]);

/**
 * One provider's identifier for one of our entities.
 *
 * A single entity may have several rows here, one per provider, which is exactly
 * what allows a second source to enrich an entity the first source created, and
 * what allows a provider to be dropped without touching the entity itself.
 */
export const externalMapping = pgTable(
  'external_mapping',
  {
    id: primaryId(),
    provider: providerEnum('provider').notNull(),
    entityType: mappedEntityEnum('entity_type').notNull(),

    /**
     * The provider's own identifier, as text.
     *
     * Text rather than integer because providers disagree: API-Sports uses
     * numeric ids, Wikidata uses `Q7156`. Normalising to text costs nothing and
     * avoids a per-provider column.
     */
    externalId: text('external_id').notNull(),

    /** The canonical entity this refers to. Untyped by necessity: it targets seven different tables. */
    entityId: entityRef('entity_id').notNull(),

    /**
     * How this mapping was established: `deterministic`, `probabilistic`,
     * `manual`.
     *
     * Recorded because a probabilistic match is a hypothesis, and when a merge
     * later proves wrong this is the column that says which mappings to
     * re-examine.
     */
    matchMethod: text('match_method').notNull().default('deterministic'),

    /** 0 to 1 for probabilistic matches; 1 for deterministic and manual ones. */
    matchConfidence: numeric('match_confidence', { precision: 4, scale: 3 }),

    /** When this entity was last successfully refreshed from this provider. */
    lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    /** One provider cannot map the same external id to two entities. */
    uniqueIndex('external_mapping_unique_idx').on(
      table.provider,
      table.entityType,
      table.externalId,
    ),
    /** The hot path: "given this entity, what is its id at provider X". */
    index('external_mapping_entity_idx').on(table.entityType, table.entityId),
    index('external_mapping_sync_idx').on(table.provider, table.lastSyncedAt),
  ],
);

/**
 * Candidate matches that scored below the auto-accept threshold.
 *
 * Deliberately a queue rather than a guess. An incorrect merge is far more
 * damaging than an unresolved duplicate: it silently corrupts statistics for two
 * entities at once and is difficult to detect afterwards. Anything the resolver
 * is unsure about lands here and waits for a human.
 */
export const resolutionCandidate = pgTable(
  'resolution_candidate',
  {
    id: primaryId(),
    provider: providerEnum('provider').notNull(),
    entityType: mappedEntityEnum('entity_type').notNull(),
    externalId: text('external_id').notNull(),

    /** What the provider called it, kept so a reviewer can judge without re-fetching. */
    externalName: text('external_name').notNull(),

    /** The entity we think it might be. Null when nothing plausible was found. */
    candidateEntityId: entityRef('candidate_entity_id'),

    score: numeric('score', { precision: 4, scale: 3 }),

    /** What the matcher compared: names, dates, nationality. Explains the score to a reviewer. */
    evidence: jsonb('evidence').notNull().default({}),

    /** `pending`, `accepted`, `rejected`. */
    status: text('status').notNull().default('pending'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('resolution_candidate_unique_idx').on(
      table.provider,
      table.entityType,
      table.externalId,
    ),
    index('resolution_candidate_status_idx').on(table.status, table.score),
  ],
);

/**
 * Entities merged into another, retained rather than deleted.
 *
 * Two reasons deletion is wrong here. Merges are occasionally incorrect and need
 * reversing, which is impossible if the operation destroyed the evidence. And
 * the old identifier may already be a public URL, so it must keep resolving
 * rather than 404 for a search engine that has indexed it.
 */
export const entityMerge = pgTable(
  'entity_merge',
  {
    id: primaryId(),
    entityType: mappedEntityEnum('entity_type').notNull(),

    /** The id that no longer exists as a distinct entity. */
    sourceEntityId: entityRef('source_entity_id').notNull(),

    /** The surviving entity. */
    targetEntityId: entityRef('target_entity_id').notNull(),

    reason: text('reason'),
    mergedBy: text('merged_by'),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('entity_merge_source_idx').on(table.entityType, table.sourceEntityId),
    index('entity_merge_target_idx').on(table.entityType, table.targetEntityId),
  ],
);

/**
 * A record of every ingestion run.
 *
 * Retained permanently, unlike raw provider payloads. This preserves the audit
 * trail (what ran, when, against which provider, what changed) without
 * preserving licensed content, which is what most of the auditing requirement
 * actually needs.
 */
export const ingestionRun = pgTable(
  'ingestion_run',
  {
    id: primaryId(),
    provider: providerEnum('provider').notNull(),

    /** The job that ran: `wikidata-teams`, `api-sports-fixtures`. */
    job: text('job').notNull(),

    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp('finished_at', { withTimezone: true }),

    /** `running`, `succeeded`, `failed`, `skipped`. */
    status: text('status').notNull().default('running'),

    recordsRead: integer('records_read').notNull().default(0),
    recordsWritten: integer('records_written').notNull().default(0),
    recordsFailed: integer('records_failed').notNull().default(0),

    /** Provider requests consumed, so daily quota can be reconciled against reality. */
    requestsUsed: integer('requests_used').notNull().default(0),

    /**
     * Where a resumable job got to.
     *
     * Historical backfill runs for weeks beneath the daily quota, so it must be
     * able to stop and resume rather than restart.
     */
    cursor: jsonb('cursor'),

    error: text('error'),
    ...timestamps,
  },
  (table) => [
    index('ingestion_run_job_idx').on(table.job, table.startedAt),
    index('ingestion_run_status_idx').on(table.status),
  ],
);

/**
 * Raw provider payloads, retained briefly.
 *
 * Kept because reprocessing after a normalisation bug, and replaying history
 * when a provider is replaced, both need the original bytes. Expired
 * deliberately because no provider researched grants explicit permanent
 * retention rights, and indefinite storage of licensed payloads is exposure
 * bought for very little benefit: the reprocessing value is concentrated in the
 * recent past.
 *
 * In Postgres rather than object storage because the volume is small at this
 * scale and one datastore is worth more than the marginal saving. Revisit if
 * retained volume passes a few gigabytes.
 */
export const rawPayload = pgTable(
  'raw_payload',
  {
    id: primaryId(),
    provider: providerEnum('provider').notNull(),
    endpoint: text('endpoint').notNull(),

    /** Hash of the request, so an unchanged response is not stored twice. */
    requestHash: text('request_hash').notNull(),

    payload: jsonb('payload').notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull().defaultNow(),

    /** Hard deletion date. Enforced by a scheduled job, not left to judgement. */
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('raw_payload_request_idx').on(table.provider, table.requestHash),
    index('raw_payload_expiry_idx').on(table.expiresAt),
  ],
);
