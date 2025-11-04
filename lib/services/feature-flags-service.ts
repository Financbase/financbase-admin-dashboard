/**
 * Feature Flags Service
 * Manages system-wide feature flags with rollout and targeting support
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { featureFlags, type FeatureFlag, type FeatureFlagConditions } from '@/lib/db/schemas/feature-flags.schema';
import { eq, and, sql } from 'drizzle-orm';

export interface FeatureFlagOptions {
	userId?: string;
	organizationId?: string;
	plan?: string;
	region?: string;
	accountAge?: number;
	customAttributes?: Record<string, unknown>;
}

export interface CreateFeatureFlagInput {
	key: string;
	name: string;
	description?: string;
	enabled?: boolean;
	rolloutPercentage?: number;
	targetOrganizations?: string[];
	targetUsers?: string[];
	conditions?: FeatureFlagConditions;
	metadata?: Record<string, unknown>;
}

export interface UpdateFeatureFlagInput {
	name?: string;
	description?: string;
	enabled?: boolean;
	rolloutPercentage?: number;
	targetOrganizations?: string[];
	targetUsers?: string[];
	conditions?: FeatureFlagConditions;
	metadata?: Record<string, unknown>;
}

export class FeatureFlagsService {
	/**
	 * Check if a feature flag is enabled for a user/organization
	 */
	static async isEnabled(key: string, options?: FeatureFlagOptions): Promise<boolean> {
		const flag = await db
			.select()
			.from(featureFlags)
			.where(eq(featureFlags.key, key))
			.limit(1);

		if (flag.length === 0) {
			return false; // Flag doesn't exist
		}

		const featureFlag = flag[0];

		// If flag is disabled globally, return false
		if (!featureFlag.enabled) {
			return false;
		}

		// Check if user/organization is specifically targeted
		if (options?.userId && featureFlag.targetUsers) {
			const targetUsers = featureFlag.targetUsers as string[];
			if (targetUsers.includes(options.userId)) {
				return true;
			}
		}

		if (options?.organizationId && featureFlag.targetOrganizations) {
			const targetOrgs = featureFlag.targetOrganizations as string[];
			if (targetOrgs.includes(options.organizationId)) {
				return true;
			}
		}

		// Check conditions
		if (featureFlag.conditions && options) {
			const conditions = featureFlag.conditions as FeatureFlagConditions;
			
			if (conditions.plan && options.plan && conditions.plan !== options.plan) {
				return false;
			}

			if (conditions.region && options.region && conditions.region !== options.region) {
				return false;
			}

			if (conditions.accountAge !== undefined && options.accountAge !== undefined) {
				if (options.accountAge < conditions.accountAge) {
					return false;
				}
			}

			// Check custom attributes
			if (conditions.customAttributes && options.customAttributes) {
				for (const [key, value] of Object.entries(conditions.customAttributes)) {
					if (options.customAttributes[key] !== value) {
						return false;
					}
				}
			}
		}

		// Check rollout percentage
		if (featureFlag.rolloutPercentage > 0) {
			// Use a consistent hash of userId/organizationId to determine if they're in the rollout
			const identifier = options?.userId || options?.organizationId || 'default';
			const hash = this.hashString(identifier);
			const percentage = hash % 100;
			
			return percentage < featureFlag.rolloutPercentage;
		}

		// If no rollout or conditions, return true if enabled
		return featureFlag.enabled;
	}

	/**
	 * Get all feature flags
	 */
	static async getAll(): Promise<FeatureFlag[]> {
		return await db
			.select()
			.from(featureFlags)
			.orderBy(featureFlags.key);
	}

	/**
	 * Get a feature flag by key
	 */
	static async getByKey(key: string): Promise<FeatureFlag | null> {
		const result = await db
			.select()
			.from(featureFlags)
			.where(eq(featureFlags.key, key))
			.limit(1);

		return result[0] || null;
	}

	/**
	 * Create a new feature flag
	 */
	static async create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
		const result = await db
			.insert(featureFlags)
			.values({
				key: input.key,
				name: input.name,
				description: input.description,
				enabled: input.enabled ?? false,
				rolloutPercentage: input.rolloutPercentage ?? 0,
				targetOrganizations: input.targetOrganizations || [],
				targetUsers: input.targetUsers || [],
				conditions: input.conditions || {},
				metadata: input.metadata || {},
				updatedAt: new Date(),
			})
			.returning();

		return result[0];
	}

	/**
	 * Update a feature flag
	 */
	static async update(key: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
		const updateData: Partial<typeof featureFlags.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (input.name !== undefined) updateData.name = input.name;
		if (input.description !== undefined) updateData.description = input.description;
		if (input.enabled !== undefined) updateData.enabled = input.enabled;
		if (input.rolloutPercentage !== undefined) updateData.rolloutPercentage = input.rolloutPercentage;
		if (input.targetOrganizations !== undefined) updateData.targetOrganizations = input.targetOrganizations;
		if (input.targetUsers !== undefined) updateData.targetUsers = input.targetUsers;
		if (input.conditions !== undefined) updateData.conditions = input.conditions;
		if (input.metadata !== undefined) updateData.metadata = input.metadata;

		const result = await db
			.update(featureFlags)
			.set(updateData)
			.where(eq(featureFlags.key, key))
			.returning();

		if (result.length === 0) {
			throw new Error(`Feature flag with key "${key}" not found`);
		}

		return result[0];
	}

	/**
	 * Delete a feature flag
	 */
	static async delete(key: string): Promise<void> {
		await db
			.delete(featureFlags)
			.where(eq(featureFlags.key, key));
	}

	/**
	 * Hash a string to a number (0-99) for consistent rollout determination
	 */
	private static hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = ((hash << 5) - hash) + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash) % 100;
	}

	/**
	 * Get feature flags with usage statistics
	 */
	static async getWithStats(): Promise<(FeatureFlag & { usageCount?: number })[]> {
		// For now, return flags without stats. Can be enhanced later with analytics
		const flags = await this.getAll();
		return flags.map(flag => ({ ...flag, usageCount: 0 }));
	}
}

