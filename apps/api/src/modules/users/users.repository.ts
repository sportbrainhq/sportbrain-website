import { Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { savedEntities, userFollows, users } from '../../database/schema';

export type UserRow = typeof users.$inferSelect;

@Injectable()
export class UsersRepository {
  constructor(private readonly database: DatabaseService) {}

  async findById(id: string): Promise<UserRow | null> {
    const [row] = await this.database.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  async updateProfile(
    id: string,
    input: { displayName?: string; avatarUrl?: string },
  ): Promise<UserRow | null> {
    const [row] = await this.database.db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return row ?? null;
  }

  /**
   * Soft-deletes and scrubs PII in one write: `status`/`deletedAt` mark the
   * account gone, and `email`/`displayName`/`avatarUrl` are overwritten so no
   * personally identifying data survives on the row that
   * `quiz_attempts`/`user_activities` still reference. Session/identity
   * cleanup happens in the service, which also has to revoke sessions and
   * delete the Google identity link — this method only owns the `users` row
   * itself.
   */
  async softDeleteAndScrub(id: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
        email: `deleted-${id}@deleted.sportbrainhq.com`,
        displayName: 'Deleted user',
        avatarUrl: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id));
  }

  async countSavedEntities(userId: string): Promise<number> {
    const [row] = await this.database.db
      .select({ count: sql<number>`count(*)::int` })
      .from(savedEntities)
      .where(eq(savedEntities.userId, userId));
    return row?.count ?? 0;
  }

  async countFollows(userId: string): Promise<number> {
    const [row] = await this.database.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userFollows)
      .where(eq(userFollows.userId, userId));
    return row?.count ?? 0;
  }
}
