-- Migration: Add Soft Delete Support to Tax Tables
-- Created: 2025-01-XX
-- Description: Adds deletedAt columns to tax tables for soft delete functionality

-- Add deletedAt column to tax_obligations
ALTER TABLE "tax_obligations"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE;

-- Add deletedAt column to tax_deductions
ALTER TABLE "tax_deductions"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE;

-- Add deletedAt column to tax_documents
ALTER TABLE "tax_documents"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE;

-- Add deletedAt column to tax_payments
ALTER TABLE "tax_payments"
ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP WITH TIME ZONE;

-- Create indexes for soft delete queries (filtering by deletedAt IS NULL)
CREATE INDEX IF NOT EXISTS "tax_obligations_deleted_at_idx" ON "tax_obligations"("deleted_at") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "tax_deductions_deleted_at_idx" ON "tax_deductions"("deleted_at") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "tax_documents_deleted_at_idx" ON "tax_documents"("deleted_at") WHERE "deleted_at" IS NULL;
CREATE INDEX IF NOT EXISTS "tax_payments_deleted_at_idx" ON "tax_payments"("deleted_at") WHERE "deleted_at" IS NULL;

