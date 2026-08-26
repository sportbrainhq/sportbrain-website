-- Separate a team's raw sitelink count from its derived ranking score.
--
-- ## The defect
--
-- `team.notability` held the raw Wikidata sitelink count and nothing was ever
-- derived from it, so the Teams tab was ordered by how many language editions
-- happen to have written an article. That is a reasonable proxy for a football
-- club, whose article count tracks its history, and a poor one for a cricket
-- franchise:
--
--   Mumbai Indians        5 IPL titles, 7 honours   notability  4
--   Chennai Super Kings   5 IPL titles, 6 honours   notability 24
--   Punjab Kings          no titles,    0 honours   notability 25
--   Delhi Capitals        no titles,    0 honours   notability  5
--
-- So the tab listed the competition's most successful franchise last among the
-- IPL sides, and a side that has never won it first. The same ordering runs
-- through every kind and every sport.
--
-- ## Why a new column rather than a formula over the old one
--
-- The person table carries this warning already, having been burned by it: a
-- derivation that reads and writes the same column consumes its own output, and
-- after one run the raw signal is unrecoverable without re-fetching from
-- Wikidata. `person` was split into `sitelinks` and `notability` for that
-- reason; `team` never was, and is being split here on the same grounds.
--
-- The existing values are copied across before anything is derived, so the raw
-- signal survives even though ingestion would eventually refill it.

ALTER TABLE "team" ADD COLUMN IF NOT EXISTS "sitelinks" integer DEFAULT 0 NOT NULL;--> statement-breakpoint

-- Preserve what is already there. `notability` currently *is* the sitelink
-- count, so this is a rename in effect, done as a copy so the derivation below
-- has something to read on its first run.
UPDATE "team" SET "sitelinks" = "notability" WHERE "sitelinks" = 0 AND "notability" > 0;--> statement-breakpoint

-- Ordering index, matching the person table's.
CREATE INDEX IF NOT EXISTS "team_notability_idx" ON "team" USING btree ("sport_id","notability");
