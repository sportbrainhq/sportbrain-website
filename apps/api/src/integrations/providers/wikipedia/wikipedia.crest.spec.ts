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

  it('recovers a linked value carrying display parameters', () => {
    // `[[File:X.svg|150px]]` cannot be read from the parsed field: the shared
    // infobox parser splits on pipes and `cleanWikitext` reduces a link to its
    // display label, so the field arrives as "150px" with the filename gone.
    // This was previously left to fail closed on the assumption that no article
    // used the form. Tottenham does, as `| image = [[File:Tottenham
    // Hotspur.svg|frameless|upright=0.5|class=skin-invert]]`, and its crest was
    // missing for that reason. The link is matched against the raw wikitext
    // instead, ahead of the parsed field.
    expect(provider.crestFileFrom(box('| image = [[File:Arsenal FC.svg|150px]]'))).toBe(
      'File:Arsenal FC.svg',
    );
    expect(
      provider.crestFileFrom(
        box('| image = [[File:Tottenham Hotspur.svg|frameless|upright=0.5|class=skin-invert]]'),
      ),
    ).toBe('File:Tottenham Hotspur.svg');
  });

  it('still fails closed when the link names no image file', () => {
    // The extension check is what prevents a display parameter becoming a
    // filename, and it applies to the recovered link as well as the field.
    expect(provider.crestFileFrom(box('| image = [[File:Something.pdf|150px]]'))).toBeNull();
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

  it('drops the pipe-escape suffix competition infoboxes append', () => {
    // FIFA World Cup, Copa America. `{{!}}` is a template standing in for a
    // literal pipe, so the rendering option stays attached to the filename and
    // the extension test would otherwise reject a perfectly good wordmark.
    expect(
      provider.crestFileFrom(
        box('| image = FIFA World Cup wordmark (2023).svg{{!}}class=skin-invert'),
      ),
    ).toBe('File:FIFA World Cup wordmark (2023).svg');
  });

  it('reads a competition wordmark from the logo field', () => {
    // Argentine Primera Division, where the field is `logo` rather than `image`.
    expect(provider.crestFileFrom(box('| logo = Liga_profesional_afa_logo26.png'))).toBe(
      'File:Liga_profesional_afa_logo26.png',
    );
  });

  it('decodes a filename written with percent escapes', () => {
    // Copa America. The API refuses the escaped form outright: "The requested
    // page title contains invalid characters".
    expect(provider.crestFileFrom(box('| image = Logo de la Conmebol Copa Am%C3%A9rica.svg'))).toBe(
      'File:Logo de la Conmebol Copa América.svg',
    );
  });

  it('returns null when there is no infobox', () => {
    expect(provider.crestFileFrom("'''Some club''' is a football club.")).toBeNull();
  });
});
