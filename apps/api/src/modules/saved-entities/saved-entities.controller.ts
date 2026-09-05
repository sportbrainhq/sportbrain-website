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
  savedEntityTypeSchema,
  type SavedEntity,
  type SavedEntityType,
} from '@sportbrain/contracts';
import { CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { SavedEntitiesService } from './saved-entities.service';

/**
 * A reader's saved library. Every route scoped to `@CurrentUser().id` —
 * there is no way to list or mutate another user's saved items through this
 * controller.
 */
@ApiTags('saved-entities')
@Controller('users/me/saved')
@UseGuards(SessionGuard)
export class SavedEntitiesController {
  constructor(private readonly service: SavedEntitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List saved items, optionally filtered by type' })
  @ApiOkResponse({ description: 'Newest first' })
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('type') type?: string,
  ): Promise<{ data: SavedEntity[] }> {
    const parsedType = type ? savedEntityTypeSchema.parse(type) : undefined;
    return { data: await this.service.list(user.id, parsedType) };
  }

  @Post(':type/:entityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Save an item' })
  async save(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type', zodPipe(savedEntityTypeSchema)) type: SavedEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<void> {
    await this.service.save(user.id, type, entityId);
  }

  @Delete(':type/:entityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unsave an item' })
  async unsave(
    @CurrentUser() user: AuthenticatedUser,
    @Param('type', zodPipe(savedEntityTypeSchema)) type: SavedEntityType,
    @Param('entityId', ParseUUIDPipe) entityId: string,
  ): Promise<void> {
    await this.service.unsave(user.id, type, entityId);
  }
}
