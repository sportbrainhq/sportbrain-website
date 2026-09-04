import { describe, expect, it } from 'vitest';
import { SportClassifier } from './sport-classifier';

describe('SportClassifier', () => {
  const classifier = new SportClassifier();

  it('matches football from a keyword phrase', () => {
    const result = classifier.classify({
      headline: 'Manchester United win Premier League clash',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('football');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('matches basketball via "nba" and not cricket via unrelated text', () => {
    const result = classifier.classify({
      headline: 'NBA Finals: Celtics take Game 5',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('basketball');
  });

  it('matches cricket via "ipl"', () => {
    const result = classifier.classify({
      headline: 'IPL auction: franchises spend big',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('cricket');
  });

  it('matches formula-1 (not "motorsport") for F1 keywords', () => {
    const result = classifier.classify({
      headline: 'Formula 1 Grand Prix: pole position battle',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('formula-1');
  });

  it('matches mma via "ufc"/"octagon"', () => {
    const result = classifier.classify({
      headline: 'UFC champion defends title in the octagon',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('mma');
  });

  it('matches boxing via "wbc"/"heavyweight title"', () => {
    const result = classifier.classify({
      headline: 'WBC heavyweight title fight announced',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('boxing');
  });

  it('matches tennis via "wimbledon"/"atp"', () => {
    const result = classifier.classify({
      headline: 'Wimbledon: ATP number one advances to final',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBe('tennis');
  });

  it('falls back to the source default sport when no keyword matches', () => {
    const result = classifier.classify({
      headline: 'Club announces new signing ahead of the weekend',
      summary: 'A quiet update from the training ground.',
      defaultSportSlug: 'football',
    });
    expect(result.sportSlug).toBe('football');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.confidence).toBeLessThan(0.7);
  });

  it('returns null with zero confidence when there is no keyword match and no source default', () => {
    const result = classifier.classify({
      headline: 'Local business opens new store',
      summary: null,
      defaultSportSlug: null,
    });
    expect(result.sportSlug).toBeNull();
    expect(result.confidence).toBe(0);
  });

  it('lets strong keyword evidence override a disagreeing weak source default', () => {
    const result = classifier.classify({
      headline: 'UFC 300: octagon showdown headlines mixed martial arts card',
      summary: null,
      defaultSportSlug: 'boxing',
    });
    expect(result.sportSlug).toBe('mma');
  });

  it('trusts the source default over a single weak/ambiguous keyword hit', () => {
    const result = classifier.classify({
      headline: 'Grand Prix weekend preview for local motorsport fans',
      summary: null,
      defaultSportSlug: 'football',
    });
    // "grand prix" alone (weight 0.7) is below the override threshold (1.2).
    expect(result.sportSlug).toBe('football');
  });

  it('boosts confidence when keyword evidence agrees with the source default', () => {
    const agreeing = classifier.classify({
      headline: 'Premier League: title race heats up',
      summary: null,
      defaultSportSlug: 'football',
    });
    const noDefault = classifier.classify({
      headline: 'Premier League: title race heats up',
      summary: null,
      defaultSportSlug: null,
    });
    expect(agreeing.sportSlug).toBe('football');
    expect(agreeing.confidence).toBeGreaterThanOrEqual(noDefault.confidence);
  });
});
