import { relations } from 'drizzle-orm';
import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import {
  question,
  questionCategoryEnum,
  questionDifficultyEnum,
  questionGenerationMethodEnum,
} from './question.schema';
import { sport } from './sport.schema';
import { users } from './user.schema';

/**
 * The semi-automated question creation pipeline (Part 11-14): a job requests
 * N candidates from a source; candidates are validated and queued for
 * editorial review; approved candidates become canonical `question` rows.
 * Nothing here is a `question` until `question_candidate.publishedQuestionId`
 * is set — a candidate is a draft under review, never directly queryable by
 * quiz generation.
 */

export const generationJobStatusEnum = pgEnum('generation_job_status', [
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
]);

/** Where the eligible facts driving this job came from. Mirrors the admin UI's "Source Type" picker (Part 15). */
export const generationSourceTypeEnum = pgEnum('generation_source_type', [
  'competition',
  'team',
  'player',
  'structured_dataset',
  'other',
]);

export const questionGenerationJob = pgTable(
  'question_generation_job',
  {
    id: primaryId(),

    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),

    sourceType: generationSourceTypeEnum('source_type').notNull(),
    /** e.g. `competition`, `player` — the canonical table the source, if any, was drawn from. */
    sourceEntityType: text('source_entity_type'),
    /** Not a foreign key: spans several tables depending on `sourceEntityType`. */
    sourceEntityId: uuid('source_entity_id'),

    status: generationJobStatusEnum('status').notNull().default('QUEUED'),

    requestedCount: integer('requested_count').notNull(),
    generatedCount: integer('generated_count').notNull().default(0),
    acceptedCount: integer('accepted_count').notNull().default(0),
    rejectedCount: integer('rejected_count').notNull().default(0),
    duplicateCount: integer('duplicate_count').notNull().default(0),
    validationFailedCount: integer('validation_failed_count').notNull().default(0),

    generationMethod: questionGenerationMethodEnum('generation_method').notNull(),

    /**
     * The admin form's full input (categories, difficulties, season/context,
     * free-text source label) — kept as jsonb rather than columns because
     * this shape is expected to grow with the generation UI and none of it
     * needs to be queried by SQL, only replayed/displayed for one job.
     */
    generationConfig: jsonb('generation_config').notNull().default({}),

    generatorVersion: text('generator_version').notNull(),
    /** Only set when `generationMethod` is AI or HYBRID. */
    generationModel: text('generation_model'),

    createdBy: entityRef('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),

    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),

    /** Failure detail when `status` is FAILED; free-form debugging aid, not shown to non-admins. */
    metadata: jsonb('metadata').notNull().default({}),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    index('question_generation_job_sport_idx').on(table.sportId),
    index('question_generation_job_status_idx').on(table.status),
    index('question_generation_job_created_idx').on(table.createdAt),
  ],
);

export const candidateStatusEnum = pgEnum('question_candidate_status', [
  'GENERATED',
  'VALIDATION_FAILED',
  'DUPLICATE',
  'REVIEW_REQUIRED',
  'APPROVED',
  'REJECTED',
  'PUBLISHED',
]);

/**
 * One proposed question, not yet canonical. `options`/`correctOption` are
 * jsonb rather than rows in `question_option`: a candidate that gets
 * rejected or found duplicate should leave nothing behind in the tables the
 * quiz engine reads from, and a jsonb blob is trivially discardable where a
 * partially-inserted `question_option` set is not.
 */
export const questionCandidate = pgTable(
  'question_candidate',
  {
    id: primaryId(),

    generationJobId: entityRef('generation_job_id')
      .notNull()
      .references(() => questionGenerationJob.id, { onDelete: 'cascade' }),

    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),

    factKey: text('fact_key'),

    sourceEntityType: text('source_entity_type'),
    sourceEntityId: uuid('source_entity_id'),

    questionText: text('question_text').notNull(),

    /** Four `{ optionText, isCorrect, explanation? }` entries — validated shape lives in `packages/contracts`, not enforced by a DB constraint until publish promotes it to `question_option` rows. */
    options: jsonb('options').notNull(),

    explanation: text('explanation'),

    suggestedCategory: questionCategoryEnum('suggested_category').notNull(),
    suggestedDifficulty: questionDifficultyEnum('suggested_difficulty').notNull(),

    /** `{ sourceName, sourceUrl, sourceEntityType, sourceEntityId }` — kept alongside the discrete source columns above so a template/AI generator can attach more than one reference without a schema change. */
    sourceReferences: jsonb('source_references').notNull().default([]),

    generationMethod: questionGenerationMethodEnum('generation_method').notNull(),
    generatorVersion: text('generator_version').notNull(),
    generationModel: text('generation_model'),

    /** Worst severity `QuestionValidationService` returned for this candidate, cached so the review queue can filter/sort without re-running validation per row. */
    validationStatus: text('validation_status').notNull().default('PASS'),
    /** Full validation check list, for the reviewer's "Duplicate check" panel (Part 17). */
    validationResult: jsonb('validation_result').notNull().default({}),

    duplicateQuestionId: uuid('duplicate_question_id').references(() => question.id, {
      onDelete: 'set null',
    }),
    duplicateConfidence: integer('duplicate_confidence'),

    status: candidateStatusEnum('status').notNull().default('GENERATED'),

    reviewedBy: entityRef('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),

    /**
     * Set when reviewer chose "Keep as Intentional Variant" over a fact
     * duplicate (Part 17) — required justification text, distinct from
     * `rejectionReason`. Copied onto `question.questionVariant` at publish.
     */
    variantJustification: text('variant_justification'),

    publishedQuestionId: uuid('published_question_id').references(() => question.id, {
      onDelete: 'set null',
    }),

    createdAt: timestamps.createdAt,
  },
  (table) => [
    index('question_candidate_job_idx').on(table.generationJobId),
    index('question_candidate_status_idx').on(table.status),
    index('question_candidate_fact_key_idx').on(table.factKey),
  ],
);

export const questionGenerationJobRelations = relations(questionGenerationJob, ({ one, many }) => ({
  sport: one(sport, { fields: [questionGenerationJob.sportId], references: [sport.id] }),
  createdByUser: one(users, { fields: [questionGenerationJob.createdBy], references: [users.id] }),
  candidates: many(questionCandidate),
}));

export const questionCandidateRelations = relations(questionCandidate, ({ one }) => ({
  job: one(questionGenerationJob, {
    fields: [questionCandidate.generationJobId],
    references: [questionGenerationJob.id],
  }),
  sport: one(sport, { fields: [questionCandidate.sportId], references: [sport.id] }),
  duplicateQuestion: one(question, {
    fields: [questionCandidate.duplicateQuestionId],
    references: [question.id],
  }),
  publishedQuestion: one(question, {
    fields: [questionCandidate.publishedQuestionId],
    references: [question.id],
  }),
  reviewedByUser: one(users, { fields: [questionCandidate.reviewedBy], references: [users.id] }),
}));
