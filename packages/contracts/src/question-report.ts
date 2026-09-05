import { z } from 'zod';

/** "Report Question" (Part 44), reachable from any result/review screen. */
export const questionReportReasonSchema = z.enum([
  'incorrect_answer',
  'outdated_information',
  'ambiguous_wording',
  'duplicate_question',
  'typo_formatting',
  'other',
]);
export type QuestionReportReason = z.infer<typeof questionReportReasonSchema>;

export const reportQuestionRequestSchema = z.object({
  reason: questionReportReasonSchema,
  /** Free-text detail, required only for `other` (enforced in the service, not here, since Zod's own cross-field refine would otherwise duplicate the enum check). */
  details: z.string().trim().max(2_000).optional(),
  /** The attempt this report was raised from, if any — absent for a report raised outside a quiz context (e.g. a future standalone question browser). */
  quizAttemptPublicCode: z.string().trim().optional(),
  /** `attemptQuestionId`, so the report can carry the snapshot the user actually saw, not today's edited `question` row. */
  attemptQuestionId: z.string().uuid().optional(),
  /** Which page/screen the report was raised from — result review, a future question browser, etc. */
  context: z.string().trim().max(200).optional(),
});
export type ReportQuestionRequest = z.infer<typeof reportQuestionRequestSchema>;

export const reportQuestionResultSchema = z.object({
  referenceCode: z.string(),
});
export type ReportQuestionResult = z.infer<typeof reportQuestionResultSchema>;
