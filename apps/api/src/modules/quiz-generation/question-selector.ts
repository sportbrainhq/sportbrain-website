import type { QuestionDifficulty } from '@sportbrain/contracts';
import type { EligibleQuestionRow } from './eligible-questions.repository';
import type { QuestionExposureRow } from './question-exposure.repository';

/**
 * The pure selection algorithm behind both sport and master quiz generation
 * (Part 24, 26-28). Kept free of any database/NestJS dependency so the
 * unseen-first / cooldown / difficulty-distribution logic can be unit
 * tested against plain arrays, and so `MasterQuizGenerator` can call it once
 * per sport when assembling a breadth-aware attempt.
 */

export interface SelectionConfig {
  correctCooldownDays: number;
  incorrectCooldownDays: number;
  difficultyWeights: Record<QuestionDifficulty, number>;
}

/**
 * Ranks a sport's eligible questions for one user by the Part 27 priority
 * order — unseen first, then previously-incorrect-with-expired-cooldown,
 * then oldest-seen-with-expired-cooldown — and returns up to `count` of
 * them, respecting the target difficulty distribution on a best-effort
 * basis (Part 24: "do not fail if exact distribution cannot be achieved").
 *
 * `now` is a parameter (not `new Date()` inline) so cooldown math is
 * deterministic under test.
 */
export function selectQuestions(
  eligible: EligibleQuestionRow[],
  exposures: QuestionExposureRow[],
  count: number,
  config: SelectionConfig,
  now: Date,
): EligibleQuestionRow[] {
  if (count <= 0 || eligible.length === 0) return [];

  const exposureByQuestion = new Map(exposures.map((exposure) => [exposure.questionId, exposure]));
  const correctCooldownMs = config.correctCooldownDays * 24 * 60 * 60 * 1000;
  const incorrectCooldownMs = config.incorrectCooldownDays * 24 * 60 * 60 * 1000;

  const unseen: EligibleQuestionRow[] = [];
  const incorrectRepeatable: { question: EligibleQuestionRow; lastSeenAt: Date }[] = [];
  const seenRepeatable: { question: EligibleQuestionRow; lastSeenAt: Date }[] = [];

  for (const candidate of eligible) {
    const exposure = exposureByQuestion.get(candidate.id);
    if (!exposure) {
      unseen.push(candidate);
      continue;
    }
    const elapsedMs = now.getTime() - exposure.lastSeenAt.getTime();
    const wasIncorrect = exposure.lastAnsweredCorrectly === false;
    const cooldownMs = wasIncorrect ? incorrectCooldownMs : correctCooldownMs;
    if (elapsedMs < cooldownMs) continue; // still cooling down, not eligible to repeat yet
    (wasIncorrect ? incorrectRepeatable : seenRepeatable).push({
      question: candidate,
      lastSeenAt: exposure.lastSeenAt,
    });
  }

  // Within each repeatable tier, oldest-seen first (Part 27's "oldest
  // previously seen questions" wording, applied to both sub-tiers).
  incorrectRepeatable.sort((a, b) => a.lastSeenAt.getTime() - b.lastSeenAt.getTime());
  seenRepeatable.sort((a, b) => a.lastSeenAt.getTime() - b.lastSeenAt.getTime());

  const priorityOrdered = [
    ...unseen,
    ...incorrectRepeatable.map((entry) => entry.question),
    ...seenRepeatable.map((entry) => entry.question),
  ];

  return selectWithDifficultyTarget(priorityOrdered, count, config.difficultyWeights);
}

/**
 * Greedily fills the requested count from a priority-ordered pool, biasing
 * toward the target difficulty mix without ever failing when the exact mix
 * isn't available (Part 24). Algorithm: walk the priority order once,
 * tracking how many of each difficulty have been taken; accept a candidate
 * if its difficulty is still under its target share, otherwise defer it to
 * a second pass that fills remaining slots regardless of difficulty. This
 * keeps priority order (unseen-first) as the dominant signal and difficulty
 * balance as a secondary, best-effort one — never the reverse.
 */
function selectWithDifficultyTarget(
  priorityOrdered: EligibleQuestionRow[],
  count: number,
  difficultyWeights: Record<QuestionDifficulty, number>,
): EligibleQuestionRow[] {
  const targetByDifficulty: Record<QuestionDifficulty, number> = {
    EASY: Math.round(count * difficultyWeights.EASY),
    MEDIUM: Math.round(count * difficultyWeights.MEDIUM),
    HARD: Math.round(count * difficultyWeights.HARD),
    EXPERT: Math.round(count * difficultyWeights.EXPERT),
  };

  const taken: EligibleQuestionRow[] = [];
  const takenByDifficulty: Record<QuestionDifficulty, number> = {
    EASY: 0,
    MEDIUM: 0,
    HARD: 0,
    EXPERT: 0,
  };
  const deferred: EligibleQuestionRow[] = [];

  for (const candidate of priorityOrdered) {
    if (taken.length >= count) break;
    const withinTarget =
      takenByDifficulty[candidate.difficulty] < targetByDifficulty[candidate.difficulty];
    if (withinTarget) {
      taken.push(candidate);
      takenByDifficulty[candidate.difficulty] += 1;
    } else {
      deferred.push(candidate);
    }
  }

  for (const candidate of deferred) {
    if (taken.length >= count) break;
    taken.push(candidate);
  }

  return taken;
}
