import { describe, expect, it } from 'vitest';
import { parseAllTimeRoster } from './wikipedia.parser';

/**
 * All-time roster parsing, against the real table shape.
 *
 * The fixture is the actual rendered structure of `{{NBA all-time roster}}`,
 * reduced to two players. Its two-row header is the whole reason this parser
 * exists: the first row carries five plain columns, a `Statistics` cell spanning
 * nine, and `Ref.`, so a parser that counts columns from the first row alone
 * slices every data row to seven and loses REB, AST and PTS.
 */
describe('parseAllTimeRoster', () => {
  const page = (rows: string) => `
<table class="wikitable">
  <tr>
    <th>Player</th><th>Pos.</th><th>Pre-draft team</th><th>Yrs</th><th>Seasons</th>
    <th colspan="9">Statistics</th><th>Ref.</th>
  </tr>
  <tr>
    <th>GP</th><th>MP</th><th>REB</th><th>AST</th><th>PTS</th>
    <th>MPG</th><th>RPG</th><th>APG</th><th>PPG</th>
  </tr>
  ${rows}
</table>`;

  const kareem = `
  <tr>
    <td><a href="./Kareem_Abdul-Jabbar">Kareem Abdul-Jabbar</a>^ (#33)</td>
    <td>C</td><td>UCLA</td><td>14</td><td>1975 – 1989</td>
    <td>1,093</td><td>37,492</td><td>10,279</td><td>3,652</td><td>24,176</td>
    <td>34.3</td><td>9.4</td><td>3.3</td><td>22.1</td><td></td>
  </tr>`;

  it('reads the totals from behind a spanning Statistics header', () => {
    const [row] = parseAllTimeRoster(page(kareem));
    // The three figures a naive seven-column slice drops.
    expect(row?.rebounds).toBe(10279);
    expect(row?.assists).toBe(3652);
    expect(row?.points).toBe(24176);
    expect(row?.games).toBe(1093);
  });

  it('strips the Hall of Fame caret and retired number from the name', () => {
    const [row] = parseAllTimeRoster(page(kareem));
    expect(row?.name).toBe('Kareem Abdul-Jabbar');
  });

  it('captures the player link so the row can resolve to a page we hold', () => {
    const [row] = parseAllTimeRoster(page(kareem));
    expect(row?.link).toBe('Kareem Abdul-Jabbar');
  });

  it('locates the statistic columns by name rather than by position', () => {
    // A franchise page carrying fewer statistic columns must still line up: the
    // offsets are read from the second header row, not assumed.
    const narrow = `
<table class="wikitable">
  <tr>
    <th>Player</th><th>Pos.</th><th>Yrs</th>
    <th colspan="3">Statistics</th>
  </tr>
  <tr><th>GP</th><th>PTS</th><th>PPG</th></tr>
  <tr>
    <td><a href="./Some_Player">Some Player</a></td><td>G</td><td>3</td>
    <td>200</td><td>4,000</td><td>20.0</td>
  </tr>
</table>`;
    const [row] = parseAllTimeRoster(narrow);
    expect(row?.points).toBe(4000);
    expect(row?.games).toBe(200);
    // Absent columns are null rather than mis-read from a neighbour.
    expect(row?.rebounds).toBeNull();
    expect(row?.assists).toBeNull();
  });

  it('returns nothing for a roster table with no statistics columns', () => {
    // A bare roster carries no totals (Player, Pos, No., Yrs, From, To), so
    // declining is correct: the team renders no table rather than a wrong one.
    const noStats = `
<table class="wikitable">
  <tr><th>Player</th><th>Pos</th><th>No.</th><th>Yrs</th><th>From</th><th>To</th></tr>
  <tr><td>Some Player</td><td>G</td><td>7</td><td>4</td><td>1990</td><td>1994</td></tr>
</table>`;
    expect(parseAllTimeRoster(noStats)).toEqual([]);
  });

  it('reads the statistics-leaders layout, keyed by its heading', () => {
    // Miami and Dallas carry no totals on the roster table at all. They publish
    // an h3 per metric whose columns are the uninformative "Rank | Player |
    // Points", so the heading is what identifies the metric.
    const leaders = `
<h2>Statistics leaders</h2>
<h3>Points</h3>
<table class="wikitable">
  <tr><th>Rank</th><th>Player</th><th>Points</th></tr>
  <tr><td>1</td><td><a href="./Dwyane_Wade">Dwyane Wade</a></td><td>21,566</td></tr>
</table>
<h3>Assists</h3>
<table class="wikitable">
  <tr><th>Rank</th><th>Player</th><th>Assists</th></tr>
  <tr><td>1</td><td><a href="./Dwyane_Wade">Dwyane Wade</a></td><td>5,310</td></tr>
</table>`;
    const rows = parseAllTimeRoster(leaders);
    expect(rows.find((row) => row.points)?.points).toBe(21566);
    expect(rows.find((row) => row.assists)?.assists).toBe(5310);
  });

  it('takes the regular-season table and skips the playoff one beneath it', () => {
    // Each heading holds two tables, regular season then playoffs. Reading both
    // would overwrite Wade's 21,566 regular-season points with 3,864 playoff
    // ones, and the note on these tables promises regular season.
    const both = `
<h3>Points</h3>
<table class="wikitable">
  <tr><th>Rank</th><th>Player</th><th>Points</th></tr>
  <tr><td>1</td><td><a href="./Dwyane_Wade">Dwyane Wade</a></td><td>21,566</td></tr>
</table>
<table class="wikitable">
  <tr><th>Rank</th><th>Player</th><th>Points</th></tr>
  <tr><td>1</td><td><a href="./Dwyane_Wade">Dwyane Wade</a></td><td>3,864</td></tr>
</table>`;
    const rows = parseAllTimeRoster(both);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.points).toBe(21566);
  });

  it('reads the narrow layout with Pts, Reb and Ast named directly', () => {
    // Charlotte's single table, with no spanning Statistics header.
    const narrow = `
<table class="wikitable">
  <tr>
    <th>Player</th><th>Nationality</th><th>Pos</th><th>From</th><th>To</th>
    <th>Pts</th><th>Reb</th><th>Ast</th>
  </tr>
  <tr>
    <td><a href="./Kemba_Walker">Kemba Walker</a></td><td>USA</td><td>G</td>
    <td>2011</td><td>2019</td><td>12,009</td><td>1,895</td><td>3,632</td>
  </tr>
</table>`;
    const [row] = parseAllTimeRoster(narrow);
    expect(row?.points).toBe(12009);
    expect(row?.rebounds).toBe(1895);
    expect(row?.assists).toBe(3632);
  });

  it('strips legend daggers and asterisks from a name', () => {
    // Charlotte marks players with a dagger; the article's own key explains it.
    const dagger = `
<table class="wikitable">
  <tr><th>Player</th><th>Pos</th><th>Pts</th></tr>
  <tr><td><a href="./Dell_Curry">Dell Curry</a> †</td><td>G</td><td>9,839</td></tr>
</table>`;
    expect(parseAllTimeRoster(dagger)[0]?.name).toBe('Dell Curry');
  });

  it('recovers a header polluted with injected CSS', () => {
    // Portland's template leaks raw style into the header cell, so "Statistics"
    // arrives with a CSS prelude. Unrecovered, the franchise yielded no tables.
    const polluted = `
<table class="wikitable">
  <tr>
    <th>Player</th><th>Pos.</th><th>Yrs</th>
    <th colspan="3">background-color: #E03A3E !important; }'>Statistics</th>
  </tr>
  <tr><th>GP</th><th>REB</th><th>PTS</th></tr>
  <tr>
    <td><a href="./Damian_Lillard">Damian Lillard</a></td><td>G</td><td>11</td>
    <td>769</td><td>3,225</td><td>19,376</td>
  </tr>
</table>`;
    const [row] = parseAllTimeRoster(polluted);
    expect(row?.points).toBe(19376);
    expect(row?.games).toBe(769);
  });

  it('reads every alphabetical section, not just the first', () => {
    const second = `
  <tr>
    <td><a href="./Magic_Johnson">Magic Johnson</a></td>
    <td>G</td><td>Michigan State</td><td>13</td><td>1979 – 1996</td>
    <td>906</td><td>33,245</td><td>6,559</td><td>10,141</td><td>17,707</td>
    <td>36.7</td><td>7.2</td><td>11.2</td><td>19.5</td><td></td>
  </tr>`;
    const rows = parseAllTimeRoster(page(kareem) + page(second));
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.name)).toEqual(['Kareem Abdul-Jabbar', 'Magic Johnson']);
  });
});
