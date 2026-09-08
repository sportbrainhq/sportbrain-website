import { Injectable, Logger } from '@nestjs/common';
import type { NewsletterWebhookAckResponse, NewsletterWebhookEvent } from '@sportbrain/contracts';
import { NewsletterRepository } from '../newsletter/newsletter.repository';
import { NewsletterCampaignService } from '../newsletter-delivery/newsletter-campaign.service';
import { NewsletterRecipientRepository } from '../newsletter-delivery/newsletter-recipient.repository';

/**
 * Delivery-provider webhook event handling (Phase D6).
 *
 * IDEMPOTENCY: no separate dedup table. Every write this service makes is
 * itself status-guarded (`markRecipientDelivered`'s `WHERE status = 'SENT'`,
 * `markRecipientBouncedOrComplained`'s guard against re-suppressing an
 * already-terminal row) — see those repository methods' own comments. A
 * webhook redelivering the same event twice (which every real provider's
 * "at least once" delivery guarantee implies will happen) re-runs the same
 * guarded update, which is either the original write or a no-op, never a
 * double-count. `NewsletterCampaignService.recomputeCampaignCounters` is
 * only invoked when the guarded write actually changed something, so a
 * duplicate event does not even reach the aggregate query.
 *
 * UNKNOWN `providerMessageId`: logged and ignored, never thrown. A webhook
 * about a message id this system has no record of (an id from before this
 * system existed, a test event, a provider-side artifact) must not surface
 * as a 500 — the provider would interpret that as "retry me", and there is
 * nothing a retry would fix.
 *
 * COUNTER STRATEGY: recomputes the whole campaign's counters via
 * `recomputeCampaignCounters` rather than an incremental increment. Chosen
 * over an incremental path because campaign counters must already be
 * internally consistent with each other (see
 * `NewsletterCampaignRepository.updateCounters`'s own comment — "all counters
 * written together, from one aggregate query"), and a webhook is
 * comparatively low-volume (one event per recipient per lifecycle
 * transition, not a hot path like the delivery worker's per-batch loop) —
 * the correctness of "always re-derive from source of truth" is worth more
 * here than the write savings an incremental counter would buy.
 */
@Injectable()
export class NewsletterWebhookService {
  private readonly logger = new Logger(NewsletterWebhookService.name);

  constructor(
    private readonly recipients: NewsletterRecipientRepository,
    private readonly subscriptions: NewsletterRepository,
    private readonly campaigns: NewsletterCampaignService,
  ) {}

  async handleEvent(
    provider: string,
    event: NewsletterWebhookEvent,
  ): Promise<NewsletterWebhookAckResponse> {
    const recipient = await this.recipients.findByProviderMessageId(event.providerMessageId);

    if (!recipient) {
      this.logger.warn(
        `Ignoring "${event.type}" webhook from provider "${provider}": ` +
          `no newsletter_recipient with providerMessageId "${event.providerMessageId}".`,
      );
      return { received: true, matched: false };
    }

    switch (event.type) {
      case 'delivered':
        await this.handleDelivered(recipient.id, recipient.campaignId);
        break;
      case 'bounced':
        await this.handleSuppression(
          recipient.id,
          recipient.campaignId,
          recipient.subscriptionId,
          'BOUNCED',
        );
        break;
      case 'complained':
        await this.handleSuppression(
          recipient.id,
          recipient.campaignId,
          recipient.subscriptionId,
          'COMPLAINED',
        );
        break;
    }

    return { received: true, matched: true };
  }

  private async handleDelivered(recipientId: string, campaignId: string): Promise<void> {
    const changed = await this.recipients.markRecipientDelivered(recipientId);
    if (changed) await this.campaigns.recomputeCampaignCounters(campaignId);
  }

  /**
   * Shared bounce/complaint path: marks the recipient row terminal, then
   * permanently suppresses the underlying subscription (org spec section
   * 43) so no future campaign's recipient snapshot ever includes it again
   * (`createRecipientSnapshot` only selects `status = 'SUBSCRIBED'` — see
   * that repository method and its accompanying test locking this in).
   * Suppression is applied even when the recipient-row write was a no-op
   * (already terminal) — `NewsletterRepository.suppress` has no status
   * guard of its own (see that method's comment for why re-applying the
   * same suppression is harmless), so this stays correct even if a prior
   * webhook delivery already did it.
   */
  private async handleSuppression(
    recipientId: string,
    campaignId: string,
    subscriptionId: string,
    status: 'BOUNCED' | 'COMPLAINED',
  ): Promise<void> {
    const reason =
      status === 'BOUNCED'
        ? 'Hard bounce reported by provider webhook'
        : 'Spam complaint reported by provider webhook';

    const changed = await this.recipients.markRecipientBouncedOrComplained(
      recipientId,
      status,
      reason,
    );
    await this.subscriptions.suppress(subscriptionId, status);
    if (changed) await this.campaigns.recomputeCampaignCounters(campaignId);
  }
}
