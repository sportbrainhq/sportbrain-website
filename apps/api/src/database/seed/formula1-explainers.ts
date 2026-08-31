import type { ExplainerSeed, SourceSeed } from './explainer-types';
import { article, definition, format } from './formula1-explainer-helpers';

/**
 * The written Formula 1 explainers: Start Here.
 *
 * These override the taxonomy placeholders in `formula1-explainer-taxonomy.ts`
 * by slug and are the only F1 concepts that reach the site: anything left as a
 * placeholder stays a draft. The remaining categories live in the sibling
 * `formula1-*.ts` files, split by subject rather than by size, so an edit to
 * the tyre content touches one file.
 *
 * ## One concept, one page
 *
 * The rule this library is built around, and F1 tests it differently from the
 * other sports. Elsewhere the duplication pressure comes from competitions that
 * disagree: the NBA and FIBA, the ATP and the WTA, Tests and T20s. There is
 * only one Formula 1. Its duplication pressure comes from *time*: the points
 * system has been rewritten several times, the power unit twice over, and the
 * aerodynamic regulations more often than either.
 *
 * That does not justify `points-system-2010` and `points-system-2026` as
 * separate articles. They would agree on the mechanism and disagree on a table,
 * and a reader searching "how do points work" would have to know the answer
 * before they could find it. So each concept is one row with one canonical URL,
 * and the era it describes is stated in a section of it.
 *
 * ## On numbers that move
 *
 * Deliberately sparse. Points tables, the cost cap figure, the number of races
 * in a season, component allocations and tyre compound names are all revised,
 * and a number baked into prose is wrong within a season with nothing to flag
 * it. The mechanisms are explained; the current figures belong in data with an
 * as-of date.
 *
 * Where a worked example needs a number to be worked at all, it is introduced
 * as an illustration with round figures, not as a claim about this season. A
 * pit loss of "about twenty seconds" teaches the arithmetic without asserting
 * a value for a circuit it does not name.
 *
 * ## On sourcing
 *
 * Facts come from the FIA where the question is "what is the rule": the
 * Sporting and Technical Regulations, and the International Sporting Code.
 * Formula1.com and Wikipedia are used for history and background. The prose is
 * SportBrainHQ's own throughout: a rulebook's expression is not ours to reuse,
 * and paraphrasing a regulation badly is worse than not citing it.
 *
 * Anything written against the regulations carries `ruleSensitive: true` and a
 * `sourceRevision`, so the set to re-audit after a rule change is a query
 * rather than a reading of every article.
 */

export const FORMULA1_EXPLAINER_SOURCES: SourceSeed[] = [
  {
    key: 'fia-sporting',
    provider: 'fia',
    title: 'FIA Formula One Sporting Regulations',
    url: 'https://www.fia.com/regulation/category/110',
    license: 'FIA',
  },
  {
    key: 'fia-technical',
    provider: 'fia',
    title: 'FIA Formula One Technical Regulations',
    url: 'https://www.fia.com/regulation/category/110',
    license: 'FIA',
  },
  {
    key: 'fia-isc',
    provider: 'fia',
    title: 'FIA International Sporting Code',
    url: 'https://www.fia.com/regulation/category/123',
    license: 'FIA',
  },
  {
    key: 'f1-official',
    provider: 'formula1',
    title: 'Formula1.com',
    url: 'https://www.formula1.com/',
    license: 'Formula One World Championship Limited',
  },
  {
    key: 'wp-formula-one',
    provider: 'wikipedia',
    title: 'Formula One',
    url: 'https://en.wikipedia.org/wiki/Formula_One',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-f1-regulations',
    provider: 'wikipedia',
    title: 'Formula One regulations',
    url: 'https://en.wikipedia.org/wiki/Formula_One_regulations',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-f1-racing',
    provider: 'wikipedia',
    title: 'Formula One racing',
    url: 'https://en.wikipedia.org/wiki/Formula_One_racing',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * The regulation edition this library is written against.
 *
 * One constant rather than a string per entry, because the whole set is
 * re-audited together after a rule change and a typo in one of four hundred
 * copies would hide an article from that audit.
 */
export const F1_RULE_REVISION = 'FIA Formula One Sporting Regulations, 2026 season';
export const F1_TECH_REVISION = 'FIA Formula One Technical Regulations, 2026 season';
export const F1_REVIEWED = '2026-08-30';

/** Applied to every entry written against the sporting regulations. */
export const SPORTING = {
  ruleSensitive: true,
  sourceRevision: F1_RULE_REVISION,
  lastReviewedAt: F1_REVIEWED,
  sourceKeys: [{ key: 'fia-sporting' }],
};

/** Applied to every entry written against the technical regulations. */
export const TECHNICAL = {
  ruleSensitive: true,
  sourceRevision: F1_TECH_REVISION,
  lastReviewedAt: F1_REVIEWED,
  sourceKeys: [{ key: 'fia-technical' }],
};

/**
 * The standard era note for content describing the current regulations.
 *
 * A shared constant for the same reason the revision string is one: the note
 * has to say the same thing on every page that carries it, and a hand-written
 * variant on the fortieth article is how two pages end up disagreeing about
 * which season they describe.
 */
export const CURRENT_ERA =
  'This describes the current regulations. Formula 1 rewrites its sporting and technical rules regularly, and the details below have all changed at least once in the sport’s history. Where a mechanism is recent enough that older races were run differently, the text says so.';

/* ────────────────────────────────────────────────────────────────────────────
 * Start here
 * ────────────────────────────────────────────────────────────────────────── */

const START_HERE: ExplainerSeed[] = [
  article({
    slug: 'formula-1-in-five-minutes',
    title: 'Formula 1 in 5 Minutes',
    category: 'start-here',
    isStartHere: true,
    isFeatured: true,
    order: 10,
    readMinutes: 5,
    summary:
      'Everything you need to follow a race: who is competing, what they are competing for, and why they keep stopping.',
    oneSentence:
      'Twenty drivers from ten teams race identical distances at around twenty-four circuits a year, scoring points that decide two championships: one for the drivers, one for the teams that build the cars.',
    explanation:
      'Formula 1 is the top level of single-seater motor racing. Ten teams each enter two cars, and every team designs and builds its own. That last point is the one that makes the sport unusual: in most competitions everyone plays with the same equipment, and in Formula 1 the equipment is most of the competition.\n\nA race weekend has three parts. Practice, where teams learn the track and set up the car. Qualifying, where the fastest single lap decides the starting order. And the Grand Prix itself, where they race for roughly two hours and points are awarded to the top finishers.\n\nThe cars cannot complete a race on one set of tyres, so every driver must stop at least once to change them. Those stops take about two and a half seconds of stationary time, and deciding when to take them is a genuine tactical contest running in parallel with the racing.',
    howItWorks:
      '**The teams.** Ten teams, two cars each, twenty drivers. Each team builds its own chassis. Some also build their own engine; others buy one from a manufacturer.\n\n**The weekend.** Practice sessions first, then qualifying, then the race. Qualifying is a knockout: the slowest drivers are eliminated in stages until the fastest ten fight for pole position, which is first place on the starting grid.\n\n**The race.** All cars start from a stationary grid in qualifying order. Five red lights come on, then go out, and the race begins. It runs to a set distance, usually a little over 300 kilometres.\n\n**The stops.** Tyres wear out and get slower. Every driver pits at least once. A stop costs around twenty seconds relative to staying out, so teams try to take them when they lose the least.\n\n**The points.** The top ten finishers score, on a sliding scale with most going to the winner. Those points feed two separate championships at once.',
    example:
      'A driver qualifies third, passes one car at the start, and runs second. Their rival ahead pits on lap 20 for fresh tyres. They stay out three laps longer, and because the track is clear those three laps are quick ones. When they finally pit, they rejoin ahead. No overtake happened on track, and the position changed anyway.',
    whyItMatters:
      'Almost everything that looks strange about Formula 1 follows from two facts: the cars are not equal, and the tyres do not last. The first is why a brilliant driver in a slow car finishes eleventh, and why a driver is usually judged against their team-mate rather than the field. The second is why races are won on a pit wall as often as on a corner.',
    takeaways:
      '- Ten teams, twenty drivers, and every team builds its own car.\n- A weekend runs practice, then qualifying, then the race.\n- Qualifying is a knockout; the fastest lap wins pole position.\n- Tyres wear out, so everyone must pit at least once.\n- Points go to the top ten and feed two championships, drivers and constructors.\n- Because the cars differ, a driver’s team-mate is the fairest comparison available.',
    related: [
      { slug: 'how-formula-1-works', type: 'part_of' },
      'how-an-f1-weekend-works',
      'drivers-vs-constructors',
      'pit-stops-explained',
      'points-system',
    ],
    sourceKeys: [{ key: 'f1-official' }, { key: 'wp-formula-one' }],
  }),

  article({
    slug: 'how-formula-1-works',
    title: 'How Formula 1 Works',
    category: 'start-here',
    isStartHere: true,
    order: 20,
    readMinutes: 6,
    summary:
      'The structure underneath the sport: who competes, who writes the rules, and what a season is for.',
    oneSentence:
      'Formula 1 is a world championship run by the FIA, contested over a season of Grands Prix by ten constructor teams whose cars must comply with a technical rulebook that changes every few years.',
    explanation:
      'Three things have to be true at once for a Formula 1 season to happen, and each is run by a different body.\n\nThe **FIA**, motorsport’s governing body, writes the regulations and polices them. It employs the race director and the stewards, and it decides what a legal car is.\n\n**Formula One Management** runs the commercial side: which circuits get a race, who broadcasts it, and how the prize money is divided.\n\n**The teams**, formally called constructors, design and build the cars and employ the drivers. They compete against each other and negotiate collectively with the other two.\n\nThe reason to know this is that "F1 changed the rules" is usually three different sentences. A new points system is a sporting regulation. A new floor design is a technical regulation. A new race in a new country is a commercial decision.',
    howItWorks:
      '**The rulebook has three parts.** The Sporting Regulations govern how a race is run: sessions, flags, penalties, points. The Technical Regulations govern what the car may be: dimensions, materials, engine architecture. The Financial Regulations govern what a team may spend.\n\n**The car must be your own.** A constructor must own the design of certain core components, most importantly the chassis. This is what separates F1 from series where teams buy a customer car.\n\n**Every car is scrutineered.** Cars are checked for legality before and after sessions. A car that is quickest and illegal is disqualified, which has decided results.\n\n**Regulations change in eras.** Rather than drifting, the technical rules are periodically rewritten wholesale. A rewrite reshuffles the order, because teams that interpret the new rules well arrive with an advantage that can last years.',
    example:
      'When the technical regulations were rewritten for 2022, the cars changed from generating most of their downforce over the bodywork to generating it under the floor. Teams that read the new floor rules well started that season ahead, and the change in competitive order had nothing to do with the drivers.',
    whyItMatters:
      'Formula 1 is a rules-driven sport in a stronger sense than most. The competition is not only between drivers on a Sunday but between engineers reading the same document and disagreeing about what it permits. That is why an apparently technical change can turn a champion into a midfielder in one winter.',
    misunderstandings:
      '**"F1 teams buy their cars."** They do not. A constructor must design its own chassis, which is exactly what the word constructor means.\n\n**"The FIA runs the business."** It does not. The FIA regulates; the commercial rights holder decides the calendar and the money.',
    related: [
      'formula-1-in-five-minutes',
      'how-an-f1-season-works',
      'drivers-vs-constructors',
      'regulations-explained',
      'how-f1-teams-work',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
    sourceKeys: [{ key: 'fia-sporting' }, { key: 'fia-isc' }, { key: 'wp-formula-one' }],
  }),

  definition({
    slug: 'what-is-a-grand-prix',
    title: 'What Is a Grand Prix?',
    category: 'start-here',
    alsoIn: ['the-race'],
    isStartHere: true,
    order: 30,
    summary: 'One race of the world championship, and the event built around it.',
    oneSentence:
      'A Grand Prix is a single championship race, run to a set distance at one circuit, and also the name for the whole weekend event containing it.',
    explanation:
      'The term does two jobs. Strictly, the Grand Prix is the race itself: the Sunday event that awards points. Loosely, and in almost all everyday use, it names the entire weekend, including practice and qualifying.\n\nEach Grand Prix is named for its host country or region rather than its circuit, which is why a season can visit one country twice under two different Grand Prix names.\n\nThe race runs to a distance rather than a time: enough laps to exceed a set minimum distance, with a time limit as a backstop if the race is interrupted.',
    example:
      'A circuit measuring about 5.8 kilometres will hold a race of roughly 53 laps, because that is the smallest number of laps that clears the required distance.',
    whyItMatters:
      'Every race counts the same. Formula 1 has no showpiece round worth extra points and no knockout stage; a win in the first race is worth exactly a win in the last. That is what makes the championship a test of consistency rather than of peaking.',
    misunderstandings:
      '**"Every Grand Prix is the same length."** In laps, no. In distance, very nearly: the lap count is set so that each race covers a similar distance, which is why lap counts vary so widely between circuits.',
    related: [
      'how-a-race-works',
      'race-distance',
      'how-an-f1-season-works',
      'how-an-f1-weekend-works',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'how-an-f1-season-works',
    title: 'How an F1 Season Works',
    category: 'start-here',
    isStartHere: true,
    order: 40,
    summary:
      'A calendar of Grands Prix run across a single year, each awarding points toward two championships.',
    oneSentence:
      'A season is a sequence of Grands Prix held around the world within one calendar year, with points accumulating race by race until the championships are mathematically decided.',
    howItWorks:
      '**Pre-season.** Teams launch new cars and run a short period of testing. This is the only time all teams run together before the racing starts, and the lap times from it are famously unreliable, because nobody reveals how much fuel they are carrying.\n\n**The calendar.** Around two dozen Grands Prix, spread across continents, from early spring to late autumn. Some are grouped into back-to-back or triple-header runs to reduce freight.\n\n**Scoring.** Every race awards points on the same scale. A handful of weekends also include a sprint, a shorter race that awards a smaller set of points.\n\n**The title.** Whoever leads the drivers’ standings after the final race is world champion. The constructors’ title goes to the team with the most points from both its cars combined. Neither has a play-off; the championship is simply the sum.\n\n**Development never stops.** Teams bring upgrades throughout the year, so the competitive order in November is often not the one from March.',
    example:
      'A driver can clinch the drivers’ championship with races still to run, once their points lead exceeds the maximum their nearest rival could still score. The remaining races are then run for everything else that is still open, including the constructors’ title.',
    whyItMatters:
      'Because every race scores equally and there is no final, a season rewards a car that is good everywhere over a car that is exceptional somewhere. It also makes reliability a championship factor: a retirement scores nothing, and nothing cannot be made up by winning more brilliantly later.',
    strategic:
      'The parallel championship shapes team behaviour late in a season. A team out of contention for the drivers’ title may still be fighting for a constructors’ position worth a substantial share of prize money, which is why cars with no chance of winning still race each other hard for eighth place.',
    misunderstandings:
      '**"The number of races is fixed."** It is not. The calendar has grown over the sport’s history and is negotiated commercially, so both the count and the venues change.',
    related: [
      'how-formula-1-works',
      'how-an-f1-weekend-works',
      'drivers-championship',
      'constructors-championship',
      'championship-mathematics',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  format({
    slug: 'how-an-f1-weekend-works',
    title: 'How an F1 Weekend Works',
    category: 'start-here',
    alsoIn: ['race-weekend'],
    isStartHere: true,
    order: 50,
    summary: 'Practice, qualifying and the race: what happens on each day and why.',
    oneSentence:
      'A standard weekend runs three practice sessions, a knockout qualifying session that sets the grid, and the Grand Prix itself, with the car locked down between qualifying and the race.',
    howItWorks:
      '**Friday: practice.** Two sessions. Teams try setup changes, run different tyre compounds, and gather data on how quickly the tyres wear. Lap times matter less than the information.\n\n**Saturday: final practice, then qualifying.** A last short session to confirm the setup, then qualifying. Qualifying runs as three knockout segments, eliminating the slowest cars in each until ten remain to contest pole position.\n\n**Between qualifying and the race: parc fermé.** From the start of qualifying the car’s setup is frozen. Teams may service it but may not change its configuration. This is why the qualifying setup and the race setup have to be the same compromise.\n\n**Sunday: the Grand Prix.** A formation lap, then a standing start, then the race distance.\n\n**Sprint weekends differ.** Some weekends replace two practice sessions with a separate short race and its own qualifying session, which cuts preparation time sharply and raises the cost of an error.',
    example:
      'A team discovers in final practice that the car is too soft over the kerbs. They can change it then. If they discover the same thing after qualifying, they cannot: the setup is frozen, and they must race the car as qualified or start from the pit lane.',
    whyItMatters:
      'The parc fermé rule is the reason a weekend is structured the way it is. Because setup is locked at qualifying, every choice made on Friday is a bet on Sunday’s conditions, and a team that sets the car up purely for a quick lap may have made itself slow for two hours of racing.',
    strategic:
      'Practice is where the race is planned. The long runs on Friday afternoon are how a team estimates tyre degradation, and that estimate is what decides whether they arrive on Sunday intending to stop once or twice.',
    misunderstandings:
      '**"Practice is just warming up."** It is the only chance to measure the tyres on this track in these conditions. A team that wastes it is guessing on Sunday.',
    related: [
      'race-weekend-explained',
      'free-practice',
      'qualifying-explained',
      'parc-ferme',
      'sprint-weekend',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'drivers-vs-constructors',
    title: 'Drivers vs Constructors',
    category: 'start-here',
    alsoIn: ['championship'],
    isStartHere: true,
    order: 60,
    summary:
      'Two championships from the same races, answering two different questions about who is best.',
    oneSentence:
      'The drivers’ championship counts each driver’s own points; the constructors’ championship adds together the points of both cars a team enters.',
    explanation:
      'Every Grand Prix scores twice. The points a driver earns go to their own tally, and the same points also go to their team’s.\n\nA constructor is a team that builds its own car, and the constructors’ championship is a competition between machines and the organisations that produce them. The drivers’ championship is a competition between people driving unequal machines.\n\nBecause both are decided by the same results, they usually agree. When they disagree, it is informative: a team whose two drivers are consistently seventh and eighth can beat a team with one winner and one car that keeps retiring.',
    howItWorks:
      '**Drivers.** Each driver accumulates their own points across the season. The highest total wins the title.\n\n**Constructors.** Both cars’ points are added together. A team’s second driver matters exactly as much per point as its first.\n\n**Same scale, different totals.** There is no separate scoring system; the difference is only in who the points are credited to.\n\n**The money follows the constructors’ table.** Prize money is distributed largely on constructors’ position, which is why a battle for sixth place in that table is worth far more to a team than the equivalent position in the drivers’ standings.',
    example:
      'One team finishes a race first and eleventh. Another finishes third and fourth. The first team has a race winner; the second has scored more constructors’ points that afternoon. Over a season, that pattern decides titles.',
    whyItMatters:
      'It changes how a driver’s record should be read. Wins and championships are partly a measure of which car somebody was in, which is why comparisons within a team, where the machinery is closest to identical, carry more weight than comparisons across the grid.\n\nIt also explains team behaviour that otherwise looks irrational: instructing a driver to hold position, or pitting the car running fourth to defend against a rival team rather than to advance its own driver.',
    misunderstandings:
      '**"The constructors’ title is the drivers’ title added up."** Only arithmetically. A driver can win the drivers’ championship while their team loses the constructors’, and this has happened repeatedly.\n\n**"The second driver does not matter."** In the constructors’ championship they matter exactly as much, point for point.',
    takeaways:
      '- Both championships are decided by the same race results.\n- Drivers score for themselves; constructors add both cars together.\n- Prize money follows the constructors’ table, not the drivers’.\n- The two can be won by different teams in the same season.\n- Team-mate comparison is the fairest way to judge a driver, because the car is the closest thing to a constant.',
    related: [
      'drivers-championship',
      'constructors-championship',
      'points-system',
      'why-teammates-are-compared',
      'team-orders',
    ],
    era: CURRENT_ERA,
    ...SPORTING,
  }),

  article({
    slug: 'what-makes-an-f1-car-different',
    title: 'What Makes an F1 Car Different?',
    category: 'start-here',
    alsoIn: ['the-car'],
    isStartHere: true,
    order: 90,
    summary:
      'Not just power: the reason an F1 car is quick is that it corners and stops in ways a road car cannot.',
    oneSentence:
      'An F1 car is fast mainly because aerodynamic downforce presses it into the road, letting it corner and brake at forces a road car cannot approach, and its hybrid power unit is among the most efficient engines ever built.',
    explanation:
      'The obvious answer is power, and it is the wrong one. A Formula 1 car has a lot of power for its weight, but the gap to a fast road car in a straight line is much smaller than the gap through a corner.\n\nThe real difference is **downforce**. The car’s wings and floor are shaped so that air passing over and under it pushes the car down onto the track. More vertical load on the tyres means more grip, and more grip means higher cornering speed and shorter braking distances. At speed, the downforce acting on the car exceeds the car’s own weight.\n\nThe consequence is counter-intuitive: an F1 car is at its most capable when it is going fast, because that is when the aerodynamics are working hardest. It has comparatively little grip at low speed, which is why drivers weave on a formation lap and why the cars look almost ordinary through a slow hairpin.',
    howItWorks:
      '**Aerodynamics.** Front wing, floor and rear wing generate downforce. The floor does most of the work in the current regulations, by accelerating air through shaped tunnels underneath the car.\n\n**Tyres.** Wide slick tyres with no tread, made from a compound that grips enormously once hot and degrades quickly. They are the single largest performance variable in the sport.\n\n**Brakes.** Carbon discs that work only when very hot, capable of decelerations that would injure an untrained person.\n\n**Power unit.** A small turbocharged engine combined with two electrical energy recovery systems, one harvesting waste heat from the turbo and one harvesting braking energy. Together they produce a great deal of power from very little fuel.\n\n**Structure.** A carbon fibre survival cell, with the halo above the cockpit, designed so the driver’s compartment survives impacts that destroy everything around it.',
    example:
      'Through a fast corner, an F1 car can sustain cornering forces several times gravity. The same car, in the same corner, would be far slower if the air were removed: the mechanical grip from the tyres alone is a fraction of what the wings add.',
    whyItMatters:
      'Downforce explains most of what the rest of this library covers. It is why following another car closely is difficult, because a car in front leaves disturbed air behind it. It is why overtaking needs assistance from DRS and slipstream. It is why setup is a compromise between speed on the straights and speed in the corners, and why Monaco and Monza need almost different cars.',
    misunderstandings:
      '**"F1 cars are the fastest cars in the world."** In top speed, no; several road-legal and record-attempt cars are faster in a straight line. Around a circuit, nothing competitive comes close, because the advantage is in cornering and braking.\n\n**"They are fast because of the engine."** The engine matters, but downforce is the larger part of the lap-time difference.',
    takeaways:
      '- Downforce, not power, is the main reason an F1 car is quick.\n- Grip increases with speed, so the cars are least impressive at low speed.\n- Tyres are the biggest single performance variable in a race.\n- The hybrid power unit is unusually efficient rather than simply powerful.\n- Almost every strategic and tactical concept in F1 follows from the aerodynamics.',
    related: [
      'how-an-f1-car-works',
      'downforce',
      'aerodynamics-explained',
      'tyres-explained',
      'dirty-air',
    ],
    era: 'This describes cars built to the current technical regulations, where most downforce is produced by the floor. Earlier generations of F1 car produced it differently, and the handling characteristics and following behaviour differed accordingly.',
    ...TECHNICAL,
  }),

  article({
    slug: 'f1-vs-other-motorsport',
    title: 'Formula 1 vs Other Motorsport',
    category: 'start-here',
    order: 100,
    summary: 'What separates F1 from IndyCar, endurance racing, rallying and the junior formulae.',
    oneSentence:
      'Formula 1 is distinguished by teams building their own cars to an open technical rulebook, which makes engineering competition a central part of the sport rather than a preliminary to it.',
    explanation:
      'Most racing series are **spec** or near-spec: every competitor uses the same chassis, often the same engine, and the racing is a test of drivers and teams operating identical equipment. Formula 1 is not. Each team designs its own car within a rulebook, so the cars differ, and the differences are often larger than the differences between drivers.\n\nThat single choice produces almost every other contrast. It is why F1 teams employ hundreds of engineers, why a season’s competitive order can be set in a wind tunnel months earlier, and why the sport needs a cost cap to stop spending deciding results outright.',
    howItWorks:
      '**Against IndyCar.** IndyCar uses a common chassis with a choice of engine, and races on ovals as well as road courses. Its field is closer together, and the driver is a larger share of the result.\n\n**Against endurance racing.** Prototype and GT racing runs for hours with multiple drivers per car, and uses balance-of-performance adjustments to equalise different machines. F1 does not equalise; if a car is faster, it stays faster.\n\n**Against rallying.** Rally cars compete against the clock on closed public roads, one at a time, rather than wheel to wheel.\n\n**Against F2 and F3.** These are spec series, deliberately. They exist to compare drivers with the equipment held constant, which is precisely what F1 cannot do and why they work as a proving ground for it.',
    example:
      'In a spec series, a driver who is half a second quicker than the field is understood to be a very good driver. In Formula 1, half a second could be the driver, the car, or an upgrade that arrived last week, and separating those is most of what performance analysis in the sport is about.',
    whyItMatters:
      'It sets the terms for judging anybody in F1. The sport does not offer a clean comparison between drivers, because they are not in comparable machinery, and every honest assessment has to account for that. It is also why the junior categories are spec series: they answer the question F1 structurally cannot.',
    misunderstandings:
      '**"F1 is simply the highest level, and the others are lower."** They are different competitions with different aims. Endurance racing tests reliability over many hours; rallying tests adaptation to a road nobody has memorised. F1 tests engineering and single-lap-to-race-distance performance.',
    related: [
      'how-formula-1-works',
      'formula-2',
      'car-vs-driver-performance',
      'why-teammates-are-compared',
    ],
    sourceKeys: [{ key: 'wp-formula-one' }, { key: 'wp-f1-racing' }],
  }),
];

export const FORMULA1_EXPLAINERS: ExplainerSeed[] = [...START_HERE];
