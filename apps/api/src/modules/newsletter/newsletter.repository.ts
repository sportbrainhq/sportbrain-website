import { Injectable } from '@nestjs/common';
import { count, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { newsletterSubscription } from '../../database/schema';
import type {
  NewsletterSubscriptionSource,
  NewsletterSubscriptionStatus,
} from '@sportbrain/contracts';

export type NewsletterSubscriptionRow = typeof newsletterSubscription.$inferSelect;

export interface CreateSubscriptionInput {
  email: string;
  source: NewsletterSubscriptionSource;
  timezone: string | null;
  status: NewsletterSubscriptionStatus;
  unsubscribeToken: string;
  confirmToken: string | null;
  subscribedAt: Date;
  confirmedAt: Date | null;
}

/**
 * Repository layer: the only place this domain touches the database.
 *
 * Every method here assumes its `email` argument is already normalized
 * (lowercased and trimmed) — normalization happens once, in
 * `NewsletterService`, so this layer never has to guess whether a caller
 * remembered to do it.
 */
@Injectable()
export class NewsletterRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(normalizedEmail: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.email, normalizedEmail))
      .limit(1);
    return row ?? null;
  }

  async findByUnsubscribeToken(token: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.unsubscribeToken, token))
      .limit(1);
    return row ?? null;
  }

  async findByConfirmToken(token: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.confirmToken, token))
      .limit(1);
    return row ?? null;
  }

  async findByUserId(userId: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.userId, userId))
      .limit(1);
    return row ?? null;
  }

  async findById(id: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.id, id))
      .limit(1);
    return row ?? null;
  }

  async create(input: CreateSubscriptionInput): Promise<NewsletterSubscriptionRow> {
    const [row] = await this.database.db.insert(newsletterSubscription).values(input).returning();

    if (!row) throw new Error('Insert of newsletter_subscription row returned no row');
    return row;
  }

  /**
   * Flips an existing row back to an active state on resubscribe (from
   * `UNSUBSCRIBED`, `BOUNCED` or `SUPPRESSED`), clearing `unsubscribedAt` and
   * updating `subscribedAt` to now — the address is subscribing again, so its
   * "since" date should reflect that, not the original signup.
   */
  async reactivate(
    id: string,
    status: NewsletterSubscriptionStatus,
    confirmToken: string | null,
  ): Promise<NewsletterSubscriptionRow> {
    const [row] = await this.database.db
      .update(newsletterSubscription)
      .set({
        status,
        subscribedAt: new Date(),
        unsubscribedAt: null,
        confirmToken,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscription.id, id))
      .returning();

    if (!row) throw new Error(`Reactivate found no newsletter_subscription row with id "${id}"`);
    return row;
  }

  async confirmSubscription(token: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .update(newsletterSubscription)
      .set({
        status: 'SUBSCRIBED',
        confirmedAt: new Date(),
        confirmToken: null,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscription.confirmToken, token))
      .returning();

    return row ?? null;
  }

  /** Never deletes the row — see the schema file header for why. */
  async unsubscribeByToken(token: string): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .update(newsletterSubscription)
      .set({
        status: 'UNSUBSCRIBED',
        unsubscribedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscription.unsubscribeToken, token))
      .returning();

    return row ?? null;
  }

  async updatePreferences(
    subscriptionId: string,
    preferences: { sports: string[] },
  ): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .update(newsletterSubscription)
      .set({ preferences, updatedAt: new Date() })
      .where(eq(newsletterSubscription.id, subscriptionId))
      .returning();

    return row ?? null;
  }

  /**
   * Count of currently-active (`SUBSCRIBED`) rows, for the admin newsletter
   * dashboard's headline stat (Phase D2). Read-only addition to this D1
   * repository — see D2's own module for why this lives here rather than a
   * cross-module query: it is the one number the dashboard can show that
   * isn't fabricated, and it belongs next to the other subscription queries,
   * not duplicated in `newsletter-issues`.
   */
  async countActiveSubscribers(): Promise<number> {
    const [row] = await this.database.db
      .select({ value: count() })
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.status, 'SUBSCRIBED'));
    return row?.value ?? 0;
  }

  async linkUserId(
    subscriptionId: string,
    userId: string,
  ): Promise<NewsletterSubscriptionRow | null> {
    const [row] = await this.database.db
      .update(newsletterSubscription)
      .set({ userId, updatedAt: new Date() })
      .where(eq(newsletterSubscription.id, subscriptionId))
      .returning();

    return row ?? null;
  }
}
