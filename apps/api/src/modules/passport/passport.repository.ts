import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { and, desc, eq, gte, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import {
  achievementDefinition,
  quizAttemptQuestionV2,
  quizAttemptV2,
  sport,
  sportBrainScoreSnapshot,
  userAchievement,
  userCategoryKnowledge,
  userQuizActivityDaily,
  userSportBrainProfile,
  userSportKnowledge,
  userStreak,
  type knowledgeLevelEnum,
} from '../../database/schema';

export type KnowledgeLevelDb = (typeof knowledgeLevelEnum.enumValues)[number];
export type SportBrainProfileRow = typeof userSportBrainProfile.$inferSelect;
export type NewSportBrainProfileRow = typeof userSportBrainProfile.$inferInsert;
export type SportKnowledgeRow = typeof userSportKnowledge.$inferSelect;
export type NewSportKnowledgeRow = typeof userSportKnowledge.$inferInsert;
export type CategoryKnowledgeRow = typeof userCategoryKnowledge.$inferSelect;
export type NewCategoryKnowledgeRow = typeof userCategoryKnowledge.$inferInsert;
export type AchievementDefinitionRow = typeof achievementDefinition.$inferSelect;
export type UserAchievementRow = typeof userAchievement.$inferSelect;
export type UserStreakRow = typeof userStreak.$inferSelect;
export type NewUserStreakRow = typeof userStreak.$inferInsert;
export type ScoreSnapshotRow = typeof sportBrainScoreSnapshot.$inferSelect;
export type ActivityDailyRow = typeof userQuizActivityDaily.$inferSelect;

/** Raw shape the scoring engine consumes — sourced from the answer snapshot, never a live `question` join (Part 63/86: historical accuracy). */
export interface AttemptQuestionForScoring {
  questionId: string;
  sportId: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  isCorrect: boolean;
  answeredAt: Date;
}

@Injectable()
export class PassportRepository {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Every answered question for a user, across all attempts (SPORT and
   * MASTER alike — Master Quiz questions are ordinary sport-tagged
   * attempt-questions here, Part 21). Source of truth for every score
   * calculation; everything else in this file is a cache read/write.
   */
  async findAnsweredQuestionsForUser(userId: string): Promise<AttemptQuestionForScoring[]> {
    const rows = await this.database.db
      .select({
        questionId: quizAttemptQuestionV2.questionId,
        sportId: quizAttemptV2.sportId,
        category: quizAttemptQuestionV2.categorySnapshot,
        difficulty: quizAttemptQuestionV2.difficultySnapshot,
        isCorrect: quizAttemptQuestionV2.isCorrect,
        answeredAt: quizAttemptQuestionV2.answeredAt,
      })
      .from(quizAttemptQuestionV2)
      .innerJoin(quizAttemptV2, eq(quizAttemptQuestionV2.quizAttemptId, quizAttemptV2.id))
      .where(
        and(eq(quizAttemptV2.userId, userId), sql`${quizAttemptQuestionV2.answeredAt} is not null`),
      );

    return rows
      .filter((r) => r.sportId !== null && r.isCorrect !== null && r.answeredAt !== null)
      .map((r) => ({
        questionId: r.questionId,
        sportId: r.sportId as string,
        category: r.category,
        difficulty: r.difficulty,
        isCorrect: r.isCorrect as boolean,
        answeredAt: r.answeredAt as Date,
      }));
  }

  async listSports(): Promise<{ id: string; slug: string; name: string }[]> {
    return this.database.db
      .select({ id: sport.id, slug: sport.slug, name: sport.name })
      .from(sport)
      .where(eq(sport.isLaunched, true));
  }

  async findProfile(userId: string): Promise<SportBrainProfileRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(userSportBrainProfile)
      .where(eq(userSportBrainProfile.userId, userId))
      .limit(1);
    return row;
  }

  async findProfileByPublicId(publicId: string): Promise<SportBrainProfileRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(userSportBrainProfile)
      .where(eq(userSportBrainProfile.publicId, publicId))
      .limit(1);
    return row;
  }

  /** Upsert-by-userId. `id`/`publicId`/privacy flags are preserved on update (not part of `patch`) unless explicitly included. */
  async upsertProfile(
    userId: string,
    patch: Omit<NewSportBrainProfileRow, 'id' | 'userId'>,
  ): Promise<SportBrainProfileRow> {
    const [row] = await this.database.db
      .insert(userSportBrainProfile)
      .values({ userId, ...patch })
      .onConflictDoUpdate({
        target: userSportBrainProfile.userId,
        set: { ...patch, updatedAt: sql`now()` },
      })
      .returning();
    if (!row) throw new Error('userSportBrainProfile upsert returned no row');
    return row;
  }

  async updatePrivacy(
    userId: string,
    patch: Partial<
      Pick<
        NewSportBrainProfileRow,
        | 'isPublic'
        | 'showAvatarPublicly'
        | 'showActivityPublicly'
        | 'showStreakPublicly'
        | 'showAchievementsPublicly'
        | 'allowSearchIndexing'
        | 'publicId'
      >
    >,
  ): Promise<SportBrainProfileRow> {
    const [row] = await this.database.db
      .update(userSportBrainProfile)
      .set({ ...patch, updatedAt: sql`now()` })
      .where(eq(userSportBrainProfile.userId, userId))
      .returning();
    if (!row) throw new Error(`No SportBrain profile to update privacy for user ${userId}`);
    return row;
  }

  /** Generates a fresh random URL-safe token, never derived from `userId`/email (Part 47). */
  generatePublicId(): string {
    return randomBytes(18).toString('base64url');
  }

  async listSportKnowledge(userId: string): Promise<SportKnowledgeRow[]> {
    return this.database.db
      .select()
      .from(userSportKnowledge)
      .where(eq(userSportKnowledge.userId, userId))
      .orderBy(desc(userSportKnowledge.score));
  }

  async findSportKnowledge(
    userId: string,
    sportId: string,
  ): Promise<SportKnowledgeRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(userSportKnowledge)
      .where(and(eq(userSportKnowledge.userId, userId), eq(userSportKnowledge.sportId, sportId)))
      .limit(1);
    return row;
  }

  async upsertSportKnowledge(
    userId: string,
    sportId: string,
    patch: Omit<NewSportKnowledgeRow, 'id' | 'userId' | 'sportId'>,
  ): Promise<SportKnowledgeRow> {
    const [row] = await this.database.db
      .insert(userSportKnowledge)
      .values({ userId, sportId, ...patch })
      .onConflictDoUpdate({
        target: [userSportKnowledge.userId, userSportKnowledge.sportId],
        set: patch,
      })
      .returning();
    if (!row) throw new Error('userSportKnowledge upsert returned no row');
    return row;
  }

  async listCategoryKnowledge(userId: string, sportId: string): Promise<CategoryKnowledgeRow[]> {
    return this.database.db
      .select()
      .from(userCategoryKnowledge)
      .where(
        and(eq(userCategoryKnowledge.userId, userId), eq(userCategoryKnowledge.sportId, sportId)),
      )
      .orderBy(desc(userCategoryKnowledge.score));
  }

  async upsertCategoryKnowledge(
    userId: string,
    sportId: string,
    category: string,
    patch: Omit<NewCategoryKnowledgeRow, 'id' | 'userId' | 'sportId' | 'category'>,
  ): Promise<CategoryKnowledgeRow> {
    const [row] = await this.database.db
      .insert(userCategoryKnowledge)
      .values({
        userId,
        sportId,
        category: category as NewCategoryKnowledgeRow['category'],
        ...patch,
      })
      .onConflictDoUpdate({
        target: [
          userCategoryKnowledge.userId,
          userCategoryKnowledge.sportId,
          userCategoryKnowledge.category,
        ],
        set: patch,
      })
      .returning();
    if (!row) throw new Error('userCategoryKnowledge upsert returned no row');
    return row;
  }

  // ---- Achievements ----

  async listActiveAchievementDefinitions(): Promise<AchievementDefinitionRow[]> {
    return this.database.db
      .select()
      .from(achievementDefinition)
      .where(eq(achievementDefinition.isActive, true))
      .orderBy(achievementDefinition.displayOrder);
  }

  async listAllAchievementDefinitions(): Promise<AchievementDefinitionRow[]> {
    return this.database.db
      .select()
      .from(achievementDefinition)
      .orderBy(achievementDefinition.displayOrder);
  }

  async listEarnedAchievements(
    userId: string,
  ): Promise<(UserAchievementRow & { achievement: AchievementDefinitionRow })[]> {
    const rows = await this.database.db
      .select({ userAchievement, achievement: achievementDefinition })
      .from(userAchievement)
      .innerJoin(achievementDefinition, eq(userAchievement.achievementId, achievementDefinition.id))
      .where(eq(userAchievement.userId, userId))
      .orderBy(desc(userAchievement.earnedAt));
    return rows.map((r) => ({ ...r.userAchievement, achievement: r.achievement }));
  }

  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const [row] = await this.database.db
      .select({ id: userAchievement.id })
      .from(userAchievement)
      .where(
        and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, achievementId)),
      )
      .limit(1);
    return row !== undefined;
  }

  /** Idempotent grant (Part 27): relies on the `(userId, achievementId)` unique constraint, no-ops on conflict rather than throwing. */
  async grantAchievement(
    userId: string,
    achievementId: string,
    triggerContext?: Record<string, unknown>,
  ): Promise<UserAchievementRow | undefined> {
    const [row] = await this.database.db
      .insert(userAchievement)
      .values({ userId, achievementId, triggerContext: triggerContext ?? null })
      .onConflictDoNothing({ target: [userAchievement.userId, userAchievement.achievementId] })
      .returning();
    return row;
  }

  // ---- Streaks ----

  async findStreak(
    userId: string,
    streakType: 'DAILY_QUIZ' | 'WEEKLY_SPORTBRAIN',
  ): Promise<UserStreakRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(userStreak)
      .where(and(eq(userStreak.userId, userId), eq(userStreak.streakType, streakType)))
      .limit(1);
    return row;
  }

  async upsertStreak(
    userId: string,
    streakType: 'DAILY_QUIZ' | 'WEEKLY_SPORTBRAIN',
    patch: Omit<NewUserStreakRow, 'id' | 'userId' | 'streakType'>,
  ): Promise<UserStreakRow> {
    const [row] = await this.database.db
      .insert(userStreak)
      .values({ userId, streakType, ...patch })
      .onConflictDoUpdate({
        target: [userStreak.userId, userStreak.streakType],
        set: { ...patch, updatedAt: sql`now()` },
      })
      .returning();
    if (!row) throw new Error('userStreak upsert returned no row');
    return row;
  }

  // ---- Activity ----

  async upsertActivityDaily(
    userId: string,
    date: string,
    delta: {
      quizzesCompleted: number;
      questionsAnswered: number;
      correctAnswers: number;
      sportsPlayed: string[];
    },
  ): Promise<void> {
    const existing = await this.database.db
      .select()
      .from(userQuizActivityDaily)
      .where(and(eq(userQuizActivityDaily.userId, userId), eq(userQuizActivityDaily.date, date)))
      .limit(1);

    if (existing.length === 0) {
      await this.database.db.insert(userQuizActivityDaily).values({
        userId,
        date,
        quizzesCompleted: delta.quizzesCompleted,
        questionsAnswered: delta.questionsAnswered,
        correctAnswers: delta.correctAnswers,
        sportsPlayed: delta.sportsPlayed,
      });
      return;
    }

    const existingRow = existing[0];
    if (!existingRow) return;
    const mergedSports = Array.from(
      new Set([...(existingRow.sportsPlayed as string[]), ...delta.sportsPlayed]),
    );
    await this.database.db
      .update(userQuizActivityDaily)
      .set({
        quizzesCompleted: existingRow.quizzesCompleted + delta.quizzesCompleted,
        questionsAnswered: existingRow.questionsAnswered + delta.questionsAnswered,
        correctAnswers: existingRow.correctAnswers + delta.correctAnswers,
        sportsPlayed: mergedSports,
        updatedAt: sql`now()`,
      })
      .where(eq(userQuizActivityDaily.id, existingRow.id));
  }

  async listActivity(userId: string, sinceDate: string): Promise<ActivityDailyRow[]> {
    return this.database.db
      .select()
      .from(userQuizActivityDaily)
      .where(
        and(eq(userQuizActivityDaily.userId, userId), gte(userQuizActivityDaily.date, sinceDate)),
      )
      .orderBy(userQuizActivityDaily.date);
  }

  // ---- Snapshots ----

  async findSnapshotForDate(userId: string, date: string): Promise<ScoreSnapshotRow | undefined> {
    const [row] = await this.database.db
      .select()
      .from(sportBrainScoreSnapshot)
      .where(
        and(
          eq(sportBrainScoreSnapshot.userId, userId),
          eq(sportBrainScoreSnapshot.snapshotDate, date),
        ),
      )
      .limit(1);
    return row;
  }

  /** At most one row per user per day (Part 40) — upsert on the `(userId, snapshotDate)` unique index. */
  async upsertSnapshot(
    userId: string,
    date: string,
    data: {
      overallScore: number;
      overallLevel: KnowledgeLevelDb;
      sportScores: unknown;
      scoringVersion: string;
    },
  ): Promise<ScoreSnapshotRow> {
    const [row] = await this.database.db
      .insert(sportBrainScoreSnapshot)
      .values({ userId, snapshotDate: date, ...data })
      .onConflictDoUpdate({
        target: [sportBrainScoreSnapshot.userId, sportBrainScoreSnapshot.snapshotDate],
        set: data,
      })
      .returning();
    if (!row) throw new Error('sportbrainScoreSnapshot upsert returned no row');
    return row;
  }

  async listSnapshots(userId: string, sinceDate: string): Promise<ScoreSnapshotRow[]> {
    return this.database.db
      .select()
      .from(sportBrainScoreSnapshot)
      .where(
        and(
          eq(sportBrainScoreSnapshot.userId, userId),
          gte(sportBrainScoreSnapshot.snapshotDate, sinceDate),
        ),
      )
      .orderBy(sportBrainScoreSnapshot.snapshotDate);
  }
}
