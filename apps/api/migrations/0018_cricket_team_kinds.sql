-- Correct cricket team kinds, and add the kinds cricket actually needs.
--
-- ## The defect
--
-- The Wikidata cricket ingestion was configured with
-- `defaultTeamKind: 'franchise'`, so every non-national cricket side it created
-- was labelled a franchise. That is 814 rows, and it is wrong for most of them:
-- Otago, Queensland and Bengal are state or provincial representative sides,
-- Manchester Cricket Club and Moors Sports Club are clubs, and a franchise is
-- specifically a team created for and owned within a competition. Flattening
-- those into one label makes "franchise cricket" meaningless, which matters
-- because the Overview's International/Domestic/Franchise section exists to
-- teach exactly that distinction.
--
-- ## Why this is conservative
--
-- Wikidata cannot settle the question on its own. Its generic `cricket team`
-- class (Q17376093) covers 985 of these teams and says nothing about how they
-- are constituted, and there is no franchise class to query. Name heuristics
-- looked promising and are not: the teams whose names do not end in "cricket
-- team" are a mix of real franchises (MI Cape Town, Southern Brave), clubs
-- (Nomads Sports Club), administrative boards (Kent Cricket Board) and articles
-- that are not teams at all ("Australia women's cricket team in India in
-- 2025-26"). Guessing would replace one confident wrong answer with another.
--
-- So this migration only reclassifies where the evidence is unambiguous:
--
--   1. Rows whose names are structurally representative sides ("X cricket
--      team", "X county cricket teams") become `representative`.
--   2. Rows named as clubs become `club`.
--   3. Age-group and development sides become `development`.
--   4. Everything else keeps `franchise` and is left for curation. That set
--      still contains genuine franchises and genuine clubs, and the Overview
--      does not link to team entities by kind for that reason.
--
-- Nothing here deletes a row. The non-team articles found in the corpus are a
-- separate data-quality problem, recorded in the deliverable rather than fixed
-- by guesswork here.

-- `representative` covers a state, county, province, region or territory side:
-- the thing English cricket calls a county and Australian cricket calls a
-- state. One value rather than four, because the schema must not assert that
-- every country organises domestic cricket the same way; which kind of
-- territory it is belongs on the team, not in the enum.
ALTER TYPE "public"."team_kind" ADD VALUE IF NOT EXISTS 'representative';--> statement-breakpoint

-- Age-group, academy, A-sides and similar. Distinguished because a senior
-- record and an under-19 record are not the same career, and because these
-- inflate a "teams" count that readers take as a measure of coverage.
ALTER TYPE "public"."team_kind" ADD VALUE IF NOT EXISTS 'development';--> statement-breakpoint

-- Applied in a separate statement set: a new enum value cannot be used in the
-- same transaction that added it.
UPDATE "team" SET "kind" = 'development', "updated_at" = now()
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND "kind" = 'franchise'
  AND ("name" ~* 'under[- ]?[0-9]{2}' OR "name" ~* '\yU-?(13|15|16|17|19|23)\y'
       OR "name" ~* '\yacademy\y' OR "name" ~* '\y(A|B) team\y');--> statement-breakpoint

UPDATE "team" SET "kind" = 'club', "updated_at" = now()
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND "kind" = 'franchise'
  AND ("name" ~* '\ycricket club\y' OR "name" ~* '\ysports club\y'
       OR "name" ~* '\ysporting club\y' OR "name" ~* '\ysocial club\y'
       OR "name" ~* '\ycricket and football club\y' OR "name" ~ '\yCC$');--> statement-breakpoint

-- Representative sides last, and deliberately anchored: "... cricket team" and
-- "... cricket teams" at the end of the name is how Wikidata titles a
-- representative side, and an unanchored match would also catch the tour-series
-- articles ("England cricket team in India in 2024-25") that are not teams.
UPDATE "team" SET "kind" = 'representative', "updated_at" = now()
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND "kind" = 'franchise'
  AND ("name" ~* '\ycricket teams?$' OR "name" ~* '\ycricket board$')
  AND "name" !~* '\yin [0-9]{4}'
  AND "name" !~* '\yin .+ in [0-9]{4}';
