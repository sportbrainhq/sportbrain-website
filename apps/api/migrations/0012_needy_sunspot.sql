ALTER TABLE "person" ADD COLUMN "career_status" text;--> statement-breakpoint
ALTER TABLE "honour" ADD COLUMN "prestige" integer;--> statement-breakpoint
CREATE INDEX "honour_prestige_idx" ON "honour" USING btree ("person_id","prestige","year");