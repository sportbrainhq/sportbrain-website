import { requireEditor } from '@/lib/auth';
import { NewIssueForm } from '@/components/admin/newsletter/new-issue-form';

export const metadata = { title: 'Create Issue — Admin' };

export default async function NewIssuePage() {
  await requireEditor();

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">Create issue</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Sets up a new DRAFT. You&apos;ll add the structured content next.
      </p>
      <div className="mt-6">
        <NewIssueForm />
      </div>
    </div>
  );
}
