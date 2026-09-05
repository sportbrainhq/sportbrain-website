import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuestionCodeService } from '../questions/question-code.service';
import { QuestionsRepository } from '../questions/questions.repository';
import { CandidateReviewService } from './candidate-review.service';
import { QuestionGenerationJobService } from './question-generation-job.service';
import { QuestionGenerationRepository } from './question-generation.repository';

function buildCandidateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'candidate-1',
    generationJobId: 'job-1',
    sportId: 'sport-1',
    factKey: null,
    sourceEntityType: null,
    sourceEntityId: null,
    questionText: 'Who won the 2022 FIFA World Cup?',
    options: [
      { optionText: 'Argentina', isCorrect: true },
      { optionText: 'France', isCorrect: false },
      { optionText: 'Brazil', isCorrect: false },
      { optionText: 'Croatia', isCorrect: false },
    ],
    explanation: 'Argentina won on penalties.',
    suggestedCategory: 'WORLD_CUP',
    suggestedDifficulty: 'EASY',
    sourceReferences: [{ label: 'SportBrain structured data' }],
    generationMethod: 'TEMPLATE',
    generatorVersion: 'QUIZ_GEN_TEMPLATE_V1',
    generationModel: null,
    validationStatus: 'PASS',
    validationResult: { checks: [] },
    duplicateQuestionId: null,
    duplicateConfidence: null,
    status: 'REVIEW_REQUIRED',
    reviewedBy: null,
    reviewedAt: null,
    rejectionReason: null,
    variantJustification: null,
    publishedQuestionId: null,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('CandidateReviewService', () => {
  let generationRepository: QuestionGenerationRepository;
  let questionsRepository: QuestionsRepository;
  let codes: QuestionCodeService;
  let jobService: QuestionGenerationJobService;
  let service: CandidateReviewService;

  beforeEach(() => {
    generationRepository = {
      findCandidateById: vi.fn().mockResolvedValue(buildCandidateRow()),
      updateCandidate: vi
        .fn()
        .mockImplementation((_id, patch) => ({ ...buildCandidateRow(), ...patch })),
    } as unknown as QuestionGenerationRepository;

    questionsRepository = {
      findSportSlugById: vi.fn().mockResolvedValue('football'),
      findByFingerprint: vi.fn().mockResolvedValue(undefined),
      create: vi.fn().mockResolvedValue({
        question: { id: 'question-1', questionCode: 'SBQ-FB-000001' },
        options: [],
      }),
    } as unknown as QuestionsRepository;

    codes = {
      nextCode: vi.fn().mockResolvedValue('SBQ-FB-000001'),
    } as unknown as QuestionCodeService;

    jobService = {
      toCandidateDto: vi.fn().mockImplementation((row) => row),
    } as unknown as QuestionGenerationJobService;

    service = new CandidateReviewService(
      generationRepository,
      questionsRepository,
      codes,
      jobService,
    );
  });

  it('approves a clean candidate and publishes it as a canonical question', async () => {
    const result = await service.approve('candidate-1', 'reviewer-1', {});
    expect(questionsRepository.create).toHaveBeenCalled();
    expect(generationRepository.updateCandidate).toHaveBeenCalledWith(
      'candidate-1',
      expect.objectContaining({ status: 'PUBLISHED', publishedQuestionId: 'question-1' }),
    );
    expect(result.status).toBe('PUBLISHED');
  });

  it('rejects a candidate with a reason', async () => {
    const result = await service.reject('candidate-1', 'reviewer-1', {
      rejectionReason: 'Ambiguous wording',
    });
    expect(generationRepository.updateCandidate).toHaveBeenCalledWith(
      'candidate-1',
      expect.objectContaining({ status: 'REJECTED', rejectionReason: 'Ambiguous wording' }),
    );
    expect(result.status).toBe('REJECTED');
  });

  it('refuses to approve an already-published candidate', async () => {
    generationRepository.findCandidateById = vi
      .fn()
      .mockResolvedValue(buildCandidateRow({ status: 'PUBLISHED' }));
    await expect(service.approve('candidate-1', 'reviewer-1', {})).rejects.toThrow();
  });

  it('refuses to approve a DUPLICATE-status candidate', async () => {
    generationRepository.findCandidateById = vi
      .fn()
      .mockResolvedValue(buildCandidateRow({ status: 'DUPLICATE' }));
    await expect(service.approve('candidate-1', 'reviewer-1', {})).rejects.toThrow();
  });

  it('requires variantJustification when the candidate had a fact-duplicate warning', async () => {
    generationRepository.findCandidateById = vi.fn().mockResolvedValue(
      buildCandidateRow({
        factKey: 'football:fifa-world-cup:2022:winner',
        validationResult: {
          checks: [{ validator: 'fact_duplicate', severity: 'WARN', message: 'shared factKey' }],
        },
      }),
    );
    await expect(service.approve('candidate-1', 'reviewer-1', {})).rejects.toThrow();
  });

  it('accepts an intentional variant once justification is supplied', async () => {
    generationRepository.findCandidateById = vi.fn().mockResolvedValue(
      buildCandidateRow({
        factKey: 'football:fifa-world-cup:2022:winner',
        validationResult: {
          checks: [{ validator: 'fact_duplicate', severity: 'WARN', message: 'shared factKey' }],
        },
      }),
    );
    const result = await service.approve('candidate-1', 'reviewer-1', {
      variantJustification: 'Tests the golden boot fact, not the winner fact.',
    });
    expect(result.status).toBe('PUBLISHED');
  });

  it('blocks publish when an exact-duplicate fingerprint now exists', async () => {
    questionsRepository.findByFingerprint = vi
      .fn()
      .mockResolvedValue({ id: 'existing', questionCode: 'SBQ-FB-000002' });
    await expect(service.approve('candidate-1', 'reviewer-1', {})).rejects.toThrow();
  });

  it('edit-and-approve applies overrides before publishing', async () => {
    await service.editAndApprove('candidate-1', 'reviewer-1', {
      questionText: 'Which nation won the 2022 FIFA World Cup?',
    });
    expect(questionsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ questionText: 'Which nation won the 2022 FIFA World Cup?' }),
      expect.any(Array),
    );
  });
});
