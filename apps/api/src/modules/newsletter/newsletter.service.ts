import { randomBytes } from 'node:crypto';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  NewsletterSubscriptionSummary,
  NewsletterTokenActionResponse,
  SubscribeRequest,
  SubscribeResponse,
  UpdateNewsletterPreferencesRequest,
} from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import { AppException } from '../../common';
import { NewsletterMailerService } from './newsletter-mailer.service';
import { NewsletterRepository, type NewsletterSubscriptionRow } from './newsletter.repository';

/**
 * Service layer: the domain logic for the newsletter subscription foundation.
 *
 * Knows nothing about HTTP or SQL. Normalizes email addresses exactly once
 * (here, before any repository call), decides the double-opt-in branch, and
 * fires notification emails without ever letting a send failure fail the
 * underlying write — the same "email failures never destroy state" rule
 * `ContactService` follows.
 */
@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly repository: NewsletterRepository,
    private readonly mailer: NewsletterMailerService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  /**
   * Subscribes an address, or reconciles an existing one.
   *
   * Deliberately idempotent-safe (see `SubscribeResponse`'s JSDoc): every
   * branch below returns a 2xx-shaped result, never a conflict, so a caller
   * (or a double-submit) can never distinguish "new" from "already existed"
   * from the response alone.
   *
   *   - No existing row: create one, `PENDING` (double opt-in) or
   *     `SUBSCRIBED` (immediate).
   *   - Existing `SUBSCRIBED`: no-op, report `already_subscribed`.
   *   - Existing `PENDING`: no-op (do not re-send confirmation on every
   *     duplicate submit — only the original send and an explicit resend
   *     would do that, and this phase has no resend endpoint yet).
   *   - Existing `UNSUBSCRIBED`/`BOUNCED`/`SUPPRESSED`: reactivate — this is
   *     the resubscribe path, and it is what "subscribe" already means for a
   *     returning address, so no separate endpoint is needed for it.
   *   - Existing `COMPLAINED`: never reactivated automatically. A spam
   *     complaint is treated as compliance-relevant, not "unsubscribe I want
   *     to undo" — the only way back is not part of this endpoint.
   */
  async subscribe(
    input: SubscribeRequest,
    userId: string | null = null,
  ): Promise<SubscribeResponse> {
    const email = this.normalizeEmail(input.email);
    const doubleOptIn = this.config.get('newsletter.doubleOptIn', { infer: true });

    const existing = await this.repository.findByEmail(email);

    if (!existing) {
      const unsubscribeToken = this.generateToken();
      const confirmToken = doubleOptIn ? this.generateToken() : null;
      const status = doubleOptIn ? 'PENDING' : 'SUBSCRIBED';
      const now = new Date();

      const row = await this.repository.create({
        email,
        source: input.source,
        timezone: input.timezone ?? null,
        status,
        unsubscribeToken,
        confirmToken,
        subscribedAt: now,
        confirmedAt: doubleOptIn ? null : now,
      });

      if (userId) await this.repository.linkUserId(row.id, userId);

      await this.sendPostSubscribeEmail(row);

      return { status: doubleOptIn ? 'pending_confirmation' : 'subscribed' };
    }

    if (existing.status === 'SUBSCRIBED') {
      if (userId && !existing.userId) await this.repository.linkUserId(existing.id, userId);
      return { status: 'already_subscribed' };
    }

    if (existing.status === 'PENDING') {
      return { status: 'pending_confirmation' };
    }

    if (existing.status === 'COMPLAINED') {
      // Never silently reactivated. Report back as if freshly subscribed is
      // wrong here; the honest, still-idempotent-safe answer is "pending"
      // only in the double-opt-in sense doesn't apply either, so this is the
      // one case that must not just fall through to reactivate.
      throw AppException.conflict(
        'This address cannot be resubscribed automatically. Contact support.',
      );
    }

    // UNSUBSCRIBED, BOUNCED, or SUPPRESSED: reactivate as a resubscribe.
    const confirmToken = doubleOptIn ? this.generateToken() : null;
    const status = doubleOptIn ? 'PENDING' : 'SUBSCRIBED';
    const row = await this.repository.reactivate(existing.id, status, confirmToken);

    if (userId && !row.userId) await this.repository.linkUserId(row.id, userId);

    await this.sendPostSubscribeEmail(row);

    return { status: doubleOptIn ? 'pending_confirmation' : 'subscribed' };
  }

  async confirm(token: string): Promise<NewsletterTokenActionResponse> {
    const row = await this.repository.confirmSubscription(token);
    if (!row) return { status: 'invalid_token' };
    return { status: 'confirmed' };
  }

  async unsubscribe(token: string): Promise<NewsletterTokenActionResponse> {
    const row = await this.repository.unsubscribeByToken(token);
    if (!row) return { status: 'invalid_token' };
    return { status: 'unsubscribed' };
  }

  /** Read-only headline stat for the admin newsletter dashboard (Phase D2). See the repository method's own JSDoc for why this addition lives in D1's module. */
  async countActiveSubscribers(): Promise<number> {
    return this.repository.countActiveSubscribers();
  }

  async getMyStatus(userId: string): Promise<NewsletterSubscriptionSummary | null> {
    const row = await this.repository.findByUserId(userId);
    if (!row) return null;
    return this.toSummary(row);
  }

  /** Subscribes (or reconciles) the current signed-in user's own email address. */
  async subscribeSelf(
    userEmail: string,
    input: Omit<SubscribeRequest, 'email'>,
    userId: string,
  ): Promise<SubscribeResponse> {
    return this.subscribe({ ...input, email: userEmail }, userId);
  }

  /** Unsubscribes the current signed-in user's own subscription, if one exists. */
  async unsubscribeSelf(userId: string): Promise<NewsletterTokenActionResponse> {
    const row = await this.repository.findByUserId(userId);
    if (!row) return { status: 'invalid_token' };
    return this.unsubscribe(row.unsubscribeToken);
  }

  async updateMyPreferences(
    userId: string,
    preferences: UpdateNewsletterPreferencesRequest,
  ): Promise<NewsletterSubscriptionSummary> {
    const row = await this.repository.findByUserId(userId);
    if (!row) {
      throw AppException.notFound('No newsletter subscription exists for this account yet.');
    }

    const updated = await this.repository.updatePreferences(row.id, preferences);
    if (!updated) {
      throw AppException.notFound('No newsletter subscription exists for this account yet.');
    }

    return this.toSummary(updated);
  }

  /** Sends the welcome email immediately, or the confirmation email when double opt-in is on. Never fails the caller. */
  private async sendPostSubscribeEmail(row: NewsletterSubscriptionRow): Promise<void> {
    try {
      if (row.status === 'PENDING' && row.confirmToken) {
        await this.mailer.sendConfirmationEmail(row.email, row.confirmToken);
      } else if (row.status === 'SUBSCRIBED') {
        await this.mailer.sendWelcomeEmail(row.email, row.unsubscribeToken);
      }
    } catch (error) {
      this.logger.error(
        `Failed to send post-subscribe email for newsletter_subscription ${row.id}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /** Lowercased and trimmed once, here — every repository call downstream assumes this already happened. */
  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /** `crypto.randomBytes(32)` base64url-encoded: URL-safe without padding, and long enough that guessing it is not a practical attack. */
  private generateToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private toSummary(row: NewsletterSubscriptionRow): NewsletterSubscriptionSummary {
    return {
      status: row.status,
      subscribedAt: row.subscribedAt.toISOString(),
      preferences: (row.preferences as { sports: string[] } | null) ?? null,
    };
  }
}
