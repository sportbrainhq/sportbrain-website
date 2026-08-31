import type { ExplainerSeed, TrackShape } from './explainer-types';
import { article, definition, format, procedure, rule } from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING } from './formula1-explainers';

/**
 * The race weekend, qualifying and the race.
 *
 * Three of the brief's categories in one file, because they are one narrative:
 * practice produces the setup, qualifying converts it into a grid slot, and the
 * race is run from that slot. Splitting them would put the out lap in one file
 * and the flying lap it exists to prepare in another.
 *
 * The overlaps the brief contains are resolved here rather than duplicated. The
 * flying lap, the out lap and track evolution are qualifying concepts that the
 * weekend category reaches through `alsoIn`; the formation lap is a weekend
 * procedure the race category reaches the same way. Every one is a single row.
 */

/**
 * The generic lap used by the qualifying diagrams.
 *
 * No `path`, so the renderer draws its own illustrative circuit. That is
 * deliberate: an out lap is not a Silverstone concept, and drawing one on a
 * recognisable track would imply the idea belongs to that track.
 */
const OUT_LAP_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption: 'The three laps of a qualifying run, and what the driver is doing on each.',
  steps: [
    {
      caption:
        'Out lap. The driver leaves the pits and builds tyre and brake temperature, weaving and braking hard while going deliberately slowly.',
      note: 'Preparing, not racing',
      cars: [{ id: 'a', label: 'A', lap: 15, highlight: true }],
      markers: [
        { lap: 0, label: 'Start/finish', kind: 'start' },
        { lap: 96, label: 'Pit exit', kind: 'pit-exit' },
      ],
    },
    {
      caption:
        'Flying lap. The tyres are in their working range and the driver runs a full-commitment lap. This is the lap that is timed for the grid.',
      note: 'The timed lap',
      cars: [{ id: 'a', label: 'A', lap: 55, highlight: true }],
      zones: [
        { from: 0, to: 33, label: 'Sector 1', kind: 'sector' },
        { from: 33, to: 66, label: 'Sector 2', kind: 'sector' },
        { from: 66, to: 100, label: 'Sector 3', kind: 'sector' },
      ],
      markers: [{ lap: 0, label: 'Timing line', kind: 'start' }],
    },
    {
      caption:
        'In lap. The driver returns to the pits, cooling the tyres and brakes and saving fuel. The time is irrelevant.',
      note: 'Returning',
      cars: [{ id: 'a', label: 'A', lap: 80, highlight: true }],
      markers: [{ lap: 92, label: 'Pit entry', kind: 'pit-entry' }],
    },
  ],
};

/** The knockout structure, drawn as three stages on one lap. */
const QUALIFYING_DIAGRAM: TrackShape = {
  track: 'circuit',
  caption: 'Qualifying is three sessions, each eliminating the slowest cars.',
  steps: [
    {
      caption:
        'Q1. Every car runs. The slowest five are eliminated and take the last five grid places in the order they set.',
      note: '20 cars → 15',
      cars: [
        { id: 'a', label: '1', lap: 20, team: 'a' },
        { id: 'b', label: '2', lap: 45, team: 'b' },
        { id: 'c', label: '3', lap: 70, team: 'neutral' },
      ],
    },
    {
      caption:
        'Q2. Fifteen cars run. The slowest five are eliminated and fill grid places 11 to 15.',
      note: '15 cars → 10',
      cars: [
        { id: 'a', label: '1', lap: 30, team: 'a' },
        { id: 'b', label: '2', lap: 62, team: 'b' },
      ],
    },
    {
      caption:
        'Q3. The remaining ten contest pole position. The fastest lap of this session starts first.',
      note: '10 cars → pole',
      cars: [{ id: 'a', label: '1', lap: 50, team: 'a', highlight: true }],
    },
  ],
};

/* ────────────────────────────────────────────────────────────────────────────
 * The race weekend
 * ────────────────────────────────────────────────────────────────────────── */

const WEEKEND: ExplainerSeed[] = [
  format({
    slug: 'race-weekend-explained',
    title: 'The F1 Race Weekend Explained',
    category: 'race-weekend',
    isStartHere: true,
    order: 10,
    summary: 'Every session of a Grand Prix weekend, in order, and what each one is for.',
    oneSentence:
      'A Grand Prix weekend is a sequence of sessions that narrows from learning to competing: practice to find a setup, qualifying to earn a grid slot, and the race to convert it.',
    howItWorks:
      '**Practice.** Three sessions on a standard weekend. Teams evaluate setup changes, complete their tyre programme, and run representative race stints to measure degradation.\n\n**Qualifying.** A knockout session in three parts that produces the starting grid.\n\n**Parc fermé.** From the moment qualifying begins, the car’s setup is frozen. This is the hinge of the whole weekend, because it means every practice decision is final.\n\n**The race.** A formation lap, a standing start, and the full race distance.\n\n**Afterwards.** The top three are weighed, interviewed and take the podium; cars are checked for technical compliance; and any incident still under investigation is decided by the stewards, which can change the result after the flag.',
    example:
      'A team spends Friday comparing two rear wing levels. The larger wing is quicker through the corners, the smaller one quicker on the straights. They must choose before qualifying, and whichever they pick is the one they race.',
    whyItMatters:
      'The weekend is designed so that information gets progressively more expensive. On Friday a mistake costs a lap. In qualifying it costs grid positions. In the race it costs the result. Teams therefore front-load their learning, which is why so much of what decides a Sunday happened on a Friday afternoon.',
    strategic:
      'The long runs in second practice are the most strategically important laps of the weekend. They are where a team estimates how quickly the tyres fall away, and that estimate decides whether they plan to stop once or twice.',
    misunderstandings:
      '**"Practice results predict the race."** They predict very little on their own, because fuel loads and engine modes are not published. A car running quickly in practice may simply be light on fuel.',
    related: [
      'how-an-f1-weekend-works',
      'free-practice',
      'qualifying-explained',
      'parc-ferme',
      'sprint-weekend',
      'what-happens-after-the-race',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'free-practice',
    title: 'Free Practice Explained',
    category: 'race-weekend',
    order: 20,
    summary: 'The sessions where teams learn the track and decide what car they will race.',
    oneSentence:
      'Free practice is untimed-for-position track time in which teams evaluate setup, complete a mandatory tyre programme, and gather the degradation data their race strategy depends on.',
    howItWorks:
      '**Nothing is at stake in the results.** Practice classifications award nothing. The value is entirely in the data.\n\n**Two kinds of running.** Short runs on low fuel with new tyres, which approximate a qualifying lap; and long runs on high fuel, which approximate a race stint.\n\n**Setup changes.** Wing levels, ride height, suspension, brake bias and differential settings are all adjusted between runs and compared.\n\n**Systems checks.** Teams verify cooling, brake temperatures and the power unit before committing to a configuration.\n\n**The clock is the constraint.** Every change costs track time, and track time is the one thing that cannot be recovered.',
    example:
      'A team runs the same driver on the same fuel load with two different front wing angles, ten minutes apart. The lap times differ by a tenth, but the driver reports the second version is more stable under braking, which matters more over a race distance than a tenth over one lap.',
    whyItMatters:
      'Practice is the only opportunity to measure this car, on this track, in these conditions. Simulations are built before the weekend and are never exactly right; practice is where the model meets the tarmac.',
    strategic:
      'The degradation figures from Friday determine the race plan. If the tyres fall away faster than expected, a one-stop becomes a two-stop, and the entire shape of the team’s Sunday changes before qualifying has even happened.',
    misunderstandings:
      '**"The fastest car in practice will win."** Not reliably. Nobody declares their fuel load, and a car can be run deliberately heavy or light. Comparing practice times without knowing fuel is comparing nothing.',
    related: [
      'fp1-fp2-fp3',
      'why-practice-matters',
      'long-run-pace',
      'car-setup-explained',
      'parc-ferme',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'fp1-fp2-fp3',
    title: 'FP1, FP2 and FP3',
    category: 'race-weekend',
    order: 30,
    summary: 'What each of the three practice sessions is actually used for.',
    oneSentence:
      'The three practice sessions have different jobs: FP1 establishes a baseline, FP2 gathers race data at representative conditions, and FP3 confirms the qualifying setup.',
    howItWorks:
      '**FP1.** The first running of the weekend. The track is dirty and slow, so absolute times mean little. Teams check that the car works, run installation laps, and begin comparing setup directions. Teams must also give rookie drivers a certain number of FP1 outings across a season, which is why an unfamiliar name sometimes appears.\n\n**FP2.** Usually the most useful session, because at many circuits it runs at a similar time of day to the race, so track and air temperatures are representative. This is where the long runs happen.\n\n**FP3.** Short, and pointed at qualifying. Final setup confirmation and low-fuel running, because after this session the setup is frozen.',
    example:
      'At a race that starts in the late afternoon, FP2 is scheduled to overlap that window. A team’s long run in FP2 is therefore the closest thing they will get to a rehearsal of the opening stint.',
    whyItMatters:
      'Knowing which session is which explains why a headline time is or is not meaningful. A quick lap in FP1 on an empty, green track is nearly meaningless; a consistent long run in FP2 is one of the most predictive things available all weekend.',
    strategic:
      'Because setup is frozen at the start of qualifying, FP3 is the last moment a team can act on anything it has learned. A problem discovered after FP3 has to be raced around rather than fixed.',
    misunderstandings:
      '**"FP1 tells you the pecking order."** It rarely does. The track evolves so much across a weekend that FP1 times are often slower than the same cars manage on old tyres later.',
    related: [
      'free-practice',
      'why-practice-matters',
      'track-evolution',
      'parc-ferme',
      'long-run-pace',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-practice-matters',
    title: 'Why Practice Sessions Matter',
    category: 'race-weekend',
    difficulty: 'intermediate',
    order: 40,
    summary: 'Because the race is planned on Friday, and the plan cannot be revised on Sunday.',
    oneSentence:
      'Practice is where the tyre degradation is measured and the setup is chosen, and both are locked in before the race begins.',
    explanation:
      'Two of the biggest decisions of a Grand Prix are made before qualifying: what the car is set up to do, and how many times it will stop. Neither can be meaningfully changed afterwards. The setup is frozen by parc fermé, and the strategy, while it can be adjusted, rests on degradation numbers that can only be measured in practice.\n\nThat is why teams treat practice as a data-gathering exercise rather than a performance one, and why the timing screens during practice are among the least informative in the sport.',
    howItWorks:
      '**Degradation measurement.** A driver runs eight or ten consecutive laps on one compound while the team records how much lap time is lost per lap. Repeated across compounds, this produces the degradation curves the strategy model runs on.\n\n**Setup comparison.** Back-to-back runs with one variable changed, so the effect can be isolated.\n\n**Correlation checking.** Teams compare what the car actually does against what their simulation predicted. Where the two disagree, the simulation is wrong, and knowing that is worth more than a lap time.',
    example:
      'A team measures that the soft tyre loses about a tenth of a second per lap and the medium about half that. That single comparison is enough to tell them roughly how long each stint can be, and therefore whether one stop is viable.',
    whyItMatters:
      'It reframes what practice is. The sessions are not a warm-up for the race; they are the race’s planning phase, conducted in public, and the teams that read them best arrive on Sunday having already made better decisions than their rivals.',
    misunderstandings:
      '**"Teams hide everything in practice."** They disguise some things, particularly fuel load and engine modes. They cannot hide degradation, because the shape of a long run is visible to everyone with a timing feed, including their rivals.',
    related: [
      'free-practice',
      'fp1-fp2-fp3',
      'degradation-curves',
      'strategy-explained',
      'correlation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'formation-lap',
    title: 'Formation Lap Explained',
    category: 'race-weekend',
    alsoIn: ['the-race', 'glossary'],
    order: 60,
    summary: 'The lap before the race, used to heat the tyres and brakes and to check the car.',
    oneSentence:
      'The formation lap is a single lap from the grid and back to it, driven before the start so that tyres and brakes reach working temperature and the cars line up in grid order.',
    theProcedure:
      '**Cars leave the grid** in starting order at a signal from the race director.\n\n**Drivers weave and brake hard** to generate tyre and brake temperature. This looks erratic and is entirely deliberate: a cold tyre has very little grip, and the start is the moment grip matters most.\n\n**Overtaking is not permitted**, except to recover a position if a car is delayed. The order must be restored before the grid.\n\n**Cars return to their grid slots**, stop, and wait. Once the last car is in position, the starting procedure begins.\n\n**A driver who cannot start** raises a hand, and the lap is repeated. Each repetition reduces the race distance by one lap.',
    whenItHappens: 'Immediately before every standing start, including restarts after a red flag.',
    whyItMatters:
      'Cold tyres and cold brakes are the two things most likely to cause an accident at the start, where twenty cars accelerate together into the first corner. The formation lap exists to remove both.',
    strategic:
      'It is also the last chance to gather information. Drivers report on grip, and teams take a final reading of tyre temperature. A driver who overheats the tyres on the formation lap can find them past their best by the time the lights go out.',
    misunderstandings:
      '**"The weaving is showboating."** It is temperature management. A tyre below its working range has a fraction of its grip.\n\n**"A formation lap counts toward race distance."** It does not. But if the lap has to be repeated, the race is shortened by a lap.',
    related: [
      'the-race-start',
      'lights-out-procedure',
      'tyre-warm-up',
      'standing-start',
      'grid-formation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'starting-grid',
    title: 'Starting Grid Explained',
    category: 'race-weekend',
    alsoIn: ['qualifying'],
    order: 70,
    summary: 'The staggered arrangement of cars at the start, decided by qualifying.',
    explanation:
      'The grid is the set of marked boxes cars start from, arranged two abreast in staggered rows. Pole position is the first box, and each subsequent car lines up slightly behind and to the other side.\n\nThe order comes from qualifying, then is adjusted for any grid penalties. Because penalties are applied after qualifying, the fastest qualifier does not always start first.',
    example:
      'A driver qualifies second but has a five-place grid penalty for a power unit change. They start seventh, and every driver who qualified between third and seventh moves up one place.',
    whyItMatters:
      'Starting position is worth a great deal, because overtaking is difficult. On a circuit where passing is nearly impossible, the grid can effectively decide the result, which is why qualifying at those tracks is treated almost as seriously as the race.',
    misunderstandings:
      '**"The grid is exactly the qualifying order."** Only before penalties are applied. Grid penalties are common enough that the two often differ.',
    related: [
      'pole-position',
      'grid-formation',
      'grid-penalties',
      'qualifying-explained',
      'why-drivers-start-in-different-positions',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'grid-formation',
    title: 'Grid Formation Explained',
    category: 'race-weekend',
    order: 80,
    summary: 'How twenty cars are arranged before a start, and why the rows are staggered.',
    oneSentence:
      'Cars line up in two staggered columns, one per grid slot in qualifying order, with each row set back from the one ahead so that no car is directly behind another.',
    theProcedure:
      '**Slots are marked** on the track surface, in two columns, with rows offset so that the second car of a row sits behind and to the side of the first.\n\n**Cars take their slots** after the formation lap and come to a complete stop within the box.\n\n**Wheels must be within the marked area.** Starting outside it is a starting-position infringement and is penalised.\n\n**Once every car is stationary** and the marshals confirm the grid is clear, the starting light sequence begins.',
    whenItHappens: 'Before every standing start.',
    whyItMatters:
      'The stagger is a safety and a fairness measure at once. It gives every car a clear view and a clear line into the first corner, and it means the second car in a row is not launching into the back of the first.',
    strategic:
      'Which side of the grid a slot is on can matter more than the slot itself. One side of the track is usually the racing line and therefore rubbered-in and grippier; the other is dusty. A car starting on the dirty side can lose places at the start through no fault of its own, which is why drivers sometimes prefer an even-numbered slot on one circuit and an odd one on another.',
    misunderstandings:
      '**"Both sides of the grid are equal."** They frequently are not. The difference in grip between the racing line and the dirty side is one of the most reliable sources of first-corner position change.',
    related: [
      'starting-grid',
      'the-race-start',
      'formation-lap',
      'racing-line',
      'lights-out-procedure',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-drivers-start-in-different-positions',
    title: 'Why Drivers Start From Different Positions',
    category: 'race-weekend',
    alsoIn: ['qualifying'],
    order: 90,
    summary: 'Qualifying sets the order, penalties adjust it, and the pit lane is the last resort.',
    oneSentence:
      'The grid order comes from qualifying times, modified by grid penalties, with cars that break parc fermé or fail to qualify starting from the pit lane.',
    explanation:
      'Three mechanisms decide where a car starts.\n\n**Qualifying.** The primary one. Fastest lap starts first, and so on down the field.\n\n**Grid penalties.** Applied afterwards for offences and for exceeding component allocations. A driver who takes a new power unit beyond their allowance drops a set number of places regardless of how they qualified.\n\n**The pit lane.** A team that changes the car’s setup after parc fermé closes, or that needs to work on a car that cannot be started from the grid, starts from the pit lane behind the field.',
    howItWorks:
      '**Order of application matters.** Penalties are applied to the qualifying order, and drivers below a penalised driver move up. Where several drivers are penalised, they are ordered among themselves by when the penalties were incurred.\n\n**A pit lane start is not a grid slot.** The car starts after the field has passed, from the end of the pit lane, and gains the freedom to change setup in exchange.',
    example:
      'Three drivers take new power unit components in the same weekend. All three drop to the back, and their order among themselves is decided by the sequence in which the changes were notified, not by their qualifying times.',
    whyItMatters:
      'It is why the published grid can look unrelated to the qualifying results, and why a team may deliberately accept a penalty at a circuit where overtaking is easy rather than at one where it is not. Taking the hit at the right track is a strategic decision made weeks in advance.',
    misunderstandings:
      '**"A pit lane start is always worse than starting last."** Not always. It permits setup changes that are otherwise forbidden, so a team with a fundamental problem may prefer it.',
    related: [
      'starting-grid',
      'grid-penalties',
      'parc-ferme',
      'power-unit-penalties',
      'qualifying-explained',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'parc-ferme',
    title: 'Parc Fermé Explained',
    category: 'race-weekend',
    alsoIn: ['car-setup', 'rules-and-penalties'],
    difficulty: 'intermediate',
    order: 100,
    summary: 'The rule that freezes car setup from qualifying until the race, and why it exists.',
    oneSentence:
      'Parc fermé is the condition, beginning when a car leaves the garage for qualifying, under which its setup may not be changed before the race, with only listed maintenance permitted.',
    howItWorks:
      '**When it starts.** At the start of qualifying. From that moment the car’s configuration is fixed.\n\n**What is permitted.** Routine servicing: changing tyres, refuelling, cooling, cleaning, minor repairs, and a short list of adjustments such as front wing angle.\n\n**What is not.** Ride height, suspension geometry, wing specification, gear ratios and anything else that changes the car’s fundamental setup.\n\n**Breaking it.** A team may change what it likes if it accepts a pit lane start. This is a genuine option, not merely a punishment, and teams take it deliberately when the car is badly wrong.\n\n**After the race.** Cars are held again so scrutineers can verify legality before the result is confirmed.',
    example:
      'A team qualifies with a low-downforce rear wing expecting a dry race. Overnight the forecast changes to heavy rain. They cannot fit a bigger wing without starting from the pit lane, so they must either race a car set up for the wrong conditions or give up their grid position.',
    whyItMatters:
      'Parc fermé is the reason setup is a compromise. Without it, teams would run a low-drag configuration for the flying lap and rebuild the car for the race. The rule forces one setup to do both jobs, which makes the choice a real decision with a real cost.\n\nIt also limits spending and overnight work, which is part of why it was introduced.',
    strategic:
      'It turns weather forecasting into a strategic discipline. A team that expects rain must decide before qualifying whether to compromise its grid position for a car that will be better on Sunday, and that bet is unhedgeable once qualifying begins.',
    misunderstandings:
      '**"Teams cannot touch the car at all."** They can service it extensively. What they cannot do is change what kind of car it is.\n\n**"Breaking parc fermé is a penalty."** It is a choice with a known price: starting from the pit lane.',
    related: [
      'qualifying-vs-race-setup',
      'car-setup-explained',
      'why-teams-compromise-setup',
      'why-drivers-start-in-different-positions',
      'scrutineering',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  procedure({
    slug: 'what-happens-after-the-race',
    title: 'What Happens After the Race?',
    category: 'race-weekend',
    order: 110,
    summary:
      'The result is provisional until the cars are weighed, checked and the stewards are done.',
    oneSentence:
      'After the chequered flag the cars return to parc fermé for weighing and technical checks, the podium is held, and the result stays provisional until the stewards close any outstanding investigations.',
    theProcedure:
      '**The slowing-down lap.** Cars complete one more lap and are directed to parc fermé rather than to their garages.\n\n**Weighing and scrutineering.** Cars are weighed and checked against the technical regulations. Fuel samples may be taken. A car below the minimum weight or outside a dimensional tolerance is disqualified, however it finished.\n\n**The podium.** The top three drivers, and a representative of the winning constructor, are presented with trophies.\n\n**Stewards’ business.** Incidents noted during the race are decided. A time penalty applied after the flag is added to a driver’s race time, which can change the finishing order.\n\n**The result is confirmed** once checks and investigations are complete, and only then do the points stand.',
    whenItHappens: 'Immediately after every race.',
    whyItMatters:
      'The podium celebration is not the end of the process. Disqualifications for technical infringements have changed race results, and post-race time penalties routinely reorder the finishing positions, so the classification broadcast at the flag is not always the classification that counts.',
    misunderstandings:
      '**"The result is final at the chequered flag."** It is provisional. Technical checks and stewards’ decisions can both change it, sometimes hours later.\n\n**"A car is disqualified only for cheating."** Many technical disqualifications involve no intent at all: excessive plank wear from running the car too low, or being marginally underweight after a race that used more fuel than expected.',
    related: [
      'scrutineering',
      'race-classification',
      'technical-infringements',
      'disqualification',
      'how-stewards-decide',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Qualifying
 * ────────────────────────────────────────────────────────────────────────── */

const QUALIFYING: ExplainerSeed[] = [
  format({
    slug: 'qualifying-explained',
    title: 'F1 Qualifying Explained',
    category: 'qualifying',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary: 'Three knockout sessions that decide the starting grid, and how each one works.',
    oneSentence:
      'Qualifying is a knockout over three segments: the slowest five cars are eliminated in each of the first two, and the remaining ten contest pole position in the third.',
    howItWorks:
      '**Q1.** All twenty cars run. Each driver’s single fastest lap counts. The five slowest are eliminated and fill the last five grid places in their set order.\n\n**Q2.** Fifteen cars. Again the five slowest are eliminated, taking grid places eleven to fifteen.\n\n**Q3.** Ten cars contest pole position. The fastest lap of this segment starts first.\n\n**Only the single best lap counts** in each segment. Consistency is irrelevant; one perfect lap beats twenty good ones.\n\n**Track time is limited**, so drivers cannot simply keep trying. Each run costs fuel and a set of tyres, and the number of fresh sets available is finite.',
    diagram: QUALIFYING_DIAGRAM,
    example:
      'A driver sets a comfortable time early in Q1, then sees the track speed up as more rubber is laid down. Their time, good enough when set, is now marginal, and they must run again on a fresh set they would rather have saved for Q3.',
    whyItMatters:
      'Because overtaking is hard, the grid substantially shapes the race. At circuits where passing is very difficult, qualifying is close to being the decisive session of the weekend.',
    strategic:
      'Tyre allocation is the constraint that makes qualifying tactical. Every set used in Q1 is a set unavailable in Q3 or in the race. A quick car can afford to run once in Q1 and save rubber; a marginal one may burn two sets simply to survive, and arrive in Q3 with nothing fresh.',
    misunderstandings:
      '**"Your average lap matters."** It does not. Only your fastest lap in each segment counts.\n\n**"The pole-sitter always starts first."** Not if they carry a grid penalty.',
    related: ['q1', 'q2', 'q3', 'pole-position', 'flying-lap', 'grid-penalties'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'q1',
    title: 'Q1 Explained',
    category: 'qualifying',
    order: 20,
    summary:
      'The first knockout: twenty cars, five eliminated, and the most nervous session of the weekend.',
    oneSentence:
      'Q1 is the opening eighteen-minute segment in which all twenty cars run and the five slowest are eliminated, taking the last five places on the grid.',
    howItWorks:
      '**Everyone runs.** Every car must set a time or start from the back.\n\n**Five are eliminated.** The slowest five take grid places sixteen to twenty in the order of their times.\n\n**The track improves throughout.** Rubber laid down by running cars makes the surface faster, so a time set early is worth less than the same time set late.\n\n**Traffic is at its worst.** Twenty cars share the track, and a driver on a preparation lap can ruin somebody else’s flying lap simply by being in the wrong place.',
    example:
      'A driver sets a time that would have been comfortably safe five minutes earlier, and is knocked out in the final seconds by three cars improving on a faster track. Nothing about their lap got worse; the benchmark moved.',
    whyItMatters:
      'Q1 is where the biggest upsets happen, because a single mistake or a single piece of bad traffic ends the session with no chance to respond. A quick car eliminated in Q1 has lost far more than a slow car eliminated in Q1.',
    strategic:
      'Teams with quick cars try to get through on one run and on the harder available compound, saving fresh soft tyres. Teams near the cut-off cannot afford that, and spending two sets in Q1 leaves them worse off later even if they survive.',
    misunderstandings:
      '**"Going out early is safer."** It is usually the opposite. The track is slowest at the start of the session, so an early time is the easiest to beat.',
    related: ['qualifying-explained', 'q2', 'track-evolution', 'qualifying-traffic', 'impeding'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'q2',
    title: 'Q2 Explained',
    category: 'qualifying',
    order: 30,
    summary:
      'Fifteen cars, five more eliminated, and the segment where strategy intrudes on speed.',
    oneSentence:
      'Q2 is the middle segment in which fifteen cars run and the five slowest are eliminated into grid places eleven to fifteen.',
    howItWorks:
      '**Fifteen cars.** The survivors of Q1.\n\n**Five eliminated**, filling grid places eleven to fifteen.\n\n**The track is faster** than in Q1 and traffic is easier, so times drop.\n\n**Tyre choice becomes a real decision** for the quickest teams, who must weigh the certainty of progressing against the cost of using another set.',
    example:
      'A team believes it can reach Q3 on the medium compound. If it succeeds, it has saved a set of softs. If it fails, it has qualified eleventh in a car capable of fifth, and the saving is worthless.',
    whyItMatters:
      'Q2 is where qualifying stops being purely about pace. The decision of which tyre to use, and whether to run once or twice, is a genuine trade between grid position and race resources.',
    strategic:
      'In eras where the tyre used to set a Q2 time also had to start the race, Q2 was the single most strategically loaded session of the weekend. That specific rule has come and gone; the general principle, that tyres spent in qualifying are unavailable on Sunday, has not.',
    misunderstandings:
      '**"Q2 is just a smaller Q1."** The elimination mechanic is the same, but the decisions are not: in Q1 you run to survive, and in Q2 quick teams are already managing their race.',
    related: ['qualifying-explained', 'q1', 'q3', 'tyre-compounds', 'why-different-compounds'],
    era: 'The elimination structure described here is stable, but the rules governing which tyre a driver must start the race on have changed several times and have at points tied the race start directly to the tyre used in Q2. Check the regulations for the season in question before applying this to a specific race.',
    ...SPORTING,
  }),

  format({
    slug: 'q3',
    title: 'Q3 Explained',
    category: 'qualifying',
    order: 40,
    summary: 'Ten cars, fresh tyres, and the laps that decide pole position.',
    oneSentence:
      'Q3 is the final segment, in which the ten remaining cars run for pole position with nothing held back.',
    howItWorks:
      '**Ten cars, twelve minutes.** Typically enough for two runs.\n\n**Maximum attack.** Low fuel, the softest available compound, and the highest power settings the team is willing to use.\n\n**Timing is everything.** The track is usually at its fastest at the very end of the session, so the final runs are the ones that decide it. That also concentrates every car into the same few minutes, which makes traffic and a clean gap ahead genuinely valuable.\n\n**The order sets the front of the grid**, with pole position going to the fastest lap.',
    example:
      'Two drivers leave the pits for their final run seconds apart. The one behind gets a tow down the main straight, gains a tenth on the straight, and loses two tenths in the corners because of the disturbed air. Whether that trade pays depends entirely on how many straights the circuit has.',
    whyItMatters:
      'Pole position is the best available starting place and, at circuits where overtaking is difficult, close to a decisive advantage. Q3 is also the purest performance comparison in the sport: same track, near-identical fuel, everyone trying their hardest.',
    strategic:
      'How many sets of fresh softs a driver has left, decided by their running in Q1 and Q2, determines whether they get two attempts here or one. That is why qualifying is best understood as a single resource-management problem spread over three sessions.',
    misunderstandings:
      '**"Everyone runs the same programme in Q3."** They do not. A driver with one fresh set must make it count on a single run, while a rival with two can use the first to build confidence.',
    related: [
      'qualifying-explained',
      'q2',
      'pole-position',
      'flying-lap',
      'track-evolution',
      'slipstream',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'pole-position',
    title: 'Pole Position Explained',
    category: 'qualifying',
    isStartHere: true,
    order: 50,
    summary: 'First place on the grid, earned by the fastest lap in qualifying.',
    explanation:
      'Pole position is the first grid slot, awarded to the driver who sets the fastest lap in the final segment of qualifying. It is on the side of the track that is usually, though not always, the racing line, and it offers a clear view and a clear run into the first corner.\n\nIt is recorded as a statistic in its own right. A driver’s pole count is one of the standard measures of single-lap performance across a career.',
    example:
      'A driver takes pole by four hundredths of a second. Over a lap of ninety seconds, that is a margin of roughly one part in two thousand, which is why qualifying sessions are decided by details like a single corner exit or a well-timed tow.',
    whyItMatters:
      'Because passing is hard, starting first converts into winning more often than any other grid slot. Pole is also the cleanest available comparison between drivers and cars, since it is set on low fuel with everyone trying.',
    misunderstandings:
      '**"Pole means you start first."** Usually, but not always: a grid penalty applied after qualifying can move the pole-sitter down the grid, and the driver who starts first is then somebody who did not take pole.\n\n**"Pole position is always the better side of the grid."** The pole slot is fixed by the circuit layout, and at some tracks it sits on the dirtier side, which can hand a real advantage to the car alongside.',
    related: [
      'pole-not-always-first',
      'q3',
      'starting-grid',
      'qualifying-explained',
      'grid-formation',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'flying-lap',
    title: 'What Is a Flying Lap?',
    category: 'qualifying',
    alsoIn: ['telemetry', 'glossary'],
    order: 60,
    summary:
      'A lap started at full speed and driven at maximum attack, with the tyres already prepared.',
    oneSentence:
      'A flying lap is a timed lap begun at racing speed rather than from a standstill, with tyres and brakes already at temperature, driven with everything committed.',
    explanation:
      'A qualifying run is three laps, and only the middle one counts. The **out lap** brings the tyres and brakes into their working range. The **flying lap** is the timed one. The **in lap** returns to the pits.\n\nCalling it flying distinguishes it from a standing-start lap: the driver crosses the timing line already at full speed, so the entire lap is run at competitive pace.',
    diagram: OUT_LAP_DIAGRAM,
    example:
      'A driver crosses the line to begin a flying lap with the tyres at the top of their temperature window. By the final sector those tyres have begun to fall away, which is why the last sector of a qualifying lap is often the hardest to get right.',
    whyItMatters:
      'The flying lap is what qualifying measures, and preparing it is most of the skill. A perfect lap on badly prepared tyres is slower than a decent lap on well-prepared ones, which is why the out lap is treated as seriously as the timed one.',
    misunderstandings:
      '**"The driver just goes as fast as possible for one lap."** The lap has to be set up: tyre temperature, brake temperature, battery charge and a clear track are all arranged in advance, and any one of them being wrong costs more than a driving error usually does.',
    related: ['out-lap', 'in-lap', 'qualifying-explained', 'tyre-warm-up', 'perfect-lap'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'out-lap',
    title: 'Out Lap Explained',
    category: 'qualifying',
    alsoIn: ['tyres'],
    difficulty: 'intermediate',
    order: 70,
    summary: 'The lap from the pits that prepares tyres and brakes for a timed run.',
    oneSentence:
      'An out lap is the lap between leaving the pit lane and starting a timed lap, driven to bring tyres and brakes into their working temperature range rather than to set a time.',
    explanation:
      'A cold Formula 1 tyre has a small fraction of the grip of a hot one, and carbon brakes barely work below their operating temperature. The out lap exists to fix both.\n\nDrivers weave to generate heat through the sidewalls, accelerate and brake hard in short bursts, and sometimes run deliberately slowly to let the brakes soak heat into the tyres. The result looks chaotic and is precisely calculated: the target is a specific temperature at a specific corner, one lap later.',
    example:
      'A driver arrives at the final corner of their out lap with the tyres a few degrees below target. They accelerate hard out of it and brake unnecessarily on the straight, sacrificing a small amount of position on the track to gain temperature that is worth several tenths on the lap that follows.',
    whyItMatters:
      'Out laps decide qualifying more often than most viewers realise. Two drivers of equal ability in equal cars can be separated by two tenths purely because one prepared the tyres better, and the difference is invisible on the timing screen because out laps are not timed.',
    misunderstandings:
      '**"Slower out lap means better preparation."** Not necessarily. Some tyres need energy put into them and some need to be kept cool; the right out lap depends on the compound, the track temperature and how far away the tyre is from its window.\n\n**"Out laps do not matter to other drivers."** They matter enormously. A driver preparing tyres is slow, and a slow car in the way of a flying lap is the source of most impeding penalties.',
    related: [
      'flying-lap',
      'in-lap',
      'tyre-warm-up',
      'tyre-temperature',
      'impeding',
      'qualifying-traffic',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'in-lap',
    title: 'In Lap Explained',
    category: 'qualifying',
    difficulty: 'intermediate',
    order: 80,
    summary: 'The lap back to the pits after a timed run or a race stint.',
    oneSentence:
      'An in lap is the lap on which a car returns to the pit lane, driven to cool components and save fuel in qualifying, and driven as fast as possible in a race.',
    explanation:
      'The term covers two very different laps.\n\n**In qualifying**, the in lap is a recovery lap. The driver cools the tyres and brakes, saves fuel, and gets out of the way of anybody still running. It is deliberately slow.\n\n**In a race**, the in lap is the opposite: the lap before a pit stop is driven flat out, because every tenth gained on it is a tenth carried into the stop. A quick in lap is one of the two halves of a successful undercut.',
    example:
      'A driver told to pit at the end of the current lap is simultaneously told to push. Fresh tyres are coming, so there is nothing left to preserve, and the time gained is banked directly against the rival they are trying to jump.',
    whyItMatters:
      'The distinction matters for reading a race. A slow in lap in qualifying is correct behaviour; a slow in lap in a race is lost time that cannot be recovered, and is one of the commonest ways a well-planned pit stop fails to achieve what it was meant to.',
    misunderstandings:
      '**"An in lap is always slow."** Only in qualifying. In a race it is among the fastest laps a driver will do, because the tyres are about to be replaced anyway.',
    related: ['out-lap', 'flying-lap', 'undercut', 'pit-window', 'pit-loss'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'qualifying-traffic',
    title: 'Qualifying Traffic Explained',
    category: 'qualifying',
    difficulty: 'intermediate',
    order: 100,
    summary: 'Why twenty cars sharing one track ruins laps, and what teams do about it.',
    oneSentence:
      'Traffic in qualifying is the problem of finding clear track for a flying lap when every car wants the same few seconds of it, and a car encountered at the wrong moment can cost more time than any driving error.',
    explanation:
      'Everybody wants to run at the end of the session, when the track is fastest. That concentrates twenty cars into the same window, and the cars are doing two incompatible things: some are on slow out laps preparing tyres, and some are on flying laps.\n\nA driver who catches a slow car mid-corner loses the lap outright. Even a car several seconds ahead can ruin a lap, because it leaves disturbed air that costs downforce through fast corners.',
    howItWorks:
      '**Gap management.** Teams direct drivers to build a gap on the out lap, which is why cars are sometimes seen crawling and bunching before a run.\n\n**Spotting.** Engineers relay the position of other cars over the radio so a driver can adjust.\n\n**The rules.** Drivers are required not to unnecessarily obstruct a car on a flying lap, and the stewards issue penalties for impeding. Race directors also set maximum lap times to stop cars crawling dangerously.\n\n**It fails anyway.** With ten teams pursuing the same optimum, some cars will always meet at the wrong moment.',
    example:
      'A driver builds a five-second gap on the out lap, only for the car ahead to slow further to build its own gap. Both arrive at the final corner together, and both laps are compromised. Neither did anything wrong.',
    whyItMatters:
      'Traffic is a major source of grid positions that do not reflect car performance. A quick car eliminated in Q1 through traffic starts sixteenth and will spend the race recovering, which distorts the result far beyond the session it happened in.',
    misunderstandings:
      '**"Being in front is always better."** Not in the last minutes of a session, when the track is still improving. A driver at the front of the queue has clear air but an earlier, slower track.',
    related: ['impeding', 'q1', 'out-lap', 'track-evolution', 'dirty-air'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'why-lap-times-improve-in-qualifying',
    title: 'Why Lap Times Improve During Qualifying',
    category: 'qualifying',
    difficulty: 'intermediate',
    order: 120,
    summary:
      'The track gets faster as the session goes on, and it is not only the drivers improving.',
    oneSentence:
      'Lap times fall through qualifying mainly because the track surface rubbers in and grips better, with falling fuel loads, cooling temperatures and driver familiarity adding to the effect.',
    explanation:
      'Four things improve during a session, and only one of them is the driver.\n\n**The track rubbers in.** Every car lays a thin film of rubber on the racing line, and that rubber grips better than bare tarmac. This is the largest effect, and it is why times keep dropping even when nothing else changes.\n\n**Temperatures move.** As a session runs into the evening, track and air temperature usually fall, which for most compounds means more grip.\n\n**Fuel burns off.** Qualifying runs are on low fuel, but a car is still lighter at the end of a run than at the start.\n\n**Drivers learn.** Confidence and reference points improve with laps, particularly at unfamiliar circuits.',
    howItWorks:
      '**The effect compounds.** More cars running means faster rubbering-in, which means more cars want to run late, which lays more rubber still.\n\n**It is not uniform.** A track can also get slower: rising temperature, wind changes or a sudden shower reverse the trend, and drivers who assumed improvement get caught out.',
    example:
      'A driver sets a time in the first minutes of Q1 and is knocked out having never improved it, despite it being quick enough for tenth when it was set. Their lap did not get worse; the track got better.',
    whyItMatters:
      'It changes what a lap time means. A time is only comparable to another time set in similar track conditions, which is why comparing a driver’s Q1 lap with a rival’s Q3 lap tells you almost nothing.',
    misunderstandings:
      '**"Everyone gets the same track."** They do not. When a driver sets their lap is as much a part of the result as how they drove it.',
    related: [
      'track-evolution',
      'qualifying-explained',
      'q1',
      'track-temperature',
      'fuel-correction',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  rule({
    slug: 'deleted-lap-times',
    title: 'Deleted Lap Times Explained',
    category: 'qualifying',
    alsoIn: ['rules-and-penalties'],
    difficulty: 'intermediate',
    order: 130,
    summary: 'A lap struck from the results, almost always for exceeding track limits.',
    oneSentence:
      'A deleted lap time is one removed from the classification because the driver broke a rule while setting it, most often by putting all four wheels beyond the white line marking the track edge.',
    howItWorks:
      '**The usual cause is track limits.** A lap is deleted if the car has all four wheels beyond the white line at any point on it.\n\n**Detection is automated where possible.** Loops and cameras flag transgressions, which the race director’s team reviews.\n\n**The whole lap goes.** Not just the corner, and not a time penalty: the lap simply does not exist.\n\n**It can happen after the session.** Reviews take time, so a driver can appear to have qualified fifth and be moved to eleventh some minutes later.\n\n**Other causes exist.** A lap set under a yellow flag without slowing, or one set with an infringement such as exceeding a maximum permitted lap time, can also be removed.',
    example:
      'A driver runs slightly wide at the exit of the last corner, gaining a small amount of speed onto the straight. The lap is deleted, and because it was their final run they have no opportunity to replace it.',
    whyItMatters:
      'Deletions are the most common way a qualifying result changes after the flag, and at circuits with wide asphalt run-off they can affect a large number of laps in a single session.',
    strategic:
      'It changes how drivers approach a lap. Where limits are policed tightly, a driver must leave a margin at the exit of the offending corners, and the fastest theoretical line is not available to them at all.',
    misunderstandings:
      '**"Two wheels over is enough."** It is not. The standard is all four wheels beyond the line.\n\n**"A deleted lap is a penalty."** It is not a penalty; the time is simply void. A penalty is a separate matter and can be applied in addition.',
    related: [
      'track-limits',
      'white-line-rules',
      'track-limits-penalties',
      'why-track-limits-differ',
      'qualifying-explained',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'pole-not-always-first',
    title: "Why Pole Position Doesn't Always Mean Starting First",
    category: 'qualifying',
    difficulty: 'intermediate',
    order: 150,
    summary:
      'Penalties are applied after qualifying, so the fastest qualifier can start well down the grid.',
    oneSentence:
      'Pole position is awarded for the fastest qualifying lap, but grid penalties are applied afterwards, so a penalised pole-sitter starts lower and somebody else leads the field away.',
    explanation:
      'Qualifying and the grid are two different things. Qualifying produces an order of merit, and pole position is a record of having been fastest. The grid is that order after every penalty has been applied.\n\nGrid penalties come from several places: exceeding power unit or gearbox component allowances, impeding another driver, causing a collision in a previous race, or various technical infringements.',
    howItWorks:
      '**The statistic survives.** A driver who takes pole and starts sixth is still credited with pole position in the records.\n\n**Everybody below moves up.** A five-place penalty for the pole-sitter promotes the next five qualifiers by one place each.\n\n**Some penalties are unlimited.** A driver taking a large number of new power unit elements can be sent to the back of the grid regardless of where they qualified.',
    example:
      'A driver qualifies fastest but has already used their allocation of engine components. They take a new one, accept a back-of-grid start, and the driver who qualified second leads the field away on Sunday while the records show the first driver on pole.',
    whyItMatters:
      'It explains a genuinely confusing broadcast moment, and it is also strategically deliberate. Teams choose which weekend to take a penalty, preferring circuits where overtaking is easy so that the cost of starting at the back is as small as possible.',
    misunderstandings:
      '**"Losing the grid slot means losing the pole."** No. The pole position statistic is awarded on qualifying performance and is unaffected by a subsequent penalty.',
    related: [
      'pole-position',
      'grid-penalties',
      'power-unit-penalties',
      'starting-grid',
      'why-drivers-start-in-different-positions',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

export const FORMULA1_WEEKEND: ExplainerSeed[] = [...WEEKEND, ...QUALIFYING];
