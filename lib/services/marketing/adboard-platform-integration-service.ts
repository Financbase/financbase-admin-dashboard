import { db } from "@/lib/db";
import {
	adboardCampaignPlatforms,
	adboardCampaigns,
	adboardPerformanceMetrics,
	adboardPlatformIntegrations,
} from "@/lib/db/schemas/adboard.schema";
import { and, desc, eq } from "drizzle-orm";
import {
	Briefcase,
	CheckCircle,
	Clock,
	Info,
	MessageCircle,
	Puzzle,
	Settings,
	Video,
	XCircle,
} from "lucide-react";
import { z } from "zod";

// Platform-specific API configurations
const PLATFORM_CONFIGS = {
	meta: {
		name: "Meta (Facebook/Instagram)",
		authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
		tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
		apiBase: "https://graph.facebook.com/v18.0",
		scopes: ["ads_read", "ads_management", "business_management"],
		rateLimit: 200, // requests per hour
	},
	google: {
		name: "Google Ads",
		authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
		tokenUrl: "https://oauth2.googleapis.com/token",
		apiBase: "https://googleads.googleapis.com/v14",
		scopes: ["https://www.googleapis.com/auth/adwords"],
		rateLimit: 10000, // requests per day
	},
	tiktok: {
		name: "TikTok Ads",
		authUrl: "https://business-api.tiktok.com/open_api/v1.3/oauth2/authorize/",
		tokenUrl:
			"https://business-api.tiktok.com/open_api/v1.3/oauth2/access_token/",
		apiBase: "https://business-api.tiktok.com/open_api/v1.3",
		scopes: ["user.info.basic", "video.list", "video.upload"],
		rateLimit: 1000, // requests per hour
	},
	twitter: {
		name: "Twitter Ads",
		authUrl: "https://twitter.com/i/oauth2/authorize",
		tokenUrl: "https://api.twitter.com/2/oauth2/token",
		apiBase: "https://api.twitter.com/2",
		scopes: ["tweet.read", "tweet.write", "users.read"],
		rateLimit: 300, // requests per 15 minutes
	},
	linkedin: {
		name: "LinkedIn Ads",
		authUrl: "https://www.linkedin.com/oauth/v2/authorization",
		tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
		apiBase: "https://api.linkedin.com/v2",
		scopes: ["r_ads", "rw_ads"],
		rateLimit: 500, // requests per day
	},
};

// Validation schemas
const ConnectPlatformSchema = z.object({
	platform: z.enum(["meta", "google", "tiktok", "twitter", "linkedin"]),
	accountId: z.string().min(1, "Account ID is required"),
	accountName: z.string().optional(),
	accessToken: z.string().min(1, "Access token is required"),
	refreshToken: z.string().optional(),
	tokenExpiresAt: z.string().optional(),
	settings: z.record(z.any()).optional(),
});

const SyncDataSchema = z.object({
	platform: z.enum(["meta", "google", "tiktok", "twitter", "linkedin"]),
	dateRange: z
		.object({
			start: z.string(),
			end: z.string(),
		})
		.optional(),
	campaignIds: z.array(z.string()).optional(),
});

export interface PlatformAccount {
	id: string;
	platform: string;
	accountId: string;
	accountName: string | null;
	isActive: boolean;
	lastSyncAt: Date | null;
	settings: any;
	createdAt: Date;
}

export interface SyncResult {
	success: boolean;
	campaignsSynced: number;
	adsSynced: number;
	metricsSynced: number;
	errors: string[];
	lastSyncAt: Date;
}

export class AdboardPlatformIntegrationService {
	/**
	 * Get OAuth URL for platform connection
	 */
	static getOAuthUrl(
		platform: string,
		userId: string,
		redirectUri: string,
	): string {
		const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
		if (!config) {
			throw new Error(`Unsupported platform: ${platform}`);
		}

		const params = new URLSearchParams({
			client_id: process.env[`${platform.toUpperCase()}_CLIENT_ID`] || "",
			redirect_uri: redirectUri,
			scope: config.scopes.join(" "),
			response_type: "code",
			state: `${userId}:${platform}`,
		});

		return `${config.authUrl}?${params.toString()}`;
	}

	/**
	 * Exchange authorization code for access token
	 */
	static async exchangeCodeForToken(
		platform: string,
		code: string,
		redirectUri: string,
	): Promise<{
		accessToken: string;
		refreshToken?: string;
		expiresIn?: number;
	}> {
		const config = PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
		if (!config) {
			throw new Error(`Unsupported platform: ${platform}`);
		}

		const response = await fetch(config.tokenUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: process.env[`${platform.toUpperCase()}_CLIENT_ID`] || "",
				client_secret:
					process.env[`${platform.toUpperCase()}_CLIENT_SECRET`] || "",
				code,
				redirect_uri: redirectUri,
				grant_type: "authorization_code",
			}),
		});

		if (!response.ok) {
			throw new Error(`Token exchange failed: ${response.statusText}`);
		}

		const data = await response.json();
		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresIn: data.expires_in,
		};
	}

	/**
	 * Connect a platform account
	 */
	static async connectPlatform(
		userId: string,
		data: z.infer<typeof ConnectPlatformSchema>,
	) {
		try {
			const validatedData = ConnectPlatformSchema.parse(data);

			// Check if account already exists
			const [existing] = await db
				.select()
				.from(adboardPlatformIntegrations)
				.where(
					and(
						eq(adboardPlatformIntegrations.userId, userId),
						eq(adboardPlatformIntegrations.platform, validatedData.platform),
						eq(adboardPlatformIntegrations.accountId, validatedData.accountId),
					),
				)
				.limit(1);

			if (existing) {
				// Update existing integration
				const [updated] = await db
					.update(adboardPlatformIntegrations)
					.set({
						accountName: validatedData.accountName,
						accessToken: validatedData.accessToken,
						refreshToken: validatedData.refreshToken,
						tokenExpiresAt: validatedData.tokenExpiresAt
							? new Date(validatedData.tokenExpiresAt)
							: null,
						isActive: true,
						settings: validatedData.settings,
						lastSyncAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(adboardPlatformIntegrations.id, existing.id))
					.returning();

				return {
					success: true,
					data: updated,
					message: "Platform account updated successfully",
				};
			}
			// Create new integration
			const [integration] = await db
				.insert(adboardPlatformIntegrations)
				.values({
					userId,
					platform: validatedData.platform,
					accountId: validatedData.accountId,
					accountName: validatedData.accountName,
					accessToken: validatedData.accessToken,
					refreshToken: validatedData.refreshToken,
					tokenExpiresAt: validatedData.tokenExpiresAt
						? new Date(validatedData.tokenExpiresAt)
						: null,
					isActive: true,
					settings: validatedData.settings,
					lastSyncAt: new Date(),
				})
				.returning();

			return {
				success: true,
				data: integration,
				message: "Platform account connected successfully",
			};
		} catch (error) {
			console.error("Error connecting platform:", error);
			if (error instanceof z.ZodError) {
				return {
					success: false,
					error: "Validation error",
					details: error.errors,
				};
			}
			return {
				success: false,
				error: "Failed to connect platform account",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get connected platform accounts
	 */
	static async getConnectedPlatforms(userId: string) {
		try {
			const platforms = await db
				.select()
				.from(adboardPlatformIntegrations)
				.where(
					and(
						eq(adboardPlatformIntegrations.userId, userId),
						eq(adboardPlatformIntegrations.isActive, true),
					),
				)
				.orderBy(desc(adboardPlatformIntegrations.lastSyncAt));

			return {
				success: true,
				data: platforms,
			};
		} catch (error) {
			console.error("Error getting connected platforms:", error);
			return {
				success: false,
				error: "Failed to get connected platforms",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Sync data from platform
	 */
	static async syncPlatformData(
		userId: string,
		data: z.infer<typeof SyncDataSchema>,
	): Promise<SyncResult> {
		try {
			const validatedData = SyncDataSchema.parse(data);
			const { platform, dateRange, campaignIds } = validatedData;

			// Get platform integration
			const [integration] = await db
				.select()
				.from(adboardPlatformIntegrations)
				.where(
					and(
						eq(adboardPlatformIntegrations.userId, userId),
						eq(adboardPlatformIntegrations.platform, platform),
						eq(adboardPlatformIntegrations.isActive, true),
					),
				)
				.limit(1);

			if (!integration) {
				throw new Error(
					`No active integration found for platform: ${platform}`,
				);
			}

			// Check if token is expired
			if (
				integration.tokenExpiresAt &&
				integration.tokenExpiresAt < new Date()
			) {
				await AdboardPlatformIntegrationService.refreshToken(integration.id);
			}

			const syncResult: SyncResult = {
				success: true,
				campaignsSynced: 0,
				adsSynced: 0,
				metricsSynced: 0,
				errors: [],
				lastSyncAt: new Date(),
			};

			// Sync campaigns
			try {
				const campaigns = await AdboardPlatformIntegrationService.syncCampaigns(
					integration,
					dateRange,
				);
				syncResult.campaignsSynced = campaigns.length;
			} catch (error) {
				syncResult.errors.push(
					`Campaign sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}

			// Sync ads
			try {
				const ads = await AdboardPlatformIntegrationService.syncAds(
					integration,
					campaignIds,
				);
				syncResult.adsSynced = ads.length;
			} catch (error) {
				syncResult.errors.push(
					`Ad sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}

			// Sync performance metrics
			try {
				const metrics =
					await AdboardPlatformIntegrationService.syncPerformanceMetrics(
						integration,
						dateRange,
					);
				syncResult.metricsSynced = metrics.length;
			} catch (error) {
				syncResult.errors.push(
					`Metrics sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
				);
			}

			// Update last sync time
			await db
				.update(adboardPlatformIntegrations)
				.set({ lastSyncAt: new Date() })
				.where(eq(adboardPlatformIntegrations.id, integration.id));

			return syncResult;
		} catch (error) {
			console.error("Error syncing platform data:", error);
			return {
				success: false,
				campaignsSynced: 0,
				adsSynced: 0,
				metricsSynced: 0,
				errors: [error instanceof Error ? error.message : "Unknown error"],
				lastSyncAt: new Date(),
			};
		}
	}

	/**
	 * Sync campaigns from platform
	 */
	private static async syncCampaigns(
		integration: any,
		dateRange?: { start: string; end: string },
	) {
		const config =
			PLATFORM_CONFIGS[integration.platform as keyof typeof PLATFORM_CONFIGS];
		const url = `${config.apiBase}/campaigns`;

		const response = await fetch(url, {
			headers: {
				Authorization: `Bearer ${integration.accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
		}

		const data = await response.json();
		return data.campaigns || [];
	}

	/**
	 * Sync ads from platform
	 */
	private static async syncAds(integration: any, campaignIds?: string[]) {
		const config =
			PLATFORM_CONFIGS[integration.platform as keyof typeof PLATFORM_CONFIGS];
		const url = `${config.apiBase}/ads`;

		const params = new URLSearchParams();
		if (campaignIds) {
			params.append("campaign_ids", campaignIds.join(","));
		}

		const response = await fetch(`${url}?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${integration.accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch ads: ${response.statusText}`);
		}

		const data = await response.json();
		return data.ads || [];
	}

	/**
	 * Sync performance metrics from platform
	 */
	private static async syncPerformanceMetrics(
		integration: any,
		dateRange?: { start: string; end: string },
	) {
		const config =
			PLATFORM_CONFIGS[integration.platform as keyof typeof PLATFORM_CONFIGS];
		const url = `${config.apiBase}/insights`;

		const params = new URLSearchParams();
		if (dateRange) {
			params.append("date_start", dateRange.start);
			params.append("date_stop", dateRange.end);
		}

		const response = await fetch(`${url}?${params.toString()}`, {
			headers: {
				Authorization: `Bearer ${integration.accessToken}`,
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch metrics: ${response.statusText}`);
		}

		const data = await response.json();
		return data.data || [];
	}

	/**
	 * Refresh access token
	 */
	private static async refreshToken(integrationId: string) {
		const [integration] = await db
			.select()
			.from(adboardPlatformIntegrations)
			.where(eq(adboardPlatformIntegrations.id, integrationId))
			.limit(1);

		if (!integration || !integration.refreshToken) {
			throw new Error("No refresh token available");
		}

		const config =
			PLATFORM_CONFIGS[integration.platform as keyof typeof PLATFORM_CONFIGS];
		const response = await fetch(config.tokenUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id:
					process.env[`${integration.platform.toUpperCase()}_CLIENT_ID`] || "",
				client_secret:
					process.env[`${integration.platform.toUpperCase()}_CLIENT_SECRET`] ||
					"",
				refresh_token: integration.refreshToken,
				grant_type: "refresh_token",
			}),
		});

		if (!response.ok) {
			throw new Error(`Token refresh failed: ${response.statusText}`);
		}

		const data = await response.json();

		// Update integration with new token
		await db
			.update(adboardPlatformIntegrations)
			.set({
				accessToken: data.access_token,
				refreshToken: data.refresh_token || integration.refreshToken,
				tokenExpiresAt: data.expires_in
					? new Date(Date.now() + data.expires_in * 1000)
					: null,
				updatedAt: new Date(),
			})
			.where(eq(adboardPlatformIntegrations.id, integrationId));
	}

	/**
	 * Disconnect platform account
	 */
	static async disconnectPlatform(
		userId: string,
		platform: string,
		accountId: string,
	) {
		try {
			const [integration] = await db
				.select()
				.from(adboardPlatformIntegrations)
				.where(
					and(
						eq(adboardPlatformIntegrations.userId, userId),
						eq(adboardPlatformIntegrations.platform, platform),
						eq(adboardPlatformIntegrations.accountId, accountId),
					),
				)
				.limit(1);

			if (!integration) {
				return {
					success: false,
					error: "Platform integration not found",
				};
			}

			// Deactivate instead of deleting to preserve historical data
			await db
				.update(adboardPlatformIntegrations)
				.set({
					isActive: false,
					updatedAt: new Date(),
				})
				.where(eq(adboardPlatformIntegrations.id, integration.id));

			return {
				success: true,
				message: "Platform account disconnected successfully",
			};
		} catch (error) {
			console.error("Error disconnecting platform:", error);
			return {
				success: false,
				error: "Failed to disconnect platform account",
				details: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}

	/**
	 * Get platform-specific configuration
	 */
	static getPlatformConfig(platform: string) {
		return PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS];
	}

	/**
	 * Get all supported platforms
	 */
	static getSupportedPlatforms() {
		return Object.keys(PLATFORM_CONFIGS).map((platform) => ({
			id: platform,
			name: PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS].name,
			scopes:
				PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS].scopes,
			rateLimit:
				PLATFORM_CONFIGS[platform as keyof typeof PLATFORM_CONFIGS].rateLimit,
		}));
	}
}
