/**
 * Tennis overview content.
 *
 * The fourth sport through the machinery built for football, cricket and
 * basketball, and the first individual one. Nothing here is new architecture:
 * the seed shapes are imported from `football-overview.ts` and
 * `cricket-overview.ts`, and the page renders them with the same sport-agnostic
 * components. What changes is which shapes carry weight.
 *
 * ## An individual sport in a schema built for teams
 *
 * Tennis is seeded with `hasTeams: false`, so the Teams tab does not render and
 * there are no `teams` featured entities. That is correct and deliberate: a
 * tennis player has no club. But tennis does have real national-team
 * competitions, so Davis Cup, the Billie Jean King Cup and the United Cup are
 * carried as editorial prose in the `team` section rather than as team rows.
 * Seeding them as teams would have put "Davis Cup" in a tab designed for
 * franchises and clubs, next to nothing else, which is worse than a paragraph.
 *
 * ## ATP and WTA are tours, not governing bodies
 *
 * The single largest factual risk on this page is the one the football and
 * basketball pages did not have. It is very easy, and wrong, to write the
 * governance tree as ITF → ATP → WTA, by analogy with FIFA → UEFA → national
 * associations. Professional tennis is not organised that way:
 *
 *   - The **ITF** is the international governing body. It makes the Rules of
 *     Tennis, runs the entry-level professional circuit, and organises Davis
 *     Cup, the Billie Jean King Cup and Olympic tennis.
 *   - The **ATP** and **WTA** are the men's and women's professional tours.
 *     Each is a separate organisation, jointly run by players and tournaments,
 *     that operates its own circuit and its own ranking system. Neither is a
 *     subordinate body of the ITF, and neither governs the sport.
 *   - The **four Grand Slams** are run by their own national associations and
 *     organising committees, not by the ATP or the WTA. They award ATP and WTA
 *     ranking points, but they are not tour events, and the tours do not own
 *     them.
 *
 * The governance seed therefore models the ITF's continental confederations as
 * its children, which is genuinely what they are, and the tours and the majors
 * are described in prose where the relationship can be stated accurately. The
 * `GoverningBodySeed` shape only has `world` and `continental` levels, so
 * forcing the tours into it would have required calling them something they
 * are not.
 *
 * ## On sourcing
 *
 * Dates were checked at authoring time rather than recalled, and the checking
 * changed several entries:
 *
 *   - The **French Championships** date from 1891 but were open only to members
 *     of French clubs until 1925. It is the 1925 event, not the 1891 one, that
 *     is usually counted as the first true major, which is why the timeline
 *     carries both and says which is which.
 *   - The **Australian** major has changed name repeatedly: Australasian
 *     Championships from 1905, Australian Championships from 1927, Australian
 *     Open from 1969. It was also held in New Zealand twice.
 *   - Tennis was an Olympic sport from **1896 to 1924**, absent for six decades,
 *     returned as a demonstration event in 1968 and 1984, and became a full
 *     medal sport again in **1988**. "Tennis returned to the Olympics in 1988"
 *     is correct only with the word "full" in front of "medal sport".
 *   - The **ATP was founded in 1972** as a players' association, but the ATP
 *     Tour, where the ATP ran the men's circuit, began in **1990**. Both dates
 *     are given, described as what they were.
 *   - The **WTA Tour Championships**, **Fed Cup** and several tier names have
 *     been renamed more than once. Current names are used, with the former name
 *     given where a reader will encounter it in older writing.
 *
 * ## What is deliberately absent
 *
 * **Prize money** appears nowhere. It changes every year and a hardcoded figure
 * is wrong within twelve months.
 *
 * **Live rankings and current top players** are not seeded. A hardcoded "world
 * number one" is stale almost immediately, and the Overview has no mechanism to
 * refresh it. The `modern` section describes the current generation in terms
 * that stay true, and the page's existing link to the Players tab is where a
 * reader goes for who is actually ranked where today.
 *
 * **Records** are given only where the record is closed or the holder's mark is
 * historical. Open records held by active players are stated as prose about the
 * era rather than as a numbered table that will silently go out of date.
 *
 * **Rules, scoring and ranking formulas** are not here. Tennis scoring is the
 * most-asked question about the sport and it belongs in an explainer, which is
 * what the concepts below point at.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const TENNIS_SOURCES: SourceSeed[] = [
  {
    key: 'wp-tennis',
    provider: 'wikipedia',
    title: 'Tennis',
    url: 'https://en.wikipedia.org/wiki/Tennis',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of tennis',
    url: 'https://en.wikipedia.org/wiki/History_of_tennis',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-real-tennis',
    provider: 'wikipedia',
    title: 'Real tennis',
    url: 'https://en.wikipedia.org/wiki/Real_tennis',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-itf',
    provider: 'wikipedia',
    title: 'International Tennis Federation',
    url: 'https://en.wikipedia.org/wiki/International_Tennis_Federation',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-atp',
    provider: 'wikipedia',
    title: 'Association of Tennis Professionals',
    url: 'https://en.wikipedia.org/wiki/Association_of_Tennis_Professionals',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wta',
    provider: 'wikipedia',
    title: "Women's Tennis Association",
    url: 'https://en.wikipedia.org/wiki/Women%27s_Tennis_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-open-era',
    provider: 'wikipedia',
    title: 'Open Era (tennis)',
    url: 'https://en.wikipedia.org/wiki/Open_Era_(tennis)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-grand-slam',
    provider: 'wikipedia',
    title: 'Grand Slam (tennis)',
    url: 'https://en.wikipedia.org/wiki/Grand_Slam_(tennis)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-australian-open',
    provider: 'wikipedia',
    title: 'Australian Open',
    url: 'https://en.wikipedia.org/wiki/Australian_Open',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-roland-garros',
    provider: 'wikipedia',
    title: 'French Open',
    url: 'https://en.wikipedia.org/wiki/French_Open',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wimbledon',
    provider: 'wikipedia',
    title: 'Wimbledon Championships',
    url: 'https://en.wikipedia.org/wiki/Wimbledon_Championships',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-us-open',
    provider: 'wikipedia',
    title: 'US Open (tennis)',
    url: 'https://en.wikipedia.org/wiki/US_Open_(tennis)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-surfaces',
    provider: 'wikipedia',
    title: 'Tennis court',
    url: 'https://en.wikipedia.org/wiki/Tennis_court',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-atp-rankings',
    provider: 'wikipedia',
    title: 'ATP rankings',
    url: 'https://en.wikipedia.org/wiki/ATP_rankings',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wta-rankings',
    provider: 'wikipedia',
    title: 'WTA rankings',
    url: 'https://en.wikipedia.org/wiki/WTA_rankings',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-masters',
    provider: 'wikipedia',
    title: 'ATP Masters 1000',
    url: 'https://en.wikipedia.org/wiki/ATP_Masters_1000',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wta-1000',
    provider: 'wikipedia',
    title: 'WTA 1000 tournaments',
    url: 'https://en.wikipedia.org/wiki/WTA_1000',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-davis-cup',
    provider: 'wikipedia',
    title: 'Davis Cup',
    url: 'https://en.wikipedia.org/wiki/Davis_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-bjk-cup',
    provider: 'wikipedia',
    title: 'Billie Jean King Cup',
    url: 'https://en.wikipedia.org/wiki/Billie_Jean_King_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympic-tennis',
    provider: 'wikipedia',
    title: 'Tennis at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Tennis_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-scoring',
    provider: 'wikipedia',
    title: 'Tennis scoring system',
    url: 'https://en.wikipedia.org/wiki/Tennis_scoring_system',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-tennis',
    provider: 'wikidata',
    title: 'tennis (Q847)',
    url: 'https://www.wikidata.org/wiki/Q847',
    externalId: 'Q847',
    license: 'CC0',
  },
  {
    key: 'wd-itf',
    provider: 'wikidata',
    title: 'International Tennis Federation (Q179234)',
    url: 'https://www.wikidata.org/wiki/Q179234',
    externalId: 'Q179234',
    license: 'CC0',
  },
];

/**
 * Quick facts.
 *
 * Split into `identity` and `gameplay` and nothing else, which is what opts the
 * page into its two-block layout: the hero strip carries what tennis *is*, and
 * the at-a-glance grid carries the shape of a match. The page checks that every
 * fact falls into one of those two categories before splitting, so a fact added
 * here in a third category would silently collapse the layout back to one grid.
 * If a future fact genuinely belongs elsewhere, that is fine, but it is a
 * layout decision rather than a tagging detail.
 */
export const TENNIS_FACTS: FactSeed[] = [
  {
    key: 'first-modern-form',
    label: 'First modern form',
    value: '19th century',
    category: 'identity',
    sourceKey: 'wp-history',
    order: 10,
  },
  {
    key: 'governing-body',
    label: 'Governing body',
    value: 'International Tennis Federation (ITF)',
    category: 'identity',
    sourceKey: 'wp-itf',
    order: 20,
  },
  {
    key: 'professional-tours',
    label: 'Major professional tours',
    value: 'ATP and WTA',
    category: 'identity',
    sourceKey: 'wp-atp',
    order: 30,
  },
  {
    key: 'majors',
    label: 'Major championships',
    value: 'Australian Open, Roland-Garros, Wimbledon, US Open',
    category: 'identity',
    sourceKey: 'wp-grand-slam',
    order: 40,
  },
  {
    key: 'olympic',
    label: 'Olympic sport',
    value: 'Yes, a full medal sport since 1988',
    category: 'identity',
    sourceKey: 'wp-olympic-tennis',
    order: 50,
  },
  {
    key: 'formats',
    label: 'Main formats',
    value: 'Singles, doubles, mixed doubles',
    category: 'identity',
    sourceKey: 'wp-tennis',
    order: 60,
  },
  {
    key: 'surfaces',
    label: 'Main surfaces',
    value: 'Hard, clay, grass',
    category: 'identity',
    sourceKey: 'wp-surfaces',
    order: 70,
  },
  {
    key: 'players',
    label: 'Players',
    value: '1 v 1 in singles, 2 v 2 in doubles',
    category: 'gameplay',
    sourceKey: 'wp-tennis',
    order: 110,
  },
  {
    key: 'objective',
    label: 'Objective',
    value: 'Win points, then games, then sets, then the match',
    category: 'gameplay',
    sourceKey: 'wp-scoring',
    order: 120,
  },
  {
    key: 'court',
    label: 'Court',
    value: 'A rectangular court divided across the middle by a net',
    category: 'gameplay',
    sourceKey: 'wp-surfaces',
    order: 130,
  },
  {
    key: 'court-size',
    label: 'Court dimensions',
    value: '23.77 m long; 8.23 m wide for singles, 10.97 m for doubles',
    category: 'gameplay',
    sourceKey: 'wp-surfaces',
    order: 140,
  },
  {
    key: 'match-length',
    label: 'Match length',
    value: 'Best of three sets; best of five in men’s Grand Slam singles',
    category: 'gameplay',
    sourceKey: 'wp-scoring',
    order: 150,
  },
  {
    key: 'grand-slams',
    label: 'Grand Slams',
    value: 'Four per year',
    category: 'gameplay',
    sourceKey: 'wp-grand-slam',
    order: 160,
  },
  {
    key: 'season',
    label: 'Season',
    value: 'Primarily January to November',
    category: 'gameplay',
    sourceKey: 'wp-tennis',
    order: 170,
  },
  {
    key: 'no-clock',
    label: 'Clock',
    value: 'None: a match runs until somebody wins it',
    category: 'gameplay',
    sourceKey: 'wp-scoring',
    order: 180,
  },
];

/**
 * The timeline.
 *
 * Dated from the documentary record. Where a competition's founding and its
 * becoming what we would now recognise are decades apart, both are entered
 * rather than collapsed: the French Championships in 1891 and 1925, the ATP in
 * 1972 and 1990, Olympic tennis in 1896, 1924 and 1988. Collapsing them is how
 * a timeline ends up asserting something false while every individual date in
 * it is correct.
 */
export const TENNIS_TIMELINE: TimelineSeed[] = [
  {
    year: 1150,
    title: 'Jeu de paume',
    shortDescription:
      'French monks play a handball game against monastery walls. Rackets arrive around the sixteenth century, by which point the game, later called real tennis, is played by European nobility indoors.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-real-tennis',
    order: 10,
  },
  {
    year: 1874,
    title: 'Lawn tennis is patented',
    shortDescription:
      'Walter Clopton Wingfield patents a portable court and equipment set for an outdoor game playable on a grass lawn. Similar games were being played in Britain at the same time, so he is best described as the sport’s populariser rather than its sole inventor.',
    category: 'codification',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
    order: 20,
  },
  {
    year: 1877,
    title: 'The first Wimbledon',
    shortDescription:
      'The All England Club holds the first Championships, a men’s singles event won by Spencer Gore. It is the oldest tennis tournament in the world, and the rules written for it are close to the modern game.',
    category: 'competition',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-wimbledon',
    order: 30,
  },
  {
    year: 1881,
    title: 'The US National Championships begin',
    shortDescription:
      'First held at Newport, Rhode Island. The women’s championship follows in 1887. It becomes the US Open in 1968.',
    category: 'competition',
    certainty: 'established',
    sourceKey: 'wp-us-open',
    order: 40,
  },
  {
    year: 1884,
    title: 'Women compete at Wimbledon',
    shortDescription:
      'A ladies’ singles championship is added seven years after the men’s, won by Maud Watson. Women’s tennis is part of the sport’s major championships earlier than in almost any comparable sport.',
    category: 'womens',
    certainty: 'established',
    sourceKey: 'wp-wimbledon',
    order: 50,
  },
  {
    year: 1891,
    title: 'The French Championships are founded',
    shortDescription:
      'Open only to members of French clubs, which is why this is not usually counted as the first true major. The event opens to all nationalities in 1925.',
    category: 'competition',
    certainty: 'established',
    sourceKey: 'wp-roland-garros',
    order: 60,
  },
  {
    year: 1896,
    title: 'Tennis at the first modern Olympics',
    shortDescription:
      'Tennis is on the programme at Athens and remains an Olympic sport until 1924, after which a dispute between the IOC and the tennis authorities over amateur status removes it for six decades.',
    category: 'global',
    certainty: 'established',
    sourceKey: 'wp-olympic-tennis',
    order: 70,
  },
  {
    year: 1900,
    title: 'The Davis Cup begins',
    shortDescription:
      'A challenge match between the United States and the British Isles, devised by Dwight Davis. It grows into the largest annual international team competition in any sport.',
    category: 'competition',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-davis-cup',
    order: 80,
  },
  {
    year: 1905,
    title: 'The Australasian Championships begin',
    shortDescription:
      'Held in Melbourne, and in New Zealand on two occasions. It becomes the Australian Championships in 1927 and the Australian Open in 1969.',
    category: 'competition',
    certainty: 'established',
    sourceKey: 'wp-australian-open',
    order: 90,
  },
  {
    year: 1913,
    title: 'The International Lawn Tennis Federation is founded',
    shortDescription:
      'Twelve national associations meet in Paris to create a world governing body. It drops "Lawn" from its name in 1977, becoming the ITF, by which point most tennis is no longer played on grass.',
    category: 'governance',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-itf',
    order: 100,
  },
  {
    year: 1925,
    title: 'The French Championships open to all nationalities',
    shortDescription:
      'The event becomes a true international major, and from 1928 is played at the new Stade Roland-Garros. This, rather than 1891, is the date from which it is counted among the four majors.',
    category: 'competition',
    certainty: 'established',
    sourceKey: 'wp-roland-garros',
    order: 110,
  },
  {
    year: 1926,
    title: 'The first professional tour',
    shortDescription:
      'Suzanne Lenglen turns professional and tours the United States for a fee. Professionals are immediately barred from the major championships, opening the split that will define the next forty years.',
    category: 'professionalism',
    certainty: 'established',
    sourceKey: 'wp-open-era',
    order: 120,
  },
  {
    year: 1963,
    title: 'The Federation Cup begins',
    shortDescription:
      'A women’s national-team competition founded on the ITF’s fiftieth anniversary, sixty-three years after the Davis Cup. It is renamed the Billie Jean King Cup in 2020.',
    category: 'womens',
    certainty: 'established',
    sourceKey: 'wp-bjk-cup',
    order: 130,
  },
  {
    year: 1968,
    title: 'The Open Era begins',
    shortDescription:
      'The majors admit professionals alongside amateurs for the first time, starting with the British Hard Court Championships in April and Roland-Garros in May. Records are conventionally split into pre-Open and Open Era because of it.',
    category: 'professionalism',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-open-era',
    order: 140,
  },
  {
    year: 1970,
    title: 'The Virginia Slims circuit',
    shortDescription:
      'Nine players led by Billie Jean King break away to form a separate women’s tour in protest at prize-money disparities, accepting the risk of suspension. It becomes the foundation of the WTA.',
    category: 'womens',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-wta',
    order: 150,
  },
  {
    year: 1972,
    title: 'The ATP is founded',
    shortDescription:
      'Formed as an association to represent men’s professional players. At this stage it is a players’ body rather than the organiser of the circuit, which it does not become until 1990.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-atp',
    order: 160,
  },
  {
    year: 1973,
    title: 'The WTA is founded, and the US Open equalises prize money',
    shortDescription:
      'Billie Jean King unites the competing women’s circuits into a single tour. In the same year the US Open becomes the first major to pay women and men equally; the other three follow between 2001 and 2007.',
    category: 'womens',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-wta',
    order: 170,
  },
  {
    year: 1973,
    title: 'The first computer rankings',
    shortDescription:
      'The ATP introduces a computerised ranking of men’s players, replacing selection by committee. The WTA follows in 1975. Rankings become the basis for entry and seeding across the sport.',
    category: 'structure',
    certainty: 'established',
    sourceKey: 'wp-atp-rankings',
    order: 180,
  },
  {
    year: 1988,
    title: 'Tennis returns as a full Olympic medal sport',
    shortDescription:
      'At Seoul, after demonstration events in 1968 and 1984. Steffi Graf wins the singles gold in the same year she wins all four majors, the only calendar Golden Slam in the sport’s history.',
    category: 'global',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-olympic-tennis',
    order: 190,
  },
  {
    year: 1990,
    title: 'The ATP Tour era begins',
    shortDescription:
      'The ATP takes over the running of the men’s circuit from the Men’s International Professional Tennis Council, and the modern tiered structure of tour events dates from this point.',
    category: 'structure',
    certainty: 'established',
    isMajorMilestone: true,
    sourceKey: 'wp-atp',
    order: 200,
  },
  {
    year: 2000,
    endYear: 2009,
    title: 'The Federer, Nadal and Williams era',
    shortDescription:
      'Roger Federer and Rafael Nadal establish a rivalry across contrasting surfaces and styles, while Serena and Venus Williams reshape the women’s game. Racket and string technology pushes the sport towards heavy topspin from the baseline.',
    category: 'gameplay',
    certainty: 'established',
    sourceKey: 'wp-tennis',
    order: 210,
  },
  {
    year: 2010,
    endYear: 2019,
    title: 'Djokovic, Nadal and Federer dominate',
    shortDescription:
      'Three men win the overwhelming majority of the majors for a decade, an unprecedented concentration in the Open Era. Serena Williams does much the same in the women’s game while the field below her turns over rapidly.',
    category: 'gameplay',
    certainty: 'established',
    sourceKey: 'wp-tennis',
    order: 220,
  },
  {
    year: 2020,
    title: 'A generational transition',
    shortDescription:
      'Federer and then Nadal retire, Serena Williams plays her last US Open in 2022, and a younger generation takes over the majors. The women’s game had already moved on, with several first-time major champions each season.',
    category: 'gameplay',
    certainty: 'established',
    sourceKey: 'wp-tennis',
    order: 230,
  },
];

/**
 * Governance.
 *
 * The ITF and its six regional associations, and nothing else.
 *
 * The ATP and the WTA are deliberately absent from this tree. They are not
 * subordinate bodies of the ITF and they do not sit at a `world` or
 * `continental` level of anything: they are membership organisations that run
 * their own circuits, jointly controlled by players and tournaments. Putting
 * them here as children of the ITF would draw a line of authority that does not
 * exist, and it is the single most common error made about how tennis is
 * organised. The `organisation` section explains the real relationship in prose,
 * where it can be stated accurately.
 *
 * Member counts are omitted rather than estimated. The ITF's membership is
 * quoted in different places as national associations, as affiliated members
 * and as territories, the totals differ, and none of the figures is stable
 * enough to hardcode.
 */
export const TENNIS_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'itf',
    shortName: 'ITF',
    name: 'International Tennis Federation',
    level: 'world',
    foundedYear: 1913,
    headquarters: 'London, United Kingdom',
    websiteUrl: 'https://www.itftennis.com',
    externalId: 'Q179234',
    order: 10,
  },
  {
    slug: 'tennis-europe',
    shortName: 'Tennis Europe',
    name: 'Tennis Europe',
    level: 'continental',
    parentSlug: 'itf',
    region: 'Europe',
    foundedYear: 1975,
    headquarters: 'Basel, Switzerland',
    order: 20,
  },
  {
    slug: 'cosat',
    shortName: 'COSAT',
    name: 'Confederación Sudamericana de Tenis',
    level: 'continental',
    parentSlug: 'itf',
    region: 'South America',
    foundedYear: 1946,
    order: 30,
  },
  {
    slug: 'cotecc',
    shortName: 'COTECC',
    name: 'Confederación de Tenis de Centroamérica y el Caribe',
    level: 'continental',
    parentSlug: 'itf',
    region: 'Central America and the Caribbean',
    foundedYear: 1974,
    order: 40,
  },
  {
    slug: 'atf',
    shortName: 'ATF',
    name: 'Asian Tennis Federation',
    level: 'continental',
    parentSlug: 'itf',
    region: 'Asia',
    foundedYear: 1974,
    order: 50,
  },
  {
    slug: 'cat',
    shortName: 'CAT',
    name: 'Confederation of African Tennis',
    level: 'continental',
    parentSlug: 'itf',
    region: 'Africa',
    foundedYear: 1979,
    order: 60,
  },
  {
    slug: 'otf',
    shortName: 'OTF',
    name: 'Oceania Tennis Federation',
    level: 'continental',
    parentSlug: 'itf',
    region: 'Oceania',
    foundedYear: 1972,
    order: 70,
  },
];

/**
 * Formats.
 *
 * `FormatSeed` was designed for cricket, where a format is defined by innings,
 * overs and days. Tennis has none of those, so the cricket-specific numeric
 * fields are simply unset and the taxonomy carries what actually distinguishes
 * a tennis format: how many players are on each side, and whether the event is
 * an individual or a national-team competition.
 *
 * `matchClass` is used as the grouping label the component renders. The tree
 * has two top-level branches, individual and team, because that is the real
 * division in tennis: the same player may contest both in the same season, and
 * a reader who does not know that Davis Cup exists will otherwise leave with
 * the impression that tennis is purely individual.
 */
export const TENNIS_FORMATS: FormatSeed[] = [
  {
    key: 'individual',
    label: 'Individual competition',
    matchClass: 'grouping',
    description:
      'The overwhelming majority of tennis. Players enter events in their own name, and results earn ranking points that determine entry and seeding at the next one.',
    sourceKey: 'wp-tennis',
    order: 10,
  },
  {
    key: 'singles',
    label: 'Singles',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'One player against one. The premier event at every tournament, and the discipline rankings, prize money and legacy are overwhelmingly built around.',
    sourceKey: 'wp-tennis',
    order: 20,
  },
  {
    key: 'doubles',
    label: 'Doubles',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'Two players a side, on a court widened by the tramlines. It has its own rankings, its own specialists and its own tactical character, built around net play and serve.',
    sourceKey: 'wp-tennis',
    order: 30,
  },
  {
    key: 'mixed-doubles',
    label: 'Mixed doubles',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'A doubles pairing of one man and one woman. Contested at the four Grand Slams and at the Olympics, but not as a regular tour discipline, so it has no year-round ranking.',
    sourceKey: 'wp-grand-slam',
    order: 40,
  },
  {
    key: 'wheelchair',
    label: 'Wheelchair tennis',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'Played on a full-size court with the same scoring, with the ball permitted to bounce twice. It has its own ITF tour, is contested at all four majors, and is a Paralympic sport.',
    sourceKey: 'wp-itf',
    order: 50,
  },
  {
    key: 'team',
    label: 'National-team competition',
    matchClass: 'grouping',
    description:
      'Tennis played for a country rather than for a ranking. Organised by the ITF, contested in ties made up of several singles and doubles rubbers.',
    sourceKey: 'wp-itf',
    order: 60,
  },
  {
    key: 'davis-cup',
    label: 'Davis Cup',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'The men’s national-team competition, running since 1900 and the oldest of its kind in any sport. Its format has been changed several times, most substantially in 2019.',
    conditionsAuthority: 'itf',
    sourceKey: 'wp-davis-cup',
    order: 70,
  },
  {
    key: 'bjk-cup',
    label: 'Billie Jean King Cup',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'The women’s equivalent, founded in 1963 as the Federation Cup and renamed in 2020. Older writing calls it the Fed Cup.',
    conditionsAuthority: 'itf',
    sourceKey: 'wp-bjk-cup',
    order: 80,
  },
  {
    key: 'united-cup',
    label: 'United Cup',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'A mixed national-team event opening the season in Australia, with men’s and women’s singles and a mixed doubles rubber counting towards one national result.',
    sourceKey: 'wp-tennis',
    order: 90,
  },
  {
    key: 'olympic',
    label: 'Olympic tennis',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'Players represent their country in singles, doubles and mixed doubles. A full medal sport since 1988, and the only tennis title that cannot be won more than once in four years.',
    sourceKey: 'wp-olympic-tennis',
    order: 100,
  },
];

/**
 * The basic vocabulary.
 *
 * One sentence each, and no more. These are the words a commentator will use in
 * the first five minutes of a broadcast without explaining them, and the point
 * of the section is that a newcomer can follow the next five. Everything that
 * needs a paragraph, how the scoring actually works, why a break of serve
 * decides sets, how a tie-break is played, is an explainer.
 *
 * `explainerSlug` is set optimistically where an explainer is expected to
 * exist. The API checks each slug against the explainer table and drops the
 * link if there is no such row, so a slug that has not been written yet
 * degrades to an unlinked card rather than a broken link.
 */
export const TENNIS_CONCEPTS: ConceptSeed[] = [
  {
    key: 'serve',
    term: 'Serve',
    summary:
      'The shot that starts every point, hit from behind the baseline into the diagonally opposite service box.',
    category: 'play',
    explainerSlug: 'the-serve',
    sourceKey: 'wp-tennis',
    order: 10,
  },
  {
    key: 'return',
    term: 'Return',
    summary: 'The receiving player’s reply to the serve, and the second shot of any point.',
    category: 'play',
    sourceKey: 'wp-tennis',
    order: 20,
  },
  {
    key: 'rally',
    term: 'Rally',
    summary: 'A sequence of shots exchanged over the net until the point ends.',
    category: 'play',
    sourceKey: 'wp-tennis',
    order: 30,
  },
  {
    key: 'ace',
    term: 'Ace',
    summary: 'A legal serve the receiver fails to touch, winning the point outright.',
    category: 'play',
    sourceKey: 'wp-tennis',
    order: 40,
  },
  {
    key: 'fault',
    term: 'Fault',
    summary:
      'A serve that misses the correct service box or is hit from the wrong position; the server gets a second attempt.',
    category: 'play',
    sourceKey: 'wp-scoring',
    order: 50,
  },
  {
    key: 'double-fault',
    term: 'Double fault',
    summary: 'Two faults in a row on the same point, which hands the point to the receiver.',
    category: 'play',
    sourceKey: 'wp-scoring',
    order: 60,
  },
  {
    key: 'volley',
    term: 'Volley',
    summary: 'A shot struck before the ball bounces, usually played close to the net.',
    category: 'play',
    sourceKey: 'wp-tennis',
    order: 70,
  },
  {
    key: 'winner',
    term: 'Winner',
    summary: 'A shot the opponent cannot reach, ending the point in the striker’s favour.',
    category: 'play',
    sourceKey: 'wp-tennis',
    order: 80,
  },
  {
    key: 'unforced-error',
    term: 'Unforced error',
    summary:
      'A mistake made with time and position to play the shot, rather than one forced by the opponent’s pressure.',
    category: 'play',
    ambiguityNote:
      'Judged rather than measured. Whether an error was forced is a scorer’s decision, so the statistic is not strictly comparable between events.',
    sourceKey: 'wp-tennis',
    order: 90,
  },
  {
    key: 'love',
    term: 'Love',
    summary: 'A score of zero.',
    category: 'scoring',
    explainerSlug: 'how-tennis-scoring-works',
    sourceKey: 'wp-scoring',
    order: 100,
  },
  {
    key: 'deuce',
    term: 'Deuce',
    summary:
      'A game score of 40–40, from which a player must win two consecutive points to take the game.',
    category: 'scoring',
    explainerSlug: 'how-tennis-scoring-works',
    sourceKey: 'wp-scoring',
    order: 110,
  },
  {
    key: 'break-point',
    term: 'Break point',
    summary: 'A point which, if won by the receiver, wins them a game their opponent was serving.',
    category: 'scoring',
    explainerSlug: 'how-tennis-scoring-works',
    sourceKey: 'wp-scoring',
    order: 120,
  },
  {
    key: 'baseline',
    term: 'Baseline',
    summary: 'The line at each end of the court, marking the far boundary of play.',
    category: 'court',
    sourceKey: 'wp-surfaces',
    order: 130,
  },
  {
    key: 'seed',
    term: 'Seed',
    summary:
      'A ranked player positioned in the draw so that the strongest entrants cannot meet each other in the early rounds.',
    category: 'structure',
    explainerSlug: 'how-tennis-rankings-work',
    sourceKey: 'wp-atp-rankings',
    order: 140,
  },
  {
    key: 'wild-card',
    term: 'Wild card',
    summary:
      'A place in the draw granted by the tournament rather than earned by ranking, often given to a local player or a returning former champion.',
    category: 'structure',
    sourceKey: 'wp-tennis',
    order: 150,
  },
];

/**
 * Editorial sections.
 *
 * Section `kind` values that the page has an explicit slot for are used where
 * they fit: `introduction`, `history`, `basics`, `glance`, `structure`,
 * `formats`, `competitions`, `eras`, `womens`, `global` and `culture`. The rest,
 * `open-era`, `tiers`, `majors`, `surfaces`, `calendar`, `rankings`, `team`,
 * `legends`, `modern`, `rivalries` and `records`, have no dedicated slot and
 * render through the page's `additional` fallback, in `order`.
 *
 * That fallback is why this page needs no frontend work. It renders any
 * authored section it does not recognise, in order, after the placed ones. The
 * ordering below is therefore the reading order for everything from `tiers`
 * onwards, and the numbers are spaced so a section can be inserted later
 * without renumbering.
 *
 * Every section stops short of the rules. Tennis scoring, ranking arithmetic
 * and tactical detail are the most requested explanations in the sport and all
 * of them belong in Explainers; this page's job is to say what exists and how
 * it fits together.
 */
export const TENNIS_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is tennis?',
    order: 10,
    body: `Tennis is a racket sport played between two players, called singles, or two pairs, called doubles. A rectangular court is divided across the middle by a net, and players strike a ball back and forth over it. A point is won when one side cannot return the ball into the opponent's court within the rules, and the player who wins enough points wins a game, enough games a set, and enough sets the match.

Two features shape everything else about the sport. The first is that there is no clock. A tennis match runs until somebody has won it, which can take under an hour or well past five, and a player who is losing heavily is never running out of time, only out of chances. The second is the serve. One player begins every point, and because serving is a substantial advantage, most of a tennis match is spent establishing whether either player can win a game against the other's serve. Whole sets turn on a single such moment.

Tennis is also unusual among global sports in being genuinely individual. There is no club, no manager picking a side and no team-mate to carry a bad day. A player travels between tournaments across the calendar year, in different countries and on different surfaces, and is ranked on their own results. The consequences of that, for how the sport is organised and how a career is built, run through the rest of this page.`,
  },
  {
    kind: 'glance',
    heading: 'Tennis at a glance',
    order: 20,
    body: `The court is a fixed size everywhere, and the tramlines down each side are what change it between singles and doubles: the same court, played narrow by two people and wide by four.

Match length is the figure that varies most. Almost all professional tennis is best of three sets. Men's singles at the four Grand Slams is best of five, which is why those matches can run beyond four hours and why the majors ask something physically different of the men's field than the rest of the season does. Tie-break rules at the end of a deciding set have also changed within the last few years and are not identical at every event.`,
  },
  {
    kind: 'history',
    heading: 'How tennis developed',
    order: 30,
    body: `Tennis descends from **jeu de paume**, a game played by French monks from around the twelfth century by striking a ball against monastery walls with the palm of the hand. Rackets appeared some four hundred years later, and the game, now called real tennis, became a fixture of European courts, played indoors on an elaborate walled court that survives in a handful of places today.

Modern tennis is a Victorian invention. In 1874 Walter Clopton Wingfield patented a boxed set containing a net, rackets, balls and instructions for a game playable on a grass lawn, and marketed it to the British middle classes who had lawns and leisure. Similar games were being played independently at the same time, so he is better described as the sport's populariser than its inventor, but the patent is the point at which lawn tennis becomes a product anyone could buy and play.

Codification followed almost immediately. The All England Croquet Club, needing a use for its grounds, held a tennis championship in 1877 and wrote a set of rules for it. That tournament became **Wimbledon**, and those rules are close enough to today's that a spectator from 1877 would recognise a modern match. The United States followed in 1881, France in 1891 and Australasia in 1905, and by 1913 twelve national associations had founded an international federation.

The sport then spent most of the twentieth century divided against itself. The major championships were amateur events, and any player who accepted money to play was barred from them. Since the best players were exactly the ones with an incentive to turn professional, the championships were routinely contested without the strongest field in the world. That contradiction held until 1968, and the sport is still counted in two halves because of it.`,
  },
  {
    kind: 'open-era',
    heading: 'Why 1968 changed tennis',
    order: 40,
    body: `Until 1968 tennis maintained a strict distinction between amateurs and professionals. Amateurs could enter Wimbledon, Roland-Garros, the US and Australian championships, the Davis Cup and the Olympics, but were not supposed to be paid. Professionals were paid, and were banned from all of it. They played instead on promoter-run tours, often head-to-head series in hired arenas, for money but without the titles that conferred status.

The effect was that the sport's most prestigious tournaments were frequently not contested by its best players. A leading amateur would win Wimbledon, turn professional for the income, and thereby become ineligible to defend it. Rod Laver won the calendar Grand Slam in 1962, turned professional, and was barred from all four majors for the next five years of what was probably his prime. The amateur rules were also widely evaded through under-the-table payments, so the distinction was as much a fiction as a rule.

In 1968 the International Lawn Tennis Federation gave way and allowed the major championships to accept professionals. The first open tournament was the British Hard Court Championships that April, and Roland-Garros followed in May as the first open major. Laver returned and won the calendar Grand Slam again in 1969, the only man to have done it twice.

This is why tennis records are almost always quoted as **Open Era** records. It is not a technicality. Comparing a title count from before 1968 with one from after means comparing a field that excluded the best professionals with one that did not, and the sport's own statistics keep the two apart for that reason.`,
  },
  {
    kind: 'basics',
    heading: 'How a match works',
    order: 50,
    body: `Points are scored in a sequence that is unique to tennis and looks arbitrary until it is explained: love, 15, 30, 40, game. Win four points and you win a game, unless the score reaches 40–40, called deuce, at which point a player must win two in a row. Win six games, by a margin of two, and you win a set. Win the majority of the sets and you win the match.

One player serves for an entire game, and service alternates game by game. Because the server has the advantage, the expected pattern is that both players hold serve and the set stays level. What decides sets is therefore the **break**: winning a game against the opponent's serve. Most of the tension in a tennis match is concentrated in the handful of points where a break is available.

If a set reaches six games all, it is usually decided by a tie-break, a single extended game played to seven points. The rules for the final set differ between tournaments and have changed more than once in recent years, which is one of the few genuine inconsistencies across the four majors.

That is as far as this page goes. What a let is, why the serve alternates between service boxes, how the tie-break rotation works and why the scoring runs 15-30-40 at all are all worth knowing and all covered properly in the explainers.`,
  },
  {
    kind: 'structure',
    heading: 'How professional tennis is organised',
    order: 60,
    body: `Tennis is not run by one body, and the most common mistake made about its structure is assuming it is. Several organisations with different remits operate at the same time, and none of them is above the others in the way a football federation is above its leagues.

**The ITF** is the international governing body. It writes the Rules of Tennis, recognises a national association in each country, sanctions the entry-level professional circuit where players begin their careers, and organises the Davis Cup, the Billie Jean King Cup and the Olympic tournament. Its authority over the rules of the game is genuine and universal.

**The ATP** runs the men's professional tour and its ranking system. **The WTA** does the same for the women's. Each is an independent organisation, governed jointly by the players and the tournaments that make it up, and each owns and operates its own circuit. Neither is a branch of the ITF, and neither governs tennis: the ATP does not make the rules, and a player at the Olympics is competing under the ITF's authority, not the ATP's.

**The four Grand Slams** are run by their own organisations: the All England Club, the Fédération Française de Tennis, Tennis Australia and the United States Tennis Association. They are not tour events. They award ATP and WTA ranking points, and the tours' calendars are built around them, but the tours do not own or control them. This independence is why the majors can and do differ from tour events, and from each other, in format, scheduling and conditions.

The practical effect is that professional tennis is a negotiated arrangement between four sets of interests rather than a hierarchy. It explains why change in tennis is slow, why the majors can adopt different final-set rules from one another, and why proposals to unify the sport's calendar or its commercial structure recur without ever quite happening.`,
  },
  {
    kind: 'tiers',
    heading: 'The tournament hierarchy',
    order: 70,
    body: `Below the Grand Slams, tournaments are graded into tiers. The tier sets how many ranking points the winner receives, which in turn determines how strong a field the event attracts, so the hierarchy is largely self-reinforcing. The men's and women's tours grade separately, and their tier names do not correspond exactly.

**The men's ladder** runs: the Grand Slams; the ATP Finals, an eight-player season-ending event for the year's leading players; the ATP Masters 1000, nine tournaments that the top players are generally required to enter, including Indian Wells, Miami, Monte-Carlo, Madrid, Rome, Canada, Cincinnati, Shanghai and Paris; then ATP 500 and ATP 250 events, which make up the bulk of the calendar. Below the tour sits the ATP Challenger Tour, and below that the ITF Men's World Tennis Tour, where professional careers usually begin.

**The women's ladder** runs: the Grand Slams; the WTA Finals; WTA 1000 events including Indian Wells, Miami, Madrid, Rome, Canada, Cincinnati, Beijing and Wuhan; then WTA 500, WTA 250 and WTA 125 events; and beneath them the ITF Women's World Tennis Tour.

The numbers in the tier names refer to ranking points, roughly, rather than to anything else, and they are the reason a player's schedule is not simply a matter of preference. Entry to the biggest events is by ranking, ranking comes from results at events you were able to enter, and a player outside the tour's direct-entry cutoff spends their season on the Challenger and ITF circuits trying to earn their way in. The gap in travel costs, prize money and visibility between the tour and the tiers below it is large, and it is the practical dividing line between a professional career that sustains itself and one that does not.

Prize money is not listed here because it changes every year at every level.`,
  },
  {
    kind: 'majors',
    heading: 'The four Grand Slams',
    order: 80,
    body: `Four tournaments stand above everything else in tennis. In calendar order:

**The Australian Open**, in Melbourne, played on hard courts in January, in the southern-hemisphere summer. It grew from the Australasian Championships of 1905 and was for decades the least-attended major because of the travel involved; it is now among the best attended.

**Roland-Garros**, in Paris, played on clay in late May and June, and the only major on the surface. It is generally considered the most physically demanding of the four, and its list of champions is the least like the other three.

**Wimbledon**, in London, played on grass in late June and July. The oldest tennis tournament in the world, first held in 1877, and the only major still played on the surface the sport was invented on.

**The US Open**, in New York, played on hard courts from late August into September. The loudest and most commercially driven of the four, and the first major to pay equal prize money to women and men, in 1973.

**What makes a Grand Slam special** is partly formal and partly not. Formally: the draws are larger, at 128 players in singles rather than the 32, 48 or 64 of tour events; they run over two weeks rather than one; men's singles is best of five sets rather than three; they award far more ranking points than anything else; and each stages men's and women's singles, men's and women's doubles, mixed doubles, junior and wheelchair events, which no tour event does.

Informally, and more importantly, they are how the sport keeps score of a career. A player's legacy is measured in majors more than in any other statistic, to the point where winning all four in a career, the **Career Grand Slam**, or all four in one year, the **calendar Grand Slam**, are the achievements the sport treats as definitive. That is a convention rather than a rule, but it is a near-universal one, and it is why a Grand Slam final is a different kind of occasion from any other match in tennis.`,
  },
  {
    kind: 'surfaces',
    heading: 'Court surfaces',
    order: 90,
    body: `Tennis is the only major sport that regularly changes the surface it is played on partway through the season, and the surface changes the game enough that it changes who wins.

**Hard courts** are acrylic over a concrete or asphalt base, and are the most common surface in professional tennis. The bounce is consistent and predictable, and the speed sits in the middle of the range, though it varies between venues because the surface can be mixed to play faster or slower. Hard courts reward a balanced game and do not obviously favour any one style. The Australian Open and the US Open are played on them.

**Clay** is crushed brick or shale. The ball grips as it lands, so it bounces higher and loses more speed, and points last longer. Players slide into their shots rather than planting, which is a distinct skill. Clay rewards endurance, movement and heavy topspin, and it blunts a big serve more than any other surface. Roland-Garros is the only major played on it, and the European clay season that leads into it is a substantial part of the calendar.

**Grass** is the sport's original surface and now the rarest. The ball skids and stays low, points historically end faster, and the bounce is less predictable, particularly as the court wears through a fortnight. Grass rewards serving, early aggression and comfort at the net. Wimbledon is the only major on it, and the grass season lasts barely a month.

**The surface specialist** is a consequence of all this. Some players' games are shaped so strongly by one surface that their results elsewhere never match: a clay-court specialist whose movement and topspin are worth less on grass, or a big server whose advantage evaporates on a slow court. The gap has narrowed since the 1990s, as grass courts were slowed and racket technology made baseline play viable everywhere, and the very best players now win on all three. But it has not closed, and a player's surface record remains one of the more informative things about them.

How the surfaces differ in measurable terms, and what that does to tactics, is covered in the explainers.`,
  },
  {
    kind: 'calendar',
    heading: 'How the tennis season works',
    order: 100,
    body: `Tennis has no league season. There is no fixture list, no home ground and no table. Instead there is a calendar of individual tournaments in different countries, and each player decides which to enter, subject to their ranking being high enough to get in and to tour rules requiring the leading players to appear at the biggest events.

The year runs roughly from January to November, and it is organised in blocks by surface and region:

**January** opens in Australia, with warm-up events and the United Cup leading into the **Australian Open**.

**February and March** move to indoor and outdoor hard courts, with the large Indian Wells and Miami events in the United States forming the first major hard-court block of the year.

**April and May** are the European clay season: Monte-Carlo, Madrid and Rome among others, all preparing the field for Paris.

**Late May into June** is **Roland-Garros**, two weeks on clay.

**Late June and July** is the grass season, a short run of events leading into **Wimbledon**. The transition from clay to grass is the most abrupt in the calendar, and players have only a few weeks to adjust.

**Late July and August** covers post-Wimbledon events on clay and hard courts, and in Olympic years the Games fall in this window.

**August and September** is the North American hard-court swing, building through Canada and Cincinnati to the **US Open**.

**September and October** move to Asia and back to indoor Europe, where much of the remaining ranking-point movement of the year happens.

**November** closes the season with the **ATP Finals** and **WTA Finals** for the year's leading players, and with the concluding stages of the Davis Cup and Billie Jean King Cup.

The off-season is short, typically a matter of weeks, which is one of the recurring complaints about the sport's structure. A tennis player's year is spent travelling almost continuously between events on three continents and three surfaces, paying their own coaching and travel costs out of prize money, and the physical and financial demands of that are the defining fact of a professional career outside the top of the game.`,
  },
  {
    kind: 'rankings',
    heading: 'How rankings shape a career',
    order: 110,
    body: `Both tours publish a ranking, and in an individual sport with no leagues the ranking does the work a league table does elsewhere. It is the mechanism by which the sport organises itself.

Players earn ranking points by winning matches at sanctioned tournaments. Bigger tournaments award more points, and points accumulate over a rolling period rather than resetting at the start of a year. The chain runs:

**Enter a tournament → win matches and advance through the rounds → earn ranking points for the round reached → those points join the rest of your results → your ranking is your position in the resulting order.**

The ranking then determines almost everything practical about the following season. It decides which tournaments a player can enter directly rather than qualifying for. It decides seeding, which determines how deep into a draw a player goes before meeting one of the other leading players. It decides who qualifies for the season-ending finals. And it decides entry to the Olympic tournament. A ranking is not a commentary on how good a player is; it is the thing that grants or withholds access to the events where they can prove it.

The arithmetic behind it, how points expire, what counts towards a total and why a player can lose ranking places without losing a match, is genuinely intricate and belongs in an explainer rather than here.`,
  },
  {
    kind: 'formats',
    heading: 'Match formats',
    order: 120,
    body: `**Singles** is one player against one, and is the discipline that defines the sport's rankings, prize money and legacies.

**Doubles** is two against two, played on a court widened by the tramlines down each side. It has its own ranking, its own specialists and a tactical character of its own, built around serving and controlling the net. Some singles players contest it, and some players build careers in doubles alone.

**Mixed doubles** pairs one man with one woman. It is contested at the four Grand Slams and at the Olympics, but is not a regular tour discipline and has no year-round ranking of its own.

Most professional matches are **best of three sets**. Men's singles at the four Grand Slams is **best of five**, and Davis Cup has used five-set formats at various points in its history. Beyond that, details vary by event: whether a deciding set has a tie-break and at what score, whether no-ad scoring is used, and what the rules are in doubles, which at many events replaces the deciding set with a match tie-break. Formats also change, and several have changed within the last few years.

The point to take from this is that "a tennis match" is not one fixed thing. The full detail belongs in the explainers.`,
  },
  {
    kind: 'team',
    heading: 'Team tennis',
    order: 130,
    body: `Tennis is overwhelmingly an individual sport, but it is not entirely one, and its team competitions are among its oldest events.

**The Davis Cup** is the men's national-team competition, first contested in 1900 between the United States and the British Isles. Countries meet in ties made up of singles and doubles rubbers, and it is the largest annual international team competition in any sport by number of participating nations. Its format has been restructured several times, most substantially in 2019, and the changes remain contested among players and supporters.

**The Billie Jean King Cup** is the women's equivalent, founded in 1963 as the Federation Cup. It was renamed in 2020 for the player who did more than anyone to establish women's professional tennis; older writing calls it the Fed Cup.

**The United Cup** is a mixed national-team event that opens the season in Australia, in which men's and women's singles and a mixed doubles rubber all count towards a single national result.

**Olympic tennis** has been a full medal sport since 1988, with singles, doubles and mixed doubles events in which players represent their country. Because it comes round only every four years, an Olympic gold is the one title in tennis a player cannot simply try again for next season.

These four are official competitions organised by the ITF or the IOC. **The Laver Cup** is not: it is a team event pitting Team Europe against Team World, founded in 2017 and privately organised. It attracts leading players and produces memorable occasions, but it is an invitational exhibition rather than a national-team championship, and results in it do not carry the standing of the competitions above. The distinction is worth keeping clear, because the presentation of the event does not always make it obvious.`,
  },
  {
    kind: 'global',
    heading: 'Tennis around the world',
    order: 140,
    body: `Tennis is played nearly everywhere and is professionally concentrated in relatively few places. The tour visits every inhabited continent, but the countries that consistently produce champions, host the largest events and sustain deep domestic structures are fewer than the sport's global reach suggests.

**Europe** is the sport's centre of gravity. It hosts two majors and the great majority of tour events, and its clay-court tradition runs through Spain, France and Italy, while Serbia, Switzerland, Germany, Russia and the Czech Republic have each produced generations of leading players out of populations that are, in some cases, very small.

**North America** contributes the US Open, the largest hard-court events on the calendar, and the deepest commercial market in the sport. The United States has the longest continuous record of champions of any country, particularly in the women's game.

**South America** is a clay-court region, with Argentina and Brazil producing a steady line of players whose games are built for the surface and who have historically been strongest during the European clay season.

**Australia and Oceania** support a major and a domestic tradition out of proportion to their population, and Australia was among the dominant tennis nations for much of the twentieth century.

**Asia** is where the sport has grown fastest in recent decades. Major events in China and Japan now form a substantial autumn block of the calendar, and success by leading players from the region transformed participation in ways that are still working through.

Historically significant tennis countries include the United States, the United Kingdom, France, Spain, Italy, Germany, Serbia, Switzerland, the Czech Republic, Russia, Australia and Argentina, and that list reflects the record rather than any ranking of them.

The sport's persistent structural problem is cost. Tennis requires courts, rackets, coaching and, above all, travel, and a junior player's development depends on competing internationally from an early age. That is a substantial barrier, and it is a large part of why the map of professional tennis is narrower than the map of people who play it.`,
  },
  {
    kind: 'womens',
    heading: 'The women’s game',
    order: 150,
    body: `Women have competed at tennis's major championships since 1884, which is earlier than in almost any comparable sport, and the women's game has never been a later addition to the men's in the way it has elsewhere.

That did not make it equal. Through the amateur era and into the early Open Era, women received a fraction of the prize money on offer to men and had far less control over their own circuit. In 1970 nine players led by Billie Jean King signed contracts with a separate tournament promoter in protest, risking suspension from the sport, and launched what became the Virginia Slims circuit. In 1973 King brought the competing women's circuits together to form the **WTA**, and in the same year the US Open became the first major to pay women and men equally. The other three majors followed between 2001 and 2007.

The women's game has its own competitive character. It has generally seen faster turnover at the top than the men's, with more first-time major champions and shorter periods of single-player dominance, punctuated by exceptions, Court, Evert, Navratilova, Graf, Serena Williams, whose dominance was as complete as anything in the sport's history. The absence of a five-set format at the majors makes its Grand Slam matches shorter, and its own tier structure below the majors runs one level deeper than the men's.`,
  },
  {
    kind: 'legends',
    heading: 'Legends of tennis',
    order: 160,
    body: `Names a follower of the sport will encounter, listed by era rather than ranked. Ranking them is an argument, and this is an introduction.

**In the men's game**, Rod Laver is the only player to have won the calendar Grand Slam twice, in 1962 and again in 1969, either side of five years in which professional status barred him from the majors entirely. Björn Borg won Roland-Garros and Wimbledon in the same year three times, a combination the difference between clay and grass was supposed to make impossible, and retired at 26. Pete Sampras defined 1990s tennis on fast courts with the era's most complete serve. Andre Agassi, his contemporary and opposite in temperament and style, was the first man to complete a Career Grand Slam on all three modern surfaces. Roger Federer, Rafael Nadal and Novak Djokovic then won an overwhelming share of the majors for two decades between them, an era with no precedent in the sport, with Nadal's record at Roland-Garros standing as the most extreme surface dominance tennis has recorded.

**In the women's game**, Margaret Court holds the largest total of major singles titles, achieved across the amateur and Open eras. Billie Jean King won repeatedly at the majors and then reshaped the sport off the court by founding the WTA. Chris Evert and Martina Navratilova met in dozens of finals over more than a decade, contrasting baseline precision against serve-volley aggression. Steffi Graf won all four majors and Olympic gold in the single calendar year of 1988, the Golden Slam, which nobody else has done. Serena Williams then dominated for two decades and held the Open Era record for women's major singles titles, winning her last while well into her thirties.

Each of these players has a full record on their own page, and the Players tab is where the numbers live.`,
  },
  {
    kind: 'eras',
    heading: 'Modern tennis',
    order: 170,
    body: `The generation that defined tennis in the 2000s and 2010s has left it. Federer retired in 2022, Serena Williams played her last US Open in the same year, and Nadal followed in 2024. For the first time in roughly twenty years, the men's majors are being won by players who were children when that era began.

The women's game had already turned over. Its majors have been shared among a wider group for some time, with new champions arriving each season and no single player establishing the sort of grip that Graf or Serena Williams had.

Because the top of the sport now changes from season to season, this page does not list current rankings or name the present leading players. Anything written here would be out of date within months. **The Players tab carries who is actually ranked where, with current records**, and is the right place to look for it.

What is stable enough to say about the modern game is how it is played. Racket and string technology has made heavy topspin available to everyone, which has pushed play towards the baseline and lengthened rallies on every surface. Grass courts have been slowed and hard courts homogenised, narrowing the differences between surfaces that once produced true specialists. Serve-and-volley as a primary tactic has all but disappeared from the professional game. And electronic line calling has replaced human line judges at most major events, removing a category of dispute that was part of the sport's texture for a century.`,
  },
  {
    kind: 'rivalries',
    heading: 'Rivalries that defined eras',
    order: 180,
    body: `Because tennis is individual and its leading players meet repeatedly over many years, its rivalries are unusually legible. Two people, the same court, a record of every previous meeting.

**Federer and Nadal** met across contrasting styles and surfaces for fifteen years, Federer's economy against Nadal's topspin and physicality, with Nadal holding the edge overall and Federer more competitive on faster courts. Their 2008 Wimbledon final is widely described as the finest match ever played.

**Djokovic and Nadal** produced the longest and most-played rivalry at the top of men's tennis, contested largely from the baseline and frequently at extreme physical length, including a 2012 Australian Open final that ran close to six hours.

**Federer and Djokovic** ran for well over a decade, including the 2019 Wimbledon final in which Federer held two championship points and lost.

**Borg and McEnroe** compressed a rivalry into a few years around 1980, an all-time contrast in temperament, and gave the sport the 1980 Wimbledon final and its fourth-set tie-break.

**Sampras and Agassi** carried American tennis through the 1990s, serve-volley precision against the best return of serve of the era.

**Evert and Navratilova** met eighty times over sixteen years, the most-played rivalry in professional tennis, and their contrast of baseline consistency against attacking net play did more than anything else to establish the women's tour's audience.

**Graf and Seles** was ended not by form but by the stabbing of Monica Seles on court in 1993, one of the darkest episodes in the sport's history, at a point when their rivalry was the defining contest in women's tennis.

**Serena and Venus Williams** played each other in nine Grand Slam finals, a rivalry between sisters with no real parallel in any sport.

Where the head-to-head records exist in our data, they are on the players' own pages.`,
  },
  {
    kind: 'records',
    heading: 'Records that define the sport',
    order: 190,
    body: `Tennis keeps score of itself through a small number of categories, and almost all of them are quoted as **Open Era** records, since 1968, for the reasons set out above.

**Grand Slam singles titles** is the measure the sport treats as definitive, and the men's record has moved repeatedly in recent years as Federer, Nadal and Djokovic passed each other. In the women's game, Margaret Court's all-time total spans the amateur and Open eras, while Serena Williams holds the Open Era record.

**Weeks at world number one** and **year-end number one finishes** measure sustained dominance rather than peak achievement, and can diverge sharply from major counts: a player can win more majors than a contemporary while spending less time ranked above them.

**The calendar Grand Slam**, all four majors in one year, has been done by very few players and by no man since Rod Laver in 1969. **The Career Grand Slam**, all four at some point, is a larger but still short list. **The Golden Slam**, all four plus Olympic gold in one calendar year, has been achieved once, by Steffi Graf in 1988.

**Winning streaks**, **total tour titles**, **youngest and oldest major champions** and **Olympic medals** make up the rest of the standard set, and the surface-specific records are where tennis's most extreme numbers sit, Nadal's record at Roland-Garros above all.

Specific totals are deliberately not printed here. Several of these records are held by players who are still competing, and a figure hardcoded into an introduction is wrong within a season. **The Players and Competitions tabs carry the current numbers**, drawn from the data rather than written into the page.`,
  },
  {
    kind: 'culture',
    heading: 'Why tennis holds attention',
    order: 200,
    body: `Tennis produces a particular kind of drama, and the reason is structural. There is no clock to run down and no team-mate to hide behind, so a match that has turned can always turn back, and the player it turned against has to solve it alone, in public, with no substitution available. A five-set major match is as much a test of composure over four hours as of technique.

The scoring system amplifies this. Because points are grouped into games and games into sets, not all points are equal, and the sport concentrates its significance into a small number of them. A player can win more total points than their opponent and lose the match. That is not a flaw in the design; it is the design, and it is why tennis crowds can identify the decisive moment of a match while it is happening.

The rest of the sport's character comes from its independence. Four majors run by four different organisations, on three surfaces, in four countries, each with its own conventions, Wimbledon's grass and its dress code, Roland-Garros's clay, the noise of New York, the heat of Melbourne. No governing body has ever managed to make them uniform, and the sport is more interesting for it.`,
  },
];

/**
 * Featured entities.
 *
 * Two sections only, `icons` and `competitions`. There is deliberately no
 * `teams` block: tennis is seeded with `hasTeams: false`, it has no clubs, and
 * the national-team competitions are covered in the `team` section as prose.
 *
 * Slugs were checked against the tennis rows we actually hold rather than
 * guessed. Where no canonical row exists, the `slug` is omitted and the seeder
 * writes the card with a null entity id, so it renders with its blurb and
 * simply does not link. That is the intended degradation: the editorial list is
 * a judgement about who belongs on this page, and it should not silently change
 * shape because ingestion has not reached somebody yet.
 *
 * Icons are ordered chronologically by era, not ranked, for the same reason the
 * heading says "Icons" rather than "greatest". Men and women are interleaved by
 * era rather than separated, so that the list does not imply a default and an
 * exception.
 */
export const TENNIS_FEATURED: FeaturedEntitySeed[] = [
  {
    section: 'icons',
    entityType: 'person',
    // No canonical row yet. Card renders unlinked until ingestion reaches him.
    name: 'Rod Laver',
    meta: 'Australia · 1962–1976',
    blurb:
      'The only player to have won the calendar Grand Slam twice, in 1962 and 1969, either side of five years barred from the majors as a professional.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    name: 'Margaret Court',
    meta: 'Australia · 1960–1977',
    blurb:
      'Holds the largest total of major singles titles of any player, won across the amateur and Open eras.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    name: 'Billie Jean King',
    meta: 'United States · 1959–1983',
    blurb:
      'Won repeatedly at the majors, then founded the WTA and forced the prize-money question that reshaped the women’s game.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    name: 'Björn Borg',
    meta: 'Sweden · 1973–1983',
    blurb:
      'Won Roland-Garros and Wimbledon in the same year three times, a clay-and-grass double the era considered impossible, and retired at 26.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'chris-evert',
    name: 'Chris Evert',
    meta: 'United States · 1972–1989',
    blurb:
      'Baseline precision and a record of consistency at the majors that has never really been matched, half of the sport’s most-played rivalry.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'martina-navratilova',
    name: 'Martina Navratilova',
    meta: 'Czechoslovakia and United States · 1975–1994',
    blurb:
      'Attacking serve-volley tennis and an unmatched record at Wimbledon, across singles and doubles alike.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    name: 'John McEnroe',
    meta: 'United States · 1978–1992',
    blurb:
      'The finest touch player of his era and its most combustible presence, whose rivalry with Borg defined tennis around 1980.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'steffi-graf',
    name: 'Steffi Graf',
    meta: 'Germany · 1982–1999',
    blurb:
      'Won all four majors and Olympic gold in 1988, the only Golden Slam in the history of the sport.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'pete-sampras',
    name: 'Pete Sampras',
    meta: 'United States · 1988–2002',
    blurb:
      'Defined fast-court tennis in the 1990s with the era’s most complete serve, and finished six straight years ranked first.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'andre-agassi',
    name: 'Andre Agassi',
    meta: 'United States · 1986–2006',
    blurb:
      'The first man to complete a Career Grand Slam on all three modern surfaces, and Sampras’s opposite in style and temperament.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'monica-seles',
    name: 'Monica Seles',
    meta: 'Yugoslavia and United States · 1989–2003',
    blurb:
      'Won eight majors before turning twenty, and her career was interrupted by an on-court attack in 1993 at the height of her dominance.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'venus-williams',
    name: 'Venus Williams',
    meta: 'United States · 1994–2024',
    blurb:
      'Five Wimbledon singles titles, and a driving force behind the majors adopting equal prize money.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'serena-williams',
    name: 'Serena Williams',
    meta: 'United States · 1995–2022',
    blurb:
      'Holds the Open Era record for women’s major singles titles, won across more than two decades and into her late thirties.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'roger-federer',
    name: 'Roger Federer',
    meta: 'Switzerland · 1998–2022',
    blurb:
      'Twenty majors and 237 consecutive weeks at world number one, a run nobody else has approached.',
    order: 140,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'rafael-nadal',
    name: 'Rafael Nadal',
    meta: 'Spain · 2001–2024',
    blurb:
      'Fourteen titles at Roland-Garros, the most extreme record of surface dominance in the sport’s history.',
    order: 150,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'novak-djokovic',
    name: 'Novak Djokovic',
    meta: 'Serbia · 2003–',
    blurb:
      'Holds the men’s records for major singles titles and for weeks at world number one, and has won each of the four majors at least three times.',
    order: 160,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'australian-open',
    name: 'Australian Open',
    meta: 'Melbourne · hard court · January',
    blurb:
      'The season’s first major, played in the southern-hemisphere summer, descended from the Australasian Championships of 1905.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'french-open',
    name: 'Roland-Garros',
    meta: 'Paris · clay · May and June',
    blurb:
      'The only major played on clay, and generally the most physically demanding of the four.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'wimbledon',
    name: 'Wimbledon',
    meta: 'London · grass · June and July',
    blurb:
      'The oldest tennis tournament in the world, first held in 1877, and the only major still played on grass.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'us-open-tennis',
    name: 'US Open',
    meta: 'New York · hard court · August and September',
    blurb:
      'The final major of the year, and in 1973 the first to pay equal prize money to women and men.',
    order: 40,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'atp-finals',
    name: 'ATP Finals',
    meta: 'Season-ending · eight players',
    blurb:
      'Closes the men’s season, contested in round-robin groups by the eight players who earned most over the year.',
    order: 50,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'wta-finals',
    name: 'WTA Finals',
    meta: 'Season-ending · eight players',
    blurb: 'The women’s season-ending championship, in the same format and for the same reason.',
    order: 60,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'davis-cup',
    name: 'Davis Cup',
    meta: 'Men’s national teams · since 1900',
    blurb:
      'The oldest international team competition in any sport, contested by more nations than any other annual event.',
    order: 70,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'billie-jean-king-cup',
    name: 'Billie Jean King Cup',
    meta: 'Women’s national teams · since 1963',
    blurb:
      'The women’s national-team championship, founded as the Federation Cup and renamed in 2020.',
    order: 80,
  },
];
