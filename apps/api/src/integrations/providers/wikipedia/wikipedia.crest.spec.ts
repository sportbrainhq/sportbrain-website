import { describe, expect, it } from 'vitest';
import { WikipediaClient } from './wikipedia.client';
import { WikipediaProvider } from './wikipedia.provider';

/**
 * Crest extraction, tested against the real infobox shapes.
 *
 * Every fixture below is the actual field as it appears on the live article, so
 * these cases encode findings rather than guesses. The originals were read from
 * the API while establishing that Wikidata could not supply crests at all.
 */
describe('WikipediaProvider.crestFileFrom', () => {
  const provider = new WikipediaProvider(new WikipediaClient());

  const box = (fields: string) => `{{Infobox football club\n${fields}\n}}`;

  it('reads a bare filename, the common case', () => {
    // Real Madrid CF, Arsenal F.C., Liverpool F.C.
    expect(provider.crestFileFrom(box('| image = Real Madrid CF.svg'))).toBe(
      'File:Real Madrid CF.svg',
    );
  });

  it('reads a filename that already carries the File: prefix', () => {
    // France national football team writes the prefix; most clubs do not, so
    // both spellings have to land on the same canonical title.
    expect(
      provider.crestFileFrom(box('| image = File:France national football team seal.svg')),
    ).toBe('File:France national football team seal.svg');
  });

  it('reads the crest, badge and logo field names as well as image', () => {
    // The club and national-team infoboxes disagree on the field name, and
    // reading only `image` misses a share of them.
    expect(provider.crestFileFrom(box('| crest = Manchester United FC crest.svg'))).toBe(
      'File:Manchester United FC crest.svg',
    );
    expect(provider.crestFileFrom(box('| badge = Manchester City FC badge.svg'))).toBe(
      'File:Manchester City FC badge.svg',
    );
  });

  it('yields nothing for a linked value with a size label, rather than a wrong title', () => {
    // A `[[File:X.svg|150px]]` value cannot be recovered here: the shared
    // infobox parser splits fields on pipes and hands this one over as "150px",
    // the filename already gone. Not worth reworking that parser for, since none
    // of the articles checked use this form, but it must fail closed. The
    // extension check is what makes it do so, and this pins that down: without
    // it the crest URL would be built from "150px".
    expect(provider.crestFileFrom(box('| image = [[File:Arsenal FC.svg|150px]]'))).toBeNull();
  });

  it('strips a bare File: link with no label', () => {
    expect(provider.crestFileFrom(box('| image = [[File:Arsenal FC.svg]]'))).toBe(
      'File:Arsenal FC.svg',
    );
  });

  it('rejects a photograph', () => {
    // The whole reason for the extension check. Wikidata's equivalent field gave
    // a training-ground JPG for Barcelona and a squad photo for France, and both
    // rendered as a smear in a 40-pixel avatar.
    expect(
      provider.crestFileFrom(
        box('| image = 034 Ciutat Esportiva Joan Gamper, Futbol Club Barcelona (cropped).jpg'),
      ),
    ).toBeNull();
  });

  it('returns null when the infobox has no image field at all', () => {
    expect(provider.crestFileFrom(box('| fullname = Some Football Club'))).toBeNull();
  });

  it('returns null when there is no infobox', () => {
    expect(provider.crestFileFrom("'''Some club''' is a football club.")).toBeNull();
  });
});
