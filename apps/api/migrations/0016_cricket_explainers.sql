-- Cricket explainers: new templates, new sections, rule-sensitivity metadata.
--
-- No new tables. The explainer layer is keyed by sport and its taxonomy lives
-- in rows, so cricket needs no structure football did not already have. What it
-- does need is templates football has no use for (a dismissal's decision
-- sequence, a fielding position's coordinates) and a way to find rule-dependent
-- content when the Laws or a competition's playing conditions change.
--
-- ALTER TYPE ... ADD VALUE is append-only and cannot run inside a transaction
-- block in older Postgres, so each value is its own statement.

ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'dismissal';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'bowling_delivery';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'batting_technique';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'field_position';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'format';--> statement-breakpoint
ALTER TYPE "public"."explainer_type" ADD VALUE IF NOT EXISTS 'technology';--> statement-breakpoint

ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'format_differences';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'when_you_will_see_it';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'step_by_step';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'decision_sequence';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'reviews_and_technology';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'grip_and_release';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'what_the_batter_expects';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'what_actually_happens';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'how_batters_counter_it';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'footwork_and_bat_path';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'scoring_area';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'risk';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'common_mistakes';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'position_on_the_field';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'purpose';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'when_it_is_used';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'duration_and_structure';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'result_types';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'who_plays_it';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'reading_the_score';--> statement-breakpoint

-- Rule-sensitivity metadata. Text rather than boolean/timestamp to match the
-- existing flags on this table, which are 'true'/'false' strings.
ALTER TABLE "explainer" ADD COLUMN IF NOT EXISTS "is_rule_sensitive" text DEFAULT 'false' NOT NULL;--> statement-breakpoint
ALTER TABLE "explainer" ADD COLUMN IF NOT EXISTS "source_revision" text;--> statement-breakpoint
ALTER TABLE "explainer" ADD COLUMN IF NOT EXISTS "last_reviewed_at" text;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "explainer_rule_review_idx" ON "explainer" USING btree ("sport_id","is_rule_sensitive","last_reviewed_at");
