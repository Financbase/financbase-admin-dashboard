import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { searchService } from '@/lib/services/content/search-service';
import type { SearchFilters } from '@/lib/services/content/search-service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/search/content
 * Search content using the database search service
 */
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const entityTypes = searchParams.get('entityTypes')?.split(',') || undefined;
		const categories = searchParams.get('categories')?.split(',') || undefined;
		const tags = searchParams.get('tags')?.split(',') || undefined;
		const dateFrom = searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined;
		const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
		const limit = parseInt(searchParams.get('limit') || '50', 10);
		const offset = parseInt(searchParams.get('offset') || '0', 10);

		if (!query.trim()) {
			return NextResponse.json({
				success: true,
				data: {
					results: [],
					total: 0,
					query: '',
					filters: {},
				},
			});
		}

		const filters: SearchFilters = {
			entityTypes,
			categories,
			tags,
			dateFrom,
			dateTo,
			limit,
			offset,
		};

		const result = await searchService.search(query, filters);

		// Log the search query for analytics
		await searchService.logSearchQuery(
			query,
			userId,
			entityTypes,
			result.total
		);

		return NextResponse.json({
			success: true,
			data: result,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/search/content/suggestions
 * Get search suggestions/autocomplete
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const partialQuery = body.query || '';
		const limit = body.limit || 10;

		if (!partialQuery.trim()) {
			return NextResponse.json({
				success: true,
				data: [],
			});
		}

		const suggestions = await searchService.getSuggestions(partialQuery, limit);

		return NextResponse.json({
			success: true,
			data: suggestions,
		});
	} catch (error) {
		console.error('Search Suggestions API Error:', error);
		return NextResponse.json(
			{
				error: 'Failed to get suggestions',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

