/**
 * The football competitions worth showing, and what each one is.
 *
 * Ingestion inserts every competition a provider returns and judges none of
 * them. That left 937 football rows in which `Somerset County League`,
 * `9. divisjon` and `Hong Kong Fourth Division League` sat at the same tier as
 * the Premier League, because `tier` was never set and defaulted to 3 while
 * `notability` arrived as 0 for every single row. With both ordering columns
 * flat the listing collapsed to alphabetical order, which is why the first page
 * of a competitions tab opened on `2020-21 Belgian Division 2`.
 *
 * `kind` could not be trusted either. Ingestion infers it from whether a
 * country is present, so anything whose country failed to parse was labelled
 * international: `Cymru North`, `Bermudian Premier Division` and
 * `2020-21 Derde Divisie` all claimed to be international competitions. A
 * filter built on that column would have been wrong on its face.
 *
 * This file is the judgement that was missing. It is curated rather than
 * inferred for the same reason `football-honour-tiers.ts` is: the automatic
 * proxies available here measure how much Wikipedia has written about a league,
 * not whether a reader wants to see it, and a bad inference cannot be corrected
 * by hand. A list can be argued with one line at a time.
 *
 * ## What earns a place
 *
 * Two groups, matching what a reader means by "competition":
 *
 *   - **International**: national-team football. The World Cup, the continental
 *     championships, the Nations League.
 *   - **Leagues**: club football. Top-flight domestic leagues, the small number
 *     of second tiers with a following of their own, and the continental club
 *     cups, which are contested by the same clubs as the domestic leagues.
 *
 * Everything else is deleted. Third tiers, regional and county leagues, youth
 * and reserve competitions, and defunct leagues of historical interest only are
 * all out. So are single seasons: `2024-25 A-League Men` is a season of a
 * competition, not a competition, and it arrived as one only because the
 * provider's list conflated the two.
 *
 * Women's competitions are absent from this list because the data behind them
 * is thinner than the men's, not because they rank below it. They are the first
 * thing to add when their coverage is worth surfacing.
 *
 * ## Tiers
 *
 *   1. Competitions almost every reader can name: the World Cup, the Champions
 *      League, the five major European leagues.
 *   2. Strong continental and national competitions: the other continental
 *      championships, the Europa League, leagues such as the Eredivisie, the
 *      Primeira Liga and the Brasileirao.
 *   3. Real top flights with a narrower following, and the notable second tiers.
 *
 * `notability` orders within a tier and is only ever compared against its
 * neighbours; the absolute values carry no meaning.
 *
 * ## Matching, and why some rows are created
 *
 * Rows are matched on slug, which is how they already exist in the database.
 * Where `create` is set the competition is absent altogether and is inserted:
 * the Champions League, the Euros, the Copa America, the Africa Cup of Nations,
 * the Asian Cup and the Libertadores were all simply missing, so an
 * international filter built on existing data alone would have contained the
 * World Cup and nothing else.
 *
 * Created rows carry identity only: name, country, format, founding year. No
 * winners, records or statistics are entered here. Those are facts about what
 * happened rather than what a competition is, they change, and a hand-typed
 * champion is indistinguishable from an ingested one once it is stored. They
 * are left for ingestion to fill, and the detail page shows what is present.
 */

export type CompetitionKind = 'international' | 'domestic' | 'continental';
/**
 * Mirrors `competitionFormatEnum` in the schema.
 *
 * Originally listed only the three shapes football uses. Widened to the full
 * enum because cricket needs `series` for a bilateral Test series such as the
 * Ashes, and `championship` for the World Test Championship, whose league table
 * feeds a single final rather than deciding the title itself.
 */
export type CompetitionFormat =
  'league' | 'knockout' | 'group_knockout' | 'series' | 'championship' | 'tour';

export interface CuratedCompetition {
  /** Matches `competition.slug`, which is unique per sport. */
  slug: string;
  /** Corrects the stored name where ingestion recorded a federation or an operator instead. */
  name?: string;
  kind: CompetitionKind;
  format: CompetitionFormat;
  /** Null for competitions that are not tied to a single country. */
  country: string | null;
  tier: 1 | 2 | 3;
  notability: number;
  foundedYear?: number;
  /**
   * The competition's Wikidata QID.
   *
   * Recorded because enrichment reaches a competition only through its external
   * mapping, so a row without one can never gain facts, an `about` paragraph or
   * a winners list no matter how many times a crawl runs. Every created row
   * needed one, and the World Cup, the Champions League and La Liga were all
   * missing theirs.
   *
   * Verified against the entity's own Wikidata description rather than assumed
   * from the label: several of these names are shared. `Q2427920` was already
   * stored for Serie A and points at Lega Serie A, the league's operating body,
   * which is a different thing from the competition and enriches into the wrong
   * facts.
   */
  wikidata?: string;
  /**
   * A Commons or Wikipedia file name for the competition's logo.
   *
   * Only for the competitions whose article does not carry one in a field the
   * logo backfill reads. That backfill takes `image`, `logo`, `crest` or
   * `badge` from the infobox and rejects a `.jpg`, so that a trophy photograph
   * or a squad shot never becomes a logo. Both rules are right and both leave
   * gaps: the Cricket World Cup's `image` field is empty upstream, and The
   * Ashes carries only a photograph of the urn.
   *
   * Set here rather than by a one-off UPDATE so the value survives a reseed and
   * is visible beside the rest of the competition's curation.
   */
  logoFile?: string;
  /** Set when the competition is missing from the database and has to be inserted. */
  create?: true;
}

/**
 * Competitions played across borders, by national teams and by clubs alike.
 *
 * Grouped together here because they are curated as one set, but they are not
 * presented as one: the reader's filter splits on who competes, so `kind`
 * decides the tab. `international` is national-team football and
 * `continental` is club football, which puts the Champions League beside the
 * leagues its entrants come from rather than beside the World Cup.
 */
export const FOOTBALL_INTERNATIONAL_COMPETITIONS: CuratedCompetition[] = [
  // ── National teams ───────────────────────────────────────────────────────
  {
    slug: 'world-cup',
    wikidata: 'Q19317',
    name: 'FIFA World Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 100,
    foundedYear: 1930,
  },
  {
    slug: 'uefa-european-championship',
    wikidata: 'Q260858',
    name: 'UEFA European Championship',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 92,
    foundedYear: 1960,
    create: true,
  },
  {
    slug: 'copa-america',
    wikidata: 'Q178750',
    name: 'Copa América',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 84,
    foundedYear: 1916,
    create: true,
  },
  {
    slug: 'africa-cup-of-nations',
    wikidata: 'Q83145',
    name: 'Africa Cup of Nations',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 80,
    foundedYear: 1957,
    create: true,
  },
  {
    slug: 'afc-asian-cup',
    wikidata: 'Q157894',
    name: 'AFC Asian Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 74,
    foundedYear: 1956,
    create: true,
  },
  {
    slug: 'concacaf-gold-cup',
    wikidata: 'Q189327',
    name: 'CONCACAF Gold Cup',
    kind: 'international',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 70,
    foundedYear: 1991,
    create: true,
  },
  {
    slug: 'uefa-nations-league',
    wikidata: 'Q15980635',
    name: 'UEFA Nations League',
    kind: 'international',
    format: 'league',
    country: null,
    tier: 3,
    notability: 62,
    foundedYear: 2018,
    create: true,
  },

  // ── Continental and global club competitions ─────────────────────────────
  {
    slug: 'uefa-champions-league',
    wikidata: 'Q18756',
    name: 'UEFA Champions League',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 1,
    notability: 96,
    foundedYear: 1955,
    create: true,
  },
  {
    slug: 'uefa-europa-league',
    wikidata: 'Q18760',
    name: 'UEFA Europa League',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 78,
    foundedYear: 1971,
    create: true,
  },
  {
    slug: 'uefa-conference-league',
    wikidata: 'Q59365764',
    name: 'UEFA Conference League',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 3,
    notability: 56,
    foundedYear: 2021,
    create: true,
  },
  {
    slug: 'copa-libertadores',
    wikidata: 'Q184795',
    name: 'Copa Libertadores',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 2,
    notability: 76,
    foundedYear: 1960,
    create: true,
  },
  {
    slug: 'caf-champions-league',
    wikidata: 'Q219261',
    name: 'CAF Champions League',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 3,
    notability: 58,
    foundedYear: 1964,
    create: true,
  },
  {
    slug: 'afc-champions-league-elite',
    wikidata: 'Q193041',
    name: 'AFC Champions League Elite',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 3,
    notability: 57,
    foundedYear: 1967,
    create: true,
  },
  // Global rather than continental, but contested by clubs, and `kind` is what
  // decides whether a competition is filed under national teams or under club
  // football. Filed with the club cups so it does not sit beside the World Cup.
  {
    slug: 'fifa-club-world-cup',
    wikidata: 'Q223366',
    name: 'FIFA Club World Cup',
    kind: 'continental',
    format: 'group_knockout',
    country: null,
    tier: 3,
    notability: 64,
    foundedYear: 2000,
    create: true,
  },
];

/**
 * Domestic leagues.
 *
 * Top flights, ordered so that the leagues a reader is most likely to be
 * looking for come first. The second tiers present here are the ones with a
 * following of their own rather than every second tier in the list.
 */
export const FOOTBALL_LEAGUE_COMPETITIONS: CuratedCompetition[] = [
  // ── The major European leagues ───────────────────────────────────────────
  {
    slug: 'premier-league',
    name: 'Premier League',
    kind: 'domestic',
    format: 'league',
    country: 'England',
    tier: 1,
    notability: 98,
    foundedYear: 1992,
  },
  {
    slug: 'la-liga',
    wikidata: 'Q324867',
    name: 'La Liga',
    kind: 'domestic',
    format: 'league',
    country: 'Spain',
    tier: 1,
    notability: 94,
    foundedYear: 1929,
  },
  // Stored as "Lega Serie A", which is the league's operating body rather than
  // the competition a reader is looking for.
  {
    slug: 'lega-serie-a',
    wikidata: 'Q15804',
    name: 'Serie A',
    kind: 'domestic',
    format: 'league',
    country: 'Italy',
    tier: 1,
    notability: 90,
    foundedYear: 1898,
  },
  // The `bundesliga` slug was taken by the Austrian league, so the German one
  // is created under an explicit slug rather than renamed into a collision.
  {
    slug: 'german-bundesliga',
    wikidata: 'Q82595',
    name: 'Bundesliga',
    kind: 'domestic',
    format: 'league',
    country: 'Germany',
    tier: 1,
    notability: 89,
    foundedYear: 1963,
    create: true,
  },
  {
    slug: 'ligue-1',
    name: 'Ligue 1',
    kind: 'domestic',
    format: 'league',
    country: 'France',
    tier: 1,
    notability: 86,
    foundedYear: 1932,
  },

  // ── Other established top flights ────────────────────────────────────────
  {
    slug: 'eredivisie',
    name: 'Eredivisie',
    kind: 'domestic',
    format: 'league',
    country: 'Netherlands',
    tier: 2,
    notability: 72,
    foundedYear: 1956,
  },
  {
    slug: 'liga-portugal',
    name: 'Liga Portugal',
    kind: 'domestic',
    format: 'league',
    country: 'Portugal',
    tier: 2,
    notability: 71,
    foundedYear: 1934,
  },
  {
    slug: 'campeonato-brasileiro-serie-a',
    name: 'Campeonato Brasileiro Série A',
    kind: 'domestic',
    format: 'league',
    country: 'Brazil',
    tier: 2,
    notability: 70,
    foundedYear: 1959,
  },
  {
    slug: 'argentine-primera-division',
    name: 'Argentine Primera División',
    kind: 'domestic',
    format: 'league',
    country: 'Argentina',
    tier: 2,
    notability: 69,
    foundedYear: 1891,
  },
  // Stored against Canada because MLS has Canadian clubs; it is a league of the
  // United States and Canada, and the United States is the useful label.
  {
    slug: 'major-league-soccer',
    name: 'Major League Soccer',
    kind: 'domestic',
    format: 'league',
    country: 'United States',
    tier: 2,
    notability: 68,
    foundedYear: 1993,
  },
  {
    slug: 'saudi-pro-league',
    name: 'Saudi Pro League',
    kind: 'domestic',
    format: 'league',
    country: 'Saudi Arabia',
    tier: 2,
    notability: 66,
    foundedYear: 1976,
  },
  {
    slug: 'super-lig',
    name: 'Süper Lig',
    kind: 'domestic',
    format: 'league',
    country: 'Turkey',
    tier: 2,
    notability: 64,
    foundedYear: 1959,
  },
  {
    slug: 'scottish-premiership',
    name: 'Scottish Premiership',
    kind: 'domestic',
    format: 'league',
    country: 'Scotland',
    tier: 2,
    notability: 63,
    foundedYear: 1890,
  },
  {
    slug: 'belgian-pro-league',
    name: 'Belgian Pro League',
    kind: 'domestic',
    format: 'league',
    country: 'Belgium',
    tier: 3,
    notability: 58,
    foundedYear: 1895,
  },
  {
    slug: 'super-league-greece',
    name: 'Super League Greece',
    kind: 'domestic',
    format: 'league',
    country: 'Greece',
    tier: 3,
    notability: 55,
    foundedYear: 1927,
  },
  {
    slug: 'swiss-super-league',
    name: 'Swiss Super League',
    kind: 'domestic',
    format: 'league',
    country: 'Switzerland',
    tier: 3,
    notability: 54,
    foundedYear: 1897,
  },
  {
    slug: 'bundesliga',
    name: 'Austrian Bundesliga',
    kind: 'domestic',
    format: 'league',
    country: 'Austria',
    tier: 3,
    notability: 53,
    foundedYear: 1911,
  },
  {
    slug: 'danish-superliga',
    name: 'Danish Superliga',
    kind: 'domestic',
    format: 'league',
    country: 'Denmark',
    tier: 3,
    notability: 52,
    foundedYear: 1991,
  },
  {
    slug: 'liga-mx',
    name: 'Liga MX',
    kind: 'domestic',
    format: 'league',
    country: 'Mexico',
    tier: 3,
    notability: 60,
    foundedYear: 1943,
  },
  {
    slug: 'j1-league',
    name: 'J1 League',
    kind: 'domestic',
    format: 'league',
    country: 'Japan',
    tier: 3,
    notability: 59,
    foundedYear: 1992,
  },
  {
    slug: 'k-league-1',
    name: 'K League 1',
    kind: 'domestic',
    format: 'league',
    country: 'South Korea',
    tier: 3,
    notability: 51,
    foundedYear: 1983,
  },
  {
    slug: 'chinese-super-league',
    name: 'Chinese Super League',
    kind: 'domestic',
    format: 'league',
    country: 'China',
    tier: 3,
    notability: 50,
    foundedYear: 2004,
  },
  {
    slug: 'a-league-men',
    name: 'A-League Men',
    kind: 'domestic',
    format: 'league',
    country: 'Australia',
    tier: 3,
    notability: 49,
    foundedYear: 2004,
  },
  {
    slug: 'indian-super-league',
    name: 'Indian Super League',
    kind: 'domestic',
    format: 'league',
    country: 'India',
    tier: 3,
    notability: 48,
    foundedYear: 2013,
  },
  {
    slug: 'russian-premier-league',
    name: 'Russian Premier League',
    kind: 'domestic',
    format: 'league',
    country: 'Russia',
    tier: 3,
    notability: 47,
    foundedYear: 1992,
  },
  {
    slug: 'allsvenskan',
    name: 'Allsvenskan',
    kind: 'domestic',
    format: 'league',
    country: 'Sweden',
    tier: 3,
    notability: 46,
    foundedYear: 1924,
  },
  {
    slug: 'eliteserien',
    name: 'Eliteserien',
    kind: 'domestic',
    format: 'league',
    country: 'Norway',
    tier: 3,
    notability: 45,
    foundedYear: 1937,
  },
  {
    slug: 'croatian-first-league',
    name: 'Croatian First League',
    kind: 'domestic',
    format: 'league',
    country: 'Croatia',
    tier: 3,
    notability: 44,
    foundedYear: 1992,
  },
  {
    slug: 'czech-first-league',
    name: 'Czech First League',
    kind: 'domestic',
    format: 'league',
    country: 'Czech Republic',
    tier: 3,
    notability: 43,
    foundedYear: 1993,
  },

  // ── Second tiers with a following of their own ───────────────────────────
  {
    slug: 'efl-championship',
    name: 'EFL Championship',
    kind: 'domestic',
    format: 'league',
    country: 'England',
    tier: 3,
    notability: 62,
    foundedYear: 2004,
  },
  {
    slug: '2-bundesliga',
    name: '2. Bundesliga',
    kind: 'domestic',
    format: 'league',
    country: 'Germany',
    tier: 3,
    notability: 42,
    foundedYear: 1974,
  },
  {
    slug: 'serie-b',
    name: 'Serie B',
    kind: 'domestic',
    format: 'league',
    country: 'Italy',
    tier: 3,
    notability: 41,
    foundedYear: 1929,
  },
  {
    slug: 'laliga-2',
    name: 'LaLiga 2',
    kind: 'domestic',
    format: 'league',
    country: 'Spain',
    tier: 3,
    notability: 40,
    foundedYear: 1929,
  },
  {
    slug: 'ligue-2',
    name: 'Ligue 2',
    kind: 'domestic',
    format: 'league',
    country: 'France',
    tier: 3,
    notability: 39,
    foundedYear: 1933,
  },
];

/** Every curated competition, international and domestic alike. */
export const FOOTBALL_CURATED_COMPETITIONS: CuratedCompetition[] = [
  ...FOOTBALL_INTERNATIONAL_COMPETITIONS,
  ...FOOTBALL_LEAGUE_COMPETITIONS,
];

/**
 * The slugs that survive curation.
 *
 * Used both by the seed, to decide what to delete, and by ingestion, to decide
 * what it is allowed to insert. Sharing one set is what stops the next crawl
 * from putting back everything the seed just removed.
 */
export const FOOTBALL_CURATED_SLUGS: ReadonlySet<string> = new Set(
  FOOTBALL_CURATED_COMPETITIONS.map((entry) => entry.slug),
);
