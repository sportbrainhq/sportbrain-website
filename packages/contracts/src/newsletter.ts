import { z } from 'zod';

/**
 * The Monday Brief subscription boundary.
 *
 * This phase (D1) is subscription-only: capturing an address, confirming it
 * (when double opt-in is enabled), tracking its preferences, and letting it
 * unsubscribe without ever deleting the row. There is deliberately no
 * `NewsletterIssue`/campaign shape here yet — that is a separate follow-up
 * phase, and this file must not grow speculative fields for it.
 */

/**
 * Lifecycle of one subscription row. A row is created once per address and
 * never deleted; every state change moves this field rather than adding or
 * removing rows (see the schema file for why).
 *
 *   - `PENDING`: submitted, awaiting double-opt-in confirmation. Never
 *     reached at all when double opt-in is disabled.
 *   - `SUBSCRIBED`: actively receiving the newsletter.
 *   - `UNSUBSCRIBED`: opted out via the unsubscribe link. Resubscribing flips
 *     this back rather than creating a second row.
 *   - `BOUNCED` / `COMPLAINED`: set by a future delivery-provider webhook (not
 *     built in this phase) once sends exist to bounce or be complained about.
 *   - `SUPPRESSED`: a manual/compliance-driven hard stop, distinct from an
 *     unsubscribe the reader chose themselves.
 */
export const newsletterSubscriptionStatusSchema = z.enum([
  'PENDING',
  'SUBSCRIBED',
  'UNSUBSCRIBED',
  'BOUNCED',
  'COMPLAINED',
  'SUPPRESSED',
]);
export type NewsletterSubscriptionStatus = z.infer<typeof newsletterSubscriptionStatusSchema>;

/**
 * Where a subscribe action was initiated. Drives no logic in this phase
 * beyond being stored for provenance, but is required on every submission
 * so a page-level view of "what's converting" is possible without a
 * migration later.
 */
export const newsletterSubscriptionSourceSchema = z.enum([
  'NEWSLETTER_PAGE',
  'HOMEPAGE',
  'PROFILE',
  'ARTICLE',
  'QUIZ_RESULT',
  'FOOTER',
  'OTHER',
]);
export type NewsletterSubscriptionSource = z.infer<typeof newsletterSubscriptionSourceSchema>;

/**
 * The request body for both `POST /newsletter/subscribe` and
 * `POST /me/newsletter/subscribe`.
 *
 * `timezone` is optional and currently unused beyond being stored: it exists
 * so a future send-time-of-day feature does not need a migration, not
 * because anything reads it yet.
 */
export const subscribeRequestSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(320),
  source: newsletterSubscriptionSourceSchema,
  timezone: z.string().trim().max(100).optional(),
});
export type SubscribeRequest = z.infer<typeof subscribeRequestSchema>;

/**
 * Mailing preferences a subscriber controls. Sport slugs rather than a
 * reference to Phase C's follow/entity model on purpose: an anonymous
 * subscriber has no account to attach a `userFollows` row to at all, and
 * coupling this to that schema would make a signed-out subscription second
 * class. The web client maps these slugs to whatever sport list it already
 * renders elsewhere.
 */
export const updateNewsletterPreferencesSchema = z.object({
  sports: z.array(z.string()).max(50),
});
export type UpdateNewsletterPreferencesRequest = z.infer<typeof updateNewsletterPreferencesSchema>;

/** The preferences shape as stored/returned, mirroring the request. */
export const newsletterPreferencesSchema = z.object({
  sports: z.array(z.string()),
});
export type NewsletterPreferences = z.infer<typeof newsletterPreferencesSchema>;

/**
 * What `GET /me/newsletter` returns for a signed-in reader: their own
 * subscription state, or null when they have never subscribed.
 */
export const newsletterSubscriptionSummarySchema = z.object({
  status: newsletterSubscriptionStatusSchema,
  subscribedAt: z.string(),
  preferences: newsletterPreferencesSchema.nullable(),
});
export type NewsletterSubscriptionSummary = z.infer<typeof newsletterSubscriptionSummarySchema>;

/**
 * The public subscribe response.
 *
 * Deliberately idempotent-safe: subscribing an address twice, or an address
 * that unsubscribed and is resubscribing, must never look like an error to
 * the caller. `status` tells the client which of three copy states to show
 * (see the newsletter page's "already subscribed" vs "check your email"
 * states) without leaking whether the address existed before this call —
 * an enumeration risk this shape avoids by never returning a 409/404 for any
 * of these cases.
 */
export const subscribeResponseSchema = z.object({
  status: z.enum(['subscribed', 'pending_confirmation', 'already_subscribed']),
});
export type SubscribeResponse = z.infer<typeof subscribeResponseSchema>;

/** Response for `GET /newsletter/confirm/:token` and `POST /newsletter/unsubscribe/:token`. */
export const newsletterTokenActionResponseSchema = z.object({
  status: z.enum(['confirmed', 'unsubscribed', 'invalid_token']),
});
export type NewsletterTokenActionResponse = z.infer<typeof newsletterTokenActionResponseSchema>;
