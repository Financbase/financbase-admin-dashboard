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
 * Seed Help Articles Data
 * Populates the database with initial help article content for the support center
 * 
 * Usage: tsx scripts/seed-help-articles.ts
 */

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as dotenv from 'dotenv';
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

// Category definitions
const categoryData = [
	{
		name: 'Getting Started',
		slug: 'getting-started',
		description: 'New to Financbase? Start here with our comprehensive guides',
		icon: 'BookOpen',
		color: '#3B82F6',
		sortOrder: 1,
	},
	{
		name: 'Account & Billing',
		slug: 'account-billing',
		description: 'Manage your account, subscription, and payment settings',
		icon: 'CreditCard',
		color: '#10B981',
		sortOrder: 2,
	},
	{
		name: 'Account Management',
		slug: 'account-management',
		description: 'Manage your account settings and preferences',
		icon: 'Settings',
		color: '#3B82F6',
		sortOrder: 3,
	},
	{
		name: 'Security & Privacy',
		slug: 'security-privacy',
		description: 'Keep your data safe and secure with best practices',
		icon: 'Shield',
		color: '#EF4444',
		sortOrder: 4,
	},
	{
		name: 'API & Integrations',
		slug: 'api-integrations',
		description: 'Connect Financbase with your favorite tools and services',
		icon: 'Zap',
		color: '#8B5CF6',
		sortOrder: 5,
	},
	{
		name: 'Troubleshooting',
		slug: 'troubleshooting',
		description: 'Fix common issues and resolve errors',
		icon: 'AlertCircle',
		color: '#F59E0B',
		sortOrder: 6,
	},
];

// Article data organized by category
const articleData: Record<string, Array<{
	title: string;
	slug: string;
	content: string;
	excerpt: string;
	priority: number;
	featured: boolean;
	tags: string[];
	keywords: string[];
}>> = {
	'getting-started': [
		{
			title: 'Quick Start Guide',
			slug: 'quick-start-guide',
			excerpt: 'Get up and running with Financbase in 5 minutes',
			content: `# Quick Start Guide

Welcome to Financbase! This guide will help you get started in just 5 minutes.

## Step 1: Create Your Account

1. Sign up for a Financbase account
2. Verify your email address
3. Complete your profile setup

## Step 2: Connect Your Accounts

1. Navigate to Settings > Accounts
2. Add your bank accounts, credit cards, or other financial accounts
3. Enable automatic transaction syncing

## Step 3: Explore the Dashboard

Your dashboard provides a comprehensive view of your financial health:
- Account balances
- Recent transactions
- Budget overview
- Financial insights

## Step 4: Set Up Your First Budget

1. Go to Budgets in the navigation
2. Click "Create Budget"
3. Set spending limits for different categories
4. Track your progress throughout the month

## Next Steps

- [Account Setup Guide](/docs/help/account-setup)
- [Dashboard Overview](/docs/help/dashboard)
- [First Steps](/docs/first-steps)`,
			priority: 10,
			featured: true,
			tags: ['getting-started', 'onboarding', 'setup'],
			keywords: ['quick start', 'getting started', 'setup', 'onboarding'],
		},
		{
			title: 'Account Setup',
			slug: 'account-setup',
			excerpt: 'Learn how to configure your organization and user settings',
			content: `# Account Setup Guide

This guide will walk you through setting up your Financbase account.

## Organization Setup

### Creating Your Organization

1. Navigate to Settings > Organization
2. Enter your organization name
3. Add your business details
4. Configure tax settings

### User Management

Add team members to your organization:
1. Go to Settings > Users
2. Click "Invite User"
3. Enter their email address
4. Assign appropriate roles

## Profile Configuration

### Personal Information

Update your profile:
- Full name
- Email address
- Phone number
- Timezone

### Preferences

Customize your experience:
- Date format
- Currency
- Language
- Notification settings

## Security Settings

- Enable two-factor authentication
- Set up password requirements
- Configure session timeouts

## Next Steps

- [User Management](/docs/help/user-management)
- [Organization Settings](/docs/help/organization-settings)`,
			priority: 9,
			featured: true,
			tags: ['setup', 'account', 'organization'],
			keywords: ['account setup', 'organization', 'profile', 'settings'],
		},
		{
			title: 'Dashboard Overview',
			slug: 'dashboard-overview',
			excerpt: 'Understand your financial dashboard and key features',
			content: `# Dashboard Overview

Your Financbase dashboard is your command center for financial management.

## Key Components

### Account Summary

View all your connected accounts in one place:
- Bank accounts
- Credit cards
- Investment accounts
- Loan accounts

### Recent Transactions

Quick access to your latest transactions with:
- Search and filter capabilities
- Category tagging
- Quick edit options

### Financial Insights

Get valuable insights:
- Spending trends
- Budget progress
- Income vs expenses
- Financial health score

### Quick Actions

Common tasks at your fingertips:
- Add transaction
- Create invoice
- Record expense
- Generate report

## Customization

### Widget Configuration

Customize your dashboard:
1. Click the settings icon
2. Choose which widgets to display
3. Arrange them to your preference
4. Save your layout

### Date Range Selection

View data for different time periods:
- Today
- This week
- This month
- This year
- Custom range

## Tips

- Use keyboard shortcuts for faster navigation
- Set up alerts for important transactions
- Export data for external analysis`,
			priority: 8,
			featured: false,
			tags: ['dashboard', 'overview', 'features'],
			keywords: ['dashboard', 'overview', 'features', 'navigation'],
		},
		{
			title: 'First Steps',
			slug: 'first-steps',
			excerpt: 'Essential first steps after creating your account',
			content: `# First Steps

After creating your Financbase account, follow these essential steps.

## Immediate Actions

### 1. Verify Your Email

Check your inbox and click the verification link to activate your account.

### 2. Complete Your Profile

Add your basic information:
- Full name
- Company name (if applicable)
- Timezone
- Currency preference

### 3. Connect Your First Account

Start by connecting your primary bank account:
1. Go to Accounts
2. Click "Add Account"
3. Follow the connection wizard
4. Verify your connection

## Week 1 Checklist

- [ ] Complete profile setup
- [ ] Connect at least one account
- [ ] Review and categorize recent transactions
- [ ] Set up your first budget
- [ ] Explore the dashboard
- [ ] Set up notifications

## Getting Help

If you need assistance:
- Browse our help center
- Contact support
- Join our community forum

## Resources

- [Quick Start Guide](/docs/help/quick-start-guide)
- [Account Setup](/docs/help/account-setup)
- [Dashboard Overview](/docs/help/dashboard-overview)`,
			priority: 7,
			featured: false,
			tags: ['first-steps', 'onboarding', 'checklist'],
			keywords: ['first steps', 'getting started', 'onboarding', 'checklist'],
		},
		{
			title: 'Understanding Your Financial Dashboard',
			slug: 'understanding-financial-dashboard',
			excerpt: 'Learn how to read and interpret your financial dashboard',
			content: `# Understanding Your Financial Dashboard

Your dashboard provides a comprehensive view of your financial health.

## Key Metrics

### Net Worth

Your total assets minus liabilities, updated in real-time.

### Cash Flow

Track money in vs money out:
- Positive cash flow: You're saving
- Negative cash flow: You're spending more than you earn

### Budget Status

See how you're tracking against your budgets:
- Green: Under budget
- Yellow: Approaching limit
- Red: Over budget

## Charts and Graphs

### Spending Trends

Visualize your spending patterns over time to identify trends.

### Category Breakdown

See where your money goes with pie charts and category analysis.

## Alerts and Notifications

Stay informed about:
- Large transactions
- Budget limits
- Bill due dates
- Account balance changes`,
			priority: 6,
			featured: false,
			tags: ['dashboard', 'metrics', 'analytics'],
			keywords: ['dashboard', 'metrics', 'analytics', 'financial health'],
		},
		{
			title: 'Connecting Your Bank Accounts',
			slug: 'connecting-bank-accounts',
			excerpt: 'Step-by-step guide to connecting your financial accounts',
			content: `# Connecting Your Bank Accounts

Securely connect your bank accounts to automatically import transactions.

## Supported Institutions

We support thousands of financial institutions including:
- Major banks
- Credit unions
- Investment brokers
- Credit card companies

## Connection Process

### Step 1: Find Your Bank

1. Go to Accounts > Add Account
2. Search for your bank
3. Select your institution

### Step 2: Authenticate

1. Enter your online banking credentials
2. Complete multi-factor authentication if required
3. Grant necessary permissions

### Step 3: Select Accounts

Choose which accounts to connect:
- Checking accounts
- Savings accounts
- Credit cards
- Investment accounts

## Security

Your credentials are encrypted and stored securely. We use bank-level encryption and never store your full credentials.

## Troubleshooting

If you have connection issues:
- Verify your credentials
- Check for bank maintenance
- Contact support if problems persist`,
			priority: 5,
			featured: false,
			tags: ['accounts', 'banking', 'connection'],
			keywords: ['bank accounts', 'connection', 'sync', 'banking'],
		},
	],
	'account-billing': [
		{
			title: 'Subscription Plans',
			slug: 'subscription-plans',
			excerpt: 'Compare features and pricing across different plans',
			content: `# Subscription Plans

Choose the plan that best fits your needs.

## Plan Comparison

### Free Plan
- Basic features
- Limited transactions
- Community support

### Professional Plan
- All basic features
- Unlimited transactions
- Priority support
- Advanced reporting

### Enterprise Plan
- Everything in Professional
- Dedicated account manager
- Custom integrations
- Phone support

## Upgrading Your Plan

1. Go to Settings > Billing
2. Click "Upgrade Plan"
3. Select your desired plan
4. Complete payment

## Billing Information

- All plans billed monthly or annually
- Annual plans save 20%
- Cancel anytime
- 30-day money-back guarantee`,
			priority: 10,
			featured: true,
			tags: ['billing', 'subscription', 'pricing'],
			keywords: ['subscription', 'pricing', 'plans', 'billing'],
		},
		{
			title: 'Billing & Invoices',
			slug: 'billing-invoices',
			excerpt: 'Manage payments, view invoices, and update payment methods',
			content: `# Billing & Invoices

Manage your subscription and billing information.

## Viewing Invoices

1. Go to Settings > Billing
2. Click "Invoices"
3. View or download any invoice

## Payment Methods

### Adding a Payment Method

1. Go to Settings > Billing
2. Click "Payment Methods"
3. Add your credit card or bank account
4. Set as default if desired

### Updating Payment Information

1. Select your payment method
2. Click "Edit"
3. Update information
4. Save changes

## Billing History

View all past transactions:
- Subscription charges
- One-time purchases
- Refunds
- Credits`,
			priority: 9,
			featured: false,
			tags: ['billing', 'invoices', 'payments'],
			keywords: ['billing', 'invoices', 'payments', 'subscription'],
		},
		{
			title: 'Update Payment Method',
			slug: 'update-payment-method',
			excerpt: 'How to change or update your payment information',
			content: `# Update Payment Method

Keep your payment information up to date.

## Steps to Update

1. Navigate to Settings > Billing
2. Click "Payment Methods"
3. Select the method to update
4. Click "Edit"
5. Enter new information
6. Save changes

## Setting Default Payment

Choose which payment method to use by default:
1. Find your payment method
2. Click "Set as Default"
3. Confirm selection

## Removing Payment Methods

To remove an old payment method:
1. Select the payment method
2. Click "Remove"
3. Confirm removal

Note: You must have at least one active payment method.`,
			priority: 8,
			featured: false,
			tags: ['billing', 'payment', 'update'],
			keywords: ['payment method', 'update', 'billing', 'credit card'],
		},
		{
			title: 'Understanding Your Bill',
			slug: 'understanding-your-bill',
			excerpt: 'Learn how to read and understand your Financbase invoices',
			content: `# Understanding Your Bill

Breakdown of your Financbase invoice.

## Invoice Components

### Subscription Fee

Your monthly or annual subscription charge based on your plan.

### Usage Charges

Additional charges for:
- Extra storage
- API calls
- Premium features

### Taxes

Applicable taxes based on your location.

## Payment Schedule

- Monthly plans: Charged on the same date each month
- Annual plans: Charged once per year
- Prorated charges: When upgrading mid-cycle`,
			priority: 7,
			featured: false,
			tags: ['billing', 'invoice', 'understanding'],
			keywords: ['invoice', 'bill', 'charges', 'billing'],
		},
	],
	'account-management': [
		{
			title: 'Profile Settings',
			slug: 'profile-settings',
			excerpt: 'Update your profile information and preferences',
			content: `# Profile Settings

Manage your personal information and account preferences.

## Personal Information

Update your details:
- Full name
- Email address
- Phone number
- Profile photo

## Preferences

Customize your experience:
- Language
- Timezone
- Date format
- Currency
- Theme (light/dark)

## Notification Settings

Control how you receive updates:
- Email notifications
- In-app notifications
- SMS alerts
- Push notifications`,
			priority: 10,
			featured: true,
			tags: ['profile', 'settings', 'preferences'],
			keywords: ['profile', 'settings', 'preferences', 'account'],
		},
		{
			title: 'User Management',
			slug: 'user-management',
			excerpt: 'Add, remove, and manage team members',
			content: `# User Management

Manage users in your organization.

## Adding Users

1. Go to Settings > Users
2. Click "Invite User"
3. Enter email address
4. Assign role
5. Send invitation

## User Roles

### Admin
Full access to all features and settings.

### Manager
Can manage users and view all data.

### User
Standard access with limited permissions.

## Managing Users

- Edit user information
- Change roles
- Deactivate accounts
- Remove users`,
			priority: 9,
			featured: false,
			tags: ['users', 'management', 'team'],
			keywords: ['users', 'team', 'management', 'roles'],
		},
		{
			title: 'Organization Settings',
			slug: 'organization-settings',
			excerpt: 'Configure organization-wide settings and preferences',
			content: `# Organization Settings

Configure settings that apply to your entire organization.

## Organization Details

- Organization name
- Legal name
- Tax ID
- Address
- Contact information

## Default Settings

Set defaults for new users:
- Timezone
- Currency
- Date format
- Language

## Security Policies

Configure organization-wide security:
- Password requirements
- Session timeouts
- Two-factor authentication
- IP restrictions`,
			priority: 8,
			featured: false,
			tags: ['organization', 'settings', 'configuration'],
			keywords: ['organization', 'settings', 'configuration', 'policies'],
		},
		{
			title: 'Notification Preferences',
			slug: 'notification-preferences',
			excerpt: 'Customize your email and in-app notifications',
			content: `# Notification Preferences

Control what notifications you receive and how.

## Notification Types

### Account Activity
- Login alerts
- Password changes
- Security updates

### Financial Updates
- Large transactions
- Budget alerts
- Bill reminders

### System Updates
- New features
- Maintenance notices
- Service updates

## Delivery Methods

Choose how to receive notifications:
- Email
- In-app
- SMS
- Push notifications`,
			priority: 7,
			featured: false,
			tags: ['notifications', 'preferences', 'alerts'],
			keywords: ['notifications', 'alerts', 'preferences', 'email'],
		},
		{
			title: 'Account Deletion',
			slug: 'account-deletion',
			excerpt: 'Learn how to delete or deactivate your account',
			content: `# Account Deletion

How to delete or deactivate your Financbase account.

## Deactivating Your Account

Temporarily disable your account:
1. Go to Settings > Account
2. Click "Deactivate Account"
3. Confirm deactivation

You can reactivate anytime by logging in.

## Deleting Your Account

Permanently delete your account:
1. Go to Settings > Account
2. Click "Delete Account"
3. Read the warning
4. Enter your password
5. Confirm deletion

## Important Notes

- Deletion is permanent and cannot be undone
- All data will be permanently deleted
- Download your data before deleting
- Cancel any active subscriptions first`,
			priority: 6,
			featured: false,
			tags: ['account', 'deletion', 'deactivate'],
			keywords: ['delete account', 'deactivate', 'remove account'],
		},
	],
	'security-privacy': [
		{
			title: 'Security Best Practices',
			slug: 'security-best-practices',
			excerpt: 'Learn how to secure your account and data',
			content: `# Security Best Practices

Protect your Financbase account with these security tips.

## Password Security

### Strong Passwords
- Use at least 12 characters
- Mix uppercase, lowercase, numbers, and symbols
- Avoid common words or personal information
- Use a unique password for Financbase

### Password Management
- Use a password manager
- Never share your password
- Change passwords regularly
- Enable password expiration

## Two-Factor Authentication

Add an extra layer of security:
1. Go to Settings > Security
2. Enable 2FA
3. Scan QR code with authenticator app
4. Enter verification code

## Account Monitoring

Regularly review:
- Login history
- Active sessions
- Recent activity
- Connected devices

## Data Protection

- Keep software updated
- Use secure networks
- Log out on shared devices
- Be cautious of phishing`,
			priority: 10,
			featured: true,
			tags: ['security', 'best-practices', 'password'],
			keywords: ['security', 'password', 'protection', 'safety'],
		},
		{
			title: 'Two-Factor Authentication',
			slug: 'two-factor-authentication',
			excerpt: 'Set up 2FA to add an extra layer of security',
			content: `# Two-Factor Authentication

Enable 2FA to protect your account from unauthorized access.

## What is 2FA?

Two-factor authentication requires:
1. Something you know (password)
2. Something you have (phone/authenticator)

## Setting Up 2FA

### Using an Authenticator App

1. Install an authenticator app (Google Authenticator, Authy)
2. Go to Settings > Security
3. Click "Enable 2FA"
4. Scan the QR code
5. Enter the verification code

### Using SMS

1. Go to Settings > Security
2. Select "SMS" as 2FA method
3. Enter your phone number
4. Verify with code sent via SMS

## Backup Codes

Save your backup codes in a safe place. They allow you to access your account if you lose your 2FA device.`,
			priority: 9,
			featured: true,
			tags: ['security', '2fa', 'authentication'],
			keywords: ['2fa', 'two-factor', 'authentication', 'security'],
		},
		{
			title: 'Privacy Policy',
			slug: 'privacy-policy',
			excerpt: 'Understand how we protect and handle your data',
			content: `# Privacy Policy

How Financbase protects and handles your data.

## Data Collection

We collect:
- Account information
- Financial data you provide
- Usage analytics
- Support communications

## Data Usage

Your data is used to:
- Provide our services
- Improve user experience
- Ensure security
- Comply with legal requirements

## Data Protection

We protect your data with:
- Bank-level encryption
- Secure data centers
- Regular security audits
- Access controls

## Your Rights

You have the right to:
- Access your data
- Correct inaccurate data
- Delete your data
- Export your data
- Opt out of marketing

## Contact

Questions about privacy? Contact us at privacy@financbase.com`,
			priority: 8,
			featured: false,
			tags: ['privacy', 'policy', 'data'],
			keywords: ['privacy', 'policy', 'data protection', 'gdpr'],
		},
		{
			title: 'Data Encryption',
			slug: 'data-encryption',
			excerpt: 'Learn about our encryption and security measures',
			content: `# Data Encryption

How we protect your financial data.

## Encryption Standards

### In Transit
- TLS 1.3 encryption
- Secure connections only
- Certificate pinning

### At Rest
- AES-256 encryption
- Encrypted database storage
- Secure key management

## Security Measures

- Regular security audits
- Penetration testing
- SOC 2 compliance
- ISO 27001 certified

## Your Role

Help protect your data:
- Use strong passwords
- Enable 2FA
- Keep software updated
- Be cautious of phishing`,
			priority: 7,
			featured: false,
			tags: ['encryption', 'security', 'data'],
			keywords: ['encryption', 'security', 'data protection', 'tls'],
		},
		{
			title: 'Managing Connected Devices',
			slug: 'managing-connected-devices',
			excerpt: 'View and manage devices that have access to your account',
			content: `# Managing Connected Devices

Monitor and control devices with access to your account.

## Viewing Devices

1. Go to Settings > Security
2. Click "Active Sessions"
3. View all connected devices

## Device Information

For each device, see:
- Device type
- Browser/App
- Location
- Last activity
- IP address

## Managing Devices

### Sign Out Remotely

Sign out from any device:
1. Find the device
2. Click "Sign Out"
3. Confirm action

### Revoke Access

Permanently revoke device access if lost or stolen.`,
			priority: 6,
			featured: false,
			tags: ['security', 'devices', 'sessions'],
			keywords: ['devices', 'sessions', 'security', 'access'],
		},
	],
	'api-integrations': [
		{
			title: 'API Overview',
			slug: 'api-overview',
			excerpt: 'Introduction to the Financbase API',
			content: `# API Overview

Integrate Financbase with your applications using our REST API.

## Getting Started

### Authentication

All API requests require authentication using API keys:
1. Go to Settings > API
2. Generate an API key
3. Include in request headers

### Base URL

All API requests go to:
\`\`\`
https://api.financbase.com/v1
\`\`\`

## Core Concepts

### Resources

Main resources include:
- Accounts
- Transactions
- Invoices
- Expenses
- Reports

### Rate Limits

- 1000 requests per hour per API key
- Rate limit headers included in responses

## Documentation

Full API documentation available at:
https://docs.financbase.com/api`,
			priority: 10,
			featured: true,
			tags: ['api', 'integration', 'overview'],
			keywords: ['api', 'integration', 'rest', 'developer'],
		},
		{
			title: 'API Authentication',
			slug: 'api-authentication',
			excerpt: 'Learn how to authenticate with our API',
			content: `# API Authentication

Secure your API requests with proper authentication.

## API Keys

### Generating Keys

1. Go to Settings > API
2. Click "Create API Key"
3. Name your key
4. Copy and store securely

### Using API Keys

Include in request headers:
\`\`\`
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Key Management

### Best Practices
- Rotate keys regularly
- Use different keys for different environments
- Never commit keys to version control
- Revoke unused keys

### Key Permissions

Control what each key can do:
- Read-only
- Read-write
- Admin access`,
			priority: 9,
			featured: false,
			tags: ['api', 'authentication', 'security'],
			keywords: ['api', 'authentication', 'api keys', 'security'],
		},
		{
			title: 'Webhooks Guide',
			slug: 'webhooks-guide',
			excerpt: 'Set up and configure webhooks for real-time updates',
			content: `# Webhooks Guide

Receive real-time updates via webhooks.

## What are Webhooks?

Webhooks send HTTP POST requests to your server when events occur in Financbase.

## Setting Up Webhooks

1. Go to Settings > Integrations > Webhooks
2. Click "Create Webhook"
3. Enter your endpoint URL
4. Select events to subscribe to
5. Save configuration

## Supported Events

- transaction.created
- transaction.updated
- invoice.paid
- invoice.overdue
- account.connected
- account.disconnected

## Webhook Security

Verify webhook authenticity:
- Check webhook signature
- Validate request source
- Use HTTPS endpoints

## Testing

Test your webhook endpoint using our webhook testing tool.`,
			priority: 8,
			featured: false,
			tags: ['webhooks', 'api', 'integration'],
			keywords: ['webhooks', 'api', 'events', 'integration'],
		},
		{
			title: 'Integration Setup',
			slug: 'integration-setup',
			excerpt: 'Connect with QuickBooks, Stripe, and other services',
			content: `# Integration Setup

Connect Financbase with popular business tools.

## Available Integrations

### Accounting
- QuickBooks
- Xero
- Sage

### Payment Processing
- Stripe
- PayPal
- Square

### E-commerce
- Shopify
- WooCommerce
- BigCommerce

## Setup Process

1. Go to Settings > Integrations
2. Find your service
3. Click "Connect"
4. Authorize access
5. Configure sync settings

## Data Sync

Choose what to sync:
- Transactions
- Invoices
- Customers
- Products

## Troubleshooting

Common issues:
- Connection timeouts
- Authentication errors
- Sync delays

Contact support if problems persist.`,
			priority: 7,
			featured: false,
			tags: ['integrations', 'setup', 'connections'],
			keywords: ['integrations', 'quickbooks', 'stripe', 'setup'],
		},
	],
	'troubleshooting': [
		{
			title: 'Common Issues',
			slug: 'common-issues',
			excerpt: 'Solutions for frequently encountered problems',
			content: `# Common Issues

Solutions to frequently asked questions and common problems.

## Account Access

### Can't Log In
- Reset your password
- Check email for verification
- Clear browser cache
- Try incognito mode

### Forgot Password
1. Click "Forgot Password"
2. Enter your email
3. Check inbox for reset link
4. Create new password

## Data Issues

### Missing Transactions
- Check account connection status
- Manually refresh accounts
- Verify account permissions
- Contact support if needed

### Incorrect Balances
- Reconcile accounts
- Check for pending transactions
- Verify account connections
- Review transaction history

## Performance

### Slow Loading
- Check internet connection
- Clear browser cache
- Try different browser
- Disable browser extensions

## Still Need Help?

Contact our support team for assistance.`,
			priority: 10,
			featured: true,
			tags: ['troubleshooting', 'common-issues', 'help'],
			keywords: ['troubleshooting', 'issues', 'problems', 'help'],
		},
		{
			title: 'Payment Issues',
			slug: 'payment-issues',
			excerpt: 'Troubleshoot payment and billing problems',
			content: `# Payment Issues

Resolve payment and billing problems.

## Payment Declined

### Common Causes
- Insufficient funds
- Expired card
- Incorrect billing address
- Bank security block

### Solutions
- Verify card information
- Check account balance
- Contact your bank
- Try different payment method

## Billing Questions

### Unauthorized Charges
- Review invoice details
- Check subscription status
- Contact billing support
- Dispute if necessary

### Refund Requests
- Go to Settings > Billing
- Click "Request Refund"
- Provide reason
- Wait for processing

## Subscription Issues

### Can't Cancel
1. Go to Settings > Billing
2. Click "Cancel Subscription"
3. Confirm cancellation
4. Verify cancellation email

### Wrong Plan Charged
- Check plan selection
- Review upgrade history
- Contact support for adjustment`,
			priority: 9,
			featured: false,
			tags: ['payment', 'billing', 'troubleshooting'],
			keywords: ['payment', 'billing', 'issues', 'troubleshooting'],
		},
		{
			title: 'Import Errors',
			slug: 'import-errors',
			excerpt: 'Fix data import and synchronization errors',
			content: `# Import Errors

Resolve issues with data imports and synchronization.

## Connection Errors

### Bank Connection Failed
- Verify credentials
- Check bank status
- Try reconnecting
- Contact bank support

### Sync Delays
- Wait a few minutes
- Manually refresh
- Check account status
- Verify permissions

## Data Import Issues

### CSV Import Errors
- Check file format
- Verify column headers
- Review data types
- Check for duplicates

### Missing Data
- Verify import settings
- Check file completeness
- Review error logs
- Re-import if needed

## Resolving Conflicts

When data conflicts occur:
- Review conflicting items
- Choose correct version
- Merge if appropriate
- Delete duplicates`,
			priority: 8,
			featured: false,
			tags: ['import', 'sync', 'errors'],
			keywords: ['import', 'sync', 'errors', 'troubleshooting'],
		},
		{
			title: 'Performance Issues',
			slug: 'performance-issues',
			excerpt: 'Optimize performance and resolve slowdowns',
			content: `# Performance Issues

Improve Financbase performance and resolve slowdowns.

## Browser Performance

### Optimize Browser
- Update to latest version
- Clear cache and cookies
- Disable extensions
- Close unused tabs

### Network Issues
- Check internet speed
- Use wired connection
- Close bandwidth-heavy apps
- Try different network

## Data Optimization

### Large Datasets
- Filter date ranges
- Use search instead of scrolling
- Export old data
- Archive completed items

### Account Limits
- Limit connected accounts
- Remove unused accounts
- Consolidate similar accounts

## System Requirements

Ensure your system meets:
- Modern browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Stable internet connection
- Sufficient RAM`,
			priority: 7,
			featured: false,
			tags: ['performance', 'optimization', 'speed'],
			keywords: ['performance', 'slow', 'optimization', 'speed'],
		},
	],
};

// Seed categories
async function seedCategories() {
	console.log('📁 Seeding help categories...');
	
	const categoryMap: Record<string, number> = {};
	
	for (const category of categoryData) {
		try {
			// Check if category exists
			const existing = await sql`
				SELECT id FROM financbase.financbase_help_categories 
				WHERE slug = ${category.slug} 
				LIMIT 1
			`;
			
			if (existing.length > 0) {
				categoryMap[category.slug] = existing[0].id;
				console.log(`✅ Category already exists: ${category.name}`);
				continue;
			}
			
			// Insert category
			const result = await sql`
				INSERT INTO financbase.financbase_help_categories (
					name, slug, description, icon, color, sort_order, 
					is_active, is_public, article_count, view_count,
					created_at, updated_at
				) VALUES (
					${category.name}, ${category.slug}, ${category.description}, 
					${category.icon}, ${category.color}, ${category.sortOrder},
					true, true, 0, 0,
					NOW(), NOW()
				)
				RETURNING id
			`;
			
			if (result.length > 0 && result[0]) {
				categoryMap[category.slug] = result[0].id;
				console.log(`✅ Created category: ${category.name}`);
			}
		} catch (error: any) {
			console.error(`❌ Error creating category ${category.name}:`, error.message);
		}
	}
	
	return categoryMap;
}

// Seed articles
async function seedArticles(authorId: string, categoryMap: Record<string, number>) {
	console.log('\n📝 Seeding help articles...');
	
	let totalCreated = 0;
	let totalSkipped = 0;
	
	for (const [categorySlug, articles] of Object.entries(articleData)) {
		const categoryId = categoryMap[categorySlug];
		
		if (!categoryId) {
			console.warn(`⚠️  Category not found: ${categorySlug}, skipping articles`);
			continue;
		}
		
		console.log(`\n📂 Category: ${categorySlug}`);
		
		for (const article of articles) {
			try {
				// Check if article exists
				const existing = await sql`
					SELECT id FROM financbase.financbase_help_articles 
					WHERE slug = ${article.slug} 
					LIMIT 1
				`;
				
				if (existing.length > 0) {
					console.log(`  ⏭️  Skipped (exists): ${article.title}`);
					totalSkipped++;
					continue;
				}
				
				// Insert article
				const result = await sql`
					INSERT INTO financbase.financbase_help_articles (
						title, slug, content, excerpt, category_id, author_id,
						status, priority, featured, tags, keywords,
						table_of_contents, attachments, version, is_latest,
						view_count, helpful_count, not_helpful_count,
						published_at, created_at, updated_at
					) VALUES (
						${article.title}, ${article.slug}, ${article.content}, 
						${article.excerpt}, ${categoryId}, ${authorId},
						'published', ${article.priority}, ${article.featured},
						${JSON.stringify(article.tags)}::jsonb, 
						${JSON.stringify(article.keywords)}::jsonb,
						'[]'::jsonb, '[]'::jsonb, '1.0.0', true,
						0, 0, 0,
						NOW(), NOW(), NOW()
					)
					RETURNING id, title
				`;
				
				if (result.length > 0 && result[0]) {
					console.log(`  ✅ Created: ${article.title}`);
					totalCreated++;
				}
			} catch (error: any) {
				console.error(`  ❌ Error creating article ${article.title}:`, error.message);
			}
		}
		
		// Update category article count
		const articleCount = await sql`
			SELECT COUNT(*) as count 
			FROM financbase.financbase_help_articles 
			WHERE category_id = ${categoryId} 
			AND status = 'published'
			AND is_latest = true
		`;
		
		if (articleCount.length > 0) {
			await sql`
				UPDATE financbase.financbase_help_categories 
				SET article_count = ${parseInt(articleCount[0].count as string)}
				WHERE id = ${categoryId}
			`;
		}
	}
	
	return { totalCreated, totalSkipped };
}

// Create tables if they don't exist
async function createTablesIfNotExist() {
	console.log('🔧 Checking/Creating tables...\n');
	
	try {
		// Create help_categories table
		await sql`
			CREATE TABLE IF NOT EXISTS financbase.financbase_help_categories (
				id SERIAL PRIMARY KEY,
				name TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				description TEXT,
				icon TEXT,
				color TEXT DEFAULT '#3B82F6',
				parent_id INTEGER,
				sort_order INTEGER DEFAULT 0 NOT NULL,
				is_active BOOLEAN DEFAULT true NOT NULL,
				is_public BOOLEAN DEFAULT true NOT NULL,
				article_count INTEGER DEFAULT 0 NOT NULL,
				view_count INTEGER DEFAULT 0 NOT NULL,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
			)
		`;
		console.log('✅ Help categories table ready');
		
		// Create help_articles table
		await sql`
			CREATE TABLE IF NOT EXISTS financbase.financbase_help_articles (
				id SERIAL PRIMARY KEY,
				title TEXT NOT NULL,
				slug TEXT NOT NULL UNIQUE,
				content TEXT NOT NULL,
				excerpt TEXT,
				category_id INTEGER NOT NULL,
				author_id TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'draft',
				priority INTEGER DEFAULT 0 NOT NULL,
				featured BOOLEAN DEFAULT false NOT NULL,
				meta_title TEXT,
				meta_description TEXT,
				tags JSONB DEFAULT '[]'::jsonb NOT NULL,
				keywords JSONB DEFAULT '[]'::jsonb NOT NULL,
				table_of_contents JSONB DEFAULT '[]'::jsonb NOT NULL,
				attachments JSONB DEFAULT '[]'::jsonb NOT NULL,
				version TEXT DEFAULT '1.0.0' NOT NULL,
				parent_id INTEGER,
				is_latest BOOLEAN DEFAULT true NOT NULL,
				view_count INTEGER DEFAULT 0 NOT NULL,
				helpful_count INTEGER DEFAULT 0 NOT NULL,
				not_helpful_count INTEGER DEFAULT 0 NOT NULL,
				last_viewed_at TIMESTAMP WITH TIME ZONE,
				published_at TIMESTAMP WITH TIME ZONE,
				created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
				FOREIGN KEY (category_id) REFERENCES financbase.financbase_help_categories(id) ON DELETE CASCADE
			)
		`;
		console.log('✅ Help articles table ready\n');
	} catch (error: any) {
		console.error('❌ Error creating tables:', error.message);
		throw error;
	}
}

// Main seeding function
async function seedHelpArticles() {
	try {
		console.log('🚀 Starting help articles seeding...\n');
		
		// Set search path
		await sql`SET search_path TO financbase, public`;
		
		// Create tables if they don't exist
		await createTablesIfNotExist();
		
		// Get author ID
		const authorId = await getDefaultAuthorId();
		console.log(`👤 Using author ID: ${authorId}\n`);
		
		// Seed categories
		const categoryMap = await seedCategories();
		
		// Seed articles
		const { totalCreated, totalSkipped } = await seedArticles(authorId, categoryMap);
		
		console.log('\n' + '='.repeat(60));
		console.log('🎉 Help articles seeding completed!');
		console.log(`✅ Created: ${totalCreated} articles`);
		console.log(`⏭️  Skipped: ${totalSkipped} articles (already exist)`);
		console.log('='.repeat(60));
		
		process.exit(0);
	} catch (error: any) {
		console.error('\n❌ Error seeding help articles:', error.message);
		console.error(error.stack);
		process.exit(1);
	}
}

// Run if called directly
if (require.main === module) {
	seedHelpArticles();
}

export { seedHelpArticles };

