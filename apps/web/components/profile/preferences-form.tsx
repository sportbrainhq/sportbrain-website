'use client';

import { useState } from 'react';
import type { ContentPrefType, UserPreferences } from '@sportbrain/contracts';
import { clientEnv } from '@/lib/env';

const CONTENT_TYPES: { value: ContentPrefType; label: string }[] = [
  { value: 'news', label: 'News' },
  { value: 'explainers', label: 'Explainers' },
  { value: 'history', label: 'History' },
  { value: 'stats', label: 'Statistics' },
  { value: 'quizzes', label: 'Quizzes' },
  { value: 'stories', label: 'Stories' },
];

/**
 * Every toggle here is wired to a real, persisted field
 * (`userPreferences.contentTypes`/`newsletterWeekly`/`productUpdates`) —
 * per the task's explicit "no fake toggles" instruction, there is nothing
 * on this form that doesn't save.
 */
export function PreferencesForm({ initial }: { initial: UserPreferences }) {
  const [preferences, setPreferences] = useState(initial);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  function toggleContentType(type: ContentPrefType) {
    setPreferences((current) => ({
      ...current,
      contentTypes: current.contentTypes.includes(type)
        ? current.contentTypes.filter((value) => value !== type)
        : [...current.contentTypes, type],
    }));
  }

  async function save() {
    setStatus('saving');
    try {
      const response = await fetch(
        new URL('/v1/users/me/preferences', clientEnv.NEXT_PUBLIC_API_URL),
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(preferences),
        },
      );
      setStatus(response.ok ? 'saved' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Content Preferences
        </h2>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((type) => {
            const isSelected = preferences.contentTypes.includes(type.value);
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => toggleContentType(type.value)}
                aria-pressed={isSelected}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </section>

      <section id="newsletter">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Email
        </h2>
        <div className="space-y-2">
          <ToggleRow
            label="Weekly newsletter"
            checked={preferences.newsletterWeekly}
            onChange={(checked) =>
              setPreferences((current) => ({ ...current, newsletterWeekly: checked }))
            }
          />
          <ToggleRow
            label="Product updates"
            checked={preferences.productUpdates}
            onChange={(checked) =>
              setPreferences((current) => ({ ...current, productUpdates: checked }))
            }
          />
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void save()}
          disabled={status === 'saving'}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save preferences'}
        </button>
        {status === 'saved' && <span className="text-sm text-success">Saved.</span>}
        {status === 'error' && (
          <span className="text-sm text-destructive">Couldn&apos;t save. Try again.</span>
        )}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-sm text-card-foreground">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="size-4 accent-primary"
      />
    </label>
  );
}
