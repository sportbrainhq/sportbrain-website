import { z } from 'zod';

/**
 * The canonical Question Bank — Phase C1.
 *
 * A quiz does not own questions. Questions live here, once, and quiz sessions
 * (sport quiz, master quiz, and whatever quiz types arrive later) select
 * references to them. Nothing in this file describes a quiz; it describes the
 * content a quiz is built from.
 *
 * Phase C1 scope only: the question bank and its validation contract. Quiz
 * generation, attempts, exposure tracking and the generation pipeline are
 * later phases and deliberately do not appear here yet.
 */

export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);
export type QuestionDifficulty = z.infer<typeof questionDifficultySchema>;

/**
 * Phase C1 supports SINGLE_CHOICE only. The enum carries the later types so
 * the column and every switch over it are written once, not migrated when
 * MULTIPLE_CHOICE/TRUE_FALSE/IMAGE/ORDERING arrive — those values are simply
 * unreachable until a later phase's generation and rendering code accepts
 * them.
 */
export const questionTypeSchema = z.enum([
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE',
  'TRUE_FALSE',
  'IMAGE',
  'ORDERING',
]);
export type QuestionType = z.infer<typeof questionTypeSchema>;

/**
 * DRAFT -> REVIEW_REQUIRED -> VERIFIED -> PUBLISHED -> RETIRED, with REJECTED
 * as a terminal off-ramp from any pre-published state. Quiz generation may
 * only select PUBLISHED. RETIRED questions are never deleted: historical quiz
 * attempts reference them by snapshot and must keep resolving.
 */
export const questionStatusSchema = z.enum([
  'DRAFT',
  'REVIEW_REQUIRED',
  'VERIFIED',
  'PUBLISHED',
  'RETIRED',
  'REJECTED',
]);
export type QuestionStatus = z.infer<typeof questionStatusSchema>;

/**
 * How trustworthy the fact behind the question is believed to be, separate
 * from editorial `status`. A question can be PUBLISHED and still only
 * `unverified` if it was hand-written quickly; `verified` is the bar
 * automated generation should be reaching for before publish.
 */
export const questionVerificationStatusSchema = z.enum(['unverified', 'verified', 'disputed']);
export type QuestionVerificationStatus = z.infer<typeof questionVerificationStatusSchema>;

/**
 * How the question came to exist. MANUAL is an editor typing it in;
 * TEMPLATE/AI/HYBRID are the three Part 12 generation methods, present here
 * ahead of the generation pipeline itself so provenance has a home from the
 * first row.
 */
export const questionGenerationMethodSchema = z.enum(['MANUAL', 'TEMPLATE', 'AI', 'HYBRID']);
export type QuestionGenerationMethod = z.infer<typeof questionGenerationMethodSchema>;

/**
 * Controlled taxonomy, per sport. Free-text tags are deliberately not the
 * primary classification: a fixed enum per sport is what lets the admin
 * inventory report ("Football / World Cup: 300 questions") and quiz
 * generation's category weighting exist without guessing at tag spelling.
 *
 * One flat enum spanning every sport's categories, rather than nine separate
 * enums, because a question's valid category set is `sport + category`
 * together and application code already has the sport; a single enum keeps
 * the schema/migration surface to one column and one type. Application-level
 * validation (`QuestionValidationService`) is responsible for rejecting a
 * category that doesn't belong to the question's sport (see
 * `CATEGORY_BY_SPORT` below).
 */
export const questionCategorySchema = z.enum([
  // Football
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
  // Cricket (adds)
  'TEST_CRICKET',
  'ODI',
  'T20',
  'IPL',
  'TEAMS',
  // Basketball (adds)
  'NBA',
  'CHAMPIONSHIPS',
  // Tennis (adds)
  'GRAND_SLAMS',
  'ATP',
  'WTA',
  'SURFACES',
  // Formula 1 (adds)
  'DRIVERS',
  'CIRCUITS',
]);
export type QuestionCategory = z.infer<typeof questionCategorySchema>;

/**
 * Which categories are valid for which sport slug. Consulted by
 * `QuestionValidationService`'s schema validator so "Formula 1 / IPL" is
 * rejected at creation rather than discovered in the admin table later.
 * Extend this map, not the shape of `Question`, when taxonomy grows — Part 5
 * asks for exactly that: "allow taxonomy expansion later without changing
 * Question architecture."
 */
export const CATEGORY_BY_SPORT: Record<string, QuestionCategory[]> = {
  football: [
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
  ],
  cricket: [
    'RULES',
    'HISTORY',
    'WORLD_CUP',
    'TEST_CRICKET',
    'ODI',
    'T20',
    'IPL',
    'INTERNATIONAL',
    'PLAYERS',
    'TEAMS',
    'RECORDS',
  ],
  basketball: [
    'RULES',
    'HISTORY',
    'NBA',
    'INTERNATIONAL',
    'PLAYERS',
    'TEAMS',
    'CHAMPIONSHIPS',
    'RECORDS',
  ],
  tennis: ['RULES', 'HISTORY', 'GRAND_SLAMS', 'ATP', 'WTA', 'PLAYERS', 'SURFACES', 'RECORDS'],
  'formula-1': ['RULES', 'HISTORY', 'DRIVERS', 'TEAMS', 'CIRCUITS', 'CHAMPIONSHIPS', 'RECORDS'],
  // Golf, American Football, MMA, Boxing share the general-purpose set until
  // a sport needs its own; RULES/HISTORY/PLAYERS/TEAMS/RECORDS/INTERNATIONAL
  // cover a launch-quality question bank for any sport not listed above.
};

/** One of the four options rendered under a SINGLE_CHOICE question. */
export const questionOptionSchema = z.object({
  id: z.string(),
  optionCode: z.enum(['A', 'B', 'C', 'D']),
  optionText: z.string(),
  displayOrder: z.number().int().min(0).max(3),
  /** Never present unless the caller is an editor/admin viewing the answer key. */
  isCorrect: z.boolean().optional(),
  explanation: z.string().nullable().optional(),
});
export type QuestionOptionDto = z.infer<typeof questionOptionSchema>;

/** What a quiz-taking surface receives: never `isCorrect`, never the answer key. */
export const publicQuestionSchema = z.object({
  id: z.string(),
  questionCode: z.string(),
  questionText: z.string(),
  sportId: z.string(),
  category: questionCategorySchema,
  difficulty: questionDifficultySchema,
  questionType: questionTypeSchema,
  options: z.array(questionOptionSchema.omit({ isCorrect: true, explanation: true })),
});
export type PublicQuestion = z.infer<typeof publicQuestionSchema>;

/** What the admin question bank and editor review surfaces receive: the full row, answer key included. */
export const adminQuestionSchema = z.object({
  id: z.string(),
  questionCode: z.string(),
  questionText: z.string(),
  normalizedQuestionText: z.string(),
  questionFingerprint: z.string(),
  factKey: z.string().nullable(),
  questionVariant: z.string().nullable(),
  sportId: z.string(),
  category: questionCategorySchema,
  difficulty: questionDifficultySchema,
  questionType: questionTypeSchema,
  status: questionStatusSchema,
  explanation: z.string().nullable(),
  sourceName: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  sourceEntityType: z.string().nullable(),
  sourceEntityId: z.string().nullable(),
  validFrom: z.string().nullable(),
  validUntil: z.string().nullable(),
  verificationStatus: questionVerificationStatusSchema,
  lastVerifiedAt: z.string().nullable(),
  generationMethod: questionGenerationMethodSchema,
  generationJobId: z.string().nullable(),
  generatorVersion: z.string().nullable(),
  generationModel: z.string().nullable(),
  createdBy: z.string().nullable(),
  reviewedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  publishedAt: z.string().nullable(),
  retiredAt: z.string().nullable(),
  options: z.array(questionOptionSchema),
});
export type AdminQuestion = z.infer<typeof adminQuestionSchema>;

/**
 * Input to both manual creation (Part 21) and, later, a validated candidate's
 * publish step (Part 14) — the same shape either way, because "run the same
 * validation pipeline" (Part 21) only holds if both paths build the same
 * request.
 */
export const createQuestionRequestSchema = z
  .object({
    sportId: z.string().uuid(),
    category: questionCategorySchema,
    difficulty: questionDifficultySchema,
    questionType: questionTypeSchema.default('SINGLE_CHOICE'),
    questionText: z.string().trim().min(10).max(500),
    options: z
      .array(
        z.object({
          optionText: z.string().trim().min(1).max(200),
          isCorrect: z.boolean(),
          explanation: z.string().trim().max(500).nullable().optional(),
        }),
      )
      .length(4, 'Exactly four options are required'),
    explanation: z.string().trim().min(1).max(1_000),
    sourceName: z.string().trim().max(200).nullable().optional(),
    sourceUrl: z.string().trim().url().max(2_000).nullable().optional(),
    sourceEntityType: z.string().trim().max(100).nullable().optional(),
    sourceEntityId: z.string().uuid().nullable().optional(),
    factKey: z.string().trim().max(200).nullable().optional(),
    validFrom: z.string().datetime().nullable().optional(),
    validUntil: z.string().datetime().nullable().optional(),
  })
  .strict();
export type CreateQuestionRequest = z.infer<typeof createQuestionRequestSchema>;

export const updateQuestionRequestSchema = createQuestionRequestSchema.partial();
export type UpdateQuestionRequest = z.infer<typeof updateQuestionRequestSchema>;

/**
 * One validator's finding. `PASS` never blocks; `WARN` blocks publish only
 * when the caller asks for strict mode (manual creation does, generation
 * candidates don't — Part 18 lets warnings proceed to editorial review);
 * `FAIL` always blocks creation/publish outright.
 */
export const validationSeveritySchema = z.enum(['PASS', 'WARN', 'FAIL']);
export type ValidationSeverity = z.infer<typeof validationSeveritySchema>;

export const validationCheckSchema = z.object({
  validator: z.string(),
  severity: validationSeveritySchema,
  message: z.string(),
});
export type ValidationCheck = z.infer<typeof validationCheckSchema>;

/**
 * `duplicateOf`/`duplicateConfidence` are populated by the fact-duplicate
 * check (Part 7.2) so a reviewer sees the candidate match without the caller
 * having to make a second request. `NO_DUPLICATE` is the only outcome that
 * treats `factKey` as if it were new.
 */
export const duplicateCheckOutcomeSchema = z.enum([
  'EXACT_DUPLICATE',
  'SEMANTIC_DUPLICATE',
  'POTENTIAL_VARIANT',
  'NO_DUPLICATE',
]);
export type DuplicateCheckOutcome = z.infer<typeof duplicateCheckOutcomeSchema>;

export const questionValidationResultSchema = z.object({
  severity: validationSeveritySchema,
  checks: z.array(validationCheckSchema),
  duplicate: z.object({
    outcome: duplicateCheckOutcomeSchema,
    duplicateQuestionId: z.string().nullable(),
    duplicateQuestionCode: z.string().nullable(),
    confidence: z.number().min(0).max(1).nullable(),
  }),
});
export type QuestionValidationResult = z.infer<typeof questionValidationResultSchema>;

export const checkDuplicateRequestSchema = z.object({
  sportId: z.string().uuid(),
  questionText: z.string().trim().min(1),
  factKey: z.string().trim().nullable().optional(),
  /** Excludes a question from matching itself when re-validating on edit. */
  excludeQuestionId: z.string().uuid().optional(),
});
export type CheckDuplicateRequest = z.infer<typeof checkDuplicateRequestSchema>;
