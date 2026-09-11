CREATE TYPE "public"."newsletter_issue_status" AS ENUM('DRAFT', 'READY', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "newsletter_issue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_number" integer NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subject" text NOT NULL,
	"preview_text" text NOT NULL,
	"hero_title" text,
	"issue_date" timestamp with time zone NOT NULL,
	"status" "newsletter_issue_status" DEFAULT 'DRAFT' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"scheduled_at" timestamp with time zone,
	"send_started_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_issue" ADD CONSTRAINT "newsletter_issue_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_issue" ADD CONSTRAINT "newsletter_issue_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_issue_slug_idx" ON "newsletter_issue" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_issue_number_idx" ON "newsletter_issue" USING btree ("issue_number");--> statement-breakpoint
CREATE INDEX "newsletter_issue_status_idx" ON "newsletter_issue" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_issue_issue_date_idx" ON "newsletter_issue" USING btree ("issue_date");--> statement-breakpoint
CREATE INDEX "newsletter_issue_scheduled_at_idx" ON "newsletter_issue" USING btree ("scheduled_at");