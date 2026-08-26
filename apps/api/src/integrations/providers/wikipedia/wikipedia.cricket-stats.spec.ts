import { describe, expect, it } from 'vitest';
import type { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * A cricketer's per-format career record, read from the infobox.
 *
 * Every fixture is trimmed from the live article it is named after. The cases
 * exist because each was, or would have been, a wrong figure on a player page:
 * a format filed under the wrong discipline, a paired field half thrown away,
 * an unbeaten score printed as though the batter had been dismissed.
 */
describe('WikipediaProvider.fetchCricketStats', () => {
  const provider = (wikitext: string | null) =>
    new WikipediaProvider({
      fetchHtml: async () => null,
      fetchWikitext: async () => wikitext,
    } as unknown as WikipediaClient);

  const infobox = (fields: string[]) => `{{Infobox cricketer\n| name = X\n${fields.join('\n')}\n}}`;

  it('reads a format column into its discipline', async () => {
    const wikitext = infobox([
      '| column1 = [[Test cricket|Test]]',
      '| matches1 = 200',
      '| runs1 = 15,921',
      '| bat avg1 = 53.78',
    ]);

    expect(await provider(wikitext).fetchCricketStats('X')).toEqual([
      {
        discipline: 'test',
        appearances: 200,
        stats: { matches: 200, runs: 15921, batting_average: 53.78 },
      },
    ]);
  });

  it('files a List A column as its own discipline, not as ODI', async () => {
    // Tendulkar's fourth column. Every ODI is a List A match and most List A
    // matches are not ODIs, so folding one into the other would add a domestic
    // record to an international one: 551 List A matches against 463 ODIs.
    const wikitext = infobox([
      '| column1 = [[List A cricket|LA]]',
      '| matches1 = 551',
      '| runs1 = 21,999',
    ]);

    const blocks = await provider(wikitext).fetchCricketStats('X');

    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.discipline).toBe('list_a');
  });

  it('files a first-class column as its own discipline, not as Test', async () => {
    // Tendulkar's third column. Filing it as Test would credit him with 310
    // Tests, and FC is the column most players actually have: a four-column
    // infobox carries Test, ODI, T20I and FC, with no List A at all.
    const wikitext = infobox([
      '| column1 = [[First-class cricket|FC]]',
      '| matches1 = 310',
      '| runs1 = 25,396',
    ]);

    const blocks = await provider(wikitext).fetchCricketStats('X');

    expect(blocks).toHaveLength(1);
    expect(blocks[0]!.discipline).toBe('first_class');
  });

  it('skips a format with no discipline rather than folding it into a neighbour', async () => {
    // Domestic T20, which no discipline covers. Filing it as T20I would count
    // franchise matches as internationals.
    const wikitext = infobox([
      '| column1 = [[Twenty20 cricket|T20]]',
      '| matches1 = 350',
      '| runs1 = 9,000',
    ]);

    expect(await provider(wikitext).fetchCricketStats('X')).toEqual([]);
  });

  it('keeps both halves of the paired fields', async () => {
    // "100s/50s" and "catches/stumpings" each hold two statistics, and taking
    // only the first threw away the fifties and stumpings columns entirely.
    const wikitext = infobox([
      '| column1 = [[Test cricket|Test]]',
      '| 100s/50s1 = 51/68',
      '| catches/stumpings1 = 115/9',
    ]);

    const [block] = await provider(wikitext).fetchCricketStats('X');

    expect(block!.stats).toEqual({ hundreds: 51, fifties: 68, catches: 115, stumpings: 9 });
  });

  it('records nothing for a half written as a dash', async () => {
    // A batter who never kept wicket has "115/–", and a zero would claim a
    // wicketkeeping record they never had.
    const wikitext = infobox(['| column1 = [[Test cricket|Test]]', '| catches/stumpings1 = 115/–']);

    const [block] = await provider(wikitext).fetchCricketStats('X');

    expect(block!.stats).toEqual({ catches: 115 });
  });

  it('keeps an unbeaten highest score and a bowling return as written', async () => {
    // "248*" is an unbeaten innings and the asterisk is the fact that makes it
    // one; "5/32" is five wickets for thirty-two and means nothing reduced to
    // either figure. Both were being parsed to a bare number.
    const wikitext = infobox([
      '| column1 = [[Test cricket|Test]]',
      '| top score1 = 248[[not out|*]]',
      '| best bowling1 = 5/32',
    ]);

    const [block] = await provider(wikitext).fetchCricketStats('X');

    expect(block!.stats).toEqual({ highest_score: '248*', best_bowling: '5/32' });
  });

  it('records no bowling return where the infobox holds a dash', async () => {
    // Kohli's Test column. A batter who has bowled without taking a wicket has
    // no best return, and "–" is not one.
    const wikitext = infobox(['| column1 = [[Test cricket|Test]]', '| best bowling1 = –']);

    expect(await provider(wikitext).fetchCricketStats('X')).toEqual([]);
  });

  it('reads every column in one pass', async () => {
    const wikitext = infobox([
      '| column1 = [[Test cricket|Test]]',
      '| matches1 = 123',
      '| column2 = [[One Day International|ODI]]',
      '| matches2 = 314',
      '| column3 = [[Twenty20 International|T20I]]',
      '| matches3 = 125',
      '| column4 = [[First-class cricket|FC]]',
      '| matches4 = 352',
      '| column5 = [[List A cricket|LA]]',
      '| matches5 = 400',
    ]);

    const blocks = await provider(wikitext).fetchCricketStats('X');

    expect(blocks.map((block) => block.discipline)).toEqual([
      'test',
      'odi',
      't20i',
      'first_class',
      'list_a',
    ]);
  });

  it('reads the cricketer box past an earlier infobox of another kind', async () => {
    // Dhoni's article opens with `Infobox officeholder`, for an honorary army
    // rank, and carries the cricketer box second. Reading the first infobox on
    // the page returned no statistics at all for him.
    const wikitext = [
      '{{Infobox officeholder',
      '| birth_name = Mahendra Singh Dhauni',
      '| rank = Lieutenant colonel',
      '}}',
      '{{Infobox cricketer',
      '| column1 = [[Test cricket|Test]]',
      '| matches1 = 90',
      '| runs1 = 4,876',
      '}}',
    ].join('\n');

    expect(await provider(wikitext).fetchCricketStats('X')).toEqual([
      { discipline: 'test', appearances: 90, stats: { matches: 90, runs: 4876 } },
    ]);
  });

  it('returns nothing for an article with no infobox', async () => {
    expect(await provider('Just prose.').fetchCricketStats('X')).toEqual([]);
    expect(await provider(null).fetchCricketStats('X')).toEqual([]);
  });
});

/**
 * A cricketer's playing span, which is where their Active or Retired badge
 * comes from.
 *
 * Every fixture is trimmed from the article it names. The cases exist because
 * 4,769 cricketers had no badge at all: their squads carry no dates, so the
 * club-spell derivation that works for footballers had nothing to work with.
 */
describe('WikipediaProvider.fetchCricketCareerSpan', () => {
  const provider = (wikitext: string | null) =>
    new WikipediaProvider({
      fetchHtml: async () => null,
      fetchWikitext: async () => wikitext,
    } as unknown as WikipediaClient);

  const infobox = (fields: string[]) => `{{Infobox cricketer\n| name = X\n${fields.join('\n')}\n}}`;

  it('reads a closed international span as a finished career', async () => {
    // Tendulkar, retired in 2013 and showing no badge.
    const wikitext = infobox(['| internationalspan = 1989–2013']);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 1989,
      end: 2013,
      ongoing: false,
    });
  });

  it('reads "present" as a career still running', async () => {
    const wikitext = infobox(['| internationalspan = 2008–present']);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 2008,
      end: 2008,
      ongoing: true,
    });
  });

  it('takes the latest last-match year, which outranks an unclosed span', async () => {
    // An abandoned article says "present" for a player whose last international
    // was years ago. The last-match years are the harder evidence.
    const wikitext = infobox([
      '| internationalspan = 2008–2019',
      '| lasttestyear = 2018',
      '| lastodiyear = 2021',
      '| lastT20Iyear = 2019',
    ]);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 2008,
      end: 2021,
      ongoing: false,
    });
  });

  it('starts at the first international, not at a domestic debut years earlier', async () => {
    // Dhoni's page read "Career Start 1999", the year he first played for
    // Bihar. He is universally described as debuting in 2004, for India. His
    // franchise years run to 2025 and are excluded from both ends: taking them
    // labelled him Active six years after he last played for India.
    const wikitext = infobox([
      '| internationalspan = 2004–2019',
      '| odidebutyear = 2004',
      '| testdebutyear = 2005',
      '| year1 = 1999–2004',
      '| year2 = 2008–2025',
    ]);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 2004,
      end: 2019,
      ongoing: false,
    });
  });

  it('ignores an open-ended franchise spell for a retired international', async () => {
    // A player still turning out in a league has not un-retired from Test
    // cricket, and "2008–present" on a club row must not say he has.
    const wikitext = infobox([
      '| internationalspan = 2004–2019',
      '| lastodiyear = 2019',
      '| year1 = 2008–present',
    ]);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 2004,
      end: 2019,
      ongoing: false,
    });
  });

  it('prefers a debut year over a span that disagrees with it', async () => {
    const wikitext = infobox(['| internationalspan = 2006–2019', '| odidebutyear = 2004']);

    expect((await provider(wikitext).fetchCricketCareerSpan('X'))?.start).toBe(2004);
  });

  it('falls back to club years for a domestic career with no internationals', async () => {
    const wikitext = infobox(['| year1 = 1997–2004', '| year2 = 2005–2011']);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 1997,
      end: 2011,
      ongoing: false,
    });
  });

  it('reads a domestic-only player as active from their own club years', async () => {
    // The club rows are all the evidence there is here, so an open-ended one
    // means what it says.
    const wikitext = infobox(['| year1 = 2019–present']);

    expect(await provider(wikitext).fetchCricketCareerSpan('X')).toEqual({
      start: 2019,
      end: 2019,
      ongoing: true,
    });
  });

  it('reports nothing where the article states no years', async () => {
    // Null rather than a guess: the page shows no badge, which is the honest
    // rendering of no evidence.
    expect(await provider(infobox(['| batting = Right-handed'])).fetchCricketCareerSpan('X')).toBe(
      null,
    );
    expect(await provider(null).fetchCricketCareerSpan('X')).toBe(null);
  });
});
