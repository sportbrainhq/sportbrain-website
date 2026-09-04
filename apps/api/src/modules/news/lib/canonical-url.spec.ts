import { describe, expect, it } from 'vitest';
import { canonicalUrlHash, canonicalizeUrl, hashCanonicalUrl } from './canonical-url';

describe('canonicalizeUrl', () => {
  it('lower-cases the scheme and host but leaves the path alone', () => {
    expect(canonicalizeUrl('HTTPS://Example.COM/Some/Path')).toBe('https://example.com/Some/Path');
  });

  it('strips default ports', () => {
    expect(canonicalizeUrl('http://example.com:80/story')).toBe('http://example.com/story');
    expect(canonicalizeUrl('https://example.com:443/story')).toBe('https://example.com/story');
  });

  it('keeps a non-default port', () => {
    expect(canonicalizeUrl('http://example.com:8080/story')).toBe('http://example.com:8080/story');
  });

  it('drops a trailing slash, except on the root path', () => {
    expect(canonicalizeUrl('https://example.com/story/')).toBe('https://example.com/story');
    expect(canonicalizeUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('strips utm_ and other known tracking parameters', () => {
    expect(
      canonicalizeUrl(
        'https://example.com/story?utm_source=twitter&utm_medium=social&fbclid=abc123&id=42',
      ),
    ).toBe('https://example.com/story?id=42');
  });

  it('sorts remaining query parameters so ordering does not affect the result', () => {
    expect(canonicalizeUrl('https://example.com/story?b=2&a=1')).toBe(
      canonicalizeUrl('https://example.com/story?a=1&b=2'),
    );
  });

  it('drops the fragment', () => {
    expect(canonicalizeUrl('https://example.com/story#section-2')).toBe(
      'https://example.com/story',
    );
  });

  it('produces the same canonical form for the same article shared from two different sources', () => {
    const twitterShare =
      'https://example.com/football/story-123?utm_source=twitter&utm_campaign=share';
    const newsletterShare =
      'https://example.com/football/story-123?utm_source=newsletter&utm_campaign=weekly';
    expect(canonicalizeUrl(twitterShare)).toBe(canonicalizeUrl(newsletterShare));
  });

  it('throws on an unparseable URL', () => {
    expect(() => canonicalizeUrl('not a url')).toThrow();
  });
});

describe('hashCanonicalUrl', () => {
  it('is deterministic', () => {
    const canonical = canonicalizeUrl('https://example.com/story');
    expect(hashCanonicalUrl(canonical)).toBe(hashCanonicalUrl(canonical));
  });

  it('produces a 64-character hex digest', () => {
    expect(hashCanonicalUrl('https://example.com/story')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs for different canonical URLs', () => {
    expect(hashCanonicalUrl('https://example.com/story-a')).not.toBe(
      hashCanonicalUrl('https://example.com/story-b'),
    );
  });
});

describe('canonicalUrlHash', () => {
  it('hashes two tracking-parameter variants of the same URL identically', () => {
    const a = canonicalUrlHash('https://example.com/story?utm_source=twitter');
    const b = canonicalUrlHash('https://example.com/story?utm_source=newsletter');
    expect(a.hash).toBe(b.hash);
    expect(a.canonicalUrl).toBe(b.canonicalUrl);
  });
});
