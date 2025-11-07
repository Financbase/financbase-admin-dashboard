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

function splitSQL(sqlText) {
	// Remove header comments
	let cleaned = sqlText
		.replace(/^-- Migration:.*$/gm, '')
		.replace(/^-- Created:.*$/gm, '')
		.replace(/^-- Description:.*$/gm, '')
		.replace(/^--> statement-breakpoint$/gm, '');
	
	const statements = [];
	let currentStatement = '';
	let i = 0;
	let inQuotes = false;
	let quoteChar = null;
	let parenDepth = 0;
	
	while (i < cleaned.length) {
		const char = cleaned[i];
		const nextChar = cleaned[i + 1];
		
		// Handle quoted strings
		if ((char === '"' || char === "'") && (i === 0 || cleaned[i - 1] !== '\\')) {
			if (!inQuotes) {
				inQuotes = true;
				quoteChar = char;
			} else if (char === quoteChar) {
				inQuotes = false;
				quoteChar = null;
			}
			currentStatement += char;
		} else if (inQuotes) {
			currentStatement += char;
		} else {
			// Track parentheses depth
			if (char === '(') parenDepth++;
			if (char === ')') parenDepth--;
			
			// Check for statement terminator (semicolon outside quotes and parentheses)
			if (char === ';' && parenDepth === 0) {
				currentStatement += char;
				const trimmed = currentStatement.trim();
				if (trimmed && !trimmed.startsWith('--')) {
					statements.push(trimmed);
				}
				currentStatement = '';
			} else {
				currentStatement += char;
			}
		}
		i++;
	}
	
	// Add any remaining statement
	if (currentStatement.trim()) {
		statements.push(currentStatement.trim());
	}
	
	return statements.filter(s => s && s.length > 0 && !s.match(/^\s*$/));
}

async function applyMigration() {
	try {
		if (!fs.existsSync(migrationFile)) {
			console.error(`❌ Migration file not found: ${migrationFile}`);
			process.exit(1);
		}
		
		console.log('📄 Reading migration file...');
		const migration = fs.readFileSync(migrationFile, 'utf8');
		
		console.log('✂️  Splitting SQL into statements...');
		const statements = splitSQL(migration);
		console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
		
		console.log('🚀 Applying blog CMS migration...\n');
		
		let successCount = 0;
		let errorCount = 0;
		
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i];
			
			// Skip empty statements and comments
			if (!statement.trim() || statement.trim().startsWith('--')) {
				continue;
			}
			
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
					error.message.includes('does not exist') ||
					error.message.includes('duplicate_object') ||
					error.message.includes('relation already exists')
				) {
					successCount++;
					const preview = statement.substring(0, 60).replace(/\n/g, ' ').trim();
					console.log(`  ⚠️  [${i + 1}/${statements.length}] ${preview}... (already exists - OK)`);
				} else {
					errorCount++;
					console.error(`  ❌ [${i + 1}/${statements.length}] Error:`, error.message);
					console.error(`     Statement: ${statement.substring(0, 100)}...`);
				}
			}
		}
		
		console.log(`\n📊 Migration Summary:`);
		console.log(`  ✅ Successful: ${successCount}`);
		console.log(`  ❌ Errors: ${errorCount}\n`);
		
		if (errorCount === 0) {
			console.log('✅ Blog CMS migration applied successfully!');
			console.log('\n📝 Next steps:');
			console.log('   1. Create blog posts at: http://localhost:3001/content/blog/new');
			console.log('   2. View public blog at: http://localhost:3001/blog');
			console.log('   3. Manage posts at: http://localhost:3001/content/blog');
		} else {
			console.log('⚠️  Migration completed with some errors. Please review above.');
		}
		
	} catch (error) {
		console.error('\n❌ Migration failed:', error.message);
		console.error(error);
		process.exit(1);
	}
	
	process.exit(0);
}

applyMigration();

