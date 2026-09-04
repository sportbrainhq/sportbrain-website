import type { SourceSeed } from './football-overview';
import type { ExplainerSeed } from './explainer-types';
import { standard, rulesetConcept } from './mma-explainer-helpers';

/**
 * MMA explainers: Fight Strategy, Style Matchups, Weight Classes, Weight
 * Cutting.
 *
 * Four of the brief's later categories, written in the same voice and to the
 * same section shapes as Phase 1 (`mma-explainers.ts`), using the `standard`
 * and `rulesetConcept` builders from `mma-explainer-helpers.ts`. No new
 * builder or section type was needed: strategy, matchup and weight-class
 * content all fit the existing `standard` shape, and the four ruleset-style
 * entries (catchweight, openweight, weigh-ins, missing weight,
 * same-day-vs-day-before weigh-ins, UFC weight classes) fit `rulesetConcept`.
 *
 * ## Cross-category slugs and duplication
 *
 * Several parallel categories (striking-concepts, scoring, championships,
 * weight-classes, weight-cutting, ufc) are being written by other agents in
 * this same phase and had not landed in `mma-explainer-taxonomy.ts` at the
 * time this file was written, so their slugs could not be verified against
 * the registry. Per the brief, this file uses distinct slugs everywhere a
 * collision was flagged as possible (`cage-cutting-strategy` rather than
 * `cutting-off-the-cage`, `southpaw-vs-orthodox` rather than
 * `orthodox-vs-southpaw`, etc.), and cross-references the likely sibling slug
 * through `related` rather than duplicating its content. If a referenced slug
 * turns out not to exist once every phase lands, the `related` entry is inert
 * (an unmatched slug does not break the seed) rather than a broken duplicate.
 *
 * `mma-weight-classes-explained` (category `start-here`, `alsoIn:
 * ['weight-classes']`) already exists as a Phase 1 entry and is not
 * recreated here; the weight-classes category below starts from "Why Weight
 * Classes Exist" instead, per the brief's own instruction.
 *
 * ## Weight-cutting: how the safety rule was applied
 *
 * Every weight-cutting entry describes what weight cutting is, why fighters
 * do it, and its risks and regulatory context at the level a sports article
 * would: no specific water-loading percentages, no sauna/hot-bath protocols,
 * no salt-loading specifics, no hour-by-hour rehydration schedule, and no
 * named real-world fatality or hospitalisation case. Where a mechanism is
 * relevant to the point being made (for example, that dehydration is
 * dangerous), it is named in general terms ("dehydration", "fluid
 * restriction", "various dehydration methods") without quantity, duration or
 * technique, so nothing here could function as a practical how-to guide.
 *
 * No specific real fighters, fights, incidents or statistics are named
 * anywhere in this file; every scenario uses generic "a fighter" framing.
 */

export const MMA_STRATEGY_WEIGHT_SOURCES: SourceSeed[] = [
  {
    key: 'wp-mma-weight-classes-swc',
    provider: 'wikipedia',
    title: 'Mixed martial arts weight classes',
    url: 'https://en.wikipedia.org/wiki/Mixed_martial_arts_weight_classes',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-weight-cutting',
    provider: 'wikipedia',
    title: 'Weight cutting',
    url: 'https://en.wikipedia.org/wiki/Weight_cutting',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-dehydration-swc',
    provider: 'wikipedia',
    title: 'Dehydration',
    url: 'https://en.wikipedia.org/wiki/Dehydration',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-catchweight',
    provider: 'wikipedia',
    title: 'Catchweight',
    url: 'https://en.wikipedia.org/wiki/Catchweight',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-mma-tactics',
    provider: 'wikipedia',
    title: 'Mixed martial arts',
    url: 'https://en.wikipedia.org/wiki/Mixed_martial_arts#Technique',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-southpaw-swc',
    provider: 'wikipedia',
    title: 'Southpaw stance',
    url: 'https://en.wikipedia.org/wiki/Southpaw_stance',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ufc-weight-classes',
    provider: 'wikipedia',
    title: 'Ultimate Fighting Championship weight classes',
    url: 'https://en.wikipedia.org/wiki/List_of_UFC_champions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-double-champion',
    provider: 'wikipedia',
    title: 'List of UFC champions',
    url: 'https://en.wikipedia.org/wiki/List_of_UFC_champions',
    license: 'CC BY-SA 4.0',
  },
];

// ─── Fight Strategy ─────────────────────────────────────────────────────────

const FIGHT_STRATEGY: ExplainerSeed[] = [
  standard({
    slug: 'mma-fight-strategy-explained',
    title: 'MMA Fight Strategy Explained',
    category: 'fight-strategy',
    aliases: ['mma fight strategy', 'mma tactics explained', 'how mma fighters plan a fight'],
    summary:
      'The layer of decisions above technique: what a fighter is trying to do, not just what they can do.',
    isFeatured: true,
    difficulty: 'intermediate',
    readMinutes: 4,
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Technique is what a fighter can do: throw a jab, finish a takedown, defend a choke. Strategy is what a fighter is trying to do with those tools across an entire fight: where they want it to take place, whose pace they want it fought at, and what they are willing to risk to get there. Two fighters with similar technical ability can produce very different fights depending on the strategy each brings into the cage.

A strategy is built before the fight, usually around the other fighter's known tendencies, and adjusted during it as the fight reveals things a fight camp could not have known for certain in advance.`,
    howItWorks: `A fight strategy usually answers a small number of questions: where does this fighter want the fight to happen (standing, in the clinch, or on the ground), what pace do they want to fight at, and what is the other fighter's most dangerous tool that has to be managed rather than traded with. Everything else, the specific combinations, the specific setups, sits underneath those decisions rather than replacing them.

A strategy is not fixed once the first bell rings. A gameplan built around out-striking an opponent can be abandoned midway through a fight if that opponent turns out to be landing harder or more often than expected, in favour of a more conservative, control-based approach for the rest of the fight.`,
    example: `A fighter with a wrestling background enters a fight against a dangerous striker with a strategy built entirely around closing distance and using the cage to land takedowns, accepting some risk while getting there in exchange for taking the fight to a phase where the wrestler's advantage is largest. A fighter with a strong striking background against a dangerous grappler might instead build a strategy around distance and footwork, avoiding the clinch and the cage entirely rather than trying to out-grapple a grappler.`,
    whyItMatters: `Reading a fight only for technique misses why a fighter does something that looks, in isolation, like the wrong choice. A fighter circling away from the centre of the cage for a full round is not necessarily struggling: they may be executing a strategy built specifically to deny their opponent the close-range exchanges that opponent wants.`,
    misunderstandings: `A common one: assuming the fighter doing more visible damage in the moment is automatically executing the better strategy. A strategy is judged by whether it wins the fight (or the rounds, under the scoring criteria) over its full duration, not by which exchange looked more exciting on a highlight reel.`,
    takeaways: `Strategy sits above technique: it decides where a fight is fought and at what pace, and a fighter's individual techniques are the tools used to execute it. The rest of this category breaks specific strategic ideas, distance, pace, phase-mixing, round management, out from this general shape.`,
    related: [
      'game-plan',
      'striker-vs-wrestler-matchup',
      'controlling-distance',
      'mixing-strikes-and-takedowns',
      'how-mma-works',
    ],
  }),

  standard({
    slug: 'game-plan',
    title: 'Game Plan',
    category: 'fight-strategy',
    aliases: ['mma game plan', 'fight game plan explained'],
    summary:
      "A fighter's prepared plan for a specific opponent, built in camp before the fight is fought.",
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A game plan is the specific strategy a fighter and their coaching team prepare for one particular opponent, built during training camp from film study, known tendencies and the matchup between the two fighters' skill sets. It is narrower than "strategy" in general: a fighter's overall strategic identity (pressure fighter, counterstriker, wrestler) tends to stay fairly stable across their career, while a game plan is rewritten for every opponent.`,
    howItWorks: `A coaching team studies an opponent's previous fights for patterns: what they do when hurt, what they do in the first minute of a round versus the last, which takedowns they defend well and which they do not. The game plan built from that study assigns the fighter specific things to look for and specific responses to prepare, on top of the fighter's own established game.

A game plan is a starting point, not a script. Fighters and corners routinely describe adjusting a game plan mid-fight once real information, rather than film study, is available about how the opponent is actually performing that night.`,
    example: `A fighter's coaching team notices, on film, that an upcoming opponent drops their guard slightly after throwing a jab. The game plan built around that detail specifically has the fighter waiting for that jab and countering into the opening it leaves, rather than initiating exchanges of their own.`,
    whyItMatters: `Understanding that fighters prepare an opponent-specific plan explains why the same fighter can look completely different in two different fights: not because their ability changed, but because the plan built for one opponent does not resemble the plan built for another.`,
    misunderstandings: `A common one: assuming a fighter abandoning their game plan mid-fight means the plan failed or the corner is panicking. Adjusting a game plan in real time, in response to what is actually happening, is a normal and often necessary part of executing it, not evidence it was wrong from the start.`,
    takeaways: `A game plan is the opponent-specific version of a fighter's broader strategy, built in camp and adjusted live. It is prepared, not fixed, and its quality is judged by the fight's outcome rather than by how closely the fighter stuck to the version written before the first bell.`,
    related: ['mma-fight-strategy-explained', 'fighting-while-ahead', 'fighting-while-behind'],
  }),

  standard({
    slug: 'striker-vs-wrestler-matchup',
    title: 'Striker vs Wrestler Matchup',
    category: 'fight-strategy',
    alsoIn: ['style-matchups'],
    aliases: [
      'striker versus wrestler',
      'how strikers beat wrestlers',
      'how wrestlers beat strikers',
    ],
    summary:
      'The general tug-of-war between a fighter who wants the fight standing and one who wants it on the ground.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `One of the sport's oldest strategic dynamics: a fighter with a striking background generally wants a fight to stay standing, at range, where their tools are strongest, while a fighter with a wrestling background generally wants to close that distance and take the fight to the ground, where theirs are. Neither preference is fixed by a fighter's background alone, but it shapes the shared assumption both sides usually fight from.`,
    howItWorks: `A striker trying to keep a fight standing manages distance and footwork to stay out of range of a takedown attempt, uses their jab and movement to discourage an opponent from closing in, and defends specific takedown entries (level changes, clinch entries) as they come. A wrestler trying to close that distance accepts some risk while working forward, often using the cage itself, feints, and repeated attempts rather than a single takedown try, since a fight only has to change phase once for the dynamic to shift.

Each side's approach to the other constantly adjusts. A striker landing clean, consistent shots may force the wrestler to close distance faster and more often than planned; a wrestler landing even one sustained takedown can change a striker's entire approach to distance for the remainder of the fight.`,
    example: `A fighter with a kickboxing background circles the outside of the cage, using low kicks and a long jab to control distance and discourage entries, while a fighter with a wrestling background repeatedly changes levels and drives forward, absorbing strikes on the way in, until a takedown against the cage finally lands in the second round.`,
    whyItMatters: `Recognising this dynamic explains a huge share of what actually happens in the sport's fights: a striker who never lands their best weapons may simply have spent the whole fight denying takedowns rather than losing a striking exchange, and a wrestler who looks outmatched standing may be trading damage deliberately in exchange for the opening that eventually lets them close the distance.`,
    misunderstandings: `A common one: assuming the fighter landing more strikes at range is "winning" the matchup outright. If the wrestler eventually gets the fight to the ground and controls it there, the earlier striking exchanges may matter far less to the outcome, or the scorecards, than they looked like mattering in the moment.`,
    takeaways: `This matchup is a contest over where the fight happens as much as over who is more skilled. Distance is the striker's tool and closing it is the wrestler's, and most of what looks like a stalemate in the striking is really that contest being fought.`,
    related: [
      'controlling-distance',
      'takedown-threat',
      'boxer-vs-wrestler',
      'kickboxer-vs-wrestler',
    ],
  }),

  standard({
    slug: 'pressure-vs-counterstriking',
    title: 'Pressure vs Counterstriking',
    category: 'fight-strategy',
    alsoIn: ['striking-concepts'],
    aliases: ['pressure fighting vs counter fighting', 'pressure fighter vs counter striker'],
    summary:
      'Two opposed striking approaches: forcing the pace forward, or letting the other fighter come and punishing their entries.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A pressure fighter's strategy is to constantly move forward, cutting off space and forcing the other fighter to either engage or keep retreating until they run out of room. A counterstriker's strategy is close to the opposite: give ground, let the other fighter close the distance and commit to an attack, and land on the openings that attack creates rather than initiating exchanges themselves.`,
    howItWorks: `A pressure fighter accepts absorbing some strikes on the way in as the cost of forcing the fight to happen on their terms, using the cage itself to limit how far the other fighter can retreat. A counterstriker relies on timing rather than volume: reading the pressure fighter's entries and landing a single well-timed shot as they arrive, rather than trading continuously.

Each strategy is strongest against a specific kind of opponent and can be a liability against the other. Pressure works well against a fighter who has nowhere left to retreat to; counterstriking works well against a fighter whose pressure is predictable enough to time.`,
    example: `A fighter known for constant forward pressure spends a round walking an opponent toward the cage, absorbing counters along the way, until the opponent runs out of space to retreat into and the pressure fighter lands a clean combination. A different counterstriking fighter, against the same style of pressure, instead circles off the cage rather than backing straight up, denying the pressure fighter the cornered opponent their approach depends on.`,
    whyItMatters: `Understanding this contrast explains why the same pressure-fighting approach succeeds against one opponent and fails badly against another: it depends heavily on whether the opponent retreats in a straight line (good for the pressure fighter) or circles and resets angles (good against them).`,
    misunderstandings: `A common one: assuming a fighter giving ground for a whole round is losing that round. A counterstriker deliberately conceding ground while landing the cleaner, more damaging strikes on entries is a legitimate and often successful strategy, not passive fighting.`,
    takeaways: `Pressure and counterstriking are opposite bets on the same question: whether it is better to force exchanges or to wait for them. Which one is working in a given fight is a question about entries and angles, not just about who is moving forward.`,
    related: [
      'mma-fight-strategy-explained',
      'controlling-distance',
      'pressure-fighter-vs-counterstriker',
      'cage-cutting-strategy',
    ],
  }),

  standard({
    slug: 'controlling-distance',
    title: 'Controlling Distance',
    category: 'fight-strategy',
    alsoIn: ['striking-concepts'],
    aliases: ['distance control mma', 'range control strategy'],
    summary:
      'The ongoing contest over how far apart two fighters stand, which shapes almost everything else in a fight.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Distance is the space between two fighters, and controlling it, deciding when it opens and when it closes, is one of the most fundamental strategic contests in a fight. A fighter who controls distance decides when strikes are in range, when a clinch or takedown attempt becomes available, and when neither fighter can effectively do anything to the other at all.`,
    howItWorks: `Distance is controlled with footwork, feints, and length: a fighter with a longer reach can often strike from a range the shorter fighter cannot answer from, while a shorter fighter typically wants to close that gap to a range where their own tools work better. Feints, in particular, are used to test and manipulate distance without committing to a real strike, forcing a reaction that reveals how the other fighter manages their own range.

Distance control is not only about striking range. The same contest applies to takedown range (close enough for a level change to land) and clinch range (close enough to tie up), and a fighter's overall strategy often comes down to which of these ranges they are trying to fight from.`,
    example: `A longer-limbed fighter uses a probing jab and lateral movement to stay at a range where only their strikes land, forcing a shorter opponent to walk through punches just to get close enough to threaten anything of their own. The shorter fighter responds by feinting a level change to draw a reaction, then slips just inside the jab's range in the opening that creates.`,
    whyItMatters: `A huge share of what separates a technically skilled fighter from an elite one is distance management rather than any single technique: the same jab, thrown from the range where it lands clean rather than the range where it falls just short, is a completely different weapon.`,
    misunderstandings: `A common one: treating distance as something only strikers care about. A wrestler closing distance to enter a takedown, and a fighter denying that entry by managing distance defensively, are both fighting the exact same contest, just with different goals for what happens once it closes.`,
    takeaways: `Distance is the space where most of a fight's strategic decisions actually get made. See "Distance Management" (striking concepts) for the mechanics of specific footwork and range tools; this entry covers distance as the strategic battleground those tools are fought over.`,
    related: [
      'distance-management',
      'striker-vs-wrestler-matchup',
      'cage-cutting-strategy',
      'switching-stances',
    ],
  }),

  standard({
    slug: 'fighting-southpaws',
    title: 'Fighting Southpaws',
    category: 'fight-strategy',
    aliases: ['how to fight a southpaw', 'orthodox vs southpaw strategy'],
    summary:
      'The specific strategic adjustments an orthodox fighter makes when facing a southpaw, and vice versa.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-southpaw-swc' }, { key: 'wp-mma-tactics' }],
    explanation: `An orthodox fighter leads with their left hand and left foot forward; a southpaw leads with their right. When the two face off, their lead feet and lead hands are on the same side rather than opposite sides, which changes the angles every strike and defensive movement travels along compared to a same-stance fight. Because most fighters train against orthodox opponents far more often than southpaws, facing a southpaw is a specific, less familiar strategic problem for the majority of the sport's competitors.`,
    howItWorks: `The most discussed adjustment is footwork: many coaches teach circling toward the southpaw's lead (rear) leg, which is generally understood to reduce exposure to the southpaw's rear hand, one of their most dangerous weapons, while opening angles for the orthodox fighter's own strikes. Lead hands also occupy the same space in an orthodox-vs-southpaw fight in a way they do not in a same-stance fight, which changes how jabs and lead hooks interact.

Because the adjustment is footwork-and-angle-based rather than about raw power or speed, a fighter's comfort against the opposite stance is often more about how much they have specifically trained against it than about their overall skill level.`,
    example: `An orthodox fighter facing a southpaw opponent deliberately steps toward the southpaw's lead leg rather than backing straight up when pressured, aiming to reduce the angle available to the southpaw's rear straight while opening a lane to counter with their own lead hook.`,
    whyItMatters: `A fighter who is dominant against orthodox opponents can look uncharacteristically uncomfortable against a southpaw purely because of unfamiliarity with the angles involved, not because the southpaw is a superior fighter overall.`,
    misunderstandings: `A common one: assuming "southpaws are just awkward" fully explains the dynamic without further detail. The specific mechanism, shared lead-side positioning changing which strikes and angles are available to each fighter, is what actually causes the difficulty, and it is a learnable adjustment rather than an unavoidable disadvantage.`,
    takeaways: `Facing the opposite stance is a distinct tactical problem from facing the same one, driven by which side each fighter's lead hand and leg share space on. See "Southpaw vs Orthodox" (style matchups) for how this plays out as a whole-fight dynamic rather than a single tactical adjustment.`,
    related: ['switching-stances', 'southpaw-vs-orthodox', 'controlling-distance'],
  }),

  standard({
    slug: 'switching-stances',
    title: 'Switching Stances',
    category: 'fight-strategy',
    alsoIn: ['striking-concepts'],
    aliases: ['switching stance strategy', 'why fighters switch stance mid-fight'],
    summary:
      'The tactical decision to change stance mid-fight, and what a fighter is usually trying to achieve by it.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Some fighters are comfortable switching between orthodox and southpaw stances within a single fight, rather than fighting the whole bout from one. Doing so is a tactical choice rather than a fixed habit: a fighter switches stance to change the angles and openings available to them, or to disrupt an opponent who has settled into a rhythm reading their current stance.`,
    howItWorks: `Switching stance changes which hand and leg lead, which changes which strikes are naturally available at range and which side an opponent's counters are likely to come from. A fighter might switch specifically to open their rear leg kick to a new angle, to change which hand is closest to an opponent who has been reading their jab well, or simply to force an opponent who was comfortable in an orthodox-vs-orthodox exchange to solve an orthodox-vs-southpaw problem instead, at least for a few exchanges.

Switching carries real risk: a fighter is often less comfortable, and less well-drilled, in their non-dominant stance, so a switch made purely to be unpredictable rather than for a specific tactical reason can hand an opponent an opening rather than close one.`,
    example: `A fighter finds their jab is being read and countered consistently through the first round. Midway through the second, they briefly switch to southpaw, which puts their other hand forward and changes the angle their strikes are arriving from just enough to catch their opponent still calibrated for the original stance.`,
    whyItMatters: `Recognising a stance switch as a deliberate tactical decision, not a mistake or a quirk, explains moments in a fight that otherwise look confusing: a fighter's whole rhythm and the openings available to their opponent can change in a single step.`,
    misunderstandings: `A common one: confusing a fighter's genuine ambidexterity (equally comfortable and skilled in either stance) with a fighter making a tactical, situational switch from a clearly dominant stance. The mechanical difference between the stances is covered separately as "Switch Stance"; this entry is about the in-fight decision to use it.`,
    takeaways: `A stance switch is a tool for changing angles or breaking an opponent's rhythm, used deliberately and situationally by fighters comfortable enough in both stances to risk it mid-fight.`,
    related: ['switch-stance', 'fighting-southpaws', 'leg-kick-strategy'],
  }),

  standard({
    slug: 'attacking-the-body',
    title: 'Attacking the Body',
    category: 'fight-strategy',
    aliases: ['body shots mma strategy', 'why fighters target the body'],
    summary:
      'Targeting the torso rather than the head, for effects that build up over a fight rather than landing all at once.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Strikes to the body, punches to the ribs and midsection, kicks to the liver and solar plexus, are a distinct strategic target from the head. Where a clean head strike can end a fight in an instant, body strikes are more often a cumulative investment: their effect builds over a fight as they slow an opponent's movement, sap their conditioning and, in the specific case of a clean liver shot, can end a fight on their own.`,
    howItWorks: `Body strikes are generally considered lower-risk to land than head strikes, since a body's centre mass is a larger target and typically less well-guarded than a trained fighter's head, but they usually take longer to have a visible effect. A fighter investing in the body early in a fight is often making a bet that the effect compounds: a fighter breathing harder and moving less freely in round three because of body work absorbed in round one.

A liver shot is the exception to the "slow-building" rule: a clean strike to the liver, unlike most other body strikes, can incapacitate a fighter immediately and is one of the sport's recognised one-shot finishing locations even though it is a body strike rather than a head strike.`,
    example: `A fighter spends the first two rounds of a five-round fight consistently working an opponent's body with punches and kicks while trading relatively evenly at the head. By round four, the opponent's work rate and movement have visibly declined, and strikes that would not have troubled them in round one begin landing clean as their guard and footwork tire.`,
    whyItMatters: `A round that looks close or even on volume can be shaped by body work that only pays off later in the fight, which is part of why judges and analysts are specifically instructed to weigh effective striking across a whole fight rather than only the most recent exchanges.`,
    misunderstandings: `A common one: treating body shots as a lesser or secondary target compared to head strikes because they rarely produce an instant, visible knockdown. Body work is a deliberate, often central strategic investment with its own path to a finish, not a fallback when head strikes are not landing.`,
    takeaways: `The body is a target with a different payoff schedule than the head: usually cumulative, occasionally as fight-ending as any head strike. A fighter's decision to invest in it early is a bet on how the fight will look in its later rounds.`,
    related: ['leg-kick-strategy', 'mixing-strikes-and-takedowns', 'winning-rounds'],
  }),

  standard({
    slug: 'leg-kick-strategy',
    title: 'Leg-Kick Strategy',
    category: 'fight-strategy',
    aliases: ['leg kicks mma strategy', 'why fighters kick the legs'],
    summary:
      'Kicks to the thigh as a slow-building strategic investment that limits movement rather than a single fight-ending blow.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Leg kicks, most often thrown to the outside or inside of the lead thigh, are a strategic tool built around accumulation rather than a single decisive strike. A single leg kick rarely changes a fight; a consistent diet of them across multiple rounds can significantly affect an opponent's mobility, stance and even their ability to check future kicks.`,
    howItWorks: `Repeated leg kicks to the same target build damage that compounds: a thigh absorbing kicks becomes more painful to plant weight on, which affects the fighter's footwork, their power on strikes that rely on driving off that leg, and their ability to check (block with the shin) further kicks as fatigue and pain set in. A fighter committing to a leg-kick strategy is often willing to trade a slower path to a finish, or no finish at all, for a decisive advantage in mobility and output by the later rounds.

Leg kicks also serve a distance-management purpose beyond the damage itself: they are typically thrown from slightly outside an opponent's own striking range, letting a fighter do damage and accumulate a scoring case while limiting how much they expose themselves to counters.`,
    example: `A fighter throws low kicks to the same leg repeatedly across the first two rounds of a three-round fight. By round three, their opponent's lead leg has visibly stiffened, their movement has slowed, and a kick that would have been checked cleanly in round one lands unchecked, buckling the leg and effectively ending their ability to continue competitively even though the fight is not stopped immediately.`,
    whyItMatters: `A fighter can lose the majority of a fight's individual striking exchanges while still winning decisively on the back of leg-kick damage that never shows up as a single dramatic moment, which is part of why judges are asked to weigh a fight's cumulative effective striking rather than only its most eye-catching exchanges.`,
    misunderstandings: `A common one: dismissing leg kicks as a low-value or low-effort tactic compared to head or body strikes. A well-executed leg-kick strategy is one of the sport's most reliable ways to change a fight's later rounds, and has ended fights outright when accumulated damage prevents a fighter from continuing.`,
    takeaways: `Leg kicks are a compounding-interest strategy: individually minor, cumulatively capable of deciding a fight by changing what an opponent's legs can still do in the championship rounds. See the "Leg Kick" technique entry for the mechanics of the strike itself.`,
    related: ['leg-kick', 'attacking-the-body', 'winning-rounds'],
  }),

  standard({
    slug: 'takedown-threat',
    title: 'Takedown Threat',
    category: 'fight-strategy',
    aliases: ['threatening a takedown', 'takedown threat opens striking'],
    summary:
      'The value of a credible takedown a fighter never actually attempts, used to change how an opponent defends.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A takedown threat is the strategic value a fighter with credible wrestling ability carries even when they never attempt a takedown in a given exchange, or even a given fight. An opponent aware of that threat has to divide their attention and defensive preparation between striking defence and takedown defence, which can open opportunities in the striking that would not exist against a pure striker with no takedown game at all.`,
    howItWorks: `A fighter who has demonstrated a real takedown threat, earlier in the same fight, or across their career, forces an opponent to respect level changes and clinch entries even when a given movement is a feint rather than a genuine attempt. That divided attention can slow an opponent's striking reactions or make them more conservative than they would otherwise be, which the takedown-threatening fighter can then exploit purely in the striking exchanges.

The relationship runs in both directions: a fighter with dangerous striking can similarly use that threat to make an opponent hesitant to commit fully to a takedown attempt, since a poorly timed shot can be met with a strike on the way in.`,
    example: `A fighter with a strong wrestling background lands two takedowns early in a fight. For the remainder of the bout, their opponent visibly hesitates and squares up defensively at the slightest level change, even on exchanges where no takedown was actually intended, and the wrestling-background fighter uses that hesitation to land clean strikes that would not have connected against a fighter reacting purely to the strikes themselves.`,
    whyItMatters: `A fighter's wrestling statistics for a given fight (attempts and successful takedowns) can understate their actual tactical impact, since a credible threat that is never converted into an attempt still shapes the entire fight.`,
    misunderstandings: `A common one: judging a fighter's grappling threat purely by their takedown count on the stat sheet. A fighter who attempts zero takedowns but visibly changes an opponent's striking defence throughout the fight is still exercising real strategic leverage from that threat.`,
    takeaways: `A credible takedown threat is a strategic asset independent of whether it is ever used, forcing an opponent to defend against a possibility rather than only against what is actually thrown.`,
    related: ['mixing-strikes-and-takedowns', 'feinting-takedowns', 'striker-vs-wrestler-matchup'],
  }),

  standard({
    slug: 'mixing-strikes-and-takedowns',
    title: 'Mixing Strikes and Takedowns',
    category: 'fight-strategy',
    aliases: ['combining striking and wrestling', 'strikes into takedowns mma'],
    summary: 'Chaining striking and grappling together so each makes the other harder to defend.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Mixing strikes and takedowns means using each to set up the other, rather than treating striking and wrestling as two separate modes a fighter switches between. A combination that ends in a level change, or a takedown attempt that flows directly into strikes when it fails, is harder for an opponent to defend cleanly than either tool used in isolation, because defending one can create the opening the other needs.`,
    howItWorks: `A fighter might throw a striking combination specifically to draw a defensive reaction, a raised guard, a backward step, that makes a takedown attempt immediately afterward easier to complete, since the opponent's weight and attention are already committed to defending the strikes. The reverse also works: a stuffed takedown attempt often leaves both fighters at close range, which a fighter comfortable mixing disciplines can convert directly into a clinch strike or a knee, rather than resetting to distance.

This approach is one of the things that separates a fighter described as having "well-rounded" or "seamless" offence from one who is simply skilled at two separate disciplines: the mixing itself, not just the individual tools, is the skill.`,
    example: `A fighter throws a jab-cross combination, and as the opponent raises their guard and leans back to avoid the second punch, immediately changes levels and drives through a double-leg takedown while the opponent's weight is still shifted rearward from defending the strikes.`,
    whyItMatters: `A fighter defending strikes and takedowns as if they were unrelated threats will consistently be a step behind an opponent who chains them together, since the defence for one can be the opening for the other.`,
    misunderstandings: `A common one: treating a fighter who both strikes and grapples well as automatically dangerous at mixing the two. Genuinely chaining disciplines together, so one sets up the other in real time, is a distinct skill from simply being competent in both areas separately.`,
    takeaways: `The most dangerous MMA offence is often not the best striker or the best wrestler alone, but the fighter whose striking and grappling are used to open each other up.`,
    related: ['takedown-threat', 'feinting-takedowns', 'setting-up-submissions'],
  }),

  standard({
    slug: 'feinting-takedowns',
    title: 'Feinting Takedowns',
    category: 'fight-strategy',
    aliases: ['level change feint', 'fake takedown mma'],
    summary:
      'A false level change or shot, used to draw a defensive reaction without committing to a real takedown attempt.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A feinted takedown is a movement that looks like the start of a real takedown attempt, a level change, a step forward, a hand reaching for the legs, without the fighter actually committing to completing it. Like a striking feint, its purpose is to draw a reaction (a sprawl, a backward step, a dropped guard) that the fighter can then exploit with a different attack entirely, most often a strike thrown while the opponent is reacting to the wrong threat.`,
    howItWorks: `A convincing takedown feint has to look enough like a real attempt that the opponent's takedown defence actually engages, which usually means committing at least a real level change or forward step rather than a token gesture. Once the opponent sprawls or squares up to defend the takedown, their guard and balance are often compromised in ways that leave a striking opening the feinting fighter has already planned to use.

Feinting takedowns is closely related to the general concept of the takedown threat: a fighter with a genuinely dangerous wrestling game can feint more effectively, since their opponent cannot afford to ignore even a feint from a fighter who has already shown they can finish real attempts.`,
    example: `A fighter drops their level and steps forward as if beginning a double-leg attempt. As their opponent sprawls and drops their hands to defend the anticipated takedown, the fighter instead throws an uppercut into the now-lowered guard, having never intended to actually complete the takedown.`,
    whyItMatters: `A feint's value depends entirely on the threat behind it being credible. Recognising when a fighter is feinting rather than genuinely attempting a takedown, and why the opponent reacted anyway, explains striking openings that otherwise look like they came from nowhere.`,
    misunderstandings: `A common one: assuming every level change that does not end in a completed takedown was a failed attempt. Many are feints by design, and treating every one as a failure misreads a fighter's actual strategy.`,
    takeaways: `A takedown feint borrows the same logic as a striking feint, manufacturing a reaction to exploit, but relies specifically on a credible grappling threat to work.`,
    related: ['takedown-threat', 'mixing-strikes-and-takedowns'],
  }),

  standard({
    slug: 'setting-up-submissions',
    title: 'Setting Up Submissions',
    category: 'fight-strategy',
    aliases: ['submission setups mma', 'how fighters set up submissions'],
    summary:
      'Using position, strikes and an opponent’s own defensive reactions to create a submission opportunity rather than hunting for one directly.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A submission is rarely attempted cold. Most successful submissions are set up: a fighter uses position, strikes on the ground, or an opponent's own defensive movement to create the specific opening a given submission needs, rather than reaching for it the instant a position is established.`,
    howItWorks: `A common setup pattern is to threaten one submission specifically to create the opening for another: an opponent defending an armbar attempt by rolling or posturing a particular way can expose their neck or their back in the process, and a fighter comfortable chaining attempts moves to the second submission the defence created rather than persisting with the first. Strikes from a dominant position serve a similar purpose defensively: an opponent forced to choose between defending strikes and defending a limb often cannot fully do both, and the fighter on top can use that divided attention to advance a submission attempt.

Setting up a submission is therefore as much about reading an opponent's defensive reaction as it is about executing the submission's own mechanics.`,
    example: `A fighter attacking an armbar from mount finds the opponent defending by turning away and stacking their weight forward, a common defensive response. Rather than forcing the armbar through that defence, the fighter follows the opponent's turned back to take the back instead, converting the failed armbar attempt directly into a rear-naked choke opportunity the defence itself created.`,
    whyItMatters: `A fighter who understands submission setups can be dangerous even from positions that look defensively sound for their opponent, since the danger often comes from how the opponent defends rather than from the initial position alone.`,
    misunderstandings: `A common one: assuming a defended submission attempt was simply unsuccessful. Many are deliberately used to create the next opportunity, and a fighter chaining attacks this way can look, to an untrained eye, like they are randomly trying different submissions rather than executing a planned sequence.`,
    takeaways: `Submissions are frequently won by the chain of attempts and the opponent's reactions along the way, not by the first attempt alone. Reading a submission sequence means watching what the defence gives up, not just what attack is being applied.`,
    related: ['mixing-strikes-and-takedowns', 'takedown-threat'],
  }),

  standard({
    slug: 'cage-cutting-strategy',
    title: 'Cage Cutting',
    category: 'fight-strategy',
    alsoIn: ['striking-concepts'],
    aliases: ['cutting off the cage strategy', 'cage cutting mma'],
    summary:
      'Using angles and footwork to close off an opponent’s escape routes rather than chasing them in a straight line.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Cage cutting is the footwork strategy of closing off an opponent's paths to escape toward open space, rather than simply walking straight at them. A fighter who only advances in a straight line is easy to circle away from indefinitely in a large enough cage; a fighter who cuts angles instead reduces the space their opponent has left to retreat into over time, eventually pinning them against the cage itself.`,
    howItWorks: `Rather than chasing an opponent directly, a fighter using this strategy angles their steps to intercept the direction the opponent is most likely to circle toward, based on which way they have been moving and which side is closer to the cage. Done well, this steadily reduces the usable space in the cage until the retreating fighter has nowhere left to circle to without walking directly into range.

This is a patience-dependent strategy: cutting off the cage effectively over a full round, rather than lunging forward and getting countered, is generally considered a more advanced skill than simple forward pressure.`,
    example: `A fighter being circled consistently toward the same side adjusts their footwork to step toward that side first, on the next exchange, rather than following straight ahead. Over several exchanges, this steadily reduces the room their opponent has to circle into, eventually trapping them along the cage where the pressure fighter's own combinations become far more likely to land clean.`,
    whyItMatters: `A fighter who understands cage cutting can look, over a whole round, like they have "solved" an opponent's movement, even without any single dramatic exchange, purely by removing the space that movement depended on.`,
    misunderstandings: `A common one: treating "cutting off the cage" and "pressuring forward" as the same thing. Pure forward pressure without angles is exactly what a good circling opponent can exploit indefinitely; cutting the cage specifically targets the space the opponent is circling into.`,
    takeaways: `Controlling the cage's geometry, not just closing distance, is what actually traps a fighter who wants to circle away. See "Cutting Off the Cage" (striking concepts) for the underlying footwork mechanics.`,
    related: ['cutting-off-the-cage', 'controlling-distance', 'pressure-vs-counterstriking'],
  }),

  standard({
    slug: 'winning-rounds',
    title: 'Winning Rounds',
    category: 'fight-strategy',
    alsoIn: ['scoring'],
    aliases: ['how to win a round mma', 'round-by-round strategy'],
    summary:
      'Fighting to the specific criteria a round is judged by, rather than simply trying to look impressive within it.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Winning a round strategically means doing the specific things the scoring criteria (effective striking and grappling, aggression, control of the fighting area, in that order of emphasis under the Unified Rules) actually reward, rather than simply trying to look the more dominant or exciting fighter for five minutes. A fighter who understands scoring may deliberately spend the closing seconds of a close round taking a visible, low-risk action specifically because judges are watching for exactly that kind of moment.`,
    howItWorks: `Because rounds are scored individually rather than accumulated across the whole fight, a fighter behind on a previous round gets a clean slate each time the next one starts, and strategy has to be built around winning the round actually in progress rather than the fight as one continuous unit. This can lead to visibly different tactics between rounds even from the same fighter: cautious in a round they believe they are winning, more aggressive in one they believe is close or lost.

A fighter and their corner often have a real-time sense, from the crowd, from their own read of the action, and from experience, of how a round is likely being scored, and adjust the fighter's approach between rounds accordingly.`,
    example: `A fighter believes they have controlled the majority of a round but has not landed a clean finishing sequence. In the final thirty seconds, rather than playing it safe, they push forward for a visible flurry of clean strikes, a common tactic specifically because judges are known to weigh a strong close to a round.`,
    whyItMatters: `Fighting to the scoring criteria, rather than to some more general sense of "winning the fight," explains tactical decisions, a fighter suddenly pushing pace late in a round, or accepting a takedown they could have defended to avoid unnecessary risk, that only make sense once the round-by-round scoring system is understood.`,
    misunderstandings: `A common one: assuming a fighter who is "winning the fight" overall is automatically ahead on the scorecards. Rounds are scored individually, and a fighter can dominate the first two rounds of a three-round fight yet still lose a decision if they are clearly outworked in the third, since all three rounds carry equal weight.`,
    takeaways: `Because scoring happens round by round, strategy has to as well. A fighter's approach shifting between rounds is often a direct response to how they believe the previous round was scored.`,
    related: ['fighting-while-ahead', 'fighting-while-behind', 'how-mma-scoring-works'],
  }),

  standard({
    slug: 'fighting-while-ahead',
    title: 'Fighting While Ahead',
    category: 'fight-strategy',
    aliases: ['protecting a lead mma', 'fighting from ahead'],
    summary:
      'Adjusting a fighter’s approach to protect a scorecard lead, and the risk of being too conservative about it.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A fighter who believes they have won the earlier rounds of a fight faces a strategic choice in the rounds that remain: keep fighting the way that built the lead, or shift to a more conservative approach built around minimizing risk and protecting the scorecards already in hand. Both are legitimate strategies, and which is correct depends heavily on how safely the lead can actually be protected.`,
    howItWorks: `A fighter comfortable ahead may choose to limit risk in a final round, controlling position, avoiding unnecessary exchanges and running the clock down on positions they already hold, since a draw on that round's own scorecard may be enough to preserve an overall decision win. This is a sound strategy specifically because rounds are scored individually: a fighter does not need to win every remaining round, only avoid losing the fight overall.

The risk is overcorrecting into pure avoidance. A fighter who becomes so passive that they clearly lose a final round can hand the judges a genuinely close overall decision, or, under a sufficiently one-sided final round, even open the door to losing rounds they did not need to lose at all.`,
    example: `A fighter who has controlled the first two rounds of a three-round fight spends much of the third continuing to press forward rather than retreating passively, landing enough to keep the round competitive, rather than simply running and conceding it outright, which could put an otherwise secure decision at unnecessary risk.`,
    whyItMatters: `Recognising a fighter is protecting a lead, rather than being outfought, changes how a viewer should read an apparently one-sided final round. It also explains why commentators frequently urge a fighter "not to just survive" even while ahead: a fully passive round can needlessly complicate a decision that should already be secure.`,
    misunderstandings: `A common one: assuming a fighter fighting more cautiously while ahead is scared or losing confidence. A controlled, risk-managed approach to protecting a real lead is a legitimate and common strategy, though it carries its own risk if taken too far.`,
    takeaways: `Fighting from ahead is a genuine strategic mode with its own logic, built around the fact that rounds are scored individually, but it has a failure point where caution itself starts to cost rounds.`,
    related: ['winning-rounds', 'fighting-while-behind', 'five-round-fight-strategy'],
  }),

  standard({
    slug: 'fighting-while-behind',
    title: 'Fighting While Behind',
    category: 'fight-strategy',
    aliases: ['fighting from behind mma', 'needing a finish'],
    summary:
      'The strategic shift a fighter makes when they believe they are behind on the scorecards, and the risks that shift carries.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A fighter who believes they are behind on the scorecards late in a fight faces pressure to change their approach: continuing the same strategy that put them behind is unlikely to change the outcome, so many fighters in this position take on more risk, pushing for a finish or a clearly dominant final round rather than playing it safe.`,
    howItWorks: `Needing to win a final round decisively, or needing a finish outright if a decision looks unwinnable, changes a fighter's calculus around risk. Exchanges that would be unnecessary risk for a fighter comfortably ahead become reasonable, even correct, for a fighter who needs a dramatic final impression on at least one judge, or an outright stoppage that bypasses the scorecards entirely.

This shift is a genuine strategic tool, not just desperation: a fighter's corner will frequently and explicitly tell them between rounds that they need a finish or a clearly dominant round, information the fighter uses to calibrate exactly how much risk is now worth taking.`,
    example: `A fighter believes, correctly, that they lost the first two rounds of a three-round fight clearly. Their corner tells them plainly that they need a finish. In the third round, they abandon their earlier, more conservative gameplan and press forward with far greater urgency, accepting exchanges they would have avoided in a fight they believed was close or ahead.`,
    whyItMatters: `A visibly desperate-looking final round from a fighter is often not panic but a rational, deliberate strategic shift, made with full knowledge of the fight's likely scorecards and the corner's own read of them.`,
    misunderstandings: `A common one: reading a fighter's increased aggression late in a fight as a sign they are simply "gassed and swinging." It is frequently a calculated response to a fighter and corner's own read of the scorecards, made with real strategic intent rather than as a loss of composure.`,
    takeaways: `Believing you are behind changes what risk is worth taking, and a fighter's corner plays a direct role in communicating that belief between rounds.`,
    related: ['fighting-while-ahead', 'winning-rounds', 'five-round-fight-strategy'],
  }),

  standard({
    slug: 'five-round-fight-strategy',
    title: 'Five-Round Fight Strategy',
    category: 'fight-strategy',
    aliases: ['championship rounds strategy', 'five round mma fight pacing'],
    summary:
      'How pacing and risk-taking change across a 25-minute championship fight compared to a standard three-round bout.',
    difficulty: 'advanced',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Championship fights and main events are typically scheduled for five five-minute rounds rather than the standard three, adding ten extra minutes, and two additional rounds, to a fight's total length. That extra length changes fight strategy meaningfully: a pace or a risk that is sustainable across three rounds is not automatically sustainable across five, and a strategy built around slowly compounding advantage (leg kicks, body work, positional control) has considerably more time to pay off.`,
    howItWorks: `Fighters preparing for a five-round fight typically train their conditioning specifically for that duration, since a pace that would be reasonable across fifteen minutes can leave a fighter badly fatigued with ten minutes still to fight. This changes early-round strategy too: a fighter confident in their five-round conditioning may deliberately accept a slower, more measured start, betting that a fresher championship-rounds performance will outweigh a faster opponent's early pace once fatigue becomes a factor.

The extra two rounds also change how cumulative strategies play out. A leg-kick or body-work strategy that would only be starting to show its full effect by the end of a three-round fight has two more rounds to compound in a five-round fight, which is part of why such strategies are sometimes described as particularly suited to championship-length bouts.`,
    example: `A fighter known for a slow, methodical style that builds significant leg and body damage over a fight enters a five-round title bout against a faster, more explosive opponent. Rather than trying to match the early pace, the methodical fighter accepts a competitive but unspectacular first two rounds, banking on their cumulative work paying off once fatigue sets into their opponent across the final two rounds a three-round fight would never have reached.`,
    whyItMatters: `Judging a five-round fight by the standards of a three-round one can badly misread it: a fighter deliberately pacing themselves for a 25-minute fight can look passive or behind early on while executing exactly the plan their preparation was built around.`,
    misunderstandings: `A common one: assuming a five-round fight is simply "a three-round fight with two extra rounds tacked on" strategically. The extra length changes pacing, conditioning demands and which cumulative strategies are viable enough that fighters and camps train differently for it specifically.`,
    takeaways: `Five-round fights reward conditioning and patience in a way three-round fights often cannot, and reading one correctly means judging pace against a 25-minute fight, not a 15-minute one.`,
    related: ['fighting-while-ahead', 'fighting-while-behind', 'leg-kick-strategy'],
  }),
];

// ─── Style Matchups ─────────────────────────────────────────────────────────

const STYLE_MATCHUPS: ExplainerSeed[] = [
  standard({
    slug: 'styles-make-fights-explained',
    title: 'Styles Make Fights Explained',
    category: 'style-matchups',
    aliases: ['styles make fights', 'why styles make fights mma'],
    summary:
      'The sport’s foundational idea that the outcome of a fight depends heavily on which two styles are matched against each other.',
    isFeatured: true,
    difficulty: 'beginner',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `"Styles make fights" is one of combat sports' oldest and most repeated sayings, and it describes a real, well-observed pattern: a fighter's record and general skill level only partly predict how a specific fight will go, because how well two particular styles interact matters enormously. A dangerous striker with poor takedown defence can struggle badly against a mediocre striker with a strong wrestling background, in a way their records alone would not predict.`,
    howItWorks: `Every fighter has strengths and weaknesses across striking, wrestling, clinch work and ground grappling, and few fighters are equally elite in all of them. A matchup is "good" for a fighter when their strengths line up against an opponent's specific weaknesses, and "bad" when the reverse is true, regardless of how either fighter has performed against the field generally.

This is why matchmaking, and pre-fight analysis, focuses heavily on stylistic questions (can this striker stop the takedown? can this wrestler defend on the feet long enough to close distance?) rather than simply comparing overall records or rankings.`,
    example: `A highly ranked striker with excellent knockout power but historically shaky takedown defence is matched against a lower-ranked opponent whose only real strength is wrestling. Despite the gap in overall standing, the matchup is considered genuinely competitive, or even favours the lower-ranked fighter, because their one strength lines up directly against the striker's one significant weakness.`,
    whyItMatters: `Understanding that styles, not just rankings or records, drive outcomes is the single most useful lens for reading upsets in the sport: a result that looks shocking on paper is frequently explained entirely by which style had the tactical edge in that specific pairing.`,
    misunderstandings: `A common one: treating a fighter's overall skill level or ranking as the primary predictor of any individual fight's outcome. The specific stylistic matchup is frequently a stronger predictor than the general gap in ability between two fighters, which is exactly why "styles make fights" has stayed one of the sport's defining sayings.`,
    takeaways: `A fight is a matchup between two specific skill sets, not just two overall skill levels. The entries in this category work through the sport's most common recurring stylistic pairings in detail.`,
    related: [
      'boxer-vs-wrestler',
      'grappler-vs-striker',
      'why-mma-math-doesnt-work',
      'mma-fight-strategy-explained',
    ],
  }),

  standard({
    slug: 'boxer-vs-wrestler',
    title: 'Boxer vs Wrestler',
    category: 'style-matchups',
    aliases: ['boxer versus wrestler mma', 'boxing vs wrestling matchup'],
    summary:
      'A classic stylistic pairing: a fighter with pure hands-based striking against one built around takedowns and control.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A boxer-styled fighter in MMA relies primarily on hand strikes, head movement and footwork, generally without a kicking game or a significant grappling threat of their own. A wrestler-styled fighter relies primarily on takedowns and top-position control. The matchup between them is one of the sport's clearest style contrasts: the wrestler's central question is whether they can get the fight to the ground at all against a skilled boxer's distance management, and the boxer's central question is whether they can keep a dangerous wrestler at range for an entire fight.`,
    howItWorks: `A boxer-styled fighter's main defensive task in this matchup is takedown defence: sprawling on shot attempts, maintaining distance so the wrestler cannot easily close, and using their hands to discourage the wrestler from committing to entries. A wrestler-styled fighter's main task is surviving the boxer's hands long enough to close the distance, often absorbing punishment in the process, and using the cage and repeated attempts rather than a single clean shot.

The lack of a kicking game or grappling threat from the boxer-styled fighter, and the lack of significant striking danger from the wrestler-styled fighter, tend to make this matchup unusually one-dimensional on each side, which is part of why it is often used as the clearest illustration of "styles make fights" in the sport.`,
    example: `A fighter with a pure boxing background lands cleanly for most of a round, keeping a wrestler-background opponent at the end of their punches. Midway through the round, the wrestler finally closes distance behind a level change and completes a takedown against the cage, and from there controls the boxer on the ground for the remainder of the round despite having been out-struck for most of it.`,
    whyItMatters: `This matchup is frequently cited as the clearest test of takedown defence in the sport: a boxer who cannot stop takedowns is often neutralised entirely, regardless of how dangerous their hands are, because the wrestler need only succeed once to change where the fight is fought.`,
    misunderstandings: `A common one: assuming the better pure boxer automatically wins this matchup because striking is seen as more "finishing." If the wrestler can consistently get the fight to the ground, the boxer's hands may barely factor into the result at all.`,
    takeaways: `This matchup usually comes down to one question each way: can the wrestler close the distance, and can the boxer stop them if they try. Everything else tends to be secondary.`,
    related: [
      'striker-vs-wrestler-matchup',
      'kickboxer-vs-wrestler',
      'wrestler-vs-submission-grappler',
    ],
  }),

  standard({
    slug: 'kickboxer-vs-wrestler',
    title: 'Kickboxer vs Wrestler',
    category: 'style-matchups',
    aliases: ['kickboxer versus wrestler', 'kickboxing vs wrestling mma matchup'],
    summary:
      'A wider striking arsenal against a wrestler’s takedown game, with leg kicks and level changes as the matchup’s central tools.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A kickboxer-styled fighter brings a wider striking arsenal than a pure boxer, adding kicks, knees and typically clinch striking, which changes the boxer-vs-wrestler dynamic in a specific way: kicks, particularly to the legs and body, can themselves be used to discourage or punish a wrestler's level changes and forward entries, giving the kickboxer additional tools for the exact problem a pure boxer faces in this matchup.`,
    howItWorks: `A kickboxer can use leg kicks to damage a wrestler's base and mobility over a fight, which, over time, can make the wrestler's takedown entries less explosive and less reliable, compounding the kickboxer's distance-management advantage. A low kick thrown as a wrestler changes levels can also catch them mid-entry, when their weight is already compromised, in a way a pure boxer's hands cannot replicate.

A wrestler in this matchup often has to be more cautious about telegraphing level changes than against a pure boxer, since a wider striking arsenal punishes predictable entries from more angles.`,
    example: `A kickboxer-styled fighter uses low kicks throughout the first round specifically to punish a wrestler's repeated level-change attempts, landing several clean kicks as the wrestler drops levels to shoot. By the second round, the wrestler's entries have become visibly more hesitant, giving the kickboxer more time to sprawl or counter on any attempt that does come.`,
    whyItMatters: `This matchup illustrates why a broader striking arsenal is often specifically valuable against wrestlers, not just generally useful: kicks give a striker tools that directly punish the mechanics of a takedown entry in a way punches alone do not.`,
    misunderstandings: `A common one: assuming this matchup simply favours kickboxers over pure boxers by the same margin regardless of opponent. The advantage is specifically pronounced against wrestlers, because of how leg kicks interact with takedown entries, and matters less in matchups that do not involve a significant takedown threat.`,
    takeaways: `A wider striking arsenal gives a fighter more specific tools against a wrestler's takedown entries, particularly through leg kicks timed to a wrestler's level changes.`,
    related: ['boxer-vs-wrestler', 'leg-kick-strategy', 'striker-vs-wrestler-matchup'],
  }),

  standard({
    slug: 'grappler-vs-striker',
    title: 'Grappler vs Striker',
    category: 'style-matchups',
    aliases: ['grappler versus striker', 'ground game vs striking matchup'],
    summary:
      'The broadest version of the sport’s central stylistic question: does the fight stay standing, or does it go to the ground.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Grappler vs striker is the general version of a matchup this category also covers in more specific forms (boxer vs wrestler, kickboxer vs wrestler): a fighter whose strengths lie primarily in submission grappling or wrestling against a fighter whose strengths lie primarily in striking, wherever the strike comes from. The central strategic question is the same one that runs through the whole category: which fighter dictates where the fight happens.`,
    howItWorks: `A grappler in this matchup generally needs to survive exchanges at range long enough to close distance and either secure a takedown or work from the clinch toward one, then use ground control and submission threats to neutralise the striker's advantage entirely. A striker generally needs to defend takedowns well enough, and manage distance well enough, that the fight simply never reaches the ground, since a striker whose only tools are their hands and feet is often at a significant disadvantage once a real grappler establishes top position.`,
    example: `A submission-focused grappler spends most of a round absorbing strikes while working forward, eventually securing a clinch against the cage and converting it into a takedown. Once on top, the grappler transitions through several positions, eventually securing a dominant position and threatening a submission that the striker, with little ground experience, struggles to defend.`,
    whyItMatters: `This matchup is the clearest illustration of why takedown defence is often described as one of the sport's single most valuable skills for a striker to have: without it, a striker's entire skill set can be neutralised the moment the fight goes to the ground.`,
    misunderstandings: `A common one: assuming any fighter described as a "striker" is automatically vulnerable to any fighter described as a "grappler." The specific quality of each fighter's takedown offence or defence, not just the broad style label, decides most of these fights.`,
    takeaways: `This matchup, in all its specific forms across this category, usually turns on the same question: can the grappler get the fight to the ground, and can the striker stop them.`,
    related: [
      'boxer-vs-wrestler',
      'wrestler-vs-submission-grappler',
      'striker-vs-wrestler-matchup',
    ],
  }),

  standard({
    slug: 'pressure-fighter-vs-counterstriker',
    title: 'Pressure Fighter vs Counterstriker',
    category: 'style-matchups',
    aliases: ['pressure fighter versus counter striker matchup'],
    summary:
      'Two opposed striking identities matched against each other, and which conditions favour which one.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `When a pressure fighter, whose whole approach is built around forcing forward exchanges, meets a counterstriker, whose whole approach is built around timing an opponent's entries, the matchup often comes down to whether the counterstriker can find the space and timing to land cleanly, or whether the pressure fighter can close that space down before they get the chance.`,
    howItWorks: `A pressure fighter in this matchup wants to close distance quickly and often, using volume and forward movement to deny the counterstriker the clean look they rely on. A counterstriker wants to control distance and angles precisely enough that the pressure fighter's entries are predictable and punishable, often circling off the cage rather than backing straight into it.

The cage itself is frequently decisive in this matchup: a pressure fighter who successfully backs a counterstriker onto the cage removes the space the counterstriker's whole approach depends on, while a counterstriker who avoids the cage for a full fight can often make the pressure fighter pay repeatedly for their entries.`,
    example: `A counterstriking fighter circles away from a pressure fighter's advances for most of a round, landing clean counters on the pressure fighter's entries and avoiding being cornered. Late in the round, the pressure fighter finally cuts an angle rather than advancing straight on, traps the counterstriker against the cage, and lands a heavy combination in the exchange that follows, now that circling away is no longer an option.`,
    whyItMatters: `This matchup is a direct test of cage control (see "Cage Cutting"): a pressure fighter who cannot cut off the cage effectively is usually neutralised by a good counterstriker's movement, and a counterstriker who gets trapped against the fence is usually in serious trouble.`,
    misunderstandings: `A common one: assuming pressure automatically beats counterstriking, or vice versa, as a rule. Which style wins this matchup depends heavily on footwork and cage control specifically, not on pressure or counterstriking being inherently superior approaches.`,
    takeaways: `This matchup is decided largely by cage geography: whoever controls whether the fight happens in open space or against the fence usually controls the outcome.`,
    related: [
      'pressure-vs-counterstriking',
      'cage-cutting-strategy',
      'high-volume-vs-power-puncher',
    ],
  }),

  standard({
    slug: 'southpaw-vs-orthodox',
    title: 'Southpaw vs Orthodox',
    category: 'style-matchups',
    alsoIn: ['striking-concepts'],
    aliases: ['southpaw versus orthodox matchup', 'why southpaw fights are awkward'],
    summary:
      'Why fights between opposite stances tend to look and feel different from same-stance fights, as a whole-fight dynamic.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-southpaw-swc' }],
    explanation: `A fight between a southpaw and an orthodox fighter is widely described, across combat sports generally, as playing out differently than a fight between two fighters of the same stance. This entry covers that as a matchup-level dynamic, the shape the whole fight tends to take, rather than the specific footwork adjustments a fighter makes, which are covered separately in "Fighting Southpaws."`,
    howItWorks: `Because the two fighters' lead hands and lead legs occupy the same side of the centre line rather than opposite sides, the usual rhythms of jab exchanges, clinch entries and even simple footwork patterns that both fighters may have drilled for thousands of rounds against same-stance training partners behave differently. This is a large part of why fighters and coaches frequently describe southpaw-vs-orthodox fights as "awkward": neither fighter's habitual reads of distance and timing, built mostly against the more common stance, transfer cleanly.

The awkwardness tends to fade as a fight goes on and both fighters adjust in real time, which is one reason these fights are sometimes described as taking a round or more to "settle" compared to a same-stance fight.`,
    example: `Two fighters of similar overall skill level, one orthodox and one southpaw, spend much of the opening exchanges of a fight seemingly failing to time each other cleanly, with jabs and leads missing or clashing in ways that look uncharacteristic for both. By the second round, both have adjusted their footwork and angles, and the fight begins to resemble a more conventional rhythm.`,
    whyItMatters: `Recognising the stance mismatch as the cause of an unusually scrappy or hard-to-read opening explains a common pattern in the sport's broadcasts, commentators specifically flagging "the southpaw-orthodox thing" when a fight starts unevenly, rather than either fighter underperforming.`,
    misunderstandings: `A common one: treating "awkward" as vague commentary filler rather than a real, specific mechanical effect. The mechanics of why lead-side matching changes available angles are covered in "Southpaw vs Orthodox" as a footwork topic (see "Fighting Southpaws"); this entry is about the resulting whole-fight feel.`,
    takeaways: `Opposite-stance fights carry a real, mechanically grounded unfamiliarity that tends to ease as both fighters adjust, which is why these fights are often described as needing time to "settle" more than same-stance fights do.`,
    related: ['fighting-southpaws', 'switching-stances'],
  }),

  standard({
    slug: 'tall-fighter-vs-short-fighter',
    title: 'Tall Fighter vs Short Fighter',
    category: 'style-matchups',
    aliases: ['height difference mma matchup', 'tall versus short fighter'],
    summary:
      'How a significant height gap changes distance, angles and which fighter’s tools work best at which range.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A significant height difference between two fighters changes the geometry of a fight even before either fighter's individual skill is considered. A taller fighter usually has a longer reach and a naturally higher guard and kicking angles, favouring a longer range; a shorter fighter usually wants to close that range to where their own leverage and power generation work better, particularly in the clinch and against the taller fighter's body and legs.`,
    howItWorks: `A taller fighter often tries to fight from a distance the shorter fighter has to walk through, using jabs, front kicks and distance-management footwork to keep the fight at that range. A shorter fighter, if their approach is built around this dynamic, usually accepts absorbing some strikes to close that distance, then works to stay inside where the taller fighter's longer limbs are less effective and their own strikes, particularly to the body, become easier to land.

Height alone does not decide this matchup: a shorter fighter with excellent head movement and footwork can close distance safely against a taller opponent, and a taller fighter with poor distance management can be closed on easily despite the physical advantage.`,
    example: `A markedly taller fighter uses jabs and front kicks to keep a shorter opponent at range for most of a round, scoring points while rarely being touched. The shorter fighter adjusts by slipping the jab rather than walking through it, closing the distance underneath rather than through it, and once inside, lands considerably more effectively at close range than they had been able to at the taller fighter's preferred distance.`,
    whyItMatters: `Physical measurements like height and reach are commonly cited in pre-fight analysis precisely because they predict, to a real if imperfect degree, which fighter has a natural advantage at which range, which in turn shapes the strategy each fighter is likely to bring.`,
    misunderstandings: `A common one: treating a height or reach advantage as decisive on its own. It changes which range favours which fighter, but skilled footwork, feints and head movement can neutralise much of that advantage, which is why taller fighters lose to shorter ones regularly in the sport.`,
    takeaways: `Height and reach set the geometry a fight is likely to be fought within, but the footwork and skill each fighter brings to managing that geometry usually matters more than the raw physical gap itself.`,
    related: ['long-reach-vs-short-reach-fighter', 'controlling-distance'],
  }),

  standard({
    slug: 'long-reach-vs-short-reach-fighter',
    title: 'Long-Reach vs Short-Reach Fighter',
    category: 'style-matchups',
    aliases: ['reach advantage mma matchup', 'long reach versus short reach'],
    summary:
      'Reach specifically, distinct from height, and the distance-management contest it creates.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Reach, the distance a fighter's arms extend, is related to height but is its own measurement, and the two do not always match: a fighter can be relatively short with unusually long arms, or tall with a comparatively shorter reach. A reach advantage specifically affects striking range: a longer-armed fighter can land punches from a distance the shorter-armed fighter's own punches cannot reach back from, independent of overall height.`,
    howItWorks: `A fighter with a significant reach advantage often tries to fight almost entirely at the outer edge of their own range, using their jab and lead hand to control distance and score without ever entering the shorter-armed fighter's more dangerous range. The shorter-armed fighter's task is closing that specific gap safely: slipping or rolling under the longer fighter's punches rather than walking straight into them, since a straight-line approach means absorbing clean shots for the entire distance being closed.

Reach interacts with kicking range too: a fighter with longer legs can often land kicks from outside an opponent's own kicking range, adding another layer to the same basic contest.`,
    example: `A fighter with a considerable reach advantage keeps an opponent at the end of a long jab for most of the opening round, controlling the pace and distance almost entirely. The shorter-armed fighter adjusts by feinting to draw the jab, then slipping to the outside and closing distance behind the feint rather than trying to out-jab a fighter with a clear range advantage in that specific exchange.`,
    whyItMatters: `Reach differences are one of the most commonly cited pre-fight statistics precisely because the underlying effect, controlling how much unanswered range a fighter has to work with, is real and significant, even though skill in managing that range ultimately matters more than the raw number.`,
    misunderstandings: `A common one: conflating reach with height, or assuming a reach advantage guarantees the same outcome as a height advantage. The two often align but do not always, and it is specifically arm length, not overall height, that determines who controls a pure striking-range exchange.`,
    takeaways: `Reach sets the outer boundary of a striking exchange, and a shorter-armed fighter's task is almost always finding a way to cross that boundary safely rather than trying to win at a range they are disadvantaged in.`,
    related: ['tall-fighter-vs-short-fighter', 'controlling-distance'],
  }),

  standard({
    slug: 'high-volume-vs-power-puncher',
    title: 'High-Volume vs Power Puncher',
    category: 'style-matchups',
    aliases: ['volume striker vs power puncher', 'output vs power mma matchup'],
    summary:
      'A fighter who lands often but lighter against one who lands rarely but with fight-changing power.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `A high-volume striker's strategy is built around output: landing frequently, accumulating a scoring case and slowly wearing an opponent down, generally with less emphasis on any single strike's power. A power puncher's strategy is closer to the opposite: fewer strikes, but each one is a genuine threat to end the fight, which changes the entire risk calculation around every exchange for both fighters.`,
    howItWorks: `A high-volume fighter in this matchup generally wants to maintain output and pressure without walking directly into the power puncher's single best weapon, since even one clean shot from a genuine power puncher can undo several rounds of accumulated work instantly. A power puncher generally accepts being out-landed on volume, betting instead that patience and precision will eventually produce the one shot that changes the fight, sometimes deliberately absorbing some punishment to draw the opening that shot needs.

This matchup creates a distinctive tension for judges as well as fighters: a high-volume fighter can be landing significantly more strikes across a round while a power puncher's few clean, hard shots make the round genuinely competitive on the scorecards, since effective striking weighs damage as well as sheer count.`,
    example: `A high-volume striker lands considerably more total strikes across a round, working behind a constant, varied output. Midway through the round, a single clean counter from the power puncher visibly staggers the volume striker, and despite being out-landed by a wide margin for the rest of the round, that single moment makes the round close, or arguably even favours the power puncher, on the judges' cards.`,
    whyItMatters: `This matchup is a useful lens for understanding why raw strike counts do not tell the whole story of a round or a fight: the scoring criteria weigh the effectiveness and damage of strikes landed, not merely how many landed, which is precisely what makes a good power puncher dangerous against a much busier opponent.`,
    misunderstandings: `A common one: assuming the fighter with the significantly higher strike count automatically wins a round or a fight. A power puncher landing far less often can still win a round, or end a fight outright, on the strength of a small number of significantly more damaging strikes.`,
    takeaways: `Volume and power are two different bets on the same exchange, and judges are specifically asked to weigh both, which is exactly why this matchup so often produces closer decisions than the strike counts alone would suggest.`,
    related: [
      'pressure-fighter-vs-counterstriker',
      'winning-rounds',
      'effective-striking-explained',
    ],
  }),

  standard({
    slug: 'wrestler-vs-submission-grappler',
    title: 'Wrestler vs Submission Grappler',
    category: 'style-matchups',
    aliases: ['wrestler versus jiu jitsu fighter', 'wrestling vs submission grappling matchup'],
    summary:
      'A ground battle within the ground battle: takedown and control skill against submission skill, once the fight is already on the mat.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `Where most of this category's matchups are about whether a fight stays standing or goes to the ground, this one starts from the assumption that it has already gone there, and asks a narrower question: between a fighter whose ground game is built around control and positional dominance (a wrestling background) and one whose ground game is built around finishing from those positions (a submission-grappling background), who wins the exchanges that follow?`,
    howItWorks: `A wrestling-background fighter on top often prioritises control and limiting the bottom fighter's offence over advancing toward a finish, using their strength and positional skill to maintain dominant position and accumulate control time even without actively hunting for a submission. A submission-grappling-background fighter, whether on top or working from the bottom, is generally more willing to create scrambles and openings, since a scramble is exactly the kind of chaotic, transition-heavy moment a submission specialist is most comfortable exploiting and a pure control-based wrestler may not be.

The matchup can invert interestingly compared to most others in this category: a wrestler landing on top of a dangerous submission grappler is not automatically safe, since a skilled grappler can threaten submissions even from what looks, positionally, like a fully controlled and dominant position for the wrestler.`,
    example: `A wrestling-background fighter takes down a submission-focused opponent and quickly establishes a dominant top position, appearing to be in full control. The bottom fighter, rather than simply trying to escape, uses the wrestler's own forward pressure to create an opening for a leg-lock attempt from a position most fighters would consider purely defensive, catching the wrestler in a submission specifically because they underestimated the danger of that position.`,
    whyItMatters: `This matchup is a reminder that "ground control" and "ground danger" are not the same thing: a fighter with a wrestling background can be excellent at getting a fight to the ground and holding position there while still being genuinely vulnerable once they arrive, if their submission defence has not kept pace with their control skills.`,
    misunderstandings: `A common one: assuming a fighter who has taken their opponent down and established top position has effectively neutralised a submission-grappling opponent. Some of the sport's most dangerous submissions are attacked from positions that look, superficially, like a clear disadvantage for the grappler.`,
    takeaways: `Once a fight reaches the ground, wrestling and submission grappling remain distinct skill sets with their own separate contest, and dominant position is not the same thing as safety against a genuine submission threat.`,
    related: ['setting-up-submissions', 'boxer-vs-wrestler', 'grappler-vs-striker'],
  }),

  standard({
    slug: 'why-mma-math-doesnt-work',
    title: "Why MMA Math Doesn't Work",
    category: 'style-matchups',
    aliases: ['mma math fallacy', 'why mma math is flawed', 'transitive mma logic'],
    summary:
      '"If A beat B, and B beat C, A beats C" is a famous fallacy in this sport, and stylistic matchups are exactly why.',
    isFeatured: true,
    difficulty: 'advanced',
    sourceKeys: [{ key: 'wp-mma-tactics' }],
    explanation: `"MMA math" is the sport's own name for a specific, well-known reasoning error: assuming that if Fighter A has beaten Fighter B, and Fighter B has beaten Fighter C, then Fighter A should beat Fighter C. It is a transitive assumption borrowed from ranking systems in other contexts, and it is widely, and correctly, dismissed within the sport as unreliable, precisely because of the "styles make fights" dynamic this category is built around.`,
    howItWorks: `A single win or loss is the outcome of one specific stylistic matchup, on one specific night, not a clean, general measurement of overall ability that transfers predictably to a different opponent. Fighter A may have beaten Fighter B specifically because Fighter A's striking neutralised a hole in Fighter B's takedown defence, a dynamic that has nothing to do with how Fighter A would fare against Fighter C's completely different skill set, timing, or physical attributes.

MMA math also ignores that fights are not fought under identical conditions: weight cuts, layoffs, injuries carried into a fight, a change of camp or coach, and simple performance variance from one night to the next all mean a single result is a noisy signal even about the two fighters directly involved, let alone a third fighter neither of them has faced.`,
    example: `Fighter A defeats Fighter B decisively, largely because Fighter B has poor takedown defence and Fighter A is a strong wrestler. Fighter B had previously beaten Fighter C, a dangerous striker with excellent takedown defence, in a fight where wrestling was never a factor at all. "MMA math" would predict Fighter A beats Fighter C; in practice, Fighter C's strong takedown defence may neutralise exactly the tool that made Fighter A dangerous against Fighter B, producing a completely different kind of fight with no reliable relationship to either previous result.`,
    whyItMatters: `Understanding why MMA math fails is really understanding the sport's central strategic idea from the opposite direction: if styles, not overall ability rankings, decide fights, then chains of results built purely on who-beat-whom will systematically mislead, and pre-fight analysis has to look at the specific stylistic matchup in front of it rather than a transitive chain of past results.`,
    misunderstandings: `A common one: treating "MMA math doesn't work" as meaning past results are worthless for prediction. Past results remain useful evidence about a fighter's own tendencies and vulnerabilities; the fallacy specifically is chaining two separate results together through a common opponent as if ability were a single transferable number.`,
    takeaways: `A win or loss reflects a specific matchup, not a portable ranking. Predicting a new fight means analysing the two actual style sets in front of you, the same work this whole category is built to teach, not multiplying results together.`,
    related: ['styles-make-fights-explained', 'mma-fight-strategy-explained'],
  }),
];

// ─── Weight Classes ─────────────────────────────────────────────────────────

const WEIGHT_CLASSES: ExplainerSeed[] = [
  // "MMA Weight Classes Explained" already exists (category start-here, alsoIn
  // weight-classes) as a Phase 1 entry and is intentionally not recreated here.

  standard({
    slug: 'why-weight-classes-exist',
    title: 'Why Weight Classes Exist',
    category: 'weight-classes',
    aliases: ['why does mma have weight classes', 'purpose of weight classes'],
    summary:
      'The safety and fairness case for dividing fighters by weight, in a sport where size is a major advantage.',
    difficulty: 'beginner',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    explanation: `Weight classes divide fighters into bands so that, within a fight, neither competitor has an overwhelming, purely physical size advantage over the other. Size, mass and reach matter a great deal in a full-contact combat sport, and without weight divisions, matchmaking would routinely pit much larger fighters against much smaller ones, a mismatch that is both unfair competitively and genuinely dangerous.`,
    howItWorks: `A fighter competes at the weight class whose upper limit is closest to, but not below, their fight-night fighting weight, after making the required weight at an official weigh-in before the fight. Weight classes are spaced across the sport's full range of competitors, from the lightest divisions up to heavyweight, at intervals set by the ruleset a promotion competes under (see "UFC Weight Classes Explained" for one promotion's actual figures).

Because weight classes are enforced through pre-fight weigh-ins rather than being self-reported or assumed, a fighter's division is a checked fact for that specific fight, not simply a label attached to their career.`,
    example: `A fighter who walks around well above their competition weight cuts down to make a lower division's limit at the official weigh-in, then competes at that lower weight class the next day rather than at their larger natural size, specifically so their opponent is guaranteed to be within the same weight band rather than considerably smaller.`,
    whyItMatters: `Without weight classes, the sport's matchmaking, and its safety record, would look completely different: a significant size mismatch is one of the clearest predictors of a lopsided, higher-risk fight, and weight classes exist specifically to prevent that from being a routine occurrence.`,
    misunderstandings: `A common one: assuming weight classes eliminate size differences entirely. Two fighters at the same weight-class limit can still differ meaningfully in height, reach and natural frame, which is a separate topic covered in the Style Matchups category; weight classes narrow the gap in overall mass, not every physical dimension.`,
    takeaways: `Weight classes are a safety and fairness mechanism, not an arbitrary sporting tradition, built around the real competitive danger of unmanaged size mismatches in a full-contact sport.`,
    related: [
      'mma-weight-classes-explained',
      'heavyweight-differences',
      'natural-weight-vs-fight-weight',
    ],
  }),

  rulesetConcept({
    slug: 'catchweight-fight',
    title: 'Catchweight Fight',
    category: 'weight-classes',
    aliases: ['catchweight bout', 'what is a catchweight fight'],
    summary:
      'A fight contested at a weight limit agreed specifically for that bout, rather than at a standard division limit.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-catchweight' }],
    recognition: `A broadcast or fight card will specifically note a bout as being contested "at a catchweight of [X] pounds" rather than naming one of the sport's standard divisions, and the weigh-in numbers to look for will target that agreed figure rather than a standard limit.`,
    explanation: `A catchweight fight is contested at a weight limit that is not one of the promotion's standard division limits, agreed specifically between the two fighters (or set by the promotion) for that particular bout. Catchweights are typically arranged when the two fighters' preferred divisions do not match: one may be moving up or down between their usual weights, or an opponent may not be available to make a standard limit on short notice, and a catchweight lets the fight happen anyway on terms both sides accept.`,
    example: `A fighter who normally competes at lightweight (155 lbs) faces a welterweight (170 lbs) opponent at an agreed catchweight of 165 lbs, a compromise between the two fighters' usual divisions rather than either fighter competing at their standard limit.`,
    whyItMatters: `Catchweight fights let promotions make matchups that would otherwise be impossible under the standard division system, but because they sit outside the normal weight-class structure, most promotions do not allow a divisional title to be contested at a catchweight.`,
    misunderstandings: `A common one: assuming a catchweight fight is a step toward one fighter's permanent move to a new division. It is usually a one-off arrangement for that specific matchup, and either fighter may return to their standard division for their next fight.`,
    related: [
      'openweight-fight',
      'why-fighters-change-divisions',
      'catchweight-after-missing-weight',
    ],
  }),

  rulesetConcept({
    slug: 'openweight-fight',
    title: 'Openweight Fight',
    category: 'weight-classes',
    aliases: ['open weight bout', 'what is an openweight fight'],
    summary:
      'A fight or tournament with no weight limit at all, rare in modern regulated MMA but historically significant.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    recognition: `An event or bout billed as "openweight" or "no weight limit" carries no weigh-in target at all: fighters simply compete at whatever weight they naturally are on fight night.`,
    explanation: `An openweight fight or tournament has no weight-class restriction whatsoever: any fighter may compete regardless of size against any other. This was common in the sport's earliest era, including its first tournaments, which were run without weight divisions specifically to test which martial art or fighter would prevail regardless of size, but it is rare in modern, regulated MMA, where weight classes are considered a basic safety standard.`,
    example: `An early MMA tournament, run before the sport adopted standard weight classes, features fighters of dramatically different sizes competing against each other in the same bracket, a format the sport has since moved away from almost entirely in its regulated, modern form.`,
    whyItMatters: `Openweight competition is part of the sport's early history and helps explain why weight classes were adopted at all: the size mismatches openweight competition produced were a direct driver of the safety-based push toward the divisional structure the sport uses today.`,
    misunderstandings: `A common one: assuming openweight fights still happen regularly in major modern promotions. They are effectively absent from regulated top-tier MMA today, precisely because of the safety rationale covered in "Why Weight Classes Exist."`,
    related: ['why-weight-classes-exist', 'catchweight-fight'],
  }),

  standard({
    slug: 'moving-up-a-division',
    title: 'Moving Up a Division',
    category: 'weight-classes',
    aliases: ['moving up in weight mma', 'moving up a weight class'],
    summary:
      'A fighter choosing to compete at a heavier weight class than the one they have been fighting in.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    explanation: `Moving up a division means a fighter changes from competing in one weight class to the next heavier one. Fighters do this for a range of reasons: a difficult or increasingly severe weight cut at their current division, a stalled path to a title shot in a crowded division, or simply a natural change in their body as they age or their training changes.`,
    howItWorks: `A fighter moving up typically no longer needs to cut as much weight to make the new, higher limit, which can mean a less severe weight cut and, for some fighters, more strength and less fatigue on fight night, since less of their natural weight has to be shed. The trade-off is that their opponents in the new division are, by definition, naturally larger, which can change the physical dynamics of their fights considerably even if their skills have not changed at all.`,
    example: `A fighter who has struggled with an increasingly difficult cut to make their current division's limit for several fights in a row decides to move up to the next weight class rather than continue cutting that much weight, trading a more comfortable weight cut for opponents who are naturally larger.`,
    whyItMatters: `A move up in weight class is one of the most consequential career decisions a fighter can make, changing both how hard their fight-week weight cut will be and what kind of opponent they will face, and it is closely watched by fans and analysts as a signal about a fighter's long-term career plans.`,
    misunderstandings: `A common one: assuming a fighter who moves up a division is automatically at a disadvantage against naturally bigger opponents. Some fighters actually perform better at a higher weight once free of a severe cut's toll on their conditioning and strength; the effect of a move varies fighter to fighter.`,
    takeaways: `Moving up a division trades a smaller weight cut for larger opponents, and which effect dominates for a given fighter depends heavily on how much that fighter's performance had been limited by the cut they are leaving behind.`,
    related: [
      'moving-down-a-division',
      'natural-weight-vs-fight-weight',
      'why-fighters-change-divisions',
    ],
  }),

  standard({
    slug: 'moving-down-a-division',
    title: 'Moving Down a Division',
    category: 'weight-classes',
    aliases: ['moving down in weight mma', 'moving down a weight class'],
    summary:
      'A fighter choosing to compete at a lighter weight class than the one they have been fighting in.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    explanation: `Moving down a division means a fighter changes from competing in one weight class to the next lighter one. Fighters typically do this to gain a size advantage: if a fighter is naturally near the bottom of their current division's weight range, they may be giving up a meaningful size edge to opponents who cut more weight to make that same limit, and moving down can put them on the larger side of a new, lower division instead.`,
    howItWorks: `Moving down a division generally requires cutting more weight than the fighter has previously needed to, since they are now targeting a lower limit than their body's natural comfortable range. Done successfully, and with proper preparation, this can produce a genuine size advantage on fight night, since the fighter may now be naturally larger, once rehydrated, than opponents who have always competed at that lower weight. Done without adequate preparation, an aggressive move down can instead leave a fighter drained and underperforming, which is a significant part of why this decision carries real risk.`,
    example: `A fighter who has often been one of the physically smaller competitors in their current division decides to move down to the next lighter weight class, judging that the larger cut is worth it for the size advantage they expect to hold over opponents who have always fought at that lower limit.`,
    whyItMatters: `A move down in weight class is one of the sport's most closely watched roster decisions, since a well-executed move can meaningfully extend a fighter's competitiveness, while a poorly managed one can visibly harm their performance, sometimes for more than one fight while their body adjusts.`,
    misunderstandings: `A common one: assuming a move down in weight automatically produces a size advantage. It depends on whether the fighter can actually manage the larger cut safely and still perform on fight night; a fighter who cannot may end up worse off than they were at their previous division.`,
    takeaways: `Moving down a division is a bet that a larger weight cut is worth the size advantage it can produce, a bet that depends heavily on how well that larger cut can actually be managed.`,
    related: [
      'moving-up-a-division',
      'natural-weight-vs-fight-weight',
      'why-extreme-weight-cutting-is-controversial',
    ],
  }),

  standard({
    slug: 'becoming-double-champion',
    title: 'Becoming Double Champion',
    category: 'weight-classes',
    alsoIn: ['championships'],
    aliases: ['double champ mma', 'holding two titles at once'],
    summary:
      'Holding championships in two different weight classes at the same time, a rare and celebrated achievement.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-double-champion' }],
    explanation: `A "double champion" is a fighter who holds championship titles in two different weight classes simultaneously, having won a title at a second division while still holding the belt at their original one. It is a rare achievement precisely because it requires beating an elite champion in a second division while already carrying the demands, and often the risk, of defending a title in the first.`,
    howItWorks: `A reigning champion moves up (occasionally down) to challenge for a title in a different division, and if successful, holds both belts at once, at least until the promotion's own rules on vacating a title come into play. Most major promotions eventually require a double champion to make a decision about one of the two titles, whether through a mandated title defence timeline or a vacation of one belt, since holding two divisions active at once for an extended period can stall the path for other contenders in whichever division goes undefended.`,
    example: `A fighter who has defended their lightweight title multiple times moves up to welterweight and defeats the reigning champion there, becoming a double champion across both divisions at once, before eventually vacating or being required to defend one of the two belts as the promotion's own rules dictate.`,
    whyItMatters: `Becoming a double champion is treated as one of the most significant individual achievements in the sport specifically because of how rare it is: it requires being the best fighter in the world in two separate weight classes at overlapping points in a career.`,
    misunderstandings: `A common one: assuming a double champion can hold both belts indefinitely with no consequence. Most promotions have rules, formal or informal, that eventually force a choice, since an undefended division stalls the rankings and title picture beneath it.`,
    takeaways: `Double-champion status is a genuinely rare, high-difficulty achievement, and it comes with structural pressure from the promotion to eventually settle on defending one division rather than both indefinitely.`,
    related: ['moving-up-a-division', 'moving-down-a-division', 'how-mma-championships-work'],
  }),

  standard({
    slug: 'why-fighters-change-divisions',
    title: 'Why Fighters Change Divisions',
    category: 'weight-classes',
    aliases: ['reasons fighters switch weight class', 'why do fighters change weight classes'],
    summary:
      'The range of competitive, physical and career reasons a fighter moves between weight classes.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    explanation: `Fighters change weight classes for a mix of reasons that are rarely purely about size. The most common are a weight cut that has become difficult or unsafe to manage, a division that has become too crowded or stalled for a clear path to a title, a natural change in the fighter's body over the course of a long career, or a specific opportunity, such as a title fight offer in a different division, that is simply too significant to turn down.`,
    howItWorks: `A change in division is usually a considered decision made with a fighter's coaching and medical team, since it affects training camp, nutrition planning and the entire style of opponent a fighter will now face. It is rarely reversed quickly: a fighter who moves divisions typically stays there for multiple fights rather than moving back and forth between two weight classes regularly, given how disruptive repeated changes would be to fight camp preparation.`,
    example: `A fighter who has spent several fights near the top of a division's rankings without securing a title shot, behind a long-reigning champion, decides to move up a division specifically because the path to a title looks clearer there, even though it means facing naturally larger opponents.`,
    whyItMatters: `Understanding why a fighter changed divisions, rather than just that they did, is usually necessary to judge whether the move makes sense: a change driven by an unsustainable weight cut is a very different decision, with different risks, from one driven purely by rankings and opportunity.`,
    misunderstandings: `A common one: assuming a division change is always about chasing an easier path to a title. Health and weight-cutting concerns are just as common a driver, and are frequently the primary one even when a promotion or fighter frames the move publicly in competitive terms.`,
    takeaways: `Division changes are driven by a mix of competitive opportunity and physical necessity, and the two are often intertwined in ways a fighter may not fully disclose publicly.`,
    related: ['moving-up-a-division', 'moving-down-a-division', 'natural-weight-vs-fight-weight'],
  }),

  standard({
    slug: 'natural-weight-vs-fight-weight',
    title: 'Natural Weight vs Fight Weight',
    category: 'weight-classes',
    alsoIn: ['weight-cutting'],
    aliases: ['walking around weight vs fight weight', 'natural weight mma explained'],
    summary:
      'Why the number a division names is rarely the weight a fighter actually walks around at day to day.',
    isFeatured: true,
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }, { key: 'wp-weight-cutting' }],
    explanation: `A fighter's "natural" or "walking around" weight, what they weigh day to day, outside of a fight-week cut, is typically noticeably heavier than the weight class they compete in. The number attached to a division (for example, 170 pounds for welterweight) is a limit checked at an official weigh-in shortly before the fight, not the weight a fighter carries into the cage on fight night itself, and not the weight they live at for most of a training camp.`,
    howItWorks: `Most fighters cut some amount of weight in the days immediately before an official weigh-in, then rehydrate and refeed before the fight itself, which is often held roughly a day later. The result is that a fighter's actual fight-night weight, when they step into the cage, is typically several pounds to well over ten pounds heavier than the number their division is named after, since the weigh-in number and the fight-night reality are two different measurements taken at two different times.`,
    example: `A fighter competing in a division with a 170-pound limit weighs meaningfully more than that in day-to-day life, cuts down to make 170 pounds at the official weigh-in, then rehydrates over the following day and enters the cage the next night at a fight weight noticeably above the division's own number.`,
    whyItMatters: `This gap is one of the most misunderstood facts in the sport for newer fans, and it directly explains a detail flagged in "MMA Weight Classes Explained": the division name is a checked limit at one specific moment, not a description of how big either fighter actually is once the fight starts.`,
    misunderstandings: `A common one, flagged directly for correction here: assuming a fighter's division name describes their actual size in the fight itself. Two fighters in the same weight class, at the same official weigh-in number, can differ meaningfully in fight-night size depending on how much each one cut and how effectively each rehydrated afterward.`,
    takeaways: `The number in a weight class's name is a fight-week checkpoint, not a fight-night fact. See the Weight Cutting category for how that gap between natural weight and official weigh-in weight is actually managed.`,
    related: ['mma-weight-classes-explained', 'what-is-weight-cutting', 'rehydration-explained'],
  }),

  standard({
    slug: 'heavyweight-differences',
    title: 'Heavyweight Differences',
    category: 'weight-classes',
    aliases: ['why heavyweight is different mma', 'heavyweight division explained'],
    summary:
      'Heavyweight has a floor but no ceiling in most promotions, unlike every other division, which changes the fights it produces.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-mma-weight-classes-swc' }],
    explanation: `Every weight class below heavyweight is bounded on both sides: a fighter must weigh more than the division below and no more than their own division's limit. Heavyweight, in most major promotions, only has a floor, a minimum weight, with no upper limit at all. In the UFC, for example, heavyweight runs from just above light heavyweight's limit up to 265 pounds, but in some rulesets and contexts, heavyweight is described as having no fixed ceiling in the way lighter divisions do, meaning fighters at the very top of the division's range can be dramatically larger than fighters at its bottom.`,
    howItWorks: `Because heavyweight is not bounded above the way lighter divisions are, the range of natural sizes within the division is far wider than anywhere else in the sport. A fighter near a division's floor and a fighter well above it can differ in weight by a considerably larger margin than two fighters at opposite ends of any lighter weight class, since those classes are capped much closer to their own floor. This means heavyweight fights can feature size gaps that simply are not possible in any other division, even between two fighters who are, by the rules, in the same weight class.`,
    example: `Two fighters both compete at heavyweight, but one is close to the division's floor while the other is considerably heavier still, well within the same division's legal range. Their fight features a size disparity that could not legally occur in, say, lightweight or welterweight, where the gap between a division's floor and its ceiling is far narrower.`,
    whyItMatters: `This structural quirk means heavyweight fights are analysed differently from fights in every other division: raw power and size differences are a much larger, and much more variable, factor at heavyweight than the weight-class system otherwise ensures for the rest of the sport.`,
    misunderstandings: `A common one: assuming all weight classes work the same way, bounded on both sides by similar-sized gaps. Heavyweight's open-ended upper range is a genuine structural exception, not simply "the biggest normal weight class," and it is worth understanding as its own case.`,
    takeaways: `Heavyweight is the one division in most promotions without an upper weight limit, only a floor, which allows for size gaps between same-division opponents that no other weight class in the sport permits.`,
    related: ['why-weight-classes-exist', 'ufc-weight-classes-explained'],
  }),

  rulesetConcept({
    slug: 'ufc-weight-classes-explained',
    title: 'UFC Weight Classes Explained',
    category: 'weight-classes',
    alsoIn: ['ufc'],
    aliases: ['ufc weight classes', 'ufc divisions and limits'],
    summary: "The UFC's actual men's and women's divisions and their weight limits, in one place.",
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-ufc-weight-classes' }],
    recognition: `A UFC broadcast names a fighter's division alongside their name (for example, "competing at lightweight") and a title fight's weigh-in graphic shows the specific limit that division carries.`,
    explanation: `The UFC's men's divisions, from lightest to heaviest, are: flyweight (up to 125 lbs), bantamweight (up to 135 lbs), featherweight (up to 145 lbs), lightweight (up to 155 lbs), welterweight (up to 170 lbs), middleweight (up to 185 lbs), light heavyweight (up to 205 lbs), and heavyweight (206 to 265 lbs, the one division with a floor and ceiling both set well apart from any other, as covered in "Heavyweight Differences"). The UFC's women's divisions are strawweight (up to 115 lbs), flyweight (up to 125 lbs), bantamweight (up to 135 lbs), and featherweight (up to 145 lbs), a narrower set of divisions than the men's roster carries.`,
    example: `A fighter making weight for a UFC lightweight bout must weigh no more than 155 pounds at the official weigh-in, while an opponent moving up to welterweight for a different bout must weigh no more than 170 pounds for that fight instead.`,
    whyItMatters: `Knowing the UFC's actual limits is what turns "which division is this fighter in" from a vague label into a specific, checkable fact, and explains why a fighter is described as moving "up" or "down" relative to a precise number rather than a general sense of size.`,
    misunderstandings: `A common one: assuming the UFC's divisions match every other promotion's exactly. Most promotions use broadly similar limits, since the Unified Rules' weight-class structure is widely adopted, but a promotion is not required to carry every UFC division, and the women's roster in particular varies more between promotions than the men's does.`,
    related: [
      'mma-weight-classes-explained',
      'heavyweight-differences',
      'why-weight-classes-exist',
    ],
  }),
];

// ─── Weight Cutting ─────────────────────────────────────────────────────────

const WEIGHT_CUTTING: ExplainerSeed[] = [
  standard({
    slug: 'what-is-weight-cutting',
    title: 'What Is Weight Cutting?',
    category: 'weight-cutting',
    aliases: ['weight cutting mma', 'what does cutting weight mean'],
    summary:
      'The practice of temporarily reducing body weight before an official weigh-in, then recovering it before the fight.',
    isFeatured: true,
    difficulty: 'beginner',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    explanation: `Weight cutting is the practice of temporarily reducing body weight in the days immediately before an official weigh-in, in order to make a lower weight class than a fighter's day-to-day, or "natural," weight would otherwise place them in. Once the weigh-in has taken place and the fighter's weight has been officially checked, they rehydrate and refeed before the fight itself, aiming to return closer to their natural size by fight night.`,
    howItWorks: `A weight cut is typically approached through a combination of nutrition, training and, in its final days, various methods aimed at reducing water weight specifically, since water can be lost and regained far faster than fat or muscle. Because the official check happens at the weigh-in, before the fight, rather than at the fight itself, a fighter's task is really two-stage: get down to the limit for the weigh-in, then recover as much size and strength as possible before stepping into the cage. This gap between weigh-in weight and fight weight is covered in detail in "Natural Weight vs Fight Weight" and "Rehydration Explained."`,
    example: `A fighter walking around at a naturally heavier weight than their division's limit spends the final days of a training camp specifically managing their weight down to make the official number at the weigh-in, then spends the time between the weigh-in and the fight itself working to rehydrate and refeed before competing.`,
    whyItMatters: `Weight cutting is one of the most consequential, and most debated, parts of modern MMA: it shapes a fighter's entire fight week, carries real physical risk if handled poorly, and is the subject of ongoing safety scrutiny across the sport, covered across the rest of this category.`,
    misunderstandings: `A common one: assuming a fighter's weigh-in weight is close to what they actually weigh on fight night. As "Natural Weight vs Fight Weight" explains, the two numbers are frequently very different, because rehydration between the weigh-in and the fight is a normal, expected part of the process.`,
    takeaways: `Weight cutting is a temporary, fight-week process, not a description of a fighter's actual size, and it exists specifically because of the gap between a division's checked limit and a fighter's natural weight.`,
    related: [
      'why-mma-fighters-cut-weight',
      'weigh-ins-explained',
      'natural-weight-vs-fight-weight',
      'weight-cutting-and-fighter-safety',
    ],
  }),

  standard({
    slug: 'why-mma-fighters-cut-weight',
    title: 'Why MMA Fighters Cut Weight',
    category: 'weight-cutting',
    aliases: ['reasons fighters cut weight', 'why do fighters cut weight before a fight'],
    summary:
      'The competitive logic behind cutting weight: a size advantage on fight night once rehydration is factored in.',
    difficulty: 'beginner',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    explanation: `Fighters cut weight primarily to gain a size advantage on fight night. A fighter who cuts a significant amount of weight to make a division's limit, then rehydrates afterward, can enter the cage noticeably larger than an opponent who is naturally closer to that division's limit and has little or nothing to cut. Because both fighters are checked at the same weigh-in number, the fighter who cut more and recovered more effectively can hold a real physical edge despite being in the "same" weight class on paper.`,
    howItWorks: `This dynamic creates competitive pressure across the sport: if cutting weight and rehydrating well can produce a size advantage, fighters and camps have an incentive to cut more rather than less, within whatever limits they judge safe and manageable. This is a large part of why weight cutting has become such a significant part of modern fight preparation, and why it remains a subject of ongoing debate and regulatory attention, covered later in this category.`,
    example: `Two fighters compete in the same division at the same official weigh-in weight. One has cut a relatively small amount of weight to make that number and rehydrates only modestly; the other has cut considerably more and rehydrates substantially, entering the fight noticeably larger and heavier than the number both of them made at the weigh-in.`,
    whyItMatters: `Understanding the competitive incentive behind weight cutting explains why the practice has become so widespread and, in some cases, so extreme, rather than being simply a routine or incidental part of making weight.`,
    misunderstandings: `A common one: assuming weight cutting is purely a formality with no real competitive stakes. The potential size advantage it can produce is a significant, deliberate part of many fighters' overall strategy, not an unwanted side effect of the weigh-in system.`,
    takeaways: `Weight cutting persists because it can produce a genuine fight-night size advantage, which creates real competitive pressure to cut, and real safety stakes in how that cut is managed.`,
    related: [
      'what-is-weight-cutting',
      'natural-weight-vs-fight-weight',
      'why-extreme-weight-cutting-is-controversial',
    ],
  }),

  rulesetConcept({
    slug: 'weigh-ins-explained',
    title: 'Weigh-Ins Explained',
    category: 'weight-cutting',
    aliases: ['mma weigh in', 'how weigh ins work'],
    summary:
      'The official, regulated check that confirms a fighter has made their contracted weight before a fight.',
    difficulty: 'beginner',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    recognition: `A weigh-in is a public event, often televised or streamed, where each fighter steps on a scale in front of an athletic commission official, and the resulting number is displayed and announced.`,
    explanation: `A weigh-in is the official, regulated check confirming a fighter has made the weight required for their bout, conducted by or under the supervision of the relevant athletic commission. It typically happens a set period before the fight itself (commonly around a day, though this varies by promotion and is discussed in "Same-Day vs Day-Before Weigh-Ins"), which gives a fighter time to rehydrate and recover between the check and actually competing.`,
    example: `A fighter contracted to compete at a division's limit steps on the scale at the official weigh-in the day before the event, is confirmed to have made weight, and then has roughly a day to rehydrate, refeed and recover before the fight itself.`,
    whyItMatters: `The weigh-in is the mechanism that makes weight classes enforceable at all: without an official, regulated check, a division limit would be a suggestion rather than a verified fact about the two fighters actually competing.`,
    misunderstandings: `A common one: assuming the weigh-in number is the weight a fighter fights at. As covered in "Natural Weight vs Fight Weight," the weigh-in number and the fight-night weight are two different measurements, taken at two different points in the fight week.`,
    related: [
      'what-happens-if-a-fighter-misses-weight',
      'same-day-vs-day-before-weigh-ins',
      'natural-weight-vs-fight-weight',
    ],
  }),

  rulesetConcept({
    slug: 'what-happens-if-a-fighter-misses-weight',
    title: 'What Happens If a Fighter Misses Weight?',
    category: 'weight-cutting',
    aliases: ['missing weight mma', 'consequences of missing weight'],
    summary:
      'The standard consequences when a fighter fails to make their contracted weight limit at the official weigh-in.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    recognition: `A fighter announced as having "missed weight," typically shown as coming in over the division's contracted limit at the official weigh-in, sometimes given a short additional window to attempt to make weight again.`,
    explanation: `When a fighter fails to make their contracted weight limit, several standard consequences typically follow, though the specifics vary by promotion and commission. The fighter who missed weight is usually fined a percentage of their fight purse, which is generally paid to the opponent who did make weight, as compensation for having to fight someone who did not meet the agreed terms. The fight itself is often still allowed to proceed, typically at a catchweight reflecting the actual weight the fighter who missed weight came in at, rather than being cancelled outright, provided both fighters and the commission agree to continue.

If a title is on the line, a fighter missing weight generally means the bout can no longer be a title fight for that fighter: the champion, if they are the one who made weight, can still retain their title by winning, but the challenger who missed weight typically cannot win the title even with a victory, since they did not meet the conditions required to claim it.`,
    example: `A challenger for a divisional title comes in over the limit at the official weigh-in. The bout proceeds at a catchweight reflecting the actual number, the challenger forfeits a percentage of their purse to the champion, and the commission rules that even a win for the challenger will not result in a new champion, since a title cannot be won by a fighter who did not make the contracted weight.`,
    whyItMatters: `These consequences exist to preserve the fairness the weight-class system is built around: a fighter should not be able to gain a competitive advantage by simply weighing more than agreed and facing only a modest financial penalty in return.`,
    misunderstandings: `A common one: assuming missing weight automatically cancels a fight. In most cases the fight still happens, typically at a catchweight and with a financial penalty, rather than being scrapped, since cancelling a fully promoted event outright is generally seen as a worse outcome for everyone involved than proceeding under adjusted terms.`,
    related: [
      'catchweight-after-missing-weight',
      'championship-weight-rules',
      'weigh-ins-explained',
    ],
  }),

  standard({
    slug: 'catchweight-after-missing-weight',
    title: 'Catchweight After Missing Weight',
    category: 'weight-cutting',
    alsoIn: ['weight-classes'],
    aliases: ['fight proceeds at catchweight', 'catchweight due to missed weight'],
    summary:
      'How a fight that was supposed to happen at a standard limit is adjusted into a catchweight bout once a fighter misses that limit.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-weight-cutting' }, { key: 'wp-catchweight' }],
    explanation: `When a fighter misses their contracted weight, one of the most common outcomes is that the bout is reclassified as a catchweight fight rather than being cancelled, with the new agreed limit typically set at or near the actual weight the fighter who missed came in at. This is a specific, reactive use of the general catchweight concept covered in "Catchweight Fight": rather than being planned in advance to accommodate two fighters from different divisions, this kind of catchweight exists because the original plan for a standard-division bout fell through at the weigh-in.`,
    howItWorks: `The two fighters, their teams, and the promotion or commission generally have to agree to proceed at the adjusted number for the fight to continue at all. Both fighters retain the right to refuse to proceed if the new terms are unacceptable to them, though in practice most bouts do proceed once a catchweight and financial penalty are agreed, since withdrawing entirely is usually a worse outcome for the fighter who made weight as well.`,
    example: `A fight originally scheduled at a division's standard limit sees one fighter miss that number by several pounds at the weigh-in. Rather than cancelling the card, the promotion and both fighters agree to proceed with the bout reclassified as a catchweight fight at the number the fighter who missed weight actually made, with the standard financial penalty applied.`,
    whyItMatters: `This mechanism is what allows fight cards to survive a missed weight without wholesale cancellations, while still preserving some consequence and fairness for the fighter who did make the original limit.`,
    misunderstandings: `A common one: treating every catchweight fight as evidence a fighter missed weight. Many catchweight fights, as covered in "Catchweight Fight," are planned in advance for entirely different reasons; only some are the reactive result of a missed weigh-in.`,
    takeaways: `A reactive catchweight is the sport's standard way of salvaging a bout after a missed weigh-in, distinct from a catchweight arranged in advance for other reasons.`,
    related: ['what-happens-if-a-fighter-misses-weight', 'catchweight-fight'],
  }),

  standard({
    slug: 'championship-weight-rules',
    title: 'Championship Weight Rules',
    category: 'weight-cutting',
    alsoIn: ['championships'],
    aliases: ['title fight weight rules', 'championship weigh in rules'],
    summary: 'The stricter weight rules that typically apply when a championship is on the line.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    explanation: `Title fights generally carry stricter, or at least more consequential, weight rules than non-title bouts. As covered in "What Happens If a Fighter Misses Weight?", a champion can typically still retain their title by winning even if their challenger misses weight, but a challenger who misses weight cannot become champion even with a win, since a title is only awarded to a fighter who met the full conditions of the championship bout, including making the contracted weight.`,
    howItWorks: `Some promotions and commissions also apply additional scrutiny to title-fight weigh-ins specifically, given the higher stakes involved, and title bouts are less likely than non-title bouts to be adjusted to a catchweight after a missed weight, since the entire premise of a title fight depends on both fighters competing at the division's actual limit.`,
    example: `A champion successfully defends a title against a challenger who missed weight at the official weigh-in: because the challenger did not meet the conditions required to win the belt, the champion retains their title regardless of the fight's outcome, even though the fight itself was allowed to proceed.`,
    whyItMatters: `These rules protect the integrity of a championship specifically: without them, a challenger could gain a competitive advantage by missing weight while still having a path to winning the title outright, undermining the weight-class system a championship depends on.`,
    misunderstandings: `A common one: assuming a challenger who misses weight and then wins the fight has actually become champion. Under standard rules, they have not: the title is either retained by the champion or, in some cases, declared vacant, but it does not pass to a fighter who did not make the required weight.`,
    takeaways: `Title fights carry stricter consequences for missed weight than ordinary bouts, specifically to protect the meaning of the championship itself.`,
    related: [
      'what-happens-if-a-fighter-misses-weight',
      'becoming-double-champion',
      'how-mma-championships-work',
    ],
  }),

  standard({
    slug: 'rehydration-explained',
    title: 'Rehydration Explained',
    category: 'weight-cutting',
    aliases: ['rehydrating after weigh in', 'how fighters rehydrate before a fight'],
    summary:
      'The recovery period between the official weigh-in and the fight itself, and why it is both routine and controversial.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-dehydration-swc' }, { key: 'wp-weight-cutting' }],
    explanation: `Once a fighter has made weight at the official weigh-in, they typically spend the remaining time before the fight, often roughly a day, rehydrating and refeeding, working to recover fluids and energy that were reduced during the final stage of their weight cut. This is a normal, expected part of modern fight preparation, and it is a major reason a fighter's fight-night weight is usually noticeably higher than their weigh-in number, as covered in "Natural Weight vs Fight Weight."`,
    howItWorks: `At a general level, rehydration involves restoring fluids and nutrition that were deliberately reduced in the lead-up to the weigh-in, under the guidance of a fighter's team and, increasingly, sports science and medical professionals rather than guesswork. How much weight a fighter regains, and how much of their strength and conditioning genuinely recovers in the available time, varies considerably between individuals and depends heavily on how the earlier weight cut itself was managed.`,
    example: `A fighter who has made weight at a significantly reduced bodyweight spends the following day working with their team to restore fluids and energy before the fight, aiming to feel and perform closer to their natural, uncut condition by the time they step into the cage.`,
    whyItMatters: `The rehydration period is both a routine, accepted part of the sport and a genuine point of safety concern: how much weight is lost and then regained in such a short window is directly tied to the broader debate over extreme weight cutting covered later in this category.`,
    misunderstandings: `A common one: assuming rehydration fully and reliably undoes the effects of a hard weight cut by fight time. Recovery is variable and incomplete for many fighters, and a poorly managed cut can leave a fighter still meaningfully depleted even after a full rehydration window, which is a real performance and safety concern rather than a purely cosmetic one.`,
    takeaways: `Rehydration is the recovery half of the weight-cutting process, and how well, or how safely, it is managed is one of the central concerns driving the sport's ongoing debate over weight-cutting practices.`,
    related: [
      'what-is-weight-cutting',
      'natural-weight-vs-fight-weight',
      'why-extreme-weight-cutting-is-controversial',
    ],
  }),

  rulesetConcept({
    slug: 'same-day-vs-day-before-weigh-ins',
    title: 'Same-Day vs Day-Before Weigh-Ins',
    category: 'weight-cutting',
    aliases: ['same day weigh ins mma', 'why some weigh ins are on fight day'],
    summary:
      'A real regulatory trend toward weighing fighters closer to fight time, specifically to reduce the size of dangerous rehydration swings.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-weight-cutting' }],
    recognition: `Most fans are used to the day-before weigh-in format shown on broadcasts, but some events and commissions instead weigh fighters on the day of the fight itself, generally reported as a specific, deliberate policy choice for that event or promotion.`,
    explanation: `Historically, most major MMA promotions weighed fighters roughly a day before the event, giving them close to twenty-four hours to rehydrate and recover before competing. Some commissions and promotions have moved toward same-day weigh-ins, or weigh-ins held closer to fight time, specifically to reduce how much time, and therefore how much weight, a fighter can cut and then regain before stepping into the cage.`,
    example: `An event held under a same-day weigh-in policy checks fighters' weight only hours before they compete, rather than the day before, deliberately narrowing the window available for an extreme cut-and-rehydrate cycle compared to the traditional day-before format.`,
    whyItMatters: `This shift is a genuine, safety-motivated regulatory trend: shrinking the gap between the weigh-in and the fight directly limits how extreme a weight cut and subsequent rehydration swing can safely be, which is a large part of the stated rationale from commissions that have adopted it.`,
    misunderstandings: `A common one: assuming all major MMA promotions have moved to same-day weigh-ins, or that the traditional day-before format has disappeared. Both formats remain in active use across different promotions and commissions, and the shift toward same-day weigh-ins, where it has happened, has generally been partial and promotion- or commission-specific rather than sport-wide.`,
    related: [
      'weigh-ins-explained',
      'why-extreme-weight-cutting-is-controversial',
      'weight-cutting-and-fighter-safety',
    ],
  }),

  standard({
    slug: 'why-extreme-weight-cutting-is-controversial',
    title: 'Why Extreme Weight Cutting Is Controversial',
    category: 'weight-cutting',
    aliases: ['is weight cutting dangerous', 'weight cutting controversy mma'],
    summary:
      'The real, well-documented safety concerns around severe weight cuts, described at the level a sports article would.',
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-dehydration-swc' }, { key: 'wp-weight-cutting' }],
    explanation: `Extreme weight cutting, reducing body weight by a large amount in a short period before a weigh-in, is a well-documented safety concern in combat sports generally, MMA included. Severe dehydration, one of the main mechanisms behind a rapid cut, places real strain on the body and has been linked, across combat sports over the years, to serious medical complications during and after fight week, up to and including hospitalisations. This concern is a significant part of why commissions, promotions and medical bodies within the sport have paid increasing attention to weight-cutting practices in recent years.`,
    howItWorks: `The concern is not with weight loss generally, which is a normal part of any athlete's fight preparation, but specifically with the speed and severity of a cut undertaken purely to make a lower weigh-in number, often through significant fluid restriction and dehydration in the final days before a weigh-in. A fighter's body, and particularly organ function, can be placed under considerable stress by a sufficiently rapid and severe cut, and the physical toll does not necessarily end once the weigh-in itself is over, since a fighter still has to recover enough by fight night to compete safely.`,
    example: `A fighter attempting an unusually large cut in a short window experiences visible signs of severe depletion around the time of the weigh-in, prompting medical staff on site to monitor them closely, an outcome commissions and promotions have specifically cited as part of the case for tighter oversight of the weight-cutting process.`,
    whyItMatters: `This is one of the sport's most serious ongoing safety conversations, not a minor procedural detail: severe weight cutting has real, documented health risks, and the regulatory responses covered elsewhere in this category (stricter weigh-in monitoring, same-day weigh-ins, hydration testing) exist specifically because of this concern.`,
    misunderstandings: `A common one: assuming any weight cut at all is dangerous, or conversely, that the concern is overstated and weight cutting is inherently safe as long as a fighter makes weight successfully. The real concern is specifically with severe, rapid cuts and inadequate recovery, not with the practice of weight management in general, which is why the sport's response has focused on monitoring and timing rather than banning weight cuts outright.`,
    takeaways: `Extreme weight cutting carries genuine, well-documented health risk, which is exactly why the sport has moved toward the safeguards covered in "Weight Cutting and Fighter Safety," rather than treating severe cuts as a purely competitive matter.`,
    related: [
      'weight-cutting-and-fighter-safety',
      'rehydration-explained',
      'same-day-vs-day-before-weigh-ins',
    ],
  }),

  standard({
    slug: 'weight-cutting-and-fighter-safety',
    title: 'Weight Cutting and Fighter Safety',
    category: 'weight-cutting',
    aliases: ['fighter safety weight cutting', 'weight cutting regulations mma'],
    summary:
      'The safety apparatus commissions and promotions have built around weight cutting: monitoring, IV bans, and hydration testing.',
    isFeatured: true,
    difficulty: 'intermediate',
    sourceKeys: [{ key: 'wp-dehydration-swc' }, { key: 'wp-weight-cutting' }],
    explanation: `In response to the safety concerns covered in "Why Extreme Weight Cutting Is Controversial," athletic commissions and promotions have built a real set of safeguards around the weight-cutting process. These include medical monitoring at and around the weigh-in itself, restrictions on rehydration methods considered especially risky, and, in some jurisdictions, hydration testing intended to catch fighters who have cut to an unsafe degree.`,
    howItWorks: `Intravenous (IV) rehydration, receiving fluids directly into the bloodstream rather than by drinking, is banned in most jurisdictions that regulate the sport, specifically because it can be used to rapidly mask the effects of a severe cut without the body having actually recovered in a normal, safer way. Some commissions have also introduced hydration testing around the weigh-in, checking a fighter's urine specific gravity as a way of detecting severe dehydration beyond what a simple bodyweight number on a scale would show. On-site physicians and commission staff are present specifically to identify a fighter who appears to be in genuine medical distress from a cut, with the authority to intervene.`,
    example: `A commission that has adopted hydration testing checks a fighter's urine specific gravity alongside the standard bodyweight measurement at the weigh-in, giving officials a second, independent signal about how severely dehydrated that fighter actually is, beyond what the number on the scale alone would reveal.`,
    whyItMatters: `These safeguards exist because the sport has recognised extreme weight cutting as a real safety issue rather than a purely competitive one, and they represent the concrete regulatory response to that recognition, alongside the shift toward same-day weigh-ins covered elsewhere in this category.`,
    misunderstandings: `A common one: assuming weight cutting is unregulated or that commissions simply take a fighter's word for having made weight safely. Modern oversight includes specific tools, IV bans and hydration testing among them, aimed directly at catching and discouraging unsafe cuts, even though enforcement and adoption vary by jurisdiction.`,
    takeaways: `The sport has built a real, if still evolving, safety apparatus around weight cutting, including medical monitoring, IV bans in most jurisdictions, and hydration testing in some, all aimed at the same underlying concern: catching a cut before it becomes a genuine medical emergency.`,
    related: [
      'why-extreme-weight-cutting-is-controversial',
      'same-day-vs-day-before-weigh-ins',
      'rehydration-explained',
    ],
  }),
];

export const MMA_STRATEGY_WEIGHT_EXPLAINERS: ExplainerSeed[] = [
  ...FIGHT_STRATEGY,
  ...STYLE_MATCHUPS,
  ...WEIGHT_CLASSES,
  ...WEIGHT_CUTTING,
];
