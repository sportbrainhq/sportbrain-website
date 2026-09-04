import { courseFeature, definition, scoringTerm, standard } from './golf-explainer-helpers';
import type { ExplainerSeed, ScorecardShape } from './explainer-types';

/**
 * The rest of the scoring vocabulary, and the parts of the course.
 *
 * Split from `golf-explainers.ts` for size rather than for principle: the
 * scoring terms are the library's highest-traffic pages and there are fifteen
 * of them, and the course features are the vocabulary every other category
 * assumes a reader already has.
 *
 * The scoring terms deliberately share a shape. Somebody who has just read
 * "birdie" and clicks through to "eagle" should find the same five headings in
 * the same order, because the concepts differ by one number and pretending
 * otherwise would make the difference harder to see rather than easier.
 */

const PAR_SRC = [{ key: 'wp-par' }];
const COURSE = [{ key: 'wp-golf-course' }];
const RULES = [{ key: 'rules-of-golf' }];

/** A leaderboard-style card, used by the under-par and over-par explainers. */
const TOURNAMENT_CARD: ScorecardShape = {
  holes: [
    { number: 1, par: 4 },
    { number: 2, par: 4 },
    { number: 3, par: 5 },
    { number: 4, par: 3 },
    { number: 5, par: 4 },
    { number: 6, par: 4 },
    { number: 7, par: 4 },
    { number: 8, par: 3 },
    { number: 9, par: 5 },
  ],
  rows: [
    {
      name: 'Player A',
      strokes: [4, 3, 4, 3, 4, 4, 5, 3, 4],
      note: '-3 after nine',
      highlight: true,
    },
    { name: 'Player B', strokes: [5, 4, 5, 3, 4, 6, 4, 3, 5], note: '+3 after nine' },
  ],
  caption:
    'Two nines against a par of 36. Player A went round in 34, Player B in 39. The leaderboard shows -3 and +3, never 34 and 39.',
  notes: [
    { label: 'Player A, hole 2', explanation: 'Three on a par 4: a birdie, taking them to -1.' },
    { label: 'Player A, hole 7', explanation: 'Five on a par 4: a bogey, giving one back.' },
    {
      label: 'Player B, hole 6',
      explanation: 'Six on a par 4: a double bogey, the single most expensive hole on either card.',
    },
  ],
};

export const GOLF_SCORING_AND_COURSE: ExplainerSeed[] = [
  // ══ Scoring ════════════════════════════════════════════════════════════════
  scoringTerm({
    slug: 'eagle',
    title: 'What Is an Eagle?',
    category: 'scoring',
    aliases: ['eagle', 'what is an eagle', 'eagle in golf'],
    summary: 'Two strokes under par on a single hole.',
    order: 130,
    sourceKeys: PAR_SRC,
    explanation: `An eagle is a hole played in two strokes fewer than its par: three on a par 5, two on a par 4, and a hole-in-one on a par 3.

Nearly all eagles are made on par 5s, by reaching the green in two and holing the putt, or by holing a pitch for the third shot.`,
    example: `A 520-yard par 5 with a flat approach. A long drive leaves 240 yards, a fairway wood finds the green, and a 30-foot putt drops. Three strokes on a par 5 is an eagle.`,
    onTheLeaderboard: `An eagle moves a player two lower at once, which is why leaderboards move so violently on reachable par 5s. Scorecard notation is a double circle.`,
    whyItMatters: `Eagles are the reason a reachable par 5 changes a tournament's shape. A hole where the field averages 4.6 strokes is one where a player who is behind can gain two on the leaders in a single swing, and it turns the closing stretch into a genuine risk-and-reward decision rather than a procession.`,
    misunderstandings: `**An eagle on a par 3 is a hole-in-one,** and everybody calls it that instead. The word "eagle" is essentially never used for it.

**Reaching a par 5 in two is not an eagle.** It is an eagle *chance*. The putt still has to go in, and from 40 feet it usually does not.`,
    related: ['birdie', 'albatross', 'hole-in-one', 'par-5-hole', 'golf-scoring-explained'],
  }),

  scoringTerm({
    slug: 'albatross',
    title: 'What Is an Albatross?',
    category: 'scoring',
    aliases: ['albatross', 'double eagle', 'what is an albatross', 'albatross in golf'],
    summary: 'Three strokes under par on a single hole, and one of the rarest scores in the sport.',
    order: 140,
    sourceKeys: PAR_SRC,
    explanation: `An albatross is three under par on a hole: two on a par 5, or a hole-in-one on a par 4. Americans usually call it a **double eagle**; the rest of the golfing world calls it an albatross.

It is far rarer than a hole-in-one. Making one requires reaching a par 5 in two shots *and* holing the second, which is a combination of enormous distance and considerable luck.`,
    example: `A 505-yard par 5 running downwind. A drive of 320 yards leaves 185 to a front pin, and the second shot pitches once and rolls in. Two strokes on a par 5: an albatross.`,
    onTheLeaderboard: `Three shots gained on one hole. It is scarce enough that most professionals never make one in a career, and the ones made in major championships are remembered individually by name and year.`,
    whyItMatters: `Mostly as a curiosity, but it is a useful illustration of how skewed golf's scoring distribution is. The gap between the best possible hole and par is small; the gap between par and the worst possible hole is unbounded. That asymmetry is the entire argument for conservative course management.`,
    misunderstandings: `**"Double eagle" and "albatross" are the same score.** Two names, one thing, split roughly along transatlantic lines.

**A condor, four under, is not a real category in practice.** It requires a hole-in-one on a par 5 and there are only a handful of credible claims in the sport's history.`,
    related: ['eagle', 'condor', 'hole-in-one', 'par-5-hole'],
  }),

  scoringTerm({
    slug: 'condor',
    title: 'What Is a Condor?',
    category: 'scoring',
    difficulty: 'intermediate',
    aliases: ['condor', 'what is a condor'],
    summary: 'Four strokes under par on a hole: a hole-in-one on a par 5.',
    order: 145,
    sourceKeys: PAR_SRC,
    explanation: `A condor is four under par on a single hole. In practice that means acing a par 5, which requires a drive of roughly 400 yards finding the hole.

Every credible instance has involved something extreme: a sharply downhill hole, considerable altitude, a severe dogleg cut across, or all three.`,
    example: `A dogleg par 5 where the green sits 350 yards away over a corner that the card measures at 500. A drive cutting the corner, landing on a downslope and running out.`,
    onTheLeaderboard: `Effectively never seen. There is no established scorecard notation for it, which tells you how often it is needed.`,
    misunderstandings: `**It is not an officially recognised category** in the way birdie and eagle are. It is a name golfers agreed on for a thing that almost never happens.`,
    related: ['albatross', 'hole-in-one', 'par-5-hole'],
  }),

  scoringTerm({
    slug: 'double-bogey',
    title: 'What Is a Double Bogey?',
    category: 'scoring',
    aliases: ['double bogey', 'what is a double bogey', 'double bogey in golf'],
    summary: 'Two strokes over par on a single hole.',
    order: 160,
    sourceKeys: PAR_SRC,
    explanation: `A double bogey is two over par on a hole: six on a par 4, five on a par 3, seven on a par 5. Three over is a triple bogey, and beyond that golfers generally stop counting up and just say the number.

Almost all double bogeys have the same cause: a penalty stroke, or a shot that leaves the next one impossible.`,
    example: `A par 4. The drive goes out of bounds. Under stroke-and-distance the player replays from the tee, now lying three. That ball finds the green, two putts, and the hole is a six.

One bad swing became two dropped shots, because a penalty stroke costs a stroke *and* the distance.`,
    onTheLeaderboard: `Two shots given back at once, which is why a single double bogey undoes two birdies. Scorecard notation is a double square.`,
    whyItMatters: `Double bogeys are the reason the professional game is more conservative than it looks. Making a birdie gains one shot on the field; making a double loses two, and the disaster hole is far easier to make than the eagle.

That asymmetry is the entire argument behind laying up, aiming at the fat part of the green and hitting three wood off a tight tee.`,
    misunderstandings: `**A double bogey is not usually two bad shots.** It is normally one bad shot plus a penalty, or one bad shot followed by an ambitious recovery that fails.

**In net stroke play there is usually a cap.** The World Handicap System limits any hole to a net double bogey for score-posting, so one catastrophic hole does not distort a player's handicap.`,
    related: [
      'bogey',
      'penalty-stroke',
      'stroke-and-distance',
      'net-double-bogey',
      'why-one-bad-hole-matters',
    ],
  }),

  scoringTerm({
    slug: 'hole-in-one',
    title: 'What Is a Hole-in-One?',
    category: 'scoring',
    alsoIn: ['glossary'],
    aliases: ['hole in one', 'hole-in-one', 'ace', 'what is a hole in one'],
    summary: 'Holing the tee shot: one stroke on a hole, almost always a par 3.',
    order: 170,
    sourceKeys: PAR_SRC,
    explanation: `A hole-in-one, or an **ace**, is a tee shot that finishes in the hole. On a par 3 that is a birdie; on a par 4 it is an albatross.

It requires no putt, no approach and no second chance. Estimates of the odds vary widely by source and by golfer, but every serious estimate puts an amateur's chance on a given par 3 at worse than one in ten thousand.`,
    example: `A 155-yard par 3. A seven iron pitches ten feet short of the flag, takes the slope, and disappears. One stroke.`,
    onTheLeaderboard: `Scored as a 1. On a par 3, the player moves two lower against par, exactly as for any birdie... which is the point below.`,
    whyItMatters: `Almost entirely for the story. Its competitive value is that of a birdie on a par 3, which is real but ordinary, and the reason it looms so large is that most golfers will play their whole lives without one.

The tradition of buying a round for the clubhouse afterwards is why some golfers carry hole-in-one insurance for club competitions, which is not a joke.`,
    misunderstandings: `**A hole-in-one on a par 3 is worth exactly one shot more than a birdie there,** not several. It is a two-under-par hole, an eagle by strict definition, and no more valuable on the card than any other eagle.

**It has to be the tee shot.** Holing out from anywhere else, however spectacular, is a chip-in or a hole-out, not an ace.`,
    related: ['ace', 'eagle', 'par-3-hole', 'birdie'],
  }),

  scoringTerm({
    slug: 'even-par',
    title: 'What Does Even Par Mean?',
    category: 'scoring',
    aliases: ['even par', 'level par', 'what does even par mean', 'E in golf'],
    summary: 'A score exactly equal to par, shown on a leaderboard as E.',
    order: 180,
    sourceKeys: PAR_SRC,
    explanation: `Even par means a player's total is exactly par: 72 strokes on a par-72 course, or 288 after four rounds of it.

Leaderboards show it as **E** rather than 0, which is a convention with no particular reason behind it beyond long habit.`,
    example: `A round with three birdies and three bogeys is even par. So is a round of eighteen straight pars, which is far rarer and considerably duller.`,
    onTheLeaderboard: `**E** sits between the red numbers (under par) and the black or blue ones (over par). A player who is E after two rounds has taken exactly as many strokes as par for 36 holes.`,
    whyItMatters: `Even par is the natural dividing line, and at difficult venues it is often close to the cut line and sometimes close to the winning score. A US Open where the winner finishes at even par is telling you something specific about the setup: that the course, rather than the field, was the story.`,
    misunderstandings: `**Even par is not an average round.** For a club golfer it is an exceptional one. For a tour professional on a soft course it is a poor day.

**"E" is not zero strokes.** It is a full round, exactly at par.`,
    related: ['par', 'under-par-scores', 'over-par-scores', 'reading-a-leaderboard'],
  }),

  scoringTerm({
    slug: 'under-par-scores',
    title: 'What Does -5 Mean in Golf?',
    category: 'scoring',
    aliases: ['-5 in golf', 'minus 5 golf', 'under par', 'what does under par mean', 'red numbers'],
    summary: 'Five strokes fewer than par: the lower the number, the better the player is doing.',
    order: 190,
    sourceKeys: PAR_SRC,
    explanation: `A score of -5 means five strokes fewer than par for everything the player has completed.

If that is one round of a par-72 course, they shot 67. If it is two rounds, they have taken 139 against a par of 144. The minus number carries across rounds; the raw totals do not need to be quoted at all.`,
    example: `Six birdies and one bogey in a round is -5. So is five birdies and no bogeys. Both are shown identically on the leaderboard, which is the one thing the notation loses.`,
    onTheLeaderboard: `Under-par scores are shown in red on almost every broadcast and app, which is why "in red numbers" means "under par". The leader has the most negative score and sits at the top, so the list is sorted ascending by a number that gets smaller as play gets better.`,
    whyItMatters: `Because everything is quoted this way. Prize money, cut lines, playoff qualification and the entire drama of a Sunday afternoon are expressed in these numbers, and a viewer who reads -5 as worse than -2 has the leaderboard exactly upside down.`,
    misunderstandings: `**More negative is better.** -12 leads -5 by seven shots.

**The number is cumulative, not per round.** A player at -5 through three rounds might have shot 69, 74 and 68.

**It is not a comparison to the field.** It is a comparison to par. On a brutal day the whole field can be over par, and +2 can lead.`,
    related: ['par', 'even-par', 'over-par-scores', 'reading-a-leaderboard'],
    scorecard: TOURNAMENT_CARD,
  }),

  scoringTerm({
    slug: 'over-par-scores',
    title: 'What Does +5 Mean in Golf?',
    category: 'scoring',
    aliases: ['+5 in golf', 'plus 5 golf', 'over par', 'what does over par mean'],
    summary: 'Five strokes more than par: the higher the number, the worse the player is doing.',
    order: 200,
    sourceKeys: PAR_SRC,
    explanation: `A score of +5 means five strokes more than par for everything played so far. On a par-72 course, a single round of +5 is a 77.

For a tour professional, +5 in a tournament usually means missing the cut. For an average club golfer, +5 for a round would be the best day of their life.`,
    example: `Five bogeys and thirteen pars is +5. So is one triple bogey, one birdie and a double: three holes to lose five shots, which is how it usually actually happens.`,
    onTheLeaderboard: `Over-par scores are shown in black or blue against red for under par, and sit below E in the standings. Players are listed in ascending order, so the +5s are a long way down the page.`,
    whyItMatters: `The cut line is expressed in these terms, and it is the number that decides whether half the field plays the weekend. "The cut is at +2" is a complete statement of who survives.`,
    misunderstandings: `**+5 is not five bad holes.** In practice it is usually two or three, because bad holes are rarely bogeys.

**It is not a bad score in absolute terms.** It is a bad score for a professional. Context is everything, and this is precisely what the handicap system exists to formalise.`,
    related: ['par', 'even-par', 'under-par-scores', 'cut-line', 'golf-handicap-explained'],
  }),

  standard({
    slug: 'reading-a-scorecard',
    title: 'How to Read a Scorecard',
    category: 'scoring',
    aliases: ['golf scorecard', 'how to read a scorecard', 'reading a golf scorecard'],
    summary:
      'Six columns explained: hole, yardage, par, stroke index, strokes taken and the total.',
    order: 210,
    readMinutes: 5,
    sourceKeys: [...PAR_SRC, { key: 'rules-of-handicapping' }],
    explanation: `A scorecard is a grid with one column per hole and several rows of fixed information above the space where you write your score.

Reading it in order: the **hole number**, the **yardage** from each set of tees, the **par**, and the **stroke index**. Then the rows you fill in.`,
    howItWorks: `**Yardage.** Usually several rows, one per set of tees, colour-coded. Play the tees whose total length suits your game, not the ones at the back.

**Par.** The standard for the hole. The nine-hole and eighteen-hole totals are printed at the end of the row.

**Stroke index (SI or HCP).** A ranking from 1 to 18 of the holes by difficulty, where 1 is hardest. This is the column nobody explains: it says *where* handicap strokes are given. A player receiving 7 shots gets one each on the holes indexed 1 to 7.

**Your score.** One box per hole. Add up the front nine, the back nine, and the total. In a competition the card is kept by a marker, not by you, and both of you sign it.

**Net score.** Gross total minus handicap strokes. In a Stableford competition the card converts each hole to points instead.`,
    example: `Hole 4: 448 yards, par 4, stroke index 1. It is the hardest hole on the course, so anybody receiving even a single shot receives it here.

A 14-handicapper takes 6. Gross six, minus one shot, net five: one over the net par of five, and worth one Stableford point.`,
    whyItMatters: `The card is the official record. In a competition, a signed card with a wrong score is the player's responsibility, and a signed score lower than the one actually taken is disqualification. This is why professionals are seen carefully checking cards in a scoring tent for several minutes.`,
    misunderstandings: `**Stroke index is not the same as par.** SI 1 is the hardest hole, not the longest, and a par 3 can have a low index.

**The odd and even indexes are split deliberately across the nines,** so a nine-hole match distributes shots fairly rather than concentrating them.

**You do not calculate your own net score during play** in most competitions; the committee does. Your job is the gross number in each box.`,
    related: [
      'stroke-index',
      'gross-vs-net-score',
      'course-handicap',
      'stableford',
      'golf-scoring-explained',
    ],
  }),

  standard({
    slug: 'reading-a-leaderboard',
    title: 'How to Read a Golf Leaderboard',
    category: 'scoring',
    alsoIn: ['tournaments'],
    aliases: ['golf leaderboard', 'how to read a golf leaderboard', 'leaderboard explained'],
    summary:
      'Position, player, score to par, today, and thru: five columns that describe a tournament.',
    order: 220,
    sourceKeys: [{ key: 'pga-tour-stats' }],
    explanation: `A golf leaderboard is sorted by score against par, lowest first. The columns are almost always the same five.

**POS** is position, with a T for a tie: "T4" means joint fourth. **TOTAL** is the score against par for the whole tournament. **TODAY** is the score against par for the current round only. **THRU** is how many holes of the current round the player has completed, with F for finished.`,
    howItWorks: `The key is that different players are at different points in their round, because a field of 150 cannot start at once. A player at -6 THRU 9 has played half as much golf as one at -6 THRU F, and is doing considerably better.

**Tee times.** Half the field goes out in the morning and half in the afternoon, and they swap for round two. On a windy day that is a genuine advantage to one half.

**The cut line.** After 36 holes the field is reduced. Leaderboards mark the projected cut line with a dividing rule, and it moves as scores come in.

**Playoffs.** If the leaders tie after 72 holes, the leaderboard shows them level and the event goes to extra holes.`,
    example: `A player shown as **T2 | -9 | -4 | 13** is tied for second, nine under for the tournament, four under for today, and has played 13 holes of the current round. With five to play, they have more chances left than the leader who has finished.`,
    whyItMatters: `THRU is the column that turns a static list into a live picture. Without it, a leaderboard is a snapshot of unequal amounts of golf, and the "leader" at any given hour is frequently someone who started early and will be passed.`,
    misunderstandings: `**The top of the board is not always the leader in any meaningful sense.** Early finishers sit high while the late groups are still playing.

**"Today" and "Total" are both to par,** not raw strokes. A player at -4 today shot 68 on a par 72.

**A projected cut line is a projection,** and it moves. Players are not eliminated until the second round is complete.`,
    related: ['under-par-scores', 'the-cut', 'cut-line', 'tee-times', 'playoff'],
  }),

  // ══ The course ═════════════════════════════════════════════════════════════
  courseFeature({
    slug: 'tee-box',
    title: 'Tee Box Explained',
    category: 'the-course',
    aliases: ['tee box', 'teeing ground', 'teeing area', 'tee'],
    summary:
      'The marked rectangle each hole starts from, and the only place a tee peg may be used.',
    order: 310,
    sourceKeys: [...COURSE, ...RULES],
    ruleSensitive: true,
    whereItIs: `The teeing area is a closely mown rectangle at the start of each hole, marked by two tee markers. The area is two club-lengths deep, measured back from the line between the markers.

Most courses have several sets of markers at different distances, usually colour-coded, so the same hole can be played at very different lengths.`,
    howItPlays: `The ball must be played from within the teeing area, though the player may stand outside it. The ball may be placed on a tee peg, on the ground, or on sand or another natural substance.

This is the one place in golf where you improve your own lie deliberately and legally, and it is why the tee shot is the most controllable shot on the hole.`,
    strategy: `Where you tee the ball up within the rectangle is a free choice worth using. Teeing on the same side as the trouble and aiming away from it opens up the angle of the hole, because the widest available line runs diagonally across the fairway.

Playing the correct set of tees matters more than most golfers admit. A course played from tees 800 yards too long turns every par 4 into a par 5 and every round into a slog.`,
    misunderstandings: `**Playing from outside the teeing area is a penalty,** and in stroke play the stroke does not count: the player must replay from inside it with a two-stroke penalty.

**The markers are the front edge, not the whole area.** You may tee up to two club-lengths behind them.

**Tee pegs are legal only here.** Everywhere else, the ball is played as it lies.`,
    related: ['teeing-ground-choices', 'tee-shot', 'honours-on-the-tee', 'rules-of-golf'],
  }),

  courseFeature({
    slug: 'fairway',
    title: 'Fairway Explained',
    category: 'the-course',
    aliases: ['fairway', 'the fairway', 'short grass'],
    summary:
      'The closely mown corridor between tee and green, and the place you are trying to hit.',
    order: 320,
    sourceKeys: COURSE,
    whereItIs: `The fairway is the strip of short grass running from the tee area towards the green, usually 25 to 50 yards wide. It is bordered by longer **rough** on both sides.

The Rules of Golf do not recognise "fairway" as a defined area at all: to the Rules it is simply part of the general area, and it has no special status. It is a maintenance category that happens to matter enormously in practice.`,
    howItPlays: `Cut short, the ball sits up on top of the grass. The clubface meets the ball cleanly, spin is predictable and the shot behaves the way the player expects.

That predictability is the whole value. From the fairway a professional knows their approach will carry the expected distance and stop where they aim; from the rough they know neither.`,
    strategy: `Hitting fairways is worth less than beginners assume and more than the "bomb and gouge" argument allows. A 300-yard drive in light rough is usually better than a 250-yard drive in the fairway, because distance to the green dominates. But a 300-yard drive in *thick* rough, or behind a tree, is much worse than either.

That is why driving distance and driving accuracy are both poor statistics on their own, and why Strokes Gained: Off the Tee exists.`,
    misunderstandings: `**A fairway hit is a binary statistic and a crude one.** A ball one inch into the rough counts as a miss; a ball 60 yards offline in the fairway of an adjacent hole counts as a miss too, and they are not the same shot.

**Fairways are not always the shortest route.** On a dogleg the aggressive line crosses rough or trees deliberately.`,
    related: [
      'rough',
      'fairways-hit',
      'driving-accuracy',
      'tee-shot-strategy',
      'strokes-gained-off-the-tee',
    ],
  }),

  courseFeature({
    slug: 'rough',
    title: 'Rough Explained',
    category: 'the-course',
    aliases: ['rough', 'the rough', 'long grass'],
    summary:
      'The longer grass flanking the fairway, where the ball sits down and control disappears.',
    order: 330,
    sourceKeys: COURSE,
    whereItIs: `The rough is the longer grass either side of the fairway and around the green. Most courses have graduated rough: a short first cut, then progressively longer bands further from the fairway.

Like the fairway, it is not a defined area under the Rules. It is simply part of the general area, played as it lies.`,
    howItPlays: `The ball settles down into the grass, so the club catches grass before it reaches the ball. Three things follow, and they are the whole reason rough is a penalty:

**Less spin.** Grass between the face and the ball prevents the grooves from gripping, so the ball flies with less backspin and runs on landing rather than stopping.

**Less control of distance.** A shot from rough can come out hot, with no spin and extra roll, or be smothered entirely. The player cannot reliably tell which in advance.

**A "flyer" lie** is the specific trap: a ball sitting up in light rough can fly ten or fifteen yards further than a clean strike, over the back of the green.`,
    strategy: `The correct play from thick rough is usually the wedge back to the fairway, and it is the shot amateurs refuse to play. Attempting a 200-yard recovery from deep grass fails often enough that the expected cost exceeds the two strokes it hopes to save.

Around the green, greenside rough is a different problem again: the grass grabs the club, so the shot needs speed rather than finesse.`,
    misunderstandings: `**Rough is not uniform.** "In the rough" describes anything from a perfect lie in the first cut to a ball sitting in six inches of grass, and the two shots have almost nothing in common.

**US Open rough and links rough are different beasts.** Thick, watered American rough stops the ball; wispy links rough lets it run into worse places.`,
    related: [
      'fairway',
      'greenside-rough',
      'recovery-shot',
      'rough-length',
      'playing-away-from-trouble',
    ],
  }),

  courseFeature({
    slug: 'green',
    title: 'Green Explained',
    category: 'the-course',
    alsoIn: ['putting-and-short-game'],
    aliases: ['green', 'the green', 'putting green'],
    summary:
      'The very short grass surrounding the hole, where the ball is putted rather than struck.',
    order: 340,
    sourceKeys: [...COURSE, ...RULES],
    ruleSensitive: true,
    whereItIs: `The putting green is the specially prepared area containing the hole. Unlike the fairway, this **is** a defined area under the Rules, and a distinct set of rules applies once your ball is on it.

The hole itself is 4.25 inches across and at least four inches deep, marked by a flagstick.`,
    howItPlays: `On the green, and only on the green, you may mark your ball, lift it, clean it and replace it in the same spot. You may repair damage, including pitch marks and old hole plugs and, since 2019, spike marks. You may leave the flagstick in the hole while putting, or have it removed.

If your ball is on the green and it strikes another ball on the green, in stroke play you get two penalty strokes, which is why balls near your line are marked.

Greens are cut to a few millimetres and rolled, which produces the speed measured on a **Stimpmeter**.`,
    strategy: `Greens are almost never flat. A putt breaks with the slope, and the read is a combination of slope, speed and, on some grasses, **grain**.

The approach shot matters more than the putt. Being 20 feet below the hole on a sloping green is a genuine birdie chance; being 20 feet above it is a defensive two-putt, and the difference was decided one shot earlier.`,
    misunderstandings: `**The fringe is not the green.** Green rules apply only to the closely mown putting surface, so a ball on the fringe may not be lifted and cleaned.

**You do not have to putt on the green.** Any club is legal. A putt is simply almost always the highest-percentage option.

**Flagstick in or out is a free choice** since the 2019 Rules changes, with no penalty either way.`,
    related: [
      'fringe',
      'putting-explained',
      'green-speed',
      'break',
      'reading-a-green',
      'flagstick-rules',
    ],
  }),

  courseFeature({
    slug: 'fringe',
    title: 'Fringe Explained',
    category: 'the-course',
    aliases: ['fringe', 'apron', 'collar', 'the fringe'],
    summary:
      'The band of slightly longer grass ringing the green, where green rules stop applying.',
    order: 350,
    sourceKeys: [...COURSE, ...RULES],
    ruleSensitive: true,
    whereItIs: `The fringe, also called the apron or collar, is the ring of grass around the putting green, cut longer than the green but far shorter than the rough. It is typically a yard or two wide.`,
    howItPlays: `The distinction is entirely a rules one, and it catches people out constantly. On the green you may mark, lift and clean your ball; on the fringe you may not, because the fringe is part of the general area.

The ball still rolls fairly truly on it, so putting from the fringe is a normal and sensible play, especially on firm courses.`,
    strategy: `From the fringe the choice is putt, chip or pitch, and the general principle is to use the least lofted club that will do the job. A putt's worst outcome is much better than a chip's worst outcome, and from two feet off the green it will very often finish closer.

This is the shot behind the nickname **Texas wedge**, which simply means a putter used from off the green.`,
    misunderstandings: `**A ball on the fringe is not on the green,** whatever it looks like. Lifting and cleaning it costs a penalty stroke.

**The fringe is not the "first cut".** The first cut usually refers to the light rough beside a fairway, which is a different piece of ground doing a different job.`,
    related: ['green', 'chip-shot', 'bump-and-run', 'texas-wedge', 'putting-explained'],
  }),

  definition({
    slug: 'texas-wedge',
    title: 'Texas Wedge',
    category: 'glossary',
    aliases: ['texas wedge'],
    summary: 'A putter used from off the green.',
    order: 2210,
    explanation: `Golfers named it after the firm, windy Texas courses where putting from twenty yards short of the green was often the sensible shot. It is a compliment to the tactic rather than a criticism of it.`,
    example: `A ball ten yards short of the green on tight, dry turf. Rather than chip, the player putts it, accepting a slightly bumpy first few feet in exchange for eliminating the possibility of a fluffed chip.`,
    related: ['fringe', 'chip-vs-pitch', 'bump-and-run', 'putter'],
  }),
];
