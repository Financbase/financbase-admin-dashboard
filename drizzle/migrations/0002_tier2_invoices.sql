-- Migration: Tier 2 - Invoice Management
-- Created: 2025-10-21
-- Description: Creates tables for invoice management system

-- Clients table
CREATE TABLE IF NOT EXISTS "clients" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"phone" TEXT,
	"company" TEXT,
	"address" TEXT,
	"city" TEXT,
	"state" TEXT,
	"zip_code" TEXT,
	"country" TEXT,
	"tax_id" TEXT,
	"currency" TEXT DEFAULT 'USD',
	"payment_terms" TEXT,
	"status" TEXT DEFAULT 'active' NOT NULL,
	"total_invoiced" DECIMAL(12, 2) DEFAULT '0',
	"total_paid" DECIMAL(12, 2) DEFAULT '0',
	"outstanding_balance" DECIMAL(12, 2) DEFAULT '0',
	"notes" TEXT,
	"tags" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Invoices table
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"invoice_number" TEXT UNIQUE NOT NULL,
	"reference" TEXT,
	"client_id" INTEGER REFERENCES "clients"("id"),
	"client_name" TEXT NOT NULL,
	"client_email" TEXT NOT NULL,
	"client_address" TEXT,
	"client_phone" TEXT,
	"currency" TEXT DEFAULT 'USD' NOT NULL,
	"subtotal" DECIMAL(12, 2) NOT NULL,
	"tax_rate" DECIMAL(5, 2) DEFAULT '0',
	"tax_amount" DECIMAL(12, 2) DEFAULT '0',
	"discount_amount" DECIMAL(12, 2) DEFAULT '0',
	"total" DECIMAL(12, 2) NOT NULL,
	"status" TEXT DEFAULT 'draft' NOT NULL,
	"issue_date" TIMESTAMP NOT NULL,
	"due_date" TIMESTAMP NOT NULL,
	"paid_date" TIMESTAMP,
	"sent_date" TIMESTAMP,
	"amount_paid" DECIMAL(12, 2) DEFAULT '0',
	"payment_method" TEXT,
	"payment_reference" TEXT,
	"notes" TEXT,
	"terms" TEXT,
	"footer" TEXT,
	"items" JSONB NOT NULL,
	"is_recurring" BOOLEAN DEFAULT FALSE NOT NULL,
	"recurring_frequency" TEXT,
	"recurring_end_date" TIMESTAMP,
	"parent_invoice_id" INTEGER,
	"metadata" JSONB,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Invoice payments table
CREATE TABLE IF NOT EXISTS "invoice_payments" (
	"id" SERIAL PRIMARY KEY,
	"invoice_id" INTEGER REFERENCES "invoices"("id") NOT NULL,
	"user_id" TEXT NOT NULL,
	"amount" DECIMAL(12, 2) NOT NULL,
	"currency" TEXT DEFAULT 'USD' NOT NULL,
	"payment_method" TEXT NOT NULL,
	"reference" TEXT,
	"payment_date" TIMESTAMP NOT NULL,
	"notes" TEXT,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Invoice templates table
CREATE TABLE IF NOT EXISTS "invoice_templates" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"description" TEXT,
	"terms" TEXT,
	"footer" TEXT,
	"default_items" JSONB,
	"tax_rate" DECIMAL(5, 2) DEFAULT '0',
	"payment_terms" TEXT,
	"is_default" BOOLEAN DEFAULT FALSE,
	"created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
	"updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_invoices_user_id" ON "invoices"("user_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_client_id" ON "invoices"("client_id");
CREATE INDEX IF NOT EXISTS "idx_invoices_status" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "idx_invoices_due_date" ON "invoices"("due_date");
CREATE INDEX IF NOT EXISTS "idx_invoices_invoice_number" ON "invoices"("invoice_number");

CREATE INDEX IF NOT EXISTS "idx_clients_user_id" ON "clients"("user_id");
CREATE INDEX IF NOT EXISTS "idx_clients_email" ON "clients"("email");

CREATE INDEX IF NOT EXISTS "idx_invoice_payments_invoice_id" ON "invoice_payments"("invoice_id");
CREATE INDEX IF NOT EXISTS "idx_invoice_payments_user_id" ON "invoice_payments"("user_id");

CREATE INDEX IF NOT EXISTS "idx_invoice_templates_user_id" ON "invoice_templates"("user_id");

