/**
 * Health Check API Endpoint (v1)
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
import { getApiVersionContext, setVersionHeaders } from '@/lib/api/version-context';

export async function GET(request: Request) {
	try {
		const versionContext = getApiVersionContext(request as any);
		const healthStatus = await HealthCheckService.performHealthCheck();
		
		const statusCode = healthStatus.status === 'healthy' ? 200 : 
						  healthStatus.status === 'degraded' ? 200 : 503;
		
		const response = NextResponse.json(healthStatus, { status: statusCode });
		
		// Set version headers
		const headers = new Headers(response.headers);
		setVersionHeaders(headers as any, versionContext.version);
		
		return new NextResponse(response.body, {
			status: statusCode,
			headers,
		});
	} catch (error) {
		const response = NextResponse.json({
			status: 'unhealthy',
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error'
		}, { status: 503 });
		
		const headers = new Headers(response.headers);
		setVersionHeaders(headers as any, 'v1');
		
		return new NextResponse(response.body, {
			status: 503,
			headers,
		});
	}
}
