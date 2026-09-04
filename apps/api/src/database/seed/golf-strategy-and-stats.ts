import { standard, statistic, strategy } from './golf-explainer-helpers';
import type { ExplainerSeed, HoleShape, StrokesGainedShape } from './explainer-types';

/**
 * Course management, the traditional statistics, and strokes gained.
 *
 * These three belong together because they are one argument told three times.
 * Course management says the boring shot is usually correct; the traditional
 * statistics cannot show you why; strokes gained can, and that is essentially
 * the whole reason it was adopted.
 *
 * ## On derived metrics
 *
 * The brief asks that analytical metrics be labelled separately from official
 * statistics, and this file is where that matters. Strokes gained as published
 * by the PGA Tour is an official statistic with a defined baseline. Course-fit
 * models, wind-adjusted performance and expected putting are *not*: they are
 * built on top of shot data by analysts who disagree with each other, and a
 * reader who cannot tell the difference will quote a model as though it were a
 * record.
 *
 * The `statistic` helper takes `isDerived: true` for exactly this, and appends
 * a fixed paragraph saying so. It is deliberately not a sentence an author can
 * soften, because the whole value of the label is that it reads identically on
 * every page that carries it.
 */

const TOUR = [{ key: 'pga-tour-stats' }];
const SG = [{ key: 'wp-strokes-gained' }, { key: 'pga-tour-stats' }];

/** The lay-up argument, drawn. */
const LAY_UP: HoleShape = {
  hole: 'plan',
  par: 5,
  length: '540 yards',
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
        { x: 64, y: 6 },
        { x: 68, y: 50 },
        { x: 66, y: 70 },
        { x: 40, y: 70 },
        { x: 34, y: 44 },
      ],
      label: 'Fairway',
    },
    {
      kind: 'water',
      points: [
        { x: 30, y: 71 },
        { x: 76, y: 71 },
        { x: 76, y: 80 },
        { x: 30, y: 80 },
      ],
      label: 'Penalty area short of the green',
    },
    {
      kind: 'green',
      points: [
        { x: 40, y: 83 },
        { x: 70, y: 83 },
        { x: 72, y: 95 },
        { x: 38, y: 95 },
      ],
      label: 'Green',
    },
    {
      kind: 'bunker',
      points: [
        { x: 70, y: 84 },
        { x: 82, y: 86 },
        { x: 81, y: 94 },
        { x: 69, y: 92 },
      ],
      label: 'Greenside bunker',
    },
  ],
  steps: [
    {
      caption:
        'Going for the green in two: a 250-yard second shot that must carry the water. It works often enough to be tempting, and the failures finish in the penalty area.',
      note: 'Second shot, 250 yards to the flag',
      shots: [
        {
          kind: 'approach',
          fromX: 50,
          fromY: 40,
          toX: 55,
          toY: 89,
          label: 'Going for it',
          ghost: true,
        },
      ],
      markers: [
        { x: 50, y: 40, label: 'Ball', kind: 'ball' },
        { x: 55, y: 90, label: 'Hole', kind: 'pin' },
        { x: 53, y: 75, label: 'Must carry', kind: 'trouble' },
      ],
    },
    {
      caption:
        'The lay-up: a shot to a chosen yardage short of the water, leaving a full wedge. The birdie chance is smaller, and the double bogey almost disappears.',
      note: 'Lay up to 100 yards, then a wedge',
      shots: [
        { kind: 'layup', fromX: 50, fromY: 40, toX: 52, toY: 64, label: 'Lay-up' },
        { kind: 'approach', fromX: 52, fromY: 64, toX: 55, toY: 89, label: 'Wedge' },
      ],
      markers: [
        { x: 50, y: 40, label: 'Ball', kind: 'ball' },
        { x: 52, y: 64, label: 'Chosen yardage', kind: 'target' },
        { x: 55, y: 90, label: 'Hole', kind: 'pin' },
      ],
    },
  ],
  caption:
    'A reachable par 5 with water short of the green. Both plays are defensible, and which is correct depends on the numbers rather than on courage.',
};

/** A worked strokes-gained hole, shot by shot. */
const SG_WORKED: StrokesGainedShape = {
  strokesGained: 'shots',
  rows: [
    {
      shot: 'Tee shot on a 430-yard par 4',
      from: '430 yards, tee',
      baselineBefore: 4.0,
      baselineAfter: 2.9,
      strokesTaken: 1,
      gained: 0.1,
      category: 'off-the-tee',
    },
    {
      shot: 'Approach from the fairway',
      from: '165 yards, fairway',
      baselineBefore: 2.9,
      baselineAfter: 1.8,
      strokesTaken: 1,
      gained: 0.1,
      category: 'approach',
    },
    {
      shot: 'First putt, holed',
      from: '22 feet, green',
      baselineBefore: 1.8,
      baselineAfter: 0,
      strokesTaken: 1,
      gained: 0.8,
      category: 'putting',
    },
  ],
  total: 'Hole total: +1.0 strokes gained. Three strokes on a hole a field averages 4.0.',
  caption:
    'One birdie, decomposed. The putt was worth eight times as much as the drive, because holing from 22 feet is rare and a 250-yard drive into the fairway is not.',
};

export const GOLF_STRATEGY_AND_STATS: ExplainerSeed[] = [
  // ══ Strategy ═══════════════════════════════════════════════════════════════
  strategy({
    slug: 'course-management',
    title: 'Golf Course Management Explained',
    category: 'strategy-and-conditions',
    difficulty: 'intermediate',
    aliases: ['course management', 'golf course management', 'course strategy'],
    summary:
      'Choosing the shot with the best expected score rather than the best possible outcome.',
    isFeatured: true,
    order: 1600,
    readMinutes: 6,
    sourceKeys: TOUR,
    howItWorks: `Course management is the decision layer sitting above ball striking: which club, which target, which risk, on each of roughly seventy shots in a round.

The organising idea is **expected score**. Every option has a distribution of outcomes rather than a single one, and the right choice is the one whose average is lowest, not the one whose best case is best.

That distinction matters because golf's outcomes are skewed. Attacking a flag tucked behind a bunker might gain a third of a stroke when it works and lose a stroke and a half when it does not, and the failures are more common than they feel.

Four decisions carry most of the value:

**Target selection on approaches.** Aiming at the centre of the green rather than the flag, unless the flag is in a safe position.

**Which side to miss.** Every green has a good miss and a bad one, and the good one is whichever leaves a straightforward next shot.

**When to lay up, and to what yardage.** Not simply "short of the water", but to a distance you are comfortable with.

**Club off the tee.** Distance is valuable, but not at the cost of a penalty area at driver range.`,
    whenToUseIt: `On every shot, but the value is concentrated. Most of a round's decisions are obvious. The three or four genuinely marginal ones, a tight tee shot, a par 5 second, a short-sided pin, are where a round is won or lost.`,
    diagram: LAY_UP,
    advantages: `It is the cheapest improvement available. Better decisions cost nothing and require no practice, and for a mid-handicapper they are usually worth more strokes than a swing change.

It also compounds with skill. The better a player's wedge play, the more valuable laying up to a favourite yardage becomes.`,
    risks: `Over-applied, it becomes passivity. There are genuinely correct times to attack, and a player who never does gives up the birdies that win tournaments and matches.

The format matters too: in match play the calculation changes entirely, because the downside of any hole is capped at one point.`,
    misunderstandings: `**Conservative is not the same as correct.** The right answer is whichever has the better expected score, which is sometimes the aggressive line, particularly on a par 5 with a wide bail-out.

**"Aim at the middle of the green" is not a universal rule.** With a front-left pin and a wide green, the centre may be a 50-foot putt.

**Playing safe does not mean playing short.** Laying up to a bad yardage, or leaving an awkward half-wedge, gives back most of what the lay-up saved.`,
    related: [
      'risk-vs-reward',
      'lay-up-strategy',
      'when-to-attack-the-green',
      'short-siding',
      'why-pros-dont-aim-at-the-flag',
      'strokes-gained-approach',
    ],
  }),

  strategy({
    slug: 'why-pros-dont-aim-at-the-flag',
    title: "Why Pros Don't Always Aim at the Flag",
    category: 'strategy-and-conditions',
    difficulty: 'intermediate',
    aliases: ['why pros aim away from the flag', 'aiming at the flag', 'centre of the green'],
    summary:
      'Because their misses are large enough that the average outcome is better away from trouble.',
    order: 1610,
    sourceKeys: TOUR,
    howItWorks: `Even the best players in the world miss their target by a considerable margin. From 150 yards a tour professional's average proximity to the hole is roughly 25 feet, and the spread around that is wide: shots finish 10 feet away and 60 feet away from the same swing intention.

Aiming is therefore not choosing where the ball will go. It is choosing the **centre of a scatter pattern**, and the question becomes which centre produces the best distribution of results.

If the flag is four paces from a bunker, aiming at it puts a substantial share of that scatter in the sand. Aiming eight paces away from the bunker moves the whole pattern, losing very little on the good shots and saving a great deal on the bad ones.`,
    whenToUseIt: `Whenever the flag is close to trouble, whenever the player is between clubs, and whenever the green is firm enough that a shot pitching at the flag will run past it.

The reverse also holds: with a flag in the middle of a large green and no trouble, professionals absolutely do aim at it.`,
    advantages: `It converts the same swing into a better set of outcomes without requiring any improvement in ball striking, which is why it is the first thing a good coach changes about an amateur's game.

It also removes the most expensive short-game situation in golf: being **short-sided**, with the flag close to the edge you missed on and no green to work with.`,
    risks: `Taken too far it costs birdies. A player who aims 30 feet from every flag will make a great many pars and very few threes, and against a field making birdies that is losing slowly.

The correct offset depends on the player's own dispersion. A professional aiming five paces off and a 20-handicapper aiming five paces off are not making the same decision, because the amateur's scatter is several times wider.`,
    misunderstandings: `**It is not caution.** It is arithmetic, and the same arithmetic tells them to fire at flags when the surrounding ground is safe.

**Television makes it invisible.** A commentator saying a shot "leaked right of the flag" is often describing a shot that finished exactly where it was aimed.

**Amateurs need bigger offsets, not smaller.** The wider your dispersion, the further from trouble your aim point should be, which is the reverse of what most club golfers do.`,
    related: [
      'course-management',
      'short-siding',
      'approach-shot-strategy',
      'proximity-to-hole',
      'miss-patterns',
      'strokes-gained-approach',
    ],
  }),

  // ══ Statistics ═════════════════════════════════════════════════════════════
  statistic({
    slug: 'greens-in-regulation',
    title: 'Greens in Regulation Explained',
    category: 'statistics',
    aliases: ['greens in regulation', 'gir', 'greens hit'],
    summary:
      'The percentage of holes where the ball is on the green with at least two putts left for par.',
    order: 1700,
    sourceKeys: TOUR,
    measures: `A green in regulation, or GIR, is a hole where the ball reaches the putting surface in **par minus two** strokes: one shot on a par 3, two on a par 4, three on a par 5.

The statistic is the percentage of holes on which that happens. It is the traditional summary of ball-striking quality from tee to green.`,
    formula: `**GIR % = greens in regulation ÷ holes played × 100**

The ball must be on the putting surface itself. The fringe does not count, however close.`,
    example: `A player hits 12 greens in a round of 18. That is 12 / 18 = 66.7 percent.

Tour professionals average roughly 65 to 70 percent across a season. A 15-handicap club golfer typically hits between 15 and 30 percent, which is the single largest gap between the two populations in any traditional statistic.`,
    interpret: `GIR correlates strongly with scoring, and more strongly than any other traditional statistic. A player hitting a lot of greens gives themselves putts for birdie and rarely has to scramble for par.

It is the natural companion to **scrambling**: GIR describes how often you did not need the short game, scrambling describes how well you coped when you did.`,
    limitations: `It is binary, and that is its central flaw. A shot to two feet and a shot to 60 feet on the same green count identically, and they are worth about a stroke and a half apart.

It also ignores where you started. Hitting a green from 90 yards in the fairway is routine; hitting the same green from 210 yards in the rough is exceptional. GIR treats both as one.

Those two blind spots are exactly what **Strokes Gained: Approach** exists to fix, which is why tour analysts largely stopped using GIR as a primary measure.`,
    related: [
      'proximity-to-hole',
      'scrambling',
      'fairways-hit',
      'strokes-gained-approach',
      'why-traditional-stats-mislead',
    ],
  }),

  statistic({
    slug: 'why-traditional-stats-mislead',
    title: 'Why Traditional Golf Stats Can Be Misleading',
    category: 'statistics',
    alsoIn: ['strokes-gained'],
    difficulty: 'intermediate',
    aliases: ['traditional golf stats', 'why golf stats are misleading', 'putts per round problem'],
    summary: 'Because they count events without asking how hard the event was or where it started.',
    order: 1790,
    sourceKeys: [...TOUR, ...SG],
    measures: `The traditional set: fairways hit, greens in regulation, putts per round, sand saves, driving distance. Each counts something real, and each has the same two structural problems.

**They ignore difficulty.** A 40-foot putt and a 4-foot putt both count as one putt.

**They ignore the starting point.** A green hit from 200 yards in the rough counts the same as one hit from 80 yards in the fairway.`,
    formula: `The clearest failure is **putts per round**, and it is worth working through because it is exactly backwards.

A player who misses every green and chips to three feet will hole most of those and record a very low putts-per-round figure. A player who hits every green to 35 feet will two-putt most of them and record a high one.

The second player is playing far better golf, and the statistic says the opposite. Putts per round rewards missing greens.`,
    example: `Two players, both shoot 72.

Player A hits 5 greens, chips brilliantly, and takes 26 putts. Player B hits 15 greens, putts averagely, and takes 32 putts.

Putts per round says A putted better by six. In reality A's putts averaged four feet and B's averaged 28, and B's putting was probably the better performance. The statistic has measured the approach play and labelled it putting.`,
    interpret: `The general lesson is that a count of events is not a measure of skill unless the events are equally difficult, and in golf they never are.

**Strokes gained** fixes this by comparing every shot to what the field would be expected to do from the same place. That turns "a putt" into "a putt from 22 feet on a tour green", which is a fair comparison, and it assigns each shot to the part of the game that actually produced it.`,
    limitations: `The traditional statistics are not worthless. They are cheap to collect, they are available for decades of history where shot-level data does not exist, and for a club golfer counting fairways and greens is a perfectly reasonable way to see where a round went.

The failure is specifically in using them to compare players or to rank skills, which is what they are most often used for.`,
    related: [
      'strokes-gained',
      'putts-per-round',
      'greens-in-regulation',
      'fairways-hit',
      'scrambling',
      'why-strokes-gained-is-better',
    ],
  }),

  // ══ Strokes gained ═════════════════════════════════════════════════════════
  statistic({
    slug: 'strokes-gained',
    title: 'Strokes Gained Explained',
    category: 'strokes-gained',
    difficulty: 'advanced',
    aliases: ['strokes gained', 'sg', 'what is strokes gained'],
    summary: 'Every shot compared to what the field would be expected to take from the same place.',
    isFeatured: true,
    order: 1800,
    readMinutes: 7,
    sourceKeys: SG,
    measures: `Strokes gained measures a single shot by asking one question: **how many strokes did this shot save, compared to an average tour player playing from the same position?**

The apparatus behind it is a **baseline**: for every distance and every lie, the average number of strokes a tour professional takes to hole out from there. From 165 yards in the fairway the baseline is roughly 2.9. From 22 feet on the green it is roughly 1.8. From 430 yards on a tee it is roughly 4.0.

Those baselines are built from millions of recorded shots, which is why the concept had to wait for shot-tracking technology to exist.`,
    formula: `**Strokes gained on a shot = (baseline before) − (baseline after) − 1**

The 1 is the shot you just played. Add a penalty stroke and it becomes 2.

Worked through: you are 165 yards away in the fairway, baseline 2.9. You hit it to 22 feet, baseline 1.8. You used one shot.

2.9 − 1.8 − 1 = **+0.1**. Slightly better than an average tour approach from there.

Now the putt. From 22 feet the baseline is 1.8, you hole it, so the baseline after is 0, and you used one stroke.

1.8 − 0 − 1 = **+0.8**. A very good putt indeed, worth eight times the approach shot.

Sum every shot in a round and you get strokes gained for the round, which necessarily equals the difference between your score and the field average. Nothing is lost or invented in the decomposition, which is what makes it trustworthy.`,
    example: `The table below decomposes a single birdie on a 430-yard par 4 where the field averages 4.0.

The player made 3, so they gained exactly 1.0 stroke on the field. The decomposition says where it came from: 0.1 from the drive, 0.1 from the approach, and 0.8 from the putt.

That allocation is the entire value of the method. A traditional box score would record "birdie", one fairway, one green and one putt, and would tell you nothing about which shot actually produced the score.`,
    table: SG_WORKED,
    interpret: `Positive is better than the field average, negative is worse. The units are strokes, which means the numbers are directly comparable to each other and directly meaningful: gaining 2.0 strokes a round over a season is roughly the difference between a good tour player and a great one.

The tour publishes it split into four exclusive categories that sum to the total: **off the tee**, **approach**, **around the green**, and **putting**. The first three sum to **tee to green**.

Across a season, approach play is consistently the largest driver of scoring differences between tour players, followed by off the tee, with putting and around the green smaller. This is the finding that overturned "drive for show, putt for dough".`,
    limitations: `**The baseline is a tour baseline.** Strokes gained figures for amateurs use different baselines, and comparing an amateur's number to a professional's is meaningless unless both are stated against the same reference.

**It measures against the field, not against the course.** On a week where the field plays a course that suits long hitters, a long hitter's strokes gained off the tee will look good partly because of the venue.

**It needs shot-level data.** Distance and lie for every shot, which means it exists only for events with tracking systems, and its "lie" categories are coarse: "rough" covers both a good lie and an unplayable one.

**Single-round figures are noisy.** Putting in particular has enormous round-to-round variance, and a single tournament's strokes gained putting says very little about a player's putting.`,
    related: [
      'how-strokes-gained-is-calculated',
      'baseline-expected-strokes',
      'strokes-gained-off-the-tee',
      'strokes-gained-approach',
      'strokes-gained-putting',
      'strokes-gained-total',
      'why-strokes-gained-is-better',
      'why-traditional-stats-mislead',
    ],
  }),

  statistic({
    slug: 'strokes-gained-putting',
    title: 'Strokes Gained: Putting',
    category: 'strokes-gained',
    difficulty: 'advanced',
    aliases: ['strokes gained putting', 'sg putting', 'sgp'],
    summary: 'Putting measured against the field’s expected strokes from each starting distance.',
    order: 1840,
    sourceKeys: SG,
    measures: `Strokes gained putting isolates the putting stroke by comparing each putt to the number of strokes a tour player would be expected to take from that distance on that green.

It is the original strokes gained statistic. The PGA Tour adopted it first, in 2011, precisely because putts per round was so obviously broken.`,
    formula: `**SG putting for a putt = (expected putts from the starting distance) − (expected putts from where it finishes) − 1**

For a holed putt the second term is zero, so it simplifies to expected putts minus one.

Approximate tour baselines, which is all anyone needs to read the numbers:

- 3 feet: about 1.05 expected putts
- 8 feet: about 1.5
- 15 feet: about 1.8
- 25 feet: about 1.95
- 40 feet: about 2.15`,
    example: `**Holing from 8 feet**: 1.5 − 0 − 1 = **+0.5**. A good putt.

**Holing from 3 feet**: 1.05 − 0 − 1 = **+0.05**. Almost nothing, because everybody holes them.

**Missing from 3 feet, tap-in**: 1.05 − 1.0 − 1 = **−0.95**. Nearly a full stroke lost, from one short putt.

That asymmetry is the whole story of short putting: holing them earns almost nothing and missing them is a disaster. It is why tour players practise three-footers rather than thirty-footers.

**Lagging from 40 feet to 2 feet, then holing**: the lag gains 2.15 − 1.05 − 1 = **+0.1**, and the tap-in gains 0.05. A two-putt from 40 feet is very slightly better than average, which is exactly right.`,
    interpret: `Season-long leaders gain roughly 0.7 to 0.9 strokes per round on the field with the putter. Over four rounds that is around three shots, which is often a tournament.

Read it per round, not per putt. A figure of +1.2 means the player gained 1.2 strokes on the field with putting over eighteen holes.`,
    limitations: `**Enormous variance.** Putting is the noisiest part of golf, and a week's figure tells you close to nothing. Analysts generally want a season before drawing conclusions, and even then putting is the least persistent skill year to year.

**It cannot separate the read from the stroke.** A putt missed because the green was misread and one missed because the stroke was poor are identical to the statistic.

**Green conditions vary.** Baselines are averaged across tour greens, so a week on unusually bumpy or unusually fast surfaces distorts everybody's figures in the same direction.`,
    related: [
      'strokes-gained',
      'putts-per-round',
      'putting-average',
      'expected-putting',
      'putting-variance',
      'baseline-expected-strokes',
    ],
  }),

  statistic({
    slug: 'strokes-gained-approach',
    title: 'Strokes Gained: Approach',
    category: 'strokes-gained',
    difficulty: 'advanced',
    aliases: ['strokes gained approach', 'sg approach', 'sg app'],
    summary:
      'Shots played towards the green from outside 30 yards, excluding tee shots on par 4s and 5s.',
    order: 1820,
    sourceKeys: SG,
    measures: `Strokes gained approach covers every shot played towards the green from beyond 30 yards, other than a tee shot on a par 4 or par 5. Tee shots on par 3s **are** included, since they are approach shots played from a tee.

It is consistently the largest single component of scoring difference between tour players, which is the most important practical finding the whole method has produced.`,
    formula: `The same subtraction as every other category: baseline before, minus baseline after, minus the strokes taken.

The category is determined by where the shot starts, not by where it finishes. A shot from 60 yards that ends in a bunker is still an approach shot; the bunker shot that follows is around the green.`,
    example: `From 175 yards in the rough, baseline about 3.15. The shot finishes 18 feet from the hole, baseline about 1.75.

3.15 − 1.75 − 1 = **+0.4 strokes gained**.

The same shot from 175 yards in the *fairway* has a baseline nearer 2.95, so finishing at the same 18 feet gains only 0.2. The identical result is worth twice as much from the rough, because the starting point was harder, and that adjustment is the thing traditional statistics cannot make.`,
    interpret: `Season leaders gain roughly 0.8 to 1.1 strokes per round on approach. Because it is both the largest category and one of the more persistent ones year to year, it is the best single predictor of a tour player's future scoring.

It is usually broken down further by distance band, 50 to 100 yards, 100 to 150, and so on, which is where genuine coaching insight lives: a player can be excellent from 150 and poor from 200.`,
    limitations: `**Lie categories are coarse.** "Rough" is one bucket covering a ball sitting up and a ball buried, and those are different shots with very different baselines.

**It does not know the pin.** A shot to 25 feet on the correct side of the green and one to 25 feet short-sided score identically, and they are not the same shot.

**Wind and firmness are averaged away.** A week of severe wind lowers everybody's figures without saying who handled it well.`,
    related: [
      'strokes-gained',
      'strokes-gained-tee-to-green',
      'proximity-to-hole',
      'greens-in-regulation',
      'approach-proximity-analysis',
      'course-management',
    ],
  }),

  statistic({
    slug: 'course-fit',
    title: 'Course Fit Explained',
    category: 'advanced-analysis',
    difficulty: 'advanced',
    aliases: ['course fit', 'horses for courses', 'course suitability'],
    summary:
      'A model estimating how well a player’s skill profile matches what a particular course rewards.',
    order: 1900,
    isDerived: true,
    sourceKeys: SG,
    measures: `Course fit attempts to answer whether a course suits a given player: whether its length, its rough, its green sizes and its wind exposure reward the things that player is good at.

The intuition is sound and old. Augusta National rewards a high draw and excellent long-iron play; a narrow, tree-lined course rewards accuracy over distance; firm links reward flighting the ball down. "Horses for courses" is a phrase golf has used for a century.`,
    formula: `A typical model does three things:

**1. Characterise the course** from historical shot data: average driving distance used, proportion of approaches from beyond 175 yards, rough severity, green size, average wind.

**2. Characterise the player** from their strokes gained profile, split by distance band and by lie.

**3. Weight the player's strengths by how much the course exercises them,** producing an expected strokes gained figure for that player at that course.

Different analysts do all three steps differently, and they disagree materially about the answers.`,
    example: `A player who gains 0.9 strokes per round on approaches from beyond 175 yards, and loses 0.2 from inside 125, at a course where 40 percent of approaches come from beyond 175 against a tour average of 25 percent.

The model weights their strong band more heavily and their weak band less, and projects them to outperform their season-long strokes gained average at this venue by some fraction of a stroke per round.

Whether that fraction is 0.1 or 0.4 depends entirely on the modeller's choices, which is the honest summary of the state of the art.`,
    interpret: `Treat a course-fit figure as a small adjustment to a player's baseline quality, never as a replacement for it. The effect sizes that survive careful testing are modest: a good player at a poorly-fitting course is still a good player.

The most defensible components are the ones with the clearest physical mechanism: driving distance at courses where the rough is not penal, and long-iron quality at courses with long par 4s.`,
    limitations: `**Course history is not course fit,** though the two are constantly conflated. A player's record at a venue is a handful of rounds, which is far too small a sample to separate fit from luck, and the course has usually changed in the interim.

**Setups change year to year.** Rough is grown or cut, greens are firmer or softer, tees move. A model trained on five years of data is describing an average course that no longer exists.

**Course conditions are dominated by weather.** A links course in a calm week and the same course in a gale reward completely different skills.`,
    related: [
      'course-history-vs-form',
      'strokes-gained',
      'player-skill-profiles',
      'field-strength-adjustments',
      'wind-adjusted-performance',
    ],
  }),

  standard({
    slug: 'reading-a-strokes-gained-table',
    title: 'How to Read a Strokes Gained Table',
    category: 'strokes-gained',
    difficulty: 'advanced',
    aliases: ['reading strokes gained', 'strokes gained table', 'how to read strokes gained'],
    summary:
      'Five columns that sum: off the tee, approach, around the green, putting, and the total.',
    order: 1890,
    sourceKeys: SG,
    explanation: `A strokes gained table has one row per player and five numbers that are related by simple addition. Once you know the relationship, the table reads itself.

**SG: OTT + SG: APP + SG: ARG = SG: T2G**

**SG: T2G + SG: P = SG: TOT**

Every figure is per round, in strokes, against the field. Positive is better than average.`,
    howItWorks: `The four exclusive categories, defined by where the shot **starts**:

**Off the tee (OTT)**: tee shots on par 4s and par 5s only.
**Approach (APP)**: shots towards the green from beyond 30 yards, plus par 3 tee shots.
**Around the green (ARG)**: shots from within 30 yards of the green that are not putts.
**Putting (P)**: everything played on the putting surface.

Two summary columns:

**Tee to green (T2G)**: the first three added together. The best available single summary of ball striking.
**Total (TOT)**: everything, which necessarily equals the player's score against the field average.`,
    example: `A row reading **OTT +0.6 | APP +0.9 | ARG −0.1 | P +0.4 | T2G +1.4 | TOT +1.8**.

Check the arithmetic: 0.6 + 0.9 − 0.1 = 1.4, and 1.4 + 0.4 = 1.8. It holds, as it always must.

Read as a description: an excellent ball striker, strongest on approach, marginally below average with the short game, and putting a little better than the field. Over four rounds they would be expected to beat the field average by about 7 strokes.`,
    whyItMatters: `The decomposition is what makes the table useful rather than merely informative. Two players both at +1.8 total can be completely different golfers, and the row tells you which is which, and therefore which is more likely to hold up next week.

It also grounds arguments that were previously unresolvable. "Did they win because they putted well or because they hit it well?" has a numerical answer, and it is in this table.`,
    misunderstandings: `**The columns are not percentages and not comparable across sports.** They are strokes per round, and a difference of 0.5 is large.

**Total is not a ranking of quality against all golf,** only against that event's field. A +1.5 in a weak field is a smaller achievement than the same figure against a major championship field, which is what field-strength adjustments try to correct.

**A negative in one column is not a weakness in isolation.** Against a tour field, average is elite, and −0.1 around the green means slightly below the standard of the best hundred players on earth.`,
    takeaways: `- Five columns, related by two additions that always hold.
- Categories are set by where a shot starts, not where it finishes.
- Everything is per round, in strokes, against that field.
- Tee to green is the most persistent; putting is the noisiest.
- Total equals the player's score relative to the field average, exactly.`,
    related: [
      'strokes-gained',
      'strokes-gained-total',
      'strokes-gained-tee-to-green',
      'strokes-gained-off-the-tee',
      'strokes-gained-approach',
      'strokes-gained-around-the-green',
      'strokes-gained-putting',
    ],
  }),
];
