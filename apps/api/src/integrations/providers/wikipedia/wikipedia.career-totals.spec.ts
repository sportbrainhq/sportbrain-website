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
