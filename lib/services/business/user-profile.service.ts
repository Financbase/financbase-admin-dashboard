/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { LogIn, XCircle } from "lucide-react";
import type { User } from "../../db/schemas";
import { query } from "../db/neon-connection";
import { AppError } from "../middleware/error-handler";

export interface UserProfile {
	id: string | number;
	clerkUserId: string;
	email: string;
	firstName?: string;
	lastName?: string;
	role: string;
	permissions: string[];
	isActive: boolean;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	metadata?: any;
	profileCompletion: number;
	activityLevel: number;
	reputation: number;
}

export interface UserProfileStats {
	profileCompletion: number;
	activityLevel: number;
	reputation: number;
}

export class UserProfileService {
	/**
	 * Get user profile by Clerk user ID
	 */
	async getUserProfile(clerkUserId: string): Promise<UserProfile | null> {
		try {
			const users = await query<User>(
				"SELECT * FROM cms_users WHERE clerk_user_id = $1",
				[clerkUserId],
			);

			if (users.length === 0) {
				return null;
			}

			const user = users[0];

			// Calculate profile statistics
			const stats = await this.calculateUserStats(user.id as string);

			return {
				id: user.id as string,
				clerkUserId: user.clerkId,
				email: user.email,
				firstName: user.firstName || undefined,
				lastName: user.lastName || undefined,
				role: user.role,
				permissions: [] as string[],
				isActive: user.isActive,
				lastLoginAt: undefined,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				metadata: undefined,
				...stats,
			};
		} catch (error) {
			console.error("Error fetching user profile:", error);
			throw new AppError(
				"Failed to fetch user profile",
				500,
				"USER_PROFILE_FETCH_ERROR",
				{ clerkUserId },
			);
		}
	}

	/**
	 * Update user profile
	 */
	async updateUserProfile(
		clerkUserId: string,
		updates: Partial<Pick<User, "firstName" | "lastName">>,
	): Promise<UserProfile> {
		try {
			const updateFields = [];
			const values = [];
			let paramIndex = 1;

			if (updates.firstName !== undefined) {
				updateFields.push(`first_name = $${paramIndex}`);
				values.push(updates.firstName);
				paramIndex++;
			}

			if (updates.lastName !== undefined) {
				updateFields.push(`last_name = $${paramIndex}`);
				values.push(updates.lastName);
				paramIndex++;
			}

			if (updateFields.length === 0) {
				throw new AppError("No fields to update", 400, "NO_UPDATE_FIELDS");
			}

			updateFields.push("updated_at = NOW()");

			const queryStr = `
        UPDATE cms_users
        SET ${updateFields.join(", ")}
        WHERE clerk_user_id = $${paramIndex}
        RETURNING *
      `;

			values.push(clerkUserId);

			const result = await query<User>(queryStr, values);

			if (result.length === 0) {
				throw new AppError("User not found", 404, "USER_NOT_FOUND");
			}

			const user = result[0];
			const stats = await this.calculateUserStats(user.id);

			return {
				id: user.id as string,
				clerkUserId: user.clerkId,
				email: user.email,
				firstName: user.firstName || undefined,
				lastName: user.lastName || undefined,
				role: user.role,
				permissions: [] as string[],
				isActive: user.isActive,
				lastLoginAt: undefined,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				metadata: undefined,
				...stats,
			};
		} catch (error) {
			if (error instanceof AppError) {
				throw error;
			}
			console.error("Error updating user profile:", error);
			throw new AppError(
				"Failed to update user profile",
				500,
				"USER_PROFILE_UPDATE_ERROR",
				{ clerkUserId },
			);
		}
	}

	/**
	 * Get multiple user profiles
	 */
	async getUserProfiles(userIds?: string[]): Promise<UserProfile[]> {
		try {
			let queryStr = `
        SELECT * FROM cms_users
        WHERE is_active = true
      `;

			const params = [];

			if (userIds && userIds.length > 0) {
				const placeholders = userIds
					.map((_, index) => `$${index + 1}`)
					.join(",");
				queryStr += ` AND id IN (${placeholders})`;
				params.push(...userIds.map(id => id));
			}

			queryStr += " ORDER BY last_login_at DESC NULLS LAST";

			const users = await query<User>(queryStr, params);

			const profiles = await Promise.all(
				users.map(async (user) => {
					const stats = await this.calculateUserStats(user.id);
					return {
						id: user.id as string,
						clerkUserId: user.clerkId,
						email: user.email,
						firstName: user.firstName || undefined,
						lastName: user.lastName || undefined,
						role: user.role,
						permissions: [] as string[],
						isActive: user.isActive,
						lastLoginAt: undefined,
						createdAt: user.createdAt,
						updatedAt: user.updatedAt,
						metadata: undefined,
						...stats,
					};
				}),
			);

			return profiles;
		} catch (error) {
			console.error("Error fetching user profiles:", error);
			throw new AppError(
				"Failed to fetch user profiles",
				500,
				"USER_PROFILES_FETCH_ERROR",
			);
		}
	}

	/**
	 * Calculate user statistics based on their activity
	 */
	private async calculateUserStats(userId: string | number): Promise<UserProfileStats> {
		try {
			// For now, return mock stats - in a real implementation,
			// you would calculate these based on actual user activity data
			return {
				profileCompletion: Math.floor(Math.random() * 30) + 70, // 70-100%
				activityLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
				reputation: Math.floor(Math.random() * 20) + 80, // 80-100%
			};
		} catch (error) {
			console.error("Error calculating user stats:", error);
			// Return default stats on error
			return {
				profileCompletion: 50,
				activityLevel: 50,
				reputation: 50,
			};
		}
	}

	/**
	 * Get user activity summary
	 */
	async getUserActivitySummary(clerkUserId: string): Promise<{
		totalActivities: number;
		lastActivityDate?: Date;
		activityTypes: Record<string, number>;
	}> {
		try {
			// This would typically query an activities table
			// For now, return mock data
			return {
				totalActivities: Math.floor(Math.random() * 100) + 50,
				lastActivityDate: new Date(
					Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
				),
				activityTypes: {
					login: Math.floor(Math.random() * 20) + 10,
					profile_update: Math.floor(Math.random() * 5) + 1,
					content_creation: Math.floor(Math.random() * 15) + 5,
				},
			};
		} catch (error) {
			console.error("Error fetching user activity summary:", error);
			throw new AppError(
				"Failed to fetch user activity summary",
				500,
				"USER_ACTIVITY_FETCH_ERROR",
			);
		}
	}
}

// Export singleton instance
export const userProfileService = new UserProfileService();
