-- Record which sports have a current club worth showing as a present-tense fact.
--
-- A cricketer's profile was carrying "Current club" twice: once from the
-- person's own attributes and once from an ingested fact filed under a heading
-- of the same name. Both were arbitrary. A cricketer belongs to a national
-- side, a first-class side and one or more franchises simultaneously, so a
-- single box naming one of them is not a simplification of the truth but a
-- choice the page has no basis to make. Sachin Tendulkar's read "Marylebone
-- Cricket Club".
--
-- Expressed as a trait rather than as a slug test in the website, which is the
-- mechanism that has kept per-sport branching out of the front end: the page
-- asks the sport whether the fact means anything, and the sport answers.
--
-- Football and basketball say yes, where a player has one club at a time and
-- the box is the fact a reader came for. Tennis and Formula 1 are untouched:
-- neither carries the fact, and their competitors are individuals.
UPDATE "sport"
SET "traits" = "traits" || '{"playersHaveCurrentClub": true}'::jsonb,
    "updated_at" = now()
WHERE "slug" IN ('football', 'basketball');

UPDATE "sport"
SET "traits" = "traits" || '{"playersHaveCurrentClub": false}'::jsonb,
    "updated_at" = now()
WHERE "slug" = 'cricket';
