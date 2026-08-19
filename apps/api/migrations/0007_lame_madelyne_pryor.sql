CREATE TABLE "content_source" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"external_id" text,
	"revision_id" text,
	"license" text,
	"retrieved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "governing_body" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"parent_id" uuid,
	"slug" text NOT NULL,
	"short_name" text NOT NULL,
	"name" text NOT NULL,
	"level" text NOT NULL,
	"region" text,
	"founded_year" integer,
	"member_count" integer,
	"headquarters" text,
	"website_url" text,
	"logo_url" text,
	"source_id" uuid,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sport_timeline_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"end_year" integer,
	"title" text NOT NULL,
	"short_description" text NOT NULL,
	"long_description" text,
	"category" text NOT NULL,
	"is_major_milestone" text DEFAULT 'false' NOT NULL,
	"certainty" text DEFAULT 'established' NOT NULL,
	"source_id" uuid,
	"status" "publication_status" DEFAULT 'published' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "governing_body" ADD CONSTRAINT "governing_body_source_id_content_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_timeline_event" ADD CONSTRAINT "sport_timeline_event_source_id_content_source_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."content_source"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "content_source_unique_idx" ON "content_source" USING btree ("provider","url");--> statement-breakpoint
CREATE INDEX "content_source_provider_idx" ON "content_source" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "governing_body_slug_idx" ON "governing_body" USING btree ("sport_id","slug");--> statement-breakpoint
CREATE INDEX "governing_body_parent_idx" ON "governing_body" USING btree ("sport_id","parent_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "sport_timeline_unique_idx" ON "sport_timeline_event" USING btree ("sport_id","year","title");--> statement-breakpoint
CREATE INDEX "sport_timeline_lookup_idx" ON "sport_timeline_event" USING btree ("sport_id","status","year");--> statement-breakpoint
CREATE INDEX "sport_timeline_milestone_idx" ON "sport_timeline_event" USING btree ("sport_id","is_major_milestone");