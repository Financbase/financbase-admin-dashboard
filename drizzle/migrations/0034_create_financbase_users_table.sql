-- Migration: Create financbase.users table
-- Created: 2025-01-28
-- Description: Ensures the financbase.users table exists with correct schema to match the application expectations

-- Create financbase schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Create financbase.users table if it doesn't exist
CREATE TABLE IF NOT EXISTS "financbase"."users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL UNIQUE,
	"email" text NOT NULL UNIQUE,
	"first_name" text,
	"last_name" text,
	"role" text NOT NULL DEFAULT 'user' CHECK ("role" IN ('admin', 'user', 'viewer')),
	"is_active" boolean NOT NULL DEFAULT true,
	"organization_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for financbase.users
CREATE INDEX IF NOT EXISTS "users_clerk_id_idx" ON "financbase"."users"("clerk_id");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "financbase"."users"("email");
CREATE INDEX IF NOT EXISTS "users_organization_id_idx" ON "financbase"."users"("organization_id");
CREATE INDEX IF NOT EXISTS "users_is_active_idx" ON "financbase"."users"("is_active");

-- Ensure financbase.financbase_user_feedback table exists (from migration 0011)
-- This is a safety check in case migration 0011 wasn't run
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

-- Create indexes for user feedback if they don't exist
CREATE INDEX IF NOT EXISTS "user_feedback_user_id_idx" ON "financbase"."financbase_user_feedback"("user_id");
CREATE INDEX IF NOT EXISTS "user_feedback_category_idx" ON "financbase"."financbase_user_feedback"("category");
CREATE INDEX IF NOT EXISTS "user_feedback_created_at_idx" ON "financbase"."financbase_user_feedback"("created_at");

-- Add comment to document the table
COMMENT ON TABLE "financbase"."users" IS 'User accounts table - stores user information linked to Clerk authentication';
COMMENT ON TABLE "financbase"."financbase_user_feedback" IS 'User feedback and ratings table - stores user feedback for testimonials and analytics';

