-- Canonical entities featured in a sport's Overview.
--
-- The Overview names real people, clubs and competitions. Until now those were
-- prose, which meant the icons list and the teams list could not link anywhere
-- and the Overview quietly duplicated names the entity tables already hold.
--
-- `entity_id` is nullable and deliberately so. Coverage of the canonical tables
-- is uneven: basketball currently has Michael Jordan and the Boston Celtics but
-- not Wilt Chamberlain, and the NBA and EuroLeague but not EuroBasket. A card
-- whose entity is missing still renders from `display_name` and gains its link
-- when the entity is ingested. Dropping such cards instead would let an
-- ingestion gap silently edit an editorial list.
--
-- Not a foreign key: the target table varies by `entity_type`, and Postgres has
-- no polymorphic reference. The seed resolves by slug and records what it
-- looked for, so `entity_id IS NULL` is a work queue rather than a dead end.
CREATE TABLE IF NOT EXISTS "overview_entity_ref" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "sport_id" uuid NOT NULL,
  "section" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" uuid,
  "entity_slug" text,
  "display_name" text NOT NULL,
  "blurb" text,
  "meta" text,
  "display_order" integer DEFAULT 100 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "overview_entity_ref_unique_idx"
  ON "overview_entity_ref" ("sport_id", "section", "display_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "overview_entity_ref_lookup_idx"
  ON "overview_entity_ref" ("sport_id", "section", "display_order");
