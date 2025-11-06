/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { FinancialPermission } from "@/types/auth";
import { FINANCIAL_PERMISSIONS } from "@/types/auth";

export type Role = 'admin' | 'manager' | 'user' | 'viewer';

export interface AccessRequirement {
	roles?: Role[];
	permissions?: FinancialPermission[];
}

/**
 * Mapping of navigation routes to required roles and/or permissions
 * - If roles are specified, user must have one of those roles
 * - If permissions are specified, user must have at least one of those permissions
 * - Admin role always has access to everything
 * - If neither roles nor permissions are specified, route is accessible to all authenticated users
 */
export const NAVIGATION_PERMISSIONS: Record<string, AccessRequirement> = {
	// Main navigation
	'/dashboard': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},
	'/search': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},
	'/transactions': {
		permissions: [FINANCIAL_PERMISSIONS.EXPENSES_VIEW],
	},
	'/analytics': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/reports': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},

	// Financial Management
	'/invoices': {
		permissions: [FINANCIAL_PERMISSIONS.INVOICES_VIEW],
	},
	'/expenses': {
		permissions: [FINANCIAL_PERMISSIONS.EXPENSES_VIEW],
	},
	'/budgets': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/bill-pay': {
		permissions: [FINANCIAL_PERMISSIONS.EXPENSES_VIEW],
	},
	'/accounts': {
		permissions: [FINANCIAL_PERMISSIONS.REVENUE_VIEW],
	},
	'/financial-intelligence': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/agency': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/ecommerce': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/health': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/predictions': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/recommendations': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/financial-intelligence/startup': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},

	// Business Services
	'/clients': {
		roles: ['admin', 'manager', 'user'],
	},
	'/marketplace': {
		roles: ['admin', 'manager', 'user'],
	},
	'/workflows': {
		roles: ['admin', 'manager'],
	},
	'/leads': {
		roles: ['admin', 'manager', 'user'],
	},
	'/real-estate': {
		roles: ['admin', 'manager', 'user'],
	},
	'/freelance': {
		roles: ['admin', 'manager', 'user'],
	},

	// Marketing & Advertising
	'/marketing': {
		roles: ['admin', 'manager', 'user'],
	},
	'/marketing/campaigns': {
		roles: ['admin', 'manager', 'user'],
	},
	'/marketing/analytics': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'/marketing/leads': {
		roles: ['admin', 'manager', 'user'],
	},
	'/marketing/automation': {
		roles: ['admin', 'manager'],
	},

	// HR & People Management
	'/hr': {
		roles: ['admin', 'manager'],
	},
	'/hr/employees': {
		roles: ['admin', 'manager'],
	},
	'/hr/contractors': {
		roles: ['admin', 'manager'],
	},
	'/hr/time-tracking': {
		roles: ['admin', 'manager', 'user'],
	},
	'/hr/payroll': {
		roles: ['admin', 'manager'],
		permissions: [FINANCIAL_PERMISSIONS.EXPENSES_VIEW],
	},
	'/hr/leave': {
		roles: ['admin', 'manager', 'user'],
	},
	'/hr/attendance': {
		roles: ['admin', 'manager', 'user'],
	},

	// AI & Intelligence
	'/ai-assistant': {
		roles: ['admin', 'manager', 'user'],
	},
	'/financbase-gpt': {
		roles: ['admin', 'manager', 'user'],
	},
	'/performance': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},

	// Platform Services
	'/platform': {
		roles: ['admin', 'manager'],
	},
	'/webhooks': {
		roles: ['admin', 'manager'],
	},
	'/monitoring': {
		roles: ['admin'],
	},
	'/alerts': {
		roles: ['admin', 'manager'],
	},

	// Integration & Development
	'/integrations': {
		roles: ['admin', 'manager'],
	},
	'/integrations/marketplace': {
		roles: ['admin', 'manager'],
	},
	'/developer': {
		roles: ['admin'],
	},
	'/api': {
		roles: ['admin'],
	},

	// Collaboration
	'/collaboration': {
		roles: ['admin', 'manager', 'user'],
	},
	'/security-dashboard': {
		roles: ['admin'],
		permissions: [FINANCIAL_PERMISSIONS.AUDIT_LOGS_VIEW],
	},
	'/compliance': {
		roles: ['admin', 'manager'],
	},

	// Tools & Media
	'/gallery': {
		roles: ['admin', 'manager', 'user'],
	},
	'/editor': {
		roles: ['admin', 'manager', 'user'],
	},
	'/video': {
		roles: ['admin', 'manager', 'user'],
	},
	'/content': {
		roles: ['admin', 'manager', 'user'],
	},

	// Support
	'/help-center': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},
	'/docs': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},

	// Admin routes
	'/admin': {
		roles: ['admin'],
	},
	'/settings': {
		roles: ['admin', 'manager'],
	},
	'/settings/roles': {
		permissions: [FINANCIAL_PERMISSIONS.ROLES_MANAGE],
	},
	'/settings/team': {
		permissions: [FINANCIAL_PERMISSIONS.USERS_MANAGE],
	},
};

/**
 * Mapping of widget IDs to required roles and/or permissions
 */
export const WIDGET_PERMISSIONS: Record<string, AccessRequirement> = {
	'financial-overview': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},
	'quick-actions': {
		roles: ['admin', 'manager', 'user'],
	},
	'ai-insights': {
		roles: ['admin', 'manager', 'user'],
	},
	'sales-performance': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'top-products': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'revenue-analysis': {
		permissions: [FINANCIAL_PERMISSIONS.REVENUE_VIEW],
	},
	'customer-analytics': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
	'recent-activity': {
		roles: ['admin', 'manager', 'user', 'viewer'],
	},
	'support-tickets': {
		roles: ['admin', 'manager', 'user'],
	},
	'recent-orders': {
		permissions: [FINANCIAL_PERMISSIONS.INVOICES_VIEW],
	},
	'financial-widgets': {
		permissions: [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
	},
};

/**
 * Check if a user can access a route based on their role and permissions
 */
export function canAccessRoute(
	pathname: string,
	userRole: Role | null,
	userPermissions: FinancialPermission[]
): boolean {
	// Admin has access to everything
	if (userRole === 'admin') {
		return true;
	}

	// Find matching route (check for exact match first, then prefix match)
	let requirement: AccessRequirement | undefined = NAVIGATION_PERMISSIONS[pathname];

	// If no exact match, find the longest matching prefix
	if (!requirement) {
		const matchingRoute = Object.keys(NAVIGATION_PERMISSIONS)
			.filter(route => pathname.startsWith(route))
			.sort((a, b) => b.length - a.length)[0];

		if (matchingRoute) {
			requirement = NAVIGATION_PERMISSIONS[matchingRoute];
		}
	}

	// If no requirement is specified, allow access (default behavior)
	if (!requirement) {
		return true;
	}

	// Check role requirement
	if (requirement.roles && requirement.roles.length > 0) {
		if (userRole && requirement.roles.includes(userRole)) {
			return true;
		}
	}

	// Check permission requirement
	if (requirement.permissions && requirement.permissions.length > 0) {
		const hasPermission = requirement.permissions.some(perm =>
			userPermissions.includes(perm)
		);
		if (hasPermission) {
			return true;
		}
	}

	// If roles are specified but user doesn't match, deny access
	if (requirement.roles && requirement.roles.length > 0) {
		return false;
	}

	// If permissions are specified but user doesn't have them, deny access
	if (requirement.permissions && requirement.permissions.length > 0) {
		return false;
	}

	// Default: allow access if no specific requirements
	return true;
}

/**
 * Check if a user can access a widget based on their role and permissions
 */
export function canAccessWidget(
	widgetId: string,
	userRole: Role | null,
	userPermissions: FinancialPermission[]
): boolean {
	// Admin has access to everything
	if (userRole === 'admin') {
		return true;
	}

	const requirement = WIDGET_PERMISSIONS[widgetId];

	// If no requirement is specified, allow access (default behavior)
	if (!requirement) {
		return true;
	}

	// Check role requirement
	if (requirement.roles && requirement.roles.length > 0) {
		if (userRole && requirement.roles.includes(userRole)) {
			return true;
		}
	}

	// Check permission requirement
	if (requirement.permissions && requirement.permissions.length > 0) {
		const hasPermission = requirement.permissions.some(perm =>
			userPermissions.includes(perm)
		);
		if (hasPermission) {
			return true;
		}
	}

	// If roles are specified but user doesn't match, deny access
	if (requirement.roles && requirement.roles.length > 0) {
		return false;
	}

	// If permissions are specified but user doesn't have them, deny access
	if (requirement.permissions && requirement.permissions.length > 0) {
		return false;
	}

	// Default: allow access if no specific requirements
	return true;
}

/**
 * Get required permissions for a route
 */
export function getRoutePermissions(pathname: string): FinancialPermission[] {
	const requirement = NAVIGATION_PERMISSIONS[pathname];
	return requirement?.permissions || [];
}

/**
 * Get required permissions for a widget
 */
export function getWidgetPermissions(widgetId: string): FinancialPermission[] {
	const requirement = WIDGET_PERMISSIONS[widgetId];
	return requirement?.permissions || [];
}

