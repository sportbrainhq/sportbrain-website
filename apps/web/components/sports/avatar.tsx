'use client';

import { useState } from 'react';
import { imageUrl } from '@/lib/image';

/**
 * An entity's crest, with initials behind it.
 *
 * A client component for one reason: it has to notice when the image fails.
 * Only a quarter of football teams have a logo at all, several of the stored
 * URLs point at files Commons will not serve at a thumbnail size, and a few are
 * not crests in the first place. Without an error handler each of those renders
 * as the browser's broken-image icon, which looks like a bug on our side rather
 * than absent data.
 *
 * `referrerPolicy` is set because Wikimedia varies its response by referrer, and
 * a cross-origin request carrying a localhost referrer is the case most likely
 * to be refused. Sending no referrer is both more private and more reliable.
 */
export function Avatar({
  text,
  imageUrl: source,
  size = 40,
  className = '',
}: {
  text: string;
  imageUrl?: string | null;
  /** Rendered size in pixels. The thumbnail is requested at twice this. */
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const src = imageUrl(source, size * 2);

  const initials = text
    .split(/\s+/)
    .filter((word) => /^[\p{L}]/u.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  if (!src || failed) {
    return (
      <span
        aria-hidden
        className={`grid shrink-0 place-items-center rounded-full bg-muted text-2xs font-bold text-muted-foreground ${className}`}
        style={{ width: size, height: size }}
      >
        {initials}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Remote hosts are not
    // in next.config's remotePatterns, and adding them would turn the deployment
    // into an open image proxy. These are third-party URLs we do not control.
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full bg-muted object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
