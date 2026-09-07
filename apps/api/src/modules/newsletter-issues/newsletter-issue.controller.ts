import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createIssueRequestSchema,
  paginationQuerySchema,
  updateIssueContentSchema,
  updateIssueMetaSchema,
  type AdminQuestion,
  type ContentSummary,
  type CreateIssueRequest,
  type IssueValidationResult,
  type NewsletterIssueDetail,
  type NewsletterIssueStatus,
  type NewsletterIssueSummary,
  type PaginationQuery,
  type QuestionCategory,
  type QuestionDifficulty,
  type QuestionStatus,
  type UpdateIssueContentRequest,
  type UpdateIssueMetaRequest,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ContentService } from '../content/content.service';
import { NewsletterService } from '../newsletter/newsletter.service';
import { QuestionsService } from '../questions/questions.service';
import { NewsletterIssueService } from './newsletter-issue.service';

/**
 * The Monday Brief issue model administration (Phase D2). Editor/admin only.
 *
 * Mounted at `admin/newsletter/issues`, distinct from `newsletter/` (D1,
 * public subscribe/confirm/unsubscribe) and from `admin/questions` (a
 * separate domain this controller only reads from, via `QuestionsService`,
 * for the SportBrain Challenge picker).
 */
@ApiTags('admin-newsletter-issues')
@Controller('admin/newsletter/issues')
@UseGuards(SessionGuard, RolesGuard)
@Roles('editor', 'admin')
export class NewsletterIssueController {
  constructor(
    private readonly service: NewsletterIssueService,
    private readonly questions: QuestionsService,
    private readonly content: ContentService,
    private readonly newsletter: NewsletterService,
  ) {}

  /**
   * Read-only dashboard stat, not a D1 route: this module reads
   * `NewsletterService.countActiveSubscribers()` (a small addition made to
   * D1's service/repository for this dashboard, see that module's own
   * comments) rather than duplicating the query — kept here, not on
   * `NewsletterController`, so D1's public/me controllers stay untouched
   * beyond that one read method.
   */
  @Get('subscriber-count')
  @ApiOperation({ summary: 'Active subscriber count, for the admin dashboard headline stat' })
  async subscriberCount(): Promise<{ data: { count: number } }> {
    return { data: { count: await this.newsletter.countActiveSubscribers() } };
  }

  @Get()
  @ApiOperation({ summary: 'List newsletter issues, optionally filtered by status' })
  async list(
    @Query(zodPipe(paginationQuerySchema)) pagination: PaginationQuery,
    @Query('status') status?: NewsletterIssueStatus,
  ): Promise<{ data: NewsletterIssueSummary[]; pagination: unknown }> {
    return this.service.listIssues({ status }, pagination);
  }

  // Static routes declared before `:id` — Nest matches in declaration order,
  // and `:id` would otherwise swallow `questions/search`/`content/search` as
  // an attempted UUID lookup (mirrors `QuestionsController`'s
  // `inventory`-before-`:id` ordering).
  @Get('questions/search')
  @ApiOperation({
    summary:
      'Search the Question Bank for the SportBrain Challenge picker (PUBLISHED only by default)',
  })
  async searchQuestions(
    @Query(zodPipe(paginationQuerySchema)) pagination: PaginationQuery,
    @Query('status') status: QuestionStatus = 'PUBLISHED',
    @Query('sportId') sportId?: string,
    @Query('category') category?: QuestionCategory,
    @Query('difficulty') difficulty?: QuestionDifficulty,
    @Query('q') q?: string,
  ): Promise<{ data: AdminQuestion[]; pagination: unknown }> {
    const { rows, total } = await this.questions.list(
      { status, sportId, category, difficulty, q },
      pagination.page,
      pagination.limit,
    );
    return {
      data: rows,
      pagination: { page: pagination.page, limit: pagination.limit, total },
    };
  }

  @Get('content/search')
  @ApiOperation({
    summary: 'Search published SportBrainHQ content for the "From SportBrainHQ" picker',
  })
  async searchContent(
    @Query(zodPipe(paginationQuerySchema)) pagination: PaginationQuery,
    @Query('type') type?: string,
    @Query('sportSlug') sportSlug?: string,
    @Query('q') q?: string,
  ): Promise<{ data: ContentSummary[]; pagination: unknown }> {
    const { rows, total } = await this.content.search(
      { type, sportSlug, q },
      pagination.page,
      pagination.limit,
    );
    return {
      data: rows,
      pagination: { page: pagination.page, limit: pagination.limit, total },
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new DRAFT issue' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(createIssueRequestSchema)) body: CreateIssueRequest,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.createIssue(body, user.id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one issue with its full structured content' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.getIssue(id) };
  }

  /**
   * Same payload as `GET :id` for D2. `NewsletterIssueEditor` uses this route
   * as a boundary marker for "the reader-facing render" rather than reusing
   * `GET :id` directly, so that D4 (real email-preview rendering: desktop /
   * mobile / web variants, actual HTML template) is additive here — a
   * response-shape change on this route, not a new route plus a migration of
   * every caller off `GET :id`.
   *
   * TODO(D4): render desktop/mobile/web preview variants instead of the raw
   * content DTO.
   */
  @Get(':id/preview')
  @ApiOperation({
    summary: 'Preview an issue (D2: same payload as GET :id; D4 adds real rendering)',
  })
  async preview(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.getIssue(id) };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update issue metadata (title, subject, previewText, heroTitle, issueDate)',
  })
  async updateMeta(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updateIssueMetaSchema)) body: UpdateIssueMetaRequest,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.updateMeta(id, body, user.id) };
  }

  @Patch(':id/content')
  @ApiOperation({ summary: 'Save one or more content sections (merged into the stored content)' })
  async updateContent(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updateIssueContentSchema)) body: UpdateIssueContentRequest,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.updateContent(id, body, user.id) };
  }

  @Post(':id/validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run validation without changing status' })
  async validate(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: IssueValidationResult }> {
    return { data: await this.service.validateIssue(id) };
  }

  @Post(':id/ready')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark an issue READY (blocked by any validation error)' })
  async markReady(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ data: NewsletterIssueDetail; validation: IssueValidationResult }> {
    const { issue, validation } = await this.service.markReady(id);
    return { data: issue, validation };
  }

  @Post(':id/duplicate')
  @ApiOperation({
    summary: 'Duplicate an issue into a new DRAFT, copying content but not metadata',
  })
  async duplicate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: NewsletterIssueDetail }> {
    return { data: await this.service.duplicateIssue(id, user.id) };
  }
}
