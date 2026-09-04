/**
 * Curated leaderboards for the major club competitions.
 *
 * The World Cup is not here. Its tables are seeded from
 * `football-competition-awards.ts`, which merges per-edition results into the
 * crawled tables, and they are correct; this file exists because the same
 * approach does not work for a domestic league.
 *
 * ## Why these tables are seeded rather than crawled
 *
 * Ingestion reads a competition's roll of honour from Wikidata's edition
 * items, and for a league every one of those editions is labelled by the year
 * the season *started*. The crawled tables were therefore wrong by one year in
 * every row: the Champions League page credited Paris Saint-Germain with the
 * 2024 title that Real Madrid won, and Manchester City's 2023 title appeared
 * against Real Madrid's name. A reader has no way to detect an error that is
 * uniform down the column, which is what makes it worth replacing wholesale
 * rather than patching.
 *
 * The award tables had a second problem. Wikidata's award statements for the
 * leagues are sparse, so enrichment produced single-row tables reading "most
 * recent sourced award", and one league's page carried an `award:goal` table
 * of thirty unlabelled rows that no reader could interpret. A one-row table
 * under a heading that promises a history is worse than no table.
 *
 * Every row here is written with `MANUAL_RANKING_SOURCE` as its `source_title`,
 * which the ingestion upsert refuses to overwrite, so the next crawl cannot
 * reintroduce the shifted years.
 *
 * ## What the columns mean
 *
 * A season is identified by the year it *ended*, which is the year the trophy
 * was actually lifted: the 2025-26 Premier League is 2026. `detail` carries the
 * full season label ("2025-26") so the reader sees the span rather than
 * inferring it, and the club where the row is about a player.
 *
 * For the season-by-season award tables `value` is the figure that won it
 * where the award has one (goals for a Golden Boot, clean sheets for a Golden
 * Glove) and the season's end year where it does not, because a voted award
 * has no number behind it and an empty column reads as missing data.
 *
 * ## Rules for adding to this file
 *
 * 1. **One published source per table, named in `source`.** A figure with no
 *    attribution cannot be told apart from a guess once it is stored.
 * 2. **Only completed seasons.** A trophy is not seeded before it is won.
 * 3. **Omit rather than approximate.** Where a source does not yet carry a
 *    season, that season is absent and the gap is documented in a comment
 *    beside the table. Several 2025-26 awards are not yet published and are
 *    deliberately missing rather than inferred from the league's top scorer.
 * 4. **Names as the database spells them.** Table rows are linked to player and
 *    team pages by matching the printed name, so "Real Madrid CF" resolves and
 *    "Real Madrid Club de Fútbol" does not. A name that matches nothing renders
 *    as plain text, which is the intended fallback, not a failure.
 *
 * Keyed by competition slug, matching the convention in `team-rankings.ts`.
 */

export interface CompetitionRankingEntrySeed {
  rank: number;
  name: string;
  /** Goals, appearances, clean sheets, or the season's end year. */
  value: number | null;
  /** Season label and club, shown beside the figure. */
  detail: string | null;
}

export interface CompetitionRankingSeed {
  /**
   * The table's identity, and the conflict key on `entity_ranking`.
   *
   * Football's set plus cricket's. They stay in one union rather than becoming a
   * bare string because the value is a conflict target: a typo would silently
   * create a second table rather than updating the intended one.
   */
  kind:
    | 'roll_of_honour'
    | 'most_appearances'
    | 'top_scorers'
    | 'award:most-valuable-player-award'
    | 'award:more-goals-scored'
    | 'award:best-goalkeeper'
    // Cricket. `top_scorers` is reused for most runs, since it is the same
    // question asked of a different sport, but wickets, catches and
    // wicket-keeping dismissals have no football equivalent.
    | 'most_wickets'
    | 'most_catches'
    | 'most_wicketkeeper_dismissals'
    | 'award:player-of-the-tournament'
    | 'award:player-of-the-season'
    // Tennis. The two singles events are separate tables rather than one
    // combined list, so they need distinct values: `kind` is the conflict
    // target on `entity_ranking`, and sharing one would make the second write
    // overwrite the first.
    | 'champions_mens_singles'
    | 'champions_womens_singles'
    // Doubles, which tennis reports as three further events rather than one:
    // men's and women's pairs are separate draws, and mixed doubles pairs one
    // of each. Five tables per major in total.
    | 'champions_mens_doubles'
    | 'champions_womens_doubles'
    | 'champions_mixed_doubles'
    // Golf, which awards one title per major rather than tennis's five, so one
    // kind covers every table. Kept distinct from the tennis values because a
    // shared kind would be a shared conflict target, and the two sports' tables
    // carry different things in `detail`.
    | 'champions_golf'
    // American football's Super Bowl champions, one row per game rather than
    // per season, and carrying a score in `detail` rather than a margin.
    | 'champions_super_bowl';
  label: string;
  /** Where the figures came from. Rendered as the table's provenance note. */
  source: string;
  /** ISO date the figures were last verified true. */
  asOf: string;
  /** Appended to the provenance note where the table needs a caveat. */
  caveat?: string;
  entries: CompetitionRankingEntrySeed[];
}

/**
 * A champion, as `[season end year, club]`.
 *
 * The club name is repeated on every row rather than grouped, because the table
 * is read as a chronology and a reader scanning for a year should not have to
 * look upwards to find who won it.
 */
type Champion = [year: number, club: string];

/**
 * A career total, as `[player, figure, clubs]`.
 *
 * The clubs are null where the source's table does not carry a club column, so
 * the page shows the figure alone rather than a list nobody attributed.
 */
type Career = [name: string, value: number, clubs: string | null];

/** A season's award, as `[season end year, winner, figure or null, club]`. */
type Season = [year: number, winner: string, value: number | null, club: string];

/**
 * An edition of a tournament, as `[year, winner, figure or null, nation]`.
 *
 * Structurally the same as a season, but the year stands alone rather than
 * spanning two: a World Cup or a Copa América is played inside one summer, so
 * "2024" is the whole label and rendering it as "2023-24" would be wrong.
 */
type Edition = [year: number, winner: string, value: number | null, nation: string];

// ── Club names, as the team table spells them ──────────────────────────────
// Only the ones used in a roll of honour are named here. A misspelling costs a
// link rather than a wrong link, because an unmatched name is left as text.
const ARSENAL = 'Arsenal F.C.';
const BLACKBURN = 'Blackburn Rovers F.C.';
const CHELSEA = 'Chelsea F.C.';
const LIVERPOOL = 'Liverpool F.C.';
const MAN_CITY = 'Manchester City F.C.';
const MAN_UTD = 'Manchester United F.C.';

const AJAX = 'AFC Ajax';
const BARCELONA = 'FC Barcelona';
const BAYERN = 'FC Bayern Munich';
const DORTMUND = 'Borussia Dortmund';
const INTER = 'Inter Milan';
const JUVENTUS = 'Juventus FC';
const MARSEILLE = 'Olympique de Marseille';
const MILAN = 'AC Milan';
const PORTO = 'FC Porto';
const PSG = 'Paris Saint-Germain FC';
const REAL_MADRID = 'Real Madrid CF';

// Leicester City is not in the team table, so the 2016 champions render as
// plain text. Named as a constant anyway so the roll of honour reads uniformly.
const LEICESTER = 'Leicester City F.C.';

const ATLETICO = 'Atlético Madrid';
// The club's own name, and the one the team table holds. "Athletic Bilbao" is
// the common English form and matches nothing, so the rows would not link.
const ATHLETIC = 'Athletic Club';
const BETIS = 'Real Betis Balompié';
const DEPORTIVO = 'Deportivo de A Coruña';
const REAL_SOCIEDAD = 'Real Sociedad';
const SEVILLA = 'Sevilla FC';
const VALENCIA = 'Valencia CF';

const BOLOGNA = 'Bologna F.C. 1909';
const CAGLIARI = 'Cagliari Calcio';
const FIORENTINA = 'ACF Fiorentina';
const LAZIO = 'SS Lazio';
const NAPOLI = 'SSC Napoli';
const ROMA = 'AS Roma';
const SAMPDORIA = 'U.C. Sampdoria';
const TORINO = 'Torino FC';
const VERONA = 'Hellas Verona FC';

const BRAUNSCHWEIG = 'Eintracht Braunschweig';
const FRANKFURT = 'Eintracht Frankfurt';
const HAMBURG = 'Hamburger SV';
const KAISERSLAUTERN = '1. FC Kaiserslautern';
const KOLN = '1. FC Köln';
const LEVERKUSEN = 'Bayer 04 Leverkusen';
const MONCHENGLADBACH = 'Borussia Mönchengladbach';
const NURNBERG = '1. FC Nürnberg';
const STUTTGART = 'VfB Stuttgart';
const WERDER = 'SV Werder Bremen';
const WOLFSBURG = 'VfL Wolfsburg';

const AUXERRE = 'AJ Auxerre';
const LENS = 'R.C. Lens';
const LILLE = 'Lille OSC';
const LILLOIS = 'Olympique Lillois';
const LYON = 'Olympique Lyonnais';
const MONACO = 'AS Monaco FC';
const MONTPELLIER = 'Montpellier Hérault Sport Club';
const NANTES = 'FC Nantes';
const NICE = 'OGC Nice';
const REIMS = 'Stade de Reims';
const SAINT_ETIENNE = 'AS Saint-Étienne';
const SOCHAUX = 'FC Sochaux-Montbéliard';
const STRASBOURG = 'RC Strasbourg Alsace';

// ── National teams, as the team table spells them ──────────────────────────
// The spellings are not uniform upstream: some carry "men's national football
// team" and others "national association football team". Both forms appear
// below because the table holds them that way, and a name that does not match
// exactly renders as plain text instead of linking.
const ARGENTINA = "Argentina men's national football team";
const BRAZIL = "Brazil men's national football team";
const URUGUAY = "Uruguay men's national football team";
const SPAIN = "Spain men's national football team";
const ITALY = "Italy men's national association football team";
const FRANCE = "France men's national association football team";
const GERMANY = "Germany men's national association football team";
const PORTUGAL = "Portugal men's national football team";
const NETHERLANDS = 'Netherlands national association football team';
const DENMARK = "Denmark men's national football team";
const GREECE = "Greece men's national football team";
const CZECHOSLOVAKIA = "Czechoslovakia men's national association football team";
const SOVIET_UNION = 'Soviet Union national association football team';
const PERU = "Peru men's national football team";
const PARAGUAY = "Paraguay men's national football team";
const BOLIVIA = "Bolivia men's national football team";
const COLOMBIA = "Colombia men's national football team";
const CHILE = "Chile men's national football team";
const MEXICO = "Mexico men's national football team";
const USA = "United States men's national soccer team";
const EGYPT = "Egypt men's national football team";
const CAMEROON = "Cameroon men's national football team";
const GHANA = "Ghana men's national football team";
const NIGERIA = "Nigeria men's national football team";
const ALGERIA = "Algeria men's national football team";
const MOROCCO = "Morocco men's national football team";
const SENEGAL = "Senegal men's national association football team";
const ZAMBIA = "Zambia men's national football team";
const TUNISIA = "Tunisia men's national football team";
const IVORY_COAST = "Ivory Coast men's national football team";
const SOUTH_AFRICA = "South Africa men's national association football team";
const SUDAN = "Sudan men's national football team";
const ETHIOPIA = "Ethiopia men's national football team";
const CONGO = "Congo men's national football team";
const JAPAN = "Japan men's national football team";
const QATAR = "Qatar men's national football team";
const IRAN = "Iran men's national football team";
const IRAQ = "Iraq men's national football team";
const KUWAIT = 'Kuwait national football team';
const SAUDI_ARABIA = "Saudi Arabia men's national football team";
const AUSTRALIA = "Australia men's national soccer team";
const SOUTH_KOREA = "South Korea men's national football team";
const ISRAEL = "Israel men's national football team";

// Nations with no row in the team table, or recorded under a historic name the
// table does not hold. These render as plain text.
const WEST_GERMANY = 'West Germany national football team';
const CANADA = "Canada men's national soccer team";
const DR_CONGO = 'DR Congo national football team';
const ZAIRE = 'Zaire national football team';
const UAR = 'United Arab Republic national football team';
const HONDURAS = 'Honduras national football team';
const COSTA_RICA = 'Costa Rica national football team';

// Clubs with no row in the team table, or whose historic name differs from the
// modern club's. Both render as plain text, which is the intended fallback.
const MADRID_FC = 'Madrid FC';
const ATLETICO_AVIACION = 'Atlético Aviación';
const AMBROSIANA = 'Ambrosiana-Inter';
const MUNICH_1860 = 'TSV 1860 Munich';
const BORDEAUX = 'Girondins de Bordeaux';
const SETE = 'FC Sète';
const RACING_PARIS = 'Racing Club de France';
const ROUBAIX = 'CO Roubaix-Tourcoing';

const PREMIER_LEAGUE_CHAMPIONS: Champion[] = [
  [2026, ARSENAL],
  [2025, LIVERPOOL],
  [2024, MAN_CITY],
  [2023, MAN_CITY],
  [2022, MAN_CITY],
  [2021, MAN_CITY],
  [2020, LIVERPOOL],
  [2019, MAN_CITY],
  [2018, MAN_CITY],
  [2017, CHELSEA],
  [2016, LEICESTER],
  [2015, CHELSEA],
  [2014, MAN_CITY],
  [2013, MAN_UTD],
  [2012, MAN_CITY],
  [2011, MAN_UTD],
  [2010, CHELSEA],
  [2009, MAN_UTD],
  [2008, MAN_UTD],
  [2007, MAN_UTD],
  [2006, CHELSEA],
  [2005, CHELSEA],
  [2004, ARSENAL],
  [2003, MAN_UTD],
  [2002, ARSENAL],
  [2001, MAN_UTD],
  [2000, MAN_UTD],
  [1999, MAN_UTD],
  [1998, ARSENAL],
  [1997, MAN_UTD],
  [1996, MAN_UTD],
  [1995, BLACKBURN],
  [1994, MAN_UTD],
  [1993, MAN_UTD],
];

const CHAMPIONS_LEAGUE_CHAMPIONS: Champion[] = [
  [2026, PSG],
  [2025, PSG],
  [2024, REAL_MADRID],
  [2023, MAN_CITY],
  [2022, REAL_MADRID],
  [2021, CHELSEA],
  [2020, BAYERN],
  [2019, LIVERPOOL],
  [2018, REAL_MADRID],
  [2017, REAL_MADRID],
  [2016, REAL_MADRID],
  [2015, BARCELONA],
  [2014, REAL_MADRID],
  [2013, BAYERN],
  [2012, CHELSEA],
  [2011, BARCELONA],
  [2010, INTER],
  [2009, BARCELONA],
  [2008, MAN_UTD],
  [2007, MILAN],
  [2006, BARCELONA],
  [2005, LIVERPOOL],
  [2004, PORTO],
  [2003, MILAN],
  [2002, REAL_MADRID],
  [2001, BAYERN],
  [2000, REAL_MADRID],
  [1999, MAN_UTD],
  [1998, REAL_MADRID],
  [1997, DORTMUND],
  [1996, JUVENTUS],
  [1995, AJAX],
  [1994, MILAN],
  [1993, MARSEILLE],
];

/**
 * La Liga champions.
 *
 * Real Madrid and Atlético Madrid appear under the names they carried at the
 * time for the seasons before their present ones: Madrid FC could not use
 * "Real" under the Second Republic, and Atlético were Atlético Aviación during
 * their merger with the air force club. Listing them under the modern name
 * would state something that was not true of those sides.
 *
 * The three seasons of the Civil War were not played and are absent rather than
 * carrying an empty row.
 */
const LA_LIGA_CHAMPIONS: Champion[] = [
  [2026, BARCELONA],
  [2025, BARCELONA],
  [2024, REAL_MADRID],
  [2023, BARCELONA],
  [2022, REAL_MADRID],
  [2021, ATLETICO],
  [2020, REAL_MADRID],
  [2019, BARCELONA],
  [2018, BARCELONA],
  [2017, REAL_MADRID],
  [2016, BARCELONA],
  [2015, BARCELONA],
  [2014, ATLETICO],
  [2013, BARCELONA],
  [2012, REAL_MADRID],
  [2011, BARCELONA],
  [2010, BARCELONA],
  [2009, BARCELONA],
  [2008, REAL_MADRID],
  [2007, REAL_MADRID],
  [2006, BARCELONA],
  [2005, BARCELONA],
  [2004, VALENCIA],
  [2003, REAL_MADRID],
  [2002, VALENCIA],
  [2001, REAL_MADRID],
  [2000, DEPORTIVO],
  [1999, BARCELONA],
  [1998, BARCELONA],
  [1997, REAL_MADRID],
  [1996, ATLETICO],
  [1995, REAL_MADRID],
  [1994, BARCELONA],
  [1993, BARCELONA],
  [1992, BARCELONA],
  [1991, BARCELONA],
  [1990, REAL_MADRID],
  [1989, REAL_MADRID],
  [1988, REAL_MADRID],
  [1987, REAL_MADRID],
  [1986, REAL_MADRID],
  [1985, BARCELONA],
  [1984, ATHLETIC],
  [1983, ATHLETIC],
  [1982, REAL_SOCIEDAD],
  [1981, REAL_SOCIEDAD],
  [1980, REAL_MADRID],
  [1979, REAL_MADRID],
  [1978, REAL_MADRID],
  [1977, ATLETICO],
  [1976, REAL_MADRID],
  [1975, REAL_MADRID],
  [1974, BARCELONA],
  [1973, ATLETICO],
  [1972, REAL_MADRID],
  [1971, VALENCIA],
  [1970, ATLETICO],
  [1969, REAL_MADRID],
  [1968, REAL_MADRID],
  [1967, REAL_MADRID],
  [1966, ATLETICO],
  [1965, REAL_MADRID],
  [1964, REAL_MADRID],
  [1963, REAL_MADRID],
  [1962, REAL_MADRID],
  [1961, REAL_MADRID],
  [1960, BARCELONA],
  [1959, BARCELONA],
  [1958, REAL_MADRID],
  [1957, REAL_MADRID],
  [1956, ATHLETIC],
  [1955, REAL_MADRID],
  [1954, REAL_MADRID],
  [1953, BARCELONA],
  [1952, BARCELONA],
  [1951, ATLETICO],
  [1950, ATLETICO],
  [1949, BARCELONA],
  [1948, BARCELONA],
  [1947, VALENCIA],
  [1946, SEVILLA],
  [1945, BARCELONA],
  [1944, VALENCIA],
  [1943, ATHLETIC],
  [1942, VALENCIA],
  [1941, ATLETICO_AVIACION],
  [1940, ATLETICO_AVIACION],
  [1936, ATHLETIC],
  [1935, BETIS],
  [1934, ATHLETIC],
  [1933, MADRID_FC],
  [1932, MADRID_FC],
  [1931, ATHLETIC],
  [1930, ATHLETIC],
  [1929, BARCELONA],
];

/**
 * Serie A champions.
 *
 * Inter are listed under their present name throughout except for the three
 * titles won as Ambrosiana-Inter, which is how the record lists them.
 *
 * Two seasons are deliberately absent. 1943-44 and 1944-45 were not played, and
 * 2004-05 was awarded to nobody: the title was stripped from Juventus over
 * Calciopoli and left unassigned, so a row naming any club would be false. The
 * 2005-06 title was reassigned to Inter and is listed as theirs.
 */
const SERIE_A_CHAMPIONS: Champion[] = [
  [2026, INTER],
  [2025, NAPOLI],
  [2024, INTER],
  [2023, NAPOLI],
  [2022, MILAN],
  [2021, INTER],
  [2020, JUVENTUS],
  [2019, JUVENTUS],
  [2018, JUVENTUS],
  [2017, JUVENTUS],
  [2016, JUVENTUS],
  [2015, JUVENTUS],
  [2014, JUVENTUS],
  [2013, JUVENTUS],
  [2012, JUVENTUS],
  [2011, MILAN],
  [2010, INTER],
  [2009, INTER],
  [2008, INTER],
  [2007, INTER],
  [2006, INTER],
  [2004, MILAN],
  [2003, JUVENTUS],
  [2002, JUVENTUS],
  [2001, ROMA],
  [2000, LAZIO],
  [1999, MILAN],
  [1998, JUVENTUS],
  [1997, JUVENTUS],
  [1996, MILAN],
  [1995, JUVENTUS],
  [1994, MILAN],
  [1993, MILAN],
  [1992, MILAN],
  [1991, SAMPDORIA],
  [1990, NAPOLI],
  [1989, INTER],
  [1988, MILAN],
  [1987, NAPOLI],
  [1986, JUVENTUS],
  [1985, VERONA],
  [1984, JUVENTUS],
  [1983, ROMA],
  [1982, JUVENTUS],
  [1981, JUVENTUS],
  [1980, INTER],
  [1979, MILAN],
  [1978, JUVENTUS],
  [1977, JUVENTUS],
  [1976, TORINO],
  [1975, JUVENTUS],
  [1974, LAZIO],
  [1973, JUVENTUS],
  [1972, JUVENTUS],
  [1971, INTER],
  [1970, CAGLIARI],
  [1969, FIORENTINA],
  [1968, MILAN],
  [1967, JUVENTUS],
  [1966, INTER],
  [1965, INTER],
  [1964, BOLOGNA],
  [1963, INTER],
  [1962, MILAN],
  [1961, JUVENTUS],
  [1960, JUVENTUS],
  [1959, MILAN],
  [1958, JUVENTUS],
  [1957, MILAN],
  [1956, FIORENTINA],
  [1955, MILAN],
  [1954, INTER],
  [1953, INTER],
  [1952, JUVENTUS],
  [1951, MILAN],
  [1950, JUVENTUS],
  [1949, TORINO],
  [1948, TORINO],
  [1947, TORINO],
  [1946, TORINO],
  [1943, TORINO],
  [1942, ROMA],
  [1941, BOLOGNA],
  [1940, AMBROSIANA],
  [1939, BOLOGNA],
  [1938, AMBROSIANA],
  [1937, BOLOGNA],
  [1936, BOLOGNA],
  [1935, JUVENTUS],
  [1934, JUVENTUS],
  [1933, JUVENTUS],
  [1932, JUVENTUS],
  [1931, JUVENTUS],
  [1930, AMBROSIANA],
];

/**
 * Bundesliga champions.
 *
 * The Bundesliga era only, from its 1963-64 foundation. German championships
 * decided before then were played under a different format and are not
 * Bundesliga titles, which is why Bayern's 1932 championship is absent and
 * their count here is 34 rather than the 35 their honours list carries.
 */
const BUNDESLIGA_CHAMPIONS: Champion[] = [
  [2026, BAYERN],
  [2025, BAYERN],
  [2024, LEVERKUSEN],
  [2023, BAYERN],
  [2022, BAYERN],
  [2021, BAYERN],
  [2020, BAYERN],
  [2019, BAYERN],
  [2018, BAYERN],
  [2017, BAYERN],
  [2016, BAYERN],
  [2015, BAYERN],
  [2014, BAYERN],
  [2013, BAYERN],
  [2012, DORTMUND],
  [2011, DORTMUND],
  [2010, BAYERN],
  [2009, WOLFSBURG],
  [2008, BAYERN],
  [2007, STUTTGART],
  [2006, BAYERN],
  [2005, BAYERN],
  [2004, WERDER],
  [2003, BAYERN],
  [2002, DORTMUND],
  [2001, BAYERN],
  [2000, BAYERN],
  [1999, BAYERN],
  [1998, KAISERSLAUTERN],
  [1997, BAYERN],
  [1996, DORTMUND],
  [1995, DORTMUND],
  [1994, BAYERN],
  [1993, WERDER],
  [1992, STUTTGART],
  [1991, KAISERSLAUTERN],
  [1990, BAYERN],
  [1989, BAYERN],
  [1988, WERDER],
  [1987, BAYERN],
  [1986, BAYERN],
  [1985, BAYERN],
  [1984, STUTTGART],
  [1983, HAMBURG],
  [1982, HAMBURG],
  [1981, BAYERN],
  [1980, BAYERN],
  [1979, HAMBURG],
  [1978, KOLN],
  [1977, MONCHENGLADBACH],
  [1976, MONCHENGLADBACH],
  [1975, MONCHENGLADBACH],
  [1974, BAYERN],
  [1973, BAYERN],
  [1972, BAYERN],
  [1971, MONCHENGLADBACH],
  [1970, MONCHENGLADBACH],
  [1969, BAYERN],
  [1968, NURNBERG],
  [1967, BRAUNSCHWEIG],
  [1966, MUNICH_1860],
  [1965, WERDER],
  [1964, KOLN],
];

/**
 * Ligue 1 champions.
 *
 * 1992-93 is absent: Marseille finished top and the title was withheld after
 * the match-fixing affair, so the season has no champion to list. The six
 * seasons of the Second World War were not played.
 */
const LIGUE_1_CHAMPIONS: Champion[] = [
  [2026, PSG],
  [2025, PSG],
  [2024, PSG],
  [2023, PSG],
  [2022, PSG],
  [2021, LILLE],
  [2020, PSG],
  [2019, PSG],
  [2018, PSG],
  [2017, MONACO],
  [2016, PSG],
  [2015, PSG],
  [2014, PSG],
  [2013, PSG],
  [2012, MONTPELLIER],
  [2011, LILLE],
  [2010, MARSEILLE],
  [2009, BORDEAUX],
  [2008, LYON],
  [2007, LYON],
  [2006, LYON],
  [2005, LYON],
  [2004, LYON],
  [2003, LYON],
  [2002, LYON],
  [2001, NANTES],
  [2000, MONACO],
  [1999, BORDEAUX],
  [1998, LENS],
  [1997, MONACO],
  [1996, AUXERRE],
  [1995, NANTES],
  [1994, PSG],
  [1992, MARSEILLE],
  [1991, MARSEILLE],
  [1990, MARSEILLE],
  [1989, MARSEILLE],
  [1988, MONACO],
  [1987, BORDEAUX],
  [1986, PSG],
  [1985, BORDEAUX],
  [1984, BORDEAUX],
  [1983, NANTES],
  [1982, MONACO],
  [1981, SAINT_ETIENNE],
  [1980, NANTES],
  [1979, STRASBOURG],
  [1978, MONACO],
  [1977, NANTES],
  [1976, SAINT_ETIENNE],
  [1975, SAINT_ETIENNE],
  [1974, SAINT_ETIENNE],
  [1973, NANTES],
  [1972, MARSEILLE],
  [1971, MARSEILLE],
  [1970, SAINT_ETIENNE],
  [1969, SAINT_ETIENNE],
  [1968, SAINT_ETIENNE],
  [1967, SAINT_ETIENNE],
  [1966, NANTES],
  [1965, NANTES],
  [1964, SAINT_ETIENNE],
  [1963, MONACO],
  [1962, REIMS],
  [1961, MONACO],
  [1960, REIMS],
  [1959, NICE],
  [1958, REIMS],
  [1957, SAINT_ETIENNE],
  [1956, NICE],
  [1955, REIMS],
  [1954, LILLE],
  [1953, REIMS],
  [1952, NICE],
  [1951, NICE],
  [1950, BORDEAUX],
  [1949, REIMS],
  [1948, MARSEILLE],
  [1947, ROUBAIX],
  [1946, LILLE],
  [1939, SETE],
  [1938, SOCHAUX],
  [1937, MARSEILLE],
  [1936, RACING_PARIS],
  [1935, SOCHAUX],
  [1934, SETE],
  [1933, LILLOIS],
];

export const COMPETITION_RANKING_SEEDS: Record<string, CompetitionRankingSeed[]> = {
  'premier-league': [
    champions(
      PREMIER_LEAGUE_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_English_football_champions',
      '2026-08-23',
      'Premier League era only, from its 1992-93 foundation.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_footballers_with_500_or_more_Premier_League_appearances',
      '2026-05-24',
      [
        ['James Milner', 658, 'Liverpool, Man City, Aston Villa, Newcastle, Leeds, Brighton'],
        ['Gareth Barry', 653, 'Aston Villa, Man City, Everton, West Brom'],
        ['Ryan Giggs', 632, 'Manchester United'],
        ['Frank Lampard', 609, 'Chelsea, West Ham, Man City'],
        ['David James', 572, 'Liverpool, Portsmouth, Man City, Aston Villa, West Ham'],
        ['Gary Speed', 535, 'Newcastle, Leeds, Bolton, Everton'],
        ['Emile Heskey', 516, 'Liverpool, Leicester, Aston Villa, Wigan, Birmingham'],
        ['Mark Schwarzer', 514, 'Middlesbrough, Fulham, Leicester, Chelsea'],
        ['Jamie Carragher', 508, 'Liverpool'],
        ['Phil Neville', 505, 'Manchester United, Everton'],
      ],
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_footballers_with_100_or_more_Premier_League_goals',
      '2026-05-24',
      [
        ['Alan Shearer', 260, 'Blackburn, Newcastle'],
        ['Harry Kane', 213, 'Tottenham, Norwich'],
        ['Wayne Rooney', 208, 'Everton, Manchester United'],
        ['Mohamed Salah', 193, 'Chelsea, Liverpool'],
        ['Andy Cole', 187, 'Newcastle, Manchester United, Blackburn, Fulham, Man City'],
        ['Sergio Agüero', 184, 'Manchester City'],
        ['Frank Lampard', 177, 'West Ham, Chelsea, Man City'],
        ['Thierry Henry', 175, 'Arsenal'],
        ['Robbie Fowler', 163, 'Liverpool, Leeds, Man City, Blackburn'],
        ['Jermain Defoe', 162, 'West Ham, Tottenham, Portsmouth, Sunderland, Bournemouth'],
      ],
    ),
    // The league's own award rather than the PFA one, which is voted by fellow
    // professionals and is a different prize with a different list of winners.
    // The two are routinely confused, to the point that the source page carries
    // an editor's warning about it. This one is chosen because it is the
    // league's, and because the PFA award for 2025-26 is not yet published
    // while this one is.
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Premier_League_Player_of_the_Season',
      '2026-08-23',
      'The Premier League Player of the Season, awarded since 1994-95.',
      [
        [2026, 'Bruno Fernandes', null, MAN_UTD],
        [2025, 'Mohamed Salah', null, LIVERPOOL],
        [2024, 'Phil Foden', null, MAN_CITY],
        [2023, 'Erling Haaland', null, MAN_CITY],
        [2022, 'Kevin De Bruyne', null, MAN_CITY],
        [2021, 'Rúben Dias', null, MAN_CITY],
        [2020, 'Kevin De Bruyne', null, MAN_CITY],
        [2019, 'Virgil van Dijk', null, LIVERPOOL],
        [2018, 'Mohamed Salah', null, LIVERPOOL],
        [2017, "N'Golo Kanté", null, CHELSEA],
      ],
    ),
    // Joint winners share a season and appear as consecutive rows on the same
    // year, which is why the table is not keyed by season.
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/Premier_League_Golden_Boot',
      '2026-08-23',
      'Goals scored. Seasons with joint winners list each of them.',
      [
        [2026, 'Erling Haaland', 27, MAN_CITY],
        [2025, 'Mohamed Salah', 29, LIVERPOOL],
        [2024, 'Erling Haaland', 27, MAN_CITY],
        [2023, 'Erling Haaland', 36, MAN_CITY],
        [2022, 'Mohamed Salah', 23, LIVERPOOL],
        [2022, 'Son Heung-min', 23, 'Tottenham Hotspur F.C.'],
        [2021, 'Harry Kane', 23, 'Tottenham Hotspur F.C.'],
        [2020, 'Jamie Vardy', 23, LEICESTER],
        [2019, 'Pierre-Emerick Aubameyang', 22, ARSENAL],
        [2019, 'Sadio Mané', 22, LIVERPOOL],
        [2019, 'Mohamed Salah', 22, LIVERPOOL],
        [2018, 'Mohamed Salah', 32, LIVERPOOL],
        [2017, 'Harry Kane', 29, 'Tottenham Hotspur F.C.'],
        [2016, 'Harry Kane', 25, 'Tottenham Hotspur F.C.'],
        [2015, 'Sergio Agüero', 26, MAN_CITY],
        [2014, 'Luis Suárez', 31, LIVERPOOL],
        [2013, 'Robin van Persie', 26, MAN_UTD],
        [2012, 'Robin van Persie', 30, ARSENAL],
        [2011, 'Carlos Tevez', 20, MAN_CITY],
        [2011, 'Dimitar Berbatov', 20, MAN_UTD],
        [2010, 'Didier Drogba', 29, CHELSEA],
        [2009, 'Nicolas Anelka', 19, CHELSEA],
        [2008, 'Cristiano Ronaldo', 31, MAN_UTD],
        [2007, 'Didier Drogba', 20, CHELSEA],
        [2006, 'Thierry Henry', 27, ARSENAL],
        [2005, 'Thierry Henry', 25, ARSENAL],
        [2004, 'Thierry Henry', 30, ARSENAL],
        [2003, 'Ruud van Nistelrooy', 25, MAN_UTD],
        [2002, 'Thierry Henry', 24, ARSENAL],
        [2001, 'Jimmy Floyd Hasselbaink', 23, CHELSEA],
      ],
    ),
    seasons(
      'award:best-goalkeeper',
      'Golden Glove',
      'https://en.wikipedia.org/wiki/Premier_League_Golden_Glove',
      '2026-08-23',
      'Clean sheets kept. Seasons with joint winners list each of them.',
      [
        [2026, 'David Raya', 19, ARSENAL],
        [2025, 'David Raya', 13, ARSENAL],
        [2025, 'Matz Sels', 13, 'Nottingham Forest F.C.'],
        [2024, 'David Raya', 16, ARSENAL],
        [2023, 'David de Gea', 17, MAN_UTD],
        [2022, 'Alisson', 20, LIVERPOOL],
        [2022, 'Ederson', 20, MAN_CITY],
        [2021, 'Ederson', 19, MAN_CITY],
        [2020, 'Ederson', 16, MAN_CITY],
        [2019, 'Alisson', 21, LIVERPOOL],
        [2018, 'David de Gea', 18, MAN_UTD],
        [2017, 'Thibaut Courtois', 16, CHELSEA],
        [2016, 'Petr Čech', 16, ARSENAL],
        [2015, 'Joe Hart', 14, MAN_CITY],
        [2014, 'Petr Čech', 16, CHELSEA],
        [2014, 'Wojciech Szczęsny', 16, ARSENAL],
        [2013, 'Joe Hart', 18, MAN_CITY],
        [2012, 'Joe Hart', 17, MAN_CITY],
        [2011, 'Joe Hart', 18, MAN_CITY],
        [2010, 'Petr Čech', 17, CHELSEA],
        [2009, 'Edwin van der Sar', 21, MAN_UTD],
        [2008, 'Pepe Reina', 18, LIVERPOOL],
        [2007, 'Pepe Reina', 19, LIVERPOOL],
        [2006, 'Pepe Reina', 20, LIVERPOOL],
        [2005, 'Petr Čech', 24, CHELSEA],
      ],
    ),
  ],

  'uefa-champions-league': [
    champions(
      CHAMPIONS_LEAGUE_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_finals',
      '2026-08-23',
      'Champions League era only, from the 1992-93 rebrand. The 37 European Cup finals played between 1956 and 1992 are not included.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_footballers_with_100_or_more_UEFA_Champions_League_appearances',
      '2026-05-30',
      [
        ['Cristiano Ronaldo', 183, 'Manchester United, Real Madrid, Juventus'],
        ['Iker Casillas', 177, 'Real Madrid, Porto'],
        ['Lionel Messi', 163, 'Barcelona, Paris Saint-Germain'],
        ['Thomas Müller', 163, 'Bayern Munich'],
        ['Manuel Neuer', 161, 'Schalke 04, Bayern Munich'],
        ['Karim Benzema', 152, 'Lyon, Real Madrid'],
        ['Xavi', 151, 'Barcelona'],
        ['Toni Kroos', 151, 'Bayern Munich, Real Madrid'],
        ['Robert Lewandowski', 144, 'Dortmund, Bayern Munich, Barcelona'],
        ['Raúl', 142, 'Real Madrid, Schalke 04'],
      ],
      'Competition proper from 1992-93 onward; qualifying rounds are excluded.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_top_scorers',
      '2026-05-30',
      [
        ['Cristiano Ronaldo', 140, 'Manchester United, Real Madrid, Juventus'],
        ['Lionel Messi', 129, 'Barcelona, Paris Saint-Germain'],
        ['Robert Lewandowski', 109, 'Dortmund, Bayern Munich, Barcelona'],
        ['Karim Benzema', 90, 'Lyon, Real Madrid'],
        ['Raúl', 71, 'Real Madrid, Schalke 04'],
        ['Kylian Mbappé', 70, 'Monaco, Paris Saint-Germain, Real Madrid'],
        ['Erling Haaland', 57, 'Salzburg, Dortmund, Manchester City'],
        ['Thomas Müller', 57, 'Bayern Munich'],
        ['Ruud van Nistelrooy', 56, 'PSV, Manchester United, Real Madrid'],
        ['Harry Kane', 54, 'Tottenham, Bayern Munich'],
      ],
      // The source counts European Cup goals alongside Champions League ones,
      // unlike the appearances table beside it. None of these ten played before
      // 1992, so the ten rows are unaffected, but the two tables are not built
      // on the same basis and should not be extended without re-reading both.
      'Includes European Cup goals scored before the 1992-93 rebrand; qualifying rounds are excluded.',
    ),
    // UEFA has named a Champions League Player of the Season only since 2021-22.
    // The UEFA Men's Player of the Year, which ran to 2023, is a different award
    // covering every competition and is deliberately not merged in here.
    seasons(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/UEFA_Club_Football_Awards',
      '2026-08-23',
      'The Champions League Player of the Season, awarded since 2021-22.',
      [
        [2026, 'Khvicha Kvaratskhelia', null, PSG],
        [2025, 'Ousmane Dembélé', null, PSG],
        [2024, 'Vinícius Júnior', null, REAL_MADRID],
        [2023, 'Rodri', null, MAN_CITY],
        [2022, 'Karim Benzema', null, REAL_MADRID],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/List_of_UEFA_Champions_League_top_scorers',
      '2026-08-23',
      'Goals in the competition proper; qualifying rounds are excluded. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Kylian Mbappé', 15, REAL_MADRID],
        [2025, 'Serhou Guirassy', 13, DORTMUND],
        [2025, 'Raphinha', 13, BARCELONA],
        [2024, 'Harry Kane', 8, BAYERN],
        [2024, 'Kylian Mbappé', 8, PSG],
        [2023, 'Erling Haaland', 12, MAN_CITY],
        [2022, 'Karim Benzema', 15, REAL_MADRID],
        [2021, 'Erling Haaland', 10, DORTMUND],
        [2020, 'Robert Lewandowski', 15, BAYERN],
        [2019, 'Lionel Messi', 12, BARCELONA],
        [2018, 'Cristiano Ronaldo', 15, REAL_MADRID],
        [2017, 'Cristiano Ronaldo', 12, REAL_MADRID],
        [2016, 'Cristiano Ronaldo', 16, REAL_MADRID],
        [2015, 'Neymar', 10, BARCELONA],
        [2015, 'Cristiano Ronaldo', 10, REAL_MADRID],
        [2015, 'Lionel Messi', 10, BARCELONA],
        [2014, 'Cristiano Ronaldo', 17, REAL_MADRID],
        [2013, 'Cristiano Ronaldo', 12, REAL_MADRID],
        [2012, 'Lionel Messi', 14, BARCELONA],
        [2011, 'Lionel Messi', 12, BARCELONA],
        [2010, 'Lionel Messi', 8, BARCELONA],
        [2009, 'Lionel Messi', 9, BARCELONA],
        [2008, 'Cristiano Ronaldo', 8, MAN_UTD],
        [2007, 'Kaká', 10, MILAN],
        [2006, 'Andriy Shevchenko', 9, MILAN],
        [2005, 'Ruud van Nistelrooy', 8, MAN_UTD],
        [2004, 'Fernando Morientes', 9, MONACO],
        [2003, 'Ruud van Nistelrooy', 12, MAN_UTD],
        [2002, 'Ruud van Nistelrooy', 10, MAN_UTD],
        [2001, 'Raúl', 7, REAL_MADRID],
      ],
    ),
    // UEFA's Goalkeeper of the Season ran for five seasons and was discontinued
    // after 2020-21. Since then the only goalkeeper UEFA names is the one in the
    // Champions League Team of the Season, which is a squad selection rather
    // than an award, so the two are not merged: the table stops where the award
    // stopped rather than continuing under the same heading with a different
    // kind of honour.
    seasons(
      'award:best-goalkeeper',
      'Goalkeeper of the season',
      'https://en.wikipedia.org/wiki/UEFA_Club_Football_Awards',
      '2026-08-23',
      'Awarded from 2016-17 to 2020-21 and discontinued thereafter.',
      [
        [2021, 'Édouard Mendy', null, CHELSEA],
        [2020, 'Manuel Neuer', null, BAYERN],
        [2019, 'Alisson', null, LIVERPOOL],
        [2018, 'Keylor Navas', null, REAL_MADRID],
        [2017, 'Gianluigi Buffon', null, JUVENTUS],
      ],
    ),
  ],

  'uefa-european-championship': [
    editions(
      [
        [2024, SPAIN],
        [2020, ITALY],
        [2016, PORTUGAL],
        [2012, SPAIN],
        [2008, SPAIN],
        [2004, GREECE],
        [2000, FRANCE],
        [1996, GERMANY],
        [1992, DENMARK],
        [1988, NETHERLANDS],
        [1984, FRANCE],
        [1980, WEST_GERMANY],
        [1976, CZECHOSLOVAKIA],
        [1972, WEST_GERMANY],
        [1968, ITALY],
        [1964, SPAIN],
        [1960, SOVIET_UNION],
      ],
      'https://en.wikipedia.org/wiki/UEFA_European_Championship',
      '2026-08-23',
      'Euro 2020 was played in 2021 and is listed under the year it is named for. The 1960 and 1964 editions were titled the European Nations’ Cup.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_players_who_have_appeared_in_multiple_UEFA_European_Championships',
      '2026-08-23',
      [
        ['Cristiano Ronaldo', 30, 'Portugal · 2004–2024'],
        ['Pepe', 23, 'Portugal · 2008–2024'],
        ['Manuel Neuer', 20, 'Germany · 2012–2024'],
        ['Toni Kroos', 19, 'Germany · 2012–2024'],
        ['João Moutinho', 19, 'Portugal · 2008–2020'],
        ['Leonardo Bonucci', 18, 'Italy · 2012–2020'],
        ['Harry Kane', 18, 'England · 2016–2024'],
        ['Bastian Schweinsteiger', 18, 'Germany · 2004–2016'],
        ['Gianluigi Buffon', 17, 'Italy · 2004–2016'],
        ['Giorgio Chiellini', 17, 'Italy · 2008–2020'],
        ['Antoine Griezmann', 17, 'France · 2016–2024'],
        ['Álvaro Morata', 17, 'Spain · 2016–2024'],
        ['Thomas Müller', 17, 'Germany · 2012–2024'],
      ],
      'Final tournaments only. Five players share ninth place and all are shown.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/UEFA_European_Championship_top_goalscorers',
      '2026-08-23',
      [
        ['Cristiano Ronaldo', 14, 'Portugal · 2004–2024'],
        ['Michel Platini', 9, 'France · 1984'],
        ['Alan Shearer', 7, 'England · 1992–2000'],
        ['Antoine Griezmann', 7, 'France · 2016–2024'],
        ['Álvaro Morata', 7, 'Spain · 2016–2024'],
        ['Harry Kane', 7, 'England · 2016–2024'],
        ['Patrik Schick', 6, 'Czech Republic · 2020–2024'],
        ['Ruud van Nistelrooy', 6, 'Netherlands · 2004–2008'],
        ['Patrick Kluivert', 6, 'Netherlands · 1996–2004'],
        ['Wayne Rooney', 6, 'England · 2004–2016'],
      ],
      'Final tournaments only. Several more players share the sixth-place total of six goals.',
    ),
    // UEFA has named this officially only since 1996. The retrospective picks
    // it published for 1984, 1988 and 1992 are labelled unofficial by the
    // source and are left out rather than presented as the same award.
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/UEFA_European_Championship_Player_of_the_Tournament',
      '2026-08-23',
      'The official award, presented since 1996.',
      [
        [2024, 'Rodri', null, SPAIN],
        [2020, 'Gianluigi Donnarumma', null, ITALY],
        [2016, 'Antoine Griezmann', null, FRANCE],
        [2012, 'Andrés Iniesta', null, SPAIN],
        [2008, 'Xavi', null, SPAIN],
        [2004, 'Theodoros Zagorakis', null, GREECE],
        [2000, 'Zinedine Zidane', null, FRANCE],
        [1996, 'Matthias Sammer', null, GERMANY],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/UEFA_European_Championship_top_goalscorers',
      '2026-08-23',
      'Goals scored in the final tournament. Editions with joint leading scorers list each of them.',
      [
        [2024, 'Harry Kane', 3, 'England'],
        [2024, 'Georges Mikautadze', 3, 'Georgia'],
        [2024, 'Jamal Musiala', 3, 'Germany'],
        [2024, 'Cody Gakpo', 3, 'Netherlands'],
        [2024, 'Ivan Schranz', 3, 'Slovakia'],
        [2024, 'Dani Olmo', 3, 'Spain'],
        [2020, 'Patrik Schick', 5, 'Czech Republic'],
        [2020, 'Cristiano Ronaldo', 5, 'Portugal'],
        [2016, 'Antoine Griezmann', 6, 'France'],
        [2012, 'Mario Mandžukić', 3, 'Croatia'],
        [2012, 'Mario Gómez', 3, 'Germany'],
        [2012, 'Mario Balotelli', 3, 'Italy'],
        [2012, 'Cristiano Ronaldo', 3, 'Portugal'],
        [2012, 'Alan Dzagoev', 3, 'Russia'],
        [2012, 'Fernando Torres', 3, 'Spain'],
        [2008, 'David Villa', 4, 'Spain'],
        [2004, 'Milan Baroš', 5, 'Czech Republic'],
        [2000, 'Patrick Kluivert', 5, 'Netherlands'],
        [2000, 'Savo Milošević', 5, 'FR Yugoslavia'],
        [1996, 'Alan Shearer', 5, 'England'],
        [1992, 'Henrik Larsen', 3, 'Denmark'],
        [1992, 'Karl-Heinz Riedle', 3, 'Germany'],
        [1992, 'Dennis Bergkamp', 3, 'Netherlands'],
        [1992, 'Tomas Brolin', 3, 'Sweden'],
        [1988, 'Marco van Basten', 5, 'Netherlands'],
        [1984, 'Michel Platini', 9, 'France'],
        [1980, 'Klaus Allofs', 3, 'West Germany'],
        [1976, 'Dieter Müller', 4, 'West Germany'],
        [1972, 'Gerd Müller', 4, 'West Germany'],
      ],
    ),
  ],

  'copa-america': [
    // Two tournaments were played in 1959, so the year alone does not identify
    // an edition. The host is carried in the caveat rather than the row, since
    // the table's own year column has to stay numeric.
    editions(
      [
        [2024, ARGENTINA],
        [2021, ARGENTINA],
        [2019, BRAZIL],
        [2016, CHILE],
        [2015, CHILE],
        [2011, URUGUAY],
        [2007, BRAZIL],
        [2004, BRAZIL],
        [2001, COLOMBIA],
        [1999, BRAZIL],
        [1997, BRAZIL],
        [1995, URUGUAY],
        [1993, ARGENTINA],
        [1991, ARGENTINA],
        [1989, BRAZIL],
        [1987, URUGUAY],
        [1983, URUGUAY],
        [1979, PARAGUAY],
        [1975, PERU],
        [1967, URUGUAY],
        [1963, BOLIVIA],
        [1959, URUGUAY],
        [1957, ARGENTINA],
        [1956, URUGUAY],
        [1955, ARGENTINA],
        [1953, PARAGUAY],
        [1949, BRAZIL],
        [1947, ARGENTINA],
        [1946, ARGENTINA],
        [1945, ARGENTINA],
        [1942, URUGUAY],
        [1941, ARGENTINA],
        [1939, PERU],
        [1937, ARGENTINA],
        [1935, URUGUAY],
        [1929, ARGENTINA],
        [1927, ARGENTINA],
        [1926, URUGUAY],
        [1925, ARGENTINA],
        [1924, URUGUAY],
        [1923, URUGUAY],
        [1922, BRAZIL],
        [1921, ARGENTINA],
        [1920, URUGUAY],
        [1919, BRAZIL],
        [1917, URUGUAY],
        [1916, URUGUAY],
      ],
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica',
      '2026-08-23',
      'Two editions were played in 1959, won by Argentina (hosted in Argentina) and Uruguay (hosted in Ecuador); the Uruguayan title is the one listed here. Editions before 1975 were titled the South American Championship.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica_records_and_statistics',
      '2026-08-23',
      [
        ['Lionel Messi', 39, 'Argentina · 2007–2024'],
        ['Sergio Livingstone', 34, 'Chile · 1941–1953'],
        ['Zizinho', 33, 'Brazil · 1942–1957'],
        ['Víctor Ugarte', 30, 'Bolivia · 1947–1959'],
        ['Ángel Di María', 28, 'Argentina · 2011–2024'],
        ['Paolo Guerrero', 28, 'Peru · 2007–2024'],
        ['Leonel Álvarez', 27, 'Colombia · 1987–1995'],
        ['Claudio Bravo', 27, 'Chile · 2004–2024'],
        ['Mauricio Isla', 27, 'Chile · 2011–2024'],
        ['Gary Medel', 27, 'Chile · 2011–2021'],
        ['Nicolás Otamendi', 27, 'Argentina · 2015–2024'],
        ['Carlos Valderrama', 27, 'Colombia · 1987–1995'],
        ['Yoshimar Yotún', 27, 'Peru · 2011–2021'],
      ],
      'Seven players share seventh place and all are shown.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica_records_and_statistics',
      '2026-08-23',
      [
        ['Norberto Méndez', 17, 'Argentina'],
        ['Zizinho', 17, 'Brazil'],
        ['Teodoro Fernández', 15, 'Peru'],
        ['Severino Varela', 15, 'Uruguay'],
        ['Paolo Guerrero', 14, 'Peru'],
        ['Lionel Messi', 14, 'Argentina'],
        ['Eduardo Vargas', 14, 'Chile'],
        ['Ademir', 13, 'Brazil'],
        ['Gabriel Batistuta', 13, 'Argentina'],
        ['Jair', 13, 'Brazil'],
        ['José Manuel Moreno', 13, 'Argentina'],
        ['Héctor Scarone', 13, 'Uruguay'],
      ],
      'Five players share eighth place and all are shown. The source records no year spans for this table.',
    ),
    // Official from 1987. The retrospective picks the source carries for the
    // earlier editions are marked unofficial there and are not merged in.
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica_awards',
      '2026-08-23',
      'The official best player award, presented since 1987.',
      [
        [2024, 'James Rodríguez', null, COLOMBIA],
        [2021, 'Lionel Messi', null, ARGENTINA],
        [2019, 'Dani Alves', null, BRAZIL],
        [2016, 'Alexis Sánchez', null, CHILE],
        [2015, 'Lionel Messi', null, ARGENTINA],
        [2011, 'Luis Suárez', null, URUGUAY],
        [2007, 'Robinho', null, BRAZIL],
        [2004, 'Adriano', null, BRAZIL],
        [2001, 'Amado Guevara', null, 'Honduras'],
        [1999, 'Rivaldo', null, BRAZIL],
        [1997, 'Ronaldo', null, BRAZIL],
        [1995, 'Enzo Francescoli', null, URUGUAY],
        [1993, 'Sergio Goycochea', null, ARGENTINA],
        [1991, 'Leonardo Rodríguez', null, ARGENTINA],
        [1989, 'Rubén Sosa', null, URUGUAY],
        [1987, 'Carlos Valderrama', null, COLOMBIA],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica_awards',
      '2026-08-23',
      'Goals scored in the tournament. Editions with joint leading scorers list each of them.',
      [
        [2024, 'Lautaro Martínez', 5, 'Argentina'],
        [2021, 'Lionel Messi', 4, 'Argentina'],
        [2021, 'Luis Díaz', 4, 'Colombia'],
        [2019, 'Everton Soares', 3, 'Brazil'],
        [2019, 'Paolo Guerrero', 3, 'Peru'],
        [2016, 'Eduardo Vargas', 6, 'Chile'],
        [2015, 'Eduardo Vargas', 4, 'Chile'],
        [2015, 'Paolo Guerrero', 4, 'Peru'],
        [2011, 'Paolo Guerrero', 5, 'Peru'],
        [2007, 'Robinho', 6, 'Brazil'],
        [2004, 'Adriano', 7, 'Brazil'],
        [2001, 'Víctor Aristizábal', 6, 'Colombia'],
        [1999, 'Rivaldo', 5, 'Brazil'],
        [1999, 'Ronaldo', 5, 'Brazil'],
        [1997, 'Luis Hernández', 6, 'Mexico'],
        [1995, 'Gabriel Batistuta', 4, 'Argentina'],
        [1995, 'Luis García', 4, 'Mexico'],
        [1993, 'José Luis Dolgetta', 4, 'Venezuela'],
        [1991, 'Gabriel Batistuta', 6, 'Argentina'],
        [1989, 'Bebeto', 6, 'Brazil'],
        [1987, 'Arnoldo Iguarán', 4, 'Colombia'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Golden Glove',
      'https://en.wikipedia.org/wiki/Copa_Am%C3%A9rica_awards',
      '2026-08-23',
      'First presented in 2011; earlier editions had no goalkeeping award.',
      [
        [2024, 'Emiliano Martínez', null, ARGENTINA],
        [2021, 'Emiliano Martínez', null, ARGENTINA],
        [2019, 'Alisson', null, BRAZIL],
        [2016, 'Claudio Bravo', null, CHILE],
        [2015, 'Claudio Bravo', null, CHILE],
        [2011, 'Justo Villar', null, PARAGUAY],
      ],
    ),
  ],

  'africa-cup-of-nations': [
    editions(
      [
        [2025, MOROCCO],
        [2023, IVORY_COAST],
        [2021, SENEGAL],
        [2019, ALGERIA],
        [2017, CAMEROON],
        [2015, IVORY_COAST],
        [2013, NIGERIA],
        [2012, ZAMBIA],
        [2010, EGYPT],
        [2008, EGYPT],
        [2006, EGYPT],
        [2004, TUNISIA],
        [2002, CAMEROON],
        [2000, CAMEROON],
        [1998, EGYPT],
        [1996, SOUTH_AFRICA],
        [1994, NIGERIA],
        [1992, IVORY_COAST],
        [1990, ALGERIA],
        [1988, CAMEROON],
        [1986, EGYPT],
        [1984, CAMEROON],
        [1982, GHANA],
        [1980, NIGERIA],
        [1978, GHANA],
        [1976, MOROCCO],
        [1974, ZAIRE],
        [1972, CONGO],
        [1970, SUDAN],
        [1968, DR_CONGO],
        [1965, GHANA],
        [1963, GHANA],
        [1962, ETHIOPIA],
        [1959, UAR],
        [1957, EGYPT],
      ],
      'https://en.wikipedia.org/wiki/List_of_Africa_Cup_of_Nations_finals',
      '2026-08-23',
      'The 2025 final finished 1–0 to Senegal on the pitch; in March 2026 the CAF Appeal Board recorded it as a 3–0 Morocco win after Senegal were ruled to have forfeited, and the title now stands with Morocco. Several early champions are listed under the names they carried at the time.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/Africa_Cup_of_Nations_records_and_statistics',
      '2026-08-23',
      [
        ['Samuel Eto’o', 18, 'Cameroon · 2000–2010'],
        ['Laurent Pokou', 14, 'Ivory Coast · 1968–1980'],
        ['Rashidi Yekini', 13, 'Nigeria · 1988–1994'],
        ['Hassan El-Shazly', 12, 'Egypt · 1963–1974'],
        ['Patrick Mboma', 11, 'Cameroon · 1998–2004'],
        ['Hossam Hassan', 11, 'Egypt · 1986–2006'],
        ['Didier Drogba', 11, 'Ivory Coast · 2006–2013'],
        ['Mohamed Salah', 11, 'Egypt · 2017–2025'],
        ['Sadio Mané', 11, 'Senegal · 2015–2025'],
      ],
      'Five players share fifth place and all are shown. The source publishes no all-time appearances ranking for this tournament.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/Africa_Cup_of_Nations_awards',
      '2026-08-23',
      'The best player award, presented at every edition since 1957.',
      [
        [2025, 'Sadio Mané', null, SENEGAL],
        [2023, 'William Troost-Ekong', null, NIGERIA],
        [2021, 'Sadio Mané', null, SENEGAL],
        [2019, 'Ismaël Bennacer', null, ALGERIA],
        [2017, 'Christian Bassogog', null, CAMEROON],
        [2015, 'Christian Atsu', null, GHANA],
        [2013, 'Jonathan Pitroipa', null, 'Burkina Faso'],
        [2012, 'Christopher Katongo', null, ZAMBIA],
        [2010, 'Ahmed Hassan', null, EGYPT],
        [2008, 'Hosny Abd Rabo', null, EGYPT],
        [2006, 'Ahmed Hassan', null, EGYPT],
        [2004, 'Jay-Jay Okocha', null, NIGERIA],
        [2002, 'Rigobert Song', null, CAMEROON],
        [2000, 'Lauren', null, CAMEROON],
        [1998, 'Benni McCarthy', null, SOUTH_AFRICA],
        [1996, 'Kalusha Bwalya', null, ZAMBIA],
        [1994, 'Rashidi Yekini', null, NIGERIA],
        [1992, 'Abedi Pele', null, GHANA],
        [1990, 'Rabah Madjer', null, ALGERIA],
        [1988, 'Roger Milla', null, CAMEROON],
        [1986, 'Roger Milla', null, CAMEROON],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/Africa_Cup_of_Nations_awards',
      '2026-08-23',
      'Goals scored in the tournament. Editions with joint leading scorers list each of them.',
      [
        [2025, 'Brahim Díaz', 5, 'Morocco'],
        [2023, 'Emilio Nsue', 5, 'Equatorial Guinea'],
        [2021, 'Vincent Aboubakar', 8, 'Cameroon'],
        [2019, 'Odion Ighalo', 5, 'Nigeria'],
        [2017, 'Junior Kabananga', 3, 'DR Congo'],
        [2013, 'Mubarak Wakaso', 4, 'Ghana'],
        [2013, 'Emmanuel Emenike', 4, 'Nigeria'],
        [2010, 'Mohamed Nagy', 5, 'Egypt'],
        [2008, 'Samuel Eto’o', 5, 'Cameroon'],
        [2006, 'Samuel Eto’o', 5, 'Cameroon'],
        [2000, 'Shaun Bartlett', 5, 'South Africa'],
        [1996, 'Kalusha Bwalya', 5, 'Zambia'],
        [1994, 'Rashidi Yekini', 5, 'Nigeria'],
        [1992, 'Rashidi Yekini', 4, 'Nigeria'],
        [1990, 'Djamel Menad', 4, 'Algeria'],
        [1986, 'Roger Milla', 4, 'Cameroon'],
        [1984, 'Taher Abouzaid', 4, 'Egypt'],
        [1982, 'George Alhassan', 4, 'Ghana'],
        [1974, 'Ndaye Mulamba', 9, 'Zaire'],
        [1972, 'Salif Keïta', 5, 'Mali'],
        [1970, 'Laurent Pokou', 8, 'Ivory Coast'],
        [1968, 'Laurent Pokou', 6, 'Ivory Coast'],
        [1963, 'Hassan El-Shazly', 6, 'United Arab Republic'],
        [1957, 'Mohamed Diab El-Attar', 5, 'Egypt'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Best goalkeeper',
      'https://en.wikipedia.org/wiki/Africa_Cup_of_Nations_awards',
      '2026-08-23',
      'Documented since 2008. No award was made in 2012, 2013 or 2017.',
      [
        [2025, 'Yassine Bounou', null, MOROCCO],
        [2023, 'Ronwen Williams', null, SOUTH_AFRICA],
        [2021, 'Édouard Mendy', null, SENEGAL],
        [2019, 'Raïs M’Bolhi', null, ALGERIA],
        [2015, 'Sylvain Gbohouo', null, IVORY_COAST],
        [2010, 'Essam El-Hadary', null, EGYPT],
        [2008, 'Essam El-Hadary', null, EGYPT],
      ],
    ),
  ],

  'concacaf-gold-cup': [
    // Gold Cup era only. The CONCACAF Championship played from 1963 to 1989 is
    // its predecessor rather than the same competition, and the source's own
    // records are compiled on the 1991-onward basis, so merging the two would
    // put titles and totals on different footings in one table.
    editions(
      [
        [2025, MEXICO],
        [2023, MEXICO],
        [2021, USA],
        [2019, MEXICO],
        [2017, USA],
        [2015, MEXICO],
        [2013, USA],
        [2011, MEXICO],
        [2009, MEXICO],
        [2007, USA],
        [2005, USA],
        [2003, MEXICO],
        [2002, USA],
        [2000, CANADA],
        [1998, MEXICO],
        [1996, MEXICO],
        [1993, MEXICO],
        [1991, USA],
      ],
      'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup',
      '2026-08-23',
      'Gold Cup era only, from 1991. The CONCACAF Championship of 1963 to 1989 was a separate predecessor and its ten titles are not counted here.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup_records_and_statistics',
      '2025-07-06',
      [
        ['Landon Donovan', 18, 'United States'],
        ['Clint Dempsey', 13, 'United States'],
        ['Luís Roberto Alves', 12, 'Mexico'],
        ['Andrés Guardado', 12, 'Mexico'],
        ['Ismael Díaz', 11, 'Panama'],
        ['Blas Pérez', 11, 'Panama'],
        ['Raúl Jiménez', 10, 'Mexico'],
        ['Luis Tejada', 10, 'Panama'],
        ['Walter Centeno', 9, 'Costa Rica'],
        ['Carlos Pavón', 9, 'Honduras'],
        ['Eric Wynalda', 9, 'United States'],
        ['Rodolfo Zelaya', 9, 'El Salvador'],
      ],
      'Gold Cup matches only, excluding qualification. Four players share ninth place and all are shown. The source publishes no all-time appearances ranking.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup_awards',
      '2026-08-23',
      'The best player award, presented at every edition since 1991.',
      [
        [2025, 'Edson Álvarez', null, MEXICO],
        [2023, 'Adalberto Carrasquilla', null, 'Panama'],
        [2021, 'Héctor Herrera', null, MEXICO],
        [2019, 'Raúl Jiménez', null, MEXICO],
        [2017, 'Michael Bradley', null, USA],
        [2015, 'Andrés Guardado', null, MEXICO],
        [2013, 'Landon Donovan', null, USA],
        [2011, 'Javier Hernández', null, MEXICO],
        [2009, 'Giovani dos Santos', null, MEXICO],
        [2007, 'Julian de Guzman', null, CANADA],
        [2005, 'Luis Tejada', null, 'Panama'],
        [2003, 'Jesús Arellano', null, MEXICO],
        [2002, 'Brian McBride', null, USA],
        [2000, 'Craig Forrest', null, CANADA],
        [1998, 'Kasey Keller', null, USA],
        [1996, 'Raúl Lara', null, MEXICO],
        [1993, 'Ramón Ramírez', null, MEXICO],
        [1991, 'Tony Meola', null, USA],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup_awards',
      '2026-08-23',
      'Goals scored in the tournament. Editions with joint leading scorers list each of them.',
      [
        [2025, 'Ismael Díaz', 6, 'Panama'],
        [2023, 'Jesús Ferreira', 7, 'United States'],
        [2021, 'Almoez Ali', 4, 'Qatar'],
        [2019, 'Jonathan David', 6, 'Canada'],
        [2017, 'Alphonso Davies', 3, 'Canada'],
        [2015, 'Clint Dempsey', 7, 'United States'],
        [2013, 'Gabriel Torres', 5, 'Panama'],
        [2013, 'Landon Donovan', 5, 'United States'],
        [2013, 'Chris Wondolowski', 5, 'United States'],
        [2011, 'Javier Hernández', 7, 'Mexico'],
        [2009, 'Miguel Sabah', 4, 'Mexico'],
        [2007, 'Carlos Pavón', 5, 'Honduras'],
        [2005, 'DaMarcus Beasley', 3, 'United States'],
        [2003, 'Walter Centeno', 4, 'Costa Rica'],
        [2003, 'Landon Donovan', 4, 'United States'],
        [2002, 'Brian McBride', 4, 'United States'],
        [2000, 'Carlo Corazzin', 4, 'Canada'],
        [1996, 'Eric Wynalda', 4, 'United States'],
        [1993, 'Luís Roberto Alves', 11, 'Mexico'],
        [1991, 'Benjamín Galindo', 4, 'Mexico'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Golden Glove',
      'https://en.wikipedia.org/wiki/CONCACAF_Gold_Cup_awards',
      '2026-08-23',
      'First presented in 2002; the editions from 1991 to 2000 had no goalkeeping award.',
      [
        [2025, 'Luis Malagón', null, MEXICO],
        [2023, 'Guillermo Ochoa', null, MEXICO],
        [2021, 'Matt Turner', null, USA],
        [2019, 'Guillermo Ochoa', null, MEXICO],
        [2017, 'Andre Blake', null, 'Jamaica'],
        [2015, 'Brad Guzan', null, USA],
        [2013, 'Jaime Penedo', null, 'Panama'],
        [2011, 'Noel Valladares', null, HONDURAS],
        [2009, 'Keylor Navas', null, COSTA_RICA],
        [2007, 'Franck Grandel', null, 'Guadeloupe'],
        [2005, 'Jaime Penedo', null, 'Panama'],
        [2003, 'Oswaldo Sánchez', null, MEXICO],
        [2002, 'Lars Hirschfeld', null, CANADA],
      ],
    ),
  ],

  'afc-asian-cup': [
    editions(
      [
        [2023, QATAR],
        [2019, QATAR],
        [2015, AUSTRALIA],
        [2011, JAPAN],
        [2007, IRAQ],
        [2004, JAPAN],
        [2000, JAPAN],
        [1996, SAUDI_ARABIA],
        [1992, JAPAN],
        [1988, SAUDI_ARABIA],
        [1984, SAUDI_ARABIA],
        [1980, KUWAIT],
        [1976, IRAN],
        [1972, IRAN],
        [1968, IRAN],
        [1964, ISRAEL],
        [1960, SOUTH_KOREA],
        [1956, SOUTH_KOREA],
      ],
      'https://en.wikipedia.org/wiki/AFC_Asian_Cup',
      '2026-08-23',
      'The 2023 edition was postponed and played in January 2024, and is listed under the year it is named for.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/AFC_Asian_Cup_records_and_statistics',
      '2026-08-23',
      [
        ['Ali Daei', 14, 'Iran · 1996–2004'],
        ['Almoez Ali', 11, 'Qatar · 2019–2023'],
        ['Lee Dong-gook', 10, 'South Korea · 2000–2007'],
        ['Naohiro Takahara', 9, 'Japan · 2000–2007'],
        ['Ali Mabkhout', 9, 'United Arab Emirates · 2015–2023'],
        ['Akram Afif', 9, 'Qatar · 2019–2023'],
        ['Jasem Al-Huwaidi', 8, 'Kuwait · 1996–2000'],
        ['Younis Mahmoud', 8, 'Iraq · 2004–2015'],
        ['Sardar Azmoun', 8, 'Iran · 2015–2023'],
      ],
      'Final tournaments only. The source records appearances by tournaments entered rather than matches played, so no all-time appearances ranking is shown.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/AFC_Asian_Cup_awards',
      '2026-08-23',
      'The Most Valuable Player award. None was made in 1956, 1960, 1964, 1968 or 1980.',
      [
        [2023, 'Akram Afif', null, QATAR],
        [2019, 'Almoez Ali', null, QATAR],
        [2015, 'Massimo Luongo', null, AUSTRALIA],
        [2011, 'Keisuke Honda', null, JAPAN],
        [2007, 'Younis Mahmoud', null, IRAQ],
        [2004, 'Shunsuke Nakamura', null, JAPAN],
        [2000, 'Hiroshi Nanami', null, JAPAN],
        [1996, 'Khodadad Azizi', null, IRAN],
        [1992, 'Kazuyoshi Miura', null, JAPAN],
        [1988, 'Kim Joo-sung', null, SOUTH_KOREA],
        [1984, 'Jia Xiuquan', null, 'China'],
        [1976, 'Ali Parvin', null, IRAN],
        [1972, 'Ebrahim Ashtiani', null, IRAN],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/AFC_Asian_Cup_awards',
      '2026-08-23',
      'Goals scored in the final tournament. Editions with joint leading scorers list each of them.',
      [
        [2023, 'Akram Afif', 8, 'Qatar'],
        [2019, 'Almoez Ali', 9, 'Qatar'],
        [2015, 'Ali Mabkhout', 5, 'United Arab Emirates'],
        [2011, 'Koo Ja-cheol', 5, 'South Korea'],
        [2007, 'Younis Mahmoud', 4, 'Iraq'],
        [2007, 'Naohiro Takahara', 4, 'Japan'],
        [2007, 'Yasser Al-Qahtani', 4, 'Saudi Arabia'],
        [2004, 'Ali Karimi', 5, 'Iran'],
        [2004, "A'ala Hubail", 5, 'Bahrain'],
        [2000, 'Lee Dong-gook', 6, 'South Korea'],
        [1996, 'Ali Daei', 8, 'Iran'],
        [1992, 'Fahad Al-Bishi', 3, 'Saudi Arabia'],
        [1988, 'Lee Tae-ho', 3, 'South Korea'],
        [1980, 'Choi Soon-ho', 7, 'South Korea'],
        [1980, 'Behtash Fariba', 7, 'Iran'],
        [1972, 'Hossein Kalani', 5, 'Iran'],
        [1956, 'Nahum Stelmach', 4, 'Israel'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Best goalkeeper',
      'https://en.wikipedia.org/wiki/AFC_Asian_Cup_awards',
      '2026-08-23',
      'Documented since 1984. No award was made in 1992, 2004 or 2011.',
      [
        [2023, 'Meshaal Barsham', null, QATAR],
        [2019, 'Saad Al-Sheeb', null, QATAR],
        [2015, 'Mathew Ryan', null, AUSTRALIA],
        [2007, 'Noor Sabri', null, IRAQ],
        [2000, 'Jiang Jin', null, 'China'],
        [1996, 'Mohamed Al-Deayea', null, SAUDI_ARABIA],
        [1988, 'Zhang Huikang', null, 'China'],
        [1984, 'Abdullah Al-Deayea', null, SAUDI_ARABIA],
      ],
    ),
  ],

  'uefa-nations-league': [
    editions(
      [
        [2025, PORTUGAL],
        [2023, SPAIN],
        [2021, FRANCE],
        [2019, PORTUGAL],
      ],
      'https://en.wikipedia.org/wiki/UEFA_Nations_League',
      '2026-08-23',
      'Listed by the year the final was played: the 2024-25 edition was decided in June 2025.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/UEFA_Nations_League_records_and_statistics',
      '2026-08-23',
      [
        ['Erling Haaland', 19, 'Norway'],
        ['Cristiano Ronaldo', 15, 'Portugal'],
        ['Aleksandar Mitrović', 15, 'Serbia'],
        ['Romelu Lukaku', 10, 'Belgium'],
        ['Vedat Muriqi', 10, 'Kosovo'],
        ['Viktor Gyökeres', 10, 'Sweden'],
        ['Edin Džeko', 9, 'Bosnia and Herzegovina'],
        ['Christian Eriksen', 9, 'Denmark'],
        ['Danel Sinani', 9, 'Luxembourg'],
        ['Kylian Mbappé', 9, 'France'],
      ],
      'Goals across every league of the competition, not the finals tournament alone. The source publishes no all-time appearances ranking.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Player of the tournament',
      'https://en.wikipedia.org/wiki/UEFA_Nations_League',
      '2026-08-23',
      'Awarded for the finals tournament.',
      [
        [2025, 'Nuno Mendes', null, PORTUGAL],
        [2023, 'Rodri', null, SPAIN],
        [2021, 'Sergio Busquets', null, SPAIN],
        [2019, 'Bernardo Silva', null, PORTUGAL],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Top scorer',
      'https://en.wikipedia.org/wiki/UEFA_Nations_League',
      '2026-08-23',
      'The competition’s leading scorer across all four leagues, which is not a finals-tournament award; UEFA presents no Golden Boot here. Editions with joint leading scorers list each of them.',
      [
        [2025, 'Viktor Gyökeres', null, 'Sweden'],
        [2023, 'Erling Haaland', null, 'Norway'],
        [2023, 'Aleksandar Mitrović', null, 'Serbia'],
        [2021, 'Romelu Lukaku', null, 'Belgium'],
        [2021, 'Erling Haaland', null, 'Norway'],
        [2021, 'Ferran Torres', null, 'Spain'],
        [2019, 'Aleksandar Mitrović', null, 'Serbia'],
      ],
    ),
  ],

  'uefa-europa-league': [
    // The UEFA Cup is the same competition under its former name, so the roll
    // of honour runs from 1972 rather than starting at the 2009 rebrand. The
    // all-time career tables below are compiled on the same basis.
    champions(
      [
        [2026, 'Aston Villa F.C.'],
        [2025, 'Tottenham Hotspur F.C.'],
        [2024, 'Atalanta BC'],
        [2023, SEVILLA],
        [2022, FRANKFURT],
        [2021, 'Villarreal CF'],
        [2020, SEVILLA],
        [2019, CHELSEA],
        [2018, ATLETICO],
        [2017, MAN_UTD],
        [2016, SEVILLA],
        [2015, SEVILLA],
        [2014, SEVILLA],
        [2013, CHELSEA],
        [2012, ATLETICO],
        [2011, PORTO],
        [2010, ATLETICO],
        [2009, 'FC Shakhtar Donetsk'],
        [2008, 'FC Zenit Saint Petersburg'],
        [2007, SEVILLA],
        [2006, SEVILLA],
        [2005, 'PFC CSKA Moscow'],
        [2004, VALENCIA],
        [2003, PORTO],
        [2002, 'Feyenoord Rotterdam'],
        [2001, LIVERPOOL],
        [2000, 'Galatasaray S.K.'],
        [1999, 'Parma Calcio 1913'],
        [1998, INTER],
        [1997, 'Schalke 04'],
        [1996, BAYERN],
        [1995, 'Parma Calcio 1913'],
        [1994, INTER],
        [1993, JUVENTUS],
        [1992, AJAX],
        [1991, INTER],
        [1990, JUVENTUS],
        [1989, NAPOLI],
        [1988, LEVERKUSEN],
        [1987, 'IFK Göteborg'],
        [1986, REAL_MADRID],
        [1985, REAL_MADRID],
        [1984, 'Tottenham Hotspur F.C.'],
        [1983, 'R.S.C. Anderlecht'],
        [1982, 'IFK Göteborg'],
        [1981, 'Ipswich Town F.C.'],
        [1980, FRANKFURT],
        [1979, MONCHENGLADBACH],
        [1978, 'PSV Eindhoven'],
        [1977, JUVENTUS],
        [1976, LIVERPOOL],
        [1975, MONCHENGLADBACH],
        [1974, 'Feyenoord Rotterdam'],
        [1973, LIVERPOOL],
        [1972, 'Tottenham Hotspur F.C.'],
      ],
      'https://en.wikipedia.org/wiki/List_of_UEFA_Europa_League_finals',
      '2026-08-23',
      'Includes the UEFA Cup era from 1971-72, which is the same competition under its former name; it was rebranded the Europa League in 2009-10.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/UEFA_Cup_and_Europa_League_records_and_statistics',
      '2025-02-20',
      [
        ['Giuseppe Bergomi', 96, 'Inter Milan'],
        ['Frank Rost', 87, 'Werder Bremen, Schalke 04, Hamburger SV'],
        ['Pepe Reina', 77, 'Barcelona, Villarreal, Liverpool, Napoli, Milan'],
        ['Rui Patrício', 75, 'Sporting CP, Wolves, Roma'],
        ['Dries Mertens', 73, 'Utrecht, PSV, Napoli, Galatasaray'],
        ['João Moutinho', 69, 'Sporting CP, Porto, Monaco, Wolves, Braga'],
        ['Walter Zenga', 69, 'Inter Milan, Sampdoria'],
        ['Raúl García', 67, 'Osasuna, Atlético Madrid, Athletic Bilbao'],
        ['Dimitris Salpingidis', 67, 'PAOK, Panathinaikos'],
        ['Aleksandar Dragović', 66, 'Austria Wien, Basel, Dynamo Kyiv, Leverkusen'],
      ],
      'Competition proper from the 1971-72 UEFA Cup onward; qualifying rounds are excluded. The source was last revised in February 2025, so active players’ totals omit the two seasons since.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_UEFA_Cup_and_Europa_League_top_scorers',
      '2025-05-01',
      [
        ['Pierre-Emerick Aubameyang', 34, 'Dortmund, Arsenal, Barcelona, Marseille'],
        ['Henrik Larsson', 31, 'Feyenoord, Celtic, Helsingborg'],
        ['Radamel Falcao', 30, 'Porto, Atlético Madrid'],
        ['Klaas-Jan Huntelaar', 30, 'Heerenveen, Ajax, Schalke 04'],
        ['Dieter Müller', 29, '1. FC Köln, VfB Stuttgart, Bordeaux'],
        ['Edin Džeko', 28, 'Wolfsburg, Manchester City, Roma, Fenerbahçe'],
        ['Romelu Lukaku', 27, 'Anderlecht, Everton, Inter Milan, Roma'],
        ['Aritz Aduriz', 26, 'Valencia, Athletic Bilbao'],
        ['Alexandre Lacazette', 25, 'Lyon, Arsenal'],
        ['Alessandro Altobelli', 25, 'Inter Milan, Juventus'],
      ],
      'Includes the UEFA Cup era; qualifying rounds are excluded. The source was last revised in May 2025, so active players’ totals omit the season since.',
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/UEFA_Europa_League',
      '2026-08-23',
      'Presented since 2016-17; no such award existed in the UEFA Cup era or the first Europa League seasons.',
      [
        [2026, 'Morgan Rogers', null, 'Aston Villa F.C.'],
        [2025, 'Cristian Romero', null, 'Tottenham Hotspur F.C.'],
        [2024, 'Pierre-Emerick Aubameyang', null, MARSEILLE],
        [2023, 'Jesús Navas', null, SEVILLA],
        [2022, 'Filip Kostić', null, FRANKFURT],
        [2021, 'Gerard Moreno', null, 'Villarreal CF'],
        [2020, 'Romelu Lukaku', null, INTER],
        [2019, 'Eden Hazard', null, CHELSEA],
        [2018, 'Antoine Griezmann', null, ATLETICO],
        [2017, 'Paul Pogba', null, MAN_UTD],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/List_of_UEFA_Cup_and_Europa_League_top_scorers',
      '2026-08-23',
      'Goals in the competition proper; qualifying rounds are excluded. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Igor Jesus', 7, 'Nottingham Forest F.C.'],
        [2026, 'Petar Stanić', 7, 'Ludogorets Razgrad'],
        [2025, 'Ayoub El Kaabi', 7, 'Olympiacos F.C.'],
        [2025, 'Kasper Høgh', 7, 'FK Bodø/Glimt'],
        [2025, 'Bruno Fernandes', 7, MAN_UTD],
        [2024, 'Pierre-Emerick Aubameyang', 10, MARSEILLE],
        [2023, 'Victor Boniface', 6, 'Royale Union Saint-Gilloise'],
        [2023, 'Marcus Rashford', 6, MAN_UTD],
        [2022, 'James Tavernier', 7, 'Rangers F.C.'],
        [2021, 'Borja Mayoral', 7, ROMA],
        [2021, 'Gerard Moreno', 7, 'Villarreal CF'],
        [2021, 'Pizzi', 7, 'S.L. Benfica'],
        [2021, 'Yusuf Yazıcı', 7, LILLE],
        [2020, 'Bruno Fernandes', 8, 'Sporting CP and Manchester United'],
        [2019, 'Olivier Giroud', 11, CHELSEA],
        [2018, 'Aritz Aduriz', 8, 'Athletic Club'],
        [2018, 'Ciro Immobile', 8, LAZIO],
        [2017, 'Edin Džeko', 8, ROMA],
        [2017, 'Giuliano', 8, 'FC Zenit Saint Petersburg'],
        [2016, 'Aritz Aduriz', 10, 'Athletic Club'],
        [2015, 'Alan', 8, 'FC Red Bull Salzburg'],
        [2015, 'Romelu Lukaku', 8, 'Everton F.C.'],
        [2014, 'Jonathan Soriano', 8, 'FC Red Bull Salzburg'],
        [2013, 'Libor Kozák', 8, LAZIO],
        [2012, 'Radamel Falcao', 12, ATLETICO],
        [2011, 'Radamel Falcao', 17, PORTO],
        [2010, 'Óscar Cardozo', 9, 'S.L. Benfica'],
        [2010, 'Claudio Pizarro', 9, WERDER],
        [2009, 'Vágner Love', 11, 'PFC CSKA Moscow'],
        [2008, 'Pavel Pogrebnyak', 10, 'FC Zenit Saint Petersburg'],
        [2008, 'Luca Toni', 10, BAYERN],
        [2007, 'Walter Pandiani', 11, 'RCD Espanyol de Barcelona'],
        [2006, 'Matías Delgado', 7, 'FC Basel'],
        [2005, 'Alan Shearer', 11, 'Newcastle United F.C.'],
        [2004, 'Sonny Anderson', 6, 'Villarreal CF'],
        [2003, 'Derlei', 12, PORTO],
        [2002, 'Pierre van Hooijdonk', 8, 'Feyenoord Rotterdam'],
        [2001, 'Dimitar Berbatov', 7, 'PFC CSKA Sofia'],
      ],
    ),
  ],

  'uefa-conference-league': [
    champions(
      [
        [2026, 'Crystal Palace F.C.'],
        [2025, CHELSEA],
        [2024, 'Olympiacos F.C.'],
        [2023, 'West Ham United F.C.'],
        [2022, ROMA],
      ],
      'https://en.wikipedia.org/wiki/List_of_UEFA_Conference_League_finals',
      '2026-08-23',
      'Founded in 2021-22 as the Europa Conference League and renamed the Conference League from 2024-25.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/UEFA_Conference_League',
      '2026-05-27',
      [
        ['Mikael Ishak', 13, 'Lech Poznań'],
        ['Eran Zahavi', 12, 'PSV Eindhoven, Maccabi Tel Aviv'],
        ['Arthur Cabral', 12, 'Basel, Fiorentina'],
        ['Vangelis Pavlidis', 12, 'AZ Alkmaar'],
        ['Ayoub El Kaabi', 11, 'Olympiacos'],
        ['Gift Orban', 11, 'Gent'],
      ],
      'Competition proper only; qualifying rounds are excluded. The competition began in 2021-22, and the source publishes no all-time appearances ranking.',
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/UEFA_Conference_League',
      '2026-08-23',
      'Awarded every season since the competition began.',
      [
        [2026, 'Ismaïla Sarr', null, 'Crystal Palace F.C.'],
        [2025, 'Isco', null, BETIS],
        [2024, 'Ayoub El Kaabi', null, 'Olympiacos F.C.'],
        [2023, 'Declan Rice', null, 'West Ham United F.C.'],
        [2022, 'Lorenzo Pellegrini', null, ROMA],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/List_of_UEFA_Conference_League_top_scorers',
      '2026-08-23',
      'Goals in the competition proper; qualifying rounds are excluded. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Ismaïla Sarr', 9, 'Crystal Palace F.C.'],
        [2025, 'Afimico Pululu', 8, 'Jagiellonia Białystok'],
        [2024, 'Ayoub El Kaabi', 11, 'Olympiacos F.C.'],
        [2023, 'Zeki Amdouni', 7, 'FC Basel'],
        [2023, 'Arthur Cabral', 7, FIORENTINA],
        [2022, 'Cyriel Dessers', 10, 'Feyenoord Rotterdam'],
      ],
    ),
  ],

  'fifa-club-world-cup': [
    // The FIFA Intercontinental Cup, played in 2024 and 2025, is a separate
    // competition with its own article and is deliberately not merged in here:
    // doing so would add Real Madrid and Paris Saint-Germain titles this
    // competition never awarded. 2001 was cancelled and there was no 2024
    // edition, so both are absent rather than carrying an empty row.
    editions(
      [
        [2025, CHELSEA],
        [2023, MAN_CITY],
        [2022, REAL_MADRID],
        [2021, CHELSEA],
        [2020, BAYERN],
        [2019, LIVERPOOL],
        [2018, REAL_MADRID],
        [2017, REAL_MADRID],
        [2016, REAL_MADRID],
        [2015, BARCELONA],
        [2014, REAL_MADRID],
        [2013, BAYERN],
        [2012, 'Sport Club Corinthians Paulista'],
        [2011, BARCELONA],
        [2010, INTER],
        [2009, BARCELONA],
        [2008, MAN_UTD],
        [2007, MILAN],
        [2006, 'Sport Club Internacional'],
        [2005, 'São Paulo FC'],
        [2000, 'Sport Club Corinthians Paulista'],
      ],
      'https://en.wikipedia.org/wiki/FIFA_Club_World_Cup',
      '2026-08-23',
      'The 2001 edition was cancelled and no tournament was held in 2024. The FIFA Intercontinental Cup played in 2024 and 2025 is a separate competition and its winners are not listed here.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/FIFA_Club_World_Cup_records_and_statistics',
      '2026-08-23',
      [
        ['Hussein El Shahat', 18, 'Al Ain, Al Ahly'],
        ['Mohamed Hany', 16, 'Al Ahly'],
        ['Luka Modrić', 14, 'Real Madrid'],
        ['Taher Mohamed', 14, 'Al Ahly'],
        ['Mohamed El Shenawy', 13, 'Al Ahly'],
      ],
      'The source publishes only the leading five, so the table is shorter than the ten shown elsewhere.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/FIFA_Club_World_Cup_records_and_statistics',
      '2026-08-23',
      [
        ['Cristiano Ronaldo', 7, 'Manchester United, Real Madrid'],
        ['Gareth Bale', 6, 'Real Madrid'],
        ['Luis Suárez', 6, 'Barcelona, Inter Miami'],
        ['Lionel Messi', 6, 'Barcelona, Inter Miami'],
        ['Karim Benzema', 6, 'Real Madrid, Al-Ittihad'],
        ['César Delgado', 5, 'Monterrey'],
        ['Federico Valverde', 5, 'Real Madrid'],
        ['Salem Al-Dawsari', 5, 'Al-Hilal'],
      ],
      'Twelve further players share ninth place on four goals and are not listed.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Golden Ball',
      'https://en.wikipedia.org/wiki/FIFA_Club_World_Cup_awards',
      '2026-08-23',
      'Awarded at every edition. The source’s table carries no club column, so the clubs shown are the winners’ clubs at that tournament.',
      [
        [2025, 'Cole Palmer', null, 'Chelsea'],
        [2023, 'Rodri', null, 'Manchester City'],
        [2022, 'Vinícius Júnior', null, 'Real Madrid'],
        [2021, 'Thiago Silva', null, 'Chelsea'],
        [2020, 'Robert Lewandowski', null, 'Bayern Munich'],
        [2019, 'Mohamed Salah', null, 'Liverpool'],
        [2018, 'Gareth Bale', null, 'Real Madrid'],
        [2017, 'Luka Modrić', null, 'Real Madrid'],
        [2016, 'Cristiano Ronaldo', null, 'Real Madrid'],
        [2015, 'Luis Suárez', null, 'Barcelona'],
        [2014, 'Sergio Ramos', null, 'Real Madrid'],
        [2013, 'Franck Ribéry', null, 'Bayern Munich'],
        [2012, 'Cássio', null, 'Corinthians'],
        [2011, 'Lionel Messi', null, 'Barcelona'],
        [2010, 'Samuel Eto’o', null, 'Inter Milan'],
        [2009, 'Lionel Messi', null, 'Barcelona'],
        [2008, 'Wayne Rooney', null, 'Manchester United'],
        [2007, 'Kaká', null, 'AC Milan'],
        [2006, 'Deco', null, 'Barcelona'],
        [2005, 'Rogério Ceni', null, 'São Paulo'],
        [2000, 'Edílson', null, 'Corinthians'],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/FIFA_Club_World_Cup_records_and_statistics',
      '2026-08-23',
      'Goals scored at the tournament. Editions with joint leading scorers list each of them. The source records no clubs for the editions before 2025, so none are shown for those rows.',
      [
        [2025, 'Ángel Di María', 4, 'S.L. Benfica'],
        [2025, 'Serhou Guirassy', 4, 'Borussia Dortmund'],
        [2025, 'Marcos Leonardo', 4, 'Al-Hilal'],
        [2025, 'Gonzalo García', 4, 'Real Madrid'],
        [2022, 'Pedro', 4, '—'],
        [2020, 'André-Pierre Gignac', 3, '—'],
        [2019, 'Hamdou Elhouni', 3, '—'],
        [2019, 'Baghdad Bounedjah', 3, '—'],
        [2016, 'Cristiano Ronaldo', 4, '—'],
        [2015, 'Luis Suárez', 5, '—'],
        [2010, 'Mauricio Molina', 3, '—'],
        [2009, 'Denilson', 4, '—'],
        [2008, 'Wayne Rooney', 3, '—'],
        [2007, 'Washington', 3, '—'],
        [2006, 'Mohamed Aboutrika', 3, '—'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Golden Glove',
      'https://en.wikipedia.org/wiki/2025_FIFA_Club_World_Cup',
      '2026-08-23',
      'Introduced with the expanded tournament in 2025; the earlier editions had no goalkeeping award.',
      [[2025, 'Robert Sánchez', null, 'Chelsea']],
    ),
  ],

  'major-league-soccer': [
    // MLS decides its championship by playoff, so the MLS Cup winner is the
    // champion here. The Supporters' Shield, won on the regular-season table,
    // is a separate trophy and is not merged in.
    editions(
      [
        [2025, 'Inter Miami CF'],
        [2024, 'LA Galaxy'],
        [2023, 'Columbus Crew'],
        [2022, 'Los Angeles FC'],
        [2021, 'New York City FC'],
        [2020, 'Columbus Crew'],
        [2019, 'Seattle Sounders FC'],
        [2018, 'Atlanta United FC'],
        [2017, 'Toronto FC'],
        [2016, 'Seattle Sounders FC'],
        [2015, 'Portland Timbers'],
        [2014, 'LA Galaxy'],
        [2013, 'Sporting Kansas City'],
        [2012, 'LA Galaxy'],
        [2011, 'LA Galaxy'],
        [2010, 'Colorado Rapids'],
        [2009, 'Real Salt Lake'],
        [2008, 'Columbus Crew'],
        [2007, 'Houston Dynamo'],
        [2006, 'Houston Dynamo'],
        [2005, 'LA Galaxy'],
        [2004, 'D.C. United'],
        [2003, 'San Jose Earthquakes'],
        [2002, 'LA Galaxy'],
        [2001, 'San Jose Earthquakes'],
        [2000, 'Kansas City Wizards'],
        [1999, 'D.C. United'],
        [1998, 'Chicago Fire'],
        [1997, 'D.C. United'],
        [1996, 'D.C. United'],
      ],
      'https://en.wikipedia.org/wiki/MLS_Cup',
      '2026-08-23',
      'MLS Cup winners, decided by playoff. The Supporters’ Shield, awarded for the best regular-season record, is a separate trophy and is not listed here.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_Major_League_Soccer_players_with_400_or_more_games_played',
      '2026-08-23',
      [
        ['Nick Rimando', 514, 'Miami Fusion, D.C. United, Real Salt Lake'],
        ['Kyle Beckerman', 498, 'Miami Fusion, Colorado Rapids, Real Salt Lake'],
        ['Dax McCarty', 488, 'FC Dallas, D.C. United, New York Red Bulls, Chicago Fire'],
        ['Kei Kamara', 464, 'Columbus Crew, Sporting Kansas City, and others'],
        ['Sean Johnson', 452, 'Chicago Fire, New York City FC, Toronto FC, D.C. United'],
        ['Darlington Nagbe', 445, 'Portland Timbers, Atlanta United, Columbus Crew'],
        ['Diego Chará', 442, 'Portland Timbers'],
        ['Jeff Larentowicz', 437, 'New England, Colorado, Chicago, LA Galaxy, Atlanta'],
        ['Diego Fagúndez', 435, 'New England Revolution, Austin FC, LA Galaxy'],
        ['Stefan Frei', 433, 'Toronto FC, Seattle Sounders FC'],
      ],
      'Regular-season games only. Active players’ totals include the 2026 season, which is still in progress.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_Major_League_Soccer_players_with_100_or_more_goals',
      '2026-08-23',
      [
        ['Chris Wondolowski', 171, 'San Jose Earthquakes, Houston Dynamo'],
        ['Kei Kamara', 147, 'Sporting Kansas City, Columbus Crew, and others'],
        ['Landon Donovan', 145, 'LA Galaxy, San Jose Earthquakes'],
        ['Jeff Cunningham', 134, 'Columbus Crew, FC Dallas, Real Salt Lake'],
        ['Jaime Moreno', 133, 'D.C. United, MetroStars'],
        ['Josef Martínez', 130, 'Atlanta United, Inter Miami, Columbus Crew'],
        ['Bradley Wright-Phillips', 117, 'New York Red Bulls, Los Angeles FC'],
        ['Ante Razov', 114, 'Chicago Fire, Chivas USA, LA Galaxy'],
        ['Jason Kreis', 108, 'Dallas Burn, Real Salt Lake'],
        ['Gyasi Zardes', 106, 'LA Galaxy, Columbus Crew, Colorado Rapids'],
      ],
      'Regular-season goals only. Active players’ totals include the 2026 season, which is still in progress.',
    ),
    awards(
      'award:most-valuable-player-award',
      'Most Valuable Player',
      'https://en.wikipedia.org/wiki/Landon_Donovan_MVP_Award',
      '2026-08-23',
      'The Landon Donovan MVP Award.',
      [
        [2025, 'Lionel Messi', null, 'Inter Miami CF'],
        [2024, 'Lionel Messi', null, 'Inter Miami CF'],
        [2023, 'Luciano Acosta', null, 'FC Cincinnati'],
        [2022, 'Hany Mukhtar', null, 'Nashville SC'],
        [2021, 'Carles Gil', null, 'New England Revolution'],
        [2020, 'Alejandro Pozuelo', null, 'Toronto FC'],
        [2019, 'Carlos Vela', null, 'Los Angeles FC'],
        [2018, 'Josef Martínez', null, 'Atlanta United FC'],
        [2017, 'Diego Valeri', null, 'Portland Timbers'],
        [2016, 'David Villa', null, 'New York City FC'],
        [2015, 'Sebastian Giovinco', null, 'Toronto FC'],
        [2014, 'Robbie Keane', null, 'LA Galaxy'],
        [2013, 'Mike Magee', null, 'Chicago Fire'],
        [2012, 'Chris Wondolowski', null, 'San Jose Earthquakes'],
        [2011, 'Dwayne De Rosario', null, 'D.C. United'],
        [2010, 'David Ferreira', null, 'FC Dallas'],
        [2009, 'Landon Donovan', null, 'LA Galaxy'],
      ],
    ),
    awards(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/MLS_Golden_Boot',
      '2026-08-23',
      'Goals scored in the regular season.',
      [
        [2025, 'Lionel Messi', 29, 'Inter Miami CF'],
        [2024, 'Christian Benteke', 23, 'D.C. United'],
        [2023, 'Denis Bouanga', 20, 'Los Angeles FC'],
        [2022, 'Hany Mukhtar', 23, 'Nashville SC'],
        [2021, 'Valentín Castellanos', 19, 'New York City FC'],
        [2020, 'Diego Rossi', 14, 'Los Angeles FC'],
        [2019, 'Carlos Vela', 34, 'Los Angeles FC'],
        [2018, 'Josef Martínez', 31, 'Atlanta United FC'],
        [2017, 'Nemanja Nikolić', 24, 'Chicago Fire'],
        [2016, 'Bradley Wright-Phillips', 24, 'New York Red Bulls'],
        [2015, 'Sebastian Giovinco', 22, 'Toronto FC'],
        [2014, 'Bradley Wright-Phillips', 27, 'New York Red Bulls'],
        [2013, 'Camilo Sanvezzo', 22, 'Vancouver Whitecaps FC'],
        [2012, 'Chris Wondolowski', 27, 'San Jose Earthquakes'],
        [2011, 'Dwayne De Rosario', 16, 'D.C. United'],
        [2010, 'Chris Wondolowski', 18, 'San Jose Earthquakes'],
      ],
    ),
    awards(
      'award:best-goalkeeper',
      'Goalkeeper of the year',
      'https://en.wikipedia.org/wiki/MLS_Goalkeeper_of_the_Year_Award',
      '2026-08-23',
      undefined,
      [
        [2025, 'Dayne St. Clair', null, 'Minnesota United FC'],
        [2024, 'Kristijan Kahlina', null, 'Charlotte FC'],
        [2023, 'Roman Bürki', null, 'St. Louis City SC'],
        [2022, 'Andre Blake', null, 'Philadelphia Union'],
        [2021, 'Matt Turner', null, 'New England Revolution'],
        [2020, 'Andre Blake', null, 'Philadelphia Union'],
        [2019, 'Vito Mannone', null, 'Minnesota United FC'],
        [2018, 'Zack Steffen', null, 'Columbus Crew'],
        [2017, 'Tim Melia', null, 'Sporting Kansas City'],
        [2016, 'Andre Blake', null, 'Philadelphia Union'],
        [2015, 'Luis Robles', null, 'New York Red Bulls'],
        [2014, 'Bill Hamid', null, 'D.C. United'],
        [2013, 'Donovan Ricketts', null, 'Portland Timbers'],
        [2012, 'Jimmy Nielsen', null, 'Sporting Kansas City'],
        [2011, 'Kasey Keller', null, 'Seattle Sounders FC'],
        [2010, 'Donovan Ricketts', null, 'LA Galaxy'],
      ],
    ),
  ],

  'saudi-pro-league': [
    champions(
      [
        [2026, 'Al-Nassr FC'],
        [2025, 'Ittihad FC'],
        [2024, 'Al-Hilal SFC'],
        [2023, 'Ittihad FC'],
        [2022, 'Al-Hilal SFC'],
        [2021, 'Al-Hilal SFC'],
        [2020, 'Al-Hilal SFC'],
        [2019, 'Al-Nassr FC'],
        [2018, 'Al-Hilal SFC'],
        [2017, 'Al-Hilal SFC'],
        [2016, 'Al-Ahli Saudi FC'],
        [2015, 'Al-Nassr FC'],
        [2014, 'Al-Nassr FC'],
        [2013, 'Al-Fateh SC'],
        [2012, 'Al-Shabab FC'],
        [2011, 'Al-Hilal SFC'],
        [2010, 'Al-Hilal SFC'],
        [2009, 'Ittihad FC'],
        [2008, 'Al-Hilal SFC'],
        [2007, 'Ittihad FC'],
        [2006, 'Al-Shabab FC'],
        [2005, 'Al-Hilal SFC'],
        [2004, 'Al-Shabab FC'],
        [2003, 'Ittihad FC'],
        [2002, 'Al-Hilal SFC'],
        [2001, 'Ittihad FC'],
        [2000, 'Ittihad FC'],
        [1999, 'Ittihad FC'],
        [1998, 'Al-Hilal SFC'],
        [1997, 'Ittihad FC'],
        [1996, 'Al-Hilal SFC'],
        [1995, 'Al-Nassr FC'],
        [1994, 'Al-Nassr FC'],
        [1993, 'Al-Shabab FC'],
        [1992, 'Al-Shabab FC'],
        [1991, 'Al-Shabab FC'],
        [1990, 'Al-Hilal SFC'],
        [1989, 'Al-Nassr FC'],
        [1988, 'Al-Hilal SFC'],
        [1987, 'Ettifaq FC'],
        [1986, 'Al-Hilal SFC'],
        [1985, 'Al-Hilal SFC'],
        [1984, 'Al-Ahli Saudi FC'],
        [1983, 'Ettifaq FC'],
        [1982, 'Ittihad FC'],
        [1981, 'Al-Nassr FC'],
        [1980, 'Al-Nassr FC'],
        [1979, 'Al-Hilal SFC'],
        [1978, 'Al-Ahli Saudi FC'],
        [1977, 'Al-Hilal SFC'],
        [1975, 'Al-Nassr FC'],
        [1974, 'Al-Nassr FC'],
        [1973, 'Al-Ahli Saudi FC'],
        [1972, 'Al-Ahli Saudi FC'],
        [1971, 'Al-Ahli Saudi FC'],
        [1969, 'Al-Ahli Saudi FC'],
        [1966, 'Al-Ahli Saudi FC'],
        [1965, 'Al-Hilal SFC'],
        [1964, 'Ittihad FC'],
        [1963, 'Al-Ahli Saudi FC'],
        [1962, 'Al-Hilal SFC'],
        [1961, 'Ittihad FC'],
        [1960, 'Ittihad FC'],
        [1959, 'Ittihad FC'],
        [1958, 'Al-Wehda FC'],
      ],
      'https://en.wikipedia.org/wiki/Saudi_Pro_League',
      '2026-08-23',
      'Four seasons produced no champion and are omitted: 1966-67 and 1975-76 were not completed, 1967-68 was not held and 1969-70 was cancelled.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/Saudi_Pro_League',
      '2026-08-23',
      [
        ['Majed Abdullah', 189, 'Al-Nassr'],
        ['Nasser Al-Shamrani', 166, 'Al-Wehda, Al-Shabab, Al-Hilal, Al-Ittihad'],
        ['Omar Al Somah', 161, 'Al-Ahli, Al-Orobah, Al-Hazem'],
        ['Abderrazak Hamdallah', 158, 'Al-Nassr, Al-Ittihad, Al-Shabab, Al-Taawoun'],
        ['Fahd Al-Hamdan', 120, 'Al-Riyadh'],
        ['Yasser Al-Qahtani', 112, 'Al-Qadsiah, Al-Hilal'],
        ['Mohammad Al-Sahlawi', 111, 'Al-Qadsiah, Al-Nassr, Al-Shabab, Al-Taawoun'],
        ['Cristiano Ronaldo', 103, 'Al-Nassr'],
        ['Sami Al-Jaber', 101, 'Al-Hilal'],
        ['Hamzah Idris', 96, 'Ohod, Al-Ittihad'],
      ],
      'Counted from the 1974-75 season onward, which is where the source’s record begins. The source publishes no all-time appearances ranking.',
    ),
    // The source's award table carries no club column, so no clubs are shown.
    // English Wikipedia documents only these seasons; the award was explicitly
    // not made in 2023-24.
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Saudi_Pro_League',
      '2026-08-23',
      'Only these seasons are documented, and no award was made in 2023-24. The source records no clubs for this table.',
      [
        [2026, 'João Félix', null, '—'],
        [2025, 'Karim Benzema', null, '—'],
        [2019, 'Abderrazak Hamdallah', null, '—'],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/Saudi_Pro_League',
      '2026-08-23',
      'Goals scored. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Julián Quiñones', 33, 'Al-Qadsiah FC'],
        [2025, 'Cristiano Ronaldo', 25, 'Al-Nassr FC'],
        [2024, 'Cristiano Ronaldo', 35, 'Al-Nassr FC'],
        [2023, 'Abderrazak Hamdallah', 21, 'Ittihad FC'],
        [2022, 'Odion Ighalo', 24, 'Al-Hilal SFC'],
        [2021, 'Bafétimbi Gomis', 24, 'Al-Hilal SFC'],
        [2020, 'Abderrazak Hamdallah', 29, 'Al-Nassr FC'],
        [2019, 'Abderrazak Hamdallah', 34, 'Al-Nassr FC'],
        [2018, 'Ronnie Fernández', 13, 'Al-Fayha FC'],
        [2017, 'Omar Al Somah', 24, 'Al-Ahli Saudi FC'],
        [2016, 'Omar Al Somah', 27, 'Al-Ahli Saudi FC'],
        [2015, 'Omar Al Somah', 22, 'Al-Ahli Saudi FC'],
        [2014, 'Nasser Al-Shamrani', 21, 'Al-Hilal SFC'],
        [2013, 'Sebastián Tagliabúe', 19, 'Al-Shabab FC'],
        [2012, 'Victor Simões', 21, 'Al-Ahli Saudi FC'],
        [2012, 'Nasser Al-Shamrani', 21, 'Al-Shabab FC'],
      ],
    ),
    seasons(
      'award:best-goalkeeper',
      'Best goalkeeper',
      'https://en.wikipedia.org/wiki/Saudi_Pro_League',
      '2026-08-23',
      'Only these seasons are documented. The source records no clubs for this table.',
      [
        [2026, 'Édouard Mendy', null, '—'],
        [2025, 'Koen Casteels', null, '—'],
        [2024, 'Yassine Bounou', null, '—'],
        [2019, 'Farouk Ben Mustapha', null, '—'],
      ],
    ),
  ],

  'super-lig': [
    champions(
      [
        [2026, 'Galatasaray S.K.'],
        [2025, 'Galatasaray S.K.'],
        [2024, 'Galatasaray S.K.'],
        [2023, 'Galatasaray S.K.'],
        [2022, 'Trabzonspor'],
        [2021, 'Beşiktaş J.K.'],
        [2020, 'İstanbul Başakşehir F.K.'],
        [2019, 'Galatasaray S.K.'],
        [2018, 'Galatasaray S.K.'],
        [2017, 'Beşiktaş J.K.'],
        [2016, 'Beşiktaş J.K.'],
        [2015, 'Galatasaray S.K.'],
        [2014, 'Fenerbahçe S.K.'],
        [2013, 'Galatasaray S.K.'],
        [2012, 'Galatasaray S.K.'],
        [2011, 'Fenerbahçe S.K.'],
        [2010, 'Bursaspor'],
        [2009, 'Beşiktaş J.K.'],
        [2008, 'Galatasaray S.K.'],
        [2007, 'Fenerbahçe S.K.'],
        [2006, 'Galatasaray S.K.'],
        [2005, 'Fenerbahçe S.K.'],
        [2004, 'Fenerbahçe S.K.'],
        [2003, 'Beşiktaş J.K.'],
        [2002, 'Galatasaray S.K.'],
        [2001, 'Fenerbahçe S.K.'],
        [2000, 'Galatasaray S.K.'],
        [1999, 'Galatasaray S.K.'],
        [1998, 'Galatasaray S.K.'],
        [1997, 'Galatasaray S.K.'],
        [1996, 'Fenerbahçe S.K.'],
        [1995, 'Beşiktaş J.K.'],
        [1994, 'Galatasaray S.K.'],
        [1993, 'Galatasaray S.K.'],
        [1992, 'Beşiktaş J.K.'],
        [1991, 'Beşiktaş J.K.'],
        [1990, 'Beşiktaş J.K.'],
        [1989, 'Fenerbahçe S.K.'],
        [1988, 'Galatasaray S.K.'],
        [1987, 'Galatasaray S.K.'],
        [1986, 'Beşiktaş J.K.'],
        [1985, 'Fenerbahçe S.K.'],
        [1984, 'Trabzonspor'],
        [1983, 'Fenerbahçe S.K.'],
        [1982, 'Beşiktaş J.K.'],
        [1981, 'Trabzonspor'],
        [1980, 'Trabzonspor'],
        [1979, 'Trabzonspor'],
        [1978, 'Fenerbahçe S.K.'],
        [1977, 'Trabzonspor'],
        [1976, 'Trabzonspor'],
        [1975, 'Fenerbahçe S.K.'],
        [1974, 'Fenerbahçe S.K.'],
        [1973, 'Galatasaray S.K.'],
        [1972, 'Galatasaray S.K.'],
        [1971, 'Galatasaray S.K.'],
        [1970, 'Fenerbahçe S.K.'],
        [1969, 'Galatasaray S.K.'],
        [1968, 'Fenerbahçe S.K.'],
        [1967, 'Beşiktaş J.K.'],
        [1966, 'Beşiktaş J.K.'],
        [1965, 'Fenerbahçe S.K.'],
        [1964, 'Fenerbahçe S.K.'],
        [1963, 'Galatasaray S.K.'],
        [1962, 'Galatasaray S.K.'],
        [1961, 'Fenerbahçe S.K.'],
        [1960, 'Beşiktaş J.K.'],
        [1959, 'Fenerbahçe S.K.'],
      ],
      'https://en.wikipedia.org/wiki/List_of_Turkish_football_champions',
      '2026-08-23',
      'The 1959 season was played within a single calendar year.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/S%C3%BCper_Lig',
      '2025-05-30',
      [
        ['Umut Bulut', 515, '1999–2021'],
        ['Oğuz Çetin', 503, '1981–2000'],
        ['Rıza Çalımbay', 494, '1980–1996'],
        ['Hakan Şükür', 489, '1987–2008'],
        ['Hami Mandıralı', 476, '1984–2003'],
        ['Kemal Yıldırım', 475, '1976–1995'],
        ['Mehmet Nas', 447, '1997–2014'],
        ['Fernando Muslera', 443, '2011–2025'],
        ['Recep Çetin', 437, '1984–2001'],
        ['Müjdat Yetkiner', 429, '1979–1995'],
      ],
      'The source lists years active rather than clubs, so the span is shown in their place.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/S%C3%BCper_Lig',
      '2021-05-15',
      [
        ['Hakan Şükür', 249, null],
        ['Tanju Çolak', 240, null],
        ['Hami Mandıralı', 219, null],
        ['Metin Oktay', 217, null],
        ['Aykut Kocaman', 200, null],
        ['Feyyaz Uçar', 191, null],
        ['Burak Yılmaz', 188, null],
        ['Serkan Aykut', 188, null],
        ['Umut Bulut', 163, null],
        ['Fevzi Zemzem', 146, null],
      ],
      'The source records no clubs for this table, and was last revised in 2021, so active players’ totals are understated.',
    ),
    seasons(
      'award:more-goals-scored',
      'Gol Kralı',
      'https://en.wikipedia.org/wiki/List_of_S%C3%BCper_Lig_top_scorers',
      '2026-08-23',
      'Goals scored. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Paul Onuachu', 22, 'Trabzonspor'],
        [2026, 'Eldor Shomurodov', 22, 'İstanbul Başakşehir F.K.'],
        [2025, 'Victor Osimhen', 26, 'Galatasaray S.K.'],
        [2024, 'Mauro Icardi', 25, 'Galatasaray S.K.'],
        [2023, 'Enner Valencia', 29, 'Fenerbahçe S.K.'],
        [2022, 'Umut Bozok', 20, 'Kasımpaşa S.K.'],
        [2021, 'Aaron Boupendza', 22, 'Hatayspor'],
        [2020, 'Alexander Sørloth', 24, 'Trabzonspor'],
        [2019, 'Mbaye Diagne', 30, 'Kasımpaşa and Galatasaray'],
        [2018, 'Bafétimbi Gomis', 29, 'Galatasaray S.K.'],
        [2017, 'Vágner Love', 23, 'Alanyaspor'],
        [2016, 'Mario Gómez', 26, 'Beşiktaş J.K.'],
        [2015, 'Fernandão', 22, 'Bursaspor'],
        [2014, 'Aatif Chahechouhe', 17, 'Sivasspor'],
        [2013, 'Burak Yılmaz', 24, 'Galatasaray S.K.'],
        [2012, 'Burak Yılmaz', 33, 'Trabzonspor'],
        [2011, 'Alex', 28, 'Fenerbahçe S.K.'],
      ],
    ),
  ],

  'swiss-super-league': [
    champions(
      [
        [2026, 'FC Thun'],
        [2025, 'FC Basel'],
        [2024, 'BSC Young Boys'],
        [2023, 'BSC Young Boys'],
        [2022, 'FC Zürich'],
        [2021, 'BSC Young Boys'],
        [2020, 'BSC Young Boys'],
        [2019, 'BSC Young Boys'],
        [2018, 'BSC Young Boys'],
        [2017, 'FC Basel'],
        [2016, 'FC Basel'],
        [2015, 'FC Basel'],
        [2014, 'FC Basel'],
        [2013, 'FC Basel'],
        [2012, 'FC Basel'],
        [2011, 'FC Basel'],
        [2010, 'FC Basel'],
        [2009, 'FC Zürich'],
        [2008, 'FC Basel'],
        [2007, 'FC Zürich'],
        [2006, 'FC Zürich'],
        [2005, 'FC Basel'],
        [2004, 'FC Basel'],
      ],
      'https://en.wikipedia.org/wiki/List_of_Swiss_football_champions',
      '2026-08-23',
      'Super League era only, from the 2003-04 rebrand. The Swiss championship has been contested since 1898 under earlier formats.',
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the year',
      'https://en.wikipedia.org/wiki/Swiss_Footballer_of_the_Year',
      '2026-08-23',
      'The Swiss Super League Player of the Year, which is awarded by calendar year rather than by season; the year shown is the award’s own.',
      [
        [2025, 'Xherdan Shaqiri', null, 'FC Basel'],
        [2024, 'Alvyn Sanches', null, 'FC Lausanne-Sport'],
        [2023, 'Meschak Elia', null, 'BSC Young Boys'],
        [2022, 'Fabian Rieder', null, 'BSC Young Boys'],
        [2021, 'Arthur Cabral', null, 'FC Basel'],
        [2020, 'Jean-Pierre Nsame', null, 'BSC Young Boys'],
        [2019, 'Jean-Pierre Nsame', null, 'BSC Young Boys'],
        [2018, 'Kevin Mbabu', null, 'BSC Young Boys'],
        [2017, 'Michael Lang', null, 'FC Basel'],
        [2016, 'Guillaume Hoarau', null, 'BSC Young Boys'],
        [2015, 'Breel Embolo', null, 'FC Basel'],
        [2014, 'Shkëlzen Gashi', null, 'Grasshopper Club Zürich'],
        [2013, 'Mohamed Salah', null, 'FC Basel'],
        [2012, 'Alexander Frei', null, 'FC Basel'],
        [2011, 'Alexander Frei', null, 'FC Basel'],
        [2010, 'Seydou Doumbia', null, 'BSC Young Boys'],
      ],
    ),
  ],

  'belgian-pro-league': [
    champions(
      [
        [2026, 'Club Brugge KV'],
        [2025, 'Royale Union Saint-Gilloise'],
        [2024, 'Club Brugge KV'],
        [2023, 'Royal Antwerp F.C.'],
        [2022, 'Club Brugge KV'],
        [2021, 'Club Brugge KV'],
        [2020, 'Club Brugge KV'],
        [2019, 'K.R.C. Genk'],
        [2018, 'Club Brugge KV'],
        [2017, 'R.S.C. Anderlecht'],
        [2016, 'Club Brugge KV'],
        [2015, 'K.A.A. Gent'],
        [2014, 'R.S.C. Anderlecht'],
        [2013, 'R.S.C. Anderlecht'],
        [2012, 'R.S.C. Anderlecht'],
        [2011, 'K.R.C. Genk'],
        [2010, 'R.S.C. Anderlecht'],
        [2009, 'Standard Liège'],
        [2008, 'Standard Liège'],
        [2007, 'R.S.C. Anderlecht'],
        [2006, 'R.S.C. Anderlecht'],
        [2005, 'Club Brugge KV'],
        [2004, 'R.S.C. Anderlecht'],
        [2003, 'Club Brugge KV'],
        [2002, 'K.R.C. Genk'],
        [2001, 'R.S.C. Anderlecht'],
        [2000, 'R.S.C. Anderlecht'],
        [1999, 'K.R.C. Genk'],
        [1998, 'Club Brugge KV'],
        [1997, 'K. Lierse S.K.'],
        [1996, 'Club Brugge KV'],
        [1995, 'R.S.C. Anderlecht'],
        [1994, 'R.S.C. Anderlecht'],
        [1993, 'R.S.C. Anderlecht'],
        [1992, 'Club Brugge KV'],
        [1991, 'R.S.C. Anderlecht'],
        [1990, 'Club Brugge KV'],
        [1989, 'K.V. Mechelen'],
        [1988, 'Club Brugge KV'],
        [1987, 'R.S.C. Anderlecht'],
        [1986, 'R.S.C. Anderlecht'],
        [1985, 'R.S.C. Anderlecht'],
        [1984, 'K.S.K. Beveren'],
        [1983, 'Standard Liège'],
        [1982, 'Standard Liège'],
        [1981, 'R.S.C. Anderlecht'],
        [1980, 'Club Brugge KV'],
        [1979, 'K.S.K. Beveren'],
        [1978, 'Club Brugge KV'],
        [1977, 'Club Brugge KV'],
        [1976, 'Club Brugge KV'],
        [1975, 'R.W.D. Molenbeek'],
        [1974, 'R.S.C. Anderlecht'],
        [1973, 'Club Brugge KV'],
        [1972, 'R.S.C. Anderlecht'],
        [1971, 'Standard Liège'],
        [1970, 'Standard Liège'],
        [1969, 'Standard Liège'],
        [1968, 'R.S.C. Anderlecht'],
        [1967, 'R.S.C. Anderlecht'],
        [1966, 'R.S.C. Anderlecht'],
        [1965, 'R.S.C. Anderlecht'],
        [1964, 'R.S.C. Anderlecht'],
        [1963, 'Standard Liège'],
        [1962, 'R.S.C. Anderlecht'],
        [1961, 'Standard Liège'],
        [1960, 'K. Lierse S.K.'],
        [1959, 'R.S.C. Anderlecht'],
        [1958, 'Standard Liège'],
        [1957, 'Royal Antwerp F.C.'],
        [1956, 'R.S.C. Anderlecht'],
        [1955, 'R.S.C. Anderlecht'],
        [1954, 'R.S.C. Anderlecht'],
        [1953, 'R.F.C. Liège'],
        [1952, 'R.F.C. Liège'],
        [1951, 'R.S.C. Anderlecht'],
        [1950, 'R.S.C. Anderlecht'],
        [1949, 'R.S.C. Anderlecht'],
        [1947, 'R.S.C. Anderlecht'],
      ],
      'https://en.wikipedia.org/wiki/List_of_Belgian_football_champions',
      '2026-08-23',
      'Listed from 1947, when the post-war competition resumed under the clubs’ modern names. The championship has been contested since 1896, and seven wartime seasons were not played.',
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Belgian_professional_football_awards',
      '2026-08-23',
      'The Belgian Professional Footballer of the Year, voted by the league’s players. No award was made for 2019-20.',
      [
        [2026, 'Christos Tzolis', null, 'Club Brugge KV'],
        [2025, 'Ardon Jashari', null, 'Club Brugge KV'],
        [2024, 'Cameron Puertas', null, 'Royale Union Saint-Gilloise'],
        [2023, 'Mike Trésor', null, 'K.R.C. Genk'],
        [2022, 'Deniz Undav', null, 'Royale Union Saint-Gilloise'],
        [2021, 'Paul Onuachu', null, 'K.R.C. Genk'],
        [2019, 'Hans Vanaken', null, 'Club Brugge KV'],
        [2018, 'Hans Vanaken', null, 'Club Brugge KV'],
        [2017, 'Youri Tielemans', null, 'R.S.C. Anderlecht'],
        [2016, 'Sofiane Hanni', null, 'K.V. Mechelen'],
        [2015, 'Víctor Vázquez', null, 'Club Brugge KV'],
        [2014, 'Thorgan Hazard', null, 'S.V. Zulte Waregem'],
        [2013, 'Carlos Bacca', null, 'Club Brugge KV'],
        [2012, 'Matías Suárez', null, 'R.S.C. Anderlecht'],
        [2011, 'Ivan Perišić', null, 'Club Brugge KV'],
        [2010, 'Mbark Boussoufa', null, 'R.S.C. Anderlecht'],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/Belgian_Pro_League_top_scorers',
      '2026-08-23',
      'Goals scored. Seasons with joint leading scorers list each of them.',
      [
        [2026, 'Nicolò Tresoldi', 19, 'Club Brugge KV'],
        [2025, 'Adriano Bertaccini', 21, 'Sint-Truidense V.V.'],
        [2025, 'Tolu Arokodare', 21, 'K.R.C. Genk'],
        [2024, 'Kévin Denkey', 27, 'Cercle Brugge K.S.V.'],
        [2023, 'Hugo Cuypers', 24, 'K.A.A. Gent'],
        [2022, 'Deniz Undav', 26, 'Royale Union Saint-Gilloise'],
        [2021, 'Paul Onuachu', 33, 'K.R.C. Genk'],
        [2020, 'Dieumerci Mbokani', 18, 'Royal Antwerp F.C.'],
        [2019, 'Hamdi Harbaoui', 25, 'S.V. Zulte Waregem'],
        [2018, 'Hamdi Harbaoui', 22, 'Anderlecht and Zulte Waregem'],
        [2017, 'Łukasz Teodorczyk', 22, 'R.S.C. Anderlecht'],
        [2016, 'Jérémy Perbet', 22, 'R. Charleroi S.C.'],
        [2015, 'Aleksandar Mitrović', 20, 'R.S.C. Anderlecht'],
        [2014, 'Hamdi Harbaoui', 22, 'K.S.C. Lokeren'],
        [2013, 'Carlos Bacca', 25, 'Club Brugge KV'],
        [2012, 'Jérémy Perbet', 25, 'R.A.E.C. Mons'],
        [2011, 'Ivan Perišić', 22, 'Club Brugge KV'],
        [2010, 'Romelu Lukaku', 15, 'R.S.C. Anderlecht'],
      ],
    ),
    seasons(
      'award:best-goalkeeper',
      'Goalkeeper of the season',
      'https://en.wikipedia.org/wiki/Belgian_professional_football_awards',
      '2026-08-23',
      'The Belgian Professional Goalkeeper of the Year. No award was made for 2019-20, and the source records no winner after 2021-22.',
      [
        [2022, 'Simon Mignolet', null, 'Club Brugge KV'],
        [2021, 'Simon Mignolet', null, 'Club Brugge KV'],
        [2019, 'Danny Vukovic', null, 'K.R.C. Genk'],
        [2018, 'Lovre Kalinić', null, 'K.A.A. Gent'],
        [2017, 'Lovre Kalinić', null, 'K.A.A. Gent'],
        [2016, 'Matz Sels', null, 'K.A.A. Gent'],
        [2015, 'Mathew Ryan', null, 'Club Brugge KV'],
        [2014, 'Mathew Ryan', null, 'Club Brugge KV'],
        [2013, 'Silvio Proto', null, 'R.S.C. Anderlecht'],
        [2012, 'Silvio Proto', null, 'R.S.C. Anderlecht'],
        [2011, 'Thibaut Courtois', null, 'K.R.C. Genk'],
        [2010, 'Simon Mignolet', null, 'Sint-Truidense V.V.'],
      ],
    ),
  ],

  'la-liga': [
    champions(
      LA_LIGA_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_Spanish_football_champions',
      '2026-08-23',
      'The 1936-37, 1937-38 and 1938-39 seasons were not played during the Civil War and are omitted.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_footballers_with_400_or_more_La_Liga_appearances',
      '2026-08-22',
      [
        ['Andoni Zubizarreta', 622, 'Athletic Bilbao, Barcelona, Valencia'],
        ['Joaquín', 622, 'Real Betis, Valencia, Málaga'],
        ['Raúl García', 609, 'Osasuna, Atlético Madrid, Athletic Bilbao'],
        ['Antoine Griezmann', 564, 'Real Sociedad, Atlético Madrid, Barcelona'],
        ['Dani Parejo', 558, 'Real Madrid, Getafe, Valencia, Villarreal'],
        ['Raúl', 550, 'Real Madrid'],
        ['Eusebio Sacristán', 543, 'Valladolid, Atlético Madrid, Barcelona, Celta Vigo'],
        ['Francisco Buyo', 542, 'Sevilla, Real Madrid'],
        ['Sergio Ramos', 536, 'Sevilla, Real Madrid'],
        ['Manuel Sanchís', 523, 'Real Madrid'],
      ],
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_La_Liga_top_scorers',
      '2026-08-22',
      [
        ['Lionel Messi', 474, 'Barcelona'],
        ['Cristiano Ronaldo', 311, 'Real Madrid'],
        ['Telmo Zarra', 251, 'Athletic Bilbao'],
        ['Karim Benzema', 238, 'Real Madrid'],
        ['Hugo Sánchez', 234, 'Atlético Madrid, Real Madrid, Rayo Vallecano'],
        ['Raúl', 228, 'Real Madrid'],
        ['Alfredo Di Stéfano', 227, 'Real Madrid, Espanyol'],
        ['César Rodríguez', 221, 'Granada, Barcelona, Cultural Leonesa, Elche'],
        ['Quini', 219, 'Sporting Gijón, Barcelona'],
        ['Pahiño', 212, 'Celta Vigo, Real Madrid, Deportivo'],
      ],
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/La_Liga_Awards',
      '2026-08-23',
      'The La Liga Awards best player, presented since 2008-09.',
      [
        [2026, 'Lamine Yamal', null, BARCELONA],
        [2025, 'Raphinha', null, BARCELONA],
        [2024, 'Jude Bellingham', null, REAL_MADRID],
        [2023, 'Marc-André ter Stegen', null, BARCELONA],
        [2022, 'Karim Benzema', null, REAL_MADRID],
        [2021, 'Jan Oblak', null, ATLETICO],
        [2020, 'Karim Benzema', null, REAL_MADRID],
        [2019, 'Lionel Messi', null, BARCELONA],
        [2018, 'Lionel Messi', null, BARCELONA],
        [2017, 'Lionel Messi', null, BARCELONA],
        [2016, 'Antoine Griezmann', null, ATLETICO],
        [2015, 'Lionel Messi', null, BARCELONA],
        [2014, 'Cristiano Ronaldo', null, REAL_MADRID],
        [2013, 'Lionel Messi', null, BARCELONA],
        [2012, 'Lionel Messi', null, BARCELONA],
        [2011, 'Lionel Messi', null, BARCELONA],
        [2010, 'Lionel Messi', null, BARCELONA],
        [2009, 'Lionel Messi', null, BARCELONA],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Pichichi Trophy',
      'https://en.wikipedia.org/wiki/Pichichi_Trophy',
      '2026-08-23',
      'Goals scored by the league’s leading scorer.',
      [
        [2026, 'Kylian Mbappé', 25, REAL_MADRID],
        [2025, 'Kylian Mbappé', 31, REAL_MADRID],
        [2024, 'Artem Dovbyk', 24, 'Girona FC'],
        [2023, 'Robert Lewandowski', 23, BARCELONA],
        [2022, 'Karim Benzema', 27, REAL_MADRID],
        [2021, 'Lionel Messi', 30, BARCELONA],
        [2020, 'Lionel Messi', 25, BARCELONA],
        [2019, 'Lionel Messi', 36, BARCELONA],
        [2018, 'Lionel Messi', 34, BARCELONA],
        [2017, 'Lionel Messi', 37, BARCELONA],
        [2016, 'Luis Suárez', 40, BARCELONA],
        [2015, 'Cristiano Ronaldo', 48, REAL_MADRID],
        [2014, 'Cristiano Ronaldo', 31, REAL_MADRID],
        [2013, 'Lionel Messi', 46, BARCELONA],
        [2012, 'Lionel Messi', 50, BARCELONA],
        [2011, 'Cristiano Ronaldo', 40, REAL_MADRID],
        [2010, 'Lionel Messi', 34, BARCELONA],
        [2009, 'Diego Forlán', 32, ATLETICO],
        [2008, 'Dani Güiza', 27, 'RCD Mallorca'],
        [2007, 'Ruud van Nistelrooy', 25, REAL_MADRID],
        [2006, "Samuel Eto'o", 26, BARCELONA],
        [2005, 'Diego Forlán', 25, 'Villarreal CF'],
        [2004, 'Ronaldo', 25, REAL_MADRID],
        [2003, 'Roy Makaay', 29, DEPORTIVO],
        [2002, 'Diego Tristán', 21, DEPORTIVO],
        [2001, 'Raúl', 24, REAL_MADRID],
      ],
    ),
    // The Zamora is won on the lowest ratio of goals conceded, so a smaller
    // figure is the better one. Stated in the caveat because the column
    // otherwise reads like every other table here, where more is better.
    seasons(
      'award:best-goalkeeper',
      'Ricardo Zamora Trophy',
      'https://en.wikipedia.org/wiki/Ricardo_Zamora_Trophy',
      '2026-08-23',
      'Goals conceded by the winning goalkeeper: the award goes to the lowest ratio, so a lower figure is the better one.',
      [
        [2026, 'Joan García', 21, BARCELONA],
        [2025, 'Jan Oblak', 30, ATLETICO],
        [2024, 'Unai Simón', 33, ATHLETIC],
        [2023, 'Marc-André ter Stegen', 20, BARCELONA],
        [2022, 'Yassine Bounou', 24, SEVILLA],
        [2021, 'Jan Oblak', 25, ATLETICO],
        [2020, 'Thibaut Courtois', 20, REAL_MADRID],
        [2019, 'Jan Oblak', 27, ATLETICO],
        [2018, 'Jan Oblak', 22, ATLETICO],
        [2017, 'Jan Oblak', 21, ATLETICO],
        [2016, 'Jan Oblak', 18, ATLETICO],
        [2015, 'Claudio Bravo', 19, BARCELONA],
        [2014, 'Thibaut Courtois', 24, ATLETICO],
        [2013, 'Thibaut Courtois', 29, ATLETICO],
        [2012, 'Víctor Valdés', 28, BARCELONA],
        [2011, 'Víctor Valdés', 16, BARCELONA],
        [2010, 'Víctor Valdés', 24, BARCELONA],
        [2009, 'Víctor Valdés', 31, BARCELONA],
        [2008, 'Iker Casillas', 32, REAL_MADRID],
        [2007, 'Roberto Abbondanzieri', 30, 'Getafe CF'],
        [2006, 'José Manuel Pinto', 28, 'RC Celta de Vigo'],
      ],
    ),
  ],

  'lega-serie-a': [
    champions(
      SERIE_A_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_Italian_football_champions',
      '2026-08-23',
      'The 2004-05 title was revoked over Calciopoli and left unassigned, and the 1943-44 and 1944-45 seasons were not played; all three are omitted.',
    ),
    // The source table for both career lists carries no club column, only years
    // and totals, so the detail here is the span rather than the clubs. Filling
    // the clubs in from memory is exactly the kind of unattributed figure this
    // file exists to avoid.
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/Football_records_and_statistics_in_Italy',
      '2024-09-19',
      [
        ['Gianluigi Buffon', 657, 'Parma, Juventus'],
        ['Paolo Maldini', 647, 'AC Milan'],
        ['Francesco Totti', 619, 'Roma'],
        ['Javier Zanetti', 615, 'Inter Milan'],
        ['Gianluca Pagliuca', 592, null],
        ['Dino Zoff', 570, null],
        ['Samir Handanović', 566, null],
        ['Pietro Vierchowod', 562, null],
        ['Fabio Quagliarella', 556, null],
        ['Roberto Mancini', 541, null],
      ],
      'The source lists no clubs for several of these players, and none is shown where it is not sourced.',
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/Football_records_and_statistics_in_Italy',
      '2026-01-25',
      [
        ['Silvio Piola', 274, null],
        ['Francesco Totti', 250, 'Roma'],
        ['Gunnar Nordahl', 225, null],
        ['Giuseppe Meazza', 216, null],
        ['José Altafini', 216, null],
        ['Antonio Di Natale', 209, null],
        ['Roberto Baggio', 205, null],
        ['Ciro Immobile', 201, null],
        ['Kurt Hamrin', 190, null],
        ['Giuseppe Signori', 188, null],
        ['Alessandro Del Piero', 188, null],
        ['Alberto Gilardino', 188, null],
      ],
      'Three players share tenth place and all are shown. The source lists no clubs for most of these players, and none is shown where it is not sourced.',
    ),
    // The Gran Galà del Calcio is held in December, so the 2025-26 awards fall
    // after this file's asOf date and both Italian award tables end at 2025.
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Serie_A_Footballer_of_the_Year',
      '2026-08-23',
      'Presented each December, so the 2025-26 award is not yet made.',
      [
        [2025, 'Scott McTominay', null, NAPOLI],
        [2024, 'Lautaro Martínez', null, INTER],
        [2023, 'Victor Osimhen', null, NAPOLI],
        [2022, 'Rafael Leão', null, MILAN],
        [2021, 'Romelu Lukaku', null, INTER],
        [2020, 'Cristiano Ronaldo', null, JUVENTUS],
        [2019, 'Cristiano Ronaldo', null, JUVENTUS],
        [2018, 'Mauro Icardi', null, INTER],
        [2017, 'Gianluigi Buffon', null, JUVENTUS],
        [2016, 'Leonardo Bonucci', null, JUVENTUS],
        [2015, 'Carlos Tevez', null, JUVENTUS],
        [2014, 'Andrea Pirlo', null, JUVENTUS],
        [2013, 'Andrea Pirlo', null, JUVENTUS],
        [2012, 'Andrea Pirlo', null, JUVENTUS],
        [2011, 'Zlatan Ibrahimović', null, MILAN],
        [2010, 'Diego Milito', null, INTER],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Capocannoniere',
      'https://en.wikipedia.org/wiki/List_of_Serie_A_top_scorers',
      '2026-08-23',
      'Goals scored. Seasons with joint winners list each of them.',
      [
        [2026, 'Lautaro Martínez', 17, INTER],
        [2025, 'Mateo Retegui', 25, 'Atalanta BC'],
        [2024, 'Lautaro Martínez', 24, INTER],
        [2023, 'Victor Osimhen', 26, NAPOLI],
        [2022, 'Ciro Immobile', 27, LAZIO],
        [2021, 'Cristiano Ronaldo', 29, JUVENTUS],
        [2020, 'Ciro Immobile', 36, LAZIO],
        [2019, 'Fabio Quagliarella', 26, SAMPDORIA],
        [2018, 'Mauro Icardi', 29, INTER],
        [2018, 'Ciro Immobile', 29, LAZIO],
        [2017, 'Edin Džeko', 29, ROMA],
        [2016, 'Gonzalo Higuaín', 36, NAPOLI],
        [2015, 'Mauro Icardi', 22, INTER],
        [2015, 'Luca Toni', 22, VERONA],
        [2014, 'Ciro Immobile', 22, TORINO],
        [2013, 'Edinson Cavani', 29, NAPOLI],
        [2012, 'Zlatan Ibrahimović', 28, MILAN],
        [2011, 'Antonio Di Natale', 28, 'Udinese Calcio'],
        [2010, 'Antonio Di Natale', 29, 'Udinese Calcio'],
        [2009, 'Zlatan Ibrahimović', 25, INTER],
        [2008, 'Alessandro Del Piero', 21, JUVENTUS],
        [2007, 'Francesco Totti', 26, ROMA],
        [2006, 'Luca Toni', 31, FIORENTINA],
        [2005, 'Cristiano Lucarelli', 24, 'AS Livorno Calcio'],
        [2004, 'Andriy Shevchenko', 24, MILAN],
        [2003, 'Christian Vieri', 24, INTER],
        [2002, 'David Trezeguet', 24, JUVENTUS],
        [2002, 'Dario Hübner', 24, 'Piacenza Calcio'],
        [2001, 'Hernán Crespo', 26, LAZIO],
      ],
    ),
    seasons(
      'award:best-goalkeeper',
      'Goalkeeper of the year',
      'https://en.wikipedia.org/wiki/Serie_A_Goalkeeper_of_the_Year',
      '2026-08-23',
      'A voted award with no figure attached. Presented each December, so the 2025-26 award is not yet made.',
      [
        [2025, 'Mile Svilar', null, ROMA],
        [2024, 'Yann Sommer', null, INTER],
        [2023, 'Mike Maignan', null, MILAN],
        [2022, 'Mike Maignan', null, MILAN],
        [2021, 'Gianluigi Donnarumma', null, MILAN],
        [2020, 'Gianluigi Donnarumma', null, MILAN],
        [2019, 'Samir Handanović', null, INTER],
        [2018, 'Alisson', null, ROMA],
        [2017, 'Gianluigi Buffon', null, JUVENTUS],
        [2016, 'Gianluigi Buffon', null, JUVENTUS],
        [2015, 'Gianluigi Buffon', null, JUVENTUS],
        [2014, 'Gianluigi Buffon', null, JUVENTUS],
        [2013, 'Samir Handanović', null, INTER],
        [2012, 'Gianluigi Buffon', null, JUVENTUS],
        [2011, 'Samir Handanović', null, 'Udinese Calcio'],
      ],
    ),
  ],

  'german-bundesliga': [
    champions(
      BUNDESLIGA_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_German_football_champions',
      '2026-08-23',
      'Bundesliga era only, from its 1963-64 foundation. German championships decided before then were played under a different format and are not included.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_Bundesliga_players',
      '2026-08-21',
      [
        ['Charly Körbel', 602, 'Eintracht Frankfurt'],
        ['Manfred Kaltz', 581, 'Hamburger SV'],
        ['Oliver Kahn', 557, 'Karlsruher SC, Bayern Munich'],
        ['Klaus Fichtel', 552, 'Schalke 04, Werder Bremen'],
        ['Miroslav Votava', 546, 'Borussia Dortmund, Werder Bremen'],
        ['Manuel Neuer', 545, 'Schalke 04, Bayern Munich'],
        ['Klaus Fischer', 535, '1860 Munich, Schalke 04, 1. FC Köln, VfL Bochum'],
        ['Eike Immel', 534, 'VfB Stuttgart, Borussia Dortmund'],
        ['Oliver Baumann', 523, 'SC Freiburg, Hoffenheim'],
        ['Willi Neuberger', 520, 'Frankfurt, Dortmund, Werder Bremen, Wuppertal'],
      ],
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_Bundesliga_top_scorers',
      '2026-06-23',
      [
        ['Gerd Müller', 365, 'Bayern Munich'],
        ['Robert Lewandowski', 312, 'Borussia Dortmund, Bayern Munich'],
        ['Klaus Fischer', 268, '1860 Munich, Schalke 04, 1. FC Köln, VfL Bochum'],
        ['Jupp Heynckes', 220, 'Borussia Mönchengladbach, Hannover'],
        ['Manfred Burgsmüller', 213, 'Essen, Borussia Dortmund, Nürnberg, Werder Bremen'],
        ['Claudio Pizarro', 197, 'Werder Bremen, Bayern Munich, 1. FC Köln'],
        ['Ulf Kirsten', 181, 'Bayer Leverkusen'],
        ['Stefan Kuntz', 179, 'Bochum, Uerdingen, Kaiserslautern, Bielefeld'],
        ['Dieter Müller', 177, '1. FC Köln, VfB Stuttgart, Saarbrücken'],
        ['Klaus Allofs', 177, 'Fortuna Düsseldorf, 1. FC Köln, Werder Bremen'],
      ],
    ),
    // The league's own award has existed only since 2019-20. The German
    // Footballer of the Year is not substituted for the earlier seasons: it is
    // a calendar-year award and its winners need not play in the Bundesliga at
    // all, so mapping it onto seasons would state something the source does not.
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Bundesliga_Awards',
      '2026-08-23',
      'The official Bundesliga award, presented since 2019-20.',
      [
        [2026, 'Michael Olise', null, BAYERN],
        [2025, 'Harry Kane', null, BAYERN],
        [2024, 'Florian Wirtz', null, LEVERKUSEN],
        [2023, 'Jude Bellingham', null, DORTMUND],
        [2022, 'Christopher Nkunku', null, 'RB Leipzig'],
        [2021, 'Erling Haaland', null, DORTMUND],
        [2020, 'Robert Lewandowski', null, BAYERN],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Torjägerkanone',
      'https://en.wikipedia.org/wiki/List_of_Bundesliga_top_scorers_by_season',
      '2026-08-23',
      'Goals scored. Seasons with joint winners list each of them.',
      [
        [2026, 'Harry Kane', 36, BAYERN],
        [2025, 'Harry Kane', 26, BAYERN],
        [2024, 'Harry Kane', 36, BAYERN],
        [2023, 'Niclas Füllkrug', 16, WERDER],
        [2023, 'Christopher Nkunku', 16, 'RB Leipzig'],
        [2022, 'Robert Lewandowski', 35, BAYERN],
        [2021, 'Robert Lewandowski', 41, BAYERN],
        [2020, 'Robert Lewandowski', 34, BAYERN],
        [2019, 'Robert Lewandowski', 22, BAYERN],
        [2018, 'Robert Lewandowski', 29, BAYERN],
        [2017, 'Pierre-Emerick Aubameyang', 31, DORTMUND],
        [2016, 'Robert Lewandowski', 30, BAYERN],
        [2015, 'Alexander Meier', 19, FRANKFURT],
        [2014, 'Robert Lewandowski', 20, DORTMUND],
        [2013, 'Stefan Kießling', 25, LEVERKUSEN],
        [2012, 'Klaas-Jan Huntelaar', 29, 'Schalke 04'],
        [2011, 'Mario Gómez', 28, BAYERN],
        [2010, 'Edin Džeko', 22, WOLFSBURG],
        [2009, 'Grafite', 28, WOLFSBURG],
        [2008, 'Luca Toni', 24, BAYERN],
        [2007, 'Theofanis Gekas', 20, 'VfL Bochum'],
        [2006, 'Miroslav Klose', 25, WERDER],
        [2005, 'Marek Mintál', 24, NURNBERG],
        [2004, 'Aílton', 28, WERDER],
        [2003, 'Thomas Christiansen', 21, 'VfL Bochum'],
        [2003, 'Giovane Élber', 21, BAYERN],
        [2002, 'Márcio Amoroso', 18, DORTMUND],
        [2002, 'Martin Max', 18, MUNICH_1860],
        [2001, 'Sergej Barbarez', 22, HAMBURG],
        [2001, 'Ebbe Sand', 22, 'Schalke 04'],
      ],
    ),
    // The goalkeeper in the official Team of the Season, which is the honour the
    // league actually publishes; there is no separate goalkeeper award. 2019-20
    // is absent because no team was named that season.
    seasons(
      'award:best-goalkeeper',
      'Goalkeeper of the season',
      'https://en.wikipedia.org/wiki/Bundesliga_Awards',
      '2026-08-23',
      'The goalkeeper named in the official Team of the Season. No team was named for 2019-20.',
      [
        [2026, 'Gregor Kobel', null, DORTMUND],
        [2025, 'Robin Zentner', null, '1. FSV Mainz 05'],
        [2024, 'Gregor Kobel', null, DORTMUND],
        [2023, 'Gregor Kobel', null, DORTMUND],
        [2022, 'Manuel Neuer', null, BAYERN],
        [2021, 'Manuel Neuer', null, BAYERN],
        [2019, 'Kevin Trapp', null, FRANKFURT],
        [2018, 'Lukáš Hrádecký', null, FRANKFURT],
        [2017, 'Manuel Neuer', null, BAYERN],
        [2016, 'Manuel Neuer', null, BAYERN],
        [2015, 'Manuel Neuer', null, BAYERN],
        [2014, 'Manuel Neuer', null, BAYERN],
        [2013, 'Manuel Neuer', null, BAYERN],
      ],
    ),
  ],

  'ligue-1': [
    champions(
      LIGUE_1_CHAMPIONS,
      'https://en.wikipedia.org/wiki/List_of_French_football_champions',
      '2026-08-23',
      'The 1992-93 title was withheld after the match-fixing affair and no champion is recorded; the wartime seasons from 1939-40 to 1944-45 were not played. Both are omitted.',
    ),
    careers(
      'most_appearances',
      'Most appearances',
      'https://en.wikipedia.org/wiki/List_of_Ligue_1_records_and_statistics',
      '2026-08-23',
      [
        ['Mickaël Landreau', 618, 'Nantes, PSG, Lille, Bastia'],
        ['Jean-Luc Ettori', 602, 'Monaco'],
        ['Dominique Dropsy', 596, 'Valenciennes, Strasbourg, Bordeaux'],
        ['Dominique Baratelli', 593, 'Ajaccio, Nice, PSG'],
        ['Alain Giresse', 586, 'Bordeaux, Marseille'],
        ['Sylvain Kastendeuch', 577, 'Metz, Saint-Étienne, Toulouse'],
        ['Patrick Battiston', 558, 'Metz, Saint-Étienne, Bordeaux, Monaco'],
        ['Jacky Novi', 545, 'Marseille, Nîmes, PSG, Strasbourg'],
        ['Roger Marche', 542, 'Reims, RC Paris'],
        ['Jean-Paul Bertrand-Demanes', 532, 'Nantes'],
      ],
    ),
    careers(
      'top_scorers',
      'All-time top scorers',
      'https://en.wikipedia.org/wiki/List_of_Ligue_1_records_and_statistics',
      '2026-08-23',
      [
        ['Delio Onnis', 299, 'Monaco, Reims, Tours, Toulon'],
        ['Bernard Lacombe', 255, 'Lyon, Saint-Étienne, Bordeaux'],
        ['Hervé Revelli', 216, 'Saint-Étienne, Nice'],
        ['Roger Courtois', 210, 'Sochaux, Troyes'],
        ['Thadée Cisowski', 206, 'Metz, RC Paris, Valenciennes'],
        ['Roger Piantoni', 203, 'Nancy, Reims, Nice'],
        ['Kylian Mbappé', 191, 'Monaco, Paris Saint-Germain'],
        ['Joseph Ujlaki', 190, 'Stade Français, Sète, Nîmes, Nice, RC Paris'],
        ['Fleury Di Nallo', 187, 'Lyon, Red Star'],
        ['Carlos Bianchi', 179, 'Reims, PSG, Strasbourg'],
        ['Gunnar Andersson', 179, 'Marseille, Bordeaux'],
      ],
      'Two players share tenth place and both are shown.',
    ),
    seasons(
      'award:most-valuable-player-award',
      'Player of the season',
      'https://en.wikipedia.org/wiki/Troph%C3%A9es_UNFP_du_football',
      '2026-08-23',
      'The UNFP Ligue 1 Player of the Year. No award was made for 2019-20, when the season was curtailed.',
      [
        [2026, 'Ousmane Dembélé', null, PSG],
        [2025, 'Ousmane Dembélé', null, PSG],
        [2024, 'Kylian Mbappé', null, PSG],
        [2023, 'Kylian Mbappé', null, PSG],
        [2022, 'Kylian Mbappé', null, PSG],
        [2021, 'Kylian Mbappé', null, PSG],
        [2019, 'Kylian Mbappé', null, PSG],
        [2018, 'Neymar', null, PSG],
        [2017, 'Edinson Cavani', null, PSG],
        [2016, 'Zlatan Ibrahimović', null, PSG],
        [2015, 'Alexandre Lacazette', null, LYON],
        [2014, 'Zlatan Ibrahimović', null, PSG],
        [2013, 'Zlatan Ibrahimović', null, PSG],
        [2012, 'Eden Hazard', null, LILLE],
        [2011, 'Eden Hazard', null, LILLE],
        [2010, 'Lisandro López', null, LYON],
        [2009, 'Yoann Gourcuff', null, BORDEAUX],
        [2008, 'Karim Benzema', null, LYON],
        [2007, 'Florent Malouda', null, LYON],
        [2006, 'Juninho Pernambucano', null, LYON],
      ],
    ),
    seasons(
      'award:more-goals-scored',
      'Golden Boot',
      'https://en.wikipedia.org/wiki/List_of_Ligue_1_top_scorers',
      '2026-08-23',
      'Goals scored. Seasons with joint winners list each of them.',
      [
        [2026, 'Esteban Lepaul', 21, 'Stade Rennais FC'],
        [2025, 'Ousmane Dembélé', 21, PSG],
        [2025, 'Mason Greenwood', 21, MARSEILLE],
        [2024, 'Kylian Mbappé', 27, PSG],
        [2023, 'Kylian Mbappé', 29, PSG],
        [2022, 'Kylian Mbappé', 28, PSG],
        [2021, 'Kylian Mbappé', 27, PSG],
        [2020, 'Wissam Ben Yedder', 18, MONACO],
        [2020, 'Kylian Mbappé', 18, PSG],
        [2019, 'Kylian Mbappé', 33, PSG],
        [2018, 'Edinson Cavani', 28, PSG],
        [2017, 'Edinson Cavani', 35, PSG],
        [2016, 'Zlatan Ibrahimović', 38, PSG],
        [2015, 'Alexandre Lacazette', 27, LYON],
        [2014, 'Zlatan Ibrahimović', 26, PSG],
        [2013, 'Zlatan Ibrahimović', 30, PSG],
        [2012, 'Olivier Giroud', 21, MONTPELLIER],
        [2012, 'Nenê', 21, PSG],
        [2011, 'Moussa Sow', 25, LILLE],
        [2010, 'Mamadou Niang', 18, MARSEILLE],
        [2009, 'André-Pierre Gignac', 24, 'Toulouse FC'],
        [2008, 'Karim Benzema', 20, LYON],
        [2007, 'Pauleta', 15, PSG],
        [2006, 'Pauleta', 21, PSG],
        [2005, 'Alexander Frei', 20, 'Stade Rennais FC'],
        [2004, 'Djibril Cissé', 26, AUXERRE],
        [2003, 'Shabani Nonda', 26, MONACO],
      ],
    ),
    seasons(
      'award:best-goalkeeper',
      'Goalkeeper of the season',
      'https://en.wikipedia.org/wiki/Troph%C3%A9es_UNFP_du_football',
      '2026-08-23',
      'The UNFP Ligue 1 Goalkeeper of the Year, a voted award with no figure attached. No award was made for 2019-20.',
      [
        [2026, 'Robin Risser', null, LENS],
        [2025, 'Lucas Chevalier', null, LILLE],
        [2024, 'Gianluigi Donnarumma', null, PSG],
        [2023, 'Brice Samba', null, LENS],
        [2022, 'Gianluigi Donnarumma', null, PSG],
        [2021, 'Keylor Navas', null, PSG],
        [2019, 'Mike Maignan', null, LILLE],
        [2018, 'Steve Mandanda', null, MARSEILLE],
        [2017, 'Danijel Subašić', null, MONACO],
        [2016, 'Steve Mandanda', null, MARSEILLE],
        [2015, 'Steve Mandanda', null, MARSEILLE],
        [2014, 'Salvatore Sirigu', null, PSG],
        [2013, 'Salvatore Sirigu', null, PSG],
        [2012, 'Hugo Lloris', null, LYON],
        [2011, 'Steve Mandanda', null, MARSEILLE],
        [2010, 'Hugo Lloris', null, LYON],
        [2009, 'Hugo Lloris', null, LYON],
        [2008, 'Steve Mandanda', null, MARSEILLE],
        [2007, 'Teddy Richert', null, SOCHAUX],
      ],
    ),
  ],
};

/**
 * Builds a tournament's roll of honour, newest edition first.
 *
 * Separate from `champions` because a tournament year is a whole label: the
 * 2024 Euro is "2024", not "2023-24". Passing it through the season formatter
 * would invent a span the competition never had.
 */
function editions(
  rows: Champion[],
  source: string,
  asOf: string,
  caveat?: string,
): CompetitionRankingSeed {
  return {
    kind: 'roll_of_honour',
    label: 'Winners',
    source,
    asOf,
    caveat,
    entries: rows.map(([year, nation], index) => ({
      rank: index + 1,
      name: nation,
      value: year,
      detail: String(year),
    })),
  };
}

/** Builds a per-edition award table for a tournament, newest first. */
function awards(
  kind: CompetitionRankingSeed['kind'],
  label: string,
  source: string,
  asOf: string,
  caveat: string | undefined,
  rows: Edition[],
): CompetitionRankingSeed {
  return {
    kind,
    label,
    source,
    asOf,
    caveat,
    entries: rows.map(([year, winner, value, nation], index) => ({
      rank: index + 1,
      name: winner,
      value: value ?? year,
      detail: `${year} · ${nation}`,
    })),
  };
}

/** Builds a roll of honour, newest season first. */
function champions(
  rows: Champion[],
  source: string,
  asOf: string,
  caveat?: string,
): CompetitionRankingSeed {
  return {
    kind: 'roll_of_honour',
    label: 'Winners',
    source,
    asOf,
    caveat,
    entries: rows.map(([year, club], index) => ({
      rank: index + 1,
      name: club,
      value: year,
      detail: seasonLabel(year),
    })),
  };
}

/** Builds an all-time career table, ordered as the source ranks it. */
function careers(
  kind: 'most_appearances' | 'top_scorers',
  label: string,
  source: string,
  asOf: string,
  rows: Career[],
  caveat?: string,
): CompetitionRankingSeed {
  return {
    kind,
    label,
    source,
    asOf,
    caveat,
    entries: rows.map(([name, value, clubs], index) => ({
      rank: index + 1,
      name,
      value,
      detail: clubs,
    })),
  };
}

/** Builds a season-by-season award table, newest season first. */
function seasons(
  kind: CompetitionRankingSeed['kind'],
  label: string,
  source: string,
  asOf: string,
  caveat: string | undefined,
  rows: Season[],
): CompetitionRankingSeed {
  return {
    kind,
    label,
    source,
    asOf,
    caveat,
    entries: rows.map(([year, winner, value, club], index) => ({
      rank: index + 1,
      name: winner,
      // The year stands in where the award carries no figure, so the numeric
      // column is never blank. The season is in `detail` either way.
      value: value ?? year,
      detail: `${seasonLabel(year)} · ${club}`,
    })),
  };
}

/**
 * Renders a season from the year it ended: 2026 becomes "2025-26".
 *
 * Every competition here runs across a European winter, so the label is always
 * a span. A single-year label would be the ambiguity that made the crawled
 * tables wrong in the first place.
 */
function seasonLabel(endYear: number): string {
  const start = endYear - 1;
  return `${start}-${String(endYear).slice(-2)}`;
}
