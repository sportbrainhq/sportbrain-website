'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitContactForm, type ContactFormState } from '@/app/contact/actions';
import { CONTACT_REASONS, type ContactReasonOption } from '@/app/contact/content';

const INITIAL_STATE: ContactFormState = { status: 'idle' };

const inputClass =
  'mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-foreground/40 focus:ring-2 focus:ring-primary/20';
const labelClass = 'text-sm font-semibold';
const errorClass = 'mt-1.5 text-xs font-medium text-destructive';

interface ContactFormProps {
  /** Pre-fills the reason and page reference when opened from content (e.g. a "Report an issue" link). */
  initialCategory?: ContactReasonOption['value'];
  initialPageUrl?: string;
  /** Pre-populated when the visitor is signed in. Neither is read from anywhere yet — no auth system exists (see InternalApiKeyGuard's caveat) — so both default empty. */
  initialName?: string;
  initialEmail?: string;
}

export function ContactForm({
  initialCategory = 'general',
  initialPageUrl,
  initialName = '',
  initialEmail = '',
}: ContactFormProps) {
  const [state, formAction] = useActionState(submitContactForm, INITIAL_STATE);
  const [category, setCategory] = useState<ContactReasonOption['value']>(initialCategory);

  const selectedReason = useMemo(
    () => CONTACT_REASONS.find((reason) => reason.value === category),
    [category],
  );

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
          We&apos;ll review it and contact you at {state.email} if a response is required.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6" noValidate>
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
            defaultValue={initialName}
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
            defaultValue={initialEmail}
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

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Sending…' : 'Send message'}
    </button>
  );
}
