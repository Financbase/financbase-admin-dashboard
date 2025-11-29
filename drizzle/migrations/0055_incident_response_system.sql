-- Migration: Incident Response Management System
-- Created: 2025-01-XX
-- Description: Database schema for SOC 2 Type II incident response management system

-- Create ENUM types for Incident Response
DO $$ BEGIN
 CREATE TYPE "incident_severity" AS ENUM('low', 'medium', 'high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "incident_status" AS ENUM('detected', 'analyzing', 'contained', 'eradicated', 'recovered', 'post_incident_review', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "incident_type" AS ENUM('security_breach', 'data_breach', 'malware', 'phishing', 'ddos', 'unauthorized_access', 'system_outage', 'data_loss', 'service_degradation', 'compliance_violation', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "ir_team_role" AS ENUM('incident_commander', 'technical_lead', 'communications_lead', 'legal_lead', 'executive_sponsor', 'team_member', 'observer');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "runbook_status" AS ENUM('draft', 'review', 'approved', 'active', 'archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "drill_type" AS ENUM('tabletop', 'simulation', 'full_scale', 'red_team', 'blue_team');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "drill_status" AS ENUM('scheduled', 'in_progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Security Incidents Table
CREATE TABLE IF NOT EXISTS "financbase_security_incidents" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "incident_number" TEXT NOT NULL UNIQUE,
  "reported_by" UUID,
  "assigned_to" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "incident_type" "incident_type" NOT NULL,
  "severity" "incident_severity" NOT NULL,
  "status" "incident_status" NOT NULL DEFAULT 'detected',
  "detected_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "analyzed_at" TIMESTAMP WITH TIME ZONE,
  "contained_at" TIMESTAMP WITH TIME ZONE,
  "eradicated_at" TIMESTAMP WITH TIME ZONE,
  "recovered_at" TIMESTAMP WITH TIME ZONE,
  "closed_at" TIMESTAMP WITH TIME ZONE,
  "affected_systems" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "affected_services" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "affected_users" INTEGER,
  "data_affected" BOOLEAN DEFAULT false NOT NULL,
  "data_types_affected" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "financial_impact" JSONB,
  "business_impact" TEXT,
  "containment_actions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "eradication_actions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "recovery_actions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "lessons_learned" TEXT,
  "internal_notifications" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "external_notifications" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "communication_log" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "root_cause" TEXT,
  "contributing_factors" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "remediation_plan" JSONB,
  "follow_up_actions" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_security_incidents_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_security_incidents_reported_by" FOREIGN KEY ("reported_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_security_incidents_assigned_to" FOREIGN KEY ("assigned_to") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- IR Team Members Table
CREATE TABLE IF NOT EXISTS "financbase_ir_team_members" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "role" "ir_team_role" NOT NULL,
  "is_primary" BOOLEAN DEFAULT false NOT NULL,
  "contact_info" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "availability" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "certifications" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "experience" TEXT,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_ir_team_members_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ir_team_members_user" FOREIGN KEY ("user_id") REFERENCES "financbase"."users"("id") ON DELETE CASCADE
);

-- Incident Team Assignments Table
CREATE TABLE IF NOT EXISTS "financbase_incident_team_assignments" (
  "id" SERIAL PRIMARY KEY,
  "incident_id" INTEGER NOT NULL,
  "team_member_id" INTEGER NOT NULL,
  "role" "ir_team_role" NOT NULL,
  "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "assigned_by" UUID,
  "status" TEXT DEFAULT 'active' NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_incident_team_assignments_incident" FOREIGN KEY ("incident_id") REFERENCES "financbase_security_incidents"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_incident_team_assignments_team_member" FOREIGN KEY ("team_member_id") REFERENCES "financbase_ir_team_members"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_incident_team_assignments_assigned_by" FOREIGN KEY ("assigned_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- IR Runbooks Table
CREATE TABLE IF NOT EXISTS "financbase_ir_runbooks" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "approved_by" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "incident_type" "incident_type" NOT NULL,
  "severity" "incident_severity" NOT NULL,
  "status" "runbook_status" NOT NULL DEFAULT 'draft',
  "version" INTEGER DEFAULT 1 NOT NULL,
  "procedures" JSONB NOT NULL,
  "checklists" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "escalation_paths" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "communication_templates" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "tools_and_resources" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "last_executed_at" TIMESTAMP WITH TIME ZONE,
  "execution_count" INTEGER DEFAULT 0 NOT NULL,
  "success_rate" INTEGER,
  "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
  "next_review_date" TIMESTAMP WITH TIME ZONE,
  "review_frequency" INTEGER DEFAULT 90 NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_ir_runbooks_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ir_runbooks_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_ir_runbooks_approved_by" FOREIGN KEY ("approved_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Runbook Executions Table
CREATE TABLE IF NOT EXISTS "financbase_runbook_executions" (
  "id" SERIAL PRIMARY KEY,
  "incident_id" INTEGER NOT NULL,
  "runbook_id" INTEGER NOT NULL,
  "executed_by" UUID,
  "started_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "status" TEXT DEFAULT 'in_progress' NOT NULL,
  "completion_percentage" INTEGER DEFAULT 0 NOT NULL,
  "steps_completed" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "steps_skipped" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "notes" TEXT,
  "effectiveness" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_runbook_executions_incident" FOREIGN KEY ("incident_id") REFERENCES "financbase_security_incidents"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_runbook_executions_runbook" FOREIGN KEY ("runbook_id") REFERENCES "financbase_ir_runbooks"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_runbook_executions_executed_by" FOREIGN KEY ("executed_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Communication Templates Table
CREATE TABLE IF NOT EXISTS "financbase_ir_communication_templates" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "name" TEXT NOT NULL,
  "template_type" TEXT NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "placeholders" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "incident_type" "incident_type",
  "severity" "incident_severity",
  "audience" TEXT NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "usage_count" INTEGER DEFAULT 0 NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_ir_communication_templates_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ir_communication_templates_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- IR Testing and Drills Table
CREATE TABLE IF NOT EXISTS "financbase_ir_drills" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "scheduled_by" UUID,
  "conducted_by" UUID,
  "drill_name" TEXT NOT NULL,
  "drill_type" "drill_type" NOT NULL,
  "status" "drill_status" NOT NULL DEFAULT 'scheduled',
  "description" TEXT,
  "scenario" TEXT NOT NULL,
  "incident_type" "incident_type",
  "severity" "incident_severity",
  "scheduled_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "duration" INTEGER,
  "participants" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "observers" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "objectives" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "objectives_met" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "findings" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "strengths" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "weaknesses" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "recommendations" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "action_items" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "overall_score" INTEGER,
  "response_time_score" INTEGER,
  "communication_score" INTEGER,
  "technical_score" INTEGER,
  "report_url" TEXT,
  "report_generated_at" TIMESTAMP WITH TIME ZONE,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_ir_drills_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_ir_drills_scheduled_by" FOREIGN KEY ("scheduled_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_ir_drills_conducted_by" FOREIGN KEY ("conducted_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_security_incidents_org_id" ON "financbase_security_incidents"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_security_incidents_status" ON "financbase_security_incidents"("status");
CREATE INDEX IF NOT EXISTS "idx_security_incidents_severity" ON "financbase_security_incidents"("severity");
CREATE INDEX IF NOT EXISTS "idx_security_incidents_type" ON "financbase_security_incidents"("incident_type");
CREATE INDEX IF NOT EXISTS "idx_security_incidents_detected_at" ON "financbase_security_incidents"("detected_at");
CREATE INDEX IF NOT EXISTS "idx_security_incidents_incident_number" ON "financbase_security_incidents"("incident_number");

CREATE INDEX IF NOT EXISTS "idx_ir_team_members_org_id" ON "financbase_ir_team_members"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_ir_team_members_user_id" ON "financbase_ir_team_members"("user_id");
CREATE INDEX IF NOT EXISTS "idx_ir_team_members_role" ON "financbase_ir_team_members"("role");
CREATE INDEX IF NOT EXISTS "idx_ir_team_members_active" ON "financbase_ir_team_members"("is_active");

CREATE INDEX IF NOT EXISTS "idx_incident_team_assignments_incident" ON "financbase_incident_team_assignments"("incident_id");
CREATE INDEX IF NOT EXISTS "idx_incident_team_assignments_team_member" ON "financbase_incident_team_assignments"("team_member_id");

CREATE INDEX IF NOT EXISTS "idx_ir_runbooks_org_id" ON "financbase_ir_runbooks"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_ir_runbooks_status" ON "financbase_ir_runbooks"("status");
CREATE INDEX IF NOT EXISTS "idx_ir_runbooks_type" ON "financbase_ir_runbooks"("incident_type");

CREATE INDEX IF NOT EXISTS "idx_runbook_executions_incident" ON "financbase_runbook_executions"("incident_id");
CREATE INDEX IF NOT EXISTS "idx_runbook_executions_runbook" ON "financbase_runbook_executions"("runbook_id");

CREATE INDEX IF NOT EXISTS "idx_ir_communication_templates_org_id" ON "financbase_ir_communication_templates"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_ir_communication_templates_active" ON "financbase_ir_communication_templates"("is_active");

CREATE INDEX IF NOT EXISTS "idx_ir_drills_org_id" ON "financbase_ir_drills"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_ir_drills_status" ON "financbase_ir_drills"("status");
CREATE INDEX IF NOT EXISTS "idx_ir_drills_scheduled_date" ON "financbase_ir_drills"("scheduled_date");

