'use client';

import { useEffect, useState } from 'react';
import type { ContentSummary } from '@sportbrain/contracts';
import { adminGet } from '@/lib/admin-api';

/**
 * Search picker over `GET /admin/newsletter/issues/content/search`, which
 * proxies `ContentService.search` (published content only) — this modal
 * never queries the `content` table directly.
 */
export function ContentPickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (content: ContentSummary) => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ContentSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '20' });
    if (q) params.set('q', q);
    adminGet(`/admin/newsletter/issues/content/search?${params.toString()}`)
      .then((result) => {
        if (!cancelled) setResults((result as { data: ContentSummary[] }).data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border bg-background p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Pick content</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Close
          </button>
        </div>
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search published content…"
          className="mt-3 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <ul className="mt-3 space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No published content matches.</p>
          )}
          {results.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onPick(item)}
                className="w-full rounded-sm border border-border p-2 text-left text-sm hover:bg-card"
              >
                {item.title} <span className="text-muted-foreground">({item.type})</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
