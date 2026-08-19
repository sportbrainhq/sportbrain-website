CREATE TYPE "public"."explainer_difficulty" AS ENUM('beginner', 'intermediate', 'advanced');--> statement-breakpoint
CREATE TYPE "public"."explainer_relation_type" AS ENUM('related_to', 'requires_understanding', 'part_of', 'contrasts_with', 'used_in', 'variation_of', 'measured_by');--> statement-breakpoint
CREATE TYPE "public"."explainer_section_type" AS ENUM('one_sentence', 'simple_explanation', 'how_it_works', 'example', 'why_it_matters', 'common_misunderstandings', 'key_takeaways', 'the_law', 'in_practice', 'basic_structure', 'in_possession', 'out_of_possession', 'strengths', 'weaknesses', 'variations', 'player_profiles', 'movement', 'responsibilities', 'what_it_measures', 'how_it_is_calculated', 'how_to_interpret', 'what_it_does_not_tell_you', 'provider_differences', 'tactical_application', 'historical_context');--> statement-breakpoint
CREATE TYPE "public"."explainer_type" AS ENUM('standard', 'definition', 'rule', 'formation', 'tactical_concept', 'statistic', 'position_role');--> statement-breakpoint
CREATE TABLE "explainer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"short_description" text,
	"type" "explainer_type" DEFAULT 'standard' NOT NULL,
	"difficulty" "explainer_difficulty" DEFAULT 'beginner' NOT NULL,
	"primary_category_id" uuid,
	"read_minutes" integer,
	"is_start_here" text DEFAULT 'false' NOT NULL,
	"is_featured" text DEFAULT 'false' NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_alias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"explainer_id" uuid NOT NULL,
	"alias" text NOT NULL,
	"normalised" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"short_name" text,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_category_link" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"explainer_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_relation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"relation_type" "explainer_relation_type" DEFAULT 'related_to' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"explainer_id" uuid NOT NULL,
	"type" "explainer_section_type" NOT NULL,
	"heading" text,
	"body" text,
	"structured_data" jsonb,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "explainer_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"explainer_id" uuid NOT NULL,
	"source_id" uuid NOT NULL,
	"locator" text,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "explainer" ADD CONSTRAINT "explainer_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer" ADD CONSTRAINT "explainer_primary_category_id_explainer_category_id_fk" FOREIGN KEY ("primary_category_id") REFERENCES "public"."explainer_category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_alias" ADD CONSTRAINT "explainer_alias_explainer_id_explainer_id_fk" FOREIGN KEY ("explainer_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_category" ADD CONSTRAINT "explainer_category_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_category_link" ADD CONSTRAINT "explainer_category_link_explainer_id_explainer_id_fk" FOREIGN KEY ("explainer_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_category_link" ADD CONSTRAINT "explainer_category_link_category_id_explainer_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."explainer_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_relation" ADD CONSTRAINT "explainer_relation_source_id_explainer_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_relation" ADD CONSTRAINT "explainer_relation_target_id_explainer_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_section" ADD CONSTRAINT "explainer_section_explainer_id_explainer_id_fk" FOREIGN KEY ("explainer_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_source" ADD CONSTRAINT "explainer_source_explainer_id_explainer_id_fk" FOREIGN KEY ("explainer_id") REFERENCES "public"."explainer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "explainer_source" ADD CONSTRAINT "explainer_source_source_id_content_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_slug_idx" ON "explainer" USING btree ("sport_id","slug");--> statement-breakpoint
CREATE INDEX "explainer_listing_idx" ON "explainer" USING btree ("sport_id","status","display_order");--> statement-breakpoint
CREATE INDEX "explainer_category_lookup_idx" ON "explainer" USING btree ("primary_category_id","status");--> statement-breakpoint
CREATE INDEX "explainer_start_here_idx" ON "explainer" USING btree ("sport_id","is_start_here","status");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_alias_unique_idx" ON "explainer_alias" USING btree ("explainer_id","normalised");--> statement-breakpoint
CREATE INDEX "explainer_alias_lookup_idx" ON "explainer_alias" USING btree ("normalised");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_category_slug_idx" ON "explainer_category" USING btree ("sport_id","slug");--> statement-breakpoint
CREATE INDEX "explainer_category_order_idx" ON "explainer_category" USING btree ("sport_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_category_link_unique_idx" ON "explainer_category_link" USING btree ("explainer_id","category_id");--> statement-breakpoint
CREATE INDEX "explainer_category_link_lookup_idx" ON "explainer_category_link" USING btree ("category_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_relation_unique_idx" ON "explainer_relation" USING btree ("source_id","target_id","relation_type");--> statement-breakpoint
CREATE INDEX "explainer_relation_lookup_idx" ON "explainer_relation" USING btree ("source_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_section_unique_idx" ON "explainer_section" USING btree ("explainer_id","type");--> statement-breakpoint
CREATE INDEX "explainer_section_order_idx" ON "explainer_section" USING btree ("explainer_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "explainer_source_unique_idx" ON "explainer_source" USING btree ("explainer_id","source_id");--> statement-breakpoint
CREATE INDEX "explainer_source_lookup_idx" ON "explainer_source" USING btree ("explainer_id","display_order");