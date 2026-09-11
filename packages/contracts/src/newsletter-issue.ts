import { z } from 'zod';

/**
 * The Monday Brief issue model — Phase D2.
 *
 * D1 (`newsletter.ts`) is the subscribe/confirm/unsubscribe boundary and has
 * no notion of an issue. This file is the other half: an editor assembling
 * one structured issue. Scope is deliberately create/edit/validate/ready
 * only — scheduling, campaigns, recipient snapshots, delivery, webhooks and
 * analytics are later phases and must not be inferred from anything here.
 */

/**
 * DRAFT -> READY -> SCHEDULED -> SENDING -> SENT, with FAILED reachable from
 * SENDING and CANCELLED reachable from any pre-SENDING state. This phase only
 * ever produces DRAFT and READY; the remaining values exist so the column and
 * every switch over it are written once, not migrated when D3+ delivery
 * ships.
 */
export const newsletterIssueStatusSchema = z.enum([
  'DRAFT',
  'READY',
  'SCHEDULED',
  'SENDING',
  'SENT',
  'FAILED',
  'CANCELLED',
]);
export type NewsletterIssueStatus = z.infer<typeof newsletterIssueStatusSchema>;

// --- Content block schemas ---------------------------------------------------

export const quickRecapItemSchema = z.object({
  text: z.string().trim().min(1).max(280),
});
export type QuickRecapItem = z.infer<typeof quickRecapItemSchema>;

export const bigStorySchema = z.object({
  headline: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2_000),
  whatHappened: z.string().trim().min(1).max(2_000),
  whyItMatters: z.string().trim().min(1).max(2_000),
  whatChangesNow: z.string().trim().min(1).max(2_000),
  link: z.string().trim().url().max(2_000).nullable().optional(),
});
export type BigStory = z.infer<typeof bigStorySchema>;

export const scoreboardItemSchema = z.object({
  label: z.string().trim().min(1).max(200),
  result: z.string().trim().min(1).max(200),
  link: z.string().trim().url().max(2_000).nullable().optional(),
});
export type ScoreboardItem = z.infer<typeof scoreboardItemSchema>;

export const scoreboardGroupSchema = z.object({
  sport: z.string().trim().min(1).max(100),
  items: z.array(scoreboardItemSchema).max(50),
});
export type ScoreboardGroup = z.infer<typeof scoreboardGroupSchema>;

export const numberItemSchema = z.object({
  value: z.string().trim().min(1).max(100),
  caption: z.string().trim().min(1).max(280),
});
export type NumberItem = z.infer<typeof numberItemSchema>;

/** "Story You May Have Missed" — one secondary story, same shape as `bigStory` minus `whatChangesNow`, which only the lead story carries. */
export const missedStorySchema = z.object({
  headline: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2_000),
  link: z.string().trim().url().max(2_000).nullable().optional(),
});
export type MissedStory = z.infer<typeof missedStorySchema>;

/** "This Week in Sports History" callout. */
export const historyItemSchema = z.object({
  year: z.string().trim().min(1).max(20),
  headline: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(1_000),
});
export type HistoryItem = z.infer<typeof historyItemSchema>;

/**
 * "The SportBrain Challenge": a single question picked from the canonical
 * Question Bank (`question.id`). `questionSnapshot` freezes the fields the
 * rendered email needs at picked-time — mirrors why `QuizAttemptQuestion`
 * snapshots a question elsewhere in this schema: if the underlying question
 * is edited or retired after this issue sends, the archived issue must keep
 * reading exactly as it did when it went out. Optional here because a newly
 * picked question may not have its snapshot filled in until the picking flow
 * (web, D2) does so on selection.
 */
export const challengeBlockSchema = z.object({
  questionId: z.string().uuid(),
  questionSnapshot: z
    .object({
      questionText: z.string(),
      options: z.array(
        z.object({
          optionCode: z.enum(['A', 'B', 'C', 'D']),
          optionText: z.string(),
          isCorrect: z.boolean(),
        }),
      ),
      explanation: z.string().nullable().optional(),
    })
    .optional(),
});
export type ChallengeBlock = z.infer<typeof challengeBlockSchema>;

export const watchNextItemSchema = z.object({
  sport: z.string().trim().min(1).max(100),
  event: z.string().trim().min(1).max(200),
  datetime: z.string().trim().min(1).max(100),
  context: z.string().trim().max(500).nullable().optional(),
  link: z.string().trim().url().max(2_000).nullable().optional(),
});
export type WatchNextItem = z.infer<typeof watchNextItemSchema>;

/** "From SportBrainHQ": cross-links back into the site's own editorial content, question bank, or entity pages. */
export const sportbrainLinkSchema = z.object({
  type: z.enum(['content', 'question', 'entity', 'other']),
  refId: z.string().trim().max(200).nullable().optional(),
  label: z.string().trim().min(1).max(200),
  url: z.string().trim().url().max(2_000),
});
export type SportbrainLink = z.infer<typeof sportbrainLinkSchema>;

/**
 * The full issue content shape. Every section is optional so a fresh DRAFT
 * (`content: {}`) is valid, and so `updateIssueContentSchema`'s
 * section-by-section PATCH can populate one section at a time — the editor
 * saves "60-Second Recap" independently of "Big Story", and neither write
 * should require the other sections to already exist.
 */
export const newsletterIssueContentSchema = z.object({
  intro: z.string().trim().max(2_000).optional(),
  quickRecap: z.array(quickRecapItemSchema).max(20).optional(),
  bigStory: bigStorySchema.optional(),
  scoreboard: z.array(scoreboardGroupSchema).max(20).optional(),
  numbers: z.array(numberItemSchema).max(20).optional(),
  missedStory: missedStorySchema.optional(),
  history: historyItemSchema.optional(),
  quiz: challengeBlockSchema.optional(),
  watchNext: z.array(watchNextItemSchema).max(20).optional(),
  sportbrainLinks: z.array(sportbrainLinkSchema).max(20).optional(),
});
export type NewsletterIssueContent = z.infer<typeof newsletterIssueContentSchema>;

// --- Requests -----------------------------------------------------------------

export const createIssueRequestSchema = z
  .object({
    issueDate: z.string().datetime(),
    title: z.string().trim().min(1).max(200),
    subject: z.string().trim().min(1).max(200),
    previewText: z.string().trim().min(1).max(300),
  })
  .strict();
export type CreateIssueRequest = z.infer<typeof createIssueRequestSchema>;

/**
 * Section-by-section content save. Partial at the top level (every section
 * optional, same as `newsletterIssueContentSchema`) so `PATCH .../content`
 * merges the given sections into the stored jsonb rather than requiring the
 * whole document on every save — see `NewsletterIssueRepository.updateContent`.
 */
export const updateIssueContentSchema = newsletterIssueContentSchema;
export type UpdateIssueContentRequest = z.infer<typeof updateIssueContentSchema>;

export const updateIssueMetaSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    subject: z.string().trim().min(1).max(200).optional(),
    previewText: z.string().trim().min(1).max(300).optional(),
    heroTitle: z.string().trim().max(200).nullable().optional(),
    issueDate: z.string().datetime().optional(),
  })
  .strict();
export type UpdateIssueMetaRequest = z.infer<typeof updateIssueMetaSchema>;

/**
 * The result of running `NewsletterIssueValidationService` against an issue.
 * `errors` block the DRAFT->READY transition; `warnings` (mostly placeholder
 * detection) never block, they only surface in the admin validation panel.
 */
export const issueValidationResultSchema = z.object({
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type IssueValidationResult = z.infer<typeof issueValidationResultSchema>;

// --- Response DTOs --------------------------------------------------------------

/** The issue list view: enough to render the admin table without shipping full content. */
export const newsletterIssueSummarySchema = z.object({
  id: z.string(),
  issueNumber: z.number().int(),
  slug: z.string(),
  title: z.string(),
  subject: z.string(),
  issueDate: z.string(),
  status: newsletterIssueStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NewsletterIssueSummary = z.infer<typeof newsletterIssueSummarySchema>;

/** The full issue, for the editor. */
export const newsletterIssueDetailSchema = z.object({
  id: z.string(),
  issueNumber: z.number().int(),
  slug: z.string(),
  title: z.string(),
  subject: z.string(),
  previewText: z.string(),
  heroTitle: z.string().nullable(),
  issueDate: z.string(),
  status: newsletterIssueStatusSchema,
  content: newsletterIssueContentSchema,
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
  scheduledAt: z.string().nullable(),
  /** IANA timezone the (nullable) `scheduledAt` instant was picked in — see `newsletterIssue.scheduleTimezone`'s schema comment. Always present, even for an issue never scheduled, since the column carries a default. */
  scheduleTimezone: z.string(),
  sendStartedAt: z.string().nullable(),
  sentAt: z.string().nullable(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type NewsletterIssueDetail = z.infer<typeof newsletterIssueDetailSchema>;

// --- Rendering (Phase D4) ------------------------------------------------------

/**
 * The presentation-ready shape produced from `NewsletterIssueContent` by
 * `NewsletterIssueRenderService`. One source of truth for three consumers:
 * the admin preview pane, the HTML email template, and (D7, later) the
 * public issue page — all three read this shape rather than each re-deriving
 * "how do I turn `content.bigStory` into something displayable" from the raw
 * jsonb independently.
 *
 * Deliberately NOT desktop/mobile/web-specific: every section here is the
 * same data regardless of where it renders. Desktop vs. mobile is a
 * container-width/CSS concern in the admin preview UI and a responsive
 * table-layout concern in the email template — both consume this one model,
 * neither needs a different one. See `newsletter-issue-render.service.ts`'s
 * own header comment for the full reasoning.
 */
export const renderedIssueSchema = z.object({
  issueNumber: z.number().int(),
  title: z.string(),
  subject: z.string(),
  previewText: z.string(),
  /** `heroTitle` if set, else falls back to `title` — the one piece of "apply a default" logic this model resolves once so every consumer doesn't repeat it. */
  heroTitle: z.string(),
  issueDate: z.string(),
  intro: z.string().nullable(),
  quickRecap: z.array(quickRecapItemSchema),
  bigStory: bigStorySchema.nullable(),
  scoreboard: z.array(scoreboardGroupSchema),
  numbers: z.array(numberItemSchema),
  missedStory: missedStorySchema.nullable(),
  history: historyItemSchema.nullable(),
  quiz: challengeBlockSchema.nullable(),
  watchNext: z.array(watchNextItemSchema),
  sportbrainLinks: z.array(sportbrainLinkSchema),
});
export type RenderedIssue = z.infer<typeof renderedIssueSchema>;

/** `GET /admin/newsletter/issues/:id/preview` response (D4: real rendering, replacing D2's raw-DTO placeholder). */
export const issuePreviewResponseSchema = z.object({
  issue: newsletterIssueDetailSchema,
  rendered: renderedIssueSchema,
});
export type IssuePreviewResponse = z.infer<typeof issuePreviewResponseSchema>;
