/**
 * Sync Clerk User to Database
 * 
 * This script manually creates a user in the database from a Clerk user ID.
 * Use this if the webhook didn't fire or if you need to manually sync a user.
 * 
 * Usage:
 *   npx tsx scripts/sync-clerk-user.ts <clerk-user-id> [email]
 * 
 * Example:
 *   npx tsx scripts/sync-clerk-user.ts user_2abc123def456
 */

import { db } from '@/lib/db';
import { users, organizations } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';
import { clerkClient } from '@clerk/nextjs/server';

async function syncClerkUser(clerkUserId: string, email?: string) {
  try {
    console.log(`🔄 Syncing Clerk user: ${clerkUserId}`);

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUserId))
      .limit(1);

    if (existingUser.length > 0) {
      console.log('✅ User already exists in database:');
      console.log(JSON.stringify(existingUser[0], null, 2));
      return existingUser[0];
    }

    // Fetch user from Clerk
    let clerkUser;
    try {
      const clerk = await clerkClient();
      clerkUser = await clerk.users.getUser(clerkUserId);
      console.log('📥 Fetched user from Clerk:', {
        id: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      });
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`Clerk user not found: ${clerkUserId}. Please verify the user ID.`);
      }
      throw error;
    }

    // Use provided email or fetch from Clerk
    const userEmail = email || clerkUser.emailAddresses[0]?.emailAddress;
    if (!userEmail) {
      throw new Error('No email found. Please provide email as second argument or ensure Clerk user has an email.');
    }

    // Get or create default organization
    const defaultOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.name, 'Default Organization'))
      .limit(1);

    let orgId: string;
    if (defaultOrg.length > 0) {
      orgId = String(defaultOrg[0].id);
      console.log('📁 Using existing organization:', orgId);
    } else {
      // Create default organization
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: 'Default Organization',
          description: 'Default organization for new users',
        })
        .returning();
      orgId = String(newOrg.id);
      console.log('📁 Created new organization:', orgId);
    }

    // Create user in database
    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: clerkUserId,
        email: userEmail,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        role: 'user',
        isActive: true,
        organizationId: orgId,
      })
      .returning();

    console.log('✅ User created successfully:');
    console.log(JSON.stringify(newUser, null, 2));

    return newUser;
  } catch (error: any) {
    console.error('❌ Error syncing user:', error.message);
    if (error.code === '23505') {
      console.error('   User with this email or Clerk ID already exists.');
    }
    throw error;
  }
}

// Helper function to list all Clerk users
async function listClerkUsers() {
  try {
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ limit: 10 });
    
    console.log('\n📋 Available Clerk Users:');
    console.log('─'.repeat(60));
    users.data.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.emailAddresses[0]?.emailAddress || 'N/A'}`);
      console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A');
      console.log('');
    });
    console.log('─'.repeat(60));
    console.log('\n💡 Copy one of the IDs above and run:');
    console.log('   npx tsx scripts/sync-clerk-user.ts <id-from-above>\n');
  } catch (error: any) {
    console.error('❌ Error listing Clerk users:', error.message);
  }
}

// Main execution
const clerkUserId = process.argv[2];
const email = process.argv[3];

if (!clerkUserId) {
  console.error('❌ Error: Clerk user ID is required');
  console.log('\nUsage:');
  console.log('  npx tsx scripts/sync-clerk-user.ts <clerk-user-id> [email]');
  console.log('\nExample:');
  console.log('  npx tsx scripts/sync-clerk-user.ts user_2abc123def456');
  console.log('\n💡 To list available Clerk users, run:');
  console.log('  npx tsx scripts/sync-clerk-user.ts --list');
  console.log('\n💡 To find your Clerk user ID:');
  console.log('  1. Go to https://dashboard.clerk.com');
  console.log('  2. Navigate to Users');
  console.log('  3. Find your user and copy the ID (starts with "user_")');
  process.exit(1);
}

// Handle --list flag
if (clerkUserId === '--list' || clerkUserId === '-l') {
  listClerkUsers()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

syncClerkUser(clerkUserId, email)
  .then(() => {
    console.log('\n✅ Sync completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });

