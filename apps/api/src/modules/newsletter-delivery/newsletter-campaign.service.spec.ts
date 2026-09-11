import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import type { NewsletterIssueRepository } from '../newsletter-issues/newsletter-issue.repository';
import type { QueueService } from '../../queue/queue.service';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import type {
  NewsletterCampaignRepository,
  NewsletterCampaignRow,
} from './newsletter-campaign.repository';
import type {
  NewsletterRecipientRepository,
  NewsletterRecipientRow,
} from './newsletter-recipient.repository';

function campaignRow(overrides: Partial<NewsletterCampaignRow> = {}): NewsletterCampaignRow {
  return {
    id: 'campaign-1',
    issueId: 'issue-1',
    status: 'SENDING',
    recipientCount: 10,
    processedCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    failedCount: 0,
    bouncedCount: 0,
    complainedCount: 0,
    unsubscribedCount: 0,
    startedAt: new Date('2026-09-07T08:00:00.000Z'),
    completedAt: null,
    createdAt: new Date('2026-09-07T08:00:00.000Z'),
    updatedAt: new Date('2026-09-07T08:00:00.000Z'),
    ...overrides,
  } as NewsletterCampaignRow;
}

function makeConfig(maxSendAttempts = 3): ConfigService<AppConfig, true> {
  return {
    get: vi.fn().mockReturnValue({ delivery: { maxSendAttempts, batchSize: 200 } }),
  } as unknown as ConfigService<AppConfig, true>;
}

describe('NewsletterCampaignService', () => {
  describe('retryFailed', () => {
    it('only retries FAILED recipients under the attempt cap, and enqueues one batch job', async () => {
      const campaigns = {
        findById: vi.fn().mockResolvedValue(campaignRow({ status: 'PARTIAL' })),
        updateStatus: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterCampaignRepository;
      const retryable = [{ id: 'r1' }, { id: 'r2' }] as NewsletterRecipientRow[];
      const recipients = {
        findRetryableFailed: vi.fn().mockResolvedValue(retryable),
      } as unknown as NewsletterRecipientRepository;
      const issues = {} as unknown as NewsletterIssueRepository;
      const queue = {
        enqueueNewsletterDelivery: vi.fn().mockResolvedValue(undefined),
      } as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(3),
      );

      const result = await service.retryFailed('campaign-1');

      expect(recipients.findRetryableFailed).toHaveBeenCalledWith('campaign-1', 3);
      expect(result.retryCount).toBe(2);
      expect(queue.enqueueNewsletterDelivery).toHaveBeenCalledTimes(1);
      expect(queue.enqueueNewsletterDelivery).toHaveBeenCalledWith(
        expect.objectContaining({ campaignId: 'campaign-1' }),
      );
      // A PARTIAL campaign moves back to SENDING once a retry is in flight.
      expect(campaigns.updateStatus).toHaveBeenCalledWith('campaign-1', 'SENDING');
    });

    it('does nothing (no enqueue) when there is nothing retryable', async () => {
      const campaigns = {
        findById: vi.fn().mockResolvedValue(campaignRow({ status: 'FAILED' })),
        updateStatus: vi.fn(),
      } as unknown as NewsletterCampaignRepository;
      const recipients = {
        findRetryableFailed: vi.fn().mockResolvedValue([]),
      } as unknown as NewsletterRecipientRepository;
      const issues = {} as unknown as NewsletterIssueRepository;
      const queue = { enqueueNewsletterDelivery: vi.fn() } as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(),
      );
      const result = await service.retryFailed('campaign-1');

      expect(result.retryCount).toBe(0);
      expect(queue.enqueueNewsletterDelivery).not.toHaveBeenCalled();
      expect(campaigns.updateStatus).not.toHaveBeenCalled();
    });
  });

  describe('recomputeCampaignCounters', () => {
    it('aggregates recipient statuses into campaign counters and stays SENDING while recipients remain PENDING', async () => {
      const campaigns = {
        findById: vi.fn().mockResolvedValue(campaignRow({ recipientCount: 10 })),
        updateCounters: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterCampaignRepository;
      const recipients = {
        countByStatus: vi.fn().mockResolvedValue({ SENT: 4, PENDING: 6 }),
      } as unknown as NewsletterRecipientRepository;
      const issues = { markSendOutcome: vi.fn() } as unknown as NewsletterIssueRepository;
      const queue = {} as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(),
      );
      await service.recomputeCampaignCounters('campaign-1');

      expect(campaigns.updateCounters).toHaveBeenCalledWith(
        'campaign-1',
        expect.objectContaining({
          processedCount: 4,
          sentCount: 4,
          status: 'SENDING',
          completedAt: null,
        }),
      );
      expect(issues.markSendOutcome).not.toHaveBeenCalled();
    });

    it('flips to COMPLETED and marks the issue SENT once every recipient is processed with no failures', async () => {
      const campaigns = {
        findById: vi
          .fn()
          .mockResolvedValue(campaignRow({ recipientCount: 10, issueId: 'issue-9' })),
        updateCounters: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterCampaignRepository;
      const recipients = {
        countByStatus: vi.fn().mockResolvedValue({ SENT: 10 }),
      } as unknown as NewsletterRecipientRepository;
      const issues = {
        markSendOutcome: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterIssueRepository;
      const queue = {} as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(),
      );
      await service.recomputeCampaignCounters('campaign-1');

      expect(campaigns.updateCounters).toHaveBeenCalledWith(
        'campaign-1',
        expect.objectContaining({ status: 'COMPLETED' }),
      );
      expect(issues.markSendOutcome).toHaveBeenCalledWith('issue-9', 'SENT');
    });

    it('flips to PARTIAL (issue still marked SENT) when some but not all recipients failed', async () => {
      const campaigns = {
        findById: vi.fn().mockResolvedValue(campaignRow({ recipientCount: 10 })),
        updateCounters: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterCampaignRepository;
      const recipients = {
        countByStatus: vi.fn().mockResolvedValue({ SENT: 7, FAILED: 3 }),
      } as unknown as NewsletterRecipientRepository;
      const issues = {
        markSendOutcome: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterIssueRepository;
      const queue = {} as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(),
      );
      await service.recomputeCampaignCounters('campaign-1');

      expect(campaigns.updateCounters).toHaveBeenCalledWith(
        'campaign-1',
        expect.objectContaining({ status: 'PARTIAL' }),
      );
      expect(issues.markSendOutcome).toHaveBeenCalledWith(expect.any(String), 'SENT');
    });

    it('flips to FAILED (issue marked FAILED) when every recipient failed', async () => {
      const campaigns = {
        findById: vi.fn().mockResolvedValue(campaignRow({ recipientCount: 5 })),
        updateCounters: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterCampaignRepository;
      const recipients = {
        countByStatus: vi.fn().mockResolvedValue({ FAILED: 5 }),
      } as unknown as NewsletterRecipientRepository;
      const issues = {
        markSendOutcome: vi.fn().mockResolvedValue(undefined),
      } as unknown as NewsletterIssueRepository;
      const queue = {} as unknown as QueueService;

      const service = new NewsletterCampaignService(
        campaigns,
        recipients,
        issues,
        queue,
        makeConfig(),
      );
      await service.recomputeCampaignCounters('campaign-1');

      expect(campaigns.updateCounters).toHaveBeenCalledWith(
        'campaign-1',
        expect.objectContaining({ status: 'FAILED' }),
      );
      expect(issues.markSendOutcome).toHaveBeenCalledWith(expect.any(String), 'FAILED');
    });
  });
});
