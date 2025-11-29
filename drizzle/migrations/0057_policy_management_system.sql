-- Migration: Policy Management System
-- Created: 2025-01-XX
-- Description: Database schema for ISO 27001 policy management with version control and approval workflows

-- Create ENUM types for Policy Management
DO $$ BEGIN
 CREATE TYPE "policy_status" AS ENUM('draft', 'review', 'approval', 'published', 'archived', 'superseded');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "policy_type" AS ENUM('information_security', 'access_control', 'data_classification', 'incident_management', 'business_continuity', 'change_management', 'vendor_management', 'acceptable_use', 'backup_recovery', 'network_security', 'encryption', 'password', 'remote_access', 'pci_dss_information_security', 'pci_dss_cardholder_data_protection', 'pci_dss_network_security', 'pci_dss_access_control', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Policy Documents Table
CREATE TABLE IF NOT EXISTS "financbase_policy_documents" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "policy_number" TEXT NOT NULL UNIQUE,
  "created_by" UUID,
  "approved_by" UUID,
  "title" TEXT NOT NULL,
  "policy_type" "policy_type" NOT NULL,
  "description" TEXT,
  "content" TEXT NOT NULL,
  "summary" TEXT,
  "version" INTEGER DEFAULT 1 NOT NULL,
  "status" "policy_status" NOT NULL DEFAULT 'draft',
  "current_approver" UUID,
  "approval_history" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "review_history" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "requires_acknowledgment" BOOLEAN DEFAULT false NOT NULL,
  "acknowledgment_deadline" TIMESTAMP WITH TIME ZONE,
  "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
  "next_review_date" TIMESTAMP WITH TIME ZONE,
  "review_frequency" INTEGER DEFAULT 365 NOT NULL,
  "review_required" BOOLEAN DEFAULT true NOT NULL,
  "supersedes_policy_id" INTEGER,
  "related_policies" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "compliance_frameworks" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "requirements" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "published_at" TIMESTAMP WITH TIME ZONE,
  "archived_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "fk_policy_documents_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_policy_documents_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_policy_documents_approved_by" FOREIGN KEY ("approved_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_policy_documents_supersedes" FOREIGN KEY ("supersedes_policy_id") REFERENCES "financbase_policy_documents"("id") ON DELETE SET NULL
);

-- Policy Versions Table
CREATE TABLE IF NOT EXISTS "financbase_policy_versions" (
  "id" SERIAL PRIMARY KEY,
  "policy_id" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "summary" TEXT,
  "changelog" TEXT,
  "created_by" UUID,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "published_at" TIMESTAMP WITH TIME ZONE,
  "is_current" BOOLEAN DEFAULT false NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  CONSTRAINT "fk_policy_versions_policy" FOREIGN KEY ("policy_id") REFERENCES "financbase_policy_documents"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_policy_versions_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  UNIQUE("policy_id", "version")
);

-- Policy Assignments Table
CREATE TABLE IF NOT EXISTS "financbase_policy_assignments" (
  "id" SERIAL PRIMARY KEY,
  "policy_id" INTEGER NOT NULL,
  "user_id" UUID,
  "role_id" TEXT,
  "organization_id" UUID,
  "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "assigned_by" UUID,
  "requires_acknowledgment" BOOLEAN DEFAULT false NOT NULL,
  "deadline" TIMESTAMP WITH TIME ZONE,
  "acknowledged_at" TIMESTAMP WITH TIME ZONE,
  "acknowledgment_ip" TEXT,
  "acknowledgment_user_agent" TEXT,
  "status" TEXT DEFAULT 'assigned' NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_policy_assignments_policy" FOREIGN KEY ("policy_id") REFERENCES "financbase_policy_documents"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_policy_assignments_user" FOREIGN KEY ("user_id") REFERENCES "financbase"."users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_policy_assignments_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_policy_assignments_assigned_by" FOREIGN KEY ("assigned_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Policy Approval Workflows Table
CREATE TABLE IF NOT EXISTS "financbase_policy_approval_workflows" (
  "id" SERIAL PRIMARY KEY,
  "policy_id" INTEGER NOT NULL,
  "workflow_name" TEXT NOT NULL,
  "steps" JSONB NOT NULL,
  "current_step" INTEGER DEFAULT 0 NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "approvers" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "approvals" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  CONSTRAINT "fk_policy_approval_workflows_policy" FOREIGN KEY ("policy_id") REFERENCES "financbase_policy_documents"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_policy_documents_org_id" ON "financbase_policy_documents"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_policy_documents_type" ON "financbase_policy_documents"("policy_type");
CREATE INDEX IF NOT EXISTS "idx_policy_documents_status" ON "financbase_policy_documents"("status");
CREATE INDEX IF NOT EXISTS "idx_policy_documents_policy_number" ON "financbase_policy_documents"("policy_number");
CREATE INDEX IF NOT EXISTS "idx_policy_documents_next_review" ON "financbase_policy_documents"("next_review_date");

CREATE INDEX IF NOT EXISTS "idx_policy_versions_policy" ON "financbase_policy_versions"("policy_id");
CREATE INDEX IF NOT EXISTS "idx_policy_versions_current" ON "financbase_policy_versions"("is_current");

CREATE INDEX IF NOT EXISTS "idx_policy_assignments_policy" ON "financbase_policy_assignments"("policy_id");
CREATE INDEX IF NOT EXISTS "idx_policy_assignments_user" ON "financbase_policy_assignments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_policy_assignments_status" ON "financbase_policy_assignments"("status");

CREATE INDEX IF NOT EXISTS "idx_policy_approval_workflows_policy" ON "financbase_policy_approval_workflows"("policy_id");

