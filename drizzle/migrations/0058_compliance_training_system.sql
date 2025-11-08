-- Migration: Compliance Training System
-- Created: 2025-01-XX
-- Description: Database schema for ISO 27001 security awareness training system

-- Create ENUM types for Compliance Training
DO $$ BEGIN
 CREATE TYPE "training_type" AS ENUM('security_awareness', 'iso27001_isms', 'policy_training', 'role_specific', 'phishing_simulation', 'annual_refresher', 'hipaa', 'pci_dss', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "training_status" AS ENUM('not_started', 'in_progress', 'completed', 'failed', 'expired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "assignment_type" AS ENUM('mandatory', 'optional', 'role_based', 'onboarding');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Security Training Programs Table
CREATE TABLE IF NOT EXISTS "financbase_security_training_programs" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "created_by" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "training_type" "training_type" NOT NULL,
  "duration" INTEGER,
  "content" TEXT,
  "content_url" TEXT,
  "is_mandatory" BOOLEAN DEFAULT false NOT NULL,
  "passing_score" INTEGER DEFAULT 80 NOT NULL,
  "max_attempts" INTEGER,
  "valid_for" INTEGER DEFAULT 365 NOT NULL,
  "requires_refresher" BOOLEAN DEFAULT true NOT NULL,
  "refresher_frequency" INTEGER DEFAULT 365 NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_security_training_programs_organization" FOREIGN KEY ("organization_id") REFERENCES "financbase_organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_security_training_programs_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase_users"("id") ON DELETE SET NULL
);

-- Training Assignments Table
CREATE TABLE IF NOT EXISTS "financbase_training_assignments" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "program_id" INTEGER NOT NULL,
  "user_id" TEXT,
  "role_id" TEXT,
  "assignment_type" "assignment_type" DEFAULT 'mandatory' NOT NULL,
  "assigned_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "assigned_by" TEXT,
  "deadline" TIMESTAMP WITH TIME ZONE,
  "status" "training_status" DEFAULT 'not_started' NOT NULL,
  "started_at" TIMESTAMP WITH TIME ZONE,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "progress" NUMERIC(5, 2) DEFAULT '0',
  "score" NUMERIC(5, 2),
  "attempts" INTEGER DEFAULT 0 NOT NULL,
  "passed" BOOLEAN,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_training_assignments_organization" FOREIGN KEY ("organization_id") REFERENCES "financbase_organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_assignments_program" FOREIGN KEY ("program_id") REFERENCES "financbase_security_training_programs"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_assignments_user" FOREIGN KEY ("user_id") REFERENCES "financbase_users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_assignments_assigned_by" FOREIGN KEY ("assigned_by") REFERENCES "financbase_users"("id") ON DELETE SET NULL
);

-- Training Assessments Table
CREATE TABLE IF NOT EXISTS "financbase_training_assessments" (
  "id" SERIAL PRIMARY KEY,
  "assignment_id" INTEGER NOT NULL,
  "user_id" TEXT NOT NULL,
  "questions" JSONB NOT NULL,
  "answers" JSONB NOT NULL,
  "score" NUMERIC(5, 2) NOT NULL,
  "max_score" NUMERIC(5, 2) NOT NULL,
  "passed" BOOLEAN NOT NULL,
  "started_at" TIMESTAMP WITH TIME ZONE NOT NULL,
  "completed_at" TIMESTAMP WITH TIME ZONE,
  "duration" INTEGER,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_training_assessments_assignment" FOREIGN KEY ("assignment_id") REFERENCES "financbase_training_assignments"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_assessments_user" FOREIGN KEY ("user_id") REFERENCES "financbase_users"("id") ON DELETE CASCADE
);

-- Training Certificates Table
CREATE TABLE IF NOT EXISTS "financbase_training_certificates" (
  "id" SERIAL PRIMARY KEY,
  "assignment_id" INTEGER NOT NULL,
  "user_id" TEXT NOT NULL,
  "program_id" INTEGER NOT NULL,
  "certificate_number" TEXT NOT NULL UNIQUE,
  "issued_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "expires_at" TIMESTAMP WITH TIME ZONE,
  "score" NUMERIC(5, 2),
  "certificate_url" TEXT,
  "certificate_data" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_training_certificates_assignment" FOREIGN KEY ("assignment_id") REFERENCES "financbase_training_assignments"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_certificates_user" FOREIGN KEY ("user_id") REFERENCES "financbase_users"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_training_certificates_program" FOREIGN KEY ("program_id") REFERENCES "financbase_security_training_programs"("id") ON DELETE CASCADE
);

-- Phishing Simulation Results Table
CREATE TABLE IF NOT EXISTS "financbase_phishing_simulation_results" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "simulation_id" TEXT NOT NULL,
  "email_subject" TEXT NOT NULL,
  "clicked" BOOLEAN DEFAULT false NOT NULL,
  "reported" BOOLEAN DEFAULT false NOT NULL,
  "clicked_at" TIMESTAMP WITH TIME ZONE,
  "reported_at" TIMESTAMP WITH TIME ZONE,
  "result" TEXT NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_phishing_simulation_results_organization" FOREIGN KEY ("organization_id") REFERENCES "financbase_organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_phishing_simulation_results_user" FOREIGN KEY ("user_id") REFERENCES "financbase_users"("id") ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_security_training_programs_org_id" ON "financbase_security_training_programs"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_security_training_programs_type" ON "financbase_security_training_programs"("training_type");
CREATE INDEX IF NOT EXISTS "idx_security_training_programs_active" ON "financbase_security_training_programs"("is_active");

CREATE INDEX IF NOT EXISTS "idx_training_assignments_org_id" ON "financbase_training_assignments"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_training_assignments_program" ON "financbase_training_assignments"("program_id");
CREATE INDEX IF NOT EXISTS "idx_training_assignments_user" ON "financbase_training_assignments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_training_assignments_status" ON "financbase_training_assignments"("status");

CREATE INDEX IF NOT EXISTS "idx_training_assessments_assignment" ON "financbase_training_assessments"("assignment_id");
CREATE INDEX IF NOT EXISTS "idx_training_assessments_user" ON "financbase_training_assessments"("user_id");

CREATE INDEX IF NOT EXISTS "idx_training_certificates_user" ON "financbase_training_certificates"("user_id");
CREATE INDEX IF NOT EXISTS "idx_training_certificates_program" ON "financbase_training_certificates"("program_id");
CREATE INDEX IF NOT EXISTS "idx_training_certificates_number" ON "financbase_training_certificates"("certificate_number");

CREATE INDEX IF NOT EXISTS "idx_phishing_simulation_results_org_id" ON "financbase_phishing_simulation_results"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_phishing_simulation_results_user" ON "financbase_phishing_simulation_results"("user_id");

