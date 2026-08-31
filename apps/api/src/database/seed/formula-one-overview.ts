/**
 * Formula 1 overview content.
 *
 * The fifth sport through the machinery built for football, cricket,
 * basketball and tennis, and the one the schema was least obviously designed
 * for. The seed shapes are imported rather than redefined, as tennis does, and
 * the page renders them with the same sport-agnostic components. What follows
 * is the reasoning about where Formula 1 does and does not fit, because the
 * places it does not are where a page like this goes wrong.
 *
 * ## Two championships from one event
 *
 * Every other sport here produces one winner per competition. A Grand Prix
 * produces points that feed two separate season-long championships at once:
 * the Drivers' Championship, contested by individuals, and the Constructors'
 * Championship, contested by the teams that build the cars. Neither is a
 * subdivision of the other and neither is decided by a separate event.
 *
 * That is why `sport_format` carries `drivers_championship` and
 * `constructors_championship` as siblings beneath the season rather than
 * nesting one under the other. The taxonomy is being used for what it was
 * built to prevent: a reader assuming that winning one implies the other.
 *
 * ## A constructor is not simply a team
 *
 * The word is a term of art. A constructor is the entity credited with the
 * design of the car's listed components, and the Constructors' Championship is
 * awarded to it. In the modern era a constructor and a race team are in
 * practice the same organisation, so the distinction rarely bites, but the
 * championship is named for the constructor and not for the team, and a page
 * that treats the two words as synonyms is stating something the sport's own
 * regulations do not.
 *
 * ## Where the FIA sits, and where it does not
 *
 * The single largest factual risk on this page is the governance tree, in the
 * same way the ITF/ATP/WTA relationship was for tennis. It is tempting, and
 * wrong, to draw FIA → teams → drivers as a chain of command by analogy with
 * FIFA → confederations → national associations. The actual structure:
 *
 *   - The **FIA** is the governing body. It writes and enforces the Sporting,
 *     Technical and Financial Regulations, licenses the drivers and circuits,
 *     and stewards the events. It is a federation of national motoring clubs,
 *     and those national bodies (its ASNs) are genuinely its members, which is
 *     what the `continental` level below records.
 *   - **Formula One Management**, part of the Formula One group, holds the
 *     commercial rights to the championship. It promotes the series, negotiates
 *     the race contracts and sells the broadcasting. It is not a governing body
 *     and it does not write the rules.
 *   - **Teams** are competitors, not subordinate bodies. They are signatories
 *     to the Concorde Agreement alongside the FIA and the commercial rights
 *     holder, which makes them party to the arrangement rather than beneath it.
 *   - **Circuits and race promoters** contract with the commercial rights
 *     holder and are licensed by the FIA. They are not members of either.
 *
 * `GoverningBodySeed` only has `world` and `continental` levels, so the
 * commercial rights holder, the teams and the promoters are described in the
 * `structure` prose, where the relationship can be stated accurately, rather
 * than forced into a hierarchy that would misrepresent all three.
 *
 * ## On sourcing
 *
 * Dates were checked at authoring time rather than recalled, and the checking
 * changed several entries:
 *
 *   - **1946**, not 1950, is when the Formula One regulations were drawn up.
 *     Non-championship races were run to those rules before any championship
 *     existed. 1950 is the first *World Championship* season, which is a
 *     different claim, and the timeline carries both and says which is which.
 *   - The championship's full name has changed. It was the World Championship
 *     of Drivers from 1950 and has been the FIA Formula One World Championship
 *     since 1981. The current name is used, with the change itself as an entry.
 *   - The **Constructors' Championship began in 1958**, eight years after the
 *     drivers' title. Presenting the two as having run in parallel since 1950
 *     is a common and wrong assumption, so it gets its own timeline entry.
 *   - **Ground effect** has two eras, the late-1970s Lotus generation and the
 *     2022 regulations, and they are separated rather than merged.
 *   - **Turbo-hybrid power units** arrived in **2014**. The V6 turbo era and
 *     the earlier 1980s turbo era are distinct and are dated separately.
 *
 * ## What is deliberately absent
 *
 * **The current grid.** Teams, drivers, car numbers and championship positions
 * change every season and several times within one. Nothing here hardcodes
 * them. The `featured` entries below name constructors and drivers whose place
 * in the sport's history is settled, and the page's links to the Teams and
 * Drivers tabs are where a reader goes for who is actually racing now.
 *
 * **The points table.** Points per finishing position are set by the Sporting
 * Regulations and have changed repeatedly: 8 for a win until 1960, 9, then 10,
 * and 25 since 2010, with a fastest-lap point added in 2019 and removed after
 * 2024. A hardcoded table is wrong the season it changes, so the concepts and
 * prose describe how points accumulate and defer the numbers to an explainer.
 *
 * **The calendar.** Race count and venues change annually.
 *
 * **Open records.** Wins, poles and titles held by active drivers move. Records
 * appear here only as prose about eras, not as a table that silently rots.
 *
 * **Rules.** DRS, ERS, parc fermé, qualifying elimination, tyre compounds,
 * penalties, the undercut: none is explained here. Each is named in the
 * concepts below and pointed at an explainer, which is the boundary this file
 * exists to hold.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const FORMULA_ONE_SOURCES: SourceSeed[] = [
  {
    key: 'wp-formula-one',
    provider: 'wikipedia',
    title: 'Formula One',
    url: 'https://en.wikipedia.org/wiki/Formula_One',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of Formula One',
    url: 'https://en.wikipedia.org/wiki/History_of_Formula_One',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-regulations',
    provider: 'wikipedia',
    title: 'Formula One regulations',
    url: 'https://en.wikipedia.org/wiki/Formula_One_regulations',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-fia',
    provider: 'wikipedia',
    title: 'Fédération Internationale de l’Automobile',
    url: 'https://en.wikipedia.org/wiki/F%C3%A9d%C3%A9ration_Internationale_de_l%27Automobile',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-constructors',
    provider: 'wikipedia',
    title: 'List of Formula One constructors',
    url: 'https://en.wikipedia.org/wiki/List_of_Formula_One_constructors',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-drivers-championship',
    provider: 'wikipedia',
    title: 'List of Formula One World Drivers’ Champions',
    url: 'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Drivers%27_Champions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-constructors-championship',
    provider: 'wikipedia',
    title: 'List of Formula One World Constructors’ Champions',
    url: 'https://en.wikipedia.org/wiki/List_of_Formula_One_World_Constructors%27_Champions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-grand-prix',
    provider: 'wikipedia',
    title: 'Grand Prix motor racing',
    url: 'https://en.wikipedia.org/wiki/Grand_Prix_motor_racing',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-car',
    provider: 'wikipedia',
    title: 'Formula One car',
    url: 'https://en.wikipedia.org/wiki/Formula_One_car',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-power-unit',
    provider: 'wikipedia',
    title: 'Formula One engines',
    url: 'https://en.wikipedia.org/wiki/Formula_One_engines',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-tyres',
    provider: 'wikipedia',
    title: 'Formula One tyres',
    url: 'https://en.wikipedia.org/wiki/Formula_One_tyres',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-racing-flags',
    provider: 'wikipedia',
    title: 'Racing flags',
    url: 'https://en.wikipedia.org/wiki/Racing_flags',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-safety-car',
    provider: 'wikipedia',
    title: 'Safety car',
    url: 'https://en.wikipedia.org/wiki/Safety_car',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-circuits',
    provider: 'wikipedia',
    title: 'List of Formula One circuits',
    url: 'https://en.wikipedia.org/wiki/List_of_Formula_One_circuits',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-sprint',
    provider: 'wikipedia',
    title: 'Formula One sprint',
    url: 'https://en.wikipedia.org/wiki/Formula_One_sprint',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-monaco',
    provider: 'wikipedia',
    title: 'Monaco Grand Prix',
    url: 'https://en.wikipedia.org/wiki/Monaco_Grand_Prix',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-cost-cap',
    provider: 'wikipedia',
    title: 'Formula One financial regulations',
    url: 'https://en.wikipedia.org/wiki/Formula_One#Cost_cap',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * The history, dated from the documentary record.
 *
 * Several entries are periods rather than moments, which is what `endYear` is
 * for: the turbo era and the ground-effect era are decades, and giving either a
 * single year would misdate whichever end the reader takes it for.
 */
export const FORMULA_ONE_TIMELINE: TimelineSeed[] = [
  {
    year: 1906,
    title: 'The first Grand Prix',
    shortDescription:
      'The Automobile Club de France ran the first event billed as a Grand Prix, at Le Mans. Grand Prix racing existed as a category for four decades before any of it was called Formula One.',
    category: 'origins',
    sourceKey: 'wp-grand-prix',
  },
  {
    year: 1946,
    title: 'The Formula One regulations are drawn up',
    shortDescription:
      'A standard set of rules for Grand Prix cars was agreed after the Second World War, and races were run to it immediately. This is where the name begins, four years before any championship.',
    category: 'codification',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1950,
    title: 'The first World Championship season',
    shortDescription:
      'Seven races counted towards a World Championship of Drivers for the first time, opening at Silverstone. Giuseppe Farina took the title from his Alfa Romeo team-mate Juan Manuel Fangio by three points.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1958,
    title: 'A championship for the constructors',
    shortDescription:
      'The International Cup for Formula One Manufacturers was introduced, giving the teams a title of their own eight years after the drivers got theirs. Vanwall won the first one.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-constructors-championship',
  },
  {
    year: 1951,
    endYear: 1957,
    title: 'The Fangio era',
    shortDescription:
      'Juan Manuel Fangio won five drivers’ titles in seven seasons with four different constructors, a record for breadth that stood for decades.',
    category: 'competition',
    sourceKey: 'wp-drivers-championship',
  },
  {
    year: 1959,
    endYear: 1962,
    title: 'The engine moves behind the driver',
    shortDescription:
      'Cooper won championships with the engine mounted behind the cockpit rather than in front of it, and within a few seasons every competitive car was built the same way. The layout has not changed since.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1968,
    title: 'Wings, and commercial sponsorship',
    shortDescription:
      'Aerofoils appeared on Formula One cars, and Lotus ran the first full commercial livery. Both changes were permanent: the sport became aerodynamic and it became sponsored in the same season.',
    category: 'technology',
    sourceKey: 'wp-history',
  },
  {
    year: 1970,
    endYear: 1994,
    title: 'Safety becomes a campaign',
    shortDescription:
      'Driver deaths were routine into the 1970s. Jackie Stewart’s campaigning, then decades of circuit, cockpit and medical reform, changed that. The pace of reform after 1994 was different in kind rather than degree.',
    category: 'governance',
    sourceKey: 'wp-history',
  },
  {
    year: 1977,
    endYear: 1982,
    title: 'The first ground-effect era',
    shortDescription:
      'Lotus shaped the underside of the car to generate downforce from the floor rather than the wings. Cornering speeds rose so far that the sliding skirts making it possible were banned.',
    category: 'technology',
    sourceKey: 'wp-history',
  },
  {
    year: 1977,
    endYear: 1988,
    title: 'The turbo era',
    shortDescription:
      'Renault introduced a turbocharged engine, and within six years turbos had displaced normally aspirated ones entirely. Qualifying outputs became extreme enough that the formula was legislated away.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-power-unit',
  },
  {
    year: 1981,
    title: 'The FIA Formula One World Championship',
    shortDescription:
      'The Concorde Agreement settled a long dispute between the governing body and the teams over rules and commercial rights, and the championship took the name it still carries.',
    category: 'governance',
    sourceKey: 'wp-formula-one',
  },
  {
    year: 1988,
    endYear: 1993,
    title: 'Senna and Prost',
    shortDescription:
      'Team-mates at McLaren, then rivals at opposite ends of the grid. Their contests decided four championships and remain the reference point for what a Formula One rivalry looks like.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1994,
    title: 'Imola, and the reform that followed',
    shortDescription:
      'The deaths of Roland Ratzenberger and Ayrton Senna over one weekend at Imola prompted the most far-reaching safety programme in the sport’s history, covering cars, circuits and medical response.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-history',
  },
  {
    year: 1994,
    endYear: 2008,
    title: 'Electronics regulated, then re-regulated',
    shortDescription:
      'Active suspension, traction control and launch control were banned, permitted again and banned again across a decade and a half, as the governing body worked out how much of the driving it wanted the car to do.',
    category: 'technology',
    sourceKey: 'wp-regulations',
  },
  {
    year: 2000,
    endYear: 2004,
    title: 'Schumacher and Ferrari',
    shortDescription:
      'Five consecutive drivers’ titles and six consecutive constructors’ titles, the most sustained period of dominance the sport had seen to that point.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-drivers-championship',
  },
  {
    year: 2009,
    title: 'Aerodynamics cut back, energy recovery introduced',
    shortDescription:
      'A regulation package aimed at closer racing reduced aerodynamic complexity and introduced the first kinetic energy recovery systems, the beginning of hybrid Formula One.',
    category: 'technology',
    sourceKey: 'wp-regulations',
  },
  {
    year: 2010,
    endYear: 2013,
    title: 'Red Bull’s four titles',
    shortDescription:
      'Sebastian Vettel and Red Bull Racing took four consecutive drivers’ and constructors’ championships, built on exhaust-blown aerodynamics and the exploitation of the floor.',
    category: 'competition',
    sourceKey: 'wp-constructors-championship',
  },
  {
    year: 2014,
    title: 'Turbo-hybrid power units',
    shortDescription:
      'The V8 was replaced by a 1.6-litre turbocharged V6 with electrical energy recovery, and the word "engine" was formally replaced by "power unit". Thermal efficiency, not displacement, became the design target.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-power-unit',
  },
  {
    year: 2014,
    endYear: 2021,
    title: 'The Mercedes era',
    shortDescription:
      'Mercedes won eight consecutive constructors’ championships from the first year of the hybrid formula, the longest such run in the sport.',
    category: 'competition',
    sourceKey: 'wp-constructors-championship',
  },
  {
    year: 2021,
    title: 'A budget cap',
    shortDescription:
      'Financial Regulations capped what a team may spend on car performance, the first time the sport limited money rather than machinery. It changed how teams organise as much as what they build.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-cost-cap',
  },
  {
    year: 2022,
    title: 'Ground effect returns',
    shortDescription:
      'A new technical formula brought downforce back to the floor of the car, with the explicit aim of letting cars follow each other closely. The first regulations written primarily for the quality of the racing.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-regulations',
  },
  {
    year: 2021,
    endYear: 2026,
    title: 'Global expansion and sustainability targets',
    shortDescription:
      'The calendar grew towards the contractual maximum, new markets were added, and the sport committed to sustainable fuels and a net-zero target, reshaping both where it races and what it runs on.',
    category: 'global',
    certainty: 'established',
    sourceKey: 'wp-formula-one',
  },
];

/**
 * Governance.
 *
 * Only the FIA and its regional groupings appear here, because only they are
 * governing bodies. The commercial rights holder, the constructors and the race
 * promoters are the other three parties in the sport's structure, and each has a
 * relationship to the FIA that this table cannot express without distorting it.
 * They are covered in the `structure` section instead.
 */
export const FORMULA_ONE_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'fia',
    shortName: 'FIA',
    name: 'Fédération Internationale de l’Automobile',
    level: 'world',
    foundedYear: 1904,
    headquarters: 'Paris, France',
    websiteUrl: 'https://www.fia.com/',
    order: 10,
  },
  {
    slug: 'fia-europe',
    shortName: 'FIA Region I',
    name: 'FIA Region I (Europe, the Middle East and Africa)',
    level: 'continental',
    parentSlug: 'fia',
    region: 'Europe, the Middle East and Africa',
    order: 20,
  },
  {
    slug: 'fia-americas',
    shortName: 'FIA Americas',
    name: 'FIA Americas',
    level: 'continental',
    parentSlug: 'fia',
    region: 'North, Central and South America',
    order: 30,
  },
  {
    slug: 'fia-asia-pacific',
    shortName: 'FIA Asia-Pacific',
    name: 'FIA Asia-Pacific',
    level: 'continental',
    parentSlug: 'fia',
    region: 'Asia and the Pacific',
    order: 40,
  },
  {
    slug: 'fia-africa',
    shortName: 'FIA Africa',
    name: 'FIA Africa',
    level: 'continental',
    parentSlug: 'fia',
    region: 'Africa',
    order: 50,
  },
];

/**
 * Quick facts.
 *
 * Split into `identity` and `gameplay`, which is what opts the page into the
 * two-block layout: an identity strip under the hero and an at-a-glance grid
 * further down. Every fact must fall in one of those two categories or the
 * split is abandoned and one grid is rendered, so nothing is silently dropped.
 *
 * No fact here carries a number that changes annually. Race counts, team
 * counts and points values are all deliberately phrased so that they stay true.
 */
export const FORMULA_ONE_FACTS: FactSeed[] = [
  {
    key: 'governing-body',
    label: 'Governing body',
    value: 'Fédération Internationale de l’Automobile (FIA)',
    category: 'identity',
    sourceKey: 'wp-fia',
    order: 10,
  },
  {
    key: 'championship',
    label: 'Championship',
    value: 'FIA Formula One World Championship',
    category: 'identity',
    sourceKey: 'wp-formula-one',
    order: 20,
  },
  {
    key: 'first-season',
    label: 'First World Championship season',
    value: '1950',
    category: 'identity',
    sourceKey: 'wp-history',
    order: 30,
  },
  {
    key: 'regulations-established',
    label: 'Formula One regulations established',
    value: '1946, four years before the first championship',
    category: 'identity',
    sourceKey: 'wp-history',
    order: 40,
  },
  {
    key: 'race-events',
    label: 'Race events',
    value: 'Grands Prix, held at circuits around the world',
    category: 'identity',
    sourceKey: 'wp-grand-prix',
    order: 50,
  },
  {
    key: 'championships',
    label: 'Championship titles',
    value:
      'Two: the Drivers’ World Championship, contested by individuals, and the Constructors’ World Championship, contested by the teams',
    category: 'identity',
    sourceKey: 'wp-formula-one',
    order: 60,
  },
  {
    key: 'cars',
    label: 'Cars',
    value: 'Open-wheel, single-seater racing cars built to the FIA Technical Regulations',
    category: 'gameplay',
    sourceKey: 'wp-car',
    order: 70,
  },
  {
    key: 'entries',
    label: 'Entries per team',
    value: 'Two race drivers, each in their own car',
    category: 'gameplay',
    sourceKey: 'wp-formula-one',
    order: 80,
  },
  {
    key: 'format',
    label: 'Competition format',
    value:
      'A season-long championship. Points are scored at each race and accumulate; there is no knockout stage and no final.',
    category: 'gameplay',
    sourceKey: 'wp-regulations',
    order: 90,
  },
  {
    key: 'weekend',
    label: 'A race weekend',
    value:
      'Practice, then qualifying to set the grid, then the Grand Prix itself. Some events add a shorter sprint race.',
    category: 'gameplay',
    sourceKey: 'wp-formula-one',
    order: 100,
  },
  {
    key: 'race-distance',
    label: 'Race distance',
    value:
      'A set number of laps, normally the fewest that exceed 305 km. Monaco is the standing exception at a shorter distance.',
    category: 'gameplay',
    sourceKey: 'wp-regulations',
    order: 110,
  },
  {
    key: 'season',
    label: 'A season',
    value:
      'Rounds held across several continents between the opening and closing Grands Prix. The calendar changes from year to year.',
    category: 'gameplay',
    sourceKey: 'wp-formula-one',
    order: 120,
  },
  {
    key: 'power-unit',
    label: 'Power unit',
    value:
      'A turbocharged internal combustion engine combined with electrical energy recovery, in use since 2014',
    category: 'gameplay',
    sourceKey: 'wp-power-unit',
    order: 130,
  },
  {
    key: 'tyres',
    label: 'Tyres',
    value:
      'A single supplier provides dry compounds of differing grip and durability, plus intermediate and full wet tyres',
    category: 'gameplay',
    sourceKey: 'wp-tyres',
    order: 140,
  },
];

/**
 * The structure of the competition, as a taxonomy.
 *
 * `sport_format` was built for cricket's incomparable match formats, and the
 * fit here is not exact: Formula 1 has one kind of race, not three. What it does
 * have is a structure a newcomer routinely gets wrong, which is the same
 * problem the table solves.
 *
 * Two branches, deliberately:
 *
 *   - **The championship**, whose two titles are siblings rather than parent and
 *     child. This is the point the taxonomy exists to make on this page.
 *   - **The race weekend**, whose sessions are children of the format they
 *     belong to, so that a sprint weekend reads as a variant of a Grand Prix
 *     weekend and not as a different competition.
 *
 * `matchClass` carries what kind of thing each node is; `isInternational` is
 * omitted throughout, because Formula 1 has no domestic tier and the honest
 * answer for every node is that the question does not apply. Setting it true
 * everywhere would imply a contrast that does not exist.
 */
export const FORMULA_ONE_FORMATS: FormatSeed[] = [
  {
    key: 'world-championship',
    label: 'The FIA Formula One World Championship',
    matchClass: 'season',
    description:
      'One season, one set of races, and two championships decided by the same results. Points scored at each Grand Prix accumulate until the final round.',
    conditionsAuthority: 'fia',
    sourceKey: 'wp-formula-one',
    order: 10,
  },
  {
    key: 'drivers-championship',
    label: 'Drivers’ World Championship',
    parentKey: 'world-championship',
    matchClass: 'championship',
    description:
      'Contested by individual drivers. A driver keeps the points they personally score, so a driver who changes teams mid-season takes their total with them.',
    conditionsAuthority: 'fia',
    sourceKey: 'wp-drivers-championship',
    order: 20,
  },
  {
    key: 'constructors-championship',
    label: 'Constructors’ World Championship',
    parentKey: 'world-championship',
    matchClass: 'championship',
    description:
      'Contested by the constructors. A team’s total is the sum of what both of its cars score, which is why a team needs two competitive drivers and not just one.',
    conditionsAuthority: 'fia',
    sourceKey: 'wp-constructors-championship',
    order: 30,
  },
  {
    key: 'grand-prix-weekend',
    label: 'Grand Prix weekend',
    matchClass: 'event',
    description:
      'The standard format. Practice on Friday, a final practice and qualifying on Saturday, the Grand Prix on Sunday. Exact timings vary by event and by time zone.',
    conditionsAuthority: 'fia',
    sourceKey: 'wp-formula-one',
    order: 40,
  },
  {
    key: 'practice',
    label: 'Practice',
    parentKey: 'grand-prix-weekend',
    matchClass: 'session',
    description:
      'Sessions in which teams set the car up for the circuit and evaluate tyres. Nothing scored, and no bearing on the grid.',
    sourceKey: 'wp-formula-one',
    order: 50,
  },
  {
    key: 'qualifying',
    label: 'Qualifying',
    parentKey: 'grand-prix-weekend',
    matchClass: 'session',
    description:
      'A timed session that sets the starting order for the race. Run in three parts, with the slowest drivers eliminated after each, until the fastest contest pole position.',
    sourceKey: 'wp-formula-one',
    order: 60,
  },
  {
    key: 'grand-prix',
    label: 'The Grand Prix',
    parentKey: 'grand-prix-weekend',
    matchClass: 'race',
    description:
      'The race itself. Championship points are awarded to the leading finishers, and this is the only session of a standard weekend that scores.',
    sourceKey: 'wp-grand-prix',
    order: 70,
  },
  {
    key: 'sprint-weekend',
    label: 'Sprint weekend',
    matchClass: 'event',
    description:
      'A variant used at a handful of events. One practice session is replaced by a shorter race that awards its own points, and by the separate qualifying session that sets its grid. The Grand Prix on Sunday is unchanged.',
    conditionsAuthority: 'fia',
    sourceKey: 'wp-sprint',
    order: 80,
  },
  {
    key: 'sprint',
    label: 'The sprint',
    parentKey: 'sprint-weekend',
    matchClass: 'race',
    description:
      'A short race, run without a mandatory pit stop, scoring points for the leading finishers only. It does not set the grid for the Grand Prix.',
    sourceKey: 'wp-sprint',
    order: 90,
  },
];

/**
 * Vocabulary.
 *
 * Every term a newcomer meets in the first hour of watching, with one or two
 * sentences each. Anything needing three sentences is pointed at an explainer
 * instead, which is what `explainerSlug` is for. The slugs are aspirational:
 * the API renders a link only for those that resolve, so naming an explainer
 * that has not been written yet costs nothing and records the intent.
 *
 * `ambiguityNote` is used sparingly and only where a word genuinely carries two
 * meanings a reader will otherwise conflate. "Constructor" and "pole position"
 * are the two that matter most.
 */
export const FORMULA_ONE_CONCEPTS: ConceptSeed[] = [
  {
    key: 'grand-prix',
    term: 'Grand Prix',
    summary:
      'A championship race, and the event weekend built around it. Each one is a round of the season.',
    category: 'structure',
    sourceKey: 'wp-grand-prix',
    order: 10,
  },
  {
    key: 'constructor',
    term: 'Constructor',
    summary:
      'The entity credited with designing the car, and the entrant the Constructors’ Championship is awarded to.',
    category: 'structure',
    ambiguityNote:
      'In everyday use "constructor" and "team" are interchangeable, but they are not the same thing in the regulations. The constructor is credited with the car’s design; the team is the organisation that runs it at the track. Modern entries are both, which is why the words have merged.',
    explainerSlug: 'what-is-a-constructor',
    sourceKey: 'wp-constructors',
    order: 20,
  },
  {
    key: 'grid',
    term: 'Grid',
    summary:
      'The starting formation, in staggered pairs, with each driver placed by their qualifying time.',
    category: 'structure',
    sourceKey: 'wp-regulations',
    order: 30,
  },
  {
    key: 'pole-position',
    term: 'Pole position',
    summary: 'First place on the starting grid, earned by setting the fastest qualifying time.',
    category: 'structure',
    ambiguityNote:
      'Pole is awarded for the fastest qualifying lap, not for starting first. A driver who takes pole and is then given a grid penalty keeps the pole in the records while starting further back.',
    explainerSlug: 'qualifying-explained',
    sourceKey: 'wp-formula-one',
    order: 40,
  },
  {
    key: 'formation-lap',
    term: 'Formation lap',
    summary:
      'The lap run from the grid to the grid before the start, used to warm tyres and brakes.',
    category: 'structure',
    sourceKey: 'wp-regulations',
    order: 50,
  },
  {
    key: 'stint',
    term: 'Stint',
    summary: 'The run between two pit stops, or between the start and the first stop.',
    category: 'structure',
    explainerSlug: 'race-strategy-explained',
    sourceKey: 'wp-tyres',
    order: 60,
  },
  {
    key: 'sector',
    term: 'Sector',
    summary:
      'One of the three parts every circuit is divided into for timing, so lap times can be compared piece by piece.',
    category: 'structure',
    sourceKey: 'wp-formula-one',
    order: 70,
  },
  {
    key: 'fastest-lap',
    term: 'Fastest lap',
    summary: 'The quickest single lap of the race, recorded whether or not it carries a point.',
    category: 'structure',
    ambiguityNote:
      'Whether the fastest lap scores a championship point has changed more than once, most recently being awarded from 2019 and withdrawn after 2024. The lap is always recorded; the point is a regulation that comes and goes.',
    sourceKey: 'wp-regulations',
    order: 80,
  },
  {
    key: 'paddock',
    term: 'Paddock',
    summary:
      'The enclosed area behind the pits where teams base themselves for the weekend. Not part of the circuit.',
    category: 'area',
    sourceKey: 'wp-formula-one',
    order: 90,
  },
  {
    key: 'pit-lane',
    term: 'Pit lane',
    summary:
      'The lane running alongside the track where teams work on cars during a session, subject to a speed limit.',
    category: 'area',
    sourceKey: 'wp-formula-one',
    order: 100,
  },
  {
    key: 'pit-stop',
    term: 'Pit stop',
    summary:
      'A stop in the team’s pit box, usually to change tyres. Measured in seconds, and often decisive.',
    category: 'area',
    explainerSlug: 'pit-stop-strategy',
    sourceKey: 'wp-formula-one',
    order: 110,
  },
  {
    key: 'chicane',
    term: 'Chicane',
    summary: 'A tight sequence of alternating corners, usually inserted to slow cars down.',
    category: 'area',
    sourceKey: 'wp-circuits',
    order: 120,
  },
  {
    key: 'hairpin',
    term: 'Hairpin',
    summary: 'A corner turning back on itself through roughly 180 degrees, taken very slowly.',
    category: 'area',
    sourceKey: 'wp-circuits',
    order: 130,
  },
  {
    key: 'downforce',
    term: 'Downforce',
    summary:
      'Aerodynamic load pressing the car into the track, which is what allows the cornering speeds. It costs straight-line speed in return.',
    category: 'equipment',
    explainerSlug: 'downforce-and-aerodynamics',
    sourceKey: 'wp-car',
    order: 140,
  },
  {
    key: 'slipstream',
    term: 'Slipstream',
    summary:
      'The pocket of reduced drag behind a car ahead, which a following car uses to gain speed on a straight.',
    category: 'equipment',
    sourceKey: 'wp-car',
    order: 150,
  },
  {
    key: 'drs',
    term: 'DRS',
    summary:
      'A driver-operated rear-wing device that reduces drag to assist overtaking, usable only at set places and under set conditions.',
    category: 'equipment',
    explainerSlug: 'drs-explained',
    sourceKey: 'wp-regulations',
    order: 160,
  },
  {
    key: 'safety-car',
    term: 'Safety car',
    summary:
      'A car sent out to lead the field at a controlled pace while a hazard is dealt with. The field closes up behind it.',
    category: 'structure',
    explainerSlug: 'safety-car-explained',
    sourceKey: 'wp-safety-car',
    order: 170,
  },
  {
    key: 'virtual-safety-car',
    term: 'Virtual safety car',
    summary:
      'A neutralisation with no physical car: drivers must hold to a delta time, keeping the gaps between them roughly as they were.',
    category: 'structure',
    explainerSlug: 'safety-car-explained',
    sourceKey: 'wp-safety-car',
    order: 180,
  },
  {
    key: 'dnf',
    term: 'DNF',
    summary:
      'Did not finish. The car retired before completing the race, through damage or failure.',
    category: 'structure',
    sourceKey: 'wp-regulations',
    order: 190,
  },
  {
    key: 'dns',
    term: 'DNS',
    summary: 'Did not start. The car was entered and qualified but did not take the start.',
    category: 'structure',
    sourceKey: 'wp-regulations',
    order: 200,
  },
  {
    key: 'dsq',
    term: 'DSQ',
    summary:
      'Disqualified. The result was struck out, usually for a technical breach found after the race.',
    category: 'structure',
    sourceKey: 'wp-regulations',
    order: 210,
  },
];

/**
 * Authored prose.
 *
 * Ordered by the slot each `kind` occupies on the Overview page. Four of these
 * kinds have no dedicated slot and render in order after the placed ones, which
 * is the mechanism that lets a sport carry sections the page was not written
 * for. That is why the weekend, the car, strategy and the flags are here as
 * prose rather than as page-level components: nothing about the shared page
 * needs to change for them to appear.
 *
 * Every section stops short of the rules. The test applied throughout: if a
 * paragraph starts to explain how something is judged, timed or penalised, it
 * belongs in an explainer and the sentence is cut back to what it is for.
 */
export const FORMULA_ONE_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is Formula 1?',
    body: `Formula 1 is the highest class of international single-seater circuit racing. Twenty-odd cars, each built by the team that races it, contest a season of Grands Prix held on circuits across the world, and the results of those races decide two world championships at once.

The name comes from the "formula": the set of rules every car must be built to. It is a genuinely restrictive rulebook, and it is also what makes the sport what it is. Within it, each team designs and builds its own car, so a season is a contest between engineering organisations as much as between drivers. Two drivers with identical talent in different cars will not finish in the same place, and understanding Formula 1 starts with accepting that.

The word **Grand Prix** predates the championship by decades. Grand Prix racing was already the premier form of motor sport when the Formula One regulations were written in 1946, and the first World Championship season followed in 1950. Everything since has been an argument between the rulebook and the people trying to find room inside it.`,
    order: 10,
  },
  {
    kind: 'glance',
    heading: 'Formula 1 at a glance',
    body: `Each team enters two cars, and each car has one race driver. Teams compete as **constructors**, meaning the organisation credited with the car's design. Every race event is a **Grand Prix**, and each is one round of a season-long championship.

Points are awarded to the leading finishers at each race and accumulate over the season. The driver with the most points at the end is the **Drivers' World Champion**. The points scored by both of a team's drivers add together, and the team with the highest total is the **Constructors' World Champion**. There is no play-off and no final: the championship is simply the sum of the season.`,
    order: 20,
  },
  {
    kind: 'history',
    heading: 'Why 1950 matters',
    body: `Grand Prix racing is older than Formula 1. Races billed as Grands Prix were run from 1906, and the Formula One regulations themselves were agreed in 1946, with non-championship races run to them for several seasons.

What 1950 added was the championship. Seven races that season counted towards a single World Championship of Drivers, opening at Silverstone in May and settled in Italy in September, and Giuseppe Farina took the first title. For the first time, individual race results meant something beyond the day they were won.

The teams waited another eight years. The constructors' title was not introduced until 1958, which is worth remembering whenever the two championships are described as though they had always run side by side.`,
    order: 30,
  },
  {
    kind: 'basics',
    heading: 'How Formula 1 works',
    body: `A season is a sequence of Grands Prix. At each one, drivers set a qualifying time that determines where they start, and then race a fixed distance. Finishing positions convert to championship points, points accumulate over the season, and the standings at the final race decide both titles.

That is the whole structure. What fills it is everything the rulebook allows a team to do differently: how the car is designed, how it is set up for a particular circuit, when it stops for tyres, and how the driver uses what they have been given.

Race results turn on a long list of things that are not simply speed: car performance, driver skill, tyre condition, strategy, the timing of pit stops, weather, safety car periods, mechanical reliability and track position. A faster car does not always win, which is why races are worth watching and why the championship is decided over a season rather than a weekend.`,
    order: 40,
  },
  {
    kind: 'formats',
    heading: 'The season, the weekend and the two titles',
    body: `The structure below is the one newcomers most often get wrong, in two specific ways.

The first is assuming that the Drivers' and Constructors' Championships are the same contest counted twice. They are not. They are decided from the same race results, but a driver carries their own points and a team carries the sum of both its cars, and the two titles regularly go to different combinations of driver and team.

The second is assuming every weekend is the same. Most are: practice, qualifying, race. A few use the sprint format, which replaces a practice session with a shorter race that awards its own points and has its own qualifying session. The Sunday Grand Prix is unchanged either way.`,
    order: 50,
  },
  {
    kind: 'structure',
    heading: 'Who runs Formula 1',
    body: `Four groups share the sport, and none of them reports to another.

The **FIA** governs. It writes and enforces the Sporting, Technical and Financial Regulations, licenses drivers and circuits, appoints the stewards who rule on incidents, and administers the championship itself. It is a federation of national motoring clubs, and those national bodies are its members.

**Formula One Management**, part of the Formula One group, holds the commercial rights. It promotes the championship, contracts the races and sells the broadcast rights. It is not a governing body and it does not write the rules.

The **constructors** are the competitors. They design, build and run the cars, and they are signatories to the Concorde Agreement alongside the FIA and the commercial rights holder, which makes them party to the arrangement rather than subordinate to it.

**Drivers** compete for the Drivers' Championship, under a licence issued by the FIA. **Circuits and race promoters** contract with the commercial rights holder to host a round and are graded and licensed by the FIA.

The distinction that matters: the body that writes the rules and the company that sells the sport are separate organisations with separate interests, and most of Formula 1's periodic governance disputes come from exactly that seam.`,
    order: 60,
  },
  {
    kind: 'competitions',
    heading: 'The championship calendar',
    body: `A season runs from an opening Grand Prix to a final one, through rounds spread across several continents. Pre-season testing precedes it, an early phase establishes who has built what, a mid-season run of races sorts the order, and a title fight resolves at the last rounds. Champions are crowned on points, not at a ceremony race, so a championship can be settled before the final weekend.

The calendar itself changes every year. Races are added, dropped and moved, the number of rounds has grown steadily, and no listing of countries or months stays accurate for long. Browse the competitions for the events themselves.`,
    order: 70,
  },
  {
    kind: 'stages',
    heading: 'The Grand Prix weekend',
    body: `A standard weekend runs in three days. **Friday** is practice: teams set the car up for the circuit, evaluate tyres and gather data, with nothing at stake in the results. **Saturday** has a final practice session and then qualifying, which sets the starting grid. **Sunday** is the Grand Prix.

Exact session timings differ from event to event, and some races run to a shifted schedule for their time zone or for local reasons.

**Sprint weekends** are the exception. A handful of events each season replace one practice session with a shorter competitive race, which awards its own points and has its own qualifying session earlier in the weekend. The format has been revised several times since it was introduced, so the specifics belong in an explainer rather than here.`,
    order: 80,
  },
  {
    kind: 'qualifying',
    heading: 'Qualifying and the grid',
    body: `Qualifying decides the starting order for the Grand Prix, and starting position matters a great deal at circuits where overtaking is hard.

It runs in three parts. All drivers take part in the first, the slowest are eliminated, and the survivors go again. The same happens after the second part, leaving the fastest drivers to contest the front of the grid in the third. The driver who sets the fastest time takes **pole position**, the first place on the grid.

The timing rules, the elimination counts, the tyre requirements and the way grid penalties are applied afterwards are all governed in detail by the Sporting Regulations, and all of it belongs in an explainer.`,
    order: 90,
  },
  {
    kind: 'race',
    heading: 'The race',
    body: `The Grand Prix is run over a set number of laps, normally the fewest that take the distance beyond 305 kilometres. Monaco, shorter and slower than anywhere else on the calendar, is the standing exception. The winner is the first eligible driver to complete the race distance.

From the grid, the race passes through the start, the pit stops, whatever the strategies and overtaking produce in between, and the chequered flag. The classification that follows converts finishing positions into championship points.

Very little of that is settled by outright pace. Tyres degrade at different rates on different cars, a pit stop costs time that must be won back on track, a safety car can erase a lead built over twenty laps, and a mechanical failure ends a race regardless of how it was going. The result is the sum of all of it.`,
    order: 100,
  },
  {
    kind: 'points',
    heading: 'How points decide the championships',
    body: `Points are awarded to the leading finishers of each Grand Prix, on a scale set by the Sporting Regulations. Those points do two jobs at once.

For the **Drivers' Championship**, a driver's race points add to their season total, and the season totals are the championship standings. Points belong to the driver, so a driver who changes team mid-season keeps them.

For the **Constructors' Championship**, the points scored by both of a team's cars are added together into a team total, and those totals are the constructors' standings. This is why a team with one quick driver and one struggling driver is at a structural disadvantage against a team scoring with both cars.

The actual values have changed repeatedly across the sport's history, and the point for the fastest lap has been introduced and withdrawn more than once. Nothing on this page states a current points table for that reason; the explainers carry the detail and are kept current.`,
    order: 110,
  },
  {
    kind: 'titles',
    heading: 'Drivers’ or constructors’: why both matter',
    body: `The **Drivers' Championship** rewards the individual with the strongest season of results. It is the title the public follows, the one that makes a driver's name, and the one the sport's history is usually told through.

The **Constructors' Championship** rewards the organisation. It reflects the car, the operation behind it and the strength of both drivers rather than one, and it determines a large part of how the sport's commercial revenue is distributed. For a team, it is frequently the more consequential of the two.

They are not alternative descriptions of the same season. A driver can win their title in a car that finishes second among the constructors, and a dominant team can take the constructors' title while its two drivers split points and lose the drivers'.`,
    order: 120,
  },
  {
    kind: 'car',
    heading: 'The cars',
    body: `A Formula 1 car is an open-wheel, single-seater machine designed around the FIA's Technical Regulations. The parts a reader will hear named are the **chassis** the car is built around, the **aerodynamics** that generate downforce, the **power unit** that drives it, the **gearbox**, the **brakes**, the **suspension**, the **tyres**, the **electronics** and the **safety systems** that protect the driver.

What distinguishes Formula 1 from most racing series is that the teams design and build their own cars rather than running a common chassis. The rulebook constrains the result heavily, but within it every team arrives at a different answer, and those differences are the season. It makes Formula 1 an engineering competition running alongside a driving one.

**Power units** have been hybrid since 2014: a turbocharged internal combustion engine combined with systems that recover energy and deploy it again. How that works, and how much of the lap time it is worth, is a subject in its own right and is covered in the explainers.`,
    order: 130,
  },
  {
    kind: 'tyres',
    heading: 'Tyres and pit stops',
    body: `Tyres are the most important strategic variable in the sport. A single supplier provides the whole grid with a range of dry-weather compounds that trade grip and outright speed against how long they last, plus intermediate and full wet tyres for when conditions demand them.

Because a softer tyre is faster but wears out sooner, when to stop is a genuine decision rather than a formality. Drivers enter the pit lane during a race to change tyres, to repair damage or to make permitted adjustments, and a stop runs from the pit entry to the team's pit box, through the tyre change, and back out to the track.

The stop itself is measured in seconds, but the cost is the whole lap: time lost in the pit lane must be won back by the fresher tyres. Timing it well can gain a position that could not have been taken on track, and timing it badly can lose one that was never at risk. Compound names, allocation rules and the mechanics of the undercut all belong in the explainers.`,
    order: 140,
  },
  {
    kind: 'strategy',
    heading: 'Race strategy',
    body: `Strategy in Formula 1 is the set of decisions a team makes during a race about things it cannot fully control.

**Tyre strategy** is which compounds to run and for how long. **Pit windows** are the laps in which a stop is most effective, given who is around the car and what they are doing. **Track position** is whether staying ahead is worth more than being faster, which at some circuits it decisively is. **Weather** can invalidate a plan in one lap. **Safety car periods** neutralise the field and make a pit stop far cheaper than usual, so they reward whoever is best placed to react. **Pace management** is the balance a driver holds between speed, tyre life, fuel and the condition of the car.

Every one of those is decided in real time on incomplete information, which is why two teams in similar cars routinely make opposite calls and only one of them looks right afterwards.`,
    order: 150,
  },
  {
    kind: 'circuits',
    heading: 'Circuits',
    body: `Formula 1 races on three broad kinds of venue. **Permanent circuits** are built for motor sport and used all year. **Street circuits** run on public roads closed for the event, with walls instead of run-off and very little margin. **Hybrid or semi-permanent circuits** combine permanent sections with roads or temporary infrastructure.

The category shapes the racing. A permanent circuit with wide run-off forgives a mistake; a street circuit punishes one immediately, which is why qualifying matters more at Monaco than almost anywhere else.

Some Grands Prix carry weight beyond their place in the calendar. Monaco for its history and its impossibility, Britain for hosting the first championship race, Italy at Monza for speed and for Ferrari, Belgium at Spa for the most demanding corners in the sport, Japan at Suzuka for a layout drivers rate above almost any other, and Brazil for the races that have been decided there. None of that is an official ranking, and the sport does not grade its events.`,
    order: 160,
  },
  {
    kind: 'flags',
    heading: 'Flags, and neutralising a race',
    body: `Flags are how a circuit talks to the drivers. **Green** means the track is clear and racing conditions apply. **Yellow** warns of a hazard ahead and requires drivers to slow. **Red** stops the session. **Blue** is shown to a driver about to be caught by faster traffic. **Black** and its variants carry an instruction to a specific driver, up to disqualification. The **chequered flag** ends the session or the race.

When a hazard needs clearing, the race can be neutralised rather than stopped. A **safety car** physically leads the field at a controlled pace, which closes the gaps between cars and bunches the whole race back together. A **virtual safety car** achieves the neutralisation without a car on track: drivers must hold to a delta time, so the gaps between them stay roughly as they were.

The difference matters strategically. Both make a pit stop cheaper, because everyone is going slower, but only the safety car destroys a lead. Precisely what each flag obliges a driver to do, and how the deltas are enforced, is explainer material.`,
    order: 170,
  },
  {
    kind: 'eras',
    heading: 'The eras',
    body: `Formula 1 is usually told in periods defined by what the cars were, not by who won.

The **1950s** were front-engined cars and Fangio, who took five titles with four different constructors. The **1960s** moved the engine behind the driver, a change so decisive that no competitive car has been built any other way since. The **1970s** brought wings, then ground effect, and a safety reckoning that was overdue by any measure. The **1980s** were turbocharged, and by the end of them Senna and Prost.

The **1990s** made the car electronic, then unmade it: active suspension and traction control were banned, permitted and banned again as the governing body decided how much of the driving the car should do. The **2000s** belonged to Schumacher and Ferrari, then to a run of regulation changes aimed at reining in aerodynamics. The **2010s** were Red Bull's four titles and then, from 2014, the turbo-hybrid formula and eight consecutive constructors' championships for Mercedes.

The **2020s** brought a budget cap, ground effect returning under the 2022 regulations, a calendar reaching further than it ever had, and sustainability targets that will shape what the cars run on next.`,
    order: 180,
  },
  {
    kind: 'rivalries',
    heading: 'Rivalries',
    body: `The sport's history is punctuated by contests between two drivers that outgrew the seasons they happened in.

**Lauda and Hunt** in 1976, decided in the rain at Fuji after Lauda's near-fatal crash at the Nürburgring. **Senna and Prost**, team-mates at McLaren in 1988 and 1989 and then rivals at opposite ends of the grid, whose collisions at Suzuka settled two championships. **Schumacher and Häkkinen** at the turn of the century, the most respectful of the great rivalries and the one that produced the best racing.

**Hamilton and Alonso** as team-mates at McLaren in 2007, a season in which both lost the title by one point. **Hamilton and Rosberg** at Mercedes from 2014, two drivers in the fastest car on the grid contesting the championship with each other and nobody else. **Hamilton and Verstappen** in 2021, decided on the final lap of the final race.

What they have in common is that each one turned a season into a story, and each is remembered for specific races rather than for final points totals.`,
    order: 190,
  },
  {
    kind: 'records',
    heading: 'Records',
    body: `Formula 1 keeps records for championships, race wins, pole positions, podiums, fastest laps and Grand Prix starts, for drivers and for constructors alike, along with the consecutive and youngest-and-oldest variants of most of them.

Almost all of the significant ones are held by drivers or teams still competing, and several have changed hands more than once in recent seasons. Rather than print a table that goes out of date without anyone noticing, the records here are drawn from the same structured data that powers the drivers' and teams' pages, so a figure on this site comes from one place and updates everywhere at once.

What is worth saying without a number attached: Fangio's five titles from seven seasons remain the highest strike rate in the sport's history, Ferrari has competed in every season since 1950 and no other constructor is close, and the eras of sustained dominance, Ferrari in the early 2000s, Red Bull at the start of the 2010s, Mercedes through the hybrid era, are the reason most of the modern records sit with a small handful of names.`,
    order: 200,
  },
  {
    kind: 'culture',
    heading: 'Beyond the results',
    body: `Formula 1 is a manufacturing and engineering industry as much as a sport. A team employs hundreds of people, most of whom never go to a race, and the design cycle runs continuously against a rulebook that changes annually.

It is also unusually global for a championship with so few events. Rounds are held across several continents, the teams are based in a handful of countries, and the audience is somewhere else again, which is why the calendar and the commercial arrangements around it are contested as often as the racing is.

The recent changes worth knowing about are structural rather than sporting: a cap on what teams may spend, a commitment to sustainable fuels, and a steady expansion into new markets. Each of them changes what kind of organisation can win.`,
    order: 210,
  },
];

/**
 * Featured entities: icons, constructors and events.
 *
 * Every entry here is historical rather than current, for the reason set out at
 * the top of this file: the grid changes and this table cannot.
 *
 * Slugs are supplied where a canonical row plausibly exists or will exist. The
 * seed resolves what it can and leaves the rest null, and an unresolved card
 * renders with its name and blurb but no link. That is deliberate: dropping the
 * unresolved ones would let an ingestion gap silently edit the list of drivers
 * the sport considers significant, and `entity_id IS NULL` is a usable work
 * queue in a way that a missing row is not.
 *
 * Ordering within each section is roughly chronological, not ranked. There is
 * no greatest-of-all-time list here and there should not be one.
 */
export const FORMULA_ONE_FEATURED: FeaturedEntitySeed[] = [
  // Icons, in rough chronological order of when they raced.
  {
    section: 'icons',
    entityType: 'person',
    slug: 'juan-manuel-fangio',
    name: 'Juan Manuel Fangio',
    meta: 'Argentina · 1950s',
    blurb:
      'Five titles in seven seasons with four different constructors, the sport’s first great.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jim-clark',
    name: 'Jim Clark',
    meta: 'United Kingdom · 1960s',
    blurb:
      'Two titles with Lotus, and a reputation among his contemporaries that outran the numbers.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jackie-stewart',
    name: 'Jackie Stewart',
    meta: 'United Kingdom · 1960s–70s',
    blurb:
      'Three titles, and the campaign that made circuit safety a condition of racing rather than an afterthought.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'niki-lauda',
    name: 'Niki Lauda',
    meta: 'Austria · 1970s–80s',
    blurb: 'Three titles, and a return to racing six weeks after the crash that nearly killed him.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'ayrton-senna',
    name: 'Ayrton Senna',
    meta: 'Brazil · 1980s–90s',
    blurb: 'Three titles and a qualifying record that defined what a single lap could be worth.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'alain-prost',
    name: 'Alain Prost',
    meta: 'France · 1980s–90s',
    blurb:
      'Four titles won by managing a race rather than attacking it, which is why the rivalry with Senna worked.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'michael-schumacher',
    name: 'Michael Schumacher',
    meta: 'Germany · 1990s–2000s',
    blurb:
      'Seven titles, five of them consecutive with Ferrari, and the template for the modern team-built championship.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lewis-hamilton',
    name: 'Lewis Hamilton',
    meta: 'United Kingdom · 2000s–',
    blurb:
      'Seven titles across two regulatory eras, and the sport’s most recognised figure of the hybrid years.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'sebastian-vettel',
    name: 'Sebastian Vettel',
    meta: 'Germany · 2000s–2020s',
    blurb:
      'Four consecutive titles with Red Bull, the youngest champion in the sport’s history when he took the first.',
    order: 90,
  },

  // Constructors whose histories are part of how the sport developed.
  {
    section: 'teams',
    entityType: 'team',
    slug: 'scuderia-ferrari',
    name: 'Ferrari',
    meta: 'Italy · 1950–',
    blurb:
      'The only constructor to have competed in every season since the championship began, and the one the sport is most identified with.',
    order: 10,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'mclaren',
    name: 'McLaren',
    meta: 'United Kingdom · 1966–',
    blurb: 'Champions across five decades, and the team of the Senna and Prost years.',
    order: 20,
  },
  {
    section: 'teams',
    entityType: 'team',
    // No canonical row: the historic Lotus entries are not in the database, and
    // the modern Team Lotus and Lotus F1 Team entries are different organisations.
    name: 'Lotus',
    meta: 'United Kingdom · 1958–1994',
    blurb:
      'The most innovative constructor of its era: the rear-engine layout, the wing, the monocoque and ground effect all arrived through Lotus.',
    order: 30,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'williams-racing',
    name: 'Williams',
    meta: 'United Kingdom · 1977–',
    blurb:
      'Nine constructors’ titles through the 1980s and 1990s, built as an independent against the manufacturers.',
    order: 40,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'mercedes',
    name: 'Mercedes',
    meta: 'Germany · 1954–1955, 2010–',
    blurb:
      'Eight consecutive constructors’ championships from the first season of the turbo-hybrid formula.',
    order: 50,
  },
  {
    section: 'teams',
    entityType: 'team',
    // No canonical row yet. Renders unlinked until one is ingested.
    name: 'Red Bull Racing',
    meta: 'Austria · 2005–',
    blurb:
      'Champions at the start of the 2010s and again under the ground-effect regulations, from a team that began as an energy-drink entry.',
    order: 60,
  },

  /*
   * Competitions.
   *
   * The championship is a competition row and resolves. The individual Grands
   * Prix are not: the database holds the championship, not its rounds, so each
   * event card renders with its name and blurb and no link. They stay because
   * they are what a reader is looking for, and because `entity_id IS NULL` on
   * these six rows is a precise statement of what is missing.
   */
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'f1-world-championship',
    name: 'FIA Formula One World Championship',
    meta: 'Worldwide · first held 1950',
    blurb: 'The championship itself: every Grand Prix of a season, and the two titles they decide.',
    order: 5,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'monaco-grand-prix',
    name: 'Monaco Grand Prix',
    meta: 'Monte Carlo · first held 1929',
    blurb:
      'A street circuit with no margin anywhere, where qualifying decides most of the race before it starts.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'british-grand-prix',
    name: 'British Grand Prix',
    meta: 'Silverstone · first held 1926',
    blurb:
      'Host of the first World Championship race in 1950, and a fixture on the calendar ever since.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'italian-grand-prix',
    name: 'Italian Grand Prix',
    meta: 'Monza · first held 1921',
    blurb:
      'The fastest circuit of the season, run in front of the closest thing the sport has to a home crowd.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'belgian-grand-prix',
    name: 'Belgian Grand Prix',
    meta: 'Spa-Francorchamps · first held 1925',
    blurb:
      'Eau Rouge and Raidillon, a circuit long enough to have its own weather, and the corners drivers rate most highly.',
    order: 40,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'japanese-grand-prix',
    name: 'Japanese Grand Prix',
    meta: 'Suzuka · first held 1976',
    blurb:
      'A figure-of-eight layout that has decided more championships than its late-season slot would suggest.',
    order: 50,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'sao-paulo-grand-prix',
    name: 'São Paulo Grand Prix',
    meta: 'Interlagos · first held 1973',
    blurb:
      'Short, anticlockwise and frequently wet, and the site of several of the sport’s most-remembered finishes.',
    order: 60,
  },
];
