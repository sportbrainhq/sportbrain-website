import { Injectable } from '@nestjs/common';
import { desc, eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { contactSubmission } from '../../database/schema';
import type { ContactCategory, ContactStatus } from '@sportbrain/contracts';

export interface CreateContactSubmissionInput {
  referenceCode: string;
  userId: string | null;
  category: ContactCategory;
  name: string;
  email: string;
  subject: string;
  message: string;
  pageUrl: string | null;
  sourceUrl: string | null;
  metadata: Record<string, unknown>;
}

export type ContactSubmissionRow = typeof contactSubmission.$inferSelect;

/**
 * Repository layer: the only place this domain touches the database.
 *
 * Public users never read through this repository at all — see
 * `ContactController`, which exposes only `POST /contact` (write) and gates
 * every read behind `InternalApiKeyGuard`. There is therefore no "published
 * rows only" filter to apply here the way other repositories do; every row is
 * internal by construction.
 */
@Injectable()
export class ContactRepository {
  constructor(private readonly database: DatabaseService) {}

  async create(input: CreateContactSubmissionInput): Promise<ContactSubmissionRow> {
    const [row] = await this.database.db.insert(contactSubmission).values(input).returning();

    if (!row) throw new Error('Insert of contact_submission row returned no row');
    return row;
  }

  async findById(id: string): Promise<ContactSubmissionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(contactSubmission)
      .where(eq(contactSubmission.id, id))
      .limit(1);
    return row ?? null;
  }

  async findAll(params: { page: number; limit: number }): Promise<{
    rows: ContactSubmissionRow[];
    total: number;
  }> {
    const offset = (params.page - 1) * params.limit;

    const [rows, countRows] = await Promise.all([
      this.database.db
        .select()
        .from(contactSubmission)
        .orderBy(desc(contactSubmission.createdAt))
        .limit(params.limit)
        .offset(offset),
      this.database.db.select({ count: sql<number>`count(*)::int` }).from(contactSubmission),
    ]);

    return { rows, total: countRows[0]?.count ?? 0 };
  }

  async updateStatus(
    id: string,
    status: ContactStatus,
    resolvedAt: Date | null,
  ): Promise<ContactSubmissionRow | null> {
    const [row] = await this.database.db
      .update(contactSubmission)
      .set({ status, resolvedAt, updatedAt: new Date() })
      .where(eq(contactSubmission.id, id))
      .returning();

    return row ?? null;
  }
}
