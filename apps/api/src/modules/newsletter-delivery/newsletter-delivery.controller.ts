import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  scheduleIssueRequestSchema,
  type CampaignSummary,
  type IssueAnalytics,
  type NewsletterIssueDetail,
  type ScheduleIssueRequest,
  type SubscriberAnalytics,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { NewsletterService } from '../newsletter/newsletter.service';
import { NewsletterIssueService } from '../newsletter-issues/newsletter-issue.service';
import { NewsletterCampaignService } from './newsletter-campaign.service';

/**
 * Scheduling + delivery administration (Phase D5).
 *
 * `admin` only, not `editor` — deliberately narrower than
 * `NewsletterIssueController`'s `@Roles('editor', 'admin')`. The org spec
 * calls this out specifically: an editor may write and validate an issue,
 * but committing it to an actual send (or retrying a failed one) is an
 * admin-only action, since it is the one action in this whole domain that
 * cannot be undone once recipients start receiving mail.
 *
 * Mounted at `admin/newsletter`, a sibling of
 * `admin/newsletter/issues` (D2) rather than nested under it, because
 * `GET :id/campaign` and `POST campaigns/:id/retry-failed` address two
 * different resources (an issue's schedule, and a campaign itself) that
 * don't share one natural parent path.
 */
@ApiTags('admin-newsletter-delivery')
@Controller('admin/newsletter')
@UseGuards(SessionGuard, RolesGuard)
@Roles('admin')
export class NewsletterDeliveryController {
  constructor(
    private readonly issueService: NewsletterIssueService,
    private readonly campaignService: NewsletterCampaignService,
    private readonly newsletterService: NewsletterService,
  ) {}

  /**
   * Site-wide subscriber analytics (Phase D6, org spec section 45/46).
   * Declared before `issues/:id/...` routes for the same "static before
   * dynamic" reason `NewsletterIssueController` orders `questions/search`
   * before `:id` — `analytics` here has no `:id` sibling to collide with in
   * this controller, but keeping every static top-level route grouped above
   * the `:id`-scoped ones is the established convention in this domain.
   */
  @Get('analytics')
  @ApiOperation({ summary: 'Site-wide subscriber analytics: totals, new this week, by source' })
  async subscriberAnalytics(): Promise<{ data: SubscriberAnalytics }> {
    return { data: await this.newsletterService.getSubscriberAnalytics() };
  }

  @Post('issues/:id/schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Schedule a READY issue to send at a given instant' })
  async schedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodPipe(scheduleIssueRequestSchema)) body: ScheduleIssueRequest,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.issueService.scheduleIssue(id, body) };
  }

  @Post('issues/:id/cancel-schedule')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a SCHEDULED issue, returning it to READY' })
  async cancelSchedule(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.issueService.cancelSchedule(id) };
  }

  @Get('issues/:id/campaign')
  @ApiOperation({ summary: "Read an issue's most recent send campaign and its counters" })
  async campaign(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: CampaignSummary }> {
    return { data: await this.campaignService.getCampaignForIssue(id) };
  }

  /**
   * Analytics-flavoured read of one issue's delivery health (Phase D6, org
   * spec section 45/46) — a distinct, differently-shaped sibling of
   * `GET .../campaign` (D5's delivery-ops view) rather than an extension of
   * it, see `NewsletterCampaignService.getIssueAnalytics`'s own comment for
   * why. Top-links/click-through data is out of scope
   * (`topLinksAvailable: false` in the response) — no click-tracking
   * infrastructure exists yet.
   */
  @Get('issues/:id/analytics')
  @ApiOperation({ summary: "An issue's delivery analytics (recipients/sent/delivered/bounced)" })
  async issueAnalytics(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: IssueAnalytics }> {
    return { data: await this.campaignService.getIssueAnalytics(id) };
  }

  @Post('campaigns/:id/retry-failed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Re-enqueue every FAILED recipient still under the attempt cap' })
  async retryFailed(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ data: { retryCount: number } }> {
    return { data: await this.campaignService.retryFailed(id) };
  }
}
