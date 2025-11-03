-- Migration: Feature Flags System
-- Created: 2025-01-28
-- Description: Database schema for system-wide feature flags with rollout and targeting support

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS "feature_flags" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "key" VARCHAR(255) UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "enabled" BOOLEAN DEFAULT false NOT NULL,
  "rollout_percentage" INTEGER DEFAULT 0 NOT NULL,
  "target_organizations" JSONB,
  "target_users" JSONB,
  "conditions" JSONB,
  "metadata" JSONB,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT "rollout_percentage_check" CHECK ("rollout_percentage" >= 0 AND "rollout_percentage" <= 100)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_feature_flags_key" ON "feature_flags"("key");
CREATE INDEX IF NOT EXISTS "idx_feature_flags_enabled" ON "feature_flags"("enabled");
CREATE INDEX IF NOT EXISTS "idx_feature_flags_rollout" ON "feature_flags"("rollout_percentage") WHERE "enabled" = true;

-- Comments for documentation
COMMENT ON TABLE "feature_flags" IS 'System-wide feature flags for enabling/disabling features with rollout and targeting support';
COMMENT ON COLUMN "feature_flags"."key" IS 'Unique identifier for the feature flag (e.g., new_dashboard, advanced_analytics)';
COMMENT ON COLUMN "feature_flags"."rollout_percentage" IS 'Percentage of users/organizations to enable this flag for (0-100)';
COMMENT ON COLUMN "feature_flags"."target_organizations" IS 'Array of organization IDs to specifically target';
COMMENT ON COLUMN "feature_flags"."target_users" IS 'Array of user IDs to specifically target';
COMMENT ON COLUMN "feature_flags"."conditions" IS 'JSON object with complex conditions (e.g., {"plan": "enterprise", "region": "US"})';

