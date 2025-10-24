import { NextRequest, NextResponse } from 'next/server';
import { AlgoliaSearchService, SEARCH_INDICES } from '@/lib/search/algolia-service';

/**
 * GET /api/search
 * Universal search across all indices
 */
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q') || '';
		const index = searchParams.get('index') || 'all';
		const page = parseInt(searchParams.get('page') || '0');
		const hitsPerPage = parseInt(searchParams.get('hitsPerPage') || '20');

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

		const searchService = new AlgoliaSearchService();

		let results;
		if (index === 'all') {
			results = await searchService.searchAll(query, { page, hitsPerPage });
		} else {
			results = [await searchService.search(index, query, { page, hitsPerPage })];
		}

		return NextResponse.json({
			success: true,
			data: results,
		});

	} catch (error) {
		console.error('Search API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to perform search' },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/search/suggestions
 * Get search suggestions/autocomplete
 */
export async function PATCH(request: NextRequest) {
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

		const searchService = new AlgoliaSearchService();
		const suggestions = await searchService.getSuggestions(query, index);

		return NextResponse.json({
			success: true,
			data: suggestions,
		});

	} catch (error) {
		console.error('Suggestions API Error:', error);
		return NextResponse.json(
			{ error: 'Failed to get suggestions' },
			{ status: 500 }
		);
	}
}
