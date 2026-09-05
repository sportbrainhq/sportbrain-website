import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  updateUserPreferencesRequestSchema,
  type UpdateUserPreferencesRequest,
  type UserPreferences,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { PreferencesService } from './preferences.service';

@ApiTags('preferences')
@Controller('users/me/preferences')
@UseGuards(SessionGuard)
export class PreferencesController {
  constructor(private readonly service: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: "The signed-in user's content/email preferences" })
  @ApiOkResponse({ description: 'Defaults to all-off when never set' })
  async get(@CurrentUser() user: AuthenticatedUser): Promise<UserPreferences> {
    return this.service.get(user.id);
  }

  @Put()
  @ApiOperation({ summary: 'Update content/email preferences' })
  @ApiOkResponse({ description: 'The updated preferences' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updateUserPreferencesRequestSchema)) body: UpdateUserPreferencesRequest,
  ): Promise<UserPreferences> {
    return this.service.update(user.id, body);
  }
}
