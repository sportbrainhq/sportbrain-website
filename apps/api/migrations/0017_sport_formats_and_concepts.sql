-- Sport format taxonomy, sport concepts, and dated/graded governance membership.
--
-- Hand-trimmed from a generated diff. drizzle-kit re-emitted everything
-- migration 0016 applied by hand (the explainer enum values, the explainer
-- columns, the rule-review index), because 0016 is not in its snapshot history.
-- Replaying `ALTER TYPE ... ADD VALUE` for a value that already exists aborts
-- the migration, so those statements are dropped rather than guarded: 0016
-- already made them true.
--
-- What genuinely changes here:
--
--   1. `sport_format`  the format taxonomy. Cricket needs Test and first-class
--      to be different rows in a parent/child tree rather than one string,
--      because they are not the same thing and no amount of prose fixes a
--      column that says they are.
--   2. `sport_concept` the vocabulary an Overview introduces before the
--      Explainers teach it.
--   3. `governing_body.member_count_as_of` so a membership figure carries the
--      date it was true, ICC membership being a moving target.
--   4. `governing_body.membership_tier` so Full and Associate Membership is
--      structural rather than implied, Full Membership being what confers Test
--      status.
--
-- Both new tables are sport-agnostic. Football populates neither today and is
-- unaffected either way.

CREATE TABLE IF NOT EXISTS "sport_format" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"parent_id" uuid,
	"match_class" text NOT NULL,
	-- Nullable on purpose: null is "not applicable to a grouping node", which
	-- is a different answer from false, and a default would merge the two.
	"is_international" boolean,
	"overs_per_side" integer,
	"innings_per_side" integer,
	"max_days" integer,
	"draw_possible" boolean,
	"description" text,
	"conditions_authority" text,
	"source_id" uuid,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sport_concept" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"key" text NOT NULL,
	"term" text NOT NULL,
	"summary" text NOT NULL,
	"category" text DEFAULT 'concept' NOT NULL,
	"ambiguity_note" text,
	-- Intentionally not a foreign key to `explainer`. The Overview is written
	-- before the Explainers exist, and a constraint would force placeholder
	-- explainer rows into being purely to satisfy it. The API resolves which
	-- slugs exist and the page links only those.
	"explainer_slug" text,
	"source_id" uuid,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "governing_body" ADD COLUMN IF NOT EXISTS "member_count_as_of" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "governing_body" ADD COLUMN IF NOT EXISTS "membership_tier" text;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "sport_format" ADD CONSTRAINT "sport_format_source_id_content_source_id_fk"
		FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

DO $$ BEGIN
	ALTER TABLE "sport_concept" ADD CONSTRAINT "sport_concept_source_id_content_source_id_fk"
		FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE set null;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

-- Self-reference for the taxonomy tree. Declared separately so the table can be
-- created before it points at itself. Cascading: deleting a parent format with
-- children left orphaned rows pointing at nothing.
DO $$ BEGIN
	ALTER TABLE "sport_format" ADD CONSTRAINT "sport_format_parent_id_fk"
		FOREIGN KEY ("parent_id") REFERENCES "public"."sport_format"("id") ON DELETE cascade;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS "sport_format_unique_idx" ON "sport_format" USING btree ("sport_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sport_format_tree_idx" ON "sport_format" USING btree ("sport_id","parent_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sport_concept_unique_idx" ON "sport_concept" USING btree ("sport_id","key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sport_concept_lookup_idx" ON "sport_concept" USING btree ("sport_id","category","display_order");
