import { Injectable } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import type { ActivityType } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { userActivities } from '../../database/schema';

export type UserActivityRow = typeof userActivities.$inferSelect;

@Injectable()
export class ActivityRepository {
  constructor(private readonly database: DatabaseService) {}

  async record(
    userId: string,
    activityType: ActivityType,
    metadata: Record<string, unknown>,
  ): Promise<void> {
    await this.database.db.insert(userActivities).values({ userId, activityType, metadata });
  }

  async listRecent(userId: string, limit: number): Promise<UserActivityRow[]> {
    return this.database.db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.createdAt))
      .limit(limit);
  }
}
