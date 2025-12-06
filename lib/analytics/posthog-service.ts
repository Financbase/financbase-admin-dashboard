/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

// Dynamic import for posthog-js (may not be installed)
let posthog: any;
if (typeof window !== 'undefined') {
	try {
		// eslint-disable-next-line @typescript-eslint/no-require-imports
		posthog = require('posthog-js');
	} catch {
		// posthog-js not installed, use no-op implementation
		posthog = {
			init: () => {},
			capture: () => {},
			identify: () => {},
			reset: () => {},
			people: { set: () => {} },
		};
	}
} else {
	// Server-side, use no-op
	posthog = {
		init: () => {},
		capture: () => {},
		identify: () => {},
		reset: () => {},
		people: { set: () => {} },
	};
}

export interface AnalyticsEvent {
	event: string;
	properties?: Record<string, any>;
}

export class AnalyticsService {
	private static initialized = false;

	/**
	 * Initialize PostHog analytics
	 */
	static init() {
		if (this.initialized || typeof window === 'undefined') return;

		posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
			api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
			capture_pageview: true,
			capture_pageleave: true,
			persistence: 'localStorage',
			loaded: (_posthog: any) => {
				console.log('PostHog analytics loaded');
			},
		});

		this.initialized = true;
	}

	/**
	 * Track custom events
	 */
	static track(event: AnalyticsEvent) {
		if (!this.initialized) {
			this.init();
		}

		posthog.capture(event.event, event.properties);
	}

	/**
	 * Track page views
	 */
	static pageView(page: string, properties?: Record<string, any>) {
		this.track({
			event: 'page_view',
			properties: {
				page,
				...properties,
			},
		});
	}

	/**
	 * Track user actions
	 */
	static trackUserAction(action: string, properties?: Record<string, any>) {
		this.track({
			event: 'user_action',
			properties: {
				action,
				timestamp: new Date().toISOString(),
				...properties,
			},
		});
	}

	/**
	 * Track financial events
	 */
	static trackFinancialEvent(
		eventType: 'invoice_created' | 'expense_added' | 'payment_received' | 'budget_updated',
		properties?: Record<string, any>
	) {
		this.track({
			event: `financial_${eventType}`,
			properties: {
				event_type: eventType,
				timestamp: new Date().toISOString(),
				...properties,
			},
		});
	}

	/**
	 * Track feature usage
	 */
	static trackFeatureUsage(feature: string, action: string, properties?: Record<string, any>) {
		this.track({
			event: 'feature_usage',
			properties: {
				feature,
				action,
				timestamp: new Date().toISOString(),
				...properties,
			},
		});
	}

	/**
	 * Track errors
	 */
	static trackError(error: Error, context?: Record<string, any>) {
		this.track({
			event: 'error_occurred',
			properties: {
				error_message: error.message,
				error_stack: error.stack,
				context,
				timestamp: new Date().toISOString(),
			},
		});
	}

	/**
	 * Track performance metrics
	 */
	static trackPerformance(metric: string, value: number, properties?: Record<string, any>) {
		this.track({
			event: 'performance_metric',
			properties: {
				metric,
				value,
				unit: properties?.unit || 'ms',
				...properties,
			},
		});
	}

	/**
	 * Identify user for analytics
	 */
	static identify(userId: string, properties?: Record<string, any>) {
		if (!this.initialized) {
			this.init();
		}

		posthog.identify(userId, properties);
	}

	/**
	 * Set user properties
	 */
	static setUserProperties(properties: Record<string, any>) {
		if (!this.initialized) {
			this.init();
		}

		posthog.people.set(properties);
	}

	/**
	 * Reset user identity (for logout)
	 */
	static reset() {
		if (!this.initialized) {
			this.init();
		}

		posthog.reset();
	}

	/**
	 * Track conversion events
	 */
	static trackConversion(event: string, value?: number, properties?: Record<string, any>) {
		this.track({
			event: `conversion_${event}`,
			properties: {
				value,
				currency: 'USD',
				...properties,
			},
		});
	}
}

export default AnalyticsService;
