import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentModule } from '../content/content.module';
import { NewsletterModule } from '../newsletter/newsletter.module';
import { QuestionsModule } from '../questions/questions.module';
import { NewsletterEmailProvider } from './newsletter-email-provider';
import { NewsletterIssueController } from './newsletter-issue.controller';
import { NewsletterIssueRenderService } from './newsletter-issue-render.service';
import { NewsletterIssueTestMailService } from './newsletter-issue-test-mail.service';
import { NewsletterIssueRepository } from './newsletter-issue.repository';
import { NewsletterIssueValidationService } from './newsletter-issue-validation.service';
import { NewsletterIssueService } from './newsletter-issue.service';
import { NewsletterLoggingEmailProvider } from './newsletter-logging-email-provider.service';

/**
 * The Monday Brief issue model (Phase D2): create/edit/validate/ready only.
 *
 * Separate from `NewsletterModule` (D1: subscription foundation) on purpose
 * — the two have different lifecycles and different audiences (public
 * anonymous subscribe vs. editor/admin issue authoring), and this module
 * deliberately does not import `NewsletterModule`: nothing here needs
 * subscription rows, and D1 must not gain a dependency in the other
 * direction just because both modules say "newsletter".
 *
 * Imports `QuestionsModule` and `ContentModule` to reuse their existing
 * list/search methods for the SportBrain Challenge and From SportBrainHQ
 * pickers, rather than duplicating their query logic here. Also imports
 * `NewsletterModule` (D1), but only to read `NewsletterService.
 * countActiveSubscribers()` for the admin dashboard's one real stat — this
 * module writes nothing into D1's tables.
 */
@Module({
  imports: [AuthModule, QuestionsModule, ContentModule, NewsletterModule],
  controllers: [NewsletterIssueController],
  providers: [
    NewsletterIssueService,
    NewsletterIssueRepository,
    NewsletterIssueValidationService,
    // Rendering (D4): one render service shared by preview and test-email.
    NewsletterIssueRenderService,
    NewsletterIssueTestMailService,
    // Bound to the interface so a real provider swap (see
    // `newsletter-email-provider.ts`) is a one-line change here, not a
    // rewrite of every injector.
    { provide: NewsletterEmailProvider, useClass: NewsletterLoggingEmailProvider },
  ],
  exports: [
    NewsletterIssueRepository,
    NewsletterIssueService,
    NewsletterIssueRenderService,
    NewsletterEmailProvider,
  ],
})
export class NewsletterIssueModule {}
