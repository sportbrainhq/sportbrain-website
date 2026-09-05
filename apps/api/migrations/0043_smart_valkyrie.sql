CREATE TYPE "public"."question_candidate_status" AS ENUM('GENERATED', 'VALIDATION_FAILED', 'DUPLICATE', 'REVIEW_REQUIRED', 'APPROVED', 'REJECTED', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."generation_job_status" AS ENUM('QUEUED', 'RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."generation_source_type" AS ENUM('competition', 'team', 'player', 'structured_dataset', 'other');--> statement-breakpoint
CREATE TABLE "question_candidate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_job_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"fact_key" text,
	"source_entity_type" text,
	"source_entity_id" uuid,
	"question_text" text NOT NULL,
	"options" jsonb NOT NULL,
	"explanation" text,
	"suggested_category" "question_category" NOT NULL,
	"suggested_difficulty" "question_difficulty" NOT NULL,
	"source_references" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"generation_method" "question_generation_method" NOT NULL,
	"generator_version" text NOT NULL,
	"generation_model" text,
	"validation_status" text DEFAULT 'PASS' NOT NULL,
	"validation_result" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"duplicate_question_id" uuid,
	"duplicate_confidence" integer,
	"status" "question_candidate_status" DEFAULT 'GENERATED' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"rejection_reason" text,
	"variant_justification" text,
	"published_question_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_generation_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sport_id" uuid NOT NULL,
	"source_type" "generation_source_type" NOT NULL,
	"source_entity_type" text,
	"source_entity_id" uuid,
	"status" "generation_job_status" DEFAULT 'QUEUED' NOT NULL,
	"requested_count" integer NOT NULL,
	"generated_count" integer DEFAULT 0 NOT NULL,
	"accepted_count" integer DEFAULT 0 NOT NULL,
	"rejected_count" integer DEFAULT 0 NOT NULL,
	"duplicate_count" integer DEFAULT 0 NOT NULL,
	"validation_failed_count" integer DEFAULT 0 NOT NULL,
	"generation_method" "question_generation_method" NOT NULL,
	"generation_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"generator_version" text NOT NULL,
	"generation_model" text,
	"created_by" uuid NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_candidate" ADD CONSTRAINT "question_candidate_generation_job_id_question_generation_job_id_fk" FOREIGN KEY ("generation_job_id") REFERENCES "public"."question_generation_job"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_candidate" ADD CONSTRAINT "question_candidate_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_candidate" ADD CONSTRAINT "question_candidate_duplicate_question_id_question_id_fk" FOREIGN KEY ("duplicate_question_id") REFERENCES "public"."question"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_candidate" ADD CONSTRAINT "question_candidate_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_candidate" ADD CONSTRAINT "question_candidate_published_question_id_question_id_fk" FOREIGN KEY ("published_question_id") REFERENCES "public"."question"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_generation_job" ADD CONSTRAINT "question_generation_job_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_generation_job" ADD CONSTRAINT "question_generation_job_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "question_candidate_job_idx" ON "question_candidate" USING btree ("generation_job_id");--> statement-breakpoint
CREATE INDEX "question_candidate_status_idx" ON "question_candidate" USING btree ("status");--> statement-breakpoint
CREATE INDEX "question_candidate_fact_key_idx" ON "question_candidate" USING btree ("fact_key");--> statement-breakpoint
CREATE INDEX "question_generation_job_sport_idx" ON "question_generation_job" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "question_generation_job_status_idx" ON "question_generation_job" USING btree ("status");--> statement-breakpoint
CREATE INDEX "question_generation_job_created_idx" ON "question_generation_job" USING btree ("created_at");