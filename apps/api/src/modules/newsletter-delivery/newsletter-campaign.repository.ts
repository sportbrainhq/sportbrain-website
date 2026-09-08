import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { NewsletterCampaignStatus } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { newsletterCampaign } from '../../database/schema';

export type NewsletterCampaignRow = typeof newsletterCampaign.$inferSelect;

/**
 * Repository layer for `newsletter_campaign` — see that schema file for the
 * full model. Every write here is a single-row operation; the recipient
 * fan-out lives entirely in `NewsletterRecipientRepository`.
 */
@Injectable()
export class NewsletterCampaignRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<NewsletterCampaignRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterCampaign)
      .where(eq(newsletterCampaign.id, id))
      .limit(1);
    return row ?? null;
  }

  /** Most recent campaign for an issue — the admin delivery view has no notion of "which campaign" beyond "the one for this issue", so it always wants the latest. */
  async findLatestByIssueId(issueId: string): Promise<NewsletterCampaignRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterCampaign)
      .where(eq(newsletterCampaign.issueId, issueId))
      .orderBy(desc(newsletterCampaign.createdAt))
      .limit(1);
    return row ?? null;
  }

  async create(issueId: string, recipientCount: number): Promise<NewsletterCampaignRow> {
    const [row] = await this.database.db
      .insert(newsletterCampaign)
      .values({
        issueId,
        status: 'CREATED',
        recipientCount,
        startedAt: new Date(),
      })
      .returning();
    if (!row) throw new Error('Insert of newsletter_campaign row returned no row');
    return row;
  }

  /** Written once, right after the recipient snapshot completes — see `NewsletterIssueSchedulerJob.startCampaign`. Never recomputed afterward, even if subscribers subscribe/unsubscribe mid-send — see the schema file's own comment on `recipientCount`. */
  async setRecipientCount(id: string, recipientCount: number): Promise<void> {
    await this.database.db
      .update(newsletterCampaign)
      .set({ recipientCount, updatedAt: new Date() })
      .where(eq(newsletterCampaign.id, id));
  }

  async updateStatus(id: string, status: NewsletterCampaignStatus): Promise<void> {
    await this.database.db
      .update(newsletterCampaign)
      .set({ status, updatedAt: new Date() })
      .where(eq(newsletterCampaign.id, id));
  }

  /**
   * Writes the full counter set plus a terminal status/`completedAt` in one
   * statement — called by `NewsletterCampaignService.recomputeCampaignCounters`
   * once per aggregation pass. Never partially updates counters: a campaign
   * row's counters are always internally consistent with each other because
   * they are always all written together, from one aggregate query.
   */
  async updateCounters(
    id: string,
    counters: {
      processedCount: number;
      sentCount: number;
      deliveredCount: number;
      failedCount: number;
      bouncedCount: number;
      complainedCount: number;
      status: NewsletterCampaignStatus;
      completedAt: Date | null;
    },
  ): Promise<void> {
    await this.database.db
      .update(newsletterCampaign)
      .set({ ...counters, updatedAt: new Date() })
      .where(eq(newsletterCampaign.id, id));
  }
}
