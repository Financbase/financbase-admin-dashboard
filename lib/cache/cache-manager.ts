/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client (using Upstash for serverless)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Cache tags for invalidation
  namespace?: string; // Cache namespace
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  hitRate: number;
}

export class CacheManager {
  private static instance: CacheManager;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    hitRate: 0,
  };

  private constructor() {}

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string, namespace?: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const value = await redis.get(fullKey);
      
      if (value !== null) {
        this.stats.hits++;
        this.updateHitRate();
        return value as T;
      } else {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(
    key: string, 
    value: T, 
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, options.namespace);
      const ttl = options.ttl || 3600; // Default 1 hour
      
      await redis.setex(fullKey, ttl, JSON.stringify(value));
      
      // Store tags for invalidation
      if (options.tags && options.tags.length > 0) {
        await this.addTags(fullKey, options.tags);
      }
      
      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      await redis.del(fullKey);
      
      // Remove from tag indexes
      await this.removeFromTags(fullKey);
      
      this.stats.deletes++;
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys
   */
  async deleteMany(keys: string[], namespace?: string): Promise<number> {
    try {
      const fullKeys = keys.map(key => this.buildKey(key, namespace));
      const result = await redis.del(...fullKeys);
      
      // Remove from tag indexes
      for (const key of fullKeys) {
        await this.removeFromTags(key);
      }
      
      this.stats.deletes += result;
      return result;
    } catch (error) {
      console.error('Cache deleteMany error:', error);
      return 0;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    try {
      let totalDeleted = 0;
      
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await redis.smembers(tagKey);
        
        if (keys.length > 0) {
          const result = await redis.del(...keys);
          totalDeleted += result;
          
          // Remove tag index
          await redis.del(tagKey);
        }
      }
      
      this.stats.deletes += totalDeleted;
      return totalDeleted;
    } catch (error) {
      console.error('Cache invalidateByTags error:', error);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      await redis.flushall();
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        hitRate: 0,
      };
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      hitRate: 0,
    };
  }

  /**
   * Check if key exists
   */
  async exists(key: string, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  async getTTL(key: string, namespace?: string): Promise<number> {
    try {
      const fullKey = this.buildKey(key, namespace);
      return await redis.ttl(fullKey);
    } catch (error) {
      console.error('Cache getTTL error:', error);
      return -1;
    }
  }

  /**
   * Set TTL for a key
   */
  async setTTL(key: string, ttl: number, namespace?: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key, namespace);
      const result = await redis.expire(fullKey, ttl);
      return result === 1;
    } catch (error) {
      console.error('Cache setTTL error:', error);
      return false;
    }
  }

  /**
   * Get or set pattern (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key, options.namespace);
      if (cached !== null) {
        return cached;
      }

      // If not in cache, fetch and store
      const value = await fetcher();
      await this.set(key, value, options);
      return value;
    } catch (error) {
      console.error('Cache getOrSet error:', error);
      // Fallback to direct fetch
      return await fetcher();
    }
  }

  /**
   * Warm cache with multiple keys
   */
  async warmCache<T>(
    keyValuePairs: Array<{ key: string; value: T; options?: CacheOptions }>
  ): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      
      for (const { key, value, options = {} } of keyValuePairs) {
        const fullKey = this.buildKey(key, options.namespace);
        const ttl = options.ttl || 3600;
        
        pipeline.setex(fullKey, ttl, JSON.stringify(value));
        
        if (options.tags && options.tags.length > 0) {
          for (const tag of options.tags) {
            pipeline.sadd(`tag:${tag}`, fullKey);
          }
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache warmCache error:', error);
    }
  }

  /**
   * Build full cache key
   */
  private buildKey(key: string, namespace?: string): string {
    const prefix = process.env.CACHE_PREFIX || 'financbase';
    return namespace ? `${prefix}:${namespace}:${key}` : `${prefix}:${key}`;
  }

  /**
   * Add tags to a key
   */
  private async addTags(key: string, tags: string[]): Promise<void> {
    try {
      const pipeline = redis.pipeline();
      
      for (const tag of tags) {
        pipeline.sadd(`tag:${tag}`, key);
      }
      
      await pipeline.exec();
    } catch (error) {
      console.error('Cache addTags error:', error);
    }
  }

  /**
   * Remove key from tag indexes
   */
  private async removeFromTags(key: string): Promise<void> {
    try {
      // Get all tags for this key
      const tagKeys = await redis.keys('tag:*');
      
      if (tagKeys.length > 0) {
        const pipeline = redis.pipeline();
        
        for (const tagKey of tagKeys) {
          pipeline.srem(tagKey, key);
        }
        
        await pipeline.exec();
      }
    } catch (error) {
      console.error('Cache removeFromTags error:', error);
    }
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// Export singleton instance
export const cache = CacheManager.getInstance();

// Cache decorator for methods
export function cached(options: CacheOptions = {}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await cache.get(cacheKey, options.namespace);
      if (cached !== null) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cache.set(cacheKey, result, options);
      
      return result;
    };
  };
}

// Cache invalidation helpers
export class CacheInvalidation {
  /**
   * Invalidate user-related cache
   */
  static async invalidateUser(userId: string): Promise<void> {
    await cache.invalidateByTags([`user:${userId}`, 'users']);
  }

  /**
   * Invalidate organization-related cache
   */
  static async invalidateOrganization(organizationId: string): Promise<void> {
    await cache.invalidateByTags([`org:${organizationId}`, 'organizations']);
  }

  /**
   * Invalidate invoice-related cache
   */
  static async invalidateInvoices(userId?: string, organizationId?: string): Promise<void> {
    const tags = ['invoices'];
    if (userId) tags.push(`user:${userId}`);
    if (organizationId) tags.push(`org:${organizationId}`);
    
    await cache.invalidateByTags(tags);
  }

  /**
   * Invalidate expense-related cache
   */
  static async invalidateExpenses(userId?: string, organizationId?: string): Promise<void> {
    const tags = ['expenses'];
    if (userId) tags.push(`user:${userId}`);
    if (organizationId) tags.push(`org:${organizationId}`);
    
    await cache.invalidateByTags(tags);
  }

  /**
   * Invalidate report-related cache
   */
  static async invalidateReports(userId?: string, organizationId?: string): Promise<void> {
    const tags = ['reports'];
    if (userId) tags.push(`user:${userId}`);
    if (organizationId) tags.push(`org:${organizationId}`);
    
    await cache.invalidateByTags(tags);
  }

  /**
   * Invalidate dashboard-related cache
   */
  static async invalidateDashboards(userId?: string, organizationId?: string): Promise<void> {
    const tags = ['dashboards'];
    if (userId) tags.push(`user:${userId}`);
    if (organizationId) tags.push(`org:${organizationId}`);
    
    await cache.invalidateByTags(tags);
  }
}
