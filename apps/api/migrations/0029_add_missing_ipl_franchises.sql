-- Add two IPL franchises the teams catalogue was missing.
--
-- Found while linking the IPL roll of honour: four of the nineteen champions
-- could not be resolved to a team row. Two were renames rather than absences —
-- Kings XI Punjab is Punjab Kings and Delhi Daredevils is Delhi Capitals, both
-- already held — but these two are genuinely missing:
--
--   * **Kolkata Knight Riders**, a three-time champion (2012, 2014, 2024) and
--     one of the competition's best-known sides. Its absence is the more
--     surprising of the two.
--   * **Deccan Chargers**, the 2009 champion, defunct since 2012.
--
-- Both were absent because the Wikidata ingestion reaches franchises through a
-- class query that neither satisfied, not because either was filtered out.
--
-- Inserted with a Wikidata mapping so enrichment can reach them later for a
-- logo and an `about` paragraph; without one a created row can never gain
-- either, however many times a crawl runs.
--
-- `notability` is left at 0 deliberately: the seed's `deriveTeamPriority` pass
-- computes it from sitelinks and honours on every run, and a hand-set value
-- here would be overwritten on the next seed anyway.

INSERT INTO "team" ("sport_id", "kind", "slug", "name", "short_name", "country", "founded_year", "is_active", "confidence")
SELECT s."id", 'franchise', 'kolkata-knight-riders', 'Kolkata Knight Riders', 'KKR', 'India', 2008, true, 'provisional'
FROM "sport" s WHERE s."slug" = 'cricket'
ON CONFLICT ("sport_id", "slug") DO NOTHING;--> statement-breakpoint

INSERT INTO "team" ("sport_id", "kind", "slug", "name", "short_name", "country", "founded_year", "is_active", "confidence")
SELECT s."id", 'franchise', 'deccan-chargers', 'Deccan Chargers', 'DC', 'India', 2008, false, 'provisional'
FROM "sport" s WHERE s."slug" = 'cricket'
ON CONFLICT ("sport_id", "slug") DO NOTHING;--> statement-breakpoint

INSERT INTO "external_mapping" ("provider", "entity_type", "external_id", "entity_id", "match_method", "match_confidence")
SELECT 'wikidata', 'team', 'Q1156894', t."id", 'manual', 1
FROM "team" t JOIN "sport" s ON s."id" = t."sport_id" AND s."slug" = 'cricket'
WHERE t."slug" = 'kolkata-knight-riders'
ON CONFLICT ("provider", "entity_type", "external_id") DO UPDATE SET "entity_id" = EXCLUDED."entity_id";--> statement-breakpoint

INSERT INTO "external_mapping" ("provider", "entity_type", "external_id", "entity_id", "match_method", "match_confidence")
SELECT 'wikidata', 'team', 'Q1181758', t."id", 'manual', 1
FROM "team" t JOIN "sport" s ON s."id" = t."sport_id" AND s."slug" = 'cricket'
WHERE t."slug" = 'deccan-chargers'
ON CONFLICT ("provider", "entity_type", "external_id") DO UPDATE SET "entity_id" = EXCLUDED."entity_id";--> statement-breakpoint

INSERT INTO "external_mapping" ("provider", "entity_type", "external_id", "entity_id", "match_method", "match_confidence")
SELECT 'wikipedia', 'team', 'Kolkata Knight Riders', t."id", 'manual', 1
FROM "team" t JOIN "sport" s ON s."id" = t."sport_id" AND s."slug" = 'cricket'
WHERE t."slug" = 'kolkata-knight-riders'
ON CONFLICT ("provider", "entity_type", "external_id") DO UPDATE SET "entity_id" = EXCLUDED."entity_id";--> statement-breakpoint

INSERT INTO "external_mapping" ("provider", "entity_type", "external_id", "entity_id", "match_method", "match_confidence")
SELECT 'wikipedia', 'team', 'Deccan Chargers', t."id", 'manual', 1
FROM "team" t JOIN "sport" s ON s."id" = t."sport_id" AND s."slug" = 'cricket'
WHERE t."slug" = 'deccan-chargers'
ON CONFLICT ("provider", "entity_type", "external_id") DO UPDATE SET "entity_id" = EXCLUDED."entity_id";
