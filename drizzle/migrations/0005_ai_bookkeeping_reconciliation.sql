-- Migration: AI Bookkeeping Engine - Reconciliation System
-- Created: 2025-01-23
-- Description: Database schema for AI-powered reconciliation, automated transaction matching, and intelligent bookkeeping

-- Enums for reconciliation system
CREATE TYPE "public"."reconciliation_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE "public"."reconciliation_type" AS ENUM('bank_statement', 'credit_card', 'investment_account', 'manual');
CREATE TYPE "public"."match_status" AS ENUM('matched', 'unmatched', 'disputed', 'resolved');
CREATE TYPE "public"."match_confidence" AS ENUM('high', 'medium', 'low', 'manual');
CREATE TYPE "public"."discrepancy_type" AS ENUM('amount_mismatch', 'date_mismatch', 'description_mismatch', 'missing_transaction', 'duplicate_transaction', 'other');

-- Reconciliation sessions table
CREATE TABLE "reconciliation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "reconciliation_type" DEFAULT 'bank_statement',
	"status" "reconciliation_status" DEFAULT 'pending',

	-- Date range for reconciliation
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,

	-- Reconciliation results
	"total_transactions" integer DEFAULT 0,
	"matched_transactions" integer DEFAULT 0,
	"unmatched_transactions" integer DEFAULT 0,
	"discrepancies_found" integer DEFAULT 0,

	-- Financial totals
	"statement_balance" numeric(12, 2),
	"book_balance" numeric(12, 2),
	"difference" numeric(12, 2),

	-- AI/ML insights
	"ai_confidence" numeric(5, 2), -- 0-100
	"ai_recommendations" jsonb,

	-- Session metadata
	"metadata" jsonb,
	"notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Transaction matches table
CREATE TABLE "reconciliation_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,

	-- Bank statement side
	"statement_transaction_id" uuid,
	"statement_amount" numeric(12, 2),
	"statement_description" text,
	"statement_date" timestamp,
	"statement_reference" text,

	-- Book transaction side
	"book_transaction_id" uuid,
	"book_amount" numeric(12, 2),
	"book_description" text,
	"book_date" timestamp,
	"book_reference" text,

	-- Match details
	"status" "match_status" DEFAULT 'matched',
	"confidence" "match_confidence" DEFAULT 'medium',
	"confidence_score" numeric(5, 2), -- 0-100

	-- Match criteria used
	"match_criteria" jsonb, -- What fields were used for matching
	"match_reason" text, -- AI explanation of why this match was made

	-- Manual adjustments
	"adjusted_amount" numeric(12, 2),
	"adjustment_reason" text,
	"adjustment_by" uuid,
	"adjusted_at" timestamp,

	-- Metadata
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Reconciliation rules for automated matching
CREATE TABLE "reconciliation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid, -- null = global rule

	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 1, -- Higher number = higher priority

	-- Rule conditions (JSON logic)
	"conditions" jsonb NOT NULL, -- Complex rule conditions

	-- Rule actions
	"actions" jsonb NOT NULL, -- What to do when rule matches

	-- Performance tracking
	"times_used" integer DEFAULT 0,
	"success_rate" numeric(5, 2), -- 0-100
	"last_used_at" timestamp,

	-- Rule metadata
	"tags" text, -- comma-separated tags for categorization
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Discrepancies found during reconciliation
CREATE TABLE "reconciliation_discrepancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"match_id" uuid,

	"type" "discrepancy_type" NOT NULL,
	"severity" text DEFAULT 'medium', -- low, medium, high, critical

	-- Discrepancy details
	"description" text NOT NULL,
	"expected_value" text,
	"actual_value" text,
	"difference" numeric(12, 2),

	-- Transaction references
	"statement_transaction_id" uuid,
	"book_transaction_id" uuid,

	-- Resolution tracking
	"status" text DEFAULT 'open', -- open, investigating, resolved, dismissed
	"resolution" text,
	"resolution_notes" text,
	"resolved_by" uuid,
	"resolved_at" timestamp,

	-- AI suggestions
	"ai_suggestions" jsonb,
	"ai_confidence" numeric(5, 2),

	-- Metadata
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Transaction categorization history for ML improvement
CREATE TABLE "transaction_categorization_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,

	-- Original categorization
	"original_category" text,
	"original_confidence" numeric(5, 2),

	-- New categorization
	"new_category" text,
	"new_confidence" numeric(5, 2),

	-- Categorization method
	"method" text NOT NULL, -- 'ai', 'rule', 'manual', 'bulk'
	"model_version" text, -- AI model version used
	"processing_time" integer, -- Time taken to categorize

	-- User feedback
	"user_feedback" text, -- 'correct', 'incorrect', 'unsure'
	"feedback_reason" text,
	"feedback_at" timestamp,

	-- Context data used for categorization
	"context_data" jsonb, -- Additional data used for categorization
	"feature_vector" jsonb, -- ML features extracted

	"created_at" timestamp DEFAULT now()
);

-- Transaction reconciliation status tracking
CREATE TABLE "transaction_reconciliation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL UNIQUE,

	-- Reconciliation status
	"is_reconciled" boolean DEFAULT false,
	"reconciled_at" timestamp,
	"reconciled_by" uuid,
	"reconciliation_session_id" uuid,

	-- Statement matching
	"statement_id" text, -- External statement identifier
	"statement_match_confidence" numeric(5, 2),

	-- Reconciliation notes
	"reconciliation_notes" text,
	"adjustment_amount" numeric(12, 2),
	"adjustment_reason" text,

	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_book_transaction_id_transactions_id_fk" FOREIGN KEY ("book_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_adjustment_by_users_id_fk" FOREIGN KEY ("adjustment_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "reconciliation_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "reconciliation_rules_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_match_id_reconciliation_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."reconciliation_matches"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_book_transaction_id_transactions_id_fk" FOREIGN KEY ("book_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "transaction_categorization_history" ADD CONSTRAINT "transaction_categorization_history_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transaction_categorization_history" ADD CONSTRAINT "transaction_categorization_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_reconciled_by_users_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_reconciliation_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("reconciliation_session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;

-- Create indexes for performance
CREATE INDEX "reconciliation_sessions_user_id_idx" ON "reconciliation_sessions" USING btree ("user_id");
CREATE INDEX "reconciliation_sessions_account_id_idx" ON "reconciliation_sessions" USING btree ("account_id");
CREATE INDEX "reconciliation_sessions_status_idx" ON "reconciliation_sessions" USING btree ("status");
CREATE INDEX "reconciliation_sessions_dates_idx" ON "reconciliation_sessions" USING btree ("start_date", "end_date");

CREATE INDEX "reconciliation_matches_session_id_idx" ON "reconciliation_matches" USING btree ("session_id");
CREATE INDEX "reconciliation_matches_status_idx" ON "reconciliation_matches" USING btree ("status");
CREATE INDEX "reconciliation_matches_confidence_idx" ON "reconciliation_matches" USING btree ("confidence_score");

CREATE INDEX "reconciliation_rules_user_id_idx" ON "reconciliation_rules" USING btree ("user_id");
CREATE INDEX "reconciliation_rules_account_id_idx" ON "reconciliation_rules" USING btree ("account_id");
CREATE INDEX "reconciliation_rules_active_idx" ON "reconciliation_rules" USING btree ("is_active");

CREATE INDEX "reconciliation_discrepancies_session_id_idx" ON "reconciliation_discrepancies" USING btree ("session_id");
CREATE INDEX "reconciliation_discrepancies_status_idx" ON "reconciliation_discrepancies" USING btree ("status");
CREATE INDEX "reconciliation_discrepancies_severity_idx" ON "reconciliation_discrepancies" USING btree ("severity");

CREATE INDEX "transaction_categorization_history_transaction_id_idx" ON "transaction_categorization_history" USING btree ("transaction_id");
CREATE INDEX "transaction_categorization_history_user_id_idx" ON "transaction_categorization_history" USING btree ("user_id");
CREATE INDEX "transaction_categorization_history_method_idx" ON "transaction_categorization_history" USING btree ("method");

CREATE INDEX "transaction_reconciliation_transaction_id_idx" ON "transaction_reconciliation" USING btree ("transaction_id");
CREATE INDEX "transaction_reconciliation_is_reconciled_idx" ON "transaction_reconciliation" USING btree ("is_reconciled");
