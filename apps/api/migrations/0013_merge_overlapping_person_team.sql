-- Collapse overlapping spells at the same club into one row.
--
-- Wikidata records P54 as several statements per club whose P580/P582
-- qualifiers disagree: Pele's Santos spell is stated as both 1956-1974 and
-- 1957-1974. Both are inserted, because the unique index on `person_team`
-- includes the dates and two different start dates are two different rows as
-- far as Postgres is concerned. The result reached the career timeline as the
-- same club listed twice, for 1,849 people.
--
-- The provider now merges overlapping spans before insert; this repairs the
-- rows already written. Only overlapping spans are merged, so a genuine second
-- stint at a former club (disjoint dates) is left alone.
--
-- Nulls are coalesced to sentinels, as everywhere else that touches these
-- dates: a null start means unbounded in the past and a null end means the
-- spell is current, so an open-ended row absorbs the dated ones.
--
-- The grouping is transitive (A overlaps B, B overlaps C, A does not overlap C
-- still resolves to one row), which is why it needs the recursive closure
-- rather than a single self-join.
CREATE TEMPORARY TABLE person_team_merge AS
WITH RECURSIVE spans AS (
  SELECT
    id,
    person_id,
    team_id,
    role,
    coalesce(start_date, '1000-01-01'::date) AS lo,
    coalesce(end_date, '9999-12-31'::date) AS hi
  FROM person_team
),
edges AS (
  SELECT a.id AS from_id, min(b.id::text)::uuid AS to_id
  FROM spans a
  JOIN spans b
    ON a.person_id = b.person_id
   AND a.team_id = b.team_id
   AND a.role = b.role
   AND a.lo <= b.hi
   AND b.lo <= a.hi
  GROUP BY a.id
),
closure AS (
  SELECT from_id AS id, to_id AS root FROM edges
  UNION
  SELECT c.id, e.to_id
  FROM closure c
  JOIN edges e ON e.from_id = c.root
),
groups AS (
  SELECT id, min(root::text)::uuid AS root FROM closure GROUP BY id
)
SELECT
  g.id,
  g.root,
  min(s.lo) OVER (PARTITION BY g.root) AS lo,
  max(s.hi) OVER (PARTITION BY g.root) AS hi
FROM groups g
JOIN spans s ON s.id = g.id;
--> statement-breakpoint
-- Delete before widening, not after.
--
-- Widening first violates `person_team_unique_idx`: the keeper takes the span
-- of the row it is about to absorb, and that row still exists, so the two
-- become the same (person, team, role, start, end). The whole migration is one
-- transaction, so removing the redundant rows first is safe; the plan above is
-- a snapshot of ids and is unaffected by the delete.
DELETE FROM person_team pt
USING person_team_merge m
WHERE pt.id = m.id
  AND m.root <> m.id;
--> statement-breakpoint
-- Widen each keeper to the full span of the group it absorbed.
UPDATE person_team pt
SET
  start_date = CASE WHEN m.lo = '1000-01-01'::date THEN NULL ELSE m.lo END,
  end_date = CASE WHEN m.hi = '9999-12-31'::date THEN NULL ELSE m.hi END,
  updated_at = now()
FROM person_team_merge m
WHERE pt.id = m.root
  AND pt.id = m.id
  AND (
    pt.start_date IS DISTINCT FROM CASE WHEN m.lo = '1000-01-01'::date THEN NULL ELSE m.lo END
    OR pt.end_date IS DISTINCT FROM CASE WHEN m.hi = '9999-12-31'::date THEN NULL ELSE m.hi END
  );
--> statement-breakpoint
DROP TABLE person_team_merge;
