import type { ExplainerCategorySeed, ExplainerSeed } from './explainer-types';

/**
 * The cricket taxonomy: categories, and every concept the library intends to
 * cover.
 *
 * Structured like football's and sharing every table with it, but the headings
 * are cricket's own. Nothing here is a translation of a football category:
 * cricket's organising ideas are the Laws, the dismissals, the two bowling
 * disciplines, the fielding ring and the formats, and forcing them into
 * "attacking concepts" and "formations" would produce a taxonomy that reads as
 * though the sport were an afterthought.
 *
 * Everything in this file is a draft placeholder. Nothing here reaches the site.
 * The written explainers live in `cricket-explainers.ts` and override these by
 * slug, which is why the slugs here have to be right first time.
 *
 * ## On shared concepts
 *
 * Cricket needs many-to-many categorisation more than football does. Reverse
 * swing is a pace-bowling skill, a property of an old ball on an abrasive
 * surface, a red-ball staple and a death-bowling tactic. A declaration is part
 * of match structure, a red-ball concept and a captaincy decision. Each is one
 * row with `alsoIn`, never four rows, and the schema's unique index on
 * (sport_id, slug) is what makes that a guarantee rather than a convention.
 */

export const CRICKET_EXPLAINER_CATEGORIES: ExplainerCategorySeed[] = [
  {
    slug: 'match-basics',
    name: 'Match Basics',
    shortName: 'Basics',
    description: 'Cricket from zero: the pitch, the players, an over, and how runs are made.',
    order: 10,
  },
  {
    slug: 'laws-and-rules',
    name: 'Laws & Rules',
    shortName: 'Laws',
    description: 'What the Laws of Cricket say, and where a competition changes them.',
    order: 20,
  },
  {
    slug: 'dismissals',
    name: 'Dismissals',
    description: 'The ways a batter can be out, and what each one actually requires.',
    order: 30,
  },
  {
    slug: 'batting',
    name: 'Batting',
    description: 'Technique, shots and the ideas behind them.',
    order: 40,
  },
  {
    slug: 'batting-roles',
    name: 'Batting Roles',
    shortName: 'Roles',
    description: 'What each place in the order is usually asked to do, and why that varies.',
    order: 50,
  },
  {
    slug: 'bowling',
    name: 'Bowling',
    description: 'Line, length, pace and the mechanics common to every bowler.',
    order: 60,
  },
  {
    slug: 'pace-bowling',
    name: 'Pace Bowling',
    shortName: 'Pace',
    description: 'Seam, swing and the deliveries fast bowlers build a spell from.',
    order: 70,
  },
  {
    slug: 'spin-bowling',
    name: 'Spin Bowling',
    shortName: 'Spin',
    description: 'Finger and wrist spin, and the variations each can produce.',
    order: 80,
  },
  {
    slug: 'fielding-and-wicketkeeping',
    name: 'Fielding & Wicketkeeping',
    shortName: 'Fielding',
    description: 'Catching, ground fielding, run-outs and the work behind the stumps.',
    order: 90,
  },
  {
    slug: 'field-positions',
    name: 'Field Positions',
    shortName: 'Positions',
    description: 'Where every fielding position is, and what a captain puts it there for.',
    order: 100,
  },
  {
    slug: 'match-structure',
    name: 'Match Structure',
    shortName: 'Structure',
    description: 'Innings, sessions, breaks, leads and the ways a match can end.',
    order: 110,
  },
  {
    slug: 'formats',
    name: 'Formats',
    description: 'Test, first-class, ODI, List A and the T20 family, and how they differ.',
    order: 120,
  },
  {
    slug: 'tactics-and-strategy',
    name: 'Tactics & Strategy',
    shortName: 'Tactics',
    description: 'How teams build innings, bowl in partnerships and captain a match.',
    order: 130,
  },
  {
    slug: 'limited-overs-concepts',
    name: 'Limited-overs Concepts',
    shortName: 'White ball',
    description: 'Powerplays, phases, run rates and the arithmetic of a chase.',
    order: 140,
  },
  {
    slug: 'red-ball-concepts',
    name: 'Test & Red-ball Concepts',
    shortName: 'Red ball',
    description: 'The new ball, the old ball, the declaration and playing for a draw.',
    order: 150,
  },
  {
    slug: 'pitch-and-conditions',
    name: 'Pitch & Conditions',
    shortName: 'Conditions',
    description: 'What the surface, the weather and the outfield do to a match.',
    order: 160,
  },
  {
    slug: 'scoring-and-scorecards',
    name: 'Scoring & Scorecards',
    shortName: 'Scoring',
    description: 'How to read 287/6 (47.2), a batting line and a bowling analysis.',
    order: 170,
  },
  {
    slug: 'statistics-and-analytics',
    name: 'Statistics & Analytics',
    shortName: 'Stats',
    description: 'What each number measures, and what it leaves out.',
    order: 180,
  },
  {
    slug: 'officials-and-technology',
    name: 'Officials & Technology',
    shortName: 'Officiating',
    description: 'Who decides, what they review, and which technology does what.',
    order: 190,
  },
  {
    slug: 'equipment',
    name: 'Equipment',
    description: 'Bat, ball, stumps and protective gear.',
    order: 200,
  },
  {
    slug: 'terminology',
    name: 'Cricket Terminology',
    shortName: 'Terms',
    description: 'The vocabulary, from the official to the entirely informal.',
    order: 210,
  },
];

/**
 * Builds a taxonomy placeholder.
 *
 * A helper rather than four hundred object literals: the placeholders differ
 * only in slug, title, type and difficulty, and spelling out the identical
 * fields each time would bury those four.
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
 * Every cricket concept the library intends to cover.
 *
 * The complete inventory, so a proposed explainer can be checked against what we
 * plan to write rather than only against what is finished. Concepts written up
 * in `cricket-explainers.ts` appear here too and are overridden by slug.
 */
export const CRICKET_EXPLAINER_TOPICS: ExplainerSeed[] = [
  // ── Match Basics ──────────────────────────────────────────────────────────
  topic(
    'how-a-cricket-match-works',
    'How a Cricket Match Works',
    'match-basics',
    'standard',
    'beginner',
  ),
  topic('how-runs-are-scored', 'How Runs Are Scored', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['scoring-and-scorecards'],
  }),
  topic('batter', 'Batter', 'match-basics', 'definition', 'beginner'),
  topic('bowler', 'Bowler', 'match-basics', 'definition', 'beginner'),
  topic('fielder', 'Fielder', 'match-basics', 'definition', 'beginner'),
  topic('wicketkeeper', 'Wicketkeeper', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['fielding-and-wicketkeeping'],
    aliases: ['Wicket-keeper', 'Keeper'],
  }),
  topic('wicket', 'Wicket', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['equipment', 'terminology'],
  }),
  topic('cricket-pitch', 'The Pitch', 'match-basics', 'standard', 'beginner', {
    alsoIn: ['pitch-and-conditions'],
  }),
  topic('crease', 'Crease', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['laws-and-rules'],
  }),
  topic('innings', 'Innings', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['match-structure'],
  }),
  topic('over', 'Over', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['laws-and-rules', 'match-structure'],
  }),
  topic('delivery', 'Delivery', 'match-basics', 'definition', 'beginner', { aliases: ['Ball'] }),
  topic('runs', 'Runs', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('boundary', 'Boundary', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['laws-and-rules'],
  }),
  topic('four', 'Four', 'match-basics', 'definition', 'beginner'),
  topic('six', 'Six', 'match-basics', 'definition', 'beginner'),
  topic('dismissal', 'Dismissal', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['dismissals'],
    aliases: ['Out'],
  }),
  topic('partnership', 'Partnership', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['scoring-and-scorecards'],
  }),
  topic('batting-order', 'Batting Order', 'match-basics', 'definition', 'beginner', {
    alsoIn: ['batting-roles'],
  }),
  topic('striker', 'Striker', 'match-basics', 'definition', 'beginner'),
  topic('non-striker', 'Non-striker', 'match-basics', 'definition', 'beginner'),
  topic('ends', 'Ends and Changing Ends', 'match-basics', 'definition', 'beginner', {
    aliases: ['End', 'Changing Ends'],
  }),
  topic(
    'basic-cricket-terminology',
    'Basic Cricket Terminology',
    'match-basics',
    'standard',
    'beginner',
    {
      alsoIn: ['terminology'],
    },
  ),
  topic('batting-vs-bowling', 'Batting vs Bowling', 'match-basics', 'standard', 'beginner'),

  // ── Laws & Rules ──────────────────────────────────────────────────────────
  topic('legal-delivery', 'Legal Delivery', 'laws-and-rules', 'rule', 'beginner', {
    ruleSensitive: true,
  }),
  topic('no-ball', 'No-ball', 'laws-and-rules', 'rule', 'beginner', {
    alsoIn: ['scoring-and-scorecards'],
    ruleSensitive: true,
  }),
  topic('wide', 'Wide', 'laws-and-rules', 'rule', 'beginner', {
    alsoIn: ['scoring-and-scorecards'],
    ruleSensitive: true,
  }),
  topic('dead-ball', 'Dead Ball', 'laws-and-rules', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('bye', 'Bye', 'laws-and-rules', 'rule', 'beginner', { alsoIn: ['scoring-and-scorecards'] }),
  topic('leg-bye', 'Leg Bye', 'laws-and-rules', 'rule', 'intermediate', {
    alsoIn: ['scoring-and-scorecards'],
  }),
  topic('penalty-runs', 'Penalty Runs', 'laws-and-rules', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('boundary-rules', 'Boundary Rules', 'laws-and-rules', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('appeals', 'Appeals', 'laws-and-rules', 'rule', 'beginner', {
    alsoIn: ['officials-and-technology'],
  }),
  topic('batters-ground', "Batter's Ground", 'laws-and-rules', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('crease-rules', 'Crease Rules', 'laws-and-rules', 'rule', 'intermediate'),
  topic(
    'running-between-wickets',
    'Running Between the Wickets',
    'laws-and-rules',
    'rule',
    'beginner',
    {
      alsoIn: ['batting'],
    },
  ),
  topic('short-run', 'Short Run', 'laws-and-rules', 'rule', 'intermediate'),
  topic('substitute-fielder', 'Substitute Fielder', 'laws-and-rules', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('runner', 'Runner', 'laws-and-rules', 'rule', 'intermediate', { ruleSensitive: true }),
  topic(
    'handling-the-ball',
    'Interfering With the Ball',
    'laws-and-rules',
    'rule',
    'intermediate',
    {
      alsoIn: ['dismissals'],
      aliases: ['Handled the Ball', 'Handling the Ball'],
      ruleSensitive: true,
    },
  ),
  topic(
    'fielding-restrictions',
    'Fielding Restrictions',
    'laws-and-rules',
    'rule',
    'intermediate',
    {
      alsoIn: ['limited-overs-concepts', 'field-positions'],
      ruleSensitive: true,
    },
  ),
  topic('free-hit', 'Free Hit', 'laws-and-rules', 'rule', 'beginner', {
    alsoIn: ['limited-overs-concepts'],
    ruleSensitive: true,
  }),
  topic(
    'over-rate-and-time',
    'Over Rates and Time Regulations',
    'laws-and-rules',
    'rule',
    'advanced',
    {
      ruleSensitive: true,
    },
  ),

  // ── Dismissals ────────────────────────────────────────────────────────────
  topic('wickets-and-dismissals', 'Wickets & Dismissals', 'dismissals', 'standard', 'beginner'),
  topic('bowled', 'Bowled', 'dismissals', 'dismissal', 'beginner', { ruleSensitive: true }),
  topic('caught', 'Caught', 'dismissals', 'dismissal', 'beginner', { ruleSensitive: true }),
  topic('lbw', 'LBW', 'dismissals', 'dismissal', 'beginner', {
    alsoIn: ['laws-and-rules'],
    aliases: ['Leg Before Wicket', 'Leg-before'],
    ruleSensitive: true,
  }),
  topic('run-out', 'Run Out', 'dismissals', 'dismissal', 'beginner', { ruleSensitive: true }),
  topic('stumped', 'Stumped', 'dismissals', 'dismissal', 'beginner', {
    alsoIn: ['fielding-and-wicketkeeping'],
    ruleSensitive: true,
  }),
  topic('hit-wicket', 'Hit Wicket', 'dismissals', 'dismissal', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('obstructing-the-field', 'Obstructing the Field', 'dismissals', 'dismissal', 'advanced', {
    ruleSensitive: true,
  }),
  topic('hit-the-ball-twice', 'Hit the Ball Twice', 'dismissals', 'dismissal', 'advanced', {
    ruleSensitive: true,
  }),
  topic('timed-out', 'Timed Out', 'dismissals', 'dismissal', 'advanced', { ruleSensitive: true }),
  topic(
    'run-out-non-strikers-end',
    "Run Out at the Non-striker's End",
    'dismissals',
    'dismissal',
    'intermediate',
    {
      alsoIn: ['laws-and-rules', 'terminology'],
      aliases: ['Mankad', 'Mankading', 'Backing Up Run Out'],
      ruleSensitive: true,
    },
  ),
  topic('retired-out', 'Retired Out', 'dismissals', 'dismissal', 'advanced', {
    ruleSensitive: true,
  }),

  // ── Batting: basics ───────────────────────────────────────────────────────
  topic('batting-stance', 'Batting Stance', 'batting', 'batting_technique', 'beginner'),
  topic('batting-grip', 'Grip', 'batting', 'batting_technique', 'beginner'),
  topic('backlift', 'Backlift', 'batting', 'batting_technique', 'intermediate'),
  topic('footwork', 'Footwork', 'batting', 'batting_technique', 'beginner'),
  topic('balance', 'Balance', 'batting', 'batting_technique', 'intermediate'),
  topic('timing', 'Timing', 'batting', 'batting_technique', 'intermediate'),
  topic('strike-rotation', 'Strike Rotation', 'batting', 'tactical_concept', 'intermediate', {
    alsoIn: ['tactics-and-strategy'],
  }),

  // ── Batting: shots ────────────────────────────────────────────────────────
  topic('defensive-shot', 'Defensive Shot', 'batting', 'batting_technique', 'beginner'),
  topic('forward-defence', 'Forward Defence', 'batting', 'batting_technique', 'beginner'),
  topic('back-foot-defence', 'Back-foot Defence', 'batting', 'batting_technique', 'beginner'),
  topic('drive', 'Drive', 'batting', 'batting_technique', 'beginner'),
  topic('cover-drive', 'Cover Drive', 'batting', 'batting_technique', 'beginner'),
  topic('straight-drive', 'Straight Drive', 'batting', 'batting_technique', 'beginner'),
  topic('on-drive', 'On Drive', 'batting', 'batting_technique', 'intermediate'),
  topic('square-drive', 'Square Drive', 'batting', 'batting_technique', 'intermediate'),
  topic('cut-shot', 'Cut Shot', 'batting', 'batting_technique', 'beginner'),
  topic('square-cut', 'Square Cut', 'batting', 'batting_technique', 'intermediate'),
  topic('pull-shot', 'Pull Shot', 'batting', 'batting_technique', 'beginner'),
  topic('hook-shot', 'Hook Shot', 'batting', 'batting_technique', 'intermediate'),
  topic('sweep', 'Sweep', 'batting', 'batting_technique', 'intermediate'),
  topic('slog-sweep', 'Slog Sweep', 'batting', 'batting_technique', 'intermediate'),
  topic('reverse-sweep', 'Reverse Sweep', 'batting', 'batting_technique', 'advanced'),
  topic('paddle-sweep', 'Paddle Sweep', 'batting', 'batting_technique', 'intermediate'),
  topic('flick', 'Flick', 'batting', 'batting_technique', 'intermediate'),
  topic('leg-glance', 'Leg Glance', 'batting', 'batting_technique', 'intermediate'),
  topic('upper-cut', 'Upper Cut', 'batting', 'batting_technique', 'intermediate'),
  topic('ramp-shot', 'Ramp Shot', 'batting', 'batting_technique', 'advanced'),
  topic('scoop', 'Scoop', 'batting', 'batting_technique', 'advanced'),
  topic('switch-hit', 'Switch Hit', 'batting', 'batting_technique', 'advanced', {
    alsoIn: ['laws-and-rules'],
    ruleSensitive: true,
  }),

  // ── Batting: concepts ─────────────────────────────────────────────────────
  topic('playing-late', 'Playing Late', 'batting', 'tactical_concept', 'advanced'),
  topic('soft-hands', 'Soft Hands', 'batting', 'batting_technique', 'intermediate'),
  topic('leaving-the-ball', 'Leaving the Ball', 'batting', 'tactical_concept', 'intermediate'),
  topic(
    'batting-outside-the-crease',
    'Batting Outside the Crease',
    'batting',
    'tactical_concept',
    'advanced',
  ),
  topic(
    'depth-of-the-crease',
    'Using the Depth of the Crease',
    'batting',
    'tactical_concept',
    'advanced',
  ),
  topic(
    'playing-against-spin',
    'Playing Against Spin',
    'batting',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['spin-bowling', 'tactics-and-strategy'],
    },
  ),
  topic('playing-swing', 'Playing Swing', 'batting', 'tactical_concept', 'intermediate', {
    alsoIn: ['pace-bowling'],
  }),
  topic(
    'playing-short-pitched-bowling',
    'Playing Short-pitched Bowling',
    'batting',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['pace-bowling'],
    },
  ),
  topic('strike-farming', 'Strike Farming', 'batting', 'tactical_concept', 'intermediate', {
    alsoIn: ['tactics-and-strategy'],
  }),
  topic('batting-tempo', 'Batting Tempo', 'batting', 'tactical_concept', 'intermediate', {
    alsoIn: ['tactics-and-strategy'],
  }),

  // ── Batting Roles ─────────────────────────────────────────────────────────
  topic('opener', 'Opener', 'batting-roles', 'position_role', 'beginner', {
    aliases: ['Opening Batter'],
  }),
  topic('top-order-batter', 'Top-order Batter', 'batting-roles', 'position_role', 'beginner'),
  topic('number-three', 'Number 3', 'batting-roles', 'position_role', 'intermediate'),
  topic('middle-order-batter', 'Middle-order Batter', 'batting-roles', 'position_role', 'beginner'),
  topic('lower-order-batter', 'Lower-order Batter', 'batting-roles', 'position_role', 'beginner'),
  topic('finisher', 'Finisher', 'batting-roles', 'position_role', 'intermediate', {
    alsoIn: ['limited-overs-concepts'],
  }),
  topic('anchor', 'Anchor', 'batting-roles', 'position_role', 'intermediate'),
  topic('aggressor', 'Aggressor', 'batting-roles', 'position_role', 'intermediate'),
  topic('pinch-hitter', 'Pinch Hitter', 'batting-roles', 'position_role', 'intermediate'),
  topic('nightwatchman', 'Nightwatchman', 'batting-roles', 'position_role', 'intermediate', {
    alsoIn: ['red-ball-concepts', 'terminology'],
  }),
  topic('tailender', 'Tailender', 'batting-roles', 'position_role', 'beginner', {
    alsoIn: ['terminology'],
  }),
  topic('all-rounder', 'All-rounder', 'batting-roles', 'position_role', 'beginner'),
  topic(
    'wicketkeeper-batter',
    'Wicketkeeper-batter',
    'batting-roles',
    'position_role',
    'intermediate',
    {
      alsoIn: ['fielding-and-wicketkeeping'],
    },
  ),

  // ── Bowling ───────────────────────────────────────────────────────────────
  topic('bowling-action', 'Bowling Action', 'bowling', 'standard', 'beginner', {
    alsoIn: ['laws-and-rules'],
  }),
  topic('run-up', 'Run-up', 'bowling', 'standard', 'beginner'),
  topic('release-point', 'Release Point', 'bowling', 'standard', 'advanced'),
  topic('seam-position', 'Seam Position', 'bowling', 'standard', 'intermediate', {
    alsoIn: ['pace-bowling'],
  }),
  topic('line', 'Line', 'bowling', 'definition', 'beginner'),
  topic('length', 'Length', 'bowling', 'definition', 'beginner'),
  topic('pace', 'Pace', 'bowling', 'definition', 'beginner'),
  topic('variation', 'Variation', 'bowling', 'definition', 'intermediate'),
  topic('bowling-spell', 'Bowling Spell', 'bowling', 'definition', 'beginner', {
    alsoIn: ['match-structure'],
  }),

  // ── Pace Bowling ──────────────────────────────────────────────────────────
  topic('fast-bowling', 'Fast Bowling', 'pace-bowling', 'standard', 'beginner'),
  topic('fast-medium-bowling', 'Fast-medium Bowling', 'pace-bowling', 'definition', 'intermediate'),
  topic('seam-bowling', 'Seam Bowling', 'pace-bowling', 'standard', 'intermediate', {
    alsoIn: ['pitch-and-conditions'],
  }),
  topic('swing-bowling', 'Swing Bowling', 'pace-bowling', 'standard', 'intermediate', {
    alsoIn: ['pitch-and-conditions'],
    aliases: ['Swing'],
  }),
  topic(
    'conventional-swing',
    'Conventional Swing',
    'pace-bowling',
    'bowling_delivery',
    'intermediate',
  ),
  topic('reverse-swing', 'Reverse Swing', 'pace-bowling', 'bowling_delivery', 'intermediate', {
    alsoIn: ['pitch-and-conditions', 'red-ball-concepts', 'tactics-and-strategy'],
  }),
  topic('inswinger', 'Inswinger', 'pace-bowling', 'bowling_delivery', 'intermediate'),
  topic('outswinger', 'Outswinger', 'pace-bowling', 'bowling_delivery', 'intermediate'),
  topic('yorker', 'Yorker', 'pace-bowling', 'bowling_delivery', 'beginner', {
    alsoIn: ['terminology', 'tactics-and-strategy'],
  }),
  topic('bouncer', 'Bouncer', 'pace-bowling', 'bowling_delivery', 'beginner', {
    alsoIn: ['laws-and-rules'],
    ruleSensitive: true,
  }),
  topic('short-ball', 'Short Ball', 'pace-bowling', 'bowling_delivery', 'beginner'),
  topic('good-length', 'Good Length', 'pace-bowling', 'definition', 'beginner'),
  topic('full-length', 'Full Length', 'pace-bowling', 'definition', 'intermediate'),
  topic('half-volley', 'Half-volley', 'pace-bowling', 'definition', 'intermediate'),
  topic('full-toss', 'Full Toss', 'pace-bowling', 'definition', 'beginner'),
  topic('slower-ball', 'Slower Ball', 'pace-bowling', 'bowling_delivery', 'intermediate'),
  topic('off-cutter', 'Off-cutter', 'pace-bowling', 'bowling_delivery', 'advanced'),
  topic('leg-cutter', 'Leg-cutter', 'pace-bowling', 'bowling_delivery', 'advanced'),
  topic('knuckle-ball', 'Knuckle Ball', 'pace-bowling', 'bowling_delivery', 'advanced'),
  topic(
    'cross-seam-delivery',
    'Cross-seam Delivery',
    'pace-bowling',
    'bowling_delivery',
    'advanced',
  ),
  topic('back-of-a-length', 'Back-of-a-length', 'pace-bowling', 'definition', 'advanced'),
  topic('wide-yorker', 'Wide Yorker', 'pace-bowling', 'bowling_delivery', 'intermediate', {
    alsoIn: ['limited-overs-concepts'],
  }),
  topic('death-bowling', 'Death Bowling', 'pace-bowling', 'tactical_concept', 'intermediate', {
    alsoIn: ['limited-overs-concepts', 'tactics-and-strategy'],
  }),

  // ── Spin Bowling ──────────────────────────────────────────────────────────
  topic('spin-bowling', 'Spin Bowling', 'spin-bowling', 'standard', 'beginner'),
  topic('finger-spin', 'Finger Spin', 'spin-bowling', 'standard', 'intermediate'),
  topic('wrist-spin', 'Wrist Spin', 'spin-bowling', 'standard', 'intermediate'),
  topic('off-spin', 'Off Spin', 'spin-bowling', 'standard', 'beginner'),
  topic('leg-spin', 'Leg Spin', 'spin-bowling', 'standard', 'beginner', { aliases: ['Leggie'] }),
  topic(
    'orthodox-left-arm-spin',
    'Orthodox Left-arm Spin',
    'spin-bowling',
    'standard',
    'intermediate',
    {
      aliases: ['Slow Left-arm Orthodox'],
    },
  ),
  topic('left-arm-wrist-spin', 'Left-arm Wrist Spin', 'spin-bowling', 'standard', 'advanced', {
    alsoIn: ['terminology'],
    aliases: ['Chinaman', 'Left-arm Unorthodox'],
  }),
  topic('off-break', 'Off Break', 'spin-bowling', 'bowling_delivery', 'beginner'),
  topic('leg-break', 'Leg Break', 'spin-bowling', 'bowling_delivery', 'beginner'),
  topic('googly', 'Googly', 'spin-bowling', 'bowling_delivery', 'intermediate', {
    alsoIn: ['terminology'],
    aliases: ["Wrong'un", 'Bosie'],
  }),
  topic('topspinner', 'Topspinner', 'spin-bowling', 'bowling_delivery', 'advanced'),
  topic('flipper', 'Flipper', 'spin-bowling', 'bowling_delivery', 'advanced'),
  topic('slider', 'Slider', 'spin-bowling', 'bowling_delivery', 'advanced'),
  topic('arm-ball', 'Arm Ball', 'spin-bowling', 'bowling_delivery', 'intermediate'),
  topic('carrom-ball', 'Carrom Ball', 'spin-bowling', 'bowling_delivery', 'advanced'),
  topic('doosra', 'Doosra', 'spin-bowling', 'bowling_delivery', 'advanced'),

  // ── Fielding & Wicketkeeping ──────────────────────────────────────────────
  topic('ground-fielding', 'Ground Fielding', 'fielding-and-wicketkeeping', 'standard', 'beginner'),
  topic('catching', 'Catching', 'fielding-and-wicketkeeping', 'standard', 'beginner'),
  topic('high-catch', 'High Catch', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic(
    'slip-catching',
    'Slip Catching',
    'fielding-and-wicketkeeping',
    'standard',
    'intermediate',
    {
      alsoIn: ['field-positions'],
    },
  ),
  topic(
    'close-catching',
    'Close Catching',
    'fielding-and-wicketkeeping',
    'standard',
    'intermediate',
    {
      alsoIn: ['field-positions'],
    },
  ),
  topic(
    'boundary-fielding',
    'Boundary Fielding',
    'fielding-and-wicketkeeping',
    'standard',
    'intermediate',
  ),
  topic('relay-throw', 'Relay Throw', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic('direct-hit', 'Direct Hit', 'fielding-and-wicketkeeping', 'definition', 'intermediate'),
  topic(
    'run-out-technique',
    'Run-out Technique',
    'fielding-and-wicketkeeping',
    'standard',
    'intermediate',
  ),
  topic('backing-up-fielding', 'Backup', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic('wicketkeeping', 'Wicketkeeping', 'fielding-and-wicketkeeping', 'standard', 'beginner'),
  topic('standing-up', 'Standing Up', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic('standing-back', 'Standing Back', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic('collecting', 'Collecting', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),
  topic('stumping', 'Stumping', 'fielding-and-wicketkeeping', 'standard', 'intermediate', {
    alsoIn: ['dismissals'],
  }),
  topic(
    'wicketkeeper-footwork',
    'Wicketkeeper Footwork',
    'fielding-and-wicketkeeping',
    'standard',
    'advanced',
  ),
  topic('diving-stop', 'Diving Stop', 'fielding-and-wicketkeeping', 'standard', 'intermediate'),

  // ── Field Positions ───────────────────────────────────────────────────────
  topic(
    'cricket-field-positions',
    'Field Positions Explained',
    'field-positions',
    'standard',
    'beginner',
  ),
  topic('slip', 'Slip', 'field-positions', 'field_position', 'beginner'),
  topic('first-slip', 'First Slip', 'field-positions', 'field_position', 'intermediate'),
  topic('second-slip', 'Second Slip', 'field-positions', 'field_position', 'intermediate'),
  topic('third-slip', 'Third Slip', 'field-positions', 'field_position', 'intermediate'),
  topic('gully', 'Gully', 'field-positions', 'field_position', 'beginner'),
  topic('fly-slip', 'Fly Slip', 'field-positions', 'field_position', 'advanced'),
  topic('point', 'Point', 'field-positions', 'field_position', 'beginner'),
  topic('backward-point', 'Backward Point', 'field-positions', 'field_position', 'intermediate'),
  topic('cover', 'Cover', 'field-positions', 'field_position', 'beginner'),
  topic('extra-cover', 'Extra Cover', 'field-positions', 'field_position', 'intermediate'),
  topic('mid-off', 'Mid-off', 'field-positions', 'field_position', 'beginner'),
  topic('mid-on', 'Mid-on', 'field-positions', 'field_position', 'beginner'),
  topic('midwicket', 'Midwicket', 'field-positions', 'field_position', 'beginner'),
  topic('square-leg', 'Square Leg', 'field-positions', 'field_position', 'beginner'),
  topic('fine-leg', 'Fine Leg', 'field-positions', 'field_position', 'beginner'),
  topic('long-leg', 'Long Leg', 'field-positions', 'field_position', 'intermediate'),
  topic('third-man', 'Third Man', 'field-positions', 'field_position', 'beginner'),
  topic('deep-point', 'Deep Point', 'field-positions', 'field_position', 'intermediate'),
  topic('deep-cover', 'Deep Cover', 'field-positions', 'field_position', 'intermediate'),
  topic('long-off', 'Long Off', 'field-positions', 'field_position', 'beginner'),
  topic('long-on', 'Long On', 'field-positions', 'field_position', 'beginner'),
  topic('deep-midwicket', 'Deep Midwicket', 'field-positions', 'field_position', 'intermediate'),
  topic('deep-square-leg', 'Deep Square Leg', 'field-positions', 'field_position', 'intermediate'),
  topic('short-leg', 'Short Leg', 'field-positions', 'field_position', 'intermediate', {
    aliases: ['Bat-pad'],
  }),
  topic('silly-point', 'Silly Point', 'field-positions', 'field_position', 'advanced'),
  topic('silly-mid-off', 'Silly Mid-off', 'field-positions', 'field_position', 'advanced'),
  topic('silly-mid-on', 'Silly Mid-on', 'field-positions', 'field_position', 'advanced'),
  topic('leg-slip', 'Leg Slip', 'field-positions', 'field_position', 'advanced'),
  topic('leg-gully', 'Leg Gully', 'field-positions', 'field_position', 'advanced'),
  topic('cow-corner', 'Cow Corner', 'field-positions', 'field_position', 'intermediate', {
    alsoIn: ['terminology'],
  }),

  // ── Match Structure ───────────────────────────────────────────────────────
  topic('session', 'Session', 'match-structure', 'definition', 'beginner', {
    alsoIn: ['red-ball-concepts'],
  }),
  topic('drinks-break', 'Drinks Break', 'match-structure', 'definition', 'beginner'),
  topic('lunch', 'Lunch', 'match-structure', 'definition', 'beginner'),
  topic('tea', 'Tea', 'match-structure', 'definition', 'beginner'),
  topic('declaration', 'Declaration', 'match-structure', 'rule', 'intermediate', {
    alsoIn: ['red-ball-concepts', 'tactics-and-strategy'],
    ruleSensitive: true,
  }),
  topic('follow-on', 'Follow-on', 'match-structure', 'rule', 'intermediate', {
    alsoIn: ['red-ball-concepts', 'tactics-and-strategy'],
    ruleSensitive: true,
  }),
  topic('target', 'Target', 'match-structure', 'definition', 'beginner', {
    alsoIn: ['scoring-and-scorecards'],
  }),
  topic('chase', 'Chase', 'match-structure', 'tactical_concept', 'beginner', {
    alsoIn: ['limited-overs-concepts', 'tactics-and-strategy'],
  }),
  topic('first-innings', 'First Innings', 'match-structure', 'definition', 'beginner'),
  topic('second-innings', 'Second Innings', 'match-structure', 'definition', 'beginner'),
  topic('lead', 'Lead', 'match-structure', 'definition', 'beginner', {
    alsoIn: ['red-ball-concepts', 'scoring-and-scorecards'],
  }),
  topic('deficit', 'Deficit', 'match-structure', 'definition', 'beginner', {
    alsoIn: ['red-ball-concepts', 'scoring-and-scorecards'],
  }),
  topic('draw', 'Draw', 'match-structure', 'definition', 'beginner', {
    alsoIn: ['red-ball-concepts'],
  }),
  topic('tie', 'Tie', 'match-structure', 'definition', 'beginner'),
  topic('no-result', 'No Result', 'match-structure', 'definition', 'intermediate'),
  topic('abandoned-match', 'Abandoned Match', 'match-structure', 'definition', 'intermediate'),

  // ── Formats ───────────────────────────────────────────────────────────────
  topic('test-vs-odi-vs-t20', 'Test vs ODI vs T20', 'formats', 'standard', 'beginner'),
  topic('test-cricket', 'Test Cricket', 'formats', 'format', 'beginner'),
  topic('first-class-cricket', 'First-class Cricket', 'formats', 'format', 'intermediate'),
  topic('odi', 'ODI', 'formats', 'format', 'beginner', { aliases: ['One Day International'] }),
  topic('list-a-cricket', 'List A Cricket', 'formats', 'format', 'intermediate'),
  topic('t20i', 'T20 International', 'formats', 'format', 'beginner', {
    aliases: ['T20I', 'Twenty20 International'],
  }),
  topic('domestic-t20', 'Domestic T20', 'formats', 'format', 'intermediate'),
  topic('franchise-cricket', 'Franchise Cricket', 'formats', 'format', 'intermediate'),
  topic('t10', 'T10', 'formats', 'format', 'intermediate'),
  topic('multi-day-cricket', 'Multi-day Cricket', 'formats', 'format', 'intermediate'),
  topic('limited-overs-cricket', 'Limited-overs Cricket', 'formats', 'format', 'beginner'),
  topic(
    'international-status',
    'International Status and Match Classification',
    'formats',
    'standard',
    'advanced',
    {
      ruleSensitive: true,
    },
  ),

  // ── Tactics & Strategy ────────────────────────────────────────────────────
  topic(
    'building-an-innings',
    'Building an Innings',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'targeting-a-bowler',
    'Targeting a Bowler',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'batting-through-the-innings',
    'Batting Through the Innings',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'risk-management-batting',
    'Risk Management',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
  ),
  topic(
    'powerplay-batting',
    'Powerplay Batting',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['limited-overs-concepts'],
    },
  ),
  topic(
    'middle-overs-batting',
    'Middle-overs Batting',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['limited-overs-concepts'],
    },
  ),
  topic(
    'death-overs-batting',
    'Death-overs Batting',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['limited-overs-concepts'],
    },
  ),
  topic(
    'setting-a-target',
    'Setting a Target',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'new-ball-bowling',
    'New-ball Bowling',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['pace-bowling', 'red-ball-concepts'],
    },
  ),
  topic(
    'bowling-partnerships',
    'Bowling Partnerships',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'building-pressure',
    'Building Pressure',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'dot-ball-pressure',
    'Dot-ball Pressure',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['statistics-and-analytics'],
    },
  ),
  topic(
    'attacking-the-stumps',
    'Attacking the Stumps',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'bowling-to-a-field',
    'Bowling to a Field',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['field-positions'],
    },
  ),
  topic(
    'short-ball-strategy',
    'Short-ball Strategy',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
    {
      alsoIn: ['pace-bowling'],
    },
  ),
  topic(
    'defensive-bowling',
    'Defensive Bowling',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'wicket-taking-bowling',
    'Wicket-taking Bowling',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic(
    'field-setting',
    'Field Setting',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
    {
      alsoIn: ['field-positions'],
    },
  ),
  topic(
    'bowling-changes',
    'Bowling Changes',
    'tactics-and-strategy',
    'tactical_concept',
    'intermediate',
  ),
  topic('matchups', 'Matchups', 'tactics-and-strategy', 'tactical_concept', 'advanced', {
    alsoIn: ['statistics-and-analytics', 'limited-overs-concepts'],
  }),
  topic(
    'declaration-strategy',
    'Declaration Strategy',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
    {
      alsoIn: ['red-ball-concepts'],
    },
  ),
  topic(
    'follow-on-decision',
    'Follow-on Decision',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
    {
      alsoIn: ['red-ball-concepts'],
    },
  ),
  topic(
    'reviews-strategy',
    'Reviews Strategy',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
    {
      alsoIn: ['officials-and-technology'],
      ruleSensitive: true,
    },
  ),
  topic('managing-overs', 'Managing Overs', 'tactics-and-strategy', 'tactical_concept', 'advanced'),
  topic(
    'protecting-a-batter',
    'Protecting a Batter',
    'tactics-and-strategy',
    'tactical_concept',
    'advanced',
  ),

  // ── Limited-overs Concepts ────────────────────────────────────────────────
  topic('powerplay', 'Powerplay', 'limited-overs-concepts', 'rule', 'beginner', {
    alsoIn: ['laws-and-rules', 'tactics-and-strategy'],
    ruleSensitive: true,
  }),
  topic('middle-overs', 'Middle Overs', 'limited-overs-concepts', 'definition', 'beginner'),
  topic('death-overs', 'Death Overs', 'limited-overs-concepts', 'definition', 'beginner'),
  topic(
    'required-run-rate',
    'Required Run Rate',
    'limited-overs-concepts',
    'statistic',
    'beginner',
    {
      alsoIn: ['scoring-and-scorecards', 'statistics-and-analytics'],
      aliases: ['RRR'],
    },
  ),
  topic('net-run-rate', 'Net Run Rate', 'limited-overs-concepts', 'statistic', 'intermediate', {
    alsoIn: ['statistics-and-analytics'],
    aliases: ['NRR'],
    ruleSensitive: true,
  }),
  topic('par-score', 'Par Score', 'limited-overs-concepts', 'statistic', 'intermediate'),
  topic(
    'batting-deep',
    'Batting Deep',
    'limited-overs-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic('super-over', 'Super Over', 'limited-overs-concepts', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('dls-method', 'DLS Method', 'limited-overs-concepts', 'rule', 'intermediate', {
    alsoIn: ['laws-and-rules', 'statistics-and-analytics'],
    aliases: ['Duckworth-Lewis', 'Duckworth Lewis Stern', 'DL Method'],
    ruleSensitive: true,
  }),

  // ── Test & Red-ball Concepts ──────────────────────────────────────────────
  topic('new-ball', 'New Ball', 'red-ball-concepts', 'standard', 'beginner', {
    alsoIn: ['equipment', 'pace-bowling'],
  }),
  topic('second-new-ball', 'Second New Ball', 'red-ball-concepts', 'rule', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('old-ball', 'Old Ball', 'red-ball-concepts', 'standard', 'intermediate', {
    alsoIn: ['equipment'],
  }),
  topic(
    'batting-for-a-draw',
    'Batting for a Draw',
    'red-ball-concepts',
    'tactical_concept',
    'intermediate',
  ),
  topic('rough', 'The Rough', 'red-ball-concepts', 'standard', 'intermediate', {
    alsoIn: ['pitch-and-conditions', 'spin-bowling'],
  }),
  topic('wearing-pitch', 'Wearing Pitch', 'red-ball-concepts', 'standard', 'intermediate', {
    alsoIn: ['pitch-and-conditions'],
  }),

  // ── Pitch & Conditions ────────────────────────────────────────────────────
  topic(
    'pitch-preparation',
    'Pitch Preparation',
    'pitch-and-conditions',
    'standard',
    'intermediate',
  ),
  topic('grass-cover', 'Grass Cover', 'pitch-and-conditions', 'standard', 'intermediate'),
  topic('moisture', 'Moisture', 'pitch-and-conditions', 'standard', 'intermediate'),
  topic('cracks', 'Cracks', 'pitch-and-conditions', 'standard', 'intermediate'),
  topic(
    'pitch-deterioration',
    'Pitch Deterioration',
    'pitch-and-conditions',
    'standard',
    'advanced',
  ),
  topic('bounce', 'Bounce', 'pitch-and-conditions', 'definition', 'beginner'),
  topic('carry', 'Carry', 'pitch-and-conditions', 'definition', 'intermediate'),
  topic('seam-movement', 'Seam Movement', 'pitch-and-conditions', 'standard', 'intermediate', {
    alsoIn: ['pace-bowling'],
  }),
  topic('swing-conditions', 'Swing Conditions', 'pitch-and-conditions', 'standard', 'advanced', {
    alsoIn: ['pace-bowling'],
  }),
  topic(
    'spin-friendly-pitch',
    'Spin-friendly Pitch',
    'pitch-and-conditions',
    'standard',
    'intermediate',
  ),
  topic(
    'batting-friendly-pitch',
    'Batting-friendly Pitch',
    'pitch-and-conditions',
    'standard',
    'intermediate',
  ),
  topic('dew', 'Dew', 'pitch-and-conditions', 'standard', 'intermediate', {
    alsoIn: ['limited-overs-concepts'],
  }),
  topic('humidity', 'Humidity', 'pitch-and-conditions', 'standard', 'advanced'),
  topic('cloud-cover', 'Cloud Cover', 'pitch-and-conditions', 'standard', 'advanced'),
  topic('outfield', 'Outfield', 'pitch-and-conditions', 'definition', 'beginner'),
  topic('fast-outfield', 'Fast Outfield', 'pitch-and-conditions', 'definition', 'intermediate'),
  topic('slow-outfield', 'Slow Outfield', 'pitch-and-conditions', 'definition', 'intermediate'),

  // ── Scoring & Scorecards ──────────────────────────────────────────────────
  topic(
    'how-to-read-a-cricket-score',
    'How to Read a Cricket Score',
    'scoring-and-scorecards',
    'standard',
    'beginner',
  ),
  topic('team-score', 'Team Score', 'scoring-and-scorecards', 'definition', 'beginner'),
  topic('wickets-lost', 'Wickets Lost', 'scoring-and-scorecards', 'definition', 'beginner'),
  topic('overs-notation', 'Overs Notation', 'scoring-and-scorecards', 'definition', 'beginner'),
  topic('batting-scorecard', 'Batting Scorecard', 'scoring-and-scorecards', 'standard', 'beginner'),
  topic('bowling-scorecard', 'Bowling Scorecard', 'scoring-and-scorecards', 'standard', 'beginner'),
  topic('extras', 'Extras', 'scoring-and-scorecards', 'definition', 'beginner', {
    alsoIn: ['laws-and-rules'],
  }),
  topic('run-rate', 'Run Rate', 'scoring-and-scorecards', 'statistic', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic(
    'fall-of-wickets',
    'Fall of Wickets',
    'scoring-and-scorecards',
    'definition',
    'intermediate',
  ),
  topic('maiden-over', 'Maiden Over', 'scoring-and-scorecards', 'definition', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('dot-ball', 'Dot Ball', 'scoring-and-scorecards', 'definition', 'beginner', {
    alsoIn: ['statistics-and-analytics'],
  }),
  topic('boundary-count', 'Boundary Count', 'scoring-and-scorecards', 'definition', 'intermediate'),

  // ── Statistics & Analytics ────────────────────────────────────────────────
  topic('batting-average', 'Batting Average', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('strike-rate', 'Strike Rate', 'statistics-and-analytics', 'statistic', 'beginner', {
    aliases: ['Batting Strike Rate'],
  }),
  topic('balls-faced', 'Balls Faced', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('highest-score', 'Highest Score', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('not-out', 'Not Out', 'statistics-and-analytics', 'definition', 'beginner'),
  topic('duck', 'Duck', 'statistics-and-analytics', 'definition', 'beginner', {
    alsoIn: ['terminology'],
  }),
  topic('fifty', 'Fifty', 'statistics-and-analytics', 'definition', 'beginner', {
    alsoIn: ['terminology'],
    aliases: ['Half-century'],
  }),
  topic('hundred', 'Hundred', 'statistics-and-analytics', 'definition', 'beginner', {
    alsoIn: ['terminology'],
    aliases: ['Century', 'Ton'],
  }),
  topic(
    'boundary-percentage',
    'Boundary Percentage',
    'statistics-and-analytics',
    'statistic',
    'advanced',
  ),
  topic('wickets', 'Wickets', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('bowling-average', 'Bowling Average', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('economy-rate', 'Economy Rate', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic(
    'bowling-strike-rate',
    'Bowling Strike Rate',
    'statistics-and-analytics',
    'statistic',
    'intermediate',
  ),
  topic('maidens', 'Maidens', 'statistics-and-analytics', 'statistic', 'intermediate'),
  topic(
    'five-wicket-haul',
    'Five-wicket Haul',
    'statistics-and-analytics',
    'definition',
    'beginner',
    {
      alsoIn: ['terminology'],
      aliases: ['Five-for', 'Fifer'],
    },
  ),
  topic(
    'ten-wicket-match-haul',
    'Ten-wicket Match Haul',
    'statistics-and-analytics',
    'definition',
    'intermediate',
    {
      alsoIn: ['terminology'],
      aliases: ['Ten-for'],
    },
  ),
  topic('catches-statistic', 'Catches', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('stumpings-statistic', 'Stumpings', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic('run-outs-statistic', 'Run Outs', 'statistics-and-analytics', 'statistic', 'beginner'),
  topic(
    'dot-ball-percentage',
    'Dot-ball Percentage',
    'statistics-and-analytics',
    'statistic',
    'advanced',
  ),
  topic(
    'control-percentage',
    'Control Percentage',
    'statistics-and-analytics',
    'statistic',
    'advanced',
  ),
  topic(
    'false-shot-percentage',
    'False-shot Percentage',
    'statistics-and-analytics',
    'statistic',
    'advanced',
  ),
  topic('phase-splits', 'Phase Splits', 'statistics-and-analytics', 'statistic', 'advanced'),

  // ── Officials & Technology ────────────────────────────────────────────────
  topic('on-field-umpire', 'On-field Umpire', 'officials-and-technology', 'standard', 'beginner'),
  topic('third-umpire', 'Third Umpire', 'officials-and-technology', 'standard', 'beginner', {
    aliases: ['TV Umpire'],
  }),
  topic('match-referee', 'Match Referee', 'officials-and-technology', 'standard', 'intermediate', {
    ruleSensitive: true,
  }),
  topic('drs', 'Decision Review System', 'officials-and-technology', 'technology', 'intermediate', {
    alsoIn: ['laws-and-rules'],
    aliases: ['DRS', 'Review System'],
    ruleSensitive: true,
  }),
  topic('umpires-call', "Umpire's Call", 'officials-and-technology', 'technology', 'intermediate', {
    ruleSensitive: true,
  }),
  topic(
    'ball-tracking',
    'Ball Tracking',
    'officials-and-technology',
    'technology',
    'intermediate',
    {
      ruleSensitive: true,
    },
  ),
  topic(
    'edge-detection',
    'Edge Detection',
    'officials-and-technology',
    'technology',
    'intermediate',
    {
      aliases: ['UltraEdge', 'Snickometer', 'Snicko'],
      ruleSensitive: true,
    },
  ),
  topic(
    'thermal-imaging',
    'Thermal Imaging',
    'officials-and-technology',
    'technology',
    'advanced',
    {
      aliases: ['Hot Spot'],
      ruleSensitive: true,
    },
  ),
  topic(
    'no-ball-technology',
    'No-ball Technology',
    'officials-and-technology',
    'technology',
    'intermediate',
    {
      ruleSensitive: true,
    },
  ),
  topic(
    'run-out-review',
    'Run-out Review',
    'officials-and-technology',
    'technology',
    'intermediate',
    {
      ruleSensitive: true,
    },
  ),
  topic(
    'stumping-review',
    'Stumping Review',
    'officials-and-technology',
    'technology',
    'intermediate',
    {
      ruleSensitive: true,
    },
  ),

  // ── Equipment ─────────────────────────────────────────────────────────────
  topic('cricket-bat', 'Cricket Bat', 'equipment', 'standard', 'beginner', { ruleSensitive: true }),
  topic('cricket-ball', 'Cricket Ball', 'equipment', 'standard', 'beginner', {
    ruleSensitive: true,
  }),
  topic('red-ball', 'Red Ball', 'equipment', 'definition', 'beginner', {
    alsoIn: ['red-ball-concepts'],
  }),
  topic('white-ball', 'White Ball', 'equipment', 'definition', 'beginner', {
    alsoIn: ['limited-overs-concepts'],
  }),
  topic('pink-ball', 'Pink Ball', 'equipment', 'definition', 'intermediate'),
  topic('stumps', 'Stumps', 'equipment', 'definition', 'beginner'),
  topic('bails', 'Bails', 'equipment', 'definition', 'beginner'),
  topic('batting-pads', 'Batting Pads', 'equipment', 'definition', 'beginner'),
  topic('batting-gloves', 'Gloves', 'equipment', 'definition', 'beginner'),
  topic('helmet', 'Helmet', 'equipment', 'definition', 'beginner'),
  topic('thigh-pad', 'Thigh Pad', 'equipment', 'definition', 'beginner'),
  topic('abdominal-guard', 'Abdominal Guard', 'equipment', 'definition', 'beginner'),
  topic('wicketkeeping-gloves', 'Wicketkeeping Gloves', 'equipment', 'definition', 'beginner'),
  topic('spikes', 'Spikes', 'equipment', 'definition', 'beginner'),

  // ── Terminology ───────────────────────────────────────────────────────────
  topic('golden-duck', 'Golden Duck', 'terminology', 'definition', 'beginner'),
  topic('diamond-duck', 'Diamond Duck', 'terminology', 'definition', 'intermediate'),
  topic('pair', 'Pair', 'terminology', 'definition', 'intermediate'),
  topic('king-pair', 'King Pair', 'terminology', 'definition', 'advanced'),
  topic('double-century', 'Double Century', 'terminology', 'definition', 'beginner'),
  topic('hat-trick', 'Hat-trick', 'terminology', 'definition', 'beginner'),
  topic('bunny', 'Bunny', 'terminology', 'definition', 'intermediate', { aliases: ['Rabbit'] }),
  topic('tail', 'The Tail', 'terminology', 'definition', 'beginner'),
  topic('sledging', 'Sledging', 'terminology', 'definition', 'intermediate'),
  topic('jaffa', 'Jaffa', 'terminology', 'definition', 'beginner', { aliases: ['Peach'] }),
  topic('beamer', 'Beamer', 'terminology', 'definition', 'intermediate', {
    alsoIn: ['laws-and-rules'],
    aliases: ['Beam Ball'],
    ruleSensitive: true,
  }),
  topic('dolly', 'Dolly', 'terminology', 'definition', 'beginner'),
  topic('edge', 'Edge', 'terminology', 'definition', 'beginner', { aliases: ['Nick'] }),
  topic('inside-edge', 'Inside Edge', 'terminology', 'definition', 'beginner'),
  topic('outside-edge', 'Outside Edge', 'terminology', 'definition', 'beginner'),
  topic('french-cut', 'French Cut', 'terminology', 'definition', 'intermediate'),
  topic('nervous-nineties', 'Nervous Nineties', 'terminology', 'definition', 'beginner'),
  topic('nelson', 'Nelson', 'terminology', 'definition', 'intermediate'),
  topic(
    'corridor-of-uncertainty',
    'Corridor of Uncertainty',
    'terminology',
    'definition',
    'intermediate',
    {
      alsoIn: ['pace-bowling'],
    },
  ),
  topic('carrying-the-bat', 'Carrying the Bat', 'terminology', 'definition', 'intermediate'),
  topic(
    'playing-for-the-turn',
    'Playing for the Turn',
    'terminology',
    'definition',
    'intermediate',
    {
      alsoIn: ['batting'],
    },
  ),
  topic('through-the-gate', 'Through the Gate', 'terminology', 'definition', 'beginner'),
];
