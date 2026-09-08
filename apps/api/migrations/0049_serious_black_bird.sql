CREATE TYPE "public"."achievement_category" AS ENUM('QUIZ', 'KNOWLEDGE', 'SPORT', 'BREADTH', 'STREAK', 'MASTERY', 'SPECIAL');--> statement-breakpoint
CREATE TYPE "public"."achievement_tier" AS ENUM('BRONZE', 'SILVER', 'GOLD', 'ELITE');--> statement-breakpoint
CREATE TYPE "public"."knowledge_level" AS ENUM('UNRATED', 'NEWCOMER', 'EXPLORER', 'KNOWLEDGEABLE', 'ADVANCED', 'EXPERT');--> statement-breakpoint
CREATE TYPE "public"."streak_type" AS ENUM('DAILY_QUIZ', 'WEEKLY_SPORTBRAIN');--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'achievement_unlocked';--> statement-breakpoint
CREATE TABLE "achievement_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "achievement_category" NOT NULL,
	"tier" "achievement_tier",
	"icon_key" text NOT NULL,
	"criteria_type" text NOT NULL,
	"criteria_config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sportbrain_score_snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"overall_score" integer NOT NULL,
	"overall_level" "knowledge_level" NOT NULL,
	"sport_scores" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"scoring_version" text NOT NULL,
	"snapshot_date" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievement" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"earned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"trigger_context" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_category_knowledge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"category" "question_category" NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"level" "knowledge_level",
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"accuracy" numeric(5, 2) DEFAULT '0' NOT NULL,
	"scoring_version" text NOT NULL,
	"last_calculated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_quiz_activity_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"quizzes_completed" integer DEFAULT 0 NOT NULL,
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"sports_played" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sportbrain_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"overall_score" integer DEFAULT 0 NOT NULL,
	"overall_level" "knowledge_level" DEFAULT 'UNRATED' NOT NULL,
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"accuracy" numeric(5, 2) DEFAULT '0' NOT NULL,
	"sports_explored" integer DEFAULT 0 NOT NULL,
	"achievement_count" integer DEFAULT 0 NOT NULL,
	"current_weekly_streak" integer DEFAULT 0 NOT NULL,
	"longest_weekly_streak" integer DEFAULT 0 NOT NULL,
	"scoring_version" text NOT NULL,
	"last_calculated_at" timestamp with time zone,
	"public_id" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"show_avatar_publicly" boolean DEFAULT true NOT NULL,
	"show_activity_publicly" boolean DEFAULT true NOT NULL,
	"show_streak_publicly" boolean DEFAULT true NOT NULL,
	"show_achievements_publicly" boolean DEFAULT true NOT NULL,
	"allow_search_indexing" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sport_knowledge" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"sport_id" uuid NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"level" "knowledge_level" DEFAULT 'UNRATED' NOT NULL,
	"questions_answered" integer DEFAULT 0 NOT NULL,
	"correct_answers" integer DEFAULT 0 NOT NULL,
	"accuracy" numeric(5, 2) DEFAULT '0' NOT NULL,
	"categories_explored" integer DEFAULT 0 NOT NULL,
	"hard_expert_questions" integer DEFAULT 0 NOT NULL,
	"hard_expert_correct" integer DEFAULT 0 NOT NULL,
	"hard_expert_accuracy" numeric(5, 2) DEFAULT '0' NOT NULL,
	"scoring_version" text NOT NULL,
	"last_calculated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_streak" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"streak_type" "streak_type" NOT NULL,
	"current_count" integer DEFAULT 0 NOT NULL,
	"longest_count" integer DEFAULT 0 NOT NULL,
	"current_period_start" date,
	"last_qualified_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sportbrain_score_snapshot" ADD CONSTRAINT "sportbrain_score_snapshot_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievement" ADD CONSTRAINT "user_achievement_achievement_id_achievement_definition_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievement_definition"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_category_knowledge" ADD CONSTRAINT "user_category_knowledge_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_category_knowledge" ADD CONSTRAINT "user_category_knowledge_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_quiz_activity_daily" ADD CONSTRAINT "user_quiz_activity_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sportbrain_profile" ADD CONSTRAINT "user_sportbrain_profile_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sport_knowledge" ADD CONSTRAINT "user_sport_knowledge_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sport_knowledge" ADD CONSTRAINT "user_sport_knowledge_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "achievement_definition_code_idx" ON "achievement_definition" USING btree ("code");--> statement-breakpoint
CREATE INDEX "achievement_definition_active_idx" ON "achievement_definition" USING btree ("is_active","category");--> statement-breakpoint
CREATE UNIQUE INDEX "sportbrain_score_snapshot_unique_idx" ON "sportbrain_score_snapshot" USING btree ("user_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "sportbrain_score_snapshot_version_idx" ON "sportbrain_score_snapshot" USING btree ("user_id","scoring_version");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievement_unique_idx" ON "user_achievement" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "user_achievement_user_earned_idx" ON "user_achievement" USING btree ("user_id","earned_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_category_knowledge_unique_idx" ON "user_category_knowledge" USING btree ("user_id","sport_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "user_quiz_activity_daily_unique_idx" ON "user_quiz_activity_daily" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "user_quiz_activity_daily_user_idx" ON "user_quiz_activity_daily" USING btree ("user_id","date");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sportbrain_profile_user_idx" ON "user_sportbrain_profile" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sportbrain_profile_public_id_idx" ON "user_sportbrain_profile" USING btree ("public_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sport_knowledge_unique_idx" ON "user_sport_knowledge" USING btree ("user_id","sport_id");--> statement-breakpoint
CREATE INDEX "user_sport_knowledge_user_idx" ON "user_sport_knowledge" USING btree ("user_id","score");--> statement-breakpoint
CREATE UNIQUE INDEX "user_streak_unique_idx" ON "user_streak" USING btree ("user_id","streak_type");