import type { achievementDefinition } from '../../database/schema';

type SeedRow = typeof achievementDefinition.$inferInsert;

/**
 * The initial achievement set (Part 26). Deliberately restrained — ~20
 * achievements, not hundreds of meaningless ones (Part 24). `code` is the
 * immutable identity (Part 73): once any of these has been earned by a real
 * user, treat its `criteriaType`/`criteriaConfig` as append-only — ship a
 * new code rather than reinterpret one that already means something to
 * someone's Passport.
 *
 * `sportSlug`-scoped achievements (`FOOTBALL_BRAIN`, `CRICKET_BRAIN`, ...)
 * are generated for whichever sports are actually launched, via
 * `buildSportAchievements` below, rather than hand-listed — a newly launched
 * sport gets its achievement automatically without a migration.
 */
export const ACHIEVEMENT_DEFINITIONS: SeedRow[] = [
  {
    code: 'FIRST_WHISTLE',
    name: 'First Whistle',
    description: 'Complete your first quiz.',
    category: 'QUIZ',
    tier: null,
    iconKey: 'whistle',
    criteriaType: 'QUIZZES_COMPLETED_TOTAL',
    criteriaConfig: { threshold: 1 },
    displayOrder: 10,
  },
  {
    code: 'PERFECT_SCORE',
    name: 'Perfect Score',
    description: 'Score 100% on a quiz of at least 10 questions.',
    category: 'QUIZ',
    tier: null,
    iconKey: 'perfect',
    criteriaType: 'PERFECT_SCORE',
    criteriaConfig: { minQuestions: 10 },
    displayOrder: 20,
  },
  {
    code: 'QUESTION_MACHINE_BRONZE',
    name: 'Question Machine — Bronze',
    description: 'Answer 100 questions.',
    category: 'QUIZ',
    tier: 'BRONZE',
    iconKey: 'question-machine',
    criteriaType: 'QUESTIONS_ANSWERED_TOTAL',
    criteriaConfig: { threshold: 100 },
    displayOrder: 30,
  },
  {
    code: 'QUESTION_MACHINE_SILVER',
    name: 'Question Machine — Silver',
    description: 'Answer 500 questions.',
    category: 'QUIZ',
    tier: 'SILVER',
    iconKey: 'question-machine',
    criteriaType: 'QUESTIONS_ANSWERED_TOTAL',
    criteriaConfig: { threshold: 500 },
    displayOrder: 31,
  },
  {
    code: 'QUESTION_MACHINE_GOLD',
    name: 'Question Machine — Gold',
    description: 'Answer 1,000 questions.',
    category: 'QUIZ',
    tier: 'GOLD',
    iconKey: 'question-machine',
    criteriaType: 'QUESTIONS_ANSWERED_TOTAL',
    criteriaConfig: { threshold: 1000 },
    displayOrder: 32,
  },
  {
    code: 'QUESTION_MACHINE_ELITE',
    name: 'Question Machine — Elite',
    description: 'Answer 5,000 questions.',
    category: 'QUIZ',
    tier: 'ELITE',
    iconKey: 'question-machine',
    criteriaType: 'QUESTIONS_ANSWERED_TOTAL',
    criteriaConfig: { threshold: 5000 },
    displayOrder: 33,
  },
  {
    code: 'ALL_ROUNDER',
    name: 'All-Rounder',
    description: 'Complete quizzes across 5 different sports.',
    category: 'BREADTH',
    tier: null,
    iconKey: 'all-rounder',
    criteriaType: 'SPORTS_EXPLORED_COUNT',
    criteriaConfig: { threshold: 5 },
    displayOrder: 40,
  },
  {
    code: 'SPORTS_POLYMATH',
    name: 'Sports Polymath',
    description: 'Establish a knowledge level in 8 sports.',
    category: 'BREADTH',
    tier: null,
    iconKey: 'polymath',
    criteriaType: 'SPORTS_WITH_LEVEL_COUNT',
    criteriaConfig: { threshold: 8 },
    displayOrder: 41,
  },
  {
    code: 'MASTER_MIND',
    name: 'Master Mind',
    description: 'Score at least 80% on a Master Quiz of 20 or more questions.',
    category: 'MASTERY',
    tier: null,
    iconKey: 'master-mind',
    criteriaType: 'MASTER_QUIZ_SCORE',
    criteriaConfig: { minQuestions: 20, minPercentage: 80 },
    displayOrder: 50,
  },
  {
    code: 'SPECIALIST',
    name: 'Specialist',
    description: 'Reach ADVANCED level in one category with a sufficient sample.',
    category: 'KNOWLEDGE',
    tier: null,
    iconKey: 'specialist',
    criteriaType: 'CATEGORY_LEVEL_REACHED',
    criteriaConfig: { level: 'ADVANCED' },
    displayOrder: 60,
  },
  {
    code: 'EXPERT_TERRITORY',
    name: 'Expert Territory',
    description: 'Reach EXPERT level in any sport.',
    category: 'MASTERY',
    tier: null,
    iconKey: 'expert',
    criteriaType: 'SPORT_LEVEL_REACHED',
    criteriaConfig: { level: 'EXPERT' },
    displayOrder: 70,
  },
  {
    code: 'HARD_MODE',
    name: 'Hard Mode',
    description: 'Answer 50 HARD or EXPERT questions correctly.',
    category: 'KNOWLEDGE',
    tier: null,
    iconKey: 'hard-mode',
    criteriaType: 'HARD_EXPERT_CORRECT_COUNT',
    criteriaConfig: { threshold: 50 },
    displayOrder: 80,
  },
  {
    code: 'CONSISTENT',
    name: 'Consistent',
    description: 'Maintain a 4-week SportBrain streak.',
    category: 'STREAK',
    tier: null,
    iconKey: 'consistent',
    criteriaType: 'WEEKLY_STREAK_REACHED',
    criteriaConfig: { threshold: 4 },
    displayOrder: 90,
  },
  {
    code: 'SEASONED',
    name: 'Seasoned',
    description: 'Maintain a 12-week SportBrain streak.',
    category: 'STREAK',
    tier: null,
    iconKey: 'seasoned',
    criteriaType: 'WEEKLY_STREAK_REACHED',
    criteriaConfig: { threshold: 12 },
    displayOrder: 91,
  },
];

/** Generates one `<SPORT>_BRAIN` achievement per launched sport (Part 26). */
export function buildSportAchievements(sports: { slug: string; name: string }[]): SeedRow[] {
  return sports.map((s, index) => ({
    code: `SPORT_BRAIN_${s.slug.toUpperCase().replace(/-/g, '_')}`,
    name: `${s.name} Brain`,
    description: `Reach ADVANCED knowledge level in ${s.name}.`,
    category: 'SPORT' as const,
    tier: null,
    iconKey: 'sport-brain',
    criteriaType: 'SPORT_LEVEL_REACHED',
    criteriaConfig: { level: 'ADVANCED', sportSlug: s.slug },
    displayOrder: 100 + index,
  }));
}
