import { Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { quizAttemptQuestionV2, quizAttemptV2 } from '../../database/schema';

export type QuizAttemptRow = typeof quizAttemptV2.$inferSelect;
export type NewQuizAttemptRow = typeof quizAttemptV2.$inferInsert;
export type QuizAttemptQuestionRow = typeof quizAttemptQuestionV2.$inferSelect;
export type NewQuizAttemptQuestionRow = typeof quizAttemptQuestionV2.$inferInsert;

@Injectable()
export class QuizAttemptsRepository {
  constructor(private readonly database: DatabaseService) {}

  /** Creates the attempt and its snapshotted questions as one transaction — an attempt is never visible half-populated. */
  async create(
    attempt: NewQuizAttemptRow,
    questions: Omit<NewQuizAttemptQuestionRow, 'quizAttemptId'>[],
  ): Promise<{ attempt: QuizAttemptRow; questions: QuizAttemptQuestionRow[] }> {
    return this.database.db.transaction(async (tx) => {
      const [createdAttempt] = await tx.insert(quizAttemptV2).values(attempt).returning();
      if (!createdAttempt) throw new Error('Quiz attempt insert returned no row');
      const createdQuestions = questions.length
        ? await tx
            .insert(quizAttemptQuestionV2)
            .values(questions.map((q) => ({ ...q, quizAttemptId: createdAttempt.id })))
            .returning()
        : [];
      return { attempt: createdAttempt, questions: createdQuestions };
    });
  }

  async findByPublicCode(publicCode: string): Promise<QuizAttemptRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(quizAttemptV2)
      .where(eq(quizAttemptV2.publicCode, publicCode))
      .limit(1);
    return row;
  }

  async findById(id: string): Promise<QuizAttemptRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(quizAttemptV2)
      .where(eq(quizAttemptV2.id, id))
      .limit(1);
    return row;
  }

  async findQuestionsForAttempt(attemptId: string): Promise<QuizAttemptQuestionRow[]> {
    return this.database.db
      .select()
      .from(quizAttemptQuestionV2)
      .where(eq(quizAttemptQuestionV2.quizAttemptId, attemptId))
      .orderBy(asc(quizAttemptQuestionV2.position));
  }

  async findAttemptQuestion(
    attemptId: string,
    attemptQuestionId: string,
  ): Promise<QuizAttemptQuestionRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(quizAttemptQuestionV2)
      .where(
        and(
          eq(quizAttemptQuestionV2.quizAttemptId, attemptId),
          eq(quizAttemptQuestionV2.id, attemptQuestionId),
        ),
      )
      .limit(1);
    return row;
  }

  /**
   * Records an answer only if the position is still unanswered — the
   * `isNull(answeredAt)` guard is the idempotency backstop for double-submit
   * (Part 37): a retry of the same request finds zero rows to update and the
   * service layer treats that as "already answered", not as an error.
   */
  async recordAnswer(
    attemptQuestionId: string,
    patch: Pick<
      NewQuizAttemptQuestionRow,
      | 'selectedOptionCode'
      | 'selectedOptionTextSnapshot'
      | 'isCorrect'
      | 'answeredAt'
      | 'responseTimeMs'
    >,
  ): Promise<QuizAttemptQuestionRow | undefined> {
    const [row] = await this.database.db
      .update(quizAttemptQuestionV2)
      .set(patch)
      .where(
        and(
          eq(quizAttemptQuestionV2.id, attemptQuestionId),
          isNull(quizAttemptQuestionV2.answeredAt),
        ),
      )
      .returning();
    return row;
  }

  async updateAttempt(id: string, patch: Partial<NewQuizAttemptRow>): Promise<QuizAttemptRow> {
    const [row] = await this.database.db
      .update(quizAttemptV2)
      .set(patch)
      .where(eq(quizAttemptV2.id, id))
      .returning();
    if (!row) throw new Error(`Quiz attempt "${id}" not found on update`);
    return row;
  }

  /** The one active attempt for a user + quizType (+ sport, for SPORT), if any — Part 38's resume prompt. */
  async findActiveAttempt(
    userId: string,
    quizType: 'SPORT' | 'MASTER',
    sportId: string | null,
  ): Promise<QuizAttemptRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(quizAttemptV2)
      .where(
        and(
          eq(quizAttemptV2.userId, userId),
          eq(quizAttemptV2.quizType, quizType),
          eq(quizAttemptV2.status, 'IN_PROGRESS'),
          quizType === 'SPORT' && sportId ? eq(quizAttemptV2.sportId, sportId) : undefined,
        ),
      )
      .limit(1);
    return row;
  }

  async findRecentForUser(userId: string, limit: number): Promise<QuizAttemptRow[]> {
    return this.database.db
      .select()
      .from(quizAttemptV2)
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .orderBy(desc(quizAttemptV2.completedAt))
      .limit(limit);
  }
}
