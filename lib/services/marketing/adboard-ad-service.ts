import { db } from "@/lib/db/connection";
import {
	adboardAdCreatives,
	adboardAdPlacements,
	adboardAds,
	adboardCampaigns,
	adboardPerformanceMetrics,
} from "@/lib/db/schemas/adboard.schema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	BarChart3,
	CheckCircle,
	Image,
	MessageCircle,
	PiggyBank,
	Search,
	Settings,
	Trash2,
	Video,
	XCircle,
} from "lucide-react";
import { z } from "zod";

// Validation schemas
const CreateAdSchema = z.object({
	campaignId: z.string().uuid("Invalid campaign ID"),
	name: z.string().min(1, "Ad name is required").max(255),
	platform: z.enum(["meta", "google", "tiktok", "twitter", "linkedin"]),
	adType: z.enum(["image", "video", "carousel", "text", "story"]),
	headline: z.string().optional(),
	description: z.string().optional(),
	callToAction: z.string().optional(),
	creativeUrl: z.string().url().optional(),
	landingPageUrl: z.string().url().optional(),
	budget: z.number().positive("Budget must be positive").optional(),
	settings: z.record(z.any()).optional(),
});

const UpdateAdSchema = CreateAdSchema.partial().omit({ campaignId: true });

const AdFiltersSchema = z.object({
	campaignId: z.string().uuid().optional(),
	platform: z.string().optional(),
	adType: z.string().optional(),
	status: z.enum(["draft", "active", "paused", "completed"]).optional(),
	search: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

export interface AdWithMetrics {
	id: string;
	campaignId: string;
	name: string;
	status: string;
	platform: string;
	adType: string;
	headline: string | null;
	description: string | null;
	callToAction: string | null;
	creativeUrl: string | null;
	landingPageUrl: string | null;
	budget: string | null;
	spent: string;
	settings: any;
	createdAt: Date;
	updatedAt: Date;
	metrics: {
		impressions: number;
		clicks: number;
		conversions: number;
		ctr: number;
		cpc: number;
		roas: number;
	};
	creatives: Array<{
		id: string;
		type: string;
		url: string;
		altText: string | null;
		title: string | null;
		description: string | null;
		dimensions: any;
		fileSize: number | null;
		mimeType: string | null;
		metadata: any;
		createdAt: Date;
	}>;
	placements: Array<{
		id: string;
		platform: string;
		placement: string;
		settings: any;
		createdAt: Date;
	}>;
}

export class AdboardAdService {
	/**
	 * Create a new ad
	 */
	static async createAd(userId: string, data: z.infer<typeof CreateAdSchema>) {
		try {
			const validatedData = CreateAdSchema.parse(data);

			// Verify campaign belongs to user
			const [campaign] = await db
				.select({ id: adboardCampaigns.id })
				.from(adboardCampaigns)
				.where(
					and(
						eq(adboardCampaigns.id, validatedData.campaignId),
						eq(adboardCampaigns.userId, userId),
					),
				)
				.limit(1);

			if (!campaign) {
				return {
					success: false,
					error: "Campaign not found",
				};
			}

			const [ad] = await db
				.insert(adboardAds)
				.values({
					campaignId: validatedData.campaignId,
					name: validatedData.name,
					platform: validatedData.platform,
					adType: validatedData.adType,
					headline: validatedData.headline,
					description: validatedData.description,
					callToAction: validatedData.callToAction,
					creativeUrl: validatedData.creativeUrl,
					landingPageUrl: validatedData.landingPageUrl,
					budget: validatedData.budget?.toString(),
					settings: validatedData.settings,
				})
				.returning();

			return {
				success: true,
				data: ad,
				message: "Ad created successfully",
			};
		} catch (error) {
			console.error("Error creating ad:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to create ad",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get ads with filters and pagination
	 */
	static async getAds(
		userId: string,
		filters: z.infer<typeof AdFiltersSchema>,
	) {
		try {
			const validatedFilters = AdFiltersSchema.parse(filters);
			const { page, limit, campaignId, platform, adType, status, search } =
				validatedFilters;
			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [];

			if (campaignId) {
				whereConditions.push(eq(adboardAds.campaignId, campaignId));
			}

			if (platform) {
				whereConditions.push(eq(adboardAds.platform, platform));
			}

			if (adType) {
				whereConditions.push(eq(adboardAds.adType, adType));
			}

			if (status) {
				whereConditions.push(eq(adboardAds.status, status));
			}

			if (search) {
				whereConditions.push(sql`${adboardAds.name} ILIKE ${`%${search}%`}`);
			}

			// Get ads with campaign verification
			const ads = await db
				.select({
					id: adboardAds.id,
					campaignId: adboardAds.campaignId,
					name: adboardAds.name,
					status: adboardAds.status,
					platform: adboardAds.platform,
					adType: adboardAds.adType,
					headline: adboardAds.headline,
					description: adboardAds.description,
					callToAction: adboardAds.callToAction,
					creativeUrl: adboardAds.creativeUrl,
					landingPageUrl: adboardAds.landingPageUrl,
					budget: adboardAds.budget,
					spent: adboardAds.spent,
					settings: adboardAds.settings,
					createdAt: adboardAds.createdAt,
					updatedAt: adboardAds.updatedAt,
				})
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(and(eq(adboardCampaigns.userId, userId), ...whereConditions))
				.orderBy(desc(adboardAds.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count for pagination
			const [{ count }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(and(eq(adboardCampaigns.userId, userId), ...whereConditions));

			// Get metrics and related data for each ad
			const adsWithMetrics = await Promise.all(
				ads.map(async (ad) => {
					// Get performance metrics
					const metrics = await db
						.select({
							impressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
							clicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
							conversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
							ctr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
							cpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
							roas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
						})
						.from(adboardPerformanceMetrics)
						.where(eq(adboardPerformanceMetrics.adId, ad.id));

					// Get creatives
					const creatives = await db
						.select()
						.from(adboardAdCreatives)
						.where(eq(adboardAdCreatives.adId, ad.id))
						.orderBy(desc(adboardAdCreatives.createdAt));

					// Get placements
					const placements = await db
						.select()
						.from(adboardAdPlacements)
						.where(eq(adboardAdPlacements.adId, ad.id))
						.orderBy(desc(adboardAdPlacements.createdAt));

					return {
						...ad,
						metrics: metrics[0] || {
							impressions: 0,
							clicks: 0,
							conversions: 0,
							ctr: 0,
							cpc: 0,
							roas: 0,
						},
						creatives,
						placements,
					};
				}),
			);

			return {
				success: true,
				data: {
					ads: adsWithMetrics,
					pagination: {
						page,
						limit,
						total: count,
						pages: Math.ceil(count / limit),
					},
				},
			};
		} catch (error) {
			console.error("Error getting ads:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to get ads",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get a single ad by ID
	 */
	static async getAdById(userId: string, adId: string) {
		try {
			const [ad] = await db
				.select({
					id: adboardAds.id,
					campaignId: adboardAds.campaignId,
					name: adboardAds.name,
					status: adboardAds.status,
					platform: adboardAds.platform,
					adType: adboardAds.adType,
					headline: adboardAds.headline,
					description: adboardAds.description,
					callToAction: adboardAds.callToAction,
					creativeUrl: adboardAds.creativeUrl,
					landingPageUrl: adboardAds.landingPageUrl,
					budget: adboardAds.budget,
					spent: adboardAds.spent,
					settings: adboardAds.settings,
					createdAt: adboardAds.createdAt,
					updatedAt: adboardAds.updatedAt,
				})
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(
					and(eq(adboardAds.id, adId), eq(adboardCampaigns.userId, userId)),
				)
				.limit(1);

			if (!ad) {
				return {
					success: false,
					error: "Ad not found",
				};
			}

			// Get performance metrics
			const metrics = await db
				.select({
					impressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
					clicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
					conversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
					ctr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
					cpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
					roas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
				})
				.from(adboardPerformanceMetrics)
				.where(eq(adboardPerformanceMetrics.adId, adId));

			// Get creatives
			const creatives = await db
				.select()
				.from(adboardAdCreatives)
				.where(eq(adboardAdCreatives.adId, adId))
				.orderBy(desc(adboardAdCreatives.createdAt));

			// Get placements
			const placements = await db
				.select()
				.from(adboardAdPlacements)
				.where(eq(adboardAdPlacements.adId, adId))
				.orderBy(desc(adboardAdPlacements.createdAt));

			return {
				success: true,
				data: {
					...ad,
					metrics: metrics[0] || {
						impressions: 0,
						clicks: 0,
						conversions: 0,
						ctr: 0,
						cpc: 0,
						roas: 0,
					},
					creatives,
					placements,
				},
			};
		} catch (error) {
			console.error("Error getting ad:", error);
			return {
				success: false,
				error: "Failed to get ad",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Update an ad
	 */
	static async updateAd(
		userId: string,
		adId: string,
		data: z.infer<typeof UpdateAdSchema>,
	) {
		try {
			const validatedData = UpdateAdSchema.parse(data);

			// Verify ad belongs to user's campaign
			const [existingAd] = await db
				.select({ id: adboardAds.id })
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(
					and(eq(adboardAds.id, adId), eq(adboardCampaigns.userId, userId)),
				)
				.limit(1);

			if (!existingAd) {
				return {
					success: false,
					error: "Ad not found",
				};
			}

			const [updatedAd] = await db
				.update(adboardAds)
				.set({
					...validatedData,
					budget: validatedData.budget?.toString(),
					updatedAt: new Date(),
				})
				.where(eq(adboardAds.id, adId))
				.returning();

			return {
				success: true,
				data: updatedAd,
				message: "Ad updated successfully",
			};
		} catch (error) {
			console.error("Error updating ad:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to update ad",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Delete an ad
	 */
	static async deleteAd(userId: string, adId: string) {
		try {
			// Verify ad belongs to user's campaign
			const [existingAd] = await db
				.select({ id: adboardAds.id })
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(
					and(eq(adboardAds.id, adId), eq(adboardCampaigns.userId, userId)),
				)
				.limit(1);

			if (!existingAd) {
				return {
					success: false,
					error: "Ad not found",
				};
			}

			const [deletedAd] = await db
				.delete(adboardAds)
				.where(eq(adboardAds.id, adId))
				.returning();

			return {
				success: true,
				message: "Ad deleted successfully",
			};
		} catch (error) {
			console.error("Error deleting ad:", error);
			return {
				success: false,
				error: "Failed to delete ad",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get ad performance metrics
	 */
	static async getAdMetrics(
		userId: string,
		adId: string,
		dateRange?: { start: string; end: string },
	) {
		try {
			// Verify ad belongs to user's campaign
			const [ad] = await db
				.select({ id: adboardAds.id })
				.from(adboardAds)
				.innerJoin(
					adboardCampaigns,
					eq(adboardAds.campaignId, adboardCampaigns.id),
				)
				.where(
					and(eq(adboardAds.id, adId), eq(adboardCampaigns.userId, userId)),
				)
				.limit(1);

			if (!ad) {
				return {
					success: false,
					error: "Ad not found",
				};
			}

			// Build date filter
			const dateConditions = [eq(adboardPerformanceMetrics.adId, adId)];
			if (dateRange) {
				if (dateRange.start) {
					dateConditions.push(
						gte(adboardPerformanceMetrics.date, dateRange.start),
					);
				}
				if (dateRange.end) {
					dateConditions.push(
						lte(adboardPerformanceMetrics.date, dateRange.end),
					);
				}
			}

			// Get aggregated metrics
			const [metrics] = await db
				.select({
					totalImpressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
					totalClicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
					totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
					totalSpend: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.spend}), 0)`,
					avgCtr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
					avgCpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
					avgRoas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
					avgConversionRate: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.conversionRate}), 0)`,
				})
				.from(adboardPerformanceMetrics)
				.where(and(...dateConditions));

			// Get daily metrics for chart data
			const dailyMetrics = await db
				.select({
					date: adboardPerformanceMetrics.date,
					impressions: adboardPerformanceMetrics.impressions,
					clicks: adboardPerformanceMetrics.clicks,
					conversions: adboardPerformanceMetrics.conversions,
					spend: adboardPerformanceMetrics.spend,
					ctr: adboardPerformanceMetrics.ctr,
					cpc: adboardPerformanceMetrics.cpc,
					roas: adboardPerformanceMetrics.roas,
				})
				.from(adboardPerformanceMetrics)
				.where(and(...dateConditions))
				.orderBy(asc(adboardPerformanceMetrics.date));

			return {
				success: true,
				data: {
					summary: metrics,
					daily: dailyMetrics,
				},
			};
		} catch (error) {
			console.error("Error getting ad metrics:", error);
			return {
				success: false,
				error: "Failed to get ad metrics",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
