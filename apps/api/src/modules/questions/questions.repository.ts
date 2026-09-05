import { Injectable } from '@nestjs/common';
import { and, count, eq, like, ne, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { question, questionOption, sport } from '../../database/schema';

export type QuestionRow = typeof question.$inferSelect;
export type QuestionOptionRow = typeof questionOption.$inferSelect;
export type NewQuestionRow = typeof question.$inferInsert;
export type NewQuestionOptionRow = typeof questionOption.$inferInsert;

export interface QuestionWithOptions {
  question: QuestionRow;
  options: QuestionOptionRow[];
}

/**
 * Direct-drizzle access to the Question Bank. Every write that touches both
 * `question` and `question_option` goes through a transaction here — a
 * question with zero, three, or five rows in `question_option` is a state
 * `QuestionValidationService` has already rejected, and the insert itself
 * must not be able to produce it half-written.
 */
@Injectable()
export class QuestionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async findByFingerprint(questionFingerprint: string): Promise<QuestionRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(question)
      .where(eq(question.questionFingerprint, questionFingerprint))
      .limit(1);
    return row;
  }

  /**
   * All non-rejected/non-retired questions sharing a `factKey`, for the
   * fact-duplicate validator (Part 7.2). Rejected/retired rows are excluded:
   * a question that was rejected or retired is not "already covered" — a
   * fresh attempt at the same fact should not be blocked by a dead row.
   */
  async findByFactKey(factKey: string, excludeQuestionId?: string): Promise<QuestionRow[]> {
    const conditions = [
      eq(question.factKey, factKey),
      ne(question.status, 'REJECTED'),
      ne(question.status, 'RETIRED'),
    ];
    if (excludeQuestionId) {
      conditions.push(ne(question.id, excludeQuestionId));
    }
    return this.database.db
      .select()
      .from(question)
      .where(and(...conditions));
  }

  /**
   * `sport.slug` for a given `sportId`, needed to validate `category` against
   * `CATEGORY_BY_SPORT` and to assign a question code's short code. A direct
   * query against `sport` rather than a dependency on `SportsService`, so
   * this module doesn't need to import all of `SportsModule` for one column.
   */
  async findSportSlugById(sportId: string): Promise<string | undefined> {
    const [row] = await this.database.db
      .select({ slug: sport.slug })
      .from(sport)
      .where(eq(sport.id, sportId))
      .limit(1);
    return row?.slug;
  }

  async findById(id: string): Promise<QuestionWithOptions | undefined> {
    const [row] = await this.database.db
      .select()
      .from(question)
      .where(eq(question.id, id))
      .limit(1);
    if (!row) return undefined;
    const options = await this.database.db
      .select()
      .from(questionOption)
      .where(eq(questionOption.questionId, id));
    return { question: row, options };
  }

  async findByCode(questionCode: string): Promise<QuestionWithOptions | undefined> {
    const [row] = await this.database.db
      .select()
      .from(question)
      .where(eq(question.questionCode, questionCode))
      .limit(1);
    if (!row) return undefined;
    const options = await this.database.db
      .select()
      .from(questionOption)
      .where(eq(questionOption.questionId, row.id));
    return { question: row, options };
  }

  /** Count of existing codes under a prefix (e.g. `SBQ-FB-`), for `QuestionCodeService`'s next-sequence lookup. */
  async countByCodePrefix(prefix: string): Promise<number> {
    const [row] = await this.database.db
      .select({ value: count() })
      .from(question)
      .where(like(question.questionCode, `${prefix}%`));
    return row?.value ?? 0;
  }

  /**
   * Inserts the question and its four options as one transaction. Validation
   * (schema, duplicate, option shape) must already have passed by the time
   * this is called — this method trusts its input and only guarantees
   * atomicity, not correctness.
   */
  async create(
    questionData: NewQuestionRow,
    options: Omit<NewQuestionOptionRow, 'questionId'>[],
  ): Promise<QuestionWithOptions> {
    return this.database.db.transaction(async (tx) => {
      const [createdQuestion] = await tx.insert(question).values(questionData).returning();
      if (!createdQuestion) {
        throw new Error('Question insert returned no row');
      }
      const createdOptions = await tx
        .insert(questionOption)
        .values(options.map((option) => ({ ...option, questionId: createdQuestion.id })))
        .returning();
      return { question: createdQuestion, options: createdOptions };
    });
  }

  /**
   * Increments `reportCount` and, once it crosses `flagThreshold`, sets
   * `flaggedForReview` — a quality signal for admins (Part 45-46), never an
   * automatic unpublish. Returns the row's post-increment report count so
   * the caller can decide whether this report just crossed the threshold.
   */
  async incrementReportCount(questionId: string, flagThreshold: number): Promise<number> {
    const [row] = await this.database.db
      .update(question)
      .set({
        reportCount: sql`${question.reportCount} + 1`,
        flaggedForReview: sql`(${question.reportCount} + 1) >= ${flagThreshold}`,
      })
      .where(eq(question.id, questionId))
      .returning({ reportCount: question.reportCount });
    return row?.reportCount ?? 0;
  }
}
