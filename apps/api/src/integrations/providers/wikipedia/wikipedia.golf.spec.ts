import { describe, expect, it } from 'vitest';
import { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Golf career parsing, tested against the real infobox shapes.
 *
 * Every fixture is trimmed from the live article it is named after, and each
 * case exists because it is a way the parse can go wrong on real data rather
 * than a hypothetical.
 *
 * The whole feature rests on one distinction: `'''Won''': [[1997 Masters
 * Tournament|1997]]` is a major and `T2: 2019` is a good week. `Infobox golfer`
 * states a player's result at every major in the same field whether they won it
 * or missed the cut, so a test that only covered champions would pass while
 * crediting every runner-up with a green jacket.
 */
describe('golf careers', () => {
  const provider = (wikitext: string) => {
    const client = { fetchWikitext: async () => wikitext } as unknown as WikipediaClient;
    return new WikipediaProvider(client);
  };

  const box = (fields: Record<string, string>) =>
    `{{Infobox golfer\n${Object.entries(fields)
      .map(([key, value]) => `| ${key} = ${value}`)
      .join('\n')}\n}}\n\nBody text.`;

  it('counts majors from a Won field and the years beside it', async () => {
    const career = await provider(
      box({
        masters: "'''Won''': [[1997 Masters Tournament|1997]], [[2001 Masters Tournament|2001]]",
      }),
    ).fetchGolfCareer('Player');

    expect(career?.majors).toEqual([
      { slug: 'masters-tournament', name: 'Masters Tournament', year: 1997, tour: 'mens' },
      { slug: 'masters-tournament', name: 'Masters Tournament', year: 2001, tour: 'mens' },
    ]);
  });

  /**
   * The case the feature exists to get right.
   *
   * A runner-up's field carries the same years as a champion's and differs only
   * in the leading token. Reading years without checking it would have given
   * Lydia Ko a Women's PGA Championship she finished second in.
   */
  it('ignores a placing that is not a win', async () => {
    const career = await provider(
      box({
        lpga: "2nd: [[2016 KPMG Women's PGA Championship|2016]]",
        wusopen: "T3: [[2016 U.S. Women's Open|2016]]",
        open: 'DNP',
        pga: 'CUT',
      }),
    ).fetchGolfCareer('Player');

    expect(career?.majors).toEqual([]);
  });

  /**
   * Years come from the wikilinks rather than from the whole string, so a
   * footnote or a parenthetical cannot become an extra championship. Tiger
   * Woods's `prowins` carries an `efn` with several years in it.
   */
  it('does not read a footnote year as a win', async () => {
    const career = await provider(
      box({
        open: "'''Won''': [[2000 Open Championship|2000]]{{efn|He also led after 36 holes in 1998.}}",
      }),
    ).fetchGolfCareer('Player');

    expect(career?.majors.map((major) => major.year)).toEqual([2000]);
  });

  /** Older articles write the years plainly, with no links to read. */
  it('reads unlinked years when the field has no wikilinks', async () => {
    const career = await provider(
      box({ usopen: "'''Won''': 1962, 1967, 1972, 1980" }),
    ).fetchGolfCareer('Player');

    expect(career?.majors.map((major) => major.year)).toEqual([1962, 1967, 1972, 1980]);
  });

  /**
   * The women's fields carry the template's historical parameter names, so an
   * article written today and one written in 2004 both have to parse.
   */
  it('reads the women’s majors under their template parameter names', async () => {
    const career = await provider(
      box({
        nabisco: "'''Won''': [[2001 Nabisco Championship|2001]]",
        evian: "'''Won''': [[2015 Evian Championship|2015]]",
      }),
    ).fetchGolfCareer('Player');

    expect(career?.majors).toEqual([
      {
        slug: 'chevron-championship',
        name: 'The Chevron Championship',
        year: 2001,
        tour: 'womens',
      },
      { slug: 'evian-championship', name: 'The Evian Championship', year: 2015, tour: 'womens' },
    ]);
  });

  /**
   * A discontinued major is still a major. It is recorded with no competition
   * slug, because the event is not one the catalogue carries.
   */
  it('records a discontinued major with no competition', async () => {
    const career = await provider(
      box({ dumaurier: "'''Won''': [[1993 du Maurier Classic|1993]]" }),
    ).fetchGolfCareer('Player');

    expect(career?.majors).toEqual([
      { slug: null, name: 'du Maurier Classic', year: 1993, tour: 'womens' },
    ]);
  });

  /** Win counts are a leading integer followed by a ranking parenthetical. */
  it('reads a win count past its all-time ranking note', async () => {
    const career = await provider(
      box({
        pgawins: '82 ([[List of golfers with most PGA Tour wins|Tied-1st all-time]])',
        prowins: '110',
        majorwins: '[[#Major championships|15]]',
      }),
    ).fetchGolfCareer('Player');

    expect(career?.winCounts).toMatchObject({ pgaTourWins: 82, proWins: 110, majorWins: 15 });
  });

  /**
   * The reason this parser requires the golfer template by name.
   *
   * Wikidata's "sport: golf" statement is true of anybody who ever played a
   * round, and the catalogue contains Heinrich Harrer, the Austrian
   * mountaineer. Falling back to whatever infobox the page has would parse his
   * climber box, find no majors, and return a career that reads "golfer who won
   * nothing" rather than "not a golfer".
   */
  it('returns null for a page with no golfer infobox', async () => {
    const career = await provider(
      '{{Infobox mountaineer\n| name = A Climber\n}}\n\nBody text.',
    ).fetchGolfCareer('Climber');

    expect(career).toBeNull();
  });

  /** The career span and the Hall of Fame year, which the profile shows. */
  it('reads the career span and hall of fame year', async () => {
    const career = await provider(
      box({ yearpro: '1996', retired: '', wghofyear: '2021', tour: '[[PGA Tour]]' }),
    ).fetchGolfCareer('Player');

    expect(career?.turnedPro).toBe(1996);
    expect(career?.hallOfFameYear).toBe(2021);
    // Empty rather than absent, which is how the golf template ships it on
    // almost every article. It must not read as a retirement.
    expect(career?.retiredYear).toBeNull();
  });

  /** The activity signal the caller uses to decide active against retired. */
  it('reports the most recent major year', async () => {
    const career = await provider(
      box({
        masters: "'''Won''': [[1997 Masters Tournament|1997]], [[2019 Masters Tournament|2019]]",
        usopen: "'''Won''': [[2000 U.S. Open (golf)|2000]]",
      }),
    ).fetchGolfCareer('Player');

    expect(career?.lastMajorYear).toBe(2019);
  });
});
