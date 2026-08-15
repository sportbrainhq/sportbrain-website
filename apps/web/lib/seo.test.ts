import { describe, expect, it } from 'vitest';
import { buildMetadata, jsonLdScript } from './seo';

describe('buildMetadata', () => {
  it('builds an absolute canonical URL from a relative path', () => {
    const metadata = buildMetadata({ title: 'Cricket', path: '/sports/cricket' });

    expect(metadata.alternates?.canonical).toBe('http://localhost:3000/sports/cricket');
  });

  it('marks a page as indexable by default', () => {
    const robots = buildMetadata({ title: 'Cricket' }).robots;

    expect(robots).toMatchObject({ index: true, follow: true });
  });

  it('excludes a page from the index when asked', () => {
    const robots = buildMetadata({ title: 'Search', noIndex: true }).robots;

    expect(robots).toMatchObject({ index: false, follow: false });
  });

  it('switches the Open Graph type to article when a published time is given', () => {
    const metadata = buildMetadata({
      title: 'A story',
      publishedTime: '2026-08-15T00:00:00.000Z',
    });

    // OpenGraph is a discriminated union, so `type` is only reachable once
    // narrowed. Asserting through the object rather than casting.
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-08-15T00:00:00.000Z',
    });
  });

  it('uses the website Open Graph type for a normal page', () => {
    expect(buildMetadata({ title: 'Cricket' }).openGraph).toMatchObject({ type: 'website' });
  });
});

describe('jsonLdScript', () => {
  it('escapes angle brackets so a payload cannot close the script tag early', () => {
    const output = jsonLdScript({ name: '</script><script>alert(1)</script>' });

    expect(output).not.toContain('</script>');
    expect(output).toContain('\\u003c');
  });
});
