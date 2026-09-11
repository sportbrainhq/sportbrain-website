import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';

/**
 * Sends the two emails a newsletter subscription can trigger: a
 * double-opt-in confirmation link, and a welcome email once a subscription
 * is active.
 *
 * No real provider is wired up yet — this repo has no mailer/SMTP dependency
 * anywhere (`resend` is referenced in comments as the intended future
 * provider but is not an installed dependency). Rather than adding one
 * speculatively, this logs what would be sent at `log` level, mirroring
 * `ContactMailerService`'s stub-email convention exactly. Swap the two
 * `send*` method bodies for a real provider call when one is chosen; the
 * call sites in `NewsletterService` do not change.
 *
 * A send failure here must never fail an otherwise-successful subscribe/
 * confirm/unsubscribe write — see the try/catch at each call site in
 * `NewsletterService`.
 */
@Injectable()
export class NewsletterMailerService {
  private readonly logger = new Logger(NewsletterMailerService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async sendConfirmationEmail(email: string, confirmToken: string): Promise<void> {
    const confirmUrl = this.buildLink(`/newsletter/confirm/${confirmToken}`);
    const fromEmail = this.config.get('newsletter.fromEmail', { infer: true });

    this.logger.log(
      `[stub email, no RESEND_API_KEY] To: ${email} | From: ${fromEmail} | ` +
        `Subject: "Confirm your subscription to The Monday Brief" | ` +
        `Body: Click to confirm your subscription: ${confirmUrl}`,
    );
  }

  async sendWelcomeEmail(email: string, unsubscribeToken: string): Promise<void> {
    const unsubscribeUrl = this.buildLink(`/newsletter/unsubscribe/${unsubscribeToken}`);
    const fromEmail = this.config.get('newsletter.fromEmail', { infer: true });

    this.logger.log(
      `[stub email, no RESEND_API_KEY] To: ${email} | From: ${fromEmail} | ` +
        `Subject: "You're in — welcome to The Monday Brief" | ` +
        `Body: Every Monday. No spam. Unsubscribe anytime: ${unsubscribeUrl}`,
    );
  }

  /** Builds an absolute web-app link. Reuses `FRONTEND_URL`: the only validated "web app origin" this config tree has. */
  private buildLink(path: string): string {
    const frontendUrl = this.config.get('auth.frontendUrl', { infer: true });
    return `${frontendUrl}${path}`;
  }
}
