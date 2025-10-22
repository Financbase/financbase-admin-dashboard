-- Migration: Tier 2 - Reports System
-- Created: 2025-10-21
-- Description: Creates tables for reports and analytics system

-- Reports table
CREATE TABLE IF NOT EXISTS "reports" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"type" TEXT NOT NULL,
	"config" JSONB NOT NULL,
	"visualization_type" TEXT,
	"chart_config" JSONB,
	"is_public" BOOLEAN DEFAULT FALSE,
	"shared_with" JSONB,
	"is_template" BOOLEAN DEFAULT FALSE,
	"is_favorite" BOOLEAN DEFAULT FALSE,
	"tags" JSONB,
	"last_run_at" TIMESTAMP,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Report schedules table
CREATE TABLE IF NOT EXISTS "report_schedules" (
	"id" SERIAL PRIMARY KEY,
	"report_id" INTEGER REFERENCES "reports"("id") NOT NULL,
	"user_id" TEXT NOT NULL,
	"frequency" TEXT NOT NULL,
	"day_of_week" INTEGER,
	"day_of_month" INTEGER,
	"time" TEXT NOT NULL,
	"timezone" TEXT DEFAULT 'UTC',
	"delivery_method" TEXT NOT NULL,
	"recipients" JSONB NOT NULL,
	"is_active" BOOLEAN DEFAULT TRUE,
	"last_run_at" TIMESTAMP,
	"next_run_at" TIMESTAMP,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Report history table
CREATE TABLE IF NOT EXISTS "report_history" (
	"id" SERIAL PRIMARY KEY,
	"report_id" INTEGER REFERENCES "reports"("id") NOT NULL,
	"user_id" TEXT NOT NULL,
	"data" JSONB NOT NULL,
	"generated_by" TEXT,
	"schedule_id" INTEGER REFERENCES "report_schedules"("id"),
	"period_start" TIMESTAMP NOT NULL,
	"period_end" TIMESTAMP NOT NULL,
	"pdf_url" TEXT,
	"excel_url" TEXT,
	"execution_time" INTEGER,
	"data_points" INTEGER,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Report templates table
CREATE TABLE IF NOT EXISTS "report_templates" (
	"id" SERIAL PRIMARY KEY,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"category" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"config" JSONB NOT NULL,
	"thumbnail" TEXT,
	"icon" TEXT,
	"is_default" BOOLEAN DEFAULT FALSE,
	"is_popular" BOOLEAN DEFAULT FALSE,
	"usage_count" INTEGER DEFAULT 0,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_reports_user_id" ON "reports"("user_id");
CREATE INDEX IF NOT EXISTS "idx_reports_type" ON "reports"("type");
CREATE INDEX IF NOT EXISTS "idx_reports_favorite" ON "reports"("is_favorite");

CREATE INDEX IF NOT EXISTS "idx_report_schedules_report_id" ON "report_schedules"("report_id");
CREATE INDEX IF NOT EXISTS "idx_report_schedules_next_run" ON "report_schedules"("next_run_at");

CREATE INDEX IF NOT EXISTS "idx_report_history_report_id" ON "report_history"("report_id");
CREATE INDEX IF NOT EXISTS "idx_report_history_user_id" ON "report_history"("user_id");

CREATE INDEX IF NOT EXISTS "idx_report_templates_category" ON "report_templates"("category");

-- Insert default report templates
INSERT INTO "report_templates" ("name", "description", "category", "type", "config", "is_default", "is_popular") VALUES
(
	'Profit & Loss Statement',
	'Standard P&L report showing revenue, expenses, and net profit',
	'financial',
	'profit_loss',
	'{"dateRange": {"preset": "month"}, "groupBy": ["category"], "comparePeriod": true}'::jsonb,
	TRUE,
	TRUE
),
(
	'Cash Flow Statement',
	'Track cash inflows and outflows over time',
	'financial',
	'cash_flow',
	'{"dateRange": {"preset": "month"}, "groupBy": ["date"], "comparePeriod": false}'::jsonb,
	TRUE,
	TRUE
),
(
	'Balance Sheet',
	'Snapshot of assets, liabilities, and equity',
	'financial',
	'balance_sheet',
	'{"dateRange": {"preset": "today"}}'::jsonb,
	TRUE,
	FALSE
),
(
	'Revenue by Customer',
	'Analyze revenue breakdown by customer',
	'financial',
	'revenue_by_customer',
	'{"dateRange": {"preset": "quarter"}, "groupBy": ["customer"], "metrics": ["revenue", "invoiceCount"]}'::jsonb,
	TRUE,
	TRUE
),
(
	'Expense by Category',
	'Track expenses across different categories',
	'financial',
	'expense_by_category',
	'{"dateRange": {"preset": "month"}, "groupBy": ["category"], "metrics": ["amount", "count"]}'::jsonb,
	TRUE,
	TRUE
)
ON CONFLICT DO NOTHING;

