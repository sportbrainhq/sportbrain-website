/**
 * Minimal inline social icons.
 *
 * The codebase has no icon library installed; adding one for four glyphs
 * wasn't worth the dependency, so these are hand-drawn outline SVGs sized to
 * match surrounding text via `currentColor`.
 */

import type { ReactElement } from 'react';

type SocialName = 'Instagram' | 'X' | 'YouTube' | 'Reddit';

const PATHS: Record<SocialName, ReactElement> = {
  Instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  X: <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />,
  YouTube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3" />
      <path d="M10.5 9.5l4.5 2.5-4.5 2.5v-5z" fill="currentColor" stroke="none" />
    </>
  ),
  Reddit: (
    <>
      <circle cx="12" cy="13" r="7" />
      <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none" />
      <path d="M9 16c1 1 5 1 6 0" strokeLinecap="round" />
      <path d="M12 6v3M12 6l3-1" strokeLinecap="round" />
    </>
  ),
};

export function SocialIcon({ name, className }: { name: SocialName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
