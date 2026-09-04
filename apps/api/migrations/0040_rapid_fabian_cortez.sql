CREATE TYPE "public"."contact_category" AS ENUM('general', 'correction', 'content_feedback', 'quiz_issue', 'partnerships', 'press', 'feature_request', 'technical_issue', 'other');--> statement-breakpoint
CREATE TYPE "public"."contact_status" AS ENUM('received', 'under_review', 'accepted', 'rejected', 'resolved');--> statement-breakpoint
CREATE TABLE "contact_submission" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference_code" text NOT NULL,
	"user_id" text,
	"category" "contact_category" NOT NULL,
	"status" "contact_status" DEFAULT 'received' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"page_url" text,
	"source_url" text,
	"attachment_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "contact_submission_reference_code_idx" ON "contact_submission" USING btree ("reference_code");--> statement-breakpoint
CREATE INDEX "contact_submission_status_created_idx" ON "contact_submission" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "contact_submission_category_idx" ON "contact_submission" USING btree ("category");