-- Two sibling section types for the scoring explainer.
--
-- The unique index on (explainer_id, type) means one explainer holds one
-- section per type, so a page needing a team score, a batting line and a
-- bowling analysis needs three types rather than three rows of one type.
-- Seeding them as one type silently kept only the last.
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'reading_a_batting_line';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'reading_a_bowling_analysis';
