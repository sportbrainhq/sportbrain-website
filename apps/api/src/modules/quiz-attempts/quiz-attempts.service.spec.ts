import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { EligibleQuestionsRepository } from '../quiz-generation/eligible-questions.repository';
import { QuestionExposureRepository } from '../quiz-generation/question-exposure.repository';
import { QuizGenerationService } from '../quiz-generation/quiz-generation.service';
import { QuizAttemptsRepository } from './quiz-attempts.repository';
import { QuizAttemptsService } from './quiz-attempts.service';

function buildAttemptRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'attempt-1',
    publicCode: 'QZ-ABCDEF',
    userId: 'user-1',
    quizType: 'SPORT',
    sportId: 'sport-1',
    mode: 'STANDARD',
    status: 'IN_PROGRESS',
    requestedQuestionCount: 10,
    actualQuestionCount: 2,
    correctCount: 0,
    incorrectCount: 0,
    scorePercentage: null,
    startedAt: new Date('2026-01-01T00:00:00.000Z'),
    lastActivityAt: new Date('2026-01-01T00:00:00.000Z'),
    completedAt: null,
    abandonedAt: null,
    durationSeconds: null,
    generationMetadata: {},
    ...overrides,
  };
}

function buildAttemptQuestionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aq-1',
    quizAttemptId: 'attempt-1',
    questionId: 'question-1',
    position: 1,
    questionTextSnapshot: 'Who won?',
    optionsSnapshot: [
      { optionCode: 'A', optionText: 'Argentina', displayOrder: 0 },
      { optionCode: 'B', optionText: 'France', displayOrder: 1 },
      { optionCode: 'C', optionText: 'Brazil', displayOrder: 2 },
      { optionCode: 'D', optionText: 'Croatia', displayOrder: 3 },
    ],
    correctOptionSnapshot: 'A',
    explanationSnapshot: 'Argentina won.',
    difficultySnapshot: 'EASY',
    categorySnapshot: 'WORLD_CUP',
    selectedOptionCode: null,
    selectedOptionTextSnapshot: null,
    isCorrect: null,
    answeredAt: null,
    responseTimeMs: null,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('QuizAttemptsService', () => {
  let repository: QuizAttemptsRepository;
  let generation: QuizGenerationService;
  let eligibleQuestions: EligibleQuestionsRepository;
  let exposure: QuestionExposureRepository;
  let config: ConfigService<AppConfig, true>;
  let service: QuizAttemptsService;

  beforeEach(() => {
    repository = {
      findActiveAttempt: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({
        attempt: buildAttemptRow(),
        questions: [buildAttemptQuestionRow()],
      }),
      findByPublicCode: vi.fn().mockResolvedValue(buildAttemptRow()),
      findQuestionsForAttempt: vi.fn().mockResolvedValue([buildAttemptQuestionRow()]),
      findAttemptQuestion: vi.fn().mockResolvedValue(buildAttemptQuestionRow()),
      recordAnswer: vi
        .fn()
        .mockResolvedValue(buildAttemptQuestionRow({ isCorrect: true, answeredAt: new Date() })),
      updateAttempt: vi.fn().mockImplementation((_id, patch) => buildAttemptRow(patch)),
      findRecentForUser: vi.fn().mockResolvedValue([]),
    } as unknown as QuizAttemptsRepository;

    generation = {
      generate: vi.fn().mockResolvedValue({
        requestedQuestionCount: 10,
        questions: [
          {
            id: 'question-1',
            difficulty: 'EASY',
            category: 'WORLD_CUP',
            questionText: 'Who won?',
            explanation: 'Argentina won.',
          },
        ],
        sportAllocation: { 'sport-1': 1 },
      }),
    } as unknown as QuizGenerationService;

    eligibleQuestions = {
      findOptionsForQuestions: vi.fn().mockResolvedValue(
        new Map([
          [
            'question-1',
            [
              { optionCode: 'A', optionText: 'Argentina', displayOrder: 0, isCorrect: true },
              { optionCode: 'B', optionText: 'France', displayOrder: 1, isCorrect: false },
              { optionCode: 'C', optionText: 'Brazil', displayOrder: 2, isCorrect: false },
              { optionCode: 'D', optionText: 'Croatia', displayOrder: 3, isCorrect: false },
            ],
          ],
        ]),
      ),
    } as unknown as EligibleQuestionsRepository;

    exposure = {
      recordServed: vi.fn().mockResolvedValue(undefined),
      recordAnswer: vi.fn().mockResolvedValue(undefined),
    } as unknown as QuestionExposureRepository;

    config = {
      get: vi.fn().mockReturnValue({ attemptExpiryHours: 48 }),
    } as unknown as ConfigService<AppConfig, true>;

    service = new QuizAttemptsService(repository, generation, eligibleQuestions, exposure, config);
  });

  it('starts an attempt and snapshots questions', async () => {
    const result = await service.start('user-1', {
      quizType: 'SPORT',
      sportId: 'sport-1',
      mode: 'STANDARD',
    });
    expect(repository.create).toHaveBeenCalled();
    expect(exposure.recordServed).toHaveBeenCalled();
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0]?.correctOptionCode).toBeNull(); // unanswered: never reveal the key
  });

  it('refuses to start a second attempt while one is active', async () => {
    repository.findActiveAttempt = vi.fn().mockResolvedValue(buildAttemptRow());
    await expect(
      service.start('user-1', { quizType: 'SPORT', sportId: 'sport-1', mode: 'STANDARD' }),
    ).rejects.toThrow();
  });

  it('fails clearly when generation returns no questions', async () => {
    generation.generate = vi
      .fn()
      .mockResolvedValue({ requestedQuestionCount: 10, questions: [], sportAllocation: {} });
    await expect(
      service.start('user-1', { quizType: 'SPORT', sportId: 'sport-1', mode: 'STANDARD' }),
    ).rejects.toThrow();
  });

  it('grades server-side and never trusts a client correctness value', async () => {
    const result = await service.submitAnswer('user-1', 'QZ-ABCDEF', 'aq-1', 'A');
    expect(result.isCorrect).toBe(true);
    expect(result.correctOptionCode).toBe('A');
    expect(exposure.recordAnswer).toHaveBeenCalledWith(
      'user-1',
      'question-1',
      true,
      expect.any(Date),
    );
  });

  it('rejects an option that does not belong to the question', async () => {
    repository.findAttemptQuestion = vi.fn().mockResolvedValue(
      buildAttemptQuestionRow({
        optionsSnapshot: [{ optionCode: 'A', optionText: 'Argentina', displayOrder: 0 }],
      }),
    );
    await expect(service.submitAnswer('user-1', 'QZ-ABCDEF', 'aq-1', 'D')).rejects.toThrow();
  });

  it('is idempotent on a duplicate answer submission', async () => {
    repository.recordAnswer = vi.fn().mockResolvedValue(undefined); // simulates "already answered"
    repository.findAttemptQuestion = vi
      .fn()
      .mockResolvedValue(
        buildAttemptQuestionRow({
          isCorrect: true,
          answeredAt: new Date(),
          selectedOptionCode: 'A',
        }),
      );
    const result = await service.submitAnswer('user-1', 'QZ-ABCDEF', 'aq-1', 'A');
    expect(result.isCorrect).toBe(true);
    expect(exposure.recordAnswer).not.toHaveBeenCalled();
    expect(repository.updateAttempt).not.toHaveBeenCalled();
  });

  it('refuses to answer a completed attempt', async () => {
    repository.findByPublicCode = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ status: 'COMPLETED' }));
    await expect(service.submitAnswer('user-1', 'QZ-ABCDEF', 'aq-1', 'A')).rejects.toThrow();
  });

  it('rejects access to an attempt owned by someone else', async () => {
    repository.findByPublicCode = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ userId: 'other-user' }));
    await expect(service.findByPublicCode('user-1', 'QZ-ABCDEF')).rejects.toThrow();
  });

  it('completes an attempt and computes score from answered questions', async () => {
    repository.findQuestionsForAttempt = vi
      .fn()
      .mockResolvedValue([
        buildAttemptQuestionRow({ isCorrect: true, answeredAt: new Date() }),
        buildAttemptQuestionRow({ id: 'aq-2', isCorrect: false, answeredAt: new Date() }),
      ]);
    const result = await service.complete('user-1', 'QZ-ABCDEF');
    expect(repository.updateAttempt).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({ status: 'COMPLETED', correctCount: 1, incorrectCount: 1 }),
    );
    expect(result.status).toBe('COMPLETED');
  });

  it('completing an already-completed attempt is idempotent', async () => {
    repository.findByPublicCode = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ status: 'COMPLETED' }));
    const result = await service.complete('user-1', 'QZ-ABCDEF');
    expect(repository.updateAttempt).not.toHaveBeenCalled();
    expect(result.status).toBe('COMPLETED');
  });

  it('abandon is a no-op on a non-active attempt', async () => {
    repository.findByPublicCode = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ status: 'COMPLETED' }));
    await service.abandon('user-1', 'QZ-ABCDEF');
    expect(repository.updateAttempt).not.toHaveBeenCalled();
  });

  it('abandon marks an in-progress attempt ABANDONED', async () => {
    await service.abandon('user-1', 'QZ-ABCDEF');
    expect(repository.updateAttempt).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({ status: 'ABANDONED' }),
    );
  });

  it('findActive expires a stale in-progress attempt', async () => {
    repository.findActiveAttempt = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ lastActivityAt: new Date('2020-01-01T00:00:00.000Z') }));
    const result = await service.findActive('user-1', 'SPORT', 'sport-1');
    expect(result).toBeNull();
    expect(repository.updateAttempt).toHaveBeenCalledWith('attempt-1', { status: 'EXPIRED' });
  });

  it('findActive returns the active attempt summary when fresh', async () => {
    const recentActivity = new Date();
    repository.findActiveAttempt = vi
      .fn()
      .mockResolvedValue(buildAttemptRow({ lastActivityAt: recentActivity }));
    const result = await service.findActive('user-1', 'SPORT', 'sport-1');
    expect(result?.publicCode).toBe('QZ-ABCDEF');
  });
});
