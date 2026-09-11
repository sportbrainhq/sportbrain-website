'use client';

import { useState } from 'react';
import type { CampaignSummary } from '@sportbrain/contracts';
import { adminPost } from '@/lib/admin-api';

const STATUS_BADGE: Record<CampaignSummary['status'], string> = {
  CREATED: 'bg-muted text-muted-foreground',
  SENDING: 'bg-primary/15 text-primary',
  COMPLETED: 'bg-success/15 text-success',
  PARTIAL: 'bg-warning/15 text-warning',
  FAILED: 'bg-destructive/15 text-destructive',
};

/** Campaign counters + "Retry Failed" (Phase D5). */
export function DeliveryStatus({ initial }: { initial: CampaignSummary | null }) {
  const [campaign] = useState(initial);
  const [retrying, setRetrying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!campaign) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        This issue has not been sent yet — no campaign exists.
      </div>
    );
  }

  async function retryFailed() {
    if (!campaign) return;
    setRetrying(true);
    setMessage(null);
    setError(null);
    try {
      const result = (await adminPost(
        `/admin/newsletter/campaigns/${campaign.id}/retry-failed`,
      )) as {
        data: { retryCount: number };
      };
      setMessage(
        result.data.retryCount > 0
          ? `Re-enqueued ${result.data.retryCount} failed recipient(s).`
          : 'No retryable recipients (either none failed, or all are at the attempt cap).',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry.');
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[campaign.status]}`}
        >
          {campaign.status}
        </span>
        {campaign.status !== 'COMPLETED' && (
          <button
            type="button"
            onClick={() => void retryFailed()}
            disabled={retrying}
            className="rounded-sm border border-border px-3 py-1.5 text-sm hover:bg-background disabled:opacity-60"
          >
            {retrying ? 'Retrying…' : 'Retry Failed'}
          </button>
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <Stat label="Recipients" value={campaign.recipientCount} />
        <Stat label="Processed" value={campaign.processedCount} />
        <Stat label="Sent" value={campaign.sentCount} />
        <Stat label="Delivered" value={campaign.deliveredCount} />
        <Stat label="Failed" value={campaign.failedCount} />
        <Stat label="Bounced" value={campaign.bouncedCount} />
        <Stat label="Complained" value={campaign.complainedCount} />
        <Stat label="Unsubscribed" value={campaign.unsubscribedCount} />
      </dl>

      <p className="mt-4 text-xs text-muted-foreground">
        Started {new Date(campaign.startedAt).toLocaleString()}
        {campaign.completedAt && ` — completed ${new Date(campaign.completedAt).toLocaleString()}`}
      </p>

      {message && <p className="mt-2 text-sm text-success">{message}</p>}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{value.toLocaleString()}</dd>
    </div>
  );
}
