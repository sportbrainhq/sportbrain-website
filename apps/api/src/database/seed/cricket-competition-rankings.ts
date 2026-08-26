import type { CompetitionRankingSeed } from './competition-rankings';

/**
 * Curated leaderboards for the ICC ODI Cricket World Cup.
 *
 * The competition detail page renders whatever `entity_ranking` rows a
 * competition has, and cricket had none: the World Cup page showed a header, a
 * four-fact strip and the "we do not have the honours or records for this
 * competition yet" empty state. Ingestion cannot fill it, because it reads a
 * roll of honour from Wikidata's edition items and cricket's are not modelled
 * with the winner statements football's carry.
 *
 * Follows the rules `competition-rankings.ts` sets out for the football tables,
 * which are worth restating because they are what makes a hand-written table
 * trustworthy:
 *
 *   1. **One published source per table, named in `source`.** A figure with no
 *      attribution cannot be told apart from a guess once it is stored.
 *   2. **Only completed events.** The 2027 tournament is scheduled and absent.
 *   3. **Omit rather than approximate.** Where a source's table stops at five
 *      rows, this one stops at five rows.
 *
 * Every figure below was read from the article's own wikitext rather than from
 * a rendered summary, because the summaries truncate the tables and a partial
 * table read as complete is the failure mode worth avoiding here.
 *
 * ## On the two "most catches" tables
 *
 * Cricket records catches twice, and conflating them would be wrong. A
 * **wicket-keeper's** catches are taken from behind the stumps as a specialist
 * and run to 45; a **fielder's** are taken anywhere else and the record is 28.
 * Adam Gilchrist leads the first and Ricky Ponting the second. Only the
 * fielding table is published here, under "Most catches", because that is the
 * one a reader means by the phrase; the wicket-keeping figures are carried by
 * the dismissals table instead, which is how cricket itself reports them.
 */

const RECORDS_SOURCE = 'Wikipedia, "Cricket World Cup records", citing ESPNcricinfo';
const AS_OF = '19 November 2023';

/**
 * A tournament, as `[year, winner, runner-up, result]`.
 *
 * Winners carry the team's full stored name rather than the short one a table
 * would normally print. The profile assembler links a row by matching its name
 * against the catalogue, so "Australia" resolves to nothing while "Australia
 * national cricket team" becomes a link. The runner-up stays short, since it
 * sits inside a sentence rather than being the row's subject.
 */
type Edition = [year: number, winner: string, runnerUp: string, result: string];

const EDITIONS: Edition[] = [
  [1975, 'West Indies cricket team', 'Australia', 'Won by 17 runs'],
  [1979, 'West Indies cricket team', 'England', 'Won by 92 runs'],
  [1983, 'India national cricket team', 'West Indies', 'Won by 43 runs'],
  [1987, 'Australia national cricket team', 'England', 'Won by 7 runs'],
  [1992, 'Pakistan national cricket team', 'England', 'Won by 22 runs'],
  [1996, 'Sri Lanka national cricket team', 'Australia', 'Won by 7 wickets'],
  [1999, 'Australia national cricket team', 'Pakistan', 'Won by 8 wickets'],
  [2003, 'Australia national cricket team', 'India', 'Won by 125 runs'],
  [2007, 'Australia national cricket team', 'Sri Lanka', 'Won by 53 runs (D/L)'],
  [2011, 'India national cricket team', 'Sri Lanka', 'Won by 6 wickets'],
  [2015, 'Australia national cricket team', 'New Zealand', 'Won by 7 wickets'],
  [2019, 'England cricket team', 'New Zealand', 'Won on boundary count after a tied Super Over'],
  [2023, 'Australia national cricket team', 'India', 'Won by 6 wickets'],
];

/** A career record, as `[player, figure, team, detail]`. */
type Career = [name: string, value: number, team: string, detail: string];

const MOST_RUNS: Career[] = [
  ['Sachin Tendulkar', 2278, 'India', '45 matches, 1992–2011'],
  ['Virat Kohli', 1795, 'India', '37 matches, 2011–2023'],
  ['Ricky Ponting', 1743, 'Australia', '46 matches, 1996–2011'],
  ['Rohit Sharma', 1575, 'India', '28 matches, 2015–2023'],
  ['Kumar Sangakkara', 1532, 'Sri Lanka', '37 matches, 2003–2015'],
];

const MOST_WICKETS: Career[] = [
  ['Glenn McGrath', 71, 'Australia', '39 matches, 1996–2007'],
  ['Muttiah Muralitharan', 68, 'Sri Lanka', '40 matches, 1996–2011'],
  ['Mitchell Starc', 65, 'Australia', '28 matches, 2015–2023'],
  ['Lasith Malinga', 56, 'Sri Lanka', '29 matches, 2007–2019'],
  ['Mohammed Shami', 55, 'India', '18 matches, 2015–2023'],
  ['Wasim Akram', 55, 'Pakistan', '38 matches, 1987–2003'],
];

const MOST_MATCHES: Career[] = [
  ['Ricky Ponting', 46, 'Australia', '1996–2011'],
  ['Sachin Tendulkar', 45, 'India', '1992–2011'],
  ['Mahela Jayawardene', 40, 'Sri Lanka', '1999–2015'],
  ['Muttiah Muralitharan', 40, 'Sri Lanka', '1996–2011'],
  ['Glenn McGrath', 39, 'Australia', '1996–2007'],
];

/** Catches by a fielder rather than a wicket-keeper. See the note above. */
const MOST_CATCHES: Career[] = [
  ['Ricky Ponting', 28, 'Australia', '46 matches, 1996–2011'],
  ['Joe Root', 25, 'England', '26 matches, 2015–2023'],
  ['Virat Kohli', 20, 'India', '37 matches, 2011–2023'],
  ['Sanath Jayasuriya', 18, 'Sri Lanka', '38 matches, 1992–2007'],
  ['David Warner', 17, 'Australia', '29 matches, 2015–2023'],
  ['Chris Gayle', 17, 'West Indies', '35 matches, 2003–2019'],
];

const MOST_DISMISSALS: Career[] = [
  ['Kumar Sangakkara', 54, 'Sri Lanka', '37 matches, 2003–2015'],
  ['Adam Gilchrist', 52, 'Australia', '31 matches, 1999–2007'],
  ['Mahendra Singh Dhoni', 42, 'India', '29 matches, 2007–2019'],
  ['Quinton de Kock', 39, 'South Africa', '27 matches, 2015–2023'],
  ['Jos Buttler', 33, 'England', '26 matches, 2015–2023'],
  ['Mushfiqur Rahim', 33, 'Bangladesh', '38 matches, 2007–2023'],
];

/** Player of the tournament, as `[year, player, country]`. First awarded 1992. */
const PLAYER_OF_THE_TOURNAMENT: [year: number, player: string, country: string][] = [
  [1992, 'Martin Crowe', 'New Zealand'],
  [1996, 'Sanath Jayasuriya', 'Sri Lanka'],
  [1999, 'Lance Klusener', 'South Africa'],
  [2003, 'Sachin Tendulkar', 'India'],
  [2007, 'Glenn McGrath', 'Australia'],
  [2011, 'Yuvraj Singh', 'India'],
  [2015, 'Mitchell Starc', 'Australia'],
  [2019, 'Kane Williamson', 'New Zealand'],
  [2023, 'Virat Kohli', 'India'],
];

/**
 * Ranks a career table, sharing a rank where figures tie.
 *
 * Ties are real in these tables and cricket reports them as "=5", so two
 * players on 55 wickets both rank fifth rather than fifth and sixth.
 */
function rankCareers(rows: Career[]): CompetitionRankingSeed['entries'] {
  return rows.map(([name, value, team, detail]) => ({
    // The first row holding this figure sets the rank, so a tie shares one.
    rank: rows.findIndex((row) => row[1] === value) + 1,
    name,
    value,
    detail: `${team} · ${detail}`,
  }));
}

/**
 * A tournament roll of honour, as `[year, winner, runner-up, result]`.
 *
 * The winner carries the team's full stored name so the profile assembler can
 * resolve it to a link; the runner-up stays short because it reads inside a
 * sentence rather than being the row's subject.
 */
type Honour = [
  year: number | string,
  winner: string,
  runnerUp: string | null,
  result: string | null,
];

/** An award, as `[year, winner, team or country]`. */
type Award = [year: number | string, winner: string, detail: string];

/**
 * Builds a roll of honour, most recent first.
 *
 * Reverse-chronological because a reader scanning a tournament's history wants
 * the current holder at the top, and the same reason the World Cup table below
 * reads that way.
 */
function honours(
  rows: Honour[],
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
    entries: [...rows].reverse().map(([year, winner, runnerUp, result], index) => ({
      rank: index + 1,
      name: winner,
      // A cycle spanning two years has no single number, so the year is carried
      // in `detail` and the value left null rather than coerced.
      value: typeof year === 'number' ? year : null,
      detail: [typeof year === 'string' ? year : null, runnerUp ? `beat ${runnerUp}` : null, result]
        .filter(Boolean)
        .join(' · '),
    })),
  };
}

/** Builds an award table, most recent first. */
function awards(
  kind: 'award:player-of-the-tournament' | 'award:player-of-the-season',
  label: string,
  rows: Award[],
  source: string,
  asOf: string,
  caveat?: string,
): CompetitionRankingSeed {
  return {
    kind,
    label,
    source,
    asOf,
    caveat,
    entries: [...rows].reverse().map(([year, winner, detail], index) => ({
      rank: index + 1,
      name: winner,
      value: typeof year === 'number' ? year : null,
      detail: [typeof year === 'string' ? year : null, detail].filter(Boolean).join(' · '),
    })),
  };
}

/** Builds a single-figure career table from `[player, figure, team, detail]` rows. */
function careerTable(
  kind: CompetitionRankingSeed['kind'],
  label: string,
  rows: Career[],
  source: string,
  asOf: string,
  caveat?: string,
): CompetitionRankingSeed {
  return { kind, label, source, asOf, caveat, entries: rankCareers(rows) };
}

/**
 * Builds an all-time title count, most titles first.
 *
 * For the competitions decided over a very long history. The County
 * Championship has been played since 1890 and the Ranji Trophy since 1934, so a
 * season-by-season roll of honour would be well over a hundred rows of two or
 * three recurring names. The title count answers the question a reader actually
 * has of such a competition, which is who has won it most.
 *
 * Team names are the full stored forms so the assembler can resolve them to
 * links, as with the tournament winners above.
 */
function titleCounts(
  rows: [team: string, titles: number, note: string | null][],
  source: string,
  asOf: string,
  caveat?: string,
): CompetitionRankingSeed {
  return {
    kind: 'roll_of_honour',
    label: 'Titles won',
    source,
    asOf,
    caveat,
    entries: rows.map(([team, titles, note], index) => ({
      // Ranked by position rather than by shared figure: a title count is a
      // league table of its own, and two counties on eight titles are
      // conventionally listed in a fixed order rather than tied.
      rank: index + 1,
      name: team,
      value: titles,
      detail: [titles === 1 ? '1 title' : `${titles} titles`, note].filter(Boolean).join(' · '),
    })),
  };
}

const WIKI = (page: string) => `Wikipedia, "${page}"`;

/**
 * ESPNcricinfo's Ashes records pages.
 *
 * Cited directly because Wikipedia has no Ashes records article, so the two
 * tables here would otherwise show the record holder alone. ESPNcricinfo is the
 * source Wikipedia's own cricket record tables cite, and these are its
 * published trophy-records pages rather than anything derived or scraped.
 */
const ESPN_ASHES_BATTING = 'ESPNcricinfo, "Most runs in The Ashes"';
const ESPN_ASHES_BOWLING = 'ESPNcricinfo, "Most wickets For The Ashes"';

/**
 * ICC World Test Championship records.
 *
 * `WTC_RECORDS` is the dedicated records article, not the competition article.
 * The competition article's own records section is a summary that names one
 * holder per mark, which cannot make a table; the records article carries the
 * ranked lists below.
 *
 * Note what is and is not a career figure. Wikipedia publishes ranked career
 * tables only for matches played, centuries and matches as captain. For runs,
 * wickets, catches and keeping dismissals it ranks *single cycles*, and the
 * career leader is given as a lone figure. Those tables are therefore labelled
 * "in a cycle" and the career leader is stated in the caveat, so a reader is
 * never shown a cycle total under a career heading.
 */
const WTC_RECORDS = WIKI('List of World Test Championship records');

const WTC_MOST_MATCHES: Career[] = [
  ['Joe Root', 77, 'England', '2019–2026'],
  ['Ben Stokes', 64, 'England', '2019–2026'],
  ['Steve Smith', 60, 'Australia', '2019–2026'],
  ['Marnus Labuschagne', 59, 'Australia', '2019–2026'],
  ['Travis Head', 58, 'Australia', '2019–2026'],
];

const WTC_MOST_RUNS_IN_A_CYCLE: Career[] = [
  ['Joe Root', 1968, 'England', '22 matches, 2023–2025'],
  ['Joe Root', 1915, 'England', '22 matches, 2021–2023'],
  ['Yashasvi Jaiswal', 1798, 'India', '19 matches, 2023–2025'],
  ['Marnus Labuschagne', 1675, 'Australia', '13 matches, 2019–2021'],
  ['Joe Root', 1660, 'England', '20 matches, 2019–2021'],
];

const WTC_MOST_WICKETS_IN_A_CYCLE: Career[] = [
  ['Nathan Lyon', 88, 'Australia', '20 matches, 2021–2023'],
  ['Pat Cummins', 80, 'Australia', '18 matches, 2023–2025'],
  ['Jasprit Bumrah', 77, 'India', '15 matches, 2023–2025'],
  ['Mitchell Starc', 77, 'Australia', '19 matches, 2023–2025'],
  ['Ravichandran Ashwin', 71, 'India', '14 matches, 2019–2021'],
];

const WTC_MOST_CATCHES_IN_A_CYCLE: Career[] = [
  ['Steve Smith', 43, 'Australia', '20 matches, 2023–2025'],
  ['Joe Root', 35, 'England', '22 matches, 2023–2025'],
  ['Steve Smith', 34, 'Australia', '20 matches, 2021–2023'],
  ['Joe Root', 34, 'England', '20 matches, 2019–2021'],
  ['Joe Root', 31, 'England', '22 matches, 2021–2023'],
];

const WTC_MOST_DISMISSALS_IN_A_CYCLE: Career[] = [
  ['Alex Carey', 98, 'Australia', '20 matches, 82 catches and 16 stumpings, 2023–2025'],
  ['Alex Carey', 68, 'Australia', '20 matches, 66 catches and 2 stumpings, 2021–2023'],
  ['Tim Paine', 65, 'Australia', '14 matches, 63 catches and 2 stumpings, 2019–2021'],
  ['Joshua Da Silva', 57, 'West Indies', '13 matches, 54 catches and 3 stumpings, 2021–2023'],
  ['Tom Blundell', 54, 'New Zealand', '13 matches, 47 catches and 7 stumpings, 2021–2023'],
];

/**
 * ICC Champions Trophy per-edition records.
 *
 * Taken from the competition article's "By tournament" table, which lists the
 * player of the tournament, the leading run-scorer and the leading wicket-taker
 * for every edition. 2000 and 2002 made no player-of-the-tournament award, so
 * they are omitted from that table rather than carried as empty rows.
 */
const CT_PLAYER_OF_THE_TOURNAMENT: Award[] = [
  [1998, 'Jacques Kallis', 'South Africa'],
  [2004, 'Ramnaresh Sarwan', 'West Indies'],
  [2006, 'Chris Gayle', 'West Indies'],
  [2009, 'Ricky Ponting', 'Australia'],
  [2013, 'Shikhar Dhawan', 'India'],
  [2017, 'Hasan Ali', 'Pakistan'],
  [2025, 'Rachin Ravindra', 'New Zealand'],
];

const CT_MOST_RUNS_IN_A_TOURNAMENT: Career[] = [
  ['Chris Gayle', 474, 'West Indies', '2006'],
  ['Shikhar Dhawan', 363, 'India', '2013'],
  ['Sourav Ganguly', 348, 'India', '2000'],
  ['Shikhar Dhawan', 338, 'India', '2017'],
  ['Ricky Ponting', 288, 'Australia', '2009'],
];

const CT_MOST_WICKETS_IN_A_TOURNAMENT: Career[] = [
  ['Jerome Taylor', 13, 'West Indies', '2006'],
  ['Hasan Ali', 13, 'Pakistan', '2017'],
  ['Ravindra Jadeja', 12, 'India', '2013'],
  ['Wayne Parnell', 11, 'South Africa', '2009'],
  ['Muttiah Muralitharan', 10, 'Sri Lanka', '2002'],
  ['Matt Henry', 10, 'New Zealand', '2025'],
];

export const CRICKET_COMPETITION_RANKING_SEEDS: Record<string, CompetitionRankingSeed[]> = {
  'cricket-world-cup': [
    {
      kind: 'roll_of_honour',
      label: 'Winners',
      source: 'Wikipedia, "Cricket World Cup"',
      asOf: '2023',
      entries: [...EDITIONS].reverse().map(([year, winner, runnerUp, result], index) => ({
        rank: index + 1,
        name: winner,
        value: year,
        detail: `beat ${runnerUp} · ${result}`,
      })),
    },
    {
      kind: 'most_appearances',
      label: 'Most matches',
      source: RECORDS_SOURCE,
      asOf: AS_OF,
      entries: rankCareers(MOST_MATCHES),
    },
    {
      kind: 'award:player-of-the-tournament',
      label: 'Player of the tournament',
      source: 'Wikipedia, "Cricket World Cup awards"',
      asOf: '2023',
      caveat: 'First awarded in 1992, so the earlier tournaments have no winner.',
      entries: [...PLAYER_OF_THE_TOURNAMENT].reverse().map(([year, player, country], index) => ({
        rank: index + 1,
        name: player,
        value: year,
        detail: country,
      })),
    },
    {
      kind: 'top_scorers',
      label: 'Most runs',
      source: RECORDS_SOURCE,
      asOf: AS_OF,
      entries: rankCareers(MOST_RUNS),
    },
    {
      kind: 'most_wickets',
      label: 'Most wickets',
      source: RECORDS_SOURCE,
      asOf: AS_OF,
      entries: rankCareers(MOST_WICKETS),
    },
    {
      kind: 'most_catches',
      label: 'Most catches',
      source: RECORDS_SOURCE,
      asOf: AS_OF,
      caveat:
        'Catches taken as a fielder. A wicket-keeper’s catches are counted separately and appear in the dismissals table.',
      entries: rankCareers(MOST_CATCHES),
    },
    {
      kind: 'most_wicketkeeper_dismissals',
      label: 'Most dismissals (wicket-keeper)',
      source: RECORDS_SOURCE,
      asOf: AS_OF,
      caveat: 'Catches and stumpings combined, taken as a designated wicket-keeper.',
      entries: rankCareers(MOST_DISMISSALS),
    },
  ],
  'icc-mens-t20-world-cup': [
    honours(
      [
        [2007, 'India national cricket team', 'Pakistan', 'Won by 5 runs'],
        [2009, 'Pakistan national cricket team', 'Sri Lanka', 'Won by 8 wickets'],
        [2010, 'England cricket team', 'Australia', 'Won by 7 wickets'],
        [2012, 'West Indies cricket team', 'Sri Lanka', 'Won by 36 runs'],
        [2014, 'Sri Lanka national cricket team', 'India', 'Won by 6 wickets'],
        [2016, 'West Indies cricket team', 'England', 'Won by 4 wickets'],
        [2021, 'Australia national cricket team', 'New Zealand', 'Won by 8 wickets'],
        [2022, 'England cricket team', 'Pakistan', 'Won by 5 wickets'],
        [2024, 'India national cricket team', 'South Africa', 'Won by 7 runs'],
        [2026, 'India national cricket team', 'New Zealand', 'Won by 96 runs'],
      ],
      WIKI("ICC Men's T20 World Cup"),
      '2026',
    ),
    // Career tables come from the dedicated records article rather than the
    // main one, which publishes only the record holder. Each carries the date
    // its own table states rather than one date for the page: the article's
    // tables are updated independently and several still read 2024.
    careerTable(
      'most_appearances',
      'Most matches',
      [
        ['Rohit Sharma', 47, 'India', '2007–2024'],
        ['Jos Buttler', 43, 'England', '2012–2026'],
        ['Shakib Al Hasan', 43, 'Bangladesh', '2007–2024'],
        ['David Warner', 41, 'Australia', '2009–2024'],
        ['Adil Rashid', 38, 'England', '2009–2026'],
      ],
      WIKI("Men's T20 World Cup records"),
      '5 March 2026',
    ),
    careerTable(
      'top_scorers',
      'Most runs',
      [
        ['Virat Kohli', 1292, 'India', '35 matches, 2012–2024'],
        ['Rohit Sharma', 1220, 'India', '47 matches, 2007–2024'],
        ['Jos Buttler', 1100, 'England', '43 matches, 2012–2026'],
        ['Mahela Jayawardene', 1016, 'Sri Lanka', '31 matches, 2007–2014'],
        ['David Warner', 984, 'Australia', '41 matches, 2009–2024'],
      ],
      WIKI("Men's T20 World Cup records"),
      '5 March 2026',
    ),
    careerTable(
      'most_wickets',
      'Most wickets',
      [
        ['Shakib Al Hasan', 50, 'Bangladesh', '41 innings, 2007–2024'],
        ['Adam Zampa', 44, 'Australia', '25 innings, 2016–2026'],
        ['Adil Rashid', 44, 'England', '38 innings, 2009–2026'],
        ['Rashid Khan', 43, 'Afghanistan', '27 innings, 2016–2026'],
        ['Wanindu Hasaranga', 40, 'Sri Lanka', '20 innings, 2021–2026'],
        ['Jasprit Bumrah', 40, 'India', '26 innings, 2016–2026'],
      ],
      WIKI("Men's T20 World Cup records"),
      '8 March 2026',
    ),
    careerTable(
      'most_catches',
      'Most catches',
      [
        ['David Warner', 25, 'Australia', '41 matches, as a fielder'],
        ['AB de Villiers', 23, 'South Africa', '30 matches, as a fielder'],
        ['Glenn Maxwell', 23, 'Australia', '35 matches, as a fielder'],
        ['Rohit Sharma', 21, 'India', '47 matches, as a fielder'],
        ['Martin Guptill', 19, 'New Zealand', '28 matches, as a fielder'],
      ],
      WIKI("Men's T20 World Cup records"),
      '20 February 2026',
      'Catches taken as a fielder rather than as a wicket-keeper.',
    ),
  ],

  'icc-world-test-championship': [
    honours(
      [
        [
          '2019–21',
          'New Zealand national cricket team',
          'India',
          'Won by 8 wickets at Southampton',
        ],
        ['2021–23', 'Australia national cricket team', 'India', 'Won by 209 runs at The Oval'],
        [
          '2023–25',
          'South Africa national cricket team',
          'Australia',
          "Won by 5 wickets at Lord's",
        ],
      ],
      WIKI('ICC World Test Championship'),
      '2025',
      'The 2025–27 cycle is in progress and is not listed.',
    ),
    // The records below come from the dedicated records article rather than the
    // competition article, whose own records section carries only the single
    // holder of each mark. Each table there prints its own "last updated" date,
    // so the `asOf` values differ between tables and are not normalised.
    careerTable(
      'most_appearances',
      'Most matches',
      WTC_MOST_MATCHES,
      WTC_RECORDS,
      '16 August 2026',
    ),
    careerTable(
      'top_scorers',
      'Most runs in a cycle',
      WTC_MOST_RUNS_IN_A_CYCLE,
      WTC_RECORDS,
      '4 January 2025',
      'Runs in a single championship cycle rather than across the competition. Joe Root also leads the all-time list, on 6,651.',
    ),
    careerTable(
      'most_wickets',
      'Most wickets in a cycle',
      WTC_MOST_WICKETS_IN_A_CYCLE,
      WTC_RECORDS,
      '14 June 2025',
      'Wickets in a single championship cycle rather than across the competition. Mitchell Starc leads the all-time list, on 230.',
    ),
    careerTable(
      'most_catches',
      'Most catches in a cycle',
      WTC_MOST_CATCHES_IN_A_CYCLE,
      WTC_RECORDS,
      '13 June 2025',
      'Catches by a fielder in a single cycle. Wicket-keepers are counted separately, in the dismissals table.',
    ),
    careerTable(
      'most_wicketkeeper_dismissals',
      'Most wicket-keeping dismissals in a cycle',
      WTC_MOST_DISMISSALS_IN_A_CYCLE,
      WTC_RECORDS,
      '14 June 2025',
      'Catches and stumpings by a wicket-keeper in a single cycle.',
    ),
  ],

  'icc-champions-trophy': [
    honours(
      [
        [1998, 'South Africa national cricket team', 'West Indies', null],
        [2000, 'New Zealand national cricket team', 'India', null],
        [
          2002,
          'India national cricket team',
          'Sri Lanka',
          'Title shared after the final was washed out',
        ],
        [2004, 'West Indies cricket team', 'England', null],
        [2006, 'Australia national cricket team', 'West Indies', null],
        [2009, 'Australia national cricket team', 'New Zealand', null],
        [2013, 'India national cricket team', 'England', null],
        [2017, 'Pakistan national cricket team', 'India', null],
        [2025, 'India national cricket team', 'New Zealand', 'Won by 4 wickets'],
      ],
      WIKI('ICC Champions Trophy'),
      '2025',
      'The 1998 and 2000 editions were played as the ICC KnockOut Trophy. The 2002 final was abandoned and the title shared, so Sri Lanka are joint champions of that edition.',
    ),
    awards(
      'award:player-of-the-tournament',
      'Player of the tournament',
      CT_PLAYER_OF_THE_TOURNAMENT,
      WIKI('ICC Champions Trophy'),
      '2025',
      'No award was made in 2000 or 2002, so those editions are absent rather than blank.',
    ),
    // The competition article publishes a leading run-scorer and leading
    // wicket-taker for every edition, but its all-time records section names
    // only the single holder of each career mark. Ranking the per-edition
    // figures is therefore the most a published source supports here; the
    // career leaders are stated in each table's caveat instead of invented as
    // rows.
    careerTable(
      'top_scorers',
      'Most runs in a tournament',
      CT_MOST_RUNS_IN_A_TOURNAMENT,
      WIKI('ICC Champions Trophy'),
      '9 March 2025',
      'Runs in a single edition. Chris Gayle leads the all-time list, on 791 between 2002 and 2013.',
    ),
    careerTable(
      'most_wickets',
      'Most wickets in a tournament',
      CT_MOST_WICKETS_IN_A_TOURNAMENT,
      WIKI('ICC Champions Trophy'),
      '9 March 2025',
      'Wickets in a single edition. Kyle Mills leads the all-time list, on 28 between 2002 and 2013.',
    ),
  ],

  'asia-cup': [
    honours(
      [
        [1984, 'India national cricket team', 'Sri Lanka', 'ODI'],
        [1986, 'Sri Lanka national cricket team', 'Pakistan', 'ODI'],
        [1988, 'India national cricket team', 'Sri Lanka', 'ODI'],
        ['1990–91', 'India national cricket team', 'Sri Lanka', 'ODI'],
        [1995, 'India national cricket team', 'Sri Lanka', 'ODI'],
        [1997, 'Sri Lanka national cricket team', 'India', 'ODI'],
        [2000, 'Pakistan national cricket team', 'Sri Lanka', 'ODI'],
        [2004, 'Sri Lanka national cricket team', 'India', 'ODI'],
        [2008, 'Sri Lanka national cricket team', 'India', 'ODI'],
        [2010, 'India national cricket team', 'Sri Lanka', 'ODI'],
        [2012, 'Pakistan national cricket team', 'Bangladesh', 'ODI'],
        [2014, 'Sri Lanka national cricket team', 'Pakistan', 'ODI'],
        [2016, 'India national cricket team', 'Bangladesh', 'T20I'],
        [2018, 'India national cricket team', 'Bangladesh', 'ODI'],
        [2022, 'Sri Lanka national cricket team', 'Pakistan', 'T20I'],
        [2023, 'India national cricket team', 'Pakistan', 'ODI'],
        [2025, 'India national cricket team', 'Pakistan', 'T20I · won by 5 wickets'],
      ],
      WIKI('Asia Cup'),
      '2025',
      'Played in ODI or T20I format depending on the edition, shown against each year.',
    ),
  ],

  'indian-premier-league': [
    // Renamed franchises are listed under their **current** name, which is the
    // row the teams catalogue holds and therefore the one a link can resolve
    // to. Kings XI Punjab is Punjab Kings and Delhi Daredevils is Delhi
    // Capitals; both are the same franchise rather than a predecessor, so
    // crediting the title to the current name is accurate as well as linkable.
    honours(
      [
        [2008, 'Rajasthan Royals', 'Chennai Super Kings', 'Won by 3 wickets'],
        [2009, 'Deccan Chargers', 'Royal Challengers Bangalore', 'Won by 6 runs'],
        [2010, 'Chennai Super Kings', 'Mumbai Indians', 'Won by 22 runs'],
        [2011, 'Chennai Super Kings', 'Royal Challengers Bangalore', 'Won by 58 runs'],
        [2012, 'Kolkata Knight Riders', 'Chennai Super Kings', 'Won by 5 wickets'],
        [2013, 'Mumbai Indians', 'Chennai Super Kings', 'Won by 23 runs'],
        [2014, 'Kolkata Knight Riders', 'Punjab Kings', 'Won by 3 wickets'],
        [2015, 'Mumbai Indians', 'Chennai Super Kings', 'Won by 41 runs'],
        [2016, 'Sunrisers Hyderabad', 'Royal Challengers Bangalore', 'Won by 8 runs'],
        [2017, 'Mumbai Indians', 'Rising Pune Supergiant', 'Won by 1 run'],
        [2018, 'Chennai Super Kings', 'Sunrisers Hyderabad', 'Won by 8 wickets'],
        [2019, 'Mumbai Indians', 'Chennai Super Kings', 'Won by 1 run'],
        [2020, 'Mumbai Indians', 'Delhi Capitals', 'Won by 5 wickets'],
        [2021, 'Chennai Super Kings', 'Kolkata Knight Riders', 'Won by 27 runs'],
        [2022, 'Gujarat Titans', 'Rajasthan Royals', 'Won by 7 wickets'],
        [2023, 'Chennai Super Kings', 'Gujarat Titans', 'Won by 5 wickets (DLS)'],
        [2024, 'Kolkata Knight Riders', 'Sunrisers Hyderabad', 'Won by 8 wickets'],
        [2025, 'Royal Challengers Bengaluru', 'Punjab Kings', 'Won by 6 runs'],
        [2026, 'Royal Challengers Bengaluru', 'Gujarat Titans', 'Won by 5 wickets'],
      ],
      WIKI('List of Indian Premier League seasons and results'),
      '2026',
    ),
    awards(
      'award:player-of-the-season',
      'Player of the season',
      [
        [2008, 'Shane Watson', 'Rajasthan Royals'],
        [2009, 'Adam Gilchrist', 'Deccan Chargers'],
        [2010, 'Sachin Tendulkar', 'Mumbai Indians'],
        [2011, 'Chris Gayle', 'Royal Challengers Bangalore'],
        [2012, 'Sunil Narine', 'Kolkata Knight Riders'],
        [2013, 'Shane Watson', 'Rajasthan Royals'],
        [2014, 'Glenn Maxwell', 'Punjab Kings'],
        [2015, 'Andre Russell', 'Kolkata Knight Riders'],
        [2016, 'Virat Kohli', 'Royal Challengers Bangalore'],
        [2017, 'Ben Stokes', 'Rising Pune Supergiant'],
        [2018, 'Sunil Narine', 'Kolkata Knight Riders'],
        [2019, 'Andre Russell', 'Kolkata Knight Riders'],
        [2020, 'Jofra Archer', 'Rajasthan Royals'],
        [2021, 'Harshal Patel', 'Royal Challengers Bangalore'],
        [2022, 'Jos Buttler', 'Rajasthan Royals'],
        [2023, 'Shubman Gill', 'Gujarat Titans'],
        [2024, 'Sunil Narine', 'Kolkata Knight Riders'],
        [2025, 'Suryakumar Yadav', 'Mumbai Indians'],
        [2026, 'Vaibhav Suryavanshi', 'Rajasthan Royals'],
      ],
      WIKI('Indian Premier League'),
      '2026',
    ),
    careerTable(
      'top_scorers',
      'Most runs',
      [
        ['Virat Kohli', 9336, 'Royal Challengers Bengaluru', '275 innings, 2008–2026'],
        ['Rohit Sharma', 7329, 'Deccan Chargers, Mumbai Indians', '276 innings, 2008–2026'],
        ['Shikhar Dhawan', 6769, 'five franchises', '221 innings, 2008–2024'],
        ['David Warner', 6565, 'Delhi Capitals, Sunrisers Hyderabad', '184 innings, 2009–2024'],
        ['KL Rahul', 5815, 'six franchises', '150 innings, 2013–2026'],
      ],
      WIKI('List of Indian Premier League records and statistics'),
      '2026',
    ),
    careerTable(
      'most_wickets',
      'Most wickets',
      [
        ['Yuzvendra Chahal', 233, 'four franchises', '184 innings, 2013–2026'],
        ['Bhuvneshwar Kumar', 226, 'three franchises', '206 innings, 2011–2026'],
        ['Sunil Narine', 207, 'Kolkata Knight Riders', '200 innings, 2012–2026'],
        ['Piyush Chawla', 192, 'four franchises', '191 innings, 2008–2024'],
        ['Ravichandran Ashwin', 187, 'five franchises', '217 innings, 2009–2025'],
        ['Jasprit Bumrah', 187, 'Mumbai Indians', '158 innings, 2013–2026'],
      ],
      WIKI('List of Indian Premier League records and statistics'),
      '2026',
    ),
    careerTable(
      'most_catches',
      'Most catches',
      [
        ['Virat Kohli', 126, 'Royal Challengers Bengaluru', '280 innings, 2008–2026'],
        ['Ravindra Jadeja', 110, 'four franchises', '264 innings'],
        ['Suresh Raina', 109, 'Chennai Super Kings, Gujarat Lions', '204 innings, 2008–2021'],
        ['Kieron Pollard', 103, 'Mumbai Indians', '189 innings, 2010–2022'],
        ['Rohit Sharma', 102, 'Deccan Chargers, Mumbai Indians', '279 innings, 2008–2026'],
      ],
      WIKI('List of Indian Premier League records and statistics'),
      '2026',
      'Catches taken as a fielder rather than as a wicket-keeper.',
    ),
    careerTable(
      'most_wicketkeeper_dismissals',
      'Most dismissals (wicket-keeper)',
      [
        [
          'Mahendra Singh Dhoni',
          201,
          'Chennai Super Kings, Rising Pune Supergiant',
          '271 innings, 2008–2025',
        ],
        ['Dinesh Karthik', 174, 'six franchises', '235 innings, 2008–2024'],
        ['Wriddhiman Saha', 113, 'five franchises', '149 innings, 2008–2024'],
        ['Rishabh Pant', 111, 'Delhi Capitals, Lucknow Super Giants', '126 innings, 2016–2026'],
        ['Robin Uthappa', 90, 'six franchises', '114 innings, 2008–2022'],
      ],
      WIKI('List of Indian Premier League records and statistics'),
      '2026',
      'Catches and stumpings combined, taken as a designated wicket-keeper.',
    ),
  ],

  // The Ashes is a bilateral series rather than a tournament, so a roll of
  // honour would be a 74-row list of two names. The useful tables are the
  // all-time series record and the career leaders.
  'the-ashes': [
    {
      kind: 'roll_of_honour',
      label: 'All-time series record',
      source: WIKI('The Ashes'),
      asOf: '8 January 2026',
      caveat:
        'Series won since 1882–83. The 2025–26 series was in progress when this was compiled and is excluded.',
      entries: [
        {
          rank: 1,
          name: 'Australia national cricket team',
          value: 35,
          detail: 'series won of 74 played',
        },
        {
          rank: 2,
          name: 'England cricket team',
          value: 32,
          detail: 'series won of 74 played',
        },
        { rank: 3, name: 'Drawn', value: 7, detail: 'series drawn' },
      ],
    },
    careerTable(
      'top_scorers',
      'Most runs',
      [
        ['Don Bradman', 5028, 'Australia', '37 matches, 1928–1948 · average 89.78'],
        ['Steve Smith', 3703, 'Australia', '41 matches, 2010–2026 · average 56.10'],
        ['Jack Hobbs', 3636, 'England', '41 matches, 1908–1930 · average 54.26'],
        ['Allan Border', 3222, 'Australia', '42 matches, 1978–1993 · average 55.55'],
        ['Steve Waugh', 3173, 'Australia', '45 matches, 1986–2003 · average 58.75'],
      ],
      ESPN_ASHES_BATTING,
      '2026',
    ),
    careerTable(
      'most_wickets',
      'Most wickets',
      [
        ['Shane Warne', 195, 'Australia', '36 matches, 1993–2007 · average 23.25'],
        ['Glenn McGrath', 157, 'Australia', '30 matches, 1994–2007 · average 20.92'],
        ['Stuart Broad', 153, 'England', '40 matches, 2009–2023 · average 28.96'],
        ['Hugh Trumble', 141, 'Australia', '31 matches, 1890–1904 · average 20.88'],
        ['Dennis Lillee', 128, 'Australia', '24 matches, 1971–1982 · average 22.32'],
        ['Mitchell Starc', 128, 'Australia', '27 matches, 2013–2026 · average 25.57'],
        ['Ian Botham', 128, 'England', '32 matches, 1977–1989 · average 28.04'],
      ],
      ESPN_ASHES_BOWLING,
      '2026',
    ),
  ],
  // ── Women's international ─────────────────────────────────────────────────
  'womens-cricket-world-cup': [
    honours(
      [
        [1973, "England women's national cricket team", 'Australia', 'Won on points'],
        [1978, "Australia women's national cricket team", 'England', 'Won on points'],
        [1982, "Australia women's national cricket team", 'England', 'Won by 3 wickets'],
        [1988, "Australia women's national cricket team", 'England', 'Won by 8 wickets'],
        [1993, "England women's national cricket team", 'New Zealand', 'Won by 67 runs'],
        [1997, "Australia women's national cricket team", 'New Zealand', 'Won by 5 wickets'],
        [2000, "New Zealand women's national cricket team", 'Australia', 'Won by 4 runs'],
        [2005, "Australia women's national cricket team", 'India', 'Won by 98 runs'],
        [2009, "England women's national cricket team", 'New Zealand', 'Won by 4 wickets'],
        [2013, "Australia women's national cricket team", 'West Indies', 'Won by 114 runs'],
        [2017, "England women's national cricket team", 'India', 'Won by 9 runs'],
        [2022, "Australia women's national cricket team", 'England', 'Won by 71 runs'],
        [
          2025,
          "India women's national cricket team",
          'South Africa',
          "Won by 52 runs · India's first title",
        ],
      ],
      WIKI("Women's Cricket World Cup"),
      '2025',
      'Winners are the national women’s sides. Several are not yet held in the team catalogue, so those rows show as plain text rather than links.',
    ),
  ],

  'icc-womens-t20-world-cup': [
    honours(
      [
        [2009, "England women's national cricket team", 'New Zealand', 'Won by 6 wickets'],
        [2010, "Australia women's national cricket team", 'New Zealand', 'Won by 3 runs'],
        [2012, "Australia women's national cricket team", 'England', 'Won by 4 runs'],
        [2014, "Australia women's national cricket team", 'England', 'Won by 6 wickets'],
        [2016, "West Indies women's cricket team", 'Australia', 'Won by 8 wickets'],
        [2018, "Australia women's national cricket team", 'England', 'Won by 8 wickets'],
        [2020, "Australia women's national cricket team", 'India', 'Won by 85 runs'],
        [2023, "Australia women's national cricket team", 'South Africa', 'Won by 19 runs'],
        [2024, "New Zealand women's national cricket team", 'South Africa', 'Won by 32 runs'],
        [
          2026,
          "Australia women's national cricket team",
          'England',
          "Won by 7 wickets · Australia's seventh title",
        ],
      ],
      WIKI("ICC Women's T20 World Cup"),
      '2026',
      'Winners are the national women’s sides. Several are not yet held in the team catalogue, so those rows show as plain text rather than links.',
    ),
  ],

  // ── Franchise T20 ─────────────────────────────────────────────────────────
  'big-bash-league': [
    honours(
      [
        ['2011–12', 'Sydney Sixers', 'Perth Scorchers', 'Won by 7 wickets'],
        ['2012–13', 'Brisbane Heat', 'Perth Scorchers', 'Won by 34 runs'],
        ['2013–14', 'Perth Scorchers', 'Hobart Hurricanes', 'Won by 39 runs'],
        ['2014–15', 'Perth Scorchers', 'Sydney Sixers', 'Won by 4 wickets'],
        ['2015–16', 'Sydney Thunder', 'Melbourne Stars', 'Won by 3 wickets'],
        ['2016–17', 'Perth Scorchers', 'Sydney Sixers', 'Won by 9 wickets'],
        ['2017–18', 'Adelaide Strikers', 'Hobart Hurricanes', 'Won by 25 runs'],
        ['2018–19', 'Melbourne Renegades', 'Melbourne Stars', 'Won by 13 runs'],
        ['2019–20', 'Sydney Sixers', 'Melbourne Stars', 'Won by 19 runs'],
        ['2020–21', 'Sydney Sixers', 'Perth Scorchers', 'Won by 27 runs'],
        ['2021–22', 'Perth Scorchers', 'Sydney Sixers', 'Won by 79 runs'],
        ['2022–23', 'Perth Scorchers', 'Brisbane Heat', 'Won by 5 wickets'],
        ['2023–24', 'Brisbane Heat', 'Sydney Sixers', 'Won by 54 runs'],
        ['2024–25', 'Hobart Hurricanes', 'Sydney Thunder', 'Won by 7 wickets'],
        ['2025–26', 'Perth Scorchers', 'Sydney Sixers', 'Won by 6 wickets'],
      ],
      WIKI('Big Bash League'),
      '2026',
    ),
  ],

  'pakistan-super-league': [
    honours(
      [
        [2016, 'Islamabad United', 'Quetta Gladiators', 'Won by 6 wickets'],
        [2017, 'Peshawar Zalmi', 'Quetta Gladiators', 'Won by 58 runs'],
        [2018, 'Islamabad United', 'Peshawar Zalmi', 'Won by 3 wickets'],
        [2019, 'Quetta Gladiators', 'Peshawar Zalmi', 'Won by 8 wickets'],
        [2020, 'Karachi Kings', 'Lahore Qalandars', 'Won by 5 wickets'],
        [2021, 'Multan Sultans', 'Peshawar Zalmi', 'Won by 47 runs'],
        [2022, 'Lahore Qalandars', 'Multan Sultans', 'Won by 42 runs'],
        [2023, 'Lahore Qalandars', 'Multan Sultans', 'Won by 1 run'],
        [2024, 'Islamabad United', 'Multan Sultans', 'Won by 2 wickets'],
        [2025, 'Lahore Qalandars', 'Quetta Gladiators', 'Won by 6 wickets'],
        [2026, 'Peshawar Zalmi', 'Hyderabad Kingsmen', 'Won by 5 wickets'],
      ],
      WIKI('Pakistan Super League'),
      '2026',
    ),
  ],

  sa20: [
    honours(
      [
        [2023, 'Sunrisers Eastern Cape', 'Pretoria Capitals', 'Won by 4 wickets'],
        [2024, 'Sunrisers Eastern Cape', "Durban's Super Giants", 'Won by 89 runs'],
        [2025, 'MI Cape Town', 'Sunrisers Eastern Cape', 'Won by 76 runs'],
        [2026, 'Sunrisers Eastern Cape', 'Pretoria Capitals', 'Won by 6 wickets'],
      ],
      WIKI('SA20'),
      '2026',
    ),
  ],

  'caribbean-premier-league': [
    honours(
      [
        [2013, 'Jamaica Tallawahs', 'Guyana Amazon Warriors', 'Won by 7 wickets'],
        [2014, 'Barbados Tridents', 'Guyana Amazon Warriors', 'Won by 8 runs (D/L)'],
        [2015, 'Trinidad and Tobago Red Steel', 'Barbados Tridents', 'Won by 20 runs'],
        [2016, 'Jamaica Tallawahs', 'Guyana Amazon Warriors', 'Won by 9 wickets'],
        [2017, 'Trinbago Knight Riders', 'St Kitts & Nevis Patriots', 'Won by 3 wickets'],
        [2018, 'Trinbago Knight Riders', 'Guyana Amazon Warriors', 'Won by 8 wickets'],
        [2019, 'Barbados Tridents', 'Guyana Amazon Warriors', 'Won by 27 runs'],
        [2020, 'Trinbago Knight Riders', 'St Lucia Zouks', 'Won by 8 wickets'],
        [2021, 'St Kitts & Nevis Patriots', 'Saint Lucia Kings', 'Won by 3 wickets'],
        [2022, 'Jamaica Tallawahs', 'Barbados Royals', 'Won by 8 wickets'],
        [2023, 'Guyana Amazon Warriors', 'Trinbago Knight Riders', 'Won by 9 wickets'],
        [2024, 'Saint Lucia Kings', 'Guyana Amazon Warriors', 'Won by 6 wickets'],
        [2025, 'Trinbago Knight Riders', 'Guyana Amazon Warriors', 'Won by 3 wickets'],
      ],
      WIKI('Caribbean Premier League'),
      '2025',
    ),
  ],

  'the-hundred': [
    honours(
      [
        [2021, 'Southern Brave', 'Birmingham Phoenix', 'Won by 32 runs'],
        [2022, 'Trent Rockets', 'Manchester Originals', 'Won by 2 wickets'],
        [2023, 'Oval Invincibles', 'Manchester Originals', 'Won by 14 runs'],
        [2024, 'Oval Invincibles', 'Southern Brave', 'Won by 17 runs'],
        [2025, 'Oval Invincibles', 'Trent Rockets', 'Won by 26 runs'],
        [2026, 'Manchester Super Giants', 'Trent Rockets', 'Won by 5 wickets'],
      ],
      WIKI('The Hundred (cricket)'),
      '2026',
      'The men’s competition. The women’s competition is played alongside it and has its own winners.',
    ),
  ],

  'womens-premier-league': [
    honours(
      [
        [2023, 'Mumbai Indians', 'Delhi Capitals', 'Won by 7 wickets'],
        [2024, 'Royal Challengers Bengaluru', 'Delhi Capitals', 'Won by 8 wickets'],
        [2025, 'Mumbai Indians', 'Delhi Capitals', 'Won by 8 runs'],
        [2026, 'Royal Challengers Bengaluru', 'Delhi Capitals', 'Won by 6 wickets'],
      ],
      WIKI("Women's Premier League (cricket)"),
      '2026',
      'Delhi Capitals have reached all four finals and lost each one.',
    ),
  ],

  'international-league-t20': [
    honours(
      [
        [2023, 'Gulf Giants', 'Desert Vipers', 'Won by 7 wickets'],
        [2024, 'MI Emirates', 'Dubai Capitals', 'Won by 45 runs'],
        [2025, 'Dubai Capitals', 'Desert Vipers', 'Won by 4 wickets'],
        ['2025–26', 'Desert Vipers', 'MI Emirates', 'Won by 46 runs'],
      ],
      WIKI('International League T20'),
      '2026',
    ),
  ],

  'major-league-cricket': [
    honours(
      [
        [2023, 'MI New York', 'Seattle Orcas', 'Won by 7 wickets'],
        [2024, 'Washington Freedom', 'San Francisco Unicorns', 'Won by 96 runs'],
        [2025, 'MI New York', 'Washington Freedom', 'Won by 5 runs'],
        [2026, 'Los Angeles Knight Riders', 'Washington Freedom', 'Won by 1 run'],
      ],
      WIKI('Major League Cricket'),
      '2026',
    ),
  ],

  'lanka-premier-league': [
    honours(
      [
        [2020, 'Jaffna Stallions', 'Galle Gladiators', null],
        [2021, 'Jaffna Kings', 'Galle Gladiators', null],
        [2022, 'Jaffna Kings', 'Colombo Stars', null],
        [2023, 'B-Love Kandy', 'Dambulla Aura', null],
        [2024, 'Jaffna Kings', 'Galle Marvels', null],
        [2026, 'Galle Gallants', 'Jaffna Kings', 'Won by 5 wickets'],
      ],
      WIKI('Lanka Premier League'),
      '2026',
      'No season was played in 2025. Franchises have been renamed repeatedly, so a side appears here under the name it held that year.',
    ),
  ],

  'bangladesh-premier-league': [
    honours(
      [
        [2012, 'Dhaka Gladiators', 'Barisal Burners', null],
        [2013, 'Dhaka Gladiators', 'Chittagong Kings', null],
        [2015, 'Comilla Victorians', 'Barisal Bulls', null],
        [2016, 'Dhaka Dynamites', 'Rajshahi Kings', null],
        [2017, 'Rangpur Riders', 'Dhaka Dynamites', null],
        ['2018–19', 'Comilla Victorians', 'Dhaka Dynamites', null],
        ['2019–20', 'Rajshahi Royals', 'Khulna Tigers', null],
        ['2021–22', 'Comilla Victorians', 'Fortune Barishal', null],
        [2023, 'Comilla Victorians', 'Sylhet Strikers', null],
        [2024, 'Fortune Barishal', 'Comilla Victorians', null],
        [2025, 'Fortune Barishal', 'Chittagong Kings', null],
        [2026, 'Rajshahi Warriors', 'Chattogram Royals', 'Won by 63 runs'],
      ],
      WIKI('Bangladesh Premier League'),
      '2026',
      'The 2014 and 2020 seasons were cancelled and are absent. Franchises have been renamed and re-formed repeatedly.',
    ),
  ],

  'womens-big-bash-league': [
    honours(
      [
        ['2015–16', 'Sydney Thunder', 'Sydney Sixers', 'Won by 3 wickets'],
        ['2016–17', 'Sydney Sixers', 'Perth Scorchers', 'Won by 7 runs'],
        ['2017–18', 'Sydney Sixers', 'Perth Scorchers', 'Won by 9 wickets'],
        ['2018–19', 'Brisbane Heat', 'Sydney Sixers', 'Won by 3 wickets'],
        ['2019–20', 'Brisbane Heat', 'Adelaide Strikers', 'Won by 6 wickets'],
        ['2020–21', 'Sydney Thunder', 'Melbourne Stars', 'Won by 7 wickets'],
        ['2021–22', 'Perth Scorchers', 'Adelaide Strikers', 'Won by 12 runs'],
        ['2022–23', 'Adelaide Strikers', 'Sydney Sixers', 'Won by 10 runs'],
        ['2023–24', 'Adelaide Strikers', 'Brisbane Heat', 'Won by 3 runs'],
        ['2024–25', 'Melbourne Renegades', 'Brisbane Heat', 'Won by 7 runs (DLS)'],
        ['2025–26', 'Hobart Hurricanes', 'Perth Scorchers', 'Won by 8 wickets'],
      ],
      WIKI("Women's Big Bash League"),
      '2026',
    ),
  ],

  // ── Premier domestic ──────────────────────────────────────────────────────
  // These are decided over a long history, so the useful table is the all-time
  // title count rather than a season-by-season list of a hundred rows.
  'county-championship': [
    titleCounts(
      [
        ['Yorkshire County Cricket Club', 33, 'including one shared'],
        ['Surrey County Cricket Club', 23, 'including one shared'],
        ['Middlesex County Cricket Club', 13, 'including two shared'],
        ['Lancashire County Cricket Club', 9, 'including one shared'],
        ['Essex County Cricket Club', 8, null],
        ['Warwickshire County Cricket Club', 8, null],
        ['Nottinghamshire County Cricket Club', 7, null],
        ['Kent County Cricket Club', 7, 'including one shared'],
        ['Worcestershire County Cricket Club', 5, null],
        ['Glamorgan County Cricket Club', 3, null],
        ['Leicestershire County Cricket Club', 3, null],
        ['Sussex County Cricket Club', 3, null],
        ['Durham County Cricket Club', 3, null],
        ['Hampshire County Cricket Club', 2, null],
        ['Derbyshire County Cricket Club', 1, null],
      ],
      WIKI('County Championship'),
      '2025',
      'Titles since 1890. Gloucestershire, Northamptonshire and Somerset have never won it.',
    ),
  ],

  'sheffield-shield': [
    titleCounts(
      [
        ['New South Wales cricket team', 47, null],
        ['Victoria cricket team', 32, null],
        ['Western Australia cricket team', 18, null],
        ['South Australia cricket team', 15, 'most recently 2025–26'],
        ['Queensland cricket team', 9, null],
        ['Tasmania cricket team', 3, null],
      ],
      WIKI('Sheffield Shield'),
      '2026',
      'Titles since 1892–93.',
    ),
  ],

  'ranji-trophy': [
    titleCounts(
      [
        ['Mumbai cricket team', 42, null],
        ['Karnataka cricket team', 8, null],
        ['Delhi cricket team', 7, null],
        ['Madhya Pradesh cricket team', 5, null],
        ['Baroda cricket team', 5, null],
        ['Saurashtra cricket team', 3, null],
        ['Vidarbha cricket team', 3, null],
        ['Bengal cricket team', 2, null],
        ['Tamil Nadu cricket team', 2, null],
        ['Rajasthan cricket team', 2, null],
        ['Hyderabad cricket team', 2, null],
        ['Maharashtra cricket team', 2, null],
        ['Railways cricket team', 2, null],
        ['Jammu and Kashmir cricket team', 1, 'first title, 2025–26'],
      ],
      WIKI('Ranji Trophy'),
      '2026',
      'Titles since 1934–35. Teams with a single title are listed only where the side is held in the catalogue.',
    ),
  ],

  'vijay-hazare-trophy': [
    titleCounts(
      [
        ['Karnataka cricket team', 5, null],
        ['Tamil Nadu cricket team', 5, null],
        ['Mumbai cricket team', 4, null],
        ['Saurashtra cricket team', 2, null],
        ['Vidarbha cricket team', 1, 'first title, 2025–26'],
      ],
      WIKI('Vijay Hazare Trophy'),
      '2026',
      'Titles since 2002–03. Only the multiple winners and the current holder are listed.',
    ),
  ],

  'syed-mushtaq-ali-trophy': [
    titleCounts(
      [
        ['Tamil Nadu cricket team', 3, null],
        ['Baroda cricket team', 2, null],
        ['Gujarat cricket team', 2, null],
        ['Karnataka cricket team', 2, null],
        ['Mumbai cricket team', 2, null],
        ['Jharkhand cricket team', 1, 'first title, 2025–26'],
      ],
      WIKI('Syed Mushtaq Ali Trophy'),
      '2026',
      'Titles since 2006–07. Only the multiple winners and the current holder are listed.',
    ),
  ],

  'twenty20-cup': [
    honours(
      [
        [2020, 'Nottinghamshire County Cricket Club', 'Surrey County Cricket Club', null],
        [2021, 'Kent County Cricket Club', 'Somerset County Cricket Club', null],
        [2022, 'Hampshire County Cricket Club', 'Lancashire County Cricket Club', null],
        [2023, 'Somerset County Cricket Club', 'Essex County Cricket Club', null],
        [2024, 'Gloucestershire County Cricket Club', 'Somerset County Cricket Club', null],
        [2025, 'Somerset County Cricket Club', 'Hampshire County Cricket Club', null],
        [2026, 'Northamptonshire County Cricket Club', 'Hampshire County Cricket Club', null],
      ],
      WIKI('Vitality Blast'),
      '2026',
      'The last seven seasons. The competition began in 2003 as the Twenty20 Cup and has been the Vitality Blast since 2018.',
    ),
  ],
};
