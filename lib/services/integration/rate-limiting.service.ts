/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import {
	BarChart3,
	Code,
	Database,
	LayoutDashboard,
	Settings,
	XCircle,
} from "lucide-react";
import {
	type ApiEvent,
	type ApiHealthMetric,
	type NewApiEvent,
	type NewApiHealthMetric,
	type NewRateLimit,
	type NewRateLimitViolation,
	type RateLimit,
	type RateLimitViolation,
	apiEvents,
	apiHealthMetrics,
	rateLimitViolations,
	rateLimits,
} from "../../drizzle/schema/rate-limiting";
import { getRawSqlConnection } from "../../db";
import { ApiErrorHandler } from "../../api-error-handler";

/**
 * Helper function to execute parameterized SQL queries
 * Converts PostgreSQL-style parameterized queries ($1, $2, etc.) to Neon's template literal format
 */
async function query<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
	const connection = getRawSqlConnection();
	
	// Convert $1, $2, etc. format to template literal format
	// Split query by parameter placeholders and build template literal parts
	const parts: string[] = [];
	const values: any[] = [];
	
	let currentIndex = 0;
	const paramRegex = /\$(\d+)/g;
	let match;
	
	while ((match = paramRegex.exec(sqlQuery)) !== null) {
		// Add the text before this parameter
		parts.push(sqlQuery.substring(currentIndex, match.index));
		
		// Get the parameter index (1-based to 0-based)
		const paramIndex = parseInt(match[1], 10) - 1;
		if (paramIndex >= 0 && paramIndex < params.length) {
			values.push(params[paramIndex]);
		} else {
			values.push(null);
		}
		
		currentIndex = match.index + match[0].length;
	}
	
	// Add the remaining text after the last parameter
	parts.push(sqlQuery.substring(currentIndex));
	
	// Execute using Neon's template literal API
	// Neon expects (strings, ...values) format
	const result = await (connection as any)(parts as any, ...values);
	return result.rows as T[];
}

export interface RateLimitConfig {
	requestsPerMinute: number;
	requestsPerHour: number;
	requestsPerDay: number;
	targetType: "ip" | "user" | "endpoint" | "global";
	targetValue?: string;
	enabled?: boolean;
}

export interface RateLimitCheckResult {
	allowed: boolean;
	resetTime?: Date;
	remainingRequests?: number;
	violation?: {
		type: "per_minute" | "per_hour" | "per_day";
		requestCount: number;
		limitValue: number;
	};
}

export interface RateLimitingSummary {
	totalRequests: number;
	throttledRequests: number;
	blockedRequests: number;
	allowedRequests: number;
	avgResponseTime: number;
	uniqueIps: number;
	timeWindow: string;
}

export class RateLimitingService {
	/**
	 * Log an API event
	 */
	async logApiEvent(event: NewApiEvent): Promise<ApiEvent> {
		try {
			const events = await query<ApiEvent>(
				`INSERT INTO api_events (ip, endpoint, method, status, response_time, user_agent, metadata, clerk_user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
				[
					event.ip,
					event.endpoint,
					event.method,
					event.status,
					event.responseTime,
					event.userAgent,
					event.metadata ? JSON.stringify(event.metadata) : null,
					event.clerkUserId,
				],
			);

			return events[0];
		} catch (error) {
			console.error("Error logging API event:", error);
			throw new Error("Failed to log API event: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Get API events with filtering
	 */
	async getApiEvents(
		filters: {
			limit?: number;
			status?: string;
			endpoint?: string;
			hours?: number;
			ip?: string;
			clerkUserId?: string;
		} = {},
	): Promise<ApiEvent[]> {
		try {
			const {
				limit = 50,
				status,
				endpoint,
				hours = 24,
				ip,
				clerkUserId,
			} = filters;

			let queryStr = `
        SELECT * FROM api_events
        WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
      `;

			const params = [];
			let paramIndex = 1;

			if (status) {
				queryStr += ` AND status = $${paramIndex}`;
				params.push(status);
				paramIndex++;
			}

			if (endpoint) {
				queryStr += ` AND endpoint ILIKE $${paramIndex}`;
				params.push(`%${endpoint}%`);
				paramIndex++;
			}

			if (ip) {
				queryStr += ` AND ip = $${paramIndex}`;
				params.push(ip);
				paramIndex++;
			}

			if (clerkUserId) {
				queryStr += ` AND clerk_user_id = $${paramIndex}`;
				params.push(clerkUserId);
				paramIndex++;
			}

			queryStr += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
			params.push(limit);

			return await query<ApiEvent>(queryStr, params);
		} catch (error) {
			console.error("Error fetching API events:", error);
			throw new Error("Failed to fetch API events: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Create a new rate limit rule
	 */
	async createRateLimit(rateLimit: NewRateLimit): Promise<RateLimit> {
		try {
			const limits = await query<RateLimit>(
				`INSERT INTO rate_limits (name, description, requests_per_minute, requests_per_hour, requests_per_day, target_type, target_value, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
				[
					rateLimit.name,
					rateLimit.description,
					rateLimit.requestsPerMinute,
					rateLimit.requestsPerHour,
					rateLimit.requestsPerDay,
					rateLimit.targetType,
					rateLimit.targetValue,
					rateLimit.isActive ?? true,
				],
			);

			return limits[0];
		} catch (error) {
			console.error("Error creating rate limit:", error);
			throw new Error("Failed to create rate limit: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Get all active rate limit rules
	 */
	async getActiveRateLimits(): Promise<RateLimit[]> {
		try {
			return await query<RateLimit>(
				"SELECT * FROM rate_limits WHERE is_active = true ORDER BY created_at DESC",
			);
		} catch (error) {
			console.error("Error fetching rate limits:", error);
			throw new Error("Failed to fetch rate limits: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Log a rate limit violation
	 */
	async logRateLimitViolation(
		violation: NewRateLimitViolation,
	): Promise<RateLimitViolation> {
		try {
			const violations = await query<RateLimitViolation>(
				`INSERT INTO rate_limit_violations (rate_limit_id, target_type, target_value, violation_type, request_count, limit_value, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
				[
					violation.rateLimitId,
					violation.targetType,
					violation.targetValue,
					violation.violationType,
					violation.requestCount,
					violation.limitValue,
					violation.metadata ? JSON.stringify(violation.metadata) : null,
				],
			);

			return violations[0];
		} catch (error) {
			console.error("Error logging rate limit violation:", error);
			throw new Error("Failed to log rate limit violation: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Get rate limit violations
	 */
	async getRateLimitViolations(
		filters: {
			hours?: number;
			targetType?: string;
			targetValue?: string;
		} = {},
	): Promise<RateLimitViolation[]> {
		try {
			const { hours = 24, targetType, targetValue } = filters;

			let queryStr = `
        SELECT v.*, r.name as rate_limit_name
        FROM rate_limit_violations v
        JOIN rate_limits r ON v.rate_limit_id = r.id
        WHERE v.timestamp >= NOW() - INTERVAL '${hours} hours'
      `;

			const params = [];
			let paramIndex = 1;

			if (targetType) {
				queryStr += ` AND v.target_type = $${paramIndex}`;
				params.push(targetType);
				paramIndex++;
			}

			if (targetValue) {
				queryStr += ` AND v.target_value = $${paramIndex}`;
				params.push(targetValue);
				paramIndex++;
			}

			queryStr += " ORDER BY v.timestamp DESC";

			const violations = await query<any>(queryStr, params);

			return violations.map((v) => ({
				id: v.id,
				rateLimitId: v.rate_limit_id,
				targetType: v.target_type,
				targetValue: v.target_value,
				violationType: v.violation_type,
				requestCount: v.request_count,
				limitValue: v.limit_value,
				timestamp: v.timestamp,
				metadata: v.metadata,
			}));
		} catch (error) {
			console.error("Error fetching rate limit violations:", error);
			throw new Error("Failed to fetch rate limit violations: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Get API health metrics
	 */
	async getApiHealthMetrics(
		filters: {
			hours?: number;
			endpoint?: string;
			method?: string;
		} = {},
	): Promise<ApiHealthMetric[]> {
		try {
			const { hours = 24, endpoint, method } = filters;

			let queryStr = `
        SELECT * FROM api_health_metrics
        WHERE time_window >= NOW() - INTERVAL '${hours} hours'
      `;

			const params = [];
			let paramIndex = 1;

			if (endpoint) {
				queryStr += ` AND endpoint = $${paramIndex}`;
				params.push(endpoint);
				paramIndex++;
			}

			if (method) {
				queryStr += ` AND method = $${paramIndex}`;
				params.push(method);
				paramIndex++;
			}

			queryStr += " ORDER BY time_window DESC";

			return await query<ApiHealthMetric>(queryStr, params);
		} catch (error) {
			console.error("Error fetching API health metrics:", error);
			throw new Error("Failed to fetch API health metrics: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Get aggregated summary statistics
	 */
	/**
	 * Get summary statistics (alias for getSummaryStatistics)
	 */
	async getSummary(hours = 24): Promise<RateLimitingSummary> {
		return this.getSummaryStatistics(hours);
	}

	/**
	 * Get aggregated summary statistics
	 */
	async getSummaryStatistics(hours = 24): Promise<RateLimitingSummary> {
		try {
			const queryStr = `
        SELECT
          COUNT(*) as total_requests,
          COUNT(*) FILTER (WHERE status = 'throttled') as throttled_requests,
          COUNT(*) FILTER (WHERE status = 'blocked') as blocked_requests,
          COUNT(*) FILTER (WHERE status = 'allowed') as allowed_requests,
          AVG(response_time) as avg_response_time,
          COUNT(DISTINCT ip) as unique_ips
        FROM api_events
        WHERE timestamp >= NOW() - INTERVAL '${hours} hours'
      `;

			const results = await query<any>(queryStr);

			if (results.length === 0) {
				return {
					totalRequests: 0,
					throttledRequests: 0,
					blockedRequests: 0,
					allowedRequests: 0,
					avgResponseTime: 0,
					uniqueIps: 0,
					timeWindow: `${hours} hours`,
				};
			}

			const result = results[0];

			return {
				totalRequests: Number.parseInt(result.total_requests) || 0,
				throttledRequests: Number.parseInt(result.throttled_requests) || 0,
				blockedRequests: Number.parseInt(result.blocked_requests) || 0,
				allowedRequests: Number.parseInt(result.allowed_requests) || 0,
				avgResponseTime: Number.parseFloat(result.avg_response_time) || 0,
				uniqueIps: Number.parseInt(result.unique_ips) || 0,
				timeWindow: `${hours} hours`,
			};
		} catch (error) {
			console.error("Error fetching summary statistics:", error);
			throw new Error("Failed to fetch summary statistics: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Seed the database with sample data for testing
	 */
	async seedSampleData(): Promise<void> {
		try {
			// Create default rate limits if they don't exist
			const existingLimits = await this.getActiveRateLimits();

			if (existingLimits.length === 0) {
				// Create default global rate limit
				await this.createRateLimit({
					name: "Global API Rate Limit",
					description: "Default rate limit for all API endpoints",
					requestsPerMinute: 60,
					requestsPerHour: 1000,
					requestsPerDay: 10000,
					targetType: "global",
					isActive: true,
				});

				// Create dashboard-specific rate limit
				await this.createRateLimit({
					name: "Dashboard Rate Limit",
					description: "Rate limit for dashboard endpoints",
					requestsPerMinute: 30,
					requestsPerHour: 500,
					requestsPerDay: 5000,
					targetType: "endpoint",
					targetValue: "/api/dashboard",
					isActive: true,
				});
			}

			// Generate sample events for the last 24 hours
			const sampleEvents = this.generateSampleEvents(100);
			for (const event of sampleEvents) {
				await this.logApiEvent(event);
			}

			console.log("Sample data seeded successfully");
		} catch (error) {
			console.error("Error seeding sample data:", error);
			throw new Error("Failed to seed sample data: " + (error instanceof Error ? error.message : String(error)));
		}
	}

	/**
	 * Generate sample API events for testing
	 */
	private generateSampleEvents(count: number): NewApiEvent[] {
		const events: NewApiEvent[] = [];
		const endpoints = [
			"/api/users",
			"/api/dashboard",
			"/api/analytics",
			"/api/reports",
			"/api/settings",
		];
		const methods = ["GET", "POST", "PUT", "DELETE"];
		const statuses = ["allowed", "throttled", "blocked"];
		const ips = ["192.168.1.1", "192.168.1.2", "10.0.0.1", "172.16.0.1"];

		for (let i = 0; i < count; i++) {
			const randomHours = Math.floor(Math.random() * 24);
			const timestamp = new Date(Date.now() - randomHours * 60 * 60 * 1000);

			events.push({
				ip: ips[Math.floor(Math.random() * ips.length)],
				endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
				method: methods[Math.floor(Math.random() * methods.length)],
				status: statuses[Math.floor(Math.random() * statuses.length)],
				responseTime: Math.floor(Math.random() * 1000) + 50, // 50-1050ms
				userAgent:
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
				metadata: {
					userId: `user_${Math.floor(Math.random() * 100)}`,
					sessionId: `session_${Math.floor(Math.random() * 1000)}`,
				},
				clerkUserId:
					Math.random() > 0.3
						? `user_${Math.floor(Math.random() * 1000)}`
						: null,
			});
		}

		return events;
	}
}

// Export singleton instance
export const rateLimitingService = new RateLimitingService();
