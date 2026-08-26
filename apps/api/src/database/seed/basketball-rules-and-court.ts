import { courtArea, officiating, positionRole, rule, tactic } from './basketball-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';

/**
 * Rules, the court, the positions and the officiating calls.
 *
 * Split out of `basketball-explainers.ts` at the point that file passed two
 * thousand lines. The division is by subject rather than by length: everything
 * here answers "what is allowed and where does it happen", and the other file
 * keeps the tactical and statistical concepts.
 *
 * Rule-sensitive entries carry their revision. The FIBA and NBA rulebooks are
 * reissued periodically, and the set to re-audit after a change has to be a
 * query rather than a reading of every page.
 */

const FIBA = 'FIBA Official Basketball Rules 2024';
const NBA = 'NBA Rulebook, 2024/25 season';
const REVIEWED = '2026-08-26';

/** Applied to every entry written against a rulebook. */
const ruleMeta = {
  ruleSensitive: true,
  sourceRevision: `${FIBA}; ${NBA}`,
  lastReviewedAt: REVIEWED,
  sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
};

export const BASKETBALL_RULES_AND_COURT: ExplainerSeed[] = [
  // ══ Rules & basics ═════════════════════════════════════════════════════════
  rule({
    ...ruleMeta,
    slug: 'how-a-basketball-game-starts',
    title: 'How a Basketball Game Starts',
    category: 'rules-and-basics',
    aliases: ['tip off', 'tipoff', 'opening jump ball', 'game start'],
    summary:
      'A jump ball at centre court, and the possession arrow that settles everything after it.',
    order: 700,
    howItWorks: `A referee tosses the ball straight up between one player from each team at the centre circle. Both jump and try to tap it to a teammate. That is the **tip-off**, and it is the only jump ball of the game in most competitions.

Every later situation that would need a jump ball, such as two opponents holding the ball at once, is resolved by the **possession arrow** instead. The arrow points to whichever team did not get the ball last time, and it alternates each time it is used. Teams also alternate which basket they attack at half-time.`,
    whyItMatters: `Winning the tip is worth very little: it gives one extra possession at most, and the possession arrow then hands the first arrow situation to the other side.

It matters more than that only in **overtime**, which begins with another jump ball, and at the end of close games, where the arrow can decide who gets a final possession.`,
    ruleDifferences: `The NBA is the outlier: it uses a **jump ball** to restart every held-ball situation, not just the opening one, which is why NBA games have several jump balls and FIBA games effectively have one.

FIBA, the NCAA and the WNBA all use the alternating possession arrow after the opening tip.`,
    related: ['jump-ball', 'possession', 'overtime'],
  }),

  rule({
    ...ruleMeta,
    slug: 'how-you-win-a-basketball-game',
    title: 'How You Win a Basketball Game',
    category: 'rules-and-basics',
    aliases: ['winning', 'how to win', 'final score', 'draws'],
    summary: 'More points when the clock expires. There are no draws.',
    order: 710,
    howItWorks: `Whichever team has scored more points when the final buzzer sounds wins. That is the entire rule.

If the scores are level, the game goes to **overtime**: an extra period of play, repeated as many times as necessary until somebody leads at the end of one. Basketball games therefore never end drawn, unlike football or a Test match.

A shot released before the buzzer counts if it goes in, even though the clock has expired while the ball is in the air. That is why a **buzzer beater** can win a game after time has run out.`,
    whyItMatters: `The absence of draws changes how the end of a close game is played. A team one point behind cannot settle for a tie, and a team one point ahead cannot run out the clock and accept a share, so late-game basketball is unusually aggressive compared with sports where a draw is available.

It is also why deliberate fouling exists. A trailing team fouls to stop the clock, concede two free throws, and get the ball back, because losing by one and losing by ten are worth the same.`,
    related: ['overtime', 'buzzer-beater', 'how-scoring-works', 'game-clock'],
  }),

  rule({
    ...ruleMeta,
    slug: 'how-long-a-basketball-game-is',
    title: 'How Long a Basketball Game Is',
    category: 'rules-and-basics',
    aliases: ['game length', 'how long', 'duration', 'quarters'],
    summary: 'Forty or forty-eight playing minutes, and around two and a half hours in real time.',
    order: 720,
    howItWorks: `Playing time is 40 minutes under FIBA rules and 48 in the NBA, divided into four quarters.

Real time is much longer, typically two to two and a half hours, because the clock stops for every whistle, every ball out of bounds, every timeout and every break between quarters. Broadcast games add further stoppages.

The last two minutes are the extreme case: with deliberate fouling and timeouts, two minutes of playing time regularly takes fifteen minutes to complete.`,
    ruleDifferences: `- **FIBA:** four 10-minute quarters (40 minutes).
- **NBA:** four 12-minute quarters (48 minutes).
- **WNBA:** four 10-minute quarters.
- **NCAA men:** two 20-minute halves.
- **NCAA women:** four 10-minute quarters.
- **3x3:** a single period of 10 minutes, or first to 21 points.

The consequence is that per-game statistics do not transfer between competitions. Twenty points in the NBA and twenty in EuroLeague were scored in games eight minutes apart in length.`,
    related: ['game-clock', 'overtime', 'nba-vs-fiba-rules'],
  }),

  rule({
    ...ruleMeta,
    slug: 'overtime',
    title: 'Overtime Explained',
    category: 'rules-and-basics',
    aliases: ['overtime', 'ot', 'extra time', 'double overtime'],
    summary: 'An extra period played when the scores are level, repeated until somebody wins.',
    order: 730,
    howItWorks: `If the scores are level at the end of regulation, teams play an extra period of five minutes in the NBA, FIBA and the WNBA.

Whoever leads at the end of it wins. If it is still level, another overtime period is played, and so on. Games have occasionally required four or more.

Team fouls generally carry over into overtime rather than resetting, and players who have fouled out remain out. Both facts matter: a team that is short of bodies going into overtime is at a real disadvantage.`,
    whyItMatters: `Overtime is short enough that a single possession is a large share of it. Five minutes is roughly ten possessions each, so one turnover or one three-pointer weighs far more than it would in regulation.

It also punishes depth. Players are already tired, foul trouble accumulated in regulation still applies, and a team that has lost two players to fouls may be fielding its fifth-choice defender.`,
    ruleDifferences: `Five minutes in the NBA, FIBA and the WNBA. NCAA men and women also use five.

**3x3 does not use timed overtime**: if scores are level the first team to score two points wins.`,
    related: ['how-you-win-a-basketball-game', 'game-clock', 'fouling-out'],
  }),

  rule({
    ...ruleMeta,
    slug: 'timeouts',
    title: 'Timeouts Explained',
    category: 'rules-and-basics',
    aliases: ['timeout', 'time out', 'timeouts', 'calling time'],
    summary:
      'A short stoppage a team can request to rest, instruct or stop the opponent’s momentum.',
    order: 740,
    howItWorks: `A team may stop play a limited number of times per game. During a timeout, players go to the bench, the coach instructs them, and the clock stops.

Timeouts are used for three quite different purposes:

- **Tactical.** To draw up a specific play, most obviously with seconds remaining.
- **To stop momentum.** When the opponent has scored several times unanswered, a timeout breaks the run.
- **To advance the ball.** In the NBA and FIBA, a timeout in the last part of the game lets a team restart from the frontcourt rather than the baseline, which is worth several seconds of clock.

Unused timeouts are usually lost at the end of a half or in the final minutes, so a coach who saves them all has wasted them.`,
    ruleDifferences: `**Who may call one is the difference that most surprises viewers.**

- **NBA:** a player on the floor may call a timeout during live play. This is why an NBA player trapped on the sideline signals frantically to the referee, and why defences trap in the corner hoping to force a turnover before that happens.
- **FIBA:** only the **coach** may request a timeout, and only when the ball is dead. A player trapped in the corner has no such escape.

The number and timing of timeouts also differ between the NBA, FIBA, the NCAA and the WNBA, and broadcast games add mandatory media timeouts that no team requests.`,
    related: ['game-clock', 'nba-vs-fiba-rules', 'frontcourt'],
  }),

  rule({
    ...ruleMeta,
    slug: 'substitutions',
    title: 'Substitutions Explained',
    category: 'rules-and-basics',
    aliases: ['substitution', 'subs', 'rotation', 'bench'],
    summary: 'Players may be swapped freely at any stoppage, and may return as often as needed.',
    order: 750,
    howItWorks: `Substitutions happen at a dead ball, when the referee permits the incoming player onto the court. There is no limit on the number, and crucially **a substituted player may return**, as many times as the coach likes.

That is the important structural fact. Unlike football, where a substitution is permanent and a squad has a handful of them, basketball rotates players continuously throughout the game.`,
    whyItMatters: `Free re-entry is why basketball has a **rotation** rather than a starting eleven. A coach plans which combinations of players are on the floor at which times, and the group that starts the game is often not the group that finishes it.

It also makes **foul trouble** manageable: a player with four fouls can be rested for a quarter and brought back for the finish, which is a decision unavailable in a sport with permanent substitutions.

The **sixth man**, the first player off the bench, is a recognised role precisely because of this: they may play more minutes than a starter.`,
    related: ['sixth-man', 'foul-trouble', 'timeouts'],
  }),

  rule({
    ...ruleMeta,
    slug: 'jump-ball',
    title: 'Jump Ball Explained',
    category: 'rules-and-basics',
    aliases: ['jump ball', 'tip off', 'held ball', 'possession arrow'],
    summary:
      'A referee tosses the ball between two opponents, though most competitions now use an arrow instead.',
    order: 760,
    howItWorks: `Two opposing players stand in a circle and the referee throws the ball up between them. Each tries to tap it to a teammate; neither may catch it outright.

It happens at the start of the game, at the start of overtime, and in a **held ball**, where two opponents have firm grip on the ball at the same time and neither can win it.

Most competitions no longer resolve held balls this way. They use the **alternating possession arrow**: the ball goes to whichever team the arrow points at, and the arrow then flips.`,
    ruleDifferences: `**The NBA still jumps for every held ball.** FIBA, the NCAA and the WNBA use the arrow after the opening tip.

The practical effect is visible: an NBA game may contain several jump balls, while a FIBA game contains one.`,
    misunderstandings: `**"The tallest player always jumps."** Usually, but not necessarily. Timing and leap matter as much as height, and teams sometimes send a better jumper rather than a taller one.

**"You can catch the tip."** No. The jumper may only tap it. Catching it is a violation.`,
    related: ['how-a-basketball-game-starts', 'possession', 'overtime'],
  }),

  rule({
    ...ruleMeta,
    slug: 'out-of-bounds',
    title: 'Out of Bounds Explained',
    category: 'rules-and-basics',
    aliases: ['out of bounds', 'out', 'sideline', 'baseline', 'throw in'],
    summary:
      'The ball is out when it touches the boundary line or anything beyond it, and the other team restarts.',
    order: 770,
    howItWorks: `The boundary lines are **out**, not in. A ball touching the line is out of bounds, which is the opposite of tennis and catches people out constantly.

The ball is out when it touches the floor, a person or an object on or beyond the line. Possession goes to the team that **did not touch it last**, and play restarts with a throw-in from the sideline or baseline.

A player is also out of bounds if any part of them is touching the line or beyond it while they hold the ball, which is why a player saving a ball will throw it back inbounds before landing.`,
    whyItMatters: `The last-touch rule produces one of the game's recurring scrambles: a player about to lose the ball out of bounds will deliberately throw it off an opponent's leg, so that the opponent touched it last and possession stays with the attacking team.

Deciding who touched it last is also among the most-reviewed calls in professional basketball, because it is genuinely difficult to see at speed and directly hands a possession to one side.`,
    misunderstandings: `**"The line is in."** It is not. Touching the line is out.

**"The ball was in the air over the line, so it's out."** Being over the line is irrelevant. What matters is contact with the floor, a person or an object.`,
    related: ['baseline', 'sideline', 'possession'],
  }),

  // ══ Court areas ════════════════════════════════════════════════════════════
  courtArea({
    ...ruleMeta,
    slug: 'the-paint',
    title: 'The Paint (The Key)',
    category: 'court-and-positions',
    aliases: ['the paint', 'the key', 'in the paint', 'lane', 'the box'],
    summary: 'The painted rectangle under each basket, where the most valuable shots are taken.',
    order: 780,
    whereItIs: `The rectangle extending from the baseline out to the free-throw line, directly under the basket. It is painted a contrasting colour, which is where the name comes from. "The key" is older, from a time when the area was narrower and shaped like a keyhole.

It is bounded by the free-throw line at the top and the two **low blocks** at the bottom corners, next to the basket.`,
    whyItMatters: `Shots in the paint are the most efficient in basketball, because they are taken close to the rim. Almost every offensive idea is ultimately about getting a good shot there, or forcing the defence to concede a three by defending it.

Two rules govern it and both exist to stop it becoming permanently congested:

- An **attacker** may not stand in the paint for more than three seconds.
- In the NBA, a **defender** may not stand in it for more than three seconds unless actively guarding someone.

"Points in the paint" is tracked as its own statistic for the same reason: it is a reasonable proxy for whether a team is generating good shots.`,
    ruleDifferences: `**Shape.** The paint was trapezoidal under FIBA rules until 2010, wider at the baseline. It is now rectangular everywhere, but older footage and diagrams show the old shape.

**Defensive three seconds.** The NBA prohibits it; FIBA, the NCAA and the WNBA do not. This is a significant tactical difference: international defences can station a big man in the paint permanently, and NBA defences cannot.`,
    related: ['three-second-violation', 'low-post', 'high-post', 'rim-protection'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'restricted-area',
    title: 'The Restricted Area',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['restricted area', 'restricted zone', 'the semi circle', 'charge circle'],
    summary: 'The small arc under the basket where a defender cannot draw a charging foul.',
    order: 790,
    whereItIs: `A semi-circle marked on the floor directly beneath the basket, roughly four feet in radius.`,
    whyItMatters: `It exists to solve one specific problem. Without it, a defender could simply stand under the rim and wait to be run into by anyone driving to the basket, drawing a charging foul each time. That is dangerous for the attacker and produces basketball nobody wants to watch.

Inside the arc, a defender **cannot draw a charge** against a player driving to the basket. The contact becomes a blocking foul on the defender instead, or nothing.

This is why replays of charge-block decisions zoom in on the defender's feet: whether their heels were inside the line decides which team gets the ball and which player gets a foul.`,
    ruleDifferences: `The NBA, FIBA, the WNBA and the NCAA all have a restricted area, but the radius differs slightly between them, and the NCAA adopted one considerably later than the professional leagues.`,
    related: ['charge-vs-block', 'charging', 'blocking-foul', 'the-paint'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'free-throw-line',
    title: 'The Free-Throw Line',
    category: 'court-and-positions',
    aliases: ['free throw line', 'foul line', 'the charity stripe', 'the line'],
    summary: 'The line 15 feet from the backboard where free throws are taken.',
    order: 800,
    whereItIs: `Fifteen feet from the backboard, at the top of the paint. The distance is the same in every competition worldwide.`,
    whyItMatters: `It is where the only completely unguarded shot in basketball is taken, which makes free-throw shooting a pure test of technique under pressure and nothing else.

The line also names an area. The **elbows** are its two corners, and shooting or passing "from the line" describes a spot in the offence rather than an actual free throw.

Players standing along the sides of the paint during a free throw may not enter until the ball leaves the shooter's hands, which is why rebounders lean and time their step.`,
    ruleDifferences: `The distance is universal at 15 ft (4.6 m). What differs is how many free throws a given foul produces, and when the bonus applies, which are covered under fouls rather than here.`,
    related: ['free-throw', 'the-elbow', 'the-paint', 'bonus'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'baseline',
    title: 'The Baseline',
    category: 'court-and-positions',
    aliases: ['baseline', 'end line', 'endline'],
    summary: 'The boundary line behind each basket, running the width of the court.',
    order: 810,
    whereItIs: `The line at each end of the court, behind the basket, running from sideline to sideline. Also called the end line.`,
    whyItMatters: `Three things happen here.

**Restarts.** After a made basket, the conceding team throws in from the baseline. Sideline and baseline throw-ins have different rules about moving along the line.

**Baseline drives.** Attacking along the baseline is a common route to the rim, and defending it well means steering the attacker there deliberately, because the baseline acts as an extra defender: it limits where they can go.

**Corner spacing.** The corners sit where the baseline meets the sideline, and the corner three is taken from there.`,
    related: ['out-of-bounds', 'the-corner', 'sideline'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'sideline',
    title: 'The Sideline',
    category: 'court-and-positions',
    aliases: ['sideline', 'touchline', 'side line'],
    summary: 'The boundary along each long edge of the court.',
    order: 820,
    whereItIs: `The two long boundaries of the court, running from baseline to baseline. Benches, coaches and officials sit beyond them.`,
    whyItMatters: `The sideline is used as a defensive tool. Trapping an opponent against it means the line itself takes away one direction of escape, which is why presses and blitzes are so often aimed at pushing the ball handler toward it.

In the NBA a player caught there can call a timeout to escape, which is exactly why FIBA's rule that only coaches may call timeouts makes sideline traps far more dangerous internationally.`,
    related: ['out-of-bounds', 'full-court-press', 'blitz', 'timeouts'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'half-court',
    title: 'Half Court',
    category: 'court-and-positions',
    aliases: ['half court', 'halfcourt', 'half court offense', 'set offense'],
    summary: 'One half of the floor, and the name for offence played against a set defence.',
    order: 830,
    whereItIs: `Either half of the court, divided by the halfway line. The term also names a style of play: **half-court offence** is what happens once both teams are set and the fast break has gone.`,
    whyItMatters: `Most basketball is half-court basketball. Transition opportunities are the most efficient possessions available, but they are a minority: the majority of possessions end with a set defence in place and an offence trying to create an advantage from nothing.

That is why screens, spacing and off-ball movement exist. In transition the advantage is handed to you; in the half court it has to be manufactured.

Half court is also the format of **3x3**, which is played on one half with a single basket.`,
    related: ['fast-break', 'spacing', 'pick-and-roll', 'three-by-three-basketball'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'frontcourt',
    title: 'Frontcourt',
    category: 'court-and-positions',
    aliases: ['frontcourt', 'front court', 'attacking half'],
    summary: 'The half of the floor a team is attacking.',
    order: 840,
    whereItIs: `The half containing the basket your team is attacking. It is defined relative to whoever has the ball, so the same physical half is one team's frontcourt and the other's backcourt.

"Frontcourt" is also used to mean a group of players: a team's forwards and centre, as opposed to its guards.`,
    whyItMatters: `Crossing into the frontcourt is a threshold with consequences. Once the ball and both feet of the ball handler are over the line, the team may not return the ball to the backcourt: doing so is a **backcourt violation**.

Teams also have a limited time to get there, eight seconds in most competitions, which is what stops a team simply standing in its own half.`,
    related: ['backcourt', 'backcourt-violation', 'eight-second-violation', 'big-man'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'backcourt',
    title: 'Backcourt',
    category: 'court-and-positions',
    aliases: ['backcourt', 'back court', 'defensive half'],
    summary: 'The half of the floor a team is defending, and the name for its guards.',
    order: 850,
    whereItIs: `The half containing the basket your team is defending. As with frontcourt it is relative: your backcourt is the opponent's frontcourt.

It also names a group of players: a team's **backcourt** is its guards, as opposed to its frontcourt of forwards and centre.`,
    whyItMatters: `Two rules apply here. A team has eight seconds to advance the ball out of its backcourt, and once it has done so it may not send the ball back, which is a **backcourt violation**.

Together they push the game forward: a team cannot retreat to safety, and cannot dawdle. Both rules exist for the same reason as the shot clock, which is to prevent stalling.`,
    related: ['frontcourt', 'backcourt-violation', 'eight-second-violation', 'point-guard'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'the-corner',
    title: 'The Corner',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    alsoIn: ['shooting'],
    aliases: ['corner', 'the corner', 'corner three', 'corners'],
    summary:
      'Where the baseline meets the sideline, and the most valuable spot on the three-point line.',
    order: 860,
    whereItIs: `The two areas at each end of the court where the baseline meets the sideline, just outside the three-point arc.`,
    whyItMatters: `The corner three is the shortest three-point shot on the floor. The arc has to stop before it reaches the sideline, so it is closer to the basket there than at the top of the key: in the NBA the difference is over a foot and a half.

A shorter shot for the same three points makes the corner unusually efficient, and modern offences deliberately station shooters there. It is also the hardest place for a defence to help from, because a defender who leaves the corner has a long way to recover.

That combination, high value plus expensive to defend, is why drive-and-kick offences aim at it and why "corner three" is treated as a shot type in its own right.`,
    ruleDifferences: `**NBA:** 22 ft in the corner against 23 ft 9 in at the top.
**FIBA:** 6.60 m in the corner against 6.75 m elsewhere, a much smaller difference.

The NBA's larger gap is why the corner three is a more distinct strategic target there than in international basketball.`,
    related: ['corner-three', 'three-point-line', 'spacing', 'drive-and-kick'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'the-wing',
    title: 'The Wing',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['wing', 'the wing', 'wings'],
    summary: 'The area on either side of the arc between the corner and the top of the key.',
    order: 870,
    whereItIs: `On each side of the floor, outside the three-point line, roughly level with the free-throw line extended. Between the corner below it and the top of the key above it.`,
    whyItMatters: `The wing is where most half-court offence begins. It offers the widest range of options: a shot, a drive either way, a pass to the corner, a pass to the post, or an entry into a ball screen.

That flexibility is exactly why so many actions start here. A pick and roll run from the wing threatens both directions, while one run from the corner has the baseline cutting off half the floor.

"Wing" also names a **type of player**, a forward-sized perimeter player, which is a separate meaning worth keeping apart from the location.`,
    related: ['wing-player', 'pick-and-roll', 'the-corner', 'half-court'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'the-elbow',
    title: 'The Elbow',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['elbow', 'the elbow', 'elbows'],
    summary:
      'The two corners of the free-throw line, a favoured spot for passing and mid-range shooting.',
    order: 880,
    whereItIs: `The two points where the free-throw line meets the sides of the paint, forming a right angle. There is one on each side, so a play may call for "the left elbow".`,
    whyItMatters: `The elbow is a passing hub. A player receiving there can see the whole floor, is close enough to the basket to threaten a shot, and has cutters running past on both sides. Many offensive sets are built around getting a skilled passer to this spot.

It is also a classic mid-range shooting location, which is precisely why it declined with the rise of the three-pointer: an elbow jump shot is a good-looking shot worth two points.

Playing "through the elbow" usually signals an offence that relies on a big man who can pass, since the position rewards vision more than scoring.`,
    related: ['free-throw-line', 'high-post', 'mid-range-shot', 'horns'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'low-post',
    title: 'The Low Post',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['low post', 'the block', 'low block', 'on the block'],
    summary: 'The area beside the basket where a player sets up with their back to the rim.',
    order: 890,
    whereItIs: `Immediately beside the basket, along the side of the paint, at the marked **blocks**. There is a low post on each side.`,
    whyItMatters: `This is the traditional home of the centre. A player who establishes position here is a few feet from the rim, and for most of basketball's history getting the ball to them was the primary way of generating offence.

Its value has fallen for two reasons. A contested post shot is worth two points and is not easy, so it compares poorly with a three. More importantly the player standing there occupies the space modern offences want empty, and their defender is already positioned to help.

It survives as a way to attack a mismatch and as a change of pace, rather than as a system.`,
    related: ['post-up', 'high-post', 'the-paint', 'center', 'mismatch'],
  }),

  courtArea({
    ...ruleMeta,
    slug: 'high-post',
    title: 'The High Post',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['high post', 'the high post', 'top of the key'],
    summary: 'The area around the free-throw line, used more for passing than scoring.',
    order: 900,
    whereItIs: `Around the free-throw line and the top of the paint, facing the basket rather than backing into it.`,
    whyItMatters: `The high post is a vantage point. A player here faces the whole floor, sees cutters on both sides, and can shoot, drive or pass.

The distinction from the **low post** is not merely distance, it is orientation and purpose. Low post play is about scoring with your back to the basket; high post play is usually about creating for others while facing it.

Offences that run through a passing big man at the high post are a long-standing alternative to guard-dominated basketball, and the arrangement survives in modern sets like Horns.`,
    related: ['low-post', 'the-elbow', 'horns', 'ball-movement'],
  }),

  // ══ Positions ══════════════════════════════════════════════════════════════
  positionRole({
    slug: 'point-guard',
    title: 'Point Guard',
    subtitle: 'The 1',
    category: 'court-and-positions',
    aliases: ['point guard', 'pg', 'the 1', 'floor general'],
    summary: 'Usually brings the ball up and organises the offence.',
    order: 910,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Traditionally the smallest player on the floor and the best ball handler. The point guard brings the ball across halfway, calls the play the coach has signalled, and decides what the offence does with each possession.

The core skills are handling the ball under pressure, passing accurately, and reading a defence quickly enough to know which of five options is open.`,
    profile: `Historically small, quick and pass-first. Modern point guards vary enormously: some are primary scorers, some are 6 ft 8 in, and some teams field none at all in the traditional sense.`,
    whyItMatters: `The point guard usually has the ball more than anyone else, so their decisions compound. A poor decision-maker at this position turns good offensive structure into bad shots.

It is also the position most often described as an extension of the coach, because the choice of which action to run and when is made on the floor in real time.`,
    variations: `- **Combo guard.** Splits the role with scoring duties.
- **Point forward.** A taller player doing the same job.
- **Shared ball-handling.** Many modern teams distribute the responsibility rather than assigning it to one person, which is part of what **positionless basketball** means.`,
    related: ['basketball-positions', 'combo-guard', 'point-forward', 'positionless-basketball'],
  }),

  positionRole({
    slug: 'shooting-guard',
    title: 'Shooting Guard',
    subtitle: 'The 2',
    category: 'court-and-positions',
    aliases: ['shooting guard', 'sg', 'the 2', 'two guard'],
    summary: 'Typically the main perimeter scorer, working off the ball to get open.',
    order: 920,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Scoring from the perimeter, primarily by getting free without the ball: running off screens, relocating as the ball moves, and shooting on the catch.

A shooting guard is also usually asked to defend the opponent's best perimeter scorer, so the position demands two-way work more than its name suggests.`,
    profile: `Typically taller than a point guard and a better shooter, though the distinction between the two has blurred to the point where many teams simply field two interchangeable guards.`,
    variations: `- **3-and-D.** A specialist who shoots threes and defends, without needing the ball.
- **Combo guard.** Shares ball-handling with the point guard.
- **Scoring guard.** A primary option who creates their own shot off the dribble.`,
    related: ['basketball-positions', 'three-and-d', 'combo-guard', 'catch-and-shoot'],
  }),

  positionRole({
    slug: 'small-forward',
    title: 'Small Forward',
    subtitle: 'The 3',
    category: 'court-and-positions',
    aliases: ['small forward', 'sf', 'the 3', 'three'],
    summary:
      'The most generalist position: scores inside and outside and defends several positions.',
    order: 930,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `The least specialised of the five. A small forward is expected to score from distance and at the rim, rebound reasonably, and guard anyone from a guard to a power forward.

That versatility is the job. Where other positions have a defining skill, this one is defined by not having a weakness the opponent can attack.`,
    profile: `Usually around 6 ft 6 in to 6 ft 9 in, combining perimeter skill with enough size to defend bigger players. Many of the sport's best all-round players have occupied this position.`,
    whyItMatters: `As basketball moved toward switching defences and positionless lineups, the small forward's skill set became the template rather than one option among five. A team ideally wants several players who can do what a small forward does, which is why the position is sometimes said to have absorbed the others.`,
    related: ['basketball-positions', 'wing-player', 'positionless-basketball', 'switching'],
  }),

  positionRole({
    slug: 'power-forward',
    title: 'Power Forward',
    subtitle: 'The 4',
    category: 'court-and-positions',
    aliases: ['power forward', 'pf', 'the 4', 'four'],
    summary: 'Traditionally a physical player near the basket, now often a shooter.',
    order: 940,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Historically: rebounding, defending in the paint, and scoring close to the rim. A physical, interior role.

Currently: frequently the opposite. Many power forwards now play outside the three-point line, shoot, and defend on the perimeter.`,
    profile: `Large enough to hold position inside, mobile enough to defend away from the basket. The modern version increasingly needs to shoot.`,
    whyItMatters: `No position has changed more. The reason is spacing: a power forward standing near the basket occupies the area an offence wants empty, and their defender is then perfectly placed to help on drives.

Moving that player to the three-point line drags a big defender out of the paint, which opens the floor for everyone else. That is the **stretch four**, and it is now closer to the norm than the exception.`,
    variations: `- **Stretch four.** Plays outside the arc and shoots.
- **Small-ball four.** A wing playing the position in a smaller, quicker lineup.
- **Traditional four.** Still exists, particularly where a team wants rebounding and physicality.`,
    related: ['basketball-positions', 'stretch-four', 'spacing', 'big-man'],
  }),

  positionRole({
    slug: 'center',
    title: 'Center',
    subtitle: 'The 5',
    category: 'court-and-positions',
    aliases: ['center', 'centre', 'c', 'the 5', 'five'],
    summary: 'Usually the tallest player: rebounds, protects the rim and scores close in.',
    order: 950,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Defensively, the last line: contesting shots at the rim, and securing defensive rebounds so possessions actually end.

Offensively, historically the primary scorer with their back to the basket. Now more often a screener and finisher, rolling to the rim off ball screens and catching passes near the hoop.`,
    profile: `The tallest player on the floor. Whether they can move their feet on the perimeter is the single most consequential question about a modern centre, because it decides whether their team can switch ball screens.`,
    whyItMatters: `The centre determines a team's defensive scheme more than any other player. A mobile centre allows switching; an immobile one usually forces drop coverage, and opponents will attack that repeatedly.

The position has also divided in two. Some centres are traditional rim-protecting rebounders; others shoot three-pointers and defend on the perimeter, which is the **stretch five**.`,
    variations: `- **Stretch five.** Shoots from the arc.
- **Rim protector.** Defensive specialist built around shot-blocking.
- **Small-ball five.** A forward playing the position for speed and shooting, giving up size.`,
    related: [
      'basketball-positions',
      'stretch-five',
      'rim-protector',
      'drop-coverage',
      'switching',
    ],
  }),

  positionRole({
    slug: 'combo-guard',
    title: 'Combo Guard',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['combo guard', 'combo', 'hybrid guard'],
    summary: 'A guard who is neither purely a point guard nor purely a shooting guard.',
    order: 960,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Handles the ball and creates for others, but is also a primary scorer. In practice a combo guard shares point-guard duties rather than owning them.`,
    whyItMatters: `The label began slightly pejoratively, describing a player too small to guard shooting guards and not a natural enough passer to run an offence.

That has inverted. As teams moved toward sharing ball-handling among several players, a guard who can both create and score became more useful than a specialist at either. Many of the best guards in the modern game would once have been filed under this label as a criticism.`,
    related: ['point-guard', 'shooting-guard', 'positionless-basketball'],
  }),

  positionRole({
    slug: 'wing-player',
    title: 'Wing (Player)',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['wing', 'wing player', 'wings', 'perimeter player'],
    summary:
      'A forward-sized perimeter player, roughly covering the shooting guard and small forward roles.',
    order: 970,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Scores from the perimeter, defends several positions, and does neither the primary ball-handling nor the interior work.

"Wing" is a category rather than a numbered position: it describes a body type and skill set rather than a specific job, which is why teams talk about needing "another wing" without specifying a 2 or a 3.`,
    whyItMatters: `Wings are the most sought-after players in modern basketball, because switching defences need players who can guard multiple positions, and spaced offences need players who can shoot and attack a closeout. A wing does both.

Note the ambiguity: **the wing** is also an area of the floor. Context distinguishes them, but they are unrelated meanings.`,
    related: ['the-wing', 'small-forward', 'three-and-d', 'switching'],
  }),

  positionRole({
    slug: 'big-man',
    title: 'Big Man',
    category: 'court-and-positions',
    aliases: ['big man', 'big', 'bigs', 'frontcourt player'],
    summary: 'General term for a power forward or centre.',
    order: 980,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Rebounding, screening, finishing near the rim and protecting it defensively. "Bigs" is simply the collective term for the two largest positions.`,
    whyItMatters: `The word has survived a period in which the job changed completely. A big man in 1990 was expected to score with his back to the basket and stay near the rim; many now shoot three-pointers and defend on the perimeter.

What has not changed is that games are still substantially decided by who controls the area near the basket, which is why teams that go small often still concede rebounds and points in the paint.`,
    related: ['center', 'power-forward', 'stretch-four', 'rebounding'],
  }),

  positionRole({
    slug: 'point-forward',
    title: 'Point Forward',
    category: 'court-and-positions',
    difficulty: 'advanced',
    aliases: ['point forward', 'playmaking forward'],
    summary: 'A forward who runs the offence in place of a point guard.',
    order: 990,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Everything a point guard does, from a much larger body: bringing the ball up, organising the offence and creating shots for teammates.`,
    whyItMatters: `Height changes what a playmaker can see and do. A 6 ft 8 in ball handler passes over a defence rather than around it, cannot be pressured in the same way by a smaller defender, and creates a mismatch immediately if the defence switches a guard onto them.

It also frees the other guard positions. A team using a point forward can field two scoring guards without losing playmaking, which is a roster advantage rather than merely a stylistic choice.`,
    related: ['point-guard', 'positionless-basketball', 'mismatch', 'small-forward'],
  }),

  positionRole({
    slug: 'stretch-four',
    title: 'Stretch Four',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['stretch four', 'stretch 4', 'shooting big'],
    summary:
      'A power forward who shoots from the three-point line, pulling a big defender out of the paint.',
    order: 1000,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Play the power forward position while operating mostly outside the arc. Shoot on the catch, attack closeouts, and set ball screens that end in a pop rather than a roll.`,
    whyItMatters: `The value is almost entirely in what it does to the **defence**. A power forward's defender is typically a large player who would otherwise be stationed near the basket, exactly where they are most useful helping on drives. Move that forward to the arc and their defender has to follow, and the paint empties.

That is why a stretch four's shooting percentage matters even on nights they take few shots: the threat alone changes where five defenders can stand.`,
    variations: `- **Stretch five.** The same idea applied to the centre, which empties the paint even further.
- **Pick and pop.** The action that most directly exploits a shooting big.`,
    related: ['power-forward', 'stretch-five', 'spacing', 'pick-and-pop'],
  }),

  positionRole({
    slug: 'stretch-five',
    title: 'Stretch Five',
    category: 'court-and-positions',
    difficulty: 'advanced',
    aliases: ['stretch five', 'stretch 5', 'shooting center', 'pick and pop center'],
    summary: 'A centre who shoots three-pointers, which empties the paint entirely.',
    order: 1010,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Play centre while spending much of the possession outside the arc, and still rebound and defend the rim at the other end.`,
    whyItMatters: `This is the most extreme version of spacing. The opposing centre is usually a team's best rim protector, and dragging them to the three-point line removes the single biggest obstacle to driving.

The cost is at the other end. A centre built to shoot is not always a centre built to protect the rim or rebound, and teams frequently trade defensive strength for offensive space. Players who genuinely do both are rare and priced accordingly.`,
    related: ['center', 'stretch-four', 'spacing', 'rim-protection', 'five-out-offense'],
  }),

  positionRole({
    slug: 'three-and-d',
    title: '3-and-D Player',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['3 and d', '3-and-d', 'three and d', '3&d'],
    summary: 'A specialist who shoots three-pointers and defends, without needing the ball.',
    order: 1020,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Two jobs, done reliably: make open three-pointers, and defend the opponent's better perimeter players. Explicitly **not** creating shots off the dribble.`,
    whyItMatters: `The role exists because of how modern offences work. A team with one or two players who dominate the ball needs the other three to be useful **without** it, and a player who spaces the floor and guards well is exactly that.

It is the clearest example of basketball valuing fit over raw ability. A 3-and-D player may have a modest scoring average and still be among the most sought-after in the league, because they make the players around them better without needing possessions of their own.`,
    related: ['catch-and-shoot', 'spacing', 'wing-player', 'switching'],
  }),

  tactic({
    slug: 'rim-protection',
    title: 'Rim Protection',
    category: 'defense',
    alsoIn: ['court-and-positions'],
    difficulty: 'intermediate',
    aliases: ['rim protection', 'rim protector', 'protecting the rim', 'shot blocking'],
    summary: 'Deterring and contesting shots at the basket, mostly without blocking them.',
    order: 1030,
    sourceKeys: [{ key: 'wp-basketball' }],
    howItWorks: `A rim protector positions themselves between the attacker and the basket, stays vertical, and contests the shot without fouling. Blocks are the visible part; deterrence is the larger part.

Verticality matters legally as well as technically. A defender who jumps straight up with arms raised is entitled to that space, and contact from an attacker jumping into them is the attacker's foul. A defender who leans forward is fouling.`,
    whyItMatters: `Shots at the rim are the most efficient in basketball, so preventing them is the highest-value defensive act available. A strong rim protector changes the arithmetic of the whole defence: teammates can pressure the ball harder knowing there is help behind them.

The largest effect does not appear in the box score at all. Attackers who see a shot-blocker waiting will pull up short, pass out, or take a worse shot, and none of that is recorded anywhere. It is the clearest example of basketball's statistics missing defence.`,
    counters: `- **Draw them out** with a stretch big, so they are not near the rim at all.
- **Attack in transition** before they get back.
- **Draw fouls** on them, since a rim protector in foul trouble cannot contest freely.
- **Shoot over the top**, which is why teams that cannot shoot struggle badly against good rim protection.`,
    related: ['center', 'goaltending', 'drop-coverage', 'blocks', 'defensive-rating'],
  }),

  tactic({
    slug: 'positionless-basketball',
    title: 'Positionless Basketball',
    category: 'court-and-positions',
    difficulty: 'intermediate',
    aliases: ['positionless', 'positionless basketball', 'position-less'],
    summary:
      'Selecting players by what they can do rather than by which of the five positions they fill.',
    order: 1040,
    sourceKeys: [{ key: 'wp-positions' }],
    howItWorks: `A positionless team fields five players who can each do several jobs, rather than one specialist per position. Ball-handling is shared, several players can shoot, and defenders can guard multiple positions.

It does not mean the jobs disappear. Somebody still brings the ball up and somebody still guards the biggest opponent. What disappears is the assumption that it must be the same person every possession.`,
    whyItMatters: `Two forces produced it. **Spacing** made a non-shooting big man costly, and **switching** defences required players who could guard more than one position. Both reward versatility and punish specialisation.

The practical consequence is in how teams are built. Rosters are now assembled around skills, defensive versatility, shooting, secondary playmaking, rather than around filling five slots, and a player who does one thing superbly and nothing else has become harder to play.`,
    misunderstandings: `**"Positions no longer exist."** They remain useful shorthand for size and starting location, and every lineup card still lists them.

**"It means everyone does everything equally."** No. It means roles are assigned by ability rather than by label, which usually produces more specialisation in practice, not less: it is simply specialisation in skills rather than in positions.`,
    related: ['basketball-positions', 'switching', 'spacing', 'stretch-five', 'point-forward'],
  }),

  // ══ Violations ═════════════════════════════════════════════════════════════
  officiating({
    ...ruleMeta,
    slug: 'carrying',
    title: 'Carrying',
    category: 'fouls-and-violations',
    aliases: ['carrying', 'palming', 'carry', 'palm'],
    summary: 'Letting the ball come to rest in your hand during a dribble.',
    order: 1050,
    howItWorks: `A dribble requires the ball to be batted or pushed toward the floor. If the hand gets underneath the ball and it comes to rest there, the dribble has ended, and continuing to dribble is a violation.

The usual picture is a player turning their hand sideways or underneath during a crossover so that the ball briefly sits in the palm. Play stops and the other team takes the ball from the sideline.`,
    whyItMatters: `It is one of the least consistently called violations in professional basketball. Modern handle relies on wide, low crossovers where the hand travels a long way round the ball, and where exactly a legal push becomes an illegal rest is a judgement made at speed.

The practical effect is that professional dribbling looks illegal to anyone who learned the rule strictly, which is a frequent source of complaint rather than a change in the rule itself.`,
    misunderstandings: `**"Carrying is when the hand goes under the ball."** Not by itself. The test is whether the ball came to **rest**. A hand can travel briefly under the ball during a legal crossover.

**"It's the same as a double dribble."** No, though the penalty is identical. Carrying ends the dribble illegally; a double dribble starts a second one.`,
    related: ['double-dribble', 'traveling', 'ankle-breaker'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'backcourt-violation',
    title: 'Backcourt Violation',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['backcourt violation', 'over and back', 'back court'],
    summary: 'Returning the ball to your own half after establishing it in the frontcourt.',
    order: 1060,
    howItWorks: `Once a team has established the ball in the frontcourt, it may not send it back across the halfway line. Doing so gives possession to the opponent from the sideline.

Establishing the frontcourt requires the ball **and both feet** of the player controlling it to be over the line. This is why a player straddling the line with one foot back can still legally pass backwards.

It does not apply if the defence knocks the ball back, or on a throw-in in most situations.`,
    whyItMatters: `Together with the eight-second rule, it stops a team retreating. An offence that has crossed halfway has committed to attacking, and a defence can therefore press knowing the attacking team has only half the floor to work with.

It also creates a specific trap. Defences pressure ball handlers who are standing near the halfway line, because a single backward step is a turnover with no contact required.`,
    misunderstandings: `**"He was on the line, so it's a violation."** The line belongs to the backcourt. A player with a foot on it has not yet established the frontcourt, so passing back is legal.

**"Any pass backwards is a backcourt violation."** Only across the halfway line. Passing backwards within the frontcourt is entirely normal.`,
    related: ['frontcourt', 'backcourt', 'eight-second-violation', 'full-court-press'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'shot-clock-violation',
    title: 'Shot Clock Violation',
    category: 'fouls-and-violations',
    aliases: ['shot clock violation', 'shot clock', '24 second violation'],
    summary: 'Failing to get a shot to hit the rim before the shot clock expires.',
    order: 1070,
    howItWorks: `A team must attempt a shot that **hits the rim** before the shot clock reaches zero. Two conditions, both required: the ball must leave the shooter's hands before the buzzer, and it must then touch the ring.

A shot released in time that misses everything is still a violation, which is why a desperate heave at the buzzer is aimed at the rim rather than simply thrown up.

The penalty is a turnover: the other team takes the ball from the sideline.`,
    whyItMatters: `The threat of it shapes the last seconds of every possession. Offences run their primary action early and keep a fallback, usually an isolation, for the final few seconds, because a bad shot is better than a violation: a shot at least has a chance and may produce an offensive rebound.

Defences invert this. Late in the clock they will concede a contested two-point shot happily, because the alternative for the offence is handing the ball over for nothing.`,
    ruleDifferences: `24 seconds in the NBA, FIBA and the WNBA; 30 in NCAA basketball; 12 in 3x3.

The **reset** rules also matter: after an offensive rebound the clock resets to 14 rather than 24 in the NBA, FIBA and WNBA.`,
    related: ['shot-clock', 'possession', 'isolation'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'three-second-violation',
    title: 'Three-Second Violation',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['three seconds', '3 seconds', 'three second violation', 'defensive three seconds'],
    summary:
      'Standing in the paint too long, which applies to attackers everywhere and defenders only in the NBA.',
    order: 1080,
    howItWorks: `**Offensive three seconds** applies everywhere. An attacking player may not remain in the paint for more than three consecutive seconds while their team has the ball in the frontcourt. The count resets if they leave, or if a shot goes up.

**Defensive three seconds** applies in the NBA. A defender may not remain in the paint for more than three seconds unless they are actively guarding an opponent within arm's length.

The penalties differ. An offensive violation is a turnover. A defensive violation gives the attacking team one free throw and the ball.`,
    whyItMatters: `The offensive rule stops a large player simply camping under the basket, which would make the paint impassable and the game static.

The defensive rule, where it applies, is arguably more consequential. Without it a team can station its best rim protector in the paint permanently, which is exactly what international defences do. With it, that defender must keep moving out and back, and driving lanes open up.

This single rule is a significant part of why NBA and FIBA basketball look different.`,
    ruleDifferences: `- **NBA:** both offensive and defensive three seconds.
- **FIBA, NCAA, WNBA:** offensive three seconds only. There is no defensive three-second rule.

This is one of the most consequential differences between NBA and international basketball, and it is why a centre who is unplayable in the NBA can be highly effective in EuroLeague.`,
    related: ['the-paint', 'zone-defense', 'rim-protection', 'nba-vs-fiba-rules'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'eight-second-violation',
    title: 'Eight-Second Violation',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['eight seconds', '8 seconds', 'eight second violation', 'ten seconds'],
    summary: 'Failing to advance the ball out of your own half within eight seconds.',
    order: 1090,
    howItWorks: `A team gaining possession in its backcourt has eight seconds to get the ball into the frontcourt. Failing to do so is a turnover.

The count runs from when the team gains control, and stops when the ball and both feet of the ball handler are over the halfway line.`,
    whyItMatters: `It is what makes a **full-court press** viable. Without a time limit, a pressed team could simply pass the ball around its own half indefinitely until the pressure relaxed. With one, the press has a clock working for it, and every second spent trapped is a second closer to a free turnover.

It also stops teams from using the backcourt to run down the game clock.`,
    ruleDifferences: `Eight seconds in the NBA, FIBA and the WNBA.

**NCAA men's basketball uses ten seconds**, and the NBA itself used ten until 2001. Older footage will show the longer count.`,
    related: ['backcourt', 'full-court-press', 'backcourt-violation', 'shot-clock'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'five-second-violation',
    title: 'Five-Second Violation',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['five seconds', '5 seconds', 'five second violation', 'inbound violation'],
    summary:
      'Taking more than five seconds to inbound the ball, or being closely guarded without acting.',
    order: 1100,
    howItWorks: `Two separate situations share the name.

**Throw-in.** A player taking the ball in from out of bounds has five seconds to release the pass. Failing to do so hands possession to the other team.

**Closely guarded.** A player holding the ball while a defender is within about a metre must pass, shoot or dribble within five seconds.

Both end in a turnover.`,
    whyItMatters: `The throw-in count is the reason denying the inbound pass is a real defensive tactic, particularly at the end of games. A defence that takes away every passing option for five seconds wins the ball without touching it.

The closely-guarded rule prevents a player simply holding the ball to burn clock while being pressured.`,
    ruleDifferences: `The five-second throw-in count is universal.

The **closely-guarded** count differs. FIBA applies it to a player holding **or dribbling** the ball; the NBA's equivalent is narrower and applies mainly in the frontcourt below the free-throw line extended. NCAA rules differ again.`,
    related: ['out-of-bounds', 'full-court-press', 'shot-clock'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'basket-interference',
    title: 'Basket Interference',
    category: 'fouls-and-violations',
    difficulty: 'advanced',
    aliases: ['basket interference', 'interference', 'cylinder'],
    summary: 'Touching the ball or the rim while the ball is on or directly above the hoop.',
    order: 1110,
    howItWorks: `Distinct from goaltending, though the two are usually discussed together. Basket interference covers:

- Touching the ball while it is on the rim or in the imaginary cylinder directly above the hoop.
- Touching the rim or net while the ball is on or in it.
- Reaching up through the basket from below and touching the ball.

If a **defender** does it, the basket counts. If an **attacker** does it, the basket is cancelled and the defence gets the ball.`,
    ruleDifferences: `This is the sharpest rule difference in the sport.

**Under FIBA rules the ball is live once it has touched the rim.** A defender may knock it away off the ring, and an attacker may tip it in. Neither is a violation.

**Under NBA rules both are basket interference.** The cylinder above the rim is protected.

The result is that identical plays are legal at the Olympics and violations in the NBA. The NCAA follows the NBA on this point.`,
    misunderstandings: `**"It's the same as goaltending."** Related but different. Goaltending is about a shot on its way **down**; basket interference is about the ball at the rim itself.

**"Hanging on the rim is basket interference."** Only if the ball is on or in the basket at the time. Otherwise it is a technical foul at most.`,
    related: ['goaltending', 'nba-vs-fiba-rules', 'dunk'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'kick-ball',
    title: 'Kicked Ball',
    category: 'fouls-and-violations',
    aliases: ['kick ball', 'kicked ball', 'kicking'],
    summary: 'Deliberately striking the ball with the leg or foot.',
    order: 1120,
    howItWorks: `Deliberately kicking the ball or striking it with any part of the leg is a violation. Play stops and the ball is awarded to the other team, with the shot clock reset in some situations.

The word doing the work is **deliberately**. The ball hitting a defender's foot accidentally, which happens constantly in passing lanes, is not a violation and play continues.`,
    whyItMatters: `The rule exists to keep basketball a game played with the hands. Without it, a defender could simply block passing lanes with their feet.

Judging intent is the difficulty. Referees look at whether the leg moved toward the ball, which is why a defender whose foot is struck while standing still is usually given the benefit and one who lunges is not.`,
    related: ['possession', 'shot-clock'],
  }),

  // ══ Fouls ══════════════════════════════════════════════════════════════════
  officiating({
    ...ruleMeta,
    slug: 'personal-foul',
    title: 'Personal Foul',
    category: 'fouls-and-violations',
    aliases: ['personal foul', 'personal', 'pf', 'common foul'],
    summary: 'Illegal contact with an opponent, recorded against the player who committed it.',
    order: 1130,
    howItWorks: `The basic foul: illegal contact that impedes an opponent. Holding, pushing, illegal use of hands, and running into a player who has legal position all qualify.

What follows depends on the situation. If the fouled player was shooting, free throws. If not, the ball from the sideline, unless the fouling team is in the **bonus**, in which case free throws anyway.

Every personal foul is recorded twice: against the player, toward disqualification, and against the team, toward the bonus.`,
    whyItMatters: `The dual counting is what makes fouls strategic rather than merely punitive. A defender must weigh aggression against their own foul count and their team's, and both counters run all game.

Not all contact is a foul. Basketball tolerates a great deal of incidental contact, and the threshold rises in the closing minutes of tight games, which is why commentators talk about officials "letting them play".`,
    ruleDifferences: `**Six** personal fouls disqualify a player in the NBA; **five** in FIBA, the WNBA and the NCAA. That extra foul meaningfully changes how aggressively an NBA defender can play.`,
    related: ['fouls', 'fouling-out', 'bonus', 'team-fouls', 'shooting-foul'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'shooting-foul',
    title: 'Shooting Foul',
    category: 'fouls-and-violations',
    aliases: ['shooting foul', 'foul on the shot', 'and one'],
    summary: 'A foul committed against a player in the act of shooting, which awards free throws.',
    order: 1140,
    howItWorks: `Contact against a player who is shooting. What is awarded depends on where they shot from and whether it went in:

- **Missed two-pointer:** two free throws.
- **Missed three-pointer:** three free throws.
- **Made shot:** the basket counts plus one free throw. This is an **and-one**.

"In the act of shooting" extends from the start of the upward shooting motion until the ball is released and the player has returned to the floor, which is why late contact still draws the call.`,
    whyItMatters: `Free throws are the most efficient shot in basketball, so drawing shooting fouls is a skill players cultivate deliberately.

It also produces the four-point play, the rarest common scoring event: a made three-pointer plus a free throw.

Attackers have learned to initiate contact to draw these calls, and rule changes in several competitions have targeted the most obvious versions, such as jumping sideways into a defender.`,
    related: ['free-throw', 'and-one', 'fouls', 'bonus'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'offensive-foul',
    title: 'Offensive Foul',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['offensive foul', 'charge', 'illegal screen', 'player control foul'],
    summary:
      'A foul committed by the team with the ball, which loses them possession and gives no free throws.',
    order: 1150,
    howItWorks: `Illegal contact by an attacking player. The two common kinds are **charging**, running into a defender who has legal position, and an **illegal screen**, where the screener moves into the defender rather than standing still.

The penalty is distinctive: **no free throws**, and the attacking team loses the ball. It is recorded as a personal foul against the player and, in most competitions, does not count toward the team foul total in the same way.`,
    whyItMatters: `An offensive foul is a double loss. The attacking team gives up the possession they were in the middle of using, and their player carries another foul.

That makes drawing one among the most valuable defensive plays available. It is also why an illegal screen call is so damaging: a possession that had created an advantage ends with nothing.`,
    related: ['charging', 'charge-vs-block', 'screen', 'personal-foul'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'charging',
    title: 'Charging',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['charge', 'charging', 'player control foul', 'offensive charge'],
    summary: 'An attacker running into a defender who had already established legal position.',
    order: 1160,
    howItWorks: `The attacker with the ball makes contact with a defender who got to the spot first, was facing them, and was stationary or moving backwards.

It is an offensive foul: no free throws, and the ball goes to the defending team.

The defender must not be inside the **restricted area** under the basket, where a charge cannot be drawn against a player driving to the rim.`,
    whyItMatters: `Taking a charge is one of the few defensive plays that produces a turnover without needing to touch the ball, and it also adds a foul to an opponent.

It is also physically unpleasant and requires a defender to accept being run into, which is why it is treated as a marker of defensive commitment rather than skill.`,
    misunderstandings: `**"He fell over, so it's a charge."** Falling proves nothing. Players flop deliberately, and officials are instructed to judge position rather than reaction.

**"The defender was moving, so it can't be a charge."** Moving backwards or sideways is fine. Only moving **into** the contact makes it a block.`,
    related: ['charge-vs-block', 'blocking-foul', 'restricted-area', 'offensive-foul'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'blocking-foul',
    title: 'Blocking Foul',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['blocking foul', 'block', 'blocking'],
    summary: 'A defender impeding an attacker without having established legal position first.',
    order: 1170,
    howItWorks: `The mirror image of charging. The defender was still moving into the attacker's path, arrived late, was not facing them, or was standing in the restricted area.

It is a defensive personal foul, and the attacker shoots free throws if they were in the act of shooting.

Note the vocabulary trap: a **blocking foul** is illegal defence, while a **block** is a legally deflected shot. They are unrelated despite the shared word.`,
    whyItMatters: `Charge or block is the single highest-swing judgement in officiating: the same collision either takes the ball from the attacking team or gives them two free throws plus a foul on the defender.

That is why it is reviewed so often and argued about so much: the margin between the two is a fraction of a second and a few inches of foot position.`,
    related: ['charge-vs-block', 'charging', 'restricted-area', 'blocks'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'technical-foul',
    title: 'Technical Foul',
    category: 'fouls-and-violations',
    aliases: ['technical foul', 'technical', 't', 'tech'],
    summary:
      'A foul for conduct rather than contact: dissent, unsporting behaviour or a procedural breach.',
    order: 1180,
    howItWorks: `Awarded for behaviour rather than for contact. Common causes are arguing with officials, taunting an opponent, hanging on the rim unnecessarily, and administrative breaches such as having too many players on the floor.

The opposing team gets one free throw, and in most competitions also retains or receives possession. Coaches can be given technical fouls too.

**Two technical fouls means ejection**, in every major competition.`,
    whyItMatters: `Technicals are cheap points and they arrive at the worst moments, because they are usually earned when a player or coach is frustrated, which correlates with the game already going badly.

The two-and-out rule also gives officials a graduated response: a first technical is a warning with a price attached, rather than a choice between doing nothing and ejecting somebody.`,
    ruleDifferences: `Whether the free throw is accompanied by possession, and how technicals accumulate toward suspensions across a season, differ between the NBA, FIBA and the NCAA.`,
    related: ['flagrant-foul', 'personal-foul', 'fouls'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'flagrant-foul',
    title: 'Flagrant Foul',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['flagrant foul', 'flagrant', 'unsportsmanlike foul', 'flagrant 1', 'flagrant 2'],
    summary: 'Excessive or unnecessary contact, penalised more heavily than an ordinary foul.',
    order: 1190,
    howItWorks: `Contact judged unnecessary, excessive, or not a legitimate attempt to play the ball. The NBA grades it:

- **Flagrant 1:** unnecessary contact. Two free throws and possession.
- **Flagrant 2:** unnecessary **and** excessive. Two free throws, possession, and immediate ejection.

FIBA uses **unsportsmanlike** and **disqualifying** fouls for the same purpose.

The penalty is deliberately severe because both free throws **and** possession are awarded, which is otherwise rare.`,
    whyItMatters: `The category exists chiefly for player safety. Basketball's ordinary fouls are cheap enough that, without this, deliberately fouling a player in the air on a fast break would be a rational tactic.

Making that outcome cost two points and the ball removes the incentive entirely.`,
    ruleDifferences: `The NBA's two-tier flagrant system and FIBA's unsportsmanlike/disqualifying pair cover the same ground with different names and slightly different thresholds. The NCAA uses its own flagrant categories again.`,
    related: ['technical-foul', 'personal-foul', 'fast-break'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'team-fouls',
    title: 'Team Fouls',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['team fouls', 'team foul count', 'foul count'],
    summary: 'The running count of a team’s fouls in a period, which triggers the bonus.',
    order: 1200,
    howItWorks: `Every personal foul a team commits is added to a running total for the period. Once the total passes a threshold, the team is **in the bonus** and every subsequent foul, including ones away from the ball, gives the opponent free throws.

The count resets each quarter, which is why a defence can foul relatively freely early in a period and must be careful late in it.`,
    whyItMatters: `The bonus is what makes fouling progressively more expensive as a quarter goes on, and it drives two visible late-game behaviours.

A leading team becomes cautious, avoiding contact entirely because any foul now concedes free throws. A trailing team does the opposite deliberately, fouling immediately to stop the clock and get the ball back, accepting the two points as the price.

Watching the team foul count is therefore one of the quickest ways to understand why the last two minutes look nothing like the first forty.`,
    ruleDifferences: `**FIBA:** the fifth team foul in a quarter puts the opponent in the bonus for the remainder of it.

**NBA:** its own threshold and reset arrangement, including specific provisions for the final two minutes of a period.

**NCAA:** different again, and the men's and women's games have historically differed from each other.`,
    related: ['bonus', 'personal-foul', 'free-throw', 'foul-trouble'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'bonus',
    title: 'The Bonus',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['bonus', 'in the bonus', 'penalty', 'double bonus'],
    summary:
      'The state in which every foul gives free throws, reached after enough team fouls in a period.',
    order: 1210,
    howItWorks: `Once a team's foul count for the period passes the threshold, the opponent is "in the bonus", sometimes called the penalty.

From that point, **any** defensive foul gives free throws, including fouls on a player who was nowhere near the ball. Before it, a non-shooting foul only gives the ball from the sideline.`,
    whyItMatters: `It is the mechanism that makes deliberate fouling work at the end of games. A trailing team can foul the worst free-throw shooter on the floor, concede a likely one or zero points, and get the ball back with the clock stopped.

It also removes a defensive option. Before the bonus, a defence can foul cheaply to stop a fast break or reset a broken possession. In the bonus, that costs two shots, so the defence has to actually defend.`,
    ruleDifferences: `Thresholds and reset rules vary. FIBA uses five team fouls per quarter; the NBA and NCAA use their own arrangements, and the NCAA has historically used a "one-and-one" where the second free throw is earned only by making the first, which no longer applies in the men's game.`,
    related: ['team-fouls', 'free-throw', 'fouls', 'how-you-win-a-basketball-game'],
  }),

  officiating({
    ...ruleMeta,
    slug: 'fouling-out',
    title: 'Fouling Out',
    category: 'fouls-and-violations',
    aliases: ['fouling out', 'foul out', 'disqualified', 'six fouls'],
    summary: 'Being disqualified from the game for accumulating too many personal fouls.',
    order: 1220,
    howItWorks: `A player who reaches the limit of personal fouls is disqualified for the rest of the game and may not return, including in overtime.

The limit is **six** in the NBA and **five** in FIBA, the WNBA and the NCAA.`,
    whyItMatters: `It puts a hard ceiling on how aggressively a player can defend, and it makes fouls an asset to be managed rather than simply avoided.

The strategic consequences run well ahead of the actual disqualification. A key player with four fouls in the third quarter is often rested to preserve them for the finish, so the opponent has gained an advantage without that player fouling again.

Offences hunt this deliberately, attacking a player in foul trouble to force either another foul or a substitution.`,
    ruleDifferences: `Six in the NBA, five everywhere else that matters. Since players cannot return, a five-foul limit makes physical defence noticeably riskier internationally.`,
    related: ['foul-trouble', 'personal-foul', 'substitutions', 'overtime'],
  }),

  tactic({
    slug: 'foul-trouble',
    title: 'Foul Trouble',
    category: 'fouls-and-violations',
    difficulty: 'intermediate',
    aliases: ['foul trouble', 'in foul trouble', 'picking up fouls'],
    summary:
      'Having enough fouls early that a player’s availability for the rest of the game is at risk.',
    order: 1230,
    sourceKeys: [{ key: 'fiba-rules' }, { key: 'nba-rulebook' }],
    howItWorks: `A player is in foul trouble when their foul count is high relative to how much of the game remains: two fouls in the first quarter, or four by early in the third.

Coaches typically respond by substituting them, resting them until later, and reintroducing them for the closing minutes.`,
    whyItMatters: `The cost is paid whether or not the player fouls again. Benching your best defender for twenty minutes to protect them from disqualification is itself a substantial loss, which is why drawing fouls on key opponents is a deliberate tactic rather than a byproduct.

There is a genuine strategic argument here that coaches disagree about. Benching a star to avoid disqualification guarantees they miss minutes; playing on risks them missing more. Some analysts argue coaches are too cautious, since a player who fouls out in the fourth quarter has at least played until then.`,
    related: ['fouling-out', 'personal-foul', 'substitutions', 'mismatch'],
  }),

  positionRole({
    slug: 'rim-protector',
    title: 'Rim Protector',
    category: 'court-and-positions',
    alsoIn: ['defense'],
    difficulty: 'intermediate',
    aliases: ['rim protector', 'shot blocker', 'anchor', 'defensive anchor'],
    summary:
      'A defender, usually the centre, whose job is to deter and contest shots at the basket.',
    order: 1035,
    sourceKeys: [{ key: 'wp-positions' }],
    responsibilities: `Guard the most valuable area on the floor. A rim protector stays between attackers and the basket, contests shots without fouling, and secures the defensive rebound so the possession actually ends.

The role also involves communication: the rim protector can see the whole floor and is usually the player calling out screens and rotations behind them.`,
    profile: `Height and length matter, but timing and discipline matter more. A defender who leaves the floor early or reaches in concedes free throws instead of contesting shots, which is worse than not contesting at all.

The other requirement is mobility, because a rim protector who cannot defend a ball screen forces their team into drop coverage whether it suits them or not.`,
    whyItMatters: `Shots at the rim are the most efficient in basketball, so the player who prevents them has the highest-leverage defensive job on the floor.

Their largest contribution is invisible in the box score. Attackers who see a rim protector waiting pull up short, pass out or take a worse shot, and none of that is recorded. Blocks capture only the fraction of the work that ends in contact with the ball, which is why opponents' shooting percentage at the rim is a better measure than block totals.`,
    variations: `- **Traditional anchor.** Sits near the basket in drop coverage; requires no perimeter mobility.
- **Switchable big.** Protects the rim and can also defend a guard after a switch, which is far rarer and more valuable.`,
    misunderstandings: `**"Blocks measure rim protection."** They measure a small and gamble-friendly part of it. Deterrence is larger and unrecorded.

**"A block is always good."** A shot swatted out of bounds returns the ball to the offence. Controlling it is worth far more.`,
    related: ['rim-protection', 'center', 'goaltending', 'drop-coverage', 'blocks'],
  }),
];
