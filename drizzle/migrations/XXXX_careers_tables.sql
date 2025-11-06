-- Migration: Create careers and job applications tables
-- Created: 2025-01-27
-- Description: Adds job postings and applications tables for careers management

-- Create job postings table
CREATE TABLE IF NOT EXISTS "financbase_job_postings" (
	"id" SERIAL PRIMARY KEY,
	"user_id" TEXT NOT NULL,
	"title" TEXT NOT NULL,
	"department" TEXT NOT NULL,
	"location" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"experience" TEXT NOT NULL,
	"description" TEXT NOT NULL,
	"full_description" TEXT,
	"requirements" JSONB NOT NULL DEFAULT '[]'::jsonb,
	"responsibilities" JSONB DEFAULT '[]'::jsonb,
	"qualifications" JSONB DEFAULT '[]'::jsonb,
	"salary" TEXT,
	"benefits" JSONB DEFAULT '[]'::jsonb,
	"status" TEXT NOT NULL DEFAULT 'draft',
	"is_featured" BOOLEAN NOT NULL DEFAULT false,
	"applicants" INTEGER NOT NULL DEFAULT 0,
	"posted_at" TIMESTAMP,
	"closed_at" TIMESTAMP,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT "job_postings_status_check" CHECK ("status" IN ('draft', 'published', 'closed', 'archived'))
);

-- Create job applications table
CREATE TABLE IF NOT EXISTS "financbase_job_applications" (
	"id" SERIAL PRIMARY KEY,
	"job_id" INTEGER NOT NULL REFERENCES "financbase_job_postings"("id") ON DELETE CASCADE,
	"first_name" TEXT NOT NULL,
	"last_name" TEXT NOT NULL,
	"email" TEXT NOT NULL,
	"phone" TEXT,
	"linkedin" TEXT,
	"portfolio" TEXT,
	"resume" TEXT,
	"cover_letter" TEXT,
	"status" TEXT NOT NULL DEFAULT 'pending',
	"notes" TEXT,
	"created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	"updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT "job_applications_status_check" CHECK ("status" IN ('pending', 'reviewing', 'interviewing', 'accepted', 'rejected'))
);

-- Create indexes for job postings
CREATE INDEX IF NOT EXISTS "job_postings_user_id_idx" ON "financbase_job_postings"("user_id");
CREATE INDEX IF NOT EXISTS "job_postings_department_idx" ON "financbase_job_postings"("department");
CREATE INDEX IF NOT EXISTS "job_postings_status_idx" ON "financbase_job_postings"("status");
CREATE INDEX IF NOT EXISTS "job_postings_featured_idx" ON "financbase_job_postings"("is_featured");
CREATE INDEX IF NOT EXISTS "job_postings_posted_at_idx" ON "financbase_job_postings"("posted_at");

-- Create indexes for job applications
CREATE INDEX IF NOT EXISTS "job_applications_job_id_idx" ON "financbase_job_applications"("job_id");
CREATE INDEX IF NOT EXISTS "job_applications_email_idx" ON "financbase_job_applications"("email");
CREATE INDEX IF NOT EXISTS "job_applications_status_idx" ON "financbase_job_applications"("status");

-- Add comments
COMMENT ON TABLE "financbase_job_postings" IS 'Stores career/job postings for the public careers page';
COMMENT ON TABLE "financbase_job_applications" IS 'Stores applications submitted for job postings';

