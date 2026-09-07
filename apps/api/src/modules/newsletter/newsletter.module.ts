import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { NewsletterMailerService } from './newsletter-mailer.service';
import { NewsletterMeController } from './newsletter-me.controller';
import { NewsletterController } from './newsletter.controller';
import { NewsletterRepository } from './newsletter.repository';
import { NewsletterService } from './newsletter.service';

/**
 * The Monday Brief: subscription foundation only (Phase D1).
 *
 * Imports `AuthModule` for `SessionGuard`/`AuthRepository`, used by
 * `NewsletterMeController` to gate `me/newsletter/*` and to read the
 * signed-in user's own email for `POST /me/newsletter/subscribe`.
 *
 * Exports `NewsletterService` (Phase D2 onward): the newsletter-issues
 * module's admin dashboard reads `countActiveSubscribers()` from it rather
 * than duplicating a subscription-count query.
 */
@Module({
  imports: [AuthModule],
  controllers: [NewsletterController, NewsletterMeController],
  providers: [NewsletterService, NewsletterRepository, NewsletterMailerService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
