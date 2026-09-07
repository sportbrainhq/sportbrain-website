import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
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
 * Uses Resend when `RESEND_API_KEY` is configured. Until then (or if the
 * send call itself fails), this logs what would be sent at `info`/`warn`
 * level instead — matching the shared secret/stopgap-flagging convention
 * this codebase already uses for unfinished infra (`InternalApiKeyGuard`).
 * A send failure here must never fail an otherwise-successful submission —
 * see the try/catch at each call site in `ContactService`.
 */
@Injectable()
export class ContactMailerService {
  private readonly logger = new Logger(ContactMailerService.name);
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService<AppConfig, true>) {
    const apiKey = this.config.get('contact.resendApiKey', { infer: true });
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.fromEmail = this.config.get('contact.fromEmail', { infer: true });
  }

  async sendAcknowledgement(input: ContactEmailInput): Promise<void> {
    const subject = `We received your SportBrainHQ message — ${input.referenceCode}`;
    const text =
      `We'll review your message ("${input.subject}") and contact you at ${input.email} ` +
      `if a response is required. Reference: ${input.referenceCode}.`;

    await this.send({ to: input.email, subject, text }, 'acknowledgement');
  }

  async sendInternalNotification(input: ContactEmailInput): Promise<void> {
    const notifyEmail = this.config.get('contact.internalNotifyEmail', { infer: true });

    if (!notifyEmail) {
      this.logger.warn(
        'No CONTACT_INTERNAL_NOTIFY_EMAIL (or CONTACT_EMAIL_GENERAL) configured — skipping internal notification.',
      );
      return;
    }

    const subject = `New ${input.category} submission — ${input.referenceCode}`;
    const text = `From: ${input.name} <${input.email}>\nSubject: ${input.subject}\n\n${input.message}`;

    // `fromName` puts the submitter's real name on the "From" line (Gmail
    // shows "Yash Kulshrestha" instead of the raw sender address) — this is
    // just the display-name half of the From header, unrelated to the
    // address itself. `replyTo` is the submitter's real email address: the
    // notification still arrives "from" our sender address (an unverified
    // sender domain cannot send "as" an arbitrary address — every provider
    // blocks that as spoofing), but hitting Reply addresses the submitter
    // directly, so a reply goes straight to them with no copy-paste.
    await this.send(
      { to: notifyEmail, subject, text, fromName: input.name, replyTo: input.email },
      'internal notification',
    );
  }

  private async send(
    params: { to: string; subject: string; text: string; fromName?: string; replyTo?: string },
    label: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.log(
        `[stub email, no RESEND_API_KEY] To: ${params.to} | Subject: "${params.subject}" | Body: ${params.text}`,
      );
      return;
    }

    const from = params.fromName ? `${params.fromName} <${this.fromEmail}>` : this.fromEmail;

    try {
      const { error } = await this.resend.emails.send({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        ...(params.replyTo ? { replyTo: params.replyTo } : {}),
      });
      if (error) {
        this.logger.warn(`Resend rejected the ${label} email: ${error.message}`);
      }
    } catch (err) {
      this.logger.warn(
        `Failed to send ${label} email via Resend: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}
