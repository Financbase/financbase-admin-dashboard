/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { marketplacePlugins, installedPlugins, pluginReviews } from '@/lib/db/schemas';
import { eq, and, desc, or, ilike, sql } from 'drizzle-orm';
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type MarketplacePlugin = InferSelectModel<typeof marketplacePlugins>;
export type InstalledPlugin = InferSelectModel<typeof installedPlugins>;
export type PluginReview = InferSelectModel<typeof pluginReviews>;

export type NewMarketplacePlugin = InferInsertModel<typeof marketplacePlugins>;
export type NewInstalledPlugin = InferInsertModel<typeof installedPlugins>;
export type NewPluginReview = InferInsertModel<typeof pluginReviews>;

export class MarketplaceService {
	/**
	 * Get marketplace plugins
	 */
	static async getPlugins(options?: {
		category?: string;
		isApproved?: boolean;
		isActive?: boolean;
		isOfficial?: boolean;
		search?: string;
		limit?: number;
		offset?: number;
	}): Promise<MarketplacePlugin[]> {
		const conditions = [];

		if (options?.category) {
			conditions.push(eq(marketplacePlugins.category, options.category));
		}

		if (options?.isApproved !== undefined) {
			conditions.push(eq(marketplacePlugins.isApproved, options.isApproved));
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(marketplacePlugins.isActive, options.isActive));
		}

		if (options?.isOfficial !== undefined) {
			conditions.push(eq(marketplacePlugins.isOfficial, options.isOfficial));
		}

		if (options?.search) {
			conditions.push(
				or(
					ilike(marketplacePlugins.name, `%${options.search}%`),
					ilike(marketplacePlugins.description, `%${options.search}%`)
				)!
			);
		}

		let query = db
			.select()
			.from(marketplacePlugins)
			.where(conditions.length > 0 ? and(...conditions) : undefined)
			.orderBy(desc(marketplacePlugins.downloadCount), desc(marketplacePlugins.rating));

		if (options?.limit) {
			query = query.limit(options.limit) as any;
		}

		if (options?.offset) {
			query = query.offset(options.offset) as any;
		}

		return await query;
	}

	/**
	 * Get a single plugin by ID or slug
	 */
	static async getPlugin(identifier: number | string): Promise<MarketplacePlugin | null> {
		if (typeof identifier === 'number') {
			const result = await db
				.select()
				.from(marketplacePlugins)
				.where(eq(marketplacePlugins.id, identifier))
				.limit(1);
			return result[0] || null;
		} else {
			const result = await db
				.select()
				.from(marketplacePlugins)
				.where(eq(marketplacePlugins.slug, identifier))
				.limit(1);
			return result[0] || null;
		}
	}

	/**
	 * Get user's installed plugins
	 */
	static async getInstalledPlugins(
		userId: string,
		options?: {
			organizationId?: string;
			isActive?: boolean;
			isEnabled?: boolean;
		}
	): Promise<InstalledPlugin[]> {
		const conditions = [eq(installedPlugins.userId, userId)];

		if (options?.organizationId) {
			conditions.push(eq(installedPlugins.organizationId, options.organizationId));
		}

		if (options?.isActive !== undefined) {
			conditions.push(eq(installedPlugins.isActive, options.isActive));
		}

		if (options?.isEnabled !== undefined) {
			conditions.push(eq(installedPlugins.isEnabled, options.isEnabled));
		}

		return await db
			.select()
			.from(installedPlugins)
			.where(and(...conditions))
			.orderBy(desc(installedPlugins.installedAt));
	}

	/**
	 * Install a plugin
	 */
	static async installPlugin(
		pluginId: number,
		userId: string,
		data: {
			organizationId?: string;
			settings?: Record<string, any>;
			permissions?: string[];
		}
	): Promise<InstalledPlugin> {
		// Get plugin details
		const plugin = await this.getPlugin(pluginId);
		if (!plugin) {
			throw new Error('Plugin not found');
		}

		if (!plugin.isApproved || !plugin.isActive) {
			throw new Error('Plugin is not available for installation');
		}

		// Check if already installed
		const existing = await db
			.select()
			.from(installedPlugins)
			.where(
				and(
					eq(installedPlugins.pluginId, pluginId),
					eq(installedPlugins.userId, userId),
					data.organizationId
						? eq(installedPlugins.organizationId, data.organizationId)
						: sql`${installedPlugins.organizationId} IS NULL`
				)
			)
			.limit(1);

		if (existing.length > 0) {
			// Update existing installation
			const [updated] = await db
				.update(installedPlugins)
				.set({
					version: plugin.version,
					isActive: true,
					isEnabled: true,
					settings: (data.settings || {}) as any,
					permissions: (data.permissions || []) as any,
					lastUpdatedAt: new Date(),
					updatedAt: new Date(),
				})
				.where(eq(installedPlugins.id, existing[0].id))
				.returning();

			// Increment install count
			await db
				.update(marketplacePlugins)
				.set({
					installCount: sql`${marketplacePlugins.installCount} + 1`,
				})
				.where(eq(marketplacePlugins.id, pluginId));

			return updated;
		}

		// Create new installation
		const [installation] = await db
			.insert(installedPlugins)
			.values({
				userId,
				organizationId: data.organizationId || null,
				pluginId,
				version: plugin.version,
				isActive: true,
				isEnabled: true,
				settings: (data.settings || {}) as any,
				permissions: (data.permissions || []) as any,
			})
			.returning();

		// Increment install and download counts
		await db
			.update(marketplacePlugins)
			.set({
				installCount: sql`${marketplacePlugins.installCount} + 1`,
				downloadCount: sql`${marketplacePlugins.downloadCount} + 1`,
			})
			.where(eq(marketplacePlugins.id, pluginId));

		return installation;
	}

	/**
	 * Uninstall a plugin
	 */
	static async uninstallPlugin(
		installationId: number,
		userId: string
	): Promise<boolean> {
		const result = await db
			.delete(installedPlugins)
			.where(and(eq(installedPlugins.id, installationId), eq(installedPlugins.userId, userId)))
			.returning();

		if (result.length > 0) {
			// Decrement install count
			await db
				.update(marketplacePlugins)
				.set({
					installCount: sql`${marketplacePlugins.installCount} - 1`,
				})
				.where(eq(marketplacePlugins.id, result[0].pluginId));
		}

		return result.length > 0;
	}

	/**
	 * Update installed plugin settings
	 */
	static async updateInstalledPlugin(
		installationId: number,
		userId: string,
		data: Partial<{
			isEnabled: boolean;
			settings: Record<string, any>;
			permissions: string[];
		}>
	): Promise<InstalledPlugin | null> {
		const [plugin] = await db
			.update(installedPlugins)
			.set({
				...data,
				updatedAt: new Date(),
			} as any)
			.where(and(eq(installedPlugins.id, installationId), eq(installedPlugins.userId, userId)))
			.returning();

		return plugin || null;
	}

	/**
	 * Submit a plugin for review
	 */
	static async submitPlugin(
		userId: string,
		data: {
			name: string;
			slug: string;
			description: string;
			shortDescription?: string;
			version: string;
			author: string;
			authorEmail?: string;
			authorWebsite?: string;
			category: string;
			tags?: string[];
			icon?: string;
			screenshots?: string[];
			features?: string[];
			requirements?: Record<string, any>;
			compatibility?: Record<string, any>;
			isFree: boolean;
			price?: number;
			currency?: string;
			license?: string;
			pluginFile?: string;
			manifest: Record<string, any>;
			permissions?: string[];
		}
	): Promise<MarketplacePlugin> {
		const [plugin] = await db
			.insert(marketplacePlugins)
			.values({
				name: data.name,
				slug: data.slug,
				description: data.description,
				shortDescription: data.shortDescription || null,
				version: data.version,
				author: data.author,
				authorEmail: data.authorEmail || null,
				authorWebsite: data.authorWebsite || null,
				category: data.category,
				tags: (data.tags || []) as any,
				icon: data.icon || null,
				screenshots: (data.screenshots || []) as any,
				features: (data.features || []) as any,
				requirements: (data.requirements || {}) as any,
				compatibility: (data.compatibility || {}) as any,
				isFree: data.isFree,
				price: data.price || null,
				currency: data.currency || 'USD',
				license: data.license || 'Proprietary',
				pluginFile: data.pluginFile || null,
				manifest: data.manifest as any,
				permissions: (data.permissions || []) as any,
				isApproved: false,
				isActive: true,
				isOfficial: false,
			})
			.returning();

		return plugin;
	}

	/**
	 * Get revenue statistics (for plugin authors)
	 */
	static async getRevenueStats(
		userId: string,
		options?: {
			startDate?: Date;
			endDate?: Date;
		}
	): Promise<{
		totalRevenue: number;
		totalSales: number;
		plugins: Array<{
			pluginId: number;
			pluginName: string;
			revenue: number;
			sales: number;
		}>;
	}> {
		// Get user's plugins
		const userPlugins = await db
			.select()
			.from(marketplacePlugins)
			.where(eq(marketplacePlugins.author, userId));

		// Calculate revenue (this would typically come from a transactions table)
		// For now, return mock structure
		return {
			totalRevenue: 0,
			totalSales: 0,
			plugins: userPlugins.map(plugin => ({
				pluginId: plugin.id,
				pluginName: plugin.name,
				revenue: 0,
				sales: 0,
			})),
		};
	}
}

