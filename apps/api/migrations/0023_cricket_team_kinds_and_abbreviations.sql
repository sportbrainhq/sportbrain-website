-- Two cricket team-data corrections, and franchise abbreviations.
--
-- ## 1. National sides misfiled as domestic
--
-- Migration 0018 reclassified any cricket team whose name ends "cricket team"
-- as `representative`, on the reasoning that Wikidata titles a state or county
-- side that way. It does, and it titles a **national** side that way too:
-- "United Arab Emirates national cricket team" matched the same pattern and
-- landed in the Domestic tab beside Karnataka and Tasmania.
--
-- The distinguishing token is "national", which 0018's anchored pattern did not
-- exclude. Only two rows are affected, because most national sides were already
-- `international` before 0018 ran and were therefore never candidates.
--
-- ## 2. Age-group sides filed as international
--
-- The converse gap. 0018 moved age-group sides out of `franchise` but never
-- examined the rows already sitting in `international`, so nineteen under-19 and
-- women's under-19 national sides are offered under International. They are
-- national sides, which is why they were classified that way, but the
-- `development` kind exists precisely to keep a senior record and an under-19
-- record apart, and the Age-group tab is where a reader looks for them.
--
-- Ordered after the national-side fix so a row that is both national and
-- age-group ends in `development`, which is the more specific answer.
--
-- ## 3. Franchise abbreviations
--
-- Franchise cards had no `short_name` for 247 of 249 rows, so the card fell
-- back to country and founding year: "India · 2008" for Punjab Kings, which is
-- also "India · 2008" for three other IPL sides and identifies none of them. A
-- franchise is known by its abbreviation.
--
-- Set only where the abbreviation is the team's own established short form,
-- taken from the league's own usage. Deliberately not set for the Lanka Premier
-- League, whose franchises have no standardised abbreviations and have been
-- renamed repeatedly; those keep the country fallback rather than acquiring an
-- invented code.
--
-- Matched on exact current names. A renamed franchise is a different row here
-- and is matched separately where its abbreviation is known, which is why both
-- Punjab Kings and Kings XI Punjab appear.

UPDATE "team" SET "kind" = 'international', "updated_at" = now()
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND "kind" = 'representative'
  AND "name" ~* '\ynational cricket team';--> statement-breakpoint

UPDATE "team" SET "kind" = 'development', "updated_at" = now()
WHERE "sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND "kind" = 'international'
  AND ("name" ~* 'under[- ]?[0-9]{2}' OR "name" ~* '\yU-?(13|15|16|17|19|23)\y');--> statement-breakpoint

-- Abbreviations. `short_name` is only overwritten where it is currently unset,
-- so a curated value already in the database wins over this list.
UPDATE "team" AS t SET "short_name" = v.abbreviation, "updated_at" = now()
FROM (VALUES
  -- Indian Premier League, current
  ('Chennai Super Kings', 'CSK'),
  ('Mumbai Indians', 'MI'),
  ('Royal Challengers Bengaluru', 'RCB'),
  ('Royal Challengers Bangalore', 'RCB'),
  ('Kolkata Knight Riders', 'KKR'),
  ('Delhi Capitals', 'DC'),
  ('Sunrisers Hyderabad', 'SRH'),
  ('Rajasthan Royals', 'RR'),
  ('Punjab Kings', 'PBKS'),
  ('Gujarat Titans', 'GT'),
  ('Lucknow Super Giants', 'LSG'),
  -- Indian Premier League, former
  ('Kings XI Punjab', 'KXIP'),
  ('Delhi Daredevils', 'DD'),
  ('Deccan Chargers', 'DC'),
  ('Rising Pune Supergiant', 'RPS'),
  ('Rising Pune Supergiants', 'RPS'),
  ('Gujarat Lions', 'GL'),
  ('Kochi Tuskers Kerala', 'KTK'),
  ('Pune Warriors India', 'PWI'),
  -- Pakistan Super League
  ('Islamabad United', 'IU'),
  ('Karachi Kings', 'KK'),
  ('Lahore Qalandars', 'LQ'),
  ('Peshawar Zalmi', 'PZ'),
  ('Quetta Gladiators', 'QG'),
  ('Multan Sultans', 'MS'),
  -- Big Bash League
  ('Adelaide Strikers', 'AS'),
  ('Brisbane Heat', 'BH'),
  ('Hobart Hurricanes', 'HH'),
  ('Melbourne Renegades', 'MR'),
  ('Melbourne Stars', 'MS'),
  ('Perth Scorchers', 'PS'),
  ('Sydney Sixers', 'SS'),
  ('Sydney Thunder', 'ST'),
  -- SA20
  ('Durban''s Super Giants', 'DSG'),
  ('Joburg Super Kings', 'JSK'),
  ('MI Cape Town', 'MICT'),
  ('Paarl Royals', 'PR'),
  ('Pretoria Capitals', 'PC'),
  ('Sunrisers Eastern Cape', 'SEC')
) AS v(name, abbreviation)
WHERE t."sport_id" = (SELECT id FROM sport WHERE slug = 'cricket')
  AND t."kind" = 'franchise'
  AND t."name" = v.name
  AND t."short_name" IS NULL;
