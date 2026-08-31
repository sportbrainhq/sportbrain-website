-- Section and explainer types for the tennis library.
--
-- Additive only. Postgres enum values cannot be removed, and nothing here
-- renames or reorders an existing one, so football's, cricket's and
-- basketball's rows are untouched by this migration.
--
-- ## What tennis reuses
--
-- Most of it. `rule_differences` already carries the "the competitions do not
-- agree" job that tennis needs constantly: a final-set tiebreak is played to
-- ten at the Australian Open and to seven at Wimbledon under different
-- conditions, coaching is permitted on one tour and restricted on another, and
-- the tours' bathroom-break rules are not the same document. That is the same
-- shape as the NBA-versus-FIBA problem basketball introduced the type for, so
-- tennis writes one explainer per concept and puts the divergence in a section
-- of it rather than in `atp-tiebreak` and `wta-tiebreak` pages that would agree
-- on nine sentences out of ten.
--
-- `what_it_measures`, `how_it_is_calculated`, `how_to_interpret` and
-- `what_it_does_not_tell_you` carry the statistics categories unchanged, and
-- the last of those is not optional for tennis either: "total points won" is
-- the single most misread number in the sport, and a page that reports it
-- without saying why the loser often leads it teaches the wrong lesson.
--
-- ## What is new
--
-- `the_shot` is the tennis analogue of basketball's `the_action`: a stroke is
-- described before it is justified, and a forehand explainer that opens with
-- why players hit forehands has skipped the part the reader came for.
--
-- `when_players_use_it`, `advantages` and `risks` are the brief's own structure
-- for the shots and playing-styles categories. They are separate types rather
-- than one `strengths` section because a drop shot's upside and its downside
-- are the two halves a reader compares, and collapsing them into a single
-- heading is what turns a decision into a paragraph.
--
-- `notable_players` exists so the "who is associated with this" material has
-- one home across shots, styles and surfaces, instead of being smuggled into
-- the example section of a hundred entries.
--
-- `worked_example` is distinct from `example`. The rankings and statistics
-- categories are asked for as worked arithmetic rather than illustration, and
-- keeping them apart means an entry can carry both: a sentence showing the idea
-- and a table showing the sum.

ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'the_shot';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'when_players_use_it';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'advantages';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'risks';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'notable_players';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'worked_example';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'how_it_is_played';--> statement-breakpoint

-- Explainer types.
--
-- `shot` and `playing_style` are the two tennis genuinely needs: a stroke is
-- not a `play` (nobody diagrams a forehand as a designed sequence) and a
-- counterpuncher is not a `position_role` (tennis has no positions). `surface`
-- earns its own because a surface is the axis the entire sport's results are
-- split along, and typing clay as a `standard` article would leave the twelve
-- surface explainers indistinguishable from everything else in a filter.
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'shot';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'playing_style';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'surface';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'equipment';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'ranking_concept';
