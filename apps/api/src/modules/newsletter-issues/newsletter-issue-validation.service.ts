import { Injectable } from '@nestjs/common';
import type { IssueValidationResult, NewsletterIssueContent } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { content, question } from '../../database/schema';
import { and, eq } from 'drizzle-orm';
import type { NewsletterIssueRow } from './newsletter-issue.repository';

/** Scanned against every string field in an issue's content — never against `subject`/`previewText`/`title` alone, since a placeholder left inside `bigStory.summary` is exactly as embarrassing in a live send. */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /todo/i,
  /lorem ipsum/i,
  /example\.com/i,
  /\btbd\b/i,
  /\[insert/i,
  /test@test\.com/i,
];

/**
 * Everything that must be true before an issue can move DRAFT -> READY.
 *
 * Split from `NewsletterIssueService` for the same reason
 * `QuestionValidationService` is its own file: the rules here are the part
 * of this domain most likely to grow (more sections, more link checks) and
 * least related to CRUD plumbing, so they get an isolated, easily-tested
 * home.
 *
 * `errors` block the transition; `warnings` (mostly placeholder detection)
 * never do — an editor's own "TODO: check this stat" note should be visible,
 * not silently swallowed, but must not be able to lock the issue.
 */
@Injectable()
export class NewsletterIssueValidationService {
  constructor(private readonly database: DatabaseService) {}

  async validate(issue: NewsletterIssueRow): Promise<IssueValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const issueContent = (issue.content ?? {}) as NewsletterIssueContent;

    // --- Required metadata ---------------------------------------------------
    if (!issue.subject?.trim()) errors.push('Subject line is required.');
    if (!issue.previewText?.trim()) errors.push('Preview text is required.');
    if (!issue.issueDate) errors.push('Issue date is required.');

    // --- Required sections ----------------------------------------------------
    if (!issueContent.quickRecap || issueContent.quickRecap.length === 0) {
      errors.push('60-Second Recap must have at least one item.');
    }

    const bigStory = issueContent.bigStory;
    if (!bigStory) {
      errors.push('Big Story is required.');
    } else {
      const requiredFields: Array<[keyof typeof bigStory, string]> = [
        ['headline', 'Big Story headline'],
        ['summary', 'Big Story summary'],
        ['whatHappened', 'Big Story "What Happened"'],
        ['whyItMatters', 'Big Story "Why It Matters"'],
        ['whatChangesNow', 'Big Story "What Changes Now"'],
      ];
      for (const [field, label] of requiredFields) {
        if (!bigStory[field] || String(bigStory[field]).trim() === '') {
          errors.push(`${label} is required.`);
        }
      }
    }

    // --- Structural link checks (only when present — these sections are optional) ---
    for (const item of issueContent.watchNext ?? []) {
      if (item.link && !this.isValidUrl(item.link)) {
        errors.push(`"What to Watch" item "${item.event}" has an invalid link.`);
      }
    }
    for (const link of issueContent.sportbrainLinks ?? []) {
      if (!this.isValidUrl(link.url)) {
        errors.push(`"From SportBrainHQ" link "${link.label}" has an invalid URL.`);
      }
    }
    if (bigStory?.link && !this.isValidUrl(bigStory.link)) {
      errors.push('Big Story link is invalid.');
    }
    if (issueContent.missedStory?.link && !this.isValidUrl(issueContent.missedStory.link)) {
      errors.push('"Story You May Have Missed" link is invalid.');
    }

    // --- Quiz question must reference a PUBLISHED question -------------------
    if (issueContent.quiz?.questionId) {
      const [row] = await this.database.db
        .select({ id: question.id, status: question.status })
        .from(question)
        .where(eq(question.id, issueContent.quiz.questionId))
        .limit(1);
      if (!row) {
        errors.push('The selected SportBrain Challenge question no longer exists.');
      } else if (row.status !== 'PUBLISHED') {
        errors.push('The selected SportBrain Challenge question is not published.');
      }
    }

    // --- SportBrainHQ content links must resolve ------------------------------
    for (const link of issueContent.sportbrainLinks ?? []) {
      if (link.type === 'content' && link.refId) {
        const [row] = await this.database.db
          .select({ id: content.id })
          .from(content)
          .where(and(eq(content.id, link.refId), eq(content.status, 'published')))
          .limit(1);
        if (!row) {
          errors.push(
            `"From SportBrainHQ" link "${link.label}" points at content that no longer exists or isn't published.`,
          );
        }
      }
      if (link.type === 'question' && link.refId) {
        const [row] = await this.database.db
          .select({ id: question.id })
          .from(question)
          .where(eq(question.id, link.refId))
          .limit(1);
        if (!row) {
          errors.push(
            `"From SportBrainHQ" link "${link.label}" points at a question that no longer exists.`,
          );
        }
      }
    }

    // --- Placeholder detection: warnings only ----------------------------------
    for (const text of this.collectStrings(issue, issueContent)) {
      if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text))) {
        warnings.push(`Possible placeholder text found: "${text.slice(0, 80)}"`);
      }
    }

    return { errors, warnings };
  }

  private isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  /** Flattens every user-authored string in the issue (meta + every content section) for the placeholder scan. */
  private collectStrings(issue: NewsletterIssueRow, content: NewsletterIssueContent): string[] {
    const strings: string[] = [issue.title, issue.subject, issue.previewText];
    if (issue.heroTitle) strings.push(issue.heroTitle);
    if (content.intro) strings.push(content.intro);
    for (const item of content.quickRecap ?? []) strings.push(item.text);
    if (content.bigStory) {
      strings.push(
        content.bigStory.headline,
        content.bigStory.summary,
        content.bigStory.whatHappened,
        content.bigStory.whyItMatters,
        content.bigStory.whatChangesNow,
      );
    }
    for (const group of content.scoreboard ?? []) {
      for (const item of group.items) strings.push(item.label, item.result);
    }
    for (const item of content.numbers ?? []) strings.push(item.value, item.caption);
    if (content.missedStory)
      strings.push(content.missedStory.headline, content.missedStory.summary);
    if (content.history) strings.push(content.history.headline, content.history.summary);
    for (const item of content.watchNext ?? []) {
      strings.push(item.event, item.datetime);
      if (item.context) strings.push(item.context);
    }
    for (const link of content.sportbrainLinks ?? []) strings.push(link.label);
    return strings.filter((value): value is string => Boolean(value));
  }
}
