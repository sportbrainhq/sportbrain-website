'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

/**
 * Search for an entity list.
 *
 * Deliberately small: a single field sitting beside the heading rather than a
 * banner above the grid. A list page is for browsing, and search is one of the
 * things you might do on it, so it should read as a control on the page and not
 * as the page's purpose.
 *
 * The term lives in the URL, so a search is linkable, survives a refresh, and
 * leaves the results server-rendered like the rest of the list. That is also
 * why this is the only client component involved: it does nothing but push a
 * query string.
 *
 * Debounced, because every keystroke would otherwise be a navigation and the
 * results would flicker through partial matches while the reader is still
 * typing.
 */
export function EntitySearch({
  basePath,
  initialValue = '',
  placeholder,
}: {
  /** Path to navigate, without a query string. */
  basePath: string;
  initialValue?: string;
  placeholder: string;
}) {
  const router = useRouter();
  const inputId = useId();
  const [value, setValue] = useState(initialValue);

  // Tracks what the URL already reflects, so the effect does not navigate on
  // mount or immediately after the value arrives from the server.
  const applied = useRef(initialValue);

  useEffect(() => {
    if (value === applied.current) return;

    const timer = setTimeout(() => {
      applied.current = value;
      const trimmed = value.trim();
      // Page is dropped on a new search: staying on page 7 of the old results
      // is almost always an empty page of the new ones.
      router.push(trimmed ? `${basePath}?q=${encodeURIComponent(trimmed)}` : basePath);
    }, 300);

    return () => clearTimeout(timer);
  }, [basePath, router, value]);

  return (
    <div className="relative w-full sm:w-64">
      <label htmlFor={inputId} className="sr-only">
        {placeholder}
      </label>

      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="6.75" cy="6.75" r="4.75" />
        <path d="m10.5 10.5 3 3" strokeLinecap="round" />
      </svg>

      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        // `appearance-none` removes WebKit's own clear button, which sits where
        // ours does and renders two overlapping crosses.
        className="w-full appearance-none rounded-full border border-border bg-card py-1.5 pl-8 pr-8 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30 [&::-webkit-search-cancel-button]:hidden"
      />

      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setValue('')}
          aria-label="Clear search"
          className="absolute right-1 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
          >
            <path d="m4 4 8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
