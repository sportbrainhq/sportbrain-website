import { Controller, Get, Param, ParseUUIDPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  paginationQuerySchema,
  type MyContactSubmission,
  type PaginationQuery,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { ContactService } from './contact.service';

/**
 * A submitter's own contact/feedback history. Every route scoped to
 * `@CurrentUser().id` — there is no way to list or close another user's
 * submission through this controller, matching `SavedEntitiesController`'s
 * pattern for "my own stuff" endpoints.
 */
@ApiTags('contact')
@Controller('users/me/contact')
@UseGuards(SessionGuard)
export class ContactMeController {
  constructor(private readonly service: ContactService) {}

  @Get()
  @ApiOperation({ summary: 'List my own contact/feedback submissions' })
  @ApiOkResponse({ description: 'A paginated list, newest first' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query(zodPipe(paginationQuerySchema)) query: PaginationQuery,
  ): Promise<{ data: MyContactSubmission[]; pagination: unknown }> {
    return this.service.findAllForUser(user.id, query);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Close my own submission' })
  @ApiOkResponse({ description: 'The updated submission' })
  async close(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MyContactSubmission> {
    return this.service.closeOwn(id, user.id);
  }
}
