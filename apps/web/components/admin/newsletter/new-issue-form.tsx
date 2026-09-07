'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { adminPost } from '@/lib/admin-api';

function nextMonday(): string {
  const date = new Date();
  const day = date.getDay();
  const daysUntilMonday = (8 - day) % 7 || 7;
  date.setDate(date.getDate() + daysUntilMonday);
  return date.toISOString().slice(0, 10);
}

export function NewIssueForm() {
  const router = useRouter();
  const [issueDate, setIssueDate] = useState(nextMonday());
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus('saving');
    setError(null);
    try {
      const result = (await adminPost('/admin/newsletter/issues', {
        issueDate: new Date(issueDate).toISOString(),
        title: title || subject,
        subject,
        previewText,
      })) as { data: { id: string } };
      router.push(`/admin/newsletter/issues/${result.data.id}`);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to create issue.');
    }
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="space-y-5">
      <Field label="Issue date">
        <input
          type="date"
          value={issueDate}
          onChange={(event) => setIssueDate(event.target.value)}
          required
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Title (internal, for the admin list)">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Monday Brief — Sep 7"
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Subject line">
        <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          required
          maxLength={200}
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <Field label="Preview text">
        <input
          type="text"
          value={previewText}
          onChange={(event) => setPreviewText(event.target.value)}
          required
          maxLength={300}
          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {status === 'saving' ? 'Creating…' : 'Create draft'}
        </button>
        {status === 'error' && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
