/**
 * @sportbrain/contracts
 *
 * The shared boundary between the web app and the API. Every schema here is a
 * Zod schema with its TypeScript type inferred from it, so the runtime
 * validator and the compile-time type can never drift apart.
 *
 * Rules for this package:
 *
 *   1. Schemas only. No business logic, no I/O, no framework imports.
 *   2. Types are always inferred (`z.infer`), never hand-written alongside.
 *   3. Canonical shapes only. Nothing provider-shaped crosses this boundary:
 *      no Wikidata QIDs, no vendor field names. The website must never learn
 *      which source a fact came from, because sources are expected to change.
 */

export * from './error';
export * from './health';
export * from './pagination';
export * from './sport';
export * from './explainer';
