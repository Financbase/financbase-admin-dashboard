CREATE TYPE "public"."transaction_category" AS ENUM('income', 'expense', 'transfer', 'refund', 'fee', 'tax', 'payroll', 'office', 'marketing', 'software', 'utilities', 'travel', 'other');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer', 'payment');--> statement-breakpoint
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
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_number" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"description" text,
	"category" text,
	"status" "transaction_status" DEFAULT 'pending',
	"payment_method" text,
	"reference_id" text,
	"reference_type" text,
	"account_id" text,
	"transaction_date" timestamp NOT NULL,
	"processed_at" timestamp,
	"notes" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
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
ALTER TABLE "clients" RENAME COLUMN "company" TO "company_name";--> statement-breakpoint
ALTER TABLE "clients" RENAME COLUMN "name" TO "contact_name";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "issued_date" TO "issue_date";--> statement-breakpoint
ALTER TABLE "invoices" RENAME COLUMN "amount" TO "subtotal";--> statement-breakpoint
ALTER TABLE "expenses" RENAME COLUMN "receipt" TO "receipt_url";--> statement-breakpoint
ALTER TABLE "clients" DROP CONSTRAINT "clients_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_approved_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "zip_code" text;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "country" text DEFAULT 'US';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "currency" text DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "payment_terms" text DEFAULT 'net30';--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "clients" ADD COLUMN "contractor_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_rate" numeric(5, 4) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "tax_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "discount_amount" numeric(12, 2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "terms" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "metadata" text;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "contractor_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "user_id" uuid;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "expense_date" text NOT NULL;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "tags" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "is_recurring" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "recurring_frequency" text;--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "contractor_id" uuid;--> statement-breakpoint
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
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "created_by";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "currency";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "vendor";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "approved_by";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "approved_at";--> statement-breakpoint
ALTER TABLE "expenses" DROP COLUMN "created_by";