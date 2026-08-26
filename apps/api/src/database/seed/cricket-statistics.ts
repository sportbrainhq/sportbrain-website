import { definition, statistic } from './cricket-explainer-helpers';
import { ICC_PC, REVIEWED } from './cricket-review-metadata';
import type { ExplainerSeed } from './explainer-types';

/**
 * Statistics, scoring and scorecards.
 *
 * Three rules, and they are the reason this file exists separately.
 *
 * **Every formula is stated exactly and every worked example converts overs to
 * balls first.** Treating 8.2 overs as a decimal is the most common cricket
 * arithmetic bug in existence, and it is committed by published sources.
 *
 * **Universal arithmetic is separated from provider-specific metrics.** A
 * batting average is arithmetic that everybody computes identically. Control
 * percentage is a proprietary judgement made by a provider's analysts, and the
 * two are not the same kind of thing. The advanced entries say so explicitly and
 * do not invent formulas.
 *
 * **Format context is mandatory.** An economy rate of 6.5 is excellent in one
 * format and terrible in another, so no interpretation is given without it.
 */

export const CRICKET_STATISTICS: ExplainerSeed[] = [
  // ── Scoring and scorecards ────────────────────────────────────────────────
  definition({
    slug: 'team-score',
    title: 'Team Score',
    category: 'scoring-and-scorecards',
    difficulty: 'beginner',
    summary: 'Runs and wickets together: 287/6 means 287 runs for the loss of six wickets.',
    explanation: `A team score is written as **runs, then wickets**, separated by a slash or a hyphen: **287/6** or **287-6**, read as "two hundred and eighty-seven for six".

**In Australia the order is reversed**: **6/287** means the same thing. The rule for reading an unfamiliar scoreboard is that the **smaller number is the wickets**, since a side cannot lose more than ten.

Wickets remaining is ten minus wickets lost, because an innings ends at ten: the eleventh batter has no partner. So 287/6 means four wickets remain.

A completed innings where all ten fell is written **287 all out**, or sometimes **287/10**. A declared innings is **287/6 dec**, and an unfinished one carries no annotation.`,
    example: `**IND 287/6** — India have 287 runs and have lost six wickets. Four remain.

**AUS 6/287** — the same position, Australian notation.

**ENG 287 all out** — the innings is over; all ten wickets fell.

**SA 287/6 dec** — South Africa declared with six down.`,
    whyItMatters: `The two numbers together describe a position that neither describes alone. 287/2 and 287/9 are the same run total and completely different situations: one side has eight wickets to build with, the other is one ball from the end of its innings.

This is why every cricket statistic that ignores wickets, from run rate to net run rate, is incomplete.`,
    misunderstandings: `**"6/287 means six runs."** It is Australian notation: six wickets, 287 runs.

**"287/6 means six wickets remain."** Six have fallen; four remain.

**"All out means eleven batters were dismissed."** Ten. The last is left not out.`,
    related: [
      'wickets-lost',
      'how-to-read-a-cricket-score',
      'overs-notation',
      'runs',
      'declaration',
    ],
    order: 30,
  }),

  definition({
    slug: 'wickets-lost',
    title: 'Wickets Lost',
    category: 'scoring-and-scorecards',
    difficulty: 'beginner',
    summary:
      'How many batters have been dismissed, and therefore how much batting a side has left.',
    explanation: `Wickets lost is the count of dismissed batters in the current innings, the second number in a score like 287/6.

Ten ends the innings. The eleventh batter cannot bat alone, so a side has **ten wickets to lose**, not eleven, and "wickets in hand" is ten minus the number lost.

The phrase is used from both sides: the batting side **loses** wickets, the bowling side **takes** them, and the same event is recorded once.`,
    whyItMatters: `Wickets in hand is the resource that determines what a batting side can do. In limited-overs cricket it is what funds acceleration: a side with eight wickets left in the fortieth over can attack, and a side with two cannot, regardless of the identical run total.

It is also one of the two inputs to DLS, precisely because overs remaining alone does not describe a batting side's position.`,
    misunderstandings: `**"Eleven wickets end an innings."** Ten.

**"Wickets lost and wickets taken are different statistics."** Same events, recorded from opposite sides.

**"A side nine down is nearly finished."** Sometimes, and a last-wicket partnership can bat for hours.`,
    related: ['team-score', 'dismissal', 'wickets', 'dls-method', 'batting-order', 'tail'],
    order: 40,
  }),

  definition({
    slug: 'batting-scorecard',
    title: 'Batting Scorecard',
    category: 'scoring-and-scorecards',
    difficulty: 'beginner',
    summary:
      'The table of each batter’s innings: how they got out, how many they made, and how long they took.',
    explanation: `A batting scorecard lists every batter in the order they batted, with their dismissal and their figures.

A typical line reads:

**Sharma  c Smith b Anderson  75 (62, 9x4, 2x6)**

Read left to right:

**The name.** In batting order.

**The dismissal.** How they were out, in a compressed notation:
- **b Anderson** — bowled by Anderson.
- **c Smith b Anderson** — caught by Smith, bowled by Anderson, meaning Anderson was the bowler.
- **lbw b Anderson** — LBW to Anderson.
- **st Jones b Ali** — stumped by the keeper Jones, bowling credited to Ali.
- **run out (Root)** — run out, with the fielder credited. No bowler is credited.
- **not out** — still batting when the innings ended.

**Runs**, then in brackets **balls faced**, and often **fours** and **sixes**.

Below the batters come the **extras**, itemised, and then the **total**, the **overs**, and the **fall of wickets**.`,
    example: `**Sharma  c Smith b Anderson  75 (62, 9x4, 2x6)**

Sharma made 75 from 62 balls, including nine fours and two sixes. He was caught by Smith off Anderson's bowling.

His strike rate is 75 ÷ 62 × 100 ≈ **121**. His boundary runs are 9 × 4 + 2 × 6 = **48**, so 64 per cent of his runs came in boundaries.`,
    whyItMatters: `The scorecard is cricket's primary record, and almost every statistic in the sport is derived from it. Reading the dismissal notation is what lets you see at a glance whether a side was bowled out by pace or spin, whether the batters were caught behind or LBW, and therefore what the conditions were doing.`,
    misunderstandings: `**"c Smith b Anderson means two bowlers."** Smith caught it; Anderson bowled it and gets the wicket.

**"run out has a bowler."** It does not; the fielders are credited instead.

**"The number in brackets is minutes."** It is balls faced, though some scorecards also show minutes separately.`,
    related: [
      'bowling-scorecard',
      'how-to-read-a-cricket-score',
      'fall-of-wickets',
      'extras',
      'strike-rate',
      'not-out',
    ],
    order: 50,
  }),

  definition({
    slug: 'bowling-scorecard',
    title: 'Bowling Scorecard',
    category: 'scoring-and-scorecards',
    difficulty: 'beginner',
    summary:
      'The table of each bowler’s figures: overs, maidens, runs and wickets, always in that order.',
    explanation: `A bowling scorecard gives four numbers per bowler, in a fixed order: **overs, maidens, runs, wickets**.

**Anderson  18.2  5  47  3**

That is 18 overs and 2 balls, five maiden overs, 47 runs conceded, three wickets taken. Written compactly it is **18.2-5-47-3**, and spoken as "three for 47".

Note that English convention states wickets first when spoken — "three for 47" — while the written figures put wickets last. Both refer to the same thing.

Columns for **economy rate**, **wides** and **no-balls** are common additions.`,
    example: `**Anderson 18.2-5-47-3**

**Balls bowled:** 18 × 6 + 2 = **110**.

**Economy rate:** 47 ÷ (110 ÷ 6) = 47 ÷ 18.33 ≈ **2.56** an over.

**Bowling strike rate:** 110 ÷ 3 ≈ **36.7** balls per wicket.

**Bowling average for this innings:** 47 ÷ 3 ≈ **15.67**.

Every one of those started by converting 18.2 into 110 balls. Dividing by 18.2 would give 2.58, which is wrong.`,
    whyItMatters: `The four figures encode what a bowler did in a way no single number can. 18.2-5-47-3 is a fine performance; 4-0-47-3 is an expensive one with the same wickets; 18-5-47-0 is unlucky or ineffective depending on what you know about the chances created.

Reading the maidens column also tells you about control: five maidens in eighteen overs is sustained accuracy.`,
    misunderstandings: `**"The order is wickets first."** Written, it is overs-maidens-runs-wickets. Spoken, wickets first.

**"Runs conceded is all runs scored while they bowled."** Byes and leg byes are excluded; wides and no-balls are included.

**"18.2 overs is 18.2 for arithmetic."** It is 110 balls.`,
    related: [
      'batting-scorecard',
      'economy-rate',
      'maidens',
      'bowling-average',
      'bowling-strike-rate',
      'overs-notation',
    ],
    order: 60,
  }),

  definition({
    slug: 'extras',
    title: 'Extras',
    category: 'scoring-and-scorecards',
    alsoIn: ['laws-and-rules'],
    difficulty: 'beginner',
    summary:
      'Runs credited to the team but not to any batter: byes, leg byes, wides, no-balls and penalties.',
    explanation: `Extras are runs added to the team total without being credited to a batter. There are five kinds, and they differ in whether the bowler is charged.

| Extra | Cause | Charged to bowler? |
| --- | --- | --- |
| **Wide** | Delivery out of the batter's reach | Yes |
| **No-ball** | Illegal delivery | Yes |
| **Bye** | Ball passes untouched, batters run | No |
| **Leg bye** | Ball hits the batter's body, batters run | No |
| **Penalty runs** | A sanction, usually five | No |

On a scorecard they appear as a single line with the breakdown in brackets:

**Extras (b 4, lb 7, w 9, nb 2) 22**

The bowler-charged distinction is why a bowling analysis and the team total do not reconcile without accounting for extras: byes and leg byes belong to nobody's figures.`,
    example: `A team total of 287 with **Extras (b 4, lb 7, w 9, nb 2) 22**.

Runs off the bat: 287 − 22 = **265**, which should equal the sum of the batters' scores.

Runs charged to bowlers: the 9 wides and 2 no-balls, so **11** of the 22. The 4 byes and 7 leg byes are charged to nobody.`,
    whyItMatters: `Extras are a real component of a total: twenty-plus extras is common, and in some innings they exceed several batters' scores. A side conceding thirty extras has given away the equivalent of a good partnership.

They also carry information. A high wides count suggests bowlers struggling for line; a high byes count points to keeping or a difficult surface.`,
    misunderstandings: `**"Extras go to the batter on strike."** They go to the team only.

**"All extras are charged to the bowler."** Wides and no-balls are; byes, leg byes and penalties are not.

**"Extras are rare."** Twenty or more in an innings is entirely normal.`,
    related: ['bye', 'leg-bye', 'wide', 'no-ball', 'penalty-runs', 'economy-rate', 'maiden-over'],
    order: 70,
  }),

  statistic({
    slug: 'run-rate',
    title: 'Run Rate',
    category: 'scoring-and-scorecards',
    alsoIn: ['statistics-and-analytics'],
    difficulty: 'beginner',
    aliases: ['RR', 'Runs Per Over'],
    summary:
      'Runs scored per over so far, and the number the whole of limited-overs cricket is discussed in.',
    measures: `How fast a team has scored: total runs divided by overs used.

It is a **backward-looking** number describing what has happened, unlike **required run rate**, which describes what is still needed.`,
    calculation: `**Run rate = runs scored ÷ overs faced**

The safe form, because over notation is not decimal:

**Run rate = runs scored ÷ (balls faced ÷ 6)**

Runs scored includes **extras**, since this is a team measure.`,
    example: `A side is **176/4 after 33.4 overs**.

**Balls faced:** 33 × 6 + 4 = **202**.

**Overs:** 202 ÷ 6 = **33.67**.

**Run rate:** 176 ÷ 33.67 ≈ **5.23** an over.

Dividing by 33.4 gives 5.27, which is wrong. The error is small here and grows with the ball remainder.`,
    interpret: `Always against the format and the phase.

- **Test cricket:** 3 to 4 an over is a normal scoring rate; above 4.5 is fast.
- **ODI:** 5 to 6 through the middle overs, rising at the death; a completed innings around 6 is a good total.
- **T20:** 8 or above; a completed innings around 9 is competitive.

Within an innings, run rate is expected to vary by phase, so a T20 side at 7 an over after six overs is not behind: they are in the powerplay with the acceleration still ahead.`,
    limitations: `- **It ignores wickets.** 176/1 and 176/8 at the same run rate are entirely different positions.
- **It is an average over the innings so far**, so it conceals whether a side has just collapsed or just accelerated.
- **It says nothing about conditions.** Five an over on a difficult pitch may be better than seven on a flat one.
- **It is not comparable across formats.**`,
    formatContext: `The number that most needs its format attached. A run rate of 4 is excellent in a Test, moderate in an ODI, and losing in a T20.`,
    misunderstandings: `**"Divide by the printed overs figure."** Convert to balls first.

**"Run rate shows who is winning."** Not without wickets and, in a chase, the required rate.

**"Run rate excludes extras."** It is a team rate, so extras count.`,
    takeaways: `- Runs ÷ (balls ÷ 6), including extras.
- Backward-looking; required run rate is the forward-looking counterpart.
- Meaningless without wickets and format.
- Convert overs to balls before calculating.`,
    related: [
      'required-run-rate',
      'overs-notation',
      'net-run-rate',
      'strike-rate',
      'team-score',
      'par-score',
    ],
    order: 80,
  }),

  definition({
    slug: 'fall-of-wickets',
    title: 'Fall of Wickets',
    category: 'scoring-and-scorecards',
    difficulty: 'intermediate',
    summary:
      'The line on a scorecard recording the score at each wicket, from which every partnership can be read.',
    explanation: `The fall of wickets is a compressed record of when each wicket fell. It appears as a series of entries:

**FoW: 1-24 (Sharma, 5.2), 2-31 (Kohli, 7.4), 3-180 (Rahul, 34.1)**

Each entry is **wicket number, score at that point**, and usually the batter dismissed and the over.

Its value is that it encodes every **partnership** in the innings by subtraction:

- First-wicket partnership: 24.
- Second: 31 − 24 = 7.
- Third: 180 − 31 = **149**.

From three numbers you can see that the side lost two early wickets and then built a substantial recovery.`,
    example: `**FoW: 1-24, 2-31, 3-180, 4-192, 5-201, 6-287**

Partnerships: 24, 7, 149, 12, 9, 86.

That reads as a specific story: an early collapse, a large third-wicket rebuild, a middle-order wobble of three quick wickets, then a significant lower-order stand.

Nothing in the individual batting figures shows that shape as clearly.`,
    whyItMatters: `Individual scores tell you who batted well. Fall of wickets tells you **when the match turned**. A collapse is visible as a run of tiny gaps; a recovery as one large one.

It is also how a side's structural weaknesses show up: repeated small first-wicket partnerships across a series is an opening problem, whatever the batters' averages say.`,
    misunderstandings: `**"The number after the dash is the wicket number."** It is the score. The first number is the wicket number.

**"It duplicates the batting card."** It carries partnership information the batting card does not.`,
    related: [
      'partnership',
      'batting-scorecard',
      'how-to-read-a-cricket-score',
      'team-score',
      'building-an-innings',
    ],
    order: 90,
  }),

  definition({
    slug: 'maiden-over',
    title: 'Maiden Over',
    category: 'scoring-and-scorecards',
    alsoIn: ['statistics-and-analytics'],
    difficulty: 'beginner',
    summary:
      'An over from which no runs are charged to the bowler, recorded in the second column of a bowling analysis.',
    explanation: `A maiden over is one in which the bowler concedes **no runs charged to them**: no runs off the bat, no wides and no no-balls.

The precise definition matters because of extras. **Byes and leg byes do not spoil a maiden**, since they are not charged to the bowler. So an over in which the batters ran a bye is still a maiden.

Maidens appear as the second number in a bowling analysis: **18.2-5-47-3** means five maidens.`,
    example: `An over: dot, dot, leg bye taken, dot, dot, dot, dot.

Seven deliveries because the leg bye did not stop the ball counting — actually it did count, since a leg bye is scored off a legal delivery. So six legal balls, one run to the team as a leg bye, none charged to the bowler.

**This is still a maiden over.**

By contrast, an over with a single wide and five dots is **not** a maiden, and it takes seven balls.`,
    whyItMatters: `In Test cricket a high maiden count signals sustained accuracy and is part of how pressure is built: a bowler with five maidens in eighteen overs has given a batter nothing for long stretches.

In T20 a maiden over is a genuinely rare and highly valuable event, because a dot ball raises the required rate and six of them in succession transfers substantial pressure. Maidens in T20 internationals are notable enough to be remarked on individually.`,
    misunderstandings: `**"Byes spoil a maiden."** They do not, because they are not charged to the bowler.

**"A maiden over means six dot balls."** It means no runs charged to the bowler; byes and leg byes may have been scored.

**"Maidens are only a Test statistic."** They are far rarer and proportionally more valuable in T20.`,
    related: [
      'maidens',
      'dot-ball',
      'economy-rate',
      'extras',
      'bye',
      'dot-ball-pressure',
      'bowling-scorecard',
    ],
    order: 100,
  }),

  definition({
    slug: 'dot-ball',
    title: 'Dot Ball',
    category: 'scoring-and-scorecards',
    alsoIn: ['statistics-and-analytics'],
    difficulty: 'beginner',
    summary:
      'A delivery from which no run is scored, named for the dot a scorer marks in the book.',
    explanation: `A dot ball is a legal delivery off which no run is scored. The name comes from scoring notation: the scorer marks a **dot** in the bowler's over.

In Test cricket a dot ball is unremarkable, because a batter declining to score costs nothing.

In limited-overs cricket a dot ball is one of the most consequential events available, and the reason is arithmetic rather than psychology: with a fixed number of deliveries, every dot raises the rate required from the remaining balls. Six dots in a T20 chase can move a required rate by two runs an over.`,
    example: `A T20 side needs **48 from 24 balls**, a required rate of 12.

They play out an over of four dots and two singles, scoring 2.

They now need **46 from 18**, a required rate of **15.3**.

Six deliveries and 2 runs have raised the requirement by more than three runs an over. That escalation is what forces batters into risk, and it is why dot-ball percentage is a real bowling statistic in white-ball cricket.`,
    whyItMatters: `It is the unit of pressure in limited-overs cricket, and unlike most pressure claims in cricket, this one is quantifiable: the required rate moves mechanically with each dot.

For bowlers it means containment and wicket-taking are less separable than they appear, since a sequence of dots eventually produces a risk-taking shot.`,
    misunderstandings: `**"A dot ball is a wasted delivery for both sides."** It is a clear gain for the bowling side in limited-overs cricket.

**"Dot balls include wides and no-balls."** Those concede a run, so they are not dots.

**"A dot ball is neutral in Test cricket."** Close to it, which is exactly why the statistic matters so much less there.`,
    related: [
      'dot-ball-pressure',
      'dot-ball-percentage',
      'maiden-over',
      'required-run-rate',
      'defensive-bowling',
      'risk-management-batting',
    ],
    order: 110,
  }),

  definition({
    slug: 'boundary-count',
    title: 'Boundary Count',
    category: 'scoring-and-scorecards',
    difficulty: 'intermediate',
    summary:
      'The number of fours and sixes in an innings, shown on scorecards and once used as a tie-breaker.',
    explanation: `A boundary count is simply the tally of fours and sixes, recorded per batter on a scorecard as **9x4, 2x6** and aggregated for a team.

It has three uses.

**Descriptive.** It shows how a score was made. 75 from 62 balls with nine fours and two sixes is a different innings from 75 from 62 with two fours and one six, which was built on running.

**Analytical.** Combined with runs it gives **boundary percentage**, the share of runs from boundaries, which distinguishes boundary-hitters from accumulators.

**Historically, as a tie-breaker.** A previous version of the ICC's playing conditions resolved a tied Super Over in a knockout by boundary count. That rule decided a World Cup final, attracted substantial criticism, and was **removed**: current conditions provide for repeated Super Overs instead. It is worth knowing precisely because it is obsolete and still frequently referenced.`,
    example: `A batter makes **75 (62, 9x4, 2x6)**.

Boundary runs: 9 × 4 + 2 × 6 = **48**.

Boundary percentage: 48 ÷ 75 ≈ **64 per cent**.

The other 27 runs came from 51 non-boundary deliveries, which tells you this innings was built on boundaries with modest rotation between them.`,
    whyItMatters: `Boundary reliance is a real profile difference between batters, and it interacts with conditions: a batter dependent on boundaries is more vulnerable on a slow pitch with big boundaries than one who scores by running.`,
    misunderstandings: `**"Boundary count decides tied matches."** It did under a previous version of the ICC conditions and no longer does.

**"More boundaries means a better innings."** It describes how the runs were made, not their value.`,
    related: [
      'boundary-percentage',
      'four',
      'six',
      'super-over',
      'batting-scorecard',
      'strike-rate',
    ],
    sourceKeys: [{ key: 'icc-playing-conditions' }],
    order: 120,
    ruleSensitive: true,
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
  }),

  // ── Batting statistics ────────────────────────────────────────────────────
  statistic({
    slug: 'balls-faced',
    title: 'Balls Faced',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'The count of legal deliveries a batter has received, and the denominator of strike rate.',
    measures: `How many deliveries a batter has actually faced. It is the measure of how much of the innings' scarcest resource they have consumed.`,
    calculation: `A simple count of **legal deliveries** received.

Two exclusions matter:

- **Wides are not faced**, because by definition they were out of the batter's reach. They do not count.
- **No-balls the batter faced do count**, since the ball was delivered to them.

Balls faced is the denominator of **strike rate**: (runs ÷ balls faced) × 100.`,
    example: `A batter's line reads **75 (62)**. They faced 62 legal deliveries.

If during their innings the bowlers also sent down 3 wides while they were on strike, those are not included: still 62.

Strike rate: 75 ÷ 62 × 100 ≈ **121**.`,
    interpret: `In Test cricket, balls faced is close to a measure of **contribution in itself**: a batter who faces 200 balls has occupied the crease for a long period and denied the bowlers a wicket for all of it, whatever the runs.

In T20 it is closer to a measure of **cost**: 30 balls faced is a quarter of the innings, and whether that was worth it depends entirely on the runs made from them.

The same number therefore means opposite things in the two formats, which is unusual even by cricket's standards.`,
    limitations: `- **It says nothing about which balls.** Facing 40 deliveries of spin in the middle overs is not the same as facing 40 at the death.
- **It is not a quality measure** in short formats, where consuming deliveries can be actively harmful.
- **It excludes wides**, which can make a batter's time at the crease look shorter than it felt.`,
    formatContext: `A resource consumed in T20, a contribution in Tests, and something in between in ODIs. It is also the reason "deliveries faced" appears in modern analysis alongside runs: two batters with the same score and different balls faced have done different things.`,
    misunderstandings: `**"Wides count as balls faced."** They do not.

**"More balls faced is always better."** In T20 it can be the opposite.

**"Balls faced equals time at the crease."** Time is recorded separately on some scorecards, and the two diverge.`,
    takeaways: `- A count of legal deliveries received; wides excluded, no-balls included.
- The denominator of strike rate.
- A contribution in Tests, a cost in T20.`,
    related: [
      'strike-rate',
      'runs',
      'batting-average',
      'dot-ball',
      'batting-scorecard',
      'risk-management-batting',
    ],
    order: 30,
  }),

  statistic({
    slug: 'highest-score',
    title: 'Highest Score',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary: 'A batter’s best individual innings, marked with an asterisk if they were not out.',
    measures: `The largest score a batter has made in a single innings, in a given format or across a career.`,
    calculation: `No calculation: it is the maximum of their individual innings scores.

The notation matters. An asterisk marks a **not out** innings:

- **HS 183** — they were dismissed for 183.
- **HS 183\\*** — they were not out on 183, so the innings ended for another reason and the score might have gone higher.`,
    example: `A career line reading **HS 264\\*** means the batter's best is 264 not out.

That asterisk carries real information: the innings ended because the side declared, the innings was completed, or the match ended, rather than because the batter was dismissed.`,
    interpret: `Highest score describes **ceiling** rather than typical performance. A batter with an average of 35 and a highest score of 190 is a different proposition from one averaging 35 with a best of 78: the first has demonstrated the capacity for a very large innings.

It is most useful read alongside the count of fifties and hundreds, which shows how often the ceiling is approached rather than just how high it is.`,
    limitations: `- **It is a single data point**, and the most extreme one, so it is the least representative number in a career record.
- **It says nothing about frequency.** One large score does not indicate reliability.
- **It ignores context** entirely: conditions, opposition and match situation.
- **It is not comparable across formats**, since a T20 innings has a hard delivery ceiling.`,
    formatContext: `In Tests, high scores can be very large because innings are unlimited. In T20 the maximum is bounded by 120 deliveries, so the range of possible highest scores is compressed and the number is correspondingly less discriminating.`,
    misunderstandings: `**"The asterisk means a record."** It means not out.

**"Highest score indicates quality."** It indicates ceiling; averages and conversion rates indicate reliability.`,
    takeaways: `- The largest single innings; an asterisk means not out.
- Describes ceiling, not typical performance.
- The least representative single number in a batting record.
- Bounded by the format's delivery limit.`,
    related: ['batting-average', 'not-out', 'hundred', 'fifty', 'double-century', 'balls-faced'],
    order: 40,
  }),

  definition({
    slug: 'not-out',
    title: 'Not Out',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'A batter who was still batting when the innings ended, which affects their average but not their runs.',
    explanation: `A batter is **not out** if their innings ended without their being dismissed: the innings finished, the side declared, the overs ran out, or the target was reached.

It is marked with an asterisk: **75\\*** means 75 not out.

The statistical consequence is specific and important. A not-out innings **does not count as a dismissal**, so it does not appear in the denominator of a **batting average**, which is runs ÷ dismissals. A batter with many not-outs will therefore have a higher average than their runs-per-innings figure.

**Retired not out** is treated the same way: not a dismissal, and excluded from the average's denominator. **Retired out**, by contrast, is a dismissal and does count.`,
    example: `Six innings: **45, 12, 0, 88\\*, 31, 24\\***.

Runs: 200. Innings: 6. Not outs: 2, so dismissals: 4.

**Average:** 200 ÷ 4 = **50.00**.
**Runs per innings:** 200 ÷ 6 ≈ **33.33**.

The 16.67 difference is entirely the effect of the two not-outs.`,
    whyItMatters: `Not-outs are the main reason batting averages are misread. They inflate averages substantially for batters who are frequently stranded at the end of an innings: lower-order batters, finishers in T20, and anybody batting with the tail.

Comparing a finisher's average to an opener's without accounting for not-out frequency compares two different things.`,
    misunderstandings: `**"Not out means they were unbeaten in a big innings."** It just means they were not dismissed; a batter can be 0 not out.

**"Not outs are ignored in statistics."** The runs count; the innings simply is not a dismissal.

**"Retired hurt counts as out."** It is retired not out, and not a dismissal.`,
    related: [
      'batting-average',
      'highest-score',
      'retired-out',
      'finisher',
      'tailender',
      'batting-scorecard',
    ],
    order: 50,
  }),

  definition({
    slug: 'duck',
    title: 'Duck',
    category: 'statistics-and-analytics',
    alsoIn: ['terminology'],
    difficulty: 'beginner',
    summary: 'Being dismissed without scoring: out for nought.',
    explanation: `A duck is a dismissal for **zero runs**. The name comes from the shape of the figure 0, described as a duck's egg.

The crucial condition is **dismissal**. A batter who finishes an innings not out on 0 has **not** made a duck: they are 0 not out.

There are named varieties:

- **Golden duck** — dismissed on the first ball faced.
- **Diamond duck** — usage varies; most commonly out without facing a delivery at all, for instance run out at the non-striker's end or as the non-striker in a mix-up.
- **Platinum** or **royal duck** — sometimes used for a duck on the first ball of an innings.
- **Pair** — a duck in both innings of a match.
- **King pair** — a golden duck in both innings.

Only the plain duck and golden duck are used with much consistency; the others vary between sources.`,
    whyItMatters: `Ducks matter statistically because they are dismissals with no runs, so they pull an average down more sharply than any other innings.

They also carry outsized cultural weight relative to their significance: a batter's duck count is remembered and remarked upon far beyond its effect on their record.`,
    misunderstandings: `**"0 not out is a duck."** It is not; a duck requires dismissal.

**"A diamond duck has one agreed definition."** Usage genuinely varies between sources.

**"Ducks indicate a poor batter."** Batters who play many innings accumulate ducks, and several of the highest run-scorers in history have high duck counts.`,
    related: ['golden-duck', 'diamond-duck', 'pair', 'king-pair', 'batting-average', 'not-out'],
    order: 60,
  }),

  definition({
    slug: 'fifty',
    title: 'Fifty',
    category: 'statistics-and-analytics',
    alsoIn: ['terminology'],
    difficulty: 'beginner',
    aliases: ['Half-century', 'Half Century'],
    summary: 'An individual score of 50 or more, and the first recognised batting milestone.',
    explanation: `A fifty, or half-century, is an individual innings of **50 runs or more**. It is the first milestone at which an innings is recognised as substantial.

On a career record, the **50s** column counts innings of 50 to 99. Scores of 100 or more are counted in the **100s** column instead, not in both, which is why the two columns are read together rather than added.

A batter who reaches 50 and goes on to 100 has made a hundred, not a fifty and a hundred.`,
    example: `A career record showing **50s: 32, 100s: 14**.

That batter has passed fifty **46** times in total, converting 14 of those into hundreds. The **conversion rate** is 14 ÷ 46 ≈ 30 per cent, which is the number analysts use to distinguish batters who reach fifty often from those who go on to make large scores.`,
    whyItMatters: `The milestone itself is arbitrary, and its real analytical use is the **conversion rate** it enables: how often a batter who gets in goes on to a hundred.

That distinction separates two genuinely different batting profiles that a raw average can conceal.`,
    misunderstandings: `**"A hundred counts as a fifty too."** Career columns count them separately; a hundred is not also counted as a fifty.

**"A fifty is a good innings by definition."** In T20, 50 from 50 balls can be a poor contribution; in a Test, 50 from 200 balls can be a match-saving one.`,
    related: ['hundred', 'double-century', 'highest-score', 'batting-average', 'nervous-nineties'],
    order: 70,
  }),

  definition({
    slug: 'hundred',
    title: 'Hundred',
    category: 'statistics-and-analytics',
    alsoIn: ['terminology'],
    difficulty: 'beginner',
    aliases: ['Century', 'Ton', 'Three Figures'],
    summary: 'An individual score of 100 or more: cricket’s most recognised batting achievement.',
    explanation: `A hundred, or century, is an individual innings of **100 runs or more**. It is the sport's headline batting milestone, and a batter reaching it is applauded regardless of the match situation.

Related terms:

- **Double century** — 200 or more.
- **Triple century** — 300 or more, rare even in Test cricket.
- **Ton** — informal synonym for a hundred.
- **Nervous nineties** — the period between 90 and 99, where batters are conventionally described as becoming cautious.

On a career record the **100s** column counts hundreds only; fifties are counted separately in the 50s column.`,
    whyItMatters: `A hundred is a substantial contribution in any format, and in Test cricket it usually means a batter has batted for a session or more, which has value beyond the runs.

The count of hundreds is one of the primary measures of a batting career, and the **conversion rate** from fifty to hundred is a recognised marker of the difference between a good batter and a great one.

In T20, a hundred is genuinely rare, since it requires an exceptional innings within 120 deliveries.`,
    misunderstandings: `**"A hundred is always match-winning."** Hundreds are made in losing causes regularly.

**"Centuries are counted in both the 50s and 100s columns."** They are counted only once, in the 100s column.

**"A hundred means a hundred balls."** It refers to runs; the balls faced are recorded separately and matter enormously to interpretation.`,
    related: [
      'fifty',
      'double-century',
      'nervous-nineties',
      'highest-score',
      'batting-average',
      'carrying-the-bat',
    ],
    order: 80,
  }),

  statistic({
    slug: 'boundary-percentage',
    title: 'Boundary Percentage',
    category: 'statistics-and-analytics',
    difficulty: 'advanced',
    summary:
      'The share of a batter’s runs that came in fours and sixes, which distinguishes hitters from accumulators.',
    measures: `What proportion of a batter's runs arrived in boundaries rather than by running.

It describes **how** runs were scored rather than how many, and it is one of the more useful simple derived statistics because it is computed from data every scorecard already carries.`,
    calculation: `**Boundary percentage = boundary runs ÷ total runs × 100**

where **boundary runs = (fours × 4) + (sixes × 6)**.

A related and separately useful measure is **boundary frequency**: boundaries ÷ balls faced, or balls per boundary, which describes how often rather than how much.

Both are ordinary arithmetic from scorecard data, which distinguishes them from the provider-specific metrics further down this category.`,
    example: `A batter makes **75 (62, 9x4, 2x6)**.

**Boundary runs:** 9 × 4 + 2 × 6 = **48**.

**Boundary percentage:** 48 ÷ 75 × 100 ≈ **64 per cent**.

**Balls per boundary:** 62 ÷ 11 ≈ **5.6**.

So 64 per cent of the runs came from 11 of the 62 deliveries, and the remaining 51 deliveries produced 27 runs.`,
    interpret: `High boundary percentage indicates a batter who scores in bursts and relies on clearing or beating the field. Low indicates an accumulator who works the ball around and runs hard.

Neither is better in general. What it predicts is **vulnerability to conditions**: a boundary-dependent batter is more affected by large grounds, slow pitches and a well-set deep field, whereas an accumulator is more affected by a fielding side that cuts off singles.

It is also used to assess whether a strike rate is sustainable: a strike rate of 150 built on 80 per cent boundary runs depends on continuing to find the boundary, while the same strike rate with more running is less fragile.`,
    limitations: `- **It ignores when the boundaries came.** Boundaries at the death against a spread field are harder than boundaries in the powerplay.
- **It ignores the bowling faced.**
- **It is a ratio, so small innings produce extreme values.** A batter making 12 with three fours has a boundary percentage of 100, which means nothing.
- **Ground size is a large confounder**, and boundary dimensions are not standardised.`,
    formatContext: `Most used in T20 analysis, where boundary-hitting ability is a selection criterion. Less discriminating in Tests, where innings are long enough that most batters accumulate a mix.`,
    misunderstandings: `**"Higher is better."** It describes a method, not quality.

**"It is a proprietary metric."** It is plain arithmetic from scorecard data, unlike control percentage or false-shot percentage.`,
    takeaways: `- Boundary runs ÷ total runs, from ordinary scorecard data.
- Describes how runs were scored, not their value.
- Predicts sensitivity to ground size and field settings.
- Extreme and meaningless for small innings.`,
    related: [
      'boundary-count',
      'strike-rate',
      'four',
      'six',
      'dot-ball-percentage',
      'death-overs-batting',
    ],
    order: 90,
  }),

  // ── Bowling statistics ────────────────────────────────────────────────────
  statistic({
    slug: 'wickets',
    title: 'Wickets',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary: 'The count of dismissals credited to a bowler, and the primary measure of bowling.',
    measures: `How many batters a bowler has dismissed. It is the headline bowling number, and the one a bowler's value is ultimately measured against, because a side must take ten wickets to end an innings and twenty to win a Test.`,
    calculation: `A count of dismissals **credited to the bowler**. The crediting rules matter, and they are not intuitive:

**Credited to the bowler:** bowled, caught, LBW, stumped, hit wicket, hit the ball twice.

**Not credited to any bowler:** run out, obstructing the field, timed out, retired out.

So a side dismissed for 200 with two run outs has taken eight bowler-credited wickets and ten wickets in total, which is why a bowling analysis' wickets column does not always sum to ten.`,
    example: `An innings ends at 240 all out. The bowling figures show 3, 3, 2, 1 wickets, summing to **nine**.

The tenth wicket was a **run out**, credited to the fielders rather than to any bowler.

A scorecard is internally consistent; the discrepancy is the crediting rule, not an error.`,
    interpret: `Wickets are the objective, but the raw count is heavily dependent on **opportunity**: overs bowled, matches played, and the phase a bowler operates in. A bowler with 30 wickets from 10 matches and one with 30 from 25 are not comparable.

That is why **bowling average** and **bowling strike rate** exist: they normalise wickets by runs conceded and balls bowled respectively.`,
    limitations: `- **Opportunity-dependent.** More overs means more wickets, all else equal.
- **Phase-dependent.** New-ball bowlers get more top-order wickets; death bowlers get lower-order ones at a higher run cost.
- **It says nothing about cost.** Thirty wickets at 20 and thirty at 45 are very different.
- **It ignores chances created**: a bowler who beats the bat repeatedly and has catches dropped shows nothing here.`,
    formatContext: `In Tests, wickets are close to the whole point, since twenty are needed to win. In T20, containment can be worth more than wickets, so a bowler's wicket count is a less complete summary of their value.`,
    misunderstandings: `**"All ten wickets are credited to bowlers."** Run outs and several rare dismissals are not.

**"More wickets means a better bowler."** Not without normalising for overs and cost.

**"A five-wicket haul is always a great performance."** 5 for 130 exists.`,
    takeaways: `- Dismissals credited to the bowler; run outs and some rare methods are not.
- The primary bowling objective, but opportunity-dependent.
- Needs average and strike rate to be interpretable.
- Less decisive in T20 than in Tests.`,
    related: [
      'bowling-average',
      'bowling-strike-rate',
      'five-wicket-haul',
      'dismissal',
      'economy-rate',
      'wickets-lost',
    ],
    order: 100,
  }),

  statistic({
    slug: 'bowling-average',
    title: 'Bowling Average',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'Runs conceded per wicket taken. Lower is better, which is the opposite of batting average.',
    measures: `The average cost, in runs, of each wicket a bowler takes. It combines the two things a bowler does — take wickets and concede runs — into one number.

**Lower is better.** This is the reverse of batting average, and it is the most common confusion for newcomers.`,
    calculation: `**Bowling average = runs conceded ÷ wickets taken**

Runs conceded includes **wides and no-balls** but excludes **byes and leg byes**, following the same attribution rule as economy rate.

A bowler who has taken no wickets has **no average**: the calculation would divide by zero, and the convention is to show a dash rather than a number.`,
    example: `A bowler's career figures: **4,120 runs conceded, 158 wickets**.

**Bowling average:** 4,120 ÷ 158 ≈ **26.08**.

For a single innings of **18.2-5-47-3**: 47 ÷ 3 ≈ **15.67**.

Note that the overs figure plays no part in a bowling average, so the decimal-overs trap does not arise here. It does arise for economy rate and strike rate.`,
    interpret: `Rough Test-cricket reference points for frontline bowlers:

- **Below 25:** very good.
- **20 to 22 or lower over a long career:** exceptional.
- **25 to 30:** solid international standard.
- **Above 35:** struggling at that level.

Bowling average is generally regarded as the single best summary of a **Test** bowler, because it captures both wicket-taking and economy, and both matter over a long innings.

It is much weaker in T20, where a bowler's four overs are often about containment and where a bowler can have an inflated average from bowling exclusively at the death.`,
    limitations: `- **It ignores balls bowled.** Two bowlers averaging 25 are not equivalent if one takes a wicket every 45 balls and the other every 80; that is what **bowling strike rate** captures.
- **It is phase-blind.** Death bowlers concede more runs by design.
- **It ignores conditions and opposition.**
- **Undefined with no wickets**, and unstable with very few.
- **Not comparable across eras or formats** without context.`,
    formatContext: `The primary bowling number in Tests. In ODIs it is informative alongside economy. In T20 it is the weakest of the three main bowling numbers, because a bowler who concedes few runs and takes few wickets may be doing their job perfectly.`,
    misunderstandings: `**"Higher is better."** Lower is better for bowlers.

**"Bowling average and batting average are the same statistic."** Both are runs divided by something, and the something and the direction of merit are both different.

**"Byes count against the bowler."** They do not.`,
    takeaways: `- Runs conceded ÷ wickets taken; lower is better.
- Wides and no-balls count; byes and leg byes do not.
- The best single summary of a Test bowler.
- Blind to how quickly wickets came, which strike rate covers.`,
    related: [
      'bowling-strike-rate',
      'economy-rate',
      'wickets',
      'batting-average',
      'five-wicket-haul',
      'wicket-taking-bowling',
    ],
    order: 110,
  }),

  statistic({
    slug: 'bowling-strike-rate',
    title: 'Bowling Strike Rate',
    category: 'statistics-and-analytics',
    difficulty: 'intermediate',
    summary:
      'Balls bowled per wicket taken. Lower is better, and it is a completely different statistic from batting strike rate.',
    measures: `How frequently a bowler takes wickets, measured in deliveries.

It shares its name with **batting strike rate** and has nothing else in common with it: different formula, different units, and the opposite direction of merit. Batting strike rate is runs per 100 balls and higher is better; bowling strike rate is balls per wicket and lower is better.`,
    calculation: `**Bowling strike rate = balls bowled ÷ wickets taken**

Balls bowled must be computed from the overs figure properly:

**balls bowled = (completed overs × 6) + balls into the current over**

Some sources express bowling strike rate in **overs per wicket** instead, which is the same information divided by six. The balls-per-wicket form is standard.`,
    example: `A bowler's figures: **892.4 overs, 158 wickets**.

**Balls bowled:** 892 × 6 + 4 = **5,356**.

**Strike rate:** 5,356 ÷ 158 ≈ **33.9** balls per wicket, so roughly a wicket every five and a half overs.

Using 892.4 × 6 = 5,354.4 would be wrong, though only slightly. The error is larger for shorter spells: for **8.2** overs, 8.2 × 6 = 49.2 instead of the correct 50.`,
    interpret: `Rough Test reference points for frontline bowlers:

- **Below 50 balls per wicket:** good.
- **Around 40 or below:** very good.
- **Low 30s or below over a career:** exceptional.

Strike rate answers the question bowling average cannot: **how quickly**. In Test cricket that matters because a side has to take twenty wickets within a fixed time, so a bowler who takes wickets in clusters and at speed is worth more than the average alone suggests.

Read alongside bowling average and economy rate, the three together describe a bowler almost completely: how often, at what cost per wicket, and at what cost per over.`,
    limitations: `- **It ignores runs entirely.** A bowler with a strike rate of 30 who concedes six an over may be less useful than one at 50 conceding three.
- **Phase-blind.** New-ball bowlers usually strike more often than middle-overs containment bowlers.
- **Unstable with few wickets**, and undefined with none.
- **Not comparable across formats**: a T20 bowler bowls only 24 balls a match.`,
    formatContext: `Most meaningful in Tests, where taking twenty wickets in limited time is the objective. In T20 it is less central than economy, because a bowler's primary job is often to deny runs across four overs rather than to strike.`,
    misunderstandings: `**"Strike rate means the same for batters and bowlers."** Entirely different statistics sharing a name.

**"Higher is better."** Lower is better for bowlers.

**"You can multiply the overs figure by six."** Only if it has no ball remainder.`,
    takeaways: `- Balls bowled ÷ wickets; lower is better.
- Compute balls from overs properly: overs × 6 + balls.
- Answers "how quickly", which bowling average cannot.
- Shares a name with batting strike rate and nothing else.`,
    related: [
      'bowling-average',
      'economy-rate',
      'strike-rate',
      'wickets',
      'overs-notation',
      'wicket-taking-bowling',
    ],
    order: 120,
  }),

  statistic({
    slug: 'maidens',
    title: 'Maidens',
    category: 'statistics-and-analytics',
    difficulty: 'intermediate',
    summary:
      'The count of a bowler’s maiden overs, shown as the second figure in a bowling analysis.',
    measures: `How many overs a bowler has bowled without conceding a run charged to them. It is a measure of sustained accuracy and of pressure applied.`,
    calculation: `A count of overs in which the bowler conceded **no runs charged to them**: no runs off the bat, no wides, no no-balls.

**Byes and leg byes do not spoil a maiden**, since they are not charged to the bowler.

Maidens appear as the second number in the standard analysis: **18.2-5-47-3** means five maidens.

An incomplete over cannot be a maiden, so the fractional part of the overs figure never contributes.`,
    example: `**Anderson 18.2-5-47-3**

Five of his eighteen completed overs were maidens: 28 per cent.

Over those five overs he conceded nothing, so his other thirteen overs and two balls conceded all 47 runs, an effective rate of about 3.5 an over across them.

That decomposition is why the maidens column is informative rather than decorative.`,
    interpret: `In **Test cricket**, a high maiden proportion signals sustained accuracy and is part of how a bowler builds pressure. Five maidens in eighteen overs is good; ten in twenty is exceptional control.

In **T20**, maidens are genuinely rare and disproportionately valuable, because six dot balls in a chase move the required rate substantially. A maiden over in a T20 international is remarkable enough to be discussed individually.

In **ODIs** they sit between the two.`,
    limitations: `- **Opportunity-dependent.** More overs bowled means more chances at a maiden.
- **It rewards containment, not wickets.** A bowler with many maidens and few wickets may not be helping a Test side much.
- **Byes and leg byes are excluded**, so a maiden does not mean the team conceded nothing.
- **Not comparable across formats** at all, given how differently batters approach them.`,
    formatContext: `A normal feature of Test bowling analyses and a notable event in T20. Any cross-format comparison of maiden counts is meaningless.`,
    misunderstandings: `**"A maiden means six dot balls."** Byes and leg byes may have been scored; what matters is nothing charged to the bowler.

**"Maidens are just a Test statistic."** They are far more valuable, per maiden, in T20.

**"An incomplete over can be a maiden."** It cannot.`,
    takeaways: `- Count of overs conceding nothing charged to the bowler.
- Byes and leg byes do not spoil one.
- Signals accuracy in Tests; genuinely rare and valuable in T20.
- Opportunity-dependent and cross-format meaningless.`,
    related: [
      'maiden-over',
      'economy-rate',
      'dot-ball',
      'extras',
      'bowling-scorecard',
      'dot-ball-pressure',
    ],
    order: 130,
  }),

  definition({
    slug: 'five-wicket-haul',
    title: 'Five-wicket Haul',
    category: 'statistics-and-analytics',
    alsoIn: ['terminology'],
    difficulty: 'beginner',
    aliases: ['Five-for', 'Fifer', 'Five Wickets in an Innings'],
    summary:
      'Five or more wickets by one bowler in a single innings: the standard bowling milestone.',
    explanation: `A five-wicket haul is **five or more wickets in one innings** by one bowler. It is the bowling equivalent of a batting hundred: the recognised marker of an outstanding individual performance.

Written as **5/47** or **5 for 47**, and referred to as a **five-for** or a **fifer**.

Career records carry a **5w** or **5wi** column counting them. A ten-wicket haul across both innings of a match is counted separately, in a **10w** or **10wm** column.`,
    whyItMatters: `Taking five in an innings usually means a bowler has dismissed half a side, which in Test cricket is a substantial share of the twenty wickets needed to win.

It is also the milestone by which bowling careers are summarised, in the same way hundreds summarise batting ones, and the count of five-wicket hauls is one of the first figures quoted about any bowler.`,
    misunderstandings: `**"A five-for is always a great performance."** 5 for 130 exists, and is not.

**"Five wickets in a match counts."** The milestone is five in an **innings**; five across a match does not count as a five-for.

**"Ten wickets in a match means two five-fors."** Not necessarily: 6 and 4 is a ten-wicket match haul without a five-for in either innings... though in fact 6 in one innings is itself a five-wicket haul. A 4 and 6 split gives one five-for and a ten-wicket haul; a 5 and 5 split gives two five-fors.`,
    related: [
      'ten-wicket-match-haul',
      'wickets',
      'bowling-average',
      'hat-trick',
      'bowling-scorecard',
    ],
    order: 140,
  }),

  definition({
    slug: 'ten-wicket-match-haul',
    title: 'Ten-wicket Match Haul',
    category: 'statistics-and-analytics',
    alsoIn: ['terminology'],
    difficulty: 'intermediate',
    aliases: ['Ten-for', 'Ten Wickets in a Match'],
    summary:
      'Ten or more wickets by one bowler across both innings of a match, possible only in multi-day cricket.',
    explanation: `A ten-wicket match haul is **ten or more wickets across both innings** of a match by one bowler.

It requires two innings per side, so it exists only in **multi-day cricket**: Tests and first-class matches. A limited-overs match gives a bowler one innings and a maximum of ten wickets in it, which is a separate and vanishingly rare feat.

Written as **10/105** with the split usually given: **10 for 105 (6/60 and 4/45)**.

Career records count these in a **10w** or **10wm** column, separately from five-wicket hauls.`,
    whyItMatters: `Ten wickets in a match means a bowler has taken half of all available wickets in the game. It is substantially rarer than a five-wicket haul and is one of the strongest single-match bowling performances possible.

It also frequently correlates with a match result, since taking half the wickets usually means being central to a win.`,
    misunderstandings: `**"A ten-for is two five-fors."** Not necessarily. A split of 6 and 4, or 7 and 3, gives a ten-wicket haul with only one five-wicket haul, or in the 7-3 case still only one.

**"It can happen in an ODI."** Ten wickets in a single innings is theoretically possible and effectively unheard of; the match-haul concept needs two innings.

**"All ten wickets in one innings is the same thing."** Taking all ten in an innings is a distinct and far rarer feat.`,
    related: [
      'five-wicket-haul',
      'wickets',
      'bowling-average',
      'test-cricket',
      'first-class-cricket',
    ],
    order: 150,
  }),

  statistic({
    slug: 'catches-statistic',
    title: 'Catches',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'The count of catches a fielder or keeper has taken, and the main fielding statistic cricket records.',
    measures: `How many catches a player has taken. It is recorded per player in career records, split between **wicketkeepers** and **fielders**, because their opportunities are entirely different.`,
    calculation: `A simple count of completed catches.

Keepers' catches are counted separately from their **stumpings**, and a keeper's record is usually presented as both: **ct 210, st 32**, sometimes summed as **dismissals**.

The catch is credited to the catcher; the **wicket** is credited to the bowler.`,
    interpret: `The number is almost entirely a function of **opportunity**, and this is the statistic's central weakness.

A slip catcher in a side with a strong pace attack will take far more catches than an equally good fielder at mid-on. A keeper standing back to fast bowlers takes more catches and fewer stumpings than one keeping mostly to spin. None of that reflects skill.

So catch counts are useful for identifying who fields where and for career longevity, and close to useless for comparing fielding ability.`,
    limitations: `- **Opportunity-dominated**, by position, by attack and by conditions.
- **Drops are not recorded** in official statistics at all, which is the largest gap in cricket's data. A fielder who takes 40 catches and drops 20 looks identical to one who takes 40 and drops none.
- **Difficulty is not recorded.** A regulation catch at mid-off and a full-length diving catch at slip count the same.
- **No standard chance-conversion measure exists** in public records, though analytics providers track chances internally.`,
    formatContext: `Comparable within a role and a format, and misleading otherwise. Keepers' and fielders' numbers should never be pooled.`,
    misunderstandings: `**"Catch counts measure fielding ability."** They mostly measure position and opportunity.

**"Drops are recorded."** Not in standard statistics, which is why catching is one of the least well-measured skills in the sport.

**"A caught dismissal credits the fielder with a wicket."** The wicket is the bowler's; the catch is the fielder's.`,
    takeaways: `- A count of completed catches, kept separately for keepers and fielders.
- Dominated by opportunity: position, attack and conditions.
- Drops are not recorded, which is the major gap.
- Not a measure of fielding quality.`,
    related: [
      'caught',
      'catching',
      'slip-catching',
      'stumpings-statistic',
      'run-outs-statistic',
      'wicketkeeping',
    ],
    order: 160,
  }),

  statistic({
    slug: 'stumpings-statistic',
    title: 'Stumpings',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'The count of stumpings a wicketkeeper has completed, recorded separately from their catches.',
    measures: `How many batters a keeper has dismissed **stumped**: out of their ground, not attempting a run, with the keeper putting the wicket down.

It is recorded separately from catches in every keeper's career record, and the split is informative in itself.`,
    calculation: `A count of dismissals recorded as **stumped**, which requires the keeper to have put the wicket down unaided with the ball.

If another fielder touched the ball first, it is a **run out** and is not counted here. If the batter was attempting a run, it is also a run out, regardless of who completed it.

Keeper records typically show **ct** and **st** separately, and sometimes a combined **dismissals** figure.`,
    interpret: `The **ratio** of stumpings to catches tells you what kind of bowling a keeper has kept to.

A keeper with a high stumping count has kept extensively to **spin**, standing up to the stumps. One with very few has kept mostly to **pace**, standing back, where catches dominate and stumping chances barely arise.

That makes the split a useful proxy for a keeper's technical experience: standing up to spin is the harder discipline, and a keeper with many stumpings has done a lot of it.`,
    limitations: `- **Almost entirely opportunity-driven**, by the balance of the attack the keeper has kept to.
- **Missed stumpings are not recorded**, the same gap as with dropped catches.
- **Comparison across keepers is unsafe** without knowing what attacks they kept to.
- **Very small numbers** overall, so year-to-year variation is mostly noise.`,
    formatContext: `Higher in cricket played on turning pitches and in eras and teams with spin-heavy attacks. Cross-era and cross-team comparison is not meaningful without that context.`,
    misunderstandings: `**"Stumpings measure keeping quality."** They mostly measure how much spin the keeper has kept to.

**"A stumping off another fielder's throw counts."** That is a run out.

**"Stumped and run out are interchangeable in records."** They are distinct, and only stumped credits the bowler with a wicket.`,
    takeaways: `- Count of stumped dismissals, kept separately from catches.
- The catches-to-stumpings ratio indicates how much spin a keeper kept to.
- Missed chances are unrecorded.
- Opportunity-driven and not a quality measure.`,
    related: [
      'stumped',
      'stumping',
      'standing-up',
      'catches-statistic',
      'wicketkeeping',
      'spin-bowling',
    ],
    order: 170,
  }),

  statistic({
    slug: 'run-outs-statistic',
    title: 'Run Outs',
    category: 'statistics-and-analytics',
    difficulty: 'beginner',
    summary:
      'Run outs a fielder has effected, credited to fielders rather than bowlers and recorded inconsistently.',
    measures: `How many run outs a fielder has been involved in. It is the least well-standardised of cricket's fielding statistics.`,
    calculation: `A count of run outs the player contributed to, and the difficulty is that a run out often involves **two or three players**: one who gathered, one who threw, one who applied the ball to the stumps.

Practice varies. Some records credit only the player who broke the wicket; some credit the thrower; some record assists separately; some record a shared credit. The scorecard notation, **run out (Root/Buttler)**, names the players involved without formally distributing credit.

No wicket is credited to any bowler.`,
    interpret: `Treat the number cautiously. Because the attribution convention differs between sources, run-out counts are not reliably comparable across databases, let alone across eras.

What the underlying skill consists of is clear enough — anticipation, gathering, throwing accuracy, and the keeper's or fielder's work at the stumps — but the public statistic captures it poorly.`,
    limitations: `- **Attribution is inconsistent** between sources, which is the fundamental problem.
- **Opportunity-driven**: fielders in the ring in limited-overs cricket get far more chances.
- **Missed chances unrecorded**, as with catches.
- **Direct hits and assisted run outs are not distinguished** in most records.
- **Not comparable across sources**, which is unusual even among cricket's weaker statistics.`,
    formatContext: `Far more frequent in limited-overs cricket, where batters take risks for singles that nobody would attempt in a Test.`,
    misunderstandings: `**"Run outs are credited to the bowler."** They are not credited to any bowler.

**"The fielder who broke the wicket gets the run out."** Conventions vary, and many run outs are recorded as shared.

**"Run-out counts are comparable between players."** Not reliably, given the attribution inconsistency.`,
    takeaways: `- Count of run outs a fielder contributed to, credited to fielders not bowlers.
- Attribution conventions differ between sources.
- Opportunity-driven and much more frequent in limited-overs cricket.
- The least standardised fielding statistic.`,
    related: ['run-out', 'run-out-technique', 'direct-hit', 'catches-statistic', 'ground-fielding'],
    order: 180,
  }),

  // ── Advanced and provider-specific ────────────────────────────────────────
  statistic({
    slug: 'dot-ball-percentage',
    title: 'Dot-ball Percentage',
    category: 'statistics-and-analytics',
    difficulty: 'advanced',
    summary:
      'The share of a bowler’s deliveries from which no run was scored, and one of the few genuinely useful derived white-ball metrics.',
    measures: `What proportion of a bowler's legal deliveries were dot balls. For a batter, the same measure describes how often they failed to score.

It is a **containment** measure, and it captures something economy rate does not: whether runs were conceded steadily or in bursts.`,
    calculation: `**Dot-ball percentage = dot balls ÷ legal balls bowled × 100**

It is ordinary arithmetic on ball-by-ball data, which every scorer records. That distinguishes it from the judgement-based metrics below: two providers computing dot-ball percentage from the same match will get the same answer.

Definitional care is needed on one point: whether **wides and no-balls** are excluded from the denominator, since they are not dots and are re-bowled. Convention generally excludes them, but a source should state it.`,
    example: `A T20 bowler's four overs: **24 legal balls, 11 dots, 32 runs conceded**.

**Dot-ball percentage:** 11 ÷ 24 × 100 ≈ **46 per cent**.

**Economy rate:** 32 ÷ 4 = **8.00**.

Compare a second bowler: also 4-0-32, but with 5 dots and no over conceding more than 9. Same economy, very different innings: the first bowler applied more pressure and conceded more boundaries; the second leaked steadily.

Economy alone cannot distinguish them; dot-ball percentage can.`,
    interpret: `In T20 cricket, roughly 35 to 45 per cent dots is respectable for a frontline bowler, and higher figures are strong, though the numbers vary substantially by phase: powerplay and death dot percentages are not comparable.

Its analytical value is that it links directly to the **required-rate mechanism**: each dot raises what the batting side needs from the remaining balls, so dot percentage is a measure of pressure applied that has an arithmetic rather than a psychological basis.`,
    limitations: `- **Phase-blind unless split.** Death-over dots are much harder to bowl than middle-over dots.
- **It ignores wickets** entirely.
- **A bowler can accumulate dots cheaply** by bowling wide of the stumps into a spread field, without creating any chance.
- **Definitional variation** in whether wides and no-balls are excluded.
- **Near-meaningless in Test cricket**, where a batter can decline to score indefinitely and dots carry no arithmetic consequence.`,
    formatContext: `A genuinely useful T20 and ODI metric. Not informative in Test cricket, where the mechanism that gives it meaning does not exist.`,
    misunderstandings: `**"It is a proprietary metric."** It is plain arithmetic from ball-by-ball data.

**"Higher is always better."** Dots achieved by bowling harmlessly wide create no chances.

**"It works in all formats."** In Tests it measures very little.`,
    takeaways: `- Dots ÷ legal balls, from ordinary ball-by-ball data.
- Distinguishes steady leakage from burst-conceding at the same economy.
- Directly linked to the required-rate mechanism.
- Needs phase splits, and is uninformative in Tests.`,
    related: [
      'dot-ball',
      'dot-ball-pressure',
      'economy-rate',
      'maidens',
      'phase-splits',
      'defensive-bowling',
    ],
    order: 190,
  }),

  statistic({
    slug: 'control-percentage',
    title: 'Control Percentage',
    category: 'statistics-and-analytics',
    difficulty: 'advanced',
    summary:
      'A provider-recorded judgement of how often a batter met the ball as intended. Not a universal statistic.',
    measures: `The proportion of deliveries on which a batter is judged to have played the shot they intended, with the middle of the bat or as planned.

It exists to capture something the scorecard cannot: whether a batter is scoring in control or surviving on edges and mishits. Two batters on 40 from 30 balls can have very different control figures, and the one with the lower figure is generally closer to being dismissed.`,
    calculation: `**There is no universal formula, and this entry will not invent one.**

Control is a **coded judgement**, not a calculation. An analyst watching each delivery records whether the batter was in control of the shot, using their provider's coding rules, and the percentage is the share of deliveries so marked.

That has three consequences a reader needs:

**It is provider-specific.** Different providers use different coding definitions and different analysts, so their control figures are not interchangeable and should not be compared across sources.

**It is subjective in a bounded way.** The coding is rule-governed and consistently applied within a provider, but it is a human judgement about intent rather than an observable fact like a run or a wicket.

**It is not in the public record.** Unlike runs, balls and wickets, control data is collected by commercial providers and is not part of the standard scorecard, so historical coverage is limited and uneven.

Anybody presenting a control percentage should say which provider produced it.`,
    interpret: `Read it as a **risk indicator** rather than a performance measure. A batter scoring quickly with a low control percentage is riding their luck, and the usual analytical inference is that the innings is less likely to continue than the runs suggest.

The complementary measure, **false-shot percentage**, is essentially its inverse and is often the figure quoted for bowlers: a bowler inducing a high false-shot rate is beating the bat regularly even if the wickets have not come.

That is its most valuable use: it identifies bowlers who are bowling well without reward, which raw figures cannot.`,
    limitations: `- **Provider-specific and not comparable across sources.**
- **Subjective**, in that it codes intent.
- **Not universally available**, especially historically.
- **No public standard definition**, so a figure without a stated source is uninterpretable.
- **Context-dependent**: a batter defending resolutely against a moving ball may show low control while doing exactly the right thing.`,
    formatContext: `Used in all formats, and most often cited in Test cricket to show that a bowler is beating the bat, and in T20 to distinguish controlled hitting from slogging.`,
    misunderstandings: `**"Control percentage is a standard statistic."** It is a provider-recorded judgement, not a Law-defined or arithmetically derived figure.

**"There is a formula for it."** There is a coding rule, which differs by provider.

**"Low control means poor batting."** Against high-quality bowling in difficult conditions, low control can accompany a valuable innings.`,
    takeaways: `- The share of deliveries a batter was judged to have met as intended.
- A coded human judgement, not a calculation.
- Provider-specific: never compare figures across sources.
- Best used as a risk indicator and to identify unlucky bowlers.`,
    related: [
      'false-shot-percentage',
      'phase-splits',
      'strike-rate',
      'batting-average',
      'wicket-taking-bowling',
    ],
    order: 200,
  }),

  statistic({
    slug: 'false-shot-percentage',
    title: 'False-shot Percentage',
    category: 'statistics-and-analytics',
    difficulty: 'advanced',
    summary:
      'The provider-recorded share of deliveries that produced a mistimed or misjudged shot. The inverse of control.',
    measures: `How often a bowler induced a shot the batter did not intend or did not execute: an edge, a mishit, a play-and-miss, a ball that beat the bat.

It is the bowler-side view of the same coding that produces **control percentage** for batters.`,
    calculation: `**As with control percentage, there is no universal formula and none is invented here.**

A false shot is a **coded judgement** by a provider's analysts, applied per delivery under that provider's rules. The percentage is false shots divided by deliveries.

The consequences are the same as for control percentage:

- **Provider-specific**, with different coding rules and therefore non-comparable figures.
- **Not part of the public scorecard**, so availability is limited and mostly recent.
- **A judgement about execution**, not an observable event.

A false-shot figure quoted without its source cannot be interpreted.`,
    interpret: `Its main analytical use is identifying bowlers whose figures **understate** their performance.

A bowler with 0 for 45 who induced false shots on 25 per cent of deliveries has beaten the bat repeatedly and been unlucky; another with 0 for 45 and a 6 per cent false-shot rate has simply not troubled anybody. The scorecard cannot tell them apart, and this can.

Over a longer period, false-shot rates are generally considered more stable than wicket counts, which makes them useful for assessing bowlers over small samples where wickets are noisy.`,
    limitations: `- **Provider-specific and not cross-comparable.**
- **Subjective coding** of execution and intent.
- **Sparse historically.**
- **No public standard definition.**
- **Not a substitute for wickets.** A bowler who induces false shots and never takes wickets has still not taken wickets, and a side has to bowl the opposition out.`,
    formatContext: `Most cited in Test cricket, where it explains a bowler beating the bat without reward over long spells. Used in T20 too, though there the arithmetic of economy usually dominates the discussion.`,
    misunderstandings: `**"False-shot percentage is a formula."** It is a coding rule that varies by provider.

**"It measures bowling quality objectively."** It measures a judgement, consistently applied within one provider.

**"A high false-shot rate means wickets are coming."** It raises the probability; it guarantees nothing.`,
    takeaways: `- Share of deliveries producing a mistimed or misjudged shot.
- The bowler-side inverse of control percentage.
- A provider-specific coded judgement, not a calculation.
- Best used to find bowlers whose figures understate them.`,
    related: [
      'control-percentage',
      'phase-splits',
      'bowling-average',
      'wicket-taking-bowling',
      'edge',
    ],
    order: 210,
  }),

  statistic({
    slug: 'phase-splits',
    title: 'Phase Splits',
    category: 'statistics-and-analytics',
    difficulty: 'advanced',
    summary:
      'Breaking a player’s record down by phase of the innings, which is often the only way their statistics make sense.',
    measures: `A player's performance separated by the phase of the innings in which it occurred, rather than aggregated across all of it.

The standard limited-overs phases, and these are **analytical conventions rather than defined periods** in the playing conditions:

- **T20:** overs 1-6 (powerplay), 7-15 (middle), 16-20 (death).
- **ODI:** overs 1-10, 11-40, 41-50, following the fielding-restriction blocks.

Different analysts and providers use slightly different boundaries, particularly for the T20 middle and death split, so a phase figure should state its definition.`,
    calculation: `Ordinary statistics — runs, balls, wickets, economy, strike rate — computed **within** a phase rather than across the innings.

This is plain arithmetic on ball-by-ball data, unlike control and false-shot percentages. Two analysts using the same phase boundaries will get the same numbers.

The only genuine definitional issue is where the boundaries fall, which is a convention rather than a fact.`,
    example: `A T20 bowler's season: **economy 8.4**.

Split by phase:

- **Powerplay:** 6 overs, economy 6.2.
- **Middle:** 10 overs, economy 7.1.
- **Death:** 18 overs, economy 9.6.

The aggregate 8.4 looked mediocre. The split shows a bowler used overwhelmingly at the death, where 9.6 may be entirely respectable, and who is economical when used earlier.

The aggregate figure was not wrong; it was uninterpretable without the split.`,
    interpret: `Phase splits are the standard correction for the biggest distortion in limited-overs statistics, which is that **different phases have completely different expected rates**.

They matter most for:

**Death bowlers**, whose aggregate economy always looks poor.

**Finishers**, whose strike rate is depressed by facing yorkers and whose average is inflated by not-outs.

**Powerplay batters**, whose strike rates benefit from fielding restrictions.

Comparing two players' aggregate numbers without knowing their phase usage is one of the most common analytical errors in white-ball cricket.`,
    limitations: `- **Phase boundaries are conventions**, and differ between sources.
- **Sample sizes shrink**, sometimes drastically: a bowler's death-overs record in one season may be 30 overs, which is very noisy.
- **They do not capture match situation.** Bowling at the death while defending 220 is different from defending 140.
- **They require ball-by-ball data**, so historical coverage is limited.`,
    formatContext: `Essential in T20 and ODI analysis. Less used in Tests, where the equivalent splits are by ball age and by session rather than by over number.`,
    misunderstandings: `**"Phase boundaries are official."** They are analytical conventions; only the fielding-restriction blocks are defined in playing conditions.

**"Phase splits are proprietary."** The arithmetic is ordinary; only the underlying ball-by-ball data collection is a provider service.

**"A split figure is more reliable than an aggregate."** It is more interpretable and less reliable, because the sample is smaller.`,
    takeaways: `- Standard statistics computed within a phase rather than across an innings.
- The correction for phases having different expected rates.
- Essential for judging death bowlers and finishers.
- Boundaries are conventions, and samples get small quickly.`,
    related: [
      'matchups',
      'death-overs',
      'powerplay',
      'economy-rate',
      'strike-rate',
      'finisher',
      'dot-ball-percentage',
    ],
    order: 220,
  }),
];
