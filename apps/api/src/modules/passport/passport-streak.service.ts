import { Injectable } from '@nestjs/common';
import { PassportRepository } from './passport.repository';

export interface StreakUpdateResult {
  currentWeeklyStreak: number;
  longestWeeklyStreak: number;
  streakChanged: boolean;
}

/**
 * Weekly SportBrain streak (Part 32-36): the primary streak the Passport
 * surfaces. "Qualifying" means completing at least one quiz during a
 * calendar (ISO, Monday-start) week — deliberately weekly rather than daily,
 * so reading the Monday Brief and taking one quiz a week is enough to keep a
 * streak alive (Part 32: "not a habit app requiring daily engagement").
 *
 * Timezone note (Part 33/35): there is no per-user timezone field yet, so
 * week boundaries are computed in UTC. Documented simplification for V1 —
 * a user near a week boundary in a far-UTC timezone may see their qualifying
 * week roll over a few hours off from their local Monday. Revisit once
 * `users` carries a timezone.
 */
@Injectable()
export class PassportStreakService {
  constructor(private readonly repository: PassportRepository) {}

  /** Monday 00:00:00 UTC of the ISO week containing `date`, as `YYYY-MM-DD`. */
  private isoWeekStart(date: Date): string {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = d.getUTCDay(); // 0 = Sunday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diffToMonday);
    return d.toISOString().slice(0, 10);
  }

  private weeksBetween(fromIso: string, toIso: string): number {
    const from = new Date(`${fromIso}T00:00:00.000Z`).getTime();
    const to = new Date(`${toIso}T00:00:00.000Z`).getTime();
    return Math.round((to - from) / (7 * 24 * 60 * 60 * 1000));
  }

  /**
   * Called once per completed quiz. Idempotent within a week (Part 36): the
   * second, third, ... quiz completed in the same qualifying week is a
   * no-op on `currentCount` — only the first qualifying completion of a new
   * week increments it. A missed week resets `currentCount` to 1 rather than
   * incrementing from wherever it was.
   */
  async recordQualifyingActivity(userId: string, completedAt: Date): Promise<StreakUpdateResult> {
    const weekStart = this.isoWeekStart(completedAt);
    const existing = await this.repository.findStreak(userId, 'WEEKLY_SPORTBRAIN');

    if (!existing || !existing.currentPeriodStart) {
      const row = await this.repository.upsertStreak(userId, 'WEEKLY_SPORTBRAIN', {
        currentCount: 1,
        longestCount: Math.max(1, existing?.longestCount ?? 0),
        currentPeriodStart: weekStart,
        lastQualifiedAt: completedAt,
      });
      return {
        currentWeeklyStreak: row.currentCount,
        longestWeeklyStreak: row.longestCount,
        streakChanged: true,
      };
    }

    const weeksSinceLastPeriod = this.weeksBetween(existing.currentPeriodStart, weekStart);

    if (weeksSinceLastPeriod === 0) {
      // Same qualifying week already recorded — no-op (Part 36 idempotency).
      return {
        currentWeeklyStreak: existing.currentCount,
        longestWeeklyStreak: existing.longestCount,
        streakChanged: false,
      };
    }

    const nextCount = weeksSinceLastPeriod === 1 ? existing.currentCount + 1 : 1;
    const nextLongest = Math.max(existing.longestCount, nextCount);

    const row = await this.repository.upsertStreak(userId, 'WEEKLY_SPORTBRAIN', {
      currentCount: nextCount,
      longestCount: nextLongest,
      currentPeriodStart: weekStart,
      lastQualifiedAt: completedAt,
    });

    return {
      currentWeeklyStreak: row.currentCount,
      longestWeeklyStreak: row.longestCount,
      streakChanged: true,
    };
  }

  async getWeeklyStreak(userId: string): Promise<{ current: number; longest: number }> {
    const row = await this.repository.findStreak(userId, 'WEEKLY_SPORTBRAIN');
    return { current: row?.currentCount ?? 0, longest: row?.longestCount ?? 0 };
  }

  async getDailyStreak(userId: string): Promise<{ current: number; longest: number }> {
    const row = await this.repository.findStreak(userId, 'DAILY_QUIZ');
    return { current: row?.currentCount ?? 0, longest: row?.longestCount ?? 0 };
  }

  /**
   * Persists the daily streak too (Part 34), computed the same way
   * `QuizStatsService.computeStreak()` already does live — kept here as a
   * cache write only, `QuizStatsService` remains the presentation source for
   * the Stats page so the two never need to be reconciled by hand.
   */
  async recordDailyActivity(
    userId: string,
    completedAt: Date,
    currentStreakDays: number,
    longestStreakDays: number,
  ): Promise<void> {
    const dateStr = completedAt.toISOString().slice(0, 10);
    await this.repository.upsertStreak(userId, 'DAILY_QUIZ', {
      currentCount: currentStreakDays,
      longestCount: Math.max(longestStreakDays, currentStreakDays),
      currentPeriodStart: dateStr,
      lastQualifiedAt: completedAt,
    });
  }
}
