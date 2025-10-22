/**
 * Adboard Service
 * Business logic for advertising campaign management and performance tracking
 */

import { db } from '@/lib/db';
import { campaigns, type Campaign } from '@/lib/db/schemas/campaigns.schema';
import { adGroups, type AdGroup } from '@/lib/db/schemas/ad-groups.schema';
import { ads, type Ad } from '@/lib/db/schemas/ads.schema';
import { eq, and, desc, ilike, or, sql, gte, lte } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateCampaignInput {
	userId: string;
	name: string;
	description?: string;
	type: 'search' | 'display' | 'social' | 'video' | 'email' | 'retargeting' | 'affiliate';
	platform: string;
	audience?: string;
	keywords?: string[];
	demographics?: Record<string, unknown>;
	budget: number;
	dailyBudget?: number;
	bidStrategy?: string;
	maxBid?: number;
	startDate: Date;
	endDate?: Date;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CreateAdGroupInput {
	userId: string;
	campaignId: string;
	name: string;
	description?: string;
	keywords?: string[];
	negativeKeywords?: string[];
	demographics?: Record<string, unknown>;
	budget?: number;
	dailyBudget?: number;
	bidStrategy?: string;
	maxBid?: number;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CreateAdInput {
	userId: string;
	campaignId: string;
	adGroupId?: string;
	name: string;
	headline: string;
	description?: string;
	callToAction?: string;
	type: 'text' | 'image' | 'video' | 'carousel' | 'collection' | 'shopping' | 'responsive';
	imageUrl?: string;
	videoUrl?: string;
	landingPageUrl?: string;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CampaignStats {
	totalCampaigns: number;
	activeCampaigns: number;
	totalSpend: number;
	totalRevenue: number;
	averageROAS: number;
	totalImpressions: number;
	totalClicks: number;
	totalConversions: number;
	overallCTR: number;
	overallCPC: number;
	overallCPA: number;
	campaignsByStatus: Array<{
		status: string;
		count: number;
	}>;
	campaignsByPlatform: Array<{
		platform: string;
		count: number;
		spend: number;
		revenue: number;
	}>;
	topPerformingCampaigns: Array<{
		id: string;
		name: string;
		roas: number;
		spend: number;
		revenue: number;
	}>;
}

interface PerformanceMetrics {
	impressions: number;
	clicks: number;
	conversions: number;
	spend: number;
	revenue: number;
	ctr: number;
	cpc: number;
	cpa: number;
	roas: number;
}

/**
 * Create a new campaign
 */
export async function createCampaign(input: CreateCampaignInput): Promise<Campaign> {
	try {
		const [campaign] = await db.insert(campaigns).values({
			userId: input.userId,
			name: input.name,
			description: input.description,
			type: input.type,
			platform: input.platform,
			audience: input.audience,
			keywords: input.keywords ? JSON.stringify(input.keywords) : null,
			demographics: input.demographics ? JSON.stringify(input.demographics) : null,
			budget: input.budget.toString(),
			dailyBudget: input.dailyBudget?.toString(),
			bidStrategy: input.bidStrategy,
			maxBid: input.maxBid?.toString(),
			startDate: input.startDate,
			endDate: input.endDate,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendCampaignCreated(campaign.id, input.userId);

		return campaign;
	} catch (error) {
		console.error('Error creating campaign:', error);
		throw new Error('Failed to create campaign');
	}
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(campaignId: string, userId: string): Promise<Campaign | null> {
	const campaign = await db.query.campaigns.findFirst({
		where: and(
			eq(campaigns.id, campaignId),
			eq(campaigns.userId, userId)
		),
	});

	return campaign || null;
}

/**
 * Get all campaigns for a user with pagination and filtering
 */
export async function getPaginatedCampaigns(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		type?: string;
		platform?: string;
	} = {}
): Promise<{
	campaigns: Campaign[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		page = 1,
		limit = 20,
		search,
		status,
		type,
		platform
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(campaigns.userId, userId)];
	
	if (search) {
		whereConditions.push(
			or(
				ilike(campaigns.name, `%${search}%`),
				ilike(campaigns.description, `%${search}%`)
			)!
		);
	}
	
	if (status) {
		whereConditions.push(eq(campaigns.status, status as any));
	}
	
	if (type) {
		whereConditions.push(eq(campaigns.type, type as any));
	}
	
	if (platform) {
		whereConditions.push(ilike(campaigns.platform, `%${platform}%`));
	}

	// Get campaigns
	const campaignsList = await db
		.select()
		.from(campaigns)
		.where(and(...whereConditions))
		.orderBy(desc(campaigns.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(campaigns)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		campaigns: campaignsList,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Update campaign
 */
export async function updateCampaign(
	campaignId: string,
	userId: string,
	updateData: Partial<CreateCampaignInput>
): Promise<Campaign> {
	try {
		const [updatedCampaign] = await db
			.update(campaigns)
			.set({
				name: updateData.name,
				description: updateData.description,
				type: updateData.type,
				platform: updateData.platform,
				audience: updateData.audience,
				keywords: updateData.keywords ? JSON.stringify(updateData.keywords) : undefined,
				demographics: updateData.demographics ? JSON.stringify(updateData.demographics) : undefined,
				budget: updateData.budget?.toString(),
				dailyBudget: updateData.dailyBudget?.toString(),
				bidStrategy: updateData.bidStrategy,
				maxBid: updateData.maxBid?.toString(),
				startDate: updateData.startDate,
				endDate: updateData.endDate,
				tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
				metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
				notes: updateData.notes,
				updatedAt: new Date(),
			})
			.where(and(
				eq(campaigns.id, campaignId),
				eq(campaigns.userId, userId)
			))
			.returning();

		if (!updatedCampaign) {
			throw new Error('Campaign not found');
		}

		return updatedCampaign;
	} catch (error) {
		console.error('Error updating campaign:', error);
		throw new Error('Failed to update campaign');
	}
}

/**
 * Update campaign performance metrics
 */
export async function updateCampaignMetrics(
	campaignId: string,
	userId: string,
	metrics: Partial<PerformanceMetrics>
): Promise<Campaign> {
	try {
		// Calculate derived metrics
		const ctr = metrics.clicks && metrics.impressions ? 
			(metrics.clicks / metrics.impressions) * 100 : 0;
		const cpc = metrics.clicks && metrics.spend ? 
			metrics.spend / metrics.clicks : 0;
		const cpa = metrics.conversions && metrics.spend ? 
			metrics.spend / metrics.conversions : 0;
		const roas = metrics.spend && metrics.revenue ? 
			metrics.revenue / metrics.spend : 0;

		const [updatedCampaign] = await db
			.update(campaigns)
			.set({
				impressions: metrics.impressions?.toString(),
				clicks: metrics.clicks?.toString(),
				conversions: metrics.conversions?.toString(),
				spend: metrics.spend?.toString(),
				revenue: metrics.revenue?.toString(),
				ctr: ctr.toString(),
				cpc: cpc.toString(),
				cpa: cpa.toString(),
				roas: roas.toString(),
				updatedAt: new Date(),
			})
			.where(and(
				eq(campaigns.id, campaignId),
				eq(campaigns.userId, userId)
			))
			.returning();

		if (!updatedCampaign) {
			throw new Error('Campaign not found');
		}

		return updatedCampaign;
	} catch (error) {
		console.error('Error updating campaign metrics:', error);
		throw new Error('Failed to update campaign metrics');
	}
}

/**
 * Create an ad group
 */
export async function createAdGroup(input: CreateAdGroupInput): Promise<AdGroup> {
	try {
		const [adGroup] = await db.insert(adGroups).values({
			userId: input.userId,
			campaignId: input.campaignId,
			name: input.name,
			description: input.description,
			keywords: input.keywords ? JSON.stringify(input.keywords) : null,
			negativeKeywords: input.negativeKeywords ? JSON.stringify(input.negativeKeywords) : null,
			demographics: input.demographics ? JSON.stringify(input.demographics) : null,
			budget: input.budget?.toString(),
			dailyBudget: input.dailyBudget?.toString(),
			bidStrategy: input.bidStrategy,
			maxBid: input.maxBid?.toString(),
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		return adGroup;
	} catch (error) {
		console.error('Error creating ad group:', error);
		throw new Error('Failed to create ad group');
	}
}

/**
 * Create an ad
 */
export async function createAd(input: CreateAdInput): Promise<Ad> {
	try {
		const [ad] = await db.insert(ads).values({
			userId: input.userId,
			campaignId: input.campaignId,
			adGroupId: input.adGroupId,
			name: input.name,
			headline: input.headline,
			description: input.description,
			callToAction: input.callToAction,
			type: input.type,
			imageUrl: input.imageUrl,
			videoUrl: input.videoUrl,
			landingPageUrl: input.landingPageUrl,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		return ad;
	} catch (error) {
		console.error('Error creating ad:', error);
		throw new Error('Failed to create ad');
	}
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(userId: string): Promise<CampaignStats> {
	// Get basic campaign stats
	const [basicStats] = await db
		.select({
			totalCampaigns: sql<number>`count(*)`,
			activeCampaigns: sql<number>`count(case when ${campaigns.status} = 'active' then 1 end)`,
			totalSpend: sql<number>`sum(${campaigns.spend}::numeric)`,
			totalRevenue: sql<number>`sum(${campaigns.revenue}::numeric)`,
			totalImpressions: sql<number>`sum(${campaigns.impressions}::numeric)`,
			totalClicks: sql<number>`sum(${campaigns.clicks}::numeric)`,
			totalConversions: sql<number>`sum(${campaigns.conversions}::numeric)`,
		})
		.from(campaigns)
		.where(eq(campaigns.userId, userId));

	// Get campaigns by status
	const campaignsByStatus = await db
		.select({
			status: campaigns.status,
			count: sql<number>`count(*)`,
		})
		.from(campaigns)
		.where(eq(campaigns.userId, userId))
		.groupBy(campaigns.status);

	// Get campaigns by platform
	const campaignsByPlatform = await db
		.select({
			platform: campaigns.platform,
			count: sql<number>`count(*)`,
			spend: sql<number>`sum(${campaigns.spend}::numeric)`,
			revenue: sql<number>`sum(${campaigns.revenue}::numeric)`,
		})
		.from(campaigns)
		.where(eq(campaigns.userId, userId))
		.groupBy(campaigns.platform);

	// Get top performing campaigns
	const topPerformingCampaigns = await db
		.select({
			id: campaigns.id,
			name: campaigns.name,
			roas: campaigns.roas,
			spend: campaigns.spend,
			revenue: campaigns.revenue,
		})
		.from(campaigns)
		.where(and(
			eq(campaigns.userId, userId),
			eq(campaigns.status, 'active')
		))
		.orderBy(desc(campaigns.roas))
		.limit(5);

	const totalSpend = Number(basicStats?.totalSpend || 0);
	const totalRevenue = Number(basicStats?.totalRevenue || 0);
	const totalClicks = Number(basicStats?.totalClicks || 0);
	const totalImpressions = Number(basicStats?.totalImpressions || 0);
	const totalConversions = Number(basicStats?.totalConversions || 0);

	return {
		totalCampaigns: basicStats?.totalCampaigns || 0,
		activeCampaigns: basicStats?.activeCampaigns || 0,
		totalSpend,
		totalRevenue,
		averageROAS: totalSpend > 0 ? totalRevenue / totalSpend : 0,
		totalImpressions,
		totalClicks,
		totalConversions,
		overallCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
		overallCPC: totalClicks > 0 ? totalSpend / totalClicks : 0,
		overallCPA: totalConversions > 0 ? totalSpend / totalConversions : 0,
		campaignsByStatus: campaignsByStatus.map(status => ({
			status: status.status,
			count: status.count,
		})),
		campaignsByPlatform: campaignsByPlatform.map(platform => ({
			platform: platform.platform,
			count: platform.count,
			spend: Number(platform.spend),
			revenue: Number(platform.revenue),
		})),
		topPerformingCampaigns: topPerformingCampaigns.map(campaign => ({
			id: campaign.id,
			name: campaign.name,
			roas: Number(campaign.roas),
			spend: Number(campaign.spend),
			revenue: Number(campaign.revenue),
		})),
	};
}

/**
 * Get performance metrics for a specific date range
 */
export async function getPerformanceMetrics(
	userId: string,
	startDate: Date,
	endDate: Date
): Promise<PerformanceMetrics> {
	const [metrics] = await db
		.select({
			impressions: sql<number>`sum(${campaigns.impressions}::numeric)`,
			clicks: sql<number>`sum(${campaigns.clicks}::numeric)`,
			conversions: sql<number>`sum(${campaigns.conversions}::numeric)`,
			spend: sql<number>`sum(${campaigns.spend}::numeric)`,
			revenue: sql<number>`sum(${campaigns.revenue}::numeric)`,
		})
		.from(campaigns)
		.where(and(
			eq(campaigns.userId, userId),
			gte(campaigns.startDate, startDate),
			lte(campaigns.startDate, endDate)
		));

	const impressions = Number(metrics?.impressions || 0);
	const clicks = Number(metrics?.clicks || 0);
	const conversions = Number(metrics?.conversions || 0);
	const spend = Number(metrics?.spend || 0);
	const revenue = Number(metrics?.revenue || 0);

	return {
		impressions,
		clicks,
		conversions,
		spend,
		revenue,
		ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
		cpc: clicks > 0 ? spend / clicks : 0,
		cpa: conversions > 0 ? spend / conversions : 0,
		roas: spend > 0 ? revenue / spend : 0,
	};
}

// Export all adboard service functions
export const AdboardService = {
	createCampaign,
	getCampaignById,
	getPaginatedCampaigns,
	updateCampaign,
	updateCampaignMetrics,
	createAdGroup,
	createAd,
	getCampaignStats,
	getPerformanceMetrics,
};
