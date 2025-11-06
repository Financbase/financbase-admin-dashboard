-- Migration: Add Missing Unique Constraints
-- Description: Add unique constraints where business logic requires uniqueness

-- Transactions: transaction_number should be unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'transactions_transaction_number_unique'
  ) THEN
    -- First, ensure there are no duplicates
    -- If duplicates exist, we'll need to handle them
    -- For now, we'll add the constraint and let it fail if duplicates exist
    ALTER TABLE "transactions" 
      ADD CONSTRAINT "transactions_transaction_number_unique" 
      UNIQUE ("transaction_number");
  END IF;
END $$;

-- Accounts: user_id + account_name combination should be unique (one account name per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'accounts_user_account_name_unique'
  ) THEN
    ALTER TABLE "accounts" 
      ADD CONSTRAINT "accounts_user_account_name_unique" 
      UNIQUE ("user_id", "account_name");
  END IF;
END $$;

-- Payment methods: user_id + name combination should be unique (one payment method name per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payment_methods_user_name_unique'
  ) THEN
    ALTER TABLE "payment_methods" 
      ADD CONSTRAINT "payment_methods_user_name_unique" 
      UNIQUE ("user_id", "name");
  END IF;
END $$;

-- Projects: user_id + name combination should be unique (one project name per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'projects_user_name_unique'
  ) THEN
    ALTER TABLE "projects" 
      ADD CONSTRAINT "projects_user_name_unique" 
      UNIQUE ("user_id", "name");
  END IF;
END $$;

-- Expense categories: created_by + name combination should be unique (one category name per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'expense_categories_user_name_unique'
  ) THEN
    ALTER TABLE "expense_categories" 
      ADD CONSTRAINT "expense_categories_user_name_unique" 
      UNIQUE ("created_by", "name");
  END IF;
END $$;

-- Campaigns: user_id + name combination should be unique (one campaign name per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'campaigns_user_name_unique'
  ) THEN
    ALTER TABLE "campaigns" 
      ADD CONSTRAINT "campaigns_user_name_unique" 
      UNIQUE ("user_id", "name");
  END IF;
END $$;

-- Ad groups: user_id + campaign_id + name combination should be unique
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'ad_groups_user_campaign_name_unique'
  ) THEN
    ALTER TABLE "ad_groups" 
      ADD CONSTRAINT "ad_groups_user_campaign_name_unique" 
      UNIQUE ("user_id", "campaign_id", "name");
  END IF;
END $$;

-- Leads: user_id + email combination should be unique (one lead per email per user)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'leads_user_email_unique'
  ) THEN
    ALTER TABLE "leads" 
      ADD CONSTRAINT "leads_user_email_unique" 
      UNIQUE ("user_id", "email");
  END IF;
END $$;

