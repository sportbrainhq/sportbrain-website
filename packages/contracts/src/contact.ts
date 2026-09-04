import { z } from 'zod';

/**
 * The Contact & Feedback boundary.
 *
 * One form serves several very different senders: a reader reporting a wrong
 * stat, a partner proposing a data deal, a journalist on deadline. Rather than
 * one endpoint per audience, the shape is uniform and `category` decides how
 * the message is routed and templated on both ends.
 *
 * `correction` is the one category with structured fields of its own, because
 * it seeds a workflow (`ContactStatus`) the others do not need yet: a wrong
 * fact has a lifecycle from report to fix, where "we replied" is not the same
 * as "we corrected it".
 */

export const contactCategorySchema = z.enum([
  'general',
  'correction',
  'content_feedback',
  'quiz_issue',
  'partnerships',
  'press',
  'feature_request',
  'technical_issue',
  'other',
]);
export type ContactCategory = z.infer<typeof contactCategorySchema>;

/**
 * Lifecycle of a correction report.
 *
 * Only meaningful for `category: 'correction'`; every other category is
 * either answered or not and does not need a workflow. Kept on every
 * submission row regardless, defaulting to `received`, so the admin list does
 * not need a nullable column to filter on.
 */
export const contactStatusSchema = z.enum([
  'received',
  'under_review',
  'accepted',
  'rejected',
  'resolved',
]);
export type ContactStatus = z.infer<typeof contactStatusSchema>;

/** Shared fields every submission carries, regardless of category. */
const contactBaseSchema = z.object({
  category: contactCategorySchema,
  name: z.string().trim().min(1, 'Name is required').max(200),
  email: z.string().trim().email('Enter a valid email address').max(320),
  subject: z.string().trim().min(1, 'Subject is required').max(300),
  message: z.string().trim().min(1, 'Message is required').max(5_000),
  /** The page the form was opened from, when opened from content. */
  pageUrl: z.string().trim().url().max(2_000).optional(),
});

/** Extra fields shown only when `category` is `correction`. */
const correctionFieldsSchema = z.object({
  /** What the reader says is wrong. Distinct from `message`, which is free-form. */
  whatIsIncorrect: z.string().trim().min(1).max(2_000).optional(),
  whatItShouldSay: z.string().trim().min(1).max(2_000).optional(),
  /** A citation for the correct value, optional because not every reader has one. */
  sourceUrl: z.string().trim().url().max(2_000).optional(),
});

/**
 * The request body for `POST /contact`.
 *
 * Correction-only fields are optional at the schema level rather than via a
 * discriminated union: a union would force every non-correction submission to
 * carry an explicit `undefined` for fields it will never use, for a
 * uniqueness the API does not otherwise need. Server-side, the category
 * decides which optional fields are meaningful.
 */
export const createContactRequestSchema = contactBaseSchema.extend({
  ...correctionFieldsSchema.shape,
});
export type CreateContactRequest = z.infer<typeof createContactRequestSchema>;

/** What the client renders after a successful submission. */
export const contactSubmissionResultSchema = z.object({
  referenceCode: z.string(),
  email: z.string(),
});
export type ContactSubmissionResult = z.infer<typeof contactSubmissionResultSchema>;

/** One row in the admin listing. */
export const contactSubmissionSummarySchema = z.object({
  id: z.string(),
  referenceCode: z.string(),
  category: contactCategorySchema,
  status: contactStatusSchema,
  name: z.string(),
  email: z.string(),
  subject: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});
export type ContactSubmissionSummary = z.infer<typeof contactSubmissionSummarySchema>;

/** Full submission detail for the admin single-item view. */
export const contactSubmissionDetailSchema = contactSubmissionSummarySchema.extend({
  userId: z.string().nullable(),
  message: z.string(),
  pageUrl: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  attachmentUrl: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  updatedAt: z.string(),
});
export type ContactSubmissionDetail = z.infer<typeof contactSubmissionDetailSchema>;

export const updateContactStatusRequestSchema = z.object({
  status: contactStatusSchema,
});
export type UpdateContactStatusRequest = z.infer<typeof updateContactStatusRequestSchema>;

/**
 * Direct-contact addresses the frontend may display, e.g. under the form.
 *
 * Only addresses that actually exist are present: an unconfigured mailbox is
 * omitted entirely rather than rendered as an empty string, so the page never
 * advertises an address nobody reads yet.
 */
export const contactConfigSchema = z.object({
  emails: z.object({
    general: z.string().email().optional(),
    corrections: z.string().email().optional(),
    partnerships: z.string().email().optional(),
    press: z.string().email().optional(),
  }),
});
export type ContactConfig = z.infer<typeof contactConfigSchema>;
