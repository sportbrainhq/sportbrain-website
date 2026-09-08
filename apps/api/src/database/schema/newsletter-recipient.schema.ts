import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { newsletterCampaign } from './newsletter-campaign.schema';
import { newsletterSubscription } from './newsletter-subscription.schema';
import { users } from './user.schema';

/**
 * One recipient of one campaign (Phase D5): the per-address send record.
 *
 * `email` is snapshotted at recipient-creation time rather than joined live
 * against `newsletter_subscription.email` — mirrors why `questionSnapshot`
 * freezes a question's presentation fields on `newsletter_issue.content`
 * (see that schema file): once a send is in flight, "which address did we
 * actually mail" must stay answerable even if the subscription row is later
 * edited (re-normalized email casing, linked to a different `userId`, etc.).
 *
 * The unique index on `(campaignId, subscriptionId)` is this table's
 * safety-critical property, not an optimization: it is what makes
 * `createRecipientSnapshot`'s `onConflictDoNothing()` bulk insert idempotent
 * under a re-run (e.g. the scheduler job retried after a crash mid-snapshot,
 * or an admin re-triggering snapshot creation) — a subscriber must never be
 * mailed twice for the same campaign because the snapshot step ran twice.
 */
export const newsletterRecipientStatusEnum = pgEnum('newsletter_recipient_status', [
  'PENDING',
  'SENT',
  'DELIVERED',
  'FAILED',
  'BOUNCED',
  'COMPLAINED',
]);

export const newsletterRecipient = pgTable(
  'newsletter_recipient',
  {
    id: primaryId(),

    campaignId: entityRef('campaign_id')
      .notNull()
      .references(() => newsletterCampaign.id, { onDelete: 'cascade' }),
    subscriptionId: entityRef('subscription_id')
      .notNull()
      .references(() => newsletterSubscription.id, { onDelete: 'cascade' }),
    /** Populated only when the subscription was linked to a signed-in account at snapshot time — same nullable-provenance shape as `newsletter_subscription.userId`. */
    userId: entityRef('user_id').references(() => users.id, { onDelete: 'set null' }),

    /** Snapshotted from `newsletter_subscription.email` at recipient-creation time — see the file header for why. */
    email: text('email').notNull(),

    /**
     * PENDING -> SENT -> DELIVERED is the happy path (DELIVERED requires a
     * provider delivery webhook, which D5 does not build — see D6 — so every
     * D5-created row realistically stops at SENT). PENDING -> FAILED /
     * BOUNCED / COMPLAINED are the failure paths the worker itself can reach
     * without a webhook (a provider call throwing, or a final suppression
     * check catching an address that unsubscribed between snapshot and
     * send). Every transition out of PENDING is guarded by current status in
     * `NewsletterRecipientRepository` — see `markRecipientSent`/
     * `markRecipientFailed` — so a duplicate worker attempt on an
     * already-terminal row is a no-op, not a double-send or a status
     * regression.
     */
    status: newsletterRecipientStatusEnum('status').notNull().default('PENDING'),

    /** The stub provider's fake message id (`stub_<uuid>`) once sent — see `NewsletterEmailProvider`. Real once a real provider is wired up; unused for matching anything in D5 since no webhook consumes it yet. */
    providerMessageId: text('provider_message_id'),

    /** Incremented on every send attempt, success or failure — `NEWSLETTER_MAX_SEND_ATTEMPTS` caps how many times `retryFailed` (D5) will re-enqueue a FAILED row. */
    attemptCount: integer('attempt_count').notNull().default(0),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),

    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    failedAt: timestamp('failed_at', { withTimezone: true }),
    /** Set alongside `failedAt`/`bouncedAt`-equivalent transitions — a short human-readable reason (e.g. "provider error: timeout"), not a stack trace. */
    failureReason: text('failure_reason'),

    ...timestamps,
  },
  (table) => [
    // Idempotency guarantee for `createRecipientSnapshot` — see file header.
    uniqueIndex('newsletter_recipient_campaign_subscription_idx').on(
      table.campaignId,
      table.subscriptionId,
    ),
    index('newsletter_recipient_status_idx').on(table.status),
    index('newsletter_recipient_provider_message_id_idx').on(table.providerMessageId),
  ],
);
