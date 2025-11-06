-- Migration: Add read_at column to notifications table
-- Created: 2025-11-04
-- Description: Add missing read_at column to notifications table if it doesn't exist

-- Add read_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'read_at'
    ) THEN
        ALTER TABLE "notifications" 
        ADD COLUMN "read_at" TIMESTAMP;
        
        RAISE NOTICE 'Added read_at column to notifications table';
    ELSE
        RAISE NOTICE 'read_at column already exists in notifications table';
    END IF;
END $$;

