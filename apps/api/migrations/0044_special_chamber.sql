CREATE TYPE "public"."quiz_attempt_status" AS ENUM('IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."quiz_mode" AS ENUM('QUICK', 'STANDARD', 'CHALLENGE', 'MARATHON');--> statement-breakpoint
CREATE TYPE "public"."quiz_type" AS ENUM('SPORT', 'MASTER');--> statement-breakpoint
CREATE TABLE "question_exposure" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"times_seen" integer DEFAULT 0 NOT NULL,
	"times_correct" integer DEFAULT 0 NOT NULL,
	"times_incorrect" integer DEFAULT 0 NOT NULL,
	"last_answered_correctly" boolean,
	"last_answered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt_question_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"question_text_snapshot" text NOT NULL,
	"options_snapshot" jsonb NOT NULL,
	"correct_option_snapshot" text NOT NULL,
	"explanation_snapshot" text,
	"difficulty_snapshot" "question_difficulty" NOT NULL,
	"category_snapshot" "question_category" NOT NULL,
	"selected_option_code" text,
	"selected_option_text_snapshot" text,
	"is_correct" boolean,
	"answered_at" timestamp with time zone,
	"response_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_attempt_v2" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_code" text NOT NULL,
	"user_id" uuid NOT NULL,
	"anonymous_session_id" text,
	"quiz_type" "quiz_type" NOT NULL,
	"sport_id" uuid,
	"mode" "quiz_mode" NOT NULL,
	"status" "quiz_attempt_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"requested_question_count" integer NOT NULL,
	"actual_question_count" integer NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"score_percentage" numeric(5, 2),
	"started_at" timestamp with time zone NOT NULL,
	"last_activity_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"abandoned_at" timestamp with time zone,
	"duration_seconds" integer,
	"generation_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "question_exposure" ADD CONSTRAINT "question_exposure_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_exposure" ADD CONSTRAINT "question_exposure_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_question_v2" ADD CONSTRAINT "quiz_attempt_question_v2_quiz_attempt_id_quiz_attempt_v2_id_fk" FOREIGN KEY ("quiz_attempt_id") REFERENCES "public"."quiz_attempt_v2"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_question_v2" ADD CONSTRAINT "quiz_attempt_question_v2_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_v2" ADD CONSTRAINT "quiz_attempt_v2_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempt_v2" ADD CONSTRAINT "quiz_attempt_v2_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "question_exposure_user_question_idx" ON "question_exposure" USING btree ("user_id","question_id");--> statement-breakpoint
CREATE INDEX "question_exposure_user_last_seen_idx" ON "question_exposure" USING btree ("user_id","last_seen_at");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempt_question_v2_unique_idx" ON "quiz_attempt_question_v2" USING btree ("quiz_attempt_id","question_id");--> statement-breakpoint
CREATE INDEX "quiz_attempt_question_v2_attempt_idx" ON "quiz_attempt_question_v2" USING btree ("quiz_attempt_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempt_v2_public_code_idx" ON "quiz_attempt_v2" USING btree ("public_code");--> statement-breakpoint
CREATE INDEX "quiz_attempt_v2_user_idx" ON "quiz_attempt_v2" USING btree ("user_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempt_v2_one_active_sport_idx" ON "quiz_attempt_v2" USING btree ("user_id","sport_id") WHERE "quiz_attempt_v2"."status" = 'IN_PROGRESS' AND "quiz_attempt_v2"."quiz_type" = 'SPORT';--> statement-breakpoint
CREATE UNIQUE INDEX "quiz_attempt_v2_one_active_master_idx" ON "quiz_attempt_v2" USING btree ("user_id") WHERE "quiz_attempt_v2"."status" = 'IN_PROGRESS' AND "quiz_attempt_v2"."quiz_type" = 'MASTER';--> statement-breakpoint
CREATE INDEX "quiz_attempt_v2_completed_idx" ON "quiz_attempt_v2" USING btree ("user_id","completed_at");