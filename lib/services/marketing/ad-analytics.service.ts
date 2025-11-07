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
	adboardBudgets,
	adboardCampaigns,
	adboardAdCreatives,
	adboardAds,
	adboardPerformanceMetrics,
} from "@/lib/db/schemas/adboard.schema";
import {
	and,
	asc,
	avg,
	count,
	desc,
	eq,
	gte,
	lte,
	sql,
	sum,
} from "drizzle-orm";
import { Clock, PiggyBank } from "lucide-react";

export interface PlatformPerformance {
	platform: string;
	totalSpend: number;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	averageCtr: number;
	averageCpc: number;
	averageCpm: number;
	averageCpa: number;
	averageRoas: number;
	campaignCount: number;
}

export interface CampaignPerformance {
	campaignId: string;
	campaignName: string;
	platform: string;
	objective: string;
	status: string;
	totalSpend: number;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	ctr: number;
	cpc: number;
	cpm: number;
	cpa: number;
	roas: number;
	budgetUtilization: number;
}

export interface PerformanceTrend {
	date: string;
	spend: number;
	impressions: number;
	clicks: number;
	conversions: number;
	ctr: number;
	cpc: number;
	cpm: number;
	cpa: number;
	roas: number;
}

export interface AttributionData {
	campaignId: string;
	campaignName: string;
	platform: string;
	touchpoints: number;
	firstTouch: number;
	lastTouch: number;
	assistedConversions: number;
	directConversions: number;
	totalConversions: number;
	attributionValue: number;
}

export interface ROIAnalysis {
	totalSpend: number;
	totalRevenue: number;
	totalConversions: number;
	roas: number;
	cpa: number;
	ltv: number; // Lifetime value
	paybackPeriod: number; // in days
	profitMargin: number;
	roi: number;
}

export interface AudiencePerformance {
	audienceId: string;
	audienceName: string;
	audienceType: string;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	ctr: number;
	cpc: number;
	cpa: number;
	roas: number;
	reach: number;
	frequency: number;
}

export class AdAnalyticsService {
	// Get platform performance comparison
	async getPlatformPerformance(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<PlatformPerformance[]> {
		const conditions = [eq(adboardPerformanceMetrics.userId, userId)];
		
		if (startDate) {
			conditions.push(gte(adboardPerformanceMetrics.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(adboardPerformanceMetrics.date, endDate));
		}

		const results = await db
			.select({
				platform: adboardPerformanceMetrics.platform,
				totalSpend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				averageCtr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
				averageCpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
				averageCpm: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpm}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
				campaignCount: sql<number>`COUNT(DISTINCT ${adboardPerformanceMetrics.campaignId})`,
			})
			.from(adboardPerformanceMetrics)
			.where(and(...conditions))
			.groupBy(adboardPerformanceMetrics.platform);

		return results.map((result) => ({
			platform: result.platform,
			totalSpend: result.totalSpend,
			totalImpressions: result.totalImpressions,
			totalClicks: result.totalClicks,
			totalConversions: result.totalConversions,
			averageCtr: result.averageCtr,
			averageCpc: result.averageCpc,
			averageCpm: result.averageCpm,
			averageCpa: result.averageCpa,
			averageRoas: result.averageRoas,
			campaignCount: result.campaignCount,
		}));
	}

	// Get campaign performance ranking
	async getCampaignPerformanceRanking(
		userId: string,
		metric: "roas" | "ctr" | "cpc" | "cpa" | "conversions" = "roas",
		limit = 10,
	): Promise<CampaignPerformance[]> {
		const campaignsWithMetrics = await db
			.select({
				id: adboardCampaigns.id,
				name: adboardCampaigns.name,
				platform: adboardCampaigns.platform || adboardPerformanceMetrics.platform,
				objective: adboardCampaigns.objective,
				status: adboardCampaigns.status,
				budget: adboardCampaigns.budget,
				spent: adboardCampaigns.spent,
				totalSpend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				ctr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
				cpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
				cpm: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpm}), 0)`,
				cpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
				roas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
			})
			.from(adboardCampaigns)
			.leftJoin(adboardPerformanceMetrics, eq(adboardCampaigns.id, adboardPerformanceMetrics.campaignId))
			.where(eq(adboardCampaigns.userId, userId))
			.groupBy(
				adboardCampaigns.id,
				adboardCampaigns.name,
				adboardCampaigns.platform,
				adboardCampaigns.objective,
				adboardCampaigns.status,
				adboardCampaigns.budget,
				adboardCampaigns.spent,
				adboardPerformanceMetrics.platform,
			)
			.orderBy(
				metric === "roas"
					? desc(sql`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`)
					: metric === "ctr"
						? desc(sql`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`)
						: metric === "cpc"
							? asc(sql`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`)
							: metric === "cpa"
								? asc(sql`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`)
								: desc(sql`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`)
			)
			.limit(limit);

		return campaignsWithMetrics.map((campaign) => ({
			campaignId: campaign.id,
			campaignName: campaign.name,
			platform: campaign.platform || "unknown",
			objective: campaign.objective,
			status: campaign.status,
			totalSpend: Number(campaign.totalSpend),
			totalImpressions: Number(campaign.totalImpressions),
			totalClicks: Number(campaign.totalClicks),
			totalConversions: Number(campaign.totalConversions),
			ctr: Number(campaign.ctr),
			cpc: Number(campaign.cpc),
			cpm: Number(campaign.cpm),
			cpa: Number(campaign.cpa),
			roas: Number(campaign.roas),
			budgetUtilization:
				campaign.budget && Number(campaign.budget) > 0
					? (Number(campaign.spent) / Number(campaign.budget)) * 100
					: 0,
		}));
	}

	// Get performance trends over time
	async getPerformanceTrends(
		userId: string,
		startDate: Date,
		endDate: Date,
		granularity: "daily" | "weekly" | "monthly" = "daily",
	): Promise<PerformanceTrend[]> {
		const dateFormat =
			granularity === "daily"
				? "YYYY-MM-DD"
				: granularity === "weekly"
					? 'YYYY-"W"WW'
					: "YYYY-MM";

		const trends = await db
			.select({
				date: sql<string>`TO_CHAR(${adboardPerformanceMetrics.date}, ${dateFormat})`,
				spend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				impressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
				clicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
				conversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				ctr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
				cpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
				cpm: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpm}), 0)`,
				cpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
				roas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
			})
			.from(adboardPerformanceMetrics)
			.innerJoin(adboardCampaigns, eq(adboardPerformanceMetrics.campaignId, adboardCampaigns.id))
			.where(
				and(
					eq(adboardCampaigns.userId, userId),
					gte(adboardPerformanceMetrics.date, startDate),
					lte(adboardPerformanceMetrics.date, endDate),
				),
			)
			.groupBy(sql`TO_CHAR(${adboardPerformanceMetrics.date}, ${dateFormat})`)
			.orderBy(asc(sql`TO_CHAR(${adboardPerformanceMetrics.date}, ${dateFormat})`));

		return trends.map((trend) => ({
			date: trend.date,
			spend: trend.spend,
			impressions: trend.impressions,
			clicks: trend.clicks,
			conversions: trend.conversions,
			ctr: trend.ctr,
			cpc: trend.cpc,
			cpm: trend.cpm,
			cpa: trend.cpa,
			roas: trend.roas,
		}));
	}

	// Get attribution analysis
	async getAttributionAnalysis(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<AttributionData[]> {
		const conditions = [eq(adboardCampaigns.userId, userId)];
		
		if (startDate) {
			conditions.push(gte(adboardPerformanceMetrics.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(adboardPerformanceMetrics.date, endDate));
		}

		const results = await db
			.select({
				campaignId: adboardCampaigns.id,
				campaignName: adboardCampaigns.name,
				platform: adboardCampaigns.platform || adboardPerformanceMetrics.platform,
				touchpoints: sql<number>`COUNT(DISTINCT ${adboardPerformanceMetrics.date})`,
				firstTouch: sql<number>`COUNT(CASE WHEN ${adboardPerformanceMetrics.date} = MIN(${adboardPerformanceMetrics.date}) THEN 1 END)`,
				lastTouch: sql<number>`COUNT(CASE WHEN ${adboardPerformanceMetrics.date} = MAX(${adboardPerformanceMetrics.date}) THEN 1 END)`,
				assistedConversions: sql<number>`COUNT(CASE WHEN ${adboardPerformanceMetrics.conversions} > 0 AND ${adboardPerformanceMetrics.date} != MIN(${adboardPerformanceMetrics.date}) THEN 1 END)`,
				directConversions: sql<number>`COUNT(CASE WHEN ${adboardPerformanceMetrics.conversions} > 0 AND ${adboardPerformanceMetrics.date} = MIN(${adboardPerformanceMetrics.date}) THEN 1 END)`,
				totalConversions: sql<number>`SUM(${adboardPerformanceMetrics.conversions})`,
				attributionValue: sql<number>`SUM(${adboardPerformanceMetrics.revenue})`,
			})
			.from(adboardPerformanceMetrics)
			.innerJoin(adboardCampaigns, eq(adboardPerformanceMetrics.campaignId, adboardCampaigns.id))
			.where(and(...conditions))
			.groupBy(
				adboardCampaigns.id,
				adboardCampaigns.name,
				adboardPerformanceMetrics.platform,
			);

		return results.map((result) => ({
			campaignId: result.campaignId,
			campaignName: result.campaignName,
			platform: result.platform,
			touchpoints: result.touchpoints,
			firstTouch: result.firstTouch,
			lastTouch: result.lastTouch,
			assistedConversions: result.assistedConversions,
			directConversions: result.directConversions,
			totalConversions: result.totalConversions,
			attributionValue: result.attributionValue,
		}));
	}

	// Get ROI analysis
	async getROIAnalysis(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<ROIAnalysis> {
		const conditions = [eq(adboardPerformanceMetrics.userId, userId)];
		
		if (startDate) {
			conditions.push(gte(adboardPerformanceMetrics.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(adboardPerformanceMetrics.date, endDate));
		}

		const [result] = await db
			.select({
				totalSpend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
			})
			.from(adboardPerformanceMetrics)
			.where(and(...conditions));

		const totalSpend = result.totalSpend;
		const totalConversions = result.totalConversions;
		const averageCpa = result.averageCpa;
		const averageRoas = result.averageRoas;

		// Calculate derived metrics
		const totalRevenue = totalSpend * averageRoas;
		const ltv = totalConversions > 0 ? totalRevenue / totalConversions : 0;
		const paybackPeriod = averageCpa > 0 ? averageCpa / (ltv / 30) : 0; // Assuming 30-day LTV
		const profitMargin =
			totalSpend > 0 ? ((totalRevenue - totalSpend) / totalRevenue) * 100 : 0;
		const roi =
			totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

		return {
			totalSpend,
			totalRevenue,
			totalConversions,
			roas: averageRoas,
			cpa: averageCpa,
			ltv,
			paybackPeriod,
			profitMargin,
			roi,
		};
	}

	// Get audience performance
	async getAudiencePerformance(userId: string): Promise<AudiencePerformance[]> {
		// This would typically join with audience data
		// For now, returning mock data structure
		return [];
	}

	// Get cross-platform performance summary
	async getCrossPlatformSummary(userId: string): Promise<{
		totalSpend: number;
		totalImpressions: number;
		totalClicks: number;
		totalConversions: number;
		averageCtr: number;
		averageCpc: number;
		averageCpa: number;
		averageRoas: number;
		platformCount: number;
		campaignCount: number;
	}> {
		const [summary] = await db
			.select({
				totalSpend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				averageCtr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
				averageCpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
				platformCount: sql<number>`COUNT(DISTINCT ${adboardPerformanceMetrics.platform})`,
				campaignCount: sql<number>`COUNT(DISTINCT ${adboardCampaigns.id})`,
			})
			.from(adboardPerformanceMetrics)
			.innerJoin(adboardCampaigns, eq(adboardPerformanceMetrics.campaignId, adboardCampaigns.id))
			.where(eq(adboardCampaigns.userId, userId));

		return {
			totalSpend: summary.totalSpend,
			totalImpressions: summary.totalImpressions,
			totalClicks: summary.totalClicks,
			totalConversions: summary.totalConversions,
			averageCtr: summary.averageCtr,
			averageCpc: summary.averageCpc,
			averageCpa: summary.averageCpa,
			averageRoas: summary.averageRoas,
			platformCount: summary.platformCount,
			campaignCount: summary.campaignCount,
		};
	}

	// Get performance by device
	async getPerformanceByDevice(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<
		{
			device: string;
			spend: number;
			impressions: number;
			clicks: number;
			conversions: number;
			ctr: number;
			cpc: number;
			cpa: number;
		}[]
	> {
		const conditions = [eq(adboardCampaigns.userId, userId)];
		
		if (startDate) {
			conditions.push(gte(adboardPerformanceMetrics.date, startDate));
		}

		if (endDate) {
			conditions.push(lte(adboardPerformanceMetrics.date, endDate));
		}

		// Note: device field doesn't exist in adboardPerformanceMetrics, using platform as proxy
		const results = await db
			.select({
				device: adboardPerformanceMetrics.platform, // Using platform as device proxy
				spend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
				impressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
				clicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
				conversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
				ctr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
				cpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
				cpa: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpa}), 0)`,
			})
			.from(adboardPerformanceMetrics)
			.innerJoin(adboardCampaigns, eq(adboardPerformanceMetrics.campaignId, adboardCampaigns.id))
			.where(and(...conditions))
			.groupBy(adboardPerformanceMetrics.platform)
			.orderBy(desc(sql`SUM(${adboardPerformanceMetrics.spend})`));

		return results.map((result) => ({
			device: result.device || "Unknown",
			spend: result.spend,
			impressions: result.impressions,
			clicks: result.clicks,
			conversions: result.conversions,
			ctr: result.ctr,
			cpc: result.cpc,
			cpa: result.cpa,
		}));
	}

	// Calculate budget utilization
	private calculateBudgetUtilization(
		actualSpend: number,
		dailyBudget: number,
	): number {
		if (dailyBudget === 0) return 0;
		return Math.min((actualSpend / dailyBudget) * 100, 100);
	}
}
