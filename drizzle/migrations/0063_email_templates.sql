-- Migration: Email Templates System
-- Created: 2025-01-XX
-- Description: Database schema for email templates that can be stored in database or filesystem

-- Email Templates Table
CREATE TABLE IF NOT EXISTS "financbase_email_templates" (
  "id" SERIAL PRIMARY KEY,
  "organization_id" UUID NOT NULL,
  "created_by" UUID,
  "name" TEXT NOT NULL,
  "template_id" TEXT NOT NULL UNIQUE,
  "subject" TEXT NOT NULL,
  "html" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true NOT NULL,
  "is_built_in" BOOLEAN DEFAULT false NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "fk_email_templates_organization" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE,
  CONSTRAINT "fk_email_templates_created_by" FOREIGN KEY ("created_by") REFERENCES "financbase"."users"("id") ON DELETE SET NULL
);

-- Create indexes for email templates
CREATE INDEX IF NOT EXISTS "idx_email_templates_org_id" ON "financbase_email_templates"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_email_templates_template_id" ON "financbase_email_templates"("template_id");
CREATE INDEX IF NOT EXISTS "idx_email_templates_active" ON "financbase_email_templates"("is_active");
CREATE INDEX IF NOT EXISTS "idx_email_templates_org_template" ON "financbase_email_templates"("organization_id", "template_id");

-- Add comment to table
COMMENT ON TABLE "financbase_email_templates" IS 'Email templates that can override built-in templates or provide custom templates per organization';

