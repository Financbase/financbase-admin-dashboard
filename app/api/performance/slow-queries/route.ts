import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PerformanceService } from '@/lib/services/performance-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const slowQueries = await PerformanceService.analyzeSlowQueries(limit);
    return NextResponse.json(slowQueries);
  } catch (error) {
    console.error('Error fetching slow queries:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch slow queries',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
