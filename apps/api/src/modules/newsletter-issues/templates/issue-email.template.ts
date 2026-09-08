import type { RenderedIssue } from '@sportbrain/contracts';
import { buildTrackedLink } from './tracked-link';

/**
 * Builds the full HTML for one issue send (Phase D4).
 *
 * A plain function, not a React-email/MJML component tree: this repo has no
 * such dependency installed, and a nested-table HTML string is something
 * every reviewer can read top to bottom without a build step — the same
 * "plain function over a framework" call `NewsletterMailerService` already
 * makes for the two D1 emails. Table-based layout (not flexbox/grid) because
 * that is still the only layout model every major email client renders
 * consistently; a modern CSS layout here would look fine in a browser
 * preview and broken in Outlook.
 *
 * Signature is `(content, recipientContext) => htmlString` exactly as
 * specified: the caller (worker, test-email endpoint, or a future preview
 * consumer) supplies `RenderedIssue` — the one view model
 * `NewsletterIssueRenderService` produces — plus per-recipient context
 * (their real unsubscribe token, or a dummy one for a test send), and gets
 * back a single self-contained HTML string with everything inlined. No
 * external stylesheet: email clients strip `<link>`/most `<style>` blocks
 * outside the `<head>`'s inline reach, so every rule here is either inline
 * `style="..."` or a `<style>` block email clients are known to honour
 * (Gmail/Apple Mail/Outlook web all keep a `<style>` block in `<head>`).
 */
export interface EmailRecipientContext {
  /** Real subscriber unsubscribe token, or a dummy value for a test send — see `NewsletterDeliveryController.sendTest`. */
  unsubscribeToken: string;
  /** Absolute web-app origin, e.g. `https://sportbrainhq.com` — used to build the unsubscribe/preferences/issue links. */
  frontendUrl: string;
  /** The issue's slug, for `buildTrackedLink`'s `utm_campaign` and for the (future, D7) public archive link. */
  issueSlug: string;
}

export function buildIssueEmailHtml(
  content: RenderedIssue,
  recipient: EmailRecipientContext,
): string {
  const unsubscribeUrl = `${recipient.frontendUrl}/newsletter/unsubscribe/${recipient.unsubscribeToken}`;
  const preferencesUrl = `${recipient.frontendUrl}/me/newsletter`;
  const track = (url: string, section: string) =>
    buildTrackedLink(url, { campaign: recipient.issueSlug, section });

  const sections = [
    renderIntro(content),
    renderQuickRecap(content),
    renderBigStory(content, track),
    renderScoreboard(content),
    renderNumbers(content),
    renderMissedStory(content, track),
    renderHistory(content),
    renderQuiz(content),
    renderWatchNext(content, track),
    renderSportbrainLinks(content, track),
  ]
    .filter((section) => section.length > 0)
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(content.subject)}</title>
<style>
  body, table, td { font-family: -apple-system, Helvetica, Arial, sans-serif; }
  a { color: #1d4ed8; }
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .stack { display: block !important; width: 100% !important; }
  }
</style>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5;">
<span style="display:none; max-height:0; overflow:hidden;">${escapeHtml(content.previewText)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:24px 0;">
  <tr>
    <td align="center">
      <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%; background-color:#ffffff;">
        <tr>
          <td style="padding:32px 32px 16px 32px; text-align:center; border-bottom:3px solid #111827;">
            <h1 style="margin:0; font-size:22px; font-weight:900; color:#111827;">${escapeHtml(content.heroTitle)}</h1>
            <p style="margin:8px 0 0 0; font-size:13px; color:#6b7280;">Issue #${content.issueNumber} &middot; ${escapeHtml(formatIssueDate(content.issueDate))}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px;">
            ${sections}
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px; border-top:1px solid #e5e7eb; text-align:center; font-size:12px; color:#9ca3af;">
            <p style="margin:0 0 8px 0;">You're receiving this because you subscribed to The Monday Brief.</p>
            <p style="margin:0;">
              <a href="${escapeAttribute(preferencesUrl)}" style="color:#6b7280;">Manage Preferences</a>
              &nbsp;&middot;&nbsp;
              <a href="${escapeAttribute(unsubscribeUrl)}" style="color:#6b7280;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// --- Section renderers ---------------------------------------------------------
// Each returns '' when its section is absent/empty, so the top-level filter
// drops it entirely rather than mailing an empty heading.

function renderIntro(content: RenderedIssue): string {
  if (!content.intro) return '';
  return `<p style="margin:0 0 20px 0; font-size:15px; line-height:1.6; color:#374151;">${escapeHtml(content.intro)}</p>`;
}

function renderQuickRecap(content: RenderedIssue): string {
  if (content.quickRecap.length === 0) return '';
  const items = content.quickRecap
    .map((item) => `<li style="margin-bottom:6px;">${escapeHtml(item.text)}</li>`)
    .join('');
  return sectionBlock(
    '60-Second Recap',
    `<ul style="margin:0; padding-left:20px; font-size:14px; color:#374151;">${items}</ul>`,
  );
}

function renderBigStory(
  content: RenderedIssue,
  track: (url: string, section: string) => string,
): string {
  if (!content.bigStory) return '';
  const story = content.bigStory;
  const link = story.link
    ? `<p style="margin:12px 0 0 0;"><a href="${escapeAttribute(track(story.link, 'big_story'))}" style="font-size:14px; font-weight:600;">Read more &rarr;</a></p>`
    : '';
  return sectionBlock(
    'Big Story',
    `<h3 style="margin:0 0 8px 0; font-size:17px; color:#111827;">${escapeHtml(story.headline)}</h3>
     <p style="margin:0 0 10px 0; font-size:14px; line-height:1.6; color:#374151;">${escapeHtml(story.summary)}</p>
     <p style="margin:0 0 6px 0; font-size:13px; color:#4b5563;"><strong>What happened:</strong> ${escapeHtml(story.whatHappened)}</p>
     <p style="margin:0 0 6px 0; font-size:13px; color:#4b5563;"><strong>Why it matters:</strong> ${escapeHtml(story.whyItMatters)}</p>
     <p style="margin:0; font-size:13px; color:#4b5563;"><strong>What changes now:</strong> ${escapeHtml(story.whatChangesNow)}</p>
     ${link}`,
  );
}

function renderScoreboard(content: RenderedIssue): string {
  if (content.scoreboard.length === 0) return '';
  const groups = content.scoreboard
    .map((group) => {
      const items = group.items
        .map(
          (item) =>
            `<tr><td style="padding:4px 0; font-size:13px; color:#374151;">${escapeHtml(item.label)}</td><td style="padding:4px 0; font-size:13px; color:#111827; font-weight:600; text-align:right;">${escapeHtml(item.result)}</td></tr>`,
        )
        .join('');
      return `<p style="margin:14px 0 4px 0; font-size:13px; font-weight:700; text-transform:uppercase; color:#6b7280;">${escapeHtml(group.sport)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items}</table>`;
    })
    .join('');
  return sectionBlock('Scoreboard', groups);
}

function renderNumbers(content: RenderedIssue): string {
  if (content.numbers.length === 0) return '';
  const cards = content.numbers
    .map(
      (item) =>
        `<td class="stack" style="padding:10px; text-align:center; border:1px solid #e5e7eb;">
           <div style="font-size:22px; font-weight:900; color:#111827;">${escapeHtml(item.value)}</div>
           <div style="font-size:12px; color:#6b7280;">${escapeHtml(item.caption)}</div>
         </td>`,
    )
    .join('');
  return sectionBlock(
    'Numbers of the Week',
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="6"><tr>${cards}</tr></table>`,
  );
}

function renderMissedStory(
  content: RenderedIssue,
  track: (url: string, section: string) => string,
): string {
  if (!content.missedStory) return '';
  const story = content.missedStory;
  const link = story.link
    ? `<p style="margin:10px 0 0 0;"><a href="${escapeAttribute(track(story.link, 'missed_story'))}" style="font-size:14px; font-weight:600;">Read more &rarr;</a></p>`
    : '';
  return sectionBlock(
    'Story You May Have Missed',
    `<h3 style="margin:0 0 8px 0; font-size:16px; color:#111827;">${escapeHtml(story.headline)}</h3>
     <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">${escapeHtml(story.summary)}</p>
     ${link}`,
  );
}

function renderHistory(content: RenderedIssue): string {
  if (!content.history) return '';
  const item = content.history;
  return sectionBlock(
    'This Week in Sports History',
    `<p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#6b7280;">${escapeHtml(item.year)}</p>
     <h3 style="margin:0 0 8px 0; font-size:16px; color:#111827;">${escapeHtml(item.headline)}</h3>
     <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">${escapeHtml(item.summary)}</p>`,
  );
}

function renderQuiz(content: RenderedIssue): string {
  const snapshot = content.quiz?.questionSnapshot;
  if (!snapshot) return '';
  const options = snapshot.options
    .map(
      (option) =>
        `<li style="margin-bottom:4px;">${escapeHtml(option.optionCode)}. ${escapeHtml(option.optionText)}</li>`,
    )
    .join('');
  return sectionBlock(
    'The SportBrain Challenge',
    `<p style="margin:0 0 8px 0; font-size:14px; font-weight:600; color:#111827;">${escapeHtml(snapshot.questionText)}</p>
     <ul style="margin:0; padding-left:20px; font-size:14px; color:#374151;">${options}</ul>`,
  );
}

function renderWatchNext(
  content: RenderedIssue,
  track: (url: string, section: string) => string,
): string {
  if (content.watchNext.length === 0) return '';
  const items = content.watchNext
    .map((item) => {
      const link = item.link
        ? `<a href="${escapeAttribute(track(item.link, 'watch_next'))}" style="font-size:13px;">Details &rarr;</a>`
        : '';
      return `<div style="margin-bottom:10px;">
        <p style="margin:0; font-size:14px; font-weight:600; color:#111827;">${escapeHtml(item.sport)}: ${escapeHtml(item.event)}</p>
        <p style="margin:2px 0 0 0; font-size:13px; color:#6b7280;">${escapeHtml(item.datetime)}${item.context ? ` &mdash; ${escapeHtml(item.context)}` : ''}</p>
        ${link}
      </div>`;
    })
    .join('');
  return sectionBlock('What to Watch', items);
}

function renderSportbrainLinks(
  content: RenderedIssue,
  track: (url: string, section: string) => string,
): string {
  if (content.sportbrainLinks.length === 0) return '';
  const items = content.sportbrainLinks
    .map(
      (link) =>
        `<li style="margin-bottom:6px;"><a href="${escapeAttribute(track(link.url, 'sportbrain_links'))}" style="font-size:14px;">${escapeHtml(link.label)}</a></li>`,
    )
    .join('');
  return sectionBlock(
    'From SportBrainHQ',
    `<ul style="margin:0; padding-left:20px;">${items}</ul>`,
  );
}

function sectionBlock(title: string, bodyHtml: string): string {
  return `<div style="margin-bottom:24px;">
    <h2 style="margin:0 0 12px 0; font-size:14px; font-weight:800; text-transform:uppercase; letter-spacing:0.05em; color:#111827; border-bottom:2px solid #111827; padding-bottom:6px;">${escapeHtml(title)}</h2>
    ${bodyHtml}
  </div>`;
}

function formatIssueDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/** Minimal HTML-entity escaping for text content — this template has no other source of untrusted-ish input (editor-authored content) reaching raw markup. */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Same escaping plus quote-escaping, for values interpolated inside an `href="..."` attribute. */
function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
