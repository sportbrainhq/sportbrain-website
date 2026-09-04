import { createHash } from 'node:crypto';

/**
 * URL canonicalisation and its hash, the primary dedupe key for news articles.
 *
 * Two problems this solves, both real for RSS ingestion:
 *
 *   1. The same source's feed re-emits the same article on every poll with an
 *      unchanged URL. Hashing the canonical form and constraining
 *      `(sourceId, canonicalUrlHash)` (see `news_articles` in the schema)
 *      turns that into a cheap upsert-or-skip instead of a duplicate row.
 *   2. The same URL arrives with different tracking parameters attached
 *      depending on which newsletter, social share, or referrer produced it
 *      (`?utm_source=twitter` one time, `?utm_source=newsletter` the next).
 *      Without stripping those, two fetches of the literal same article hash
 *      to two different values and the dedupe key does not do its job.
 *
 * Deliberately its own file rather than folded into the repository: the
 * fetcher and clustering phases (not built yet) both need the identical
 * normalisation the ingestion path used, and a shared pure function is the
 * only way two different call sites cannot drift apart on what "the same
 * article" means.
 */

/**
 * Query parameters known to carry no identifying information about the
 * resource itself, only about how the visitor arrived at it. Stripped before
 * hashing so they cannot fragment one article into several dedupe keys.
 */
const TRACKING_PARAM_PATTERNS = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^mc_(cid|eid)$/i,
  /^ref$/i,
  /^ref_src$/i,
  /^ref_url$/i,
  /^igshid$/i,
  /^spm$/i,
  /^cmpid$/i,
  /^icid$/i,
  /^src$/i,
  /^source$/i,
  /^__twitter_impression$/i,
];

function isTrackingParam(name: string): boolean {
  return TRACKING_PARAM_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Normalises a URL for comparison and storage as `news_articles.canonicalUrl`.
 *
 * Rules, applied in order:
 *   - Lower-cases the scheme and host (case-insensitive by spec; the path and
 *     query are left as-is because many servers *do* treat them case-sensitively).
 *   - Drops a default port (`:80` on http, `:443` on https).
 *   - Strips a trailing slash from the path, except for the root path itself.
 *   - Removes tracking query parameters, then sorts the remaining ones, so
 *     `?b=2&a=1` and `?a=1&b=2` canonicalise identically.
 *   - Drops the fragment: it addresses a location within the same document,
 *     never a different one.
 *
 * Throws if `rawUrl` is not a parseable URL. Callers ingesting external feed
 * data should validate the URL before calling this, since a malformed feed
 * item is exactly the input that should fail loudly during ingestion rather
 * than silently produce a wrong dedupe key.
 */
export function canonicalizeUrl(rawUrl: string): string {
  const url = new URL(rawUrl);

  url.protocol = url.protocol.toLowerCase();
  url.hostname = url.hostname.toLowerCase();

  if (
    (url.protocol === 'http:' && url.port === '80') ||
    (url.protocol === 'https:' && url.port === '443')
  ) {
    url.port = '';
  }

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  const remainingParams = [...url.searchParams.entries()].filter(
    ([name]) => !isTrackingParam(name),
  );
  remainingParams.sort(([a], [b]) => a.localeCompare(b));

  url.search = '';
  for (const [name, value] of remainingParams) {
    url.searchParams.append(name, value);
  }

  url.hash = '';

  return url.toString();
}

/**
 * SHA-256 of a canonical URL, hex-encoded. This is `news_articles.canonicalUrlHash`.
 *
 * A hash rather than the canonical URL itself as the indexed dedupe column:
 * fixed-width, and it keeps arbitrarily long URLs from inflating the unique
 * index. The canonical URL is stored separately for anything that needs the
 * literal value (debugging, display).
 */
export function hashCanonicalUrl(canonicalUrl: string): string {
  return createHash('sha256').update(canonicalUrl).digest('hex');
}

/** Convenience: canonicalises and hashes in one call, which is what ingestion actually wants. */
export function canonicalUrlHash(rawUrl: string): { canonicalUrl: string; hash: string } {
  const canonicalUrl = canonicalizeUrl(rawUrl);
  return { canonicalUrl, hash: hashCanonicalUrl(canonicalUrl) };
}
