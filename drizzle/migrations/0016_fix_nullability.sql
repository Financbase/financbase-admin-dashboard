-- Migration: Fix Nullability Issues
-- Description: Fix required fields that are currently nullable
-- Note: This migration may fail if NULL values exist in the database. Clean up data first if needed.

-- Fix organization_members - both should be NOT NULL
ALTER TABLE "organization_members" 
  ALTER COLUMN "organization_id" SET NOT NULL,
  ALTER COLUMN "user_id" SET NOT NULL;

-- Fix invoice_items - invoice_id should be NOT NULL
ALTER TABLE "invoice_items" 
  ALTER COLUMN "invoice_id" SET NOT NULL;

-- Fix invoices - user_id should be NOT NULL (if it was added in a later migration)
-- Note: Check if column exists and is nullable first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'user_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "invoices" ALTER COLUMN "user_id" SET NOT NULL;
  END IF;
END $$;

-- Fix expenses - user_id should be NOT NULL (if it was added in a later migration)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' AND column_name = 'user_id' AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE "expenses" ALTER COLUMN "user_id" SET NOT NULL;
  END IF;
END $$;

