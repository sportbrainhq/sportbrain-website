import { describe, expect, it } from 'vitest';
import { extractCompetitionKey } from './honour-fact.repository';

describe('extractCompetitionKey', () => {
  it('strips a leading season prefix', () => {
    expect(extractCompetitionKey('1969–70 La Liga')).toBe('La Liga');
  });

  it('strips a trailing season suffix', () => {
    expect(extractCompetitionKey('Saudi Premier League 2004–05')).toBe('Saudi Premier League');
  });

  it('strips a leading single year', () => {
    expect(extractCompetitionKey('2004 Intercontinental Cup')).toBe('Intercontinental Cup');
  });

  it('strips a hyphenated (non-en-dash) trailing season', () => {
    expect(extractCompetitionKey('Italian Cup 1978-1979')).toBe('Italian Cup');
  });

  it('leaves a title with no recognisable year unchanged', () => {
    expect(extractCompetitionKey('Copa Libertadores')).toBe('Copa Libertadores');
  });

  it('produces the same key for the same competition across different seasons', () => {
    const a = extractCompetitionKey('1969–70 La Liga');
    const b = extractCompetitionKey('1943–44 La Liga');
    expect(a).toBe(b);
  });
});
