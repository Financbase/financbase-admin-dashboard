-- Migration: Convert organizations.id from INTEGER to UUID
-- This aligns the database schema with the code expectations and migrations
-- 
-- IMPORTANT: This is a destructive migration that changes the primary key type
-- Ensure you have a backup before running this migration
--
-- Steps:
-- 1. Create new UUID column
-- 2. Generate UUIDs for existing organizations
-- 3. Update foreign key references
-- 4. Drop old column and constraints
-- 5. Rename new column to id

BEGIN;

-- Step 1: Add new UUID column for organizations
ALTER TABLE "organizations" ADD COLUMN "id_uuid" UUID DEFAULT gen_random_uuid();

-- Step 2: Update organization_members to use UUID (create new column)
ALTER TABLE "organization_members" ADD COLUMN "organization_id_uuid" UUID;

-- Step 3: Generate UUIDs for existing organizations and link them
-- This creates a mapping between old integer IDs and new UUIDs
UPDATE "organizations" 
SET "id_uuid" = gen_random_uuid()
WHERE "id_uuid" IS NULL;

-- Step 4: Update organization_members with new UUID foreign keys
UPDATE "organization_members" om
SET "organization_id_uuid" = o."id_uuid"
FROM "organizations" o
WHERE om."organization_id"::text = o."id"::text;

-- Step 5: Drop foreign key constraints that reference the old integer column
ALTER TABLE "organization_members" 
  DROP CONSTRAINT IF EXISTS "organization_members_organization_id_organizations_id_fk";

-- Step 6: Drop the old integer column from organization_members
ALTER TABLE "organization_members" 
  DROP COLUMN IF EXISTS "organization_id";

-- Step 7: Rename the new UUID column in organization_members
ALTER TABLE "organization_members" 
  RENAME COLUMN "organization_id_uuid" TO "organization_id";

-- Step 8: Add foreign key constraint with UUID
ALTER TABLE "organization_members"
  ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk"
  FOREIGN KEY ("organization_id") 
  REFERENCES "organizations"("id_uuid") 
  ON DELETE NO ACTION 
  ON UPDATE NO ACTION;

-- Step 9: Drop the old integer primary key and constraints from organizations
ALTER TABLE "organizations" 
  DROP CONSTRAINT IF EXISTS "organizations_pkey";

-- Step 10: Rename the UUID column to id in organizations
ALTER TABLE "organizations" 
  DROP COLUMN IF EXISTS "id";

ALTER TABLE "organizations" 
  RENAME COLUMN "id_uuid" TO "id";

-- Step 11: Add primary key constraint on the new UUID column
ALTER TABLE "organizations"
  ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

-- Step 12: Ensure the default is set correctly
ALTER TABLE "organizations" 
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

COMMIT;

-- Note: After this migration, verify that:
-- 1. All organizations have UUID ids
-- 2. All organization_members have correct UUID foreign keys
-- 3. No data loss occurred
-- Run: SELECT COUNT(*) FROM organizations;
-- Run: SELECT COUNT(*) FROM organization_members WHERE organization_id IS NOT NULL;

