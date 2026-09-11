import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { NewsletterIssueModule } from '../newsletter-issues/newsletter-issue.module';
import { NewsletterCampaignRepository } from './newsletter-campaign.repository';
import { NewsletterCampaignService } from './newsletter-campaign.service';
import { NewsletterDeliveryController } from './newsletter-delivery.controller';
import { NewsletterDeliveryWorker } from './newsletter-delivery.worker';
import { NewsletterRecipientRepository } from './newsletter-recipient.repository';

/**
 * Scheduling + delivery (Phase D5): `newsletter_campaign`/`newsletter_recipient`,
 * the BullMQ delivery worker, and their one admin controller.
 *
 * `NewsletterIssueSchedulerJob` is NOT registered here even though it lives
 * in this same directory — it is a `@Cron` job, and every scheduled job in
 * this codebase is registered by `JobsModule.register()` behind
 * `JOBS_ENABLED`, exactly like `NewsSchedulerJob` (see that job's own header
 * and `jobs.module.ts`'s "multi-replica problem" doc). Splitting "where the
 * class lives" from "where it's registered" would be confusing precedent, so
 * `NewsletterIssueSchedulerJob` is exported here for `JobsModule` to import
 * and register, rather than this module registering it directly and
 * bypassing the `JOBS_ENABLED` gate every other cron in this codebase
 * respects.
 *
 * Imports `NewsletterIssueModule` (D2/D4) for `NewsletterIssueRepository`
 * (status transitions on `newsletter_issue`), `NewsletterIssueService`
 * (`scheduleIssue`/`cancelSchedule`), `NewsletterIssueRenderService` (the
 * worker renders the same view model the preview/test-email paths use) and
 * `NewsletterEmailProvider` (the worker sends through the same
 * stub/eventually-real provider). Imports `NewsletterModule` (D1) for
 * `NewsletterRepository` — the worker's final per-recipient suppression
 * check reads live subscription status.
 *
 * Exports `NewsletterCampaignRepository`/`NewsletterRecipientRepository`,
 * consumed by `NewsletterIssueSchedulerJob` from `JobsModule`.
 *
 * `NewsletterDeliveryWorker` is registered here rather than in the
 * (`@Global`) `QueueModule` — unlike `NewsProcessWorker`, whose dependencies
 * are all news-engine services already registered in `QueueModule` itself,
 * this worker depends on services scattered across `NewsletterModule` and
 * `NewsletterIssueModule`; constructing it here, where those are already
 * imported, avoids re-importing them a second time into the global queue
 * module purely for one worker.
 */
@Module({
  imports: [AuthModule, NewsletterModule, NewsletterIssueModule],
  controllers: [NewsletterDeliveryController],
  providers: [
    NewsletterCampaignRepository,
    NewsletterRecipientRepository,
    NewsletterCampaignService,
    NewsletterDeliveryWorker,
  ],
  exports: [NewsletterCampaignRepository, NewsletterRecipientRepository, NewsletterCampaignService],
})
export class NewsletterDeliveryModule {}
