import { notFound } from 'next/navigation';
import { z } from 'zod';
import { newsletterIssueDetailSchema } from '@sportbrain/contracts';
import { apiGetAuthed, requireEditor } from '@/lib/auth';
import { IssueEditor } from '@/components/admin/newsletter/issue-editor';

export const metadata = { title: 'Edit Issue — Admin' };

const issueEnvelopeSchema = z.object({ data: newsletterIssueDetailSchema });

export default async function EditIssuePage({ params }: { params: Promise<{ id: string }> }) {
  await requireEditor();
  const { id } = await params;

  const result = await apiGetAuthed(`/admin/newsletter/issues/${id}`, issueEnvelopeSchema);

  if (!result) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <IssueEditor initial={result.data} />
    </div>
  );
}
