import { battingTechnique, role, tactic } from './cricket-explainer-helpers';
import { MCC_CODE, REVIEWED } from './cricket-review-metadata';
import { fullFieldSetting } from './cricket-field-positions';
import type { ExplainerSeed } from './explainer-types';

/**
 * Batting: technique, shots, concepts and roles.
 *
 * Two rules govern this file.
 *
 * **Technique is coaching convention, not biomechanics.** Every description of a
 * grip, a stride or a bat path is one common way of teaching a shot, and elite
 * batters violate all of them profitably. Nothing here is presented as
 * medically or biomechanically established, because it is not, and a reader
 * copying a prescription from an encyclopaedia deserves to be told that.
 *
 * **Roles are descriptions, not positions.** "Finisher" and "anchor" are not
 * defined anywhere in the Laws and mean different things in different teams and
 * formats. Every role entry carries a section saying how much it varies, which
 * is the honest alternative to inventing a definition.
 *
 * Shot entries carry a field diagram showing the scoring area, because "played
 * through the covers" is meaningless to somebody who does not yet know where
 * cover is.
 */

export const CRICKET_BATTING: ExplainerSeed[] = [
  // ── Fundamentals ──────────────────────────────────────────────────────────
  battingTechnique({
    slug: 'batting-stance',
    title: 'Batting Stance',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'How a batter stands before the ball is bowled, and why almost every detail of it is negotiable.',
    explanation: `The stance is the position a batter takes up as the bowler runs in: feet, weight, hands, head and bat all arranged so that they can move in any direction once they see the ball.

The conventional teaching stance has the feet roughly shoulder-width apart either side of the popping crease, weight balanced, knees slightly flexed, the bat resting behind the back foot or tapping the ground, head still and both eyes level and facing the bowler.

The important thing to say immediately is that this is a **starting point for teaching**, not a requirement. International batters stand with open chests, closed chests, exaggeratedly high hands, bats held aloft, feet together and feet far apart. What they share is not a shape but a **function**.`,
    footwork: `What the stance has to deliver, whatever it looks like:

**Stillness at the moment of release.** A batter still moving as the ball is released is guessing. Many batters have a small preliminary movement, a trigger, but it is completed before release.

**Both eyes level and on the ball.** A head tilted or turned reduces depth perception, which is why coaches fuss about head position more than about feet.

**Freedom to move forward and back.** A stance that pre-commits weight in either direction removes one option.

**The bat able to swing straight.** The grip and the hands' position determine whether the natural swing path is down the line of the stumps or across it.`,
    risk: `The stance itself does not create risk; it creates or removes **options**. A batter whose stance is too closed struggles to play square on the off side; one whose weight is already forward is vulnerable to the short ball; one whose head falls away cannot play late.

Faults in a stance usually surface as a pattern of dismissals rather than as a single failure, which is why analysts look at where a batter gets out rather than at how they stand.`,
    whenYouWillSeeIt: `Every delivery. Watch for how a batter's stance changes by format and bowler: many take a more open stance to spin, stand further out of the crease, or move their guard across to a fast bowler.`,
    commonMistakes: `- Weight pre-committed forward or back before the ball is released.
- Head falling towards the off side, taking the hands with it.
- Bat and hands positioned so the natural swing comes down across the line.
- Still moving at the moment of release.`,
    takeaways: `- The stance exists to preserve options, not to look correct.
- Stillness at release and a level head are the near-universal requirements.
- Almost every other detail varies legitimately between players.`,
    related: ['batting-grip', 'backlift', 'footwork', 'balance', 'batting-outside-the-crease'],
    order: 10,
  }),

  battingTechnique({
    slug: 'batting-grip',
    title: 'Grip',
    category: 'batting',
    difficulty: 'beginner',
    summary: 'How the hands hold the bat, which sets the limits on which shots are available.',
    explanation: `The grip is where the hands sit on the handle and how they are rotated. It matters because it determines the bat's natural swing path and the range of shots a batter can play comfortably.

The conventional teaching grip has the hands together, roughly in the middle of the handle, with the "V" formed by thumb and forefinger of each hand aligned somewhere between the outside edge and the spine of the bat, and the top hand doing most of the controlling.

As with the stance, this is a teaching convention. Successful international batters use grips well outside it, and grip changes are a normal part of adapting to a format.`,
    footwork: `What different grips make easier and harder is more useful than a prescription.

**A more "open" grip**, with the hands rotated towards the leg side, tends to make it easier to play through the leg side and to hit across the line, and harder to play straight and drive through the off side.

**A more "closed" grip** tends to favour straight-bat shots down the ground and through the off side.

**Hands high on the handle** gives more leverage and power; **hands lower** gives more control and is common among batters who play late.

**Hands apart** is generally discouraged in coaching because it reduces the top hand's control, though some batters use a small gap deliberately.

A batter's grip is one of the first things a coach looks at when a batter cannot play a particular area, because a shot that is unavailable is often a grip problem rather than a decision problem.`,
    risk: `A grip that strongly favours one side of the wicket makes a batter predictable, and bowlers and captains will find it: a batter who cannot drive through the off side will be given the off side all day.`,
    whenYouWillSeeIt: `Grip changes are visible between formats. Many batters move their hands higher and rotate them for T20 to hit across the line more freely, and back again for red-ball cricket.`,
    commonMistakes: `- Hands too far apart, weakening top-hand control.
- Bottom hand dominating, which pushes the bat across the line.
- A grip that has drifted without the batter noticing, which shows up as a lost scoring area.`,
    takeaways: `- The grip sets which shots are naturally available.
- The conventional grip is a teaching baseline, not a rule.
- Grip is often the cause when a batter loses a scoring area.`,
    related: ['batting-stance', 'backlift', 'defensive-shot', 'cover-drive', 'slog-sweep'],
    order: 20,
  }),

  battingTechnique({
    slug: 'backlift',
    title: 'Backlift',
    category: 'batting',
    difficulty: 'intermediate',
    summary: 'How the bat is lifted before the shot, and where it comes down from.',
    explanation: `The backlift is the bat's movement upwards and backwards as the bowler releases, before the downswing.

Its purpose is timing and power: the bat must already be moving in order to arrive at the ball with momentum, and starting from a static position means the batter has to generate all the speed within the shot itself.

Backlifts differ enormously and legitimately. Some batters lift the bat straight back over the stumps; others take it towards second or third slip; a few lift it very high, which produces power at the cost of a longer path back down.`,
    footwork: `What matters is not the shape but two relationships.

**Where it comes down from, relative to where the ball is.** A backlift towards the slips has to be redirected to play straight, which is a source of the inside edge and the leading edge. A backlift over the stumps comes down naturally along the line.

**When it happens.** The backlift should be complete, or nearly so, as the ball is released, so the downswing is a single movement rather than a hurried correction. A late backlift is a common cause of being late on the ball against pace.

A high backlift is frequently misdiagnosed as a fault. Several of the highest-scoring batters in history have had exaggerated ones; what they also had was the time and hand speed to bring the bat down on line.`,
    risk: `The characteristic risks of a backlift going across the line are the **leading edge** to the off side and the **inside edge** onto pad or stumps, because the bat is travelling across rather than down the ball's line.

Against very fast bowling, an overlarge backlift can leave a batter late, and batters commonly shorten it against pace.`,
    whenYouWillSeeIt: `Every ball. It is most visible in slow motion, and it is one of the things commentators point to when a batter is being beaten repeatedly on the inside edge.`,
    commonMistakes: `- Starting the backlift after the ball has been released.
- Lifting towards the slips and then having to correct the path.
- A backlift so high that the bat cannot come down in time against pace.`,
    takeaways: `- The bat must be moving before the shot begins.
- Where the bat comes down from decides how easily it plays straight.
- High backlifts are not inherently faulty.`,
    related: ['batting-stance', 'batting-grip', 'timing', 'footwork', 'playing-late'],
    order: 30,
  }),

  battingTechnique({
    slug: 'footwork',
    title: 'Footwork',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'Moving the feet to meet the ball where it can be played most easily, which is most of what batting well means.',
    explanation: `Footwork is how a batter uses their feet to change where they meet the ball.

The point is not elegance. Every delivery arrives at some length, and the batter's job is to convert an awkward length into a comfortable one by moving. There are three basic moves:

**Forward.** Getting to the pitch of a fuller ball, so it can be driven or defended with the ball meeting the bat close to where it bounced. This reduces the distance over which swing or turn can act.

**Back.** Giving yourself time and space against a shorter ball, so it can be played under the eyes off the back foot.

**Down the pitch.** Advancing to a spinner to meet the ball before it can turn, which converts a good length into a half-volley.

Doing nothing is also a choice, and against a ball outside off it is often the correct one.`,
    footwork: `The reason footwork is described as the foundation of batting is arithmetic. Movement off the seam or from spin acts over the distance **between the pitch of the ball and the bat**. A batter who gets two feet further forward has removed a meaningful fraction of that distance, and therefore of the deviation they have to cope with.

The same logic runs backwards: against a short ball, moving back gives the batter more time to watch the ball and play it later.

Poor footwork is most often not the absence of movement but movement in the **wrong direction**: committing forward to a short ball, or back to a full one, both of which leave the batter playing the ball at the least comfortable point.`,
    risk: `Movement is a commitment, and a commitment made before the length is clear is the primary source of dismissals against good bowling. This is why the good-length band is dangerous: it is exactly the length at which the batter's first movement is likely to be wrong.

Advancing down the pitch adds the stumping risk, since a batter who misses is out of their ground.`,
    whenYouWillSeeIt: `Constantly. The clearest illustration is a batter using their feet against a spinner: a step down the pitch turns turn into a non-issue, and getting it wrong turns it into a stumping.`,
    commonMistakes: `- Committing before the length is readable.
- Planting the front foot across the line, closing off the off side.
- Not moving at all, and playing every ball from the crease.
- Half-forward: neither at the pitch of the ball nor back with time.`,
    takeaways: `- Footwork converts awkward lengths into comfortable ones.
- Getting forward reduces the distance over which the ball can deviate.
- The wrong movement is worse than none; the good-length band exploits exactly this.`,
    related: [
      'batting-stance',
      'balance',
      'forward-defence',
      'back-foot-defence',
      'playing-against-spin',
      'depth-of-the-crease',
    ],
    order: 40,
  }),

  battingTechnique({
    slug: 'balance',
    title: 'Balance',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'Staying in control of your body weight through the shot, without which nothing else in technique works.',
    explanation: `Balance is the batter's control over their own weight and body position from the stance through to the completion of the shot.

It is the least visible and most consequential part of batting technique. A batter who is off balance cannot play late, cannot adjust to movement, and cannot change their mind, because all three require the body to still have options.

The observable symptoms of poor balance are falling over to the off side, the head dropping outside the line of the front foot, and the back leg collapsing.`,
    footwork: `Two ideas are usually described as the core of it.

**Head over the front knee** in front-foot shots, so the weight is moving towards the ball rather than falling away from it.

**Weight going where the shot is going.** A drive with the weight moving backwards is a shot without power, and a pull with the weight falling to the off side is a shot without control.

The reason balance is treated as more fundamental than any particular shot is that it determines whether a batter can play the ball **late**, and playing late is what makes movement survivable.`,
    risk: `Loss of balance produces a specific family of dismissals: the caught-behind off a shot played away from the body, the LBW from falling across the stumps, and the hit wicket from treading back onto the stumps while off balance against a short ball.`,
    whenYouWillSeeIt: `Most visibly when a batter is playing well: a batter in form looks unhurried, which is usually a description of balance rather than of time. Conversely, a batter about to get out often looks off balance for two or three deliveries first.`,
    commonMistakes: `- Head falling to the off side, taking the hands away from the body.
- Weight moving backwards during a front-foot shot.
- Overbalancing forward against spin, which exposes a stumping.`,
    takeaways: `- Balance determines whether a batter can play late and adjust.
- Head over the front knee, weight moving with the shot.
- Its failures show up as a recognisable set of dismissals.`,
    related: ['footwork', 'batting-stance', 'playing-late', 'timing', 'soft-hands'],
    order: 50,
  }),

  battingTechnique({
    slug: 'timing',
    title: 'Timing',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'Meeting the ball at the moment the bat is travelling fastest and most controllably, which is why timed shots need no force.',
    explanation: `Timing is the coordination of the bat's swing with the ball's arrival, so that contact happens at the point where the bat is moving fast and the batter is in control.

It is the reason a shot can go for four with no apparent effort while a full-blooded swing goes twenty metres. The energy in a shot comes overwhelmingly from the **speed of the bat at contact** and from the **ball's own pace**, and a well-timed shot uses both.

Cricket talks about timing as though it were mystical. It is not: it is the observable consequence of the head being still, the ball being watched, and the bat arriving in the right place at the right moment.`,
    footwork: `Three things are usually described as producing it.

**Watching the ball right onto the bat**, which sounds trite and is the single most repeated piece of batting instruction in existence for a reason.

**Playing under the eyes**, so contact happens close to the body where the swing is controlled, rather than reaching.

**Not hurrying.** A batter who decides early has to hold the shot; one who decides late arrives with the bat still accelerating.

The corollary is that timing degrades when a batter is anxious or trying to force the pace, which is why a batter looking for boundaries often stops timing the ball.`,
    risk: `Mistiming is the mechanism behind a large share of dismissals in limited-overs cricket. A ball hit early or late off the top or bottom of the bat goes up rather than along, and a ball in the air is a catch.

Bowlers attack timing directly with **slower balls** and changes of pace, precisely because it produces catchable errors rather than edges.`,
    whenYouWillSeeIt: `Most obviously when a batter plays a shot that beats the field with no visible effort. Also, in the negative, when a batter starts finding fielders after a period of finding gaps.`,
    commonMistakes: `- Reaching for the ball rather than letting it come.
- Deciding the shot before the ball's pace is clear.
- Trying to generate power with the arms rather than with bat speed and the ball's pace.`,
    takeaways: `- Contact at the moment of maximum controlled bat speed.
- Power comes from bat speed and the ball's pace, not from force.
- Slower balls attack timing specifically, and errors go into the air.`,
    related: ['balance', 'playing-late', 'slower-ball', 'soft-hands', 'drive'],
    order: 60,
  }),

  // ── Defensive shots ───────────────────────────────────────────────────────
  battingTechnique({
    slug: 'defensive-shot',
    title: 'Defensive Shot',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'A shot played to stop the ball rather than to score, which is a positive act rather than a failure to attack.',
    explanation: `A defensive shot aims to keep the ball out: away from the stumps, off the pads, and out of the hands of catchers. It is not an attempt to score.

Cricket is unusual among bat-and-ball sports in that **declining to score is legitimate and often correct**. A Test batter may play out an entire over defensively and have done their job perfectly, because the resource they are protecting is their wicket rather than the deliveries.

The two basic defensive shots are the **forward defence**, played off the front foot to a fuller ball, and the **back-foot defence**, played off the back foot to a shorter one.`,
    footwork: `Common to both, as coaching convention:

**A straight bat.** The face of the bat presented down the line of the ball, so an error in line still produces contact rather than a gap.

**Soft hands.** The grip relaxed at contact so the ball drops rather than rebounding, which stops a defensive shot carrying to a close catcher.

**Bat and pad together.** No gap between the bat and the front pad, since that gap is where a ball turning or seaming in goes through to the stumps.

**Head over the ball.** Contact under the eyes rather than out in front.`,
    scoringArea: `None, by design. A defensive shot that runs away for runs is a bonus rather than the intent.

What defence does produce is **information**. A batter defending for an over learns how much the ball is moving, how the pitch is behaving and what the bowler is trying, and can then choose when to score.`,
    risk: `Defensive shots are the lowest-risk option available, but not risk-free. The characteristic failures are the **inside edge** onto the stumps from a gap between bat and pad, the **outside edge** from playing away from the body, and the **bat-pad catch** from hard hands popping the ball up to a close catcher.`,
    whenYouWillSeeIt: `Constantly in Test cricket, particularly early in an innings, against a new ball, and when a side is batting to save a match. Rarer but not absent in T20, where even an aggressive batter defends the ball they cannot hit.`,
    commonMistakes: `- Hard hands, so the ball rebounds to a catcher.
- A gap between bat and pad.
- Playing at a ball outside off that could have been left entirely.
- Defending with an angled bat, which turns a miss into an edge.`,
    takeaways: `- A deliberate choice not to score, and often the correct one.
- Straight bat, soft hands, bat and pad together, head over the ball.
- Its failures are the inside edge, the outside edge and the bat-pad catch.`,
    related: [
      'forward-defence',
      'back-foot-defence',
      'soft-hands',
      'leaving-the-ball',
      'batting-for-a-draw',
    ],
    order: 70,
  }),

  battingTechnique({
    slug: 'forward-defence',
    title: 'Forward Defence',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'The front-foot defensive shot: stride to the pitch of the ball and smother it with a straight bat.',
    explanation: `The forward defence is played off the front foot to a ball full enough to reach forward to. The batter strides towards the pitch of the ball and meets it with a straight, vertical bat, aiming to kill the ball rather than to hit it anywhere.

Its purpose is to **smother** movement. By getting the bat close to where the ball pitched, the batter gives seam or spin the least possible distance in which to deviate, which is why the forward defence is the standard answer to a good-length ball that is doing something.`,
    footwork: `Coaching convention, and individual batters vary:

**The stride** goes towards the pitch of the ball, not merely down the pitch. The aim is to get the head close to the line.

**The head** leads and stays still, over or just inside the line of the ball.

**The bat** comes down straight, close to and slightly ahead of the front pad, with the face presented down the line.

**The hands** are soft at contact, so the ball drops at the batter's feet.

**Bat and pad** stay together, leaving no gap for a ball moving in.`,
    scoringArea: `None intended. Occasionally the ball runs to mid-off or mid-on for a single if the shot is firm.`,
    risk: `Lower than any attacking shot, and its specific failures are worth knowing:

- **Through the gate**: bat and pad apart, and a ball moving in goes between them onto the stumps.
- **Outside edge**: the stride not far enough, so contact happens away from the body with the ball still moving.
- **Bat-pad**: hard hands, and the ball pops up to short leg or silly point.
- **LBW**: the front pad planted across the line, so a miss hits the pad in front of the stumps.`,
    whenYouWillSeeIt: `The most-played shot in Test cricket. Against a good-length ball from a seam bowler or a spinner getting turn, it is often the only sensible option.`,
    commonMistakes: `- A gap between bat and pad.
- A stride that plants across the line rather than towards the ball.
- Hard hands, giving a catch to a close fielder.
- Pushing at the ball rather than letting it come to the bat.`,
    takeaways: `- Front foot to the pitch of the ball, straight bat, soft hands.
- Smothers seam and spin by reducing the distance they can act over.
- Fails through the gate, to the outside edge, or to a bat-pad catch.`,
    related: [
      'defensive-shot',
      'back-foot-defence',
      'footwork',
      'soft-hands',
      'through-the-gate',
      'short-leg',
    ],
    order: 80,
  }),

  battingTechnique({
    slug: 'back-foot-defence',
    title: 'Back-foot Defence',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'The back-foot defensive shot: move back and across, and play the ball down under the eyes.',
    explanation: `The back-foot defence is played to a ball too short to reach forward to. The batter moves back towards the stumps and across towards the line of the ball, and plays it down with a straight bat under the eyes.

Moving back buys **time**. The ball has further to travel before it reaches the bat, and the batter can watch it for longer and play it later, which is exactly what is needed against a ball that is bouncing or moving.`,
    footwork: `Convention, with variation between players:

**Back and across.** The back foot moves towards the stumps and towards the line of the ball, which both gives room and covers the stumps.

**High hands.** The hands stay above the ball so the bat face points downwards at contact, playing the ball into the ground rather than popping it up.

**Under the eyes.** Contact directly beneath the head rather than out in front.

**Soft hands** again, so the ball drops.`,
    scoringArea: `Not intended to score, though a firm back-foot defence can run away square on the off side for a single.`,
    risk: `Its failure modes differ from the forward defence's:

- **Caught behind**, from playing at a rising ball away from the body.
- **Bat-pad or glove**, from a ball climbing more than expected.
- **Hit wicket**, from moving too far back and treading on the stumps.
- **Bowled**, from a ball that skids on lower than the batter expected while they are back.`,
    whenYouWillSeeIt: `Against pace on a bouncy pitch, against back-of-a-length bowling, and against spin bouncing sharply. Batters from countries with faster, bouncier pitches are often described as naturally stronger off the back foot for exactly this reason.`,
    commonMistakes: `- Playing with the hands low, so the ball pops up.
- Going back without going across, leaving the stumps exposed.
- Playing at a ball that could have been left, especially outside off.
- Treading too close to the stumps.`,
    takeaways: `- Back and across, high hands, contact under the eyes.
- Buys time against short and rising balls.
- Fails to the outside edge, the glove, or a hit wicket.`,
    related: [
      'defensive-shot',
      'forward-defence',
      'footwork',
      'short-ball',
      'playing-short-pitched-bowling',
      'hit-wicket',
    ],
    order: 90,
  }),

  // ── Drives ───────────────────────────────────────────────────────────────
  battingTechnique({
    slug: 'drive',
    title: 'Drive',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'The family of straight-bat attacking shots played to a fuller ball, from cover drive to on drive.',
    explanation: `A drive is an attacking shot played with a **straight, vertical bat** and a full swing, usually off the front foot, to a ball pitched up far enough to reach.

Drives are named by **where they go**, which is determined by where the ball was and how the bat came through:

- **Cover drive**: through the off side, square of the wicket.
- **Square drive**: squarer still on the off side.
- **Straight drive**: down the ground past the bowler.
- **On drive**: down the ground on the leg side.

They can also be played off the **back foot** to a slightly shorter ball, which is a harder shot requiring the batter to hit the ball on the rise with a straight bat.

Drives are the lowest-risk boundary shots in cricket, because a straight bat means an error in line still finds the middle of the bat rather than the edge.`,
    footwork: `Common elements, as convention:

- **Front foot towards the pitch of the ball**, so the head gets close to the line.
- **Head still and over the ball** at contact.
- **A full swing** with the bat's face presented in the intended direction.
- **High hands** through the finish, weight moving forwards.

Which drive results is largely determined by the ball's line and how far across the front foot travels, rather than by a conscious decision to play a different shot.`,
    scoringArea: `Anywhere in the arc from point round to midwicket, depending on the drive. The diagram shows the off-side and straight regions drives are played into.`,
    scoringAreaData: fullFieldSetting(
      ['point', 'cover', 'extra-cover', 'mid-off', 'mid-on', 'midwicket'],
      'The driving arc: cover and extra cover on the off side, through to mid-on and midwicket.',
    ),
    risk: `Driving means committing the bat to a line before the ball has finished moving, which is why it is the shot most associated with early dismissals.

Against a **moving** ball the drive is high risk: the edge carries to the keeper and slips. Against a ball that is **not quite full enough**, the batter reaches, and contact away from the body produces the same edge. Against a **spinner turning it**, a drive through the line can produce a catch to a close catcher or a bowled.

The mitigation is length recognition: drive the ball that is full enough, and defend or leave the one that is not.`,
    whenYouWillSeeIt: `Once the ball has stopped moving, on a good pitch, and against any bowler who pitches up. The first cover drive of a batter's innings is a recognised moment in Test cricket precisely because of the risk.`,
    commonMistakes: `- Driving a ball that is too short, so contact is away from the body.
- Head falling to the off side.
- Driving on the up against a moving ball early in an innings.
- Bottom hand dominating, which turns a straight bat into an angled one.`,
    takeaways: `- Straight-bat attacking shot to a full ball, named for where it goes.
- The lowest-risk boundary shot when the length is right.
- High risk against a moving ball or one not quite full enough.`,
    related: ['cover-drive', 'straight-drive', 'on-drive', 'square-drive', 'half-volley', 'timing'],
    order: 100,
  }),

  battingTechnique({
    slug: 'straight-drive',
    title: 'Straight Drive',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'A drive hit straight back past the bowler, and the shot with the largest margin for error.',
    explanation: `The straight drive sends a full-length ball back down the ground, past the bowler, between mid-off and mid-on.

It is often described as the safest attacking shot in cricket, and there is a geometric reason: the bat is travelling **along the same line as the ball**, so a small error in timing or contact still sends the ball somewhere useful rather than to the edge. A drive through the covers, by contrast, requires the bat to travel slightly across the ball's line.

It is also the shot that most reliably indicates a batter is in form, because it requires the head, the front foot and the bat to be aligned.`,
    footwork: `Convention: front foot forward and close to the line of the ball, head over the ball, bat swinging straight down the line with a full follow-through, weight moving down the pitch.

The characteristic feel described by batters is that the shot requires no force: the ball's pace and the bat's swing do the work, and a well-timed straight drive beats the fielders without appearing hit hard.`,
    scoringArea: `Straight down the ground on either side of the bowler, between mid-off and mid-on, and to long off or long on if it beats them.`,
    scoringAreaData: fullFieldSetting(
      ['mid-off', 'mid-on', 'long-off', 'long-on', 'extra-cover'],
      'The straight-drive region: past the bowler between mid-off and mid-on.',
    ),
    risk: `The lowest of any drive, and lower than most attacking shots, because the bat travels along the ball's line.

Two genuine risks remain: a **leading edge** to the off side if the bottom hand turns the bat, and a **caught and bowled** chance if the ball is hit straight back at the bowler, which happens more often than its rarity in the record suggests.

There is also the danger to the **non-striker**, who can be run out if the ball deflects off the bowler onto the stumps.`,
    whenYouWillSeeIt: `Against any full delivery, in every format. Especially valuable against spin, where hitting straight down the ground removes the turn from the equation entirely, and at the death, where a straight ball is easiest to hit into the largest part of the ground.`,
    commonMistakes: `- Bottom hand taking over, producing a leading edge.
- Hitting across the line and losing the shot's inherent safety.
- Failing to move the front foot, so the shot becomes a push from the crease.`,
    takeaways: `- Hit straight past the bowler, between mid-off and mid-on.
- The largest margin for error of any drive, because the bat follows the ball's line.
- Especially valuable against spin, since turn stops mattering.`,
    related: ['drive', 'cover-drive', 'on-drive', 'long-off', 'long-on', 'playing-against-spin'],
    order: 110,
  }),

  battingTechnique({
    slug: 'on-drive',
    title: 'On Drive',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A drive played down the ground on the leg side, and one of the hardest shots to play well.',
    explanation: `The on drive sends a full ball on or around the stumps down the ground on the **leg side**, between mid-on and midwicket.

It has a reputation as a difficult shot, and the reason is mechanical: the ball is on the batter's legs, so the bat has to come down **past the front pad** and still be straight at contact. That requires the front foot to move out of the way and the hands to work close to the body, and getting it slightly wrong produces the most recognisable of batting errors.`,
    footwork: `Convention: the front foot moves towards the line of the ball but slightly outside it, so the bat has room to swing down inside the pad. The head goes over the ball, and the bat comes down straight with the face towards mid-on rather than being closed towards square leg.

The frequent instruction is to keep the shot **straight rather than across**, since the temptation with a ball on the pads is to hit across the line into the leg side.`,
    scoringArea: `Between mid-on and midwicket, and straight to long on if it clears the infield.`,
    scoringAreaData: fullFieldSetting(
      ['mid-on', 'midwicket', 'long-on', 'square-leg', 'mid-off'],
      'The on-drive region: between mid-on and midwicket on the leg side.',
    ),
    risk: `Two specific failures, both common:

**The leading edge.** If the bat face closes or the bottom hand turns it, the ball goes off the leading edge towards cover and point, often in the air. This is the classic on-drive dismissal.

**LBW.** The front pad is being played around, so a ball that beats the bat is very likely to hit the pad in line with the stumps.

Because of both, many coaches teach the on drive later than the off-side drives, and some batters simply do not play it, working the ball into the leg side with a flick instead.`,
    whenYouWillSeeIt: `To a full ball on the stumps or just outside leg, and against a bowler bowling straight. In white-ball cricket it is a key shot against a bowler attacking the stumps, since the alternative is to keep working singles.`,
    commonMistakes: `- Bat face closing, producing a leading edge to cover.
- Front foot planted directly in the ball's line, leaving no room for the bat.
- Hitting across the line rather than straight, turning a drive into a slog.`,
    takeaways: `- A drive down the ground on the leg side, between mid-on and midwicket.
- Difficult because the bat must come down past the front pad.
- Fails to the leading edge and to LBW.`,
    related: ['drive', 'straight-drive', 'flick', 'long-on', 'midwicket', 'lbw'],
    order: 120,
  }),

  battingTechnique({
    slug: 'square-drive',
    title: 'Square Drive',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A drive hit square of the wicket on the off side, to a ball wide enough to free the arms.',
    explanation: `The square drive is played to a ball that is full but **wide** of off stump, sending it square on the off side, between point and cover.

It sits between the cover drive and the cut: fuller than a cut, wider than a cover drive. Because the ball is wide, the batter can free their arms and hit through the line with a full swing, which is why square drives often go quickly along the ground.

It can be played off the front foot to a fuller ball or off the back foot to one slightly shorter, in which case it shades into a **square cut**.`,
    footwork: `Convention: the front foot goes towards the ball rather than straight down the pitch, opening the body enough to allow a swing through the line square of the wicket. The head stays over the ball; the bat comes through with the face pointing towards point or cover.

Because the ball is wide, the danger is reaching, so the emphasis in coaching is on getting the foot close enough that contact still happens near the body.`,
    scoringArea: `Square on the off side, between point and cover, and to deep point or deep cover if it beats them.`,
    scoringAreaData: fullFieldSetting(
      ['point', 'cover', 'deep-point', 'deep-cover', 'gully'],
      'The square-drive region: between point and cover on the off side.',
    ),
    risk: `The wide ball is by definition further from the body, so contact away from the body is the main risk, and the error is the **outside edge** behind square.

Against a ball moving away it is a high-risk shot for the same reason the cover drive is: the bat is committed to a line the ball is leaving.`,
    whenYouWillSeeIt: `Against a bowler bowling wide of off stump, and particularly in white-ball cricket where bowlers use a wider line and the field is set for the straighter shots.`,
    commonMistakes: `- Reaching, so contact is away from the body.
- Playing it to a ball that is not full enough, when a cut is the right shot.
- Chasing a wide ball that could simply have been left.`,
    takeaways: `- A full, wide ball driven square on the off side.
- Sits between the cover drive and the cut.
- Fails to the outside edge, since the ball is far from the body.`,
    related: ['drive', 'cover-drive', 'cut-shot', 'square-cut', 'point', 'deep-point'],
    order: 130,
  }),

  // ── Cross-bat shots ───────────────────────────────────────────────────────
  battingTechnique({
    slug: 'cut-shot',
    title: 'Cut Shot',
    category: 'batting',
    difficulty: 'beginner',
    summary:
      'A back-foot shot played to a short, wide ball, cutting it down square or behind square on the off side.',
    explanation: `The cut is played off the back foot to a ball that is **short and wide of off stump**. The batter waits, gets back and across, and cuts the ball downwards square or behind square on the off side.

It is a **cross-bat** shot: the bat travels horizontally rather than vertically, which means it carries more risk than a drive but allows a batter to score off a ball that offers no driving length.

Variants are named by direction: a **square cut** goes square of the wicket, a **late cut** is played very late and goes fine behind square, and an **upper cut** is played to a higher ball and goes over the slips.`,
    footwork: `Convention: back and across towards the line, weight on the back foot, and the ball allowed to come as late as possible. The hands stay high so the bat comes down on the ball, cutting it into the ground rather than under it.

The consistent instruction is **hit down on it**, since a cut hit underneath goes up rather than square, and a cut in the air behind square goes straight to the catchers.`,
    scoringArea: `Square and behind square on the off side, between point and third man.`,
    scoringAreaData: fullFieldSetting(
      ['point', 'backward-point', 'gully', 'third-man', 'deep-point'],
      'The cutting region: from point round behind square to third man.',
    ),
    risk: `Genuinely risky against the wrong ball, and the risks are specific.

**Not wide enough.** Cutting a ball close to the stumps means the bat travels across a ball that is near the wicket, and an inside edge can go onto the stumps or to the keeper.

**Not short enough.** Cutting a ball that is too full brings the top edge into play, and the catch goes behind square where the cordon is.

**Low bounce.** On a slow, low pitch the ball can arrive under the bat's arc, producing a bottom edge or a bowled.

The old coaching maxim about never cutting early in an innings, or on a slow pitch, is about exactly these failures.`,
    whenYouWillSeeIt: `Against short, wide bowling in all formats. Particularly productive against bowlers who bowl wide of the stumps in white-ball cricket, and against spin where the batter can use the pace of a wide, short ball.`,
    commonMistakes: `- Cutting a ball too close to the stumps.
- Cutting a ball that is too full, producing a top edge.
- Hands too low, so the ball goes up rather than down.
- Cutting on a low, slow pitch where the ball does not bounce enough.`,
    takeaways: `- Back-foot cross-bat shot to a short, wide ball.
- Hit downwards, square or behind square on the off side.
- Fails when the ball is too straight, too full, or bouncing too low.`,
    related: [
      'square-cut',
      'upper-cut',
      'french-cut',
      'pull-shot',
      'point',
      'third-man',
      'short-ball',
    ],
    order: 140,
  }),

  battingTechnique({
    slug: 'square-cut',
    title: 'Square Cut',
    category: 'batting',
    difficulty: 'intermediate',
    summary: 'A cut played square of the wicket, into the region between point and cover.',
    explanation: `The square cut is the version of the cut hit **square** of the wicket rather than behind it, into the point and cover region.

It is played to a ball short and wide enough to cut, but taken slightly earlier than a late cut, with the bat meeting the ball more in front of the body so the ball goes squarer.

Because it goes square rather than fine, it is a run-scoring shot into a region that usually has fielders in it, which means it needs to be hit hard and along the ground to beat them.`,
    footwork: `Convention: back and across, weight on the back foot, hands high, and contact slightly further in front than for a late cut. The bat is brought down and across, cutting the ball square.

Batters describe the difference from a late cut as one of **timing of contact** more than of technique: earlier contact sends it squarer, later contact sends it finer.`,
    scoringArea: `Square on the off side, between point and cover, and towards deep point if it beats the ring.`,
    scoringAreaData: fullFieldSetting(
      ['point', 'cover', 'deep-point', 'backward-point', 'gully'],
      'The square-cut region: between point and cover.',
    ),
    risk: `The same family as the cut, with one addition: because the ball is hit squarer and therefore earlier, there is slightly less time to adjust to bounce, so a ball climbing more than expected produces a top edge behind square.`,
    whenYouWillSeeIt: `Against short, wide bowling, and especially against spinners bowling wide of off stump, where the pace is slow enough to allow the batter to control the direction precisely.`,
    commonMistakes: `- Playing it to a ball not wide enough, risking the inside edge.
- Contact too early on a rising ball, producing a top edge.
- Hitting in the air into the ring where fielders are set.`,
    takeaways: `- A cut hit square rather than behind square.
- Earlier contact than a late cut, into the point and cover region.
- Shares the cut's risks, with less time to adjust to bounce.`,
    related: ['cut-shot', 'upper-cut', 'square-drive', 'point', 'deep-point', 'short-ball'],
    order: 150,
  }),

  battingTechnique({
    slug: 'pull-shot',
    title: 'Pull Shot',
    category: 'batting',
    difficulty: 'beginner',
    summary: 'A back-foot cross-bat shot that pulls a short ball around to the leg side.',
    explanation: `The pull is played to a **short** ball, generally between waist and chest height, hitting it across the line into the leg side between midwicket and square leg.

It is one of the most productive shots in limited-overs cricket, because a short ball offers height to hit under and the leg-side boundary in front of square is usually the easiest to clear.

It is distinguished from the **hook**, which is played to a higher, faster ball and sends it behind square, and from the **slog sweep**, which is played to a spinner off the front foot.`,
    footwork: `Convention: back and across towards the line of the ball, weight on the back foot, and the body opening up to allow the bat to swing horizontally through the line.

The consistent teaching point is to **stay on top of the ball** where possible, rolling the wrists at contact so the ball is hit down or flat rather than up. A pull hit underneath the ball goes high towards the deep fielders.

Against genuinely fast bowling the shot is often played more as a controlled deflection than a full swing, precisely because there is no time for the latter.`,
    scoringArea: `Leg side, in front of and around square: between square leg and midwicket, and to deep midwicket or deep square leg if it beats the ring.`,
    scoringAreaData: fullFieldSetting(
      ['square-leg', 'midwicket', 'deep-midwicket', 'deep-square-leg', 'mid-on'],
      'The pull region: square leg round to midwicket, and the deep boundary behind them.',
    ),
    risk: `The pull is a genuine risk-reward shot and captains set fields specifically for it.

**Top edge.** A ball bouncing higher than expected produces a top edge, which goes very high and usually straight to a deep leg-side fielder. This is why a captain bowling short sets deep square leg and long leg.

**Mistiming into the ring.** A pull hit early goes flat to midwicket.

**Lost stumps.** Because the shot is cross-batted and played from the back foot, a ball that is not as short as it looked can beat the bat and hit the stumps, or produce a hit wicket if the batter treads back.`,
    whenYouWillSeeIt: `Against short bowling in every format, and constantly in T20, where bowlers who miss their length short are punished immediately. Also the standard response to a bouncer that is not quite high enough.`,
    commonMistakes: `- Playing under the ball, producing a top edge to the deep fielders.
- Pulling a ball that is not short enough.
- Falling away to the off side, losing control of the shot's direction.`,
    takeaways: `- Back-foot cross-bat shot to a short ball, hit to the leg side in front of square.
- Highly productive, and the field is usually set for its error.
- The top edge to a deep leg-side fielder is the characteristic failure.`,
    related: [
      'hook-shot',
      'short-ball',
      'bouncer',
      'slog-sweep',
      'deep-midwicket',
      'playing-short-pitched-bowling',
    ],
    order: 160,
  }),

  battingTechnique({
    slug: 'hook-shot',
    title: 'Hook Shot',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A pull played to a higher, faster ball, hooking it round behind square on the leg side.',
    explanation: `The hook is played to a ball around chest or head height, usually a **bouncer**, sending it behind square on the leg side towards fine leg and long leg.

It is the most spectacular and among the riskiest shots in cricket. The batter is hitting across the line at a ball arriving at head height, often at high pace, and the margin between a six and a top edge to a waiting fielder is very small.

It is distinct from the pull, which is played to a lower ball and goes in front of square.`,
    footwork: `Convention: the batter gets inside the line of the ball, rotating the body and swinging the bat horizontally above shoulder height, rolling the wrists to keep the ball down if possible.

Batters who hook well are usually described as getting **inside the line** rather than backing away, since backing away leaves the shot being played with the arms alone and the head moving.`,
    scoringArea: `Behind square on the leg side: fine leg, long leg, and deep square leg.`,
    scoringAreaData: fullFieldSetting(
      ['fine-leg', 'long-leg', 'deep-square-leg', 'square-leg', 'deep-midwicket'],
      'The hooking region: behind square on the leg side, from deep square leg round to fine leg.',
    ),
    risk: `The highest of any conventional shot, and knowingly so.

**Top edge.** The commonest outcome of a mistimed hook, and it goes high and behind square, precisely where a captain bowling short has placed one or two catchers.

**Glove.** A ball climbing faster than expected can take the glove through to the keeper or a leg-side catcher.

**Physical risk.** A hook attempted and missed at a ball at head height is the most dangerous moment in batting, and the shot's history is bound up with the introduction of helmets.

Because of all this, sides frequently instruct batters not to hook, and a batter's willingness to hook is a recognised part of their profile rather than an automatic skill.`,
    whenYouWillSeeIt: `Against fast, short bowling, and in response to a sustained short-ball plan. Less common in T20 than the pull, because bowlers rarely bowl high enough for it and the risk is not worth it when lower balls are available to hit.`,
    commonMistakes: `- Backing away to the leg side rather than getting inside the line.
- Hooking with the head moving, which destroys the shot's control.
- Attempting it against a field specifically set for the top edge.`,
    takeaways: `- Played to a chest- or head-high ball, hit behind square on the leg side.
- The highest-risk shot in the conventional repertoire.
- The top edge goes exactly where a short-ball field is set.`,
    related: [
      'pull-shot',
      'bouncer',
      'short-ball',
      'long-leg',
      'fine-leg',
      'helmet',
      'short-ball-strategy',
    ],
    order: 170,
  }),

  // ── Sweeps ───────────────────────────────────────────────────────────────
  battingTechnique({
    slug: 'sweep',
    title: 'Sweep',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A front-knee-down shot that sweeps a spinner’s good-length ball round to the leg side.',
    explanation: `The sweep is played predominantly to **spin**. The batter goes down on the front knee and sweeps the ball, with a horizontal bat, from a good length round to the leg side.

Its purpose is to attack a length that offers nothing else. A spinner's good-length ball cannot be driven or cut, but it can be swept, because going down on one knee brings the bat underneath the ball's bounce and converts an awkward length into a hittable one.

It also has a tactical function: sweeping repeatedly forces the captain to post fielders behind square on the leg side, which opens other areas.`,
    footwork: `Convention, with wide individual variation:

The front foot goes forward and across to the line of the ball, the front knee goes down, and the bat swings horizontally from off to leg, meeting the ball roughly in line with or just outside the front pad. The head stays down and still; the back leg trails.

Batters commonly describe it as a shot that must be **decided early**, because the movement is large and cannot be aborted easily. That premeditation is what makes it risky against a ball that turns unexpectedly.`,
    scoringArea: `Behind square and square on the leg side: between square leg and fine leg, and to deep square leg if it beats the ring.`,
    scoringAreaData: fullFieldSetting(
      ['square-leg', 'deep-square-leg', 'fine-leg', 'long-leg', 'short-leg'],
      'The sweeping region: from square leg round behind square to fine leg.',
    ),
    risk: `**Top edge**, if the ball bounces more than expected or the batter is not far enough across, and it goes to the deep leg-side fielders.

**LBW**, which is the sweep's specific danger: the batter is playing a cross-bat shot at a ball that may hit the pad in front of the stumps, and if the ball pitched in line and the shot misses, the appeal is live. A batter sweeping and missing is frequently out.

**Stumped**, occasionally, if the batter overbalances and the ball goes through to the keeper.

Because the shot is premeditated, it is also vulnerable to a bowler who sees the movement and changes length.`,
    whenYouWillSeeIt: `Against spin in all formats, and against a spinner bowling to a leg-side field. It is also a standard tactic on turning subcontinental pitches, where sweeping takes the pitch's turn out of play by hitting with the spin.`,
    commonMistakes: `- Not getting far enough across, so the ball hits the pad or the top edge.
- Sweeping a ball too short, which bounces over the bat.
- Sweeping when the ball is turning enough to beat a premeditated shot.`,
    takeaways: `- Front knee down, horizontal bat, spin swept round to the leg side.
- Attacks a length that offers nothing else.
- LBW and the top edge are the characteristic failures.`,
    related: [
      'slog-sweep',
      'reverse-sweep',
      'paddle-sweep',
      'playing-against-spin',
      'deep-square-leg',
      'lbw',
    ],
    order: 180,
  }),

  battingTechnique({
    slug: 'slog-sweep',
    title: 'Slog Sweep',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A sweep hit in the air for distance, aimed over the leg-side boundary in front of square.',
    explanation: `The slog sweep is a sweep played with the intention of hitting the ball **in the air and a long way**, over the leg-side boundary in front of square rather than along the ground behind it.

Where a conventional sweep is a control shot, the slog sweep is a power shot. The batter gets down and swings hard and slightly upwards, aiming over deep midwicket and towards the region informally known as cow corner.

It is one of the primary six-hitting shots against spin in limited-overs cricket.`,
    footwork: `Convention: like a sweep, front leg across and down, but with a fuller, more upward swing and more weight through the shot. The contact point is generally slightly further forward than a conventional sweep, and the wrists do not roll down over the ball, since height is wanted rather than avoided.

Because the aim is distance, the shot needs a **full swing**, which is why it is played to a fuller ball than a conventional sweep.`,
    scoringArea: `Leg side in front of square: deep midwicket, cow corner, and long on.`,
    scoringAreaData: fullFieldSetting(
      ['deep-midwicket', 'cow-corner', 'long-on', 'midwicket', 'deep-square-leg'],
      'The slog-sweep region: over deep midwicket towards long on.',
    ),
    risk: `High, and deliberately accepted.

**Caught in the deep** is the main outcome of a mistimed slog sweep: the ball goes up and travels far enough to be caught but not far enough to clear the rope. In T20 cricket this is one of the most common dismissals in existence.

**Top edge**, going very high, often caught by the keeper or a close leg-side fielder.

**Bowled or LBW**, if the ball is fuller or straighter than the batter assumed and the premeditated swing misses.`,
    whenYouWillSeeIt: `Against spin in limited-overs cricket, from the middle overs onwards. Also from a set batter against a spinner in a Test when a side is accelerating.`,
    commonMistakes: `- Playing it to a ball too short, which bounces over the swing.
- Not getting far enough across, so the ball hits the pad or the top edge.
- Attempting it when the boundary on that side is long and the fielder is deep.`,
    takeaways: `- A sweep hit in the air for distance, over the leg side in front of square.
- A primary six-hitting shot against spin.
- Caught in the deep is the characteristic dismissal.`,
    related: [
      'sweep',
      'reverse-sweep',
      'cow-corner',
      'deep-midwicket',
      'death-overs-batting',
      'playing-against-spin',
    ],
    order: 190,
  }),

  battingTechnique({
    slug: 'reverse-sweep',
    title: 'Reverse Sweep',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'A sweep played in the opposite direction, sending the ball to the off side behind square.',
    explanation: `The reverse sweep is a sweep played the other way: the batter turns the bat over and sweeps the ball towards the **off side** behind square, into the third man and backward point region.

The whole point is the **field**. A batter who has been sweeping conventionally has forced fielders onto the leg side behind square; reversing the shot hits into the space that has just been vacated.

It is a genuinely difficult shot, requiring the batter to play with reversed hands, and it was regarded as reckless for much of cricket's history. It is now a standard part of the limited-overs repertoire and increasingly seen in Test cricket.`,
    footwork: `Convention: front leg across and down as for a conventional sweep, but the hands rotate so the bat's face is turned towards the off side, and the swing goes from leg to off.

Some batters play it with a full reversal of the grip and others with a wristy flick; there is no single accepted method, which is part of why it remains difficult.`,
    scoringArea: `Off side behind square: third man, backward point, and the region between them.`,
    scoringAreaData: fullFieldSetting(
      ['third-man', 'backward-point', 'point', 'gully', 'deep-point'],
      'The reverse-sweep region: behind square on the off side, towards third man.',
    ),
    risk: `High, and of a distinctive kind.

**Top edge or glove** through to the keeper, since the reversed hands reduce control.

**LBW**, and here the reverse sweep has a particular exposure: the Laws of LBW are applied relative to the batter's stance at the time, so a batter who has reversed their hands but not switched their stance is still judged as the same-handed batter, and a cross-bat miss can be plainly out.

**Bowled**, if the ball is straighter or fuller than the premeditation assumed.

Because the shot is premeditated and large, a bowler who spots the movement can change length and punish it.`,
    whenYouWillSeeIt: `In limited-overs cricket against spin, particularly to a heavily leg-side field, and increasingly in Test cricket from batters using it to disrupt a spinner's plan.`,
    commonMistakes: `- Playing it to a ball that is too full or too straight.
- Committing so early that the bowler can adjust.
- Attempting it without the field actually being skewed, which forfeits the shot's purpose.`,
    takeaways: `- A sweep reversed to the off side behind square.
- Exists to exploit a leg-side field.
- High risk, with LBW and the glove the characteristic failures.`,
    related: [
      'sweep',
      'slog-sweep',
      'switch-hit',
      'third-man',
      'field-setting',
      'playing-against-spin',
    ],
    order: 200,
  }),

  battingTechnique({
    slug: 'paddle-sweep',
    title: 'Paddle Sweep',
    category: 'batting',
    difficulty: 'intermediate',
    summary: 'A soft, fine sweep that deflects the ball behind square rather than hitting it.',
    explanation: `The paddle sweep, sometimes called a fine sweep, is the gentlest member of the sweep family. Rather than swinging at the ball, the batter goes down and **deflects** it fine behind square on the leg side, using the ball's own pace.

Its purpose is not power but **placement and safety**. A paddle beats the close leg-side fielders, runs away fine towards fine leg, and is very hard for a captain to stop without posting somebody in an otherwise unproductive area.

It is also low-risk relative to other sweeps, because there is no full swing to mistime.`,
    footwork: `Convention: front leg across and down as for a sweep, but the bat is angled rather than swung, presenting a face that turns the ball fine. Contact is soft and the hands stay relaxed.

Batters often describe it as a shot played with the **top hand** and the face of the bat rather than with force.`,
    scoringArea: `Fine on the leg side behind square: between the keeper and fine leg, and towards long leg.`,
    scoringAreaData: fullFieldSetting(
      ['fine-leg', 'long-leg', 'square-leg', 'deep-square-leg', 'leg-slip'],
      'The paddle-sweep region: fine behind square on the leg side.',
    ),
    risk: `Lower than the other sweeps, but not zero.

**Top edge or glove** to the keeper, since the ball is being played very fine and close to the body.

**LBW**, as with any sweep, if the deflection misses and the ball would have hit the stumps.

**Leg slip or leg gully**, if the captain has anticipated the shot, since a fine deflection goes directly to them.`,
    whenYouWillSeeIt: `Against spin, and increasingly against pace in limited-overs cricket, where paddling a full ball fine is a way of scoring off a delivery aimed at the stumps. It is a favoured shot for rotating the strike without risk.`,
    commonMistakes: `- Trying to hit it rather than deflect it.
- Playing it too square, so it goes to a fielder rather than fine.
- Playing it when a leg slip or fine catcher is in place.`,
    takeaways: `- A soft, fine deflection rather than a swing.
- Uses the ball's pace to beat the close leg-side field.
- The lowest-risk sweep, though still exposed to LBW.`,
    related: ['sweep', 'slog-sweep', 'leg-glance', 'fine-leg', 'strike-rotation', 'leg-slip'],
    order: 210,
  }),

  // ── Wristy and improvised shots ───────────────────────────────────────────
  battingTechnique({
    slug: 'flick',
    title: 'Flick',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A wristy shot that turns a straight or leg-side ball into the leg side with minimal effort.',
    explanation: `A flick, sometimes called a whip or a work off the pads, uses the **wrists** rather than a full swing to redirect a ball on or just outside leg stump into the leg side.

Its efficiency is the point. A ball at the pads offers very little for a conventional shot, but a flick converts it into a single or a boundary with almost no risk and almost no effort, because the ball's own pace does the work and the bat's face simply changes its direction.

Batters strong on the leg side often score a large proportion of their runs this way, and it is one of the least visually spectacular but most productive shots in cricket.`,
    footwork: `Convention: the front foot moves slightly across and outside the line of the ball, opening the body, and the wrists roll at contact to turn the bat's face towards the leg side.

The whole shot happens close to the body and late. A flick played early or away from the body becomes an on drive or a leading edge.`,
    scoringArea: `Leg side, from square leg round to mid-on: midwicket above all.`,
    scoringAreaData: fullFieldSetting(
      ['midwicket', 'square-leg', 'mid-on', 'deep-midwicket', 'fine-leg'],
      'The flick region: predominantly midwicket, from square leg round to mid-on.',
    ),
    risk: `Low, and that is why it is so valuable.

The main failure is the **leading edge**, if the wrists turn too early and the bat's face closes, sending the ball gently to cover or point, often in the air.

**LBW** is a secondary risk, since the batter is playing around the front pad at a ball heading towards the stumps.`,
    whenYouWillSeeIt: `Constantly, against any bowler who strays onto the pads. It is a signature shot of batters from the subcontinent in particular, and one of the primary ways of rotating the strike without risk.`,
    commonMistakes: `- Turning the wrists too early, producing a leading edge.
- Playing away from the body rather than late and close.
- Attempting to hit rather than deflect, which turns a low-risk shot into a slog.`,
    takeaways: `- A wristy redirection of a straight or leg-side ball into the leg side.
- Very low risk and highly efficient for rotating the strike.
- The leading edge to cover is the characteristic failure.`,
    related: ['on-drive', 'leg-glance', 'strike-rotation', 'midwicket', 'attacking-the-stumps'],
    order: 220,
  }),

  battingTechnique({
    slug: 'leg-glance',
    title: 'Leg Glance',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A fine deflection off the face of the bat, sending a straight or leg-side ball behind square on the leg side.',
    explanation: `The leg glance deflects the ball fine behind square on the leg side, using the bat's angled face rather than a swing. It is among the oldest recognised shots in cricket and one of the most economical.

The ball does almost all the work: the batter simply changes its direction by a few degrees, and it runs away towards fine leg with the pace it arrived with.

It is closely related to the **paddle sweep**, which achieves a similar result from a lower position against a fuller ball, and to the **flick**, which sends the ball squarer.`,
    footwork: `Convention: the batter gets inside or level with the line of the ball, presents an angled bat face, and lets the ball come, deflecting it fine. The hands are soft and the shot is played very late.

The instruction most often given is to **let it come**, since a glance attempted early becomes a flick or a leading edge.`,
    scoringArea: `Fine on the leg side behind square: fine leg and long leg.`,
    scoringAreaData: fullFieldSetting(
      ['fine-leg', 'long-leg', 'leg-slip', 'square-leg', 'deep-square-leg'],
      'The leg-glance region: fine behind square on the leg side.',
    ),
    risk: `Low. The main exposures are a **glove or edge** through to the keeper, since the ball is being played very fine and close to the body, and a catch to **leg slip** if the captain has posted one specifically for the shot.

Against a ball moving in to the batter it is safer than most shots, since the bat is going with the ball's movement rather than against it.`,
    whenYouWillSeeIt: `Against pace bowling aimed at the stumps or the pads, and as a standard means of taking a single to rotate the strike. Also common against a bowler swinging the ball in, where the glance works with the movement.`,
    commonMistakes: `- Playing it too early, so it becomes a flick or a leading edge.
- Playing it too square, into a fielder.
- Attempting it when a leg slip or leg gully is in place.`,
    takeaways: `- A fine deflection behind square on the leg side, using the ball's pace.
- One of the safest and most economical scoring shots.
- Exposed mainly to the glove through to the keeper and to leg slip.`,
    related: ['flick', 'paddle-sweep', 'fine-leg', 'leg-slip', 'strike-rotation', 'playing-swing'],
    order: 230,
  }),

  battingTechnique({
    slug: 'upper-cut',
    title: 'Upper Cut',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'A cut played deliberately upwards, sending a short, wide ball over the slips towards third man.',
    explanation: `The upper cut is a cut hit **over** the infield rather than along the ground. The batter takes a short, wide ball and steers or cuts it high over the slip cordon, towards third man.

It is a deliberate use of pace: the batter is not trying to overpower a fast bowler but to redirect the ball into the vacant region behind the slips, where a fast bowler's field is usually thin.

It has become a standard limited-overs shot because a bouncer or short wide ball, previously a ball simply to avoid, is now a scoring opportunity.`,
    footwork: `Convention: the batter gets inside the line, stays tall rather than getting down, and cuts upwards with a high bat and open face, guiding the ball over the cordon rather than hitting through it.

Because the shot uses the ball's pace, it is described as needing timing rather than force, and it works better against genuinely fast bowling than against medium pace.`,
    scoringArea: `Over the slips and behind square on the off side: third man and deep point.`,
    scoringAreaData: fullFieldSetting(
      ['third-man', 'fly-slip', 'deep-point', 'gully', 'first-slip'],
      'The upper-cut region: over the slips towards third man.',
    ),
    risk: `Moderate to high, and it depends entirely on the field.

**Caught at third man**, if a fielder is posted deep behind square.

**Caught in the cordon**, if the shot does not get enough height and goes to gully or third slip.

**Glove or top edge** to the keeper, if the ball is higher or faster than judged.

The shot's viability is therefore a direct function of whether the captain has covered third man, which is why fast bowlers now routinely post one in white-ball cricket.`,
    whenYouWillSeeIt: `Against short, wide fast bowling in limited-overs cricket, and occasionally in Tests from a batter countering a bouncer plan. Rare against spin, since it needs pace to work.`,
    commonMistakes: `- Playing it when third man is posted deep.
- Not getting enough height, so the ball carries to the cordon.
- Attempting it against a ball not wide enough, bringing the stumps into play.`,
    takeaways: `- A cut hit upwards over the slips towards third man.
- Uses the bowler's pace rather than fighting it.
- Viability depends on whether third man is covered.`,
    related: ['cut-shot', 'square-cut', 'bouncer', 'third-man', 'fly-slip', 'ramp-shot'],
    order: 240,
  }),

  battingTechnique({
    slug: 'ramp-shot',
    title: 'Ramp Shot',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'A shot that ramps the ball over the keeper or slips using an angled bat and the ball’s own pace.',
    explanation: `The ramp shot uses the bat as a **ramp**: the batter presents an angled face under or behind the ball and lets its pace carry it over the wicketkeeper or the slip cordon, into the vacant area straight behind the stumps.

It is one of the modern innovations of limited-overs batting, and its logic is entirely about geography: the region directly behind the wicket is the hardest for a captain to protect, because posting fielders there means removing them from somewhere more productive.

It overlaps with the **scoop**, and usage of the two names is inconsistent; broadly, a ramp is played standing more upright and steers the ball behind square, while a scoop is played from a lower position and goes straighter over the keeper.`,
    footwork: `Convention, and this is a shot with no settled orthodoxy: the batter gets into line, stays balanced, and angles the bat face upwards and back, deflecting rather than hitting.

Because the shot depends on the ball's pace, it works against fast bowling and full-length deliveries and does not work against slow bowling, where there is no pace to redirect.`,
    scoringArea: `Behind the wicket: over the keeper, over the slips, and down to third man or fine leg.`,
    scoringAreaData: fullFieldSetting(
      ['third-man', 'fine-leg', 'fly-slip', 'first-slip', 'wicketkeeper'],
      'The ramp region: behind the wicket, over the keeper and the slips.',
    ),
    risk: `High, and of an unusual kind: the shot is played to a ball that is often heading for the stumps, with a bat that is not in a position to defend them.

**Bowled or LBW**, if the ball is not where the batter premeditated.

**Caught behind**, if the deflection is mistimed and carries to the keeper or a catcher.

**Physical risk**, since some versions require the batter to get their head close to the line of a fast, full ball.`,
    whenYouWillSeeIt: `Death overs of T20 and ODI cricket, especially against a yorker or wide-yorker plan, where the ramp is one of very few shots available. It is a specific counter to a bowler bowling full and straight with the field spread.`,
    commonMistakes: `- Attempting it against slow bowling, where there is no pace to use.
- Premeditating against a bowler who then changes length.
- Getting the head into the line without control, which is dangerous as well as ineffective.`,
    takeaways: `- Uses an angled bat to ramp the ball over the keeper or slips.
- Attacks the one region a captain cannot easily protect.
- Needs pace to work, and carries real risk of being bowled.`,
    related: ['scoop', 'upper-cut', 'wide-yorker', 'yorker', 'death-overs-batting', 'third-man'],
    order: 250,
  }),

  battingTechnique({
    slug: 'scoop',
    title: 'Scoop',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'A shot that scoops a full, fast ball over the wicketkeeper’s head from a low position.',
    explanation: `The scoop is played by getting low, sometimes almost kneeling, and scooping a full-length fast delivery **straight over the wicketkeeper's head**.

Its purpose is the same as the ramp's: to score in the area directly behind the wicket that no field can cover. Where the ramp steers the ball behind square, the scoop sends it straighter, and it is generally played from a lower position and to a fuller ball.

It is closely associated with the yorker: a bowler aiming at the batter's feet is providing exactly the full, fast ball a scoop needs, which makes the shot a specific answer to death bowling.`,
    footwork: `Convention, and again there is no settled orthodoxy: the batter gets low and into the line of the ball, presenting the bat face upwards beneath the ball's path, and uses the pace to lift it over the keeper.

Some batters play it with the front knee down, some from a squat, and some by falling away slightly. What is common is getting low enough to get under a ball at ankle or shin height.`,
    scoringArea: `Straight behind the wicket: over the keeper, towards fine leg and third man.`,
    scoringAreaData: fullFieldSetting(
      ['wicketkeeper', 'fine-leg', 'third-man', 'long-leg', 'fly-slip'],
      'The scoop region: straight over the keeper behind the wicket.',
    ),
    risk: `Among the highest in cricket, on two axes.

**Dismissal.** The batter is getting low and angling the bat under a ball heading for the base of the stumps. A misjudgement is bowled, LBW, or caught behind.

**Physical.** The shot puts the batter's head and body close to the line of a fast, full delivery, and getting it wrong can mean being hit.

It is nonetheless played regularly, because at the death of a limited-overs innings the alternative to a high-risk shot is often no runs at all.`,
    whenYouWillSeeIt: `The last few overs of T20 and ODI innings, above all against yorkers and wide yorkers. It is close to absent from Test cricket.`,
    commonMistakes: `- Attempting it against a ball that is not full enough.
- Premeditating against a bowler who bowls short instead.
- Getting into position too early, letting the bowler adjust.`,
    takeaways: `- Scoops a full, fast ball over the keeper from a low position.
- A specific counter to yorker-length death bowling.
- Very high risk, both of dismissal and of physical injury.`,
    related: ['ramp-shot', 'yorker', 'wide-yorker', 'death-overs-batting', 'death-bowling'],
    order: 260,
  }),

  battingTechnique({
    slug: 'switch-hit',
    title: 'Switch Hit',
    category: 'batting',
    alsoIn: ['laws-and-rules'],
    difficulty: 'advanced',
    ruleSensitive: true,
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    summary:
      'Reversing the hands and stance completely before the ball arrives, batting as the opposite-handed batter.',
    explanation: `A switch hit is the most complete of the improvised shots: the batter **swaps their grip and their stance entirely** as the bowler is delivering, so that a right-hander plays the shot as a left-hander.

It is not a reverse sweep. A reverse sweep keeps the stance and reverses the hands; a switch hit reverses everything, so the batter is genuinely batting the other way round.

The purpose is to invert the field. A captain has set fielders for a right-hander; a switch hit turns the off side into the leg side, and the boundary the batter is now hitting towards is the one nobody is protecting.`,
    footwork: `There is no coaching orthodoxy, because very few players can do it. What it requires is the ability to change grip and stance in the fraction of a second available and still hit the ball, which is why it is largely limited to a handful of batters.

The switch is usually made very late, since making it early gives the bowler and captain time to respond.`,
    scoringArea: `Whichever side the batter has switched to attack, which is by definition the under-protected one.`,
    risk: `Very high, and it includes a rule dimension the other improvised shots do not.

**Under the Laws**, a batter may switch: the shot is legal. What matters is the interaction with the **LBW** and **wide** Laws, both of which are judged relative to the striker's stance. The Laws provide that the striker's off and leg sides are determined by their stance **at the moment the bowler begins their run-up**, so a batter who switches afterwards is still judged as their original handedness for LBW and wides. That is a genuine risk: a ball pitching outside what is now the batter's leg side may still be a legitimate LBW.

Beyond that, the ordinary risks of playing a cross-batted shot with your weaker hands apply, and they are large.

**The bowler's protection.** A bowler must inform the umpire if they change their arm or side of the wicket, and the batter is told. A batter switching hands has no equivalent obligation, which has been a recurring point of debate about the shot's fairness. The MCC has considered it repeatedly and the shot remains legal.`,
    whenYouWillSeeIt: `Rarely, and mostly in T20 cricket from a small number of players. It is more often threatened than executed: even the movement can force a captain to keep the field symmetrical, which is a gain in itself.`,
    commonMistakes: `- Switching too early, letting the bowler adjust.
- Forgetting that LBW is judged on the original stance.
- Attempting it without the field actually being skewed.`,
    takeaways: `- A complete reversal of grip and stance, batting as the other-handed batter.
- Legal, but LBW and wides are judged on the stance at the start of the run-up.
- Inverts the field, which is the entire purpose.
- Genuinely rare and very high risk.`,
    related: ['reverse-sweep', 'field-setting', 'lbw', 'wide', 'crease-rules'],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Laws 22, 36 (Wide ball; LBW: off and leg side)' }],
    order: 270,
  }),

  // ── Batting concepts ─────────────────────────────────────────────────────
  tactic({
    slug: 'playing-late',
    title: 'Playing Late',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'Meeting the ball as close to the body and as late as possible, so movement has finished before contact.',
    explanation: `Playing late means letting the ball travel as far as possible before playing it, meeting it under the eyes rather than reaching out in front.

The reason is straightforward: **movement takes time to happen**. A ball that is swinging or turning is still deviating during its flight and immediately after pitching. A batter who plays the ball early is playing it while it is still moving; one who plays it late is playing it after it has largely finished.

It is the single most consistent difference described between batters who cope with moving balls and batters who do not.`,
    howItWorks: `Playing late requires three things, which is why it is difficult.

**Balance**, because a batter falling over cannot wait.

**A short, controlled bat path**, because a big swing has to start early.

**Trust**, because waiting feels like being late, and the instinct under pressure is to reach for the ball.

The consequence is visible: a batter playing late appears to have more time, which is the standard compliment paid to batters in form. They do not have more time; they are using the time better.`,
    tradeoffs: `Playing late reduces risk against movement but costs **power and reach**. A ball played late and under the eyes cannot be driven as hard as one met in front, and a batter playing very late gives up some scoring options in front of square.

In T20 cricket that trade often runs the other way: a batter needs to hit through the line, which means committing earlier and accepting the risk against movement. So playing late is not a universal virtue: it is the correct response to a moving ball and a wrong one when the priority is bat speed.`,
    whenYouWillSeeIt: `Against a new ball, against swing and seam, and against spin on a turning pitch. Batters explicitly talk about "playing later" as a correction after being caught behind repeatedly.`,
    misunderstandings: `**"Playing late means being slow."** It means contact happens closer to the body and later in the ball's flight, from a bat that started moving on time.

**"Playing late is always better."** It sacrifices power, which matters in limited-overs cricket.`,
    takeaways: `- Contact as late and as close to the body as possible.
- Lets swing and turn finish before the bat commits.
- Requires balance and a short bat path.
- Trades power for safety, so it is situational rather than universal.`,
    related: [
      'soft-hands',
      'balance',
      'timing',
      'playing-swing',
      'playing-against-spin',
      'defensive-shot',
    ],
    order: 280,
  }),

  battingTechnique({
    slug: 'soft-hands',
    title: 'Soft Hands',
    category: 'batting',
    difficulty: 'intermediate',
    summary: 'Relaxing the grip at contact so the ball drops rather than rebounding to a catcher.',
    explanation: `Soft hands means loosening the grip and giving with the ball at the moment of contact, so that the ball's energy is absorbed rather than returned.

The purpose is specific and defensive: an edge or a bat-pad deflection played with soft hands **drops short of the fielder**, while the same contact with hard hands carries to slip, gully or short leg.

It is one of the very few batting techniques whose entire value is in changing the outcome of a mistake rather than in executing a shot well.`,
    footwork: `Convention: the bottom hand's grip is relaxed at contact, the wrists give slightly, and the bat is allowed to be pushed back by the ball rather than driven through it. The top hand retains control of the bat's face.

Coaches describe the feeling as "catching the ball with the bat" or as playing with "dead hands", both teaching images rather than mechanical descriptions.`,
    scoringArea: `None. Soft hands is not a scoring technique, and a batter using it is accepting no run in exchange for a lower chance of being caught.`,
    risk: `It reduces risk rather than creating it, with one exception: a ball played too softly can dribble back towards the stumps, and against spin a very soft-handed defensive shot occasionally rolls onto the wicket.

There is also a scoring cost. A batter playing everything with soft hands will not score, which is why the technique is applied selectively to the balls most likely to produce an edge.`,
    whenYouWillSeeIt: `Against a new ball outside off stump, against spin with close catchers in, and generally early in an innings before a batter has assessed the conditions.

It is most visible in the negative: a batter caught at slip off a firm-handed push is described as having played with hard hands, and it is a standard piece of post-dismissal analysis.`,
    commonMistakes: `- Hard hands to a ball outside off with a cordon in place.
- Playing so softly that the ball rolls back onto the stumps.
- Using soft hands when the shot should have been a leave.`,
    takeaways: `- Grip relaxed at contact so the ball drops rather than carrying.
- Changes the outcome of an edge, not the quality of the shot.
- Applied selectively, since it forgoes runs.`,
    related: [
      'defensive-shot',
      'playing-late',
      'forward-defence',
      'slip',
      'short-leg',
      'leaving-the-ball',
    ],
    order: 290,
  }),

  tactic({
    slug: 'leaving-the-ball',
    title: 'Leaving the Ball',
    category: 'batting',
    difficulty: 'intermediate',
    summary:
      'Deliberately not playing at a delivery, which is a skill rather than an absence of one.',
    explanation: `Leaving the ball means letting a delivery pass without offering a shot at all, usually by lifting the bat and hands out of its path.

It is one of the defining skills of red-ball batting, and it is genuinely a skill rather than a default. To leave well, a batter has to judge in a fraction of a second that the ball will neither hit the stumps nor need to be played, and then resist the reflex to play at it.

The economics are simple: a ball outside off stump that the batter leaves cannot get them out, except in the rare case of a delivery they misjudge onto the stumps. The same ball played at can get them caught behind.`,
    howItWorks: `Two forms.

**The straightforward leave**, hands high and bat vertical, for a ball comfortably outside off.

**The late leave**, where the batter shapes to play and then withdraws the bat at the last moment. This is harder and more valuable, because it forces the bowler to keep bowling at a line the batter has shown they will play at, and because it is the response to a ball that has moved further than expected.

The tactical function matters as much as the defensive one. A batter leaving well forces the bowler to **straighten their line**, which brings the stumps into play and offers scoring options. A batter who plays at everything lets a bowler bowl the same channel indefinitely.`,
    tradeoffs: `The cost is scoring. A batter who leaves a lot scores slowly, which is acceptable in a Test and often not in a limited-overs match. In T20 a leave is close to a wasted delivery, so the calculation inverts entirely.

There is also a judgement risk: leaving a ball that comes back and hits the stumps is a dismissal with no shot offered, which is the most embarrassing way to be bowled and a real cost of leaving on a seaming pitch.`,
    whenYouWillSeeIt: `Early in a Test innings against the new ball, particularly in England, Australia and New Zealand where the ball moves. A well-known feature of opening batting is a first hour in which a batter may leave a third of the deliveries they face.`,
    misunderstandings: `**"Leaving is passive."** It is an active choice that shapes what the bowler can do next.

**"You should leave everything outside off."** Only what will not hit the stumps and does not need playing. Leaving a ball that comes back is a dismissal.

**"Leaving is only for Test cricket."** It is rarer in T20 but not absent: a batter will leave a wide ball they cannot reach rather than chase it.`,
    takeaways: `- Deliberately not playing at a ball, usually outside off stump.
- A ball left cannot get you caught behind.
- Forces the bowler to straighten their line.
- Costs scoring, so it is format-dependent.`,
    related: [
      'defensive-shot',
      'corridor-of-uncertainty',
      'playing-swing',
      'soft-hands',
      'outside-edge',
      'batting-tempo',
    ],
    order: 300,
  }),

  tactic({
    slug: 'batting-outside-the-crease',
    title: 'Batting Outside the Crease',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'Standing forward of the popping crease to change the effective length of the bowling.',
    explanation: `A batter is not required to stand behind the popping crease. Standing a foot or two down the pitch is entirely legal, and it changes the geometry of every delivery.

The effect is to make the bowler's **length shorter than intended**. A ball pitched on a good length arrives at a batter standing forward as a fuller ball, easier to drive and with less distance in which to swing or turn after pitching.

It is most common against spin, where the aim is to reduce the turn, and against a bowler getting the ball to move late, where the aim is to meet it before it has finished moving.`,
    howItWorks: `Three consequences follow, and a batter has to accept all three.

**The good length disappears.** What was awkward becomes drivable.

**Less time.** Standing forward reduces the time available to react, which is why the tactic is used far more against spin than against genuine pace.

**Stumping and LBW exposure.** A batter outside their crease can be stumped if they miss, and their pads are further down the pitch, which changes the LBW geometry: impact further from the stumps generally reduces the chance of an LBW being upheld, and under DRS an impact a long way down the pitch may be treated as umpire's call.

The bowler's counter is to bowl **shorter and quicker**, or to have the keeper come up to the stumps to threaten a stumping.`,
    tradeoffs: `It is a genuine trade rather than a free gain: the batter buys a better length and pays with reaction time and the risk of being stranded outside their ground. Against a spinner turning it sharply the trade usually favours the batter; against a quick bowler it rarely does.`,
    whenYouWillSeeIt: `Against spin on a turning pitch, and against slow-medium bowling. Also used by batters against a bowler whose length is consistently good, as a way of disrupting it without having to take a risk with a shot.`,
    misunderstandings: `**"Batting outside the crease is against the Laws."** It is entirely legal.

**"It only helps against spin."** It is used against slower pace bowling too, though rarely against genuine fast bowling.

**"You cannot be LBW outside the crease."** You can. The impact point changes the geometry but does not remove the possibility.`,
    takeaways: `- Legal, and it makes the bowler's length effectively fuller.
- Reduces the distance over which spin and swing can act.
- Costs reaction time and exposes the batter to stumping.
- Mainly a counter to spin.`,
    related: [
      'depth-of-the-crease',
      'crease-rules',
      'playing-against-spin',
      'stumped',
      'batters-ground',
      'standing-up',
    ],
    order: 310,
  }),

  tactic({
    slug: 'depth-of-the-crease',
    title: 'Using the Depth of the Crease',
    category: 'batting',
    difficulty: 'advanced',
    summary:
      'Moving back towards the stumps to buy time and change the effective length, the mirror of batting forward.',
    explanation: `Using the depth of the crease means going **back** as far as the stumps allow, rather than forward, in order to give yourself more time.

The effect is the opposite of standing forward: a good-length ball becomes effectively **shorter**, because the batter has increased the distance between the ball's pitching point and the bat. That gives more time to watch the ball and more room to play it off the back foot, particularly square of the wicket.

Batters described as "having time" against fast bowling are frequently using the depth of the crease.`,
    howItWorks: `Two gains and two costs.

**Gains.** More time to see the ball, and a shorter effective length that opens up back-foot scoring shots square of the wicket.

**Costs.** The stumps are behind you, so a **hit wicket** becomes possible, and a ball that skids on low is more likely to be bowled or trap you LBW because you are further back and playing from a position where the bat comes down later.

Against a **yorker** it is a real vulnerability: a batter deep in the crease has less room to dig out a ball at their feet, which is one reason death bowlers aim there.`,
    tradeoffs: `The trade against standing forward is symmetrical. Forward buys a fuller length and costs time; back buys time and costs the protection of the stumps and the ability to smother movement close to the pitch of the ball.

Which to choose depends on what is threatening: movement off the pitch argues for forward, pace and bounce argue for back.`,
    whenYouWillSeeIt: `Against fast bowling, and particularly against short-of-a-length bowling where going back opens up the cut and the pull. Also against a bowler getting steep bounce, where playing from deep in the crease lets the batter play the ball under the eyes.`,
    misunderstandings: `**"Going back is defensive."** It opens up back-foot scoring shots and is frequently an attacking choice.

**"You have more time if you stay still."** Where the batter stands changes the effective length, so movement backwards genuinely creates time.`,
    takeaways: `- Moving back makes the bowler's length effectively shorter and buys time.
- Opens back-foot scoring shots square of the wicket.
- Exposes the batter to hit wicket and to the yorker.
- The mirror of batting outside the crease.`,
    related: [
      'batting-outside-the-crease',
      'back-foot-defence',
      'pull-shot',
      'cut-shot',
      'yorker',
      'hit-wicket',
    ],
    order: 320,
  }),

  tactic({
    slug: 'playing-against-spin',
    title: 'Playing Against Spin',
    category: 'batting',
    alsoIn: ['spin-bowling', 'tactics-and-strategy'],
    difficulty: 'intermediate',
    summary:
      'The methods available against a turning ball, and why doing nothing is the worst of them.',
    explanation: `Facing spin is a different problem from facing pace. The ball arrives slowly enough to see, and the danger is not reaction time but **deviation**: a ball that turns after pitching means the bat's line is wrong, and the slow pace gives the ball time to turn a long way.

The overarching principle is that a batter must choose a method rather than react. Against pace, reacting is the whole job. Against spin, a batter standing still in the crease and playing at the ball from there is choosing the worst available option, because it maximises the distance over which the ball can turn.`,
    howItWorks: `The methods, roughly in order of how often they are used.

**Get to the pitch of the ball.** Forward far enough that the ball is met almost as it lands, so it has little distance in which to turn. The safest option against a ball turning sharply.

**Get right back.** Play the ball off the back foot with maximum time, cutting or working it square. Effective against a spinner who is bowling shorter.

**Use the feet.** Advance down the pitch to meet the ball before it pitches, converting a good length into a half-volley. Highest reward and carries the stumping risk.

**Play with the spin.** Hit in the direction the ball is turning rather than against it, since a leading edge or an inside edge is the usual punishment for hitting against the turn.

**Sweep.** Take the ball on with a horizontal bat, which works against a length that offers nothing else and takes the turn largely out of play.

**Use the crease.** Stand outside it to shorten the effective length.

What all these share is a refusal to play from a static position at the ball's mercy.`,
    tradeoffs: `Each method costs something. Getting forward exposes the batter to the ball that goes straight on and to bat-pad catches. Using the feet exposes a stumping. Sweeping exposes LBW and the top edge. Playing back against a ball that is full enough risks being trapped in front.

There is no correct universal answer, and the same batter will use different methods against the same bowler in different conditions.`,
    formatDifferences: `In Test cricket the emphasis is on survival methods and on scoring only where it is safe: getting forward, playing with the spin, and accepting long periods without runs.

In T20 the emphasis inverts. A spinner bowling four overs must be attacked, so the sweep, the slog sweep and using the feet dominate, and batters accept the stumping and caught-in-the-deep risks that go with them.`,
    misunderstandings: `**"Just play the line."** The line is exactly what a turning ball changes.

**"Sweeping is reckless."** It is one of the highest-percentage methods on a turning pitch, and refusing to score is its own risk.

**"You should always come down the pitch."** It is the highest-risk method and depends on the bowler's pace, the keeper's position and the batter's ability to read length.`,
    takeaways: `- The problem is deviation, not reaction time.
- Get forward, get back, use the feet, play with the spin, sweep, or use the crease.
- Every method has a specific cost.
- Standing still in the crease is the worst option.`,
    related: [
      'spin-bowling',
      'sweep',
      'footwork',
      'batting-outside-the-crease',
      'off-break',
      'leg-break',
      'stumped',
    ],
    order: 330,
  }),

  tactic({
    slug: 'playing-swing',
    title: 'Playing Swing',
    category: 'batting',
    alsoIn: ['pace-bowling'],
    difficulty: 'intermediate',
    summary: 'How a batter survives and scores against a ball that is moving in the air.',
    explanation: `A swinging ball moves during its flight, so the line the batter picks up early is not the line the ball arrives on. Everything about playing swing follows from that single fact.

The general approach has two halves: **reduce the consequences of being wrong about line**, and **make the bowler bowl a different line**.`,
    howItWorks: `The methods.

**Play late and close to the body.** The ball has finished moving by the time the bat arrives, and contact under the eyes means a beaten shot is less likely to reach the edge.

**Leave well.** A ball swinging away outside off can be left entirely, which costs nothing and forces the bowler to straighten. Leaving is the primary weapon against outswing.

**Cover the stumps.** Against inswing, getting the front pad and bat in line protects against bowled and LBW.

**Get forward where possible.** A ball met closer to its pitching point has swung for less time after pitching, though against swing the gain is smaller than against seam movement, since swing happens before the bounce.

**Soft hands.** An edge that drops short of the cordon is a dot ball rather than a dismissal.

**Play straight.** A bat coming down straight covers a wider range of lines than one coming across.`,
    tradeoffs: `Everything that makes a batter safe against swing makes them slower. Leaving, playing late and playing straight all reduce scoring opportunities, and in limited-overs cricket that cost has to be weighed against the shorter time swing is available: an ODI new ball swings for ten overs of a fifty-over innings, so surviving it is usually worth more than attacking it.

Against **reverse swing** late in an innings, the same methods apply but the direction is inverted, and the danger is greater because the ball is often full and fast and heading for the stumps.`,
    whenYouWillSeeIt: `Against a new ball in every format, in overcast or humid conditions traditionally though not reliably associated with more swing, and in the death overs of a red-ball innings when the ball reverses.`,
    misunderstandings: `**"Watch the ball harder."** A swinging ball defeats prediction, not vision. The response is method, not concentration alone.

**"Get forward to counter swing."** Getting forward helps most against **seam movement** off the pitch. Swing has already happened before the bounce, so playing late matters more.

**"You can always pick which way it is going."** Batters routinely cannot, especially with reverse swing, which is why the safe methods exist.`,
    takeaways: `- The line picked up early is not the line that arrives.
- Play late, leave well, cover the stumps, play straight, use soft hands.
- Safety costs scoring, which is a format-dependent trade.
- Getting forward helps less against swing than against seam.`,
    related: [
      'swing-bowling',
      'conventional-swing',
      'reverse-swing',
      'leaving-the-ball',
      'playing-late',
      'soft-hands',
      'corridor-of-uncertainty',
    ],
    order: 340,
  }),

  tactic({
    slug: 'playing-short-pitched-bowling',
    title: 'Playing Short-pitched Bowling',
    category: 'batting',
    alsoIn: ['pace-bowling'],
    difficulty: 'intermediate',
    summary:
      'The options against a ball at the body, and the fact that every one of them is a decision under a second.',
    explanation: `Short-pitched fast bowling presents a batter with a ball arriving at chest or head height, quickly, at their body. It is the only situation in cricket where physical self-protection and run-scoring are the same decision.

There are four responses, and a batter has to choose one in well under a second.

**Duck or sway.** Get out of the way. No runs, no risk beyond misjudging the height.

**Defend or fend.** Play it down with a controlled bat or take it on the body deliberately. Low reward, and the fend is what gully and short leg exist for.

**Attack in front of square: the pull.** Highest-percentage attacking option against a ball around chest height.

**Attack behind square: the hook or upper cut.** Higher risk, and the field is often set for both.`,
    howItWorks: `What separates batters who handle it from those who do not is usually described in terms of two things.

**Getting inside the line.** Moving the head and body inside the ball's path, so the ball passes outside the shoulder rather than at the chest. This makes ducking, swaying and attacking all easier, and it is the opposite of backing away towards the leg side.

**Deciding early enough to commit but late enough to be right.** A batter who decides to duck and finds the ball lower than expected is in trouble; one who decides to pull a ball that climbs gets a top edge.

**Equipment matters here in a way it does not elsewhere.** The helmet, the chest guard and the arm guard are what make the modern batter's willingness to stand up to the short ball possible at all, and the shot repertoire against short bowling changed materially after helmets became standard.`,
    tradeoffs: `Attacking the short ball converts a hostile plan into a scoring opportunity, and it is the fastest way to make a bowler abandon it. It also produces catches: the top edge from a pull or hook goes precisely where a captain bowling short has posted fielders.

Refusing to attack it is safe from dismissal and concedes the bowler their plan: a batter who only ducks will face short bowling all day and score nothing.`,
    whenYouWillSeeIt: `Against fast bowling on bouncy pitches, against a deliberate short-ball plan, and to lower-order batters where the physical challenge is the point.`,
    misunderstandings: `**"Ducking is cowardly."** It is the lowest-risk correct answer to a ball above chest height, and elite batters duck constantly.

**"Backing away gives you room."** It moves the head and destroys balance, and it is generally treated as the worst response.

**"Short-pitched bowling is unregulated."** Law 41 addresses dangerous and unfair short-pitched bowling, and some competitions limit bouncers per over.`,
    takeaways: `- Four options: duck, fend, pull, or hook and upper cut.
- Getting inside the line makes all of them easier.
- Attacking it is what stops the plan, and it feeds the field that is set for it.
- Protective equipment materially changed what is possible.`,
    related: [
      'bouncer',
      'short-ball',
      'pull-shot',
      'hook-shot',
      'upper-cut',
      'helmet',
      'short-ball-strategy',
    ],
    order: 350,
  }),

  tactic({
    slug: 'strike-rotation',
    title: 'Strike Rotation',
    category: 'batting',
    alsoIn: ['tactics-and-strategy'],
    difficulty: 'intermediate',
    summary: 'Taking singles to keep the score moving and to change which batter is facing.',
    explanation: `Strike rotation is the practice of taking singles regularly, rather than either blocking or attempting boundaries.

It does two things at once, and both are underrated.

**It scores.** A side taking a single off four balls an over adds four runs without risk from a shot. Across fifty overs that is a substantial total assembled from nothing.

**It changes who faces.** Every odd run swaps the striker, which lets a set batter take more of the strike, gets a struggling batter off it, and prevents a bowler from settling into a rhythm against one batter.

Its absence is what a "dot-ball problem" means: a side that cannot rotate the strike is forced into boundary attempts and loses wickets doing it.`,
    howItWorks: `The mechanics are running and placement.

**Placement into gaps.** A ball worked into the space between two ring fielders is a single almost regardless of the shot's quality, which is why nudging the ball into the leg side is such a productive habit.

**Running hard and calling clearly.** Most singles are available and declined, and most run outs come from the pair not agreeing.

**Turning ones into twos** where the boundary is long and the fielder is deep.

The tactical layer is who takes the strike. A batter with a match-up advantage against the bowler wants the strike; a batter who has just arrived may not.`,
    tradeoffs: `Running carries the risk of a run out, which is a wicket lost with no bowler involved. Hard running against good fielding sides produces run-out chances, and the calculation changes with the fielders' quality and the state of the game.

There is also a fatigue cost, which sounds trivial and is not: sustained hard running in heat measurably affects a batter's decision-making later in an innings.`,
    formatDifferences: `In **T20** rotation is a core skill, because dot balls are the most expensive thing a batter can produce and the boundary alternative is high-risk.

In **ODI** cricket the middle overs are largely a strike-rotation phase.

In **Test** cricket rotation matters less for scoring and more for protecting a partner and for denying a bowler a settled target.`,
    misunderstandings: `**"Singles are for batters who cannot hit boundaries."** Sides with the best rotation records are usually the ones scoring fastest, because rotation keeps the rate moving without risk.

**"Rotation is just running."** Placement into gaps is what makes the single available in the first place.`,
    takeaways: `- Regular singles score without shot risk and change who is facing.
- Placement into gaps matters as much as speed between wickets.
- Costs are run outs and fatigue.
- Central in T20 and ODI middle overs; more situational in Tests.`,
    related: [
      'running-between-wickets',
      'strike-farming',
      'dot-ball',
      'batting-tempo',
      'middle-overs-batting',
      'partnership',
    ],
    order: 360,
  }),

  tactic({
    slug: 'strike-farming',
    title: 'Strike Farming',
    category: 'batting',
    alsoIn: ['tactics-and-strategy'],
    difficulty: 'intermediate',
    summary:
      'Deliberately manipulating the strike so the better-placed batter faces most of the bowling.',
    explanation: `Strike farming is the deliberate management of who faces the bowling, usually so that a set or more capable batter takes as many deliveries as possible and their partner takes as few.

The classic case is a top-order batter with a **tail-end partner**. Left to chance, the strike alternates and the weaker batter faces half the bowling. Farmed properly, the better batter can face the great majority of it.`,
    howItWorks: `The mechanics are arithmetic applied to the over.

**Take a single off the last ball of an over.** The strike swaps, and because the bowling changes ends, the batter who just ran is on strike for the next over. So a single off the sixth ball keeps the good batter facing.

**Decline singles early in an over.** Refusing a single off the first or second ball keeps the strike rather than handing it over with four balls left.

**Take twos rather than ones** where possible, since an even number retains the strike.

**Hit boundaries early in the over** and single late.

The counter from the fielding side is equally deliberate: the captain spreads the field for the good batter to make singles hard to refuse and brings it in for the weak one, and the bowler may deliberately bowl wide of the weaker batter to deny them a single.`,
    tradeoffs: `Farming the strike sacrifices runs. Declining available singles costs the side the runs it declined, and playing for a single off the last ball rather than the best shot available is a compromise on every other delivery.

It also concentrates risk on one batter: if the set batter gets out while farming, the side has both lost their best batter and wasted the deliveries spent protecting the other.

And it can be counterproductive: a tail-end batter who never faces the bowling never settles, and there are situations where letting them play is the better option.`,
    whenYouWillSeeIt: `Whenever a good batter is with the last one or two wickets, in any format. Also in a tight limited-overs chase, where a side wants a specific batter facing the final over, and in Test cricket where a batter is protecting a nightwatchman or an injured partner.`,
    misunderstandings: `**"Strike farming is unsporting."** It is ordinary tactics, and the fielding side has its own counter-tactics.

**"It always works."** A good captain makes it very hard, and the arithmetic depends on getting a single off the right ball, which the bowler is trying to prevent.

**"It means never letting the weak batter face."** Usually it means minimising, not eliminating, and sometimes accepting a few balls is the price of a boundary.`,
    takeaways: `- Deliberately arranging who faces most of the bowling.
- A single off the last ball of an over retains the strike.
- Costs runs by declining singles and concentrates risk on one batter.
- The fielding side has explicit counters.`,
    related: [
      'strike-rotation',
      'tailender',
      'protecting-a-batter',
      'running-between-wickets',
      'field-setting',
      'nightwatchman',
    ],
    order: 370,
  }),

  tactic({
    slug: 'batting-tempo',
    title: 'Batting Tempo',
    category: 'batting',
    alsoIn: ['tactics-and-strategy'],
    difficulty: 'intermediate',
    summary:
      'The rate a batter chooses to score at, and the fact that it is a decision rather than a property.',
    explanation: `Tempo is how quickly a batter is trying to score at a given moment. It is not a fixed characteristic of a player: the same batter should have different tempos against the new ball, in the middle overs, and at the death.

Getting tempo right is largely about knowing **which resource is scarce**. If wickets are the constraint, a lower tempo is correct. If deliveries are the constraint, a higher one is.

A large share of poor batting decisions are tempo errors rather than technical ones: playing an aggressive shot when there was no need to score quickly, or blocking when the required rate has moved out of reach.`,
    howItWorks: `The inputs a batter is weighing:

**Deliveries remaining** against **runs required**, in a chase.

**Wickets in hand.** More wickets permits more risk; a side eight down usually cannot afford it.

**Conditions and the bowler.** Attacking the sixth bowler is cheaper than attacking the best one, so tempo is often varied bowler by bowler rather than over by over.

**Phase.** In limited-overs cricket the powerplay, middle overs and death overs each have a conventional tempo, and the field restrictions are what create the difference.

**Personal state.** A batter who has just arrived usually needs a few deliveries at lower tempo, and a set batter can accelerate immediately.`,
    tradeoffs: `The trade is direct and constant: **runs now against the probability of surviving to score later**. A batter accelerating early increases the chance of being out and the chance of a large score, which is the same trade a side makes when it decides its batting order.

The asymmetry worth noting is that the cost of scoring too slowly is often invisible until it is fatal: a side that needs 70 from four overs got there by declining risk earlier, and the decision that lost the match happened twenty overs before.`,
    formatDifferences: `In **Tests**, tempo can legitimately be near zero for long periods, and a batter scoring at 30 per 100 balls to save a match is doing their job.

In **ODIs**, tempo is phased: build, consolidate, accelerate.

In **T20**, tempo is high throughout and the only real question is how high, since even the powerplay has few deliveries to waste.`,
    misunderstandings: `**"Some batters are just slow."** Strike rate is a description of choices in a role, not a fixed trait, and most international batters can bat at several tempos.

**"Attacking is always braver."** Blocking out a session under pressure is at least as difficult a decision as attacking.

**"The required rate tells you the tempo."** It tells you the average needed; the wickets in hand and who is bowling decide when to take the risk.`,
    takeaways: `- Tempo is a decision, not a property of a player.
- It follows from which resource is scarce: wickets or deliveries.
- Wickets in hand, phase, and which bowler is on all shift it.
- Scoring too slowly is a real error, and often an invisible one until late.`,
    related: [
      'building-an-innings',
      'risk-management-batting',
      'strike-rate',
      'required-run-rate',
      'chase',
      'powerplay-batting',
    ],
    order: 380,
  }),

  // ── Batting roles ────────────────────────────────────────────────────────
  role({
    slug: 'opener',
    title: 'Opener',
    category: 'batting-roles',
    difficulty: 'beginner',
    aliases: ['Opening Batter', 'Opening Bat'],
    summary:
      'One of the two batters who start an innings, facing the newest ball and the best bowlers.',
    explanation: `The openers bat at numbers 1 and 2 and face the first delivery of the innings.

It is a distinctive job because of what they face: the **newest ball**, which swings and seams most; the **fastest, freshest bowlers**; and, in limited-overs cricket, the **powerplay**, when fielding restrictions make scoring easiest.

That combination makes opening simultaneously the hardest job in red-ball batting and one of the most rewarding in white-ball batting, which is why the role's requirements differ so sharply by format.`,
    responsibilities: `**In red-ball cricket:** survive the new ball, take the shine off it, and leave the middle order a less hostile situation. Leaving well, playing late and judging what to play at matter more than scoring quickly. An opener who bats through ninety minutes for 25 may have contributed more than the number four who later makes 60.

**In white-ball cricket:** exploit the powerplay. With only two fielders permitted outside the circle, boundaries are available, and an opener who scores at eight an over for six overs has given their side an advantage no middle-order batter can replicate.

**Both:** face the best bowling. Whatever the format, the opposition's best bowlers bowl at the openers.`,
    variesBy: `Enormously, and mostly by format.

A Test opener and a T20 opener are close to different jobs sharing a name: one is selected for their defensive method and temperament, the other for their ability to hit boundaries against a hard new ball with the field up. Some players do both; many cannot.

Within a format, teams also differ. Some pair a defensive opener with an aggressive one deliberately; some pick two of the same kind. Neither is standard.

Left-right combinations are frequently preferred because they disrupt a bowler's line and force field changes, but that is a preference rather than a rule.`,
    formatDifferences: `**Test:** survival and judgement. **ODI:** a balance, since the powerplay is followed by forty overs in which wickets still matter. **T20:** aggression, with the average opener's strike rate the primary selection criterion after basic competence.`,
    misunderstandings: `**"Openers are the best batters."** The best batter usually bats three or four. Opening is a specialist job.

**"Opening is the same in every format."** The required skills are close to opposite between Test and T20 cricket.

**"An opener who scores slowly has failed."** In a Test, an opener who occupies the crease against a moving ball has done the job.`,
    takeaways: `- Bat at 1 and 2, facing the newest ball and the best bowlers.
- Red-ball: survival and judgement. White-ball: exploit the powerplay.
- The Test and T20 versions of the role are almost different jobs.`,
    related: [
      'top-order-batter',
      'new-ball',
      'powerplay',
      'leaving-the-ball',
      'batting-order',
      'aggressor',
    ],
    order: 10,
  }),

  role({
    slug: 'top-order-batter',
    title: 'Top-order Batter',
    category: 'batting-roles',
    difficulty: 'beginner',
    summary:
      'A batter in the first three or four positions, expected to face the new ball or its immediate aftermath.',
    explanation: `The top order is conventionally positions 1 to 3, and often 1 to 4. It comprises the openers and the batters who follow them immediately.

What defines the group is that they will usually face **hard, relatively new ball** and the opposition's front-line bowlers. In a Test they are expected to bat for long periods; in limited-overs cricket they are expected to give the innings its platform or its momentum.

Most of a side's runs come from the top order in most formats, which is why sides invest their best batters there.`,
    responsibilities: `Bat long, or bat fast, depending on format and situation. Establish a platform that the middle order can build on, or an early scoring rate that the middle order can maintain.

In red-ball cricket the top order also carries a specific duty: **absorbing the new ball**. If the top three fail regularly, the middle order faces the new ball repeatedly, which is a structural problem no amount of middle-order form fixes.`,
    variesBy: `Where the top order ends and the middle order begins is not defined anywhere and teams use the terms loosely. Some describe 1 to 3 as the top order, some 1 to 4, and scorecards and analysts differ.

The number 3 position in particular is treated differently by different teams: some regard it as their best batter's place, others as a second opener's.`,
    formatDifferences: `In Tests, the emphasis is on batting time. In T20, top-order batters are often the side's highest strike-rate players, because the powerplay and the overs immediately after it are where scoring is cheapest.`,
    misunderstandings: `**"Top order means the best three batters."** It means the first three or four in the order, which is a position rather than a ranking.

**"The boundary between top and middle order is fixed."** It is a convention and it varies by team and by writer.`,
    takeaways: `- Conventionally positions 1 to 3 or 1 to 4.
- Faces the new ball or its immediate aftermath.
- Absorbing the new ball is a structural duty in red-ball cricket.
- The exact boundary with the middle order is not defined.`,
    related: ['opener', 'number-three', 'middle-order-batter', 'batting-order', 'new-ball'],
    order: 20,
  }),

  role({
    slug: 'number-three',
    title: 'Number 3',
    category: 'batting-roles',
    difficulty: 'intermediate',
    summary:
      'The position that can be required to bat in the first over or after a long opening stand, and often a side’s best batter.',
    explanation: `Number 3 is the position immediately after the openers, and it is unusual because the situation it produces is so variable.

A number 3 may walk in to face the second ball of the innings, with a new ball swinging and no runs on the board, or after a 150-run opening partnership on a flat pitch with the ball soft. Those are entirely different jobs, and the batter has to be equipped for both.

For that reason many teams place their **best or most technically complete batter** at 3, and several of the highest-scoring batters in Test history have batted there.`,
    responsibilities: `Be ready to open in effect, since an early wicket makes the number 3 a de facto opener against the new ball.

Bat long. In Test cricket the number 3 is often the batter a side expects to occupy the crease for the longest.

Set the tempo for the middle order, since the number 3 is usually at the crease during the transition from the new ball to the middle phase.`,
    variesBy: `Considerably by team philosophy. Some sides use 3 for their best batter; others use a second opener there to protect their best batter from the new ball, placing them at 4.

In T20 the position is often filled by an aggressive batter who can continue powerplay momentum, or by an anchor who stabilises after an early wicket, and those are opposite selections for the same slot.`,
    formatDifferences: `In Tests, technical completeness and stamina. In ODIs, a batter who can both rebuild and accelerate. In T20, either an aggressor or an anchor depending on the side's structure.`,
    misunderstandings: `**"Number 3 is a middle-order position."** It is conventionally top order, and it can involve facing the new ball.

**"The number 3 always has time to settle."** They may arrive in the first over.`,
    takeaways: `- Immediately after the openers, and may face the new ball.
- Often a side's best or most complete batter.
- The situation on arrival varies more than for any other position.`,
    related: ['top-order-batter', 'opener', 'middle-order-batter', 'anchor', 'batting-order'],
    order: 30,
  }),

  role({
    slug: 'middle-order-batter',
    title: 'Middle-order Batter',
    category: 'batting-roles',
    difficulty: 'beginner',
    summary:
      'A batter around positions 4 to 6, batting after the new ball and expected to handle both rebuilding and accelerating.',
    explanation: `The middle order is conventionally positions 4 to 6, or 4 to 7 in sides with a wicketkeeper batting there.

Its defining feature is **situational variety**. A middle-order batter may arrive at 20 for 3 against a moving ball, or at 250 for 2 with the innings needing acceleration. They may face spin in the middle overs, a reversing ball later, or a new ball if the top order has collapsed.

They are also usually the batters at the crease when the innings transitions, in either direction, which makes judgement of tempo a defining requirement.`,
    responsibilities: `**Rebuild** after top-order failure, batting with the tail in prospect and therefore with a duty to bat long.

**Accelerate** when the platform is set, since the middle order usually holds the strike during the overs where a side converts a good position into a large total.

**Handle spin.** The middle overs of a limited-overs innings, and much of a Test innings, are the spinners' territory, and middle-order batters face more of it than anyone else.

**Bat with the lower order**, which means strike farming and managing partnerships with weaker batters.`,
    variesBy: `More than any other group, because the role is defined by the situation rather than the position. The same batter at 5 will be asked to block on one day and to attack on another.

Team structures also vary: some sides bat their wicketkeeper at 6 or 7 and treat them as a middle-order batter; some bat an all-rounder there; some push a finisher up.`,
    formatDifferences: `In Tests, the middle order is where an innings is usually made large. In ODIs, positions 4 and 5 are increasingly asked to both rebuild and hit at the death. In T20, the distinction between middle order and finisher largely collapses, since there is no time for a separate consolidation phase.`,
    misunderstandings: `**"The middle order is where the weaker batters go."** Positions 4 and 5 are frequently a side's most valuable batters.

**"Middle-order batters have an easier job."** They face more spin, more varied situations and more responsibility for batting with the tail.`,
    takeaways: `- Conventionally 4 to 6, sometimes 4 to 7.
- Defined by situational variety rather than a fixed job.
- Faces most of the spin, and bats with the lower order.`,
    related: [
      'top-order-batter',
      'lower-order-batter',
      'finisher',
      'anchor',
      'playing-against-spin',
      'batting-order',
    ],
    order: 40,
  }),

  role({
    slug: 'lower-order-batter',
    title: 'Lower-order Batter',
    category: 'batting-roles',
    difficulty: 'beginner',
    summary: 'A batter around positions 7 to 9, usually an all-rounder or a bowler who can bat.',
    explanation: `The lower order is conventionally positions 7 to 9: after the specialist batters, before the genuine tail.

Most lower-order batters are **bowlers who bat usefully** or **all-rounders**. Their batting is a secondary skill, but a valuable one: runs from 7, 8 and 9 are among the strongest predictors of a side winning a Test, because they turn a competitive total into a large one and because they come when the opposition believes the innings is nearly over.`,
    responsibilities: `**Bat with the specialists.** A lower-order batter arriving at 200 for 6 is often batting with a set top-order batter, and their job may be simply to occupy an end.

**Score quickly.** Lower-order batters frequently bat when a declaration or an innings end is approaching, so a high strike rate is more valuable than a high average.

**Bat with the tail.** From 8 downwards the batter is usually the senior partner in the partnership, which inverts the usual strike-farming logic.

**In limited-overs cricket**, the lower order is often where the finishers are, so hitting ability at 7 and 8 is a specific selection consideration.`,
    variesBy: `Very widely. Some sides have genuine all-rounders at 7 and 8 who would bat in the top six of a weaker team; others have a clear cliff after 6.

The distinction between lower order and tail is not defined, and a side with a batting all-rounder at 8 has a materially different lower order from one with a specialist bowler there.`,
    formatDifferences: `In Tests, lower-order runs are a well-recognised difference between good and great sides. In T20, positions 7 and 8 are frequently power hitters and are central rather than peripheral.`,
    misunderstandings: `**"Lower-order runs are a bonus."** They correlate strongly with winning Test matches and are actively planned for.

**"Lower order and tail are the same."** The tail is conventionally the last two or three, who are not expected to score.`,
    takeaways: `- Conventionally 7 to 9, usually bowlers who bat or all-rounders.
- Lower-order runs are a strong predictor of Test success.
- Strike rate often matters more than average here.`,
    related: [
      'tailender',
      'all-rounder',
      'finisher',
      'middle-order-batter',
      'strike-farming',
      'batting-order',
    ],
    order: 50,
  }),

  role({
    slug: 'finisher',
    title: 'Finisher',
    category: 'batting-roles',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'A limited-overs batter selected to score very quickly at the end of an innings or to complete a chase.',
    explanation: `A finisher is a limited-overs specialist whose job is the **last few overs**: either maximising a total at the death, or getting a chase over the line.

The role exists because the death overs are a distinct skill environment. The field is spread, the bowlers are bowling yorkers, wide yorkers and slower balls, and the batter has very few deliveries. Scoring at ten or twelve an over against that is a specific ability, and it is not the same one that makes a good top-order batter.

Finishers are also asked to bat under a particular kind of pressure: their innings are short, their failures are highly visible, and their statistics are distorted by the situation.`,
    responsibilities: `**Score at a very high rate immediately**, without the luxury of settling in.

**Hit the bowler's best ball.** A finisher cannot wait for a poor delivery, since there may not be one, so they need shots against yorkers and slower balls: the ramp, the scoop, the slog sweep and the ability to hit straight.

**Close a chase.** Managing the arithmetic of a small target with few balls, deciding which bowler to attack, and farming the strike from a weaker partner.

**Absorb the last-over situation**, which is as much temperament as technique.`,
    variesBy: `The term is informal and applied loosely. Some sides use it for a number 6 or 7 who plays only in the last five overs; others use it for any middle-order batter with a high strike rate.

Its statistical footprint is also distinctive and easily misread: finishers accumulate not-outs, which inflates their **batting average** substantially, while their **strike rate** is depressed relative to what it would be if they faced only death overs from a set position.

Assessment of finishers is therefore one of the clearest cases in cricket where raw average and strike rate are inadequate and phase-specific numbers are needed.`,
    formatDifferences: `Essentially a T20 and ODI role. Test cricket has no equivalent, since there is no fixed end to an innings to finish.`,
    misunderstandings: `**"A finisher's average shows how good they are."** Not-outs inflate it heavily. The role needs phase-specific measurement.

**"Any hard hitter can finish."** Hitting a bad ball and hitting a well-executed wide yorker are different skills.

**"Finisher is a defined position."** It is an informal role description, and teams use it inconsistently.`,
    takeaways: `- A limited-overs specialist for the death overs and the end of a chase.
- Needs shots against yorkers and slower balls, not just power.
- Not-outs inflate the average, so phase data is needed to judge them.
- No Test equivalent.`,
    related: [
      'death-overs-batting',
      'chase',
      'batting-average',
      'scoop',
      'ramp-shot',
      'strike-farming',
      'phase-splits',
    ],
    order: 60,
  }),

  role({
    slug: 'anchor',
    title: 'Anchor',
    category: 'batting-roles',
    difficulty: 'intermediate',
    summary:
      'A batter who holds an innings together at a lower tempo while others attack, and a genuinely contested role.',
    explanation: `An anchor bats through an innings at a lower risk and lower tempo than their partners, providing continuity while others take the risks.

The logic is that an innings needs somebody in who understands the situation, keeps the strike rotating and is still there at the end, particularly if wickets fall around them.

It is worth saying plainly that the role is **contested**. Analytical work in T20 cricket has repeatedly questioned whether anchoring is valuable at all, on the grounds that consuming deliveries at a below-par rate transfers pressure to the other batters and costs more than the wickets it saves. Other analysts and many coaches maintain that the insurance an anchor provides against collapse is real and not captured by simple rate comparisons.

Both positions have serious support. Presenting either as settled would be wrong.`,
    responsibilities: `Bat through, or as far through as possible. Keep the strike rotating. Take the risks late rather than early. Manage the innings when wickets fall, and shepherd less experienced batters.`,
    variesBy: `A great deal, and its value varies with format.

In **Test cricket** the anchor role is close to uncontroversial: occupying the crease has intrinsic value because deliveries are effectively unlimited.

In **ODI cricket** it is broadly accepted for the middle overs, though with more scrutiny than previously.

In **T20** it is genuinely disputed, and the dispute is one of the live analytical arguments in the sport.`,
    formatDifferences: `The shorter the format, the weaker the case, because the scarcer deliveries become relative to wickets. This is the cleanest illustration in cricket of a role's value depending entirely on which resource is constrained.`,
    misunderstandings: `**"Every innings needs an anchor."** In T20 this is disputed by serious analytical work.

**"An anchor is a defensive batter."** The role as usually described involves accelerating late, not blocking throughout.

**"Anchor is a defined position."** It is an informal description of an approach, not a slot in the order.`,
    takeaways: `- Bats at lower risk and tempo while others attack.
- Uncontroversial in Tests, broadly accepted in ODIs, genuinely disputed in T20.
- The dispute turns on whether consumed deliveries cost more than saved wickets.`,
    related: [
      'aggressor',
      'batting-tempo',
      'building-an-innings',
      'middle-order-batter',
      'risk-management-batting',
      'strike-rate',
    ],
    order: 70,
  }),

  role({
    slug: 'aggressor',
    title: 'Aggressor',
    category: 'batting-roles',
    difficulty: 'intermediate',
    summary:
      'The batter in a pair taking the risks and scoring quickly, complementing a partner playing more conservatively.',
    explanation: `The aggressor is the counterpart to the anchor: the batter in a partnership who takes the attacking options, targets particular bowlers and scores at the higher rate.

The idea behind the pairing is **risk allocation**. If both batters attack, the chance of losing two quick wickets rises sharply; if neither does, the rate stalls. Splitting the roles means the side gets a scoring rate and retains a set batter if the aggressor fails.

Like the anchor, it is an informal description rather than a defined position, and it is usually assigned situationally rather than by selection.`,
    responsibilities: `Score quickly. Target the weaker bowlers and the favourable match-ups. Take the boundary options so the partner does not have to. Absorb the risk of the partnership.`,
    variesBy: `It is frequently **not a fixed assignment**. Two batters may swap roles within a partnership as one gets set or as bowlers change, and a batter who was anchoring can become the aggressor when a new batter arrives.

Team structures also differ: some sides explicitly plan aggressor and anchor pairings; others simply expect every batter to read the situation.`,
    formatDifferences: `In T20 nearly everyone is expected to be able to play the aggressor role at some point. In Tests it is more often a phase than a role: a batter attacks a spinner for two overs and then returns to accumulation.`,
    misunderstandings: `**"The aggressor is the better batter."** The roles are complementary, and which is which is usually situational.

**"Aggressor means reckless."** The role involves selecting which bowlers and which balls to attack, which is judgement rather than abandon.`,
    takeaways: `- Takes the attacking options while a partner plays conservatively.
- The point is allocating risk across a partnership.
- Usually situational and often swapped within an innings.`,
    related: [
      'anchor',
      'batting-tempo',
      'targeting-a-bowler',
      'matchups',
      'risk-management-batting',
      'partnership',
    ],
    order: 80,
  }),

  role({
    slug: 'pinch-hitter',
    title: 'Pinch Hitter',
    category: 'batting-roles',
    difficulty: 'intermediate',
    summary:
      'A lower-order batter promoted up the order to attack immediately, usually to exploit a powerplay.',
    explanation: `A pinch hitter is a batter, typically from the lower order, sent in earlier than their usual position with instructions to attack from the first ball.

The logic is to exploit a specific opportunity, most often a **powerplay** or a period against a particular bowler, using a batter whose dismissal costs the side relatively little. If they succeed, the side gains quick runs; if they fail, the specialist batters remain.

The term is borrowed from baseball, where it means something quite different, and its cricket usage dates largely to the one-day cricket of the 1990s.`,
    responsibilities: `Attack immediately, without a settling period. Exploit fielding restrictions. Accept a high probability of failure in exchange for the chance of a quick, valuable contribution.`,
    variesBy: `The concept has been substantially absorbed into normal practice. In modern T20 cricket most batters in the top six are expected to attack in the powerplay, so a dedicated pinch hitter is less distinctive than it was.

It also overlaps with other roles: a promotion of a hitter can equally be described as a match-up decision or as simply changing the batting order, and different commentators will use different terms for the same move.`,
    formatDifferences: `A limited-overs concept, and largely an ODI one historically. Rare as a described role in T20 because the whole order attacks, and absent from Test cricket.`,
    misunderstandings: `**"A pinch hitter is a specialist."** It is usually a bowler or lower-order batter given a specific instruction, not a selected specialism.

**"It is the same as in baseball."** In baseball a pinch hitter is a substitute; in cricket nobody is replaced, the order is simply changed.`,
    takeaways: `- A lower-order batter promoted to attack immediately.
- Exploits the powerplay with a batter whose wicket costs less.
- Largely absorbed into normal T20 practice.`,
    related: ['batting-order', 'powerplay', 'powerplay-batting', 'matchups', 'lower-order-batter'],
    order: 90,
  }),

  role({
    slug: 'nightwatchman',
    title: 'Nightwatchman',
    category: 'batting-roles',
    alsoIn: ['red-ball-concepts', 'terminology'],
    difficulty: 'intermediate',
    summary:
      'A lower-order batter promoted late in the day to protect a better batter until the next morning.',
    explanation: `A nightwatchman is sent in ahead of a specialist batter in the closing overs of a day's play in a multi-day match, so that if a wicket falls the better batter does not have to start their innings in difficult, tired, fading-light conditions.

The reasoning is that the last half-hour of a day is a bad time to begin an innings, and that a lower-order batter's wicket is worth less than the risk of losing a top-order batter for a handful of runs.

It is a Test and first-class concept only. Limited-overs cricket has no equivalent, since there is no overnight.`,
    responsibilities: `Survive until the close. Occupy the crease, decline risk, and get the side to the end of the day without losing another wicket.

If they survive to the next morning, they bat on, and a nightwatchman who makes a substantial score is a well-known feature of Test cricket.`,
    variesBy: `The tactic is **not universally endorsed**. Analysts and coaches disagree about whether it works, and there are two lines of criticism worth stating.

First, it uses a poor batter against the same difficult bowling, so the wicket may simply be lost anyway, and the specialist batter then arrives in the same conditions with one fewer wicket in hand.

Second, it can leave a good batter stranded at the other end or waste part of a session.

Sides accordingly differ in policy: some use one routinely, some never, and some decide by how many overs remain.`,
    formatDifferences: `Test and first-class only.`,
    misunderstandings: `**"A nightwatchman is a specialist role."** It is a job given to whichever lower-order batter is available and willing.

**"It always protects the better batter."** If the nightwatchman is dismissed, the better batter comes in anyway, which is the core criticism.

**"It is standard practice."** It is a contested tactic, used by some teams and rejected by others.`,
    takeaways: `- A lower-order batter promoted late in the day to shield a specialist.
- Multi-day cricket only.
- Genuinely contested: it can simply lose the wicket anyway.`,
    related: [
      'tailender',
      'lower-order-batter',
      'session',
      'batting-order',
      'protecting-a-batter',
      'test-cricket',
    ],
    order: 100,
  }),

  role({
    slug: 'tailender',
    title: 'Tailender',
    category: 'batting-roles',
    alsoIn: ['terminology'],
    difficulty: 'beginner',
    summary:
      'One of the last batters in the order, usually a specialist bowler not expected to score heavily.',
    explanation: `A tailender bats at the end of the order, conventionally at 9, 10 or 11. Collectively they are **the tail**.

They are almost always specialist bowlers selected for their bowling, and their batting ranges from competent to negligible. A side is described as having a "long tail" when its batting drops off early, which is a real structural weakness: the side effectively has fewer wickets in hand than the scoreboard suggests.

Tailenders nonetheless matter more than their averages imply. Runs from the tail come when a total is already competitive and demoralise a fielding side that thought the innings was finished, and a tail that can survive twenty overs while a set batter scores changes matches.`,
    responsibilities: `Support the batter at the other end, which usually means giving them the strike and surviving as few deliveries as possible.

Survive. A tailender who blocks for half an hour while a specialist scores has done their job entirely.

Occasionally, attack. Some tailenders are effective hitters and are given licence to swing, since their dismissal costs little.`,
    variesBy: `Enormously. Some tailenders are genuinely capable batters with first-class centuries; others are close to unable to defend. The term describes position rather than ability.

Sides also differ in how they use them: some instruct the tail to block and farm the strike, others to hit out, and which is right depends on the situation and the batter.`,
    formatDifferences: `In Tests, tail resilience is a well-recognised difference between sides, since a tail that adds fifty regularly is worth a great deal across a series. In T20, the tail rarely bats at all, so the weakness is largely hidden.`,
    misunderstandings: `**"Tailenders cannot bat."** Many can, and several have Test centuries.

**"Tail runs are irrelevant."** They correlate meaningfully with winning Test matches.

**"Tailender is an insult."** It describes a position in the order.`,
    takeaways: `- Positions 9 to 11, usually specialist bowlers.
- A long tail is a genuine structural weakness.
- Their main job is often to survive and give the strike away.
- Tail runs matter more than their averages suggest.`,
    related: [
      'tail',
      'lower-order-batter',
      'strike-farming',
      'nightwatchman',
      'batting-order',
      'bunny',
    ],
    order: 110,
  }),

  role({
    slug: 'all-rounder',
    title: 'All-rounder',
    category: 'batting-roles',
    difficulty: 'beginner',
    summary:
      'A player who contributes genuinely with both bat and ball, and the most valuable and most loosely defined role in cricket.',
    explanation: `An all-rounder is a player good enough at both batting and bowling to be selected for either.

The value is structural rather than sentimental: a side with an all-rounder effectively fields an extra batter or an extra bowler without giving up a place. That extra option is why all-rounders are disproportionately represented among the players who have changed the balance of teams.

The definition is loose, and deliberately so. There is no threshold in the Laws or in convention, and reasonable people disagree about who qualifies.`,
    responsibilities: `Bat in the top seven, or thereabouts, and bowl a meaningful share of overs. In practice this usually means batting at 6, 7 or 8 and bowling as a third, fourth or fifth bowler.

The specific value in limited-overs cricket is **flexibility**: an all-rounder can be used up the order or held back, and their overs can be spread through the innings or withheld, which gives a captain options a specialist does not.`,
    variesBy: `The most contested definition in cricket. Common informal tests include a batting average above the bowling average, or being worth a place in the side for either skill alone, and neither is authoritative.

The category also subdivides in practice:

- **Batting all-rounder**: primarily a batter who bowls usefully.
- **Bowling all-rounder**: primarily a bowler who bats usefully.
- **Wicketkeeper-batter**: sometimes counted as an all-rounder in the sense of filling two roles.

Format matters too: a T20 all-rounder may bowl only two overs and still be central, whereas a Test all-rounder needs to bowl long spells.`,
    formatDifferences: `In Tests, an all-rounder must be able to bowl twenty overs in a day, which is a high bar. In T20, four overs and a place in the top seven is enough, so the format has produced many more all-rounders than Tests ever did.`,
    misunderstandings: `**"An all-rounder is anyone who bats and bowls."** Almost every cricketer does both at some level; the term implies genuine competence in both.

**"There is a statistical definition."** There are conventions, none authoritative.

**"All-rounders are luxuries."** They are usually the players who allow a side's balance to work at all.`,
    takeaways: `- Genuine contributor with both bat and ball.
- Provides an extra batter or bowler without an extra place.
- The definition is genuinely contested, with several informal tests.
- The bar is much higher in Tests than in T20.`,
    related: [
      'lower-order-batter',
      'wicketkeeper-batter',
      'bowling-spell',
      'batting-order',
      'middle-order-batter',
    ],
    order: 120,
  }),

  role({
    slug: 'wicketkeeper-batter',
    title: 'Wicketkeeper-batter',
    category: 'batting-roles',
    alsoIn: ['fielding-and-wicketkeeping'],
    difficulty: 'intermediate',
    summary:
      'A wicketkeeper selected substantially for their batting as well as their keeping, now the norm rather than the exception.',
    explanation: `A wicketkeeper-batter keeps wicket and bats high enough in the order to be a genuine batting asset, usually between 5 and 7.

The role's rise is one of the clearest changes in modern cricket selection. For much of the sport's history the keeper was chosen almost entirely for their glovework, and their batting was a bonus. Since the 1990s the balance has shifted decisively: a side that picks a specialist keeper who cannot bat is giving up a batting place their opponents are using.

The trade is real, though. A keeper who drops catches costs wickets that no amount of batting recovers, and the debate about how much keeping quality to sacrifice for runs is a permanent feature of selection arguments.`,
    responsibilities: `Keep wicket for an entire innings, which in a Test means a hundred overs of concentration in full protective equipment, standing up to spin and back to pace.

Bat as a specialist. A keeper batting at 6 is expected to make runs like a middle-order batter, not like a bowler who bats.

In limited-overs cricket, frequently to **finish**, since keepers often bat in the death-overs positions.`,
    variesBy: `Where they bat differs widely: 5 and 6 for the strongest batting keepers, 7 for a more keeping-focused selection.

Team philosophy differs more. Some sides prioritise glovework and accept fewer runs, particularly where they have a spin-heavy attack and standing up to the stumps matters most. Others prioritise batting. Neither is standard practice and the arguments are ongoing.`,
    formatDifferences: `In Tests, keeping quality carries more weight, because a hundred overs of keeping to spin on a turning pitch is technically demanding and errors are costly. In T20, batting ability dominates, since twenty overs of keeping is less demanding and every batting place is scarce.`,
    misunderstandings: `**"Keepers have always batted."** Historically many were selected almost purely for keeping.

**"Batting is now more important than keeping."** It is a genuine trade-off that different teams resolve differently.

**"Wicketkeeper-batter is the same as all-rounder."** They fill two roles, but the second skill is keeping rather than bowling.`,
    takeaways: `- Keeps wicket and bats as a genuine specialist, usually 5 to 7.
- Now the norm; historically the keeper was picked for glovework alone.
- The trade between runs and keeping quality is unresolved and format-dependent.`,
    related: [
      'wicketkeeper',
      'wicketkeeping',
      'all-rounder',
      'middle-order-batter',
      'finisher',
      'standing-up',
    ],
    order: 130,
  }),
];
