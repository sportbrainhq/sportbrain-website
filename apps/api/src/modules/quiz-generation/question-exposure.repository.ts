import { Injectable } from '@nestjs/common';
import { and, eq, inArray, lt, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { questionExposure } from '../../database/schema';

export type QuestionExposureRow = typeof questionExposure.$inferSelect;

@Injectable()
export class QuestionExposureRepository {
  constructor(private readonly database: DatabaseService) {}

  async findForUser(userId: string, questionIds: string[]): Promise<QuestionExposureRow[]> {
    if (questionIds.length === 0) return [];
    return this.database.db
      .select()
      .from(questionExposure)
      .where(
        and(eq(questionExposure.userId, userId), inArray(questionExposure.questionId, questionIds)),
      );
  }

  /** Every exposure row for this user among the given question ids whose `lastSeenAt` is older than `cutoff` — the cooldown-expired pool. */
  async findEligibleForRepeat(
    userId: string,
    questionIds: string[],
    cutoff: Date,
  ): Promise<QuestionExposureRow[]> {
    if (questionIds.length === 0) return [];
    return this.database.db
      .select()
      .from(questionExposure)
      .where(
        and(
          eq(questionExposure.userId, userId),
          inArray(questionExposure.questionId, questionIds),
          lt(questionExposure.lastSeenAt, cutoff),
        ),
      );
  }

  /** Upserts one row per question served this attempt: increments `timesSeen`, refreshes `lastSeenAt`. Called at quiz-start, before the question is answered. */
  async recordServed(userId: string, questionIds: string[], servedAt: Date): Promise<void> {
    if (questionIds.length === 0) return;
    for (const questionId of questionIds) {
      await this.database.db
        .insert(questionExposure)
        .values({
          userId,
          questionId,
          firstSeenAt: servedAt,
          lastSeenAt: servedAt,
          timesSeen: 1,
        })
        .onConflictDoUpdate({
          target: [questionExposure.userId, questionExposure.questionId],
          set: {
            lastSeenAt: servedAt,
            timesSeen: sql`${questionExposure.timesSeen} + 1`,
            updatedAt: servedAt,
          },
        });
    }
  }

  /** Records the answer outcome on the existing exposure row (created at serve time, so this is always an update). */
  async recordAnswer(
    userId: string,
    questionId: string,
    isCorrect: boolean,
    answeredAt: Date,
  ): Promise<void> {
    await this.database.db
      .update(questionExposure)
      .set({
        timesCorrect: isCorrect
          ? sql`${questionExposure.timesCorrect} + 1`
          : sql`${questionExposure.timesCorrect}`,
        timesIncorrect: isCorrect
          ? sql`${questionExposure.timesIncorrect}`
          : sql`${questionExposure.timesIncorrect} + 1`,
        lastAnsweredCorrectly: isCorrect,
        lastAnsweredAt: answeredAt,
        updatedAt: answeredAt,
      })
      .where(and(eq(questionExposure.userId, userId), eq(questionExposure.questionId, questionId)));
  }
}
