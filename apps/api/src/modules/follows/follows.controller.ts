import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  followEntityTypeSchema,
  type FollowEntityType,
  type UserFollow,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@Controller('users/me/following')
@UseGuards(SessionGuard)
export class FollowsController {
  constructor(private readonly service: FollowsService) {}

  @Get()
  @ApiOperation({ summary: 'List followed entities, optionally filtered by type' })
  @ApiOkResponse({ description: 'Newest first' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') type?: string,
  ): Promise<{ data: UserFollow[] }> {
    const parsedType = type ? followEntityTypeSchema.parse(type) : undefined;
    return { data: await this.service.list(user.id, parsedType) };
  }

  @Post(':type/:entityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Follow an entity' })
  async follow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type', zodPipe(followEntityTypeSchema)) type: FollowEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<void> {
    await this.service.follow(user.id, type, entityId);
  }

  @Delete(':type/:entityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow an entity' })
  async unfollow(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type', zodPipe(followEntityTypeSchema)) type: FollowEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<void> {
    await this.service.unfollow(user.id, type, entityId);
  }
}
