-- Migration: API Key Management System
-- Created: 2025-01-23
-- Description: Database schema for user API key management and security features

-- Enums for API key system
CREATE TYPE "public"."api_key_status" AS ENUM('active', 'inactive', 'revoked', 'expired');
CREATE TYPE "public"."api_key_type" AS ENUM('production', 'development', 'testing');
CREATE TYPE "public"."api_key_scope" AS ENUM('read', 'write', 'admin');

-- User API Keys table
CREATE TABLE "user_api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"key_suffix" text NOT NULL,
	"type" "api_key_type" DEFAULT 'production',
	"scopes" "api_key_scope"[] DEFAULT '{read,write}',
	"status" "api_key_status" DEFAULT 'active',
	"last_used_at" timestamp,
	"expires_at" timestamp,
	"rate_limit_per_minute" integer DEFAULT 1000,
	"rate_limit_per_hour" integer DEFAULT 10000,
	"usage_count" integer DEFAULT 0,
	"usage_today" integer DEFAULT 0,
	"usage_this_month" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" uuid,
	"last_used_ip" text,
	"last_used_user_agent" text,
	"metadata" jsonb
);

-- API Key Usage Logs table
CREATE TABLE "api_key_usage_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid REFERENCES user_api_keys(id) ON DELETE CASCADE,
	"endpoint" text NOT NULL,
	"method" text NOT NULL,
	"status_code" integer NOT NULL,
	"response_time_ms" integer,
	"ip_address" text,
	"user_agent" text,
	"request_size_bytes" integer,
	"response_size_bytes" integer,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);

-- Security Settings table
CREATE TABLE "user_security_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"two_factor_enabled" boolean DEFAULT false,
	"login_notifications" boolean DEFAULT true,
	"suspicious_activity_alerts" boolean DEFAULT true,
	"api_key_notifications" boolean DEFAULT true,
	"session_timeout_minutes" integer DEFAULT 480,
	"max_concurrent_sessions" integer DEFAULT 5,
	"require_password_change_days" integer DEFAULT 90,
	"allowed_ips" text[],
	"blocked_ips" text[],
	"trusted_devices" jsonb,
	"security_questions" jsonb,
	"backup_codes" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX "user_api_keys_user_id_idx" ON "user_api_keys" USING btree ("user_id");
CREATE INDEX "user_api_keys_status_idx" ON "user_api_keys" USING btree ("status");
CREATE INDEX "user_api_keys_key_hash_idx" ON "user_api_keys" USING btree ("key_hash");
CREATE INDEX "api_key_usage_logs_api_key_id_idx" ON "api_key_usage_logs" USING btree ("api_key_id");
CREATE INDEX "api_key_usage_logs_created_at_idx" ON "api_key_usage_logs" USING btree ("created_at");
CREATE INDEX "user_security_settings_user_id_idx" ON "user_security_settings" USING btree ("user_id");

-- Row Level Security (RLS) policies
ALTER TABLE "user_api_keys" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "api_key_usage_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_security_settings" ENABLE ROW LEVEL SECURITY;

-- Policies for user_api_keys
CREATE POLICY "Users can view their own API keys" ON "user_api_keys"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own API keys" ON "user_api_keys"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON "user_api_keys"
	FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON "user_api_keys"
	FOR DELETE USING (auth.uid() = user_id);

-- Policies for api_key_usage_logs
CREATE POLICY "Users can view their API key usage logs" ON "api_key_usage_logs"
	FOR SELECT USING (
		EXISTS (
			SELECT 1 FROM user_api_keys
			WHERE user_api_keys.id = api_key_usage_logs.api_key_id
			AND user_api_keys.user_id = auth.uid()
		)
	);

-- Policies for user_security_settings
CREATE POLICY "Users can view their own security settings" ON "user_security_settings"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own security settings" ON "user_security_settings"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings" ON "user_security_settings"
	FOR UPDATE USING (auth.uid() = user_id);
