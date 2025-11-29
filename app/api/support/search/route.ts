/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDbOrThrow } from '@/lib/db';
import { helpArticles, helpCategories } from '@/lib/db/schemas/documentation.schema';
import { eq, and, or, like, desc } from 'drizzle-orm';
import { SecurityService } from '@/lib/security/arcjet-service';
import { logger } from '@/lib/logger';

export interface PublicSearchResult {
	type: 'article';
	title: string;
	excerpt: string;
	href: string;
	category: string;
}

export async function GET(request: NextRequest) {
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/support/search'
		);

		if (securityCheck.denied) {
			return NextResponse.json(
				{
					error: 'Request denied for security reasons',
					details: securityCheck.reasons,
				},
				{
					status: securityCheck.status || 403,
					headers: {
						'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
							? String(securityCheck.rateLimitRemaining)
							: '0',
					},
				}
			);
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const limit = parseInt(searchParams.get('limit') || '10', 10);

		// Validate query
		if (!query.trim() || query.length < 2) {
			return NextResponse.json(
				{
					results: [],
				},
				{
					status: 200,
					headers: {
						'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
							? String(securityCheck.rateLimitRemaining)
							: '0',
					},
				}
			);
		}

		// Sanitize query - remove potentially harmful characters
		const sanitizedQuery = query.trim().slice(0, 100);
		const searchTerm = `%${sanitizedQuery}%`;

		// Search published articles from database
		const db = getDbOrThrow();

		const articles = await db
			.select({
				id: helpArticles.id,
				title: helpArticles.title,
				slug: helpArticles.slug,
				excerpt: helpArticles.excerpt,
				category: {
					name: helpCategories.name,
					slug: helpCategories.slug,
				},
			})
			.from(helpArticles)
			.innerJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
			.where(
				and(
					eq(helpArticles.status, 'published'),
					eq(helpArticles.isLatest, true),
					or(
						like(helpArticles.title, searchTerm),
						like(helpArticles.excerpt, searchTerm),
						like(helpArticles.content, searchTerm)
					)
				)
			)
			.orderBy(desc(helpArticles.featured), desc(helpArticles.priority))
			.limit(limit);

		// Format results
		const results: PublicSearchResult[] = articles.map((article) => ({
			type: 'article' as const,
			title: article.title,
			excerpt: article.excerpt || article.title,
			href: `/docs/help/${article.slug}`,
			category: article.category.name,
		}));

		return NextResponse.json(
			{
				results,
			},
			{
				status: 200,
				headers: {
					'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
						? String(securityCheck.rateLimitRemaining)
						: '0',
				},
			}
		);
	} catch (error) {
		logger.error('Support search error:', error);

		// Don't expose internal errors to client
		return NextResponse.json(
			{
				error: 'Failed to perform search. Please try again later.',
				results: [],
			},
			{ status: 500 }
		);
	}
}

