-- Migration: Guides System
-- Created: 2025-01-28
-- Description: Database schema for user guides and tutorials

-- Ensure financbase schema exists
CREATE SCHEMA IF NOT EXISTS "financbase";

-- Guides Table
CREATE TABLE IF NOT EXISTS "financbase"."financbase_guides" (
  "id" serial PRIMARY KEY NOT NULL,
  
  -- Core content
  "title" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "content" text NOT NULL,
  "excerpt" text,
  "description" text,
  
  -- Metadata
  "category" text NOT NULL,
  "type" text NOT NULL DEFAULT 'guide',
  "difficulty" text NOT NULL DEFAULT 'beginner',
  
  -- Media
  "image_url" text,
  "thumbnail_url" text,
  "video_url" text,
  
  -- Authoring
  "author_id" text NOT NULL,
  "status" text NOT NULL DEFAULT 'draft',
  
  -- Guide-specific
  "duration" text,
  "estimated_read_time" integer,
  
  -- SEO
  "meta_title" text,
  "meta_description" text,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "keywords" jsonb DEFAULT '[]'::jsonb NOT NULL,
  
  -- Engagement
  "view_count" integer DEFAULT 0 NOT NULL,
  "rating" integer DEFAULT 0 NOT NULL,
  "helpful_count" integer DEFAULT 0 NOT NULL,
  "not_helpful_count" integer DEFAULT 0 NOT NULL,
  
  -- Organization
  "featured" boolean DEFAULT false NOT NULL,
  "priority" integer DEFAULT 0 NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  
  -- Timestamps
  "published_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Note: author_id is text and stores Clerk user ID, not database UUID
-- Foreign key constraint will be handled at application level
-- If you need a database-level FK, you would need to reference clerk_id from users table

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "financbase_guides_slug_idx" ON "financbase"."financbase_guides"("slug");
CREATE INDEX IF NOT EXISTS "financbase_guides_category_idx" ON "financbase"."financbase_guides"("category");
CREATE INDEX IF NOT EXISTS "financbase_guides_status_idx" ON "financbase"."financbase_guides"("status");
CREATE INDEX IF NOT EXISTS "financbase_guides_featured_idx" ON "financbase"."financbase_guides"("featured");
CREATE INDEX IF NOT EXISTS "financbase_guides_type_idx" ON "financbase"."financbase_guides"("type");
CREATE INDEX IF NOT EXISTS "financbase_guides_difficulty_idx" ON "financbase"."financbase_guides"("difficulty");
CREATE INDEX IF NOT EXISTS "financbase_guides_author_id_idx" ON "financbase"."financbase_guides"("author_id");
CREATE INDEX IF NOT EXISTS "financbase_guides_published_at_idx" ON "financbase"."financbase_guides"("published_at");
CREATE INDEX IF NOT EXISTS "financbase_guides_priority_idx" ON "financbase"."financbase_guides"("priority");

-- Add check constraints
ALTER TABLE "financbase"."financbase_guides" 
ADD CONSTRAINT "financbase_guides_type_check" 
CHECK ("type" IN ('tutorial', 'guide', 'documentation'));

ALTER TABLE "financbase"."financbase_guides" 
ADD CONSTRAINT "financbase_guides_difficulty_check" 
CHECK ("difficulty" IN ('beginner', 'intermediate', 'advanced'));

ALTER TABLE "financbase"."financbase_guides" 
ADD CONSTRAINT "financbase_guides_status_check" 
CHECK ("status" IN ('draft', 'published', 'archived'));

-- Add comment to table
COMMENT ON TABLE "financbase"."financbase_guides" IS 'User guides and tutorials for the Financbase platform';

