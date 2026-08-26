/**
 * Basketball overview content.
 *
 * The third sport through the same machinery as football and cricket, and
 * deliberately not a translation of either. Nothing here is new architecture:
 * the seed shapes come from `football-overview.ts`, the taxonomy and concept
 * shapes from `cricket-overview.ts`, and the page renders them with the same
 * sport-agnostic components.
 *
 * ## Basketball is not the NBA
 *
 * The single largest risk in writing this page is letting one league stand in
 * for the sport. The NBA is the most-watched basketball competition in the
 * world and is treated as such, but it is one competition inside a structure
 * that also contains FIBA, the Olympics, EuroLeague, the NCAA, the WNBA and
 * dozens of domestic leagues. The governance tree is therefore rooted at FIBA
 * rather than at the NBA, the formats taxonomy carries 3x3 and wheelchair
 * basketball as first-class nodes, and the timeline dates FIBA's founding and
 * the Olympic debut alongside the NBA's.
 *
 * ## On sourcing
 *
 * Dates and figures were checked at authoring time rather than recalled, and
 * the checking changed several entries:
 *
 *   - The first game was played **9 a side**, not 5. Naismith had a class of
 *     eighteen and divided it in two. Five-a-side was not fixed until later,
 *     so the "5 players" fact and the "9 v 9" history entry are both correct
 *     and are kept distinct rather than reconciled.
 *   - Basketball was invented in **December 1891** and the rules were published
 *     in **January 1892**. These are two events a month apart, not one, and
 *     collapsing them loses the distinction between inventing a game and
 *     codifying it.
 *   - **1976** carries two unrelated milestones: the ABA–NBA merger and the
 *     women's Olympic debut. Both are correct. They are listed as separate
 *     entries because they share nothing but a year.
 *   - The **NBA dates from 1949**, when the BAA (founded 1946) merged with the
 *     NBL (founded 1937). The NBA counts the BAA's seasons as its own, which is
 *     why "founded 1946" and "founded 1949" both circulate. Both dates appear
 *     below, each described as what it actually was.
 *   - The **three-point line** was used by the ABA from 1967 and adopted by the
 *     NBA for 1979/80. FIBA adopted it in 1984. Writing "the three-pointer was
 *     introduced in 1979" without qualification credits the NBA with someone
 *     else's innovation.
 *
 * Claims that could not be verified are absent rather than hedged. The
 * frequently repeated figure for the number of basketball players worldwide
 * does not appear, because the sources for it disagree by hundreds of millions
 * and none of them shows its working.
 *
 * ## Court and ball dimensions differ by governing body
 *
 * A FIBA court is 28 x 15 m; an NBA court is 94 x 50 ft (28.65 x 15.24 m).
 * They are close but not identical, and the facts below say which is which
 * rather than presenting one as "the" court size. The same applies to quarter
 * length (10 minutes under FIBA, 12 in the NBA), which is the single most
 * common source of confusion for a newcomer moving between the two.
 */

import type { GoverningBodySeed, SectionSeed, SourceSeed, TimelineSeed } from './football-overview';
import type { ConceptSeed, FactSeed, FormatSeed, MembershipTierSeed } from './cricket-overview';

export const BASKETBALL_SOURCES: SourceSeed[] = [
  {
    key: 'wp-basketball',
    provider: 'wikipedia',
    title: 'Basketball',
    url: 'https://en.wikipedia.org/wiki/Basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-history',
    provider: 'wikipedia',
    title: 'History of basketball',
    url: 'https://en.wikipedia.org/wiki/History_of_basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-naismith',
    provider: 'wikipedia',
    title: 'James Naismith',
    url: 'https://en.wikipedia.org/wiki/James_Naismith',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-original-rules',
    provider: 'wikipedia',
    title: "Naismith's original rules of basketball",
    url: 'https://en.wikipedia.org/wiki/Naismith%27s_original_rules_of_basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-nba',
    provider: 'wikipedia',
    title: 'National Basketball Association',
    url: 'https://en.wikipedia.org/wiki/National_Basketball_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wnba',
    provider: 'wikipedia',
    title: "Women's National Basketball Association",
    url: 'https://en.wikipedia.org/wiki/Women%27s_National_Basketball_Association',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-fiba',
    provider: 'wikipedia',
    title: 'FIBA',
    url: 'https://en.wikipedia.org/wiki/FIBA',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-olympics',
    provider: 'wikipedia',
    title: 'Basketball at the Summer Olympics',
    url: 'https://en.wikipedia.org/wiki/Basketball_at_the_Summer_Olympics',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-world-cup',
    provider: 'wikipedia',
    title: 'FIBA Basketball World Cup',
    url: 'https://en.wikipedia.org/wiki/FIBA_Basketball_World_Cup',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-euroleague',
    provider: 'wikipedia',
    title: 'EuroLeague',
    url: 'https://en.wikipedia.org/wiki/EuroLeague',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-ncaa',
    provider: 'wikipedia',
    title: 'NCAA Division I men’s basketball tournament',
    url: 'https://en.wikipedia.org/wiki/NCAA_Division_I_men%27s_basketball_tournament',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-3x3',
    provider: 'wikipedia',
    title: '3x3 basketball',
    url: 'https://en.wikipedia.org/wiki/3x3_basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-wheelchair',
    provider: 'wikipedia',
    title: 'Wheelchair basketball',
    url: 'https://en.wikipedia.org/wiki/Wheelchair_basketball',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-positions',
    provider: 'wikipedia',
    title: 'Basketball positions',
    url: 'https://en.wikipedia.org/wiki/Basketball_positions',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-shot-clock',
    provider: 'wikipedia',
    title: 'Shot clock',
    url: 'https://en.wikipedia.org/wiki/Shot_clock',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wp-three-point',
    provider: 'wikipedia',
    title: 'Three-point field goal',
    url: 'https://en.wikipedia.org/wiki/Three-point_field_goal',
    license: 'CC BY-SA 4.0',
  },
  {
    key: 'wd-basketball',
    provider: 'wikidata',
    title: 'basketball (Q5372)',
    url: 'https://www.wikidata.org/wiki/Q5372',
    externalId: 'Q5372',
    license: 'CC0',
  },
  {
    key: 'wd-fiba',
    provider: 'wikidata',
    title: 'FIBA (Q184023)',
    url: 'https://www.wikidata.org/wiki/Q184023',
    externalId: 'Q184023',
    license: 'CC0',
  },
  {
    key: 'wd-naismith',
    provider: 'wikidata',
    title: 'James Naismith (Q193803)',
    url: 'https://www.wikidata.org/wiki/Q193803',
    externalId: 'Q193803',
    license: 'CC0',
  },
  {
    key: 'fiba-rules',
    provider: 'fiba',
    title: 'FIBA Official Basketball Rules',
    url: 'https://www.fiba.basketball/en/official-basketball-rules',
    license: 'FIBA',
  },
  {
    key: 'fiba-about',
    provider: 'fiba',
    title: 'FIBA, About FIBA',
    url: 'https://www.fiba.basketball/en/fiba',
    license: 'FIBA',
  },
  {
    key: 'olympics-basketball',
    provider: 'olympics',
    title: 'Olympics.com, Basketball',
    url: 'https://www.olympics.com/en/sports/basketball/',
    license: 'IOC',
  },
];

/**
 * Quick facts.
 *
 * Two categories, because the page renders them as two different blocks: the
 * `identity` set is the compact strip under the hero (what the sport is, who
 * invented it, where and when), and `gameplay` is the "at a glance" grid that
 * lets a newcomer grasp the shape of a game in about ten seconds.
 *
 * Values that differ between governing bodies say so in the value rather than
 * picking a winner. A reader who watches both the NBA and the Olympics needs to
 * know that a quarter is not the same length in each, and a fact panel that
 * quietly reports one number teaches something that has to be unlearned.
 *
 * Well under the API's 40-fact ceiling, so nothing here is silently truncated.
 */
export const BASKETBALL_FACTS: FactSeed[] = [
  {
    key: 'sport_type',
    label: 'Sport type',
    value: 'Invasion team sport played on a court',
    category: 'identity',
    sourceKey: 'wp-basketball',
    order: 10,
  },
  {
    key: 'invented',
    label: 'Invented',
    value: 'December 1891',
    category: 'identity',
    sourceKey: 'wp-history',
    order: 20,
  },
  {
    key: 'inventor',
    label: 'Inventor',
    value: 'James Naismith',
    category: 'identity',
    sourceKey: 'wd-naismith',
    order: 30,
  },
  {
    key: 'origin',
    label: 'Origin',
    value: 'Springfield, Massachusetts, United States',
    category: 'identity',
    sourceKey: 'wp-naismith',
    order: 40,
  },
  {
    key: 'players_per_side',
    label: 'Players',
    value: '5 per team on court',
    category: 'identity',
    sourceKey: 'fiba-rules',
    order: 50,
  },
  {
    key: 'governing_body',
    label: 'Global governing body',
    value: 'FIBA',
    category: 'identity',
    sourceKey: 'fiba-about',
    order: 60,
  },
  {
    key: 'major_league',
    label: 'Major professional league',
    value: 'NBA',
    category: 'identity',
    sourceKey: 'wp-nba',
    order: 70,
  },
  {
    key: 'olympic_sport',
    label: 'Olympic sport',
    value: 'Yes, for men since 1936 and women since 1976',
    category: 'identity',
    sourceKey: 'wp-olympics',
    order: 80,
  },

  {
    key: 'on_court',
    label: 'Players on court',
    value: '5 v 5',
    category: 'gameplay',
    sourceKey: 'fiba-rules',
    order: 110,
  },
  {
    key: 'basket_height',
    label: 'Basket height',
    value: '10 ft (3.05 m)',
    category: 'gameplay',
    sourceKey: 'fiba-rules',
    order: 120,
  },
  {
    key: 'scoring',
    label: 'Scoring',
    value: '1 point, 2 points or 3 points',
    category: 'gameplay',
    sourceKey: 'fiba-rules',
    order: 130,
  },
  {
    key: 'game_length_nba',
    label: 'NBA game',
    value: 'Four 12-minute quarters',
    category: 'gameplay',
    sourceKey: 'wp-nba',
    order: 140,
  },
  {
    key: 'game_length_fiba',
    label: 'FIBA game',
    value: 'Four 10-minute quarters',
    category: 'gameplay',
    sourceKey: 'fiba-rules',
    order: 150,
  },
  {
    key: 'shot_clock',
    label: 'Shot clock',
    value: '24 seconds',
    category: 'gameplay',
    sourceKey: 'wp-shot-clock',
    order: 160,
  },
  {
    key: 'court_size',
    label: 'Court',
    value: '28 x 15 m (FIBA); 94 x 50 ft (NBA)',
    category: 'gameplay',
    sourceKey: 'fiba-rules',
    order: 170,
  },
  {
    key: 'olympic_debut',
    label: 'Olympic debut',
    value: '1936 (men), 1976 (women)',
    category: 'gameplay',
    sourceKey: 'wp-olympics',
    order: 180,
  },
];

/**
 * The timeline.
 *
 * Every entry marks a change in what the sport was or who could play it,
 * rather than a notable result. No championship appears here: a title is an
 * outcome inside the sport, not a change to it.
 *
 * Unlike football's, this timeline has a real origin point. Basketball has a
 * documented inventor, month and place, so nothing needs `approximate`
 * certainty. The one exception is the spread through schools and YMCA
 * networks, which happened over a decade and cannot be dated to a year.
 *
 * `isMajorMilestone` marks the entries that appear in the condensed strip at
 * the top of the page. Eight of them, chosen so that the strip alone tells a
 * coherent story: invention, world body, Olympics, NBA, shot clock, women's
 * Olympic basketball, the three-point line, and the WNBA.
 */
export const BASKETBALL_TIMELINE: TimelineSeed[] = [
  {
    year: 1891,
    title: 'James Naismith invents basketball',
    shortDescription:
      'A physical education instructor at the International YMCA Training School in Springfield, Massachusetts is asked for an indoor game that will keep students active through a New England winter without the injuries of indoor football. He nails a peach basket at each end of the gymnasium balcony and writes a game around them.',
    category: 'origins',
    isMajorMilestone: true,
    sourceKey: 'wp-history',
    order: 10,
  },
  {
    year: 1892,
    title: 'The thirteen original rules are published',
    shortDescription:
      'Naismith’s rules appear in the school newspaper in January 1892, a month after the first game. They are strikingly short: no dribbling, no running with the ball, and a goal scored from the floor counts the same wherever it is taken from. Most of what follows in this timeline is the sport working out what those rules left open.',
    category: 'origins',
    sourceKey: 'wp-original-rules',
    order: 20,
  },
  {
    year: 1895,
    endYear: 1910,
    title: 'The game spreads through schools, colleges and the YMCA',
    shortDescription:
      'Because the YMCA trained instructors who then dispersed internationally, basketball travelled unusually fast for a new sport, reaching Europe, Asia and South America within a few years of its invention. College basketball took hold in the United States over the same period.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-history',
    order: 30,
  },
  {
    year: 1932,
    title: 'FIBA is founded',
    shortDescription:
      'Eight national federations form an international governing body in Geneva, giving the sport a single authority for rules and international competition. FIBA still performs that role, and its rules govern the Olympics, the World Cup and most domestic leagues outside North America.',
    category: 'governance',
    isMajorMilestone: true,
    sourceKey: 'wp-fiba',
    order: 40,
  },
  {
    year: 1936,
    title: 'Men’s basketball becomes an Olympic medal sport',
    shortDescription:
      'Basketball is contested for medals at the Berlin Games, forty-five years after its invention. Naismith is present to watch. The Olympic tournament gives the sport a global stage that no single league could provide.',
    category: 'international',
    isMajorMilestone: true,
    sourceKey: 'wp-olympics',
    order: 50,
  },
  {
    year: 1946,
    title: 'The Basketball Association of America is founded',
    shortDescription:
      'Arena owners in the north-eastern United States and Canada form a professional league to fill their buildings on nights without hockey. The BAA is the direct ancestor of the NBA, which is why the NBA counts its history from 1946 rather than 1949.',
    category: 'professional',
    sourceKey: 'wp-nba',
    order: 60,
  },
  {
    year: 1949,
    title: 'The BAA and NBL merge to form the NBA',
    shortDescription:
      'The BAA absorbs the older National Basketball League and the combined competition is renamed the National Basketball Association. Both founding dates circulate for this reason: 1946 is when the surviving organisation began, 1949 is when it took its present name and shape.',
    category: 'professional',
    isMajorMilestone: true,
    sourceKey: 'wp-nba',
    order: 70,
  },
  {
    year: 1954,
    title: 'The NBA introduces the 24-second shot clock',
    shortDescription:
      'A team in front could previously hold the ball indefinitely, and games had become unwatchable. Requiring a shot attempt within 24 seconds forced continuous attacking play and is generally regarded as the single change that made professional basketball a spectator sport. FIBA adopted a shot clock over the following years.',
    category: 'rules',
    isMajorMilestone: true,
    sourceKey: 'wp-shot-clock',
    order: 80,
  },
  {
    year: 1967,
    title: 'The ABA adopts the three-point line',
    shortDescription:
      'The rival American Basketball Association uses a three-point arc, along with a red, white and blue ball and a more improvisational style. The innovation is the ABA’s rather than the NBA’s, which is worth recording precisely because the NBA is usually given the credit.',
    category: 'rules',
    sourceKey: 'wp-three-point',
    order: 90,
  },
  {
    year: 1976,
    title: 'Women’s basketball becomes an Olympic sport',
    shortDescription:
      'Women contest Olympic basketball for the first time at the Montreal Games, forty years after the men. The delay is a fact about the Olympic programme rather than about the sport: women had been playing organised basketball since the 1890s.',
    category: 'international',
    isMajorMilestone: true,
    sourceKey: 'wp-olympics',
    order: 100,
  },
  {
    year: 1976,
    title: 'The ABA–NBA merger',
    shortDescription:
      'Four ABA franchises join the NBA and the rival league folds. The merger brings the ABA’s players and much of its style with it, though the NBA declines to adopt the three-point line for another three years.',
    category: 'professional',
    sourceKey: 'wp-nba',
    order: 110,
  },
  {
    year: 1979,
    title: 'The NBA adopts the three-point line',
    shortDescription:
      'Introduced for the 1979/80 season, initially as an experiment and treated for years as a novelty shot. Its consequences took three decades to arrive in full, and are the subject of the modern game’s largest tactical change. FIBA followed in 1984.',
    category: 'rules',
    isMajorMilestone: true,
    sourceKey: 'wp-three-point',
    order: 120,
  },
  {
    year: 1992,
    title: 'Professionals enter Olympic basketball',
    shortDescription:
      'A rule change allows NBA players into the Olympic tournament, and the United States team at Barcelona becomes the most-watched basketball side ever assembled. Its effect was less on the result than on the audience: a generation outside North America saw the sport played at its highest level for the first time.',
    category: 'international',
    sourceKey: 'wp-olympics',
    order: 130,
  },
  {
    year: 1997,
    title: 'The WNBA begins play',
    shortDescription:
      'A professional women’s league backed by the NBA tips off with eight teams. It is not the first attempt at a professional women’s league in the United States, but it is the one that lasted, and it remains the most prominent worldwide.',
    category: 'professional',
    isMajorMilestone: true,
    sourceKey: 'wp-wnba',
    order: 140,
  },
  {
    year: 2000,
    endYear: 2026,
    title: 'The game becomes genuinely global',
    shortDescription:
      'International players move from novelty to the centre of the professional game, winning league honours and carrying national teams deep into major tournaments. Domestic leagues across Europe, Asia, Africa and Oceania professionalise over the same period, and player development stops running exclusively through the American college system.',
    category: 'growth',
    certainty: 'approximate',
    sourceKey: 'wp-basketball',
    order: 150,
  },
  {
    year: 2021,
    title: '3x3 basketball debuts at the Olympics',
    shortDescription:
      'The half-court, three-a-side format is contested for medals at the Tokyo Games, having been formalised by FIBA over the preceding decade. It is a separate Olympic discipline rather than a variant of the main tournament.',
    category: 'international',
    sourceKey: 'wp-3x3',
    order: 160,
  },
];

/**
 * Governance.
 *
 * Rooted at FIBA rather than the NBA, which is the structurally correct answer
 * and also the one that stops this page becoming an NBA page. The NBA is a
 * competition, not a governing body: it sets its own playing rules, but it does
 * not govern basketball, and its players compete internationally under FIBA's
 * rules rather than its own.
 *
 * The five continental bodies are FIBA's own regional zones. They are listed
 * with the regions they cover rather than member counts, because FIBA's
 * per-zone membership figures move as federations are admitted or suspended,
 * and an unsourced count that drifts is worse than no count.
 */
export const BASKETBALL_GOVERNANCE: GoverningBodySeed[] = [
  {
    slug: 'fiba',
    shortName: 'FIBA',
    name: 'International Basketball Federation',
    level: 'world',
    foundedYear: 1932,
    headquarters: 'Mies, Switzerland',
    websiteUrl: 'https://www.fiba.basketball/',
    externalId: 'Q184023',
    order: 10,
  },
  {
    slug: 'fiba-africa',
    shortName: 'FIBA Africa',
    name: 'FIBA Africa',
    level: 'continental',
    parentSlug: 'fiba',
    region: 'Africa',
    order: 20,
  },
  {
    slug: 'fiba-americas',
    shortName: 'FIBA Americas',
    name: 'FIBA Americas',
    level: 'continental',
    parentSlug: 'fiba',
    region: 'North, Central and South America and the Caribbean',
    order: 30,
  },
  {
    slug: 'fiba-asia',
    shortName: 'FIBA Asia',
    name: 'FIBA Asia',
    level: 'continental',
    parentSlug: 'fiba',
    region: 'Asia and the Middle East',
    order: 40,
  },
  {
    slug: 'fiba-europe',
    shortName: 'FIBA Europe',
    name: 'FIBA Europe',
    level: 'continental',
    parentSlug: 'fiba',
    region: 'Europe',
    order: 50,
  },
  {
    slug: 'fiba-oceania',
    shortName: 'FIBA Oceania',
    name: 'FIBA Oceania',
    level: 'continental',
    parentSlug: 'fiba',
    region: 'Australia, New Zealand and the Pacific islands',
    order: 60,
  },
];

/**
 * Membership.
 *
 * One tier only. Unlike cricket, FIBA does not grade its members into classes
 * that determine what they are entitled to play, so there is nothing to
 * enumerate beyond the total. It is recorded with an as-of date for the same
 * reason cricket's is: the figure moves.
 */
export const BASKETBALL_MEMBERSHIP: MembershipTierSeed[] = [
  {
    tier: 'national-federations',
    label: 'National federations',
    count: 212,
    asOf: '2026-08-26',
    description:
      'FIBA recognises one national federation per territory, each affiliated to one of the five continental zones. Unlike some governing bodies, FIBA does not divide its members into classes with different playing entitlements: a federation is a member or it is not.',
    sourceKey: 'fiba-about',
    order: 10,
  },
];

/**
 * The formats taxonomy.
 *
 * Basketball's taxonomy is shallower than cricket's, because the sport does not
 * have cricket's trap of near-identical formats at different levels. What it
 * does have is genuinely distinct disciplines that a newcomer may not realise
 * are separate competitions rather than variants: 3x3 has its own rules, its
 * own World Cup and its own Olympic tournament, and wheelchair basketball is
 * governed by its own international federation.
 *
 * `matchClass` distinguishes the discipline; `isInternational` is left unset on
 * grouping nodes, where the question does not apply. The cricket-specific
 * fields (`oversPerSide`, `inningsPerSide`, `maxDays`, `drawPossible`) are
 * omitted throughout: they are meaningless for basketball, and the taxonomy
 * component renders only the fields that are present.
 */
export const BASKETBALL_FORMATS: FormatSeed[] = [
  {
    key: 'five-a-side',
    label: 'Five-a-side basketball',
    matchClass: 'full-court',
    description:
      'The standard competitive format: five players a side on a full court, four quarters, and the format used by every major professional league and by the main Olympic and World Cup tournaments.',
    conditionsAuthority: 'fiba',
    sourceKey: 'fiba-rules',
    order: 10,
  },
  {
    key: 'five-a-side-international',
    label: 'International basketball',
    parentKey: 'five-a-side',
    matchClass: 'full-court',
    isInternational: true,
    description:
      'National teams under FIBA rules: four 10-minute quarters, a 28 x 15 m court, and the arc at 6.75 m. The Olympic tournament, the World Cup and the continental championships are all played this way.',
    conditionsAuthority: 'fiba',
    sourceKey: 'fiba-rules',
    order: 20,
  },
  {
    key: 'five-a-side-professional',
    label: 'Professional club basketball',
    parentKey: 'five-a-side',
    matchClass: 'full-court',
    isInternational: false,
    description:
      'Domestic and cross-border club leagues. Most play under FIBA rules; the NBA and WNBA use their own, with 12-minute quarters in the NBA and a slightly larger court. The differences are real but small enough that players move between the two.',
    conditionsAuthority: 'league',
    sourceKey: 'wp-nba',
    order: 30,
  },
  {
    key: 'five-a-side-college',
    label: 'College basketball',
    parentKey: 'five-a-side',
    matchClass: 'full-court',
    isInternational: false,
    description:
      'University competition, most prominently the NCAA in the United States, which plays two 20-minute halves rather than quarters in the men’s game and functions as a primary development route into the professional leagues.',
    conditionsAuthority: 'ncaa',
    sourceKey: 'wp-ncaa',
    order: 40,
  },
  {
    key: 'three-by-three',
    label: '3x3 basketball',
    matchClass: 'half-court',
    isInternational: true,
    description:
      'Three players a side on a half court with one basket, a 12-second shot clock, and a game won by reaching 21 points or leading after 10 minutes. Shots inside the arc score one point and those outside score two. A separate FIBA discipline with its own World Cup, and an Olympic sport since 2021.',
    conditionsAuthority: 'fiba',
    sourceKey: 'wp-3x3',
    order: 50,
  },
  {
    key: 'wheelchair',
    label: 'Wheelchair basketball',
    matchClass: 'full-court',
    isInternational: true,
    description:
      'One of the largest adaptive team sports in the world, played on a full court at standard basket height under a player classification system that balances each lineup. Governed internationally by the IWBF and contested at the Paralympic Games since 1960.',
    conditionsAuthority: 'iwbf',
    sourceKey: 'wp-wheelchair',
    order: 60,
  },
  {
    key: 'streetball',
    label: 'Streetball',
    matchClass: 'informal',
    isInternational: false,
    description:
      'Informal basketball played on outdoor courts, typically half-court and without officials. Not a governed competition, but a genuine part of how the sport is played and learned, and a substantial influence on its culture and style.',
    sourceKey: 'wp-basketball',
    order: 70,
  },
];

/**
 * The vocabulary.
 *
 * Two groups, both rendered by `ConceptGrid`: the five traditional positions,
 * and the terms a newcomer needs before anything else on the page parses.
 *
 * Each is one sentence. The brief for this page is that it introduces terms and
 * the explainers teach them, and the hardest part of writing this list was
 * leaving things out: what a screen is, when the shot clock resets, why a
 * switch happens. All of that belongs in Explainers, and `explainerSlug` points
 * at the article that will teach it. The API checks whether that explainer
 * exists before linking, so naming one that has not been written yet is safe.
 *
 * The positions carry an `ambiguityNote` where the traditional definition no
 * longer describes what the role actually is. That is not a hedge: modern
 * basketball really has moved away from fixed positions, and a page that
 * presents the five as rigid categories teaches a model of the sport that
 * televised basketball will immediately contradict.
 */
export const BASKETBALL_CONCEPTS: ConceptSeed[] = [
  {
    key: 'point-guard',
    term: 'Point guard (PG)',
    summary:
      'Usually brings the ball up the court and organises the offence, deciding what the team runs and when.',
    category: 'positions',
    ambiguityNote:
      'Increasingly a description of a role rather than a player: many teams now share ball-handling duties across several players.',
    explainerSlug: 'basketball-positions',
    sourceKey: 'wp-positions',
    order: 10,
  },
  {
    key: 'shooting-guard',
    term: 'Shooting guard (SG)',
    summary:
      'Typically the primary perimeter scorer, working off the ball to create shooting opportunities.',
    category: 'positions',
    explainerSlug: 'basketball-positions',
    sourceKey: 'wp-positions',
    order: 20,
  },
  {
    key: 'small-forward',
    term: 'Small forward (SF)',
    summary:
      'The most generalist of the five, expected to score from distance and close to the basket and to defend several positions.',
    category: 'positions',
    explainerSlug: 'basketball-positions',
    sourceKey: 'wp-positions',
    order: 30,
  },
  {
    key: 'power-forward',
    term: 'Power forward (PF)',
    summary:
      'Traditionally a physical player near the basket, though the modern version is often required to shoot from the three-point line.',
    category: 'positions',
    ambiguityNote:
      'The role has changed more than any of the five: the "stretch four" who plays outside the arc barely resembles the position as it was played before the 2010s.',
    explainerSlug: 'basketball-positions',
    sourceKey: 'wp-positions',
    order: 40,
  },
  {
    key: 'center',
    term: 'Centre (C)',
    summary:
      'Traditionally operates closest to the basket, providing size, rebounding and rim protection.',
    category: 'positions',
    explainerSlug: 'basketball-positions',
    sourceKey: 'wp-positions',
    order: 50,
  },

  {
    key: 'field-goal',
    term: 'Field goal',
    summary:
      'Any shot made from open play, worth two points from inside the arc and three from outside it.',
    category: 'scoring',
    explainerSlug: 'how-basketball-scoring-works',
    sourceKey: 'fiba-rules',
    order: 110,
  },
  {
    key: 'free-throw',
    term: 'Free throw',
    summary: 'An unopposed shot from a fixed line, worth one point, awarded after certain fouls.',
    category: 'scoring',
    explainerSlug: 'how-basketball-scoring-works',
    sourceKey: 'fiba-rules',
    order: 120,
  },
  {
    key: 'three-pointer',
    term: 'Three-pointer',
    summary:
      'A field goal taken from beyond the arc, worth three points, and the shot that has reshaped how the modern game is played.',
    category: 'scoring',
    explainerSlug: 'the-three-point-line',
    sourceKey: 'wp-three-point',
    order: 130,
  },
  {
    key: 'possession',
    term: 'Possession',
    summary:
      'Control of the ball. It changes hands constantly, and every team is attacking one basket and defending the other within seconds of each other.',
    category: 'gameplay',
    sourceKey: 'wp-basketball',
    order: 140,
  },
  {
    key: 'shot-clock',
    term: 'Shot clock',
    summary:
      'The countdown a team has to attempt a shot once it gains possession: 24 seconds in the professional game.',
    category: 'gameplay',
    ambiguityNote:
      'The clock resets rather than stops in several situations, which is what the explainer covers.',
    explainerSlug: 'the-shot-clock',
    sourceKey: 'wp-shot-clock',
    order: 150,
  },
  {
    key: 'rebound',
    term: 'Rebound',
    summary:
      'Gathering the ball after a missed shot. Doing so at your own end ends the opponent’s attack; doing so at theirs earns another.',
    category: 'gameplay',
    sourceKey: 'wp-basketball',
    order: 160,
  },
  {
    key: 'assist',
    term: 'Assist',
    summary: 'A pass that leads directly to a teammate scoring.',
    category: 'gameplay',
    sourceKey: 'wp-basketball',
    order: 170,
  },
  {
    key: 'spacing',
    term: 'Spacing',
    summary:
      'How a team distributes its players across the court to open passing and driving lanes. The organising idea of modern offensive basketball.',
    category: 'tactics',
    explainerSlug: 'spacing-in-basketball',
    sourceKey: 'wp-basketball',
    order: 180,
  },
  {
    key: 'positionless',
    term: 'Positionless basketball',
    summary:
      'The modern tendency to select players by what they can do rather than by which of the five positions they nominally occupy.',
    category: 'tactics',
    explainerSlug: 'positionless-basketball',
    sourceKey: 'wp-positions',
    order: 190,
  },
];

/**
 * The authored prose.
 *
 * Fifteen sections, comfortably inside the API's twenty-section ceiling, so
 * nothing is silently dropped. Seven of them (`introduction`, `basics`,
 * `formats`, `competitions`, `evolution`, `womens`, `global`) use the kinds
 * football and cricket already use and render in the existing page slots. The
 * rest are basketball's own and render in a generic block, which is why they
 * are written to stand alone rather than depend on where they land.
 *
 * The prose is SportBrainHQ's own. Wikipedia is CC BY-SA, which covers
 * expression rather than fact, so the facts are used freely and the sentences
 * are written here.
 *
 * `**bold**` is the only markup the renderer supports, and it deliberately
 * injects no HTML.
 */
export const BASKETBALL_SECTIONS: SectionSeed[] = [
  {
    kind: 'introduction',
    heading: 'What is basketball?',
    order: 10,
    body: `Basketball is a team sport played between two sides of five players on a rectangular court. Each team attacks one basket and defends the other, and scores by putting the ball through the opponent's hoop, which sits ten feet above the floor. Whichever team has more points when time expires wins.

Points come in three sizes. A shot from open play is worth two points, or three if it is taken from beyond the arc painted on the floor. An unopposed free throw, awarded after certain fouls, is worth one. A game is divided into timed quarters, and a team must attempt a shot within twenty-four seconds of gaining the ball, so possession changes hands constantly and every player is attacking and defending within seconds of each other.

What makes the sport distinctive is how much it asks of the same players. Basketball has no specialists in the sense that other team sports do: the same five people shoot, pass, dribble, rebound and defend, and they do it in a confined space at close quarters. Skill, athleticism, positioning and quick tactical decisions all matter, and a team that is better at only one of them will usually lose to one that is balanced.`,
  },
  {
    kind: 'history',
    heading: 'How basketball began',
    order: 20,
    body: `Basketball has something almost no other major sport has: a documented inventor, a place and a month. In December 1891, James Naismith, a physical education instructor at the International YMCA Training School in Springfield, Massachusetts, was asked to devise an indoor activity that would keep a restless class active through the New England winter. Indoor versions of football and lacrosse had been tried and were producing injuries.

Naismith's solution was to remove the incentive to run at full speed with the ball, and to put the goal where force would not help. He asked the janitor for two boxes, was given peach baskets instead, and nailed one to the balcony rail at each end of the gymnasium. Because the target was above the players and horizontal rather than vertical, a shot had to be placed rather than driven, and because carrying the ball was forbidden, charging with it was pointless.

The first game was played with a soccer ball and eighteen students, nine to a side, since that was the size of the class rather than a considered choice about team size. Naismith wrote thirteen rules, published in the school newspaper the following month. They are remarkably brief, and much of what came later, dribbling, the shot clock, the three-point line, consists of the sport working out what those thirteen rules had left open.

It spread with unusual speed. The YMCA trained instructors who then took posts around the world, and basketball reached Europe, Asia and South America within a few years of being invented, which is a large part of why it became a global sport rather than a regional one.`,
  },
  {
    kind: 'basics',
    heading: 'How a game works',
    order: 30,
    body: `Two teams of five compete over four timed quarters: ten minutes each under FIBA rules, twelve in the NBA. The clock stops frequently, so a game takes considerably longer than the playing time suggests. If the scores are level at the end, teams play overtime periods until one leads.

A team in possession must attempt a shot that hits the rim within twenty-four seconds, or it loses the ball. This single rule is what gives basketball its rhythm: it guarantees a large number of possessions, and it is why a substantial deficit can be overturned quickly. Players move the ball by passing or by dribbling, and there are limits on both, along with a detailed system of fouls that can send a player to the free-throw line or, accumulated, off the court entirely.

Those limits are where the real complexity lives, and this page deliberately stops here. What counts as travelling, when the shot clock resets, how a defence switches assignments and why a foul in one situation gives free throws and in another does not are all worth understanding, and all covered properly in the explainers.`,
  },
  {
    kind: 'glance',
    heading: 'Basketball at a glance',
    order: 40,
    body: `The numbers above describe a standard game, and two of them come in pairs because basketball is governed in two places at once. FIBA sets the rules for international competition and for most leagues worldwide; the NBA and WNBA set their own. A FIBA quarter is ten minutes and an NBA quarter is twelve. A FIBA court is 28 by 15 metres and an NBA court is slightly larger. The three-point arc sits at a different distance in each.

None of these differences is large enough to make the two versions different sports, and players move between them routinely. But a newcomer who learns one set of numbers as **the** numbers will be confused the first time they watch the other, which is why both are given here.`,
  },
  {
    kind: 'structure',
    heading: 'How the basketball world is structured',
    order: 50,
    body: `Basketball's structure differs from football's and cricket's in an important way: there is no single pyramid. Four largely separate worlds run in parallel, and a player's career may pass through several of them.

**Professional club basketball** is the largest. Clubs compete in domestic leagues, the NBA and WNBA in North America, Liga ACB in Spain, the Basketball Bundesliga in Germany, LNB Élite in France, the NBL in Australia and dozens more, and the strongest European clubs also play cross-border competitions such as the EuroLeague at the same time as their domestic season.

**International basketball** runs on national teams under FIBA, culminating in the Olympic tournament and the FIBA Basketball World Cup, with continental championships in between. It occupies its own windows in the calendar rather than competing with club basketball for the same dates.

**College and university basketball** matters far more in the United States than almost anywhere else. The NCAA runs a competition that draws crowds and broadcast audiences most professional leagues would envy, and its knockout tournament, universally known as March Madness, is one of the largest annual events in American sport. For decades it was the primary route into the NBA.

**Development and youth basketball** is where the four worlds diverge most. The American model runs through high school and college; much of Europe develops players inside professional club academies from a young age; other countries rely on federation programmes or school systems. There is no single pathway, and assuming the American one is universal is the most common mistake made about how basketball players are produced.`,
  },
  {
    kind: 'nba',
    heading: 'The NBA',
    order: 60,
    body: `The NBA is the sport's largest and wealthiest professional league, and its cultural reach extends well beyond basketball. It began in 1946 as the Basketball Association of America, a venture by arena owners looking to fill their buildings, and took its present name in 1949 after merging with the older National Basketball League. Both dates are cited as its founding, for that reason.

Thirty teams compete, split between an Eastern and a Western Conference. A long regular season determines seeding; a knockout playoff follows, and the two conference winners meet in the NBA Finals. The league absorbed four teams from the rival ABA in 1976, and with them a more improvisational style and, eventually, the three-point line.

Its influence on how basketball is played, watched and marketed worldwide is difficult to overstate. But the NBA is one competition inside a much larger sport, and it does not govern basketball: its own players compete at the Olympics under FIBA's rules, not the NBA's.`,
  },
  {
    kind: 'international',
    heading: 'International basketball',
    order: 70,
    body: `International basketball is organised by FIBA, founded in 1932, which recognises a national federation in each of more than two hundred territories and groups them into five continental zones: Africa, the Americas, Asia, Europe and Oceania.

Two competitions sit at the top. **Olympic basketball** has been contested by men since 1936 and by women since 1976, and since 1992 has been open to professional players, which transformed its audience. The **FIBA Basketball World Cup** is the sport's dedicated world championship. Below them, each zone runs its own continental championship: EuroBasket, the AmeriCup, the Asia Cup and AfroBasket, which are the primary international competitions for most federations and qualifying routes to the global tournaments.

International basketball is played under FIBA's rules, which differ from the NBA's in quarter length, court dimensions, the distance of the three-point arc and several other respects. The differences are consequential enough that teams prepare for them specifically, and they are covered in the explainers rather than listed here.`,
  },
  {
    kind: 'formats',
    heading: 'Different forms of basketball',
    order: 80,
    body: `Five-a-side on a full court is the standard competitive format, but it is not the only basketball that is played seriously.

**3x3** is three players a side on a half court with a single basket, a twelve-second shot clock, and a game that ends when a team reaches twenty-one points or when ten minutes expire. Shots score one and two points rather than two and three. It is a distinct FIBA discipline with its own World Cup, and has been an Olympic sport since 2021.

**Wheelchair basketball** is among the largest adaptive team sports in the world, played on a full-size court at standard basket height, with a classification system that balances the make-up of each lineup. It has been contested at the Paralympic Games since 1960 and has its own international federation.

**Streetball** is not a governed competition at all, but it is where a great many players learn the game, and its influence on basketball's style and culture is real enough that leaving it out would misrepresent the sport.`,
  },
  {
    kind: 'competitions',
    heading: 'Major competitions',
    order: 90,
    body: `The **NBA** and the **WNBA** are the leading professional leagues in North America. The **EuroLeague** is the strongest cross-border club competition in Europe, contested alongside domestic leagues such as Spain's **Liga ACB**, and Australia's **NBL** is the most prominent in Oceania. The **Basketball Africa League**, founded in 2021, is the newest of the major continental club competitions.

**NCAA Division I** basketball is the leading college competition, and its knockout tournament is among the largest annual events in American sport.

In the international game, **Olympic basketball** and the **FIBA Basketball World Cup** are the two global titles, with **EuroBasket**, the **FIBA AmeriCup**, the **FIBA Asia Cup** and **FIBA AfroBasket** as the continental championships.

Each of these has its own page with the detail: formats, seasons, winners and records.`,
  },
  {
    kind: 'stages',
    heading: 'Basketball’s biggest stages',
    order: 100,
    body: `A handful of events carry more weight than their place in the calendar suggests.

The **NBA Finals** is the sport's most-watched annual series. **March Madness** compresses a national college championship into three weeks of single-elimination games, and its capacity for upsets makes it an event followed by people who watch no other basketball all year. **Olympic basketball** remains the stage on which national teams are measured, and since professionals were admitted in 1992 it has been the sport's largest global shop window. The **FIBA Basketball World Cup** is the dedicated world championship. The **WNBA Finals** decides the leading women's professional title. The **EuroLeague Final Four** condenses Europe's premier club competition into a single weekend at one venue, which gives it an atmosphere no home-and-away final produces.`,
  },
  {
    kind: 'evolution',
    heading: 'How basketball changed',
    order: 110,
    body: `Basketball has changed more in its playing style than most sports, and two rule changes drove most of it.

The early game was slow and low-scoring, and a team in front could simply hold the ball. The **24-second shot clock**, introduced in 1954, made that impossible and turned professional basketball into something worth watching. Fast-break basketball followed, then decades in which the most valuable player on the floor was usually the biggest, operating close to the basket, and then a period built around athletic one-on-one scoring.

The **three-point line**, used by the ABA from 1967 and adopted by the NBA in 1979, took thirty years to have its full effect. For a long time it was treated as a novelty. Once teams began measuring the value of shots systematically, the arithmetic became hard to ignore, and the modern game reorganised itself around spacing the floor, shooting in volume from distance, and fielding players who can defend several positions rather than one. Big men who shoot from the arc and lineups without a fixed centre followed from the same logic.

This is a simplification. These are tendencies that overlapped and coexisted rather than tidy eras that replaced one another, and every one of them can still be seen in some form today. The concepts behind them, spacing, pace, switching, positionless lineups, are covered individually in the explainers.`,
  },
  {
    kind: 'eras',
    heading: 'Great eras of basketball',
    order: 120,
    body: `**1891–1940s, the foundations.** Invention, rapid spread through schools and the YMCA, the founding of FIBA and the first Olympic tournament.

**1950s–1960s, the modern game emerges.** The shot clock makes professional basketball watchable, the NBA consolidates, and the first genuinely dominant teams and players appear.

**1970s, two leagues.** The ABA competes with the NBA and loses, but its style and its three-point line outlive it.

**1980s, rivalry.** The NBA's popularity grows sharply on the back of a sustained rivalry between its leading teams and players.

**1990s, global reach.** The sport's audience expands enormously outside North America, accelerated by the arrival of professionals at the Olympics.

**2000s, globalisation.** International players move from the margins to the centre of the professional game.

**2010s, the three-point revolution.** Analytics, spacing and high-volume shooting from distance reshape how basketball is played at every level.

**2020s, global superstars.** Players developed outside the United States occupy the highest individual honours in the sport's leading league.`,
  },
  {
    kind: 'womens',
    heading: 'Women’s basketball',
    order: 130,
    body: `Women have played organised basketball almost since it was invented: a women's game was being played at Smith College by 1892, within a year of Naismith's first. The competitive structure took far longer to arrive. Women's basketball did not become an Olympic sport until 1976, forty years after the men's tournament, and a durable professional league in the United States did not exist until the WNBA began play in 1997.

Today the women's game has a full international structure under FIBA, with its own Olympic tournament, World Cup and continental championships, alongside professional leagues in North America, Europe, Asia and Australia. Many of its leading players compete in two leagues across a single year, moving between the WNBA and overseas clubs in the off-season.

It is treated throughout this site as basketball rather than as a variant of it: women's competitions appear in the competition listings, women's teams in the team pages, and women's players among the sport's most significant figures.`,
  },
  {
    kind: 'global',
    heading: 'Basketball around the world',
    order: 140,
    body: `Basketball travelled early and widely, and it is now played seriously on every continent.

**North America** remains the sport's commercial centre, with the United States and Canada supplying a large share of professional players. **Europe** has the deepest concentration of competitive national teams and club competitions: Spain, France, Serbia, Lithuania, Greece, Germany, Italy and Türkiye all combine strong domestic leagues with national teams capable of winning major tournaments. In **Asia**, China, Japan and the Philippines have large playing populations and established professional leagues, and basketball is among the most popular sports in each. **Oceania** is led by Australia and New Zealand, whose NBL is a recognised route into professional basketball. In **South America**, Argentina and Brazil have long international records, Argentina having won Olympic gold in 2004. **Africa** is the sport's fastest-growing region, with Nigeria, Senegal, Angola, Egypt and Tunisia among its established basketball nations and the Basketball Africa League, launched in 2021, giving the continent a professional club competition of its own.

This is a description of where basketball is played, not a ranking of who plays it best. The point is the breadth: few sports invented in one town in one winter have ended up quite this widely distributed.`,
  },
  {
    kind: 'culture',
    heading: 'Basketball culture',
    order: 150,
    body: `Few sports have as much presence outside their own results as basketball. Signature footwear became a global industry, and the sneaker is now a cultural object well beyond the people who play in them. The sport grew up alongside hip-hop, and the two have influenced each other's language, imagery and audience for four decades. Basketball fashion has moved from something players wore to arenas into a documented part of the sport's coverage. Video games introduced the sport to a very large number of people who came to it through a controller first.

Underneath all of that is the reason it travels so well: basketball needs a ball and a hoop. A court in a park, an unofficial half-court game, a hoop on a wall in a city with no professional team, all of it is recognisably the same sport. That accessibility is why streetball has a culture of its own, and why basketball has taken root in places no governing body deliberately targeted.`,
  },
];

/**
 * One entity featured on the Overview.
 *
 * `slug` is the canonical row to link to. It is looked up at seed time and may
 * legitimately find nothing: the entity tables are ingested and their coverage
 * is uneven, so the card renders from `name` either way and gains its link when
 * the entity arrives.
 */
export interface FeaturedEntitySeed {
  section: 'icons' | 'teams' | 'competitions';
  entityType: 'person' | 'team' | 'competition';
  /** Canonical slug. Omitted where we know we hold no such row yet. */
  slug?: string;
  name: string;
  /** One line on why this entity is here. */
  blurb?: string;
  /** Era, country, founding year: whatever the card should carry as context. */
  meta?: string;
  order: number;
}

/**
 * Icons of basketball.
 *
 * Titled "Icons" rather than "greatest players", which is deliberate: a ranked
 * list of the best players ever is an argument, and this is a list of people a
 * new follower of the sport will hear about. The order is chronological by era
 * rather than by merit, so that nothing here reads as a ranking.
 *
 * The women's and international players are interleaved rather than filed into
 * their own sections. Splitting them would say that the default icon is a male
 * American one and everybody else is a special case, which is precisely the
 * framing this site is trying not to adopt.
 */
export const BASKETBALL_FEATURED: FeaturedEntitySeed[] = [
  {
    section: 'icons',
    entityType: 'person',
    slug: 'bill-russell',
    name: 'Bill Russell',
    meta: '1956–1969',
    blurb:
      'Won eleven championships in thirteen seasons, and remains the defining example of a player who dominated through defence.',
    order: 10,
  },
  {
    section: 'icons',
    entityType: 'person',
    // Not yet in the canonical tables. The card renders and will link when it is.
    name: 'Wilt Chamberlain',
    meta: '1959–1973',
    blurb: 'Scored 100 points in a single game, a record that has never seriously been approached.',
    order: 20,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'kareem-abdul-jabbar',
    name: 'Kareem Abdul-Jabbar',
    meta: '1969–1989',
    blurb: 'Twenty seasons, six titles, and the skyhook: a shot nobody has since replicated.',
    order: 30,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'magic-johnson',
    name: 'Magic Johnson',
    meta: '1979–1996',
    blurb: 'A 6 ft 9 in point guard who redefined what size at that position could mean.',
    order: 40,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'larry-bird',
    name: 'Larry Bird',
    meta: '1979–1992',
    blurb: 'His rivalry with Magic Johnson is widely credited with the NBA’s rise in the 1980s.',
    order: 50,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'hakeem-olajuwon',
    name: 'Hakeem Olajuwon',
    meta: '1984–2002',
    blurb:
      'Nigerian-born, and the player who showed that a centre could be the most skilful person on the floor.',
    order: 60,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'michael-jordan',
    name: 'Michael Jordan',
    meta: '1984–2003',
    blurb:
      'Six titles with the Chicago Bulls, and the figure through whom basketball reached a global audience.',
    order: 70,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lisa-leslie',
    name: 'Lisa Leslie',
    meta: '1997–2009',
    blurb: 'A founding star of the WNBA and the first woman to dunk in a professional game.',
    order: 80,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'shaquille-o-neal',
    name: "Shaquille O'Neal",
    meta: '1992–2011',
    blurb: 'Physically overwhelming in a way the sport has had to write rules around.',
    order: 90,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'kobe-bryant',
    name: 'Kobe Bryant',
    meta: '1996–2016',
    blurb: 'Twenty seasons with one club, and a work ethic that became its own vocabulary.',
    order: 100,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'dirk-nowitzki',
    name: 'Dirk Nowitzki',
    meta: '1998–2019',
    blurb:
      'The German forward whose shooting made the stretch big a standard position rather than a curiosity.',
    order: 110,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'yao-ming',
    name: 'Yao Ming',
    meta: '2002–2011',
    blurb:
      'Brought an enormous Chinese audience to the NBA and remains central to basketball’s growth in Asia.',
    order: 120,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'pau-gasol',
    name: 'Pau Gasol',
    meta: '2001–2021',
    blurb: 'Two NBA titles and a long career leading Spain to the top of international basketball.',
    order: 130,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'diana-taurasi',
    name: 'Diana Taurasi',
    meta: '2004–2024',
    blurb: 'The WNBA’s all-time leading scorer, with five Olympic gold medals alongside it.',
    order: 140,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'sue-bird',
    name: 'Sue Bird',
    meta: '2002–2022',
    blurb: 'Four WNBA titles and five Olympic golds across a twenty-season career.',
    order: 150,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'lebron-james',
    name: 'LeBron James',
    meta: '2003–',
    blurb:
      'The NBA’s all-time leading scorer, and a player whose longevity has itself become the story.',
    order: 160,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'candace-parker',
    name: 'Candace Parker',
    meta: '2008–2023',
    blurb: 'Won championships with three different franchises and shaped the modern forward role.',
    order: 170,
  },
  {
    section: 'icons',
    entityType: 'person',
    name: 'Maya Moore',
    meta: '2011–2018',
    blurb:
      'Four WNBA titles, then stepped away at her peak to pursue a criminal justice case she went on to win.',
    order: 180,
  },
  {
    section: 'icons',
    entityType: 'person',
    slug: 'stephen-curry',
    name: 'Stephen Curry',
    meta: '2009–',
    blurb:
      'His shooting range forced defences to change shape, and with them the way the sport is played.',
    order: 190,
  },

  // ── Teams that shaped basketball ─────────────────────────────────────────
  // Not ranked, and deliberately not NBA-only: European clubs have histories as
  // long and as decorated, and a list of five American franchises would say
  // something untrue about the sport.
  {
    section: 'teams',
    entityType: 'team',
    slug: 'boston-celtics',
    name: 'Boston Celtics',
    meta: 'NBA, founded 1946',
    blurb: 'Eleven titles in thirteen years during the 1950s and 60s, a run nothing has matched.',
    order: 10,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'los-angeles-lakers',
    name: 'Los Angeles Lakers',
    meta: 'NBA, founded 1947',
    blurb:
      'Champions in six different decades, and the club most associated with the sport’s glamour.',
    order: 20,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'chicago-bulls',
    name: 'Chicago Bulls',
    meta: 'NBA, founded 1966',
    blurb:
      'Six titles in the 1990s, and the team through which most of the world first watched the NBA.',
    order: 30,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'san-antonio-spurs',
    name: 'San Antonio Spurs',
    meta: 'NBA, founded 1967',
    blurb:
      'Five titles across nearly two decades, built around international players before that was common.',
    order: 40,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'golden-state-warriors',
    name: 'Golden State Warriors',
    meta: 'NBA, founded 1946',
    blurb: 'The team whose three-point shooting in the 2010s reshaped how the sport is played.',
    order: 50,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'real-madrid-baloncesto',
    name: 'Real Madrid Baloncesto',
    meta: 'Liga ACB, founded 1931',
    blurb:
      'The most decorated club in European basketball, with a record number of continental titles.',
    order: 60,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'fc-barcelona-basquet',
    name: 'FC Barcelona Bàsquet',
    meta: 'Liga ACB, founded 1926',
    blurb:
      'Real Madrid’s long-standing rival, and one of the strongest clubs in European competition.',
    order: 70,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'panathinaikos-b-c',
    name: 'Panathinaikos',
    meta: 'Greek Basket League, founded 1919',
    blurb:
      'Multiple European titles and an atmosphere widely regarded as the sport’s most intense.',
    order: 80,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'olympiacos-b-c',
    name: 'Olympiacos',
    meta: 'Greek Basket League, founded 1931',
    blurb:
      'European champions more than once, and the other half of Greek basketball’s defining rivalry.',
    order: 90,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'minnesota-lynx',
    name: 'Minnesota Lynx',
    meta: 'WNBA, founded 1999',
    blurb: 'One of the WNBA’s most successful franchises, with four titles in seven seasons.',
    order: 100,
  },
  {
    section: 'teams',
    entityType: 'team',
    slug: 'los-angeles-sparks',
    name: 'Los Angeles Sparks',
    meta: 'WNBA, founded 1997',
    blurb: 'A founding WNBA club and three-time champion.',
    order: 110,
  },

  // ── Major competitions ───────────────────────────────────────────────────
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'nba',
    name: 'NBA',
    meta: 'Club, North America, founded 1946',
    blurb:
      'The world’s leading professional league: 30 teams, two conferences, ending in the Finals.',
    order: 10,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'WNBA',
    meta: 'Club, North America, founded 1996',
    blurb: 'The leading women’s professional league, played through the North American summer.',
    order: 20,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'euroleague',
    name: 'EuroLeague',
    meta: 'Club, Europe, founded 2000',
    blurb: 'Europe’s premier club competition, decided at a single-weekend Final Four.',
    order: 30,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'ncaa-division-i-men-s-basketball',
    name: 'NCAA Division I',
    meta: 'College, United States',
    blurb: 'University basketball, culminating in the knockout tournament known as March Madness.',
    order: 40,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'FIBA Basketball World Cup',
    meta: 'International, worldwide, founded 1950',
    blurb: 'The sport’s world championship for national teams, held every four years.',
    order: 50,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'Olympic Basketball',
    meta: 'International, worldwide, since 1936',
    blurb:
      'Contested by men since 1936 and women since 1976, and open to professionals since 1992.',
    order: 60,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'liga-acb',
    name: 'Liga ACB',
    meta: 'Club, Spain, founded 1983',
    blurb: 'Widely regarded as the strongest domestic league in Europe.',
    order: 70,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    name: 'FIBA EuroBasket',
    meta: 'International, Europe, founded 1935',
    blurb: 'The European championship for national teams.',
    order: 80,
  },
  {
    section: 'competitions',
    entityType: 'competition',
    slug: 'basketball-africa-league',
    name: 'Basketball Africa League',
    meta: 'Club, Africa, founded 2020',
    blurb: 'A continental club competition, and the newest of basketball’s major leagues.',
    order: 90,
  },
];
