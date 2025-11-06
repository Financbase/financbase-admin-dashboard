-- Migration: Fix Missing Columns
-- Created: 2025-01-23
-- Description: Add missing priority column to notifications and sidebar_collapsed to user_preferences

-- Add priority column to notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "priority" TEXT DEFAULT 'normal' NOT NULL;
    END IF;
END $$;

-- Add sidebar_collapsed column to user_preferences if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'sidebar_collapsed'
    ) THEN
        ALTER TABLE "user_preferences" 
        ADD COLUMN "sidebar_collapsed" BOOLEAN DEFAULT false NOT NULL;
    END IF;
END $$;

-- Create index on notifications.priority for better query performance
CREATE INDEX IF NOT EXISTS "idx_notifications_priority" ON "notifications"("priority");

