import { describe, expect, it } from 'vitest';
import { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Tennis career parsing, tested against the real infobox shapes.
 *
 * Every fixture is trimmed from the live article it is named after, and each
 * case exists because it is a way the parse can go wrong on real data rather
 * than a hypothetical.
 *
 * The whole feature rests on one distinction: `W (2004, 2006)` is a title and
 * `F (2012)` is a lost final. Tennis infoboxes state a player's result at every
 * major in the same field whether they won it or went out in the first round,
 * so a test that only covered champions would pass while crediting every
 * runner-up with a Grand Slam.
 */
describe('tennis careers', () => {
  const provider = (wikitext: string) => {
    const client = {
      fetchWikitext: async () => wikitext,
    } as unknown as WikipediaClient;
    return new WikipediaProvider(client);
  };

  const box = (fields: Record<string, string>) =>
    `{{Infobox tennis biography\n${Object.entries(fields)
      .map(([key, value]) => `| ${key} = ${value}`)
      .join('\n')}\n}}\n\nBody text.`;

  it('counts a major from a W and the years beside it', async () => {
    const career = await provider(
      box({
        AustralianOpenresult:
          "'''W''' ([[2004 Australian Open|2004]], [[2006 Australian Open|2006]])",
      }),
    ).fetchTennisCareer('Player');

    expect(career?.titles).toEqual([
      { slug: 'australian-open', name: 'Australian Open', year: 2004, discipline: 'singles' },
      { slug: 'australian-open', name: 'Australian Open', year: 2006, discipline: 'singles' },
    ]);
  });

  /**
   * The case the anchoring exists for.
   *
   * Federer's Olympic singles field reads `F (2012)`: he reached the final and
   * lost it. A substring test for "W" anywhere in the value, or an unanchored
   * match, credits him a gold medal he never won.
   */
  it('does not count a lost final, a semi-final or a round', async () => {
    const career = await provider(
      box({
        Olympicsresult: 'F ([[Tennis at the 2012 Summer Olympics|2012]])',
        AustralianOpenresult: 'SF (2019)',
        FrenchOpenresult: 'QF (2011)',
        Wimbledonresult: '4R (2015)',
        USOpenresult: 'W (2008)',
      }),
    ).fetchTennisCareer('Player');

    expect(career?.titles).toEqual([
      { slug: 'us-open-tennis', name: 'US Open', year: 2008, discipline: 'singles' },
    ]);
  });

  /**
   * Serena Williams won the singles and the doubles at the same Wimbledon more
   * than once. The honour table is unique on (person, title, year), so the two
   * must be distinguishable or the second silently vanishes.
   */
  it('keeps singles and doubles apart', async () => {
    const career = await provider(
      box({
        Wimbledonresult: "'''W''' (2002)",
        WimbledonDoublesresult: "'''W''' (2002)",
      }),
    ).fetchTennisCareer('Player');

    expect(career?.titles).toEqual([
      { slug: 'wimbledon', name: 'Wimbledon', year: 2002, discipline: 'singles' },
      { slug: 'wimbledon', name: 'Wimbledon', year: 2002, discipline: 'doubles' },
    ]);
  });

  /**
   * The WTA Finals was held twice in 1986 and Navratilova won both, so her
   * article names the year twice in one field. The honour table holds one row
   * per competition and year, so the duplicate has to go here rather than
   * failing an insert later.
   */
  it('deduplicates a competition won twice in one year', async () => {
    const career = await provider(
      box({ WTAChampionshipsresult: "'''W''' (1986, 1986)" }),
    ).fetchTennisCareer('Player');

    expect(career?.titles).toEqual([
      { slug: 'wta-finals', name: 'WTA Finals', year: 1986, discipline: 'singles' },
    ]);
  });

  /**
   * The status signal, and the reason tennis needs one of its own: these
   * players have no club spells for the usual derivation to read.
   */
  it('reads retirement from the presence of the field, not its value', async () => {
    const retired = await provider(
      box({ retired: '23 September 2022', turnedpro: '1998' }),
    ).fetchTennisCareer('Player');
    expect(retired?.hasRetiredField).toBe(true);
    expect(retired?.retiredYear).toBe(2022);
    expect(retired?.turnedPro).toBe(1998);

    const active = await provider(box({ turnedpro: '2003' })).fetchTennisCareer('Player');
    expect(active?.hasRetiredField).toBe(false);
    expect(active?.retiredYear).toBeNull();
  });

  /** Serena Williams' field reads "2022–2026": a retirement and a return. */
  it('takes the last year from a retirement range', async () => {
    const career = await provider(box({ retired: '2022–2026' })).fetchTennisCareer('Player');
    expect(career?.retiredYear).toBe(2026);
    expect(career?.hasRetiredField).toBe(true);
  });

  /**
   * Both fields carry a trailing parenthetical that `parseNumber` correctly
   * rejects, so each needs its own leading-value read. The ranking case is the
   * sharper one: an unanchored number match returns the day of the month for
   * anybody whose article writes the date first.
   */
  it('reads a title count and a peak ranking past their parentheticals', async () => {
    const career = await provider(
      box({
        singlestitles: '103 ([[Open era records|2nd in the Open Era]])',
        highestsinglesranking: "[[List of ATP number 1s|No. '''1''']] (2 February 2004)",
      }),
    ).fetchTennisCareer('Player');

    expect(career?.singlesTitles).toBe(103);
    expect(career?.highestSinglesRanking).toBe(1);
  });

  /**
   * The discriminator the Players ordering depends on.
   *
   * Wikidata's "sport: tennis" statement is true of anyone who ever played,
   * which is how a pop musician and the King of Thailand entered the tennis
   * catalogue and outranked Federer. Neither has a tennis infobox, so neither
   * earns any title evidence.
   */
  it('returns null for a person with no tennis infobox', async () => {
    const career = await provider(
      '{{Infobox musical artist\n| name = Someone\n}}\n\nA pop musician.',
    ).fetchTennisCareer('Someone');

    expect(career).toBeNull();
  });
});
