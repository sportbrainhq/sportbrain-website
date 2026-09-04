import { describe, expect, it } from 'vitest';
import { combinedSimilarity, entityOverlap, headlineSimilarity, timeProximity } from './similarity';

describe('headlineSimilarity', () => {
  it('scores near-duplicate cross-source headlines about the same transfer highly', () => {
    const espn = 'Arsenal complete signing of Player X from Rivalton';
    const bbc = 'Arsenal confirm Player X transfer from Rivalton';
    const other = 'Player X joins Arsenal in club-record deal';

    expect(headlineSimilarity(espn, bbc)).toBeGreaterThan(0.3);
    expect(headlineSimilarity(espn, other)).toBeGreaterThan(0.1);
  });

  it('scores unrelated headlines low', () => {
    const a = 'Arsenal complete signing of Player X from Rivalton';
    const b = 'Local council approves new stadium parking regulations';
    expect(headlineSimilarity(a, b)).toBeLessThan(0.15);
  });

  it('is symmetric', () => {
    const a = 'Manchester United beat Chelsea 2-1 at Old Trafford';
    const b = 'Chelsea lose 2-1 to Manchester United at Old Trafford';
    expect(headlineSimilarity(a, b)).toBeCloseTo(headlineSimilarity(b, a), 6);
  });

  it('returns 0 for two headlines with no meaningful tokens', () => {
    expect(headlineSimilarity('!!!', '???')).toBe(0);
  });

  it('returns 1 for identical headlines', () => {
    const headline = 'Arsenal complete signing of Player X';
    expect(headlineSimilarity(headline, headline)).toBe(1);
  });
});

describe('entityOverlap', () => {
  it('returns 1 for identical entity sets', () => {
    const set = new Set(['team-1', 'player-1']);
    expect(entityOverlap(set, new Set(set))).toBe(1);
  });

  it('returns a partial score for partial overlap', () => {
    const a = new Set(['team-1', 'player-1']);
    const b = new Set(['team-1', 'player-2']);
    // intersection 1, union 3
    expect(entityOverlap(a, b)).toBeCloseTo(1 / 3, 6);
  });

  it('returns 0 for no overlap', () => {
    const a = new Set(['team-1']);
    const b = new Set(['team-2']);
    expect(entityOverlap(a, b)).toBe(0);
  });

  it('returns 0 when either set is empty', () => {
    expect(entityOverlap(new Set(), new Set(['team-1']))).toBe(0);
    expect(entityOverlap(new Set(['team-1']), new Set())).toBe(0);
  });
});

describe('timeProximity', () => {
  const base = new Date('2026-01-01T12:00:00Z');

  it('is 1.0 for the same instant', () => {
    expect(timeProximity(base, base, 72)).toBe(1);
  });

  it('decays linearly within the window', () => {
    const halfway = new Date(base.getTime() + 36 * 60 * 60 * 1_000);
    expect(timeProximity(base, halfway, 72)).toBeCloseTo(0.5, 6);
  });

  it('is 0 at and beyond the window edge', () => {
    const atEdge = new Date(base.getTime() + 72 * 60 * 60 * 1_000);
    const beyond = new Date(base.getTime() + 100 * 60 * 60 * 1_000);
    expect(timeProximity(base, atEdge, 72)).toBe(0);
    expect(timeProximity(base, beyond, 72)).toBe(0);
  });

  it('is symmetric regardless of which date is earlier', () => {
    const later = new Date(base.getTime() + 10 * 60 * 60 * 1_000);
    expect(timeProximity(base, later, 72)).toBeCloseTo(timeProximity(later, base, 72), 6);
  });
});

describe('combinedSimilarity', () => {
  const weights = { headlineWeight: 0.5, entityWeight: 0.3, timeWeight: 0.2 };
  const now = new Date('2026-01-01T12:00:00Z');

  it('weights each signal per the configured weights', () => {
    const score = combinedSimilarity({
      headlineA: 'Arsenal complete signing of Player X',
      headlineB: 'Arsenal complete signing of Player X',
      entityIdsA: new Set(['team-1']),
      entityIdsB: new Set(['team-1']),
      publishedAtA: now,
      publishedAtB: now,
      timeWindowHours: 72,
      weights,
    });
    // All three signals are 1.0, so the combined score should be ~1.0.
    expect(score).toBeCloseTo(1, 6);
  });

  it('produces a lower score when only headline matches (no entity overlap, far apart in time)', () => {
    const far = new Date(now.getTime() + 200 * 60 * 60 * 1_000);
    const score = combinedSimilarity({
      headlineA: 'Arsenal complete signing of Player X',
      headlineB: 'Arsenal complete signing of Player X',
      entityIdsA: new Set(['team-1']),
      entityIdsB: new Set(['team-2']),
      publishedAtA: now,
      publishedAtB: far,
      timeWindowHours: 72,
      weights,
    });
    // Only headline weight (0.5) contributes.
    expect(score).toBeCloseTo(0.5, 6);
  });

  it('is 0 for a fully unrelated pair', () => {
    const far = new Date(now.getTime() + 200 * 60 * 60 * 1_000);
    const score = combinedSimilarity({
      headlineA: 'Arsenal complete signing of Player X',
      headlineB: 'Local council approves new stadium parking regulations',
      entityIdsA: new Set(['team-1']),
      entityIdsB: new Set(['team-2']),
      publishedAtA: now,
      publishedAtB: far,
      timeWindowHours: 72,
      weights,
    });
    expect(score).toBe(0);
  });
});
