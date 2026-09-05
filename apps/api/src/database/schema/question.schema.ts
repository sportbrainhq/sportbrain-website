import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { sport } from './sport.schema';
import { users } from './user.schema';

/**
 * The canonical Question Bank.
 *
 * A quiz does not own questions: it selects references to rows in this table.
 * The exact same question can be eligible for a sport quiz, the Master Quiz,
 * and any future quiz type (daily quiz, player quiz) without being copied —
 * duplicating a question per quiz type is exactly the design this table
 * exists to prevent. `QuizGenerationService` (a later phase) is the only
 * thing that turns rows here into a quiz; this file has no notion of "quiz"
 * at all.
 *
 * Phase C1 builds this table, its options, and the validation pipeline that
 * guards writes to it. Generation jobs/candidates, quiz attempts, exposure
 * tracking and admin UI are later phases.
 */

export const questionDifficultyEnum = pgEnum('question_difficulty', [
  'EASY',
  'MEDIUM',
  'HARD',
  'EXPERT',
]);

/**
 * SINGLE_CHOICE is the only type Phase C generates or serves. The remaining
 * values exist so the column, this enum, and every switch over `questionType`
 * are written once — adding MULTIPLE_CHOICE later is a new `case`, not a
 * migration.
 */
export const questionTypeEnum = pgEnum('question_type', [
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'IMAGE',
  'ORDERING',
]);

/**
 * DRAFT -> REVIEW_REQUIRED -> VERIFIED -> PUBLISHED -> RETIRED, with REJECTED
 * reachable from any pre-published state. Quiz generation may only select
 * PUBLISHED (enforced in the generation service, not here — this column just
 * carries the state). RETIRED is not deletion: a historical `QuizAttempt`
 * still points at the row, and its `QuizAttemptQuestion` snapshot is what
 * keeps the historical result stable regardless of what happens to this row
 * afterwards.
 */
export const questionStatusEnum = pgEnum('question_status', [
  'DRAFT',
  'REVIEW_REQUIRED',
  'VERIFIED',
  'PUBLISHED',
  'RETIRED',
  'REJECTED',
]);

/**
 * Trust in the underlying fact, orthogonal to editorial `status` for the same
 * reason `confidenceEnum` is orthogonal to `publicationStatusEnum` elsewhere
 * in this schema: a question can be published and still only `unverified`
 * pending a second editorial pass.
 */
export const questionVerificationStatusEnum = pgEnum('question_verification_status', [
  'unverified',
  'verified',
  'disputed',
]);

/**
 * MANUAL is an editor typing a question in directly. TEMPLATE/AI/HYBRID are
 * the three generation methods the semi-automated pipeline (a later phase)
 * produces. Present from the first row so provenance never has to be
 * backfilled once generation ships.
 */
export const questionGenerationMethodEnum = pgEnum('question_generation_method', [
  'MANUAL',
  'TEMPLATE',
  'AI',
  'HYBRID',
]);

/**
 * Controlled taxonomy, one enum spanning every sport's categories (mirrors
 * `packages/contracts/src/question.ts`'s `questionCategorySchema` — the two
 * must be kept in sync by hand, since Postgres enums and Zod enums cannot
 * share a source of truth across a migration boundary). Which subset is valid
 * for which sport is an application-level concern
 * (`CATEGORY_BY_SPORT` in contracts), not a database constraint: a sport's
 * category set is expected to grow, and a check constraint here would turn
 * every taxonomy addition into a migration touching this table.
 */
export const questionCategoryEnum = pgEnum('question_category', [
  'RULES',
  'HISTORY',
  'WORLD_CUP',
  'EUROS',
  'CHAMPIONS_LEAGUE',
  'PREMIER_LEAGUE',
  'LA_LIGA',
  'INTERNATIONAL',
  'CLUBS',
  'PLAYERS',
  'RECORDS',
  'TACTICS',
  'TEST_CRICKET',
  'ODI',
  'T20',
  'IPL',
  'TEAMS',
  'NBA',
  'CHAMPIONSHIPS',
  'GRAND_SLAMS',
  'ATP',
  'WTA',
  'SURFACES',
  'DRIVERS',
  'CIRCUITS',
]);

export const question = pgTable(
  'question',
  {
    id: primaryId(),

    /**
     * Human-readable identifier (`SBQ-FB-000001`), assigned once at creation
     * by `QuestionCodeService` (per-sport counter). Exists because the admin
     * UI, reports, and support conversations need something a person can read
     * out loud and search for — nobody debugging a reported question wants to
     * paste a UUID. Never regenerated; immutable once assigned, like
     * `sport.slug`.
     */
    questionCode: text('question_code').notNull(),

    sportId: entityRef('sport_id')
      .notNull()
      .references(() => sport.id),
    category: questionCategoryEnum('category').notNull(),
    difficulty: questionDifficultyEnum('difficulty').notNull(),
    questionType: questionTypeEnum('question_type').notNull().default('SINGLE_CHOICE'),
    status: questionStatusEnum('status').notNull().default('DRAFT'),

    questionText: text('question_text').notNull(),

    /**
     * Lowercased/trimmed/whitespace-collapsed form of `questionText`, used
     * only to compute `questionFingerprint` and to power a
     * duplicate-adjacent search. Recomputed on every text edit; never hand
     * edited.
     */
    normalizedQuestionText: text('normalized_question_text').notNull(),

    /**
     * SHA-256(sportId + normalizedQuestionText), the exact-duplicate guard
     * from Part 7.1. A unique index on this column is the actual enforcement
     * mechanism — `QuestionValidationService` checks it pre-insert so it can
     * return a friendly error, but the constraint is what makes the guarantee
     * true under concurrent writes.
     */
    questionFingerprint: text('question_fingerprint').notNull(),

    /**
     * Groups differently-worded questions that test the same underlying
     * fact — `football:fifa-world-cup:2022:winner` — so two questions can
     * disagree in wording and still be caught as semantic duplicates (Part
     * 6, Part 7.2). Nullable: not every question is generated from a
     * structured fact with a natural key, and forcing one would mean
     * inventing meaningless keys for hand-written trivia.
     */
    factKey: text('fact_key'),

    /**
     * Set when a question sharing `factKey` with another PUBLISHED question
     * was deliberately kept as a distinct question rather than merged or
     * rejected (Part 17: "Keep as Intentional Variant"). Carries the
     * reviewer's justification; existence of a non-null value here is what
     * the fact-duplicate validator treats as "already reviewed, do not flag
     * again."
     */
    questionVariant: text('question_variant'),

    explanation: text('explanation'),

    sourceName: text('source_name'),
    sourceUrl: text('source_url'),
    /** e.g. `competition`, `player`, `team` — the kind of canonical entity the fact came from. */
    sourceEntityType: text('source_entity_type'),
    /** Not a foreign key: source entities span several tables (player, team, competition, season), and this column does not know which. */
    sourceEntityId: uuid('source_entity_id'),

    /**
     * Time-bounds a fact whose truth changes ("current world number one").
     * Both null means the fact is treated as permanently valid.
     * `QuizGenerationService` must exclude a question outside
     * `[validFrom, validUntil]` at generation time; a historical attempt's
     * snapshot is unaffected either way (Part 9, Part 10).
     */
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),

    verificationStatus: questionVerificationStatusEnum('verification_status')
      .notNull()
      .default('unverified'),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),

    generationMethod: questionGenerationMethodEnum('generation_method').notNull().default('MANUAL'),
    /** Set once the generation pipeline (later phase) exists; not a foreign key yet in Phase C1. */
    generationJobId: uuid('generation_job_id'),
    /** e.g. `QUIZ_GEN_V1` — which generator logic produced this row, for provenance audits (Part 19). */
    generatorVersion: text('generator_version'),
    /** LLM identifier, only set when `generationMethod` is `AI` or `HYBRID`. */
    generationModel: text('generation_model'),

    createdBy: entityRef('created_by').references(() => users.id, { onDelete: 'set null' }),
    reviewedBy: entityRef('reviewed_by').references(() => users.id, { onDelete: 'set null' }),

    publishedAt: timestamp('published_at', { withTimezone: true }),
    retiredAt: timestamp('retired_at', { withTimezone: true }),

    /**
     * Whether unusually high report volume has flagged this question for a
     * second look (Part 46). A signal for admins, never an automatic
     * unpublish/delete — a hard-question false-positive is exactly as likely
     * as a genuinely bad question.
     */
    flaggedForReview: boolean('flagged_for_review').notNull().default(false),

    /** Analytics counters (Part 45). Updated by the quiz-answer path once it exists; all zero until then. */
    timesServed: integer('times_served').notNull().default(0),
    timesAnswered: integer('times_answered').notNull().default(0),
    timesCorrect: integer('times_correct').notNull().default(0),
    reportCount: integer('report_count').notNull().default(0),

    /** Escape hatch for fields that don't yet deserve a column — e.g. generation-config echoes useful for debugging one candidate. */
    metadata: jsonb('metadata').notNull().default({}),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('question_code_idx').on(table.questionCode),
    /** The Part 7.1 exact-duplicate guarantee. */
    uniqueIndex('question_fingerprint_idx').on(table.questionFingerprint),
    index('question_sport_idx').on(table.sportId),
    index('question_status_idx').on(table.status),
    index('question_category_idx').on(table.category),
    index('question_difficulty_idx').on(table.difficulty),
    index('question_fact_key_idx').on(table.factKey),
    /** QuizGenerationService's core selection query: eligible = published + sport + valid. */
    index('question_generation_lookup_idx').on(table.sportId, table.status, table.category),
  ],
);

/**
 * The four answer choices for a question. Phase C1 enforces exactly four,
 * exactly one correct, at the service layer
 * (`QuestionValidationService`/`QuestionsRepository`, transactional) rather
 * than with a database trigger — the same "application decides, database
 * stores" split the rest of this schema uses for anything more elaborate than
 * a uniqueness constraint.
 */
export const questionOption = pgTable(
  'question_option',
  {
    id: primaryId(),
    questionId: entityRef('question_id')
      .notNull()
      .references(() => question.id, { onDelete: 'cascade' }),

    /** A/B/C/D — stable regardless of `displayOrder`, so an edit can reorder options without renaming them. */
    optionCode: text('option_code').notNull(),
    optionText: text('option_text').notNull(),

    isCorrect: boolean('is_correct').notNull().default(false),
    displayOrder: integer('display_order').notNull(),

    explanation: text('explanation'),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('question_option_question_code_idx').on(table.questionId, table.optionCode),
    index('question_option_question_idx').on(table.questionId),
    /**
     * Enforces "exactly one correct option" at the database level for the
     * TRUE case: a second partial unique index cannot express "at least one",
     * so the service layer's transactional check still owns that half, but a
     * concurrent second `UPDATE ... SET is_correct = true` on the same
     * question is rejected outright rather than racing the service check.
     */
    uniqueIndex('question_option_single_correct_idx')
      .on(table.questionId)
      .where(sql`${table.isCorrect} = true`),
  ],
);

export const questionRelations = relations(question, ({ one, many }) => ({
  sport: one(sport, { fields: [question.sportId], references: [sport.id] }),
  options: many(questionOption),
  createdByUser: one(users, { fields: [question.createdBy], references: [users.id] }),
  reviewedByUser: one(users, { fields: [question.reviewedBy], references: [users.id] }),
}));

export const questionOptionRelations = relations(questionOption, ({ one }) => ({
  question: one(question, { fields: [questionOption.questionId], references: [question.id] }),
}));
