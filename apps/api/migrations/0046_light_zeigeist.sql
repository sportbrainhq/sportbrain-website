CREATE TYPE "public"."newsletter_subscription_source" AS ENUM('NEWSLETTER_PAGE', 'HOMEPAGE', 'PROFILE', 'ARTICLE', 'QUIZ_RESULT', 'FOOTER', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."newsletter_subscription_status" AS ENUM('PENDING', 'SUBSCRIBED', 'UNSUBSCRIBED', 'BOUNCED', 'COMPLAINED', 'SUPPRESSED');--> statement-breakpoint
CREATE TABLE "newsletter_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"status" "newsletter_subscription_status" DEFAULT 'PENDING' NOT NULL,
	"source" "newsletter_subscription_source" NOT NULL,
	"timezone" text,
	"preferences" jsonb,
	"subscribed_at" timestamp with time zone NOT NULL,
	"confirmed_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_token" text NOT NULL,
	"confirm_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_subscription" ADD CONSTRAINT "newsletter_subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscription_email_idx" ON "newsletter_subscription" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscription_unsubscribe_token_idx" ON "newsletter_subscription" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE UNIQUE INDEX "newsletter_subscription_confirm_token_idx" ON "newsletter_subscription" USING btree ("confirm_token");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_status_idx" ON "newsletter_subscription" USING btree ("status");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_user_id_idx" ON "newsletter_subscription" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "newsletter_subscription_created_at_idx" ON "newsletter_subscription" USING btree ("created_at");