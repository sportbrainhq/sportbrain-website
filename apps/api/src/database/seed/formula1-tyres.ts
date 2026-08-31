import type { ExplainerSeed, StrategyChartShape } from './explainer-types';
import { article, definition, rule, technical, technique } from './formula1-explainer-helpers';
import { CURRENT_ERA, SPORTING, TECHNICAL } from './formula1-explainers';

/**
 * Tyres.
 *
 * The brief calls this one of the most important categories in the library and
 * asks for diagrams throughout, and both are right: tyres are the largest
 * single performance variable in a Grand Prix and the reason race strategy
 * exists at all.
 *
 * ## On compound names
 *
 * The prose deliberately avoids naming specific compounds by their marketing
 * designation, and avoids giving lap-time figures for them. The supplier brings
 * a different selection of compounds to different events, the naming has
 * changed more than once, and a number written into an article is wrong within
 * a season with nothing to flag it.
 *
 * What is stable is the *relationship*: at any given race there is a softer
 * compound that is quicker and lasts less, and a harder one that is slower and
 * lasts longer. Every explainer here teaches the relationship, and the worked
 * examples use round illustrative figures introduced as illustrations.
 */

/** A one-stop against a two-stop, which is the argument the category is about. */
const STOP_COMPARISON: StrategyChartShape = {
  strategy: 'stints',
  totalLaps: 57,
  caption:
    'The same race on two plans. The two-stop spends more time in the pit lane and less time on worn tyres. Which wins depends entirely on how quickly the tyres fall away.',
  plans: [
    {
      label: 'One-stop',
      stints: [
        { compound: 'medium', fromLap: 1, toLap: 26, note: 'Long opening stint' },
        { compound: 'hard', fromLap: 27, toLap: 57, note: 'Managed to the flag' },
      ],
      result: 'One pit loss, more time on old tyres',
    },
    {
      label: 'Two-stop',
      stints: [
        { compound: 'soft', fromLap: 1, toLap: 18 },
        { compound: 'soft', fromLap: 19, toLap: 38 },
        { compound: 'medium', fromLap: 39, toLap: 57, note: 'Free to push' },
      ],
      result: 'Two pit losses, faster tyres throughout',
      highlight: true,
    },
  ],
};

const TYRES: ExplainerSeed[] = [
  article({
    slug: 'tyres-explained',
    title: 'F1 Tyres Explained',
    category: 'tyres',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 6,
    summary:
      'The single biggest performance variable in a Grand Prix: what the compounds are, and why they decide races.',
    oneSentence:
      'Formula 1 cars race on tyres that are deliberately made to wear out, which is what forces pit stops and turns a race into a strategic contest rather than a procession.',
    explanation:
      'A Formula 1 tyre is not built to last. It is built to grip enormously for a limited number of laps and then get slower, and that design choice is the foundation of race strategy.\n\nAt each event the supplier brings three dry compounds, referred to during the weekend as **soft**, **medium** and **hard**. These are relative labels: the actual compounds vary by circuit, so the "hard" at one race can be softer than the "soft" at another. What is constant is the relationship between them at that event. The softer tyre grips more and lasts less; the harder tyre grips less and lasts longer.\n\nThere are also two wet-weather tyres: **intermediates** for a damp track, and **full wets** for standing water. Both have tread to clear water, which the dry tyres, being completely smooth, do not.',
    howItWorks:
      '**Slicks have no tread.** A smooth tyre puts the maximum possible rubber on the road, which is why dry tyres have no grooves at all.\n\n**They only work hot.** A cold F1 tyre has a fraction of its grip. Each compound has a temperature window, and both below and above it the tyre performs badly.\n\n**They degrade.** Grip falls away with use, and the driver’s lap times rise. This is the effect that governs strategy.\n\n**You must use at least two compounds** in a dry race, which is what guarantees at least one pit stop.\n\n**Allocation is limited.** Teams get a fixed number of sets for the weekend, so every set used in practice or qualifying is one unavailable later.',
    example:
      'A driver on new softs is a second a lap quicker than a rival on twenty-lap-old hards. Ten laps later, the soft has degraded and the gap has vanished. Neither driver changed anything; the tyres did.',
    whyItMatters:
      'Nearly every strategic concept in Formula 1 exists because of tyre behaviour. The undercut works because fresh tyres are quicker. The pit window exists because tyres have a useful life. Safety car strategy works because a stop is cheaper when the field is slowed. Remove tyre degradation and most of the sport’s tactical depth goes with it.',
    misunderstandings:
      '**"The tyres are badly made."** They perform exactly as specified. Durable tyres were tried, produced one-stop processions, and were changed deliberately.\n\n**"Soft is always fastest."** Only over a short run and only once warm. Over a stint, the harder tyre is often faster on average because it does not fall away.',
    takeaways:
      '- Three dry compounds per event, labelled relative to each other, plus two wet tyres.\n- Softer means more grip and shorter life; harder means the reverse.\n- Tyres only work within a temperature window.\n- Degradation, not wear, is what costs lap time.\n- Two compounds must be used in a dry race, which forces a pit stop.',
    related: [
      'tyre-compounds',
      'tyre-degradation',
      'why-softer-tyres-are-faster',
      'mandatory-tyre-rules',
      'strategy-explained',
    ],
    era: 'Compound names, the number of sets allocated and the mandatory-compound rule have all been revised repeatedly. The relationships described here are stable; the specific numbers for any given season are not.',
    ...SPORTING,
  }),

  definition({
    slug: 'soft-tyres',
    title: 'Soft Tyres Explained',
    category: 'tyres',
    order: 20,
    summary: 'The quickest dry compound at any event, and the shortest-lived.',
    explanation:
      'The soft is the softest of the three dry compounds brought to a given race, and is marked with red sidewall lettering. It generates the most grip, warms up fastest, and degrades soonest.\n\nIt is the qualifying tyre almost everywhere, because qualifying rewards one fast lap and nothing else. In the race it is used for short stints, for the run to the flag when there is nothing left to preserve, and by cars starting outside the top ten who want maximum pace early.',
    example:
      'A driver on softs makes a strong start and builds a five-second lead in eight laps. By lap fifteen the tyres are finished and the lead is gone. The compound did exactly what it was meant to do; the plan was built around those eight laps mattering.',
    whyItMatters:
      'The soft is what makes the undercut work. A driver on fresh softs has a substantial advantage over a rival on worn rubber for a handful of laps, and a handful of laps is all an undercut needs.',
    misunderstandings:
      '**"The soft is the same at every race."** It is not. The supplier chooses three compounds from a wider range for each event, so the soft at one circuit may be a harder physical compound than the medium at another.',
    related: [
      'medium-tyres',
      'hard-tyres',
      'tyre-compounds',
      'why-softer-tyres-are-faster',
      'undercut',
    ],
    era: 'Sidewall colours and compound naming have changed several times. The soft-medium-hard relative scheme is current.',
    ...SPORTING,
  }),

  definition({
    slug: 'medium-tyres',
    title: 'Medium Tyres Explained',
    category: 'tyres',
    order: 30,
    summary: 'The compromise compound, and often the best race tyre available.',
    explanation:
      'The medium sits between the soft and the hard in both grip and durability, and is marked with yellow sidewall lettering. It is frequently the most useful race tyre: quick enough to defend a position, durable enough to run a long stint.\n\nBecause of that balance it often appears in the opening stint of a race for cars starting near the front, and it is the compound teams most often wish they had more sets of.',
    example:
      'A team plans a one-stop: medium for the first half of the race, hard for the second. The medium gives them competitive pace while the fuel load is heaviest, and the hard carries them to the flag.',
    whyItMatters:
      'Most one-stop strategies rest on the medium. If it can be made to last, the race becomes a one-stop; if it cannot, everything has to be rethought around an extra pit stop.',
    misunderstandings:
      '**"The medium is a compromise, so it is never optimal."** It is often the fastest tyre over a full stint, because average pace across many laps matters more than peak pace across a few.',
    related: [
      'soft-tyres',
      'hard-tyres',
      'one-stop-strategy',
      'tyre-compounds',
      'tyre-degradation',
    ],
    era: 'Compound naming and colour conventions are current and have changed before.',
    ...SPORTING,
  }),

  definition({
    slug: 'hard-tyres',
    title: 'Hard Tyres Explained',
    category: 'tyres',
    order: 40,
    summary: 'The most durable dry compound, and the hardest to switch on.',
    explanation:
      'The hard is the most durable of the three dry compounds at an event, marked with white sidewall lettering. It has the least outright grip and takes longest to reach its working temperature, but it degrades slowly and can sustain very long stints.\n\nIts weakness is warm-up. On a cool track, a driver on new hards can be vulnerable for several laps after a pit stop, which is a real strategic cost.',
    example:
      'A driver pits for hards during a safety car period, rejoins in traffic, and loses two positions in the following three laps because the tyres are not yet up to temperature. Once they are, the driver is quicker than everyone around them.',
    whyItMatters:
      'The hard is what makes a long stint possible, and therefore what makes an overcut or a one-stop viable. It is also why a team may keep a driver out under a safety car: the tyre they would fit is slow for the exact laps when the pack is bunched and vulnerable.',
    misunderstandings:
      '**"Hard tyres are slow."** Over one lap, yes. Over thirty, they are frequently the quickest option available, because they do not fall away.',
    related: [
      'soft-tyres',
      'medium-tyres',
      'tyre-warm-up',
      'extending-a-stint',
      'one-stop-strategy',
    ],
    era: 'Compound naming and colour conventions are current and have changed before.',
    ...SPORTING,
  }),

  definition({
    slug: 'intermediate-tyres',
    title: 'Intermediate Tyres Explained',
    category: 'tyres',
    alsoIn: ['weather'],
    order: 50,
    summary: 'The treaded tyre for a damp track, and the most versatile in the range.',
    explanation:
      'Intermediates, marked in green, are for a track that is damp but has no standing water. They have a shallow tread pattern that displaces some water while retaining a large contact area.\n\nThey cover a remarkably wide range of conditions, from a track that is drying and nearly ready for slicks to one wet enough that drivers are considering full wets. That range is why they are on the car for most of the wet running in Formula 1.',
    example:
      'A shower passes and the track begins to dry. Drivers stay on intermediates for several laps, deliberately running off the racing line to find remaining water and keep the tyres cool, because switching to slicks too early is slower than waiting.',
    whyItMatters:
      'The decision to move between intermediates and slicks is the crossover point, and it is one of the highest-variance calls in the sport. Get it right by one lap and you win; get it wrong by one lap and you can lose thirty seconds.',
    misunderstandings:
      '**"Intermediates are for light rain and wets for heavy rain."** The real distinction is standing water, not rainfall. A track can be under heavy rain and still suit intermediates if it drains well.\n\n**"They overheat only when the track dries."** They overheat whenever there is not enough water to cool them, which can happen in patches on a track that is still wet elsewhere.',
    related: [
      'wet-tyres',
      'crossover-point',
      'slicks-vs-intermediates',
      'track-drying',
      'aquaplaning',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  definition({
    slug: 'wet-tyres',
    title: 'Wet Tyres Explained',
    category: 'tyres',
    alsoIn: ['weather'],
    order: 60,
    summary: 'The deep-treaded tyre for standing water, and the one nobody wants to need.',
    explanation:
      'The full wet, marked in blue, has the deepest tread in the range and is designed to clear large volumes of standing water and resist aquaplaning.\n\nIn practice it is used less than one might expect. When conditions are wet enough to require full wets, they are often wet enough that visibility, rather than grip, becomes the limiting factor, and the race is more likely to be behind a safety car or suspended than run at speed.',
    example:
      'A race starts behind the safety car on full wets. After several laps the standing water has been dispersed by the cars, and the field switches to intermediates at the first opportunity because the full wet is now overheating on a track that no longer has enough water to cool it.',
    whyItMatters:
      'The wet tyre marks the boundary of what is raceable. When it is the correct tyre and still not enough, the decision moves from strategy to safety, and the race director rather than the teams takes over.',
    misunderstandings:
      '**"Full wets are used whenever it rains."** They are used for standing water. Most wet running in Formula 1 happens on intermediates.\n\n**"More tread is always safer."** More tread means more heat and faster wear on a drying line, so a full wet on a clearing track degrades quickly.',
    related: [
      'intermediate-tyres',
      'aquaplaning',
      'visibility-in-the-wet',
      'suspended-race',
      'how-rain-changes-f1',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'why-softer-tyres-are-faster',
    title: 'Why Softer Tyres Are Faster',
    category: 'tyres',
    difficulty: 'intermediate',
    order: 70,
    summary: 'Softer rubber deforms into the road surface, creating more grip and more heat.',
    oneSentence:
      'A softer compound generates more grip because it deforms more readily and keys into the texture of the track, and it wears faster for exactly the same reason.',
    howItWorks:
      '**Mechanical keying.** A tyre grips partly by deforming around the microscopic roughness of the tarmac. A softer compound conforms more closely, so more of the tyre is genuinely in contact with the road.\n\n**Hysteresis.** Rubber flexing and recovering converts energy into heat. Softer compounds do this more, which generates grip and warms the tyre quickly.\n\n**The cost is the same mechanism.** Deformation and heat are what wear rubber away and degrade its surface. A compound that grips harder is a compound that destroys itself faster.\n\n**Warm-up follows.** Because softer compounds generate heat more readily, they reach their working range in fewer laps, which is why the soft is the qualifying tyre.',
    whyItMatters:
      'This is why there is no perfect tyre and never can be. Grip and durability come from the same physical property pulling in opposite directions, so the choice between compounds is a genuine trade rather than a matter of one being better.',
    example:
      'On a new set, a soft might be six or seven tenths a lap quicker than a hard. Twenty laps later, the soft is finished and the hard has barely started to fall away. The average over the stint can favour either, and which one it favours is the entire strategic question.',
    tradeoffs:
      'Softer also means more sensitive. A soft tyre punishes a driver who slides the car or locks a wheel far more than a hard one does, so the quicker compound is also the one that demands more discipline to extract.',
    misunderstandings:
      '**"Softer tyres are stickier, like glue."** Grip is not adhesion in the everyday sense. It comes mostly from mechanical interlocking with the road surface and from energy losses within the rubber.',
    related: [
      'tyre-degradation',
      'tyre-temperature',
      'soft-tyres',
      'hard-tyres',
      'why-tyres-degrade',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'why-tyres-degrade',
    title: 'Why Tyres Degrade',
    category: 'tyres',
    difficulty: 'intermediate',
    order: 80,
    summary: 'Heat, abrasion and chemical change, all working at once.',
    oneSentence:
      'Tyres lose performance because the rubber is abraded away, overheated and chemically altered by the energy put through it, and all three effects accumulate over a stint.',
    howItWorks:
      '**Abrasion.** The track surface grinds rubber off the tyre. The thinner the remaining rubber, the less there is to deform and grip.\n\n**Thermal degradation.** Repeated heating changes the rubber’s properties. Overheat a tyre badly enough and it loses grip permanently, not just until it cools.\n\n**Surface damage.** Sliding tears the surface, producing graining; excessive heat under the surface produces blistering. Both leave a tyre that is physically worse at gripping.\n\n**Energy input drives all of it.** Cornering loads, traction, braking and the weight of the fuel all put energy through the tyre, which is why degradation is worst early in a stint when the car is heaviest and worst at circuits with long, fast corners.',
    example:
      'Two drivers run the same compound for the same laps. One drives smoothly and finishes the stint with usable tyres; the other slides the car through every corner and finishes four seconds a lap slower. The compound was identical.',
    whyItMatters:
      'Degradation is the clock every race strategy runs against. It is also the largest area where driver skill shows up in a way that lap-time comparisons miss: a driver who preserves tyres gives their team strategic options that a faster but harder-on-tyres driver does not.',
    tradeoffs:
      'Managing tyres means driving below the car’s limit, so a driver preserving rubber is deliberately lapping slower than they could. The question is always whether the time saved later exceeds the time given up now.',
    misunderstandings:
      '**"Degradation is just the tyre wearing thin."** Wear and degradation are different things, and a tyre can lose most of its performance with plenty of rubber remaining.',
    related: [
      'tyre-degradation',
      'wear-vs-degradation',
      'graining',
      'blistering',
      'tyre-management',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'tyre-degradation',
    title: 'Tyre Degradation Explained',
    category: 'tyres',
    alsoIn: ['strategy'],
    difficulty: 'intermediate',
    order: 90,
    summary: 'The rate at which a tyre loses lap time, and the number every strategy is built on.',
    oneSentence:
      'Degradation is the loss of performance over a stint, measured in seconds of lap time lost per lap, and it is the single input that decides how many pit stops a race needs.',
    howItWorks:
      '**It is measured as a slope.** A team records lap times through a long run and calculates how much time is lost per lap. That figure, typically a fraction of a second, is the degradation rate.\n\n**It is not linear.** Many tyres hold performance for a period and then fall away sharply once a threshold is passed, which is called the cliff.\n\n**It varies by compound, circuit and temperature.** A hot track with long corners degrades tyres far faster than a cool one with short ones.\n\n**It is compared against the pit loss.** If staying out costs more time through degradation than a pit stop costs in the pit lane, you stop. That comparison is the whole of strategy in one sentence.',
    diagram: STOP_COMPARISON,
    example:
      'Suppose a pit stop costs twenty seconds and a tyre degrades at a quarter of a second per lap. After eighty laps of degradation you would have lost twenty seconds, so on a short race one stop is enough and on a long one it is not. Change the degradation to half a second a lap and the arithmetic changes completely.',
    whyItMatters:
      'Degradation is why races are not simply won by the fastest car. A car that is quick but hard on its tyres may need an extra stop, and an extra stop is twenty seconds that a slower, gentler car never has to spend.',
    tradeoffs:
      'A driver can reduce degradation by driving more slowly, so the team is always choosing between pace now and tyre life later. Push too hard and you need another stop; manage too much and you lose the position you were protecting.',
    misunderstandings:
      '**"High degradation means bad tyres."** It means tyres that create strategic variety, which is deliberate. Races with no degradation tend to be processions.\n\n**"Degradation is the same for everyone."** It differs substantially between cars, and a car that is gentle on its tyres has a strategic advantage independent of its raw pace.',
    related: [
      'why-tyres-degrade',
      'wear-vs-degradation',
      'degradation-curves',
      'pit-window',
      'one-stop-strategy',
      'pit-loss',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  technical({
    slug: 'wear-vs-degradation',
    title: 'Tyre Wear vs Tyre Degradation',
    category: 'tyres',
    difficulty: 'advanced',
    order: 100,
    summary: 'Two different problems that sound like one, and only one of them costs lap time.',
    oneSentence:
      'Wear is rubber physically disappearing from the tyre; degradation is the tyre losing grip, and a tyre can suffer either without much of the other.',
    howItWorks:
      '**Wear** is a question of quantity: how much rubber is left. A worn tyre is one that has been abraded away, and if it goes far enough the tyre becomes unsafe.\n\n**Degradation** is a question of quality: how well the remaining rubber grips. It comes from overheating, graining, blistering and chemical change.\n\n**They come apart in practice.** A tyre can grain badly on lap three, losing a second of lap time, while having lost almost no rubber. Another can run thirty laps, lose a great deal of rubber, and still be lapping quickly.\n\n**Different circuits produce different problems.** Abrasive surfaces produce wear; high-energy corners and hot tracks produce thermal degradation.',
    example:
      'A driver reports the tyres are finished after eight laps. The team’s data shows plenty of rubber remaining. The problem is graining, not wear, and it may clear on its own if the driver can manage the next few laps, whereas genuine wear only ever gets worse.',
    whyItMatters:
      'The distinction changes the correct response. Degradation from overheating can sometimes be recovered by backing off and letting the tyre cool. Wear cannot be recovered by anything, and a team that misdiagnoses one as the other makes the wrong call.',
    misunderstandings:
      '**"They are two words for the same thing."** They are not, and commentary often conflates them. The useful question is always whether the tyre has lost rubber or lost grip.',
    related: ['tyre-degradation', 'why-tyres-degrade', 'graining', 'blistering', 'track-surface'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'tyre-temperature',
    title: 'Tyre Temperature Explained',
    category: 'tyres',
    difficulty: 'intermediate',
    order: 110,
    summary: 'The working window, and why a tyre outside it is slow in both directions.',
    oneSentence:
      'Every compound has a temperature range in which it grips properly, and a tyre that is too cold or too hot loses performance, for different reasons and with different remedies.',
    howItWorks:
      '**Too cold.** The rubber is stiff and does not key into the road surface. Grip is low, and the driver cannot generate heat without grip, which makes it self-reinforcing.\n\n**In the window.** The rubber is compliant, grips fully, and behaves predictably.\n\n**Too hot.** The surface becomes greasy, degradation accelerates, and in extreme cases the tyre blisters. Overheating also tends to be permanent: a badly overheated tyre does not fully recover.\n\n**Surface and core differ.** The surface can be in the window while the carcass is cold, which is why a tyre can feel good for one corner and then go away.',
    example:
      'A driver leaves the pits on cold hards during a safety car and is immediately vulnerable, because the field is bunched and their tyres will not be ready for two laps. That two-lap window is exactly when a rival will attack.',
    whyItMatters:
      'Temperature explains behaviour that otherwise looks like driver error: the lock-up on an out lap, the spin on a restart, the sudden loss of pace after running behind another car. In each case the tyre left its window.',
    tradeoffs:
      'Setup choices that help warm-up, such as higher pressures, tend to hurt degradation later. A team preparing for a cold qualifying session may be making the race harder for itself.',
    misunderstandings:
      '**"Hotter tyres grip more."** Only up to the top of the window. Beyond it, more heat means less grip and permanent damage.',
    related: [
      'tyre-warm-up',
      'blistering',
      'graining',
      'track-temperature',
      'tyre-pressures',
      'out-lap',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'tyre-warm-up',
    title: 'Tyre Warm-Up Explained',
    category: 'tyres',
    difficulty: 'intermediate',
    order: 120,
    summary: 'Getting a tyre into its window, and why the first lap after a stop is dangerous.',
    oneSentence:
      'Warm-up is the process of bringing a cold tyre into its working temperature range, and until it is there the car has substantially less grip than it will have a lap later.',
    howItWorks:
      '**Energy in.** Heat comes from flexing the tyre: accelerating, braking, cornering and weaving. Brake heat also conducts into the wheel and then the tyre.\n\n**Compounds differ.** Softer compounds warm quickly, harder ones slowly. On a cold day a hard tyre can take several laps.\n\n**The out lap is designed around it.** In qualifying the entire out lap exists to deliver a tyre at the right temperature to the first corner of the flying lap.\n\n**In a race there is no out lap.** A driver leaving the pits joins a race in progress on cold tyres, and must defend against cars whose tyres are already hot.',
    example:
      'Two drivers pit on the same lap. One rejoins ahead but on hards; the other rejoins behind on softs, which are ready a lap sooner. The soft-shod driver passes on the second lap out of the pits, and the position gained in the pit lane is lost to warm-up.',
    whyItMatters:
      'Warm-up is why the laps immediately after a pit stop are among the most eventful in a race, and it is a major hidden factor in safety car strategy: everybody rejoins together on cold tyres into a bunched field.',
    tradeoffs:
      'Aggressive warm-up puts energy into the tyre that is not available later. A driver who forces the tyres up to temperature quickly may find them degrading sooner.',
    misunderstandings:
      '**"Tyre blankets solve this."** Where they are permitted they help at the start of a run, but the tyre still has to be worked up to temperature through the carcass, and the rules on blankets have changed and continue to be debated.',
    related: ['tyre-temperature', 'out-lap', 'hard-tyres', 'safety-car-strategy', 'flat-spots'],
    era: 'Rules governing tyre blankets and pre-heating have changed and remain under review, which materially affects how long warm-up takes.',
    ...SPORTING,
  }),

  technical({
    slug: 'graining',
    title: 'Tyre Graining Explained',
    category: 'tyres',
    difficulty: 'advanced',
    order: 130,
    summary: 'Rubber tearing and rolling up on the tyre surface, which can clear itself.',
    oneSentence:
      'Graining is a surface condition in which small pieces of rubber tear away, roll into ridges and sit between the tyre and the road, cutting grip until they are worn off again.',
    howItWorks:
      '**Cause.** A tyre that is sliding while its surface is too cool relative to its core tears rather than abrading cleanly. The torn rubber rolls into ridges.\n\n**Effect.** The car now rides on loose rubber rather than on the tyre proper. Grip drops noticeably, often by a second a lap or more.\n\n**It can clear.** If the driver manages the tyre and temperatures come up, the grained material can be worn away and much of the grip returns. This is what makes graining different from most degradation.\n\n**Conditions.** Cool tracks, new tyres, early stints and front tyres on cars that understeer are the classic combination.',
    example:
      'A driver complains of a sudden loss of front grip five laps into a stint. Rather than pitting, the team asks them to manage for three laps. The graining clears, pace returns, and the stint continues as planned. Pitting would have thrown away a working set of tyres.',
    whyItMatters:
      'Graining is the main reason a team will tell a driver who is losing time to stay out. Recognising it, as opposed to genuine degradation, is worth a pit stop, and getting the diagnosis wrong costs one.',
    tradeoffs:
      'Managing through graining means lapping slowly for several laps and possibly losing a position, on the expectation of getting the pace back. If the diagnosis is wrong, the driver has lost time and still has bad tyres.',
    misunderstandings:
      '**"Graining means the tyre is finished."** Often the opposite: it is one of the few tyre problems that can improve without a pit stop.',
    related: [
      'blistering',
      'wear-vs-degradation',
      'tyre-temperature',
      'understeer',
      'tyre-management',
    ],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'blistering',
    title: 'Tyre Blistering Explained',
    category: 'tyres',
    difficulty: 'advanced',
    order: 140,
    summary:
      'Overheating beneath the surface, which tears chunks out of the tyre and never recovers.',
    oneSentence:
      'Blistering is caused by the tyre overheating internally, so that rubber below the surface separates and eventually tears away, leaving pits in the tread that permanently reduce grip.',
    howItWorks:
      '**Cause.** Excess heat in the tyre carcass rather than on its surface. The internal rubber softens, delaminates and lifts.\n\n**Effect.** Chunks of rubber leave the tyre, producing visible craters. Grip falls and the tyre becomes unbalanced, causing vibration.\n\n**It does not clear.** Unlike graining, the damage is structural and permanent.\n\n**Conditions.** Hot tracks, high loads, overly aggressive camber or pressures, and sustained pushing on a tyre that is already at the top of its window.',
    example:
      'A driver pushes hard to close a gap on a very hot afternoon. The tyres blister, and although they had many laps of life remaining by wear, the team is forced into an unplanned stop that costs the position they were chasing.',
    whyItMatters:
      'Blistering is the clearest case of a driver spending tyre life for track position and being charged for it immediately. It is also why teams sometimes refuse to let a driver push even when a rival is within reach.',
    tradeoffs:
      'Setup choices that reduce blistering, such as lower camber or higher pressures, usually cost cornering performance. Teams choose how much lap time to give up to protect the tyre for a race distance.',
    misunderstandings:
      '**"Blistering and graining are the same."** They are opposites in an important sense: graining comes from a surface too cool for the way the car is being driven, blistering from a core too hot, and only graining can clear.',
    related: ['graining', 'tyre-temperature', 'wear-vs-degradation', 'camber', 'tyre-pressures'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technical({
    slug: 'flat-spots',
    title: 'Flat Spots Explained',
    category: 'tyres',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 150,
    summary:
      'A locked wheel grinds a flat patch onto a round tyre, and it never becomes round again.',
    oneSentence:
      'A flat spot is a worn-flat area on the tyre caused by locking the wheel under braking, which produces a permanent vibration and can force an unscheduled pit stop.',
    howItWorks:
      '**Cause.** The wheel stops rotating while the car is still moving, so one patch of the tyre is dragged along the tarmac and ground away.\n\n**Effect.** The tyre is no longer round. At speed this produces a vibration through the whole car, which blurs the driver’s vision, upsets the aerodynamic platform and can damage suspension components.\n\n**Severity varies.** A small flat spot is an irritation; a large one makes the car nearly undriveable on the straights and forces a stop.\n\n**It is permanent.** Rubber does not grow back.',
    example:
      'A driver locks up defending into a slow corner. They keep the position, but the vibration is severe enough that the team brings them in on the next lap, and the position is lost anyway along with the pit stop.',
    whyItMatters:
      'Flat-spotting is one of the few ways a single moment of driver error converts directly into a lost pit stop, which is why drivers brake conservatively into the heavy braking zones when the tyres are cold or worn.',
    tradeoffs:
      'The risk of a lock-up is highest exactly when a driver is trying hardest: braking late to attack or defend, on cold tyres, or with a brake bias set too far forward.',
    misunderstandings:
      '**"Anti-lock braking would prevent this."** Driver aids of that kind are not permitted, which is why brake bias adjustment and driver technique are the only defences.',
    related: ['lock-up', 'brake-bias', 'outbraking', 'wear-vs-degradation', 'trail-braking'],
    era: CURRENT_ERA,
    ...TECHNICAL,
  }),

  technique({
    slug: 'tyre-management',
    title: 'Tyre Management Explained',
    category: 'tyres',
    alsoIn: ['driving'],
    difficulty: 'intermediate',
    order: 160,
    summary: 'Driving below the limit on purpose, to have more of the tyre left later.',
    oneSentence:
      'Tyre management is the skill of extracting pace while limiting the energy put through the tyres, so that a stint can be extended or a car can attack at the end of it.',
    theTechnique:
      '**Reduce sliding.** Sliding generates heat and tears the surface. A driver who is smooth on the steering and progressive with the throttle degrades tyres less at the same lap time.\n\n**Change the line.** A wider entry and earlier apex reduces peak lateral load, costing a little time and saving a lot of tyre.\n\n**Lift and coast.** Releasing the throttle before the braking point reduces braking energy and therefore heat, at a small cost in lap time.\n\n**Short-shift.** Changing up earlier reduces wheelspin on corner exit, protecting the rear tyres.\n\n**Manage the fronts or the rears specifically.** Understeer punishes fronts, oversteer punishes rears, and brake bias and differential settings can be adjusted from the cockpit to shift the load.',
    whenUsed:
      'Whenever the plan requires a stint longer than the tyre’s natural life, when following closely in dirty air, and in the opening laps of a stint when the car is heaviest.',
    whyItMatters:
      'It is the driver skill that most reliably converts into results and least reliably shows up in raw lap times. Two drivers can set identical laps while one arrives at the end of a stint with usable tyres and the other does not, and the second driver’s race is decided by a difference the timing screen never showed.',
    risks:
      'Management is only correct if the time saved later exceeds the time given up now. A driver who manages tyres while a rival pushes past into a position they cannot recover has managed their way into defeat.',
    misunderstandings:
      '**"Tyre management means driving slowly."** It means driving differently. A skilled driver can lose very little lap time while substantially reducing tyre energy, which is exactly what separates the best at it from the rest.',
    related: [
      'tyre-degradation',
      'extending-a-stint',
      'why-tyres-degrade',
      'dirty-air',
      'brake-bias',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'tyre-compounds',
    title: 'Tyre Compounds Explained',
    category: 'tyres',
    order: 170,
    summary:
      'What a compound is, why the names are relative, and how three get chosen for each race.',
    oneSentence:
      'A compound is a specific rubber formulation, and at each event three are selected from a wider range and labelled soft, medium and hard relative to one another for that weekend only.',
    explanation:
      'The tyre supplier develops a range of dry compounds spanning very soft to very hard. For each Grand Prix it selects three, based on the circuit’s demands, and those three are called soft, medium and hard for that weekend.\n\nThis is the source of most confusion about F1 tyres. The names describe a relationship at one event, not a fixed physical compound. A "hard" at a circuit with gentle corners can be softer in absolute terms than a "soft" taken to a track that destroys tyres.',
    howItWorks:
      '**Selection.** The supplier chooses based on expected loads, surface abrasiveness and temperature. A demanding circuit gets harder compounds; a gentle one gets softer.\n\n**Labelling.** The three chosen are labelled and colour-coded for the weekend. Only the relative labels appear on the car.\n\n**Consequence.** Comparing "soft tyre pace" across two different Grands Prix is not a meaningful comparison unless you know which underlying compounds were used.',
    example:
      'A race at an abrasive, high-energy circuit and a race at a smooth, low-energy one can both feature a tyre called the medium, and those two mediums may be entirely different compounds with different behaviour.',
    whyItMatters:
      'It explains why degradation varies so much between events even when the same compound names appear, and why a strategy that worked at one race is not transferable to another on the strength of the labels alone.',
    misunderstandings:
      '**"The soft is the same tyre every race."** It is not. The label is relative to the other two at that event.\n\n**"Harder allocation means a duller race."** Sometimes the opposite: a harder allocation at a demanding track can produce more strategic variety than a soft allocation that leaves everybody on the same one-stop.',
    related: [
      'tyres-explained',
      'soft-tyres',
      'medium-tyres',
      'hard-tyres',
      'why-different-compounds',
      'track-surface',
    ],
    era: 'Compound naming conventions and the size of the supplier’s range have both changed over time.',
    ...SPORTING,
  }),

  rule({
    slug: 'mandatory-tyre-rules',
    title: 'Mandatory Tyre Rules Explained',
    category: 'tyres',
    alsoIn: ['rules-and-penalties'],
    difficulty: 'intermediate',
    order: 190,
    summary: 'The rule requiring two compounds in a dry race, which is what guarantees a pit stop.',
    oneSentence:
      'In a dry race every driver must use at least two different dry compounds, which makes at least one pit stop compulsory rather than merely advisable.',
    howItWorks:
      '**Two compounds, dry race.** A driver who finishes without having used two different dry specifications is disqualified.\n\n**Rain suspends it.** If wet or intermediate tyres are used during the race, the requirement no longer applies, because the race is no longer a dry one.\n\n**It forces the stop.** Without this rule a team with durable tyres could run the whole distance without stopping, and the strategic element of the race would largely disappear.\n\n**Allocation rules sit alongside it.** Teams receive a fixed number of sets for the weekend and must return some after each practice session, which constrains how tyres can be used across the three days.',
    example:
      'A driver leading comfortably has not yet used a second compound with ten laps to go. They must stop, and the entire closing phase of the race becomes a question of whether their lead is larger than the pit loss.',
    whyItMatters:
      'This single rule is the reason races have a strategic shape. It converts the pit stop from an option into a fixed cost that every competitor must pay at a moment of their choosing, and choosing that moment well is what race strategy consists of.',
    strategic:
      'Because the stop is compulsory, the question is never whether to pit but when. That is what creates the pit window, the undercut and the overcut, all of which are ways of choosing the moment better than a rival.',
    misunderstandings:
      '**"You must use all three compounds."** Two is the requirement, not three.\n\n**"The rule applies in the wet."** It does not. Once wet-weather tyres have been used, the two-compound requirement falls away.',
    related: [
      'tyres-explained',
      'pit-window',
      'strategy-explained',
      'one-stop-strategy',
      'why-drivers-avoid-pitting',
    ],
    era: 'The mandatory-compound requirement and the tyre allocation rules have been revised repeatedly, including seasons in which the tyre used to set a Q2 time also had to start the race. Check the regulations for the season in question.',
    ...SPORTING,
  }),
];

export const FORMULA1_TYRES: ExplainerSeed[] = TYRES;
