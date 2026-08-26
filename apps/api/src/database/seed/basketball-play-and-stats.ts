import { definition, play, rule, statistic, tactic } from './basketball-explainer-helpers';
import type { ExplainerSeed } from './explainer-types';

/**
 * Offence, defence, shooting, rebounding and the statistics.
 *
 * The second of the two supplementary content files. Everything here is about
 * what teams and players *do*, as opposed to what the rules permit, which lives
 * in `basketball-rules-and-court.ts`.
 *
 * The advanced statistics follow the section order the product brief asks for:
 * what it measures, how it is calculated, a worked example, how to read it, and
 * what it misses. The last is not decorative. A metric page with no limitations
 * section is how a reader ends up quoting PER as though it settled an argument,
 * and several of the metrics below are considerably weaker than their
 * confident-looking single numbers suggest.
 */

const STATS = [{ key: 'wp-box-score' }];
const GENERAL = [{ key: 'wp-basketball' }];

export const BASKETBALL_PLAY_AND_STATS: ExplainerSeed[] = [
  // ══ Offense ════════════════════════════════════════════════════════════════
  tactic({
    slug: 'transition-offense',
    title: 'Transition Offense',
    category: 'offense',
    difficulty: 'intermediate',
    aliases: ['transition offense', 'transition', 'transition offence', 'early offense'],
    summary: 'Attacking in the seconds after gaining possession, before the defence is organised.',
    order: 1300,
    sourceKeys: GENERAL,
    howItWorks: `Transition covers everything between gaining the ball and the defence being set. It is broader than a fast break: even without a numerical advantage, pushing the ball up quickly forces defenders to make decisions while retreating.

Teams have designated roles. Guards run wide to the corners, a big runs straight to the rim, and the ball handler attacks the middle. Those lanes exist so nobody has to think about where to go.

Modern transition often ends in a three-pointer rather than a layup, because a trailing shooter arriving behind the ball is frequently the most open player on the floor.`,
    whyItMatters: `Points per possession in transition are far higher than in the half court, so the number of transition possessions a team generates is a real strategic lever rather than a stylistic preference.

This is why turnovers are so damaging: they do not merely end your possession, they usually start the opponent's at a run.`,
    counters: `Transition **defence**, with its fixed priority order: stop the ball, protect the rim, then match up. Teams also limit how many players chase offensive rebounds, trading second chances for safety.`,
    related: ['fast-break', 'transition-defense', 'possessions', 'pace'],
  }),

  tactic({
    slug: 'ball-movement',
    title: 'Ball Movement',
    category: 'offense',
    aliases: ['ball movement', 'passing', 'moving the ball', 'swing the ball'],
    summary: 'Passing the ball quickly from side to side so the defence cannot stay organised.',
    order: 1310,
    sourceKeys: GENERAL,
    howItWorks: `Each pass forces the defence to shift. Because the ball travels faster than any defender can run, several passes in succession mean defenders are perpetually a step behind, and eventually somebody is late.

The phrase "the extra pass" describes the moment this pays off: a player with an acceptable shot passes instead to a teammate with a better one.

Ball movement is measured indirectly by assist totals and by "passes per possession", though neither captures it exactly.`,
    whyItMatters: `It is the cheapest way to create an advantage. No screen, no isolation, no individual beating their defender: just passing faster than the defence can rotate.

It also makes an offence far harder to scout. A team that runs everything through one player can be game-planned against; one that moves the ball has five threats and no single point of failure.`,
    misunderstandings: `**"More passes is always better."** No. Passing without purpose burns clock and can end in a rushed shot. The aim is passes that move the defence, not passes for their own sake.

**"Assists measure it."** Partly. The pass before the assist often did the real work and is recorded nowhere.`,
    related: ['assists', 'spacing', 'drive-and-kick', 'motion-offense'],
  }),

  play({
    slug: 'give-and-go',
    title: 'Give and Go',
    category: 'offense',
    aliases: ['give and go', 'give-and-go', 'pass and cut'],
    summary: 'Pass to a teammate, then immediately cut to the basket for the return pass.',
    order: 1320,
    sourceKeys: GENERAL,
    theAction: `The simplest two-player action in basketball, and among the oldest. Pass the ball, and the moment your defender turns to watch it, cut hard toward the basket. The teammate returns the pass as you arrive.

It works entirely on attention. A defender who watches the ball loses their man for the half-second the cut needs.`,
    whyItMatters: `It requires no screen, no set play and no special personnel, which is why it survives at every level from schoolyard to professional basketball.

It is also a permanent corrective to lazy defence. A defence that ball-watches will concede give-and-gos indefinitely, which is why coaches teach defenders to see both the ball and their assignment.`,
    howItIsDefended: `**Jump to the ball.** As the pass is released, the defender steps toward it, staying between their man and the basket.

Beyond that it is simply discipline: seeing the ball and your assignment at once, and not turning your head.`,
    related: ['cutting', 'backdoor-cut', 'ball-movement'],
  }),

  play({
    slug: 'dribble-hand-off',
    title: 'Dribble Hand-Off',
    category: 'offense',
    difficulty: 'intermediate',
    aliases: ['dribble hand off', 'dho', 'hand off', 'handoff'],
    summary:
      'A player dribbles toward a teammate and hands them the ball, screening their defender in the process.',
    order: 1330,
    sourceKeys: GENERAL,
    theAction: `One player, usually a big, dribbles toward a teammate. As the teammate runs past, the ball is handed directly to them, and the handler's body becomes a screen on the receiver's defender.

The receiver comes off it moving at speed with the ball, and the handler can then roll to the basket exactly as in a pick and roll.

It is effectively a ball screen and a pass combined into one action, which makes it quicker to run and harder to prepare for.`,
    whyItMatters: `The timing is what makes it difficult to defend. In a normal ball screen the defence sees the screener arrive and can call the coverage. In a hand-off the ball changes hands at the same instant the screen occurs, giving defenders no time to communicate.

It is also a way to get a shooter moving with the ball without asking them to create off the dribble, which suits teams built around movement shooters rather than isolation scorers.`,
    howItIsDefended: `- **Switch**, which is simple but concedes a mismatch.
- **Go under** the hand-off, conceding a jump shot.
- **Blitz** the receiver as they come off it.
- **Deny the hand-off entirely** by pressuring the receiver before they arrive.`,
    variations: `- **Chicago action.** A pin-down followed immediately by a hand-off.
- **Fake hand-off** or **keep**, where the handler keeps the ball and drives.`,
    related: ['screen', 'pick-and-roll', 'ghost-screen', 'catch-and-shoot'],
  }),

  play({
    slug: 'backdoor-cut',
    title: 'Backdoor Cut',
    category: 'offense',
    difficulty: 'intermediate',
    aliases: ['backdoor', 'back door', 'backdoor cut', 'back cut'],
    summary: 'Cutting behind an overplaying defender toward the basket.',
    order: 1340,
    sourceKeys: GENERAL,
    theAction: `When a defender presses hard into the passing lane to deny a pass, they have put themselves on the wrong side of their opponent. The attacker takes one step as if coming to meet the ball, then cuts sharply behind them toward the basket.

The pass has to be immediate and usually goes to a spot rather than to the player, since the whole thing depends on arriving before the defender can turn.`,
    whyItMatters: `It is the specific punishment for aggressive denial defence, which is what makes it a strategic idea rather than just a move. A defence that overplays passing lanes is choosing to concede backdoor cuts, and if the offence cannot execute them the denial is free.

It is also the reason coaches teach defenders to see the ball while denying: the cut is only available if the defender has lost sight of it.`,
    howItIsDefended: `Play less aggressively in the passing lane, or maintain vision of both ball and assignment so the cut can be seen and jumped. Weak-side help stationed near the basket also deters it.`,
    related: ['cutting', 'give-and-go', 'help-defense', 'ball-movement'],
  }),

  tactic({
    slug: 'motion-offense',
    title: 'Motion Offense',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['motion offense', 'motion', 'motion offence', 'read and react'],
    summary:
      'A system of rules and reads rather than fixed plays, with continuous player movement.',
    order: 1350,
    sourceKeys: GENERAL,
    howItWorks: `Instead of running a scripted sequence, players follow principles: pass and cut, screen away from the ball, fill the space a teammate has vacated, and read what the defence does.

Because it is rule-based rather than scripted, it does not end. If the first option is unavailable the offence simply continues, with the shape reforming continuously.

It demands that every player can pass, screen and read a defence, which is why it is more common where teams have long practice time.`,
    whyItMatters: `A scouted set play can be taken away. A defence that knows the sequence can jump the second pass and kill the possession before it develops.

Motion is much harder to prepare for, because there is no sequence to memorise. What the defence must guard against is a set of principles that generate different actions each time.

The trade is execution risk: five players making independent reads will occasionally make different ones.`,
    variations: `- **Five-out.** All five players outside the arc.
- **Four-out one-in.** One player inside, four spaced.
- **Princeton-style.** Heavy on backdoor cuts and high-post passing.`,
    related: ['five-out-offense', 'four-out-one-in', 'ball-movement', 'cutting'],
  }),

  tactic({
    slug: 'five-out-offense',
    title: 'Five-Out Offense',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['five out', '5 out', 'five-out offense', 'five out motion'],
    summary:
      'All five attackers positioned outside the three-point line, leaving the paint completely empty.',
    order: 1360,
    sourceKeys: GENERAL,
    howItWorks: `Every attacker, including the centre, starts outside the arc. The paint is deliberately empty, so any drive or cut has a completely clear route to the basket.

Scoring comes from driving into that empty space, cutting into it, and passing out to shooters when help arrives.

It requires a centre who can shoot, or at least one whose defender cannot safely ignore them.`,
    whyItMatters: `It is the logical endpoint of spacing. With no attacker inside, there is no defender legitimately stationed inside either, so the most efficient area of the floor is unguarded until somebody attacks it.

It also makes help defence nearly impossible: every helper is guarding a three-point shooter, so every rotation concedes the most valuable shot in the sport.`,
    counters: `- **Play a non-shooting centre's defender off him**, effectively creating a free helper.
- **Zone defence**, which does not assign defenders to individuals.
- **Switch everything**, since five perimeter players make switching straightforward.
- **Attack the rebounding**, because a five-out team has nobody near the basket when a shot goes up.`,
    related: ['spacing', 'stretch-five', 'four-out-one-in', 'motion-offense'],
  }),

  tactic({
    slug: 'four-out-one-in',
    title: 'Four-Out One-In',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['four out one in', '4 out 1 in', 'four-out'],
    summary: 'Four attackers spaced around the arc with one operating inside.',
    order: 1370,
    sourceKeys: GENERAL,
    howItWorks: `Four players are positioned outside the three-point line and one, usually the centre, works inside: screening, rolling to the rim, posting up or chasing offensive rebounds.

It is the most common structure in modern basketball, sitting between the traditional two-big alignment and a full five-out.`,
    whyItMatters: `It keeps most of the benefit of spacing while retaining someone near the basket, which matters for two things five-out sacrifices: offensive rebounding, and a target to finish at the rim off ball screens.

The inside player does not need to shoot, which is the practical advantage. A team with one excellent rolling big and four shooters can run this without asking anyone to play out of character.`,
    related: ['spacing', 'five-out-offense', 'pick-and-roll', 'post-up'],
  }),

  play({
    slug: 'spain-pick-and-roll',
    title: 'Spain Pick and Roll',
    subtitle: 'Also called stack pick and roll',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['spain pick and roll', 'spain pnr', 'stack pick and roll', 'spain action'],
    summary: 'A pick and roll with a third attacker screening the roller’s defender from behind.',
    order: 1380,
    sourceKeys: [{ key: 'wp-pick-and-roll' }],
    theAction: `An ordinary pick and roll begins. As the screener rolls toward the basket, a **third** attacker sets a back screen on the defender who is dropping to protect the rim.

That defender is now caught between two problems: the roller heading to the basket in front of them and a screen arriving behind them. Meanwhile the player who set the back screen pops out to the three-point line.

Three attackers are therefore threatening simultaneously: the ball handler, the roller, and the back screener stepping out.`,
    whyItMatters: `It was designed specifically to defeat **drop coverage**. Drop works by having the big defender sit between the ball and the basket; the Spain action attacks that defender directly with a screen he cannot see coming.

Its rise in the 2010s is a good illustration of how basketball tactics evolve: a defensive answer becomes standard, an offensive counter is invented for it, and the counter then has to be answered in turn.`,
    howItIsDefended: `- **Switch the back screen**, which requires alert communication.
- **Have the back-screener's defender step out early** to warn the dropping big.
- **Blitz the ball handler** before the action develops at all.
- **Avoid drop coverage** against teams that run it.`,
    related: ['pick-and-roll', 'drop-coverage', 'screen', 'pick-and-pop'],
  }),

  play({
    slug: 'horns',
    title: 'Horns',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['horns', 'horns set', 'a set', 'high set'],
    summary: 'A formation with two bigs at the elbows and two players in the corners.',
    order: 1390,
    sourceKeys: GENERAL,
    theAction: `A starting shape rather than a single play. The ball handler stands at the top of the key, two teammates stand at the **elbows**, and two stand in the corners.

From this arrangement almost anything can be run: a ball screen from either elbow, a hand-off, a double screen, a back screen, or a pass to either elbow to attack from the high post.

Its value is that the shape is symmetrical, so the defence cannot tell which side the action is going until it starts.`,
    whyItMatters: `Horns is one of the most widely used sets in professional basketball worldwide, precisely because it is a menu rather than a script. A team can run twenty different actions from an identical starting picture.

The corners are also occupied, which keeps two help defenders pinned to the least helpful positions on the floor.`,
    variations: `- **Horns flare.** One big screens the ball, the other sets a flare screen for a shooter.
- **Horns twist.** The two bigs screen for each other.
- **Horns down.** One big sets a pin-down for a corner shooter.
- **Horns get.** Straight into a dribble hand-off.`,
    related: ['the-elbow', 'high-post', 'pick-and-roll', 'flare-screen', 'pin-down'],
  }),

  play({
    slug: 'double-drag',
    title: 'Double Drag',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['double drag', 'drag screen', 'double drag screen'],
    summary: 'Two ball screens set in quick succession, usually in transition.',
    order: 1400,
    sourceKeys: GENERAL,
    theAction: `Two screeners set ball screens one after the other as the ball handler comes up the floor. A "drag" screen is one set in transition, before the defence is organised.

Typically the first screener rolls to the basket and the second pops out to the arc, which gives the ball handler two different threats behind them and forces the defence to cover both while still retreating.`,
    whyItMatters: `Defending one ball screen has an agreed answer. Defending two in succession, in transition, before the defence has matched up, frequently does not: the coverage for the first screen leaves defenders out of position for the second.

It is one of the clearest examples of an offence attacking defensive **communication** rather than defensive ability.`,
    howItIsDefended: `Switching everything is the most reliable answer, since it needs no communication about who takes which screen. Teams that cannot switch usually try to force the ball wide before the second screen arrives.`,
    related: ['pick-and-roll', 'transition-offense', 'switching', 'pick-and-pop'],
  }),

  play({
    slug: 'ghost-screen',
    title: 'Ghost Screen',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['ghost screen', 'ghost', 'fake screen', 'slip'],
    summary: 'Faking a ball screen and slipping away before making contact.',
    order: 1410,
    sourceKeys: GENERAL,
    theAction: `The screener approaches as though setting a ball screen but never actually sets it, peeling away toward the three-point line instead.

The defence has usually already committed to its screen coverage: the big defender has stepped up to hedge, or the on-ball defender has prepared to fight over the top. Both are now reacting to a screen that does not exist.`,
    whyItMatters: `It attacks the defence's **preparation** rather than its position. Modern defences call out ball screens early and commit to a coverage; a ghost screen turns that discipline into a liability.

It is particularly effective when the ghosting player is a shooter, since the defender who stepped up to help now has to recover to a three-point shot.`,
    howItIsDefended: `Delay the coverage call until the screen actually happens, or switch, which is unaffected by whether contact was made. Neither is easy at speed, which is why the action works.`,
    related: ['screen', 'slip-screen', 'pick-and-roll', 'hedge'],
  }),

  play({
    slug: 'slip-screen',
    title: 'Slip Screen',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['slip screen', 'slip', 'slipping the screen'],
    summary: 'Cutting to the basket early instead of completing the screen.',
    order: 1420,
    sourceKeys: GENERAL,
    theAction: `The screener starts to set the screen, then cuts to the basket before making contact, "slipping" it.

The defenders are usually mid-coverage: one preparing to hedge or switch, the other fighting through. In that moment the slipping player is briefly unguarded on his way to the rim.`,
    whyItMatters: `It punishes aggressive screen coverage specifically. A defence that hedges hard or blitzes commits two defenders to the ball, and slipping gets a player behind them immediately.

The distinction from a ghost screen is direction and intent: a slip goes **toward the basket**, a ghost peels **out to the arc**. Both attack the same defensive commitment.`,
    related: ['ghost-screen', 'screen', 'hedge', 'blitz'],
  }),

  play({
    slug: 'flare-screen',
    title: 'Flare Screen',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['flare screen', 'flare', 'back screen for a shooter'],
    summary: 'A screen that sends a shooter away from the ball rather than toward it.',
    order: 1430,
    sourceKeys: GENERAL,
    theAction: `A screen is set on the back of a defender, and the shooter moves **away** from the ball, usually toward the wing or corner, rather than cutting toward it.

The pass that follows is a skip pass across the floor, which travels far enough that the recovering defender cannot close out in time.`,
    whyItMatters: `Most screens bring a player toward the ball, so defences are drilled to fight over the top and stay attached. A flare screen uses that instinct: the defender is already leaning toward the ball, and the shooter goes the other way.

It is a staple way of freeing a shooter who is being denied, and it needs no dribble at all.`,
    howItIsDefended: `Switch it, or have the screened defender go **under** and beat the shooter to the spot. The long skip pass also gives the defence a fraction more time than a short one would.`,
    related: ['screen', 'pin-down', 'horns', 'catch-and-shoot'],
  }),

  play({
    slug: 'pin-down',
    title: 'Pin-Down',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['pin down', 'pindown', 'down screen', 'pin-down screen'],
    summary: 'A screen set near the baseline to free a shooter coming up toward the ball.',
    order: 1440,
    sourceKeys: GENERAL,
    theAction: `A screener positions themselves in the lane facing the baseline. A teammate starting low runs up off that screen toward the wing or the top of the key, where they receive a pass.

The shooter has three choices depending on how the defender chases: come straight off for a catch-and-shoot, **curl** tightly toward the basket if chased over the top, or **fade** away if the defender goes under.`,
    whyItMatters: `It is the standard way to get a movement shooter the ball, and the reason certain players score heavily without ever handling it in isolation.

The reads are what make it durable. Because the shooter chooses their route based on the defender's decision, there is no single way to guard it correctly.`,
    howItIsDefended: `Switch the screen, chase over the top and accept the curl, go under and concede the shot, or send the screener's defender out to briefly delay the shooter.`,
    related: ['screen', 'flare-screen', 'catch-and-shoot', 'horns'],
  }),

  play({
    slug: 'elevator-screen',
    title: 'Elevator Screen',
    category: 'offense',
    difficulty: 'advanced',
    aliases: ['elevator screen', 'elevator doors', 'elevator'],
    summary:
      'Two screeners stand apart, let a shooter run between them, then close the gap behind him.',
    order: 1450,
    sourceKeys: GENERAL,
    theAction: `Two teammates stand a few feet apart, like open doors. The shooter sprints through the gap, and as soon as they are through, the two screeners step together and close it.

The chasing defender arrives at a wall. Unlike an ordinary screen there is no way round it, because the gap they were running through no longer exists.`,
    whyItMatters: `It is the most complete way to separate a shooter from a defender who is chasing them, and it is used almost exclusively for elite shooters where an ordinary screen is not enough.

It is also high-risk. Closing the doors too early is an illegal screen, and closing them too late leaves the defender through. That precision is why it appears as a special-occasion set rather than a staple.`,
    howItIsDefended: `Switch, or send the defender **under** the doors rather than through them, or deny the shooter's route before they reach the gap at all.`,
    related: ['screen', 'pin-down', 'catch-and-shoot', 'offensive-foul'],
  }),

  // ══ Defense ════════════════════════════════════════════════════════════════
  tactic({
    slug: 'man-vs-zone',
    title: 'Man vs Zone',
    category: 'defense',
    difficulty: 'intermediate',
    aliases: ['man vs zone', 'man or zone', 'man versus zone'],
    summary: 'Guarding people or guarding areas: what each gives up, and when teams choose which.',
    order: 1460,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `**Man-to-man** assigns each defender an opponent to follow. **Zone** assigns each defender an area and whoever enters it.

The practical differences:

| | Man-to-man | Zone |
|---|---|---|
| Assignment | A person | An area |
| Mismatches | Avoidable by design | Irrelevant, nobody is matched |
| Rebounding | Clear box-out responsibility | Weak, nobody has a specific man |
| Vulnerable to | Individual scorers, screens | Outside shooting, quick ball movement |
| Hides | Nothing | A slow or foul-troubled defender |`,
    whyItMatters: `Neither is better in general, which is why the question is always situational.

Teams play zone to hide a defender who cannot stay in front of anyone, to protect players in foul trouble, to disrupt an opponent who has found a rhythm, or against a team that cannot shoot from distance.

They play man-to-man as a base because it is more adaptable, rebounds better, and can be tailored to specific opponents.

Most professional teams play predominantly man-to-man and mix in zone as a change of pace, which is partly tactical and partly historical: the NBA banned zone entirely until 2001.`,
    misunderstandings: `**"Zone is what you play when you are worse."** It is a legitimate scheme; several strong college programmes have been built on it.

**"Man-to-man means no help."** Real man-to-man always includes help defence. Pure follow-your-man defence concedes a layup every time anyone is beaten.`,
    related: ['man-to-man-defense', 'zone-defense', 'two-three-zone', 'help-defense'],
  }),

  tactic({
    slug: 'double-team',
    title: 'Double Team',
    category: 'defense',
    aliases: ['double team', 'double', 'trap', 'doubling'],
    summary: 'Sending two defenders at the ball, leaving somebody else open by definition.',
    order: 1470,
    sourceKeys: GENERAL,
    howItWorks: `Two defenders converge on the ball handler, aiming to force a turnover or a hurried pass.

Because there are only five defenders, doubling always leaves an attacker unguarded somewhere. The remaining three defenders must cover four attackers, which they do by rotating: each takes the most dangerous available opponent rather than their own.

Doubles are most often sent at a post-up, at a dominant isolation scorer, or as a **trap** near the sideline where the boundary helps.`,
    whyItMatters: `It is the standard response to a player who cannot be guarded one-on-one. Taking the ball out of their hands is worth conceding a shot to someone else, provided that someone else is a weaker option.

The counter is entirely about **passing**. A scorer who passes well out of a double turns it into an advantage for their team, because the defence is now scrambling four against five. That single skill is much of what separates a great scorer from a great player.`,
    counters: `- **Pass out of it quickly**, before the rotation arrives.
- **Split the double**, dribbling between the two defenders.
- **Space the floor**, so the rotation has further to travel.
- **Attack the short roll**, where the screener catches in the space the doubling defender left.`,
    related: ['blitz', 'isolation', 'post-up', 'defensive-rotation', 'drive-and-kick'],
  }),

  tactic({
    slug: 'two-three-zone',
    title: '2-3 Zone',
    category: 'defense',
    difficulty: 'intermediate',
    aliases: ['2-3 zone', '2 3 zone', 'two three zone'],
    summary: 'Two defenders on the perimeter and three across the back, protecting the paint.',
    order: 1480,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `Two guards at the top of the arc and three players across the back line: two on the blocks and one in the middle.

The whole unit shifts toward the ball. When the ball is on one wing the zone slides that way, and the back-side defender drops into the middle to cover the gap.

It is the most common zone at every level, and famously the basis of some long-running American college programmes.`,
    whyItMatters: `It protects the paint extremely well. Three big defenders across the back make driving to the rim and posting up both difficult, which is why teams facing a dominant interior scorer often switch to it.`,
    counters: `- **Shoot over it.** The classic answer: a 2-3 concedes outside shots, particularly from the corners and the top.
- **Get the ball to the high post**, the soft spot in the middle, from where the defence can be split.
- **Attack the gaps** between defenders rather than the defenders themselves.
- **Crash the offensive glass**, since nobody in a zone has a specific man to box out.`,
    related: ['zone-defense', 'three-two-zone', 'one-three-one-zone', 'high-post'],
  }),

  tactic({
    slug: 'three-two-zone',
    title: '3-2 Zone',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['3-2 zone', '3 2 zone', 'three two zone'],
    summary: 'Three defenders across the perimeter and two at the back, aimed at outside shooting.',
    order: 1490,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `Three defenders along the three-point line and two near the basket. The inverse of a 2-3 in both shape and priorities.`,
    whyItMatters: `It is chosen against teams that shoot well from outside. Three perimeter defenders make the arc much harder to attack than a 2-3 does.

The price is paid inside: with only two defenders at the back, the paint and the offensive glass are both more vulnerable. It is a trade of interior protection for perimeter coverage.`,
    counters: `- **Attack the middle**, the area the shape leaves thin.
- **Post up**, since only two defenders guard the interior.
- **Offensive rebound**, for the same reason.
- **Use the corners**, which a 3-2 covers less well than a 2-3.`,
    related: ['zone-defense', 'two-three-zone', 'one-three-one-zone'],
  }),

  tactic({
    slug: 'one-three-one-zone',
    title: '1-3-1 Zone',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['1-3-1 zone', '1 3 1', 'one three one'],
    summary: 'A trapping zone shaped to force the ball toward the corners.',
    order: 1500,
    sourceKeys: [{ key: 'wp-zone-defense' }],
    howItWorks: `One defender at the top, three across the middle, and one along the baseline. The shape is designed to funnel the ball toward the corners, where the sideline and baseline meet and a trap can be sprung with the boundaries doing half the work.

It is more aggressive than the other zones, aiming to create turnovers rather than simply to contest shots.`,
    whyItMatters: `It disrupts rhythm and can change a game quickly by generating steals, which is why it often appears as a surprise rather than a base defence.

It is also the most vulnerable of the common zones. The corners it invites the ball into are also good shooting positions, and the shape leaves the baseline and both blocks thin.`,
    counters: `- **The short corner** and the baseline, which the shape struggles to cover.
- **Skip passes** across the floor, faster than the zone can rotate.
- **Attack it before it sets**, since it is slow to organise in transition.`,
    related: ['zone-defense', 'two-three-zone', 'full-court-press', 'double-team'],
  }),

  tactic({
    slug: 'blitz',
    title: 'Blitz',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['blitz', 'trap the ball screen', 'hard trap', 'double the ball screen'],
    summary: 'Trapping the ball handler with two defenders on a ball screen.',
    order: 1510,
    sourceKeys: GENERAL,
    howItWorks: `Both the on-ball defender and the screener's defender commit to the ball handler, trapping them and forcing the ball out of their hands.

Behind the trap, three defenders now cover four attackers. They rotate: one takes the roller, and the remaining two split the responsibility for the two open shooters, which is where the "short roll" pass becomes dangerous.`,
    whyItMatters: `It is the most aggressive ball-screen coverage and is used against elite ball handlers who would beat any other approach one-on-one. The reasoning is simple: taking the ball away from the best player is worth playing four-on-three behind it.

It also raises the tempo and can force turnovers, which is why teams that are behind sometimes blitz to generate transition chances.`,
    counters: `- **The short roll.** The screener catches in the space the trap vacated and attacks four-on-three.
- **Pass out early**, before the trap arrives.
- **Split the trap** with a dribble.
- **Space the corners**, so the rotation behind has the furthest possible distance to travel.`,
    related: ['hedge', 'double-team', 'pick-and-roll', 'defensive-rotation'],
  }),

  tactic({
    slug: 'drop-vs-switch',
    title: 'Drop Coverage vs Switching',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['drop vs switch', 'drop or switch', 'ball screen coverage'],
    summary: 'The two main ways to defend a ball screen, and what each one concedes.',
    order: 1520,
    sourceKeys: GENERAL,
    howItWorks: `Both answer the same question, and each concedes something different.

| | Drop | Switch |
|---|---|---|
| The big defender | Retreats toward the rim | Takes the ball handler |
| Protects | The basket | Nothing specifically |
| Concedes | The pull-up jump shot | A mismatch |
| Needs | A rim protector | Versatile defenders |
| Beaten by | Elite pull-up shooters, pick and pop | Post-ups, isolation against the mismatch |

Drop keeps everyone in their natural matchup and gives up space. Switch removes the space and gives up the matchups.`,
    whyItMatters: `Which one a team can play is decided largely by its **centre**. A centre who can move his feet on the perimeter makes switching viable; one who cannot forces drop, and opponents will attack that repeatedly.

This is why defensive versatility became so highly valued in the 2010s, and why a dominant but immobile centre became harder to build a defence around. The choice between these two coverages is one of the main constraints on how a roster is assembled.`,
    counters: `Against drop: the pull-up three, and the pick and pop.
Against switch: hunt the mismatch, then post up or isolate the smaller defender.`,
    related: ['drop-coverage', 'switching', 'pick-and-roll', 'mismatch', 'center'],
  }),

  tactic({
    slug: 'closeout',
    title: 'Closeout',
    category: 'defense',
    difficulty: 'intermediate',
    aliases: ['closeout', 'close out', 'closing out'],
    summary: 'Sprinting at a shooter who has just received the ball, without giving up the drive.',
    order: 1530,
    sourceKeys: GENERAL,
    howItWorks: `A defender who has helped elsewhere must recover to their own man as the ball is passed to them. The closeout is that recovery.

The technique is specific: sprint most of the way, then break down into short choppy steps with a high hand. The choppy steps are what allow the defender to change direction if the attacker drives.

Running at full speed all the way concedes the drive; arriving too slowly concedes the shot.`,
    whyItMatters: `The closeout is where help defence is paid for. Every rotation ends in one, so a team that helps well but closes out badly has simply moved the problem: it trades a layup for an open three, which is not obviously an improvement.

Attacking a closeout is a skill in its own right. A shooter who catches and immediately drives past an onrushing defender turns a good defensive rotation into a broken defence.`,
    misunderstandings: `**"Closer is better."** No. Flying at a shooter concedes the drive and often the foul. A controlled contest from a foot away is better than a wild one from six inches.

**"Hands up always."** Which hand and how high depends on whether the priority is the shot or the drive, and good defenders choose deliberately.`,
    related: ['help-defense', 'defensive-rotation', 'drive-and-kick', 'catch-and-shoot'],
  }),

  tactic({
    slug: 'defensive-rotation',
    title: 'Defensive Rotation',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['rotation', 'defensive rotation', 'rotating', 'help the helper'],
    summary: 'The chain of movements that covers for a defender who has left their assignment.',
    order: 1540,
    sourceKeys: GENERAL,
    howItWorks: `When a defender helps, their own opponent is open. A second defender covers that opponent, leaving theirs open, and a third covers that one. This chain is the rotation.

The principle is that the defence rotates toward the most dangerous available opponent, not simply toward the nearest. The final defender in the chain usually ends up covering two players and choosing which shot to concede, typically taking away the more valuable one.

It requires communication, because each defender is trusting that somebody behind them is moving.`,
    whyItMatters: `Rotation is what makes help defence survivable. Helping without rotating just relocates the open shot; helping with a coordinated rotation means the shot the defence eventually concedes is the one it chose to concede.

It is also where most defensive breakdowns actually originate. The player visibly late to a shooter is frequently not at fault: the error usually happened two passes earlier, when somebody helped unnecessarily and started a rotation that was never needed.`,
    related: ['help-defense', 'closeout', 'weak-side-help', 'double-team'],
  }),

  tactic({
    slug: 'weak-side-help',
    title: 'Weak-Side Help',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['weak side help', 'weakside', 'help side', 'low man'],
    summary: 'Defenders on the side away from the ball, positioned to protect the basket.',
    order: 1550,
    sourceKeys: GENERAL,
    howItWorks: `The **strong side** is the half of the floor the ball is on; the **weak side** is the other half.

Defenders on the weak side sag toward the middle, away from their own assignment, so they can protect the basket. They aim to see both the ball and their man at once, which is why coaches talk about being "in the gap" or "in a stance".

The **low man** is the weak-side defender nearest the baseline, and by convention they are the one who rotates to stop a rolling big.`,
    whyItMatters: `Weak-side defenders are the cheapest help available, because they are furthest from their own assignments and therefore least missed.

The tension is that in a well-spaced modern offence, weak-side defenders are guarding corner three-point shooters. Helping means conceding the most efficient shot in basketball, which is the single largest reason spacing works.`,
    related: ['help-defense', 'defensive-rotation', 'spacing', 'the-corner'],
  }),

  tactic({
    slug: 'full-court-press',
    title: 'Full-Court Press',
    category: 'defense',
    difficulty: 'intermediate',
    aliases: ['full court press', 'press', 'pressing', 'full-court pressure'],
    summary: 'Defending across the whole floor to force turnovers before the offence can set up.',
    order: 1560,
    sourceKeys: GENERAL,
    howItWorks: `Instead of retreating after conceding a basket, the defence picks up the ball immediately in the opponent's backcourt.

The eight-second rule does much of the work: the offence must reach the frontcourt within eight seconds, so every second spent under pressure is a second closer to a turnover. Presses typically trap near the sideline or at the halfway line, where the boundaries help.

Presses are described by their shape, such as a **1-2-1-1 diamond** or a **2-2-1**, and by whether they trap immediately or wait.`,
    whyItMatters: `It is primarily a tool for teams that are behind, because a turnover in the backcourt produces a layup and can close a gap quickly.

It is also physically expensive and risky. Beating a press produces a four-on-three the other way, so a team that presses badly concedes easy baskets rather than forcing turnovers. That is why it is used in bursts rather than as a base defence.`,
    counters: `- **Get the ball inbounds quickly**, before the press organises.
- **Attack the middle**, since a trap on the sideline is only dangerous if you go there.
- **Pass over it**, because most presses are vulnerable to a long pass behind them.
- **Have a second ball handler**, so trapping the primary one achieves nothing.`,
    related: ['eight-second-violation', 'double-team', 'transition-offense', 'sideline'],
  }),

  tactic({
    slug: 'ice-coverage',
    title: 'ICE Coverage',
    subtitle: 'Also called blue or down',
    category: 'defense',
    difficulty: 'advanced',
    aliases: ['ice coverage', 'ice', 'ice the pick and roll', 'blue coverage', 'down coverage'],
    summary:
      'Refusing to let the ball handler use a side ball screen, forcing them toward the baseline.',
    order: 1570,
    sourceKeys: GENERAL,
    howItWorks: `On a ball screen set at the side of the floor, the on-ball defender jumps to the side the screen is coming from, physically preventing the ball handler from using it.

The handler is forced to go the other way, toward the baseline, where the big defender is waiting and where the sideline and baseline limit their options. Effectively the ball is steered into a corner rather than into the middle of the floor.`,
    whyItMatters: `It removes the pick and roll's biggest advantage, which is getting the ball into the middle of the floor where the offence has the whole court to work with.

A drive baselined into the corner has far fewer options: no cross-court pass, no second side, and help arriving from a shorter distance.

It only works on **side** ball screens. A screen at the top of the key has two directions to go, so there is nothing to ice.`,
    counters: `- **Reject the screen** and drive the other way, into the space the on-ball defender vacated.
- **Set the screen higher**, near the top, where icing is impossible.
- **Re-screen** from the other side.
- **Attack the short roll**, since the big defender is committed low.`,
    related: ['pick-and-roll', 'drop-coverage', 'hedge', 'the-corner'],
  }),

  // ══ Rebounding ═════════════════════════════════════════════════════════════
  definition({
    slug: 'offensive-rebound',
    title: 'Offensive Rebound',
    category: 'rebounding',
    aliases: ['offensive rebound', 'oreb', 'off rebound', 'second chance'],
    summary: 'Recovering your own team’s missed shot, which creates an extra possession.',
    order: 1580,
    sourceKeys: STATS,
    explanation: `The attacking team collects its own missed shot and keeps the ball. Unlike a defensive rebound, this does not end a possession; it extends it, with the shot clock resetting to 14 seconds rather than 24.

Roughly a quarter of missed shots are rebounded by the attacking team.`,
    whyItMatters: `An offensive rebound is close to a turnover in reverse. The defence did everything right, contested the shot and forced a miss, and gets nothing for it.

Shots immediately after an offensive rebound are also unusually efficient, because the defence is scrambling and nobody is matched up. That is why **second-chance points** is tracked separately.

The trade-off is real: sending players to the offensive glass means fewer back to stop the fast break, and many modern teams deliberately concede offensive rebounds for transition safety.`,
    related: ['rebounding', 'second-chance-points', 'putback', 'transition-defense'],
  }),

  definition({
    slug: 'defensive-rebound',
    title: 'Defensive Rebound',
    category: 'rebounding',
    aliases: ['defensive rebound', 'dreb', 'def rebound'],
    summary: 'Collecting the opponent’s missed shot, which ends their possession.',
    order: 1590,
    sourceKeys: STATS,
    explanation: `The defending team collects a missed shot and gains possession. This is the expected outcome of a miss: around three quarters of them are rebounded defensively.

Because it is expected, an individual defensive rebound total says less than it appears to. Many are uncontested, and a defender standing nearby collects them whether or not anyone else was competing.`,
    whyItMatters: `Securing the defensive rebound is what makes a defensive stop an actual stop. A contested miss that the opponent rebounds has achieved nothing.

It is also the start of the fast break, so a rebounder who can outlet the ball quickly turns a defensive possession into a transition opportunity immediately.`,
    misunderstandings: `**"More defensive rebounds means a better rebounder."** Not necessarily. Totals depend on how often opponents miss and on whether teammates are competing for the same balls. **Rebound percentage** is the fairer measure.`,
    related: ['rebounding', 'offensive-rebound', 'rebound-percentage', 'fast-break'],
  }),

  tactic({
    slug: 'boxing-out',
    title: 'Boxing Out',
    category: 'rebounding',
    aliases: ['boxing out', 'box out', 'blocking out'],
    summary: 'Putting your body between an opponent and the basket as a shot goes up.',
    order: 1600,
    sourceKeys: GENERAL,
    howItWorks: `As the shot is released, the defender turns to face the basket and backs into their opponent, keeping them behind. Arms are wide and low for balance rather than for holding, which would be a foul.

The aim is not to catch the ball but to ensure the opponent cannot reach it. Whoever is closest to the rim with position collects the rebound, and position is decided in the second after the shot goes up.`,
    whyItMatters: `Boxing out is why rebounding is not simply a function of height. A well-boxed-out taller player cannot get to the ball at all, and shorter players who box out consistently out-rebound taller ones who do not.

It is also invisible in the statistics. The player who boxed out often is not the one who collects the rebound, so the work is credited to a teammate.`,
    misunderstandings: `**"Rebounding is athleticism."** Position and timing decide most rebounds. Leaping matters only for the contested minority.

**"Zone defences rebound fine."** They rebound poorly, precisely because nobody in a zone has a specific opponent to box out.`,
    related: ['rebounding', 'defensive-rebound', 'zone-defense', 'team-rebounding'],
  }),

  statistic({
    slug: 'second-chance-points',
    title: 'Second-Chance Points',
    category: 'rebounding',
    difficulty: 'intermediate',
    aliases: ['second chance points', 'second-chance', '2nd chance points'],
    summary: 'Points scored on a possession that continued after an offensive rebound.',
    order: 1610,
    sourceKeys: STATS,
    measures: `How much a team gained from rebounding its own misses. Any points scored after an offensive rebound, before the possession ends, count toward the total.`,
    formula: `Not a formula but a tally: points scored following an offensive rebound within the same possession.`,
    interpret: `Read it as a proportion of the game rather than as a raw number. Fifteen second-chance points in a game is substantial, and a large gap between the two teams usually explains a result that the shooting percentages do not.

It is most informative when a team shot poorly and still won: second-chance points are frequently the reason.`,
    limitations: `It rewards missing shots, in a narrow sense. A team that shoots well has fewer offensive rebounds available, so a low figure may indicate good shooting rather than poor rebounding.

It also says nothing about the cost. A team generating many second-chance points may be conceding fast breaks by sending everyone to the glass, and that appears nowhere in this number.`,
    related: ['offensive-rebound', 'putback', 'rebounding', 'transition-defense'],
  }),

  definition({
    slug: 'putback',
    title: 'Putback',
    category: 'rebounding',
    aliases: ['putback', 'put back', 'tip in', 'tip-in'],
    summary: 'Scoring immediately after collecting an offensive rebound.',
    order: 1620,
    sourceKeys: GENERAL,
    explanation: `A player rebounds their team's missed shot and scores at once, either by shooting again or by tipping the ball straight back in without coming down.

A **tip-in** is the version where the ball is guided in without ever being fully controlled.`,
    whyItMatters: `Putbacks are among the highest-percentage shots in basketball. They happen close to the rim against a defence that has just finished contesting a different shot and is not organised.

They are also the payoff for offensive rebounding effort, and the reason players who neither shoot nor handle the ball can still score consistently.`,
    related: ['offensive-rebound', 'second-chance-points', 'dunk', 'layup'],
  }),

  tactic({
    slug: 'team-rebounding',
    title: 'Team Rebounding',
    category: 'rebounding',
    difficulty: 'intermediate',
    aliases: ['team rebounding', 'team rebound', 'rebounding by committee'],
    summary:
      'Rebounding as a five-player responsibility rather than the centre’s job, and the statistical category of the same name.',
    order: 1630,
    sourceKeys: STATS,
    howItWorks: `Two related meanings.

**As a tactic**, it means every player boxes out rather than leaving it to the biggest. Teams playing small lineups have no choice: without a dominant rebounder, rebounds have to be won collectively by position rather than by size.

**As a statistic**, a "team rebound" is credited when a missed shot goes out of bounds or no individual gains clear control. That is why a team's rebound total exceeds the sum of its players' individual totals.`,
    whyItMatters: `The tactical version became more important as lineups got smaller. A five-out offence has nobody near the basket when a shot goes up, so conceding the defensive glass is a genuine cost of spacing that teams have to plan for.

The statistical version matters mainly to avoid confusion when the numbers do not add up, which they routinely do not.`,
    related: ['rebounding', 'boxing-out', 'five-out-offense', 'rebound-percentage'],
  }),

  // ══ Shooting ═══════════════════════════════════════════════════════════════
  definition({
    slug: 'field-goal',
    title: 'Field Goal',
    category: 'shooting',
    aliases: ['field goal', 'fg', 'basket', 'bucket'],
    summary: 'Any shot made from open play, worth two points or three.',
    order: 1700,
    sourceKeys: STATS,
    explanation: `A field goal is any successful shot other than a free throw: a layup, a dunk, a jump shot, a hook. Worth two points, or three from behind the arc.

In a box score, **FG** counts every attempt from the floor including three-pointers. **3P** is a subset of it, not an addition, which is the single most common misreading of a stat line.`,
    misunderstandings: `**"FG and 3P are separate."** They are not. "10-20 FG, 4-8 3P" means twenty shots in total, eight of which were threes.

**"A dunk counts more."** No. Two points, exactly like any other shot inside the arc.`,
    related: ['how-scoring-works', 'field-goal-percentage', 'three-pointer', 'box-score'],
  }),

  rule({
    slug: 'free-throw',
    title: 'Free Throw',
    category: 'shooting',
    aliases: ['free throw', 'ft', 'foul shot', 'charity stripe'],
    summary: 'An unopposed shot worth one point, awarded after certain fouls.',
    order: 1710,
    ruleSensitive: true,
    sourceRevision: 'FIBA Official Basketball Rules 2024',
    lastReviewedAt: '2026-08-26',
    sourceKeys: [{ key: 'fiba-rules' }],
    howItWorks: `The shooter stands at the free-throw line, fifteen feet from the backboard, with nobody guarding them. Each successful attempt is worth one point.

How many are awarded depends on the foul: two for a foul on a two-point shot, three on a three-point shot, one alongside a made basket for an **and-one**, and two for most fouls once a team is in the bonus.

Other players line up along the paint and may not enter until the ball leaves the shooter's hands. The final free throw is live, so a missed one can be rebounded.`,
    whyItMatters: `Free throws are the most efficient shot in basketball. A competent professional makes around 80%, which is 0.8 points per attempt with no defence and no risk of a turnover.

That is why drawing fouls is a cultivated skill, and why deliberate fouling of poor free-throw shooters is a recognised endgame tactic: it converts a possession into the opponent's worst available shot.`,
    ruleDifferences: `The distance and the value are universal. What differs is when free throws are awarded: the bonus threshold and the number of team fouls required vary between the NBA, FIBA and the NCAA.`,
    related: ['how-scoring-works', 'free-throw-percentage', 'bonus', 'and-one', 'shooting-foul'],
  }),

  definition({
    slug: 'three-pointer',
    title: 'Three-Pointer',
    category: 'shooting',
    aliases: ['three pointer', '3 pointer', 'three', 'trey', '3pt'],
    summary: 'A shot from behind the arc, worth three points.',
    order: 1720,
    sourceKeys: [{ key: 'wp-three-point' }],
    explanation: `Any field goal taken with both feet behind the three-point line. What matters is where the shooter's feet were at **take-off**, not where they landed: a player can drift forward through the air and still score three.`,
    whyItMatters: `The arithmetic reshaped the sport. A 35% three-point shooter produces 1.05 points per attempt, which beats a 50% two-point shooter's 1.00.

Once teams took that seriously, three-point attempts rose sharply, the mid-range game declined, big men learned to shoot, and spacing became the organising principle of offence. Almost every tactical development of the last fifteen years traces back to this one line on the floor.`,
    ruleDifferences: `The distance varies: 6.75 m under FIBA, 7.24 m at the top of the NBA arc, shorter again in the NCAA and WNBA. **3x3 scores it as two points** rather than three, since inside shots there are worth one.`,
    related: ['three-point-line', 'three-point-percentage', 'corner-three', 'spacing'],
  }),

  definition({
    slug: 'layup',
    title: 'Layup',
    category: 'shooting',
    aliases: ['layup', 'lay up', 'lay-up', 'finger roll'],
    summary: 'A close-range shot laid gently off the backboard or over the rim.',
    order: 1730,
    sourceKeys: GENERAL,
    explanation: `A shot taken next to the basket while moving, usually off one foot, guided softly off the backboard or dropped over the front of the rim.

Variants include the **finger roll**, released with backspin off the fingertips, and the **reverse layup**, finished from the far side of the hoop to keep the rim between the shooter and the defender.`,
    whyItMatters: `The layup is the most efficient shot in basketball after the free throw, and generating them is what most offensive structure exists to do. "Points in the paint" is essentially a count of how well a team did this.

It is also the shot every defensive scheme is arranged to prevent, which is why rim protection is valued so highly.`,
    related: ['dunk', 'floater', 'fast-break', 'rim-protection'],
  }),

  definition({
    slug: 'dunk',
    title: 'Dunk',
    category: 'shooting',
    aliases: ['dunk', 'slam dunk', 'jam', 'slam'],
    summary: 'Scoring by putting the ball directly through the hoop with the hand at the rim.',
    order: 1740,
    sourceKeys: GENERAL,
    explanation: `The player jumps and pushes the ball down through the basket while touching the rim or close to it. Worth two points, exactly like any other shot inside the arc.

An **alley-oop** is a dunk or layup finished from a pass caught in mid-air.`,
    whyItMatters: `Statistically it is simply a very high-percentage shot at the rim, which is why teams generate them deliberately rather than for show.

Culturally it carries far more weight than its two points. The dunk is basketball's most recognisable image, has its own competition at All-Star Weekend, and generates the vocabulary of **posterizing** an opponent.

It was banned in American college basketball between 1967 and 1976, a rule widely understood as a response to one dominant player.`,
    related: ['layup', 'alley-oop', 'poster', 'all-star-weekend'],
  }),

  definition({
    slug: 'mid-range-shot',
    title: 'Mid-Range Shot',
    category: 'shooting',
    aliases: ['mid range', 'midrange', 'mid-range', 'long two'],
    summary: 'A two-point jump shot from outside the paint but inside the arc.',
    order: 1750,
    sourceKeys: GENERAL,
    explanation: `Any shot from the area between the paint and the three-point line. A shot from just inside the arc is often called a **long two**.`,
    whyItMatters: `The mid-range shot is the clearest casualty of basketball's analytics era, and the reasoning is simple. A long two is nearly as difficult as a three and worth one point less. Teams that measured shot value systematically concluded that most mid-range attempts were the worst shot available and largely stopped taking them.

It has not disappeared, and the exceptions matter. Against a defence in drop coverage the pull-up mid-range is the shot deliberately being conceded, and late in the shot clock it is often the only shot available. Elite shot-makers still use it, particularly in the playoffs when defences take away everything else.`,
    misunderstandings: `**"The mid-range is dead."** It is deprioritised, not abolished. Several of the sport's best scorers rely on it, and drop coverage exists precisely to concede it.`,
    related: [
      'three-point-line',
      'drop-coverage',
      'pull-up-shot',
      'effective-field-goal-percentage',
    ],
  }),

  definition({
    slug: 'floater',
    title: 'Floater',
    subtitle: 'Also called a teardrop or runner',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['floater', 'teardrop', 'runner', 'tear drop'],
    summary: 'A high, soft shot released early to clear a taller defender.',
    order: 1760,
    sourceKeys: GENERAL,
    explanation: `Taken while driving, released from further out than a layup and with a much higher arc, so the ball travels over the outstretched arms of a rim protector.

The point is the release, not the distance: it is thrown before the defender can contest, from a range where a layup would be blocked.`,
    whyItMatters: `It is the standard answer to shot-blocking for smaller players. A guard driving into a large centre cannot finish at the rim reliably, and the floater is how they score anyway.

It is a genuinely difficult shot, taken off balance and on the move, which is why it is treated as a marker of a skilled guard rather than a routine finish.`,
    related: ['layup', 'rim-protection', 'drop-coverage', 'point-guard'],
  }),

  definition({
    slug: 'hook-shot',
    title: 'Hook Shot',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['hook shot', 'hook', 'skyhook', 'jump hook'],
    summary:
      'A one-handed shot released in a sweeping arc across the body, with the shoulder shielding the ball.',
    order: 1770,
    sourceKeys: GENERAL,
    explanation: `The shooter turns side-on and sweeps the ball up and over with the far hand, keeping their body between the defender and the ball. Because of that shielding it is almost impossible to block cleanly.

The **skyhook**, released at the very top of a fully extended arm, is the most famous version, associated with Kareem Abdul-Jabbar and never really replicated.`,
    whyItMatters: `It is the traditional post scorer's shot, and it survives for the same reason it always worked: the defender cannot reach the ball without going through the shooter's body.

Its decline tracks the decline of post play generally rather than any weakness in the shot itself.`,
    related: ['post-up', 'low-post', 'center'],
  }),

  definition({
    slug: 'bank-shot',
    title: 'Bank Shot',
    category: 'shooting',
    aliases: ['bank shot', 'off the glass', 'bank', 'banked'],
    summary: 'A shot played deliberately off the backboard.',
    order: 1780,
    sourceKeys: GENERAL,
    explanation: `The ball is aimed at the backboard rather than the rim, using the rebound off the glass to drop it in. Most effective from an angle, roughly 45 degrees to the basket, where the square marked on the backboard gives a clear aiming point.

From directly in front, banking is much harder and rarely attempted.`,
    whyItMatters: `A bank shot has a larger margin for error than a direct shot from the same angle, because the backboard absorbs pace and redirects the ball downward. Layups are almost all bank shots for exactly this reason.

It is also the shot most often attributed to luck when it goes in from distance, which is unfair to players who bank deliberately.`,
    related: ['layup', 'mid-range-shot', 'basketball-court'],
  }),

  definition({
    slug: 'corner-three',
    title: 'Corner Three',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['corner three', 'corner 3', 'corner threes'],
    summary: 'A three-pointer from the corner: the shortest three on the floor.',
    order: 1790,
    sourceKeys: [{ key: 'wp-three-point' }],
    explanation: `Taken from either corner, where the arc runs closest to the basket because it must stop before reaching the sideline.

In the NBA it is 22 ft against 23 ft 9 in at the top of the arc, a difference of over a foot and a half for the same three points.`,
    whyItMatters: `It is one of the most efficient shots in basketball: three points from the shortest possible distance.

It is also expensive to defend. A helper who leaves the corner has a long way to recover, so offences station shooters there specifically to punish help defence. That is why drive-and-kick offences aim at the corners, and why "corner three" is treated as a shot type in its own right.

The corner shooter is usually a **3-and-D** player: someone whose value is being reliably dangerous from that spot without needing the ball.`,
    ruleDifferences: `The NBA's corner is much shorter relative to the top of its arc than FIBA's is, so the corner three is a more distinct strategic target in the NBA than in international basketball.`,
    related: ['the-corner', 'three-pointer', 'spacing', 'drive-and-kick', 'three-and-d'],
  }),

  definition({
    slug: 'catch-and-shoot',
    title: 'Catch-and-Shoot',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['catch and shoot', 'catch-and-shoot', 'spot up', 'spot-up'],
    summary: 'Shooting immediately on receiving a pass, without dribbling.',
    order: 1800,
    sourceKeys: STATS,
    explanation: `The shooter receives the ball already prepared, feet set and hands ready, and releases without putting it on the floor.

It is tracked separately from pull-up shooting, and players are often much better at one than the other.`,
    whyItMatters: `Catch-and-shoot attempts are more efficient than shots off the dribble, because they are taken in rhythm and usually with more space.

It is also the skill that makes a player useful without the ball, which is what a team surrounding a dominant creator needs. A player who can only score off the dribble is difficult to play alongside another such player; a catch-and-shoot specialist fits with anyone.

The related skill is **relocating**: moving to a new spot as the ball moves, so the pass arrives with the defender out of position.`,
    related: ['three-and-d', 'pull-up-shot', 'drive-and-kick', 'spacing', 'pin-down'],
  }),

  definition({
    slug: 'pull-up-shot',
    title: 'Pull-Up Shot',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['pull up', 'pull-up', 'pullup', 'off the dribble'],
    summary: 'Rising to shoot directly out of a dribble.',
    order: 1810,
    sourceKeys: STATS,
    explanation: `The shooter is dribbling, stops, and shoots in one motion without passing or setting up. Distinct from a catch-and-shoot, which comes off a pass.`,
    whyItMatters: `Pull-up shooting is what makes drop coverage costly. Drop concedes exactly this shot, so a player who can make pull-up threes at volume forces defences out of their preferred coverage entirely.

It is much harder than catch-and-shoot, since the shooter creates their own separation and shoots off balance, which is why players who do it well at high volume are rare and valuable.`,
    related: ['catch-and-shoot', 'drop-coverage', 'step-back', 'isolation'],
  }),

  definition({
    slug: 'step-back',
    title: 'Step-Back',
    category: 'shooting',
    difficulty: 'intermediate',
    aliases: ['step back', 'step-back', 'stepback', 'stepback three'],
    summary: 'Creating space by stepping backwards away from the defender before shooting.',
    order: 1820,
    sourceKeys: GENERAL,
    explanation: `The attacker drives or fakes toward the basket, then pushes off and steps backwards, creating separation from a defender whose momentum is going forwards. The shot follows immediately.

Its legality is the most-argued question about it. It is legal if the footwork falls within the gather step plus two steps that the rules allow. Many do; some do not, which is why the call is contested so often.`,
    whyItMatters: `It is the main way a modern scorer generates a clean three-pointer against tight defence without a screen, and its spread is one reason isolation scoring became viable again in a spacing-driven era.

It also illustrates how rule interpretation shapes style. Clarifying the gather step made this shot reliably legal, and its use rose sharply as a result.`,
    related: ['traveling', 'pull-up-shot', 'isolation', 'three-pointer'],
  }),

  definition({
    slug: 'buzzer-beater',
    title: 'Buzzer Beater',
    category: 'shooting',
    aliases: ['buzzer beater', 'buzzer-beater', 'at the buzzer', 'game winner'],
    summary: 'A shot released before the clock expires that goes in after it.',
    order: 1830,
    sourceKeys: GENERAL,
    explanation: `The ball must leave the shooter's hands before the buzzer sounds. If it does, and it goes in, it counts, even though the clock reached zero while the ball was in flight.

Replay review is routinely used to check the release against the clock, since the margin is often a fraction of a second.`,
    whyItMatters: `Because basketball has no draws, a buzzer beater can end a game outright rather than merely equalising, which is why they carry more weight than a last-second goal in most sports.

The rule also produces the deliberate long heave at the end of a quarter, where a player throws from distance rather than let the clock expire with the ball in their hands.`,
    related: ['game-clock', 'how-you-win-a-basketball-game', 'clutch', 'shot-clock-violation'],
  }),

  // ══ Basic statistics ═══════════════════════════════════════════════════════
  statistic({
    slug: 'points',
    title: 'Points',
    category: 'statistics',
    aliases: ['points', 'pts', 'scoring'],
    summary: 'Total points scored: the headline number, and the most context-dependent one.',
    order: 1840,
    sourceKeys: STATS,
    measures: `How many points a player scored, from free throws, two-pointers and three-pointers combined.`,
    formula: `**Points = (2 × 2PM) + (3 × 3PM) + FTM**

You can always check a stat line this way. A player with 9-19 FG including 3-7 3P, and 7-8 FT, scored (6 × 2) + (3 × 3) + 7 = **28**.`,
    interpret: `Never read points alone. Twenty-eight points on nineteen shots is efficient scoring; twenty-eight on thirty shots is a poor night that looks respectable in a headline.

Points also depend on minutes and pace, so totals from different competitions are not comparable: an NBA game is eight minutes longer than a FIBA one.`,
    limitations: `Scoring is the most visible contribution and the most overrated in isolation. It says nothing about efficiency, defence, passing or shot difficulty, and a high scorer on poor efficiency may be actively costing their team possessions.

Read it beside **true shooting percentage** and **usage rate**, which together say how much someone shot and how well.`,
    related: ['true-shooting-percentage', 'usage-rate', 'box-score', 'how-scoring-works'],
  }),

  statistic({
    slug: 'rebounds',
    title: 'Rebounds',
    category: 'statistics',
    aliases: ['rebounds', 'reb', 'boards', 'rebounding stats'],
    summary: 'Missed shots collected, split into offensive and defensive.',
    order: 1850,
    sourceKeys: STATS,
    measures: `How many missed shots a player gathered. Recorded separately as **offensive** (your team's miss) and **defensive** (the opponent's), which are worth quite different things.`,
    interpret: `Around ten rebounds a game is strong for a professional big man. But raw totals depend heavily on opportunity: a player on a team that misses often, or whose teammates do not compete for rebounds, will collect more.

**Rebound percentage**, the share of available rebounds a player collected while on the floor, is the fairer comparison.`,
    limitations: `It credits the collector, not the worker. The player who boxed out an opponent so a teammate could take the ball uncontested gets nothing.

Uncontested rebounds also count the same as contested ones, and most defensive rebounds are uncontested.`,
    related: [
      'rebounding',
      'offensive-rebound',
      'defensive-rebound',
      'rebound-percentage',
      'boxing-out',
    ],
  }),

  statistic({
    slug: 'assists',
    title: 'Assists',
    category: 'statistics',
    aliases: ['assists', 'ast', 'dimes', 'passing stats'],
    summary: 'Passes that lead directly to a teammate scoring.',
    order: 1860,
    sourceKeys: STATS,
    measures: `A pass that leads directly to a made basket. The recipient must score without needing to create the shot themselves, though how much dribbling is permitted before the assist is void is a judgement made by the scorer.`,
    interpret: `Eight or more per game is high-level playmaking. But assists are heavily dependent on teammates: the same pass counts only if the shot goes in, so a passer surrounded by poor shooters is penalised for their teammates' misses.

**Assist percentage** adjusts for this by measuring the share of teammates' baskets a player assisted while on the floor.`,
    limitations: `It is a scorer's judgement, not a measured quantity, and standards have varied between competitions and eras.

More importantly it misses the **hockey assist**: the pass before the assist, which frequently did the work of breaking the defence. A drive-and-kick that swings the ball twice credits only the final passer.

It also ignores passes that created an open shot the teammate missed.`,
    related: ['assist-percentage', 'ball-movement', 'point-guard', 'dime', 'box-score'],
  }),

  statistic({
    slug: 'steals',
    title: 'Steals',
    category: 'statistics',
    aliases: ['steals', 'stl', 'takeaways'],
    summary:
      'Taking the ball from the opposition, and one of only two defensive box-score entries.',
    order: 1870,
    sourceKeys: STATS,
    measures: `Gaining possession directly from an opponent: intercepting a pass, or stripping the ball from a ball handler.`,
    interpret: `Two or more per game is a high figure. Steals are valuable beyond the possession itself, because they usually start a fast break against an unset defence.`,
    limitations: `Steals reward **gambling**, which is the important caveat. A defender who jumps passing lanes constantly will accumulate steals and also concede baskets every time they guess wrong, and the second half of that does not appear anywhere.

Conversely a positionally excellent defender who is never beaten may record almost none.

This is one of the clearest illustrations of why the box score is a poor guide to defence: it records the two most gamble-friendly defensive acts and nothing else.`,
    related: ['blocks', 'turnovers', 'defensive-rating', 'fast-break', 'box-score'],
  }),

  statistic({
    slug: 'blocks',
    title: 'Blocks',
    category: 'statistics',
    aliases: ['blocks', 'blk', 'blocked shots', 'swats'],
    summary: 'Shots deflected legally, and a partial measure of rim protection.',
    order: 1880,
    sourceKeys: STATS,
    measures: `Legally deflecting an opponent's shot attempt. The block must occur while the ball is still rising or at its apex; touching it on the way down is **goaltending**, which awards the basket instead.

Not to be confused with a **blocking foul**, which is illegal defence and unrelated despite the name.`,
    interpret: `Two or more per game is high. But blocks measure only the visible part of rim protection, and usually the smaller part.`,
    limitations: `The largest defensive effect of a shot-blocker is **deterrence**, which is recorded nowhere. Attackers who see them waiting pull up short, pass out, or take a worse shot, and none of that appears in any box score.

Blocks also do not distinguish a shot swatted out of bounds, which returns possession to the offence, from one controlled by a teammate, which ends the possession. The second is far more valuable.

Opponents' field goal percentage at the rim is a better measure of rim protection than block totals.`,
    related: ['rim-protection', 'goaltending', 'blocking-foul', 'defensive-rating'],
  }),

  statistic({
    slug: 'turnovers',
    title: 'Turnovers',
    category: 'statistics',
    aliases: ['turnovers', 'to', 'tov', 'giveaways'],
    summary: 'Losing possession without a shot attempt.',
    order: 1890,
    sourceKeys: STATS,
    measures: `Any possession that ends without a shot: a bad pass, a steal against you, an offensive foul, or a violation such as travelling or a shot-clock expiry.`,
    interpret: `Turnovers are worth more than they appear, because they cost twice. The possession produces nothing, and the opponent frequently starts theirs in transition against an unset defence.

Around three per game is unremarkable for a primary ball handler; the more informative measure is **turnover percentage**, which accounts for how much a player handles the ball.`,
    limitations: `Raw totals punish the players who handle the ball most, who are usually the best passers. A player who never touches the ball never turns it over, which is not a virtue.

They also do not distinguish an ambitious pass that would have produced a layup from a careless one nobody was pressuring.`,
    related: ['turnover-percentage', 'possession', 'steals', 'transition-offense', 'usage-rate'],
  }),

  statistic({
    slug: 'free-throw-percentage',
    title: 'Free Throw Percentage (FT%)',
    category: 'statistics',
    aliases: ['ft%', 'free throw percentage', 'ft percentage'],
    summary: 'The share of free throws a player makes: the purest measure of shooting technique.',
    order: 1900,
    sourceKeys: STATS,
    measures: `Free throws made divided by free throws attempted. Every attempt is identical, unguarded, from the same distance, so the number is unusually clean.`,
    formula: `**FT% = FTM ÷ FTA**`,
    interpret: `- **90%+:** elite.
- **80%:** around the professional average.
- **Below 70%:** a genuine weakness.
- **Below 60%:** exploitable, and opponents will foul them deliberately at the end of games.

Because free throws are uncontested, FT% is also a decent predictor of overall shooting touch, and analysts use it as a hint about whether a young player's outside shooting is likely to develop.`,
    limitations: `It measures a shot taken in isolation, so it says nothing about shooting off the dribble, under pressure, or with a defender closing out.

Sample sizes are also small for players who rarely draw fouls, so a single season's figure can be misleading.`,
    related: ['free-throw', 'true-shooting-percentage', 'bonus', 'box-score'],
  }),

  definition({
    slug: 'double-double',
    title: 'Double-Double',
    category: 'statistics',
    alsoIn: ['glossary'],
    aliases: ['double double', 'double-double'],
    summary: 'Reaching double figures in two statistical categories in one game.',
    order: 1910,
    sourceKeys: STATS,
    explanation: `Ten or more in two of the five main categories: points, rebounds, assists, steals or blocks.

The common combinations are points and rebounds, typical of a big man, and points and assists, typical of a guard.`,
    whyItMatters: `It is a convenient shorthand for a well-rounded game rather than a meaningful analytical threshold. Ten is a round number in a decimal system and nothing more.

A player with 10 points and 10 rebounds has a double-double; one with 9 and 14 does not, and has probably had the better game.`,
    related: ['triple-double', 'points', 'rebounds', 'assists'],
  }),

  definition({
    slug: 'triple-double',
    title: 'Triple-Double',
    category: 'statistics',
    alsoIn: ['glossary'],
    aliases: ['triple double', 'triple-double'],
    summary: 'Double figures in three statistical categories in one game.',
    order: 1920,
    sourceKeys: STATS,
    explanation: `Ten or more in three of points, rebounds, assists, steals or blocks. Almost always points, rebounds and assists, since ten steals or ten blocks are extremely rare.`,
    whyItMatters: `It is basketball's best-known statistical milestone and a genuine marker of all-round contribution: doing three different things at a high level in one game is difficult.

It is also the clearest example of a threshold shaping behaviour. Players are aware when they are one rebound short, and chasing the tenth is a visible and sometimes criticised habit.`,
    misunderstandings: `**"A triple-double means the team played well."** Not necessarily. It is entirely possible to record one in a heavy defeat, and a triple-double on poor shooting can coexist with an inefficient game.`,
    related: ['double-double', 'points', 'rebounds', 'assists'],
  }),

  // ══ Advanced statistics ════════════════════════════════════════════════════
  statistic({
    slug: 'possessions',
    title: 'Possessions',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['possessions', 'poss', 'number of possessions'],
    summary:
      'The count of turns with the ball, and the denominator under almost every advanced metric.',
    order: 1930,
    sourceKeys: STATS,
    measures: `How many times a team had the ball. Because possessions alternate, both teams have almost exactly the same number in a game, which is what makes per-possession comparison fair.`,
    formula: `Possessions are **estimated** rather than counted directly, since play-by-play does not mark them explicitly. The standard approximation is

**Poss ≈ FGA + 0.44 × FTA − OREB + TOV**

The 0.44 accounts for the fact that free-throw attempts do not map one-to-one onto possessions, and subtracting offensive rebounds prevents a continued possession being counted twice.`,
    interpret: `An NBA team uses roughly 95–105 possessions per game depending on pace. The figure itself is rarely interesting; what matters is that it is the denominator for offensive rating, defensive rating and points per possession.`,
    limitations: `It is an estimate, and different sources use slightly different formulas, so possession counts and everything derived from them can differ marginally between providers.`,
    related: ['pace', 'offensive-rating', 'points-per-possession', 'possession'],
  }),

  statistic({
    slug: 'points-per-possession',
    title: 'Points Per Possession',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['points per possession', 'ppp', 'per possession'],
    summary: 'Points produced per turn with the ball: the unit tactics are judged in.',
    order: 1940,
    sourceKeys: STATS,
    measures: `How many points a team or an action produces per possession. Offensive rating is the same idea scaled to 100 possessions.`,
    formula: `**PPP = points ÷ possessions**

A team scoring 112 points in 98 possessions is at 1.14 PPP, equivalent to an offensive rating of 114.`,
    interpret: `Around 1.10–1.15 is a good professional offence. The value of PPP is that it can be applied to **individual actions**, not just whole games:

- Transition: roughly 1.10–1.20
- Cuts and shots at the rim: high
- Spot-up threes: around 1.05–1.10 at typical percentages
- Isolation: often below 1.00
- Contested mid-range: the lowest of the common actions

That table is essentially why modern basketball looks the way it does. Teams shifted toward the actions at the top and away from those at the bottom.`,
    limitations: `Small samples are volatile, particularly for individual play types. A player's isolation PPP over thirty possessions says very little.

It also measures outcome rather than process: a possession that produced a wide-open three which missed scored zero, though it was a good possession.`,
    related: ['possessions', 'offensive-rating', 'pace', 'isolation', 'transition-offense'],
  }),

  statistic({
    slug: 'rebound-percentage',
    title: 'Rebound Percentage',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['rebound percentage', 'reb%', 'trb%', 'oreb%', 'dreb%'],
    summary: 'The share of available rebounds a player collected while on the floor.',
    order: 1950,
    sourceKeys: STATS,
    measures: `Of the rebounds available while a player was playing, what proportion did they take. Reported as total, offensive or defensive rebound percentage.`,
    formula: `**REB% ≈ (player rebounds × team minutes) ÷ (player minutes × (team rebounds + opponent rebounds))**

The intent is simply: rebounds taken divided by rebounds available.`,
    interpret: `- **Offensive rebound percentage above 10%** is strong; teams collect roughly a quarter of their own misses in total.
- **Defensive rebound percentage above 25%** is strong for an individual.
- Total rebound percentage above 20% marks an elite rebounder.

It is much fairer than raw totals, because it adjusts for minutes played, the pace of the game, and how often shots were missed at all.`,
    limitations: `It still credits only the player who collects the ball. Boxing out so a teammate can rebound uncontested appears nowhere.

Team context also distorts it: a player alongside another dominant rebounder will post lower figures simply because they are competing with a teammate.`,
    related: ['rebounds', 'rebounding', 'boxing-out', 'offensive-rebound'],
  }),

  statistic({
    slug: 'assist-percentage',
    title: 'Assist Percentage',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['assist percentage', 'ast%', 'assist rate'],
    summary: 'The share of teammates’ baskets a player assisted while on the floor.',
    order: 1960,
    sourceKeys: STATS,
    measures: `Of the field goals scored by teammates while a player was on the court, what proportion did that player assist.`,
    formula: `**AST% ≈ assists ÷ (teammate field goals made while on court)**`,
    interpret: `- **30%+:** a primary playmaker.
- **20–30%:** a significant secondary creator.
- **Under 10%:** a player who does not create for others, typically a specialist shooter or interior finisher.

It is a better measure of playmaking than raw assists because it adjusts for minutes and for how often the team scores at all.`,
    limitations: `It inherits every weakness of the assist itself. Passes that create open shots which miss count for nothing, the hockey assist is invisible, and the definition depends on a scorer's judgement.

It also cannot distinguish a pass that broke a defence from a routine swing pass to an already-open shooter.`,
    related: ['assists', 'ball-movement', 'usage-rate', 'point-guard'],
  }),

  statistic({
    slug: 'turnover-percentage',
    title: 'Turnover Percentage',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['turnover percentage', 'tov%', 'turnover rate'],
    summary: 'How often a player’s possessions end in a turnover.',
    order: 1970,
    sourceKeys: STATS,
    measures: `The share of a player's used possessions that ended in a turnover, rather than a shot or free throws.`,
    formula: `**TOV% ≈ turnovers ÷ (FGA + 0.44 × FTA + turnovers)**`,
    interpret: `- **Under 10%:** very secure, typical of an off-ball specialist.
- **12–14%:** normal for a primary ball handler.
- **Over 16%:** careless for the volume, and worth investigating.

It should always be read against **usage rate** and **assist percentage**. A high-usage playmaker with a 13% turnover rate is doing well; a low-usage shooter with the same figure is not.`,
    limitations: `Like raw turnovers, it penalises ambition. A passer attempting difficult passes that would produce layups will turn the ball over more than one who only makes safe passes, and the resulting baskets are counted elsewhere.

Security is not automatically a virtue: an offence with no turnovers is usually an offence taking no risks.`,
    related: ['turnovers', 'usage-rate', 'assist-percentage', 'possessions'],
  }),

  statistic({
    slug: 'player-efficiency-rating',
    title: 'Player Efficiency Rating (PER)',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['per', 'player efficiency rating', 'hollinger per'],
    summary:
      'A single per-minute rating combining box-score contributions, scaled so 15 is average.',
    order: 1980,
    sourceKeys: STATS,
    measures: `An attempt to compress everything in the box score into one per-minute number. Positive contributions such as points, rebounds, assists, steals and blocks are added; misses, turnovers and fouls subtract.

It is normalised each season so that the league average is exactly **15.0**, which makes it comparable across eras in a way raw totals are not.`,
    interpret: `- **30+:** a historically great season.
- **20–25:** an All-Star level year.
- **15:** exactly average, by construction.
- **Below 11:** a replacement-level player.`,
    limitations: `PER's weaknesses are well documented and worth stating plainly, because its single tidy number invites more confidence than it deserves.

**It barely measures defence.** Only steals and blocks enter, so an excellent defender who does neither is invisible, and PER systematically overrates offence.

**It rewards volume.** The formula is generous enough that a player can raise their PER by taking more shots at merely average efficiency.

**It is a box-score metric.** Screens, spacing, rotations and positioning contribute nothing.

Treat it as a rough summary of offensive box-score production per minute, and never as a settled ranking of players.`,
    related: ['true-shooting-percentage', 'usage-rate', 'box-plus-minus', 'win-shares'],
  }),

  statistic({
    slug: 'win-shares',
    title: 'Win Shares',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['win shares', 'ws', 'win shares per 48'],
    summary: 'An estimate of how many of a team’s wins a player was responsible for.',
    order: 1990,
    sourceKeys: STATS,
    measures: `A player's contribution expressed in wins. Offensive and defensive win shares are calculated separately from points produced and points allowed, then added.

The design property is that the win shares of a team's players sum roughly to the team's actual win total.`,
    interpret: `- **10+ in a season:** an outstanding year.
- **5–8:** a solid starter.
- **Around 0:** replacement level.

**Win Shares per 48 minutes** removes playing time, which makes it more useful for comparing players in different roles. The league average is around 0.100.`,
    limitations: `**It is a cumulative statistic**, so playing more minutes on a good team inflates it. A strong player on a poor team will always trail a moderate one on an excellent team.

**Defensive win shares lean heavily on team performance**, so they distribute a team's defensive quality across its players rather than isolating individual contribution. A poor defender on an excellent defence looks good.

It is best read as a rough allocation of team success, not as an independent measurement of a player.`,
    related: ['box-plus-minus', 'vorp', 'player-efficiency-rating', 'net-rating'],
  }),

  statistic({
    slug: 'box-plus-minus',
    title: 'Box Plus/Minus (BPM)',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['bpm', 'box plus minus', 'box plus/minus'],
    summary: 'An estimate of points contributed per 100 possessions above an average player.',
    order: 2000,
    sourceKeys: STATS,
    measures: `How many points per 100 possessions a player contributes above a league-average player, estimated from box-score statistics and adjusted for team performance.

Unlike raw plus-minus it does not simply record what happened while a player was on court; it attempts to estimate their own contribution.`,
    interpret: `- **+8:** an MVP-calibre season.
- **+4:** an All-Star.
- **0:** exactly average.
- **−2 or below:** below replacement level.

It splits into offensive and defensive components, and the offensive half is considerably more reliable than the defensive half.`,
    limitations: `**Defensive BPM is weak**, for the same reason every box-score defensive metric is: the box score records almost nothing about defence.

It is an **estimate built on a regression**, so it assumes a player's contribution resembles that of historically similar box-score profiles. Unusual players are estimated poorly.

It also inherits team effects: BPM is anchored partly to team results, so a player's figure moves with their teammates.`,
    related: ['vorp', 'plus-minus', 'win-shares', 'on-off-rating'],
  }),

  statistic({
    slug: 'vorp',
    title: 'VORP',
    subtitle: 'Value Over Replacement Player',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['vorp', 'value over replacement', 'value over replacement player'],
    summary: 'Box Plus/Minus converted into total value over a freely available replacement.',
    order: 2010,
    sourceKeys: STATS,
    measures: `How much a player contributed over what a "replacement level" player, someone a team could sign freely, would have contributed in the same minutes.

It takes BPM and multiplies it by playing time, so unlike BPM it is a **cumulative** figure: playing more produces more.`,
    formula: `**VORP ≈ (BPM − (−2.0)) × (share of minutes played) × (team games ÷ 82)**

The −2.0 is the assumed replacement level: a player at that BPM is considered freely available.`,
    interpret: `- **7+:** an MVP-level season.
- **3–5:** an All-Star.
- **Around 0:** replacement level.

Because it rewards availability, VORP favours players who play many minutes across a full season, which is deliberate: a great player who misses half the year genuinely provided less value.`,
    limitations: `It inherits every weakness of BPM, including the unreliable defensive component, and adds a dependence on minutes that can flatter a durable average player over a brilliant injured one.

The replacement level itself is a chosen constant rather than a measured quantity.`,
    related: ['box-plus-minus', 'win-shares', 'plus-minus'],
  }),

  statistic({
    slug: 'on-off-rating',
    title: 'On/Off Rating',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['on off', 'on/off', 'on-off rating', 'on off splits'],
    summary: 'How a team performs with a player on the floor compared with without them.',
    order: 2020,
    sourceKeys: STATS,
    measures: `The difference between a team's net rating while a player is on court and its net rating while they sit.

It is the most direct available answer to "does this team play better with them?", and it captures contributions no box score records.`,
    formula: `**On/Off = (net rating on court) − (net rating off court)**

A team at +6 with a player and −4 without them gives an on/off of **+10**.`,
    interpret: `- **+10 or more** over a full season is a substantial positive impact.
- **Around 0** suggests the team performs similarly either way.
- Large negatives are worth investigating rather than accepting.`,
    limitations: `**Who else is on the floor dominates it.** If a player always plays with the starters and rests with the substitutes, their on/off measures the gap between those two groups rather than the player.

**Sample size is a real problem.** Off-court minutes are usually far fewer than on-court minutes for a starter, so the comparison rests on a small and unrepresentative sample.

**It cannot separate teammates.** Two players who always play together will have nearly identical on/off figures regardless of their individual contributions.

Adjusted plus-minus metrics exist specifically to address these, and they trade transparency for it.`,
    related: ['plus-minus', 'net-rating', 'box-plus-minus'],
  }),

  statistic({
    slug: 'per-36-minutes',
    title: 'Per 36 Minutes',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['per 36', 'per-36', 'per 36 minutes', 'per36'],
    summary:
      'Statistics scaled to a common 36 minutes, so players with different playing time can be compared.',
    order: 2030,
    sourceKeys: STATS,
    measures: `A player's production rescaled as though they had played 36 minutes, roughly a starter's workload in the NBA.`,
    formula: `**Per 36 = (statistic ÷ minutes played) × 36**

A player averaging 10 points in 18 minutes is at 20 points per 36.`,
    interpret: `It answers one narrow question well: how productive is this player while they are actually playing? It is most useful for young players and substitutes whose raw averages are suppressed by limited minutes.`,
    limitations: `**Extrapolation is not prediction**, and this is the trap. A player producing at a high rate in 15 minutes against opposing substitutes would very often not sustain it across 36 minutes against starters, with the associated fatigue and defensive attention.

Per-36 figures are routinely used to argue that a bench player deserves a starting role, and they are weak evidence for it.

They also do not adjust for **pace**, so a fast-paced team's players are flattered. Per 100 possessions handles that.`,
    related: ['per-100-possessions', 'pace', 'points', 'usage-rate'],
  }),

  statistic({
    slug: 'per-100-possessions',
    title: 'Per 100 Possessions',
    category: 'statistics',
    difficulty: 'advanced',
    aliases: ['per 100', 'per 100 possessions', 'per-100'],
    summary: 'Statistics scaled to a fixed number of possessions, removing pace entirely.',
    order: 2040,
    sourceKeys: STATS,
    measures: `Production rescaled to a common 100 possessions rather than a common number of minutes.`,
    formula: `**Per 100 = (statistic ÷ possessions while on court) × 100**`,
    interpret: `This is the preferred normalisation for serious comparison, because it removes both playing time and **pace**.

Per-36 corrects for minutes but not for how many possessions those minutes contained. A player on a fast team gets more chances in the same 36 minutes, and per-100 removes that advantage.

Offensive and defensive rating are both per-100 measures, which is why they are the standard for comparing teams.`,
    limitations: `It shares per-36's extrapolation problem: scaling a substitute's production up assumes it would hold against better opposition.

Possession counts are also estimated rather than measured, so the denominator carries a small amount of error.`,
    related: ['per-36-minutes', 'possessions', 'pace', 'offensive-rating'],
  }),

  // ══ Glossary ═══════════════════════════════════════════════════════════════
  definition({
    slug: 'airball',
    title: 'Airball',
    category: 'glossary',
    aliases: ['airball', 'air ball'],
    summary: 'A shot that misses the rim, backboard and net entirely.',
    order: 2100,
    sourceKeys: GENERAL,
    explanation: `A shot that touches nothing on its way down. Because it does not hit the rim, it also fails to reset the shot clock, so an airball late in a possession is a **shot-clock violation** as well as a miss.

Crowds traditionally chant at the shooter afterwards, which is one of basketball's older rituals.`,
    related: ['brick', 'shot-clock-violation', 'field-goal-percentage'],
  }),

  definition({
    slug: 'alley-oop',
    title: 'Alley-Oop',
    category: 'glossary',
    aliases: ['alley oop', 'alley-oop', 'lob', 'oop'],
    summary: 'A pass thrown near the rim that a teammate catches in mid-air and finishes.',
    order: 2110,
    sourceKeys: GENERAL,
    explanation: `The passer throws the ball high toward the basket rather than to the receiver's hands. The receiver jumps, catches it in flight, and dunks or lays it in before landing.

It is scored as an ordinary two-point field goal, with an assist for the passer.`,
    whyItMatters: `Beyond the spectacle, it is a genuine tactical answer to a defence that plays behind a rolling big man. If the defender is between the roller and the passer but not above them, the ball can simply be thrown over everyone.

It is the standard finish to a pick and roll against drop coverage where the roller is a strong leaper.`,
    related: ['dunk', 'pick-and-roll', 'assists', 'poster'],
  }),

  definition({
    slug: 'and-one',
    title: 'And-One',
    category: 'glossary',
    aliases: ['and one', 'and-one', 'and 1', 'three point play'],
    summary: 'Being fouled while scoring, which adds one free throw to the basket.',
    order: 2120,
    sourceKeys: GENERAL,
    explanation: `A player is fouled in the act of shooting and the shot still goes in. The basket counts, and they get one free throw.

A two-point basket plus the free throw is a **three-point play**. A three-pointer plus the free throw is a **four-point play**, which is rare.`,
    whyItMatters: `It is among the most efficient outcomes available: full value for the shot plus a bonus attempt at the most efficient shot in basketball.

Players deliberately absorb contact and finish through it for this reason, and drawing and-ones consistently is a recognised skill rather than luck.`,
    misunderstandings: `**"And-one means three points."** It means the basket plus **one free throw**, which the shooter can still miss.`,
    related: ['shooting-foul', 'free-throw', 'how-scoring-works'],
  }),

  definition({
    slug: 'ankle-breaker',
    title: 'Ankle Breaker',
    category: 'glossary',
    aliases: ['ankle breaker', 'ankle-breaker', 'broke his ankles', 'crossover'],
    summary: 'A dribble move that leaves a defender stumbling or on the floor.',
    order: 2130,
    sourceKeys: GENERAL,
    explanation: `Slang for a change of direction so sharp that the defender loses their footing entirely. Usually the product of a **crossover**, where the ball is moved rapidly from one hand to the other, often combined with a hesitation.

Nobody's ankles are actually broken. The phrase describes the defender's balance rather than any injury.`,
    related: ['carrying', 'isolation', 'poster'],
  }),

  definition({
    slug: 'brick',
    title: 'Brick',
    category: 'glossary',
    aliases: ['brick', 'bricked', 'bricking'],
    summary: 'A badly missed shot, usually one that rebounds hard off the rim.',
    order: 2140,
    sourceKeys: GENERAL,
    explanation: `Slang for an ugly miss, from the idea of throwing a brick rather than shooting a ball. Distinct from an **airball**, which misses everything; a brick hits the rim or backboard hard.

Purely descriptive, with no statistical meaning.`,
    related: ['airball', 'field-goal-percentage'],
  }),

  definition({
    slug: 'clutch',
    title: 'Clutch',
    category: 'glossary',
    aliases: ['clutch', 'clutch time', 'clutch performer'],
    summary: 'Performing well in the closing minutes of a close game.',
    order: 2150,
    sourceKeys: STATS,
    explanation: `Used loosely for players who score at decisive moments, and precisely as a statistical category: the NBA defines **clutch time** as the last five minutes with the margin at five points or fewer.

Clutch statistics are tracked and published for those minutes specifically.`,
    whyItMatters: `The tracking allows a claim that used to be pure assertion to be examined, and the examination is inconvenient for the folklore.

Clutch samples are tiny, a few dozen possessions across a season, so year-to-year clutch performance is extremely noisy and largely fails to persist. Most analysts conclude that shot-making in the clutch is close to a player's ordinary ability plus a great deal of variance.

What does change late in games is the **defence**: fewer transition chances, more isolation, tighter officiating. Players who are good at creating shots in that environment genuinely look better.`,
    misunderstandings: `**"Some players are simply clutch."** The evidence for a persistent clutch skill separate from general ability is weak. Memorable shots are remembered; misses are forgotten.`,
    related: ['buzzer-beater', 'isolation', 'plus-minus'],
  }),

  definition({
    slug: 'dime',
    title: 'Dime',
    category: 'glossary',
    aliases: ['dime', 'dimes', 'dropping dimes'],
    summary: 'Slang for an assist, particularly a good one.',
    order: 2160,
    sourceKeys: GENERAL,
    explanation: `An assist. "Dropping dimes" means creating baskets for teammates repeatedly.

The origin is usually given as the dime needed for a payphone call, on the idea that a good pass is a well-placed call, though the etymology is not certain.`,
    related: ['assists', 'point-guard', 'ball-movement'],
  }),

  definition({
    slug: 'heat-check',
    title: 'Heat Check',
    category: 'glossary',
    aliases: ['heat check', 'heat-check', 'checking the heat'],
    summary:
      'A difficult shot taken after making several in a row, to test whether the streak continues.',
    order: 2170,
    sourceKeys: GENERAL,
    explanation: `A player who has made several shots in succession takes a harder one than they normally would, on the theory that they are "hot".

The underlying belief is the **hot hand**, the idea that a made shot raises the chance of making the next. Research on this has gone back and forth for decades: early studies found no effect, and later work using better controls found a small one. Nothing supports the size of the effect players and crowds behave as though exists.`,
    whyItMatters: `Whether or not the hot hand is real, the heat check is often a genuinely poor shot dressed in confidence, and it is one of the clearer cases where a player's self-assessment and the arithmetic disagree.`,
    related: ['clutch', 'three-point-percentage', 'splash'],
  }),

  definition({
    slug: 'mismatch',
    title: 'Mismatch',
    category: 'glossary',
    difficulty: 'intermediate',
    aliases: ['mismatch', 'mismatches', 'switch hunting'],
    summary: 'A defensive assignment where one player is badly suited to guarding another.',
    order: 2180,
    sourceKeys: GENERAL,
    explanation: `A pairing the defence would not have chosen: a small guard defending a large forward, or a slow centre defending a quick guard.

Mismatches are usually created by **switching**, which is why switch-heavy defences and mismatch-hunting offences developed together.`,
    whyItMatters: `A mismatch is the most reliable advantage in half-court basketball, because it does not depend on anyone beating anyone: the advantage already exists before the possession starts.

Offences hunt them deliberately, screening with a big man specifically to force a switch and then isolating the guard who ends up defending him. That practice, "switch hunting", is much of why defensive versatility became so valuable.`,
    related: ['switching', 'isolation', 'post-up', 'drop-vs-switch', 'foul-trouble'],
  }),

  definition({
    slug: 'poster',
    title: 'Poster',
    category: 'glossary',
    aliases: ['poster', 'posterized', 'posterised', 'poster dunk'],
    summary: 'A dunk performed directly over a defender.',
    order: 2190,
    sourceKeys: GENERAL,
    explanation: `To "posterize" someone is to dunk over them so emphatically that the image would make a poster. The defender is the one posterized.

Worth two points like any other dunk. The term is entirely cultural.`,
    whyItMatters: `It illustrates something real about basketball's culture: the sport keeps a vocabulary for humiliation that its statistics have no category for. A poster and a routine layup are identical in the box score and utterly different to everyone watching.`,
    related: ['dunk', 'alley-oop', 'rim-protection', 'ankle-breaker'],
  }),

  definition({
    slug: 'sixth-man',
    title: 'Sixth Man',
    category: 'glossary',
    aliases: ['sixth man', '6th man', 'sixth man of the year'],
    summary: 'The first player off the bench, often a team’s third or fourth best.',
    order: 2200,
    sourceKeys: GENERAL,
    explanation: `The leading substitute, brought on early and often playing more minutes than a starter.

Because basketball allows unlimited substitution and re-entry, a sixth man is not a lesser player in the way a substitute is in football. Many are among the best on their team.`,
    whyItMatters: `The role exists to solve a scheduling problem. A team wants a scorer on the floor at all times, including the stretches when its starters rest, and the sixth man provides that continuity.

The NBA awards a **Sixth Man of the Year** prize, which is unusual: few sports formally honour a substitute.`,
    related: ['substitutions', 'all-star-weekend'],
  }),

  definition({
    slug: 'splash',
    title: 'Splash',
    category: 'glossary',
    aliases: ['splash', 'splash brothers', 'wet', 'from downtown'],
    summary: 'A shot that goes cleanly through the net without touching the rim.',
    order: 2210,
    sourceKeys: GENERAL,
    explanation: `Onomatopoeic slang for a shot that drops straight through, from the sound of the net. Used most often for three-pointers.

Purely descriptive: a splash and a shot that rattles in are worth the same.`,
    related: ['three-pointer', 'heat-check', 'brick'],
  }),
];
