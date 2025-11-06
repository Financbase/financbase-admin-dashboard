/**
 * Sync All Clerk Users to Database
 * 
 * Standalone script that syncs all Clerk users to the database.
 * Uses Clerk API directly (not Next.js server components).
 * 
 * Usage:
 *   npx tsx scripts/sync-all-clerk-users.ts
 * 
 * Requires:
 *   - CLERK_SECRET_KEY in environment
 *   - DATABASE_URL in environment
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

// Initialize Clerk API client using REST API
const clerkSecretKey = process.env.CLERK_SECRET_KEY;
if (!clerkSecretKey) {
  console.error('❌ Error: CLERK_SECRET_KEY not found in environment variables');
  console.log('💡 Make sure CLERK_SECRET_KEY is set in your .env.local file');
  process.exit(1);
}

// Clerk API base URL
const CLERK_API_BASE = 'https://api.clerk.com/v1';

async function getClerkUsers() {
  const response = await fetch(`${CLERK_API_BASE}/users?limit=100`, {
    headers: {
      'Authorization': `Bearer ${clerkSecretKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Clerk API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Debug: log the response structure
  if (process.env.DEBUG) {
    console.log('Clerk API Response:', JSON.stringify(data, null, 2));
  }
  
  return data;
}

// Initialize database
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ Error: DATABASE_URL not found in environment variables');
  process.exit(1);
}

const sql = neon(databaseUrl);

// Define table schemas inline (to avoid server-only imports)
const usersTable = {
  schema: 'financbase',
  name: 'users',
} as const;

const organizationsTable = {
  schema: 'financbase',
  name: 'organizations',
} as const;

async function syncAllUsers() {
  try {
    console.log('🔍 Fetching users from Clerk...\n');

    // Get all users from Clerk
    const clerkResponse = await getClerkUsers();
    
    // Handle different response formats
    let clerkUsers: any[] = [];
    if (Array.isArray(clerkResponse)) {
      clerkUsers = clerkResponse;
    } else if (clerkResponse.data && Array.isArray(clerkResponse.data)) {
      clerkUsers = clerkResponse.data;
    } else if (clerkResponse.users && Array.isArray(clerkResponse.users)) {
      clerkUsers = clerkResponse.users;
    }

    if (clerkUsers.length === 0) {
      console.log('❌ No users found in Clerk account.');
      console.log('📋 Response structure:', Object.keys(clerkResponse));
      console.log('💡 Make sure CLERK_SECRET_KEY is correct and has access to users.');
      return;
    }

    console.log(`📋 Found ${clerkUsers.length} user(s) in Clerk.\n`);

    // Get or create default organization
    // First check financbase.organizations, then public.organizations as fallback
    const orgTable = `${organizationsTable.schema}.${organizationsTable.name}`;
    let orgId: string | null = null;
    let publicOrgId: string | null = null;
    
    // Try to find existing organization in financbase schema
    const orgResult = await sql(
      `SELECT id FROM ${orgTable} WHERE name = $1 LIMIT 1`,
      ['Default Organization']
    );

    if (orgResult.length > 0) {
      orgId = orgResult[0].id;
      console.log(`📁 Using existing organization: ${orgId}\n`);
    } else {
      // Check public.organizations as fallback (for initial user creation)
      const publicOrgResult = await sql(
        `SELECT id FROM public.organizations WHERE name = $1 LIMIT 1`,
        ['Default Organization']
      );
      
      if (publicOrgResult.length > 0) {
        publicOrgId = publicOrgResult[0].id;
        console.log(`📁 Found organization in public schema (will migrate to financbase after first user)\n`);
      }
    }

    let syncedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const clerkUser of clerkUsers) {
      const clerkId = clerkUser.id;
      const email = clerkUser.email_addresses?.[0]?.email_address || clerkUser.emailAddresses?.[0]?.emailAddress;

      if (!email) {
        console.log(`⏭️  Skipping ${clerkId} - no email`);
        skippedCount++;
        continue;
      }

      // Check if user exists
      const usersTableName = `${usersTable.schema}.${usersTable.name}`;
      const existingResult = await sql(
        `SELECT id FROM ${usersTableName} WHERE clerk_id = $1 LIMIT 1`,
        [clerkId]
      );

      if (existingResult.length > 0) {
        console.log(`✅ Already synced: ${email} (${clerkId})`);
        syncedCount++;
        continue;
      }

      // Create user
      try {
        // If no financbase org exists, we need to create first user and org together
        // This requires temporarily working around the FK constraint
        if (!orgId) {
          console.log(`⚠️  No financbase organization found. Creating first user and organization...`);
          
          // Step 1: Temporarily disable FK constraint to create user with temp org
          // Then create org, then update user
          // Actually, simpler: create user in a transaction that creates org first
          
          // Use a transaction approach: create user with a self-referencing org ID temporarily
          // Then create the org with that user as owner
          // But FK prevents this...
          
          // Best approach: Create user first with a dummy org ID, create real org, update user
          // But we need to disable FK temporarily
          await sql(`ALTER TABLE ${usersTableName} DISABLE TRIGGER ALL`);
          
          // Create user with temporary org ID (will be updated)
          const tempOrgId = '00000000-0000-0000-0000-000000000000';
          const insertResult = await sql(
            `INSERT INTO ${usersTableName} 
             (clerk_id, email, first_name, last_name, role, is_active, organization_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, email`,
            [
              clerkId,
              email,
              clerkUser.first_name || clerkUser.firstName || null,
              clerkUser.last_name || clerkUser.lastName || null,
              'user',
              true,
              tempOrgId,
            ]
          );
          
          const userId = insertResult[0].id;
          
          // Create organization with this user as owner
          const newFinancbaseOrg = await sql(
            `INSERT INTO financbase.organizations (name, slug, owner_id, description) 
             VALUES ($1, $2, $3, $4) RETURNING id`,
            ['Default Organization', 'default-organization', userId, 'Default organization for new users']
          );
          const newOrgId = newFinancbaseOrg[0].id;
          
          // Update user with correct organization ID
          await sql(
            `UPDATE ${usersTableName} SET organization_id = $1 WHERE id = $2`,
            [newOrgId, userId]
          );
          
          // Re-enable FK constraint
          await sql(`ALTER TABLE ${usersTableName} ENABLE TRIGGER ALL`);
          
          orgId = newOrgId;
          console.log(`✨ Created: ${email} (${clerkId}) with new organization`);
          createdCount++;
        } else {
          // Organization exists, just create user
          const insertResult = await sql(
            `INSERT INTO ${usersTableName} 
             (clerk_id, email, first_name, last_name, role, is_active, organization_id) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, email`,
            [
              clerkId,
              email,
              clerkUser.first_name || clerkUser.firstName || null,
              clerkUser.last_name || clerkUser.lastName || null,
              'user',
              true,
              orgId,
            ]
          );

          console.log(`✨ Created: ${email} (${clerkId})`);
          createdCount++;
        }
      } catch (error: any) {
        if (error.code === '23505') {
          // Unique constraint violation - user might have been created in parallel
          console.log(`⚠️  Already exists (race condition): ${email}`);
          syncedCount++;
        } else {
          console.error(`❌ Error creating ${email}:`, error.message);
          errorCount++;
        }
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   ✅ Already synced: ${syncedCount}`);
    console.log(`   ✨ Newly created: ${createdCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`);
    }
    console.log('─'.repeat(60));
    console.log('\n✅ Sync completed!\n');

  } catch (error: any) {
    console.error('❌ Error syncing users:', error.message);
    if (error.message?.includes('CLERK_SECRET_KEY')) {
      console.error('\n💡 Make sure CLERK_SECRET_KEY is set in your .env.local file.');
    }
    throw error;
  }
}

syncAllUsers()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });

