import Link from 'next/link';
import { z } from 'zod';
import { newsletterIssueSummarySchema, paginated } from '@sportbrain/contracts';
import { apiGetAuthed, requireEditor } from '@/lib/auth';

export const metadata = { title: 'The Monday Brief — Admin' };

const TABS = [
  { key: 'issues', label: 'Issues', href: '/admin/newsletter/issues', enabled: true },
  { key: 'create', label: 'Create Issue', href: '/admin/newsletter/issues/new', enabled: true },
  { key: 'scheduled', label: 'Scheduled', href: null, enabled: false },
  { key: 'delivery', label: 'Delivery', href: null, enabled: false },
  { key: 'subscribers', label: 'Subscribers', href: null, enabled: false },
] as const;

const subscriberCountSchema = z.object({ data: z.object({ count: z.number() }) });

/**
 * The admin newsletter dashboard shell (Phase D2).
 *
 * Shows only real numbers: `subscriberCount` (D1's
 * `NewsletterService.countActiveSubscribers`, a small read-only addition
 * made for this dashboard, surfaced through D2's own
 * `GET /admin/newsletter/issues/subscriber-count`) and the latest issue
 * number (from D2's own issue list, `data[0]` since it's ordered newest
 * first). Everything D2 has no way to know yet — delivered %, next
 * scheduled send — renders "—" rather than a fabricated figure; those tabs
 * are also disabled placeholders below, not fake-populated cards.
 */
export default async function NewsletterAdminDashboardPage() {
  await requireEditor();

  const [subscriberCountResult, issuesResult] = await Promise.all([
    apiGetAuthed('/admin/newsletter/issues/subscriber-count', subscriberCountSchema),
    apiGetAuthed(
      '/admin/newsletter/issues?page=1&limit=1',
      paginated(newsletterIssueSummarySchema),
    ),
  ]);

  const subscriberCount = subscriberCountResult?.data.count ?? null;
  const latestIssueNumber = issuesResult?.data[0]?.issueNumber ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">The Monday Brief</h1>
      <p className="mt-1 text-sm text-muted-foreground">Admin dashboard</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active subscribers" value={subscriberCount ?? '—'} />
        <StatCard label="Latest issue" value={latestIssueNumber ? `#${latestIssueNumber}` : '—'} />
        {/* D5/D6 populate these once delivery/analytics exist. Never fabricated. */}
        <StatCard label="Delivered %" value="—" note="Coming in a later phase" />
        <StatCard label="Next send" value="—" note="Coming in a later phase" />
      </div>

      <nav className="mt-8 flex flex-wrap gap-2 border-b border-border">
        {TABS.map((tab) =>
          tab.enabled && tab.href ? (
            <Link
              key={tab.key}
              href={tab.href}
              className="rounded-t-md px-4 py-2 text-sm font-medium text-foreground hover:bg-card"
            >
              {tab.label}
            </Link>
          ) : (
            <span
              key={tab.key}
              className="cursor-not-allowed rounded-t-md px-4 py-2 text-sm font-medium text-muted-foreground"
              title="Coming in a later phase"
            >
              {tab.label}
            </span>
          ),
        )}
      </nav>

      <div className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        Pick a tab above. Issues and Create Issue are live; Scheduled, Delivery and Subscribers
        arrive in later phases.
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string | number;
  note?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}
