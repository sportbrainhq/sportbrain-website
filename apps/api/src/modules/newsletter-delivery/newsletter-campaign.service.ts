import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CampaignSummary, IssueAnalytics } from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import { AppException } from '../../common';
import { NewsletterIssueRepository } from '../newsletter-issues/newsletter-issue.repository';
import {
  NewsletterCampaignRepository,
  type NewsletterCampaignRow,
} from './newsletter-campaign.repository';
import { NewsletterRecipientRepository } from './newsletter-recipient.repository';
import { QueueService } from '../../queue/queue.service';

/**
 * Service layer for campaign lifecycle/aggregation (Phase D5).
 *
 * `recomputeCampaignCounters` is the one place a campaign's status is
 * decided — mirrors `QuizStatsService`'s "repository stays dumb, service
 * does the derived-metric math" split. Called by the delivery worker after
 * every processed batch, so the campaign's counters and status are current
 * within one batch's worth of lag, not only at the very end.
 */
@Injectable()
export class NewsletterCampaignService {
  constructor(
    private readonly campaigns: NewsletterCampaignRepository,
    private readonly recipients: NewsletterRecipientRepository,
    private readonly issues: NewsletterIssueRepository,
    private readonly queue: QueueService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async getCampaignForIssue(issueId: string): Promise<CampaignSummary> {
    const campaign = await this.campaigns.findLatestByIssueId(issueId);
    if (!campaign) throw AppException.notFound(`No campaign exists yet for issue "${issueId}".`);
    return this.toSummary(campaign);
  }

  /**
   * The analytics-flavoured read of one issue's most recent campaign (Phase
   * D6, org spec section 45/46) — distinct from `getCampaignForIssue`
   * (D5's delivery-ops view) rather than an extension of it, so each can
   * carry fields relevant to its own audience (a derived `deliveryRate`
   * here, no `processedCount`/`startedAt` delivery-ops detail) without
   * either view being a compromise. Unlike `getCampaignForIssue`, an issue
   * with no campaign yet is not a 404 here: an issue that has never been
   * sent legitimately has "an analytics view", just one that is all zeros —
   * the admin analytics panel should render that as "not sent yet", not an
   * error page.
   *
   * `topLinksAvailable: false` is always present and always `false` — no
   * click-tracking infrastructure exists in this codebase (see the
   * contracts file's own header) — never fabricated as a real number.
   */
  async getIssueAnalytics(issueId: string): Promise<IssueAnalytics> {
    const campaign = await this.campaigns.findLatestByIssueId(issueId);

    if (!campaign) {
      return {
        issueId,
        campaignId: null,
        recipientCount: 0,
        sentCount: 0,
        deliveredCount: 0,
        bouncedCount: 0,
        complainedCount: 0,
        failedCount: 0,
        unsubscribedCount: 0,
        deliveryRate: null,
        topLinksAvailable: false,
      };
    }

    return {
      issueId,
      campaignId: campaign.id,
      recipientCount: campaign.recipientCount,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      bouncedCount: campaign.bouncedCount,
      complainedCount: campaign.complainedCount,
      failedCount: campaign.failedCount,
      unsubscribedCount: campaign.unsubscribedCount,
      deliveryRate: campaign.sentCount > 0 ? campaign.deliveredCount / campaign.sentCount : null,
      topLinksAvailable: false,
    };
  }

  /**
   * Re-enqueues every FAILED recipient still under the attempt cap as a
   * fresh single-batch delivery job. Only ever touches FAILED rows — a
   * PENDING row is already going to be picked up by its original batch, and
   * a SENT/DELIVERED/BOUNCED/COMPLAINED row is terminal and must never be
   * retried. Recipients at or over `NEWSLETTER_MAX_SEND_ATTEMPTS` are
   * silently excluded (not retried, not errored) — see the schema file's
   * comment on `attemptCount` for why that cap exists.
   */
  async retryFailed(campaignId: string): Promise<{ retryCount: number }> {
    const campaign = await this.mustFindCampaign(campaignId);
    const maxAttempts = this.config.get('newsletter', { infer: true }).delivery.maxSendAttempts;

    const retryable = await this.recipients.findRetryableFailed(campaignId, maxAttempts);
    if (retryable.length === 0) return { retryCount: 0 };

    // A dedicated batch index namespace ('retry-<timestamp>') so this
    // enqueue's deterministic job id never collides with the campaign's
    // original send batches, letting a retry run be enqueued even if the
    // original batch numbering is still in BullMQ's completed-job history.
    await this.queue.enqueueNewsletterDelivery({
      campaignId,
      batchIndex: Date.now(),
    });

    if (campaign.status !== 'SENDING') {
      await this.campaigns.updateStatus(campaignId, 'SENDING');
    }

    return { retryCount: retryable.length };
  }

  /**
   * Aggregates `newsletter_recipient` statuses into the campaign's counters
   * and decides whether the campaign is done:
   *
   *   - `processedCount` is every recipient in a terminal state (anything
   *     but PENDING).
   *   - Once `processedCount === recipientCount`, the campaign is done and
   *     gets a `completedAt` plus one of three terminal statuses: COMPLETED
   *     (no failures/bounces/complaints at all), PARTIAL (some succeeded,
   *     some didn't), FAILED (nothing succeeded — sentCount and
   *     deliveredCount both zero).
   *   - Before that point the campaign stays SENDING.
   *
   * Also flips the parent `newsletter_issue` to SENT/FAILED once the
   * campaign reaches a terminal state — PARTIAL counts as SENT on the issue
   * (a partially-delivered send is still "sent", the partial failure is a
   * campaign-level concern an admin resolves via Retry Failed, not a reason
   * to say the issue itself never went out).
   */
  async recomputeCampaignCounters(campaignId: string): Promise<void> {
    const campaign = await this.mustFindCampaign(campaignId);
    const counts = await this.recipients.countByStatus(campaignId);

    const sentCount = counts.SENT ?? 0;
    const deliveredCount = counts.DELIVERED ?? 0;
    const failedCount = counts.FAILED ?? 0;
    const bouncedCount = counts.BOUNCED ?? 0;
    const complainedCount = counts.COMPLAINED ?? 0;
    const pendingCount = counts.PENDING ?? 0;

    const processedCount = campaign.recipientCount - pendingCount;
    const isDone = processedCount >= campaign.recipientCount;

    let status: NewsletterCampaignRow['status'] = 'SENDING';
    let completedAt: Date | null = null;

    if (isDone) {
      completedAt = new Date();
      const anyFailures = failedCount + bouncedCount + complainedCount > 0;
      const anySuccesses = sentCount + deliveredCount > 0;

      if (!anyFailures) status = 'COMPLETED';
      else if (anySuccesses) status = 'PARTIAL';
      else status = 'FAILED';
    }

    await this.campaigns.updateCounters(campaignId, {
      processedCount,
      sentCount,
      deliveredCount,
      failedCount,
      bouncedCount,
      complainedCount,
      status,
      completedAt,
    });

    if (isDone) {
      await this.issues.markSendOutcome(campaign.issueId, status === 'FAILED' ? 'FAILED' : 'SENT');
    }
  }

  private async mustFindCampaign(id: string): Promise<NewsletterCampaignRow> {
    const campaign = await this.campaigns.findById(id);
    if (!campaign) throw AppException.notFound(`No newsletter campaign with id "${id}"`);
    return campaign;
  }

  private toSummary(row: NewsletterCampaignRow): CampaignSummary {
    return {
      id: row.id,
      issueId: row.issueId,
      status: row.status,
      recipientCount: row.recipientCount,
      processedCount: row.processedCount,
      sentCount: row.sentCount,
      deliveredCount: row.deliveredCount,
      failedCount: row.failedCount,
      bouncedCount: row.bouncedCount,
      complainedCount: row.complainedCount,
      unsubscribedCount: row.unsubscribedCount,
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
