'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ExplainerSummary } from '@sportbrain/contracts';

type IndexedExplainer = ExplainerSummary & { terms: string[] };

/**
 * Explainer search.
 *
 * Filters an index the server already sent rather than querying as the reader
 * types. At a few hundred concepts the whole index is a small payload, and
 * matching locally makes results instant with no debounce, no loading state and
 * no request per keystroke.
 *
 * The upgrade path is deliberate: when the library outgrows a client-side
 * index, this component keeps its shape and the same rows arrive from a query
 * endpoint instead. Nothing else on the page changes.
 *
 * The results are the only client-rendered part of the page. Categories and
 * articles are server components, so search never becomes a prerequisite for
 * the content being indexable.
 */
export function ExplainerSearch({
  sportSlug,
  index,
  placeholder,
}: {
  sportSlug: string;
  index: IndexedExplainer[];
  placeholder: string;
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const normalised = normalise(query);
    if (normalised.length < 2) return [];

    // Ranked rather than filtered: an exact alias match for "xg" should outrank
    // a description that happens to mention expected goals.
    const scored = index
      .map((entry) => ({ entry, score: score(entry, normalised) }))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));

    return scored.slice(0, 12).map((candidate) => candidate.entry);
  }, [index, query]);

  const isSearching = normalise(query).length >= 2;

  return (
    <div className="relative">
      <label htmlFor="explainer-search" className="sr-only">
        Search explainers
      </label>
      <input
        id="explainer-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/30"
      />

      {isSearching && (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              Nothing matches &ldquo;{query.trim()}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((entry) => (
                <li key={entry.id}>
                  <Link
                    href={`/sports/${sportSlug}/explainers/${entry.slug}`}
                    className="flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{entry.title}</span>
                      {entry.shortDescription && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {entry.shortDescription}
                        </span>
                      )}
                    </span>
                    {entry.categoryName && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {entry.categoryName}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Mirrors the normalisation the seed applies, so stored terms match typed ones. */
function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Ranks one concept against a query.
 *
 * Exact alias beats prefix, prefix beats substring, and the title beats the
 * description. Without the ordering, typing "press" surfaces whichever concept
 * happens to mention pressing first rather than pressing itself.
 */
function score(entry: IndexedExplainer, query: string): number {
  const title = normalise(entry.title);

  if (entry.terms.includes(query)) return 100;
  if (title === query) return 100;
  if (title.startsWith(query)) return 80;
  if (entry.terms.some((term) => term.startsWith(query))) return 60;
  if (title.includes(query)) return 40;
  if (entry.terms.some((term) => term.includes(query))) return 30;
  if (entry.shortDescription && normalise(entry.shortDescription).includes(query)) return 10;

  return 0;
}
