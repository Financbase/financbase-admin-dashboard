-- Migration: Marketing Analytics and Contact Submissions
-- Created: 2025-01-24
-- Description: Database schema for marketing analytics, contact form submissions, and related tracking tables

-- Create financbase schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Enums for Contact Submissions
DO $$ BEGIN
    CREATE TYPE "financbase"."contact_status" AS ENUM('new', 'in_progress', 'resolved', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "financbase"."contact_priority" AS ENUM('low', 'medium', 'high', 'urgent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Enums for Analytics Cache
DO $$ BEGIN
    CREATE TYPE "financbase"."analytics_cache_type" AS ENUM('overview', 'campaign_performance', 'platform_breakdown', 'daily_metrics', 'conversion_funnel', 'audience_insights');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Contact Submissions Table - Public contact form submissions
CREATE TABLE IF NOT EXISTS "financbase"."financbase_contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	
	-- Contact information
	"name" text NOT NULL,
	"email" text NOT NULL,
	"company" text,
	"message" text NOT NULL,
	
	-- Submission metadata
	"status" "financbase"."contact_status" DEFAULT 'new' NOT NULL,
	"priority" "financbase"."contact_priority" DEFAULT 'medium' NOT NULL,
	
	-- Tracking information
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"source" text,
	
	-- Response tracking
	"responded_at" timestamp,
	"response_notes" text,
	
	-- Additional metadata
	"metadata" text,
	
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for contact submissions
CREATE INDEX IF NOT EXISTS "contact_submissions_email_idx" ON "financbase"."financbase_contact_submissions"("email");
CREATE INDEX IF NOT EXISTS "contact_submissions_status_idx" ON "financbase"."financbase_contact_submissions"("status");
CREATE INDEX IF NOT EXISTS "contact_submissions_created_at_idx" ON "financbase"."financbase_contact_submissions"("created_at");

-- Marketing Events Table - Track marketing interactions
CREATE TABLE IF NOT EXISTS "financbase"."financbase_marketing_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"session_id" text,
	
	-- Event details
	"event_type" text NOT NULL,
	"component" text,
	"page" text,
	
	-- Event data
	"metadata" text,
	
	-- User context
	"user_agent" text,
	"ip_address" text,
	"referrer" text,
	
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for marketing events
CREATE INDEX IF NOT EXISTS "marketing_events_user_id_idx" ON "financbase"."financbase_marketing_events"("user_id");
CREATE INDEX IF NOT EXISTS "marketing_events_event_type_idx" ON "financbase"."financbase_marketing_events"("event_type");
CREATE INDEX IF NOT EXISTS "marketing_events_created_at_idx" ON "financbase"."financbase_marketing_events"("created_at");

-- Marketing Stats Table - Aggregated marketing statistics
CREATE TABLE IF NOT EXISTS "financbase"."financbase_marketing_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	
	-- Stat details
	"metric_name" text NOT NULL,
	"value" numeric(12, 2) NOT NULL,
	"change" numeric(12, 2),
	"trend" text,
	
	-- Status
	"is_active" boolean DEFAULT true NOT NULL,
	
	-- Timestamps
	"last_updated" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for marketing stats
CREATE INDEX IF NOT EXISTS "marketing_stats_user_id_idx" ON "financbase"."financbase_marketing_stats"("user_id");
CREATE INDEX IF NOT EXISTS "marketing_stats_metric_name_idx" ON "financbase"."financbase_marketing_stats"("metric_name");

-- User Feedback Table - User feedback and ratings
CREATE TABLE IF NOT EXISTS "financbase"."financbase_user_feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	
	-- Feedback details
	"category" text NOT NULL,
	"rating" integer,
	"comment" text,
	"is_positive" boolean,
	
	-- Context
	"component" text,
	"page" text,
	
	-- User context
	"user_agent" text,
	"ip_address" text,
	
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for user feedback
CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "financbase"."financbase_user_feedback"("user_id");
CREATE INDEX IF NOT EXISTS "user_feedback_category_idx" ON "financbase"."financbase_user_feedback"("category");
CREATE INDEX IF NOT EXISTS "user_feedback_created_at_idx" ON "financbase"."financbase_user_feedback"("created_at");

-- Marketing Analytics Cache Table - Cached analytics calculations for performance
CREATE TABLE IF NOT EXISTS "financbase"."marketing_analytics_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	
	-- Cache type identifier
	"cache_type" "financbase"."analytics_cache_type" NOT NULL,
	
	-- Cache key (e.g., "overview:2024-01:all" or "campaign:CAMP-001:2024-01")
	"cache_key" text NOT NULL,
	
	-- Cached data as JSON
	"cached_data" text NOT NULL,
	
	-- Cache expiration
	"expires_at" timestamp NOT NULL,
	
	-- Query parameters that generated this cache
	"query_params" text,
	
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create indexes for marketing analytics cache
CREATE INDEX IF NOT EXISTS "marketing_analytics_cache_user_id_idx" ON "financbase"."marketing_analytics_cache"("user_id");
CREATE INDEX IF NOT EXISTS "marketing_analytics_cache_type_idx" ON "financbase"."marketing_analytics_cache"("cache_type");
CREATE INDEX IF NOT EXISTS "marketing_analytics_cache_key_idx" ON "financbase"."marketing_analytics_cache"("cache_key");
CREATE INDEX IF NOT EXISTS "marketing_analytics_cache_expires_at_idx" ON "financbase"."marketing_analytics_cache"("expires_at");
CREATE INDEX IF NOT EXISTS "marketing_analytics_cache_user_cache_key_idx" ON "financbase"."marketing_analytics_cache"("user_id", "cache_key");

