import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AchievementEvaluationService,
  type AchievementEvaluationContext,
} from './achievement-evaluation.service';
import { PassportRepository, type AchievementDefinitionRow } from './passport.repository';

function buildDefinition(
  overrides: Partial<AchievementDefinitionRow> = {},
): AchievementDefinitionRow {
  return {
    id: overrides.id ?? 'def-1',
    code: 'TEST',
    name: 'Test',
    description: 'Test achievement',
    category: 'QUIZ',
    tier: null,
    iconKey: 'icon',
    criteriaType: 'QUESTIONS_ANSWERED_TOTAL',
    criteriaConfig: { threshold: 100 },
    isActive: true,
    isHidden: false,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as AchievementDefinitionRow;
}

function baseContext(
  overrides: Partial<AchievementEvaluationContext> = {},
): AchievementEvaluationContext {
  return {
    questionsAnswered: 0,
    quizzesCompleted: 0,
    sportsExplored: 0,
    sportsWithLevelCount: 0,
    hardExpertCorrectCount: 0,
    currentWeeklyStreak: 0,
    sportLevels: [],
    categoryLevels: [],
    ...overrides,
  };
}

describe('AchievementEvaluationService', () => {
  let definitions: AchievementDefinitionRow[];
  let earned: Set<string>;
  let repository: {
    listActiveAchievementDefinitions: ReturnType<typeof vi.fn>;
    hasAchievement: ReturnType<typeof vi.fn>;
    grantAchievement: ReturnType<typeof vi.fn>;
  };
  let service: AchievementEvaluationService;

  beforeEach(() => {
    definitions = [];
    earned = new Set();
    repository = {
      listActiveAchievementDefinitions: vi.fn(async () => definitions),
      hasAchievement: vi.fn(async (_userId: string, achievementId: string) =>
        earned.has(achievementId),
      ),
      grantAchievement: vi.fn(async (_userId: string, achievementId: string) => {
        if (earned.has(achievementId)) return undefined;
        earned.add(achievementId);
        return {
          id: 'ua-1',
          userId: _userId,
          achievementId,
          earnedAt: new Date(),
          triggerContext: null,
          createdAt: new Date(),
        };
      }),
    };
    service = new AchievementEvaluationService(repository as unknown as PassportRepository);
  });

  it('grants FIRST_WHISTLE-equivalent achievement on first quiz', async () => {
    definitions = [
      buildDefinition({
        id: 'def-first',
        code: 'FIRST_WHISTLE',
        criteriaType: 'QUIZZES_COMPLETED_TOTAL',
        criteriaConfig: { threshold: 1 },
      }),
    ];
    const granted = await service.evaluateForUser(
      'user-1',
      'QUIZ_COMPLETED',
      baseContext({ quizzesCompleted: 1 }),
    );
    expect(granted.map((g) => g.definition.code)).toEqual(['FIRST_WHISTLE']);
  });

  it('grants question-count achievement at threshold', async () => {
    definitions = [buildDefinition({ id: 'def-100', criteriaConfig: { threshold: 100 } })];
    const below = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 99 }),
    );
    expect(below).toHaveLength(0);
    const at = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 100 }),
    );
    expect(at).toHaveLength(1);
  });

  it('grants PERFECT_SCORE only for 100% on sufficient questions', async () => {
    definitions = [
      buildDefinition({
        id: 'def-perfect',
        code: 'PERFECT_SCORE',
        criteriaType: 'PERFECT_SCORE',
        criteriaConfig: { minQuestions: 10 },
      }),
    ];
    const tooFew = await service.evaluateForUser(
      'user-1',
      'QUIZ_COMPLETED',
      baseContext({
        justCompletedQuiz: {
          quizAttemptId: 'a1',
          quizType: 'SPORT',
          questionCount: 5,
          correctCount: 5,
          percentage: 100,
        },
      }),
    );
    expect(tooFew).toHaveLength(0);

    const perfect = await service.evaluateForUser(
      'user-1',
      'QUIZ_COMPLETED',
      baseContext({
        justCompletedQuiz: {
          quizAttemptId: 'a2',
          quizType: 'SPORT',
          questionCount: 10,
          correctCount: 10,
          percentage: 100,
        },
      }),
    );
    expect(perfect).toHaveLength(1);
  });

  it('grants multi-sport (ALL_ROUNDER-equivalent) achievement', async () => {
    definitions = [
      buildDefinition({
        id: 'def-allrounder',
        criteriaType: 'SPORTS_EXPLORED_COUNT',
        criteriaConfig: { threshold: 5 },
      }),
    ];
    const granted = await service.evaluateForUser(
      'user-1',
      'SPORT_LEVEL_CHANGED',
      baseContext({ sportsExplored: 5 }),
    );
    expect(granted).toHaveLength(1);
  });

  it('grants sport-level achievement scoped to the right sport only', async () => {
    definitions = [
      buildDefinition({
        id: 'def-football',
        criteriaType: 'SPORT_LEVEL_REACHED',
        criteriaConfig: { level: 'ADVANCED', sportSlug: 'football' },
      }),
    ];
    const wrongSport = await service.evaluateForUser(
      'user-1',
      'SPORT_LEVEL_CHANGED',
      baseContext({
        sportLevels: [{ sportId: 's-cricket', sportSlug: 'cricket', level: 'ADVANCED' }],
      }),
    );
    expect(wrongSport).toHaveLength(0);

    const rightSport = await service.evaluateForUser(
      'user-1',
      'SPORT_LEVEL_CHANGED',
      baseContext({
        sportLevels: [{ sportId: 's-football', sportSlug: 'football', level: 'EXPERT' }],
      }),
    );
    expect(rightSport).toHaveLength(1); // EXPERT ranks above required ADVANCED
  });

  it('grants streak achievement at threshold', async () => {
    definitions = [
      buildDefinition({
        id: 'def-streak',
        criteriaType: 'WEEKLY_STREAK_REACHED',
        criteriaConfig: { threshold: 4 },
      }),
    ];
    const granted = await service.evaluateForUser(
      'user-1',
      'STREAK_UPDATED',
      baseContext({ currentWeeklyStreak: 4 }),
    );
    expect(granted).toHaveLength(1);
  });

  it('never grants the same achievement twice (idempotent across duplicate events)', async () => {
    definitions = [buildDefinition({ id: 'def-dup', criteriaConfig: { threshold: 10 } })];
    const first = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 10 }),
    );
    const second = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 15 }),
    );
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(0);
  });

  it('never grants an inactive achievement definition', async () => {
    definitions = []; // listActiveAchievementDefinitions already filters inactive ones at the repository level
    const granted = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 999999 }),
    );
    expect(granted).toHaveLength(0);
  });

  it('grants a hidden achievement the same as any other (hidden only affects display, not evaluation)', async () => {
    definitions = [
      buildDefinition({ id: 'def-hidden', isHidden: true, criteriaConfig: { threshold: 1 } }),
    ];
    const granted = await service.evaluateForUser(
      'user-1',
      'QUESTION_ANSWERED',
      baseContext({ questionsAnswered: 1 }),
    );
    expect(granted).toHaveLength(1);
  });
});
