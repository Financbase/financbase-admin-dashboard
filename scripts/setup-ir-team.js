require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Setup IR Team Members
 * 
 * This script helps you configure your Incident Response team.
 * You'll need to provide:
 * - Organization ID
 * - User IDs for team members
 * - Roles for each member
 * 
 * Usage:
 *   node scripts/setup-ir-team.js
 * 
 * Or set environment variables:
 *   ORG_ID=your-org-id USER_ID=user-id ROLE=incident_commander node scripts/setup-ir-team.js
 */

async function setupIRTeam() {
	try {
		console.log('👥 Setting up Incident Response Team...\n');
		
		// Get organization ID
		let orgId = process.env.ORG_ID;
		if (!orgId) {
			const orgs = await sql`SELECT id, name FROM organizations LIMIT 5`;
			if (orgs.length === 0) {
				console.error('❌ No organizations found. Please create an organization first.');
				process.exit(1);
			}
			
			console.log('Available organizations:');
			orgs.forEach((org, i) => {
				console.log(`  ${i + 1}. ${org.name} (${org.id})`);
			});
			console.log('\nPlease set ORG_ID environment variable or modify this script.\n');
			return;
		}
		
		// Get users
		const users = await sql`
			SELECT id, email, first_name, last_name 
			FROM users 
			WHERE organization_id = ${orgId}
			LIMIT 20
		`;
		
		if (users.length === 0) {
			console.error('❌ No users found for this organization.');
			process.exit(1);
		}
		
		console.log(`📋 Organization: ${orgId}`);
		console.log(`👤 Available users:\n`);
		users.forEach((user, i) => {
			const name = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
			console.log(`  ${i + 1}. ${name} (${user.id})`);
		});
		
		console.log('\n💡 To add IR team members, use the API:');
		console.log('   POST /api/incident-response/team');
		console.log('   {');
		console.log('     "userId": "user-id",');
		console.log('     "role": "incident_commander",');
		console.log('     "isPrimary": true,');
		console.log('     "contactInfo": { "email": "...", "phone": "..." }');
		console.log('   }\n');
		
		console.log('📝 Recommended IR Team Structure:');
		console.log('   - 1x Incident Commander (primary)');
		console.log('   - 1-2x Technical Lead');
		console.log('   - 1x Communications Lead');
		console.log('   - 1x Legal Lead (optional)');
		console.log('   - 1x Executive Sponsor');
		console.log('   - 2-3x Team Members');
		console.log('   - 1-2x Observers\n');
		
		// Check existing team members
		const existing = await sql`
			SELECT 
				tm.id,
				tm.role,
				tm.is_primary,
				u.email,
				u.first_name,
				u.last_name
			FROM financbase_ir_team_members tm
			JOIN users u ON tm.user_id = u.id
			WHERE tm.organization_id = ${orgId}
			AND tm.is_active = true
		`;
		
		if (existing.length > 0) {
			console.log('✅ Existing IR Team Members:');
			existing.forEach(member => {
				const name = `${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email;
				console.log(`   - ${name} (${member.role})${member.is_primary ? ' [PRIMARY]' : ''}`);
			});
			console.log('');
		} else {
			console.log('⚠️  No IR team members configured yet.\n');
		}
		
	} catch (error) {
		console.error('❌ Error:', error.message);
		if (error.message.includes('does not exist')) {
			console.error('   Make sure you have run the migration first:');
			console.error('   node scripts/apply-ir-migration.js\n');
		}
		process.exit(1);
	}
}

setupIRTeam();

