-- Migration: HR Contractors System
-- Created: 2025-01-28
-- Description: Database schema for HR contractors management

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "contractor_type" AS ENUM('1099', 'w2', 'c2c', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "contractor_status" AS ENUM('active', 'inactive', 'terminated', 'pending');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "payment_terms" AS ENUM('net_15', 'net_30', 'net_45', 'net_60', 'due_on_receipt', 'custom');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- HR Contractors Table
CREATE TABLE IF NOT EXISTS "hr_contractors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" TEXT NOT NULL,
  "organization_id" UUID NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "avatar" TEXT,
  "contractor_type" "contractor_type" NOT NULL DEFAULT '1099',
  "company_name" TEXT,
  "contractor_number" TEXT UNIQUE,
  "ssn" TEXT,
  "ein" TEXT,
  "w9_status" TEXT DEFAULT 'pending',
  "w9_received_date" TIMESTAMP WITH TIME ZONE,
  "tax_id" TEXT,
  "contract_start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "contract_end_date" TIMESTAMP WITH TIME ZONE,
  "contract_document_url" TEXT,
  "hourly_rate" NUMERIC(12, 2),
  "monthly_rate" NUMERIC(12, 2),
  "annual_rate" NUMERIC(12, 2),
  "currency" TEXT DEFAULT 'USD',
  "payment_terms" "payment_terms" DEFAULT 'net_30',
  "custom_payment_terms" TEXT,
  "status" "contractor_status" NOT NULL DEFAULT 'active',
  "location" TEXT,
  "timezone" TEXT DEFAULT 'UTC',
  "notes" TEXT,
  "tags" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "hr_contractors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "hr_contractors_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Indexes for HR Contractors
CREATE INDEX IF NOT EXISTS "hr_contractors_user_id_idx" ON "hr_contractors"("user_id");
CREATE INDEX IF NOT EXISTS "hr_contractors_organization_id_idx" ON "hr_contractors"("organization_id");
CREATE INDEX IF NOT EXISTS "hr_contractors_status_idx" ON "hr_contractors"("status");
CREATE INDEX IF NOT EXISTS "hr_contractors_contractor_type_idx" ON "hr_contractors"("contractor_type");
CREATE INDEX IF NOT EXISTS "hr_contractors_email_idx" ON "hr_contractors"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "hr_contractors_contractor_number_unique" ON "hr_contractors"("contractor_number") WHERE "contractor_number" IS NOT NULL;

-- Enable RLS
ALTER TABLE "hr_contractors" ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic structure - should be customized based on your RLS setup)
CREATE POLICY "hr_contractors_select_policy" ON "hr_contractors"
  FOR SELECT USING (
    "organization_id" = current_setting('app.current_org_id', true)::UUID
    OR "user_id" = current_setting('app.current_user_id', true)::TEXT
  );

CREATE POLICY "hr_contractors_insert_policy" ON "hr_contractors"
  FOR INSERT WITH CHECK (
    "organization_id" = current_setting('app.current_org_id', true)::UUID
  );

CREATE POLICY "hr_contractors_update_policy" ON "hr_contractors"
  FOR UPDATE USING (
    "organization_id" = current_setting('app.current_org_id', true)::UUID
  );

CREATE POLICY "hr_contractors_delete_policy" ON "hr_contractors"
  FOR DELETE USING (
    "organization_id" = current_setting('app.current_org_id', true)::UUID
  );

-- Comments for documentation
COMMENT ON TABLE "hr_contractors" IS 'HR contractors for managing independent contractors';
COMMENT ON COLUMN "hr_contractors"."contractor_type" IS 'Contractor type: 1099, W2, C2C, or other';
COMMENT ON COLUMN "hr_contractors"."status" IS 'Contractor status: active, inactive, terminated, or pending';
COMMENT ON COLUMN "hr_contractors"."w9_status" IS 'W-9 form status: pending, received, or verified';

