import { Injectable } from '@nestjs/common';
import { and, count, eq, inArray, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { newsletterRecipient, newsletterSubscription } from '../../database/schema';

export type NewsletterRecipientRow = typeof newsletterRecipient.$inferSelect;

/**
 * Repository layer for `newsletter_recipient` — see that schema file for the
 * idempotency/status-guard reasoning this class implements.
 */
@Injectable()
export class NewsletterRecipientRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Snapshots every currently-`SUBSCRIBED` address into `PENDING` recipient
   * rows for this campaign. `.onConflictDoNothing()` against the unique
   * `(campaignId, subscriptionId)` index (see the schema file) is what makes
   * this safe to call more than once for the same campaign — a re-run after
   * a crash mid-snapshot inserts only the rows that don't already exist,
   * never a duplicate.
   *
   * Returns the count of rows that exist for this campaign afterward (not
   * just newly-inserted ones), since the caller (`NewsletterIssueSchedulerJob`)
   * needs the campaign's true `recipientCount` regardless of whether this
   * was the first or a repeated call.
   */
  async createRecipientSnapshot(campaignId: string): Promise<number> {
    const subscribed = await this.database.db
      .select({
        id: newsletterSubscription.id,
        userId: newsletterSubscription.userId,
        email: newsletterSubscription.email,
      })
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.status, 'SUBSCRIBED'));

    if (subscribed.length > 0) {
      await this.database.db
        .insert(newsletterRecipient)
        .values(
          subscribed.map((subscription) => ({
            campaignId,
            subscriptionId: subscription.id,
            userId: subscription.userId,
            email: subscription.email,
            status: 'PENDING' as const,
          })),
        )
        .onConflictDoNothing();
    }

    const [row] = await this.database.db
      .select({ value: count() })
      .from(newsletterRecipient)
      .where(eq(newsletterRecipient.campaignId, campaignId));
    return row?.value ?? 0;
  }

  /** Ordered by id for stable, resumable paging across worker batches — see `NewsletterDeliveryWorker`. */
  async findPendingRecipients(
    campaignId: string,
    limit: number,
  ): Promise<NewsletterRecipientRow[]> {
    return this.database.db
      .select()
      .from(newsletterRecipient)
      .where(
        and(
          eq(newsletterRecipient.campaignId, campaignId),
          eq(newsletterRecipient.status, 'PENDING'),
        ),
      )
      .orderBy(newsletterRecipient.id)
      .limit(limit);
  }

  /** FAILED recipients under the attempt cap — the exact population `NewsletterCampaignService.retryFailed` is allowed to touch. */
  async findRetryableFailed(
    campaignId: string,
    maxAttempts: number,
  ): Promise<NewsletterRecipientRow[]> {
    const rows = await this.database.db
      .select()
      .from(newsletterRecipient)
      .where(
        and(
          eq(newsletterRecipient.campaignId, campaignId),
          eq(newsletterRecipient.status, 'FAILED'),
        ),
      )
      .orderBy(newsletterRecipient.id);
    return rows.filter((row) => row.attemptCount < maxAttempts);
  }

  /**
   * PENDING/FAILED -> SENT, guarded in the `WHERE` clause so a duplicate
   * worker attempt on an already-SENT (or otherwise already-terminal) row is
   * a silent no-op, never a double-send or a status regression. Allows
   * FAILED as a starting status too, since a retried send that succeeds
   * moves a previously-failed row forward.
   */
  async markRecipientSent(id: string, providerMessageId: string): Promise<boolean> {
    const now = new Date();
    const result = await this.database.db
      .update(newsletterRecipient)
      .set({
        status: 'SENT',
        providerMessageId,
        sentAt: now,
        lastAttemptAt: now,
        attemptCount: sql`${newsletterRecipient.attemptCount} + 1`,
        updatedAt: now,
      })
      .where(
        and(
          eq(newsletterRecipient.id, id),
          inArray(newsletterRecipient.status, ['PENDING', 'FAILED']),
        ),
      )
      .returning({ id: newsletterRecipient.id });
    return result.length > 0;
  }

  /** PENDING/FAILED -> FAILED, same status-guard reasoning as `markRecipientSent`. */
  async markRecipientFailed(id: string, failureReason: string): Promise<boolean> {
    const now = new Date();
    const result = await this.database.db
      .update(newsletterRecipient)
      .set({
        status: 'FAILED',
        failureReason,
        failedAt: now,
        lastAttemptAt: now,
        attemptCount: sql`${newsletterRecipient.attemptCount} + 1`,
        updatedAt: now,
      })
      .where(
        and(
          eq(newsletterRecipient.id, id),
          inArray(newsletterRecipient.status, ['PENDING', 'FAILED']),
        ),
      )
      .returning({ id: newsletterRecipient.id });
    return result.length > 0;
  }

  /** Aggregate counts by status, for `NewsletterCampaignService.recomputeCampaignCounters`. */
  async countByStatus(campaignId: string): Promise<Record<string, number>> {
    const rows = await this.database.db
      .select({ status: newsletterRecipient.status, value: count() })
      .from(newsletterRecipient)
      .where(eq(newsletterRecipient.campaignId, campaignId))
      .groupBy(newsletterRecipient.status);

    return Object.fromEntries(rows.map((row) => [row.status, row.value]));
  }

  /** Looked up by `NewsletterWebhookService` against the incoming event's `providerMessageId` — the only correlation key a delivery webhook carries back to one recipient row. Returns `null` for an unknown id, which the webhook handler treats as "log and ignore", not an error (see that service's own header). */
  async findByProviderMessageId(providerMessageId: string): Promise<NewsletterRecipientRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterRecipient)
      .where(eq(newsletterRecipient.providerMessageId, providerMessageId))
      .limit(1);
    return row ?? null;
  }

  /**
   * SENT -> DELIVERED, guarded by `WHERE status = 'SENT'` so a duplicate
   * `delivered` webhook for an already-DELIVERED recipient is a silent
   * no-op — this is the idempotency guarantee `NewsletterWebhookService`
   * relies on instead of a separate dedup table (see that service's header
   * for the full reasoning). Returns whether the row actually transitioned,
   * so the caller only recomputes campaign counters when something changed.
   */
  async markRecipientDelivered(id: string): Promise<boolean> {
    const now = new Date();
    const result = await this.database.db
      .update(newsletterRecipient)
      .set({ status: 'DELIVERED', deliveredAt: now, updatedAt: now })
      .where(and(eq(newsletterRecipient.id, id), eq(newsletterRecipient.status, 'SENT')))
      .returning({ id: newsletterRecipient.id });
    return result.length > 0;
  }

  /**
   * SENT -> BOUNCED or SENT -> COMPLAINED (`status` picks which), same
   * status-guard idempotency as `markRecipientDelivered`: a duplicate
   * bounce/complaint webhook for an already-terminal recipient is a no-op.
   * Also allows starting from PENDING/FAILED — a provider can report a hard
   * bounce/complaint without ever confirming a prior `sent` event reached it
   * first, and this row must still end up BOUNCED/COMPLAINED regardless of
   * which state the worker last left it in.
   */
  async markRecipientBouncedOrComplained(
    id: string,
    status: 'BOUNCED' | 'COMPLAINED',
    failureReason: string,
  ): Promise<boolean> {
    const now = new Date();
    const result = await this.database.db
      .update(newsletterRecipient)
      .set({ status, failedAt: now, failureReason, updatedAt: now })
      .where(
        and(
          eq(newsletterRecipient.id, id),
          inArray(newsletterRecipient.status, ['PENDING', 'SENT', 'FAILED']),
        ),
      )
      .returning({ id: newsletterRecipient.id });
    return result.length > 0;
  }
}
