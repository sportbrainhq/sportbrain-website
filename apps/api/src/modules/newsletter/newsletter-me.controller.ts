import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  updateNewsletterPreferencesSchema,
  type NewsletterSubscriptionSummary,
  type NewsletterTokenActionResponse,
  type SubscribeResponse,
  type UpdateNewsletterPreferencesRequest,
} from '@sportbrain/contracts';
import { AppException, CurrentUser, type AuthenticatedUser, zodPipe } from '../../common';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthRepository } from '../auth/auth.repository';
import { NewsletterService } from './newsletter.service';

/**
 * Authenticated surface, mounted at `me/newsletter`: a signed-in reader's own
 * subscription. Every route requires `SessionGuard`, so `@CurrentUser()` is
 * always populated — there is no anonymous path through this controller.
 *
 * Kept separate from `NewsletterController` rather than one controller with
 * mixed guarding, matching how `ContactController`/`ContactAdminController`
 * split public vs. gated surfaces into two files: the route list on each
 * controller then tells you its auth requirement at a glance, with nothing
 * to check per-method.
 */
@ApiTags('newsletter')
@Controller('me/newsletter')
@UseGuards(SessionGuard)
export class NewsletterMeController {
  constructor(
    private readonly service: NewsletterService,
    private readonly authRepository: AuthRepository,
  ) {}

  @Get()
  @ApiOperation({ summary: "The current user's newsletter subscription, or null" })
  @ApiOkResponse({ description: 'null when the account has never subscribed' })
  async getMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsletterSubscriptionSummary | null> {
    return this.service.getMyStatus(user.id);
  }

  /**
   * Subscribes (or reconciles) using the account's own verified email
   * address — never a client-supplied address, so this endpoint cannot be
   * used to subscribe someone else's inbox under a signed-in session.
   */
  @Post('subscribe')
  @ApiOperation({ summary: "Subscribe the current user's account email" })
  @ApiOkResponse({ description: 'Idempotent-safe, same shape as the public subscribe endpoint' })
  async subscribeMine(@CurrentUser() user: AuthenticatedUser): Promise<SubscribeResponse> {
    const fullUser = await this.authRepository.findUserById(user.id);
    if (!fullUser) throw AppException.unauthorized('Sign in to continue.');

    return this.service.subscribeSelf(fullUser.email, { source: 'PROFILE' }, user.id);
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: "Unsubscribe the current user's own subscription" })
  @ApiOkResponse({ description: "{status: 'unsubscribed'|'invalid_token'}" })
  async unsubscribeMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NewsletterTokenActionResponse> {
    return this.service.unsubscribeSelf(user.id);
  }

  @Patch('preferences')
  @ApiOperation({ summary: "Update the current user's mailing preferences" })
  @ApiOkResponse({ description: 'The updated subscription summary' })
  async updateMyPreferences(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updateNewsletterPreferencesSchema)) body: UpdateNewsletterPreferencesRequest,
  ): Promise<NewsletterSubscriptionSummary> {
    return this.service.updateMyPreferences(user.id, body);
  }
}
