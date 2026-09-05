import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { QuizAttempt } from '@sportbrain/contracts';
import { QuizResult } from './quiz-result';

function buildAttempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    id: 'attempt-1',
    publicCode: 'QZ-ABCDEF',
    quizType: 'SPORT',
    sportId: 'sport-1',
    mode: 'STANDARD',
    status: 'COMPLETED',
    requestedQuestionCount: 2,
    actualQuestionCount: 2,
    correctCount: 1,
    incorrectCount: 1,
    scorePercentage: 50,
    startedAt: '2026-01-01T00:00:00.000Z',
    lastActivityAt: '2026-01-01T00:05:00.000Z',
    completedAt: '2026-01-01T00:05:00.000Z',
    abandonedAt: null,
    durationSeconds: 300,
    questions: [
      {
        id: 'aq-1',
        questionId: 'q-1',
        position: 1,
        questionText: 'Who won the 2022 FIFA World Cup?',
        options: [
          { optionCode: 'A', optionText: 'Argentina', displayOrder: 0 },
          { optionCode: 'B', optionText: 'France', displayOrder: 1 },
        ],
        category: 'WORLD_CUP',
        difficulty: 'EASY',
        selectedOptionCode: 'A',
        isCorrect: true,
        correctOptionCode: 'A',
        explanation: 'Argentina won on penalties.',
      },
      {
        id: 'aq-2',
        questionId: 'q-2',
        position: 2,
        questionText: 'Which country has hosted the most World Cups?',
        options: [
          { optionCode: 'A', optionText: 'Brazil', displayOrder: 0 },
          { optionCode: 'B', optionText: 'Mexico', displayOrder: 1 },
        ],
        category: 'HISTORY',
        difficulty: 'MEDIUM',
        selectedOptionCode: 'A',
        isCorrect: false,
        correctOptionCode: 'B',
        explanation: 'Mexico has hosted three World Cups.',
      },
    ],
    ...overrides,
  };
}

describe('QuizResult', () => {
  it('renders the score and accuracy', () => {
    render(<QuizResult attempt={buildAttempt()} />);
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it('shows the correct answer only for questions answered incorrectly', () => {
    render(<QuizResult attempt={buildAttempt()} />);
    // The incorrect question's correct answer should be visible.
    expect(screen.getByText('Mexico')).toBeInTheDocument();
  });

  it('never labels correctness by color alone: explicit text markers are present', () => {
    render(<QuizResult attempt={buildAttempt()} />);
    expect(screen.getAllByText('✓ Correct').length).toBeGreaterThan(0);
    expect(screen.getAllByText('✕ Incorrect').length).toBeGreaterThan(0);
  });

  it('renders a Report Question control for every reviewed question', () => {
    render(<QuizResult attempt={buildAttempt()} />);
    expect(screen.getAllByText('Report Question')).toHaveLength(2);
  });

  it('shows an unexaggerated result label rather than gamified copy', () => {
    render(
      <QuizResult
        attempt={buildAttempt({ scorePercentage: 95, correctCount: 19, actualQuestionCount: 20 })}
      />,
    );
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    expect(screen.queryByText(/level up/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/achievement/i)).not.toBeInTheDocument();
  });
});
