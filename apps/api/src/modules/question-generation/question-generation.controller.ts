import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  approveCandidateRequestSchema,
  createGenerationJobRequestSchema,
  editAndApproveCandidateRequestSchema,
  patchCandidateRequestSchema,
  rejectCandidateRequestSchema,
  type ApproveCandidateRequest,
  type CreateGenerationJobRequest,
  type EditAndApproveCandidateRequest,
  type GenerationJob,
  type PatchCandidateRequest,
  type QuestionCandidate,
  type RejectCandidateRequest,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CandidateReviewService } from './candidate-review.service';
import { QuestionGenerationJobService } from './question-generation-job.service';

/**
 * Generation jobs (Part 15-16) and the candidate review queue (Part 17).
 * Editor/admin only, same as `QuestionsController` — generation is an
 * editorial tool, not a public or even a general-user surface.
 */
@ApiTags('admin-question-generation')
@Controller()
@UseGuards(SessionGuard, RolesGuard)
@Roles('editor', 'admin')
export class QuestionGenerationController {
  constructor(
    private readonly jobs: QuestionGenerationJobService,
    private readonly review: CandidateReviewService,
  ) {}

  @Post('admin/question-generation/jobs')
  @ApiOperation({
    summary: 'Start a generation job: generate candidates, validate, and queue for review',
  })
  async createJob(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(createGenerationJobRequestSchema)) body: CreateGenerationJobRequest,
  ): Promise<{ data: GenerationJob }> {
    return { data: await this.jobs.createJob(body, user.id) };
  }

  @Get('admin/question-generation/jobs')
  @ApiOperation({ summary: 'List recent generation jobs' })
  async listJobs(): Promise<{ data: GenerationJob[] }> {
    return { data: await this.jobs.listJobs() };
  }

  @Get('admin/question-generation/jobs/:id')
  @ApiOperation({ summary: 'One generation job with its counters' })
  async findJob(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: GenerationJob }> {
    return { data: await this.jobs.findJob(id) };
  }

  @Get('admin/question-generation/jobs/:id/candidates')
  @ApiOperation({ summary: 'Candidates produced by a job, for the review queue' })
  async listCandidates(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ data: QuestionCandidate[] }> {
    return { data: await this.jobs.listCandidates(id) };
  }

  @Post('admin/question-candidates/:id/approve')
  @ApiOperation({ summary: 'Approve a candidate as-is, publishing it into the Question Bank' })
  async approve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodPipe(approveCandidateRequestSchema)) body: ApproveCandidateRequest,
  ): Promise<{ data: QuestionCandidate }> {
    return { data: await this.review.approve(id, user.id, body) };
  }

  @Post('admin/question-candidates/:id/reject')
  @ApiOperation({ summary: 'Reject a candidate' })
  async reject(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodPipe(rejectCandidateRequestSchema)) body: RejectCandidateRequest,
  ): Promise<{ data: QuestionCandidate }> {
    return { data: await this.review.reject(id, user.id, body) };
  }

  @Post('admin/question-candidates/:id/publish')
  @ApiOperation({ summary: 'Edit and approve a candidate, publishing the edited version' })
  async editAndApprove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodPipe(editAndApproveCandidateRequestSchema)) body: EditAndApproveCandidateRequest,
  ): Promise<{ data: QuestionCandidate }> {
    return { data: await this.review.editAndApprove(id, user.id, body) };
  }

  @Patch('admin/question-candidates/:id')
  @ApiOperation({ summary: 'Edit a candidate without approving it yet' })
  async patch(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodPipe(patchCandidateRequestSchema)) body: PatchCandidateRequest,
  ): Promise<{ data: QuestionCandidate }> {
    return { data: await this.review.patch(id, body) };
  }
}
