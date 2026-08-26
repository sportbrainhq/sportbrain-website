import { definition, concept, law } from './cricket-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';
import { MCC_CODE, ICC_PC, REVIEWED } from './cricket-review-metadata';

/**
 * Match Basics and Laws & Rules.
 *
 * The beginner floor of the library. Two rules shape everything here.
 *
 * The first is that these entries are written for somebody who has never
 * watched a match, so nothing may be defined in terms of something further up
 * the taxonomy. "Crease" cannot lean on "batter's ground" if "batter's ground"
 * leans back on "crease".
 *
 * The second is that everything in Laws & Rules is written against the Law and
 * carries the edition, because the alternative, a confident paraphrase from
 * memory, is the failure mode this whole category exists to avoid. Where a rule
 * is actually a playing condition rather than a Law, it says so.
 */

const MCC = { key: 'mcc-laws' } as const;

export const CRICKET_BASICS_AND_LAWS: ExplainerSeed[] = [
  // ── Match Basics ──────────────────────────────────────────────────────────
  definition({
    slug: 'batter',
    title: 'Batter',
    category: 'match-basics',
    summary:
      'A player whose job when their team is batting is to score runs and avoid getting out.',
    explanation: `One of the two players from the batting side who are on the field at any moment. The batting side has eleven players and they bat in a chosen order, two at a time; when one is out, the next comes in.

The batter facing the bowling is the **striker**. Their partner, at the other end, is the **non-striker**.

"Batter" is the current term in the Laws of Cricket and in most cricket writing. "Batsman" is the older word and still widely used; the MCC changed the Laws to gender-neutral terminology in 2021, and SportBrain follows the current Laws.`,
    whyItMatters: `Batting is the only way a team scores. A batter's innings ends when they are out, and unlike most sports there is no second chance in that innings: one mistake against one delivery can end a two-hour stay.`,
    related: ['striker', 'non-striker', 'batting-order', 'bowler', 'dismissal'],
    sourceKeys: [{ ...MCC, locator: 'Law 25 (Batter’s innings)' }],
    order: 20,
  }),

  definition({
    slug: 'bowler',
    title: 'Bowler',
    category: 'match-basics',
    summary:
      'The fielding-side player who delivers the ball at the striker, trying to take wickets or restrict runs.',
    explanation: `The bowler runs in and delivers the ball towards the striker's stumps. They bowl one **over** of six legal deliveries, then a different bowler bowls the next over from the other end. No bowler may bowl two overs in a row.

Bowling is not throwing. The Laws require the arm to be **bowled**, meaning the elbow may not straighten beyond a permitted tolerance during the delivery swing; exceeding it is an illegal action and the umpire calls no-ball.

Bowlers divide broadly into **pace bowlers**, who rely on speed and movement, and **spin bowlers**, who rely on revolutions imparted to the ball and on deceiving the batter in the air.`,
    whyItMatters: `A side has to take ten wickets to end an innings, and twenty to win a Test. Bowling is how that happens, and in limited-overs cricket bowling is also the main lever on the opposition's scoring rate.`,
    related: ['bowling-action', 'over', 'delivery', 'pace', 'spin-bowling', 'fast-bowling'],
    sourceKeys: [{ ...MCC, locator: 'Laws 20, 21 (Dead ball; No ball)' }],
    order: 30,
  }),

  definition({
    slug: 'fielder',
    title: 'Fielder',
    category: 'match-basics',
    summary:
      'Any player of the fielding side other than the bowler and wicketkeeper, placed to stop runs and take catches.',
    explanation: `Eleven players field. One bowls, one keeps wicket, and the other nine are fielders placed around the ground by the captain.

There are no marked fielding positions. Cricket has a shared vocabulary of named regions instead, so the captain can move somebody with two words. A fielder's job is some mixture of three things: **stopping runs**, **taking catches** and **effecting run outs**.

Under the Laws a fielder may not significantly change position once the bowler begins their run-up, and there are restrictions on how many may stand on the leg side behind square. In limited-overs cricket, **fielding restrictions** cap how many may stand outside the thirty-yard circle in each phase.`,
    whyItMatters: `Fielding is the part of cricket that does not appear in the scorecard and decides matches anyway. A dropped catch hands a batter a second innings; a direct-hit run out at the death can be worth more than a wicket taken with the ball.`,
    related: [
      'cricket-field-positions',
      'catching',
      'ground-fielding',
      'fielding-restrictions',
      'field-setting',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 28 (The fielder)' }],
    order: 40,
  }),

  concept({
    slug: 'wicketkeeper',
    title: 'Wicketkeeper',
    category: 'match-basics',
    alsoIn: ['fielding-and-wicketkeeping'],
    aliases: ['Wicket-keeper', 'Keeper'],
    summary:
      'The specialist fielder positioned directly behind the striker’s stumps, and the only one allowed gloves and pads.',
    explanation: `The wicketkeeper crouches behind the stumps at the striker's end and takes every ball the batter does not hit. They are the only fielder permitted external leg guards and gloves, which is what allows them to take a ball travelling at 145 km/h from a few metres away.

They are involved in more dismissals than anyone else on the field: they take catches off the edge, complete **stumpings**, and receive the throws that produce **run outs**.`,
    howItWorks: `Two positions, chosen by the bowler.

**Standing back**, several metres behind the stumps, to pace bowling. The ball is caught after it has begun to drop, which is why keepers to fast bowlers appear so far away.

**Standing up** to the stumps, for spin and slow-medium bowling. This is the harder discipline: the keeper is close enough to be beaten by turn and bounce, and must take the ball cleanly enough to complete a stumping if the batter's foot leaves the ground.

Under the Laws the keeper must remain wholly behind the wicket until the ball reaches the striker or the striker attempts a run; moving in front early is a no-ball.`,
    whyItMatters: `A keeper who misses chances costs a side wickets nobody records against them. A keeper standing up to spin also compresses the batter's crease: knowing that leaving the ground means being stumped changes what a batter can do against turn.`,
    misunderstandings: `**"The keeper is just a catcher."** They are the fielding side's only permanent close catcher, the hub of every run-out throw, and in most teams a specialist batter too.

**"Standing back is easier."** It is different. Standing up to spin is generally regarded as the more technical skill.`,
    related: [
      'wicketkeeping',
      'standing-up',
      'standing-back',
      'stumped',
      'wicketkeeper-batter',
      'wicketkeeping-gloves',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 27 (The wicket-keeper)' }],
    order: 50,
  }),

  definition({
    slug: 'wicket',
    title: 'Wicket',
    category: 'match-basics',
    alsoIn: ['equipment', 'terminology'],
    summary: 'Three meanings in one word: the stumps and bails, the pitch itself, or a dismissal.',
    explanation: `This is the most overloaded word in cricket, and sorting it out early saves a lot of confusion.

**1. The stumps and bails.** The wicket is the set of three wooden stumps with two bails resting on top, one set at each end of the pitch. "The ball hit the wicket" means it hit the stumps. Putting the wicket down is what dismisses a batter bowled, run out or stumped.

**2. The pitch.** "A good wicket to bat on" means the strip of ground, not the stumps. Commentators use "wicket" and "pitch" interchangeably in this sense.

**3. A dismissal.** "England took three wickets" means three batters were out. "England lost three wickets" means the same event from the other side.

Which meaning is intended is almost always obvious from context, and cricket has never felt any need to fix the ambiguity.`,
    example: `"He bowled beautifully on a slow wicket and took four wickets, the last of them by knocking the wicket over."

All three meanings, in one sentence: the pitch, four dismissals, and the stumps.`,
    related: ['stumps', 'bails', 'cricket-pitch', 'dismissal', 'bowled', 'wickets-lost'],
    sourceKeys: [{ ...MCC, locator: 'Law 8 (The wickets)' }],
    order: 60,
  }),

  concept({
    slug: 'cricket-pitch',
    title: 'The Pitch',
    category: 'match-basics',
    alsoIn: ['pitch-and-conditions'],
    summary:
      'The prepared strip in the middle of the ground, 22 yards long, where almost everything that decides a match happens.',
    explanation: `A rectangular strip of closely-mown, rolled earth in the centre of the field. It is **22 yards** (20.12 m) from stump to stump and **10 feet** (3.05 m) wide.

Everything happens on it or from it: the bowler delivers from one end, the ball pitches on it, the batters run its length to score.

Unlike the playing surfaces of most sports, the pitch is **not standardised in behaviour**. It is living soil and grass, prepared differently at every ground, and it changes over the course of a match. Two Test pitches can produce completely different games, and neither is wrong.`,
    howItWorks: `The markings are what the Laws care about.

- **The bowling crease** is the line the stumps stand on, 8 feet 8 inches long.
- **The popping crease** is drawn 4 feet in front of it, across the pitch. This is the line that matters most: the bowler's front foot must land behind it, and a batter is in their ground if any part of bat or body is behind it.
- **The return creases** run back from the ends of the popping crease at right angles, marking how wide the bowler's back foot may land.

Both ends have an identical set, since bowling alternates between them.`,
    whyItMatters: `The pitch is the largest single variable in cricket. Whether it is grassy and damp, hard and cracked, or dry and dusty determines whether the ball seams, bounces, spins or does nothing, and therefore what a good score is, who wins the toss's advantage, and which bowlers matter.

It also changes **during** the match, which is what makes multi-day cricket a different sport from a one-day game: batting last on a pitch that has been played on for four days is a materially harder job than batting first on it.`,
    misunderstandings: `**"The pitch is the whole ground."** The ground is the whole field; the pitch is the 22-yard strip. Confusingly, "wicket" is also used for the pitch.

**"Pitches are the same everywhere."** They are the least standardised surface in major sport, deliberately.`,
    related: [
      'crease',
      'cricket-field-positions',
      'pitch-preparation',
      'pitch-deterioration',
      'bounce',
      'spin-friendly-pitch',
      'spikes',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 6, 7 (The pitch; The creases)' }],
    order: 70,
  }),

  definition({
    slug: 'crease',
    title: 'Crease',
    category: 'match-basics',
    alsoIn: ['laws-and-rules'],
    summary:
      'The white lines at each end of the pitch that define where the bowler may land and where a batter is safe.',
    explanation: `Four lines, marked at both ends of the pitch, and they do two separate jobs.

**For the bowler**, the creases define a legal delivery. Some part of the front foot must land behind the **popping crease**, and the back foot must land inside the **return crease**. Breaching either is a no-ball.

**For the batter**, the popping crease defines their **ground**. A batter with any part of the bat in hand or of their body grounded behind that line is safe from being run out or stumped. Step or slide beyond it and the wicket may be put down.

The lines themselves count as part of the area behind them for the bowler's front foot, but for the batter the requirement is to be grounded **behind** the line. Those two treatments differ, which is exactly the sort of detail that decides a review.`,
    whyItMatters: `Nearly every marginal decision in cricket comes down to a crease: a front-foot no-ball measured in centimetres, a run out where a bat is in the air rather than grounded, a stumping where a heel is on the line rather than behind it.`,
    related: ['crease-rules', 'batters-ground', 'no-ball', 'run-out', 'stumped', 'cricket-pitch'],
    sourceKeys: [{ ...MCC, locator: 'Law 7 (The creases)' }],
    order: 80,
  }),

  definition({
    slug: 'innings',
    title: 'Innings',
    category: 'match-basics',
    alsoIn: ['match-structure'],
    summary:
      'One team’s turn with the bat, or one batter’s stay at the crease. The word is both singular and plural.',
    explanation: `Two uses, both standard.

**A team innings** is one side's turn batting. It ends when ten wickets fall, when the allotted overs run out, when the captain declares, or when time expires.

**A batter's innings** is their own stay at the crease, from arriving to being dismissed or the innings ending.

The word is **"innings" in both singular and plural**. One innings, two innings. There is no such thing as "an inning" in cricket, which is the most common giveaway that a writer has come from baseball.

How many innings a match has is the defining difference between formats: two per side in Test and first-class cricket, one per side in limited-overs cricket.`,
    example: `"India's first innings of 416 included a fine innings of 132 from their opener."

The first is the team's turn, the second is the batter's stay.`,
    related: [
      'first-innings',
      'second-innings',
      'declaration',
      'follow-on',
      'test-cricket',
      'limited-overs-cricket',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 13 (Innings)' }],
    order: 90,
  }),

  definition({
    slug: 'delivery',
    title: 'Delivery',
    category: 'match-basics',
    aliases: ['Ball'],
    summary: 'One ball bowled at the striker: the smallest unit of a cricket match.',
    explanation: `Everything in cricket is built out of deliveries. Six legal ones make an **over**; 120 make a T20 innings; 300 make an ODI innings.

A delivery is **legal** if it complies with the Laws governing how the ball may be bowled. If it does not, it is a **no-ball** or a **wide**, the batting side receives a penalty run, and the ball is re-bowled: it does not count towards the six.

Each delivery is a self-contained contest. The bowler chooses a line, a length and a variation; the batter decides whether to attack, defend or leave it. Both are also playing a longer game across the over and the spell, which is where the tactics live.`,
    whyItMatters: `Because deliveries are the unit, they are the right thing to count. Balls faced, balls bowled, dot balls and strike rates are all delivery counts, and converting overs to balls before doing arithmetic is the only safe way to compute any of them.`,
    misunderstandings: `**"Every delivery counts towards the over."** Wides and no-balls do not.

**"A delivery must reach the batter."** It need not. A ball that stops short is a no-ball, and a ball can be left alone entirely and still count.`,
    related: ['over', 'legal-delivery', 'no-ball', 'wide', 'dot-ball', 'balls-faced'],
    sourceKeys: [{ ...MCC, locator: 'Laws 17, 21, 22' }],
    order: 100,
  }),

  definition({
    slug: 'runs',
    title: 'Runs',
    category: 'match-basics',
    alsoIn: ['statistics-and-analytics'],
    summary: 'The unit of scoring. The side with more of them at the end of the match wins.',
    explanation: `A run is what its name says: the batters running the 22 yards between the wickets. Each completed exchange of ends is one run.

Runs also come without running. A ball reaching the boundary is worth **four**; clearing it without bouncing is **six**. Penalties against the fielding side, **extras**, add runs to the team without the batter having scored them.

Runs come in two accounting buckets, and the distinction runs through every cricket statistic:

- **Runs off the bat** are credited to the batter and charged to the bowler.
- **Extras** are credited to the team only. Wides and no-balls are still charged to the bowler; byes and leg byes are charged to nobody.`,
    whyItMatters: `Runs are the currency, but they are not free: they are bought with **deliveries** in limited-overs cricket and with **wickets** in Test cricket. Nearly every cricket statistic is a ratio of runs to one of those two resources, which is why the same run total means different things in different formats.`,
    related: [
      'how-runs-are-scored',
      'four',
      'six',
      'extras',
      'boundary',
      'run-rate',
      'batting-average',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 18, 19 (Scoring runs; Boundaries)' }],
    order: 110,
  }),

  definition({
    slug: 'boundary',
    title: 'Boundary',
    category: 'match-basics',
    alsoIn: ['laws-and-rules'],
    summary:
      'The edge of the playing area, and the shot that reaches it: four runs along the ground, six through the air.',
    explanation: `The boundary is the marked perimeter of the field, usually a rope. It is also shorthand for a shot that reaches it.

- **Four** if the ball touches the ground inside the field before reaching or crossing the boundary.
- **Six** if it clears the boundary without touching the ground inside it.

Boundaries are awarded automatically: the batters stop running and the runs are credited regardless of how many they had completed.

Boundary sizes are **not standardised**. Grounds differ, and the same ground can move its rope between matches within limits set by playing conditions, which is why "a big ground" is a real tactical factor rather than a figure of speech.`,
    whyItMatters: `Boundaries are the most efficient way to score, so limiting them is the main job of a fielding plan in limited-overs cricket. Fielding restrictions exist precisely to control how well a side can protect the boundary.`,
    misunderstandings: `**"Six means it went further."** It means it did not bounce first. A flat hit that pitches just inside the rope and rolls fifty metres beyond it is four.

**"A fielder catching it over the rope is out."** A fielder must not be grounded outside the boundary when in contact with the ball, which is what makes boundary catches so intricate.`,
    related: ['four', 'six', 'boundary-rules', 'boundary-fielding', 'boundary-count', 'outfield'],
    sourceKeys: [{ ...MCC, locator: 'Law 19 (Boundaries)' }],
    order: 120,
  }),

  definition({
    slug: 'four',
    title: 'Four',
    category: 'match-basics',
    summary:
      'Four runs, awarded when the ball reaches the boundary having touched the ground first.',
    explanation: `The commonest boundary. The ball is hit along the ground or bounces inside the field, then reaches or crosses the rope.

Four runs are added and the batters stop. The umpire signals it by waving an arm horizontally across the body.

A four is credited to the batter if it came off the bat. It can also be an **extra**: four byes if the ball beats the keeper and runs away, or four wides if a wide reaches the rope, in which case it is worth five in total including the wide penalty.`,
    whyItMatters: `Four runs from one delivery is roughly two-thirds of a good over's worth of runs in a Test and half of it in a T20. A batter's **boundary percentage**, the share of their runs coming in fours and sixes, is a useful signal of how they score.`,
    related: ['boundary', 'six', 'runs', 'boundary-count', 'boundary-percentage'],
    sourceKeys: [{ ...MCC, locator: 'Law 19 (Boundaries)' }],
    order: 130,
  }),

  definition({
    slug: 'six',
    title: 'Six',
    category: 'match-basics',
    summary:
      'Six runs, awarded when the ball clears the boundary without touching the ground inside the field.',
    explanation: `The maximum from one legal delivery in normal play. The ball is hit over the boundary without bouncing, and six runs are added.

The umpire signals it by raising both arms above the head.

A ball that hits the ground inside the rope first is four, however far it travels afterwards. A ball caught by a fielder who is, or becomes, grounded outside the boundary is six.`,
    whyItMatters: `Sixes are the defining currency of T20 cricket. A side hitting ten sixes has scored sixty runs from ten deliveries, which is arithmetic no amount of accumulation can match, and it is why death-overs specialists and short boundaries matter so much to a white-ball total.`,
    misunderstandings: `**"You can score more than six off one ball."** Off a legal delivery in normal play, six is the maximum from the hit. Larger totals from one ball require extras, overthrows or penalty runs.

**"A six has to be hit straight."** Any direction counts.`,
    related: ['boundary', 'four', 'runs', 'slog-sweep', 'death-overs-batting', 'cow-corner'],
    sourceKeys: [{ ...MCC, locator: 'Law 19 (Boundaries)' }],
    order: 140,
  }),

  definition({
    slug: 'dismissal',
    title: 'Dismissal',
    category: 'match-basics',
    alsoIn: ['dismissals'],
    aliases: ['Out', 'Wicket Taken'],
    summary: 'A batter being out. Ten of them ends an innings.',
    explanation: `When a batter is dismissed, their innings is over and they leave the field. The next batter in the order replaces them.

Ten dismissals end the team's innings, not eleven: the last remaining batter has no partner to bat with.

There are ten ways to be dismissed under the Laws, but five, **caught**, **bowled**, **LBW**, **run out** and **stumped**, account for roughly 98 per cent of all dismissals in practice.

A dismissal is recorded against the batter and, where a bowler caused it, credited to the bowler. Run outs are credited to the fielders involved rather than to a bowler, which is why a bowling analysis and the fall of wickets do not always agree.`,
    whyItMatters: `Wickets are the other scarce resource alongside deliveries. In Test cricket they are the scarcer of the two, which is why a Test batter's job is to not get out and a T20 batter's job frequently is not.`,
    related: [
      'wickets-and-dismissals',
      'bowled',
      'caught',
      'lbw',
      'run-out',
      'stumped',
      'wickets-lost',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 32-40' }],
    order: 150,
  }),

  definition({
    slug: 'partnership',
    title: 'Partnership',
    category: 'match-basics',
    alsoIn: ['scoring-and-scorecards'],
    summary: 'The runs two batters add together while batting at the same time.',
    explanation: `Batters always bat in pairs, so every run is scored during a partnership. A partnership begins when a new batter arrives and ends when either batter is dismissed.

Partnerships are numbered by wicket: the **first-wicket partnership** is between the two openers, the **second-wicket partnership** starts when the first wicket falls, and so on to the tenth.

A scorecard's **fall of wickets** line encodes every partnership in the innings. From "1-24, 2-31, 3-180" you can read that the third-wicket partnership was worth 149.`,
    whyItMatters: `Partnerships are how cricket measures resistance. Individual scores tell you who batted well; partnerships tell you when a side was in control. A collapse is not a run of low individual scores so much as a run of tiny partnerships.

They also carry the tactical structure of an innings: a rebuilding partnership after two early wickets and a late-order partnership adding quick runs are different jobs.`,
    related: [
      'fall-of-wickets',
      'batting-order',
      'batting-scorecard',
      'strike-rotation',
      'building-an-innings',
    ],
    order: 160,
  }),

  definition({
    slug: 'batting-order',
    title: 'Batting Order',
    category: 'match-basics',
    alsoIn: ['batting-roles'],
    summary:
      'The sequence in which a team’s eleven players bat, from openers at one to the last of the tail at eleven.',
    explanation: `The batting side nominates the order in which its players bat. Numbers 1 and 2 are the **openers**, who face the new ball. Numbers 3 to 5 or so are the **top and middle order**, usually the side's best batters. The **lower order** follows, and numbers 9 to 11 are the **tail**, typically specialist bowlers.

The order is not fixed by any Law and can be changed at any time. A captain may promote a left-hander to break up a spinner's rhythm, hold a batter back, or send a **nightwatchman** in late in the day.

A batter who is unavailable can be skipped, and a batter forced to retire hurt can return later in the innings.`,
    whyItMatters: `Position in the order is most of what defines a batting role. Facing the new ball, arriving at 180 for 2 with fifteen overs left, and arriving at 240 for 8 with two overs left are three different jobs, and a batter's statistics cannot be read without knowing which they usually do.`,
    misunderstandings: `**"The best batter bats first."** The best batter usually bats three or four. Opening is a specialist job with its own risks.

**"The order is fixed for the match."** It can change between innings and mid-innings.`,
    related: [
      'opener',
      'top-order-batter',
      'middle-order-batter',
      'tailender',
      'nightwatchman',
      'pinch-hitter',
      'partnership',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 25 (Batter’s innings)' }],
    order: 170,
  }),

  definition({
    slug: 'striker',
    title: 'Striker',
    category: 'match-basics',
    summary: 'The batter currently facing the bowling.',
    explanation: `Of the two batters on the field, the striker is the one at the end the bowler is bowling to. They face the delivery; their partner, the **non-striker**, waits at the bowler's end.

The strike changes in two ways:

- **By running an odd number of runs.** One or three, and the batters have swapped ends, so the other one is now on strike. Two or four, and the same batter faces again.
- **At the end of an over.** The bowling switches to the other end, so whoever is standing there becomes the striker without having moved.

That second rule is why a batter who takes a single off the fifth ball of an over ends up facing the first ball of the next one.`,
    whyItMatters: `Which batter is on strike is a live tactical question. A set batter wants the strike; a new batter facing a hostile spell may not. Deliberately manipulating it is **strike farming**, and it is a core skill for a batter protecting a weaker partner.`,
    related: ['non-striker', 'ends', 'strike-rotation', 'strike-farming', 'over'],
    sourceKeys: [{ ...MCC, locator: 'Law 12 (Start of play; Ends)' }],
    order: 180,
  }),

  definition({
    slug: 'non-striker',
    title: 'Non-striker',
    category: 'match-basics',
    summary:
      'The batter at the bowler’s end, who is not facing the delivery but must be ready to run.',
    explanation: `The non-striker stands beside the stumps at the bowler's end, backing up: taking a step or two down the pitch as the ball is released so they can start a run quickly.

Two Laws matter to them specifically.

**They must not leave their ground too early.** If the non-striker is out of their ground before the ball would normally be released, the bowler may run them out. That is a legitimate run out under Law 38, commonly called a "Mankad" although the Laws do not use the term.

**They can be run out like anyone else** once a run is attempted, and being the non-striker offers no protection.`,
    whyItMatters: `Running between the wickets is a two-person job and most run outs are a failure of communication rather than of speed. The non-striker has the better view of the ball for many shots, so the convention is that the non-striker calls for runs hit behind the striker.`,
    related: [
      'striker',
      'run-out-non-strikers-end',
      'running-between-wickets',
      'backing-up-fielding',
      'ends',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 38 (Run out)' }],
    order: 190,
  }),

  definition({
    slug: 'ends',
    title: 'Ends and Changing Ends',
    category: 'match-basics',
    aliases: ['End', 'Changing Ends'],
    summary: 'The pitch has two ends, and the bowling alternates between them every over.',
    explanation: `Each end of the pitch has its own set of stumps and its own name at most grounds, usually after a stand or a landmark: the Pavilion End, the Nursery End.

Bowling **alternates** between them. One over is bowled from one end, the next from the other. That has three consequences worth holding on to:

- **The fielders walk across** between overs, and the whole field mirrors.
- **The striker changes** at the end of each over without anybody running, because the batter standing at the new bowling end is now facing.
- **No bowler bowls consecutive overs**, since they would have to bowl from both ends at once.

Ends are not interchangeable in practice. Slope, wind, the angle of the sun and even which end the ground's roughest patch is at all make one end better for a particular bowler, and captains choose accordingly.`,
    whyItMatters: `A bowler who is ineffective from one end can be transformed from the other, especially where there is a slope or a crosswind, and picking ends is a real part of captaincy.`,
    related: ['over', 'striker', 'bowling-changes', 'bowling-spell'],
    sourceKeys: [{ ...MCC, locator: 'Law 17 (The over)' }],
    order: 200,
  }),

  concept({
    slug: 'batting-vs-bowling',
    title: 'Batting vs Bowling',
    category: 'match-basics',
    summary:
      'The contest at the centre of cricket, and what each side is actually trying to do to the other.',
    explanation: `Every ball is a negotiation about **risk**.

The bowler wants either a wicket or a dot ball. The batter wants either runs or, sometimes, simply to survive. Neither can have everything: a bowler attacking the stumps concedes scoring options, and a batter trying to score has to play at balls they could have left.

What makes cricket unusual is that the same contest has a completely different balance depending on which resource is scarce.

**In Test cricket, wickets are scarce.** A batter can leave twenty balls in a row at no cost. The bowler's job is to make something happen; the batter's job is often to make sure nothing does.

**In T20, deliveries are scarce.** A batter who leaves twenty balls has wasted a sixth of their innings. Now the bowler can win by doing nothing at all, and the pressure inverts.`,
    howItWorks: `The bowler's levers: **pace**, **line**, **length**, **movement** (in the air or off the pitch), and **variation**. Behind those sits the field, which decides which of the batter's scoring options are cheap and which are expensive.

The batter's levers: **shot selection**, **footwork** to change where the ball is met, **use of the crease** to change the effective length, and **strike rotation** to face the bowler they want to face.

Both are also managing a longer arc. A bowler may spend three balls setting a batter up for a fourth. A batter may accept forty balls of discomfort to be set when the spinner comes on.`,
    whyItMatters: `Understanding which side the pressure is on explains almost everything that looks strange about cricket to a newcomer: why a batter blocks a full over in a Test, why a bowler bowls a wide yorker rather than at the stumps in a T20, why a captain sets a field that concedes singles.`,
    formatDifferences: `The same delivery can be good or bad depending only on format. A maiden over is an excellent outcome in a T20 and unremarkable in a Test. A batter scoring at 45 per 100 balls is doing their job in a Test and losing the match in a T20.`,
    takeaways: `- Every ball is a trade between risk and reward for both sides.
- Test cricket makes wickets scarce; T20 makes deliveries scarce.
- The field decides which scoring options are cheap.
- Neither side's tactics can be judged without knowing the format and the situation.`,
    related: [
      'batter',
      'bowler',
      'batting-tempo',
      'building-pressure',
      'field-setting',
      'test-vs-odi-vs-t20',
    ],
    order: 210,
  }),

  concept({
    slug: 'basic-cricket-terminology',
    title: 'Basic Cricket Terminology',
    category: 'match-basics',
    alsoIn: ['terminology'],
    summary: 'The forty or so words you need before a cricket commentary makes sense.',
    explanation: `Cricket's vocabulary is the main barrier to watching it. Almost none of it is technical in a difficult way; there is simply a lot of it, and commentators assume all of it.

Here is the working set, grouped by what you would be looking at when you heard it.`,
    howItWorks: `**The setting**

- **Pitch**: the 22-yard strip in the middle. Also called the **wicket**, confusingly.
- **Wicket**: the stumps, or the pitch, or a dismissal. Context decides.
- **Crease**: the white lines marking where the bowler may land and where the batter is safe.
- **Ends**: the two ends of the pitch. Bowling alternates between them.

**The people**

- **Striker** / **non-striker**: the batter facing, and their partner.
- **Wicketkeeper** or **keeper**: the fielder behind the stumps.
- **Slip**, **gully**, **point**, **cover**, **mid-off**, **mid-on**, **midwicket**, **square leg**, **third man**, **fine leg**: named fielding regions.

**The bowling**

- **Over**: six legal balls from one end.
- **Line** and **length**: where the ball is aimed sideways, and how far down the pitch it lands.
- **Full**, **short**, **good length**: too far up, too far back, and the awkward band in between.
- **Seam** and **swing**: deviation off the pitch, and movement through the air. Not the same thing.
- **Spin**: revolutions on the ball, making it deviate off the pitch.
- **Yorker**, **bouncer**, **googly**, **doosra**: specific deliveries.
- **Maiden**: an over conceding no runs.

**The scoring**

- **Four**, **six**: boundaries, bouncing and not bouncing.
- **Dot ball**: a delivery off which no run is scored.
- **Extras**: runs not credited to a batter, including **wides**, **no-balls**, **byes** and **leg byes**.
- **Run rate**: runs per over.
- **Duck**: a batter dismissed for nought.
- **Fifty**, **hundred** or **century**: milestone scores.
- **Five-for**: five wickets in an innings for one bowler.

**The match**

- **Innings**: one side's turn batting, or one batter's stay. Never "inning".
- **Declaration**: a captain ending their own innings early.
- **Follow-on**: making the opposition bat again immediately.
- **Draw**: an unfinished match. Not the same as a **tie**, which is level scores.
- **Powerplay**: the overs with fielding restrictions in limited-overs cricket.
- **DRS**: the review system, where it is in use.`,
    whyItMatters: `A commentary is unintelligible until roughly this list is familiar, and completely clear shortly afterwards. Most of the difficulty people report with cricket is vocabulary rather than complexity.`,
    takeaways: `- "Wicket" has three meanings; context always disambiguates.
- Seam and swing are different phenomena, and so are draws and ties.
- Extras go to the team, not the batter.
- Everything else is a name for a place, a ball or a number.`,
    related: [
      'wicket',
      'over',
      'extras',
      'cricket-field-positions',
      'draw',
      'tie',
      'duck',
      'nelson',
    ],
    order: 220,
  }),

  // ── Laws & Rules ──────────────────────────────────────────────────────────
  law({
    slug: 'legal-delivery',
    title: 'Legal Delivery',
    category: 'laws-and-rules',
    difficulty: 'beginner',
    summary:
      'A ball bowled in compliance with the Laws: it counts towards the over, and any dismissal from it stands.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `A delivery is legal when it breaches neither **Law 21 (No ball)** nor **Law 22 (Wide ball)**.

In practice that means all of the following hold.

- The bowler's **front foot** lands with some part behind the popping crease, and the **back foot** lands inside the return crease.
- The ball is **bowled, not thrown**: the elbow does not straighten beyond the permitted tolerance during the delivery swing.
- It does not bounce more than once, roll along the ground, or come to rest before reaching the striker.
- It does not pass the striker above waist height without bouncing.
- It is not bowled underarm, unless agreed beforehand.
- It is within reach for the striker to play a normal cricket stroke, and so is not a wide.
- No fielding offence under Laws 27 or 28 accompanies it.`,
    inPractice: `Only legal deliveries count towards the six balls of an over. A no-ball or a wide adds a penalty run and is re-bowled, which is why an over can take eight or nine deliveries.

The distinction also governs dismissals. From a **no-ball** the striker cannot be bowled, caught, LBW, stumped or hit wicket, though a run out remains possible. From a **wide** the striker cannot be bowled, caught or LBW, but can be stumped or run out.`,
    misunderstandings: `**"A legal delivery has to be hittable."** It has to be within reach for a normal stroke, which is a much lower bar than hittable.

**"Any ball that beats the batter is a wide."** A ball that beats the batter within their reach is simply a good ball.`,
    takeaways: `- Legality is defined negatively: not a no-ball and not a wide.
- Only legal deliveries count towards the over.
- Which dismissals survive an illegal delivery depends on which kind it was.`,
    related: ['no-ball', 'wide', 'over', 'delivery', 'bowling-action'],
    sourceKeys: [{ ...MCC, locator: 'Laws 21, 22' }],
    order: 10,
  }),

  law({
    slug: 'wide',
    title: 'Wide',
    category: 'laws-and-rules',
    alsoIn: ['scoring-and-scorecards'],
    difficulty: 'beginner',
    summary:
      'A delivery out of the batter’s reach: one penalty run, re-bowled, and judged far more strictly in limited-overs cricket.',
    sourceRevision: `${MCC_CODE}; limited-overs interpretation from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 22**, the umpire calls a wide if the ball passes wide of, or over, the striker such that it is **not sufficiently within reach for them to be able to hit it with the bat by means of a normal cricket stroke**.

The judgement is made from where the striker actually stands **and** from a normal guard position, so a batter cannot manufacture a wide by walking across the crease before the ball is bowled.

The consequences:

- **One penalty run** to the batting side, recorded as an extra and charged to the bowler.
- **The ball does not count** towards the over and is re-bowled.
- **If a wide reaches the boundary**, it is scored as four wides plus the penalty, so five in total.`,
    inPractice: `The striker can still be **stumped** or **run out** off a wide, and byes can be run from one. They cannot be bowled, caught or LBW, since a wide by definition was not within reach of a normal stroke.

A ball passing over the striker's head without bouncing is generally called a wide rather than a no-ball; a ball passing above waist height **without bouncing** is a no-ball. That boundary between the two calls is a common source of confusion.`,
    edgeCasesHeading: 'How limited-overs cricket changes it',
    edgeCases: `This is a Law whose practical interpretation differs sharply by competition, and the difference is large enough to change how bowlers operate.

Under ICC limited-overs playing conditions, wides are judged much more strictly than the Law's bare wording implies. Marked **wide guidelines** on the pitch are used for off-side wides, and any delivery passing down the leg side of the striker is typically called a wide almost automatically.

In Test cricket, by contrast, a leg-side delivery the batter chose not to chase is frequently not a wide at all.

So "was that a wide?" genuinely has different answers in a Test and a T20, and neither umpire is wrong. Anything specific written about wide interpretation belongs to a competition and a season.`,
    misunderstandings: `**"Any ball the batter cannot reach is a wide."** In Test cricket the standard is reach by a normal stroke, judged generously to the bowler compared with white-ball practice.

**"You cannot be out off a wide."** Stumped and run out both remain available.

**"A wide is always one run."** One, unless it reaches the boundary, when it is five.`,
    takeaways: `- Law 22: out of reach of a normal stroke, judged from the actual and normal guard positions.
- One run, re-bowled, charged to the bowler.
- Stumped and run out remain possible.
- Limited-overs playing conditions apply the Law far more strictly.`,
    related: ['no-ball', 'legal-delivery', 'extras', 'stumped', 'wide-yorker', 'over'],
    sourceKeys: [
      { ...MCC, locator: 'Law 22 (Wide ball)' },
      { key: 'icc-playing-conditions', locator: 'Wide interpretation' },
    ],
    order: 30,
  }),

  law({
    slug: 'dead-ball',
    title: 'Dead Ball',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'The state in which the ball is out of play: nothing can be scored and nobody can be dismissed.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `**Law 20** governs when the ball is dead. It becomes dead automatically when, among other things:

- it is finally settled in the hands of the wicketkeeper or the bowler;
- a boundary is scored;
- a batter is dismissed;
- the ball becomes lodged in a batter's clothing or equipment;
- the umpire calls over or time.

An umpire may also **call and signal dead ball** in a range of circumstances, including when a batter is not ready and makes no attempt to play the ball, when a serious injury occurs, or when either side is unfairly disadvantaged by something outside the game.

While the ball is dead, no runs may be scored and no dismissal can occur.`,
    inPractice: `Most dead-ball calls pass unremarked: the keeper takes the ball, the fielders relax, the bowler walks back. The ones spectators notice are the interventions.

A common one is the bowler aborting their delivery, for instance if the batter moves as they are about to release. The umpire calls dead ball, the delivery does not count, and nothing that happened counts either.

Another is the non-striker run-out attempt made too late: once the bowler has passed the point at which the ball would normally have been released, breaking the wicket produces a dead-ball call rather than a dismissal.`,
    misunderstandings: `**"Dead ball means the delivery is re-bowled."** Sometimes, but not always. A ball that becomes dead after being played out is simply finished.

**"The umpire can call dead ball for anything."** The grounds are enumerated in the Law, though several are matters of umpire judgement.`,
    takeaways: `- The ball is dead when it is out of play; nothing can happen while it is.
- Some causes are automatic, others are an umpire's call.
- Whether the delivery counts depends on why it went dead.`,
    related: ['legal-delivery', 'over', 'run-out-non-strikers-end', 'appeals', 'penalty-runs'],
    sourceKeys: [{ ...MCC, locator: 'Law 20 (Dead ball)' }],
    order: 40,
  }),

  law({
    slug: 'bye',
    title: 'Bye',
    category: 'laws-and-rules',
    alsoIn: ['scoring-and-scorecards'],
    difficulty: 'beginner',
    summary:
      'Runs scored when the ball passes the batter untouched and beats the wicketkeeper: credited to the team, charged to nobody.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 23**, if a legal delivery passes the striker without touching bat or person, and the batters run, those runs are scored as **byes**. If the ball runs away to the boundary, four byes are scored.

Byes are **extras**: they count to the team total but not to any batter's score. Crucially, they are **not charged to the bowler** either, because the bowler bowled a legal delivery and the runs came from the ball beating the keeper.`,
    inPractice: `Byes are usually a wicketkeeping story rather than a bowling one: a ball that bounces awkwardly, turns sharply, or is simply misjudged. A keeper standing up to spin on a rough pitch will concede more byes than one standing back to pace.

Because they are charged to nobody, a bowler's economy rate is unaffected by byes. This is why a bowling analysis and the team total do not reconcile without accounting for extras separately.`,
    misunderstandings: `**"A bye is any run that isn't off the bat."** A bye specifically requires the ball to have touched neither bat nor body. If it hit the body, it is a **leg bye**.

**"Byes count against the bowler."** They do not. Wides and no-balls do.

**"Byes spoil a maiden over."** They do not, precisely because they are not charged to the bowler.`,
    takeaways: `- Ball passes untouched, batters run: byes.
- An extra, credited to the team, charged to nobody.
- Does not affect the bowler's figures or a maiden over.`,
    related: ['leg-bye', 'extras', 'maiden-over', 'wicketkeeping', 'economy-rate'],
    sourceKeys: [{ ...MCC, locator: 'Law 23 (Byes and Leg byes)' }],
    order: 50,
  }),

  law({
    slug: 'leg-bye',
    title: 'Leg Bye',
    category: 'laws-and-rules',
    alsoIn: ['scoring-and-scorecards'],
    difficulty: 'intermediate',
    summary:
      'Runs taken after the ball hits the batter’s body rather than the bat, and only if they were playing a stroke or avoiding injury.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 23**, if a legal delivery strikes the striker's **person** rather than the bat, runs may be scored as **leg byes**, but only if the striker either:

- attempted to play the ball with the bat, or
- tried to avoid being hit.

If the striker did neither, no leg byes are allowed. The umpire calls and signals dead ball once it is clear no runs will be permitted, and any runs the batters have completed are disallowed.

Leg byes are **extras**: credited to the team, not to the batter, and not charged to the bowler.`,
    inPractice: `The condition is what stops a batter using their pads as a scoring shot. Deliberately padding a ball away into a gap and running is not a source of runs, which is why you see umpires signalling dead ball and waving the batters back.

Leg byes come up constantly with the ball deflecting off a pad to fine leg or square leg for a single, and they are one of the ways a scorecard's extras column reaches double figures without any obvious bowling errors.`,
    misunderstandings: `**"Any deflection off the pad gives leg byes."** Only if a stroke was attempted or the batter was avoiding injury.

**"Leg byes are credited to the batter."** They are not, which is why a batter's score plus the extras must be checked separately against the team total.

**"They count against the bowler."** They do not.`,
    takeaways: `- Ball hits the body, batters run: leg byes, conditionally.
- Requires an attempted stroke or an attempt to avoid the ball.
- An extra, charged to nobody.`,
    related: ['bye', 'extras', 'lbw', 'leaving-the-ball', 'dead-ball'],
    sourceKeys: [{ ...MCC, locator: 'Law 23 (Byes and Leg byes)' }],
    order: 60,
  }),

  law({
    slug: 'penalty-runs',
    title: 'Penalty Runs',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary: 'Runs awarded to a side as a sanction against the other, most often five at a time.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Several Laws award **penalty runs**, usually five, in addition to any runs scored. The main grounds include:

- **the ball striking a fielder's helmet** placed on the ground behind the keeper (5 penalty runs to the batting side);
- **illegal fielding**, such as a fielder wilfully deflecting or stopping the ball with anything other than their person (5 to the batting side);
- **damaging the pitch**, **time-wasting** and various offences under the unfair play Laws, which can award 5 penalty runs to the opposing side;
- **serious misconduct** under Law 42, which carries a graduated set of sanctions, including 5 penalty runs and the removal of a player from the field for the most serious level.

Penalty runs are recorded as extras and are credited to the team, never to a batter.`,
    inPractice: `The one spectators meet most often is the helmet: a fielder's spare helmet left on the ground behind the wicketkeeper, struck by the ball, gives the batting side five runs. This is why helmets are placed carefully and why a wayward throw hitting one draws a groan from the fielding side.

The unfair-play penalties are rarer and usually accompany a warning first, since most of those Laws are structured as escalating sanctions rather than immediate penalties.`,
    misunderstandings: `**"Penalty runs are always five."** Five is the usual figure, but the no-ball and wide penalties are one run each, and they are also penalties.

**"Penalty runs go to the batter on strike."** They go to the team as extras.`,
    takeaways: `- Usually five runs, awarded as a sanction, recorded as extras.
- Common causes: the helmet on the ground, illegal fielding, unfair play.
- Never credited to a batter.`,
    related: ['extras', 'no-ball', 'wide', 'substitute-fielder', 'helmet'],
    sourceKeys: [{ ...MCC, locator: 'Laws 28, 41, 42' }],
    order: 70,
  }),

  law({
    slug: 'boundary-rules',
    title: 'Boundary Rules',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'What counts as a boundary, and the rules governing a fielder in contact with the ball near the rope.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 19**, the boundary of the field is marked before the match, usually by a rope. A boundary is scored when the ball:

- touches or crosses the boundary, or
- is grounded beyond it, or
- touches a fielder or their equipment while that fielder is **grounded beyond the boundary**.

The award is **six** if the ball has not touched the ground inside the field since being struck, and **four** otherwise.

The fielder rule is the intricate part. A fielder in contact with the ball must not be grounded beyond the boundary, and the Law addresses airborne fielders specifically: a fielder's **first contact** with the ball must occur when their last contact with the ground before that was inside the boundary.`,
    inPractice: `This is what produces the modern boundary-catch spectacle: a fielder leaping from inside the rope, palming the ball up while airborne over the boundary, landing outside, and coming back to complete the catch, or relaying it to a teammate.

Every one of those catches is decided by exactly the clauses above, which is why the third umpire looks at the fielder's feet before looking at the ball.`,
    edgeCasesHeading: 'Overthrows and obstacles',
    edgeCases: `**Overthrows.** If the ball reaches the boundary from a fielder's throw, the batting side receives the boundary allowance **plus** the runs already completed, which is how a single can become five.

**Obstacles inside the boundary.** Where a sightscreen or similar object stands inside the marked boundary, the playing conditions specify how it is treated, and this varies by ground.`,
    misunderstandings: `**"The rope is the boundary everywhere."** The boundary is what was agreed before the match; usually a rope, sometimes a marked line or a fence.

**"A fielder touching the rope is out of play."** What matters is being grounded beyond the boundary while in contact with the ball, and the airborne rules are specific.`,
    takeaways: `- Law 19 defines the boundary and its award: six if it did not bounce, four if it did.
- A fielder in contact with the ball must not be grounded beyond the boundary.
- Airborne fielders are governed by where they last touched the ground.
- Overthrows add the boundary to runs already completed.`,
    related: ['boundary', 'four', 'six', 'boundary-fielding', 'outfield'],
    sourceKeys: [{ ...MCC, locator: 'Law 19 (Boundaries)' }],
    order: 80,
  }),

  law({
    slug: 'appeals',
    title: 'Appeals',
    category: 'laws-and-rules',
    alsoIn: ['officials-and-technology'],
    difficulty: 'beginner',
    summary:
      'The fielding side asking the umpire whether the batter is out. Without it, in most cases, there is no dismissal.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 31**, an umpire **shall not give a batter out unless appealed to by the fielding side**. The appeal is the "Howzat?", conventionally made before the bowler begins their run-up for the next delivery.

The Law also allows the umpire to answer an appeal even after "over" has been called, provided the players have not left the field.

A fielding captain may **withdraw an appeal** with the umpire's consent, and a batter already given out may then resume their innings. This is rare and is usually a sportsmanship gesture.`,
    inPractice: `The requirement matters more for some dismissals than others.

Where a dismissal is **obvious**, a batter plainly bowled or caught, the appeal is a formality and often not made at all; nobody expects an umpire to keep a batter in because nobody shouted.

Where a dismissal is **a matter of judgement**, above all LBW, the appeal is doing real work. An umpire will not raise a finger for an LBW nobody asked about, however plainly out the batter looks. This is why fielding sides appeal for LBWs they know are marginal: an unasked question cannot be answered.`,
    misunderstandings: `**"Appealing is bad sportsmanship."** It is the mechanism the Laws specify. Excessive or dishonest appealing is the thing the Spirit of Cricket preamble addresses, not appealing itself.

**"The umpire gives batters out when they see it."** Not without an appeal, in principle, and never for a judged dismissal in practice.`,
    takeaways: `- Law 31: no dismissal without an appeal from the fielding side.
- Decisive for judged dismissals such as LBW; a formality for obvious ones.
- An appeal can be withdrawn with the umpire's consent.`,
    related: ['lbw', 'wickets-and-dismissals', 'on-field-umpire', 'drs', 'dismissal', 'sledging'],
    sourceKeys: [{ ...MCC, locator: 'Law 31 (Appeals)' }],
    order: 90,
  }),

  law({
    slug: 'batters-ground',
    title: "Batter's Ground",
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'The area behind the popping crease where a batter is safe, and the rule that decides every run out and stumping.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 30**, a batter is **in their ground** if some part of their **person or bat in hand** is **grounded behind the popping crease** at that end.

If no part of them is so grounded, they are **out of their ground**, and the fielding side may dismiss them by putting the wicket down: run out, or stumped.

The Law also provides that if both batters are in the same ground, the one who arrived there first is protected and the other is at risk, which is what resolves a mix-up where two batters end up at the same end.

An important provision covers the batter who has been in their ground and is then **airborne** while running or diving: having once been grounded behind the crease, a batter running or diving towards that end is treated as in their ground even if they lose contact with the ground, unless they have subsequently gone beyond it and are returning.`,
    inPractice: `Two things follow that decide televised reviews constantly.

**A bat in the air is not grounded.** A batter sliding their bat towards the crease can be run out if the bat is bouncing at the moment the wicket is broken, which is why replays freeze on the bat rather than the batter.

**The bat must be in hand.** A dropped bat, or a bat let go as the batter dives, does not count.

For a stumping the same test applies: the keeper must break the wicket while no part of the batter or bat in hand is grounded behind the popping crease.`,
    misunderstandings: `**"Being over the line is enough."** Being over the line in the air is not. Something must be grounded behind it.

**"The line belongs to the batter."** For the batter, the requirement is to be grounded **behind** the popping crease, not on it.

**"Both batters at one end means both are out."** One of them is protected; the other is at risk.`,
    takeaways: `- Some part of person or bat in hand grounded behind the popping crease.
- Airborne is not grounded, and a dropped bat does not count.
- The provision for a running batter who was previously in their ground is what stops a diver being penalised for being in mid-air.
- The same test decides run outs and stumpings.`,
    related: [
      'crease',
      'crease-rules',
      'run-out',
      'stumped',
      'running-between-wickets',
      'short-run',
    ],
    sourceKeys: [{ ...MCC, locator: 'Law 30 (Batter out of their ground)' }],
    order: 100,
  }),

  law({
    slug: 'crease-rules',
    title: 'Crease Rules',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'What the four marked lines at each end require of the bowler and permit to the batter.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `**Law 7** defines the creases. At each end:

- the **bowling crease** is the line through the stumps, 8 ft 8 in long;
- the **popping crease** is parallel to it and 4 ft in front, extending at least 6 ft either side of the middle stump;
- the two **return creases** run back from the ends of the popping crease at right angles, 4 ft 4 in either side of the middle stump.

They are used differently by the two sides.

**The bowler** must land some part of the front foot behind the popping crease, and the back foot within and not touching the return crease. Breaching either is a **no-ball** under Law 21.

**The batter** uses the popping crease to define their **ground** under Law 30. Being grounded behind it protects them from run out and stumping.`,
    inPractice: `The asymmetry in how the same line is treated is worth stating plainly, because it catches people out.

For the **bowler's front foot**, the requirement is that some part of the foot is behind the popping crease. The foot may be partly over the line, and the heel may be raised.

For the **batter**, some part of person or bat in hand must be grounded behind the crease. Being above it is not enough.

The batter is also free to stand **outside** their crease if they choose, which is a real tactic against spin, and to leave it as soon as the ball is delivered.`,
    misunderstandings: `**"The bowler's whole foot must be behind the line."** Some part behind is sufficient.

**"The batter must stay in the crease."** They may bat from outside it, and frequently do against spin, accepting the stumping risk.`,
    takeaways: `- Four lines per end: bowling, popping and two return creases.
- The bowler's feet are governed by Law 21; the batter's ground by Law 30.
- The two use the same line by different tests.`,
    related: [
      'crease',
      'batters-ground',
      'no-ball',
      'batting-outside-the-crease',
      'depth-of-the-crease',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 7, 21, 30' }],
    order: 110,
  }),

  concept({
    slug: 'running-between-wickets',
    title: 'Running Between the Wickets',
    category: 'laws-and-rules',
    alsoIn: ['batting'],
    difficulty: 'beginner',
    summary:
      'How batters convert a hit into runs, and why most run outs are a failure of communication rather than of speed.',
    explanation: `After the striker plays the ball, either batter may set off, and the two must run in opposite directions along the pitch. Each time both have grounded some part of bat or body behind the popping crease at the far end, one run is scored.

They may keep running while the ball is live. They may also **decline** to run, which is a normal and frequent choice.

Because both batters must complete each run, running is a two-person act, and cricket has evolved a firm convention about who decides.`,
    howItWorks: `**Calling.** One batter calls, in one of three words: "yes", "no", or "wait".

The convention is that the **striker calls** for anything hit in front of them, where they can see the ball, and the **non-striker calls** for anything hit behind square, where the striker cannot see it and the non-striker can. Following that convention is what prevents the classic run out where both batters end up at the same end.

**Backing up.** The non-striker takes a step or two down the pitch as the ball is released, so they can start faster. They may not leave their ground before the ball would normally be released, or they can be run out.

**Turning.** A batter must ground bat or body behind the crease before turning back for another run. Turning short means the run is disallowed as a **short run**.

**Running the bat in.** Batters slide the bat ahead of them into the crease. The bat must be **in hand and grounded**, which is why a bouncing bat costs run outs.`,
    whyItMatters: `Singles are the difference between a run rate of 4 and a run rate of 6 without any additional risk of getting out from a shot. Sides that run well convert ones into twos and put fielders under pressure, which produces misfields and overthrows.

It is also the most common way to lose a wicket to nobody's skill in particular. A run out from a mix-up costs the same wicket as a jaffa.`,
    misunderstandings: `**"The striker always calls."** The convention is that the batter with the better view calls, which for anything behind square is the non-striker.

**"You can turn as soon as you cross the line."** You must ground bat or body behind the crease, or the run is short.

**"Backing up is against the spirit of the game."** Backing up is normal and expected. Leaving the ground **early** is what exposes the non-striker to a legitimate run out.`,
    formatDifferences: `In T20 cricket running is a scoring strategy in itself: converting dot balls into ones and ones into twos is how a side keeps a middle-overs innings moving without risking boundaries. In Test cricket the same skill matters mostly for rotating the strike and protecting a batter who is struggling.`,
    takeaways: `- Both batters must ground bat or body behind the far crease for a run to count.
- The batter with the better view calls: striker in front, non-striker behind square.
- Turning short disallows the run; a bouncing bat costs run outs.
- Most run outs are communication failures.`,
    related: [
      'short-run',
      'run-out',
      'batters-ground',
      'strike-rotation',
      'non-striker',
      'run-out-non-strikers-end',
    ],
    sourceKeys: [{ ...MCC, locator: 'Laws 18, 30, 38' }],
    order: 120,
  }),

  law({
    slug: 'short-run',
    title: 'Short Run',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'A run in which a batter turned without grounding behind the crease. It is disallowed.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 18**, a run is **short** if a batter, having previously been behind the popping crease at the other end, turns for a further run without grounding some part of their person or bat behind the popping crease at the end they have reached.

The umpire calls and signals **short run**, and that run is **not scored**. Any other runs completed properly in the same passage of play do count.

If both batters run short in the same run, only one run is deducted, since only one run was being attempted.`,
    inPractice: `Short runs are most common when batters are running two or three in a hurry, and the batter turning for the next run cuts the corner rather than putting the bat down.

The umpire at the relevant end watches for it, and the signal is a bent arm tapping the shoulder. On a scorecard the effect is invisible: the run simply never appears, which is why a team total occasionally fails to match a viewer's count.

Deliberately running short is dealt with more severely, as unfair play, and can bring penalty runs.`,
    misunderstandings: `**"A short run means all the runs are cancelled."** Only the short one.

**"Sliding the bat over the line is enough."** It must be grounded behind the crease.`,
    takeaways: `- Turning without grounding behind the crease makes the run short.
- The short run is disallowed; other runs in the passage stand.
- Deliberate short running is an unfair-play offence.`,
    related: ['running-between-wickets', 'batters-ground', 'crease', 'penalty-runs'],
    sourceKeys: [{ ...MCC, locator: 'Law 18 (Scoring runs)' }],
    order: 130,
  }),

  law({
    slug: 'substitute-fielder',
    title: 'Substitute Fielder',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'A replacement allowed to field but not to bat, bowl or captain, and the separate concussion-replacement rules that do allow all three.',
    sourceRevision: `${MCC_CODE}; concussion replacements from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    theLaw: `Under **Law 24**, a side may use a **substitute** for a fielder who is injured, ill or absent for another wholly acceptable reason, with the umpires' consent.

The restrictions are the point. A substitute fielder:

- **may field**, subject to the umpires' agreement on where;
- **may not bowl**;
- **may not bat**;
- **may not act as captain** on the field.

A player who has been off the field also faces restrictions on bowling immediately upon return, calculated from the time they were absent.`,
    edgeCasesHeading: 'Concussion replacements are different',
    edgeCases: `A **concussion replacement** is not a Law 24 substitute. It is a **playing condition**, introduced by the ICC and adopted in many competitions, under which a player diagnosed with concussion can be replaced by a like-for-like substitute who **may bat and bowl** for the rest of the match.

The match referee approves the replacement and may impose conditions to keep it like-for-like, for instance restricting a replacement bowler if the concussed player was a batter.

That distinction is the sort of thing it is easy to get wrong: a concussion replacement is a full participant, a substitute fielder is not, and only one of the two is in the Laws.`,
    inPractice: `The common sight is a fielder leaving with a strain and a squad member appearing in their place: that player will field for as long as needed and take no further part. In first-class cricket a **runner** for an injured batter is no longer permitted, which is a separate change.`,
    misunderstandings: `**"A substitute can do everything except bat."** They cannot bowl or captain either.

**"Concussion substitutes are the same as any substitute."** They are governed by playing conditions and may bat and bowl.`,
    takeaways: `- Law 24 substitutes may field only: no batting, bowling or captaincy.
- Time off the field restricts a returning player's bowling.
- Concussion replacements are a playing condition and are full participants.`,
    related: ['runner', 'fielder', 'match-referee', 'helmet'],
    sourceKeys: [
      { ...MCC, locator: 'Law 24 (Fielders’ absence; Substitutes)' },
      { key: 'icc-playing-conditions', locator: 'Concussion replacements' },
    ],
    order: 140,
  }),

  law({
    slug: 'runner',
    title: 'Runner',
    category: 'laws-and-rules',
    difficulty: 'intermediate',
    summary:
      'A player who once ran between the wickets for an injured batter. No longer permitted in the Laws.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `A **runner** was a member of the batting side who ran between the wickets on behalf of a batter unable to run because of injury. The batter faced the bowling; the runner did the running.

**Runners are no longer permitted.** The provision was removed from the Laws, and the current Code makes no allowance for one. An injured batter now has three options: bat on and run as best they can, retire hurt and resume later if able, or retire and not resume.

The change was made because the practice was open to abuse and created a set of awkward secondary rules, including how a runner could themselves be run out and where they had to stand.`,
    inPractice: `You will still see runners in archive footage and read about them in older match reports, which is exactly why this entry exists: encountering one and assuming the rule still stands is an easy mistake.

The modern equivalent situation is a batter **retiring hurt**, which is recorded as retired not out, does not count as a dismissal, and allows them to resume their innings later if they recover.`,
    misunderstandings: `**"An injured batter can call for a runner."** Not under the current Laws.

**"Retired hurt is the same as being out."** It is not a dismissal, and it does not count against a batting average.`,
    takeaways: `- Runners are a historical provision, removed from the Laws.
- An injured batter bats on, or retires hurt and may resume.
- Retired hurt is not a dismissal.`,
    related: ['substitute-fielder', 'not-out', 'batting-order'],
    sourceKeys: [{ ...MCC, locator: 'Law 25 (Batter’s innings; Runners)' }],
    order: 150,
  }),

  law({
    slug: 'handling-the-ball',
    title: 'Interfering With the Ball',
    category: 'laws-and-rules',
    alsoIn: ['dismissals'],
    difficulty: 'intermediate',
    aliases: ['Handled the Ball', 'Handling the Ball'],
    summary:
      'Deliberately touching the ball with a hand not holding the bat. Now dealt with as obstructing the field, not as a dismissal of its own.',
    sourceRevision: MCC_CODE,
    lastReviewedAt: REVIEWED,
    theLaw: `Under the current Code there is **no separate dismissal called "handled the ball"**. It was removed in the 2017 Code and folded into **Law 37 (Obstructing the field)**.

Law 37 now provides that the striker is out obstructing the field if, while the ball is in play and after it has touched the bat or person, they **wilfully strike it with a hand not holding the bat**, other than to protect themselves from injury.

A batter may still legitimately handle the ball with the consent of a fielder, for instance picking it up and returning it once play has effectively stopped.`,
    inPractice: `The practical situation is a batter fending a ball away from the stumps with a glove that is not on the bat, or slapping a ball away after playing it. That is now an obstructing-the-field dismissal.

The change matters mostly for reading older material. Seven Test dismissals were recorded as "handled the ball" before the merge, and a statistical source listing that method is describing a category that no longer exists rather than one that never happened.`,
    misunderstandings: `**"Handled the ball is still a way of getting out."** The conduct is still out; the **name** and the Law changed.

**"Touching the ball at all is out."** It must be wilful and not for self-protection, and it may be done with a fielder's consent.`,
    takeaways: `- No separate "handled the ball" dismissal since the 2017 Code.
- Now covered by Law 37, obstructing the field.
- Wilful, and not for self-protection, is the test.`,
    related: ['obstructing-the-field', 'wickets-and-dismissals', 'dead-ball'],
    sourceKeys: [{ ...MCC, locator: 'Law 37 (Obstructing the field)' }],
    order: 160,
  }),

  law({
    slug: 'fielding-restrictions',
    title: 'Fielding Restrictions',
    category: 'laws-and-rules',
    alsoIn: ['limited-overs-concepts', 'field-positions'],
    difficulty: 'intermediate',
    summary:
      'Limits on where fielders may stand, some in the Laws and some in a competition’s playing conditions.',
    sourceRevision: `${MCC_CODE}; limited-overs restrictions from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    theLaw: `There are two separate families of restriction, and conflating them is the usual error.

**In the Laws, applying to all cricket.** Law 28 limits the fielding side to **no more than two fielders**, other than the wicketkeeper, **behind square on the leg side** at the moment the ball comes into play. Breaching it is a no-ball. The Law also prohibits a fielder from standing on or encroaching onto the pitch, and restricts significant movement once the bowler begins their run-up.

**In playing conditions, applying to limited-overs cricket.** A **thirty-yard circle** is marked, and the number of fielders permitted outside it is capped by phase. Under current ICC men's conditions that is two during the powerplay, and five thereafter in a T20I, with a three-block structure in ODIs.`,
    inPractice: `The leg-side restriction in Law 28 is the older and less discussed of the two, and it exists because of a specific historical abuse: packing the leg side behind square to bowl at the batter's body, the tactic that produced the Bodyline crisis. It applies in a Test just as much as in a T20.

The circle restrictions are what shape a limited-overs innings: they are the reason boundaries are easier in the first six overs, the reason run rates dip when the powerplay ends, and the reason a "sweeper" on the boundary is a phase-dependent luxury.`,
    edgeCasesHeading: 'Why the numbers cannot be stated once',
    edgeCases: `The circle numbers belong to a competition and a season, not to cricket. They have been revised repeatedly, they differ between ODIs and T20s, they differ between competitions, and they are scaled for shortened matches under a formula in the relevant playing conditions.

The Law 28 leg-side limit, by contrast, is stable and universal.

So the safe statement is: two fielders behind square on the leg side, always, everywhere; and everything about the circle needs its competition and season attached.`,
    misunderstandings: `**"Fielding restrictions only exist in limited-overs cricket."** The leg-side restriction is in the Laws and applies to Test cricket too.

**"The thirty-yard circle is in the Laws."** The circle and its caps come from playing conditions.

**"A fielder may not move at all."** Minor adjustment is fine; significant movement after the run-up begins is not.`,
    takeaways: `- Law 28: at most two fielders behind square on the leg side, in all cricket.
- Circle restrictions are playing conditions, phase-based, and vary by competition.
- Breaching the leg-side limit is a no-ball.`,
    related: [
      'powerplay',
      'field-setting',
      'cricket-field-positions',
      'no-ball',
      'limited-overs-cricket',
    ],
    sourceKeys: [
      { ...MCC, locator: 'Law 28 (The fielder)' },
      { key: 'icc-playing-conditions', locator: 'Fielding restrictions' },
    ],
    order: 170,
  }),

  law({
    slug: 'free-hit',
    title: 'Free Hit',
    category: 'laws-and-rules',
    alsoIn: ['limited-overs-concepts'],
    difficulty: 'beginner',
    summary:
      'A delivery after a no-ball from which the striker cannot be dismissed by most methods. A playing condition, not a Law.',
    sourceRevision: ICC_PC,
    lastReviewedAt: REVIEWED,
    theLaw: `The free hit is **not in the Laws of Cricket**. It is a **playing condition**, used in limited-overs cricket under ICC conditions and in most T20 competitions.

Where it applies, the delivery following a no-ball is a free hit. From it, the striker **cannot be dismissed** by any method that would not also apply to a no-ball: in practice they cannot be bowled, caught, LBW, stumped or hit wicket, but **can** be run out, or out obstructing the field or hitting the ball twice.

The field may not be changed for a free hit unless the striker changes ends, which prevents the fielding side from setting a purely defensive field for it.`,
    inPractice: `The batter treats a free hit as a free swing, because the only real risk is a run out. Bowlers respond with the deliveries hardest to hit cleanly rather than the safest ones: wide yorkers, slower balls, and anything that resists a full swing.

If the free-hit delivery is itself a no-ball, the next delivery is another free hit, so a bowler can compound the problem badly.`,
    edgeCasesHeading: 'Which no-balls, and where',
    edgeCases: `Two things vary by competition and by era, and neither can be stated as a universal fact.

**Which no-balls trigger a free hit.** Some conditions have applied it only to front-foot no-balls; others to all no-balls. This has changed over time.

**Whether free hits exist at all.** They do not exist in Test cricket, and they are not universal in domestic competitions.

Anything specific about free hits therefore belongs to a named competition and season.`,
    misunderstandings: `**"You cannot be out at all on a free hit."** A run out is entirely possible, and batters are occasionally run out taking liberties.

**"Free hits are part of the Laws."** They are a playing condition.

**"Every no-ball gives a free hit."** It depends on the competition's conditions.`,
    takeaways: `- A playing condition, not a Law, and absent from Test cricket.
- Most dismissals are off, but run out remains available.
- The field cannot be changed unless the striker changes ends.
- Which no-balls trigger it varies by competition.`,
    related: ['no-ball', 'powerplay', 'wide-yorker', 'death-bowling', 'limited-overs-cricket'],
    sourceKeys: [{ key: 'icc-playing-conditions', locator: 'Free hit' }],
    order: 180,
  }),

  law({
    slug: 'over-rate-and-time',
    title: 'Over Rates and Time Regulations',
    category: 'laws-and-rules',
    difficulty: 'advanced',
    summary:
      'The rules requiring play to proceed at a reasonable pace, and the penalties competitions attach to falling behind.',
    sourceRevision: `${MCC_CODE}; over-rate penalties from ${ICC_PC}`,
    lastReviewedAt: REVIEWED,
    theLaw: `The Laws provide the framework: **Law 41** treats deliberate time-wasting as unfair play, with warnings and then penalty runs, and the Laws set out the hours of play, intervals and minimum overs in the last hour of a match.

Almost everything a viewer hears about over rates, however, comes from **playing conditions** rather than the Laws. Competitions set a required over rate and attach consequences to missing it. Those have included fines, the suspension of players from subsequent matches, and, in some competitions, in-match sanctions such as being required to bring an extra fielder inside the circle for the remaining overs.

Which sanctions apply, and how they are calculated once allowances for wickets, reviews and interruptions are deducted, is specific to the competition and the season.`,
    inPractice: `The practical effects are visible without knowing the details. Fielding sides hurry between overs when they are behind the clock. Captains give an over to a spinner partly because spinners get through overs faster. In Test cricket a scheduled day has a minimum number of overs and play can be extended to make them up.

Time also interacts with the result. A side batting to save a draw is playing against the clock rather than the scoreboard, and one over more or less can decide the match.`,
    misunderstandings: `**"Over rates are a Law."** The requirement not to waste time is; the rates and penalties are playing conditions.

**"Slow play only affects fines."** In-match sanctions exist in some competitions, and in a timed match slow play changes what results are reachable.`,
    takeaways: `- Deliberate time-wasting is unfair play under Law 41.
- Required over rates and their penalties are competition playing conditions.
- In timed cricket, overs lost to slow play change which results are possible.`,
    related: ['session', 'managing-overs', 'draw', 'match-referee', 'declaration'],
    sourceKeys: [
      { ...MCC, locator: 'Laws 11, 12, 41' },
      { key: 'icc-playing-conditions', locator: 'Minimum over rates' },
    ],
    order: 190,
  }),
];
