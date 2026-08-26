import type { CuratedCompetition } from './football-competitions';

/**
 * The cricket competitions worth showing, and what each one is.
 *
 * The same curation football needed, for the same reasons and with the same
 * failure to correct. Ingestion left 101 cricket rows in which every single
 * `notability` was 0 and every `tier` defaulted to 3, so the listing collapsed
 * to alphabetical order.
 *
 * Two consequences were visible on the tab:
 *
 *   - **The international tournaments were absent entirely.** No Cricket World
 *     Cup, no T20 World Cup, no World Test Championship, no Ashes. Cricket's
 *     four best-known competitions were not in the database at all, so no
 *     amount of ordering would have surfaced them.
 *   - **`kind` was unusable.** Ingestion infers it from whether a country
 *     parsed, so the twenty rows claiming to be international were mostly
 *     English club leagues: `West Sussex Invitation Cricket League`,
 *     `Cornwall Cricket League` and `Airedale-Wharfedale Senior Cricket League`
 *     were all filed as international cricket, while the Indian Premier League
 *     was filed as domestic.
 *
 * ## What earns a place
 *
 * Three groups, which is one more than football needs because cricket's
 * structure genuinely has three levels:
 *
 *   - **International**: nation against nation. The ICC world events, the World
 *     Test Championship, the Ashes, the Asia Cup.
 *   - **Franchise**: the professional T20 leagues, which are contested by
 *     city-based teams and are the commercial centre of the modern sport.
 *   - **Domestic**: the premier national competitions, first-class and
 *     limited-overs, which are where Test players are developed.
 *
 * Everything else is removed: county and regional club leagues, city and
 * village leagues, exhibition and celebrity competitions, and the defunct
 * ventures that never established themselves.
 *
 * Women's competitions are included where the competition is a major one in its
 * own right, which is a change from the football list's approach and reflects
 * that the Women's Premier League and the two ICC women's world events have
 * coverage worth surfacing.
 *
 * ## Tiers
 *
 *   1. Competitions almost any cricket follower can name: the World Cups, the
 *      Test Championship, the Ashes, the IPL.
 *   2. Strong international and franchise competitions: the Champions Trophy,
 *      the Asia Cup, the leading overseas T20 leagues.
 *   3. Premier domestic competitions with a narrower following, and the women's
 *      and second-order franchise leagues.
 *
 * `notability` orders within a tier and is only meaningful against its
 * neighbours; the absolute values carry nothing.
 *
 * ## On the QIDs
 *
 * Every entry carries a Wikidata QID, verified by fetching the entity and
 * checking its `P641` (sport) claim is cricket. That check caught two traps a
 * label search alone would have walked into: `Q211461` "Bangladesh Premier
 * League" is the **football** league, and `Q17018252` "Major League Cricket" is
 * a defunct US organisation rather than the current competition.
 */

/** Nation against nation. */
export const CRICKET_INTERNATIONAL_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'cricket-world-cup',
    wikidata: 'Q192202',
    // "ICC ODI Cricket World Cup" rather than the article title "Cricket World
    // Cup". The bare name is ambiguous now that the T20 tournament shares the
    // "World Cup" label, and naming the format is how a reader tells the two
    // apart in a list where they sit two rows apart.
    name: 'ICC ODI Cricket World Cup',
    // The article's infobox `image` field is empty, so the logo backfill has
    // nothing to read. This is the competition's permanent logo on Commons,
    // rather than a single edition's.
    logoFile: 'ICC Men’s Cricket World Cup logo.svg',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 100,
    foundedYear: 1975,
  },
  {
    slug: 'icc-mens-t20-world-cup',
    wikidata: 'Q979298',
    name: 'ICC T20 Cricket World Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 96,
    foundedYear: 2007,
  },
  {
    slug: 'icc-world-test-championship',
    wikidata: 'Q13578103',
    name: 'ICC World Test Championship',
    kind: 'international',
    // A league table decided over a two-year cycle, then a single final. Stored
    // as a championship rather than a league because the table is not the
    // result: the final is.
    format: 'championship',
    country: null,
    tier: 1,
    notability: 92,
    foundedYear: 2019,
  },
  {
    slug: 'the-ashes',
    wikidata: 'Q725151',
    name: 'The Ashes',
    // The Ashes has no permanent logo: each series is branded separately, and
    // the article's only image is a photograph of the urn, which the backfill
    // rejects by design. The current series' mark is the closest thing to a
    // standing identity for it.
    logoFile: '2025–26 Ashes series.png',
    kind: 'international',
    // A bilateral Test series rather than a tournament, which is why the format
    // enum carries `series` at all.
    format: 'series',
    country: null,
    tier: 1,
    notability: 88,
    foundedYear: 1882,
  },
  {
    slug: 'icc-champions-trophy',
    wikidata: 'Q971637',
    name: 'ICC Champions Trophy',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 80,
    foundedYear: 1998,
  },
  {
    slug: 'asia-cup',
    wikidata: 'Q2866609',
    name: 'Asia Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 74,
    foundedYear: 1984,
  },
  {
    slug: 'womens-cricket-world-cup',
    wikidata: 'Q1580299',
    name: "Women's Cricket World Cup",
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 72,
    foundedYear: 1973,
  },
  {
    slug: 'icc-womens-t20-world-cup',
    wikidata: 'Q17003598',
    name: "ICC Women's T20 World Cup",
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 70,
    foundedYear: 2009,
  },
];

/**
 * The professional T20 leagues.
 *
 * Stored as `domestic` because the schema's `competition_kind` has no franchise
 * value and adding one would change an enum three sports share. The tab groups
 * them by tier and notability rather than by kind, so the distinction a reader
 * cares about survives without a schema change.
 */
export const CRICKET_FRANCHISE_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'indian-premier-league',
    wikidata: 'Q396412',
    name: 'Indian Premier League',
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 1,
    notability: 90,
    foundedYear: 2008,
  },
  {
    slug: 'big-bash-league',
    wikidata: 'Q4905035',
    name: 'Big Bash League',
    kind: 'domestic',
    format: 'league',
    country: 'Australia',
    tier: 2,
    notability: 68,
    foundedYear: 2011,
  },
  {
    slug: 'pakistan-super-league',
    wikidata: 'Q3267414',
    name: 'Pakistan Super League',
    kind: 'domestic',
    format: 'league',
    country: 'Pakistan',
    tier: 2,
    notability: 66,
    foundedYear: 2016,
  },
  {
    slug: 'sa20',
    wikidata: 'Q113641938',
    name: 'SA20',
    kind: 'domestic',
    format: 'league',
    country: 'South Africa',
    tier: 2,
    notability: 64,
    foundedYear: 2023,
  },
  {
    slug: 'caribbean-premier-league',
    wikidata: 'Q5039412',
    name: 'Caribbean Premier League',
    kind: 'domestic',
    format: 'league',
    country: null,
    tier: 2,
    notability: 62,
    foundedYear: 2013,
  },
  {
    slug: 'the-hundred',
    wikidata: 'Q48803639',
    name: 'The Hundred',
    kind: 'domestic',
    format: 'league',
    country: 'United Kingdom',
    tier: 2,
    notability: 60,
    foundedYear: 2021,
  },
  {
    slug: 'womens-premier-league',
    // Q115877036, the cricket league. Four football competitions share the
    // label "Women's Premier League", which is why every QID here was checked
    // against the entity's own sport claim rather than its name.
    wikidata: 'Q115877036',
    name: "Women's Premier League",
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 2,
    notability: 58,
    foundedYear: 2023,
  },
  {
    slug: 'international-league-t20',
    wikidata: 'Q112306747',
    name: 'International League T20',
    kind: 'domestic',
    format: 'league',
    country: 'United Arab Emirates',
    tier: 3,
    notability: 52,
    foundedYear: 2023,
  },
  {
    slug: 'major-league-cricket',
    // Q104864362, the current league. Q17018252 carries the same label and is a
    // defunct US organisation.
    wikidata: 'Q104864362',
    name: 'Major League Cricket',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 3,
    notability: 50,
    foundedYear: 2023,
  },
  {
    slug: 'lanka-premier-league',
    wikidata: 'Q55616566',
    name: 'Lanka Premier League',
    kind: 'domestic',
    format: 'league',
    country: 'Sri Lanka',
    tier: 3,
    notability: 48,
    foundedYear: 2020,
  },
  {
    slug: 'bangladesh-premier-league',
    // Q1024916, the cricket league. Q211461 is the Bangladeshi football league.
    wikidata: 'Q1024916',
    name: 'Bangladesh Premier League',
    kind: 'domestic',
    format: 'league',
    country: 'Bangladesh',
    tier: 3,
    notability: 46,
    foundedYear: 2012,
  },
  {
    slug: 'womens-big-bash-league',
    wikidata: 'Q20648609',
    name: "Women's Big Bash League",
    kind: 'domestic',
    format: 'league',
    country: 'Australia',
    tier: 3,
    notability: 44,
    foundedYear: 2015,
  },
];

/** The premier national competitions, first-class and limited-overs. */
export const CRICKET_DOMESTIC_COMPETITIONS: CuratedCompetition[] = [
  {
    slug: 'county-championship',
    wikidata: 'Q1137275',
    name: 'County Championship',
    kind: 'domestic',
    format: 'league',
    country: 'United Kingdom',
    tier: 2,
    notability: 56,
    foundedYear: 1890,
  },
  {
    slug: 'sheffield-shield',
    wikidata: 'Q2470981',
    name: 'Sheffield Shield',
    kind: 'domestic',
    format: 'league',
    country: 'Australia',
    tier: 2,
    notability: 54,
    foundedYear: 1892,
  },
  {
    slug: 'ranji-trophy',
    wikidata: 'Q3051958',
    name: 'Ranji Trophy',
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 2,
    notability: 53,
    foundedYear: 1934,
  },
  {
    slug: 'vijay-hazare-trophy',
    wikidata: 'Q7929147',
    name: 'Vijay Hazare Trophy',
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 3,
    notability: 40,
    foundedYear: 2002,
  },
  {
    slug: 'syed-mushtaq-ali-trophy',
    wikidata: 'Q7660409',
    name: 'Syed Mushtaq Ali Trophy',
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 3,
    notability: 38,
    foundedYear: 2009,
  },
  {
    slug: 'twenty20-cup',
    wikidata: 'Q1653328',
    name: 'Vitality Blast',
    kind: 'domestic',
    format: 'league',
    country: 'United Kingdom',
    tier: 3,
    notability: 36,
    foundedYear: 2003,
  },
];

export const CRICKET_CURATED_COMPETITIONS: CuratedCompetition[] = [
  ...CRICKET_INTERNATIONAL_COMPETITIONS,
  ...CRICKET_FRANCHISE_COMPETITIONS,
  ...CRICKET_DOMESTIC_COMPETITIONS,
];

/**
 * The slugs that survive curation.
 *
 * Used by the seed to decide what to delete. Kept as a set for the same reason
 * football's is: the next crawl has to be able to check against it rather than
 * putting back everything the seed just removed.
 */
export const CRICKET_CURATED_SLUGS: ReadonlySet<string> = new Set(
  CRICKET_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
