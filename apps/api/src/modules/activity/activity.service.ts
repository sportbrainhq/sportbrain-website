import { Injectable } from '@nestjs/common';
import type { ActivityType, UserActivity } from '@sportbrain/contracts';
import { ActivityRepository, type UserActivityRow } from './activity.repository';

const RECENT_ACTIVITY_LIMIT = 20;

/**
 * A lightweight, product-facing activity log for the "Recent Activity"
 * feed — not analytics. `record()` is called by the domain services that
 * perform the actual mutation (`SavedEntitiesService`, `FollowsService`,
 * and eventually a quiz-submission service); this module never decides
 * when an activity happens, only stores that one did.
 */
@Injectable()
export class ActivityService {
  constructor(private readonly repository: ActivityRepository) {}

  async record(
    userId: string,
    activityType: ActivityType,
    metadata: Record<string, unknown> = {},
  ): Promise<void> {
    await this.repository.record(userId, activityType, metadata);
  }

  async listRecent(userId: string): Promise<UserActivity[]> {
    const rows = await this.repository.listRecent(userId, RECENT_ACTIVITY_LIMIT);
    return rows.map(this.toDto);
  }

  private toDto(row: UserActivityRow): UserActivity {
    return {
      id: row.id,
      activityType: row.activityType,
      metadata: row.metadata as Record<string, unknown>,
      createdAt: row.createdAt.toISOString(),
    };
  }
}
