import { club, definition, equipment, rule, shot, standard } from './golf-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';

/**
 * The bag, and every shot played with it.
 *
 * Two categories in one file because they are one subject: a wedge explainer
 * that does not describe a pitch and a pitch explainer that does not mention
 * loft are each half a page. The clubs come first, since the shot pages assume
 * the vocabulary.
 *
 * ## On distances
 *
 * Every yardage below is a range with the population it applies to stated. A
 * single number for "how far a 7 iron goes" is the most common falsehood in
 * golf instruction: the honest answer spans roughly 120 to 190 yards depending
 * on who is swinging, and a beginner who reads 165 and does not hit it 165
 * concludes they are doing something wrong.
 *
 * ## On technique
 *
 * The brief asks for technique to be informational rather than prescriptive,
 * and the ball-flight pages are where that matters most. What the club is
 * doing at impact is physics and is stated plainly. How a given player should
 * make the club do it is coaching, varies by person, and is deliberately absent.
 */

const CLUBS = [{ key: 'wp-golf-club' }];
const BALL = [{ key: 'wp-golf-ball' }];
const RULES = [{ key: 'rules-of-golf' }];

export const GOLF_CLUBS_AND_SHOTS: ExplainerSeed[] = [
  // ══ Clubs ══════════════════════════════════════════════════════════════════
  club({
    slug: 'golf-clubs-explained',
    title: 'Golf Clubs Explained',
    category: 'clubs-and-equipment',
    alsoIn: ['start-here'],
    aliases: [
      'golf clubs',
      'golf clubs explained',
      'types of golf club',
      'what clubs do golfers use',
    ],
    summary: 'Up to fourteen clubs, graded by loft, each covering a band of distance.',
    isStartHere: true,
    isFeatured: true,
    order: 400,
    readMinutes: 5,
    sourceKeys: CLUBS,
    whatItIs: `A golf club is a shaft with a weighted head on the end. What separates one from another is almost entirely the **loft**: the angle of the face, which determines how high and how far the ball goes.

The set runs from least lofted to most:

- **Driver**: one club, lowest loft, longest shaft, hit from a tee for maximum distance.
- **Fairway woods and hybrids**: long shots from the ground.
- **Irons**, numbered roughly 4 to 9: the workhorses, each about 10 to 15 yards apart.
- **Wedges**: highest loft, for shots inside about 120 yards and around the green.
- **Putter**: for rolling the ball on the green.

The Rules allow a maximum of fourteen. Which fourteen is entirely the player's choice.`,
    whenYouUseIt: `Distance chooses the club, not the situation. A player knows roughly how far each club goes, measures the distance to the target, and picks accordingly.

The exceptions are the ones that make golf interesting. Into a strong wind you take more club and swing easier. From a bad lie you take the club that can escape rather than the one that reaches. Around the green, the choice is about how much roll you want rather than how far you need to fly it.`,
    howItWorks: `Higher loft means a steeper launch, more backspin and a shorter, higher flight that stops faster on landing. Lower loft means a flatter launch, less spin and more roll.

Shaft length works with it: a driver's shaft is the longest, so the head travels fastest, so the ball goes furthest. It is also the hardest to control, which is exactly the trade being made.

The gaps between clubs are set so that a full swing with each covers a distinct band with no holes in it, which is what **club gapping** means.`,
    misunderstandings: `**You do not need fourteen clubs.** Fourteen is the legal maximum. Most beginners play better with seven or eight, and carrying clubs you cannot hit teaches nothing.

**The number on an iron is not a distance.** It is a position in the set. A modern 7 iron is lofted like a 5 iron of forty years ago, which is why "I hit my 7 iron 175" comparisons across generations are meaningless.

**Longer clubs are not better clubs.** They are harder to hit, and for many golfers a hybrid replacing a 4 iron is straightforwardly a better outcome.`,
    related: [
      'driver',
      'irons',
      'wedges',
      'putter',
      'club-loft',
      'fourteen-club-rule',
      'club-gapping',
    ],
  }),

  club({
    slug: 'driver',
    title: 'Driver Explained',
    category: 'clubs-and-equipment',
    aliases: ['driver', 'the driver', '1 wood', 'big stick'],
    summary: 'The longest club in the bag, lowest in loft, used almost exclusively from a tee.',
    order: 410,
    sourceKeys: CLUBS,
    whatItIs: `The driver is the largest-headed, longest-shafted and least lofted club a golfer carries, typically 8 to 12 degrees of loft with a head at the maximum legal size of 460 cubic centimetres.

It exists for one shot: the tee shot on a hole long enough to need it.`,
    whenYouUseIt: `From the tee on par 4s and par 5s, where distance is worth more than accuracy. Almost never from the ground: the low loft needs the ball teed up to launch it properly, and a driver off the deck is a difficult shot with little upside.

Professionals hit driver less often than viewers assume. On a tight hole with penalty areas at driver distance, a 3 wood or a long iron that stops short of the trouble is frequently the correct play.`,
    howItWorks: `Three numbers decide a drive: **clubhead speed**, **launch angle** and **spin rate**. The optimal combination for most players is a high launch with relatively low spin, which maximises carry without the ball climbing and stalling.

Modern drivers are engineered around that. The head is large for forgiveness, weight is pushed low and back to raise launch, and adjustable hosels let loft and face angle be tuned. **Gear effect** means a strike towards the toe imparts draw spin and one towards the heel imparts fade spin, which partially self-corrects a mishit.`,
    misunderstandings: `**More loft is not always shorter.** Many amateurs gain distance moving from 9 to 10.5 degrees, because they lack the speed to launch a low-lofted head properly.

**The driver is not the club that decides a round.** Strokes Gained data consistently shows approach play accounts for more scoring difference than driving, though driving matters more than the old "drive for show" cliché claimed.`,
    related: [
      'tee-shot',
      'clubhead-speed',
      'launch-angle',
      'spin-rate',
      'gear-effect',
      'driver-technology',
    ],
  }),

  club({
    slug: 'irons',
    title: 'Irons Explained',
    category: 'clubs-and-equipment',
    aliases: ['irons', 'golf irons', 'iron set'],
    summary:
      'The numbered clubs that cover most approach distances, each about 10 to 15 yards apart.',
    order: 440,
    sourceKeys: CLUBS,
    whatItIs: `Irons are flat-faced clubs with grooved faces, numbered from low to high. A modern set typically runs 5 iron to 9 iron, with the 3 and 4 replaced by hybrids for most players.

The number is a position in the set: as it rises, loft rises, shaft length falls, and the ball goes shorter and higher.`,
    whenYouUseIt: `For approach shots to the green, and from the tee on par 3s or on holes where control matters more than distance.

Rough guides, and they are only guides: a tour professional's 7 iron carries around 175 to 185 yards, an average male club golfer's around 140 to 150, and an average female club golfer's around 110 to 120. The number that matters is your own, measured, not a chart's.`,
    howItWorks: `The grooves grip the ball to generate backspin, which is what makes an iron shot climb, stop quickly on the green, and sometimes spin backwards.

The two broad constructions: **cavity-back** irons move weight to the perimeter, which makes off-centre strikes lose less distance, and **blades** or muscle-backs concentrate mass behind the centre, which gives a better player more control over shot shape at the cost of forgiveness.

An iron shot is struck with a descending blow, hitting the ball first and the turf after, which is why a well-struck iron takes a divot in front of where the ball was.`,
    misunderstandings: `**Lofts are not standardised between manufacturers.** One brand's 7 iron can be two degrees stronger than another's, so cross-brand distance comparisons are meaningless.

**Taking a divot is correct, not a mistake.** The club is meant to strike down on the ball with an iron.

**A long iron is not simply a harder version of a short iron.** Low loft plus a longer shaft makes the 3 and 4 iron genuinely difficult for slower swing speeds, which is precisely why hybrids exist.`,
    related: ['iron-numbers', 'club-loft', 'hybrids', 'iron-shot', 'grooves', 'iron-technology'],
  }),

  club({
    slug: 'wedges',
    title: 'Wedges Explained',
    category: 'clubs-and-equipment',
    aliases: ['wedges', 'golf wedges', 'pitching wedge', 'sand wedge', 'gap wedge'],
    summary:
      'The highest-lofted clubs, for full shots inside about 120 yards and everything near the green.',
    order: 450,
    sourceKeys: CLUBS,
    whatItIs: `Wedges are the most lofted clubs in the bag, typically four of them:

- **Pitching wedge** (about 44 to 48 degrees), the last club in a matched iron set.
- **Gap wedge** (about 50 to 54), filling the hole between pitching and sand.
- **Sand wedge** (about 54 to 58), designed with bounce for bunkers.
- **Lob wedge** (about 58 to 64), for the highest, softest shots.

Most players carry three, and the choice of which three is one of the more personal decisions in a set.`,
    whenYouUseIt: `Full swings from roughly 60 to 120 yards, and partial swings for everything closer. Chips, pitches, bunker shots and flops are all wedge shots.

The choice between them around the green is a choice about the ratio of carry to roll. A pitching wedge flies low and runs; a lob wedge flies high and stops. Playing the least lofted club that clears the ground you need to clear is the more reliable option.`,
    howItWorks: `Two properties matter beyond loft.

**Bounce** is the angle of the sole below the leading edge. It stops the club digging into sand or soft turf, and it is what makes a sand wedge work. High bounce suits soft sand and lush turf; low bounce suits firm ground and tight lies.

**Grooves** generate spin. Their volume and edge sharpness have been limited by the Rules since 2010, which reduced the spin available from the rough and made lie quality matter more, exactly as intended.`,
    misunderstandings: `**A sand wedge is not only for sand.** It is a general-purpose short-game club, and many good players use it for most greenside shots.

**More loft is not automatically better around the green.** A lob wedge has the smallest margin for error of any club, and a beginner reaching for it from a tight lie is choosing the hardest available shot.

**Bounce is not a flaw to be minimised.** Using the bounce, letting the sole slide rather than the edge dig, is the core skill of the short game.`,
    related: [
      'club-bounce',
      'lob-wedge',
      'pitch-shot',
      'chip-shot',
      'bunker-shot',
      'grooves',
      'using-bounce',
    ],
  }),

  club({
    slug: 'club-loft',
    title: 'What Does Club Loft Mean?',
    category: 'clubs-and-equipment',
    aliases: ['loft', 'club loft', 'what is loft in golf', 'golf club loft'],
    summary:
      'The angle of the clubface from vertical, which decides how high and how far the ball goes.',
    order: 500,
    sourceKeys: CLUBS,
    whatItIs: `Loft is the angle between the clubface and a vertical plane, measured in degrees. It is the single property that distinguishes one club from another.

A driver has roughly 9 degrees. A 7 iron has roughly 31. A lob wedge has 60 or more. A putter has 3 or 4, which is not zero for a reason: a small amount lifts the ball out of its resting depression and gets it rolling.`,
    whenYouUseIt: `Every club selection is a loft selection. More loft gives a higher, shorter, steeper-landing shot that stops quickly. Less loft gives a lower, longer shot that runs.

Into wind, less loft. Over a bunker to a tight pin, more loft. Downwind to a firm green, less loft and let it run in.`,
    howItWorks: `Loft splits the energy of the strike between forward speed and vertical launch, and it also determines backspin. More loft means more spin, which means more lift and a steeper descent.

The critical distinction is that **static loft** stamped on the club is not what the ball sees. **Dynamic loft**, the loft actually presented at impact, depends on shaft lean, angle of attack and where in the swing arc the ball is struck. A player who leans the shaft forward delivers a 9 iron with 7 iron loft, which is exactly how professionals hit the low, controlled shots they do.`,
    misunderstandings: `**Loft numbers are not comparable across brands or decades.** Manufacturers have progressively strengthened iron lofts, so a modern 7 iron is close to an old 5 iron.

**More loft does not always mean higher flight.** A player with a steep, digging angle of attack can hit a wedge lower than a player with a shallow one hits a 9 iron.

**Adding loft does not shorten every shot proportionally.** Beyond a point, extra loft costs so much forward speed that carry falls away sharply, which is why nobody plays a 70-degree wedge from 100 yards.`,
    related: [
      'dynamic-loft',
      'iron-numbers',
      'launch-angle',
      'spin-rate',
      'club-gapping',
      'golf-clubs-explained',
    ],
  }),

  rule({
    slug: 'fourteen-club-rule',
    title: 'How Many Clubs Can You Carry?',
    category: 'clubs-and-equipment',
    alsoIn: ['rules'],
    aliases: ['14 club rule', 'how many clubs', 'fourteen club rule', 'maximum clubs golf'],
    summary: 'Fourteen, and carrying a fifteenth costs strokes for every hole it was carried on.',
    order: 510,
    sourceKeys: [...RULES, ...CLUBS],
    ruleSensitive: true,
    sourceRevision: 'Rules of Golf, 2023 edition (R&A / USGA)',
    lastReviewedAt: '2026-08-31',
    theRule: `A player must not start a round with more than fourteen clubs, and must not add clubs during the round beyond that limit. The limit is on the number carried, not the number used.

Fewer than fourteen is always allowed. A player who starts with ten may add up to four during the round, provided they do not unduly delay play and do not borrow a club from another player on the course.`,
    penaltyAndRelief: `Breaching the limit costs **two strokes per hole** on which the breach happened, to a maximum of four strokes in a round, in stroke play. In match play the state of the match is adjusted by one hole per hole where the breach occurred, to a maximum of two holes.

As soon as the player realises, they must immediately take the excess club out of play by declaring it, and it may not be used for the rest of the round.`,
    inPractice: `The usual cause is an honest mistake: a club left in the bag from practice, or two players' clubs mixed up on a shared cart. It is the player's responsibility to count before teeing off, and professionals and their caddies do exactly that on the first tee.

A club damaged in the normal course of play may be repaired or replaced, but a club damaged through abuse may not be replaced.`,
    misunderstandings: `**The limit is on carrying, not using.** A fifteenth club in the bag that was never swung is still a breach.

**The penalty is not disqualification.** It is capped at four strokes in stroke play, which is severe but survivable.

**Fourteen is not a target.** Nothing requires a full set, and a beginner with eight clubs is fully compliant.`,
    related: ['golf-clubs-explained', 'club-gapping', 'rules-of-golf', 'golf-penalties-explained'],
  }),

  equipment({
    slug: 'ball-dimples',
    title: 'Why Golf Balls Have Dimples',
    category: 'clubs-and-equipment',
    aliases: ['dimples', 'golf ball dimples', 'why do golf balls have dimples'],
    summary:
      'Dimples reduce drag and let backspin generate lift, roughly doubling how far a ball flies.',
    order: 620,
    sourceKeys: BALL,
    whatItIs: `A modern golf ball carries roughly 300 to 400 dimples in a symmetrical pattern. They are not decorative and they are not there for grip: they are there because a smooth ball of the same size and speed would travel a fraction of the distance.`,
    howItWorks: `Two effects, and both matter.

**Drag.** A smooth sphere moving through air has a large, turbulent low-pressure wake behind it that drags it back. Dimples trip the air flowing over the surface into a thin turbulent layer that clings to the ball further round before separating, which shrinks that wake and cuts drag substantially.

**Lift.** A golf ball is struck with backspin. A spinning ball carries air around with it, faster over the top than underneath, and the resulting pressure difference pushes it upward. That is the **Magnus effect**, and dimples greatly amplify it by giving the surface something to drag air with.

The same mechanism curves the ball sideways when the spin axis is tilted, which is why a slice slices.`,
    whyItMatters: `The Rules require a ball to be spherically symmetrical, which is why dimple patterns are symmetrical rather than optimised for one flight. A ball engineered to self-correct a slice would be non-conforming, and several have been sold as novelties on exactly that basis.

Dimple count and depth are real design variables, but the marketing weight put on them exceeds their measurable effect: compression and cover material do more.`,
    misunderstandings: `**More dimples is not better.** There is no monotonic relationship, and manufacturers vary count for reasons that are as much branding as aerodynamics.

**Dimples do not make the ball go straighter.** They amplify whatever spin the strike imparted, curve included.`,
    related: ['golf-ball', 'ball-spin', 'backspin', 'spin-axis', 'why-golf-balls-curve'],
  }),

  // ══ Shots ══════════════════════════════════════════════════════════════════
  shot({
    slug: 'tee-shot',
    title: 'Tee Shot Explained',
    category: 'shots',
    aliases: ['tee shot', 'drive', 'the drive', 'teeing off'],
    summary: 'The first stroke on a hole, played from the teeing area with the ball on a tee.',
    order: 700,
    sourceKeys: [{ key: 'wp-golf' }],
    theShot: `The tee shot is the opening stroke of every hole. It is the only shot in golf played from a lie the player chooses, since the ball may be teed up.

On a par 4 or 5 it is usually a driver, aimed at a landing area rather than at the green. On a par 3 it is an approach shot played from a tee, and the club is whatever reaches the flag.`,
    whenUsed: `Once per hole, without exception. What varies is the club: driver for maximum distance, 3 wood or a long iron where trouble sits at driver range, and on a short par 4 anything from a driver at the green to a mid iron to a favourite yardage.`,
    technique: `A driver is the one full shot swept upward rather than struck downward. The ball is teed high and played forward in the stance, so the club is travelling slightly upward at impact: a positive **angle of attack**, which raises launch and reduces spin, and adds carry for the same clubhead speed.

Irons off a tee are the opposite: the ball is teed low and struck with a descending blow exactly as from the fairway.`,
    advantages: `A perfect lie, a free choice of exactly where within the teeing area to stand, and the longest club in the bag. It is the most controllable shot on the hole and the one where preparation pays most.`,
    risks: `It is also the shot that puts a hole out of reach. A drive out of bounds costs stroke and distance, and the double bogey that follows is worth two birdies elsewhere.

The asymmetry is why the correct target off the tee is often not the middle of the fairway but the side of it furthest from the worst trouble.`,
    misunderstandings: `**Driver is not compulsory.** Nothing in the Rules or the etiquette requires it, and on many holes it is the wrong club.

**A long drive into rough is not automatically better than a short one in the fairway.** It depends entirely on what the rough does to the next shot, which is why the honest answer requires Strokes Gained rather than a rule of thumb.`,
    related: [
      'driver',
      'tee-box',
      'tee-shot-strategy',
      'angle-of-attack',
      'driving-distance',
      'stroke-and-distance',
    ],
  }),

  shot({
    slug: 'chip-shot',
    title: 'Chip Shot Explained',
    category: 'shots',
    alsoIn: ['putting-and-short-game'],
    aliases: ['chip', 'chip shot', 'chipping'],
    summary: 'A short, low shot from near the green that spends most of its journey rolling.',
    order: 750,
    sourceKeys: [{ key: 'wp-golf' }],
    theShot: `A chip is a short shot played from just off the green, designed to carry a small distance and then roll most of the way to the hole. The ratio is roughly one-third air, two-thirds ground, though it varies with the club.

It is played with a small, putting-like motion rather than a full swing, which is what makes it the most repeatable shot around the green.`,
    whenUsed: `When the ball is close to the green, the lie is decent, and there is nothing to fly over. If there is a bunker or thick rough between ball and hole, the shot becomes a **pitch** instead.

Club choice controls the roll. A 9 iron chip runs a long way; a sand wedge chip runs a little. Good players choose the club to make the ball land on a chosen spot just on the green and roll out the rest.`,
    technique: `Weight favours the lead foot, hands slightly ahead of the ball, and the stroke is made with the shoulders rather than the wrists. The club descends slightly into the ball, so it is struck before the ground.

Beyond that, methods differ genuinely between good players, and the descriptions above are what most of them have in common rather than a prescription.`,
    advantages: `The lowest-risk shot around the green. The swing is short, so there is little to go wrong, and the ball spends most of its time rolling, which is far more predictable than flying.`,
    risks: `The two classic failures. A **duff**, where the club hits the ground first and the ball moves a few feet, and a **thin**, where the leading edge strikes the ball's equator and it shoots across the green. Both come from trying to help the ball into the air rather than letting loft do it.`,
    misunderstandings: `**A chip is not a small pitch.** They are different shots with different jobs: a chip runs, a pitch stops.

**You do not need a lofted wedge to chip.** Most tour players chip with a range of clubs and pick by how much roll they want.`,
    related: ['pitch-shot', 'chip-vs-pitch', 'bump-and-run', 'fringe', 'up-and-down', 'wedges'],
  }),

  shot({
    slug: 'draw',
    title: 'Draw Explained',
    category: 'shots',
    difficulty: 'intermediate',
    aliases: ['draw', 'draw shot', 'right to left'],
    summary: 'A controlled shot that curves gently right to left for a right-handed player.',
    order: 800,
    sourceKeys: [{ key: 'wp-golf' }],
    theShot: `A draw curves gently from right to left in the air, for a right-handed golfer. Mirror it for a left-hander: the curve runs left to right.

It is the controlled version of a hook. The distinction is degree and intent, not mechanism: both come from the same combination of face and path, a draw with a small gap between them and a hook with a large one.`,
    whenUsed: `On a hole doglegging left, to follow the shape of the ground. Around a tree. Into a pin tucked on the left of a green. And on any hole where the player simply prefers that shape, which is the most common reason of all.`,
    technique: `The physics is settled and worth stating plainly, because it is the opposite of what most golfers are taught first.

The ball starts roughly where the **clubface** is pointing at impact, and curves away from the **club path**. A draw is produced by a face that is closed relative to the path but still, usually, pointing right of the target: a path further right than the face.

The curvature comes from the tilt of the **spin axis** that this face-to-path gap creates. It is not sidespin layered on top of backspin: it is backspin around an axis that is not level.`,
    advantages: `A draw launches slightly lower with slightly less spin than a fade of equal quality, so it generally carries a touch further and runs more on landing. That is why "a little draw" is a common preference among longer hitters.`,
    risks: `Because it runs more, a draw is harder to stop on a firm green, and the same shot that finds the fairway can run through it.

More importantly, a draw is one degree of face-to-path away from a hook, and a hook is a genuinely destructive miss that finishes low, left and a long way offline.`,
    misunderstandings: `**A draw is not caused by "rolling the wrists".** It is caused by the relationship between face and path, however the player achieves it.

**Draws do not always go further.** They typically carry marginally further and roll more, but the difference is small and swamped by strike quality.

**A draw is not better than a fade.** Several of the best players in history have played a fade deliberately, precisely because it is the shape that stops.`,
    related: [
      'fade',
      'hook',
      'club-path',
      'face-angle',
      'face-to-path',
      'spin-axis',
      'why-golf-balls-curve',
    ],
  }),

  shot({
    slug: 'slice',
    title: 'Slice Explained',
    category: 'shots',
    aliases: ['slice', 'slicing', 'banana ball'],
    summary:
      'A shot curving sharply left to right for a right-hander, and the most common amateur miss.',
    order: 830,
    sourceKeys: [{ key: 'wp-golf' }],
    theShot: `A slice curves hard from left to right for a right-handed player, usually starting left of target and finishing well right of it. It typically flies higher and shorter than intended, because the tilted spin axis costs carry.

It is the single most common shot pattern among amateur golfers, and the reason so much equipment is sold on the promise of fixing it.`,
    whenUsed: `Rarely on purpose. A deliberately curved left-to-right shot played under control is a **fade**; a slice is the same shape with too much of it.`,
    technique: `A slice happens when the clubface is open relative to the club path at impact. The classic amateur version pairs an out-to-in path with a face that is open to that path, which starts the ball left and curves it right.

The critical point is the *relationship*. A face that is open to the target but square to the path produces a straight shot that misses right, which is a **push**, not a slice. Nothing curves unless face and path disagree.`,
    advantages: `Almost none, though its milder cousin the fade is a genuinely useful shot: it lands softly and it is easier to control the distance of.`,
    risks: `Lost distance, because tilted spin converts energy into curve rather than carry, and lost accuracy in a predictable direction, which is why slicers instinctively aim further and further left and make the path problem worse.`,
    misunderstandings: `**Aiming further left makes a slice worse,** not better, because it steepens the out-to-in path that causes it.

**A slice is not caused by an open face alone.** It is caused by the face being open *relative to the path*.

**Slice and fade are the same shape.** The difference is control and degree.`,
    related: [
      'fade',
      'hook',
      'push',
      'club-path',
      'face-angle',
      'face-to-path',
      'why-golf-balls-curve',
    ],
  }),

  standard({
    slug: 'why-golf-balls-curve',
    title: 'Why Golf Balls Curve',
    category: 'shots',
    difficulty: 'intermediate',
    aliases: ['why golf balls curve', 'why does the ball curve', 'golf ball curve'],
    summary: 'Because backspin around a tilted axis produces lift that is not straight up.',
    order: 860,
    sourceKeys: [...BALL, { key: 'wp-golf' }],
    explanation: `Every golf shot has backspin, and backspin produces lift. If the axis that spin turns around is level, the lift is straight up and the ball flies straight. If the axis is tilted, part of that lift points sideways, and the ball curves.

That is the whole explanation. There is no separate "sidespin": there is one spin, around one axis, and the tilt of that axis is what curves the ball.`,
    howItWorks: `The tilt is set at impact by the relationship between two things:

**Clubface angle** decides roughly where the ball starts. A face pointing right at impact starts the ball right. For a driver the start direction is about 80 to 85 percent determined by the face; for a wedge it is closer to 70 percent, with path making up the rest.

**Club path** decides which way it curves. The ball curves *away from the path*, towards wherever the face was pointing relative to it. Face right of path curves it right; face left of path curves it left.

So the four common outcomes for a right-hander are just the four combinations. Face and path both right, and matching: a straight push. Face right of a path that is further right: a push-draw. Face left of path: a fade or slice. Path far left with a face left of it: a pull-hook.

The greater the gap between face and path, the more axis tilt, and the more curve. Zero gap is a straight shot, whichever direction it goes.`,
    example: `A driver delivered with a path 4 degrees to the right and a face 1 degree to the right. The ball starts a little right of target, and because the face is 3 degrees *left of the path*, it draws back towards the middle.

Now the same path with a face 6 degrees right. The ball starts further right and curves further right still, because the face is now 2 degrees right of the path. Same path, opposite curve, from a face change of five degrees.`,
    whyItMatters: `This one relationship explains the draw, the fade, the hook, the slice, the push and the pull as a single system rather than six unrelated faults. It is also what launch monitors measure, which is why a coach with one can diagnose in a shot what used to take a season of guessing.`,
    misunderstandings: `**"Sidespin" is not a real thing.** It is a convenient fiction for a tilted spin axis, and it leads people to imagine spin can be added sideways independently of backspin.

**The face does not decide the curve, and the path does not decide the start.** It is the reverse of what most golfers assume, and getting it backwards is why so many self-diagnoses fail.

**Wind does not curve the ball much on its own.** It amplifies curve the ball already has, which is why a slice into wind is catastrophic and a slice downwind is merely annoying.`,
    related: [
      'spin-axis',
      'club-path',
      'face-angle',
      'face-to-path',
      'draw',
      'fade',
      'slice',
      'ball-flight-explained',
    ],
  }),

  definition({
    slug: 'shank',
    title: 'Shank',
    category: 'glossary',
    aliases: ['shank', 'shanks', 'hosel rocket'],
    summary:
      'A shot struck off the hosel, shooting almost sideways to the right for a right-hander.',
    order: 2220,
    explanation: `A shank happens when the ball is struck by the **hosel**, the socket joining head to shaft, rather than by the face. The ball squirts off at a sharp angle, typically low and hard right for a right-handed player.

It is caused by the club being marginally further from the player at impact than at address, so the strike moves towards the heel. It is not a swing-path fault in the usual sense, which is why it can appear suddenly in an otherwise functioning game.`,
    whyItMatters: `Its reputation exceeds its frequency, and golfers are famously superstitious about naming it. It matters mainly because it is a near-total loss of the shot: a shank rarely leaves a playable next one.`,
    related: ['clubface', 'impact', 'irons'],
  }),
];
