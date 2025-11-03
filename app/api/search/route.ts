import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AlgoliaSearchService, SEARCH_INDICES } from '@/lib/search/algolia-service';

/**
 * GET /api/search
 * Universal search across all indices
 */
export async function GET(request: NextRequest) {
	const startTime = Date.now();
	
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const index = searchParams.get('index') || 'all';
		const page = parseInt(searchParams.get('page') || '0', 10);
		const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '20', 10);

		// Validate pagination
		if (page < 0) {
			return NextResponse.json(
				{ error: 'Invalid page number. Must be >= 0' },
				{ status: 400 }
			);
		}

		if (hitsPerPage < 1 || hitsPerPage > 100) {
			return NextResponse.json(
				{ error: 'Invalid hitsPerPage. Must be between 1 and 100' },
				{ status: 400 }
			);
		}

		if (!query.trim()) {
			return NextResponse.json({
				success: true,
				data: {
					hits: [],
					nbHits: 0,
					page: 0,
					nbPages: 0,
					hitsPerPage,
					processingTimeMS: 0,
					query: '',
					params: '',
				},
			});
		}

		// Add timeout wrapper for entire search operation
		const searchPromise = (async () => {
			const searchService = new AlgoliaSearchService();

			let results: unknown[];
			if (index === 'all') {
				results = await searchService.searchAll(query, { page, hitsPerPage });
			} else {
				results = [await searchService.search(index, query, { page, hitsPerPage })];
			}

			return results;
		})();

		// Race against timeout (15 seconds max)
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error('Search operation timed out')), 15000)
		);

		const results = await Promise.race([searchPromise, timeoutPromise]);

		const duration = Date.now() - startTime;

		return NextResponse.json({
			success: true,
			data: results,
			metadata: {
				duration: duration,
			},
		});

	} catch (error) {
		const duration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		const errorDetails = error instanceof Error ? {
			name: error.name,
			message: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
		} : {};

		console.error('Search API Error:', {
			error: errorMessage,
			duration,
			details: errorDetails,
		});

		// Return appropriate status codes based on error type
		const statusCode = errorMessage.includes('configuration') || errorMessage.includes('required')
			? 503 // Service Unavailable
			: errorMessage.includes('timeout')
			? 504 // Gateway Timeout
			: 500; // Internal Server Error

		return NextResponse.json(
			{
				error: 'Failed to perform search',
				message: process.env.NODE_ENV === 'development' ? errorMessage : 'Search service is currently unavailable',
				duration,
			},
			{ status: statusCode }
		);
	}
}

/**
 * GET /api/search/suggestions
 * Get search suggestions/autocomplete
 */
export async function PATCH(request: NextRequest) {
	const startTime = Date.now();

	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const index = searchParams.get('index') || SEARCH_INDICES.PRODUCTS;

		if (!query.trim()) {
			return NextResponse.json({
				success: true,
				data: [],
			});
		}

		// Add timeout wrapper for suggestions
		const suggestionsPromise = (async () => {
			const searchService = new AlgoliaSearchService();
			return await searchService.getSuggestions(query, index);
		})();

		// Race against timeout (5 seconds max for suggestions)
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error('Suggestions operation timed out')), 5000)
		);

		const suggestions = await Promise.race([suggestionsPromise, timeoutPromise]);
		const duration = Date.now() - startTime;

		return NextResponse.json({
			success: true,
			data: suggestions,
			metadata: {
				duration,
			},
		});

	} catch (error) {
		const duration = Date.now() - startTime;
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';

		console.error('Suggestions API Error:', {
			error: errorMessage,
			duration,
			query: request.nextUrl.searchParams.get('q'),
		});

		// Return appropriate status codes based on error type
		const statusCode = errorMessage.includes('configuration') || errorMessage.includes('required')
			? 503 // Service Unavailable
			: errorMessage.includes('timeout')
			? 504 // Gateway Timeout
			: 500; // Internal Server Error

		return NextResponse.json(
			{
				error: 'Failed to get suggestions',
				message: process.env.NODE_ENV === 'development' ? errorMessage : 'Suggestions service is currently unavailable',
				duration,
			},
			{ status: statusCode }
		);
	}
}
