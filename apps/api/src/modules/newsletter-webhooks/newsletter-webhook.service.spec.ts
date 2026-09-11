import { describe, expect, it, vi } from 'vitest';
import type { NewsletterWebhookEvent } from '@sportbrain/contracts';
import type { NewsletterRepository } from '../newsletter/newsletter.repository';
import type { NewsletterCampaignService } from '../newsletter-delivery/newsletter-campaign.service';
import type {
  NewsletterRecipientRepository,
  NewsletterRecipientRow,
} from '../newsletter-delivery/newsletter-recipient.repository';
import { NewsletterWebhookService } from './newsletter-webhook.service';

function recipientRow(overrides: Partial<NewsletterRecipientRow> = {}): NewsletterRecipientRow {
  return {
    id: 'recipient-1',
    campaignId: 'campaign-1',
    subscriptionId: 'subscription-1',
    userId: null,
    email: 'reader@example.com',
    status: 'SENT',
    providerMessageId: 'stub_abc',
    attemptCount: 1,
    lastAttemptAt: new Date('2026-09-07T08:00:00.000Z'),
    sentAt: new Date('2026-09-07T08:00:00.000Z'),
    deliveredAt: null,
    failedAt: null,
    failureReason: null,
    createdAt: new Date('2026-09-07T08:00:00.000Z'),
    updatedAt: new Date('2026-09-07T08:00:00.000Z'),
    ...overrides,
  } as NewsletterRecipientRow;
}

function event(overrides: Partial<NewsletterWebhookEvent> = {}): NewsletterWebhookEvent {
  return {
    type: 'delivered',
    providerMessageId: 'stub_abc',
    timestamp: '2026-09-07T08:05:00.000Z',
    ...overrides,
  };
}

describe('NewsletterWebhookService', () => {
  it('does not throw and reports matched:false for an unknown providerMessageId', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(null),
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {} as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn(),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    const result = await service.handleEvent('generic', event({ providerMessageId: 'unknown' }));

    expect(result).toEqual({ received: true, matched: false });
    expect(campaigns.recomputeCampaignCounters).not.toHaveBeenCalled();
  });

  it('marks a recipient DELIVERED and recomputes campaign counters on a "delivered" event', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(recipientRow()),
      markRecipientDelivered: vi.fn().mockResolvedValue(true),
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {} as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    const result = await service.handleEvent('generic', event({ type: 'delivered' }));

    expect(recipients.markRecipientDelivered).toHaveBeenCalledWith('recipient-1');
    expect(campaigns.recomputeCampaignCounters).toHaveBeenCalledWith('campaign-1');
    expect(result).toEqual({ received: true, matched: true });
  });

  it('is idempotent: a duplicate "delivered" event for an already-DELIVERED recipient does not recompute counters again', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(recipientRow({ status: 'DELIVERED' })),
      markRecipientDelivered: vi.fn().mockResolvedValue(false), // status guard: already DELIVERED, no row changed
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {} as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    await service.handleEvent('generic', event({ type: 'delivered' }));

    expect(campaigns.recomputeCampaignCounters).not.toHaveBeenCalled();
  });

  it('suppresses the subscription on a "bounced" event and marks the recipient BOUNCED', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(recipientRow()),
      markRecipientBouncedOrComplained: vi.fn().mockResolvedValue(true),
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {
      suppress: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    await service.handleEvent('generic', event({ type: 'bounced' }));

    expect(recipients.markRecipientBouncedOrComplained).toHaveBeenCalledWith(
      'recipient-1',
      'BOUNCED',
      expect.any(String),
    );
    expect(subscriptions.suppress).toHaveBeenCalledWith('subscription-1', 'BOUNCED');
    expect(campaigns.recomputeCampaignCounters).toHaveBeenCalledWith('campaign-1');
  });

  it('suppresses the subscription on a "complained" event, distinct from bounce', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(recipientRow()),
      markRecipientBouncedOrComplained: vi.fn().mockResolvedValue(true),
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {
      suppress: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    await service.handleEvent('generic', event({ type: 'complained' }));

    expect(subscriptions.suppress).toHaveBeenCalledWith('subscription-1', 'COMPLAINED');
  });

  it('still suppresses the subscription even if the recipient row was already terminal (duplicate bounce webhook)', async () => {
    const recipients = {
      findByProviderMessageId: vi.fn().mockResolvedValue(recipientRow({ status: 'BOUNCED' })),
      markRecipientBouncedOrComplained: vi.fn().mockResolvedValue(false),
    } as unknown as NewsletterRecipientRepository;
    const subscriptions = {
      suppress: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterRepository;
    const campaigns = {
      recomputeCampaignCounters: vi.fn().mockResolvedValue(undefined),
    } as unknown as NewsletterCampaignService;

    const service = new NewsletterWebhookService(recipients, subscriptions, campaigns);
    await service.handleEvent('generic', event({ type: 'bounced' }));

    expect(subscriptions.suppress).toHaveBeenCalledWith('subscription-1', 'BOUNCED');
    // No row change reported by the recipient guard -> counters not recomputed again.
    expect(campaigns.recomputeCampaignCounters).not.toHaveBeenCalled();
  });
});
