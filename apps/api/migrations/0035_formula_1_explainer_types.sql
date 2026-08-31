-- Section and explainer types for the Formula 1 library.
--
-- Additive only. Postgres enum values cannot be removed, and nothing here
-- renames or reorders an existing one, so football's, cricket's, basketball's
-- and tennis's rows are untouched by this migration.
--
-- ## What Formula 1 reuses
--
-- More than it adds. `rule_differences` already carries the "these do not
-- agree" job, and F1 needs it for a reason the other sports do not have: the
-- disagreement is across *time* rather than across competitions. There is one
-- Formula 1, but the points system, the power unit architecture, the aero
-- regulations and the tyre allocation have each been rewritten several times,
-- and a 2014 race cannot be read with 2026 rules. The section is where an
-- explainer says which era it is describing and how the previous one differed.
--
-- The statistics quartet (`what_it_measures`, `how_it_is_calculated`,
-- `how_to_interpret`, `what_it_does_not_tell_you`) carries the telemetry and
-- performance-analysis categories unchanged, and the last of those is load
-- bearing here. The brief asks for tyre-corrected pace, fuel-corrected lap
-- times and expected race position, none of which is an official FIA
-- statistic; a page that presents a derived model without saying what it
-- assumes is how a reader ends up quoting it as a fact.
--
-- `advantages` and `risks` transfer directly from tennis to strategy, where
-- they are the two halves of every decision the sport is actually about: an
-- undercut's upside and its cost are what a pit wall weighs in the ninety
-- seconds before the call.
--
-- ## What is new
--
-- `the_procedure` is the F1 analogue of basketball's `the_action` and tennis's
-- `the_shot`: the sport is full of sequences that are conducted rather than
-- played (the starting procedure, a pit stop, a safety car restart, parc
-- fermé), and each is described step by step before it is justified.
--
-- `on_the_car` gives the component explainers one home for "which part of the
-- car this is and what it is attached to", which is a different question from
-- how it works and wants to come first.
--
-- `strategic_implications` is separate from `why_it_matters` on purpose. A
-- safety car matters to a spectator because the field closes up, and matters
-- to a strategist because the pit loss halves; those are two different
-- paragraphs, and merging them produces one that serves neither reader.
--
-- `driver_technique` is where a concept says what the driver is physically
-- doing, which the braking, cornering and driver-skill categories need and no
-- existing type provides.
--
-- `regulation_era` is the versioning the brief asks for three separate times.
-- Stored as a section rather than only as `source_revision` on the row because
-- the reader has to see it: "applicable season or regulation era" is a
-- statement on the page, not metadata for an internal audit.

ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'the_procedure';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'on_the_car';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'strategic_implications';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'driver_technique';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'regulation_era';--> statement-breakpoint

-- Explainer types.
--
-- `car_component` is the one Formula 1 cannot do without: a front wing is not a
-- `court_area` and not a piece of `equipment` in the tennis sense (a racket is
-- chosen by a player, a diffuser is designed by a team), and typing seventeen
-- car parts as `standard` would make them indistinguishable in a filter from
-- "How an F1 Season Works".
--
-- `procedure` covers the conducted sequences: the start, the pit stop, a
-- restart, scrutineering. `strategy_concept` is distinct from
-- `tactical_concept` because an undercut is arithmetic performed on a pit
-- wall rather than a pattern of play, and the strategy category is large
-- enough that collapsing it into the general tactical type would swamp four
-- other sports' entries in a shared filter.
--
-- `circuit` is the F1 analogue of tennis's `surface`, and exists for the same
-- reason: the track is the axis performance is split along, and a reader
-- comparing Monaco with Monza is doing the thing the type is for.
--
-- `penalty` and `flag` are their own types rather than `officiating` because
-- the brief asks for two full categories of them and they answer a lookup
-- question ("what does a black-and-white flag mean") that a reader arrives
-- with mid-race, which is worth being able to filter for on its own.
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'car_component';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'procedure';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'strategy_concept';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'circuit';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'penalty';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'flag';
