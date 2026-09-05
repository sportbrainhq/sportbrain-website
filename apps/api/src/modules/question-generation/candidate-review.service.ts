import { Injectable } from '@nestjs/common';
import type {
  ApproveCandidateRequest,
  CandidateOption,
  EditAndApproveCandidateRequest,
  PatchCandidateRequest,
  QuestionCandidate as QuestionCandidateDto,
  RejectCandidateRequest,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { QuestionCodeService } from '../questions/question-code.service';
import {
  computeQuestionFingerprint,
  normalizeQuestionText,
} from '../questions/question-fingerprint';
import type { NewQuestionOptionRow } from '../questions/questions.repository';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuestionGenerationJobService } from './question-generation-job.service';
import type { CandidateRow } from './question-generation.repository';
import { QuestionGenerationRepository } from './question-generation.repository';

const OPTION_CODES = ['A', 'B', 'C', 'D'] as const;

/**
 * The editor review queue's actions (Part 17): approve, edit & approve,
 * reject, or keep as an intentional variant. Every path that ends in
 * "published" goes through `QuestionsRepository.create`, the same insert
 * manual creation uses — a candidate becoming canonical is not a different
 * code path from an editor typing the question in directly, just a
 * different origin for the input.
 */
@Injectable()
export class CandidateReviewService {
  constructor(
    private readonly repository: QuestionGenerationRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly codes: QuestionCodeService,
    private readonly jobService: QuestionGenerationJobService,
  ) {}

  async patch(candidateId: string, patch: PatchCandidateRequest): Promise<QuestionCandidateDto> {
    const candidate = await this.requireReviewable(candidateId);
    const updated = await this.repository.updateCandidate(candidate.id, {
      questionText: patch.questionText ?? candidate.questionText,
      options: patch.options ?? candidate.options,
      explanation: patch.explanation ?? candidate.explanation,
      suggestedCategory: patch.suggestedCategory ?? candidate.suggestedCategory,
      suggestedDifficulty: patch.suggestedDifficulty ?? candidate.suggestedDifficulty,
    });
    return this.jobService.toCandidateDto(updated);
  }

  async approve(
    candidateId: string,
    reviewerId: string,
    request: ApproveCandidateRequest,
  ): Promise<QuestionCandidateDto> {
    return this.publish(candidateId, reviewerId, {}, request.variantJustification);
  }

  async editAndApprove(
    candidateId: string,
    reviewerId: string,
    request: EditAndApproveCandidateRequest,
  ): Promise<QuestionCandidateDto> {
    return this.publish(
      candidateId,
      reviewerId,
      {
        questionText: request.questionText,
        options: request.options,
        explanation: request.explanation,
        category: request.category,
        difficulty: request.difficulty,
      },
      request.variantJustification,
    );
  }

  async reject(
    candidateId: string,
    reviewerId: string,
    request: RejectCandidateRequest,
  ): Promise<QuestionCandidateDto> {
    const candidate = await this.requireReviewable(candidateId);
    const updated = await this.repository.updateCandidate(candidate.id, {
      status: 'REJECTED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: request.rejectionReason,
    });
    return this.jobService.toCandidateDto(updated);
  }

  private async requireReviewable(candidateId: string): Promise<CandidateRow> {
    const candidate = await this.repository.findCandidateById(candidateId);
    if (!candidate) throw AppException.notFound(`No candidate with id "${candidateId}"`);
    if (candidate.status === 'PUBLISHED') {
      throw AppException.conflict('Candidate has already been published.');
    }
    if (candidate.status === 'REJECTED') {
      throw AppException.conflict('Candidate has already been rejected.');
    }
    return candidate;
  }

  /**
   * Shared approve / edit-and-approve path. A candidate whose fact-duplicate
   * check flagged a match (`validationResult.duplicate.outcome` is
   * `EXACT_DUPLICATE` or the fact-duplicate `WARN` check fired) requires
   * `variantJustification` — Part 17: "Intentional variant should require
   * reviewer justification." Exact duplicates are never approvable at all;
   * a reviewer resolves those as REJECTED or by opening the existing
   * question, never by publishing a second row with the same fingerprint
   * (the DB's unique index would reject the insert regardless).
   */
  private async publish(
    candidateId: string,
    reviewerId: string,
    overrides: {
      questionText?: string;
      options?: CandidateOption[];
      explanation?: string;
      category?: EditAndApproveCandidateRequest['category'];
      difficulty?: EditAndApproveCandidateRequest['difficulty'];
    },
    variantJustification: string | undefined,
  ): Promise<QuestionCandidateDto> {
    const candidate = await this.requireReviewable(candidateId);

    if (candidate.status === 'DUPLICATE') {
      throw AppException.conflict(
        'This candidate is an exact duplicate of an existing question and cannot be published. Reject it, or open the existing question.',
      );
    }

    const hadFactDuplicateWarning = Boolean(
      candidate.factKey &&
      (candidate.validationResult as { checks?: { validator: string }[] })?.checks?.some(
        (check) => check.validator === 'fact_duplicate',
      ),
    );
    if (hadFactDuplicateWarning && !variantJustification) {
      throw AppException.badRequest(
        'This candidate shares a factKey with an existing question. Provide variantJustification to approve it as an intentional variant.',
      );
    }

    const questionText = overrides.questionText ?? candidate.questionText;
    const options = (overrides.options ?? (candidate.options as CandidateOption[])).map(
      (option, index) => ({
        optionCode: OPTION_CODES[index] as (typeof OPTION_CODES)[number],
        optionText: option.optionText,
        isCorrect: option.isCorrect,
        displayOrder: index,
        explanation: option.explanation ?? null,
      }),
    ) satisfies Omit<NewQuestionOptionRow, 'questionId'>[];

    const sportSlug = await this.questionsRepository.findSportSlugById(candidate.sportId);
    if (!sportSlug) throw AppException.badRequest(`No sport with id "${candidate.sportId}"`);

    const normalizedQuestionText = normalizeQuestionText(questionText);
    const questionFingerprint = computeQuestionFingerprint(
      candidate.sportId,
      normalizedQuestionText,
    );
    const existing = await this.questionsRepository.findByFingerprint(questionFingerprint);
    if (existing) {
      throw AppException.conflict(
        `An identical question already exists (${existing.questionCode}). Reject this candidate as a duplicate.`,
      );
    }

    const questionCode = await this.codes.nextCode(sportSlug);

    const created = await this.questionsRepository.create(
      {
        questionCode,
        sportId: candidate.sportId,
        category: overrides.category ?? candidate.suggestedCategory,
        difficulty: overrides.difficulty ?? candidate.suggestedDifficulty,
        questionType: 'SINGLE_CHOICE',
        status: 'REVIEW_REQUIRED',
        questionText,
        normalizedQuestionText,
        questionFingerprint,
        factKey: candidate.factKey,
        questionVariant: variantJustification ?? null,
        explanation: overrides.explanation ?? candidate.explanation,
        sourceName: (candidate.sourceReferences as { label?: string }[])?.[0]?.label ?? null,
        sourceUrl: null,
        sourceEntityType: candidate.sourceEntityType,
        sourceEntityId: candidate.sourceEntityId,
        validFrom: null,
        validUntil: null,
        generationMethod: candidate.generationMethod,
        generationJobId: candidate.generationJobId,
        generatorVersion: candidate.generatorVersion,
        generationModel: candidate.generationModel,
        reviewedBy: reviewerId,
      },
      options,
    );

    const updated = await this.repository.updateCandidate(candidate.id, {
      status: 'PUBLISHED',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      variantJustification: variantJustification ?? null,
      publishedQuestionId: created.question.id,
    });

    return this.jobService.toCandidateDto(updated);
  }
}
