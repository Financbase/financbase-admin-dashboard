-- Migration: Payroll System
-- Created: 2025-01-28
-- Description: Database schema for comprehensive payroll management system

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "payroll_run_status" AS ENUM('draft', 'processing', 'completed', 'error', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "payroll_entry_status" AS ENUM('pending', 'calculated', 'approved', 'paid', 'error');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "deduction_type" AS ENUM('401k', '403b', 'health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'hsa', 'fsa', 'parking', 'transit', 'union_dues', 'garnishment', 'loan', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "tax_type" AS ENUM('federal_income', 'state_income', 'local_income', 'social_security', 'medicare', 'federal_unemployment', 'state_unemployment', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "benefit_type" AS ENUM('health_insurance', 'dental_insurance', 'vision_insurance', 'life_insurance', 'disability_insurance', 'retirement', 'stock_options', 'tuition', 'wellness', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Payroll Runs Table
CREATE TABLE IF NOT EXISTS "payroll_runs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" UUID NOT NULL,
  "created_by" TEXT NOT NULL,
  "pay_period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_frequency" TEXT NOT NULL CHECK ("pay_frequency" IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  "status" "payroll_run_status" NOT NULL DEFAULT 'draft',
  "total_employees" INTEGER DEFAULT 0,
  "total_gross_pay" NUMERIC(15, 2) DEFAULT '0',
  "total_deductions" NUMERIC(15, 2) DEFAULT '0',
  "total_taxes" NUMERIC(15, 2) DEFAULT '0',
  "total_benefits" NUMERIC(15, 2) DEFAULT '0',
  "total_net_pay" NUMERIC(15, 2) DEFAULT '0',
  "processed_at" TIMESTAMP WITH TIME ZONE,
  "processed_by" TEXT,
  "error_message" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "payroll_runs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Payroll Entries Table
CREATE TABLE IF NOT EXISTS "payroll_entries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "payroll_run_id" UUID NOT NULL,
  "employee_id" UUID,
  "contractor_id" UUID,
  "pay_period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
  "hours_worked" NUMERIC(8, 2) DEFAULT '0',
  "regular_hours" NUMERIC(8, 2) DEFAULT '0',
  "overtime_hours" NUMERIC(8, 2) DEFAULT '0',
  "hourly_rate" NUMERIC(12, 2),
  "salary_amount" NUMERIC(12, 2),
  "gross_pay" NUMERIC(12, 2) NOT NULL DEFAULT '0',
  "overtime_pay" NUMERIC(12, 2) DEFAULT '0',
  "bonus" NUMERIC(12, 2) DEFAULT '0',
  "commission" NUMERIC(12, 2) DEFAULT '0',
  "other_pay" NUMERIC(12, 2) DEFAULT '0',
  "total_deductions" NUMERIC(12, 2) DEFAULT '0',
  "deductions_breakdown" JSONB,
  "total_taxes" NUMERIC(12, 2) DEFAULT '0',
  "taxes_breakdown" JSONB,
  "total_benefits" NUMERIC(12, 2) DEFAULT '0',
  "benefits_breakdown" JSONB,
  "net_pay" NUMERIC(12, 2) NOT NULL DEFAULT '0',
  "status" "payroll_entry_status" NOT NULL DEFAULT 'pending',
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "payroll_entries_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE,
  CONSTRAINT "payroll_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL,
  CONSTRAINT "payroll_entries_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE SET NULL
);

-- Payroll Deductions Table
CREATE TABLE IF NOT EXISTS "payroll_deductions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" UUID NOT NULL,
  "employee_id" UUID,
  "contractor_id" UUID,
  "name" TEXT NOT NULL,
  "type" "deduction_type" NOT NULL,
  "description" TEXT,
  "amount_type" TEXT NOT NULL CHECK ("amount_type" IN ('fixed', 'percentage')),
  "amount" NUMERIC(12, 2),
  "percentage" NUMERIC(5, 2),
  "frequency" TEXT DEFAULT 'per_paycheck' CHECK ("frequency" IN ('per_paycheck', 'monthly', 'yearly', 'one_time')),
  "max_amount" NUMERIC(12, 2),
  "min_amount" NUMERIC(12, 2),
  "is_active" BOOLEAN DEFAULT true,
  "start_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "payroll_deductions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "payroll_deductions_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "payroll_deductions_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE CASCADE
);

-- Payroll Taxes Table
CREATE TABLE IF NOT EXISTS "payroll_taxes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "type" "tax_type" NOT NULL,
  "description" TEXT,
  "jurisdiction" TEXT,
  "rate" NUMERIC(8, 4),
  "flat_amount" NUMERIC(12, 2),
  "tax_brackets" JSONB,
  "exemptions" JSONB,
  "wage_base" NUMERIC(12, 2),
  "max_tax" NUMERIC(12, 2),
  "is_active" BOOLEAN DEFAULT true,
  "effective_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "payroll_taxes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Payroll Benefits Table
CREATE TABLE IF NOT EXISTS "payroll_benefits" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" UUID NOT NULL,
  "employee_id" UUID,
  "contractor_id" UUID,
  "name" TEXT NOT NULL,
  "type" "benefit_type" NOT NULL,
  "description" TEXT,
  "coverage_type" TEXT DEFAULT 'individual' CHECK ("coverage_type" IN ('individual', 'family', 'employee_plus_one')),
  "coverage_details" JSONB,
  "employer_cost" NUMERIC(12, 2) DEFAULT '0',
  "employee_cost" NUMERIC(12, 2) DEFAULT '0',
  "total_cost" NUMERIC(12, 2) DEFAULT '0',
  "frequency" TEXT DEFAULT 'per_paycheck' CHECK ("frequency" IN ('per_paycheck', 'monthly', 'yearly')),
  "enrollment_date" TIMESTAMP WITH TIME ZONE,
  "effective_date" TIMESTAMP WITH TIME ZONE,
  "end_date" TIMESTAMP WITH TIME ZONE,
  "is_active" BOOLEAN DEFAULT true,
  "status" TEXT DEFAULT 'enrolled' CHECK ("status" IN ('enrolled', 'pending', 'cancelled', 'terminated')),
  "provider" TEXT,
  "policy_number" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "payroll_benefits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "payroll_benefits_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "payroll_benefits_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE CASCADE
);

-- Indexes for Payroll Runs
CREATE INDEX IF NOT EXISTS "payroll_runs_organization_id_idx" ON "payroll_runs"("organization_id");
CREATE INDEX IF NOT EXISTS "payroll_runs_status_idx" ON "payroll_runs"("status");
CREATE INDEX IF NOT EXISTS "payroll_runs_pay_period_start_idx" ON "payroll_runs"("pay_period_start");
CREATE INDEX IF NOT EXISTS "payroll_runs_pay_period_end_idx" ON "payroll_runs"("pay_period_end");
CREATE INDEX IF NOT EXISTS "payroll_runs_pay_date_idx" ON "payroll_runs"("pay_date");

-- Indexes for Payroll Entries
CREATE INDEX IF NOT EXISTS "payroll_entries_payroll_run_id_idx" ON "payroll_entries"("payroll_run_id");
CREATE INDEX IF NOT EXISTS "payroll_entries_employee_id_idx" ON "payroll_entries"("employee_id");
CREATE INDEX IF NOT EXISTS "payroll_entries_contractor_id_idx" ON "payroll_entries"("contractor_id");
CREATE INDEX IF NOT EXISTS "payroll_entries_status_idx" ON "payroll_entries"("status");

-- Indexes for Payroll Deductions
CREATE INDEX IF NOT EXISTS "payroll_deductions_organization_id_idx" ON "payroll_deductions"("organization_id");
CREATE INDEX IF NOT EXISTS "payroll_deductions_employee_id_idx" ON "payroll_deductions"("employee_id");
CREATE INDEX IF NOT EXISTS "payroll_deductions_contractor_id_idx" ON "payroll_deductions"("contractor_id");
CREATE INDEX IF NOT EXISTS "payroll_deductions_type_idx" ON "payroll_deductions"("type");
CREATE INDEX IF NOT EXISTS "payroll_deductions_is_active_idx" ON "payroll_deductions"("is_active");

-- Indexes for Payroll Taxes
CREATE INDEX IF NOT EXISTS "payroll_taxes_organization_id_idx" ON "payroll_taxes"("organization_id");
CREATE INDEX IF NOT EXISTS "payroll_taxes_type_idx" ON "payroll_taxes"("type");
CREATE INDEX IF NOT EXISTS "payroll_taxes_is_active_idx" ON "payroll_taxes"("is_active");

-- Indexes for Payroll Benefits
CREATE INDEX IF NOT EXISTS "payroll_benefits_organization_id_idx" ON "payroll_benefits"("organization_id");
CREATE INDEX IF NOT EXISTS "payroll_benefits_employee_id_idx" ON "payroll_benefits"("employee_id");
CREATE INDEX IF NOT EXISTS "payroll_benefits_contractor_id_idx" ON "payroll_benefits"("contractor_id");
CREATE INDEX IF NOT EXISTS "payroll_benefits_type_idx" ON "payroll_benefits"("type");
CREATE INDEX IF NOT EXISTS "payroll_benefits_status_idx" ON "payroll_benefits"("status");

-- Enable RLS
ALTER TABLE "payroll_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_deductions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_taxes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_benefits" ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic structure)
CREATE POLICY "payroll_runs_select_policy" ON "payroll_runs"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_runs_insert_policy" ON "payroll_runs"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_runs_update_policy" ON "payroll_runs"
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_runs_delete_policy" ON "payroll_runs"
  FOR DELETE USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

-- Similar policies for other payroll tables (entries, deductions, taxes, benefits)
CREATE POLICY "payroll_entries_select_policy" ON "payroll_entries"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "payroll_runs" 
      WHERE "payroll_runs"."id" = "payroll_entries"."payroll_run_id"
      AND "payroll_runs"."organization_id" = current_setting('app.current_org_id', true)::UUID
    )
  );

CREATE POLICY "payroll_entries_insert_policy" ON "payroll_entries"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM "payroll_runs" 
      WHERE "payroll_runs"."id" = "payroll_entries"."payroll_run_id"
      AND "payroll_runs"."organization_id" = current_setting('app.current_org_id', true)::UUID
    )
  );

CREATE POLICY "payroll_deductions_select_policy" ON "payroll_deductions"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_deductions_insert_policy" ON "payroll_deductions"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_taxes_select_policy" ON "payroll_taxes"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_taxes_insert_policy" ON "payroll_taxes"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_benefits_select_policy" ON "payroll_benefits"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "payroll_benefits_insert_policy" ON "payroll_benefits"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

-- Comments for documentation
COMMENT ON TABLE "payroll_runs" IS 'Payroll processing runs for batch processing';
COMMENT ON TABLE "payroll_entries" IS 'Individual payroll entries for employees and contractors';
COMMENT ON TABLE "payroll_deductions" IS 'Payroll deduction definitions and configurations';
COMMENT ON TABLE "payroll_taxes" IS 'Tax configuration and rates for payroll calculations';
COMMENT ON TABLE "payroll_benefits" IS 'Employee and contractor benefits management';

