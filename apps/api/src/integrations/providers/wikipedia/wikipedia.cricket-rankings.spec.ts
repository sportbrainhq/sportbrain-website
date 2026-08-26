import { describe, expect, it } from 'vitest';
import { WikipediaProvider } from './wikipedia.provider';
import type { WikipediaClient } from './wikipedia.client';

/**
 * Cricket team leaderboard parsing, tested against the real page shapes.
 *
 * Every fixture below is trimmed from the live article it is named after, and
 * every case exists because it was wrong at some point while this was written:
 *
 *   - India's six tables were rejected outright, because the ownership check
 *     demanded a table say whose it was and India's say only "Statistics |
 *     Tests".
 *   - Australia published a wicketkeeping dismissals table as its most-capped
 *     list, ranked 7, because the metric was chosen on which columns existed
 *     and half the decoys on a records article share those columns.
 *
 * The two layouts are genuinely different and both are tested: a team article,
 * where the ranked column is the only signal, and a records article, where the
 * heading is authoritative and thirty tables compete.
 */
describe('cricket team rankings', () => {
  /** A wikitable under a heading path, matching what `parseTables` reads. */
  const article = (
    sections: { path: string[]; caption?: string; headers: string[]; rows: string[][] }[],
  ) =>
    sections
      .map(({ path, caption, headers, rows }) => {
        const headings = path
          .map((heading, depth) => `<h${depth + 2} id="h${depth}">${heading}</h${depth + 2}>`)
          .join('');
        const body =
          `<table class="wikitable">` +
          (caption ? `<caption>${caption}</caption>` : '') +
          `<tr id="r0">${headers.map((header) => `<th id="th">${header}</th>`).join('')}</tr>` +
          rows
            .map(
              (row, index) =>
                `<tr id="r${index + 1}">${row
                  .map((cell) => `<td id="td">${cell}</td>`)
                  .join('')}</tr>`,
            )
            .join('') +
          `</table>`;
        return headings + body;
      })
      .join('');

  /** A provider whose client serves one page per title and nothing else. */
  const providerFor = (pages: Record<string, string>) =>
    new WikipediaProvider({
      fetchHtml: async (title: string) => pages[title] ?? null,
    } as unknown as WikipediaClient);

  it('reads a team article, where only the ranked column says what a table is', async () => {
    // India's layout. The section heading is the bare format name and the
    // caption is a date, so nothing near the table names the metric: the
    // second column does. Both tables also carry a Matches column, which is
    // why Matches must be tested last.
    const html = article([
      {
        path: ['Statistics', 'Tests'],
        caption: 'Last updated: 5 December 2024',
        headers: ['Rank', 'Runs', 'Player', 'Matches', 'Innings', 'Period'],
        rows: [
          ['1', '15,921', 'Sachin Tendulkar', '200', '329', '1989–2013'],
          ['2', '13,265', 'Rahul Dravid', '163', '284', '1996–2012'],
          ['3', '10,122', 'Sunil Gavaskar', '125', '214', '1971–1987'],
        ],
      },
      {
        path: ['Statistics', 'Tests'],
        caption: 'Last updated: 12 September 2025',
        headers: ['Rank', 'Wickets', 'Player', 'Matches', 'Innings', 'Period'],
        rows: [
          ['1', '619', 'Anil Kumble', '132', '236', '1990–2008'],
          ['2', '537', 'Ravichandran Ashwin', '106', '200', '2011–2024'],
          ['3', '434', 'Kapil Dev', '131', '227', '1978–1994'],
        ],
      },
    ]);

    const rankings = await providerFor({
      'India national cricket team': html,
    }).fetchCricketTeamRankings('India national cricket team', 'India national cricket team');

    expect(rankings.map((ranking) => ranking.kind)).toEqual([
      'test_most_runs',
      'test_most_wickets',
    ]);
    expect(rankings[0]?.entries[0]).toMatchObject({ name: 'Sachin Tendulkar', value: 15921 });
    expect(rankings[1]?.entries[0]).toMatchObject({ name: 'Anil Kumble', value: 619 });
  });

  it('prefers an explicit heading over the columns on a records article', async () => {
    // Australia's layout, and the bug it caused. "Most career dismissals" and
    // "Most matches as captain" both carry a Matches column, and choosing on
    // columns published the first of them as the most-capped list. Only the
    // heading separates them, so only the correctly headed table survives.
    const html = article([
      {
        path: ['Batting records', 'Most career runs'],
        caption: 'Last updated: 24 August 2026',
        headers: ['Rank', 'Runs', 'Player', 'Matches', 'Innings', 'Period'],
        rows: [
          ['1', '13,378', 'Ricky Ponting', '168', '287', '1995–2012'],
          ['2', '11,174', 'Allan Border', '156', '265', '1978–1994'],
          ['3', '10,927', 'Steve Waugh', '168', '260', '1985–2004'],
        ],
      },
      {
        path: ['Wicket-keeping records', 'Most career dismissals'],
        caption: 'Last updated: 31 December 2022',
        headers: ['Rank', 'Dismissals', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '416', 'Adam Gilchrist', '96', '96'],
          ['2', '395', 'Ian Healy', '119', '119'],
          ['3', '270', 'Rod Marsh', '96', '96'],
        ],
      },
      {
        path: ['Other records', 'Most matches as captain'],
        caption: 'Last updated: 31 December 2022',
        headers: ['Rank', 'Matches', 'Player', 'Won', 'Lost'],
        rows: [
          ['1', '77', 'Allan Border', '32', '22'],
          ['2', '93', 'Ricky Ponting', '48', '16'],
          ['3', '57', 'Steve Waugh', '41', '9'],
        ],
      },
    ]);

    const rankings = await providerFor({
      'List of Australia Test cricket records': html,
    }).fetchCricketTeamRankings(
      'Australia national cricket team',
      'Australia national cricket team',
    );

    // The dismissals and captaincy tables are rejected, not relabelled.
    expect(rankings.map((ranking) => ranking.kind)).toEqual(['test_most_runs']);
    expect(rankings[0]?.entries[0]).toMatchObject({ name: 'Ricky Ponting', value: 13378 });
  });

  it('rejects per-innings and per-series tables that share a career table’s columns', async () => {
    // "Most runs in a series" has the same columns as the career leaderboard
    // and is not one. Without the exclusions it published as a career record.
    const html = article([
      {
        path: ['Batting records', 'Most runs in a series'],
        headers: ['Rank', 'Runs', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '974', 'Donald Bradman', '5', '7'],
          ['2', '905', 'Wally Hammond', '5', '6'],
          ['3', '839', 'Mark Taylor', '6', '11'],
        ],
      },
      {
        path: ['Batting records', 'Highest career average'],
        headers: ['Rank', 'Average', 'Player', 'Runs', 'Innings'],
        rows: [
          ['1', '99.94', 'Donald Bradman', '6,996', '80'],
          ['2', '60.97', 'Steve Smith', '10,920', '223'],
          ['3', '59.23', 'Greg Chappell', '7,110', '151'],
        ],
      },
    ]);

    const rankings = await providerFor({
      'List of Australia Test cricket records': html,
    }).fetchCricketTeamRankings(
      'Australia national cricket team',
      'Australia national cricket team',
    );

    expect(rankings).toEqual([]);
  });

  it('keeps a records article for the team it belongs to and no other', async () => {
    // A records article opens each section with prose about the *world* record,
    // so ownership cannot be assumed from the section. It is taken from the
    // article title: "List of Australia Test cricket records" is Australia's,
    // and serving it for England must yield nothing.
    const html = article([
      {
        path: ['Batting records', 'Most career runs'],
        headers: ['Rank', 'Runs', 'Player', 'Matches'],
        rows: [
          ['1', '13,378', 'Ricky Ponting', '168'],
          ['2', '11,174', 'Allan Border', '156'],
          ['3', '10,927', 'Steve Waugh', '168'],
        ],
      },
    ]);

    // Australia's own article title resolves; England's does not exist here, so
    // England gets nothing rather than Australia's batsmen.
    const provider = providerFor({ 'List of Australia Test cricket records': html });

    const australia = await provider.fetchCricketTeamRankings(
      'Australia national cricket team',
      'Australia national cricket team',
    );
    const england = await provider.fetchCricketTeamRankings(
      'England cricket team',
      'England cricket team',
    );

    expect(australia.map((ranking) => ranking.kind)).toEqual(['test_most_runs']);
    expect(england).toEqual([]);
  });

  it('strips the record-holder and active-player markers from a name', async () => {
    // These tables flag the world record holder with a spade and current
    // players with a dagger, inside the name cell, so a row arrives as
    // "Muttiah Muralitharan ♠" and would never match a player we hold.
    const html = article([
      {
        path: ['Statistics', 'One-Day Internationals'],
        caption: 'Last updated: 4 August 2024',
        headers: ['Rank', 'Wickets', 'Player', 'Matches'],
        rows: [
          ['1', '534', 'Muttiah Muralitharan ♠', '350'],
          ['2', '400', 'Chaminda Vaas', '322'],
          ['3', '338', 'Lasith Malinga †', '226'],
        ],
      },
    ]);

    const rankings = await providerFor({
      'Sri Lanka national cricket team': html,
    }).fetchCricketTeamRankings(
      'Sri Lanka national cricket team',
      'Sri Lanka national cricket team',
    );

    expect(rankings[0]?.kind).toBe('odi_most_wickets');
    expect(rankings[0]?.entries.map((entry) => entry.name)).toEqual([
      'Muttiah Muralitharan',
      'Chaminda Vaas',
      'Lasith Malinga',
    ]);
  });

  it('files a franchise leaderboard under a club kind, never a T20I one', async () => {
    // An IPL record is not a T20I record: the competition is not international
    // cricket. Sharing a kind would invite summing the two, so franchise
    // tables get their own and the format-qualified kinds stay international.
    const html = article([
      {
        path: ['Statistics', 'Most runs'],
        headers: ['Rank', 'Player', 'Span', 'Matches', 'Runs'],
        rows: [
          ['1', 'Rohit Sharma', '2011–present', '183', '5,698'],
          ['2', 'Suryakumar Yadav', '2018–present', '124', '3,413'],
          ['3', 'Kieron Pollard', '2010–2022', '189', '3,412'],
        ],
      },
      {
        path: ['Statistics', 'Most wickets'],
        headers: ['Rank', 'Player', 'Span', 'Matches', 'Wickets'],
        rows: [
          ['1', 'Jasprit Bumrah', '2013–present', '133', '183'],
          ['2', 'Lasith Malinga', '2009–2019', '122', '170'],
          ['3', 'Harbhajan Singh', '2008–2017', '136', '127'],
        ],
      },
    ]);

    const rankings = await providerFor({ 'Mumbai Indians': html }).fetchCricketClubRankings(
      'Mumbai Indians',
      'Mumbai Indians',
    );

    expect(rankings.map((ranking) => ranking.kind)).toEqual([
      'club_most_runs',
      'club_most_wickets',
    ]);
    // The value comes from the Runs column, not from Matches, which sits beside
    // it and is larger for nobody but reads as a plausible ranking.
    expect(rankings[0]?.entries[0]).toMatchObject({ name: 'Rohit Sharma', value: 5698 });
    expect(rankings[1]?.entries[0]).toMatchObject({ name: 'Jasprit Bumrah', value: 183 });
  });

  it('falls back to a franchise records article, rejecting its per-season decoys', async () => {
    // Chennai Super Kings, Delhi Capitals, Punjab Kings and several others keep
    // only a "Statistics" heading on the team article and push the tables to
    // "List of {Team} records", so reading the team page alone left six IPL
    // sides with nothing.
    //
    // That article also carries "Most runs in a season" and "Most runs conceded
    // in a match" with the same columns as the career table, which is why the
    // exclusions matter more here than anywhere else.
    const records = article([
      {
        path: ['Individual Records (Batting)', 'Most runs'],
        caption: 'Last Updated: 23 May 2026',
        headers: ['Rank', 'Runs', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '4,865', 'MS Dhoni †', '229', '215'],
          ['2', '4,687', 'Suresh Raina', '176', '172'],
          ['3', '2,912', 'Ambati Rayudu', '128', '113'],
        ],
      },
      {
        path: ['Individual Records (Batting)', 'Most runs in a season'],
        caption: 'Last Updated: 28 February 2026',
        headers: ['Rank', 'Runs', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '733', 'Michael Hussey', '17', '17'],
          ['2', '641', 'Faf du Plessis', '16', '16'],
          ['3', '600', 'Ruturaj Gaikwad', '16', '16'],
        ],
      },
      {
        path: ['Individual Records (Bowling)', 'Most runs conceded in a match'],
        caption: 'Last updated: 1 June 2025',
        headers: ['Rank', 'Figures', 'Player', 'Overs', 'Opposition'],
        rows: [
          ['1', '65', 'Khaleel Ahmed', '4', 'Gujarat Titans'],
          ['2', '64', 'Mohit Sharma', '4', 'Kings XI Punjab'],
          ['3', '63', 'Dwayne Bravo', '4', 'Mumbai Indians'],
        ],
      },
    ]);

    // The team article exists but holds no leaderboard, exactly as CSK's does.
    const teamPage = article([
      {
        path: ['Statistics'],
        headers: ['Season', 'Position', 'Played'],
        rows: [['2024', '5th', '14']],
      },
    ]);

    const rankings = await providerFor({
      'Chennai Super Kings': teamPage,
      'List of Chennai Super Kings records': records,
    }).fetchCricketClubRankings('Chennai Super Kings', 'Chennai Super Kings');

    // Only the career table survives; the season and per-match tables are
    // rejected rather than published as career records.
    expect(rankings.map((ranking) => ranking.kind)).toEqual(['club_most_runs']);
    expect(rankings[0]?.entries[0]).toMatchObject({ name: 'MS Dhoni', value: 4865 });
  });

  it('reads a franchise wickets table headed "Most career wickets"', async () => {
    // One word, eleven teams. The club matcher tested for "most wickets" and a
    // franchise records article heads the table "Most career wickets", so every
    // side whose tables live in a records article published runs and no
    // wickets: Chennai Super Kings, Delhi Capitals, Punjab Kings and eight
    // others. The hauls and wicket-keeping decoys below share the word.
    const records = article([
      {
        path: ['Individual Records (Bowling)', 'Most career wickets'],
        caption: 'Last Updated: 1 June 2025',
        headers: ['Rank', 'Wickets', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '143', 'Ravindra Jadeja', '184', '166'],
          ['2', '133', 'Dwayne Bravo', '109', '108'],
          ['3', '99', 'Deepak Chahar', '77', '76'],
        ],
      },
      {
        path: ['Individual Records (Bowling)', 'Most four-wickets (& over) hauls in an innings'],
        headers: ['Rank', 'Four-wicket hauls', 'Player', 'Matches', 'Balls'],
        rows: [
          ['1', '4', 'Dwayne Bravo', '109', '2274'],
          ['2', '3', 'Deepak Chahar', '77', '1518'],
          ['3', '2', 'Ravindra Jadeja', '184', '2450'],
        ],
      },
      {
        path: ['Individual Records (Wicket-keeping)', 'Most career dismissals'],
        headers: ['Rank', 'Dismissals', 'Player', 'Matches', 'Innings'],
        rows: [
          ['1', '138', 'MS Dhoni', '229', '229'],
          ['2', '11', 'Robin Uthappa', '43', '43'],
          ['3', '4', 'Narayan Jagadeesan', '5', '5'],
        ],
      },
    ]);

    const rankings = await providerFor({
      'Chennai Super Kings': article([
        { path: ['Statistics'], headers: ['Season', 'Position'], rows: [['2024', '5th']] },
      ]),
      'List of Chennai Super Kings records': records,
    }).fetchCricketClubRankings('Chennai Super Kings', 'Chennai Super Kings');

    // Only the career wickets table. The hauls and dismissals tables both carry
    // "wickets" or a wicket-keeping metric and must not be mistaken for it.
    expect(rankings.map((ranking) => ranking.kind)).toEqual(['club_most_wickets']);
    expect(rankings[0]?.entries[0]).toMatchObject({ name: 'Ravindra Jadeja', value: 143 });
  });
});
