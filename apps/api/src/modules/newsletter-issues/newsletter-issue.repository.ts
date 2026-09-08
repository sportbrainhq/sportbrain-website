import { Injectable } from '@nestjs/common';
import { and, count, desc, eq, sql } from 'drizzle-orm';
import type { NewsletterIssueContent, NewsletterIssueStatus } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { newsletterIssue } from '../../database/schema';

export type NewsletterIssueRow = typeof newsletterIssue.$inferSelect;

export interface CreateIssueInput {
  title: string;
  subject: string;
  previewText: string;
  issueDate: Date;
  createdBy: string | null;
}

/**
 * Repository layer: the only place this domain touches the database.
 *
 * `create` assigns `issueNumber` and `slug` itself, inside the same
 * transaction as the insert — both are uniqueness-critical (see the schema
 * file), and computing them anywhere else risks a race between "read the
 * current max" and "insert" under concurrent creates.
 */
@Injectable()
export class NewsletterIssueRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterIssue)
      .where(eq(newsletterIssue.id, id))
      .limit(1);
    return row ?? null;
  }

  async findAll(
    filters: { status?: NewsletterIssueStatus },
    page: number,
    limit: number,
  ): Promise<{ rows: NewsletterIssueRow[]; total: number }> {
    const where = filters.status ? eq(newsletterIssue.status, filters.status) : undefined;

    const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
      this.database.db
        .select()
        .from(newsletterIssue)
        .where(where)
        .orderBy(desc(newsletterIssue.issueNumber))
        .limit(limit)
        .offset((page - 1) * limit),
      this.database.db.select({ value: count() }).from(newsletterIssue).where(where),
    ]);

    return { rows, total };
  }

  /** The highest existing `issueNumber`, or 0 if none exist yet — for the dashboard's "latest issue" stat and for `nextIssueNumber` below. */
  async maxIssueNumber(): Promise<number> {
    const [row] = await this.database.db
      .select({ value: sql<number>`coalesce(max(${newsletterIssue.issueNumber}), 0)` })
      .from(newsletterIssue);
    return Number(row?.value ?? 0);
  }

  /**
   * Creates a new DRAFT issue, computing `issueNumber` (max + 1) and `slug`
   * (from `issueDate`, suffixed only on collision) inside one transaction so
   * both uniqueness guarantees hold under concurrent creates — see the
   * schema file's unique indexes on both columns.
   */
  async create(input: CreateIssueInput): Promise<NewsletterIssueRow> {
    return this.database.db.transaction(async (tx) => {
      const [{ value: maxNumber } = { value: 0 }] = await tx
        .select({ value: sql<number>`coalesce(max(${newsletterIssue.issueNumber}), 0)` })
        .from(newsletterIssue);
      const issueNumber = Number(maxNumber) + 1;

      const baseSlug = this.slugFromDate(input.issueDate);
      let slug = baseSlug;
      let suffix = 2;
      // Collision loop: only ever iterates when two issues share an
      // `issueDate` (e.g. a duplicated draft) — the common case resolves in
      // one query.
      for (;;) {
        const [existing] = await tx
          .select({ id: newsletterIssue.id })
          .from(newsletterIssue)
          .where(eq(newsletterIssue.slug, slug))
          .limit(1);
        if (!existing) break;
        slug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }

      const [row] = await tx
        .insert(newsletterIssue)
        .values({
          issueNumber,
          slug,
          title: input.title,
          subject: input.subject,
          previewText: input.previewText,
          issueDate: input.issueDate,
          status: 'DRAFT',
          content: {},
          createdBy: input.createdBy,
        })
        .returning();

      if (!row) throw new Error('Insert of newsletter_issue row returned no row');
      return row;
    });
  }

  async updateMeta(
    id: string,
    fields: Partial<{
      title: string;
      subject: string;
      previewText: string;
      heroTitle: string | null;
      issueDate: Date;
    }>,
    updatedBy: string | null,
  ): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ ...fields, updatedBy, updatedAt: new Date() })
      .where(eq(newsletterIssue.id, id))
      .returning();
    return row ?? null;
  }

  /**
   * Shallow-merges the given sections into the stored jsonb `content`
   * document — a section-by-section save (e.g. just `quickRecap`) must never
   * clobber sections the caller didn't touch. Drizzle/Postgres has no typed
   * jsonb merge helper here, so this reads-modifies-writes rather than using
   * `||` at the SQL level, which keeps the merge logic (and its "only
   * top-level keys merge, not deep") visible in application code instead of
   * buried in a raw `sql` fragment.
   */
  async updateContent(
    id: string,
    partialContent: NewsletterIssueContent,
    updatedBy: string | null,
  ): Promise<NewsletterIssueRow | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const merged = {
      ...(existing.content as NewsletterIssueContent),
      ...partialContent,
    };

    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ content: merged, updatedBy, updatedAt: new Date() })
      .where(eq(newsletterIssue.id, id))
      .returning();
    return row ?? null;
  }

  async updateStatus(
    id: string,
    status: NewsletterIssueStatus,
  ): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ status, updatedAt: new Date() })
      .where(eq(newsletterIssue.id, id))
      .returning();
    return row ?? null;
  }

  /**
   * READY -> SCHEDULED, status-guarded in the `WHERE` clause (not just
   * checked in application code beforehand) so a concurrent second call
   * cannot race past a status check that already passed once — mirrors why
   * `claimDueForSending` below guards its own transition the same way.
   */
  async scheduleIssue(
    id: string,
    scheduledAt: Date,
    scheduleTimezone: string,
  ): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ status: 'SCHEDULED', scheduledAt, scheduleTimezone, updatedAt: new Date() })
      .where(and(eq(newsletterIssue.id, id), eq(newsletterIssue.status, 'READY')))
      .returning();
    return row ?? null;
  }

  /** SCHEDULED -> READY, clearing `scheduledAt`. Same status-guard reasoning as `scheduleIssue`. */
  async cancelSchedule(id: string): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ status: 'READY', scheduledAt: null, updatedAt: new Date() })
      .where(and(eq(newsletterIssue.id, id), eq(newsletterIssue.status, 'SCHEDULED')))
      .returning();
    return row ?? null;
  }

  /**
   * Finds every SCHEDULED issue due to send (`scheduledAt <= now`) — read-only,
   * called by `NewsletterIssueSchedulerJob` (D5) before it attempts to claim
   * each one individually via `claimForSending`. Kept as a plain `findAll`-
   * style query rather than an atomic claim itself, because "find candidates"
   * and "claim one" are different operations with different concurrency
   * needs: many rows can be found safely by many replicas, only one may win
   * the claim per row.
   */
  async findDueForSending(now: Date): Promise<NewsletterIssueRow[]> {
    return this.database.db
      .select()
      .from(newsletterIssue)
      .where(
        and(eq(newsletterIssue.status, 'SCHEDULED'), sql`${newsletterIssue.scheduledAt} <= ${now}`),
      );
  }

  /**
   * Atomically claims one due issue for sending: SCHEDULED -> SENDING,
   * guarded by `WHERE status = 'SCHEDULED'` in the same statement as the
   * write. This is the concurrency-safety boundary the whole scheduler
   * depends on — see `NewsletterIssueSchedulerJob`'s own header comment.
   * `returning()` coming back empty means another runner (or a previous tick
   * of this same runner) already claimed it; the caller must treat that as
   * "someone else is handling this", not an error.
   */
  async claimForSending(id: string): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ status: 'SENDING', sendStartedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(newsletterIssue.id, id), eq(newsletterIssue.status, 'SCHEDULED')))
      .returning();
    return row ?? null;
  }

  /**
   * Sets `publishedAt = now()` if not already set (Phase D7, org spec
   * section 49: "when campaign begins sending successfully, publish
   * issue"). Called by `NewsletterIssueSchedulerJob.startCampaign` right
   * after the campaign is moved to SENDING. Guarded by
   * `publishedAt IS NULL` in the `WHERE` clause — not just checked in
   * application code — for the same reason `scheduleIssue`/`cancelSchedule`
   * guard their own transitions in the `WHERE`: a retried/duplicated call
   * for the same issue (e.g. a crash-and-resume, though `claimForSending`'s
   * own guard makes that unlikely for the same campaign attempt) must never
   * push `publishedAt` forward to a later time than the issue's true first
   * publish moment.
   */
  async publishIfUnset(id: string): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({ publishedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(newsletterIssue.id, id), sql`${newsletterIssue.publishedAt} IS NULL`))
      .returning();
    return row ?? null;
  }

  /** Terminal status write once a campaign finishes — SENDING -> SENT/FAILED, `sentAt` set only on SENT. Called by `NewsletterCampaignService.recomputeCampaignCounters`. */
  async markSendOutcome(id: string, status: 'SENT' | 'FAILED'): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .update(newsletterIssue)
      .set({
        status,
        ...(status === 'SENT' ? { sentAt: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(eq(newsletterIssue.id, id))
      .returning();
    return row ?? null;
  }

  /**
   * The public archive's single read (Phase D7): a slug lookup filtered by
   * `publishedAt IS NOT NULL`. Deliberately a new method rather than reusing
   * `findById`/a status filter — `status` is not the public-visibility gate
   * (see the schema file's own comment on `publishedAt`): a DRAFT/READY/
   * SCHEDULED/SENDING-not-yet-started issue must never be reachable here
   * regardless of what `status` says, and `publishedAt` is the one column
   * that is only ever set at the exact moment D7's publication rule fires
   * (`publishIfUnset`, called from the scheduler). Returns `null` for a
   * slug that exists but is not yet published, same as a slug that does not
   * exist at all — the public controller must not be able to distinguish
   * "not published yet" from "never existed" from this method's result.
   */
  async findPublishedBySlug(slug: string): Promise<NewsletterIssueRow | null> {
    const [row] = await this.database.db
      .select()
      .from(newsletterIssue)
      .where(and(eq(newsletterIssue.slug, slug), sql`${newsletterIssue.publishedAt} IS NOT NULL`))
      .limit(1);
    return row ?? null;
  }

  /** Paginated public archive listing (Phase D7) — `publishedAt IS NOT NULL` only, newest issue first by `issueDate` (not `createdAt`/`issueNumber`: the archive is a reader-facing timeline of "when this went out", and `issueDate` is the column that means that). */
  async listPublished(
    page: number,
    limit: number,
  ): Promise<{ rows: NewsletterIssueRow[]; total: number }> {
    const where = sql`${newsletterIssue.publishedAt} IS NOT NULL`;

    const [rows, [{ value: total } = { value: 0 }]] = await Promise.all([
      this.database.db
        .select()
        .from(newsletterIssue)
        .where(where)
        .orderBy(desc(newsletterIssue.issueDate))
        .limit(limit)
        .offset((page - 1) * limit),
      this.database.db.select({ value: count() }).from(newsletterIssue).where(where),
    ]);

    return { rows, total };
  }

  /** `monday-brief-2026-09-07` — the date component only; collision suffixing happens in `create`. */
  private slugFromDate(issueDate: Date): string {
    const iso = issueDate.toISOString().slice(0, 10);
    return `monday-brief-${iso}`;
  }
}
