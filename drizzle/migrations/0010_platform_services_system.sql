-- Migration: Platform Services System
-- Created: 2025-01-23
-- Description: Database schema for Platform Services including service registry, instances, metrics, logs, dependencies, events, and health checks

-- Create financbase schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Enums for Platform Services (using IF NOT EXISTS to avoid conflicts)
DO $$ BEGIN
    CREATE TYPE "financbase"."platform_service_status" AS ENUM('active', 'inactive', 'maintenance', 'deprecated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "financbase"."platform_service_type" AS ENUM('workflow', 'webhook', 'integration', 'monitoring', 'alert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "financbase"."platform_service_category" AS ENUM('automation', 'communication', 'data', 'security', 'analytics');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Platform Services Registry Table
CREATE TABLE "financbase"."platform_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text REFERENCES "financbase"."users"("id") ON DELETE cascade,
	"organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
	
	-- Service identification
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"version" text NOT NULL DEFAULT '1.0.0',
	
	-- Service classification
	"type" "financbase"."platform_service_type" NOT NULL,
	"category" "financbase"."platform_service_category" NOT NULL,
	"status" "financbase"."platform_service_status" NOT NULL DEFAULT 'active',
	
	-- Service configuration
	"configuration" jsonb DEFAULT '{}' NOT NULL,
	"capabilities" jsonb DEFAULT '[]' NOT NULL,
	"dependencies" jsonb DEFAULT '[]' NOT NULL,
	
	-- Service metadata
	"icon" text,
	"color" text,
	"tags" jsonb DEFAULT '[]' NOT NULL,
	
	-- Service health
	"is_active" boolean DEFAULT true NOT NULL,
	"health_check_url" text,
	"last_health_check" timestamp,
	"health_status" text DEFAULT 'unknown',
	
	-- Usage statistics
	"usage_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp,
	
	-- Service limits
	"rate_limit" integer,
	"quota_limit" integer,
	
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Instances Table
CREATE TABLE "financbase"."platform_service_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"user_id" text NOT NULL REFERENCES "financbase"."users"("id") ON DELETE cascade,
	"organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
	
	-- Instance details
	"instance_id" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"status" text NOT NULL DEFAULT 'active',
	
	-- Instance configuration
	"configuration" jsonb DEFAULT '{}' NOT NULL,
	"environment" text DEFAULT 'production',
	
	-- Instance health
	"health_status" text DEFAULT 'unknown',
	"last_health_check" timestamp,
	"error_count" integer DEFAULT 0 NOT NULL,
	
	-- Instance metrics
	"request_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"average_response_time" decimal(10,3),
	
	-- Instance lifecycle
	"started_at" timestamp DEFAULT now() NOT NULL,
	"last_activity_at" timestamp,
	"stopped_at" timestamp,
	
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Metrics Table
CREATE TABLE "financbase"."platform_service_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"user_id" text REFERENCES "financbase"."users"("id") ON DELETE cascade,
	"organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
	
	-- Metric identification
	"metric_name" text NOT NULL,
	"metric_type" text NOT NULL,
	"category" text NOT NULL,
	
	-- Metric values
	"value" text NOT NULL,
	"unit" text,
	
	-- Context
	"labels" jsonb DEFAULT '{}' NOT NULL,
	"tags" jsonb DEFAULT '{}' NOT NULL,
	
	-- Timing
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Logs Table
CREATE TABLE "financbase"."platform_service_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"instance_id" integer REFERENCES "financbase"."platform_service_instances"("id") ON DELETE cascade,
	"user_id" text REFERENCES "financbase"."users"("id") ON DELETE cascade,
	"organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
	
	-- Log details
	"level" text NOT NULL,
	"message" text NOT NULL,
	"details" jsonb DEFAULT '{}' NOT NULL,
	
	-- Context
	"request_id" text,
	"session_id" text,
	"user_agent" text,
	"ip_address" text,
	
	-- Additional context
	"labels" jsonb DEFAULT '{}' NOT NULL,
	"tags" jsonb DEFAULT '{}' NOT NULL,
	
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Dependencies Table
CREATE TABLE "financbase"."platform_service_dependencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"depends_on_service_id" integer NOT NULL REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	
	-- Dependency details
	"dependency_type" text NOT NULL,
	"version_constraint" text,
	
	-- Dependency status
	"is_active" boolean DEFAULT true NOT NULL,
	"last_checked_at" timestamp,
	"status" text DEFAULT 'unknown',
	
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Events Table
CREATE TABLE "financbase"."platform_service_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"user_id" text REFERENCES "financbase"."users"("id") ON DELETE cascade,
	"organization_id" text REFERENCES "financbase"."organizations"("id") ON DELETE cascade,
	
	-- Event details
	"event_type" text NOT NULL,
	"event_data" jsonb DEFAULT '{}' NOT NULL,
	
	-- Event context
	"severity" text DEFAULT 'info',
	"message" text,
	
	-- Event processing
	"is_processed" boolean DEFAULT false NOT NULL,
	"processed_at" timestamp,
	
	-- Additional context
	"labels" jsonb DEFAULT '{}' NOT NULL,
	"tags" jsonb DEFAULT '{}' NOT NULL,
	
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Platform Service Health Checks Table
CREATE TABLE "financbase"."platform_service_health_checks" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_id" integer NOT NULL REFERENCES "financbase"."platform_services"("id") ON DELETE cascade,
	"instance_id" integer REFERENCES "financbase"."platform_service_instances"("id") ON DELETE cascade,
	
	-- Health check details
	"check_type" text NOT NULL,
	"check_url" text,
	"check_method" text DEFAULT 'GET',
	"check_headers" jsonb DEFAULT '{}',
	"check_body" text,
	
	-- Health check results
	"status" text NOT NULL,
	"response_time" integer,
	"response_code" integer,
	"response_body" text,
	
	-- Health check configuration
	"timeout" integer DEFAULT 5000,
	"retry_count" integer DEFAULT 0,
	"interval" integer DEFAULT 60,
	
	-- Health check metadata
	"last_checked_at" timestamp DEFAULT now() NOT NULL,
	"next_check_at" timestamp,
	"consecutive_failures" integer DEFAULT 0,
	
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX "platform_services_user_id_idx" ON "financbase"."platform_services" ("user_id");
CREATE INDEX "platform_services_organization_id_idx" ON "financbase"."platform_services" ("organization_id");
CREATE INDEX "platform_services_slug_idx" ON "financbase"."platform_services" ("slug");
CREATE INDEX "platform_services_status_idx" ON "financbase"."platform_services" ("status");
CREATE INDEX "platform_services_type_idx" ON "financbase"."platform_services" ("type");
CREATE INDEX "platform_services_category_idx" ON "financbase"."platform_services" ("category");
CREATE INDEX "platform_services_is_active_idx" ON "financbase"."platform_services" ("is_active");

CREATE INDEX "platform_service_instances_service_id_idx" ON "financbase"."platform_service_instances" ("service_id");
CREATE INDEX "platform_service_instances_user_id_idx" ON "financbase"."platform_service_instances" ("user_id");
CREATE INDEX "platform_service_instances_instance_id_idx" ON "financbase"."platform_service_instances" ("instance_id");
CREATE INDEX "platform_service_instances_status_idx" ON "financbase"."platform_service_instances" ("status");

CREATE INDEX "platform_service_metrics_service_id_idx" ON "financbase"."platform_service_metrics" ("service_id");
CREATE INDEX "platform_service_metrics_user_id_idx" ON "financbase"."platform_service_metrics" ("user_id");
CREATE INDEX "platform_service_metrics_timestamp_idx" ON "financbase"."platform_service_metrics" ("timestamp");
CREATE INDEX "platform_service_metrics_category_idx" ON "financbase"."platform_service_metrics" ("category");

CREATE INDEX "platform_service_logs_service_id_idx" ON "financbase"."platform_service_logs" ("service_id");
CREATE INDEX "platform_service_logs_instance_id_idx" ON "financbase"."platform_service_logs" ("instance_id");
CREATE INDEX "platform_service_logs_level_idx" ON "financbase"."platform_service_logs" ("level");
CREATE INDEX "platform_service_logs_timestamp_idx" ON "financbase"."platform_service_logs" ("timestamp");

CREATE INDEX "platform_service_dependencies_service_id_idx" ON "financbase"."platform_service_dependencies" ("service_id");
CREATE INDEX "platform_service_dependencies_depends_on_service_id_idx" ON "financbase"."platform_service_dependencies" ("depends_on_service_id");

CREATE INDEX "platform_service_events_service_id_idx" ON "financbase"."platform_service_events" ("service_id");
CREATE INDEX "platform_service_events_event_type_idx" ON "financbase"."platform_service_events" ("event_type");
CREATE INDEX "platform_service_events_timestamp_idx" ON "financbase"."platform_service_events" ("timestamp");

CREATE INDEX "platform_service_health_checks_service_id_idx" ON "financbase"."platform_service_health_checks" ("service_id");
CREATE INDEX "platform_service_health_checks_instance_id_idx" ON "financbase"."platform_service_health_checks" ("instance_id");
CREATE INDEX "platform_service_health_checks_status_idx" ON "financbase"."platform_service_health_checks" ("status");
