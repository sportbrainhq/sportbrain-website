import { Injectable } from '@nestjs/common';
import { buildPaginationMeta, type PaginationQuery } from '@sportbrain/contracts';
import type {
  NewsletterIssueContent,
  PublicIssueDetail,
  PublicIssueSummary,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { NewsletterIssueRenderService } from '../newsletter-issues/newsletter-issue-render.service';
import {
  NewsletterIssueRepository,
  type NewsletterIssueRow,
} from '../newsletter-issues/newsletter-issue.repository';

/**
 * The public archive read path (Phase D7).
 *
 * Reuses `NewsletterIssueRepository` (D2) rather than a new repository of
 * its own — `findPublishedBySlug`/`listPublished` are just differently
 * filtered reads of the same `newsletter_issue` table, and a second
 * repository would only duplicate the row-mapping logic already here. Also
 * reuses `NewsletterIssueRenderService` (D4): the public issue page renders
 * the exact same `RenderedIssue` view model the admin preview and the
 * outgoing email do — see that service's own header for "one render path,
 * three consumers", of which this is the third.
 */
@Injectable()
export class NewsletterArchiveService {
  constructor(
    private readonly issues: NewsletterIssueRepository,
    private readonly render: NewsletterIssueRenderService,
  ) {}

  async listPublished(
    pagination: PaginationQuery,
  ): Promise<{ data: PublicIssueSummary[]; pagination: ReturnType<typeof buildPaginationMeta> }> {
    const { rows, total } = await this.issues.listPublished(pagination.page, pagination.limit);
    return {
      data: rows.map((row) => this.toSummary(row)),
      pagination: buildPaginationMeta(total, pagination),
    };
  }

  /**
   * A slug that exists but is not yet published is reported identically to
   * one that does not exist at all — see `findPublishedBySlug`'s own
   * comment for why the repository already collapses those two cases into
   * one `null`. This method just turns that `null` into the same 404 every
   * other "not found" path in this codebase uses.
   */
  async getPublishedBySlug(slug: string): Promise<PublicIssueDetail> {
    const row = await this.issues.findPublishedBySlug(slug);
    if (!row) throw AppException.notFound(`No published newsletter issue with slug "${slug}"`);

    return {
      issue: {
        id: row.id,
        issueNumber: row.issueNumber,
        slug: row.slug,
        title: row.title,
        subject: row.subject,
        previewText: row.previewText,
        issueDate: row.issueDate.toISOString(),
        status: row.status,
        publishedAt: row.publishedAt!.toISOString(),
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
      rendered: this.render.render({
        issueNumber: row.issueNumber,
        title: row.title,
        subject: row.subject,
        previewText: row.previewText,
        heroTitle: row.heroTitle,
        issueDate: row.issueDate.toISOString(),
        content: (row.content ?? {}) as NewsletterIssueContent,
      }),
    };
  }

  private toSummary(row: NewsletterIssueRow): PublicIssueSummary {
    return {
      id: row.id,
      issueNumber: row.issueNumber,
      slug: row.slug,
      title: row.title,
      subject: row.subject,
      issueDate: row.issueDate.toISOString(),
      status: row.status,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
