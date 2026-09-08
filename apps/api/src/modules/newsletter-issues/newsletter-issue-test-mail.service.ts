import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NewsletterIssueDetail, RenderedIssue } from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import { NewsletterEmailProvider } from './newsletter-email-provider';
import { buildIssueEmailHtml } from './templates/issue-email.template';

/**
 * `POST /admin/newsletter/issues/:id/test` (Phase D4).
 *
 * Deliberately its own tiny service rather than a method on
 * `NewsletterIssueService`: a test send touches the email
 * template/provider, neither of which the D2 service otherwise depends on,
 * and keeping it separate means `NewsletterIssueService` stays exactly what
 * its own header says it is (CREATE/EDIT/VALIDATE/READY domain logic, no
 * I/O beyond the repository).
 *
 * Never creates a `NewsletterRecipient`/campaign row — see the controller's
 * own doc comment for why: this is a rendering/deliverability check, not a
 * real send.
 */
@Injectable()
export class NewsletterIssueTestMailService {
  constructor(
    private readonly provider: NewsletterEmailProvider,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async sendTest(
    issue: Pick<NewsletterIssueDetail, 'slug' | 'subject'>,
    rendered: RenderedIssue,
    toEmail: string,
  ): Promise<void> {
    const html = buildIssueEmailHtml(rendered, {
      // A dummy token: no subscription backs a test send, so this can never
      // match a real `newsletter_subscription.unsubscribeToken` row — see
      // the controller's doc comment on why that is the correct behaviour,
      // not a bug to fix.
      unsubscribeToken: `test-${randomBytes(12).toString('hex')}`,
      frontendUrl: this.config.get('auth.frontendUrl', { infer: true }),
      issueSlug: issue.slug,
    });

    await this.provider.send({
      to: toEmail,
      subject: `TEST — ${issue.subject}`,
      html,
      tag: 'newsletter-issue-test',
    });
  }
}
