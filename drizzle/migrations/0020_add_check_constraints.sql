-- Migration: Add Check Constraints
-- Description: Add business rule validations using check constraints

-- Invoices: total should be >= 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_total_non_negative'
  ) THEN
    ALTER TABLE "invoices" 
      ADD CONSTRAINT "invoices_total_non_negative" 
      CHECK ("total" >= 0);
  END IF;
END $$;

-- Expenses: amount should be > 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expenses_amount_positive'
  ) THEN
    ALTER TABLE "expenses" 
      ADD CONSTRAINT "expenses_amount_positive" 
      CHECK ("amount" > 0);
  END IF;
END $$;

-- Transactions: amount should not be 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_amount_non_zero'
  ) THEN
    ALTER TABLE "transactions" 
      ADD CONSTRAINT "transactions_amount_non_zero" 
      CHECK ("amount" != 0);
  END IF;
END $$;

-- Payments: amount should be > 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_amount_positive'
  ) THEN
    ALTER TABLE "payments" 
      ADD CONSTRAINT "payments_amount_positive" 
      CHECK ("amount" > 0);
  END IF;
END $$;

-- Payments: net_amount should be >= 0
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_net_amount_non_negative'
  ) THEN
    ALTER TABLE "payments" 
      ADD CONSTRAINT "payments_net_amount_non_negative" 
      CHECK ("net_amount" >= 0);
  END IF;
END $$;

-- Time entries: duration should be >= 0 if not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_duration_non_negative'
  ) THEN
    ALTER TABLE "time_entries" 
      ADD CONSTRAINT "time_entries_duration_non_negative" 
      CHECK ("duration" IS NULL OR "duration" >= 0);
  END IF;
END $$;

-- Time entries: end_time should be after start_time if both exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'time_entries_end_after_start'
  ) THEN
    ALTER TABLE "time_entries" 
      ADD CONSTRAINT "time_entries_end_after_start" 
      CHECK ("end_time" IS NULL OR "start_time" IS NULL OR "end_time" >= "start_time");
  END IF;
END $$;

-- Projects: progress should be between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'projects_progress_range'
  ) THEN
    ALTER TABLE "projects" 
      ADD CONSTRAINT "projects_progress_range" 
      CHECK ("progress" >= 0 AND "progress" <= 100);
  END IF;
END $$;

-- Tasks: progress should be between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tasks_progress_range'
  ) THEN
    ALTER TABLE "tasks" 
      ADD CONSTRAINT "tasks_progress_range" 
      CHECK ("progress" >= 0 AND "progress" <= 100);
  END IF;
END $$;

-- Campaigns: daily_budget should be <= budget if both exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'campaigns_daily_budget_within_budget'
  ) THEN
    ALTER TABLE "campaigns" 
      ADD CONSTRAINT "campaigns_daily_budget_within_budget" 
      CHECK ("daily_budget" IS NULL OR "budget" IS NULL OR "daily_budget" <= "budget");
  END IF;
END $$;

-- Leads: probability should be between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_probability_range'
  ) THEN
    ALTER TABLE "leads" 
      ADD CONSTRAINT "leads_probability_range" 
      CHECK ("probability" >= 0 AND "probability" <= 100);
  END IF;
END $$;

-- Accounts: current_balance should be valid (not null constraint handled elsewhere)
-- Note: We don't add a check constraint here as balances can be negative for credit accounts

