import { z } from 'zod';
import { myContactSubmissionSchema } from '@sportbrain/contracts';
import { apiGetAuthed } from '@/lib/auth';
import { ContactHistoryList } from '@/components/profile/contact-history-list';

export const metadata = { title: 'Support' };

const listSchema = z.object({ data: z.array(myContactSubmissionSchema) });

/**
 * A submitter's own contact/feedback history (server-rendered initial
 * list) plus a client-side "close" action — see `ContactMeController` and
 * `ContactHistoryList`.
 */
export default async function ContactHistoryPage() {
  const result = await apiGetAuthed('/v1/users/me/contact', listSchema);
  const submissions = result?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Messages and feedback you&apos;ve sent us, and their status.
        </p>
      </div>

      <ContactHistoryList initialSubmissions={submissions} />
    </div>
  );
}
