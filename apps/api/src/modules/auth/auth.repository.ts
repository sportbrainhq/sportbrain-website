import { Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { userIdentities, userSessions, users } from '../../database/schema';

export type UserRow = typeof users.$inferSelect;
export type UserIdentityRow = typeof userIdentities.$inferSelect;
export type UserSessionRow = typeof userSessions.$inferSelect;

/**
 * Repository layer for identity and session rows.
 *
 * Deliberately narrow: this module only ever needs "find/create a user by
 * Google identity", "find a user by id", "create/validate/revoke a
 * session". Anything about a user's own content (saved items, following,
 * quiz history) belongs to those domains' own repositories, not here.
 */
@Injectable()
export class AuthRepository {
  constructor(private readonly database: DatabaseService) {}

  async findIdentity(provider: 'google', providerSubject: string): Promise<UserIdentityRow | null> {
    const [row] = await this.database.db
      .select()
      .from(userIdentities)
      .where(
        and(
          eq(userIdentities.provider, provider),
          eq(userIdentities.providerSubject, providerSubject),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async findUserById(id: string): Promise<UserRow | null> {
    const [row] = await this.database.db.select().from(users).where(eq(users.id, id)).limit(1);
    return row ?? null;
  }

  /**
   * Creates a brand-new account plus its Google identity link, in one
   * transaction: a user row without an identity, or an identity without a
   * user, are both states nothing else in this schema can make sense of.
   */
  async createUserWithIdentity(input: {
    email: string;
    displayName: string;
    avatarUrl: string | null;
    provider: 'google';
    providerSubject: string;
    providerEmail: string;
  }): Promise<UserRow> {
    return this.database.db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          displayName: input.displayName,
          avatarUrl: input.avatarUrl,
        })
        .returning();
      if (!user) throw new Error('Insert of users row returned no row');

      await tx.insert(userIdentities).values({
        userId: user.id,
        provider: input.provider,
        providerSubject: input.providerSubject,
        providerEmail: input.providerEmail,
      });

      return user;
    });
  }

  async touchLastLogin(userId: string): Promise<void> {
    await this.database.db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, userId));
  }

  async createSession(input: {
    userId: string;
    expiresAt: Date;
    userAgent: string | null;
    ipAddress: string | null;
  }): Promise<UserSessionRow> {
    const [row] = await this.database.db.insert(userSessions).values(input).returning();
    if (!row) throw new Error('Insert of user_sessions row returned no row');
    return row;
  }

  async findSessionById(id: string): Promise<UserSessionRow | null> {
    const [row] = await this.database.db
      .select()
      .from(userSessions)
      .where(eq(userSessions.id, id))
      .limit(1);
    return row ?? null;
  }

  async revokeSession(id: string): Promise<void> {
    await this.database.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.id, id));
  }

  /** Used by account deletion: kills every session so a deleted account can't stay logged in anywhere. */
  async revokeAllSessionsForUser(userId: string): Promise<void> {
    await this.database.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.userId, userId));
  }
}
