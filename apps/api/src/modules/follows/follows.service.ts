import { Injectable } from '@nestjs/common';
import type { FollowEntityType, UserFollow } from '@sportbrain/contracts';
import { ActivityService } from '../activity/activity.service';
import { FollowsRepository, type UserFollowRow } from './follows.repository';

@Injectable()
export class FollowsService {
  constructor(
    private readonly repository: FollowsRepository,
    private readonly activity: ActivityService,
  ) {}

  async list(userId: string, entityType?: FollowEntityType): Promise<UserFollow[]> {
    const rows = await this.repository.list(userId, entityType);
    return rows.map(this.toDto);
  }

  async follow(userId: string, entityType: FollowEntityType, entityId: string): Promise<void> {
    await this.repository.follow(userId, entityType, entityId);
    await this.activity.record(userId, 'entity_followed', { entityType, entityId });
  }

  async unfollow(userId: string, entityType: FollowEntityType, entityId: string): Promise<void> {
    await this.repository.unfollow(userId, entityType, entityId);
  }

  private toDto(row: UserFollowRow): UserFollow {
    return {
      entityType: row.entityType,
      entityId: row.entityId,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
