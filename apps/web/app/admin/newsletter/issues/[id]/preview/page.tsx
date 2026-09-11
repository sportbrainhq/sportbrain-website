import { notFound } from 'next/navigation';
import { z } from 'zod';
import { issuePreviewResponseSchema } from '@sportbrain/contracts';
import { apiGetAuthed, requireEditor } from '@/lib/auth';
import { IssuePreview } from '@/components/admin/newsletter/issue-preview';

export const metadata = { title: 'Preview Issue — Admin' };

const previewEnvelopeSchema = z.object({ data: issuePreviewResponseSchema });

/**
 * Admin preview (Phase D4): renders `RenderedIssue` — the same view model
 * the email template consumes — inside desktop-width and mobile-width panes.
 * One model, two container widths, not two separately-rendered variants —
 * see `NewsletterIssueRenderService`'s own header comment for why that is
 * the correct call for V1.
 */
export default async function PreviewIssuePage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;

  const result = await apiGetAuthed(
    `/admin/newsletter/issues/${id}/preview`,
    previewEnvelopeSchema,
  );
  if (!result) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <IssuePreview issue={result.data.issue} rendered={result.data.rendered} />
    </div>
  );
}
