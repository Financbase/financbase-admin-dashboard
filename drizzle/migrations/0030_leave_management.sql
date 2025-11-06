-- Migration: Leave Management System
-- Created: 2025-01-28
-- Description: Database schema for leave management system

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "leave_type_category" AS ENUM('vacation', 'sick_leave', 'personal', 'fmla', 'bereavement', 'jury_duty', 'military', 'unpaid', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "leave_request_status" AS ENUM('pending', 'approved', 'rejected', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "accrual_method" AS ENUM('none', 'fixed', 'per_hour', 'per_week', 'per_month', 'per_year', 'proportional');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Leave Types Table
CREATE TABLE IF NOT EXISTS "leave_types" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "category" "leave_type_category" NOT NULL,
  "description" TEXT,
  "accrual_method" "accrual_method" DEFAULT 'none',
  "accrual_rate" NUMERIC(8, 2),
  "accrual_period" TEXT CHECK ("accrual_period" IN ('hourly', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  "max_accrual" NUMERIC(8, 2),
  "initial_balance" NUMERIC(8, 2) DEFAULT '0',
  "allow_carryover" BOOLEAN DEFAULT false,
  "max_carryover" NUMERIC(8, 2),
  "carryover_expiry_date" TIMESTAMP WITH TIME ZONE,
  "min_increment" NUMERIC(8, 2),
  "requires_approval" BOOLEAN DEFAULT true,
  "advance_notice_days" INTEGER,
  "is_active" BOOLEAN DEFAULT true,
  "color" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "leave_types_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Leave Balances Table
CREATE TABLE IF NOT EXISTS "leave_balances" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" UUID NOT NULL,
  "leave_type_id" UUID NOT NULL,
  "current_balance" NUMERIC(8, 2) NOT NULL DEFAULT '0',
  "accrued" NUMERIC(8, 2) DEFAULT '0',
  "used" NUMERIC(8, 2) DEFAULT '0',
  "pending" NUMERIC(8, 2) DEFAULT '0',
  "carryover" NUMERIC(8, 2) DEFAULT '0',
  "period_start" TIMESTAMP WITH TIME ZONE,
  "period_end" TIMESTAMP WITH TIME ZONE,
  "last_accrual_date" TIMESTAMP WITH TIME ZONE,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE
);

-- Leave Requests Table
CREATE TABLE IF NOT EXISTS "leave_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" UUID NOT NULL,
  "leave_type_id" UUID NOT NULL,
  "organization_id" UUID NOT NULL,
  "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "duration" NUMERIC(8, 2) NOT NULL,
  "duration_unit" TEXT DEFAULT 'hours' CHECK ("duration_unit" IN ('hours', 'days')),
  "reason" TEXT,
  "notes" TEXT,
  "status" "leave_request_status" NOT NULL DEFAULT 'pending',
  "requested_by" TEXT NOT NULL,
  "requested_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "approved_by" TEXT,
  "approved_at" TIMESTAMP WITH TIME ZONE,
  "rejected_by" TEXT,
  "rejected_at" TIMESTAMP WITH TIME ZONE,
  "rejection_reason" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT,
  CONSTRAINT "leave_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Indexes for Leave Types
CREATE INDEX IF NOT EXISTS "leave_types_organization_id_idx" ON "leave_types"("organization_id");
CREATE INDEX IF NOT EXISTS "leave_types_category_idx" ON "leave_types"("category");
CREATE INDEX IF NOT EXISTS "leave_types_is_active_idx" ON "leave_types"("is_active");

-- Indexes for Leave Balances
CREATE INDEX IF NOT EXISTS "leave_balances_employee_id_idx" ON "leave_balances"("employee_id");
CREATE INDEX IF NOT EXISTS "leave_balances_leave_type_id_idx" ON "leave_balances"("leave_type_id");
CREATE UNIQUE INDEX IF NOT EXISTS "leave_balances_employee_leave_type_unique" ON "leave_balances"("employee_id", "leave_type_id");

-- Indexes for Leave Requests
CREATE INDEX IF NOT EXISTS "leave_requests_employee_id_idx" ON "leave_requests"("employee_id");
CREATE INDEX IF NOT EXISTS "leave_requests_leave_type_id_idx" ON "leave_requests"("leave_type_id");
CREATE INDEX IF NOT EXISTS "leave_requests_organization_id_idx" ON "leave_requests"("organization_id");
CREATE INDEX IF NOT EXISTS "leave_requests_status_idx" ON "leave_requests"("status");
CREATE INDEX IF NOT EXISTS "leave_requests_start_date_idx" ON "leave_requests"("start_date");
CREATE INDEX IF NOT EXISTS "leave_requests_end_date_idx" ON "leave_requests"("end_date");

-- Enable RLS
ALTER TABLE "leave_types" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_balances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "leave_requests" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "leave_types_select_policy" ON "leave_types"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "leave_types_insert_policy" ON "leave_types"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "leave_balances_select_policy" ON "leave_balances"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM "employees" 
      WHERE "employees"."id" = "leave_balances"."employee_id"
      AND "employees"."organization_id" = current_setting('app.current_org_id', true)::UUID
    )
  );

CREATE POLICY "leave_requests_select_policy" ON "leave_requests"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "leave_requests_insert_policy" ON "leave_requests"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "leave_requests_update_policy" ON "leave_requests"
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

-- Comments for documentation
COMMENT ON TABLE "leave_types" IS 'Leave type definitions with accrual rules';
COMMENT ON TABLE "leave_balances" IS 'Employee leave balances tracking';
COMMENT ON TABLE "leave_requests" IS 'Leave request submissions and approvals';

