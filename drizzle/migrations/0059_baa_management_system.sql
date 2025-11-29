-- Migration: BAA Management System
-- Created: 2025-01-XX
-- Description: Database schema for HIPAA Business Associate Agreement management

-- Create ENUM types for BAA Management
DO $$ BEGIN
 CREATE TYPE "baa_status" AS ENUM('pending', 'sent', 'signed', 'expired', 'renewal_due', 'terminated');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "vendor_type" AS ENUM('cloud_provider', 'payment_processor', 'email_service', 'backup_service', 'analytics', 'support', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Business Associates Table
CREATE TABLE IF NOT EXISTS "financbase_business_associates" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "vendor_name" TEXT NOT NULL,
  "vendor_type" "vendor_type" NOT NULL,
  "contact_name" TEXT,
  "contact_email" TEXT,
  "contact_phone" TEXT,
  "vendor_address" TEXT,
  "services_provided" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "description" TEXT,
  "baa_status" "baa_status" DEFAULT 'pending' NOT NULL,
  "baa_document_url" TEXT,
  "baa_signed_date" TIMESTAMP WITH TIME ZONE,
  "baa_expiry_date" TIMESTAMP WITH TIME ZONE,
  "baa_renewal_date" TIMESTAMP WITH TIME ZONE,
  "hipaa_compliant" BOOLEAN DEFAULT false NOT NULL,
  "compliance_certifications" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "tags" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "metadata" JSONB DEFAULT '{}'::jsonb NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_business_associates_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_business_associates_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- BAA Compliance Checklist Table
CREATE TABLE IF NOT EXISTS "financbase_baa_compliance_checklist" (
  "id" SERIAL PRIMARY KEY,
  "business_associate_id" INTEGER NOT NULL,
  "checklist_items" JSONB NOT NULL,
  "completed_items" JSONB DEFAULT '[]'::jsonb NOT NULL,
  "completion_percentage" INTEGER DEFAULT 0 NOT NULL,
  "last_reviewed_at" TIMESTAMP WITH TIME ZONE,
  "reviewed_by" UUID,
  "notes" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_baa_compliance_checklist_business_associate" FOREIGN KEY ("business_associate_id") REFERENCES "financbase_business_associates"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_baa_compliance_checklist_reviewed_by" FOREIGN KEY ("reviewed_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "idx_business_associates_org_id" ON "financbase_business_associates"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_business_associates_status" ON "financbase_business_associates"("baa_status");
CREATE INDEX IF NOT EXISTS "idx_business_associates_type" ON "financbase_business_associates"("vendor_type");
CREATE INDEX IF NOT EXISTS "idx_business_associates_renewal_date" ON "financbase_business_associates"("baa_renewal_date");

CREATE INDEX IF NOT EXISTS "idx_baa_compliance_checklist_business_associate" ON "financbase_baa_compliance_checklist"("business_associate_id");

