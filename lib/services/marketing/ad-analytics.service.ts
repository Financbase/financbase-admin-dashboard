import { db } from "@/lib/db/connection";
import {
	adBudgets,
	adCampaigns,
	adCreatives,
	adGroups,
	adPerformance,
	ads,
} from "@/lib/db/schema-adboard";
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
		let query = db
			.select({
				platform: adCampaigns.platform,
				totalSpend: sql<number>`COALESCE(SUM(${adCampaigns.totalSpend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adCampaigns.totalImpressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adCampaigns.totalClicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adCampaigns.totalConversions}), 0)`,
				averageCtr: sql<number>`COALESCE(AVG(${adCampaigns.ctr}), 0)`,
				averageCpc: sql<number>`COALESCE(AVG(${adCampaigns.cpc}), 0)`,
				averageCpm: sql<number>`COALESCE(AVG(${adCampaigns.cpm}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adCampaigns.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adCampaigns.roas}), 0)`,
				campaignCount: sql<number>`COUNT(${adCampaigns.id})`,
			})
			.from(adCampaigns)
			.where(eq(adCampaigns.userId, userId));

		if (startDate) {
			query = query.where(gte(adCampaigns.startDate, startDate));
		}

		if (endDate) {
			query = query.where(lte(adCampaigns.endDate, endDate));
		}

		const results = await query.groupBy(adCampaigns.platform);

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
		const orderBy =
			metric === "roas"
				? desc(adCampaigns.roas)
				: metric === "ctr"
					? desc(adCampaigns.ctr)
					: metric === "cpc"
						? asc(adCampaigns.cpc)
						: metric === "cpa"
							? asc(adCampaigns.cpa)
							: desc(adCampaigns.totalConversions);

		const campaigns = await db
			.select({
				id: adCampaigns.id,
				name: adCampaigns.name,
				platform: adCampaigns.platform,
				objective: adCampaigns.objective,
				status: adCampaigns.status,
				totalSpend: adCampaigns.totalSpend,
				totalImpressions: adCampaigns.totalImpressions,
				totalClicks: adCampaigns.totalClicks,
				totalConversions: adCampaigns.totalConversions,
				ctr: adCampaigns.ctr,
				cpc: adCampaigns.cpc,
				cpm: adCampaigns.cpm,
				cpa: adCampaigns.cpa,
				roas: adCampaigns.roas,
				dailyBudget: adCampaigns.dailyBudget,
			})
			.from(adCampaigns)
			.where(eq(adCampaigns.userId, userId))
			.orderBy(orderBy)
			.limit(limit);

		return campaigns.map((campaign) => ({
			campaignId: campaign.id,
			campaignName: campaign.name,
			platform: campaign.platform,
			objective: campaign.objective,
			status: campaign.status,
			totalSpend: Number.parseFloat(campaign.totalSpend || "0"),
			totalImpressions: campaign.totalImpressions || 0,
			totalClicks: campaign.totalClicks || 0,
			totalConversions: campaign.totalConversions || 0,
			ctr: Number.parseFloat(campaign.ctr || "0"),
			cpc: Number.parseFloat(campaign.cpc || "0"),
			cpm: Number.parseFloat(campaign.cpm || "0"),
			cpa: Number.parseFloat(campaign.cpa || "0"),
			roas: Number.parseFloat(campaign.roas || "0"),
			budgetUtilization: this.calculateBudgetUtilization(
				Number.parseFloat(campaign.totalSpend || "0"),
				Number.parseFloat(campaign.dailyBudget || "0"),
			),
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
				date: sql<string>`TO_CHAR(${adPerformance.date}, ${dateFormat})`,
				spend: sql<number>`COALESCE(SUM(${adPerformance.spend}), 0)`,
				impressions: sql<number>`COALESCE(SUM(${adPerformance.impressions}), 0)`,
				clicks: sql<number>`COALESCE(SUM(${adPerformance.clicks}), 0)`,
				conversions: sql<number>`COALESCE(SUM(${adPerformance.conversions}), 0)`,
				ctr: sql<number>`COALESCE(AVG(${adPerformance.ctr}), 0)`,
				cpc: sql<number>`COALESCE(AVG(${adPerformance.cpc}), 0)`,
				cpm: sql<number>`COALESCE(AVG(${adPerformance.cpm}), 0)`,
				cpa: sql<number>`COALESCE(AVG(${adPerformance.cpa}), 0)`,
				roas: sql<number>`COALESCE(AVG(${adPerformance.roas}), 0)`,
			})
			.from(adPerformance)
			.innerJoin(adCampaigns, eq(adPerformance.campaignId, adCampaigns.id))
			.where(
				and(
					eq(adCampaigns.userId, userId),
					gte(adPerformance.date, startDate),
					lte(adPerformance.date, endDate),
				),
			)
			.groupBy(sql`TO_CHAR(${adPerformance.date}, ${dateFormat})`)
			.orderBy(asc(sql`TO_CHAR(${adPerformance.date}, ${dateFormat})`));

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
		let query = db
			.select({
				campaignId: adCampaigns.id,
				campaignName: adCampaigns.name,
				platform: adCampaigns.platform,
				touchpoints: sql<number>`COUNT(DISTINCT ${adPerformance.date})`,
				firstTouch: sql<number>`COUNT(CASE WHEN ${adPerformance.date} = MIN(${adPerformance.date}) THEN 1 END)`,
				lastTouch: sql<number>`COUNT(CASE WHEN ${adPerformance.date} = MAX(${adPerformance.date}) THEN 1 END)`,
				assistedConversions: sql<number>`COUNT(CASE WHEN ${adPerformance.conversions} > 0 AND ${adPerformance.date} != MIN(${adPerformance.date}) THEN 1 END)`,
				directConversions: sql<number>`COUNT(CASE WHEN ${adPerformance.conversions} > 0 AND ${adPerformance.date} = MIN(${adPerformance.date}) THEN 1 END)`,
				totalConversions: sql<number>`SUM(${adPerformance.conversions})`,
				attributionValue: sql<number>`SUM(${adPerformance.conversionValue || 0})`,
			})
			.from(adPerformance)
			.innerJoin(adCampaigns, eq(adPerformance.campaignId, adCampaigns.id))
			.where(eq(adCampaigns.userId, userId));

		if (startDate) {
			query = query.where(gte(adPerformance.date, startDate));
		}

		if (endDate) {
			query = query.where(lte(adPerformance.date, endDate));
		}

		const results = await query.groupBy(
			adCampaigns.id,
			adCampaigns.name,
			adCampaigns.platform,
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
		let query = db
			.select({
				totalSpend: sql<number>`COALESCE(SUM(${adCampaigns.totalSpend}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adCampaigns.totalConversions}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adCampaigns.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adCampaigns.roas}), 0)`,
			})
			.from(adCampaigns)
			.where(eq(adCampaigns.userId, userId));

		if (startDate) {
			query = query.where(gte(adCampaigns.startDate, startDate));
		}

		if (endDate) {
			query = query.where(lte(adCampaigns.endDate, endDate));
		}

		const [result] = await query;

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
				totalSpend: sql<number>`COALESCE(SUM(${adCampaigns.totalSpend}), 0)`,
				totalImpressions: sql<number>`COALESCE(SUM(${adCampaigns.totalImpressions}), 0)`,
				totalClicks: sql<number>`COALESCE(SUM(${adCampaigns.totalClicks}), 0)`,
				totalConversions: sql<number>`COALESCE(SUM(${adCampaigns.totalConversions}), 0)`,
				averageCtr: sql<number>`COALESCE(AVG(${adCampaigns.ctr}), 0)`,
				averageCpc: sql<number>`COALESCE(AVG(${adCampaigns.cpc}), 0)`,
				averageCpa: sql<number>`COALESCE(AVG(${adCampaigns.cpa}), 0)`,
				averageRoas: sql<number>`COALESCE(AVG(${adCampaigns.roas}), 0)`,
				platformCount: sql<number>`COUNT(DISTINCT ${adCampaigns.platform})`,
				campaignCount: sql<number>`COUNT(${adCampaigns.id})`,
			})
			.from(adCampaigns)
			.where(eq(adCampaigns.userId, userId));

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
		let query = db
			.select({
				device: adPerformance.device,
				spend: sql<number>`COALESCE(SUM(${adPerformance.spend}), 0)`,
				impressions: sql<number>`COALESCE(SUM(${adPerformance.impressions}), 0)`,
				clicks: sql<number>`COALESCE(SUM(${adPerformance.clicks}), 0)`,
				conversions: sql<number>`COALESCE(SUM(${adPerformance.conversions}), 0)`,
				ctr: sql<number>`COALESCE(AVG(${adPerformance.ctr}), 0)`,
				cpc: sql<number>`COALESCE(AVG(${adPerformance.cpc}), 0)`,
				cpa: sql<number>`COALESCE(AVG(${adPerformance.cpa}), 0)`,
			})
			.from(adPerformance)
			.innerJoin(adCampaigns, eq(adPerformance.campaignId, adCampaigns.id))
			.where(eq(adCampaigns.userId, userId));

		if (startDate) {
			query = query.where(gte(adPerformance.date, startDate));
		}

		if (endDate) {
			query = query.where(lte(adPerformance.date, endDate));
		}

		const results = await query
			.groupBy(adPerformance.device)
			.orderBy(desc(sql`SUM(${adPerformance.spend})`));

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
