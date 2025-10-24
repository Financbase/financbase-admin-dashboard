import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardBuilderService } from '@/lib/services/dashboard-builder-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    const templates = await DashboardBuilderService.getWidgetTemplates(
      category || undefined,
      limit
    );

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching widget templates:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch widget templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
