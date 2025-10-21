import { db } from "@/lib/db";
import {
	adboardAds,
	adboardBudgets,
	adboardCampaignPlatforms,
	adboardCampaigns,
	adboardPerformanceMetrics,
	adboardPlatformIntegrations,
} from "@/lib/db/schemas/adboard.schema";
import { and, asc, desc, eq, gte, lte, sql } from "drizzle-orm";
import {
	BarChart3,
	CheckCircle,
	LayoutDashboard,
	MessageCircle,
	PiggyBank,
	Search,
	Settings,
	Trash2,
	XCircle,
} from "lucide-react";
import { z } from "zod";

// Validation schemas
const CreateCampaignSchema = z.object({
	name: z.string().min(1, "Campaign name is required").max(255),
	description: z.string().optional(),
	objective: z.enum(["awareness", "traffic", "leads", "conversions"]),
	budget: z.number().positive("Budget must be positive"),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	targetAudience: z.record(z.any()).optional(),
	settings: z.record(z.any()).optional(),
});

const UpdateCampaignSchema = CreateCampaignSchema.partial();

const CampaignFiltersSchema = z.object({
	status: z.enum(["draft", "active", "paused", "completed"]).optional(),
	objective: z
		.enum(["awareness", "traffic", "leads", "conversions"])
		.optional(),
	platform: z.string().optional(),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	search: z.string().optional(),
	page: z.number().min(1).default(1),
	limit: z.number().min(1).max(100).default(20),
});

export interface CampaignWithMetrics {
	id: string;
	name: string;
	description: string | null;
	objective: string;
	status: string;
	budget: string;
	spent: string;
	startDate: string | null;
	endDate: string | null;
	targetAudience: any;
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
	platforms: string[];
	adsCount: number;
}

export class AdboardCampaignService {
	/**
	 * Create a new campaign
	 */
	static async createCampaign(
		userId: string,
		data: z.infer<typeof CreateCampaignSchema>,
	) {
		try {
			const validatedData = CreateCampaignSchema.parse(data);

			const [campaign] = await db
				.insert(adboardCampaigns)
				.values({
					userId,
					name: validatedData.name,
					description: validatedData.description,
					objective: validatedData.objective,
					budget: validatedData.budget.toString(),
					startDate: validatedData.startDate,
					endDate: validatedData.endDate,
					targetAudience: validatedData.targetAudience,
					settings: validatedData.settings,
				})
				.returning();

			return {
				success: true,
				data: campaign,
				message: "Campaign created successfully",
			};
		} catch (error) {
			console.error("Error creating campaign:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to create campaign",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get campaigns with filters and pagination
	 */
	static async getCampaigns(
		userId: string,
		filters: z.infer<typeof CampaignFiltersSchema>,
	) {
		try {
			const validatedFilters = CampaignFiltersSchema.parse(filters);
			const {
				page,
				limit,
				status,
				objective,
				platform,
				startDate,
				endDate,
				search,
			} = validatedFilters;
			const offset = (page - 1) * limit;

			// Build where conditions
			const whereConditions = [eq(adboardCampaigns.userId, userId)];

			if (status) {
				whereConditions.push(eq(adboardCampaigns.status, status));
			}

			if (objective) {
				whereConditions.push(eq(adboardCampaigns.objective, objective));
			}

			if (startDate) {
				whereConditions.push(gte(adboardCampaigns.startDate, startDate));
			}

			if (endDate) {
				whereConditions.push(lte(adboardCampaigns.endDate, endDate));
			}

			if (search) {
				whereConditions.push(
					sql`${adboardCampaigns.name} ILIKE ${`%${search}%`}`,
				);
			}

			// Get campaigns with metrics
			const campaigns = await db
				.select({
					id: adboardCampaigns.id,
					name: adboardCampaigns.name,
					description: adboardCampaigns.description,
					objective: adboardCampaigns.objective,
					status: adboardCampaigns.status,
					budget: adboardCampaigns.budget,
					spent: adboardCampaigns.spent,
					startDate: adboardCampaigns.startDate,
					endDate: adboardCampaigns.endDate,
					targetAudience: adboardCampaigns.targetAudience,
					settings: adboardCampaigns.settings,
					createdAt: adboardCampaigns.createdAt,
					updatedAt: adboardCampaigns.updatedAt,
				})
				.from(adboardCampaigns)
				.where(and(...whereConditions))
				.orderBy(desc(adboardCampaigns.createdAt))
				.limit(limit)
				.offset(offset);

			// Get total count for pagination
			const [{ count }] = await db
				.select({ count: sql<number>`count(*)` })
				.from(adboardCampaigns)
				.where(and(...whereConditions));

			// Get metrics for each campaign
			const campaignsWithMetrics = await Promise.all(
				campaigns.map(async (campaign) => {
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
						.where(eq(adboardPerformanceMetrics.campaignId, campaign.id));

					// Get platforms
					const platformData = await db
						.select({
							platform: adboardPlatformIntegrations.platform,
						})
						.from(adboardCampaignPlatforms)
						.innerJoin(
							adboardPlatformIntegrations,
							eq(
								adboardCampaignPlatforms.platformIntegrationId,
								adboardPlatformIntegrations.id,
							),
						)
						.where(eq(adboardCampaignPlatforms.campaignId, campaign.id));

					// Get ads count
					const [{ adsCount }] = await db
						.select({ adsCount: sql<number>`count(*)` })
						.from(adboardAds)
						.where(eq(adboardAds.campaignId, campaign.id));

					return {
						...campaign,
						metrics: metrics[0] || {
							impressions: 0,
							clicks: 0,
							conversions: 0,
							ctr: 0,
							cpc: 0,
							roas: 0,
						},
						platforms: platformData.map((p) => p.platform),
						adsCount: adsCount || 0,
					};
				}),
			);

			return {
				success: true,
				data: {
					campaigns: campaignsWithMetrics,
					pagination: {
						page,
						limit,
						total: count,
						pages: Math.ceil(count / limit),
					},
				},
			};
		} catch (error) {
			console.error("Error getting campaigns:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to get campaigns",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get a single campaign by ID
	 */
	static async getCampaignById(userId: string, campaignId: string) {
		try {
			const [campaign] = await db
				.select()
				.from(adboardCampaigns)
				.where(
					and(
						eq(adboardCampaigns.id, campaignId),
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
				.where(eq(adboardPerformanceMetrics.campaignId, campaignId));

			// Get platforms
			const platformData = await db
				.select({
					platform: adboardPlatformIntegrations.platform,
				})
				.from(adboardCampaignPlatforms)
				.innerJoin(
					adboardPlatformIntegrations,
					eq(
						adboardCampaignPlatforms.platformIntegrationId,
						adboardPlatformIntegrations.id,
					),
				)
				.where(eq(adboardCampaignPlatforms.campaignId, campaignId));

			// Get ads
			const ads = await db
				.select()
				.from(adboardAds)
				.where(eq(adboardAds.campaignId, campaignId))
				.orderBy(desc(adboardAds.createdAt));

			return {
				success: true,
				data: {
					...campaign,
					metrics: metrics[0] || {
						impressions: 0,
						clicks: 0,
						conversions: 0,
						ctr: 0,
						cpc: 0,
						roas: 0,
					},
					platforms: platformData.map((p) => p.platform),
					ads,
				},
			};
		} catch (error) {
			console.error("Error getting campaign:", error);
			return {
				success: false,
				error: "Failed to get campaign",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Update a campaign
	 */
	static async updateCampaign(
		userId: string,
		campaignId: string,
		data: z.infer<typeof UpdateCampaignSchema>,
	) {
		try {
			const validatedData = UpdateCampaignSchema.parse(data);

			const [updatedCampaign] = await db
				.update(adboardCampaigns)
				.set({
					...validatedData,
					budget: validatedData.budget?.toString(),
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(adboardCampaigns.id, campaignId),
						eq(adboardCampaigns.userId, userId),
					),
				)
				.returning();

			if (!updatedCampaign) {
				return {
					success: false,
					error: "Campaign not found",
				};
			}

			return {
				success: true,
				data: updatedCampaign,
				message: "Campaign updated successfully",
			};
		} catch (error) {
			console.error("Error updating campaign:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to update campaign",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Delete a campaign
	 */
	static async deleteCampaign(userId: string, campaignId: string) {
		try {
			const [deletedCampaign] = await db
				.delete(adboardCampaigns)
				.where(
					and(
						eq(adboardCampaigns.id, campaignId),
						eq(adboardCampaigns.userId, userId),
					),
				)
				.returning();

			if (!deletedCampaign) {
				return {
					success: false,
					error: "Campaign not found",
				};
			}

			return {
				success: true,
				message: "Campaign deleted successfully",
			};
		} catch (error) {
			console.error("Error deleting campaign:", error);
			return {
				success: false,
				error: "Failed to delete campaign",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get campaign performance metrics
	 */
	static async getCampaignMetrics(
		userId: string,
		campaignId: string,
		dateRange?: { start: string; end: string },
	) {
		try {
			// Verify campaign belongs to user
			const [campaign] = await db
				.select({ id: adboardCampaigns.id })
				.from(adboardCampaigns)
				.where(
					and(
						eq(adboardCampaigns.id, campaignId),
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

			// Build date filter
			const dateConditions = [
				eq(adboardPerformanceMetrics.campaignId, campaignId),
			];
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
			console.error("Error getting campaign metrics:", error);
			return {
				success: false,
				error: "Failed to get campaign metrics",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get campaign statistics for dashboard
	 */
	static async getCampaignStats(userId: string) {
		try {
			// Get total campaigns
			const totalCampaignsResult = await db
				.select({ totalCampaigns: sql<number>`count(*)` })
				.from(adboardCampaigns)
				.where(eq(adboardCampaigns.userId, userId));

			const totalCampaigns = totalCampaignsResult[0]?.totalCampaigns || 0;

			// Get active campaigns
			const activeCampaignsResult = await db
				.select({ activeCampaigns: sql<number>`count(*)` })
				.from(adboardCampaigns)
				.where(
					and(
						eq(adboardCampaigns.userId, userId),
						eq(adboardCampaigns.status, "active"),
					),
				);

			const activeCampaigns = activeCampaignsResult[0]?.activeCampaigns || 0;

			// Get total spend
			const totalSpendResult = await db
				.select({
					totalSpend: sql<number>`COALESCE(SUM(${adboardCampaigns.spent}), 0)`,
				})
				.from(adboardCampaigns)
				.where(eq(adboardCampaigns.userId, userId));

			const totalSpend = totalSpendResult[0]?.totalSpend || 0;

			// Get total budget
			const totalBudgetResult = await db
				.select({
					totalBudget: sql<number>`COALESCE(SUM(${adboardCampaigns.budget}), 0)`,
				})
				.from(adboardCampaigns)
				.where(eq(adboardCampaigns.userId, userId));

			const totalBudget = totalBudgetResult[0]?.totalBudget || 0;

			// Get performance metrics
			const performanceResult = await db
				.select({
					totalImpressions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.impressions}), 0)`,
					totalClicks: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.clicks}), 0)`,
					totalConversions: sql<number>`COALESCE(SUM(${adboardPerformanceMetrics.conversions}), 0)`,
					avgCtr: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.ctr}), 0)`,
					avgCpc: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.cpc}), 0)`,
					avgRoas: sql<number>`COALESCE(AVG(${adboardPerformanceMetrics.roas}), 0)`,
				})
				.from(adboardPerformanceMetrics)
				.innerJoin(
					adboardCampaigns,
					eq(adboardPerformanceMetrics.campaignId, adboardCampaigns.id),
				)
				.where(eq(adboardCampaigns.userId, userId));

			const performance = performanceResult[0] || {
				totalImpressions: 0,
				totalClicks: 0,
				totalConversions: 0,
				avgCtr: 0,
				avgCpc: 0,
				avgRoas: 0,
			};

			return {
				success: true,
				data: {
					totalCampaigns,
					activeCampaigns,
					totalSpend,
					totalBudget,
					performance,
				},
			};
		} catch (error: any) {
			console.error("Error getting campaign stats:", error);

			// If database is not available, return mock data for development
			if (
				error.message?.includes(
					'relation "adboard_campaigns" does not exist',
				) ||
				error.message?.includes("connection") ||
				error.message?.includes("ENOTFOUND")
			) {
				console.warn(
					"Database not available, returning mock data for development",
				);

				return {
					success: true,
					data: {
						totalCampaigns: 0,
						activeCampaigns: 0,
						totalSpend: 0,
						totalBudget: 0,
						performance: {
							totalImpressions: 0,
							totalClicks: 0,
							totalConversions: 0,
							avgCtr: 0,
							avgCpc: 0,
							avgRoas: 0,
						},
					},
				};
			}

			return {
				success: false,
				error: "Failed to get campaign stats",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}
}
