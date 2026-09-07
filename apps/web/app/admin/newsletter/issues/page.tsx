import Link from 'next/link';
import {
  newsletterIssueSummarySchema,
  paginated,
  type NewsletterIssueStatus,
} from '@sportbrain/contracts';
import { apiGetAuthed, requireEditor } from '@/lib/auth';
import { IssueRowActions } from '@/components/admin/newsletter/issue-row-actions';

export const metadata = { title: 'Newsletter Issues — Admin' };

const STATUS_BADGE: Record<NewsletterIssueStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  READY: 'bg-success/15 text-success',
  SCHEDULED: 'bg-primary/15 text-primary',
  SENDING: 'bg-primary/15 text-primary',
  SENT: 'bg-success/15 text-success',
  FAILED: 'bg-destructive/15 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
};

/**
 * The issue list table. D2 only implements the DRAFT/READY action set
 * (Edit/Preview/Duplicate) — later statuses (SCHEDULED/SENDING/SENT/FAILED/
 * CANCELLED) render with no row actions at all rather than actions this
 * phase cannot honestly perform (cancel-send, view-delivery-report, etc.
 * belong to D3+).
 */
export default async function NewsletterIssuesListPage() {
  await requireEditor();

  const result = await apiGetAuthed(
    '/admin/newsletter/issues?page=1&limit=50',
    paginated(newsletterIssueSummarySchema),
  );
  const issues = result?.data ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Issues</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Every Monday Brief issue, newest first.
          </p>
        </div>
        <Link
          href="/admin/newsletter/issues/new"
          className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          New issue
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Subject</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No issues yet.{' '}
                  <Link href="/admin/newsletter/issues/new" className="text-primary underline">
                    Create the first one
                  </Link>
                  .
                </td>
              </tr>
            )}
            {issues.map((issue) => (
              <tr key={issue.id} className="border-t border-border">
                <td className="px-4 py-3 font-medium">#{issue.issueNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(issue.issueDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">{issue.subject}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[issue.status]}`}
                  >
                    {issue.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {/* Only DRAFT/READY get an action set in D2 — see this page's header comment. */}
                  {(issue.status === 'DRAFT' || issue.status === 'READY') && (
                    <IssueRowActions issueId={issue.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
