-- Migration: Attendance System
-- Created: 2025-01-28
-- Description: Database schema for attendance tracking and time cards

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "attendance_status" AS ENUM('present', 'absent', 'late', 'early_leave', 'half_day', 'on_leave');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "clock_method" AS ENUM('web', 'mobile', 'kiosk', 'biometric', 'api', 'manual');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "time_card_status" AS ENUM('draft', 'submitted', 'approved', 'rejected', 'paid');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Attendance Records Table
CREATE TABLE IF NOT EXISTS "attendance_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" UUID,
  "contractor_id" UUID,
  "organization_id" UUID NOT NULL,
  "clock_in_time" TIMESTAMP WITH TIME ZONE,
  "clock_out_time" TIMESTAMP WITH TIME ZONE,
  "date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "duration" NUMERIC(8, 2),
  "break_duration" NUMERIC(8, 2) DEFAULT '0',
  "overtime_duration" NUMERIC(8, 2) DEFAULT '0',
  "status" "attendance_status" DEFAULT 'present',
  "clock_in_location" JSONB,
  "clock_out_location" JSONB,
  "clock_in_method" "clock_method" DEFAULT 'web',
  "clock_out_method" "clock_method" DEFAULT 'web',
  "time_card_id" UUID,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "attendance_records_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE CASCADE,
  CONSTRAINT "attendance_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "attendance_records_employee_or_contractor_check" CHECK (
    ("employee_id" IS NOT NULL AND "contractor_id" IS NULL) OR
    ("employee_id" IS NULL AND "contractor_id" IS NOT NULL)
  )
);

-- Time Cards Table
CREATE TABLE IF NOT EXISTS "time_cards" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "employee_id" UUID,
  "contractor_id" UUID,
  "organization_id" UUID NOT NULL,
  "payroll_run_id" UUID,
  "pay_period_start" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_period_end" TIMESTAMP WITH TIME ZONE NOT NULL,
  "pay_frequency" TEXT NOT NULL CHECK ("pay_frequency" IN ('weekly', 'biweekly', 'semimonthly', 'monthly')),
  "total_hours" NUMERIC(8, 2) DEFAULT '0',
  "regular_hours" NUMERIC(8, 2) DEFAULT '0',
  "overtime_hours" NUMERIC(8, 2) DEFAULT '0',
  "break_hours" NUMERIC(8, 2) DEFAULT '0',
  "days_present" INTEGER DEFAULT 0,
  "days_absent" INTEGER DEFAULT 0,
  "days_late" INTEGER DEFAULT 0,
  "days_on_leave" INTEGER DEFAULT 0,
  "status" "time_card_status" NOT NULL DEFAULT 'draft',
  "submitted_by" TEXT,
  "submitted_at" TIMESTAMP WITH TIME ZONE,
  "approved_by" TEXT,
  "approved_at" TIMESTAMP WITH TIME ZONE,
  "rejected_by" TEXT,
  "rejected_at" TIMESTAMP WITH TIME ZONE,
  "rejection_reason" TEXT,
  "attendance_record_ids" JSONB,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "time_cards_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE,
  CONSTRAINT "time_cards_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE CASCADE,
  CONSTRAINT "time_cards_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "time_cards_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE SET NULL,
  CONSTRAINT "time_cards_employee_or_contractor_check" CHECK (
    ("employee_id" IS NOT NULL AND "contractor_id" IS NULL) OR
    ("employee_id" IS NULL AND "contractor_id" IS NOT NULL)
  )
);

-- Add foreign key for time_card_id in attendance_records
ALTER TABLE "attendance_records" 
  ADD CONSTRAINT "attendance_records_time_card_id_fkey" 
  FOREIGN KEY ("time_card_id") REFERENCES "time_cards"("id") ON DELETE SET NULL;

-- Indexes for Attendance Records
CREATE INDEX IF NOT EXISTS "attendance_records_employee_id_idx" ON "attendance_records"("employee_id");
CREATE INDEX IF NOT EXISTS "attendance_records_contractor_id_idx" ON "attendance_records"("contractor_id");
CREATE INDEX IF NOT EXISTS "attendance_records_organization_id_idx" ON "attendance_records"("organization_id");
CREATE INDEX IF NOT EXISTS "attendance_records_date_idx" ON "attendance_records"("date");
CREATE INDEX IF NOT EXISTS "attendance_records_status_idx" ON "attendance_records"("status");
CREATE INDEX IF NOT EXISTS "attendance_records_time_card_id_idx" ON "attendance_records"("time_card_id");

-- Indexes for Time Cards
CREATE INDEX IF NOT EXISTS "time_cards_employee_id_idx" ON "time_cards"("employee_id");
CREATE INDEX IF NOT EXISTS "time_cards_contractor_id_idx" ON "time_cards"("contractor_id");
CREATE INDEX IF NOT EXISTS "time_cards_organization_id_idx" ON "time_cards"("organization_id");
CREATE INDEX IF NOT EXISTS "time_cards_payroll_run_id_idx" ON "time_cards"("payroll_run_id");
CREATE INDEX IF NOT EXISTS "time_cards_status_idx" ON "time_cards"("status");
CREATE INDEX IF NOT EXISTS "time_cards_pay_period_start_idx" ON "time_cards"("pay_period_start");
CREATE INDEX IF NOT EXISTS "time_cards_pay_period_end_idx" ON "time_cards"("pay_period_end");

-- Enable RLS
ALTER TABLE "attendance_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_cards" ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "attendance_records_select_policy" ON "attendance_records"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "attendance_records_insert_policy" ON "attendance_records"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "attendance_records_update_policy" ON "attendance_records"
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "time_cards_select_policy" ON "time_cards"
  FOR SELECT USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "time_cards_insert_policy" ON "time_cards"
  FOR INSERT WITH CHECK ("organization_id" = current_setting('app.current_org_id', true)::UUID);

CREATE POLICY "time_cards_update_policy" ON "time_cards"
  FOR UPDATE USING ("organization_id" = current_setting('app.current_org_id', true)::UUID);

-- Comments for documentation
COMMENT ON TABLE "attendance_records" IS 'Individual clock in/out records for attendance tracking';
COMMENT ON TABLE "time_cards" IS 'Weekly/bi-weekly time cards aggregating attendance records';

