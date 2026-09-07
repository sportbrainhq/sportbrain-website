'use client';

import {
  contactSubmissionResultSchema,
  myContactSubmissionSchema,
  type ContactSubmissionResult,
  type CreateContactRequest,
  type MyContactSubmission,
} from '@sportbrain/contracts';
import { z } from 'zod';
import { clientEnv } from './env';

/**
 * Client-side contact submission. `POST /contact` requires a signed-in
 * session (see `ContactController`), so this follows `lib/auth-client.ts`'s
 * pattern exactly (`credentials: 'include'` direct to the API) rather than
 * the server-action route the form used before auth-gating — a Server
 * Action's fetch does not carry the browser's cookies to a different origin
 * without deliberately forwarding them (see `lib/auth.ts`'s header
 * comment), and there is no authed-POST helper for that yet.
 */

export class ContactApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ContactApiError';
  }
}

export async function submitContact(body: CreateContactRequest): Promise<ContactSubmissionResult> {
  const response = await fetch(new URL('/v1/contact', clientEnv.NEXT_PUBLIC_API_URL), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new ContactApiError(
      `Contact submission failed with status ${response.status}`,
      response.status,
    );
  }

  return contactSubmissionResultSchema.parse(await response.json());
}

/** Closes one of the signed-in user's own submissions. See `ContactMeController`. */
export async function closeContactSubmission(id: string): Promise<MyContactSubmission | null> {
  const response = await fetch(
    new URL(`/v1/users/me/contact/${id}/close`, clientEnv.NEXT_PUBLIC_API_URL),
    {
      method: 'PATCH',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    },
  );
  if (!response.ok) return null;
  const parsed = myContactSubmissionSchema.safeParse(await response.json());
  return parsed.success ? parsed.data : null;
}

const myContactListSchema = z.object({ data: z.array(myContactSubmissionSchema) });

/** Client-side refetch of the signed-in user's own submission history, for after a close. */
export async function fetchMyContactSubmissions(): Promise<MyContactSubmission[]> {
  const response = await fetch(new URL('/v1/users/me/contact', clientEnv.NEXT_PUBLIC_API_URL), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) return [];
  const parsed = myContactListSchema.safeParse(await response.json());
  return parsed.success ? parsed.data.data : [];
}
