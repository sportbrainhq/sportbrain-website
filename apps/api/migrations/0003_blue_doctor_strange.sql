CREATE TABLE "entity_fact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"value" text NOT NULL,
	"category" text DEFAULT 'identity' NOT NULL,
	"year" integer,
	"is_current" text DEFAULT 'true' NOT NULL,
	"source" text DEFAULT 'wikidata' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_ranking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"entries" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"confidence" text DEFAULT 'partial' NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"heading" text NOT NULL,
	"body" text NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "entity_fact_unique_idx" ON "entity_fact" USING btree ("entity_type","entity_id","key","value");--> statement-breakpoint
CREATE INDEX "entity_fact_lookup_idx" ON "entity_fact" USING btree ("entity_type","entity_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_ranking_unique_idx" ON "entity_ranking" USING btree ("entity_type","entity_id","kind");--> statement-breakpoint
CREATE INDEX "entity_ranking_lookup_idx" ON "entity_ranking" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_section_unique_idx" ON "entity_section" USING btree ("entity_type","entity_id","kind");--> statement-breakpoint
CREATE INDEX "entity_section_lookup_idx" ON "entity_section" USING btree ("entity_type","entity_id","status");