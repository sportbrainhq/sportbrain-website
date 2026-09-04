import {
  definition,
  format,
  positionRole,
  rule,
  standard,
  statistic,
  tactic,
} from './american-football-explainer-helpers';
import type { ExplainerSeed, SourceSeed } from './explainer-types';

/**
 * The written American football explainers: a complete beginner spine plus a
 * curated sample proving the pattern extends to every remaining category.
 *
 * These override the taxonomy placeholders in
 * `american-football-explainer-taxonomy.ts` by slug. Anything left as a
 * placeholder stays a draft and never reaches the site.
 *
 * ## What is fully written, and why
 *
 * Categories 1 and 2 (Start Here, Downs & Yards) are written in full: 15 and
 * 14 explainers respectively, because the brief calls Downs & Yards the most
 * important beginner category and a reader who does not have downs cannot
 * follow anything else in the library. Scoring adds the six plays a beginner
 * actually needs (touchdown, field goal, extra point, two-point conversion,
 * safety, and the strategic question of when to go for two) rather than the
 * brief's full fourteen.
 *
 * Past that, one explainer is written per remaining major category: a
 * position (Quarterback), a coverage shell (Cover 2), a penalty (Holding),
 * a draft concept (NFL Draft Explained), a clock-management concept
 * (Two-Minute Warning), and an advanced analytics concept (EPA Explained),
 * plus a handful of adjacent concepts each of those needed to make sense on
 * their own (Cover 3 next to Cover 2; Pass Interference and Roughing the
 * Passer next to Holding; Fumble next to Interception). This is a sample
 * proving the taxonomy and the templates generalise, not a first draft of
 * every category.
 *
 * ## On "Overview = what exists, Explainers = how it works"
 *
 * `american-football-overview.ts` already says what a down is, what
 * touchdown and field goal are worth, and what a quarterback does, in one or
 * two sentences. Nothing below restates those definitions as an
 * introduction. Each explainer goes to the mechanism the Overview
 * deliberately left out: how the four-down count is reset, why a missed
 * two-point try costs exactly as much as a made one gains, why a Cover 2
 * shell asks a cornerback to play a route he can see the whole time.
 *
 * ## On rule facts
 *
 * Every rule-sensitive explainer here describes mechanics that are stable
 * features of the NFL rulebook: the four-down system, the six-point
 * touchdown, the 3-point field goal, the 1-point/2-point try, the safety,
 * defensive holding and pass interference as covered infractions, roughing
 * the passer, the two-minute warning, and the current NFL overtime format
 * (adopted 2022, guaranteeing both teams a possession in the postseason
 * unless the first team scores a touchdown). Numeric penalty yardages and
 * down/distance consequences are the current NFL rulebook values as of this
 * writing; nothing here asserts a specific season, score, play or date from
 * a real game. Where college and NFL rules diverge (overtime, the
 * two-minute warning) that is stated explicitly rather than left implicit.
 *
 * ## On analytics metrics
 *
 * EPA, CPOE and win probability are explicitly labelled as derived,
 * provider-built models rather than official NFL statistics: no league
 * office publishes an authoritative EPA figure, and different analytics
 * providers (nflfastR, ESPN, PFF, ...) build slightly different versions
 * from the same play-by-play data. That distinction is carried through the
 * `statistic()` helper's `isDerived` flag rather than asserted inconsistently
 * per article.
 */

export const AMERICAN_FOOTBALL_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'wp-american-football',
    provider: 'wikipedia',
    title: 'American football',
    url: 'https://en.wikipedia.org/wiki/American_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-down-gridiron',
    provider: 'wikipedia',
    title: 'Down (gridiron football)',
    url: 'https://en.wikipedia.org/wiki/Down_(gridiron_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-forward-pass',
    provider: 'wikipedia',
    title: 'Forward pass',
    url: 'https://en.wikipedia.org/wiki/Forward_pass',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-touchdown',
    provider: 'wikipedia',
    title: 'Touchdown',
    url: 'https://en.wikipedia.org/wiki/Touchdown',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-field-goal',
    provider: 'wikipedia',
    title: 'Field goal',
    url: 'https://en.wikipedia.org/wiki/Field_goal',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-safety-score',
    provider: 'wikipedia',
    title: 'Safety (gridiron football score)',
    url: 'https://en.wikipedia.org/wiki/Safety_(gridiron_football_score)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-two-point-conversion',
    provider: 'wikipedia',
    title: 'Two-point conversion',
    url: 'https://en.wikipedia.org/wiki/Two-point_conversion',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-quarterback',
    provider: 'wikipedia',
    title: 'Quarterback',
    url: 'https://en.wikipedia.org/wiki/Quarterback',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-zone-defense',
    provider: 'wikipedia',
    title: 'Zone defense in American football',
    url: 'https://en.wikipedia.org/wiki/Zone_defense_in_American_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-holding',
    provider: 'wikipedia',
    title: 'Holding (American football)',
    url: 'https://en.wikipedia.org/wiki/Holding_(American_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pass-interference',
    provider: 'wikipedia',
    title: 'Pass interference',
    url: 'https://en.wikipedia.org/wiki/Pass_interference',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-roughing-passer',
    provider: 'wikipedia',
    title: 'Roughing the passer',
    url: 'https://en.wikipedia.org/wiki/Roughing_the_passer',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nfl-draft',
    provider: 'wikipedia',
    title: 'NFL draft',
    url: 'https://en.wikipedia.org/wiki/NFL_draft',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-two-minute-warning',
    provider: 'wikipedia',
    title: 'Two-minute warning',
    url: 'https://en.wikipedia.org/wiki/Two-minute_warning',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-overtime-nfl',
    provider: 'wikipedia',
    title: 'Overtime (sports)',
    url: 'https://en.wikipedia.org/wiki/Overtime_(sports)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-expected-points',
    provider: 'wikipedia',
    title: 'Expected points',
    url: 'https://en.wikipedia.org/wiki/Expected_points',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'nfl-rulebook',
    provider: 'nfl',
    title: 'NFL Rulebook',
    url: 'https://operations.nfl.com/the-rules/nfl-video-rulebook/',
    license: 'NFL',
  },
];

const GENERAL = [{ key: 'wp-american-football' }];
const RULEBOOK = [{ key: 'nfl-rulebook' }];

export const AMERICAN_FOOTBALL_EXPLAINERS: ExplainerSeed[] = [
  // ══ Start Here ═══════════════════════════════════════════════════════════════
  standard({
    slug: 'american-football-in-5-minutes',
    title: 'American Football in 5 Minutes',
    category: 'start-here',
    aliases: ['american football basics', 'football for beginners', 'intro to american football'],
    summary:
      "Two teams try to advance a ball into the other team's end zone to score, using four downs at a time.",
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    sourceKeys: GENERAL,
    explanation: `American football is played by two teams of eleven, on a 100-yard field with an end zone at each end. One team has the ball (the offense) and tries to advance it toward the opponent's end zone; the other team (the defense) tries to stop them.

The offense gets four attempts, called downs, to move the ball 10 yards. Succeed, and the count resets with a fresh set of four downs. Fail, and possession usually passes to the other team. Whoever scores more points by the end of the game wins.`,
    howItWorks: `A game is 60 minutes, split into four 15-minute quarters. Play stops constantly: after every tackle, incomplete pass, score, or player going out of bounds, the ball is reset and the next down begins.

Each play starts with a **snap**: the center passes the ball backward to the quarterback (or a player in the backfield), and both teams' 11 players line up facing each other across the **line of scrimmage**, an imaginary line at the ball's position.

From there, the offense either runs the ball (hands it to a player who tries to gain yards on the ground) or passes it (the quarterback throws it downfield to a receiver). Scoring happens by carrying or catching the ball in the end zone for a touchdown (6 points), or by kicking it through the goalposts for a field goal (3 points).`,
    example: `A team starts a drive at its own 25-yard line. 1st down, 10 yards to go: a run gains 4 yards. 2nd down, 6 yards to go: a pass gains 12 yards, past the line to gain. That is a new first down, and the count resets to 1st & 10 from the new spot.

Keep succeeding like that and the team eventually reaches the end zone for a touchdown. Fail to gain 10 yards across four downs, and the ball typically goes to the other team at that spot (teams usually punt away on 4th down rather than risk that).`,
    whyItMatters: `The four-down structure is what makes football look like a series of discrete plays rather than a continuous game like soccer or basketball. Every down is its own small decision: run or pass, aggressive or safe, and the down-and-distance situation (1st & 10, 3rd & 1, 4th & 15) tells you exactly what pressure the offense is under before the play even starts.

Understanding downs is the single most important skill for following a broadcast, because the score graphic on every play names the down and distance first.`,
    misunderstandings: `**The clock does not run continuously.** Unlike soccer, the game clock stops frequently, which is why an NFL game listed as 60 minutes takes about three hours to play.

**Not every play is a big gain.** Most plays gain a handful of yards or fewer; long touchdown plays are the exception, not the rule.

**Both teams do not play both ways.** Almost every NFL player plays exclusively offense, defense, or special teams; unlike some other sports, there is no expectation that a single player does everything.`,
    related: [
      'how-american-football-works',
      'what-are-downs',
      'how-scoring-works',
      'american-football-field-explained',
      'american-football-positions-explained',
    ],
  }),

  standard({
    slug: 'how-american-football-works',
    title: 'How American Football Works',
    category: 'start-here',
    aliases: ['how football works', 'rules of american football basics'],
    summary:
      'A game is a series of discrete plays: each one starts at the line of scrimmage and ends when the ball is dead.',
    isStartHere: true,
    order: 20,
    readMinutes: 6,
    sourceKeys: [...RULEBOOK, ...GENERAL],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `Unlike sports with continuous play, football is a sequence of separate, timed events called plays (or "downs"). Each one begins with a snap and ends the instant the ball becomes dead: a tackle, an incomplete pass, a score, stepping out of bounds, or a whistle.

Between plays, both teams huddle or line up again, the officials reset the ball, and the next down begins. A single game can involve well over 100 individual plays.`,
    howItWorks: `**Pre-snap.** The offense lines up across the line of scrimmage from the defense. The offense must have at least seven players on the line, and only the players at the ends of that line, plus anyone lined up behind it (the backfield), are eligible to catch a forward pass.

**The snap.** The center hands or passes the ball backward, usually to the quarterback. This is the instant the play officially begins; before it, movement is restricted (false start, offside), and after it, contact is allowed.

**The play.** The ball carrier tries to advance it, by running or by the quarterback throwing a forward pass to a teammate downfield. The defense tries to tackle the ball carrier, bat down or intercept a pass, or otherwise stop the gain.

**The down ends.** The instant the ball carrier's knee, elbow, or any part of the body other than a hand or foot touches the ground while contacted (or the carrier goes out of bounds, or the ball is thrown incomplete, or a score happens), the play is dead. The officials spot the ball at that point for the next down.

**Repeat.** A new play clock starts (40 seconds in the NFL from the end of the last play), and the process repeats for the next down.`,
    example: `1st & 10 from the offense's own 30. A run play: the running back takes a handoff, is tackled after gaining 6 yards. The ball is spotted there; it is now 2nd & 4 from the 36.

Next play, an incomplete pass: the ball does not move, and it is now 3rd & 4 from the same spot. The offense converts with a 7-yard completion, gaining a new set of downs: 1st & 10 from the 43.`,
    whyItMatters: `Because every play is discrete, football can be broken down and analyzed play by play in a way continuous sports cannot: a broadcast can show a graphic before every snap describing exactly what has to happen next, which is impossible in a sport where nothing ever fully stops.

It is also why football has so many more players, coaches and specific plays than most sports: a paused-and-restarted structure lets a team substitute personnel and call a completely different play from a sideline before every single down.`,
    misunderstandings: `**A tackle does not require slamming a player to the ground.** Any contact that brings a runner down, or that they cannot break free from while any part of their body besides hands or feet touches the ground, ends the play.

**Going out of bounds ends the play immediately,** even for a defender: a receiver who steps on the sideline is down at that spot, no tackle needed.

**The offense does not have to run a new formation every play.** Many drives feature the same formation on consecutive downs; what changes is the specific play called, not necessarily the alignment.`,
    related: [
      'american-football-in-5-minutes',
      'what-is-the-line-of-scrimmage',
      'what-is-a-drive',
      'downs-and-distance',
    ],
  }),

  standard({
    slug: 'objective-of-american-football',
    title: 'What Is the Objective of American Football?',
    category: 'start-here',
    aliases: [
      'goal of american football',
      'point of football',
      'what are you trying to do in football',
    ],
    summary:
      'Score more points than the other team by advancing the ball into their end zone, or by kicking it through their goalposts.',
    order: 30,
    sourceKeys: GENERAL,
    explanation: `The objective is simple even though the rules that get you there are not: score more points than your opponent before time runs out.

There are two teams and one ball. Whichever team does not have the ball is trying to get it back; whichever team has it is trying to use its four downs to either score or, failing that, hand the ball back to the opponent from as far downfield as possible.`,
    howItWorks: `Points come from two directions. The offense scores by reaching the opponent's end zone (a touchdown, worth 6 points, plus a try afterward worth 1 or 2) or by kicking a field goal through the goalposts (3 points). The defense can also score, most commonly a safety (2 points, for tackling an opponent with the ball in their own end zone) or by returning a turnover or a kick all the way to the end zone.

Because the four-down system means an offense that fails to advance the ball usually has to give it up, the game is really a back-and-forth argument over field position and opportunities to score, not a race to accumulate yards for their own sake.`,
    whyItMatters: `Keeping the objective in view (score more, not just "gain yards" or "look impressive") explains a lot of decisions that otherwise look strange to a new viewer: punting the ball away on 4th down instead of trying to convert, taking a knee to run out the clock while leading, or a team deliberately allowing a touchdown late in a game to get the ball back with more time remaining.

None of those maximize yardage in the moment. All of them are about the only thing that is actually being scored: the final point total.`,
    misunderstandings: `**Yardage gained is not the scoreboard.** A team can out-gain its opponent by a wide margin and still lose, if it does not convert that yardage into points, most commonly by turning the ball over or settling for field goals instead of touchdowns.

**Not every possession is trying to score immediately.** Especially with a lead late in a game, an offense may run plays purely to use up clock time rather than to advance the ball.`,
    related: ['how-you-win-a-football-game', 'how-scoring-works', 'american-football-in-5-minutes'],
  }),

  standard({
    slug: 'how-you-win-a-football-game',
    title: 'How Do You Win an American Football Game?',
    category: 'start-here',
    aliases: ['how to win a football game', 'winning american football'],
    summary:
      'Score more points than your opponent across four quarters; a tie after that goes to overtime.',
    order: 40,
    sourceKeys: [...RULEBOOK, ...GENERAL],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `Whichever team has scored more points when the clock reaches zero at the end of the fourth quarter wins. If the score is tied, the game goes to overtime.

Every point matters equally toward that one number: a touchdown-plus-extra-point (7) and two field goals plus a touchdown-plus-two-point-try (8) are both perfectly normal ways for a scoreline to add up, and there is no bonus for how a team scores, only how much.`,
    howItWorks: `The four quarters are 15 minutes each in the NFL, with a longer break at halftime (after the second quarter). If the two teams are tied after the fourth quarter, the game proceeds to overtime, a further period played under modified rules.

In the current NFL overtime format, both teams are guaranteed a possession unless the team that gets the ball first scores a touchdown on that drive. If the score is still tied after one full overtime period in the regular season, the game ends in a tie; playoff games continue with additional overtime periods until a winner is decided.`,
    example: `A team leads 20-17 with two minutes left and possession. Rather than pass downfield and risk an interception, it runs the ball into the line three times, forcing the defense to use its remaining timeouts, then punts with under a minute left. The opponent gets the ball back too far from the end zone and out of time to score. Final score: 20-17.

That drive gained almost no yards and was never trying to. It was managing the clock against the only number that matters: the final score.`,
    whyItMatters: `Winning by the final score, not by any other measure, is why so much of football strategy near the end of games looks conservative or even boring compared to the rest of the game: the objective has narrowed from "score points" to "run out the clock while ahead" or "get the ball back while behind," and those calls only make sense once you know what is actually being decided.`,
    misunderstandings: `**A regular-season NFL game can end in a tie.** It is rare, but if the score is level after one overtime period in the regular season, the game is recorded as a tie rather than continuing indefinitely. Playoff games cannot end in a tie; they continue until someone scores.

**College overtime rules are different from the NFL's** and do not use a running clock at all; each team gets an untimed possession from a set yard line, alternating until someone is ahead after equal opportunities.`,
    related: [
      'objective-of-american-football',
      'overtime-explained',
      'two-minute-warning-explained',
    ],
  }),

  standard({
    slug: 'how-an-nfl-game-is-structured',
    title: 'How an NFL Game Is Structured',
    category: 'start-here',
    aliases: ['nfl game structure', 'how long is an nfl game', 'nfl quarters explained'],
    summary: 'Four 15-minute quarters, grouped into two halves, with a longer break at halftime.',
    order: 50,
    sourceKeys: [...RULEBOOK, ...GENERAL],
    explanation: `An NFL game is divided into four quarters of 15 minutes of game clock each, grouped into two halves. There is a short break between the 1st and 2nd quarters and between the 3rd and 4th, and a much longer halftime break between the 2nd and 3rd.

Because the clock stops so often (incomplete passes, players going out of bounds, penalties, scores, injuries, and more), 60 minutes of game clock typically takes about three hours of real time to play out.`,
    howItWorks: `Each half opens with a kickoff. Whichever team does not receive the opening kickoff of the game typically receives the second-half kickoff instead, so both teams get one of each across the game.

Within a quarter, the play clock (40 seconds in the NFL, counted down from the end of the previous play) forces the offense to snap the ball regularly; failing to do so is a delay-of-game penalty. Timeouts (three per team per half) let a team stop the clock deliberately, most valuable late in a half or a game.

The last two minutes of each half get a specific rule of their own: the two-minute warning, an automatic, built-in stoppage that functions like a free timeout for both teams.`,
    example: `A team trails by 4 points with 90 seconds left in the fourth quarter and no timeouts remaining. Every incomplete pass stops the clock (helpful); every completed pass inside the field of play keeps it running (costly), so the offense has to choose plays that are more likely to end out of bounds, even at some cost to the play's raw efficiency, purely because of how much clock structure matters in that situation.`,
    whyItMatters: `The quarter structure, not just the final score, is why so much of football broadcasting narrates "time remaining" and "timeouts remaining" constantly: those two numbers, combined with the score, decide which plays are even sensible to call. A play that is a great idea with ten minutes left in the third quarter can be the wrong one entirely with 40 seconds left in the fourth.`,
    misunderstandings: `**A quarter is not always exactly 15 minutes of real time.** It is 15 minutes of clock that runs only while plays are live; stoppages do not count against it, which is why quarters routinely take 30-45 minutes of real time.

**Halftime is much longer than the breaks between other quarters,** long enough for entertainment programming (most visibly the Super Bowl halftime show), not a minor pause.`,
    related: ['how-you-win-a-football-game', 'two-minute-warning-explained', 'what-is-a-drive'],
  }),

  standard({
    slug: 'offense-defense-special-teams',
    title: 'Understanding Offense, Defense & Special Teams',
    category: 'start-here',
    aliases: ['three units of football', 'offense defense special teams explained'],
    summary:
      'A team is really three separate units of players, each on the field for a different kind of play.',
    isStartHere: true,
    order: 60,
    sourceKeys: GENERAL,
    explanation: `An NFL roster is effectively three teams in one: the offense (whose job is to score, when their team has the ball), the defense (whose job is to stop the other team from scoring, when the opponent has the ball), and special teams (who handle kicks: kickoffs, punts, field goals, and the returns of each).

Almost every player belongs to only one of these units and rarely appears in the other two.`,
    howItWorks: `**Offense** takes the field whenever its team has possession and is not about to punt or attempt a kick. It includes the quarterback, running backs, receivers, tight ends, and the offensive line, all trying to advance the ball or protect the player who has it.

**Defense** takes the field whenever the opponent has possession. It includes the defensive line, linebackers, cornerbacks, and safeties, all trying to stop the ball carrier, disrupt a pass, or force a turnover.

**Special teams** covers every play that involves a kick: the opening kickoff, punts on fourth down, field goal and extra point attempts, and the return units that try to bring those kicks back for yardage. Some special-teams players (kickers, punters, long snappers) are dedicated specialists who play almost no other role; others are offensive or defensive players who also play special teams.`,
    example: `A team's offense drives the field and scores a touchdown. Its special-teams unit (kicker and holder) then comes on for the extra point attempt. After that, its own kickoff team lines up to kick off to the opponent. Three different groups of players took the field for three consecutive events, none of them overlapping much in personnel.`,
    whyItMatters: `Recognizing which unit is on the field tells a viewer what is even possible on the next play: watching the punt team line up means the offense has given up on the current down and is not trying to score, while watching the field goal unit come on means the same thing but with a different backup plan.

It also explains why NFL rosters carry 53 players rather than the 22 who are ever on the field at once: three separate units, each needing its own depth.`,
    misunderstandings: `**A player is not automatically on defense just because they are big, or on offense because they touch the ball.** The assignment is about the unit's job (score versus prevent) rather than a player's physical profile.

**Special teams is not "extra" or unimportant.** Field position swings created by punts, kickoffs and their returns are a significant, sometimes decisive, part of the final score.`,
    related: [
      'american-football-positions-explained',
      'how-nfl-defense-works',
      'kickoff-explained',
    ],
  }),

  standard({
    slug: 'american-football-field-explained',
    title: 'American Football Field Explained',
    category: 'start-here',
    aliases: ['football field dimensions', 'gridiron explained', 'nfl field layout'],
    summary: 'A 100-yard rectangle marked every 5 yards, with a 10-yard end zone at each end.',
    isStartHere: true,
    order: 70,
    sourceKeys: GENERAL,
    explanation: `The playing field is 100 yards long between the goal lines, and 53⅓ yards wide, with an additional 10-yard-deep end zone at each end. Including both end zones, the total length from back line to back line is 120 yards.

Yard lines are painted every 5 yards, numbered every 10, and the field is often called a "gridiron" because of the resulting grid pattern.`,
    howItWorks: `Down the middle of the field run **hash marks**, narrow marks used to spot the ball for the start of a play. In the NFL, the hash marks are close together, near the center of the field, so a play almost never starts pinned against a sideline. College fields use wider hash marks.

Each end zone contains the **goal line**, the boundary a ball carrier must cross to score a touchdown, and the **goalposts**, a single upright structure at the very back of the end zone used for field goals and extra points.

Numbers painted on the field (10, 20, 30...) count up from each goal line to midfield (the 50-yard line), so "the 35" could mean either team's 35-yard line depending on which half of the field it is in; broadcasts specify by naming the team it is closer to.`,
    example: `A team has the ball at "their own 40," meaning 40 yards from their own goal line, 60 yards from the opponent's. A big completion advances it to "the opponent's 35": now on the other side of midfield, 35 yards from a score.`,
    whyItMatters: `The field's markings are how a viewer, and the officials, know exactly where a play started and how far it has to go: every broadcast overlays a yellow first-down line and the numbers on the field precisely because distance to the goal line, not just distance gained, is what decides whether a drive is threatening to score.`,
    misunderstandings: `**The end zone is not painted the same at every level.** NFL end zones often carry team branding and are visually busy; the 10-yard depth and function are what matter, not the artwork.

**"The 50" is not a fixed team's territory.** Midfield belongs to neither team; a play that starts there is at exactly the halfway point of the whole field.`,
    related: ['american-football-in-5-minutes', 'red-zone-explained', 'field-position'],
  }),

  standard({
    slug: 'american-football-positions-explained',
    title: 'American Football Positions Explained',
    category: 'start-here',
    alsoIn: ['positions'],
    aliases: ['football positions', 'nfl positions explained'],
    summary:
      'Eleven offensive roles, eleven defensive roles, and a handful of special-teams specialists.',
    isStartHere: true,
    isFeatured: true,
    order: 80,
    readMinutes: 6,
    sourceKeys: GENERAL,
    explanation: `Every play, each team fields exactly 11 players, and each of those 11 has a defined role. Offensively, that means blockers, a passer, and ball carriers or receivers; defensively, it means players assigned to stop the run, rush the passer, or cover receivers.

The specific mix of positions on the field can change from play to play (a team might use one running back on one snap and none on the next), but the vocabulary of roles is fixed and every broadcast, stat sheet, and depth chart uses it.`,
    howItWorks: `**Offensive line** (five players: center, two guards, two tackles) blocks for the quarterback and ball carriers, and is not allowed to catch a pass except in rare, specifically legal situations.

**Quarterback** takes the snap and directs the offense, either handing off, throwing, or running himself.

**Running backs** line up behind the quarterback and typically carry the ball on running plays, though many also catch passes out of the backfield.

**Receivers and tight ends** are the primary pass-catching targets; receivers line up out wide, tight ends line up closer to the offensive line and also block.

**Defensive line** (typically three or four players) lines up across from the offensive line, trying to stop the run at the point of attack and pressure the quarterback.

**Linebackers** line up behind the defensive line, and are the most varied position on defense: stopping the run, rushing the passer, and covering receivers or backs, depending on the defense's call.

**Cornerbacks and safeties** make up the secondary, primarily covering receivers and providing the last line of defense against long plays.`,
    example: `On a passing play, the offense might field one running back, one tight end, and three receivers, with the quarterback under center or in shotgun. The defense responds with, say, four defensive linemen, two linebackers, and five defensive backs, a lighter alignment built to cover more receivers rather than stop the run.`,
    whyItMatters: `Positions are the vocabulary that makes every other explainer in this library legible: a "Cover 2" call means something specific to cornerbacks and safeties, a "blitz" means specific linebackers or defensive backs are rushing instead of covering, and a "3-4 defense" describes exactly how many down linemen and linebackers are on the field. None of that is readable without the position names underneath it.`,
    misunderstandings: `**A position is not the same as a "personnel package."** "11 personnel" describes how many running backs and tight ends are on the field in general (1 running back, 1 tight end), not which specific 11 players are out there.

**Offensive and defensive linemen almost never touch the ball.** Their role is blocking or rushing, not carrying or catching, except in unusual trick plays or turnovers recovered on the ground.`,
    related: [
      'american-football-positions-explained',
      'how-nfl-defense-works',
      'quarterback-explained',
      'running-back-explained',
      'wide-receiver-explained',
    ],
  }),

  standard({
    slug: 'how-scoring-works',
    title: 'How Scoring Works',
    category: 'start-here',
    alsoIn: ['scoring'],
    aliases: ['football scoring', 'how points work in football', 'nfl scoring explained'],
    summary:
      'Touchdowns are worth 6, field goals 3, safeties 2, and a touchdown can be followed by a 1- or 2-point try.',
    isStartHere: true,
    isFeatured: true,
    order: 90,
    readMinutes: 5,
    sourceKeys: [...RULEBOOK, ...GENERAL],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `Football has more ways to score than most sports, and each is worth a different amount. The two main ones are the touchdown (6 points, for reaching the end zone) and the field goal (3 points, for kicking the ball through the goalposts). A touchdown is immediately followed by a try for 1 or 2 more points, and either team can also score a safety (2 points).`,
    howItWorks: `**Touchdown, 6 points.** Scored by carrying, catching, or recovering the ball while it is in the opponent's end zone, or by breaking the plane of the goal line while in possession.

**The try, 1 or 2 points.** Immediately after a touchdown, the scoring team gets one more play from close range: kick the ball through the goalposts for 1 point (the extra point), or run or pass it into the end zone again for 2 points (the two-point conversion).

**Field goal, 3 points.** The offense's placekicker, from a spot the offense chooses (usually fourth down when a touchdown looks unlikely), kicks the ball through the uprights. Commonly attempted from inside about 50-55 yards, though longer kicks do happen.

**Safety, 2 points.** Awarded to the defense when the offense is tackled with the ball in its own end zone, or commits certain penalties there. Rare, but always a swing of both points and possession, since the scored-on team must then kick the ball away.`,
    example: `A team scores a touchdown (6), kicks the extra point (1): 7 points total. Later, backed up near their own end zone, that same team's offense is tackled behind its own goal line: a safety, 2 points to the other team, plus the ball comes back to the scoring defense via a free kick. The math of a single drive-plus-safety sequence: +7 for one team, then +2 for the other, in the space of two plays.`,
    whyItMatters: `Because the scoring values differ so much (6+1 or 6+2 versus 3 versus 2), understanding them is what makes late-game math legible: a team down by 8 with a chance to score knows it needs a touchdown and a two-point conversion, not just "some points," to tie rather than only get within one score.`,
    misunderstandings: `**A touchdown alone is not automatically 7 points.** The try afterward is a separate play that can fail (a missed extra point, or a failed two-point attempt), so 6 points on the board with nothing added is possible and happens regularly.

**A field goal and a safety are not interchangeable in value** despite both feeling like "small" scores: 3 points typically comes with the offense keeping momentum, while 2 points from a safety comes with the ball being kicked away from the team that just scored.`,
    related: [
      'touchdown-explained',
      'field-goal-explained',
      'extra-point-explained',
      'two-point-conversion-explained',
      'safety-explained',
    ],
  }),

  standard({
    slug: 'what-are-downs',
    title: 'What Are Downs?',
    category: 'start-here',
    alsoIn: ['downs-and-yards'],
    aliases: ['downs explained', 'what is a down in football', 'football downs meaning'],
    summary: 'A down is one play; the offense gets four of them to advance the ball 10 yards.',
    isStartHere: true,
    order: 100,
    sourceKeys: [...RULEBOOK, ...GENERAL],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `A down is one individual play, from snap to the moment the ball becomes dead. The offense is given four downs in a row to advance the ball at least 10 yards from where the first down of that set began.

Succeed within those four plays, in any combination, and the count resets to a fresh set of four downs from the new spot. Fail, and possession normally changes hands.`,
    howItWorks: `Downs are numbered 1st through 4th, and each is always paired with a distance: "1st & 10" means first down, 10 yards needed. As yards are gained, the distance shrinks: gain 4 yards on 1st & 10 and it becomes 2nd & 6. Gain the rest and it becomes a new 1st & 10, wherever the ball now sits.

If a play loses yardage or is stopped for no gain, the distance does not shrink; it can even grow ("3rd & 14" after a sack that loses yards on 3rd & 6). If the fourth down arrives without the distance covered, the offense is out of downs at that spot, and possession usually passes to the opponent there, unless the team scores or kicks first.`,
    example: `1st & 10 from the offense's own 30. A run gains 4 yards: 2nd & 6 from the 34. A pass gains 8 yards, past the line to gain: NEW FIRST DOWN. 1st & 10 from the 42. The set resets and the process starts again.`,
    whyItMatters: `The down-and-distance number is the single most information-dense thing on a football broadcast: "3rd & 1" tells an experienced viewer to expect a run up the middle, while "3rd & 12" tells them to expect a pass, because the situation itself narrows down what play is sensible.`,
    misunderstandings: `**Losing a down does not mean losing the ball.** A team can run three unsuccessful plays and still have a fourth down remaining to try again, or to punt the ball away deliberately instead.

**The distance to go is not always exactly 10.** A penalty, a loss on a previous play, or reaching the goal line before 10 yards away (see "Goal-to-Go") all change the number.`,
    related: ['downs-and-distance', 'what-is-a-first-down', 'why-four-downs', 'yards-to-go'],
  }),

  definition({
    slug: 'what-is-a-first-down',
    title: 'What Is a First Down?',
    category: 'start-here',
    alsoIn: ['downs-and-yards'],
    aliases: ['first down meaning', 'what is a first down in football'],
    summary: 'A fresh set of four downs, earned by advancing the ball to or past the line to gain.',
    order: 110,
    sourceKeys: RULEBOOK,
    explanation: `A first down is both an event (converting, i.e. reaching the required distance) and the resulting situation (a new set of four downs, with the distance reset to 10 yards, or less near the goal line).

Every offensive drive is really a sequence of first downs: get one, then try to get another, and so on, until the drive ends in a score or a failure to convert.`,
    example: `An offense faces 3rd & 4 from its own 45. A completed pass gains 9 yards, well past the 4 needed. The play is marked a first down: the ball is spotted at the offense's 45+9, and the count resets to 1st & 10 from there, regardless of how many downs were used to get it (this one took only one of the three remaining).`,
    whyItMatters: `First downs are the currency of an NFL drive; broadcasts track them explicitly ("first downs: 8" per team in a box score) because a team that converts a lot of first downs is, by definition, keeping the ball and controlling the game clock, independent of whether those drives end in touchdowns.`,
    misunderstandings: `**A first down is not a score.** It is a continuation, not a point; a drive can pick up five first downs in a row and still end without any points if it eventually stalls inside scoring range.`,
    related: ['what-are-downs', 'line-to-gain', 'downs-and-distance'],
  }),

  definition({
    slug: 'what-is-the-line-of-scrimmage',
    title: 'What Is the Line of Scrimmage?',
    category: 'start-here',
    aliases: ['line of scrimmage meaning', 'los football'],
    summary:
      "An imaginary line across the field, at the ball's position, that both teams line up behind before the snap.",
    order: 120,
    sourceKeys: RULEBOOK,
    explanation: `The line of scrimmage is not painted on the field; it is a rule concept, an imaginary line running sideline to sideline through the point where the ball is placed to start a play. Before the snap, the offense must line up entirely on its side of that line (with a small allowance for the quarterback and players behind the line), and the defense on the other.

Neither team may cross it before the snap (that is offside or encroachment), and after the snap it becomes the reference point for measuring whether a pass is a forward pass or a lateral, among other rules.`,
    example: `The ball is spotted at the 34-yard line to start a play. The line of scrimmage is the 34, and every offensive lineman must have at least part of their body on or behind it before the snap; stepping across early is a false start.`,
    whyItMatters: `Almost every rule about legal formations, eligible receivers, and pre-snap penalties is defined relative to the line of scrimmage, which is why it is one of the first concepts a new fan needs before penalties like offside or false start make any sense.`,
    misunderstandings: `**The line of scrimmage is not the same as the line to gain.** The line of scrimmage marks where the current play starts; the line to gain marks where the offense needs to reach for a first down, and is usually 10 yards further downfield.`,
    related: ['what-are-downs', 'line-to-gain', 'false-start-explained'],
  }),

  definition({
    slug: 'what-is-a-drive',
    title: 'What Is a Drive?',
    category: 'start-here',
    aliases: ['drive meaning football', 'what is a football drive'],
    summary: "A team's continuous stretch of possession, from gaining the ball to losing it.",
    order: 130,
    sourceKeys: GENERAL,
    explanation: `A drive is one team's uninterrupted string of downs with the ball, from the moment they gain possession until it ends: by scoring, punting, turning the ball over, or the half or game ending.

A single game usually contains somewhere around 10-14 drives per team, and a drive can be as short as one play (an interception thrown immediately) or as long as 15-plus plays covering most of the field.`,
    example: `A team receives a kickoff at its own 25-yard line and starts a drive. It converts three first downs, reaches the opponent's 10-yard line, and scores a touchdown seven plays later. That entire seven-play sequence, kickoff return to touchdown, is one drive.`,
    whyItMatters: `"Drive" is the natural unit for describing a team's offensive performance in a broadcast ("that was a 12-play, 80-yard drive") and for stats like time of possession, which measure how much of the game clock each team's drives consumed in total.`,
    misunderstandings: `**A drive is not the same as a quarter or a half.** Multiple drives happen within a single quarter, and a drive can span the boundary between quarters (though not typically across halftime, since possession changes at the start of the second half).`,
    related: ['how-possession-works', 'downs-and-distance', 'field-position'],
  }),

  standard({
    slug: 'how-possession-works',
    title: 'How Possession Works',
    category: 'start-here',
    aliases: ['possession in football', 'who has the ball in football'],
    summary:
      'Possession changes hands only at defined moments: a score, a turnover, a punt, or the end of a half.',
    order: 140,
    sourceKeys: GENERAL,
    explanation: `Unlike sports where the ball can change hands mid-motion at any moment, football possession is discrete: one team has it, drives with it across a series of downs, and then hands it to the other team only at specific, identifiable moments.`,
    howItWorks: `Possession changes when: a team scores (the other team then gets the ball back via kickoff or free kick); a team turns the ball over (an interception or a lost fumble); an offense fails to convert on 4th down (turnover on downs); an offense punts, deliberately giving up the ball; or a half or the game ends.

Outside of those events, whichever team has the ball keeps driving with it across as many downs and plays as it takes to reach one of those outcomes.`,
    example: `Team A drives the field and scores a touchdown. Possession passes to Team B via kickoff. Team B's drive stalls, and on 4th down it punts, handing possession back to Team A at a new spot. That is two full possession changes inside a few minutes of game time, each triggered by a specific, nameable event.`,
    whyItMatters: `Because possession changes are so clearly delineated, football statistics (time of possession, plays per drive, points per possession) are much easier to define cleanly than in a sport where the ball is constantly changing hands within continuous play.`,
    misunderstandings: `**Possession does not automatically change just because a play ends.** Most plays end with the same team still in possession, ready for the next down; only the specific events above actually hand the ball to the other side.`,
    related: ['what-is-a-drive', 'turnover-on-downs', 'why-turnovers-matter'],
  }),

  standard({
    slug: 'nfl-vs-college-football',
    title: 'NFL vs College Football',
    category: 'start-here',
    alsoIn: ['college-football'],
    aliases: ['difference between nfl and college football', 'ncaa football vs nfl'],
    summary:
      'The same core game, with real differences in overtime, the clock, eligibility and roster rules.',
    order: 150,
    sourceKeys: GENERAL,
    explanation: `The NFL (professional) and college football (governed by the NCAA) share the same fundamentals: four downs, 10 yards to go, 6-point touchdowns, and the same basic positions. But a number of specific rules differ enough that a fan moving between the two will notice the change immediately.`,
    howItWorks: `**Overtime** is the biggest difference. College overtime gives each team an untimed possession from a set yard line (typically the opponent's 25), alternating until one team is ahead after equal chances, with rule changes (like mandatory two-point tries) kicking in after multiple extra periods. NFL overtime uses a running clock and, since a 2022 rule change, guarantees both teams a possession unless the first team's drive ends in a touchdown.

**The clock** also differs: college football stops the clock after every first down (until the ball is re-spotted), which the NFL does not do outside of the last two minutes of a half, making college games often take longer despite similar play counts.

**Eligibility and rosters** differ too: college players are typically 18-23-year-old students with a limited number of years of eligibility, while NFL rosters are professionals with no such eligibility clock, and NFL rosters (53 players) are also structured differently from a college program's much larger roster.`,
    example: `A college game reaches a first down with 3 minutes left in the first half; the clock stops automatically to reset the chains. In an NFL game at the same point, the clock would keep running after that first down, because the NFL only forces a stoppage for a first down inside the final two minutes of a half.`,
    whyItMatters: `Knowing these differences matters most for two audiences: fans who watch both and get confused by inconsistent overtime or clock rules, and anyone following the NFL Draft, where players are transitioning from a college rule set to a different professional one.`,
    misunderstandings: `**The uprights and field are not identical either**, though close: college hash marks are wider than the NFL's, which changes how often plays start near a sideline.

**"College football" is not one uniform rule set forever.** The NCAA has changed its overtime format more than once in recent years; what is described here is the general shape, not a rule frozen in time.`,
    related: [
      'overtime-explained',
      'college-football-playoff-explained',
      'how-an-nfl-game-is-structured',
    ],
  }),

  // ══ Downs & Yards ═══════════════════════════════════════════════════════════
  standard({
    slug: 'downs-and-distance',
    title: 'Downs Explained',
    category: 'downs-and-yards',
    aliases: ['down and distance explained', 'downs system football'],
    summary:
      'The four-down system in detail: how the count resets, and what happens when it runs out.',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `The down system is football's core mechanic: an offense is given four downs (plays) to advance the ball at least 10 yards from wherever the current set began. This is why an offense's whole possession is really a sequence of "sets" of downs, each one starting over from 1st & 10 (or less, near the goal line) once the previous set is converted.`,
    howItWorks: `Each down is labeled 1st, 2nd, 3rd or 4th, always paired with the yards remaining. A successful gain shrinks the distance; a stuffed run or incompletion leaves it unchanged; a penalty or a loss can grow it. Reach or pass the line to gain on any of the four downs, and the count resets immediately, mid-set, to a brand new 1st & 10 (the team does not have to "use up" all four downs first).

If the fourth down passes without success, the ball is turned over on downs at that spot, unless the offense scores or a kick (field goal or punt) intervenes first. In practice, teams almost never let 4th down play out with a run or pass unless they are close to converting or it is late in a game and they need the ball back; most 4th downs become punts or field goal attempts instead.`,
    example: `1st & 10 from the 25. Incomplete pass: 2nd & 10, still. Run for 3: 3rd & 7. Completed pass for 9 yards: NEW FIRST DOWN, 1st & 10 from the new spot, even though only 3 of the 4 downs were used.

Contrast that with: 1st & 10, run for 2 (2nd & 8), pass incomplete (3rd & 8), run for 5 (4th & 3). Now the team faces a real decision on 4th down: go for it, punt, or (if in range) try a field goal.`,
    whyItMatters: `Every strategic decision in football traces back to the down-and-distance situation. A 3rd & 1 and a 3rd & 15 are nominally the "same down" but call for almost entirely different plays, personnel, and even how conservatively the defense plays.`,
    misunderstandings: `**Converting does not require using all four downs;** a first down on 1st, 2nd or 3rd down ends that set immediately and resets the count.

**Losing yardage does not "use up" more downs than a stuffed play;** both simply count as one down each, regardless of how many yards were lost or gained.`,
    related: [
      'what-are-downs',
      'why-four-downs',
      'what-happens-on-fourth-down',
      'fourth-down-conversion',
    ],
  }),

  standard({
    slug: 'why-four-downs',
    title: 'Why Does the Offense Get Four Downs?',
    category: 'downs-and-yards',
    aliases: ['why 4 downs in football', 'why does football have 4 downs'],
    summary:
      'Four downs balances offense and defense: enough chances to make 10 yards realistic, not so many it is trivial.',
    order: 20,
    sourceKeys: [{ key: 'wp-down-gridiron' }],
    explanation: `The number of downs and the distance required have changed over football's history (early American football used three downs to gain 5 yards), and the current NFL standard, four downs to gain 10 yards, has been stable for a very long time because it produces a workable balance: hard enough to fail regularly, easy enough that a competent offense converts a clear majority of the time.`,
    howItWorks: `With four downs, an offense typically needs to average only 2.5 yards per play to convert, which most plays comfortably clear even when one or two plays in the set gain little or nothing. That cushion is what makes it reasonable to attempt a low-percentage deep pass on 1st down: even a failed play still leaves two more tries.

Fewer downs (three, as in football's early history, or Canadian football's current three-down system) would force much more conservative, run-heavy offense on early downs, because there is less room to recover from a failed play.`,
    whyItMatters: `The specific number, four downs for ten yards, is why NFL and American college offenses can afford to take chances early in a set of downs (throwing deep on 1st down is common) in a way that would be reckless with fewer downs to fall back on.`,
    misunderstandings: `**Not every football code uses four downs.** Canadian football (the CFL) uses three downs to gain 10 yards, a deliberate design choice that produces a faster-paced, more pass-heavy game because there is less room for conservative, run-first play calling.`,
    related: ['downs-and-distance', 'what-happens-on-fourth-down', 'nfl-vs-college-football'],
  }),

  definition({
    slug: 'what-is-1st-and-10',
    title: 'What Is 1st & 10?',
    category: 'downs-and-yards',
    aliases: ['1st and 10 meaning', 'first and ten football'],
    summary: 'The starting situation of every new set of downs: first down, 10 yards to go.',
    order: 30,
    sourceKeys: RULEBOOK,
    explanation: `"1st & 10" is the down-and-distance notation for the opening play of a fresh set of downs: it is the first of the four available downs, and the offense needs 10 yards from this spot to earn a new first down.

Every drive begins on 1st & 10 (barring a penalty on the very first play), and every successful conversion resets back to 1st & 10 as well.`,
    example: `1st & 10, ball at the offense's 22-yard line: the offense needs to reach the 32-yard line, in up to four plays, to convert.`,
    whyItMatters: `1st & 10 is the "neutral" situation: neither team has an obvious advantage yet, which is why it is the down where offenses have the most freedom to call whatever play they think is best, run or pass, rather than a play dictated by desperation or a short-yardage situation.`,
    related: ['what-are-downs', 'what-does-2nd-and-7-mean', 'downs-and-distance'],
  }),

  definition({
    slug: 'what-does-2nd-and-7-mean',
    title: 'What Does 2nd & 7 Mean?',
    category: 'downs-and-yards',
    aliases: ['2nd and 7 football meaning', 'second and seven'],
    summary: 'Second down, with 7 yards remaining to reach a first down.',
    order: 40,
    sourceKeys: RULEBOOK,
    explanation: `"2nd & 7" means the offense is on its second of four downs, and needs 7 more yards from the current spot to earn a new first down. It follows naturally from a 1st & 10 play that gained 3 yards (10 minus 3 is 7).`,
    example: `1st & 10, a run gains 3 yards: the next play is 2nd & 7. A completed pass for 7 or more yards converts a first down; anything less leads to 3rd down with the remaining distance.`,
    whyItMatters: `"2nd & short" (2nd & 1 through roughly 2nd & 4) versus "2nd & long" (2nd & 8 or more) are treated very differently by play-callers: short situations open up the whole playbook including runs and play-action, while long situations usually narrow the call toward a pass designed to gain enough to make 3rd down manageable.`,
    related: ['what-is-1st-and-10', 'yards-to-go', 'downs-and-distance'],
  }),

  standard({
    slug: 'what-happens-on-fourth-down',
    title: 'What Happens on Fourth Down?',
    category: 'downs-and-yards',
    aliases: ['4th down explained', 'fourth down decisions'],
    summary:
      "The offense's last chance in a set of downs: convert, or the ball usually changes hands at that spot.",
    order: 50,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `Fourth down is the last play in a set. If the offense converts (reaches the line to gain), it earns a new first down and keeps possession, exactly as on any other down. If it fails and takes no other action, the ball is turned over to the defense at the spot where the play ended.

Because losing the ball at that spot is usually worse than giving it up further away, offenses rarely just "run a normal play" on 4th down unless they are close to converting or need the ball back badly; the two common alternatives are punting (deliberately kicking the ball away to a better spot for the defense to start from) or attempting a field goal if within range.`,
    howItWorks: `A team facing 4th down chooses among three options: **go for it** (run a normal offensive play, trying to convert), **punt** (kick the ball away, surrendering possession but improving the defense's starting field position disadvantage), or **attempt a field goal** (if close enough to the goalposts, trying to score 3 points instead of continuing the drive).

The choice depends heavily on field position, score, time remaining, and the distance needed: 4th & 1 near midfield is a common "go for it" situation for aggressive teams, while 4th & 10 from your own 20-yard line is punted away nearly every time.`,
    example: `4th & 2 from the opponent's 35-yard line, too far for a confident field goal but not out of range for an aggressive team: a coach might choose to go for it rather than attempt a 52-yard field goal or punt (which would gain relatively little field position from that spot anyway).

4th & 8 from the offense's own 30, deep in its own territory: almost every team punts here, since failing to convert would hand the opponent the ball already in scoring range.`,
    whyItMatters: `The 4th-down decision is one of the most analyzed in football, because analytics have shown teams historically punted more often than the numbers justify; "going for it" more aggressively on 4th & short, especially in opponent territory, is now widely accepted as the better strategy in many more situations than coaches traditionally chose.`,
    misunderstandings: `**Failing to convert on 4th down does not always mean losing the ball at that exact spot;** a sack or a bad snap can push the ball back further than expected, changing where the defense actually takes over.

**A missed field goal is not the same as failing to convert;** the ball is spotted for the defense at the spot of the kick (or the previous line of scrimmage if inside a certain distance), not necessarily where a "normal" 4th-down failure would leave it.`,
    related: [
      'downs-and-distance',
      'fourth-down-conversion',
      'turnover-on-downs',
      'when-should-teams-kick-a-field-goal',
    ],
  }),

  definition({
    slug: 'fourth-down-conversion',
    title: 'What Is Fourth-Down Conversion?',
    category: 'downs-and-yards',
    aliases: ['4th down conversion rate', 'converting on 4th down'],
    summary: 'Successfully gaining enough yardage on 4th down to earn a new first down.',
    order: 60,
    sourceKeys: RULEBOOK,
    explanation: `A fourth-down conversion is simply a first down earned on the last available down of a set: the offense reaches or passes the line to gain on 4th down instead of failing and turning the ball over on downs.

It is tracked as its own statistic (4th-down conversion rate) precisely because it only happens when a team has chosen to "go for it" rather than punt or kick, so the rate reflects both a team's success rate and how often it dares to try in the first place.`,
    example: `4th & 1 from the offense's own 45. Rather than punt, the offense runs a quarterback sneak and gains 2 yards. That is a 4th-down conversion: a new set of downs, 1st & 10, from the 47.`,
    whyItMatters: `4th-down conversion rate is a widely tracked team statistic because it captures aggressiveness as well as execution, and teams that convert well on 4th down (or simply attempt it more, given modern analytics favor going for it more often) tend to sustain longer drives and generate more points per possession.`,
    related: ['what-happens-on-fourth-down', 'turnover-on-downs', 'downs-and-distance'],
  }),

  definition({
    slug: 'turnover-on-downs',
    title: 'What Is Turnover on Downs?',
    category: 'downs-and-yards',
    alsoIn: ['turnovers'],
    aliases: ['turnover on downs meaning', 'failed 4th down turnover'],
    summary: 'Losing possession by failing to convert on 4th down.',
    order: 70,
    sourceKeys: RULEBOOK,
    explanation: `A turnover on downs happens when an offense runs a play on 4th down (rather than punting or kicking) and fails to reach the line to gain. Possession passes to the defense immediately, at the spot where the play ended, with no kick involved.`,
    example: `4th & 3 from the opponent's 38. The offense runs a play and is stopped after gaining only 1 yard. Turnover on downs: the defense takes over at that spot, effectively starting its own next drive already in what was the offense's territory.`,
    whyItMatters: `Turnover on downs is functionally different from other turnovers (interceptions, fumbles) because it is always a deliberate choice by the offense to "go for it" rather than an accident; it is the direct cost of an aggressive 4th-down decision that did not work out.`,
    misunderstandings: `**A turnover on downs is not counted among a team's "turnovers" in the traditional sense** used for turnover differential; that statistic conventionally counts only interceptions and lost fumbles, not failed 4th-down attempts.`,
    related: ['what-happens-on-fourth-down', 'fourth-down-conversion', 'why-turnovers-matter'],
  }),

  definition({
    slug: 'yards-to-go',
    title: 'What Does "Yards to Go" Mean?',
    category: 'downs-and-yards',
    aliases: ['yards to go football', 'distance to go meaning'],
    summary: 'The remaining distance to the line to gain, from the current line of scrimmage.',
    order: 80,
    sourceKeys: RULEBOOK,
    explanation: `"Yards to go" (the second number in "1st & 10," "3rd & 4," and so on) is simply how far the offense still needs to advance the ball to reach the line to gain and earn a new first down. It shrinks with every positive gain and does not change on a play that gains nothing.`,
    example: `1st & 10 becomes 2nd & 6 after a 4-yard gain, then 3rd & 2 after another 4-yard gain: "yards to go" has fallen from 10, to 6, to 2, tracking exactly how much ground remains.`,
    whyItMatters: `Yards to go, more than the down number alone, is what dictates play calling: "3rd & short" situations favor the run and short, high-percentage passes, while "3rd & long" situations almost always mean a pass, because gaining a large chunk of yardage on the ground in one play is uncommon.`,
    related: ['what-is-1st-and-10', 'what-does-2nd-and-7-mean', 'line-to-gain'],
  }),

  definition({
    slug: 'line-to-gain',
    title: 'What Is the Line to Gain?',
    category: 'downs-and-yards',
    aliases: ['line to gain football', 'first down marker'],
    summary:
      'The yard line the offense must reach or pass to earn a new first down, usually 10 yards ahead of the line of scrimmage.',
    order: 90,
    sourceKeys: RULEBOOK,
    explanation: `The line to gain is the specific yard line, marked on television broadcasts with a yellow line, that the offense needs to reach with the ball to convert a first down. It is set 10 yards ahead of where the current set of downs began (or less, near the goal line, where it becomes the goal line itself).

On the sideline, officials track it physically with a chain-and-stakes system, still used as the official measurement even though the broadcast graphic is what most viewers actually watch.`,
    example: `A set of downs begins at the offense's own 30-yard line. The line to gain is the 40-yard line. Whether it takes one play or four, reaching or passing the 40 with the ball earns a new first down.`,
    whyItMatters: `The line to gain is what turns "yards gained" into a meaningful outcome rather than just a raw number: a 9-yard gain on 3rd & 10 is an excellent individual play that still fails to convert, while a 9-yard gain on 3rd & 8 succeeds, purely depending on where the line to gain actually sits.`,
    misunderstandings: `**The broadcast's yellow first-down line is a graphic overlay, not part of the actual field or an official measurement;** the real, binding measurement is still made with the sideline chains when a play is close.`,
    related: ['what-is-a-first-down', 'yards-to-go', 'downs-and-distance'],
  }),

  standard({
    slug: 'field-position',
    title: 'What Is Field Position?',
    category: 'downs-and-yards',
    aliases: ['field position explained', 'field position battle football'],
    summary:
      'Where on the field a team is operating, and how much of an advantage or disadvantage that location creates.',
    order: 100,
    sourceKeys: GENERAL,
    explanation: `Field position describes how far a team's offense is from its own goal line versus the opponent's, independent of the down-and-distance situation. Starting a drive near your own goal line is a disadvantage (little room for error, a long way to travel); starting deep in opponent territory is an advantage (a short field to a score, and low risk if a play fails).`,
    howItWorks: `Field position shifts constantly through kicks, returns and turnovers, not just through offensive drives. A long punt return, a turnover deep in opponent territory, or a penalty that moves the ball can all swing field position dramatically without a single "normal" offensive play being run.

Because of this, punting on 4th down is often described as "playing for field position": even without converting, pinning the opponent deep in their own territory is a meaningful outcome in itself.`,
    example: `A team intercepts a pass at the opponent's 25-yard line. Even though that turnover involved no offensive plays at all, it instantly hands the offense excellent field position: a short field, needing only 25 yards to score, rather than the 75 yards a normal drive from its own 25 would require.`,
    whyItMatters: `Field position is a major hidden factor in how "efficient" a drive looks: a touchdown drive that started at the opponent's 20-yard line required far less than one that started at the offense's own 5, even though both end in the same 7 points.`,
    misunderstandings: `**Field position is not the same statistic as time of possession** or total yards gained; it specifically describes where on the field a team is operating, not how long it holds the ball or how much total ground its drives cover.`,
    related: ['red-zone-explained', 'punt-explained', 'what-is-a-drive'],
  }),

  definition({
    slug: 'short-yardage',
    title: 'What Is Short Yardage?',
    category: 'downs-and-yards',
    aliases: ['short yardage situation', 'short yardage football'],
    summary: 'A down-and-distance situation with only a yard or two needed for a first down.',
    order: 110,
    sourceKeys: GENERAL,
    explanation: `Short yardage describes a down (commonly 3rd or 4th) where only a small amount of ground, typically 1-3 yards, is needed to convert. It is treated as its own category of situation because both the play-calling and the personnel used often change specifically for it.`,
    example: `3rd & 1 from the offense's own 40: a classic short-yardage situation. Many teams bring in an extra offensive lineman or a bigger running back specifically for this down, and the defense often counters with its own "goal line" or heavy run-stopping personnel, even though the ball is nowhere near the goal line.`,
    whyItMatters: `Short-yardage situations are disproportionately run on the ground rather than through the air, because a high-percentage gain of only a yard or two is usually easier to guarantee by pushing the pile forward than by throwing a pass that could be incomplete and gain nothing at all.`,
    related: ['goal-to-go', 'downs-and-distance', 'yards-to-go'],
  }),

  definition({
    slug: 'goal-to-go',
    title: 'What Is Goal-to-Go?',
    category: 'downs-and-yards',
    aliases: ['goal to go explained', 'goal to go situation'],
    summary:
      "A down where the goal line, not a 10-yard marker, is the line to gain, because the offense is inside the opponent's 10-yard line.",
    order: 120,
    sourceKeys: RULEBOOK,
    explanation: `When an offense's set of downs begins less than 10 yards from the opponent's goal line, the line to gain cannot be a full 10 yards away, since that would be past the end zone. Instead, the goal line itself becomes the target, and the situation is announced as "goal-to-go" rather than with a specific yardage number.`,
    example: `An offense gains a first down at the opponent's 7-yard line. Since 7 yards is less than 10, the down is announced as "1st & Goal" rather than "1st & 10": the offense needs to reach the goal line, 7 yards away, within up to four downs, rather than a fixed 10-yard marker.`,
    whyItMatters: `Goal-to-go situations compress the field and remove a defense's usual cushion, which is why goal-line offense and goal-line defense are treated as their own specialized situations with different personnel and different plays than a team would use in open field.`,
    related: ['what-does-1st-and-goal-mean', 'red-zone-explained', 'short-yardage'],
  }),

  definition({
    slug: 'what-does-1st-and-goal-mean',
    title: 'What Does 1st & Goal Mean?',
    category: 'downs-and-yards',
    aliases: ['1st and goal meaning', 'first and goal football'],
    summary:
      "First down, with the goal line (not a yardage marker) as the target, inside the opponent's 10-yard line.",
    order: 130,
    sourceKeys: RULEBOOK,
    explanation: `"1st & Goal" is the down-and-distance call used instead of a specific yardage figure whenever a new set of downs begins inside the opponent's 10-yard line: the offense's target for that set is the goal line itself, not a fixed 10-yard marker.`,
    example: `A team converts a first down at the opponent's 4-yard line. Rather than "1st & 10" (which would place the line to gain past the back of the end zone), the situation is "1st & Goal from the 4."`,
    whyItMatters: `1st & Goal situations are among the highest-value in football: the offense is very close to a score, but the compressed field also makes defense easier in some ways (less room to create separation on routes, fewer running lanes), which is why "red zone efficiency," how often teams convert these situations into touchdowns rather than field goals, is a widely tracked team statistic.`,
    related: ['goal-to-go', 'red-zone-explained', 'touchdown-explained'],
  }),

  definition({
    slug: 'red-zone-explained',
    title: 'Red Zone Explained',
    category: 'downs-and-yards',
    alsoIn: ['start-here'],
    aliases: ['red zone meaning', 'what is the red zone in football'],
    summary:
      "The area from the opponent's 20-yard line to their goal line, where a score becomes the expected outcome.",
    order: 140,
    sourceKeys: GENERAL,
    explanation: `The red zone is the portion of the field between the opponent's 20-yard line and their goal line. It is not marked on the field itself; it is a broadcasting and strategic term for the zone close enough to the end zone that a possession there is expected to produce points, either a touchdown or, at minimum, a field goal.`,
    howItWorks: `Because the field compresses near the end zone, the space a defense has to cover shrinks along with it: deep passing routes lose their advantage since there is no more "deep" to threaten, so red-zone offense typically relies more on quick, well-designed short passing and the run than the rest of the field does.

"Red zone efficiency," the percentage of red-zone possessions that end in a touchdown rather than a field goal or nothing, is one of the most closely tracked situational team statistics, because reaching the red zone repeatedly without converting to touchdowns is a common way for an otherwise productive-looking offense to still lose.`,
    example: `A team drives 75 yards to reach the opponent's 18-yard line: now in the red zone. Three more plays fail to reach the end zone, and the team settles for a field goal instead of a touchdown. The drive gained plenty of yardage, but its "red zone trip" only produced 3 of a possible 6-8 points.`,
    whyItMatters: `Red zone efficiency separates teams that merely move the ball well from teams that convert that movement into maximum points, which is why analysts treat it as one of the clearest predictors of scoring output independent of total yardage.`,
    misunderstandings: `**The red zone is not painted or marked on the field itself;** it exists purely as a strategic and statistical zone, unlike the end zone, which is a real, marked area.`,
    related: ['what-does-1st-and-goal-mean', 'goal-to-go', 'field-position'],
  }),

  // ══ Scoring ══════════════════════════════════════════════════════════════════
  definition({
    slug: 'touchdown-explained',
    title: 'Touchdown Explained',
    category: 'scoring',
    aliases: ['touchdown meaning', 'what is a touchdown', 'td football'],
    summary:
      "Worth 6 points: reaching the opponent's end zone in possession of the ball, by any legal means.",
    isFeatured: true,
    order: 10,
    sourceKeys: [{ key: 'wp-touchdown' }, ...RULEBOOK],
    explanation: `A touchdown is scored when a team, while legally in possession of the ball, has any part of the ball break the plane of the opponent's goal line, or otherwise legally gains possession of the ball while in the opponent's end zone. It is worth 6 points, and is followed immediately by a try for 1 or 2 more.

A touchdown can be scored by a runner carrying the ball across the goal line, a receiver catching a pass while in the end zone, or a player recovering a loose ball (like a fumble or a blocked kick) there.`,
    example: `A running back takes a handoff at the opponent's 3-yard line and dives forward; before being tackled, the ball in his hands crosses the plane of the goal line. Touchdown, even though the runner himself has not yet physically landed in the end zone at the exact instant the ball crosses.`,
    whyItMatters: `The touchdown is the primary way points are scored in football and the reason offenses are built the way they are: a play designed to gain 5 yards is useful, but a play designed to reach the end zone is worth far more, which shapes both formations and play-calling near the goal line.`,
    misunderstandings: `**A touchdown does not require the ball carrier's body to be in the end zone,** only the ball, in possession, breaking the plane of the goal line; a runner can score while still airborne outside the end zone if the ball has already crossed the line.

**Scoring 6 points is not automatic once a touchdown happens;** the try immediately afterward is a separate play that can add 1, 2, or 0 more points.`,
    related: [
      'how-scoring-works',
      'what-happens-after-a-touchdown',
      'extra-point-explained',
      'two-point-conversion-explained',
    ],
  }),

  definition({
    slug: 'field-goal-explained',
    title: 'Field Goal Explained',
    category: 'scoring',
    aliases: ['field goal meaning', 'what is a field goal', 'fg football'],
    summary:
      "Worth 3 points: kicking the ball through the opponent's goalposts, usually attempted on 4th down.",
    order: 20,
    sourceKeys: [{ key: 'wp-field-goal' }, ...RULEBOOK],
    explanation: `A field goal is scored by kicking the ball through the uprights of the opponent's goalposts, above the crossbar and between the two posts, during a play from scrimmage. It is worth 3 points and is most commonly attempted on 4th down, when a team believes it can make the kick but is unlikely to convert a first down or reach the end zone.`,
    howItWorks: `The kicker (placekicker) kicks the ball off a holder, who receives the snap from a long snapper and sets the ball down for the kick. The line of scrimmage for the attempt is wherever the previous play ended, and the goalposts are fixed at the very back of the end zone, so the actual kick distance is the line of scrimmage plus roughly 17-18 yards (10 yards of end zone depth plus the 7-8 yards behind the line of scrimmage where the holder sets up).

If the kick misses, the ball is typically given to the defense at the spot of the kick (with a minimum spot at the previous line of scrimmage for kicks attempted from very close range), a meaningfully worse outcome for the kicking team's field position than simply punting would have been from certain distances.`,
    example: `4th & 8 from the opponent's 20-yard line: too far to comfortably convert, but well within field goal range. The team sends out its kicker to attempt a roughly 37-38-yard field goal (20 plus about 17-18) rather than risk turning the ball over on downs.`,
    whyItMatters: `Field goals let a team convert a stalled drive into points rather than nothing at all, which is why "getting into field goal range" is itself treated as a meaningful offensive goal, distinct from actually reaching the end zone.`,
    misunderstandings: `**A missed field goal is not automatically a turnover at the spot the kicker struck the ball from;** the defense generally takes over at the spot of the kick itself (or the previous line of scrimmage, whichever the rule specifies for that distance), which can be considerably further downfield.

**Field goal range is not a fixed number;** it depends on the specific kicker's leg strength, weather conditions, and altitude, so "in range" varies from team to team and week to week.`,
    related: ['how-scoring-works', 'when-should-teams-kick-a-field-goal', 'kicker-explained'],
  }),

  definition({
    slug: 'extra-point-explained',
    title: 'Extra Point Explained',
    category: 'scoring',
    aliases: ['extra point meaning', 'pat football', 'point after touchdown'],
    summary:
      'A 1-point kick attempted immediately after a touchdown, from a short, fixed distance.',
    order: 30,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `The extra point (formally, the try, and often called the PAT, point after touchdown) is a kick attempted immediately after a touchdown, worth 1 point if successful. In the NFL, the line of scrimmage for the try is set specifically to make the kick roughly a 33-yard attempt, a distance kickers convert at a very high rate but not automatically.`,
    example: `After a touchdown, a team lines up for the extra point rather than attempting a two-point conversion. The kick sails through the uprights: 1 point added, bringing the score for that touchdown to 7 total.`,
    whyItMatters: `Because it is a nearly automatic play, an extra point is treated by most teams as the default choice after a touchdown, with the alternative (going for two) reserved for specific game situations where 2 points is worth more than the marginal difference in success rate.`,
    misunderstandings: `**An extra point is not guaranteed.** Since the NFL moved the try back to make it a longer kick, the make rate, while still high, is noticeably below 100%, and missed extra points do happen and matter in close games.`,
    related: ['touchdown-explained', 'two-point-conversion-explained', 'why-teams-go-for-two'],
  }),

  definition({
    slug: 'two-point-conversion-explained',
    title: 'Two-Point Conversion Explained',
    category: 'scoring',
    aliases: ['two point conversion meaning', '2 point conversion football'],
    summary:
      'An alternative to the extra point: a single play from close range worth 2 points if it reaches the end zone.',
    order: 40,
    sourceKeys: [{ key: 'wp-two-point-conversion' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `Instead of kicking an extra point, a team can attempt a two-point conversion: one offensive play (a run or a pass) from a short distance, worth 2 points if it results in a touchdown, and worth 0 points if it fails. There is no partial credit and no second chance.`,
    example: `Down 8 points late in the game, a team scores a touchdown to make it 8-6 (before the try). An extra point would make it 8-7, still a loss if the game ends there; a successful two-point conversion makes it 8-8, a tie. In that exact situation, going for two is the only choice that gives the team a chance to tie rather than guarantee a loss if no more scoring happens.`,
    whyItMatters: `The two-point conversion turns the try into a genuine strategic decision rather than a formality, because the specific number a team is trying to reach (to tie, to take the lead by a particular margin) sometimes makes 2 points strictly more valuable than 1, independent of the play's success rate.`,
    misunderstandings: `**A two-point conversion is not simply "the aggressive option";** in most situations, an extra point is the higher expected-value choice, because a two-point attempt succeeds at a meaningfully lower rate than an extra point kick does. It is chosen specifically when the game situation, not just boldness, calls for it.`,
    related: ['extra-point-explained', 'why-teams-go-for-two', 'touchdown-explained'],
  }),

  definition({
    slug: 'safety-explained',
    title: 'Safety Explained',
    category: 'scoring',
    aliases: ['safety meaning football', 'what is a safety in football'],
    summary:
      'Worth 2 points to the defense: tackling an offensive player with the ball in their own end zone.',
    order: 50,
    sourceKeys: [{ key: 'wp-safety-score' }, ...RULEBOOK],
    explanation: `A safety is scored by the defense, worth 2 points, when the offense is responsible for the ball becoming dead in its own end zone. Most commonly this happens when the ball carrier is tackled there, but it can also result from specific penalties committed by the offense while the ball is in their own end zone, or a fumble that goes out of the back of the offense's own end zone.`,
    howItWorks: `After a safety, the scored-upon team must give the ball to the scoring team via a free kick from its own 20-yard line, which also functions as a field-position swing on top of the 2 points: the team that just conceded a safety now has to kick the ball away rather than receive it.`,
    example: `An offense backed up near its own goal line runs a play; the quarterback is sacked in the end zone before he can get rid of the ball. Safety: 2 points to the defense, and the offense's team must now free-kick the ball back to the opponent.`,
    whyItMatters: `A safety is rare but disproportionately damaging, because it combines points scored against a team with the loss of the ball and the requirement to kick it away, unlike almost any other defensive score, which is why it is treated as a distinct and especially costly event rather than "just 2 points."`,
    misunderstandings: `**A safety is not the same as an interception or fumble recovery returned for a touchdown;** those are worth 6 points as touchdowns. A safety specifically requires the ball to become dead in the offense's own end zone due to the offense's own action, not the defense advancing it anywhere.`,
    related: ['how-scoring-works', 'defensive-touchdowns', 'qb-sack-explained'],
  }),

  tactic({
    slug: 'why-teams-go-for-two',
    title: 'Why Teams Go for Two',
    category: 'scoring',
    aliases: ['why go for 2 in football', 'two point conversion strategy'],
    summary:
      'Teams attempt a two-point conversion when the specific point total it would produce is worth more than the safer extra point.',
    difficulty: 'intermediate',
    order: 60,
    sourceKeys: RULEBOOK,
    howItWorks: `Coaches, often working from a published two-point conversion chart, weigh the current score margin, how much time remains, and how many more scores either team is realistically likely to get, against the different success rates of a two-point attempt versus an extra point kick.

The chart logic boils down to: if reaching a specific total (tying the game, or taking a lead by a particular number of points that changes what the opponent must do next) requires 2 points rather than 1, and a two-point attempt is the only way to reach exactly that total on this scoring play, coaches will take the lower-probability play to have a chance at the outcome that actually matters, rather than the higher-probability play that guarantees a worse outcome.`,
    whyItMatters: `Down 14 late in a game, a team that scores twice needs at least one two-point conversion to tie, since two touchdowns plus two extra points is only 14, still one point short; the chart therefore recommends going for two after the first touchdown in that specific sequence, well before it looks urgent to a casual viewer.`,
    counters: `Defenses facing a two-point attempt know it is a single, all-or-nothing play from short range, and typically bring extra defenders near the goal line rather than the coverage shell they might use on a normal down, since there is no need to defend anything beyond the end zone.`,
    misunderstandings: `**"Going for two" is not simply the bolder or more exciting choice;** it is frequently the mathematically correct one given the specific score, and coaches who decline to go for two in a chart-recommended spot are often criticized by analysts precisely because the numbers favor it.`,
    related: ['two-point-conversion-explained', 'extra-point-explained', 'how-scoring-works'],
  }),

  // ══ Positions ═════════════════════════════════════════════════════════════════
  positionRole({
    slug: 'quarterback-explained',
    title: 'Quarterback Explained',
    category: 'positions',
    aliases: ['qb football position', 'what does a quarterback do'],
    summary:
      'The offensive player who takes the snap and directs almost every play: handing off, throwing, or running.',
    isFeatured: true,
    order: 10,
    sourceKeys: [{ key: 'wp-quarterback' }],
    responsibilities: `The quarterback lines up under center or in shotgun, receives the snap, and from there either hands the ball to a running back, throws a pass, or runs with it himself. On almost every offensive play, the quarterback is the first player to touch the ball and the one whose decision (and its execution) most directly determines what kind of play unfolds from there.

Before the snap, the quarterback is also frequently responsible for reading the defense's alignment and, where the offense allows it, changing the called play at the line (an audible) if the original call looks unfavorable against what the defense is showing.

After the snap on a passing play, the quarterback has to read the defense's coverage in real time, decide which of several potential receivers is open, and get rid of the ball, all typically within 2-3 seconds before a pass rush arrives.`,
    profile: `Quarterbacks vary widely in style: some are primarily "pocket passers" who rely on quick, accurate decision-making from within the protection of their offensive line, while others are "dual-threat" quarterbacks who regularly run the ball themselves when a passing play breaks down or a designed run is called for them.`,
    whyItMatters: `The quarterback is generally considered the most influential position in football, both because of how much of the offense's decision-making runs through them on every single play, and because of how the sport's rules and roster-building have evolved around protecting and developing the position: it is by far the highest-paid position in the NFL on average, and teams routinely build entire offenses and drafting strategies around acquiring and developing one.`,
    variations: `A "game manager" quarterback is one whose team relies on the rest of the roster (running game, defense) more than on the quarterback taking risks, while a "gunslinger" is more willing to attempt difficult, high-reward throws even at higher interception risk. Neither label is a formal rule category; both describe a style of decision-making.`,
    misunderstandings: `**The quarterback does not call every play from scratch on the field.** Most NFL plays are relayed from a coach on the sideline (via a helmet radio, on offense) before the huddle or at the line, though the quarterback frequently has some authority to change it based on what he sees.

**Running with the ball is not against the rules for a quarterback,** even though many are primarily passers; a scramble or a designed quarterback run is a completely legal and common part of many offenses.`,
    related: [
      'american-football-positions-explained',
      'passing-play-explained',
      'how-to-evaluate-a-qb',
      'pocket-presence-explained',
    ],
  }),

  // ══ Passing ═══════════════════════════════════════════════════════════════════
  rule({
    slug: 'forward-pass-rules',
    title: 'Forward Pass Rules',
    category: 'passing',
    aliases: ['forward pass explained', 'legal forward pass rules'],
    summary:
      'Only one forward pass is allowed per play, thrown by a player behind the line of scrimmage, to an eligible receiver.',
    order: 10,
    sourceKeys: [{ key: 'wp-forward-pass' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `A legal forward pass has several requirements. The passer must be behind the line of scrimmage at the moment the ball is released (a forward pass thrown from beyond the line is an illegal forward pass, penalized as a foul). Only one forward pass is permitted per play from scrimmage.

The pass must be intended for an eligible receiver: generally, the players lined up at the ends of the offensive line, and any offensive player lined up in the backfield off the line, are eligible; interior offensive linemen are not, and catching a pass as an ineligible receiver (or being illegally downfield to block for one) is a foul.

If a forward pass hits the ground without being caught, it is simply an incomplete pass: the down ends, the ball returns to the previous line of scrimmage, and the next down begins from there with no other penalty, unless a foul (like defensive pass interference) also occurred on the play.`,
    example: `A quarterback drops back several yards behind the line of scrimmage and throws downfield to a wide receiver, who is lined up at the end of the formation and is therefore eligible. The pass falls incomplete: no penalty, the ball returns to the previous spot, and the next down begins.`,
    inPractice: `A pass thrown from beyond the line of scrimmage, even accidentally (a quarterback scrambling forward past the line before throwing), is flagged as illegal, typically a loss of down and yardage back to the previous spot, unless the defense declines the penalty in favor of the result of the play.`,
    whyItMatters: `The rule limiting teams to one forward pass per play, from behind the line, is the foundational structure that separates the forward pass from a lateral (a pass thrown sideways or backward, which has none of these restrictions and can happen any number of times on a single play); understanding the distinction is necessary for other rules like fumble recovery and trick plays.`,
    misunderstandings: `**A backward pass (a lateral) is not restricted the same way;** multiple laterals are allowed on a single play, and a lateral that hits the ground is a live, loose ball (like a fumble), not simply an incomplete pass.`,
    related: [
      'what-counts-as-a-reception',
      'interception-explained',
      'intentional-grounding-explained',
    ],
  }),

  definition({
    slug: 'interception-explained',
    title: 'Interception Explained',
    category: 'passing',
    alsoIn: ['turnovers'],
    aliases: ['interception meaning', 'what is an interception in football', 'int football'],
    summary:
      'A pass caught by a defensive player instead of the intended receiver, turning possession over immediately.',
    order: 20,
    sourceKeys: RULEBOOK,
    explanation: `An interception happens when a defensive player gains possession of a forward pass thrown by the offense, instead of the intended receiver catching it. Possession changes immediately at the spot of the catch (or wherever the interception is eventually stopped, if the defender runs with it).`,
    example: `A quarterback throws downfield toward a receiver who is well covered; the cornerback reads the pass, steps in front of the receiver, and catches the ball himself before it reaches the intended target. That is an interception: the offense's drive ends instantly, and the defense now has possession, potentially even returning it for a touchdown if the defender breaks free.`,
    whyItMatters: `An interception is one of the most damaging plays in football for the offense: not only is the current drive lost, but possession changes at whatever spot the interception is returned to, often costing significant field position on top of the lost opportunity to score.`,
    misunderstandings: `**Not every pass caught by a defender is an interception;** a defensive player who catches a ball that has already touched the ground has not made a legal catch at all (the pass would instead be ruled incomplete).`,
    related: [
      'forward-pass-rules',
      'fumble-explained',
      'why-turnovers-matter',
      'pick-six-explained',
    ],
  }),

  definition({
    slug: 'qb-sack-explained',
    title: 'QB Sack Explained',
    category: 'passing',
    aliases: ['sack meaning football', 'what is a sack in football'],
    summary:
      'A defensive tackle of the quarterback behind the line of scrimmage before he can throw or hand off the ball.',
    order: 30,
    sourceKeys: RULEBOOK,
    explanation: `A sack occurs when a defensive player tackles the quarterback (or otherwise brings him down, including by forcing him out of bounds) behind the line of scrimmage while he is attempting to pass, before he releases the ball. It counts as a loss of yardage for the offense, moving the ball backward from where the play began.`,
    example: `A pass rush beats its blocker and reaches the quarterback before he can throw. He is tackled 7 yards behind the original line of scrimmage. That is a sack: a 7-yard loss, and the next down begins from the new, further-back spot.`,
    whyItMatters: `A sack is doubly costly for an offense: it loses yardage (making the next down harder to convert) and it eats into the play clock and the quarterback's ability to operate freely, which is why pass protection (the offensive line's job of preventing sacks) is treated as one of the most important, if least visible, jobs on an offense.`,
    misunderstandings: `**A sack is not the same as a tackle for loss on a running play;** the term specifically applies to bringing down the quarterback on what was intended as, or became, a passing play, not a running back tackled behind the line on a run.`,
    related: [
      'roughing-the-passer-explained',
      'offensive-line-explained',
      'pocket-presence-explained',
    ],
  }),

  rule({
    slug: 'what-counts-as-a-reception',
    title: 'What Counts as a Reception?',
    category: 'passing',
    alsoIn: ['replay-and-officiating'],
    aliases: ['catch rule football', 'what is a legal catch nfl'],
    summary:
      'Control of the ball, both feet (or another body part) down in bounds, and a football move, all required for a completed catch.',
    difficulty: 'intermediate',
    order: 40,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `For a pass to be ruled a completed catch, a receiver must: gain control of the ball; get both feet (or any other part of the body other than a hand) down inbounds while maintaining control; and, if going to the ground in the process, maintain control through contact with the ground. In addition, the receiver must clearly become a runner, sometimes described as completing a "football move," such as taking an additional step, turning up field, or reaching the ball toward the goal line.

If a receiver loses control of the ball as they hit the ground, even briefly, before establishing themselves as a runner, the pass is ruled incomplete rather than a catch followed by a fumble.`,
    example: `A receiver leaps to catch a pass near the sideline, comes down with one foot clearly in bounds and drags the second foot down before going out of bounds. If he maintains possession throughout, it is a completed catch; if the ball comes loose as his second foot lands, it is instead ruled incomplete.`,
    inPractice: `This rule has historically been one of the most contentious in the NFL, revised multiple times, because "going to the ground" catches and close sideline plays are genuinely difficult to adjudicate in real time and are among the plays most frequently sent to replay review.`,
    whyItMatters: `Because the definition requires possession to survive all the way to becoming a runner (or landing with control, if going to the ground), a play that looks like an obvious catch in real-time replay can still be overturned on review if the ball moves even slightly during the process, which is a common source of confusion for newer fans.`,
    misunderstandings: `**A "catch" is not decided the instant the receiver's hands close around the ball;** the full sequence, including ground contact if applicable, has to be completed with possession intact before the play is ruled a catch.`,
    related: ['forward-pass-rules', 'replay-review-explained'],
  }),

  // ══ Receiver Routes ═══════════════════════════════════════════════════════════
  tactic({
    slug: 'route-tree-explained',
    title: 'Route Tree Explained',
    category: 'receiver-routes',
    aliases: ['route tree football', 'receiver routes explained', 'passing routes'],
    summary:
      'The standard set of numbered paths a receiver can run, each designed to attack a different part of the field.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: GENERAL,
    howItWorks: `The route tree is the vocabulary of receiver routes: a set of named (often numbered) patterns a receiver runs after the snap, each breaking in a specific direction at a specific depth. A "slant" breaks quickly toward the middle of the field at a shallow depth; a "go" (or "fly") route simply runs straight downfield; a "post" breaks toward the goalpost at depth; a "curl" runs downfield and then turns back toward the quarterback.

Which route a receiver runs on a given play is called in the play design, and it is chosen specifically to attack whatever weakness the offense expects in the defense's coverage: a quick slant beats tight man coverage that leaves no cushion, while a deep post is designed to exploit a single deep safety who cannot cover the whole width of the field alone.`,
    whyItMatters: `Understanding the route tree is what turns "the receiver ran downfield and caught it" into a legible tactical event: a broadcast analyst describing a "slant against off coverage" or "a receiver working an out route to beat zone" is naming the specific route and the specific coverage weakness the play was designed to attack.`,
    counters: `Defenses counter specific routes with specific technique: press coverage disrupts a receiver's timing on quick routes like the slant, while a deep safety (or two) is positioned specifically to take away the go route and the post before they turn into big plays.`,
    variations: `Some routes are "option routes," where the receiver reads the defender's leverage after the snap and chooses which way to break, rather than running a single pre-determined path; these require more chemistry and practice time with the quarterback than fixed routes do.`,
    misunderstandings: `**Not every receiver runs a full route on every play;** many plays are designed with some receivers running routes purely to occupy defenders (a decoy) while the ball is intended elsewhere from the start.`,
    related: ['wide-receiver-explained', 'man-coverage-explained', 'zone-coverage-explained'],
  }),

  // ══ Running Game ══════════════════════════════════════════════════════════════
  tactic({
    slug: 'zone-running-explained',
    title: 'Zone Running Explained',
    category: 'running-game',
    aliases: ['zone blocking football', 'zone run scheme'],
    summary:
      'A blocking scheme where linemen block an area rather than a specific defender, and the runner picks the gap that opens.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: GENERAL,
    howItWorks: `In a zone running scheme, offensive linemen are not assigned to block one specific defender; instead, each blocks an area (a "zone") in front of him and works in coordination with the linemen beside him, often double-teaming a defender at the snap before one of the two blockers releases to the second level. The running back reads how the defense's front reacts as the play develops, then picks whichever gap has opened rather than following a single predetermined path.`,
    whyItMatters: `Zone running is popular in the modern NFL partly because it is more adaptable than a scheme that assigns each blocker a specific man: if a single defender wins his individual matchup, the runner can often still find a lane elsewhere, since the blocking is designed around covering space rather than a fixed assignment that fails outright if one block is lost.`,
    counters: `Defenses counter zone runs by "gap discipline," each defender staying responsible for his assigned gap rather than chasing the ball, since zone schemes are specifically designed to punish defenders who abandon their gap to make an aggressive play.`,
    variations: `"Inside zone" directs the blocking and the runner's initial aiming point toward the interior gaps near the center; "outside zone" (or "wide zone") aims further outside, asking linemen to work laterally before turning the play upfield.`,
    related: ['running-back-explained', 'read-option-explained', 'offensive-line-explained'],
  }),

  tactic({
    slug: 'read-option-explained',
    title: 'Read Option Explained',
    category: 'running-game',
    aliases: ['read option football', 'zone read explained'],
    summary:
      'A running play where the quarterback decides after the snap whether to hand off or keep the ball, based on an unblocked defender.',
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: GENERAL,
    howItWorks: `In a read option, the offense deliberately leaves one defender (usually a defensive end) unblocked. The quarterback, after the snap, watches that defender's reaction: if the defender crashes inside to stop the running back, the quarterback keeps the ball and runs around the edge himself; if the defender stays outside to contain the quarterback, the quarterback hands the ball off to the running back through the middle instead.`,
    whyItMatters: `The read option effectively turns one unblocked defender into a disadvantage for the defense rather than the offense, since whichever way he commits, the offense has a play designed to attack the space he vacated; it requires a quarterback comfortable and effective running the ball, which is why it became far more common in the NFL as mobile, dual-threat quarterbacks became more prevalent.`,
    counters: `Defenses counter the read option by assigning a specific player (often a linebacker or safety, not just the read defender) to "spy" the quarterback specifically, taking away his keep option regardless of how the unblocked defender reads the play.`,
    misunderstandings: `**The read option is not the same play every time it is called;** the actual outcome (handoff or quarterback keep) is decided live, after the snap, based on the defense's reaction, not predetermined in the huddle.`,
    related: ['zone-running-explained', 'quarterback-explained', 'rpo-explained'],
  }),

  // ══ Offensive Formations ══════════════════════════════════════════════════════
  tactic({
    slug: 'personnel-groupings-explained',
    title: 'Personnel Groupings Explained',
    category: 'offensive-formations',
    aliases: [
      '11 personnel football',
      'personnel packages explained',
      'football personnel notation',
    ],
    summary:
      'A two-digit code naming how many running backs and tight ends are on the field; everyone else is a receiver.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: GENERAL,
    howItWorks: `Personnel groupings are described with a two-digit number: the first digit is the number of running backs on the field, the second is the number of tight ends. Whatever remains, out of the standard five skill-position players beyond the offensive line and quarterback, is assumed to be wide receivers.

"11 personnel" means 1 running back, 1 tight end, and therefore 3 receivers (since 1 + 1 + 3 = 5). "12 personnel" means 1 running back, 2 tight ends, and 2 receivers. "21 personnel" means 2 running backs, 1 tight end, and 2 receivers.`,
    example: `A team lines up in 11 personnel on 2nd & 7: one running back, one tight end, three receivers. On the next play, facing 3rd & 1, it substitutes to 21 personnel: two running backs (adding a fullback), one tight end, two receivers, a heavier grouping built to run the ball rather than spread the field.`,
    whyItMatters: `Personnel groupings are a first, quick signal (before the actual play is even known) of what kind of play is likely coming: heavier groupings (more backs and tight ends, fewer receivers) tend to signal a run-focused play, while lighter groupings (like 10 or 11 personnel) tend to signal more passing, though good offenses deliberately vary this to keep a defense from simply reading the personnel and knowing the play.`,
    misunderstandings: `**Personnel grouping is not the same thing as formation.** "11 personnel" describes which players (by position) are on the field; the same personnel grouping can be arranged into many different formations (shotgun, under center, spread wide, bunched together) depending on the specific play called.`,
    related: [
      'shotgun-formation-explained',
      'tight-end-explained',
      'american-football-positions-explained',
    ],
  }),

  tactic({
    slug: 'shotgun-formation-explained',
    title: 'Shotgun Formation Explained',
    category: 'offensive-formations',
    aliases: ['shotgun football', 'what is shotgun formation'],
    summary:
      'The quarterback lines up several yards behind the line of scrimmage rather than directly behind the center.',
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: GENERAL,
    howItWorks: `In shotgun, the quarterback stands roughly 5-7 yards behind the line of scrimmage at the snap, and the center snaps the ball back to him through the air rather than handing it directly. This gives the quarterback extra time and a clearer pre-snap view of the defense before he has to decide what to do with the ball, at the cost of some of the deception and immediate running-game options that lining up directly under center provides.`,
    whyItMatters: `Shotgun has become the dominant formation in the modern NFL for passing situations specifically because of that extra reaction time: a quarterback who is already several yards deep does not need to take a dropback after the snap, effectively giving him a head start against an incoming pass rush.`,
    counters: `Defenses do not have a formation-specific counter to shotgun by itself, but they do tend to anticipate a higher likelihood of a passing play when an offense lines up in shotgun on early downs, and adjust their coverage calls accordingly.`,
    variations: `"Pistol" is a related but distinct formation, with the quarterback only about 3-4 yards deep (shallower than shotgun) and a running back stacked directly behind him, blending some of shotgun's advantages with more traditional under-center running game options.`,
    misunderstandings: `**Shotgun is not exclusively a passing formation;** many offenses run the ball frequently out of shotgun as well, particularly using zone-read and other schemes that specifically benefit from the quarterback already facing the defense at the snap.`,
    related: ['personnel-groupings-explained', 'quarterback-explained', 'read-option-explained'],
  }),

  // ══ Defense Basics ════════════════════════════════════════════════════════════
  standard({
    slug: 'how-nfl-defense-works',
    title: 'How NFL Defense Works',
    category: 'defense-basics',
    aliases: ['nfl defense explained', 'how does football defense work'],
    summary:
      'Eleven defenders try to stop the offense from gaining yards, by stopping the run, rushing the passer, and covering receivers.',
    order: 10,
    sourceKeys: GENERAL,
    explanation: `A defense's job on every play is to prevent the offense from gaining yardage, ultimately trying to force a stalled drive (a punt or a turnover on downs), a turnover, or, in the red zone, at least a field goal rather than a touchdown.

Every defensive play blends three jobs: stopping the run (defenders filling gaps and tackling the ball carrier before he gains ground), rushing the passer (pressuring or sacking the quarterback before he can throw), and coverage (denying receivers open space to catch a pass). A defensive play call decides how many players are assigned to each job.`,
    howItWorks: `Before the snap, the defense reads the offense's formation and personnel and calls a scheme accordingly: how many down linemen, how many linebackers, how many defensive backs, and what coverage shell (man or zone) those defensive backs will play. After the snap, defenders execute that assignment while reacting live to what the offense actually does.`,
    example: `Facing 3rd & 12, a defense might substitute extra defensive backs (a "nickel" or "dime" package) specifically to improve pass coverage, accepting a weaker run defense in exchange, since a long-yardage situation makes a run play by the offense far less likely to convert anyway.`,
    whyItMatters: `Because a defense's alignment and coverage call change from play to play based on the situation, reading the defense's personnel and shell before the snap is one of the core skills a quarterback (and an experienced viewer) develops, and is a major part of what separates a good defensive scheme from a predictable one.`,
    misunderstandings: `**A defense is not simply "trying to tackle whoever has the ball" without a plan;** every player has a specific pre-snap assignment (a gap, a zone, a man to cover), and a defense breaking down usually means one of those assignments was beaten, not that no plan existed.`,
    related: [
      'how-nfl-defense-works',
      'blitz-explained',
      'man-coverage-explained',
      'zone-coverage-explained',
    ],
  }),

  tactic({
    slug: 'blitz-explained',
    title: 'Blitz Explained',
    category: 'defense-basics',
    aliases: ['blitz football meaning', 'what is a blitz'],
    summary:
      'A defensive tactic sending extra pass rushers at the quarterback, beyond the usual defensive line.',
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: GENERAL,
    howItWorks: `On a normal passing down, a defense typically rushes its front four (or three) defensive linemen while everyone else drops into coverage. A blitz sends one or more additional defenders (usually linebackers or defensive backs) to rush the passer as well, trying to overwhelm the offensive line's blockers and reach the quarterback more quickly than a standard rush would.

Because those extra rushers are pulled from coverage duty, a blitz is a trade-off: more pressure on the quarterback, but fewer defenders available to cover receivers, which is exactly what makes a well-timed pass against a blitz (especially a quick throw to the area a blitzing defender just vacated) so valuable to an offense.`,
    whyItMatters: `Blitzing is a high-risk, high-reward call: it increases the chance of a sack or a rushed, inaccurate throw, but if the offense correctly anticipates it and gets the ball out quickly to the open man, a blitz can turn into a big offensive gain precisely because of the coverage it sacrificed to send extra rushers.`,
    counters: `Offenses counter a blitz with "hot routes," quick, short passing options the receivers and quarterback have already agreed on for exactly this situation, designed to get the ball out before the extra rushers can arrive, and with max protection schemes that keep extra blockers in to pick up the rush instead.`,
    variations: `A "zone blitz" sends extra rushers while dropping a defensive lineman into coverage instead, disguising who is actually rushing and who is covering until after the snap.`,
    misunderstandings: `**A blitz is not defined by a specific number of rushers;** any time the defense sends more rushers than it typically would on a standard down (commonly five or more, when four is standard), it is described as a blitz.`,
    related: ['how-nfl-defense-works', 'qb-sack-explained', 'zone-blitz-explained'],
  }),

  // ══ Pass Coverages ════════════════════════════════════════════════════════════
  tactic({
    slug: 'man-coverage-explained',
    title: 'Man Coverage Explained',
    category: 'pass-coverages',
    aliases: ['man to man coverage football', 'man coverage nfl'],
    summary:
      'Each defensive back is assigned to follow one specific offensive receiver wherever he goes.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `In man coverage, a defender (usually a cornerback for outside receivers, a linebacker or safety for backs and tight ends) is assigned to one specific offensive player and follows him through his route, rather than being responsible for a fixed area of the field. Success depends heavily on the individual defender's ability to match the receiver's speed, change of direction, and route technique.`,
    whyItMatters: `Man coverage lets a defense commit extra defenders to blitzing (since coverage responsibility is spread across specific individuals rather than needing to fill zones across the field) but exposes it to being beaten by a single receiver who simply outmatches his defender individually, since there is no help unless a safety is specifically assigned to assist.`,
    counters: `Offenses attack man coverage with route concepts designed to create separation through picks, rubs, and route combinations that force a defender to fight through traffic, or simply by isolating a fast receiver against a slower defender in single coverage.`,
    variations: `"Press man" has the cornerback line up directly on the receiver at the line of scrimmage, trying to disrupt his route before it starts; "off man" gives a cushion of several yards, trading disruption at the line for a better angle to react to the route as it develops.`,
    misunderstandings: `**Man coverage does not mean zero help from teammates;** a defense can play man coverage on most receivers while still assigning a safety to help over the top against the most dangerous route, a hybrid often called "man coverage with a safety over the top."`,
    related: ['zone-coverage-explained', 'cover-2-explained', 'route-tree-explained'],
  }),

  tactic({
    slug: 'zone-coverage-explained',
    title: 'Zone Coverage Explained',
    category: 'pass-coverages',
    aliases: ['zone defense football', 'zone coverage nfl'],
    summary:
      'Each defensive back is assigned to cover an area of the field, reacting to whichever receiver enters it.',
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `In zone coverage, a defender is responsible for a specific area of the field rather than a specific player. He reads the quarterback and the routes developing around him, and reacts to whichever offensive player comes into his zone, potentially passing a receiver off to a neighboring defender as routes cross between zones.`,
    whyItMatters: `Zone coverage generally keeps more defenders in position to see the quarterback and the whole field, which makes it harder to attack with a single fast receiver in isolation, but it creates natural seams and soft spots between zones, especially where two defenders' areas meet, that route concepts are specifically designed to exploit.`,
    counters: `Offenses attack zone coverage by "flooding" a zone with more receivers than the defenders assigned to it can cover, or by attacking the seams between adjacent zones with routes timed to arrive exactly as one defender is handing responsibility to the next.`,
    variations: `Different zone shells (Cover 2, Cover 3, Cover 4) divide the field differently, most obviously by how many defenders are responsible for the deep part of the field versus the shorter, underneath areas.`,
    misunderstandings: `**Zone coverage is not "nobody covering anybody";** every defender still has a specific, defined area of responsibility, and a receiver catching a pass in a gap between two zones usually means a specific coverage bust or a well-designed route, not simply that zone coverage leaves the field open.`,
    related: ['man-coverage-explained', 'cover-2-explained', 'cover-3-explained'],
  }),

  tactic({
    slug: 'cover-2-explained',
    title: 'Cover 2 Explained',
    category: 'pass-coverages',
    aliases: ['cover 2 defense', 'tampa 2 basics', 'cover two football'],
    summary:
      'A zone shell with two deep safeties splitting the field, and everyone else covering shorter zones underneath.',
    difficulty: 'intermediate',
    order: 30,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `In a Cover 2 shell, the two safeties each take responsibility for one deep half of the field (left and right), rather than one safety covering the whole deep area. Underneath them, cornerbacks and linebackers divide the shorter and intermediate zones, typically five underneath defenders splitting the width of the field into shorter areas.

Because each safety only has to cover half the field's width rather than the whole thing, Cover 2 is generally strong against the deep outside passing routes near each sideline, since a safety starts already shaded toward that half.`,
    whyItMatters: `Cover 2's specific weakness, the deep middle of the field (the area directly between the two safeties, and beyond the shorter zone defenders but before either safety's half fully covers it) is well known enough that offenses specifically design routes, most classically a deep "seam" or post route run by a tight end or slot receiver, to attack exactly that gap.`,
    counters: `A tight end or receiver running a deep route straight up the middle, splitting the two safeties before either can fully commit to help, is the standard way to attack the coverage's structural gap; a cornerback jamming a receiver hard at the line can also disrupt the timing a Cover 2 shell depends on underneath.`,
    variations: `"Tampa 2" is a well-known Cover 2 variant where the middle linebacker drops deep into that exact gap between the safeties on passing downs, specifically to close the coverage's known weakness, at the cost of needing a linebacker fast enough to reliably get there.`,
    misunderstandings: `**Cover 2 is not the same call as "two-deep look" pre-snap;** many defenses show two deep safeties before the snap and then rotate into a different coverage entirely once the ball is snapped, specifically to disguise their actual assignment from the quarterback.`,
    related: ['zone-coverage-explained', 'cover-3-explained', 'route-tree-explained'],
  }),

  tactic({
    slug: 'cover-3-explained',
    title: 'Cover 3 Explained',
    category: 'pass-coverages',
    aliases: ['cover 3 defense', 'cover three football'],
    summary:
      'A zone shell with three deep defenders splitting the field into thirds, and four underneath.',
    difficulty: 'intermediate',
    order: 40,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `In Cover 3, one safety and both cornerbacks each take a third of the field deep (left, middle, and right), while four remaining defenders (usually linebackers and the other safety) cover shorter zones underneath. Splitting the deep field three ways rather than two closes the deep-middle gap that a Cover 2 shell leaves open.`,
    whyItMatters: `Because it commits only one deep defender to the middle third rather than needing two safeties to combine there, Cover 3 tends to be more vulnerable underneath, particularly to the flat areas near the sideline just past the line of scrimmage, since fewer defenders are dedicated to those shorter zones compared to a coverage built around them.`,
    counters: `Quick routes to the flats, and route combinations designed to overload one of the underneath zone defenders with two receiving threats at once, are standard ways offenses attack Cover 3's shorter zones.`,
    variations: `Some Cover 3 variants roll a cornerback down into an underneath zone (a "sky" or "cloud" rotation) rather than keeping all three deep defenders purely deep, trading some deep-field integrity for better run support or underneath coverage.`,
    related: ['cover-2-explained', 'zone-coverage-explained', 'man-coverage-explained'],
  }),

  // ══ Clock & Game Management ═══════════════════════════════════════════════════
  rule({
    slug: 'two-minute-warning-explained',
    title: 'Two-Minute Warning Explained',
    category: 'clock-and-game-management',
    aliases: ['two minute warning nfl', 'what is the two minute warning'],
    summary:
      'An automatic stoppage in the NFL when 2 minutes remain in each half, functioning like a bonus timeout for both teams.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: [{ key: 'wp-two-minute-warning' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `In the NFL, the game clock is automatically stopped once when exactly 2:00 remains in the second and fourth quarters, regardless of whether the ball is in play at that moment. This stoppage happens whether or not either team has called a timeout, and functions similarly to a timeout in giving both teams a chance to regroup, though it does not count against a team's own timeout total.

After the two-minute warning, several rules that apply throughout the game become more consequential in practice: any play that ends out of bounds stops the clock, and the offense's ability to spike the ball or use its remaining timeouts becomes central to managing the little time left.`,
    example: `A team trailing by 4 points takes possession with 2:15 left in the fourth quarter. A single incomplete pass or a run out of bounds is enough to reach the two-minute warning with the clock automatically stopped, effectively giving the offense a free pause to plan its next several plays without having to burn one of its own timeouts to do so.`,
    inPractice: `Because the stoppage is guaranteed and automatic, coaches often plan the play just before the two-minute warning somewhat conservatively, knowing a natural break is coming regardless of the outcome of that specific play.`,
    whyItMatters: `The two-minute warning is one of the reasons the closing minutes of an NFL half take up a disproportionate amount of real broadcast time relative to game clock remaining: it adds a guaranteed stoppage on top of the sideline timeouts both teams already have, stretching out the most tactically dense part of the game.`,
    misunderstandings: `**The two-minute warning is not a rule found in college football,** which has no equivalent automatic stoppage; it is specifically an NFL rule.`,
    related: [
      'how-an-nfl-game-is-structured',
      'two-minute-drill-explained',
      'taking-a-knee-explained',
    ],
  }),

  // ══ Penalties ══════════════════════════════════════════════════════════════════
  standard({
    slug: 'penalties',
    title: 'How Penalties Work',
    category: 'penalties',
    aliases: ['football penalties explained', 'how do penalties work in football'],
    summary:
      'A rule infraction that costs the offending team yardage, a replayed down, a lost down, or some combination.',
    order: 10,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    explanation: `When a player commits a foul, an official throws a yellow flag onto the field to mark the spot, and play typically continues until the down ends (except for certain fouls, like intentional grounding, that are whistled dead immediately). After the play, the penalty is announced, and the offended team is usually given a choice of whether to accept the penalty (undoing the play's result and applying the yardage instead) or decline it (keeping the result of the play as it happened).`,
    howItWorks: `Penalties fall broadly into two categories: those enforced from the previous line of scrimmage (most pre-snap fouls, like false start or offside) and those enforced from the spot of the foul itself (many fouls that happen during the play, like defensive holding well downfield). Some penalties also carry an automatic first down for the offense, most notably several defensive fouls, regardless of the yardage gained.

Yardage amounts are fixed by the specific foul: many pre-snap penalties cost 5 yards, while more serious fouls, like defensive holding or roughing the passer, cost 10 to 15 yards and often an automatic first down as well.`,
    example: `A receiver draws a defensive pass interference penalty on an incomplete deep pass. Rather than the play standing as an incompletion, the penalty is enforced at the spot of the foul, potentially moving the ball far downfield, well beyond what the play itself would have gained, and awarding an automatic first down.`,
    whyItMatters: `Because penalties can swing field position and down-and-distance so dramatically, on offense as well as defense, they are treated as genuine strategic risk: a defense weighing whether to play aggressive, contact-heavy coverage against a critical 3rd-down pass has to balance the chance of a stop against the risk of a penalty that would give the offense an even better outcome than simply converting normally.`,
    misunderstandings: `**A penalty flag does not automatically mean the play is dead;** most fouls are marked and enforced after the play concludes naturally, which is why announcers often say "there's a flag, but the play continues" during a live broadcast.

**Declining a penalty is not unusual or a sign of a mistake;** if the result of the play (say, a sack, or a turnover) benefits the fouled-upon team more than the penalty yardage would, declining is the correct, common choice.`,
    related: [
      'false-start-explained',
      'holding-explained',
      'pass-interference-explained',
      'roughing-the-passer-explained',
    ],
  }),

  rule({
    slug: 'false-start-explained',
    title: 'False Start Explained',
    category: 'penalties',
    aliases: ['false start penalty', 'false start nfl'],
    summary:
      'An offensive player moves illegally before the snap, most often a lineman flinching. Costs 5 yards.',
    order: 20,
    sourceKeys: RULEBOOK,
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `Once an offensive player has taken a set position at the line of scrimmage, any abrupt or simulated movement, most commonly by an offensive lineman flinching before the snap, before the ball is actually snapped is a false start. Play is whistled dead immediately (unlike many penalties, which play through to the end of the down), and the offense is penalized 5 yards from the previous line of scrimmage, with the down replayed.`,
    example: `1st & 10. Before the snap, a guard shifts his weight forward, anticipating the count too early. The official immediately blows the play dead: 1st & 15 from 5 yards further back, the same down replayed rather than lost.`,
    whyItMatters: `False starts are common enough (they are typically the single most frequently called penalty in the NFL) that "silent counts" (starting the play without an audible cadence, to prevent the defense from drawing an offensive player offside by faking the snap count) and hard, disciplined cadences are a genuine part of offensive line coaching, not a minor detail.`,
    misunderstandings: `**A false start is not the same penalty as offside**, even though both involve illegal pre-snap movement; a false start is committed by the offense, offside by the defense, and they are enforced slightly differently.`,
    related: ['what-is-the-line-of-scrimmage', 'penalties', 'holding-explained'],
  }),

  rule({
    slug: 'holding-explained',
    title: 'Holding Explained',
    category: 'penalties',
    aliases: ['holding penalty football', 'what is holding in football'],
    summary:
      'Illegally impeding an opponent by grabbing or hooking them beyond what legal blocking allows. Different yardage for offense and defense.',
    order: 30,
    sourceKeys: [{ key: 'wp-holding' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `Legal blocking allows a player to use his hands and body to obstruct an opponent, but only within specific limits: generally, contact must be in front of the blocker, within a defined area, and cannot involve grabbing, hooking, or tackling an opponent who is not the ball carrier. When a blocker (almost always an offensive lineman) illegally restrains a defender beyond that, most commonly by grabbing his jersey or wrapping him up to prevent him from reaching the ball carrier, it is offensive holding.

Offensive holding costs 10 yards from the previous spot and replays the down. Defensive holding (illegally impeding an offensive player, most often a receiver, beyond the 5-yard zone where contact is allowed) costs 5 yards and an automatic first down instead.`,
    example: `A defensive end beats his blocker cleanly and is closing in on the quarterback; the offensive tackle grabs his jersey from behind to prevent him from finishing the sack. If called, that is offensive holding: 10 yards back from the previous spot, and the down is replayed, even though the sack itself never counts.`,
    whyItMatters: `Because holding happens on the offensive line on a large share of plays (to some degree, on almost every play, since contact that would technically qualify happens constantly and is not always flagged), it is one of the most judgment-dependent penalties in football, and disagreements about whether contact "should have been" called holding are a constant feature of NFL discourse.`,
    misunderstandings: `**Holding is not exclusively an offensive penalty;** defensive holding, usually involving a defensive back grabbing a receiver's jersey during a route, is a distinct, separately enforced foul with different yardage and an automatic first down attached.

**Not all contact beyond a receiver or blocker's frame is holding;** legal blocking and legal press coverage both permit real contact within specific limits, and only contact beyond those limits, like grabbing or hooking, is actually a foul.`,
    related: ['penalties', 'pass-interference-explained', 'offensive-line-explained'],
  }),

  rule({
    slug: 'pass-interference-explained',
    title: 'Pass Interference Explained',
    category: 'penalties',
    aliases: ['pass interference nfl', 'defensive pass interference explained', 'dpi football'],
    summary:
      "Illegally impeding a receiver's ability to catch a forward pass before the ball arrives. Enforced at the spot of the foul.",
    difficulty: 'intermediate',
    order: 40,
    sourceKeys: [{ key: 'wp-pass-interference' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `Pass interference applies to a forward pass that has been thrown and is catchable; contact that significantly hinders a receiver's (or, on the offense's side, a defender's) ability to make a play on the ball before it arrives can be flagged. Both the offense and the defense can commit it, though defensive pass interference is by far the more common and more consequential call.

Defensive pass interference in the NFL is enforced at the spot of the foul, with an automatic first down, which means a foul committed deep downfield can gift the offense enormous yardage, far more than almost any other single penalty. Offensive pass interference, by contrast, is a spot foul enforced from the previous line of scrimmage, a smaller penalty in practice since it typically negates a completed pass.`,
    example: `A receiver runs a deep route and a cornerback, beaten on the play, grabs his arm before the ball arrives, preventing him from turning to make a play on it. Defensive pass interference: the ball is placed at the spot of the foul, potentially 40+ yards downfield, with an automatic first down, regardless of how far the pass itself would have traveled if uncontested.`,
    inPractice: `Because it is enforced at the spot of the foul rather than a fixed yardage, defensive pass interference is by a wide margin the most yardage-costly penalty a defense can commit, which is why officiating judgment calls on close pass interference plays are frequently the most scrutinized and debated calls in a broadcast.`,
    whyItMatters: `The size of the potential penalty (an uncapped spot foul, unlike almost any other infraction) is exactly why defenders are coached to avoid contact on a clearly uncatchable deep pass rather than risk a marginal interference call turning into a huge, uncapped gain for the offense.`,
    misunderstandings: `**Not all contact between a receiver and a defender during a route is pass interference;** incidental contact, and contact that occurs before the pass is actually thrown, is generally legal (though illegal contact and defensive holding rules separately restrict contact once a receiver is more than 5 yards downfield).

**Offensive and defensive pass interference are not enforced the same way;** the defensive foul is a spot foul with no yardage cap and an automatic first down, while the offensive foul is a smaller, fixed-spot penalty from the previous line of scrimmage.`,
    related: ['forward-pass-rules', 'holding-explained', 'what-counts-as-a-reception'],
  }),

  rule({
    slug: 'roughing-the-passer-explained',
    title: 'Roughing the Passer Explained',
    category: 'penalties',
    aliases: ['roughing the passer nfl', 'roughing the passer penalty'],
    summary:
      'A defender hits the quarterback in a way the rules specifically prohibit after he has thrown or is clearly in the act of throwing.',
    difficulty: 'intermediate',
    order: 50,
    sourceKeys: [{ key: 'wp-roughing-passer' }, ...RULEBOOK],
    ruleSensitive: true,
    sourceRevision: 'NFL Rulebook, current edition',
    lastReviewedAt: '2026-09-03',
    howItWorks: `The NFL rulebook gives quarterbacks specific additional protection not extended to other players: certain kinds of contact, most notably hitting a passer with excessive force, hitting him low around the knees, landing on him with full body weight after a clear opportunity to avoid it, or hitting him in the head or neck area, can be flagged as roughing the passer even if the same contact against a ball carrier elsewhere on the field would be considered a legal tackle.

It carries a 15-yard penalty and an automatic first down for the offense, one of the most severe penalties in the rulebook.`,
    example: `A quarterback releases a pass just before a pass rusher arrives; rather than pulling up, the rusher drives through him with unnecessary force well after the ball is gone. Even though the sack "attempt" itself was legal in timing, the excessive contact after the throw can be flagged: 15 yards, automatic first down, and the defense's near-sack becomes a significant offensive gain instead.`,
    whyItMatters: `Because quarterbacks are considered uniquely valuable and vulnerable (throwing motion leaves them in exposed positions, and losing a starting quarterback to injury is disproportionately costly to a team), the rulebook's extra protections for the position are deliberate, and the penalty's severity (15 yards, automatic first down) reflects how seriously the league treats hits that cross that specific line.`,
    misunderstandings: `**Roughing the passer is not called for every hard hit on the quarterback;** a clean, legal tackle that happens to look forceful is not automatically a foul. The penalty targets specific prohibited types of contact and timing, not simply the intensity of a legal sack.`,
    related: ['qb-sack-explained', 'penalties', 'quarterback-explained'],
  }),

  // ══ Turnovers ══════════════════════════════════════════════════════════════════
  definition({
    slug: 'fumble-explained',
    title: 'Fumble Explained',
    category: 'turnovers',
    aliases: ['fumble meaning football', 'what is a fumble'],
    summary: 'A loss of control of the ball by the player carrying it, recoverable by either team.',
    order: 10,
    sourceKeys: RULEBOOK,
    explanation: `A fumble occurs when a player in possession of the ball loses control of it before the play ends, for any reason, whether by a defender's hit knocking it loose or simply dropping it. Once fumbled, the ball is live and loose: either team can recover it, and whichever team comes up with it gains possession at that spot (or wherever the recovering player is eventually stopped, if he picks it up and runs).`,
    example: `A running back breaks through the line for a gain, but a defender strips the ball loose from behind before he is tackled. The ball bounces free; a defensive lineman falls on it. Fumble, recovered by the defense: an immediate turnover, and the defense now has the ball at that spot, having gained possession without ever catching a pass or the offense choosing to give it up.`,
    whyItMatters: `Unlike an interception, which can only happen on a forward pass, a fumble can occur on any play, run or pass, at any point a ball carrier has the ball, which is part of why ball security (a player's technique and discipline in carrying the ball to avoid losing it) is a specifically coached skill for every position that regularly handles the ball.`,
    misunderstandings: `**A fumble is not automatically a turnover;** if the offense recovers its own fumble, it simply keeps possession (though typically at a worse spot than where the fumble happened, and having potentially lost a down in the process, depending on when it is recovered).

**A backward pass that hits the ground is treated as a fumble, not an incomplete pass,** which is one reason laterals (legal backward passes) are riskier to attempt than they might first appear.`,
    related: ['interception-explained', 'why-turnovers-matter', 'fumble-return-touchdown'],
  }),

  standard({
    slug: 'why-turnovers-matter',
    title: 'Why Turnovers Matter So Much',
    category: 'turnovers',
    aliases: ['importance of turnovers football', 'turnover differential explained'],
    summary:
      'A turnover ends a drive instantly and can hand the opponent the ball in far better field position, a double swing in one play.',
    order: 20,
    sourceKeys: GENERAL,
    explanation: `A turnover (an interception or a lost fumble) is unusually costly compared to almost any other single play in football, because it combines two separate losses at once: the offense's current drive ends immediately, regardless of how promising it looked, and the opponent gains possession, often in much better field position than a normal punt or missed field goal would have given them.`,
    howItWorks: `Turnover differential (a team's total takeaways minus its total giveaways across a season) is one of the statistics most strongly correlated with winning percentage in the NFL, more so than many more heavily discussed statistics like total yardage, precisely because it captures both halves of the swing: possessions a team's offense wasted, and extra possessions its defense created.`,
    example: `A team driving deep into opponent territory throws an interception at the 5-yard line. Instead of a likely score (worth an expected several points), the possession swings entirely to the other team, starting a new drive from that same spot, now working in the opposite direction. The net swing in expected points from that single play is often larger than almost any other outcome available on that down.`,
    whyItMatters: `Coaches and analysts alike treat avoiding turnovers as one of the clearest, most universally agreed-upon priorities in football strategy, which is why conservative decision-making (throwing a pass away rather than risking an interception, a running back deliberately protecting the ball in traffic) is often praised even when it costs a small amount of yardage in the moment.`,
    misunderstandings: `**Not all turnovers are equally costly;** a turnover deep in a team's own territory is far less damaging than one deep in opponent territory, since the field position swing (and therefore the change in scoring probability for each team) is what actually drives the cost, not simply the fact that possession changed.`,
    related: ['interception-explained', 'fumble-explained', 'turnover-on-downs'],
  }),

  // ══ NFL Playoffs ══════════════════════════════════════════════════════════════
  format({
    slug: 'nfl-playoffs-explained',
    title: 'NFL Playoffs Explained',
    category: 'nfl-playoffs',
    aliases: ['nfl playoff format', 'how nfl playoffs work'],
    summary:
      'A single-elimination bracket of seeded teams from each conference, ending in the Super Bowl.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: GENERAL,
    howItWorks: `After the regular season, seven teams from each of the NFL's two conferences (the AFC and the NFC) qualify for the playoffs: the four division winners, seeded 1 through 4 by regular-season record, plus three additional wild card teams with the next-best records, seeded 5 through 7.

The playoffs are single-elimination: lose once and the season is over. The top seed in each conference receives a bye in the opening Wild Card round, meaning it does not play that week and advances automatically to the Divisional round. From there, each round's winners advance until one team from each conference remains; those two meet in the Super Bowl to decide the league champion.

Higher seeds generally host games at their own stadium throughout the earlier playoff rounds, an advantage earned by regular-season performance; the Super Bowl itself, however, is played at a predetermined neutral site rather than either finalist's home stadium.`,
    example: `A team wins its division with the best record in its conference, earning the 1-seed and a bye in the Wild Card round. While six other teams play that week, this team rests, then hosts a Divisional round game against whichever lower-seeded team survived the opening round, a direct benefit of its regular-season performance.`,
    whyItMatters: `Because the format is single-elimination and seeding is earned entirely through regular-season results, every regular-season game carries playoff implications: a single additional win can be the difference between hosting a home playoff game (and possibly earning a bye) and missing the playoffs entirely.`,
    misunderstandings: `**Not every good team makes the playoffs, and not every playoff team had a great record;** the seven-team-per-conference cutoff means a strong team in a very competitive conference can miss out while a weaker team in a weaker conference qualifies, since seeding and qualification depend on standing within one's own conference, not a single combined league-wide ranking.`,
    related: ['how-nfl-season-works', 'wild-card-explained', 'super-bowl-explained'],
  }),

  definition({
    slug: 'wild-card-explained',
    title: 'Wild Card Explained',
    category: 'nfl-playoffs',
    aliases: ['wild card team nfl', 'wild card round explained'],
    summary:
      "A playoff berth earned by record rather than by winning a division; also the name of the playoffs' opening round.",
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: GENERAL,
    explanation: `A "wild card" team is one that qualifies for the playoffs without winning its own division, based on having one of the next-best records in its conference among the remaining teams. The term also names the opening round of the playoffs itself (Wild Card weekend), in which these teams, plus the lower division winners, play their first postseason games.`,
    example: `A team finishes the regular season with a strong record but loses out on its own division to a rival with an even better record. Rather than being eliminated, it can still qualify for the playoffs as a wild card, provided its record ranks among the best of the remaining non-division-winning teams in its conference.`,
    whyItMatters: `The wild card system means a team's playoff fate is not decided purely by its own division; a team can control most of its own destiny by simply having a better overall record than its conference rivals, division rival or not.`,
    related: ['nfl-playoffs-explained', 'how-nfl-season-works'],
  }),

  standard({
    slug: 'super-bowl-explained',
    title: 'Super Bowl Explained',
    category: 'nfl-playoffs',
    aliases: ['super bowl meaning', 'what is the super bowl'],
    summary:
      "The NFL's championship game, played between the winners of the AFC and NFC playoff brackets at a predetermined neutral site.",
    order: 30,
    sourceKeys: [{ key: 'wp-american-football' }],
    explanation: `The Super Bowl is the NFL's single championship game, played each year between the AFC champion and the NFC champion, the two teams that won their respective conference's playoff bracket. Unlike earlier playoff rounds, it is played at a site chosen years in advance rather than at either finalist's home stadium, so neither team has a true home-field advantage.`,
    howItWorks: `Getting to the Super Bowl requires winning three straight single-elimination playoff games within one's conference (or two, for a top-seeded team that earned a Wild Card round bye): Wild Card, Divisional, and the Conference Championship. The two conference champions then meet once, winner-take-all, for the league title.`,
    whyItMatters: `As a single, winner-take-all game deciding an entire season, the Super Bowl carries disproportionate weight in how NFL seasons, teams, and players are remembered, and it has grown into one of the most-watched annual sporting events in the world well beyond dedicated NFL fans, partly because of the accompanying entertainment (like the halftime show) built around the single game.`,
    misunderstandings: `**The Super Bowl is not automatically played at either finalist's home city;** the host city and stadium are selected years ahead of time, independent of which two teams end up qualifying.`,
    related: ['nfl-playoffs-explained', 'wild-card-explained'],
  }),

  // ══ NFL Draft ══════════════════════════════════════════════════════════════════
  format({
    slug: 'nfl-draft-explained',
    title: 'NFL Draft Explained',
    category: 'nfl-draft',
    aliases: ['nfl draft process', 'how the nfl draft works'],
    summary:
      'An annual event where NFL teams take turns selecting the rights to sign eligible college and international players.',
    difficulty: 'intermediate',
    order: 10,
    sourceKeys: [{ key: 'wp-nfl-draft' }],
    howItWorks: `Once a year, NFL teams take turns, in a set order across seven rounds, selecting players (almost entirely coming out of college football, though some come from other pathways) and thereby gaining the exclusive rights to sign them to a contract. A player selected by a team cannot simply sign with any other team instead; the draft is specifically how the rights to negotiate with a given incoming player are allocated.

Draft order is generally set in reverse order of the previous season's regular-season standings within each round, so that the team with the worst record picks first (subject to trades, since teams frequently trade draft picks to one another, including future years' picks).`,
    example: `A team finishes the season with the league's worst record. The following spring, it holds the first overall pick in the draft, giving it the first opportunity to select any eligible player, ahead of every other team, before the draft proceeds through the rest of the first round and the following six rounds in the same reverse-standings order.`,
    whyItMatters: `The draft is the primary mechanism by which NFL teams add young talent, and its reverse-order structure is a deliberate competitive-balance feature: teams that performed worst get the earliest, most valuable selections the following year, intended to help struggling teams rebuild rather than let strong teams simply keep adding the best available young players indefinitely.`,
    misunderstandings: `**Draft order is not fixed once the regular season ends;** teams frequently trade picks, both current-year and future picks, to move up or down within the order, so the actual sequence of selections often looks quite different from a simple, untouched worst-to-first list.

**Being drafted does not guarantee a roster spot;** a drafted player still has to make the team through training camp and preseason competition like any other player trying out for a roster.`,
    related: [
      'draft-order-explained',
      'nfl-combine-explained',
      'college-football-playoff-explained',
    ],
  }),

  standard({
    slug: 'draft-order-explained',
    title: 'Draft Order Explained',
    category: 'nfl-draft',
    aliases: ['nfl draft order', 'how is draft order determined'],
    summary: "Set mainly by reverse order of the previous season's standings, adjusted by trades.",
    difficulty: 'intermediate',
    order: 20,
    sourceKeys: [{ key: 'wp-nfl-draft' }],
    explanation: `Each round of the draft follows the same base order: the team with the worst regular-season record from the previous year picks first, the next-worst picks second, and so on, with playoff teams generally picking after non-playoff teams, and the Super Bowl champion picking last in each round. This base order can then be altered by trades, as teams frequently exchange draft picks (including picks belonging to future years) for other picks, players, or considerations.`,
    example: `A team with the league's worst record holds the first pick. Believing a specific player available at, say, the fifth pick is exactly what it needs, another team trades additional future draft picks to the fifth-place team specifically to move up and guarantee it gets that player, rather than risk someone else selecting him first.`,
    whyItMatters: `Because draft order directly reflects the previous season's on-field results, and picks can also be traded, tracking "who owns which pick" becomes its own significant storyline in team-building, especially for teams that have traded away future first-round picks and are therefore playing with reduced draft assets down the line.`,
    related: ['nfl-draft-explained', 'how-nfl-season-works'],
  }),

  standard({
    slug: 'nfl-combine-explained',
    title: 'NFL Combine Explained',
    category: 'nfl-draft',
    aliases: ['nfl combine meaning', 'what is the nfl combine'],
    summary:
      'A pre-draft event where prospective players are tested physically and interviewed by teams ahead of the draft.',
    difficulty: 'intermediate',
    order: 30,
    sourceKeys: [{ key: 'wp-nfl-draft' }],
    explanation: `The NFL Scouting Combine is an annual event, held ahead of the draft, where college players hoping to be drafted are measured, tested athletically (in events like the 40-yard dash and various strength and agility drills), and interviewed by team personnel, all in one setting rather than teams having to gather this information separately across dozens of individual campus visits.`,
    example: `A prospect widely considered talented on game film runs a notably fast 40-yard dash at the combine, reinforcing evaluators' existing view of his speed with an objective, standardized number rather than only game footage and estimates.`,
    whyItMatters: `Because the combine puts a large share of the draft class through identical, standardized tests at the same time, it gives teams directly comparable data across prospects, supplementing (but not replacing) film study of how a player actually performed in real college games.`,
    misunderstandings: `**A strong combine performance does not guarantee draft success,** and a poor one does not disqualify a prospect; the combine measures raw athletic testing, which correlates with but does not fully determine actual on-field football performance.`,
    related: ['nfl-draft-explained', 'draft-order-explained'],
  }),

  // ══ Advanced Analytics ════════════════════════════════════════════════════════
  statistic({
    slug: 'epa-explained',
    title: 'EPA Explained',
    category: 'advanced-nfl-analytics',
    aliases: ['expected points added explained', 'epa football stat', 'what is epa in football'],
    summary:
      "Expected Points Added: how much a single play changed a team's expected scoring outcome for that drive.",
    difficulty: 'advanced',
    isDerived: true,
    order: 10,
    sourceKeys: [{ key: 'wp-expected-points' }],
    measures: `EPA (Expected Points Added) measures the change in a team's expected points, a model's estimate of how many points a drive is likely to eventually produce given the current down, distance, and field position, caused by a single play. A play that improves the offense's situation (say, converting a difficult 3rd down) adds positive EPA; a play that worsens it (an incompletion on 3rd down, forcing a punt) subtracts from it.`,
    formula: `The underlying "expected points" value for any down-distance-field-position situation is typically derived from a statistical model built on a large historical sample of actual play outcomes and their eventual scoring results, not defined by a single official formula. EPA for a given play is simply: expected points after the play, minus expected points before the play (adjusted for any points actually scored on the play itself).`,
    example: `An offense faces 3rd & 8 from its own 30-yard line, a situation a model might estimate as worth roughly 0.5 expected points on average across many similar situations historically. A 12-yard completion converts the first down and moves the ball to the 42-yard line, a much more favorable situation, worth perhaps 1.3 expected points by the same model. That single play is credited with roughly +0.8 EPA.`,
    interpret: `EPA per play is often used to compare offenses and defenses on a level that accounts for situational difficulty, unlike raw yards per play, because it recognizes that a 4-yard gain on 3rd & 3 (converting) is far more valuable than the same 4-yard gain on 3rd & 10 (not converting), even though both moved the ball an identical distance.`,
    limitations: `EPA depends entirely on the specific expected-points model behind it, and different analytics providers build meaningfully different models from different historical samples and assumptions, which is why EPA figures for the same play can differ slightly between sources.`,
  }),

  statistic({
    slug: 'win-probability-explained',
    title: 'Win Probability Explained',
    category: 'advanced-nfl-analytics',
    aliases: ['win probability football', 'wp stat nfl', 'what is win probability'],
    summary:
      "A model's real-time estimate of each team's chance of winning, given the score, time, down, distance and field position.",
    difficulty: 'advanced',
    isDerived: true,
    order: 20,
    sourceKeys: [{ key: 'wp-expected-points' }],
    measures: `Win probability estimates, at any given moment in a game, how likely each team is to ultimately win, based on the current score, time remaining, down and distance, field position, and (in more advanced versions) each team's timeouts remaining. It updates after every play, producing the kind of "win probability graph" broadcasts and analytics sites often show climbing and falling across a game.`,
    formula: `Like EPA, win probability models are built from large historical samples of past games: given a very similar game state (score margin, time left, field position, and so on) across many past games, what fraction of the time did the team in that situation actually go on to win? There is no single official formula; different providers build and calibrate their models somewhat differently.`,
    example: `A team trailing by 3 points with the ball at midfield and 4 minutes remaining might carry a win probability estimate around 35-40%, reflecting how often teams in roughly that same situation historically pulled off the win. A single big defensive stop, or a costly turnover, can swing that estimate sharply within one play.`,
    interpret: `Win probability added (WPA), the change in win probability caused by a single play, is often used to identify which individual plays were most decisive to a game's outcome, independent of how many yards they gained, since a small gain that converts a critical 4th down late in a close game can carry far more win-probability value than a long gain earlier when the outcome was already fairly settled.`,
    limitations: `Win probability is a probabilistic estimate from historical patterns, not a certainty or a guarantee; a team correctly modeled at, say, 20% to win still wins in roughly one out of five such situations, and any individual game's outcome does not itself validate or invalidate the model.`,
  }),

  statistic({
    slug: 'cpoe-explained',
    title: 'CPOE Explained',
    category: 'advanced-nfl-analytics',
    aliases: ['completion percentage over expected', 'cpoe stat football', 'what is cpoe'],
    summary:
      "Completion Percentage Over Expected: how much better (or worse) a quarterback completed passes than a model expected given each throw's difficulty.",
    difficulty: 'advanced',
    isDerived: true,
    order: 30,
    sourceKeys: [{ key: 'wp-expected-points' }],
    measures: `CPOE compares a quarterback's actual completion percentage to a model's expectation of what an average quarterback would complete on the exact same set of throws, accounting for factors like the pass's depth, location, and how much pressure the quarterback was under. It is designed to separate a quarterback's accuracy from the difficulty of the throws his particular offense asks him to make.`,
    formula: `A model estimates an "expected completion percentage" for each individual pass attempt, based on historical completion rates for throws with similar characteristics (depth of target, direction, pressure). CPOE is the quarterback's actual completion percentage across his attempts, minus the average of those play-by-play expected completion percentages.`,
    example: `Two quarterbacks both complete 65% of their passes in a season. One attempts mostly short, high-percentage throws that an average quarterback would be expected to complete around 68% of the time (a CPOE of roughly -3%); the other attempts a more aggressive mix of downfield throws that an average quarterback would only be expected to complete around 60% of the time (a CPOE of roughly +5%). Raw completion percentage alone would rank the first quarterback higher; CPOE suggests the second is the more accurate passer relative to what he was actually asked to do.`,
    interpret: `CPOE is generally treated as a more reliable measure of pure accuracy than raw completion percentage, since it does not penalize a quarterback for attempting harder, more aggressive throws, which raw completion percentage alone tends to do.`,
    limitations: `Like EPA, CPOE is only as good as the underlying expected-completion model, and the specific figure quoted for a given quarterback can differ meaningfully between analytics providers depending on how each model accounts for factors like pressure, receiver separation, and throw depth.`,
  }),
];
