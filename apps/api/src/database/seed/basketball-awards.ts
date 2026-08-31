/**
 * Every NBA MVP and Finals MVP winner, with the team they won it with.
 *
 * Curated because Wikidata is both incomplete and, for team attribution,
 * silent. Two separate problems made the per-team award tables wrong, and this
 * list is what fixes both:
 *
 *   1. **Missing awards.** Wikidata records `P166` (award received)
 *      inconsistently for these two prizes. Measured against Wikipedia's own
 *      winner lists, the ingest recovered 47 of 58 Finals MVPs and 68 of 71
 *      MVPs. Tony Parker's item carries four awards and the 2007 Finals MVP is
 *      not among them; Kevin Durant's carries neither of his two. So Boston
 *      showed four Finals MVPs of seven, Golden State three of five and San
 *      Antonio four of five.
 *   2. **Ambiguous attribution.** An award carries no team, so the team page
 *      recovered it by matching the award year against the player's spells. Our
 *      membership dates have year granularity, and a transfer year therefore
 *      falls inside both spells: Kawhi Leonard's 2019 Finals MVP, won with
 *      Toronto, also appeared on the Clippers, whose spell starts in 2019. Four
 *      awards landed on two different franchises each (Kawhi 2019, LeBron 2010,
 *      Moses Malone 1982, Wilt Chamberlain 1968).
 *
 * Recording the team on the honour itself removes the guess entirely. Where an
 * honour names its team, the derivation uses it and never consults the dates.
 *
 * ## Why a list and not a better query
 *
 * The gap is not in how we ask. The missing awards are absent from the players'
 * Wikidata items, so no query recovers them and no re-run of the ingest will.
 * The ambiguity is inherent to year-granularity dates. This is therefore the
 * same kind of curation as `football-honour-tiers`: a short, auditable list of
 * facts we assert, every row read from the Wikipedia article for its award
 * ("NBA Finals Most Valuable Player Award" and "NBA Most Valuable Player
 * Award"), each of which tabulates every winner with the season and team.
 *
 * ## On the year
 *
 * NBA awards are dated by the season's **end** year, matching the ingest: the
 * 2007-08 MVP is 2008. Getting this wrong is what made Kobe Bryant appear as
 * the 2006 MVP when he won the 2008 one, so the convention is stated rather
 * than left implicit.
 *
 * ## On the team names
 *
 * Recorded as the award article states them, which for older seasons means the
 * franchise's name at the time: Bob McAdoo won the 1975 MVP with the Buffalo
 * Braves, now the Los Angeles Clippers. `FRANCHISE_RENAMES` maps those to the
 * name we hold, so the historical name stays visible in the data while still
 * resolving. A name that resolves to nothing is reported and the award is
 * seeded without a team, falling back to date matching.
 *
 * Seeding is idempotent: rows are matched on (player, title, year), so this runs
 * safely alongside a full ingest.
 */

export interface AwardWinnerSeed {
  /** The season's end year, matching the ingest's convention. */
  year: number;
  /** Display name, used to resolve the person we already hold. */
  player: string;
  /** The team they won it with, as the award article names it. */
  team: string;
}

/** The exact honour titles the ingest uses, so seeded rows merge with ingested ones. */
export const FINALS_MVP_TITLE = 'Bill Russell NBA Finals Most Valuable Player Award';
export const LEAGUE_MVP_TITLE = 'NBA Most Valuable Player Award';

/**
 * Historical franchise names, mapped to the name we hold.
 *
 * Only the ones these award lists actually use. Kept as data rather than
 * corrected in the lists above so the source stays faithful to the article.
 */
export const FRANCHISE_RENAMES: Record<string, string> = {
  'Buffalo Braves': 'Los Angeles Clippers',
  'Philadelphia Warriors': 'Golden State Warriors',
  'Seattle SuperSonics': 'Oklahoma City Thunder',
  'Washington Bullets': 'Washington Wizards',
  'Baltimore Bullets': 'Washington Wizards',
  'St. Louis Hawks': 'Atlanta Hawks',
  // Cincinnati Royals became the Sacramento Kings, via Kansas City.
  'Cincinnati Royals': 'Sacramento Kings',
  // Champions under names the franchise has since left behind. These reach the
  // roll of honour rather than the award lists, which is why they were added
  // after the rest: the NBA's champions article names each winner as it stood
  // that year, so seven rows named a team the catalogue holds only under its
  // modern name and linked to nothing.
  'Minneapolis Lakers': 'Los Angeles Lakers',
  'Syracuse Nationals': 'Philadelphia 76ers',
  'Fort Wayne Pistons': 'Detroit Pistons',
  'Rochester Royals': 'Sacramento Kings',
  'St. Louis Bombers': 'Atlanta Hawks',
  'New Jersey Nets': 'Brooklyn Nets',
  'Vancouver Grizzlies': 'Memphis Grizzlies',
  'Charlotte Bobcats': 'Charlotte Hornets',
  'New Orleans Hornets': 'New Orleans Pelicans',
  'San Diego Clippers': 'Los Angeles Clippers',
  'Kansas City Kings': 'Sacramento Kings',
};

/**
 * Names the award articles use that differ from the person we hold.
 *
 * Kareem Abdul-Jabbar is the only case in these lists: he won the 1971 MVP and
 * Finals MVP as Lew Alcindor, changing his name that year, and the article
 * records the name he held at the time. Mapped rather than renamed in the lists
 * so the source stays faithful to the article.
 */
export const PLAYER_RENAMES: Record<string, string> = {
  'Lew Alcindor': 'Kareem Abdul-Jabbar',
};

/** Every Finals MVP winner, 1969 to 2026. */
export const BASKETBALL_FINALS_MVP_SEEDS: AwardWinnerSeed[] = [
  { year: 1969, player: 'Jerry West', team: 'Los Angeles Lakers' },
  { year: 1970, player: 'Willis Reed', team: 'New York Knicks' },
  { year: 1971, player: 'Lew Alcindor', team: 'Milwaukee Bucks' },
  { year: 1972, player: 'Wilt Chamberlain', team: 'Los Angeles Lakers' },
  { year: 1973, player: 'Willis Reed', team: 'New York Knicks' },
  { year: 1974, player: 'John Havlicek', team: 'Boston Celtics' },
  { year: 1975, player: 'Rick Barry', team: 'Golden State Warriors' },
  { year: 1976, player: 'Jo Jo White', team: 'Boston Celtics' },
  { year: 1977, player: 'Bill Walton', team: 'Portland Trail Blazers' },
  { year: 1978, player: 'Wes Unseld', team: 'Washington Bullets' },
  { year: 1979, player: 'Dennis Johnson', team: 'Seattle SuperSonics' },
  { year: 1980, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1981, player: 'Cedric Maxwell', team: 'Boston Celtics' },
  { year: 1982, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1983, player: 'Moses Malone', team: 'Philadelphia 76ers' },
  { year: 1984, player: 'Larry Bird', team: 'Boston Celtics' },
  { year: 1985, player: 'Kareem Abdul-Jabbar', team: 'Los Angeles Lakers' },
  { year: 1986, player: 'Larry Bird', team: 'Boston Celtics' },
  { year: 1987, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1988, player: 'James Worthy', team: 'Los Angeles Lakers' },
  { year: 1989, player: 'Joe Dumars', team: 'Detroit Pistons' },
  { year: 1990, player: 'Isiah Thomas', team: 'Detroit Pistons' },
  { year: 1991, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1992, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1993, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1994, player: 'Hakeem Olajuwon', team: 'Houston Rockets' },
  { year: 1995, player: 'Hakeem Olajuwon', team: 'Houston Rockets' },
  { year: 1996, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1997, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1998, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1999, player: 'Tim Duncan', team: 'San Antonio Spurs' },
  { year: 2000, player: "Shaquille O'Neal", team: 'Los Angeles Lakers' },
  { year: 2001, player: "Shaquille O'Neal", team: 'Los Angeles Lakers' },
  { year: 2002, player: "Shaquille O'Neal", team: 'Los Angeles Lakers' },
  { year: 2003, player: 'Tim Duncan', team: 'San Antonio Spurs' },
  { year: 2004, player: 'Chauncey Billups', team: 'Detroit Pistons' },
  { year: 2005, player: 'Tim Duncan', team: 'San Antonio Spurs' },
  { year: 2006, player: 'Dwyane Wade', team: 'Miami Heat' },
  { year: 2007, player: 'Tony Parker', team: 'San Antonio Spurs' },
  { year: 2008, player: 'Paul Pierce', team: 'Boston Celtics' },
  { year: 2009, player: 'Kobe Bryant', team: 'Los Angeles Lakers' },
  { year: 2010, player: 'Kobe Bryant', team: 'Los Angeles Lakers' },
  { year: 2011, player: 'Dirk Nowitzki', team: 'Dallas Mavericks' },
  { year: 2012, player: 'LeBron James', team: 'Miami Heat' },
  { year: 2013, player: 'LeBron James', team: 'Miami Heat' },
  { year: 2014, player: 'Kawhi Leonard', team: 'San Antonio Spurs' },
  { year: 2015, player: 'Andre Iguodala', team: 'Golden State Warriors' },
  { year: 2016, player: 'LeBron James', team: 'Cleveland Cavaliers' },
  { year: 2017, player: 'Kevin Durant', team: 'Golden State Warriors' },
  { year: 2018, player: 'Kevin Durant', team: 'Golden State Warriors' },
  { year: 2019, player: 'Kawhi Leonard', team: 'Toronto Raptors' },
  { year: 2020, player: 'LeBron James', team: 'Los Angeles Lakers' },
  { year: 2021, player: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks' },
  { year: 2022, player: 'Stephen Curry', team: 'Golden State Warriors' },
  { year: 2023, player: 'Nikola Jokić', team: 'Denver Nuggets' },
  { year: 2024, player: 'Jaylen Brown', team: 'Boston Celtics' },
  { year: 2025, player: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder' },
  { year: 2026, player: 'Jalen Brunson', team: 'New York Knicks' },
];

/** Every League MVP winner, 1956 to 2026. */
export const BASKETBALL_LEAGUE_MVP_SEEDS: AwardWinnerSeed[] = [
  { year: 1956, player: 'Bob Pettit', team: 'St. Louis Hawks' },
  { year: 1957, player: 'Bob Cousy', team: 'Boston Celtics' },
  { year: 1958, player: 'Bill Russell', team: 'Boston Celtics' },
  { year: 1959, player: 'Bob Pettit', team: 'St. Louis Hawks' },
  { year: 1960, player: 'Wilt Chamberlain', team: 'Philadelphia Warriors' },
  { year: 1961, player: 'Bill Russell', team: 'Boston Celtics' },
  { year: 1962, player: 'Bill Russell', team: 'Boston Celtics' },
  { year: 1963, player: 'Bill Russell', team: 'Boston Celtics' },
  { year: 1964, player: 'Oscar Robertson', team: 'Cincinnati Royals' },
  { year: 1965, player: 'Bill Russell', team: 'Boston Celtics' },
  { year: 1966, player: 'Wilt Chamberlain', team: 'Philadelphia 76ers' },
  { year: 1967, player: 'Wilt Chamberlain', team: 'Philadelphia 76ers' },
  { year: 1968, player: 'Wilt Chamberlain', team: 'Philadelphia 76ers' },
  { year: 1969, player: 'Wes Unseld', team: 'Baltimore Bullets' },
  { year: 1970, player: 'Willis Reed', team: 'New York Knicks' },
  { year: 1971, player: 'Lew Alcindor', team: 'Milwaukee Bucks' },
  { year: 1972, player: 'Kareem Abdul-Jabbar', team: 'Milwaukee Bucks' },
  { year: 1973, player: 'Dave Cowens', team: 'Boston Celtics' },
  { year: 1974, player: 'Kareem Abdul-Jabbar', team: 'Milwaukee Bucks' },
  { year: 1975, player: 'Bob McAdoo', team: 'Buffalo Braves' },
  { year: 1976, player: 'Kareem Abdul-Jabbar', team: 'Los Angeles Lakers' },
  { year: 1977, player: 'Kareem Abdul-Jabbar', team: 'Los Angeles Lakers' },
  { year: 1978, player: 'Bill Walton', team: 'Portland Trail Blazers' },
  { year: 1979, player: 'Moses Malone', team: 'Houston Rockets' },
  { year: 1980, player: 'Kareem Abdul-Jabbar', team: 'Los Angeles Lakers' },
  { year: 1981, player: 'Julius Erving', team: 'Philadelphia 76ers' },
  { year: 1982, player: 'Moses Malone', team: 'Houston Rockets' },
  { year: 1983, player: 'Moses Malone', team: 'Philadelphia 76ers' },
  { year: 1984, player: 'Larry Bird', team: 'Boston Celtics' },
  { year: 1985, player: 'Larry Bird', team: 'Boston Celtics' },
  { year: 1986, player: 'Larry Bird', team: 'Boston Celtics' },
  { year: 1987, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1988, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1989, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1990, player: 'Magic Johnson', team: 'Los Angeles Lakers' },
  { year: 1991, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1992, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1993, player: 'Charles Barkley', team: 'Phoenix Suns' },
  { year: 1994, player: 'Hakeem Olajuwon', team: 'Houston Rockets' },
  { year: 1995, player: 'David Robinson', team: 'San Antonio Spurs' },
  { year: 1996, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1997, player: 'Karl Malone', team: 'Utah Jazz' },
  { year: 1998, player: 'Michael Jordan', team: 'Chicago Bulls' },
  { year: 1999, player: 'Karl Malone', team: 'Utah Jazz' },
  { year: 2000, player: "Shaquille O'Neal", team: 'Los Angeles Lakers' },
  { year: 2001, player: 'Allen Iverson', team: 'Philadelphia 76ers' },
  { year: 2002, player: 'Tim Duncan', team: 'San Antonio Spurs' },
  { year: 2003, player: 'Tim Duncan', team: 'San Antonio Spurs' },
  { year: 2004, player: 'Kevin Garnett', team: 'Minnesota Timberwolves' },
  { year: 2005, player: 'Steve Nash', team: 'Phoenix Suns' },
  { year: 2006, player: 'Steve Nash', team: 'Phoenix Suns' },
  { year: 2007, player: 'Dirk Nowitzki', team: 'Dallas Mavericks' },
  { year: 2008, player: 'Kobe Bryant', team: 'Los Angeles Lakers' },
  { year: 2009, player: 'LeBron James', team: 'Cleveland Cavaliers' },
  { year: 2010, player: 'LeBron James', team: 'Cleveland Cavaliers' },
  { year: 2011, player: 'Derrick Rose', team: 'Chicago Bulls' },
  { year: 2012, player: 'LeBron James', team: 'Miami Heat' },
  { year: 2013, player: 'LeBron James', team: 'Miami Heat' },
  { year: 2014, player: 'Kevin Durant', team: 'Oklahoma City Thunder' },
  { year: 2015, player: 'Stephen Curry', team: 'Golden State Warriors' },
  { year: 2016, player: 'Stephen Curry', team: 'Golden State Warriors' },
  { year: 2017, player: 'Russell Westbrook', team: 'Oklahoma City Thunder' },
  { year: 2018, player: 'James Harden', team: 'Houston Rockets' },
  { year: 2019, player: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks' },
  { year: 2020, player: 'Giannis Antetokounmpo', team: 'Milwaukee Bucks' },
  { year: 2021, player: 'Nikola Jokić', team: 'Denver Nuggets' },
  { year: 2022, player: 'Nikola Jokić', team: 'Denver Nuggets' },
  { year: 2023, player: 'Joel Embiid', team: 'Philadelphia 76ers' },
  { year: 2024, player: 'Nikola Jokić', team: 'Denver Nuggets' },
  { year: 2025, player: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder' },
  { year: 2026, player: 'Shai Gilgeous-Alexander', team: 'Oklahoma City Thunder' },
];
