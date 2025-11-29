-- Migration: Risk Assessment System
-- Created: 2025-01-XX
-- Description: Database schema for ISO 27001 risk assessment with asset inventory and risk register

-- Create ENUM types for Risk Assessment
DO $$ BEGIN
 CREATE TYPE "risk_level" AS ENUM('very_low', 'low', 'medium', 'high', 'very_high', 'critical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "risk_status" AS ENUM('identified', 'assessed', 'treated', 'accepted', 'monitored', 'closed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "risk_treatment" AS ENUM('avoid', 'mitigate', 'transfer', 'accept');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "asset_type" AS ENUM('information', 'software', 'hardware', 'service', 'personnel', 'facility', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Assets Table
CREATE TABLE IF NOT EXISTS "financbase_assets" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "asset_name" TEXT NOT NULL,
  "asset_type" "asset_type" NOT NULL,
  "description" TEXT,
  "identifier" TEXT,
  "owner" UUID,
  "location" TEXT,
  "criticality" TEXT DEFAULT 'medium' NOT NULL,
  "data_classification" TEXT,
  "confidentiality" TEXT DEFAULT 'medium' NOT NULL,
  "integrity" TEXT DEFAULT 'medium' NOT NULL,
  "availability" TEXT DEFAULT 'medium' NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_assets_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_assets_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Risks Table
CREATE TABLE IF NOT EXISTS "financbase_risks" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "risk_number" TEXT NOT NULL UNIQUE,
  "identified_by" UUID,
  "owner" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "asset_id" INTEGER,
  "threat" TEXT NOT NULL,
  "vulnerability" TEXT NOT NULL,
  "likelihood" INTEGER NOT NULL,
  "impact" INTEGER NOT NULL,
  "risk_score" NUMERIC(5, 2) NOT NULL,
  "risk_level" "risk_level" NOT NULL,
  "business_impact" TEXT,
  "financial_impact" JSONB,
  "operational_impact" TEXT,
  "reputation_impact" TEXT,
  "status" "risk_status" DEFAULT 'identified' NOT NULL,
  "treatment_option" "risk_treatment",
  "treatment_plan" JSONB,
  "controls" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "residual_risk" NUMERIC(5, 2),
  "residual_risk_level" "risk_level",
  "accepted_by" UUID,
  "accepted_at" TIMESTAMP WITH TIME ZONE,
  "acceptance_justification" TEXT,
  "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
  "next_review_date" TIMESTAMP WITH TIME ZONE,
  "review_frequency" INTEGER DEFAULT 90 NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_risks_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_risks_identified_by" FOREIGN KEY ("identified_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_risks_owner" FOREIGN KEY ("owner") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_risks_asset" FOREIGN KEY ("asset_id") REFERENCES "financbase_assets"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_risks_accepted_by" FOREIGN KEY ("accepted_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Risk Treatment Plans Table
CREATE TABLE IF NOT EXISTS "financbase_risk_treatment_plans" (
  "id" SERIAL PRIMARY KEY,
  "risk_id" INTEGER NOT NULL,
  "created_by" UUID,
  "treatment_option" "risk_treatment" NOT NULL,
  "description" TEXT NOT NULL,
  "actions" JSONB NOT NULL,
  "controls" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "target_completion_date" TIMESTAMP WITH TIME ZONE,
  "actual_completion_date" TIMESTAMP WITH TIME ZONE,
  "status" TEXT DEFAULT 'planned' NOT NULL,
  "progress" INTEGER DEFAULT 0 NOT NULL,
  "responsible" UUID,
  "budget" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_risk_treatment_plans_risk" FOREIGN KEY ("risk_id") REFERENCES "financbase_risks"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_risk_treatment_plans_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  CONSTRAINT "fk_risk_treatment_plans_responsible" FOREIGN KEY ("responsible") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_assets_org_id" ON "financbase_assets"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_assets_type" ON "financbase_assets"("asset_type");
CREATE INDEX IF NOT EXISTS "idx_assets_active" ON "financbase_assets"("is_active");

CREATE INDEX IF NOT EXISTS "idx_risks_org_id" ON "financbase_risks"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_risks_risk_number" ON "financbase_risks"("risk_number");
CREATE INDEX IF NOT EXISTS "idx_risks_status" ON "financbase_risks"("status");
CREATE INDEX IF NOT EXISTS "idx_risks_level" ON "financbase_risks"("risk_level");
CREATE INDEX IF NOT EXISTS "idx_risks_score" ON "financbase_risks"("risk_score");
CREATE INDEX IF NOT EXISTS "idx_risks_asset" ON "financbase_risks"("asset_id");

CREATE INDEX IF NOT EXISTS "idx_risk_treatment_plans_risk" ON "financbase_risk_treatment_plans"("risk_id");
CREATE INDEX IF NOT EXISTS "idx_risk_treatment_plans_status" ON "financbase_risk_treatment_plans"("status");

