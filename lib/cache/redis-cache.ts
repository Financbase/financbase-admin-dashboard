/**
 * Redis cache utilities for improved performance
 * Provides caching layer for frequently accessed data
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


export interface CacheOptions {
	ttl?: number; // Time to live in seconds
	namespace?: string;
}

export interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

/**
 * Redis cache service
 */
export class RedisCache {
	private static instance: RedisCache;
	private cache: Map<string, CacheEntry<any>> = new Map();
	private defaultTTL = 300; // 5 minutes default

	/**
	 * Get singleton instance
	 */
	static getInstance(): RedisCache {
		if (!RedisCache.instance) {
			RedisCache.instance = new RedisCache();
		}
		return RedisCache.instance;
	}

	/**
	 * Set a value in cache
	 */
	async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
		const ttl = options?.ttl || this.defaultTTL;
		const namespace = options?.namespace || 'default';

		const namespacedKey = `${namespace}:${key}`;
		const expiresAt = Date.now() + (ttl * 1000);

		this.cache.set(namespacedKey, {
			value,
			expiresAt,
		});

		// In a real Redis implementation, this would store in Redis
		console.log(`Cached ${namespacedKey} for ${ttl} seconds`);
	}

	/**
	 * Get a value from cache
	 */
	async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
		const namespace = options?.namespace || 'default';
		const namespacedKey = `${namespace}:${key}`;

		const entry = this.cache.get(namespacedKey);

		if (!entry) {
			return null;
		}

		// Check if expired
		if (Date.now() > entry.expiresAt) {
			this.cache.delete(namespacedKey);
			return null;
		}

		return entry.value as T;
	}

	/**
	 * Delete a value from cache
	 */
	async delete(key: string, options?: CacheOptions): Promise<void> {
		const namespace = options?.namespace || 'default';
		const namespacedKey = `${namespace}:${key}`;

		this.cache.delete(namespacedKey);
	}

	/**
	 * Clear all cache entries for a namespace
	 */
	async clearNamespace(namespace: string): Promise<void> {
		const keysToDelete: string[] = [];

		for (const key of this.cache.keys()) {
			if (key.startsWith(`${namespace}:`)) {
				keysToDelete.push(key);
			}
		}

		keysToDelete.forEach(key => this.cache.delete(key));
	}

	/**
	 * Clear all cache
	 */
	async clearAll(): Promise<void> {
		this.cache.clear();
	}

	/**
	 * Get cache statistics
	 */
	getStats(): {
		totalEntries: number;
		namespaces: string[];
		memoryUsage: number;
	} {
		const namespaces = new Set<string>();

		for (const key of this.cache.keys()) {
			const namespace = key.split(':')[0];
			namespaces.add(namespace);
		}

		// Estimate memory usage (rough calculation)
		const memoryUsage = this.cache.size * 100; // Approximate bytes per entry

		return {
			totalEntries: this.cache.size,
			namespaces: Array.from(namespaces),
			memoryUsage,
		};
	}

	/**
	 * Cache wrapper for async functions
	 */
	async cached<T>(
		key: string,
		fn: () => Promise<T>,
		options?: CacheOptions
	): Promise<T> {
		// Try to get from cache first
		const cached = await this.get<T>(key, options);
		if (cached !== null) {
			return cached;
		}

		// Execute function and cache result
		const result = await fn();
		await this.set(key, result, options);

		return result;
	}
}

/**
 * Cache utility functions
 */
export const cache = {
	/**
	 * Cache user data
	 */
	user: {
		get: (userId: string) => RedisCache.getInstance().get(`user:${userId}`, { namespace: 'users' }),
		set: (userId: string, data: any) => RedisCache.getInstance().set(`user:${userId}`, data, { namespace: 'users', ttl: 1800 }), // 30 minutes
	},

	/**
	 * Cache blog posts
	 */
	blog: {
		get: (postId: string) => RedisCache.getInstance().get(`post:${postId}`, { namespace: 'blog' }),
		set: (postId: string, data: any) => RedisCache.getInstance().set(`post:${postId}`, data, { namespace: 'blog', ttl: 3600 }), // 1 hour
	},

	/**
	 * Cache analytics data
	 */
	analytics: {
		get: (key: string) => RedisCache.getInstance().get(key, { namespace: 'analytics' }),
		set: (key: string, data: any) => RedisCache.getInstance().set(key, data, { namespace: 'analytics', ttl: 300 }), // 5 minutes
	},

	/**
	 * Cache API responses
	 */
	api: {
		get: (endpoint: string) => RedisCache.getInstance().get(`api:${endpoint}`, { namespace: 'api' }),
		set: (endpoint: string, data: any) => RedisCache.getInstance().set(`api:${endpoint}`, data, { namespace: 'api', ttl: 60 }), // 1 minute
	},
};

/**
 * Cache middleware for API routes
 */
export function withCache<T extends any[]>(
	fn: (...args: T) => Promise<any>,
	options?: CacheOptions
) {
	return async (...args: T) => {
		const cacheKey = JSON.stringify(args);
		const cacheInstance = RedisCache.getInstance();

		return cacheInstance.cached(cacheKey, () => fn(...args), options);
	};
}

export default RedisCache;
