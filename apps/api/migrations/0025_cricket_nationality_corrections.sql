-- Correct two cricketer nationalities that came from bad upstream data.
--
-- ## Viv Richards
--
-- Published as **Australia**. He is Antiguan and played for the West Indies
-- between 1974 and 1991.
--
-- The value is stale rather than currently reproducible. Wikidata's Q738016
-- carries `P27` (country of citizenship) = Australia, which is simply wrong
-- upstream, and carries no `P1532` (country for sport) at all. The ingestion
-- queries were later changed to read P1532 only, with P27 deliberately excluded
-- because it produced Ben Stokes as New Zealand, so today's code would leave
-- him null. This row predates that change and was never revisited.
--
-- Set to Antigua and Barbuda, his country of birth and citizenship, and locked
-- so a future run cannot reintroduce the upstream error.
--
-- ## Bob Simpson
--
-- Published as **Bermuda**, corrected to Australia. This one is our bug, not
-- Wikidata's: `backfill-people.cli.ts` aggregated nationality with
-- `MIN(?natLabel)`, which returns the alphabetically first label when a person
-- holds several. That is not a fact about the person, and B sorts before A. The
-- CLI now uses SAMPLE, matching the main query.
--
-- ## Why only these two
--
-- Eight cricket rows have a nationality that disagrees with the national team
-- named in their attributes. Six of them are correct as recorded: Logan van
-- Beek is New Zealand-born and plays for the Netherlands, Gulbudeen Naib and
-- Hameed Hassan hold Pakistani citizenship and play for Afghanistan, and
-- Dwaine Pretorius is South African and played for Namibia. Switching nations
-- is ordinary in cricket, so the contradiction is not by itself evidence of an
-- error and the rest are left alone.

UPDATE "person" SET
  "nationality" = 'Antigua and Barbuda',
  "locked_fields" = (
    SELECT array_agg(DISTINCT f)
    FROM unnest(coalesce("locked_fields", '{}'::text[]) || ARRAY['nationality']) AS f
  ),
  "updated_at" = now()
WHERE "slug" = 'viv-richards'
  AND "primary_sport_id" = (SELECT id FROM sport WHERE slug = 'cricket');--> statement-breakpoint

UPDATE "person" SET
  "nationality" = 'Australia',
  "locked_fields" = (
    SELECT array_agg(DISTINCT f)
    FROM unnest(coalesce("locked_fields", '{}'::text[]) || ARRAY['nationality']) AS f
  ),
  "updated_at" = now()
WHERE "slug" = 'bob-simpson'
  AND "primary_sport_id" = (SELECT id FROM sport WHERE slug = 'cricket');
