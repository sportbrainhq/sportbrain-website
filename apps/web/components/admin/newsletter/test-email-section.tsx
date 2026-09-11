'use client';

import { useState } from 'react';
import { adminPost } from '@/lib/admin-api';

/**
 * "Send Test Email" (Phase D4): renders through the real template and sends
 * via the stub provider, subject prefixed "TEST — " server-side. Never
 * touches the recipient/campaign model — see
 * `NewsletterIssueController.sendTest`'s own doc comment.
 */
export function TestEmailSection({ issueId }: { issueId: string }) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<'idle' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function sendTest() {
    setSending(true);
    setResult('idle');
    setError(null);
    try {
      await adminPost(`/admin/newsletter/issues/${issueId}/test`, { email });
      setResult('sent');
    } catch (err) {
      setResult('error');
      setError(err instanceof Error ? err.message : 'Failed to send test email.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-bold">Send Test Email</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Sends the real template to one address for a quick look in an actual inbox. Never creates a
        recipient or campaign.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full max-w-xs rounded-sm border border-border bg-background px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={() => void sendTest()}
          disabled={sending || !email.trim()}
          className="shrink-0 rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-60"
        >
          {sending ? 'Sending…' : 'Send Test Email'}
        </button>
      </div>
      {result === 'sent' && <p className="mt-2 text-sm text-success">Test email sent.</p>}
      {result === 'error' && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  );
}
