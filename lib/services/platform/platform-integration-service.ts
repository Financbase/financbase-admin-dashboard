import { db } from "@/lib/db";
import {
	type AdboardAd,
	type AdboardCampaign,
	type AdboardPerformance,
	adboardAds,
	adboardCampaigns,
	adboardPerformance,
} from "@/lib/db/schemas/adboard.schema";
import { and, desc, eq, sql } from "drizzle-orm";
import {} from "lucide-react";

// Platform-specific configurations
export const PLATFORM_CONFIGS = {
	meta: {
		name: "Meta (Facebook/Instagram)",
		icon: "📘",
		adTypes: ["image", "video", "carousel", "collection", "stories"],
		objectives: [
			"awareness",
			"traffic",
			"engagement",
			"app_installs",
			"video_views",
			"lead_generation",
			"conversions",
			"catalog_sales",
			"store_traffic",
		],
		bidStrategies: [
			"lowest_cost",
			"cost_cap",
			"bid_cap",
			"target_cost",
			"target_roas",
		],
		audienceTypes: [
			"core_audience",
			"custom_audience",
			"lookalike_audience",
			"saved_audience",
		],
		placementTypes: [
			"facebook_feed",
			"instagram_feed",
			"instagram_stories",
			"messenger",
			"audience_network",
		],
	},
	google: {
		name: "Google Ads",
		icon: "🔍",
		adTypes: ["search", "display", "video", "shopping", "app"],
		objectives: [
			"sales",
			"leads",
			"website_traffic",
			"product_and_brand_consideration",
			"brand_awareness_and_reach",
			"app_promotion",
		],
		bidStrategies: [
			"target_cpa",
			"target_roas",
			"target_spend",
			"maximize_clicks",
			"maximize_conversions",
			"maximize_conversion_value",
		],
		audienceTypes: [
			"demographics",
			"interests",
			"life_events",
			"custom_intent",
			"similar_audiences",
			"customer_match",
		],
		placementTypes: [
			"search_network",
			"display_network",
			"youtube",
			"gmail",
			"discovery",
		],
	},
};

/**
 * Create a simplified campaign across multiple platforms
 */
export async function createUnifiedCampaign(
	userId: string,
	campaignData: {
		name: string;
		description?: string;
		budget: number;
		dailyBudget?: number;
		startDate: Date;
		endDate?: Date;
		objective: string;
		platforms: string[];
		audience: {
			ageRange: [number, number];
			interests: string[];
			locations: string[];
			languages: string[];
		};
		creative: {
			headline: string;
			description: string;
			imageUrl?: string;
			videoUrl?: string;
			callToAction: string;
		};
	},
): Promise<{
	campaigns: AdboardCampaign[];
	ads: AdboardAd[];
}> {
	try {
		const createdCampaigns: AdboardCampaign[] = [];
		const createdAds: AdboardAd[] = [];

		// Create campaign for each platform
		for (const platform of campaignData.platforms) {
			const platformConfig =
				PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
			if (!platformConfig) continue;

			// Create campaign
			const [campaign] = await db
				.insert(adboardCampaigns)
				.values({
					userId,
					name: `${campaignData.name} - ${platformConfig.name}`,
					description: campaignData.description,
					status: "draft",
					budget: campaignData.budget / campaignData.platforms.length, // Split budget
					dailyBudget: campaignData.dailyBudget
						? campaignData.dailyBudget / campaignData.platforms.length
						: null,
					startDate: campaignData.startDate,
					endDate: campaignData.endDate,
					platform: platform,
					objective: campaignData.objective,
					bidStrategy: "automatic", // Start with automatic bidding
					targetAudience: {
						ageRange: campaignData.audience.ageRange,
						interests: campaignData.audience.interests,
						locations: campaignData.audience.locations,
						languages: campaignData.audience.languages,
					},
				})
				.returning();

			createdCampaigns.push(campaign);

			// Create ad for the campaign
			const [ad] = await db
				.insert(adboardAds)
				.values({
					campaignId: campaign.id,
					name: `${campaignData.name} Ad - ${platformConfig.name}`,
					status: "draft",
					adType: platform === "meta" ? "display" : "search",
					headline: campaignData.creative.headline,
					description: campaignData.creative.description,
					callToAction: campaignData.creative.callToAction,
					imageUrl: campaignData.creative.imageUrl,
					videoUrl: campaignData.creative.videoUrl,
					landingPageUrl: "", // Will be set by user
					creativeAssets: {
						platform: platform,
						format: platform === "meta" ? "single_image" : "text_ad",
					},
					targetingCriteria: {
						platform: platform,
						audience: campaignData.audience,
					},
				})
				.returning();

			createdAds.push(ad);
		}

		return { campaigns: createdCampaigns, ads: createdAds };
	} catch (error) {
		console.error("Error creating unified campaign:", error);
		throw new Error("Failed to create unified campaign");
	}
}

/**
 * Get platform-specific recommendations
 */
export async function getPlatformRecommendations(
	userId: string,
	objective: string,
	budget: number,
): Promise<{
	platforms: {
		platform: string;
		recommended: boolean;
		reason: string;
		estimatedReach: number;
		estimatedClicks: number;
		estimatedCost: number;
	}[];
	bestPlatform: string;
	optimizationTips: string[];
}> {
	const recommendations = [];

	// Meta recommendations
	const metaRecommended = [
		"awareness",
		"engagement",
		"traffic",
		"conversions",
	].includes(objective);
	recommendations.push({
		platform: "meta",
		recommended: metaRecommended,
		reason: metaRecommended
			? "Excellent for social engagement and visual content"
			: "Better suited for other objectives",
		estimatedReach: Math.floor(budget * 50), // Rough estimate
		estimatedClicks: Math.floor(budget * 2),
		estimatedCost: budget,
	});

	// Google recommendations
	const googleRecommended = [
		"traffic",
		"leads",
		"sales",
		"conversions",
	].includes(objective);
	recommendations.push({
		platform: "google",
		recommended: googleRecommended,
		reason: googleRecommended
			? "Perfect for search intent and conversion-focused campaigns"
			: "Better for awareness-focused objectives",
		estimatedReach: Math.floor(budget * 30), // Rough estimate
		estimatedClicks: Math.floor(budget * 3),
		estimatedCost: budget,
	});

	const bestPlatform =
		recommendations.find((r) => r.recommended)?.platform || "meta";

	const optimizationTips = [
		"Start with automatic bidding to learn audience behavior",
		"Use A/B testing to optimize creative elements",
		"Monitor performance daily for the first week",
		"Adjust budgets based on best-performing platforms",
		"Use lookalike audiences for better targeting",
	];

	return {
		platforms: recommendations,
		bestPlatform,
		optimizationTips,
	};
}

/**
 * Get simplified performance comparison across platforms
 */
export async function getPlatformPerformanceComparison(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	platforms: {
		platform: string;
		spend: number;
		impressions: number;
		clicks: number;
		conversions: number;
		revenue: number;
		ctr: number;
		cpc: number;
		cpa: number;
		roas: number;
		recommendation: string;
	}[];
	insights: string[];
	nextSteps: string[];
}> {
	try {
		// Get performance data grouped by platform
		const performanceData = await db
			.select({
				platform: adboardPerformance.platform,
				spend: sql<number>`COALESCE(sum(${adboardPerformance.spend}), 0)`,
				impressions: sql<number>`COALESCE(sum(${adboardPerformance.impressions}), 0)`,
				clicks: sql<number>`COALESCE(sum(${adboardPerformance.clicks}), 0)`,
				conversions: sql<number>`COALESCE(sum(${adboardPerformance.conversions}), 0)`,
				revenue: sql<number>`COALESCE(sum(${adboardPerformance.revenue}), 0)`,
			})
			.from(adboardPerformance)
			.innerJoin(
				adboardCampaigns,
				eq(adboardPerformance.campaignId, adboardCampaigns.id),
			)
			.where(
				and(
					eq(adboardCampaigns.userId, userId),
					startDate
						? sql`${adboardPerformance.date} >= ${startDate}`
						: undefined,
					endDate ? sql`${adboardPerformance.date} <= ${endDate}` : undefined,
				),
			)
			.groupBy(adboardPerformance.platform);

		const platforms = performanceData.map((data) => {
			const ctr =
				data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
			const cpc = data.clicks > 0 ? data.spend / data.clicks : 0;
			const cpa = data.conversions > 0 ? data.spend / data.conversions : 0;
			const roas = data.spend > 0 ? data.revenue / data.spend : 0;

			let recommendation = "";
			if (roas > 3) recommendation = "Excellent performance - increase budget";
			else if (roas > 2) recommendation = "Good performance - optimize further";
			else if (roas > 1) recommendation = "Break-even - needs optimization";
			else recommendation = "Poor performance - review strategy";

			return {
				platform: data.platform,
				spend: data.spend,
				impressions: data.impressions,
				clicks: data.clicks,
				conversions: data.conversions,
				revenue: data.revenue,
				ctr,
				cpc,
				cpa,
				roas,
				recommendation,
			};
		});

		// Generate insights
		const insights = [];
		if (platforms.length > 1) {
			const bestPlatform = platforms.reduce((prev, current) =>
				prev.roas > current.roas ? prev : current,
			);
			insights.push(
				`${bestPlatform.platform} is your best-performing platform with ${bestPlatform.roas.toFixed(1)}x ROAS`,
			);
		}

		const totalSpend = platforms.reduce((sum, p) => sum + p.spend, 0);
		const totalRevenue = platforms.reduce((sum, p) => sum + p.revenue, 0);
		if (totalSpend > 0) {
			const overallRoas = totalRevenue / totalSpend;
			insights.push(
				`Overall ROAS: ${overallRoas.toFixed(1)}x across all platforms`,
			);
		}

		// Generate next steps
		const nextSteps = [
			"Review platform performance weekly",
			"Reallocate budget to best-performing platforms",
			"Test new creative variations",
			"Optimize targeting based on conversion data",
		];

		return { platforms, insights, nextSteps };
	} catch (error) {
		console.error("Error getting platform performance comparison:", error);
		throw new Error("Failed to get platform performance comparison");
	}
}

/**
 * Get simplified campaign setup wizard data
 */
export async function getCampaignSetupWizard(userId: string): Promise<{
	objectives: {
		value: string;
		label: string;
		description: string;
		recommendedPlatforms: string[];
	}[];
	audienceTemplates: {
		name: string;
		description: string;
		criteria: any;
		estimatedSize: number;
	}[];
	creativeTemplates: {
		name: string;
		description: string;
		headline: string;
		description: string;
		callToAction: string;
		platform: string;
	}[];
	budgetRecommendations: {
		objective: string;
		minBudget: number;
		recommendedBudget: number;
		maxBudget: number;
		reasoning: string;
	}[];
}> {
	const objectives = [
		{
			value: "awareness",
			label: "Brand Awareness",
			description: "Increase brand recognition and reach",
			recommendedPlatforms: ["meta", "google"],
		},
		{
			value: "traffic",
			label: "Website Traffic",
			description: "Drive visitors to your website",
			recommendedPlatforms: ["google", "meta"],
		},
		{
			value: "leads",
			label: "Lead Generation",
			description: "Collect contact information from potential customers",
			recommendedPlatforms: ["google", "meta"],
		},
		{
			value: "conversions",
			label: "Conversions",
			description: "Drive specific actions like purchases or sign-ups",
			recommendedPlatforms: ["google", "meta"],
		},
	];

	const audienceTemplates = [
		{
			name: "Young Professionals",
			description: "Ages 25-35, interested in technology and lifestyle",
			criteria: {
				ageRange: [25, 35],
				interests: ["technology", "lifestyle", "career"],
				locations: ["United States"],
				languages: ["English"],
			},
			estimatedSize: 15000000,
		},
		{
			name: "Small Business Owners",
			description: "Business owners and entrepreneurs",
			criteria: {
				ageRange: [30, 55],
				interests: ["business", "entrepreneurship", "finance"],
				locations: ["United States"],
				languages: ["English"],
			},
			estimatedSize: 8000000,
		},
		{
			name: "E-commerce Shoppers",
			description: "Active online shoppers",
			criteria: {
				ageRange: [18, 65],
				interests: ["shopping", "fashion", "home decor"],
				locations: ["United States"],
				languages: ["English"],
			},
			estimatedSize: 25000000,
		},
	];

	const creativeTemplates = [
		{
			name: "Product Showcase",
			headline: "Discover Amazing Products",
			description: "Shop our curated collection of premium items",
			callToAction: "Shop Now",
			platform: "meta",
		},
		{
			name: "Service Offer",
			headline: "Professional Services",
			description: "Get expert help with your business needs",
			callToAction: "Learn More",
			platform: "google",
		},
		{
			name: "Brand Story",
			headline: "Our Story",
			description: "Learn how we're making a difference",
			callToAction: "Discover",
			platform: "meta",
		},
	];

	const budgetRecommendations = [
		{
			objective: "awareness",
			minBudget: 100,
			recommendedBudget: 500,
			maxBudget: 2000,
			reasoning: "Awareness campaigns need sufficient reach to be effective",
		},
		{
			objective: "traffic",
			minBudget: 200,
			recommendedBudget: 1000,
			maxBudget: 5000,
			reasoning:
				"Traffic campaigns benefit from higher budgets for better placement",
		},
		{
			objective: "leads",
			minBudget: 500,
			recommendedBudget: 2000,
			maxBudget: 10000,
			reasoning: "Lead generation requires more investment for quality results",
		},
		{
			objective: "conversions",
			minBudget: 1000,
			recommendedBudget: 5000,
			maxBudget: 20000,
			reasoning:
				"Conversion campaigns need significant budget for optimization",
		},
	];

	return {
		objectives,
		audienceTemplates,
		creativeTemplates,
		budgetRecommendations,
	};
}
