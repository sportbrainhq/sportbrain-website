import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  paginationQuerySchema,
  type PaginationQuery,
  type PublicIssueDetail,
  type PublicIssueSummary,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { NewsletterArchiveService } from './newsletter-archive.service';

/**
 * The public Monday Brief archive (Phase D7). No guard, no session — same
 * "public, anonymous surface" posture as D1's `NewsletterController`
 * (`newsletter/subscribe`, `newsletter/confirm/:token`, ...), which is why
 * these routes are added on the same `newsletter` base path in a sibling
 * controller rather than under `admin/newsletter/issues` (D2, editor/admin
 * only) or a differently-named base path — org spec section 66 lists these
 * as `GET /newsletter/issues` and `GET /newsletter/issues/:slug`, and a
 * second top-level base path for the same noun ("newsletter") would just be
 * two ways to spell the same thing.
 *
 * A separate controller class (not added to `NewsletterController` itself)
 * because the two read from entirely different repositories/modules
 * (`NewsletterArchiveService` -> `NewsletterIssueRepository`/
 * `NewsletterIssueRenderService`, D2/D4's issue model; `NewsletterController`
 * -> `NewsletterRepository`, D1's subscription model) — keeping them
 * separate mirrors how `NewsletterMeController` is its own class alongside
 * `NewsletterController` rather than one controller importing both
 * services.
 */
@ApiTags('newsletter-archive')
@Controller('newsletter')
export class NewsletterArchiveController {
  constructor(private readonly service: NewsletterArchiveService) {}

  @Get('issues')
  @ApiOperation({ summary: 'Public archive listing: published issues only, newest first' })
  async list(
    @Query(zodPipe(paginationQuerySchema)) pagination: PaginationQuery,
  ): Promise<{ data: PublicIssueSummary[]; pagination: unknown }> {
    return this.service.listPublished(pagination);
  }

  /**
   * Declared after `issues` (a static path segment) so `:slug` never
   * shadows it — same "static before dynamic" convention
   * `NewsletterIssueController` follows for `questions/search`/
   * `content/search` before its own `:id`. `issues/:slug` here has no
   * further static sibling to worry about (there is no `issues/something`
   * this route would otherwise swallow), but the ordering is kept
   * consistent with the rest of this domain regardless.
   */
  @Get('issues/:slug')
  @ApiOperation({ summary: 'One published issue by slug, rendered for public display' })
  async detail(@Param('slug') slug: string): Promise<{ data: PublicIssueDetail }> {
    return { data: await this.service.getPublishedBySlug(slug) };
  }
}
