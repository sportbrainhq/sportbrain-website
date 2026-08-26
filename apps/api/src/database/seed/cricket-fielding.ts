import { concept, definition } from './cricket-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';

/**
 * Fielding and wicketkeeping.
 *
 * The part of cricket that decides matches and leaves the least trace in the
 * scorecard. A dropped catch appears nowhere; a run-out is credited to fielders
 * who get no bowling figures for it. These entries are written to make that
 * visible, because a reader watching the ball and the bat will otherwise miss
 * most of what the fielding side is actually doing.
 *
 * Technique here is coaching convention, as it is throughout the batting and
 * bowling files, and is described as such.
 */

const MCC = { key: 'mcc-laws' } as const;

export const CRICKET_FIELDING: ExplainerSeed[] = [
  concept({
    slug: 'ground-fielding',
    title: 'Ground Fielding',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'beginner',
    summary:
      'Stopping, gathering and returning the ball along the ground, which is most of what fielders actually do.',
    explanation: `Ground fielding is the unglamorous majority of fielding: intercepting a ball travelling along the turf, picking it up cleanly, and returning it accurately.

Its value is measured in runs that were not scored. A fielder who cuts off a ball two metres from the boundary saves three runs; one who is a fraction slow concedes four. Repeated over an innings, that difference is larger than most individual batting contributions.

It also generates pressure. Batters who see the ball being cut off stop looking for the second run, which reduces the scoring rate without a single wicket falling.`,
    howItWorks: `Conventional coaching breaks it into three parts.

**The approach.** Moving towards the ball rather than waiting for it, so the pick-up happens while the fielder is already moving towards the target.

**The gather.** Getting low, with the hands in front of the body and the eyes on the ball. The long barrier, where the fielder puts one knee down behind the hands, is the safe method for a hard ball on uneven ground; the one-handed pick-up on the run is faster and less certain.

**The return.** A flat, accurate throw to the keeper's or bowler's end, ideally arriving at stump height so it can be taken and used.

The trade between the safe and fast methods is a live decision on every ball: taking the certain option concedes the extra run, taking the fast one risks a misfield and four.`,
    whyItMatters: `In limited-overs cricket the cumulative effect is very large. Sides quantify the runs their fielding saves and concedes, and the gap between the best and worst fielding sides over an innings is routinely worth more than a wicket.

It is also the part of cricket where effort is most visible to teammates, which is why captains talk about fielding standards as a proxy for the side's state of mind.`,
    misunderstandings: `**"Ground fielding is just athleticism."** Anticipation and positioning save more runs than speed. Good fielders are moving before the shot is played.

**"Saved runs do not matter as much as wickets."** Over fifty overs, the runs saved by a good fielding side are frequently decisive.`,
    takeaways: `- Intercept, gather, return: the bulk of all fielding.
- Value is measured in runs prevented and pressure created.
- The safe method concedes a run; the fast one risks four.`,
    related: [
      'catching',
      'diving-stop',
      'boundary-fielding',
      'direct-hit',
      'run-out-technique',
      'fielder',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 28 (The fielder)' }],
    order: 10,
  }),

  concept({
    slug: 'catching',
    title: 'Catching',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'beginner',
    summary:
      'Taking the ball cleanly off the bat before it touches the ground, which produces more dismissals than everything else combined.',
    explanation: `Catching converts a batter's error into a wicket. Since caught accounts for more than half of all dismissals, catching is the single most consequential fielding skill in cricket.

Different catches are genuinely different skills, and sides select specialists accordingly:

- **Close catching**, in the slips and at short leg, where reaction time is minimal.
- **The high catch**, in the ring or on the boundary, where the ball drops steeply and the fielder has time to think, which is its own difficulty.
- **The flat catch**, hit hard and travelling fast at the ring fielders.
- **Boundary catches**, which add the complication of the rope and the Laws governing a fielder in contact with the ball.`,
    howItWorks: `Under **Law 33**, a catch is complete when the fielder has **complete control over the ball and over their own movement**. That definition, rather than simply holding the ball, is what resolves the difficult cases: a fielder who catches it and then falls over the boundary has not completed the catch.

Conventional technique differs by catch type. Close catchers are taught to watch the edge of the bat and keep the hands soft and low; high catchers to get underneath the ball and take it with fingers up or in the cup of the hands, depending on the school; boundary fielders to judge the rope before the ball.

What is common to all of them is that the catch is usually decided before the ball arrives, by positioning and by watching the batter rather than the ball's flight.`,
    whyItMatters: `Dropped catches are the most costly errors in cricket, and uniquely invisible: nothing on the scorecard records that a batter who made 120 was dropped on 8.

Sides therefore treat catching as a measurable discipline, tracking chances created against chances taken, because a bowling attack's real return depends on it.`,
    misunderstandings: `**"A catch is complete when you hold the ball."** Control of the ball **and** of your own movement is required.

**"Boundary catches are just athleticism."** They are governed by precise Laws about where the fielder last touched the ground.

**"Close catching is the hardest."** It is the fastest. The steeply falling high catch, with time to think, has its own well-known difficulty.`,
    takeaways: `- Converts more than half of all dismissals.
- Complete control of ball and movement is the legal test.
- Close, high, flat and boundary catches are distinct skills.
- Drops are the most expensive invisible errors in the game.`,
    related: [
      'caught',
      'slip-catching',
      'high-catch',
      'close-catching',
      'boundary-fielding',
      'dolly',
      'boundary-rules',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 19, 33' }],
    order: 20,
  }),

  concept({
    slug: 'high-catch',
    title: 'High Catch',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'A steeply falling catch, where the difficulty is judgement and nerve rather than reaction speed.',
    explanation: `A high catch comes from a ball hit steeply upwards: a top-edged pull, a mistimed slog, a skier off a slower ball.

What makes it hard is the opposite of what makes slip catching hard. There is plenty of time, which means time to move, time to misjudge, and time to think about dropping it. Fielders consistently describe the high catch as the one where nerve matters most.

The ball also behaves awkwardly. It comes down faster than it went up in perceived terms, it can drift in the wind, and against a floodlit or bright sky it can be genuinely difficult to see.`,
    howItWorks: `Conventional technique, with schools of thought that genuinely differ:

**Getting underneath it and slightly back**, so the fielder is moving forwards onto the ball rather than backpedalling at the moment of the catch.

**Hand position** is where the schools diverge: the reverse cup with fingers up, and the cupped hands at chest height, are both taught, and international fielders use both.

**Calling.** With several fielders converging, one has to call and the others must give way. Collisions on high catches are a real injury risk and the calling convention exists for that reason.

**Watching the ball, not the fielders**, which is easier said than done under a floodlit sky.`,
    whyItMatters: `In T20 cricket the high catch is close to the standard dismissal. Batters hitting for six mistime into the air, so the boundary and deep-ring catchers take a large share of all wickets, and a side that catches well in the deep is materially better at defending a total.`,
    misunderstandings: `**"Time makes it easier."** Time introduces movement, misjudgement and nerves.

**"There is a correct hand position."** Two methods are widely taught and both are used at the highest level.`,
    takeaways: `- Steeply falling catches, where judgement and nerve dominate.
- Get underneath and slightly back, moving forwards at the catch.
- Calling prevents collisions, which are a genuine risk.
- The characteristic T20 dismissal.`,
    related: [
      'catching',
      'boundary-fielding',
      'pull-shot',
      'slog-sweep',
      'dolly',
      'deep-midwicket',
    ],
    order: 30,
  }),

  concept({
    slug: 'slip-catching',
    title: 'Slip Catching',
    category: 'fielding-and-wicketkeeping',
    alsoIn: ['field-positions'],
    difficulty: 'intermediate',
    summary:
      'Catching the edge at close range behind the wicket, where the reaction time is the shortest in the game.',
    explanation: `Slip catching is taking the outside edge, standing a few metres behind and beside the batter on the off side.

The reaction time is the shortest of any catch in cricket. The ball leaves the bat at close range, often deflected rather than struck, and arrives in a fraction of a second at an unpredictable angle. Slip catchers therefore rely on preparation rather than reaction.`,
    howItWorks: `Conventional technique, and there is more agreement here than for high catches.

**Watch the edge of the bat, not the ball.** A slip catcher who watches the ball in flight from the bowler's hand loses the first fraction of a second re-focusing. Most watch the bat's edge and pick the ball up as it deviates.

**Stay low and still.** A crouch that can be held for an over, with the hands low, since more chances come below the waist than above it.

**Soft hands and give.** The ball arrives fast; hands that resist it pop it out.

**Take it in front of the body** where possible, so a spilled chance can be re-taken.

**Depth by pace.** Deeper to a fast bowler, closer to a spinner. Getting the depth wrong is the commonest reason a chance falls short or bursts through.`,
    whyItMatters: `A settled, reliable cordon is what converts good bowling into wickets. A bowler beating the bat regularly gets nothing if the edges are not held, and the psychological effect of a dropped slip catch on a bowling attack is well documented in players' accounts.

It is also a specialism that teams protect: slip catchers usually stay there for the whole innings rather than rotating, precisely because the position rewards rhythm.`,
    misunderstandings: `**"Slip fielders watch the ball."** Most watch the bat's edge.

**"Anyone can field at slip."** It is among the most specialised positions on the field.

**"Slip catches are mostly at chest height."** More arrive low, which is why the crouch matters.`,
    takeaways: `- Shortest reaction time of any catch.
- Watch the edge of the bat, stay low, keep the hands soft.
- Depth is set by the bowler's pace.
- A specialist position held for whole innings.`,
    related: [
      'slip',
      'first-slip',
      'gully',
      'catching',
      'caught',
      'outside-edge',
      'close-catching',
    ],
    order: 40,
  }),

  concept({
    slug: 'close-catching',
    title: 'Close Catching',
    category: 'fielding-and-wicketkeeping',
    alsoIn: ['field-positions'],
    difficulty: 'intermediate',
    summary:
      'Catching within a few metres of the bat, in the positions where a ball off bat or pad has nowhere else to go.',
    explanation: `Close catching covers the positions inside the batter's immediate reach: **short leg**, **silly point**, **silly mid-off** and **silly mid-on**, along with **leg slip** and **leg gully**.

These are set almost entirely to spin, for one specific chance: the ball that comes off the bat or the pad without control, pops up, and has to be caught before it lands. The **bat-pad** catch is the archetype.

They are also a pressure tactic. A fielder crouching three metres away changes what a batter feels able to do, and captains set them partly for that.`,
    howItWorks: `Conventional practice:

**A helmet, always.** These positions are the reason helmets are worn by fielders at all, and it is not optional at any serious level.

**Crouch low with the hands ready and still.** The chances come fast and usually below waist height.

**Watch the bat and the pad**, since the deflection's direction is decided there.

**Get up and out of the way when a full shot is coming.** Close catchers routinely turn away from a batter who is committing to a drive or a sweep, which is self-preservation rather than poor technique.

Under **Law 28** a fielder may not encroach on the pitch, which constrains how close some of these positions can actually be placed.`,
    whyItMatters: `On a turning pitch, close catchers convert a spinner's good ball into a wicket. Without them, the same delivery is a defensive push that goes nowhere.

There is also a real cost: a fielder at short leg is not saving runs, so a captain setting two close catchers has committed two fielders to a single kind of chance.`,
    misunderstandings: `**"Close catchers are set to intimidate."** The pressure effect is real, but the primary purpose is the bat-pad chance.

**"They are placed as close as the fielder dares."** Law 28 prohibits encroaching on the pitch, so there is a limit.`,
    takeaways: `- Short leg, silly point and the silly mid positions, plus leg slip and leg gully.
- Set mainly to spin, for the bat-pad chance.
- Helmets are mandatory in practice.
- Costs two fielders' run-saving to buy one kind of chance.`,
    related: [
      'short-leg',
      'silly-point',
      'leg-slip',
      'catching',
      'helmet',
      'off-spin',
      'fielding-restrictions',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 28 (The fielder)' }],
    order: 50,
  }),

  concept({
    slug: 'boundary-fielding',
    title: 'Boundary Fielding',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'Fielding on the rope, where the job is turning fours into ones and sixes into catches.',
    explanation: `A boundary fielder's job is arithmetic: stop the four, and take the catch that would otherwise be a six.

It has become one of cricket's most visible skills because of T20, where the difference between a boundary saved and conceded, repeated fifteen times an innings, decides matches. The spectacular relay catches and one-handed saves that dominate highlight reels are all boundary fielding.

The Laws make it intricate. Under **Law 19**, a fielder in contact with the ball must not be grounded beyond the boundary, and for an airborne fielder, their **first contact with the ball** must come when their **last contact with the ground** was inside the boundary.`,
    howItWorks: `The recurring situations:

**Sliding stops.** Approaching at pace, sliding, and flicking the ball back inside before crossing the rope.

**The parry and re-catch.** An airborne fielder palming the ball up while over the boundary, landing outside, and returning inside to complete the catch.

**The relay.** One fielder palming the ball back inside to a teammate before crossing the rope. Legal, and one of the most-practised routines in modern fielding.

**Judging the rope.** Knowing exactly where it is without looking, since a glance costs the catch.

**The throw.** Long, flat and accurate, since a boundary fielder's return decides whether the batters take two or three.`,
    whyItMatters: `Sides quantify this directly. Over a T20 innings the runs saved and boundaries prevented by good boundary fielding are comparable in value to a wicket or two, and sides select fielders for specific boundary positions accordingly.`,
    misunderstandings: `**"Touching the rope means it is four."** What matters is whether the fielder is grounded beyond the boundary while in contact with the ball.

**"You cannot catch it if you go over the rope."** You can, if your last contact with the ground before first touching the ball was inside, and the airborne rules allow relays and re-entries.`,
    takeaways: `- Turns fours into ones and sixes into catches.
- Governed by precise Law 19 provisions about grounding and airborne contact.
- Sliding stops, parries, relays and long throws are the core routines.
- Measurably worth a wicket or more over a T20 innings.`,
    related: [
      'boundary-rules',
      'relay-throw',
      'catching',
      'high-catch',
      'six',
      'third-man',
      'deep-midwicket',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 19, 33' }],
    order: 60,
  }),

  definition({
    slug: 'relay-throw',
    title: 'Relay Throw',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'Two fielders combining on a boundary catch or a long return, one passing the ball to the other.',
    explanation: `A relay is any fielding action where the ball passes between two fielders to complete a play. Two forms matter.

**The boundary relay catch.** A fielder about to cross the rope palms or throws the ball back inside the playing area, and a teammate completes the catch. This is legal under Law 19 and Law 33 provided each fielder's contact with the ball complies with the grounding requirements, and it is the reason two fielders now converge on almost every deep catch in T20 cricket.

**The relay throw.** A fielder retrieving the ball deep in the outfield throws it to a closer teammate, who relays it to the stumps. Two accurate throws over shorter distances are often faster and more reliable than one long one, particularly from a fielder who has just chased the ball to the rope.`,
    whyItMatters: `The boundary relay changed what is catchable. A ball that would once have been six because the fielder's momentum carried them over the rope is now regularly a wicket, and sides rehearse the routine deliberately, with a second fielder moving into support position as a matter of course.`,
    misunderstandings: `**"A relay catch is a loophole."** It is explicitly permitted by the Laws' provisions on airborne fielders.

**"A relay throw is slower."** Two shorter accurate throws frequently beat one long throw from a fielder off balance.`,
    related: [
      'boundary-fielding',
      'boundary-rules',
      'catching',
      'ground-fielding',
      'backing-up-fielding',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 19, 33' }],
    order: 70,
  }),

  definition({
    slug: 'direct-hit',
    title: 'Direct Hit',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'A throw from a fielder that hits the stumps directly, without a fielder gathering it first.',
    explanation: `A direct hit is a throw that strikes the wicket and puts it down without anybody catching and applying it.

It is the highest-value fielding act available, because it removes the extra step where a run-out can be lost. A throw to the keeper requires the keeper to gather cleanly and break the wicket; a direct hit needs neither.

It is also rare relative to the number of attempts, which is why a direct hit at a crucial moment is treated as a genuine turning point.`,
    whyItMatters: `Two contexts make it decisive. In **limited-overs cricket** at the death, batters take extraordinary risks for singles, and a direct hit from a ring fielder ends an innings' momentum instantly. In **any format**, a direct hit at the non-striker's end while a batter is stranded mid-pitch produces a wicket from nothing.

The threat also has value even when it misses: batters who know a fielder throws accurately stop attempting the second run.`,
    misunderstandings: `**"A direct hit is luck."** Fielders practise throwing at a single stump deliberately, and the difference between fielders in accuracy is measurable.

**"A missed direct hit costs nothing."** A throw that misses and goes to the boundary concedes overthrows, which is the standard argument for throwing to the keeper instead.`,
    related: [
      'run-out',
      'run-out-technique',
      'ground-fielding',
      'backing-up-fielding',
      'boundary-rules',
    ],
    order: 80,
  }),

  concept({
    slug: 'run-out-technique',
    title: 'Run-out Technique',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary: 'How a fielding side actually executes a run out, and where the time is usually lost.',
    explanation: `A run out has three components, and a side loses more of them to poor execution than to a lack of speed.

**Gather.** Picking the ball up cleanly, ideally while already moving towards the target.

**Deliver.** Either a direct hit at the stumps, or a throw to the end where a teammate can apply it. The throw should arrive at **stump height** so it can be taken and used in one motion.

**Apply.** Breaking the wicket with the ball in hand, or with the hand holding the ball, before the batter grounds bat or body behind the crease.`,
    howItWorks: `Conventional practice, and the decision points that matter:

**Which end?** The batter who has furthest to travel is the one to attack, which is not always the one nearest the ball.

**Direct hit or throw?** A direct hit removes a step but risks overthrows if it misses; a throw to a teammate is safer and slower. Fielders close in generally throw; fielders deep generally throw to the keeper's end.

**Underarm at close range.** From within a few metres, an underarm flick or simply running the ball into the stumps is more reliable than a throw.

**The receiver's job.** Standing beside the stumps rather than behind them, taking the ball with hands in front, and breaking the wicket in the same movement rather than gathering and then turning.

Under the Laws, the wicket must be **fairly put down**: with the ball, or with the hand or arm holding the ball.`,
    whyItMatters: `Run outs are wickets that cost the bowling side nothing, and in limited-overs cricket they are among the cheapest available. They also arrive at the highest-pressure moments, since that is when batters take the risks that create them.`,
    misunderstandings: `**"Throw as hard as possible."** A flat throw at stump height that can be taken cleanly beats a fast one the receiver has to jump for.

**"Attack the nearest end."** Attack the end where the batter has further to run.

**"Any contact with the stumps is enough."** A bail must be completely dislodged or a stump struck out of the ground, and the ball or the hand holding it must do it.`,
    takeaways: `- Gather, deliver, apply, and time is usually lost in the delivery.
- Attack the end the batter has further to reach.
- Throws should arrive at stump height.
- The wicket must be fairly put down with the ball or the hand holding it.`,
    related: [
      'run-out',
      'direct-hit',
      'batters-ground',
      'ground-fielding',
      'backing-up-fielding',
      'wicketkeeping',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 29, 38 (Wicket down; Run out)' }],
    order: 90,
  }),

  definition({
    slug: 'backing-up-fielding',
    title: 'Backup',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    aliases: ['Backing Up'],
    summary:
      'A fielder positioning behind the stumps or behind a teammate to collect a throw that misses.',
    explanation: `Backing up is the discipline of having somebody behind the target. When a fielder throws at the stumps, a teammate stands behind them to collect the ball if the throw misses.

The reason is **overthrows**. A throw that misses the stumps and nobody collects runs away, and the batting side takes the runs already completed plus whatever the ball reaches, which can be four. Overthrows are among the most demoralising runs a fielding side concedes, because they are entirely self-inflicted.

The term also refers to a **batter** backing up, which is the non-striker advancing down the pitch as the ball is bowled. Same phrase, different act.`,
    whyItMatters: `It is invisible when it works and glaring when it does not. A side that backs up consistently concedes almost no overthrows; one that does not gives away several runs an innings for nothing, and occasionally a boundary at a critical moment.

Bowlers are conventionally expected to back up at the bowler's end after delivering, and the keeper's opposite number backs up at the far end, which is why fielders can be seen sprinting to positions where no shot has gone.`,
    misunderstandings: `**"Backing up is optional if the throw is accurate."** The whole point is that some throws are not.

**"Backing up means the same for a batter and a fielder."** For a batter it means advancing from the non-striker's end before release; for a fielder it means covering behind a target.`,
    related: [
      'run-out-technique',
      'direct-hit',
      'ground-fielding',
      'non-striker',
      'boundary-rules',
    ],
    order: 100,
  }),

  concept({
    slug: 'wicketkeeping',
    title: 'Wicketkeeping',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'beginner',
    summary:
      'The specialist discipline behind the stumps: taking every ball, effecting stumpings, and being involved in more dismissals than anyone.',
    explanation: `Wicketkeeping is the most continuously demanding job on a cricket field. The keeper is involved in every delivery of an innings, and unlike any fielder they cannot switch off for a single ball.

They take the ball the batter misses, catch the edge, complete stumpings, receive the throws that produce run outs, and act as the fielding side's most constant source of information about the pitch and the bowler.

They are also the only fielder permitted **external leg guards and gloves** under the Laws, which is what makes the job physically possible.`,
    howItWorks: `The two fundamental positions:

**Standing back**, several metres behind the stumps, to pace bowling. The ball is taken after it has begun to drop, and the keeper's job is to hold the edge and cover the wide ball.

**Standing up** to the stumps, to spin and slow-medium bowling. The harder discipline: the keeper is inside the range of turn and bounce, must take the ball cleanly at close range, and must be able to complete a stumping the instant a batter's foot leaves the ground.

Under **Law 27**, the keeper must remain wholly behind the wicket until the ball reaches the striker or the striker attempts a run; moving in front early is a no-ball. They must also take the ball with the gloves rather than, for instance, using the pads to trap it.

Beyond technique, the keeper does two tactical jobs: **communicating** with the bowlers about what the pitch is doing, since they see every ball's carry and deviation, and **directing** the fielders behind square, since they have the clearest view of the batter's movements.`,
    whyItMatters: `A keeper's errors cost wickets that nothing records. A missed stumping, a dropped edge or a fumbled run-out chance is a dismissal the bowling side earned and did not receive.

Standing up to spin also has a direct tactical effect on the batter: knowing that leaving the crease means being stumped constrains what a batter can do against turn, and a keeper who cannot stand up removes that constraint entirely.`,
    formatDifferences: `In Tests, a keeper may keep for a hundred-plus overs in a single innings, standing back to pace and up to spin, and technical quality dominates. In T20, twenty overs of keeping is comparatively undemanding and batting ability weighs more heavily in selection.`,
    misunderstandings: `**"The keeper is a fielder with gloves."** They are the only player permitted gloves and pads, and the role is a distinct specialism.

**"Standing back is the harder job."** Standing up to spin is generally regarded as the more technical discipline.

**"Keepers only matter for catches."** They direct the field, inform the bowlers, and constrain the batter's use of the crease.`,
    takeaways: `- Involved in every delivery, and in more dismissals than any other player.
- Standing back to pace, standing up to spin, the latter harder.
- Law 27 requires them to stay wholly behind the wicket until the ball reaches the striker.
- Their errors cost wickets that appear nowhere in the record.`,
    related: [
      'wicketkeeper',
      'standing-up',
      'standing-back',
      'stumping',
      'collecting',
      'wicketkeeper-footwork',
      'wicketkeeper-batter',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 27 (The wicket-keeper)' }],
    order: 110,
  }),

  concept({
    slug: 'standing-up',
    title: 'Standing Up',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'Keeping wicket immediately behind the stumps, to spin and slow bowling. The harder of the two keeping positions.',
    explanation: `Standing up means taking position directly behind the stumps, close enough to complete a stumping the moment the batter's foot leaves the ground.

It is used for **spin** and **slow-medium** bowling, where the ball arrives slowly enough to be taken cleanly at close range.

It is generally regarded as the more technically difficult keeping position, and the reasons are specific: the keeper is inside the range of the ball's turn and bounce, has minimal reaction time, cannot see the ball for part of its flight because the batter's body and bat obstruct it, and must take it cleanly enough to whip the gloves onto the stumps immediately afterwards.`,
    howItWorks: `Conventional practice:

**Crouch and rise with the ball.** The keeper comes up as the ball arrives rather than staying static.

**Watch the ball into the gloves**, including through the batter's shot, which requires moving the head to see round the bat.

**Take the ball with the hands moving back**, absorbing rather than snatching.

**Be ready for the stumping** as a single continuous movement, not as a second action after the take.

**Law 27** matters here more than anywhere: the keeper must stay wholly behind the wicket until the ball reaches the striker, and creeping forward to shorten the take is a no-ball.`,
    whyItMatters: `The tactical effect is as important as the catching. A keeper standing up **compresses the batter's crease**: advancing down the pitch or batting outside the crease becomes dangerous, because a missed ball is a stumping.

That means a keeper who can stand up competently to a spinner materially reduces what a batter can do, and a keeper who cannot removes one of the spinner's main sources of pressure.`,
    misunderstandings: `**"Standing up is safer than standing back."** It is technically harder and involves less reaction time.

**"You only stand up to spin."** Also to slow-medium bowling, and occasionally to a pace bowler as a deliberate tactic to keep a batter in their crease.`,
    takeaways: `- Directly behind the stumps, for spin and slow bowling.
- Technically the harder keeping position: less time, obstructed sight.
- Compresses the batter's crease, which is its main tactical value.
- Law 27 forbids encroaching in front of the wicket.`,
    related: [
      'wicketkeeping',
      'standing-back',
      'stumped',
      'stumping',
      'batting-outside-the-crease',
      'spin-bowling',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 27 (The wicket-keeper)' }],
    order: 120,
  }),

  concept({
    slug: 'standing-back',
    title: 'Standing Back',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'Keeping wicket several metres behind the stumps, to pace bowling, taking the ball after it has begun to drop.',
    explanation: `Standing back means positioning several metres behind the stumps, the distance depending on the bowler's pace and the pitch's bounce.

It is used for **pace bowling**, and the reason is simple: a ball at 140 km/h cannot reliably be taken at the stumps, and the keeper needs the extra distance for the ball to slow and begin dropping into a catchable position.

The keeper's primary job here is the **outside edge**, which arrives fast and often at an unexpected angle, along with the wide ball down either side and the throws from the outfield.`,
    howItWorks: `Conventional practice:

**Depth set by pace and bounce.** Too close and the ball arrives before it has begun to drop; too deep and edges fall short. Keepers adjust between bowlers and as the pitch changes.

**Move with the ball's line**, taking it in front of the body wherever possible rather than reaching.

**Anticipate the edge's angle**, which is why keepers watch the bat as well as the ball.

**Handle the throws.** A keeper standing back is also the primary receiver for run-out throws from the ring and the boundary.`,
    whyItMatters: `The keeper standing back is the fielding side's last line: anything past the bat and past them runs away for byes, and a dropped edge is a wicket lost.

Depth judgement is a genuine skill and a visible one. A keeper taking edges comfortably has read the pace and bounce correctly; one diving forward repeatedly has not.`,
    misunderstandings: `**"Standing back is easier."** It is different: more reaction time, but the ball arrives much faster and edges deviate unpredictably.

**"The distance is fixed."** It changes by bowler, by pitch and through an innings.`,
    takeaways: `- Several metres back, for pace bowling, taking the ball as it drops.
- Depth is judged by pace and bounce and adjusted constantly.
- Primary jobs are the outside edge and receiving throws.`,
    related: ['wicketkeeping', 'standing-up', 'caught', 'outside-edge', 'bye', 'fast-bowling'],
    order: 130,
  }),

  definition({
    slug: 'collecting',
    title: 'Collecting',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'The wicketkeeper’s act of taking the ball cleanly, which is judged more harshly than any other routine skill.',
    explanation: `Collecting, or "taking", is the keeper gathering the ball cleanly into the gloves: from the bowler, off an edge, or from a fielder's throw.

It sounds routine and is the foundation of everything else the keeper does. A ball collected cleanly can be turned into a stumping or a run out immediately; a ball fumbled cannot, and the moment is gone.

Conventional technique emphasises **soft hands moving back with the ball**, taking it in front of the body, and watching it all the way in. Snatching at the ball or letting it hit static hands is what produces the fumble.`,
    whyItMatters: `Cricket judges keepers on this more than on anything else. A keeper who takes everything cleanly for a hundred overs is barely noticed; one who fumbles twice is described as having had a poor day.

The tactical consequence is real, though: a fumble concedes byes, and a fumble on a stumping or run-out chance loses a wicket the side had earned.`,
    misunderstandings: `**"Collecting is just catching."** It includes the continuation into a stumping or run out, which is why the take's position matters as much as its cleanliness.

**"Byes are the keeper's fault."** Sometimes. A ball turning sharply or bouncing unpredictably beats good keepers, which is why byes are charged to nobody.`,
    related: [
      'wicketkeeping',
      'standing-up',
      'standing-back',
      'stumping',
      'bye',
      'wicketkeeper-footwork',
    ],
    order: 140,
  }),

  concept({
    slug: 'stumping',
    title: 'Stumping',
    category: 'fielding-and-wicketkeeping',
    alsoIn: ['dismissals'],
    difficulty: 'intermediate',
    summary:
      'The wicketkeeper’s own dismissal: breaking the wicket while the batter is out of their ground and not running.',
    explanation: `A stumping is the act of putting the wicket down with the ball while the batter is out of their ground and **not attempting a run**, which dismisses them **stumped** under Law 39.

It is the keeper's signature dismissal and the reason standing up to the stumps matters. A batter who advances down the pitch to a spinner and misses has nowhere to go: they cannot get back before a competent keeper has the ball on the stumps.

The keeper must do it themselves and the ball must not have touched another fielder first, or it becomes a run out instead.`,
    howItWorks: `Conventional practice, and the whole thing is one movement rather than two:

**Take the ball**, hands moving back and soft.

**Bring the gloves to the stumps** in a continuous motion, rather than gathering and then reaching.

**Break the wicket with the ball in the gloves** — a bail completely dislodged or a stump out of the ground.

The keeper is also watching the batter's feet as well as the ball, since knowing whether the batter is out of their ground determines whether to attempt the stumping at all or simply to take the ball safely.

Where the technology exists, close stumpings are reviewed by the third umpire, and the review looks for whether any part of the batter or bat in hand was grounded behind the popping crease at the moment the wicket was broken.`,
    whyItMatters: `Stumpings are relatively rare, around one in fifty Test dismissals, but their **deterrent** value is much larger than that number. A batter facing a keeper standing up cannot use the crease freely, and that constraint is worth more to a spinner than the stumpings themselves.`,
    misunderstandings: `**"Stumped and run out are the same."** The difference is whether a run was being attempted, and it determines whether the bowler is credited with a wicket.

**"The keeper can use any part of the glove."** The wicket must be put down with the ball, or with the hand or glove holding the ball.

**"You cannot be stumped off a wide."** You can. Not off a no-ball.`,
    takeaways: `- Law 39: batter out of their ground, not running, keeper breaks the wicket.
- Must be the keeper, unaided, or it is a run out.
- One continuous movement from take to stumps.
- Its deterrent effect exceeds its frequency.`,
    related: [
      'stumped',
      'standing-up',
      'wicketkeeping',
      'batters-ground',
      'stumping-review',
      'playing-against-spin',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 39 (Stumped)' }],
    order: 150,
  }),

  concept({
    slug: 'wicketkeeper-footwork',
    title: 'Wicketkeeper Footwork',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'advanced',
    summary:
      'How a keeper moves to get their body behind the ball, which determines everything else they can do.',
    explanation: `Keeping is a footwork discipline more than a hands discipline. A keeper who arrives in position with the body behind the ball takes it comfortably; one who reaches with the hands does not.

The requirement changes with the position. **Standing up**, the movements are short, lateral and fast, often a single step and a rise. **Standing back**, they are longer and more athletic, covering ground to get in line with an edge or a wide delivery.`,
    howItWorks: `Conventional coaching:

**Get the head and body in line.** The hands should be a consequence of the feet, not a substitute for them.

**Stay low until the ball's height is known**, then rise with it. A keeper who stands up early cannot come back down for a low ball.

**Move laterally with small, quick steps** when standing up, rather than lunging.

**Do not commit early.** Against spin the ball's direction is not known until it pitches, so the keeper's first movement has to be late, which is the hardest part of the discipline.

**Balance through the take**, so the movement can continue into a stumping.`,
    whyItMatters: `Every other keeping skill depends on it. A stumping requires the keeper to be balanced enough to continue into the stumps; a catch off an edge requires them to have got in line; a clean take requires the body behind the hands.

It is also where keepers are separated at the highest level. Most international keepers have good hands; the differences are largely in movement and in how late they can afford to commit.`,
    misunderstandings: `**"Keeping is about safe hands."** Hands matter, and footwork decides whether they are in the right place.

**"Keepers should move as soon as the ball is bowled."** Against spin, committing early is the primary error.`,
    takeaways: `- Body and head in line, hands as a consequence of the feet.
- Stay low until the height is known, then rise.
- Short lateral steps standing up; ground-covering movement standing back.
- Committing too early is the characteristic fault against spin.`,
    related: ['wicketkeeping', 'standing-up', 'collecting', 'stumping', 'standing-back'],
    order: 160,
  }),

  definition({
    slug: 'diving-stop',
    title: 'Diving Stop',
    category: 'fielding-and-wicketkeeping',
    difficulty: 'intermediate',
    summary:
      'Diving to intercept a ball travelling past, trading the risk of a misfield for the runs it saves.',
    explanation: `A diving stop is a full-length dive to intercept a ball that would otherwise pass the fielder.

It is a deliberate trade. A dive that connects saves one to three runs and sometimes creates a run-out chance; a dive that misses concedes more than standing up would have, because the fielder is now on the ground and the ball is behind them.

Conventional technique is to dive **forwards and along the ground** rather than sideways where possible, with the hands together in front, and to get back to the feet and to the ball immediately if the stop is incomplete.`,
    whyItMatters: `In limited-overs cricket the accumulation of these interceptions is one of the measurable differences between fielding sides. It also has a compounding effect: batters who see the inner ring diving stop looking for the sharp single, which reduces the scoring rate without any wicket falling.

There is a genuine injury cost, particularly on hard grounds, and sides weigh it: shoulder and finger injuries from diving stops are common.`,
    misunderstandings: `**"Diving is always the right call."** A dive that misses concedes more than a fielder who stays on their feet and cuts the ball off two metres later.

**"It only saves one run."** It also creates run-out chances and deters the second run.`,
    related: ['ground-fielding', 'boundary-fielding', 'run-out-technique', 'direct-hit', 'fielder'],
    order: 170,
  }),
];
