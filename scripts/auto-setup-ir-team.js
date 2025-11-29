require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Auto-setup IR Team
 * 
 * This script automatically sets up a basic IR team structure using existing users
 */

async function autoSetupIRTeam() {
	try {
		console.log('🤖 Auto-setting up Incident Response Team...\n');
		
		// Get first organization
		const orgs = await sql`SELECT id, name FROM organizations LIMIT 1`;
		if (orgs.length === 0) {
			console.error('❌ No organizations found.');
			process.exit(1);
		}
		
		const orgId = orgs[0].id;
		console.log(`📋 Organization: ${orgs[0].name} (${orgId})\n`);
		
		// Get available users
		const users = await sql`SELECT id, email FROM users LIMIT 10`;
		
		if (users.length === 0) {
			console.error('❌ No users found for this organization.');
			process.exit(1);
		}
		
		console.log(`👤 Found ${users.length} users\n`);
		
		// Check existing team members
		const existing = await sql`
			SELECT user_id FROM financbase_ir_team_members 
			WHERE organization_id = ${orgId} AND is_active = true
		`;
		
		if (existing.length > 0) {
			console.log(`⚠️  ${existing.length} team member(s) already exist. Skipping setup.\n`);
			console.log('💡 To add more members, use: POST /api/incident-response/team\n');
			return;
		}
		
		// Define team structure
		const teamStructure = [
			{ role: 'incident_commander', isPrimary: true, index: 0 },
			{ role: 'technical_lead', isPrimary: false, index: 1 },
			{ role: 'communications_lead', isPrimary: false, index: 2 },
			{ role: 'team_member', isPrimary: false, index: 3 },
			{ role: 'team_member', isPrimary: false, index: 4 },
		];
		
		let successCount = 0;
		
		for (const member of teamStructure) {
			if (member.index >= users.length) {
				console.log(`  ⚠️  Not enough users for role: ${member.role}`);
				continue;
			}
			
			const user = users[member.index];
			
			try {
				await sql`
					INSERT INTO financbase_ir_team_members (
						organization_id,
						user_id,
						role,
						is_primary,
						contact_info,
						availability,
						certifications,
						is_active
					) VALUES (
						${orgId},
						${user.id},
						${member.role},
						${member.isPrimary},
						${JSON.stringify({ email: user.email })}::jsonb,
						${JSON.stringify({})}::jsonb,
						${JSON.stringify([])}::jsonb,
						true
					)
				`;
				
				console.log(`  ✅ Added ${user.email} as ${member.role}${member.isPrimary ? ' (PRIMARY)' : ''}`);
				successCount++;
			} catch (error) {
				if (error.message.includes('already exists') || error.message.includes('duplicate')) {
					console.log(`  ⚠️  ${user.email} already in team as ${member.role}`);
				} else {
					console.error(`  ❌ Error adding ${user.email}:`, error.message);
				}
			}
		}
		
		console.log(`\n📊 Setup Summary:`);
		console.log(`  ✅ Added: ${successCount} team members`);
		console.log(`  📝 Total roles: ${teamStructure.length}\n`);
		
		if (successCount > 0) {
			console.log('✅ IR team setup complete!\n');
			console.log('📋 Next Steps:');
			console.log('   1. Review team members: GET /api/incident-response/team');
			console.log('   2. Update contact info and certifications as needed');
			console.log('   3. Schedule initial drills: node scripts/schedule-ir-drills.js\n');
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

autoSetupIRTeam();

