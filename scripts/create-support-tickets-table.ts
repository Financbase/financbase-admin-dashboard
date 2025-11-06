/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env.local');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function createSupportTicketsTable() {
  console.log('🔄 Creating support tickets table...');

  try {
    // Check if table already exists
    const checkTable = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'financbase_support_tickets'
      );
    `;

    if (checkTable[0]?.exists) {
      console.log('✅ Table financbase_support_tickets already exists');
      return;
    }

    // Create the table
    await sql`
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
    `;

    console.log('✅ Table created successfully');

    // Create indexes
    console.log('🔄 Creating indexes...');
    
    await sql`
      CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_user_id" 
      ON "financbase_support_tickets"("user_id");
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_status" 
      ON "financbase_support_tickets"("status");
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_priority" 
      ON "financbase_support_tickets"("priority");
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "idx_financbase_support_tickets_category" 
      ON "financbase_support_tickets"("category");
    `;

    console.log('✅ Indexes created successfully');
    console.log('✅ Support tickets table setup complete!');

  } catch (error) {
    console.error('❌ Error creating support tickets table:', error);
    process.exit(1);
  }
}

// Run the script
createSupportTicketsTable()
  .then(() => {
    console.log('✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

