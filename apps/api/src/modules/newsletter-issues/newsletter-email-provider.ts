/**
 * The boundary between "we have HTML and an address" and "an email actually
 * left this process" — Phase D4/D5.
 *
 * This repo has no real email provider SDK installed (mirrors
 * `NewsletterMailerService`'s D1 stub, and the task's explicit instruction
 * not to wire one speculatively). Defining the interface now, rather than
 * calling a logger directly from the worker/test-email endpoint, is what
 * makes swapping in a real provider later a one-file change
 * (`NewsletterLoggingEmailProvider` -> `NewsletterResendEmailProvider`, say)
 * instead of a search-and-replace through every call site.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  /** e.g. `newsletter-issue-test` or `newsletter-issue-send` — lets a real provider's dashboard distinguish send reasons without parsing the subject. */
  tag?: string;
}

export interface SendEmailResult {
  /** Opaque id the provider assigns to the send — persisted as `NewsletterRecipient.providerMessageId`. A stub provider fabricates one (`stub_<uuid>`); a real provider would return its own. */
  providerMessageId: string;
}

export abstract class NewsletterEmailProvider {
  abstract send(input: SendEmailInput): Promise<SendEmailResult>;
}
