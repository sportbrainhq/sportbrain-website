'use client';

import { useState } from 'react';

interface IssueShareActionsProps {
  url: string;
  title: string;
}

/**
 * Simple share actions for a public issue page (Phase D7). X/Reddit are
 * static intent URLs (no app install, no API key, no tracking beyond what
 * the destination site itself does) — the simplest thing that works, per
 * the task's own "fine to include" note. Copy-link is the one action that
 * needs client JS (`navigator.clipboard`), which is why this whole small
 * component is `'use client'` rather than the otherwise-server-rendered
 * issue page importing `navigator` directly.
 */
export function IssueShareActions({ url, title }: IssueShareActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (unsupported browser, insecure context):
      // silently no-op rather than showing an error for a non-essential
      // convenience action.
    }
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        type="button"
        onClick={copyLink}
        className="rounded-md border border-border px-4 py-2 font-semibold transition-colors hover:bg-card"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-border px-4 py-2 font-semibold transition-colors hover:bg-card"
      >
        Share on X
      </a>
      <a
        href={`https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-md border border-border px-4 py-2 font-semibold transition-colors hover:bg-card"
      >
        Share on Reddit
      </a>
    </div>
  );
}
