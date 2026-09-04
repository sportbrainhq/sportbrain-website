import { z } from 'zod';

/**
 * The live/fixtures boundary.
 *
 * Separate from `sport.ts` because this is the one part of the site backed by
 * a live external feed rather than our own database, and it carries a
 * different set of guarantees as a result: freshness instead of editorial
 * accuracy, provider outages instead of migrations, per-sport gaps instead of
 * uniform coverage. Mixing it into the encyclopedia contracts would make those
 * differences easy to lose sight of.
 *
 * Nothing provider-shaped crosses this boundary: no SportScore slugs, no
 * TheSportsDB numeric ids, no `strTimestamp` field names. See
 * `apps/api/src/integrations/providers/fixtures/` for where that translation
 * happens.
 */

export const fixtureStatusSchema = z.enum(['scheduled', 'live', 'finished', 'unknown']);
export type FixtureStatus = z.infer<typeof fixtureStatusSchema>;

export const fixtureSchema = z.object({
  /** Stable within one provider; not stable across a provider swap. */
  id: z.string(),
  provider: z.string(),
  sport: z.string(),

  competitionName: z.string(),
  competitionLogo: z.string().nullable().optional(),

  homeTeam: z.string(),
  awayTeam: z.string(),
  homeTeamLogo: z.string().nullable().optional(),
  awayTeamLogo: z.string().nullable().optional(),

  /**
   * String, not number. Cricket and other non-numeric scoring is a known gap
   * (see `homeScoreDisplay`); keeping this a string avoids a schema that lies
   * about precision it does not have.
   */
  homeScore: z.string().nullable(),
  awayScore: z.string().nullable(),

  status: fixtureStatusSchema,
  statusText: z.string(),

  startTime: z.string().datetime({ offset: true }),
  liveMinute: z.string().nullable().optional(),

  updatedAt: z.string().datetime({ offset: true }),
});
export type Fixture = z.infer<typeof fixtureSchema>;

export const fixtureListQuerySchema = z.object({
  sport: z.string(),
});
export type FixtureListQuery = z.infer<typeof fixtureListQuerySchema>;

export const todayBucketSchema = z.object({
  live: z.array(fixtureSchema),
  upcoming: z.array(fixtureSchema),
  finished: z.array(fixtureSchema),
  /**
   * True when the provider caps how many fixtures it returns and that cap was
   * reached, so the bucket may be missing fixtures rather than exhaustively
   * listing today. Set this whenever it can't be ruled out, not only when a
   * cap is known to have been hit.
   */
  possiblyIncomplete: z.boolean(),
});
export type TodayBucket = z.infer<typeof todayBucketSchema>;
