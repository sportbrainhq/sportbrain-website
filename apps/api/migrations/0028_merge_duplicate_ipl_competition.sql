-- Merge the duplicate Indian Premier League competition rows.
--
-- Ingestion created the IPL twice, as `indian-premier-league` and as `ipl`, from
-- two Wikipedia titles resolving to the same competition. The duplicate matters
-- beyond looking untidy: the two `competition_statistic` rows cricket holds are
-- attached to `ipl`, and the curated competition list keys on
-- `indian-premier-league`, so a prune that removed `ipl` would take those
-- statistics with it.
--
-- Statistics are repointed at the surviving row first, then the duplicate is
-- removed. Ordered that way so the delete cannot run before the rows it would
-- orphan have been moved.
--
-- Guarded by a NOT EXISTS on `stat_key` rather than ON CONFLICT: if the
-- survivor already holds a statistic for the same key, the duplicate's copy is
-- redundant rather than worth keeping, and moving it would breach the unique
-- constraint.

UPDATE "competition_statistic" cs SET
  "competition_id" = (
    SELECT c.id FROM "competition" c
    JOIN "sport" s ON s.id = c.sport_id AND s.slug = 'cricket'
    WHERE c.slug = 'indian-premier-league' LIMIT 1
  )
WHERE cs."competition_id" IN (
  SELECT c.id FROM "competition" c
  JOIN "sport" s ON s.id = c.sport_id AND s.slug = 'cricket'
  WHERE c.slug = 'ipl'
)
AND NOT EXISTS (
  SELECT 1 FROM "competition_statistic" existing
  WHERE existing."competition_id" = (
      SELECT c.id FROM "competition" c
      JOIN "sport" s ON s.id = c.sport_id AND s.slug = 'cricket'
      WHERE c.slug = 'indian-premier-league' LIMIT 1
    )
    AND existing."stat_key" = cs."stat_key"
);--> statement-breakpoint

-- Anything left on the duplicate is a same-key copy of a statistic the survivor
-- already has, so it goes with the row.
DELETE FROM "competition_statistic"
WHERE "competition_id" IN (
  SELECT c.id FROM "competition" c
  JOIN "sport" s ON s.id = c.sport_id AND s.slug = 'cricket'
  WHERE c.slug = 'ipl'
);--> statement-breakpoint

DELETE FROM "competition"
WHERE "slug" = 'ipl'
  AND "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket');
