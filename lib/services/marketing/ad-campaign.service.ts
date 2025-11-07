/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db/connection";
import {
	type AdboardAd as Ad,
	type AdboardAudience as AdAudience,
	type AdboardBudget as AdBudget,
	type AdboardCampaign as AdCampaign,
	type AdboardAdCreative as AdCreative,
	type AdboardPerformanceMetric as AdPerformance,
	adboardAudiences as adAudiences,
	adboardBudgets as adBudgets,
	adboardCampaigns as adCampaigns,
	adboardAdCreatives as adCreatives,
	adboardPerformanceMetrics as adPerformance,
	adboardAds as ads,
} from "@/lib/db/schemas/adboard.schema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	Calendar,
	Clock,
	LayoutDashboard,
	PiggyBank,
	Search,
	Trash2,
	TrendingUp,
} from "lucide-react";

export interface CreateCampaignData {
	userId: string;
	name: string;
	description?: string;
	platform:
		| "google_ads"
		| "facebook_ads"
		| "linkedin_ads"
		| "tiktok_ads"
		| "twitter_ads"
		| "instagram_ads"
		| "youtube_ads"
		| "snapchat_ads";
	objective:
		| "awareness"
		| "traffic"
		| "engagement"
		| "leads"
		| "sales"
		| "app_installs"
		| "video_views"
		| "conversions";
	budgetType: "daily" | "lifetime" | "monthly";
	dailyBudget?: number;
	lifetimeBudget?: number;
	monthlyBudget?: number;
	targetAudience?: any;
	demographics?: any;
	interests?: any;
	behaviors?: any;
	locations?: any;
	languages?: any;
	startDate?: Date;
	endDate?: Date;
	schedule?: any;
	optimizationGoal?:
		| "clicks"
		| "impressions"
		| "conversions"
		| "cost_per_click"
		| "cost_per_conversion"
		| "return_on_ad_spend"
		| "reach"
		| "frequency";
	targetCpa?: number;
	targetRoas?: number;
	metadata?: any;
}

export interface UpdateCampaignData {
	name?: string;
	description?: string;
	status?: "draft" | "active" | "paused" | "completed" | "cancelled";
	dailyBudget?: number;
	lifetimeBudget?: number;
	monthlyBudget?: number;
	targetAudience?: any;
	demographics?: any;
	interests?: any;
	behaviors?: any;
	locations?: any;
	languages?: any;
	startDate?: Date;
	endDate?: Date;
	schedule?: any;
	optimizationGoal?:
		| "clicks"
		| "impressions"
		| "conversions"
		| "cost_per_click"
		| "cost_per_conversion"
		| "return_on_ad_spend"
		| "reach"
		| "frequency";
	targetCpa?: number;
	targetRoas?: number;
	metadata?: any;
}

export interface CampaignFilters {
	userId?: string;
	platform?: string;
	status?: string;
	objective?: string;
	startDate?: Date;
	endDate?: Date;
	search?: string;
}

export interface CampaignMetrics {
	totalSpend: number;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	totalReach: number;
	averageCtr: number;
	averageCpc: number;
	averageCpm: number;
	averageCpa: number;
	averageRoas: number;
}

export class AdCampaignService {
	// Create a new campaign
	async createCampaign(data: CreateCampaignData): Promise<AdCampaign> {
		const [campaign] = await db
			.insert(adCampaigns)
			.values({
				userId: data.userId,
				name: data.name,
				description: data.description,
				platform: data.platform,
				objective: data.objective,
				budgetType: data.budgetType,
				dailyBudget: data.dailyBudget?.toString(),
				lifetimeBudget: data.lifetimeBudget?.toString(),
				monthlyBudget: data.monthlyBudget?.toString(),
				targetAudience: data.targetAudience,
				demographics: data.demographics,
				interests: data.interests,
				behaviors: data.behaviors,
				locations: data.locations,
				languages: data.languages,
				startDate: data.startDate,
				endDate: data.endDate,
				schedule: data.schedule,
				optimizationGoal: data.optimizationGoal,
				targetCpa: data.targetCpa?.toString(),
				targetRoas: data.targetRoas?.toString(),
				metadata: data.metadata,
			})
			.returning();

		return campaign;
	}

	// Get campaign by ID
	async getCampaignById(
		id: string,
		userId: string,
	): Promise<AdCampaign | null> {
		const [campaign] = await db
			.select()
			.from(adCampaigns)
			.where(and(eq(adCampaigns.id, id), eq(adCampaigns.userId, userId)))
			.limit(1);

		return campaign || null;
	}

	// Get campaigns with filters
	async getCampaigns(filters: CampaignFilters = {}): Promise<AdCampaign[]> {
		let query = db.select().from(adCampaigns);

		const conditions = [];

		if (filters.userId) {
			conditions.push(eq(adCampaigns.userId, filters.userId));
		}

		if (filters.platform) {
			conditions.push(eq(adCampaigns.platform, filters.platform as any));
		}

		if (filters.status) {
			conditions.push(eq(adCampaigns.status, filters.status as any));
		}

		if (filters.objective) {
			conditions.push(eq(adCampaigns.objective, filters.objective as any));
		}

		if (filters.startDate) {
			conditions.push(gte(adCampaigns.startDate, filters.startDate));
		}

		if (filters.endDate) {
			conditions.push(lte(adCampaigns.endDate, filters.endDate));
		}

		if (filters.search) {
			conditions.push(
				sql`(${adCampaigns.name} ILIKE ${`%${filters.search}%`} OR ${adCampaigns.description} ILIKE ${`%${filters.search}%`})`,
			);
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(adCampaigns.createdAt));
	}

	// Update campaign
	async updateCampaign(
		id: string,
		userId: string,
		data: UpdateCampaignData,
	): Promise<AdCampaign | null> {
		const [campaign] = await db
			.update(adCampaigns)
			.set({
				...data,
				dailyBudget: data.dailyBudget?.toString(),
				lifetimeBudget: data.lifetimeBudget?.toString(),
				monthlyBudget: data.monthlyBudget?.toString(),
				targetCpa: data.targetCpa?.toString(),
				targetRoas: data.targetRoas?.toString(),
				updatedAt: new Date(),
			})
			.where(and(eq(adCampaigns.id, id), eq(adCampaigns.userId, userId)))
			.returning();

		return campaign || null;
	}

	// Delete campaign
	async deleteCampaign(id: string, userId: string): Promise<boolean> {
		const result = await db
			.delete(adCampaigns)
			.where(and(eq(adCampaigns.id, id), eq(adCampaigns.userId, userId)));

		return result.rowCount > 0;
	}

	// Get campaign metrics
	async getCampaignMetrics(
		campaignId: string,
		userId: string,
	): Promise<CampaignMetrics> {
		const campaign = await this.getCampaignById(campaignId, userId);
		if (!campaign) {
			throw new Error("Campaign not found");
		}

		// Get performance data for the campaign
		const performanceData = await db
			.select({
				totalSpend: sql<number>`COALESCE(SUM(${adPerformance.spend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adPerformance.impressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adPerformance.clicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adPerformance.conversions}), 0)`,
				totalReach: sql<number>`COALESCE(SUM(${adPerformance.reach}), 0)`,
			})
			.from(adPerformance)
			.where(eq(adPerformance.campaignId, campaignId));

		const metrics = performanceData[0];

		// Calculate averages
		const averageCtr =
			metrics.totalClicks > 0
				? (metrics.totalClicks / metrics.totalImpressions) * 100
				: 0;
		const averageCpc =
			metrics.totalClicks > 0 ? metrics.totalSpend / metrics.totalClicks : 0;
		const averageCpm =
			metrics.totalImpressions > 0
				? (metrics.totalSpend / metrics.totalImpressions) * 1000
				: 0;
		const averageCpa =
			metrics.totalConversions > 0
				? metrics.totalSpend / metrics.totalConversions
				: 0;
		const averageRoas =
			metrics.totalSpend > 0
				? (metrics.totalSpend / metrics.totalSpend) * 100
				: 0; // This would need conversion value data

		return {
			totalSpend: metrics.totalSpend,
			totalImpressions: metrics.totalImpressions,
			totalClicks: metrics.totalClicks,
			totalConversions: metrics.totalConversions,
			totalReach: metrics.totalReach,
			averageCtr,
			averageCpc,
			averageCpm,
			averageCpa,
			averageRoas,
		};
	}

	// Get campaign performance over time
	async getCampaignPerformance(
		campaignId: string,
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<AdPerformance[]> {
		const campaign = await this.getCampaignById(campaignId, userId);
		if (!campaign) {
			throw new Error("Campaign not found");
		}

		let query = db
			.select()
			.from(adPerformance)
			.where(eq(adPerformance.campaignId, campaignId));

		if (startDate) {
			query = query.where(gte(adPerformance.date, startDate));
		}

		if (endDate) {
			query = query.where(lte(adPerformance.date, endDate));
		}

		return await query.orderBy(asc(adPerformance.date));
	}

	// Get campaign budget information
	async getCampaignBudget(
		campaignId: string,
		userId: string,
	): Promise<AdBudget | null> {
		const campaign = await this.getCampaignById(campaignId, userId);
		if (!campaign) {
			throw new Error("Campaign not found");
		}

		const [budget] = await db
			.select()
			.from(adBudgets)
			.where(
				and(eq(adBudgets.campaignId, campaignId), eq(adBudgets.userId, userId)),
			)
			.limit(1);

		return budget || null;
	}

	// Update campaign budget
	async updateCampaignBudget(
		campaignId: string,
		userId: string,
		budgetData: Partial<AdBudget>,
	): Promise<AdBudget | null> {
		const campaign = await this.getCampaignById(campaignId, userId);
		if (!campaign) {
			throw new Error("Campaign not found");
		}

		const [budget] = await db
			.update(adBudgets)
			.set({
				...budgetData,
				totalBudget: budgetData.totalBudget?.toString(),
				allocatedBudget: budgetData.allocatedBudget?.toString(),
				remainingBudget: budgetData.remainingBudget?.toString(),
				targetRoas: budgetData.targetRoas?.toString(),
				targetCpa: budgetData.targetCpa?.toString(),
				expectedSpend: budgetData.expectedSpend?.toString(),
				actualSpend: budgetData.actualSpend?.toString(),
				updatedAt: new Date(),
			})
			.where(
				and(eq(adBudgets.campaignId, campaignId), eq(adBudgets.userId, userId)),
			)
			.returning();

		return budget || null;
	}

	// Get campaigns by platform
	async getCampaignsByPlatform(
		platform: string,
		userId: string,
	): Promise<AdCampaign[]> {
		return await db
			.select()
			.from(adCampaigns)
			.where(
				and(
					eq(adCampaigns.platform, platform as any),
					eq(adCampaigns.userId, userId),
				),
			)
			.orderBy(desc(adCampaigns.createdAt));
	}

	// Get active campaigns
	async getActiveCampaigns(userId: string): Promise<AdCampaign[]> {
		return await db
			.select()
			.from(adCampaigns)
			.where(
				and(eq(adCampaigns.status, "active"), eq(adCampaigns.userId, userId)),
			)
			.orderBy(desc(adCampaigns.createdAt));
	}

	// Pause campaign
	async pauseCampaign(id: string, userId: string): Promise<AdCampaign | null> {
		return await this.updateCampaign(id, userId, { status: "paused" });
	}

	// Resume campaign
	async resumeCampaign(id: string, userId: string): Promise<AdCampaign | null> {
		return await this.updateCampaign(id, userId, { status: "active" });
	}

	// Get campaign summary for dashboard
	async getCampaignSummary(userId: string): Promise<{
		totalCampaigns: number;
		activeCampaigns: number;
		totalSpend: number;
		totalImpressions: number;
		totalClicks: number;
		totalConversions: number;
		averageCtr: number;
		averageCpc: number;
		averageRoas: number;
	}> {
		const campaigns = await db
			.select()
			.from(adCampaigns)
			.where(eq(adCampaigns.userId, userId));

		const activeCampaigns = campaigns.filter(
			(c) => c.status === "active",
		).length;

		// Calculate totals from campaign data
		const totalSpend = campaigns.reduce(
			(sum, c) => sum + Number.parseFloat(c.totalSpend || "0"),
			0,
		);
		const totalImpressions = campaigns.reduce(
			(sum, c) => sum + (c.totalImpressions || 0),
			0,
		);
		const totalClicks = campaigns.reduce(
			(sum, c) => sum + (c.totalClicks || 0),
			0,
		);
		const totalConversions = campaigns.reduce(
			(sum, c) => sum + (c.totalConversions || 0),
			0,
		);

		const averageCtr =
			totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
		const averageCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
		const averageRoas = totalSpend > 0 ? (totalSpend / totalSpend) * 100 : 0; // Would need conversion value

		return {
			totalCampaigns: campaigns.length,
			activeCampaigns,
			totalSpend,
			totalImpressions,
			totalClicks,
			totalConversions,
			averageCtr,
			averageCpc,
			averageRoas,
		};
	}
}
