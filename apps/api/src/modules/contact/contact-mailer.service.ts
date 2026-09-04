import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import type { ContactCategory } from '@sportbrain/contracts';

export interface ContactEmailInput {
  referenceCode: string;
  category: ContactCategory;
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Sends the two emails a contact submission triggers: an acknowledgement to
 * the submitter, and an internal notification to the configured inbox.
 *
 * No real provider is wired up yet — this repo has no mailer/SMTP dependency
 * anywhere (see the investigation this module was built from). Rather than
 * introducing one speculatively, this logs what would be sent at `info`
 * level, matching the shared secret/stopgap-flagging convention this codebase
 * already uses for unfinished infra (`InternalApiKeyGuard`). Swap the two
 * `send*` method bodies for a real provider call (Resend/SES/SMTP) when one
 * is chosen; the call sites in `ContactService` do not change.
 *
 * A send failure here must never fail an otherwise-successful submission —
 * see the try/catch at each call site in `ContactService`.
 */
@Injectable()
export class ContactMailerService {
  private readonly logger = new Logger(ContactMailerService.name);

  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  async sendAcknowledgement(input: ContactEmailInput): Promise<void> {
    this.logger.log(
      `[stub email] To: ${input.email} | Subject: "We received your SportBrainHQ message — ${input.referenceCode}" | ` +
        `Body: We'll review your message ("${input.subject}") and contact you at ${input.email} if a response is required. Reference: ${input.referenceCode}.`,
    );
  }

  async sendInternalNotification(input: ContactEmailInput): Promise<void> {
    const notifyEmail = this.config.get('contact.internalNotifyEmail', { infer: true });

    if (!notifyEmail) {
      this.logger.warn(
        'No CONTACT_INTERNAL_NOTIFY_EMAIL (or CONTACT_EMAIL_GENERAL) configured — skipping internal notification.',
      );
      return;
    }

    this.logger.log(
      `[stub email] To: ${notifyEmail} | Subject: "New ${input.category} submission — ${input.referenceCode}" | ` +
        `From: ${input.name} <${input.email}> | Subject line: "${input.subject}"`,
    );
  }
}
