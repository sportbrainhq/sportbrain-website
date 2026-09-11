import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { AppConfig } from '../../config';
import { NewsletterIssueRepository } from '../newsletter-issues/newsletter-issue.repository';
import { NewsletterCampaignRepository } from './newsletter-campaign.repository';
import { NewsletterRecipientRepository } from './newsletter-recipient.repository';
import { QueueService } from '../../queue/queue.service';

/**
 * Polls for SCHEDULED issues due to send and starts their campaigns
 * (Phase D5). Mirrors `NewsSchedulerJob`'s shape exactly (see that file's
 * header): find candidates, do the minimum work to hand off to the real
 * worker, isolate one failure from the rest.
 *
 * The concurrency-safety property this job depends on — and that makes it
 * safe to run on more than one replica with `JOBS_ENABLED=true`, unlike most
 * of this codebase's jobs (see `JobsModule`'s "multi-replica problem" doc) —
 * is `NewsletterIssueRepository.claimForSending`'s atomic, status-guarded
 * `WHERE status = 'SCHEDULED'` update. Two replicas racing on the same due
 * issue both call `claimForSending`; only one gets a non-null row back
 * (Postgres serializes the two `UPDATE`s), and the loser simply moves on to
 * the next candidate. This is the same pattern
 * `newsletter-issue.repository.ts`'s `scheduleIssue`/`cancelSchedule` use for
 * the same reason.
 */
@Injectable()
export class NewsletterIssueSchedulerJob {
  private readonly logger = new Logger(NewsletterIssueSchedulerJob.name);

  constructor(
    private readonly issues: NewsletterIssueRepository,
    private readonly campaigns: NewsletterCampaignRepository,
    private readonly recipients: NewsletterRecipientRepository,
    private readonly queue: QueueService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'newsletter-issue-scheduler' })
  async run(): Promise<void> {
    let due: Awaited<ReturnType<NewsletterIssueRepository['findDueForSending']>>;
    try {
      due = await this.issues.findDueForSending(new Date());
    } catch (error) {
      this.logger.error(
        `Failed to query due newsletter issues: ${error instanceof Error ? error.message : String(error)}`,
      );
      return;
    }

    if (due.length === 0) return;

    this.logger.debug(`${due.length} newsletter issue(s) due for send`);

    for (const issue of due) {
      try {
        await this.startCampaign(issue.id);
      } catch (error) {
        this.logger.error(
          `Failed to start campaign for issue "${issue.slug}": ${error instanceof Error ? error.message : String(error)}`,
        );
        // Continue: one bad issue must not stop the rest from being claimed.
      }
    }
  }

  /**
   * Claims one issue, snapshots its recipients, and enqueues delivery
   * batches. If `claimForSending` returns null, another runner already won
   * the race for this issue (or a previous tick already claimed it and this
   * one is stale) — that is the expected, silent "someone else has it" case,
   * not an error.
   */
  private async startCampaign(issueId: string): Promise<void> {
    const claimed = await this.issues.claimForSending(issueId);
    if (!claimed) {
      this.logger.debug(`Issue "${issueId}" was already claimed by another run; skipping.`);
      return;
    }

    // A campaign row must exist before recipients can reference it (the FK),
    // so `recipientCount` is written as 0 at creation and corrected in one
    // follow-up update once the snapshot's true count is known — computing
    // it requires the snapshot insert to have already happened.
    const campaign = await this.campaigns.create(claimed.id, 0);
    const recipientCount = await this.recipients.createRecipientSnapshot(campaign.id);
    await this.campaigns.setRecipientCount(campaign.id, recipientCount);
    await this.campaigns.updateStatus(campaign.id, 'SENDING');

    // D7: the issue becomes publicly visible the moment its campaign begins
    // SENDING (org spec section 49 — "when campaign begins sending
    // successfully, publish issue"), not before. `claimForSending` (above)
    // already moved the issue's own status to SENDING; this stamps the
    // separate `publishedAt` timestamp the public archive actually reads
    // (`NewsletterArchiveRepository.findPublishedBySlug`/`listPublished`
    // filter on `publishedAt IS NOT NULL`, not on `status`) so a currently-
    // DRAFT/READY/SCHEDULED issue is never reachable and a SENDING one
    // becomes reachable at exactly this instant. Guarded so a retried/re-run
    // campaign for the same issue never resets an already-set publish time.
    await this.issues.publishIfUnset(claimed.id);

    const batchSize = this.config.get('newsletter', { infer: true }).delivery.batchSize;
    const batchCount = Math.max(1, Math.ceil(recipientCount / batchSize));

    for (let batchIndex = 0; batchIndex < batchCount; batchIndex += 1) {
      await this.queue.enqueueNewsletterDelivery({ campaignId: campaign.id, batchIndex });
    }

    this.logger.log(
      `Started campaign ${campaign.id} for issue "${claimed.slug}": ${recipientCount} recipient(s), ${batchCount} batch(es)`,
    );
  }
}
