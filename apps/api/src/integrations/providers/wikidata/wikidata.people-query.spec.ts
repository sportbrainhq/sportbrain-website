import { describe, expect, it } from 'vitest';
import { peopleQuery } from './wikidata.queries';
import { SPORT_SOURCES } from './wikidata.sources';

/**
 * How the people query scopes a sport's competitors.
 *
 * The occupation clause is the part worth pinning down, because getting it
 * wrong fails silently in the worst direction: a missing QID does not error, it
 * just quietly leaves people out, and nobody notices until somebody asks where
 * a famous player is.
 *
 * That is exactly what happened to golf. The source named "golfer" (Q11303721)
 * alone, on the reasoning that "professional golfer" (Q490253) was barely used.
 * The population figures supported that and the conclusion was still wrong:
 * 248 people carry only the professional item and Tiger Woods is one of them,
 * so the sport's most famous player was never a candidate for ingestion while
 * 748 lesser golfers were.
 */
describe('peopleQuery occupation scoping', () => {
  const build = (occupation?: string | readonly string[]) =>
    peopleQuery('Q5377', null, 25, 0, false, occupation, undefined, 5, undefined);

  it('falls back to the sport property when no occupation is given', () => {
    expect(build()).toContain('?item wdt:P641 wd:Q5377 .');
  });

  it('uses a plain predicate for a single occupation', () => {
    const query = build('Q11303721');
    expect(query).toContain('?item wdt:P106 wd:Q11303721 .');
    expect(query).not.toContain('UNION');
  });

  /**
   * A UNION rather than a VALUES join, so that somebody carrying both QIDs
   * produces one row rather than two. The outer SELECT is DISTINCT on ?item,
   * but a join would still multiply the intermediate result and shift the
   * paging, which silently drops people off the end of a page.
   */
  it('unions several occupations without duplicating a person', () => {
    const query = build(['Q11303721', 'Q490253']);
    expect(query).toContain('{ ?item wdt:P106 wd:Q11303721 }');
    expect(query).toContain('{ ?item wdt:P106 wd:Q490253 }');
    expect(query).toContain('UNION');
    expect(query).toContain('SELECT DISTINCT ?item');
  });

  /**
   * The regression this pair of QIDs exists to prevent.
   *
   * Asserted against the live source rather than a literal, so that dropping
   * either QID from the golf config fails here rather than in production six
   * months later.
   */
  it('scopes golf to both golfer occupations', () => {
    const golf = SPORT_SOURCES.golf;
    expect(golf?.personOccupationQid).toEqual(['Q11303721', 'Q490253']);
  });
});
