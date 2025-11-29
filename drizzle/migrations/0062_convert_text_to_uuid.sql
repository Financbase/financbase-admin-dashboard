-- Migration: Convert TEXT foreign keys to UUID
-- Created: 2025-01-XX
-- Description: Convert existing TEXT foreign key columns to UUID and add proper foreign key constraints
-- This migration handles existing tables that were created with TEXT foreign keys

-- Note: This migration assumes that existing TEXT values are valid UUIDs stored as text
-- If there are invalid UUIDs, this migration will fail and need manual cleanup

-- Incident Response Tables
-- Convert financbase_security_incidents
DO $$ 
BEGIN
  -- Only alter if column is still TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_security_incidents' 
    AND column_name = 'organization_id' 
    AND data_type = 'text'
  ) THEN
    -- Drop existing constraints if they exist
    ALTER TABLE IF EXISTS "financbase_security_incidents" 
      DROP CONSTRAINT IF EXISTS "fk_security_incidents_organization",
      DROP CONSTRAINT IF EXISTS "fk_security_incidents_reported_by",
      DROP CONSTRAINT IF EXISTS "fk_security_incidents_assigned_to";
    
    -- Convert columns to UUID
    ALTER TABLE "financbase_security_incidents" 
      ALTER COLUMN "organization_id" TYPE UUID USING "organization_id"::uuid,
      ALTER COLUMN "reported_by" TYPE UUID USING NULLIF("reported_by", '')::uuid,
      ALTER COLUMN "assigned_to" TYPE UUID USING NULLIF("assigned_to", '')::uuid;
    
    -- Add foreign key constraints
    ALTER TABLE "financbase_security_incidents"
      ADD CONSTRAINT "fk_security_incidents_organization" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "fk_security_incidents_reported_by" 
        FOREIGN KEY ("reported_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
      ADD CONSTRAINT "fk_security_incidents_assigned_to" 
        FOREIGN KEY ("assigned_to") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Convert financbase_ir_team_members
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_ir_team_members' 
    AND column_name = 'organization_id' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_ir_team_members" 
      DROP CONSTRAINT IF EXISTS "fk_ir_team_members_organization",
      DROP CONSTRAINT IF EXISTS "fk_ir_team_members_user";
    
    ALTER TABLE "financbase_ir_team_members" 
      ALTER COLUMN "organization_id" TYPE UUID USING "organization_id"::uuid,
      ALTER COLUMN "user_id" TYPE UUID USING "user_id"::uuid;
    
    ALTER TABLE "financbase_ir_team_members"
      ADD CONSTRAINT "fk_ir_team_members_organization" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "fk_ir_team_members_user" 
        FOREIGN KEY ("user_id") REFERENCES "financbase"."users"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Convert financbase_incident_team_assignments
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_incident_team_assignments' 
    AND column_name = 'assigned_by' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_incident_team_assignments" 
      DROP CONSTRAINT IF EXISTS "fk_incident_team_assignments_assigned_by";
    
    ALTER TABLE "financbase_incident_team_assignments" 
      ALTER COLUMN "assigned_by" TYPE UUID USING NULLIF("assigned_by", '')::uuid;
    
    ALTER TABLE "financbase_incident_team_assignments"
      ADD CONSTRAINT "fk_incident_team_assignments_assigned_by" 
        FOREIGN KEY ("assigned_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Convert financbase_ir_runbooks
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_ir_runbooks' 
    AND column_name = 'organization_id' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_ir_runbooks" 
      DROP CONSTRAINT IF EXISTS "fk_ir_runbooks_organization",
      DROP CONSTRAINT IF EXISTS "fk_ir_runbooks_created_by",
      DROP CONSTRAINT IF EXISTS "fk_ir_runbooks_approved_by";
    
    ALTER TABLE "financbase_ir_runbooks" 
      ALTER COLUMN "organization_id" TYPE UUID USING "organization_id"::uuid,
      ALTER COLUMN "created_by" TYPE UUID USING NULLIF("created_by", '')::uuid,
      ALTER COLUMN "approved_by" TYPE UUID USING NULLIF("approved_by", '')::uuid;
    
    ALTER TABLE "financbase_ir_runbooks"
      ADD CONSTRAINT "fk_ir_runbooks_organization" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "fk_ir_runbooks_created_by" 
        FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
      ADD CONSTRAINT "fk_ir_runbooks_approved_by" 
        FOREIGN KEY ("approved_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Convert financbase_runbook_executions
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_runbook_executions' 
    AND column_name = 'executed_by' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_runbook_executions" 
      DROP CONSTRAINT IF EXISTS "fk_runbook_executions_executed_by";
    
    ALTER TABLE "financbase_runbook_executions" 
      ALTER COLUMN "executed_by" TYPE UUID USING NULLIF("executed_by", '')::uuid;
    
    ALTER TABLE "financbase_runbook_executions"
      ADD CONSTRAINT "fk_runbook_executions_executed_by" 
        FOREIGN KEY ("executed_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Convert financbase_ir_communication_templates
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_ir_communication_templates' 
    AND column_name = 'organization_id' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_ir_communication_templates" 
      DROP CONSTRAINT IF EXISTS "fk_ir_communication_templates_organization",
      DROP CONSTRAINT IF EXISTS "fk_ir_communication_templates_created_by";
    
    ALTER TABLE "financbase_ir_communication_templates" 
      ALTER COLUMN "organization_id" TYPE UUID USING "organization_id"::uuid,
      ALTER COLUMN "created_by" TYPE UUID USING NULLIF("created_by", '')::uuid;
    
    ALTER TABLE "financbase_ir_communication_templates"
      ADD CONSTRAINT "fk_ir_communication_templates_organization" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "fk_ir_communication_templates_created_by" 
        FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- Convert financbase_ir_drills
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'financbase_ir_drills' 
    AND column_name = 'organization_id' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE IF EXISTS "financbase_ir_drills" 
      DROP CONSTRAINT IF EXISTS "fk_ir_drills_organization",
      DROP CONSTRAINT IF EXISTS "fk_ir_drills_scheduled_by",
      DROP CONSTRAINT IF EXISTS "fk_ir_drills_conducted_by";
    
    ALTER TABLE "financbase_ir_drills" 
      ALTER COLUMN "organization_id" TYPE UUID USING "organization_id"::uuid,
      ALTER COLUMN "scheduled_by" TYPE UUID USING NULLIF("scheduled_by", '')::uuid,
      ALTER COLUMN "conducted_by" TYPE UUID USING NULLIF("conducted_by", '')::uuid;
    
    ALTER TABLE "financbase_ir_drills"
      ADD CONSTRAINT "fk_ir_drills_organization" 
        FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
      ADD CONSTRAINT "fk_ir_drills_scheduled_by" 
        FOREIGN KEY ("scheduled_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL,
      ADD CONSTRAINT "fk_ir_drills_conducted_by" 
        FOREIGN KEY ("conducted_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL;
  END IF;
END $$;

