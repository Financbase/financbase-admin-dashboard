import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AlertService } from '@/lib/services/alert-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const organizationId = searchParams.get('organizationId');

    const statistics = await AlertService.getAlertStatistics(
      userId, 
      organizationId || undefined, 
      timeRange as any
    );

    return NextResponse.json(statistics);
  } catch (error) {
    console.error('Error fetching alert summary:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch alert summary',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
