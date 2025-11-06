-- Migration: Budgets System
-- Created: 2025-01-XX
-- Description: Creates tables for budget tracking and management system with expense integration

-- Budgets table
CREATE TABLE IF NOT EXISTS "budgets" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"category" TEXT NOT NULL,
	"description" TEXT,
	"budgeted_amount" DECIMAL(12, 2) NOT NULL,
	"currency" TEXT NOT NULL DEFAULT 'USD',
	"period_type" TEXT NOT NULL DEFAULT 'monthly',
	"start_date" TIMESTAMP NOT NULL,
	"end_date" TIMESTAMP NOT NULL,
	"alert_thresholds" JSONB DEFAULT '[80, 90, 100]',
	"status" TEXT DEFAULT 'active' NOT NULL,
	"notes" TEXT,
	"tags" JSONB,
	"metadata" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Budget categories table
CREATE TABLE IF NOT EXISTS "budget_categories" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"color" TEXT DEFAULT '#3b82f6',
	"icon" TEXT,
	"default_monthly_budget" DECIMAL(12, 2),
	"default_yearly_budget" DECIMAL(12, 2),
	"is_default" BOOLEAN DEFAULT FALSE,
	"is_active" BOOLEAN DEFAULT TRUE,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Budget alerts table
CREATE TABLE IF NOT EXISTS "budget_alerts" (
	"id" SERIAL PRIMARY KEY,
	"budget_id" INTEGER NOT NULL REFERENCES "budgets"("id") ON DELETE CASCADE,
	"user_id" TEXT NOT NULL,
	"alert_type" TEXT NOT NULL,
	"threshold" DECIMAL(5, 2) NOT NULL,
	"message" TEXT NOT NULL,
	"is_active" BOOLEAN DEFAULT TRUE,
	"is_read" BOOLEAN DEFAULT FALSE,
	"acknowledged_at" TIMESTAMP,
	"spending_percentage" DECIMAL(5, 2),
	"budgeted_amount" DECIMAL(12, 2),
	"spent_amount" DECIMAL(12, 2),
	"remaining_amount" DECIMAL(12, 2),
	"triggered_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_budgets_user_id" ON "budgets"("user_id");
CREATE INDEX IF NOT EXISTS "idx_budgets_category" ON "budgets"("category");
CREATE INDEX IF NOT EXISTS "idx_budgets_status" ON "budgets"("status");
CREATE INDEX IF NOT EXISTS "idx_budgets_period_dates" ON "budgets"("start_date", "end_date");
CREATE INDEX IF NOT EXISTS "idx_budget_categories_user_id" ON "budget_categories"("user_id");
CREATE INDEX IF NOT EXISTS "idx_budget_alerts_user_id" ON "budget_alerts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_budget_alerts_budget_id" ON "budget_alerts"("budget_id");
CREATE INDEX IF NOT EXISTS "idx_budget_alerts_is_active" ON "budget_alerts"("is_active");

-- Add comments for documentation
COMMENT ON TABLE "budgets" IS 'Main table for tracking budget allocations by category';
COMMENT ON TABLE "budget_categories" IS 'Predefined and custom budget categories';
COMMENT ON TABLE "budget_alerts" IS 'Track budget alert history and rules based on spending thresholds';

