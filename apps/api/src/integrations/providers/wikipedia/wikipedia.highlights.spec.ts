import { describe, expect, it } from 'vitest';
import { parseCareerHighlights } from './wikipedia.parser';

/**
 * Career highlights parsing, against the real infobox shape.
 *
 * Every fixture is the actual wikitext as it appears on the live article, so
 * these encode findings rather than guesses.
 */
describe('parseCareerHighlights', () => {
  const box = (body: string) =>
    `{{Infobox basketball biography\n| highlights = ${body}\n| stats = y\n}}`;

  it('reads the multiplier off the front of a line', () => {
    // LeBron James. The count is the number a reader scans for, so it is parsed
    // out rather than left in the label.
    const [first] = parseCareerHighlights(
      box('* 22× [[NBA All-Star]] ({{nasg|2005}}–{{nasg|2026}})'),
    );
    expect(first).toEqual({ label: 'NBA All-Star', times: 22 });
  });

  it('records a one-off honour with a null count', () => {
    const [first] = parseCareerHighlights(box('* [[NBA Rookie of the Year]] ({{nbay|2003|end}})'));
    expect(first).toEqual({ label: 'NBA Rookie of the Year', times: null });
  });

  it('reduces a piped link to its display text', () => {
    const [first] = parseCareerHighlights(box('* 4× [[NBA Finals MVP|Finals MVP]] (2012)'));
    expect(first?.label).toBe('Finals MVP');
  });

  it('drops the trailing year list', () => {
    // The years are what made the honours section sprawl, and the count already
    // carries the information. Templates are stripped before the parenthesis
    // pass, or `{{nbay|2008|end}}` would survive it.
    const [first] = parseCareerHighlights(
      box('* 4× [[NBA Most Valuable Player]] ({{nbay|2008|end}}, {{nbay|2009|end}})'),
    );
    expect(first?.label).toBe('NBA Most Valuable Player');
  });

  it('skips a bolded section heading', () => {
    // Michael Jordan's field opens with "'''Basketball player:'''" before the
    // list proper, which would otherwise parse as an honour.
    const highlights = parseCareerHighlights(
      box("* '''Basketball player:'''\n* 6× [[NBA champion]] (1991)"),
    );
    expect(highlights).toEqual([{ label: 'NBA champion', times: 6 }]);
  });

  it('ignores nested sub-items', () => {
    // A "**" line qualifies the line above it rather than naming its own honour.
    const highlights = parseCareerHighlights(
      box('* 2× [[NBA champion]] (2020)\n** as a starter\n* [[NBA Rookie of the Year]]'),
    );
    expect(highlights.map((entry) => entry.label)).toEqual([
      'NBA champion',
      'NBA Rookie of the Year',
    ]);
  });

  it('stops at the next infobox field', () => {
    // The value spans many lines and contains pipes inside templates and links,
    // so the only reliable terminator is the next parameter.
    const highlights = parseCareerHighlights(
      '{{Infobox}}\n| highlights = * [[NBA champion]]\n| career_end = 2026\n* not a highlight\n}}',
    );
    expect(highlights).toEqual([{ label: 'NBA champion', times: null }]);
  });

  it('returns nothing when the field is absent', () => {
    // Most sports' biography infoboxes have no such field, and a player without
    // one keeps the honours list instead.
    expect(parseCareerHighlights('{{Infobox football biography\n| clubs = x\n}}')).toEqual([]);
  });

  it('preserves the order the article states', () => {
    // Roughly by prestige, championships first. That ordering is editorial work
    // by people who know the sport and is better than anything derived here.
    const highlights = parseCareerHighlights(
      box(
        '* 4× [[NBA champion]] (2012)\n* 4× [[NBA Finals MVP]] (2012)\n* 22× [[NBA All-Star]] (2005)',
      ),
    );
    expect(highlights.map((entry) => entry.label)).toEqual([
      'NBA champion',
      'NBA Finals MVP',
      'NBA All-Star',
    ]);
  });
});
