/**
 * Drizzle schema barrel.
 *
 * Drizzle infers the database client's types from these exports, so a table is
 * queryable the moment it appears here and invisible until then.
 *
 * The schema is organised by role rather than by sport, which is the decision
 * everything else follows from. There is no `football_player` table and never
 * will be: sports differ in their statistics, not in their structure, and the
 * structural differences that do exist are carried as data (`sport.traits`,
 * `statistic_definition`) rather than as tables.
 *
 * Reading order, if you are new to it:
 *
 *   1. `_shared`        the primitives and enums every table uses
 *   2. `sport`          the root of the navigation
 *   3. `entity`         person, team, competition, season, venue
 *   4. `participation`  who played where, and the events they played in
 *   5. `statistic`      the registry, and the aggregates derived from events
 *   6. `provider`       provider identifiers and ingestion bookkeeping
 *   7. `content`        the editorial layer we own outright
 *   8. `explainer`      the concept library, and the graph joining it up
 *   9. `news`           the News Engine's canonical article model, provider-independent
 *  10. `user`           accounts, sessions, and everything a signed-in reader owns
 *  11. `question`       the canonical Question Bank (Phase C) — quizzes select references, never copies
 *  12. `newsletter`     The Monday Brief subscription foundation (Phase D1) — subscribe/confirm/unsubscribe only, no issues yet
 *  13. `newsletter-issue` The Monday Brief issue model (Phase D2) — create/edit/validate/ready only, no scheduling/delivery yet
 *  14. `newsletter-campaign`/`newsletter-recipient` Scheduling + delivery (Phase D5) — one row per send run, one row per recipient of that run
 *
 * To add a table: create the file, re-export it here, run `pnpm db:generate`,
 * read the generated SQL by hand, then `pnpm db:migrate`.
 */

export * from './_shared';
export * from './sport.schema';
export * from './entity.schema';
export * from './participation.schema';
export * from './statistic.schema';
export * from './profile.schema';
export * from './overview.schema';
export * from './explainer.schema';
export * from './provider.schema';
export * from './content.schema';
export * from './news.schema';
export * from './contact.schema';
export * from './user.schema';
export * from './session.schema';
export * from './preference.schema';
export * from './follow.schema';
export * from './saved-entity.schema';
export * from './quiz-attempt.schema';
export * from './activity.schema';
export * from './question.schema';
export * from './question-generation.schema';
export * from './question-exposure.schema';
export * from './quiz-attempt-v2.schema';
export * from './newsletter-subscription.schema';
export * from './newsletter-issue.schema';
export * from './newsletter-campaign.schema';
export * from './newsletter-recipient.schema';
export * from './passport.schema';
