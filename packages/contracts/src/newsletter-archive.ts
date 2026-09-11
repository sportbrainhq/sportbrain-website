import { z } from 'zod';
import { newsletterIssueSummarySchema, renderedIssueSchema } from './newsletter-issue';

/**
 * The public archive boundary — Phase D7.
 *
 * A publicly-visible issue is exactly one with `publishedAt` set (see the
 * schema file's own comment on that column, and
 * `NewsletterIssueSchedulerJob`'s D7 addition that stamps it the moment a
 * campaign begins SENDING). No DRAFT/READY/SCHEDULED/SENDING-not-yet-started
 * content is ever reachable through these shapes — `NewsletterArchiveService`
 * is what enforces that at the query layer, this file just describes what
 * comes back once it has.
 */

/** One entry in the public archive list — reuses `NewsletterIssueSummary`'s shape (D2) rather than inventing a public-specific summary, since the fields a reader needs (title, date, slug) are the same fields the admin list already carries. */
export const publicIssueSummarySchema = newsletterIssueSummarySchema;
export type PublicIssueSummary = z.infer<typeof publicIssueSummarySchema>;

/**
 * `GET /newsletter/issues/:slug` response: the raw issue plus the same
 * `RenderedIssue` view model the admin preview and the outgoing email use
 * (`NewsletterIssueRenderService` — see that file's header on "one render
 * path, three consumers"). The public page renders `rendered`, not `issue`
 * directly, mirroring `IssuePreviewResponse`'s shape for the same reason.
 */
export const publicIssueDetailSchema = z.object({
  issue: newsletterIssueSummarySchema.extend({
    previewText: z.string(),
    publishedAt: z.string(),
  }),
  rendered: renderedIssueSchema,
});
export type PublicIssueDetail = z.infer<typeof publicIssueDetailSchema>;
