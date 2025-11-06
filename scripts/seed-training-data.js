/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * Seed script for training programs and learning paths
 * Run with: node scripts/seed-training-data.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedTrainingData() {
	try {
		console.log('🌱 Seeding training data...');

		// Training programs data (matching the original hardcoded data)
		const trainingPrograms = [
			{
				title: 'Getting Started',
				description: 'Quick introduction to Financbase for new users',
				duration: '15 minutes',
				difficulty: 'Beginner',
				icon: 'Zap',
				href: '/docs/help/getting-started',
				topics: ['Account setup', 'Basic navigation', 'First steps'],
				order: 1,
			},
			{
				title: 'Dashboard Training',
				description: 'Learn to navigate and use your financial dashboard',
				duration: '20 minutes',
				difficulty: 'Beginner',
				icon: 'Target',
				href: '/docs/help/dashboard',
				topics: ['Dashboard overview', 'Key metrics', 'Charts and visualizations'],
				order: 2,
			},
			{
				title: 'Invoice Management',
				description: 'Master invoice creation, management, and workflows',
				duration: '20 minutes',
				difficulty: 'Intermediate',
				icon: 'BookOpen',
				href: '/docs',
				topics: ['Creating invoices', 'Managing invoices', 'Invoice workflows'],
				order: 3,
			},
			{
				title: 'Expense Tracking',
				description: 'Learn to track and manage expenses effectively',
				duration: '20 minutes',
				difficulty: 'Intermediate',
				icon: 'Users',
				href: '/docs',
				topics: ['Recording expenses', 'Expense categories', 'Expense reports'],
				order: 4,
			},
			{
				title: 'Advanced Features',
				description: 'Explore workflows, automation, and integrations',
				duration: '25 minutes',
				difficulty: 'Advanced',
				icon: 'GraduationCap',
				href: '/docs/help/workflows',
				topics: ['Workflows and automation', 'Integrations', 'Custom dashboards'],
				order: 5,
			},
			{
				title: 'AI Assistant',
				description: 'Leverage AI-powered financial insights and recommendations',
				duration: '15 minutes',
				difficulty: 'Intermediate',
				icon: 'Video',
				href: '/financbase-gpt',
				topics: ['Using Financbase GPT', 'Financial insights', 'Recommendations'],
				order: 6,
			},
		];

		// Insert training programs using Neon template literal format
		console.log('📚 Inserting training programs...');
		const programIds = [];

		for (const program of trainingPrograms) {
			try {
				// Check if program already exists
				const existing = await sql`
					SELECT id FROM training_programs WHERE title = ${program.title} LIMIT 1
				`;

				if (existing && existing.length > 0) {
					programIds.push(existing[0].id);
					console.log(`  ℹ️  Already exists: ${program.title}`);
				} else {
					const result = await sql`
						INSERT INTO training_programs (title, description, duration, difficulty, icon, href, topics, "order", is_active)
						VALUES (${program.title}, ${program.description}, ${program.duration}, ${program.difficulty}::training_difficulty, ${program.icon}, ${program.href}, ${JSON.stringify(program.topics)}::jsonb, ${program.order}, true)
						RETURNING id
					`;

					if (result && result.length > 0) {
						programIds.push(result[0].id);
						console.log(`  ✅ Created: ${program.title}`);
					}
				}
			} catch (error) {
				console.error(`  ❌ Error creating ${program.title}:`, error.message);
			}
		}

		// Learning paths data
		const learningPaths = [
			{
				title: 'Business Owner',
				description: 'Focus on dashboard, invoices, and reports',
				duration: '1.5 hours',
				icon: 'Users',
				programIds: programIds.slice(0, 4), // First 4 programs
			},
			{
				title: 'Accountant',
				description: 'Complete training for all features',
				duration: '3 hours',
				icon: 'GraduationCap',
				programIds: programIds, // All programs
			},
			{
				title: 'Team Member',
				description: 'Basic features and collaboration',
				duration: '1 hour',
				icon: 'Target',
				programIds: [programIds[0], programIds[1], programIds[3]].filter(Boolean), // Getting Started, Dashboard, Expense Tracking
			},
		];

		// Insert learning paths
		console.log('\n🛤️  Inserting learning paths...');
		for (const path of learningPaths) {
			try {
				// Check if path already exists
				const existing = await sql`
					SELECT id FROM learning_paths WHERE title = ${path.title} LIMIT 1
				`;

				if (existing && existing.length > 0) {
					console.log(`  ℹ️  Already exists: ${path.title}`);
				} else {
					const result = await sql`
						INSERT INTO learning_paths (title, description, duration, icon, program_ids, is_active)
						VALUES (${path.title}, ${path.description}, ${path.duration}, ${path.icon}, ${JSON.stringify(path.programIds)}::jsonb, true)
						RETURNING id
					`;

					if (result && result.length > 0) {
						console.log(`  ✅ Created: ${path.title}`);
					}
				}
			} catch (error) {
				console.error(`  ❌ Error creating ${path.title}:`, error.message);
			}
		}

		console.log('\n✨ Training data seeded successfully!');
		console.log(`   - ${trainingPrograms.length} training programs`);
		console.log(`   - ${learningPaths.length} learning paths`);
	} catch (error) {
		console.error('❌ Error seeding training data:', error);
		process.exit(1);
	}
}

// Run the seed function
seedTrainingData()
	.then(() => {
		console.log('\n🎉 Done!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Fatal error:', error);
		process.exit(1);
	});
