/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { users } from "@/drizzle/schema/cms-user-management";
import {
	workspaceInvitations,
	workspaceMembers,
	workspaces,
} from "@/drizzle/schema/workspaces";
import { getDbOrThrow } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, ilike, inArray, lte, sql } from "drizzle-orm";
import { Search, Server, Settings, Trash2, Users, XCircle } from "lucide-react";

export interface CreateWorkspaceInput {
	name: string;
	slug: string;
	description?: string;
	logo?: string;
	plan?: "free" | "pro" | "team" | "enterprise";
	domain?: string;
	settings?: Record<string, any>;
}

export interface UpdateWorkspaceInput {
	name?: string;
	slug?: string;
	description?: string;
	logo?: string;
	plan?: "free" | "pro" | "team" | "enterprise";
	domain?: string;
	settings?: Record<string, any>;
	status?: "active" | "inactive" | "suspended";
}

export interface WorkspaceFilters {
	search?: string;
	plan?: string;
	status?: string;
	ownerId?: string;
	memberId?: string;
}

export interface PaginatedResult<T> {
	data: T[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export class WorkspaceService {
	private db: any;

	constructor() {
		this.db = getDbOrThrow();
	}

	/**
	 * Get workspaces with filtering and pagination
	 */
	async getWorkspaces(
		filters: WorkspaceFilters = {},
		page = 1,
		limit = 20,
	): Promise<PaginatedResult<any>> {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			// User must be a member or owner of the workspace
			const memberWorkspaces = this.db
				.select({ workspaceId: workspaceMembers.workspaceId })
				.from(workspaceMembers)
				.where(
					and(
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.isActive, true),
					),
				);

			const memberWorkspaceIds = memberWorkspaces.map((m) => m.workspaceId);

			if (memberWorkspaceIds.length === 0) {
				return {
					data: [],
					total: 0,
					page,
					limit,
					totalPages: 0,
				};
			}

			whereConditions.push(inArray(workspaces.id, memberWorkspaceIds));

			if (filters.search) {
				whereConditions.push(ilike(workspaces.name, `%${filters.search}%`));
			}

			if (filters.plan && filters.plan !== "all") {
				whereConditions.push(eq(workspaces.plan, filters.plan));
			}

			if (filters.status && filters.status !== "all") {
				whereConditions.push(eq(workspaces.status, filters.status));
			}

			if (filters.ownerId) {
				whereConditions.push(eq(workspaces.ownerId, filters.ownerId));
			}

			const whereClause =
				whereConditions.length > 0 ? and(...whereConditions) : undefined;

			// Get total count
			const totalResult = await this.db
				.select({ count: sql<number>`count(*)` })
				.from(workspaces)
				.where(whereClause);

			const total = totalResult[0]?.count || 0;

			// Get paginated results
			const workspaceResults = await this.db
				.select({
					id: workspaces.id,
					workspaceId: workspaces.workspaceId,
					name: workspaces.name,
					slug: workspaces.slug,
					description: workspaces.description,
					logo: workspaces.logo,
					plan: workspaces.plan,
					status: workspaces.status,
					ownerId: workspaces.ownerId,
					domain: workspaces.domain,
					settings: workspaces.settings,
					isDefault: workspaces.isDefault,
					createdAt: workspaces.createdAt,
					updatedAt: workspaces.updatedAt,
					// Get member role
					memberRole: workspaceMembers.role,
					memberPermissions: workspaceMembers.permissions,
				})
				.from(workspaces)
				.leftJoin(
					workspaceMembers,
					and(
						eq(workspaces.id, workspaceMembers.workspaceId),
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.isActive, true),
					),
				)
				.where(whereClause)
				.orderBy(desc(workspaces.updatedAt))
				.limit(limit)
				.offset(offset);

			const totalPages = Math.ceil(total / limit);

			return {
				data: workspaceResults,
				total,
				page,
				limit,
				totalPages,
			};
		} catch (error) {
			console.error("Error fetching workspaces:", error);
			throw error;
		}
	}

	/**
	 * Get workspace by ID
	 */
	async getWorkspaceById(workspaceId: string | number): Promise<any> {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const workspace = await this.db
				.select({
					id: workspaces.id,
					workspaceId: workspaces.workspaceId,
					name: workspaces.name,
					slug: workspaces.slug,
					description: workspaces.description,
					logo: workspaces.logo,
					plan: workspaces.plan,
					status: workspaces.status,
					ownerId: workspaces.ownerId,
					domain: workspaces.domain,
					settings: workspaces.settings,
					isDefault: workspaces.isDefault,
					createdAt: workspaces.createdAt,
					updatedAt: workspaces.updatedAt,
					memberRole: workspaceMembers.role,
					memberPermissions: workspaceMembers.permissions,
				})
				.from(workspaces)
				.leftJoin(
					workspaceMembers,
					and(
						eq(workspaces.id, workspaceMembers.workspaceId),
						eq(workspaceMembers.userId, userId),
						eq(workspaceMembers.isActive, true),
					),
				)
				.where(
					and(
						eq(workspaces.workspaceId, workspaceId.toString()),
						inArray(
							workspaces.id,
							this.db
								.select({ workspaceId: workspaceMembers.workspaceId })
								.from(workspaceMembers)
								.where(
									and(
										eq(workspaceMembers.userId, userId),
										eq(workspaceMembers.isActive, true),
									),
								),
						),
					),
				)
				.limit(1);

			if (!workspace[0]) {
				throw new Error("Workspace not found or access denied");
			}

			return workspace[0];
		} catch (error) {
			console.error("Error fetching workspace:", error);
			throw error;
		}
	}

	/**
	 * Create a new workspace
	 */
	async createWorkspace(workspaceData: CreateWorkspaceInput): Promise<any> {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			// Generate unique workspace ID
			const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

			const newWorkspace = await this.db
				.insert(workspaces)
				.values({
					workspaceId,
					name: workspaceData.name,
					slug: workspaceData.slug,
					description: workspaceData.description,
					logo: workspaceData.logo,
					plan: workspaceData.plan || "free",
					ownerId: userId,
					domain: workspaceData.domain,
					settings: workspaceData.settings
						? JSON.stringify(workspaceData.settings)
						: null,
				})
				.returning({
					id: workspaces.id,
					workspaceId: workspaces.workspaceId,
					name: workspaces.name,
					slug: workspaces.slug,
					description: workspaces.description,
					logo: workspaces.logo,
					plan: workspaces.plan,
					status: workspaces.status,
					ownerId: workspaces.ownerId,
					domain: workspaces.domain,
					settings: workspaces.settings,
					isDefault: workspaces.isDefault,
					createdAt: workspaces.createdAt,
					updatedAt: workspaces.updatedAt,
				});

			if (!newWorkspace[0]) {
				throw new Error("Failed to create workspace");
			}

			// Add creator as owner member
			await this.db.insert(workspaceMembers).values({
				workspaceId: newWorkspace[0].id,
				userId,
				role: "owner",
				permissions: ["read", "write", "admin", "delete"],
			});

			return newWorkspace[0];
		} catch (error) {
			console.error("Error creating workspace:", error);
			throw error;
		}
	}

	/**
	 * Update workspace
	 */
	async updateWorkspace(
		workspaceId: string | number,
		updateData: UpdateWorkspaceInput,
	): Promise<any> {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			const updateFields: any = {};

			if (updateData.name !== undefined) updateFields.name = updateData.name;
			if (updateData.slug !== undefined) updateFields.slug = updateData.slug;
			if (updateData.description !== undefined)
				updateFields.description = updateData.description;
			if (updateData.logo !== undefined) updateFields.logo = updateData.logo;
			if (updateData.plan !== undefined) updateFields.plan = updateData.plan;
			if (updateData.domain !== undefined)
				updateFields.domain = updateData.domain;
			if (updateData.status !== undefined)
				updateFields.status = updateData.status;
			if (updateData.settings !== undefined)
				updateFields.settings = JSON.stringify(updateData.settings);

			updateFields.updatedAt = new Date();

			const updatedWorkspace = await this.db
				.update(workspaces)
				.set(updateFields)
				.where(
					and(
						eq(workspaces.workspaceId, workspaceId.toString()),
						eq(workspaces.ownerId, userId), // Only owner can update workspace details
					),
				)
				.returning({
					id: workspaces.id,
					workspaceId: workspaces.workspaceId,
					name: workspaces.name,
					slug: workspaces.slug,
					description: workspaces.description,
					logo: workspaces.logo,
					plan: workspaces.plan,
					status: workspaces.status,
					ownerId: workspaces.ownerId,
					domain: workspaces.domain,
					settings: workspaces.settings,
					isDefault: workspaces.isDefault,
					createdAt: workspaces.createdAt,
					updatedAt: workspaces.updatedAt,
				});

			if (!updatedWorkspace[0]) {
				throw new Error("Workspace not found or access denied");
			}

			return updatedWorkspace[0];
		} catch (error) {
			console.error("Error updating workspace:", error);
			throw error;
		}
	}

	/**
	 * Delete workspace (soft delete by setting status to inactive)
	 */
	async deleteWorkspace(workspaceId: string | number): Promise<void> {
		try {
			const { userId } = auth();
			if (!userId) {
				throw new Error("Unauthorized");
			}

			await this.db
				.update(workspaces)
				.set({
					status: "inactive",
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(workspaces.workspaceId, workspaceId.toString()),
						eq(workspaces.ownerId, userId),
					),
				);
		} catch (error) {
			console.error("Error deleting workspace:", error);
			throw error;
		}
	}

	/**
	 * Get user's workspaces
	 */
	async getUserWorkspaces(userId?: string): Promise<any[]> {
		try {
			const currentUserId = userId || auth().userId;
			if (!currentUserId) {
				throw new Error("Unauthorized");
			}

			const userWorkspaces = await this.db
				.select({
					id: workspaces.id,
					workspaceId: workspaces.workspaceId,
					name: workspaces.name,
					slug: workspaces.slug,
					description: workspaces.description,
					logo: workspaces.logo,
					plan: workspaces.plan,
					status: workspaces.status,
					ownerId: workspaces.ownerId,
					domain: workspaces.domain,
					settings: workspaces.settings,
					isDefault: workspaces.isDefault,
					createdAt: workspaces.createdAt,
					updatedAt: workspaces.updatedAt,
					memberRole: workspaceMembers.role,
					memberPermissions: workspaceMembers.permissions,
				})
				.from(workspaces)
				.innerJoin(
					workspaceMembers,
					and(
						eq(workspaces.id, workspaceMembers.workspaceId),
						eq(workspaceMembers.userId, currentUserId),
						eq(workspaceMembers.isActive, true),
					),
				)
				.where(eq(workspaces.status, "active"))
				.orderBy(desc(workspaces.updatedAt));

			return userWorkspaces;
		} catch (error) {
			console.error("Error fetching user workspaces:", error);
			throw error;
		}
	}
}
