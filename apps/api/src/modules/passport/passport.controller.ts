import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  recalculateBatchRequestSchema,
  setAchievementActiveRequestSchema,
  updatePassportPrivacySchema,
  type AchievementsResponse,
  type AdminAchievementsList,
  type PassportActivity,
  type PassportMethodology,
  type PassportPrivacySettings,
  type PassportProgress,
  type PassportSportDetailDto,
  type PassportImpact,
  type PassportSportKnowledgeDto,
  type PassportSummary,
  type PublicAchievementShare,
  type PublicPassport,
  type RecalculateBatchRequest,
  type ScoringConfigDto,
  type SetAchievementActiveRequest,
  type UpdatePassportPrivacyRequest,
} from '@sportbrain/contracts';
import { AppException, CurrentUser, zodPipe } from '../../common';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UsersRepository } from '../users/users.repository';
import { SessionGuard } from '../auth/guards/session.guard';
import { PassportService } from './passport.service';

/**
 * SportBrain Passport (Phase E, Part 71). Private routes are scoped to
 * `@CurrentUser().id` like every other authenticated module; the public
 * route (`GET /passports/:publicId`) deliberately carries no guard and never
 * accepts an internal id — only the random `publicId` token (Part 47).
 */
@ApiTags('passport')
@Controller()
export class PassportController {
  constructor(
    private readonly service: PassportService,
    private readonly usersRepository: UsersRepository,
  ) {}

  private async identityFor(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw AppException.notFound('User not found');
    return {
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      memberSince: user.createdAt.toISOString(),
    };
  }

  @Get('me/passport')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'The current user’s SportBrain Passport summary' })
  async getSummary(@CurrentUser() user: AuthenticatedUser): Promise<{ data: PassportSummary }> {
    const identity = await this.identityFor(user.id);
    return {
      data: await this.service.getSummary(
        user.id,
        identity.displayName,
        identity.avatarUrl,
        identity.memberSince,
      ),
    };
  }

  @Get('me/passport/sports')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'All sport knowledge rows for the current user' })
  async listSports(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: PassportSportKnowledgeDto[] }> {
    return { data: await this.service.listSportKnowledge(user.id) };
  }

  @Get('me/passport/sports/:sportId')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'One sport’s knowledge detail, including category breakdown' })
  async getSportDetail(
    @CurrentUser() user: AuthenticatedUser,
    @Param('sportId') sportId: string,
  ): Promise<{ data: PassportSportDetailDto }> {
    return { data: await this.service.getSportDetail(user.id, sportId) };
  }

  @Get('me/passport/achievements')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Earned, in-progress and locked achievements' })
  async getAchievements(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: AchievementsResponse }> {
    return { data: await this.service.getAchievements(user.id) };
  }

  @Get('me/passport/progress')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'SportBrain score history' })
  async getProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Query('range') range?: string,
  ): Promise<{ data: PassportProgress }> {
    const days = range === '1y' ? 365 : range === 'all' ? 3650 : 180;
    return { data: await this.service.getProgress(user.id, days) };
  }

  @Get('me/passport/activity')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Daily activity for the activity calendar' })
  async getActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Query('days') days?: string,
  ): Promise<{ data: PassportActivity }> {
    return { data: await this.service.getActivity(user.id, days ? Number(days) : 90) };
  }

  @Get('me/passport/impact/:quizAttemptId')
  @UseGuards(SessionGuard)
  @ApiOperation({
    summary:
      'SportBrain Impact of one completed quiz — recomputes synchronously, ownership-checked',
  })
  async getImpact(
    @CurrentUser() user: AuthenticatedUser,
    @Param('quizAttemptId') quizAttemptId: string,
  ): Promise<{ data: PassportImpact | null }> {
    return { data: await this.service.getImpactForAttempt(user.id, quizAttemptId) };
  }

  @Get('me/passport/methodology')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'How the SportBrain Score is calculated' })
  getMethodology(): { data: PassportMethodology } {
    return { data: this.service.getMethodology() };
  }

  @Get('me/passport/privacy')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Current Passport privacy settings' })
  async getPrivacy(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ data: PassportPrivacySettings }> {
    return { data: await this.service.getPrivacySettings(user.id) };
  }

  @Patch('me/passport/privacy')
  @UseGuards(SessionGuard)
  @ApiOperation({ summary: 'Update Passport privacy settings' })
  async updatePrivacy(
    @CurrentUser() user: AuthenticatedUser,
    @Body(zodPipe(updatePassportPrivacySchema)) body: UpdatePassportPrivacyRequest,
  ): Promise<{ data: PassportPrivacySettings }> {
    return { data: await this.service.updatePrivacy(user.id, body) };
  }

  @Get('passports/:publicId')
  @ApiOperation({ summary: 'Public Passport by shareable id — no authentication' })
  async getPublicPassport(@Param('publicId') publicId: string): Promise<{ data: PublicPassport }> {
    return {
      data: await this.service.getPublicPassport(publicId, (userId) => this.identityFor(userId)),
    };
  }

  @Get('admin/passport/scoring-config')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Current SportBrain scoring configuration (admin)' })
  getScoringConfig(): { data: ScoringConfigDto } {
    return { data: this.service.getScoringConfig() };
  }

  @Get('share/achievement/:userAchievementId')
  @ApiOperation({ summary: 'Public achievement share data — no authentication' })
  async getAchievementShare(
    @Param('userAchievementId') userAchievementId: string,
  ): Promise<{ data: PublicAchievementShare }> {
    return {
      data: await this.service.getPublicAchievementShare(userAchievementId, (userId) =>
        this.identityFor(userId),
      ),
    };
  }

  @Get('admin/achievements')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'All achievement definitions with earned counts (admin)' })
  async listAchievementsForAdmin(): Promise<{ data: AdminAchievementsList }> {
    return { data: await this.service.listAllAchievementsForAdmin() };
  }

  @Patch('admin/achievements/:achievementId/active')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Activate/deactivate an achievement definition (admin)' })
  async setAchievementActive(
    @Param('achievementId') achievementId: string,
    @Body(zodPipe(setAchievementActiveRequestSchema)) body: SetAchievementActiveRequest,
  ): Promise<{ data: { updated: true } }> {
    await this.service.setAchievementActive(achievementId, body.isActive);
    return { data: { updated: true } };
  }

  @Post('admin/passport/recalculate/:userId')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Force a synchronous Passport recalculation for one user (admin)' })
  async recalculateOne(@Param('userId') userId: string): Promise<{ data: { recalculated: true } }> {
    await this.service.recalculateUserScore(userId);
    return { data: { recalculated: true } };
  }

  @Post('admin/passport/recalculate-batch')
  @UseGuards(SessionGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Force a synchronous Passport recalculation for a batch of users (admin)',
  })
  async recalculateBatch(
    @Body(zodPipe(recalculateBatchRequestSchema)) body: RecalculateBatchRequest,
  ): Promise<{ data: { succeeded: number; failed: number } }> {
    return { data: await this.service.recalculateBatch(body.userIds) };
  }
}
