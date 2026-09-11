import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  subscribeRequestSchema,
  type NewsletterTokenActionResponse,
  type SubscribeRequest,
  type SubscribeResponse,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { NewsletterService } from './newsletter.service';

/**
 * Public, anonymous surface for The Monday Brief.
 *
 * No session is read here at all — see the task's own reasoning for keeping
 * this endpoint anonymous-only: this codebase has no established
 * "optional auth" precedent (`SessionGuard` either requires a session or
 * isn't applied), and inventing one just for this one route would be more
 * complexity than the feature needs. A signed-in reader who wants their
 * account linked to their subscription uses
 * `POST /me/newsletter/subscribe` instead (`NewsletterMeController`), which
 * already has a verified `userId` via `SessionGuard`.
 *
 * `@Throttle` mirrors `ContactController`'s pattern: tightened on top of the
 * global default because an unauthenticated write endpoint is a spam/abuse
 * surface. Limit mirrors `NEWSLETTER_RATE_LIMIT_*`'s defaults (5/60s);
 * `@Throttle` requires a compile-time value, so change both if the default
 * changes.
 */
@ApiTags('newsletter')
@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly service: NewsletterService) {}

  @Post('subscribe')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Subscribe an email address to The Monday Brief' })
  @ApiOkResponse({ description: 'Idempotent-safe: never errors for an already-subscribed address' })
  async subscribe(
    @Body(zodPipe(subscribeRequestSchema)) body: SubscribeRequest,
  ): Promise<SubscribeResponse> {
    return this.service.subscribe(body);
  }

  /**
   * `GET` rather than `POST`: this is the link mailed in the confirmation
   * email, and a mailto-safe link a reader clicks from their inbox must be a
   * plain `GET`. Returns JSON rather than redirecting, so the web app's own
   * `/newsletter/confirm/:token` page (not built by this endpoint) can call
   * it and render its own copy instead of trusting an API-side redirect
   * target.
   */
  @Get('confirm/:token')
  @ApiOperation({ summary: 'Confirm a double-opt-in subscription' })
  @ApiOkResponse({ description: "{status: 'confirmed'|'invalid_token'}" })
  async confirm(@Param('token') token: string): Promise<NewsletterTokenActionResponse> {
    return this.service.confirm(token);
  }

  @Post('unsubscribe/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe via the no-login link mailed with every send' })
  @ApiOkResponse({
    description: "Idempotent: {status: 'unsubscribed'} even if already unsubscribed",
  })
  async unsubscribe(@Param('token') token: string): Promise<NewsletterTokenActionResponse> {
    // An unknown/already-consumed token is not a client error worth a 4xx for
    // a link that may be clicked more than once from an old email — the
    // response body already carries `invalid_token` for the caller to act on.
    return this.service.unsubscribe(token);
  }
}
