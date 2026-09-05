import { Injectable } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import type { FollowEntityType } from '@sportbrain/contracts';
import { DatabaseService } from '../../database/database.service';
import { userFollows } from '../../database/schema';

export type UserFollowRow = typeof userFollows.$inferSelect;

@Injectable()
export class FollowsRepository {
  constructor(private readonly database: DatabaseService) {}

  async list(userId: string, entityType?: FollowEntityType): Promise<UserFollowRow[]> {
    return this.database.db
      .select()
      .from(userFollows)
      .where(
        entityType
          ? and(eq(userFollows.userId, userId), eq(userFollows.entityType, entityType))
          : eq(userFollows.userId, userId),
      )
      .orderBy(desc(userFollows.createdAt));
  }

  async follow(userId: string, entityType: FollowEntityType, entityId: string): Promise<void> {
    await this.database.db
      .insert(userFollows)
      .values({ userId, entityType, entityId })
      .onConflictDoNothing();
  }

  async unfollow(userId: string, entityType: FollowEntityType, entityId: string): Promise<void> {
    await this.database.db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.userId, userId),
          eq(userFollows.entityType, entityType),
          eq(userFollows.entityId, entityId),
        ),
      );
  }
}
