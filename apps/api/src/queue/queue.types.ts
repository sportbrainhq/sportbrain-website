/**
 * Job payload shapes for the News Engine's two BullMQ queues.
 *
 * Kept as plain TS interfaces (not Zod schemas) because these never cross a
 * process boundary that isn't already trusted: they are produced and
 * consumed by our own code within the same deployment, via Redis, not
 * accepted from an external caller the way an HTTP body is. Exported here so
 * both the enqueue side (scheduler, fetch processor) and the consume side
 * (workers) import one definition.
 */

/** Enqueued by the scheduler (or a manual CLI trigger) for one source that is due to be polled. */
export interface FetchJobData {
  sourceId: string;
}

/** Enqueued by the `news-fetch` processor once a fetch produced new content worth parsing. */
export interface ProcessJobData {
  fetchId: string;
}

export const NEWS_FETCH_QUEUE = 'news-fetch';
export const NEWS_PROCESS_QUEUE = 'news-process';
