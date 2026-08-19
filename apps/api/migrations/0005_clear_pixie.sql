-- Remove duplicate career spells before the unique index can be created.
--
-- Career ingestion used ON CONFLICT DO NOTHING with no constraint to conflict
-- against, so a second run inserted another copy of every spell rather than
-- skipping it. 1,010 of 6,344 rows were duplicates and they reached the API as
-- repeated entries on a player's timeline: Messi's Barcelona spell, Giggs'
-- Manchester United spell and Raul's Real Madrid spell each appeared twice.
--
-- One row survives per (person, team, role, dates) group, preferring whichever
-- carries attributes: a Wikipedia-sourced spell holds appearances and goals
-- where the Wikidata one holds only dates. Ordering by jsonb length puts the
-- richer row first, and ctid breaks the remaining ties deterministically.
DELETE FROM "person_team"
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           row_number() OVER (
             PARTITION BY person_id, team_id, role,
                          coalesce(start_date, '1000-01-01'::date),
                          coalesce(end_date, '9999-12-31'::date)
             ORDER BY length(attributes::text) DESC, ctid
           ) AS rn
    FROM "person_team"
  ) ranked
  WHERE rn > 1
);--> statement-breakpoint
CREATE UNIQUE INDEX "person_team_unique_idx" ON "person_team" USING btree ("person_id","team_id","role",coalesce("start_date", '1000-01-01'::date),coalesce("end_date", '9999-12-31'::date));