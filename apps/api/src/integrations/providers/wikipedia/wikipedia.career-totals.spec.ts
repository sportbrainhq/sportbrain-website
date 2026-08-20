import { describe, expect, it } from 'vitest';
import type { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * The three headline career numbers, tested against the real article shapes.
 *
 * Every fixture below is trimmed from the live article it is named after, and
 * every case exists because it produced an empty tile on a player page. The
 * shapes are not variations on a theme: football writes its figures as infobox
 * table rows, tennis as one of three different templates, and Formula 1 puts
 * them in a template the wikitext never resolves at all.
 */
describe('WikipediaProvider.fetchCareerTotals', () => {
  const provider = (pages: { html?: string; wikitext?: string }) =>
    new WikipediaProvider({
      fetchHtml: async () => pages.html ?? null,
      fetchWikitext: async () => pages.wikitext ?? null,
    } as unknown as WikipediaClient);

  const infoboxRows = (rows: string[]) => `<table class="infobox vcard">${rows.join('')}</table>`;

  const row = (cells: string[]) => `<tr>${cells.map((cell) => `<td>${cell}</td>`).join('')}</tr>`;

  describe('football', () => {
    it('sums the senior club rows, there being no Total row to read', async () => {
      // Ronaldo's and Messi's infoboxes both end at the last club: Wikipedia
      // no longer prints a career total, so reading one returned nothing for
      // every footballer on the site.
      const html = infoboxRows([
        row(['2003–2009', 'Manchester United', '196', '(84)']),
        row(['2009–2018', 'Real Madrid', '292', '(311)']),
      ]);

      expect(await provider({ html }).fetchCareerTotals('X', 'football')).toEqual({
        games: 488,
        goals: 395,
      });
    });

    it('excludes youth rows, which carry no figures', async () => {
      const html = infoboxRows([
        row(['1997–2002', 'Sporting CP']),
        row(['2002–2003', 'Sporting CP', '25', '(3)']),
      ]);

      expect(await provider({ html }).fetchCareerTotals('X', 'football')).toEqual({
        games: 25,
        goals: 3,
      });
    });

    it('excludes reserve and B sides, whose figures are not senior ones', async () => {
      // Messi's Barcelona B and C rows carry real appearances and would
      // otherwise be added to his senior career.
      const html = infoboxRows([
        row(['2003–2004', 'Barcelona C', '10', '(5)']),
        row(['2004–2005', 'Barcelona B', '22', '(6)']),
        row(['2004–2021', 'Barcelona', '520', '(474)']),
      ]);

      expect(await provider({ html }).fetchCareerTotals('X', 'football')).toEqual({
        games: 520,
        goals: 474,
      });
    });

    it('reports null rather than zero when the article carries no career table', async () => {
      // A dash on the page means "not recorded" and a zero means zero. Writing
      // the first as the second makes the two indistinguishable afterwards.
      const totals = await provider({ html: '<p>No infobox here</p>' }).fetchCareerTotals(
        'X',
        'football',
      );

      expect(totals).toEqual({ games: null, goals: null });
    });
  });

  describe('tennis', () => {
    const titles = '|singlestitles = 103 ([[Open Era tennis records|2nd in the Open Era]])';

    it('reads the tennis record template, whose numbers are parameters', async () => {
      // Serena Williams. Template stripping leaves the cleaned field empty, so
      // reading the parsed infobox alone gave her no matches played.
      const wikitext = `{{Infobox tennis biography
|singlesrecord = {{tennis record|won=858|lost=156}}
${titles}
}}`;

      expect(await provider({ wikitext }).fetchCareerTotals('X', 'tennis')).toEqual({
        games: 1014,
        goals: 103,
      });
    });

    it('reads the win-loss-percentage template as well', async () => {
      // Djokovic's article uses a different template for the same fact.
      const wikitext = `{{Infobox tennis biography
|singlesrecord = {{tennis win loss percentage|dec=1|W=1177|L=239}}
|singlestitles = [[Novak Djokovic career statistics|101]] (3rd in the Open Era)
}}`;

      expect(await provider({ wikitext }).fetchCareerTotals('X', 'tennis')).toEqual({
        games: 1416,
        goals: 101,
      });
    });

    it('reads a plain record and strips the appended win percentage', async () => {
      const wikitext = `{{Infobox tennis biography
|singlesrecord = 1251–275 (82%)
${titles}
}}`;

      expect(await provider({ wikitext }).fetchCareerTotals('X', 'tennis')).toEqual({
        games: 1526,
        goals: 103,
      });
    });
  });

  describe('formula 1', () => {
    it('reads entries and wins from the rendered page, not the wikitext', async () => {
      // An F1 infobox writes `{{F1stat|HAM|entries}}`, resolved centrally when
      // the page renders. The wikitext contains no numbers at all: reading it
      // returned "( starts)" for every driver.
      const html = infoboxRows([
        row(['Entries', '391 (391 starts)']),
        row(['Wins', '106']),
        row(['Podiums', '207']),
      ]);

      expect(await provider({ html }).fetchCareerTotals('X', 'formula-1')).toEqual({
        games: 391,
        goals: 106,
      });
    });

    it('ignores the season-results table, where Wins is a column heading', async () => {
      // The career-results table repeats these words as headers, and a
      // positional read of it recorded a single season as a career.
      const html =
        infoboxRows([row(['Entries', '162']), row(['Wins', '41'])]) +
        '<table class="wikitable"><tr><td>Season</td><td>Races</td><td>Wins</td><td>1</td></tr></table>';

      expect(await provider({ html }).fetchCareerTotals('X', 'formula-1')).toEqual({
        games: 162,
        goals: 41,
      });
    });
  });

  it('returns nulls for a sport it has no mapping for', async () => {
    expect(await provider({ html: '' }).fetchCareerTotals('X', 'kabaddi')).toEqual({
      games: null,
      goals: null,
    });
  });
});
