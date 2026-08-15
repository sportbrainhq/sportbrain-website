import { z } from 'zod';

/**
 * Health contracts.
 *
 * These are the only endpoints the platform exposes at foundation stage, and
 * they are the reason this package exists: the web app renders API status on
 * the homepage, so both sides need the same type without hand-writing it twice.
 */

export const healthStatusSchema = z.enum(['ok', 'degraded', 'error']);
export type HealthStatus = z.infer<typeof healthStatusSchema>;

/** One dependency's contribution to overall health. */
export const healthIndicatorSchema = z.object({
  status: z.enum(['up', 'down']),
  /** Round-trip time of the check, when the indicator measures one. */
  responseTimeMs: z.number().optional(),
  /** Present only when status is 'down'. Safe for display. */
  message: z.string().optional(),
});
export type HealthIndicator = z.infer<typeof healthIndicatorSchema>;

/**
 * Liveness: is the process running and able to answer?
 *
 * Deliberately checks nothing external. An orchestrator restarts a container
 * that fails liveness, and restarting will not fix a database outage, so a
 * database check here would turn one dependency failure into a restart loop.
 */
export const livenessResponseSchema = z.object({
  status: z.literal('ok'),
  uptimeSeconds: z.number(),
  timestamp: z.string(),
});
export type LivenessResponse = z.infer<typeof livenessResponseSchema>;

/**
 * Readiness: can this instance serve traffic right now?
 *
 * Checks every dependency required to answer a request. A load balancer pulls
 * an instance out of rotation on failure without restarting it.
 */
export const readinessResponseSchema = z.object({
  status: healthStatusSchema,
  info: z.record(z.string(), healthIndicatorSchema),
  error: z.record(z.string(), healthIndicatorSchema),
  details: z.record(z.string(), healthIndicatorSchema),
});
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;

/** Overall health summary, used by monitoring and the homepage status panel. */
export const healthResponseSchema = z.object({
  status: healthStatusSchema,
  service: z.string(),
  version: z.string(),
  environment: z.string(),
  uptimeSeconds: z.number(),
  timestamp: z.string(),
  checks: z.record(z.string(), healthIndicatorSchema),
});
export type HealthResponse = z.infer<typeof healthResponseSchema>;
