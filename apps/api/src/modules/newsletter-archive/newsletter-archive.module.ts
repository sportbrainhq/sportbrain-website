import { Module } from '@nestjs/common';
import { NewsletterIssueModule } from '../newsletter-issues/newsletter-issue.module';
import { NewsletterArchiveController } from './newsletter-archive.controller';
import { NewsletterArchiveService } from './newsletter-archive.service';

/**
 * The public archive (Phase D7) — a thin module: no schema, no repository
 * of its own. Imports `NewsletterIssueModule` (D2/D4) for
 * `NewsletterIssueRepository` (the new `findPublishedBySlug`/
 * `listPublished` methods live there — see that repository file's own
 * comments) and `NewsletterIssueRenderService` (the shared render path).
 * Kept as its own module rather than adding this controller to
 * `NewsletterIssueModule` directly, so the public/no-auth surface and the
 * editor/admin surface remain visibly separate module boundaries, the same
 * reasoning `NewsletterWebhookModule` documents for staying out of
 * `NewsletterDeliveryModule`.
 */
@Module({
  imports: [NewsletterIssueModule],
  controllers: [NewsletterArchiveController],
  providers: [NewsletterArchiveService],
})
export class NewsletterArchiveModule {}
