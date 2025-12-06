/**
 * Financbase Role-Based Access Control (RBAC) System
 * Integrates with Clerk authentication while providing financial-specific permissions
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { auth } from '@clerk/nextjs/server';
import type { FinancbaseUserMetadata, FinancialPermission } from '@/types/auth';
import { FINANCIAL_PERMISSIONS } from '@/types/auth';
import { canAccessRoute as canAccessRouteConfig, getRoutePermissions } from '@/lib/config/navigation-permissions';
import { getEffectiveRoleAndPermissions } from '@/lib/services/subscription-rbac.service';
import { canAccessWithSubscription } from '@/lib/utils/subscription-rbac-utils';

/**
 * Check if the current user has a specific permission
 * Also checks subscription-based permissions
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

		// Check if user has the specific permission in Clerk metadata
		const hasClerkPermission = metadata.permissions?.includes(permission) ?? false;

		// Also check subscription-based permissions
		const hasSubscriptionPermission = await canAccessWithSubscription(userId, permission);

		// User needs permission from either source (Clerk metadata or subscription)
		return hasClerkPermission || hasSubscriptionPermission;
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
		return (metadata?.permissions ?? []) as FinancialPermission[];
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
 * Uses the comprehensive navigation permissions configuration
 * Also considers subscription-based permissions
 * 
 * @param pathname - The route pathname to check
 * @param authResult - Optional auth result from middleware (to avoid calling auth() again)
 */
export async function checkRoutePermissions(
	pathname: string,
	authResult?: Awaited<ReturnType<typeof auth>>
): Promise<boolean> {
	try {
		// Use provided auth result if available (from middleware), otherwise call auth()
		const authData = authResult || await auth();
		const { userId, sessionClaims } = authData;
		
		if (!userId) {
			return false;
		}

		// Get user metadata from Clerk session claims
		const metadata = sessionClaims?.publicMetadata as FinancbaseUserMetadata | undefined;

		if (!metadata) {
			return false;
		}

		const userRole = metadata.role ?? null;
		const userPermissions = (metadata.permissions ?? []) as FinancialPermission[];

		// Get effective role and permissions from subscription
		const effective = await getEffectiveRoleAndPermissions(userId);
		
		// Combine Clerk permissions with subscription permissions
		const allPermissions = [
			...userPermissions,
			...(effective?.permissions || []),
		];
		
		// Use the higher role (admin > manager > user > viewer)
		const roleHierarchy: Record<string, number> = {
			admin: 4,
			manager: 3,
			user: 2,
			viewer: 1,
		};
		
		const effectiveRole = effective?.role || userRole;
		const finalRole = 
			roleHierarchy[effectiveRole || ''] > roleHierarchy[userRole || '']
				? effectiveRole
				: userRole;

		// Use the navigation permissions configuration with combined permissions
		return canAccessRouteConfig(pathname, finalRole, allPermissions);
	} catch (error) {
		console.error('Error checking route permissions:', error);
		return false;
	}
}

/**
 * Get required permissions for a route
 */
export function getRouteRequiredPermissions(pathname: string): FinancialPermission[] {
	return getRoutePermissions(pathname);
}

/**
 * Check if user can access a route based on role and permissions
 * Server-side version that works with auth context
 */
export async function canAccessRoute(
	pathname: string,
	userRole: FinancbaseUserMetadata['role'] | null,
	userPermissions: FinancialPermission[]
): Promise<boolean> {
	// Admin has access to everything
	if (userRole === 'admin') {
		return true;
	}

	return canAccessRouteConfig(pathname, userRole, userPermissions);
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
 * Also considers subscription-based role
 */
export async function isManagerOrAbove(): Promise<boolean> {
	const { userId } = await auth();
	if (!userId) {
		return false;
	}

	// Get effective role from subscription
	const effective = await getEffectiveRoleAndPermissions(userId);
	const effectiveRole = effective?.role;

	// Also check Clerk metadata role
	const clerkRole = await getUserRole();

	// User is manager or above if either role is admin or manager
	return (
		effectiveRole === 'admin' ||
		effectiveRole === 'manager' ||
		clerkRole === 'admin' ||
		clerkRole === 'manager'
	);
}

/**
 * Check subscription-based permission
 * Helper function to check if user has permission based on subscription
 */
export async function checkSubscriptionPermission(
	permission: FinancialPermission,
): Promise<boolean> {
	try {
		const { userId } = await auth();
		if (!userId) {
			return false;
		}

		return await canAccessWithSubscription(userId, permission);
	} catch (error) {
		console.error('Error checking subscription permission:', error);
		return false;
	}
}

