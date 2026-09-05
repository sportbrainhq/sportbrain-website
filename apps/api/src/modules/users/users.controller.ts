import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  updateUserRequestSchema,
  type SafeUser,
  type UpdateUserRequest,
  type UserSnapshot,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { UsersService } from './users.service';

/**
 * The signed-in reader's own account: profile fields, the Snapshot stats
 * block, and deletion. Every route is scoped to `@CurrentUser().id` — there
 * is no `:userId` param anywhere in this controller, and there never should
 * be, per the ownership rule every mutating endpoint in this feature
 * follows (see `modules/auth`'s header comments).
 */
@ApiTags('users')
@Controller('users/me')
@UseGuards(SessionGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: "The signed-in user's safe account info" })
  @ApiOkResponse({ description: 'Safe, user-facing account fields only' })
  async getMe(@CurrentUser() user: AuthenticatedUser): Promise<SafeUser> {
    return this.service.getSafeUser(user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update display name / avatar' })
  @ApiOkResponse({ description: 'Updated account fields' })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updateUserRequestSchema)) body: UpdateUserRequest,
  ): Promise<SafeUser> {
    return this.service.updateProfile(user.id, body);
  }

  @Get('snapshot')
  @ApiOperation({ summary: 'The SportBrain Snapshot stats block on /profile' })
  @ApiOkResponse({ description: 'Aggregate stats across quizzes, saves, and follows' })
  async getSnapshot(@CurrentUser() user: AuthenticatedUser): Promise<UserSnapshot> {
    return this.service.getSnapshot(user.id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (soft-delete + scrub) the signed-in account' })
  async deleteMe(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.service.deleteAccount(user.id);
  }
}
