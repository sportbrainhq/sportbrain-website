import { Injectable } from '@nestjs/common';
import type {
  AdminQuestion,
  CreateQuestionRequest,
  QuestionValidationResult,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { computeQuestionFingerprint, normalizeQuestionText } from './question-fingerprint';
import { QuestionCodeService } from './question-code.service';
import { QuestionValidationService } from './question-validation.service';
import type { NewQuestionOptionRow, QuestionOptionRow, QuestionRow } from './questions.repository';
import { QuestionsRepository } from './questions.repository';

const OPTION_CODES = ['A', 'B', 'C', 'D'] as const;

/**
 * Question Bank writes: the one place `CreateQuestionRequest` becomes rows.
 * Manual creation (Part 21) is the only caller in Phase C1; the generation
 * pipeline's candidate-publish step (a later phase) is expected to call
 * `create` too, once a candidate has been approved — "run the same
 * validation pipeline" only holds if both paths share this method rather
 * than each re-implementing it.
 */
@Injectable()
export class QuestionsService {
  constructor(
    private readonly repository: QuestionsRepository,
    private readonly validation: QuestionValidationService,
    private readonly codes: QuestionCodeService,
  ) {}

  /** Pre-flight duplicate check exposed standalone (`POST /admin/questions/check-duplicate`) so an editor can check before filling in the rest of the form. */
  async checkDuplicate(
    sportId: string,
    questionText: string,
  ): Promise<QuestionValidationResult['duplicate']> {
    return this.validation.checkExactDuplicate(sportId, normalizeQuestionText(questionText));
  }

  async create(input: CreateQuestionRequest, createdBy: string | null): Promise<AdminQuestion> {
    const sportSlug = await this.repository.findSportSlugById(input.sportId);
    if (!sportSlug) {
      throw AppException.badRequest(`No sport with id "${input.sportId}"`);
    }

    const result = await this.validation.validate(input, sportSlug);
    // Manual creation runs strict: Part 21/22 exempt nothing from validation,
    // and there is no reviewer in this path (unlike a generated candidate)
    // to knowingly accept a WARN, so WARN blocks the same as FAIL here.
    if (result.severity !== 'PASS') {
      const message = result.checks
        .map((check) => `[${check.severity}] ${check.message}`)
        .join(' ');
      throw AppException.validationFailed(
        message || 'Question failed validation.',
        result.checks.map((check) => ({ path: check.validator, message: check.message })),
      );
    }

    const normalizedQuestionText = normalizeQuestionText(input.questionText);
    const questionFingerprint = computeQuestionFingerprint(input.sportId, normalizedQuestionText);
    const questionCode = await this.codes.nextCode(sportSlug);

    const optionsInsert: Omit<NewQuestionOptionRow, 'questionId'>[] = input.options.map(
      (option, index) => ({
        // `createQuestionRequestSchema` enforces exactly four options, so
        // `index` is always 0-3 and this index into `OPTION_CODES` never falls
        // through to `undefined`.
        optionCode: OPTION_CODES[index] as (typeof OPTION_CODES)[number],
        optionText: option.optionText,
        isCorrect: option.isCorrect,
        displayOrder: index,
        explanation: option.explanation ?? null,
      }),
    );

    const created = await this.repository.create(
      {
        questionCode,
        sportId: input.sportId,
        category: input.category,
        difficulty: input.difficulty,
        questionType: input.questionType,
        status: 'DRAFT',
        questionText: input.questionText,
        normalizedQuestionText,
        questionFingerprint,
        factKey: input.factKey ?? null,
        explanation: input.explanation,
        sourceName: input.sourceName ?? null,
        sourceUrl: input.sourceUrl ?? null,
        sourceEntityType: input.sourceEntityType ?? null,
        sourceEntityId: input.sourceEntityId ?? null,
        validFrom: input.validFrom ? new Date(input.validFrom) : null,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        generationMethod: 'MANUAL',
        createdBy,
      },
      optionsInsert,
    );

    return this.toAdminDto(created.question, created.options);
  }

  async findById(id: string): Promise<AdminQuestion> {
    const found = await this.repository.findById(id);
    if (!found) throw AppException.notFound(`No question with id "${id}"`);
    return this.toAdminDto(found.question, found.options);
  }

  private toAdminDto(row: QuestionRow, options: QuestionOptionRow[]): AdminQuestion {
    return {
      id: row.id,
      questionCode: row.questionCode,
      questionText: row.questionText,
      normalizedQuestionText: row.normalizedQuestionText,
      questionFingerprint: row.questionFingerprint,
      factKey: row.factKey,
      questionVariant: row.questionVariant,
      sportId: row.sportId,
      category: row.category,
      difficulty: row.difficulty,
      questionType: row.questionType,
      status: row.status,
      explanation: row.explanation,
      sourceName: row.sourceName,
      sourceUrl: row.sourceUrl,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.sourceEntityId,
      validFrom: row.validFrom?.toISOString() ?? null,
      validUntil: row.validUntil?.toISOString() ?? null,
      verificationStatus: row.verificationStatus,
      lastVerifiedAt: row.lastVerifiedAt?.toISOString() ?? null,
      generationMethod: row.generationMethod,
      generationJobId: row.generationJobId,
      generatorVersion: row.generatorVersion,
      generationModel: row.generationModel,
      createdBy: row.createdBy,
      reviewedBy: row.reviewedBy,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      retiredAt: row.retiredAt?.toISOString() ?? null,
      options: options
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((option) => ({
          id: option.id,
          optionCode: option.optionCode as 'A' | 'B' | 'C' | 'D',
          optionText: option.optionText,
          displayOrder: option.displayOrder,
          isCorrect: option.isCorrect,
          explanation: option.explanation,
        })),
    };
  }
}
