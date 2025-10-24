import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PerformanceService } from '@/lib/services/performance-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const systemHealth = await PerformanceService.getSystemHealth();
    return NextResponse.json(systemHealth);
  } catch (error) {
    console.error('Error fetching system health:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch system health',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
