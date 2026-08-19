ALTER TABLE "competition" ADD COLUMN "notability" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "person" ADD COLUMN "notability" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "team" ADD COLUMN "notability" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "person_notability_idx" ON "person" USING btree ("primary_sport_id","notability");--> statement-breakpoint
CREATE INDEX "team_notability_idx" ON "team" USING btree ("sport_id","kind","notability");