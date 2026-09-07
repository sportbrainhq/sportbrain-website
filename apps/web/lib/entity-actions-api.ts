'use client';

import {
  savedEntitySchema,
  userFollowSchema,
  type SavedEntityType,
  type FollowEntityType,
} from '@sportbrain/contracts';
import { z } from 'zod';
import { clientEnv } from './env';

/**
 * Client-side save/follow calls — Part 56/59's toggle buttons. Follows
 * `lib/auth-client.ts`'s pattern exactly (`credentials: 'include'` direct to
 * the API), same reasoning as `lib/quiz-api.ts`: these are client-component
 * actions with no server-rendered shell worth routing through.
 *
 * There is no single "is this entity saved?" endpoint — only the list
 * endpoints (`GET /users/me/saved`, `GET /users/me/following`) — so
 * `fetchSavedEntityTypes`/`fetchFollowedEntityIds` fetch the whole list and
 * the caller checks membership. Acceptable at this scale (a reader's saved
 * library and follow list are not going to be large enough to make one
 * extra list fetch per page load a real cost); revisit with a dedicated
 * status endpoint if that stops being true.
 */

const savedListSchema = z.object({ data: z.array(savedEntitySchema) });
const followListSchema = z.object({ data: z.array(userFollowSchema) });

export async function fetchSavedEntityIds(entityType: SavedEntityType): Promise<Set<string>> {
  const response = await fetch(
    new URL(`/v1/users/me/saved?type=${entityType}`, clientEnv.NEXT_PUBLIC_API_URL),
    { credentials: 'include', headers: { Accept: 'application/json' } },
  );
  if (!response.ok) return new Set();
  const parsed = savedListSchema.safeParse(await response.json());
  if (!parsed.success) return new Set();
  return new Set(parsed.data.data.map((item) => item.entityId));
}

export async function saveEntity(entityType: SavedEntityType, entityId: string): Promise<boolean> {
  const response = await fetch(
    new URL(`/v1/users/me/saved/${entityType}/${entityId}`, clientEnv.NEXT_PUBLIC_API_URL),
    { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } },
  );
  return response.ok;
}

export async function unsaveEntity(
  entityType: SavedEntityType,
  entityId: string,
): Promise<boolean> {
  const response = await fetch(
    new URL(`/v1/users/me/saved/${entityType}/${entityId}`, clientEnv.NEXT_PUBLIC_API_URL),
    { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json' } },
  );
  return response.ok;
}

export async function fetchFollowedEntityIds(entityType: FollowEntityType): Promise<Set<string>> {
  const response = await fetch(
    new URL(`/v1/users/me/following?type=${entityType}`, clientEnv.NEXT_PUBLIC_API_URL),
    { credentials: 'include', headers: { Accept: 'application/json' } },
  );
  if (!response.ok) return new Set();
  const parsed = followListSchema.safeParse(await response.json());
  if (!parsed.success) return new Set();
  return new Set(parsed.data.data.map((item) => item.entityId));
}

export async function followEntity(
  entityType: FollowEntityType,
  entityId: string,
): Promise<boolean> {
  const response = await fetch(
    new URL(`/v1/users/me/following/${entityType}/${entityId}`, clientEnv.NEXT_PUBLIC_API_URL),
    { method: 'POST', credentials: 'include', headers: { Accept: 'application/json' } },
  );
  return response.ok;
}

export async function unfollowEntity(
  entityType: FollowEntityType,
  entityId: string,
): Promise<boolean> {
  const response = await fetch(
    new URL(`/v1/users/me/following/${entityType}/${entityId}`, clientEnv.NEXT_PUBLIC_API_URL),
    { method: 'DELETE', credentials: 'include', headers: { Accept: 'application/json' } },
  );
  return response.ok;
}
