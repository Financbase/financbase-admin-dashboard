/**
 * List Clerk Users
 * 
 * This script lists all users in your Clerk account to help you find your user ID.
 * 
 * Usage:
 *   npx tsx scripts/list-clerk-users.ts
 */

import { clerkClient } from '@clerk/nextjs/server';

async function listClerkUsers() {
  try {
    console.log('🔍 Fetching users from Clerk...\n');
    
    const clerk = await clerkClient();
    const users = await clerk.users.getUserList({ limit: 50 });
    
    if (users.data.length === 0) {
      console.log('❌ No users found in Clerk account.');
      return;
    }
    
    console.log(`📋 Found ${users.data.length} user(s) in Clerk:\n`);
    console.log('─'.repeat(80));
    
    users.data.forEach((user, index) => {
      const email = user.emailAddresses[0]?.emailAddress || 'No email';
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No name';
      const createdAt = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown';
      
      console.log(`${index + 1}. ${name}`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🆔 Clerk ID: ${user.id}`);
      console.log(`   📅 Created: ${createdAt}`);
      console.log('');
    });
    
    console.log('─'.repeat(80));
    console.log('\n💡 To sync a user to the database, run:');
    console.log('   npx tsx scripts/sync-clerk-user.ts <clerk-id-from-above>\n');
    
  } catch (error: any) {
    console.error('❌ Error listing Clerk users:', error.message);
    if (error.message?.includes('CLERK_SECRET_KEY')) {
      console.error('\n💡 Make sure CLERK_SECRET_KEY is set in your environment variables.');
    }
    throw error;
  }
}

listClerkUsers()
  .then(() => {
    console.log('✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });

