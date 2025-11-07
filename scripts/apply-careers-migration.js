/**
 * Apply careers tables migration
 * Splits SQL file into individual statements and executes them
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

if (!process.env.DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const migrationFile = path.join(__dirname, '../drizzle/migrations/XXXX_careers_tables.sql');

async function applyMigration() {
	try {
		const migration = fs.readFileSync(migrationFile, 'utf8');
		
		// Remove comments and split by semicolon
		const cleaned = migration
			.split('\n')
			.filter(line => !line.trim().startsWith('--'))
			.join('\n');
		
		// Split by semicolon, but keep CREATE TABLE statements together
		const statements = cleaned
			.split(';')
			.map(s => s.trim())
			.filter(s => {
				const trimmed = s.trim();
				return trimmed.length > 0 && 
				       !trimmed.startsWith('COMMENT') &&
				       trimmed !== 'IF NOT EXISTS';
			})
			.map(s => s.endsWith(';') ? s : s + ';');

		console.log(`📄 Found ${statements.length} SQL statements to execute`);

		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			try {
				await sql(statement);
				console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
			} catch (error) {
				// Ignore "already exists" errors
				if (error.message.includes('already exists') || 
				    error.message.includes('duplicate key')) {
					console.log(`⚠️  Statement ${i + 1} skipped (already exists)`);
				} else {
					console.error(`❌ Statement ${i + 1} failed:`, error.message);
					console.error(`   SQL: ${statement.substring(0, 100)}...`);
					throw error;
				}
			}
		}

		console.log('\n✅ Migration applied successfully!');
		console.log('\n📝 Next steps:');
		console.log('   1. Test the API: curl http://localhost:3001/api/careers');
		console.log('   2. Access admin: http://localhost:3001/admin/careers');
		console.log('   3. View public page: http://localhost:3001/careers');
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		process.exit(1);
	}
}

applyMigration();

