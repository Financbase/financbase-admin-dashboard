-- Migration: Tax Management System
-- Created: 2025-01-28
-- Description: Database schema for comprehensive tax management system

-- Create ENUM types
DO $$ BEGIN
 CREATE TYPE "tax_obligation_type" AS ENUM('federal_income', 'state_income', 'local_income', 'self_employment', 'sales_tax', 'property_tax', 'payroll_tax', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "tax_obligation_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 CREATE TYPE "tax_document_type" AS ENUM('w2', '1099', 'tax_return', 'receipt', 'invoice', 'expense_report', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Tax Obligations Table
CREATE TABLE IF NOT EXISTS "tax_obligations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "tax_obligation_type" NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "due_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "status" "tax_obligation_status" NOT NULL DEFAULT 'pending',
  "quarter" TEXT,
  "year" INTEGER NOT NULL,
  "paid" NUMERIC(12, 2) DEFAULT '0',
  "payment_date" TIMESTAMP WITH TIME ZONE,
  "payment_method" TEXT,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Deductions Table
CREATE TABLE IF NOT EXISTS "tax_deductions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" NUMERIC(12, 2) NOT NULL,
  "percentage" NUMERIC(5, 2),
  "transaction_count" INTEGER DEFAULT 0,
  "year" INTEGER NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tax Documents Table
CREATE TABLE IF NOT EXISTS "tax_documents" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "tax_document_type" NOT NULL,
  "year" INTEGER NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size" INTEGER,
  "file_name" TEXT,
  "mime_type" TEXT,
  "description" TEXT,
  "metadata" JSONB,
  "uploaded_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "tax_obligations_user_id_idx" ON "tax_obligations"("user_id");
CREATE INDEX IF NOT EXISTS "tax_obligations_year_idx" ON "tax_obligations"("year");
CREATE INDEX IF NOT EXISTS "tax_obligations_status_idx" ON "tax_obligations"("status");
CREATE INDEX IF NOT EXISTS "tax_obligations_due_date_idx" ON "tax_obligations"("due_date");
CREATE INDEX IF NOT EXISTS "tax_obligations_type_idx" ON "tax_obligations"("type");

CREATE INDEX IF NOT EXISTS "tax_deductions_user_id_idx" ON "tax_deductions"("user_id");
CREATE INDEX IF NOT EXISTS "tax_deductions_year_idx" ON "tax_deductions"("year");
CREATE INDEX IF NOT EXISTS "tax_deductions_category_idx" ON "tax_deductions"("category");

CREATE INDEX IF NOT EXISTS "tax_documents_user_id_idx" ON "tax_documents"("user_id");
CREATE INDEX IF NOT EXISTS "tax_documents_year_idx" ON "tax_documents"("year");
CREATE INDEX IF NOT EXISTS "tax_documents_type_idx" ON "tax_documents"("type");

-- Add comments for documentation
COMMENT ON TABLE "tax_obligations" IS 'Track tax obligations (Federal Income, State Income, Self-Employment, Sales Tax, etc.)';
COMMENT ON TABLE "tax_deductions" IS 'Track tax deduction categories and amounts';
COMMENT ON TABLE "tax_documents" IS 'Store tax document references';

