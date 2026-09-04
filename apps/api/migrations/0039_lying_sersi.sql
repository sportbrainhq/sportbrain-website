CREATE TYPE "public"."news_article_entity_type" AS ENUM('sport', 'competition', 'team', 'player', 'country');--> statement-breakpoint
CREATE TYPE "public"."news_article_processing_status" AS ENUM('ingested', 'normalized', 'classified', 'clustered', 'published', 'rejected', 'failed');--> statement-breakpoint
CREATE TYPE "public"."news_fetch_processing_status" AS ENUM('pending', 'processed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."news_source_health_status" AS ENUM('healthy', 'degraded', 'failing', 'disabled');--> statement-breakpoint
CREATE TYPE "public"."news_source_type" AS ENUM('rss', 'atom', 'api');--> statement-breakpoint
CREATE TABLE "news_article_entities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"entity_type" "news_article_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"confidence" numeric(4, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"external_id" text,
	"guid" text,
	"headline" text NOT NULL,
	"summary" text,
	"original_url" text NOT NULL,
	"canonical_url" text NOT NULL,
	"canonical_url_hash" text NOT NULL,
	"image_url" text,
	"language" text DEFAULT 'en' NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"importance_score" numeric(6, 3) DEFAULT '0' NOT NULL,
	"processing_status" "news_article_processing_status" DEFAULT 'ingested' NOT NULL,
	"raw_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sport_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_feed_fetches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"http_status" integer,
	"etag" text,
	"last_modified" text,
	"content_hash" text,
	"raw_body" text,
	"raw_storage_ref" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processing_status" "news_fetch_processing_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"type" "news_source_type" DEFAULT 'rss' NOT NULL,
	"feed_url" text NOT NULL,
	"website_url" text,
	"default_sport_id" uuid,
	"priority" integer DEFAULT 100 NOT NULL,
	"trust_score" numeric(4, 3) DEFAULT '0.500' NOT NULL,
	"fetch_interval_seconds" integer DEFAULT 900 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_headline_allowed" boolean DEFAULT true NOT NULL,
	"display_summary_allowed" boolean DEFAULT false NOT NULL,
	"display_image_allowed" boolean DEFAULT false NOT NULL,
	"commercial_usage_status" text,
	"terms_url" text,
	"last_fetch_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"consecutive_failures" integer DEFAULT 0 NOT NULL,
	"health_status" "news_source_health_status" DEFAULT 'healthy' NOT NULL,
	"etag" text,
	"last_modified" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_story_cluster_articles" (
	"cluster_id" uuid NOT NULL,
	"article_id" uuid NOT NULL,
	"similarity_score" numeric(4, 3),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_story_cluster_articles_cluster_id_article_id_pk" PRIMARY KEY("cluster_id","article_id")
);
--> statement-breakpoint
CREATE TABLE "news_story_clusters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"canonical_headline" text NOT NULL,
	"primary_article_id" uuid,
	"importance_score" numeric(6, 3) DEFAULT '0' NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "news_article_entities" ADD CONSTRAINT "news_article_entities_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_sport_id_sport_id_fk" FOREIGN KEY ("sport_id") REFERENCES "public"."sport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_feed_fetches" ADD CONSTRAINT "news_feed_fetches_source_id_news_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."news_sources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_sources" ADD CONSTRAINT "news_sources_default_sport_id_sport_id_fk" FOREIGN KEY ("default_sport_id") REFERENCES "public"."sport"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_story_cluster_articles" ADD CONSTRAINT "news_story_cluster_articles_cluster_id_news_story_clusters_id_fk" FOREIGN KEY ("cluster_id") REFERENCES "public"."news_story_clusters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_story_cluster_articles" ADD CONSTRAINT "news_story_cluster_articles_article_id_news_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_story_clusters" ADD CONSTRAINT "news_story_clusters_primary_article_id_news_articles_id_fk" FOREIGN KEY ("primary_article_id") REFERENCES "public"."news_articles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "news_article_entities_article_idx" ON "news_article_entities" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "news_article_entities_entity_idx" ON "news_article_entities" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_article_entities_unique_idx" ON "news_article_entities" USING btree ("article_id","entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "news_articles_source_canonical_idx" ON "news_articles" USING btree ("source_id","canonical_url_hash");--> statement-breakpoint
CREATE INDEX "news_articles_canonical_hash_idx" ON "news_articles" USING btree ("canonical_url_hash");--> statement-breakpoint
CREATE INDEX "news_articles_published_at_idx" ON "news_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_articles_source_idx" ON "news_articles" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "news_articles_processing_status_idx" ON "news_articles" USING btree ("processing_status");--> statement-breakpoint
CREATE INDEX "news_articles_sport_idx" ON "news_articles" USING btree ("sport_id");--> statement-breakpoint
CREATE INDEX "news_feed_fetches_source_idx" ON "news_feed_fetches" USING btree ("source_id","fetched_at");--> statement-breakpoint
CREATE INDEX "news_feed_fetches_status_idx" ON "news_feed_fetches" USING btree ("processing_status");--> statement-breakpoint
CREATE UNIQUE INDEX "news_sources_slug_idx" ON "news_sources" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "news_sources_default_sport_idx" ON "news_sources" USING btree ("default_sport_id");--> statement-breakpoint
CREATE INDEX "news_sources_active_idx" ON "news_sources" USING btree ("is_active","health_status");--> statement-breakpoint
CREATE INDEX "news_story_cluster_articles_article_idx" ON "news_story_cluster_articles" USING btree ("article_id");--> statement-breakpoint
CREATE INDEX "news_story_clusters_primary_article_idx" ON "news_story_clusters" USING btree ("primary_article_id");--> statement-breakpoint
CREATE INDEX "news_story_clusters_last_updated_idx" ON "news_story_clusters" USING btree ("last_updated_at");