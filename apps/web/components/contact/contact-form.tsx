'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { createContactRequestSchema } from '@sportbrain/contracts';
import { useAuth } from '@/components/auth/auth-provider';
import { googleSignInUrl } from '@/lib/auth-client';
import { ContactApiError, submitContact } from '@/lib/contact-api';
import { CONTACT_REASONS, type ContactReasonOption } from '@/app/contact/content';

interface FormState {
  status: 'idle' | 'submitting' | 'success' | 'error';
  referenceCode?: string;
  email?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
}

const INITIAL_STATE: FormState = { status: 'idle' };

const inputClass =
  'mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/40 focus:ring-2 focus:ring-primary/20';
const labelClass = 'text-sm font-semibold';
const errorClass = 'mt-1.5 text-xs font-medium text-destructive';

interface ContactFormProps {
  /** Pre-fills the reason and page reference when opened from content (e.g. a "Report an issue" link). */
  initialCategory?: ContactReasonOption['value'];
  initialPageUrl?: string;
}

export function ContactForm({ initialCategory = 'general', initialPageUrl }: ContactFormProps) {
  const { user } = useAuth();
  const [state, setState] = useState<FormState>(INITIAL_STATE);
  const [category, setCategory] = useState<ContactReasonOption['value']>(initialCategory);

  const selectedReason = useMemo(
    () => CONTACT_REASONS.find((reason) => reason.value === category),
    [category],
  );

  // Submitting requires a signed-in identity — every contact submission
  // now carries a real user (see ContactController), and it's also how a
  // submitter later sees it in their own history/close it.
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center sm:p-8">
        <p className="text-sm text-muted-foreground">
          Sign in to send a message — it lets us follow up with you and lets you track it under your
          profile.
        </p>
        <a
          href={googleSignInUrl(
            typeof window !== 'undefined' ? window.location.pathname : undefined,
          )}
          className="mt-4 inline-flex rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          Sign in to continue
        </a>
      </div>
    );
  }

  if (state.status === 'success') {
    return (
      <div
        role="status"
        className="rounded-lg border border-border bg-card p-6 sm:p-8"
        data-testid="contact-success"
      >
        <p className="text-xs font-bold tracking-widest text-muted-foreground">MESSAGE RECEIVED</p>
        <p className="mt-3 text-2xl font-black tracking-tight">Reference: {state.referenceCode}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          We&apos;ll review it and contact you at {state.email} if a response is required. You can
          track it any time under{' '}
          <a href="/profile/contact" className="underline underline-offset-4">
            Support
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setState(INITIAL_STATE)}
          className="mt-6 rounded-md border border-border px-5 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
        >
          Submit a new request
        </button>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
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
      setState({ status: 'error', message: 'Please check the highlighted fields.', fieldErrors });
      return;
    }

    setState({ status: 'submitting' });
    try {
      const result = await submitContact(parsed.data);
      setState({ status: 'success', referenceCode: result.referenceCode, email: result.email });
    } catch (error) {
      if (error instanceof ContactApiError && error.status === 429) {
        setState({
          status: 'error',
          message: "You've sent a few messages recently. Please try again in a minute.",
        });
        return;
      }
      setState({
        status: 'error',
        message: 'Something went wrong sending your message. Please try again shortly.',
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {initialPageUrl && <input type="hidden" name="pageUrl" value={initialPageUrl} />}

      {/* Reason selector */}
      <fieldset>
        <legend className="text-xs font-bold tracking-widest text-muted-foreground">
          WHAT CAN WE HELP WITH?
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CONTACT_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={`cursor-pointer rounded-lg border p-3 text-sm transition-colors ${
                category === reason.value
                  ? 'border-foreground/40 bg-muted/50'
                  : 'border-border hover:bg-muted/30'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={reason.value}
                checked={category === reason.value}
                onChange={() => setCategory(reason.value)}
                className="sr-only"
              />
              <span className="font-semibold">{reason.label}</span>
              {reason.description && (
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {reason.description}
                </span>
              )}
            </label>
          ))}
        </div>
        {state.fieldErrors?.category && <p className={errorClass}>{state.fieldErrors.category}</p>}
      </fieldset>

      {/* Correction-only fields */}
      {category === 'correction' && (
        <fieldset className="space-y-4 rounded-lg border border-border bg-card p-4">
          <legend className="px-1 text-xs font-bold tracking-widest text-muted-foreground">
            CORRECTION DETAILS
          </legend>
          <div>
            <label htmlFor="sourceUrlCorrection" className={labelClass}>
              Page/content URL
            </label>
            <input
              id="sourceUrlCorrection"
              name="pageUrl"
              type="url"
              defaultValue={initialPageUrl}
              placeholder="https://sportbrainhq.com/..."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="whatIsIncorrect" className={labelClass}>
              What appears incorrect?
            </label>
            <textarea
              id="whatIsIncorrect"
              name="whatIsIncorrect"
              rows={3}
              className={inputClass}
              aria-describedby={
                state.fieldErrors?.whatIsIncorrect ? 'whatIsIncorrect-error' : undefined
              }
            />
            {state.fieldErrors?.whatIsIncorrect && (
              <p id="whatIsIncorrect-error" className={errorClass}>
                {state.fieldErrors.whatIsIncorrect}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="whatItShouldSay" className={labelClass}>
              What should it say?
            </label>
            <textarea id="whatItShouldSay" name="whatItShouldSay" rows={3} className={inputClass} />
          </div>
          <div>
            <label htmlFor="sourceUrl" className={labelClass}>
              Source/reference URL{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              placeholder="https://..."
              className={inputClass}
              aria-describedby={state.fieldErrors?.sourceUrl ? 'sourceUrl-error' : undefined}
            />
            {state.fieldErrors?.sourceUrl && (
              <p id="sourceUrl-error" className={errorClass}>
                {state.fieldErrors.sourceUrl}
              </p>
            )}
          </div>
        </fieldset>
      )}

      {/* Core fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={user.displayName}
            autoComplete="name"
            className={inputClass}
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? 'name-error' : undefined}
          />
          {state.fieldErrors?.name && (
            <p id="name-error" className={errorClass}>
              {state.fieldErrors.name}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={user.email}
            autoComplete="email"
            className={inputClass}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
          />
          {state.fieldErrors?.email && (
            <p id="email-error" className={errorClass}>
              {state.fieldErrors.email}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder={selectedReason?.label ? `${selectedReason.label}: ...` : undefined}
          className={inputClass}
          aria-invalid={Boolean(state.fieldErrors?.subject)}
          aria-describedby={state.fieldErrors?.subject ? 'subject-error' : undefined}
        />
        {state.fieldErrors?.subject && (
          <p id="subject-error" className={errorClass}>
            {state.fieldErrors.subject}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className={inputClass}
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? 'message-error' : undefined}
        />
        {state.fieldErrors?.message && (
          <p id="message-error" className={errorClass}>
            {state.fieldErrors.message}
          </p>
        )}
      </div>

      {state.status === 'error' && state.message && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.status === 'submitting' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
