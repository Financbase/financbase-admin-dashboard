-- Migration: Integration Syncs and Monitoring Tables
-- Created: 2025-01-XX
-- Description: Database schema for Integration Syncs, System Metrics, and Alert History

-- Ensure financbase schema exists
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Integration Syncs Table - Sync operation logs
CREATE TABLE IF NOT EXISTS "financbase"."financbase_integration_syncs" (
  "id" serial PRIMARY KEY NOT NULL,
  "connection_id" integer NOT NULL,
  "user_id" text NOT NULL,
  "sync_id" text NOT NULL UNIQUE,
  
  -- Sync details
  "type" text NOT NULL,
  "direction" text NOT NULL,
  "status" text NOT NULL,
  
  -- Sync scope
  "entity_types" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "filters" jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Progress tracking
  "total_records" integer DEFAULT 0,
  "processed_records" integer DEFAULT 0,
  "success_records" integer DEFAULT 0,
  "failed_records" integer DEFAULT 0,
  
  -- Timing
  "started_at" timestamp,
  "completed_at" timestamp,
  "duration" integer,
  
  -- Results
  "result" jsonb DEFAULT '{}'::jsonb,
  "errors" jsonb DEFAULT '[]'::jsonb,
  "warnings" jsonb DEFAULT '[]'::jsonb,
  
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- System Metrics Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_system_metrics" (
  "id" serial PRIMARY KEY NOT NULL,
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
  "labels" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "tags" jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Timing
  "timestamp" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Alert History Table (if it doesn't exist with the expected schema)
CREATE TABLE IF NOT EXISTS "financbase"."financbase_alert_history" (
  "id" serial PRIMARY KEY NOT NULL,
  "rule_id" integer NOT NULL,
  "user_id" text NOT NULL,
  "organization_id" text,
  
  -- Alert details
  "status" text NOT NULL,
  "severity" text NOT NULL,
  "message" text NOT NULL,
  
  -- Metric data that triggered the alert
  "metric_value" text NOT NULL,
  "threshold" text NOT NULL,
  "labels" jsonb DEFAULT '{}'::jsonb NOT NULL,
  
  -- Notification status
  "notifications_sent" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "acknowledged_by" text,
  "acknowledged_at" timestamp,
  
  -- Resolution
  "resolved_at" timestamp,
  "resolution" text,
  
  -- Timing
  "triggered_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "integration_syncs_connection_id_idx" ON "financbase"."financbase_integration_syncs" ("connection_id");
CREATE INDEX IF NOT EXISTS "integration_syncs_user_id_idx" ON "financbase"."financbase_integration_syncs" ("user_id");
CREATE INDEX IF NOT EXISTS "integration_syncs_sync_id_idx" ON "financbase"."financbase_integration_syncs" ("sync_id");
CREATE INDEX IF NOT EXISTS "integration_syncs_status_idx" ON "financbase"."financbase_integration_syncs" ("status");
CREATE INDEX IF NOT EXISTS "integration_syncs_type_idx" ON "financbase"."financbase_integration_syncs" ("type");
CREATE INDEX IF NOT EXISTS "integration_syncs_created_at_idx" ON "financbase"."financbase_integration_syncs" ("created_at");

CREATE INDEX IF NOT EXISTS "system_metrics_user_id_idx" ON "financbase"."financbase_system_metrics" ("user_id");
CREATE INDEX IF NOT EXISTS "system_metrics_organization_id_idx" ON "financbase"."financbase_system_metrics" ("organization_id");
CREATE INDEX IF NOT EXISTS "system_metrics_metric_name_idx" ON "financbase"."financbase_system_metrics" ("metric_name");
CREATE INDEX IF NOT EXISTS "system_metrics_category_idx" ON "financbase"."financbase_system_metrics" ("category");
CREATE INDEX IF NOT EXISTS "system_metrics_timestamp_idx" ON "financbase"."financbase_system_metrics" ("timestamp");

CREATE INDEX IF NOT EXISTS "alert_history_rule_id_idx" ON "financbase"."financbase_alert_history" ("rule_id");
CREATE INDEX IF NOT EXISTS "alert_history_user_id_idx" ON "financbase"."financbase_alert_history" ("user_id");
CREATE INDEX IF NOT EXISTS "alert_history_status_idx" ON "financbase"."financbase_alert_history" ("status");
CREATE INDEX IF NOT EXISTS "alert_history_triggered_at_idx" ON "financbase"."financbase_alert_history" ("triggered_at");

-- Add foreign key constraints (after tables are created)
ALTER TABLE "financbase"."financbase_integration_syncs" 
  ADD CONSTRAINT "integration_syncs_connection_id_fkey" 
  FOREIGN KEY ("connection_id") 
  REFERENCES "financbase"."financbase_integration_connections"("id") 
  ON DELETE CASCADE;

ALTER TABLE "financbase"."financbase_alert_history" 
  ADD CONSTRAINT "alert_history_rule_id_fkey" 
  FOREIGN KEY ("rule_id") 
  REFERENCES "public"."financbase_alert_rules"("id") 
  ON DELETE CASCADE;

