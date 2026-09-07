import { Injectable } from '@nestjs/common';
import { count, desc, eq, sql } from 'drizzle-orm';
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

  /** `monday-brief-2026-09-07` — the date component only; collision suffixing happens in `create`. */
  private slugFromDate(issueDate: Date): string {
    const iso = issueDate.toISOString().slice(0, 10);
    return `monday-brief-${iso}`;
  }
}
