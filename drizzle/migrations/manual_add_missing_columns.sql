-- Manual migration to add missing columns
-- This fixes the schema mismatch issues identified:
-- 1. Missing 'priority' column in notifications table
-- 2. Missing 'sidebar_collapsed' column in user_preferences table

-- Add priority column to notifications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'priority'
    ) THEN
        ALTER TABLE notifications 
        ADD COLUMN priority TEXT DEFAULT 'normal' NOT NULL;
        
        RAISE NOTICE 'Added priority column to notifications table';
    ELSE
        RAISE NOTICE 'priority column already exists in notifications table';
    END IF;
END $$;

-- Add sidebar_collapsed column to user_preferences table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_preferences' 
        AND column_name = 'sidebar_collapsed'
    ) THEN
        ALTER TABLE user_preferences 
        ADD COLUMN sidebar_collapsed BOOLEAN DEFAULT false NOT NULL;
        
        RAISE NOTICE 'Added sidebar_collapsed column to user_preferences table';
    ELSE
        RAISE NOTICE 'sidebar_collapsed column already exists in user_preferences table';
    END IF;
END $$;

