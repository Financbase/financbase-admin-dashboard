/**
 * Test script for training system functionality
 * Tests database queries, service layer, and data structure
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testTrainingSystem() {
	console.log('🧪 Testing Training System Functionality...\n');
	
	let passed = 0;
	let failed = 0;
	const errors = [];

	// Test 1: Verify training programs exist
	console.log('Test 1: Verify training programs exist');
	try {
		const programs = await sql`
			SELECT id, title, difficulty, duration, icon, topics, "order"
			FROM public.training_programs
			WHERE is_active = true
			ORDER BY "order"
		`;
		
		if (programs.length >= 6) {
			console.log(`  ✅ PASS: Found ${programs.length} training programs`);
			passed++;
			
			// Verify structure
			const first = programs[0];
			if (first.id && first.title && first.difficulty && first.topics) {
				console.log(`  ✅ PASS: Program structure is correct`);
				passed++;
			} else {
				console.log(`  ❌ FAIL: Program structure incomplete`);
				failed++;
			}
		} else {
			console.log(`  ❌ FAIL: Expected at least 6 programs, found ${programs.length}`);
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 2: Verify learning paths exist
	console.log('\nTest 2: Verify learning paths exist');
	try {
		const paths = await sql`
			SELECT id, title, description, duration, icon, program_ids
			FROM public.learning_paths
			WHERE is_active = true
		`;
		
		if (paths.length >= 3) {
			console.log(`  ✅ PASS: Found ${paths.length} learning paths`);
			passed++;
			
			// Verify program_ids is valid JSON
			const first = paths[0];
			if (first.program_ids && Array.isArray(first.program_ids)) {
				console.log(`  ✅ PASS: Learning path structure is correct`);
				passed++;
			} else {
				console.log(`  ❌ FAIL: program_ids is not a valid array`);
				failed++;
			}
		} else {
			console.log(`  ❌ FAIL: Expected at least 3 learning paths, found ${paths.length}`);
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 3: Test enum types
	console.log('\nTest 3: Verify enum types exist');
	try {
		const difficultyEnum = await sql`
			SELECT enumlabel 
			FROM pg_enum 
			WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'training_difficulty')
			ORDER BY enumsortorder
		`;
		
		const statusEnum = await sql`
			SELECT enumlabel 
			FROM pg_enum 
			WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'training_status')
			ORDER BY enumsortorder
		`;
		
		if (difficultyEnum.length === 3 && statusEnum.length === 3) {
			console.log(`  ✅ PASS: Enum types are correct`);
			console.log(`     Difficulty: ${difficultyEnum.map(e => e.enumlabel).join(', ')}`);
			console.log(`     Status: ${statusEnum.map(e => e.enumlabel).join(', ')}`);
			passed++;
		} else {
			console.log(`  ❌ FAIL: Enum types incorrect`);
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 4: Test training_progress table structure
	console.log('\nTest 4: Verify training_progress table structure');
	try {
		const columns = await sql`
			SELECT column_name, data_type, is_nullable
			FROM information_schema.columns
			WHERE table_schema = 'public' AND table_name = 'training_progress'
			ORDER BY ordinal_position
		`;
		
		const requiredColumns = ['id', 'user_id', 'program_id', 'status', 'progress'];
		const foundColumns = columns.map(c => c.column_name);
		const missing = requiredColumns.filter(col => !foundColumns.includes(col));
		
		if (missing.length === 0) {
			console.log(`  ✅ PASS: All required columns exist`);
			passed++;
		} else {
			console.log(`  ❌ FAIL: Missing columns: ${missing.join(', ')}`);
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 5: Test foreign key constraints
	console.log('\nTest 5: Verify foreign key constraints');
	try {
		const fks = await sql`
			SELECT
				tc.constraint_name,
				tc.table_name,
				kcu.column_name,
				ccu.table_name AS foreign_table_name,
				ccu.column_name AS foreign_column_name
			FROM information_schema.table_constraints AS tc
			JOIN information_schema.key_column_usage AS kcu
				ON tc.constraint_name = kcu.constraint_name
			JOIN information_schema.constraint_column_usage AS ccu
				ON ccu.constraint_name = tc.constraint_name
			WHERE tc.constraint_type = 'FOREIGN KEY'
				AND tc.table_schema = 'public'
				AND tc.table_name IN ('training_progress', 'learning_path_progress')
		`;
		
		if (fks.length >= 4) {
			console.log(`  ✅ PASS: Found ${fks.length} foreign key constraints`);
			passed++;
		} else {
			console.log(`  ❌ FAIL: Expected at least 4 foreign keys, found ${fks.length}`);
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 6: Test indexes
	console.log('\nTest 6: Verify indexes exist');
	try {
		const indexes = await sql`
			SELECT indexname
			FROM pg_indexes
			WHERE tablename IN ('training_programs', 'training_progress', 'learning_paths', 'learning_path_progress')
			AND schemaname = 'public'
		`;
		
		if (indexes.length >= 4) {
			console.log(`  ✅ PASS: Found ${indexes.length} indexes`);
			passed++;
		} else {
			console.log(`  ⚠️  WARN: Expected more indexes, found ${indexes.length}`);
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Test 7: Test data integrity - verify program_ids in learning_paths reference real programs
	console.log('\nTest 7: Verify data integrity');
	try {
		const paths = await sql`
			SELECT id, title, program_ids
			FROM public.learning_paths
			WHERE is_active = true
		`;
		
		let allValid = true;
		for (const path of paths) {
			if (path.program_ids && Array.isArray(path.program_ids) && path.program_ids.length > 0) {
				const programIds = path.program_ids;
				const validPrograms = await sql`
					SELECT id FROM public.training_programs WHERE id = ANY(${programIds})
				`;
				
				if (validPrograms.length !== programIds.length) {
					console.log(`  ❌ FAIL: Learning path "${path.title}" has invalid program IDs`);
					allValid = false;
				}
			}
		}
		
		if (allValid) {
			console.log(`  ✅ PASS: All learning path program references are valid`);
			passed++;
		} else {
			failed++;
		}
	} catch (error) {
		console.log(`  ❌ FAIL: ${error.message}`);
		failed++;
		errors.push(error);
	}

	// Summary
	console.log('\n' + '='.repeat(50));
	console.log('📊 Test Summary');
	console.log('='.repeat(50));
	console.log(`✅ Passed: ${passed}`);
	console.log(`❌ Failed: ${failed}`);
	console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
	
	if (failed > 0) {
		console.log('\n❌ Some tests failed. Please review the errors above.');
		process.exit(1);
	} else {
		console.log('\n🎉 All tests passed! Training system is functional.');
		process.exit(0);
	}
}

testTrainingSystem().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});

