import { describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import type { NewsletterIssueRepository } from '../newsletter-issues/newsletter-issue.repository';
import type { QueueService } from '../../queue/queue.service';
import type { NewsletterCampaignRepository } from './newsletter-campaign.repository';
import type { NewsletterRecipientRepository } from './newsletter-recipient.repository';
import { NewsletterIssueSchedulerJob } from './newsletter-issue-scheduler.job';

/**
 * Mirrors `news-scheduler.job.spec.ts`'s approach exactly: this job's SQL
 * predicates (`findDueForSending`, the status-guarded `claimForSending`)
 * cannot be meaningfully unit-tested without a live database, so this tests
 * the job's own orchestration logic against mocked repositories/queue — in
 * particular the concurrency-safety property the whole job depends on:
 * `claimForSending` returning null must be treated as "someone else already
 * has it", never retried or errored.
 */
describe('NewsletterIssueSchedulerJob', () => {
  function dueIssue(id: string) {
    return { id, slug: `issue-${id}` } as Awaited<
      ReturnType<NewsletterIssueRepository['findDueForSending']>
    >[number];
  }

  function makeConfig(batchSize = 200): ConfigService<AppConfig, true> {
    return {
      get: vi.fn().mockReturnValue({ delivery: { batchSize } }),
    } as unknown as ConfigService<AppConfig, true>;
  }

  it('claims a due issue, snapshots recipients, and enqueues one batch per NEWSLETTER_BATCH_SIZE chunk', async () => {
    const issues = {
      findDueForSending: vi.fn().mockResolvedValue([dueIssue('a')]),
      claimForSending: vi.fn().mockResolvedValue({ id: 'a', slug: 'issue-a' }),
      publishIfUnset: vi.fn().mockResolvedValue({ id: 'a' }),
    } as unknown as NewsletterIssueRepository;
    const campaigns = {
      create: vi.fn().mockResolvedValue({ id: 'campaign-1', issueId: 'a' }),
      setRecipientCount: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignRepository;
    const recipients = {
      createRecipientSnapshot: vi.fn().mockResolvedValue(450),
    } as unknown as NewsletterRecipientRepository;
    const queue = {
      enqueueNewsletterDelivery: vi.fn().mockResolvedValue(undefined),
    } as unknown as QueueService;

    const job = new NewsletterIssueSchedulerJob(
      issues,
      campaigns,
      recipients,
      queue,
      makeConfig(200),
    );
    await job.run();

    expect(issues.claimForSending).toHaveBeenCalledWith('a');
    expect(campaigns.create).toHaveBeenCalledWith('a', 0);
    expect(recipients.createRecipientSnapshot).toHaveBeenCalledWith('campaign-1');
    expect(campaigns.setRecipientCount).toHaveBeenCalledWith('campaign-1', 450);
    expect(campaigns.updateStatus).toHaveBeenCalledWith('campaign-1', 'SENDING');
    // D7: the issue is published the moment its campaign begins SENDING.
    expect(issues.publishIfUnset).toHaveBeenCalledWith('a');
    // 450 recipients / 200 batch size = 3 batches (200, 200, 50).
    expect(queue.enqueueNewsletterDelivery).toHaveBeenCalledTimes(3);
    expect(queue.enqueueNewsletterDelivery).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
      batchIndex: 0,
    });
    expect(queue.enqueueNewsletterDelivery).toHaveBeenCalledWith({
      campaignId: 'campaign-1',
      batchIndex: 2,
    });
  });

  it('does nothing when a due issue is already claimed by another runner (concurrent scheduler execution creates only one campaign)', async () => {
    const issues = {
      findDueForSending: vi.fn().mockResolvedValue([dueIssue('a')]),
      // Simulates a concurrent runner having already won the status-guarded
      // claim — this runner must not create a campaign at all.
      claimForSending: vi.fn().mockResolvedValue(null),
    } as unknown as NewsletterIssueRepository;
    const campaigns = {
      create: vi.fn(),
      setRecipientCount: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as NewsletterCampaignRepository;
    const recipients = {
      createRecipientSnapshot: vi.fn(),
    } as unknown as NewsletterRecipientRepository;
    const queue = { enqueueNewsletterDelivery: vi.fn() } as unknown as QueueService;

    const job = new NewsletterIssueSchedulerJob(issues, campaigns, recipients, queue, makeConfig());
    await job.run();

    expect(campaigns.create).not.toHaveBeenCalled();
    expect(recipients.createRecipientSnapshot).not.toHaveBeenCalled();
    expect(queue.enqueueNewsletterDelivery).not.toHaveBeenCalled();
  });

  it('continues to the next due issue when one issue fails to start', async () => {
    const issues = {
      findDueForSending: vi.fn().mockResolvedValue([dueIssue('a'), dueIssue('b')]),
      claimForSending: vi
        .fn()
        .mockRejectedValueOnce(new Error('db blip'))
        .mockResolvedValueOnce({ id: 'b', slug: 'issue-b' }),
      publishIfUnset: vi.fn().mockResolvedValue({ id: 'b' }),
    } as unknown as NewsletterIssueRepository;
    const campaigns = {
      create: vi.fn().mockResolvedValue({ id: 'campaign-b', issueId: 'b' }),
      setRecipientCount: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignRepository;
    const recipients = {
      createRecipientSnapshot: vi.fn().mockResolvedValue(0),
    } as unknown as NewsletterRecipientRepository;
    const queue = {
      enqueueNewsletterDelivery: vi.fn().mockResolvedValue(undefined),
    } as unknown as QueueService;

    const job = new NewsletterIssueSchedulerJob(issues, campaigns, recipients, queue, makeConfig());
    await expect(job.run()).resolves.toBeUndefined();

    expect(campaigns.create).toHaveBeenCalledTimes(1);
    expect(campaigns.create).toHaveBeenCalledWith('b', 0);
  });

  it('does not throw when the due-issues query itself fails', async () => {
    const issues = {
      findDueForSending: vi.fn().mockRejectedValue(new Error('db down')),
      claimForSending: vi.fn(),
    } as unknown as NewsletterIssueRepository;
    const campaigns = {} as unknown as NewsletterCampaignRepository;
    const recipients = {} as unknown as NewsletterRecipientRepository;
    const queue = { enqueueNewsletterDelivery: vi.fn() } as unknown as QueueService;

    const job = new NewsletterIssueSchedulerJob(issues, campaigns, recipients, queue, makeConfig());
    await expect(job.run()).resolves.toBeUndefined();
    expect(issues.claimForSending).not.toHaveBeenCalled();
  });
});
