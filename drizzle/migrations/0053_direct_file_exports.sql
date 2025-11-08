-- Migration: Direct File Export Metadata Table
-- Created: 2025-01-28
-- Description: Database schema for storing Direct File export metadata (NO PII/FTI)

-- IMPORTANT: This table stores ONLY export metadata (filename, export date, format).
-- NO PII (Personally Identifiable Information) or FTI (Federal Tax Information) is stored.

CREATE TABLE IF NOT EXISTS "direct_file_exports" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "format" TEXT NOT NULL,
  "file_size" INTEGER,
  "export_date" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT "direct_file_exports_format_check" CHECK ("format" IN ('mef-xml', 'json'))
);

-- Index for user queries
CREATE INDEX IF NOT EXISTS "direct_file_exports_user_id_idx" ON "direct_file_exports" ("user_id");

-- Index for export date queries
CREATE INDEX IF NOT EXISTS "direct_file_exports_export_date_idx" ON "direct_file_exports" ("export_date" DESC);

