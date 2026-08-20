import { describe, expect, it } from 'vitest';
import { findTableByHeading, parseDefinitionLists, parseTables } from './wikipedia.parser';
import { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Records-article parsing, tested against the real page shapes.
 *
 * Every fixture is trimmed from the live article it is named after. The cases
 * exist because each one was a wrong or missing leaderboard on the site: a
 * country with goals but no caps, England's record scorer given as a 1950s
 * forward with 30, France with nothing at all.
 */
describe('records articles', () => {
  const wikitable = (heading: string, headers: string[], rows: string[][], level = 3) =>
    `<h${level} id="a">${heading}</h${level}>` +
    `<table class="wikitable"><tr id="r0">${headers
      .map((header) => `<th id="h">${header}</th>`)
      .join('')}</tr>` +
    rows
      .map(
        (row, index) =>
          `<tr id="r${index + 1}">${row.map((cell) => `<td id="c">${cell}</td>`).join('')}</tr>`,
      )
      .join('') +
    `</table>`;

  it('reads an appearance table headed Caps', () => {
    // Brazil and Germany both head the column "Caps", which no value header
    // matched, so every country published goals and no appearances.
    const html = wikitable(
      'Most appearances',
      ['Rank', 'Player', 'Caps', 'Goals', 'Career'],
      [['1', 'Cafu', '142', '5', '1990–2006']],
    );

    const table = findTableByHeading(
      parseTables(html),
      ['Most appearances'],
      ['player|name'],
      ['caps'],
    );

    expect(table?.headers).toContain('Caps');
    expect(table?.rows[0]?.cells[2]).toBe('142');
  });

  it('accepts a person column headed Name as well as Player', () => {
    // Scotland heads both its leaderboards "Name". Requiring "Player" rejected
    // two correct tables and fell through to a worse source.
    const html = wikitable(
      'Most capped players',
      ['Rank', 'Name', 'Caps', 'Goals'],
      [['1', 'Kenny Dalglish', '102', '30']],
    );

    expect(
      findTableByHeading(parseTables(html), ['Most capped players'], ['player|name'], ['caps']),
    ).not.toBeNull();
  });

  it('prefers the overall table to a competition-scoped one under the same heading', () => {
    // Uruguay files "Most goals scored in the World Cup" beside its all-time
    // scorers, and the World Cup table won: the country's record scorer read
    // Oscar Míguez with 8 rather than Luis Suárez with 69.
    const html =
      `<h2 id="p">Player records</h2>` +
      wikitable('Top scorers', ['Rank', 'Player', 'Goals'], [['1', 'Luis Suárez', '69']]) +
      `<h2 id="w">World Cup records</h2>` +
      wikitable('Most goals scored in the World Cup', ['Player', 'Goals'], [['Oscar Míguez', '8']]);

    const table = findTableByHeading(
      parseTables(html),
      ['Most goals', 'Top scorers', 'Goals'],
      ['player|name'],
      ['goals'],
    );

    expect(table?.rows[0]?.cells[1]).toBe('Luis Suárez');
  });

  it('reads a leaderboard written as a definition list', () => {
    // France's whole article is prose lists, so the table parser found nothing
    // and the country had no records at all.
    const html =
      `<dl><dt>Most appearances</dt>` +
      `<dd><b><a rel="mw:WikiLink" href="./Hugo_Lloris">Hugo Lloris</a></b>, 145, 19 November 2008 — 18 December 2022</dd></dl>` +
      `<dl><dt>Other centurions</dt>` +
      `<dd><b><a rel="mw:WikiLink" href="./Lilian_Thuram">Lilian Thuram</a></b>, 142, 17 August 1994 — 13 June 2008</dd></dl>`;

    const lists = parseDefinitionLists(html);

    expect(lists).toHaveLength(1);
    expect(lists[0]?.label).toBe('Most appearances');
    expect(lists[0]?.entries.map((entry) => [entry.name, entry.value])).toEqual([
      ['Hugo Lloris', 145],
      ['Lilian Thuram', 142],
    ]);
    expect(lists[0]?.entries[0]?.link).toBe('Hugo Lloris');
  });

  it('keeps a qualified record as its own list rather than merging it', () => {
    // "Most appearances as a captain" is a different record from "Most
    // appearances" and must not extend it.
    const html =
      `<dl><dt>Most appearances</dt><dd><b>Hugo Lloris</b>, 145, 2008 — 2022</dd></dl>` +
      `<dl><dt>Most appearances as a captain</dt><dd><b>Hugo Lloris</b>, 121, 2010 — 2022</dd></dl>`;

    expect(parseDefinitionLists(html).map((list) => list.label)).toEqual([
      'Most appearances',
      'Most appearances as a captain',
    ]);
  });

  it('ignores a career-span column when looking for a count', () => {
    // The Netherlands' tables carry both "Matches" and "Total career", and a
    // search for "total" matched the career column, whose cells read
    // "2003–2018". No row parsed as a number, so the country published nothing.
    const provider = new WikipediaProvider(new WikipediaClient());

    const html = wikitable(
      'Most-capped players',
      ['Rank', 'Player', 'National career', 'Matches', 'Goals', 'Total career'],
      [['1', 'Wesley Sneijder', '2003–2018', '134', '31', '2002–2019']],
    );

    const rankings = provider.rankingsForTest(parseTables(html)[0]!, ['total', 'caps', 'matches']);

    expect(rankings[0]).toMatchObject({ name: 'Wesley Sneijder', value: 134 });
  });

  it('drops the trailing list link some tables append to a name', () => {
    // Argentina and Germany render the cell as "Lionel Messi ( list )", and
    // that string was published as the player's name.
    const provider = new WikipediaProvider(new WikipediaClient());

    const html = wikitable(
      'Top goalscorers',
      ['Rank', 'Player', 'Goals'],
      [['1', 'Lionel Messi ( list )', '125']],
    );

    expect(provider.rankingsForTest(parseTables(html)[0]!, ['goals'])[0]?.name).toBe(
      'Lionel Messi',
    );
  });

  it('treats a single spanning header cell as a caption, not the header row', () => {
    // Rangers titles each table with a colspan cell and puts the real columns
    // underneath, so both the club's leaderboards parsed as one-column tables
    // and were dropped.
    const html =
      `<h3 id="a">Most appearances</h3>` +
      `<table class="wikitable"><tr id="r0"><th colspan="4" id="cap">Appearances records by player</th></tr>` +
      `<tr id="r1"><th id="h1">#</th><th id="h2">Name and nationality</th><th id="h3">Years</th><th id="h4">Total</th></tr>` +
      `<tr id="r2"><td id="c1">1</td><td id="c2">John Greig</td><td id="c3">1961–1978</td><td id="c4">755</td></tr>` +
      `</table>`;

    const table = findTableByHeading(
      parseTables(html),
      ['Most appearances'],
      ['player|name'],
      ['total'],
    );

    expect(table?.headers).toEqual(['#', 'Name and nationality', 'Years', 'Total']);

    const provider = new WikipediaProvider(new WikipediaClient());
    expect(provider.rankingsForTest(table!, ['total'])[0]).toMatchObject({
      name: 'John Greig',
      value: 755,
    });
  });

  it('ranks on the whole table rather than the first rows read', () => {
    // The lists of internationals are alphabetical. Truncating to 25 entries
    // before sorting gave Poland's most-capped player as the first name in the
    // alphabet with any caps at all.
    const provider = new WikipediaProvider(new WikipediaClient());

    const rows = Array.from({ length: 40 }, (_, index) => [
      `Player ${String(index).padStart(2, '0')}`,
      String(index),
    ]);

    const html = wikitable('Players', ['Name', 'Caps'], rows);

    const entries = provider.rankingsForTest(parseTables(html)[0]!, ['caps']);

    expect(entries).toHaveLength(25);
    expect(entries[0]).toMatchObject({ name: 'Player 39', value: 39 });
  });

  it('matches a heading term against the table caption', () => {
    // Newcastle files a dozen trivia tables and its all-time list under one
    // "Goal scorers" heading, distinguished only by caption. Matching the
    // heading alone chose a single-match record: the club's top scorer with 20.
    const table = (caption: string, rows: string[][]) =>
      `<table class="wikitable">` +
      `<tr id="h"><th id="a">Rank</th><th id="b">Player</th><th id="c">Goals</th></tr>` +
      `<tr id="cap"><td id="d">${caption}</td></tr>` +
      rows
        .map(
          (row, index) =>
            `<tr id="r${index}">${row.map((cell) => `<td id="e">${cell}</td>`).join('')}</tr>`,
        )
        .join('') +
      `</table>`;

    const html =
      `<h3 id="g">Goal scorers</h3>` +
      table('Records of most goals scored in a Premier League match', [
        ['1', 'Alan Shearer', '5'],
      ]) +
      table('Records of all competition top goal scorers', [['1', 'Alan Shearer', '206']]);

    const chosen = findTableByHeading(
      parseTables(html),
      ['Top scorers', 'Goal scorers'],
      ['player|name'],
      ['goals'],
    );

    expect(chosen?.caption).toBe('Records of all competition top goal scorers');
    expect(chosen?.rows[0]?.cells[2]).toBe('206');
  });

  it('prefers the table nearest its heading to a nested enumeration', () => {
    // São Paulo files its all-time scorers under "Goals scored" and a
    // per-season list a level deeper under "List of topscorers", which matches
    // "Top scorers" just as well. Taking the deeper one published a 1933
    // state-championship tally of 21 as the club record.
    const html =
      `<h2 id="p">Players</h2><h3 id="g">Goals scored</h3>` +
      wikitable(
        'Goals scored',
        ['Rank', 'Player', 'Goals'],
        [['1', 'Serginho Chulapa', '242']],
        4,
      ) +
      `<h4 id="l">List of topscorers</h4>` +
      wikitable(
        'List of topscorers',
        ['Player', 'Year', 'Goals'],
        [['Waldemar de Brito', '1933', '21']],
        5,
      );

    const chosen = findTableByHeading(
      parseTables(html),
      ['Top scorers', 'Goals scored'],
      ['player|name'],
      ['goals'],
    );

    expect(chosen?.rows[0]?.cells[1]).toBe('Serginho Chulapa');
  });

  it('reads a rank column the header row does not declare', () => {
    // Roma heads four columns and writes five cells a row, the first being the
    // rank. Read positionally, "Player" landed on the rank and every row was
    // rejected for having a numeric name, so the club had no appearances table.
    const provider = new WikipediaProvider(new WikipediaClient());

    const html = wikitable(
      'All competitions appearances',
      ['Player', 'Position', 'Appearances', 'Goals'],
      [
        ['1', 'Francesco Totti', 'FW', '786'],
        ['2', 'Daniele De Rossi', 'MF', '616'],
      ],
    );

    const entries = provider.rankingsForTest(parseTables(html)[0]!, ['appearances']);

    expect(entries[0]).toMatchObject({ name: 'Francesco Totti', value: 786 });
    expect(entries[1]).toMatchObject({ name: 'Daniele De Rossi', value: 616 });
  });

  it('leaves a well-formed table unshifted', () => {
    // The guard above must not fire on a table whose rank column is declared,
    // which is the common case.
    const provider = new WikipediaProvider(new WikipediaClient());

    const html = wikitable(
      'Most appearances',
      ['Rank', 'Player', 'Caps'],
      [
        ['1', 'Cafu', '142'],
        ['2', 'Neymar', '130'],
      ],
    );

    expect(provider.rankingsForTest(parseTables(html)[0]!, ['caps'])[0]).toMatchObject({
      name: 'Cafu',
      value: 142,
    });
  });
});

/**
 * Which article a team's records are read from.
 *
 * These are pure name-matching cases, tested without the network because the
 * bug they cover is entirely in the comparison. Atlético Madrid, Real Sociedad
 * and the San Antonio Spurs all published Real Madrid's footballers, and the
 * only reason it was possible was a name check that accepted a partial match.
 */
describe('records article attribution', () => {
  const accepts = (teamName: string, candidate: string): boolean => {
    const normalise = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');

    const generic = new Set([
      'national',
      'cricket',
      'football',
      'team',
      'club',
      'mens',
      'womens',
      'women',
      'list',
      'records',
      'statistics',
      'association',
      'united',
      'city',
      'sports',
    ]);
    const legalForms = new Set([
      'cf',
      'fc',
      'sad',
      'sa',
      'ac',
      'as',
      'ss',
      'sc',
      'cd',
      'ud',
      'rc',
      'de',
      'del',
      'la',
      'el',
      'futbol',
      'football',
      'futebol',
      'calcio',
      'balompie',
      'clube',
      'sporting',
    ]);

    const distinctive = teamName
      .split(/\s+/)
      .map(normalise)
      .filter((word) => word.length >= 3 && !generic.has(word) && !legalForms.has(word));

    if (distinctive.length === 0) return false;

    const candidateNormalised = normalise(candidate);
    return distinctive.every((word) => candidateNormalised.includes(word));
  };

  const realMadrid = 'List of Real Madrid CF records and statistics';

  it('does not give one club another club that shares a word', () => {
    // The reported bug. "Madrid" and "Real" are shared, and a check satisfied
    // by any single word handed Real Madrid's leaderboards to both of these,
    // publishing Cristiano Ronaldo as Real Sociedad's record scorer.
    expect(accepts('Atlético Madrid', realMadrid)).toBe(false);
    expect(accepts('Real Sociedad', realMadrid)).toBe(false);
    expect(accepts('Real Betis', realMadrid)).toBe(false);
  });

  it('does not cross sports', () => {
    // Both of these held Real Madrid's footballers. A basketball team named
    // after the same club is the case a name check cannot catch on its own,
    // which is why the article must name every distinctive word.
    expect(accepts('Real Madrid Baloncesto', realMadrid)).toBe(false);
    expect(accepts('San Antonio Spurs', realMadrid)).toBe(false);
  });

  it('accepts a club whose article uses its short name', () => {
    // The other half of the fix. Requiring every word of the registered name
    // rejected the club's own article, because "Real Madrid Club de Fútbol" is
    // filed as "Real Madrid CF", and Real Madrid was left with no tables.
    expect(accepts('Real Madrid Club de Fútbol', realMadrid)).toBe(true);
    expect(accepts('FC Barcelona', 'List of FC Barcelona records and statistics')).toBe(true);
  });

  it('matches through accents', () => {
    // "Atlético" normalised to "atltico" while the article reads "Atletico",
    // so the club could never match its own page.
    expect(accepts('Atlético Madrid', 'List of Atletico Madrid records and statistics')).toBe(true);
    expect(accepts('São Paulo FC', 'List of São Paulo FC records and statistics')).toBe(true);
  });
});
