-- Migration: Multi-Organization Support
-- Created: 2025-01-XX
-- Description: Enable multi-business/organization management with organization switching, subscriptions, invitations, and settings

-- Step 1: Make users.organization_id nullable to support multi-organization membership
ALTER TABLE "financbase"."users" 
  ALTER COLUMN "organization_id" DROP NOT NULL;

-- Step 2: Ensure subscription_status enum exists
DO $$ BEGIN
  CREATE TYPE "public"."subscription_status" AS ENUM('active', 'inactive', 'cancelled', 'expired', 'suspended', 'trial');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 3: Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."subscription_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "price_monthly" numeric(10, 2) NOT NULL DEFAULT 0,
  "price_yearly" numeric(10, 2) NOT NULL DEFAULT 0,
  "interval" text DEFAULT 'monthly',
  "features" jsonb NOT NULL DEFAULT '{}',
  "limits" jsonb NOT NULL DEFAULT '{}',
  "is_popular" boolean DEFAULT false,
  "is_enterprise" boolean DEFAULT false,
  "sort_order" integer DEFAULT 0,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

-- Step 4: Add new fields to organizations table
DO $$ 
BEGIN
  -- Add subscription_plan_id only if subscription_plans table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') THEN
    ALTER TABLE "public"."organizations"
      ADD COLUMN IF NOT EXISTS "subscription_plan_id" uuid REFERENCES "public"."subscription_plans"("id") ON DELETE SET NULL;
  ELSE
    ALTER TABLE "public"."organizations"
      ADD COLUMN IF NOT EXISTS "subscription_plan_id" uuid;
  END IF;
END $$;

ALTER TABLE "public"."organizations"
  ADD COLUMN IF NOT EXISTS "billing_email" text,
  ADD COLUMN IF NOT EXISTS "tax_id" text,
  ADD COLUMN IF NOT EXISTS "address" text,
  ADD COLUMN IF NOT EXISTS "phone" text,
  ADD COLUMN IF NOT EXISTS "is_active" boolean DEFAULT true NOT NULL;

-- Convert existing settings text column to JSONB if it exists
DO $$ 
BEGIN
  -- Check if settings column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'organizations' 
    AND column_name = 'settings' 
    AND data_type = 'text'
  ) THEN
    -- Add new JSONB settings column
    ALTER TABLE "public"."organizations"
      ADD COLUMN IF NOT EXISTS "settings_jsonb" jsonb DEFAULT '{}';
    
    -- Migrate existing text settings to JSONB (if any valid JSON exists)
    UPDATE "public"."organizations"
    SET "settings_jsonb" = CASE 
      WHEN "settings" IS NOT NULL AND "settings" != '' THEN
        CASE 
          WHEN "settings"::text ~ '^[\s]*\{.*\}[\s]*$' THEN "settings"::jsonb
          ELSE jsonb_build_object('legacy_settings', "settings")
        END
      ELSE '{}'::jsonb
    END
    WHERE "settings_jsonb" IS NULL;
    
    -- Drop old text column and rename JSONB column
    ALTER TABLE "public"."organizations"
      DROP COLUMN IF EXISTS "settings";
    
    ALTER TABLE "public"."organizations"
      RENAME COLUMN "settings_jsonb" TO "settings";
  ELSE
    -- If settings doesn't exist or is already JSONB, ensure it exists as JSONB
    ALTER TABLE "public"."organizations"
      ADD COLUMN IF NOT EXISTS "settings" jsonb DEFAULT '{}';
  END IF;
END $$;

-- Step 5: Create organization_subscriptions table
CREATE TABLE IF NOT EXISTS "public"."organization_subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "plan_id" uuid,
  "status" "public"."subscription_status" DEFAULT 'trial',
  "current_period_start" timestamp with time zone NOT NULL,
  "current_period_end" timestamp with time zone NOT NULL,
  "trial_start" timestamp with time zone,
  "trial_end" timestamp with time zone,
  "cancelled_at" timestamp with time zone,
  "cancel_reason" text,
  "next_billing_date" timestamp with time zone,
  "auto_renew" boolean DEFAULT true,
  "stripe_subscription_id" text,
  "stripe_customer_id" text,
  "metadata" jsonb DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Add foreign key constraint for plan_id if subscription_plans exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_plans') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'organization_subscriptions_plan_id_fkey'
      AND table_schema = 'public'
      AND table_name = 'organization_subscriptions'
    ) THEN
      ALTER TABLE "public"."organization_subscriptions"
        ADD CONSTRAINT "organization_subscriptions_plan_id_fkey" 
        FOREIGN KEY ("plan_id") REFERENCES "public"."subscription_plans"("id");
    END IF;
  END IF;
END $$;

-- Step 6: Create invitation_status enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 7: Create organization_invitations table
CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "email" text NOT NULL,
  "role" text DEFAULT 'member' CHECK ("role" IN ('owner', 'admin', 'member', 'viewer')),
  "invited_by" uuid REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
  "token" text NOT NULL UNIQUE,
  "expires_at" timestamp with time zone NOT NULL,
  "status" "public"."invitation_status" DEFAULT 'pending',
  "accepted_at" timestamp with time zone,
  "declined_at" timestamp with time zone,
  "message" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Step 8: Create organization_settings table
CREATE TABLE IF NOT EXISTS "public"."organization_settings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL UNIQUE REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  "settings" jsonb DEFAULT '{}',
  "branding" jsonb DEFAULT '{}',
  "integrations" jsonb DEFAULT '{}',
  "features" jsonb DEFAULT '{}',
  "notifications" jsonb DEFAULT '{}',
  "security" jsonb DEFAULT '{}',
  "compliance" jsonb DEFAULT '{}',
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS "organization_subscriptions_organization_id_idx" 
  ON "organization_subscriptions" USING btree ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_subscriptions_status_idx" 
  ON "organization_subscriptions" USING btree ("status");
CREATE INDEX IF NOT EXISTS "organization_subscriptions_stripe_subscription_id_idx" 
  ON "organization_subscriptions" USING btree ("stripe_subscription_id");

CREATE INDEX IF NOT EXISTS "organization_invitations_organization_id_idx" 
  ON "organization_invitations" USING btree ("organization_id");
CREATE INDEX IF NOT EXISTS "organization_invitations_email_idx" 
  ON "organization_invitations" USING btree ("email");
CREATE INDEX IF NOT EXISTS "organization_invitations_token_idx" 
  ON "organization_invitations" USING btree ("token");
CREATE INDEX IF NOT EXISTS "organization_invitations_status_idx" 
  ON "organization_invitations" USING btree ("status");

CREATE INDEX IF NOT EXISTS "organization_settings_organization_id_idx" 
  ON "organization_settings" USING btree ("organization_id");

CREATE INDEX IF NOT EXISTS "organizations_subscription_plan_id_idx" 
  ON "public"."organizations" USING btree ("subscription_plan_id");

-- Step 8: Data Migration - Create default organizations for existing users
-- This ensures all existing users have at least one organization
DO $$
DECLARE
  user_record RECORD;
  org_id uuid;
  org_slug text;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.organization_id, o.name as org_name
    FROM "financbase"."users" u
    LEFT JOIN "public"."organizations" o ON u.organization_id = o.id
    WHERE u.organization_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM "public"."organization_members" om 
      WHERE om.user_id = u.id
    )
  LOOP
    -- Create organization if user doesn't have one
    IF user_record.organization_id IS NULL THEN
      org_slug := lower(regexp_replace(user_record.email, '[^a-z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 8);
      
      INSERT INTO "public"."organizations" (
        "id", "name", "slug", "owner_id", "created_at", "updated_at"
      ) VALUES (
        gen_random_uuid(),
        COALESCE(user_record.org_name, 'My Organization'),
        org_slug,
        user_record.id,
        now(),
        now()
      ) RETURNING "id" INTO org_id;
      
      -- Update user's organization_id
      UPDATE "financbase"."users"
      SET "organization_id" = org_id
      WHERE "id" = user_record.id;
      
      -- Add user as owner in organization_members
      INSERT INTO "public"."organization_members" (
        "organization_id", "user_id", "role", "joined_at"
      ) VALUES (
        org_id, user_record.id, 'owner', now()
      ) ON CONFLICT DO NOTHING;
    ELSE
      -- User has organization_id but might not be in organization_members
      IF NOT EXISTS (
        SELECT 1 FROM "public"."organization_members" 
        WHERE "organization_id" = user_record.organization_id 
        AND "user_id" = user_record.id
      ) THEN
        INSERT INTO "public"."organization_members" (
          "organization_id", "user_id", "role", "joined_at"
        ) VALUES (
          user_record.organization_id, user_record.id, 'owner', now()
        ) ON CONFLICT DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END $$;

-- Step 9: Migrate existing user subscriptions to organization subscriptions
-- This creates organization subscriptions based on user subscriptions
DO $$
DECLARE
  sub_record RECORD;
  org_id uuid;
BEGIN
  -- Only migrate if user_subscriptions table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_subscriptions') THEN
    FOR sub_record IN 
      SELECT us.*, u.organization_id
      FROM "public"."user_subscriptions" us
      JOIN "financbase"."users" u ON us.user_id = u.id
      WHERE u.organization_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM "public"."organization_subscriptions" os
        WHERE os.organization_id = u.organization_id
        AND os.plan_id = us.plan_id
        AND os.status = us.status
      )
    LOOP
      -- Create organization subscription from user subscription
      INSERT INTO "public"."organization_subscriptions" (
      "organization_id",
      "plan_id",
      "status",
      "current_period_start",
      "current_period_end",
      "trial_start",
      "trial_end",
      "cancelled_at",
      "cancel_reason",
      "next_billing_date",
      "auto_renew",
      "stripe_subscription_id",
      "stripe_customer_id",
      "metadata",
      "created_at",
      "updated_at"
    ) VALUES (
      sub_record.organization_id,
      sub_record.plan_id,
      sub_record.status,
      sub_record.current_period_start,
      sub_record.current_period_end,
      sub_record.trial_start,
      sub_record.trial_end,
      sub_record.cancelled_at,
      sub_record.cancel_reason,
      sub_record.next_billing_date,
      sub_record.auto_renew,
      sub_record.stripe_subscription_id,
      sub_record.stripe_customer_id,
        COALESCE(sub_record.metadata, '{}'::jsonb),
        sub_record.created_at,
        sub_record.updated_at
      ) ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END $$;

-- Step 10: Create default organization settings for existing organizations
INSERT INTO "public"."organization_settings" ("organization_id", "settings", "created_at", "updated_at")
SELECT 
  o.id,
  '{}'::jsonb,
  now(),
  now()
FROM "public"."organizations" o
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."organization_settings" os WHERE os.organization_id = o.id
)
ON CONFLICT ("organization_id") DO NOTHING;

-- Step 11: Add comment for documentation
COMMENT ON TABLE "public"."organization_subscriptions" IS 'Subscriptions linked to organizations instead of individual users';
COMMENT ON TABLE "public"."organization_invitations" IS 'Email invitations for users to join organizations';
COMMENT ON TABLE "public"."organization_settings" IS 'Organization-specific configuration and settings';

