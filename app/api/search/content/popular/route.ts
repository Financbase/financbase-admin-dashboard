import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { searchService } from '@/lib/services/content/search-service';

/**
 * GET /api/search/content/popular
 * Get popular search queries
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '10', 10);

		const popularQueries = await searchService.getPopularQueries(limit);

		return NextResponse.json({
			success: true,
			data: popularQueries.map(q => ({
				query: q.query,
				count: Number(q.count),
			})),
		});
	} catch (error) {
		console.error('Popular Queries API Error:', error);
		return NextResponse.json(
			{
				error: 'Failed to get popular queries',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

