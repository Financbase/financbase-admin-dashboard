-- Migration: Blog CMS System
-- Created: 2025-01-28
-- Description: Database schema for blog content management system with posts, categories, and comments

-- Blog Categories Table
CREATE TABLE IF NOT EXISTS "financbase_blog_categories" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "post_count" INTEGER DEFAULT 0 NOT NULL,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL
);

-- Unique indexes for blog categories
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_name_unique" ON "financbase_blog_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "blog_categories_slug_unique" ON "financbase_blog_categories"("slug");

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS "financbase_blog_posts" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "excerpt" TEXT,
  "content" TEXT NOT NULL,
  "featured_image" TEXT,
  "category_id" INTEGER,
  "status" TEXT DEFAULT 'draft' NOT NULL,
  "is_featured" BOOLEAN DEFAULT false NOT NULL,
  "view_count" INTEGER DEFAULT 0 NOT NULL,
  "like_count" INTEGER DEFAULT 0 NOT NULL,
  "comment_count" INTEGER DEFAULT 0 NOT NULL,
  "published_at" TIMESTAMP,
  "scheduled_at" TIMESTAMP,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT "blog_posts_status_check" CHECK ("status" IN ('draft', 'published', 'scheduled', 'archived')),
  CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "financbase_blog_categories"("id") ON DELETE SET NULL
);

-- Unique index for blog post slugs
CREATE UNIQUE INDEX IF NOT EXISTS "blog_posts_slug_unique" ON "financbase_blog_posts"("slug");

-- Indexes for blog posts
CREATE INDEX IF NOT EXISTS "blog_posts_user_id_idx" ON "financbase_blog_posts"("user_id");
CREATE INDEX IF NOT EXISTS "blog_posts_category_id_idx" ON "financbase_blog_posts"("category_id");
CREATE INDEX IF NOT EXISTS "blog_posts_status_idx" ON "financbase_blog_posts"("status");
CREATE INDEX IF NOT EXISTS "blog_posts_published_at_idx" ON "financbase_blog_posts"("published_at");

-- Blog Comments Table
CREATE TABLE IF NOT EXISTS "financbase_blog_comments" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "post_id" INTEGER NOT NULL,
  "user_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending' NOT NULL,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT "blog_comments_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected')),
  CONSTRAINT "blog_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "financbase_blog_posts"("id") ON DELETE CASCADE
);

-- Indexes for blog comments
CREATE INDEX IF NOT EXISTS "blog_comments_post_id_idx" ON "financbase_blog_comments"("post_id");
CREATE INDEX IF NOT EXISTS "blog_comments_user_id_idx" ON "financbase_blog_comments"("user_id");
CREATE INDEX IF NOT EXISTS "blog_comments_status_idx" ON "financbase_blog_comments"("status");

-- Comments for documentation
COMMENT ON TABLE "financbase_blog_categories" IS 'Blog post categories for organizing content';
COMMENT ON TABLE "financbase_blog_posts" IS 'Blog posts with content, metadata, and publishing status';
COMMENT ON TABLE "financbase_blog_comments" IS 'User comments on blog posts with moderation support';
COMMENT ON COLUMN "financbase_blog_posts"."status" IS 'Post status: draft, published, scheduled, or archived';
COMMENT ON COLUMN "financbase_blog_posts"."slug" IS 'URL-friendly unique identifier for the blog post';
COMMENT ON COLUMN "financbase_blog_comments"."status" IS 'Comment moderation status: pending, approved, or rejected';

