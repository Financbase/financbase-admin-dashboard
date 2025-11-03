-- Migration Script: Convert organizations.id from INTEGER to UUID
-- 
-- This script converts the organizations table primary key from INTEGER to UUID
-- to align with the code schema and migrations.
--
-- IMPORTANT SAFETY CHECKS:
-- 1. Backup your database before running this migration
-- 2. Test in a development environment first
-- 3. Verify all foreign key relationships
--
-- ROLLBACK: If something goes wrong, you'll need to restore from backup
--           There's no automatic rollback for this type of structural change

BEGIN;

-- Pre-migration checks
DO $$
BEGIN
    -- Check if organizations table exists and has data
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
        RAISE EXCEPTION 'organizations table does not exist';
    END IF;
    
    -- Check current column type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'organizations' 
        AND column_name = 'id'
        AND data_type = 'integer'
    ) THEN
        RAISE NOTICE 'organizations.id is not INTEGER - migration may not be needed';
    END IF;
END $$;

-- Step 1: Create temporary UUID column
ALTER TABLE "organizations" 
ADD COLUMN IF NOT EXISTS "id_new" UUID DEFAULT gen_random_uuid();

-- Step 2: Generate UUIDs for existing organizations
UPDATE "organizations" 
SET "id_new" = gen_random_uuid()
WHERE "id_new" IS NULL;

-- Step 3: Update organization_members table
-- First, check if organization_members exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_members') THEN
        -- Add new UUID column
        ALTER TABLE "organization_members" 
        ADD COLUMN IF NOT EXISTS "organization_id_new" UUID;
        
        -- Update with new UUIDs
        UPDATE "organization_members" om
        SET "organization_id_new" = o."id_new"
        FROM "organizations" o
        WHERE om."organization_id"::text = o."id"::text;
        
        -- Drop old foreign key constraint if it exists
        ALTER TABLE "organization_members" 
        DROP CONSTRAINT IF EXISTS "organization_members_organization_id_organizations_id_fk";
        
        -- Drop old integer column
        ALTER TABLE "organization_members" 
        DROP COLUMN IF EXISTS "organization_id";
        
        -- Rename new column
        ALTER TABLE "organization_members" 
        RENAME COLUMN "organization_id_new" TO "organization_id";
        
        -- Add new foreign key constraint
        ALTER TABLE "organization_members"
        ADD CONSTRAINT "organization_members_organization_id_organizations_id_fk"
        FOREIGN KEY ("organization_id") 
        REFERENCES "organizations"("id_new") 
        ON DELETE NO ACTION 
        ON UPDATE NO ACTION;
    END IF;
END $$;

-- Step 4: Handle organizations table
-- Drop old primary key constraint
ALTER TABLE "organizations" 
DROP CONSTRAINT IF EXISTS "organizations_pkey";

-- Drop old integer column (CAUTION: This removes the old ID)
ALTER TABLE "organizations" 
DROP COLUMN IF EXISTS "id";

-- Rename new UUID column to id
ALTER TABLE "organizations" 
RENAME COLUMN "id_new" TO "id";

-- Add new primary key constraint
ALTER TABLE "organizations"
ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");

-- Set default for future inserts
ALTER TABLE "organizations" 
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Verification queries (run these after migration to verify)
-- SELECT COUNT(*) as org_count FROM organizations;
-- SELECT COUNT(*) as member_count FROM organization_members WHERE organization_id IS NOT NULL;
-- SELECT data_type FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'id';

COMMIT;

-- Post-migration verification
DO $$
DECLARE
    org_count INTEGER;
    member_count INTEGER;
    id_type TEXT;
BEGIN
    SELECT COUNT(*) INTO org_count FROM organizations;
    SELECT COUNT(*) INTO member_count FROM organization_members WHERE organization_id IS NOT NULL;
    SELECT data_type INTO id_type FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'id';
    
    RAISE NOTICE 'Migration completed. Organizations: %, Members: %, ID Type: %', org_count, member_count, id_type;
    
    IF id_type != 'uuid' THEN
        RAISE WARNING 'ID type is % but expected uuid - please verify migration', id_type;
    END IF;
END $$;

