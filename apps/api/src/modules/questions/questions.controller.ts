import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  checkDuplicateRequestSchema,
  createQuestionRequestSchema,
  type AdminQuestion,
  type CheckDuplicateRequest,
  type CreateQuestionRequest,
  type QuestionInventory,
  type QuestionValidationResult,
  type SportCategoryInventory,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { QuestionInventoryService } from './question-inventory.service';
import { QuestionsService } from './questions.service';

/**
 * Question Bank administration. Editor/admin only — there is no public read
 * route here yet because nothing outside this module selects individual
 * questions until `QuizGenerationService` (a later phase) exists to do it
 * through snapshots, never a direct question fetch.
 */
@ApiTags('admin-questions')
@Controller('admin/questions')
@UseGuards(SessionGuard, RolesGuard)
@Roles('editor', 'admin')
export class QuestionsController {
  constructor(
    private readonly service: QuestionsService,
    private readonly inventory: QuestionInventoryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a canonical question (runs the full validation pipeline)' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(createQuestionRequestSchema)) body: CreateQuestionRequest,
  ): Promise<{ data: AdminQuestion }> {
    return { data: await this.service.create(body, user.id) };
  }

  // Static routes declared before `:id` — Nest matches in declaration order,
  // and `:id` would otherwise swallow `inventory`/`inventory/:sportId` as an
  // attempted UUID lookup.
  @Get('inventory')
  @ApiOperation({
    summary: 'Question bank inventory: totals by status, sport, difficulty (Part 62)',
  })
  async inventorySummary(): Promise<{ data: QuestionInventory }> {
    return { data: await this.inventory.summary() };
  }

  @Get('inventory/:sportId')
  @ApiOperation({
    summary: "One sport's category breakdown, for spotting underrepresented categories (Part 63)",
  })
  async inventoryBySport(
    @Param('sportId', ParseUUIDPipe) sportId: string,
  ): Promise<{ data: SportCategoryInventory }> {
    return { data: await this.inventory.categoryBreakdown(sportId) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one question with its options and full provenance' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<{ data: AdminQuestion }> {
    return { data: await this.service.findById(id) };
  }

  @Post('check-duplicate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pre-flight exact-duplicate check, before submitting the full form' })
  @ApiOkResponse({ description: 'Duplicate outcome for the given sport + question text' })
  async checkDuplicate(
    @Body(zodPipe(checkDuplicateRequestSchema)) body: CheckDuplicateRequest,
  ): Promise<{ data: QuestionValidationResult['duplicate'] }> {
    return { data: await this.service.checkDuplicate(body.sportId, body.questionText) };
  }
}
