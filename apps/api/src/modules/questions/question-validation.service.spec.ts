import { describe, expect, it, vi } from 'vitest';
import type { CreateQuestionRequest } from '@sportbrain/contracts';
import { QuestionValidationService } from './question-validation.service';
import type { QuestionsRepository } from './questions.repository';

function buildRequest(overrides: Partial<CreateQuestionRequest> = {}): CreateQuestionRequest {
  return {
    sportId: '11111111-1111-1111-1111-111111111111',
    category: 'WORLD_CUP',
    difficulty: 'EASY',
    questionType: 'SINGLE_CHOICE',
    questionText: 'Which nation won the 2022 FIFA World Cup?',
    options: [
      { optionText: 'Argentina', isCorrect: true, explanation: null },
      { optionText: 'France', isCorrect: false, explanation: null },
      { optionText: 'Brazil', isCorrect: false, explanation: null },
      { optionText: 'Croatia', isCorrect: false, explanation: null },
    ],
    explanation: 'Argentina won on penalties after a 3-3 draw.',
    ...overrides,
  };
}

function buildRepository(overrides: Partial<QuestionsRepository> = {}): QuestionsRepository {
  return {
    findByFingerprint: vi.fn().mockResolvedValue(undefined),
    findByFactKey: vi.fn().mockResolvedValue([]),
    findSportSlugById: vi.fn().mockResolvedValue('football'),
    findById: vi.fn(),
    findByCode: vi.fn(),
    countByCodePrefix: vi.fn(),
    create: vi.fn(),
    ...overrides,
  } as unknown as QuestionsRepository;
}

describe('QuestionValidationService', () => {
  it('passes a well-formed question', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(buildRequest(), 'football');
    expect(result.severity).toBe('PASS');
  });

  it('fails a category that does not belong to the sport', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(buildRequest({ category: 'NBA' }), 'football');
    expect(result.severity).toBe('FAIL');
    expect(result.checks.some((check) => check.validator === 'schema')).toBe(true);
  });

  it('fails when no option is marked correct', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        options: [
          { optionText: 'Argentina', isCorrect: false, explanation: null },
          { optionText: 'France', isCorrect: false, explanation: null },
          { optionText: 'Brazil', isCorrect: false, explanation: null },
          { optionText: 'Croatia', isCorrect: false, explanation: null },
        ],
      }),
      'football',
    );
    expect(result.severity).toBe('FAIL');
    expect(result.checks.some((check) => check.validator === 'correct_answer')).toBe(true);
  });

  it('fails when multiple options are marked correct', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        options: [
          { optionText: 'Argentina', isCorrect: true, explanation: null },
          { optionText: 'France', isCorrect: true, explanation: null },
          { optionText: 'Brazil', isCorrect: false, explanation: null },
          { optionText: 'Croatia', isCorrect: false, explanation: null },
        ],
      }),
      'football',
    );
    expect(result.severity).toBe('FAIL');
    expect(result.checks.some((check) => check.validator === 'correct_answer')).toBe(true);
  });

  it('fails on duplicate option text', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        options: [
          { optionText: 'Argentina', isCorrect: true, explanation: null },
          { optionText: 'argentina', isCorrect: false, explanation: null },
          { optionText: 'Brazil', isCorrect: false, explanation: null },
          { optionText: 'Croatia', isCorrect: false, explanation: null },
        ],
      }),
      'football',
    );
    expect(result.severity).toBe('FAIL');
    expect(result.checks.some((check) => check.validator === 'option_uniqueness')).toBe(true);
  });

  it('fails on a blank option', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        options: [
          { optionText: 'Argentina', isCorrect: true, explanation: null },
          { optionText: '   ', isCorrect: false, explanation: null },
          { optionText: 'Brazil', isCorrect: false, explanation: null },
          { optionText: 'Croatia', isCorrect: false, explanation: null },
        ],
      }),
      'football',
    );
    expect(result.severity).toBe('FAIL');
  });

  it('flags an exact fingerprint duplicate as FAIL', async () => {
    const repository = buildRepository({
      findByFingerprint: vi.fn().mockResolvedValue({
        id: 'existing-id',
        questionCode: 'SBQ-FB-000001',
      }),
    });
    const service = new QuestionValidationService(repository);
    const result = await service.validate(buildRequest(), 'football');
    expect(result.severity).toBe('FAIL');
    expect(result.duplicate.outcome).toBe('EXACT_DUPLICATE');
    expect(result.duplicate.duplicateQuestionCode).toBe('SBQ-FB-000001');
  });

  it('warns, not fails, on a shared factKey', async () => {
    const repository = buildRepository({
      findByFactKey: vi
        .fn()
        .mockResolvedValue([{ id: 'existing-id', questionCode: 'SBQ-FB-000002' }]),
    });
    const service = new QuestionValidationService(repository);
    const result = await service.validate(
      buildRequest({ factKey: 'football:fifa-world-cup:2022:winner' }),
      'football',
    );
    expect(result.severity).toBe('WARN');
    expect(result.checks.some((check) => check.validator === 'fact_duplicate')).toBe(true);
  });

  it('warns on time-relative wording without explicit validity', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({ questionText: 'Who is the current world number one?' }),
      'football',
    );
    expect(result.severity).toBe('WARN');
    expect(result.checks.some((check) => check.validator === 'time_sensitivity')).toBe(true);
  });

  it('does not warn on time-relative wording when validity bounds are given', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        questionText: 'Who finished the current 2025 season on top?',
        validFrom: '2025-01-01T00:00:00.000Z',
        validUntil: '2025-12-31T00:00:00.000Z',
      }),
      'football',
    );
    expect(result.checks.some((check) => check.validator === 'time_sensitivity')).toBe(false);
  });

  it('warns on answer leakage inside the question text', async () => {
    const service = new QuestionValidationService(buildRepository());
    const result = await service.validate(
      buildRequest({
        questionText: 'Did Argentina win the 2022 FIFA World Cup?',
        options: [
          { optionText: 'Argentina', isCorrect: true, explanation: null },
          { optionText: 'France', isCorrect: false, explanation: null },
          { optionText: 'Brazil', isCorrect: false, explanation: null },
          { optionText: 'Croatia', isCorrect: false, explanation: null },
        ],
      }),
      'football',
    );
    expect(result.severity).toBe('WARN');
    expect(result.checks.some((check) => check.validator === 'language_quality')).toBe(true);
  });
});
