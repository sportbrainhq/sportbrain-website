'use client';

import { useState } from 'react';
import type { ContactStatus, MyContactSubmission } from '@sportbrain/contracts';
import { closeContactSubmission } from '@/lib/contact-api';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<ContactStatus, string> = {
  received: 'Received',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Rejected',
  resolved: 'Resolved',
  closed_by_user: 'Closed by you',
};

const STATUS_STYLE: Record<ContactStatus, string> = {
  received: 'bg-muted text-muted-foreground',
  under_review: 'bg-primary/10 text-primary',
  accepted: 'bg-primary/10 text-primary',
  rejected: 'bg-destructive/10 text-destructive',
  resolved: 'bg-green-500/10 text-green-600 dark:text-green-400',
  closed_by_user: 'bg-muted text-muted-foreground',
};

const CLOSED_STATUSES: ContactStatus[] = ['resolved', 'closed_by_user', 'rejected'];

export function ContactHistoryList({
  initialSubmissions,
}: {
  initialSubmissions: MyContactSubmission[];
}) {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [closingId, setClosingId] = useState<string | null>(null);

  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
        <h2 className="text-lg font-semibold text-card-foreground">No messages yet.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Anything you send us from the Contact page shows up here.
        </p>
      </div>
    );
  }

  async function handleClose(id: string) {
    setClosingId(id);
    const updated = await closeContactSubmission(id);
    if (updated) {
      setSubmissions((prev) => prev.map((item) => (item.id === id ? updated : item)));
    }
    setClosingId(null);
  }

  return (
    <ul className="space-y-3">
      {submissions.map((item) => {
        const canClose = !CLOSED_STATUSES.includes(item.status);
        return (
          <li key={item.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {item.referenceCode}
                </p>
                <p className="mt-1 font-semibold text-card-foreground">{item.subject}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {/* Fixed locale, not the viewer's: `undefined` here reads the
                      browser's locale, which differs from the server's during
                      SSR and throws a hydration mismatch (server renders
                      "Sep 7, 2026", client re-renders "7 Sept 2026"). */}
                  {new Date(item.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium',
                    STATUS_STYLE[item.status],
                  )}
                >
                  {STATUS_LABEL[item.status]}
                </span>
                {canClose && (
                  <button
                    type="button"
                    onClick={() => void handleClose(item.id)}
                    disabled={closingId === item.id}
                    className="text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-60"
                  >
                    {closingId === item.id ? 'Closing…' : 'Close'}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
