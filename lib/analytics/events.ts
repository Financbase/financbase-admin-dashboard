/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Analytics event constants
 * Centralized event names for consistent tracking across the application
 */
export const AnalyticsEvents = {
	// Dashboard events
	DASHBOARD_VIEWED: 'dashboard_viewed',
	
	// Support ticket events
	SUPPORT_TICKET_VIEWED: 'support_ticket_viewed',
	SUPPORT_TICKET_CREATED: 'support_ticket_created',
	SUPPORT_TICKET_UPDATED: 'support_ticket_updated',
	
	// Page view events
	PAGE_VIEWED: 'page_viewed',
	
	// User interaction events
	BUTTON_CLICKED: 'button_clicked',
	LINK_CLICKED: 'link_clicked',
	FORM_SUBMITTED: 'form_submitted',
	
	// Feature usage events
	FEATURE_USED: 'feature_used',
	
	// Error events
	ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * Type for analytics event names
 */
export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

/**
 * Default export for convenience
 */
export default AnalyticsEvents;

