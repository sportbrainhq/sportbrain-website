import { penalty, procedure, rule, standard } from './golf-explainer-helpers';
import type { ExplainerSeed, HoleShape } from './explainer-types';

/**
 * The Rules of Golf, the penalties and the relief procedures.
 *
 * The brief asks for diagrams here more than anywhere else, and it is right to.
 * A relief procedure is a geometric construction: a reference point, a fixed
 * radius, a constraint on which direction is allowed, and a rule about where
 * the ball must come to rest. Prose describing that is a paragraph nobody can
 * follow standing in a bunker; a drawing of it is obvious in two seconds.
 *
 * ## On paraphrasing the Rules
 *
 * Every page here describes the shape of a Rule in SportBrainHQ's own words and
 * says so. None of them reproduces the Rule's text, and none of them should be
 * relied on to settle a dispute: the pages say that explicitly where a reader
 * could plausibly lose a stroke by trusting a summary. A rulebook's expression
 * is not ours to reuse, and a confidently-worded bad paraphrase of a Rule is
 * considerably worse than no page at all.
 *
 * Everything here carries `ruleSensitive: true` and a `sourceRevision`, so the
 * set to re-audit after a Rules revision is a query.
 */

const RULES = [{ key: 'rules-of-golf' }, { key: 'usga-rules' }];
const REVISION = 'Rules of Golf, 2023 edition (R&A / USGA)';
const REVIEWED = '2026-08-31';

/** The relief-area construction, drawn once and reused by the relief pages. */
const RELIEF_AREA: HoleShape = {
  hole: 'plan',
  features: [
    {
      kind: 'rough',
      points: [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 },
      ],
      label: 'General area',
    },
    {
      kind: 'fairway',
      points: [
        { x: 10, y: 10 },
        { x: 90, y: 10 },
        { x: 90, y: 90 },
        { x: 10, y: 90 },
      ],
      label: 'Fairway',
    },
  ],
  steps: [
    {
      caption:
        'Step 1: find the reference point. For free relief this is the nearest point of complete relief; for an unplayable ball it is where the ball lies.',
      markers: [
        { x: 40, y: 45, label: 'Ball', kind: 'ball' },
        { x: 50, y: 52, label: 'Reference point', kind: 'target' },
        { x: 50, y: 95, label: 'Hole', kind: 'pin' },
      ],
    },
    {
      caption:
        'Step 2: measure the relief area. One club-length for free relief, two for penalty relief, measured with the longest club in the bag other than the putter.',
      markers: [
        { x: 50, y: 52, label: 'Reference point', kind: 'target' },
        { x: 72, y: 52, label: 'One club-length', kind: 'yardage' },
        { x: 50, y: 95, label: 'Hole', kind: 'pin' },
      ],
    },
    {
      caption:
        'Step 3: the relief area may not be nearer the hole than the reference point, so only the half of the circle away from the hole is available.',
      markers: [
        { x: 50, y: 52, label: 'Reference point', kind: 'target' },
        { x: 50, y: 95, label: 'Hole', kind: 'pin' },
        { x: 50, y: 30, label: 'Available: not nearer the hole', kind: 'target' },
        { x: 50, y: 74, label: 'Not available: nearer the hole', kind: 'trouble' },
      ],
    },
    {
      caption:
        'Step 4: drop from knee height, and the ball must come to rest within the relief area. If it rolls out, drop again; if the second drop rolls out too, place it where the second drop first touched the ground.',
      markers: [
        { x: 46, y: 36, label: 'Dropped and at rest', kind: 'ball' },
        { x: 50, y: 95, label: 'Hole', kind: 'pin' },
      ],
    },
  ],
  caption:
    'The relief area: a reference point, a fixed number of club-lengths, and a constraint that it may never be nearer the hole.',
};

export const GOLF_RULES_AND_RELIEF: ExplainerSeed[] = [
  standard({
    slug: 'rules-of-golf',
    title: 'Rules of Golf Explained',
    category: 'rules',
    aliases: ['rules of golf', 'golf rules', 'the rules of golf'],
    summary:
      'One code, published jointly by the R&A and USGA, built on two principles and a set of exceptions.',
    isStartHere: true,
    order: 1300,
    readMinutes: 5,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    explanation: `Golf is governed by a single code, the Rules of Golf, written and maintained jointly by the R&A and the USGA and revised every four years. The same Rules apply to a club medal and to The Open.

Almost everything in them follows from two principles:

**Play the course as you find it.** You do not improve your lie, your stance, your swing or your line of play.

**Play the ball as it lies.** Where it stops is where you play from, unless a Rule says otherwise.

The rest of the code is essentially the list of situations where the second principle would be unreasonable, and what to do instead.`,
    howItWorks: `The course is divided into five areas, and which one your ball is in determines what you may do:

- **The general area**, which is everything not in one of the four below. Fairway and rough are both general area.
- **The teeing area** of the hole you are playing.
- **Penalty areas**, marked red or yellow.
- **Bunkers**.
- **The putting green** of the hole you are playing.

Relief comes in two kinds. **Free relief** costs nothing and covers abnormal course conditions: temporary water, ground under repair, immovable obstructions like cart paths, and animal holes. **Penalty relief** costs a stroke and covers situations of the player's own making: an unplayable ball, a ball in a penalty area, a ball lost or out of bounds.

Both use the same construction: a reference point, a relief area measured in club-lengths, and a drop from knee height.`,
    whyItMatters: `The Rules are the reason golf can be self-officiated. There is no referee walking with a club fourball, and the player calls penalties on themselves, including ones nobody else saw.

Knowing the relief procedures also saves real strokes. A player who does not know they get free relief from a cart path plays an unnecessary awkward shot; one who does not know the unplayable ball options takes a worse drop than they were entitled to.`,
    misunderstandings: `**There is no "winter rules" in the Rules of Golf.** Preferred lies are a Local Rule a committee may adopt, not part of the code.

**Local Rules are real Rules.** The committee can modify specific provisions, and the tournament hard card overrides your assumptions.

**This page is a summary and not authoritative.** For anything that could cost a stroke, check the Rule itself or ask the committee: an approximate paraphrase is exactly how a player ends up taking a drop in the wrong place.`,
    takeaways: `- Two principles: play the course as you find it, play the ball as it lies.
- Five areas of the course, and the area decides your options.
- Free relief for conditions you did not cause; penalty relief for the rest.
- Every relief procedure is a reference point, a relief area and a drop.
- Golf is self-officiated, so knowing the Rules is part of playing well.`,
    related: [
      'play-it-as-it-lies',
      'free-relief',
      'penalty-relief',
      'drop-procedure',
      'relief-area',
      'penalty-areas-explained',
    ],
  }),

  procedure({
    slug: 'drop-procedure',
    title: 'Drop Procedure Explained',
    category: 'penalties-and-relief',
    aliases: ['drop', 'how to drop a golf ball', 'drop procedure', 'knee height drop'],
    summary:
      'Drop from knee height into a defined relief area, and the ball must come to rest inside it.',
    isFeatured: true,
    order: 1400,
    readMinutes: 5,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theProcedure: `Every drop in golf, free or penalty, uses the same four-step construction. The only things that change between Rules are the reference point and the size of the relief area.

**1. Establish the reference point.** For free relief it is the nearest point of complete relief. For an unplayable ball it is where the ball lies. For back-on-the-line relief it is a point you choose on a line running back from the hole through where the ball was.

**2. Measure the relief area.** One club-length for free relief, two club-lengths for most penalty relief, measured with the longest club in your bag other than the putter. That club length is fixed for the round.

**3. Apply the constraints.** The relief area is never nearer the hole than the reference point, and for free relief it must be in the same area of the course. That is why the available area is a half-circle rather than a circle.

**4. Drop and check.** Hold the ball at **knee height**, standing or crouching, and let it fall without spinning it or bouncing it off anything. It must land in the relief area and come to rest in it.

If the ball comes to rest outside the area, drop a second time. If the second drop also fails, **place** the ball where it first touched the ground on that second drop.`,
    diagram: RELIEF_AREA,
    whyItMatters: `Getting the construction wrong means playing from a **wrong place**, which is a two-stroke penalty in stroke play, and a serious breach can mean disqualification if it is not corrected before the next tee shot.

The knee-height rule is the one most often got wrong, because it changed in 2019: it was shoulder height for decades, and players who learned the game before then still reach for their shoulder.`,
    formatDifferences: `**Match play**: a wrong-place breach costs the hole rather than two strokes.

**Local Rules**: many courses and tournaments adopt the Model Local Rule allowing a two-stroke alternative to stroke-and-distance for a ball lost or out of bounds. Where it is in force it changes the options, though it is not used in elite competition.`,
    misunderstandings: `**Knee height means the height of your knee when standing,** not the height of your knee when you are crouched down. You may crouch; the ball still starts from where your knee is when upright.

**You do not re-drop because you dislike the lie.** Only because the ball finished outside the relief area.

**The ball may touch you or your equipment after it lands** without penalty, provided it was dropped correctly and comes to rest in the relief area.`,
    related: [
      'relief-area',
      'nearest-point-of-relief',
      'free-relief',
      'penalty-relief',
      'unplayable-ball-relief',
      'wrong-place',
    ],
  }),

  rule({
    slug: 'relief-area',
    title: 'Relief Area Explained',
    category: 'penalties-and-relief',
    difficulty: 'intermediate',
    aliases: ['relief area', 'what is a relief area', 'club lengths relief'],
    summary: 'The measured half-circle a dropped ball must come to rest in.',
    order: 1410,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `A relief area is defined by three things, and the Rule you are using supplies all three:

**The reference point.** Where you measure from.

**The size.** One club-length for free relief, two for most penalty relief, measured with your longest club other than the putter.

**The limits.** Never nearer the hole than the reference point. For free relief, it must also be in the same area of the course as the reference point, so you cannot take relief from a cart path into a bunker or onto the green.

The "not nearer the hole" limit is what turns a circle into a half-circle, and it is the part most often misapplied.`,
    penaltyAndRelief: `Playing from outside the relief area is playing from a **wrong place**: two strokes in stroke play, loss of hole in match play.

If the breach is serious, meaning the player gained a significant advantage, the mistake must be corrected before playing from the next tee, or the player is disqualified.`,
    procedure: `Measure with the club, not by pacing. The Rules define the club-length as your longest club excluding the putter, fixed for the round, and there is no requirement to measure precisely with a device: reasonable judgement is protected.

Marking the edge of the relief area with a tee before dropping is standard practice and worth doing, because a ball that rolls a foot is much easier to judge against a marker than against a memory.`,
    diagram: RELIEF_AREA,
    formatDifferences: `The construction is identical in match play and stroke play; only the penalty for getting it wrong differs.`,
    misunderstandings: `**Two club-lengths is not "about two paces".** For most players a club-length is around 43 inches, which is longer than a pace.

**The relief area is not measured from the ball.** It is measured from the reference point, which for free relief is the nearest point of complete relief and is frequently not where the ball is.

**"Complete relief" means complete.** Relief from a cart path must clear your stance as well as your ball, which often puts the reference point further away than players expect.`,
    related: [
      'drop-procedure',
      'nearest-point-of-relief',
      'free-relief',
      'penalty-relief',
      'wrong-place',
    ],
  }),

  rule({
    slug: 'nearest-point-of-relief',
    title: 'Nearest Point of Complete Relief',
    category: 'penalties-and-relief',
    difficulty: 'advanced',
    aliases: ['nearest point of relief', 'nearest point of complete relief', 'npr'],
    summary:
      'The single nearest spot where the condition no longer interferes, and it is not a choice.',
    order: 1420,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `The nearest point of complete relief is the reference point for all **free** relief. It is the estimated point nearest to where the ball lies that satisfies three conditions at once:

- It is not nearer the hole.
- It is in the same area of the course.
- The condition no longer interferes with the lie of the ball, the area of intended stance, or the area of intended swing.

The word doing the work is **nearest**. It is a single determined point, not the nicest spot within reach, and it may well be in rough, behind a tree, or somewhere you would rather not play from.`,
    penaltyAndRelief: `Free relief costs nothing. Determine the point, measure one club-length from it not nearer the hole and in the same area, and drop.

Estimating it wrong is not itself a penalty: the Rules protect reasonable judgement in determining the point. Dropping outside the resulting relief area is a wrong-place penalty.`,
    procedure: `The practical method, used by referees:

**1.** Identify the stroke you would have made without the condition, including which club you would have used and which way you would have played.

**2.** Simulate the address position at candidate points, checking that neither the lie, the stance nor the swing is affected by the condition.

**3.** Compare the candidates and take the nearest one to the original ball position. On a cart path, that means checking both sides: the nearest point is frequently on the side you do not want.

**4.** Mark it, then measure the one club-length relief area from it.`,
    inPractice: `A right-handed player whose ball is on the left edge of a cart path will usually find the nearest point on the left, because moving right requires crossing the whole path. That is why a player can end up taking relief into deeper rough than the path itself offered, and it is entirely correct.

The player may always decline free relief and play the ball as it lies, and sometimes should.`,
    formatDifferences: `Identical in both formats. The penalty for a resulting wrong place differs, as always.`,
    misunderstandings: `**It is not the nicest point of relief.** Nearest is nearest, even if it is worse.

**It must clear stance and swing, not just the ball.** A ball beside a cart path with a foot on the path still has interference.

**There is no nearest point of relief for penalty relief.** Unplayable balls and penalty areas use different reference points entirely.`,
    related: [
      'free-relief',
      'relief-area',
      'cart-path-relief',
      'drop-procedure',
      'temporary-water',
    ],
  }),

  penalty({
    slug: 'stroke-and-distance',
    title: 'Stroke-and-Distance Explained',
    category: 'penalties-and-relief',
    difficulty: 'intermediate',
    aliases: ['stroke and distance', 'stroke-and-distance', 'what is stroke and distance'],
    summary:
      'One penalty stroke and a replay from where you last played: golf’s most expensive relief.',
    isFeatured: true,
    order: 1430,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `Stroke-and-distance relief means playing again from where you last played, with one penalty stroke added.

It is the relief of last resort, and it is always available under any circumstances. It is also the **only** relief available when a ball is lost or out of bounds.

The name says exactly what it costs: one **stroke** as a penalty, and the **distance** the original shot travelled, which is thrown away entirely.`,
    penaltyAndRelief: `**One penalty stroke**, plus the loss of the distance.

Add both and a drive out of bounds costs roughly two shots against a drive in the fairway: one for the penalty, and roughly one more because the third shot is played from the tee rather than from 270 yards down the hole. That is why a single out-of-bounds tee shot so often produces a double bogey rather than a bogey.

If the previous stroke was from the teeing area, the ball may be teed again. From the general area or a bunker, it is dropped in a one club-length relief area from the estimated spot. On the green, it is placed.`,
    procedure: `**Playing a provisional** is the practical safeguard. If a ball might be lost outside a penalty area or out of bounds, announce a provisional ball and play it before walking forward. If the original is found in bounds within three minutes, play it and abandon the provisional. If it is not, the provisional becomes the ball in play under stroke-and-distance, and you have saved yourself the walk back.

Announcing it matters. Playing a second ball without saying "provisional" makes that ball the ball in play immediately, under stroke-and-distance, and the original is dead even if you find it.`,
    formatDifferences: `**Match play** applies the same relief with the same penalty stroke; the difference is that a player facing it will often simply concede the hole.

**A Model Local Rule** allows committees at club level to offer a two-stroke alternative that drops near where the ball was lost or crossed the boundary, so that players are not walking back and holding up the course. It is optional, and it is not used in professional competition.`,
    misunderstandings: `**It is not a one-shot penalty in effect.** The penalty stroke is one; the total cost including lost distance is closer to two.

**There is no free drop for a lost ball.** Unless a Local Rule is in force, the only option is to go back.

**A provisional is not a second attempt you can choose between.** If the original is found in play, you must play it, however much better the provisional looks.`,
    related: [
      'lost-ball',
      'out-of-bounds-penalty',
      'provisional-ball',
      'penalty-stroke',
      'why-one-bad-hole-matters',
      'drop-procedure',
    ],
  }),

  rule({
    slug: 'penalty-areas-explained',
    title: 'Penalty Areas Explained',
    category: 'penalties-and-relief',
    aliases: ['penalty area', 'penalty areas', 'water hazard', 'hazard rules'],
    summary:
      'Marked red or yellow, they cost one stroke to escape, and red ones give an extra option.',
    isFeatured: true,
    order: 1440,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `A penalty area is any area from which relief is available for one penalty stroke if the ball is in it. Since 2019 the term has replaced "water hazard", and a committee may mark areas containing no water at all: desert, dense scrub, lava fields.

They come in two colours, and the colour is the whole point:

**Yellow** penalty areas offer two relief options.
**Red** penalty areas offer those two plus a third, lateral option.

You may always play the ball as it lies from a penalty area without penalty, and since 2019 you may ground your club, move loose impediments and take practice swings touching the ground there.`,
    penaltyAndRelief: `**One penalty stroke** for any relief taken.

From a **yellow** penalty area:

1. **Stroke and distance**: replay from where you last played.
2. **Back-on-the-line**: pick a point on the line from the hole through where the ball last crossed the edge of the penalty area, go back as far as you like on that line, and drop within one club-length of your chosen point, not nearer the hole.

From a **red** penalty area, both of the above, plus:

3. **Lateral relief**: drop within two club-lengths of where the ball last crossed the edge, not nearer the hole.

The reference in options 2 and 3 is where the ball **last crossed the edge**, not where it ended up and not where it entered the water.`,
    procedure: `Identifying the crossing point is the step players get wrong, and it is worth taking care over because it decides where you drop. It is a point on the boundary of the marked area, estimated by the player using reasonable judgement, and it is often further back than instinct suggests when a ball has skipped along the surface.

If the ball is known or virtually certain to be in the penalty area, relief is available. If it is merely possible, the ball is lost and stroke-and-distance is the only option.`,
    formatDifferences: `Identical in both formats.

Committees choose which colour to use. A body of water crossing the fairway is usually yellow; one running alongside a hole is usually red, because lateral relief is the only practical option when the crossing point is 200 yards back.`,
    misunderstandings: `**Red is not "worse" than yellow.** Red offers more options, which makes it more generous.

**You are not required to take relief.** If the ball is playable in the penalty area, play it for nothing.

**Grounding your club in a penalty area is legal** since 2019, which is a change from decades of practice. It remains a penalty in a bunker.

**The opposite-side relief option was removed in 2019.** Dropping across a red penalty area is no longer available unless a Local Rule provides it.`,
    related: [
      'red-penalty-area',
      'yellow-penalty-area',
      'penalty-area-relief',
      'back-on-the-line-relief',
      'stroke-and-distance',
      'water-hazard-terminology',
    ],
  }),

  rule({
    slug: 'bunker-rules',
    title: 'Bunker Rules Explained',
    category: 'penalties-and-relief',
    alsoIn: ['the-course'],
    aliases: ['bunker rules', 'rules in a bunker', 'sand trap rules'],
    summary:
      'You may not touch the sand to test it or ground the club, but you may move loose impediments.',
    order: 1450,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `A bunker is a specially prepared area of sand, and it is one of the five defined areas of the course. Grass-covered ground bordering it is not part of it.

Before making a stroke, you must not:

- Deliberately touch the sand to test its condition.
- Touch the sand with your hand or club immediately in front of or behind the ball.
- Touch the sand in a practice swing or in the backswing.

Since 2019 you **may** touch the sand incidentally, lean on a club outside the bunker, and remove loose impediments such as leaves and stones, none of which was allowed before.`,
    penaltyAndRelief: `Breaching those restrictions costs **two strokes** in stroke play, or the hole in match play.

Two relief options exist for an unplayable ball in a bunker:

**Within the bunker**, for one penalty stroke, using the unplayable ball options with the ball staying in the bunker.

**Outside the bunker**, for **two** penalty strokes, dropping on the back-on-the-line option with no restriction on how far back you go. This is the option that lets a player escape a plugged lie under a steep lip, and it is often worth the second stroke.

Free relief is available inside a bunker for abnormal course conditions, such as temporary water, provided the ball stays in the bunker. Complete relief outside the bunker costs one stroke.`,
    inPractice: `Rake the bunker afterwards, and rake it properly: it is etiquette rather than a Rule, but leaving a footprint for the next player is the one breach of manners other golfers genuinely resent.

Raking before your stroke is permitted, provided it does not improve the conditions for your stroke and is done to care for the course.`,
    formatDifferences: `Identical in both formats apart from the penalty. The two-stroke escape option is a genuine tactical decision in stroke play and almost never worth it in match play, where the hole is likely lost either way.`,
    misunderstandings: `**Grounding the club is only forbidden in bunkers,** not in penalty areas, where it has been permitted since 2019.

**Touching the sand accidentally is not a penalty.** The restriction is on testing the condition and on touching immediately around the ball.

**Loose impediments may be removed.** Stones, leaves and twigs, which was a two-stroke penalty before 2019 and is still widely believed to be one.

**The lip and the grass face are not the bunker.** A ball on the grass face is in the general area, with none of these restrictions.`,
    related: [
      'bunker',
      'grounding-the-club',
      'bunker-shot',
      'bunker-relief',
      'what-you-can-do-in-a-bunker',
      'unplayable-ball-relief',
    ],
  }),

  penalty({
    slug: 'penalty-stroke',
    title: 'Penalty Stroke Explained',
    category: 'penalties-and-relief',
    aliases: ['penalty stroke', 'penalty strokes', 'what is a penalty stroke'],
    summary:
      'A stroke added to your score for a breach or for relief, counted exactly like a shot you played.',
    order: 1460,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `A penalty stroke is a stroke added to a player's score that was never physically played. On the card it is indistinguishable from a shot: a hole played in four strokes plus one penalty is a five.

They arise in two ways. Some are the price of relief you chose to take, such as an unplayable ball or a penalty area drop. Others are penalties for a breach, such as moving your ball at rest or playing from a wrong place.`,
    penaltyAndRelief: `The common values:

- **One stroke**: penalty area relief, unplayable ball, stroke-and-distance, causing your own ball to move, lifting a ball without authority.
- **Two strokes** in stroke play, or **loss of hole** in match play: playing a wrong ball, playing from a wrong place, breaching the bunker restrictions, breaching the club limit per hole up to a cap of four.
- **Disqualification**: signing for a score lower than taken on a hole, agreeing to waive a Rule, serious misconduct.

In match play, most two-stroke penalties become loss of hole instead, which is why the two formats need separate Rules at all.`,
    procedure: `Golf is self-officiated. A player who becomes aware of a breach must apply the penalty themselves, including one nobody witnessed, and doing so is treated as a basic obligation rather than as unusual honesty.

If unsure in stroke play, a player may play **two balls**, one under each interpretation, announce which they prefer to count, and have the committee decide before signing the card.`,
    formatDifferences: `The main divergence in the whole code. Match play settles each hole as it is played, so a breach usually costs the hole; stroke play carries totals, so it costs strokes.`,
    misunderstandings: `**A penalty stroke is not "worth less" than a real stroke.** It counts identically.

**Taking relief is often correct despite the penalty.** An unplayable drop for one stroke frequently beats a hacked recovery that costs two.

**Nobody has to catch you.** The player calls it, which is why golf's occasional rules controversies attract as much attention as they do.`,
    related: [
      'golf-penalties-explained',
      'stroke-and-distance',
      'penalty-relief',
      'unplayable-ball',
      'wrong-ball',
      'wrong-place',
    ],
  }),

  rule({
    slug: 'provisional-ball',
    title: 'Provisional Ball Explained',
    category: 'rules',
    difficulty: 'intermediate',
    aliases: ['provisional ball', 'provisional', 'playing a provisional'],
    summary:
      'A second ball played in advance in case the first is lost or out of bounds, announced before you play it.',
    order: 1340,
    sourceKeys: RULES,
    ruleSensitive: true,
    sourceRevision: REVISION,
    lastReviewedAt: REVIEWED,
    theRule: `If your ball may be lost outside a penalty area, or may be out of bounds, you may play a **provisional ball** from where you last played, before going forward to look.

You must **announce** it, using the word "provisional" or otherwise making clear what you are doing. Saying "I'll hit another one" is not enough: without the announcement, the second ball becomes the ball in play under stroke-and-distance immediately, and the original is dead even if you find it sitting in the fairway.

You may continue playing the provisional as you walk forward, as long as it is not nearer the hole than where the original is likely to be. Play it past that point and it becomes the ball in play.`,
    penaltyAndRelief: `Playing a provisional costs nothing by itself.

**If the original is found in bounds within three minutes**, you must play the original and abandon the provisional, with no penalty at all.

**If the original is lost or out of bounds**, the provisional becomes the ball in play with one penalty stroke: the standard stroke-and-distance cost. A drive plus a provisional that finds the fairway means you are playing your fourth shot.`,
    inPractice: `The three-minute search limit, reduced from five in 2019, makes provisionals more useful than they used to be. Walking 250 yards, searching, walking back and replaying is both a slow round and a demoralising one.

If the ball may be in a penalty area, a provisional is **not** allowed for that reason: penalty area relief already exists, and playing a provisional there would give a player a free choice between two outcomes.`,
    formatDifferences: `Identical in both formats.`,
    misunderstandings: `**You must announce it.** This is the mistake that costs strokes, and it costs them silently.

**You cannot choose the better ball.** If the original is in play, the provisional is abandoned regardless of position.

**A provisional is not available for a ball in a penalty area.** If that is the only place it can be, take penalty area relief instead.`,
    related: [
      'lost-ball',
      'stroke-and-distance',
      'out-of-bounds',
      'penalty-areas-explained',
      'ball-in-play',
    ],
  }),
];
