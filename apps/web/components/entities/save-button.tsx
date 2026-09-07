'use client';

import { useEffect, useState } from 'react';
import type { SavedEntityType } from '@sportbrain/contracts';
import { fetchSavedEntityIds, saveEntity, unsaveEntity } from '@/lib/entity-actions-api';
import { useAuth } from '@/components/auth/auth-provider';
import { googleSignInUrl } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface SaveButtonProps {
  entityType: SavedEntityType;
  entityId: string;
  className?: string;
}

/**
 * "SAVE" / "SAVED" toggle (Part 56). Signed out: opens the Google sign-in
 * redirect rather than attempting the call — there is no saved-intent
 * resume across the OAuth round trip yet (Part 56 allows for one; not built
 * this pass), so a signed-out click just gets the reader signed in and they
 * save again once back.
 */
export function SaveButton({ entityType, entityId, className }: SaveButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    let cancelled = false;
    fetchSavedEntityIds(entityType).then((ids) => {
      if (!cancelled) setSaved(ids.has(entityId));
    });
    return () => {
      cancelled = true;
    };
  }, [user, entityType, entityId]);

  if (!user) {
    return (
      <a
        href={googleSignInUrl(typeof window !== 'undefined' ? window.location.pathname : undefined)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
          className,
        )}
      >
        Save
      </a>
    );
  }

  async function handleClick() {
    if (saved === null || pending) return;
    setPending(true);
    const next = !saved;
    setSaved(next); // optimistic
    const ok = next
      ? await saveEntity(entityType, entityId)
      : await unsaveEntity(entityType, entityId);
    if (!ok) setSaved(!next); // revert on failure
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={saved === null || pending}
      aria-pressed={saved === true}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60',
        saved
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
