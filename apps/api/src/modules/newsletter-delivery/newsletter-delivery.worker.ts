import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker, type Job } from 'bullmq';
import type { AppConfig } from '../../config';
import { MetricsService } from '../../infrastructure/metrics/metrics.service';
import { NEWSLETTER_DELIVERY_QUEUE, type NewsletterDeliveryJobData } from '../../queue/queue.types';
import { QueueService } from '../../queue/queue.service';
import { NewsletterRepository } from '../newsletter/newsletter.repository';
import { NewsletterEmailProvider } from '../newsletter-issues/newsletter-email-provider';
import { NewsletterIssueRenderService } from '../newsletter-issues/newsletter-issue-render.service';
import { NewsletterIssueService } from '../newsletter-issues/newsletter-issue.service';
import { buildIssueEmailHtml } from '../newsletter-issues/templates/issue-email.template';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { NewsletterCampaignRepository } from './newsletter-campaign.repository';
import {
  NewsletterRecipientRepository,
  type NewsletterRecipientRow,
} from './newsletter-recipient.repository';

/**
 * Consumes `newsletter-delivery` jobs: sends real (stub-provider) email to
 * one batch's worth of PENDING recipients for a campaign (Phase D5). Mirrors
 * `NewsProcessWorker`'s shape (see that file's header) — this handler fails
 * the whole job only when the campaign/issue itself cannot be loaded;
 * per-recipient failures are caught and recorded (`markRecipientFailed`)
 * rather than failing the batch, exactly the same "one bad item does not
 * fail the batch" resilience `NewsProcessorService` already establishes for
 * News Engine articles.
 *
 * `NEWSLETTER_BATCH_SIZE` recipients per job: `findPendingRecipients` reads
 * the next batch off the campaign's still-PENDING rows every time this
 * handler runs, rather than the scheduler pre-assigning specific recipient
 * ids per batch — this means a `batchIndex` collision (two jobs racing for
 * "the same" logical batch, e.g. after a retry) just processes whatever is
 * still PENDING at that moment, which the recipient-level status guard
 * (`markRecipientSent`/`markRecipientFailed`, PENDING/FAILED-only `WHERE`)
 * makes safe either way.
 */
@Injectable()
export class NewsletterDeliveryWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NewsletterDeliveryWorker.name);
  private worker: Worker<NewsletterDeliveryJobData> | undefined;

  constructor(
    private readonly queueService: QueueService,
    private readonly campaigns: NewsletterCampaignRepository,
    private readonly campaignService: NewsletterCampaignService,
    private readonly recipients: NewsletterRecipientRepository,
    private readonly issueService: NewsletterIssueService,
    private readonly subscriptions: NewsletterRepository,
    private readonly render: NewsletterIssueRenderService,
    private readonly provider: NewsletterEmailProvider,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly metrics: MetricsService,
  ) {}

  onModuleInit(): void {
    const connection = this.queueService.getConnection();
    if (!this.queueService.enabled || !connection) {
      this.logger.warn('Queue disabled (no REDIS_URL): newsletter-delivery worker not started');
      return;
    }

    this.worker = new Worker<NewsletterDeliveryJobData>(
      NEWSLETTER_DELIVERY_QUEUE,
      async (job: Job<NewsletterDeliveryJobData>) => {
        await this.processBatch(job.data.campaignId);
      },
      { connection, concurrency: 1 },
    );

    this.worker.on('failed', (job, error) => {
      this.metrics.incrementCounter('queue_failure_total', { queue: NEWSLETTER_DELIVERY_QUEUE });
      this.logger.error(
        `newsletter-delivery job ${job?.id} failed (campaignId "${job?.data?.campaignId}"): ${error.message}`,
      );
    });

    this.logger.log('newsletter-delivery worker started');
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }

  private async processBatch(campaignId: string): Promise<void> {
    const campaign = await this.campaigns.findById(campaignId);
    if (!campaign) throw new Error(`newsletter_campaign "${campaignId}" not found`);

    // `getIssue` (not the raw repository) so `content` and every timestamp
    // arrive already coerced into the same DTO shape `NewsletterIssueRenderService`
    // expects — the same shape the preview/test-email paths render from.
    const issue = await this.issueService.getIssue(campaign.issueId);

    const batchSize = this.config.get('newsletter', { infer: true }).delivery.batchSize;
    const pending = await this.recipients.findPendingRecipients(campaignId, batchSize);

    const rendered = this.render.render(issue);
    const frontendUrl = this.config.get('auth.frontendUrl', { infer: true });

    for (const recipient of pending) {
      await this.sendOne(recipient, issue.slug, rendered, frontendUrl);
    }

    await this.campaignService.recomputeCampaignCounters(campaignId);
  }

  /**
   * Sends to one recipient. Re-checks the underlying subscription is still
   * `SUBSCRIBED` immediately before sending — the final suppression check:
   * a subscriber may have unsubscribed in the window between recipient
   * snapshot and this batch actually running, and mailing them anyway would
   * violate the whole point of "unsubscribe" being immediate. That recipient
   * is marked FAILED (not silently skipped and left PENDING forever, which
   * would never let the campaign reach `processedCount === recipientCount`).
   */
  private async sendOne(
    recipient: NewsletterRecipientRow,
    issueSlug: string,
    rendered: ReturnType<NewsletterIssueRenderService['render']>,
    frontendUrl: string,
  ): Promise<void> {
    try {
      const subscription = await this.subscriptions.findById(recipient.subscriptionId);
      if (!subscription || subscription.status !== 'SUBSCRIBED') {
        await this.recipients.markRecipientFailed(
          recipient.id,
          'Subscription no longer active at send time',
        );
        return;
      }

      const html = buildIssueEmailHtml(rendered, {
        unsubscribeToken: subscription.unsubscribeToken,
        frontendUrl,
        issueSlug,
      });

      const result = await this.provider.send({
        to: recipient.email,
        subject: rendered.subject,
        html,
        tag: 'newsletter-issue-send',
      });

      await this.recipients.markRecipientSent(recipient.id, result.providerMessageId);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to send newsletter_recipient ${recipient.id}: ${reason}`);
      await this.recipients.markRecipientFailed(recipient.id, reason.slice(0, 500));
    }
  }
}
