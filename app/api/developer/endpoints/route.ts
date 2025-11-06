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
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface APIEndpoint {
	id: string;
	name: string;
	description: string;
	method: string;
	path: string;
	category: string;
	status: 'active' | 'deprecated' | 'beta';
	version?: string;
	rateLimit?: string;
	documentation?: string;
}

// Predefined endpoint metadata for common routes
const ENDPOINT_METADATA: Record<string, Partial<APIEndpoint>> = {
	'/api/analytics': {
		name: 'Get Analytics',
		description: 'Retrieve comprehensive financial analytics and overview metrics',
		category: 'Analytics',
		method: 'GET',
	},
	'/api/dashboard/top-products': {
		name: 'Get Top Products',
		description: 'Retrieve top revenue generating services/products',
		category: 'Dashboard',
		method: 'GET',
	},
	'/api/dashboard/ai-insights': {
		name: 'Get AI Insights',
		description: 'Retrieve AI-powered financial insights and recommendations',
		category: 'AI',
		method: 'GET',
	},
	'/api/invoices': {
		name: 'Invoices',
		description: 'Manage invoices - create, read, update, delete',
		category: 'Financial',
		method: 'GET,POST',
	},
	'/api/expenses': {
		name: 'Expenses',
		description: 'Manage expenses - track and categorize business expenses',
		category: 'Financial',
		method: 'GET,POST',
	},
	'/api/transactions': {
		name: 'Transactions',
		description: 'Manage financial transactions - income and expenses',
		category: 'Financial',
		method: 'GET,POST',
	},
	'/api/clients': {
		name: 'Clients',
		description: 'Manage client relationships and information',
		category: 'Clients',
		method: 'GET,POST',
	},
	'/api/webhooks': {
		name: 'Webhooks',
		description: 'Manage webhook endpoints and subscriptions',
		category: 'Integrations',
		method: 'GET,POST',
	},
	'/api/search': {
		name: 'Search',
		description: 'Search across invoices, transactions, clients, and pages',
		category: 'General',
		method: 'GET',
	},
};

/**
 * Recursively scan API routes directory
 */
async function scanAPIRoutes(
	dir: string,
	basePath: string = '/api'
): Promise<APIEndpoint[]> {
	const endpoints: APIEndpoint[] = [];
	
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		
		for (const entry of entries) {
			const fullPath = join(dir, entry.name);
			const routePath = `${basePath}/${entry.name}`;
			
			if (entry.isDirectory()) {
				// Recursively scan subdirectories
				const subEndpoints = await scanAPIRoutes(fullPath, routePath);
				endpoints.push(...subEndpoints);
			} else if (entry.name === 'route.ts' || entry.name === 'route.js') {
				// Found a route file
				try {
					const fileContent = await readFile(fullPath, 'utf-8');
					
					// Extract HTTP methods from the file
					const methods: string[] = [];
					if (fileContent.includes('export async function GET')) methods.push('GET');
					if (fileContent.includes('export async function POST')) methods.push('POST');
					if (fileContent.includes('export async function PUT')) methods.push('PUT');
					if (fileContent.includes('export async function PATCH')) methods.push('PATCH');
					if (fileContent.includes('export async function DELETE')) methods.push('DELETE');
					
					// Get metadata if available
					const metadata = ENDPOINT_METADATA[basePath] || {};
					
					// Extract JSDoc description if available
					let description = metadata.description || 'API endpoint';
					const jsdocMatch = fileContent.match(/\/\*\*[\s\S]*?\*\/([\s\S]*?)(?:export|function)/);
					if (jsdocMatch) {
						const descMatch = jsdocMatch[0].match(/(?:description|Description|DESCRIPTION)[:\s]*([^\n*]+)/i);
						if (descMatch) {
							description = descMatch[1].trim();
						}
					}
					
					// Create endpoint entries for each method
					const methodsToUse = methods.length > 0 ? methods : ['GET'];
					
					for (const method of methodsToUse) {
						const endpoint: APIEndpoint = {
							id: `${basePath}-${method}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
							name: metadata.name || `${method} ${basePath}`,
							description,
							method,
							path: basePath,
							category: metadata.category || 'General',
							status: 'active',
							version: metadata.version || 'v1.0.0',
							rateLimit: metadata.rateLimit || '1000/hour',
							documentation: metadata.documentation || `/docs${basePath}`,
						};
						endpoints.push(endpoint);
					}
				} catch (error) {
					console.error(`Error reading route file ${fullPath}:`, error);
				}
			}
		}
	} catch (error) {
		console.error(`Error scanning directory ${dir}:`, error);
	}
	
	return endpoints;
}

export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get the app/api directory path
		const apiDir = join(process.cwd(), 'app', 'api');
		
		// Scan API routes
		const endpoints = await scanAPIRoutes(apiDir);
		
		// Sort by category and path
		endpoints.sort((a, b) => {
			if (a.category !== b.category) {
				return a.category.localeCompare(b.category);
			}
			return a.path.localeCompare(b.path);
		});

		// Calculate stats
		const stats = {
			totalEndpoints: endpoints.length,
			activeEndpoints: endpoints.filter(ep => ep.status === 'active').length,
			uptime: 99.9, // This would come from monitoring in production
			averageResponseTime: 245, // This would come from metrics in production
			totalRequests: 2100000, // This would come from analytics in production
			successRate: 99.8, // This would come from metrics in production
		};

		return NextResponse.json({
			endpoints,
			stats,
		});
	} catch (error) {
		console.error('Error scanning API endpoints:', error);
		return ApiErrorHandler.handle(error, requestId);
	}
}

