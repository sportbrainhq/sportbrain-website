-- Two section types for rule explainers.
--
-- Rules need the mechanics of an offence, its restart and any card, and its
-- named edge cases kept apart. Reusing `in_practice` for all three collided
-- with the unique index on (explainer_id, type), which is correct: one section
-- per type per explainer is what stops a template rendering a heading twice.
--
-- ALTER TYPE ... ADD VALUE is append-only and cannot run inside a transaction
-- block in older Postgres, so each is its own statement.
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'sanctions';--> statement-breakpoint
ALTER TYPE "public"."explainer_section_type" ADD VALUE IF NOT EXISTS 'edge_cases';
