import type { ExplainerCategorySeed, ExplainerSeed } from './explainer-types';

/**
 * MMA's explainer taxonomy.
 *
 * The brief lists 31 categories end to end, from "Start Here" through
 * "Advanced MMA Concepts", roughly 450 individual concepts. All 31 categories
 * are seeded here so the library's navigation and structure are visible from
 * the first release; only the first three (Start Here, Ways to Win, Scoring)
 * carry written content in this phase (`mma-explainers.ts`). The remaining 28
 * carry no `MMA_EXPLAINER_TOPICS` rows yet and simply render empty until a
 * later phase writes them, the same way golf's below-the-fold categories
 * existed before their content did.
 *
 * Category slugs and grouping follow the brief's own category numbers and
 * titles, condensed to a URL-friendly slug and a short nav label.
 */
export const MMA_EXPLAINER_CATEGORIES: ExplainerCategorySeed[] = [
  {
    slug: 'start-here',
    name: 'Start Here',
    shortName: 'Basics',
    description: 'MMA from zero: how a fight works, how it is won, and how the sport is organised.',
    order: 10,
  },
  {
    slug: 'ways-to-win',
    name: 'Ways to Win',
    shortName: 'Results',
    description: 'Every way an MMA fight can end, from knockout to no contest.',
    order: 20,
  },
  {
    slug: 'scoring',
    name: 'MMA Scoring',
    shortName: 'Scoring',
    description: 'How judges score a round, and why decisions are so often disputed.',
    order: 30,
  },
  {
    slug: 'striking-basics',
    name: 'Striking Basics',
    shortName: 'Strikes',
    description: 'The individual punches, kicks, knees and elbows fighters use.',
    order: 40,
  },
  {
    slug: 'striking-concepts',
    name: 'Striking Concepts',
    shortName: 'Striking IQ',
    description: 'Distance, footwork, feints and the tactical layer above individual strikes.',
    order: 50,
  },
  {
    slug: 'wrestling',
    name: 'Wrestling',
    shortName: 'Wrestling',
    description:
      'Takedowns, takedown defence and the wrestling exchanges that decide where a fight is fought.',
    order: 60,
  },
  {
    slug: 'clinch',
    name: 'Clinch',
    shortName: 'Clinch',
    description:
      'Close-range standing control: ties, underhooks, dirty boxing and clinch striking.',
    order: 70,
  },
  {
    slug: 'ground-positions',
    name: 'Ground Positions',
    shortName: 'Positions',
    description: 'Guard, mount, back control and every position a fight can be won or lost from.',
    order: 80,
  },
  {
    slug: 'submissions',
    name: 'Submissions',
    shortName: 'Submissions',
    description:
      'Chokes and joint locks, what they look like, and how fighters recognise and defend them.',
    order: 90,
  },
  {
    slug: 'bjj-in-mma',
    name: 'Brazilian Jiu-Jitsu in MMA',
    shortName: 'BJJ',
    description: 'How sport BJJ concepts translate, and where they change, inside an MMA fight.',
    order: 100,
  },
  {
    slug: 'ground-and-pound',
    name: 'Ground-and-Pound',
    shortName: 'Ground-and-Pound',
    description: 'Striking from a dominant ground position, and how fighters escape it.',
    order: 110,
  },
  {
    slug: 'cage-wrestling',
    name: 'Cage Wrestling',
    shortName: 'Cage Wrestling',
    description:
      'How fighters use the fence itself to control a fight, escape, and get back to the feet.',
    order: 120,
  },
  {
    slug: 'defense',
    name: 'Defense',
    shortName: 'Defense',
    description:
      'Blocking, parrying, sprawling and scrambling: the skills that stop a fight going wrong.',
    order: 130,
  },
  {
    slug: 'fight-strategy',
    name: 'Fight Strategy',
    shortName: 'Strategy',
    description:
      'Game plans, matchup-specific tactics, and how a fighter manages a five-round fight.',
    order: 140,
  },
  {
    slug: 'style-matchups',
    name: 'Style Matchups',
    shortName: 'Matchups',
    description:
      'How different fighting styles interact, and why "styles make fights" is not just a cliché.',
    order: 150,
  },
  {
    slug: 'weight-classes',
    name: 'Weight Classes',
    shortName: 'Weight Classes',
    description:
      'Why divisions exist, how fighters move between them, and what makes heavyweight different.',
    order: 160,
  },
  {
    slug: 'weight-cutting',
    name: 'Weight Cutting',
    shortName: 'Weight Cutting',
    description:
      'Why fighters cut weight, how weigh-ins work, and what happens when a fighter misses weight.',
    order: 170,
  },
  {
    slug: 'championships',
    name: 'Championships',
    shortName: 'Titles',
    description:
      'Title fights, interim champions, vacant belts and the vocabulary around a division’s title.',
    order: 180,
  },
  {
    slug: 'rankings',
    name: 'Rankings',
    shortName: 'Rankings',
    description:
      'What a promotion’s rankings mean, how they are built, and what they do not decide.',
    order: 190,
  },
  {
    slug: 'matchmaking',
    name: 'Matchmaking',
    shortName: 'Matchmaking',
    description:
      'How promotions build individual fights, from title eliminators to short-notice replacements.',
    order: 200,
  },
  {
    slug: 'mma-events',
    name: 'MMA Events',
    shortName: 'Events',
    description: 'How a fight card is built, from early prelims to the main event.',
    order: 210,
  },
  {
    slug: 'ufc',
    name: 'UFC',
    shortName: 'UFC',
    description:
      'The UFC’s own structure: divisions, rankings, bonuses and its developmental pipeline.',
    order: 220,
  },
  {
    slug: 'other-promotions',
    name: 'Other Promotions',
    shortName: 'Promotions',
    description:
      'PFL, ONE Championship, Rizin and the regional scenes that make up the rest of MMA.',
    order: 230,
  },
  {
    slug: 'fighter-records',
    name: 'Fighter Records & Stats',
    shortName: 'Records',
    description: 'How a fight record is read, and the individual statistics behind it.',
    order: 240,
  },
  {
    slug: 'mma-analytics',
    name: 'MMA Analytics',
    shortName: 'Analytics',
    description:
      'Reading MMA statistics properly: rates, differentials, and what official numbers do not capture.',
    order: 250,
  },
  {
    slug: 'officiating',
    name: 'Referees & Officiating',
    shortName: 'Officiating',
    description: 'What a referee is actually watching for, and when a fight gets stopped.',
    order: 260,
  },
  {
    slug: 'fouls',
    name: 'Fouls',
    shortName: 'Fouls',
    description:
      'Illegal techniques, how they are penalised, and why the rules differ by promotion.',
    order: 270,
  },
  {
    slug: 'corners-and-coaching',
    name: 'Corners & Coaching',
    shortName: 'Corners',
    description: 'Who works a fighter’s corner, and what actually happens between rounds.',
    order: 280,
  },
  {
    slug: 'career-path',
    name: 'MMA Career Path',
    shortName: 'Career Path',
    description: 'How a fighter turns professional and works toward a ranking and a title shot.',
    order: 290,
  },
  {
    slug: 'terminology',
    name: 'MMA Terminology',
    shortName: 'Glossary',
    description: 'A searchable A–Z glossary of MMA terms.',
    order: 300,
  },
  {
    slug: 'advanced-concepts',
    name: 'Advanced MMA Concepts',
    shortName: 'Advanced',
    description:
      'Chain wrestling, scramble analysis and the layered skills advanced fans watch for.',
    order: 310,
  },
];

/**
 * Draft placeholder topics.
 *
 * Consolidates the brief's category-1-through-3 lists (14 + 17 + 17 = 48
 * intended concepts) into the reader-facing set actually written in
 * `mma-explainers.ts`, following golf's rule: never duplicate a concept as
 * two rows, use `alsoIn` for cross-listing instead. A handful of the brief's
 * titles collapse into one page (e.g. "Majority Decision" and "Draw
 * Explained" both live inside the decision-types explainer's scope rather
 * than each earning a separate stub) where the brief's own list is really
 * describing facets of one concept rather than 48 independent pages; the
 * written explainers below note where this happens.
 *
 * Categories 4 through 31 have no topic rows yet; they are seeded (§
 * `MMA_EXPLAINER_CATEGORIES` above) but carry no concepts until a later
 * phase.
 */
export const MMA_EXPLAINER_TOPICS: ExplainerSeed[] = [
  // ── Start Here ─────────────────────────────────────────────────────────────
  {
    slug: 'mma-in-5-minutes',
    title: 'MMA in 5 Minutes',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
  },
  {
    slug: 'how-mma-works',
    title: 'How MMA Works',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
  },
  {
    slug: 'how-do-you-win-an-mma-fight',
    title: 'How Do You Win an MMA Fight?',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['ways-to-win'],
  },
  {
    slug: 'mma-rules-explained',
    title: 'MMA Rules Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'start-here',
  },
  {
    slug: 'mma-vs-ufc',
    title: 'MMA vs UFC',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['ufc'],
  },
  {
    slug: 'how-an-mma-event-works',
    title: 'How an MMA Event Works',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['mma-events'],
  },
  {
    slug: 'mma-weight-classes-explained',
    title: 'MMA Weight Classes Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['weight-classes'],
  },
  {
    slug: 'mma-positions-explained',
    title: 'MMA Positions Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['ground-positions'],
  },
  {
    slug: 'striking-vs-grappling',
    title: 'Striking vs Grappling',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
  },
  {
    slug: 'how-mma-scoring-works',
    title: 'How MMA Scoring Works',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['scoring'],
  },
  {
    slug: 'what-is-a-fight-camp',
    title: 'What Is a Fight Camp?',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['corners-and-coaching'],
  },
  {
    slug: 'mma-fighter-records-explained',
    title: 'MMA Fighter Records Explained',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['fighter-records'],
  },
  {
    slug: 'how-mma-championships-work',
    title: 'How MMA Championships Work',
    type: 'standard',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['championships'],
  },
  {
    slug: 'ufc-vs-pfl-vs-one-championship',
    title: 'UFC vs PFL vs ONE Championship',
    type: 'promotion',
    difficulty: 'beginner',
    category: 'start-here',
    alsoIn: ['other-promotions'],
  },

  // ── Ways to Win ──────────────────────────────────────────────────────────────
  {
    slug: 'knockout-explained',
    title: 'Knockout Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'ko-vs-tko',
    title: 'KO vs TKO',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'submission-explained',
    title: 'Submission Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
    alsoIn: ['submissions'],
  },
  {
    slug: 'technical-submission',
    title: 'Technical Submission',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'ways-to-win',
  },
  {
    slug: 'decision-explained',
    title: 'Decision Explained',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
    alsoIn: ['scoring'],
  },
  {
    slug: 'unanimous-decision',
    title: 'Unanimous Decision',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'split-decision',
    title: 'Split Decision',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'majority-decision',
    title: 'Majority Decision',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'ways-to-win',
  },
  {
    slug: 'draw-explained',
    title: 'Draw Explained',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'ways-to-win',
  },
  {
    slug: 'doctor-stoppage',
    title: 'Doctor Stoppage',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'corner-stoppage',
    title: 'Corner Stoppage',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'referee-stoppage',
    title: 'Referee Stoppage',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
  },
  {
    slug: 'disqualification',
    title: 'Disqualification',
    type: 'fight_result',
    difficulty: 'beginner',
    category: 'ways-to-win',
    alsoIn: ['fouls'],
  },
  {
    slug: 'no-contest',
    title: 'No Contest',
    type: 'fight_result',
    difficulty: 'intermediate',
    category: 'ways-to-win',
    alsoIn: ['fouls'],
  },
  {
    slug: 'technical-decision',
    title: 'Technical Decision',
    type: 'fight_result',
    difficulty: 'advanced',
    category: 'ways-to-win',
  },

  // ── MMA Scoring ──────────────────────────────────────────────────────────────
  {
    slug: 'ten-point-must-system-explained',
    title: '10-Point Must System Explained',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring',
  },
  {
    slug: 'what-is-a-10-9-round',
    title: 'What Is a 10–9 Round?',
    type: 'ruleset_concept',
    difficulty: 'beginner',
    category: 'scoring',
  },
  {
    slug: 'what-is-a-10-8-round',
    title: 'What Is a 10–8 Round?',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'can-an-mma-round-be-10-7',
    title: 'Can an MMA Round Be 10–7?',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'scoring',
  },
  {
    slug: 'effective-striking-explained',
    title: 'Effective Striking Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'effective-grappling-explained',
    title: 'Effective Grappling Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'aggression-in-mma-scoring',
    title: 'Aggression in MMA Scoring',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'fighting-area-control-explained',
    title: 'Fighting Area Control Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'damage-vs-control',
    title: 'Damage vs Control',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'scoring',
  },
  {
    slug: 'do-takedowns-automatically-win-rounds',
    title: 'Do Takedowns Automatically Win Rounds?',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'does-control-time-win-rounds',
    title: 'Does Control Time Win Rounds?',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'how-judges-score-close-rounds',
    title: 'How Judges Score Close Rounds',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'scoring',
  },
  {
    slug: 'why-mma-decisions-are-controversial',
    title: 'Why MMA Decisions Are Controversial',
    type: 'ruleset_concept',
    difficulty: 'advanced',
    category: 'scoring',
  },
  {
    slug: 'how-three-judges-score-a-fight',
    title: 'How Three Judges Score a Fight',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
  {
    slug: 'how-a-split-decision-happens',
    title: 'How a Split Decision Happens',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
    alsoIn: ['ways-to-win'],
  },
  {
    slug: 'how-a-draw-happens',
    title: 'How a Draw Happens',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
    alsoIn: ['ways-to-win'],
  },
  {
    slug: 'mma-judging-scorecards-explained',
    title: 'MMA Judging Scorecards Explained',
    type: 'ruleset_concept',
    difficulty: 'intermediate',
    category: 'scoring',
  },
];
