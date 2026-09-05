import { describe, expect, it } from 'vitest';
import { resolveSafeRedirect } from './safe-redirect';

describe('resolveSafeRedirect', () => {
  const frontendUrl = 'https://sportbrainhq.com';

  it('returns the frontend URL when no candidate is given', () => {
    expect(resolveSafeRedirect(undefined, frontendUrl)).toBe(frontendUrl);
  });

  it('resolves a bare path against the frontend origin', () => {
    expect(resolveSafeRedirect('/profile', frontendUrl)).toBe('https://sportbrainhq.com/profile');
  });

  it('preserves a query string on the path', () => {
    expect(resolveSafeRedirect('/profile/saved?type=article', frontendUrl)).toBe(
      'https://sportbrainhq.com/profile/saved?type=article',
    );
  });

  it('rejects a protocol-relative URL (open-redirect via //)', () => {
    expect(resolveSafeRedirect('//evil.example.com/phish', frontendUrl)).toBe(frontendUrl);
  });

  it('rejects an absolute URL to a different origin', () => {
    expect(resolveSafeRedirect('https://evil.example.com/phish', frontendUrl)).toBe(frontendUrl);
  });

  it('rejects a value that does not start with a slash', () => {
    expect(resolveSafeRedirect('evil.example.com', frontendUrl)).toBe(frontendUrl);
  });

  it('rejects a value that resolves to a different origin via backslash tricks', () => {
    // `new URL('/\\evil.example.com', frontendUrl)` still resolves relative
    // to frontendUrl's origin in the WHATWG URL parser, but this asserts
    // the origin check catches it either way.
    const result = resolveSafeRedirect('/\\evil.example.com', frontendUrl);
    expect(new URL(result).origin).toBe(frontendUrl);
  });
});
