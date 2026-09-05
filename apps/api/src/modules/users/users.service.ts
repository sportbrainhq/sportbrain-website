import { Injectable } from '@nestjs/common';
import type { SafeUser, UpdateUserRequest, UserSnapshot } from '@sportbrain/contracts';
import { AppException } from '../../common';
import { SessionService } from '../auth/session.service';
import { QuizStatsService } from '../quiz-stats/quiz-stats.service';
import { UsersRepository, type UserRow } from './users.repository';

/**
 * Account/profile domain logic: reading and updating the account itself,
 * the Snapshot aggregate, and deletion. Not saved items, not following, not
 * quiz history — those are their own modules with their own repositories;
 * this service only reaches into them (via count queries) for the Snapshot
 * numbers, never to mutate them.
 */
@Injectable()
export class UsersService {
  constructor(
    private readonly repository: UsersRepository,
    private readonly sessions: SessionService,
    private readonly quizStats: QuizStatsService,
  ) {}

  async getSafeUser(userId: string): Promise<SafeUser> {
    const user = await this.mustFind(userId);
    return this.toSafeUser(user);
  }

  async updateProfile(userId: string, input: UpdateUserRequest): Promise<SafeUser> {
    await this.mustFind(userId);
    const updated = await this.repository.updateProfile(userId, input);
    if (!updated) throw AppException.notFound('Account not found.');
    return this.toSafeUser(updated);
  }

  /**
   * The "SportBrain Snapshot" on `/profile`. Quiz fields come from
   * `QuizStatsService` — the same aggregation `/me/quiz-stats` uses — so the
   * Snapshot and the dedicated Statistics page (Part 54) can never disagree
   * (Part 49: "do not derive important account metrics separately").
   */
  async getSnapshot(userId: string): Promise<UserSnapshot> {
    const [savedItems, following, lifetime, sportBreakdown] = await Promise.all([
      this.repository.countSavedEntities(userId),
      this.repository.countFollows(userId),
      this.quizStats.lifetime(userId),
      this.quizStats.bySport(userId),
    ]);

    return {
      quizzesPlayed: lifetime.quizzesCompleted,
      correctAnswers: lifetime.correctAnswers,
      accuracyPercent: lifetime.overallAccuracy,
      currentQuizStreak: lifetime.currentStreakDays,
      bestQuizScore: lifetime.bestPercentage !== null ? Math.round(lifetime.bestPercentage) : null,
      sportsExplored: sportBreakdown.length,
      savedItems,
      following,
    };
  }

  /**
   * Soft-delete with PII scrubbing: revokes every session (a deleted
   * account cannot stay logged in anywhere), then scrubs the `users` row.
   * Rows the account owns elsewhere (`quiz_attempts`, `user_activities`,
   * `saved_entities`, `user_follows`) are left in place — they cascade only
   * on a hard delete, and keeping them lets aggregate/derived data stay
   * consistent without carrying any identifying information, since the
   * `users` row they reference no longer does either.
   */
  async deleteAccount(userId: string): Promise<void> {
    await this.mustFind(userId);
    await this.sessions.revokeAllForUser(userId);
    await this.repository.softDeleteAndScrub(userId);
  }

  private async mustFind(userId: string): Promise<UserRow> {
    const user = await this.repository.findById(userId);
    if (!user || user.status !== 'active') throw AppException.notFound('Account not found.');
    return user;
  }

  private toSafeUser(user: UserRow): SafeUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      memberSince: user.createdAt.toISOString(),
    };
  }
}
