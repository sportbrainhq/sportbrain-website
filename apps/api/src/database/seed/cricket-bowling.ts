import { concept, definition, delivery } from './cricket-explainer-helpers';
import { ICC_PC, MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Bowling: the shared foundations, then pace, then spin.
 *
 * Two editorial rules run through this file.
 *
 * **Mechanics are described as convention, never as measurement.** Bowlers do
 * the same delivery differently, and coaching descriptions of grips and wrist
 * positions are teaching aids rather than biomechanical facts. Every grip
 * description here says so, because the alternative implies a precision that
 * does not exist and that a reader might try to copy.
 *
 * **Swing and seam movement are kept apart.** They look identical on television
 * and are different phenomena: one happens in the air, the other off the pitch.
 * Conflating them is the single most common error in cricket writing, so each
 * has its own explainer and each says explicitly what the other is.
 */

const MCC = { key: 'mcc-laws' } as const;
const WP_SWING = { key: 'wp-reverse-swing' } as const;

export const CRICKET_BOWLING: ExplainerSeed[] = [
  // ── Bowling foundations ───────────────────────────────────────────────────
  concept({
    slug: 'bowling-action',
    title: 'Bowling Action',
    category: 'bowling',
    alsoIn: ['laws-and-rules'],
    difficulty: 'beginner',
    summary: 'The whole movement of delivering the ball, and the one part of it the Laws regulate.',
    explanation: `A bowling action is everything from the start of the run-up to the follow-through: the approach, the jump or bound into the delivery stride, the front-foot landing, the rotation of the trunk, the arm coming over, the release, and the deceleration afterwards.

Actions vary enormously and legally. Bowlers deliver from wide of the crease or close to the stumps, with a chest-on or side-on alignment, from a long run or a few paces, with a high arm or a slingy low one. None of that is regulated.

What **is** regulated is one specific thing: the ball must be **bowled**, not thrown.`,
    howItWorks: `Under **Law 21**, a delivery is fair if the bowler's elbow does not **straighten** beyond a permitted tolerance from the point at which the arm reaches the horizontal until the ball is released. The Laws do not require a perfectly straight arm; they permit a defined amount of extension, because biomechanical studies established that almost every bowler straightens slightly and that the eye cannot detect small amounts.

The tolerance is a numerical figure set out in the regulations, and the process for assessing a suspect action uses laboratory testing rather than the on-field umpire's judgement alone.

An umpire who considers a delivery to have been thrown calls **no-ball**. Repeated suspicion is dealt with by reporting the bowler for testing, which is an administrative process run under the relevant board's or the ICC's regulations rather than something resolved during the match.`,
    whyItMatters: `The distinction between bowling and throwing is the reason cricket looks the way it does. A thrown ball can be delivered faster and with more spin, so the constraint on the elbow is what keeps the contest between bat and ball where it is.

It is also one of the most consequential things a bowler can be told about their action: a reported bowler may be required to remodel an action built over a career.`,
    misunderstandings: `**"The arm must be perfectly straight."** A defined tolerance for elbow extension is permitted, because virtually all bowlers have some.

**"An umpire decides whether an action is legal."** An umpire can call no-ball for a specific delivery, but assessing an action is done by testing, off the field.

**"A slingy or unusual action is illegal."** Arm height, alignment and approach are unregulated. Only elbow extension is.`,
    takeaways: `- The action is the whole delivery movement; almost none of it is regulated.
- Law 21 requires the ball to be bowled, not thrown, with a permitted elbow tolerance.
- Suspect actions are assessed by testing, not by umpire judgement alone.`,
    related: ['bowler', 'run-up', 'release-point', 'no-ball', 'legal-delivery', 'doosra'],
    sourceKeys: [{ ...MCC, locator: 'Law 21 (No ball)' }],
    order: 10,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; testing regulations from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),

  concept({
    slug: 'run-up',
    title: 'Run-up',
    category: 'bowling',
    difficulty: 'beginner',
    summary:
      'The approach to the crease, which converts running speed into ball speed and has to arrive repeatably.',
    explanation: `The run-up is the bowler's approach before delivering. Fast bowlers may run twenty metres or more; spinners often use three or four paces.

Its job is not simply to build speed. It is to arrive at the crease **in the same place, at the same speed, in balance, every time**. A run-up that varies produces a bowler who cannot land the ball where they intend, and it produces no-balls.`,
    howItWorks: `Three elements do the work.

**Rhythm.** Bowlers talk about rhythm more than about speed, and it is not mysticism: an approach whose stride pattern is consistent lets the body arrive in the same position each ball, which is what makes line and length repeatable.

**The gather or bound.** The transition from running to delivering, where a fast bowler jumps and turns side-on. This is where running momentum is converted into rotation.

**The landing.** The front foot lands with some part behind the popping crease, or the umpire calls no-ball. Fast bowlers land with very large forces going through the front leg, which is why the run-up is closely tied to injury risk.

A bowler may not change the length or nature of their run-up mid-over without the umpire's knowledge where it affects the batter, and marking the run-up on the outfield is standard practice.`,
    whyItMatters: `Almost every prolonged loss of form for a fast bowler is described in terms of the run-up. Overstepping repeatedly, losing pace, and losing control of length are all commonly traced back to an approach that has drifted.

For spinners the run-up matters less for pace and more for consistency of release, since a short approach still needs to deliver the body to the same position.`,
    misunderstandings: `**"Longer run-ups mean faster bowling."** Only up to a point. Bowlers regularly shorten their run-up and lose no pace, because the limit is what the body can convert rather than how far it ran.

**"The run-up is just running."** It is the mechanism that makes repeatability possible, which is why bowlers measure and mark it.`,
    takeaways: `- The approach exists for repeatability as much as for speed.
- Rhythm, the gather and the front-foot landing are the components.
- Overstepping and lost control usually trace back to the run-up.`,
    related: ['bowling-action', 'release-point', 'no-ball', 'pace', 'fast-bowling'],
    sourceKeys: [{ ...MCC, locator: 'Laws 20, 21' }],
    order: 20,
  }),

  concept({
    slug: 'release-point',
    title: 'Release Point',
    category: 'bowling',
    difficulty: 'advanced',
    summary:
      'Where and when the ball leaves the hand, which determines almost everything about where it arrives.',
    explanation: `The release point is the position of the hand at the instant the ball is let go: how high, how far forward, how wide of the stumps, and with what wrist and seam orientation.

Small changes here produce large changes at the other end. The ball travels around twenty metres, so an alteration of a few centimetres in release height or a few degrees in angle moves the pitching point substantially, changes the trajectory, and changes how much time the batter has.`,
    howItWorks: `Four properties of a release matter, and they are largely independent of each other.

**Height.** A taller release, or a higher arm, produces a steeper angle of descent, which generally means more bounce off the same length. This is why tall fast bowlers can bowl a length that would be innocuous from a shorter bowler and still get the ball above the batter's comfortable hitting zone.

**Width.** Releasing from wide of the crease creates an angle across the batter. The same delivery from close to the stumps arrives on a different line and threatens the stumps rather than the outside edge.

**Forward reach.** How far down the pitch the ball is released affects the effective length: a bowler who releases earlier gives the batter marginally more time.

**Wrist and seam orientation.** What makes a delivery swing, seam, or spin in one direction rather than another.

Because these are independent, a bowler can change one and hold the others, which is the mechanical basis of most variations. A slower ball that keeps the same arm speed and release height is deceptive precisely because only one property changed.`,
    whyItMatters: `Release point is where deception is manufactured. A batter picks up information from the bowler's arm and hand in the last fraction of the approach, so a variation that changes the ball's behaviour **without** changing the visible release is the hardest kind to read. That is the whole design principle behind a googly, a well-bowled slower ball and a carrom ball.

It also explains why a bowler's effectiveness can change dramatically without any change in speed, and why the same bowler is a different proposition from around the wicket.`,
    misunderstandings: `**"Release point is just where the arm is."** It includes wrist and seam orientation, which are what determine movement rather than trajectory.

**"A consistent release means a predictable bowler."** A consistent **visible** release with varying wrist positions is the ideal: same look, different ball.`,
    takeaways: `- Height, width, forward reach and wrist orientation are the four independent properties.
- Small changes at release become large changes at the batter's end.
- Deception comes from changing the ball without changing the visible release.`,
    related: ['bowling-action', 'seam-position', 'variation', 'slower-ball', 'googly', 'run-up'],
    order: 30,
  }),

  concept({
    slug: 'seam-position',
    title: 'Seam Position',
    category: 'bowling',
    alsoIn: ['pace-bowling'],
    difficulty: 'intermediate',
    summary:
      'How the ball’s stitched seam is angled and spun in flight, which decides whether it swings, seams or does neither.',
    explanation: `A cricket ball is two leather halves stitched together, and the raised ridge of stitching is the **seam**. How the seam is oriented at release, and how stably it holds that orientation in flight, is the main thing a pace bowler controls beyond line, length and speed.

Two quite different effects depend on it.

**In the air**, the seam disturbs the airflow asymmetrically, which is what produces **swing**.

**Off the pitch**, the raised seam landing on the surface can grip and deflect the ball, which is what produces **seam movement**.

These are different phenomena with different causes, and a bowler can get one without the other.`,
    howItWorks: `Described as convention: bowlers hold the ball differently and the following is the standard teaching framework rather than a rule.

**Angled seam, backspin.** The conventional swing grip: the seam is angled towards the slips for an outswinger to a right-hander, or towards leg for an inswinger, and the bowler imparts backspin along an axis that keeps the seam pointing steadily in that direction throughout the flight. A wobbling seam does not swing reliably, which is why a stable seam is described as the prerequisite.

**Upright seam, no angle.** The seam presented straight down the pitch. Less air-borne movement, but the seam is more likely to land on the surface and deviate off it.

**Cross-seam.** The seam deliberately turned across the direction of travel. This suppresses swing and produces less predictable bounce, which is why it is used on abrasive pitches and to change the ball's behaviour without changing pace.

**Scrambled or wobble seam.** The seam deliberately unstable at release, so that which part of the ball lands is effectively random. Bowlers use it precisely because neither they nor the batter know which way it will go.`,
    whyItMatters: `Seam position is the reason two bowlers of identical pace can be entirely different problems. It is also the reason a bowler's effectiveness changes as the ball ages: a new ball with a hard, pronounced seam behaves differently in the air and off the pitch from a sixty-over-old one whose seam has flattened.`,
    misunderstandings: `**"Seam position and seam movement are the same thing."** One is how the ball is held and oriented; the other is what can happen when it lands.

**"Swing and seam movement are the same."** Swing is in the air; seam movement is off the pitch. This is the single most common confusion in cricket commentary.

**"A wobbling seam is a mistake."** Sometimes it is deliberate.`,
    takeaways: `- The raised stitching is the seam; its orientation governs air and pitch behaviour.
- Angled and stable produces swing; upright or cross-seam changes pitch behaviour.
- Swing happens in the air, seam movement off the surface.`,
    related: [
      'swing-bowling',
      'seam-movement',
      'seam-bowling',
      'cross-seam-delivery',
      'reverse-swing',
      'cricket-ball',
    ],
    sourceKeys: [WP_SWING],
    order: 40,
  }),

  definition({
    slug: 'line',
    title: 'Line',
    category: 'bowling',
    difficulty: 'beginner',
    summary:
      'Where a delivery is aimed across the pitch: at the stumps, outside off, or down the leg side.',
    explanation: `Line is the sideways component of a delivery. It is described relative to the stumps and to the batter, in a small vocabulary:

- **At the stumps** or **straight**: on line to hit the wicket.
- **Outside off**: to the off side of the off stump. The **corridor of uncertainty** is the narrow band just outside off, where a batter can neither comfortably leave nor comfortably play.
- **Down the leg side**: to the leg side of the batter, usually a mistake in red-ball cricket and often a wide in white-ball cricket.
- **Fourth** or **fifth stump line**: informal shorthand for lines progressively further outside off, as though the stumps continued.

Line interacts with the field: a bowler bowling outside off with three slips is doing something coherent, and one bowling the same line with everyone on the leg side is not.`,
    whyItMatters: `Line decides which shots are available. A ball at the stumps must be played and threatens LBW and bowled; a ball outside off can be left, but invites the drive and the edge; a ball on the pads is the easiest in cricket to score off.

Most bowling plans are stated as a line and a length together, and most bowlers who are struggling are described as having lost one of the two.`,
    misunderstandings: `**"Straight is always best."** A straight ball can be worked off the pads for easy runs. Outside off is the more testing line against most batters in red-ball cricket.

**"Line is fixed for a bowler."** It changes by batter, by format, by phase and by field.`,
    related: [
      'length',
      'good-length',
      'corridor-of-uncertainty',
      'attacking-the-stumps',
      'wide',
      'field-setting',
    ],
    order: 50,
  }),

  definition({
    slug: 'length',
    title: 'Length',
    category: 'bowling',
    difficulty: 'beginner',
    summary:
      'How far down the pitch a delivery lands, which determines what shot the batter can play.',
    explanation: `Length is the distance from the bowler at which the ball pitches, and it matters more than pace.

The vocabulary, from fullest to shortest:

- **Full toss**: does not pitch before reaching the batter. The easiest ball in cricket to hit, and above waist height it is a no-ball.
- **Yorker**: pitches right at the batter's feet. No time to do anything with it.
- **Half-volley**: pitches just short of the batter's front foot, arriving as it rises. Easy to drive.
- **Full**: pitched up, drivable off the front foot.
- **Good length**: the awkward band where the batter is not sure whether to play forward or back.
- **Back of a length**: slightly shorter than good, forcing the batter back without offering a comfortable shot.
- **Short**: bouncing up around chest height or higher, pullable or hookable.
- **Bouncer**: short enough to pass the batter at head height.

The exact distances are not fixed. A good length depends on the bowler's height and pace and on the pitch's bounce, which is why a length that is unplayable at one ground is a half-volley at another.`,
    whyItMatters: `Length is the primary variable a bowler controls. It decides whether the batter plays forward or back, whether they can score, and whether the ball is likely to hit the stumps or the pads.

The good-length band exists because a batter who commits forward to a ball that is slightly short, or back to one that is slightly full, is out of position, and being made to guess is what gets batters out.`,
    misunderstandings: `**"A good length is a fixed spot."** It varies with the bowler's height, the pace, and the pitch.

**"Full means easy to hit."** Very full, at the feet, is a yorker and among the hardest balls to hit.`,
    related: [
      'good-length',
      'yorker',
      'half-volley',
      'full-toss',
      'back-of-a-length',
      'short-ball',
      'line',
    ],
    order: 60,
  }),

  definition({
    slug: 'pace',
    title: 'Pace',
    category: 'bowling',
    difficulty: 'beginner',
    summary:
      'The speed of a delivery, and the reason it matters less on its own than most people assume.',
    explanation: `Pace is how fast the ball travels, measured in kilometres or miles per hour and displayed on most televised cricket.

Broad conventional bands, which are descriptive rather than official:

- **Fast**: roughly 140 km/h and above.
- **Fast-medium** and **medium-fast**: roughly 120 to 140 km/h.
- **Medium**: below that, still bowled with a pace bowler's action.
- **Slow** and **spin**: bowled to impart revolutions rather than speed, typically 70 to 95 km/h.

Speed reduces the batter's reaction time, which is real and important. But pace on its own gets fewer batters out than the combination of pace with movement and accuracy, and cricket is full of very quick bowlers who were less effective than slower, more accurate ones.`,
    whyItMatters: `Pace buys two things: less time for the batter, and more carry to the wicketkeeper and slips, which makes edges catchable.

It also enables other things. Reverse swing is associated with higher speeds, and a bouncer needs pace to be a genuine threat rather than a hittable long hop.

The corollary is that **changing** pace is a weapon in its own right, because a batter's timing is calibrated to what they have been facing.`,
    misunderstandings: `**"The fastest bowler is the best bowler."** Accuracy and movement usually matter more, and the historical record is full of counter-examples.

**"Slower is easier to face."** A slower ball that arrives when the batter has committed is one of the most productive deliveries in limited-overs cricket.`,
    related: [
      'fast-bowling',
      'fast-medium-bowling',
      'slower-ball',
      'bouncer',
      'variation',
      'release-point',
    ],
    order: 70,
  }),

  definition({
    slug: 'variation',
    title: 'Variation',
    category: 'bowling',
    difficulty: 'intermediate',
    summary:
      'A delivery that behaves differently from the bowler’s stock ball while looking as much like it as possible.',
    explanation: `A variation is any delivery a bowler uses to do something other than what they usually do: a slower ball, a bouncer, a googly, a cross-seam delivery, a change of angle.

The essential point is that a variation's value comes from **disguise**, not from difference. A slower ball the batter can see coming is just a bad ball. The same delivery released with an identical arm speed and visible action is one of the most effective in cricket.

That is why variations are described in terms of what stays the same as much as what changes.`,
    whyItMatters: `Batting relies on prediction. A batter has roughly half a second and cannot process the ball's entire flight, so they anticipate from the bowler's action and the early trajectory. A variation is an attack on that prediction.

It also has a cumulative effect: a bowler with a credible variation makes their stock ball better, because the batter can no longer commit fully to it.`,
    misunderstandings: `**"More variations is better."** A bowler with five poorly-disguised variations is more predictable than one with an excellent stock ball and one reliable change.

**"Every spinner should bowl every variation."** Many outstanding spinners bowl two deliveries. Attempting a variation that does not work reliably tends to cost more than it gains.`,
    related: [
      'slower-ball',
      'googly',
      'knuckle-ball',
      'cross-seam-delivery',
      'release-point',
      'doosra',
    ],
    order: 80,
  }),

  definition({
    slug: 'bowling-spell',
    title: 'Bowling Spell',
    category: 'bowling',
    alsoIn: ['match-structure'],
    difficulty: 'beginner',
    summary:
      'A sequence of overs a bowler bowls before being taken off, and the unit captains actually think in.',
    explanation: `A spell is a run of overs bowled by one bowler in alternation with a partner, before the captain replaces them. Because bowling alternates ends, a bowler in a spell bowls every other over.

Spells are described by their length and figures: "a spell of 6-1-18-2" means six overs, one maiden, eighteen runs, two wickets, in that stint.

Bowlers are usually described as bowling **two or three spells** in a long innings: an opening burst with the new ball, a middle stint, and a late one, often with the ball reversing or against a set batter.`,
    whyItMatters: `The spell is the real unit of bowling, not the over. A plan takes several overs to execute: a bowler may spend three overs establishing a length before using a variation, and taking them off after two overs discards that work.

In limited-overs cricket spells are constrained by per-bowler over limits, so a captain is allocating a scarce resource: keeping a bowler's overs back for the death means not using them now.

Spell length also governs fatigue, and fatigue governs pace. A fast bowler in the fifth over of a spell is a different bowler from the same person in the first.`,
    misunderstandings: `**"A spell is continuous."** The bowler bowls alternate overs, since bowling changes ends every over.

**"Long spells are better."** They are a trade against fatigue and against holding overs in reserve.`,
    related: [
      'over',
      'bowling-changes',
      'managing-overs',
      'death-bowling',
      'new-ball-bowling',
      'ends',
    ],
    order: 90,
  }),

  // ── Pace bowling ──────────────────────────────────────────────────────────
  concept({
    slug: 'fast-bowling',
    title: 'Fast Bowling',
    category: 'pace-bowling',
    difficulty: 'beginner',
    summary: 'Bowling at high speed, using pace, bounce and movement to deny the batter time.',
    explanation: `Fast bowling means delivering the ball at speed, conventionally around 140 km/h and above, off a long run-up and with an action built to generate and survive large forces.

The threat is compound. Speed removes the batter's time. Bounce, generated by a tall release and a hard length, takes the ball out of the comfortable hitting zone. Movement, in the air or off the seam, means the batter's committed shot is aimed at where the ball was going rather than where it went.

Fast bowlers also cause damage that other bowlers do not: the physical intimidation of the short ball is a legitimate and regulated part of the game.`,
    howItWorks: `A fast bowler's stock plan in red-ball cricket is a good length just outside off stump, looking for the edge, with a full field behind square. Against that, a batter who plays at everything nicks one and a batter who leaves everything is eventually beaten by one that comes back.

The variations sit around that: the **bouncer** to move the batter back, the **yorker** at the feet, the **slower ball** to disturb timing, and changes of **angle** by going round the wicket.

Workload is a defining constraint. Fast bowling is the most injury-prone activity in cricket, and spell lengths, over limits and rotation exist because of it.`,
    whyItMatters: `Twenty wickets win a Test, and fast bowling takes most of them in most conditions. In limited-overs cricket the fast bowler's job is different but no less central: the new ball and the death overs are the two phases where matches are most often decided.`,
    formatDifferences: `In Tests, fast bowlers bowl long spells, attack the outside edge and use the short ball sparingly. In T20, they bowl four overs, often in one- and two-over bursts, and the premium shifts from taking wickets to denying the batter a hittable ball, which is why the wide yorker and the slower ball matter so much more.`,
    misunderstandings: `**"Fast bowling is about speed alone."** Speed without accuracy is expensive, and the historical record favours accuracy plus movement.

**"Short-pitched bowling is unregulated."** Law 41 addresses dangerous and unfair short-pitched bowling, and playing conditions add limits per over in some competitions.`,
    takeaways: `- Roughly 140 km/h and above, off a long run-up.
- Threat is pace plus bounce plus movement, not pace alone.
- Workload management is intrinsic to the discipline.`,
    related: [
      'pace',
      'fast-medium-bowling',
      'bouncer',
      'yorker',
      'swing-bowling',
      'seam-bowling',
      'death-bowling',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 41 (Unfair play: dangerous bowling)' }],
    order: 10,
  }),

  definition({
    slug: 'fast-medium-bowling',
    title: 'Fast-medium Bowling',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'The band between genuinely fast and medium pace, where movement usually matters more than speed.',
    explanation: `A descriptive category rather than an official one, covering bowlers in roughly the 120 to 140 km/h range. Scorecards and reference works have used "fast-medium" and "medium-fast" with the latter usually implying slightly slower, though the usage has never been rigorous.

What defines the group in practice is not the number but the **method**. A fast-medium bowler generally cannot beat a good batter for pace, so they beat them with swing, seam movement, accuracy and changes of angle. Many of the most successful bowlers in cricket history sit in this band.`,
    whyItMatters: `The category exists partly to correct an assumption. Speed guns encourage the belief that faster is better, and a bowler operating at 130 km/h who swings the ball both ways and never bowls a loose delivery is more effective than a wayward 145 km/h bowler in most conditions.

It also matters for conditions: in cool, overcast, seam-friendly conditions, fast-medium bowling with a stable seam is frequently the most productive method available.`,
    misunderstandings: `**"Fast-medium is a defined speed range."** It is a loose descriptive convention with no official boundaries.

**"It means a lesser bowler."** Some of the most successful Test bowlers in history bowled in this range.`,
    related: [
      'pace',
      'fast-bowling',
      'swing-bowling',
      'seam-bowling',
      'conventional-swing',
      'good-length',
    ],
    order: 20,
  }),

  concept({
    slug: 'seam-bowling',
    title: 'Seam Bowling',
    category: 'pace-bowling',
    alsoIn: ['pitch-and-conditions'],
    difficulty: 'intermediate',
    summary:
      'Using the raised seam to make the ball deviate off the pitch when it lands. Not the same as swing.',
    explanation: `Seam bowling aims to make the ball **change direction when it hits the pitch**. The mechanism is mechanical rather than aerodynamic: the raised seam lands on the surface, grips or catches unevenly, and the ball is deflected.

That makes it fundamentally different from **swing**, which happens in the air before pitching. The two often occur in the same spell from the same bowler and look similar on television, but they are separate phenomena:

- **Swing** curves during flight.
- **Seam movement** deviates at the moment of pitching.

A slow-motion replay distinguishes them easily: watch whether the ball's path bends before or at the bounce.`,
    howItWorks: `The bowler presents the seam **upright**, pointing down the pitch, rather than angled for swing, and bowls a length that makes the ball land on the seam.

What happens next depends heavily on the surface, which is why seam bowling is the most conditions-dependent discipline in cricket:

- A pitch with **grass cover** and moisture holds the seam and deviates the ball.
- A **hard, dry** surface offers less grip and produces less movement.
- **Cracks** and worn patches produce larger and less predictable deviation.

Because it depends on the surface, seam movement is largely outside the bowler's control in degree, though entirely within their control in whether they give it a chance to happen. A **wobble seam** delivery deliberately makes the landing orientation random, which is a way of exploiting a surface without needing to predict it.`,
    whyItMatters: `Seam movement is the main reason red-ball cricket in seam-friendly conditions can be so heavily weighted towards bowling. A batter cannot play the line of a ball that changes direction after pitching, because there is no time to adjust: they have to play the line they predicted and hope.`,
    formatDifferences: `Most pronounced in red-ball cricket, with a new, hard-seamed ball on a grassy surface. Less prominent in white-ball cricket, where the pitches are usually prepared to favour batting and the ball is different in construction.`,
    misunderstandings: `**"Seam and swing are the same thing."** They are not, and this is the most common confusion in cricket writing.

**"A seam bowler is any pace bowler."** "Seamer" is used loosely for any pace bowler, but seam bowling as a technique means specifically exploiting movement off the pitch.

**"Seam movement can be produced at will."** The surface decides how much is available.`,
    takeaways: `- Deviation off the pitch, caused by the seam landing on the surface.
- Distinct from swing, which happens in the air.
- Heavily dependent on the surface and the ball's condition.`,
    related: [
      'seam-movement',
      'swing-bowling',
      'seam-position',
      'cross-seam-delivery',
      'grass-cover',
      'new-ball',
    ],
    sourceKeys: [WP_SWING],
    order: 30,
  }),

  concept({
    slug: 'swing-bowling',
    title: 'Swing Bowling',
    category: 'pace-bowling',
    alsoIn: ['pitch-and-conditions'],
    difficulty: 'intermediate',
    aliases: ['Swing'],
    summary:
      'Making the ball curve through the air before it pitches, by presenting an angled and stable seam.',
    explanation: `Swing is lateral movement **in the air**, before the ball pitches. A swinging ball leaves the bowler's hand on one line and arrives on another, having curved during flight.

Two directions, described for a right-handed batter:

- An **outswinger** moves away from the batter, towards the off side.
- An **inswinger** moves in towards the batter and the stumps.

Both are produced by the same underlying principle applied in opposite directions: the seam is angled towards the intended direction of movement and held stable in flight by backspin.

Swing is distinct from **seam movement**, which is deviation off the pitch. The two frequently occur together and are constantly confused.`,
    howItWorks: `The accepted physical account, stated at the level the evidence supports: the seam and the difference in surface condition between the two halves of the ball cause the airflow over the two sides to differ, one side's boundary layer separating earlier than the other's, which produces a sideways pressure difference and a curved path.

What is well established:

- A **stable, angled seam** is required. A wobbling seam does not swing consistently.
- A **difference between the two sides** of the ball helps, which is why sides polish one half.
- **Speed matters**, in a non-linear way: there are speed ranges in which conventional swing is more and less pronounced.

What is less settled than commentary implies:

- Exactly which atmospheric conditions increase swing. **Humidity** and **cloud cover** are the traditional explanations, and the evidence for a large, reliable effect from cloud cover in particular is weaker than its place in cricket folklore suggests. Studies have produced mixed results.
- How much of the observed variation between days is the ball, the bowler's rhythm, and the batter's perception rather than the atmosphere.

The honest summary is that swing is real, well-described in general terms, and less predictable in the specific than confident commentary suggests.`,
    whyItMatters: `A swinging ball defeats the fundamental method of batting, which is to predict the ball's line and commit. Movement late in flight means the bat arrives where the ball was going.

It is also why the **new ball** is such a prized commodity in red-ball cricket: a hard, shiny ball with a pronounced seam swings most, and both openers and opening bowlers are selected with that phase in mind.`,
    formatDifferences: `Most significant with the new ball in red-ball cricket, and in the first ten overs of an ODI. In T20 the phase is so short that swing is a smaller factor than length and variation.

Reverse swing is a separate phenomenon associated with an old ball, and it moves the ball the opposite way from the same seam position.`,
    misunderstandings: `**"Swing and seam movement are the same."** Air versus pitch. Different phenomena.

**"Cloud cover causes swing."** It is the traditional explanation and the evidence for a strong causal effect is genuinely contested. Stating it as a fact is overclaiming.

**"Only new balls swing."** Conventional swing favours a new ball; reverse swing favours an old one.`,
    takeaways: `- Curvature in the air, from an angled and stable seam.
- Outswing moves away from the batter, inswing towards them.
- The general mechanism is understood; the atmospheric specifics are contested.
- Distinct from seam movement and from reverse swing.`,
    related: [
      'conventional-swing',
      'reverse-swing',
      'inswinger',
      'outswinger',
      'seam-position',
      'seam-movement',
      'swing-conditions',
      'new-ball',
    ],
    sourceKeys: [WP_SWING],
    order: 40,
  }),

  delivery({
    slug: 'conventional-swing',
    title: 'Conventional Swing',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'Swing in the direction the angled seam points, associated with a newer ball with one shiny side.',
    explanation: `Conventional swing is the ordinary case: the ball moves in the direction the seam is angled, towards the rougher side.

It is called "conventional" only because **reverse swing** exists and goes the other way from the same seam position. Before reverse swing was understood, this was simply swing.

The classic conditions are a **new or newish ball**, one side polished and one allowed to roughen, an angled and stable seam, and a bowler with the pace to make it happen.`,
    gripAndRelease: `Conventionally described, and bowlers vary: the first two fingers rest on or beside the seam, the thumb underneath, and the seam is angled towards the intended direction of movement, slips for an outswinger to a right-hander, leg side for an inswinger. The wrist stays behind the ball and backspin is imparted along an axis that keeps the seam pointing steadily.

The consistent theme in coaching descriptions is **seam stability**: what has to be repeatable is the seam's orientation through the whole flight, not the grip itself.`,
    batterExpects: `The batter picks up the ball's initial line and the bowler's action, and commits to a shot based on where the ball appears to be going.`,
    actuallyHappens: `The ball curves during flight and arrives on a different line. If it is moving away, the shot is beaten on the outside and the edge carries behind. If it is moving in, the ball beats the inside edge and threatens the stumps and the pads.`,
    whyEffective: `Late movement is the key property. Swing that happens early can be tracked; swing that continues through the second half of the flight arrives after the batter has committed. This is why "late swing" is a distinct compliment rather than a redundancy.`,
    whenYouWillSeeIt: `The first fifteen or twenty overs of a red-ball innings, and the opening overs of an ODI. Also from any bowler who has just been given a new ball.`,
    counteredBy: `- **Playing late**, under the eyes, so the ball has finished moving before contact.
- **Leaving well** outside off, which costs nothing and forces the bowler to straighten their line.
- **Playing the ball rather than the line**, particularly with soft hands so an edge does not carry.
- **Getting forward** to reduce the distance over which the ball can move after the pitch.`,
    misunderstandings: `**"Conventional swing needs a brand new ball."** It needs a difference between the two sides and a stable seam; a twenty-over-old ball can swing well.

**"Conventional means old-fashioned."** It only distinguishes it from reverse swing.`,
    takeaways: `- The ball swings towards the rough side, in the direction the seam points.
- Needs a stable, angled seam and asymmetric surface condition.
- Late movement is what makes it effective.`,
    related: [
      'swing-bowling',
      'reverse-swing',
      'outswinger',
      'inswinger',
      'new-ball',
      'playing-swing',
      'soft-hands',
    ],
    sourceKeys: [WP_SWING],
    order: 50,
  }),

  delivery({
    slug: 'outswinger',
    title: 'Outswinger',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'A delivery that swings away from a right-handed batter, towards the off side and the slips.',
    explanation: `The outswinger starts on or around the stumps and curves away from a right-hander, towards the off side.

It is the classic wicket-taking delivery to a right-hander because of where the error goes. A batter playing at a ball moving away from them edges it **behind square on the off side**, which is exactly where the wicketkeeper and the slip cordon are standing.

To a left-hander the same delivery from a right-arm bowler moves **in**, so the whole plan and field change with the batter's handedness.`,
    gripAndRelease: `Conventionally: the seam angled towards the slips, the fingers along or beside the seam, the wrist behind the ball, and backspin imparted to keep the seam stable. Individual bowlers describe it differently, and some produce it primarily with wrist position rather than grip.`,
    batterExpects: `A ball on the stumps or just outside, which they can drive or defend on a predicted line.`,
    actuallyHappens: `The ball leaves them. A batter who has committed to the original line finds the bat arriving inside the ball's path, so the contact is on the outside edge.`,
    whyEffective: `The geometry of the error. Every mistake against an outswinger goes into a region already populated with catchers, so the same beaten shot that would be harmless elsewhere on the field is a wicket.

The delivery also sets up its opposite: a batter conditioned to expect the ball leaving them is vulnerable to one that holds its line or comes back.`,
    whenYouWillSeeIt: `With the new ball to right-handers in every format, and as the stock ball of most right-arm swing bowlers in red-ball cricket.`,
    counteredBy: `- **Leaving the ball** that is heading away and would miss the stumps.
- **Playing late and close to the body**, so a beaten shot does not reach out to the edge.
- **Soft hands**, so an edge drops short of the catchers rather than carrying.
- **Covering the line** with the front pad and playing straight rather than through the covers.`,
    misunderstandings: `**"An outswinger goes away from every batter."** It goes away from a right-hander and in to a left-hander.

**"The bowler chooses how much it swings."** They control the seam and the release; the ball, the surface condition and the air decide how much.`,
    takeaways: `- Swings away from a right-hander, towards the slips.
- Errors go to the catchers, which is the whole point.
- Reverses meaning against a left-hander.`,
    related: [
      'inswinger',
      'conventional-swing',
      'swing-bowling',
      'slip',
      'corridor-of-uncertainty',
      'leaving-the-ball',
    ],
    sourceKeys: [WP_SWING],
    order: 60,
  }),

  delivery({
    slug: 'inswinger',
    title: 'Inswinger',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'A delivery that swings in towards a right-handed batter, threatening the pads and the stumps.',
    explanation: `The inswinger starts wide of or on the stumps and curves in towards a right-hander.

Where the outswinger attacks the outside edge, the inswinger attacks the **stumps and the front pad**. The dismissals it produces are bowled and LBW rather than caught behind, and it needs a different field: fewer slips, more on the leg side and straight.

Against a left-hander, a right-arm bowler's inswinger moves away, so it functions as their outswinger.`,
    gripAndRelease: `Conventionally the mirror of the outswinger: seam angled towards the leg side, wrist behind the ball, stable seam. Many bowlers find one direction much more natural than the other, and being able to bowl both convincingly with a similar action is unusual and highly valued.`,
    batterExpects: `A ball angling across them or holding its line outside off, which they can leave or play with the bat coming down on that line.`,
    actuallyHappens: `The ball comes back. The bat is now outside the line of the ball, so it beats the inside edge, hits the pad, or hits the stumps.`,
    whyEffective: `It threatens the wicket directly. An outswinger needs a catcher to convert an error; an inswinger converts its own, because the ball is heading for the stumps and the pads.

It is also the natural partner of the yorker: both attack the base of the stumps, and a bowler who can swing the ball in late at the death is very difficult to get away.`,
    whenYouWillSeeIt: `To right-handers with a new ball, and heavily at the death of limited-overs innings, where an inswinging yorker is close to unhittable. Also a stock ball for many left-arm quick bowlers against right-handers, where the natural angle helps.`,
    counteredBy: `- **Covering the stumps** with the pad and playing straight.
- **Playing with the swing** into the leg side rather than trying to force it through the covers.
- **Getting forward** to reduce the distance over which the ball can move.
- **Watching the wrist** at release, where the two swing types are sometimes distinguishable.`,
    misunderstandings: `**"An inswinger is easier to bowl than an outswinger."** Bowlers differ, and many find the reverse.

**"Inswing is less dangerous because there is no slip catch."** It produces bowled and LBW dismissals instead, which need no fielder at all.`,
    takeaways: `- Swings in to a right-hander, attacking pads and stumps.
- Produces bowled and LBW rather than caught behind.
- Pairs naturally with the yorker at the death.`,
    related: [
      'outswinger',
      'conventional-swing',
      'swing-bowling',
      'yorker',
      'lbw',
      'death-bowling',
    ],
    sourceKeys: [WP_SWING],
    order: 70,
  }),

  delivery({
    slug: 'bouncer',
    title: 'Bouncer',
    category: 'pace-bowling',
    alsoIn: ['laws-and-rules'],
    difficulty: 'beginner',
    summary:
      'A short delivery aimed to pass the batter at chest or head height, and the one attacking ball the Laws regulate directly.',
    explanation: `A bouncer is pitched short enough, and bowled fast enough, to reach the batter around chest or head height.

Its purposes are layered. Immediately, it can take a wicket: a batter fending at it can be caught, or top-edge a hook. Beyond that, it moves the batter onto the back foot and makes them think about being hit, which is what makes the next full ball harder to drive.

It is also the delivery where cricket's Laws engage most directly with physical danger, and the only attacking ball with an explicit regulatory framework around it.`,
    gripAndRelease: `No special grip: it is a length and pace change, usually with the bowler's stock seam position. What varies is where the ball is banged in and, often, a slightly greater effort. Bowlers with a naturally high release get more from the same length.`,
    batterExpects: `Having faced full-length bowling, the batter is preparing to come forward. That is precisely the state the bouncer exploits.`,
    actuallyHappens: `The ball climbs at the batter's upper body. They must duck, sway, fend, or attack it with a pull or hook, and each of those decisions has to be made in a fraction of a second.`,
    whyEffective: `Two mechanisms, and the second matters more.

**Direct.** A fend, a glove, or a top edge gives a catching chance to short leg, gully, or a deep leg-side fielder.

**Indirect.** A batter who has been bounced is fractionally less willing to commit forward, which is what makes the subsequent full ball more dangerous. The bouncer's main value is usually in the ball after it.`,
    whenYouWillSeeIt: `On pitches with bounce, against batters who are strong off the front foot, and at tail-end batters where the physical challenge is the plan. Used sparingly in white-ball cricket because a mistimed bouncer is a wide or a no-ball and a well-timed one can be pulled for six.`,
    counteredBy: `- **Ducking or swaying**, the lowest-risk option.
- **The pull or hook**, high reward and high risk, especially with deep leg-side catchers set.
- **The upper cut** over the slips, which uses the pace rather than fighting it.
- **Getting deep in the crease** to create room and time.`,
    misunderstandings: `**"Bouncers are illegal."** They are legal. What is regulated is **dangerous and unfair** short-pitched bowling under Law 41, judged by the umpire on the basis of repetition, the batter's skill and the risk of injury, plus a ball passing above head height being called a wide or no-ball depending on the competition's conditions. Playing conditions in some competitions additionally limit bouncers per over.

**"A bouncer is just a bad short ball."** A short ball that sits up at chest height to be pulled is a bad ball. A bouncer at the head is a different delivery.`,
    takeaways: `- Short and fast, passing at chest or head height.
- Legal, but framed by Law 41's dangerous-bowling provisions and by competition limits.
- Its main value is often in the delivery that follows it.`,
    related: [
      'short-ball',
      'hook-shot',
      'pull-shot',
      'upper-cut',
      'short-ball-strategy',
      'helmet',
      'no-ball',
    ],
    sourceKeys: [
      { ...MCC, locator: 'Law 41.6 (Dangerous and unfair short-pitched bowling)' },
      { key: 'icc-playing-conditions', locator: 'Short-pitched bowling limits' },
    ],
    order: 80,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; per-over limits from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),

  definition({
    slug: 'short-ball',
    title: 'Short Ball',
    category: 'pace-bowling',
    difficulty: 'beginner',
    summary:
      'A delivery pitched well back, arriving at or above waist height, which the batter can attack off the back foot.',
    explanation: `A short ball pitches closer to the bowler than a good length, giving the ball time to rise. It arrives somewhere between waist and chest height for most batters.

Short is a spectrum rather than a category. Slightly short is **back of a length** and awkward. Genuinely short and rising at the upper body is a **bouncer**. Short and sitting up at a comfortable height is a **long hop**, and it is one of the easiest balls in cricket to hit.

The difference between a wicket-taking short ball and a boundary is often a few centimetres of length and a few km/h of pace.`,
    whyItMatters: `Short balls do three things: they push the batter onto the back foot, they take the ball away from the stumps and pads, and they offer the batter a scoring opportunity in exchange.

That trade is why short-ball bowling has to be a **plan** rather than a habit: without the right field set behind square on the leg side, a short ball is simply a free four.`,
    misunderstandings: `**"Short balls are wicket-taking balls."** They can be, with the right field and enough pace. Without either, they are the most expensive length in cricket.

**"Short and bouncer are the same."** A bouncer is a specific, higher-arriving case of a short ball.`,
    related: [
      'bouncer',
      'back-of-a-length',
      'pull-shot',
      'good-length',
      'short-ball-strategy',
      'playing-short-pitched-bowling',
    ],
    order: 90,
  }),

  definition({
    slug: 'good-length',
    title: 'Good Length',
    category: 'pace-bowling',
    difficulty: 'beginner',
    summary: 'The band of length where the batter cannot confidently come forward or go back.',
    explanation: `A good length is the awkward zone: full enough that the batter cannot comfortably play back, short enough that they cannot comfortably play forward.

Its defining property is **indecision**. A batter meeting a good-length ball is committing to a guess, and a batter caught between the two options is playing with hard hands, away from the body, or with the bat coming down after the ball has passed.

It is not a fixed distance. It depends on:

- **The bowler's height and release point**: a taller bowler's good length is fuller.
- **The pace**: faster bowling shortens the effective good length.
- **The pitch**: a bouncy surface makes a fuller length good; a low, slow one demands the ball be pitched up further.
- **The batter**: someone who plays predominantly off the back foot has a different good length from someone who commits forward.`,
    whyItMatters: `It is the most valuable length in cricket, and the reason "he bowls a good length" is high praise rather than a bland observation. A bowler who hits it repeatedly forces errors without needing movement or extreme pace.

It also sets up everything else. A batter who has been pinned on a good length is vulnerable to the fuller ball and the short one, because they no longer trust their initial movement.`,
    misunderstandings: `**"Good length is a fixed spot on the pitch."** It varies with bowler, pace, pitch and batter.

**"A good length is a defensive length."** It is the most productive wicket-taking length in red-ball cricket.`,
    related: [
      'length',
      'back-of-a-length',
      'half-volley',
      'corridor-of-uncertainty',
      'seam-bowling',
      'defensive-bowling',
    ],
    order: 100,
  }),

  definition({
    slug: 'full-length',
    title: 'Full Length',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'A delivery pitched up close to the batter, drivable off the front foot, and the length where swing does most damage.',
    explanation: `A full length pitches close to the batter, further up than a good length. It can be driven off the front foot, which is why it is a scoring length, and it is also the length at which movement is most dangerous.

The reason is that swing and seam movement need **time and proximity to matter**. A ball that pitches full has less distance to deviate after pitching, but it is met further from the batter's body and later in its curve, so late swing on a full ball beats the bat while the shot is already committed.

Full is distinct from a **half-volley**, which pitches right under the batter's front foot and is the easiest ball to drive, and from a **full toss**, which does not pitch at all.`,
    whyItMatters: `Bowling full is a deliberate trade: more scoring opportunity for the batter, more chance of an edge or an LBW for the bowler. With a swinging or reversing ball, the trade heavily favours the bowler, which is why sides bowl fuller with a new ball and fuller again when the ball starts to reverse.`,
    misunderstandings: `**"Full length is a mistake."** It is a choice, and a good one with a moving ball.

**"Full and full toss are the same."** A full toss does not pitch. A full length does.`,
    related: [
      'length',
      'good-length',
      'half-volley',
      'full-toss',
      'yorker',
      'conventional-swing',
      'reverse-swing',
    ],
    order: 110,
  }),

  definition({
    slug: 'half-volley',
    title: 'Half-volley',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'A ball pitching just under the batter’s front foot, arriving as it begins to rise. One of the easiest lengths to drive.',
    explanation: `A half-volley pitches so close to the batter's front foot that they can meet it almost immediately after it bounces, while it is still rising gently.

The term is borrowed from tennis and describes the same thing: playing the ball immediately off the bounce.

For a batter this is close to ideal. The ball has had no distance in which to deviate after pitching, the bounce is predictable, and the bat can be swung through the line with the ball coming to it. Drives off half-volleys are the shots that look effortless.`,
    whyItMatters: `The half-volley is what a bowler is trying **not** to bowl when they aim full. A few centimetres too full and the good length becomes the most drivable ball in cricket.

For a batter, recognising one early is what allows the front foot to commit and the bat to come through freely, which is why batters talk about "getting a half-volley" as a gift.`,
    misunderstandings: `**"A half-volley is a good ball because it is full."** It is the length full deliveries become when they are slightly too full.

**"Half-volleys cannot get you out."** A half-volley that swings late can still find an edge, which is why bowling full with a moving ball remains viable.`,
    related: ['full-length', 'good-length', 'full-toss', 'drive', 'cover-drive', 'straight-drive'],
    order: 120,
  }),

  definition({
    slug: 'full-toss',
    title: 'Full Toss',
    category: 'pace-bowling',
    difficulty: 'beginner',
    summary:
      'A delivery that reaches the batter without pitching. The easiest ball in cricket to hit, and above waist height, a no-ball.',
    explanation: `A full toss does not bounce before reaching the batter. With no bounce there is no deviation off the pitch and no uncertainty about height, so the batter can swing freely.

There are two regulatory thresholds worth knowing.

**Above waist height, not bouncing**: a **no-ball** under Law 21, informally a **beamer**. This applies in all cricket.

**Above shoulder or head height** in limited-overs playing conditions: treated as a wide or no-ball depending on the competition's conditions.

Below waist height, a full toss is entirely legal and simply a poor delivery.`,
    whyItMatters: `The full toss is the most expensive delivery in cricket, and it is the characteristic error at the death of a limited-overs innings: a bowler aiming for a yorker who misses full ends up with a ball at thigh height that a set batter will hit for six.

That risk profile is why yorkers are hard rather than just precise: the miss in one direction is a hittable length, and the miss in the other is the worst ball available.`,
    misunderstandings: `**"All full tosses are no-balls."** Only those passing above waist height without bouncing.

**"A full toss is a yorker that went wrong."** Often, yes. But a yorker missed the other way is simply a hittable full ball, not a full toss.`,
    related: ['yorker', 'beamer', 'no-ball', 'full-length', 'death-bowling', 'free-hit'],
    sourceKeys: [{ ...MCC, locator: 'Law 21.10 (Non-pitching delivery)' }],
    order: 130,
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
  }),

  delivery({
    slug: 'slower-ball',
    title: 'Slower Ball',
    category: 'pace-bowling',
    difficulty: 'intermediate',
    summary:
      'A deliberately slower delivery disguised as a normal one, designed to make the batter hit too early.',
    explanation: `A slower ball is bowled at reduced pace, with the arm speed and action kept as close to normal as possible.

Its target is **timing**, not technique. A batter's stroke is calibrated to the pace they have been facing; a ball arriving fifteen or twenty km/h slower than expected is met early, hit into the air off the top of the bat, or missed entirely.

There is a family of them: off-cutters, leg-cutters, knuckle balls, back-of-the-hand slower balls, and simply gripping the ball more loosely. Which one a bowler uses depends on what they can disguise.`,
    gripAndRelease: `Described as convention, and bowlers differ substantially. The common methods:

- **Off- or leg-cutter**: fingers dragged across the ball at release, taking pace off and imparting sidespin.
- **Knuckle ball**: the ball held on the knuckles or fingertips so it leaves the hand with little spin and less speed.
- **Back-of-the-hand**: the wrist turned so the ball is released with the palm facing upwards, arriving slower and often with unusual drift.
- **Split-finger**: the fingers spread wider on the ball.

The unifying requirement is arm speed. The bowler's arm must come through at full speed, because the arm is what the batter is reading.`,
    batterExpects: `A ball at the pace of the previous five deliveries, and a shot timed accordingly.`,
    actuallyHappens: `The ball arrives late. The batter is through the shot before it gets there, so the ball goes off the top of the bat or the leading edge, usually straight up.`,
    whyEffective: `Because the mistake goes upwards. A batter deceived in pace almost always hits the ball in the air, so slower balls produce catches to the ring and the boundary rather than edges. In T20 cricket the caught-in-the-deep dismissal off a slower ball is one of the most common ways a wicket falls.`,
    whenYouWillSeeIt: `The death overs of limited-overs cricket, above all. Also to a set batter who has been driving well, and on slow, low pitches where the ball holds up anyway.`,
    counteredBy: `- **Watching the ball rather than the arm**, and being willing to check the shot.
- **Hitting with the spin** where the slower ball is a cutter.
- **Playing late** and adjusting, rather than committing to a premeditated swing.
- **Using the crease** to get closer or further away and change the effective arrival.`,
    misunderstandings: `**"A slower ball is just a slow ball."** Without disguise it is simply short of pace and easy to hit. The disguise is the delivery.

**"Slower balls are only for T20."** They are used in every format, though the death overs make them most visible.`,
    takeaways: `- Reduced pace with unchanged arm speed and action.
- Attacks timing, so errors go into the air.
- A family of grips, all requiring the same disguise.`,
    related: [
      'off-cutter',
      'leg-cutter',
      'knuckle-ball',
      'variation',
      'death-bowling',
      'release-point',
    ],
    order: 140,
  }),

  delivery({
    slug: 'off-cutter',
    title: 'Off-cutter',
    category: 'pace-bowling',
    difficulty: 'advanced',
    summary:
      'A slower ball with the fingers cut down the side of the ball, moving it in to a right-hander off the pitch.',
    explanation: `An off-cutter is a pace bowler's slower ball that behaves a little like an off break. The fingers drag across the ball at release, taking pace off and imparting sidespin, so the ball can move **in to a right-handed batter** off the surface.

It gives a fast bowler two things at once: a change of pace and a change of direction, both from a normal-looking action.`,
    gripAndRelease: `Conventionally described: the fingers are positioned across or beside the seam and dragged down the off side of the ball at release, in a cutting motion, which reduces speed and imparts spin. Bowlers vary in whether they emphasise the finger drag or the wrist, and how much pace they take off.`,
    batterExpects: `A ball at full pace, holding its line or swinging conventionally.`,
    actuallyHappens: `It arrives slower and, on a responsive surface, deviates in towards a right-hander after pitching. The batter's shot is early and aimed on the wrong line.`,
    whyEffective: `Two variables changed together. A batter can adjust for pace or for movement, and doing both in the same fraction of a second is much harder. It is particularly effective on slow, dry surfaces where the ball grips.`,
    whenYouWillSeeIt: `Death overs, and on subcontinental or worn pitches where a hard-length cutter is more effective than an attempt at pace. Common from bowlers whose stock ball moves the other way, since it doubles their options.`,
    counteredBy: `- **Playing late** rather than committing to a swing.
- **Hitting with the movement**, into the leg side for a right-hander.
- **Watching for the visible finger position** at release, where it is sometimes detectable.`,
    misunderstandings: `**"An off-cutter is an off break."** The action is a pace bowler's; the mechanism is a finger drag at speed rather than a spinner's revolutions.

**"It works on any pitch."** It needs a surface with some grip. On a hard, true pitch it can simply be a slower ball with less to offer.`,
    takeaways: `- A pace bowler's slower ball that moves in to a right-hander.
- Produced by dragging the fingers across the ball at release.
- Combines a pace change and a direction change.`,
    related: ['leg-cutter', 'slower-ball', 'off-break', 'death-bowling', 'spin-friendly-pitch'],
    order: 150,
  }),

  delivery({
    slug: 'leg-cutter',
    title: 'Leg-cutter',
    category: 'pace-bowling',
    difficulty: 'advanced',
    summary:
      'The mirror of the off-cutter: a slower ball cut to move away from a right-hander off the pitch.',
    explanation: `A leg-cutter is a pace bowler's slower ball that moves **away from a right-handed batter** after pitching, behaving somewhat like a leg break bowled at speed.

Like the off-cutter it changes pace and direction together, but the direction of the error is different: an edge from a leg-cutter carries towards the slips and the keeper rather than into the leg side.`,
    gripAndRelease: `Conventionally the mirror of the off-cutter: the fingers drag across the leg side of the ball at release. Bowlers describe it as the harder of the two to control, and many bowl one and not the other.`,
    batterExpects: `A full-pace delivery on a predictable line.`,
    actuallyHappens: `A slower ball that leaves the right-hander off the pitch, arriving after the shot has begun and moving away from the middle of the bat.`,
    whyEffective: `The combination of deception in pace and movement towards the catchers. An early shot at a ball moving away produces exactly the edge the field is set for.`,
    whenYouWillSeeIt: `Less often than the off-cutter, because it is generally regarded as harder to bowl reliably. Most common on responsive surfaces and from bowlers with strong finger control.`,
    counteredBy: `- **Playing late and close to the body**, so an early shot does not reach out to the edge.
- **Soft hands** on contact.
- **Declining to commit** to a premeditated stroke.`,
    misunderstandings: `**"Every bowler with an off-cutter has a leg-cutter."** Most bowlers have one, not both.

**"It is the same as a leg break."** The mechanism and the pace are entirely different; only the direction of deviation is comparable.`,
    takeaways: `- A slower ball moving away from a right-hander.
- The mirror of the off-cutter and generally harder to bowl.
- Errors carry towards the keeper and slips.`,
    related: ['off-cutter', 'slower-ball', 'leg-break', 'variation', 'seam-movement'],
    order: 160,
  }),

  delivery({
    slug: 'knuckle-ball',
    title: 'Knuckle Ball',
    category: 'pace-bowling',
    difficulty: 'advanced',
    summary:
      'A slower ball released off the knuckles or fingertips, leaving the hand with almost no spin.',
    explanation: `The knuckle ball is a slower ball held on the knuckles or fingertips rather than in the fingers' normal grip, so the ball rolls out of the hand with very little rotation and noticeably reduced pace.

The absence of spin is the point. A ball with little rotation is aerodynamically less stable and can drop or hold up unpredictably, and it comes off the pitch differently from a ball with backspin.

Borrowed in name and principle from baseball, where the same idea is used for the same reason.`,
    gripAndRelease: `Described as convention: the ball is held with the fingers bent so the knuckles or fingertips are against the surface, and pushed out rather than pulled down. Because the fingers cannot impart their usual force, pace drops substantially while the arm continues at full speed.

Bowlers report it as one of the harder variations to control, precisely because the grip removes the normal feel of release.`,
    batterExpects: `A full-pace delivery, read from an unchanged arm.`,
    actuallyHappens: `The ball arrives slower and often lower or shorter than the trajectory suggested, with little of the expected bounce. The batter's shot is early and often through the line of a ball that has dipped.`,
    whyEffective: `It is very difficult to detect. Unlike a cutter, there is no visible finger drag across the ball, and unlike a back-of-the-hand ball there is no wrist change to spot. The disguise is close to complete, which is why it has spread quickly in T20 cricket.`,
    whenYouWillSeeIt: `Death overs in T20 and ODI cricket, most often from bowlers who already have a cutter and want a second, less readable slower ball.`,
    counteredBy: `- **Waiting**, rather than committing to a premeditated swing.
- **Hitting straight** rather than across the line, since the ball's behaviour is less predictable.
- **Accepting a single** rather than attacking a ball whose length has changed.`,
    misunderstandings: `**"A knuckle ball spins."** It is defined by the near absence of spin.

**"It is a gimmick."** It is a standard part of the T20 fast bowler's repertoire, though a difficult one to control.`,
    takeaways: `- Released off the knuckles or fingertips with almost no rotation.
- Slower, less predictable in flight and off the pitch.
- Very hard for a batter to detect at release.`,
    related: ['slower-ball', 'off-cutter', 'variation', 'death-bowling', 'release-point'],
    order: 170,
  }),

  delivery({
    slug: 'cross-seam-delivery',
    title: 'Cross-seam Delivery',
    category: 'pace-bowling',
    difficulty: 'advanced',
    summary:
      'The ball held with the seam across the direction of travel, suppressing swing and producing less predictable bounce.',
    explanation: `A cross-seam delivery is bowled with the seam turned **across** the line of flight rather than angled along it.

Two consequences follow. The ball does not swing conventionally, because the aerodynamic asymmetry that produces swing depends on a stable angled seam. And when it lands, it may land on the leather rather than the seam, or on the seam at an unhelpful angle, which produces variable bounce.

That variability is the purpose. A bowler using cross-seam is choosing unpredictability over control, usually because the conditions make predictable deliveries unproductive.`,
    gripAndRelease: `The ball is simply held with the seam perpendicular to the direction of travel. There is no specialised release; it is a grip change, which is what makes it available to any bowler at any time.

A related option is the **wobble seam**, where the seam is deliberately left unstable so the landing orientation varies ball to ball.`,
    batterExpects: `Consistent bounce and, if the bowler has been swinging it, movement in the air.`,
    actuallyHappens: `No swing, and bounce that differs from the previous delivery: sometimes skidding lower, sometimes climbing more.`,
    whyEffective: `On a hard or abrasive surface it can extract bounce a conventional seam-up delivery will not. It also **preserves the ball**: bowling cross-seam roughens one side less predictably, and some sides use it deliberately to manage the ball's condition.

Against a set batter, the value is simply that neither the batter nor the bowler knows exactly what the ball will do.`,
    whenYouWillSeeIt: `On flat, hard pitches where conventional methods have stopped working; in white-ball cricket to change the batter's rhythm; and in the middle overs when a captain wants a bowler to do something other than the same good-length ball.`,
    counteredBy: `- **Playing straight** rather than across the line, since bounce is the variable.
- **Waiting** for the ball rather than committing early.
- **Accepting that some deliveries will be unplayable** and not treating each as readable.`,
    misunderstandings: `**"Cross-seam is a mistake."** It is a deliberate choice, and a common one.

**"Cross-seam produces more movement."** It produces less **swing** and more variable **bounce**, which are different things.`,
    takeaways: `- Seam across the line of travel, so the ball does not swing.
- Produces variable bounce off the pitch.
- Also used to manage the ball's condition.`,
    related: ['seam-position', 'swing-bowling', 'seam-movement', 'variation', 'bounce'],
    sourceKeys: [WP_SWING],
    order: 180,
  }),

  definition({
    slug: 'back-of-a-length',
    title: 'Back-of-a-length',
    category: 'pace-bowling',
    difficulty: 'advanced',
    summary:
      'Slightly shorter than a good length: not short enough to attack, not full enough to drive.',
    explanation: `Back of a length is the band just shorter than a good length. The ball arrives around the batter's ribs or chest as they are still deciding whether to come forward.

It is not a wicket-taking length in the way a good length is, and it is not a scoring length either. It is a **holding** length, and it forces three things on a batter: back-foot play, hitting the ball on the rise, and playing square rather than straight.

The term is more common in modern coaching and analysis than in older cricket writing, and it reflects a genuine tactical shift, particularly in white-ball cricket, towards lengths that are hard to hit rather than lengths that are likely to take a wicket.`,
    whyItMatters: `In limited-overs cricket, denying the batter is often worth more than attacking them, and back of a length is the most reliable denying length on a good pitch: too short to drive, too full to pull comfortably, and arriving at a height where a cross-batted shot risks a top edge.

In red-ball cricket it is used against a set batter to change the rhythm before returning to a fuller length.`,
    misunderstandings: `**"Back of a length is just short."** A genuinely short ball can be pulled. This length is specifically the one that cannot be comfortably attacked.

**"It is a defensive length only."** It produces wickets by way of mistimed cross-batted shots, especially in T20.`,
    related: [
      'good-length',
      'short-ball',
      'length',
      'defensive-bowling',
      'middle-overs-batting',
      'dot-ball-pressure',
    ],
    order: 190,
  }),

  delivery({
    slug: 'wide-yorker',
    title: 'Wide Yorker',
    category: 'pace-bowling',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'A yorker aimed wide outside off stump, taking the ball away from the batter’s swing at the death.',
    explanation: `A wide yorker is bowled at yorker length, right at the batter's feet, but aimed **well outside off stump** rather than at the base of the stumps.

The idea is to be out of reach. A batter at the death is trying to swing through the line; a ball that is both very full and very wide gives them nothing to swing at, and reaching for it means hitting away from the body with no leverage.

It is one of the defining deliveries of modern T20 death bowling, alongside the conventional yorker and the slower ball.`,
    gripAndRelease: `No specialised grip: it is a line and length combination. What it demands is precision under pressure, since the target band is small in two dimensions rather than one.

Bowlers usually deliver it from wide of the crease to increase the angle, which makes the ball harder to reach and takes it further from the stumps.`,
    batterExpects: `Something in their arc: a yorker at the stumps, a length ball, or a slower ball they can hit.`,
    actuallyHappens: `The ball is at their toes and outside their reach. The realistic outcomes are a swing and a miss, a thick edge to the off side, or a stretch that produces a mistimed shot.`,
    whyEffective: `It removes leverage. Hitting a boundary requires the batter to get their weight through the ball, and a delivery that is both full and wide makes that impossible without moving first, which a bowler can respond to.

Wickets tend to come as edges to the keeper and third man, or from the batter being beaten and stranded.`,
    whenYouWillSeeIt: `The last four overs of a T20 or ODI innings, and against a batter who has been hitting straight. Frequently bowled in pairs with the conventional yorker so the batter cannot commit to one line.`,
    counteredBy: `- **Moving across the crease early** to bring it within reach, which risks exposing the stumps.
- **The scoop or ramp**, using the ball's line rather than fighting it.
- **Leaving it**, if the umpire will call it a wide, which turns the bowler's plan into a run.`,
    misunderstandings: `**"A wide yorker is a wide."** Only if it goes far enough outside the permitted band. The delivery is designed to sit just inside it, which is what makes it hard to bowl.

**"It is a defensive delivery."** It is a wicket-taking option at the death, and it produces edges as well as dot balls.`,
    takeaways: `- Yorker length, aimed well outside off stump, usually from wide of the crease.
- Denies the batter leverage rather than attacking the stumps.
- Risky: slightly too wide is a wide, slightly too full is a hittable full toss.`,
    related: ['yorker', 'death-bowling', 'wide', 'scoop', 'ramp-shot', 'free-hit'],
    sourceKeys: [
      { key: 'icc-playing-conditions', locator: 'Wide interpretation in limited-overs cricket' },
    ],
    order: 200,
  }),
];
