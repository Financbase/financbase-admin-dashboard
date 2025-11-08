-- Migration: Add Tax Payments Table and Constraints
-- Created: 2025-01-28
-- Description: Adds tax_payments table for payment history and adds database constraints

-- Tax Payments Table
CREATE TABLE IF NOT EXISTS "tax_payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" TEXT NOT NULL,
  "obligation_id" UUID REFERENCES "tax_obligations"("id") ON DELETE CASCADE,
  "amount" NUMERIC(12, 2) NOT NULL,
  "payment_date" TIMESTAMP WITH TIME ZONE NOT NULL,
  "payment_method" TEXT,
  "reference" TEXT,
  "quarter" INTEGER,
  "year" INTEGER NOT NULL,
  "notes" TEXT,
  "metadata" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add indexes for tax_payments
CREATE INDEX IF NOT EXISTS "idx_tax_payments_user_id" ON "tax_payments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_tax_payments_obligation_id" ON "tax_payments"("obligation_id");
CREATE INDEX IF NOT EXISTS "idx_tax_payments_year" ON "tax_payments"("year");
CREATE INDEX IF NOT EXISTS "idx_tax_payments_payment_date" ON "tax_payments"("payment_date");

-- Add foreign key constraints (if users table exists)
-- Note: Adjust based on actual users table structure
DO $$ 
BEGIN
  -- Add foreign key to users table if it exists and has id column
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_tax_obligations_user' 
      AND table_name = 'tax_obligations'
    ) THEN
      ALTER TABLE "tax_obligations" 
      ADD CONSTRAINT "fk_tax_obligations_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_tax_deductions_user' 
      AND table_name = 'tax_deductions'
    ) THEN
      ALTER TABLE "tax_deductions" 
      ADD CONSTRAINT "fk_tax_deductions_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_tax_documents_user' 
      AND table_name = 'tax_documents'
    ) THEN
      ALTER TABLE "tax_documents" 
      ADD CONSTRAINT "fk_tax_documents_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'fk_tax_payments_user' 
      AND table_name = 'tax_payments'
    ) THEN
      ALTER TABLE "tax_payments" 
      ADD CONSTRAINT "fk_tax_payments_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Add check constraints
DO $$ 
BEGIN
  -- Check constraint: paid <= amount on tax_obligations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_obligations_paid_not_exceed_amount' 
    AND table_name = 'tax_obligations'
  ) THEN
    ALTER TABLE "tax_obligations" 
    ADD CONSTRAINT "chk_tax_obligations_paid_not_exceed_amount" 
    CHECK ("paid" <= "amount");
  END IF;

  -- Check constraint: amount > 0 on tax_obligations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_obligations_amount_positive' 
    AND table_name = 'tax_obligations'
  ) THEN
    ALTER TABLE "tax_obligations" 
    ADD CONSTRAINT "chk_tax_obligations_amount_positive" 
    CHECK ("amount" > 0);
  END IF;

  -- Check constraint: amount > 0 on tax_deductions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_deductions_amount_positive' 
    AND table_name = 'tax_deductions'
  ) THEN
    ALTER TABLE "tax_deductions" 
    ADD CONSTRAINT "chk_tax_deductions_amount_positive" 
    CHECK ("amount" > 0);
  END IF;

  -- Check constraint: percentage >= 0 AND percentage <= 100 on tax_deductions
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_deductions_percentage_range' 
    AND table_name = 'tax_deductions'
  ) THEN
    ALTER TABLE "tax_deductions" 
    ADD CONSTRAINT "chk_tax_deductions_percentage_range" 
    CHECK ("percentage" IS NULL OR ("percentage" >= 0 AND "percentage" <= 100));
  END IF;

  -- Check constraint: amount > 0 on tax_payments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_payments_amount_positive' 
    AND table_name = 'tax_payments'
  ) THEN
    ALTER TABLE "tax_payments" 
    ADD CONSTRAINT "chk_tax_payments_amount_positive" 
    CHECK ("amount" > 0);
  END IF;

  -- Check constraint: quarter between 1 and 4 on tax_payments
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chk_tax_payments_quarter_range' 
    AND table_name = 'tax_payments'
  ) THEN
    ALTER TABLE "tax_payments" 
    ADD CONSTRAINT "chk_tax_payments_quarter_range" 
    CHECK ("quarter" IS NULL OR ("quarter" >= 1 AND "quarter" <= 4));
  END IF;
END $$;

-- Add unique constraint for quarterly obligations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_unique_quarterly_obligation'
  ) THEN
    CREATE UNIQUE INDEX "idx_unique_quarterly_obligation" 
    ON "tax_obligations"("user_id", "type", "quarter", "year") 
    WHERE "quarter" IS NOT NULL;
  END IF;
END $$;

