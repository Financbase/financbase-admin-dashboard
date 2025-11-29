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
import { eq, and, desc } from 'drizzle-orm';
import { SecurityService } from '@/lib/security/arcjet-service';
import { logger } from '@/lib/logger';

export async function GET(
	request: NextRequest,
	{ params }: { params: { slug: string } }
) {
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/support/category/[slug]'
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
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

		// Normalize the slug to handle URL encoding and formatting variations
		const normalizedSlug = decodeURIComponent(params.slug)
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/&/g, '')
			.replace(/&amp;/g, '')
			.replace(/[^\w-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '');

		// Map support page category slugs to database category slugs
		const categorySlugMap: Record<string, string> = {
			'getting-started': 'getting-started',
			'billing-payments': 'account-billing',
			'account-management': 'account-management',
			'security-privacy': 'security-privacy',
			'api-integrations': 'api-integrations',
			'troubleshooting': 'troubleshooting',
		};

		const dbCategorySlug = categorySlugMap[normalizedSlug] || normalizedSlug;

		// Get articles from database
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
					eq(helpCategories.slug, dbCategorySlug),
					eq(helpArticles.status, 'published'),
					eq(helpArticles.isLatest, true)
				)
			)
			.orderBy(desc(helpArticles.featured), desc(helpArticles.priority), desc(helpArticles.publishedAt))
			.limit(limit)
			.offset(offset);

		// Get total count for pagination
		const totalResult = await db
			.select({ count: helpArticles.id })
			.from(helpArticles)
			.innerJoin(helpCategories, eq(helpArticles.categoryId, helpCategories.id))
			.where(
				and(
					eq(helpCategories.slug, dbCategorySlug),
					eq(helpArticles.status, 'published'),
					eq(helpArticles.isLatest, true)
				)
			);

		const total = totalResult.length;

		// Format results
		const results = articles.map((article) => ({
			title: article.title,
			description: article.excerpt || article.title,
			href: `/docs/help/${article.slug}`,
			category: article.category.name,
		}));

		return NextResponse.json(
			{
				articles: results,
				total,
				limit,
				offset,
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
		logger.error('Support category articles error:', error);

		// Don't expose internal errors to client
		return NextResponse.json(
			{
				error: 'Failed to fetch articles. Please try again later.',
				articles: [],
				total: 0,
			},
			{ status: 500 }
		);
	}
}

