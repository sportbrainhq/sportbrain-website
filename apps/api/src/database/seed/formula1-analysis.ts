import type { ExplainerSeed } from './explainer-types';
import {
  article,
  circuit,
  definition,
  penalty,
  role,
  rule,
  statistic,
  technical,
} from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING, TECHNICAL } from './formula1-explainers';

/**
 * Telemetry, circuits, weather, rules, teams and performance analysis.
 *
 * The library's remaining categories. They are grouped here rather than split
 * into six short files because each is medium-sized and they share a great deal
 * of cross-referencing: a sector time is a telemetry concept, a circuit
 * property and an analytical input at once.
 *
 * ## On derived metrics
 *
 * The brief asks for the Performance Analysis category to be clearly labelled
 * as analytical rather than official, and that instruction is taken seriously
 * here. Every entry in that section uses the `statistic` template, whose
 * `limitations` field is mandatory, and each one states in its own words that
 * it is a derived model rather than an FIA statistic. The distinction is the
 * point of the category: tyre-corrected pace is an estimate produced by
 * assumptions, and a reader who does not know that will quote it as a fact.
 */

/* ────────────────────────────────────────────────────────────────────────────
 * Telemetry and lap time
 * ────────────────────────────────────────────────────────────────────────── */

const TELEMETRY: ExplainerSeed[] = [
  statistic({
    slug: 'telemetry-explained',
    title: 'F1 Telemetry Explained',
    category: 'telemetry',
    isStartHere: true,
    isFeatured: true,
    difficulty: 'intermediate',
    order: 10,
    readMinutes: 5,
    summary: 'The continuous stream of data from the car, and what engineers do with it.',
    oneSentence:
      'Telemetry is the live stream of sensor data transmitted from the car to the team, covering speed, throttle, brake, gear, steering, temperatures and hundreds of other channels many times per second.',
    measures:
      'Everything the car can be instrumented to report. The channels a viewer sees, speed, throttle position, brake pressure, gear and steering angle, are a small selection from a set numbering in the hundreds, most of which concern the health of the car rather than its performance.',
    formula:
      'Sensors sample continuously and transmit to the garage, where the data is aligned against distance around the lap rather than against time. Aligning by distance is what makes two laps comparable: the same corner appears at the same point on the horizontal axis regardless of how quickly each driver reached it.',
    workedExample:
      'Comparing two laps, an engineer overlays the speed traces. Where one trace sits above the other, that driver was quicker at that point. The throttle and brake traces underneath then explain why: a later brake application, a longer period at full throttle, or a smoother release through the corner.',
    interpret:
      'Telemetry answers where time was gained or lost, and rarely answers why on its own. A driver who is slower through a corner may have less grip, a different setup, older tyres, or be following another car. The trace shows the difference; the explanation requires the context.',
    limitations:
      'Teams see their own cars only. The data broadcast publicly is a small, delayed and sometimes smoothed subset, and comparisons made from it are much rougher than those a team makes internally.\n\nMore importantly, telemetry cannot separate the car from the driver. A slower trace through a corner is a fact about the car-and-driver combination on that lap, and attributing it to one or the other requires assumptions that the data does not supply.',
    related: [
      'speed-trace',
      'throttle-trace',
      'brake-trace',
      'delta-time',
      'lap-comparison',
      'sector-times',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  statistic({
    slug: 'speed-trace',
    title: 'Speed Traces Explained',
    category: 'telemetry',
    difficulty: 'advanced',
    order: 20,
    summary: 'A graph of speed against distance, and the first thing an engineer looks at.',
    oneSentence:
      'A speed trace plots the car’s speed against distance around the lap, so two laps can be overlaid and the exact points where time was gained or lost identified.',
    measures:
      'Road speed at every point on the lap, plotted against distance rather than time so that laps of different durations remain comparable.',
    formula:
      'Speed is derived from wheel speed sensors and GPS. Plotting against distance means each corner appears at a fixed horizontal position, so two traces can be overlaid directly.',
    workedExample:
      'On a straight, a trace that rises earlier indicates better corner exit; one that reaches a higher peak indicates less drag or more power. In a corner, the lowest point of the trace is the minimum speed, and a higher minimum means more grip or more commitment.',
    interpret:
      'Read the shape rather than the values. A trace that dips deeply and recovers sharply suggests a driver braking hard and accelerating early; one with a rounded bottom suggests carrying more speed through the middle of the corner. Neither is inherently better, and which is faster depends on what follows.',
    limitations:
      'A speed trace shows what happened without saying why. Two drivers with different minimum speeds may have different setups, different tyre ages, different fuel loads or different engine modes, none of which the trace reveals.\n\nPublic telemetry is also smoothed and sampled less frequently than the team’s own, so small differences visible in a broadcast graphic may be artefacts.',
    related: [
      'telemetry-explained',
      'throttle-trace',
      'brake-trace',
      'lap-comparison',
      'corner-exit',
      'delta-time',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  statistic({
    slug: 'sector-times',
    title: 'Sector Times Explained',
    category: 'telemetry',
    alsoIn: ['circuits'],
    isStartHere: true,
    order: 80,
    summary:
      'The lap split into three parts, so performance can be located rather than just measured.',
    oneSentence:
      'Every circuit is divided into three timed sectors, so a lap time can be broken into parts and a driver’s strength or weakness located on a specific section of track.',
    measures:
      'The time taken to complete each of the three sections a lap is divided into. The divisions are fixed for each circuit and are the same for every driver.',
    formula:
      'Timing loops embedded in the track record each car as it passes. The three sector times sum to the lap time.',
    workedExample:
      'A driver is two tenths slower over a lap. Their sector times show they were level in the first sector, three tenths slower in the second, and a tenth quicker in the third. The problem is located in the middle sector, which might be a section of fast corners where their car has less downforce.',
    interpret:
      'Sector colours indicate standing: purple for the fastest of anybody in the session, green for a personal best, yellow otherwise. A driver setting two purple sectors and a yellow third has lost their lap somewhere specific.',
    limitations:
      'Three sectors is a coarse division. A sector may contain a straight and several corners, so a deficit within it could come from any of them, which is why teams use much finer mini-sectors internally.\n\nSector times also compare laps set at different moments on an evolving track, so a slower sector may reflect when the lap was set rather than how it was driven.',
    related: [
      'mini-sectors',
      'purple-sector',
      'delta-time',
      'lap-time-explained',
      'sector-analysis',
      'sector',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  statistic({
    slug: 'delta-time',
    title: 'Delta Time Explained',
    category: 'telemetry',
    difficulty: 'intermediate',
    order: 100,
    summary: 'The running difference between this lap and a reference, updated continuously.',
    oneSentence:
      'Delta time is the live, continuously updated difference between a driver’s current lap and a reference lap, shown on the steering wheel so the driver knows whether they are ahead or behind.',
    measures:
      'The accumulated time difference at every point on the lap, relative to a chosen reference: the driver’s own best, a rival’s lap, or a target set by the team.',
    formula:
      'At each point on the lap, the time taken to reach that point is compared against the time taken to reach the same point on the reference lap. The difference is the delta, and it moves continuously rather than being reported once per lap.',
    workedExample:
      'A driver on a flying lap sees minus one tenth at the end of the first sector and minus three tenths by the second. They are ahead of their reference and gaining, and the gain is coming from the middle sector.',
    interpret:
      'The direction of change matters more than the value. A delta of plus two tenths that has been shrinking through the lap means the driver is currently faster than the reference, even though they are still behind overall.',
    limitations:
      'A delta is only as meaningful as its reference. A comparison against a lap set on fresher tyres, lower fuel or a different track state is not a comparison of driving.\n\nUnder a virtual safety car the delta serves a different purpose entirely, as a minimum time the driver must not beat, and confusing the two readings is a common error.',
    related: ['sector-times', 'lap-comparison', 'flying-lap', 'virtual-safety-car', 'speed-trace'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  definition({
    slug: 'purple-sector',
    title: 'Purple Sector Explained',
    category: 'telemetry',
    order: 160,
    summary: 'The fastest time anybody has set in that sector during the session.',
    explanation:
      'Timing screens colour sector and lap times to show their standing. **Purple** means the fastest time set by anybody in that sector during the session. **Green** means a personal best for that driver, but not the session’s fastest. **Yellow** means neither.\n\nA driver who sets all three sectors purple has, by definition, set the fastest lap of the session.',
    example:
      'A driver has two purple sectors and a yellow third. They were on course for the fastest lap and lost it in the final section, which usually means either a mistake or tyres that fell away before the end.',
    whyItMatters:
      'The colours are the quickest way to read a session. They show not just who is fastest but where each driver is finding or losing time, which is far more informative than the lap times alone.',
    misunderstandings:
      '**"Purple sectors mean the fastest lap."** Only if the same driver holds all three. Purple sectors held by three different drivers produce a theoretical best lap that nobody has actually driven.',
    related: [
      'sector-times',
      'personal-best-vs-session-best',
      'perfect-lap',
      'lap-time-explained',
      'mini-sectors',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  statistic({
    slug: 'fuel-correction',
    title: 'Fuel Correction Explained',
    category: 'telemetry',
    alsoIn: ['analysis'],
    difficulty: 'advanced',
    order: 170,
    summary:
      'Adjusting lap times for the weight of fuel, to compare laps that were not comparable.',
    oneSentence:
      'Fuel correction is the adjustment applied to lap times to account for the car getting lighter as fuel burns off, so laps from different points in a stint can be compared.',
    measures:
      'The lap time a car would have set had it been carrying a standard fuel load, rather than the time it actually set with whatever fuel it happened to be carrying.',
    formula:
      'Every kilogram of fuel costs roughly a fixed amount of lap time, a figure that varies by circuit and is typically a few hundredths of a second per kilogram. Multiplying the fuel burned by that rate gives the correction, which is added back to later laps in a stint to make them comparable with earlier ones.',
    workedExample:
      'A driver’s lap times improve steadily through a stint. Corrected for fuel, the improvement disappears and a slight decline appears instead, which is the tyre degradation that the fuel effect had been masking. The uncorrected trend was the opposite of the truth.',
    interpret:
      'Fuel correction is what makes long-run analysis possible. Without it, every stint appears to get faster, because the car is getting lighter faster than the tyres are degrading, and no useful conclusion about the tyres can be drawn.',
    limitations:
      'This is a derived adjustment, not a measurement, and it rests on two things nobody outside the team knows precisely: the fuel effect at that circuit and how much fuel the car actually started with.\n\nPublic analysis therefore uses estimated values for both, and the resulting corrected times are approximations. They are useful for comparing shapes and trends and should not be quoted as though they were measured lap times.',
    related: [
      'long-run-pace',
      'fuel-corrected-lap-times',
      'degradation-curves',
      'why-race-laps-are-slower',
      'race-pace-analysis',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  article({
    slug: 'why-qualifying-laps-are-faster',
    title: 'Why Qualifying Laps Are Faster',
    category: 'telemetry',
    order: 180,
    summary: 'Minimum fuel, fresh tyres, maximum power, and nothing to preserve.',
    oneSentence:
      'A qualifying lap is faster than any race lap because the car carries almost no fuel, the tyres are new, the power unit is used at its highest setting, and nothing needs to survive beyond the next ninety seconds.',
    explanation:
      'The gap between a qualifying lap and a race lap is large, often several seconds, and almost none of it is driver effort.',
    howItWorks:
      '**Fuel.** A qualifying car carries only enough fuel for its run. A race car starts with the full distance aboard, which is a substantial weight penalty.\n\n**Tyres.** New, of the softest available compound, and used for one lap.\n\n**Power.** The highest available settings, with energy deployment concentrated into a single lap rather than budgeted across a race.\n\n**No preservation.** Nothing has to last. Brakes, tyres and power unit can all be used at maximum.\n\n**Clear track.** No dirty air, no traffic, no defending.',
    example:
      'The same driver, in the same car, on the same day, is several seconds a lap slower on the opening lap of the race than in qualifying. Nothing about them has changed; the car is heavier, the tyres must last, and the energy must be budgeted.',
    whyItMatters:
      'It explains why practice and qualifying times cannot be compared with race times, and why a driver setting a lap in the closing laps of a race on fresh tyres and low fuel may set a fastest lap that looks anomalous and is not.',
    misunderstandings:
      '**"Drivers are not trying in the race."** They are managing finite resources across two hours instead of spending everything in ninety seconds. It is a different problem with a different solution.',
    related: ['why-race-laps-are-slower', 'fuel-correction', 'flying-lap', 'engine-modes', 'q3'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'perfect-lap',
    title: 'What Makes a Perfect Lap?',
    category: 'telemetry',
    difficulty: 'intermediate',
    order: 200,
    summary: 'Every corner optimised at once, which is why it almost never happens.',
    oneSentence:
      'A perfect lap is one in which every corner is executed optimally, which is extremely rare because optimising one corner often compromises the next.',
    explanation:
      'Timing systems compute a theoretical best lap by adding together each driver’s fastest sectors. That figure is almost always quicker than any lap actually set, and the gap is a measure of how hard it is to get everything right at once.\n\nThe difficulty is not just consistency. Corners are linked: a line that maximises speed through one may compromise entry to the next, so the fastest possible lap is not the sum of independently fastest corners.',
    howItWorks:
      '**Tyres have a window.** They reach peak grip for a short period, and a lap that arrives at the final sector after that window has closed cannot be perfect however well it is driven.\n\n**Energy is finite.** Deployment must be distributed, so full power is not available everywhere.\n\n**Corners interact.** Optimising a corner in isolation can cost more in the one that follows.\n\n**Track evolution.** The optimal lap is a moving target, since grip changes through a session.',
    example:
      'A driver takes pole with a lap two tenths slower than the sum of their own best sectors. Those sectors were set on different laps, and no single run allowed all three, because the tyres were past their best by the final sector on every attempt.',
    whyItMatters:
      'It reframes what a qualifying lap is. A driver is not trying to drive every corner perfectly; they are trying to find the combination of compromises that produces the lowest total, which is a different and harder problem.',
    misunderstandings:
      '**"The theoretical best lap is achievable."** It is a sum of sectors from different laps, often set in different conditions and on different tyre states, and it usually could not have been driven as one lap.',
    related: [
      'sector-times',
      'purple-sector',
      'flying-lap',
      'gaining-tenths',
      'track-evolution',
      'energy-deployment',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Circuits and weather
 * ────────────────────────────────────────────────────────────────────────── */

const CIRCUITS: ExplainerSeed[] = [
  circuit({
    slug: 'circuits-explained',
    title: 'F1 Circuits Explained',
    category: 'circuits',
    isStartHere: true,
    order: 10,
    summary: 'What a Formula 1 circuit is, and the features that define how it races.',
    oneSentence:
      'A Formula 1 circuit is a closed course of corners and straights, and its combination of corner types, straight lengths, surface and run-off determines both which cars suit it and whether overtaking is possible.',
    howItPlays:
      '**Corner mix.** The balance of slow, medium and fast corners determines how much downforce is worth running.\n\n**Straight length.** Long straights reward low drag and create overtaking opportunities.\n\n**Surface.** Abrasiveness governs tyre wear; smoothness allows a stiffer, lower setup.\n\n**Elevation and camber.** Both change how much grip is available and how the car behaves through a corner.\n\n**Run-off.** Asphalt run-off makes mistakes cheap and track limits contentious; gravel and walls make them expensive.\n\n**Width.** A narrow circuit has no room for two cars, which suppresses overtaking regardless of straight length.',
    whyItMatters:
      'The circuit is the single largest external variable in a Grand Prix weekend. The same twenty cars produce different competitive orders and completely different racing from one weekend to the next, and the circuit is why.',
    whoItSuits:
      'A car with an efficient aerodynamic package suffers less when downforce is stripped away and is relatively stronger at low-downforce circuits. A car with strong mechanical grip and good traction is stronger at slow, twisty ones.',
    example:
      'A team dominant at a circuit of long straights can be midfield two weeks later at a twisty one, with no change to the car beyond setup. Neither result describes the team’s true competitiveness on its own.',
    misunderstandings:
      '**"A good car is good everywhere."** Very few are. Most cars have a profile, and the calendar decides how often that profile is rewarded.',
    related: [
      'street-vs-permanent',
      'track-layout',
      'why-circuits-suit-different-cars',
      'track-surface',
      'why-some-circuits-are-hard-to-overtake',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  circuit({
    slug: 'street-vs-permanent',
    title: 'Street Circuit vs Permanent Circuit',
    category: 'circuits',
    isStartHere: true,
    order: 20,
    summary: 'Public roads closed for a weekend, against purpose-built racing facilities.',
    oneSentence:
      'A street circuit is laid out on public roads closed for the event, while a permanent circuit is purpose-built for racing, and the two produce very different racing.',
    howItPlays:
      '**Street circuits.** Narrow, bumpy, lined with walls, with little or no run-off. The surface is not designed for racing and offers less grip, particularly early in a weekend. Overtaking is difficult and mistakes are expensive.\n\n**Permanent circuits.** Wide, smooth, with designed run-off areas and corner sequences intended to produce racing. Mistakes usually cost time rather than the car.\n\n**Track evolution differs sharply.** A street circuit starts dirty and improves enormously across a weekend, because public roads carry no racing rubber. A permanent circuit evolves less.\n\n**Setup differs.** Street circuits need a softer, higher car that can absorb bumps and kerbs; permanent circuits allow a stiffer, lower one.',
    whyItMatters:
      'The distinction predicts much of a weekend. At a street circuit, qualifying matters more, safety cars are more likely, track evolution is larger, and the racing is more likely to be decided by strategy than by overtaking.',
    whoItSuits:
      'Street circuits reward high downforce, mechanical compliance and driver confidence next to walls. Permanent circuits reward aerodynamic efficiency and are more forgiving of a car that needs space to work.',
    example:
      'A team arrives at a street circuit with a car that is quick over smooth surfaces and struggles over the bumps and kerbs. The same car is competitive again at the next permanent circuit without any development having been added.',
    misunderstandings:
      '**"Street circuits are just narrow permanent circuits."** The surface, the evolution, the run-off and the consequence of an error all differ, and each of those changes how the weekend is approached.',
    related: [
      'circuits-explained',
      'track-evolution',
      'track-surface',
      'run-off-areas',
      'why-some-circuits-are-hard-to-overtake',
      'safety-car',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'sector',
    title: 'Sector Explained',
    category: 'circuits',
    alsoIn: ['telemetry', 'glossary'],
    order: 40,
    summary: 'One of the three timed divisions of a lap.',
    explanation:
      'Every circuit is divided into three sectors by timing lines. The divisions are fixed for each track and identical for every driver, so sector times are directly comparable.\n\nSectors exist to locate performance. A lap time says how quick somebody was; sector times say where.',
    example:
      'A circuit might have a first sector of long straights, a second of fast corners and a third of slow ones. A car strong on power will be quick in the first and may lose everything it gained in the third.',
    whyItMatters:
      'Sectors are how a weekend is read. Comparing sector times between cars reveals whether a deficit comes from straight-line speed, high-speed cornering or traction, which is the first step in understanding why one car is quicker than another.',
    misunderstandings:
      '**"Sectors are equal in length."** They are not. The divisions are chosen per circuit and the three sections can differ considerably in both distance and duration.',
    related: ['sector-times', 'mini-sectors', 'purple-sector', 'track-layout', 'sector-analysis'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'kerbs',
    title: 'Kerbs Explained',
    category: 'circuits',
    alsoIn: ['glossary'],
    order: 120,
    summary: 'The raised strips at the edge of the track, used deliberately and at a cost.',
    explanation:
      'Kerbs are the raised, usually striped strips marking the edge of the track at corners. Drivers use them deliberately to straighten a corner and gain lap time, riding over them at the apex and the exit.\n\nSome are flat and can be used freely. Others, called sausage kerbs, are aggressive by design and are placed specifically to discourage drivers from cutting a corner or running wide.',
    example:
      'A driver takes a chicane by riding hard over the kerbs, straightening the corner and gaining a tenth. On a car set up stiffly, the same kerb unsettles the car enough to cost more than it gains.',
    whyItMatters:
      'Kerb usage is a genuine setup constraint. A car that can ride kerbs is faster at circuits with chicanes and street sections, and suspension stiffness chosen for aerodynamic stability often makes a car unable to use them.',
    misunderstandings:
      '**"Going over the kerb means leaving the track."** The kerb is generally part of the track. What matters for track limits is the white line, and where a car goes beyond it.\n\n**"Kerbs are only there to mark the edge."** Many are shaped specifically to penalise drivers who go where they should not.',
    related: ['track-limits', 'white-line-rules', 'suspension-setup', 'chicane', 'run-off-areas'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'track-evolution',
    title: 'Track Evolution Explained',
    category: 'qualifying',
    alsoIn: ['circuits', 'telemetry'],
    difficulty: 'intermediate',
    order: 110,
    summary:
      'The circuit gets faster as cars lay rubber, and it changes everything about session timing.',
    oneSentence:
      'Track evolution is the improvement in grip across a session or weekend as cars lay rubber onto the racing line, which makes lap times fall for reasons unconnected to the drivers.',
    howItWorks:
      '**Rubber builds up.** Each car deposits a thin film of rubber on the racing line, and rubber grips better than bare tarmac.\n\n**The effect is largest where there was least rubber.** A street circuit, closed to racing all year, evolves enormously. A permanent circuit that hosted testing evolves far less.\n\n**It compounds.** More running produces more rubber, which makes later running faster still, which is why drivers want to run at the end of a session.\n\n**It can reverse.** Rain washes the rubber away, and rising temperatures or wind can reduce grip even as rubber accumulates.',
    whyItMatters:
      'Evolution means a lap time is only meaningful alongside when it was set. It is the single biggest reason drivers are eliminated in Q1 having set a time that would have been safe minutes earlier, and it is why practice times must be read with care.',
    example:
      'At a street circuit, lap times fall by several seconds between the start of first practice and the end of qualifying. Almost none of that improvement is drivers learning the track; it is the track itself becoming a different surface.',
    tradeoffs:
      'Running late means a faster track and more traffic, and any red flag or accident in the closing minutes means a driver who waited has no lap at all. Running early is safe and slow.',
    misunderstandings:
      '**"The drivers just improved."** Some of it is that. Most of it is the surface, which is why the same driver on the same tyres can be a second quicker at the end of a session than at the start.',
    related: [
      'why-lap-times-improve-in-qualifying',
      'q1',
      'street-vs-permanent',
      'track-surface',
      'qualifying-traffic',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'how-rain-changes-f1',
    title: 'How Rain Changes F1',
    category: 'weather',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'Less grip, worse visibility, and a race where the fastest car matters less.',
    oneSentence:
      'Rain reduces grip dramatically, forces a change to treaded tyres, cuts visibility to almost nothing in spray, and raises the influence of driver skill and strategic timing above car performance.',
    explanation:
      'A wet track changes every assumption a Formula 1 weekend is built on. Grip falls, so braking distances lengthen and cornering speeds drop. The racing line, normally the grippiest part of the track, becomes the most slippery, because the rubber laid into it holds water.\n\nTyre choice becomes the dominant strategic question, and the timing of a change between compounds can be worth more than everything else that happens in the race.',
    howItWorks:
      '**Tyres change.** Slicks are unusable. Intermediates handle a damp track, full wets handle standing water.\n\n**The line moves.** Drivers run off the dry line to find grip.\n\n**Visibility collapses.** Spray from the car ahead can make following almost blind, which is a safety issue rather than merely a competitive one.\n\n**Aquaplaning becomes possible.** A tyre riding on water has no grip and gives no warning.\n\n**The mandatory compound rule lapses.** Once wet tyres have been used, the requirement to use two dry compounds no longer applies.\n\n**Races may be neutralised or stopped.** In extreme conditions the decision passes from the teams to the race director.',
    example:
      'A dry race is a contest between cars, and a wet one is a contest between drivers and pit walls. Some of the sport’s most celebrated individual performances happened in the rain, precisely because the machinery mattered less.',
    whyItMatters:
      'Rain is the largest source of unpredictability in Formula 1. It compresses the field, rewards drivers who can find grip that is not obvious, and turns tyre timing into a decision worth thirty seconds rather than three.',
    misunderstandings:
      '**"They stop racing because of a bit of rain."** Races are stopped for visibility and aquaplaning, which are safety limits rather than comfort ones. Cars can have grip and still be undriveable because nobody can see.',
    takeaways:
      '- Grip falls sharply and the dry racing line becomes the slippery one.\n- Intermediates cover most wet running; full wets are for standing water.\n- Visibility, not grip, is usually what stops a race.\n- The crossover between compounds is the highest-value strategic call available.\n- Driver skill matters more relative to car performance than in the dry.',
    related: [
      'wet-weather-driving',
      'intermediate-tyres',
      'crossover-point',
      'aquaplaning',
      'weather-strategy',
      'visibility-in-the-wet',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'aquaplaning',
    title: 'Aquaplaning Explained',
    category: 'weather',
    difficulty: 'intermediate',
    order: 20,
    summary: 'The tyre rides up onto water and loses contact with the road entirely.',
    oneSentence:
      'Aquaplaning happens when a tyre cannot clear water fast enough and rides up onto a film of it, losing all contact with the track and therefore all grip and all control.',
    howItWorks:
      '**Water must be displaced.** A treaded tyre pumps water away through its grooves so rubber can reach the road.\n\n**Beyond a threshold it cannot.** Above a certain combination of speed and water depth, the tyre lifts onto the water.\n\n**Control disappears completely.** Steering, braking and acceleration all do nothing, because nothing is touching the road.\n\n**It ends as suddenly as it starts.** When the tyre reconnects, whatever steering or braking input the driver was applying takes effect at once, which is often what causes the accident.\n\n**Tread depth is the defence.** A full wet clears far more water than an intermediate, which is why the choice between them is about standing water rather than rainfall.',
    whyItMatters:
      'Aquaplaning is the specific hazard that stops races. It is not a matter of driving carefully: at sufficient speed and water depth it happens regardless of skill, and no input the driver makes has any effect while it is occurring.',
    example:
      'A driver crosses a river of water running across the track at a low point of the circuit. For a moment the car does not respond to anything, and then it grips again, at which point the outcome depends on where the wheels were pointing.',
    tradeoffs:
      'Full wets protect against aquaplaning and overheat quickly once the standing water has gone. Staying on them too long is slow; changing too early is dangerous.',
    misunderstandings:
      '**"Slowing down prevents it."** Slowing raises the threshold and does not remove it. Standing water deep enough will aquaplane a tyre at speeds well below racing pace.',
    related: [
      'wet-tyres',
      'intermediate-tyres',
      'visibility-in-the-wet',
      'wet-weather-driving',
      'suspended-race',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'crossover-point',
    title: 'Crossover Point Explained',
    category: 'weather',
    alsoIn: ['strategy'],
    difficulty: 'advanced',
    order: 50,
    summary:
      'The moment one tyre becomes quicker than another, and the highest-value call in the sport.',
    oneSentence:
      'The crossover point is the moment at which a different tyre compound becomes faster than the one fitted, and identifying it before rivals do is worth more than almost any other decision in a race.',
    howItWorks:
      '**Two curves crossing.** As a track dries, intermediates get slower and slicks get faster. The crossover is where the lines meet.\n\n**It is not visible directly.** Teams infer it from sector times, from cars that have already changed, and from how quickly the track is drying.\n\n**Being early is costly and being late is costly.** Fitting slicks before the crossover means a driver is unable to keep the car on the road; fitting them after means every lap since the crossover was lost time.\n\n**Somebody has to go first.** The first team to switch provides the information everybody else uses, which means the first mover takes the risk and the followers take the benefit.',
    whyItMatters:
      'The crossover is where wet races are won and lost. The time swing is enormous, often several seconds a lap, so a team that calls it one lap earlier than a rival gains more than an entire race of superior pace would deliver.',
    example:
      'A driver running sixth switches to slicks while the leaders stay out. For one lap they are slower and appear to have blundered. On the next lap they are four seconds a lap faster, and by the time the leaders react they have inherited the lead.',
    tradeoffs:
      'There is no safe option. Waiting for certainty means waiting until the advantage has been taken by somebody else, and moving first means being wrong in public if the track is not ready.',
    misunderstandings:
      '**"They should just wait until the track is clearly dry."** By then the crossover has passed and every rival who moved earlier is ahead. The decision is only valuable while it is still uncertain.',
    related: [
      'weather-strategy',
      'slicks-vs-intermediates',
      'track-drying',
      'tyre-gamble',
      'intermediate-tyres',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'track-temperature',
    title: 'Track Temperature Explained',
    category: 'weather',
    alsoIn: ['tyres'],
    difficulty: 'intermediate',
    order: 90,
    summary: 'The surface temperature, which matters far more than the air temperature.',
    oneSentence:
      'Track temperature governs how quickly tyres reach their working window and how fast they degrade, and it varies far more than air temperature across a day.',
    howItWorks:
      '**It is not air temperature.** A dark asphalt surface in direct sun can be very much hotter than the air above it, and the difference between a sunny and a cloudy afternoon is large.\n\n**Cold track.** Tyres struggle to reach their window, graining becomes likely, and warm-up after a pit stop takes longer.\n\n**Hot track.** Tyres reach their window immediately and then overheat, degradation rises sharply, and blistering becomes a risk.\n\n**It changes through a session.** A race starting in late afternoon can see the track cool substantially by the finish, which shifts the optimal setup and strategy as it goes.',
    whyItMatters:
      'Track temperature is the variable that most often makes a car competitive or uncompetitive on a given day. A car that works its tyres hard is quick on a cold track and struggles on a hot one, and the same car can therefore look transformed between qualifying and the race.',
    example:
      'A team qualifies well on a cool, cloudy Saturday and races badly on a hot, sunny Sunday. Their car generates tyre temperature aggressively, which was an advantage on Saturday and became overheating on Sunday.',
    tradeoffs:
      'Setup choices that help on a cold track, higher pressures and more aggressive camber to generate heat, become liabilities if the track is hotter than expected, and parc fermé means the choice cannot be revised.',
    misunderstandings:
      '**"Air temperature is what matters."** Track temperature is the more important figure and can differ from it substantially.',
    related: [
      'tyre-temperature',
      'air-temperature',
      'graining',
      'blistering',
      'tyre-degradation',
      'wet-setup',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Rules and penalties
 * ────────────────────────────────────────────────────────────────────────── */

const RULES: ExplainerSeed[] = [
  penalty({
    slug: 'penalties-explained',
    title: 'F1 Penalties Explained',
    category: 'rules-and-penalties',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary: 'Every sanction the stewards can apply, from a warning to disqualification.',
    oneSentence:
      'Penalties in Formula 1 range from a warning through time penalties served in a pit stop or added after the race, to grid drops, penalty points on a licence and disqualification.',
    whatItIs:
      '**Reprimand.** A formal warning. Accumulating several draws a grid penalty.\n\n**Time penalty.** Five or ten seconds, served at the driver’s next pit stop before work begins, or added to their race time at the end.\n\n**Drive-through.** The driver must enter the pit lane, drive through at the limit and rejoin without stopping.\n\n**Stop-go.** Enter the pit lane, stop in the box for a set time, and rejoin. No work may be done.\n\n**Grid penalty.** Positions lost at the next race, or the current one if applied after qualifying.\n\n**Penalty points.** Added to a licence and carried for twelve months. Reaching the threshold means a race ban.\n\n**Disqualification.** The result is removed entirely.',
    howItIsServed:
      'A time penalty is served at the next pit stop, with the car stationary for the penalty duration before the crew may touch it. If the driver does not stop again, the time is added to their race result. Drive-through and stop-go penalties must be served within a set number of laps of being notified.',
    whenItIsGiven:
      'For sporting offences such as causing a collision, leaving the track and gaining an advantage, impeding, unsafe release or speeding in the pit lane; and for technical infringements, which are usually punished by disqualification rather than by time.',
    whyItMatters:
      'The penalty system is how the rules are made real. Its graduated structure lets the stewards match a sanction to an offence, and the difference between a five-second penalty and a drive-through is often the difference between finishing on the podium and finishing outside the points.',
    misunderstandings:
      '**"A five-second penalty costs five seconds."** It can cost far more. Served at a pit stop it is five stationary seconds during which rivals are moving; applied after the race it can drop a driver several positions if the cars behind are close.\n\n**"Penalties are only for dangerous driving."** Most are procedural: pit lane speeding, track limits, unsafe releases and technical breaches.',
    related: [
      'time-penalty',
      'drive-through-penalty',
      'stop-go-penalty',
      'grid-penalty',
      'penalty-points',
      'how-stewards-decide',
    ],
    era: 'The penalty catalogue and the penalty points threshold are current and have been revised repeatedly.',
    ...SPORTING,
  }),

  penalty({
    slug: 'time-penalty',
    title: 'Time Penalty Explained',
    category: 'rules-and-penalties',
    order: 20,
    summary: 'Five or ten seconds, served at a pit stop or added to the race result.',
    oneSentence:
      'A time penalty of five or ten seconds is served during the driver’s next pit stop, with the car stationary and untouched for that period, or added to their total race time if they do not stop again.',
    whatItIs:
      'The most common in-race penalty. The driver is not required to give up a position; instead they lose time, either in the pit lane or in the final classification.',
    howItIsServed:
      '**At a pit stop.** The car stops in its box, and the crew may not touch it until the penalty time has elapsed. Only then does the tyre change begin.\n\n**After the race.** If the driver makes no further stop, the penalty is added to their race time, which can move them down the order.\n\n**Touching the car early** during a served penalty converts it into a more severe sanction.',
    whenItIsGiven:
      'For a wide range of offences: causing a collision, leaving the track and gaining an advantage, unsafe release, exceeding track limits repeatedly, and speeding in the pit lane during a race.',
    whyItMatters:
      'The time penalty is the stewards’ default tool because it is proportionate and does not require the driver to interrupt their race immediately. It is also strategically interesting: a driver carrying a five-second penalty must build a five-second gap before their pit stop to avoid losing position.',
    misunderstandings:
      '**"They can serve it any time."** It must be served at their next pit stop. A driver who has already made their final stop will have the time added at the end instead.\n\n**"The crew can start work and just wait."** They may not touch the car at all until the penalty has elapsed.',
    related: [
      'penalties-explained',
      'drive-through-penalty',
      'stop-go-penalty',
      'race-classification',
      'causing-a-collision',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  penalty({
    slug: 'drive-through-penalty',
    title: 'Drive-Through Penalty',
    category: 'rules-and-penalties',
    difficulty: 'intermediate',
    order: 30,
    summary: 'Enter the pit lane, drive through at the limit, rejoin without stopping.',
    oneSentence:
      'A drive-through penalty requires the driver to enter the pit lane, travel its length at the speed limit and rejoin the race without stopping, costing roughly the pit lane transit time.',
    whatItIs:
      'A more severe penalty than a five-second time penalty and less severe than a stop-go. The driver loses the time it takes to traverse the pit lane at the limit rather than at racing speed.',
    howItIsServed:
      'The driver must enter the pit lane within a set number of laps of being notified, pass through without stopping at their garage, and rejoin. No work may be done on the car.',
    whenItIsGiven:
      'For more serious sporting offences, and historically for pit lane speeding and jump starts, though many of those are now handled with time penalties.',
    whyItMatters:
      'A drive-through typically costs a substantial part of a normal pit stop’s worth of time, without the benefit of new tyres. It is usually enough to drop a driver out of the position they were fighting for.',
    misunderstandings:
      '**"They can serve it during a pit stop."** No. A drive-through is a separate trip through the pit lane; combining it with a stop is not permitted.\n\n**"It costs the same as a pit stop."** It costs the transit time without gaining fresh tyres, so it is a pure loss in a way that a pit stop is not.',
    related: [
      'stop-go-penalty',
      'time-penalty',
      'penalties-explained',
      'pit-lane-speed-limit',
      'false-start',
    ],
    era: 'Many offences formerly punished with drive-throughs are now handled with time penalties.',
    ...SPORTING,
  }),

  penalty({
    slug: 'grid-penalty',
    title: 'Grid Penalty',
    category: 'rules-and-penalties',
    order: 50,
    summary: 'Positions lost on the starting grid, applied after qualifying.',
    oneSentence:
      'A grid penalty drops a driver a set number of places on the starting grid, applied to their qualifying position, and is the standard sanction for component changes and for some sporting offences.',
    whatItIs:
      'A penalty served at the start rather than during the race. It is applied after qualifying, which is why the grid frequently differs from the qualifying result.',
    howItIsServed:
      'The driver’s qualifying position is adjusted downward by the specified number of places, and every driver below them moves up. A driver taking a large number of new power unit components may be sent to the back of the grid regardless of where they qualified. Where several drivers are penalised, they are ordered among themselves by when the penalties were incurred.',
    whenItIsGiven:
      'Most commonly for exceeding the permitted allocation of power unit or gearbox components. Also for impeding in qualifying, for causing a collision in a previous race, and for accumulated reprimands.',
    whyItMatters:
      'Grid penalties are strategically planned. Because a team knows it will exceed its component allocation at some point in a season, it chooses the weekend at which to take the penalty, preferring a circuit where overtaking is easy so that recovering positions is realistic.',
    misunderstandings:
      '**"A grid penalty means they qualified badly."** It means they qualified and then dropped. The pole position statistic, for instance, is awarded on qualifying performance and survives a subsequent grid penalty.',
    related: [
      'grid-penalties',
      'power-unit-penalties',
      'pole-not-always-first',
      'starting-grid',
      'why-drivers-start-in-different-positions',
    ],
    era: 'Component allocation limits are set per season and have been revised repeatedly.',
    ...SPORTING,
  }),

  penalty({
    slug: 'penalty-points',
    title: 'Penalty Points',
    category: 'rules-and-penalties',
    difficulty: 'intermediate',
    order: 60,
    summary: 'A running total on a driver’s licence, and a race ban at the threshold.',
    oneSentence:
      'Penalty points are added to a driver’s super licence for offences, remain for twelve months, and trigger an automatic race ban if a driver accumulates the threshold number within that period.',
    whatItIs:
      'A cumulative record of offences, separate from the immediate penalty. A driver can receive both a time penalty and penalty points for the same incident.',
    howItIsServed:
      'Points are added when the penalty is issued and expire twelve months from that date on a rolling basis. Reaching the threshold within any twelve-month window means an automatic one-race ban, after which the total resets.',
    whenItIsGiven:
      'For sporting offences judged to warrant a record: causing a collision, dangerous driving, ignoring flags, and repeated infringements of the same kind.',
    whyItMatters:
      'The system exists to catch repeat offenders that individual penalties would not. A driver who commits many small offences across a season faces a consequence that no single incident would have produced, which is precisely its purpose.',
    misunderstandings:
      '**"Points reset at the end of a season."** They expire twelve months from the date each was issued, so a driver can carry points across a winter break.\n\n**"Points are the penalty."** They accompany a penalty rather than replacing it.',
    related: [
      'penalties-explained',
      'reprimand',
      'causing-a-collision',
      'super-licence',
      'how-stewards-decide',
    ],
    era: 'The penalty points threshold and the twelve-month expiry are current provisions and have been subject to review.',
    ...SPORTING,
  }),

  rule({
    slug: 'track-limits',
    title: 'Track Limits Explained',
    category: 'rules-and-penalties',
    alsoIn: ['overtaking', 'circuits'],
    isStartHere: true,
    order: 170,
    summary: 'The white line is the edge of the track, and all four wheels beyond it is off it.',
    oneSentence:
      'The track is bounded by the white lines at its edges, and a car is off the track when all four wheels are entirely beyond the line.',
    howItWorks:
      '**The white line defines the track.** The line itself is part of the track, so a car touching it is still on it.\n\n**All four wheels is the test.** Two wheels beyond the line is not an infringement. All four, entirely beyond, is.\n\n**Consequences differ by session.** In qualifying, the lap time is deleted. In the race, repeated infringements draw warnings and then a time penalty.\n\n**Detection is increasingly automated.** Loops and cameras flag transgressions for review, which has made enforcement far more consistent than manual observation allowed.\n\n**It is policed corner by corner.** The race director specifies which corners are monitored, based on where leaving the track actually gains time.',
    example:
      'A driver runs wide at the exit of a fast corner, putting all four wheels beyond the white line and carrying more speed onto the straight. The lap is deleted in qualifying; in the race it counts toward the warnings that precede a penalty.',
    whyItMatters:
      'Track limits became a prominent issue as asphalt run-off replaced gravel. Where running wide once cost a driver time or their race, it can now gain them time, so a rule is required to do what the gravel used to do by itself.',
    strategic:
      'Where limits are policed tightly, drivers must leave a margin at the affected corners, which means the theoretically fastest line is unavailable and the whole field is driving a slightly compromised lap.',
    misunderstandings:
      '**"Two wheels over is a violation."** All four wheels must be beyond the line.\n\n**"The kerb is out of bounds."** Kerbs are generally part of the track. The white line is the boundary, not the kerb.',
    related: [
      'white-line-rules',
      'deleted-lap-times',
      'track-limits-penalties',
      'why-track-limits-differ',
      'run-off-areas',
      'kerbs',
    ],
    era: 'Enforcement has moved substantially toward automated detection, and which corners are monitored is set per event by the race director.',
    ...SPORTING,
  }),

  rule({
    slug: 'racing-room',
    title: 'Racing Room Explained',
    category: 'rules-and-penalties',
    alsoIn: ['overtaking'],
    difficulty: 'intermediate',
    order: 190,
    summary:
      'A car sufficiently alongside is entitled to space, and squeezing it off is penalised.',
    oneSentence:
      'Racing room is the requirement that a driver leave at least a car’s width for a rival who is sufficiently alongside, rather than squeezing them off the track.',
    howItWorks:
      '**The test is being alongside.** Guidance has generally centred on whether the attacking car’s front axle is at least level with the defending car’s mirror or front axle at the apex, with different thresholds for the inside and the outside.\n\n**A car’s width must remain.** If the attacking car has established that position, the defender must leave space between their car and the edge of the track.\n\n**It applies both ways.** A driver overtaking must also leave room for the car being passed.\n\n**Failing it is penalised** as forcing another driver off the track, typically with a time penalty and often with penalty points.',
    example:
      'Two cars run side by side through a fast corner. The outside car is sufficiently alongside at the apex, so the inside car must leave them room. Running them onto the run-off is an offence even if no contact occurs.',
    whyItMatters:
      'Racing room is the rule that makes wheel-to-wheel racing possible. Without it, a defending driver could simply drive any attacker off the road, and overtaking would become a matter of who was willing to crash.',
    strategic:
      'Because the entitlement depends on being sufficiently alongside at the apex, attacking drivers work to establish that position before the corner rather than during it, which is why so much of an overtaking move is decided on the straight before it.',
    misunderstandings:
      '**"The car in front owns the corner."** Only if the attacking car is not sufficiently alongside. Once it is, the defender’s options are constrained.\n\n**"The guidance is a hard rule."** The stewards apply published guidelines to the specific circumstances, which is why apparently similar incidents can be judged differently.',
    related: [
      'defensive-driving-rules',
      'forcing-a-driver-off-track',
      'causing-a-collision',
      'moving-under-braking',
      'how-stewards-decide',
      'divebomb',
    ],
    era: 'Driving standards guidelines have been published and revised to make these judgements more consistent, and their wording changes.',
    ...SPORTING,
  }),

  article({
    slug: 'how-stewards-decide',
    title: 'How F1 Stewards Make Decisions',
    category: 'rules-and-penalties',
    difficulty: 'intermediate',
    order: 160,
    summary: 'Four stewards, the available evidence, published guidelines, and a judgement call.',
    oneSentence:
      'A panel of stewards, including a former driver, reviews incidents using video, telemetry and radio, applies published driving standards guidelines, and issues a decision that is binding for that event.',
    explanation:
      'Stewarding is a judicial function rather than an automated one. The panel is appointed per event, which is a frequent source of criticism, since different panels can weigh similar incidents differently.',
    howItWorks:
      '**The panel.** Typically four stewards, one of whom is an experienced former driver, intended to bring a competitor’s perspective.\n\n**Evidence.** Multiple camera angles, onboard footage, car telemetry including throttle, brake and steering traces, team radio, and where necessary the drivers and team representatives themselves.\n\n**Guidelines.** Published driving standards guidelines set out how situations such as overtaking on the inside or outside should be judged, which exists to make decisions more consistent between events.\n\n**The decision.** Published with a short statement of the offence and the penalty. Some decisions can be reviewed if significant new evidence emerges.\n\n**Timing.** Incidents may be noted during a race and decided afterwards, which is why a result can change hours later.',
    example:
      'Two cars collide at a corner. The stewards examine whether the attacking car was sufficiently alongside at the apex, whether either driver changed line under braking, and what the telemetry shows about braking points, before deciding whether anybody was predominantly to blame.',
    whyItMatters:
      'Stewarding decisions change results and championships, and because they involve judgement rather than measurement, they are the most contested part of the sport’s governance. The published guidelines exist precisely to reduce that contestation.',
    misunderstandings:
      '**"The stewards are full-time officials."** The panel is appointed per event and its membership rotates, which is why consistency between events is a recurring concern.\n\n**"Every incident is investigated."** Many are explicitly noted and dismissed as racing incidents, where no driver is judged predominantly at fault.',
    related: [
      'penalties-explained',
      'causing-a-collision',
      'racing-room',
      'penalty-points',
      'defensive-driving-rules',
    ],
    era: 'Driving standards guidelines are published and revised, and the stewarding structure has been subject to review.',
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Teams and people
 * ────────────────────────────────────────────────────────────────────────── */

const TEAMS: ExplainerSeed[] = [
  article({
    slug: 'how-f1-teams-work',
    title: 'How F1 Teams Work',
    category: 'teams',
    alsoIn: ['start-here'],
    isStartHere: true,
    order: 10,
    readMinutes: 5,
    summary: 'Several hundred people, of whom about sixty go to the races.',
    oneSentence:
      'A Formula 1 team is a manufacturing and engineering organisation of several hundred people that designs, builds and continuously develops two cars, with only a small fraction of its staff present at any Grand Prix.',
    explanation:
      'The racing is the visible part of an operation that is mostly a factory. Design, aerodynamics, manufacturing, simulation and testing all happen away from the circuit, and the race team is the end of a process rather than the whole of it.',
    howItWorks:
      '**Design and aerodynamics.** The largest departments, responsible for the car’s concept and its continuous development. Wind tunnel and computational fluid dynamics time are both restricted by regulation.\n\n**Manufacturing.** Most components are made in-house, and parts are produced continuously throughout a season as upgrades are introduced.\n\n**The race team.** Mechanics, engineers, strategists and management who travel. Each car has its own race engineer and crew.\n\n**Mission control.** A room at the factory with additional engineers analysing data live during a session and feeding conclusions to the pit wall.\n\n**Simulation.** A driver-in-the-loop simulator runs continuously, including during race weekends, to test setup changes a team cannot try on track.',
    example:
      'A floor upgrade is conceived in the wind tunnel, validated in simulation, manufactured at the factory, flown to a circuit, and evaluated in a single practice session. If the data does not match the prediction, it may not be raced at all.',
    whyItMatters:
      'Understanding the scale explains why the constructors’ championship and its prize money matter so much, why the cost cap changed the sport, and why competitive order is often set months before a season begins.',
    misunderstandings:
      '**"A team is the people at the track."** Those are a small fraction. The majority never leave the factory.\n\n**"Teams can develop as much as they like."** Wind tunnel and CFD time are restricted, and the allocation is weighted so that successful teams get less, which is a deliberate mechanism for closing the field up.',
    takeaways:
      '- Most of a team is a factory, not a race team.\n- Aerodynamic development is restricted by regulation and weighted against successful teams.\n- Mission control at the factory supports the pit wall live during sessions.\n- The simulator runs during race weekends to test what the track cannot.\n- Constructors’ prize money funds the following year’s development.',
    related: [
      'team-principal',
      'race-engineer',
      'strategist',
      'car-development',
      'wind-tunnel-testing',
      'cost-cap',
    ],
    era: 'Aerodynamic testing restrictions and their weighting by championship position are current provisions and have been revised.',
    ...SPORTING,
  }),

  role({
    slug: 'race-engineer',
    title: 'Race Engineer Explained',
    category: 'teams',
    isStartHere: true,
    order: 30,
    summary: 'The voice on the radio, and the driver’s single point of contact with the team.',
    oneSentence:
      'The race engineer is the engineer responsible for one car and one driver, who speaks to them on the radio and translates between what the driver feels and what the team can change.',
    whatTheyDo:
      'They own the relationship with one driver. Everything the driver hears comes through them, and everything the driver reports goes through them to the rest of the team.',
    responsibilities:
      '**Radio communication.** The only voice the driver routinely hears, which makes tone and timing part of the job: when to give information and when to leave a driver alone during a fight.\n\n**Setup direction.** Working with the driver to decide what to change between sessions.\n\n**Translating feedback.** Turning "the car won’t rotate on entry" into a specific change to differential settings, brake bias or front wing.\n\n**In-race management.** Relaying strategy decisions, delta targets, tyre and energy instructions, and the position of rivals.\n\n**Preparation.** Leading the engineering work on that car between events.',
    whyItMatters:
      'The race engineer relationship is one of the closest in the sport and materially affects performance. A driver who trusts their engineer accepts instructions in moments where there is no time to explain them, and drivers moving teams frequently ask to work with a particular engineer.',
    misunderstandings:
      '**"The race engineer decides strategy."** They communicate it. Strategy is decided by the strategists and the pit wall, drawing on the factory.\n\n**"Radio silence means nothing is happening."** Choosing not to speak to a driver during a fight is a deliberate decision, and often the right one.',
    related: [
      'strategist',
      'team-radio',
      'performance-engineer',
      'how-teams-decide-in-a-race',
      'technical-feedback',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  role({
    slug: 'strategist',
    title: 'Strategist Explained',
    category: 'teams',
    alsoIn: ['strategy'],
    difficulty: 'intermediate',
    order: 50,
    summary: 'The person deciding when to pit, working from probabilities rather than certainties.',
    oneSentence:
      'The strategist decides when a car should pit and on what tyres, using live simulations, degradation data and predictions about what rivals will do.',
    whatTheyDo:
      'They own the pit stop decisions, before and during the race, supported by simulation tools and by additional analysts at the factory.',
    responsibilities:
      '**Pre-race planning.** Building candidate strategies from practice degradation data and simulating each many times.\n\n**Live recalculation.** Updating those simulations every lap with real data.\n\n**Predicting rivals.** Modelling what other teams are likely to do, since strategy is played against opponents rather than against the clock.\n\n**Reacting to events.** Deciding within seconds whether to pit when a safety car appears.\n\n**Managing two cars.** Deciding which car is served first, and whether to split strategies to cover more outcomes.',
    whyItMatters:
      'Strategy decides more race results than overtaking does. A team that reads degradation better or reacts to a safety car faster wins races its car had no pace to win, which makes the strategist a genuinely competitive role rather than an administrative one.',
    misunderstandings:
      '**"A bad outcome means a bad decision."** Strategy is decision-making under uncertainty. The best available call frequently loses, and judging strategists by outcomes alone punishes them for taking correct risks.\n\n**"The computer decides."** The model produces probabilities; a person chooses, particularly where the question is what a specific rival will do.',
    related: [
      'strategy-explained',
      'how-teams-predict-strategy',
      'safety-car-strategy',
      'how-teams-decide-in-a-race',
      'race-engineer',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'team-radio',
    title: 'Team Radio Explained',
    category: 'teams',
    order: 110,
    summary: 'The channel between driver and engineer, and why it sounds so cryptic.',
    oneSentence:
      'Team radio is the communication link between a driver and their race engineer, used for strategy, car settings and safety information, and broadcast selectively rather than in full.',
    explanation:
      'Radio traffic sounds cryptic because it is compressed. A driver at speed has limited attention, so instructions are shortened to codes both parties already understand: a settings change, a delta target, a tyre instruction.',
    howItWorks:
      '**One engineer.** The driver hears their race engineer, not the whole pit wall.\n\n**Shorthand.** Settings are referred to by number or position rather than described.\n\n**Timing is deliberate.** Engineers avoid speaking during a driver’s flying lap or in the middle of a fight unless it is essential.\n\n**Coded language.** Teams use terms whose meaning is not public, which is legitimate: rivals listen to broadcast radio.\n\n**Broadcast is selective.** Viewers hear a curated subset chosen for interest, not the full traffic, which is why radio messages often lack context.',
    example:
      'An instruction to change a switch position and a delta target sounds meaningless to a listener and tells the driver exactly what the team wants: a specific engine mode and a specific lap time to hold.',
    whyItMatters:
      'Radio is where strategy becomes visible to viewers, and it is also frequently misread. A message broadcast without its surrounding conversation can appear to show conflict or confusion that the full exchange would not support.',
    misunderstandings:
      '**"We hear everything."** A small fraction is broadcast, selected for interest.\n\n**"Coded messages mean something is being hidden."** Rivals monitor broadcast radio, so teams reasonably avoid announcing their intentions.\n\n**"Teams can tell drivers anything."** Rules on driver coaching have varied, with periods in which detailed instruction on how to drive the car was restricted.',
    related: [
      'race-engineer',
      'how-teams-decide-in-a-race',
      'strategist',
      'engine-modes',
      'delta-time',
    ],
    era: 'Restrictions on the content of team radio, particularly instructions amounting to driver coaching, have been introduced and relaxed at various points.',
    ...SPORTING,
  }),

  article({
    slug: 'why-teammates-are-compared',
    title: 'Why Teammates Are Compared So Closely',
    category: 'teams',
    alsoIn: ['analysis'],
    difficulty: 'intermediate',
    order: 150,
    summary: 'Because it is the only comparison where the car is nearly a constant.',
    oneSentence:
      'Team-mates are compared closely because they drive the most similar machinery available, which makes their relative performance the least contaminated measure of driver ability in the sport.',
    explanation:
      'Formula 1 cannot compare drivers directly. They race unequal cars, so a driver’s results reflect their machinery as much as themselves.\n\nThe team-mate comparison is the closest thing to a controlled experiment available. Two drivers, the same car, the same track, the same conditions. Whatever separates them is more likely to be them.',
    howItWorks:
      '**Qualifying head-to-head.** The cleanest comparison, since both cars run low fuel with everyone attacking.\n\n**Race results head-to-head.** Noisier, because strategy, traffic and reliability intervene.\n\n**Qualifying delta.** The average time difference, which says more than a win-loss count.\n\n**Adjustments are still needed.** Even team-mates do not always have identical cars: upgrades arrive one at a time, damage occurs, and reliability differs.',
    example:
      'A driver finishing eighth in a car capable of eighth has performed well. Their team-mate finishing twelfth in the same car has not. Neither fact is visible from the championship table, which shows only that one is eighth and the other twelfth.',
    whyItMatters:
      'It is the basis of nearly all serious driver evaluation. Teams use it, and so does any honest public analysis, because comparing drivers across teams means comparing cars and calling the result a comparison of drivers.',
    misunderstandings:
      '**"Team-mates have identical cars."** They have the same specification, not the same parts. Upgrades are often introduced on one car first, and a damaged floor is not visible from outside.\n\n**"Beating your team-mate means you are the better driver."** It is evidence, not proof. A car can suit one driver’s style, and a single season is a small sample.',
    related: [
      'teammate-delta',
      'car-vs-driver-performance',
      'same-car-is-it-equal',
      'what-makes-an-elite-driver',
      'drivers-vs-constructors',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Performance analysis
 *
 * Every entry here is explicitly labelled as derived. That is the brief's
 * instruction and it is also the honest position: none of these are official
 * FIA statistics, and each depends on assumptions a reader should know about.
 * ────────────────────────────────────────────────────────────────────────── */

const ANALYSIS: ExplainerSeed[] = [
  statistic({
    slug: 'race-pace-analysis',
    title: 'Race Pace Analysis',
    category: 'analysis',
    isStartHere: true,
    isFeatured: true,
    difficulty: 'advanced',
    order: 20,
    summary: 'Estimating a car’s true long-run speed by stripping out fuel, tyres and traffic.',
    oneSentence:
      'Race pace analysis estimates how quick a car genuinely is over a stint by correcting observed lap times for fuel load, tyre age and traffic, none of which are directly measurable from outside a team.',
    measures:
      'The underlying speed of a car over race distance, as distinct from its single-lap speed. It is an estimate, not a measurement.',
    formula:
      'Take the lap times of a stint. Discard laps affected by traffic, safety cars or errors. Correct the remainder for fuel burn, using an assumed fuel effect per kilogram. Correct for tyre age using an assumed degradation rate. What remains is an estimate of underlying pace, usually expressed as an average or as a fitted line.',
    workedExample:
      'A car’s raw lap times fall steadily through a stint, which naively suggests it is getting faster. Correcting for the fuel burned reveals a slight upward trend instead, which is the tyre degradation the fuel effect was masking. The corrected average is the number worth comparing against a rival.',
    interpret:
      'Compare like with like: the same stint length, similar tyre ages, similar track conditions. A difference of a tenth or two between two cars is within the noise of the method, and only larger differences should be treated as real.',
    limitations:
      'This is a derived analytical measure, not an official statistic, and it rests on assumptions that outside analysts must guess at.\n\nStarting fuel loads are not published. The fuel effect per kilogram varies by circuit. Engine modes are not visible, so a car may be lapping below its capability deliberately. Traffic effects are hard to remove completely, and a car in dirty air is slower for reasons unconnected to its pace.\n\nTreat any published race pace figure as an estimate with meaningful error bars, and never as a measured quantity.',
    related: [
      'long-run-pace',
      'fuel-correction',
      'degradation-curves',
      'tyre-corrected-pace',
      'qualifying-pace-analysis',
      'car-vs-driver-performance',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  statistic({
    slug: 'teammate-delta',
    title: 'Teammate Delta',
    category: 'analysis',
    difficulty: 'advanced',
    order: 30,
    summary:
      'The average time difference between team-mates, and the cleanest driver measure available.',
    oneSentence:
      'Teammate delta is the average lap time difference between two drivers in the same car, most often measured in qualifying, and is the least contaminated comparison of driver performance the sport offers.',
    measures:
      'The typical performance gap between two drivers with nearly identical machinery, expressed as a percentage or as an average time difference.',
    formula:
      'Take each session in which both drivers set a representative lap, compute the percentage difference between their best times, and average across the season. A percentage rather than an absolute figure, because a tenth at a ninety-second circuit is not the same as a tenth at a seventy-second one.',
    workedExample:
      'Over a season, one driver averages 0.15 per cent quicker in qualifying. At a ninety-second circuit that is roughly a tenth and a half per lap, sustained across the year, which is a substantial and consistent advantage.',
    interpret:
      'Use qualifying rather than race results where possible: qualifying has fewer confounds, since both cars run low fuel with everyone attacking. Sessions where either driver had a mechanical problem, a deleted lap or traffic should be excluded, which usually removes a meaningful fraction of the season.',
    limitations:
      'A derived measure, not an official one, and vulnerable in several ways.\n\nTeam-mates do not always have identical cars: upgrades often appear on one car first, and damage is not always visible. The sample is small, perhaps twenty usable sessions, so a few outliers move the figure substantially. A car can suit one driver’s style, so the delta measures the pairing rather than the drivers in isolation. And a delta says nothing about which driver is better in absolute terms, only which was quicker in that car that season.\n\nChains of team-mate comparisons across teams and eras compound all of these errors and should be treated as entertainment rather than analysis.',
    related: [
      'why-teammates-are-compared',
      'car-vs-driver-performance',
      'qualifying-pace-analysis',
      'same-car-is-it-equal',
      'what-makes-an-elite-driver',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  statistic({
    slug: 'degradation-curves',
    title: 'Degradation Curves',
    category: 'analysis',
    difficulty: 'advanced',
    order: 100,
    summary: 'Lap time plotted against tyre age, which is the input every strategy model runs on.',
    oneSentence:
      'A degradation curve plots lap time against tyre age for a compound at a circuit, showing how quickly performance falls away and where the cliff is.',
    measures:
      'The rate at which a tyre loses performance over a stint, expressed as lap time lost per lap, and the shape of that loss over the stint.',
    formula:
      'Take the fuel-corrected lap times of a stint and plot them against tyre age. Fitting a line gives the average degradation rate; the shape of the data shows whether the loss is linear or whether it accelerates past a threshold.',
    workedExample:
      'A compound loses roughly a tenth per lap for fifteen laps and then half a second per lap thereafter. The strategy model treats lap fifteen as the practical stint limit, because beyond it the car is losing time faster than a pit stop would cost.',
    interpret:
      'Compare curves between compounds at the same circuit to decide stint lengths, and between cars to see which is gentler on its tyres. The crossing point between a soft compound’s curve and a harder one’s determines the optimal switch point.',
    limitations:
      'A derived model built from a small sample. Practice long runs are short, run on different fuel loads, and often deliberately unrepresentative.\n\nDegradation also depends on track temperature, which changes between the practice session the curve was built from and the race it is used to predict. It differs between cars and between drivers in the same car. And the curve assumes a driver pushing consistently, which a driver managing tyres is deliberately not doing.\n\nThese are estimates that teams update continuously with live race data precisely because the pre-race version is known to be wrong.',
    related: [
      'tyre-degradation',
      'long-run-pace',
      'fuel-correction',
      'strategy-simulation',
      'race-pace-analysis',
      'why-practice-matters',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  statistic({
    slug: 'car-vs-driver-performance',
    title: 'Car Performance vs Driver Performance',
    category: 'analysis',
    isFeatured: true,
    difficulty: 'advanced',
    order: 160,
    summary: 'The hardest question in the sport, and why no method answers it cleanly.',
    oneSentence:
      'Separating car performance from driver performance is the central problem of Formula 1 analysis, and every available method requires assumptions that make the answer an estimate rather than a measurement.',
    measures:
      'How much of a driver’s results are attributable to them rather than to their machinery. There is no direct measurement of this, only inference.',
    formula:
      'The main approaches are:\n\n**Teammate comparison.** Hold the car constant and compare the two drivers. The cleanest available method, and limited by sample size and by the fact that team-mates are also not perfectly matched.\n\n**Statistical models.** Fit results across many seasons with terms for driver and for car, letting drivers who change teams link the estimates together. Powerful in principle, and dependent on modelling choices that materially change the answer.\n\n**Pace against expectation.** Compare a driver’s results against what their car’s pace would predict, which requires an independent estimate of car pace that is itself derived.',
    workedExample:
      'A driver finishes fourth in the championship. Their car’s underlying pace suggests it was the third-quickest package. Whether that driver over-performed or under-performed depends entirely on the pace estimate, which was itself produced by a model with its own assumptions.',
    interpret:
      'Use these methods to form a rough view rather than a ranking. Where several independent approaches agree, the conclusion is more robust. Where they disagree, the honest answer is that the data does not settle it.',
    limitations:
      'This is the most assumption-dependent analysis in the sport and none of it is official.\n\nDrivers are not randomly assigned to cars: good drivers get good seats, which confounds every model. Team-mates are not perfectly matched machinery. Sample sizes are small, roughly two dozen races a season. Cars change through a season. And a driver contributes to their car’s development, so the car and the driver are not independent quantities in the first place.\n\nAny published claim to have measured driver ability precisely should be treated with scepticism proportional to its confidence.',
    related: [
      'teammate-delta',
      'why-teammates-are-compared',
      'race-pace-analysis',
      'reliability-adjusted-performance',
      'what-makes-an-elite-driver',
      'f1-vs-other-motorsport',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),
];

/* ────────────────────────────────────────────────────────────────────────────
 * Glossary
 * ────────────────────────────────────────────────────────────────────────── */

const GLOSSARY: ExplainerSeed[] = [
  definition({
    slug: 'paddock',
    title: 'Paddock',
    category: 'glossary',
    order: 10,
    summary: 'The enclosed area behind the pits where teams are based during a race weekend.',
    explanation:
      'The paddock is the restricted area behind the garages containing the teams’ motorhomes and hospitality units, the media centre and the offices of the governing body. Access requires a pass, and it is where most of the sport’s business, including driver contract negotiation, is conducted.\n\n"Paddock talk" refers to the informal information circulating there, which is how most rumours about driver moves and technical developments begin.',
    example:
      'A driver seen entering a rival team’s motorhome during a weekend will generate speculation about their future, because the paddock is small and observed continuously.',
    whyItMatters:
      'The paddock is where the sport’s commercial and political activity happens. Understanding that it is a working environment rather than a spectator area explains why so much reporting is sourced from it.',
    related: ['how-f1-teams-work', 'driver-market', 'team-principal'],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'stint',
    title: 'Stint',
    category: 'glossary',
    order: 20,
    summary: 'A run of laps on one set of tyres, between pit stops.',
    explanation:
      'A stint is the period a car runs between pit stops, on a single set of tyres. A one-stop race has two stints, a two-stop race has three.\n\nStint length is the primary variable in race strategy: how long a set of tyres can be made to last determines how many stops are needed and when they fall.',
    example:
      'A driver runs a twenty-two lap opening stint on mediums, then a thirty-five lap stint on hards. The lengths were chosen so that neither set was used past the point where it began losing significant time.',
    whyItMatters:
      'Nearly all strategic discussion is about stints: their length, the compound used, and the offset between one driver’s stints and another’s.',
    related: [
      'tyre-degradation',
      'pit-window',
      'one-stop-strategy',
      'extending-a-stint',
      'long-run-pace',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'constructor',
    title: 'Constructor',
    category: 'glossary',
    order: 30,
    summary: 'A team that designs and builds its own car, which every F1 entrant must do.',
    explanation:
      'A constructor is an entrant that designs and builds its own car rather than buying one. The regulations require every Formula 1 team to own the design of certain core components, most importantly the chassis, which is what makes them constructors rather than customers.\n\nTeams may buy a power unit from a manufacturer. Some build their own; others do not, and both are constructors.',
    example:
      'A team using another manufacturer’s power unit is still a constructor, because it designed and built the chassis. A team buying a complete car from another entrant would not be, which is why the rules prohibit it.',
    whyItMatters:
      'The constructor requirement is the structural feature that makes Formula 1 different from spec series. It is why the cars are unequal, why engineering is a central part of the competition, and why the second championship is called the constructors’ championship.',
    related: [
      'constructors-championship',
      'how-formula-1-works',
      'f1-vs-other-motorsport',
      'drivers-vs-constructors',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),
];

export const FORMULA1_ANALYSIS: ExplainerSeed[] = [
  ...TELEMETRY,
  ...CIRCUITS,
  ...RULES,
  ...TEAMS,
  ...ANALYSIS,
  ...GLOSSARY,
];
