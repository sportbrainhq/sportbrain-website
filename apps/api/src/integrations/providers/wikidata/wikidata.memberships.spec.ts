import { describe, expect, it } from 'vitest';
import { mergeOverlappingSpells } from './wikidata.provider';

/**
 * Spell merging, against the Wikidata shapes that caused the duplicates.
 *
 * Wikidata states P54 once per source rather than once per spell, so the same
 * club arrives several times with disagreeing start and end qualifiers. The
 * fixtures below are the real statements.
 */
describe('mergeOverlappingSpells', () => {
  const santos = (start?: string, end?: string) => ({
    teamExternalId: 'Q80728',
    teamName: 'Santos F.C.',
    start,
    end,
  });

  it('merges the two Santos statements on Pele into the widest span', () => {
    expect(
      mergeOverlappingSpells([
        santos('1957-01-01', '1974-01-01'),
        santos('1956-01-01', '1974-01-01'),
      ]),
    ).toEqual([santos('1956-01-01', '1974-01-01')]);
  });

  it('keeps a genuine second stint, whose dates do not overlap', () => {
    const spells = [santos('1956-01-01', '1974-01-01'), santos('1980-01-01', '1982-01-01')];
    expect(mergeOverlappingSpells(spells)).toHaveLength(2);
  });

  it('merges transitively when only neighbouring spans overlap', () => {
    expect(
      mergeOverlappingSpells([
        santos('1956-01-01', '1960-01-01'),
        santos('1959-01-01', '1970-01-01'),
        santos('1969-01-01', '1974-01-01'),
      ]),
    ).toEqual([santos('1956-01-01', '1974-01-01')]);
  });

  it('lets an open-ended spell absorb a dated one, since it is still current', () => {
    expect(
      mergeOverlappingSpells([santos('2020-01-01', '2023-01-01'), santos('2021-01-01')]),
    ).toEqual([santos('2020-01-01', undefined)]);
  });

  it('treats a missing start as unbounded in the past', () => {
    expect(
      mergeOverlappingSpells([santos(undefined, '1974-01-01'), santos('1956-01-01', '1974-01-01')]),
    ).toEqual([santos(undefined, '1974-01-01')]);
  });

  it('never merges across clubs', () => {
    const spells = [
      santos('1956-01-01', '1974-01-01'),
      {
        teamExternalId: 'Q1130849',
        teamName: 'New York Cosmos',
        start: '1975-01-01',
        end: '1977-01-01',
      },
    ];
    expect(mergeOverlappingSpells(spells)).toHaveLength(2);
  });
});
