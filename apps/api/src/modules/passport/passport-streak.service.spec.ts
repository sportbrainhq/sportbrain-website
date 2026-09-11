import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PassportRepository, type UserStreakRow } from './passport.repository';
import { PassportStreakService } from './passport-streak.service';

function buildStreakRow(overrides: Partial<UserStreakRow> = {}): UserStreakRow {
  return {
    id: 'streak-1',
    userId: 'user-1',
    streakType: 'WEEKLY_SPORTBRAIN',
    currentCount: 0,
    longestCount: 0,
    currentPeriodStart: null,
    lastQualifiedAt: null,
    updatedAt: new Date(),
    ...overrides,
  } as UserStreakRow;
}

describe('PassportStreakService — weekly streak', () => {
  let repository: { findStreak: ReturnType<typeof vi.fn>; upsertStreak: ReturnType<typeof vi.fn> };
  let service: PassportStreakService;
  let stored: UserStreakRow | undefined;

  beforeEach(() => {
    stored = undefined;
    repository = {
      findStreak: vi.fn(async () => stored),
      upsertStreak: vi.fn(
        async (userId: string, streakType: string, patch: Partial<UserStreakRow>) => {
          stored = buildStreakRow({
            userId,
            streakType: streakType as 'WEEKLY_SPORTBRAIN',
            ...patch,
            ...stored,
            ...patch,
          });
          return stored;
        },
      ),
    };
    service = new PassportStreakService(repository as unknown as PassportRepository);
  });

  it('first qualifying week sets streak to 1', async () => {
    const result = await service.recordQualifyingActivity(
      'user-1',
      new Date('2026-01-05T10:00:00Z'),
    ); // Monday
    expect(result.currentWeeklyStreak).toBe(1);
    expect(result.longestWeeklyStreak).toBe(1);
    expect(result.streakChanged).toBe(true);
  });

  it('multiple quizzes in the same week only increments once', async () => {
    await service.recordQualifyingActivity('user-1', new Date('2026-01-05T10:00:00Z')); // Mon wk1
    const second = await service.recordQualifyingActivity(
      'user-1',
      new Date('2026-01-07T10:00:00Z'),
    ); // Wed wk1
    const third = await service.recordQualifyingActivity(
      'user-1',
      new Date('2026-01-09T10:00:00Z'),
    ); // Fri wk1

    expect(second.currentWeeklyStreak).toBe(1);
    expect(second.streakChanged).toBe(false);
    expect(third.currentWeeklyStreak).toBe(1);
    expect(third.streakChanged).toBe(false);
  });

  it('consecutive qualifying weeks increment the streak', async () => {
    await service.recordQualifyingActivity('user-1', new Date('2026-01-05T10:00:00Z')); // wk1
    const wk2 = await service.recordQualifyingActivity('user-1', new Date('2026-01-12T10:00:00Z')); // wk2
    expect(wk2.currentWeeklyStreak).toBe(2);
  });

  it('a skipped week resets the streak to 1', async () => {
    await service.recordQualifyingActivity('user-1', new Date('2026-01-05T10:00:00Z')); // wk1
    await service.recordQualifyingActivity('user-1', new Date('2026-01-12T10:00:00Z')); // wk2, streak=2
    const wk4 = await service.recordQualifyingActivity('user-1', new Date('2026-01-26T10:00:00Z')); // wk4 (wk3 skipped)
    expect(wk4.currentWeeklyStreak).toBe(1);
  });

  it('tracks longest streak across a reset', async () => {
    await service.recordQualifyingActivity('user-1', new Date('2026-01-05T10:00:00Z')); // wk1: 1
    await service.recordQualifyingActivity('user-1', new Date('2026-01-12T10:00:00Z')); // wk2: 2
    await service.recordQualifyingActivity('user-1', new Date('2026-01-19T10:00:00Z')); // wk3: 3
    const wk5 = await service.recordQualifyingActivity('user-1', new Date('2026-02-02T10:00:00Z')); // wk5: reset to 1
    expect(wk5.currentWeeklyStreak).toBe(1);
    expect(wk5.longestWeeklyStreak).toBe(3);
  });

  it('handles a year boundary as a normal consecutive week', async () => {
    await service.recordQualifyingActivity('user-1', new Date('2025-12-29T10:00:00Z')); // last ISO week of 2025
    const nextWeek = await service.recordQualifyingActivity(
      'user-1',
      new Date('2026-01-05T10:00:00Z'),
    );
    expect(nextWeek.currentWeeklyStreak).toBe(2);
  });
});
