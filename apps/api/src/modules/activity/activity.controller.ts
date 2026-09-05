import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { UserActivity } from '@sportbrain/contracts';
import { CurrentUser } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { SessionGuard } from '../auth/guards/session.guard';
import { ActivityService } from './activity.service';

@ApiTags('activity')
@Controller('users/me/activities')
@UseGuards(SessionGuard)
export class ActivityController {
  constructor(private readonly service: ActivityService) {}

  @Get()
  @ApiOperation({ summary: "The signed-in user's recent product activity" })
  @ApiOkResponse({ description: 'Newest first, capped list' })
  async list(@CurrentUser() user: AuthenticatedUser): Promise<{ data: UserActivity[] }> {
    return { data: await this.service.listRecent(user.id) };
  }
}
