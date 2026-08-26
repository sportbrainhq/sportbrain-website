-- Two different cricketers named Steve Smith had been merged into one person.
--
-- The surviving row carried the modern Australian batter's Wikidata item
-- (Q7613970), his Wikipedia article, his sitelink count, his career start of
-- 2010 and his current club, but the *other* Steve Smith's date of birth
-- (1961-10-18, the New South Wales player, Q5368718) and a second Wikidata
-- mapping pointing at him. So the row was a chimera: mostly the modern player,
-- dated as the older one, and claiming both identities.
--
-- Found while adding the World Test Championship record tables, where Steve
-- Smith holds the most catches in a cycle: the profile that row links to was
-- dated 1961 while describing a player whose career began in 2010.
--
-- Link resolution itself is unaffected. The assembler treats a name as
-- ambiguous per *slug* rather than per row, and the basketball Steve Smith
-- shares the slug 'steve-smith', so the name still resolves. That shared slug
-- is a separate pre-existing collision and is deliberately left alone here
-- rather than fixed by renaming a live profile URL as a side effect.
--
-- This keeps the row as the modern batter, since that is what almost all of its
-- data already describes, and repairs the parts that were wrong. The 1961
-- player is not resurrected here: he has no honours, statistics or squad rows
-- attached, and inventing a profile for him from a date of birth alone would be
-- a guess. He can be ingested properly from Q5368718 if he is ever wanted.

BEGIN;

-- The stray mapping to the other cricketer. Removed before the date of birth is
-- corrected so that a re-ingestion cannot restore 1961 from it.
DELETE FROM external_mapping
WHERE entity_type = 'person'
  AND provider = 'wikidata'
  AND external_id = 'Q5368718'
  AND entity_id = (
    SELECT p.id
    FROM person p
    JOIN sport s ON s.id = p.primary_sport_id
    WHERE p.slug = 'steve-smith' AND s.slug = 'cricket'
  );

-- Correct the date of birth to the modern batter's, and lock it so ingestion
-- cannot put 1961 back. `full_name` becomes the disambiguated form and
-- `display_name` stays "Steve Smith", which is what a reader expects to see;
-- the aliases give the assembler the longer forms to match on.
UPDATE person p
SET date_of_birth = DATE '1989-06-02',
    full_name = 'Steven Smith',
    aliases = (
      SELECT array_agg(DISTINCT alias)
      FROM unnest(
        COALESCE(p.aliases, '{}'::text[])
        || ARRAY['Steve Smith', 'Steven Peter Devereux Smith', 'Steven Smith']
      ) AS alias
    ),
    locked_fields = (
      SELECT array_agg(DISTINCT field)
      FROM unnest(
        COALESCE(p.locked_fields, '{}'::text[]) || ARRAY['dateOfBirth', 'fullName']
      ) AS field
    ),
    updated_at = now()
FROM sport s
WHERE s.id = p.primary_sport_id
  AND p.slug = 'steve-smith'
  AND s.slug = 'cricket';

COMMIT;
