/**
 * Cricket overview content.
 *
 * Structured like `football-overview.ts` and deliberately not a translation of
 * it. Cricket's Overview carries two things football's does not, because
 * cricket cannot be described honestly without them:
 *
 *   - a **format taxonomy** (`CRICKET_FORMATS`), because Test and first-class
 *     cricket are not the same thing, an ODI is not every List A match, and a
 *     T20I is not every T20. Those three pairs are the most common modelling
 *     error in cricket data, and prose alone does not prevent it.
 *   - a **concept list** (`CRICKET_CONCEPTS`), the vocabulary a newcomer needs
 *     before any of the rest parses. "Wicket" means three different things and
 *     an Overview that picks one teaches something that has to be unlearned.
 *
 * ## On sourcing
 *
 * Every date and figure below was verified during authoring rather than
 * recalled, and the verification changed several entries:
 *
 *   - The **1973** Women's World Cup predates the **1975** men's tournament by
 *     two years. Writing the men's event as "the first World Cup" is a factual
 *     error, not merely a framing one, and it is an easy one to make.
 *   - The earliest accepted reference to cricket is a **single** court hearing
 *     dated both 1597 and 1598, depending on whether the year is counted from
 *     25 March. It is recorded once, as 1597, with the discrepancy explained
 *     rather than silently picking a side.
 *   - **ICC membership figures come from the ICC's own members page** (12 Full,
 *     94 Associate). Wikipedia gave "111 total" from "12 + 98", which does not
 *     add up, and two other secondary sources gave 110 and 108. Four sources,
 *     four answers, which is precisely why the figure is stored with an as-of
 *     date and read from the governing body rather than an aggregator.
 *
 * Claims that could not be verified are **absent rather than hedged**: a 1533
 * reference to "creckett", an 1835 legalisation of roundarm bowling, and the
 * frequently repeated assertion that the 1844 USA v Canada match was the first
 * international fixture in any sport. None appears below.
 *
 * ## MCC and ICC are not interchangeable
 *
 * The MCC owns the Laws of Cricket. The ICC governs international cricket and
 * issues playing conditions that supplement, and in places override, those
 * Laws. A 90-over day is an ICC playing condition, not a Law, and presenting it
 * as one would be wrong. `conditionsAuthority` on each format records which
 * document actually governs it, and the prose keeps the distinction.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';

/**
 * One node in a sport's format taxonomy.
 *
 * `matchClass` says what kind of cricket it is, `isInternational` says who
 * plays it, and the two are independent. That independence is the whole point:
 * collapsing them is what produces a database claiming a County Championship
 * match is a Test.
 */
export interface FormatSeed {
  key: string;
  label: string;
  /** Parent node in the taxonomy. Omitted for a top-level branch. */
  parentKey?: string;
  matchClass: string;
  /** Omitted for a grouping node, where the question does not apply. */
  isInternational?: boolean;
  oversPerSide?: number;
  inningsPerSide?: number;
  maxDays?: number;
  drawPossible?: boolean;
  description?: string;
  /** `mcc`, `icc`, or the board or competition that sets the conditions. */
  conditionsAuthority?: string;
  sourceKey?: string;
  order?: number;
}

/** One term the Overview introduces and an Explainer will teach. */
export interface ConceptSeed {
  key: string;
  term: string;
  summary: string;
  category: string;
  /** Set only where the term genuinely carries more than one meaning. */
  ambiguityNote?: string;
  /** Explainer that teaches it. May not exist yet; the API checks. */
  explainerSlug?: string;
  sourceKey?: string;
  order?: number;
}

/** A structured quick fact, with the source it came from. */
export interface FactSeed {
  key: string;
  label: string;
  value: string;
  category: string;
  sourceKey?: string;
  order?: number;
}

export const CRICKET_SOURCES: SourceSeed[] = [
  {
    key: 'wp-cricket',
    provider: 'wikipedia',
    title: 'Cricket',
    url: 'https://en.wikipedia.org/wiki/Cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of cricket',
    url: 'https://en.wikipedia.org/wiki/History_of_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-earliest-references',
    provider: 'wikipedia',
    title: 'List of earliest references in English cricket',
    url: 'https://en.wikipedia.org/wiki/List_of_earliest_references_in_English_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-laws',
    provider: 'wikipedia',
    title: 'Laws of Cricket',
    url: 'https://en.wikipedia.org/wiki/Laws_of_Cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-test',
    provider: 'wikipedia',
    title: 'Test cricket',
    url: 'https://en.wikipedia.org/wiki/Test_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-first-class',
    provider: 'wikipedia',
    title: 'First-class cricket',
    url: 'https://en.wikipedia.org/wiki/First-class_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-list-a',
    provider: 'wikipedia',
    title: 'List A cricket',
    url: 'https://en.wikipedia.org/wiki/List_A_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-odi',
    provider: 'wikipedia',
    title: 'One Day International',
    url: 'https://en.wikipedia.org/wiki/One_Day_International',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-t20',
    provider: 'wikipedia',
    title: 'Twenty20',
    url: 'https://en.wikipedia.org/wiki/Twenty20',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-womens',
    provider: 'wikipedia',
    title: "Women's cricket",
    url: 'https://en.wikipedia.org/wiki/Women%27s_cricket',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-womens-wc-1973',
    provider: 'wikipedia',
    title: "1973 Women's Cricket World Cup",
    url: 'https://en.wikipedia.org/wiki/1973_Women%27s_Cricket_World_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wpl',
    provider: 'wikipedia',
    title: "Women's Premier League (cricket)",
    url: 'https://en.wikipedia.org/wiki/Women%27s_Premier_League_(cricket)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-drs',
    provider: 'wikipedia',
    title: 'Umpire Decision Review System',
    url: 'https://en.wikipedia.org/wiki/Umpire_Decision_Review_System',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ashes',
    provider: 'wikipedia',
    title: 'The Ashes',
    url: 'https://en.wikipedia.org/wiki/The_Ashes',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-articles-1727',
    provider: 'wikipedia',
    title: 'Articles of Agreement (cricket)',
    url: 'https://en.wikipedia.org/wiki/Articles_of_Agreement_(cricket)',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-icc',
    provider: 'wikipedia',
    title: 'International Cricket Council',
    url: 'https://en.wikipedia.org/wiki/International_Cricket_Council',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympics',
    provider: 'wikipedia',
    title: 'Cricket at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Cricket_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-cricket',
    provider: 'wikidata',
    title: 'cricket (Q5375)',
    url: 'https://www.wikidata.org/wiki/Q5375',
    externalId: 'Q5375',
    license: 'CC0',
  },
  {
    key: 'wd-icc',
    provider: 'wikidata',
    title: 'International Cricket Council (Q188496)',
    url: 'https://www.wikidata.org/wiki/Q188496',
    externalId: 'Q188496',
    license: 'CC0',
  },
  {
    key: 'wd-mcc',
    provider: 'wikidata',
    title: 'Marylebone Cricket Club (Q1194319)',
    url: 'https://www.wikidata.org/wiki/Q1194319',
    externalId: 'Q1194319',
    license: 'CC0',
  },
  {
    key: 'mcc-laws',
    provider: 'mcc',
    title: 'MCC, The Laws of Cricket (2017 Code, 3rd Edition 2022)',
    url: 'https://www.lords.org/mcc/the-laws-of-cricket',
    license: 'MCC',
  },
  {
    key: 'icc-members',
    provider: 'icc',
    title: 'ICC, About our Members',
    url: 'https://www.icc-cricket.com/about/members/about-our-members',
    license: 'ICC',
  },
  {
    key: 'icc-la28',
    provider: 'icc',
    title: 'ICC, Qualification and format confirmed for cricket at the LA28 Olympic Games',
    url: 'https://www.icc-cricket.com/media-releases/qualification-and-format-confirmed-for-cricket-s-historic-return-at-la28-olympic-games',
    license: 'ICC',
  },
];

/**
 * Quick facts.
 *
 * Structural and stable by design. No SportBrain database counts appear here:
 * how many cricket teams we happen to hold is a fact about us, not about
 * cricket, and it belongs under Explore Cricket where it is honest.
 *
 * Where a value comes from a playing condition rather than a Law, the value
 * says so. "Six deliveries per over" is Law 17; "90 overs a day" is not a Law
 * at all.
 */
export const CRICKET_FACTS: FactSeed[] = [
  {
    key: 'sport_type',
    label: 'Sport type',
    value: 'Bat-and-ball team sport',
    category: 'identity',
    sourceKey: 'wp-cricket',
    order: 10,
  },
  {
    key: 'teams_per_match',
    label: 'Teams per match',
    value: 'Two',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 20,
  },
  {
    key: 'players_per_side',
    label: 'Players per side',
    value: '11, one of whom keeps wicket (Law 1)',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 30,
  },
  {
    key: 'objective',
    label: 'Objective',
    value:
      'Score more runs than the opposition, while dismissing their batters to end their innings',
    category: 'gameplay',
    sourceKey: 'wp-cricket',
    order: 40,
  },
  {
    key: 'pitch_length',
    label: 'Pitch length',
    value: '22 yards (20.12 m) between the wickets, 10 ft wide (Law 6)',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 50,
  },
  {
    key: 'wicket',
    label: 'The wicket',
    value: 'Three stumps and two bails, 28 in high and 9 in wide overall (Law 8)',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 60,
  },
  {
    key: 'over',
    label: 'Deliveries per over',
    value: 'Six (Law 17). Four-, five- and eight-ball overs have all been used historically',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 70,
  },
  {
    key: 'playing_area',
    label: 'Playing area',
    value:
      'No fixed size. The Laws prescribe the pitch but not the field; boundary distances are set by playing conditions, so no two grounds are alike',
    category: 'gameplay',
    sourceKey: 'mcc-laws',
    order: 80,
  },
  {
    key: 'laws_authority',
    label: 'Laws authority',
    value: 'Marylebone Cricket Club (MCC), custodian since 1788. 42 Laws in the current 2017 Code',
    category: 'governance',
    sourceKey: 'mcc-laws',
    order: 90,
  },
  {
    key: 'governing_body',
    label: 'International governing body',
    value:
      'International Cricket Council (ICC), founded 1909 as the Imperial Cricket Conference. Issues playing conditions, which are distinct from the Laws',
    category: 'governance',
    sourceKey: 'icc-members',
    order: 100,
  },
  {
    key: 'international_formats',
    label: 'International formats',
    value: 'Test (multi-day), One Day International (50 overs), Twenty20 International (20 overs)',
    category: 'formats',
    sourceKey: 'wp-cricket',
    order: 110,
  },
  {
    key: 'codification',
    label: 'Codification milestones',
    value:
      'Articles of Agreement 1727; first known Laws 1744; lbw introduced 1774; first MCC code 1788; overarm bowling legalised 1864',
    category: 'origin',
    sourceKey: 'wp-laws',
    order: 120,
  },
  {
    key: 'first_recorded',
    label: 'Earliest accepted reference',
    value:
      'A Guildford court hearing of January 1597 (1598 in modern dating) recalling "creckett" played there around 1550',
    category: 'origin',
    sourceKey: 'wp-earliest-references',
    order: 130,
  },
  {
    key: 'olympic',
    label: 'Olympic status',
    value:
      'Played once, at Paris 1900. Returning at Los Angeles 2028 as a six-team T20 event for both men and women',
    category: 'reach',
    sourceKey: 'icc-la28',
    order: 140,
  },
];

/**
 * The format taxonomy.
 *
 * Four grouping nodes and six real formats. The grouping nodes carry no
 * `isInternational` because the question is meaningless for them, and that
 * null is load-bearing: it is what distinguishes "not applicable" from "not
 * international".
 *
 * Read the pairs as the point of the whole structure. `test` and `first_class`
 * share a parent, a match class, an innings count and the possibility of a
 * draw, and differ only in `isInternational`. That is the real relationship,
 * and it is why a single format string cannot express it.
 */
export const CRICKET_FORMATS: FormatSeed[] = [
  {
    key: 'multi_day',
    label: 'Multi-day cricket',
    matchClass: 'multi_day',
    inningsPerSide: 2,
    drawPossible: true,
    description:
      'Played across three or more days, with each side normally batting twice. Because time rather than deliveries is the limit, a match that neither side has won when the time runs out is drawn.',
    sourceKey: 'wp-first-class',
    order: 10,
  },
  {
    key: 'test',
    label: 'Test cricket',
    parentKey: 'multi_day',
    matchClass: 'multi_day',
    isInternational: true,
    inningsPerSide: 2,
    maxDays: 5,
    drawPossible: true,
    description:
      'The international form of multi-day cricket, played over a maximum of five days between Full Members of the ICC. Traditionally played with a red ball in daylight; pink-ball day-night Tests have been played since 2015. A Test is first-class cricket, but most first-class cricket is not Test cricket.',
    conditionsAuthority: 'icc',
    sourceKey: 'wp-test',
    order: 20,
  },
  {
    key: 'first_class',
    label: 'First-class cricket',
    parentKey: 'multi_day',
    matchClass: 'multi_day',
    isInternational: false,
    inningsPerSide: 2,
    drawPossible: true,
    description:
      'Domestic multi-day cricket of at least three days, with two innings a side, that the relevant governing body has classified as first-class. The County Championship, the Sheffield Shield and the Ranji Trophy are first-class and are not Tests.',
    conditionsAuthority: 'member board',
    sourceKey: 'wp-first-class',
    order: 30,
  },
  {
    key: 'limited_overs',
    label: 'Limited-overs cricket',
    matchClass: 'limited_overs',
    inningsPerSide: 1,
    drawPossible: false,
    description:
      'Each side bats once, for a capped number of overs. Because the innings ends when the overs run out, a result is almost always reached and a draw is not a possible outcome, though a tie is.',
    sourceKey: 'wp-list-a',
    order: 40,
  },
  {
    key: 'one_day',
    label: 'One-day cricket',
    parentKey: 'limited_overs',
    matchClass: 'limited_overs',
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description: 'Limited-overs cricket long enough to fill a day, most often 50 overs a side.',
    sourceKey: 'wp-list-a',
    order: 50,
  },
  {
    key: 'odi',
    label: 'One Day International (ODI)',
    parentKey: 'one_day',
    matchClass: 'limited_overs',
    isInternational: true,
    oversPerSide: 50,
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description:
      'The international one-day format: 50 overs a side, between sides holding ODI status. Every ODI is a List A match; most List A matches are not ODIs.',
    conditionsAuthority: 'icc',
    sourceKey: 'wp-odi',
    order: 60,
  },
  {
    key: 'list_a',
    label: 'List A cricket',
    parentKey: 'one_day',
    matchClass: 'limited_overs',
    isInternational: false,
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description:
      'Domestic one-day cricket, typically 40 to 60 overs a side, classified as List A by the relevant authority. The classification originated with cricket statisticians and was endorsed by the ICC in 2006.',
    conditionsAuthority: 'member board',
    sourceKey: 'wp-list-a',
    order: 70,
  },
  {
    key: 't20',
    label: 'Twenty20 cricket',
    parentKey: 'limited_overs',
    matchClass: 'limited_overs',
    oversPerSide: 20,
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description:
      'Twenty overs a side, completed in about three hours. Introduced as an English domestic competition in 2003 and now the most widely played form of the professional game.',
    sourceKey: 'wp-t20',
    order: 80,
  },
  {
    key: 't20i',
    label: 'Twenty20 International (T20I)',
    parentKey: 't20',
    matchClass: 'limited_overs',
    isInternational: true,
    oversPerSide: 20,
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description:
      'Twenty20 between national sides. The ICC has granted T20I status to all its members, which makes it the format in which the great majority of cricketing nations play international cricket.',
    conditionsAuthority: 'icc',
    sourceKey: 'wp-t20',
    order: 90,
  },
  {
    key: 'domestic_t20',
    label: 'Domestic and franchise T20',
    parentKey: 't20',
    matchClass: 'limited_overs',
    isInternational: false,
    oversPerSide: 20,
    inningsPerSide: 1,
    maxDays: 1,
    drawPossible: false,
    description:
      'Twenty20 below international level. It covers both competitions contested by established domestic sides, such as the T20 Blast, and franchise leagues whose teams were created for the competition, such as the Indian Premier League. The two are not the same thing.',
    conditionsAuthority: 'competition',
    sourceKey: 'wp-t20',
    order: 100,
  },
];

/**
 * The vocabulary.
 *
 * Each entry is one or two sentences. Where an entry starts wanting a third,
 * that is the signal it belongs in an Explainer, and `explainerSlug` is where
 * it goes instead.
 *
 * The slugs point at the Cricket Explainer library being built alongside this
 * (`cricket-explainers.ts`), and were taken from that file rather than invented,
 * so the two halves meet. Two concepts share a target where the library covers
 * them together: batting and scoring both lead to `how-runs-are-scored`.
 *
 * None of these explainers is published yet. The API resolves each slug against
 * the `explainer` table and returns null for the ones that do not exist, so the
 * page renders plain text now and becomes linked as the library lands. Nothing
 * here needs changing when it does.
 */
export const CRICKET_CONCEPTS: ConceptSeed[] = [
  {
    key: 'batter',
    term: 'Batter',
    summary:
      'The player facing the bowling. Two batters are in at once, at opposite ends of the pitch, and their job is to score runs while avoiding dismissal.',
    category: 'role',
    explainerSlug: 'how-runs-are-scored',
    sourceKey: 'wp-cricket',
    order: 10,
  },
  {
    key: 'bowler',
    term: 'Bowler',
    summary:
      'The player delivering the ball, with a straight arm rather than a throw. A bowler tries either to dismiss the batter or to make scoring difficult.',
    category: 'role',
    explainerSlug: 'delivery',
    sourceKey: 'wp-cricket',
    order: 20,
  },
  {
    key: 'fielders',
    term: 'Fielders',
    summary:
      'The nine remaining players of the bowling side, positioned around the ground to stop runs and to catch or run out batters. Their placement is the captain’s main tactical lever.',
    category: 'role',
    explainerSlug: 'field-positions',
    sourceKey: 'wp-cricket',
    order: 30,
  },
  {
    key: 'wicketkeeper',
    term: 'Wicketkeeper',
    summary:
      'The specialist fielder crouched immediately behind the striker’s wicket, and the only one permitted gloves and external leg guards.',
    category: 'role',
    explainerSlug: 'fielding-and-wicketkeeping',
    sourceKey: 'mcc-laws',
    order: 40,
  },
  {
    key: 'pitch',
    term: 'Pitch',
    summary:
      'The prepared strip at the centre of the ground, 22 yards long, with a wicket at each end. Almost all bowling and batting happens on it, and how it behaves changes over the course of a match.',
    category: 'area',
    explainerSlug: 'pitch-and-conditions',
    sourceKey: 'mcc-laws',
    order: 50,
  },
  {
    key: 'wicket',
    term: 'Wicket',
    summary:
      'Most precisely, the three stumps and two bails that a batter defends and a bowler aims at.',
    ambiguityNote:
      'The word carries three meanings and context decides which. It is the stumps themselves; it is a dismissal, as in "took three wickets"; and colloquially it is the pitch, as in "a slow wicket". A newcomer meeting only one of the three will misread the other two.',
    category: 'equipment',
    explainerSlug: 'wicket',
    sourceKey: 'mcc-laws',
    order: 60,
  },
  {
    key: 'over',
    term: 'Over',
    summary:
      'A set of six legal deliveries bowled from one end by one bowler. When it ends, play switches to the other end and a different bowler takes over.',
    category: 'structure',
    explainerSlug: 'over',
    sourceKey: 'mcc-laws',
    order: 70,
  },
  {
    key: 'innings',
    term: 'Innings',
    summary:
      'A period of batting. The word is both singular and plural, and applies to a team and to an individual batter, so "the innings" may mean a whole team’s turn or one player’s time at the crease.',
    ambiguityNote:
      'How many innings a side gets depends on the format: two each in multi-day cricket, one each in limited-overs cricket.',
    category: 'structure',
    explainerSlug: 'how-a-cricket-match-works',
    sourceKey: 'mcc-laws',
    order: 80,
  },
  {
    key: 'run',
    term: 'Run',
    summary:
      'The unit of scoring. Batters run between the wickets to score, and a ball reaching the boundary scores four, or six if it clears it without touching the ground first.',
    category: 'structure',
    explainerSlug: 'how-runs-are-scored',
    sourceKey: 'mcc-laws',
    order: 90,
  },
  {
    key: 'dismissal',
    term: 'Dismissal',
    summary:
      'The end of a batter’s innings. There are ten ways it can happen, of which bowled, caught, leg before wicket, run out and stumped account for nearly all of them.',
    category: 'structure',
    explainerSlug: 'wickets-and-dismissals',
    sourceKey: 'mcc-laws',
    order: 100,
  },
];

/**
 * The timeline.
 *
 * Twenty-four entries. Each marks a change in what cricket was, not a notable
 * result, which is why no individual match appears unless it began something.
 *
 * `certainty` is used properly rather than decoratively. Four entries are
 * marked `disputed` or `approximate` because the record genuinely is: the
 * earliest reference is dated two ways, the 1727 Articles are given as 1728 by
 * one otherwise reliable source, the 1744 Laws have contested attribution, and
 * the Ashes urn's provenance has two incompatible accounts.
 */
export const CRICKET_TIMELINE: TimelineSeed[] = [
  {
    year: 1550,
    title: 'Cricket played in Surrey',
    shortDescription:
      'The earliest generally accepted evidence of cricket is retrospective: in a Guildford land dispute heard in January 1597, a 59-year-old coroner named John Derrick testified that he and his schoolfellows had "played there at creckett" about fifty years earlier. That places the game in Surrey around 1550. Earlier candidate references exist but are not accepted as describing cricket.',
    category: 'origins',
    certainty: 'approximate',
    isMajorMilestone: true,
    sourceKey: 'wp-earliest-references',
    order: 10,
  },
  {
    year: 1597,
    title: 'The Guildford court hearing',
    shortDescription:
      'The hearing at which Derrick gave his evidence, and the earliest document to name the game. It is dated both 1597 and 1598 in the literature: under the Julian calendar the English legal year began on 25 March, so a January date fell in what contemporaries called 1597 and modern dating calls 1598. The two are the same hearing, not two events.',
    category: 'origins',
    certainty: 'disputed',
    sourceKey: 'wp-earliest-references',
    order: 20,
  },
  {
    year: 1727,
    title: 'Articles of Agreement',
    shortDescription:
      'The Duke of Richmond and Alan Brodrick set down terms for two matches: twelve players a side, wickets 23 yards apart, an umpire each. The earliest surviving written rules for cricket, though agreed for particular fixtures rather than for the game at large. Some sources date them 1728.',
    category: 'codification',
    certainty: 'disputed',
    sourceKey: 'wp-articles-1727',
    order: 30,
  },
  {
    year: 1744,
    title: 'The first known Laws of Cricket',
    shortDescription:
      'The first code intended to govern the game generally rather than a single match, drawn up by the noblemen and gentlemen playing at the Artillery Ground in London. The precise issuing body is not settled.',
    category: 'codification',
    certainty: 'disputed',
    isMajorMilestone: true,
    sourceKey: 'wp-laws',
    order: 40,
  },
  {
    year: 1745,
    title: 'The first recorded women’s match',
    shortDescription:
      'The Reading Mercury reported eleven maids of Bramley playing eleven maids of Hambledon in Surrey on 26 July 1745, "all dressed in white". Women’s cricket is therefore documented within a year of the game’s first general code, not as a later addition to it.',
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-womens',
    order: 50,
  },
  {
    year: 1774,
    title: 'Leg before wicket introduced',
    shortDescription:
      'A revision of the Laws added lbw, a third stump, and a maximum bat width. The lbw law exists because batters had begun simply blocking the ball with their legs, and it remains the most argued-over law in the game.',
    category: 'codification',
    sourceKey: 'wp-history',
    order: 60,
  },
  {
    year: 1787,
    title: 'MCC founded, and Lord’s opened',
    shortDescription:
      'The Marylebone Cricket Club was formed and began playing at Thomas Lord’s ground in London. The club issued its own code the following year and has been the custodian of the Laws ever since, a role it still holds despite never having governed international cricket.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wd-mcc',
    order: 70,
  },
  {
    year: 1844,
    title: 'The first international match',
    shortDescription:
      'The United States played Canada at the St George’s Cricket Club ground in New York. It is the earliest international cricket fixture, and it took place more than thirty years before the first Test.',
    category: 'global',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
    order: 80,
  },
  {
    year: 1864,
    title: 'Overarm bowling legalised',
    shortDescription:
      'Bowlers were permitted to raise the arm above the shoulder, after decades of dispute over underarm and roundarm actions. It is the change that produced fast bowling as the sport now understands it.',
    category: 'codification',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
    order: 90,
  },
  {
    year: 1877,
    title: 'The first Test match',
    shortDescription:
      'A Combined Australian XI beat James Lillywhite’s English XI by 45 runs at the Melbourne Cricket Ground, beginning 15 March 1877. Test status was conferred on it retrospectively; nobody present described it as a Test.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-test',
    order: 100,
  },
  {
    year: 1882,
    title: 'The Ashes',
    shortDescription:
      'After Australia won at The Oval on 29 August 1882, the Sporting Times printed a mock obituary for English cricket, saying the body would be cremated and "the ashes taken to Australia". The urn presented to Ivo Bligh on the following tour gave the fixture its name; accounts of when and where it was handed over disagree.',
    category: 'competition',
    certainty: 'disputed',
    sourceKey: 'wp-ashes',
    order: 110,
  },
  {
    year: 1909,
    title: 'The Imperial Cricket Conference',
    shortDescription:
      'England, Australia and South Africa founded the body that governs international cricket today. It became the International Cricket Conference in 1965 and the International Cricket Council in 1987, the renamings tracking its shift from an imperial club to a global governing body.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-icc',
    order: 120,
  },
  {
    year: 1926,
    title: 'The Women’s Cricket Association',
    shortDescription:
      'Founded in England to organise a game that had been played for nearly two centuries without a governing body. It ran women’s cricket in England until its functions were absorbed by the ECB in 1998.',
    category: 'womens',
    sourceKey: 'wp-womens',
    order: 130,
  },
  {
    year: 1934,
    title: 'The first women’s Test match',
    shortDescription:
      'England played Australia on the 1934-35 tour, in the first women’s Test. Women’s Test cricket has remained rare: a handful of matches a decade, which is why women’s careers are measured mainly in limited-overs cricket.',
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-womens',
    order: 140,
  },
  {
    year: 1947,
    title: 'First-class cricket formally defined',
    shortDescription:
      'The ICC set out what counts as first-class: at least three days, eleven a side, two innings each. The definition matters because it is what makes a career statistic comparable, and because it establishes that Test cricket is a subset of first-class cricket rather than a separate thing.',
    category: 'governance',
    sourceKey: 'wp-first-class',
    order: 150,
  },
  {
    year: 1971,
    title: 'The first One Day International',
    shortDescription:
      'Rain washed out the first three days of a Test at Melbourne, so the sides played a 40-over-a-side match on 5 January 1971 instead. Australia won, 46,000 people watched, and the limited-overs international existed by accident.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-odi',
    order: 160,
  },
  {
    year: 1973,
    title: 'The first Cricket World Cup was the women’s',
    shortDescription:
      'England hosted and won the inaugural Women’s Cricket World Cup, two years before the first men’s tournament. It is a straightforward matter of record and routinely got wrong: the men’s 1975 event was the second World Cup in cricket, not the first.',
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-womens-wc-1973',
    order: 170,
  },
  {
    year: 1975,
    title: 'The first men’s Cricket World Cup',
    shortDescription:
      'Held in England and won by the West Indies, played over 60 overs a side. It established the one-day international tournament as the sport’s largest event.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-odi',
    order: 180,
  },
  {
    year: 1977,
    endYear: 1979,
    title: 'World Series Cricket',
    shortDescription:
      'Kerry Packer signed many of the world’s leading players to a rival competition after losing a broadcast rights bid. It lasted two seasons and left the sport permanently altered: coloured clothing, white balls, floodlit matches, multiple camera angles, on-screen graphics, and players paid something closer to their commercial worth.',
    category: 'professionalism',
    isMajorMilestone: true,
    sourceKey: 'wp-odi',
    order: 190,
  },
  {
    year: 2003,
    title: 'Twenty20 introduced',
    shortDescription:
      'England’s counties launched a 20-over competition to bring crowds back to domestic cricket in an evening-sized format. It worked, and within a decade it had reorganised the professional game around itself.',
    category: 'competition',
    isMajorMilestone: true,
    sourceKey: 'wp-t20',
    order: 200,
  },
  {
    year: 2005,
    title: 'The first Twenty20 Internationals',
    shortDescription:
      'Australia played New Zealand at Auckland in the first men’s T20I in February 2005. The first women’s T20I had already been played, England against New Zealand in August 2004.',
    category: 'competition',
    sourceKey: 'wp-t20',
    order: 210,
  },
  {
    year: 2007,
    endYear: 2009,
    title: 'T20 World Cups, and franchise cricket',
    shortDescription:
      'India won the first men’s World Twenty20 in South Africa in 2007; the Indian Premier League followed in 2008 and established the franchise league as a permanent fixture of the calendar; the first women’s T20 World Cup was played in 2009.',
    category: 'professionalism',
    isMajorMilestone: true,
    sourceKey: 'wp-t20',
    order: 220,
  },
  {
    year: 2009,
    title: 'The Decision Review System',
    shortDescription:
      'Trialled in a Test series between India and Sri Lanka in 2008 and formally launched by the ICC in November 2009, DRS let players ask for an umpire’s decision to be reviewed on television evidence. Its adoption was uneven for years, and what it should cover is still argued about.',
    category: 'technology',
    isMajorMilestone: true,
    sourceKey: 'wp-drs',
    order: 230,
  },
  {
    year: 2014,
    title: 'Professional contracts for women',
    shortDescription:
      'The ECB awarded 18 central contracts to England’s women in May 2014, among the first full-time professional terms in women’s cricket. Other boards followed over the next decade, and the Women’s Premier League in India from 2023 brought franchise economics to the women’s game.',
    category: 'womens',
    isMajorMilestone: true,
    sourceKey: 'wp-wpl',
    order: 240,
  },
  {
    year: 2015,
    title: 'The first day-night Test',
    shortDescription:
      'Australia played New Zealand at Adelaide under lights with a pink ball in November 2015, the first change to the fundamental conditions of Test cricket in a very long time, and an attempt to put the longest format in front of an evening audience.',
    category: 'technology',
    sourceKey: 'wp-test',
    order: 250,
  },
  {
    year: 2028,
    title: 'Cricket returns to the Olympics',
    shortDescription:
      'Cricket was played at the 1900 Paris Games and then not again. It returns at Los Angeles 2028 as a six-team Twenty20 event for both men and women, with squads of fifteen, which the ICC treats as its principal route into markets where the sport is not established.',
    category: 'global',
    isMajorMilestone: true,
    sourceKey: 'icc-la28',
    order: 260,
  },
];

/**
 * Governance.
 *
 * Structurally unlike football's, and the difference is the reason
 * `membershipTier` was added to the table. FIFA sits above six confederations
 * that divide the world geographically and are peers of one another. The ICC
 * has regional development bodies too, but its meaningful division is by
 * *membership class*: Full Membership is what confers Test status, and the
 * twelve Full Members are not a geographic grouping.
 *
 * Member counts come from the ICC's own members page and are stored with the
 * date they were read. Wikipedia, two aggregators and the ICC gave four
 * different totals, and the ICC's own figure is the only one worth publishing.
 */
export const CRICKET_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'icc',
    shortName: 'ICC',
    name: 'International Cricket Council',
    level: 'world',
    foundedYear: 1909,
    headquarters: 'Dubai, United Arab Emirates',
    websiteUrl: 'https://www.icc-cricket.com',
    externalId: 'Q188496',
    order: 10,
  },
  {
    slug: 'icc-africa',
    shortName: 'ICC Africa',
    name: 'ICC Africa',
    level: 'continental',
    parentSlug: 'icc',
    region: 'Africa',
    websiteUrl: 'https://www.icc-cricket.com',
    order: 20,
  },
  {
    slug: 'icc-americas',
    shortName: 'ICC Americas',
    name: 'ICC Americas',
    level: 'continental',
    parentSlug: 'icc',
    region: 'North, Central and South America, Caribbean',
    websiteUrl: 'https://www.icc-cricket.com',
    order: 30,
  },
  {
    slug: 'icc-asia',
    shortName: 'ICC Asia',
    name: 'ICC Asia',
    level: 'continental',
    parentSlug: 'icc',
    region: 'Asia',
    websiteUrl: 'https://www.icc-cricket.com',
    order: 40,
  },
  {
    slug: 'icc-east-asia-pacific',
    shortName: 'ICC EAP',
    name: 'ICC East Asia-Pacific',
    level: 'continental',
    parentSlug: 'icc',
    region: 'East Asia and the Pacific',
    websiteUrl: 'https://www.icc-cricket.com',
    order: 50,
  },
  {
    slug: 'icc-europe',
    shortName: 'ICC Europe',
    name: 'ICC Europe',
    level: 'continental',
    parentSlug: 'icc',
    region: 'Europe',
    websiteUrl: 'https://www.icc-cricket.com',
    order: 60,
  },
];

/**
 * ICC membership classes.
 *
 * Kept separate from `CRICKET_GOVERNANCE` because they are not bodies in the
 * hierarchy: they are classes of membership within it, and modelling them as
 * children of the ICC alongside the regions would say something false about
 * both. Rendered as its own block, with the as-of date attached.
 */
export interface MembershipTierSeed {
  tier: string;
  label: string;
  count: number;
  /** ISO date the count was read from the source. */
  asOf: string;
  description: string;
  sourceKey: string;
  order: number;
}

export const CRICKET_MEMBERSHIP: MembershipTierSeed[] = [
  {
    tier: 'full',
    label: 'Full Members',
    count: 12,
    asOf: '2026-08-23',
    description:
      'The boards entitled to play Test cricket: Australia, England, India, New Zealand, Pakistan, South Africa, Sri Lanka, West Indies, Zimbabwe, Bangladesh, and Ireland and Afghanistan, both admitted in 2017. The West Indies is a board representing several countries rather than one, which is why cricket’s international sides do not map cleanly onto nations.',
    sourceKey: 'icc-members',
    order: 10,
  },
  {
    tier: 'associate',
    label: 'Associate Members',
    count: 94,
    asOf: '2026-08-23',
    description:
      'Boards recognised by the ICC without Test status. All hold T20I status, so the great majority of cricket-playing countries meet each other in Twenty20 rather than in the longer formats. Membership changes as boards are admitted, suspended or expelled.',
    sourceKey: 'icc-members',
    order: 20,
  },
];

/**
 * Authored sections.
 *
 * Written for SportBrainHQ from verified facts, in the same plain register as
 * the football sections. Rules are named but not taught: every time a sentence
 * started to explain lbw or the follow-on it was cut, because that is the
 * Explainers' job and the boundary is the point.
 */
export const CRICKET_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is cricket?',
    order: 10,
    body: `Cricket is a bat-and-ball team sport played between two sides of eleven. One side bats, trying to score runs; the other bowls and fields, trying to stop them and to get the batters out. When ten of the batting side's eleven have been dismissed, or an agreed number of overs has been bowled, the sides swap roles. The side with more runs at the end wins.

Almost everything happens on the **pitch**, a prepared strip 22 yards long at the centre of the ground, with a **wicket** of three wooden stumps at each end. A bowler runs up and delivers the ball, with a straight arm, towards the batter defending the far wicket. The batter tries to score, either by hitting the ball and running between the wickets, or by sending it to the boundary for four or six. The bowler tries to hit the wicket, have the batter caught, or otherwise dismiss them. Deliveries are grouped into **overs** of six, and a team's turn at batting is an **innings**.

What makes cricket unusual is that this one set of rules produces games of wildly different lengths. A **Test match** runs for up to five days and can still end without a winner. A **Twenty20** is finished in about three hours. Both are cricket, played under the same Laws, and a player's record in one says little about their record in the other.

The sport is organised on two levels that share the same players. **International cricket** is played between national sides under the International Cricket Council. **Domestic cricket** runs inside each country, in structures that differ from one to the next, and now includes franchise leagues whose teams exist only for their own competition. Cricket is played seriously in roughly a hundred countries, with its largest followings in South Asia, and it is the second most watched sport in the world.`,
  },
  {
    kind: 'basics',
    heading: 'How cricket works',
    order: 20,
    body: `The game is a loop, and the loop is short.

**A bowler delivers the ball.** Six legal deliveries make an **over**, after which a different bowler bowls the next over from the opposite end.

**The batter responds.** They may leave the ball, block it, or hit it. Runs come from running between the wickets, or from reaching the boundary: four along the ground, six over it.

**The fielding side tries to stop both.** Nine fielders and a wicketkeeper are placed to cut off runs and to create chances. Where they stand is the fielding captain's principal decision.

**Batters get out.** There are ten methods of dismissal in the Laws, though bowled, caught, leg before wicket, run out and stumped account for nearly all of them. A dismissal is also called "taking a wicket".

**Innings end,** when ten batters have been dismissed, when the overs run out, or when the batting captain declares in multi-day cricket.

**The format decides the result.** In limited-overs cricket someone almost always wins, because the innings has a hard end. In multi-day cricket time can simply run out, and the match is drawn.

**Who sets the rules.** The **Laws of Cricket** are owned by the Marylebone Cricket Club, not by the ICC, and there are 42 of them. Individual competitions then add **playing conditions** on top: over limits, fielding restrictions, review systems. A rule you see applied in an international match may come from either document, and the two are not interchangeable.`,
  },
  {
    kind: 'formats',
    heading: 'The formats, and how they relate',
    order: 30,
    body: `Cricket's formats are usually listed as three, which is roughly true of international cricket and misleading about the sport as a whole. The structure is better read as two questions asked separately: **how long is the match**, and **who is playing it**.

**How long.** Either the match is limited by time, giving each side two innings across three or more days, or it is limited by overs, giving each side one innings of a fixed length. That distinction decides whether a draw is possible, how batting is paced, and what a good average looks like.

**Who is playing.** Either the sides represent countries, or they do not. International status is granted by the ICC and is separate from the length of the match.

Cross the two and the real taxonomy appears. Multi-day cricket between countries is a **Test**; multi-day cricket domestically is **first-class**. One-day cricket between countries is an **ODI**; domestically it is **List A**. Twenty overs between countries is a **T20I**; below that it is domestic or franchise **T20**.

Getting this wrong is the most common error in cricket data, and it runs in one direction: treating the international format as though it covered the whole class. A County Championship match is first-class cricket and not a Test. Every ODI is a List A match, but most List A matches are not ODIs. The IPL is not international cricket. A career record that mixes these together is not a record of anything.`,
  },
  {
    kind: 'competitions',
    heading: 'International, domestic and franchise cricket',
    order: 40,
    body: `Three kinds of cricket run in parallel, and the same players move between them.

**International cricket** is played by sides representing a board recognised by the ICC. Most represent a single country; the **West Indies** represents a group of them, which is why cricket's international teams do not map neatly onto nations. It comes in two shapes: **bilateral** series, where two countries play an agreed run of Tests, ODIs or T20Is, and **tournaments**, either the ICC's global events or regional competitions such as the Asia Cup, alongside the qualifying pathways beneath them.

**Domestic cricket** is what each board runs inside its own jurisdiction, and the structures genuinely differ. England has **counties**, Australia **states**, India **states and regions**, South Africa **provinces**, the West Indies **territories**. Most boards run a first-class competition, a one-day competition and a T20 competition, but the number of teams, the calendar and the qualification rules are local decisions rather than a global template.

**Franchise cricket** is newer and needs care. A franchise team is created for a competition and owned within it, rather than being an existing club or representative side that entered. The IPL, the Big Bash and the Caribbean Premier League work this way; the T20 Blast does not, because its teams are the same counties that play first-class cricket. **Not all domestic T20 is franchise T20**, and treating the two as one is a mistake that misdescribes most of the world's domestic competitions.`,
  },
  {
    kind: 'evolution',
    heading: 'How cricket has changed',
    order: 50,
    body: `**Codification.** The 1744 Laws and the first MCC code of 1788 turned local custom into a game that could be played the same way anywhere. Later revisions changed the sport substantially: lbw in 1774, and overarm bowling in 1864, which created fast bowling as it is now understood.

**Shortening.** For most of its history cricket meant multi-day cricket. The one-day international arrived in 1971 by accident, when rain destroyed a Test. Twenty20 arrived in 2003 by design, to sell tickets on weekday evenings. Each new format took audience and money from the older ones rather than simply adding to them, and the calendar has been contested ever since.

**Professionalisation.** World Series Cricket broke the sport open in 1977, and the changes it forced were commercial and visual at once: coloured clothing, white balls, floodlights, television built for the audience rather than the members' pavilion. Franchise leagues from 2008 completed the shift, making a player's most lucrative employer a club rather than a country.

**Equipment and safety.** Helmets arrived in the late 1970s and are now mandatory in most cricket against fast bowling. Bats, pads and gloves have all changed enough to alter what shots are playable.

**Technology in officiating.** Television replays, ball-tracking and edge detection moved from broadcast entertainment to formal decision-making with the Decision Review System in 2009. What the technology should be allowed to decide is still an open argument.

**Data.** Ball-by-ball records exist for a large share of professional cricket, and analysis of them has changed field settings, batting order and bowling plans. It has also changed what statistics mean: a strike rate mattered little in 1970 and is central now.`,
  },
  {
    kind: 'womens',
    heading: "Women's cricket",
    order: 60,
    body: `Women's cricket is not a recent addition to the sport. The first recorded match was played in Surrey in 1745, within a year of the first general code of Laws, and organised women's cricket has existed continuously in some form since.

What it lacked for most of that time was institutional support. The Women's Cricket Association was not founded until 1926, the first women's Test was played in 1934, and for decades players funded their own tours. The consequences are still visible in the record: women's Test cricket has always been rare, a few matches a decade, so women's careers are measured mainly in one-day and Twenty20 cricket. Comparing a men's and a women's Test record is comparing a long series with a short one.

One fact is worth stating plainly because it is so often reversed. **The first Cricket World Cup was the women's, held in England in 1973 and won by England.** The men's tournament followed in 1975. The women's event was first.

Professionalisation came late and then quickly. The ECB awarded central contracts to England's players in 2014, and other boards followed. Domestic competitions have been rebuilt around professional terms, and the Women's Premier League in India, from 2023, brought franchise economics to the women's game. Attendance and broadcast figures have risen sharply, from a low base.

SportBrainHQ treats women's cricket as cricket. Gender is a property of a competition or a team, never of the sport, so a women's tournament sits in the same structures as any other rather than in a separate annex.`,
  },
  {
    kind: 'global',
    heading: 'Cricket around the world',
    order: 70,
    body: `Cricket's global shape is unusual: a small number of countries play all three formats, and a large number play only the shortest.

The ICC divides its members into two classes. **Full Members** are the twelve boards entitled to play Test cricket. **Associate Members** are the rest, recognised by the ICC without Test status. Because the ICC granted T20I status to all its members, Twenty20 is the format in which most cricketing nations actually meet, and it is the format through which the sport grows.

Beneath that, five regional bodies cover Africa, the Americas, Asia, East Asia-Pacific and Europe, and run development and qualifying competitions.

The distribution of interest is lopsided in a way no other major sport quite matches. **South Asia** contains the sport's largest audiences and, through the Indian market, most of its revenue, which shapes the calendar and where players earn. **Australia, England, New Zealand and South Africa** hold the older Test-playing structures. The **West Indies** competes as a single side drawn from many countries. **Ireland and Afghanistan** are the newest Full Members, admitted in 2017. And cricket is played competitively in places rarely associated with it, from Nepal to the Netherlands to the United States, almost entirely in white-ball formats.

Cricket returns to the Olympic Games at Los Angeles 2028, as a six-team Twenty20 event for men and women. It was played at the Games once before, in 1900.`,
  },
];
