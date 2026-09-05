import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../../config';
import { ContactService } from '../contact/contact.service';
import { QuestionsRepository } from '../questions/questions.repository';
import { QuizAttemptsRepository } from '../quiz-attempts/quiz-attempts.repository';
import { QuestionReportsService } from './question-reports.service';

describe('QuestionReportsService', () => {
  let contact: ContactService;
  let questions: QuestionsRepository;
  let attempts: QuizAttemptsRepository;
  let config: ConfigService<AppConfig, true>;
  let service: QuestionReportsService;

  beforeEach(() => {
    contact = {
      submit: vi
        .fn()
        .mockResolvedValue({ referenceCode: 'SBH-QUZ-ABCD1234', email: 'user@example.com' }),
    } as unknown as ContactService;

    questions = {
      findById: vi.fn().mockResolvedValue({
        question: { id: 'question-1', questionCode: 'SBQ-FB-000001' },
        options: [],
      }),
      incrementReportCount: vi.fn().mockResolvedValue(1),
    } as unknown as QuestionsRepository;

    attempts = {
      findByPublicCode: vi.fn().mockResolvedValue(undefined),
      findAttemptQuestion: vi.fn().mockResolvedValue(undefined),
    } as unknown as QuizAttemptsRepository;

    config = {
      get: vi.fn().mockReturnValue({ reportFlagThreshold: 5 }),
    } as unknown as ConfigService<AppConfig, true>;

    service = new QuestionReportsService(contact, questions, attempts, config);
  });

  it('submits a report through the contact pipeline as quiz_issue', async () => {
    const result = await service.report('question-1', 'user-1', null, null, {
      reason: 'incorrect_answer',
    });
    expect(contact.submit).toHaveBeenCalledWith(
      expect.objectContaining({ request: expect.objectContaining({ category: 'quiz_issue' }) }),
    );
    expect(result.referenceCode).toBe('SBH-QUZ-ABCD1234');
  });

  it('increments the question report count', async () => {
    await service.report('question-1', 'user-1', null, null, { reason: 'incorrect_answer' });
    expect(questions.incrementReportCount).toHaveBeenCalledWith('question-1', 5);
  });

  it('requires details when reason is "other"', async () => {
    await expect(
      service.report('question-1', 'user-1', null, null, { reason: 'other' }),
    ).rejects.toThrow();
  });

  it('accepts "other" with details', async () => {
    const result = await service.report('question-1', 'user-1', null, null, {
      reason: 'other',
      details: 'Something else entirely.',
    });
    expect(result.referenceCode).toBe('SBH-QUZ-ABCD1234');
  });

  it('rejects a report for a question that does not exist', async () => {
    questions.findById = vi.fn().mockResolvedValue(undefined);
    await expect(
      service.report('missing-question', 'user-1', null, null, { reason: 'incorrect_answer' }),
    ).rejects.toThrow();
  });

  it('degrades gracefully when attempt context does not match', async () => {
    const result = await service.report('question-1', 'user-1', null, null, {
      reason: 'incorrect_answer',
      quizAttemptPublicCode: 'QZ-DOESNOTEXIST',
      attemptQuestionId: '11111111-1111-1111-1111-111111111111',
    });
    expect(result.referenceCode).toBe('SBH-QUZ-ABCD1234');
  });
});
