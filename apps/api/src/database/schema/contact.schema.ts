import { index, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { primaryId, timestamps } from './_shared';

/**
 * Contact & feedback submissions.
 *
 * One table serves every audience the /contact page is for (readers,
 * partners, press, correction reports) rather than one table per category,
 * because the shape is the same: who sent it, what it's about, what they
 * said, and whether we've dealt with it. `category` is the only thing that
 * changes how a row is routed or templated.
 *
 * `status` carries the correction lifecycle (received → under_review →
 * accepted/rejected → resolved) for every row, not only corrections, so the
 * admin listing can filter on one column regardless of category. For a
 * non-correction row the meaningful transition is just received → resolved.
 */

export const contactCategoryEnum = pgEnum('contact_category', [
  'general',
  'correction',
  'content_feedback',
  'quiz_issue',
  'partnerships',
  'press',
  'feature_request',
  'technical_issue',
  'other',
]);

export const contactStatusEnum = pgEnum('contact_status', [
  'received',
  'under_review',
  'accepted',
  'rejected',
  'resolved',
]);

export const contactSubmission = pgTable(
  'contact_submission',
  {
    id: primaryId(),

    /**
     * Public-facing identifier, e.g. `SBH-COR-A1B2C3D4` for a correction or
     * `SBH-GEN-A1B2C3D4` for everything else. Generated at write time in the
     * service layer, never derived from `id`: the internal uuid must never
     * be exposed to a submitter, since it's also the row's audit-log key.
     */
    referenceCode: text('reference_code').notNull(),

    /** Set when the submitter was authenticated. Null for anonymous senders. */
    userId: text('user_id'),

    category: contactCategoryEnum('category').notNull(),
    status: contactStatusEnum('status').notNull().default('received'),

    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject').notNull(),
    message: text('message').notNull(),

    /** The page the form was opened from, when opened from content. */
    pageUrl: text('page_url'),

    /**
     * A correction's citation for the correct value, or any other supporting
     * link. Named generically because non-correction categories may use it
     * too (press asking about a specific source), not only corrections.
     */
    sourceUrl: text('source_url'),

    /** Reserved for a future attachment upload; unused until that ships. */
    attachmentUrl: text('attachment_url'),

    /**
     * Everything captured automatically rather than typed by the submitter:
     * browser/device basics, the correction-specific fields
     * (whatIsIncorrect/whatItShouldSay), and anything else worth keeping
     * without a schema migration per addition. Deliberately jsonb rather
     * than more columns, the same tradeoff `explainer_section.structuredData`
     * makes: this payload varies by category and is written by the service
     * layer, not queried by SQL.
     */
    metadata: jsonb('metadata').notNull().default({}),

    resolvedAt: timestamp('resolved_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('contact_submission_reference_code_idx').on(table.referenceCode),
    /** The admin listing's default query: newest first, optionally by status. */
    index('contact_submission_status_created_idx').on(table.status, table.createdAt),
    index('contact_submission_category_idx').on(table.category),
  ],
);
