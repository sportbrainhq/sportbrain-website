import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  paginationQuerySchema,
  updateContactStatusRequestSchema,
  type ContactSubmissionDetail,
  type ContactSubmissionSummary,
  type PaginationQuery,
  type UpdateContactStatusRequest,
} from '@sportbrain/contracts';
import { zodPipe } from '../../common';
import { InternalApiKeyGuard } from '../../common/guards/internal-api-key.guard';
import { ContactService } from './contact.service';

/**
 * Admin/ops surface for contact submissions. Not part of the public API.
 *
 * Gated by `InternalApiKeyGuard` — the same v1 shared-secret stopgap
 * `InternalNewsController` uses, and with the same caveat: this is not a
 * real per-operator auth system (no roles, no identity, no audit trail
 * beyond request logging). Reusing it here is consistent with how this
 * codebase already handles "no auth system exists yet" rather than
 * inventing a second, different stopgap. A real admin-auth story (session-
 * or role-based) is a decision for the team — flagged here rather than
 * fabricated, per this file's own precedent.
 */
@ApiTags('contact-admin')
@ApiHeader({
  name: 'X-Internal-Api-Key',
  description: 'Shared-secret stopgap auth. See InternalApiKeyGuard for the v1 caveat.',
  required: true,
})
@ApiUnauthorizedResponse({
  description: 'Missing/invalid X-Internal-Api-Key, or INTERNAL_API_KEY unconfigured',
})
@UseGuards(InternalApiKeyGuard)
@Controller({ path: 'internal/contact', version: VERSION_NEUTRAL })
export class ContactAdminController {
  constructor(private readonly service: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'List contact submissions' })
  @ApiOkResponse({ description: 'A paginated list, newest first' })
  async list(@Query(zodPipe(paginationQuerySchema)) query: PaginationQuery): Promise<{
    data: ContactSubmissionSummary[];
    pagination: unknown;
  }> {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Fetch one contact submission' })
  @ApiOkResponse({ description: 'Full submission detail' })
  async byId(@Param('id') id: string): Promise<ContactSubmissionDetail> {
    return this.service.findById(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: "Update a submission's status" })
  @ApiOkResponse({ description: 'The updated submission' })
  async updateStatus(
    @Param('id') id: string,
    @Body(zodPipe(updateContactStatusRequestSchema)) body: UpdateContactStatusRequest,
  ): Promise<ContactSubmissionDetail> {
    return this.service.updateStatus(id, body.status);
  }
}
