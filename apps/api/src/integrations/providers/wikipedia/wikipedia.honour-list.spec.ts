import { describe, expect, it } from 'vitest';
import type { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Reading a player's honours from their article.
 *
 * Every case here was a wrong number on a live page. The section is prose-heavy
 * and its conventions are not consistent, so each fixture is trimmed from the
 * article named in the test.
 */
describe('WikipediaProvider.fetchFootballHonourList', () => {
  const provider = (html: string) =>
    new WikipediaProvider({
      fetchHtml: async () => html,
      fetchWikitext: async () => null,
    } as unknown as WikipediaClient);

  const section = (items: string[]) =>
    `<h2 id="Honours">Honours</h2><ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul><h2 id="References">References</h2>`;

  it('counts a win and ignores the nominations on the same line', async () => {
    // Lev Yashin. His page claimed ten Ballons d'Or against the one he won,
    // because the line appends every year he was nominated to the year he won
    // and the split only cut at runner-up clauses.
    const html = section([
      "Ballon d'Or Winner: 1963,<sup>[27]</sup> nominated: 1956, 1957, 1958, 1959, 1960, 1961, 1964, 1965, 1966",
    ]);

    const honours = await provider(html).fetchFootballHonourList('Lev Yashin');

    expect(honours).toEqual([{ title: "Ballon d'Or Winner", year: 1963 }]);
  });

  it('reads a season range as one win, not two', async () => {
    // Cristiano Ronaldo. Matching bare four-digit numbers counted both halves
    // of every range, so four European Golden Shoes became six rows and every
    // league title was inflated the same way.
    const html = section(['European Golden Shoe: 2007–08, 2010–11, 2013–14, 2014–15']);

    const honours = await provider(html).fetchFootballHonourList('Cristiano Ronaldo');

    expect(honours.map((honour) => honour.year)).toEqual([2007, 2010, 2013, 2014]);
  });

  it('keeps only the first name of an award recorded under several', async () => {
    // Articles join an award's historical names with slashes. Stored whole it is
    // one unrecognisable title that no prestige pattern matches.
    const html = section([
      "FIFA World Player of the Year/FIFA Ballon d'Or/The Best FIFA Men's Player: 2009",
    ]);

    const honours = await provider(html).fetchFootballHonourList('Lionel Messi');

    expect(honours).toEqual([{ title: 'FIFA World Player of the Year', year: 2009 }]);
  });

  it('drops the runner-up half of a line', async () => {
    const html = section(['FIFA World Cup: 1998; runner-up: 2006']);

    const honours = await provider(html).fetchFootballHonourList('Zinedine Zidane');

    expect(honours).toEqual([{ title: 'FIFA World Cup', year: 1998 }]);
  });

  it('ignores an image caption that names an award', async () => {
    // Rodri's article carries "Rodri winning the 2026 FIFA World Cup Golden
    // Ball" as a photo caption beside the section, which was read as won.
    const html =
      `<h2 id="Honours">Honours</h2>` +
      `<figure><figcaption>Rodri winning the 2026 FIFA World Cup Golden Ball</figcaption></figure>` +
      `<ul><li>UEFA Champions League: 2022–23</li></ul>`;

    const honours = await provider(html).fetchFootballHonourList('Rodri');

    expect(honours).toEqual([{ title: 'UEFA Champions League', year: 2022 }]);
  });

  it('ignores trivia written in the same list markup', async () => {
    const html = section([
      'One of only nine players to take part in five FIFA World Cups: 1998, 2002',
      'FIFA World Cup: 2002',
    ]);

    const honours = await provider(html).fetchFootballHonourList('Rafael Márquez');

    expect(honours).toEqual([{ title: 'FIFA World Cup', year: 2002 }]);
  });

  it('skips honours won as a manager', async () => {
    const html =
      `<h2 id="Honours">Honours</h2><h3>Player</h3><ul><li>La Liga: 1997–98</li></ul>` +
      `<h3>Manager</h3><ul><li>UEFA Champions League: 2016–17</li></ul>`;

    const honours = await provider(html).fetchFootballHonourList('Zinedine Zidane');

    expect(honours).toEqual([{ title: 'La Liga', year: 1997 }]);
  });

  it('rejects a year in the future', async () => {
    const future = new Date().getFullYear() + 3;
    const html = section([`FIFA World Cup: ${future}`]);

    const honours = await provider(html).fetchFootballHonourList('Someone');

    expect(honours).toEqual([]);
  });
});
