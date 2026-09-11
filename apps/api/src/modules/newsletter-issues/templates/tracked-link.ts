/**
 * Appends UTM parameters to an outbound link mailed inside a newsletter
 * issue, so click-through can be attributed back to "this issue, this
 * section, this campaign" in whatever analytics tool later reads
 * `utm_campaign`/`utm_content`. Centralized here rather than built ad hoc at
 * each template call site, so every outbound link in the email (big story,
 * scoreboard result, watch-next fixture, sportbrain link) carries the exact
 * same parameter names — a template that free-hands `?utm_source=x` per
 * section is how two sections end up with subtly different tracking keys.
 *
 * `campaign` is the issue's slug (e.g. `monday-brief-2026-09-07`), used
 * as-is for `utm_campaign` — stable and human-readable in an analytics
 * dashboard, unlike a campaign row's UUID.
 */
export interface TrackedLinkContext {
  /** The issue slug — becomes `utm_campaign`. */
  campaign: string;
  /** The content section the link appears in (e.g. `big_story`, `scoreboard`, `watch_next`, `sportbrain_links`) — becomes `utm_content`. */
  section: string;
}

const UTM_SOURCE = 'newsletter';
const UTM_MEDIUM = 'email';

export function buildTrackedLink(url: string, context: TrackedLinkContext): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Not a valid absolute URL (shouldn't happen — content schemas validate
    // `.url()` on every link field — but a template must never throw over a
    // bad link; it just mails the link untracked rather than failing the
    // whole send).
    return url;
  }

  parsed.searchParams.set('utm_source', UTM_SOURCE);
  parsed.searchParams.set('utm_medium', UTM_MEDIUM);
  parsed.searchParams.set('utm_campaign', context.campaign);
  parsed.searchParams.set('utm_content', context.section);
  return parsed.toString();
}
