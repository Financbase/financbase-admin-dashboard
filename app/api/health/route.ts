/**
 * Health Check API Endpoint
 * Provides comprehensive health status for monitoring
 */

import { NextResponse } from 'next/server';
import { HealthCheckService } from '@/monitoring/health-check';

export async function GET() {
  try {
    const healthStatus = await HealthCheckService.performHealthCheck();
    
    const statusCode = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}