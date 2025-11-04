/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	organizationMembers,
	users,
} from "@/lib/db/schemas/organization.schema";
import { Shield, Trash2, XCircle } from "lucide-react";

/**
 * Access Control Service
 *
 * Manages role-based access control (RBAC) for banking and reconciliation features
 * to ensure proper security and compliance with financial data access requirements.
 */

export interface Permission {
	resource: string;
	actions: string[];
	conditions?: Record<string, any>;
}

export interface UserRole {
	id: string;
	name: string;
	permissions: Permission[];
	bankingAccess: boolean;
	reconciliationAccess: boolean;
	adminAccess: boolean;
}

export class AccessControlService {
	private static readonly ROLES: Record<string, UserRole> = {
		admin: {
			id: "admin",
			name: "Administrator",
			permissions: [{ resource: "*", actions: ["*"] }],
			bankingAccess: true,
			reconciliationAccess: true,
			adminAccess: true,
		},
		banking_manager: {
			id: "banking_manager",
			name: "Banking Manager",
			permissions: [
				{
					resource: "bank_accounts",
					actions: ["create", "read", "update", "delete"],
				},
				{ resource: "transactions", actions: ["read", "update"] },
				{
					resource: "reconciliation",
					actions: ["read", "update", "approve", "reject"],
				},
			],
			bankingAccess: true,
			reconciliationAccess: true,
			adminAccess: false,
		},
		accountant: {
			id: "accountant",
			name: "Accountant",
			permissions: [
				{ resource: "bank_accounts", actions: ["read"] },
				{ resource: "transactions", actions: ["read", "update"] },
				{ resource: "reconciliation", actions: ["read", "approve", "reject"] },
			],
			bankingAccess: true,
			reconciliationAccess: true,
			adminAccess: false,
		},
		member: {
			id: "member",
			name: "Member",
			permissions: [
				{ resource: "bank_accounts", actions: ["read"] },
				{ resource: "transactions", actions: ["read"] },
			],
			bankingAccess: false,
			reconciliationAccess: false,
			adminAccess: false,
		},
	};

	/**
	 * Check if user has permission for a specific action on a resource
	 */
	static async hasPermission(
		userId: string,
		resource: string,
		action: string,
	): Promise<boolean> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			if (!userRole) return false;

			// Admin has all permissions
			if (userRole.adminAccess) return true;

			// Check specific permissions
			for (const permission of userRole.permissions) {
				if (permission.resource === "*" || permission.resource === resource) {
					if (
						permission.actions.includes("*") ||
						permission.actions.includes(action)
					) {
						return true;
					}
				}
			}

			return false;
		} catch (error) {
			console.error("Permission check failed:", error);
			return false;
		}
	}

	/**
	 * Get user's role information
	 */
	static async getUserRole(userId: string): Promise<UserRole | null> {
		try {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, userId),
				with: {
					organizationMembers: {
						with: {
							organization: true,
						},
					},
				},
			});

			if (!user) return null;

			// Get role from organization membership
			const membership = user.organizationMembers?.[0];
			const roleName = membership?.role || "member";

			return (
				AccessControlService.ROLES[roleName] ||
				AccessControlService.ROLES.member
			);
		} catch (error) {
			console.error("Failed to get user role:", error);
			return null;
		}
	}

	/**
	 * Get user's permissions
	 */
	static async getUserPermissions(userId: string): Promise<Permission[]> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			return userRole?.permissions || [];
		} catch (error) {
			console.error("Failed to get user permissions:", error);
			return [];
		}
	}

	/**
	 * Check if user has banking access
	 */
	static async hasBankingAccess(userId: string): Promise<boolean> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			return userRole?.bankingAccess || false;
		} catch (error) {
			console.error("Failed to check banking access:", error);
			return false;
		}
	}

	/**
	 * Check if user has reconciliation access
	 */
	static async hasReconciliationAccess(userId: string): Promise<boolean> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			return userRole?.reconciliationAccess || false;
		} catch (error) {
			console.error("Failed to check reconciliation access:", error);
			return false;
		}
	}

	/**
	 * Check if user has admin access
	 */
	static async hasAdminAccess(userId: string): Promise<boolean> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			return userRole?.adminAccess || false;
		} catch (error) {
			console.error("Failed to check admin access:", error);
			return false;
		}
	}

	/**
	 * Check if user has access to a specific resource
	 */
	static async hasResourceAccess(
		userId: string,
		resourceId: string,
		resourceType: string,
	): Promise<boolean> {
		try {
			// For now, implement basic resource access check
			// In a real implementation, this would check ownership or shared access
			const userRole = await AccessControlService.getUserRole(userId);
			if (!userRole) return false;

			// Admin has access to all resources
			if (userRole.adminAccess) return true;

			// Check if user has permission for the resource type
			return await AccessControlService.hasPermission(
				userId,
				resourceType,
				"read",
			);
		} catch (error) {
			console.error("Failed to check resource access:", error);
			return false;
		}
	}

	/**
	 * Get inherited permissions from parent roles
	 */
	static async getInheritedPermissions(userId: string): Promise<Permission[]> {
		try {
			const userRole = await AccessControlService.getUserRole(userId);
			if (!userRole) return [];

			// For now, return the user's direct permissions
			// In a more complex system, this would traverse role hierarchies
			return userRole.permissions;
		} catch (error) {
			console.error("Failed to get inherited permissions:", error);
			return [];
		}
	}

	/**
	 * Validate user session and permissions
	 */
	static async validateUserSession(userId: string): Promise<boolean> {
		try {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.id, userId),
			});

			return !!user;
		} catch (error) {
			console.error("Failed to validate user session:", error);
			return false;
		}
	}

	/**
	 * Get all available roles
	 */
	static getAllRoles(): UserRole[] {
		return Object.values(AccessControlService.ROLES);
	}

	/**
	 * Get role by name
	 */
	static getRoleByName(roleName: string): UserRole | null {
		return AccessControlService.ROLES[roleName] || null;
	}

	/**
	 * Check if role exists
	 */
	static roleExists(roleName: string): boolean {
		return roleName in AccessControlService.ROLES;
	}

	/**
	 * Get permissions for a specific role
	 */
	static getRolePermissions(roleName: string): Permission[] {
		const role = AccessControlService.ROLES[roleName];
		return role?.permissions || [];
	}
}
