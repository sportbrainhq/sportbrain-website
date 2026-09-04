import type { CompetitionRankingSeed } from './competition-rankings';

/**
 * Roll of honour for the Super Bowl.
 *
 * The Super Bowl competition page carried no winners list at all until this
 * file, because the competition row itself did not exist before this pass
 * (see `american-football-competitions.ts`). One table, one row per game,
 * following `golf-competition-rankings.ts`'s own precedent of extracting a
 * roll of honour from Wikipedia by script rather than recalling it: a list of
 * fifty-nine championship games typed from memory is exactly the kind of
 * content that is wrong in ways nobody would notice.
 *
 * ## Provenance
 *
 * Extracted from `https://en.wikipedia.org/wiki/List_of_Super_Bowl_champions`
 * at the `asOf` date, by parsing the article's own "Super Bowl championships"
 * wikitable (winner, score, loser, per game) rather than typing the table by
 * hand. `value` is the winning season's calendar year the game was played in
 * (Super Bowl I was played in January 1967 for the 1966 season, and the
 * table uses the January/February date, not the season), and `detail` carries
 * the final score and the losing team, which is how this competition reports
 * a result: there is no par or handicap to compare against, only who won and
 * by how much.
 */
export const AMERICAN_FOOTBALL_COMPETITION_RANKINGS: Record<string, CompetitionRankingSeed[]> = {
  'super-bowl': [
    {
      kind: 'champions_super_bowl',
      label: 'Champions',
      source: 'https://en.wikipedia.org/wiki/List_of_Super_Bowl_champions',
      asOf: '2026-09-04',
      entries: [
        {
          rank: 1,
          name: 'Seattle Seahawks',
          value: 2026,
          detail: 'Super Bowl LX, beat New England Patriots 29–13',
        },
        {
          rank: 2,
          name: 'Philadelphia Eagles',
          value: 2025,
          detail: 'Super Bowl LIX, beat Kansas City Chiefs 40–22',
        },
        {
          rank: 3,
          name: 'Kansas City Chiefs',
          value: 2024,
          detail: 'Super Bowl LVIII, beat San Francisco 49ers 25–22',
        },
        {
          rank: 4,
          name: 'Kansas City Chiefs',
          value: 2023,
          detail: 'Super Bowl LVII, beat Philadelphia Eagles 38–35',
        },
        {
          rank: 5,
          name: 'Los Angeles Rams',
          value: 2022,
          detail: 'Super Bowl LVI, beat Cincinnati Bengals 23–20',
        },
        {
          rank: 6,
          name: 'Tampa Bay Buccaneers',
          value: 2021,
          detail: 'Super Bowl LV, beat Kansas City Chiefs 31–9',
        },
        {
          rank: 7,
          name: 'Kansas City Chiefs',
          value: 2020,
          detail: 'Super Bowl LIV, beat San Francisco 49ers 31–20',
        },
        {
          rank: 8,
          name: 'New England Patriots',
          value: 2019,
          detail: 'Super Bowl LIII, beat Los Angeles Rams 13–3',
        },
        {
          rank: 9,
          name: 'Philadelphia Eagles',
          value: 2018,
          detail: 'Super Bowl LII, beat New England Patriots 41–33',
        },
        {
          rank: 10,
          name: 'New England Patriots',
          value: 2017,
          detail: 'Super Bowl LI, beat Atlanta Falcons 34–28',
        },
        {
          rank: 11,
          name: 'New England Patriots',
          value: 2015,
          detail: 'Super Bowl XLIX, beat Seattle Seahawks 28–24',
        },
        {
          rank: 12,
          name: 'Seattle Seahawks',
          value: 2014,
          detail: 'Super Bowl XLVIII, beat Denver Broncos 43–8',
        },
        {
          rank: 13,
          name: 'Baltimore Ravens',
          value: 2013,
          detail: 'Super Bowl XLVII, beat San Francisco 49ers 34–31',
        },
        {
          rank: 14,
          name: 'New York Giants',
          value: 2012,
          detail: 'Super Bowl XLVI, beat New England Patriots 21–17',
        },
        {
          rank: 15,
          name: 'Green Bay Packers',
          value: 2011,
          detail: 'Super Bowl XLV, beat Pittsburgh Steelers 31–25',
        },
        {
          rank: 16,
          name: 'New Orleans Saints',
          value: 2010,
          detail: 'Super Bowl XLIV, beat Indianapolis Colts 31–17',
        },
        {
          rank: 17,
          name: 'Pittsburgh Steelers',
          value: 2009,
          detail: 'Super Bowl XLIII, beat Arizona Cardinals 27–23',
        },
        {
          rank: 18,
          name: 'New York Giants',
          value: 2008,
          detail: 'Super Bowl XLII, beat New England Patriots 17–14',
        },
        {
          rank: 19,
          name: 'Indianapolis Colts',
          value: 2007,
          detail: 'Super Bowl XLI, beat Chicago Bears 29–17',
        },
        {
          rank: 20,
          name: 'Pittsburgh Steelers',
          value: 2006,
          detail: 'Super Bowl XL, beat Seattle Seahawks 21–10',
        },
        {
          rank: 21,
          name: 'New England Patriots',
          value: 2005,
          detail: 'Super Bowl XXXIX, beat Philadelphia Eagles 24–21',
        },
        {
          rank: 22,
          name: 'New England Patriots',
          value: 2004,
          detail: 'Super Bowl XXXVIII, beat Carolina Panthers 32–29',
        },
        {
          rank: 23,
          name: 'Tampa Bay Buccaneers',
          value: 2003,
          detail: 'Super Bowl XXXVII, beat Oakland Raiders 48–21',
        },
        {
          rank: 24,
          name: 'New England Patriots',
          value: 2002,
          detail: 'Super Bowl XXXVI, beat St. Louis Rams 20–17',
        },
        {
          rank: 25,
          name: 'Baltimore Ravens',
          value: 2001,
          detail: 'Super Bowl XXXV, beat New York Giants 34–7',
        },
        {
          rank: 26,
          name: 'St. Louis Rams',
          value: 2000,
          detail: 'Super Bowl XXXIV, beat Tennessee Titans 23–16',
        },
        {
          rank: 27,
          name: 'Denver Broncos',
          value: 1999,
          detail: 'Super Bowl XXXIII, beat Atlanta Falcons 34–19',
        },
        {
          rank: 28,
          name: 'Denver Broncos',
          value: 1998,
          detail: 'Super Bowl XXXII, beat Green Bay Packers 31–24',
        },
        {
          rank: 29,
          name: 'Green Bay Packers',
          value: 1997,
          detail: 'Super Bowl XXXI, beat New England Patriots 35–21',
        },
        {
          rank: 30,
          name: 'Dallas Cowboys',
          value: 1996,
          detail: 'Super Bowl XXX, beat Pittsburgh Steelers 27–17',
        },
        {
          rank: 31,
          name: 'San Francisco 49ers',
          value: 1995,
          detail: 'Super Bowl XXIX, beat San Diego Chargers 49–26',
        },
        {
          rank: 32,
          name: 'Dallas Cowboys',
          value: 1994,
          detail: 'Super Bowl XXVIII, beat Buffalo Bills 30–13',
        },
        {
          rank: 33,
          name: 'Dallas Cowboys',
          value: 1993,
          detail: 'Super Bowl XXVII, beat Buffalo Bills 52–17',
        },
        {
          rank: 34,
          name: 'Washington Redskins',
          value: 1992,
          detail: 'Super Bowl XXVI, beat Buffalo Bills 37–24',
        },
        {
          rank: 35,
          name: 'New York Giants',
          value: 1991,
          detail: 'Super Bowl XXV, beat Buffalo Bills 20–19',
        },
        {
          rank: 36,
          name: 'San Francisco 49ers',
          value: 1990,
          detail: 'Super Bowl XXIV, beat Denver Broncos 55–10',
        },
        {
          rank: 37,
          name: 'San Francisco 49ers',
          value: 1989,
          detail: 'Super Bowl XXIII, beat Cincinnati Bengals 20–16',
        },
        {
          rank: 38,
          name: 'Washington Redskins',
          value: 1988,
          detail: 'Super Bowl XXII, beat Denver Broncos 42–10',
        },
        {
          rank: 39,
          name: 'New York Giants',
          value: 1987,
          detail: 'Super Bowl XXI, beat Denver Broncos 39–20',
        },
        {
          rank: 40,
          name: 'Chicago Bears',
          value: 1986,
          detail: 'Super Bowl XX, beat New England Patriots 46–10',
        },
        {
          rank: 41,
          name: 'San Francisco 49ers',
          value: 1985,
          detail: 'Super Bowl XIX, beat Miami Dolphins 38–16',
        },
        {
          rank: 42,
          name: 'Los Angeles Raiders',
          value: 1984,
          detail: 'Super Bowl XVIII, beat Washington Redskins 38–9',
        },
        {
          rank: 43,
          name: 'Washington Redskins',
          value: 1983,
          detail: 'Super Bowl XVII, beat Miami Dolphins 27–17',
        },
        {
          rank: 44,
          name: 'San Francisco 49ers',
          value: 1982,
          detail: 'Super Bowl XVI, beat Cincinnati Bengals 26–21',
        },
        {
          rank: 45,
          name: 'Oakland Raiders',
          value: 1981,
          detail: 'Super Bowl XV, beat Philadelphia Eagles 27–10',
        },
        {
          rank: 46,
          name: 'Pittsburgh Steelers',
          value: 1980,
          detail: 'Super Bowl XIV, beat Los Angeles Rams 31–19',
        },
        {
          rank: 47,
          name: 'Pittsburgh Steelers',
          value: 1979,
          detail: 'Super Bowl XIII, beat Dallas Cowboys 35–31',
        },
        {
          rank: 48,
          name: 'Dallas Cowboys',
          value: 1978,
          detail: 'Super Bowl XII, beat Denver Broncos 27–10',
        },
        {
          rank: 49,
          name: 'Oakland Raiders',
          value: 1977,
          detail: 'Super Bowl XI, beat Minnesota Vikings 32–14',
        },
        {
          rank: 50,
          name: 'Pittsburgh Steelers',
          value: 1976,
          detail: 'Super Bowl X, beat Dallas Cowboys 21–17',
        },
        {
          rank: 51,
          name: 'Pittsburgh Steelers',
          value: 1975,
          detail: 'Super Bowl IX, beat Minnesota Vikings 16–6',
        },
        {
          rank: 52,
          name: 'Miami Dolphins',
          value: 1974,
          detail: 'Super Bowl VIII, beat Minnesota Vikings 24–7',
        },
        {
          rank: 53,
          name: 'Miami Dolphins',
          value: 1973,
          detail: 'Super Bowl VII, beat Washington Redskins 14–7',
        },
        {
          rank: 54,
          name: 'Dallas Cowboys',
          value: 1972,
          detail: 'Super Bowl VI, beat Miami Dolphins 24–3',
        },
        {
          rank: 55,
          name: 'Baltimore Colts',
          value: 1971,
          detail: 'Super Bowl V, beat Dallas Cowboys 16–13',
        },
        {
          rank: 56,
          name: 'Kansas City Chiefs',
          value: 1970,
          detail: 'Super Bowl IV, beat Minnesota Vikings 23–7',
        },
        {
          rank: 57,
          name: 'New York Jets',
          value: 1969,
          detail: 'Super Bowl III, beat Baltimore Colts 16–7',
        },
        {
          rank: 58,
          name: 'Green Bay Packers',
          value: 1968,
          detail: 'Super Bowl II, beat Oakland Raiders 33–14',
        },
        {
          rank: 59,
          name: 'Green Bay Packers',
          value: 1967,
          detail: 'Super Bowl I, beat Kansas City Chiefs 35–10',
        },
      ],
    },
  ],
};
