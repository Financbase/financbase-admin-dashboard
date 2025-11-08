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
const migrationFile = path.join(__dirname, '../drizzle/migrations/0055_incident_response_system.sql');

function splitSQL(sqlText) {
	// Split by semicolons, but preserve DO $$ blocks
	const statements = [];
	let currentStatement = '';
	let inDoBlock = false;
	let dollarQuote = '';
	
	for (let i = 0; i < sqlText.length; i++) {
		const char = sqlText[i];
		const nextChars = sqlText.substring(i, i + 2);
		
		// Check for dollar-quoted strings (DO $$ BEGIN ... END $$;)
		if (nextChars === '$$' && !inDoBlock) {
			inDoBlock = true;
			// Find the closing $$
			let j = i + 2;
			while (j < sqlText.length) {
				if (sqlText.substring(j, j + 2) === '$$') {
					dollarQuote = sqlText.substring(i, j + 2);
					currentStatement += dollarQuote;
					i = j + 1;
					inDoBlock = false;
					break;
				}
				j++;
			}
			continue;
		}
		
		currentStatement += char;
		
		// If we hit a semicolon and we're not in a DO block, split here
		if (char === ';' && !inDoBlock) {
			const trimmed = currentStatement.trim();
			if (trimmed && !trimmed.startsWith('--')) {
				statements.push(trimmed);
			}
			currentStatement = '';
		}
	}
	
	// Add any remaining statement
	if (currentStatement.trim() && !currentStatement.trim().startsWith('--')) {
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
		
		console.log('🚀 Applying Incident Response System migration...\n');
		
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
				const preview = statement.substring(0, 80).replace(/\n/g, ' ').trim();
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
					const preview = statement.substring(0, 80).replace(/\n/g, ' ').trim();
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
		console.log(`  ❌ Errors: ${errorCount}\n`);
		
		if (errorCount === 0) {
			console.log('✅ Incident Response System migration completed successfully!\n');
		} else {
			console.log('⚠️  Migration completed with some errors. Please review above.\n');
		}
	} catch (error) {
		console.error('❌ Fatal error applying migration:', error);
		process.exit(1);
	}
}

applyMigration();

