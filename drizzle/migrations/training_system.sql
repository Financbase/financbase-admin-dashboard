-- Training System Migration
-- Creates tables for training programs, learning paths, and user progress tracking

-- Create enums (drop first if they exist)
DO $$ BEGIN
    CREATE TYPE "training_difficulty" AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "training_status" AS ENUM ('not_started', 'in_progress', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Training Programs table
CREATE TABLE IF NOT EXISTS "training_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" text,
	"difficulty" "training_difficulty" NOT NULL DEFAULT 'Beginner',
	"icon" text,
	"href" text,
	"topics" jsonb,
	"order" integer DEFAULT 0,
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS "learning_paths" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration" text,
	"icon" text,
	"program_ids" jsonb,
	"is_active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- User Training Progress table
CREATE TABLE IF NOT EXISTS "training_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"status" "training_status" NOT NULL DEFAULT 'not_started',
	"progress" numeric(5, 2) DEFAULT '0',
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"last_accessed_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "training_progress_user_id_financbase_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "financbase"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "training_progress_program_id_training_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE cascade ON UPDATE no action
);

-- User Learning Path Progress table
CREATE TABLE IF NOT EXISTS "learning_path_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"path_id" uuid NOT NULL,
	"status" "training_status" NOT NULL DEFAULT 'not_started',
	"progress" numeric(5, 2) DEFAULT '0',
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completed_programs" jsonb,
	"created_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	CONSTRAINT "learning_path_progress_user_id_financbase_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "financbase"."users"("id") ON DELETE cascade ON UPDATE no action,
	CONSTRAINT "learning_path_progress_path_id_learning_paths_id_fk" FOREIGN KEY ("path_id") REFERENCES "learning_paths"("id") ON DELETE cascade ON UPDATE no action
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "training_progress_user_id_idx" ON "training_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "training_progress_program_id_idx" ON "training_progress" ("program_id");
CREATE INDEX IF NOT EXISTS "learning_path_progress_user_id_idx" ON "learning_path_progress" ("user_id");
CREATE INDEX IF NOT EXISTS "learning_path_progress_path_id_idx" ON "learning_path_progress" ("path_id");
CREATE INDEX IF NOT EXISTS "training_programs_is_active_idx" ON "training_programs" ("is_active");
CREATE INDEX IF NOT EXISTS "learning_paths_is_active_idx" ON "learning_paths" ("is_active");

