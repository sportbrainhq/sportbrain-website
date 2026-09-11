import { z } from 'zod';

/**
 * Scheduling + delivery — Phase D5.
 *
 * D2 (`newsletter-issue.ts`) stopped at READY. This file is the next step: an
 * editor scheduling a READY issue, and the campaign/recipient shapes the
 * admin delivery view reads back. Webhook-driven bounce/complaint processing
 * and the public archive are later phases (D6/D7) and must not be inferred
 * from anything here.
 */

/** Mirrors `newsletter_campaign_status` — see that schema file for what each value means. */
export const newsletterCampaignStatusSchema = z.enum([
  'CREATED',
  'SENDING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
]);
export type NewsletterCampaignStatus = z.infer<typeof newsletterCampaignStatusSchema>;

/** Mirrors `newsletter_recipient_status` — see that schema file for what each value means. */
export const newsletterRecipientStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'BOUNCED',
  'COMPLAINED',
]);
export type NewsletterRecipientStatus = z.infer<typeof newsletterRecipientStatusSchema>;

/**
 * `POST /admin/newsletter/issues/:id/schedule` body.
 *
 * `scheduledAt` is an absolute instant (ISO 8601, always interpreted as UTC
 * once parsed) — `timezone` is carried alongside purely so the instant can be
 * displayed back to the editor in the zone they picked (see
 * `newsletterIssue.scheduleTimezone`'s own comment), not because the send
 * time itself is timezone-relative.
 */
export const scheduleIssueRequestSchema = z
  .object({
    scheduledAt: z.string().datetime(),
    timezone: z.string().trim().min(1).max(100),
  })
  .strict();
export type ScheduleIssueRequest = z.infer<typeof scheduleIssueRequestSchema>;

/** The admin delivery view's read of one campaign — counters plus the lifecycle timestamps, no recipient-level detail (that would be a paginated list, out of scope for D5's UI). */
export const campaignSummarySchema = z.object({
  id: z.string(),
  issueId: z.string(),
  status: newsletterCampaignStatusSchema,
  recipientCount: z.number().int(),
  processedCount: z.number().int(),
  sentCount: z.number().int(),
  deliveredCount: z.number().int(),
  failedCount: z.number().int(),
  bouncedCount: z.number().int(),
  complainedCount: z.number().int(),
  unsubscribedCount: z.number().int(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type CampaignSummary = z.infer<typeof campaignSummarySchema>;

/** One recipient row, for a future per-recipient detail view — not rendered by D5's admin UI (which only shows aggregate counters) but part of the boundary so that view is additive later. */
export const recipientSummarySchema = z.object({
  id: z.string(),
  campaignId: z.string(),
  email: z.string(),
  status: newsletterRecipientStatusSchema,
  attemptCount: z.number().int(),
  failureReason: z.string().nullable(),
  sentAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  failedAt: z.string().nullable(),
});
export type RecipientSummary = z.infer<typeof recipientSummarySchema>;

/** `POST /admin/newsletter/issues/:id/test` body. */
export const sendTestEmailRequestSchema = z
  .object({
    email: z.string().trim().email('Enter a valid email address').max(320),
  })
  .strict();
export type SendTestEmailRequest = z.infer<typeof sendTestEmailRequestSchema>;
