/**
 * Normalises third-party image URLs for display.
 *
 * Crest URLs reach us in two shapes, because two ingestion paths produce them:
 * Wikidata stores a `Special:FilePath` link, and the infobox backfill stores a
 * direct `upload.wikimedia.org` thumbnail. Both need work before they are fit
 * for a 40-pixel avatar, and each was failing in its own way.
 *
 *   - **`Special:FilePath` is `http://`.** A browser on an https page blocks it
 *     as mixed content.
 *   - **Wikimedia serves only a fixed set of thumbnail widths.** Anything else
 *     is refused with a 400 and the text "Use thumbnail sizes listed on
 *     https://w.wiki/GHai". This is what made every `Special:FilePath` crest
 *     disappear: the avatar renders at 40px and asked for `?width=80`, and 80
 *     is not an allowed size. The stored `upload.wikimedia.org` URLs kept
 *     working only because they carry a hardcoded `960px-` segment, and 960
 *     happens to be on the list.
 *   - **960px is far too large for an avatar.** Roughly 100KB per row to draw
 *     forty pixels.
 *
 * Both shapes are therefore resolved to the same thing: a direct
 * `upload.wikimedia.org` thumbnail at the nearest allowed width. Rewriting
 * `Special:FilePath` ourselves also drops a redirect hop, and the shard path it
 * needs is derived, not looked up, so this stays a pure function.
 *
 * Applied on the way out rather than at ingestion, so the stored value stays
 * the canonical one the provider gave us.
 */

import { createHash } from 'crypto';

/**
 * Thumbnail widths Wikimedia will actually render.
 *
 * Verified against upload.wikimedia.org for an SVG on Commons, a PNG on
 * Commons, and an SVG on the en.wikipedia fair-use backend; all three accept
 * exactly this set and return 400 for everything else.
 */
const ALLOWED_WIDTHS = [20, 40, 60, 120, 250, 500, 960, 1280] as const;

/** The smallest allowed width that is still at least `width`. */
function allowedWidth(width: number): number {
  return ALLOWED_WIDTHS.find((w) => w >= width) ?? 1280;
}

/**
 * The shard directory Commons files live under: the first one and two
 * characters of the MD5 of the underscored filename.
 */
function shardOf(filename: string): string {
  const hash = createHash('md5').update(filename, 'utf8').digest('hex');
  return `${hash[0]}/${hash[0]}${hash[1]}`;
}

/**
 * A thumbnail URL for a file, given its directory on upload.wikimedia.org.
 *
 * Only rasterisable originals get a `/thumb/` path. An SVG is rendered to PNG,
 * so the thumbnail keeps the original extension and appends `.png`; a PNG or
 * JPEG keeps its own. A GIF is left alone, since thumbnailing an animation
 * loses the animation and the saving is not worth it at this size.
 */
function thumbnail(base: string, shard: string, filename: string, width: number): string {
  const encoded = encodeURIComponent(filename).replace(/%2F/g, '/');
  const lower = filename.toLowerCase();

  // `/thumb/` sits before the shard, not after it.
  if (lower.endsWith('.svg')) {
    return `${base}/thumb/${shard}/${encoded}/${width}px-${encoded}.png`;
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
    return `${base}/thumb/${shard}/${encoded}/${width}px-${encoded}`;
  }
  return `${base}/${shard}/${encoded}`;
}

export function imageUrl(source: string | null | undefined, width = 160): string | null {
  if (!source) return null;

  const target = allowedWidth(width);

  // Upgrade before anything else: the scheme is what blocks the load outright.
  const url = source.replace(/^http:\/\//, 'https://');

  // Shape one: a Wikidata `Special:FilePath` link. Resolve it to the file it
  // redirects to, so we can ask for a size rather than take the original.
  const filePath = url.match(/Special:FilePath\/([^?#]+)/);
  if (filePath) {
    const filename = decodeURIComponent(filePath[1] ?? '').replace(/ /g, '_');
    return thumbnail(
      'https://upload.wikimedia.org/wikipedia/commons',
      shardOf(filename),
      filename,
      target,
    );
  }

  // Shape two: an existing upload.wikimedia.org thumbnail, at whatever width
  // the ingestion happened to record. Re-request it at the size we need, and
  // drop the analytics parameters the API attaches to it.
  const thumb = url.match(
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/[^/]+)\/thumb\/([^/]+\/[^/]+\/[^/]+)\/\d+px-([^/?#]+)/,
  );
  if (thumb) {
    const [, host, path, rendered] = thumb;
    return `${host}/thumb/${path}/${target}px-${rendered}`;
  }

  return url.replace(/[?&]utm_[^&]*/g, '').replace(/\?$/, '');
}
