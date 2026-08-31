-- Golf, American football, MMA and boxing.
--
-- Four sports added at once, chosen so the model is tested rather than
-- flattered, the same way `five-sports.sql` chose its five:
--
--   Golf              NO teams, individual, tour structure, cut-based scoring
--   American football team sport, franchises, the deepest positional split here
--   MMA               NO teams, individual, weight classes, promotions not leagues
--   Boxing            NO teams, individual, and four sanctioning bodies rather
--                     than one competition anybody agrees on
--
-- Three of the four have no teams. That is the point: the `traits` mechanism
-- introduced for tennis is what keeps the Teams tab from rendering, and if it
-- did not generalise the front end would need a branch per sport.
--
-- ## Why promotions are not teams
--
-- UFC, Bellator, ONE and the PFL stage and sanction bouts. They do not compete.
-- `team` in this schema means an organisation that competes, which is why a
-- Formula 1 constructor is one and a promotion is not, so they are ingested as
-- competitions. The same reasoning puts the WBC, WBA, IBF and WBO outside the
-- Teams tab for boxing.
--
-- ## Overview and explainers are deliberately absent
--
-- No `summary`, no overview sections, no explainer library. Those are
-- human-authored editorial and writing them is a separate piece of work from
-- standing the sports up; seeding placeholder prose would put text on the site
-- that nobody wrote. The tabs render empty until somebody writes them.
--
-- Idempotent: re-running changes nothing.

-- ---------------------------------------------------------------------------
-- SPORTS
-- ---------------------------------------------------------------------------
INSERT INTO sport (id, slug, name, short_code, display_order, is_launched, traits) VALUES
 -- Individual, and the tour is a season-long money list rather than a table.
 ('50000000-0000-0000-0000-000000000006','golf','Golf','GF',60,true,
  '{"hasTeams":false,"hasLeagueTable":false,"individualCompetitors":true,"scoringModel":"strokes"}'),
 -- The one team sport of the four. Franchises, a conference structure, and a
 -- standings table, so it is shaped like basketball rather than like the rest
 -- of this migration.
 ('50000000-0000-0000-0000-000000000007','american-football','American Football','AF',70,true,
  '{"hasTeams":true,"hasLeagueTable":true,"individualCompetitors":false,"playersHaveCurrentClub":true,"scoringModel":"points"}'),
 -- A fighter belongs to a gym and fights under a promotion, and neither is a
 -- side that competes, so there is no current club worth a present-tense box.
 ('50000000-0000-0000-0000-000000000008','mma','MMA','MM',80,true,
  '{"hasTeams":false,"hasLeagueTable":false,"individualCompetitors":true,"scoringModel":"decision","hasWeightClasses":true}'),
 ('50000000-0000-0000-0000-000000000009','boxing','Boxing','BX',90,true,
  '{"hasTeams":false,"hasLeagueTable":false,"individualCompetitors":true,"scoringModel":"decision","hasWeightClasses":true}')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- DISCIPLINES  (divisions whose statistics are not comparable)
-- ---------------------------------------------------------------------------
-- American football only. A quarterback's stat set is disjoint from a running
-- back's and from a kicker's, which is the same role split football uses for
-- outfielders and goalkeepers, only wider.
--
-- Golf, MMA and boxing get none. A golfer's scoring average is one number
-- across every tour, and a fighter's record is one record: weight class changes
-- who they fight, not what is counted, so it is an attribute of a bout rather
-- than a statistical world of its own.
INSERT INTO discipline (id, sport_id, key, label, kind, display_order) VALUES
 ('d6000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000007','passing','Passing','role',10),
 ('d6000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000007','rushing','Rushing','role',20),
 ('d6000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000007','receiving','Receiving','role',30),
 ('d6000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000007','defence','Defence','role',40),
 ('d6000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000007','kicking','Kicking','role',50)
ON CONFLICT (sport_id, key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- TEAMS-TAB GROUPINGS
-- ---------------------------------------------------------------------------
-- American football alone, for the same reason tennis has none: the other three
-- sports do not render a Teams tab at all.
INSERT INTO sport_section (id, sport_id, tab, label, slug, display_order) VALUES
 ('5e000000-0000-0000-0000-000000000007','50000000-0000-0000-0000-000000000007','teams','NFL Teams','nfl',10)
ON CONFLICT (sport_id, tab, slug) DO NOTHING;
