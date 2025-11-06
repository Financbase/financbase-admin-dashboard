-- Migration: Enhance Employees and Time Tracking Tables
-- Created: 2025-01-28
-- Description: Add payroll integration, leave balance tracking, and attendance flags to employees table. Enhance time_entries with employee/contractor linking.

-- ============================================
-- ENHANCE EMPLOYEES TABLE
-- ============================================

-- Add payroll integration fields
ALTER TABLE "employees" 
  ADD COLUMN IF NOT EXISTS "is_payroll_enabled" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "payroll_employee_id" TEXT,
  ADD COLUMN IF NOT EXISTS "last_payroll_sync" TIMESTAMP WITH TIME ZONE;

-- Add leave balance tracking
ALTER TABLE "employees"
  ADD COLUMN IF NOT EXISTS "total_leave_balance" NUMERIC(8, 2) DEFAULT '0',
  ADD COLUMN IF NOT EXISTS "last_leave_accrual" TIMESTAMP WITH TIME ZONE;

-- Add attendance tracking fields
ALTER TABLE "employees"
  ADD COLUMN IF NOT EXISTS "is_attendance_tracked" BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "attendance_method" TEXT DEFAULT 'clock' CHECK ("attendance_method" IN ('clock', 'manual', 'hybrid')),
  ADD COLUMN IF NOT EXISTS "default_work_hours" NUMERIC(8, 2) DEFAULT '8',
  ADD COLUMN IF NOT EXISTS "overtime_threshold" NUMERIC(8, 2) DEFAULT '40';

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS "employees_is_payroll_enabled_idx" ON "employees"("is_payroll_enabled");
CREATE INDEX IF NOT EXISTS "employees_is_attendance_tracked_idx" ON "employees"("is_attendance_tracked");

-- ============================================
-- ENHANCE TIME_ENTRIES TABLE
-- ============================================

-- Add employee/contractor linking
ALTER TABLE "time_entries"
  ADD COLUMN IF NOT EXISTS "employee_id" UUID,
  ADD COLUMN IF NOT EXISTS "contractor_id" UUID;

-- Add project/task assignment
ALTER TABLE "time_entries"
  ADD COLUMN IF NOT EXISTS "task_id" UUID,
  ADD COLUMN IF NOT EXISTS "task_name" TEXT;

-- Make project_id nullable (was NOT NULL before)
ALTER TABLE "time_entries"
  ALTER COLUMN "project_id" DROP NOT NULL;

-- Change tags and metadata from TEXT to JSONB
ALTER TABLE "time_entries"
  ALTER COLUMN "tags" TYPE JSONB USING CASE WHEN "tags" IS NULL THEN NULL ELSE "tags"::JSONB END,
  ALTER COLUMN "metadata" TYPE JSONB USING CASE WHEN "metadata" IS NULL THEN NULL ELSE "metadata"::JSONB END;

-- Update timestamp columns to include timezone
ALTER TABLE "time_entries"
  ALTER COLUMN "start_time" TYPE TIMESTAMP WITH TIME ZONE USING "start_time"::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "end_time" TYPE TIMESTAMP WITH TIME ZONE USING "end_time"::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "approved_at" TYPE TIMESTAMP WITH TIME ZONE USING "approved_at"::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "billed_at" TYPE TIMESTAMP WITH TIME ZONE USING "billed_at"::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "created_at" TYPE TIMESTAMP WITH TIME ZONE USING "created_at"::TIMESTAMP WITH TIME ZONE,
  ALTER COLUMN "updated_at" TYPE TIMESTAMP WITH TIME ZONE USING "updated_at"::TIMESTAMP WITH TIME ZONE;

-- Add foreign keys
ALTER TABLE "time_entries"
  ADD CONSTRAINT "time_entries_employee_id_fkey" 
    FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL;

ALTER TABLE "time_entries"
  ADD CONSTRAINT "time_entries_contractor_id_fkey" 
    FOREIGN KEY ("contractor_id") REFERENCES "hr_contractors"("id") ON DELETE SET NULL;

-- Indexes for new fields
CREATE INDEX IF NOT EXISTS "time_entries_employee_id_idx" ON "time_entries"("employee_id");
CREATE INDEX IF NOT EXISTS "time_entries_contractor_id_idx" ON "time_entries"("contractor_id");
CREATE INDEX IF NOT EXISTS "time_entries_task_id_idx" ON "time_entries"("task_id");

-- Comments for documentation
COMMENT ON COLUMN "employees"."is_payroll_enabled" IS 'Whether payroll processing is enabled for this employee';
COMMENT ON COLUMN "employees"."payroll_employee_id" IS 'External payroll system employee ID';
COMMENT ON COLUMN "employees"."total_leave_balance" IS 'Total leave balance across all leave types';
COMMENT ON COLUMN "employees"."is_attendance_tracked" IS 'Whether attendance tracking is enabled';
COMMENT ON COLUMN "employees"."attendance_method" IS 'Method of attendance tracking: clock, manual, or hybrid';
COMMENT ON COLUMN "employees"."default_work_hours" IS 'Default work hours per day';
COMMENT ON COLUMN "employees"."overtime_threshold" IS 'Hours per week threshold for overtime calculation';

COMMENT ON COLUMN "time_entries"."employee_id" IS 'Link to employee if this is an employee time entry';
COMMENT ON COLUMN "time_entries"."contractor_id" IS 'Link to contractor if this is a contractor time entry';
COMMENT ON COLUMN "time_entries"."task_id" IS 'Task ID if tracking time for a specific task';
COMMENT ON COLUMN "time_entries"."task_name" IS 'Task name for quick reference';

