/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search across the platform
 *     description: Performs a unified search across invoices, transactions, clients, pages, and reports
 *     tags:
 *       - Analytics
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [page, transaction, invoice, client, report, setting]
 *         description: Filter results by type
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   type:
 *                     type: string
 *                     enum: [page, transaction, invoice, client, report, setting]
 *                   href:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   metadata:
 *                     type: object
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
export interface SearchResult {
	id: string;
	title: string;
	description: string;
	type: 'page' | 'transaction' | 'invoice' | 'client' | 'report' | 'setting';
	href: string;
	icon?: string;
	metadata?: Record<string, any>;
}

// Static page routes
const PAGE_ROUTES: SearchResult[] = [
	{
		id: 'dashboard',
		title: 'Dashboard',
		description: 'Overview of your financial data',
		type: 'page',
		href: '/dashboard',
		icon: 'LayoutDashboard',
	},
	{
		id: 'transactions',
		title: 'Transactions',
		description: 'Manage income and expenses',
		type: 'page',
		href: '/transactions',
		icon: 'CreditCard',
	},
	{
		id: 'analytics',
		title: 'Analytics',
		description: 'Advanced reporting and insights',
		type: 'page',
		href: '/analytics',
		icon: 'BarChart3',
	},
	{
		id: 'invoices',
		title: 'Invoices',
		description: 'Create and track invoices',
		type: 'page',
		href: '/invoices',
		icon: 'Receipt',
	},
	{
		id: 'reports',
		title: 'Reports',
		description: 'Financial reports and statements',
		type: 'page',
		href: '/reports',
		icon: 'FileText',
	},
	{
		id: 'clients',
		title: 'Clients',
		description: 'Manage your client relationships',
		type: 'page',
		href: '/clients',
		icon: 'Users',
	},
	{
		id: 'settings',
		title: 'Settings',
		description: 'Configure your account settings',
		type: 'page',
		href: '/settings',
		icon: 'Settings',
	},
];

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const maxResults = parseInt(searchParams.get('limit') || '10');

		if (!query || query.length < 2) {
			return NextResponse.json({ results: [] });
		}

		const searchQuery = query.toLowerCase();
		const results: SearchResult[] = [];

		// Search static pages
		const pageResults = PAGE_ROUTES.filter(
			(page) =>
				page.title.toLowerCase().includes(searchQuery) ||
				page.description.toLowerCase().includes(searchQuery)
		).slice(0, 3);

		results.push(...pageResults);

		// Search transactions
		try {
			const transactionResults = await db.execute(sql`
				SELECT 
					id::text as id,
					transaction_number as title,
					description,
					amount::text as amount,
					type,
					status,
					transaction_date
				FROM transactions
				WHERE user_id::text = ${userId}
					AND (
						LOWER(transaction_number) LIKE ${'%' + searchQuery + '%'}
						OR LOWER(description) LIKE ${'%' + searchQuery + '%'}
					)
				ORDER BY transaction_date DESC
				LIMIT 5
			`);

			for (const row of transactionResults.rows as any[]) {
				results.push({
					id: `txn-${row.id}`,
					title: row.title || row.description || 'Transaction',
					description: `$${Number(row.amount || 0).toFixed(2)} - ${row.type || 'transaction'}`,
					type: 'transaction' as const,
					href: `/transactions/${row.id}`,
					metadata: {
						amount: Number(row.amount || 0),
						type: row.type,
						status: row.status,
						date: row.transaction_date,
					},
				});
			}
		} catch (error) {
			logger.error('Error searching transactions:', error);
		}

		// Search invoices
		try {
			const invoiceResults = await db.execute(sql`
				SELECT 
					id,
					invoice_number as title,
					client_name,
					total::text as total,
					status,
					due_date
				FROM financbase_invoices
				WHERE user_id = ${userId}
					AND (
						LOWER(invoice_number) LIKE ${'%' + searchQuery + '%'}
						OR LOWER(client_name) LIKE ${'%' + searchQuery + '%'}
					)
				ORDER BY issue_date DESC
				LIMIT 5
			`);

			for (const row of invoiceResults.rows as any[]) {
				results.push({
					id: `inv-${row.id}`,
					title: `Invoice ${row.title}`,
					description: `${row.client_name} - $${Number(row.total || 0).toFixed(2)} - ${row.status || 'pending'}`,
					type: 'invoice' as const,
					href: `/invoices/${row.id}`,
					metadata: {
						amount: Number(row.total || 0),
						status: row.status,
						dueDate: row.due_date,
					},
				});
			}
		} catch (error) {
			logger.error('Error searching invoices:', error);
		}

		// Search clients
		try {
			const clientResults = await db.execute(sql`
				SELECT 
					id,
					name as title,
					email,
					company,
					status
				FROM financbase_clients
				WHERE user_id = ${userId}
					AND (
						LOWER(name) LIKE ${'%' + searchQuery + '%'}
						OR LOWER(email) LIKE ${'%' + searchQuery + '%'}
						OR LOWER(company) LIKE ${'%' + searchQuery + '%'}
					)
				ORDER BY created_at DESC
				LIMIT 5
			`);

			for (const row of clientResults.rows as any[]) {
				results.push({
					id: `client-${row.id}`,
					title: row.title || row.company || 'Client',
					description: `${row.company ? `${row.company} - ` : ''}${row.email || ''} - ${row.status || 'active'}`,
					type: 'client' as const,
					href: `/clients/${row.id}`,
					metadata: {
						email: row.email,
						company: row.company,
						status: row.status,
					},
				});
			}
		} catch (error) {
			logger.error('Error searching clients:', error);
		}

		// Sort results by relevance (exact matches first, then partial matches)
		results.sort((a, b) => {
			const aExact = a.title.toLowerCase() === searchQuery ? 1 : 0;
			const bExact = b.title.toLowerCase() === searchQuery ? 1 : 0;
			if (aExact !== bExact) return bExact - aExact;

			const aStarts = a.title.toLowerCase().startsWith(searchQuery) ? 1 : 0;
			const bStarts = b.title.toLowerCase().startsWith(searchQuery) ? 1 : 0;
			if (aStarts !== bStarts) return bStarts - aStarts;

			return 0;
		});

		// Limit results
		const limitedResults = results.slice(0, maxResults);

		return NextResponse.json({ results: limitedResults });
	} catch (error) {
		logger.error('Search API error:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}
