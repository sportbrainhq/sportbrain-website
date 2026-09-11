import { index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * The Monday Brief newsletter: one row per email address that has ever
 * subscribed, kept forever rather than deleted on unsubscribe.
 *
 * Modelled as "one row per normalized email, status transitions over time"
 * rather than "one row per subscribe event with a history table". A history
 * table earns its keep once we need to answer "how many times has this
 * address unsubscribed and resubscribed" — nothing in this phase needs that,
 * and a second table would exist only to duplicate what `status` +
 * `subscribedAt`/`unsubscribedAt` already say about the current state. If a
 * genuine audit trail is needed later, it is additive: a
 * `newsletter_subscription_event` table keyed on this row's id, not a
 * reshape of this one.
 *
 * `userId` is nullable and populated only when a signed-in reader subscribes
 * (or later links an anonymous subscription to their account, e.g. after
 * signing up with the same address). Never auto-populated on signup — this
 * repo's product rule is that subscribing is always an explicit action,
 * never an implicit side effect of creating an account.
 */

export const newsletterSubscriptionStatusEnum = pgEnum('newsletter_subscription_status', [
  'PENDING',
  'SUBSCRIBED',
  'UNSUBSCRIBED',
  'BOUNCED',
  'COMPLAINED',
  'SUPPRESSED',
]);

/**
 * Where a subscribe action originated. Kept for the first row's provenance
 * only (`source` is not updated on resubscribe), since knowing which page or
 * flow drives sign-ups is a product question worth answering per-address,
 * not per-event — same tradeoff as skipping a history table above.
 */
export const newsletterSubscriptionSourceEnum = pgEnum('newsletter_subscription_source', [
  'NEWSLETTER_PAGE',
  'HOMEPAGE',
  'PROFILE',
  'ARTICLE',
  'QUIZ_RESULT',
  'FOOTER',
  'OTHER',
]);

export const newsletterSubscription = pgTable(
  'newsletter_subscription',
  {
    id: primaryId(),

    /** Set only once a signed-in reader is associated with this address. */
    userId: entityRef('user_id').references(() => users.id, { onDelete: 'set null' }),

    /**
     * Always lowercased and trimmed before this column is written — enforced
     * in `NewsletterRepository`/`NewsletterService`, not as a DB constraint,
     * because Postgres has no portable case-insensitive text type without an
     * extension this repo doesn't otherwise need. The unique index below is
     * only correct because every write path normalizes first.
     */
    email: text('email').notNull(),

    status: newsletterSubscriptionStatusEnum('status').notNull().default('PENDING'),
    source: newsletterSubscriptionSourceEnum('source').notNull(),

    /** IANA timezone name (e.g. `Asia/Kolkata`), for a future send-time-of-day feature. Unused by anything in this phase. */
    timezone: text('timezone'),

    /**
     * `{ sports: string[] }` of sport slugs, deliberately a loose jsonb blob
     * rather than a join to `userFollows`/`sport`. A subscriber's mailing
     * preferences and a signed-in user's followed sports are related but not
     * the same list — an anonymous subscriber has no follows to join against
     * at all — so this stays simple, string-slug jsonb for V1 rather than
     * coupling to Phase C's polymorphic entity-follow model. Revisit only if
     * a later phase needs referential integrity against `sport.id`.
     */
    preferences: jsonb('preferences').$type<{ sports: string[] } | null>(),

    subscribedAt: timestamp('subscribed_at', { withTimezone: true }).notNull(),
    /** Set when a double-opt-in confirmation completes. Null if double opt-in is disabled or not yet confirmed. */
    confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
    /** Set on every unsubscribe. Left in place on a later resubscribe as a record of the most recent prior unsubscribe. */
    unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),

    /**
     * Opaque bearer token for the no-login unsubscribe link mailed with every
     * send. Generated once at insert time and never rotated on
     * unsubscribe/resubscribe, so a link mailed months ago still works —
     * rotating it would silently break every previously-sent email's link.
     */
    unsubscribeToken: text('unsubscribe_token').notNull(),

    /**
     * Separate token for the double-opt-in confirmation link, only ever
     * issued when `NEWSLETTER_DOUBLE_OPT_IN` is on. Cleared (set to null) once
     * confirmed, so a stale confirmation link cannot be replayed after the
     * fact. Kept as its own column rather than reusing `unsubscribeToken`
     * because the two links must not be interchangeable: a leaked unsubscribe
     * link (mailed to the address on every send) must never double as a way
     * to confirm a *different*, not-yet-confirmed subscription.
     */
    confirmToken: text('confirm_token'),

    ...timestamps,
  },
  (table) => [
    // One row per address, ever — see the file header. This is the constraint
    // that makes upsert-on-resubscribe correct rather than accidental.
    uniqueIndex('newsletter_subscription_email_idx').on(table.email),
    uniqueIndex('newsletter_subscription_unsubscribe_token_idx').on(table.unsubscribeToken),
    uniqueIndex('newsletter_subscription_confirm_token_idx').on(table.confirmToken),
    index('newsletter_subscription_status_idx').on(table.status),
    index('newsletter_subscription_user_id_idx').on(table.userId),
    index('newsletter_subscription_created_at_idx').on(table.createdAt),
  ],
);
