import { Injectable, Logger } from '@nestjs/common';
import type { KnowledgeLevel } from '@sportbrain/contracts';
import { PassportRepository, type AchievementDefinitionRow } from './passport.repository';

export type AchievementEvent =
  | 'QUIZ_COMPLETED'
  | 'QUESTION_ANSWERED'
  | 'SPORT_LEVEL_CHANGED'
  | 'CATEGORY_LEVEL_CHANGED'
  | 'STREAK_UPDATED';

/**
 * The current state `AchievementEvaluationService` checks each definition's
 * criteria against. `PassportService` assembles this once per recalculation
 * from the freshly-computed profile — the evaluator itself never queries the
 * database beyond loading achievement definitions and existing grants.
 */
export interface AchievementEvaluationContext {
  questionsAnswered: number;
  quizzesCompleted: number;
  sportsExplored: number;
  sportsWithLevelCount: number;
  hardExpertCorrectCount: number;
  currentWeeklyStreak: number;
  sportLevels: { sportId: string; sportSlug: string; level: KnowledgeLevel }[];
  categoryLevels: { sportId: string; category: string; level: KnowledgeLevel | null }[];
  /** Present only when this evaluation follows a quiz completion, for `PERFECT_SCORE`/`MASTER_QUIZ_SCORE`. */
  justCompletedQuiz?: {
    quizAttemptId: string;
    quizType: 'SPORT' | 'MASTER';
    questionCount: number;
    correctCount: number;
    percentage: number;
  };
}

export interface GrantedAchievement {
  userAchievementId: string;
  definition: AchievementDefinitionRow;
  triggerContext?: Record<string, unknown>;
}

const LEVEL_RANK: Record<KnowledgeLevel, number> = {
  UNRATED: 0,
  NEWCOMER: 1,
  EXPLORER: 2,
  KNOWLEDGEABLE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

/**
 * Centralised achievement-granting (Part 27) — the only place that decides
 * whether a user has newly earned an achievement. Nothing achievement-shaped
 * lives in a controller or in `PassportService` beyond calling
 * `evaluateForUser`. Idempotent: grants rely on `PassportRepository`'s
 * `(userId, achievementId)` unique-constraint no-op, so evaluating the same
 * state twice (a retried job, a duplicate event) never double-grants.
 */
@Injectable()
export class AchievementEvaluationService {
  private readonly logger = new Logger(AchievementEvaluationService.name);

  constructor(private readonly repository: PassportRepository) {}

  async evaluateForUser(
    userId: string,
    _event: AchievementEvent,
    context: AchievementEvaluationContext,
  ): Promise<GrantedAchievement[]> {
    const definitions = await this.repository.listActiveAchievementDefinitions();
    const granted: GrantedAchievement[] = [];

    for (const definition of definitions) {
      const alreadyEarned = await this.repository.hasAchievement(userId, definition.id);
      if (alreadyEarned) continue;

      const evaluation = this.meetsCriteria(definition, context);
      if (!evaluation.met) continue;

      const row = await this.repository.grantAchievement(
        userId,
        definition.id,
        evaluation.triggerContext,
      );
      if (row) {
        granted.push({
          userAchievementId: row.id,
          definition,
          triggerContext: evaluation.triggerContext,
        });
        this.logger.log(`Granted achievement ${definition.code} to user ${userId}`);
      }
    }

    return granted;
  }

  private meetsCriteria(
    definition: AchievementDefinitionRow,
    context: AchievementEvaluationContext,
  ): { met: boolean; triggerContext?: Record<string, unknown> } {
    const config = (definition.criteriaConfig ?? {}) as Record<string, unknown>;

    switch (definition.criteriaType) {
      case 'QUESTIONS_ANSWERED_TOTAL': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.questionsAnswered >= threshold };
      }

      case 'QUIZZES_COMPLETED_TOTAL': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.quizzesCompleted >= threshold };
      }

      case 'PERFECT_SCORE': {
        const quiz = context.justCompletedQuiz;
        if (!quiz) return { met: false };
        const minQuestions = Number(config.minQuestions ?? 10);
        const met = quiz.questionCount >= minQuestions && quiz.percentage >= 100;
        return { met, triggerContext: met ? { quizAttemptId: quiz.quizAttemptId } : undefined };
      }

      case 'MASTER_QUIZ_SCORE': {
        const quiz = context.justCompletedQuiz;
        if (!quiz || quiz.quizType !== 'MASTER') return { met: false };
        const minQuestions = Number(config.minQuestions ?? 20);
        const minPercentage = Number(config.minPercentage ?? 80);
        const met = quiz.questionCount >= minQuestions && quiz.percentage >= minPercentage;
        return { met, triggerContext: met ? { quizAttemptId: quiz.quizAttemptId } : undefined };
      }

      case 'SPORTS_EXPLORED_COUNT': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.sportsExplored >= threshold };
      }

      case 'SPORTS_WITH_LEVEL_COUNT': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.sportsWithLevelCount >= threshold };
      }

      case 'SPORT_LEVEL_REACHED': {
        const requiredLevel = (config.level as KnowledgeLevel) ?? 'ADVANCED';
        const sportSlug = config.sportSlug as string | undefined;
        const match = context.sportLevels.find(
          (s) =>
            (!sportSlug || s.sportSlug === sportSlug) &&
            LEVEL_RANK[s.level] >= LEVEL_RANK[requiredLevel],
        );
        return {
          met: match !== undefined,
          triggerContext: match ? { sportId: match.sportId, level: match.level } : undefined,
        };
      }

      case 'CATEGORY_LEVEL_REACHED': {
        const requiredLevel = (config.level as KnowledgeLevel) ?? 'ADVANCED';
        const match = context.categoryLevels.find(
          (c) => c.level && LEVEL_RANK[c.level] >= LEVEL_RANK[requiredLevel],
        );
        return {
          met: match !== undefined,
          triggerContext: match
            ? { sportId: match.sportId, category: match.category, level: match.level }
            : undefined,
        };
      }

      case 'HARD_EXPERT_CORRECT_COUNT': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.hardExpertCorrectCount >= threshold };
      }

      case 'WEEKLY_STREAK_REACHED': {
        const threshold = Number(config.threshold ?? 0);
        return { met: context.currentWeeklyStreak >= threshold };
      }

      default:
        this.logger.warn(`Unknown achievement criteriaType: ${definition.criteriaType}`);
        return { met: false };
    }
  }

  /**
   * Progress for measurable (count-threshold) criteria types only (Part 28)
   * — score-based criteria (`SPORT_LEVEL_REACHED`, `MASTER_QUIZ_SCORE`, ...)
   * intentionally return no progress bar, since "72% of the way to EXPERT"
   * is not a meaningful number the way "328/500 questions" is.
   */
  computeProgress(
    definition: AchievementDefinitionRow,
    context: AchievementEvaluationContext,
  ): { current: number; target: number } | null {
    const config = (definition.criteriaConfig ?? {}) as Record<string, unknown>;
    switch (definition.criteriaType) {
      case 'QUESTIONS_ANSWERED_TOTAL':
        return { current: context.questionsAnswered, target: Number(config.threshold ?? 0) };
      case 'QUIZZES_COMPLETED_TOTAL':
        return { current: context.quizzesCompleted, target: Number(config.threshold ?? 0) };
      case 'SPORTS_EXPLORED_COUNT':
        return { current: context.sportsExplored, target: Number(config.threshold ?? 0) };
      case 'SPORTS_WITH_LEVEL_COUNT':
        return { current: context.sportsWithLevelCount, target: Number(config.threshold ?? 0) };
      case 'HARD_EXPERT_CORRECT_COUNT':
        return { current: context.hardExpertCorrectCount, target: Number(config.threshold ?? 0) };
      case 'WEEKLY_STREAK_REACHED':
        return { current: context.currentWeeklyStreak, target: Number(config.threshold ?? 0) };
      default:
        return null;
    }
  }
}
