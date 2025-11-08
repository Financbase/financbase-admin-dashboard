require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

// Default runbooks (inline since templates are TypeScript)
const defaultRunbooks = [
	{
		name: 'Data Breach Response',
		description: 'Standard procedures for responding to data breaches',
		incidentType: 'data_breach',
		severity: 'critical',
		detectionProcedures: [
			'Monitor security alerts and SIEM logs',
			'Review data access logs for unusual patterns',
			'Check for unauthorized database access',
			'Review system logs for suspicious activity',
		],
		triageProcedures: [
			'Immediately assess scope of breach',
			'Identify affected data types and records',
			'Determine if breach is ongoing',
			'Assess regulatory reporting requirements',
			'Notify incident coordinator',
		],
		containmentProcedures: [
			'Isolate affected systems',
			'Revoke compromised credentials',
			'Block malicious IP addresses',
			'Disable affected user accounts',
			'Preserve evidence for forensics',
		],
		eradicationProcedures: [
			'Remove malware or unauthorized access',
			'Patch vulnerabilities',
			'Update security controls',
			'Verify system integrity',
		],
		recoveryProcedures: [
			'Restore systems from clean backups',
			'Reset all affected credentials',
			'Monitor for continued threats',
			'Validate system functionality',
		],
		communicationTemplates: {
			internal: {
				subject: 'Security Incident - Action Required',
				body: 'A security incident has been detected. Please follow instructions from the incident response team.',
			},
			external: {
				subject: 'Security Notice',
				body: 'We have detected a security incident and are taking immediate action to protect your data.',
			},
			regulatory: {
				subject: 'Data Breach Notification',
				body: 'This notification is required under applicable data protection regulations.',
			},
		},
		escalationCriteria: [
			{ condition: 'severity === "critical"', action: 'Immediately notify executive sponsor' },
			{ condition: 'affectedUsers > 1000', action: 'Escalate to legal counsel' },
		],
		tools: ['SIEM', 'Forensics tools', 'Log analysis', 'Network monitoring'],
		references: ['GDPR Article 33', 'State breach notification laws', 'Internal security policy'],
		tags: ['data_breach', 'critical', 'regulatory'],
	},
	{
		name: 'Unauthorized Access Response',
		description: 'Procedures for responding to unauthorized access attempts',
		incidentType: 'unauthorized_access',
		severity: 'high',
		detectionProcedures: [
			'Monitor failed login attempts',
			'Review access logs for unusual patterns',
			'Check for privilege escalation attempts',
			'Monitor for suspicious API calls',
		],
		triageProcedures: [
			'Identify source of unauthorized access',
			'Determine scope of access',
			'Assess what data or systems were accessed',
			'Check if access is still active',
		],
		containmentProcedures: [
			'Immediately revoke access',
			'Disable compromised accounts',
			'Block source IP addresses',
			'Change affected credentials',
		],
		eradicationProcedures: [
			'Remove unauthorized access points',
			'Patch security vulnerabilities',
			'Update access controls',
		],
		recoveryProcedures: [
			'Restore normal access controls',
			'Monitor for continued attempts',
			'Review and update security policies',
		],
		communicationTemplates: {
			internal: {
				subject: 'Unauthorized Access Detected',
				body: 'An unauthorized access attempt has been detected and contained.',
			},
		},
		escalationCriteria: [
			{ condition: 'severity === "critical"', action: 'Notify security team immediately' },
		],
		tools: ['Access logs', 'Authentication system', 'Network monitoring'],
		references: ['Access control policy', 'Security monitoring procedures'],
		tags: ['unauthorized_access', 'access_control'],
	},
	{
		name: 'System Outage Response',
		description: 'Procedures for responding to system outages',
		incidentType: 'system_outage',
		severity: 'high',
		detectionProcedures: [
			'Monitor system health metrics',
			'Review application logs',
			'Check infrastructure status',
			'Monitor user reports',
		],
		triageProcedures: [
			'Identify affected systems',
			'Determine root cause',
			'Assess business impact',
			'Estimate recovery time',
		],
		containmentProcedures: [
			'Isolate affected systems',
			'Prevent cascading failures',
			'Activate backup systems if available',
		],
		eradicationProcedures: [
			'Fix root cause',
			'Apply necessary patches or fixes',
			'Verify system stability',
		],
		recoveryProcedures: [
			'Restore services gradually',
			'Monitor system health',
			'Validate functionality',
			'Communicate status updates',
		],
		communicationTemplates: {
			internal: {
				subject: 'System Outage - Recovery in Progress',
				body: 'We are experiencing a system outage and are working to restore services.',
			},
			external: {
				subject: 'Service Interruption Notice',
				body: 'We are currently experiencing technical difficulties. Services will be restored as soon as possible.',
			},
		},
		escalationCriteria: [
			{ condition: 'duration > 60 minutes', action: 'Escalate to technical lead' },
			{ condition: 'affectedUsers > 10000', action: 'Notify executive sponsor' },
		],
		tools: ['Monitoring systems', 'Infrastructure management', 'Backup systems'],
		references: ['Business continuity plan', 'Disaster recovery procedures'],
		tags: ['system_outage', 'availability'],
	},
];

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(DATABASE_URL);

async function seedRunbooks() {
	try {
		console.log('🌱 Seeding default IR runbooks...\n');
		
		// Get first organization ID (you may want to make this configurable)
		const orgs = await sql`SELECT id FROM organizations LIMIT 1`;
		if (orgs.length === 0) {
			console.error('❌ No organizations found. Please create an organization first.');
			process.exit(1);
		}
		
		const orgId = orgs[0].id;
		console.log(`📋 Using organization: ${orgId}\n`);
		
		let successCount = 0;
		let skipCount = 0;
		
		for (const runbook of defaultRunbooks) {
			try {
				// Check if runbook already exists
				const existing = await sql`
					SELECT id FROM financbase_ir_runbooks 
					WHERE organization_id = ${orgId} 
					AND title = ${runbook.name}
					LIMIT 1
				`;
				
				if (existing.length > 0) {
					console.log(`  ⚠️  Runbook "${runbook.name}" already exists, skipping...`);
					skipCount++;
					continue;
				}
				
				// Insert runbook
				await sql`
					INSERT INTO financbase_ir_runbooks (
						organization_id,
						title,
						description,
						incident_type,
						severity,
						status,
						version,
						procedures,
						checklists,
						escalation_paths,
						communication_templates,
						tools_and_resources,
						tags
					) VALUES (
						${orgId},
						${runbook.name},
						${runbook.description || null},
						${runbook.incidentType},
						${runbook.severity},
						'active',
						1,
						${JSON.stringify({
							detection: runbook.detectionProcedures || [],
							triage: runbook.triageProcedures || [],
							containment: runbook.containmentProcedures || [],
							eradication: runbook.eradicationProcedures || [],
							recovery: runbook.recoveryProcedures || [],
						})}::jsonb,
						${JSON.stringify([])}::jsonb,
						${JSON.stringify(runbook.escalationCriteria || [])}::jsonb,
						${JSON.stringify(
							Object.entries(runbook.communicationTemplates || {}).map(([key, value]) => ({
								type: key,
								...value
							}))
						)}::jsonb,
						${JSON.stringify([...(runbook.tools || []), ...(runbook.references || [])])}::jsonb,
						${JSON.stringify(runbook.tags || [])}::jsonb
					)
				`;
				
				console.log(`  ✅ Created runbook: "${runbook.name}"`);
				successCount++;
			} catch (error) {
				console.error(`  ❌ Error creating runbook "${runbook.name}":`, error.message);
			}
		}
		
		console.log(`\n📊 Seeding Summary:`);
		console.log(`  ✅ Created: ${successCount}`);
		console.log(`  ⚠️  Skipped: ${skipCount}`);
		console.log(`  📝 Total: ${defaultRunbooks.length}\n`);
		
		if (successCount > 0) {
			console.log('✅ Default runbooks seeded successfully!\n');
		}
	} catch (error) {
		console.error('❌ Fatal error seeding runbooks:', error);
		process.exit(1);
	}
}

seedRunbooks();

