'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';
import { clientEnv } from '@/lib/env';

export function AccountActions() {
  const { logout } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSignOut() {
    await logout();
    router.push('/');
    router.refresh();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const response = await fetch(new URL('/v1/users/me', clientEnv.NEXT_PUBLIC_API_URL), {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok || response.status === 204) {
        await logout();
        router.push('/');
        router.refresh();
        return;
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => void handleSignOut()}
        className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Sign out
      </button>

      <div className="rounded-lg border border-destructive/40 bg-card p-4">
        <h2 className="text-sm font-semibold text-card-foreground">Delete account</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This permanently removes your profile details and Google sign-in link. This cannot be
          undone.
        </p>

        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 rounded-sm border border-destructive px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="rounded-sm bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Yes, permanently delete my account'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={deleting}
              className="rounded-sm border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
