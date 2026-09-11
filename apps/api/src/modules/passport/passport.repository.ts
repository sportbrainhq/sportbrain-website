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

  /**
   * One attempt's summary, scoped to `userId` (ownership check baked in —
   * a mismatched owner returns `undefined`, same as not found). Used only
   * by the quiz-result "SportBrain Impact" sync endpoint, which needs the
   * attempt's `quizType`/`sportId`/counts to feed `PassportService` the
   * same `justCompletedQuiz` context the async worker would have used.
   */
  async findOwnedCompletedAttemptSummary(
    userId: string,
    quizAttemptId: string,
  ): Promise<
    | {
        quizType: 'SPORT' | 'MASTER';
        sportId: string | null;
        questionCount: number;
        correctCount: number;
        percentage: number;
        completedAt: Date;
      }
    | undefined
  > {
    const [row] = await this.database.db
      .select({
        userId: quizAttemptV2.userId,
        quizType: quizAttemptV2.quizType,
        sportId: quizAttemptV2.sportId,
        status: quizAttemptV2.status,
        actualQuestionCount: quizAttemptV2.actualQuestionCount,
        correctCount: quizAttemptV2.correctCount,
        scorePercentage: quizAttemptV2.scorePercentage,
        completedAt: quizAttemptV2.completedAt,
      })
      .from(quizAttemptV2)
      .where(eq(quizAttemptV2.id, quizAttemptId))
      .limit(1);

    if (!row || row.userId !== userId || row.status !== 'COMPLETED' || !row.completedAt) {
      return undefined;
    }

    return {
      quizType: row.quizType,
      sportId: row.sportId,
      questionCount: row.actualQuestionCount,
      correctCount: row.correctCount,
      percentage: row.scorePercentage ? Number(row.scorePercentage) : 0,
      completedAt: row.completedAt,
    };
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

  /** Earned count per achievement — admin analytics only (Part 73-74), never exposed per-user. */
  async countEarnedByAchievement(): Promise<Map<string, number>> {
    const rows = await this.database.db
      .select({ achievementId: userAchievement.achievementId, count: sql<number>`count(*)::int` })
      .from(userAchievement)
      .groupBy(userAchievement.achievementId);
    return new Map(rows.map((r) => [r.achievementId, r.count]));
  }

  async setAchievementActive(
    achievementId: string,
    isActive: boolean,
  ): Promise<AchievementDefinitionRow> {
    const [row] = await this.database.db
      .update(achievementDefinition)
      .set({ isActive, updatedAt: sql`now()` })
      .where(eq(achievementDefinition.id, achievementId))
      .returning();
    if (!row) throw new Error(`Achievement definition ${achievementId} not found`);
    return row;
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

  /**
   * Public share lookup by `UserAchievement.id` — an opaque random primary
   * key already, so it doubles as the share token without exposing
   * `userId` (Part 81). Returns nothing unless the earning user has both
   * `isPublic` and `showAchievementsPublicly` set — a private achievement
   * is never renderable via this path even with a valid id.
   */
  async findPublicUserAchievement(
    userAchievementId: string,
  ): Promise<
    | { userAchievement: UserAchievementRow; achievement: AchievementDefinitionRow; userId: string }
    | undefined
  > {
    const [row] = await this.database.db
      .select({
        userAchievement,
        achievement: achievementDefinition,
        profile: userSportBrainProfile,
      })
      .from(userAchievement)
      .innerJoin(achievementDefinition, eq(userAchievement.achievementId, achievementDefinition.id))
      .innerJoin(userSportBrainProfile, eq(userAchievement.userId, userSportBrainProfile.userId))
      .where(eq(userAchievement.id, userAchievementId))
      .limit(1);

    if (!row || !row.profile.isPublic || !row.profile.showAchievementsPublicly) return undefined;

    return {
      userAchievement: row.userAchievement,
      achievement: row.achievement,
      userId: row.userAchievement.userId,
    };
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

  /**
   * True atomic upsert (Part 69/38): the quiz-completion queue worker and
   * the synchronous quiz-result impact fetch can both race to record the
   * same day's activity for the same user within milliseconds of each
   * other. A check-then-insert here would let both see "no row yet" and
   * both attempt an insert, colliding on the unique `(userId, date)` index
   * — `onConflictDoUpdate` with SQL-expression increments instead makes
   * the second writer's insert become an atomic update against whatever
   * the first writer already committed, never a 500.
   */
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
    const sportsPlayedJson = JSON.stringify(delta.sportsPlayed);
    await this.database.db
      .insert(userQuizActivityDaily)
      .values({
        userId,
        date,
        quizzesCompleted: delta.quizzesCompleted,
        questionsAnswered: delta.questionsAnswered,
        correctAnswers: delta.correctAnswers,
        sportsPlayed: delta.sportsPlayed,
      })
      .onConflictDoUpdate({
        target: [userQuizActivityDaily.userId, userQuizActivityDaily.date],
        set: {
          quizzesCompleted: sql`${userQuizActivityDaily.quizzesCompleted} + ${delta.quizzesCompleted}`,
          questionsAnswered: sql`${userQuizActivityDaily.questionsAnswered} + ${delta.questionsAnswered}`,
          correctAnswers: sql`${userQuizActivityDaily.correctAnswers} + ${delta.correctAnswers}`,
          // Distinct-sport union without a read-then-write round trip: cast
          // both sides to jsonb arrays, concatenate, then de-duplicate via
          // a jsonb_agg(DISTINCT ...) over the unnested elements.
          sportsPlayed: sql`(
            select coalesce(jsonb_agg(DISTINCT value), '[]'::jsonb)
            from jsonb_array_elements(${userQuizActivityDaily.sportsPlayed}::jsonb || ${sportsPlayedJson}::jsonb) as value
          )`,
          updatedAt: sql`now()`,
        },
      });
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
