-- Add first-class cricket as a discipline, beside List A rather than instead of it.
--
-- List A was added first, on the assumption that the domestic column of a
-- cricket infobox is the one-day record. It usually is not. A four-column
-- infobox, which is what most players have, publishes Test, ODI, T20I and
-- **FC**: Kohli, Rohit Sharma, Bumrah, Jadeja, Williamson, Babar Azam and
-- Stokes all carry FC and no List A column at all. Only a five-column infobox
-- has room for both, which is why Tendulkar has a List A record and Kohli does
-- not.
--
-- So the pages of the players people actually look up were missing their fourth
-- format entirely. Both disciplines exist now, and each player shows whichever
-- their article publishes.
--
-- Kept apart from Test, which is the error the discipline model exists to
-- prevent: every Test is a first-class match, most first-class matches are not
-- Tests, and the two averages are computed over different opposition. Ordered
-- before List A, matching the infobox: the multi-day record leads.
INSERT INTO "discipline" ("id", "sport_id", "key", "label", "kind", "display_order")
SELECT
  'd2000000-0000-0000-0000-000000000005',
  s."id",
  'first_class',
  'First Class',
  'format',
  40
FROM "sport" s
WHERE s."slug" = 'cricket'
ON CONFLICT DO NOTHING;

-- List A moves down one, so the two domestic records read multi-day then
-- one-day, as a scorecard does.
UPDATE "discipline" d
SET "display_order" = 50, "updated_at" = now()
FROM "sport" s
WHERE s."id" = d."sport_id" AND s."slug" = 'cricket' AND d."key" = 'list_a';
