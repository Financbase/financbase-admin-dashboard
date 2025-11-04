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
	type AdboardAudience,
	type NewAdboardAudience,
	adboardAudiences,
} from "@/lib/db/schemas/adboard.schema";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { Search, Trash2, XCircle } from "lucide-react";

/**
 * Create a new adboard audience
 */
export async function createAdboardAudience(
	userId: string,
	audienceData: Omit<NewAdboardAudience, "userId" | "createdAt" | "updatedAt">,
): Promise<AdboardAudience> {
	try {
		const [audience] = await db
			.insert(adboardAudiences)
			.values({
				...audienceData,
				userId,
			})
			.returning();

		return audience;
	} catch (error) {
		console.error("Error creating adboard audience:", error);
		throw new Error("Failed to create audience");
	}
}

/**
 * Get all adboard audiences for a user
 */
export async function getAdboardAudiences(
	userId: string,
	options?: {
		audienceType?: string;
		isActive?: boolean;
		search?: string;
		limit?: number;
		offset?: number;
	},
): Promise<AdboardAudience[]> {
	try {
		const conditions = [eq(adboardAudiences.userId, userId)];

		if (options?.audienceType) {
			conditions.push(
				eq(adboardAudiences.audienceType, options.audienceType as any),
			);
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(adboardAudiences.isActive, options.isActive));
		}

		if (options?.search) {
			conditions.push(
				or(
					like(adboardAudiences.name, `%${options.search}%`),
					like(adboardAudiences.description, `%${options.search}%`),
				),
			);
		}

		const whereClause = and(...conditions);

		const result = await db
			.select()
			.from(adboardAudiences)
			.where(whereClause)
			.orderBy(desc(adboardAudiences.createdAt))
			.limit(options?.limit || 50)
			.offset(options?.offset || 0);

		return result;
	} catch (error) {
		console.error("Error fetching adboard audiences:", error);
		throw new Error("Failed to fetch audiences");
	}
}

/**
 * Get a single adboard audience by ID
 */
export async function getAdboardAudienceById(
	audienceId: string,
	userId: string,
): Promise<AdboardAudience | null> {
	try {
		const [audience] = await db
			.select()
			.from(adboardAudiences)
			.where(
				and(
					eq(adboardAudiences.id, audienceId),
					eq(adboardAudiences.userId, userId),
				),
			)
			.limit(1);

		return audience || null;
	} catch (error) {
		console.error("Error fetching adboard audience:", error);
		throw new Error("Failed to fetch audience");
	}
}

/**
 * Update an adboard audience
 */
export async function updateAdboardAudience(
	audienceId: string,
	userId: string,
	updateData: Partial<
		Omit<AdboardAudience, "id" | "userId" | "createdAt" | "updatedAt">
	>,
): Promise<AdboardAudience | null> {
	try {
		const [audience] = await db
			.update(adboardAudiences)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(adboardAudiences.id, audienceId),
					eq(adboardAudiences.userId, userId),
				),
			)
			.returning();

		return audience || null;
	} catch (error) {
		console.error("Error updating adboard audience:", error);
		throw new Error("Failed to update audience");
	}
}

/**
 * Delete an adboard audience
 */
export async function deleteAdboardAudience(
	audienceId: string,
	userId: string,
): Promise<boolean> {
	try {
		const result = await db
			.delete(adboardAudiences)
			.where(
				and(
					eq(adboardAudiences.id, audienceId),
					eq(adboardAudiences.userId, userId),
				),
			);

		return result.rowCount > 0;
	} catch (error) {
		console.error("Error deleting adboard audience:", error);
		throw new Error("Failed to delete audience");
	}
}

/**
 * Toggle audience active status
 */
export async function toggleAudienceStatus(
	audienceId: string,
	userId: string,
	isActive: boolean,
): Promise<AdboardAudience | null> {
	try {
		const [audience] = await db
			.update(adboardAudiences)
			.set({
				isActive,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(adboardAudiences.id, audienceId),
					eq(adboardAudiences.userId, userId),
				),
			)
			.returning();

		return audience || null;
	} catch (error) {
		console.error("Error toggling audience status:", error);
		throw new Error("Failed to toggle audience status");
	}
}

/**
 * Get audience statistics
 */
export async function getAudienceStats(userId: string): Promise<{
	totalAudiences: number;
	activeAudiences: number;
	inactiveAudiences: number;
	audienceTypes: { type: string; count: number }[];
	averageAudienceSize: number;
}> {
	try {
		// Get basic stats
		const [basicStats] = await db
			.select({
				totalAudiences: sql<number>`count(*)`,
				activeAudiences: sql<number>`count(CASE WHEN ${adboardAudiences.isActive} = true THEN 1 END)`,
				inactiveAudiences: sql<number>`count(CASE WHEN ${adboardAudiences.isActive} = false THEN 1 END)`,
				averageSize: sql<number>`COALESCE(avg(${adboardAudiences.size}), 0)`,
			})
			.from(adboardAudiences)
			.where(eq(adboardAudiences.userId, userId));

		// Get audience type breakdown
		const typeStats = await db
			.select({
				type: adboardAudiences.audienceType,
				count: sql<number>`count(*)`,
			})
			.from(adboardAudiences)
			.where(eq(adboardAudiences.userId, userId))
			.groupBy(adboardAudiences.audienceType);

		return {
			totalAudiences: Number(basicStats?.totalAudiences || 0),
			activeAudiences: Number(basicStats?.activeAudiences || 0),
			inactiveAudiences: Number(basicStats?.inactiveAudiences || 0),
			audienceTypes: typeStats.map((stat) => ({
				type: stat.type,
				count: Number(stat.count),
			})),
			averageAudienceSize: Number(basicStats?.averageSize || 0),
		};
	} catch (error) {
		console.error("Error fetching audience stats:", error);
		throw new Error("Failed to fetch audience statistics");
	}
}

/**
 * Duplicate an audience
 */
export async function duplicateAudience(
	audienceId: string,
	userId: string,
	newName: string,
): Promise<AdboardAudience | null> {
	try {
		// Get original audience
		const originalAudience = await getAdboardAudienceById(audienceId, userId);
		if (!originalAudience) {
			throw new Error("Audience not found");
		}

		// Create duplicate with new name
		const duplicateData: Omit<
			NewAdboardAudience,
			"userId" | "createdAt" | "updatedAt"
		> = {
			name: newName,
			description: originalAudience.description,
			audienceType: originalAudience.audienceType,
			criteria: originalAudience.criteria,
			size: originalAudience.size,
			isActive: false, // Start as inactive
		};

		const [duplicate] = await db
			.insert(adboardAudiences)
			.values({
				...duplicateData,
				userId,
			})
			.returning();

		return duplicate;
	} catch (error) {
		console.error("Error duplicating audience:", error);
		throw new Error("Failed to duplicate audience");
	}
}
