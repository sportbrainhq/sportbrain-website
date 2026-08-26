-- Finish the merge started in 0013.
--
-- 0013 left 16 overlapping pairs behind, because one pass is not a fixed point:
-- each row is rooted at the lowest id in its *own* overlap set, and an inner
-- span and an outer span can pick different roots when their neighbours differ
-- (Claudio Pizarro's four Werder Bremen statements, Cuadrado's two Juventus
-- ones). Widening a keeper then creates overlaps that were not there when the
-- plan was computed.
--
-- Repeating the pass until nothing changes settles it. The loop is bounded:
-- every iteration strictly reduces the row count, or exits.
--
-- Safe to run against already-merged data: with no overlaps left the first
-- iteration deletes nothing and exits.
DO $$
DECLARE
  removed integer;
  passes integer := 0;
BEGIN
  LOOP
    passes := passes + 1;

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

    -- Delete before widening: a widened keeper would otherwise collide with the
    -- row it is absorbing on `person_team_unique_idx`, which is what made the
    -- first attempt at 0013 fail.
    DELETE FROM person_team pt
    USING person_team_merge m
    WHERE pt.id = m.id
      AND m.root <> m.id;

    GET DIAGNOSTICS removed = ROW_COUNT;

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

    DROP TABLE person_team_merge;

    EXIT WHEN removed = 0;

    IF passes > 20 THEN
      RAISE EXCEPTION 'person_team merge did not converge after % passes', passes;
    END IF;
  END LOOP;
END $$;
