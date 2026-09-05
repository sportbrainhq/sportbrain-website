import { Injectable, Logger } from '@nestjs/common';
import type {
  CandidateOption,
  CreateGenerationJobRequest,
  GenerationJob,
  QuestionCandidate as QuestionCandidateDto,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import { QuestionValidationService } from '../questions/question-validation.service';
import { QuestionsRepository } from '../questions/questions.repository';
import { AiGenerator } from './generators/ai.generator';
import type { GeneratedCandidate } from './generators/generator.types';
import { HybridGenerator } from './generators/hybrid.generator';
import { TemplateGenerator } from './generators/template.generator';
import type {
  CandidateRow,
  GenerationJobRow,
  NewCandidateRow,
} from './question-generation.repository';
import { QuestionGenerationRepository } from './question-generation.repository';

/**
 * Orchestrates one generation job end to end: resolves the requested
 * generator, runs it, validates every candidate the same way a manually
 * created question would be validated, and files each result into
 * `question_candidate` with the outcome the reviewer needs to see. This is
 * the "Question Generation Engine" box in Part 11's architecture diagram.
 *
 * Runs synchronously within the request. Nothing here is expected to process
 * enough volume to need a queue: unlike news ingestion (which runs
 * continuously against external feeds), a generation job is an editor
 * asking for at most a few hundred candidates at a time, and the missing
 * fact-discovery step means Phase C2's generators return quickly regardless.
 * Revisit if/when a populated template library makes a job long-running.
 */
@Injectable()
export class QuestionGenerationJobService {
  private readonly logger = new Logger(QuestionGenerationJobService.name);

  constructor(
    private readonly repository: QuestionGenerationRepository,
    private readonly questionsRepository: QuestionsRepository,
    private readonly validation: QuestionValidationService,
    private readonly templateGenerator: TemplateGenerator,
    private readonly aiGenerator: AiGenerator,
    private readonly hybridGenerator: HybridGenerator,
  ) {}

  async createJob(input: CreateGenerationJobRequest, createdBy: string): Promise<GenerationJob> {
    const sportSlug = await this.questionsRepository.findSportSlugById(input.sportId);
    if (!sportSlug) {
      throw AppException.badRequest(`No sport with id "${input.sportId}"`);
    }

    const generator = this.resolveGenerator(input.generationMethod);

    const job = await this.repository.createJob({
      sportId: input.sportId,
      sourceType: input.sourceType,
      sourceEntityType: input.sourceEntityType ?? null,
      sourceEntityId: input.sourceEntityId ?? null,
      status: 'RUNNING',
      requestedCount: input.requestedCount,
      generationMethod: input.generationMethod,
      generationConfig: {
        sourceLabel: input.sourceLabel ?? null,
        seasonContext: input.seasonContext ?? null,
        categories: input.categories,
        difficulties: input.difficulties,
      },
      generatorVersion: generator.version,
      createdBy,
      startedAt: new Date(),
    });

    try {
      const generated = await generator.generate({
        sportId: input.sportId,
        sportSlug,
        sourceType: input.sourceType,
        sourceEntityType: input.sourceEntityType ?? null,
        sourceEntityId: input.sourceEntityId ?? null,
        sourceLabel: input.sourceLabel ?? '',
        seasonContext: input.seasonContext ?? null,
        categories: input.categories,
        difficulties: input.difficulties,
        requestedCount: input.requestedCount,
      });

      const tally = await this.validateAndStoreCandidates(
        job.id,
        input.sportId,
        sportSlug,
        generated,
      );

      const finalStatus =
        tally.generatedCount === 0
          ? 'COMPLETED' // nothing generated is not a failure — an exhausted/unwired source is a legitimate outcome (Part 28's logic, applied to generation too)
          : tally.acceptedCount +
                tally.rejectedCount +
                tally.duplicateCount +
                tally.validationFailedCount <
              tally.generatedCount
            ? 'PARTIAL'
            : 'COMPLETED';

      await this.repository.updateJob(job.id, {
        status: finalStatus,
        generatedCount: tally.generatedCount,
        duplicateCount: tally.duplicateCount,
        validationFailedCount: tally.validationFailedCount,
        completedAt: new Date(),
      });

      const updated = await this.repository.findJobById(job.id);
      return this.toJobDto(updated ?? { ...job, status: finalStatus });
    } catch (error) {
      this.logger.error(`Generation job "${job.id}" failed: ${(error as Error).message}`);
      await this.repository.updateJob(job.id, {
        status: 'FAILED',
        completedAt: new Date(),
        metadata: { error: (error as Error).message },
      });
      throw AppException.badRequest('Question generation failed. See job status for detail.');
    }
  }

  async findJob(id: string): Promise<GenerationJob> {
    const row = await this.repository.findJobById(id);
    if (!row) throw AppException.notFound(`No generation job with id "${id}"`);
    return this.toJobDto(row);
  }

  async listJobs(): Promise<GenerationJob[]> {
    const rows = await this.repository.listJobs();
    return rows.map((row) => this.toJobDto(row));
  }

  async listCandidates(jobId: string): Promise<QuestionCandidateDto[]> {
    const rows = await this.repository.findCandidatesByJob(jobId);
    return rows.map((row) => this.toCandidateDto(row));
  }

  private resolveGenerator(method: CreateGenerationJobRequest['generationMethod']) {
    switch (method) {
      case 'TEMPLATE':
        return this.templateGenerator;
      case 'AI':
        return this.aiGenerator;
      case 'HYBRID':
        return this.hybridGenerator;
    }
  }

  /**
   * Runs every generated candidate through the same validators a manual
   * question passes through (Part 18's schema/duplicate/option/language/time
   * checks), adapted to the candidate's looser shape (no `sportId`
   * wrapper needed since it's already known). Unlike manual creation, `WARN`
   * does not block here — Part 18: warnings proceed to editorial review for
   * generated candidates. Only `FAIL` routes a candidate to
   * VALIDATION_FAILED/DUPLICATE instead of REVIEW_REQUIRED.
   */
  private async validateAndStoreCandidates(
    jobId: string,
    sportId: string,
    sportSlug: string,
    generated: GeneratedCandidate[],
  ): Promise<{
    generatedCount: number;
    acceptedCount: number;
    rejectedCount: number;
    duplicateCount: number;
    validationFailedCount: number;
  }> {
    const rows: NewCandidateRow[] = [];
    let duplicateCount = 0;
    let validationFailedCount = 0;

    for (const candidate of generated) {
      const result = await this.validation.validate(
        {
          sportId,
          category: candidate.suggestedCategory,
          difficulty: candidate.suggestedDifficulty,
          questionType: 'SINGLE_CHOICE',
          questionText: candidate.questionText,
          options: candidate.options.map((option) => ({
            optionText: option.optionText,
            isCorrect: option.isCorrect,
            explanation: option.explanation ?? null,
          })),
          explanation: candidate.explanation ?? '',
          sourceName: candidate.sourceReferences[0]?.label ?? null,
          sourceUrl: null,
          sourceEntityType: candidate.sourceEntityType,
          sourceEntityId: candidate.sourceEntityId,
          factKey: candidate.factKey,
          validFrom: null,
          validUntil: null,
        },
        sportSlug,
      );

      let status: NewCandidateRow['status'];
      if (result.duplicate.outcome === 'EXACT_DUPLICATE') {
        status = 'DUPLICATE';
        duplicateCount += 1;
      } else if (result.severity === 'FAIL') {
        status = 'VALIDATION_FAILED';
        validationFailedCount += 1;
      } else {
        // PASS or WARN both land in the review queue (Part 18).
        status = 'REVIEW_REQUIRED';
      }

      rows.push({
        generationJobId: jobId,
        sportId,
        factKey: candidate.factKey,
        sourceEntityType: candidate.sourceEntityType,
        sourceEntityId: candidate.sourceEntityId,
        questionText: candidate.questionText,
        options: candidate.options,
        explanation: candidate.explanation,
        suggestedCategory: candidate.suggestedCategory,
        suggestedDifficulty: candidate.suggestedDifficulty,
        sourceReferences: candidate.sourceReferences,
        generationMethod: candidate.generationMethod,
        generatorVersion: this.resolveGenerator(
          candidate.generationMethod === 'MANUAL' ? 'TEMPLATE' : candidate.generationMethod,
        ).version,
        generationModel: candidate.generationModel,
        validationStatus: result.severity,
        validationResult: result,
        duplicateQuestionId: result.duplicate.duplicateQuestionId,
        duplicateConfidence: result.duplicate.confidence,
        status,
      });
    }

    await this.repository.createCandidates(rows);

    return {
      generatedCount: generated.length,
      acceptedCount: 0,
      rejectedCount: 0,
      duplicateCount,
      validationFailedCount,
    };
  }

  private toJobDto(row: GenerationJobRow): GenerationJob {
    return {
      id: row.id,
      sportId: row.sportId,
      sourceType: row.sourceType,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.sourceEntityId,
      status: row.status,
      requestedCount: row.requestedCount,
      generatedCount: row.generatedCount,
      acceptedCount: row.acceptedCount,
      rejectedCount: row.rejectedCount,
      duplicateCount: row.duplicateCount,
      validationFailedCount: row.validationFailedCount,
      generationMethod: row.generationMethod,
      generationConfig: row.generationConfig as Record<string, unknown>,
      generatorVersion: row.generatorVersion,
      generationModel: row.generationModel,
      createdBy: row.createdBy,
      createdAt: row.createdAt.toISOString(),
      startedAt: row.startedAt?.toISOString() ?? null,
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  }

  toCandidateDto(row: CandidateRow): QuestionCandidateDto {
    return {
      id: row.id,
      generationJobId: row.generationJobId,
      sportId: row.sportId,
      factKey: row.factKey,
      sourceEntityType: row.sourceEntityType,
      sourceEntityId: row.sourceEntityId,
      questionText: row.questionText,
      options: row.options as CandidateOption[],
      explanation: row.explanation,
      suggestedCategory: row.suggestedCategory,
      suggestedDifficulty: row.suggestedDifficulty,
      sourceReferences: row.sourceReferences as QuestionCandidateDto['sourceReferences'],
      generationMethod: row.generationMethod,
      generatorVersion: row.generatorVersion,
      generationModel: row.generationModel,
      validationStatus: row.validationStatus as QuestionCandidateDto['validationStatus'],
      validationResult: row.validationResult as Record<string, unknown>,
      duplicateQuestionId: row.duplicateQuestionId,
      duplicateConfidence: row.duplicateConfidence,
      status: row.status,
      reviewedBy: row.reviewedBy,
      reviewedAt: row.reviewedAt?.toISOString() ?? null,
      rejectionReason: row.rejectionReason,
      variantJustification: row.variantJustification,
      publishedQuestionId: row.publishedQuestionId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
