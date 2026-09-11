'use client';

import { useEffect, useState } from 'react';
import type { NewsletterIssueDetail } from '@sportbrain/contracts';
import { adminGet, adminPost } from '@/lib/admin-api';

/**
 * "Schedule" / "Cancel Schedule" (Phase D5). Only rendered for READY or
 * SCHEDULED issues — see `IssueEditor`'s guard. The date/time/timezone
 * inputs default to next Monday 08:00 in `NEWSLETTER_DEFAULT_TIMEZONE`
 * (read from the same admin dashboard stat endpoint isn't available here, so
 * this hard-codes the same default the API's own config falls back to —
 * `Asia/Kolkata` — since the picker default is a UI nicety, not something
 * that needs to round-trip the API to compute).
 *
 * "Estimated eligible recipients" reuses D2's
 * `GET admin/newsletter/issues/subscriber-count` (the same number the
 * dashboard headline shows) rather than a new endpoint — it is an estimate,
 * not a guarantee (the real snapshot happens at send time), which the label
 * says explicitly.
 */
export function ScheduleSection({
  issue,
  onChange,
}: {
  issue: NewsletterIssueDetail;
  onChange: (issue: NewsletterIssueDetail) => void;
}) {
  const defaults = nextMondayEightAM();
  const [date, setDate] = useState(issue.scheduledAt ? isoDate(issue.scheduledAt) : defaults.date);
  const [time, setTime] = useState(issue.scheduledAt ? isoTime(issue.scheduledAt) : defaults.time);
  const [timezone, setTimezone] = useState(issue.scheduleTimezone || 'Asia/Kolkata');
  const [recipientEstimate, setRecipientEstimate] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void adminGet('/admin/newsletter/issues/subscriber-count')
      .then((result) => {
        if (cancelled) return;
        const count = (result as { data: { count: number } }).data.count;
        setRecipientEstimate(count);
      })
      .catch(() => setRecipientEstimate(null));
    return () => {
      cancelled = true;
    };
  }, []);

  async function schedule() {
    setBusy(true);
    setError(null);
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const result = (await adminPost(`/admin/newsletter/issues/${issue.id}/schedule`, {
        scheduledAt,
        timezone,
      })) as { data: NewsletterIssueDetail };
      onChange(result.data);
      setConfirming(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule.');
    } finally {
      setBusy(false);
    }
  }

  async function cancelSchedule() {
    setBusy(true);
    setError(null);
    try {
      const result = (await adminPost(`/admin/newsletter/issues/${issue.id}/cancel-schedule`)) as {
        data: NewsletterIssueDetail;
      };
      onChange(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel schedule.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="text-lg font-bold">Schedule</h2>

      {issue.status === 'SCHEDULED' ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm">
            Scheduled for{' '}
            <span className="font-semibold">
              {issue.scheduledAt ? new Date(issue.scheduledAt).toLocaleString() : '—'}
            </span>{' '}
            ({issue.scheduleTimezone})
          </p>
          <button
            type="button"
            onClick={() => void cancelSchedule()}
            disabled={busy}
            className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-60"
          >
            {busy ? 'Cancelling…' : 'Cancel Schedule'}
          </button>
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Time</span>
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted-foreground">Timezone</span>
              <input
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="Asia/Kolkata"
                className="rounded-sm border border-border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>

          <p className="text-xs text-muted-foreground">
            Estimated eligible recipients:{' '}
            <span className="font-semibold">
              {recipientEstimate === null ? '—' : recipientEstimate.toLocaleString()}
            </span>
          </p>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Schedule
            </button>
          ) : (
            <div className="rounded-sm border border-border bg-background p-3">
              <p className="text-sm">
                Confirm: send Issue #{issue.issueNumber} on{' '}
                <span className="font-semibold">
                  {date} at {time} ({timezone})
                </span>
                ?
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void schedule()}
                  disabled={busy}
                  className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {busy ? 'Scheduling…' : 'Confirm Schedule'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-card"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </section>
  );
}

/** Next Monday at 08:00, local to the browser — the picker's starting point only; the actual instant sent is whatever the inputs say when "Schedule" is confirmed. */
function nextMondayEightAM(): { date: string; time: string } {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 1 ? 7 : (8 - day) % 7 || 7;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilMonday);
  return { date: isoDate(next.toISOString()), time: '08:00' };
}

function isoDate(iso: string): string {
  return iso.slice(0, 10);
}

function isoTime(iso: string): string {
  return new Date(iso).toISOString().slice(11, 16);
}
