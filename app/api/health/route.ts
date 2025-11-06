/**
 * Health Check API Endpoint
 * Provides comprehensive health status for monitoring
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextResponse } from 'next/server';
import { HealthCheckService } from '@/monitoring/health-check';

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns comprehensive health status of the application including database, services, and system metrics. Used for monitoring and uptime checks.
 *     tags:
 *       - Analytics
 *     responses:
 *       200:
 *         description: Service is healthy or degraded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     responseTime:
 *                       type: number
 *                 services:
 *                   type: object
 *                   description: Status of various services
 *       503:
 *         description: Service is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 error:
 *                   type: string
 */
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