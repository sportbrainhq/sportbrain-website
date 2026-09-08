import Link from 'next/link';
import { z } from 'zod';
import {
  campaignSummarySchema,
  newsletterIssueSummarySchema,
  paginated,
  subscriberAnalyticsSchema,
} from '@sportbrain/contracts';
import { apiGetAuthed, requireEditor } from '@/lib/auth';

export const metadata = { title: 'The Monday Brief — Admin' };

const SOURCE_LABELS: Record<string, string> = {
  NEWSLETTER_PAGE: 'Newsletter page',
  HOMEPAGE: 'Homepage',
  PROFILE: 'Profile',
  ARTICLE: 'Article',
  QUIZ_RESULT: 'Quiz result',
  FOOTER: 'Footer',
  OTHER: 'Other',
};

const TABS = [
  { key: 'issues', label: 'Issues', href: '/admin/newsletter/issues', enabled: true },
  { key: 'create', label: 'Create Issue', href: '/admin/newsletter/issues/new', enabled: true },
  { key: 'scheduled', label: 'Scheduled', href: null, enabled: false },
  { key: 'delivery', label: 'Delivery', href: null, enabled: false },
  { key: 'subscribers', label: 'Subscribers', href: null, enabled: false },
] as const;

const subscriberCountSchema = z.object({ data: z.object({ count: z.number() }) });
const campaignResponseSchema = z.object({ data: campaignSummarySchema });
const analyticsResponseSchema = z.object({ data: subscriberAnalyticsSchema });

/**
 * The admin newsletter dashboard shell (Phase D2, delivered%/next-send and
 * subscriber analytics wired in Phase D6).
 *
 * Shows only real numbers: `subscriberCount` (D1), the latest issue number
 * (D2's issue list, `data[0]` since it's ordered newest first), the latest
 * issue's delivered% (D6's campaign counters — `deliveredCount / sentCount`,
 * `null`/"—" when nothing has sent yet rather than a division-by-zero
 * fabrication) and the next SCHEDULED issue's date (D2's list filtered by
 * `status=SCHEDULED`, soonest first). A latest issue with no campaign yet
 * (never sent) reports delivered% as "—", not "0%" — those mean different
 * things and this dashboard must not conflate them.
 */
export default async function NewsletterAdminDashboardPage() {
  await requireEditor();

  const [subscriberCountResult, issuesResult, scheduledResult, analyticsResult] = await Promise.all(
    [
      apiGetAuthed('/admin/newsletter/issues/subscriber-count', subscriberCountSchema),
      apiGetAuthed(
        '/admin/newsletter/issues?page=1&limit=1',
        paginated(newsletterIssueSummarySchema),
      ),
      apiGetAuthed(
        '/admin/newsletter/issues?page=1&limit=1&status=SCHEDULED',
        paginated(newsletterIssueSummarySchema),
      ),
      apiGetAuthed('/admin/newsletter/analytics', analyticsResponseSchema),
    ],
  );

  const subscriberCount = subscriberCountResult?.data.count ?? null;
  const latestIssue = issuesResult?.data[0] ?? null;
  const nextScheduledIssue = scheduledResult?.data[0] ?? null;
  const analytics = analyticsResult?.data ?? null;

  const campaignResult = latestIssue
    ? await apiGetAuthed(
        `/admin/newsletter/issues/${latestIssue.id}/campaign`,
        campaignResponseSchema,
      )
    : null;
  const campaign = campaignResult?.data ?? null;
  const deliveredPercent =
    campaign && campaign.sentCount > 0
      ? `${Math.round((campaign.deliveredCount / campaign.sentCount) * 100)}%`
      : '—';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">The Monday Brief</h1>
      <p className="mt-1 text-sm text-muted-foreground">Admin dashboard</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active subscribers" value={subscriberCount ?? '—'} />
        <StatCard label="Latest issue" value={latestIssue ? `#${latestIssue.issueNumber}` : '—'} />
        <StatCard
          label="Delivered %"
          value={deliveredPercent}
          note={!campaign ? 'Latest issue has not sent yet' : undefined}
        />
        <StatCard
          label="Next send"
          value={
            nextScheduledIssue
              ? new Date(nextScheduledIssue.issueDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })
              : '—'
          }
          note={!nextScheduledIssue ? 'Nothing scheduled' : undefined}
        />
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
        Pick a tab above. Issues and Create Issue are live; Scheduled and Delivery arrive in later
        phases.
      </div>

      {analytics && (
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-black tracking-tight">Subscriber analytics</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Subscribed" value={analytics.totalSubscribed} />
            <StatCard label="New this week" value={analytics.newThisWeek} />
            <StatCard label="Unsubscribed" value={analytics.unsubscribed} />
            <StatCard label="Bounced" value={analytics.bounced} />
            <StatCard label="Complaints" value={analytics.complained} />
          </div>

          <h3 className="mt-6 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            By source
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            {Object.entries(analytics.bySource).map(([source, count]) => (
              <li key={source} className="flex justify-between gap-4">
                <span className="text-muted-foreground">{SOURCE_LABELS[source] ?? source}</span>
                <span className="font-semibold">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
