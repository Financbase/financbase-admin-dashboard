import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MetricsCollector } from '@/lib/analytics/metrics-collector';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';
    const metricType = searchParams.get('type') || 'all';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get metrics based on type
    let metrics;
    if (metricType === 'all') {
      metrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);
    } else {
      // Filter by metric type
      const allMetrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);
      metrics = {
        system: metricType === 'system' ? allMetrics.system : [],
        performance: metricType === 'performance' ? allMetrics.performance : [],
        business: metricType === 'business' ? allMetrics.business : [],
      };
    }

    // Apply pagination
    if (metrics.system) {
      metrics.system = metrics.system.slice(offset, offset + limit);
    }
    if (metrics.performance) {
      metrics.performance = metrics.performance.slice(offset, offset + limit);
    }
    if (metrics.business) {
      metrics.business = metrics.business.slice(offset, offset + limit);
    }

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
