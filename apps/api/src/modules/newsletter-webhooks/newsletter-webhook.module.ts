import { Module } from '@nestjs/common';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { NewsletterDeliveryModule } from '../newsletter-delivery/newsletter-delivery.module';
import { NewsletterWebhookController } from './newsletter-webhook.controller';
import { NewsletterWebhookGuard } from './newsletter-webhook.guard';
import { NewsletterWebhookService } from './newsletter-webhook.service';

/**
 * Delivery-provider webhook intake (Phase D6): a small, separate module
 * rather than folding into `NewsletterDeliveryModule` (D5).
 *
 * Kept separate because the two have a materially different security
 * posture and audience: D5's `NewsletterDeliveryController` is
 * `SessionGuard`+`RolesGuard`-protected admin surface, while this
 * controller is an unauthenticated-by-session, signature-verified,
 * service-to-service surface (mirrors why `/internal/news/*` — see
 * `InternalApiKeyGuard` — is its own thing rather than folded into an
 * admin-facing news controller). A reviewer scanning this module's guards
 * should see one story, not "admin auth, except this one route".
 *
 * Imports `NewsletterDeliveryModule` for `NewsletterRecipientRepository` and
 * `NewsletterCampaignService`, and `NewsletterModule` for
 * `NewsletterRepository` (the subscription-suppression write) — this module
 * writes into both D1's and D5's tables but owns neither.
 */
@Module({
  imports: [NewsletterModule, NewsletterDeliveryModule],
  controllers: [NewsletterWebhookController],
  providers: [NewsletterWebhookService, NewsletterWebhookGuard],
})
export class NewsletterWebhookModule {}
