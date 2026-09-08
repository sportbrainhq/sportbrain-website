import { z } from 'zod';

/**
 * Delivery-provider webhook boundary — Phase D6.
 *
 * D5 (`newsletter-campaign.ts`) built the send path but has no way to learn
 * that a send actually reached an inbox, bounced, or triggered a spam
 * complaint — that information only exists on the provider's side, and only
 * a webhook can bring it back. This file is deliberately narrow: no real
 * email provider is installed yet (see `NewsletterEmailProvider`, D1/D4's
 * logging stub), so there is no real webhook payload shape to parse. Rather
 * than fabricate one provider's (Resend/SES/SendGrid) actual schema, this
 * defines the NORMALIZED internal event shape every provider's webhook will
 * eventually be adapted into, and has `POST /webhooks/email/:provider`
 * accept that shape directly for now. Wiring a real provider later is a thin
 * adapter in front of this endpoint (raw payload -> `NewsletterWebhookEvent`),
 * not a change to anything downstream of it.
 */

/**
 * `delivered`: the provider confirms the message reached the recipient's
 * mail server. `bounced`: a hard bounce — the address is permanently
 * suppressed (see `NewsletterWebhookService`). `complained`: a spam
 * complaint — also a permanent suppression, kept distinct from `bounced` so
 * the subscription's `status` records which one happened.
 */
export const newsletterWebhookEventTypeSchema = z.enum(['delivered', 'bounced', 'complained']);
export type NewsletterWebhookEventType = z.infer<typeof newsletterWebhookEventTypeSchema>;

/**
 * `POST /webhooks/email/:provider` body — the normalized shape described
 * above. `providerMessageId` is matched against
 * `newsletter_recipient.providerMessageId` (see that schema's own comment on
 * the column) to find which recipient/campaign/subscription this event is
 * about. `recipientEmail` is optional and currently unused for matching
 * (`providerMessageId` is authoritative) — carried along only because most
 * real provider payloads include it and dropping it at the boundary would
 * lose information the future real-provider adapter might want to log or
 * cross-check. `raw` preserves whatever the caller sent, verbatim, so a
 * genuinely malformed/unexpected event is still fully logged rather than
 * silently truncated to the fields this schema knows about.
 */
export const newsletterWebhookEventSchema = z
  .object({
    type: newsletterWebhookEventTypeSchema,
    providerMessageId: z.string().trim().min(1),
    recipientEmail: z.string().trim().email().optional(),
    timestamp: z.string().datetime(),
    raw: z.unknown().optional(),
  })
  .strict();
export type NewsletterWebhookEvent = z.infer<typeof newsletterWebhookEventSchema>;

/** `POST /webhooks/email/:provider` response. Always 200 on a structurally valid, signature-verified request — even an event referencing an unknown `providerMessageId` is acknowledged, not rejected, so the provider does not retry forever against a permanently-unmatched id (see `NewsletterWebhookService.handleEvent`'s "unknown id: log and ignore" reasoning). */
export const newsletterWebhookAckResponseSchema = z.object({
  received: z.literal(true),
  matched: z.boolean(),
});
export type NewsletterWebhookAckResponse = z.infer<typeof newsletterWebhookAckResponseSchema>;
