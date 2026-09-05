import { describe, expect, it } from 'vitest';
import { computeQuestionFingerprint, normalizeQuestionText } from './question-fingerprint';

describe('normalizeQuestionText', () => {
  it('lowercases and trims', () => {
    expect(normalizeQuestionText('  Who Won the 2022 World Cup?  ')).toBe(
      'who won the 2022 world cup?',
    );
  });

  it('collapses internal whitespace', () => {
    expect(normalizeQuestionText('Who   won\n\tthe cup?')).toBe('who won the cup?');
  });

  it('normalizes curly quotes and dashes to plain equivalents', () => {
    expect(normalizeQuestionText('Who won the 2022–2023 season’s “final”?')).toBe(
      'who won the 2022-2023 season\'s "final"?',
    );
  });

  it('produces the same normalized form for cosmetically different but equivalent text', () => {
    const a = normalizeQuestionText('Who   won the World Cup?');
    const b = normalizeQuestionText('who won the world cup?  ');
    expect(a).toBe(b);
  });
});

describe('computeQuestionFingerprint', () => {
  it('is deterministic for the same sport and normalized text', () => {
    const a = computeQuestionFingerprint('sport-1', 'who won the world cup?');
    const b = computeQuestionFingerprint('sport-1', 'who won the world cup?');
    expect(a).toBe(b);
  });

  it('differs when the sport differs', () => {
    const a = computeQuestionFingerprint('sport-1', 'who won the world cup?');
    const b = computeQuestionFingerprint('sport-2', 'who won the world cup?');
    expect(a).not.toBe(b);
  });

  it('differs when the normalized text differs', () => {
    const a = computeQuestionFingerprint('sport-1', 'who won the world cup?');
    const b = computeQuestionFingerprint('sport-1', 'who won the euros?');
    expect(a).not.toBe(b);
  });
});
