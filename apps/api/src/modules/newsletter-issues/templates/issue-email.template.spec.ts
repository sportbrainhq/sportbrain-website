import { describe, expect, it } from 'vitest';
import type { RenderedIssue } from '@sportbrain/contracts';
import { buildIssueEmailHtml } from './issue-email.template';

function renderedIssue(overrides: Partial<RenderedIssue> = {}): RenderedIssue {
  return {
    issueNumber: 47,
    title: 'Monday Brief #47',
    subject: 'The upset nobody saw coming',
    previewText: 'Plus: this week in numbers',
    heroTitle: 'The Monday Brief',
    issueDate: '2026-09-07T00:00:00.000Z',
    intro: 'A short opening line.',
    quickRecap: [{ text: 'Team A beat Team B' }],
    bigStory: {
      headline: 'A huge upset',
      summary: 'Summary text',
      whatHappened: 'It happened',
      whyItMatters: 'It matters',
      whatChangesNow: 'Things change',
      link: 'https://sportbrainhq.com/content/the-upset',
    },
    scoreboard: [{ sport: 'Football', items: [{ label: 'A vs B', result: '2-1' }] }],
    numbers: [{ value: '47', caption: 'issues published' }],
    missedStory: null,
    history: null,
    quiz: null,
    watchNext: [],
    sportbrainLinks: [],
    ...overrides,
  };
}

describe('buildIssueEmailHtml', () => {
  const recipient = {
    unsubscribeToken: 'token-abc123',
    frontendUrl: 'https://sportbrainhq.com',
    issueSlug: 'monday-brief-2026-09-07',
  };

  it('contains a working unsubscribe link built from the recipient token', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).toContain('https://sportbrainhq.com/newsletter/unsubscribe/token-abc123');
    expect(html).toContain('Unsubscribe');
  });

  it('contains a Manage Preferences link', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).toContain('Manage Preferences');
    expect(html).toContain('https://sportbrainhq.com/me/newsletter');
  });

  it('contains subject-relevant content (subject line and big story headline)', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).toContain('The upset nobody saw coming');
    expect(html).toContain('A huge upset');
  });

  it('applies UTM tracking params to outbound content links', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).toContain('utm_source=newsletter');
    expect(html).toContain('utm_campaign=monday-brief-2026-09-07');
    expect(html).toContain('utm_content=big_story');
  });

  it('contains no unescaped placeholder markers', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).not.toMatch(/\{\{.*?\}\}/);
    expect(html).not.toMatch(/undefined/);
    expect(html).not.toMatch(/\[object Object\]/);
  });

  it('omits empty sections entirely rather than rendering an empty heading', () => {
    const html = buildIssueEmailHtml(
      renderedIssue({ missedStory: null, history: null, quiz: null, numbers: [] }),
      recipient,
    );
    expect(html).not.toContain('Story You May Have Missed');
    expect(html).not.toContain('This Week in Sports History');
    expect(html).not.toContain('The SportBrain Challenge');
    expect(html).not.toContain('Numbers of the Week');
  });

  it('escapes HTML-significant characters in editor-authored text', () => {
    const html = buildIssueEmailHtml(
      renderedIssue({ intro: 'A & B <script>alert(1)</script>' }),
      recipient,
    );
    expect(html).toContain('A &amp; B &lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('produces a full, well-formed HTML document', () => {
    const html = buildIssueEmailHtml(renderedIssue(), recipient);
    expect(html).toMatch(/^<!doctype html>/i);
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
  });
});
