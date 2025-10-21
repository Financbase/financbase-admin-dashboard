import { BarChart3, Filter, Info, XCircle } from "lucide-react";
import { redisCache } from "../redis-cache";

// Helper function to get Redis client
function getRedisClient() {
	// Access the underlying Redis client through the cache manager
	// This is a workaround since the raw Redis client isn't exported
	return (redisCache as any).redis || redisCache;
}

export class ProposalCacheService {
	private static readonly DEFAULT_TTL = 300; // 5 minutes
	private static readonly KEY_PREFIX = "proposal";

	/**
	 * Generate cache key for proposals list
	 */
	private static getProposalsKey(
		userId: string,
		filters?: Record<string, any>,
	): string {
		const filterStr = filters ? JSON.stringify(filters) : "";
		return `${ProposalCacheService.KEY_PREFIX}:proposals:${userId}:${Buffer.from(filterStr).toString("base64")}`;
	}

	/**
	 * Generate cache key for proposal details
	 */
	private static getProposalKey(proposalId: string): string {
		return `${ProposalCacheService.KEY_PREFIX}:proposal:${proposalId}`;
	}

	/**
	 * Generate cache key for analytics
	 */
	private static getAnalyticsKey(
		userId: string,
		type: string,
		params?: Record<string, any>,
	): string {
		const paramStr = params ? JSON.stringify(params) : "";
		return `${ProposalCacheService.KEY_PREFIX}:analytics:${userId}:${type}:${Buffer.from(paramStr).toString("base64")}`;
	}

	/**
	 * Cache proposals list
	 */
	static async cacheProposals(
		userId: string,
		proposals: any[],
		filters?: Record<string, any>,
		options: CacheOptions = {},
	): Promise<void> {
		const key = ProposalCacheService.getProposalsKey(userId, filters);
		const ttl = options.ttl || ProposalCacheService.DEFAULT_TTL;

		try {
			const redis = getRedisClient();
			await redis.setex(key, ttl, JSON.stringify(proposals));

			// Set tags for invalidation
			if (options.tags) {
				await ProposalCacheService.setCacheTags(key, options.tags);
			}
		} catch (error) {
			console.error("Failed to cache proposals:", error);
		}
	}

	/**
	 * Get cached proposals
	 */
	static async getCachedProposals(
		userId: string,
		filters?: Record<string, any>,
	): Promise<any[] | null> {
		const key = ProposalCacheService.getProposalsKey(userId, filters);

		try {
			const redis = getRedisClient();
			const cached = await redis.get(key);
			return cached ? JSON.parse(cached) : null;
		} catch (error) {
			console.error("Failed to get cached proposals:", error);
			return null;
		}
	}

	/**
	 * Cache proposal details
	 */
	static async cacheProposal(
		proposalId: string,
		proposal: any,
		options: CacheOptions = {},
	): Promise<void> {
		const key = ProposalCacheService.getProposalKey(proposalId);
		const ttl = options.ttl || ProposalCacheService.DEFAULT_TTL;

		try {
			const redis = getRedisClient();
			await redis.setex(key, ttl, JSON.stringify(proposal));

			if (options.tags) {
				await ProposalCacheService.setCacheTags(key, options.tags);
			}
		} catch (error) {
			console.error("Failed to cache proposal:", error);
		}
	}

	/**
	 * Get cached proposal
	 */
	static async getCachedProposal(proposalId: string): Promise<any | null> {
		const key = ProposalCacheService.getProposalKey(proposalId);

		try {
			const redis = getRedisClient();
			const cached = await redis.get(key);
			return cached ? JSON.parse(cached) : null;
		} catch (error) {
			console.error("Failed to get cached proposal:", error);
			return null;
		}
	}

	/**
	 * Cache analytics data
	 */
	static async cacheAnalytics(
		userId: string,
		type: string,
		data: any,
		params?: Record<string, any>,
		options: CacheOptions = {},
	): Promise<void> {
		const key = ProposalCacheService.getAnalyticsKey(userId, type, params);
		const ttl = options.ttl || 600; // 10 minutes for analytics

		try {
			const redis = getRedisClient();
			await redis.setex(key, ttl, JSON.stringify(data));

			if (options.tags) {
				await ProposalCacheService.setCacheTags(key, options.tags);
			}
		} catch (error) {
			console.error("Failed to cache analytics:", error);
		}
	}

	/**
	 * Get cached analytics
	 */
	static async getCachedAnalytics(
		userId: string,
		type: string,
		params?: Record<string, any>,
	): Promise<any | null> {
		const key = ProposalCacheService.getAnalyticsKey(userId, type, params);

		try {
			const redis = getRedisClient();
			const cached = await redis.get(key);
			return cached ? JSON.parse(cached) : null;
		} catch (error) {
			console.error("Failed to get cached analytics:", error);
			return null;
		}
	}

	/**
	 * Invalidate cache by user
	 */
	static async invalidateUserCache(userId: string): Promise<void> {
		try {
			const pattern = `${ProposalCacheService.KEY_PREFIX}:${userId}:*`;
			const redis = getRedisClient();
			const keys = await redis.keys(pattern);

			if (keys.length > 0) {
				await redis.del(...keys);
				console.log(
					`Invalidated ${keys.length} cache entries for user ${userId}`,
				);
			}
		} catch (error) {
			console.error("Failed to invalidate user cache:", error);
		}
	}

	/**
	 * Invalidate cache by proposal
	 */
	static async invalidateProposalCache(proposalId: string): Promise<void> {
		try {
			const keys = [
				ProposalCacheService.getProposalKey(proposalId),
				// Also invalidate analytics that might include this proposal
				ProposalCacheService.getAnalyticsKey("*", "overview", { proposalId }),
			].filter(
				(key) =>
					key !==
					ProposalCacheService.getAnalyticsKey("*", "overview", { proposalId }),
			);

			const redis = getRedisClient();
			if (keys.length > 0) {
				await redis.del(...keys);
				console.log(`Invalidated cache for proposal ${proposalId}`);
			}
		} catch (error) {
			console.error("Failed to invalidate proposal cache:", error);
		}
	}

	/**
	 * Invalidate cache by tags
	 */
	static async invalidateByTags(tags: string[]): Promise<void> {
		try {
			const tagKeys = tags.map(
				(tag) => `${ProposalCacheService.KEY_PREFIX}:tags:${tag}`,
			);

			for (const tagKey of tagKeys) {
				const redis = getRedisClient();
				const keys = await redis.smembers(tagKey);
				if (keys.length > 0) {
					await redis.del(...keys);
					await redis.del(tagKey);
				}
			}

			console.log(`Invalidated cache for tags: ${tags.join(", ")}`);
		} catch (error) {
			console.error("Failed to invalidate cache by tags:", error);
		}
	}

	/**
	 * Set cache tags for invalidation
	 */
	private static async setCacheTags(
		key: string,
		tags: string[],
	): Promise<void> {
		try {
			for (const tag of tags) {
				const tagKey = `${ProposalCacheService.KEY_PREFIX}:tags:${tag}`;
				const redis = getRedisClient();
				await redis.sadd(tagKey, key);
				// Set tag to expire after cache TTL + buffer
				await redis.expire(tagKey, ProposalCacheService.DEFAULT_TTL + 60);
			}
		} catch (error) {
			console.error("Failed to set cache tags:", error);
		}
	}

	/**
	 * Clear all proposal cache
	 */
	static async clearAllCache(): Promise<void> {
		try {
			const pattern = `${ProposalCacheService.KEY_PREFIX}:*`;
			const redis = getRedisClient();
			const keys = await redis.keys(pattern);

			if (keys.length > 0) {
				await redis.del(...keys);
				console.log(`Cleared ${keys.length} cache entries`);
			}
		} catch (error) {
			console.error("Failed to clear cache:", error);
		}
	}

	/**
	 * Get cache statistics
	 */
	static async getCacheStats(): Promise<{
		totalKeys: number;
		memoryUsage: string;
		hitRate: number;
	}> {
		try {
			const redis = getRedisClient();
			const keys = await redis.keys(`${ProposalCacheService.KEY_PREFIX}:*`);
			const info = await redis.info("memory");

			// Extract memory usage (simplified)
			const memoryUsage =
				info
					.split("\r\n")
					.find((line: string) => line.startsWith("used_memory_human:"))
					?.split(":")[1] || "0B";

			return {
				totalKeys: keys.length,
				memoryUsage,
				hitRate: 0, // Would need to track hits/misses for this
			};
		} catch (error) {
			console.error("Failed to get cache stats:", error);
			return {
				totalKeys: 0,
				memoryUsage: "0B",
				hitRate: 0,
			};
		}
	}
}
