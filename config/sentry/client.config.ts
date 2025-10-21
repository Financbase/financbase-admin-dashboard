import * as Sentry from '@sentry/nextjs';

Sentry.init({
	dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

	// Adjust this value in production, or use tracesSampler for greater control
	tracesSampleRate: 1.0,

	// Setting this option to true will print useful information to the console while you're setting up Sentry.
	debug: false,

	// Performance Monitoring
	enabled: process.env.NODE_ENV === 'production',

	// Release Health
	release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

	// Environment
	environment: process.env.NODE_ENV,

	// Performance monitoring
	beforeSendTransaction(event) {
		// Filter out healthcheck endpoints
		if (event.transaction?.includes('/api/health')) {
			return null;
		}
		return event;
	},

	// Error filtering
	beforeSend(event, hint) {
		// Filter out network errors and other noise
		if (event.exception) {
			const error = hint.originalException;
			if (error && typeof error === 'object' && 'message' in error) {
				const message = (error as Error).message;

				// Filter out common noise errors
				if (
					message.includes('Network request failed') ||
					message.includes('Loading chunk') ||
					message.includes('Script error') ||
					message.includes('Non-Error promise rejection captured')
				) {
					return null;
				}
			}
		}

		return event;
	},

	// Set tags
	initialScope: {
		tags: {
			component: 'financbase-admin-dashboard',
		},
	},
});
