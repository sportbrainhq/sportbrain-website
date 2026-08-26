import { tactic } from './cricket-explainer-helpers';
import { ICC_PC, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Tactics and strategy.
 *
 * One rule governs every entry: **nothing here is a rule**. Tactical choices in
 * cricket are contested, conditions-dependent and frequently reversed by good
 * captains for good reasons, so each entry carries an explicit trade-offs
 * section and none presents a preferred option as correct.
 *
 * Where analytical work genuinely disagrees with received wisdom, or where the
 * question is unsettled, the entry says so rather than picking a side. The
 * anchor debate, the follow-on decision and the value of dot-ball pressure are
 * all live arguments and are presented as such.
 */

export const CRICKET_TACTICS: ExplainerSeed[] = [
  // ── Batting strategy ──────────────────────────────────────────────────────
  tactic({
    slug: 'building-an-innings',
    title: 'Building an Innings',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Progressing from arrival to a large score by changing tempo as risk falls and information accumulates.',
    explanation: `Building an innings is the process by which a batter goes from having just arrived to being established, and then to scoring quickly.

The underlying logic is that a batter's risk of dismissal is **not constant**. It is highest in their first few deliveries, when they do not yet know the pace of the pitch, how much the ball is moving, or the bowler's plan. As those unknowns resolve, the same shot becomes safer.

So a conventionally built innings starts slowly and accelerates, not because the batter is being timid but because the information available changes.`,
    howItWorks: `The phases, as usually described:

**Arrival.** Watch the ball, play straight, take singles, avoid premeditation. The aim is to learn the conditions without giving up a wicket.

**Establishment.** Once the pace and movement are understood, the batter starts scoring in their reliable areas and against the bowlers they are comfortable with.

**Acceleration.** With the ball older, the field spread and the batter set, the risk of any given shot has fallen and the tempo rises.

**Conversion.** Turning a fifty into a hundred, which is a distinct skill: the risk profile resets slightly at milestones because bowlers change plans and batters change mentality.

A batter also has to manage the **other end**. Building an innings is done in partnerships, and a set batter is often taking the majority of the strike to protect a new arrival.`,
    tradeoffs: `The cost of building slowly is deliveries consumed. In a Test that cost is low; in a T20 it can be decisive, and a batter who takes fifteen balls to "get in" has used an eighth of the innings.

Modern T20 practice has pushed hard against the traditional model for exactly this reason, and some sides now explicitly instruct batters not to build but to attack immediately and accept dismissal. Whether that is better is genuinely contested and depends on the batting depth behind them.`,
    whenYouWillSeeIt: `Most visibly in Test cricket, where a batter's first hour and their fourth look like different players. Also in ODI middle overs.`,
    formatDifferences: `**Test:** the full model, over hours. **ODI:** compressed, with a clear obligation to accelerate. **T20:** heavily compressed and increasingly rejected, with sides preferring immediate aggression backed by batting depth.`,
    misunderstandings: `**"Building an innings means starting slowly regardless."** It means calibrating risk to information, and where deliveries are scarce that calculation changes.

**"A set batter is safe."** Risk falls; it does not disappear, and bowlers change plans against set batters.`,
    takeaways: `- Risk of dismissal is highest on arrival and falls as information accumulates.
- Arrival, establishment, acceleration, conversion.
- The cost is deliveries, which makes the model format-dependent.
- Modern T20 practice actively contests it.`,
    related: [
      'batting-tempo',
      'anchor',
      'risk-management-batting',
      'partnership',
      'batting-deep',
      'strike-rotation',
    ],
    order: 10,
  }),

  tactic({
    slug: 'targeting-a-bowler',
    title: 'Targeting a Bowler',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Deliberately attacking one bowler to score off the weakest link and to force a captain’s hand.',
    explanation: `Targeting a bowler means concentrating a batting side's aggression on one member of the attack, usually the least threatening, while playing the others more carefully.

The logic is that runs are not equally available against every bowler. A side needing eight an over does not need eight from everyone: it can take twelve from the fifth bowler and five from the best one, and arrive at the same place with much less risk.

There is a second, less obvious effect. A bowler being attacked successfully has to be taken off, which **disrupts the captain's plan** for the whole innings: the overs have to come from somewhere, and often from a bowler the captain wanted to keep back.`,
    howItWorks: `How a side identifies the target:

**Match-ups.** A left-hander against a left-arm orthodox spinner, or a batter strong against a particular length.

**The weakest bowler.** Usually the fifth bowler or a part-timer, whose overs have to be bowled at some point.

**Phase.** Attacking a bowler in the phase where the field favours the batter, rather than whenever they bowl.

Execution usually means **taking the strike** against that bowler, which is where strike farming and rotation come in, and being willing to take a calculated risk in their overs specifically.`,
    tradeoffs: `Targeting concentrates risk. Going hard at one bowler means playing high-risk shots in specific overs, and if wickets fall there the plan has failed twice over: the wicket is lost and the target bowler now has confidence.

It also depends on the captain cooperating. A captain who simply removes the targeted bowler after one expensive over denies the side its plan, and a captain who has hidden their weak bowler's overs until the death may make them impossible to attack.`,
    whenYouWillSeeIt: `Constantly in limited-overs cricket, and in Test cricket when a side wants quick runs before a declaration or is chasing.`,
    formatDifferences: `In T20 it is close to the default batting strategy: with four-over limits, every bowler must bowl, so the weakest one's overs are guaranteed to arrive. In Tests, a captain can simply not bowl their weakest option at all.`,
    misunderstandings: `**"Targeting means slogging at one bowler."** It means selecting where to take risk, which usually still involves shot selection rather than indiscriminate hitting.

**"You should target the worst bowler always."** If the captain can withhold them, the plan does not survive contact.`,
    takeaways: `- Concentrating aggression on the weakest link rather than spreading it.
- Also disrupts the captain's allocation of overs.
- Concentrates risk into specific overs.
- Near-default in T20, where every bowler must bowl.`,
    related: [
      'matchups',
      'strike-farming',
      'batting-tempo',
      'bowling-changes',
      'managing-overs',
      'aggressor',
    ],
    order: 20,
  }),

  tactic({
    slug: 'batting-through-the-innings',
    title: 'Batting Through the Innings',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'One batter remaining not out from start to finish, which is rarer and more valuable than its statistics suggest.',
    explanation: `A batter bats through the innings when they are at the crease when it begins and still there when it ends, having not been dismissed.

In multi-day cricket the specific version of this is **carrying the bat**: an opener who is not out when all ten wickets have fallen. It is genuinely rare, occurring only a handful of times in most decades of Test cricket, because it requires the batter to survive while ten teammates do not.

In limited-overs cricket the equivalent is an opener still batting at the end of the fiftieth over, which is more common but still notable.`,
    howItWorks: `What it requires, beyond skill:

**Surviving every phase.** The new ball, the middle overs, spin, reverse swing and the death: a batter batting through faces all of them.

**Strike management.** Batting through with the tail means farming the strike heavily, which is a skill in itself.

**Adaptation.** The innings' requirements change, and a batter who bats through has to change with them, from survival at the start to acceleration or protection at the end.`,
    tradeoffs: `Batting through is not itself an objective, and pursuing it can be counterproductive.

A batter who bats through slowly in a T20 has consumed a large share of the innings' deliveries at a below-par rate, which can cost more than the wicket they preserved. This is precisely the anchor debate, and it is unresolved.

In Test cricket the value is much clearer: occupying the crease has intrinsic worth, and a batter still there at the end has denied the bowlers a wicket for the entire innings.`,
    whenYouWillSeeIt: `Rarely in its pure form. **Carrying the bat** is a recognised achievement listed in cricket's records precisely because of its rarity.`,
    formatDifferences: `In Tests it is close to unambiguously valuable. In T20 it is a warning sign as often as an achievement, depending on the strike rate at which it was done.`,
    misunderstandings: `**"Batting through means a big score."** It means not being dismissed, which can be done for a modest score if the rest of the side collapses.

**"It is always a good thing."** In short formats, deliveries consumed at a low rate can outweigh the wicket preserved.`,
    takeaways: `- Not out from the start of an innings to its end.
- Carrying the bat, the multi-day version, is genuinely rare.
- Requires surviving every phase and heavy strike management.
- Clearly valuable in Tests, contested in T20.`,
    related: [
      'carrying-the-bat',
      'anchor',
      'strike-farming',
      'batting-tempo',
      'not-out',
      'building-an-innings',
    ],
    order: 30,
  }),

  tactic({
    slug: 'risk-management-batting',
    title: 'Risk Management',
    category: 'tactics-and-strategy',
    difficulty: 'advanced',
    summary:
      'Choosing which balls to take risks against, which is what batting decisions actually consist of.',
    explanation: `Every shot in cricket carries a probability of runs and a probability of dismissal. Batting well is not about eliminating the second: it is about **allocating** risk to the deliveries where the ratio is most favourable.

That reframing explains a great deal of what looks inconsistent about batting. A batter who leaves a ball outside off and then charges the next one down the pitch is not being erratic; they have judged that one ball offered a poor ratio and the next a good one.

The scarce resource determines the acceptable level. In a Test, where deliveries are unlimited, a batter can decline risk almost indefinitely. In a T20, declining risk has an immediate cost, so the acceptable level is far higher.`,
    howItWorks: `The inputs a batter is weighing on each ball:

**The delivery.** Length, line, pace, and whether it is in a scoring area.

**The field.** A shot into a gap is lower risk than the same shot to a fielder.

**Their own state.** A set batter's version of a shot is safer than a new batter's.

**The match situation.** Runs required, wickets in hand, overs remaining.

**The bowler.** Attacking the best bowler is a worse ratio than attacking the fifth.

Good batters are described as "playing the situation", which is this calculation performed repeatedly and quickly.`,
    tradeoffs: `The central trade is that **declining risk is itself risky** in limited-overs cricket, because a dot ball transfers the requirement to later deliveries at a higher rate.

This is the single most important idea in modern white-ball batting analysis, and it inverts the traditional framing: not scoring is not safe. It is deferred risk.

In Test cricket the trade genuinely favours caution, which is why the same batter should behave differently in the two formats.`,
    whenYouWillSeeIt: `Everywhere, but most legibly in a chase, where the required rate makes the arithmetic explicit.`,
    formatDifferences: `Test cricket permits near-total risk aversion. T20 punishes it. ODI cricket varies the answer by phase within a single innings.`,
    misunderstandings: `**"Good batting means not taking risks."** It means selecting them.

**"Blocking is the safe option."** In limited-overs cricket it defers the risk and usually increases it.

**"Risk management is a modern analytics idea."** The idea is old; the explicit quantification of it is recent.`,
    takeaways: `- Batting consists of allocating risk across deliveries, not avoiding it.
- The delivery, the field, the batter's state, the situation and the bowler all shift the ratio.
- Declining risk is deferred risk in limited-overs cricket.
- The correct level is set by which resource is scarce.`,
    related: [
      'batting-tempo',
      'building-an-innings',
      'dot-ball',
      'leaving-the-ball',
      'chase',
      'matchups',
    ],
    order: 40,
  }),

  tactic({
    slug: 'powerplay-batting',
    title: 'Powerplay Batting',
    category: 'tactics-and-strategy',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'Batting in the overs when only two fielders may be outside the circle, and the argument about how hard to attack.',
    explanation: `Powerplay batting is the approach a side takes during the fielding-restriction overs at the start of a limited-overs innings.

The opportunity is straightforward: with at most two fielders outside the circle under current ICC conditions, the boundary is largely unprotected and gaps in the ring are wide. Boundaries are more available than at any other point in the innings.

The complication is equally straightforward: the ball is new, so it is moving and bouncing, and the bowlers are fresh. The powerplay is simultaneously the easiest phase to score in and one of the likeliest to lose wickets in.`,
    howItWorks: `The two coherent approaches, and both are used at the highest level:

**Maximise.** Attack from the first ball, accept that wickets will fall, and rely on batting depth. The reasoning is that powerplay boundaries are the cheapest in the innings and a side that does not take them cannot recover the opportunity later.

**Preserve.** Score at a moderate rate without losing wickets, on the basis that wickets in hand enable acceleration later and that a side three down in the powerplay cannot attack in the middle overs.

Which is right is genuinely contested and depends on batting depth, the conditions, and the format. T20 practice has shifted substantially towards maximising over the past decade; ODI practice remains more mixed, because there are forty overs left to bat.`,
    tradeoffs: `**Attacking** converts a structural advantage into runs, and risks leaving the middle order rebuilding from a poor position.

**Preserving** protects the innings' foundation, and risks wasting the only phase where the field is up.

The resolution usually depends on **who bats at 7 and 8**. A side with genuine batting depth can afford the aggressive option; one whose batting ends at 6 usually cannot.`,
    whenYouWillSeeIt: `Every limited-overs innings. The clearest tell of a side's philosophy is what they do in the first two overs.`,
    formatDifferences: `In **T20** the powerplay is six overs of twenty, so nearly a third of the innings, and wasting it is very costly. In **ODIs** it is ten overs of fifty, and the case for preservation is stronger.`,
    misunderstandings: `**"You must attack in the powerplay."** It is a choice, and serious sides make it both ways.

**"Powerplay rules are the same everywhere."** They are competition-specific playing conditions.

**"The powerplay is the easiest phase."** Easiest to score in, and among the hardest to survive.`,
    takeaways: `- Fielding restrictions make boundaries cheapest here.
- The new ball makes wickets likeliest here too.
- Maximise or preserve: both are legitimate and the choice depends on batting depth.
- The T20 case for aggression is stronger than the ODI case.`,
    related: [
      'powerplay',
      'opener',
      'fielding-restrictions',
      'batting-deep',
      'batting-tempo',
      'new-ball',
    ],
    sourceKeys: [{ key: 'icc-playing-conditions', locator: 'Fielding restrictions' }],
    order: 50,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  tactic({
    slug: 'middle-overs-batting',
    title: 'Middle-overs Batting',
    category: 'tactics-and-strategy',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'Batting when the field is spread and boundaries are scarce, where most limited-overs matches are quietly decided.',
    explanation: `Middle-overs batting is the phase after the powerplay and before the final assault. The field is spread, spinners are usually bowling, and boundaries are hard to find.

It is the phase where sides most often lose matches without appearing to. Ten overs at four an over for no wicket looks stable and can leave a side needing an impossible rate, and the mistake is only visible later.

The core skill is **scoring without boundaries**: converting dot balls into singles and singles into twos, so the rate ticks along at five or six without the risk of hitting over a spread field.`,
    howItWorks: `What good middle-overs batting looks like:

**Strike rotation above all.** Working the ball into gaps for ones and twos, and running hard.

**Selective aggression.** Picking one or two bowlers or a specific over to attack, rather than trying to hit throughout.

**Using the feet against spin**, since a batter static in the crease against a spinner bowling into a spread field will not score.

**Managing wickets as an asset.** Wickets in hand are what fund the death overs, so the middle-overs job is to arrive at the last ten with both a rate and wickets.

The bowling side's mirror image is dot-ball pressure and containment, which is why the middle overs are often described as the phase where the bowling side can win by doing nothing spectacular.`,
    tradeoffs: `Too cautious and the required rate becomes unmanageable. Too aggressive against a spread field and wickets fall to catches in the deep, which removes the ability to accelerate later.

The genuine difficulty is that both failures look similar at the time and only diverge in the last ten overs.`,
    whenYouWillSeeIt: `Overs 11 to 40 of an ODI, and roughly 7 to 15 of a T20.`,
    formatDifferences: `In ODIs the middle overs are long enough to have their own internal shape, and the fielding restrictions change at over 40. In T20 the phase is short and the transition to the death is almost immediate.`,
    misunderstandings: `**"The middle overs are for consolidation."** Consolidation without a scoring rate is how sides lose from a position that looks secure.

**"Boundaries are the only way to score quickly."** Two twos an over and two singles is eight, which is a T20 death rate achieved without a boundary.`,
    takeaways: `- Field spread, spin bowling, boundaries scarce.
- Scoring without boundaries via rotation and hard running.
- Arrive at the death with both a rate and wickets.
- Where matches are quietly lost.`,
    related: [
      'middle-overs',
      'strike-rotation',
      'dot-ball-pressure',
      'playing-against-spin',
      'batting-tempo',
      'batting-deep',
    ],
    order: 60,
  }),

  tactic({
    slug: 'death-overs-batting',
    title: 'Death-overs Batting',
    category: 'tactics-and-strategy',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'intermediate',
    summary:
      'Maximising runs in the final overs, when wickets are cheap and every delivery is a scoring opportunity or a waste.',
    explanation: `Death-overs batting is the closing phase of a limited-overs innings, where the batting side is trying to score at the maximum sustainable rate.

The economics invert almost completely. With few deliveries left, a **wicket costs little** and a **dot ball costs a great deal**, because there are no future overs in which to make up the difference. A batter who is dismissed in the nineteenth over of a T20 has cost their side almost nothing if they were attacking; one who plays out four dots has cost them significantly.

The bowling is also specialised: yorkers, wide yorkers, slower balls, and a field with almost everyone on the boundary.`,
    howItWorks: `What death-overs batters actually do:

**Premeditate selectively.** Deciding in advance to attack a particular ball or area, because there is no time to react to a yorker.

**Use shots designed for full deliveries.** The ramp, the scoop and hitting straight, since a well-bowled yorker cannot be hit conventionally.

**Target the shorter boundary** and the weaker fielder.

**Force the bowler to change.** Moving in the crease before delivery so the bowler misses their length, which converts a yorker into a full toss.

**Run relentlessly.** Twos in the death overs are worth as much as they are hard, because the fielders are deep.`,
    tradeoffs: `The trade is explicit and accepted: a much higher chance of dismissal in exchange for a much higher scoring rate. It is correct precisely because wickets have lost most of their value.

The risk that remains real is **losing too many too early in the phase**. A side four down entering the last five overs still has a full complement of hitters; a side eight down does not, and then even the death overs have to be batted carefully.`,
    whenYouWillSeeIt: `Last ten overs of an ODI, last five of a T20, and any chase in its closing stages.`,
    formatDifferences: `In T20 the death phase is a quarter of the innings and the skills are a selection criterion. In ODIs it is a fifth, and a side usually still has set batters. In Tests the concept does not exist.`,
    misunderstandings: `**"Death batting is slogging."** The best death batters are selecting balls and using specific shots against specific lengths.

**"Wickets do not matter at the death."** They matter less. Losing four in three overs still ends an innings.

**"A dot ball is neutral."** At the death it is close to the most expensive outcome available.`,
    takeaways: `- Wickets are cheap and dot balls expensive.
- Premeditation and shots built for yorkers are the core skills.
- Running twos matters as much as boundaries.
- Losing too many wickets too early still ends the phase.`,
    related: [
      'death-overs',
      'finisher',
      'scoop',
      'ramp-shot',
      'death-bowling',
      'dot-ball',
      'yorker',
    ],
    order: 70,
  }),

  tactic({
    slug: 'setting-a-target',
    title: 'Setting a Target',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Batting first to a total, and the different problem it presents from chasing a known number.',
    explanation: `Setting a target means batting first without knowing what will be enough.

That is the whole difficulty. A chasing side has a number; a side batting first has to estimate one, and the estimate depends on the pitch, the boundary size, the dew, the opposition and how the surface will behave in the second innings.

The estimate is usually described as a **par total** for the conditions, and a side batting first is trying to beat it by enough to have a margin.`,
    howItWorks: `The inputs a side batting first is weighing:

**The pitch.** Whether it will get slower, turn more, or stay true.

**Dew**, in night matches, which typically makes chasing easier by making the ball skid and gripping harder for spinners.

**Boundary size** and ground dimensions.

**The opposition's batting depth**, since a deep batting side can chase a bigger total.

**Whether the pitch will deteriorate**, which in multi-day cricket makes batting first far more attractive.

In multi-day cricket the equivalent decision is the **declaration**: setting a target explicitly, with the additional variable of how much time to leave.`,
    tradeoffs: `Batting first gives up information and gains first use of the surface. Which matters more is conditions-specific, and the toss decision is exactly this judgement.

The specific risk of setting a target is **misjudging par**. A side that makes 160 on a pitch where par was 180 has lost the match during their own innings, and the mistake is only visible later.

There is also a psychological asymmetry frequently described by players: a side defending a total is under pressure that a side chasing a small target is not, which is one argument for setting a target large enough to change the chasing side's approach.`,
    whenYouWillSeeIt: `Every match, for whichever side bats first. In multi-day cricket, most visibly at a declaration.`,
    formatDifferences: `In limited-overs cricket, setting a target is about estimating par. In Tests, it is about the declaration: how large a target, and how much time to leave to bowl the opposition out.`,
    misunderstandings: `**"Batting first is safer."** It concedes information, and in night matches dew frequently makes it a disadvantage.

**"A big total is always better."** In multi-day cricket batting on too long to build a bigger target can cost the time needed to win.

**"Par is a fixed number for a ground."** It shifts with the pitch, the weather and the sides.`,
    takeaways: `- Batting first means estimating what will be enough.
- Pitch, dew, boundaries and opposition depth all shift the estimate.
- Misjudging par loses matches during your own innings.
- In multi-day cricket the same decision appears as a declaration.`,
    related: [
      'target',
      'chase',
      'declaration',
      'par-score',
      'dew',
      'batting-tempo',
      'pitch-deterioration',
    ],
    order: 80,
  }),

  // ── Bowling strategy ──────────────────────────────────────────────────────
  tactic({
    slug: 'new-ball-bowling',
    title: 'New-ball Bowling',
    category: 'tactics-and-strategy',
    alsoIn: ['pace-bowling', 'red-ball-concepts'],
    difficulty: 'intermediate',
    summary:
      'Bowling with the hardest, shiniest ball against batters who have just arrived, which is the best chance a bowling side gets.',
    explanation: `New-ball bowling is the opening phase of an innings, with a hard ball that swings, seams and carries, against batters who have not yet judged the conditions.

The two advantages compound. The ball is at its most dangerous at exactly the moment the batters know least, which is why the majority of top-order dismissals in red-ball cricket happen in the first twenty overs.

A bowling side that does not take wickets with the new ball has usually surrendered its best opportunity, and the innings becomes much harder work.`,
    howItWorks: `The standard plan in red-ball cricket:

**A good length just outside off stump**, looking for the outside edge, with an attacking field: two or three slips and a gully.

**Consistency first.** The new-ball bowler's job is to make the batter play repeatedly at a ball that might move, rather than to try something different each delivery.

**Straighten occasionally**, to bring LBW and bowled into play and to stop the batter simply leaving.

**Use the conditions.** If it is swinging, bowl fuller; if it is seaming, bowl a good length; if neither, use the hardness and bounce to hit a shorter length.

In white-ball cricket the plan differs: the field is up, so the bowler has to balance attacking the stumps against conceding boundaries in the ring, and a fuller length that invites the drive is riskier.`,
    tradeoffs: `Bowling fuller increases both the chance of an edge and the chance of being driven. Bowling shorter is safer and less likely to take a wicket. That trade is made ball by ball.

There is also a **workload** trade: the new-ball bowlers are usually the side's best, and using them for a long opening spell means they are less fresh later, including for a second new ball or a reversing ball.`,
    whenYouWillSeeIt: `The opening overs of every innings, and again after a second new ball is taken in a Test.`,
    formatDifferences: `In Tests, long spells with an attacking field and the outside edge as the target. In ODIs, ten overs of powerplay bowling where containment matters alongside wickets. In T20, one or two overs each with the field up, where a wicket is a bonus and a cheap over is the primary aim.`,
    misunderstandings: `**"The new ball always does something."** How much it swings or seams varies unpredictably, and a new ball on a flat, dry pitch can do very little.

**"New-ball bowling means bowling fast."** Accuracy and a stable seam matter more; several outstanding new-ball bowlers have been fast-medium.`,
    takeaways: `- Hardest ball, most movement, least-informed batters.
- Good length outside off with an attacking field is the red-ball default.
- Fuller invites both the edge and the drive.
- Not taking new-ball wickets surrenders the best chance.`,
    related: [
      'new-ball',
      'swing-bowling',
      'seam-bowling',
      'slip',
      'good-length',
      'second-new-ball',
      'opener',
    ],
    order: 90,
  }),

  tactic({
    slug: 'bowling-partnerships',
    title: 'Bowling Partnerships',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Two bowlers operating in tandem from opposite ends, whose combined effect exceeds their individual figures.',
    explanation: `Because bowling alternates ends, bowlers always operate in pairs. A bowling partnership is two bowlers working in tandem for a period, and the pairing is a real tactical unit rather than an accident of the over structure.

The effect is that a batter faces two different problems in alternate overs, with no respite in between. If both bowlers are bowling well, the batter never gets the loose over that releases pressure.

Well-known partnerships in cricket history are usually described in terms of contrast: one bowler moving the ball away and one bringing it back, one full and one short, one from wide of the crease and one close to the stumps.`,
    howItWorks: `What captains are looking for in a pairing:

**Complementary movement.** An outswing bowler and an inswing bowler; an off spinner and a left-arm orthodox spinner, who between them turn the ball both ways to any batter.

**Complementary length.** One attacking the stumps, one hitting the pitch harder.

**Pressure continuity.** Both bowlers need to be economical, because one expensive end releases the pressure the other is building.

**Ends.** A slope, a crosswind or the position of the rough can make one end much better for a particular bowler, and a captain assigns accordingly.`,
    tradeoffs: `Keeping a good partnership going means **not** using other bowlers, which costs their freshness later and gives the batters no new problems to solve if they have got used to the pair.

There is also a fatigue cost: two bowlers in tandem for eight overs each is sixteen overs of work, and a captain has to weigh a partnership that is working against the state of the bowlers bowling it.`,
    whenYouWillSeeIt: `Most legibly in Test cricket, where partnerships last for long spells. In T20 the concept survives in the sense that captains pair bowlers deliberately, though the four-over limits mean partnerships are short.`,
    formatDifferences: `Tests reward sustained partnerships. Limited-overs cricket, with per-bowler limits and phase-based planning, produces shorter pairings chosen more for match-ups than for sustained pressure.`,
    misunderstandings: `**"Bowling is an individual contest."** The over structure makes it inherently paired.

**"Two good bowlers make a good partnership."** Two bowlers doing the same thing give the batter one problem twice, rather than two problems.`,
    takeaways: `- Bowlers necessarily operate in pairs because bowling changes ends.
- Contrast, not similarity, is what makes a pairing effective.
- One expensive end releases the pressure the other builds.
- Sustaining a partnership costs other bowlers' freshness.`,
    related: [
      'bowling-spell',
      'building-pressure',
      'bowling-changes',
      'ends',
      'dot-ball-pressure',
      'matchups',
    ],
    order: 100,
  }),

  tactic({
    slug: 'building-pressure',
    title: 'Building Pressure',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Accumulating dot balls and denying scoring options so that the batter takes a risk they would not otherwise take.',
    explanation: `Building pressure means bowling and fielding so that a batter's scoring options close down, on the theory that a batter who cannot score will eventually attempt something they should not.

The mechanism is indirect, and that is the point. The wicket, when it comes, may be to a poor shot rather than to a great delivery, and the delivery that takes it may look ordinary. The overs that created the situation do not appear in the analysis.

It is the central idea behind economical bowling in every format, and the reason a maiden over has value beyond the runs it saves.`,
    howItWorks: `The components:

**Accuracy.** Repeatedly bowling in the same difficult area, so the batter faces the same problem without relief.

**A field that closes the cheap options.** If the ring is set well, the singles that would release pressure are not available.

**Both ends.** One economical bowler and one expensive one produces no pressure at all, which is why bowling partnerships matter.

**Time.** Pressure is cumulative. Three dot balls is not pressure; three overs of dot balls with a spread field and a rising required rate is.

In limited-overs cricket the mechanism is more direct, because the required rate rises mechanically with every dot ball, and the batter is forced into risk by arithmetic rather than by psychology.`,
    tradeoffs: `Pressure bowling is not the same as attacking bowling, and the two can conflict. A bowler bowling back of a length to a defensive field may concede very little and create very few chances; one attacking the stumps with an attacking field may create chances and concede more.

Which is right depends on the format and the situation. A Test side needing wickets on the final afternoon cannot wait for pressure to work; a T20 side defending a total often should.

There is also a genuine analytical question about **how much** of the effect is real. That dot-ball pressure exists in limited-overs cricket is arithmetically undeniable. The claim that it produces wickets through psychological effect in Test cricket is more debated, and the evidence is harder to isolate.`,
    whenYouWillSeeIt: `Middle overs of limited-overs innings, and long Test spells against a set batter.`,
    formatDifferences: `In limited-overs cricket the pressure is arithmetic. In Tests it is psychological and situational, and its effect is harder to demonstrate.`,
    misunderstandings: `**"Pressure bowling means defensive bowling."** It means denying options, which can be done with an attacking field and a wicket-taking length.

**"The bowler who takes the wicket created the pressure."** Frequently the partner at the other end did.

**"Pressure always produces a wicket."** It raises the probability; good batters absorb it for long periods.`,
    takeaways: `- Deny scoring options so the batter takes an avoidable risk.
- Needs accuracy, a good field, and both ends contributing.
- Arithmetic in limited-overs cricket, psychological and contested in Tests.
- Can conflict with attacking bowling.`,
    related: [
      'dot-ball-pressure',
      'defensive-bowling',
      'bowling-partnerships',
      'maiden-over',
      'field-setting',
      'middle-overs',
    ],
    order: 110,
  }),

  tactic({
    slug: 'dot-ball-pressure',
    title: 'Dot-ball Pressure',
    category: 'tactics-and-strategy',
    alsoIn: ['statistics-and-analytics'],
    difficulty: 'intermediate',
    summary:
      'The specific mechanism by which unscored deliveries force a batting side into risk, and the clearest case of pressure being arithmetic.',
    explanation: `A dot ball is a delivery off which no run is scored. Dot-ball pressure is the effect of accumulating them.

In **limited-overs cricket** the mechanism is not psychological at all: it is arithmetic. Every dot ball reduces the deliveries remaining without reducing the runs required, so the required rate rises. A side that plays out six dot balls in a chase has not merely failed to score six runs; it has made every subsequent delivery harder.

That is why dot-ball percentage is a genuinely meaningful bowling statistic in white-ball cricket, and why a maiden over in a T20 is worth substantially more than six runs saved.`,
    howItWorks: `Worked through: a T20 side needs 60 from 30 balls, a required rate of 12. They play out four dots and score 2 from the other two balls of the over.

They now need 58 from 24, which is a required rate of **14.5**. Six deliveries have raised the required rate by two and a half runs an over.

That escalation is what forces the risk. The batting side does not choose to attack a good ball because they have lost their nerve; they do it because the arithmetic has removed the alternative.

For the bowling side the corollary is that dots are a wicket-taking strategy, not merely a containment one.`,
    tradeoffs: `Bowling for dots and bowling for wickets are not always the same. A bowler bowling wide of off stump into a spread field may concede few runs and take no wickets, and against a side well ahead of the required rate that achieves nothing.

There is also a limit: a batting side sufficiently far ahead can absorb dots comfortably, and a bowling side that only bowls for dots gives a set batter no reason to take a risk.

In **Test cricket** the arithmetic mechanism is absent entirely, since there is no required rate. Dot balls there work through the psychological and situational channel, which is real in players' accounts but much harder to demonstrate.`,
    whenYouWillSeeIt: `Middle and death overs of limited-overs innings, and most legibly in a chase where the required rate is on screen and visibly climbing.`,
    formatDifferences: `A central, quantifiable mechanism in T20 and ODI cricket. In Tests, a much weaker and more contested effect, because a batter can decline to score indefinitely.`,
    misunderstandings: `**"A dot ball just saves a run."** In a chase it raises the required rate for every remaining ball.

**"Dot-ball pressure works the same in Tests."** Without a required rate the arithmetic mechanism does not exist.

**"Bowling for dots is the same as bowling for wickets."** They frequently coincide and are not the same objective.`,
    takeaways: `- A dot ball raises the required rate for every remaining delivery.
- In limited-overs cricket the pressure is arithmetic, not psychological.
- Makes dot-ball percentage a genuinely meaningful bowling number.
- The mechanism does not transfer to Test cricket.`,
    related: [
      'dot-ball',
      'dot-ball-percentage',
      'building-pressure',
      'required-run-rate',
      'defensive-bowling',
      'maiden-over',
    ],
    order: 120,
  }),

  tactic({
    slug: 'attacking-the-stumps',
    title: 'Attacking the Stumps',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Bowling straight enough that the ball threatens the wicket, bringing bowled and LBW into play.',
    explanation: `Attacking the stumps means bowling a line at or close to the wicket, so that a ball the batter misses is likely to hit it.

Its advantage over bowling outside off is that it **converts its own errors**. An outside-edge dismissal needs a fielder to catch it; a ball hitting the stumps or the front pad needs nobody at all. Bowled and LBW together account for a substantial share of all dismissals, and both require the ball to be heading for the wicket.

It also removes the batter's option to leave. A ball outside off can be ignored; a ball at the stumps must be played.`,
    howItWorks: `The consequences of bowling straighter:

**LBW and bowled become live**, and the fielding side needs fewer catchers.

**The batter cannot leave**, so they must play at more deliveries.

**Scoring options open on the leg side.** A straight ball can be worked off the pads, which is why attacking the stumps concedes more singles than a channel outside off.

**The field changes.** Fewer slips, more fielders straight and on the leg side.

It pairs naturally with movement **in** to the batter: an inswinger, an off break, or reverse swing, all of which threaten the stumps from a line the batter might otherwise have left.`,
    tradeoffs: `The straight line is more attacking in one sense and more expensive in another. Bowling at the stumps offers the batter the pads and the leg side, which are the easiest areas to score in with low risk.

Bowling outside off is safer and slower: fewer runs conceded, fewer dismissals available without a catcher.

Which is right depends on what the ball is doing and on the format. On a pitch offering nothing, attacking the stumps at least creates a chance of an error; with the ball swinging away, the channel outside off is more productive.`,
    whenYouWillSeeIt: `To tail-end batters, where hitting the stumps is the most likely dismissal. On flat pitches where edges are not carrying. And at the death, where a yorker at the base of the stumps is both the hardest ball to hit and a wicket threat.`,
    formatDifferences: `In Tests it is a change of plan rather than a default, used when the outside-off channel is not working. In T20 it is more common, because the alternative concedes boundaries square of the wicket.`,
    misunderstandings: `**"Straight is always the attacking line."** It brings LBW into play and gives the batter the leg side. It is attacking in one direction and generous in another.

**"Bowling at the stumps means bowling at middle."** Usually a line at or just outside off, close enough to threaten the wicket while limiting the leg-side option.`,
    takeaways: `- Brings bowled and LBW into play, needing no fielder.
- Removes the batter's option to leave.
- Concedes the pads and the leg side.
- Pairs with movement in to the batter.`,
    related: [
      'lbw',
      'bowled',
      'yorker',
      'inswinger',
      'line',
      'field-setting',
      'wicket-taking-bowling',
    ],
    order: 130,
  }),

  tactic({
    slug: 'bowling-to-a-field',
    title: 'Bowling to a Field',
    category: 'tactics-and-strategy',
    alsoIn: ['field-positions'],
    difficulty: 'intermediate',
    summary:
      'Bowling the line and length the field is set for, so that the batter’s best options are the ones covered.',
    explanation: `A field and a bowling plan are one thing, not two. A field is set on the assumption that the bowler will bowl in a particular area; if the bowler bowls somewhere else, the field is wrong and the runs come.

"Bowling to your field" is the discipline of delivering the ball the field was set for. Its opposite, a bowler who sets an off-side field and then bowls at the pads, is one of the most common ways an over goes for runs without any good batting.`,
    howItWorks: `The relationship in both directions:

**Field follows plan.** A bowler intending to bowl outside off gets slips and a gully and few leg-side fielders. One intending to bowl straight gets a squarer leg-side ring and fewer catchers.

**Plan follows field.** Once the field is set, the bowler's options narrow. With no deep square leg, a short ball to a batter who pulls well is a bad idea regardless of what the bowler fancies.

**The captain and bowler negotiate.** A field change is usually a bowler asking for one, and a captain refusing a change is refusing the plan behind it.

The most legible version is in limited-overs cricket, where a captain has a limited number of fielders outside the circle and must choose which boundary to protect. Protecting the leg side and then bowling a line the batter can hit to leg is a straightforward error.`,
    tradeoffs: `A field cannot cover everything, so every field concedes something deliberately. The trade is which scoring area to leave open, and the bowler's job is to make the open area the hardest one for that batter to access.

The cost of a very specific field is that it is **readable**. A batter who sees three fielders on the leg-side boundary knows what is coming, and a good batter will plan for the ball the field implies.`,
    whenYouWillSeeIt: `Every over. It is most visible when it fails: a captain visibly frustrated after a bowler bowls a leg-side ball with a packed off-side field.`,
    formatDifferences: `In limited-overs cricket the fielding restrictions make the trade explicit and the readability problem worse. In Tests a captain can set a field of nine catchers if they choose, and the plan can be more elaborate.`,
    misunderstandings: `**"The field is set for the batter."** It is set for the **bowling plan** against that batter, which is a different thing.

**"A good bowler can bowl to any field."** They can bowl anywhere; the point is that only some of those places are consistent with the field.`,
    takeaways: `- A field encodes a bowling plan and only works if the plan is executed.
- Every field concedes something deliberately.
- Very specific fields are readable by good batters.
- Most failures here are the bowler missing the intended area, not bad batting.`,
    related: [
      'field-setting',
      'cricket-field-positions',
      'fielding-restrictions',
      'line',
      'length',
      'defensive-bowling',
    ],
    order: 140,
  }),

  tactic({
    slug: 'short-ball-strategy',
    title: 'Short-ball Strategy',
    category: 'tactics-and-strategy',
    alsoIn: ['pace-bowling'],
    difficulty: 'advanced',
    summary:
      'A deliberate plan of short-pitched bowling, and the field and Law constraints that make it work or fail.',
    explanation: `A short-ball strategy is a sustained plan to bowl short at a batter, rather than the occasional bouncer as a surprise.

Its purposes are layered. It can take a wicket directly, from a fend or a top edge. It can push a batter onto the back foot so the subsequent fuller ball is harder to defend. And it can be physically wearing, particularly against lower-order batters.

The strategy only works with the **field set for it**. A short ball with nobody catching behind square on the leg side and nobody deep is a free boundary.`,
    howItWorks: `The apparatus:

**The field.** Typically a deep leg-side fielder or two for the top edge, a gully or leg gully for the fend, and sometimes a short leg. The field is the tell: two deep fielders behind square on the leg side means bouncers are coming.

**The variation.** Short balls alone are hittable. The plan is short balls plus a fuller one, and the fuller one is usually where the wicket comes.

**Pace and bounce.** The strategy needs both. A slow short ball is a long hop.

**The Laws.** Under **Law 41**, dangerous and unfair short-pitched bowling is prohibited, judged by the umpire on repetition, the batter's skill and the risk of injury. Umpires issue warnings and can remove a bowler from the attack. Separately, some competitions' playing conditions **limit bouncers per over**, and balls passing above head height may be called wide or no-ball depending on the conditions.

So a short-ball strategy operates inside a regulatory boundary that the umpire polices in real time.`,
    tradeoffs: `**Gained:** wicket chances from the fend and the top edge, and a batter's uncertainty about length.

**Lost:** the strategy commits fielders to catching positions rather than run-saving ones, and a batter who pulls and hooks well can score very quickly off it. It is also expensive in energy for the bowler.

Against a good short-ball player with a big leg-side boundary, the plan can simply be wrong.`,
    whenYouWillSeeIt: `On bouncy pitches, against batters strong on the front foot, against tail-enders, and in Tests where a captain has decided the outside-off channel is not producing.`,
    formatDifferences: `More common in Tests, where the field can be set fully for it and the batter cannot simply accept the risk. In T20 it is used sparingly, because a mistimed short ball is a boundary and the per-over economics punish it.`,
    misunderstandings: `**"Bouncers are unlimited."** Law 41 constrains dangerous and unfair short-pitched bowling, and some competitions cap bouncers per over.

**"Short-ball bowling is intimidation only."** It produces real wicket chances and sets up fuller deliveries.

**"Any bowler can use it."** It needs pace and bounce; without them it is the most expensive plan in cricket.`,
    takeaways: `- Sustained short bowling, with the field set for the fend and the top edge.
- Works through the fuller ball that follows as much as directly.
- Constrained by Law 41 and by competition bouncer limits.
- Needs genuine pace, and is expensive against a good short-ball player.`,
    related: [
      'bouncer',
      'short-ball',
      'long-leg',
      'leg-gully',
      'playing-short-pitched-bowling',
      'hook-shot',
      'field-setting',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 41.6' }, { key: 'icc-playing-conditions' }],
    order: 150,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  tactic({
    slug: 'defensive-bowling',
    title: 'Defensive Bowling',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Bowling to restrict runs rather than to take wickets, which is a legitimate objective rather than a failure of ambition.',
    explanation: `Defensive bowling aims primarily at **containment**: denying the batter scoring opportunities, accepting fewer wicket chances in exchange.

It is not a lesser form of bowling. In limited-overs cricket, restricting a side to 140 rather than 180 is frequently worth more than taking an extra wicket, and the bowlers who do it are selected and paid for it.

In Test cricket the purpose is different: defensive bowling holds an end while the other bowler attacks, protects a lead, or simply denies a set batter runs until the pressure produces an error.`,
    howItWorks: `The typical components:

**A line and length that offers nothing.** Back of a length outside off is the archetype: too short to drive, too full to pull, and away from the stumps.

**A field that covers the easy scoring areas**, usually with fielders in the ring rather than catchers.

**Consistency over variation.** A defensive bowler's value is that the batter faces the same problem repeatedly.

**Accepting singles.** A defensive plan usually concedes ones deliberately to prevent boundaries, and in limited-overs cricket that trade is explicitly correct.`,
    tradeoffs: `The cost is chances. A bowler bowling back of a length away from the stumps is unlikely to produce an LBW or a bowled, and edges to a defensive field carry less often.

That matters most when a side **needs wickets**: in a Test's final session, or in a limited-overs match where the opposition is comfortably ahead. Defensive bowling in those situations is simply the wrong plan, and captains are criticised for persisting with it.

There is also a genuine argument that defensive bowling produces wickets **indirectly** through pressure, which is real in limited-overs cricket via the required rate and more contested in Tests.`,
    whenYouWillSeeIt: `Middle overs of limited-overs innings; Test spells against a set batter; and any situation where a captain is protecting a position rather than pursuing one.`,
    formatDifferences: `In limited-overs cricket containment is often the primary objective. In Tests it is a supporting role, since a side must take twenty wickets to win and cannot contain its way to victory.`,
    misunderstandings: `**"Defensive bowling is negative."** In limited-overs cricket it is frequently the winning strategy.

**"A defensive bowler cannot take wickets."** Containment creates pressure, and in a chase that pressure is arithmetic.

**"Defensive means bowling slowly or short."** It means bowling where scoring is hardest, which varies by batter and conditions.`,
    takeaways: `- Restriction as the primary objective, with fewer chances accepted.
- Back of a length away from the stumps, with a run-saving field.
- Correct in limited-overs cricket; a supporting role in Tests.
- Wrong when a side urgently needs wickets.`,
    related: [
      'dot-ball-pressure',
      'building-pressure',
      'back-of-a-length',
      'economy-rate',
      'wicket-taking-bowling',
      'middle-overs',
    ],
    order: 160,
  }),

  tactic({
    slug: 'wicket-taking-bowling',
    title: 'Wicket-taking Bowling',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'Bowling to dismiss the batter rather than to restrict them, accepting more runs for more chances.',
    explanation: `Wicket-taking bowling prioritises **chances** over economy. It bowls the lengths and lines that produce dismissals, with a field of catchers rather than run-savers, and accepts that this will concede more runs.

The clearest example is the new-ball plan in a Test: a full length outside off, three slips and a gully. That plan concedes drives and edges through the covers, and it is correct anyway, because the objective is twenty wickets.`,
    howItWorks: `What distinguishes it:

**Fuller lengths**, which invite the drive and produce the edge, and which bring bowled and LBW into play.

**Attacking lines**, either at the stumps or in the channel outside off, rather than away from both.

**Catchers rather than savers.** Slips, gully, short leg, and boundary riders only where a specific catch is expected.

**Variation used deliberately** to produce a false shot rather than to avoid one.

The corollary is that a wicket-taking plan needs to be **funded**. A captain can only afford an attacking field at one end, or in a limited-overs match for a few overs, so the plan is deployed rather than sustained.`,
    tradeoffs: `The explicit trade is runs for chances. In a Test that is usually worth it, because a side cannot win without wickets and runs conceded are only one of two currencies.

In limited-overs cricket the trade is much finer. Conceding forty extra runs to take two extra wickets may be a bad deal, particularly in the middle overs against a side with batting depth. Sides therefore choose their phases: attack with the new ball, contain in the middle, and attack again at the death where wickets stop the acceleration.

Whether a wicket-taking approach is worth its runs in T20 is one of the genuine analytical questions in the format, and practice differs between sides.`,
    whenYouWillSeeIt: `With the new ball; against a new batter; on the final day of a Test; and at the death in limited-overs cricket where a wicket removes a set hitter.`,
    formatDifferences: `Necessary in Tests, since twenty wickets are required. Selective in ODIs. Contested in T20, where the economy cost is high and the value of a wicket is lower.`,
    misunderstandings: `**"Attacking bowling is always better."** It costs runs, which in limited-overs cricket can outweigh the chances gained.

**"Wicket-taking bowling means bowling fast."** It means fuller, straighter and with catchers, which is available to any bowler.

**"A wicket is always worth conceding runs for."** In T20 that is genuinely arguable, and sides differ.`,
    takeaways: `- Prioritises chances, accepting a higher run rate.
- Fuller lengths, attacking lines, catchers rather than savers.
- Necessary in Tests; a phase-based choice in limited-overs cricket.
- Its value in T20 is genuinely contested.`,
    related: [
      'new-ball-bowling',
      'attacking-the-stumps',
      'defensive-bowling',
      'field-setting',
      'slip',
      'bowling-average',
    ],
    order: 170,
  }),

  // ── Captaincy ─────────────────────────────────────────────────────────────
  tactic({
    slug: 'field-setting',
    title: 'Field Setting',
    category: 'tactics-and-strategy',
    alsoIn: ['field-positions'],
    difficulty: 'intermediate',
    summary:
      'Placing the nine fielders to make the batter’s best options the ones that are covered.',
    explanation: `Field setting is the captain's allocation of nine fielders around the ground. It is the most continuously visible tactical activity in cricket and the one most often misread as fussing.

Every field is a **statement of what the captain is willing to concede**. Nine fielders cannot cover the ground, so a field always leaves areas open, and the skill is in leaving open the areas this batter is least able to exploit against this bowler.

A field also encodes the bowling plan. Three slips means the bowler will bowl outside off; two deep on the leg side means bouncers; a sweeper on the off side means singles are acceptable and fours are not.`,
    howItWorks: `The recurring decisions:

**Catchers or savers.** Every slip is a fielder not saving runs. A captain adds catchers when the ball is doing enough for edges and removes them when it is not.

**Which boundary to protect.** In limited-overs cricket with a cap on fielders outside the circle, the captain chooses which boundaries are defended and which are conceded.

**Up or back in the ring.** Fielders close in save singles and concede the ball through them; deeper in the ring does the reverse.

**Handedness.** The whole field mirrors for a left-hander, which is why left-right batting pairs cost fielding sides time and create errors.

**Constraints.** Law 28 permits at most two fielders behind square on the leg side, always. Limited-overs playing conditions cap fielders outside the circle by phase.`,
    tradeoffs: `The fundamental trade is **singles against boundaries**. A ring pushed up saves ones and concedes fours through the gaps; a ring pushed back does the opposite. In limited-overs cricket the arithmetic usually favours conceding ones.

The second trade is **chances against runs**. Catchers create wickets and cost runs.

A third, less discussed, is **readability**. A field set precisely for one plan tells a good batter exactly what is coming, and captains sometimes set a deliberately neutral field to conceal the plan.`,
    whenYouWillSeeIt: `Continuously. A captain adjusts several positions an over, and the changes are among the most informative things to watch: they tell you the plan before the ball is bowled.`,
    formatDifferences: `In Tests the captain has complete freedom and can set nine catchers. In limited-overs cricket the phase restrictions dominate the decision, and field setting becomes largely a question of which boundaries to protect.`,
    misunderstandings: `**"There is a standard field."** There are conventional fields, and every captain adjusts them constantly.

**"Fielders are placed where the batter hits."** They are placed to cover the plan's expected outcomes, which may be where the batter should not hit.

**"More catchers is more aggressive."** Only if the bowling is producing edges; otherwise it is fielders doing nothing.`,
    takeaways: `- Nine fielders cannot cover the ground; a field chooses what to concede.
- A field encodes the bowling plan and is readable by good batters.
- Central trades: singles against boundaries, chances against runs.
- Law 28 and limited-overs restrictions constrain the options.`,
    related: [
      'cricket-field-positions',
      'bowling-to-a-field',
      'fielding-restrictions',
      'matchups',
      'powerplay',
      'short-ball-strategy',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 28' }],
    order: 180,
  }),

  tactic({
    slug: 'bowling-changes',
    title: 'Bowling Changes',
    category: 'tactics-and-strategy',
    difficulty: 'intermediate',
    summary:
      'When a captain switches bowlers, and why the timing is one of captaincy’s hardest judgements.',
    explanation: `A bowling change is the captain replacing one bowler with another. Because bowling alternates ends, changes happen at the end of an over and affect a pairing rather than a single bowler.

The decision is harder than it looks because the information is ambiguous. A bowler who has conceded runs may be bowling badly or may be unlucky; a bowler who is bowling well may be about to tire. And every change spends a resource: a bowler taken off cannot be brought straight back, and in limited-overs cricket their remaining overs are finite.`,
    howItWorks: `What captains are weighing:

**Match-ups.** A new batter, or a left-hander arriving, can justify an immediate change regardless of how the current bowler is going.

**Fatigue.** A fast bowler's pace falls measurably through a spell, and a captain watching the speed gun is watching for that.

**Conditions.** A new ball, the ball starting to reverse, or a spinner becoming viable as the pitch dries.

**Over allocation.** In limited-overs cricket, holding a bowler's overs back for the death is a decision made ten overs earlier.

**Rhythm.** Taking off a bowler who is bowling well because they have bowled a set number of overs is a common error, and so is leaving on a bowler who has visibly lost their length.

**Ends.** A bowler ineffective from one end can be transformed from the other, so a change of ends is a change short of a substitution.`,
    tradeoffs: `Changing too early wastes a bowler who was building pressure and hands the batters relief. Changing too late concedes runs and lets a batter get set.

In limited-overs cricket there is an additional and unforgiving trade: **overs held back are overs not bowled now**. A captain saving their best bowler for the nineteenth over is accepting worse bowling in the fourteenth, and if the match is lost in the fourteenth the plan was wrong.`,
    whenYouWillSeeIt: `Constantly, and most consequentially at the start of the death overs, when a captain commits their remaining bowling.`,
    formatDifferences: `In Tests, changes are about spells, fatigue and conditions, and a captain can bowl one bowler for twenty overs. In T20, per-bowler limits make the decision an allocation problem across the whole innings.`,
    misunderstandings: `**"A captain should change a bowler who goes for runs."** One expensive over may be variance rather than information.

**"Bowlers should bowl fixed-length spells."** Conditions, fatigue and match-ups all override a fixed plan.

**"A change of ends is not a change."** It frequently changes a bowler's effectiveness substantially.`,
    takeaways: `- Changes happen at the over and affect a pairing.
- Match-ups, fatigue, conditions, over allocation and rhythm all bear on it.
- In limited-overs cricket, holding overs back is a live cost now.
- Both too early and too late are common and visible errors.`,
    related: [
      'bowling-spell',
      'bowling-partnerships',
      'managing-overs',
      'matchups',
      'ends',
      'second-new-ball',
    ],
    order: 190,
  }),

  tactic({
    slug: 'matchups',
    title: 'Matchups',
    category: 'tactics-and-strategy',
    alsoIn: ['statistics-and-analytics', 'limited-overs-concepts'],
    difficulty: 'advanced',
    summary:
      'Deploying a specific bowler against a specific batter on the basis of style or record, and the sample-size problem that makes it fragile.',
    explanation: `A matchup is the pairing of a particular bowler against a particular batter, chosen because one is expected to have an advantage.

Some matchups rest on **mechanism**, which is the stronger basis. A left-arm orthodox spinner turning the ball away from a right-hander into the rough; a leg spinner against a batter who cannot pick the googly; an inswing bowler against a batter whose front pad plants across. These are causal explanations, and they generalise.

Others rest on **record**: this batter has been dismissed by this bowler three times in eleven innings. That is a much weaker basis, and the reason is sample size.`,
    howItWorks: `How sides use them:

**Bowler selection within an over allocation.** In T20, a captain holds a bowler back specifically for the batter they match up well against.

**Batting order changes.** Promoting a left-hander because the opposition's next bowler is a left-arm spinner.

**Field setting**, adjusted for the specific pairing rather than the general case.

**Phase planning**, since a matchup is only usable if the bowler has overs left when the batter is in.

Franchise cricket has driven most of the development here, because global squads allow a side to select specialists specifically for matchup purposes.`,
    tradeoffs: `The central problem is **statistical**. Batter-versus-bowler samples in cricket are tiny: a few dozen deliveries at most, often fewer than ten. A dismissal rate calculated on twenty balls carries an enormous confidence interval, and treating it as a reliable signal is a well-recognised error.

Analysts distinguish between:

- **Style matchups**, aggregated across many bowlers of a type against many batters of a type, which have real sample sizes and real predictive value.
- **Individual head-to-head records**, which usually do not.

There is also a cost to acting on them: deploying a bowler for a matchup means not deploying them elsewhere, and if the batter is dismissed by somebody else first, the plan has held back a bowler for nothing.

And they are readable. A batting side that knows a bowler is being held back for them can send in a different batter.`,
    whenYouWillSeeIt: `Throughout T20 cricket, in bowling changes and batting-order decisions that only make sense once you know the matchup being pursued.`,
    formatDifferences: `Central to T20, where over allocation makes deployment possible and precise. Weaker in Tests, where a captain can bowl anybody at anybody for as long as they like, so the matchup is less of a scarce opportunity.`,
    misunderstandings: `**"Head-to-head records show a matchup."** Samples are usually far too small to support the inference.

**"Matchups are a modern invention."** Captains have always bowled left-arm spin at right-handers; the data-driven version is what is new.

**"A matchup is a guarantee."** It is a shift in probability, and often a small one.`,
    takeaways: `- Style-based matchups have mechanism and real samples; head-to-head records usually do not.
- Deployment costs the bowler's availability elsewhere.
- Central to T20 because of over allocation.
- Readable by the batting side, which can counter with the order.`,
    related: [
      'bowling-changes',
      'phase-splits',
      'left-arm-wrist-spin',
      'orthodox-left-arm-spin',
      'batting-order',
      'field-setting',
    ],
    order: 200,
  }),

  tactic({
    slug: 'declaration-strategy',
    title: 'Declaration Strategy',
    category: 'tactics-and-strategy',
    alsoIn: ['red-ball-concepts'],
    difficulty: 'advanced',
    summary:
      'Judging when to close an innings so that a target is defensible and there is still time to bowl the opposition out.',
    explanation: `A declaration converts unused batting time into bowling time. Declaration strategy is the judgement of when that conversion is favourable.

The captain is solving for two quantities at once:

**A target large enough** that the opposition cannot realistically chase it.

**Time long enough** to take ten wickets.

Those pull in opposite directions, and there is no formula that resolves them, which is why declaration decisions are among the most argued-about in cricket.`,
    howItWorks: `The inputs:

**Overs remaining**, usually thought of in sessions.

**The pitch.** A deteriorating surface argues for declaring earlier, because bowling gets easier and batting harder.

**The attack's state.** A tired or depleted attack needs a bigger cushion and more time.

**The opposition's batting.** A side with deep batting and an aggressive approach can chase more than the raw arithmetic suggests.

**Weather.** Rain forecast means fewer overs than the clock shows, so declare earlier.

**Series position.** A side leading a series will protect against defeat; a side that must win will accept more risk.

The conventional heuristic is to set a target the opposition **might** chase, because a side attempting a chase takes risks and loses wickets, while a side with no chance simply blocks. A target that looks generous is frequently deliberate.`,
    tradeoffs: `**Declare too early** and the opposition wins, or gets close enough that the bowling side has to bowl defensively and loses the chance of victory.

**Declare too late** and there is not enough time, and the match is drawn from a winning position. This is the more common criticism, and it is also the safer error, which is why captains skew towards it.

The asymmetry matters: declaring too late costs a possible win, declaring too early can cost the match. Most captains are therefore criticised for being conservative, and most accept that.`,
    whenYouWillSeeIt: `Day three onwards in Tests, and on the final day of first-class matches.`,
    formatDifferences: `Multi-day cricket only. Domestic competitions with bonus points add a further consideration, since a declaration can be worth points as well as position.`,
    misunderstandings: `**"There is a right time to declare."** There are conventions and hindsight; captains genuinely disagree from identical positions.

**"A bigger target is safer."** It costs the time needed to bowl the side out.

**"Declaring shows confidence."** It usually shows a judgement about time, not about the opposition.`,
    takeaways: `- Trades batting time for bowling time.
- Solves simultaneously for a defensible target and enough overs.
- Pitch, attack, opposition, weather and series position all bear on it.
- Declaring late is the more common and safer error.`,
    related: [
      'declaration',
      'follow-on-decision',
      'lead',
      'draw',
      'session',
      'pitch-deterioration',
      'setting-a-target',
    ],
    order: 210,
  }),

  tactic({
    slug: 'follow-on-decision',
    title: 'Follow-on Decision',
    category: 'tactics-and-strategy',
    alsoIn: ['red-ball-concepts'],
    difficulty: 'advanced',
    summary:
      'Whether to make the opposition bat again immediately, which modern captains decline more often than their predecessors.',
    explanation: `When a side leads by enough, the captain may enforce the follow-on and send the opposition straight back in. The decision is entirely theirs, and it has become genuinely contested.

The case **for** enforcing is time. Skipping your own second innings gives more overs in which to bowl the opposition out twice, which is what a win requires.

The case **against** is that it commits your bowlers to bowling again immediately, and it means **you bat last**, on the most worn version of the pitch.`,
    howItWorks: `What captains weigh:

**Bowler workload.** A four-man attack that has just bowled 150 overs may be more dangerous after a rest than immediately.

**Pitch trajectory.** If the pitch is deteriorating, batting again now while it is still good and setting a target later may be safer than batting last.

**Time available.** With four days left, the time saved matters less than the risk taken.

**Size of the lead.** A lead of 400 makes an unlikely defeat almost impossible; a lead of 210 does not.

**Conditions.** Heat and humidity make bowling again a much larger physical ask.

The historical pattern is clear: enforcement was near-automatic for much of cricket's history and is now a live decision, and the shift followed some famous reversals in which sides following on won.`,
    tradeoffs: `**Enforcing** gains time and risks bowler fatigue and batting last.

**Declining** protects the attack and controls the fourth innings, and risks running out of time and drawing a match that was winnable.

There is a genuine analytical question about how large the risk of defeat after enforcing actually is. It is very small in absolute terms — sides following on rarely win — but the outcomes are so catastrophic and memorable that they carry disproportionate weight in decision-making. Whether captains have over-corrected is arguable.`,
    whenYouWillSeeIt: `Whenever a first-innings lead exceeds the threshold: 200 runs in a match of five days or more.`,
    formatDifferences: `Multi-day cricket only. The threshold scales with match length under Law 14.`,
    misunderstandings: `**"The follow-on is automatic."** It is optional and increasingly declined.

**"Declining the follow-on is negative."** It is usually a judgement about bowler workload and about who bats last.

**"Sides following on often win."** They very rarely do; the memorable exceptions drive the caution.`,
    takeaways: `- Optional even when available, and increasingly declined.
- Gains time; costs bowler freshness and control of the fourth innings.
- Pitch trajectory, workload, lead size and time all bear on it.
- The risk of defeat is small but heavily weighted by memorable cases.`,
    related: [
      'follow-on',
      'declaration-strategy',
      'lead',
      'deficit',
      'second-innings',
      'wearing-pitch',
      'bowling-spell',
    ],
    sourceKeys: [{ key: 'mcc-laws', locator: 'Law 14' }],
    order: 220,
  }),

  tactic({
    slug: 'reviews-strategy',
    title: 'Reviews Strategy',
    category: 'tactics-and-strategy',
    alsoIn: ['officials-and-technology'],
    difficulty: 'advanced',
    summary: 'Managing a limited number of DRS reviews as a scarce resource across an innings.',
    explanation: `Where DRS is in use, each side has a limited number of unsuccessful player reviews per innings: three in Tests and two in ODIs and T20Is under current ICC playing conditions.

That makes reviews a **resource to allocate**, and using them badly is a recognisable way to lose a decision that mattered. A side with no reviews left cannot challenge a plainly wrong dismissal, and a side that reviews speculatively early frequently ends up in exactly that position.`,
    howItWorks: `What sides consider:

**Confidence.** The fielding captain consults the bowler, the keeper and the close catchers, who between them have the best information about whether the ball hit the bat and where it pitched.

**The umpire's-call margin.** A marginal LBW that is likely to return umpire's call will not overturn the decision, though the review is retained. Knowing this changes whether a review is worth attempting: retaining it means the cost is only the time.

**Stage of the innings.** A review used in the fifth over is unavailable in the fiftieth. Some sides deliberately hold one back.

**Which batter.** Reviewing to save a top-order batter is worth more than reviewing for a tailender.

**The clock.** Time limits apply to requesting a review, so the decision is made in seconds and without full information.`,
    tradeoffs: `**Reviewing freely** overturns more wrong decisions early and risks having none left later.

**Hoarding reviews** preserves the option and lets wrong decisions stand.

The trade is genuinely difficult because the value of a review depends on decisions that have not happened yet. There is no way to know whether the marginal LBW in the tenth over is the most important one of the innings.

A recognised failure mode is the **speculative review**, taken on a chance rather than on information, usually by a fielding side that has run out of ideas. It is the clearest way to waste the resource.`,
    whenYouWillSeeIt: `Wherever DRS operates. The most visible strategic version is a batting side declining to review a plausible dismissal because they have one left and a better batter to protect.`,
    formatDifferences: `Three reviews per innings in Tests, two in ODIs and T20Is under current ICC conditions. And critically, **DRS is a playing condition**: many competitions have a reduced version and most cricket has none, so reviews strategy does not exist at all in the majority of matches.`,
    misunderstandings: `**"You lose a review on umpire's call."** Under current conditions the review is retained.

**"Reviews are unlimited."** They are capped, and the cap differs by format.

**"Every side has DRS."** It is a playing condition and most cricket does not have it.

**"Reviewing costs nothing if you might be right."** It costs the option of reviewing later, which is the whole strategic problem.`,
    takeaways: `- A capped resource: three in Tests, two in white-ball internationals.
- Umpire's call retains the review but does not overturn the decision.
- The value of holding one back is unknowable in advance.
- DRS is a playing condition, absent from most cricket.`,
    related: ['drs', 'umpires-call', 'lbw', 'third-umpire', 'ball-tracking', 'edge-detection'],
    sourceKeys: [{ key: 'icc-playing-conditions', locator: 'DRS' }],
    order: 230,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  tactic({
    slug: 'managing-overs',
    title: 'Managing Overs',
    category: 'tactics-and-strategy',
    difficulty: 'advanced',
    summary:
      'Allocating a limited supply of overs across bowlers and phases, which is the core of limited-overs captaincy.',
    explanation: `In limited-overs cricket a captain has a fixed number of overs and a per-bowler cap, so bowling is an **allocation problem**: twenty overs from at least five bowlers in a T20, fifty from at least five in an ODI.

Every over bowled now is an over unavailable later. Using your best death bowler in the eighth over means not having them in the eighteenth, and that decision is made under uncertainty about what the eighteenth over will look like.

In Test cricket the constraint is different but real: overs in a day are limited by time and over rates, and bowler workload is finite.`,
    howItWorks: `The recurring decisions:

**Phase allocation.** Which bowlers get powerplay overs, middle overs and death overs. Most sides reserve their best death bowler's overs deliberately.

**Reacting versus planning.** A set batter may need to be bowled at now, even if it spends a bowler's overs early.

**The fifth bowler problem.** Most sides have four bowlers they trust and a fifth option who has to bowl a share. Hiding those overs, in the phase and against the batters where they cost least, is one of captaincy's recurring puzzles.

**Over rates and time**, in Tests, where a slow over rate can cost a side the overs it needs to win, and in limited-overs cricket where playing conditions can impose in-match penalties.`,
    tradeoffs: `**Holding overs back** guarantees good bowling at the death and concedes worse bowling now.

**Using your best bowlers when needed** wins the current phase and may leave a weak bowler exposed at the end.

The genuine difficulty is that both errors are only visible in hindsight, and both are criticised. A captain whose best bowler has overs left when the match is already lost is criticised for hoarding; one who has none left at the death is criticised for profligacy.`,
    whenYouWillSeeIt: `Continuously in limited-overs cricket, and most visibly around the fifteenth over of a T20 innings, where the remaining allocation becomes committed.`,
    formatDifferences: `In T20 the four-over cap makes it a tight combinatorial problem. In ODIs the ten-over cap gives more flexibility. In Tests the constraint is time and workload rather than a cap.`,
    misunderstandings: `**"Bowl your best bowlers as much as possible."** Caps prevent it, and the timing is the whole decision.

**"Holding a bowler back is always right."** If the match is decided before they bowl, the overs were wasted.

**"Over rates are just an administrative matter."** In a timed match they change which results are reachable, and some competitions impose in-match penalties.`,
    takeaways: `- Fixed total overs and per-bowler caps make bowling an allocation problem.
- Overs used now are unavailable later, under uncertainty.
- The fifth bowler's overs have to be hidden somewhere.
- Both hoarding and profligacy are visible only in hindsight.`,
    related: [
      'bowling-changes',
      'death-bowling',
      'over-rate-and-time',
      'bowling-spell',
      'matchups',
      'powerplay',
    ],
    sourceKeys: [{ key: 'icc-playing-conditions' }],
    order: 240,
  }),

  tactic({
    slug: 'protecting-a-batter',
    title: 'Protecting a Batter',
    category: 'tactics-and-strategy',
    difficulty: 'advanced',
    summary:
      'Shielding a weaker or struggling batter from the bowling, and the counter-tactics a fielding side uses.',
    explanation: `Protecting a batter means arranging for them to face as little of the bowling as possible: a tail-ender batting with a set batter, a nightwatchman late in the day, or a batter struggling against a particular bowler.

The mechanism is **strike farming**: the better batter takes singles off the last ball of an over and declines them early, so they retain the strike as often as possible.

The fielding side has explicit counters, which makes it a genuine contest rather than a one-sided tactic.`,
    howItWorks: `The batting side's methods:

**Single off the sixth ball.** The strike swaps, and because bowling changes ends, the good batter faces the next over.

**Declining singles early in an over**, keeping the strike rather than handing it over with balls remaining.

**Twos rather than ones**, since even numbers retain the strike.

**Boundaries early, singles late** within an over.

The fielding side's counters:

**Spread the field for the good batter** so singles are easy to take and hard to refuse, pushing the strike to the weak batter.

**Bring the field in for the weak batter** so they cannot get off strike.

**Bowl wide of the weak batter**, denying them a single.

**Attack the good batter's end** with the field, so a run out is possible if they take a risk to keep the strike.`,
    tradeoffs: `Protection costs runs. Declining available singles forgoes them, and playing for a single off the last ball rather than for the best available shot compromises every other delivery.

It also concentrates risk. If the protected batter is exposed anyway, or the set batter is dismissed while manipulating the strike, the side has both lost the wicket and spent deliveries achieving nothing.

There is also a case against protecting at all: a batter who never faces the bowling never settles, and some coaches argue that letting a tail-ender play is better than shielding them into paralysis.`,
    whenYouWillSeeIt: `Whenever a set batter is with the last wicket or two, and in the final overs of a day's Test play with a nightwatchman.`,
    formatDifferences: `In Tests, protection is mostly about surviving. In limited-overs cricket it is about ensuring the right batter faces the last over, which is a scoring rather than a survival objective.`,
    misunderstandings: `**"Protecting a batter is unsporting."** It is ordinary tactics with explicit counters.

**"It always works."** A good captain makes single-taking very difficult in exactly the wrong places.

**"Protection means the weak batter never faces."** Usually it means minimising, and the arithmetic frequently fails.`,
    takeaways: `- Arranging for the better batter to face most of the bowling.
- Single off the last ball; decline them early.
- The fielding side counters with field placement and by bowling wide.
- Costs runs and concentrates risk, and may be counterproductive.`,
    related: [
      'strike-farming',
      'strike-rotation',
      'tailender',
      'nightwatchman',
      'field-setting',
      'running-between-wickets',
    ],
    order: 250,
  }),
];
