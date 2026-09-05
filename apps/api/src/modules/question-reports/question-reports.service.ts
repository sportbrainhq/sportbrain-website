import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ReportQuestionRequest, ReportQuestionResult } from '@sportbrain/contracts';
import { AppException } from '../../common';
import type { AppConfig } from '../../config';
import { ContactService } from '../contact/contact.service';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuizAttemptsRepository } from '../quiz-attempts/quiz-attempts.repository';

const REASON_LABEL: Record<ReportQuestionRequest['reason'], string> = {
  incorrect_answer: 'Incorrect answer',
  outdated_information: 'Outdated information',
  ambiguous_wording: 'Ambiguous wording',
  duplicate_question: 'Duplicate question',
  typo_formatting: 'Typo / formatting',
  other: 'Other',
};

/**
 * "Report Question" (Part 44). Deliberately not its own submission/
 * notification pipeline: it composes into the existing Contact & Feedback
 * system (`category: 'quiz_issue'`, which already exists for exactly this)
 * rather than duplicating reference-code generation and email notification.
 *
 * What this module adds beyond a generic contact submission is automatic
 * context capture — questionCode, the attempt's snapshot of what the user
 * actually saw and answered, and the fact this came from a signed-in user —
 * so a reporter never has to describe the question themselves.
 */
@Injectable()
export class QuestionReportsService {
  constructor(
    private readonly contact: ContactService,
    private readonly questions: QuestionsRepository,
    private readonly attempts: QuizAttemptsRepository,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  async report(
    questionId: string,
    userId: string | null,
    userEmail: string | null,
    userName: string | null,
    request: ReportQuestionRequest,
  ): Promise<ReportQuestionResult> {
    if (request.reason === 'other' && !request.details) {
      throw AppException.badRequest('Please describe the issue when selecting "Other".');
    }

    const found = await this.questions.findById(questionId);
    if (!found) throw AppException.notFound(`No question with id "${questionId}"`);

    let attemptContext: {
      quizAttemptPublicCode: string;
      selectedOptionCode: string | null;
      correctOptionCode: string;
    } | null = null;

    if (request.quizAttemptPublicCode && request.attemptQuestionId) {
      const attempt = await this.attempts.findByPublicCode(request.quizAttemptPublicCode);
      // A mismatched or foreign attempt is not fatal to the report — it's
      // still useful without attempt context — so this degrades rather
      // than rejecting the whole report.
      if (attempt && (!userId || attempt.userId === userId)) {
        const attemptQuestion = await this.attempts.findAttemptQuestion(
          attempt.id,
          request.attemptQuestionId,
        );
        if (attemptQuestion && attemptQuestion.questionId === questionId) {
          attemptContext = {
            quizAttemptPublicCode: attempt.publicCode,
            selectedOptionCode: attemptQuestion.selectedOptionCode,
            correctOptionCode: attemptQuestion.correctOptionSnapshot,
          };
        }
      }
    }

    const result = await this.contact.submit({
      request: {
        category: 'quiz_issue',
        name: userName ?? 'SportBrainHQ user',
        email: userEmail ?? 'no-reply@sportbrainhq.com',
        subject: `Question report: ${found.question.questionCode} — ${REASON_LABEL[request.reason]}`,
        message: request.details?.trim() || REASON_LABEL[request.reason],
      },
      userId,
      userAgent: null,
      ipHash: null,
      extraMetadata: {
        questionId,
        questionCode: found.question.questionCode,
        reason: request.reason,
        context: request.context ?? null,
        attemptContext,
      },
    });

    const flagThreshold = this.config.get('quiz', { infer: true }).reportFlagThreshold;
    await this.questions.incrementReportCount(questionId, flagThreshold);

    return { referenceCode: result.referenceCode };
  }
}
