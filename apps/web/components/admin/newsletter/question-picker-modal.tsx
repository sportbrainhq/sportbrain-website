'use client';

import { useEffect, useState } from 'react';
import type { AdminQuestion } from '@sportbrain/contracts';
import { adminGet } from '@/lib/admin-api';

/**
 * Search picker over `GET /admin/newsletter/issues/questions/search`, which
 * proxies `QuestionsService.list` filtered to PUBLISHED by default — this
 * modal never queries the Question Bank directly.
 */
export function QuestionPickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (question: AdminQuestion) => void;
}) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<AdminQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: '1', limit: '20' });
    if (q) params.set('q', q);
    adminGet(`/admin/newsletter/issues/questions/search?${params.toString()}`)
      .then((result) => {
        if (!cancelled) setResults((result as { data: AdminQuestion[] }).data);
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
          <h3 className="text-lg font-bold">Pick a question</h3>
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
          placeholder="Search published questions…"
          className="mt-3 w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <ul className="mt-3 space-y-2">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!loading && results.length === 0 && (
            <p className="text-sm text-muted-foreground">No published questions match.</p>
          )}
          {results.map((question) => (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onPick(question)}
                className="w-full rounded-sm border border-border p-2 text-left text-sm hover:bg-card"
              >
                {question.questionText}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
