import { dismissal } from './cricket-explainer-helpers';
import { MCC_CODE, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * The ten ways to be out.
 *
 * Each is written against its own Law and numbered, because the Law numbers are
 * the one thing about dismissals that is stable and checkable, and because the
 * list has changed: "handled the ball" was folded into obstructing the field in
 * the 2017 Code, and the non-striker run out moved from unfair play to Law 38 in
 * 2022. Anything that presents the pre-2017 list as current is wrong, which is
 * why every entry here carries its edition.
 *
 * The frequency notes are worth the space. A reader meeting ten methods has no
 * way of knowing that two of them decide most matches and three have happened a
 * handful of times in Test history, and that proportion is more useful to a
 * beginner than the completeness of the list.
 */

const MCC = { key: 'mcc-laws' } as const;
const provenance = { sourceRevision: MCC_CODE, lastReviewedAt: REVIEWED } as const;

export const CRICKET_DISMISSALS: ExplainerSeed[] = [
  dismissal({
    ...provenance,
    slug: 'bowled',
    title: 'Bowled',
    category: 'dismissals',
    difficulty: 'beginner',
    summary:
      'The delivery hits the stumps and puts the wicket down. The most straightforward dismissal in cricket.',
    theLaw: `Under **Law 32**, the striker is out **bowled** if their wicket is put down by a ball delivered by the bowler, **even if it first touches the bat or person**.

That last clause is what makes bowled broader than it looks. An inside edge onto the stumps is bowled, not caught behind and not LBW. A ball deflecting off the pad onto the stumps is bowled. The only requirement is that the delivery, and nothing else, put the wicket down.

Bowled takes precedence over other methods: if a batter is bowled, that is the dismissal recorded, whatever else was also happening.`,
    sequence: `**1. Was it a legal delivery?** From a no-ball or a wide, the striker cannot be bowled.

**2. Did the ball put the wicket down?** A bail must be completely removed from the top of the stumps, or a stump struck out of the ground.

**3. Did the ball come from the bowler?** A ball rebounding off a fielder onto the stumps is not bowled; it may be a run out.`,
    edgeCasesHeading: 'The wicket has to be properly put down',
    edgeCases: `The Laws are exact about what "put down" means: at least one bail completely removed from the top of the stumps, or a stump struck out of the ground.

That produces the occasional oddity where the ball hits the stumps, the bails wobble and settle back, and the batter is not out. It looks like a technicality and it is precisely what the Law says.

Where a wicket has no bails, for instance in high wind when the umpires have removed them, the umpire judges whether the ball would have put the wicket down.`,
    whenYouWillSeeIt: `Around a fifth of all Test dismissals. Most often from a ball that moves after the batter has committed: an inswinger to a right-hander, a ball nipping back off the seam, an off break turning through the gate, or a yorker.

Bowled is also the characteristic dismissal at the end of an innings, when tail-end batters are playing across the line and bowlers are aiming at the base of the stumps.`,
    misunderstandings: `**"An edge onto the stumps is caught behind."** It is bowled.

**"If the ball hits the pad first, it must be LBW."** If it then hits the stumps, it is bowled.

**"The stumps just have to be hit."** A bail must be completely removed, or a stump knocked out of the ground.`,
    takeaways: `- Law 32: the delivery puts the wicket down, even via bat or body.
- Takes precedence over other dismissals.
- A bail must be completely dislodged.
- Roughly one in five Test dismissals.`,
    related: [
      'wickets-and-dismissals',
      'wicket',
      'stumps',
      'bails',
      'yorker',
      'through-the-gate',
      'lbw',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 32 (Bowled)' }],
    order: 20,
  }),

  dismissal({
    ...provenance,
    slug: 'caught',
    title: 'Caught',
    category: 'dismissals',
    difficulty: 'beginner',
    summary:
      'A fielder catches the ball off the bat before it touches the ground. The commonest dismissal in cricket by a wide margin.',
    theLaw: `Under **Law 33**, the striker is out **caught** if a fielder catches the ball, fully within the field of play, after it has touched the striker's bat or a glove holding the bat, without it having touched the ground.

The catch is complete when the fielder has **complete control over the ball and their own movement**. That definition is what resolves the awkward cases: a fielder who catches the ball and then falls over the boundary has not completed the catch, and neither has one who juggles it while off balance and drops it.

A fielder may not catch the ball while grounded beyond the boundary, and the airborne provisions of Law 19 apply.`,
    sequence: `**1. Was it a legal delivery?** No catch from a no-ball or a wide.

**2. Did the ball touch the bat or a glove on the bat handle?** A ball off the body only is not a catch; it may be LBW.

**3. Did the ball carry?** It must not have touched the ground first. A ball scooped up on the half-volley is not out.

**4. Was the catch completed with control?** Including control of the fielder's own movement, which is what the boundary cases turn on.`,
    edgeCasesHeading: 'The ones that go to the third umpire',
    edgeCases: `**Did it carry?** A low catch at slip or in the covers is the hardest thing in cricket to judge on replay, because a flattened two-dimensional image cannot reliably show a few millimetres of daylight. Many competitions instruct the third umpire to defer to the on-field soft signal where the evidence is inconclusive, and the protocols for this have changed more than once.

**Boundary catches.** A fielder taking the ball in the air must have been inside the boundary at their last contact with the ground before that first touch, and may relay the ball to a teammate or return inside to complete the catch.

**Caught behind versus bowled.** If the ball edges onto the stumps, the batter is bowled, not caught.

**Caught and bowled.** If the bowler takes the catch themselves, it is recorded as "c and b", which is one dismissal and not two.`,
    whenYouWillSeeIt: `More than half of all Test dismissals, and the majority in every format. Behind the wicket to pace bowling, in the ring to a mistimed drive, and on the boundary in T20 cricket where hitting over the fielders is the primary scoring method.`,
    misunderstandings: `**"A catch off the pad counts."** It must touch the bat or a glove holding the bat.

**"The fielder just has to hold it."** Control over the ball **and** their own movement is required.

**"A bump ball is out."** A ball that hits the ground off the bat before being caught is not out, however clean it looks.`,
    takeaways: `- Law 33: caught off the bat, off the ground, with complete control.
- Comfortably the most common dismissal in all formats.
- Boundary catches turn on where the fielder last touched the ground.
- An edge onto the stumps is bowled, not caught.`,
    related: [
      'wickets-and-dismissals',
      'slip',
      'catching',
      'boundary-fielding',
      'edge',
      'outside-edge',
      'dolly',
    ],
    sourceKeys: [
      { ...MCC, locator: 'Law 33 (Caught)' },
      { key: 'icc-playing-conditions', locator: 'Soft signal and catch review protocols' },
    ],
    order: 30,
  }),

  dismissal({
    ...provenance,
    slug: 'run-out',
    title: 'Run Out',
    category: 'dismissals',
    difficulty: 'beginner',
    summary:
      'A batter out of their ground while a run is attempted, and the fielding side puts the wicket down.',
    theLaw: `Under **Law 38**, either batter is out **run out** if, while the ball is in play, they are **out of their ground** and their wicket is fairly put down by the fielding side.

Three details matter.

**Which batter.** The batter at the end where the wicket is put down is the one dismissed, regardless of who hit the ball.

**Who gets the credit.** A run out is credited to the fielders involved, not to the bowler. It does not appear in a bowling analysis.

**No-balls do not save you.** A run out remains possible from a no-ball, a wide, and a free hit, which is the exception to almost every other dismissal.`,
    sequence: `**1. Is the ball in play?** Not if it is dead.

**2. Is the batter out of their ground?** No part of person or bat in hand grounded behind the popping crease.

**3. Was the wicket fairly put down?** By a fielder's hand or the ball, with a bail removed or a stump out of the ground.

**4. Which end?** The batter at that end is out.

If both batters are in the same ground, the one who got there first is protected and the other is out.`,
    edgeCasesHeading: 'The awkward cases',
    edgeCases: `**The bouncing bat.** A batter sliding the bat in must have it **grounded and in hand** at the moment the wicket goes down. A bat in the air, or dropped, does not count. This decides more televised run outs than anything else.

**The airborne diver.** A batter who has been in their ground and dives towards it is protected while airborne, under the Law 30 provisions on a batter running or diving towards their ground.

**Deflections off the bowler.** A ball deflected onto the stumps off the bowler's hand can produce a run out, and often does when a bowler gets a fingertip to a straight drive.

**The non-striker leaving early.** Since the 2022 revision this sits in Law 38 rather than under unfair play, and it is a run out like any other.`,
    whenYouWillSeeIt: `Around one in thirty Test dismissals, and considerably more in limited-overs cricket, where batters take risks for singles that nobody would attempt in a Test.

Run outs cluster at the death of an innings and in the middle overs of a chase, where a side is converting ones into twos under pressure.`,
    misunderstandings: `**"The bowler gets the wicket."** Run outs are credited to fielders, not bowlers.

**"You cannot be run out off a no-ball."** You can, which is why a wicket during a no-ball call always gets checked.

**"Sliding the bat over the line is enough."** It must be grounded, and in hand.`,
    takeaways: `- Law 38: out of your ground, wicket fairly put down, ball in play.
- The batter at that end is out, whoever hit the ball.
- Credited to fielders, not the bowler.
- Possible from no-balls, wides and free hits.`,
    related: [
      'batters-ground',
      'running-between-wickets',
      'run-out-technique',
      'direct-hit',
      'run-out-non-strikers-end',
      'run-out-review',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 38 (Run out)' }],
    order: 40,
  }),

  dismissal({
    ...provenance,
    slug: 'stumped',
    title: 'Stumped',
    category: 'dismissals',
    difficulty: 'beginner',
    summary:
      'The wicketkeeper puts the wicket down while the batter is out of their ground and not attempting a run.',
    theLaw: `Under **Law 39**, the striker is out **stumped** if they are out of their ground, **not attempting a run**, and the wicketkeeper puts the wicket down with the ball.

The keeper must do it themselves, and the ball must not have touched another fielder first, or it becomes a run out instead. The keeper may use the ball held in hand, or throw it at the stumps.

Stumped is available from a **wide**, unlike most dismissals, because the batter may still leave their ground chasing one. It is not available from a **no-ball**.`,
    sequence: `**1. Legal delivery?** No stumping from a no-ball. A wide is fine.

**2. Is the striker out of their ground?** The Law 30 test: nothing grounded behind the popping crease.

**3. Were they attempting a run?** If they were, it is a run out rather than a stumping. The distinction affects who is credited.

**4. Did the keeper put the wicket down with the ball, unaided?** Another fielder's involvement makes it a run out.`,
    edgeCasesHeading: 'Stumped or run out?',
    edgeCases: `The line between the two is **whether a run was being attempted**, not where the batter was or who broke the wicket.

A batter who advances down the pitch to a spinner, misses, and is beaten by the keeper is **stumped**: they were playing a shot, not running. A batter who sets off, is sent back, and fails to make their ground is **run out**, even if the keeper alone completed it.

Stumped is credited to the bowler and the keeper jointly, appearing as "st" on a scorecard, and counts in the bowler's wickets. A run out appears as "run out" and counts to nobody's bowling figures, which is why the distinction is more than cosmetic.`,
    whenYouWillSeeIt: `Around one in fifty Test dismissals, and almost always to spin. A keeper standing up to the stumps is the precondition: a batter advancing at a spinner has nowhere to go if they miss.

You will also see it from a ball turning sharply past a batter who has overbalanced, and occasionally from a leg-side wide with the batter stretching.`,
    misunderstandings: `**"Stumped and run out are the same thing."** The difference is whether a run was being attempted, and it changes who gets credit.

**"Only a keeper standing up can stump."** A keeper standing back can too, and occasionally does with a throw.

**"You cannot be stumped off a wide."** You can.`,
    takeaways: `- Law 39: out of your ground, not running, keeper puts the wicket down.
- Attempting a run makes it a run out instead.
- Credited to the bowler as a wicket; run outs are not.
- Available from a wide, not from a no-ball.`,
    related: [
      'wicketkeeper',
      'standing-up',
      'stumping',
      'run-out',
      'batters-ground',
      'playing-against-spin',
      'stumping-review',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 39 (Stumped)' }],
    order: 50,
  }),

  dismissal({
    ...provenance,
    slug: 'hit-wicket',
    title: 'Hit Wicket',
    category: 'dismissals',
    difficulty: 'intermediate',
    summary:
      'The striker breaks their own wicket with bat or body while playing the ball or setting off for a first run.',
    theLaw: `Under **Law 35**, the striker is out **hit wicket** if, after the bowler has entered their delivery stride and while the ball is in play, they put down their own wicket with their bat or person.

The window is specific. It covers the striker while **playing the ball or in the act of playing it**, and while **setting off for their first run** immediately afterwards. Beyond that, breaking your own wicket is not hit wicket.

The dismissal is credited to the bowler.

There is no hit wicket from a **no-ball**.`,
    sequence: `**1. Legal delivery?** Not from a no-ball.

**2. Was the striker playing the ball, or setting off for a first run?** Outside that window, no.

**3. Did their bat or person put the wicket down?** Cap, glove, boot, a swinging bat on the follow-through, all count.`,
    edgeCasesHeading: 'What does not count',
    edgeCases: `**Avoiding injury.** A batter who breaks the wicket while taking evasive action from a delivery is out hit wicket if it happened while playing or playing at the ball; but the Laws distinguish this from breaking the wicket in avoiding a fielder's throw, which is not hit wicket.

**After the first run.** A batter who returns for a second run and knocks the stumps over is not out hit wicket. They might be run out if they are out of their ground and the fielding side does the rest.

**Dislodged by equipment.** A helmet or a bat flying from the hands onto the stumps can be hit wicket, since equipment counts.`,
    whenYouWillSeeIt: `Rare, and almost always against pace. Two situations dominate: a batter cramped for room by a short ball and treading back onto the stumps, and a batter losing control of a big swing and dragging the bat into the stumps on the follow-through.

It is a dismissal that tends to signal a batter under physical pressure rather than a technical fault.`,
    misunderstandings: `**"Any time you hit your own stumps, you are out."** Only within the delivery-and-first-run window.

**"Hit wicket is the same as bowled."** Bowled is the ball hitting the stumps. Hit wicket is the batter doing it.

**"It doesn't count as a wicket for the bowler."** It does.`,
    takeaways: `- Law 35: the striker breaks their own wicket while playing the ball or starting a first run.
- Credited to the bowler.
- Not available from a no-ball.
- Usually a sign of a batter cramped or overbalanced.`,
    related: ['bowled', 'wicket', 'short-ball', 'bouncer', 'playing-short-pitched-bowling'],
    sourceKeys: [{ ...MCC, locator: 'Law 35 (Hit wicket)' }],
    order: 60,
  }),

  dismissal({
    ...provenance,
    slug: 'obstructing-the-field',
    title: 'Obstructing the Field',
    category: 'dismissals',
    difficulty: 'advanced',
    summary:
      'A batter wilfully obstructing or distracting the fielding side, which since 2017 also covers deliberately handling the ball.',
    theLaw: `Under **Law 37**, either batter is out **obstructing the field** if they **wilfully** obstruct or distract the fielding side by word or action.

The Law also provides that the striker is out under it if, after the ball has touched bat or person, they **wilfully strike the ball with a hand not holding the bat**, other than to avoid injury. That clause is what absorbed the old "handled the ball" dismissal when the 2017 Code removed it as a separate method.

A batter is **not** out for merely running into a fielder's way accidentally, or for taking a legitimate line while running. Wilfulness is the test, and it is judged by the umpires.

Where the obstruction prevents a catch, the batter who obstructed is the one dismissed.`,
    sequence: `**1. Was there obstruction or distraction of the fielding side?**

**2. Was it wilful?** Accidental collision is not out.

**3. If it was a handling case: did the batter deliberately strike the ball with a hand not on the bat, other than to avoid injury?**`,
    edgeCasesHeading: 'The change from "handled the ball"',
    edgeCases: `Before the 2017 Code, deliberately touching the ball with a hand not holding the bat was its own dismissal, **handled the ball**, and seven Test dismissals were recorded under it.

It no longer exists as a separate method. The conduct is still out; it is now obstructing the field.

This matters when reading statistics: a source listing "handled the ball" is describing a retired category, not a current one, and a source listing the ten current methods should not include it.

Also worth separating: a batter may legitimately handle the ball with a fielder's **consent**, which is what happens routinely when a batter picks up a ball and tosses it back.`,
    whenYouWillSeeIt: `Very rare. There has been roughly one Test dismissal under it, and a small number in limited-overs internationals, typically where a batter has changed course to block a throw at the stumps or has knocked a ball away from the wicket with a hand.

Because wilfulness is the test, it also produces the occasional withdrawn appeal, where a fielding captain decides the obstruction was not deliberate.`,
    misunderstandings: `**"Getting in the fielder's way is out."** Only if wilful.

**"Handled the ball is still a dismissal."** The conduct is out under Law 37; the name is retired.

**"It is always the striker."** Either batter can be out obstructing the field.`,
    takeaways: `- Law 37: wilful obstruction or distraction of the fielding side.
- Absorbed "handled the ball" in the 2017 Code.
- Wilfulness is the test, judged by the umpires.
- Extremely rare in practice.`,
    related: ['handling-the-ball', 'wickets-and-dismissals', 'appeals', 'dead-ball', 'run-out'],
    sourceKeys: [{ ...MCC, locator: 'Law 37 (Obstructing the field)' }],
    order: 70,
  }),

  dismissal({
    ...provenance,
    slug: 'hit-the-ball-twice',
    title: 'Hit the Ball Twice',
    category: 'dismissals',
    difficulty: 'advanced',
    summary:
      'Deliberately striking the ball a second time, other than to protect the wicket. Almost never happens.',
    theLaw: `Under **Law 34**, the striker is out **hit the ball twice** if, while the ball is in play, it strikes any part of their person or is struck by their bat and they then **wilfully strike it again** with bat or person, other than for the **sole purpose of guarding their wicket**.

The exception is the whole substance of the Law. A batter is entitled to defend their stumps: if the ball is rolling back towards the wicket, they may knock it away, and that is not out.

What they may not do is hit the ball a second time in order to score, or to stop a fielder taking a catch. Runs may not be scored from a second strike, other than as overthrows or penalties.

The striker is also not out if the second contact is to return the ball to a fielder, with consent.`,
    sequence: `**1. Did the ball touch bat or person first?**

**2. Did the striker wilfully strike it again?**

**3. Was that second strike solely to guard the wicket?** If yes, not out. If it was to score or to interfere, out.`,
    edgeCasesHeading: 'Guarding the wicket versus scoring',
    edgeCases: `The permitted case is common and passes without comment: a ball trickling back towards the stumps, the batter blocking it away with the bat. Nobody appeals, because nobody should.

The prohibited case has occurred in international cricket only a handful of times, and the first men's international instance came as recently as 2023.

There is a related but separate provision: a batter who prevents a catch by striking the ball twice is dealt with under **obstructing the field** rather than this Law, since preventing a catch is obstruction rather than a scoring attempt.`,
    whenYouWillSeeIt: `Effectively never. One men's international instance and none in Test history.

The value of knowing the Law is not that you will see it. It is that it explains the thing you **do** see constantly, which is a batter legally knocking a ball away from their stumps and nobody reacting at all.`,
    misunderstandings: `**"Hitting the ball twice is always out."** Guarding the wicket is expressly permitted.

**"You can run if you hit it twice to protect the stumps."** Runs may not be scored from the second strike, apart from overthrows and penalties.`,
    takeaways: `- Law 34: wilful second strike, other than to guard the wicket.
- Guarding the stumps is legal and routine.
- No runs from the second strike.
- One men's international instance, none in Tests.`,
    related: ['obstructing-the-field', 'wickets-and-dismissals', 'defensive-shot', 'dead-ball'],
    sourceKeys: [{ ...MCC, locator: 'Law 34 (Hit the ball twice)' }],
    order: 80,
  }),

  dismissal({
    ...provenance,
    slug: 'timed-out',
    title: 'Timed Out',
    category: 'dismissals',
    difficulty: 'advanced',
    summary:
      'An incoming batter not ready to face a delivery within the allowed time after a wicket falls.',
    theLaw: `Under **Law 40**, an incoming batter must be **ready to receive the ball**, or the other batter ready to receive the next delivery, within **three minutes** of the previous batter being dismissed or retiring. If they are not, and the fielding side appeals, the incoming batter is out **timed out**.

The umpires may allow additional time in exceptional circumstances, and the Law provides for the fielding side to be penalised instead if the delay is the fielding side's fault.

The three-minute figure is the Law's. Competitions have used shorter periods in their playing conditions, and limited-overs conditions in particular often require a faster changeover, so the applicable time depends on the competition.

Timed out is not credited to any bowler.`,
    sequence: `**1. Has a wicket fallen or a batter retired?**

**2. Has the allowed time elapsed without a batter ready to receive?**

**3. Has the fielding side appealed?** Without an appeal there is no dismissal.

**4. Were the circumstances exceptional?** The umpires may allow more time.`,
    edgeCasesHeading: 'It requires an appeal, and it is almost always waived',
    edgeCases: `The reason timed out effectively never happens is not that batters are always punctual. It is that fielding sides almost never appeal, because an equipment problem or a genuine delay is treated as the sort of thing you do not take a wicket for.

The first instance in international cricket came in a 2023 World Cup match, and it caused considerable argument for exactly that reason: the Law was applied correctly and the decision to appeal was the contested part.

It has never happened in a Test.`,
    whenYouWillSeeIt: `Realistically, not at all. It is worth understanding as a piece of the Laws' architecture rather than as something to watch for, and as an illustration that many cricket Laws exist to make a norm enforceable rather than to be enforced.`,
    misunderstandings: `**"Timed out is automatic."** It requires an appeal from the fielding side.

**"The limit is always three minutes."** Three minutes is the Law; competitions can and do set shorter periods.

**"It has never happened."** It has happened once in a men's international, in 2023, though never in a Test.`,
    takeaways: `- Law 40: not ready to receive within the allowed time, on appeal.
- Three minutes under the Laws; competitions may set less.
- Requires an appeal, which is why it is vanishingly rare.
- Credited to no bowler.`,
    related: ['wickets-and-dismissals', 'appeals', 'over-rate-and-time', 'batting-order'],
    sourceKeys: [{ ...MCC, locator: 'Law 40 (Timed out)' }],
    order: 90,
  }),

  dismissal({
    ...provenance,
    slug: 'retired-out',
    title: 'Retired Out',
    category: 'dismissals',
    difficulty: 'advanced',
    summary:
      'A batter who leaves the field without consent and does not resume. Distinct from retired hurt, which is not a dismissal.',
    theLaw: `Under **Law 25.4**, a batter may retire at any time. What happens next depends on why.

**Retired, not out.** If the batter retires because of injury, illness or another unavoidable cause, they may resume their innings later. If they do not, they are recorded as **retired not out**, and it is **not a dismissal**.

**Retired out.** If the batter retires for any other reason, they may only resume with the **consent of the opposing captain**. If they do not resume, they are **out**, recorded as **retired out**.

Retired out is a dismissal for statistical purposes: it counts against a batting average. Retired not out does not, and is treated like any other not-out innings.

No bowler is credited.`,
    sequence: `**1. Did the batter retire?**

**2. Was the reason injury, illness or another unavoidable cause?** If so, retired not out, and they may resume.

**3. If not, did the opposing captain consent to their resuming?** Without consent and without resuming, they are retired out.`,
    edgeCasesHeading: 'The tactical use',
    edgeCases: `Retiring out as a **tactic** has appeared in T20 cricket: a set batter whose scoring rate no longer suits the situation walks off to let a more explosive batter face the remaining deliveries.

It is legal, rare, and controversial, and it sits in an interesting place because the Laws clearly permit it while the surrounding convention treats it as unusual. There have been only two instances in Test history, both in circumstances closer to the injury end of the spectrum.

The important thing for a reader of scorecards is the two-line distinction: "retired not out" is a survivor, "retired out" is a wicket.`,
    whenYouWillSeeIt: `Retired **hurt** or **not out**, regularly: a batter takes a blow, leaves, and returns later in the innings.

Retired **out**, almost never, and when it happens it is usually a deliberate T20 tactic rather than an injury.`,
    misunderstandings: `**"Retired hurt counts as a dismissal."** It does not, and it does not affect a batting average.

**"A retired batter cannot come back."** For injury or illness they can. Otherwise they need the opposing captain's consent.

**"Retiring out is against the Laws."** It is expressly provided for.`,
    takeaways: `- Law 25.4: retired not out for injury or illness; retired out otherwise.
- Retired out is a dismissal and counts against an average; retired not out is not.
- Resuming after a non-injury retirement needs the opposing captain's consent.
- Two instances in Test history.`,
    related: ['wickets-and-dismissals', 'not-out', 'runner', 'batting-order', 'finisher'],
    sourceKeys: [{ ...MCC, locator: 'Law 25 (Batter’s innings; Retirement)' }],
    order: 100,
  }),
];
