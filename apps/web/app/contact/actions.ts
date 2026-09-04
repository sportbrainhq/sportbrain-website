'use server';

import { createContactRequestSchema } from '@sportbrain/contracts';
import { ApiError, submitContact } from '@/lib/api';

export interface ContactFormState {
  status: 'idle' | 'success' | 'error';
  referenceCode?: string;
  email?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Server Action backing the contact form. Runs on the server, so the API's
 * base URL and any future server-only secrets never reach the browser — the
 * same boundary `lib/api.ts` enforces for every other request.
 *
 * Validates with the same Zod schema the API enforces, so a field-level
 * error surfaces before a network round trip, not only after one.
 */
export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const raw = {
    category: formData.get('category'),
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
    pageUrl: formData.get('pageUrl') || undefined,
    sourceUrl: formData.get('sourceUrl') || undefined,
    whatIsIncorrect: formData.get('whatIsIncorrect') || undefined,
    whatItShouldSay: formData.get('whatItShouldSay') || undefined,
  };

  const parsed = createContactRequestSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '(root)';
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  try {
    const result = await submitContact(parsed.data);
    return { status: 'success', referenceCode: result.referenceCode, email: result.email };
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      return {
        status: 'error',
        message: "You've sent a few messages recently. Please try again in a minute.",
      };
    }
    return {
      status: 'error',
      message: 'Something went wrong sending your message. Please try again shortly.',
    };
  }
}
