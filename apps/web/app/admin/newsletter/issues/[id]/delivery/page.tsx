import { notFound } from 'next/navigation';
import { z } from 'zod';
import { campaignSummarySchema, newsletterIssueDetailSchema } from '@sportbrain/contracts';
import { apiGetAuthed, requireAdmin } from '@/lib/auth';
import { DeliveryStatus } from '@/components/admin/newsletter/delivery-status';

export const metadata = { title: 'Delivery — Admin' };

const issueEnvelopeSchema = z.object({ data: newsletterIssueDetailSchema });
const campaignEnvelopeSchema = z.object({ data: campaignSummarySchema });

/**
 * Campaign status/counters + "Retry Failed" (Phase D5). Admin-only (see
 * `requireAdmin`), mirroring the API's `NewsletterDeliveryController` being
 * `@Roles('admin')` rather than the editor-accessible `admin/newsletter/issues`.
 * A campaign may not exist yet (the issue hasn't been sent) — this page
 * renders that as "not sent yet", not a 404, since the issue itself is real.
 */
export default async function DeliveryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const issueResult = await apiGetAuthed(`/admin/newsletter/issues/${id}`, issueEnvelopeSchema);
  if (!issueResult) notFound();

  const campaignResult = await apiGetAuthed(
    `/admin/newsletter/issues/${id}/campaign`,
    campaignEnvelopeSchema,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">
        Delivery: Issue #{issueResult.data.issueNumber}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{issueResult.data.subject}</p>

      <div className="mt-6">
        <DeliveryStatus initial={campaignResult?.data ?? null} />
      </div>
    </div>
  );
}
