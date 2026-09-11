import { randomUUID } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import {
  NewsletterEmailProvider,
  type SendEmailInput,
  type SendEmailResult,
} from './newsletter-email-provider';

/**
 * The only `NewsletterEmailProvider` implementation in this phase: logs what
 * would be sent at `log` level and fabricates a `stub_<uuid>` provider
 * message id, exactly mirroring `NewsletterMailerService`'s D1 stub
 * convention. Swap this class (not its call sites — see
 * `NewsletterEmailProvider`'s own header) for a real provider once one is
 * chosen.
 */
@Injectable()
export class NewsletterLoggingEmailProvider extends NewsletterEmailProvider {
  private readonly logger = new Logger(NewsletterLoggingEmailProvider.name);

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const providerMessageId = `stub_${randomUUID()}`;
    this.logger.log(
      `[stub email, no provider configured] To: ${input.to} | Subject: "${input.subject}" | ` +
        `tag: ${input.tag ?? '(none)'} | providerMessageId: ${providerMessageId} | ` +
        `html length: ${input.html.length} bytes`,
    );
    return { providerMessageId };
  }
}
