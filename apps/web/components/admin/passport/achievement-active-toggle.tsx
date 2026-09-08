'use client';

import { useState } from 'react';
import { clientEnv } from '@/lib/env';

export function AchievementActiveToggle({
  achievementId,
  isActive,
}: {
  achievementId: string;
  isActive: boolean;
}) {
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    const next = !active;
    setSaving(true);
    try {
      const response = await fetch(
        new URL(`/v1/admin/achievements/${achievementId}/active`, clientEnv.NEXT_PUBLIC_API_URL),
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ isActive: next }),
        },
      );
      if (response.ok) setActive(next);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={saving}
      className={
        active
          ? 'rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary disabled:opacity-50'
          : 'rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-secondary-foreground disabled:opacity-50'
      }
    >
      {active ? 'Active' : 'Inactive'}
    </button>
  );
}
