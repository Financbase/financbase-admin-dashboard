require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

/**
 * Schedule Initial IR Drills
 * 
 * This script helps you schedule your first incident response drills.
 * 
 * Usage:
 *   node scripts/schedule-ir-drills.js
 */

async function scheduleDrills() {
	try {
		console.log('📅 Scheduling Initial IR Drills...\n');
		
		// Get organization ID
		const orgs = await sql`SELECT id, name FROM organizations LIMIT 1`;
		if (orgs.length === 0) {
			console.error('❌ No organizations found.');
			process.exit(1);
		}
		
		const orgId = orgs[0].id;
		console.log(`📋 Organization: ${orgId}\n`);
		
		// Get IR team members for participants
		const teamMembers = await sql`
			SELECT user_id 
			FROM financbase_ir_team_members 
			WHERE organization_id = ${orgId} 
			AND is_active = true
			LIMIT 10
		`;
		
		const participants = teamMembers.map(m => m.user_id);
		
		if (participants.length === 0) {
			console.log('⚠️  No IR team members found. Please set up your team first:');
			console.log('   node scripts/setup-ir-team.js\n');
			return;
		}
		
		// Calculate dates
		const now = new Date();
		const nextMonth = new Date(now);
		nextMonth.setMonth(nextMonth.getMonth() + 1);
		
		const nextQuarter = new Date(now);
		nextQuarter.setMonth(nextQuarter.getMonth() + 3);
		
		// Recommended drills
		const drills = [
			{
				drill_name: 'Q1 2025 Tabletop Exercise - Data Breach',
				drill_type: 'tabletop',
				scenario: 'Simulated data breach affecting customer PII. Test incident response procedures, communication protocols, and regulatory reporting.',
				objectives: [
					'Test incident detection and triage procedures',
					'Practice communication with stakeholders',
					'Validate regulatory reporting requirements',
					'Assess team coordination and response time'
				],
				scheduled_date: nextMonth.toISOString(),
			},
			{
				drill_name: 'Q2 2025 Full-Scale Drill - System Outage',
				drill_type: 'full_scale',
				scenario: 'Complete system outage affecting all services. Test disaster recovery procedures, backup systems, and business continuity plans.',
				objectives: [
					'Test disaster recovery procedures',
					'Validate backup and restore processes',
					'Assess business continuity capabilities',
					'Measure recovery time objectives (RTO)'
				],
				scheduled_date: nextQuarter.toISOString(),
			},
		];
		
		let successCount = 0;
		let skipCount = 0;
		
		for (const drill of drills) {
			try {
				// Check if drill already exists
				const existing = await sql`
					SELECT id FROM financbase_ir_drills 
					WHERE organization_id = ${orgId} 
					AND drill_name = ${drill.drill_name}
					LIMIT 1
				`;
				
				if (existing.length > 0) {
					console.log(`  ⚠️  Drill "${drill.drill_name}" already exists, skipping...`);
					skipCount++;
					continue;
				}
				
				// Insert drill
				await sql`
					INSERT INTO financbase_ir_drills (
						organization_id,
						drill_name,
						drill_type,
						status,
						scenario,
						objectives,
						scheduled_date,
						participants,
						observers,
						tags
					) VALUES (
						${orgId},
						${drill.drill_name},
						${drill.drill_type},
						'scheduled',
						${drill.scenario},
						${JSON.stringify(drill.objectives)}::jsonb,
						${drill.scheduled_date}::timestamptz,
						${JSON.stringify(participants)}::jsonb,
						${JSON.stringify([])}::jsonb,
						${JSON.stringify(['initial_setup', 'recommended'])}::jsonb
					)
				`;
				
				console.log(`  ✅ Scheduled drill: "${drill.drill_name}"`);
				console.log(`     Type: ${drill.drill_type}`);
				console.log(`     Date: ${new Date(drill.scheduled_date).toLocaleDateString()}`);
				console.log(`     Participants: ${participants.length}\n`);
				successCount++;
			} catch (error) {
				console.error(`  ❌ Error scheduling drill "${drill.drill_name}":`, error.message);
			}
		}
		
		console.log(`📊 Scheduling Summary:`);
		console.log(`  ✅ Scheduled: ${successCount}`);
		console.log(`  ⚠️  Skipped: ${skipCount}`);
		console.log(`  📝 Total: ${drills.length}\n`);
		
		if (successCount > 0) {
			console.log('✅ Initial drills scheduled successfully!\n');
			console.log('📋 Next Steps:');
			console.log('   1. Review scheduled drills in the IR dashboard');
			console.log('   2. Update participants and observers as needed');
			console.log('   3. Prepare drill scenarios and objectives');
			console.log('   4. Conduct drills and document results\n');
		}
	} catch (error) {
		console.error('❌ Fatal error scheduling drills:', error);
		if (error.message.includes('does not exist')) {
			console.error('   Make sure you have run the migration first:');
			console.error('   node scripts/apply-ir-migration.js\n');
		}
		process.exit(1);
	}
}

scheduleDrills();

