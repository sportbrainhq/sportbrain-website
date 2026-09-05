import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { questionCandidate, questionGenerationJob } from '../../database/schema';

export type GenerationJobRow = typeof questionGenerationJob.$inferSelect;
export type NewGenerationJobRow = typeof questionGenerationJob.$inferInsert;
export type CandidateRow = typeof questionCandidate.$inferSelect;
export type NewCandidateRow = typeof questionCandidate.$inferInsert;

@Injectable()
export class QuestionGenerationRepository {
  constructor(private readonly database: DatabaseService) {}

  async createJob(data: NewGenerationJobRow): Promise<GenerationJobRow> {
    const [row] = await this.database.db.insert(questionGenerationJob).values(data).returning();
    if (!row) throw new Error('Generation job insert returned no row');
    return row;
  }

  async updateJob(id: string, patch: Partial<NewGenerationJobRow>): Promise<void> {
    await this.database.db
      .update(questionGenerationJob)
      .set(patch)
      .where(eq(questionGenerationJob.id, id));
  }

  async findJobById(id: string): Promise<GenerationJobRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(questionGenerationJob)
      .where(eq(questionGenerationJob.id, id))
      .limit(1);
    return row;
  }

  async listJobs(): Promise<GenerationJobRow[]> {
    return this.database.db
      .select()
      .from(questionGenerationJob)
      .orderBy(desc(questionGenerationJob.createdAt))
      .limit(100);
  }

  async createCandidates(rows: NewCandidateRow[]): Promise<CandidateRow[]> {
    if (rows.length === 0) return [];
    return this.database.db.insert(questionCandidate).values(rows).returning();
  }

  async findCandidatesByJob(generationJobId: string): Promise<CandidateRow[]> {
    return this.database.db
      .select()
      .from(questionCandidate)
      .where(eq(questionCandidate.generationJobId, generationJobId));
  }

  async findCandidateById(id: string): Promise<CandidateRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(questionCandidate)
      .where(eq(questionCandidate.id, id))
      .limit(1);
    return row;
  }

  async updateCandidate(id: string, patch: Partial<NewCandidateRow>): Promise<CandidateRow> {
    const [row] = await this.database.db
      .update(questionCandidate)
      .set(patch)
      .where(eq(questionCandidate.id, id))
      .returning();
    if (!row) throw new Error(`Candidate "${id}" not found on update`);
    return row;
  }
}
