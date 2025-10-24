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

    // Get metrics for trend analysis
    const metrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);

    // Calculate trends for key metrics
    const trends = [];

    // API Response Time Trend
    if (metrics.performance && metrics.performance.length > 0) {
      const responseTimes = metrics.performance.map((m: any) => m.responseTime || 0);
      const avgResponseTime = responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);
      
      trends.push({
        name: 'API Response Time',
        value: Math.round(avgResponseTime),
        change: Math.round(((avgResponseTime - 100) / 100) * 100), // Mock change calculation
        trend: avgResponseTime > 200 ? 'up' : avgResponseTime < 100 ? 'down' : 'stable',
        unit: 'ms',
        min: minResponseTime,
        max: maxResponseTime,
      });
    }

    // Error Rate Trend
    if (metrics.system && metrics.system.length > 0) {
      const errorMetrics = metrics.system.filter((m: any) => m.metricName === 'error_rate');
      const avgErrorRate = errorMetrics.reduce((sum: number, m: any) => sum + (parseFloat(m.value) || 0), 0) / errorMetrics.length;
      
      trends.push({
        name: 'Error Rate',
        value: Math.round(avgErrorRate * 100) / 100,
        change: Math.round(((avgErrorRate - 0.5) / 0.5) * 100), // Mock change calculation
        trend: avgErrorRate > 2 ? 'up' : avgErrorRate < 0.5 ? 'down' : 'stable',
        unit: '%',
      });
    }

    // Business Metrics Trends
    if (metrics.business && metrics.business.length > 0) {
      const revenueMetrics = metrics.business.filter((m: any) => m.metricName === 'revenue');
      const expenseMetrics = metrics.business.filter((m: any) => m.metricName === 'expenses');
      
      if (revenueMetrics.length > 0) {
        const totalRevenue = revenueMetrics.reduce((sum: number, m: any) => sum + (parseFloat(m.value) || 0), 0);
        trends.push({
          name: 'Revenue',
          value: Math.round(totalRevenue),
          change: Math.round(((totalRevenue - 10000) / 10000) * 100), // Mock change calculation
          trend: totalRevenue > 15000 ? 'up' : totalRevenue < 8000 ? 'down' : 'stable',
          unit: 'USD',
        });
      }

      if (expenseMetrics.length > 0) {
        const totalExpenses = expenseMetrics.reduce((sum: number, m: any) => sum + (parseFloat(m.value) || 0), 0);
        trends.push({
          name: 'Expenses',
          value: Math.round(totalExpenses),
          change: Math.round(((totalExpenses - 5000) / 5000) * 100), // Mock change calculation
          trend: totalExpenses > 8000 ? 'up' : totalExpenses < 3000 ? 'down' : 'stable',
          unit: 'USD',
        });
      }
    }

    // Add some mock trends for demonstration
    trends.push(
      {
        name: 'Active Users',
        value: Math.floor(Math.random() * 100) + 50,
        change: Math.floor(Math.random() * 20) - 10,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        unit: 'users',
      },
      {
        name: 'Database Connections',
        value: Math.floor(Math.random() * 20) + 10,
        change: Math.floor(Math.random() * 10) - 5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        unit: 'connections',
      },
      {
        name: 'Memory Usage',
        value: Math.floor(Math.random() * 30) + 60,
        change: Math.floor(Math.random() * 10) - 5,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        unit: '%',
      }
    );

    return NextResponse.json(trends);
  } catch (error) {
    console.error('Error fetching metric trends:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch metric trends',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
