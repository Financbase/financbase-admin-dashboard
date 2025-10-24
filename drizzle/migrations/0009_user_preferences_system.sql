-- Migration: User Preferences System
-- Created: 2025-01-23
-- Description: Database schema for user preferences, notification settings, and privacy controls

-- Enums for user preferences system
CREATE TYPE "public"."theme" AS ENUM('light', 'dark', 'system');
CREATE TYPE "public"."language" AS ENUM('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh');
CREATE TYPE "public"."timezone" AS ENUM('UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney', 'Pacific/Auckland');
CREATE TYPE "public"."date_format" AS ENUM('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD MMM YYYY');
CREATE TYPE "public"."time_format" AS ENUM('12h', '24h');
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL');
CREATE TYPE "public"."number_format" AS ENUM('1,234.56', '1.234,56', '1 234.56', '1''234.56');

-- User Preferences table
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,

	-- Appearance preferences
	"theme" "theme" DEFAULT 'system',
	"sidebar_collapsed" boolean DEFAULT false,
	"compact_mode" boolean DEFAULT false,
	"high_contrast" boolean DEFAULT false,
	"font_size" text DEFAULT 'medium' CHECK ("font_size" IN ('small', 'medium', 'large')),

	-- Language and region preferences
	"language" "language" DEFAULT 'en',
	"timezone" "timezone" DEFAULT 'UTC',
	"date_format" "date_format" DEFAULT 'MM/DD/YYYY',
	"time_format" "time_format" DEFAULT '12h',
	"currency" "currency" DEFAULT 'USD',
	"number_format" "number_format" DEFAULT '1,234.56',

	-- Dashboard preferences
	"default_dashboard" text DEFAULT 'overview',
	"charts_enabled" boolean DEFAULT true,
	"analytics_enabled" boolean DEFAULT true,
	"auto_refresh" boolean DEFAULT true,
	"refresh_interval" text DEFAULT '5m' CHECK ("refresh_interval" IN ('30s', '1m', '5m', '15m', '30m')),

	-- Notification preferences
	"email_notifications" boolean DEFAULT true,
	"push_notifications" boolean DEFAULT true,
	"desktop_notifications" boolean DEFAULT false,
	"notification_sounds" boolean DEFAULT true,
	"weekly_digest" boolean DEFAULT true,
	"monthly_report" boolean DEFAULT true,

	-- Privacy preferences
	"analytics_tracking" boolean DEFAULT true,
	"error_reporting" boolean DEFAULT true,
	"usage_stats" boolean DEFAULT false,
	"marketing_emails" boolean DEFAULT false,
	"data_export" boolean DEFAULT true,

	-- Advanced preferences
	"beta_features" boolean DEFAULT false,
	"experimental_features" boolean DEFAULT false,
	"developer_mode" boolean DEFAULT false,
	"api_access" boolean DEFAULT false,

	-- Custom preferences (JSON for flexible extension)
	"custom_preferences" jsonb DEFAULT '{}',

	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),

	-- Ensure one preference record per user
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE ("user_id")
);

-- Notification Preferences table (for detailed notification settings)
CREATE TABLE "notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,

	-- Email notification preferences
	"email_invoices" boolean DEFAULT true,
	"email_payments" boolean DEFAULT true,
	"email_reports" boolean DEFAULT true,
	"email_security" boolean DEFAULT true,
	"email_updates" boolean DEFAULT true,
	"email_marketing" boolean DEFAULT false,

	-- Push notification preferences
	"push_invoices" boolean DEFAULT false,
	"push_payments" boolean DEFAULT true,
	"push_reports" boolean DEFAULT false,
	"push_security" boolean DEFAULT true,
	"push_updates" boolean DEFAULT false,

	-- In-app notification preferences
	"in_app_invoices" boolean DEFAULT true,
	"in_app_payments" boolean DEFAULT true,
	"in_app_reports" boolean DEFAULT true,
	"in_app_security" boolean DEFAULT true,
	"in_app_updates" boolean DEFAULT true,
	"in_app_comments" boolean DEFAULT true,
	"in_app_mentions" boolean DEFAULT true,

	-- Quiet hours
	"quiet_hours_enabled" boolean DEFAULT false,
	"quiet_hours_start" text, -- "22:00"
	"quiet_hours_end" text, -- "08:00"
	"quiet_hours_timezone" "timezone" DEFAULT 'UTC',

	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),

	-- Ensure one notification preference record per user
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE ("user_id")
);

-- Privacy Settings table (for detailed privacy controls)
CREATE TABLE "privacy_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,

	-- Data collection preferences
	"analytics_tracking" boolean DEFAULT true,
	"error_reporting" boolean DEFAULT true,
	"performance_monitoring" boolean DEFAULT true,
	"usage_statistics" boolean DEFAULT false,
	"crash_reports" boolean DEFAULT true,

	-- Data sharing preferences
	"share_with_partners" boolean DEFAULT false,
	"share_for_research" boolean DEFAULT false,
	"share_for_marketing" boolean DEFAULT false,
	"allow_personalization" boolean DEFAULT true,

	-- Data retention preferences
	"data_retention_period" text DEFAULT '5years' CHECK ("data_retention_period" IN ('1year', '2years', '5years', 'forever')),
	"auto_delete_inactive" boolean DEFAULT false,
	"download_data" boolean DEFAULT true,
	"delete_account" boolean DEFAULT false,

	-- Third-party integrations
	"allow_third_party_integrations" boolean DEFAULT true,
	"require_consent_for_new_integrations" boolean DEFAULT true,

	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),

	-- Ensure one privacy setting record per user
	CONSTRAINT "privacy_settings_user_id_unique" UNIQUE ("user_id")
);

-- Indexes for performance
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences" USING btree ("user_id");
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences" USING btree ("user_id");
CREATE INDEX "privacy_settings_user_id_idx" ON "privacy_settings" USING btree ("user_id");

-- Row Level Security (RLS) policies
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notification_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "privacy_settings" ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON "user_preferences"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON "user_preferences"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON "user_preferences"
	FOR UPDATE USING (auth.uid() = user_id);

-- Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences" ON "notification_preferences"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notification preferences" ON "notification_preferences"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" ON "notification_preferences"
	FOR UPDATE USING (auth.uid() = user_id);

-- Policies for privacy_settings
CREATE POLICY "Users can view their own privacy settings" ON "privacy_settings"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own privacy settings" ON "privacy_settings"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings" ON "privacy_settings"
	FOR UPDATE USING (auth.uid() = user_id);
