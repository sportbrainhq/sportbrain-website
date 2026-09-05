import { Injectable } from '@nestjs/common';
import { and, eq, gte, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { quizAttemptQuestionV2, quizAttemptV2, sport } from '../../database/schema';

export interface LifetimeAggregateRow {
  quizzesCompleted: number;
  bestPercentage: number | null;
  averagePercentage: number | null;
  lastQuizAt: Date | null;
}

export interface QuestionAggregateRow {
  questionsAnswered: number;
  correctAnswers: number;
}

export interface SportAggregateRow {
  sportId: string;
  sportName: string;
  quizzesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  bestPercentage: number | null;
}

export interface CategoryAggregateRow {
  category: string;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface DifficultyAggregateRow {
  difficulty: string;
  questionsAnswered: number;
  correctAnswers: number;
}

/**
 * V1 aggregation approach (Part 67): direct SQL aggregates over
 * `quiz_attempt_v2`/`quiz_attempt_question_v2`, no derived stats table. This
 * is the right call until query cost becomes a real problem — a user's
 * lifetime attempt count is not large enough for these `GROUP BY` queries to
 * be slow, and `quiz_attempt_question_v2` stays the single source of truth
 * either way (Part 67).
 */
@Injectable()
export class QuizStatsRepository {
  constructor(private readonly database: DatabaseService) {}

  async lifetime(userId: string): Promise<LifetimeAggregateRow> {
    const [row] = await this.database.db
      .select({
        quizzesCompleted: sql<number>`count(*)`,
        bestPercentage: sql<number | null>`max(${quizAttemptV2.scorePercentage})`,
        averagePercentage: sql<number | null>`avg(${quizAttemptV2.scorePercentage})`,
        lastQuizAt: sql<Date | null>`max(${quizAttemptV2.completedAt})`,
      })
      .from(quizAttemptV2)
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')));
    return (
      row ?? {
        quizzesCompleted: 0,
        bestPercentage: null,
        averagePercentage: null,
        lastQuizAt: null,
      }
    );
  }

  /** Answered-question totals, joined through completed attempts only — an abandoned attempt's answers don't count toward lifetime stats. */
  async questionTotals(userId: string): Promise<QuestionAggregateRow> {
    const [row] = await this.database.db
      .select({
        questionsAnswered: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')));
    return row ?? { questionsAnswered: 0, correctAnswers: 0 };
  }

  async bySport(userId: string): Promise<SportAggregateRow[]> {
    return this.database.db
      .select({
        sportId: sql<string>`coalesce(${quizAttemptV2.sportId}, '00000000-0000-0000-0000-000000000000')`,
        sportName: sql<string>`coalesce(${sport.name}, 'Master Quiz')`,
        quizzesCompleted: sql<number>`count(distinct ${quizAttemptV2.id})`,
        questionsAnswered: sql<number>`count(${quizAttemptQuestionV2.id}) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
        bestPercentage: sql<number | null>`max(${quizAttemptV2.scorePercentage})`,
      })
      .from(quizAttemptV2)
      .leftJoin(sport, eq(quizAttemptV2.sportId, sport.id))
      .leftJoin(quizAttemptQuestionV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .groupBy(quizAttemptV2.sportId, sport.name);
  }

  async byCategory(userId: string): Promise<CategoryAggregateRow[]> {
    return this.database.db
      .select({
        category: quizAttemptQuestionV2.categorySnapshot,
        questionsAnswered: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .groupBy(quizAttemptQuestionV2.categorySnapshot);
  }

  async byDifficulty(userId: string): Promise<DifficultyAggregateRow[]> {
    return this.database.db
      .select({
        difficulty: quizAttemptQuestionV2.difficultySnapshot,
        questionsAnswered: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .groupBy(quizAttemptQuestionV2.difficultySnapshot);
  }

  /** Most-recent-first completed percentages, for the last-5/last-10 rolling accuracy (Part 49). */
  async recentPercentages(userId: string, limit: number): Promise<number[]> {
    const rows = await this.database.db
      .select({ scorePercentage: quizAttemptV2.scorePercentage })
      .from(quizAttemptV2)
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .orderBy(sql`${quizAttemptV2.completedAt} desc`)
      .limit(limit);
    return rows.map((row) => Number(row.scorePercentage ?? 0));
  }

  async questionTotalsSince(userId: string, since: Date): Promise<QuestionAggregateRow> {
    const [row] = await this.database.db
      .select({
        questionsAnswered: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(
        and(
          eq(quizAttemptV2.userId, userId),
          eq(quizAttemptV2.status, 'COMPLETED'),
          gte(quizAttemptV2.completedAt, since),
        ),
      );
    return row ?? { questionsAnswered: 0, correctAnswers: 0 };
  }

  /** Every day (date-truncated, UTC) a completed quiz landed on, most recent first — the raw material for streak calculation (Part 52). */
  async completedDays(userId: string, limit: number): Promise<Date[]> {
    const rows = await this.database.db
      .selectDistinct({ day: sql<Date>`date_trunc('day', ${quizAttemptV2.completedAt})` })
      .from(quizAttemptV2)
      .where(and(eq(quizAttemptV2.userId, userId), eq(quizAttemptV2.status, 'COMPLETED')))
      .orderBy(sql`date_trunc('day', ${quizAttemptV2.completedAt}) desc`)
      .limit(limit);
    return rows.map((row) => row.day);
  }

  async mostPlayedSportSince(
    userId: string,
    since: Date,
  ): Promise<{ sportId: string; sportName: string; count: number } | undefined> {
    const [row] = await this.database.db
      .select({
        sportId: quizAttemptV2.sportId,
        sportName: sport.name,
        count: sql<number>`count(*)`,
      })
      .from(quizAttemptV2)
      .leftJoin(sport, eq(quizAttemptV2.sportId, sport.id))
      .where(
        and(
          eq(quizAttemptV2.userId, userId),
          eq(quizAttemptV2.status, 'COMPLETED'),
          gte(quizAttemptV2.completedAt, since),
        ),
      )
      .groupBy(quizAttemptV2.sportId, sport.name)
      .orderBy(sql`count(*) desc`)
      .limit(1);
    if (!row?.sportId || !row.sportName) return undefined;
    return { sportId: row.sportId, sportName: row.sportName, count: Number(row.count) };
  }

  async byCategorySince(userId: string, since: Date): Promise<CategoryAggregateRow[]> {
    return this.database.db
      .select({
        category: quizAttemptQuestionV2.categorySnapshot,
        questionsAnswered: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.answeredAt} is not null)`,
        correctAnswers: sql<number>`count(*) filter (where ${quizAttemptQuestionV2.isCorrect} = true)`,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(
        and(
          eq(quizAttemptV2.userId, userId),
          eq(quizAttemptV2.status, 'COMPLETED'),
          gte(quizAttemptV2.completedAt, since),
        ),
      )
      .groupBy(quizAttemptQuestionV2.categorySnapshot);
  }
}
