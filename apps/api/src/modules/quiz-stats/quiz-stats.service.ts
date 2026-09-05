import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  CategoryQuizStats,
  DifficultyQuizStats,
  LifetimeQuizStats,
  MonthlyQuizSummary,
  QuestionCategory,
  QuestionDifficulty,
  RecentQuizStats,
  SportQuizStats,
} from '@sportbrain/contracts';
import type { AppConfig } from '../../config';
import { QuizStatsRepository } from './quiz-stats.repository';

const MASTER_SPORT_KEY = '00000000-0000-0000-0000-000000000000';

/**
 * Account quiz statistics (Part 49-52). Every number here is server-computed
 * from `quiz_attempt_v2`/`quiz_attempt_question_v2` — the frontend never
 * derives an aggregate itself (Part 49).
 */
@Injectable()
export class QuizStatsService {
  constructor(
    private readonly repository: QuizStatsRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async lifetime(userId: string): Promise<LifetimeQuizStats> {
    const [aggregate, totals, streak] = await Promise.all([
      this.repository.lifetime(userId),
      this.repository.questionTotals(userId),
      this.computeStreak(userId),
    ]);

    const incorrectAnswers = totals.questionsAnswered - totals.correctAnswers;
    const overallAccuracy = accuracyOf(totals.correctAnswers, totals.questionsAnswered);

    return {
      quizzesCompleted: Number(aggregate.quizzesCompleted),
      questionsAnswered: totals.questionsAnswered,
      correctAnswers: totals.correctAnswers,
      incorrectAnswers,
      overallAccuracy,
      bestPercentage: aggregate.bestPercentage !== null ? Number(aggregate.bestPercentage) : null,
      averagePercentage:
        aggregate.averagePercentage !== null ? Number(aggregate.averagePercentage) : null,
      lastQuizAt: aggregate.lastQuizAt?.toISOString() ?? null,
      currentStreakDays: streak.current,
      longestStreakDays: streak.longest,
    };
  }

  async bySport(userId: string): Promise<SportQuizStats[]> {
    const rows = await this.repository.bySport(userId);
    return rows.map((row) => ({
      sportId: row.sportId === MASTER_SPORT_KEY ? 'master' : row.sportId,
      sportName: row.sportName,
      quizzesCompleted: Number(row.quizzesCompleted),
      questionsAnswered: Number(row.questionsAnswered),
      correctAnswers: Number(row.correctAnswers),
      incorrectAnswers: Number(row.questionsAnswered) - Number(row.correctAnswers),
      accuracy: accuracyOf(Number(row.correctAnswers), Number(row.questionsAnswered)),
      bestPercentage: row.bestPercentage !== null ? Number(row.bestPercentage) : null,
    }));
  }

  /** Only categories meeting the configured minimum sample size (Part 50). */
  async byCategory(userId: string): Promise<CategoryQuizStats[]> {
    const minSample = this.config.get('quiz', { infer: true }).statsMinCategorySample;
    const rows = await this.repository.byCategory(userId);
    return rows
      .filter((row) => Number(row.questionsAnswered) >= minSample)
      .map((row) => ({
        category: row.category as QuestionCategory,
        questionsAnswered: Number(row.questionsAnswered),
        correctAnswers: Number(row.correctAnswers),
        accuracy: accuracyOf(Number(row.correctAnswers), Number(row.questionsAnswered)),
      }));
  }

  async byDifficulty(userId: string): Promise<DifficultyQuizStats[]> {
    const rows = await this.repository.byDifficulty(userId);
    return rows.map((row) => ({
      difficulty: row.difficulty as QuestionDifficulty,
      questionsAnswered: Number(row.questionsAnswered),
      correctAnswers: Number(row.correctAnswers),
      accuracy: accuracyOf(Number(row.correctAnswers), Number(row.questionsAnswered)),
    }));
  }

  async recent(userId: string): Promise<RecentQuizStats> {
    const [last5, last10, since30Days] = await Promise.all([
      this.repository.recentPercentages(userId, 5),
      this.repository.recentPercentages(userId, 10),
      this.repository.questionTotalsSince(userId, daysAgo(30)),
    ]);
    return {
      last5QuizAccuracy: average(last5),
      last10QuizAccuracy: average(last10),
      last30DaysQuestions: since30Days.questionsAnswered,
      last30DaysAccuracy:
        since30Days.questionsAnswered > 0
          ? accuracyOf(since30Days.correctAnswers, since30Days.questionsAnswered)
          : null,
    };
  }

  async monthlySummary(userId: string): Promise<MonthlyQuizSummary> {
    const minSample = this.config.get('quiz', { infer: true }).statsMinCategorySample;
    const now = new Date();
    const thisMonthStart = startOfMonth(now, 0);
    const previousMonthStart = startOfMonth(now, -1);

    // `questionTotalsSince` is open-ended ("since X, through now"), so the
    // previous month's *own* totals (excluding whatever's already counted in
    // `thisMonth`) are derived by subtraction below rather than adding a
    // second bounded-range repository method for one caller.
    const [thisMonth, previousMonth, mostPlayed, categoriesThisMonth] = await Promise.all([
      this.repository.questionTotalsSince(userId, thisMonthStart),
      this.repository.questionTotalsSince(userId, previousMonthStart),
      this.repository.mostPlayedSportSince(userId, thisMonthStart),
      this.repository.byCategorySince(userId, thisMonthStart),
    ]);

    const previousMonthOnly = {
      questionsAnswered: Math.max(0, previousMonth.questionsAnswered - thisMonth.questionsAnswered),
      correctAnswers: Math.max(0, previousMonth.correctAnswers - thisMonth.correctAnswers),
    };

    const thisMonthAccuracy =
      thisMonth.questionsAnswered > 0
        ? accuracyOf(thisMonth.correctAnswers, thisMonth.questionsAnswered)
        : null;
    const previousMonthAccuracy =
      previousMonthOnly.questionsAnswered > 0
        ? accuracyOf(previousMonthOnly.correctAnswers, previousMonthOnly.questionsAnswered)
        : null;

    const strongestCategory =
      categoriesThisMonth
        .filter((row) => Number(row.questionsAnswered) >= minSample)
        .map((row) => ({
          category: row.category as QuestionCategory,
          accuracy: accuracyOf(Number(row.correctAnswers), Number(row.questionsAnswered)),
        }))
        .sort((a, b) => b.accuracy - a.accuracy)[0]?.category ?? null;

    return {
      questionsAnswered: thisMonth.questionsAnswered,
      correctAnswers: thisMonth.correctAnswers,
      accuracy: thisMonthAccuracy,
      accuracyDeltaVsPreviousMonth:
        thisMonthAccuracy !== null && previousMonthAccuracy !== null
          ? Math.round((thisMonthAccuracy - previousMonthAccuracy) * 100) / 100
          : null,
      mostPlayedSportId: mostPlayed?.sportId ?? null,
      mostPlayedSportName: mostPlayed?.sportName ?? null,
      strongestCategory,
    };
  }

  /**
   * Current/longest quiz-streak (Part 52): a day counts if at least one
   * quiz was completed on it. Computed from distinct completed-days,
   * server timezone (UTC, via `date_trunc` in the repository) — a
   * per-user-timezone streak is future work once user timezone is actually
   * captured somewhere.
   */
  private async computeStreak(userId: string): Promise<{ current: number; longest: number }> {
    const days = await this.repository.completedDays(userId, 365);
    if (days.length === 0) return { current: 0, longest: 0 };

    const dayMs = 24 * 60 * 60 * 1000;
    const sorted = [...days].sort((a, b) => b.getTime() - a.getTime());

    let longest = 1;
    let run = 1;
    for (let i = 1; i < sorted.length; i += 1) {
      const gapDays = Math.round((sorted[i - 1]!.getTime() - sorted[i]!.getTime()) / dayMs);
      if (gapDays === 1) {
        run += 1;
      } else {
        longest = Math.max(longest, run);
        run = 1;
      }
    }
    longest = Math.max(longest, run);

    // Current streak: only counts if the most recent completed day is today
    // or yesterday (server date) — a streak that hasn't been continued
    // today or yesterday is over, not "1 day long."
    const today = startOfDay(new Date());
    const mostRecentGapDays = Math.round((today.getTime() - sorted[0]!.getTime()) / dayMs);
    if (mostRecentGapDays > 1) return { current: 0, longest };

    let current = 1;
    for (let i = 1; i < sorted.length; i += 1) {
      const gapDays = Math.round((sorted[i - 1]!.getTime() - sorted[i]!.getTime()) / dayMs);
      if (gapDays === 1) current += 1;
      else break;
    }

    return { current, longest };
  }
}

function accuracyOf(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 10_000) / 100;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function startOfMonth(date: Date, monthOffset: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + monthOffset, 1));
}
