import type { ExplainerCategorySeed, ExplainerSeed } from './explainer-types';

/**
 * The football taxonomy: categories, and every concept we intend to cover.
 *
 * Split from the written content on purpose. This file is the map of the
 * subject, and it is deliberately far larger than what has been written: naming
 * the whole territory up front is what lets duplication control work, because a
 * new explainer can be checked against every concept we plan to cover rather
 * than only against the finished ones.
 *
 * Everything here is a draft placeholder. Nothing in this file reaches the site.
 * The written explainers live in `football-explainers.ts` and override these by
 * slug, which is also why the slugs here have to be right first time.
 *
 * ## On shared concepts
 *
 * Several concepts belong under more than one heading. A penalty kick is both a
 * law and a set piece; gegenpressing is both a pressing mechanism and a playing
 * style; added time is both a law and a matter for the officials. Each is one
 * row with `alsoIn`, never two rows, which is the constraint the schema exists
 * to enforce.
 */

export const FOOTBALL_EXPLAINER_CATEGORIES: ExplainerCategorySeed[] = [
  {
    slug: 'rules-and-laws',
    name: 'Rules & Laws',
    shortName: 'Rules',
    description: 'The laws that govern a match, and what they mean in practice.',
    order: 10,
  },
  {
    slug: 'match-basics',
    name: 'Match Basics',
    shortName: 'Basics',
    description: 'How a game is played, and the actions it is made of.',
    order: 20,
  },
  {
    slug: 'positions-and-roles',
    name: 'Positions & Roles',
    shortName: 'Positions',
    description: 'What players actually do, and how modern roles differ from the old names.',
    order: 30,
  },
  {
    slug: 'formations',
    name: 'Formations',
    description: 'How teams arrange themselves, and what each shape is trying to achieve.',
    order: 40,
  },
  {
    slug: 'attacking-concepts',
    name: 'Attacking Concepts',
    shortName: 'Attack',
    description: 'How teams create space, progress the ball and open a defence.',
    order: 50,
  },
  {
    slug: 'defensive-concepts',
    name: 'Defensive Concepts',
    shortName: 'Defence',
    description: 'How teams deny space, protect the goal and stay organised.',
    order: 60,
  },
  {
    slug: 'pressing-and-transitions',
    name: 'Pressing & Transitions',
    shortName: 'Pressing',
    description: 'What happens in the seconds after possession changes hands.',
    order: 70,
  },
  {
    slug: 'tactics-and-styles',
    name: 'Tactics & Playing Styles',
    shortName: 'Tactics',
    description: 'The recognisable ways teams choose to play.',
    order: 80,
  },
  {
    slug: 'set-pieces',
    name: 'Set Pieces',
    description: 'Corners, free kicks and throw-ins, and how they are attacked and defended.',
    order: 90,
  },
  {
    slug: 'refereeing-and-technology',
    name: 'Refereeing & Technology',
    shortName: 'Officiating',
    description: 'Who makes the decisions, and the technology that now assists them.',
    order: 100,
  },
  {
    slug: 'competition-formats',
    name: 'Competitions & Formats',
    shortName: 'Formats',
    description: 'How leagues, cups and tournaments are structured and decided.',
    order: 110,
  },
  {
    slug: 'statistics-and-analytics',
    name: 'Statistics & Analytics',
    shortName: 'Analytics',
    description: 'What the numbers measure, and what they leave out.',
    order: 120,
  },
  {
    slug: 'terminology',
    name: 'Football Terminology',
    shortName: 'Terms',
    description: 'The vocabulary of the game, defined briefly.',
    order: 130,
  },
];

/**
 * Builds a taxonomy placeholder.
 *
 * A helper rather than two hundred object literals: the placeholders differ only
 * in slug, title, type and difficulty, and spelling out the identical fields
 * each time would bury those four.
 */
function topic(
  slug: string,
  title: string,
  category: string,
  type: ExplainerSeed['type'],
  difficulty: ExplainerSeed['difficulty'],
  extra: Partial<ExplainerSeed> = {},
): ExplainerSeed {
  return { slug, title, category, type, difficulty, ...extra };
}

/**
 * Every football concept the library intends to cover.
 *
 * Ordered by category. Concepts written up in `football-explainers.ts` appear
 * here too, so this list stays the complete inventory; the writing overrides
 * these rows rather than adding to them.
 */
export const FOOTBALL_EXPLAINER_TOPICS: ExplainerSeed[] = [
  // ── Rules & Laws ──────────────────────────────────────────────────────────
  topic('offside', 'Offside', 'rules-and-laws', 'rule', 'beginner'),
  topic('handball', 'Handball', 'rules-and-laws', 'rule', 'beginner'),
  topic('fouls', 'Fouls', 'rules-and-laws', 'rule', 'beginner'),
  topic('direct-free-kick', 'Direct Free Kick', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['set-pieces'],
  }),
  topic('indirect-free-kick', 'Indirect Free Kick', 'rules-and-laws', 'rule', 'intermediate', {
    alsoIn: ['set-pieces'],
  }),
  topic('penalty-kick', 'Penalty Kick', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['set-pieces'],
  }),
  topic('yellow-card', 'Yellow Cards', 'rules-and-laws', 'rule', 'beginner'),
  topic('red-card', 'Red Cards', 'rules-and-laws', 'rule', 'beginner'),
  topic('advantage', 'Advantage', 'rules-and-laws', 'rule', 'intermediate', {
    alsoIn: ['refereeing-and-technology'],
  }),
  topic('throw-in', 'Throw-ins', 'rules-and-laws', 'rule', 'beginner', { alsoIn: ['set-pieces'] }),
  topic('goal-kick', 'Goal Kicks', 'rules-and-laws', 'rule', 'beginner'),
  topic('corner-kick', 'Corner Kicks', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['set-pieces'],
  }),
  topic('kick-off', 'Kick-off', 'rules-and-laws', 'rule', 'beginner'),
  topic('dropped-ball', 'Dropped Ball', 'rules-and-laws', 'rule', 'intermediate'),
  topic('substitutions', 'Substitutions', 'rules-and-laws', 'rule', 'beginner'),
  topic('added-time', 'Added Time', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['refereeing-and-technology'],
    aliases: ['Stoppage Time', 'Injury Time'],
  }),
  topic('extra-time', 'Extra Time', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['competition-formats'],
  }),
  topic('penalty-shootout', 'Penalty Shootouts', 'rules-and-laws', 'rule', 'beginner', {
    alsoIn: ['competition-formats', 'set-pieces'],
  }),
  topic('ball-in-and-out-of-play', 'Ball In and Out of Play', 'rules-and-laws', 'rule', 'beginner'),
  topic('goal-scoring-rules', 'Goal Scoring Rules', 'rules-and-laws', 'rule', 'beginner'),

  // ── Match Basics ──────────────────────────────────────────────────────────
  topic('how-a-match-works', 'How a Football Match Works', 'match-basics', 'standard', 'beginner'),
  topic('football-pitch', 'The Football Pitch', 'match-basics', 'standard', 'beginner'),
  topic('goals', 'Goals', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('possession', 'Possession', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('passing', 'Passing', 'match-basics', 'standard', 'beginner'),
  topic('shooting', 'Shooting', 'match-basics', 'standard', 'beginner'),
  topic('tackling', 'Tackling', 'match-basics', 'standard', 'beginner'),
  topic('dribbling', 'Dribbling', 'match-basics', 'standard', 'beginner'),
  topic('crossing', 'Crossing', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['attacking-concepts'],
  }),
  topic('heading', 'Heading', 'match-basics', 'standard', 'beginner'),
  topic('first-touch', 'First Touch', 'match-basics', 'standard', 'beginner'),
  topic('marking', 'Marking', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['defensive-concepts'],
  }),
  topic('interceptions', 'Interceptions', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['defensive-concepts', 'statistics-and-analytics'],
  }),
  topic('duels', 'Duels', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('second-balls', 'Second Balls', 'match-basics', 'standard', 'intermediate'),

  // ── Positions & Roles ─────────────────────────────────────────────────────
  topic('goalkeeper', 'Goalkeeper', 'positions-and-roles', 'position_role', 'beginner', {
    aliases: ['GK', 'Keeper'],
  }),
  topic('centre-back', 'Centre-back', 'positions-and-roles', 'position_role', 'beginner', {
    aliases: ['Center Back', 'CB', 'Central Defender'],
  }),
  topic('full-back', 'Full-back', 'positions-and-roles', 'position_role', 'beginner', {
    aliases: ['Fullback', 'Right Back', 'Left Back'],
  }),
  topic(
    'central-midfielder',
    'Central Midfielder',
    'positions-and-roles',
    'position_role',
    'beginner',
    { aliases: ['CM'] },
  ),
  topic('winger', 'Winger', 'positions-and-roles', 'position_role', 'beginner'),
  topic('striker', 'Striker', 'positions-and-roles', 'position_role', 'beginner', {
    aliases: ['Centre Forward', 'CF', 'Number 9'],
  }),
  topic('sweeper-keeper', 'Sweeper Keeper', 'positions-and-roles', 'position_role', 'intermediate'),
  topic(
    'ball-playing-centre-back',
    'Ball-playing Centre-back',
    'positions-and-roles',
    'position_role',
    'intermediate',
  ),
  topic('libero', 'Libero', 'positions-and-roles', 'position_role', 'advanced', {
    aliases: ['Sweeper'],
  }),
  topic('wing-back', 'Wing-back', 'positions-and-roles', 'position_role', 'intermediate', {
    aliases: ['Wingback', 'WB'],
  }),
  topic(
    'inverted-full-back',
    'Inverted Full-back',
    'positions-and-roles',
    'position_role',
    'advanced',
  ),
  topic(
    'inverted-wing-back',
    'Inverted Wing-back',
    'positions-and-roles',
    'position_role',
    'advanced',
  ),
  topic(
    'defensive-midfielder',
    'Defensive Midfielder',
    'positions-and-roles',
    'position_role',
    'beginner',
    { aliases: ['CDM', 'Number 6', 'DM'] },
  ),
  topic(
    'holding-midfielder',
    'Holding Midfielder',
    'positions-and-roles',
    'position_role',
    'intermediate',
  ),
  topic(
    'deep-lying-playmaker',
    'Deep-lying Playmaker',
    'positions-and-roles',
    'position_role',
    'intermediate',
    { aliases: ['Regista'] },
  ),
  topic(
    'box-to-box-midfielder',
    'Box-to-box Midfielder',
    'positions-and-roles',
    'position_role',
    'beginner',
  ),
  topic('number-8', 'Number 8', 'positions-and-roles', 'position_role', 'intermediate', {
    aliases: ['No. 8', 'Eight'],
  }),
  topic('number-10', 'Number 10', 'positions-and-roles', 'position_role', 'beginner', {
    aliases: ['No. 10', 'Attacking Midfielder', 'Playmaker', 'Trequartista'],
  }),
  topic(
    'wide-midfielder',
    'Wide Midfielder',
    'positions-and-roles',
    'position_role',
    'intermediate',
  ),
  topic('inside-forward', 'Inside Forward', 'positions-and-roles', 'position_role', 'intermediate'),
  topic(
    'inverted-winger',
    'Inverted Winger',
    'positions-and-roles',
    'position_role',
    'intermediate',
  ),
  topic('false-nine', 'False Nine', 'positions-and-roles', 'position_role', 'intermediate', {
    aliases: ['False 9', 'Falso Nueve'],
  }),
  topic('target-man', 'Target Man', 'positions-and-roles', 'position_role', 'beginner'),
  topic('poacher', 'Poacher', 'positions-and-roles', 'position_role', 'beginner'),
  topic('second-striker', 'Second Striker', 'positions-and-roles', 'position_role', 'intermediate'),
  topic(
    'advanced-playmaker',
    'Advanced Playmaker',
    'positions-and-roles',
    'position_role',
    'intermediate',
  ),

  // ── Formations ────────────────────────────────────────────────────────────
  topic('4-4-2', '4-4-2', 'formations', 'formation', 'beginner'),
  topic('4-3-3', '4-3-3', 'formations', 'formation', 'beginner'),
  topic('4-2-3-1', '4-2-3-1', 'formations', 'formation', 'beginner'),
  topic('3-5-2', '3-5-2', 'formations', 'formation', 'intermediate'),
  topic('3-4-3', '3-4-3', 'formations', 'formation', 'intermediate'),
  topic('5-3-2', '5-3-2', 'formations', 'formation', 'intermediate'),
  topic('4-1-4-1', '4-1-4-1', 'formations', 'formation', 'intermediate'),
  topic('4-3-1-2', '4-3-1-2 Diamond', 'formations', 'formation', 'intermediate', {
    aliases: ['Diamond', '4-4-2 Diamond'],
  }),
  topic('4-2-2-2', '4-2-2-2', 'formations', 'formation', 'advanced', { aliases: ['Magic Square'] }),

  // ── Attacking Concepts ────────────────────────────────────────────────────
  topic('build-up-play', 'Build-up Play', 'attacking-concepts', 'tactical_concept', 'beginner'),
  topic(
    'playing-out-from-the-back',
    'Playing Out From The Back',
    'attacking-concepts',
    'tactical_concept',
    'beginner',
  ),
  topic('width', 'Width', 'attacking-concepts', 'tactical_concept', 'beginner'),
  topic('depth', 'Depth', 'attacking-concepts', 'tactical_concept', 'intermediate'),
  topic('overloads', 'Overloads', 'attacking-concepts', 'tactical_concept', 'intermediate'),
  topic(
    'numerical-superiority',
    'Numerical Superiority',
    'attacking-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'positional-superiority',
    'Positional Superiority',
    'attacking-concepts',
    'tactical_concept',
    'advanced',
  ),
  topic(
    'third-man-runs',
    'Third-man Runs',
    'attacking-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'overlapping-runs',
    'Overlapping Runs',
    'attacking-concepts',
    'tactical_concept',
    'beginner',
    { aliases: ['Overlap'] },
  ),
  topic(
    'underlapping-runs',
    'Underlapping Runs',
    'attacking-concepts',
    'tactical_concept',
    'intermediate',
    { aliases: ['Underlap'] },
  ),
  topic('half-space', 'Half-space', 'attacking-concepts', 'tactical_concept', 'intermediate', {
    aliases: ['Half Spaces', 'Halfspace'],
  }),
  topic('through-ball', 'Through Balls', 'attacking-concepts', 'tactical_concept', 'beginner', {
    alsoIn: ['terminology'],
  }),
  topic('cutback', 'Cutbacks', 'attacking-concepts', 'tactical_concept', 'beginner'),
  topic('switching-play', 'Switching Play', 'attacking-concepts', 'tactical_concept', 'beginner'),
  topic('final-third', 'Final Third', 'attacking-concepts', 'tactical_concept', 'beginner'),
  topic(
    'progressive-passing',
    'Progressive Passing',
    'attacking-concepts',
    'tactical_concept',
    'intermediate',
    { alsoIn: ['statistics-and-analytics'] },
  ),
  topic(
    'line-breaking-passes',
    'Line-breaking Passes',
    'attacking-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic('rest-attack', 'Rest Attack', 'attacking-concepts', 'tactical_concept', 'advanced'),

  // ── Defensive Concepts ────────────────────────────────────────────────────
  topic('defensive-line', 'Defensive Line', 'defensive-concepts', 'tactical_concept', 'beginner'),
  topic(
    'high-defensive-line',
    'High Defensive Line',
    'defensive-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic('low-block', 'Low Block', 'defensive-concepts', 'tactical_concept', 'intermediate', {
    alsoIn: ['tactics-and-styles'],
  }),
  topic('mid-block', 'Mid Block', 'defensive-concepts', 'tactical_concept', 'intermediate', {
    alsoIn: ['pressing-and-transitions'],
  }),
  topic('compactness', 'Compactness', 'defensive-concepts', 'tactical_concept', 'intermediate'),
  topic('zonal-marking', 'Zonal Marking', 'defensive-concepts', 'tactical_concept', 'intermediate'),
  topic('man-marking', 'Man Marking', 'defensive-concepts', 'tactical_concept', 'beginner'),
  topic('cover', 'Cover', 'defensive-concepts', 'tactical_concept', 'intermediate'),
  topic('balance', 'Balance', 'defensive-concepts', 'tactical_concept', 'intermediate'),
  topic('defensive-shape', 'Defensive Shape', 'defensive-concepts', 'tactical_concept', 'beginner'),
  topic(
    'tracking-runners',
    'Tracking Runners',
    'defensive-concepts',
    'tactical_concept',
    'beginner',
  ),
  topic('rest-defence', 'Rest Defence', 'defensive-concepts', 'tactical_concept', 'advanced', {
    aliases: ['Rest Defense'],
  }),

  // ── Pressing & Transitions ────────────────────────────────────────────────
  topic('pressing', 'Pressing', 'pressing-and-transitions', 'tactical_concept', 'beginner', {
    alsoIn: ['tactics-and-styles'],
  }),
  topic(
    'high-press',
    'High Press',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['tactics-and-styles'],
    },
  ),
  topic(
    'counterpressing',
    'Counterpressing',
    'pressing-and-transitions',
    'tactical_concept',
    'advanced',
    { aliases: ['Counter-press', 'Counterpress', 'Counter Pressing'] },
  ),
  // One row, two homes. Gegenpressing is a pressing mechanism and a recognised
  // playing style, and duplicating it is exactly what the link table prevents.
  topic(
    'gegenpressing',
    'Gegenpressing',
    'pressing-and-transitions',
    'tactical_concept',
    'advanced',
    { alsoIn: ['tactics-and-styles'] },
  ),
  topic(
    'pressing-trigger',
    'Pressing Trigger',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'pressing-trap',
    'Pressing Trap',
    'pressing-and-transitions',
    'tactical_concept',
    'advanced',
    { alsoIn: ['defensive-concepts'] },
  ),
  topic(
    'cover-shadow',
    'Cover Shadow',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'first-line-of-pressure',
    'First Line of Pressure',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
  ),
  topic('transition', 'Transition', 'pressing-and-transitions', 'tactical_concept', 'beginner'),
  topic(
    'attacking-transition',
    'Attacking Transition',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'defensive-transition',
    'Defensive Transition',
    'pressing-and-transitions',
    'tactical_concept',
    'intermediate',
    { alsoIn: ['defensive-concepts'] },
  ),
  topic(
    'counter-attack',
    'Counter-attack',
    'pressing-and-transitions',
    'tactical_concept',
    'beginner',
    { alsoIn: ['attacking-concepts', 'tactics-and-styles'], aliases: ['Counterattack'] },
  ),
  topic(
    'breaking-a-press',
    'Breaking a Press',
    'pressing-and-transitions',
    'tactical_concept',
    'advanced',
    { aliases: ['Press Resistance', 'Playing Through the Press'] },
  ),

  // ── Tactics & Playing Styles ──────────────────────────────────────────────
  topic(
    'possession-football',
    'Possession Football',
    'tactics-and-styles',
    'tactical_concept',
    'beginner',
  ),
  topic(
    'positional-play',
    'Positional Play',
    'tactics-and-styles',
    'tactical_concept',
    'advanced',
    { subtitle: 'Juego de Posición', aliases: ['Juego de Posicion', 'Juego de Posición'] },
  ),
  topic('tiki-taka', 'Tiki-taka', 'tactics-and-styles', 'tactical_concept', 'intermediate', {
    aliases: ['Tiki Taka'],
  }),
  topic('direct-football', 'Direct Football', 'tactics-and-styles', 'tactical_concept', 'beginner'),
  topic('route-one', 'Route One', 'tactics-and-styles', 'tactical_concept', 'beginner'),
  topic(
    'vertical-football',
    'Vertical Football',
    'tactics-and-styles',
    'tactical_concept',
    'intermediate',
  ),
  topic('total-football', 'Total Football', 'tactics-and-styles', 'tactical_concept', 'advanced', {
    aliases: ['Totaalvoetbal'],
  }),
  topic('catenaccio', 'Catenaccio', 'tactics-and-styles', 'tactical_concept', 'advanced'),

  // ── Set Pieces ────────────────────────────────────────────────────────────
  topic('long-throw', 'Long Throws', 'set-pieces', 'tactical_concept', 'beginner'),
  topic('near-post-corner', 'Near-post Corner', 'set-pieces', 'tactical_concept', 'intermediate'),
  topic('far-post-corner', 'Far-post Corner', 'set-pieces', 'tactical_concept', 'intermediate'),
  topic('short-corner', 'Short Corner', 'set-pieces', 'tactical_concept', 'beginner'),
  topic(
    'zonal-set-piece-defending',
    'Zonal Set-piece Defending',
    'set-pieces',
    'tactical_concept',
    'advanced',
    { alsoIn: ['defensive-concepts'] },
  ),
  topic(
    'man-marking-at-corners',
    'Man-marking at Corners',
    'set-pieces',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'set-piece-routines',
    'Set-piece Routines',
    'set-pieces',
    'tactical_concept',
    'intermediate',
  ),
  topic('second-phase', 'Second Phase', 'set-pieces', 'tactical_concept', 'advanced'),

  // ── Refereeing & Technology ───────────────────────────────────────────────
  topic('referee', 'The Referee', 'refereeing-and-technology', 'standard', 'beginner'),
  topic(
    'assistant-referee',
    'Assistant Referee',
    'refereeing-and-technology',
    'standard',
    'beginner',
    { aliases: ['Linesman', 'Assistant'] },
  ),
  topic('fourth-official', 'Fourth Official', 'refereeing-and-technology', 'standard', 'beginner'),
  topic('var', 'VAR', 'refereeing-and-technology', 'rule', 'beginner', {
    subtitle: 'Video Assistant Referee',
    aliases: ['Video Assistant Referee', 'Video Ref'],
  }),
  topic('avar', 'AVAR', 'refereeing-and-technology', 'standard', 'intermediate', {
    aliases: ['Assistant VAR'],
  }),
  topic(
    'goal-line-technology',
    'Goal-line Technology',
    'refereeing-and-technology',
    'standard',
    'beginner',
    { aliases: ['GLT'] },
  ),
  topic(
    'on-field-review',
    'On-field Review',
    'refereeing-and-technology',
    'standard',
    'intermediate',
    { aliases: ['OFR'] },
  ),
  topic(
    'semi-automated-offside',
    'Semi-automated Offside Technology',
    'refereeing-and-technology',
    'standard',
    'intermediate',
    { aliases: ['SAOT'] },
  ),

  // ── Competitions & Formats ────────────────────────────────────────────────
  topic('league', 'League', 'competition-formats', 'standard', 'beginner', {
    aliases: ['Domestic League'],
  }),
  topic(
    'knockout-tournament',
    'Knockout Tournament',
    'competition-formats',
    'standard',
    'beginner',
    { aliases: ['Cup Competition'] },
  ),
  topic('round-robin', 'Round Robin', 'competition-formats', 'standard', 'intermediate'),
  topic('group-stage', 'Group Stage', 'competition-formats', 'standard', 'beginner'),
  topic('two-legged-tie', 'Two-legged Tie', 'competition-formats', 'standard', 'beginner', {
    aliases: ['Two Legs'],
  }),
  topic('aggregate-score', 'Aggregate Score', 'competition-formats', 'standard', 'beginner', {
    aliases: ['On Aggregate'],
  }),
  topic('away-goals', 'Away Goals Rule', 'competition-formats', 'standard', 'intermediate'),
  topic(
    'promotion-and-relegation',
    'Promotion & Relegation',
    'competition-formats',
    'standard',
    'beginner',
    {
      aliases: ['Promotion', 'Relegation'],
    },
  ),
  topic('playoffs', 'Playoffs', 'competition-formats', 'standard', 'beginner'),
  topic('qualification', 'Qualification', 'competition-formats', 'standard', 'beginner'),
  topic('seeding', 'Seeding', 'competition-formats', 'standard', 'intermediate'),
  topic('competition-draw', 'Competition Draw', 'competition-formats', 'standard', 'beginner'),
  topic('league-table', 'League Table', 'competition-formats', 'standard', 'beginner'),
  topic('points-system', 'Points System', 'competition-formats', 'standard', 'beginner'),
  topic('goal-difference', 'Goal Difference', 'competition-formats', 'standard', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
    aliases: ['GD'],
  }),
  topic('transfer-window', 'Transfer Window', 'competition-formats', 'standard', 'beginner'),
  topic('domestic-cup', 'Domestic Cup', 'competition-formats', 'standard', 'beginner'),
  topic(
    'continental-competition',
    'Continental Competition',
    'competition-formats',
    'standard',
    'beginner',
  ),

  // ── Statistics & Analytics ────────────────────────────────────────────────
  topic('assists', 'Assists', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('shots', 'Shots', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('shots-on-target', 'Shots on Target', 'statistics-and-analytics', 'statistic', 'beginner', {
    aliases: ['SoT'],
  }),
  topic(
    'passing-accuracy',
    'Passing Accuracy',
    'statistics-and-analytics',
    'statistic',
    'beginner',
  ),
  topic('key-pass', 'Key Pass', 'statistics-and-analytics', 'statistic', 'intermediate'),
  topic(
    'chance-created',
    'Chance Created',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
  ),
  topic('big-chance', 'Big Chance', 'statistics-and-analytics', 'statistic', 'intermediate'),
  topic(
    'expected-goals',
    'Expected Goals',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
    {
      subtitle: 'xG',
      aliases: ['xG', 'Expected Goals (xG)'],
    },
  ),
  topic(
    'expected-assists',
    'Expected Assists',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
    {
      subtitle: 'xA',
      aliases: ['xA'],
    },
  ),
  topic(
    'expected-goals-on-target',
    'Expected Goals on Target',
    'statistics-and-analytics',
    'statistic',
    'advanced',
    { subtitle: 'xGOT', aliases: ['xGOT', 'Post-shot xG', 'PSxG'] },
  ),
  topic(
    'progressive-carry',
    'Progressive Carry',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
  ),
  topic(
    'shot-creating-action',
    'Shot-creating Action',
    'statistics-and-analytics',
    'statistic',
    'advanced',
    { aliases: ['SCA'] },
  ),
  topic(
    'goal-creating-action',
    'Goal-creating Action',
    'statistics-and-analytics',
    'statistic',
    'advanced',
    { aliases: ['GCA'] },
  ),
  topic('ppda', 'PPDA', 'statistics-and-analytics', 'statistic', 'advanced', {
    subtitle: 'Passes Per Defensive Action',
    aliases: ['Passes Per Defensive Action'],
    alsoIn: ['pressing-and-transitions'],
  }),
  topic('field-tilt', 'Field Tilt', 'statistics-and-analytics', 'statistic', 'advanced'),
  topic(
    'touches-in-box',
    'Touches in the Box',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
  ),
  topic(
    'defensive-actions',
    'Defensive Actions',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
  ),
  topic('tackles', 'Tackles', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('recoveries', 'Recoveries', 'statistics-and-analytics', 'statistic', 'intermediate'),
  topic('aerial-duels', 'Aerial Duels', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('clean-sheet', 'Clean Sheets', 'statistics-and-analytics', 'statistic', 'beginner', {
    alsoIn: ['terminology'],
  }),

  // ── Terminology ───────────────────────────────────────────────────────────
  topic('derby', 'Derby', 'terminology', 'definition', 'beginner'),
  topic('hat-trick', 'Hat-trick', 'terminology', 'definition', 'beginner', {
    aliases: ['Hattrick', 'Hat Trick'],
  }),
  topic('brace', 'Brace', 'terminology', 'definition', 'beginner'),
  topic('nutmeg', 'Nutmeg', 'terminology', 'definition', 'beginner', { aliases: ['Meg'] }),
  topic('panenka', 'Panenka', 'terminology', 'definition', 'intermediate'),
  topic('rabona', 'Rabona', 'terminology', 'definition', 'intermediate'),
  topic('bicycle-kick', 'Bicycle Kick', 'terminology', 'definition', 'beginner', {
    aliases: ['Overhead Kick', 'Chilena'],
  }),
  topic('volley', 'Volley', 'terminology', 'definition', 'beginner'),
  topic('dummy', 'Dummy', 'terminology', 'definition', 'intermediate'),
  topic('one-two', 'One-two', 'terminology', 'definition', 'beginner', {
    aliases: ['Give and Go', 'Wall Pass'],
  }),
  topic('top-bins', 'Top Bins', 'terminology', 'definition', 'beginner', {
    aliases: ['Top Corner'],
  }),
  topic('woodwork', 'Woodwork', 'terminology', 'definition', 'beginner'),
  topic('own-goal', 'Own Goal', 'terminology', 'definition', 'beginner', { aliases: ['OG'] }),
  topic('fixture', 'Fixture', 'terminology', 'definition', 'beginner'),
  topic('tie', 'Tie', 'terminology', 'definition', 'beginner'),
  topic('leg', 'Leg', 'terminology', 'definition', 'beginner'),
  topic('captain', 'Captain', 'terminology', 'definition', 'beginner'),
  topic('debut', 'Debut', 'terminology', 'definition', 'beginner'),
  topic('cap', 'Cap', 'terminology', 'definition', 'beginner'),
  topic('transfer', 'Transfer', 'terminology', 'definition', 'beginner'),
  topic('loan', 'Loan', 'terminology', 'definition', 'beginner'),
  topic('free-agent', 'Free Agent', 'terminology', 'definition', 'beginner'),
];
