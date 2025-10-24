-- Migration: Subscription and Billing Management System
-- Created: 2025-01-23
-- Description: Database schema for subscription plans, billing, and payment management

-- Enums for billing system
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial');
CREATE TYPE "public"."subscription_interval" AS ENUM('monthly', 'yearly', 'lifetime');
CREATE TYPE "public"."billing_status" AS ENUM('pending', 'paid', 'failed', 'overdue', 'cancelled', 'refunded');
CREATE TYPE "public"."payment_method_status" AS ENUM('active', 'inactive', 'expired', 'failed');

-- Subscription Plans table
CREATE TABLE "subscription_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_monthly" numeric(10, 2) NOT NULL,
	"price_yearly" numeric(10, 2) NOT NULL,
	"interval" "subscription_interval" NOT NULL,
	"features" jsonb NOT NULL DEFAULT '{}',
	"limits" jsonb NOT NULL DEFAULT '{}',
	"is_popular" boolean DEFAULT false,
	"is_enterprise" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- User Subscriptions table
CREATE TABLE "user_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL REFERENCES subscription_plans(id),
	"status" "subscription_status" DEFAULT 'trial',
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"trial_start" timestamp,
	"trial_end" timestamp,
	"cancelled_at" timestamp,
	"cancel_reason" text,
	"next_billing_date" timestamp,
	"auto_renew" boolean DEFAULT true,
	"stripe_subscription_id" text,
	"stripe_customer_id" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Billing History table
CREATE TABLE "billing_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"subscription_id" uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"status" "billing_status" DEFAULT 'pending',
	"description" text,
	"invoice_url" text,
	"stripe_invoice_id" text,
	"stripe_payment_intent_id" text,
	"payment_method" text,
	"billed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

-- Payment Methods table
CREATE TABLE "user_payment_methods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL, -- 'card', 'bank_account', 'paypal', etc.
	"stripe_payment_method_id" text,
	"last4" text,
	"brand" text,
	"expiry_month" integer,
	"expiry_year" integer,
	"is_default" boolean DEFAULT false,
	"status" "payment_method_status" DEFAULT 'active',
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Usage tracking table
CREATE TABLE "usage_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"feature" text NOT NULL, -- 'api_calls', 'storage', 'users', etc.
	"count" integer DEFAULT 0,
	"limit" integer,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Indexes for performance
CREATE INDEX "user_subscriptions_user_id_idx" ON "user_subscriptions" USING btree ("user_id");
CREATE INDEX "user_subscriptions_status_idx" ON "user_subscriptions" USING btree ("status");
CREATE INDEX "user_subscriptions_stripe_subscription_id_idx" ON "user_subscriptions" USING btree ("stripe_subscription_id");
CREATE INDEX "billing_history_user_id_idx" ON "billing_history" USING btree ("user_id");
CREATE INDEX "billing_history_status_idx" ON "billing_history" USING btree ("status");
CREATE INDEX "user_payment_methods_user_id_idx" ON "user_payment_methods" USING btree ("user_id");
CREATE INDEX "usage_tracking_user_id_idx" ON "usage_tracking" USING btree ("user_id");
CREATE INDEX "usage_tracking_feature_idx" ON "usage_tracking" USING btree ("feature");

-- Row Level Security (RLS) policies
ALTER TABLE "subscription_plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "billing_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_payment_methods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "usage_tracking" ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (publicly readable)
CREATE POLICY "Anyone can view subscription plans" ON "subscription_plans"
	FOR SELECT USING (true);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON "user_subscriptions"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" ON "user_subscriptions"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" ON "user_subscriptions"
	FOR UPDATE USING (auth.uid() = user_id);

-- Policies for billing_history
CREATE POLICY "Users can view their own billing history" ON "billing_history"
	FOR SELECT USING (auth.uid() = user_id);

-- Policies for user_payment_methods
CREATE POLICY "Users can view their own payment methods" ON "user_payment_methods"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payment methods" ON "user_payment_methods"
	FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods" ON "user_payment_methods"
	FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods" ON "user_payment_methods"
	FOR DELETE USING (auth.uid() = user_id);

-- Policies for usage_tracking
CREATE POLICY "Users can view their own usage" ON "usage_tracking"
	FOR SELECT USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO "subscription_plans" ("name", "description", "price_monthly", "price_yearly", "interval", "features", "limits", "is_popular", "sort_order") VALUES
('Free', 'Perfect for getting started', 0, 0, 'monthly', '{"api_calls": true, "basic_features": true}', '{"api_calls": 1000, "users": 1, "storage": 100}', false, 1),
('Pro', 'For growing businesses', 29, 348, 'monthly', '{"api_calls": true, "advanced_features": true, "priority_support": true}', '{"api_calls": 10000, "users": 5, "storage": 1000}', true, 2),
('Enterprise', 'For large organizations', 99, 1188, 'monthly', '{"api_calls": true, "enterprise_features": true, "dedicated_support": true}', '{"api_calls": 100000, "users": 50, "storage": 10000}', false, 3);
