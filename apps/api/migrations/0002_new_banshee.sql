-- Remove duplicate statistics rows before the corrected indexes can be created.
--
-- The previous unique indexes listed nullable columns directly, and Postgres
-- treats nulls as distinct, so a career-scope row never conflicted with itself:
-- every seeder run inserted another copy. Messi accumulated four identical
-- honours rows and the API rendered all four.
--
-- The newest row of each group is kept, since it carries the most recent
-- computed_at, and the rest are removed.
DELETE FROM "person_statistic" a USING "person_statistic" b
WHERE a.ctid < b.ctid
  AND a.person_id = b.person_id
  AND a.scope = b.scope
  AND a.competition_id IS NOT DISTINCT FROM b.competition_id
  AND a.season_id IS NOT DISTINCT FROM b.season_id
  AND a.team_id IS NOT DISTINCT FROM b.team_id
  AND a.discipline_id IS NOT DISTINCT FROM b.discipline_id;--> statement-breakpoint
DELETE FROM "team_statistic" a USING "team_statistic" b
WHERE a.ctid < b.ctid
  AND a.team_id = b.team_id
  AND a.scope = b.scope
  AND a.competition_id IS NOT DISTINCT FROM b.competition_id
  AND a.season_id IS NOT DISTINCT FROM b.season_id
  AND a.discipline_id IS NOT DISTINCT FROM b.discipline_id;--> statement-breakpoint
DROP INDEX "person_statistic_unique_idx";--> statement-breakpoint
DROP INDEX "team_statistic_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "person_statistic_unique_idx" ON "person_statistic" USING btree ("person_id","scope",coalesce("competition_id", '00000000-0000-0000-0000-000000000000'::uuid),coalesce("season_id", '00000000-0000-0000-0000-000000000000'::uuid),coalesce("team_id", '00000000-0000-0000-0000-000000000000'::uuid),coalesce("discipline_id", '00000000-0000-0000-0000-000000000000'::uuid));--> statement-breakpoint
CREATE UNIQUE INDEX "team_statistic_unique_idx" ON "team_statistic" USING btree ("team_id","scope",coalesce("competition_id", '00000000-0000-0000-0000-000000000000'::uuid),coalesce("season_id", '00000000-0000-0000-0000-000000000000'::uuid),coalesce("discipline_id", '00000000-0000-0000-0000-000000000000'::uuid));