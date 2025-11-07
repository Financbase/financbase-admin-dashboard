-- Migration: Subscription RBAC Mapping System
-- Created: 2025-01-23
-- Description: Database schema for mapping subscription plans to roles and permissions

-- Enum for subscription status history (use existing subscription_status enum if available)
DO $$ BEGIN
    CREATE TYPE "public"."subscription_status_type" AS ENUM('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription Plan RBAC Mappings table
CREATE TABLE "subscription_plan_rbac_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
	"role" text NOT NULL CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
	"permissions" jsonb NOT NULL DEFAULT '[]',
	"is_trial_mapping" boolean DEFAULT false NOT NULL,
	"grace_period_days" integer DEFAULT 7 NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_plan_trial_mapping" UNIQUE ("plan_id", "is_trial_mapping")
);

-- Subscription Status History table
CREATE TABLE "subscription_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
	"user_id" uuid NOT NULL,
	"previous_status" "subscription_status_type",
	"new_status" "subscription_status_type" NOT NULL,
	"grace_period_start" timestamp,
	"grace_period_end" timestamp,
	"reason" text,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL
);

-- Indexes for performance
CREATE INDEX "idx_subscription_plan_rbac_mappings_plan_id" ON "subscription_plan_rbac_mappings" ("plan_id");
CREATE INDEX "idx_subscription_plan_rbac_mappings_role" ON "subscription_plan_rbac_mappings" ("role");
CREATE INDEX "idx_subscription_status_history_subscription_id" ON "subscription_status_history" ("subscription_id");
CREATE INDEX "idx_subscription_status_history_user_id" ON "subscription_status_history" ("user_id");
CREATE INDEX "idx_subscription_status_history_grace_period" ON "subscription_status_history" ("grace_period_end") WHERE "grace_period_end" IS NOT NULL;

-- Row Level Security policies
ALTER TABLE "subscription_plan_rbac_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subscription_status_history" ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plan_rbac_mappings (read-only for authenticated users, admin write)
CREATE POLICY "Users can view RBAC mappings" ON "subscription_plan_rbac_mappings"
	FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage RBAC mappings" ON "subscription_plan_rbac_mappings"
	FOR ALL USING (
		EXISTS (
			SELECT 1 FROM users 
			WHERE users.clerk_id = auth.uid()::text 
			AND users.role = 'admin'
		)
	);

-- Policies for subscription_status_history (users can view their own history)
CREATE POLICY "Users can view their own subscription history" ON "subscription_status_history"
	FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert subscription history" ON "subscription_status_history"
	FOR INSERT WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_rbac_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = now();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_subscription_plan_rbac_mappings_updated_at
	BEFORE UPDATE ON "subscription_plan_rbac_mappings"
	FOR EACH ROW
	EXECUTE FUNCTION update_subscription_rbac_mapping_updated_at();

