-- Migration: Fix Transaction Category Enum Usage
-- Description: Update transactions.category to use the transaction_category enum type

-- First, check if the enum exists and if there are any values in the category column that don't match the enum
-- Update the category column to use the enum type
-- Note: This will fail if there are values in the category column that don't match the enum values

DO $$
BEGIN
  -- Check if the enum type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_category') THEN
    -- Check if column exists and is not already using the enum
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'transactions' 
      AND column_name = 'category' 
      AND data_type != 'USER-DEFINED'
    ) THEN
      -- Update the column type to use the enum
      -- First, ensure all existing values are valid enum values or NULL
      UPDATE "transactions" 
      SET "category" = NULL 
      WHERE "category" IS NOT NULL 
      AND "category" NOT IN ('income', 'expense', 'transfer', 'refund', 'fee', 'tax', 'payroll', 'office', 'marketing', 'software', 'utilities', 'travel', 'other');
      
      -- Convert the column to use the enum type
      ALTER TABLE "transactions" 
        ALTER COLUMN "category" TYPE "transaction_category" 
        USING "category"::"transaction_category";
    END IF;
  ELSE
    RAISE NOTICE 'Enum type transaction_category does not exist. Skipping migration.';
  END IF;
END $$;

