import { db } from "@/lib/db";
import {
	adboardAds,
	adboardCampaigns,
	adboardPerformanceMetrics,
	adboardPlatformIntegrations,
} from "@/lib/db/schemas/adboard.schema";
import { and, desc, eq, gte, lte } from "drizzle-orm";
import {
	BarChart3,
	Briefcase,
	Building2,
	FileText,
	Info,
	PiggyBank,
	Search,
	Settings,
	Video,
	XCircle,
} from "lucide-react";

export interface PlatformConfig {
	google?: {
		clientId: string;
		clientSecret: string;
		refreshToken: string;
		developerToken: string;
		customerId: string;
	};
	facebook?: {
		accessToken: string;
		appId: string;
		appSecret: string;
		adAccountId: string;
	};
	linkedin?: {
		accessToken: string;
		clientId: string;
		clientSecret: string;
		adAccountId: string;
	};
	tiktok?: {
		accessToken: string;
		appId: string;
		appSecret: string;
		adAccountId: string;
	};
}

export interface CampaignData {
	name: string;
	objective: string;
	budget: number;
	startDate: string;
	endDate: string;
	targetAudience: any;
	settings: any;
}

export interface PerformanceData {
	impressions: number;
	clicks: number;
	conversions: number;
	spend: number;
	ctr: number;
	cpc: number;
	roas: number;
	date: string;
}

export interface PlatformInsights {
	recommendations: string[];
	optimizationSuggestions: string[];
	performanceTrends: any[];
	budgetRecommendations: any[];
}

export class PlatformIntegrationService {
	private config: PlatformConfig;

	constructor(config: PlatformConfig) {
		this.config = config;
	}

	/**
	 * Get available platforms based on configuration
	 */
	getAvailablePlatforms(): string[] {
		const platforms: string[] = [];

		if (this.config.google) platforms.push("google");
		if (this.config.facebook) platforms.push("facebook");
		if (this.config.linkedin) platforms.push("linkedin");
		if (this.config.tiktok) platforms.push("tiktok");

		return platforms;
	}

	/**
	 * Check if a platform is connected and accessible
	 */
	async checkPlatformConnectivity(platform: string): Promise<boolean> {
		try {
			switch (platform) {
				case "google":
					return await this.checkGoogleConnectivity();
				case "facebook":
					return await this.checkFacebookConnectivity();
				case "linkedin":
					return await this.checkLinkedInConnectivity();
				case "tiktok":
					return await this.checkTikTokConnectivity();
				default:
					return false;
			}
		} catch (error) {
			console.error(`Error checking ${platform} connectivity:`, error);
			return false;
		}
	}

	/**
	 * Sync campaigns from all connected platforms
	 */
	async syncAllCampaigns(): Promise<any[]> {
		const allCampaigns: any[] = [];
		const platforms = this.getAvailablePlatforms();

		for (const platform of platforms) {
			try {
				const campaigns = await this.syncPlatformCampaigns(platform);
				allCampaigns.push(...campaigns);
			} catch (error) {
				console.error(`Error syncing ${platform} campaigns:`, error);
			}
		}

		return allCampaigns;
	}

	/**
	 * Sync campaigns from a specific platform
	 */
	async syncPlatformCampaigns(platform: string): Promise<any[]> {
		switch (platform) {
			case "google":
				return await this.syncGoogleCampaigns();
			case "facebook":
				return await this.syncFacebookCampaigns();
			case "linkedin":
				return await this.syncLinkedInCampaigns();
			case "tiktok":
				return await this.syncTikTokCampaigns();
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	/**
	 * Create a campaign on a specific platform
	 */
	async createCampaign(
		platform: string,
		campaignData: CampaignData,
	): Promise<string> {
		switch (platform) {
			case "google":
				return await this.createGoogleCampaign(campaignData);
			case "facebook":
				return await this.createFacebookCampaign(campaignData);
			case "linkedin":
				return await this.createLinkedInCampaign(campaignData);
			case "tiktok":
				return await this.createTikTokCampaign(campaignData);
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	/**
	 * Update campaign budget on a specific platform
	 */
	async updateCampaignBudget(
		platform: string,
		campaignId: string,
		budget: number,
	): Promise<void> {
		switch (platform) {
			case "google":
				return await this.updateGoogleCampaignBudget(campaignId, budget);
			case "facebook":
				return await this.updateFacebookCampaignBudget(campaignId, budget);
			case "linkedin":
				return await this.updateLinkedInCampaignBudget(campaignId, budget);
			case "tiktok":
				return await this.updateTikTokCampaignBudget(campaignId, budget);
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	/**
	 * Update campaign status on a specific platform
	 */
	async updateCampaignStatus(
		platform: string,
		campaignId: string,
		status: string,
	): Promise<void> {
		switch (platform) {
			case "google":
				return await this.updateGoogleCampaignStatus(campaignId, status);
			case "facebook":
				return await this.updateFacebookCampaignStatus(campaignId, status);
			case "linkedin":
				return await this.updateLinkedInCampaignStatus(campaignId, status);
			case "tiktok":
				return await this.updateTikTokCampaignStatus(campaignId, status);
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	/**
	 * Get performance data for a campaign
	 */
	async getPerformanceData(
		platform: string,
		campaignId: string,
		startDate: string,
		endDate: string,
	): Promise<PerformanceData[]> {
		switch (platform) {
			case "google":
				return await this.getGooglePerformanceData(
					campaignId,
					startDate,
					endDate,
				);
			case "facebook":
				return await this.getFacebookPerformanceData(
					campaignId,
					startDate,
					endDate,
				);
			case "linkedin":
				return await this.getLinkedInPerformanceData(
					campaignId,
					startDate,
					endDate,
				);
			case "tiktok":
				return await this.getTikTokPerformanceData(
					campaignId,
					startDate,
					endDate,
				);
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	/**
	 * Get platform-specific insights for a campaign
	 */
	async getPlatformInsights(
		platform: string,
		campaignId: string,
	): Promise<PlatformInsights> {
		switch (platform) {
			case "google":
				return await this.getGoogleInsights(campaignId);
			case "facebook":
				return await this.getFacebookInsights(campaignId);
			case "linkedin":
				return await this.getLinkedInInsights(campaignId);
			case "tiktok":
				return await this.getTikTokInsights(campaignId);
			default:
				throw new Error(`Unsupported platform: ${platform}`);
		}
	}

	// Google Ads Integration
	private async checkGoogleConnectivity(): Promise<boolean> {
		if (!this.config.google) return false;

		try {
			const response = await fetch(
				"https://googleads.googleapis.com/v14/customers",
				{
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
					},
				},
			);
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	private async syncGoogleCampaigns(): Promise<any[]> {
		if (!this.config.google) throw new Error("Google Ads not configured");

		try {
			const response = await fetch(
				`https://googleads.googleapis.com/v14/customers/${this.config.google.customerId}/campaigns`,
				{
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`Google Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.results || [];
		} catch (error) {
			console.error("Error syncing Google campaigns:", error);
			throw error;
		}
	}

	private async createGoogleCampaign(
		campaignData: CampaignData,
	): Promise<string> {
		if (!this.config.google) throw new Error("Google Ads not configured");

		try {
			const response = await fetch(
				`https://googleads.googleapis.com/v14/customers/${this.config.google.customerId}/campaigns`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: campaignData.name,
						campaignBudget: {
							amountMicros: campaignData.budget * 1000000, // Convert to micros
						},
						startDate: campaignData.startDate,
						endDate: campaignData.endDate,
						status: "PAUSED",
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Google Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.results[0].resourceName;
		} catch (error) {
			console.error("Error creating Google campaign:", error);
			throw error;
		}
	}

	private async updateGoogleCampaignBudget(
		campaignId: string,
		budget: number,
	): Promise<void> {
		if (!this.config.google) throw new Error("Google Ads not configured");

		try {
			const response = await fetch(
				`https://googleads.googleapis.com/v14/${campaignId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						campaignBudget: {
							amountMicros: budget * 1000000,
						},
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Google Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating Google campaign budget:", error);
			throw error;
		}
	}

	private async updateGoogleCampaignStatus(
		campaignId: string,
		status: string,
	): Promise<void> {
		if (!this.config.google) throw new Error("Google Ads not configured");

		try {
			const response = await fetch(
				`https://googleads.googleapis.com/v14/${campaignId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: status.toUpperCase(),
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Google Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating Google campaign status:", error);
			throw error;
		}
	}

	private async getGooglePerformanceData(
		campaignId: string,
		startDate: string,
		endDate: string,
	): Promise<PerformanceData[]> {
		if (!this.config.google) throw new Error("Google Ads not configured");

		try {
			const query = `
        SELECT 
          campaign.id,
          segments.date,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.cost_micros,
          metrics.ctr,
          metrics.average_cpc,
          metrics.conversions_value
        FROM campaign 
        WHERE campaign.id = ${campaignId}
        AND segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;

			const response = await fetch(
				`https://googleads.googleapis.com/v14/customers/${this.config.google.customerId}/googleAds:search`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.google.accessToken}`,
						"developer-token": this.config.google.developerToken,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ query }),
				},
			);

			if (!response.ok) {
				throw new Error(`Google Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.results.map((result: any) => ({
				impressions: result.metrics.impressions || 0,
				clicks: result.metrics.clicks || 0,
				conversions: result.metrics.conversions || 0,
				spend: (result.metrics.costMicros || 0) / 1000000,
				ctr: result.metrics.ctr || 0,
				cpc: (result.metrics.averageCpc || 0) / 1000000,
				roas:
					result.metrics.conversionsValue /
						(result.metrics.costMicros / 1000000) || 0,
				date: result.segments.date,
			}));
		} catch (error) {
			console.error("Error getting Google performance data:", error);
			throw error;
		}
	}

	private async getGoogleInsights(
		campaignId: string,
	): Promise<PlatformInsights> {
		// This would typically call Google Ads API for insights
		return {
			recommendations: [
				"Consider increasing budget for high-performing keywords",
				"Optimize ad copy for better click-through rates",
				"Review negative keyword lists to improve targeting",
			],
			optimizationSuggestions: [
				"Adjust bid strategies for better performance",
				"Test new ad variations",
				"Review audience targeting settings",
			],
			performanceTrends: [],
			budgetRecommendations: [],
		};
	}

	// Facebook Ads Integration
	private async checkFacebookConnectivity(): Promise<boolean> {
		if (!this.config.facebook) return false;

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${this.config.facebook.adAccountId}`,
				{
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
					},
				},
			);
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	private async syncFacebookCampaigns(): Promise<any[]> {
		if (!this.config.facebook) throw new Error("Facebook Ads not configured");

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${this.config.facebook.adAccountId}/campaigns`,
				{
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`Facebook Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.data || [];
		} catch (error) {
			console.error("Error syncing Facebook campaigns:", error);
			throw error;
		}
	}

	private async createFacebookCampaign(
		campaignData: CampaignData,
	): Promise<string> {
		if (!this.config.facebook) throw new Error("Facebook Ads not configured");

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${this.config.facebook.adAccountId}/campaigns`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: campaignData.name,
						objective: campaignData.objective,
						status: "PAUSED",
						daily_budget: campaignData.budget,
						start_time: campaignData.startDate,
						stop_time: campaignData.endDate,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Facebook Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.id;
		} catch (error) {
			console.error("Error creating Facebook campaign:", error);
			throw error;
		}
	}

	private async updateFacebookCampaignBudget(
		campaignId: string,
		budget: number,
	): Promise<void> {
		if (!this.config.facebook) throw new Error("Facebook Ads not configured");

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${campaignId}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						daily_budget: budget,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Facebook Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating Facebook campaign budget:", error);
			throw error;
		}
	}

	private async updateFacebookCampaignStatus(
		campaignId: string,
		status: string,
	): Promise<void> {
		if (!this.config.facebook) throw new Error("Facebook Ads not configured");

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${campaignId}`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: status.toUpperCase(),
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`Facebook Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating Facebook campaign status:", error);
			throw error;
		}
	}

	private async getFacebookPerformanceData(
		campaignId: string,
		startDate: string,
		endDate: string,
	): Promise<PerformanceData[]> {
		if (!this.config.facebook) throw new Error("Facebook Ads not configured");

		try {
			const response = await fetch(
				`https://graph.facebook.com/v18.0/${campaignId}/insights?date_preset=custom&time_range={'since':'${startDate}','until':'${endDate}'}&fields=impressions,clicks,conversions,spend,ctr,cpc,roas`,
				{
					headers: {
						Authorization: `Bearer ${this.config.facebook.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`Facebook Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.data.map((insight: any) => ({
				impressions: insight.impressions || 0,
				clicks: insight.clicks || 0,
				conversions: insight.conversions || 0,
				spend: insight.spend || 0,
				ctr: insight.ctr || 0,
				cpc: insight.cpc || 0,
				roas: insight.roas || 0,
				date: insight.date_start,
			}));
		} catch (error) {
			console.error("Error getting Facebook performance data:", error);
			throw error;
		}
	}

	private async getFacebookInsights(
		campaignId: string,
	): Promise<PlatformInsights> {
		return {
			recommendations: [
				"Optimize for video views to improve engagement",
				"Test different audience segments",
				"Use dynamic creative optimization",
			],
			optimizationSuggestions: [
				"Adjust targeting based on performance data",
				"Test different ad formats",
				"Optimize for mobile experience",
			],
			performanceTrends: [],
			budgetRecommendations: [],
		};
	}

	// LinkedIn Ads Integration
	private async checkLinkedInConnectivity(): Promise<boolean> {
		if (!this.config.linkedin) return false;

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/adAccounts/${this.config.linkedin.adAccountId}`,
				{
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
					},
				},
			);
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	private async syncLinkedInCampaigns(): Promise<any[]> {
		if (!this.config.linkedin) throw new Error("LinkedIn Ads not configured");

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/adAccounts/${this.config.linkedin.adAccountId}/campaigns`,
				{
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`LinkedIn Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.elements || [];
		} catch (error) {
			console.error("Error syncing LinkedIn campaigns:", error);
			throw error;
		}
	}

	private async createLinkedInCampaign(
		campaignData: CampaignData,
	): Promise<string> {
		if (!this.config.linkedin) throw new Error("LinkedIn Ads not configured");

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/adAccounts/${this.config.linkedin.adAccountId}/campaigns`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: campaignData.name,
						type: "SPONSORED_CONTENT",
						status: "PAUSED",
						dailyBudget: {
							amount: campaignData.budget,
							currencyCode: "USD",
						},
						startDate: campaignData.startDate,
						endDate: campaignData.endDate,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`LinkedIn Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.id;
		} catch (error) {
			console.error("Error creating LinkedIn campaign:", error);
			throw error;
		}
	}

	private async updateLinkedInCampaignBudget(
		campaignId: string,
		budget: number,
	): Promise<void> {
		if (!this.config.linkedin) throw new Error("LinkedIn Ads not configured");

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/campaigns/${campaignId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						dailyBudget: {
							amount: budget,
							currencyCode: "USD",
						},
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`LinkedIn Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating LinkedIn campaign budget:", error);
			throw error;
		}
	}

	private async updateLinkedInCampaignStatus(
		campaignId: string,
		status: string,
	): Promise<void> {
		if (!this.config.linkedin) throw new Error("LinkedIn Ads not configured");

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/campaigns/${campaignId}`,
				{
					method: "PATCH",
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						status: status.toUpperCase(),
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`LinkedIn Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating LinkedIn campaign status:", error);
			throw error;
		}
	}

	private async getLinkedInPerformanceData(
		campaignId: string,
		startDate: string,
		endDate: string,
	): Promise<PerformanceData[]> {
		if (!this.config.linkedin) throw new Error("LinkedIn Ads not configured");

		try {
			const response = await fetch(
				`https://api.linkedin.com/v2/campaigns/${campaignId}/analytics?dateRange.start.day=${startDate}&dateRange.end.day=${endDate}`,
				{
					headers: {
						Authorization: `Bearer ${this.config.linkedin.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`LinkedIn Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.elements.map((element: any) => ({
				impressions: element.impressions || 0,
				clicks: element.clicks || 0,
				conversions: element.conversions || 0,
				spend: element.spend || 0,
				ctr: element.ctr || 0,
				cpc: element.cpc || 0,
				roas: element.roas || 0,
				date: element.dateRange.start.day,
			}));
		} catch (error) {
			console.error("Error getting LinkedIn performance data:", error);
			throw error;
		}
	}

	private async getLinkedInInsights(
		campaignId: string,
	): Promise<PlatformInsights> {
		return {
			recommendations: [
				"Focus on professional audience targeting",
				"Use sponsored content for better engagement",
				"Optimize for B2B conversion goals",
			],
			optimizationSuggestions: [
				"Test different job title targeting",
				"Use company size filters",
				"Optimize for lead generation",
			],
			performanceTrends: [],
			budgetRecommendations: [],
		};
	}

	// TikTok Ads Integration
	private async checkTikTokConnectivity(): Promise<boolean> {
		if (!this.config.tiktok) return false;

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/advertiser/info/",
				{
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
					},
				},
			);
			return response.ok;
		} catch (error) {
			return false;
		}
	}

	private async syncTikTokCampaigns(): Promise<any[]> {
		if (!this.config.tiktok) throw new Error("TikTok Ads not configured");

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/campaign/get/",
				{
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`TikTok Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.data.list || [];
		} catch (error) {
			console.error("Error syncing TikTok campaigns:", error);
			throw error;
		}
	}

	private async createTikTokCampaign(
		campaignData: CampaignData,
	): Promise<string> {
		if (!this.config.tiktok) throw new Error("TikTok Ads not configured");

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/campaign/create/",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						advertiser_id: this.config.tiktok.adAccountId,
						campaign_name: campaignData.name,
						objective: campaignData.objective,
						budget_mode: "BUDGET_MODE_DAY",
						budget: campaignData.budget,
						schedule_start_time: campaignData.startDate,
						schedule_end_time: campaignData.endDate,
						status: "PAUSED",
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`TikTok Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.data.campaign_id;
		} catch (error) {
			console.error("Error creating TikTok campaign:", error);
			throw error;
		}
	}

	private async updateTikTokCampaignBudget(
		campaignId: string,
		budget: number,
	): Promise<void> {
		if (!this.config.tiktok) throw new Error("TikTok Ads not configured");

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/campaign/update/",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						advertiser_id: this.config.tiktok.adAccountId,
						campaign_id: campaignId,
						budget: budget,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`TikTok Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating TikTok campaign budget:", error);
			throw error;
		}
	}

	private async updateTikTokCampaignStatus(
		campaignId: string,
		status: string,
	): Promise<void> {
		if (!this.config.tiktok) throw new Error("TikTok Ads not configured");

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/campaign/update/",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						advertiser_id: this.config.tiktok.adAccountId,
						campaign_id: campaignId,
						status: status.toUpperCase(),
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`TikTok Ads API error: ${response.statusText}`);
			}
		} catch (error) {
			console.error("Error updating TikTok campaign status:", error);
			throw error;
		}
	}

	private async getTikTokPerformanceData(
		campaignId: string,
		startDate: string,
		endDate: string,
	): Promise<PerformanceData[]> {
		if (!this.config.tiktok) throw new Error("TikTok Ads not configured");

		try {
			const response = await fetch(
				"https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${this.config.tiktok.accessToken}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						advertiser_id: this.config.tiktok.adAccountId,
						service_type: "AUCTION",
						report_type: "BASIC",
						data_level: "CAMPAIGN",
						dimensions: ["campaign_id", "stat_time_day"],
						metrics: [
							"impressions",
							"clicks",
							"conversions",
							"spend",
							"ctr",
							"cpc",
							"roas",
						],
						start_date: startDate,
						end_date: endDate,
						filtering: [
							{
								field_name: "campaign_id",
								filter_type: "IN",
								filter_value: [campaignId],
							},
						],
					}),
				},
			);

			if (!response.ok) {
				throw new Error(`TikTok Ads API error: ${response.statusText}`);
			}

			const data = await response.json();
			return data.data.list.map((item: any) => ({
				impressions: item.impressions || 0,
				clicks: item.clicks || 0,
				conversions: item.conversions || 0,
				spend: item.spend || 0,
				ctr: item.ctr || 0,
				cpc: item.cpc || 0,
				roas: item.roas || 0,
				date: item.stat_time_day,
			}));
		} catch (error) {
			console.error("Error getting TikTok performance data:", error);
			throw error;
		}
	}

	private async getTikTokInsights(
		campaignId: string,
	): Promise<PlatformInsights> {
		return {
			recommendations: [
				"Focus on creative video content",
				"Target younger demographics",
				"Use trending hashtags and sounds",
			],
			optimizationSuggestions: [
				"Test different video lengths",
				"Optimize for mobile viewing",
				"Use user-generated content",
			],
			performanceTrends: [],
			budgetRecommendations: [],
		};
	}
}
