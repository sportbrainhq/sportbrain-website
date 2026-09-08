import { Injectable } from '@nestjs/common';
import type {
  NewsletterIssueContent,
  NewsletterIssueDetail,
  RenderedIssue,
} from '@sportbrain/contracts';

/**
 * Turns an issue's raw `content` jsonb (plus its own title/subject/etc.)
 * into `RenderedIssue`: one presentation-ready view model with every
 * optional section resolved to a stable, always-present shape (`undefined`
 * sections become `null`/`[]`).
 *
 * One source of truth, three consumers (Phase D4):
 *   - the admin preview endpoint (`NewsletterIssueController.preview`)
 *   - the email template builder (`templates/issue-email.template.ts`)
 *   - the public issue page (D7, later — not built in this phase, but this
 *     model is designed so that page can consume it unchanged)
 *
 * Desktop/mobile/web are NOT three different render paths here. They are one
 * render (this service) consumed by presentation layers that each apply
 * their own container width: the admin preview page renders this same
 * `RenderedIssue` inside a 600px-wide pane for "mobile" and a wider pane for
 * "desktop", and the email template is one responsive table-based HTML
 * document that reflows at the same breakpoint most mail clients honour.
 * There is no content difference between the three — a real difference
 * (e.g. a shorter mobile-only summary) would justify a second model, but
 * nothing in the current content schema asks for that, so introducing one
 * speculatively would just be two shapes to keep in sync for no product
 * reason.
 */
@Injectable()
export class NewsletterIssueRenderService {
  render(
    issue: Pick<
      NewsletterIssueDetail,
      'issueNumber' | 'title' | 'subject' | 'previewText' | 'heroTitle' | 'issueDate' | 'content'
    >,
  ): RenderedIssue {
    const content = (issue.content ?? {}) as NewsletterIssueContent;

    return {
      issueNumber: issue.issueNumber,
      title: issue.title,
      subject: issue.subject,
      previewText: issue.previewText,
      heroTitle: issue.heroTitle ?? issue.title,
      issueDate: issue.issueDate,
      intro: content.intro ?? null,
      quickRecap: content.quickRecap ?? [],
      bigStory: content.bigStory ?? null,
      scoreboard: content.scoreboard ?? [],
      numbers: content.numbers ?? [],
      missedStory: content.missedStory ?? null,
      history: content.history ?? null,
      quiz: content.quiz ?? null,
      watchNext: content.watchNext ?? [],
      sportbrainLinks: content.sportbrainLinks ?? [],
    };
  }
}
