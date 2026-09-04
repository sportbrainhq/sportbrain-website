import { definition, format, handicapConcept, rule, standard } from './golf-explainer-helpers';
import type { ExplainerSeed, ScorecardShape } from './explainer-types';

/**
 * Handicaps, and the formats they are played under.
 *
 * The brief calls the handicap category "very important" and asks for worked
 * examples. Both instructions are followed literally: every page below that
 * describes a calculation carries the arithmetic, and the two that decide who
 * wins a competition carry a scorecard with the strokes drawn on it.
 *
 * The reason is that handicapping is the one part of golf that is genuinely
 * arithmetic, and prose about arithmetic does not teach it. A reader who has
 * been told "your Course Handicap adjusts your Handicap Index for the course
 * you are playing" has learned a sentence. A reader who has seen 14.6 become 16
 * on one set of tees and 13 on another has learned the concept.
 *
 * ## On version sensitivity
 *
 * The World Handicap System is revised, and its formulae have changed since
 * launch in 2020. Everything below carries `ruleSensitive` and a
 * `sourceRevision` naming the edition it was written against, so the set to
 * re-audit after a revision is a query rather than a reading of every article.
 * Where a constant could plausibly change, the page names it as a constant of
 * the current edition rather than presenting it as a law of nature.
 *
 * ## On stroke play and match play
 *
 * The formats are in this file rather than their own because they cannot be
 * explained apart from handicapping without describing only the professional
 * game, which is a small fraction of the golf actually played.
 */

const WHS = [{ key: 'rules-of-handicapping' }];
const RULES = [{ key: 'rules-of-golf' }];
const MATCH = [{ key: 'wp-match-play' }];
const WHS_REVISION = 'Rules of Handicapping, 2024 revision (USGA / R&A)';
const REVIEWED = '2026-08-31';

/** A net-scoring card: where the strokes fall, and what they change. */
const NET_CARD: ScorecardShape = {
  holes: [
    { number: 1, par: 4, strokeIndex: 7 },
    { number: 2, par: 5, strokeIndex: 13 },
    { number: 3, par: 3, strokeIndex: 17 },
    { number: 4, par: 4, strokeIndex: 1 },
    { number: 5, par: 4, strokeIndex: 11 },
    { number: 6, par: 3, strokeIndex: 15 },
    { number: 7, par: 5, strokeIndex: 5 },
    { number: 8, par: 4, strokeIndex: 3 },
    { number: 9, par: 4, strokeIndex: 9 },
  ],
  rows: [
    {
      name: 'Alex',
      strokes: [4, 5, 3, 4, 4, 3, 5, 4, 4],
      strokesReceived: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      note: 'Playing handicap 0. Gross 36, net 36.',
    },
    {
      name: 'Sam',
      strokes: [5, 6, 4, 6, 5, 4, 6, 6, 5],
      strokesReceived: [1, 0, 0, 1, 0, 0, 1, 1, 0],
      note: 'Playing handicap 8, four strokes on this nine. Gross 47, net 43.',
      highlight: true,
    },
  ],
  caption:
    'The same nine holes played by a scratch golfer and an 8-handicapper. Strokes fall on the four lowest stroke indexes, which are holes 4, 8, 7 and 1.',
  notes: [
    {
      label: 'Hole 4, stroke index 1',
      explanation:
        'The hardest hole, so Sam receives a stroke here. Gross six becomes net five: still a bogey against the par of four, but one shot closer.',
    },
    {
      label: 'Hole 2, stroke index 13',
      explanation:
        'With only eight strokes over eighteen holes, Sam receives on indexes 1 to 8 only. Nothing here.',
    },
    {
      label: 'The result',
      explanation:
        'Alex wins on net score, 36 to 43, which is the right answer: Alex played eleven shots better than a scratch standard and Sam played four worse than an 8-handicap standard.',
    },
  ],
};

export const GOLF_HANDICAPS_AND_FORMATS: ExplainerSeed[] = [
  // ══ Handicaps ══════════════════════════════════════════════════════════════
  handicapConcept({
    slug: 'golf-handicap-explained',
    title: 'Golf Handicap Explained',
    category: 'handicaps',
    aliases: ['handicap', 'golf handicap', 'what is a golf handicap', 'handicap explained'],
    summary:
      'A number representing your demonstrated ability, used to let unequal players compete fairly.',
    isStartHere: true,
    isFeatured: true,
    order: 900,
    readMinutes: 6,
    sourceKeys: [...WHS, { key: 'wp-handicap' }],
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `A handicap is a number describing how many strokes better or worse than a scratch standard you have demonstrated you can play.

Its purpose is single and unusual among sports: to let a player who shoots 95 have a genuine contest with one who shoots 72, on the same course, on the same afternoon, without either pretending.

Under the **World Handicap System**, adopted globally from 2020, the number you carry is a **Handicap Index**. It is a portable measure of ability, not a number of shots. Converting it into shots for a specific course and set of tees produces a **Course Handicap**, and applying any competition allowance produces a **Playing Handicap**.`,
    formula: `The chain, in order:

1. **Score Differential** for each round: how well you played that day, adjusted for the difficulty of the course and tees.
2. **Handicap Index**: the average of the best 8 Score Differentials from your most recent 20 rounds.
3. **Course Handicap**: the Index converted for the course and tees you are about to play.
4. **Playing Handicap**: the Course Handicap after any competition allowance, which is often a percentage in team formats.

Each step has its own explainer, because each is a different idea and collapsing them is exactly how the system gets misunderstood.`,
    workedExample: `Sam has a Handicap Index of 8.4. Alex plays off scratch, Index 0.0.

They play a nine-hole match. Sam's Course Handicap for these tees works out at 8 for eighteen holes, so four strokes over nine. Those four strokes fall on the four hardest holes, the ones with Stroke Index 1 to 4 within the nine being played.

The card below shows the result. Sam takes 47 gross to Alex's 36. After the four strokes, Sam's net 43 still loses to Alex's 36, and correctly so: Alex played to their handicap and Sam did not.`,
    scorecard: NET_CARD,
    interpret: `A lower Index is better. Zero is scratch, and a **plus handicap**, written as +2.1, means better than scratch: that player gives strokes back rather than receiving them.

The Index is deliberately *not* your average. It is built from your best 8 of 20, so it describes what you are capable of on a good day rather than what you typically do. Most golfers score worse than their handicap in most rounds, and that is the system working as designed, not evidence that they are bad at golf.`,
    limitations: `A handicap says nothing about *how* the strokes are made. Two 12-handicappers can have entirely different games: one long and wild, one short and straight. They will fare differently on different courses, and the handicap does not see it.

It also lags. A rapidly improving player's Index trails their real ability by weeks, and an injured player's Index flatters them until twenty rounds have turned over.`,
    misunderstandings: `**Your Handicap Index is not the number of shots you get.** It is converted per course and per tee. An Index of 14.6 might give you 16 shots from the back tees and 13 from the forward ones.

**A handicap is not an average score.** Best 8 of 20 is not the mean of 20.

**Handicaps do not measure improvement in the short term.** A single good round moves an Index very little, by design, because a system that responded quickly to one round would be trivially manipulable.`,
    related: [
      'handicap-index',
      'course-handicap',
      'playing-handicap',
      'score-differential',
      'course-rating',
      'slope-rating',
      'world-handicap-system',
      'gross-vs-net-score',
    ],
  }),

  handicapConcept({
    slug: 'handicap-index',
    title: 'Handicap Index Explained',
    category: 'handicaps',
    difficulty: 'intermediate',
    aliases: ['handicap index', 'what is a handicap index', 'index golf'],
    summary:
      'The portable number: the average of your best 8 Score Differentials from your last 20 rounds.',
    order: 910,
    sourceKeys: WHS,
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `The Handicap Index is the number you carry between courses. It is expressed to one decimal place, 14.6 rather than 14, and it is not itself a number of strokes.

It measures demonstrated ability relative to a scratch standard, on a scale that is course-independent by construction. That portability is the whole point: an Index earned at a gentle parkland course means the same thing as one earned at a brutal links.`,
    formula: `**Index = the average of the lowest 8 Score Differentials in your most recent 20 acceptable scores.**

With fewer than 20 scores, the system uses a table: with 5 scores it takes the best 1, with 9 it takes the best 3, and so on, sometimes with an adjustment applied. A minimum of 54 holes is needed for an Index at all.

Two safeguards sit on top. A **soft cap** slows increases once your Index has risen more than 3.0 above its lowest value in the past year, and a **hard cap** limits the total rise to 5.0. Both exist so a temporary slump cannot inflate a handicap into an advantage.`,
    workedExample: `Twenty rounds produce these Score Differentials, sorted: 10.2, 11.4, 11.9, 12.6, 12.8, 13.1, 13.5, 13.9, then twelve more between 14.2 and 22.7.

Take the lowest eight: 10.2, 11.4, 11.9, 12.6, 12.8, 13.1, 13.5, 13.9.

Their sum is 99.4. Divided by 8 that is 12.425, rounded to one decimal: **Handicap Index 12.4**.

Note what the twelve discarded rounds contributed: nothing. A 22.7 differential, a genuinely poor day, has no effect at all while eight better rounds remain in the last twenty.`,
    interpret: `Roughly, an Index is how many strokes over the Course Rating you would shoot on a good day at a course of average difficulty. A 12.4 playing well shoots about twelve over the rating.

A **plus** Index, written +1.4, is better than scratch. Those players give strokes to the field rather than receiving them, and the plus sign is easy to misread as a worse handicap when it means the opposite.`,
    limitations: `The Index is a ceiling of typical performance rather than an expectation. Studies of scoring under the system consistently find golfers shoot their handicap or better in a minority of rounds, often around one in five, which is exactly what "best 8 of 20" predicts.

It also cannot see the shape of a game. Two identical Indexes can hide completely different distributions of good and bad holes.`,
    misunderstandings: `**It is not a number of shots you receive.** Convert it to a Course Handicap first.

**It does not reset each season.** It is a rolling window of your last 20 scores, updated as you post.

**Failing to shoot your handicap is normal.** Doing it every round would mean your Index is too high, which the system's caps and reviews exist to catch.`,
    related: [
      'golf-handicap-explained',
      'score-differential',
      'course-handicap',
      'world-handicap-system',
      'scratch-golfer',
    ],
  }),

  handicapConcept({
    slug: 'score-differential',
    title: 'Handicap Differential Explained',
    category: 'handicaps',
    difficulty: 'advanced',
    aliases: ['score differential', 'handicap differential', 'differential golf'],
    summary: 'One round, converted into a course-independent number by removing course difficulty.',
    order: 920,
    sourceKeys: WHS,
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `A Score Differential is a single round expressed on a common scale, so that a 79 at a hard course and a 74 at an easy one can be compared directly.

It is the input to the Handicap Index. Twenty of them go in; the best eight are averaged.`,
    formula: `**Score Differential = (113 / Slope Rating) × (Adjusted Gross Score − Course Rating − PCC)**

Each term does one job:

- **Adjusted Gross Score** is your score with each hole capped at net double bogey, so one disaster cannot distort it.
- **Course Rating** is the expected score for a scratch golfer from those tees, in strokes and to one decimal.
- **113** is the Slope Rating of a course of standard relative difficulty. Dividing by the actual Slope and multiplying by 113 rescales the result.
- **PCC** is the Playing Conditions Calculation, a daily adjustment between −1 and +3 applied when the field as a whole scored abnormally.`,
    workedExample: `A round of 92, at a course rated 71.6 with a Slope of 132. Conditions were normal, so PCC is 0.

Step one, the raw gap: 92 − 71.6 − 0 = **20.4** strokes worse than a scratch expectation.

Step two, rescale for difficulty: 113 / 132 = **0.856**.

Step three: 0.856 × 20.4 = **17.5**.

The Score Differential is 17.5. On an easier course with a Slope of 113, the same 20.4 gap would give a differential of exactly 20.4, and on a Slope of 145 it would give 15.9. That is the correction doing its work: shooting 20 over at a very hard course is a better performance than shooting 20 over at an easy one.`,
    interpret: `A differential is directly comparable to a Handicap Index. A player with an Index of 12.4 posting a differential of 17.5 has played worse than their Index that day; one posting 9.8 has played better.

Because the Index takes the best 8 of 20, a single low differential lowers it only slightly, and a single high one usually does nothing at all.`,
    limitations: `The formula corrects for course difficulty and daily conditions, and for nothing else. It does not know you played the round in a gale that the PCC failed to detect, or that you were injured, or that the greens had just been hollow-tined.`,
    misunderstandings: `**113 is not arbitrary and not a maximum.** It is the Slope of a course of standard difficulty, and Slopes run from 55 to 155.

**The adjusted gross is not your real score.** Net double bogey capping applies to handicap posting only; your competition score is what you actually took.`,
    related: [
      'handicap-index',
      'course-rating',
      'slope-rating',
      'net-double-bogey',
      'playing-conditions-calculation',
    ],
  }),

  handicapConcept({
    slug: 'course-handicap',
    title: 'Course Handicap Explained',
    category: 'handicaps',
    difficulty: 'intermediate',
    aliases: ['course handicap', 'what is a course handicap'],
    summary:
      'Your Handicap Index converted into actual strokes for the course and tees you are playing.',
    order: 930,
    sourceKeys: WHS,
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `A Course Handicap is the number of strokes you receive on a specific course from a specific set of tees. It is a whole number, and it is the thing you actually write on a card.

Your Index is portable. Your Course Handicap is not: the same Index gives different Course Handicaps at different courses, and even at different tees on the same course.`,
    formula: `**Course Handicap = Handicap Index × (Slope Rating / 113) + (Course Rating − Par)**

The first term scales for how much harder the course plays for a bogey golfer than for a scratch golfer. The second term adjusts for courses whose rating differs from their par, which is what stops a par-70 course rated 73.2 from being scored as though it were easy.

The result is rounded to the nearest whole number.`,
    workedExample: `A Handicap Index of 14.6, at a course with Slope 138, Course Rating 72.4 and par 71.

First term: 14.6 × (138 / 113) = 14.6 × 1.221 = **17.83**.

Second term: 72.4 − 71 = **1.4**.

Total: 17.83 + 1.4 = 19.23, rounded to **19**.

Now the same player from the forward tees, where Slope is 121, rating 69.1 and par is still 71:

14.6 × (121 / 113) = 15.63, plus (69.1 − 71) = −1.9, giving 13.73, rounded to **14**.

The same golfer, the same day, the same course: **19 strokes from the back tees and 14 from the forward ones.** That five-stroke gap is the entire reason the conversion exists.`,
    interpret: `The Course Handicap is what determines where your strokes fall. A Course Handicap of 19 means one stroke on every hole plus a second on the hardest one, allocated by Stroke Index.

Under the current edition the Course Handicap is calculated against par, which means net par and net double bogey are consistent across tees, and players competing from different tees can be compared without a further adjustment.`,
    limitations: `It corrects for the difficulty of the course, not for the shape of your game. A player whose weakness is long approach shots is under-compensated at a long course and over-compensated at a short one, and no single number can fix that.`,
    misunderstandings: `**It is not your Index rounded.** An Index of 14.6 is very rarely a Course Handicap of 15.

**It changes with the tees.** Moving forward reduces it, which surprises golfers who expect an easier course to give them more shots. It gives fewer, because the course is easier for everyone.

**It is not the number used in every competition.** Team formats apply an allowance on top, producing a Playing Handicap.`,
    related: [
      'handicap-index',
      'playing-handicap',
      'slope-rating',
      'course-rating',
      'stroke-index',
      'teeing-ground-choices',
    ],
  }),

  handicapConcept({
    slug: 'slope-rating',
    title: 'Slope Rating Explained',
    category: 'the-course',
    alsoIn: ['handicaps'],
    difficulty: 'intermediate',
    aliases: ['slope rating', 'slope', 'what is slope rating'],
    summary: 'How much harder a course plays for a bogey golfer than for a scratch golfer.',
    order: 940,
    sourceKeys: [{ key: 'usga-course-rating' }, ...WHS],
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `Slope Rating measures **relative** difficulty: how much more a course punishes a mid-handicapper than it punishes an expert.

It answers a question Course Rating cannot. Two courses can both be rated 72.0 for a scratch golfer, but if one has forced carries over water and thick rough while the other is wide open, the 18-handicapper will score far worse on the first. Slope captures that gap.

The scale runs from **55 to 155**, with **113** representing a course of standard relative difficulty.`,
    formula: `**Slope Rating = (Bogey Rating − Course Rating) × 5.381 for men, or × 4.24 for women**, rounded to the nearest whole number.

The **Bogey Rating** is the expected score for a bogey golfer, defined as roughly a 20 Course Handicap man or 24 Course Handicap woman. The **Course Rating** is the expected score for a scratch golfer. The multipliers are constants that map that difference onto the 55 to 155 scale, and the two differ because the reference bogey players differ.`,
    workedExample: `A course rated 71.8 for scratch golfers and 95.4 for bogey golfers, from the men's tees.

The gap: 95.4 − 71.8 = **23.6** strokes.

Multiply: 23.6 × 5.381 = 126.99, rounded to **Slope 127**.

Compare a resort course rated 70.2 for scratch and 89.0 for bogey. Gap of 18.8, times 5.381, gives **Slope 101**.

Both are ordinary courses for a scratch golfer. For an 18-handicapper the first is dramatically harder, and the Slope of 127 against 101 says so.`,
    interpret: `Higher Slope means more strokes for a higher handicapper. A 20-handicap Index gains roughly three extra strokes moving from a Slope of 113 to one of 130.

A Slope above about 140 signals a genuinely punishing course for average players: forced carries, penal rough, severe greens. Below about 105 signals a course where a mid-handicapper's misses are survivable.`,
    limitations: `Slope describes one comparison, between a scratch golfer and a bogey golfer. It says nothing about how a course plays for a 30-handicapper, or for a professional, and it is measured under normal conditions rather than in a gale.

It also measures the course as set up for rating, which may not resemble the setup for a given competition.`,
    misunderstandings: `**Slope is not a measure of absolute difficulty.** That is Course Rating. A short, tight course can have a high Slope and a low Rating; a long, open one can have the reverse.

**113 is not a maximum or an average of real courses.** It is the defined standard value, and it is why it appears in every handicap formula.

**It is not about hills.** The name refers to the slope of a line on a graph of expected score against handicap, not to the terrain.`,
    related: [
      'course-rating',
      'course-handicap',
      'score-differential',
      'bogey-golfer',
      'scratch-golfer',
      'world-handicap-system',
    ],
  }),

  handicapConcept({
    slug: 'course-rating',
    title: 'Course Rating Explained',
    category: 'the-course',
    alsoIn: ['handicaps'],
    difficulty: 'intermediate',
    aliases: ['course rating', 'what is course rating'],
    summary:
      'The score a scratch golfer is expected to shoot from a given set of tees, to one decimal.',
    order: 950,
    sourceKeys: [{ key: 'usga-course-rating' }],
    ruleSensitive: true,
    sourceRevision: WHS_REVISION,
    lastReviewedAt: REVIEWED,
    whatItIs: `Course Rating is the expected score for a **scratch golfer** playing a specific course from a specific set of tees under normal conditions. It is quoted to one decimal place: 72.4, not 72.

It is the absolute difficulty measure, and it is what par should be but is not. Par is a round number assigned hole by hole; Course Rating is measured.`,
    formula: `Rating teams measure two things for every hole and every set of tees.

**Effective playing length**, adjusted for roll, elevation, dogleg, prevailing wind, altitude and forced lay-ups. A 400-yard hole playing sharply uphill into a prevailing wind rates as considerably longer than 400 yards.

**Obstacle factors**, ten of them, each scored on a scale: topography, fairway width, green target size, recoverability and rough, bunkers, crossing and lateral penalty areas, trees, green surface, and psychological factors.

Those combine into an expected score for the scratch player. The same process, with a different reference golfer, produces the Bogey Rating used for Slope.`,
    workedExample: `A par-72 course measuring 6,900 yards, with generous fairways but firm, fast greens and water on four holes, might rate **72.8** from the back tees.

A par-72 course measuring 6,300 yards, wide open and soft, might rate **69.4** from the equivalent tees.

The three-and-a-half stroke gap is the real difference in difficulty, and par, identical at 72 for both, tells you none of it. This is precisely why a Course Handicap formula includes a Course Rating minus par term.`,
    interpret: `Compare it to par. A rating above par means the course is harder than its par suggests for a scratch player, which is common at championship venues. A rating below par means easier, which is common at short resort courses.

A rating of 74.6 against a par of 72 is a course where a scratch golfer is expected to shoot two and a half over.`,
    limitations: `Rating is done under specified normal conditions: normal green speed, normal firmness, no wind beyond the prevailing average. A US Open setup at the same venue can play four or five strokes harder than its rating without a single yard changing.

That gap is what the daily Playing Conditions Calculation exists to catch, within limits.`,
    misunderstandings: `**Course Rating is not par.** They are frequently different numbers, and where they differ, the rating is the honest one.

**It is not the same for every set of tees.** Every tee has its own rating and its own Slope, which is why a scorecard prints several.

**Men's and women's ratings for the same tees differ,** because the reference scratch golfers differ, and a course can carry both.`,
    related: [
      'slope-rating',
      'course-handicap',
      'score-differential',
      'par',
      'playing-conditions-calculation',
      'scratch-golfer',
    ],
  }),

  definition({
    slug: 'scratch-golfer',
    title: 'Scratch Golfer Explained',
    category: 'handicaps',
    aliases: ['scratch golfer', 'scratch', 'what is a scratch golfer'],
    summary: 'A player with a Handicap Index of 0.0, expected to shoot the Course Rating.',
    order: 960,
    sourceKeys: [{ key: 'usga-course-rating' }],
    explanation: `A scratch golfer has a Handicap Index of 0.0 and receives no strokes. As a rating reference, a scratch golfer is defined more precisely: a player who can hit tee shots an average of about 250 yards and reach a 470-yard hole in two, for men, with corresponding figures for women.

That definition matters because Course Rating is literally the expected score of this hypothetical player, so a change to the definition would change every rating in the world.`,
    example: `A scratch golfer at a course rated 72.4 is expected to shoot around 72 or 73 on a good day. Not every day: the Index is built from best 8 of 20, so a scratch player still shoots 76 fairly often.`,
    whyItMatters: `Scratch is one of the two reference points the whole handicap system is built on; the bogey golfer is the other. Course Rating measures the first, Bogey Rating measures the second, and Slope is the distance between them.`,
    misunderstandings: `**Scratch is not professional standard.** A tour professional plays to roughly a +5 to +8 Index. Scratch is an excellent amateur, of which a club typically has a handful.

**A scratch golfer does not shoot par.** They shoot the Course Rating, which at a difficult course is several strokes above par.`,
    related: ['bogey-golfer', 'handicap-index', 'course-rating', 'slope-rating'],
  }),

  definition({
    slug: 'bogey-golfer',
    title: 'Bogey Golfer Explained',
    category: 'handicaps',
    aliases: ['bogey golfer', 'what is a bogey golfer'],
    summary:
      'The system’s second reference player: roughly a 20 Course Handicap man or 24 for a woman.',
    order: 970,
    sourceKeys: [{ key: 'usga-course-rating' }],
    explanation: `A bogey golfer is the handicap system's reference for an average competent club player: a Course Handicap of about 20 for men and about 24 for women, hitting tee shots roughly 200 yards and 150 yards respectively.

The expected score for this player at a given course is the **Bogey Rating**, and the gap between it and the Course Rating is what Slope Rating measures.`,
    example: `At a course rated 71.8 for scratch, a bogey golfer might be expected to shoot 95.4. The 23.6-stroke gap gives that course a Slope of 127 from those tees.`,
    whyItMatters: `Without a second reference player there is no way to express relative difficulty, and without relative difficulty a handicap could not travel between courses. The bogey golfer is the reason a 20-handicapper receives more strokes at a hard course than at an easy one.`,
    misunderstandings: `**A bogey golfer does not shoot exactly one over par per hole.** The name is approximate: an 18 handicap plays to roughly bogey golf, and the technical definition is a 20 Course Handicap.`,
    related: ['scratch-golfer', 'slope-rating', 'course-rating', 'bogey'],
  }),

  // ══ Formats ════════════════════════════════════════════════════════════════
  format({
    slug: 'stroke-play',
    title: 'Stroke Play Explained',
    category: 'formats',
    aliases: ['stroke play', 'medal play', 'what is stroke play'],
    summary: 'Count every stroke over the whole round; lowest total wins.',
    isFeatured: true,
    order: 1000,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    howItWorks: `In stroke play, every player counts every stroke, including penalty strokes, across the whole round. The player with the lowest total wins. It is also called **medal play**.

Every hole must be completed. Unlike match play there is no concession: a two-inch putt must be holed, and failing to hole out means no score for the round at all.

Professional tournaments are almost always 72 holes of stroke play over four days, with a cut after 36 holes.`,
    whyItMatters: `Stroke play is the default format of the professional game, and it produces the sport's headline numbers: the winning score, the cut line, the course record.

It is also the format the entire statistical apparatus assumes. Strokes Gained, scoring average, and every tour statistic are defined against a stroke-play round.`,
    strategy: `Because every stroke counts equally and the downside of a hole is unbounded, stroke play rewards avoiding disasters far more than it rewards heroics.

A birdie gains one shot on the field; a double bogey loses two, and a triple loses three. Since a bad decision is more likely to produce a triple than a great decision is to produce an eagle, the expected-value play is usually the conservative one. This is the arithmetic behind laying up, aiming at the middle of greens, and hitting less than driver from tight tees.`,
    formatDifferences: `**Against match play:** the difference is not scoring but risk. In match play the worst outcome on a hole is losing one hole, so aggression is cheap; in stroke play the worst outcome is unbounded, so it is not.

**Net stroke play** deducts handicap strokes from the total, which is how most club competitions are run. **Stableford** converts each hole to points instead, which caps the damage of a disaster hole and speeds up play.`,
    misunderstandings: `**Stroke play is not "just adding up".** The rules differ from match play in real ways: a wrong ball costs two strokes rather than the hole, and the order of play is a convention rather than a requirement.

**The cut is not part of stroke play as a format.** It is a tournament convention laid on top of it.`,
    related: [
      'match-play',
      'stroke-play-vs-match-play',
      'net-stroke-play',
      'stableford',
      'the-cut',
      'why-one-bad-hole-matters',
    ],
  }),

  format({
    slug: 'match-play',
    title: 'Match Play Explained',
    category: 'formats',
    aliases: ['match play', 'matchplay', 'what is match play'],
    summary: 'A hole-by-hole contest: win more holes than your opponent and the match is yours.',
    isFeatured: true,
    order: 1010,
    sourceKeys: [...RULES, ...MATCH],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    howItWorks: `In match play, each hole is a separate contest worth one point. Take fewer strokes on a hole and you win it; take more and you lose it; take the same and the hole is **halved**.

The score is expressed as a running difference. One hole ahead is **1 up**; level is **all square**; behind is **1 down**.

The match ends the moment one player leads by more holes than remain. Three ahead with two to play is a **3 & 2** win, and the remaining holes are not played. A match still level after 18 is halved, or goes to extra holes if the competition requires a winner.

Because only the difference matters, a player who is out of a hole can simply pick up, which is why match play is faster than stroke play.`,
    whyItMatters: `Match play is golf's oldest competitive format and the format of its great team events: the Ryder Cup, the Solheim Cup and the Presidents Cup.

It produces different golf, and the difference is not stylistic. Because a catastrophic hole costs exactly one point, the correct strategy is measurably more aggressive: drivers off tight tees, attacking flags, and going for greens in two that a stroke-play player would lay up short of.`,
    strategy: `Two ideas dominate.

**The state of the match changes the correct shot.** A player one down with two to play must make birdie; a player two up with two to play should aim at the middle of every green and make their opponent do something exceptional.

**Play the hole, not the opponent, until the opponent forces you to.** But once they are in trouble, the safe shot becomes the right one, and once they are safe on the green in two, your lay-up stops being safe at all.`,
    formatDifferences: `Several rules differ genuinely, not cosmetically:

- **Concessions exist.** An opponent may concede your next stroke, the hole or the match, and a conceded stroke cannot be refused or retracted.
- **Playing out of turn** can be cancelled by the opponent, who may require the stroke to be replayed.
- **Penalties differ.** Many breaches that cost two strokes in stroke play cost the hole in match play.
- **A wrong score does not carry over.** Each hole is settled as it is played.`,
    misunderstandings: `**The lower total score does not win.** A player can shoot 80 to their opponent's 74 and win the match, if the 74 included one 11.

**"3 & 2" is not a score.** It is three holes up with two to play.

**A conceded putt is not a gimme in a friendly sense.** It is a formal act in the Rules, and once made it cannot be withdrawn.`,
    related: [
      'stroke-play',
      'stroke-play-vs-match-play',
      'one-up',
      'two-and-one',
      'halved-hole',
      'dormie',
      'conceded-putt',
      'why-match-play-changes-risk',
    ],
  }),

  format({
    slug: 'stroke-play-vs-match-play',
    title: 'Stroke Play vs Match Play',
    category: 'formats',
    aliases: [
      'stroke play vs match play',
      'match play vs stroke play',
      'difference between stroke and match play',
    ],
    summary:
      'One counts every stroke over a round; the other counts holes won, and they reward opposite behaviour.',
    order: 1020,
    sourceKeys: [...RULES, ...MATCH],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    howItWorks: `The mechanical difference is one sentence: stroke play totals strokes across the round, match play totals holes won.

The consequence is much larger. In stroke play a single hole can cost you the tournament; in match play it can cost you exactly one point. Everything else follows from that.

| | Stroke play | Match play |
| --- | --- | --- |
| Unit of scoring | The stroke | The hole |
| Worst case on a hole | Unbounded | Lose one hole |
| Must hole out | Yes | No, putts can be conceded |
| Ends when | 18 holes are complete | The lead exceeds the holes remaining |
| Typical use | Professional tournaments | Ryder Cup, club knockouts |`,
    whyItMatters: `A viewer who understands only stroke play will misread every Ryder Cup. A player driving into trouble and then taking on an outrageous recovery is not being reckless: the downside is capped at one hole, and the upside is halving a hole they were losing.

Equally, a stroke-play professional laying up on the 72nd hole while trailing by two is not being timid: they need a birdie, and they have calculated that the lay-up produces one more often than the hero shot does.`,
    strategy: `**In stroke play**, minimise expected strokes. Aim at the centre of greens, avoid short-siding, and treat a penalty area as costing far more than the yardage it saves.

**In match play**, maximise the probability of winning the hole given the state of the match, which is a different objective entirely. Play the percentages when ahead, take the variance when behind, and always know what your opponent is facing before choosing your own shot.`,
    misunderstandings: `**Match play is not just "friendlier" stroke play.** The Rules genuinely differ, and so does the correct strategy.

**Better golf does not always win a match.** The format is designed so that it does not, which is exactly why the Ryder Cup is competitive between teams of unequal depth.`,
    related: [
      'stroke-play',
      'match-play',
      'why-match-play-changes-risk',
      'why-one-bad-hole-matters',
      'ryder-cup-format',
    ],
  }),

  format({
    slug: 'four-ball',
    title: 'Four-Ball Explained',
    category: 'formats',
    aliases: ['four ball', 'fourball', 'four-ball', 'better ball'],
    summary:
      'Two players a side, everyone plays their own ball, and the better score of each pair counts.',
    order: 1100,
    sourceKeys: [...RULES, ...MATCH],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    howItWorks: `Four-ball is played by two teams of two. Every player plays their own ball for the whole hole, and the team's score for the hole is the **better of its two scores**.

If partners make 4 and 5, the team scores 4. The 5 is discarded entirely.

It can be played as match play, which is how the Ryder Cup uses it, or as stroke play, where the team's better scores are totalled over 18 holes.`,
    whyItMatters: `It is the more aggressive of the two Ryder Cup formats, and deliberately so. With a partner's ball in play as a safety net, one player can attack a flag knowing the team already has a score, which produces the birdie barrages that four-ball sessions are known for.

Team selection follows from that: captains often pair a steady player with an aggressive one, so that one makes par and the other chases.`,
    strategy: `**Order of play matters.** If your partner is safely on the green in two, you are free to take on the pin. If they are in a bunker, you play for the middle.

**Someone must make a score.** The classic four-ball failure is both players attacking the same flag, both short-siding themselves, and the team making bogey with two balls in play.`,
    formatDifferences: `**Against foursomes**, which is the other Ryder Cup format: in foursomes the partners share one ball and alternate shots, so mistakes are shared and the format is far more conservative. Four-ball produces low scores; foursomes produces tension.

**Against best ball** in casual usage: they mean the same thing, though "best ball" strictly refers to one player against a team of two or three.

**Handicaps** are applied per player at a percentage allowance set by the committee, applied hole by hole via Stroke Index rather than to the total.`,
    misunderstandings: `**It is not two players hitting one ball.** That is foursomes.

**The discarded score does not matter at all,** however bad. A partner can make a 9 with no consequence provided the other makes par.

**"Four-ball" refers to the four balls in play,** not to four players hitting in turn.`,
    related: [
      'foursomes',
      'best-ball',
      'four-ball-vs-best-ball',
      'alternate-shot',
      'ryder-cup-format',
      'golf-team-formats',
    ],
  }),

  format({
    slug: 'foursomes',
    title: 'Foursomes Explained',
    category: 'formats',
    aliases: ['foursomes', 'alternate shot', 'what is foursomes'],
    summary: 'Two players a side sharing one ball, playing alternate shots.',
    order: 1110,
    sourceKeys: [...RULES, ...MATCH],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    howItWorks: `In foursomes, two partners play a single ball, alternating strokes until it is holed. It is also called **alternate shot**.

The tee shots alternate by hole: one partner takes the odd-numbered holes, the other the even, and that assignment is fixed for the round. After the tee shot they simply alternate, so who plays a given approach depends on how many strokes have been taken.

A penalty stroke does not change the alternation. If a partner takes a penalty drop, the same player who would have played next still plays next.`,
    whyItMatters: `It is the tensest format in team golf, and the one that most reliably produces mistakes. Every shot is played for somebody else, and a poor drive hands your partner an impossible second.

It is also fast: one ball, two players, and rounds that finish in well under three hours.`,
    strategy: `**Tee assignment is a real tactical decision.** A captain looks at which holes have the most demanding tee shots and assigns the better driver to those, then works out which player will be left with the majority of the wedge approaches.

**Miss in the right places.** In foursomes an aggressive miss is worse than in any other format, because your partner has to play it.`,
    formatDifferences: `**Against four-ball**, the difference is total. Four-ball is two balls and a safety net; foursomes is one ball and none.

**Greensomes** is a common club variation: both partners drive, the better drive is selected, and alternate shot proceeds from there. It removes the worst of foursomes' punishment while keeping its shape.

**Handicap allowance** in foursomes is typically 50 percent of the combined Course Handicaps, which the committee sets.`,
    misunderstandings: `**You do not alternate who tees off based on who holed out.** Tee shots alternate strictly by odd and even holes, decided in advance.

**A conceded putt still counts for the alternation.** The concession ends the hole; it does not change whose turn it is on the next tee.`,
    related: ['four-ball', 'alternate-shot', 'scramble', 'ryder-cup-format', 'golf-team-formats'],
  }),

  rule({
    slug: 'conceded-putt',
    title: 'Conceded Putt Explained',
    category: 'formats',
    alsoIn: ['rules'],
    aliases: ['conceded putt', 'concession', 'gimme', 'given putt'],
    summary:
      'In match play only, an opponent may concede your next stroke, and it counts as holed.',
    order: 1120,
    sourceKeys: [...RULES, ...MATCH],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: REVIEWED,
    theRule: `In match play, an opponent may concede your next stroke, the hole, or the entire match. A concession may be made at any time, and once made it **cannot be declined or withdrawn**.

If your next stroke is conceded, you are treated as having holed out with that stroke. You add it to your score, pick the ball up, and the hole is over.

Concessions do not exist in stroke play. A player who picks up a short putt in stroke play has not completed the hole and has no score for the round.`,
    penaltyAndRelief: `There is no penalty attached to a concession itself. The trap is the reverse: picking up in stroke play on the assumption that a putt is "obviously" given results in no return, which is effectively a disqualification from that round.

Conceding your opponent's stroke in exchange for them conceding yours is an agreement to waive the Rules, and both players are disqualified.`,
    inPractice: `Concessions are a tactical instrument, not merely a courtesy. Giving a two-footer early in a match spares the opponent the experience of holing short putts under pressure, which is exactly what a captain does not want on the 17th.

Equally, declining to concede a three-footer late in a tight match is entirely within the Rules and entirely normal, though it is sometimes treated as bad manners by people who have not read them.`,
    formatDifferences: `**Match play**: concessions exist and are binding immediately.

**Stroke play**: they do not exist at all, and no agreement between players can create them.

**Casual golf**: the "gimme" is a social convention with no standing in the Rules, and a score containing gimmes is not acceptable for handicap posting without treating the putt as holed under the most likely score guidance.`,
    misunderstandings: `**You cannot refuse a concession.** If your opponent concedes and you putt anyway, the stroke did not count and the ball was already holed.

**A concession is not reversible,** even if it was made by mistake or the opponent immediately regrets it.

**"Inside the leather" is not a rule.** It is a casual convention about a putt shorter than a putter grip, with no basis in the Rules of Golf.`,
    related: ['match-play', 'gimme', 'stroke-play', 'short-putts', 'rules-of-golf'],
  }),

  definition({
    slug: 'gimme',
    title: 'Gimme',
    category: 'glossary',
    aliases: ['gimme', 'gimmie'],
    summary:
      'A casual concession of a short putt, with no standing in the Rules outside match play.',
    order: 2230,
    explanation: `A gimme is a short putt that playing partners agree is not worth holing. In friendly golf it is universal; in the Rules of Golf it exists only as a formal **concession**, and only in match play.

In stroke play there is no such thing, and a picked-up ball means no score for the hole.`,
    misunderstandings: `**A round with gimmes is not straightforwardly postable for handicap** unless the conceded putts are recorded as holed under the most likely score guidance.`,
    related: ['conceded-putt', 'match-play', 'short-putts'],
  }),

  standard({
    slug: 'why-one-bad-hole-matters',
    title: 'Why One Bad Hole Matters So Much',
    category: 'formats',
    aliases: ['one bad hole', 'why one bad hole matters', 'blow up hole'],
    summary:
      'Because a hole has a floor of one stroke and no ceiling, so mistakes cost more than good play gains.',
    order: 1030,
    sourceKeys: RULES,
    explanation: `Golf's scoring distribution is asymmetric, and that asymmetry explains almost every strategic decision in the sport.

On a par 4, the best realistic outcome is a birdie: one shot gained. The worst is not a bogey. It is a ball out of bounds, a reload, another poor shot, and a seven or eight: three or four shots lost, from a single swing.

Good play gains in ones. Bad play loses in twos and threes.`,
    howItWorks: `The mechanism is penalty strokes and compounding. A drive into a penalty area costs a stroke *and* the distance. The recovery is then played from a worse position, under pressure, often with a club the player would not have chosen, which raises the chance of a second mistake.

A double bogey therefore rarely means two poor shots. It usually means one poor shot and a rule.`,
    example: `A round of six birdies and no bogeys is 66 on a par 72. A round of six birdies, no bogeys and one triple bogey is 69.

Three shots, one hole. The other seventeen holes were a genuinely exceptional round of golf, and one swing turned it into a merely good one.`,
    whyItMatters: `This is the arithmetic behind every conservative decision a professional makes. Aiming at the centre of a green rather than a tucked flag gives up a fraction of a stroke in expectation and buys a large reduction in the chance of a short-sided bogey or worse.

It is why lay-ups exist, why professionals hit 3 wood off tight tees, and why the strokes gained data consistently favours the boring option.`,
    strategy: `The practical rule that follows: **choose the shot whose worst outcome you can live with**, not the shot whose best outcome you would most enjoy.

In match play, this reverses. When the worst case is capped at losing one hole, the aggressive line becomes correct, and the same player should behave differently in a Ryder Cup four-ball than in a stroke-play Sunday.`,
    misunderstandings: `**It is not about "momentum".** The cost of a bad hole is arithmetic, not psychology, and it would be just as expensive if it happened to be the last hole of the round.

**In net competitions the damage is capped.** Stableford and net double bogey limits exist precisely to stop one hole ruining a card, which is why club golf uses them so widely.`,
    related: [
      'double-bogey',
      'stroke-play',
      'match-play',
      'stroke-and-distance',
      'course-management',
      'stableford',
      'net-double-bogey',
    ],
  }),
];
