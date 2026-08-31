import { describe, expect, it } from 'vitest';
import { parseNbaChampions, parseNbaLeaderList, parseNbaSeasonList } from './wikipedia.parser';

/**
 * The NBA list-article parsers, against the real table shapes.
 *
 * Every fixture is the actual rendered structure of its article, reduced to a
 * couple of rows, so these encode findings rather than guesses.
 */
describe('parseNbaLeaderList', () => {
  const careerList = `
<table class="wikitable">
  <tr>
    <th>Rank</th><th>Player</th><th>Position(s)</th>
    <th>Team(s) played for (years)</th><th>Total steals</th><th>Games played</th>
  </tr>
  <tr>
    <td>1</td><td><a href="./John_Stockton">John Stockton</a>*</td><td>PG</td>
    <td>Utah Jazz (1984–2003)</td><td>3,265</td><td>1,504</td>
  </tr>
  <tr>
    <td>2</td><td><a href="./Chris_Paul">Chris Paul</a>†</td><td>PG</td>
    <td>New Orleans Hornets (2005–2011)</td><td>2,728</td><td>1,370</td>
  </tr>
</table>`;

  it('reads the named total rather than a fixed column', () => {
    // The columns after the total differ between these lists, so a positional
    // read took games played on one and points per game on another.
    const rows = parseNbaLeaderList(careerList, 'total steals', 10);
    expect(rows[0]).toMatchObject({ name: 'John Stockton', value: '3,265' });
  });

  it('captures the player link so the row resolves to a page we hold', () => {
    expect(parseNbaLeaderList(careerList, 'total steals', 10)[0]?.link).toBe('John Stockton');
  });

  it('strips the Hall of Fame and active-player markers from a name', () => {
    // Left in, the career leaders published "John Stockton*" and "Chris Paul†".
    const rows = parseNbaLeaderList(careerList, 'total steals', 10);
    expect(rows.map((row) => row.name)).toEqual(['John Stockton', 'Chris Paul']);
  });

  it('honours the row limit', () => {
    // The source lists run to fifty and the page wants ten.
    expect(parseNbaLeaderList(careerList, 'total steals', 1)).toHaveLength(1);
  });

  it('returns nothing when no table carries the named total', () => {
    expect(parseNbaLeaderList(careerList, 'total blocks', 10)).toEqual([]);
  });
});

describe('parseNbaSeasonList', () => {
  const seasonList = `
<table class="wikitable">
  <tr><th>Season</th><th>Player</th><th>Team</th></tr>
  <tr>
    <td>1946–47</td><td><a href="./Joe_Fulks">Joe Fulks</a>*</td>
    <td>Philadelphia Warriors</td>
  </tr>
  <tr>
    <td>1947–48</td><td><a href="./Max_Zaslofsky">Max Zaslofsky</a></td>
    <td>Chicago Stags</td>
  </tr>
  <tr>
    <td>2025–26</td><td><a href="./Luka_Doncic">Luka Dončić</a></td>
    <td>Los Angeles Lakers</td>
  </tr>
</table>`;

  it('dates a season by its end year', () => {
    // The convention the rest of the catalogue uses: the 2007-08 MVP is 2008.
    // Getting it wrong once published Kobe Bryant as the 2006 MVP.
    const rows = parseNbaSeasonList(seasonList, 100);
    expect(rows.find((row) => row.name === 'Joe Fulks')?.value).toBe('1947');
  });

  it('handles a season crossing a century', () => {
    expect(parseNbaSeasonList(seasonList, 100)[0]).toMatchObject({ value: '2026' });
  });

  it('reverses the article order so the newest leads', () => {
    // These articles run oldest first and a roll of honour reads newest first.
    expect(parseNbaSeasonList(seasonList, 100).map((row) => row.name)).toEqual([
      'Luka Dončić',
      'Max Zaslofsky',
      'Joe Fulks',
    ]);
  });

  it('drops a leaked citation template from a name', () => {
    // The renderer leaves the raw template in a minority of cells, which is how
    // a scoring-title row arrived as "Max Zaslofsky<ref>{{cite web ...}}</ref>".
    const messy = `
<table class="wikitable">
  <tr><th>Season</th><th>Player</th></tr>
  <tr><td>1947–48</td><td>Max Zaslofsky&lt;ref&gt;{{cite web |url=http://x}}&lt;/ref&gt;[e]</td></tr>
</table>`;
    expect(parseNbaSeasonList(messy, 10)[0]?.name).toBe('Max Zaslofsky');
  });
});

describe('parseNbaChampions', () => {
  // One row per final, with the two conference champions either side of the
  // series score. Neither team column is the champion on its own.
  const champions = `
<table class="wikitable">
  <tr>
    <th>Year</th><th>Western champion</th><th>Coach</th><th>Result</th>
    <th>Eastern champion</th><th>Coach</th>
  </tr>
  <tr>
    <td><a href="./1947_BAA_Finals">1947</a></td>
    <td><a href="./1946–47_Chicago_Stags_season">Chicago Stags</a> (1) (1, 0–1)</td>
    <td>Harold Olsen</td><td>1–4</td>
    <td><a href="./1946–47_Philadelphia_Warriors_season">Philadelphia Warriors</a> (2)</td>
    <td>Eddie Gottlieb</td>
  </tr>
  <tr>
    <td><a href="./2021_NBA_Finals">2021</a></td>
    <td><a href="./2020–21_Phoenix_Suns_season">Phoenix Suns</a> (1)</td>
    <td>Monty Williams</td><td>2–4</td>
    <td><a href="./2020–21_Milwaukee_Bucks_season">Milwaukee Bucks</a> (3)</td>
    <td>Mike Budenholzer</td>
  </tr>
</table>`;

  it('picks the winner from the series score', () => {
    // "1–4" means the eastern side won. Taking either column outright would
    // publish the losing finalist for roughly half of NBA history.
    const rows = parseNbaChampions(champions, 100);
    expect(rows.map((row) => `${row.value} ${row.name}`)).toEqual([
      '2021 Milwaukee Bucks',
      '1947 Philadelphia Warriors',
    ]);
  });

  it('recovers the club from the season article it links to', () => {
    // The name cell links to "2020–21 Milwaukee Bucks season", and only the
    // club resolves against the team catalogue.
    expect(parseNbaChampions(champions, 100)[0]?.link).toBe('Milwaukee Bucks');
  });

  it('strips the appearance and win-loss counts from the name', () => {
    expect(parseNbaChampions(champions, 100)[1]?.name).toBe('Philadelphia Warriors');
  });

  it('returns nothing for a table without the expected columns', () => {
    const other = `
<table class="wikitable">
  <tr><th>Team</th><th>Wins</th></tr>
  <tr><td>Boston Celtics</td><td>18</td></tr>
</table>`;
    expect(parseNbaChampions(other, 10)).toEqual([]);
  });
});
