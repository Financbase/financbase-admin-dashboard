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
    const organizationId = searchParams.get('organizationId');

    const dashboards = await DashboardBuilderService.getUserDashboards(
      userId,
      organizationId || undefined
    );

    return NextResponse.json(dashboards);
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      organizationId,
      layout,
      theme = 'light',
      colorScheme = 'blue',
      isPublic = false
    } = body;

    if (!name) {
      return NextResponse.json({ 
        error: 'Dashboard name is required' 
      }, { status: 400 });
    }

    const dashboard = await DashboardBuilderService.createDashboard(
      userId,
      name,
      description,
      organizationId,
      layout
    );

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json({ 
      error: 'Failed to create dashboard',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
