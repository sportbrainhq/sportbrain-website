/**
 * Football overview content.
 *
 * Every date and figure here was verified against Wikidata or Wikipedia during
 * authoring rather than recalled, and the checking earned its keep: a plausible
 * QID for CONMEBOL turned out to identify the French Revolutionary Wars.
 *
 * The prose is written for SportBrainHQ. Wikipedia is CC BY-SA, which covers
 * expression rather than fact, so the facts are used freely and the sentences
 * are ours. Sources are recorded in `content_source` and surfaced through the
 * "About this information" panel.
 *
 * ## On origins
 *
 * The timeline deliberately does not claim that any ancient game was the origin
 * of football. Cuju, episkyros and medieval mob football are recorded as
 * predecessors with `certainty: 'approximate'`, and codification is dated
 * separately and precisely. Collapsing those into "football was invented in X"
 * would assert a lineage the historical record does not support.
 */

export interface SourceSeed {
  key: string;
  provider: string;
  title: string;
  url: string;
  externalId?: string;
  license?: string;
}

export interface TimelineSeed {
  year: number;
  endYear?: number;
  title: string;
  shortDescription: string;
  category: string;
  isMajorMilestone?: boolean;
  certainty?: 'established' | 'approximate' | 'disputed';
  sourceKey?: string;
  order?: number;
}

export interface GoverningBodySeed {
  slug: string;
  shortName: string;
  name: string;
  level: 'world' | 'continental';
  parentSlug?: string;
  region?: string;
  foundedYear?: number;
  memberCount?: number;
  headquarters?: string;
  websiteUrl?: string;
  externalId?: string;
  order?: number;
}

export interface SectionSeed {
  kind: string;
  heading: string;
  body: string;
  order: number;
}

export const FOOTBALL_SOURCES: SourceSeed[] = [
  {
    key: 'wp-association-football',
    provider: 'wikipedia',
    title: 'Association football',
    url: 'https://en.wikipedia.org/wiki/Association_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of association football',
    url: 'https://en.wikipedia.org/wiki/History_of_association_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-laws',
    provider: 'wikipedia',
    title: 'Laws of the Game (association football)',
    url: 'https://en.wikipedia.org/wiki/Laws_of_the_Game_(association_football)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-womens',
    provider: 'wikipedia',
    title: "Women's association football",
    url: 'https://en.wikipedia.org/wiki/Women%27s_association_football',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-football',
    provider: 'wikidata',
    title: 'association football (Q2736)',
    url: 'https://www.wikidata.org/wiki/Q2736',
    externalId: 'Q2736',
    license: 'CC0',
  },
  {
    key: 'wd-fifa',
    provider: 'wikidata',
    title: 'FIFA (Q253414)',
    url: 'https://www.wikidata.org/wiki/Q253414',
    externalId: 'Q253414',
    license: 'CC0',
  },
  {
    key: 'ifab',
    provider: 'ifab',
    title: 'The IFAB — Laws of the Game',
    url: 'https://www.theifab.com/laws-of-the-game-documents/',
  },
];

/**
 * The timeline.
 *
 * Fourteen entries, chosen so that each marks a genuine change in what the
 * sport was rather than a notable result. Predecessor games are grouped into a
 * single approximate entry instead of several, because dating them individually
 * would imply a precision the sources do not have.
 */
export const FOOTBALL_TIMELINE: TimelineSeed[] = [
  {
    year: -200,
    endYear: 1800,
    title: 'Football-like games before codification',
    shortDescription:
      'Ball games played with the feet appear across many cultures long before the modern sport: cuju in Han-dynasty China, episkyros and harpastum around the classical Mediterranean, and the mob football of medieval Europe. These are predecessors rather than ancestors, and no direct line runs from any of them to association football.',
    category: 'origins',
    certainty: 'approximate',
    sourceKey: 'wp-history',
    order: 10,
  },
  {
    year: 1848,
    title: 'The Cambridge Rules',
    shortDescription:
      'Students at Cambridge drafted one of the first attempts to reconcile the differing football codes played at English public schools, an early step towards a shared set of laws.',
    category: 'codification',
    certainty: 'approximate',
    sourceKey: 'wp-history',
  },
  {
    year: 1857,
    title: 'Sheffield FC founded',
    shortDescription:
      'Sheffield FC is recognised by FIFA as the oldest surviving football club, and the Sheffield Rules its members played under influenced the laws that followed.',
    category: 'codification',
    sourceKey: 'wp-history',
  },
  {
    year: 1863,
    title: 'The Football Association and the first Laws of the Game',
    shortDescription:
      'Representatives of London clubs met in October 1863 to found the Football Association and agree a common code. The split with handling codes at this point is what separated association football from rugby football.',
    category: 'codification',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1871,
    title: 'The FA Cup',
    shortDescription:
      'The Football Association Challenge Cup began, the oldest national football competition still played.',
    category: 'competition',
    sourceKey: 'wp-history',
  },
  {
    year: 1872,
    title: 'First international match',
    shortDescription:
      'Scotland and England met in Glasgow in the first officially recognised international football match. It finished goalless.',
    category: 'global',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1886,
    title: 'The International Football Association Board',
    shortDescription:
      'IFAB was formed to maintain the Laws of the Game, a role it still holds. FIFA and the four British associations share the vote.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'ifab',
  },
  {
    year: 1888,
    title: 'The Football League',
    shortDescription:
      'The first league competition gave clubs a guaranteed programme of fixtures, and the model spread worldwide.',
    category: 'professionalism',
    sourceKey: 'wp-history',
  },
  {
    year: 1904,
    title: 'FIFA founded',
    shortDescription:
      'Seven European associations founded FIFA in Paris on 21 May 1904 to govern the game internationally.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wd-fifa',
  },
  {
    year: 1921,
    endYear: 1971,
    title: "The English ban on women's football",
    shortDescription:
      "The Football Association barred women's teams from member grounds in 1921, at a point when women's matches were drawing very large crowds. The ban stood for fifty years and set back the women's game across much of the world.",
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-womens',
  },
  {
    year: 1930,
    title: 'The first FIFA World Cup',
    shortDescription:
      'Uruguay hosted and won the inaugural World Cup, establishing the tournament that remains the sport’s definitive international competition.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
  },
  {
    year: 1954,
    title: 'Continental confederations take shape',
    shortDescription:
      'UEFA and the AFC were both founded in 1954, joining CONMEBOL and beginning the continental layer of governance that organises qualification and club competition today.',
    category: 'governance',
    sourceKey: 'wd-fifa',
  },
  {
    year: 1991,
    title: "The first Women's World Cup",
    shortDescription:
      "FIFA staged the first Women's World Cup in China, won by the United States. The tournament has since become one of the most watched events in the sport.",
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-womens',
  },
  {
    year: 2018,
    title: 'Video assistant referees at the World Cup',
    shortDescription:
      'The 2018 World Cup was the first to use VAR, following goal-line technology in 2014. Both mark the point at which officiating decisions began to be reviewed on video as a matter of routine.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-laws',
  },
];

/**
 * Governing bodies.
 *
 * Founding years, member counts, headquarters and websites all read from
 * Wikidata. FIFA's member count is absent there and is left null rather than
 * filled from memory.
 */
export const FOOTBALL_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'fifa',
    shortName: 'FIFA',
    name: 'Fédération Internationale de Football Association',
    level: 'world',
    foundedYear: 1904,
    headquarters: 'Zurich, Switzerland',
    websiteUrl: 'https://www.fifa.com',
    externalId: 'Q253414',
    order: 10,
  },
  {
    slug: 'uefa',
    shortName: 'UEFA',
    name: 'Union of European Football Associations',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'Europe',
    foundedYear: 1954,
    memberCount: 55,
    headquarters: 'Nyon, Switzerland',
    websiteUrl: 'https://www.uefa.com',
    externalId: 'Q35572',
    order: 10,
  },
  {
    slug: 'conmebol',
    shortName: 'CONMEBOL',
    name: 'Confederación Sudamericana de Fútbol',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'South America',
    foundedYear: 1916,
    memberCount: 10,
    headquarters: 'Luque, Paraguay',
    websiteUrl: 'https://www.conmebol.com',
    externalId: 'Q58733',
    order: 20,
  },
  {
    slug: 'afc',
    shortName: 'AFC',
    name: 'Asian Football Confederation',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'Asia',
    foundedYear: 1954,
    memberCount: 47,
    headquarters: 'Kuala Lumpur, Malaysia',
    websiteUrl: 'https://www.the-afc.com',
    externalId: 'Q83276',
    order: 30,
  },
  {
    slug: 'caf',
    shortName: 'CAF',
    name: 'Confédération Africaine de Football',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'Africa',
    foundedYear: 1957,
    memberCount: 54,
    headquarters: '6th of October City, Egypt',
    websiteUrl: 'https://www.cafonline.com',
    externalId: 'Q168360',
    order: 40,
  },
  {
    slug: 'concacaf',
    shortName: 'CONCACAF',
    name: 'Confederation of North, Central America and Caribbean Association Football',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'North and Central America, Caribbean',
    foundedYear: 1961,
    memberCount: 41,
    headquarters: 'Miami, United States',
    websiteUrl: 'https://www.concacaf.com',
    externalId: 'Q160549',
    order: 50,
  },
  {
    slug: 'ofc',
    shortName: 'OFC',
    name: 'Oceania Football Confederation',
    level: 'continental',
    parentSlug: 'fifa',
    region: 'Oceania',
    foundedYear: 1966,
    memberCount: 13,
    headquarters: 'Auckland, New Zealand',
    websiteUrl: 'https://www.oceaniafootball.com',
    externalId: 'Q180344',
    order: 60,
  },
];

/**
 * Authored sections.
 *
 * Written for SportBrainHQ from verified facts. The register is deliberately
 * plain: factual, unhurried, no marketing language and no filler.
 */
export const FOOTBALL_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is football?',
    order: 10,
    body: `Association football is a team sport played between two sides of eleven, on a rectangular pitch with a goal at each end. The object is simple enough to explain in a sentence: move the ball into the opposing goal more often than the opposition moves it into yours.

What makes the game distinctive is the constraint. Outfield players may not handle the ball, so it is controlled almost entirely with the feet, and secondarily with the thighs, chest and head. Only the goalkeeper may use their hands, and only inside their own penalty area. Working around that restriction is what produces the sport's characteristic technique.

Football is also **low-scoring and continuous**. The clock runs without stopping, possession changes hands constantly, and most matches are settled by one or two goals. A single moment can decide a game that one side has otherwise controlled, which is why the sport rewards patience and why its statistics need reading carefully.

The professional game runs on two tracks that share the same players. **Club football** is the weekly rhythm: domestic leagues and cups played across a season, with continental competition for those who qualify. **International football** gathers players into national teams for tournaments and qualifying, and reaches its largest audience at the World Cup. Between them, they make football the most widely played and watched sport in the world.`,
  },
  {
    kind: 'basics',
    heading: 'How football works',
    order: 20,
    body: `**The team.** Eleven players a side, one of them a goalkeeper. A match may not continue if a team falls below seven.

**The pitch.** A rectangle of grass or approved artificial surface, longer than it is wide, with a goal centred on each shorter edge. International matches use a length of 100 to 110 metres and a width of 64 to 75 metres, so no two grounds are quite alike.

**The objective.** A goal is scored when the whole of the ball crosses the whole of the goal line between the posts and beneath the crossbar. The side with more goals wins; equal goals is a draw, unless the competition requires a winner.

**The match.** Two halves of 45 minutes with a half-time interval of no more than 15 minutes. The referee adds time at the end of each half for stoppages, and the clock is never stopped during play.

**The officials.** A referee has full authority over the match, assisted by two assistant referees and, in most professional competitions, a fourth official and a video assistant referee team.

**The laws.** Seventeen Laws of the Game, maintained by the International Football Association Board rather than by FIFA alone. Offside, handball, fouls, penalties and the video review protocol each have far more detail than an overview can carry.`,
  },
  {
    kind: 'competitions',
    heading: 'How competitions are organised',
    order: 30,
    body: `Football competition divides into two families that run in parallel through the season.

**Club competition** starts domestically. Almost every country runs a league in which clubs play each other home and away over a season, usually with promotion and relegation connecting divisions into a pyramid. Alongside the league sits at least one knockout cup, typically open to clubs from every tier, which is what allows a small club an occasional match against a large one. Many countries add a secondary league cup and a season-opening super cup between the league and cup winners.

Above the domestic level, each confederation runs continental club competition for teams that qualify through their league. These have a primary tournament and usually a secondary one, and winning either carries entry to the following season's competition.

**International competition** is played by national teams. The World Cup is the sport's largest tournament, staged every four years and reached through a qualifying process run separately by each confederation. Between World Cups, each confederation holds its own championship, and some run league-format competitions that have replaced a proportion of friendly matches.`,
  },
  {
    kind: 'evolution',
    heading: 'How the game has changed',
    order: 40,
    body: `**Laws.** The 1863 code was short and much of it unrecognisable today. Offside, substitutions, cards and the back-pass restriction all arrived later, each changing how the game is played rather than merely how it is administered.

**Tactics.** Formations moved from heavily attacking shapes in the nineteenth century towards defensive structure, and back towards attacking play as pressing and possession systems developed. The numbers that describe a formation now say much less about a team than they once did.

**Professionalism.** Payment was contested before it was accepted, and its acceptance created the transfer market, the modern club and eventually the labour rights that reshaped how players move.

**Broadcasting and money.** Television turned domestic leagues into international products, and broadcast income became the largest single revenue stream in the professional game.

**Science and data.** Sports science changed preparation and recovery; tracking data and analytics changed recruitment and match preparation. Measures such as expected goals moved from analysts' spreadsheets into broadcast graphics within roughly a decade.

**Technology in officiating.** Goal-line technology settled a question that had been argued for a century. Video assistant referees went further, and the argument about how far review should extend is still live.`,
  },
  {
    kind: 'womens',
    heading: "Women's football",
    order: 50,
    body: `Women have played organised football for as long as the modern game has existed, and the sport's history is incomplete without that.

By the end of the First World War, women's matches in England were drawing crowds in the tens of thousands. In 1921 the Football Association barred women's teams from grounds belonging to its members, a decision that stood until 1971. Similar restrictions applied elsewhere. The effect was to remove the women's game from the venues, revenue and coverage that the men's game continued to enjoy for fifty years, and the gap that opened is still being closed.

Rebuilding began through unofficial competitions and national associations reconstituted in the 1970s. UEFA and FIFA took the women's game into their competition structures over the following two decades, and FIFA staged the first Women's World Cup in 1991, won by the United States.

Professional domestic leagues followed, later than in the men's game and on smaller budgets, and attendance and broadcast records have moved sharply upward since. SportBrainHQ treats women's competitions as competitions rather than as a variant: gender belongs to a competition or a team, never to the sport.`,
  },
  {
    kind: 'global',
    heading: 'Football around the world',
    order: 60,
    body: `Football's governance is geographic. Six confederations divide the world between them, and each runs its own qualifying competition for the World Cup, its own championship for national teams, and its own club tournaments.

That structure explains a good deal about the sport. A confederation's size shapes how many World Cup places it receives; its wealth shapes where players move and where the strongest leagues sit. **UEFA** and **CONMEBOL** between them have provided every men's World Cup winner so far, while **AFC** and **CAF** together contain far more member associations than either.

The practical consequence for a reader is that football is not one competition ladder but six, loosely connected at the top by international tournaments and by a transfer market that moves players between them.`,
  },
];
