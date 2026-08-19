-- Extensions required by this schema.
--
-- pgcrypto  provides gen_random_uuid(), the default for every primary key.
--           Built in from Postgres 13, but creating it explicitly means the
--           migration does not silently depend on the server version.
-- pg_trgm   powers trigram search. It does double duty: fuzzy entity search on
--           the website, and the probabilistic name matching that entity
--           resolution relies on when reconciling providers.
-- unaccent  folds diacritics, so a search for "Mbappe" finds the accented
--           spelling. Non-negotiable for a sports site, where most searches are
--           for names the user cannot spell exactly.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "pg_trgm";--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "unaccent";--> statement-breakpoint
CREATE TYPE "public"."competition_format" AS ENUM('league', 'knockout', 'group_knockout', 'series', 'championship', 'tour');--> statement-breakpoint
CREATE TYPE "public"."competition_kind" AS ENUM('international', 'domestic', 'continental', 'friendly');--> statement-breakpoint
CREATE TYPE "public"."confidence" AS ENUM('provisional', 'verified', 'curated');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('scheduled', 'live', 'final', 'postponed', 'cancelled', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."participant_role" AS ENUM('player', 'coach', 'manager', 'assistant_coach', 'captain', 'official', 'driver', 'staff');--> statement-breakpoint
CREATE TYPE "public"."publication_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."team_kind" AS ENUM('international', 'club', 'franchise', 'invitational');--> statement-breakpoint
CREATE TYPE "public"."stat_aggregation" AS ENUM('sum', 'average', 'max', 'min', 'last', 'none', 'derived');--> statement-breakpoint
CREATE TYPE "public"."stat_format" AS ENUM('integer', 'decimal', 'percentage', 'duration', 'ratio', 'text');--> statement-breakpoint
CREATE TYPE "public"."mapped_entity" AS ENUM('sport', 'person', 'team', 'competition', 'season', 'venue', 'event');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('wikidata', 'api_sports', 'thesportsdb', 'cricapi', 'jolpica_f1', 'football_data', 'manual');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('overview', 'explainer', 'story', 'article', 'fact');--> statement-breakpoint
CREATE TABLE "discipline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"kind" text DEFAULT 'format' NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sport" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_code" text NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"is_launched" boolean DEFAULT false NOT NULL,
	"traits" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sport_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"tab" text NOT NULL,
	"label" text NOT NULL,
	"slug" text NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"kind" "competition_kind" NOT NULL,
	"format" "competition_format" NOT NULL,
	"section_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"country" text,
	"founded_year" integer,
	"about" text,
	"logo_url" text,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tier" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"locked_fields" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_sport_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"full_name" text NOT NULL,
	"display_name" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"date_of_birth" date,
	"date_of_death" date,
	"nationality" text,
	"biography" text,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"image_url" text,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"locked_fields" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "season" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"label" text NOT NULL,
	"start_year" integer NOT NULL,
	"start_date" date,
	"end_date" date,
	"is_current" boolean DEFAULT false NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"kind" "team_kind" NOT NULL,
	"section_id" uuid,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"country" text,
	"founded_year" integer,
	"about" text,
	"logo_url" text,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"locked_fields" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"city" text,
	"country" text,
	"capacity" integer,
	"opened_year" integer,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"season_id" uuid,
	"venue_id" uuid,
	"round" text,
	"name" text,
	"starts_at" timestamp with time zone NOT NULL,
	"status" "event_status" DEFAULT 'scheduled' NOT NULL,
	"result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"finalised_at" timestamp with time zone,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"side" text,
	"score" integer,
	"outcome" text,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "participation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"person_id" uuid NOT NULL,
	"team_id" uuid,
	"role" "participant_role" DEFAULT 'player' NOT NULL,
	"is_starter" boolean,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"team_id" uuid NOT NULL,
	"role" "participant_role" NOT NULL,
	"start_date" date,
	"end_date" date,
	"shirt_number" integer,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"confidence" "confidence" DEFAULT 'provisional' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competition_statistic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"season_id" uuid,
	"discipline_id" uuid,
	"scope" text NOT NULL,
	"stat_key" text NOT NULL,
	"value" numeric(14, 3),
	"record_person_id" uuid,
	"record_team_id" uuid,
	"achieved_on" timestamp with time zone,
	"note" text,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "honour" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"person_id" uuid,
	"team_id" uuid,
	"competition_id" uuid,
	"season_id" uuid,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"year" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "person_statistic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"competition_id" uuid,
	"season_id" uuid,
	"team_id" uuid,
	"discipline_id" uuid,
	"scope" text NOT NULL,
	"appearances" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"primary_value" numeric(12, 3),
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "statistic_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"discipline_id" uuid,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"short_label" text,
	"applies_to" text DEFAULT 'player' NOT NULL,
	"category" text,
	"aggregation" "stat_aggregation" DEFAULT 'sum' NOT NULL,
	"format" "stat_format" DEFAULT 'integer' NOT NULL,
	"precision" integer DEFAULT 0 NOT NULL,
	"higher_is_better" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"is_headline" boolean DEFAULT false NOT NULL,
	"description" text,
	"formula" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_statistic" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"competition_id" uuid,
	"season_id" uuid,
	"discipline_id" uuid,
	"scope" text NOT NULL,
	"played" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"points" numeric(12, 3),
	"position" integer,
	"stats" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "entity_merge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "mapped_entity" NOT NULL,
	"source_entity_id" uuid NOT NULL,
	"target_entity_id" uuid NOT NULL,
	"reason" text,
	"merged_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "external_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"entity_type" "mapped_entity" NOT NULL,
	"external_id" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"match_method" text DEFAULT 'deterministic' NOT NULL,
	"match_confidence" numeric(4, 3),
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ingestion_run" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"job" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"status" text DEFAULT 'running' NOT NULL,
	"records_read" integer DEFAULT 0 NOT NULL,
	"records_written" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"requests_used" integer DEFAULT 0 NOT NULL,
	"cursor" jsonb,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "raw_payload" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"endpoint" text NOT NULL,
	"request_hash" text NOT NULL,
	"payload" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resolution_candidate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" "provider" NOT NULL,
	"entity_type" "mapped_entity" NOT NULL,
	"external_id" text NOT NULL,
	"external_name" text NOT NULL,
	"candidate_entity_id" uuid,
	"score" numeric(4, 3),
	"evidence" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid,
	"type" "content_type" NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text,
	"body" text,
	"category" text,
	"hero_image_url" text,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"display_order" integer DEFAULT 100 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_entity" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"relevance" text DEFAULT 'mentioned' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"status" "publication_status" DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"prompt" text NOT NULL,
	"options" jsonb NOT NULL,
	"correct_option_id" text NOT NULL,
	"explanation" text,
	"entity_type" text,
	"entity_id" uuid,
	"display_order" integer DEFAULT 100 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "discipline" ADD CONSTRAINT "discipline_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sport_section" ADD CONSTRAINT "sport_section_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition" ADD CONSTRAINT "competition_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition" ADD CONSTRAINT "competition_section_id_sport_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sport_section"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person" ADD CONSTRAINT "person_primary_sport_id_sport_id_fk" FOREIGN KEY ("primary_sport_id") REFERENCES "public"."sport"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "season" ADD CONSTRAINT "season_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_section_id_sport_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sport_section"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_team" ADD CONSTRAINT "event_team_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_team" ADD CONSTRAINT "event_team_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "participation" ADD CONSTRAINT "participation_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_team" ADD CONSTRAINT "person_team_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_team" ADD CONSTRAINT "person_team_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_record_person_id_person_id_fk" FOREIGN KEY ("record_person_id") REFERENCES "public"."person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_statistic" ADD CONSTRAINT "competition_statistic_record_team_id_team_id_fk" FOREIGN KEY ("record_team_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honour" ADD CONSTRAINT "honour_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honour" ADD CONSTRAINT "honour_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honour" ADD CONSTRAINT "honour_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honour" ADD CONSTRAINT "honour_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "honour" ADD CONSTRAINT "honour_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_person_id_person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_statistic" ADD CONSTRAINT "person_statistic_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistic_definition" ADD CONSTRAINT "statistic_definition_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "statistic_definition" ADD CONSTRAINT "statistic_definition_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_statistic" ADD CONSTRAINT "team_statistic_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_statistic" ADD CONSTRAINT "team_statistic_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_statistic" ADD CONSTRAINT "team_statistic_competition_id_competition_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_statistic" ADD CONSTRAINT "team_statistic_season_id_season_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."season"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_statistic" ADD CONSTRAINT "team_statistic_discipline_id_discipline_id_fk" FOREIGN KEY ("discipline_id") REFERENCES "public"."discipline"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content" ADD CONSTRAINT "content_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_entity" ADD CONSTRAINT "content_entity_content_id_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz" ADD CONSTRAINT "quiz_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_question" ADD CONSTRAINT "quiz_question_quiz_id_quiz_id_fk" FOREIGN KEY ("quiz_id") REFERENCES "public"."quiz"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "discipline_unique_idx" ON "discipline" USING btree ("sport_id","key");--> statement-breakpoint
CREATE INDEX "discipline_sport_idx" ON "discipline" USING btree ("sport_id","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "sport_slug_idx" ON "sport" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sport_display_order_idx" ON "sport" USING btree ("display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "sport_section_unique_idx" ON "sport_section" USING btree ("sport_id","tab","slug");--> statement-breakpoint
CREATE INDEX "sport_section_lookup_idx" ON "sport_section" USING btree ("sport_id","tab","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "competition_slug_idx" ON "competition" USING btree ("sport_id","slug");--> statement-breakpoint
CREATE INDEX "competition_sport_kind_idx" ON "competition" USING btree ("sport_id","kind");--> statement-breakpoint
CREATE INDEX "competition_tier_idx" ON "competition" USING btree ("sport_id","tier");--> statement-breakpoint
CREATE UNIQUE INDEX "person_slug_idx" ON "person" USING btree ("primary_sport_id","slug");--> statement-breakpoint
CREATE INDEX "person_name_idx" ON "person" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "person_sport_idx" ON "person" USING btree ("primary_sport_id");--> statement-breakpoint
CREATE UNIQUE INDEX "season_unique_idx" ON "season" USING btree ("competition_id","label");--> statement-breakpoint
CREATE INDEX "season_year_idx" ON "season" USING btree ("competition_id","start_year");--> statement-breakpoint
CREATE INDEX "season_current_idx" ON "season" USING btree ("is_current");--> statement-breakpoint
CREATE UNIQUE INDEX "team_slug_idx" ON "team" USING btree ("sport_id","slug");--> statement-breakpoint
CREATE INDEX "team_sport_kind_idx" ON "team" USING btree ("sport_id","kind");--> statement-breakpoint
CREATE INDEX "team_name_idx" ON "team" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "venue_slug_idx" ON "venue" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "venue_name_idx" ON "venue" USING btree ("name");--> statement-breakpoint
CREATE INDEX "event_season_date_idx" ON "event" USING btree ("season_id","starts_at");--> statement-breakpoint
CREATE INDEX "event_sport_date_idx" ON "event" USING btree ("sport_id","starts_at");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "event" USING btree ("status","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "event_team_unique_idx" ON "event_team" USING btree ("event_id","team_id");--> statement-breakpoint
CREATE INDEX "event_team_team_idx" ON "event_team" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "participation_unique_idx" ON "participation" USING btree ("event_id","person_id","role");--> statement-breakpoint
CREATE INDEX "participation_person_idx" ON "participation" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "participation_team_idx" ON "participation" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "person_team_person_idx" ON "person_team" USING btree ("person_id","start_date");--> statement-breakpoint
CREATE INDEX "person_team_team_idx" ON "person_team" USING btree ("team_id","role");--> statement-breakpoint
CREATE INDEX "person_team_current_idx" ON "person_team" USING btree ("team_id","end_date");--> statement-breakpoint
CREATE UNIQUE INDEX "competition_statistic_unique_idx" ON "competition_statistic" USING btree ("competition_id","scope","season_id","discipline_id","stat_key");--> statement-breakpoint
CREATE INDEX "competition_statistic_lookup_idx" ON "competition_statistic" USING btree ("competition_id","scope","discipline_id");--> statement-breakpoint
CREATE INDEX "competition_statistic_holder_idx" ON "competition_statistic" USING btree ("record_person_id");--> statement-breakpoint
CREATE INDEX "honour_person_idx" ON "honour" USING btree ("person_id","year");--> statement-breakpoint
CREATE INDEX "honour_team_idx" ON "honour" USING btree ("team_id","year");--> statement-breakpoint
CREATE INDEX "honour_competition_idx" ON "honour" USING btree ("competition_id");--> statement-breakpoint
CREATE UNIQUE INDEX "person_statistic_unique_idx" ON "person_statistic" USING btree ("person_id","scope","competition_id","season_id","team_id","discipline_id");--> statement-breakpoint
CREATE INDEX "person_statistic_lookup_idx" ON "person_statistic" USING btree ("person_id","scope","discipline_id");--> statement-breakpoint
CREATE INDEX "person_statistic_leaderboard_idx" ON "person_statistic" USING btree ("sport_id","scope","discipline_id","competition_id","season_id","primary_value");--> statement-breakpoint
CREATE UNIQUE INDEX "statistic_definition_unique_idx" ON "statistic_definition" USING btree ("sport_id","discipline_id","key");--> statement-breakpoint
CREATE UNIQUE INDEX "statistic_definition_sport_wide_idx" ON "statistic_definition" USING btree ("sport_id","key") WHERE "statistic_definition"."discipline_id" IS NULL;--> statement-breakpoint
CREATE INDEX "statistic_definition_sport_idx" ON "statistic_definition" USING btree ("sport_id","category","display_order");--> statement-breakpoint
CREATE UNIQUE INDEX "team_statistic_unique_idx" ON "team_statistic" USING btree ("team_id","scope","competition_id","season_id","discipline_id");--> statement-breakpoint
CREATE INDEX "team_statistic_standings_idx" ON "team_statistic" USING btree ("season_id","position");--> statement-breakpoint
CREATE INDEX "team_statistic_lookup_idx" ON "team_statistic" USING btree ("team_id","scope","discipline_id");--> statement-breakpoint
CREATE UNIQUE INDEX "entity_merge_source_idx" ON "entity_merge" USING btree ("entity_type","source_entity_id");--> statement-breakpoint
CREATE INDEX "entity_merge_target_idx" ON "entity_merge" USING btree ("entity_type","target_entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "external_mapping_unique_idx" ON "external_mapping" USING btree ("provider","entity_type","external_id");--> statement-breakpoint
CREATE INDEX "external_mapping_entity_idx" ON "external_mapping" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "external_mapping_sync_idx" ON "external_mapping" USING btree ("provider","last_synced_at");--> statement-breakpoint
CREATE INDEX "ingestion_run_job_idx" ON "ingestion_run" USING btree ("job","started_at");--> statement-breakpoint
CREATE INDEX "ingestion_run_status_idx" ON "ingestion_run" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "raw_payload_request_idx" ON "raw_payload" USING btree ("provider","request_hash");--> statement-breakpoint
CREATE INDEX "raw_payload_expiry_idx" ON "raw_payload" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "resolution_candidate_unique_idx" ON "resolution_candidate" USING btree ("provider","entity_type","external_id");--> statement-breakpoint
CREATE INDEX "resolution_candidate_status_idx" ON "resolution_candidate" USING btree ("status","score");--> statement-breakpoint
CREATE UNIQUE INDEX "content_slug_idx" ON "content" USING btree ("type","slug");--> statement-breakpoint
CREATE INDEX "content_sport_type_idx" ON "content" USING btree ("sport_id","type","status","display_order");--> statement-breakpoint
CREATE INDEX "content_published_idx" ON "content" USING btree ("status","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "content_entity_unique_idx" ON "content_entity" USING btree ("content_id","entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "content_entity_lookup_idx" ON "content_entity" USING btree ("entity_type","entity_id","relevance");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_slug_idx" ON "quiz" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "quiz_sport_idx" ON "quiz" USING btree ("sport_id","status");--> statement-breakpoint
CREATE INDEX "quiz_question_quiz_idx" ON "quiz_question" USING btree ("quiz_id","display_order");