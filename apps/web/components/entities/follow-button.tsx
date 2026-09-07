'use client';

import { useEffect, useState } from 'react';
import type { FollowEntityType } from '@sportbrain/contracts';
import { fetchFollowedEntityIds, followEntity, unfollowEntity } from '@/lib/entity-actions-api';
import { useAuth } from '@/components/auth/auth-provider';
import { googleSignInUrl } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  entityType: FollowEntityType;
  entityId: string;
  className?: string;
}

/** "FOLLOW" / "FOLLOWING" toggle (Part 59) — same shape as `SaveButton`, different endpoint. */
export function FollowButton({ entityType, entityId, className }: FollowButtonProps) {
  const { user } = useAuth();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!user) {
      setFollowing(false);
      return;
    }
    let cancelled = false;
    fetchFollowedEntityIds(entityType).then((ids) => {
      if (!cancelled) setFollowing(ids.has(entityId));
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
        Follow
      </a>
    );
  }

  async function handleClick() {
    if (following === null || pending) return;
    setPending(true);
    const next = !following;
    setFollowing(next); // optimistic
    const ok = next
      ? await followEntity(entityType, entityId)
      : await unfollowEntity(entityType, entityId);
    if (!ok) setFollowing(!next); // revert on failure
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={following === null || pending}
      aria-pressed={following === true}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60',
        following
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  );
}
