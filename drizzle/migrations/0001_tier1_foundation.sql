-- Migration: Tier 1 Foundation (Auth, Settings, Notifications)
-- Created: 2025-10-21
-- Description: Database schema for notification system and user settings

-- Notification Preferences Table
CREATE TABLE IF NOT EXISTS "notification_preferences" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL UNIQUE,
	"email_invoices" BOOLEAN DEFAULT true NOT NULL,
	"email_expenses" BOOLEAN DEFAULT true NOT NULL,
	"email_reports" BOOLEAN DEFAULT true NOT NULL,
	"email_alerts" BOOLEAN DEFAULT true NOT NULL,
	"email_weekly_summary" BOOLEAN DEFAULT true NOT NULL,
	"email_monthly_summary" BOOLEAN DEFAULT true NOT NULL,
	"push_realtime" BOOLEAN DEFAULT false NOT NULL,
	"push_daily" BOOLEAN DEFAULT true NOT NULL,
	"push_weekly" BOOLEAN DEFAULT false NOT NULL,
	"in_app_invoices" BOOLEAN DEFAULT true NOT NULL,
	"in_app_expenses" BOOLEAN DEFAULT true NOT NULL,
	"in_app_alerts" BOOLEAN DEFAULT true NOT NULL,
	"slack_enabled" BOOLEAN DEFAULT false NOT NULL,
	"slack_webhook" TEXT,
	"slack_channels" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- User Preferences Table
CREATE TABLE IF NOT EXISTS "user_preferences" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL UNIQUE,
	"theme" TEXT DEFAULT 'system' NOT NULL,
	"language" TEXT DEFAULT 'en' NOT NULL,
	"timezone" TEXT DEFAULT 'America/New_York' NOT NULL,
	"date_format" TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
	"time_format" TEXT DEFAULT '12h' NOT NULL,
	"currency" TEXT DEFAULT 'USD' NOT NULL,
	"currency_symbol" TEXT DEFAULT '$' NOT NULL,
	"number_format" TEXT DEFAULT 'en-US' NOT NULL,
	"default_dashboard" TEXT DEFAULT 'overview' NOT NULL,
	"dashboard_layout" JSONB,
	"sidebar_collapsed" BOOLEAN DEFAULT false NOT NULL,
	"enabled_features" JSONB,
	"beta_features" BOOLEAN DEFAULT false NOT NULL,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Privacy Settings Table
CREATE TABLE IF NOT EXISTS "privacy_settings" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL UNIQUE,
	"profile_public" BOOLEAN DEFAULT false NOT NULL,
	"show_email" BOOLEAN DEFAULT false NOT NULL,
	"show_phone" BOOLEAN DEFAULT false NOT NULL,
	"analytics_enabled" BOOLEAN DEFAULT true NOT NULL,
	"performance_tracking" BOOLEAN DEFAULT true NOT NULL,
	"error_reporting" BOOLEAN DEFAULT true NOT NULL,
	"marketing_emails" BOOLEAN DEFAULT false NOT NULL,
	"product_updates" BOOLEAN DEFAULT true NOT NULL,
	"third_party_sharing" BOOLEAN DEFAULT false NOT NULL,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Security Settings Table
CREATE TABLE IF NOT EXISTS "security_settings" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL UNIQUE,
	"two_factor_enabled" BOOLEAN DEFAULT false NOT NULL,
	"two_factor_method" TEXT,
	"max_sessions" SERIAL DEFAULT 5 NOT NULL,
	"session_timeout" SERIAL DEFAULT 30 NOT NULL,
	"login_notifications" BOOLEAN DEFAULT true NOT NULL,
	"login_history" JSONB,
	"api_keys_enabled" BOOLEAN DEFAULT false NOT NULL,
	"api_keys" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"category" TEXT,
	"priority" TEXT DEFAULT 'normal' NOT NULL,
	"title" TEXT NOT NULL,
	"message" TEXT NOT NULL,
	"data" JSONB,
	"action_url" TEXT,
	"action_label" TEXT,
	"read" BOOLEAN DEFAULT false NOT NULL,
	"read_at" TIMESTAMP,
	"archived" BOOLEAN DEFAULT false NOT NULL,
	"archived_at" TIMESTAMP,
	"email_sent" BOOLEAN DEFAULT false NOT NULL,
	"email_sent_at" TIMESTAMP,
	"push_sent" BOOLEAN DEFAULT false NOT NULL,
	"push_sent_at" TIMESTAMP,
	"expires_at" TIMESTAMP,
	"metadata" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notification Templates Table
CREATE TABLE IF NOT EXISTS "notification_templates" (
	"id" SERIAL PRIMARY KEY,
	"code" TEXT NOT NULL UNIQUE,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"type" TEXT NOT NULL,
	"category" TEXT NOT NULL,
	"priority" TEXT DEFAULT 'normal' NOT NULL,
	"title_template" TEXT NOT NULL,
	"message_template" TEXT NOT NULL,
	"send_email" BOOLEAN DEFAULT true NOT NULL,
	"send_push" BOOLEAN DEFAULT false NOT NULL,
	"send_in_app" BOOLEAN DEFAULT true NOT NULL,
	"active" BOOLEAN DEFAULT true NOT NULL,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notification Queue Table
CREATE TABLE IF NOT EXISTS "notification_queue" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"notification_id" INTEGER REFERENCES "notifications"("id"),
	"method" TEXT NOT NULL,
	"subject" TEXT,
	"content" TEXT NOT NULL,
	"destination" TEXT NOT NULL,
	"status" TEXT DEFAULT 'pending' NOT NULL,
	"attempts" INTEGER DEFAULT 0 NOT NULL,
	"max_attempts" INTEGER DEFAULT 3 NOT NULL,
	"last_error" TEXT,
	"last_attempt_at" TIMESTAMP,
	"scheduled_for" TIMESTAMP,
	"sent_at" TIMESTAMP,
	"metadata" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Notification Statistics Table
CREATE TABLE IF NOT EXISTS "notification_stats" (
	"id" SERIAL PRIMARY KEY,
	"date" TIMESTAMP NOT NULL,
	"user_id" TEXT,
	"total_sent" INTEGER DEFAULT 0 NOT NULL,
	"total_read" INTEGER DEFAULT 0 NOT NULL,
	"total_clicked" INTEGER DEFAULT 0 NOT NULL,
	"total_archived" INTEGER DEFAULT 0 NOT NULL,
	"by_type" JSONB,
	"by_priority" JSONB,
	"email_success_rate" INTEGER,
	"push_success_rate" INTEGER,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_notifications_user_id" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_notifications_read" ON "notifications"("read");
CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_notification_queue_status" ON "notification_queue"("status");
CREATE INDEX IF NOT EXISTS "idx_notification_queue_scheduled" ON "notification_queue"("scheduled_for");

