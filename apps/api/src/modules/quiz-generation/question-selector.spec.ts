import { describe, expect, it } from 'vitest';
import type { EligibleQuestionRow } from './eligible-questions.repository';
import type { QuestionExposureRow } from './question-exposure.repository';
import { selectQuestions, type SelectionConfig } from './question-selector';

const config: SelectionConfig = {
  correctCooldownDays: 90,
  incorrectCooldownDays: 14,
  difficultyWeights: { EASY: 0.3, MEDIUM: 0.4, HARD: 0.25, EXPERT: 0.05 },
};

function buildQuestion(
  id: string,
  difficulty: EligibleQuestionRow['difficulty'],
): EligibleQuestionRow {
  return { id, difficulty } as EligibleQuestionRow;
}

function buildExposure(
  questionId: string,
  lastSeenAt: Date,
  lastAnsweredCorrectly: boolean | null,
): QuestionExposureRow {
  return { questionId, lastSeenAt, lastAnsweredCorrectly } as QuestionExposureRow;
}

describe('selectQuestions', () => {
  const now = new Date('2026-06-01T00:00:00.000Z');

  it('prefers unseen questions first', () => {
    const seen = buildQuestion('seen', 'EASY');
    const unseen = buildQuestion('unseen', 'EASY');
    const exposures = [buildExposure('seen', new Date('2026-01-01'), true)];

    const result = selectQuestions([seen, unseen], exposures, 1, config, now);

    expect(result).toEqual([unseen]);
  });

  it('excludes a correctly-answered question still within cooldown', () => {
    const question = buildQuestion('q1', 'EASY');
    const exposures = [buildExposure('q1', new Date('2026-05-20'), true)]; // 12 days ago, cooldown is 90

    const result = selectQuestions([question], exposures, 5, config, now);

    expect(result).toEqual([]);
  });

  it('includes a correctly-answered question once its cooldown has expired', () => {
    const question = buildQuestion('q1', 'EASY');
    const exposures = [buildExposure('q1', new Date('2026-01-01'), true)]; // >90 days ago

    const result = selectQuestions([question], exposures, 5, config, now);

    expect(result).toEqual([question]);
  });

  it('lets an incorrectly-answered question repeat sooner than a correct one', () => {
    const question = buildQuestion('q1', 'EASY');
    const exposures = [buildExposure('q1', new Date('2026-05-20'), false)]; // 12 days ago, incorrect cooldown is 14

    const stillCooling = selectQuestions([question], exposures, 5, config, now);
    expect(stillCooling).toEqual([]);

    const pastCooldown = selectQuestions(
      [question],
      [buildExposure('q1', new Date('2026-05-01'), false)], // 31 days ago
      5,
      config,
      now,
    );
    expect(pastCooldown).toEqual([question]);
  });

  it('prioritizes incorrect-repeatable over seen-correct-repeatable', () => {
    const incorrect = buildQuestion('incorrect', 'EASY');
    const correct = buildQuestion('correct', 'EASY');
    const exposures = [
      buildExposure('incorrect', new Date('2026-01-01'), false),
      buildExposure('correct', new Date('2026-01-01'), true),
    ];

    const result = selectQuestions([correct, incorrect], exposures, 1, config, now);

    expect(result).toEqual([incorrect]);
  });

  it('never returns more than the requested count', () => {
    const questions = Array.from({ length: 10 }, (_, i) => buildQuestion(`q${i}`, 'EASY'));
    const result = selectQuestions(questions, [], 3, config, now);
    expect(result).toHaveLength(3);
  });

  it('never returns duplicate ids', () => {
    const questions = Array.from({ length: 10 }, (_, i) => buildQuestion(`q${i}`, 'MEDIUM'));
    const result = selectQuestions(questions, [], 10, config, now);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('returns fewer than requested when inventory is insufficient, without duplicating', () => {
    const questions = [buildQuestion('q1', 'EASY'), buildQuestion('q2', 'EASY')];
    const result = selectQuestions(questions, [], 5, config, now);
    expect(result).toHaveLength(2);
  });

  it('returns an empty array when count is zero or negative', () => {
    const questions = [buildQuestion('q1', 'EASY')];
    expect(selectQuestions(questions, [], 0, config, now)).toEqual([]);
  });
});
