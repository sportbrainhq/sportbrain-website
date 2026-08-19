-- Remove duplicate honours before the unique indexes can be created.
--
-- Ingestion used onConflictDoNothing with no constraint to conflict against, so
-- re-running a job inserted a second copy of every award. 42 of 1,381 rows were
-- affected, and they reached the API: a player page listed the same Ballon d'Or
-- twice. The oldest row of each group is kept, since anything referencing an
-- honour would reference the first one written.
DELETE FROM "honour" a USING "honour" b
WHERE a.ctid > b.ctid
  AND a.title = b.title
  AND a.person_id IS NOT DISTINCT FROM b.person_id
  AND a.team_id IS NOT DISTINCT FROM b.team_id
  AND a.year IS NOT DISTINCT FROM b.year;--> statement-breakpoint
CREATE UNIQUE INDEX "honour_person_unique_idx" ON "honour" USING btree ("person_id","title","year") WHERE "honour"."person_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "honour_team_unique_idx" ON "honour" USING btree ("team_id","title","year") WHERE "honour"."team_id" IS NOT NULL;