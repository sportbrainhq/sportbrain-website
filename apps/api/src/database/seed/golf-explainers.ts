import { courseFeature, definition, scoringTerm, standard } from './golf-explainer-helpers';
import type { ExplainerSeed, HoleShape, ScorecardShape, SourceSeed } from './explainer-types';

/**
 * The written golf explainers: start here, scoring and the course.
 *
 * These override the taxonomy placeholders in `golf-explainer-taxonomy.ts` by
 * slug. Anything left as a placeholder stays a draft and never reaches the site.
 * The rest of the written library lives in five supplementary files, split by
 * subject rather than by size: `golf-clubs-and-shots.ts`, `golf-swing-and-short-game.ts`,
 * `golf-handicaps-and-formats.ts`, `golf-rules-and-relief.ts` and
 * `golf-strategy-and-stats.ts`.
 *
 * ## One concept, one page
 *
 * The rule this library is built around, and golf tests it harder than any
 * sport so far. "Slope Rating" is a property of a golf course and an input to a
 * handicap calculation. "Bunker" is a part of the ground, a shot, and a set of
 * rules about what you may touch. "Lay-up" is a shot and a strategy. None of
 * those justifies two pages: they would agree on most of their sentences,
 * disagree on one, and a reader searching "slope rating" would have to guess
 * which of two articles they wanted before reading either.
 *
 * So each concept is one row with one canonical URL, appearing in as many
 * categories as it belongs to through `alsoIn`. The unique index on
 * (sport_id, slug) makes that a guarantee rather than a convention.
 *
 * ## On stroke play and match play
 *
 * Golf's `format_differences` carries the weight `rule_differences` carries in
 * basketball, and for a sharper reason: the two formats do not merely score
 * differently, they change which decisions are correct. A conceded putt does not
 * exist in stroke play. A triple bogey is a disaster in one and costs exactly
 * one hole in the other. An explainer about risk that describes only stroke play
 * is not incomplete, it is wrong half the time, so where the difference bites
 * the section is not optional.
 *
 * ## On sourcing
 *
 * Facts come from the governing bodies where the question is "what is the rule":
 * the Rules of Golf, published jointly by the R&A and the USGA, and the Rules of
 * Handicapping under the World Handicap System. Tour statistics definitions come
 * from the tours. Wikipedia is used for history and background only.
 *
 * The prose is SportBrainHQ's own throughout. A rulebook's expression is not
 * ours to reuse, and paraphrasing a Rule badly is worse than not citing it: the
 * relief procedures below describe the shape of each rule and tell the reader to
 * check the Rule itself for the exact wording, which is what a page that might
 * cost somebody a penalty stroke owes them.
 *
 * Anything written against the Rules carries `ruleSensitive: true` and a
 * `sourceRevision`, so the set to re-audit after a revision is a query rather
 * than a reading of every article.
 *
 * ## On numbers that move
 *
 * Prize funds, FedExCup bonus figures, world ranking point allocations and the
 * exact number of exempt places on a tour are deliberately absent. They are
 * revised most seasons, and a number baked into prose is wrong within a year
 * with nothing to flag it. The mechanisms are explained; the current figures
 * belong in data with an as-of date, not in an article.
 */

export const GOLF_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'rules-of-golf',
    provider: 'randa',
    title: 'The Rules of Golf',
    url: 'https://www.randa.org/rog',
    license: 'R&A / USGA',
  },
  {
    key: 'usga-rules',
    provider: 'usga',
    title: 'USGA: Rules of Golf',
    url: 'https://www.usga.org/rules.html',
    license: 'USGA',
  },
  {
    key: 'rules-of-handicapping',
    provider: 'usga',
    title: 'Rules of Handicapping: World Handicap System',
    url: 'https://www.usga.org/handicapping/roh.html',
    license: 'USGA',
  },
  {
    key: 'usga-course-rating',
    provider: 'usga',
    title: 'USGA Course Rating System',
    url: 'https://www.usga.org/course-rating.html',
    license: 'USGA',
  },
  {
    key: 'pga-tour-stats',
    provider: 'pga-tour',
    title: 'PGA Tour statistics',
    url: 'https://www.pgatour.com/stats',
    license: 'PGA Tour',
  },
  {
    key: 'owgr',
    provider: 'owgr',
    title: 'Official World Golf Ranking',
    url: 'https://www.owgr.com/',
    license: 'OWGR',
  },
  {
    key: 'rolex-rankings',
    provider: 'rolex-rankings',
    title: 'Rolex Women’s World Golf Rankings',
    url: 'https://www.rolexrankings.com/',
    license: 'Rolex Rankings',
  },
  {
    key: 'wp-golf',
    provider: 'wikipedia',
    title: 'Golf',
    url: 'https://en.wikipedia.org/wiki/Golf',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-par',
    provider: 'wikipedia',
    title: 'Par (score)',
    url: 'https://en.wikipedia.org/wiki/Par_(score)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-golf-course',
    provider: 'wikipedia',
    title: 'Golf course',
    url: 'https://en.wikipedia.org/wiki/Golf_course',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-handicap',
    provider: 'wikipedia',
    title: 'Handicap (golf)',
    url: 'https://en.wikipedia.org/wiki/Handicap_(golf)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-match-play',
    provider: 'wikipedia',
    title: 'Match play',
    url: 'https://en.wikipedia.org/wiki/Match_play',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-strokes-gained',
    provider: 'wikipedia',
    title: 'Strokes gained',
    url: 'https://en.wikipedia.org/wiki/Strokes_gained',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-major-championships',
    provider: 'wikipedia',
    title: 'Men’s major golf championships',
    url: 'https://en.wikipedia.org/wiki/Men%27s_major_golf_championships',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-links',
    provider: 'wikipedia',
    title: 'Links (golf)',
    url: 'https://en.wikipedia.org/wiki/Links_(golf)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-golf-club',
    provider: 'wikipedia',
    title: 'Golf club (equipment)',
    url: 'https://en.wikipedia.org/wiki/Golf_club',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-golf-ball',
    provider: 'wikipedia',
    title: 'Golf ball',
    url: 'https://en.wikipedia.org/wiki/Golf_ball',
    license: 'CC BY-SA 4.0',
  },
];

/** The Rules edition every rule-sensitive golf explainer is written against. */
export const GOLF_RULES_REVISION = 'Rules of Golf, 2023 edition (R&A / USGA)';
export const GOLF_RULES_REVIEWED = '2026-08-31';

const RULES = [{ key: 'rules-of-golf' }];
const GENERAL = [{ key: 'wp-golf' }];
const COURSE = [{ key: 'wp-golf-course' }];

/* ────────────────────────────────────────────────────────────────────────────
 * Diagrams
 *
 * A par 4 drawn once and reused, because the same corridor of ground carries
 * the tee box, the fairway, the rough, the green and half the strategy
 * explainers, and redrawing it per page would guarantee that "the rough" is a
 * different width in two articles that link to each other.
 * ────────────────────────────────────────────────────────────────────────── */

/** The generic par 4: tee at the bottom, green at the top, trouble on the right. */
const PAR_4: HoleShape = {
  hole: 'plan',
  par: 4,
  length: '410 yards',
  features: [
    {
      kind: 'rough',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      label: 'Rough',
    },
    {
      kind: 'fairway',
      points: [
        { x: 34, y: 8 },
        { x: 66, y: 8 },
        { x: 72, y: 45 },
        { x: 70, y: 75 },
        { x: 42, y: 78 },
        { x: 32, y: 45 },
      ],
      label: 'Fairway',
    },
    {
      kind: 'tee',
      points: [
        { x: 42, y: 2 },
        { x: 58, y: 2 },
        { x: 58, y: 8 },
        { x: 42, y: 8 },
      ],
      label: 'Tee box',
    },
    {
      kind: 'bunker',
      points: [
        { x: 70, y: 38 },
        { x: 80, y: 40 },
        { x: 79, y: 49 },
        { x: 69, y: 47 },
      ],
      label: 'Fairway bunker',
    },
    {
      kind: 'trees',
      points: [
        { x: 0, y: 30 },
        { x: 24, y: 34 },
        { x: 22, y: 62 },
        { x: 0, y: 60 },
      ],
      label: 'Trees',
    },
    {
      kind: 'fringe',
      points: [
        { x: 38, y: 78 },
        { x: 74, y: 78 },
        { x: 76, y: 97 },
        { x: 36, y: 97 },
      ],
      label: 'Fringe',
    },
    {
      kind: 'green',
      points: [
        { x: 41, y: 81 },
        { x: 71, y: 81 },
        { x: 73, y: 94 },
        { x: 39, y: 94 },
      ],
      label: 'Green',
    },
    {
      kind: 'bunker',
      points: [
        { x: 28, y: 80 },
        { x: 38, y: 82 },
        { x: 37, y: 91 },
        { x: 27, y: 89 },
      ],
      label: 'Greenside bunker',
    },
  ],
  steps: [
    {
      caption:
        'The tee shot is played from the teeing area to the fairway. The second shot, the approach, is played to the green, where the ball is putted into the hole.',
      note: 'Par 4, 410 yards',
      shots: [
        { kind: 'drive', fromX: 50, fromY: 6, toX: 52, toY: 46, label: 'Tee shot' },
        { kind: 'approach', fromX: 52, fromY: 46, toX: 57, toY: 87, label: 'Approach' },
        { kind: 'putt', fromX: 57, fromY: 87, toX: 56, toY: 89 },
      ],
      markers: [
        { x: 50, y: 5, label: 'Tee', kind: 'tee' },
        { x: 56, y: 89, label: 'Hole', kind: 'pin' },
      ],
    },
  ],
  caption:
    'A par 4 seen from behind the tee. The hole is played from the bottom of the drawing to the top.',
};

/** A par 3: one shot to the green, and nowhere to hide. */
const PAR_3: HoleShape = {
  hole: 'plan',
  par: 3,
  length: '165 yards',
  features: [
    {
      kind: 'rough',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      label: 'Rough',
    },
    {
      kind: 'water',
      points: [
        { x: 20, y: 30 },
        { x: 80, y: 30 },
        { x: 80, y: 62 },
        { x: 20, y: 62 },
      ],
      label: 'Penalty area',
    },
    {
      kind: 'tee',
      points: [
        { x: 42, y: 6 },
        { x: 58, y: 6 },
        { x: 58, y: 14 },
        { x: 42, y: 14 },
      ],
      label: 'Tee box',
    },
    {
      kind: 'fringe',
      points: [
        { x: 30, y: 64 },
        { x: 76, y: 64 },
        { x: 78, y: 94 },
        { x: 28, y: 94 },
      ],
      label: 'Fringe',
    },
    {
      kind: 'green',
      points: [
        { x: 34, y: 67 },
        { x: 72, y: 67 },
        { x: 74, y: 91 },
        { x: 32, y: 91 },
      ],
      label: 'Green',
    },
    {
      kind: 'bunker',
      points: [
        { x: 74, y: 70 },
        { x: 86, y: 72 },
        { x: 85, y: 84 },
        { x: 73, y: 82 },
      ],
      label: 'Greenside bunker',
    },
  ],
  steps: [
    {
      caption:
        'A par 3 is reachable from the tee, so the tee shot is the approach shot. Par means one shot to the green and two putts.',
      note: 'Par 3, 165 yards',
      shots: [{ kind: 'approach', fromX: 50, fromY: 12, toX: 53, toY: 79, label: 'Tee shot' }],
      markers: [
        { x: 50, y: 10, label: 'Tee', kind: 'tee' },
        { x: 53, y: 80, label: 'Hole', kind: 'pin' },
        { x: 50, y: 46, label: 'Carry the water', kind: 'trouble' },
      ],
    },
  ],
  caption: 'A par 3 over a penalty area. One shot to the green, and no second chance to advance.',
};

/** The dogleg, and the argument every risk-reward hole is making. */
const DOGLEG: HoleShape = {
  hole: 'plan',
  par: 4,
  length: '390 yards',
  features: [
    {
      kind: 'rough',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      label: 'Rough',
    },
    {
      kind: 'fairway',
      points: [
        { x: 36, y: 6 },
        { x: 62, y: 6 },
        { x: 66, y: 40 },
        { x: 78, y: 56 },
        { x: 76, y: 76 },
        { x: 52, y: 74 },
        { x: 44, y: 52 },
        { x: 34, y: 34 },
      ],
      label: 'Fairway',
    },
    {
      kind: 'tee',
      points: [
        { x: 42, y: 2 },
        { x: 56, y: 2 },
        { x: 56, y: 7 },
        { x: 42, y: 7 },
      ],
      label: 'Tee box',
    },
    {
      kind: 'trees',
      points: [
        { x: 64, y: 12 },
        { x: 96, y: 14 },
        { x: 96, y: 48 },
        { x: 68, y: 44 },
      ],
      label: 'Trees on the inside of the dogleg',
    },
    {
      kind: 'bunker',
      points: [
        { x: 60, y: 44 },
        { x: 70, y: 47 },
        { x: 68, y: 56 },
        { x: 58, y: 53 },
      ],
      label: 'Corner bunker',
    },
    {
      kind: 'green',
      points: [
        { x: 54, y: 78 },
        { x: 78, y: 79 },
        { x: 79, y: 93 },
        { x: 53, y: 92 },
      ],
      label: 'Green',
    },
  ],
  steps: [
    {
      caption:
        'The safe line plays out to the wide part of the fairway and leaves a long second shot. The aggressive line cuts the corner over the trees, and leaves a wedge if it comes off.',
      note: 'Dogleg right, par 4',
      shots: [
        {
          kind: 'drive',
          fromX: 49,
          fromY: 5,
          toX: 44,
          toY: 44,
          label: 'Safe line',
          curve: 'straight',
        },
        {
          kind: 'drive',
          fromX: 49,
          fromY: 5,
          toX: 72,
          toY: 58,
          label: 'Aggressive line',
          curve: 'fade',
          ghost: true,
        },
      ],
      markers: [
        { x: 49, y: 4, label: 'Tee', kind: 'tee' },
        { x: 66, y: 93, label: 'Hole', kind: 'pin' },
        { x: 80, y: 30, label: 'Must carry the trees', kind: 'trouble' },
      ],
    },
  ],
  caption:
    'A dogleg right. The hole bends, so the shortest line to the green is not down the fairway.',
};

/** A worked front nine, used by the scoring explainers. */
const NINE_HOLE_CARD: ScorecardShape = {
  holes: [
    { number: 1, par: 4, strokeIndex: 7, yards: 402 },
    { number: 2, par: 5, strokeIndex: 13, yards: 511 },
    { number: 3, par: 3, strokeIndex: 17, yards: 168 },
    { number: 4, par: 4, strokeIndex: 1, yards: 448 },
    { number: 5, par: 4, strokeIndex: 11, yards: 385 },
    { number: 6, par: 3, strokeIndex: 15, yards: 152 },
    { number: 7, par: 5, strokeIndex: 5, yards: 534 },
    { number: 8, par: 4, strokeIndex: 3, yards: 431 },
    { number: 9, par: 4, strokeIndex: 9, yards: 396 },
  ],
  rows: [
    {
      name: 'The round below',
      strokes: [4, 4, 3, 6, 4, 2, 5, 5, 4],
      highlight: true,
    },
  ],
  caption: 'Nine holes of par 36, played in 37 strokes: one over par.',
  notes: [
    { label: 'Hole 2', explanation: 'Four on a par 5 is a birdie: one under par.' },
    { label: 'Hole 4', explanation: 'Six on a par 4 is a double bogey: two over par.' },
    { label: 'Hole 6', explanation: 'Two on a par 3 is a birdie.' },
    {
      label: 'Total',
      explanation:
        'Thirty-seven strokes against a par of 36. The score is written as +1, never as 37, on a leaderboard.',
    },
  ],
};

export const GOLF_EXPLAINERS: ExplainerSeed[] = [
  // ══ Start here ═════════════════════════════════════════════════════════════
  standard({
    slug: 'golf-in-5-minutes',
    title: 'Golf in 5 Minutes',
    category: 'start-here',
    aliases: ['golf in 5 minutes', 'golf basics', 'golf for beginners', 'introduction to golf'],
    summary: 'Everything you need to follow a round of golf, in the order you need it.',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    sourceKeys: GENERAL,
    explanation: `Golf is a game of fewest strokes. You hit a ball from a starting point into a hole in the ground, and the number of times you hit it is your score. Do that eighteen times, add up the strokes, and the lowest total wins.

That is the whole sport. Everything else is detail about the ground, the equipment and the etiquette.`,
    howItWorks: `A course has 18 **holes**, each one a separate journey from a **tee box** to a **green** with a hole cut in it. A hole is typically between 100 and 600 yards long.

Each hole has a **par**: the number of strokes a very good player would need. Par 3, par 4 and par 5 are the three you will see. Add up the pars and you get the course's par, almost always 70, 71 or 72.

Your score is reported against par rather than as a raw number. One under par on a hole is a **birdie**, one over is a **bogey**. A player who is "4 under" has taken four fewer strokes than par across everything they have played.

Players carry up to fourteen **clubs**, each hitting the ball a different distance. A driver goes furthest and is used off the tee; wedges go shortest and highest, for shots near the green; a putter rolls the ball on the green.

The ball is played from wherever it comes to rest, good lie or bad. If it goes somewhere unplayable, into water or out of bounds, there are **penalty strokes** and a defined way to get back in play.`,
    example: `A 410-yard par 4. You hit a driver from the tee 250 yards into the fairway. You hit an iron 160 yards onto the green. You putt from 25 feet to within two feet, then tap it in.

That is four strokes on a par 4: a par. Had the first putt gone in, three strokes, a birdie. Had you needed three putts, five strokes, a bogey.`,
    whyItMatters: `The scoring convention is why golf leaderboards look inverted to a newcomer: the leader is at the top with the most negative number. **-12** is better than **-4**, and **+3** means three worse than a scratch effort.

It is also why golf is the rare sport where an amateur and a professional can compete: the **handicap** system deducts strokes according to how good you are, so a net score is comparable across abilities.`,
    misunderstandings: `**Golf is not scored in points.** There is no scoring "up". Every stroke is a cost, and the object is to take as few as possible.

**Par is not a target for you.** It is the standard for an expert playing well. A new golfer shooting 100 on a par-72 course is playing normally, not badly.

**The lowest number wins, but the biggest hitter does not.** Driving distance is one of several skills, and the player who hits it furthest is very often not the player who scores best.`,
    takeaways: `- Fewest strokes wins. Every stroke counts, from a 300-yard drive to a two-inch tap-in.
- Scores are quoted against par, and negative is good.
- 18 holes, each with a par of 3, 4 or 5; a course is usually par 70 to 72.
- Up to fourteen clubs, each for a different distance and trajectory.
- Play the ball as it lies; penalties exist for when you cannot.`,
    related: [
      'how-golf-works',
      'par',
      'golf-scoring-explained',
      'golf-course-explained',
      'golf-clubs-explained',
      'reading-a-leaderboard',
    ],
  }),

  standard({
    slug: 'how-golf-works',
    title: 'How Golf Works',
    category: 'start-here',
    aliases: ['how golf works', 'how to play golf', 'rules of golf basics'],
    summary: 'The mechanics of a round: playing a hole, playing in order, and keeping score.',
    isStartHere: true,
    order: 20,
    readMinutes: 6,
    sourceKeys: [...RULES, ...GENERAL],
    ruleSensitive: true,
    sourceRevision: GOLF_RULES_REVISION,
    lastReviewedAt: GOLF_RULES_REVIEWED,
    explanation: `A round of golf is eighteen small contests played in sequence. On each one, you put your ball into the hole in as few strokes as possible, then walk to the next tee and start again.

There is no clock, no opponent to stop you, and no way to lose the ball to the other side. Golf is unusual in that your opponent cannot interfere with you at all: they can only post a number.`,
    howItWorks: `**Starting a hole.** Every player plays their first stroke from the teeing area, a marked rectangle. The ball may be placed on a tee peg here, and only here.

**Playing the hole.** After the tee shot, the ball is played from where it lies. The player whose ball is furthest from the hole plays next, so the group leapfrogs its way down the hole. That order is a rule in match play and a convention in stroke play, where "ready golf" is now encouraged instead.

**On the green.** Once on the putting green, the ball may be marked, lifted, cleaned and replaced. The flagstick may be left in or removed. Putts are holed out unless an opponent concedes one, which is possible only in match play.

**Finishing.** The hole ends when the ball is at rest in the hole. Write down the strokes taken, including any penalty strokes, and move on.

**The round.** Repeat eighteen times. The total is your gross score. If you are playing off a handicap, strokes are deducted to give a net score.`,
    example: `Hole 7, a par 5. You take three shots to reach the front of the green, then three putts. Six strokes: a bogey.

Your playing partner drives into a penalty area, takes a penalty drop, and reaches the green in four before two putting. Seven strokes, including one penalty stroke: a double bogey.`,
    whyItMatters: `Because the ball is played as it lies and the order of play follows the ball, golf's difficulty is largely self-inflicted. A poor shot does not merely fail to advance you: it leaves you a harder next shot, from a worse lie, at a worse angle.

This compounding is the reason course management is a genuine skill rather than a commentary cliché, and why professionals so often aim away from the flag.`,
    misunderstandings: `**You do not have to use every club.** Fourteen is a maximum, not a requirement. Beginners are usually better served by fewer.

**There is no goalkeeper, and no defence.** Nobody can stop your ball. The difficulty is entirely between you, the ground and the weather.

**A stroke is any intentional attempt to strike the ball,** including one that misses it completely. A practice swing is not a stroke; a swing at the ball that whiffs is.`,
    related: [
      'golf-in-5-minutes',
      'how-you-win-in-golf',
      'golf-scoring-explained',
      'play-it-as-it-lies',
      'honours-on-the-tee',
      'ready-golf',
    ],
  }),

  standard({
    slug: 'how-you-win-in-golf',
    title: 'How Do You Win in Golf?',
    category: 'start-here',
    alsoIn: ['scoring'],
    aliases: ['how do you win in golf', 'how to win golf', 'winning at golf'],
    summary:
      'By taking fewer strokes than everyone else, or by winning more individual holes than your opponent.',
    isStartHere: true,
    order: 30,
    sourceKeys: [...RULES, { key: 'wp-match-play' }],
    ruleSensitive: true,
    sourceRevision: GOLF_RULES_REVISION,
    lastReviewedAt: GOLF_RULES_REVIEWED,
    explanation: `There are two ways to win, and they are different games played with the same equipment.

In **stroke play**, everybody counts every stroke for the whole round and the lowest total wins. In **match play**, you play against one opponent hole by hole: whoever takes fewer strokes on a hole wins that hole, and whoever wins more holes wins the match.`,
    howItWorks: `**Stroke play.** Add up every stroke and every penalty over 18 holes, or over 72 holes in a professional tournament. The lowest total wins. If two players tie, there is a playoff.

**Match play.** Each hole is a separate contest worth exactly one point. Take five to your opponent's four and you lose the hole, whether their four came from a chip-in or your five came from three putts. Win the hole and you go "1 up".

A match ends as soon as one player leads by more holes than remain. Leading by three with two to play means the match is over: that is a **3 & 2** win. It does not need to reach the 18th.

**Net scoring.** In club golf, both formats can be played net, with handicap strokes deducted, so players of different standards compete on the same card.`,
    example: `Two players go round in 74 and 76. In stroke play, the 74 wins by two strokes.

Now suppose the 76 was made of eleven holes won, six holes lost and one halved, with one calamitous 10 on the other card's best hole. In match play, the player who shot 76 wins comfortably, because the 10 cost their opponent exactly one hole.`,
    whyItMatters: `The format decides which risks are correct. In stroke play, a disaster hole ruins a round, so the sensible play is usually the conservative one. In match play, the worst possible outcome on any hole is losing that one hole, which makes aggression cheap.

That is why the Ryder Cup looks like a different sport from a regular tour event. It is.`,
    misunderstandings: `**Winning the most holes is not the same as the lowest score.** A player can shoot a higher total and win the match comfortably.

**"3 & 2" is not a score of three to two.** It means three holes ahead with two left to play.

**A tie is not always broken.** Professional stroke play goes to a playoff, but a match can be halved, and in team events a halved match is worth half a point to each side.`,
    related: [
      'stroke-play',
      'match-play',
      'stroke-play-vs-match-play',
      'two-and-one',
      'golf-scoring-explained',
      'gross-vs-net-score',
    ],
  }),

  courseFeature({
    slug: 'how-a-golf-course-works',
    title: 'How a Golf Course Works',
    category: 'start-here',
    alsoIn: ['the-course'],
    aliases: ['how a golf course works', 'golf course layout', 'parts of a golf course'],
    summary: 'Eighteen holes, each a corridor of ground running from a tee box to a green.',
    isStartHere: true,
    order: 40,
    readMinutes: 5,
    sourceKeys: COURSE,
    whereItIs: `A golf course is a piece of land divided into eighteen holes, played in a fixed order. Each hole is a corridor: a **tee box** at one end, a **green** with the hole cut in it at the other, and between them a mown **fairway** flanked by longer **rough**.

Scattered through that corridor is trouble the architect put there on purpose: **bunkers** filled with sand, **penalty areas** holding water, trees, and the boundary of the property, which is **out of bounds**.`,
    howItPlays: `The hole is played from the tee towards the green. On a **par 4** that is a tee shot, an approach shot and two putts. A **par 3** is short enough to reach from the tee; a **par 5** takes three shots for most players.

The fairway is cut short so the ball sits up and is easy to strike. The rough is longer, so the ball sits down, the club catches grass before the ball, and the shot flies shorter and with less control. That difference is the entire reason accuracy off the tee is worth anything.

Around the green is a band of intermediate grass called the **fringe** or apron. The green itself is cut extremely short and rolls fast.`,
    strategy: `Where you are on the fairway matters as much as how far you have gone. A hole is designed so that one side offers a better angle into the green than the other, usually the side guarded by the more intimidating hazard.

That is why professionals so often hit less than driver from the tee, and why a 240-yard drive in the correct half of the fairway can be a better shot than a 300-yard drive on the wrong side.`,
    diagram: PAR_4,
    misunderstandings: `**Holes are not all the same shape.** A dogleg bends, so the shortest route to the green is not down the middle of the fairway.

**The "hole" is both things.** It means the 4.25-inch cup in the green and the whole stretch of ground you play to get there. Context disambiguates it and nobody ever explains this.

**Yardage is measured along the intended line of play,** not in a straight line from tee to green, which is why a dogleg's card yardage looks longer than it looks from the tee.`,
    related: ['golf-course-explained', 'fairway', 'green', 'rough', 'par-4-hole', 'dogleg'],
  }),

  standard({
    slug: 'what-are-18-holes',
    title: 'What Are 18 Holes?',
    category: 'start-here',
    alsoIn: ['the-course'],
    aliases: ['what are 18 holes', '18 holes', 'why 18 holes', 'eighteen holes'],
    summary: 'A full round is eighteen separate holes played in order, out and back.',
    order: 50,
    sourceKeys: COURSE,
    explanation: `A round of golf is eighteen holes. Each is its own contest from tee to cup, and they are played in a fixed numbered order.

The first nine are the **front nine** or the "out" half, historically played away from the clubhouse. The second nine are the **back nine** or "in", played back towards it.`,
    howItWorks: `The eighteen pars add up to the course's par: typically four par 3s, ten par 4s and four par 5s, which sums to 72. Par 70 and 71 courses simply shift one or two holes between the categories.

Each nine usually totals 35 or 36, and the two halves are balanced deliberately so a nine-hole round is a fair contest in itself. Many courses can be played as nine, which is a full round for handicap purposes under the World Handicap System.

Eighteen is a convention, not a law. It became standard because the Old Course at St Andrews settled on eighteen in 1764, and the rest of the golfing world followed.`,
    whyItMatters: `The number matters mostly because everything else is calibrated to it: par, handicaps, tournament rounds, and the four-round professional event that decides a major.

It also sets the shape of the drama. A back nine on a Sunday is a recognisable format precisely because everybody watching knows exactly how much is left.`,
    misunderstandings: `**Nine holes is not half a round in a lesser sense.** It is a normal, valid round, and it counts for handicap.

**The 19th hole is the bar,** not a hole. It is a joke old enough to be a fixture on every clubhouse sign.`,
    related: ['front-nine-back-nine', 'par', 'how-a-golf-course-works', 'nineteenth-hole'],
  }),

  // ══ Scoring ════════════════════════════════════════════════════════════════
  standard({
    slug: 'golf-scoring-explained',
    title: 'How Golf Scoring Works',
    category: 'scoring',
    alsoIn: ['start-here'],
    aliases: ['golf scoring', 'how golf scoring works', 'golf scores explained', 'scoring in golf'],
    summary: 'Count every stroke, compare the total to par, and quote the difference.',
    isStartHere: true,
    isFeatured: true,
    order: 100,
    readMinutes: 5,
    sourceKeys: [{ key: 'wp-par' }, ...RULES],
    explanation: `Golf scoring has two layers, and confusing them is the single most common beginner mistake.

The first layer is the **raw count**: how many times you hit the ball, plus any penalty strokes. That is your gross score, and on a scorecard it is a number like 84.

The second layer is the **comparison to par**: the same round expressed as the difference from the standard. 84 on a par-72 course is +12. This is the layer leaderboards use, and it is why a professional's score is quoted as -8 rather than 280.`,
    howItWorks: `Each hole has a par. Your score on that hole is described by how it compares:

- **Three under par** on a hole: an albatross (double eagle).
- **Two under**: an eagle.
- **One under**: a birdie.
- **Par**: level.
- **One over**: a bogey.
- **Two over**: a double bogey. Then triple, and so on.

Across a round, the differences add up. Two birdies, one bogey and fifteen pars is -1 for the round. A tournament total is simply the same arithmetic over four rounds against four times the course par.`,
    example: `The card below is a front nine of par 36 played in 37 strokes.

The player made one birdie on the 2nd, one birdie on the 6th, one double bogey on the 4th, and pars elsewhere. Two under, two over, and the round finishes at +1.`,
    whyItMatters: `Scoring against par is what makes golf comparable at all. Courses differ enormously in length and difficulty, so 71 at a short municipal course and 71 at a US Open venue are not remotely the same performance. Par is the first correction for that, Course Rating is the second, and Strokes Gained is the third.

It is also why a leaderboard is sorted with the most negative number at the top, which is the presentation that confuses every newcomer to the sport.`,
    misunderstandings: `**Penalty strokes count as strokes.** A ball hit into water, dropped, and then knocked onto the green has cost three strokes, not two.

**There is no "score" for a hole you did not finish.** In stroke play, failing to hole out means no score for the round at all, though most club competitions apply a maximum instead.

**A lower gross score does not always win.** In a net competition, handicap strokes are deducted afterwards, and the winner is frequently not the player with the lowest raw total.`,
    related: [
      'par',
      'birdie',
      'bogey',
      'reading-a-scorecard',
      'reading-a-leaderboard',
      'gross-vs-net-score',
      'penalty-stroke',
    ],
    extra: [
      {
        type: 'worked_example',
        heading: 'A worked front nine',
        structuredData: NINE_HOLE_CARD,
      },
    ],
  }),

  scoringTerm({
    slug: 'par',
    title: 'What Is Par?',
    category: 'scoring',
    alsoIn: ['start-here'],
    aliases: ['par', 'what is par', 'par in golf', 'par meaning'],
    summary: 'The number of strokes an expert golfer is expected to need on a hole.',
    isStartHere: true,
    isFeatured: true,
    order: 110,
    sourceKeys: [{ key: 'wp-par' }, { key: 'usga-course-rating' }],
    explanation: `Par is the standard for a hole: the strokes an expert player would be expected to take, assuming two putts once on the green.

So the par of a hole is really a statement about how many shots it takes to reach the green, plus two:

- **Par 3**: reachable from the tee. One shot plus two putts.
- **Par 4**: a tee shot and an approach. Two shots plus two putts.
- **Par 5**: three shots to the green, plus two putts.

Par is set mainly by length, though the committee setting it can take terrain, elevation and prevailing wind into account.`,
    example: `A 430-yard hole is a par 4. An expert hits a drive of about 280 yards, an approach of 150, and takes two putts. Four strokes.

The same 430 yards played sharply uphill into a prevailing wind might be set as a par 4 still, but it will play like a par 4 and a half, and its Stroke Index will reflect that.`,
    onTheLeaderboard: `Par is the zero point. A player level with par is shown as **E** for even, not as 0 and never as 72.

Course par is the sum of the eighteen hole pars, almost always 70, 71 or 72. A tournament's 72-hole par is four times that: 288 for a par-72 course.`,
    whyItMatters: `Everything in golf's vocabulary is defined relative to par. Birdie, bogey, eagle, "under par", the cut line, the leaderboard: none of it means anything without it.

Par is also the reason a score travels between courses at all. Sixty-eight is a good round anywhere precisely because par has already absorbed the difference between a 6,200-yard course and a 7,400-yard one.`,
    misunderstandings: `**Par is not the average score.** The average golfer does not shoot par and never will: it is a standard for expert play, and most club golfers average well over it.

**Par is not a measure of difficulty.** A brutal 480-yard par 4 is far harder than a gentle 500-yard par 5, and the par 5 has the higher number.

**Par is not fixed forever.** A committee can change a hole's par, and long par 5s are sometimes played as par 4s in major championships, which shifts the whole course par for that week.`,
    related: [
      'golf-scoring-explained',
      'birdie',
      'bogey',
      'even-par',
      'par-3-hole',
      'par-4-hole',
      'par-5-hole',
      'course-rating',
    ],
  }),

  scoringTerm({
    slug: 'birdie',
    title: 'What Is a Birdie?',
    category: 'scoring',
    aliases: ['birdie', 'what is a birdie', 'birdie in golf', 'birdie meaning'],
    summary: 'One stroke under par on a single hole.',
    isFeatured: true,
    order: 120,
    sourceKeys: [{ key: 'wp-par' }],
    explanation: `A birdie is a hole played in one stroke fewer than its par.

- Two on a par 3.
- Three on a par 4.
- Four on a par 5.

It is the standard unit of good play. A professional tournament is largely a contest in how many birdies a player can make while avoiding the mistakes that give them back.`,
    example: `On a 410-yard par 4: a drive into the fairway, an approach to twelve feet, and the putt drops. Three strokes on a par 4 is a birdie.

A birdie can arrive any number of ways. Holing a chip from off the green for a three counts exactly the same as a struck approach and a made putt.`,
    onTheLeaderboard: `Each birdie moves a player one lower against par: from E to -1, from -3 to -4. On a televised leaderboard, birdies are usually shown in red, and a circle around the number is the standard scorecard notation.`,
    whyItMatters: `Birdies are how a tournament is won, and birdie count is a real indicator of scoring capability. A player who makes seven birdies and three bogeys shoots the same 68 as one who makes four birdies and no bogeys, but they are describing very different games, and the first will usually be the better bet on a soft, scoreable course.`,
    misunderstandings: `**A birdie is not a good shot.** It is a score for a whole hole. A birdie made from a drive into the trees and a holed chip is still a birdie.

**"Birdie chance" on television usually means a putt inside about 15 feet,** which even professionals hole well under half the time.

**The word has nothing to do with birds.** It comes from American slang around 1900, in which "a bird" meant something excellent.`,
    related: ['par', 'eagle', 'bogey', 'birdie-average', 'golf-scoring-explained'],
  }),

  scoringTerm({
    slug: 'bogey',
    title: 'What Is a Bogey?',
    category: 'scoring',
    aliases: ['bogey', 'what is a bogey', 'bogey in golf', 'bogey meaning'],
    summary: 'One stroke over par on a single hole.',
    order: 150,
    sourceKeys: [{ key: 'wp-par' }],
    explanation: `A bogey is a hole played in one stroke more than its par: four on a par 3, five on a par 4, six on a par 5.

For a professional it is a mistake to be corrected. For most club golfers it is a perfectly respectable result, and a round of eighteen bogeys on a par-72 course is a 90, which is better than the average golfer manages.`,
    example: `On a par 4: a drive into the rough, an approach that comes up short of the green, a chip to eight feet, and two putts. Five strokes: a bogey.

Note where it was lost. Not on the drive, but on the eight-foot putt, which is where a great many bogeys actually happen.`,
    onTheLeaderboard: `A bogey moves a player one higher against par: -3 becomes -2. Scorecard notation is a square around the number, and two squares or a double square for a double bogey.`,
    whyItMatters: `Avoiding bogeys is a distinct skill from making birdies, and the tour statistics separate them for that reason. "Bogey avoidance" is a real category, and the players who lead it are usually the ones who win on difficult courses set up so that nobody makes many birdies.

The word also gives the handicap system its second reference point: a **bogey golfer** is defined as a player who plays to roughly a bogey per hole, and Slope Rating is built on the gap between that player and a scratch golfer.`,
    misunderstandings: `**A bogey is not a bad round.** It is one hole. "Bogey golf" as a description of a whole round means shooting around 90, which most golfers would take.

**The original meaning was the opposite.** In late-Victorian Britain, a "bogey score" was the good score to play against, effectively what par became. The modern one-over meaning arrived when par was standardised at a stricter level.`,
    related: ['par', 'double-bogey', 'birdie', 'bogey-golfer', 'golf-scoring-explained'],
  }),

  // ══ The course ═════════════════════════════════════════════════════════════
  courseFeature({
    slug: 'par-3-hole',
    title: 'Par 3 Explained',
    category: 'the-course',
    aliases: ['par 3', 'par three', 'what is a par 3'],
    summary: 'A hole short enough to reach from the tee: one shot to the green, then two putts.',
    order: 360,
    sourceKeys: COURSE,
    whereItIs: `A par 3 is a hole whose green is reachable from the teeing area with a single stroke. On a professional course that usually means somewhere between 130 and 250 yards; club par 3s run shorter.

Most courses have four of them, and a well-designed set varies enormously: a short wedge hole, a mid iron, and one that needs a fairway wood into the wind.`,
    howItPlays: `The tee shot is the approach shot. That is the whole difference from every other hole, and it changes what the hole is testing: there is no driving, no positioning, and no second chance to advance the ball.

Because the ball is teed up, the lie is perfect, so a par 3 is a pure test of iron play. It is also where architects put their most dramatic trouble, since a player is hitting from a known distance and a known lie and can be asked to carry something.`,
    strategy: `The pin position matters more here than anywhere else, because the tee shot has to be committed to before anything is known. With a flag tucked behind a bunker, the middle of the green is very often the correct target even for professionals: the birdie chance is smaller and the bogey chance is far smaller.

Club selection is the whole decision. Between clubs, most good players take the longer one and swing easier, because the trouble on a par 3 is usually short.`,
    diagram: PAR_3,
    misunderstandings: `**Par 3s are not easy holes.** A long par 3 over water into wind is among the hardest holes on any course, and the field's scoring average on it will beat several par 4s.

**Par 3 courses are a real format,** made up entirely of short holes, and they are a genuinely good place to learn: the short game gets the practice it deserves.`,
    related: [
      'par',
      'hole-in-one',
      'approach-shot',
      'par-4-hole',
      'par-5-hole',
      'club-selection-strategy',
    ],
  }),

  courseFeature({
    slug: 'dogleg',
    title: 'What Is a Dogleg?',
    category: 'the-course',
    alsoIn: ['course-design'],
    aliases: ['dogleg', 'dog leg', 'dogleg left', 'dogleg right'],
    summary: 'A hole that bends, so the shortest line to the green is not down the fairway.',
    order: 355,
    sourceKeys: COURSE,
    whereItIs: `A dogleg is a hole whose fairway changes direction partway along, named for the shape of a dog's hind leg. A dogleg right bends right, a dogleg left bends left, and the corner is usually guarded by trees, a bunker or both.

The card's yardage is measured along the intended line of play, following the bend, which is why a dogleg's stated length is longer than the straight-line distance from tee to green.`,
    howItPlays: `Because the hole bends, the tee shot has two jobs rather than one: get far enough down the hole, and end up on the side of the fairway that opens up the green.

The outside of the bend is almost always the correct side. From there the green sits in front of the player; from the inside, the approach is played across the corner with the trouble in the way.`,
    strategy: `Every dogleg is asking the same question: how much of the corner do you want to cut?

The safe line plays out to the wide part of the fairway, adds distance to the second shot, and takes the trouble entirely out of play. The aggressive line flies over the corner, leaves a short approach, and finishes in the trees when it is a few yards short.

The right answer depends on the carry required, the player's dispersion, and the format. In match play, with the downside capped at one hole, the aggressive line is correct far more often than it is in stroke play.`,
    diagram: DOGLEG,
    misunderstandings: `**Cutting the corner is not simply "hitting it further".** It requires a specific carry over a specific hazard, and being ten yards short of that carry is usually worse than the safe line by two strokes.

**The shape of shot matters.** A dogleg right suits a fade for a right-hander, because the ball starts down the fairway and moves with the hole. A player who only draws the ball is being asked a harder question, which is exactly what the architect intended.`,
    related: [
      'fairway',
      'tee-shot-strategy',
      'risk-vs-reward',
      'course-design-explained',
      'risk-reward-holes',
      'fade',
    ],
  }),

  definition({
    slug: 'nineteenth-hole',
    title: 'Nineteenth Hole',
    category: 'glossary',
    aliases: ['19th hole', 'nineteenth hole'],
    summary:
      'The clubhouse bar, where the round is discussed at greater length than it was played.',
    order: 2200,
    explanation: `A golf course has eighteen holes. The nineteenth is the bar. The joke is old enough that many clubhouses simply call the bar "The 19th" on the sign.`,
    related: ['what-are-18-holes', 'golf-etiquette'],
  }),
];
