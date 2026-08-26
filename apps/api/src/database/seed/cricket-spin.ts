import { concept, delivery } from './cricket-explainer-helpers';
import { ICC_PC, MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Spin bowling.
 *
 * Three editorial commitments here, all of them about not overclaiming.
 *
 * **Terminology.** Some of spin's vocabulary is dated and some of it is worse
 * than dated. "Chinaman" has an origin in a racialised remark and is being
 * retired in favour of "left-arm wrist spin"; the modern term is primary here
 * and the old one is recorded as a searchable alias with its history stated.
 *
 * **Mechanics.** Grips and wrist positions are teaching conventions, not
 * measurements, and individual bowlers differ enormously. Every description says
 * so.
 *
 * **Repertoire.** Not every spinner bowls every variation, and implying
 * otherwise misleads a reader about what they are watching. Several entries say
 * plainly that the delivery is rare or that most bowlers do not have it.
 */

const WP_GOOGLY = { key: 'wp-googly' } as const;
const MCC = { key: 'mcc-laws' } as const;

export const CRICKET_SPIN: ExplainerSeed[] = [
  concept({
    slug: 'spin-bowling',
    title: 'Spin Bowling',
    category: 'spin-bowling',
    difficulty: 'beginner',
    summary:
      'Bowling slowly with heavy revolutions on the ball, to make it deviate off the pitch and deceive in the air.',
    explanation: `A spin bowler gives up pace in exchange for **revolutions**. The ball is delivered at perhaps 70 to 95 km/h, but spinning fast enough that when it lands, the contact between the spinning surface and the pitch deflects it sideways.

Spin works on two planes at once, and beginners usually notice only the first.

**Off the pitch.** The ball grips and turns, so the batter's predicted line is wrong.

**In the air.** Revolutions produce **drift** and **dip**: the ball can curve slightly in flight and drop shorter than its trajectory suggested. A batter deceived in the air is out of position before the turn even matters, which is why the best spinners are often described in terms of flight rather than turn.`,
    howItWorks: `Spin divides into two families by **how the revolutions are imparted**, and the distinction runs through everything else.

**Finger spin.** The ball is spun by the fingers rolling across it. Right-arm finger spin is **off spin**, turning in to a right-hander. Left-arm finger spin is **orthodox left-arm spin**, turning away from a right-hander.

**Wrist spin.** The ball is spun by the wrist and the whole hand rotating. Right-arm wrist spin is **leg spin**, turning away from a right-hander. Left-arm wrist spin turns in to a right-hander.

Finger spin is generally the more controllable and wrist spin the more dangerous, which is the trade a captain makes when picking one.

Direction of turn is also relative to the batter's handedness, so a spinner turning the ball away from a right-hander turns it in to a left-hander, which is why left-right batting pairs disrupt spin plans.`,
    whyItMatters: `Spinners bowl the majority of overs in some conditions and are the primary wicket-takers in others, particularly on dry, worn or dusty surfaces where pace bowling loses its threat.

They also do something structurally different from pace bowlers: they can bowl long, economical spells that hold an innings together, and in limited-overs cricket the middle overs are largely their territory.`,
    formatDifferences: `**Test cricket** rewards a spinner who can bowl thirty overs in a day, use a worn pitch and attack with close catchers.

**Limited-overs cricket** rewards a different profile: control, variation, and the ability to bowl into the pitch and deny boundaries. Wrist spinners have become central to T20 because a mis-hit against turn goes in the air, and mis-hits are what a T20 bowler wants.`,
    misunderstandings: `**"Spin means slow bowling."** Slow bowling without revolutions is just slow. Spin is defined by the rotation.

**"More turn is better."** Not necessarily. A ball that turns enormously is often easier to play than one that turns just enough to beat the bat, because a big turner passes outside the stumps and edges.

**"Every spinner bowls the same variations."** Most spinners have two or three deliveries. Bowling every named variation badly is worse than bowling one well.`,
    takeaways: `- Revolutions rather than pace, working both off the pitch and in the air.
- Two families: finger spin and wrist spin.
- Direction of turn depends on the batter's handedness.
- Flight and dip matter as much as turn.`,
    related: [
      'finger-spin',
      'wrist-spin',
      'off-spin',
      'leg-spin',
      'playing-against-spin',
      'rough',
      'spin-friendly-pitch',
    ],
    order: 10,
  }),

  concept({
    slug: 'finger-spin',
    title: 'Finger Spin',
    category: 'spin-bowling',
    difficulty: 'intermediate',
    summary:
      'Spin imparted by the fingers rolling across the ball: more controllable, less extravagant than wrist spin.',
    explanation: `Finger spin imparts revolutions with the fingers rather than the wrist. The index and middle fingers roll down and across the ball at release, and the wrist stays relatively firm.

Two disciplines, by bowling arm:

- **Right-arm finger spin** is **off spin**. The ball turns in to a right-handed batter.
- **Left-arm finger spin** is **orthodox left-arm spin**. The ball turns away from a right-handed batter.

Finger spin is generally described as the more **repeatable** of the two spin families. The action is closer to a natural throwing motion and the release is less complex, so a finger spinner can typically land the ball where they intend more often than a wrist spinner can.`,
    howItWorks: `The trade against wrist spin is consistent and worth stating plainly.

**Finger spin gives up** revolutions and therefore, usually, degree of turn and amount of drift. It also has a harder time producing a genuinely deceptive ball that turns the other way: the finger spinner's version, the **doosra**, is difficult to bowl without straightening the elbow beyond the permitted tolerance, which is why it has been the subject of repeated legality scrutiny.

**Finger spin gains** control, economy and the ability to bowl very long spells. On a turning pitch a finger spinner can bowl the same ball thirty times and let the surface do the work.

The stock deliveries are the **off break** or the left-arm equivalent, the **arm ball** which goes straight on, and variations of pace, flight and angle rather than of grip.`,
    whyItMatters: `Most Test-match spin overs in history have been bowled by finger spinners, because the discipline suits long spells and pressure-building. In limited-overs cricket finger spinners are the standard middle-overs option for the same reason: a bowler who concedes few boundaries for four or ten overs is worth more than one who might take a wicket and might go for thirty.`,
    misunderstandings: `**"Finger spin is easier."** It is more repeatable, which is not the same thing. Controlling flight and using a pitch well is a lifetime's craft.

**"Finger spinners cannot turn the ball the other way."** Some bowl a doosra or a carrom ball. Both are difficult, and the doosra in particular has legality complications.`,
    takeaways: `- Revolutions from the fingers, with a firm wrist.
- Off spin from a right-armer, orthodox left-arm spin from a left-armer.
- More control and economy, generally less turn and drift than wrist spin.`,
    related: [
      'off-spin',
      'orthodox-left-arm-spin',
      'off-break',
      'arm-ball',
      'doosra',
      'carrom-ball',
      'wrist-spin',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 21 (No ball: fair delivery)' }],
    order: 20,
  }),

  concept({
    slug: 'wrist-spin',
    title: 'Wrist Spin',
    category: 'spin-bowling',
    difficulty: 'intermediate',
    summary:
      'Spin imparted by rotating the wrist and hand: more revolutions and more variation, at the cost of control.',
    explanation: `Wrist spin imparts revolutions by rotating the wrist and the whole hand at release, so the ball comes out of the side or back of the hand rather than off the fingers.

Two disciplines:

- **Right-arm wrist spin** is **leg spin**. The stock ball turns away from a right-handed batter.
- **Left-arm wrist spin** turns in to a right-handed batter. This is the discipline historically called "chinaman", a term now being retired.

The defining property is **revolutions**. A wrist spinner can impart substantially more spin than a finger spinner, which produces more turn off the pitch and more drift and dip in the air.`,
    howItWorks: `The trade is the mirror of finger spin's.

**Wrist spin gives up** control. The release is complex, the margin for error is larger, and even elite wrist spinners bowl more genuinely bad balls per over than elite finger spinners.

**Wrist spin gains** two things. The first is threat: a ball turning sharply away from a right-hander takes both edges and the stumps into play. The second is **variation**, and this is the real advantage. Because the wrist decides the spin axis, a wrist spinner can bowl a ball that turns the other way, the **googly**, without changing the visible action, along with topspinners, sliders and flippers.

No finger spinner has as clean a set of options, which is why wrist spin is the more feared discipline despite being the less economical one.`,
    whyItMatters: `Wrist spin has become central to T20 cricket, and the reason is structural: a batter trying to hit against sharp turn mis-hits into the air, and a mis-hit in a T20 is usually a wicket. The economy cost that made wrist spinners a luxury in one-day cricket matters less when the alternative is a bowler who does not take wickets.

In Test cricket a wrist spinner who can control their length is a match-winner on a fourth-day pitch.`,
    misunderstandings: `**"Wrist spinners are inconsistent, therefore worse."** The variance is real; so is the wicket-taking. Which matters more depends on the format and the situation.

**"Every wrist spinner has a googly."** Many do not, and among those who do, quality varies enormously.

**"Wrist spin is the same as unorthodox spin."** "Unorthodox" usually refers specifically to left-arm wrist spin, which is a subset.`,
    takeaways: `- Revolutions from wrist and hand rotation, not the fingers.
- Leg spin from a right-armer; left-arm wrist spin from a left-armer.
- More turn, drift and variation; less control.
- The variation set, above all the googly, is the real advantage.`,
    related: [
      'leg-spin',
      'left-arm-wrist-spin',
      'leg-break',
      'googly',
      'topspinner',
      'flipper',
      'slider',
      'finger-spin',
    ],
    order: 30,
  }),

  concept({
    slug: 'off-spin',
    title: 'Off Spin',
    category: 'spin-bowling',
    difficulty: 'beginner',
    summary:
      'Right-arm finger spin, turning the ball in to a right-handed batter and away from a left-hander.',
    explanation: `Off spin is right-arm finger spin. The stock ball, the **off break**, turns from the off side to the leg side for a right-handed batter: it comes **in** to them after pitching.

The name comes from the direction of the break relative to the stumps rather than from anything about the bowler.

Because the ball turns in to a right-hander, the off spinner's threats are the stumps, the front pad, and the inside edge. The dismissals are bowled, LBW and bat-pad catches to short leg, which is why an off spinner on a turning pitch is usually bowling with close catchers on the leg side.

Against a **left-hander** everything inverts: the ball turns away, the outside edge comes into play, and the field changes accordingly. This is why an off spinner's match-up against left-handers is a standing tactical question.`,
    howItWorks: `The repertoire is smaller than a leg spinner's and used differently.

- The **off break** is the stock ball, and most off spinners bowl it the overwhelming majority of the time.
- The **arm ball** goes straight on with the arm, often with a little away-drift, and is the surprise ball: a batter playing for turn that does not come is beaten on the inside.
- **Changes of pace, angle and flight** do most of the rest of the work, along with bowling from wide of the crease or close to the stumps to change the geometry.
- Some off spinners bowl a **doosra**, turning the other way, and some a **carrom ball**. Both are difficult and neither is common.

The **rough** matters enormously. An off spinner bowling to a right-hander can aim at the patch worn by a left-arm bowler's follow-through, and a ball landing in it turns unpredictably.`,
    whyItMatters: `Off spin is the most widely bowled spin discipline in the world, and in Test cricket a front-line off spinner is often the bowler who holds an innings together: economical, able to bowl thirty overs, and dangerous on a worn surface.

In T20 the discipline has been reshaped by the powerplay: off spinners now regularly bowl the first over, because a ball turning in to a right-hander is hard to hit through the off side with the field up.`,
    formatDifferences: `In Tests, long spells, close catchers and attacking the pitch's rough. In T20, four overs, a flatter and quicker trajectory, and a plan built around denying the batter room rather than beating them in the air.`,
    misunderstandings: `**"Off spin turns away from the batter."** It turns in to a right-hander. Away from a left-hander.

**"Off spinners need a doosra to trouble left-handers."** Angle, the crease, and the ball that goes straight on all work; a doosra is one option and a rare one.

**"Off spin is the defensive spin discipline."** It is more economical on average, and it takes a very large share of Test wickets.`,
    takeaways: `- Right-arm finger spin; the off break turns in to a right-hander.
- Attacks stumps, pad and inside edge; bat-pad catches on the leg side.
- Inverts entirely against left-handers.
- The most commonly bowled spin discipline.`,
    related: [
      'off-break',
      'finger-spin',
      'arm-ball',
      'doosra',
      'short-leg',
      'rough',
      'playing-against-spin',
    ],
    order: 40,
  }),

  concept({
    slug: 'leg-spin',
    title: 'Leg Spin',
    category: 'spin-bowling',
    difficulty: 'beginner',
    aliases: ['Leggie', 'Leg-break Bowling'],
    summary:
      'Right-arm wrist spin, turning the ball away from a right-handed batter, with the widest set of variations in cricket.',
    explanation: `Leg spin is right-arm wrist spin. The stock ball, the **leg break**, turns from the leg side to the off side for a right-handed batter: it moves **away** from them after pitching.

The threat profile is the opposite of off spin's. A ball turning away from a right-hander attacks the **outside edge**, so a leg spinner bowls with a slip and often a short leg, hunting both the edge and the ball that turns too much and beats everything.

Leg spinners also have the most complete set of variations available to any bowler: the **googly** turning the other way, the **topspinner** bouncing more, the **slider** and the **flipper** skidding on. All can be bowled from the same action, which is the discipline's central advantage.`,
    howItWorks: `A leg spinner's over is usually built around threat rather than containment.

The stock leg break does the work: pitched on or outside off to a right-hander, turning away, with enough revolutions to produce drift in the air as well as turn off the pitch.

The variations are used sparingly and specifically. A googly to a batter who has settled into playing for the turn; a topspinner to a batter playing back; a flipper at a batter expecting a leg break.

The cost is consistency. Even elite leg spinners bowl loose deliveries, and a captain using one is accepting a higher variance in exchange for a higher chance of wickets.`,
    whyItMatters: `Leg spin has gone from a luxury to a core discipline in the past decade, largely because of T20. In a format where a wicket is worth more than four dot balls and where every batter is trying to hit, a bowler who turns the ball sharply and can bowl a ball that turns the other way is extremely valuable.

In Test cricket leg spin remains the most likely way to bowl a side out on an unresponsive pitch, because it does not depend on the surface to the extent finger spin does.`,
    formatDifferences: `In Tests, a leg spinner is a wicket-taking option who may concede runs and is expected to. In T20, control has become part of the job description: modern leg spinners bowl flatter and faster than their predecessors and are judged on economy as well as wickets.`,
    misunderstandings: `**"Leg spin turns in to the batter."** It turns away from a right-hander.

**"Leg spinners are expensive."** More variable than finger spinners, and in T20 several of the most economical bowlers in the world are leg spinners.

**"A leg spinner should bowl a googly every over."** Overuse destroys the disguise, which is the delivery's only asset.`,
    takeaways: `- Right-arm wrist spin; the leg break turns away from a right-hander.
- Attacks the outside edge, with a slip in place.
- The widest variation set in cricket, at the cost of consistency.
- Central to modern T20 cricket.`,
    related: ['leg-break', 'googly', 'topspinner', 'flipper', 'slider', 'wrist-spin', 'slip'],
    sourceKeys: [WP_GOOGLY],
    order: 50,
  }),

  concept({
    slug: 'orthodox-left-arm-spin',
    title: 'Orthodox Left-arm Spin',
    category: 'spin-bowling',
    difficulty: 'intermediate',
    aliases: ['Slow Left-arm Orthodox', 'SLA', 'Left-arm Orthodox'],
    summary:
      'Left-arm finger spin, turning the ball away from a right-handed batter. The mirror of off spin.',
    explanation: `Orthodox left-arm spin is left-arm finger spin: the same finger action as off spin, from the other arm, producing the opposite turn.

For a **right-handed batter** the ball turns away, towards the off side, which makes the threat profile similar to leg spin's: the outside edge, the slip, and the ball that turns past everything.

For a **left-handed batter** it turns in, like off spin to a right-hander.

"Orthodox" distinguishes it from **left-arm wrist spin**, which is the unorthodox variety and turns the other way. The two are entirely different disciplines that happen to share a bowling arm.`,
    howItWorks: `The mechanics are finger spin's: fingers rolling across the ball, firm wrist, and a repeatable action that allows long spells.

Two features are distinctive.

**The natural angle.** A left-arm spinner bowling to a right-hander from wide of the crease creates an angle across the batter and then turns the ball further away, which widens the margin the batter has to cover. Bowling from close to the stumps instead brings LBW into play.

**The rough.** A left-arm orthodox bowler's stock ball to a right-hander drifts and turns towards the off side, and they can aim at the rough patch worn by right-arm bowlers' follow-through outside the right-hander's off stump. Late in a Test match this is one of the most productive things in cricket.

The variation set is small: the ball that goes straight on with the arm, changes of pace and flight, and the angle.`,
    whyItMatters: `It is one of the most economical wicket-taking disciplines in cricket, and it has a specific structural value: because it turns away from right-handers, a left-arm orthodox bowler is the natural partner for an off spinner, since between them they turn the ball both ways to any batter without either needing a difficult variation.`,
    misunderstandings: `**"Left-arm orthodox is the same as chinaman bowling."** They are opposites. Orthodox is finger spin turning away from a right-hander; left-arm wrist spin turns in.

**"It is just off spin from the other side."** The action is comparable; the tactical consequences, fields and match-ups are entirely different because the ball goes the other way.`,
    takeaways: `- Left-arm finger spin; turns away from a right-hander.
- Threatens the outside edge, and uses right-arm bowlers' rough.
- Distinct from left-arm wrist spin, which turns the other way.
- Pairs naturally with an off spinner.`,
    related: ['finger-spin', 'off-spin', 'left-arm-wrist-spin', 'rough', 'arm-ball', 'slip'],
    order: 60,
  }),

  concept({
    slug: 'left-arm-wrist-spin',
    title: 'Left-arm Wrist Spin',
    category: 'spin-bowling',
    alsoIn: ['terminology'],
    difficulty: 'advanced',
    aliases: ['Left-arm Unorthodox', 'Chinaman', 'SLW'],
    summary:
      'Wrist spin from a left-arm bowler, turning in to a right-handed batter. Historically called "chinaman", a term now being retired.',
    explanation: `Left-arm wrist spin is the rarest of the four spin disciplines. The bowler uses a wrist-spinner's action from the left arm, so the stock ball turns **in to a right-handed batter** and away from a left-hander.

Functionally it is the mirror of leg spin. The stock delivery threatens a right-hander's stumps and pads rather than their outside edge, and the bowler's **googly** turns away instead of in.

Because the discipline is uncommon, batters face it far less often than they face off spin or leg spin, and that unfamiliarity is part of its value.`,
    howItWorks: `The mechanics are wrist spin's: the ball spun by wrist and hand rotation, with the same trade of control for revolutions and variation.

The variation set mirrors a leg spinner's, with each delivery's direction reversed. The stock ball turns in to a right-hander; the googly turns away.

The rarity has a practical consequence for the bowler as well as the batter: there are fewer coaches and fewer templates, and left-arm wrist spinners have often developed idiosyncratic actions as a result.`,
    whyItMatters: `Beyond the unfamiliarity, the discipline solves a specific tactical problem. Against a strong right-handed batting side, a left-arm wrist spinner turns the ball in to the right-handers and away from the left-handers, which is the opposite pattern from an off spinner and gives a captain a genuine match-up option.

In T20 the value is the same as any wrist spinner's: sharp turn produces mis-hits, and mis-hits produce wickets.`,
    misunderstandings: `**"Chinaman is the correct name for this."** It is a historical term whose origin lies in a racialised remark made about a bowler of Chinese descent in the 1930s. Cricket has been moving away from it, and major broadcasters, publications and coaching bodies increasingly use "left-arm wrist spin" or "left-arm unorthodox". SportBrain uses the modern term as primary and records the old one only so that a reader searching for it finds the right page.

**"It is the same as left-arm orthodox."** They are opposites: orthodox is finger spin turning away from a right-hander.

**"A chinaman is a specific delivery."** The term referred to the bowling type, not to one ball. The delivery that turns the other way is a googly, as with any wrist spinner.`,
    takeaways: `- Wrist spin from the left arm; turns in to a right-hander.
- The mirror of leg spin, including its googly.
- Rare, which is part of its value.
- "Chinaman" is a retired term with a racialised origin; the modern name is left-arm wrist spin.`,
    related: ['wrist-spin', 'leg-spin', 'orthodox-left-arm-spin', 'googly', 'matchups'],
    sourceKeys: [WP_GOOGLY],
    order: 70,
  }),

  delivery({
    slug: 'off-break',
    title: 'Off Break',
    category: 'spin-bowling',
    difficulty: 'beginner',
    summary: 'The off spinner’s stock ball, turning in to a right-handed batter after pitching.',
    explanation: `The off break is the delivery that defines off spin. Bowled by a right-arm finger spinner, it turns from the off side towards the leg side for a right-hander, coming **in** to them.

To a left-hander the same ball turns away, which changes which edge is in play and which fielders matter.

It is the most frequently bowled spin delivery in cricket. Most off spinners bowl it the great majority of the time and win their wickets with it rather than with variations.`,
    gripAndRelease: `Described as coaching convention; bowlers vary considerably.

The index and middle fingers are spread across the seam, with the index finger providing most of the spin. At release the fingers roll down and across the ball, anticlockwise from the bowler's perspective for a right-armer, and the wrist stays relatively firm rather than rotating.

Coaches commonly describe the release as "like turning a doorknob" with the fingers rather than the wrist, which is a teaching image rather than a description of the mechanics.`,
    batterExpects: `Depending on the bowler's flight and the angle, either a ball to defend on the front foot or one to work into the leg side.`,
    actuallyHappens: `The ball grips and turns in towards the stumps and pads. A batter who has played for the line finds the ball inside the bat, so the outcomes are bowled through the gate, LBW, a bat-pad catch, or an inside edge.`,
    whyEffective: `It attacks the stumps directly, so it does not need a fielder to convert an error. On a pitch offering turn, an off break landing on the rough outside a right-hander's off stump can turn a long way and produce genuinely unplayable deliveries.

It also creates its own counterpart: a batter who has committed to covering the turn is vulnerable to the ball that goes straight on.`,
    whenYouWillSeeIt: `Constantly, in all formats and conditions. To right-handers on a turning pitch it is close to the default spin delivery.`,
    counteredBy: `- **Playing with the spin**, working the ball into the leg side rather than against the turn.
- **Getting far forward or well back**, so the ball has less distance in which to turn.
- **Using the feet** to come down the pitch and meet the ball before it can turn.
- **Covering the stumps** with the pad while playing straight, so a missed ball hits the pad in line rather than beating the bat.`,
    misunderstandings: `**"An off break turns away from the batter."** In to a right-hander.

**"Big turn is the aim."** A ball turning too much passes harmlessly outside the stumps. The dangerous off break turns just enough to beat the bat.`,
    takeaways: `- Right-arm finger spin turning in to a right-hander.
- Attacks stumps, pad and inside edge.
- The most frequently bowled spin delivery in cricket.`,
    related: [
      'off-spin',
      'finger-spin',
      'arm-ball',
      'doosra',
      'short-leg',
      'playing-against-spin',
      'through-the-gate',
    ],
    order: 80,
  }),

  delivery({
    slug: 'leg-break',
    title: 'Leg Break',
    category: 'spin-bowling',
    difficulty: 'beginner',
    summary:
      'The leg spinner’s stock ball, turning away from a right-handed batter after pitching.',
    explanation: `The leg break is the leg spinner's stock delivery. Bowled by a right-arm wrist spinner, it turns from the leg side to the off side for a right-hander, moving **away** from them.

To a left-hander it turns in.

Because it moves away from a right-hander, the leg break attacks the outside edge, and a leg spinner usually bowls with a slip in place. A well-bowled leg break also drifts **in** through the air before turning away off the pitch, which doubles the deception: the ball moves one way in flight and the other after pitching.`,
    gripAndRelease: `Coaching convention, with wide individual variation.

The ball is held across the seam with the first two fingers spread, the third finger bent alongside and providing much of the spin, and the thumb resting lightly or not at all. At release the wrist rotates and the ball comes out of the side of the hand, over the third finger, with the seam rotating clockwise from the bowler's perspective for a right-armer.

The wrist doing the work is what distinguishes this from finger spin, and it is also what makes the delivery harder to control.`,
    batterExpects: `A ball drifting in towards the pads or angled across, which they can defend or work away.`,
    actuallyHappens: `Having drifted in, the ball pitches and turns away. A batter who has followed the drift is now playing at a ball moving in the other direction, and the bat's line is wrong twice over.`,
    whyEffective: `The double movement. Drift in the air and turn off the pitch in opposite directions is more than a batter can cover from one position, which is why a good leg break beats good players.

Its errors also go somewhere useful: an edge carries to the keeper or slip, and a ball turning past the bat can beat everything and bowl the batter or hit the stumps via the pad.`,
    whenYouWillSeeIt: `From every leg spinner, most balls. It is the delivery the variations are measured against.`,
    counteredBy: `- **Playing late**, so the drift has finished before the shot begins.
- **Covering the line with the pad** and playing straight rather than reaching.
- **Coming down the pitch** to meet the ball before it turns.
- **Working with the turn** into the off side rather than hitting against it.`,
    misunderstandings: `**"A leg break turns in to the batter."** Away from a right-hander.

**"Drift and turn are the same movement."** They are separate, in opposite directions, and the combination is the point.`,
    takeaways: `- Right-arm wrist spin turning away from a right-hander.
- Often drifts in through the air before turning away.
- Attacks the outside edge, with a slip in place.
- The reference ball against which a leg spinner's variations work.`,
    related: [
      'leg-spin',
      'googly',
      'topspinner',
      'wrist-spin',
      'slider',
      'slip',
      'playing-against-spin',
    ],
    sourceKeys: [WP_GOOGLY],
    order: 90,
  }),

  delivery({
    slug: 'topspinner',
    title: 'Topspinner',
    category: 'spin-bowling',
    difficulty: 'advanced',
    summary:
      'A wrist-spinner’s ball spun forwards rather than sideways, which dips, bounces more and goes straight on.',
    explanation: `A topspinner is bowled with the spin axis turned so the revolutions are largely **forwards** rather than sideways. The consequence is that the ball does not turn much in either direction; instead it **dips** in flight and **bounces higher** off the pitch.

It sits between a leg break and a googly in a wrist spinner's repertoire, both in how it is released and in what it does. The hand position is part-way between the two, which is why it is often described as the delivery a bowler finds on the way to learning a googly.`,
    gripAndRelease: `Convention rather than measurement: the normal leg-break grip with the wrist rotated further, so at release the seam is spinning forwards, roughly end over end, rather than across.

Bowlers describe the release as coming out of the front of the hand rather than the side.`,
    batterExpects: `A leg break, and therefore turn away from them and a predictable trajectory.`,
    actuallyHappens: `The ball dips shorter than the flight suggested, so a batter coming forward is not as far to the pitch as they thought. It then bounces more steeply and goes **straight on** rather than turning, so a batter playing for turn is beaten on the inside.`,
    whyEffective: `It attacks the batter's judgement of **length and height** rather than of line, which is a different axis from every other spin variation. A batter who has adjusted well to turn can still be undone by a ball that lands shorter and climbs.

The dismissals tend to be caught off the glove or a high edge from a batter pushed back, LBW from a ball that went straight on, and catches to short leg off the extra bounce.`,
    whenYouWillSeeIt: `From wrist spinners on pitches with bounce, and to a batter using their feet, since a dipping ball punishes a batter who has committed to coming down the pitch.

It is not a common delivery: many leg spinners bowl a leg break and a googly and little else.`,
    counteredBy: `- **Watching the ball's dip** rather than the initial trajectory.
- **Playing off the back foot** where the extra bounce is expected.
- **Not committing** to a forward stride until the length is clear.`,
    misunderstandings: `**"A topspinner turns a lot."** It turns very little; that is the point.

**"It is just a googly bowled badly."** It is a distinct delivery with a distinct purpose, though the hand positions are related.`,
    takeaways: `- Forward spin rather than sideways: dips, bounces, goes straight on.
- Attacks judgement of length and height rather than line.
- Sits between a leg break and a googly in release and effect.`,
    related: ['leg-break', 'googly', 'flipper', 'wrist-spin', 'leg-spin', 'bounce'],
    sourceKeys: [WP_GOOGLY],
    order: 100,
  }),

  delivery({
    slug: 'flipper',
    title: 'Flipper',
    category: 'spin-bowling',
    difficulty: 'advanced',
    summary:
      'A wrist-spinner’s backspin delivery, squeezed out of the hand to skid on low and fast.',
    explanation: `The flipper is bowled with **backspin** rather than side or top spin, produced by squeezing the ball out between the thumb and fingers.

The effect is the opposite of a topspinner's. Instead of dipping and bouncing, the ball **holds its height in flight, arrives faster than expected, and skids through low** off the pitch.

It is one of the hardest deliveries in cricket to bowl and among the rarest. Most leg spinners never develop a reliable one.`,
    gripAndRelease: `Described as convention, and bowlers who have it describe it differently.

The ball is held between the thumb and the first two fingers and **flicked or squeezed out** at release, the fingers and thumb snapping in opposite directions to impart backspin. The arm and wrist look like a leg break's.

Coaches commonly describe it as the click of clicking your fingers, which is a teaching image. It is also physically demanding on the fingers, which is one reason bowlers use it sparingly.`,
    batterExpects: `A leg break: turn away, and a trajectory that will dip and allow a front-foot push.`,
    actuallyHappens: `The ball skids on, lower and quicker than expected. A batter who has come forward expecting to smother turn finds the ball under their bat and at the base of the stumps.`,
    whyEffective: `It produces the two dismissals a spinner most wants: bowled and LBW. A ball that stays low and arrives early beats a bat coming down on a predicted line, and it does so while heading for the stumps rather than past them.

Its rarity compounds the effect, since batters have little practice against it.`,
    whenYouWillSeeIt: `Rarely. Reserved by the bowlers who have it for a batter who has settled, and used once or twice in a spell rather than regularly.`,
    counteredBy: `- **Staying back** and playing the ball off the pitch rather than committing forward.
- **Watching for the release**, where some bowlers' flippers are detectable.
- **Playing the length, not the expected turn.**`,
    misunderstandings: `**"Every leg spinner can bowl a flipper."** Very few can bowl one reliably; it is among the most difficult deliveries in the game.

**"It is a slower ball."** It typically arrives **faster** through the air than the stock leg break.`,
    takeaways: `- Backspin, squeezed out of the hand.
- Skids low and arrives quicker, rather than dipping and bouncing.
- Produces bowled and LBW.
- Genuinely rare and physically demanding.`,
    related: ['leg-break', 'topspinner', 'googly', 'slider', 'wrist-spin', 'lbw'],
    sourceKeys: [WP_GOOGLY],
    order: 110,
  }),

  delivery({
    slug: 'slider',
    title: 'Slider',
    category: 'spin-bowling',
    difficulty: 'advanced',
    summary:
      'A wrist-spinner’s ball that slides on with side-rotation but little turn, holding its line and skidding.',
    explanation: `A slider is bowled with the fingers cutting down the side of the ball so that it rotates but does not grip and turn in the way a leg break does. It **slides on**, holding roughly its original line, and tends to skid rather than bounce.

The terminology in this area is genuinely inconsistent, and it is worth saying so rather than pretending otherwise: different bowlers and commentators use "slider", "flipper" and "back-spinner" in overlapping ways, and some describe as a slider what others would call a topspinner variant. What is consistent is the **effect**: less turn than the stock ball, and a flatter, skiddier trajectory.`,
    gripAndRelease: `Convention, with the caveat above: the leg-break grip with the fingers dragged down the side of the ball at release rather than the wrist rotating fully, imparting a mixture of side spin and backspin without the full leg-break axis.`,
    batterExpects: `A leg break, and therefore turn away from a right-hander.`,
    actuallyHappens: `The ball holds its line and skids through. The batter's bat comes down expecting the ball to move away, and the ball is straighter and lower than that.`,
    whyEffective: `Like the flipper, it attacks the batter through the stumps rather than past them: a ball that goes straight on when turn was expected brings LBW and bowled into play.

It is also less physically demanding than a flipper, which is why more bowlers have one.`,
    whenYouWillSeeIt: `From modern wrist spinners in white-ball cricket in particular, where a flat, skidding delivery is hard to hit and useful for containment as well as for wickets.`,
    counteredBy: `- **Playing the length** rather than the anticipated turn.
- **Staying side-on and playing straight**, so a ball that holds its line is still met with the full face.
- **Not planting the front foot** across the line in anticipation of turn.`,
    misunderstandings: `**"Slider and flipper are the same."** Usage overlaps, and the terminology is not standardised, but a flipper is specifically the backspin ball squeezed from the hand.

**"A slider is a mistake."** It is a deliberate variation, though a leg break that fails to grip can look identical.`,
    takeaways: `- Side rotation without much grip: slides on, skids low.
- Attacks the stumps rather than the edge.
- Terminology in this family is genuinely inconsistent.`,
    related: ['leg-break', 'flipper', 'topspinner', 'googly', 'wrist-spin', 'variation'],
    sourceKeys: [WP_GOOGLY],
    order: 120,
  }),

  delivery({
    slug: 'arm-ball',
    title: 'Arm Ball',
    category: 'spin-bowling',
    difficulty: 'intermediate',
    summary:
      'A finger spinner’s ball that goes straight on with the arm rather than turning, often drifting slightly away.',
    explanation: `An arm ball is a finger spinner's delivery that does **not** turn. It continues on the line of the bowler's arm, and often drifts a little in the air in the direction the seam is angled, which for an off spinner to a right-hander means away from them.

It is the finger spinner's equivalent of the surprise ball, and its whole value is that the batter has been playing for turn.

Because it needs no special grip beyond a change in how the ball is released, it is available to virtually every finger spinner, unlike the doosra.`,
    gripAndRelease: `Convention: the ball is released with the seam angled and with less finger rotation than an off break, so it behaves more like a slow seam-up delivery than a spinning one. Some bowlers describe it as simply "pushing it through" with the arm.

The requirement is that the action looks the same, which for the arm ball is easier than for most variations because so little changes.`,
    batterExpects: `An off break, turning in to a right-hander, and a bat coming down to cover that turn.`,
    actuallyHappens: `The ball holds its line or drifts slightly away. A batter who has covered the turn is playing inside the line, so the ball takes the outside edge or beats the bat.`,
    whyEffective: `It punishes the correct response to the stock ball. A batter playing an off spinner well is committing to cover the turn, and the arm ball converts that good habit into an edge.

Against a left-hander it is more dangerous still, since it goes straight on towards the stumps where the batter was expecting it to turn away.`,
    whenYouWillSeeIt: `From most finger spinners, a few times an over in some spells. Common early in a batter's innings, before they have judged how much the pitch is turning.`,
    counteredBy: `- **Playing straight** rather than pre-committing to the turn.
- **Watching the ball off the pitch** rather than deciding in flight.
- **Keeping the bat close to the pad**, so a ball that goes straight on does not find a gap.`,
    misunderstandings: `**"An arm ball is a doosra."** A doosra turns the **other** way. An arm ball does not turn at all.

**"It is a bad ball that did not grip."** It is deliberate, though a ball that fails to grip looks the same, which is part of why it works.`,
    takeaways: `- A finger spinner's non-turning ball, often drifting slightly away.
- Punishes a batter who is correctly covering the turn.
- Available to almost every finger spinner, unlike a doosra.`,
    related: [
      'off-spin',
      'off-break',
      'orthodox-left-arm-spin',
      'doosra',
      'finger-spin',
      'outside-edge',
    ],
    order: 130,
  }),

  delivery({
    slug: 'carrom-ball',
    title: 'Carrom Ball',
    category: 'spin-bowling',
    difficulty: 'advanced',
    summary:
      'A ball flicked out by squeezing it between thumb and a bent middle finger, able to turn either way from one action.',
    explanation: `The carrom ball is released by **flicking** the ball out between the thumb and a bent middle finger, in the motion of striking a counter in the board game carrom, which is where the name comes from.

Its distinctive property is that depending on how the finger is applied, the same action can produce turn in **either direction**, which gives a finger spinner something close to a wrist spinner's optionality without the wrist rotation.

It is a specialist delivery. A small number of bowlers have built careers around it and most finger spinners never bowl one.`,
    gripAndRelease: `Described as convention: the ball is held between the thumb and a middle finger bent behind it, and flicked forward as the arm comes over, the finger snapping to impart the spin.

Bowlers who use it describe long periods of practice to control it, and it is unusual in requiring a genuinely different release mechanism rather than a modification of an existing one.`,
    batterExpects: `A finger spinner's stock ball, and therefore turn in one predictable direction.`,
    actuallyHappens: `The ball may turn either way, and often with a lower, skiddier trajectory than a conventional finger-spun delivery because of the different spin axis.`,
    whyEffective: `It attacks the batter's fundamental assumption about a finger spinner, which is that the ball turns one way. Removing that certainty is worth a great deal even when the turn itself is modest.

It also arrives with a different trajectory, so it is deceptive in the air as well as off the pitch.`,
    whenYouWillSeeIt: `Uncommonly, and mostly in white-ball cricket from the specific bowlers who bowl it. It is a signature delivery rather than a standard part of the finger spinner's repertoire.`,
    counteredBy: `- **Watching the hand** at release, where the bent finger is sometimes visible.
- **Playing the ball off the pitch** rather than predicting direction.
- **Playing straight**, so that turn either way is still met with the full face.`,
    misunderstandings: `**"Every finger spinner can bowl one."** Very few do.

**"It is illegal."** The flicking release does not involve straightening the elbow, and it is a legal delivery.

**"It is the same as a doosra."** Different mechanism entirely: the doosra is a wrist and finger action producing reverse turn, the carrom ball a flick.`,
    takeaways: `- Flicked out between thumb and bent middle finger.
- Can turn either way from the same action.
- Legal, difficult, and genuinely rare.`,
    related: ['finger-spin', 'doosra', 'off-break', 'variation', 'bowling-action'],
    order: 140,
  }),

  delivery({
    slug: 'doosra',
    title: 'Doosra',
    category: 'spin-bowling',
    difficulty: 'advanced',
    summary:
      'A finger spinner’s ball that turns the other way, and the delivery most closely associated with bowling-action scrutiny.',
    explanation: `A doosra is a finger spinner's delivery that turns in the **opposite** direction to their stock ball: for a right-arm off spinner, it turns away from a right-handed batter instead of in to them.

The name comes from the Urdu and Hindi for "the second one" or "the other one".

It is the finger spinner's answer to the googly, and the comparison is instructive: a wrist spinner's googly requires a wrist rotation they already use, while a finger spinner has to generate reverse spin with an action built to spin the other way. That is why the doosra is much harder, much rarer, and legally fraught in a way the googly is not.`,
    gripAndRelease: `Described in general terms, deliberately.

The bowler releases the ball with the wrist and hand turned so that the spin axis reverses, typically with the back of the hand facing the batter more than for an off break, imparting spin with the third finger.

The reason this entry does not give a detailed technical prescription is that the delivery sits close to the limit of what a finger-spinning action can produce legally. Bowlers have found different solutions, several have been reported and remodelled, and a step-by-step instruction would imply a settled, safe technique that does not exist.`,
    batterExpects: `An off break, turning in to a right-hander.`,
    actuallyHappens: `The ball turns away instead. A right-hander playing to cover turn into them is beaten on the outside, and the edge carries to the keeper or slip.`,
    whyEffective: `It removes the single most useful piece of information a batter has against a finger spinner, which is the direction of turn. It is particularly valuable against **left-handers**, whom an off spinner otherwise turns the ball away from and struggles to threaten with the stumps.`,
    whenYouWillSeeIt: `Rarely, and from a small number of bowlers. Considerably more common in white-ball cricket, and more common in the subcontinent, where several of its best exponents have played.`,
    counteredBy: `- **Watching the hand and wrist** at release; the doosra is generally considered more readable than a googly.
- **Playing the ball off the pitch** rather than predicting the turn.
- **Playing straight and late**, so either direction of turn is survivable.`,
    misunderstandings: `**"A doosra is a googly."** A googly is a wrist spinner's delivery. A doosra is a finger spinner's. Different disciplines, different mechanics.

**"The doosra is illegal."** The **delivery** is not illegal. What is regulated is elbow extension: any delivery, doosra included, is legal if the elbow does not straighten beyond the permitted tolerance during the delivery swing, and illegal if it does. Several prominent doosra bowlers have been reported and have remodelled their actions, and that history is why the delivery is discussed alongside action legality.

**"Every off spinner should learn one."** Most do not, and coaches frequently advise against it precisely because of the action risk.`,
    takeaways: `- A finger spinner's reverse-turning ball; the name means "the other one".
- Much harder than a wrist spinner's googly because the action fights it.
- Legal if the elbow stays within the permitted tolerance; several exponents have been reported.
- Especially valuable against left-handers.`,
    related: [
      'off-spin',
      'finger-spin',
      'googly',
      'arm-ball',
      'carrom-ball',
      'bowling-action',
      'off-break',
    ],
    sourceKeys: [
      { ...MCC, locator: 'Law 21 (No ball: fair delivery)' },
      { key: 'icc-playing-conditions', locator: 'Suspect action testing' },
    ],
    order: 150,
    ruleSensitive: true,
    sourceRevision: `${MCC_CODE}; action-testing regulations from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
  }),
];
