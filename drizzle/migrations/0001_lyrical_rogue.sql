CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected', 'escalated');--> statement-breakpoint
CREATE TYPE "public"."bill_payment_status" AS ENUM('pending', 'scheduled', 'processing', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."bill_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."bill_status" AS ENUM('draft', 'received', 'processing', 'pending_approval', 'approved', 'rejected', 'paid', 'overdue', 'cancelled', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('invoice', 'receipt', 'bill', 'statement', 'contract', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('check', 'ach', 'wire', 'credit_card', 'paypal', 'venmo', 'cash', 'other');--> statement-breakpoint
CREATE TYPE "public"."processing_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'manual_review');--> statement-breakpoint
CREATE TYPE "public"."vendor_status" AS ENUM('active', 'inactive', 'suspended', 'blacklisted');--> statement-breakpoint
CREATE TYPE "public"."vendor_type" AS ENUM('supplier', 'contractor', 'service_provider', 'utility', 'landlord', 'other');--> statement-breakpoint
CREATE TABLE "benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry" text NOT NULL,
	"metric" text NOT NULL,
	"period" text NOT NULL,
	"percentile_25" numeric(10, 2),
	"percentile_50" numeric(10, 2),
	"percentile_75" numeric(10, 2),
	"percentile_90" numeric(10, 2),
	"sample_size" integer,
	"source" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" text NOT NULL,
	"config" jsonb NOT NULL,
	"widgets" jsonb,
	"filters" jsonb,
	"is_public" boolean DEFAULT false,
	"is_template" boolean DEFAULT false,
	"tags" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investor_access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portal_id" uuid NOT NULL,
	"access_token" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"accessed_at" timestamp DEFAULT now(),
	"session_duration" integer,
	"metrics_viewed" text[],
	"reports_accessed" uuid[]
);
--> statement-breakpoint
CREATE TABLE "investor_portals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"logo" text,
	"primary_color" text DEFAULT '#3b82f6',
	"allowed_metrics" text[],
	"allowed_reports" uuid[],
	"access_token" text NOT NULL,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "investor_portals_access_token_unique" UNIQUE("access_token")
);
--> statement-breakpoint
CREATE TABLE "predictive_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"model_type" text NOT NULL,
	"horizon" integer NOT NULL,
	"parameters" jsonb,
	"accuracy" numeric(5, 2),
	"results" jsonb NOT NULL,
	"training_data" jsonb,
	"last_updated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "report_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parameters" jsonb,
	"results" jsonb,
	"status" text DEFAULT 'pending',
	"error" text,
	"executed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_benchmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"benchmark_id" uuid NOT NULL,
	"user_value" numeric(15, 2),
	"percentile" integer,
	"industry_average" numeric(10, 2),
	"comparison" text,
	"calculated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "approval_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"conditions" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"escalation_rules" jsonb,
	"auto_approval_rules" jsonb,
	"total_processed" integer DEFAULT 0,
	"avg_processing_time" integer,
	"approval_rate" numeric(5, 2),
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bill_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bill_id" uuid NOT NULL,
	"workflow_id" uuid,
	"requested_by" uuid NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now(),
	"current_step" integer DEFAULT 1,
	"total_steps" integer NOT NULL,
	"status" "approval_status" DEFAULT 'pending',
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"rejected_by" uuid,
	"rejected_at" timestamp with time zone,
	"approval_notes" text,
	"rejection_reason" text,
	"escalated_at" timestamp with time zone,
	"escalated_to" uuid,
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"approval_history" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bill_pay_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"default_payment_method" "payment_method",
	"auto_pay_enabled" boolean DEFAULT false,
	"early_payment_discount" boolean DEFAULT true,
	"require_approval" boolean DEFAULT true,
	"approval_threshold" numeric(12, 2),
	"default_approval_workflow_id" uuid,
	"email_notifications" boolean DEFAULT true,
	"reminder_days" integer DEFAULT 7,
	"quickbooks_enabled" boolean DEFAULT false,
	"xero_enabled" boolean DEFAULT false,
	"freshbooks_enabled" boolean DEFAULT false,
	"ocr_enabled" boolean DEFAULT true,
	"ai_categorization_enabled" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "bill_pay_settings_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "bill_payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bill_id" uuid,
	"payment_method" "payment_method" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "bill_payment_status" DEFAULT 'pending',
	"payment_date" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"external_payment_id" text,
	"reference_number" text,
	"confirmation_number" text,
	"processing_fee" numeric(8, 2) DEFAULT '0',
	"exchange_rate" numeric(10, 6),
	"adjusted_amount" numeric(12, 2),
	"notes" text,
	"reconciled" boolean DEFAULT false,
	"reconciled_at" timestamp with time zone,
	"external_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "bills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vendor_id" uuid,
	"bill_number" text NOT NULL,
	"vendor_bill_number" text,
	"status" "bill_status" DEFAULT 'received',
	"priority" "bill_priority" DEFAULT 'medium',
	"amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"tax_amount" numeric(12, 2) DEFAULT '0',
	"discount_amount" numeric(12, 2) DEFAULT '0',
	"total_amount" numeric(12, 2) NOT NULL,
	"bill_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone,
	"early_payment_date" timestamp,
	"payment_method" "payment_method",
	"payment_reference" text,
	"description" text,
	"category" text,
	"department" text,
	"project" text,
	"approval_required" boolean DEFAULT false,
	"approved_by" uuid,
	"approved_at" timestamp with time zone,
	"approval_notes" text,
	"ocr_processed" boolean DEFAULT false,
	"ocr_data" jsonb,
	"ocr_confidence" numeric(5, 2),
	"document_url" text,
	"document_type" "document_type" DEFAULT 'invoice',
	"file_name" text,
	"file_size" integer,
	"mime_type" text,
	"external_id" text,
	"metadata" jsonb,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "document_processing" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"bill_id" uuid,
	"status" "processing_status" DEFAULT 'pending',
	"document_type" "document_type" DEFAULT 'invoice',
	"original_file_name" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"storage_url" text,
	"ocr_text" text,
	"ocr_confidence" numeric(5, 2),
	"extracted_data" jsonb,
	"extraction_confidence" numeric(5, 2),
	"validation_errors" jsonb,
	"validation_warnings" jsonb,
	"processing_engine" text,
	"processing_time_ms" integer,
	"ai_model_version" text,
	"requires_review" boolean DEFAULT false,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"review_notes" text,
	"error_message" text,
	"retry_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recurring_bill_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vendor_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"frequency" text NOT NULL,
	"interval" integer DEFAULT 1,
	"day_of_month" integer,
	"day_of_week" text,
	"base_amount" numeric(12, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"description_template" text,
	"category" text,
	"next_due_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"auto_create" boolean DEFAULT false,
	"auto_approve" boolean DEFAULT false,
	"approval_workflow_id" uuid,
	"total_generated" integer DEFAULT 0,
	"last_generated_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"type" "vendor_type" DEFAULT 'supplier',
	"status" "vendor_status" DEFAULT 'active',
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"country" text DEFAULT 'US',
	"tax_id" text,
	"license_number" text,
	"industry" text,
	"preferred_payment_method" "payment_method",
	"payment_terms" text,
	"early_payment_discount" text,
	"total_spent" numeric(12, 2) DEFAULT '0',
	"total_bills" integer DEFAULT 0,
	"avg_payment_time" integer,
	"last_payment_date" timestamp,
	"credit_rating" text,
	"payment_history" jsonb,
	"notes" text,
	"external_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "analytics" ALTER COLUMN "metadata" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "analytics" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "custom_reports" ADD CONSTRAINT "custom_reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_access_logs" ADD CONSTRAINT "investor_access_logs_portal_id_investor_portals_id_fk" FOREIGN KEY ("portal_id") REFERENCES "public"."investor_portals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investor_portals" ADD CONSTRAINT "investor_portals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictive_models" ADD CONSTRAINT "predictive_models_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_report_id_custom_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."custom_reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_executions" ADD CONSTRAINT "report_executions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_benchmarks" ADD CONSTRAINT "user_benchmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_benchmarks" ADD CONSTRAINT "user_benchmarks_benchmark_id_benchmarks_id_fk" FOREIGN KEY ("benchmark_id") REFERENCES "public"."benchmarks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_rejected_by_users_id_fk" FOREIGN KEY ("rejected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_approvals" ADD CONSTRAINT "bill_approvals_escalated_to_users_id_fk" FOREIGN KEY ("escalated_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_pay_settings" ADD CONSTRAINT "bill_pay_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_pay_settings" ADD CONSTRAINT "bill_pay_settings_default_approval_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("default_approval_workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bill_payments" ADD CONSTRAINT "bill_payments_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bills" ADD CONSTRAINT "bills_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_processing" ADD CONSTRAINT "document_processing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_processing" ADD CONSTRAINT "document_processing_bill_id_bills_id_fk" FOREIGN KEY ("bill_id") REFERENCES "public"."bills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_processing" ADD CONSTRAINT "document_processing_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill_templates" ADD CONSTRAINT "recurring_bill_templates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill_templates" ADD CONSTRAINT "recurring_bill_templates_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_bill_templates" ADD CONSTRAINT "recurring_bill_templates_approval_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("approval_workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;