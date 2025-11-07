#!/usr/bin/env tsx

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Seed Guides Data
 * Populates the database with initial guide content
 * 
 * Usage: tsx scripts/seed-guides.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
import { guides } from '../lib/db/schemas/documentation.schema';
import { users } from '../lib/db/schemas/users.schema';
import { sql as drizzleSql } from 'drizzle-orm';

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// Get a default author ID (first user in the database)
async function getDefaultAuthorId(): Promise<string> {
	// Try to get a user from the database
	// First try to get from financbase.users, then try public.users
	try {
		const result = await sql`
			SELECT clerk_id, id::text as id_str 
			FROM financbase.users 
			LIMIT 1
		`;
		
		if (result.length > 0 && result[0]) {
			return result[0].clerk_id || result[0].id_str;
		}
	} catch (error) {
		console.log('Could not find user in financbase.users, trying public.users...');
	}
	
	// Fallback: try public.users or use a default
	try {
		const result = await sql`
			SELECT clerk_id, id::text as id_str 
			FROM users 
			LIMIT 1
		`;
		
		if (result.length > 0 && result[0]) {
			return result[0].clerk_id || result[0].id_str;
		}
	} catch (error) {
		console.log('Could not find user in public.users');
	}
	
	// If no user found, we'll need to use a placeholder or create one
	// For now, throw an error with helpful message
	throw new Error('No users found in database. Please create a user first. You can sign up through the application.');
}

const guideData = [
	{
		title: "Getting Started with Financbase",
		slug: "getting-started-with-financbase",
		content: `# Getting Started with Financbase

Welcome to Financbase! This comprehensive guide will help you get up and running quickly.

## Overview

Financbase is a comprehensive financial management platform designed to help you take control of your finances. Whether you're managing personal finances or running a business, Financbase provides the tools you need to stay organized and make informed decisions.

## Key Features

- **Dashboard Overview**: Get a real-time view of your financial health
- **Transaction Management**: Track and categorize all your transactions
- **Financial Reporting**: Generate detailed reports and insights
- **Budget Tracking**: Set budgets and monitor your spending
- **Invoice Management**: Create and manage invoices effortlessly
- **Expense Tracking**: Keep track of all your expenses

## Getting Started

### Step 1: Complete Your Profile

1. Navigate to your profile settings
2. Add your personal or business information
3. Configure your preferences

### Step 2: Connect Your Accounts

1. Go to the Accounts section
2. Add your bank accounts, credit cards, and other financial accounts
3. Enable automatic transaction syncing (if available)

### Step 3: Explore the Dashboard

1. Familiarize yourself with the main dashboard
2. Review the key metrics and charts
3. Customize your dashboard layout

## Next Steps

1. Set up your first budget
2. Create your first invoice
3. Record your first expense
4. Explore the reporting features

## Need Help?

If you have any questions, feel free to reach out to our support team through the support page.`,
		excerpt: "Learn the basics of setting up your account and navigating the platform",
		description: "Learn the basics of setting up your account and navigating the platform",
		category: "getting-started",
		type: "tutorial",
		difficulty: "beginner",
		duration: "15 min",
		estimatedReadTime: 15,
		tags: ["setup", "basics", "onboarding", "getting-started"],
		keywords: ["getting started", "setup", "basics", "tutorial"],
		featured: true,
		priority: 10,
		status: "published",
	},
	{
		title: "Advanced Financial Analytics",
		slug: "advanced-financial-analytics",
		content: `# Advanced Financial Analytics

Deep dive into Financbase's powerful analytics features and learn how to create custom reports.

## Introduction

Financbase offers advanced analytics capabilities that help you understand your financial data at a deeper level. This guide will walk you through the most powerful features.

## Advanced Features

### Custom Report Builder

Create custom reports tailored to your specific needs:

1. Navigate to Reports > Custom Reports
2. Select your data sources
3. Choose your metrics and dimensions
4. Apply filters and date ranges
5. Generate and export your report

### Data Visualization

Transform your data into actionable insights:

- **Charts and Graphs**: Visualize trends and patterns
- **Interactive Dashboards**: Create dynamic dashboards
- **Custom Visualizations**: Build your own charts

### Trend Analysis

Identify patterns and trends in your financial data:

- Revenue trends over time
- Expense patterns by category
- Seasonal variations
- Growth metrics

### Forecasting

Predict future financial performance:

- Revenue forecasting
- Expense projections
- Cash flow predictions
- Budget planning

## Best Practices

1. **Regular Reviews**: Review your analytics regularly
2. **Set Goals**: Use analytics to set and track goals
3. **Compare Periods**: Compare current performance to historical data
4. **Export Data**: Export reports for external analysis

## Conclusion

Mastering advanced analytics will help you make better financial decisions and grow your business.`,
		excerpt: "Deep dive into advanced analytics features and custom reporting",
		description: "Deep dive into advanced analytics features and custom reporting",
		category: "advanced",
		type: "guide",
		difficulty: "intermediate",
		duration: "45 min",
		estimatedReadTime: 45,
		tags: ["analytics", "reporting", "data", "advanced"],
		keywords: ["analytics", "reports", "data analysis", "custom reports"],
		featured: true,
		priority: 8,
		status: "published",
	},
	{
		title: "API Integration Guide",
		slug: "api-integration-guide",
		content: `# API Integration Guide

Complete guide to integrating Financbase with your existing systems using our REST API.

## Introduction

The Financbase API allows you to integrate your applications, workflows, and systems with Financbase. This guide will help you get started with API integration.

## Getting Started

### Authentication

1. Generate an API key from your account settings
2. Include the API key in your request headers
3. Use HTTPS for all API requests

### Base URL

All API requests should be made to:
\`\`\`
https://api.financbase.com/v1
\`\`\`

## Common Use Cases

### Creating Invoices

\`\`\`javascript
POST /api/v1/invoices
{
  "clientId": "123",
  "amount": 1000.00,
  "dueDate": "2025-02-15",
  "items": [...]
}
\`\`\`

### Fetching Transactions

\`\`\`javascript
GET /api/v1/transactions?startDate=2025-01-01&endDate=2025-01-31
\`\`\`

### Updating Expenses

\`\`\`javascript
PUT /api/v1/expenses/{id}
{
  "amount": 500.00,
  "category": "Office Supplies"
}
\`\`\`

## Webhooks

Set up webhooks to receive real-time updates:

1. Configure webhook endpoints
2. Subscribe to events
3. Handle incoming webhook payloads

## Best Practices

1. **Rate Limiting**: Respect rate limits
2. **Error Handling**: Implement proper error handling
3. **Security**: Keep your API keys secure
4. **Testing**: Test in a development environment first

## Conclusion

With the Financbase API, you can build powerful integrations that streamline your workflows.`,
		excerpt: "Complete guide to integrating Financbase with your existing systems",
		description: "Complete guide to integrating Financbase with your existing systems",
		category: "integrations",
		type: "documentation",
		difficulty: "advanced",
		duration: "30 min",
		estimatedReadTime: 30,
		tags: ["api", "integration", "development", "webhooks"],
		keywords: ["api", "integration", "rest api", "webhooks", "developer"],
		featured: false,
		priority: 7,
		status: "published",
	},
	{
		title: "Setting Up Automated Reports",
		slug: "setting-up-automated-reports",
		content: `# Setting Up Automated Reports

Configure automated financial reports and email notifications to stay on top of your finances.

## Introduction

Automated reports save time and ensure you never miss important financial updates. This guide will show you how to set up automated reporting.

## Setting Up Reports

### Step 1: Create a Report Template

1. Navigate to Reports > Templates
2. Click "Create New Template"
3. Select your report type
4. Configure your metrics and filters
5. Save your template

### Step 2: Schedule Automation

1. Open your report template
2. Click "Schedule"
3. Choose your frequency:
   - Daily
   - Weekly
   - Monthly
   - Quarterly
4. Set your delivery time

### Step 3: Configure Recipients

1. Add email recipients
2. Set delivery preferences
3. Customize email content

## Report Types

### Financial Summary

Get a comprehensive overview of your finances:
- Revenue and expenses
- Profit and loss
- Cash flow summary

### Budget Report

Track your budget performance:
- Budget vs actual
- Variance analysis
- Category breakdown

### Invoice Report

Monitor your invoicing:
- Outstanding invoices
- Payment status
- Revenue by client

## Best Practices

1. **Start Simple**: Begin with basic reports
2. **Review Regularly**: Check report accuracy
3. **Customize**: Tailor reports to your needs
4. **Automate**: Set up recurring reports

## Conclusion

Automated reports help you stay informed without manual effort.`,
		excerpt: "Configure automated financial reports and email notifications",
		description: "Configure automated financial reports and email notifications",
		category: "getting-started",
		type: "tutorial",
		difficulty: "beginner",
		duration: "20 min",
		estimatedReadTime: 20,
		tags: ["automation", "reports", "email", "notifications"],
		keywords: ["automation", "reports", "email", "scheduled reports"],
		featured: false,
		priority: 6,
		status: "published",
	},
	{
		title: "Troubleshooting Common Issues",
		slug: "troubleshooting-common-issues",
		content: `# Troubleshooting Common Issues

Solutions to the most common problems users encounter with Financbase.

## Common Issues and Solutions

### Issue: Transactions Not Syncing

**Solution:**
1. Check your account connection status
2. Verify your credentials are correct
3. Try disconnecting and reconnecting the account
4. Contact support if the issue persists

### Issue: Reports Not Generating

**Solution:**
1. Verify you have data for the selected date range
2. Check your report filters
3. Ensure you have the necessary permissions
4. Try regenerating the report

### Issue: Invoice Not Sending

**Solution:**
1. Check the recipient email address
2. Verify your email settings
3. Check your spam folder
4. Try sending a test email

### Issue: Dashboard Not Loading

**Solution:**
1. Clear your browser cache
2. Try a different browser
3. Check your internet connection
4. Disable browser extensions

## Getting Additional Help

If you're still experiencing issues:

1. Check our knowledge base
2. Contact support through the help center
3. Review our community forums
4. Submit a support ticket

## Prevention Tips

1. **Keep Software Updated**: Ensure you're using the latest version
2. **Regular Backups**: Back up your data regularly
3. **Monitor Connections**: Check account connections periodically
4. **Read Documentation**: Stay informed about new features

## Conclusion

Most issues can be resolved quickly with these troubleshooting steps.`,
		excerpt: "Solutions to the most common problems users encounter",
		description: "Solutions to the most common problems users encounter",
		category: "troubleshooting",
		type: "guide",
		difficulty: "intermediate",
		duration: "25 min",
		estimatedReadTime: 25,
		tags: ["troubleshooting", "support", "issues", "help"],
		keywords: ["troubleshooting", "support", "help", "issues", "problems"],
		featured: false,
		priority: 5,
		status: "published",
	},
	{
		title: "Advanced Data Visualization",
		slug: "advanced-data-visualization",
		content: `# Advanced Data Visualization

Create stunning charts and dashboards with custom visualizations in Financbase.

## Introduction

Data visualization is key to understanding your financial information. This guide covers advanced visualization techniques.

## Chart Types

### Line Charts

Perfect for showing trends over time:
- Revenue trends
- Expense patterns
- Growth metrics

### Bar Charts

Great for comparing categories:
- Category expenses
- Revenue by client
- Budget comparisons

### Pie Charts

Ideal for showing proportions:
- Expense distribution
- Revenue sources
- Budget allocation

## Custom Dashboards

### Creating a Dashboard

1. Navigate to Dashboards
2. Click "Create New Dashboard"
3. Add widgets and charts
4. Customize layouts
5. Save and share

### Widget Types

- **Metrics**: Key performance indicators
- **Charts**: Visual data representations
- **Tables**: Detailed data views
- **Filters**: Interactive controls

## Best Practices

1. **Choose the Right Chart**: Match chart type to your data
2. **Keep It Simple**: Avoid clutter
3. **Use Color Wisely**: Use color to highlight important data
4. **Add Context**: Include labels and legends

## Conclusion

Effective data visualization helps you make better financial decisions.`,
		excerpt: "Create stunning charts and dashboards with custom visualizations",
		description: "Create stunning charts and dashboards with custom visualizations",
		category: "advanced",
		type: "tutorial",
		difficulty: "advanced",
		duration: "40 min",
		estimatedReadTime: 40,
		tags: ["visualization", "charts", "dashboards", "data"],
		keywords: ["visualization", "charts", "dashboards", "data visualization"],
		featured: false,
		priority: 4,
		status: "published",
	},
];

async function seedGuides() {
	try {
		console.log('🚀 Starting guides seeding...');

		// Get default author ID
		const authorId = await getDefaultAuthorId();
		console.log(`👤 Using author ID: ${authorId}`);

		// Set search path to financbase schema
		await sql`SET search_path TO financbase, public`;

		// Check if guides already exist using raw SQL
		const existingCheck = await sql`
			SELECT id FROM financbase_guides LIMIT 1
		`;
		if (existingCheck.length > 0) {
			console.log('⚠️  Guides already exist in database. Skipping seed.');
			console.log('   To reseed, delete existing guides first.');
			return;
		}

		// Insert guides using raw SQL for better compatibility
		const insertedGuides = [];
		for (const guide of guideData) {
			const result = await sql`
				INSERT INTO financbase_guides (
					title, slug, content, excerpt, description, category, type, difficulty,
					duration, estimated_read_time, author_id, status, tags, keywords,
					featured, priority, sort_order, published_at, created_at, updated_at
				) VALUES (
					${guide.title}, ${guide.slug}, ${guide.content}, ${guide.excerpt}, 
					${guide.description}, ${guide.category}, ${guide.type}, ${guide.difficulty},
					${guide.duration}, ${guide.estimatedReadTime}, ${authorId}, ${guide.status},
					${JSON.stringify(guide.tags)}::jsonb, ${JSON.stringify(guide.keywords)}::jsonb,
					${guide.featured}, ${guide.priority}, ${guide.sortOrder || 0},
					NOW(), NOW(), NOW()
				)
				RETURNING id, title, slug
			`;
			
			if (result.length > 0 && result[0]) {
				insertedGuides.push(result[0]);
				console.log(`✅ Created guide: ${guide.title}`);
			}
		}

		console.log(`\n🎉 Successfully seeded ${insertedGuides.length} guides!`);
		console.log('\n📚 Guides created:');
		insertedGuides.forEach((guide, index) => {
			console.log(`   ${index + 1}. ${guide.title} (${guide.slug})`);
		});

		return insertedGuides;
	} catch (error) {
		console.error('❌ Error seeding guides:', error);
		throw error;
	}
}

// Run the seed function
if (require.main === module) {
	seedGuides()
		.then(() => {
			console.log('\n✅ Seed completed successfully!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('\n❌ Seed failed:', error);
			process.exit(1);
		});
}

export { seedGuides };

