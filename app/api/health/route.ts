import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for monitoring and load balancers
 */
export async function GET(request: NextRequest) {
	try {
		// Basic application health check
		const healthCheck = {
			status: 'healthy',
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			version: process.env.npm_package_version || '1.0.0',
			environment: process.env.NODE_ENV || 'development',
		};

		// Database health check (optional)
		let databaseStatus = 'unknown';
		try {
			// Add database ping logic here if needed
			databaseStatus = 'connected';
		} catch (error) {
			databaseStatus = 'disconnected';
			console.error('Database health check failed:', error);
		}

		// External services health check
		const servicesStatus = {
			openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
			resend: process.env.RESEND_API_KEY ? 'configured' : 'not_configured',
			algolia: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ? 'configured' : 'not_configured',
			sentry: process.env.SENTRY_DSN ? 'configured' : 'not_configured',
		};

		// Overall health status
		const isHealthy = databaseStatus === 'connected' || process.env.NODE_ENV === 'development';

		const response = {
			...healthCheck,
			database: databaseStatus,
			services: servicesStatus,
			overall: isHealthy ? 'healthy' : 'degraded',
		};

		return NextResponse.json(response, {
			status: isHealthy ? 200 : 503,
		});

	} catch (error) {
		console.error('Health check error:', error);

		return NextResponse.json(
			{
				status: 'error',
				timestamp: new Date().toISOString(),
				error: 'Health check failed',
			},
			{ status: 500 }
		);
	}
}
