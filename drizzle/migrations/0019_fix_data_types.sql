-- Migration: Fix Data Type Inconsistencies
-- Description: Convert text dates to timestamp/date and text metadata to jsonb

-- Fix expenses.expense_date from text to timestamp
DO $$
BEGIN
  -- Check if expense_date column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' 
    AND column_name = 'expense_date' 
    AND data_type = 'text'
  ) THEN
    -- Convert text dates to timestamp
    -- Handle various date formats that might exist
    ALTER TABLE "expenses" 
      ALTER COLUMN "expense_date" TYPE timestamp 
      USING CASE 
        WHEN expense_date ~ '^\d{4}-\d{2}-\d{2}$' THEN expense_date::date::timestamp
        WHEN expense_date ~ '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}' THEN expense_date::timestamp
        WHEN expense_date ~ '^\d{10}$' THEN to_timestamp(expense_date::bigint)
        WHEN expense_date ~ '^\d{13}$' THEN to_timestamp(expense_date::bigint / 1000)
        ELSE NULL
      END;
  END IF;
END $$;

-- Convert metadata fields from text to jsonb where appropriate
-- invoices.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "invoices" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "invoices" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- expenses.metadata (if it exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'expenses' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "expenses" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "expenses" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- transactions.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "transactions" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "transactions" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- accounts.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'accounts' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "accounts" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "accounts" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- payment_methods.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_methods' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "payment_methods" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "payment_methods" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- payments.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "payments" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "payments" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- projects.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "projects" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "projects" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

-- activities.metadata
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'activities' 
    AND column_name = 'metadata' 
    AND data_type = 'text'
  ) THEN
    -- First, ensure all text values are valid JSON or NULL
    UPDATE "activities" 
    SET "metadata" = NULL 
    WHERE "metadata" IS NOT NULL 
    AND NOT ("metadata" ~ '^[\s]*(\{|\[)');
    
    -- Convert to jsonb
    ALTER TABLE "activities" 
      ALTER COLUMN "metadata" TYPE jsonb 
      USING CASE 
        WHEN metadata IS NULL THEN NULL
        WHEN metadata = '' THEN NULL
        ELSE metadata::jsonb
      END;
  END IF;
END $$;

