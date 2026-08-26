-- Section and explainer types for the basketball library.
--
-- Additive only. Postgres enum values cannot be removed, and nothing here
-- renames or reorders an existing one, so football's and cricket's rows are
-- untouched by this migration.
--
-- ## Why basketball needs its own section types
--
-- Two of these carry the weight:
--
-- `rule_differences` is the one basketball cannot do without. The same concept
-- is officiated differently by the NBA, FIBA, the NCAA and the WNBA: a
-- travelling call, a defensive three-second violation and the length of a
-- quarter all differ by competition. Cricket solved the identical problem with
-- `format_differences` (a Test is not a T20) rather than by writing one
-- explainer per format, and the same answer applies here. One concept, one
-- canonical URL, and the competition differences in a section of it. Writing
-- `nba-traveling` and `fiba-traveling` as separate articles would split a
-- single concept across two pages that mostly agree.
--
-- `how_to_read_it` is for the statistics templates. A box score and a shooting
-- split are read rather than calculated, and the existing
-- `how_it_is_calculated` answers a different question.
--
-- The rest are the play-diagram vocabulary: an offensive action is taught as a
-- sequence of steps with a diagram per step, which `step_by_step` alone does
-- not express.
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'rule_differences';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'how_to_read_it';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'the_action';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'how_it_is_defended';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'counters';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'where_it_happens';--> statement-breakpoint

-- Explainer types, which choose the page template.
--
-- `play` is a designed offensive or defensive action: a pick and roll is not a
-- `tactical_concept` in the sense that spacing is, because it has actors, a
-- sequence and a diagram. `court_area` is a region of the floor rather than a
-- rule or a role, and `officiating` covers the violation and foul pages, whose
-- shape is "what it is, how it is judged, how the leagues differ".
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'play';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'court_area';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'officiating';
