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
		
		// Extract CREATE TABLE statements (they span multiple lines)
		const createTableRegex = /CREATE TABLE IF NOT EXISTS[^;]+;/gs;
		const createIndexRegex = /CREATE (UNIQUE )?INDEX IF NOT EXISTS[^;]+;/gs;
		const commentRegex = /COMMENT ON[^;]+;/gs;
		
		const createTables = migrationSQL.match(createTableRegex) || [];
		const createIndexes = migrationSQL.match(createIndexRegex) || [];
		const comments = migrationSQL.match(commentRegex) || [];
		
		console.log(`📝 Found:`);
		console.log(`   - ${createTables.length} CREATE TABLE statements`);
		console.log(`   - ${createIndexes.length} CREATE INDEX statements`);
		console.log(`   - ${comments.length} COMMENT statements\n`);
		
		console.log('🚀 Applying blog CMS migration...\n');
		
		let successCount = 0;
		let errorCount = 0;
		
		// First, create tables
		console.log('📊 Creating tables...');
		for (let i = 0; i < createTables.length; i++) {
			const statement = createTables[i].trim();
			try {
				await sql(statement);
				successCount++;
				const tableName = statement.match(/"([^"]+)"/)?.[1] || 'unknown';
				console.log(`  ✅ [${i + 1}/${createTables.length}] Created table: ${tableName}`);
			} catch (error) {
				if (error.message.includes('already exists')) {
					successCount++;
					const tableName = statement.match(/"([^"]+)"/)?.[1] || 'unknown';
					console.log(`  ⚠️  [${i + 1}/${createTables.length}] Table already exists: ${tableName}`);
				} else {
					errorCount++;
					console.error(`  ❌ [${i + 1}/${createTables.length}] Error:`, error.message);
					console.error(`     ${statement.substring(0, 100)}...`);
				}
			}
		}
		
		// Then, create indexes
		console.log('\n📊 Creating indexes...');
		for (let i = 0; i < createIndexes.length; i++) {
			const statement = createIndexes[i].trim();
			try {
				await sql(statement);
				successCount++;
				const indexName = statement.match(/"([^"]+)"/)?.[1] || 'unknown';
				console.log(`  ✅ [${i + 1}/${createIndexes.length}] Created index: ${indexName}`);
			} catch (error) {
				if (error.message.includes('already exists') || error.message.includes('duplicate')) {
					successCount++;
					const indexName = statement.match(/"([^"]+)"/)?.[1] || 'unknown';
					console.log(`  ⚠️  [${i + 1}/${createIndexes.length}] Index already exists: ${indexName}`);
				} else {
					errorCount++;
					console.error(`  ❌ [${i + 1}/${createIndexes.length}] Error:`, error.message);
				}
			}
		}
		
		// Finally, add comments
		console.log('\n📊 Adding comments...');
		for (let i = 0; i < comments.length; i++) {
			const statement = comments[i].trim();
			try {
				await sql(statement);
				successCount++;
				console.log(`  ✅ [${i + 1}/${comments.length}] Added comment`);
			} catch (error) {
				// Comments can fail if object doesn't exist, but that's usually OK
				if (error.message.includes('does not exist')) {
					console.log(`  ⚠️  [${i + 1}/${comments.length}] Comment skipped (object not found)`);
				} else {
					errorCount++;
					console.error(`  ❌ [${i + 1}/${comments.length}] Error:`, error.message);
				}
			}
		}
		
		console.log(`\n📊 Migration Summary:`);
		console.log(`  ✅ Successful: ${successCount}`);
		console.log(`  ❌ Errors: ${errorCount}`);
		
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
				console.log('⚠️  No blog tables found.');
			}
		} catch (error) {
			console.log('⚠️  Could not verify tables:', error.message);
		}
		
		if (errorCount === 0) {
			console.log('\n✅ Blog CMS migration applied successfully!');
			console.log('\n📝 Next steps:');
			console.log('   1. Create blog posts at: http://localhost:3001/content/blog/new');
			console.log('   2. View public blog at: http://localhost:3001/blog');
			console.log('   3. Manage posts at: http://localhost:3001/content/blog');
		} else {
			console.log('\n⚠️  Migration completed with some errors. Please review above.');
		}
		
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		console.error(error);
		process.exit(1);
	}
	
	process.exit(0);
}

applyMigration();

