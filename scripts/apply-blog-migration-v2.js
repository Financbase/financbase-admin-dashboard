require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL not found in .env.local');
	process.exit(1);
}

const sql = neon(DATABASE_URL);
const migrationFile = path.join(__dirname, '../drizzle/migrations/0014_blog_cms_system.sql');

async function applyMigration() {
	try {
		if (!fs.existsSync(migrationFile)) {
			console.error(`❌ Migration file not found: ${migrationFile}`);
			process.exit(1);
		}
		
		console.log('📄 Reading migration file...');
		const migrationSQL = fs.readFileSync(migrationFile, 'utf8');
		
		// Execute the entire migration as one statement
		// Neon serverless supports multi-statement SQL
		console.log('🚀 Applying blog CMS migration...\n');
		
		try {
			await sql(migrationSQL);
			console.log('✅ Migration applied successfully!');
		} catch (error) {
			// If it fails, try executing statements one by one
			console.log('⚠️  Multi-statement execution failed, trying individual statements...\n');
			
			// Split by semicolon but keep CREATE TABLE statements together
			const statements = migrationSQL
				.split(';')
				.map(s => s.trim())
				.filter(s => s.length > 0 && !s.startsWith('--'))
				.map(s => s.endsWith(';') ? s : s + ';');
			
			let successCount = 0;
			let errorCount = 0;
			
			for (let i = 0; i < statements.length; i++) {
				const statement = statements[i];
				
				try {
					await sql(statement);
					successCount++;
					const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
					console.log(`  ✅ [${i + 1}/${statements.length}] ${preview}...`);
				} catch (error) {
					// Some errors are expected (e.g., objects that already exist)
					if (
						error.message.includes('already exists') ||
						error.message.includes('duplicate') ||
						error.message.includes('duplicate_object') ||
						error.message.includes('relation already exists')
					) {
						successCount++;
						const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
						console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists - OK)`);
					} else {
						errorCount++;
						console.error(`  ❌ [${i + 1}/${statements.length}] Error:`, error.message);
						console.error(`     Statement: ${statement.substring(0, 150)}...`);
					}
				}
			}
			
			console.log(`\n📊 Migration Summary:`);
			console.log(`  ✅ Successful: ${successCount}`);
			console.log(`  ❌ Errors: ${errorCount}`);
		}
		
		// Verify tables were created
		console.log('\n🔍 Verifying tables...');
		try {
			const tables = await sql`
				SELECT table_name 
				FROM information_schema.tables 
				WHERE table_schema = 'financbase' 
				AND table_name LIKE 'financbase_blog%'
				ORDER BY table_name
			`;
			
			if (tables.length > 0) {
				console.log('✅ Blog tables found:');
				tables.forEach(table => {
					console.log(`   - ${table.table_name}`);
				});
			} else {
				console.log('⚠️  No blog tables found. They may need to be created manually.');
			}
		} catch (error) {
			console.log('⚠️  Could not verify tables:', error.message);
		}
		
		console.log('\n📝 Next steps:');
		console.log('   1. Create blog posts at: http://localhost:3001/content/blog/new');
		console.log('   2. View public blog at: http://localhost:3001/blog');
		console.log('   3. Manage posts at: http://localhost:3001/content/blog');
		
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		console.error(error);
		process.exit(1);
	}
	
	process.exit(0);
}

applyMigration();

