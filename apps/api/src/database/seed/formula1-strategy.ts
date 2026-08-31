import type { ExplainerSeed, StrategyChartShape, TrackShape } from './explainer-types';
import {
  article,
  definition,
  procedure,
  rule,
  statistic,
  strategy,
} from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING } from './formula1-explainers';

/**
 * Race strategy and pit stops.
 *
 * Two of the brief's categories in one file, because they are one subject seen
 * from two ends. A pit stop is the mechanical event; strategy is the decision
 * about when to have one. Splitting them would put the pit window in a
 * different file from the undercut that exploits it.
 *
 * The brief lists `pit-window` under both. It is one row here, filed under pit
 * stops and reaching strategy through `alsoIn`, which is the same treatment
 * every other cross-listed concept in the library gets.
 *
 * ## On the arithmetic
 *
 * Every strategic concept in Formula 1 reduces to one comparison: the time lost
 * by pitting against the time lost by not pitting. The explainers here state
 * that comparison explicitly and repeatedly, with round illustrative numbers,
 * because a reader who has once seen the sum done believes the conclusion in a
 * way that no amount of assertion achieves.
 *
 * The numbers are introduced as illustrations, never as claims about a real
 * circuit. Pit loss varies from roughly sixteen seconds to over twenty-five
 * depending on the track, and a figure baked into prose would be wrong almost
 * everywhere.
 */

/** The undercut, drawn as the three laps that actually decide it. */
const UNDERCUT_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption:
    'The undercut. B pits first, gets fresh tyres a lap earlier, and uses that lap to make up the gap while A is still on worn rubber.',
  steps: [
    {
      caption:
        'Before. A leads B by about a second. B is close enough to be held up by dirty air but not close enough to pass on track.',
      note: 'Lap 18: A leads by 1.0s',
      cars: [
        { id: 'a', label: 'A', lap: 40, team: 'a' },
        { id: 'b', label: 'B', lap: 36, team: 'b', highlight: true },
      ],
    },
    {
      caption:
        'B pits at the end of lap 18 and rejoins on new tyres, some twenty seconds behind on the road. A stays out on worn tyres for one more lap.',
      note: 'Lap 19: B on new tyres, A on old',
      cars: [
        { id: 'a', label: 'A', lap: 45, team: 'a' },
        { id: 'b', label: 'B', lap: 8, team: 'b', highlight: true },
      ],
      markers: [{ lap: 96, label: 'B rejoins', kind: 'pit-exit' }],
    },
    {
      caption:
        'B is far quicker on fresh rubber than A is on old, and gains well over a second on this single lap. That gain is the undercut.',
      note: 'B gains ~1.5s on the out lap',
      cars: [
        { id: 'a', label: 'A', lap: 70, team: 'a' },
        { id: 'b', label: 'B', lap: 33, team: 'b', highlight: true },
      ],
    },
    {
      caption:
        'A pits at the end of lap 19. Because B gained more than the gap between them, A rejoins behind. The position changed without an overtake.',
      note: 'Lap 20: B now leads',
      cars: [
        { id: 'b', label: 'B', lap: 44, team: 'b', highlight: true },
        { id: 'a', label: 'A', lap: 40, team: 'a' },
      ],
    },
  ],
};

/** The overcut, which is the same picture with the roles reversed. */
const OVERCUT_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption:
    'The overcut. A pits first and loses time warming new tyres; B stays out in clear air and laps quickly enough to emerge ahead.',
  steps: [
    {
      caption:
        'A pits first, expecting an undercut. B stays out, and for the first time in the stint has clear air ahead.',
      note: 'Lap 22: A pits, B stays out',
      cars: [
        { id: 'b', label: 'B', lap: 30, team: 'b', highlight: true },
        { id: 'a', label: 'A', lap: 8, team: 'a' },
      ],
    },
    {
      caption:
        'A’s new tyres are cold and take a lap to work. B, in clear air on tyres that are worn but warm, laps quicker than A does.',
      note: 'B gains while A warms up',
      cars: [
        { id: 'b', label: 'B', lap: 60, team: 'b', highlight: true },
        { id: 'a', label: 'A', lap: 40, team: 'a' },
      ],
    },
    {
      caption:
        'B pits two laps later and rejoins ahead. The overcut worked because warm-up was slow and clear air was worth more than fresh rubber.',
      note: 'Lap 24: B rejoins in front',
      cars: [
        { id: 'b', label: 'B', lap: 45, team: 'b', highlight: true },
        { id: 'a', label: 'A', lap: 41, team: 'a' },
      ],
    },
  ],
};

/** One stop against two: the argument the two-stop explainer is making. */
const STOP_COMPARISON_TWO: StrategyChartShape = {
  strategy: 'stints',
  totalLaps: 57,
  caption:
    'The same race on two plans. The two-stop pays an extra pit loss and never runs on tyres past their best; the one-stop pays once and manages to the flag.',
  plans: [
    {
      label: 'One-stop',
      stints: [
        { compound: 'medium', fromLap: 1, toLap: 26, note: 'Managed' },
        { compound: 'hard', fromLap: 27, toLap: 57, note: '31 laps, heavily managed' },
      ],
      result: 'One pit loss, slow at the end',
    },
    {
      label: 'Two-stop',
      stints: [
        { compound: 'soft', fromLap: 1, toLap: 18, note: 'Pushing' },
        { compound: 'medium', fromLap: 19, toLap: 38, note: 'Pushing' },
        { compound: 'soft', fromLap: 39, toLap: 57, note: 'Fresh to the flag' },
      ],
      result: 'Two pit losses, quick throughout',
      highlight: true,
    },
  ],
};

/** An offset: same number of stops, different laps, different tyres at the end. */
const OFFSET_DIAGRAM: StrategyChartShape = {
  strategy: 'stints',
  totalLaps: 57,
  caption:
    'An offset. Both cars stop twice, but B stops later each time and finishes the race on tyres ten laps fresher than A’s.',
  plans: [
    {
      label: 'Car A',
      stints: [
        { compound: 'medium', fromLap: 1, toLap: 16 },
        { compound: 'hard', fromLap: 17, toLap: 36 },
        { compound: 'hard', fromLap: 37, toLap: 57, note: '21 laps old at the flag' },
      ],
      result: 'Track position early',
    },
    {
      label: 'Car B',
      stints: [
        { compound: 'medium', fromLap: 1, toLap: 26 },
        { compound: 'hard', fromLap: 27, toLap: 46 },
        { compound: 'soft', fromLap: 47, toLap: 57, note: 'Fresh for the final stint' },
      ],
      result: 'Tyre advantage at the end',
      highlight: true,
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * Strategy
 * ────────────────────────────────────────────────────────────────────────── */

const STRATEGY: ExplainerSeed[] = [
  strategy({
    slug: 'strategy-explained',
    title: 'F1 Strategy Explained',
    category: 'strategy',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 7,
    summary:
      'Every strategic decision in Formula 1 is the same comparison: what pitting costs against what not pitting costs.',
    oneSentence:
      'Race strategy is the problem of choosing when to make the compulsory pit stops, by weighing the fixed time lost in the pit lane against the accumulating time lost on degrading tyres.',
    howItWorks:
      '**The two quantities.** A pit stop costs a fixed amount of time, called the pit loss, typically around twenty seconds all-in. Staying out costs a growing amount, because a degrading tyre loses a fraction of a second every lap.\n\n**The comparison.** You pit when the accumulated cost of old tyres exceeds the one-off cost of new ones, adjusted for where you will rejoin.\n\n**Track position complicates it.** Rejoining behind a slower car can cost more than the tyres were losing, because you cannot overtake. This is why the theoretically fastest strategy is often not the one that wins.\n\n**Rivals complicate it further.** Strategy is played against opponents who are making the same calculation, so pitting a lap earlier to jump somebody (the undercut) or a lap later to stay ahead (the overcut) becomes the actual game.\n\n**Events reset everything.** A safety car makes a pit stop far cheaper, and rain makes tyre choice the only question that matters.',
    whenUsed:
      'Continuously. Teams arrive with a plan built on practice data, and revise it every lap as the race, the weather and their rivals develop.',
    advantages:
      'Strategy is how a slower car beats a faster one. A team that reads degradation better, or reacts to a safety car quicker, can win a race it had no pace to win, which is why the pit wall is a genuine competitive arena rather than an administrative one.',
    risks:
      'Every strategy is a commitment made on incomplete information. Pit for fresh tyres and a safety car arrives a lap later, and you have paid full price for something your rivals get almost free. The best available decision and the winning decision are frequently not the same.',
    example:
      'Take a pit loss of twenty seconds and a tyre degrading at a quarter of a second per lap. Staying out forty laps longer would cost ten seconds, so on those numbers a second stop is not worth it. Double the degradation to half a second a lap and the same forty laps cost twenty seconds, and now the extra stop pays for itself. Nothing changed except the tyre.',
    misunderstandings:
      '**"The fastest strategy always wins."** It does not, because it ignores traffic. A plan that is two seconds quicker on paper is worthless if it drops you behind a car you cannot pass.\n\n**"Teams should just react to what happens."** Reacting is a strategy too, and usually a losing one: the car that pits first controls the sequence, and the car that waits is answering rather than asking.',
    diagram: UNDERCUT_DIAGRAM,
    related: [
      'undercut',
      'overcut',
      'pit-window',
      'pit-loss',
      'tyre-degradation',
      'track-position-vs-fresh-tyres',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'one-stop-strategy',
    title: 'What Is a One-Stop Strategy?',
    category: 'strategy',
    order: 20,
    summary:
      'The minimum legal number of stops, and the plan that trades pace for time in the pit lane.',
    oneSentence:
      'A one-stop strategy makes the single pit stop the rules require, accepting longer stints on more degraded tyres in exchange for spending only one pit loss.',
    howItWorks:
      '**One stop, two stints.** The driver runs two long stints, using two different compounds to satisfy the mandatory rule.\n\n**Usually the harder compounds.** A one-stop needs tyres that survive, so the medium and hard are the typical pairing.\n\n**It requires management.** Stints are longer than the tyres would naturally last at full pace, so the driver must drive below the limit for much of the race.\n\n**It works where degradation is low.** On a circuit that is gentle on tyres, or where the pit loss is unusually large, one stop is often simply the fastest plan.',
    whenUsed:
      'Low degradation, high pit loss, cool conditions, or a track where overtaking is so hard that track position outweighs tyre condition.',
    advantages:
      'One pit loss instead of two, and track position held throughout. A driver on a one-stop who leads after the others have stopped twice may never have to pass anybody.',
    risks:
      'It is fragile. If degradation is worse than predicted, the driver is stranded on dying tyres with no answer, defenceless against cars on fresher rubber in the closing laps. A safety car that hands a two-stopping rival a cheap second stop can also ruin it outright.',
    example:
      'A driver on a one-stop leads the closing laps on tyres twenty-five laps old, defending from a rival on tyres ten laps old. The leader is slower every lap; the only question is whether the finish arrives before the rival does.',
    misunderstandings:
      '**"One stop is the conservative choice."** It is a different bet, not a safer one. It commits you to tyre performance you cannot verify in advance and cannot fix once you are wrong.',
    diagram: OFFSET_DIAGRAM,
    related: [
      'two-stop-strategy',
      'tyre-degradation',
      'extending-a-stint',
      'pit-loss',
      'mandatory-tyre-rules',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'two-stop-strategy',
    title: 'Two-Stop Strategy Explained',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 30,
    summary: 'Paying an extra pit loss to spend the whole race on tyres that actually work.',
    oneSentence:
      'A two-stop strategy accepts a second pit loss in exchange for three shorter stints, allowing the driver to push throughout rather than manage degrading tyres.',
    howItWorks:
      '**Two stops, three stints.** Shorter stints mean the tyres never reach the part of their life where they fall away sharply.\n\n**Softer compounds become viable.** With less distance to cover per stint, the quicker tyres can be used.\n\n**The driver can push.** This is the underrated part: a two-stopping driver is racing, not managing, and the pace difference against a car nursing old tyres can be substantial.\n\n**It needs somewhere to rejoin.** Two stops only work if the driver can pass the cars they rejoin among, or has enough of a gap not to rejoin among them at all.',
    whenUsed:
      'High degradation, hot conditions, a short pit loss, or when a driver has fallen behind and needs a different plan from the cars ahead.',
    advantages:
      'Genuine pace for the whole race, and flexibility. A two-stopper has a second stop still to come, which means a safety car or a rival’s mistake can be converted into a gain rather than merely survived.',
    risks:
      'Twenty seconds of extra pit loss is a large debt to repay with lap time alone, and it must be repaid while dealing with traffic. If the fresher tyres cannot be used because the driver is stuck behind a one-stopping car, the strategy has paid for an advantage it cannot spend.',
    example:
      'A two-stopping car is a second a lap quicker over the final stint but rejoins eight seconds behind a one-stopper on a circuit where passing is difficult. It closes the gap by lap fifty-five and then spends the last two laps in dirty air, finishing second having been faster all afternoon.',
    misunderstandings:
      '**"More stops means more risk."** More stops means more opportunities as well: each stop is a chance to react to what has happened, and a one-stopper has already spent its only card.',
    diagram: STOP_COMPARISON_TWO,
    related: ['one-stop-strategy', 'undercut', 'pit-loss', 'tyre-degradation', 'offset-strategy'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'undercut',
    title: 'Undercut Explained',
    category: 'strategy',
    isFeatured: true,
    difficulty: 'intermediate',
    order: 40,
    readMinutes: 6,
    summary: 'Pitting before the car ahead, and using fresh tyres to jump it without overtaking.',
    oneSentence:
      'An undercut is pitting a lap or more before the car ahead, so that the time gained on fresh tyres while the rival is still on worn ones is enough to emerge in front when they stop.',
    howItWorks:
      '**The setup.** Two cars, close together, the following one unable to pass on track because of dirty air.\n\n**The move.** The following car pits first and rejoins on new tyres, well behind on the road but lapping much faster.\n\n**The gain.** A new tyre can be worth well over a second a lap against a worn one. Over the one or two laps before the leading car also stops, that difference accumulates.\n\n**The result.** If the accumulated gain exceeds the gap that separated them, the car that pitted first comes out ahead once the other has stopped.\n\n**The arithmetic.** Both cars pay the same pit loss, so it cancels. All that matters is the lap-time difference during the laps when one is on new tyres and the other is not.',
    diagram: UNDERCUT_DIAGRAM,
    whenUsed:
      'When a driver is close behind a rival but cannot pass, when the tyre being fitted warms up quickly, and when the pit exit does not drop the car into heavy traffic.',
    advantages:
      'It converts proximity into a position without needing to overtake, which at circuits where passing is nearly impossible is the only realistic way of gaining a place on a car of similar pace.',
    risks:
      '**The rival can respond.** The car ahead usually has the option of pitting on the very next lap, which halves the advantage.\n\n**Traffic.** Rejoining behind slower cars can consume the entire gain in a single lap.\n\n**Warm-up.** If the new tyre takes two laps to reach temperature, the first of those laps may be slower than the worn tyre it replaced, and the undercut fails before it starts.\n\n**Committing early.** Pitting first means a longer final stint, so the undercut buys a position now and pays for it at the end of the race.',
    example:
      'Two cars are separated by a second. The following car pits and gains a second and a half on its out lap while the leader circulates on old tyres. The leader pits the next lap and rejoins half a second behind. No overtake occurred, and the order has changed.',
    misunderstandings:
      '**"The undercut always works."** Its power varies enormously by circuit and conditions. Where tyres warm slowly or the pit lane is long, it barely functions at all, and the overcut becomes the better move.\n\n**"It is a trick."** It is arithmetic. Both cars pay the same pit loss; the only variable is the lap-time difference during the overlap.',
    related: [
      'overcut',
      'undercut-power',
      'pit-window',
      'in-lap',
      'tyre-warm-up',
      'covering-a-rival',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'overcut',
    title: 'Overcut Explained',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 50,
    summary: 'Staying out longer than the car ahead, and using clear air to jump it instead.',
    oneSentence:
      'An overcut is delaying a pit stop until after a rival has taken theirs, using the clear air they leave behind to lap quickly enough to emerge ahead once you finally stop.',
    howItWorks:
      '**The setup.** The car ahead pits, either to undercut somebody else or because its tyres are finished.\n\n**The gain has two sources.** The car that stayed out now has clear air, and a car in clear air is quicker than one following closely. Meanwhile the car that pitted is on cold tyres, which for a lap or two may be no quicker than warm worn ones.\n\n**The move.** The remaining car pushes hard for those laps, then pits and rejoins ahead.\n\n**It is the undercut’s mirror.** The undercut exploits fresh tyres; the overcut exploits clear air and slow warm-up.',
    diagram: OVERCUT_DIAGRAM,
    whenUsed:
      'When tyres warm slowly, when degradation is low enough that old tyres are still competitive, when the track is cool, and when the car has been stuck in dirty air and will gain significantly from clear track.',
    advantages:
      'It requires no gamble on rejoining position, and it defeats an opponent who has already committed. A team that pits first has shown its hand; the overcut is the answer that costs nothing to attempt if the tyres hold on.',
    risks:
      'It depends entirely on the tyres lasting. If degradation is high, the extra laps are slow rather than fast and the driver loses time instead of gaining it. It also leaves the driver exposed to a safety car, which would strand them having not yet stopped.',
    example:
      'A driver has spent ten laps a second behind a rival, unable to pass. The rival pits. In clear air the driver immediately laps a second quicker than they had all stint, does that for two laps, pits, and rejoins in front.',
    misunderstandings:
      '**"The overcut is what you do when the undercut fails."** They suit different conditions. Cold tracks and slow-warming compounds favour the overcut from the start, and a team may plan one deliberately.',
    related: ['undercut', 'extending-a-stint', 'dirty-air', 'tyre-warm-up', 'pit-window'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'track-position-vs-fresh-tyres',
    title: 'Track Position vs Fresh Tyres',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 60,
    summary: 'The central trade of every race: being ahead now, or being quicker later.',
    oneSentence:
      'Almost every strategic decision reduces to choosing between holding position on worn tyres and giving up position for fresh ones, and which is right depends almost entirely on how easy the circuit is to overtake on.',
    howItWorks:
      '**Track position is worth more where passing is hard.** At a street circuit, a car ahead on dead tyres can hold up a much quicker car for the rest of the race.\n\n**Fresh tyres are worth more where passing is easy.** Where there are long straights and DRS zones, a car with a tyre advantage will get past, so giving up a place to gain pace is a good trade.\n\n**Dirty air tilts it further.** Following closely costs downforce and overheats tyres, so a car stuck behind another is not only unable to pass but degrading faster while it tries.\n\n**The pit loss sets the price.** A long pit lane makes track position more valuable, because regaining a lost place costs more time.',
    whenUsed:
      'Every time a team decides whether to respond to a rival’s pit stop, whether to pit under a safety car, and whether to extend a stint.',
    advantages:
      'Understanding this trade is what makes the rest of race strategy legible. It is why a leading team will sometimes deliberately leave a driver out on tyres that are visibly finished, and why that is a rational decision rather than an error.',
    risks:
      'Misjudging the circuit is expensive in both directions. Holding position at a track where passing is easy simply delays the inevitable while burning the tyres; surrendering it at a track where passing is impossible converts a lead into a loss.',
    example:
      'At a circuit with one long straight and a big DRS zone, a driver pits, loses two places, and repasses both within five laps on fresh tyres, finishing ahead of where they would have been. At a street circuit, the identical decision leaves them stuck in eighth to the flag.',
    misunderstandings:
      '**"Fresh tyres always win eventually."** Only if there is somewhere to use them. A tyre advantage with no overtaking opportunity is not an advantage, it is a statistic.',
    related: [
      'undercut',
      'dirty-air',
      'why-some-circuits-are-hard-to-overtake',
      'pit-loss',
      'covering-a-rival',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'extending-a-stint',
    title: 'Why Drivers Extend a Stint',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 70,
    summary:
      'Staying out longer than planned, to build an offset or to wait for something to happen.',
    oneSentence:
      'Extending a stint means running further on a set of tyres than the optimum, in order to gain an offset against rivals, to reach a more favourable moment to stop, or to wait for a safety car.',
    howItWorks:
      '**To create an offset.** Stopping later means finishing the race on tyres fresher than everyone else’s, which converts into pace exactly when it is needed.\n\n**To wait for an event.** A safety car makes a pit stop far cheaper. A driver who has not yet stopped gains hugely if one appears; a driver who has just stopped gains nothing.\n\n**To clear traffic.** Pitting into a queue of slower cars can cost more than the tyres are losing, so a team may wait for the road to clear.\n\n**To defeat an undercut.** Once a rival has pitted, staying out is how the overcut is executed.',
    whenUsed:
      'When degradation is lower than expected, when a safety car looks likely, when the pit exit leads into traffic, or when the driver needs a different plan from the cars around them.',
    advantages:
      'It preserves optionality. A driver who has not yet stopped still has a decision in hand, and in a race with variable weather or a high chance of a safety car that flexibility is worth real time.',
    risks:
      'Tyres do not degrade linearly. A stint extended past the cliff loses time very quickly, and a driver can shed several seconds a lap while the team is still waiting for the event that justifies the plan. Waiting for a safety car that never comes is one of the most common ways a good race is lost.',
    example:
      'A driver runs eight laps longer than their rivals, losing about half a second a lap on old tyres, then fits fresh softs for the final stint and recovers more than that against cars whose tyres are fading. The offset was built by accepting a known loss to buy a larger later gain.',
    misunderstandings:
      '**"They forgot to pit."** Extended stints are almost always deliberate, and the loss in the closing laps of the stint is a price the team has already accepted.',
    related: [
      'offset-strategy',
      'overcut',
      'tyre-degradation',
      'safety-car-strategy',
      'pit-window',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'offset-strategy',
    title: 'Offset Strategy Explained',
    category: 'strategy',
    difficulty: 'advanced',
    order: 80,
    summary:
      'Running the same number of stops as a rival, but on different laps, to hold a tyre advantage.',
    oneSentence:
      'An offset is a deliberate difference in stint timing between two cars, so that one arrives at the end of the race on significantly fresher tyres than the other.',
    howItWorks:
      '**Same stops, different laps.** Both cars stop twice, but one stops several laps later each time.\n\n**The advantage accumulates at the end.** The offset car finishes on tyres perhaps ten laps younger, which in the final stint is worth a substantial amount of lap time.\n\n**The cost comes first.** To build the offset, the car must run longer on old tyres in the earlier stints, and will usually lose position doing so.\n\n**It is a bet on the closing laps.** The plan only pays if the car can use its late pace, which means the track must allow overtaking or the gap must be small enough to close.',
    diagram: OFFSET_DIAGRAM,
    whenUsed:
      'When a car cannot beat a rival on equal tyres and needs a different shape of race, and at circuits where late-race pace can actually be converted into position.',
    advantages:
      'It manufactures a performance advantage from strategy alone. Two identical cars, driven identically, will finish in the order their tyre ages dictate if the offset is large enough.',
    risks:
      'The advantage arrives late and may arrive too late. An offset car that emerges eight seconds behind with six laps remaining has the pace to win and not the laps to do it. It is also vulnerable to a safety car, which erases any gap and hands the fresher tyres to everyone at once.',
    example:
      'Two team-mates split their strategies deliberately, one stopping early and one late, so that whatever the race throws up, one of the two cars is on the right plan. The team gives up the certainty of both cars being optimal for the guarantee that neither is badly wrong.',
    misunderstandings:
      '**"An offset is just stopping later."** Stopping later is the mechanism; the strategy is choosing an offset large enough to matter and small enough to survive the earlier stints.',
    related: [
      'extending-a-stint',
      'alternative-strategy',
      'two-stop-strategy',
      'undercut',
      'tyre-degradation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'alternative-strategy',
    title: 'Alternative Strategy Explained',
    category: 'strategy',
    difficulty: 'advanced',
    order: 90,
    summary:
      'Deliberately doing something different, because doing the same thing guarantees the same result.',
    oneSentence:
      'An alternative strategy is a deliberate departure from the optimal plan, taken by a car that cannot win by executing the same race as the cars ahead of it.',
    howItWorks:
      '**The logic is competitive, not absolute.** If a car is genuinely slower, running the best possible race finishes exactly where its pace says it should. Only a different plan produces a different answer.\n\n**Common forms.** Starting on a different compound, stopping once when everyone else stops twice, running very long or very short opening stints, or staying out during a safety car when everyone else pits.\n\n**It increases variance in both directions.** The purpose is to widen the distribution of outcomes, which necessarily includes worse ones.\n\n**It works best when something might happen.** Rain, a high chance of a safety car or a track that punishes tyres all raise the value of being on a different plan from the field.',
    whenUsed:
      'By cars starting out of position, by teams whose race pace is worse than their qualifying pace, and whenever conditions are uncertain enough that the standard plan might not be the right one.',
    advantages:
      'It is the only way for a slower car to beat a faster one without relying on the faster car making a mistake. It also puts pressure on rivals, who must now decide whether to cover a plan that may not work.',
    risks:
      'Most alternative strategies lose. That is inherent: the conventional plan is conventional because it is usually best, and choosing against it means accepting a lower expected result for a higher ceiling.',
    example:
      'A car qualifying eleventh starts on a different compound from the top ten, runs a long first stint, and inherits track position when the leaders stop. Whether it holds that position depends on tyre life, but it has at least placed itself somewhere the conventional plan could never have reached.',
    misunderstandings:
      '**"The team got it wrong."** A losing alternative strategy is often a correct decision with a bad outcome. Judging strategy by results alone systematically punishes teams for taking the only chances available to them.',
    related: [
      'offset-strategy',
      'tyre-gamble',
      'why-strategy-changes-mid-race',
      'safety-car-strategy',
      'strategy-simulation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'covering-a-rival',
    title: 'Covering a Rival Explained',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 100,
    summary: 'Pitting in response to a rival, to deny them the advantage rather than to gain one.',
    oneSentence:
      'Covering means pitting on the lap after a rival does, specifically to neutralise their undercut, even when a different lap would have been better in isolation.',
    howItWorks:
      '**The trigger.** A rival within undercut range pits.\n\n**The response.** The car ahead pits on the very next lap, limiting the rival to a single lap of fresh-tyre advantage rather than two or three.\n\n**It is defensive.** Covering rarely produces the best possible outcome for the covering car; it produces the best outcome available given that the rival has already committed.\n\n**It costs something.** Being forced to stop early means a longer final stint, so a driver who covers has accepted worse tyres at the end in exchange for keeping the position now.',
    whenUsed:
      'When a rival is close enough that an unanswered undercut would cost the position, and when losing that position matters more than the tyre disadvantage it creates later.',
    advantages:
      'It removes the opponent’s initiative. A rival who pits expecting to gain a place and gains nothing has spent their move and must now find another.',
    risks:
      'Covering can be induced. A team may pit its second car specifically to draw a rival into stopping earlier than they wanted, damaging their race without any intention of benefiting the car that made the move. Reacting to every stop also means never running your own race.',
    example:
      'The leader is told a rival has pitted and comes in immediately, one lap earlier than planned. They keep the position and finish the race on tyres five laps older than they wanted, defending for the final ten laps rather than controlling the race.',
    misunderstandings:
      '**"Covering is always right."** It is right when the position is worth more than the tyre life it costs. Against a rival who is not a genuine threat for the championship or the result, covering can be an expensive reflex.',
    related: [
      'undercut',
      'why-teammates-pit-together',
      'pit-window',
      'team-orders',
      'track-position-vs-fresh-tyres',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'safety-car-strategy',
    title: 'Safety Car Pit Strategy',
    category: 'strategy',
    alsoIn: ['flags-and-safety-car'],
    difficulty: 'advanced',
    order: 110,
    summary: 'Why a safety car makes a pit stop cheap, and why that rewrites the race instantly.',
    oneSentence:
      'A safety car slows the whole field, so the time lost by pitting shrinks dramatically, and a stop that would have cost twenty seconds may cost less than half that.',
    howItWorks:
      '**The pit loss collapses.** Pit loss is time lost relative to the cars on track. When those cars are circulating slowly behind a safety car, the gap you lose by pitting is much smaller.\n\n**The saving is roughly halved or better.** A driver who has not yet stopped can effectively get a free pit stop.\n\n**Gaps disappear.** The field bunches up, so a leader’s carefully built advantage is erased at the same moment.\n\n**Timing is brutal.** The advantage goes to whoever has not yet pitted when the safety car is deployed. A driver who stopped one lap earlier has paid full price for what their rival gets at a discount.\n\n**The pit lane can be crowded.** Everyone wants the same cheap stop, so double stacking and queueing become real problems.',
    whenUsed:
      'The decision is made in seconds, the moment a safety car is called, and often before the team knows how long the intervention will last.',
    advantages:
      'It is the single largest strategic opportunity in a race. A car running out of position can gain several places without passing anybody, and a one-stop that was failing can be converted into a two-stop at almost no cost.',
    risks:
      '**The gamble is symmetrical.** Pitting is right only if the cars behind you do not, and staying out is right only if you can defend on old tyres at the restart.\n\n**The restart is dangerous.** Everyone bunches together on tyres at different ages and temperatures, which is where safety car periods most often produce accidents.\n\n**Luck dominates.** A driver can lose a race they had controlled entirely because a safety car appeared on the wrong lap for them, and no decision they made was wrong.',
    example:
      'A leader pits on lap 30. A safety car is deployed on lap 31. Every car behind them pits at half the usual cost and rejoins with fresh tyres, and the leader’s advantage is gone through no error of their own.',
    misunderstandings:
      '**"Everyone should pit under a safety car."** If everyone pits, nobody gains, and the cars at the back of the queue lose time in a crowded pit lane. Some teams deliberately stay out to gain track position, betting they can defend at the restart.',
    related: [
      'vsc-strategy',
      'safety-car',
      'double-stacking',
      'pit-loss',
      'safety-car-restart',
      'why-safety-cars-close-the-field',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'vsc-strategy',
    title: 'Virtual Safety Car Strategy',
    category: 'strategy',
    alsoIn: ['flags-and-safety-car'],
    difficulty: 'advanced',
    order: 120,
    summary:
      'A cheaper pit stop without the bunching, which makes it a different calculation entirely.',
    oneSentence:
      'A virtual safety car slows every car by a fixed proportion while keeping the gaps between them, so a pit stop becomes cheaper without the field closing up.',
    howItWorks:
      '**Everyone slows proportionally.** Drivers must stay above a delta time, so relative gaps are preserved.\n\n**The pit loss shrinks.** The cars on track are slower, so the time lost by pitting falls, typically by a smaller amount than under a full safety car but with none of the downside.\n\n**Gaps survive.** A leader keeps their advantage, which is the crucial difference from a full safety car.\n\n**It can end abruptly.** A VSC may be withdrawn with little warning, and a car that has committed to the pit lane when it ends is exposed.',
    whenUsed:
      'Whenever a VSC is deployed and a driver is anywhere near their pit window. The decision is usually pre-computed, so teams already know whether stopping under a VSC is worth it before one appears.',
    advantages:
      'It is the cleanest strategic gift in the sport: a discounted pit stop that costs nothing in track position. A leader who pits under a VSC and keeps their lead has effectively been given several seconds.',
    risks:
      'The saving is smaller than a full safety car, so it may not be enough to change the plan. If the VSC ends while the car is in the pit lane, the discount evaporates and the stop is paid at close to full price.',
    example:
      'A leader with a fifteen-second advantage pits under a VSC. The stop costs perhaps ten seconds rather than twenty, and they rejoin still in front. Without the VSC, the same stop would have cost them the lead.',
    misunderstandings:
      '**"A VSC and a safety car are strategically the same."** They are opposites in the way that matters most. A safety car destroys gaps and helps whoever is behind; a VSC preserves gaps and helps whoever is in front.',
    related: [
      'safety-car-strategy',
      'virtual-safety-car',
      'safety-car-vs-vsc',
      'delta-time',
      'pit-loss',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'weather-strategy',
    title: 'Weather Strategy',
    category: 'strategy',
    alsoIn: ['weather'],
    difficulty: 'advanced',
    order: 130,
    summary: 'When rain is involved, tyre choice stops being an optimisation and becomes a bet.',
    oneSentence:
      'Weather strategy is the problem of choosing tyres for conditions that are changing, where being one lap early or late can be worth thirty seconds rather than three.',
    howItWorks:
      '**The stakes change scale.** In the dry, a strategic error costs a few seconds. In changing conditions, the wrong tyre costs many seconds every lap.\n\n**The crossover point is the decision.** There is a moment when intermediates become quicker than wets, and later when slicks become quicker than intermediates. Finding it first is worth an enormous amount.\n\n**Information is poor.** Radar shows where rain is, not precisely when it will reach a specific corner or how heavy it will be there.\n\n**Track position is worth more.** In poor visibility and low grip, overtaking becomes harder, so being ahead matters more than usual.\n\n**The mandatory compound rule lapses** once wet-weather tyres are used, which removes one constraint entirely.',
    whenUsed:
      'Whenever rain is forecast, falling or drying, which is more often than a dry-weather calendar suggests.',
    advantages:
      'It is the largest source of unexpected results in Formula 1. A team that calls the crossover a lap before its rivals can move a car from tenth to the lead without any change in pace.',
    risks:
      'The variance runs both ways and cannot be hedged. Fitting slicks one lap too early on a wet track can mean a spin, a lost lap or a retirement, and the same decision one lap later would have won the race.',
    example:
      'Rain begins to fall lightly. One team pits immediately for intermediates and loses fifteen seconds while the track is still quick on slicks. Two laps later the rain intensifies and every other car pits, rejoining behind the team that guessed first. The gamble looked wrong for two laps and decided the afternoon.',
    misunderstandings:
      '**"Teams have accurate forecasts."** They have better data than the viewer, and it is still not enough. Local convective rain at a circuit is genuinely difficult to predict at the resolution a pit stop decision requires.',
    related: [
      'crossover-point',
      'tyre-gamble',
      'slicks-vs-intermediates',
      'track-drying',
      'how-rain-changes-f1',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'tyre-gamble',
    title: 'Tyre Gamble Explained',
    category: 'strategy',
    difficulty: 'advanced',
    order: 140,
    summary: 'A deliberate bet on conditions or events, taken because the safe plan cannot win.',
    oneSentence:
      'A tyre gamble is a strategy call made on a prediction that may be wrong, accepted because the expected outcome of the conventional plan is worse than the chance the gamble offers.',
    howItWorks:
      '**It is a decision under uncertainty, not a guess.** Teams estimate probabilities: the chance of rain, of a safety car, of a rival’s tyres failing.\n\n**The comparison is of distributions.** The conventional plan might reliably produce sixth place. The gamble might produce first with a modest probability and twelfth otherwise. If sixth is not worth much, the gamble is correct even though it usually loses.\n\n**Position dictates appetite.** A car leading a championship takes fewer risks than one that needs a result.\n\n**It must be committed to.** Half-measures in strategy generally produce the downside of both plans.',
    whenUsed:
      'When rain is possible, when a safety car looks likely, when a car is out of position, and near the end of a season when a championship needs a specific result rather than a good one.',
    advantages:
      'It is how races are won from nowhere. Almost every famous unexpected victory in the sport involved somebody taking a call that the field considered wrong at the time.',
    risks:
      'The gamble usually fails, by construction. A team that gambles frequently will have a worse average result and a better best result, and which of those matters depends on what they are racing for.',
    example:
      'A car running seventh stays out on slicks as light rain begins, betting the shower passes. If it does, they lead. If it does not, they fall to the back. There is no version of this decision that is safe, which is precisely why the team took it from seventh rather than from second.',
    misunderstandings:
      '**"Good teams do not gamble."** Good teams gamble when the arithmetic says to. Refusing to gamble from a position where the conventional plan cannot win is not caution, it is a guaranteed loss.',
    related: [
      'weather-strategy',
      'alternative-strategy',
      'crossover-point',
      'strategy-simulation',
      'safety-car-strategy',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'how-teams-predict-strategy',
    title: 'How Teams Predict Race Strategy',
    category: 'strategy',
    alsoIn: ['analysis'],
    difficulty: 'advanced',
    order: 150,
    summary:
      'Thousands of simulated races, updated live, producing a recommendation rather than an answer.',
    oneSentence:
      'Teams run Monte Carlo simulations of the race, thousands of times, with varying assumptions about degradation, safety cars and rivals, and use the distribution of outcomes to choose between plans.',
    explanation:
      'A modern strategy department does not compute the single best plan. It computes the distribution of outcomes for each candidate plan, then chooses on the basis of what the team is trying to achieve.\n\nThe model is built before the weekend from historical data and simulation, refined with Friday’s degradation measurements, and updated continuously during the race with actual lap times.',
    howItWorks:
      '**Inputs.** Degradation rates per compound, pit loss for this circuit, overtaking difficulty, fuel effect, safety car probability, and rivals’ likely plans.\n\n**Simulation.** The race is run thousands of times with these quantities varied within their uncertainty, producing a spread of finishing positions for each strategy.\n\n**Live updating.** Every lap of real data narrows the uncertainty. A degradation estimate that was a guess at lap one is a measurement by lap fifteen.\n\n**The human decision.** The model produces probabilities; a strategist decides. That gap is where judgement about rivals, weather and risk appetite lives.',
    example:
      'A model reports that a two-stop finishes ahead of a one-stop in sixty per cent of simulations, but that the one-stop wins the race outright in eight per cent while the two-stop never does. A team fighting for a championship position takes the two-stop; a team needing a headline result takes the one-stop.',
    whyItMatters:
      'It explains why teams appear certain about decisions that turn out badly. The recommendation was correct in expectation and the race delivered one sample from a distribution, which is a different thing from a mistake.',
    misunderstandings:
      '**"The computer decides."** The model quantifies; the strategist chooses. Most of the interesting decisions concern things the model handles poorly, such as what a specific rival is likely to do.\n\n**"They should have known."** Safety car timing and local rain are genuinely unpredictable at the resolution required, and no amount of computing power changes that.',
    related: [
      'strategy-simulation',
      'degradation-curves',
      'expected-race-position',
      'alternative-strategy',
      'why-practice-matters',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'why-strategy-changes-mid-race',
    title: 'Why Teams Change Strategy Mid-Race',
    category: 'strategy',
    difficulty: 'intermediate',
    order: 160,
    summary: 'Because the plan was built on estimates, and the race supplies facts.',
    oneSentence:
      'Teams revise strategy during a race because degradation, weather, safety cars and rivals’ decisions all turn out differently from the assumptions the pre-race plan was built on.',
    howItWorks:
      '**Degradation is measured, not assumed.** The pre-race estimate comes from Friday, on a different fuel load and a different track state. Real race data replaces it within a few laps.\n\n**Rivals act.** A plan that assumed a rival would stop on lap 20 needs revising when they stop on lap 15.\n\n**Events intervene.** Safety cars, virtual safety cars, red flags and rain each reset the calculation entirely.\n\n**Damage and problems.** A floor damaged at the start, a slow puncture or an overheating power unit all change what the car is capable of.\n\n**The plan is a starting point.** Teams arrive with several viable plans and a decision tree for switching between them, rather than with one plan they intend to follow.',
    whenUsed: 'Constantly. The strategy is recomputed every lap of every race.',
    advantages:
      'Flexibility is worth more than optimality. A team that can switch plans cleanly when a safety car appears will beat a team with a better plan that it cannot abandon.',
    risks:
      'Changing plans has costs. A driver told to switch from managing tyres to pushing has already spent laps managing, and a decision reversed twice usually produces the worst of both.',
    example:
      'A team plans a one-stop. By lap ten the tyres are degrading faster than Friday suggested, and the model now favours two stops. They switch, and the driver who had been managing pace is told to push, because the tyres no longer need to last.',
    misunderstandings:
      '**"They abandoned the plan."** There was rarely a single plan. Teams carry several and select between them as information arrives, which is what makes the pit wall a decision-making role rather than an administrative one.',
    related: [
      'how-teams-predict-strategy',
      'safety-car-strategy',
      'weather-strategy',
      'tyre-degradation',
      'how-teams-decide-in-a-race',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Pit stops
 * ────────────────────────────────────────────────────────────────────────── */

const PIT_STOPS: ExplainerSeed[] = [
  procedure({
    slug: 'pit-stops-explained',
    title: 'F1 Pit Stops Explained',
    category: 'pit-stops',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary:
      'Twenty people, four tyres, about two and a half seconds, and roughly twenty seconds lost.',
    oneSentence:
      'A Formula 1 pit stop replaces all four tyres in around two and a half seconds of stationary time, though the full cost to the driver, including the slow laps in and out of the pit lane, is closer to twenty.',
    theProcedure:
      '**The call.** The team tells the driver to pit, usually a lap ahead so they can prepare.\n\n**The in lap.** Driven flat out, because there is nothing left to preserve.\n\n**Pit entry.** The driver crosses the line into the pit lane and engages the speed limiter.\n\n**The stop.** The car halts on its marks. Front and rear jacks lift it, three people per corner remove and replace each wheel, and the jacks drop.\n\n**The release.** A light or a signal tells the driver to go, given only when all four wheels are secured and the pit lane is clear.\n\n**Pit exit.** The driver accelerates to the end of the pit lane, releases the limiter, and rejoins on cold tyres.',
    whenItHappens:
      'At least once per dry race, because two compounds must be used. More often if strategy or damage requires it.',
    whyItMatters:
      'The pit stop is the fixed cost that every strategic decision is measured against. Its size, roughly twenty seconds at a typical circuit, is what makes tyre degradation matter: if stopping were free, everybody would stop constantly, and if it were impossible, nobody would think about tyres at all.',
    strategic:
      'The stationary time is the part everybody watches and the smallest part of the cost. Most of the loss is in the pit lane speed limit and the slow entry and exit, which is why a circuit with a long pit lane changes the strategic character of the whole race.',
    misunderstandings:
      '**"A pit stop costs two seconds."** Two seconds is the stationary time. The cost to the race is the total pit loss, which is around ten times that.\n\n**"They refuel."** Refuelling during a race has not been permitted for many years. Cars start with all their fuel, which is why they are so much heavier and slower at the beginning of a race.',
    related: [
      'pit-loss',
      'how-a-tyre-change-works',
      'pit-lane',
      'why-pit-stops-are-fast',
      'pit-window',
      'in-lap',
    ],
    era: 'Refuelling was permitted in earlier eras and is not now, which changed pit stops and race strategy fundamentally. Everything described here applies to the current, tyres-only stop.',
    ...SPORTING,
  }),

  article({
    slug: 'why-cars-pit',
    title: 'Why F1 Cars Pit',
    category: 'pit-stops',
    order: 20,
    summary: 'Three reasons: the tyres, the rules, and things going wrong.',
    oneSentence:
      'Cars pit because tyres degrade and must be replaced, because the rules require at least two compounds in a dry race, and because damage, penalties and changing weather all force unscheduled stops.',
    explanation:
      'The everyday reason is tyres. A Formula 1 tyre cannot last a race distance at competitive pace, so replacing it is faster than not replacing it once enough laps have passed.\n\nThe formal reason is the regulations. Even if a tyre could last, a dry race requires two different compounds, which makes at least one stop compulsory.\n\nThe unplanned reasons are damage, punctures, weather changes and penalties served in the pit lane.',
    howItWorks:
      '**Scheduled stops** are planned before the race and adjusted during it, timed to the pit window.\n\n**Reactive stops** respond to a rival, most often to cover an undercut.\n\n**Forced stops** follow a puncture, front wing damage, a flat spot severe enough to cause vibration, or a change in conditions requiring different tyres.\n\n**Penalty stops** are drive-throughs and stop-gos, which are served in the pit lane and are not tyre changes at all.',
    example:
      'A driver picks up debris and suffers a slow puncture on lap eight. They must pit immediately, twenty laps before their planned window, which means an extra stop later and a race spent recovering.',
    whyItMatters:
      'Distinguishing the three kinds explains most of what looks confusing in a race broadcast. A car pitting on an unexpected lap has usually either reacted to a rival or been forced by something the camera did not show.',
    misunderstandings:
      '**"They pit when the tyres are worn out."** They pit when continuing costs more than stopping, which is usually well before the tyre is physically finished.',
    related: [
      'pit-stops-explained',
      'mandatory-tyre-rules',
      'tyre-degradation',
      'pit-window',
      'drive-through-penalty',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'how-a-tyre-change-works',
    title: 'How a Tyre Change Works',
    category: 'pit-stops',
    order: 30,
    summary: 'Four wheels, twelve people, one gun per corner, and everything happening at once.',
    oneSentence:
      'Each corner of the car is handled by three people, one to remove the wheel nut, one to take the old wheel off and one to fit the new one, and all four corners work simultaneously.',
    theProcedure:
      '**The car stops on its marks.** Stopping accurately matters: a car half a metre out of position costs the crew time reaching it.\n\n**Jacks lift the car.** One person at the front, one at the rear, each raising an end of the car the instant it stops.\n\n**Wheel guns loosen the nut.** A single central nut holds each wheel. The gun is pre-set to the correct torque.\n\n**Off and on.** One person pulls the old wheel clear, another pushes the new one on, and the gun operator tightens the nut.\n\n**Confirmation.** Each corner signals when it is secure. Only when all four have confirmed does the release signal come.\n\n**The car drops and goes.** Jacks release, and the driver is signalled away.',
    whenItHappens: 'At every pit stop that is not a penalty stop.',
    whyItMatters:
      'The choreography is why the stop takes two seconds rather than twenty. Nothing is sequential: every corner works in parallel, and the limiting factor is the slowest corner rather than the sum of the four.',
    strategic:
      'Consistency matters more than peak speed. A team whose stops are reliably two and a half seconds is better off than one that manages two seconds most of the time and five seconds occasionally, because strategy is planned on the expected stop and a slow one can cost a position that a fast one would never have gained.',
    misunderstandings:
      '**"The fastest stop wins."** The difference between a good stop and a great one is a few tenths. The difference between a good stop and a bad one is several seconds, so avoiding disasters matters far more than chasing records.',
    related: [
      'pit-crew-roles',
      'why-pit-stops-are-fast',
      'pit-stop-errors',
      'unsafe-release',
      'pit-stops-explained',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-pit-stops-are-fast',
    title: 'Why Pit Stops Are So Fast',
    category: 'pit-stops',
    order: 40,
    summary: 'Parallel work, purpose-built equipment, and a great deal of rehearsal.',
    oneSentence:
      'Pit stops are fast because every task happens simultaneously rather than in sequence, the equipment is designed for this single job, and the crew rehearses the choreography hundreds of times.',
    explanation:
      'There is no single trick. The speed comes from removing every source of delay at once.\n\nA road car wheel change is slow because one person does four wheels in turn, with several bolts each, using general-purpose tools. A Formula 1 stop inverts all of that: twelve people work in parallel, each wheel has one nut, and the tools exist only for this.',
    howItWorks:
      '**Parallelism.** All four corners are worked simultaneously, so the stop takes as long as one corner rather than four.\n\n**A single central nut.** One fastener per wheel instead of several.\n\n**Purpose-built guns.** Pneumatic tools pre-set to the correct torque, which loosen and tighten in a fraction of a second.\n\n**Rehearsal.** Crews practise repeatedly, and the choreography is analysed frame by frame in the same way a driver’s lap is.\n\n**Automation of the decision.** Sensors confirm each wheel is secure and feed a release system, so the go signal does not depend on a person judging four things at once.',
    example:
      'The stationary time is shorter than the time it takes to read this sentence. In that window, twenty people have completed a coordinated sequence in which any one of them being a tenth late delays the whole thing.',
    whyItMatters:
      'The speed is what makes strategy interesting. If a stop took thirty seconds of stationary time, the pit loss would dwarf any tyre advantage and races would settle into single stops decided at the start. The two-second stop is what keeps the undercut viable.',
    misunderstandings:
      '**"It is mostly the equipment."** The equipment removes the obvious obstacles. What separates teams is consistency under pressure, which comes from rehearsal and from a release system that refuses to let a car go before it is safe.',
    related: [
      'how-a-tyre-change-works',
      'pit-crew-roles',
      'pit-stop-errors',
      'pit-loss',
      'unsafe-release',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'pit-lane',
    title: 'Pit Lane Explained',
    category: 'pit-stops',
    order: 60,
    summary: 'The road alongside the track where teams work, governed by its own rules.',
    explanation:
      'The pit lane runs parallel to the main straight, in front of the garages. It has a speed limit, a fixed entry and exit, and rules about where cars and people may be.\n\nIt is divided into a fast lane, which cars drive along, and the working area in front of each garage, where stops take place. Crossing between them without clearance is how most pit lane incidents happen.',
    example:
      'A car released from its box into the path of another travelling down the fast lane is an unsafe release, and is penalised regardless of whether contact occurs.',
    whyItMatters:
      'The pit lane is the most crowded and most dangerous place at a Grand Prix, with cars, equipment and people in close proximity. Nearly every rule governing it exists because of an accident that happened before the rule did.',
    misunderstandings:
      '**"The pit lane is neutral ground."** It is part of the race. Time lost there counts exactly as much as time lost on track, and penalties apply within it as they do anywhere else.',
    related: ['pit-entry', 'pit-exit', 'pit-lane-speed-limit', 'unsafe-release', 'pit-loss'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'pit-entry',
    title: 'Pit Entry Explained',
    category: 'pit-stops',
    difficulty: 'intermediate',
    order: 70,
    summary: 'Where the pit lane begins, and where a large part of the pit loss is incurred.',
    explanation:
      'Pit entry is the point at which a car leaves the track and enters the pit lane. A line marks the boundary, and crossing it commits the driver: they must complete the stop.\n\nThe entry is where the driver first slows below racing speed and engages the limiter, and at many circuits the approach requires lifting well before the line, which is a substantial part of the time lost.',
    example:
      'At a circuit where the pit entry begins before the final corner, a driver committing to the pit lane gives up several seconds relative to a car taking that corner at racing speed. That is time lost before the pit lane speed limit has even applied.',
    whyItMatters:
      'Pit entry geometry is one of the main reasons pit loss varies so much between circuits, and therefore why the same strategy can be right at one track and wrong at another.',
    misunderstandings:
      '**"Crossing the line is optional until you reach the garage."** It is not. Once a car has crossed the pit entry line it must go through the pit lane, and rejoining the track is an infringement.',
    related: ['pit-exit', 'pit-lane', 'pit-loss', 'pit-lane-speed-limit', 'in-lap'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'pit-exit',
    title: 'Pit Exit Explained',
    category: 'pit-stops',
    difficulty: 'intermediate',
    order: 80,
    summary: 'Where cars rejoin the track, on cold tyres and often into traffic.',
    explanation:
      'Pit exit is where the pit lane rejoins the circuit. A white line separates the two, and drivers must stay on the pit lane side of it until it ends. Crossing it is an infringement even if no other car is affected.\n\nRejoining is a vulnerable moment: the tyres are cold, the driver is at low speed, and cars already on track arrive at full racing pace.',
    example:
      'A driver rejoins just ahead of a rival who is at full speed on warm tyres. Over the next corner or two the rival is far quicker, and the position gained in the pit lane is lost immediately.',
    whyItMatters:
      'Where the pit exit rejoins determines how much of an undercut survives. An exit onto a long straight lets a rejoining car build speed; an exit into a corner sequence leaves them defenceless on cold tyres.',
    misunderstandings:
      '**"The white line is advisory."** It is not. Crossing it at the pit exit is a standard infringement, and drivers are penalised for it regularly.',
    related: ['pit-entry', 'pit-lane', 'unsafe-release', 'tyre-warm-up', 'white-line-rules'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'pit-lane-speed-limit',
    title: 'Pit Lane Speed Limit',
    category: 'pit-stops',
    alsoIn: ['rules-and-penalties'],
    order: 90,
    summary:
      'A hard limit enforced by the car itself, and the largest single component of pit loss.',
    oneSentence:
      'Cars must not exceed a set speed in the pit lane, typically 80 km/h, enforced by a limiter the driver engages and policed by timing beams.',
    howItWorks:
      '**The limiter.** A button in the cockpit caps the car’s speed electronically. Drivers engage it before the pit entry line and release it at pit exit.\n\n**The limit varies.** It is usually 80 km/h, and can be lower at circuits where the pit lane is narrow or particularly busy.\n\n**Enforcement is automatic.** Timing beams measure speed through the pit lane, so exceeding the limit is detected rather than judged.\n\n**The penalty is fixed.** Speeding in the pit lane during a race draws a time penalty; in practice or qualifying it draws a fine.',
    example:
      'Travelling the length of a pit lane at 80 km/h rather than racing speed is where most of a pit stop’s twenty-second cost comes from. The two seconds spent stationary is a small part of the total.',
    whyItMatters:
      'The limit exists because the pit lane is full of people. It is also the reason pit loss is what it is, and therefore the reason race strategy has the shape it does: a faster limit would make stopping cheaper and races would be run quite differently.',
    strategic:
      'Because the limit is fixed and the pit lane length is not, pit loss varies by circuit from around sixteen seconds to over twenty-five. Teams recompute every strategic threshold for each track from that single number.',
    misunderstandings:
      '**"Drivers judge the speed themselves."** They use a limiter. Speeding penalties almost always come from engaging it late or releasing it early, not from misjudging speed.',
    related: ['pit-loss', 'pit-lane', 'pit-lane-speeding', 'pit-entry', 'pit-exit'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'double-stacking',
    title: 'Double Stacking Explained',
    category: 'pit-stops',
    alsoIn: ['strategy'],
    difficulty: 'advanced',
    order: 120,
    summary: 'Pitting both cars on the same lap, with the second waiting behind the first.',
    oneSentence:
      'Double stacking is bringing both of a team’s cars into the pit lane on the same lap, so the second must wait for the first to be released before its own stop can begin.',
    howItWorks:
      '**One crew, one box.** A team has one pit box and one crew, so the cars must be serviced in sequence.\n\n**The second car waits.** It stops behind the first and loses roughly the duration of the first stop on top of its own.\n\n**Usually forced.** Teams double stack when an event, most often a safety car, makes stopping so advantageous that taking the penalty on the second car is still better than leaving it out.\n\n**Preparation matters.** Crews rehearse it, because the changeover between two cars in the same box is where it goes wrong.',
    whenUsed:
      'Almost always under a safety car or virtual safety car, when the discount on the pit stop is large enough to absorb the extra delay for the second car.',
    advantages:
      'Both cars get a cheap stop. If the alternative is leaving one car out on old tyres while the entire field pits at half price, losing two or three seconds on the second car is clearly the better outcome.',
    risks:
      'The second car is stationary for far longer than usual and can lose several positions. If the first stop goes wrong, the second car is trapped behind it with no way to recover, and a single error costs both cars at once.',
    example:
      'A safety car appears and a team brings both cars in. The lead car is stationary for two and a half seconds; the second waits behind it and is stationary for six. It still gains relative to staying out, because every rival is pitting too.',
    misunderstandings:
      '**"They should have split the stops."** Splitting means one car pits a lap later, by which time the safety car discount may have gone. The choice is usually between a poor stop now and a full-price stop later.',
    related: [
      'safety-car-strategy',
      'why-teammates-pit-together',
      'pit-loss',
      'safety-car',
      'pit-stop-errors',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'why-teammates-pit-together',
    title: 'Why Teammates Sometimes Pit Together',
    category: 'pit-stops',
    difficulty: 'advanced',
    order: 130,
    summary:
      'Because the alternative is leaving one car exposed, even though stacking costs it time.',
    oneSentence:
      'Teams pit both cars on the same lap when an external event makes the stop cheap for everyone, so that the cost of stacking the second car is smaller than the cost of leaving it out.',
    howItWorks:
      '**The trigger is usually shared.** A safety car, a sudden shower or a rival’s move affects both cars at once, so the right answer for one is often the right answer for the other.\n\n**Leaving one out is a real option.** If the second car is in clear air and not under threat, splitting the stops avoids the stacking penalty.\n\n**Team priority decides ties.** Where both cars want the same lap, the car in the better position or the one fighting for the championship is usually served first.\n\n**It can be a defensive move.** A team may also pit its second car specifically to draw a rival team into reacting.',
    whenUsed:
      'Under safety cars, in changing weather, and when a rival team’s stop forces a response from both cars simultaneously.',
    advantages:
      'It protects both cars from an event that would otherwise disadvantage one of them badly. In the constructors’ championship, where both cars score, that symmetry matters more than it does for either driver individually.',
    risks:
      'The second driver pays a real cost and may lose positions to cars they were racing. Handled badly, it becomes a source of genuine friction between team-mates, because one of them is always the car that waits.',
    example:
      'A safety car appears with both cars running third and fourth. Both pit. The third-placed car keeps its position; the fourth-placed car, delayed by the stack, rejoins seventh. The team judged that losing three places on one car was better than leaving it on old tyres while the whole field refreshed.',
    misunderstandings:
      '**"The team favoured one driver."** Somebody has to be second in a stack. Which car goes first is usually decided by track position rather than by preference, though teams do apply priority when a championship is at stake.',
    related: [
      'double-stacking',
      'team-orders',
      'safety-car-strategy',
      'covering-a-rival',
      'constructors-championship',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  statistic({
    slug: 'pit-loss',
    title: 'Pit Stop Time vs Total Pit Loss',
    category: 'pit-stops',
    alsoIn: ['strategy', 'analysis'],
    difficulty: 'advanced',
    order: 140,
    summary: 'The two seconds everyone watches, and the twenty seconds that actually matter.',
    oneSentence:
      'Pit loss is the total time a pit stop costs relative to staying on track, of which the stationary time is only a small fraction.',
    measures:
      'The difference between the time taken to complete a lap that includes a pit stop and the time the same car would have taken to complete that lap at racing speed.',
    formula:
      'Pit loss is the sum of three components:\n\n- **The in lap delta**, the time lost slowing for and entering the pit lane.\n- **The pit lane transit**, the time spent travelling the length of the pit lane at the speed limit rather than at racing speed. This is the largest component.\n- **The stationary time**, typically around two and a half seconds.\n- **The out lap delta**, the time lost accelerating away and running the first part of a lap on cold tyres.\n\nTeams measure it directly from timing data rather than computing it, because the real figure includes effects a formula misses.',
    workedExample:
      'Take an illustrative circuit with a pit loss of twenty seconds. A rival two seconds ahead pits. To undercut them, you need to gain more than two seconds during the laps when you are on fresh tyres and they are not, because the twenty seconds cancels: you both pay it.\n\nNow suppose the tyres degrade at half a second per lap and a new set is a second and a half quicker than a twenty-lap-old set. One lap of overlap gains you a second and a half, which is not quite enough. Two laps would be.',
    interpret:
      'Pit loss varies from roughly sixteen seconds to more than twenty-five depending on the circuit, and that single number reshapes strategy. A long pit lane makes track position more valuable, favours one-stop strategies, and weakens the undercut. A short one does the reverse.',
    limitations:
      'Pit loss is not a constant even at one circuit. It changes with traffic in the pit lane, with the car’s fuel load, with tyre warm-up on the out lap, and enormously under a safety car, when the cars on track are slowed and the relative loss can more than halve.\n\nIt also excludes what happens after the stop. Rejoining behind a slower car can cost more than the pit stop did, and no pit loss figure captures that. Any strategic conclusion drawn from pit loss alone is therefore incomplete.',
    related: [
      'pit-stops-explained',
      'pit-lane-speed-limit',
      'undercut',
      'pit-window',
      'safety-car-strategy',
      'pit-stop-loss-analysis',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  strategy({
    slug: 'pit-window',
    title: 'Pit Window Explained',
    category: 'pit-stops',
    alsoIn: ['strategy'],
    difficulty: 'intermediate',
    order: 150,
    summary:
      'The range of laps in which stopping makes sense, and why it is a range rather than a lap.',
    oneSentence:
      'A pit window is the span of laps during which a driver can stop without significantly compromising the race, bounded by tyre life at one end and remaining distance at the other.',
    howItWorks:
      '**The early bound.** Stopping too soon leaves a final stint longer than the new tyres can sustain.\n\n**The late bound.** Stopping too late means running many laps on tyres that have already fallen away.\n\n**Between them is the window.** Anywhere inside it, the total race time is close to optimal, which is what makes the exact lap a tactical choice rather than a calculation.\n\n**Rivals define its use.** Within the window, when you stop is decided by what your opponents do: earlier to undercut, later to overcut, or immediately after them to cover.\n\n**It moves.** Degradation running higher than expected pulls the window earlier; a safety car can open it instantly.',
    whenUsed:
      'Throughout every race. Commentators describe a driver as being "in the window" when stopping has become a live option.',
    advantages:
      'Thinking in windows rather than laps is what makes strategy comprehensible. It explains why a team is relaxed about a rival stopping three laps before them, and why the same three laps at a different point in the race would be an emergency.',
    risks:
      'A driver who reaches the end of their window without stopping loses time rapidly, and one who is forced to stop before it opens is committed to a compromised race. Being pushed out of the window by a rival’s move is a genuine strategic defeat.',
    example:
      'A driver’s window runs from lap 22 to lap 30. A rival pits on lap 21, a lap before the window opens. Following them would mean a final stint longer than the tyres can manage, so the team lets them go and defends the position later instead.',
    misunderstandings:
      '**"The window is a single optimal lap."** It is a range within which the difference is small. Treating it as one lap makes teams look indecisive when they are simply choosing tactically within a band where the cost is near zero.',
    related: [
      'strategy-explained',
      'undercut',
      'overcut',
      'tyre-degradation',
      'covering-a-rival',
      'extending-a-stint',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

export const FORMULA1_STRATEGY: ExplainerSeed[] = [...STRATEGY, ...PIT_STOPS];
