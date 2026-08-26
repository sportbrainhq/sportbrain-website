-- Remove the football-shaped "Most appearances" tables from cricket teams.
--
-- Seven rows, written by the football ranking crawl before cricket had a
-- parser of its own. They are wrong in two ways, and both matter more than
-- their number suggests because every one is stored with `confidence: 'high'`
-- and a note reading "From the club records article on Wikipedia", so nothing
-- on the page warned a reader.
--
--   1. **Format-blind.** `most_appearances` carries no format, and a cricket
--      career record only means something inside one. Sri Lanka's row lists
--      Jayawardene on 149, which is his Test tally, under a heading that reads
--      as a career total across all cricket. Adding a Test count to an ODI
--      count is the error the discipline model exists to prevent, and a
--      single-number appearance table invites exactly that reading.
--
--   2. **Contaminated.** Pune Warriors India, a franchise that played two IPL
--      seasons and folded in 2013, is credited with Virat Kohli on 283, Rohit
--      Sharma on 281 and MS Dhoni on 278. Those are IPL career totals for the
--      whole competition, scraped from a league-wide table. None of the three
--      ever played for Pune Warriors.
--
-- Everything these rows purported to show is now served properly and per
-- format by `test_most_matches`, `odi_most_matches` and `t20i_most_matches`,
-- read from tables that state which format they describe, with the source
-- article recorded on each. Deleting rather than relabelling: there is no
-- format to relabel them to, since the figures are a mix of bases and, in
-- Pune's case, of teams.
--
-- Scoped to cricket. Football's `most_appearances` tables are correct for a
-- sport with one format and are untouched.

DELETE FROM "entity_ranking"
WHERE "entity_type" = 'team'
  AND "kind" IN ('most_appearances', 'top_scorers')
  AND "entity_id" IN (
    SELECT id FROM team WHERE sport_id = (SELECT id FROM sport WHERE slug = 'cricket')
  );
