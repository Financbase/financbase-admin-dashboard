-- Migration: SIEM Monitoring and Real-time Alerting System
-- Created: 2025-01-XX
-- Description: Database schema for SOC 2 Type II SIEM integration, real-time alerting, and immutable audit trails

-- Create ENUM types for SIEM Monitoring
DO $$ BEGIN
 CREATE TYPE "siem_event_severity" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "siem_event_status" AS ENUM('new', 'analyzing', 'investigating', 'contained', 'resolved', 'false_positive', 'ignored');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "siem_integration_type" AS ENUM('datadog', 'splunk', 'splunk_cloud', 'splunk_enterprise', 'elastic', 'elastic_cloud', 'sumo_logic', 'azure_sentinel', 'aws_security_hub', 'google_chronicle', 'qradar', 'arcsight', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "alert_rule_type" AS ENUM('threshold', 'anomaly', 'correlation', 'pattern', 'machine_learning', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- SIEM Events Table
CREATE TABLE IF NOT EXISTS "financbase_siem_events" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "event_id" TEXT NOT NULL UNIQUE,
  "correlation_id" TEXT,
  "source_event_id" TEXT,
  "event_type" TEXT NOT NULL,
  "event_category" TEXT NOT NULL,
  "event_action" TEXT NOT NULL,
  "severity" "siem_event_severity" NOT NULL,
  "status" "siem_event_status" NOT NULL DEFAULT 'new',
  "source_system" TEXT NOT NULL,
  "source_component" TEXT,
  "source_ip" TEXT,
  "source_user" TEXT,
  "source_host" TEXT,
  "target_resource" TEXT,
  "target_type" TEXT,
  "target_user" TEXT,
  "event_data" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "raw_event" JSONB,
  "normalized_event" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "received_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "processed_at" TIMESTAMP WITH TIME ZONE,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "user_agent" TEXT,
  "device_type" TEXT,
  "threat_indicators" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "ioc_matches" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "risk_score" INTEGER,
  "is_alerted" BOOLEAN DEFAULT false NOT NULL,
  "alert_ids" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "investigation_id" INTEGER,
  "compliance_relevant" BOOLEAN DEFAULT false NOT NULL,
  "compliance_frameworks" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "retention_period" INTEGER DEFAULT 2555 NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_siem_events_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE
);

-- SIEM Integrations Table
CREATE TABLE IF NOT EXISTS "financbase_siem_integrations" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "name" TEXT NOT NULL,
  "integration_type" "siem_integration_type" NOT NULL,
  "description" TEXT,
  "endpoint" TEXT NOT NULL,
  "api_key" TEXT,
  "api_secret" TEXT,
  "username" TEXT,
  "password" TEXT,
  "additional_config" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "forward_events" BOOLEAN DEFAULT true NOT NULL,
  "event_filters" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "forward_format" TEXT DEFAULT 'json' NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "is_verified" BOOLEAN DEFAULT false NOT NULL,
  "last_health_check" TIMESTAMP WITH TIME ZONE,
  "health_status" TEXT DEFAULT 'unknown' NOT NULL,
  "last_error" TEXT,
  "events_forwarded" INTEGER DEFAULT 0 NOT NULL,
  "events_failed" INTEGER DEFAULT 0 NOT NULL,
  "last_forwarded_at" TIMESTAMP WITH TIME ZONE,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_siem_integrations_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_siem_integrations_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Alert Rules Table
CREATE TABLE IF NOT EXISTS "financbase_alert_rules" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "rule_type" "alert_rule_type" NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "priority" INTEGER DEFAULT 0 NOT NULL,
  "conditions" JSONB NOT NULL,
  "event_filters" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "threshold" INTEGER,
  "time_window" INTEGER,
  "alert_severity" "siem_event_severity" NOT NULL,
  "alert_title" TEXT NOT NULL,
  "alert_message" TEXT NOT NULL,
  "alert_channels" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "alert_recipients" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "escalation_policy" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "cooldown_period" INTEGER DEFAULT 300 NOT NULL,
  "trigger_count" INTEGER DEFAULT 0 NOT NULL,
  "last_triggered_at" TIMESTAMP WITH TIME ZONE,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_alert_rules_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_alert_rules_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Real-time Alerts Table
CREATE TABLE IF NOT EXISTS "financbase_real_time_alerts" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "alert_rule_id" INTEGER,
  "alert_id" TEXT NOT NULL UNIQUE,
  "severity" "siem_event_severity" NOT NULL,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "triggered_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "triggered_by" TEXT,
  "related_events" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "acknowledged_by" UUID,
  "acknowledged_at" TIMESTAMP WITH TIME ZONE,
  "resolved_by" UUID,
  "resolved_at" TIMESTAMP WITH TIME ZONE,
  "resolution_notes" TEXT,
  "notifications_sent" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "escalation_level" INTEGER DEFAULT 0 NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_real_time_alerts_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_real_time_alerts_rule" FOREIGN KEY ("alert_rule_id") REFERENCES "financbase_alert_rules"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_real_time_alerts_acknowledged_by" FOREIGN KEY ("acknowledged_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_real_time_alerts_resolved_by" FOREIGN KEY ("resolved_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Immutable Audit Trail Table (WORM - Write Once Read Many)
CREATE TABLE IF NOT EXISTS "financbase_immutable_audit_trail" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "event_hash" TEXT NOT NULL UNIQUE,
  "event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "event_data" JSONB NOT NULL,
  "event_metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "previous_hash" TEXT,
  "signature" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
  "recorded_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "compliance_frameworks" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "retention_until" TIMESTAMP WITH TIME ZONE NOT NULL,
  "source_system" TEXT NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  CONSTRAINT "fk_immutable_audit_trail_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE
);

-- Log Aggregation Configuration Table
CREATE TABLE IF NOT EXISTS "financbase_log_aggregation_config" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "config_name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "source_systems" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "log_types" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "filters" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "aggregation_interval" INTEGER DEFAULT 60 NOT NULL,
  "retention_period" INTEGER DEFAULT 2555 NOT NULL,
  "compression_enabled" BOOLEAN DEFAULT true NOT NULL,
  "storage_location" TEXT,
  "storage_format" TEXT DEFAULT 'json' NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_log_aggregation_config_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_siem_events_org_id" ON "financbase_siem_events"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_siem_events_event_id" ON "financbase_siem_events"("event_id");
CREATE INDEX IF NOT EXISTS "idx_siem_events_status" ON "financbase_siem_events"("status");
CREATE INDEX IF NOT EXISTS "idx_siem_events_severity" ON "financbase_siem_events"("severity");
CREATE INDEX IF NOT EXISTS "idx_siem_events_timestamp" ON "financbase_siem_events"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_siem_events_type" ON "financbase_siem_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_siem_events_compliance" ON "financbase_siem_events"("compliance_relevant");

CREATE INDEX IF NOT EXISTS "idx_siem_integrations_org_id" ON "financbase_siem_integrations"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_siem_integrations_active" ON "financbase_siem_integrations"("is_active");

CREATE INDEX IF NOT EXISTS "idx_alert_rules_org_id" ON "financbase_alert_rules"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_alert_rules_active" ON "financbase_alert_rules"("is_active");
CREATE INDEX IF NOT EXISTS "idx_alert_rules_priority" ON "financbase_alert_rules"("priority");

CREATE INDEX IF NOT EXISTS "idx_real_time_alerts_org_id" ON "financbase_real_time_alerts"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_real_time_alerts_status" ON "financbase_real_time_alerts"("status");
CREATE INDEX IF NOT EXISTS "idx_real_time_alerts_severity" ON "financbase_real_time_alerts"("severity");
CREATE INDEX IF NOT EXISTS "idx_real_time_alerts_triggered_at" ON "financbase_real_time_alerts"("triggered_at");
CREATE INDEX IF NOT EXISTS "idx_real_time_alerts_alert_id" ON "financbase_real_time_alerts"("alert_id");

CREATE INDEX IF NOT EXISTS "idx_immutable_audit_trail_org_id" ON "financbase_immutable_audit_trail"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_immutable_audit_trail_event_hash" ON "financbase_immutable_audit_trail"("event_hash");
CREATE INDEX IF NOT EXISTS "idx_immutable_audit_trail_timestamp" ON "financbase_immutable_audit_trail"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_immutable_audit_trail_retention" ON "financbase_immutable_audit_trail"("retention_until");

CREATE INDEX IF NOT EXISTS "idx_log_aggregation_config_org_id" ON "financbase_log_aggregation_config"("organization_id");

