-- Five-sport feasibility test.
--
-- Chosen to break the model rather than flatter it:
--   Football  team sport, league table            (the easy case)
--   Cricket   team sport, three incompatible formats
--   Basketball team sport, conference structure
--   Tennis    NO teams, individual, tournament draw, ranking points
--   Formula 1 TWO parallel championships from one event, drivers and constructors
--
-- If tennis and F1 fit without a schema change, the model holds.

-- ---------------------------------------------------------------------------
-- SPORTS
-- ---------------------------------------------------------------------------
INSERT INTO sport (id, slug, name, short_code, display_order, is_launched, traits) VALUES
 ('50000000-0000-0000-0000-000000000001','football','Football','FB',10,true,
  '{"hasTeams":true,"hasLeagueTable":true,"individualCompetitors":false,"playersHaveCurrentClub":true,"scoringModel":"goals"}'),
 ('50000000-0000-0000-0000-000000000002','cricket','Cricket','CR',20,true,
  '{"hasTeams":true,"hasLeagueTable":true,"individualCompetitors":false,"playersHaveCurrentClub":false,"scoringModel":"runs"}'),
 ('50000000-0000-0000-0000-000000000003','basketball','Basketball','BK',30,true,
  '{"hasTeams":true,"hasLeagueTable":true,"individualCompetitors":false,"playersHaveCurrentClub":true,"scoringModel":"points"}'),
 ('50000000-0000-0000-0000-000000000004','tennis','Tennis','TN',40,true,
  '{"hasTeams":false,"hasLeagueTable":false,"individualCompetitors":true,"scoringModel":"ranking_points","hasDraw":true}'),
 ('50000000-0000-0000-0000-000000000005','formula-1','Formula 1','F1',50,true,
  '{"hasTeams":true,"hasLeagueTable":false,"individualCompetitors":true,"scoringModel":"championship_points","dualChampionship":true}');

-- ---------------------------------------------------------------------------
-- DISCIPLINES  (divisions whose statistics are not comparable)
-- ---------------------------------------------------------------------------
INSERT INTO discipline (id, sport_id, key, label, kind, display_order) VALUES
 -- Football: role split. A goalkeeper's stat set is disjoint from an outfielder's.
 ('d1000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','outfield','Outfield','role',10),
 ('d1000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','goalkeeper','Goalkeeper','role',20),
 -- Cricket: format split. Same player, five incomparable careers. The domestic
 -- pair sits alongside the internationals rather than inside them: every Test
 -- is a first-class match and every ODI a List A one, most of each are not,
 -- and the averages differ.
 ('d2000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000002','test','Test','format',10),
 ('d2000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000002','odi','ODI','format',20),
 ('d2000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','t20i','T20I','format',30),
 ('d2000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000002','first_class','First Class','format',40),
 ('d2000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000002','list_a','List A','format',50),
 -- Tennis: surface changes what a win is worth and is how tennis records are kept.
 ('d4000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000004','hard','Hard','surface',10),
 ('d4000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000004','clay','Clay','surface',20),
 ('d4000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000004','grass','Grass','surface',30),
 -- F1: qualifying and race are separate performances from one weekend.
 ('d5000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000005','race','Race','phase',10),
 ('d5000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000005','qualifying','Qualifying','phase',20);
-- Basketball has none: one undivided statistical world. Null discipline is the norm.

-- ---------------------------------------------------------------------------
-- TEAMS-TAB GROUPINGS
-- ---------------------------------------------------------------------------
INSERT INTO sport_section (id, sport_id, tab, label, slug, display_order) VALUES
 ('5e000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','teams','International teams','international',10),
 ('5e000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','teams','Club Teams','clubs',20),
 ('5e000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','teams','International teams','international',10),
 ('5e000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000002','teams','Franchise Teams','franchises',20),
 ('5e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000003','teams','NBA Teams','nba',10),
 -- F1 constructors are teams in the schema sense: organisations that compete.
 ('5e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','teams','Constructors','constructors',10);
-- Tennis gets no team section at all. The Teams tab simply does not render for it.

-- ---------------------------------------------------------------------------
-- TEAMS
-- ---------------------------------------------------------------------------
-- `country` is spelled the way the Wikidata ingest spells it ("United States",
-- not "USA"), and `confidence` is 'provisional' rather than 'verified', for the
-- Celtics row below. Both mattered: the row owns the `boston-celtics` slug for
-- basketball, the team ingest upserts with
-- `onConflictDoNothing(sportId, slug)`, and `deriveTeamPriority` skips anything
-- not 'provisional'. So this fixture silently blocked the real Boston Celtics
-- (Q131371, 78 sitelinks, 17 championships) from ever being ingested and pinned
-- its notability at the floor, which is why the most successful franchise in
-- the NBA was absent from the Teams tab while 400 college programmes were on it.
INSERT INTO team (id, sport_id, kind, section_id, slug, name, short_name, country, founded_year, confidence) VALUES
 ('7e000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','international','5e000000-0000-0000-0000-000000000001','argentina','Argentina','ARG','Argentina',1893,'verified'),
 ('7e000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','club','5e000000-0000-0000-0000-000000000002','real-madrid','Real Madrid','RMA','Spain',1902,'verified'),
 ('7e000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','international','5e000000-0000-0000-0000-000000000003','india','India','IND','India',1926,'verified'),
 ('7e000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000002','franchise','5e000000-0000-0000-0000-000000000004','chennai-super-kings','Chennai Super Kings','CSK','India',2008,'verified'),
 ('7e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000003','club','5e000000-0000-0000-0000-000000000005','boston-celtics','Boston Celtics','BOS','United States',1946,'provisional'),
 ('7e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','club','5e000000-0000-0000-0000-000000000006','mercedes','Mercedes-AMG Petronas','MER','Germany',2010,'verified');

-- ---------------------------------------------------------------------------
-- PEOPLE
-- ---------------------------------------------------------------------------
INSERT INTO person (id, primary_sport_id, slug, full_name, display_name, nationality, confidence) VALUES
 ('9e000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','lionel-messi','Lionel Messi','Messi','ARG','verified'),
 ('9e000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','emiliano-martinez','Emiliano Martinez','Martinez','ARG','verified'),
 ('9e000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','virat-kohli','Virat Kohli','Kohli','IND','verified'),
 ('9e000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003','jayson-tatum','Jayson Tatum','Tatum','USA','verified'),
 ('9e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','novak-djokovic','Novak Djokovic','Djokovic','SRB','verified'),
 ('9e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','lewis-hamilton','Lewis Hamilton','Hamilton','GBR','verified');

-- ---------------------------------------------------------------------------
-- STATISTIC REGISTRY  (the vocabulary of each sport)
-- ---------------------------------------------------------------------------
INSERT INTO statistic_definition
 (sport_id, discipline_id, key, label, short_label, applies_to, category, aggregation, format, precision, higher_is_better, is_headline, display_order, description) VALUES
 -- FOOTBALL, outfield
 ('50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','goals','Goals','G','player','Attacking','sum','integer',0,true,true,10,'Times the player has scored.'),
 ('50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','assists','Assists','A','player','Attacking','sum','integer',0,true,true,20,'Final pass before a goal.'),
 -- FOOTBALL, goalkeeper: a disjoint set on the same sport
 ('50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000002','clean_sheets','Clean Sheets','CS','player','Goalkeeping','sum','integer',0,true,true,10,'Matches completed without conceding.'),
 ('50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000002','save_percentage','Save %','Sv%','player','Goalkeeping','derived','percentage',1,true,true,20,'Shots on target saved.'),
 -- FOOTBALL, team-level (sport-wide, no discipline)
 ('50000000-0000-0000-0000-000000000001',NULL,'goals_for','Goals For','GF','team','Record','sum','integer',0,true,true,10,'Goals scored by the team.'),
 ('50000000-0000-0000-0000-000000000001',NULL,'goals_against','Goals Against','GA','team','Record','sum','integer',0,false,true,20,'Goals conceded. Lower is better.'),

 -- CRICKET, Test
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000001','runs','Runs','R','player','Batting','sum','integer',0,true,true,10,'Total runs scored.'),
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000001','batting_average','Batting Average','Avg','player','Batting','derived','decimal',2,true,true,20,'Runs per dismissal, not the mean of season averages.'),
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000001','wickets','Wickets','W','player','Bowling','sum','integer',0,true,false,30,'Batters dismissed.'),
 -- CRICKET, T20I: same keys, different discipline, different typical values
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000003','runs','Runs','R','player','Batting','sum','integer',0,true,true,10,'Total runs scored.'),
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000003','batting_average','Batting Average','Avg','player','Batting','derived','decimal',2,true,true,20,'Runs per dismissal.'),
 ('50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000003','strike_rate','Strike Rate','SR','player','Batting','derived','decimal',2,true,true,30,'Runs per hundred balls faced.'),

 -- BASKETBALL: no disciplines, everything sport-wide
 ('50000000-0000-0000-0000-000000000003',NULL,'points','Points','PTS','player','Scoring','sum','integer',0,true,true,10,'Total points scored.'),
 ('50000000-0000-0000-0000-000000000003',NULL,'points_per_game','Points Per Game','PPG','player','Scoring','average','decimal',1,true,true,20,'Mean points per appearance.'),
 ('50000000-0000-0000-0000-000000000003',NULL,'rebounds','Rebounds','REB','player','Rebounding','sum','integer',0,true,false,30,'Possessions recovered after a missed shot.'),
 ('50000000-0000-0000-0000-000000000003',NULL,'assists','Assists','AST','player','Playmaking','sum','integer',0,true,false,40,'Passes leading directly to a score.'),

 -- TENNIS: individual sport, surface-split, plus sport-wide career totals
 ('50000000-0000-0000-0000-000000000004',NULL,'titles','Titles','T','player','Career','sum','integer',0,true,true,10,'Tournaments won.'),
 ('50000000-0000-0000-0000-000000000004',NULL,'grand_slams','Grand Slams','GS','player','Career','sum','integer',0,true,true,20,'The four majors.'),
 ('50000000-0000-0000-0000-000000000004',NULL,'weeks_at_no1','Weeks at No. 1','W1','player','Career','max','integer',0,true,true,30,'Cumulative weeks ranked first.'),
 ('50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000001','match_wins','Match Wins','W','player','Hard','sum','integer',0,true,false,10,'Matches won on this surface.'),
 ('50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000002','match_wins','Match Wins','W','player','Clay','sum','integer',0,true,false,10,'Matches won on this surface.'),
 ('50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000003','match_wins','Match Wins','W','player','Grass','sum','integer',0,true,false,10,'Matches won on this surface.'),

 -- FORMULA 1: the same key applies to a driver and to a constructor
 ('50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','wins','Wins','W','both','Race','sum','integer',0,true,true,10,'Grands Prix won.'),
 ('50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','podiums','Podiums','P','both','Race','sum','integer',0,true,true,20,'Top-three finishes.'),
 ('50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','fastest_laps','Fastest Laps','FL','both','Race','sum','integer',0,true,false,30,'Fastest lap of the race.'),
 ('50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000002','pole_positions','Pole Positions','Pole','both','Qualifying','sum','integer',0,true,true,10,'First on the starting grid.');

-- ---------------------------------------------------------------------------
-- PLAYER CAREER STATISTICS
-- ---------------------------------------------------------------------------
INSERT INTO person_statistic (person_id, sport_id, discipline_id, scope, appearances, primary_value, stats) VALUES
 -- Football outfield vs goalkeeper: two players, disjoint stat sets, same sport
 ('9e000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000001','career',1100,745,'{"goals":745,"assists":364}'),
 ('9e000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','d1000000-0000-0000-0000-000000000002','career',320,NULL,'{"clean_sheets":112,"save_percentage":73.4}'),
 -- Cricket: one player, two formats, never merged
 ('9e000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000001','career',123,9230,'{"runs":9230,"batting_average":47.83,"wickets":0}'),
 ('9e000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','d2000000-0000-0000-0000-000000000003','career',125,4188,'{"runs":4188,"batting_average":48.69,"strike_rate":137.04}'),
 -- Basketball: no discipline
 ('9e000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003',NULL,'career',540,13200,'{"points":13200,"points_per_game":24.4,"rebounds":4200,"assists":2100}'),
 -- Tennis: sport-wide career row plus one row per surface
 ('9e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004',NULL,'career',1420,99,'{"titles":99,"grand_slams":24,"weeks_at_no1":428}'),
 ('9e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000001','career',780,NULL,'{"match_wins":700}'),
 ('9e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000002','career',330,NULL,'{"match_wins":260}'),
 ('9e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000003','career',210,NULL,'{"match_wins":180}'),
 -- F1 driver: race and qualifying are separate performances
 ('9e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','career',350,105,'{"wins":105,"podiums":202,"fastest_laps":67}'),
 ('9e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000002','career',350,104,'{"pole_positions":104}');

-- ---------------------------------------------------------------------------
-- TEAM STATISTICS  (including the F1 constructors' championship)
-- ---------------------------------------------------------------------------
INSERT INTO team_statistic (team_id, sport_id, discipline_id, scope, played, wins, draws, losses, points, stats) VALUES
 ('7e000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001',NULL,'career',4200,2600,900,700,NULL,'{"goals_for":9100,"goals_against":4300}'),
 ('7e000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000003',NULL,'career',6200,3600,0,2600,NULL,'{}'),
 -- The same F1 event feeds a constructors' row alongside the drivers' rows above.
 ('7e000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','career',300,125,0,175,NULL,'{"wins":125,"podiums":290,"fastest_laps":95}');

-- ---------------------------------------------------------------------------
-- COMPETITIONS
-- ---------------------------------------------------------------------------
INSERT INTO competition (id, sport_id, kind, format, slug, name, tier, country) VALUES
 ('c0000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','international','group_knockout','world-cup','FIFA World Cup',1,NULL),
 ('c0000000-0000-0000-0000-000000000002','50000000-0000-0000-0000-000000000001','domestic','league','la-liga','La Liga',1,'Spain'),
 ('c0000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002','domestic','league','ipl','Indian Premier League',1,'India'),
 ('c0000000-0000-0000-0000-000000000004','50000000-0000-0000-0000-000000000003','domestic','league','nba','NBA',1,'USA'),
 -- Tennis: a knockout draw, no table
 ('c0000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','international','knockout','wimbledon','Wimbledon',1,'United Kingdom'),
 -- F1: a championship, not a league
 ('c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','international','championship','f1-world-championship','FIA Formula One World Championship',1,NULL);

INSERT INTO competition_statistic (competition_id, sport_id, discipline_id, scope, stat_key, value, record_person_id, record_team_id, note) VALUES
 ('c0000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002',NULL,'all_time','most_runs',8004,'9e000000-0000-0000-0000-000000000003',NULL,'Across all seasons since 2008'),
 ('c0000000-0000-0000-0000-000000000003','50000000-0000-0000-0000-000000000002',NULL,'all_time','total_matches',1169,NULL,NULL,NULL),
 ('c0000000-0000-0000-0000-000000000005','50000000-0000-0000-0000-000000000004','d4000000-0000-0000-0000-000000000003','all_time','most_titles',8,'9e000000-0000-0000-0000-000000000005',NULL,'Open era, grass'),
 ('c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000002','all_time','most_poles',104,'9e000000-0000-0000-0000-000000000006',NULL,NULL),
 ('c0000000-0000-0000-0000-000000000006','50000000-0000-0000-0000-000000000005','d5000000-0000-0000-0000-000000000001','all_time','most_constructor_wins',125,NULL,'7e000000-0000-0000-0000-000000000006','Since 2010 as a works team');

-- ---------------------------------------------------------------------------
-- HONOURS
-- ---------------------------------------------------------------------------
INSERT INTO honour (sport_id, person_id, team_id, competition_id, kind, title, year) VALUES
 ('50000000-0000-0000-0000-000000000001','9e000000-0000-0000-0000-000000000001',NULL,NULL,'award','Ballon d''Or',2023),
 ('50000000-0000-0000-0000-000000000001',NULL,'7e000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','title','La Liga',2024),
 ('50000000-0000-0000-0000-000000000004','9e000000-0000-0000-0000-000000000005',NULL,'c0000000-0000-0000-0000-000000000005','title','Wimbledon',2022),
 ('50000000-0000-0000-0000-000000000005','9e000000-0000-0000-0000-000000000006',NULL,'c0000000-0000-0000-0000-000000000006','title','World Drivers'' Championship',2020),
 ('50000000-0000-0000-0000-000000000005',NULL,'7e000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000006','title','World Constructors'' Championship',2021);
