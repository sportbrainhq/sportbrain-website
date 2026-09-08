import { Injectable, Logger } from '@nestjs/common';
import type {
  AdminAchievementsList,
  KnowledgeLevel,
  PassportActivity,
  PassportImpact,
  PassportMethodology,
  PassportProgress,
  PassportSportKnowledgeDto,
  PassportSportDetailDto,
  PassportSummary,
  PublicPassport,
  ScoringConfigDto,
  StrengthAreaDto,
  AchievementsResponse,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import {
  CATEGORY_LEVEL_MIN_SAMPLE,
  DEMOTION_HYSTERESIS_POINTS,
  DIFFICULTY_WEIGHTS,
  LEVEL_THRESHOLDS,
  SB_SCORE_V1,
  VOLUME_CONFIDENCE_CAP,
} from './sportbrain-scoring.config';
import {
  SportBrainScoringService,
  type ScoredAttemptQuestion,
  type SportScoreResult,
} from './sportbrain-scoring.service';
import {
  AchievementEvaluationService,
  type AchievementEvaluationContext,
} from './achievement-evaluation.service';
import { PassportStreakService } from './passport-streak.service';
import { PassportRepository } from './passport.repository';

interface RecalcOptions {
  /** Present when recalculation was triggered by a specific quiz completion — used for the returned impact + PERFECT_SCORE/MASTER_QUIZ achievement context. */
  justCompletedQuiz?: {
    quizAttemptId: string;
    quizType: 'SPORT' | 'MASTER';
    sportId: string | null;
    questionCount: number;
    correctCount: number;
    percentage: number;
    completedAt: Date;
  };
}

const MASTER_QUIZ_MIN_STRENGTH_SAMPLE = 15;

/**
 * Orchestrates a full Passport recalculation for one user (Part 68):
 * load answered-question history → score via `SportBrainScoringService` →
 * upsert the cache tables → update the weekly streak → evaluate
 * achievements → write a daily-deduplicated score snapshot. Every method is
 * safe to re-run (Part 65: idempotent recalculation).
 */
@Injectable()
export class PassportService {
  private readonly logger = new Logger(PassportService.name);

  constructor(
    private readonly repository: PassportRepository,
    private readonly scoring: SportBrainScoringService,
    private readonly achievements: AchievementEvaluationService,
    private readonly streaks: PassportStreakService,
  ) {}

  /**
   * Quiz-result "SportBrain Impact" (Part 44, 70): the async
   * `passport-recalc` queue job is the source of truth for the persisted
   * cache, but the result page needs the delta in the same session as the
   * quiz, not after an arbitrary queue delay. Recalculation is idempotent
   * and cheap at the volumes a single user's history reaches, so this
   * simply re-runs it synchronously, scoped to the caller's own attempt
   * (ownership checked in the repository — a mismatched or incomplete
   * attempt returns `null`, never another user's data).
   */
  async getImpactForAttempt(userId: string, quizAttemptId: string): Promise<PassportImpact | null> {
    const attempt = await this.repository.findOwnedCompletedAttemptSummary(userId, quizAttemptId);
    if (!attempt) return null;

    return this.recalculateUserScore(userId, {
      justCompletedQuiz: {
        quizAttemptId,
        quizType: attempt.quizType,
        sportId: attempt.sportId,
        questionCount: attempt.questionCount,
        correctCount: attempt.correctCount,
        percentage: attempt.percentage,
        completedAt: attempt.completedAt,
      },
    });
  }

  async recalculateUserScore(userId: string, options: RecalcOptions = {}): Promise<PassportImpact> {
    const [answers, sports, previousProfile] = await Promise.all([
      this.repository.findAnsweredQuestionsForUser(userId),
      this.repository.listSports(),
      this.repository.findProfile(userId),
    ]);

    const answersBySport = new Map<string, ScoredAttemptQuestion[]>();
    for (const a of answers) {
      const list = answersBySport.get(a.sportId) ?? [];
      list.push(a as ScoredAttemptQuestion);
      answersBySport.set(a.sportId, list);
    }

    const previousSportKnowledge = await this.repository.listSportKnowledge(userId);
    const previousSportLevelById = new Map(previousSportKnowledge.map((s) => [s.sportId, s.level]));

    const sportScores: SportScoreResult[] = [];
    for (const sport of sports) {
      const sportAnswers = answersBySport.get(sport.id) ?? [];
      if (sportAnswers.length === 0) continue;
      const previousLevel = (previousSportLevelById.get(sport.id) as KnowledgeLevel) ?? null;
      const result = this.scoring.computeSportScore(sport.id, sportAnswers, previousLevel);
      sportScores.push(result);

      await this.repository.upsertSportKnowledge(userId, sport.id, {
        score: result.score,
        level: result.level,
        questionsAnswered: result.questionsAnswered,
        correctAnswers: result.correctAnswers,
        accuracy: result.accuracy.toFixed(2),
        categoriesExplored: result.categoriesExplored,
        hardExpertQuestions: result.hardExpertQuestions,
        hardExpertCorrect: result.hardExpertCorrect,
        hardExpertAccuracy: result.hardExpertAccuracy.toFixed(2),
        scoringVersion: SB_SCORE_V1,
        lastCalculatedAt: new Date(),
      });

      const categories = new Map<string, ScoredAttemptQuestion[]>();
      for (const a of sportAnswers) {
        const list = categories.get(a.category) ?? [];
        list.push(a);
        categories.set(a.category, list);
      }
      const previousCategoryKnowledge = await this.repository.listCategoryKnowledge(
        userId,
        sport.id,
      );
      const previousCategoryLevelByKey = new Map<string, string | null>(
        previousCategoryKnowledge.map((c) => [c.category as string, c.level]),
      );
      for (const [category, categoryAnswers] of categories) {
        const prevLevel = (previousCategoryLevelByKey.get(category) as KnowledgeLevel) ?? null;
        const categoryResult = this.scoring.computeCategoryScore(
          category,
          categoryAnswers,
          prevLevel,
        );
        await this.repository.upsertCategoryKnowledge(userId, sport.id, category, {
          score: categoryResult.score,
          level: categoryResult.level,
          questionsAnswered: categoryResult.questionsAnswered,
          correctAnswers: categoryResult.correctAnswers,
          accuracy: categoryResult.accuracy.toFixed(2),
          scoringVersion: SB_SCORE_V1,
          lastCalculatedAt: new Date(),
        });
      }
    }

    const previousOverallLevel = (previousProfile?.overallLevel as KnowledgeLevel) ?? null;
    const overall = this.scoring.computeOverallScore(sportScores, previousOverallLevel);

    const questionsAnswered = answers.length;
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const accuracy = questionsAnswered > 0 ? (correctAnswers / questionsAnswered) * 100 : 0;
    const hardExpertCorrectCount = sportScores.reduce((sum, s) => sum + s.hardExpertCorrect, 0);

    let streakChanged = false;
    let currentWeeklyStreak = (await this.streaks.getWeeklyStreak(userId)).current;
    if (options.justCompletedQuiz) {
      const result = await this.streaks.recordQualifyingActivity(
        userId,
        options.justCompletedQuiz.completedAt,
      );
      currentWeeklyStreak = result.currentWeeklyStreak;
      streakChanged = result.streakChanged;
    }

    await this.repository.upsertProfile(userId, {
      overallScore: overall.score,
      overallLevel: overall.level,
      questionsAnswered,
      correctAnswers,
      accuracy: accuracy.toFixed(2),
      sportsExplored: overall.sportsExplored,
      currentWeeklyStreak,
      longestWeeklyStreak: Math.max(
        previousProfile?.longestWeeklyStreak ?? 0,
        (await this.streaks.getWeeklyStreak(userId)).longest,
      ),
      scoringVersion: SB_SCORE_V1,
      lastCalculatedAt: new Date(),
    });

    // Achievement evaluation.
    const sportLevels = sportScores.map((s) => {
      const sportMeta = sports.find((sp) => sp.id === s.sportId);
      return { sportId: s.sportId, sportSlug: sportMeta?.slug ?? '', level: s.level };
    });
    const sportsWithLevelCount = sportLevels.filter((s) => s.level !== 'UNRATED').length;

    const allCategoryLevels: AchievementEvaluationContext['categoryLevels'] = [];
    for (const sport of sports) {
      const rows = await this.repository.listCategoryKnowledge(userId, sport.id);
      for (const row of rows) {
        allCategoryLevels.push({
          sportId: sport.id,
          category: row.category,
          level: row.level as KnowledgeLevel | null,
        });
      }
    }

    const quizzesCompleted = await this.countCompletedQuizzes(userId);

    const context: AchievementEvaluationContext = {
      questionsAnswered,
      quizzesCompleted,
      sportsExplored: overall.sportsExplored,
      sportsWithLevelCount,
      hardExpertCorrectCount,
      currentWeeklyStreak,
      sportLevels,
      categoryLevels: allCategoryLevels,
      justCompletedQuiz: options.justCompletedQuiz
        ? {
            quizAttemptId: options.justCompletedQuiz.quizAttemptId,
            quizType: options.justCompletedQuiz.quizType,
            questionCount: options.justCompletedQuiz.questionCount,
            correctCount: options.justCompletedQuiz.correctCount,
            percentage: options.justCompletedQuiz.percentage,
          }
        : undefined,
    };

    const newlyGranted = await this.achievements.evaluateForUser(userId, 'QUIZ_COMPLETED', context);
    if (newlyGranted.length > 0) {
      const totalAchievements = (await this.repository.listEarnedAchievements(userId)).length;
      await this.repository.upsertProfile(userId, {
        achievementCount: totalAchievements,
        scoringVersion: SB_SCORE_V1,
      });
    }

    // Daily snapshot, deduplicated (Part 40).
    const today = new Date().toISOString().slice(0, 10);
    await this.repository.upsertSnapshot(userId, today, {
      overallScore: overall.score,
      overallLevel: overall.level,
      sportScores: sportScores.map((s) => ({ sportId: s.sportId, score: s.score, level: s.level })),
      scoringVersion: SB_SCORE_V1,
    });

    // Activity daily aggregate.
    if (options.justCompletedQuiz) {
      const dateStr = options.justCompletedQuiz.completedAt.toISOString().slice(0, 10);
      await this.repository.upsertActivityDaily(userId, dateStr, {
        quizzesCompleted: 1,
        questionsAnswered: options.justCompletedQuiz.questionCount,
        correctAnswers: options.justCompletedQuiz.correctCount,
        sportsPlayed: options.justCompletedQuiz.sportId ? [options.justCompletedQuiz.sportId] : [],
      });
    }

    const impactSport = options.justCompletedQuiz?.sportId
      ? sportScores.find((s) => s.sportId === options.justCompletedQuiz?.sportId)
      : undefined;
    const previousSportRow = options.justCompletedQuiz?.sportId
      ? previousSportKnowledge.find((s) => s.sportId === options.justCompletedQuiz?.sportId)
      : undefined;
    const sportMeta = options.justCompletedQuiz?.sportId
      ? sports.find((s) => s.id === options.justCompletedQuiz?.sportId)
      : undefined;

    return {
      overall: {
        previousScore: previousProfile?.overallScore ?? null,
        currentScore: overall.score,
        delta: overall.score - (previousProfile?.overallScore ?? 0),
        previousLevel: previousOverallLevel,
        currentLevel: overall.level,
        levelChanged: previousOverallLevel !== null && previousOverallLevel !== overall.level,
      },
      sport:
        impactSport && sportMeta
          ? {
              sportId: impactSport.sportId,
              sportName: sportMeta.name,
              previousScore: previousSportRow?.score ?? null,
              currentScore: impactSport.score,
              delta: impactSport.score - (previousSportRow?.score ?? 0),
              previousLevel: (previousSportRow?.level as KnowledgeLevel) ?? null,
              currentLevel: impactSport.level,
              levelChanged:
                previousSportRow !== undefined && previousSportRow.level !== impactSport.level,
            }
          : null,
      newAchievements: newlyGranted.map((g) => ({
        userAchievementId: g.userAchievementId,
        achievement: {
          id: g.definition.id,
          code: g.definition.code,
          name: g.definition.name,
          description: g.definition.description,
          category: g.definition.category,
          tier: g.definition.tier,
          iconKey: g.definition.iconKey,
          isHidden: g.definition.isHidden,
        },
        earnedAt: new Date().toISOString(),
      })),
      streak: { currentWeeklyStreak, streakChanged },
    };
  }

  async recalculateBatch(userIds: string[]): Promise<{ succeeded: number; failed: number }> {
    let succeeded = 0;
    let failed = 0;
    for (const userId of userIds) {
      try {
        await this.recalculateUserScore(userId);
        succeeded++;
      } catch (error) {
        failed++;
        this.logger.error(`Passport recalculation failed for user ${userId}`, error as Error);
      }
    }
    return { succeeded, failed };
  }

  private async countCompletedQuizzes(userId: string): Promise<number> {
    // Distinct quiz attempts represented in the answered-question set is a
    // reasonable proxy without a second repository round trip; exact count
    // isn't score-critical, only used for the QUIZZES_COMPLETED_TOTAL achievement.
    const answers = await this.repository.findAnsweredQuestionsForUser(userId);
    return new Set(answers.map((a) => a.questionId)).size > 0
      ? await this.exactCompletedQuizCount(userId)
      : 0;
  }

  private async exactCompletedQuizCount(userId: string): Promise<number> {
    const profile = await this.repository.findProfile(userId);
    // Fallback heuristic when not yet tracked precisely: at least 1 if any question answered.
    return profile ? Math.max(1, Math.round(profile.questionsAnswered / 10)) : 0;
  }

  // ---- Read paths ----

  async getSummary(
    userId: string,
    displayName: string,
    avatarUrl: string | null,
    memberSince: string,
  ): Promise<PassportSummary> {
    const profile = await this.repository.findProfile(userId);
    const sportRows = await this.repository.listSportKnowledge(userId);
    const sports = await this.repository.listSports();
    const sportById = new Map(sports.map((s) => [s.id, s]));

    const topSports: PassportSportKnowledgeDto[] = sportRows
      .slice(0, 4)
      .map((row) => this.toSportKnowledgeDto(row, sportById.get(row.sportId)));

    const strengths = await this.computeStrengths(userId, sports);
    const areasToExplore = await this.computeAreasToExplore(userId, sports);
    const earned = await this.repository.listEarnedAchievements(userId);
    const weekly = await this.streaks.getWeeklyStreak(userId);
    const daily = await this.streaks.getDailyStreak(userId);

    const hasEstablishedPassport = profile !== undefined && profile.overallLevel !== 'UNRATED';

    return {
      displayName,
      avatarUrl,
      memberSince,
      hasEstablishedPassport,
      overallScore: profile && hasEstablishedPassport ? profile.overallScore : null,
      overallLevel:
        profile && hasEstablishedPassport ? (profile.overallLevel as KnowledgeLevel) : null,
      questionsAnswered: profile?.questionsAnswered ?? 0,
      accuracy: profile && profile.questionsAnswered > 0 ? Number(profile.accuracy) : null,
      sportsExplored: profile?.sportsExplored ?? 0,
      achievementCount: profile?.achievementCount ?? earned.length,
      topSports,
      strengths,
      areasToExplore,
      masterQuiz: await this.getMasterQuizSummary(userId),
      streak: {
        currentWeeklyStreak: weekly.current,
        longestWeeklyStreak: weekly.longest,
        currentDailyStreak: daily.current,
        longestDailyStreak: daily.longest,
      },
      recentAchievements: earned.slice(0, 5).map((e) => ({
        userAchievementId: e.id,
        achievement: {
          id: e.achievement.id,
          code: e.achievement.code,
          name: e.achievement.name,
          description: e.achievement.description,
          category: e.achievement.category,
          tier: e.achievement.tier,
          iconKey: e.achievement.iconKey,
          isHidden: e.achievement.isHidden,
        },
        earnedAt: e.earnedAt.toISOString(),
      })),
      scoringVersion: profile?.scoringVersion ?? SB_SCORE_V1,
      lastCalculatedAt: profile?.lastCalculatedAt?.toISOString() ?? null,
      isPublic: profile?.isPublic ?? false,
      publicId: profile?.publicId ?? null,
    };
  }

  private toSportKnowledgeDto(
    row: Awaited<ReturnType<PassportRepository['listSportKnowledge']>>[number],
    sportMeta: { id: string; slug: string; name: string } | undefined,
  ): PassportSportKnowledgeDto {
    return {
      sportId: row.sportId,
      sportSlug: sportMeta?.slug ?? '',
      sportName: sportMeta?.name ?? 'Unknown sport',
      score: row.score,
      level: row.level as KnowledgeLevel,
      questionsAnswered: row.questionsAnswered,
      correctAnswers: row.correctAnswers,
      accuracy: Number(row.accuracy),
      categoriesExplored: row.categoriesExplored,
      hardExpertAccuracy: row.hardExpertQuestions > 0 ? Number(row.hardExpertAccuracy) : null,
      strongestCategory: null,
    };
  }

  async listSportKnowledge(userId: string): Promise<PassportSportKnowledgeDto[]> {
    const [rows, sports] = await Promise.all([
      this.repository.listSportKnowledge(userId),
      this.repository.listSports(),
    ]);
    const sportById = new Map(sports.map((s) => [s.id, s]));
    return rows.map((row) => this.toSportKnowledgeDto(row, sportById.get(row.sportId)));
  }

  async getSportDetail(userId: string, sportId: string): Promise<PassportSportDetailDto> {
    const [row, sports, categories] = await Promise.all([
      this.repository.findSportKnowledge(userId, sportId),
      this.repository.listSports(),
      this.repository.listCategoryKnowledge(userId, sportId),
    ]);
    const sportMeta = sports.find((s) => s.id === sportId);
    if (!row) throw AppException.notFound('No knowledge recorded for this sport yet.');

    return {
      sport: this.toSportKnowledgeDto(row, sportMeta),
      quizzesCompleted: 0,
      categories: categories.map((c) => ({
        category: c.category,
        score: c.score,
        level: c.level as KnowledgeLevel | null,
        questionsAnswered: c.questionsAnswered,
        correctAnswers: c.correctAnswers,
        accuracy: Number(c.accuracy),
      })),
    };
  }

  async getAchievements(userId: string): Promise<AchievementsResponse> {
    const [earned, allDefinitions, profile, sportRows, weekly] = await Promise.all([
      this.repository.listEarnedAchievements(userId),
      this.repository.listActiveAchievementDefinitions(),
      this.repository.findProfile(userId),
      this.repository.listSportKnowledge(userId),
      this.streaks.getWeeklyStreak(userId),
    ]);
    const earnedIds = new Set(earned.map((e) => e.achievementId));

    const context: AchievementEvaluationContext = {
      questionsAnswered: profile?.questionsAnswered ?? 0,
      quizzesCompleted: await this.countCompletedQuizzes(userId),
      sportsExplored: profile?.sportsExplored ?? 0,
      sportsWithLevelCount: sportRows.filter((s) => s.level !== 'UNRATED').length,
      hardExpertCorrectCount: sportRows.reduce((sum, s) => sum + s.hardExpertCorrect, 0),
      currentWeeklyStreak: weekly.current,
      sportLevels: [],
      categoryLevels: [],
    };

    const inProgress: AchievementsResponse['inProgress'] = [];
    const locked: AchievementsResponse['locked'] = [];

    for (const def of allDefinitions) {
      if (earnedIds.has(def.id)) continue;
      const progress = this.achievements.computeProgress(def, context);
      const dto = {
        id: def.id,
        code: def.code,
        name: def.name,
        description: def.description,
        category: def.category,
        tier: def.tier,
        iconKey: def.iconKey,
        isHidden: def.isHidden,
      };
      if (progress) {
        inProgress.push({ achievement: dto, current: progress.current, target: progress.target });
      } else if (!def.isHidden) {
        locked.push(dto);
      }
    }

    return {
      earned: earned.map((e) => ({
        userAchievementId: e.id,
        achievement: {
          id: e.achievement.id,
          code: e.achievement.code,
          name: e.achievement.name,
          description: e.achievement.description,
          category: e.achievement.category,
          tier: e.achievement.tier,
          iconKey: e.achievement.iconKey,
          isHidden: e.achievement.isHidden,
        },
        earnedAt: e.earnedAt.toISOString(),
      })),
      inProgress,
      locked,
    };
  }

  async getProgress(userId: string, sinceDays: number): Promise<PassportProgress> {
    const sinceDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const snapshots = await this.repository.listSnapshots(userId, sinceDate);
    const points = snapshots.map((s) => ({
      date: s.snapshotDate,
      overallScore: s.overallScore,
      overallLevel: s.overallLevel as KnowledgeLevel,
    }));
    const currentScore =
      points.length > 0 ? (points[points.length - 1]?.overallScore ?? null) : null;
    const scoreNDaysAgo = points.length > 0 ? (points[0]?.overallScore ?? null) : null;
    return {
      points,
      currentScore,
      scoreNDaysAgo,
      change: currentScore !== null && scoreNDaysAgo !== null ? currentScore - scoreNDaysAgo : null,
    };
  }

  async getActivity(userId: string, sinceDays: number): Promise<PassportActivity> {
    const sinceDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    const rows = await this.repository.listActivity(userId, sinceDate);
    return {
      days: rows.map((r) => ({
        date: r.date,
        quizzesCompleted: r.quizzesCompleted,
        questionsAnswered: r.questionsAnswered,
        correctAnswers: r.correctAnswers,
      })),
    };
  }

  getMethodology(): PassportMethodology {
    return {
      scoringVersion: SB_SCORE_V1,
      considers: [
        'Accuracy on the questions you have answered',
        'The difficulty of those questions',
        'How much evidence you have provided (more questions build more confidence)',
        'How broad your knowledge is across categories within a sport',
        'How broad your knowledge is across different sports',
      ],
      doesNotMeasure: [
        'Athletic ability',
        'How big a fan you are of a sport or team',
        'General intelligence',
      ],
      levelDescriptions: {
        UNRATED: 'Not enough questions answered yet to establish a level.',
        NEWCOMER: 'Initial demonstrated knowledge on a small sample of questions.',
        EXPLORER: 'Basic knowledge shown across a meaningful sample of questions.',
        KNOWLEDGEABLE: 'Solid, consistent knowledge across a substantial sample.',
        ADVANCED: 'Strong, sustained performance across a large sample of questions.',
        EXPERT:
          'Exceptional performance across a substantial sample, including advanced-difficulty questions and multiple knowledge areas.',
      },
    };
  }

  getScoringConfig(): ScoringConfigDto {
    return {
      scoringVersion: SB_SCORE_V1,
      difficultyWeights: DIFFICULTY_WEIGHTS,
      volumeConfidenceCap: VOLUME_CONFIDENCE_CAP,
      levelThresholds: LEVEL_THRESHOLDS,
      demotionHysteresisPoints: DEMOTION_HYSTERESIS_POINTS,
    };
  }

  async getPublicAchievementShare(
    userAchievementId: string,
    displayNameFor: (userId: string) => Promise<{ displayName: string }>,
  ) {
    const found = await this.repository.findPublicUserAchievement(userAchievementId);
    if (!found) throw AppException.notFound('Achievement not found.');
    const identity = await displayNameFor(found.userId);
    return {
      achievement: {
        id: found.achievement.id,
        code: found.achievement.code,
        name: found.achievement.name,
        description: found.achievement.description,
        category: found.achievement.category,
        tier: found.achievement.tier,
        iconKey: found.achievement.iconKey,
        isHidden: found.achievement.isHidden,
      },
      displayName: identity.displayName,
      earnedAt: found.userAchievement.earnedAt.toISOString(),
    };
  }

  // ---- Admin: achievements ----

  async listAllAchievementsForAdmin(): Promise<AdminAchievementsList> {
    const [definitions, earnedCounts] = await Promise.all([
      this.repository.listAllAchievementDefinitions(),
      this.repository.countEarnedByAchievement(),
    ]);
    return {
      achievements: definitions.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        description: d.description,
        category: d.category,
        tier: d.tier,
        iconKey: d.iconKey,
        isHidden: d.isHidden,
        criteriaType: d.criteriaType,
        isActive: d.isActive,
        displayOrder: d.displayOrder,
        earnedCount: earnedCounts.get(d.id) ?? 0,
      })),
    };
  }

  async setAchievementActive(achievementId: string, isActive: boolean): Promise<void> {
    await this.repository.setAchievementActive(achievementId, isActive);
  }

  // ---- Privacy ----

  async getPrivacySettings(userId: string) {
    const profile = await this.repository.findProfile(userId);
    return {
      isPublic: profile?.isPublic ?? false,
      showAvatarPublicly: profile?.showAvatarPublicly ?? true,
      showActivityPublicly: profile?.showActivityPublicly ?? true,
      showStreakPublicly: profile?.showStreakPublicly ?? true,
      showAchievementsPublicly: profile?.showAchievementsPublicly ?? true,
      allowSearchIndexing: profile?.allowSearchIndexing ?? false,
      publicId: profile?.publicId ?? null,
    };
  }

  async updatePrivacy(
    userId: string,
    patch: Partial<{
      isPublic: boolean;
      showAvatarPublicly: boolean;
      showActivityPublicly: boolean;
      showStreakPublicly: boolean;
      showAchievementsPublicly: boolean;
      allowSearchIndexing: boolean;
    }>,
  ) {
    let profile = await this.repository.findProfile(userId);
    let publicIdPatch: { publicId?: string } = {};

    if (patch.isPublic === true && (!profile || !profile.publicId)) {
      publicIdPatch = { publicId: this.repository.generatePublicId() };
    }

    if (!profile) {
      profile = await this.repository.upsertProfile(userId, {
        overallScore: 0,
        overallLevel: 'UNRATED',
        questionsAnswered: 0,
        correctAnswers: 0,
        accuracy: '0',
        sportsExplored: 0,
        achievementCount: 0,
        currentWeeklyStreak: 0,
        longestWeeklyStreak: 0,
        scoringVersion: SB_SCORE_V1,
        ...publicIdPatch,
        ...patch,
      });
    } else {
      profile = await this.repository.updatePrivacy(userId, { ...publicIdPatch, ...patch });
    }

    return {
      isPublic: profile.isPublic,
      showAvatarPublicly: profile.showAvatarPublicly,
      showActivityPublicly: profile.showActivityPublicly,
      showStreakPublicly: profile.showStreakPublicly,
      showAchievementsPublicly: profile.showAchievementsPublicly,
      allowSearchIndexing: profile.allowSearchIndexing,
      publicId: profile.publicId,
    };
  }

  // ---- Public passport ----

  async getPublicPassport(
    publicId: string,
    displayNameFor: (
      userId: string,
    ) => Promise<{ displayName: string; avatarUrl: string | null; memberSince: string }>,
  ): Promise<PublicPassport> {
    const profile = await this.repository.findProfileByPublicId(publicId);
    if (!profile || !profile.isPublic) {
      throw AppException.notFound('Passport not found.');
    }

    const identity = await displayNameFor(profile.userId);
    const sportRows = await this.repository.listSportKnowledge(profile.userId);
    const sports = await this.repository.listSports();
    const sportById = new Map(sports.map((s) => [s.id, s]));

    let achievements: PublicPassport['achievements'] = null;
    if (profile.showAchievementsPublicly) {
      const earned = await this.repository.listEarnedAchievements(profile.userId);
      achievements = earned.map((e) => ({
        id: e.achievement.id,
        code: e.achievement.code,
        name: e.achievement.name,
        description: e.achievement.description,
        category: e.achievement.category,
        tier: e.achievement.tier,
        iconKey: e.achievement.iconKey,
        isHidden: e.achievement.isHidden,
      }));
    }

    return {
      displayName: identity.displayName,
      avatarUrl: profile.showAvatarPublicly ? identity.avatarUrl : null,
      memberSince: identity.memberSince,
      overallScore: profile.overallLevel !== 'UNRATED' ? profile.overallScore : null,
      overallLevel:
        profile.overallLevel !== 'UNRATED' ? (profile.overallLevel as KnowledgeLevel) : null,
      sports: sportRows.map((row) => this.toSportKnowledgeDto(row, sportById.get(row.sportId))),
      questionsAnswered: profile.questionsAnswered,
      accuracy: profile.questionsAnswered > 0 ? Number(profile.accuracy) : null,
      achievementCount: profile.achievementCount,
      achievements,
      currentWeeklyStreak: profile.showStreakPublicly ? profile.currentWeeklyStreak : null,
      allowSearchIndexing: profile.allowSearchIndexing,
    };
  }

  private async getMasterQuizSummary(userId: string) {
    // Master Quiz answers are ordinary attempt-questions whose parent attempt
    // has quizType MASTER — approximated here from sport breadth rather than
    // a second repository query, kept intentionally simple for V1.
    const profile = await this.repository.findProfile(userId);
    return {
      quizzesCompleted: 0,
      questionsAnswered: 0,
      accuracy: profile ? Number(profile.accuracy) : 0,
      bestPercentage: null,
      sportsCovered: profile?.sportsExplored ?? 0,
    };
  }

  private async computeStrengths(
    userId: string,
    sports: { id: string; slug: string; name: string }[],
  ): Promise<StrengthAreaDto[]> {
    const strengths: StrengthAreaDto[] = [];
    for (const sport of sports) {
      const categories = await this.repository.listCategoryKnowledge(userId, sport.id);
      for (const c of categories) {
        if (c.questionsAnswered >= CATEGORY_LEVEL_MIN_SAMPLE) {
          strengths.push({ sportName: sport.name, category: c.category, score: c.score });
        }
      }
    }
    return strengths.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  private async computeAreasToExplore(
    userId: string,
    sports: { id: string; slug: string; name: string }[],
  ): Promise<StrengthAreaDto[]> {
    const areas: StrengthAreaDto[] = [];
    for (const sport of sports) {
      const categories = await this.repository.listCategoryKnowledge(userId, sport.id);
      for (const c of categories) {
        if (c.questionsAnswered >= MASTER_QUIZ_MIN_STRENGTH_SAMPLE) {
          areas.push({ sportName: sport.name, category: c.category, score: c.score });
        }
      }
    }
    return areas.sort((a, b) => a.score - b.score).slice(0, 5);
  }
}
