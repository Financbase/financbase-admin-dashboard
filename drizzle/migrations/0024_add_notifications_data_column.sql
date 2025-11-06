-- Migration: Add Missing Columns to Notifications
-- Created: 2025-11-04
-- Description: Add missing 'data' JSONB and 'read_at' timestamp columns to notifications table if they don't exist

-- Add data column to notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'data'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "data" JSONB;
        
        RAISE NOTICE 'Added data column to notifications table';
    ELSE
        RAISE NOTICE 'data column already exists in notifications table';
    END IF;
END $$;

-- Add read_at column to notifications if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "read_at" TIMESTAMP WITH TIME ZONE;
        
        RAISE NOTICE 'Added read_at column to notifications table';
    ELSE
        RAISE NOTICE 'read_at column already exists in notifications table';
    END IF;
END $$;

