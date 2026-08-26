-- Add List A cricket as a discipline in its own right.
--
-- Player pages show one batting and one bowling table per format, and a
-- cricketer's List A record is a format the infobox carries alongside the three
-- internationals. It was being discarded at ingestion because no discipline
-- existed to file it under, which left every player page missing the domestic
-- one-day record.
--
-- Kept as its own discipline rather than folded into ODI, which is the error
-- the discipline model exists to prevent: every ODI is a List A match, most
-- List A matches are not ODIs, and the two averages are computed over
-- different pools of opposition.
--
-- Ordered after the internationals: a reader looks for Test, ODI and T20I
-- first, and the domestic record supports them rather than leading.
INSERT INTO "discipline" ("id", "sport_id", "key", "label", "kind", "display_order")
SELECT
  'd2000000-0000-0000-0000-000000000004',
  s."id",
  'list_a',
  'List A',
  'format',
  40
FROM "sport" s
WHERE s."slug" = 'cricket'
ON CONFLICT DO NOTHING;
