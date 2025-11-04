import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MetricsCollector } from '@/lib/analytics/metrics-collector';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  try {
    const { userId } = await auth();
    if (!userId) {
      return ApiErrorHandler.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '24h';

    // Get system health metrics
    const metrics = await MetricsCollector.getMetrics(userId, undefined, timeRange as any);

    // Calculate system health status
    const responseTime = metrics.performance?.reduce((avg: number, metric: any) => {
      return avg + (metric.responseTime || 0);
    }, 0) / (metrics.performance?.length || 1) || 0;

    const errorRate = metrics.system?.filter((metric: any) => 
      metric.metricName === 'error_rate'
    ).reduce((avg: number, metric: any) => {
      return avg + (parseFloat(metric.value) || 0);
    }, 0) / (metrics.system?.filter((metric: any) => 
      metric.metricName === 'error_rate'
    ).length || 1) || 0;

    // Determine system status
    let status = 'healthy';
    if (responseTime > 2000 || errorRate > 5) {
      status = 'critical';
    } else if (responseTime > 1000 || errorRate > 2) {
      status = 'warning';
    }

    // Get active users (mock data for now)
    const activeUsers = Math.floor(Math.random() * 100) + 50;

    // Get database connections (mock data for now)
    const databaseConnections = Math.floor(Math.random() * 20) + 10;

    // Get memory usage (mock data for now)
    const memoryUsage = Math.floor(Math.random() * 30) + 60; // 60-90%

    // Get CPU usage (mock data for now)
    const cpuUsage = Math.floor(Math.random() * 40) + 20; // 20-60%

    const systemHealth = {
      status,
      uptime: Date.now() - (24 * 60 * 60 * 1000), // Mock uptime
      responseTime: Math.round(responseTime),
      errorRate: Math.round(errorRate * 100) / 100,
      activeUsers,
      databaseConnections,
      memoryUsage,
      cpuUsage,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(systemHealth);
  } catch (error) {
    return ApiErrorHandler.handle(error, requestId);
  }
}
