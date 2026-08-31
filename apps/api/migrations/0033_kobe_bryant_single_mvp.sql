-- Kobe Bryant won one NBA MVP, in 2008. The catalogue recorded three.
--
-- The Lakers' League MVP table listed him for 2006, 2008 and 2009, so the
-- franchise appeared to have won the award three years out of four.
--
-- ## Where the extra rows came from
--
-- Ours, not Wikidata's. Q25369 carries a *single* `P166` (award received)
-- statement for the MVP, with three `P585` (point in time) qualifiers on it:
-- 2006, 2008 and 2009. `honoursQuery` read the date with a plain
-- `OPTIONAL { ?statement pq:P585 ?when }`, which yields one row per qualifier,
-- and each row was inserted as its own award.
--
-- The query is fixed in the same change to group by `?statement`, so one
-- statement now produces one honour and no qualifier set can inflate a count
-- again. That fix alone is not enough here for two reasons:
--
--   1. The three rows already exist, and `ingestHonours` upserts with
--      `onConflictDoNothing` on (person_id, title, year), so a re-run neither
--      removes nor corrects them.
--   2. The fixed query resolves the date with `MIN`, which returns 2006. That
--      is the earliest qualifier, not the year he won.
--
-- ## Why 2008 is the year that survives
--
-- One MVP is awarded per season, and before this correction 2006 and 2009 each
-- had two recorded winners, which is impossible. Wikidata's own winner list
-- resolves both: Steve Nash won 2006 (his second in a row) and LeBron James won
-- 2009. Kobe is the sole recorded winner for 2008, which is the real award, for
-- the 2007-08 season. The 2006 and 2009 qualifiers correspond to seasons he
-- finished behind those two.
--
-- Deleting the two wrong rows rather than editing one and deleting two, so the
-- surviving row keeps its identity, its `prestige` tier and anything joined to
-- it. Scoped by person, title and year so it cannot touch another award.
--
-- Note this deliberately does not delete by `id`: the seed and ingest may
-- recreate rows with new ids, and matching on the natural key is what makes
-- this migration safe to re-run.
DELETE FROM honour h
USING person p, sport s
WHERE h.person_id = p.id
  AND h.sport_id = s.id
  AND s.slug = 'basketball'
  AND p.slug = 'kobe-bryant'
  AND h.title = 'NBA Most Valuable Player Award'
  AND h.year IN (2006, 2009);

-- The one that is real, corrected in place if the fixed query's MIN(2006) is
-- what landed. Runs after the delete above, so at most one row remains to
-- update and the (person_id, title, year) unique index cannot be violated.
UPDATE honour h
SET year = 2008, updated_at = now()
FROM person p, sport s
WHERE h.person_id = p.id
  AND h.sport_id = s.id
  AND s.slug = 'basketball'
  AND p.slug = 'kobe-bryant'
  AND h.title = 'NBA Most Valuable Player Award'
  AND h.year <> 2008;
