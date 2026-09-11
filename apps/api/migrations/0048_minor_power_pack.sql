CREATE TYPE "public"."newsletter_campaign_status" AS ENUM('CREATED', 'SENDING', 'COMPLETED', 'PARTIAL', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."newsletter_recipient_status" AS ENUM('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED', 'COMPLAINED');--> statement-breakpoint
CREATE TABLE "newsletter_campaign" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"status" "newsletter_campaign_status" DEFAULT 'CREATED' NOT NULL,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"processed_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"delivered_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"bounced_count" integer DEFAULT 0 NOT NULL,
	"complained_count" integer DEFAULT 0 NOT NULL,
	"unsubscribed_count" integer DEFAULT 0 NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_recipient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"status" "newsletter_recipient_status" DEFAULT 'PENDING' NOT NULL,
	"provider_message_id" text,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_issue" ADD COLUMN "schedule_timezone" text DEFAULT 'Asia/Kolkata' NOT NULL;--> statement-breakpoint
ALTER TABLE "newsletter_campaign" ADD CONSTRAINT "newsletter_campaign_issue_id_newsletter_issue_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."newsletter_issue"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_recipient" ADD CONSTRAINT "newsletter_recipient_campaign_id_newsletter_campaign_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."newsletter_campaign"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_recipient" ADD CONSTRAINT "newsletter_recipient_subscription_id_newsletter_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."newsletter_subscription"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "newsletter_recipient" ADD CONSTRAINT "newsletter_recipient_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "newsletter_campaign_issue_id_idx" ON "newsletter_campaign" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "newsletter_campaign_status_idx" ON "newsletter_campaign" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_recipient_campaign_subscription_idx" ON "newsletter_recipient" USING btree ("campaign_id","subscription_id");--> statement-breakpoint
CREATE INDEX "newsletter_recipient_status_idx" ON "newsletter_recipient" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_recipient_provider_message_id_idx" ON "newsletter_recipient" USING btree ("provider_message_id");