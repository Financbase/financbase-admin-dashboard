import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';
    const metric = searchParams.get('metric') || 'overview';

    // This would typically fetch real analytics data
    // For now, return mock data structure
    const analyticsData = {
      period,
      metric,
      timestamp: new Date().toISOString(),
      data: {
        overview: {
          totalRevenue: 125000,
          totalExpenses: 45000,
          netProfit: 80000,
          growth: 12.5,
          clients: 24,
          activeProjects: 8,
        },
        revenue: {
          monthly: 125000,
          yearly: 1500000,
          growth: 8.2,
          forecast: 135000,
        },
        expenses: {
          monthly: 45000,
          categories: {
            salaries: 25000,
            software: 5000,
            marketing: 8000,
            office: 7000,
          },
        },
        performance: {
          efficiency: 85,
          utilization: 78,
          satisfaction: 92,
          retention: 94,
        },
      },
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json({
      error: 'Failed to fetch analytics data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
