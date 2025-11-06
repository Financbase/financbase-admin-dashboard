/**
 * Verify Migration 0025: Check that columns were added successfully
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function verifyMigration() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const db = neon(databaseUrl);

  console.log('🔍 Verifying migration 0025...\n');

  try {
    // Check notifications table columns
    console.log('📋 Checking notifications table columns:');
    const notificationColumns = await db`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      AND column_name IN ('category', 'priority', 'action_url', 'action_label', 'data', 'metadata', 'archived', 'archived_at', 'expires_at')
      ORDER BY column_name
    `;
    
    const expectedNotificationColumns = ['category', 'priority', 'action_url', 'action_label', 'data', 'metadata', 'archived', 'archived_at', 'expires_at'];
    expectedNotificationColumns.forEach(col => {
      const found = notificationColumns.find(c => c.column_name === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.data_type})`);
      } else {
        console.log(`   ❌ ${col} - MISSING`);
      }
    });

    // Check user_preferences table columns
    console.log('\n📋 Checking user_preferences table columns:');
    const preferenceColumns = await db`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'user_preferences' 
      AND column_name IN ('compact_mode', 'high_contrast', 'font_size', 'charts_enabled', 'analytics_enabled', 'auto_refresh', 'refresh_interval', 'email_notifications', 'push_notifications', 'desktop_notifications', 'notification_sounds', 'weekly_digest', 'monthly_report', 'analytics_tracking', 'error_reporting', 'usage_stats', 'marketing_emails', 'data_export', 'experimental_features', 'developer_mode', 'api_access', 'custom_preferences')
      ORDER BY column_name
    `;
    
    const expectedPreferenceColumns = ['compact_mode', 'high_contrast', 'font_size', 'charts_enabled', 'analytics_enabled', 'auto_refresh', 'refresh_interval', 'email_notifications', 'push_notifications', 'desktop_notifications', 'notification_sounds', 'weekly_digest', 'monthly_report', 'analytics_tracking', 'error_reporting', 'usage_stats', 'marketing_emails', 'data_export', 'experimental_features', 'developer_mode', 'api_access', 'custom_preferences'];
    
    expectedPreferenceColumns.forEach(col => {
      const found = preferenceColumns.find(c => c.column_name === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.data_type})`);
      } else {
        console.log(`   ❌ ${col} - MISSING`);
      }
    });

    // Check if support_tickets table exists
    console.log('\n📋 Checking financbase_support_tickets table:');
    const tableExists = await db`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'financbase_support_tickets'
      )
    `;
    
    if (tableExists[0]?.exists) {
      console.log('   ✅ financbase_support_tickets table exists');
    } else {
      console.log('   ❌ financbase_support_tickets table - MISSING');
    }

    console.log('\n✅ Verification complete!');
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    process.exit(1);
  }
}

verifyMigration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

