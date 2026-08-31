import type { ExplainerSeed, TrackShape } from './explainer-types';
import { article, definition, flag, format, procedure, rule } from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING } from './formula1-explainers';

/**
 * The race, the flag system and the safety car.
 *
 * Two of the brief's categories in one file, because the flags are not a
 * separate subject from the race: a red flag is a way a race is interrupted, a
 * blue flag is a consequence of being lapped, and the safety car is the single
 * largest disruption a race can suffer short of stopping.
 *
 * The strategy consequences of the safety car deliberately live in
 * `formula1-strategy.ts` rather than here. This file explains what the safety
 * car *is* and what it does to the race; that file explains what a pit wall
 * does about it. Splitting the mechanism from the decision is the same division
 * the rest of the library uses, and it keeps `safety-car` readable for somebody
 * who has never heard of a pit window.
 */

/** The safety car, drawn as what it does to the gaps. */
const SAFETY_CAR_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption:
    'A safety car closes the field up. Every gap a leader has built is erased, and the restart is effectively a new race.',
  steps: [
    {
      caption: 'Before. The leader has built a comfortable gap over several laps of quick running.',
      note: 'Leader +18s',
      cars: [
        { id: 'a', label: '1', lap: 70, team: 'a', highlight: true },
        { id: 'b', label: '2', lap: 45, team: 'b' },
        { id: 'c', label: '3', lap: 38, team: 'neutral' },
      ],
    },
    {
      caption:
        'An incident brings out the safety car. Cars slow, overtaking stops, and the field closes up behind it.',
      note: 'Field bunching',
      cars: [
        { id: 'sc', label: 'SC', lap: 52, team: 'neutral' },
        { id: 'a', label: '1', lap: 46, team: 'a', highlight: true },
        { id: 'b', label: '2', lap: 42, team: 'b' },
        { id: 'c', label: '3', lap: 38, team: 'neutral' },
      ],
      zones: [{ from: 20, to: 35, label: 'Incident', kind: 'caution' }],
    },
    {
      caption:
        'At the restart the leader’s eighteen seconds have become a car length. Everything built over twenty laps is gone.',
      note: 'Leader +0.5s',
      cars: [
        { id: 'a', label: '1', lap: 50, team: 'a', highlight: true },
        { id: 'b', label: '2', lap: 46, team: 'b' },
        { id: 'c', label: '3', lap: 42, team: 'neutral' },
      ],
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * The race
 * ────────────────────────────────────────────────────────────────────────── */

const RACE: ExplainerSeed[] = [
  format({
    slug: 'how-a-race-works',
    title: 'How an F1 Race Works',
    category: 'the-race',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary: 'From the formation lap to the chequered flag, and everything that can interrupt it.',
    oneSentence:
      'A Grand Prix is a standing-start race over a set distance, with a compulsory tyre change, run under a flag and safety car system that can neutralise or stop it at any point.',
    howItWorks:
      '**The formation lap.** One lap from the grid and back to it, warming tyres and brakes.\n\n**The start.** Cars stop on the grid, five red lights illuminate in sequence, and the race begins when they go out.\n\n**The distance.** Enough laps to exceed a set minimum distance, with a maximum time limit as a backstop.\n\n**The stops.** At least one, because two tyre compounds must be used in a dry race.\n\n**Interruptions.** Yellow flags neutralise a section, a virtual safety car or safety car neutralises the whole track, and a red flag stops the race entirely.\n\n**The finish.** The chequered flag is shown to the leader at the end of the final lap, and then to every car as it crosses the line.\n\n**Afterwards.** Cars are weighed and checked, and the result stays provisional until the stewards have finished.',
    example:
      'A driver leads comfortably, a safety car erases their advantage, they defend at the restart, and they win by two seconds having led by twenty. Nothing about their driving changed; the race was reset around them.',
    whyItMatters:
      'The structure explains why a Formula 1 race is rarely a straight test of pace. Compulsory stops, neutralisations and the difficulty of overtaking mean the fastest car does not automatically win, and the mechanisms that produce that are all in the rulebook rather than in the driving.',
    strategic:
      'Every element of the structure is something a strategist plans around: when to take the compulsory stop, what to do if a safety car appears, and whether to gamble on one appearing at all.',
    misunderstandings:
      '**"The race is a fixed number of laps everywhere."** The lap count differs by circuit because the distance is what is fixed, not the laps.\n\n**"The race ends at the chequered flag."** The racing does. The result is provisional until scrutineering and any stewards’ investigations are complete.',
    related: [
      'race-distance',
      'the-race-start',
      'race-classification',
      'safety-car',
      'what-happens-after-the-race',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'race-distance',
    title: 'Race Distance Explained',
    category: 'the-race',
    order: 20,
    summary:
      'A fixed distance rather than a fixed number of laps, with a time limit as a backstop.',
    oneSentence:
      'A Grand Prix runs for the smallest number of complete laps exceeding a set minimum distance, subject to a maximum elapsed time that ends the race early if it is interrupted.',
    howItWorks:
      '**Distance, not laps.** The regulations set a minimum race distance. The lap count for each circuit is the smallest whole number of laps that exceeds it, which is why lap counts vary so widely.\n\n**One race is different.** The Monaco Grand Prix has historically run to a shorter distance, because the circuit is slow enough that the standard distance would take too long.\n\n**A time limit applies.** If the race is interrupted, a maximum elapsed time can end it before the scheduled distance is complete.\n\n**Shortened races may score fewer points.** Where a race is stopped well before its distance, a reduced points scale can apply.',
    example:
      'A circuit of about 5.8 kilometres needs roughly 53 laps to clear the distance; one of about 4.3 kilometres needs about 70. Both races cover a similar distance and take a similar time.',
    whyItMatters:
      'Fixing distance rather than laps is what makes races comparable. A win is the same achievement at every circuit, and fuel and tyre planning can be done on a consistent basis.',
    strategic:
      'The lap count is the denominator of every strategic calculation. Stint lengths, fuel saving and the value of a pit stop are all computed against the number of laps remaining.',
    misunderstandings:
      '**"Every race is the same number of laps."** They are not, and the variation is large.\n\n**"A shortened race always scores half points."** The rules on reduced scoring have changed and depend on how much of the distance was completed.',
    related: [
      'how-a-race-works',
      'shortened-race-points',
      'suspended-race',
      'race-classification',
      'what-is-a-grand-prix',
    ],
    era: 'The minimum distance, the time limits and the rules for scoring a shortened race have all been revised, most recently after races that ended prematurely. Check the regulations for the season in question.',
    ...SPORTING,
  }),

  procedure({
    slug: 'the-race-start',
    title: 'The Race Start Explained',
    category: 'the-race',
    isStartHere: true,
    order: 30,
    summary: 'The most dangerous and most decisive twelve seconds of a Grand Prix.',
    oneSentence:
      'The start is a standing launch from the grid in which twenty cars accelerate together toward the first corner, and where more positions change than in the rest of the race combined.',
    theProcedure:
      '**Cars form up** on the grid after the formation lap and come to a complete stop.\n\n**Five red lights** illuminate one pair at a time, at one-second intervals.\n\n**All five go out together**, after a deliberately variable delay of a few seconds. The variability is what stops drivers timing the release rather than reacting to it.\n\n**The launch.** Drivers release the clutch and manage wheelspin. Modern cars have no launch control, so this is a genuine skill.\n\n**The run to the first corner.** Cars accelerate side by side, on tyres and brakes that are barely warm, into the heaviest braking zone of the lap.\n\n**Jump starts are detected automatically** by sensors under the grid, and drivers who move before the lights go out are penalised.',
    whenItHappens:
      'At the start of every race, and again after any red flag restart from the grid.',
    whyItMatters:
      'The start is the single largest source of position change in a Grand Prix. Because overtaking is difficult once the field has spread out, a driver who gains three places in the first corner may have gained more than they could in the following two hours.',
    strategic:
      'Which side of the grid a car starts on matters, because one side is usually rubbered-in and the other dusty. Tyre choice at the start matters too: a softer compound gives better initial traction and a shorter first stint.',
    misunderstandings:
      '**"The lights go out on a fixed count."** The delay after the fifth light is deliberately random, so anticipating it is a gamble rather than a technique.\n\n**"Launch control does the work."** Driver aids of that kind are banned. The driver manages the clutch release themselves.',
    related: [
      'lights-out-procedure',
      'standing-start',
      'formation-lap',
      'false-start',
      'grid-formation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'lights-out-procedure',
    title: 'Lights-Out Procedure',
    category: 'the-race',
    order: 40,
    summary: 'Five lights on, a variable pause, then all off, and the race is live.',
    oneSentence:
      'The start signal is five pairs of red lights illuminated one second apart, held for a variable interval, then extinguished simultaneously to begin the race.',
    theProcedure:
      '**One minute signal.** Engines started, everyone but the driver and crew leaves the grid.\n\n**Fifteen seconds.** The grid must be clear.\n\n**Lights on.** Five pairs illuminate in sequence, one per second.\n\n**The pause.** All five stay lit for between roughly four and seven seconds. The exact interval is chosen by the starter and is not announced.\n\n**Lights out.** All five extinguish at once, and the race begins.\n\n**Abort.** If a car has a problem, the lights are not extinguished; instead the abort lights are shown, the start is aborted and the procedure restarts with the race shortened by a lap.',
    whenItHappens: 'At every standing start.',
    whyItMatters:
      'The variable pause is the entire point of the design. A fixed interval would reward drivers who counted rather than reacted, and would make jump starts routine. The variability forces a genuine reaction, which is why reaction times of a couple of tenths are considered excellent.',
    misunderstandings:
      '**"Green means go."** There is no green light. The race starts when the red lights go out, which is a signal by absence rather than by presence.\n\n**"A driver anticipated the lights."** Anticipation is exactly what the random delay is designed to punish, and the sensors detect any movement before the lights go out.',
    related: ['the-race-start', 'false-start', 'standing-start', 'formation-lap', 'reaction-time'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'standing-start',
    title: 'What Is a Standing Start?',
    category: 'the-race',
    order: 50,
    summary: 'A start from a complete stop on the grid, which is how nearly every F1 race begins.',
    explanation:
      'In a standing start the cars are stationary in their grid slots when the race begins. The driver must launch the car from rest, managing clutch release and wheelspin, which is a skill in its own right and a significant source of position change.\n\nThis is the standard Formula 1 start. It is used for the race, for sprint races, and for most restarts after a red flag.',
    example:
      'Two drivers with identical cars can be separated by several car lengths by the time they reach the first corner, purely on how well each managed the launch.',
    whyItMatters:
      'The standing start is why the first corner is the most eventful part of a Grand Prix. Twenty cars accelerating from rest arrive at a braking zone together, on cold tyres, with far more speed differential between them than at any other point in the race.',
    misunderstandings:
      '**"The car does the launch."** Launch control is banned. Clutch release is managed by the driver using paddles on the steering wheel.',
    related: [
      'rolling-start',
      'the-race-start',
      'lights-out-procedure',
      'race-restart',
      'formation-lap',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'rolling-start',
    title: 'What Is a Rolling Start?',
    category: 'the-race',
    order: 60,
    summary:
      'A start from a moving lap behind the safety car, used when the track cannot take a standing start.',
    explanation:
      'In a rolling start the field is already moving, in formation behind the safety car, when the race begins. The safety car peels into the pit lane and racing resumes as the leader crosses the line.\n\nIt is used when conditions make a standing start unsafe, most often heavy rain, and for restarts after a safety car period.',
    example:
      'A race begins in heavy rain behind the safety car. After several laps the conditions improve, the safety car withdraws, and the race becomes live from a rolling start with the field already in grid order.',
    whyItMatters:
      'A rolling start produces far less position change than a standing one, because the cars are already spread out and moving at similar speeds. A race that starts this way tends to preserve the qualifying order into the first lap.',
    misunderstandings:
      '**"A rolling start is a formality."** The moment of the restart is genuinely contested: the leader controls the pace and can try to catch the field out, and the cars behind can attack the moment the line is crossed.',
    related: [
      'standing-start',
      'safety-car-restart',
      'safety-car',
      'race-restart',
      'how-rain-changes-f1',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'race-classification',
    title: 'Race Classification Explained',
    category: 'the-race',
    difficulty: 'intermediate',
    order: 70,
    summary: 'Who counts as a finisher, and how a car that stopped can still be classified.',
    oneSentence:
      'A driver is classified if they have completed a set proportion of the winner’s distance, which means a car that retires late can still appear in the results ahead of cars that were running at the end.',
    howItWorks:
      '**The distance threshold.** A driver must complete a minimum share of the race distance covered by the winner, historically ninety per cent, to be classified.\n\n**Classified but not finished.** A car that retires after passing that threshold is still ranked, in the position its completed distance earns.\n\n**Order is by distance then time.** Cars are ranked by the number of laps completed, and among those on the same lap, by the order they crossed the line.\n\n**Penalties are applied afterwards.** A post-race time penalty is added to a driver’s total time and can move them down the order.',
    example:
      'A driver retires with three laps to go having completed enough distance to be classified. They are placed ahead of a car that finished the race but was two laps down, because classification ranks completed distance rather than whether the car was still running at the flag.',
    whyItMatters:
      'It is the reason a retirement does not always mean nothing. A driver who retires late can still score points, which changes how a team weighs the risk of continuing with a damaged car.',
    strategic:
      'A car with a failing component near the end of a race may be told to continue at reduced pace specifically to reach the classification threshold or to hold a points position, rather than being retired immediately.',
    misunderstandings:
      '**"You must finish to be classified."** You must complete the required distance. Crossing the finish line is not the test.\n\n**"Classified means finished."** Results often distinguish the two, and a classified retirement is not the same as a finish.',
    related: ['dnf', 'how-a-race-works', 'lapped', 'time-penalty', 'what-happens-after-the-race'],
    era: 'The classification threshold and the treatment of shortened races have both been revised over the sport’s history.',
    ...SPORTING,
  }),

  definition({
    slug: 'dnf',
    title: 'What Is a DNF?',
    category: 'the-race',
    alsoIn: ['glossary'],
    order: 80,
    summary: 'Did Not Finish: the car started the race and did not reach the end of it.',
    explanation:
      'DNF stands for Did Not Finish. It records that a car started the race but retired before completing it, whether through mechanical failure, accident damage, a collision or a decision to withdraw the car.\n\nA DNF is not automatically an absence from the results: if the driver completed enough of the race distance, they are still classified and may still score points.',
    example:
      'A driver’s power unit fails on the last lap while running fourth. They are recorded as a DNF, and because they had completed the required distance they are still classified and still score.',
    whyItMatters:
      'Retirements are a championship factor in their own right. A car that is quick but unreliable scores nothing on the days it stops, and points not scored cannot be recovered by winning more emphatically later.',
    misunderstandings:
      '**"A DNF means zero points."** Not necessarily. A late retirement past the classification threshold can still score.\n\n**"A DNF is the driver’s fault."** Most are mechanical or the result of another driver’s error. The statistic records the outcome, not the cause.',
    related: [
      'dns',
      'dsq',
      'race-classification',
      'reliability-adjusted-performance',
      'why-every-point-matters',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'dns',
    title: 'What Is a DNS?',
    category: 'the-race',
    alsoIn: ['glossary'],
    order: 90,
    summary: 'Did Not Start: the car was entered and qualified but never took the start.',
    explanation:
      'DNS stands for Did Not Start. It records a car that was entered for the race, and usually qualified, but did not take the start.\n\nCauses include a failure on the formation lap, damage in a start-line incident before the race is under way, an accident in the warm-up, or a withdrawal on safety grounds.',
    example:
      'A driver stops on the formation lap with a hydraulic failure. The car never reaches its grid slot, and the result records a DNS rather than a retirement.',
    whyItMatters:
      'The distinction matters for records. A DNS is not a retirement from a race, and career statistics for starts, finishes and reliability treat the two separately.',
    misunderstandings:
      '**"DNS and DNF are interchangeable."** They are not. A DNF started the race; a DNS did not, and a driver’s starts total is affected by one and not the other.',
    related: ['dnf', 'dsq', 'race-classification', 'formation-lap', 'starting-grid'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'dsq',
    title: 'What Is a DSQ?',
    category: 'the-race',
    alsoIn: ['rules-and-penalties', 'glossary'],
    order: 100,
    summary: 'Disqualified: the result is struck out, usually for a technical infringement.',
    explanation:
      'DSQ stands for disqualification. The driver’s result is removed entirely and no points are awarded, regardless of where the car finished.\n\nMost disqualifications are technical rather than behavioural: a car found underweight, with excessive wear on the plank beneath the floor, with a fuel irregularity, or with a component outside its permitted dimensions.\n\nDisqualifications can also follow serious sporting offences, such as ignoring a black flag.',
    example:
      'A car finishes on the podium and is found after the race to have worn its floor plank beyond the permitted limit, a consequence of running the car too low. The result is removed even though the wear gave no deliberate advantage and the team did not intend it.',
    whyItMatters:
      'It is the clearest demonstration that the technical regulations are absolute. Compliance is not judged on intent or on whether an advantage was gained; a car is either legal or it is not.',
    misunderstandings:
      '**"Disqualification means cheating."** Most are inadvertent, arising from setup choices that turned out to be marginal over a race distance.\n\n**"It only affects that race."** The points are lost, which in a close championship can be decisive.',
    related: [
      'technical-infringements',
      'scrutineering',
      'black-flag',
      'what-happens-after-the-race',
      'disqualification',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'lapped',
    title: 'What Does Lapped Mean?',
    category: 'the-race',
    alsoIn: ['glossary'],
    order: 110,
    summary: 'Being a full lap behind, which changes your obligations rather than your race.',
    explanation:
      'A car is lapped when the leader has completed one more lap than it has, and catches it on track. The lapped car is then a full lap behind in the classification.\n\nOnce being lapped, a driver is shown blue flags and must let the faster car past at the first opportunity. They are still racing the cars on their own lap, so a lapped driver is not out of their own contest.',
    example:
      'A car running twelfth is lapped by the leader. It must move aside, loses a little time doing so, and continues racing the cars it is actually competing with, none of whom are on the lead lap either.',
    whyItMatters:
      'Lapped traffic is a genuine strategic factor. A leader who catches a queue of lapped cars loses time; a driver being chased may find lapped traffic helps them by disrupting their pursuer. Under a safety car, whether lapped cars are allowed to unlap themselves changes the order of the restart.',
    misunderstandings:
      '**"A lapped car has to stop racing."** It has to yield to the car lapping it. It goes on racing everybody on its own lap.\n\n**"Being lapped means you are out."** It means you are a lap behind. Lapped cars are still classified and can still score if enough cars retire ahead.',
    related: [
      'backmarkers',
      'blue-flag',
      'unlapping',
      'lapped-cars-under-safety-car',
      'race-classification',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'unlapping',
    title: 'How Drivers Unlap Themselves',
    category: 'the-race',
    alsoIn: ['flags-and-safety-car'],
    difficulty: 'intermediate',
    order: 120,
    summary:
      'Passing the leader to get back on the lead lap, usually permitted under a safety car.',
    oneSentence:
      'Unlapping is regaining a lost lap by passing the leader, either on merit during green-flag running or, more commonly, by being waved past during a safety car period.',
    theProcedure:
      '**Under green flags.** A lapped car that is genuinely faster can repass the leader on track, which is rare but legitimate.\n\n**Under a safety car.** The race director may instruct lapped cars to overtake the safety car and the leaders, and rejoin at the back of the queue on the lead lap.\n\n**They must catch up.** Cars that unlap themselves accelerate around the circuit to rejoin the back of the pack, which takes time and is why the procedure delays a restart.\n\n**It is a decision, not an automatic right.** Whether lapped cars are released, and which ones, is directed from race control.',
    whenItHappens:
      'Most often during a safety car period, before a restart, so that the racing order is not distorted by lapped cars sitting between leaders.',
    whyItMatters:
      'It removes lapped cars from between the leaders, so the restart is a genuine contest rather than one decided by who has traffic in the way. For the unlapped drivers it restores a lap they had lost, which can be worth positions if others retire.',
    strategic:
      'The procedure takes time, which means a safety car period that includes unlapping lasts longer, and a longer safety car period can change how many laps of racing remain. That in turn changes whether a further pit stop is worth taking.',
    misunderstandings:
      '**"All lapped cars always unlap."** It is at the race director’s discretion, and how the instruction is applied has been the subject of significant controversy and subsequent rule clarification.',
    related: [
      'lapped',
      'lapped-cars-under-safety-car',
      'safety-car',
      'safety-car-restart',
      'blue-flag',
    ],
    era: 'The procedure for releasing lapped cars under a safety car was clarified after a disputed application of it, and the current wording is more prescriptive than it once was.',
    ...SPORTING,
  }),

  definition({
    slug: 'backmarkers',
    title: 'Backmarkers Explained',
    category: 'the-race',
    alsoIn: ['glossary'],
    order: 130,
    summary:
      'Cars at the back of the field, and the traffic problem they represent for the leaders.',
    explanation:
      'Backmarker describes a car running at the back of the field, typically one about to be lapped or already lapped. The term is about position rather than ability.\n\nFor the leaders, backmarkers are traffic. Catching one costs time, and catching a group of them can cost several seconds over a couple of laps.',
    example:
      'A leader defending a two-second lead catches three lapped cars in the final laps. Clearing them costs a second and a half, and the lead is nearly gone through nobody’s fault.',
    whyItMatters:
      'Traffic is a real and under-appreciated variable in race results. Two drivers with identical pace can finish seconds apart simply because one met lapped cars at an awkward point and the other did not.',
    misunderstandings:
      '**"Backmarkers should get out of the way immediately."** They must yield at the first safe opportunity, which is not the same as braking mid-corner. A driver who yields dangerously is penalised, not thanked.',
    related: ['lapped', 'blue-flag', 'unlapping', 'racing-line', 'race-classification'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'race-restart',
    title: 'What Is a Race Restart?',
    category: 'the-race',
    alsoIn: ['flags-and-safety-car'],
    difficulty: 'intermediate',
    order: 140,
    summary: 'Resuming racing after a neutralisation, either rolling or from the grid.',
    oneSentence:
      'A restart is the resumption of racing after a safety car or a red flag, taken either as a rolling start behind the safety car or as a standing start from the grid.',
    theProcedure:
      '**After a safety car.** The safety car withdraws, the leader controls the pace, and racing resumes as the leader crosses the line. Overtaking before that point is forbidden.\n\n**After a red flag.** Cars form up in classification order, usually on the grid, and the race resumes with a standing start. In some circumstances a rolling restart behind the safety car is used instead.\n\n**Order is preserved.** The restart uses the order at the moment the race was neutralised, not the order in which cars happened to arrive in the pit lane.\n\n**Remaining distance.** The race resumes for the laps still outstanding, and if too few remain the race may be declared finished.',
    whenItHappens: 'After every safety car period and every red flag from which the race resumes.',
    whyItMatters:
      'A restart is a second start, and it produces the same concentrated position change: cars bunched together, tyres at different temperatures, and the leader’s advantage erased. Races are frequently decided at restarts rather than during green-flag running.',
    strategic:
      'The leader controls the timing of a rolling restart and will try to catch the field out, accelerating at the moment least convenient for the car behind. The cars behind will try to get a run on the leader while staying behind until the line.',
    misunderstandings:
      '**"The gaps are restored at a restart."** They are not. The field is bunched, and any lead built before the neutralisation is gone.',
    related: [
      'safety-car-restart',
      'red-flag-restart',
      'rolling-start',
      'standing-start',
      'suspended-race',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'suspended-race',
    title: 'What Happens When a Race Is Suspended?',
    category: 'the-race',
    alsoIn: ['flags-and-safety-car'],
    difficulty: 'intermediate',
    order: 150,
    summary: 'A red flag stops the race, cars return to the pit lane, and the clock keeps running.',
    oneSentence:
      'When a race is suspended, a red flag stops all cars, which return to the pit lane and wait until the race either resumes with a restart or is declared finished.',
    theProcedure:
      '**Red flags are shown** at every marshal post and cars slow immediately.\n\n**Cars return to the pit lane** and stop, usually in classification order.\n\n**Work is permitted.** Teams may work on the cars during a suspension, including changing tyres, which is why a red flag can hand a free pit stop to everybody.\n\n**The clock continues.** The maximum elapsed time for the event keeps running, so a long suspension can shorten the race.\n\n**The race resumes or ends.** If conditions allow, there is a restart for the remaining distance. If not, the race is classified as it stood, with points awarded according to how much distance was completed.',
    whenItHappens:
      'When conditions make racing impossible or unsafe: a blocked track, a serious accident, heavy rain, failing light, or a barrier requiring repair.',
    whyItMatters:
      'A red flag is the single most disruptive event in a Grand Prix. Because teams may work on the cars, a driver who had already pitted loses their advantage entirely while a driver who had not gets their stop for nothing.',
    strategic:
      'The free tyre change is the crucial part. A leader who has just made a costly pit stop can see every rival receive the same service at no cost, and a race that was strategically decided becomes open again.',
    misunderstandings:
      '**"A suspended race is abandoned."** Usually it resumes. Abandonment happens only when the race cannot be restarted safely.\n\n**"The result is void."** If enough distance was completed the race is classified and points are awarded, sometimes on a reduced scale.',
    related: [
      'red-flag',
      'red-flag-restart',
      'race-restart',
      'shortened-race-points',
      'race-distance',
    ],
    era: 'The rules governing points for a race that cannot be resumed were revised after races that ended prematurely, and the reduced-points scale is a relatively recent addition.',
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Flags and the safety car
 * ────────────────────────────────────────────────────────────────────────── */

const FLAGS: ExplainerSeed[] = [
  flag({
    slug: 'flag-system',
    title: 'F1 Flag System Explained',
    category: 'flags-and-safety-car',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'Every flag in Formula 1, what it means, and what a driver must do about it.',
    oneSentence:
      'Flags are the signalling system marshals use to tell drivers about conditions ahead, ranging from a warning to slow down to an instruction to stop racing altogether.',
    whatItMeans:
      '**Yellow.** Danger ahead. Slow down, no overtaking.\n\n**Double yellow.** Serious danger, be prepared to stop, no overtaking.\n\n**Red.** The session is stopped. Return to the pit lane.\n\n**Blue.** A faster car is about to lap you. Let it past.\n\n**Black.** You are disqualified. Return to the pits immediately.\n\n**Black and white, split diagonally.** A warning for unsporting behaviour.\n\n**Black with an orange disc.** Your car has a mechanical problem and must be repaired.\n\n**White.** A slow vehicle is on track ahead.\n\n**Green.** The hazard has cleared and normal racing resumes.\n\n**Chequered.** The session has ended.',
    whatDriversMustDo:
      'Flags are instructions, not advice. Ignoring a yellow flag is penalised on the evidence of the car’s telemetry, which shows whether the driver actually lifted, and a lap set under yellow flags is deleted.\n\nMost flags are now duplicated on light panels around the circuit and on the steering wheel display, so a driver receives the same signal in three places.',
    whyItMatters:
      'The flag system is how twenty cars travelling at very high speed are told about a hazard they cannot yet see. Marshals working trackside depend on it being obeyed, which is why the penalties for ignoring a yellow flag are severe out of proportion to the time gained.',
    strategic:
      'Flags have strategic consequences as well as safety ones. A yellow flag in the wrong sector can cost a qualifying lap, and a red flag can hand the entire field a free pit stop.',
    misunderstandings:
      '**"Yellow flags are advisory."** They are mandatory, they are enforced from telemetry, and they carry some of the heaviest penalties in the sport.',
    related: ['yellow-flag', 'red-flag', 'blue-flag', 'chequered-flag', 'safety-car'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'yellow-flag',
    title: 'Yellow Flag Explained',
    category: 'flags-and-safety-car',
    order: 20,
    summary: 'Danger ahead: slow down, do not overtake.',
    oneSentence:
      'A single waved yellow flag means there is a hazard on or beside the track in that sector, and drivers must reduce speed and may not overtake until the green flag.',
    whatItMeans:
      'A hazard exists in the sector where the flag is shown: a stopped car, debris, a marshal on track or a car in a dangerous position.\n\nThe flag applies to the marshalling sector in which it is displayed, and is cleared by a green flag at the end of that sector.',
    whatDriversMustDo:
      '**Reduce speed measurably.** The requirement is a genuine and demonstrable reduction, not a token lift. Telemetry is examined to confirm it.\n\n**Do not overtake.** Any position gained under a yellow flag must be given back.\n\n**Be prepared to change direction.** The hazard may be on the racing line.\n\n**In qualifying, the lap is lost.** A lap set through a yellow-flag sector without a demonstrable lift is deleted.',
    whyItMatters:
      'Marshals recover cars and debris on foot, sometimes within metres of the racing line. The yellow flag is the only thing standing between them and a car arriving at full speed, which is why the sport treats disregarding one as among its most serious offences.',
    strategic:
      'A yellow flag late in a qualifying session can decide the grid, because every driver still on a flying lap loses it while those who had already set a time are unaffected.',
    misunderstandings:
      '**"You can keep the position if you were already alongside."** Any position gained under yellow must be returned.\n\n**"A small lift is enough."** The stewards compare telemetry against the driver’s own previous laps, so a token reduction is visible and is penalised.',
    related: [
      'double-yellow-flag',
      'flag-system',
      'deleted-lap-times',
      'virtual-safety-car',
      'safety-car',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'double-yellow-flag',
    title: 'Double Yellow Flag',
    category: 'flags-and-safety-car',
    order: 30,
    summary: 'Serious danger: slow significantly and be prepared to stop.',
    oneSentence:
      'Two waved yellow flags mean the track is partly or wholly blocked ahead, and drivers must slow substantially, be prepared to stop, and may not overtake.',
    whatItMeans:
      'A more serious hazard than a single yellow: the track may be blocked, marshals may be working on the racing line, or a car may be in a position that requires drivers to be ready to stop entirely.',
    whatDriversMustDo:
      '**Slow far more than for a single yellow**, and be genuinely prepared to stop.\n\n**No overtaking**, as with a single yellow.\n\n**Expect an obstruction on the racing line**, rather than beside it.\n\n**In qualifying**, a lap through a double-yellow sector is effectively finished; drivers are expected to abandon it.',
    whyItMatters:
      'Double yellows are shown when people are in genuine danger, and they are frequently the precursor to a safety car or a red flag. The escalation from one flag to two is a signal about the severity of what is ahead, not merely its existence.',
    strategic:
      'Because a double yellow often precedes a safety car, teams begin recalculating pit strategy the moment one appears, on the expectation that a neutralisation may follow.',
    misunderstandings:
      '**"Double yellow just means slow down more."** It also means be prepared to stop, which is a different instruction: a driver must arrive at the hazard able to halt, not merely more slowly.',
    related: ['yellow-flag', 'red-flag', 'safety-car', 'virtual-safety-car', 'flag-system'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'red-flag',
    title: 'Red Flag Explained',
    category: 'flags-and-safety-car',
    order: 40,
    summary: 'The session is stopped: return to the pit lane.',
    oneSentence:
      'A red flag stops the session entirely, requiring every car to slow and return to the pit lane, and in a race it suspends the event until conditions allow a restart.',
    whatItMeans:
      'Conditions do not permit running: a serious accident, a blocked track, weather that makes racing impossible, failing light, or damage to a barrier that needs repair.',
    whatDriversMustDo:
      '**Slow immediately** and proceed to the pit lane at reduced speed.\n\n**Observe a delta time.** Drivers must not race back to the pits, and a minimum time is enforced.\n\n**No overtaking**, except where a car is stopped or clearly disabled.\n\n**Stop in the pit lane** and await instructions.',
    whyItMatters:
      'A red flag is the only mechanism that stops a Grand Prix completely, and it has the largest effect of any intervention. Because teams may work on the cars during a suspension, a red flag redistributes strategic advantage more sharply than anything else that can happen in a race.',
    strategic:
      'The free tyre change is decisive. A driver who has just pitted has paid twenty seconds for tyres that everybody else now receives at no cost, and a comfortable lead built on a strategic advantage can vanish in the moment the flag is shown.',
    misunderstandings:
      '**"A red flag ends the race."** Usually it suspends it. The race is only over if it cannot safely be resumed, and even then the result stands if enough distance was completed.',
    related: [
      'suspended-race',
      'red-flag-restart',
      'race-restart',
      'shortened-race-points',
      'flag-system',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'blue-flag',
    title: 'Blue Flag Explained',
    category: 'flags-and-safety-car',
    order: 50,
    summary: 'A faster car is about to lap you: let it past.',
    oneSentence:
      'A blue flag tells a driver that a car about to lap them is approaching, and they must allow it past at the first opportunity.',
    whatItMeans:
      'In a race, that the car behind is a lap ahead and is closing. In practice or qualifying, that a faster car is approaching, typically on a flying lap while you are on an out lap.',
    whatDriversMustDo:
      '**Let the car past at the first safe opportunity.** Drivers are typically shown the flag at several successive marshal posts and are expected to yield within that span.\n\n**Yield safely and predictably.** Move off the racing line at a sensible point, usually on a straight, and hold a consistent line.\n\n**Failure is penalised**, most often with a time penalty for ignoring blue flags.',
    whyItMatters:
      'Blue flags keep the leaders’ race from being decided by lapped traffic. Without them, a leader could lose a race to a backmarker who happened to be in the way, which would make the result a matter of luck rather than merit.',
    strategic:
      'Even with blue flags, lapping costs time. A leader who catches a group of lapped cars will lose part of their advantage, which is why a lead is never quite as safe as it appears when traffic is approaching.',
    misunderstandings:
      '**"Blue flags mean move over immediately."** They mean yield at the first safe opportunity. Braking suddenly or moving unpredictably to comply is itself dangerous and is penalised.\n\n**"Blue-flagged drivers are out of the race."** They are racing everybody on their own lap, and being lapped changes none of that.',
    related: ['lapped', 'backmarkers', 'unlapping', 'flag-system', 'qualifying-traffic'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'black-flag',
    title: 'Black Flag Explained',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 60,
    summary: 'You are disqualified: return to the pits immediately.',
    oneSentence:
      'A black flag, shown with a car number, disqualifies that driver from the session and requires them to return to the pit lane at once.',
    whatItMeans:
      'The driver has been excluded from the session. It is the most severe sanction that can be applied during running, and it is rare.\n\nCauses include serious unsporting conduct, ignoring repeated instructions, or continuing after being told the car is not permitted to run.',
    whatDriversMustDo:
      '**Return to the pit lane immediately** and take no further part in the session.\n\n**Ignoring it escalates matters**, and has historically led to further sanctions beyond the disqualification itself.',
    whyItMatters:
      'The black flag is the mechanism by which race control can remove a car from a session in progress rather than waiting for a post-race decision. Its rarity is the point: it exists for situations where allowing the car to continue is not acceptable.',
    misunderstandings:
      '**"Black flags are handed out for driving offences."** Ordinary offences draw time or grid penalties. A black flag is reserved for conduct or circumstances that make continuing untenable.',
    related: [
      'black-and-white-flag',
      'disqualification',
      'dsq',
      'flag-system',
      'how-stewards-decide',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'black-and-white-flag',
    title: 'Black-and-White Flag Explained',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 70,
    summary: 'A formal warning for unsporting behaviour, shown once before a penalty follows.',
    oneSentence:
      'The black-and-white flag, divided diagonally and shown with a car number, is a warning that a driver’s conduct has been noted and that a repeat will be penalised.',
    whatItMeans:
      'A driver has done something the stewards regard as unsporting but not yet worth a penalty: repeatedly exceeding track limits, weaving excessively, or driving in a manner that is being watched.\n\nIt is a formal warning on the record rather than an informal one.',
    whatDriversMustDo:
      '**Stop doing whatever prompted it.** The flag is a statement that the next occurrence will draw a penalty rather than another warning.',
    whyItMatters:
      'It gives the stewards a graduated response. Without it, the only options would be to ignore borderline conduct or to penalise it immediately, and the warning allows a driver to correct course before a race-affecting sanction is applied.',
    strategic:
      'For track limits in particular, the warning tells a team that their driver has no margin left, and drivers are usually instructed immediately to leave more room at the corner concerned.',
    misunderstandings:
      '**"It is just a suggestion."** It is a recorded warning, and the penalty that follows a repeat is applied on the basis that the driver had already been told.',
    related: [
      'black-flag',
      'track-limits-penalties',
      'penalty-points',
      'defensive-driving-rules',
      'flag-system',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  flag({
    slug: 'chequered-flag',
    title: 'Chequered Flag Explained',
    category: 'flags-and-safety-car',
    order: 80,
    summary: 'The session is over, shown to the leader first and then to every car.',
    oneSentence:
      'The chequered flag marks the end of a session, and in a race it is shown to the leader as they complete the final lap and then to each car as it crosses the line.',
    whatItMeans:
      'The session has ended. In a race, the leader has completed the full distance; in practice or qualifying, the time has expired.',
    whatDriversMustDo:
      '**Complete the lap and slow down.** Racing ends at the line.\n\n**In qualifying**, a driver who has crossed the line before the flag may complete their current lap, which is why times continue to be set after a session appears to have finished.\n\n**Proceed as directed**, which after a race means to parc fermé rather than to the garage.',
    whyItMatters:
      'It is the moment the racing stops, though not the moment the result is final: technical checks and outstanding stewards’ investigations can still change the classification afterwards.',
    misunderstandings:
      '**"The flag ends the session for everyone at once."** In qualifying, anybody who started their lap before the flag may finish it, which is why the fastest time of a session is often set after the clock reaches zero.\n\n**"The result is final at the flag."** It is provisional until scrutineering and any investigations are complete.',
    related: [
      'what-happens-after-the-race',
      'race-classification',
      'flag-system',
      'how-a-race-works',
      'q3',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'safety-car',
    title: 'Safety Car Explained',
    category: 'flags-and-safety-car',
    isStartHere: true,
    isFeatured: true,
    order: 90,
    readMinutes: 5,
    summary: 'A road car leads the field at reduced speed, and the race is neutralised behind it.',
    oneSentence:
      'The safety car is deployed to neutralise a race when a hazard cannot be dealt with under yellow flags, leading the field at reduced speed until the track is clear.',
    theProcedure:
      '**Deployment.** Race control sends the safety car out. Boards and lights show SC around the circuit.\n\n**The field forms up.** Cars slow, overtaking stops, and everybody queues behind the safety car in track order.\n\n**Gaps close.** Because every car travels at the same reduced speed, the leader’s advantage disappears.\n\n**The pit lane stays open**, usually, so cars may pit, and most do because the stop is far cheaper than usual.\n\n**Lapped cars may be released** to unlap themselves before the restart.\n\n**Withdrawal.** The safety car returns to the pit lane, the leader controls the pace, and racing resumes as the leader crosses the line.',
    diagram: SAFETY_CAR_DIAGRAM,
    whenItHappens:
      'When a car must be recovered from a dangerous position, when debris must be cleared, when conditions deteriorate, or when marshals need to work on or near the racing line.',
    whyItMatters:
      'The safety car is the single most disruptive routine event in a Grand Prix. It erases every gap in the field, which means a driver who has driven a perfect race can lose their advantage entirely through an incident they had nothing to do with.',
    strategic:
      'Because the whole field is slowed, the time lost by pitting falls sharply, and a driver who has not yet stopped receives what amounts to a discounted pit stop. Whether a car has already stopped when a safety car appears is one of the largest sources of luck in the sport.',
    misunderstandings:
      '**"The safety car is a break in the race."** The race is live throughout. Positions matter, pit stops happen, and the restart is frequently where the race is decided.\n\n**"Everyone loses out equally."** The opposite: it helps whoever is behind and whoever has not yet pitted, and harms the leader and anybody who has just stopped.',
    related: [
      'virtual-safety-car',
      'safety-car-vs-vsc',
      'safety-car-restart',
      'safety-car-strategy',
      'why-safety-cars-close-the-field',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'virtual-safety-car',
    title: 'Virtual Safety Car Explained',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 100,
    summary: 'A speed limit for everybody at once, which slows the race without bunching it.',
    oneSentence:
      'A virtual safety car neutralises the race by requiring every driver to stay above a delta time, slowing the whole field proportionally while preserving the gaps between cars.',
    theProcedure:
      '**Deployment.** VSC boards and lights are shown, and the message appears on every steering wheel.\n\n**A delta time is enforced.** Each car must complete each sector no faster than a specified reference, which the driver monitors on the dashboard.\n\n**Gaps are preserved.** Because everybody slows by a similar proportion, the relative positions and gaps remain broadly as they were.\n\n**No overtaking**, except of a car that is clearly disabled.\n\n**Withdrawal.** A short countdown is given, and racing resumes at a defined point rather than at the start-finish line.',
    whenItHappens:
      'When a hazard requires the race to be neutralised but does not require the field to be physically led around, typically debris or a car being recovered from a safe position.',
    whyItMatters:
      'The VSC was introduced to fill the gap between a yellow flag, which slows only one sector, and a full safety car, which disrupts the entire race. It protects marshals without redistributing the race.',
    strategic:
      'A VSC is a much cleaner strategic opportunity than a safety car. A pit stop is cheaper than usual, but the leader keeps their gap, so a well-timed stop under a VSC can be almost free and cost nothing in track position.',
    misunderstandings:
      '**"A VSC is a mini safety car."** Strategically it is the opposite. A safety car destroys gaps and helps the cars behind; a VSC preserves gaps and helps whoever is already ahead.',
    related: ['safety-car', 'safety-car-vs-vsc', 'vsc-strategy', 'delta-time', 'yellow-flag'],
    era: 'The virtual safety car was introduced after a fatal accident and its procedures have been refined since. It did not exist in earlier eras of the sport.',
    ...SPORTING,
  }),

  article({
    slug: 'safety-car-vs-vsc',
    title: 'Safety Car vs VSC',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 110,
    summary:
      'Both slow the race; only one of them closes the field up, and that changes everything.',
    oneSentence:
      'A safety car bunches the field and erases every gap, while a virtual safety car slows everybody proportionally and preserves the gaps, which makes their strategic effects nearly opposite.',
    explanation:
      'The two interventions look similar and produce different races.\n\nUnder a **safety car**, all cars queue behind a physical car at its speed. Whatever the gaps were, they become nothing.\n\nUnder a **virtual safety car**, cars stay where they are on track and slow to a delta. A leader twenty seconds ahead is still twenty seconds ahead when it ends.',
    howItWorks:
      '**Effect on gaps.** Safety car: destroyed. VSC: preserved.\n\n**Effect on pit loss.** Both reduce it. The safety car reduces it more, because the cars on track are slower still.\n\n**Who it helps.** The safety car helps cars behind and cars yet to stop. The VSC helps whoever is in front, by handing them a cheap stop with no downside.\n\n**Restart.** The safety car produces a bunched restart, which is a fresh contest. A VSC simply resumes.\n\n**Severity.** The safety car is used for hazards requiring the field to be led; the VSC for hazards that can be managed by slowing everyone in place.',
    example:
      'A leader with a fifteen-second advantage pits under a VSC and retains the lead. The same leader, under a safety car, pits and rejoins in a bunched queue with their advantage gone and a restart to survive.',
    whyItMatters:
      'Understanding which is which explains most reactions on a pit wall. The same event, a car stopped beside the track, produces relief or alarm depending entirely on which intervention race control chooses.',
    misunderstandings:
      '**"They are two versions of the same thing."** They are two different tools. Confusing them makes safety car strategy look arbitrary when it is not.',
    related: [
      'safety-car',
      'virtual-safety-car',
      'safety-car-strategy',
      'vsc-strategy',
      'what-happens-to-race-gaps',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-safety-cars-close-the-field',
    title: 'Why Safety Cars Close Up the Field',
    category: 'flags-and-safety-car',
    order: 120,
    summary:
      'Because a gap in seconds becomes a gap in metres once everybody slows to the same speed.',
    oneSentence:
      'A lead measured in seconds at racing speed becomes a much smaller distance at safety car speed, so the field concentrates into a queue and the leader’s advantage disappears.',
    explanation:
      'A gap between two cars is really a distance. At racing speed, a twenty-second lead is a long way down the road. When both cars slow to safety car pace, that same distance is covered far more slowly, so the car behind catches up until it joins the back of the queue.\n\nOnce everybody is queued behind the safety car at the same speed, the gaps are set by the length of the cars and the spacing between them, not by anything that happened earlier in the race.',
    howItWorks:
      '**The queue forms.** Cars catch the safety car in order and slot in behind it.\n\n**Distance replaces time.** Twenty seconds becomes a few car lengths.\n\n**Everything built is lost.** A lead constructed over thirty laps of quick driving is gone in one lap of neutralisation.\n\n**It is symmetrical.** A driver twenty seconds behind gains exactly as much as the leader loses.',
    example:
      'A leader is eighteen seconds clear. A safety car appears, and at the restart the second-placed car is directly behind them. The leader must now defend a position they had comfortably controlled all afternoon.',
    whyItMatters:
      'This is the largest single source of luck in Formula 1. A driver can do everything right and lose a race because of an incident elsewhere, and no amount of skill protects against it.',
    misunderstandings:
      '**"The gaps should be restored after the safety car."** Some series do restore relative gaps. Formula 1 does not, and the resulting bunched restart is regarded as part of the sport rather than a flaw in it.',
    related: [
      'safety-car',
      'what-happens-to-race-gaps',
      'safety-car-restart',
      'safety-car-strategy',
      'safety-car-vs-vsc',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'what-happens-to-race-gaps',
    title: 'What Happens to Race Gaps?',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 130,
    summary: 'How gaps are built, what destroys them, and why they are not restored.',
    oneSentence:
      'Gaps between cars are built lap by lap through pace and pit strategy, and are erased entirely by a safety car, preserved by a virtual safety car, and reset by a red flag.',
    explanation:
      'A gap is the accumulated difference in lap times, adjusted for pit stops. It is the most direct measure of relative performance in a race, and it is also fragile.',
    howItWorks:
      '**Built by pace.** A car two tenths a lap quicker builds two tenths a lap, which over thirty laps is six seconds.\n\n**Built by strategy.** A well-timed pit stop can create a gap that pace alone would have taken many laps to produce.\n\n**Destroyed by a safety car.** The field bunches and everything is lost.\n\n**Preserved by a VSC.** Proportional slowing keeps the relationships intact.\n\n**Reset by a red flag.** Cars line up in order for the restart, so the order survives but the gaps do not.\n\n**Eroded by traffic.** Lapped cars cost the leader time that the car behind may not lose.',
    example:
      'A driver builds a twelve-second lead over forty laps, worth roughly three tenths a lap of superior pace. A single safety car erases it in under a minute, and the remaining laps are run from a standing start in all but name.',
    whyItMatters:
      'It is why leading a Grand Prix is never comfortable, and why teams talk about the safety car window. A lead is only secure once there are too few laps remaining for an intervention to matter.',
    misunderstandings:
      '**"A big lead is safe."** No lead is safe against a safety car. Teams treat a lead as insurance against a neutralisation rather than as a guarantee of the result.',
    related: [
      'why-safety-cars-close-the-field',
      'safety-car-vs-vsc',
      'delta-time',
      'safety-car-strategy',
      'backmarkers',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'safety-car-restart',
    title: 'Safety Car Restart Explained',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 140,
    summary:
      'The safety car peels off, the leader controls the pace, and the race is live at the line.',
    oneSentence:
      'At a safety car restart the safety car withdraws, the leader dictates the pace of the final neutralised lap, and racing resumes when the leader crosses the start-finish line.',
    theProcedure:
      '**Notice is given.** Teams are told the safety car will come in at the end of the lap.\n\n**Lapped cars may be released** first, and must catch the back of the pack.\n\n**The safety car enters the pit lane.** The leader now controls the pace.\n\n**The leader dictates.** They may accelerate and slow within limits, and may not leave an excessive gap or drive erratically.\n\n**Racing resumes at the line.** Overtaking before it is forbidden and penalised.\n\n**Everybody is on cold tyres and cold brakes**, having circulated slowly, which makes the first corner after a restart one of the most incident-prone parts of a race.',
    whenItHappens: 'At the end of every safety car period from which the race resumes.',
    whyItMatters:
      'Restarts are where races are won and lost. The field is bunched, tyres are at different temperatures depending on when each car last stopped, and the leader has to defend a position they had previously controlled by a comfortable margin.',
    strategic:
      'The leader’s control of the pace is a genuine weapon. Slowing the pack and then accelerating hard at an unexpected moment can open a decisive gap before the line, and a driver who mistimes it loses the lead in the first corner.',
    misunderstandings:
      '**"The race restarts when the safety car enters the pit lane."** It restarts when the leader crosses the line. Overtaking between those two moments is an offence.\n\n**"The leader must maintain a steady pace."** They may vary it, within limits, and doing so is a legitimate tactic.',
    related: [
      'safety-car',
      'race-restart',
      'rolling-start',
      'unlapping',
      'tyre-warm-up',
      'safety-car-strategy',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'lapped-cars-under-safety-car',
    title: 'Lapped Cars Under Safety Car',
    category: 'flags-and-safety-car',
    difficulty: 'advanced',
    order: 150,
    summary:
      'Whether lapped cars are released before a restart, and why it has been controversial.',
    oneSentence:
      'During a safety car period the race director may instruct lapped cars to overtake and rejoin at the back of the queue, so that the restart is not distorted by cars a lap down sitting between the leaders.',
    howItWorks:
      '**The instruction comes from race control.** It is a direction, not an automatic entitlement.\n\n**Released cars pass the safety car and the leaders**, then complete a lap at speed to rejoin the back of the pack.\n\n**This takes time**, which is why a safety car period involving unlapping lasts longer than one without.\n\n**The restart then has a clean order**, with the lead-lap cars together.\n\n**Whether all lapped cars are released matters.** Releasing some but not others produces a different restart order, and the circumstances in which that may be done have been tightened following a disputed application.',
    example:
      'Three lapped cars sit between the first and second-placed drivers. If they are released, the leaders line up together for a straight fight at the restart. If they are not, the second-placed driver must first clear three cars that are not racing them.',
    whyItMatters:
      'The procedure decides whether the closing laps of a race are a contest between the leaders or an exercise in clearing traffic. Because it can be applied differently, it has been among the most scrutinised parts of the sporting regulations.',
    strategic:
      'The time taken to unlap cars reduces the number of racing laps remaining, which can change whether a further pit stop is worthwhile and whether a driver on old tyres can survive to the flag.',
    misunderstandings:
      '**"Lapped cars always unlap themselves."** It is at the discretion of race control, exercised within the regulations.\n\n**"It is a formality."** The decision materially changes the shape of the restart, and a disputed application of it led directly to a rewriting of the relevant wording.',
    related: ['unlapping', 'safety-car', 'safety-car-restart', 'lapped', 'blue-flag'],
    era: 'The wording governing the release of lapped cars was revised after a contested application at the end of a championship-deciding race, and is now more prescriptive.',
    ...SPORTING,
  }),

  procedure({
    slug: 'red-flag-restart',
    title: 'Red Flag Restart Explained',
    category: 'flags-and-safety-car',
    difficulty: 'intermediate',
    order: 160,
    summary: 'After a suspension, the race resumes from the grid in the order it was stopped.',
    oneSentence:
      'A red flag restart resumes a suspended race with the cars in the order they held when it was stopped, usually with a standing start from the grid for the remaining distance.',
    theProcedure:
      '**Cars line up in the pit lane** in classification order during the suspension.\n\n**Work is permitted**, including a tyre change, which is the crucial difference from a safety car.\n\n**The field forms on the grid** in the order held when the red flag was shown.\n\n**A formation lap is run**, then a standing start for the remaining laps.\n\n**A rolling restart behind the safety car** is used instead where conditions make a standing start unsafe.\n\n**If too few laps remain**, or conditions do not improve, the race is classified as it stood.',
    whenItHappens: 'After every race suspension from which racing resumes.',
    whyItMatters:
      'A red flag restart is the most complete reset available in a Grand Prix. Order is preserved but everything else, gaps, tyre age and strategic advantage, is redistributed, and a race that was decided can become open again.',
    strategic:
      'The free tyre change dominates. A driver who pitted immediately before the red flag has paid full price for what everyone now receives free, while a driver who had not yet stopped has effectively had their compulsory stop given to them.',
    misunderstandings:
      '**"The restart order is where cars were when they reached the pits."** It is the order at the moment the race was suspended, which is not the same thing.\n\n**"A restart means a full-length race."** Only the remaining distance is run.',
    related: [
      'red-flag',
      'suspended-race',
      'race-restart',
      'standing-start',
      'shortened-race-points',
    ],
    era: 'The procedures for restarting a suspended race, and for scoring one that cannot be restarted, have both been revised in recent seasons.',
    ...SPORTING,
  }),
];

export const FORMULA1_RACE: ExplainerSeed[] = [...RACE, ...FLAGS];
