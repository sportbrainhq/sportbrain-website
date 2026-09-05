import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateGenerationJobRequest } from '@sportbrain/contracts';
import { QuestionValidationService } from '../questions/question-validation.service';
import { QuestionsRepository } from '../questions/questions.repository';
import { AiGenerator } from './generators/ai.generator';
import { HybridGenerator } from './generators/hybrid.generator';
import { TemplateGenerator } from './generators/template.generator';
import { QuestionGenerationJobService } from './question-generation-job.service';
import { QuestionGenerationRepository } from './question-generation.repository';

function buildJobRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'job-1',
    sportId: 'sport-1',
    sourceType: 'competition',
    sourceEntityType: null,
    sourceEntityId: null,
    status: 'RUNNING',
    requestedCount: 10,
    generatedCount: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    duplicateCount: 0,
    validationFailedCount: 0,
    generationMethod: 'TEMPLATE',
    generationConfig: {},
    generatorVersion: 'QUIZ_GEN_TEMPLATE_V1',
    generationModel: null,
    createdBy: 'user-1',
    createdAt: new Date('2026-01-01'),
    startedAt: new Date('2026-01-01'),
    completedAt: null,
    ...overrides,
  };
}

describe('QuestionGenerationJobService', () => {
  let questionsRepository: QuestionsRepository;
  let generationRepository: QuestionGenerationRepository;
  let validation: QuestionValidationService;
  let templateGenerator: TemplateGenerator;
  let service: QuestionGenerationJobService;

  beforeEach(() => {
    questionsRepository = {
      findSportSlugById: vi.fn().mockResolvedValue('football'),
    } as unknown as QuestionsRepository;

    generationRepository = {
      createJob: vi.fn().mockResolvedValue(buildJobRow()),
      updateJob: vi.fn().mockResolvedValue(undefined),
      findJobById: vi.fn().mockResolvedValue(buildJobRow({ status: 'COMPLETED' })),
      listJobs: vi.fn().mockResolvedValue([buildJobRow()]),
      createCandidates: vi.fn().mockResolvedValue([]),
      findCandidatesByJob: vi.fn().mockResolvedValue([]),
    } as unknown as QuestionGenerationRepository;

    validation = { validate: vi.fn() } as unknown as QuestionValidationService;
    templateGenerator = new TemplateGenerator();
    const aiGenerator = { generate: vi.fn().mockResolvedValue([]) } as unknown as AiGenerator;
    const hybridGenerator = {
      generate: vi.fn().mockResolvedValue([]),
    } as unknown as HybridGenerator;

    service = new QuestionGenerationJobService(
      generationRepository,
      questionsRepository,
      validation,
      templateGenerator,
      aiGenerator,
      hybridGenerator,
    );
  });

  const baseRequest: CreateGenerationJobRequest = {
    sportId: 'sport-1',
    sourceType: 'competition',
    generationMethod: 'TEMPLATE',
    categories: ['WORLD_CUP'],
    difficulties: ['EASY'],
    requestedCount: 10,
  };

  it('creates a job and marks it COMPLETED when the generator returns no candidates', async () => {
    const result = await service.createJob(baseRequest, 'user-1');
    expect(generationRepository.createJob).toHaveBeenCalled();
    expect(generationRepository.updateJob).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ status: 'COMPLETED', generatedCount: 0 }),
    );
    expect(result.status).toBe('COMPLETED');
  });

  it('rejects a sportId that does not resolve to a sport', async () => {
    questionsRepository.findSportSlugById = vi.fn().mockResolvedValue(undefined);
    await expect(service.createJob(baseRequest, 'user-1')).rejects.toThrow();
  });

  it('marks the job FAILED when the generator throws', async () => {
    templateGenerator.generate = vi.fn().mockRejectedValue(new Error('boom'));
    await expect(service.createJob(baseRequest, 'user-1')).rejects.toThrow();
    expect(generationRepository.updateJob).toHaveBeenCalledWith(
      'job-1',
      expect.objectContaining({ status: 'FAILED' }),
    );
  });

  it('routes an exact-duplicate candidate to DUPLICATE status', async () => {
    templateGenerator.generate = vi.fn().mockResolvedValue([
      {
        factKey: 'football:x:y',
        sourceEntityType: null,
        sourceEntityId: null,
        questionText: 'Who won?',
        options: [
          { optionText: 'A', isCorrect: true },
          { optionText: 'B', isCorrect: false },
          { optionText: 'C', isCorrect: false },
          { optionText: 'D', isCorrect: false },
        ],
        explanation: 'Because.',
        suggestedCategory: 'WORLD_CUP',
        suggestedDifficulty: 'EASY',
        sourceReferences: [],
        generationMethod: 'TEMPLATE',
        generationModel: null,
      },
    ]);
    validation.validate = vi.fn().mockResolvedValue({
      severity: 'FAIL',
      checks: [],
      duplicate: {
        outcome: 'EXACT_DUPLICATE',
        duplicateQuestionId: 'existing-id',
        duplicateQuestionCode: 'SBQ-FB-000001',
        confidence: 1,
      },
    });

    await service.createJob(baseRequest, 'user-1');

    expect(generationRepository.createCandidates).toHaveBeenCalledWith([
      expect.objectContaining({ status: 'DUPLICATE' }),
    ]);
  });

  it('routes a FAIL (non-duplicate) candidate to VALIDATION_FAILED', async () => {
    templateGenerator.generate = vi.fn().mockResolvedValue([
      {
        factKey: null,
        sourceEntityType: null,
        sourceEntityId: null,
        questionText: 'Who won?',
        options: [
          { optionText: 'A', isCorrect: true },
          { optionText: 'B', isCorrect: false },
          { optionText: 'C', isCorrect: false },
          { optionText: 'D', isCorrect: false },
        ],
        explanation: 'Because.',
        suggestedCategory: 'WORLD_CUP',
        suggestedDifficulty: 'EASY',
        sourceReferences: [],
        generationMethod: 'TEMPLATE',
        generationModel: null,
      },
    ]);
    validation.validate = vi.fn().mockResolvedValue({
      severity: 'FAIL',
      checks: [{ validator: 'correct_answer', severity: 'FAIL', message: 'bad' }],
      duplicate: {
        outcome: 'NO_DUPLICATE',
        duplicateQuestionId: null,
        duplicateQuestionCode: null,
        confidence: null,
      },
    });

    await service.createJob(baseRequest, 'user-1');

    expect(generationRepository.createCandidates).toHaveBeenCalledWith([
      expect.objectContaining({ status: 'VALIDATION_FAILED' }),
    ]);
  });

  it('routes a PASS or WARN candidate to REVIEW_REQUIRED', async () => {
    templateGenerator.generate = vi.fn().mockResolvedValue([
      {
        factKey: null,
        sourceEntityType: null,
        sourceEntityId: null,
        questionText: 'Who won?',
        options: [
          { optionText: 'A', isCorrect: true },
          { optionText: 'B', isCorrect: false },
          { optionText: 'C', isCorrect: false },
          { optionText: 'D', isCorrect: false },
        ],
        explanation: 'Because.',
        suggestedCategory: 'WORLD_CUP',
        suggestedDifficulty: 'EASY',
        sourceReferences: [],
        generationMethod: 'TEMPLATE',
        generationModel: null,
      },
    ]);
    validation.validate = vi.fn().mockResolvedValue({
      severity: 'WARN',
      checks: [{ validator: 'time_sensitivity', severity: 'WARN', message: 'careful' }],
      duplicate: {
        outcome: 'NO_DUPLICATE',
        duplicateQuestionId: null,
        duplicateQuestionCode: null,
        confidence: null,
      },
    });

    await service.createJob(baseRequest, 'user-1');

    expect(generationRepository.createCandidates).toHaveBeenCalledWith([
      expect.objectContaining({ status: 'REVIEW_REQUIRED' }),
    ]);
  });
});
