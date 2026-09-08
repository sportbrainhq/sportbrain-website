import { Injectable } from '@nestjs/common';
import type {
  CreateIssueRequest,
  IssueValidationResult,
  NewsletterIssueContent,
  NewsletterIssueDetail,
  NewsletterIssueStatus,
  NewsletterIssueSummary,
  UpdateIssueMetaRequest,
} from '@sportbrain/contracts';
import { buildPaginationMeta, type PaginationQuery } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { NewsletterIssueValidationService } from './newsletter-issue-validation.service';
import { NewsletterIssueRepository, type NewsletterIssueRow } from './newsletter-issue.repository';

/** Statuses a `content`/`meta` write is refused against — see `assertEditable`. */
const LOCKED_STATUSES: NewsletterIssueStatus[] = ['SENDING', 'SENT', 'CANCELLED'];

/**
 * Service layer: the domain logic for the issue model (Phase D2).
 *
 * Scope is deliberately CREATE/EDIT/VALIDATE/READY only. Nothing here
 * schedules, sends, or snapshots recipients — see the schema file's header
 * for the full list of what is out of scope. `markReady` is the only status
 * transition this phase writes; every other enum member exists for D3+ to
 * fill in without a migration.
 */
@Injectable()
export class NewsletterIssueService {
  constructor(
    private readonly repository: NewsletterIssueRepository,
    private readonly validation: NewsletterIssueValidationService,
  ) {}

  async createIssue(
    input: CreateIssueRequest,
    actorUserId: string | null,
  ): Promise<NewsletterIssueDetail> {
    const row = await this.repository.create({
      title: input.title,
      subject: input.subject,
      previewText: input.previewText,
      issueDate: new Date(input.issueDate),
      createdBy: actorUserId,
    });
    return this.toDetail(row);
  }

  async listIssues(
    filters: { status?: NewsletterIssueStatus },
    pagination: PaginationQuery,
  ): Promise<{
    data: NewsletterIssueSummary[];
    pagination: ReturnType<typeof buildPaginationMeta>;
  }> {
    const { rows, total } = await this.repository.findAll(
      filters,
      pagination.page,
      pagination.limit,
    );
    return {
      data: rows.map((row) => this.toSummary(row)),
      pagination: buildPaginationMeta(total, pagination),
    };
  }

  async getIssue(id: string): Promise<NewsletterIssueDetail> {
    const row = await this.repository.findById(id);
    if (!row) throw AppException.notFound(`No newsletter issue with id "${id}"`);
    return this.toDetail(row);
  }

  async updateMeta(
    id: string,
    input: UpdateIssueMetaRequest,
    actorUserId: string | null,
  ): Promise<NewsletterIssueDetail> {
    const existing = await this.mustFind(id);
    this.assertEditable(existing);

    const row = await this.repository.updateMeta(
      id,
      {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.subject !== undefined ? { subject: input.subject } : {}),
        ...(input.previewText !== undefined ? { previewText: input.previewText } : {}),
        ...(input.heroTitle !== undefined ? { heroTitle: input.heroTitle } : {}),
        ...(input.issueDate !== undefined ? { issueDate: new Date(input.issueDate) } : {}),
      },
      actorUserId,
    );
    if (!row) throw AppException.notFound(`No newsletter issue with id "${id}"`);
    return this.toDetail(row);
  }

  /**
   * Section-by-section content save. Rejects outright once an issue is
   * SENDING/SENT/CANCELLED (`assertEditable`) — a READY issue may still be
   * edited (an editor catching a mistake after marking ready is normal;
   * `markReady` would just need to be re-run), so READY is deliberately not
   * in `LOCKED_STATUSES`.
   */
  async updateContent(
    id: string,
    partialContent: NewsletterIssueContent,
    actorUserId: string | null,
  ): Promise<NewsletterIssueDetail> {
    const existing = await this.mustFind(id);
    this.assertEditable(existing);

    const row = await this.repository.updateContent(id, partialContent, actorUserId);
    if (!row) throw AppException.notFound(`No newsletter issue with id "${id}"`);
    return this.toDetail(row);
  }

  async validateIssue(id: string): Promise<IssueValidationResult> {
    const issue = await this.mustFind(id);
    return this.validation.validate(issue);
  }

  /**
   * DRAFT -> READY. Blocked outright by any validation error; warnings never
   * block (they are placeholder-detection nudges, not correctness issues —
   * see `NewsletterIssueValidationService`). Re-running `markReady` on an
   * already-READY issue is a no-op success, not an error: an editor
   * re-checking after a content edit should never have to know the issue was
   * already READY.
   */
  async markReady(
    id: string,
  ): Promise<{ issue: NewsletterIssueDetail; validation: IssueValidationResult }> {
    const existing = await this.mustFind(id);
    if (existing.status !== 'DRAFT' && existing.status !== 'READY') {
      throw AppException.conflict(`Cannot mark issue ready from status "${existing.status}".`);
    }

    const validation = await this.validation.validate(existing);
    if (validation.errors.length > 0) {
      throw AppException.validationFailed(
        'Issue has validation errors and cannot be marked ready.',
        validation.errors.map((message: string) => ({ path: 'content', message })),
      );
    }

    const row = await this.repository.updateStatus(id, 'READY');
    if (!row) throw AppException.notFound(`No newsletter issue with id "${id}"`);
    return { issue: this.toDetail(row), validation };
  }

  /**
   * Copies an issue's content into a brand-new DRAFT with its own
   * issueNumber/slug — for reusing a prior week's structure as a starting
   * point. Metadata (title/subject/previewText/issueDate) is NOT copied
   * verbatim: reusing last week's subject line unedited is a likely mistake,
   * not a convenience, so the caller gets fresh placeholder-free defaults
   * derived from "today" and must fill in the rest.
   */
  async duplicateIssue(id: string, actorUserId: string | null): Promise<NewsletterIssueDetail> {
    const existing = await this.mustFind(id);

    const now = new Date();
    const created = await this.repository.create({
      title: `${existing.title} (copy)`,
      subject: existing.subject,
      previewText: existing.previewText,
      issueDate: now,
      createdBy: actorUserId,
    });

    const row = await this.repository.updateContent(
      created.id,
      existing.content as NewsletterIssueContent,
      actorUserId,
    );
    return this.toDetail(row ?? created);
  }

  /**
   * READY -> SCHEDULED (Phase D5). Only READY issues may be scheduled — a
   * DRAFT issue may still have validation errors, and re-scheduling an
   * already-SCHEDULED issue must go through `cancelSchedule` first so the
   * new time is a deliberate, visible action rather than a silent
   * overwrite. `scheduledAt` must be in the future: scheduling something for
   * the past would be claimed by the scheduler on its very next tick, which
   * is surprising rather than useful — an editor who wants "send now" has no
   * endpoint for that in D5 by design (send-now is a product decision this
   * phase does not make).
   */
  async scheduleIssue(
    id: string,
    input: { scheduledAt: string; timezone: string },
  ): Promise<NewsletterIssueDetail> {
    const existing = await this.mustFind(id);
    if (existing.status !== 'READY') {
      throw AppException.conflict(
        `Cannot schedule an issue from status "${existing.status}". Mark it READY first.`,
      );
    }

    const scheduledAt = new Date(input.scheduledAt);
    if (scheduledAt.getTime() <= Date.now()) {
      throw AppException.validationFailed('scheduledAt must be in the future.', [
        { path: 'scheduledAt', message: 'Must be in the future.' },
      ]);
    }

    const row = await this.repository.scheduleIssue(id, scheduledAt, input.timezone);
    if (!row) {
      // Lost a race against a concurrent schedule/edit that changed status
      // out from under this check — report the same conflict a fresh
      // mustFind would have hit, rather than a confusing 404.
      throw AppException.conflict('Issue is no longer READY; refresh and try again.');
    }
    return this.toDetail(row);
  }

  /** SCHEDULED -> READY, clearing `scheduledAt`. A no-op-shaped conflict (not a 404) when the issue has already moved past SCHEDULED (e.g. the scheduler already claimed it for sending). */
  async cancelSchedule(id: string): Promise<NewsletterIssueDetail> {
    const existing = await this.mustFind(id);
    if (existing.status !== 'SCHEDULED') {
      throw AppException.conflict(`Issue is "${existing.status}", not SCHEDULED.`);
    }

    const row = await this.repository.cancelSchedule(id);
    if (!row) throw AppException.conflict('Issue is no longer SCHEDULED; refresh and try again.');
    return this.toDetail(row);
  }

  private async mustFind(id: string): Promise<NewsletterIssueRow> {
    const row = await this.repository.findById(id);
    if (!row) throw AppException.notFound(`No newsletter issue with id "${id}"`);
    return row;
  }

  /** SENDING/SENT/CANCELLED issues are immutable — see `LOCKED_STATUSES`. */
  private assertEditable(issue: NewsletterIssueRow): void {
    if (LOCKED_STATUSES.includes(issue.status)) {
      throw AppException.conflict(`Issue is "${issue.status}" and can no longer be edited.`);
    }
  }

  private toSummary(row: NewsletterIssueRow): NewsletterIssueSummary {
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

  private toDetail(row: NewsletterIssueRow): NewsletterIssueDetail {
    return {
      id: row.id,
      issueNumber: row.issueNumber,
      slug: row.slug,
      title: row.title,
      subject: row.subject,
      previewText: row.previewText,
      heroTitle: row.heroTitle,
      issueDate: row.issueDate.toISOString(),
      status: row.status,
      content: (row.content ?? {}) as NewsletterIssueContent,
      createdBy: row.createdBy,
      updatedBy: row.updatedBy,
      scheduledAt: row.scheduledAt?.toISOString() ?? null,
      scheduleTimezone: row.scheduleTimezone,
      sendStartedAt: row.sendStartedAt?.toISOString() ?? null,
      sentAt: row.sentAt?.toISOString() ?? null,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
