'use client';

import { useState } from 'react';
import type { PassportPrivacySettings } from '@sportbrain/contracts';
import { clientEnv } from '@/lib/env';

/**
 * Passport privacy toggles (Part 55). Defaults are privacy-conscious
 * (`isPublic` off) — this form only ever reflects and updates what the API
 * already has, never assumes a default of its own.
 */
export function PassportPrivacyForm({ initial }: { initial: PassportPrivacySettings }) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function update(patch: Partial<PassportPrivacySettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    setStatus('saving');
    try {
      const response = await fetch(
        new URL('/v1/me/passport/privacy', clientEnv.NEXT_PUBLIC_API_URL),
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(patch),
        },
      );
      if (response.ok) {
        const body = await response.json();
        setSettings(body.data);
        setStatus('saved');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        SportBrain Passport
      </h2>

      <Toggle
        label="Public Passport"
        checked={settings.isPublic}
        onChange={(checked) => update({ isPublic: checked })}
      />
      <Toggle
        label="Show Avatar Publicly"
        checked={settings.showAvatarPublicly}
        disabled={!settings.isPublic}
        onChange={(checked) => update({ showAvatarPublicly: checked })}
      />
      <Toggle
        label="Show Activity"
        checked={settings.showActivityPublicly}
        disabled={!settings.isPublic}
        onChange={(checked) => update({ showActivityPublicly: checked })}
      />
      <Toggle
        label="Show Streak"
        checked={settings.showStreakPublicly}
        disabled={!settings.isPublic}
        onChange={(checked) => update({ showStreakPublicly: checked })}
      />
      <Toggle
        label="Show Achievements"
        checked={settings.showAchievementsPublicly}
        disabled={!settings.isPublic}
        onChange={(checked) => update({ showAchievementsPublicly: checked })}
      />
      <Toggle
        label="Allow Search Engines to Index"
        checked={settings.allowSearchIndexing}
        disabled={!settings.isPublic}
        onChange={(checked) => update({ allowSearchIndexing: checked })}
      />

      {status === 'saved' && <p className="text-xs text-muted-foreground">Saved.</p>}
      {status === 'error' && <p className="text-xs text-destructive">Couldn’t save. Try again.</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className={disabled ? 'text-muted-foreground' : 'text-foreground'}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4"
      />
    </label>
  );
}
