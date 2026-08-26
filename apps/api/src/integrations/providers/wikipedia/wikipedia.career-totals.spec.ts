import { describe, expect, it } from 'vitest';
import type { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Footballers' headline career numbers, tested against the real article shapes.
 *
 * Every fixture below is trimmed from the live article it is named after, and
 * every case exists because it produced a wrong or empty tile on a player page.
 */
describe('WikipediaProvider.fetchFootballCareerTotals', () => {
  const provider = (html: string | null) =>
    new WikipediaProvider({
      fetchHtml: async () => html,
      fetchWikitext: async () => null,
    } as unknown as WikipediaClient);

  const infoboxRows = (rows: string[]) => `<table class="infobox vcard">${rows.join('')}</table>`;

  const row = (cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;

  it('sums the senior club rows, there being no Total row to read', async () => {
    // Ronaldo's and Messi's infoboxes both end at the last club: Wikipedia no
    // longer prints a career total, so reading one returned nothing at all.
    const html = infoboxRows([
      row(['2003\u20132009', 'Manchester United', '196', '(84)']),
      row(['2009\u20132018', 'Real Madrid', '292', '(311)']),
    ]);

    expect(await provider(html).fetchFootballCareerTotals('X')).toEqual({
      games: 488,
      goals: 395,
    });
  });

  it('excludes youth rows, which carry no figures', async () => {
    const html = infoboxRows([
      row(['1997\u20132002', 'Sporting CP']),
      row(['2002\u20132003', 'Sporting CP', '25', '(3)']),
    ]);

    expect(await provider(html).fetchFootballCareerTotals('X')).toEqual({ games: 25, goals: 3 });
  });

  it('excludes reserve and B sides, whose figures are not senior ones', async () => {
    // Messi's Barcelona B and C rows carry real appearances and would otherwise
    // be added to his senior career.
    const html = infoboxRows([
      row(['2003\u20132004', 'Barcelona C', '10', '(5)']),
      row(['2004\u20132005', 'Barcelona B', '22', '(6)']),
      row(['2004\u20132021', 'Barcelona', '520', '(474)']),
    ]);

    expect(await provider(html).fetchFootballCareerTotals('X')).toEqual({
      games: 520,
      goals: 474,
    });
  });

  it('reports null rather than zero when the article carries no career table', async () => {
    // A dash on the page means "not recorded" and a zero means zero. Writing
    // the first as the second makes the two indistinguishable afterwards.
    const totals = await provider('<p>No infobox here</p>').fetchFootballCareerTotals('X');

    expect(totals).toEqual({ games: null, goals: null });
  });
});

/**
 * Trophy counting, tested against the group shapes the real articles use.
 *
 * Each case is a count that was wrong on the site: zero for half the great
 * players, then a wildly inflated figure once the section was read at all.
 */
describe('WikipediaProvider.fetchFootballHonours', () => {
  const provider = (html: string) =>
    new WikipediaProvider({
      fetchHtml: async () => html,
      fetchWikitext: async () => null,
    } as unknown as WikipediaClient);

  const honours = (body: string) => `<h2 id="Honours">Honours</h2>${body}<h2 id="See_also">x</h2>`;

  const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;

  it('counts each winning year, not each line', async () => {
    // "Serie A: 1996–97, 1997–98" is two league titles, and counting lines
    // reported one.
    const html = honours(`<p>Juventus</p>${list(['Serie A: 1996–97, 1997–98'])}`);

    expect(await provider(html).fetchFootballHonours('X')).toEqual({ won: 2, groups: 1 });
  });

  it('does not count runner-up years', async () => {
    // Zidane lost two Champions League finals with Juventus, which the section
    // records on a line of its own.
    const html = honours(
      `<p>Juventus</p>${list([
        'Serie A: 1996–97',
        'UEFA Champions League runner-up: 1996–97, 1997–98',
      ])}`,
    );

    expect(await provider(html).fetchFootballHonours('X')).toEqual({ won: 1, groups: 1 });
  });

  it('counts the winning half of a line that carries both', async () => {
    // "FIFA World Cup: 1998; runner-up: 2006" is one win and one final lost.
    const html = honours(`<p>France</p>${list(['FIFA World Cup: 1998; runner-up: 2006'])}`);

    expect(await provider(html).fetchFootballHonours('X')).toEqual({ won: 1, groups: 1 });
  });

  it('excludes the individual and records groups', async () => {
    // The records group is the worst offender: its numbers are appearance
    // counts, and Casillas totalled 69 "trophies" with them included.
    const html = honours(
      `<p>Real Madrid</p>${list(['La Liga: 2000–01'])}` +
        `<p>Individual</p>${list(['Bravo Award: 2000'])}` +
        `<p>Records</p>${list(['Second-most appearances in the UEFA Champions League: 177'])}`,
    );

    expect(await provider(html).fetchFootballHonours('X')).toEqual({ won: 1, groups: 1 });
  });

  it('excludes a managerial section and everything nested under it', async () => {
    // Guardiola's managerial honours sit under an h3 whose own club labels
    // re-enabled counting, crediting a player with 59 trophies won as a coach.
    const html = honours(
      `<h3>Player</h3><p>Barcelona</p>${list(['La Liga: 1990–91'])}` +
        `<h3>Manager</h3><p>Barcelona</p>${list(['La Liga: 2008–09, 2009–10, 2010–11'])}` +
        `<p>Manchester City</p>${list(['Premier League: 2017–18'])}`,
    );

    expect(await provider(html).fetchFootballHonours('X')).toEqual({ won: 1, groups: 2 });
  });

  it('reports a null count when the article has no honours section', async () => {
    expect(await provider('<p>Nothing here</p>').fetchFootballHonours('X')).toEqual({
      won: null,
      groups: 0,
    });
  });
});

/**
 * Club title counting, tested against the real honours-table shape.
 *
 * A club states its honours as a table rather than the bulleted list a player
 * uses, which is why it needs a reader of its own: pointing the player reader
 * at a club page returned nothing at all.
 */
describe('WikipediaProvider.fetchClubTitles', () => {
  const provider = (html: string) =>
    new WikipediaProvider({
      fetchHtml: async () => html,
      fetchWikitext: async () => null,
    } as unknown as WikipediaClient);

  const table = (rows: string[][]) =>
    `<h2 id="Honours">Honours</h2><table>` +
    `<tr><th>Type</th><th>Competition</th><th>Titles</th><th>Seasons</th></tr>` +
    rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('') +
    `</table><h2 id="References">x</h2>`;

  it('sums the titles column', async () => {
    const html = table([
      ['Domestic', 'Premier League', '20', '1900–01'],
      ['FA Cup', '8', '1964–65'],
    ]);

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 28, competitions: 2 });
  });

  it('carries the type down the rows that omit it', async () => {
    // The type is written once, in the first row of its group. Read per row it
    // vanishes, and the regional exclusion below stops working.
    const html = table([
      ['Continental', 'European Cup', '6', '1976–77'],
      ['UEFA Super Cup', '4', '1977'],
      ['Regional', 'Lancashire Cup', '10', '1892–93'],
      ['Manchester Cup', '5', '1893–94'],
    ]);

    // Only the continental rows count: the regional type persists onto the
    // fourth row and excludes it too.
    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 10, competitions: 2 });
  });

  it('excludes regional and friendly trophies', async () => {
    // Real Madrid lists 27 of these, which no published tally of its honours
    // includes; counting them produced a total matching nothing.
    const html = table([
      ['Domestic', 'La Liga', '36', '1931–32'],
      ['Regional', 'Campeonato Regional Centro', '23', '1902'],
    ]);

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 36, competitions: 1 });
  });

  const bullets = (items: string[]) =>
    `<h2 id="Honours">Honours</h2><ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>` +
    `<h2 id="References">x</h2>`;

  it('reads the list layout, taking the bracketed count', async () => {
    // Roma, Tottenham and Lazio state their honours as a list rather than a
    // table, and a table-only reader skipped 67 of the first 150 clubs.
    const html = bullets([
      'Serie A Winners (3): 1941–42, 1982–83, 2000–01',
      'Runners-up: (14): 1930–31, 1935–36',
      'Coppa Italia Winners (9): 1963–64',
    ]);

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 12, competitions: 2 });
  });

  it('counts the years where the list states no figure', async () => {
    // Newcastle writes "FA Cup Winners: 1909–10, 1923–24, ..." with no count at
    // all, and a reader demanding brackets scored the club zero.
    const html = bullets([
      'FA Cup Winners: 1909–10, 1923–24, 1931–32',
      'Runners-up: 1904–05, 1905–06',
    ]);

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 3, competitions: 1 });
  });

  it('prefers a table over a list on a page carrying both', async () => {
    // The table is the authoritative summary where it exists; counting both
    // would double every title on the page.
    const html =
      `<h2 id="Honours">Honours</h2><table>` +
      `<tr><th>Type</th><th>Competition</th><th>Titles</th></tr>` +
      `<tr><td>Domestic</td><td>La Liga</td><td>36</td></tr></table>` +
      `<ul><li>La Liga Winners (36): 1931–32</li></ul><h2 id="x">x</h2>`;

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 36, competitions: 1 });
  });

  it('ignores a European-record table that follows the honours heading', async () => {
    // Leverkusen's Honours section is followed by a matches-played table, and
    // summing its Won column credited the club with 534 titles.
    const html =
      `<h2 id="Honours">Honours</h2><table>` +
      `<tr><th>Competition</th><th>Pld</th><th>W</th><th>D</th></tr>` +
      `<tr><td>UEFA Champions League</td><td>120</td><td>45</td><td>27</td></tr>` +
      `<tr><td>Total</td><td>267</td><td>121</td><td>60</td></tr>` +
      `</table><h2 id="References">x</h2>`;

    // No competitions counted, which is what the ingestion pass keys on: a
    // zero it cannot corroborate is never written.
    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 0, competitions: 0 });
  });

  it('excludes invitational trophies named on the line itself', async () => {
    // Celta Vigo lists its pre-season trophies as plain honours lines, which
    // took the club to 83 titles, more than Bayern. A summer friendly is not a
    // title, and no group label marks these as friendlies.
    const html = bullets([
      'Segunda División Winners: 1935–36, 1981–82',
      'Trofeo Cidade de Vigo Winners (21): 1972, 1973',
      'Trofeo Memorial Quinocho Winners (21): 1995, 1996',
    ]);

    expect(await provider(html).fetchClubTitles('X')).toEqual({ titles: 2, competitions: 1 });
  });

  it('reports a null count when the article has no honours section', async () => {
    expect(await provider('<p>Nothing here</p>').fetchClubTitles('X')).toEqual({
      titles: null,
      competitions: 0,
    });
  });
});
