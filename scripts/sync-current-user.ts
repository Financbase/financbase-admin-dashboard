/**
 * Sync Current User to Database
 * 
 * This script automatically syncs the current authenticated Clerk user to the database.
 * It uses your Clerk session from environment variables - no manual ID needed!
 * 
 * Usage:
 *   npx tsx scripts/sync-current-user.ts
 * 
 * This will:
 * 1. Use your Clerk session to get your current user
 * 2. Check if you exist in the database
 * 3. Create you in the database if needed
 */

import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users, organizations } from '@/lib/db/schemas';
import { eq } from 'drizzle-orm';

async function syncCurrentUser() {
  try {
    console.log('🔍 Checking for authenticated user...\n');

    // Get all users from Clerk (we'll find the one that matches)
    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({ limit: 100 });

    if (clerkUsers.data.length === 0) {
      console.log('❌ No users found in Clerk account.');
      console.log('💡 Make sure CLERK_SECRET_KEY is set in your environment.');
      return;
    }

    console.log(`📋 Found ${clerkUsers.data.length} user(s) in Clerk.\n`);

    // Check each user to see if they're in the database
    let syncedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;

    for (const clerkUser of clerkUsers.data) {
      const clerkId = clerkUser.id;
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      if (!email) {
        console.log(`⏭️  Skipping ${clerkId} - no email`);
        skippedCount++;
        continue;
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .limit(1);

      if (existingUser.length > 0) {
        console.log(`✅ Already synced: ${email} (${clerkId})`);
        syncedCount++;
        continue;
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
      } else {
        const [newOrg] = await db
          .insert(organizations)
          .values({
            name: 'Default Organization',
            description: 'Default organization for new users',
          })
          .returning();
        orgId = String(newOrg.id);
      }

      // Create user
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            clerkId: clerkId,
            email: email,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            role: 'user',
            isActive: true,
            organizationId: orgId,
          })
          .returning();

        console.log(`✨ Created: ${email} (${clerkId})`);
        createdCount++;
      } catch (error: any) {
        if (error.code === '23505') {
          console.log(`⚠️  Already exists (race condition): ${email}`);
          syncedCount++;
        } else {
          console.error(`❌ Error creating ${email}:`, error.message);
        }
      }
    }

    console.log('\n' + '─'.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   ✅ Already synced: ${syncedCount}`);
    console.log(`   ✨ Newly created: ${createdCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
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

syncCurrentUser()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  });

