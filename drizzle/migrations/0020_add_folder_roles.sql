-- Migration: Add folder_roles table for RBAC folder-level role assignments
-- Created: 2025-01-XX
-- Description: Creates folder_roles table to store RBAC role assignments for folders

CREATE TABLE IF NOT EXISTS "folder_roles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "folder_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "assigned_by" TEXT,
  "assigned_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT "folder_roles_folder_role_unique" UNIQUE("folder_id", "role")
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_folder_roles_folder_id" ON "folder_roles"("folder_id");
CREATE INDEX IF NOT EXISTS "idx_folder_roles_role" ON "folder_roles"("role");

-- Comments for documentation
COMMENT ON TABLE "folder_roles" IS 'Stores RBAC role assignments for folders';
COMMENT ON COLUMN "folder_roles"."folder_id" IS 'Reference to folder ID';
COMMENT ON COLUMN "folder_roles"."role" IS 'RBAC role name (e.g., owner, editor, viewer, commenter)';
COMMENT ON COLUMN "folder_roles"."assigned_by" IS 'User ID who assigned the role';

