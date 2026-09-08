import { z } from 'zod';
import { newsletterSubscriptionSourceSchema } from './newsletter';

/**
 * Delivery health / subscriber analytics — Phase D6 (org spec section 45/46).
 *
 * Deliberately does not include click-through/top-links data: no
 * click-tracking infrastructure exists anywhere in this codebase (links in
 * the rendered email are plain URLs, not redirect/tracking links), so there
 * is nothing real to report. Adding a placeholder number here would be
 * exactly the kind of fabricated metric this repo's accuracy rules forbid;
 * that capability is deferred until link tracking is built as its own
 * phase.
 */

/**
 * `GET /admin/newsletter/issues/:id/analytics` response — one issue's most
 * recent campaign, analytics-flavoured. Overlaps with `CampaignSummary`
 * (D5) by design: this is the same underlying counters, reshaped for a
 * dedicated analytics view rather than the delivery-ops view `CampaignSummary`
 * serves, so each can evolve its own presentation (e.g. rates here) without
 * the other's shape being a compromise between the two audiences.
 */
export const issueAnalyticsSchema = z.object({
  issueId: z.string(),
  campaignId: z.string().nullable(),
  recipientCount: z.number().int(),
  sentCount: z.number().int(),
  deliveredCount: z.number().int(),
  bouncedCount: z.number().int(),
  complainedCount: z.number().int(),
  failedCount: z.number().int(),
  unsubscribedCount: z.number().int(),
  /** `deliveredCount / sentCount`, `null` when `sentCount` is 0 (nothing sent yet, or a campaign that hasn't started) — never a division-by-zero NaN or a fabricated 0%. */
  deliveryRate: z.number().min(0).max(1).nullable(),
  /** Explicit marker that top-links/click-through data is not available yet — see the file header. Always `false` in this phase; flip to a real array once click tracking exists. */
  topLinksAvailable: z.literal(false),
});
export type IssueAnalytics = z.infer<typeof issueAnalyticsSchema>;

/** One count per `NewsletterSubscriptionSource` value, for the site-wide analytics breakdown. Every source key is always present (zero-filled), so the caller never has to guess which sources exist. */
export const subscriberSourceBreakdownSchema = z.record(
  newsletterSubscriptionSourceSchema,
  z.number().int().nonnegative(),
);
export type SubscriberSourceBreakdown = z.infer<typeof subscriberSourceBreakdownSchema>;

/**
 * `GET /admin/newsletter/analytics` response — site-wide subscriber
 * analytics, queried directly against `newsletter_subscription` (there is no
 * per-issue scoping here, unlike `IssueAnalytics`).
 */
export const subscriberAnalyticsSchema = z.object({
  totalSubscribed: z.number().int().nonnegative(),
  /** New `SUBSCRIBED`-or-`PENDING` rows created in the last 7 days (`subscribedAt >= now - 7d`) — "new this week" per the org spec, counted from `subscribedAt` since that is when the address first (or most recently) opted in, not `createdAt`, which would count a resubscribe of a years-old row as brand new only if `subscribedAt` were not updated on reactivate (it is — see `NewsletterRepository.reactivate`). */
  newThisWeek: z.number().int().nonnegative(),
  unsubscribed: z.number().int().nonnegative(),
  bounced: z.number().int().nonnegative(),
  complained: z.number().int().nonnegative(),
  bySource: subscriberSourceBreakdownSchema,
});
export type SubscriberAnalytics = z.infer<typeof subscriberAnalyticsSchema>;
