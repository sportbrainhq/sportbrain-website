import { Injectable } from '@nestjs/common';
import { and, eq, gt, inArray, isNull, lte, or } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { question, questionOption, sport } from '../../database/schema';

export type EligibleQuestionRow = typeof question.$inferSelect;
export type EligibleOptionRow = typeof questionOption.$inferSelect;

/**
 * Reads the pool `QuizGenerationService` selects from: PUBLISHED, currently
 * valid, per sport. This is the only place Part 9's "exclude future/expired/
 * retired/unpublished" rule is implemented — every quiz-generation path
 * (sport and master) goes through this repository rather than querying
 * `question` directly, so the eligibility rule can never drift between them.
 */
@Injectable()
export class EligibleQuestionsRepository {
  constructor(private readonly database: DatabaseService) {}

  async findEligible(sportId: string, now: Date = new Date()): Promise<EligibleQuestionRow[]> {
    return this.database.db
      .select()
      .from(question)
      .where(
        and(
          eq(question.sportId, sportId),
          eq(question.status, 'PUBLISHED'),
          or(isNull(question.validFrom), lte(question.validFrom, now)),
          or(isNull(question.validUntil), gt(question.validUntil, now)),
        ),
      );
  }

  /** Every launched sport with at least one eligible question — the pool `MasterQuizGenerator` allocates across (Part 25). */
  async findLaunchedSportIds(): Promise<string[]> {
    const rows = await this.database.db
      .select({ id: sport.id })
      .from(sport)
      .where(eq(sport.isLaunched, true));
    return rows.map((row) => row.id);
  }

  async findOptionsForQuestions(questionIds: string[]): Promise<Map<string, EligibleOptionRow[]>> {
    if (questionIds.length === 0) return new Map();
    const rows = await this.database.db
      .select()
      .from(questionOption)
      .where(inArray(questionOption.questionId, questionIds));
    const byQuestion = new Map<string, EligibleOptionRow[]>();
    for (const row of rows) {
      const list = byQuestion.get(row.questionId) ?? [];
      list.push(row);
      byQuestion.set(row.questionId, list);
    }
    return byQuestion;
  }
}
