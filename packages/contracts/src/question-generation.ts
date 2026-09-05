import { z } from 'zod';
import {
  questionCategorySchema,
  questionDifficultySchema,
  questionGenerationMethodSchema,
  validationSeveritySchema,
} from './question';

/**
 * The semi-automated question creation pipeline (Part 11-17): a job requests
 * candidates from a source, candidates are validated, and an editor reviews
 * each one into the canonical Question Bank. This file is the contract for
 * that pipeline only — the Question Bank itself lives in `question.ts`.
 */

export const generationJobStatusSchema = z.enum([
  'QUEUED',
  'RUNNING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
]);
export type GenerationJobStatus = z.infer<typeof generationJobStatusSchema>;

export const generationSourceTypeSchema = z.enum([
  'competition',
  'team',
  'player',
  'structured_dataset',
  'other',
]);
export type GenerationSourceType = z.infer<typeof generationSourceTypeSchema>;

export const candidateStatusSchema = z.enum([
  'GENERATED',
  'VALIDATION_FAILED',
  'DUPLICATE',
  'REVIEW_REQUIRED',
  'APPROVED',
  'REJECTED',
  'PUBLISHED',
]);
export type CandidateStatus = z.infer<typeof candidateStatusSchema>;

/** The admin "Generate Questions" form (Part 15). */
export const createGenerationJobRequestSchema = z.object({
  sportId: z.string().uuid(),
  sourceType: generationSourceTypeSchema,
  sourceEntityType: z.string().trim().max(100).nullable().optional(),
  sourceEntityId: z.string().uuid().nullable().optional(),
  /** Free-text label shown on the job ("FIFA World Cup"); not necessarily the same as the resolved source entity's name. */
  sourceLabel: z.string().trim().max(200).optional(),
  /** e.g. "2022" — echoed into `generationConfig`, used by TEMPLATE generation to scope which facts are eligible. */
  seasonContext: z.string().trim().max(100).optional(),
  generationMethod: questionGenerationMethodSchema.exclude(['MANUAL']),
  categories: z.array(questionCategorySchema).min(1),
  difficulties: z.array(questionDifficultySchema).min(1),
  requestedCount: z.number().int().min(1).max(500),
});
export type CreateGenerationJobRequest = z.infer<typeof createGenerationJobRequestSchema>;

export const generationJobSchema = z.object({
  id: z.string(),
  sportId: z.string(),
  sourceType: generationSourceTypeSchema,
  sourceEntityType: z.string().nullable(),
  sourceEntityId: z.string().nullable(),
  status: generationJobStatusSchema,
  requestedCount: z.number().int(),
  generatedCount: z.number().int(),
  acceptedCount: z.number().int(),
  rejectedCount: z.number().int(),
  duplicateCount: z.number().int(),
  validationFailedCount: z.number().int(),
  generationMethod: questionGenerationMethodSchema,
  generationConfig: z.record(z.string(), z.unknown()),
  generatorVersion: z.string(),
  generationModel: z.string().nullable(),
  createdBy: z.string(),
  createdAt: z.string(),
  startedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
});
export type GenerationJob = z.infer<typeof generationJobSchema>;

/** One source reference a candidate carries forward for the reviewer's "Source" panel (Part 17). */
export const candidateSourceReferenceSchema = z.object({
  label: z.string(),
  sourceEntityType: z.string().nullable().optional(),
  sourceEntityId: z.string().nullable().optional(),
});
export type CandidateSourceReference = z.infer<typeof candidateSourceReferenceSchema>;

/** A candidate's proposed options — the same shape as `questionOptionSchema` minus the fields only a persisted option has (`id`, `displayOrder` is implicit in array order). */
export const candidateOptionSchema = z.object({
  optionText: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().nullable().optional(),
});
export type CandidateOption = z.infer<typeof candidateOptionSchema>;

export const questionCandidateSchema = z.object({
  id: z.string(),
  generationJobId: z.string(),
  sportId: z.string(),
  factKey: z.string().nullable(),
  sourceEntityType: z.string().nullable(),
  sourceEntityId: z.string().nullable(),
  questionText: z.string(),
  options: z.array(candidateOptionSchema),
  explanation: z.string().nullable(),
  suggestedCategory: questionCategorySchema,
  suggestedDifficulty: questionDifficultySchema,
  sourceReferences: z.array(candidateSourceReferenceSchema),
  generationMethod: questionGenerationMethodSchema,
  generatorVersion: z.string(),
  generationModel: z.string().nullable(),
  validationStatus: validationSeveritySchema,
  validationResult: z.record(z.string(), z.unknown()),
  duplicateQuestionId: z.string().nullable(),
  duplicateQuestionCode: z.string().nullable().optional(),
  duplicateConfidence: z.number().nullable(),
  status: candidateStatusSchema,
  reviewedBy: z.string().nullable(),
  reviewedAt: z.string().nullable(),
  rejectionReason: z.string().nullable(),
  variantJustification: z.string().nullable(),
  publishedQuestionId: z.string().nullable(),
  createdAt: z.string(),
});
export type QuestionCandidate = z.infer<typeof questionCandidateSchema>;

/**
 * Approve as-is. A shared `factKey` match forces the reviewer to explicitly
 * choose intentional-variant (with justification) rather than silently
 * approving over an unresolved duplicate warning.
 */
export const approveCandidateRequestSchema = z.object({
  variantJustification: z.string().trim().min(10).max(1_000).optional(),
});
export type ApproveCandidateRequest = z.infer<typeof approveCandidateRequestSchema>;

/** "Edit & Approve": overrides applied to the candidate before it becomes a canonical question. */
export const editAndApproveCandidateRequestSchema = z.object({
  questionText: z.string().trim().min(10).max(500).optional(),
  options: z.array(candidateOptionSchema).length(4).optional(),
  explanation: z.string().trim().min(1).max(1_000).optional(),
  category: questionCategorySchema.optional(),
  difficulty: questionDifficultySchema.optional(),
  variantJustification: z.string().trim().min(10).max(1_000).optional(),
});
export type EditAndApproveCandidateRequest = z.infer<typeof editAndApproveCandidateRequestSchema>;

export const rejectCandidateRequestSchema = z.object({
  rejectionReason: z.string().trim().min(1).max(1_000),
});
export type RejectCandidateRequest = z.infer<typeof rejectCandidateRequestSchema>;

/** Read-only summary of a candidate patch — used by `PATCH /admin/question-candidates/:id` prior to a later approve. */
export const patchCandidateRequestSchema = z.object({
  questionText: z.string().trim().min(10).max(500).optional(),
  options: z.array(candidateOptionSchema).length(4).optional(),
  explanation: z.string().trim().min(1).max(1_000).optional(),
  suggestedCategory: questionCategorySchema.optional(),
  suggestedDifficulty: questionDifficultySchema.optional(),
});
export type PatchCandidateRequest = z.infer<typeof patchCandidateRequestSchema>;
