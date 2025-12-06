import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: process.env.SENTRY_DSN,

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1.0,

	// Performance Monitoring
	enabled: process.env.NODE_ENV === 'production',

	// Release Health
	release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

	// Environment
	environment: process.env.NODE_ENV,

	// Performance monitoring for server-side
	beforeSendTransaction(event) {
		// Filter out healthcheck endpoints
		if (event.transaction?.includes('/api/health')) {
			return null;
		}
		return event;
	},

	// Error filtering and alert configuration for server-side
	beforeSend(event, hint) {
		// Filter out database connection errors in development
		if (process.env.NODE_ENV === 'development') {
			const error = hint.originalException;
			if (error && typeof error === 'object' && 'code' in error) {
				const dbError = error as any;
				if (dbError.code === 'ECONNREFUSED' || dbError.code === 'ENOTFOUND') {
					return null;
				}
			}
		}

		// Tag critical errors for alerting
		if (event.exception) {
			const error = hint.originalException;
			if (error && typeof error === 'object' && 'message' in error) {
				const message = (error as Error).message;
				
				// Tag authentication errors
				if (message.includes('authentication') || message.includes('unauthorized')) {
					event.tags = { ...event.tags, category: 'authentication', severity: 'high' };
				}
				
				// Tag payment errors
				if (message.includes('payment') || message.includes('stripe') || message.includes('transaction')) {
					event.tags = { ...event.tags, category: 'payment', severity: 'critical' };
				}
				
				// Tag database errors
				if (message.includes('database') || message.includes('connection') || message.includes('query')) {
					event.tags = { ...event.tags, category: 'database', severity: 'high' };
				}
			}
		}

		return event;
	},

	// Set server-specific tags
	initialScope: {
		tags: {
			component: 'financbase-admin-dashboard-server',
		},
	},
});
