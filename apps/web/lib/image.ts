/**
 * Normalises third-party image URLs for display.
 *
 * Wikimedia URLs arrive from Wikidata exactly as stored there, which is not a
 * form suitable for a 40-pixel avatar. Three problems, each of which shows up
 * as a missing or slow image rather than as an error:
 *
 *   - **They are `http://`.** A browser on an https page blocks the request as
 *     mixed content, or at best follows a redirect it did not need to.
 *   - **`Special:FilePath` serves the original file.** Club crests on Commons
 *     are frequently multi-megabyte images, and the page was downloading all of
 *     them at full resolution to draw them at forty pixels. That is the whole
 *     of the "images take a while, and sometimes never arrive" symptom: nothing
 *     is broken, the browser is fetching several megabytes per row.
 *   - **They are not resized.** Commons will render a thumbnail on request, and
 *     asking for one costs nothing.
 *
 * The rewrite is applied on the way out rather than at ingestion, so the stored
 * value stays the canonical one the provider gave us and the display size is a
 * presentation decision that can change without a re-ingest.
 */
export function imageUrl(source: string | null | undefined, width = 160): string | null {
  if (!source) return null;

  // Upgrade before anything else: the scheme is what actually blocks the load.
  let url = source.replace(/^http:\/\//, 'https://');

  // `Special:FilePath` accepts a width parameter and redirects to a thumbnail.
  if (url.includes('Special:FilePath')) {
    url += url.includes('?') ? `&width=${width}` : `?width=${width}`;
  }

  return url;
}
