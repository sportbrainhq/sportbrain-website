import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { QuizStatsRepository } from './quiz-stats.repository';
import { QuizStatsService } from './quiz-stats.service';

describe('QuizStatsService', () => {
  let repository: QuizStatsRepository;
  let config: ConfigService<AppConfig, true>;
  let service: QuizStatsService;

  beforeEach(() => {
    repository = {
      lifetime: vi.fn().mockResolvedValue({
        quizzesCompleted: 10,
        bestPercentage: 90,
        averagePercentage: 75,
        lastQuizAt: new Date('2026-06-01'),
      }),
      questionTotals: vi.fn().mockResolvedValue({ questionsAnswered: 100, correctAnswers: 80 }),
      bySport: vi.fn().mockResolvedValue([
        {
          sportId: 'sport-1',
          sportName: 'Football',
          quizzesCompleted: 5,
          questionsAnswered: 50,
          correctAnswers: 40,
          bestPercentage: 90,
        },
      ]),
      byCategory: vi.fn().mockResolvedValue([
        { category: 'WORLD_CUP', questionsAnswered: 15, correctAnswers: 12 },
        { category: 'RULES', questionsAnswered: 3, correctAnswers: 1 }, // below sample size
      ]),
      byDifficulty: vi
        .fn()
        .mockResolvedValue([{ difficulty: 'EASY', questionsAnswered: 40, correctAnswers: 36 }]),
      recentPercentages: vi.fn().mockResolvedValue([80, 90]),
      questionTotalsSince: vi.fn().mockResolvedValue({ questionsAnswered: 20, correctAnswers: 15 }),
      completedDays: vi.fn().mockResolvedValue([]),
      mostPlayedSportSince: vi.fn().mockResolvedValue(undefined),
      byCategorySince: vi.fn().mockResolvedValue([]),
    } as unknown as QuizStatsRepository;

    config = {
      get: vi.fn().mockReturnValue({ statsMinCategorySample: 10 }),
    } as unknown as ConfigService<AppConfig, true>;

    service = new QuizStatsService(repository, config);
  });

  it('computes lifetime stats with derived accuracy', async () => {
    const result = await service.lifetime('user-1');
    expect(result.quizzesCompleted).toBe(10);
    expect(result.questionsAnswered).toBe(100);
    expect(result.correctAnswers).toBe(80);
    expect(result.incorrectAnswers).toBe(20);
    expect(result.overallAccuracy).toBe(80);
  });

  it('returns 0 streak when no completed days exist', async () => {
    const result = await service.lifetime('user-1');
    expect(result.currentStreakDays).toBe(0);
    expect(result.longestStreakDays).toBe(0);
  });

  it('computes a current streak from consecutive days including today', async () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
    repository.completedDays = vi.fn().mockResolvedValue([today, yesterday, twoDaysAgo]);
    const result = await service.lifetime('user-1');
    expect(result.currentStreakDays).toBe(3);
    expect(result.longestStreakDays).toBe(3);
  });

  it('resets current streak to 0 when the gap since the last quiz is more than a day', async () => {
    const staleDay = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    repository.completedDays = vi.fn().mockResolvedValue([staleDay]);
    const result = await service.lifetime('user-1');
    expect(result.currentStreakDays).toBe(0);
  });

  it('excludes categories below the minimum sample size', async () => {
    const result = await service.byCategory('user-1');
    expect(result).toHaveLength(1);
    expect(result[0]?.category).toBe('WORLD_CUP');
  });

  it('computes sport-level accuracy correctly', async () => {
    const result = await service.bySport('user-1');
    expect(result[0]?.accuracy).toBe(80);
  });

  it('recent stats average last-5/last-10 percentages', async () => {
    const result = await service.recent('user-1');
    expect(result.last5QuizAccuracy).toBe(85);
  });

  it('monthly summary omits comparison when previous month has no data', async () => {
    const result = await service.monthlySummary('user-1');
    expect(result.accuracyDeltaVsPreviousMonth).toBeNull();
  });
});
