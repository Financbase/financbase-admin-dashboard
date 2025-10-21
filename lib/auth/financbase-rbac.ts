/**
 * Financbase Role-Based Access Control (RBAC) System
 * Integrates with Clerk authentication while providing financial-specific permissions
 */

import { auth } from '@clerk/nextjs/server';
import type { FinancbaseUserMetadata, FinancialPermission } from '@/types/auth';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';

/**
 * Check if the current user has a specific permission
 */
export async function checkPermission(permission: FinancialPermission): Promise<boolean> {
	try {
		const { userId, sessionClaims } = await auth();
		
		if (!userId) {
			return false;
		}

		// Get user metadata from Clerk session claims
		const metadata = sessionClaims?.publicMetadata as FinancbaseUserMetadata | undefined;

		if (!metadata) {
			return false;
		}

		// Admin role has all permissions
		if (metadata.role === 'admin') {
			return true;
		}

		// Check if user has the specific permission
		return metadata.permissions?.includes(permission) ?? false;
	} catch (error) {
		console.error('Error checking permission:', error);
		return false;
	}
}

/**
 * Check multiple permissions (user must have ALL)
 */
export async function checkPermissions(permissions: FinancialPermission[]): Promise<boolean> {
	const results = await Promise.all(permissions.map(checkPermission));
	return results.every(result => result === true);
}

/**
 * Check if user has ANY of the specified permissions
 */
export async function checkAnyPermission(permissions: FinancialPermission[]): Promise<boolean> {
	const results = await Promise.all(permissions.map(checkPermission));
	return results.some(result => result === true);
}

/**
 * Get the current user's role
 */
export async function getUserRole(): Promise<FinancbaseUserMetadata['role'] | null> {
	try {
		const { sessionClaims } = await auth();
		const metadata = sessionClaims?.publicMetadata as FinancbaseUserMetadata | undefined;
		return metadata?.role ?? null;
	} catch (error) {
		console.error('Error getting user role:', error);
		return null;
	}
}

/**
 * Get all permissions for the current user
 */
export async function getUserPermissions(): Promise<FinancialPermission[]> {
	try {
		const { sessionClaims } = await auth();
		const metadata = sessionClaims?.publicMetadata as FinancbaseUserMetadata | undefined;
		return metadata?.permissions ?? [];
	} catch (error) {
		console.error('Error getting user permissions:', error);
		return [];
	}
}

/**
 * Check financial access permissions
 */
export async function checkFinancialAccess(
	accessType: keyof FinancbaseUserMetadata['financialAccess']
): Promise<boolean> {
	try {
		const { sessionClaims } = await auth();
		const metadata = sessionClaims?.publicMetadata as FinancbaseUserMetadata | undefined;
		return metadata?.financialAccess?.[accessType] ?? false;
	} catch (error) {
		console.error('Error checking financial access:', error);
		return false;
	}
}

/**
 * Check permissions for a specific route
 */
export async function checkRoutePermissions(pathname: string): Promise<boolean> {
	const routePermissions: Record<string, FinancialPermission[]> = {
		'/dashboard/invoices': [FINANCIAL_PERMISSIONS.INVOICES_VIEW],
		'/dashboard/invoices/new': [FINANCIAL_PERMISSIONS.INVOICES_CREATE],
		'/dashboard/expenses': [FINANCIAL_PERMISSIONS.EXPENSES_VIEW],
		'/dashboard/expenses/new': [FINANCIAL_PERMISSIONS.EXPENSES_CREATE],
		'/dashboard/reports': [FINANCIAL_PERMISSIONS.REPORTS_VIEW],
		'/settings/roles': [FINANCIAL_PERMISSIONS.ROLES_MANAGE],
		'/settings/team': [FINANCIAL_PERMISSIONS.USERS_MANAGE],
	};

	// Find matching route pattern
	for (const [route, permissions] of Object.entries(routePermissions)) {
		if (pathname.startsWith(route)) {
			return checkAnyPermission(permissions);
		}
	}

	// Default: allow access if no specific permissions required
	return true;
}

/**
 * Require permission (throws error if not authorized)
 */
export async function requirePermission(permission: FinancialPermission): Promise<void> {
	const hasPermission = await checkPermission(permission);
	if (!hasPermission) {
		throw new Error(`Permission denied: ${permission}`);
	}
}

/**
 * Require role (throws error if not authorized)
 */
export async function requireRole(role: FinancbaseUserMetadata['role']): Promise<void> {
	const userRole = await getUserRole();
	if (userRole !== role && userRole !== 'admin') {
		throw new Error(`Role required: ${role}`);
	}
}

/**
 * Get user metadata from Clerk
 */
export async function getUserMetadata(): Promise<FinancbaseUserMetadata | null> {
	try {
		const { sessionClaims } = await auth();
		return (sessionClaims?.publicMetadata as FinancbaseUserMetadata) ?? null;
	} catch (error) {
		console.error('Error getting user metadata:', error);
		return null;
	}
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
	const role = await getUserRole();
	return role === 'admin';
}

/**
 * Check if user is manager or above
 */
export async function isManagerOrAbove(): Promise<boolean> {
	const role = await getUserRole();
	return role === 'admin' || role === 'manager';
}

