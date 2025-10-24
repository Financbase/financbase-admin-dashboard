import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DocumentationService } from '@/lib/services/documentation-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'relevance';

    if (!query.trim()) {
      return NextResponse.json([]);
    }

    const filters = {
      category: category !== 'all' ? category : undefined,
    };

    const results = await DocumentationService.searchHelpContent(
      query,
      filters,
      userId,
      'session-id' // In a real implementation, get from session
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error searching help content:', error);
    return NextResponse.json({ 
      error: 'Failed to search help content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
