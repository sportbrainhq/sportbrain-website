import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { entityRef, primaryId, timestamps } from './_shared';
import { users } from './user.schema';

/**
 * The Monday Brief newsletter: one row per issue.
 *
 * D1 (`newsletter-subscription.schema.ts`) built the subscribe/confirm/
 * unsubscribe boundary with no notion of an "issue" at all. This file is the
 * other half: the structured content an editor assembles into one Monday
 * Brief send. It deliberately stops at "an issue exists, has content, and can
 * be marked ready" — scheduling, delivery, recipient snapshots and analytics
 * are later phases (D3+) and must not be inferred from anything here.
 *
 * `content` is one jsonb column rather than a table per section
 * (`newsletter_issue_quick_recap`, `newsletter_issue_scoreboard`, ...) for the
 * same reason `question.metadata` and `content.metadata` are jsonb: every
 * section is always read and written together with the issue, never queried
 * across issues, and the section shapes are still being figured out
 * editorially — a jsonb blob lets that shape evolve without a migration per
 * change, and `newsletter-issue-validation.service.ts` (application code) is
 * what actually enforces its shape, the same "application decides, database
 * stores" split `_shared.ts` documents for `teamKindEnum` and friends.
 */

/**
 * DRAFT -> READY -> SCHEDULED -> SENDING -> SENT, with FAILED reachable from
 * SENDING and CANCELLED reachable from any pre-SENDING state. D2 (this file)
 * only ever writes DRAFT and READY: SCHEDULED/SENDING/SENT/FAILED/CANCELLED
 * are columns and enum members that exist so the later delivery phase (D3+)
 * is additive, a status transition, not a migration. `NewsletterIssueService`
 * enforces DRAFT<->READY only; nothing in this phase writes any other value.
 */
export const newsletterIssueStatusEnum = pgEnum('newsletter_issue_status', [
  'DRAFT',
  'READY',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'FAILED',
  'CANCELLED',
]);

export const newsletterIssue = pgTable(
  'newsletter_issue',
  {
    id: primaryId(),

    /**
     * Human-readable sequence number ("Issue #47"), assigned once at creation
     * as `max(issueNumber) + 1` inside the same transaction as the insert
     * (`NewsletterIssueRepository.create`) — mirrors `question.questionCode`'s
     * "something a person can read out loud" reasoning. Never reassigned.
     */
    issueNumber: integer('issue_number').notNull(),

    /**
     * URL-safe identifier, e.g. `monday-brief-2026-09-07`. Generated from
     * `issueDate` at creation (`NewsletterIssueRepository.generateSlug`) with
     * a numeric suffix appended only on collision (two issues dated the same
     * day, e.g. a duplicated draft) — the common case never has a suffix.
     */
    slug: text('slug').notNull(),

    title: text('title').notNull(),
    /** The email subject line. Distinct from `title`: a subject is written for an inbox, a title for an archive/admin list. */
    subject: text('subject').notNull(),
    /** The inbox preview snippet shown next to the subject in most mail clients. */
    previewText: text('preview_text').notNull(),
    /** Optional display headline for the hero/masthead of the rendered email, distinct from `title`/`subject`. Null falls back to `title` at render time (a later phase's concern). */
    heroTitle: text('hero_title'),

    /** The Monday this issue is/was for. Drives slug generation and issue ordering; not a send timestamp (see `sentAt`). */
    issueDate: timestamp('issue_date', { withTimezone: true }).notNull(),

    status: newsletterIssueStatusEnum('status').notNull().default('DRAFT'),

    /**
     * Structured editorial content. Shape (frozen for D2, editable by hand
     * alongside `newsletterIssueContentSchema` in
     * `packages/contracts/src/newsletter-issue.ts`):
     *
     *   - `intro`: short standalone opening paragraph.
     *   - `quickRecap`: the "60-Second Recap" bullet list.
     *   - `bigStory`: `{ headline, summary, whatHappened, whyItMatters,
     *     whatChangesNow, link }` — the week's single lead story.
     *   - `scoreboard`: grouped results per sport.
     *   - `numbers`: "Numbers of the Week" `{ value, caption }` cards.
     *   - `missedStory`: "Story You May Have Missed", the same shape as one
     *     `bigStory`-adjacent block but always exactly one.
     *   - `history`: "This Week in Sports History" callout.
     *   - `quiz`: `{ questionId, questionSnapshot }` — `questionId` points at
     *     `question.id` (a PUBLISHED row, enforced by
     *     `NewsletterIssueValidationService`, not a DB constraint: an admin
     *     jsonb column referencing another table is exactly the "read
     *     integrity is an application concern" split `question.sourceEntityId`
     *     already uses). `questionSnapshot` freezes the presentation fields
     *     (text/options) at picked-time, mirroring why `QuizAttemptQuestion`
     *     snapshots a question elsewhere in this schema: if the underlying
     *     question is retired/edited after this issue sends, the archived
     *     issue must keep reading the same.
     *   - `watchNext`: "What to Watch" upcoming-fixture callouts.
     *   - `sportbrainLinks`: "From SportBrainHQ" cross-links into `content`/
     *     `question`/entity pages, `{ type, refId, label, url }`.
     *
     * Every section is optional/empty-array-able: `newsletterIssueContent
     * Schema` in contracts does not require any one section to be present so
     * that `updateIssueContentSchema`'s section-by-section PATCH can save one
     * section without the others yet existing.
     */
    content: jsonb('content').notNull().default({}),

    createdBy: entityRef('created_by').references(() => users.id, { onDelete: 'set null' }),
    /** Set on every content/meta edit after creation. Null until the first edit by someone other than the creator, or simply until the first edit at all. */
    updatedBy: entityRef('updated_by').references(() => users.id, { onDelete: 'set null' }),

    /**
     * Delivery-lifecycle timestamps. Columns only, no logic reads or writes
     * them in D2 — they exist now so D3 (scheduling/delivery) is additive to
     * this table rather than a migration that adds four columns to a table
     * already full of live DRAFT/READY rows.
     */
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    /**
     * IANA timezone name the `scheduledAt` instant was chosen in (e.g.
     * `Asia/Kolkata`) — added in D5. `scheduledAt` itself is always an
     * absolute instant (`timestamptz`), so this column exists purely for
     * displaying it back to the editor in the timezone they picked ("Mon,
     * 8:00 AM IST") rather than converting to their browser's local zone,
     * which would show a different clock time than what they scheduled.
     * Defaults to the newsletter's default send timezone so D2-created rows
     * (created before this column existed) read sensibly if ever scheduled.
     */
    scheduleTimezone: text('schedule_timezone').notNull().default('Asia/Kolkata'),
    sendStartedAt: timestamp('send_started_at', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    publishedAt: timestamp('published_at', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    uniqueIndex('newsletter_issue_slug_idx').on(table.slug),
    uniqueIndex('newsletter_issue_number_idx').on(table.issueNumber),
    index('newsletter_issue_status_idx').on(table.status),
    index('newsletter_issue_issue_date_idx').on(table.issueDate),
    index('newsletter_issue_scheduled_at_idx').on(table.scheduledAt),
  ],
);
