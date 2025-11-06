/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useUser } from "@clerk/nextjs";
import { useMemo } from "react";
import type { FinancbaseUserMetadata, FinancialPermission } from "@/types/auth";
import { canAccessRoute as canAccessRouteConfig } from "@/lib/config/navigation-permissions";

export interface UseUserPermissionsReturn {
	role: FinancbaseUserMetadata['role'] | null;
	permissions: FinancialPermission[];
	isAdmin: boolean;
	isManagerOrAbove: boolean;
	isLoading: boolean;
	hasPermission: (permission: FinancialPermission) => boolean;
	hasAnyPermission: (permissions: FinancialPermission[]) => boolean;
	hasAllPermissions: (permissions: FinancialPermission[]) => boolean;
	hasRole: (role: FinancbaseUserMetadata['role']) => boolean;
	canAccessRoute: (pathname: string) => boolean;
}

/**
 * Client-side hook to fetch and check user role and permissions from Clerk
 */
export function useUserPermissions(): UseUserPermissionsReturn {
	const { user, isLoaded } = useUser();

	const metadata = useMemo(() => {
		if (!user || !isLoaded) {
			return null;
		}

		return user.publicMetadata as FinancbaseUserMetadata | undefined;
	}, [user, isLoaded]);

	const role = useMemo(() => {
		return metadata?.role ?? null;
	}, [metadata]);

	const permissions = useMemo(() => {
		if (!metadata?.permissions) {
			return [];
		}
		return metadata.permissions as FinancialPermission[];
	}, [metadata]);

	const isAdmin = useMemo(() => {
		return role === 'admin';
	}, [role]);

	const isManagerOrAbove = useMemo(() => {
		return role === 'admin' || role === 'manager';
	}, [role]);

	const hasPermission = useMemo(() => {
		return (permission: FinancialPermission): boolean => {
			// Admin has all permissions
			if (isAdmin) {
				return true;
			}

			return permissions.includes(permission);
		};
	}, [isAdmin, permissions]);

	const hasAnyPermission = useMemo(() => {
		return (permissionList: FinancialPermission[]): boolean => {
			if (isAdmin) {
				return true;
			}

			return permissionList.some(perm => permissions.includes(perm));
		};
	}, [isAdmin, permissions]);

	const hasAllPermissions = useMemo(() => {
		return (permissionList: FinancialPermission[]): boolean => {
			if (isAdmin) {
				return true;
			}

			return permissionList.every(perm => permissions.includes(perm));
		};
	}, [isAdmin, permissions]);

	const hasRole = useMemo(() => {
		return (requiredRole: FinancbaseUserMetadata['role']): boolean => {
			if (isAdmin) {
				return true; // Admin can access any role-required resource
			}

			return role === requiredRole;
		};
	}, [isAdmin, role]);

	const canAccessRoute = useMemo(() => {
		return (pathname: string): boolean => {
			return canAccessRouteConfig(pathname, role, permissions);
		};
	}, [role, permissions]);

	return {
		role,
		permissions,
		isAdmin,
		isManagerOrAbove,
		isLoading: !isLoaded,
		hasPermission,
		hasAnyPermission,
		hasAllPermissions,
		hasRole,
		canAccessRoute,
	};
}

