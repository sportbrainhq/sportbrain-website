/**
 * Display-only mirror of the API's `QUIZ_*` question-count defaults (see
 * `apps/api/src/config/env.schema.ts`). These numbers only drive what the
 * mode cards *say* — the actual question count for a given attempt is
 * whatever `QuizGenerationService` returns, and the UI renders that
 * (`attempt.actualQuestionCount`), never this constant, once an attempt
 * exists. If the API's env vars are ever overridden in an environment, this
 * copy will say something slightly different from what a quiz actually
 * contains until it's updated to match — an acceptable drift for card copy,
 * not for anything that gates or grades an attempt.
 */
export const SPORT_QUIZ_MODES = [
  { mode: 'QUICK' as const, questionCount: 5, minutes: 2 },
  { mode: 'STANDARD' as const, questionCount: 10, minutes: 5 },
  { mode: 'CHALLENGE' as const, questionCount: 20, minutes: 10 },
];

export const MASTER_QUIZ_MODES = [
  { mode: 'QUICK' as const, questionCount: 10, minutes: 4 },
  { mode: 'STANDARD' as const, questionCount: 20, minutes: 8 },
  { mode: 'MARATHON' as const, questionCount: 50, minutes: 20 },
];
