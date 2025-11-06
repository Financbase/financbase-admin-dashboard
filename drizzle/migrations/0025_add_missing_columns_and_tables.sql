-- Migration: Add Missing Columns and Tables
-- Created: 2025-11-04
-- Description: Add missing columns to notifications and user_preferences tables, and create support_tickets table

-- Add missing columns to notifications table
DO $$ 
BEGIN
    -- Add category column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "category" TEXT;
        
        RAISE NOTICE 'Added category column to notifications table';
    ELSE
        RAISE NOTICE 'category column already exists in notifications table';
    END IF;

    -- Add priority column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "priority" TEXT DEFAULT 'normal';
        
        RAISE NOTICE 'Added priority column to notifications table';
    ELSE
        RAISE NOTICE 'priority column already exists in notifications table';
    END IF;

    -- Add action_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'action_url'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "action_url" TEXT;
        
        RAISE NOTICE 'Added action_url column to notifications table';
    ELSE
        RAISE NOTICE 'action_url column already exists in notifications table';
    END IF;

    -- Add action_label column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'action_label'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "action_label" TEXT;
        
        RAISE NOTICE 'Added action_label column to notifications table';
    ELSE
        RAISE NOTICE 'action_label column already exists in notifications table';
    END IF;

    -- Add data column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "data" JSONB;
        
        RAISE NOTICE 'Added data column to notifications table';
    ELSE
        RAISE NOTICE 'data column already exists in notifications table';
    END IF;

    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "metadata" JSONB;
        
        RAISE NOTICE 'Added metadata column to notifications table';
    ELSE
        RAISE NOTICE 'metadata column already exists in notifications table';
    END IF;

    -- Add archived column if it doesn't exist (for isArchived)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'archived'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "archived" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added archived column to notifications table';
    ELSE
        RAISE NOTICE 'archived column already exists in notifications table';
    END IF;

    -- Add archived_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'archived_at'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "archived_at" TIMESTAMP;
        
        RAISE NOTICE 'Added archived_at column to notifications table';
    ELSE
        RAISE NOTICE 'archived_at column already exists in notifications table';
    END IF;

    -- Add expires_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "expires_at" TIMESTAMP;
        
        RAISE NOTICE 'Added expires_at column to notifications table';
    ELSE
        RAISE NOTICE 'expires_at column already exists in notifications table';
    END IF;
END $$;

-- Add missing columns to user_preferences table
DO $$ 
BEGIN
    -- Add compact_mode column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'compact_mode'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "compact_mode" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added compact_mode column to user_preferences table';
    ELSE
        RAISE NOTICE 'compact_mode column already exists in user_preferences table';
    END IF;

    -- Add high_contrast column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'high_contrast'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "high_contrast" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added high_contrast column to user_preferences table';
    ELSE
        RAISE NOTICE 'high_contrast column already exists in user_preferences table';
    END IF;

    -- Add font_size column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'font_size'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "font_size" TEXT DEFAULT 'medium' CHECK ("font_size" IN ('small', 'medium', 'large'));
        
        RAISE NOTICE 'Added font_size column to user_preferences table';
    ELSE
        RAISE NOTICE 'font_size column already exists in user_preferences table';
    END IF;

    -- Add charts_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'charts_enabled'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "charts_enabled" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added charts_enabled column to user_preferences table';
    ELSE
        RAISE NOTICE 'charts_enabled column already exists in user_preferences table';
    END IF;

    -- Add analytics_enabled column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'analytics_enabled'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "analytics_enabled" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added analytics_enabled column to user_preferences table';
    ELSE
        RAISE NOTICE 'analytics_enabled column already exists in user_preferences table';
    END IF;

    -- Add auto_refresh column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'auto_refresh'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "auto_refresh" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added auto_refresh column to user_preferences table';
    ELSE
        RAISE NOTICE 'auto_refresh column already exists in user_preferences table';
    END IF;

    -- Add refresh_interval column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'refresh_interval'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "refresh_interval" TEXT DEFAULT '5m' CHECK ("refresh_interval" IN ('30s', '1m', '5m', '15m', '30m'));
        
        RAISE NOTICE 'Added refresh_interval column to user_preferences table';
    ELSE
        RAISE NOTICE 'refresh_interval column already exists in user_preferences table';
    END IF;

    -- Add email_notifications column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'email_notifications'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "email_notifications" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added email_notifications column to user_preferences table';
    ELSE
        RAISE NOTICE 'email_notifications column already exists in user_preferences table';
    END IF;

    -- Add push_notifications column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'push_notifications'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "push_notifications" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added push_notifications column to user_preferences table';
    ELSE
        RAISE NOTICE 'push_notifications column already exists in user_preferences table';
    END IF;

    -- Add desktop_notifications column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'desktop_notifications'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "desktop_notifications" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added desktop_notifications column to user_preferences table';
    ELSE
        RAISE NOTICE 'desktop_notifications column already exists in user_preferences table';
    END IF;

    -- Add notification_sounds column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'notification_sounds'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "notification_sounds" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added notification_sounds column to user_preferences table';
    ELSE
        RAISE NOTICE 'notification_sounds column already exists in user_preferences table';
    END IF;

    -- Add weekly_digest column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'weekly_digest'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "weekly_digest" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added weekly_digest column to user_preferences table';
    ELSE
        RAISE NOTICE 'weekly_digest column already exists in user_preferences table';
    END IF;

    -- Add monthly_report column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'monthly_report'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "monthly_report" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added monthly_report column to user_preferences table';
    ELSE
        RAISE NOTICE 'monthly_report column already exists in user_preferences table';
    END IF;

    -- Add analytics_tracking column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'analytics_tracking'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "analytics_tracking" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added analytics_tracking column to user_preferences table';
    ELSE
        RAISE NOTICE 'analytics_tracking column already exists in user_preferences table';
    END IF;

    -- Add error_reporting column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'error_reporting'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "error_reporting" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added error_reporting column to user_preferences table';
    ELSE
        RAISE NOTICE 'error_reporting column already exists in user_preferences table';
    END IF;

    -- Add usage_stats column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'usage_stats'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "usage_stats" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added usage_stats column to user_preferences table';
    ELSE
        RAISE NOTICE 'usage_stats column already exists in user_preferences table';
    END IF;

    -- Add marketing_emails column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'marketing_emails'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "marketing_emails" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added marketing_emails column to user_preferences table';
    ELSE
        RAISE NOTICE 'marketing_emails column already exists in user_preferences table';
    END IF;

    -- Add data_export column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'data_export'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "data_export" BOOLEAN DEFAULT true;
        
        RAISE NOTICE 'Added data_export column to user_preferences table';
    ELSE
        RAISE NOTICE 'data_export column already exists in user_preferences table';
    END IF;

    -- Add experimental_features column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'experimental_features'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "experimental_features" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added experimental_features column to user_preferences table';
    ELSE
        RAISE NOTICE 'experimental_features column already exists in user_preferences table';
    END IF;

    -- Add developer_mode column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'developer_mode'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "developer_mode" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added developer_mode column to user_preferences table';
    ELSE
        RAISE NOTICE 'developer_mode column already exists in user_preferences table';
    END IF;

    -- Add api_access column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'api_access'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "api_access" BOOLEAN DEFAULT false;
        
        RAISE NOTICE 'Added api_access column to user_preferences table';
    ELSE
        RAISE NOTICE 'api_access column already exists in user_preferences table';
    END IF;

    -- Add custom_preferences column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'custom_preferences'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "custom_preferences" JSONB DEFAULT '{}';
        
        RAISE NOTICE 'Added custom_preferences column to user_preferences table';
    ELSE
        RAISE NOTICE 'custom_preferences column already exists in user_preferences table';
    END IF;
END $$;

-- Create financbase_support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS "financbase_support_tickets" (
    "id" SERIAL PRIMARY KEY,
    "ticket_number" TEXT NOT NULL UNIQUE,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT,
    
    -- Ticket details
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('low', 'medium', 'high', 'urgent')),
    "status" TEXT NOT NULL DEFAULT 'open' CHECK ("status" IN ('open', 'in_progress', 'resolved', 'closed')),
    "category" TEXT NOT NULL CHECK ("category" IN ('technical', 'billing', 'feature_request', 'bug_report', 'general')),
    
    -- Assignment
    "assigned_to" TEXT,
    "assigned_at" TIMESTAMP,
    
    -- Resolution
    "resolution" TEXT,
    "resolved_at" TIMESTAMP,
    "closed_at" TIMESTAMP,
    
    -- Attachments and metadata
    "attachments" JSONB DEFAULT '[]' NOT NULL,
    "tags" JSONB DEFAULT '[]' NOT NULL,
    "custom_fields" JSONB DEFAULT '{}' NOT NULL,
    
    -- Statistics
    "response_time" INTEGER,
    "resolution_time" INTEGER,
    "satisfaction_rating" INTEGER CHECK ("satisfaction_rating" >= 1 AND "satisfaction_rating" <= 5),
    
    "created_at" TIMESTAMP DEFAULT NOW() NOT NULL,
    "updated_at" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_user_id" ON "financbase_support_tickets"("user_id");
CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_status" ON "financbase_support_tickets"("status");
CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_priority" ON "financbase_support_tickets"("priority");
CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_category" ON "financbase_support_tickets"("category");
CREATE INDEX IF NOT EXISTS "idx_notifications_category" ON "notifications"("category");
CREATE INDEX IF NOT EXISTS "idx_notifications_action_url" ON "notifications"("action_url");

