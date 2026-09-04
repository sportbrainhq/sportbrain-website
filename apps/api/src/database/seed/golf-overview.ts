/**
 * Golf overview content.
 *
 * The sixth sport through the machinery built for football, cricket,
 * basketball, tennis and Formula 1, and the third individual one. The seed
 * shapes are imported rather than redefined, and the page renders them with the
 * same sport-agnostic components. What follows is what golf makes awkward.
 *
 * ## There is no single governing hierarchy, and the schema wants one
 *
 * `GoverningBodySeed` models a world body with continental children, which is
 * how football and cricket are actually organised. Golf is not. Two bodies, the
 * R&A and the USGA, jointly write and interpret the Rules of Golf: the USGA in
 * the United States and Mexico, the R&A everywhere else. Neither is above the
 * other and neither has a continental tier beneath it in the sense the schema
 * means. Modelling one as world and the other as its child would assert a
 * subordination that does not exist.
 *
 * The tree is therefore seeded with the two rule-making bodies at `world`
 * level, and the national and regional associations that each recognises are
 * given at `continental` level beneath the one that actually recognises them.
 * The tours are deliberately not in this tree at all, for the same reason the
 * ATP and WTA are absent from the tennis one: a tour is a commercial circuit,
 * not a governing body, and the prose says so explicitly.
 *
 * ## Men's and women's majors are not the same structure
 *
 * The men's four have been stable since 1934 and are almost always listed as a
 * closed set. The women's are not: the LPGA has recognised between four and
 * five majors at different times, the Women's British Open only became one in
 * 2001, the Evian only in 2013, and the Ladies European Tour does not recognise
 * the same set the LPGA does. Writing "the women's four majors" by analogy with
 * the men's would state something false. The women's section names the current
 * LPGA set, says how recently it settled, and says that it has changed.
 *
 * ## What is deliberately absent
 *
 * **Current world rankings and current leading players.** The OWGR and Rolex
 * rankings move weekly and the Overview has no mechanism to refresh them. A
 * hardcoded top ten is wrong within a month. The `modern` section describes the
 * present generation in terms that stay true, and the Players tab is where a
 * reader goes for who is actually ranked where.
 *
 * **LIV Golf's status.** The men's professional game has been in dispute since
 * 2022, and its settlement has been announced, delayed and revised repeatedly.
 * The prose says the men's tour landscape is contested and unresolved, which is
 * durably true, rather than describing an arrangement that may not survive the
 * year.
 *
 * **Prize money and purse figures.** They change every season.
 *
 * **Handicap arithmetic, Strokes Gained, and the cut rule.** All three are
 * explainer material by the brief. The cut in particular has no universal form:
 * the number who advance and the ties rule differ between tours and between
 * events, so a single stated rule would be wrong somewhere.
 *
 * ## On sourcing
 *
 * Dates were checked rather than recalled, and several are commonly misquoted:
 *
 *   - **1457** is the date of the Scottish Act of Parliament banning golf
 *     because it distracted from archery practice. It is the earliest clear
 *     documentary reference, not the invention of the game, and the timeline
 *     says so.
 *   - The **Society of St Andrews Golfers** was formed in 1754 and became the
 *     Royal and Ancient Golf Club of St Andrews in 1834. The Honourable Company
 *     of Edinburgh Golfers is older still, dating from 1744, and is where the
 *     first known written rules come from. "Golf's rules began at St Andrews in
 *     1754" is the usual version and it is wrong on both counts.
 *   - The **first Open Championship** was at Prestwick in 1860, not St Andrews.
 *   - The **Masters** was first played in 1934, under the name the Augusta
 *     National Invitation Tournament; it took its current name in 1939.
 *   - The **LPGA** was founded in 1950, succeeding the Women's Professional
 *     Golf Association of 1944.
 *   - Golf was an Olympic sport in **1900 and 1904**, absent for over a
 *     century, and returned in **2016**. "Golf became an Olympic sport in 2016"
 *     omits that it is a return.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed } from './cricket-overview';
import type { FeaturedEntitySeed } from './basketball-overview';

export const GOLF_SOURCES: SourceSeed[] = [
  {
    key: 'wp-golf',
    provider: 'wikipedia',
    title: 'Golf',
    url: 'https://en.wikipedia.org/wiki/Golf',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of golf',
    url: 'https://en.wikipedia.org/wiki/History_of_golf',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rules',
    provider: 'wikipedia',
    title: 'Rules of golf',
    url: 'https://en.wikipedia.org/wiki/Rules_of_golf',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-randa',
    provider: 'wikipedia',
    title: 'The R&A',
    url: 'https://en.wikipedia.org/wiki/The_R%26A',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-usga',
    provider: 'wikipedia',
    title: 'United States Golf Association',
    url: 'https://en.wikipedia.org/wiki/United_States_Golf_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-pga-tour',
    provider: 'wikipedia',
    title: 'PGA Tour',
    url: 'https://en.wikipedia.org/wiki/PGA_Tour',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-dp-world-tour',
    provider: 'wikipedia',
    title: 'PGA European Tour',
    url: 'https://en.wikipedia.org/wiki/PGA_European_Tour',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-lpga',
    provider: 'wikipedia',
    title: 'LPGA',
    url: 'https://en.wikipedia.org/wiki/LPGA',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-let',
    provider: 'wikipedia',
    title: 'Ladies European Tour',
    url: 'https://en.wikipedia.org/wiki/Ladies_European_Tour',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-mens-majors',
    provider: 'wikipedia',
    title: "Men's major golf championships",
    url: 'https://en.wikipedia.org/wiki/Men%27s_major_golf_championships',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-womens-majors',
    provider: 'wikipedia',
    title: "Women's major golf championships",
    url: 'https://en.wikipedia.org/wiki/Women%27s_major_golf_championships',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-open',
    provider: 'wikipedia',
    title: 'The Open Championship',
    url: 'https://en.wikipedia.org/wiki/The_Open_Championship',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-masters',
    provider: 'wikipedia',
    title: 'Masters Tournament',
    url: 'https://en.wikipedia.org/wiki/Masters_Tournament',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-course',
    provider: 'wikipedia',
    title: 'Golf course',
    url: 'https://en.wikipedia.org/wiki/Golf_course',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-par',
    provider: 'wikipedia',
    title: 'Par (score)',
    url: 'https://en.wikipedia.org/wiki/Par_(score)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-stroke-play',
    provider: 'wikipedia',
    title: 'Stroke play',
    url: 'https://en.wikipedia.org/wiki/Stroke_play',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-match-play',
    provider: 'wikipedia',
    title: 'Match play',
    url: 'https://en.wikipedia.org/wiki/Match_play',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-handicap',
    provider: 'wikipedia',
    title: 'Handicap (golf)',
    url: 'https://en.wikipedia.org/wiki/Handicap_(golf)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-clubs',
    provider: 'wikipedia',
    title: 'Golf club (equipment)',
    url: 'https://en.wikipedia.org/wiki/Golf_club_(equipment)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-owgr',
    provider: 'wikipedia',
    title: 'Official World Golf Ranking',
    url: 'https://en.wikipedia.org/wiki/Official_World_Golf_Ranking',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-rolex-ranking',
    provider: 'wikipedia',
    title: "Women's World Golf Rankings",
    url: 'https://en.wikipedia.org/wiki/Women%27s_World_Golf_Rankings',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ryder-cup',
    provider: 'wikipedia',
    title: 'Ryder Cup',
    url: 'https://en.wikipedia.org/wiki/Ryder_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-solheim-cup',
    provider: 'wikipedia',
    title: 'Solheim Cup',
    url: 'https://en.wikipedia.org/wiki/Solheim_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-presidents-cup',
    provider: 'wikipedia',
    title: 'Presidents Cup',
    url: 'https://en.wikipedia.org/wiki/Presidents_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympic-golf',
    provider: 'wikipedia',
    title: 'Golf at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Golf_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-links',
    provider: 'wikipedia',
    title: 'Links (golf)',
    url: 'https://en.wikipedia.org/wiki/Links_(golf)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-glossary',
    provider: 'wikipedia',
    title: 'Glossary of golf',
    url: 'https://en.wikipedia.org/wiki/Glossary_of_golf',
    license: 'CC BY-SA 4.0',
  },
];

/**
 * Quick facts.
 *
 * Split into `identity` and `gameplay` and into nothing else, which is what
 * makes the Overview page render the hero strip and the at-a-glance grid as two
 * blocks rather than one. A fact filed under a third category would silently
 * collapse the layout back to a single grid, so any addition here belongs in
 * one of the two.
 */
export const GOLF_FACTS: FactSeed[] = [
  {
    key: 'governing-bodies',
    label: 'Governing bodies',
    value: 'The R&A and the USGA, jointly',
    category: 'identity',
    sourceKey: 'wp-rules',
    order: 10,
  },
  {
    key: 'origin',
    label: 'Modern form',
    value: 'Scotland, by the 15th century',
    category: 'identity',
    sourceKey: 'wp-history',
    order: 20,
  },
  {
    key: 'main-tours',
    label: 'Main professional tours',
    value: 'PGA Tour, DP World Tour, LPGA Tour, and regional tours worldwide',
    category: 'identity',
    sourceKey: 'wp-pga-tour',
    order: 30,
  },
  {
    key: 'mens-majors',
    label: "Men's majors",
    value: 'The Masters, PGA Championship, U.S. Open, The Open Championship',
    category: 'identity',
    sourceKey: 'wp-mens-majors',
    order: 40,
  },
  {
    key: 'womens-majors',
    label: "Women's majors",
    value: 'Five, recognised by the LPGA and revised more than once',
    category: 'identity',
    sourceKey: 'wp-womens-majors',
    order: 50,
  },
  {
    key: 'olympic',
    label: 'Olympic sport',
    value: 'Yes: 1900 and 1904, then again from 2016',
    category: 'identity',
    sourceKey: 'wp-olympic-golf',
    order: 60,
  },
  {
    key: 'players',
    label: 'Players',
    value: 'Individual, with team formats at a handful of events',
    category: 'gameplay',
    sourceKey: 'wp-golf',
    order: 110,
  },
  {
    key: 'course',
    label: 'Standard course',
    value: '18 holes',
    category: 'gameplay',
    sourceKey: 'wp-course',
    order: 120,
  },
  {
    key: 'objective',
    label: 'Objective',
    value: 'Complete every hole in as few strokes as possible',
    category: 'gameplay',
    sourceKey: 'wp-golf',
    order: 130,
  },
  {
    key: 'main-format',
    label: 'Main professional format',
    value: 'Stroke play, usually over four rounds',
    category: 'gameplay',
    sourceKey: 'wp-stroke-play',
    order: 140,
  },
  {
    key: 'alternative-format',
    label: 'Major alternative format',
    value: 'Match play, contested hole by hole',
    category: 'gameplay',
    sourceKey: 'wp-match-play',
    order: 150,
  },
  {
    key: 'surfaces',
    label: 'Main surfaces',
    value: 'Tee boxes, fairways, rough, bunkers, greens',
    category: 'gameplay',
    sourceKey: 'wp-course',
    order: 160,
  },
  {
    key: 'scoring',
    label: 'Scoring',
    value: 'Measured relative to par: under, level or over',
    category: 'gameplay',
    sourceKey: 'wp-par',
    order: 170,
  },
];

export const GOLF_TIMELINE: TimelineSeed[] = [
  {
    year: 1200,
    title: 'Stick-and-ball games across Europe',
    shortDescription:
      'Several European games involved striking a ball towards a target with a stick, among them the Dutch colf and the French jeu de mail. None is golf, and no direct line of descent to it has been established.',
    category: 'origins',
    certainty: 'disputed',
    sourceKey: 'wp-history',
    order: 10,
  },
  {
    year: 1457,
    title: 'Golf banned by the Scottish Parliament',
    shortDescription:
      'An Act of James II ordered that golf and football "be utterly cried down" because they were distracting men from archery practice. It is the earliest clear documentary reference to the game, which means golf was already well established by then.',
    category: 'origins',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-history',
    order: 20,
  },
  {
    year: 1744,
    title: 'The first written rules, at Leith',
    shortDescription:
      'The Honourable Company of Edinburgh Golfers drew up thirteen articles for a competition on Leith Links. They are the oldest surviving rules of golf, and predate the club at St Andrews.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-rules',
    order: 30,
  },
  {
    year: 1754,
    title: 'The Society of St Andrews Golfers is formed',
    shortDescription:
      'Founded at St Andrews and renamed the Royal and Ancient Golf Club in 1834. Its rules were gradually adopted elsewhere until it became the game’s effective authority, a role formally separated into The R&A in 2004.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-randa',
    order: 40,
  },
  {
    year: 1860,
    title: 'The first Open Championship',
    shortDescription:
      'Eight players competed over three rounds of Prestwick’s twelve-hole course. It is the oldest championship in golf, and was played at Prestwick rather than St Andrews for its first twelve editions.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-open',
    order: 50,
  },
  {
    year: 1894,
    title: 'The USGA is founded',
    shortDescription:
      'Formed by five American clubs to settle who held the national amateur title. It became the rule-making authority for the United States and Mexico, a role it still shares with The R&A.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-usga',
    order: 60,
  },
  {
    year: 1916,
    title: 'The PGA of America is founded',
    shortDescription:
      'An association of club and touring professionals, which staged the first PGA Championship in the same year. Its tournament arm later separated to become the PGA Tour.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-pga-tour',
    order: 70,
  },
  {
    year: 1934,
    title: 'The first Masters at Augusta National',
    shortDescription:
      'Founded by Bobby Jones and Clifford Roberts as the Augusta National Invitation Tournament; it took the name Masters in 1939. It is the only major played on the same course every year.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-masters',
    order: 80,
  },
  {
    year: 1950,
    title: 'The LPGA is founded',
    shortDescription:
      'Thirteen players established the LPGA, succeeding the Women’s Professional Golf Association of 1944. It is the longest-running women’s professional sports organisation in the United States.',
    category: 'governance',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-lpga',
    order: 90,
  },
  {
    year: 1968,
    title: 'The PGA Tour separates from the PGA of America',
    shortDescription:
      'Tournament players broke away over control of prize money and television income, forming the body that became the PGA Tour. Club professionals and touring professionals have been separately organised ever since.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-pga-tour',
    order: 100,
  },
  {
    year: 1972,
    endYear: 1975,
    title: 'The European Tour is established',
    shortDescription:
      'A continental circuit formed from the existing British tournament calendar, giving European professionals a season of their own rather than a choice between local events and America. It is now the DP World Tour.',
    category: 'governance',
    certainty: 'approximate',
    sourceKey: 'wp-dp-world-tour',
    order: 110,
  },
  {
    year: 1979,
    title: 'The Ryder Cup becomes Europe against the United States',
    shortDescription:
      'Great Britain and Ireland had lost all but three matches since 1927, so the team was widened to all of Europe. The change turned a one-sided fixture into golf’s most-watched event.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-ryder-cup',
    order: 120,
  },
  {
    year: 1986,
    title: 'The Official World Golf Ranking begins',
    shortDescription:
      'A points system spanning the world’s tours, created so that players who never met on the same circuit could still be compared. It now governs entry to several of the biggest events.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-owgr',
    order: 130,
  },
  {
    year: 1997,
    endYear: 2008,
    title: 'The Tiger Woods era',
    shortDescription:
      'A twelve-stroke win at the 1997 Masters opened a run of dominance that changed golf’s audience, its prize money, its television deals and the athleticism expected of its players.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-golf',
    order: 140,
  },
  {
    year: 2016,
    title: 'Golf returns to the Olympic Games',
    shortDescription:
      'Golf was contested in 1900 and 1904 and then dropped for 112 years. Its return in Rio added a national-representation event to a calendar otherwise built around individual tour titles.',
    category: 'competition',
    isMajorMilestone: true,
    certainty: 'established',
    sourceKey: 'wp-olympic-golf',
    order: 150,
  },
  {
    year: 2019,
    title: 'The Rules of Golf are rewritten',
    shortDescription:
      'The R&A and the USGA jointly issued the largest modernisation of the rules in generations, rewriting relief procedures, penalty areas and the language itself in plainer terms.',
    category: 'governance',
    certainty: 'established',
    sourceKey: 'wp-rules',
    order: 160,
  },
  {
    year: 2022,
    title: 'The men’s professional game divides',
    shortDescription:
      'A rival circuit drew players away from the established tours, producing litigation, suspensions and a dispute over ranking eligibility. The arrangement between the parties has been announced and revised more than once and is not settled.',
    category: 'era',
    isMajorMilestone: true,
    certainty: 'approximate',
    sourceKey: 'wp-golf',
    order: 170,
  },
];

/**
 * Governance.
 *
 * The R&A and the USGA both sit at `world` level, because they are genuinely
 * peers: they write the Rules of Golf jointly, and each administers them in its
 * own territory rather than one deferring to the other. Rows at `continental`
 * level are the confederations and national associations each recognises, which
 * is what the level actually means here.
 *
 * The PGA Tour, the DP World Tour and the LPGA Tour are absent by design. They
 * are commercial circuits that stage tournaments, not bodies that govern the
 * sport, and putting them in this tree would tell a reader that the PGA Tour
 * answers to the USGA. It does not.
 */
export const GOLF_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'randa',
    shortName: 'The R&A',
    name: 'The R&A',
    level: 'world',
    foundedYear: 2004,
    headquarters: 'St Andrews, Scotland',
    websiteUrl: 'https://www.randa.org',
    externalId: 'Q1138524',
    order: 10,
  },
  {
    slug: 'usga',
    shortName: 'USGA',
    name: 'United States Golf Association',
    level: 'world',
    foundedYear: 1894,
    headquarters: 'Liberty Corner, New Jersey, United States',
    websiteUrl: 'https://www.usga.org',
    externalId: 'Q1341845',
    order: 20,
  },
  {
    slug: 'igf',
    shortName: 'IGF',
    name: 'International Golf Federation',
    level: 'continental',
    parentSlug: 'randa',
    region: 'Worldwide, for Olympic purposes',
    foundedYear: 1958,
    headquarters: 'Lausanne, Switzerland',
    order: 30,
  },
  {
    slug: 'ega',
    shortName: 'EGA',
    name: 'European Golf Association',
    level: 'continental',
    parentSlug: 'randa',
    region: 'Europe',
    foundedYear: 1937,
    headquarters: 'Lausanne, Switzerland',
    order: 40,
  },
  {
    slug: 'apga-confederation',
    shortName: 'APGC',
    name: 'Asia-Pacific Golf Confederation',
    level: 'continental',
    parentSlug: 'randa',
    region: 'Asia and the Pacific',
    foundedYear: 1963,
    order: 50,
  },
  {
    slug: 'golf-australia',
    shortName: 'Golf Australia',
    name: 'Golf Australia',
    level: 'continental',
    parentSlug: 'randa',
    region: 'Australia',
    foundedYear: 2006,
    order: 60,
  },
  {
    slug: 'england-golf',
    shortName: 'England Golf',
    name: 'England Golf',
    level: 'continental',
    parentSlug: 'randa',
    region: 'England',
    foundedYear: 2012,
    order: 70,
  },
  {
    slug: 'pga-of-america',
    shortName: 'PGA of America',
    name: 'Professional Golfers’ Association of America',
    level: 'continental',
    parentSlug: 'usga',
    region: 'United States, club and teaching professionals',
    foundedYear: 1916,
    order: 80,
  },
  {
    slug: 'fmg',
    shortName: 'FMG',
    name: 'Federación Mexicana de Golf',
    level: 'continental',
    parentSlug: 'usga',
    region: 'Mexico',
    foundedYear: 1954,
    order: 90,
  },
];

/**
 * Formats.
 *
 * `FormatSeed` was designed for cricket, where a format is defined by innings,
 * overs and days, none of which golf has. The numeric fields are therefore
 * unset and the taxonomy carries what actually distinguishes a golf format:
 * whether a score is a total or a running tally of holes, and whether one
 * person or a side is playing the ball.
 *
 * `matchClass` is the grouping label the component renders. Two top-level
 * branches, individual and team, because a professional plays both in the same
 * season and the Ryder Cup is not a curiosity at the edge of the sport.
 */
export const GOLF_FORMATS: FormatSeed[] = [
  {
    key: 'individual',
    label: 'Individual play',
    matchClass: 'grouping',
    description:
      'One player, one ball, one score. Almost all professional golf, and the basis of every ranking and money list.',
    sourceKey: 'wp-golf',
    order: 10,
  },
  {
    key: 'stroke-play',
    label: 'Stroke play',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'Every stroke over the whole tournament is counted, and the lowest total wins. The format of the majors and of nearly every tour event.',
    sourceKey: 'wp-stroke-play',
    order: 20,
  },
  {
    key: 'match-play',
    label: 'Match play',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'Scored hole by hole rather than in total: a hole is won, lost or halved, and the match ends once it cannot be caught. A disastrous hole costs one hole, not the tournament.',
    sourceKey: 'wp-match-play',
    order: 30,
  },
  {
    key: 'stableford',
    label: 'Stableford',
    parentKey: 'individual',
    matchClass: 'individual',
    isInternational: false,
    description:
      'Points are awarded per hole against a target score, so the highest total wins and a ruined hole simply scores nothing. Common in club golf and used at a small number of professional events.',
    sourceKey: 'wp-golf',
    order: 40,
  },
  {
    key: 'team',
    label: 'Team play',
    matchClass: 'grouping',
    description:
      'Golf played for a side rather than a ranking. Used at the Ryder, Solheim and Presidents Cups, in amateur internationals, and throughout club golf.',
    sourceKey: 'wp-ryder-cup',
    order: 50,
  },
  {
    key: 'foursomes',
    label: 'Foursomes',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'Two players a side share one ball and alternate shots. The most exposed of the team formats, because a partner has to play from wherever the ball was left.',
    sourceKey: 'wp-ryder-cup',
    order: 60,
  },
  {
    key: 'four-ball',
    label: 'Four-ball',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'Two players a side each play their own ball, and the better score of the pair counts on each hole. Higher scoring and more aggressive than foursomes.',
    sourceKey: 'wp-ryder-cup',
    order: 70,
  },
  {
    key: 'scramble',
    label: 'Scramble',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: false,
    description:
      'Everyone tees off, the side picks the best ball, and all play again from there. Rare in professional golf and ubiquitous in charity and corporate events.',
    sourceKey: 'wp-golf',
    order: 80,
  },
  {
    key: 'team-match-play',
    label: 'Team match play',
    parentKey: 'team',
    matchClass: 'team',
    isInternational: true,
    description:
      'Singles, foursomes and four-ball matches played across two or three days, each worth a point to the side that wins it. The format of the Ryder and Solheim Cups.',
    sourceKey: 'wp-solheim-cup',
    order: 90,
  },
];

/**
 * The basic vocabulary.
 *
 * One sentence each. These are the words a broadcast uses without explaining
 * them, and the section exists so that a newcomer can follow the next ten
 * minutes. Anything needing a paragraph, how a handicap is actually calculated,
 * what Strokes Gained measures, when relief is available, is an explainer.
 *
 * `explainerSlug` is set optimistically. The API checks each slug against the
 * explainer table and drops the link where no such row exists, so a concept
 * whose explainer has not been written yet renders as an unlinked card rather
 * than a broken link.
 */
export const GOLF_CONCEPTS: ConceptSeed[] = [
  {
    key: 'par',
    term: 'Par',
    summary:
      'The number of strokes an expert golfer is expected to need on a hole, and the number every score is quoted against.',
    category: 'scoring',
    explainerSlug: 'par-and-scoring',
    sourceKey: 'wp-par',
    order: 10,
  },
  {
    key: 'birdie',
    term: 'Birdie',
    summary: 'A hole completed in one stroke under par.',
    category: 'scoring',
    sourceKey: 'wp-par',
    order: 20,
  },
  {
    key: 'eagle',
    term: 'Eagle',
    summary: 'A hole completed in two strokes under par.',
    category: 'scoring',
    sourceKey: 'wp-par',
    order: 30,
  },
  {
    key: 'bogey',
    term: 'Bogey',
    summary: 'A hole completed in one stroke over par. Two over is a double bogey.',
    category: 'scoring',
    sourceKey: 'wp-par',
    order: 40,
  },
  {
    key: 'ace',
    term: 'Ace',
    summary: 'A hole-in-one: the ball driven from the tee into the hole with a single stroke.',
    category: 'scoring',
    sourceKey: 'wp-glossary',
    order: 50,
  },
  {
    key: 'albatross',
    term: 'Albatross',
    summary:
      'Three strokes under par on a hole, and rarer in professional golf than a hole-in-one. Also called a double eagle.',
    category: 'scoring',
    sourceKey: 'wp-glossary',
    order: 60,
  },
  {
    key: 'tee',
    term: 'Tee',
    summary:
      'Both the area a hole is started from and the peg the ball is placed on for that first stroke.',
    category: 'course',
    ambiguityNote:
      'Tee box and tee peg are different things and the same word is used for both, including in commentary.',
    sourceKey: 'wp-course',
    order: 70,
  },
  {
    key: 'fairway',
    term: 'Fairway',
    summary: 'The closely mown corridor between the tee and the green, and the intended route.',
    category: 'course',
    sourceKey: 'wp-course',
    order: 80,
  },
  {
    key: 'rough',
    term: 'Rough',
    summary:
      'The longer grass flanking the fairway, where the ball sits down and becomes harder to control.',
    category: 'course',
    sourceKey: 'wp-course',
    order: 90,
  },
  {
    key: 'bunker',
    term: 'Bunker',
    summary: 'A hollow filled with sand, played from with its own technique and its own rules.',
    category: 'course',
    sourceKey: 'wp-course',
    order: 100,
  },
  {
    key: 'green',
    term: 'Green',
    summary: 'The closely cut putting surface containing the hole.',
    category: 'course',
    sourceKey: 'wp-course',
    order: 110,
  },
  {
    key: 'links',
    term: 'Links',
    summary:
      'A course on coastal sandy ground, firm and treeless and exposed to wind. The original form of the game.',
    category: 'course',
    explainerSlug: 'course-types',
    sourceKey: 'wp-links',
    order: 120,
  },
  {
    key: 'driver',
    term: 'Driver',
    summary: 'The longest club in the bag, used almost entirely for distance from the tee.',
    category: 'equipment',
    sourceKey: 'wp-clubs',
    order: 130,
  },
  {
    key: 'iron',
    term: 'Iron',
    summary:
      'A numbered club for approach shots, with lower numbers hitting further and lower than higher ones.',
    category: 'equipment',
    sourceKey: 'wp-clubs',
    order: 140,
  },
  {
    key: 'wedge',
    term: 'Wedge',
    summary:
      'A high-lofted iron for short shots that need to rise steeply and stop quickly near the hole.',
    category: 'equipment',
    sourceKey: 'wp-clubs',
    order: 150,
  },
  {
    key: 'putter',
    term: 'Putter',
    summary:
      'The club used to roll the ball along the green, and the one that plays roughly two of every five strokes in a round.',
    category: 'equipment',
    sourceKey: 'wp-clubs',
    order: 160,
  },
  {
    key: 'caddie',
    term: 'Caddie',
    summary:
      'The person who carries the bag and advises on club choice, yardage and the line of a putt.',
    category: 'play',
    sourceKey: 'wp-glossary',
    order: 170,
  },
  {
    key: 'cut',
    term: 'Cut',
    summary:
      'The point partway through a tournament at which the field is reduced and the rest go home.',
    category: 'competition',
    explainerSlug: 'how-golf-tournaments-work',
    sourceKey: 'wp-golf',
    order: 180,
  },
  {
    key: 'handicap',
    term: 'Handicap',
    summary:
      'A number describing a player’s demonstrated ability, used so that golfers of different standards can compete on level terms.',
    category: 'competition',
    explainerSlug: 'how-golf-handicaps-work',
    sourceKey: 'wp-handicap',
    order: 190,
  },
];

export const GOLF_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is golf?',
    order: 10,
    body: `Golf is a precision sport in which players use a set of clubs to strike a ball into a series of holes, using as few strokes as they can. A standard course has eighteen holes. A player begins each one from a teeing area, advances the ball across open ground towards a prepared putting surface, and finishes it by rolling the ball into a hole cut into that surface. The strokes are counted. The player who needs fewest of them wins.

Three things make golf unlike most sports. There is no opponent interfering with the ball: nobody tackles, blocks or returns anything, and a bad shot is nobody's doing but the player's. There is no standard pitch either, so a golfer plays a different arena every week, with different lengths, different ground and different weather, and a score that would win one tournament would miss the cut at another. And the ball is stationary before every stroke, which sounds like a simplification and is the opposite: with unlimited time to prepare and nothing to react to, the difficulty is entirely in execution and in judgement.

Golf is played by professionals for money on tours, by amateurs in club competitions, and by tens of millions of people who never enter a competition at all. The handicap system is what connects those worlds: it is the mechanism that lets a beginner and a scratch golfer have a meaningful game against each other, and it has no real equivalent in any other major sport.`,
  },
  {
    kind: 'glance',
    heading: 'Golf at a glance',
    order: 20,
    body: `Golf is individual. A professional has no club side, no manager and no team-mate, and travels a calendar of tournaments earning results in their own name. The team competitions that do exist, chiefly the Ryder, Solheim and Presidents Cups, are a handful of weeks in a season otherwise spent alone.

A tournament is usually four rounds of eighteen holes over four days, and the score that matters is the total across all of them. That is why golf is watched differently from most sports: nothing is decided until the last few holes on the final day, and a player can lead for three days and lose in an hour.

Scores are quoted relative to par rather than as raw totals. A player at eight under par has taken eight strokes fewer than the course expects across the holes they have played, and that convention is what makes a leaderboard readable at a glance.`,
  },
  {
    kind: 'history',
    heading: 'How golf developed',
    order: 30,
    body: `Games in which a ball is struck towards a target with a stick are old and widespread. The Dutch played **colf**, the French **jeu de mail**, and versions existed across medieval Europe. None of them is golf, and the attempts to trace a direct line from any of them to the modern game do not survive scrutiny. What distinguishes golf is the hole: the target is a hole in the ground, and the ball must finish in it.

That game is Scottish. The earliest firm reference is an Act of the Scottish Parliament in **1457** ordering that golf be "utterly cried down" because men were playing it instead of practising archery, which tells us the game was widespread enough to be a problem well before anybody wrote it down approvingly. It was played on **links**: the sandy, treeless coastal ground between farmland and the sea, useless for agriculture, kept short by wind, rabbits and sheep. Golf's characteristic features, firm ground, deep bunkers, wind, and undulating fairways nobody designed, are all accidents of that terrain.

Organised golf begins in the eighteenth century. The **Honourable Company of Edinburgh Golfers** wrote thirteen articles for a competition at Leith in **1744**, the oldest surviving rules of the game. The **Society of St Andrews Golfers** followed in **1754**, was renamed the Royal and Ancient Golf Club in 1834, and gradually became the authority whose code others adopted. The common claim that the rules of golf began at St Andrews compresses both facts into one that is wrong.

Competition and equipment then transformed the game within a century. The first **Open Championship** was played at Prestwick in **1860**. The gutta-percha ball, and later the wound rubber-cored ball, made golf cheaper and drove it out of Scotland and across the British Empire and the United States, where the **USGA** was founded in **1894**. The twentieth century brought professional tours, television, and a sport played and watched worldwide, but the shape of a round, eighteen holes and a card, was settled at St Andrews before any of it.`,
  },
  {
    kind: 'scotland',
    heading: 'Why Scotland matters',
    order: 40,
    body: `Almost every convention golf still uses comes from one stretch of Scottish coast.

**The eighteen-hole round** is a St Andrews decision. The Old Course had twenty-two holes, played out and back over eleven, until the club shortened it to eighteen in 1764 by combining several short ones. Nothing about the number is natural or optimal. It became standard because St Andrews used it and the rest of golf copied St Andrews.

**The terrain** set the game's character. Links land is firm, so the ball runs; it is treeless, so the wind is the defence; the bunkers began as hollows where sheep sheltered. A golfer playing an Open on a links course is playing something close to the original problem, which is why those courses reward a low, controlled ball flight that is of little use anywhere else.

**The rules** were written by Scottish clubs for their own competitions and spread outward from there, and The R&A remains one of the game's two rule-making bodies. When the game was exported, in the nineteenth century, it went out with Scottish professionals and greenkeepers, who built the first courses in England, the United States and across the Empire, and built them in the image of what they knew.`,
  },
  {
    kind: 'basics',
    heading: 'How a hole is played',
    order: 50,
    body: `Each hole is a small self-contained problem, and the sequence is nearly always the same.

The player starts from the **teeing area**, the only place on the course where the ball may be placed on a peg, and where distance usually matters most. On a long hole the tee shot is played with a driver towards the **fairway**, the mown corridor that offers the cleanest lie for the next shot. Miss it and the ball is in the **rough**, in a bunker or worse, and the next shot is harder rather than merely longer.

From there the player hits an **approach shot** aimed at the **green**. On a par 3 the approach is the tee shot itself. On a par 5 there may be two shots before the green is reachable. Approach play is where most tournaments are decided, because a shot that finishes ten feet from the hole and one that finishes forty feet away are the difference between a birdie and a par.

Around the green comes the **short game**: chips, pitches and bunker shots, played to get the ball onto the putting surface and near enough to the hole to hole out. Then **putting**, rolling the ball along the green until it drops. Putts account for roughly two strokes in five for a professional, which is why a player who is striking the ball beautifully can still score badly.

Every stroke counts the same. A 300-yard drive and a two-foot putt are one stroke each, and that equivalence is the whole of golf's scoring. The strokes are added to make a hole score, the hole scores make a round, the rounds make a tournament total, and the totals make the leaderboard.

Penalty strokes, relief, when a ball is out of bounds and what happens when it finishes in a penalty area are all real and all deferred: they are covered in the explainers rather than here.`,
  },
  {
    kind: 'course',
    heading: 'The golf course',
    order: 60,
    body: `A course is a sequence of eighteen holes, each with its own length, shape and defences, laid out across whatever ground the architect was given. There is no standard size, no standard length and no symmetry requirement, which is why a golf course is described rather than diagrammed.

Every hole is built from the same handful of surfaces. The **teeing area** is where the hole begins, usually with several sets of markers so the same hole can be played at different lengths. The **fairway** is the closely mown route towards the green, and the **rough** is the longer grass flanking it, cut at varying heights so that missing the fairway by two yards is punished less than missing it by twenty. **Bunkers** are sand-filled hollows placed exactly where a good miss would otherwise finish. **Penalty areas** cover water and other ground where the ball is likely to be lost and where a specific set of relief options applies. The **green** is the shaved putting surface, and the **hole** cut into it, 4.25 inches across, is the target.

Holes are classified by par: **par 3** holes are reachable from the tee, **par 4** holes take a drive and an approach, and **par 5** holes take three shots for most players and two for the longest hitters. A typical eighteen-hole course mixes them to a total par of around 70 to 72, and the mix is a design decision rather than a rule.`,
  },
  {
    kind: 'scoring',
    heading: 'Par and the language of scoring',
    order: 70,
    body: `**Par** is the number of strokes an expert player is expected to need on a hole, allowing two putts once on the green. It is set by length, adjusted for difficulty, and it is the reference every golf score is quoted against.

A score on a single hole has a name for each of the common outcomes. Two under par is an **eagle**, one under is a **birdie**, level is a **par**, one over is a **bogey**, and two over a **double bogey**. Three under, an **albatross**, is rare enough that a professional may go a career without one, and a hole-in-one on a par 3 is an **ace**.

Across a round and a tournament, those hole scores are summed and quoted as a figure relative to the course's total par. Twelve under par means twelve strokes fewer than par for the holes played so far. Even par is shown as **E**, and a score above par carries a plus sign. Because the totals are cumulative, a leaderboard changes as players complete different numbers of holes, which is why a player at the top may have finished while the player two shots behind still has six holes to play.

That is the whole of the scoring convention. Stroke play, match play, Stableford and the rest are formats built on top of it, and they are covered in the explainers.`,
  },
  {
    kind: 'formats',
    heading: 'The formats golf is played in',
    order: 80,
    body: `Two formats account for nearly all competitive golf, and they produce genuinely different sports.

**Stroke play** counts every stroke of the tournament and gives the title to the lowest total. It is the format of all four men's majors, every women's major and almost every tour event. Its defining feature is that nothing is ever written off: a triple bogey at the second hole on Thursday counts exactly as much as one at the last on Sunday, so stroke play rewards the avoidance of disaster as much as brilliance.

**Match play** scores hole by hole. Each hole is won, lost or halved, the running score is expressed as holes up or down, and the match ends as soon as one player leads by more holes than remain. A hole lost to a nine costs precisely one hole, which makes match play far more aggressive: a player behind has every reason to attempt a shot they would never risk in stroke play.

**Team formats** appear mostly in the Ryder, Solheim and Presidents Cups and throughout club golf. In **foursomes** two partners share one ball and alternate strokes. In **four-ball** each plays their own and the better score counts. **Scramble** formats, where a side plays every shot from the best of its balls, are common in amateur and charity events and almost unknown in professional competition.

How each is scored in detail, and where the tactical differences bite, is explainer material.`,
  },
  {
    kind: 'structure',
    heading: 'How golf is organised',
    order: 90,
    body: `Golf has no single worldwide league and no single governing authority, and that is the fact most often got wrong about it.

**The rules** are written jointly by **The R&A** and the **USGA**. The USGA administers them in the United States and Mexico; The R&A does so everywhere else, through the national associations it recognises. The two bodies revise the rules together, publish the same code, and jointly maintain the equipment standards and the World Handicap System. Neither is superior to the other.

**The professional game** is run by tours, which are commercial circuits rather than governing bodies. The PGA Tour, the DP World Tour, the LPGA Tour, the Ladies European Tour, the Japan Golf Tour, the Asian Tour, the Sunshine Tour and others each own their calendar, their eligibility rules and their money list. They are not branches of the R&A or the USGA and they are not tiers of one another. They overlap, co-sanction events, and compete for players.

**The majors** sit above all of it, and none of them is a tour event. The Masters belongs to Augusta National, the PGA Championship to the PGA of America, the U.S. Open to the USGA and The Open to The R&A. Each sets its own field and its own conditions. The women's majors are similarly run by separate organisations rather than by the LPGA alone.

The practical consequence is that golf's structure is a negotiated arrangement between rule-makers, tours and championship organisers, which is why disputes in the men's professional game have proved so hard to resolve: no single body has the standing to settle them.`,
  },
  {
    kind: 'tours',
    heading: 'The professional tours',
    order: 100,
    body: `A tour is a season of tournaments with its own membership, its own eligibility criteria and its own money list. Players earn status on a tour, keep or lose it by results, and use it to enter that tour's events. It is a closer analogy to a league membership than to a league table.

**The PGA Tour** is the leading men's circuit, based in the United States and played mostly there, with the deepest fields and the largest purses. Its season ends in a play-off series among the year's leading players.

**The DP World Tour**, formerly the European Tour, is the leading circuit outside the United States, playing across Europe, the Middle East, Africa and Asia. It has a formal arrangement with the PGA Tour under which leading players move between them.

**The LPGA Tour** is the leading women's circuit, played mainly in the United States and Asia, and it stages the women's majors. **The Ladies European Tour** is its European counterpart, and the two co-sanction a growing number of events.

**Regional and developmental tours** carry most of the world's professional golf: the Japan Golf Tour and the JLPGA, the Asian Tour, the Korn Ferry Tour, the Challenge Tour, the Sunshine Tour, the PGA Tour of Australasia and others. They are how careers begin, and how players in most of the world earn their way towards the larger circuits.

These tours are not equivalent to one another in prize money, field strength or ranking points, and it would be misleading to present them as parallel leagues. The men's tour landscape has also been in dispute since 2022, with a rival circuit, litigation and unresolved questions about ranking eligibility, and no description of the current settlement would remain accurate for long.`,
  },
  {
    kind: 'majors',
    heading: "The men's major championships",
    order: 110,
    body: `Four tournaments define a man's career in golf. In calendar order:

**The Masters**, played at Augusta National in Georgia every April. It is the only major held at the same course each year, the youngest of the four, first played in 1934, and it is run by the club itself rather than by a tour or a national body. Winners receive the green jacket and a lifetime invitation.

**The PGA Championship**, run by the PGA of America and played in May at a rotating set of American courses. It reliably assembles the strongest field of the four, because its eligibility criteria are the least restrictive.

**The U.S. Open**, run by the USGA in June, at a rotating list of courses set up to be as demanding as golf gets: narrow fairways, deep rough and fast greens. Winning scores are routinely close to par, and occasionally over it.

**The Open Championship**, run by The R&A in July, on a rota of links courses in Britain and Ireland. It is the oldest championship in golf, first played in 1860, and the only major played on links, where wind and firm ground can make the same course play thirty strokes differently from one day to the next.

Winning all four in a career is the **career Grand Slam**, achieved by five men. Winning all four in one calendar year has never been done in the modern era.`,
  },
  {
    kind: 'major-prestige',
    heading: 'What makes a major special',
    order: 120,
    body: `Nothing in the rules distinguishes a major from any other 72-hole stroke-play tournament. The difference is entirely in what the sport has agreed they mean, and that agreement is old enough to be self-sustaining.

**History.** Three of the men's four have been played for over a century, and their winners' lists are a continuous record of the sport back to its beginnings.

**The field.** Eligibility is built around the world's leading players, so a major is one of the few weeks when nearly everyone who might win is present.

**Career weight.** Players are measured by majors above everything else. A career with twenty ordinary tour wins and no major is regarded quite differently from one with three wins and two majors, and the arithmetic is not defensible on any neutral basis. It is simply how the sport keeps score.

**Setup.** Courses are prepared to be harder than usual, so majors test parts of the game an ordinary week does not.

**Attention.** They draw audiences several times larger than a regular event, which raises the pressure and, in turn, the reputational value of winning.`,
  },
  {
    kind: 'womens-majors',
    heading: "The women's major championships",
    order: 130,
    body: `Women's golf has majors, but not the same structure as the men's, and the difference matters.

The set is **five**, not four, as currently recognised by the LPGA: the **Chevron Championship**, the **U.S. Women's Open**, the **KPMG Women's PGA Championship**, the **Amundi Evian Championship** and the **AIG Women's Open**. They are run by different organisations: the USGA runs the U.S. Women's Open, The R&A the AIG Women's Open, the PGA of America the Women's PGA.

The set has also changed repeatedly, and recently. The Women's British Open became a major in **2001**, replacing the du Maurier Classic. The Evian became the fifth in **2013**. Earlier decades recognised different championships entirely, including the Titleholders and the Western Open, and the Chevron Championship has changed name and sponsor several times while remaining the same event. Comparing major counts across eras in women's golf therefore requires knowing which championships counted when, in a way the men's record does not.

The **Ladies European Tour** does not recognise an identical set, so a European player's majors may be described differently depending on the source. Where this site gives a number of majors, it follows the LPGA's current definition.`,
  },
  {
    kind: 'stages',
    heading: 'How a tournament is run',
    order: 140,
    body: `A professional stroke-play tournament is typically four rounds over four days, Thursday to Sunday, with the whole field playing the first two rounds and a reduced field playing the last two.

The field is set by tour status, world ranking, past champions' exemptions, sponsor invitations and qualifying, in a mixture that differs from event to event. Players go out in groups of two or three, half from the first tee and half from the tenth, and the pairings for the weekend are reordered so that the leaders play last.

After two rounds the field is **cut**. Those at or better than the cut line play the weekend; the rest leave, and at most events earn nothing. The final round pairs the leaders together in the last group, which is why golf's closing hour is usually played by the people who can win.

Not every tournament follows this. Some are played over three rounds, some over 72 holes without a cut, some in match play, and the team events have their own structure entirely. A tie for the lead after the final round is settled by a play-off, and even the play-off format differs: sudden death at some events, a set number of holes at others.`,
  },
  {
    kind: 'cut',
    heading: 'The cut',
    order: 150,
    body: `The cut is the mechanism that reduces the field partway through a tournament. Its purpose is practical: a full field cannot be got round a course in the daylight available once rounds slow down, and the weekend's television coverage is built around a smaller number of contenders.

At most 72-hole events the cut falls after two rounds. Players whose 36-hole total is at or better than the cut line continue into the third and fourth rounds. Everyone else is out, and at most events those players receive no prize money at all, which makes making the cut the basic economic unit of a touring professional's season.

The specific rule varies and there is no universal version. Different tours cut to different numbers of players, some apply a rule that also admits anyone within a set number of strokes of the lead, some events have no cut, and the treatment of ties at the cut line differs. Any single stated rule would be wrong somewhere, so this page gives the shape rather than the number.`,
  },
  {
    kind: 'leaderboard',
    heading: 'Reading a leaderboard',
    order: 160,
    body: `A golf leaderboard shows each player's score relative to par, not their stroke total, and sorts from lowest to highest. A negative number is under par and better; **E** is level par; a positive number is over par.

A typical board reads: leader at **-12**, second at **-10**, third at **-8**, a player at **E** and another at **+2**. The player at -12 has taken twelve fewer strokes than the course's par for the holes they have played.

Two details make it harder to read than it looks. Players do not all start at the same time, so at any moment the field has completed different numbers of holes, and the board usually shows a "thru" column giving how many. And a player's position can change without them hitting a shot, because the players behind are still playing. That is why the final hour of a tournament is watched on the leaderboard as much as on the course.`,
  },
  {
    kind: 'equipment',
    heading: 'The clubs',
    order: 170,
    body: `A player may carry no more than fourteen clubs, and the set is chosen so that each covers a band of distance and trajectory the others do not.

**The driver** is the longest club with the least loft, used from the tee on long holes for maximum distance. **Fairway woods** are shorter and more lofted, playable from the ground as well as the tee, for long shots that still need to get airborne. **Hybrids** replaced the hardest-to-hit long irons for most players, combining a wood's head shape with an iron's length.

**Irons** are the general-purpose clubs, numbered roughly 4 through 9, each shorter and more lofted than the last, and used for approach shots where control matters more than raw distance. **Wedges** are the most lofted irons, for short approaches and shots around the green that need to climb steeply and stop quickly. **The putter** is used on the green and is the club that plays the most strokes in a typical round.

Loft, lie angle, shaft flex, bounce, spin rates and how any of it is fitted to a player are genuinely important and genuinely technical, and they are covered in the explainers rather than here.`,
  },
  {
    kind: 'shots',
    heading: 'The shots',
    order: 180,
    body: `Golf's shots are named by what they are for rather than by how they are played.

The **tee shot** starts a hole, and on all but the shortest holes it is about distance and finding the fairway. The **approach shot** is played towards the green, and is where scoring is decided: getting the ball close leaves a makeable putt, and missing the green leaves a scramble to save par.

Near the green, a **chip** is a low, running shot that spends most of its journey on the ground, and a **pitch** is a higher, softer shot that carries further and stops sooner. A **bunker shot** is played from sand, usually by striking the sand behind the ball rather than the ball itself. On the green, a **putt** rolls the ball along the surface.

Shot shaping, a draw or a fade, trajectory control, spin, and the decision-making that goes into choosing between them are explainer topics.`,
  },
  {
    kind: 'handicap',
    heading: 'The handicap system',
    order: 190,
    body: `A handicap is a number that describes how well a player has demonstrated they can play, and it exists so that golfers of different standards can compete against each other on equal terms. It has no real equivalent in other major sports: two players separated by fifty strokes of ability can have a genuinely close match, and the handicap is why.

The mechanism, in outline: a player submits scores from rounds they have played, each score is adjusted for how difficult the course and the tees were, the best of the recent scores are averaged, and the result is a **Handicap Index** that travels with the player. At any given course that index is converted into the number of strokes that player receives there.

The **World Handicap System**, introduced in 2020 and maintained jointly by The R&A and the USGA, unified six previously incompatible national systems, which is why older writing about handicaps often describes arithmetic that no longer applies.

The full calculation, how many scores count, how course and slope rating work, the caps and the adjustments, is deliberately not on this page. It is an explainer.`,
  },
  {
    kind: 'courses',
    heading: 'Types of course',
    order: 200,
    body: `Courses are usually described by the landscape they were built in, and the type predicts how the game is played there.

**Links** courses sit on coastal sandy ground: firm turf, few or no trees, deep revetted bunkers and constant wind. The ball runs a long way and can be played along the ground, and control of trajectory matters more than height. The Open is played on links.

**Parkland** courses are inland and tree-lined, on softer ground, with greens that hold a well-struck approach. Most American tour venues, including Augusta National, are parkland. The game there is aerial: fly the ball to the target and stop it.

**Heathland** courses occupy sandy inland ground with heather and gorse, sharing the firmness of links without the sea. Much of the classic English inland golf, Sunningdale and Walton Heath among it, is heathland.

**Desert** courses are cut into arid terrain, with irrigated grass corridors bounded by sand and scrub. They are common in the American southwest and the Gulf.

The type is not merely scenery. It determines whether the ground is an ally or an obstacle, whether the wind is the main defence, and which parts of a player's game the course actually examines.`,
  },
  {
    kind: 'conditions',
    heading: 'Weather and course conditions',
    order: 210,
    body: `Golf is played outdoors on natural ground over four days, which makes conditions a bigger variable than in almost any other professional sport. The same course, in the same week, can play entirely differently from one round to the next.

**Wind** is the largest factor on exposed courses, changing both club selection and the shape of shot a player can safely hit. **Rain** softens the ground, which makes approach shots stop faster and generally lowers scoring, and it also lengthens the course as the ball stops running. **Temperature and humidity** affect how far the ball carries. **Firmness** determines whether a green will hold a shot or reject it, and it is the single variable tournament organisers most often manipulate. **Green speed**, measured and set by the greenkeeping staff, changes putting from difficult to treacherous. **Rough length**, **elevation** and even the time of day a player goes out all matter.

This is why golf scores resist direct comparison. A winning total of eighteen under par and one of level par may represent identical golf played in different conditions, which is also why the sport increasingly measures players against the field rather than against par.`,
  },
  {
    kind: 'team',
    heading: 'Team golf',
    order: 220,
    body: `Golf is an individual sport for all but a handful of weeks, and those weeks draw some of its largest audiences.

**The Ryder Cup** is contested every two years between the United States and Europe, in foursomes, four-ball and singles matches over three days, with the venue alternating between the two. No prize money is paid, the players are chosen by a mixture of qualification and captain's picks, and it is generally the most watched event in golf.

**The Presidents Cup** is the same idea between the United States and an International team drawn from everywhere except Europe, played in the alternate years.

**The Solheim Cup** is the women's equivalent of the Ryder Cup, United States against Europe, biennial and in the same match-play formats.

**Olympic golf** is a 72-hole individual stroke-play event in which players represent their countries, with separate men's and women's competitions. It returned in 2016 after an absence of 112 years.

**Amateur team golf** includes the Walker Cup, the Curtis Cup and the World Amateur Team Championships, which are where many professionals first play internationally.

The reason these events matter disproportionately is that they change the incentive. A player who has spent the season playing for themselves is suddenly playing for a side, in a format where a single hole can be won or lost outright, in front of crowds that behave nothing like a normal golf gallery.`,
  },
  {
    kind: 'rankings',
    heading: 'World rankings',
    order: 230,
    body: `Because professional golf is spread across many tours, there is no league table that contains everybody. The world rankings exist to solve that: they compare players who may never enter the same tournament.

The **Official World Golf Ranking** covers the men's game and the **Rolex Women's World Golf Rankings** the women's. Both work in broadly the same way: a player earns points for finishing well in an eligible tournament, an event's points are weighted by the strength of its field, points decay over time, and the result is divided by the number of events played, so the ranking is an average rather than a total.

The consequences are practical rather than symbolic. Ranking position determines entry to majors and to the biggest tour events, seeding and pairings, qualification for the Olympics and for some team competitions, and a player's negotiating position commercially. Weeks spent at world number one is one of the standard measures of a career.

The formulas are complicated, they have been revised repeatedly, and eligibility for ranking points has itself become contested in the men's game. How the points are actually calculated belongs in an explainer.`,
  },
  {
    kind: 'eras',
    heading: 'Rivalries and eras',
    order: 240,
    body: `Golf's history is usually told through its dominant figures and the players who pushed them.

**Jones and the amateur era** ended in 1930, when Bobby Jones won the era's four major championships in a single year and retired at 28, having never turned professional.

**Hogan, Snead and Nelson** defined the middle of the century, a generation whose careers were interrupted by the Second World War and whose records are quoted with that gap in mind.

**Palmer against Nicklaus** in the 1960s brought golf to television. Palmer had the following, Nicklaus won more, and the contrast between them, the charismatic attacker and the relentless calculator, is the template every golf rivalry since has been described against.

**Nicklaus against Watson** produced the sport's most famous head-to-head, the 1977 Open at Turnberry, where the two played the final two rounds together and finished ten shots clear of the field.

**Ballesteros and the European revival** turned the Ryder Cup from an American formality into golf's fiercest event, and made continental European golf competitive at the highest level for the first time.

**Woods against the field** is the defining modern era. Between 1997 and 2008 Tiger Woods dominated in a way no golfer had, and his rivalry with Phil Mickelson, initially lopsided and later genuinely competitive, framed two decades of the men's game.

**In women's golf**, Mickey Wright and Kathy Whitworth's rivalry defined the 1960s, Nancy Lopez transformed the LPGA's audience in the late 1970s, and Annika Sörenstam, Karrie Webb and Lorena Ochoa contested a period of the 2000s that has few parallels for depth.`,
  },
  {
    kind: 'records',
    heading: 'Records and how to read them',
    order: 250,
    body: `Golf's headline records are majors won, tour wins, and weeks at world number one, and each needs qualification before it means anything.

**Men's majors**: Jack Nicklaus holds the record with 18, ahead of Tiger Woods on 15 and Walter Hagen on 11. **Women's majors**: Patty Berg holds the record with 15, though several of the championships she won are no longer recognised as majors, which is exactly the era problem the women's majors section describes. Mickey Wright won 13 and Louise Suggs 11.

**Tour wins**: Sam Snead and Tiger Woods share the PGA Tour record at 82. Kathy Whitworth's 88 LPGA wins is the most by any professional on either tour.

**The career Grand Slam**, all four men's majors in a career, has been completed by Gene Sarazen, Ben Hogan, Gary Player, Jack Nicklaus and Tiger Woods.

Two cautions apply to all of it. Records set before the modern era were set against fields, equipment and travel demands that are not comparable to today's, and the majors themselves have changed: the Masters did not exist before 1934, and the pre-1934 "majors" included the amateur championships. And the women's records are affected by which championships counted as majors in which decade, so a straight comparison of totals across eras will mislead.

Records held by active players are deliberately left out of any table on this page, because they change.`,
  },
  {
    kind: 'modern',
    heading: 'The modern game',
    order: 260,
    body: `Three things separate professional golf now from the game of thirty years ago.

**Distance.** Players hit the ball substantially further, through equipment, ball technology and a change in what a golfer's body is trained to do. The governing bodies have responded with a ball rollback intended to take effect later this decade, which is the most significant equipment intervention in modern golf.

**Measurement.** Every shot at a professional event is tracked, and the sport now analyses performance through **Strokes Gained**, which compares a player's result on each shot to what the field averages from the same position. It replaced statistics such as fairways hit and greens in regulation, which counted events without weighing them, and it changed which parts of the game are understood to matter.

**Money and structure.** Purses have grown sharply, the men's tour landscape has been in dispute since 2022, and the arrangements between the circuits have been announced and revised without settling. Anything written here about the current settlement would date quickly, so this page describes the dispute rather than its resolution.

The current leading players are not listed on this page, because rankings move weekly. The Players tab carries who is actually ranked where.`,
  },
  {
    kind: 'culture',
    heading: 'Iconic courses',
    order: 270,
    body: `A handful of courses are part of golf's identity rather than merely its calendar.

**The Old Course at St Andrews** in Scotland is a public links, shared fairways and enormous double greens, where the game's conventions were settled. The Open returns to it more often than to anywhere else.

**Augusta National** in Georgia is a private parkland course, host of the Masters every April, and the most tightly controlled and most photographed course in golf.

**Pebble Beach** in California runs along cliffs above the Pacific and is among the very few courses of that stature open to the public.

**Oakmont** in Pennsylvania and **Pinehurst No. 2** in North Carolina are the American championship tests, the first for its greens and the second for the run-off areas around them.

**Royal County Down** in Northern Ireland and **Muirfield** in Scotland are links of the first rank, and **Royal Melbourne** in Australia is the finest of the sandbelt courses.

No ranking is given here. Course rankings are published by several magazines, they disagree with one another, and none of them is authoritative.`,
  },
];

/**
 * Featured entities.
 *
 * `icons` interleaves the men's and women's games in rough chronological order
 * rather than filing the women separately, for the same reason basketball does:
 * a separate section would say that the default icon is male and everyone else
 * is a special case.
 *
 * There are no `teams` entries. Golf is seeded with `hasTeams: false`, so the
 * Teams tab does not render, and the Ryder Cup sides are not teams in the sense
 * this schema means. They are covered as prose in the `team` section.
 *
 * `slug` is optimistic throughout. It is resolved at seed time and legitimately
 * may find nothing, in which case the card renders unlinked from `name` and
 * gains its link when the entity is ingested.
 */
export const GOLF_FEATURED: FeaturedEntitySeed[] = [
  {
    section: 'icons',
    entityType: 'person',
    slug: 'harry-vardon',
    name: 'Harry Vardon',
    meta: 'England · 1890s–1920s',
    blurb:
      'Won six Open Championships, a record that still stands, and gave his name to the grip most golfers still use.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'bobby-jones',
    name: 'Bobby Jones',
    meta: 'United States · 1920s',
    blurb:
      'Won the era’s four major championships in 1930 and retired at 28, having never turned professional. Co-founded Augusta National and the Masters.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'babe-zaharias',
    name: 'Babe Zaharias',
    meta: 'United States · 1930s–1950s',
    blurb:
      'An Olympic track champion before she took up golf, won ten majors, and was a founder of the LPGA.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'patty-berg',
    name: 'Patty Berg',
    meta: 'United States · 1940s–1960s',
    blurb:
      'Holds the record for women’s major championships with fifteen, and was the LPGA’s first president.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'ben-hogan',
    name: 'Ben Hogan',
    meta: 'United States · 1940s–1950s',
    blurb:
      'Won nine majors, six of them after a car crash that nearly killed him, and remains the sport’s reference point for ball-striking.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'sam-snead',
    name: 'Sam Snead',
    meta: 'United States · 1930s–1960s',
    blurb:
      'Won 82 PGA Tour events, a record shared with Tiger Woods, across a career spanning four decades.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'mickey-wright',
    name: 'Mickey Wright',
    meta: 'United States · 1950s–1960s',
    blurb:
      'Won 13 majors and 82 LPGA titles, with a swing widely regarded by her contemporaries as the finest in golf.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'kathy-whitworth',
    name: 'Kathy Whitworth',
    meta: 'United States · 1960s–1980s',
    blurb:
      'Won 88 LPGA tournaments, more professional titles than any golfer of either sex has won on a single tour.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'arnold-palmer',
    name: 'Arnold Palmer',
    meta: 'United States · 1950s–1970s',
    blurb:
      'Won seven majors and, more consequentially, brought golf to a mass television audience in the 1960s.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'gary-player',
    name: 'Gary Player',
    meta: 'South Africa · 1950s–1970s',
    blurb:
      'Completed the career Grand Slam and won nine majors, travelling further than any golfer of his era to do it.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'jack-nicklaus',
    name: 'Jack Nicklaus',
    meta: 'United States · 1960s–1980s',
    blurb:
      'Won 18 major championships, the record, and finished second in another 19. Later one of the sport’s most prolific course architects.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'tom-watson',
    name: 'Tom Watson',
    meta: 'United States · 1970s–1980s',
    blurb:
      'Won eight majors including five Opens, and beat Nicklaus at Turnberry in 1977 in the most celebrated head-to-head in golf.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'nancy-lopez',
    name: 'Nancy Lopez',
    meta: 'United States · 1970s–1980s',
    blurb:
      'Won nine tournaments including five in a row as a rookie in 1978, and transformed the LPGA’s public profile.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'seve-ballesteros',
    name: 'Seve Ballesteros',
    meta: 'Spain · 1970s–1990s',
    blurb:
      'Won five majors with a recovery game nobody has matched, and drove the European revival that made the Ryder Cup a contest.',
    order: 140,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'annika-sorenstam',
    name: 'Annika Sörenstam',
    meta: 'Sweden · 1990s–2000s',
    blurb:
      'Won ten majors and 72 LPGA titles, and in 2001 shot 59, the only woman to do so in an LPGA event.',
    order: 150,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'karrie-webb',
    name: 'Karrie Webb',
    meta: 'Australia · 1990s–2000s',
    blurb:
      'Won seven majors and completed the career Grand Slam faster than any player in LPGA history.',
    order: 160,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'tiger-woods',
    name: 'Tiger Woods',
    meta: 'United States · 1996–present',
    blurb:
      'Won 15 majors and 82 PGA Tour events, and changed golf’s audience, athleticism and economics more than any player since Palmer.',
    order: 170,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lorena-ochoa',
    name: 'Lorena Ochoa',
    meta: 'Mexico · 2000s',
    blurb:
      'Held the world number one ranking for three years and retired at 28 at the peak of her career.',
    order: 180,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'inbee-park',
    name: 'Inbee Park',
    meta: 'South Korea · 2000s–2020s',
    blurb:
      'Won seven majors and Olympic gold in 2016, and led the generation that made South Korea the dominant force in women’s golf.',
    order: 190,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'the-masters',
    name: 'The Masters',
    meta: 'Augusta National · April · since 1934',
    blurb:
      'The only major played at the same course every year, run by the club that hosts it rather than by a tour or a governing body.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'pga-championship',
    name: 'PGA Championship',
    meta: 'United States · May · rotating venues',
    blurb: 'Run by the PGA of America, and reliably the strongest field of the four men’s majors.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'us-open-golf',
    name: 'U.S. Open',
    meta: 'United States · June · rotating venues',
    blurb:
      'The USGA’s national championship, set up to be the hardest test in golf. Winning scores are often close to par.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'the-open-championship',
    name: 'The Open Championship',
    meta: 'Britain and Ireland · July · since 1860',
    blurb:
      'The oldest championship in golf, played on a rota of links courses where wind and firm ground are the defence.',
    order: 40,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'us-womens-open',
    name: "U.S. Women's Open",
    meta: 'United States · run by the USGA',
    blurb:
      'The women’s national championship of the United States, and the most prestigious title in women’s golf.',
    order: 50,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'aig-womens-open',
    name: "AIG Women's Open",
    meta: 'Britain · run by The R&A · major since 2001',
    blurb:
      'The women’s Open, played on links courses, and a major only since 2001 when it replaced the du Maurier Classic.',
    order: 60,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'ryder-cup',
    name: 'Ryder Cup',
    meta: 'United States v Europe · every two years',
    blurb:
      'Three days of match play for no prize money, and the most watched event in golf. Europe-wide since 1979.',
    order: 70,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'solheim-cup',
    name: 'Solheim Cup',
    meta: "United States v Europe · women's · since 1990",
    blurb: 'The women’s biennial match-play international, in the same formats as the Ryder Cup.',
    order: 80,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'presidents-cup',
    name: 'Presidents Cup',
    meta: 'United States v International · every two years',
    blurb:
      'The same idea as the Ryder Cup, against a team drawn from everywhere except Europe, in the alternate years.',
    order: 90,
  },
];
