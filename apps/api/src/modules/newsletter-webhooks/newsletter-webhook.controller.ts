import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  newsletterWebhookEventSchema,
  type NewsletterWebhookAckResponse,
  type NewsletterWebhookEvent,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { NewsletterWebhookGuard } from './newsletter-webhook.guard';
import { NewsletterWebhookService } from './newsletter-webhook.service';

/**
 * Delivery-provider webhook intake (Phase D6).
 *
 * `:provider` is accepted but unused beyond logging in this phase — no real
 * provider is wired up yet (see `NewsletterWebhookGuard`'s header), so there
 * is exactly one normalization strategy (the request body IS the normalized
 * `NewsletterWebhookEvent` shape already). Once a real provider exists,
 * `:provider` becomes the dispatch key that picks which raw-payload adapter
 * runs before this controller's body even sees `NewsletterWebhookEvent` —
 * the route shape does not change.
 *
 * `NewsletterWebhookGuard` runs before the body is validated against the Zod
 * schema, so an unsigned/incorrectly-signed request is rejected before any
 * webhook processing — including before Nest even attempts to parse the
 * body against `newsletterWebhookEventSchema`.
 */
@ApiTags('newsletter-webhooks')
@Controller('webhooks/email')
@UseGuards(NewsletterWebhookGuard)
export class NewsletterWebhookController {
  constructor(private readonly service: NewsletterWebhookService) {}

  @Post(':provider')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Delivery-provider webhook intake (generic HMAC-signed placeholder; see NewsletterWebhookGuard)',
  })
  async handle(
    @Param('provider') provider: string,
    @Body(zodPipe(newsletterWebhookEventSchema)) event: NewsletterWebhookEvent,
  ): Promise<NewsletterWebhookAckResponse> {
    return this.service.handleEvent(provider, event);
  }
}
