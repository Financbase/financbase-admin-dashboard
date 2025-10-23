CREATE TYPE "public"."account_status" AS ENUM('active', 'inactive', 'closed', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('checking', 'savings', 'credit_card', 'investment', 'loan', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_method_status" AS ENUM('active', 'inactive', 'suspended', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method_type" AS ENUM('stripe', 'paypal', 'square', 'bank_transfer', 'check', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('invoice_payment', 'refund', 'chargeback', 'adjustment', 'transfer');--> statement-breakpoint
CREATE TYPE "public"."project_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."time_entry_status" AS ENUM('draft', 'running', 'paused', 'completed', 'approved', 'billed');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'active', 'paused', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."campaign_type" AS ENUM('search', 'display', 'social', 'video', 'email', 'retargeting', 'affiliate');--> statement-breakpoint
CREATE TYPE "public"."ad_group_status" AS ENUM('active', 'paused', 'removed');--> statement-breakpoint
CREATE TYPE "public"."ad_status" AS ENUM('active', 'paused', 'removed', 'under_review', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."ad_type" AS ENUM('text', 'image', 'video', 'carousel', 'collection', 'shopping', 'responsive');--> statement-breakpoint
CREATE TYPE "public"."lead_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'advertisement', 'partner', 'other');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'nurturing');--> statement-breakpoint
CREATE TYPE "public"."activity_status" AS ENUM('pending', 'completed', 'cancelled', 'rescheduled');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('call', 'email', 'meeting', 'proposal', 'follow_up', 'note', 'task', 'conversion', 'status_change');--> statement-breakpoint
CREATE TYPE "public"."execution_status" AS ENUM('pending', 'running', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('debug', 'info', 'warning', 'error', 'critical');--> statement-breakpoint
CREATE TYPE "public"."step_type" AS ENUM('action', 'condition', 'delay', 'webhook', 'email', 'notification', 'gpt');--> statement-breakpoint
CREATE TYPE "public"."trigger_type" AS ENUM('invoice_created', 'expense_approved', 'report_generated', 'webhook', 'schedule', 'manual');--> statement-breakpoint
CREATE TYPE "public"."workflow_status" AS ENUM('draft', 'active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."discrepancy_type" AS ENUM('amount_mismatch', 'date_mismatch', 'description_mismatch', 'missing_transaction', 'duplicate_transaction', 'other');--> statement-breakpoint
CREATE TYPE "public"."match_confidence" AS ENUM('high', 'medium', 'low', 'manual');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('matched', 'unmatched', 'disputed', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('pending', 'in_progress', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_type" AS ENUM('bank_statement', 'credit_card', 'investment_account', 'manual');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar" text,
	"role" text DEFAULT 'user',
	"is_active" boolean DEFAULT true,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "organization_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" uuid,
	"user_id" uuid,
	"role" text DEFAULT 'member',
	"permissions" text,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo" text,
	"settings" text,
	"owner_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid,
	"description" text NOT NULL,
	"quantity" numeric(10, 2) DEFAULT '1',
	"unit_price" numeric(10, 2) NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"user_id" uuid,
	"client_id" uuid,
	"status" text DEFAULT 'draft',
	"issue_date" timestamp DEFAULT now(),
	"due_date" timestamp,
	"paid_date" timestamp,
	"subtotal" numeric(12, 2) NOT NULL,
	"tax_rate" numeric(5, 4) DEFAULT '0',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"total" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"notes" text,
	"terms" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"contractor_id" uuid,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"category_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"expense_date" date NOT NULL,
	"payment_method" text,
	"tags" text,
	"receipt_url" text,
	"is_recurring" boolean DEFAULT false,
	"recurring_frequency" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"contractor_id" uuid
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"company_name" text NOT NULL,
	"contact_name" text,
	"email" text NOT NULL,
	"phone" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text DEFAULT 'US',
	"tax_id" text,
	"currency" text DEFAULT 'USD',
	"payment_terms" text DEFAULT 'net30',
	"is_active" boolean DEFAULT true,
	"notes" text,
	"metadata" jsonb,
	"contractor_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_number" text NOT NULL,
	"type" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"description" text,
	"category" text,
	"status" text DEFAULT 'pending',
	"payment_method" text,
	"reference_id" text,
	"reference_type" text,
	"account_id" uuid,
	"transaction_date" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "transactions_transaction_number_unique" UNIQUE("transaction_number")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_name" text NOT NULL,
	"account_type" "account_type" NOT NULL,
	"bank_name" text,
	"account_number" text,
	"last_four_digits" text,
	"routing_number" text,
	"swift_code" text,
	"iban" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"opening_balance" numeric(12, 2) DEFAULT '0',
	"current_balance" numeric(12, 2) DEFAULT '0',
	"available_balance" numeric(12, 2) DEFAULT '0',
	"credit_limit" numeric(12, 2),
	"interest_rate" numeric(5, 4),
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"is_primary" boolean DEFAULT false,
	"is_reconciled" boolean DEFAULT false,
	"last_reconciled_at" timestamp,
	"last_sync_at" timestamp,
	"external_id" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"payment_method_type" "payment_method_type" NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"stripe_payment_method_id" text,
	"stripe_customer_id" text,
	"stripe_account_id" text,
	"paypal_merchant_id" text,
	"paypal_email" text,
	"square_application_id" text,
	"square_location_id" text,
	"bank_name" text,
	"bank_account_number" text,
	"bank_routing_number" text,
	"is_default" boolean DEFAULT false,
	"processing_fee" numeric(5, 4),
	"fixed_fee" numeric(8, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"status" "payment_method_status" DEFAULT 'active' NOT NULL,
	"is_test_mode" boolean DEFAULT false,
	"last_used_at" timestamp,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payment_method_id" uuid,
	"invoice_id" uuid,
	"payment_type" "payment_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"processing_fee" numeric(12, 2) DEFAULT '0',
	"net_amount" numeric(12, 2) NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_charge_id" text,
	"paypal_transaction_id" text,
	"square_payment_id" text,
	"description" text,
	"reference" text,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"failed_at" timestamp,
	"refunded_at" timestamp,
	"failure_reason" text,
	"failure_code" text,
	"refund_amount" numeric(12, 2) DEFAULT '0',
	"refund_reason" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"priority" "project_priority" DEFAULT 'medium' NOT NULL,
	"start_date" timestamp,
	"due_date" timestamp,
	"completed_date" timestamp,
	"budget" numeric(12, 2),
	"hourly_rate" numeric(8, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_billable" boolean DEFAULT true,
	"allow_overtime" boolean DEFAULT false,
	"require_approval" boolean DEFAULT false,
	"progress" numeric(5, 2) DEFAULT '0',
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2) DEFAULT '0',
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"description" text NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"duration" numeric(8, 2),
	"status" time_entry_status DEFAULT 'draft' NOT NULL,
	"is_billable" boolean DEFAULT true,
	"hourly_rate" numeric(8, 2),
	"total_amount" numeric(12, 2),
	"currency" text DEFAULT 'USD' NOT NULL,
	"requires_approval" boolean DEFAULT false,
	"is_approved" boolean DEFAULT false,
	"approved_by" uuid,
	"approved_at" timestamp,
	"is_billed" boolean DEFAULT false,
	"billed_at" timestamp,
	"invoice_id" uuid,
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	"parent_task_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed_date" timestamp,
	"estimated_hours" numeric(8, 2),
	"actual_hours" numeric(8, 2) DEFAULT '0',
	"progress" numeric(5, 2) DEFAULT '0',
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "campaign_type" NOT NULL,
	"status" "campaign_status" DEFAULT 'draft' NOT NULL,
	"platform" text NOT NULL,
	"audience" text,
	"keywords" text,
	"demographics" text,
	"budget" numeric(12, 2) NOT NULL,
	"daily_budget" numeric(12, 2),
	"bid_strategy" text,
	"max_bid" numeric(8, 2),
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"impressions" numeric(12, 0) DEFAULT '0',
	"clicks" numeric(12, 0) DEFAULT '0',
	"conversions" numeric(12, 0) DEFAULT '0',
	"spend" numeric(12, 2) DEFAULT '0',
	"revenue" numeric(12, 2) DEFAULT '0',
	"ctr" numeric(5, 4) DEFAULT '0',
	"cpc" numeric(8, 2) DEFAULT '0',
	"cpa" numeric(8, 2) DEFAULT '0',
	"roas" numeric(8, 2) DEFAULT '0',
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ad_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "ad_group_status" DEFAULT 'active' NOT NULL,
	"keywords" text,
	"negative_keywords" text,
	"demographics" text,
	"budget" numeric(12, 2),
	"daily_budget" numeric(12, 2),
	"bid_strategy" text,
	"max_bid" numeric(8, 2),
	"impressions" numeric(12, 0) DEFAULT '0',
	"clicks" numeric(12, 0) DEFAULT '0',
	"conversions" numeric(12, 0) DEFAULT '0',
	"spend" numeric(12, 2) DEFAULT '0',
	"revenue" numeric(12, 2) DEFAULT '0',
	"ctr" numeric(5, 4) DEFAULT '0',
	"cpc" numeric(8, 2) DEFAULT '0',
	"cpa" numeric(8, 2) DEFAULT '0',
	"roas" numeric(8, 2) DEFAULT '0',
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"campaign_id" uuid NOT NULL,
	"ad_group_id" uuid,
	"name" text NOT NULL,
	"headline" text NOT NULL,
	"description" text,
	"call_to_action" text,
	"type" "ad_type" NOT NULL,
	"status" "ad_status" DEFAULT 'active' NOT NULL,
	"image_url" text,
	"video_url" text,
	"landing_page_url" text,
	"impressions" numeric(12, 0) DEFAULT '0',
	"clicks" numeric(12, 0) DEFAULT '0',
	"conversions" numeric(12, 0) DEFAULT '0',
	"spend" numeric(12, 2) DEFAULT '0',
	"revenue" numeric(12, 2) DEFAULT '0',
	"ctr" numeric(5, 4) DEFAULT '0',
	"cpc" numeric(8, 2) DEFAULT '0',
	"cpa" numeric(8, 2) DEFAULT '0',
	"roas" numeric(8, 2) DEFAULT '0',
	"quality_score" numeric(3, 1) DEFAULT '0',
	"relevance_score" numeric(3, 1) DEFAULT '0',
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"company" text,
	"job_title" text,
	"website" text,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"source" "lead_source" NOT NULL,
	"priority" "lead_priority" DEFAULT 'medium' NOT NULL,
	"lead_score" numeric(3, 0) DEFAULT '0',
	"is_qualified" boolean DEFAULT false,
	"qualification_notes" text,
	"estimated_value" numeric(12, 2),
	"probability" numeric(5, 2) DEFAULT '0',
	"expected_close_date" timestamp,
	"actual_close_date" timestamp,
	"last_contact_date" timestamp,
	"next_follow_up_date" timestamp,
	"contact_attempts" numeric(3, 0) DEFAULT '0',
	"assigned_to" uuid,
	"tags" text,
	"notes" text,
	"metadata" text,
	"converted_to_client" boolean DEFAULT false,
	"client_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" "activity_type" NOT NULL,
	"subject" text NOT NULL,
	"description" text,
	"status" "activity_status" DEFAULT 'pending' NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"duration" numeric(8, 2),
	"outcome" text,
	"next_steps" text,
	"notes" text,
	"requires_follow_up" boolean DEFAULT false,
	"follow_up_date" timestamp,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"lead_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed_date" timestamp,
	"reminder_date" timestamp,
	"assigned_to" uuid,
	"is_recurring" boolean DEFAULT false,
	"recurrence_pattern" text,
	"parent_task_id" uuid,
	"tags" text,
	"metadata" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"metric" text NOT NULL,
	"value" numeric(15, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"period" text NOT NULL,
	"period_type" text NOT NULL,
	"entity_type" text,
	"entity_id" uuid,
	"metadata" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_id" uuid,
	"tenant_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"lease_start_date" timestamp NOT NULL,
	"lease_end_date" timestamp NOT NULL,
	"monthly_rent" numeric(8, 2) NOT NULL,
	"security_deposit" numeric(8, 2) NOT NULL,
	"deposit_paid" boolean DEFAULT false,
	"deposit_returned" boolean DEFAULT false,
	"deposit_return_date" timestamp,
	"lease_terms" jsonb,
	"special_clauses" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "maintenance_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"unit_id" uuid,
	"tenant_id" uuid,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"priority" text NOT NULL,
	"status" text DEFAULT 'pending',
	"reported_date" timestamp DEFAULT now() NOT NULL,
	"scheduled_date" timestamp,
	"completed_date" timestamp,
	"assigned_to" text,
	"estimated_cost" numeric(8, 2),
	"actual_cost" numeric(8, 2),
	"notes" text,
	"photos" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"zip_code" text NOT NULL,
	"country" text DEFAULT 'US',
	"property_type" text NOT NULL,
	"purchase_price" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2),
	"square_footage" integer,
	"year_built" integer,
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"parking_spaces" integer DEFAULT 0,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_expenses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"is_recurring" boolean DEFAULT false,
	"recurring_frequency" text,
	"vendor" text,
	"receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_income" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"source" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"is_recurring" boolean DEFAULT true,
	"recurring_frequency" text,
	"tenant_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_roi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"calculation_date" timestamp DEFAULT now() NOT NULL,
	"total_investment" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) NOT NULL,
	"total_income" numeric(15, 2) NOT NULL,
	"total_expenses" numeric(15, 2) NOT NULL,
	"net_income" numeric(15, 2) NOT NULL,
	"roi" numeric(8, 4) NOT NULL,
	"cash_flow" numeric(10, 2) NOT NULL,
	"cap_rate" numeric(6, 4) NOT NULL,
	"cash_on_cash_return" numeric(6, 4) NOT NULL,
	"appreciation" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"unit_number" text NOT NULL,
	"bedrooms" integer NOT NULL,
	"bathrooms" numeric(3, 1) NOT NULL,
	"square_footage" integer,
	"monthly_rent" numeric(8, 2),
	"is_occupied" boolean DEFAULT false,
	"tenant_id" uuid,
	"lease_start_date" timestamp,
	"lease_end_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_valuations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"valuation_date" timestamp NOT NULL,
	"estimated_value" numeric(15, 2) NOT NULL,
	"appraisal_value" numeric(15, 2),
	"source" text NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" timestamp,
	"ssn" text,
	"emergency_contact" jsonb,
	"current_address" text,
	"employment_info" jsonb,
	"credit_score" integer,
	"background_check_status" text DEFAULT 'pending',
	"background_check_date" timestamp,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid,
	"description" text NOT NULL,
	"metadata" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"event_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"entity_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_executions" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"execution_id" varchar(50) NOT NULL,
	"status" "execution_status" DEFAULT 'pending' NOT NULL,
	"trigger_data" jsonb DEFAULT '{}',
	"input_data" jsonb DEFAULT '{}',
	"output_data" jsonb DEFAULT '{}',
	"error_data" jsonb,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration" numeric(10, 3),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "workflow_executions_execution_id_unique" UNIQUE("execution_id")
);
--> statement-breakpoint
CREATE TABLE "workflow_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"execution_id" varchar(50),
	"user_id" text NOT NULL,
	"level" "log_level" DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"details" jsonb DEFAULT '{}',
	"step_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_steps" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"step_id" varchar(50) NOT NULL,
	"name" text NOT NULL,
	"type" "step_type" NOT NULL,
	"configuration" jsonb DEFAULT '{}' NOT NULL,
	"parameters" jsonb DEFAULT '{}',
	"conditions" jsonb DEFAULT '{}',
	"timeout" integer DEFAULT 300 NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"retry_delay" integer DEFAULT 5 NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"template_config" jsonb NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_official" boolean DEFAULT false NOT NULL,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"author_id" text,
	"tags" jsonb DEFAULT '[]',
	"version" text DEFAULT '1.0.0' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_triggers" (
	"id" serial PRIMARY KEY NOT NULL,
	"workflow_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"event_type" "trigger_type" NOT NULL,
	"conditions" jsonb DEFAULT '{}',
	"filters" jsonb DEFAULT '{}',
	"webhook_url" text,
	"schedule_expression" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'general' NOT NULL,
	"type" text DEFAULT 'sequential' NOT NULL,
	"status" "workflow_status" DEFAULT 'draft' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"steps" jsonb DEFAULT '[]' NOT NULL,
	"triggers" jsonb DEFAULT '[]' NOT NULL,
	"variables" jsonb DEFAULT '{}',
	"settings" jsonb DEFAULT '{}',
	"execution_count" integer DEFAULT 0 NOT NULL,
	"success_count" integer DEFAULT 0 NOT NULL,
	"failure_count" integer DEFAULT 0 NOT NULL,
	"last_execution_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_discrepancies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"match_id" uuid,
	"type" "discrepancy_type" NOT NULL,
	"severity" text DEFAULT 'medium',
	"description" text NOT NULL,
	"expected_value" text,
	"actual_value" text,
	"difference" numeric(12, 2),
	"statement_transaction_id" uuid,
	"book_transaction_id" uuid,
	"status" text DEFAULT 'open',
	"resolution" text,
	"resolution_notes" text,
	"resolved_by" uuid,
	"resolved_at" timestamp with time zone,
	"ai_suggestions" jsonb,
	"ai_confidence" numeric(5, 2),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reconciliation_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"statement_transaction_id" uuid,
	"statement_amount" numeric(12, 2),
	"statement_description" text,
	"statement_date" timestamp with time zone,
	"statement_reference" text,
	"book_transaction_id" uuid,
	"book_amount" numeric(12, 2),
	"book_description" text,
	"book_date" timestamp with time zone,
	"book_reference" text,
	"status" "match_status" DEFAULT 'matched',
	"confidence" "match_confidence" DEFAULT 'medium',
	"confidence_score" numeric(5, 2),
	"match_criteria" jsonb,
	"match_reason" text,
	"adjusted_amount" numeric(12, 2),
	"adjustment_reason" text,
	"adjustment_by" uuid,
	"adjusted_at" timestamp with time zone,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reconciliation_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"priority" integer DEFAULT 1,
	"conditions" jsonb NOT NULL,
	"actions" jsonb NOT NULL,
	"times_used" integer DEFAULT 0,
	"success_rate" numeric(5, 2),
	"last_used_at" timestamp with time zone,
	"tags" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reconciliation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "reconciliation_type" DEFAULT 'bank_statement',
	"status" "reconciliation_status" DEFAULT 'pending',
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"total_transactions" integer DEFAULT 0,
	"matched_transactions" integer DEFAULT 0,
	"unmatched_transactions" integer DEFAULT 0,
	"discrepancies_found" integer DEFAULT 0,
	"statement_balance" numeric(12, 2),
	"book_balance" numeric(12, 2),
	"difference" numeric(12, 2),
	"ai_confidence" numeric(5, 2),
	"ai_recommendations" jsonb,
	"metadata" jsonb,
	"notes" text,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transaction_categorization_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"original_category" text,
	"original_confidence" numeric(5, 2),
	"new_category" text,
	"new_confidence" numeric(5, 2),
	"method" text NOT NULL,
	"model_version" text,
	"processing_time_ms" integer,
	"user_feedback" text,
	"feedback_reason" text,
	"feedback_at" timestamp with time zone,
	"context_data" jsonb,
	"feature_vector" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "transaction_reconciliation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"transaction_id" uuid NOT NULL,
	"is_reconciled" boolean DEFAULT false,
	"reconciled_at" timestamp with time zone,
	"reconciled_by" uuid,
	"reconciliation_session_id" uuid,
	"statement_id" text,
	"statement_match_confidence" numeric(5, 2),
	"reconciliation_notes" text,
	"adjustment_amount" numeric(12, 2),
	"adjustment_reason" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "transaction_reconciliation_transaction_id_unique" UNIQUE("transaction_id")
);
--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_payment_methods_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_methods"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_parent_task_id_tasks_id_fk" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_groups" ADD CONSTRAINT "ad_groups_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ad_groups" ADD CONSTRAINT "ad_groups_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ads" ADD CONSTRAINT "ads_ad_group_id_ad_groups_id_fk" FOREIGN KEY ("ad_group_id") REFERENCES "public"."ad_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_activities" ADD CONSTRAINT "lead_activities_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_tasks" ADD CONSTRAINT "lead_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_tasks" ADD CONSTRAINT "lead_tasks_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_unit_id_property_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leases" ADD CONSTRAINT "leases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_unit_id_property_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."property_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "maintenance_requests" ADD CONSTRAINT "maintenance_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_expenses" ADD CONSTRAINT "property_expenses_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_income" ADD CONSTRAINT "property_income_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_income" ADD CONSTRAINT "property_income_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_roi" ADD CONSTRAINT "property_roi_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_units" ADD CONSTRAINT "property_units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_valuations" ADD CONSTRAINT "property_valuations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_executions" ADD CONSTRAINT "workflow_executions_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_logs" ADD CONSTRAINT "workflow_logs_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_steps" ADD CONSTRAINT "workflow_steps_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workflow_triggers" ADD CONSTRAINT "workflow_triggers_workflow_id_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_match_id_reconciliation_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."reconciliation_matches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_book_transaction_id_transactions_id_fk" FOREIGN KEY ("book_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_discrepancies" ADD CONSTRAINT "reconciliation_discrepancies_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_book_transaction_id_transactions_id_fk" FOREIGN KEY ("book_transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_matches" ADD CONSTRAINT "reconciliation_matches_adjustment_by_users_id_fk" FOREIGN KEY ("adjustment_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "reconciliation_rules_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_rules" ADD CONSTRAINT "reconciliation_rules_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_sessions" ADD CONSTRAINT "reconciliation_sessions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categorization_history" ADD CONSTRAINT "transaction_categorization_history_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_categorization_history" ADD CONSTRAINT "transaction_categorization_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_reconciled_by_users_id_fk" FOREIGN KEY ("reconciled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_reconciliation" ADD CONSTRAINT "transaction_reconciliation_reconciliation_session_id_reconciliation_sessions_id_fk" FOREIGN KEY ("reconciliation_session_id") REFERENCES "public"."reconciliation_sessions"("id") ON DELETE no action ON UPDATE no action;