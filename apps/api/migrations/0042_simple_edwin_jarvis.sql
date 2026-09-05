CREATE TYPE "public"."question_category" AS ENUM('RULES', 'HISTORY', 'WORLD_CUP', 'EUROS', 'CHAMPIONS_LEAGUE', 'PREMIER_LEAGUE', 'LA_LIGA', 'INTERNATIONAL', 'CLUBS', 'PLAYERS', 'RECORDS', 'TACTICS', 'TEST_CRICKET', 'ODI', 'T20', 'IPL', 'TEAMS', 'NBA', 'CHAMPIONSHIPS', 'GRAND_SLAMS', 'ATP', 'WTA', 'SURFACES', 'DRIVERS', 'CIRCUITS');--> statement-breakpoint
CREATE TYPE "public"."question_difficulty" AS ENUM('EASY', 'MEDIUM', 'HARD', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."question_generation_method" AS ENUM('MANUAL', 'TEMPLATE', 'AI', 'HYBRID');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('DRAFT', 'REVIEW_REQUIRED', 'VERIFIED', 'PUBLISHED', 'RETIRED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'IMAGE', 'ORDERING');--> statement-breakpoint
CREATE TYPE "public"."question_verification_status" AS ENUM('unverified', 'verified', 'disputed');--> statement-breakpoint
CREATE TABLE "question" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_code" text NOT NULL,
	"sport_id" uuid NOT NULL,
	"category" "question_category" NOT NULL,
	"difficulty" "question_difficulty" NOT NULL,
	"question_type" "question_type" DEFAULT 'SINGLE_CHOICE' NOT NULL,
	"status" "question_status" DEFAULT 'DRAFT' NOT NULL,
	"question_text" text NOT NULL,
	"normalized_question_text" text NOT NULL,
	"question_fingerprint" text NOT NULL,
	"fact_key" text,
	"question_variant" text,
	"explanation" text,
	"source_name" text,
	"source_url" text,
	"source_entity_type" text,
	"source_entity_id" uuid,
	"valid_from" timestamp with time zone,
	"valid_until" timestamp with time zone,
	"verification_status" "question_verification_status" DEFAULT 'unverified' NOT NULL,
	"last_verified_at" timestamp with time zone,
	"generation_method" "question_generation_method" DEFAULT 'MANUAL' NOT NULL,
	"generation_job_id" uuid,
	"generator_version" text,
	"generation_model" text,
	"created_by" uuid,
	"reviewed_by" uuid,
	"published_at" timestamp with time zone,
	"retired_at" timestamp with time zone,
	"flagged_for_review" boolean DEFAULT false NOT NULL,
	"times_served" integer DEFAULT 0 NOT NULL,
	"times_answered" integer DEFAULT 0 NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"report_count" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_option" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_code" text NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false NOT NULL,
	"display_order" integer NOT NULL,
	"explanation" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_option" ADD CONSTRAINT "question_option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_code_idx" ON "question" USING btree ("question_code");--> statement-breakpoint
CREATE UNIQUE INDEX "question_fingerprint_idx" ON "question" USING btree ("question_fingerprint");--> statement-breakpoint
CREATE INDEX "question_sport_idx" ON "question" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "question_status_idx" ON "question" USING btree ("status");--> statement-breakpoint
CREATE INDEX "question_category_idx" ON "question" USING btree ("category");--> statement-breakpoint
CREATE INDEX "question_difficulty_idx" ON "question" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "question_fact_key_idx" ON "question" USING btree ("fact_key");--> statement-breakpoint
CREATE INDEX "question_generation_lookup_idx" ON "question" USING btree ("sport_id","status","category");--> statement-breakpoint
CREATE UNIQUE INDEX "question_option_question_code_idx" ON "question_option" USING btree ("question_id","option_code");--> statement-breakpoint
CREATE INDEX "question_option_question_idx" ON "question_option" USING btree ("question_id");--> statement-breakpoint
CREATE UNIQUE INDEX "question_option_single_correct_idx" ON "question_option" USING btree ("question_id") WHERE "question_option"."is_correct" = true;