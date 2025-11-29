/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { GuidesService, GuideFilters } from '@/lib/services/guides-service';
import { SecurityService } from '@/lib/security/arcjet-service';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/guides'
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

		// Parse query parameters
		const category = searchParams.get('category') || undefined;
		const type = searchParams.get('type') as 'tutorial' | 'guide' | 'documentation' | undefined;
		const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined;
		const featured = searchParams.get('featured') === 'true' ? true : searchParams.get('featured') === 'false' ? false : undefined;
		const search = searchParams.get('search') || undefined;
		const sort = searchParams.get('sort') as 'popular' | 'recent' | 'rating' | 'difficulty' | undefined;
		const limit = parseInt(searchParams.get('limit') || '20', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

		// Build filters
		const filters: GuideFilters = {
			category,
			type,
			difficulty,
			featured,
			search,
			sort: sort || 'popular',
			limit: Math.min(limit, 100), // Cap at 100
			offset: Math.max(offset, 0),
		};

		// Get guides
		const result = await GuidesService.getGuides(filters);

		return NextResponse.json(
			{
				success: true,
				data: {
					guides: result.guides,
					pagination: {
						total: result.total,
						limit: filters.limit,
						offset: filters.offset,
						hasMore: result.total > (filters.offset || 0) + (filters.limit || 20),
					},
				},
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
		logger.error('Guides API error:', error);

		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch guides. Please try again later.',
				data: {
					guides: [],
					pagination: {
						total: 0,
						limit: 20,
						offset: 0,
						hasMore: false,
					},
				},
			},
			{ status: 500 }
		);
	}
}

