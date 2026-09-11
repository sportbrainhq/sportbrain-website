import { index, integer, pgEnum, pgTable, timestamp } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { newsletterIssue } from './newsletter-issue.schema';

/**
 * One send run of one issue (Phase D5).
 *
 * D2 (`newsletter-issue.schema.ts`) modelled "an issue can be marked READY"
 * and stopped there. This table is the next step: the moment an issue is
 * actually sent, with its own lifecycle independent of the issue's — an
 * issue is SENT once, but the campaign that sent it carries the counters
 * (how many recipients, how many delivered, how many bounced) that belong to
 * the *act of sending*, not to the issue's editorial content. Kept as a
 * separate table (not more columns on `newsletter_issue`) because a
 * campaign's shape — one row referencing potentially thousands of
 * `newsletter_recipient` rows — is a different write pattern from an
 * editor's occasional content PATCH, and because "retry a failed campaign"
 * needs a row to retry that both survives and does not itself require
 * `newsletter_issue` to be in a weird intermediate state to represent it.
 *
 * One issue has at most one non-terminal campaign at a time in practice — the
 * scheduler's status-guarded SCHEDULED->SENDING transition (see
 * `newsletter-issue-scheduler.job.ts`) is what prevents two campaigns being
 * created for the same scheduled send under concurrent scheduler ticks — but
 * this table does not itself enforce "one campaign per issue" with a unique
 * index, since a resend-after-FAILED product decision (out of scope for D5)
 * would legitimately want a second campaign row for the same issue.
 */
export const newsletterCampaignStatusEnum = pgEnum('newsletter_campaign_status', [
  'CREATED',
  'SENDING',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
]);

export const newsletterCampaign = pgTable(
  'newsletter_campaign',
  {
    id: primaryId(),

    issueId: entityRef('issue_id')
      .notNull()
      .references(() => newsletterIssue.id, { onDelete: 'cascade' }),

    /**
     * CREATED: recipient snapshot taken, nothing sent yet. SENDING: the
     * delivery worker is actively processing batches. COMPLETED: every
     * recipient reached a terminal state and none failed. PARTIAL: every
     * recipient reached a terminal state but at least one failed/bounced.
     * FAILED: every recipient failed (a total send failure, e.g. the
     * provider was unreachable for the whole run). See
     * `NewsletterCampaignService.recomputeCampaignCounters` for the exact
     * rule that flips CREATED/SENDING into one of the three terminal values.
     */
    status: newsletterCampaignStatusEnum('status').notNull().default('CREATED'),

    /** Snapshotted at campaign creation — see `NewsletterRecipientRepository.createRecipientSnapshot`. Never recomputed afterward, even if subscribers subscribe/unsubscribe mid-send: the campaign's own denominator must stay fixed once sending starts. */
    recipientCount: integer('recipient_count').notNull().default(0),
    /** How many recipients have reached ANY terminal state (SENT/DELIVERED/FAILED/BOUNCED/COMPLAINED) — the numerator against `recipientCount` that decides when the campaign itself is done. */
    processedCount: integer('processed_count').notNull().default(0),
    sentCount: integer('sent_count').notNull().default(0),
    deliveredCount: integer('delivered_count').notNull().default(0),
    failedCount: integer('failed_count').notNull().default(0),
    bouncedCount: integer('bounced_count').notNull().default(0),
    complainedCount: integer('complained_count').notNull().default(0),
    /** Written only by D6 (webhook-driven unsubscribes triggered by a specific send) — column exists now so that phase is additive. Never incremented by anything in D5. */
    unsubscribedCount: integer('unsubscribed_count').notNull().default(0),

    startedAt: timestamp('started_at', { withTimezone: true }).notNull(),
    /** Null until every recipient reaches a terminal state — see `recomputeCampaignCounters`. */
    completedAt: timestamp('completed_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    index('newsletter_campaign_issue_id_idx').on(table.issueId),
    index('newsletter_campaign_status_idx').on(table.status),
  ],
);
