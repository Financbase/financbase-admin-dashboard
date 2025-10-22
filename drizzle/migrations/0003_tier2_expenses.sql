-- Migration: Tier 2 - Expense Tracking
-- Created: 2025-10-21
-- Description: Creates tables for expense tracking and management system

-- Expense categories table
CREATE TABLE IF NOT EXISTS "expense_categories" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"color" TEXT DEFAULT '#3b82f6',
	"icon" TEXT,
	"monthly_budget" DECIMAL(12, 2),
	"yearly_budget" DECIMAL(12, 2),
	"tax_deductible" BOOLEAN DEFAULT TRUE,
	"requires_receipt" BOOLEAN DEFAULT FALSE,
	"requires_approval" BOOLEAN DEFAULT FALSE,
	"is_default" BOOLEAN DEFAULT FALSE,
	"is_active" BOOLEAN DEFAULT TRUE,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Expenses table
CREATE TABLE IF NOT EXISTS "expenses" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"amount" DECIMAL(12, 2) NOT NULL,
	"currency" TEXT DEFAULT 'USD' NOT NULL,
	"date" TIMESTAMP NOT NULL,
	"category" TEXT NOT NULL,
	"vendor" TEXT,
	"payment_method" TEXT,
	"receipt_url" TEXT,
	"receipt_file_name" TEXT,
	"status" TEXT DEFAULT 'pending' NOT NULL,
	"approved_by" TEXT,
	"approved_at" TIMESTAMP,
	"rejected_reason" TEXT,
	"tax_deductible" BOOLEAN DEFAULT TRUE,
	"tax_amount" DECIMAL(12, 2) DEFAULT '0',
	"project_id" INTEGER,
	"client_id" INTEGER,
	"billable" BOOLEAN DEFAULT FALSE,
	"is_recurring" BOOLEAN DEFAULT FALSE,
	"recurring_frequency" TEXT,
	"recurring_end_date" TIMESTAMP,
	"parent_expense_id" INTEGER,
	"mileage" DECIMAL(10, 2),
	"mileage_rate" DECIMAL(5, 2),
	"notes" TEXT,
	"tags" JSONB,
	"metadata" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Expense attachments table
CREATE TABLE IF NOT EXISTS "expense_attachments" (
	"id" SERIAL PRIMARY KEY,
	"expense_id" INTEGER REFERENCES "expenses"("id") NOT NULL,
	"file_name" TEXT NOT NULL,
	"file_url" TEXT NOT NULL,
	"file_type" TEXT NOT NULL,
	"file_size" INTEGER,
	"ocr_data" JSONB,
	"uploaded_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Expense approval log table
CREATE TABLE IF NOT EXISTS "expense_approval_log" (
	"id" SERIAL PRIMARY KEY,
	"expense_id" INTEGER REFERENCES "expenses"("id") NOT NULL,
	"action" TEXT NOT NULL,
	"performed_by" TEXT NOT NULL,
	"reason" TEXT,
	"previous_status" TEXT,
	"new_status" TEXT,
	"performed_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_expenses_user_id" ON "expenses"("user_id");
CREATE INDEX IF NOT EXISTS "idx_expenses_category" ON "expenses"("category");
CREATE INDEX IF NOT EXISTS "idx_expenses_status" ON "expenses"("status");
CREATE INDEX IF NOT EXISTS "idx_expenses_date" ON "expenses"("date");
CREATE INDEX IF NOT EXISTS "idx_expenses_billable" ON "expenses"("billable");

CREATE INDEX IF NOT EXISTS "idx_expense_categories_user_id" ON "expense_categories"("user_id");
CREATE INDEX IF NOT EXISTS "idx_expense_categories_active" ON "expense_categories"("is_active");

CREATE INDEX IF NOT EXISTS "idx_expense_attachments_expense_id" ON "expense_attachments"("expense_id");

CREATE INDEX IF NOT EXISTS "idx_expense_approval_log_expense_id" ON "expense_approval_log"("expense_id");

-- Insert default categories
INSERT INTO "expense_categories" ("user_id", "name", "description", "color", "is_default", "tax_deductible") VALUES
('default', 'Office Supplies', 'Office supplies and equipment', '#3b82f6', TRUE, TRUE),
('default', 'Travel', 'Business travel expenses', '#10b981', TRUE, TRUE),
('default', 'Meals & Entertainment', 'Client meals and entertainment', '#f59e0b', TRUE, TRUE),
('default', 'Software & Subscriptions', 'Software licenses and subscriptions', '#8b5cf6', TRUE, TRUE),
('default', 'Marketing & Advertising', 'Marketing and advertising costs', '#ec4899', TRUE, TRUE),
('default', 'Professional Services', 'Consulting and professional fees', '#06b6d4', TRUE, TRUE),
('default', 'Utilities', 'Phone, internet, utilities', '#14b8a6', TRUE, TRUE),
('default', 'Equipment', 'Equipment purchases', '#6366f1', TRUE, TRUE),
('default', 'Other', 'Miscellaneous expenses', '#64748b', TRUE, TRUE)
ON CONFLICT DO NOTHING;

