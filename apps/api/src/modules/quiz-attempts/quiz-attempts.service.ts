import { randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ActiveQuizAttempt,
  AttemptQuestion,
  QuizAttempt as QuizAttemptDto,
  QuizHistoryItem,
  StartQuizRequest,
  SubmitAnswerResponse,
} from '@sportbrain/contracts';
import { AppException } from '../../common';
import type { AppConfig } from '../../config';
import { EligibleQuestionsRepository } from '../quiz-generation/eligible-questions.repository';
import { QuestionExposureRepository } from '../quiz-generation/question-exposure.repository';
import { QuizGenerationService } from '../quiz-generation/quiz-generation.service';
import type {
  NewQuizAttemptQuestionRow,
  QuizAttemptQuestionRow,
  QuizAttemptRow,
} from './quiz-attempts.repository';
import { QuizAttemptsRepository } from './quiz-attempts.repository';

type OptionCode = 'A' | 'B' | 'C' | 'D';

/**
 * The quiz-taking lifecycle end to end (Part 31, 36-42): start an attempt
 * (delegating question selection to `QuizGenerationService`), answer one
 * question at a time with server-side grading, complete or abandon, and
 * resume. This is the only place that writes `quiz_attempt_v2`/
 * `quiz_attempt_question_v2` — nothing computes a score anywhere else, and
 * nothing trusts a client-submitted correctness value (Part 36).
 */
@Injectable()
export class QuizAttemptsService {
  constructor(
    private readonly repository: QuizAttemptsRepository,
    private readonly generation: QuizGenerationService,
    private readonly eligibleQuestions: EligibleQuestionsRepository,
    private readonly exposure: QuestionExposureRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async start(userId: string, request: StartQuizRequest): Promise<QuizAttemptDto> {
    const sportId = request.sportId ?? null;

    // Part 38: one active attempt per user + quizType (+ sport). Starting a
    // new one while another is IN_PROGRESS is refused outright — the client
    // is expected to have already offered "Resume Current / Abandon & Start
    // New" via `GET /me/quiz-active` before ever calling this with intent to
    // create a second one.
    const existingActive = await this.repository.findActiveAttempt(
      userId,
      request.quizType,
      sportId,
    );
    if (existingActive) {
      throw AppException.conflict(
        `You already have a ${request.quizType.toLowerCase()} quiz in progress (${existingActive.publicCode}). Resume it or abandon it before starting a new one.`,
      );
    }

    const generated = await this.generation.generate({
      userId,
      quizType: request.quizType,
      sportId,
      mode: request.mode,
    });

    if (generated.questions.length === 0) {
      throw AppException.badRequest(
        "You've explored everything currently available in this quiz. More questions are being added.",
      );
    }

    const optionsByQuestion = await this.eligibleQuestions.findOptionsForQuestions(
      generated.questions.map((q) => q.id),
    );

    const now = new Date();
    const publicCode = this.generatePublicCode();

    const questionRows: Omit<NewQuizAttemptQuestionRow, 'quizAttemptId'>[] =
      generated.questions.map((q, index) => {
        const options = (optionsByQuestion.get(q.id) ?? []).sort(
          (a, b) => a.displayOrder - b.displayOrder,
        );
        const correctOption = options.find((option) => option.isCorrect);
        if (!correctOption) {
          // A published question must have exactly one correct option
          // (enforced at creation/publish time) — this can only mean the
          // data is corrupt, so fail loudly rather than serve an
          // unanswerable question.
          throw new Error(`Question "${q.id}" has no correct option at quiz-start time.`);
        }
        return {
          questionId: q.id,
          position: index + 1,
          questionTextSnapshot: q.questionText,
          optionsSnapshot: options.map((option) => ({
            optionCode: option.optionCode,
            optionText: option.optionText,
            displayOrder: option.displayOrder,
          })),
          correctOptionSnapshot: correctOption.optionCode,
          explanationSnapshot: q.explanation,
          difficultySnapshot: q.difficulty,
          categorySnapshot: q.category,
        };
      });

    const { attempt, questions } = await this.repository.create(
      {
        publicCode,
        userId,
        quizType: request.quizType,
        sportId,
        mode: request.mode,
        status: 'IN_PROGRESS',
        requestedQuestionCount: generated.requestedQuestionCount,
        actualQuestionCount: generated.questions.length,
        startedAt: now,
        lastActivityAt: now,
        generationMetadata: { sportAllocation: generated.sportAllocation },
      },
      questionRows,
    );

    await this.exposure.recordServed(
      userId,
      generated.questions.map((q) => q.id),
      now,
    );

    return this.toAttemptDto(attempt, questions);
  }

  async findByPublicCode(userId: string, publicCode: string): Promise<QuizAttemptDto> {
    const attempt = await this.requireOwnedAttempt(userId, publicCode);
    const questions = await this.repository.findQuestionsForAttempt(attempt.id);
    return this.toAttemptDto(attempt, questions);
  }

  /**
   * Server-side grading (Part 36): correctness is decided from
   * `correctOptionSnapshot`, never trusted from the client. Idempotent
   * (Part 37): a retried request lands on an already-answered position and
   * returns the same result rather than re-scoring.
   */
  async submitAnswer(
    userId: string,
    publicCode: string,
    attemptQuestionId: string,
    selectedOptionCode: OptionCode,
  ): Promise<SubmitAnswerResponse> {
    const attempt = await this.requireOwnedAttempt(userId, publicCode);
    if (attempt.status !== 'IN_PROGRESS') {
      throw AppException.conflict(
        `This quiz is ${attempt.status.toLowerCase()} and cannot be answered.`,
      );
    }

    const attemptQuestion = await this.repository.findAttemptQuestion(
      attempt.id,
      attemptQuestionId,
    );
    if (!attemptQuestion) {
      throw AppException.notFound('That question does not belong to this attempt.');
    }

    const options = attemptQuestion.optionsSnapshot as { optionCode: string; optionText: string }[];
    const selectedOption = options.find((option) => option.optionCode === selectedOptionCode);
    if (!selectedOption) {
      throw AppException.badRequest('That option does not belong to this question.');
    }

    const now = new Date();
    const isCorrect = selectedOptionCode === attemptQuestion.correctOptionSnapshot;

    const updated = await this.repository.recordAnswer(attemptQuestionId, {
      selectedOptionCode,
      selectedOptionTextSnapshot: selectedOption.optionText,
      isCorrect,
      answeredAt: now,
      responseTimeMs: now.getTime() - attempt.lastActivityAt.getTime(),
    });

    // `updated` is undefined when the position was already answered (the
    // idempotency guard in the repository) — a retried request, not an
    // error. Re-derive the response from the existing row rather than
    // re-grading, so a duplicate network request never double-counts.
    const effectiveQuestion = updated ?? attemptQuestion;
    const effectiveIsCorrect = effectiveQuestion.isCorrect ?? isCorrect;

    if (updated) {
      await this.exposure.recordAnswer(userId, attemptQuestion.questionId, effectiveIsCorrect, now);
      await this.repository.updateAttempt(attempt.id, {
        lastActivityAt: now,
        correctCount: effectiveIsCorrect ? attempt.correctCount + 1 : attempt.correctCount,
        incorrectCount: effectiveIsCorrect ? attempt.incorrectCount : attempt.incorrectCount + 1,
      });
    }

    const allQuestions = await this.repository.findQuestionsForAttempt(attempt.id);
    const attemptComplete = allQuestions.every((q) => q.answeredAt !== null);

    return {
      isCorrect: effectiveIsCorrect,
      correctOptionCode: effectiveQuestion.correctOptionSnapshot as OptionCode,
      explanation: effectiveQuestion.explanationSnapshot,
      attemptComplete,
    };
  }

  /** Idempotent (Part 37): completing an already-COMPLETED attempt returns its existing result rather than re-grading. */
  async complete(userId: string, publicCode: string): Promise<QuizAttemptDto> {
    const attempt = await this.requireOwnedAttempt(userId, publicCode);
    const questions = await this.repository.findQuestionsForAttempt(attempt.id);

    if (attempt.status === 'COMPLETED') {
      return this.toAttemptDto(attempt, questions);
    }
    if (attempt.status !== 'IN_PROGRESS') {
      throw AppException.conflict(
        `This quiz is ${attempt.status.toLowerCase()} and cannot be completed.`,
      );
    }

    const now = new Date();
    const correctCount = questions.filter((q) => q.isCorrect === true).length;
    const incorrectCount = questions.filter((q) => q.isCorrect === false).length;
    const answeredCount = correctCount + incorrectCount;
    const scorePercentage =
      answeredCount > 0 ? Math.round((correctCount / answeredCount) * 10_000) / 100 : 0;
    const durationSeconds = Math.max(
      0,
      Math.round((now.getTime() - attempt.startedAt.getTime()) / 1000),
    );

    const updated = await this.repository.updateAttempt(attempt.id, {
      status: 'COMPLETED',
      completedAt: now,
      lastActivityAt: now,
      correctCount,
      incorrectCount,
      scorePercentage: scorePercentage.toFixed(2),
      durationSeconds,
    });

    return this.toAttemptDto(updated, questions);
  }

  async abandon(userId: string, publicCode: string): Promise<void> {
    const attempt = await this.requireOwnedAttempt(userId, publicCode);
    if (attempt.status !== 'IN_PROGRESS') return; // idempotent: abandoning a non-active attempt is a no-op, not an error
    const now = new Date();
    await this.repository.updateAttempt(attempt.id, {
      status: 'ABANDONED',
      abandonedAt: now,
      lastActivityAt: now,
    });
  }

  /** `GET /me/quiz-active` — Part 38's resume prompt. Null means nothing to resume. */
  async findActive(
    userId: string,
    quizType: 'SPORT' | 'MASTER',
    sportId: string | null,
  ): Promise<ActiveQuizAttempt | null> {
    const attemptExpiryMs =
      this.config.get('quiz', { infer: true }).attemptExpiryHours * 60 * 60 * 1000;
    const attempt = await this.repository.findActiveAttempt(userId, quizType, sportId);
    if (!attempt) return null;

    // Lazily expire: an IN_PROGRESS attempt untouched past the configured
    // window is treated as EXPIRED on next read (Part 29), not resumable.
    if (Date.now() - attempt.lastActivityAt.getTime() > attemptExpiryMs) {
      await this.repository.updateAttempt(attempt.id, { status: 'EXPIRED' });
      return null;
    }

    const questions = await this.repository.findQuestionsForAttempt(attempt.id);
    return {
      publicCode: attempt.publicCode,
      quizType: attempt.quizType,
      sportId: attempt.sportId,
      mode: attempt.mode,
      actualQuestionCount: attempt.actualQuestionCount,
      answeredCount: questions.filter((q) => q.answeredAt !== null).length,
      startedAt: attempt.startedAt.toISOString(),
      lastActivityAt: attempt.lastActivityAt.toISOString(),
    };
  }

  async listHistory(userId: string, limit: number): Promise<QuizHistoryItem[]> {
    const attempts = await this.repository.findRecentForUser(userId, limit);
    return attempts.map((attempt) => this.toSummaryDto(attempt));
  }

  private async requireOwnedAttempt(userId: string, publicCode: string): Promise<QuizAttemptRow> {
    const attempt = await this.repository.findByPublicCode(publicCode);
    if (!attempt) throw AppException.notFound(`No quiz attempt "${publicCode}"`);
    if (attempt.userId !== userId)
      throw AppException.forbidden('This quiz attempt belongs to someone else.');
    return attempt;
  }

  private generatePublicCode(): string {
    return `QZ-${randomBytes(6).toString('hex').toUpperCase()}`;
  }

  private toAttemptDto(
    attempt: QuizAttemptRow,
    questions: QuizAttemptQuestionRow[],
  ): QuizAttemptDto {
    return {
      ...this.toSummaryDto(attempt),
      questions: questions
        .sort((a, b) => a.position - b.position)
        .map((question) => this.toQuestionDto(question)),
    };
  }

  private toSummaryDto(attempt: QuizAttemptRow): QuizHistoryItem {
    return {
      id: attempt.id,
      publicCode: attempt.publicCode,
      quizType: attempt.quizType,
      sportId: attempt.sportId,
      mode: attempt.mode,
      status: attempt.status,
      requestedQuestionCount: attempt.requestedQuestionCount,
      actualQuestionCount: attempt.actualQuestionCount,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      scorePercentage: attempt.scorePercentage !== null ? Number(attempt.scorePercentage) : null,
      startedAt: attempt.startedAt.toISOString(),
      lastActivityAt: attempt.lastActivityAt.toISOString(),
      completedAt: attempt.completedAt?.toISOString() ?? null,
      abandonedAt: attempt.abandonedAt?.toISOString() ?? null,
      durationSeconds: attempt.durationSeconds,
    };
  }

  private toQuestionDto(question: QuizAttemptQuestionRow): AttemptQuestion {
    const answered = question.answeredAt !== null;
    return {
      id: question.id,
      questionId: question.questionId,
      position: question.position,
      questionText: question.questionTextSnapshot,
      options: (question.optionsSnapshot as AttemptQuestion['options']) ?? [],
      category: question.categorySnapshot,
      difficulty: question.difficultySnapshot,
      selectedOptionCode: (question.selectedOptionCode as OptionCode | null) ?? null,
      isCorrect: question.isCorrect,
      // Never revealed until the position has been answered (Part 31, 36).
      correctOptionCode: answered ? (question.correctOptionSnapshot as OptionCode) : null,
      explanation: answered ? question.explanationSnapshot : null,
    };
  }
}
