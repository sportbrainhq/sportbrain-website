'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clientEnv } from '@/lib/env';
import { adminPost } from '@/lib/admin-api';

/**
 * Edit/Preview/Duplicate — the only actions D2 implements (see the list
 * page's header comment for why later-status rows render none of these).
 * `Duplicate` navigates to the new draft's editor once the API responds, so
 * an editor lands directly on the copy rather than back on the list.
 */
export function IssueRowActions({ issueId }: { issueId: string }) {
  const router = useRouter();
  const [duplicating, setDuplicating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function duplicate() {
    setDuplicating(true);
    setError(null);
    try {
      const result = (await adminPost(`/admin/newsletter/issues/${issueId}/duplicate`)) as {
        data: { id: string };
      };
      router.push(`/admin/newsletter/issues/${result.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to duplicate.');
      setDuplicating(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-3 text-xs">
      <Link href={`/admin/newsletter/issues/${issueId}`} className="text-primary hover:underline">
        Edit
      </Link>
      <a
        href={new URL(
          `/admin/newsletter/issues/${issueId}/preview`,
          clientEnv.NEXT_PUBLIC_API_URL,
        ).toString()}
        target="_blank"
        rel="noreferrer"
        className="text-primary hover:underline"
      >
        Preview
      </a>
      <button
        type="button"
        onClick={() => void duplicate()}
        disabled={duplicating}
        className="text-primary hover:underline disabled:opacity-60"
      >
        {duplicating ? 'Duplicating…' : 'Duplicate'}
      </button>
      {error && <span className="text-destructive">{error}</span>}
    </div>
  );
}
