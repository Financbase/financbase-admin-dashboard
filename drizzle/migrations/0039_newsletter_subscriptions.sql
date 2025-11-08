-- Migration: Newsletter Subscriptions System
-- Created: 2025-01-25
-- Description: Database schema for newsletter subscriptions with unsubscribe token support

-- Create financbase schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Enums for Newsletter Subscriptions
DO $$ BEGIN
    CREATE TYPE "financbase"."newsletter_status" AS ENUM('subscribed', 'unsubscribed', 'bounced', 'pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS "financbase"."newsletter_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL UNIQUE,
	"status" "financbase"."newsletter_status" DEFAULT 'subscribed' NOT NULL,
	"source" text,
	"subscribed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp with time zone,
	"unsubscribe_token" text UNIQUE,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for newsletter subscriptions
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_email_idx" ON "financbase"."newsletter_subscriptions"("email");
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_status_idx" ON "financbase"."newsletter_subscriptions"("status");
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_unsubscribe_token_idx" ON "financbase"."newsletter_subscriptions"("unsubscribe_token");
CREATE INDEX IF NOT EXISTS "newsletter_subscriptions_created_at_idx" ON "financbase"."newsletter_subscriptions"("created_at");

