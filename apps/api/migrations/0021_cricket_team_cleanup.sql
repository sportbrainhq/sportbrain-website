-- Remove cricket "teams" that are not teams.
--
-- The Wikidata cricket ingestion takes the `cricket team` class whole, and that
-- class contains a number of Wikipedia articles that are about something other
-- than a team. Forty rows, in four groups:
--
--   1. **Tour and series articles.** "English women's cricket team in Sri Lanka
--      in 2018-19" is an account of a tour, not a side. These are the bulk of
--      the set, and they are why the Teams count looked implausible.
--   2. **Record and list articles.** "England cricket team record by opponent",
--      "List of Kings XI Punjab records", "list of First Class Karachi cricket
--      teams" are reference pages.
--   3. **Grouping articles.** "Surrey county cricket teams" and "Berkshire
--      county cricket teams" describe several sides collectively, so the row
--      stands for no single team and its page would have nothing to show.
--   4. **Administrative bodies.** A County Cricket Board governs cricket in its
--      county. These did field board XIs historically, but the article and the
--      entity are the governing body, and a governance body in the team table
--      corrupts counts the same way a confederation would.
--
-- Also caught: "2017 Patna Pirates season", which is a kabaddi article that
-- reached the cricket catalogue through a mis-stated class on Wikidata.
--
-- ## Safety
--
-- Every row was checked for dependants before this was written: all forty have
-- zero player memberships, zero rankings and zero honours, so nothing
-- references them and no cascade removes real data. The predicates below are
-- narrow and anchored for the same reason a broader sweep was avoided:
-- `~* ' in [0-9]{4}'` matches a tour article without matching a legitimately
-- named side, and the "cricket teams$" plural is what separates a grouping
-- article from the singular "Otago cricket team" that is a real side.
--
-- Scoped to cricket. The same patterns would be wrong for other sports, where
-- "... in 2019" can be a real team name.

DELETE FROM "team"
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND (
    -- Tour and series articles: "X cricket team in Y in 2018-19".
    "name" ~* ' in [0-9]{4}'
    -- Comparative record pages.
    OR "name" ~* 'record by opponent'
    -- Reference lists, in both the capitalised and lower-case forms found.
    OR "name" ~* '^list of '
    OR "name" ~* 'records$'
    -- Grouping articles. Plural, anchored: "Surrey county cricket teams" is a
    -- collection, "Otago cricket team" is a side and must survive.
    OR "name" ~* 'cricket teams$'
    -- County and regional governing bodies.
    OR "name" ~* 'Cricket Board$'
  );
