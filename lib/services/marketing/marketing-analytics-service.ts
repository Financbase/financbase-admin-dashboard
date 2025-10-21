import { getDbOrThrow } from "@/lib/db";
import {
	contactSubmissions,
	marketingEvents,
	marketingStats,
	userFeedback,
} from "@/lib/db/schemas/marketing.schema";
import { format, subDays } from "date-fns";
import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { BarChart3, Clock } from "lucide-react";

export interface MarketingAnalyticsData {
	period: {
		startDate: Date;
		endDate: Date;
		days: number;
	};
	stats: {
		totalEvents: number;
		uniqueUsers: number;
		uniqueSessions: number;
	};
	trends: Array<{
		date: string;
		eventCount: number;
		uniqueUsers: number;
	}>;
	componentPerformance: Array<{
		component: string;
		eventType: string;
		count: number;
	}>;
	pagePerformance: Array<{
		page: string;
		eventCount: number;
		uniqueUsers: number;
	}>;
	feedbackSummary: Array<{
		category: string;
		averageRating: number;
		totalFeedback: number;
		positiveCount: number;
		negativeCount: number;
	}>;
}

export interface MarketingStatsData {
	metricName: string;
	value: number;
	change?: number;
	trend?: number[];
	isActive: boolean;
	lastUpdated: Date;
}

export class MarketingAnalyticsService {
	/**
	 * Get comprehensive marketing analytics
	 */
	async getMarketingAnalytics(
		startDate?: Date,
		endDate?: Date,
		component?: string,
		page?: string,
	): Promise<MarketingAnalyticsData> {
		const days = startDate
			? Math.ceil((endDate || new Date()).getTime() - startDate.getTime()) /
				(1000 * 60 * 60 * 24)
			: 30;
		const actualStartDate = startDate || subDays(new Date(), days);
		const actualEndDate = endDate || new Date();

		// Build base query
		let eventsQuery = getDbOrThrow()
			.select()
			.from(marketingEvents)
			.where(
				and(
					gte(marketingEvents.timestamp, actualStartDate),
					lte(marketingEvents.timestamp, actualEndDate),
				),
			);

		if (component) {
			eventsQuery = eventsQuery.where(eq(marketingEvents.component, component));
		}
		if (page) {
			eventsQuery = eventsQuery.where(eq(marketingEvents.page, page));
		}

		// Get event statistics
		const eventStats = await getDbOrThrow()
			.select({
				totalEvents: count(),
				uniqueUsers: count(sql`DISTINCT ${marketingEvents.userId}`),
				uniqueSessions: count(sql`DISTINCT ${marketingEvents.sessionId}`),
			})
			.from(marketingEvents)
			.where(
				and(
					gte(marketingEvents.timestamp, actualStartDate),
					lte(marketingEvents.timestamp, actualEndDate),
				),
			);

		// Get daily trends
		const dailyTrends = await getDbOrThrow()
			.select({
				date: sql<string>`DATE(${marketingEvents.timestamp})`,
				eventCount: count(),
				uniqueUsers: count(sql`DISTINCT ${marketingEvents.userId}`),
			})
			.from(marketingEvents)
			.where(
				and(
					gte(marketingEvents.timestamp, actualStartDate),
					lte(marketingEvents.timestamp, actualEndDate),
				),
			)
			.groupBy(sql`DATE(${marketingEvents.timestamp})`)
			.orderBy(sql`DATE(${marketingEvents.timestamp})`);

		// Get component performance
		const componentPerformance = await getDbOrThrow()
			.select({
				component: marketingEvents.component,
				eventType: marketingEvents.eventType,
				count: count(),
			})
			.from(marketingEvents)
			.where(
				and(
					gte(marketingEvents.timestamp, actualStartDate),
					lte(marketingEvents.timestamp, actualEndDate),
				),
			)
			.groupBy(marketingEvents.component, marketingEvents.eventType)
			.orderBy(desc(count()));

		// Get page performance
		const pagePerformance = await getDbOrThrow()
			.select({
				page: marketingEvents.page,
				eventCount: count(),
				uniqueUsers: count(sql`DISTINCT ${marketingEvents.userId}`),
			})
			.from(marketingEvents)
			.where(
				and(
					gte(marketingEvents.timestamp, actualStartDate),
					lte(marketingEvents.timestamp, actualEndDate),
				),
			)
			.groupBy(marketingEvents.page)
			.orderBy(desc(count()));

		// Get feedback summary
		const feedbackSummary = await getDbOrThrow()
			.select({
				category: userFeedback.category,
				averageRating: sql<number>`AVG(${userFeedback.rating})`,
				totalFeedback: count(),
				positiveCount: count(
					sql`CASE WHEN ${userFeedback.sentiment} = 'positive' THEN 1 END`,
				),
				negativeCount: count(
					sql`CASE WHEN ${userFeedback.sentiment} = 'negative' THEN 1 END`,
				),
			})
			.from(userFeedback)
			.where(
				and(
					gte(userFeedback.createdAt, actualStartDate),
					lte(userFeedback.createdAt, actualEndDate),
				),
			)
			.groupBy(userFeedback.category);

		return {
			period: {
				startDate: actualStartDate,
				endDate: actualEndDate,
				days,
			},
			stats: eventStats[0] || {
				totalEvents: 0,
				uniqueUsers: 0,
				uniqueSessions: 0,
			},
			trends: dailyTrends,
			componentPerformance,
			pagePerformance,
			feedbackSummary,
		};
	}

	/**
	 * Track marketing event
	 */
	async trackEvent(
		eventType: string,
		component?: string,
		page?: string,
		properties?: Record<string, any>,
		userId?: string,
		sessionId?: string,
	): Promise<string> {
		const [newEvent] = await getDbOrThrow()
			.insert(marketingEvents)
			.values({
				userId: userId || null,
				sessionId: sessionId || null,
				eventType,
				component: component || null,
				page: page || null,
				properties: properties || null,
				timestamp: new Date(),
			})
			.returning({ id: marketingEvents.id });

		return newEvent.id;
	}

	/**
	 * Get real-time marketing stats
	 */
	async getMarketingStats(metricName?: string): Promise<MarketingStatsData[]> {
		let query = getDbOrThrow()
			.select()
			.from(marketingStats)
			.where(eq(marketingStats.isActive, true));

		if (metricName) {
			query = query.where(eq(marketingStats.metricName, metricName));
		}

		const stats = await query.orderBy(desc(marketingStats.lastUpdated));

		return stats.map((stat) => ({
			metricName: stat.metricName,
			value: Number.parseFloat(stat.value),
			change: stat.change ? Number.parseFloat(stat.change) : undefined,
			trend: (stat.trend as number[]) || undefined,
			isActive: stat.isActive,
			lastUpdated: stat.lastUpdated,
		}));
	}

	/**
	 * Update marketing stats
	 */
	async updateMarketingStats(
		metricName: string,
		value: number,
		change?: number,
		trend?: number[],
	): Promise<void> {
		const existingMetric = await getDbOrThrow()
			.select()
			.from(marketingStats)
			.where(eq(marketingStats.metricName, metricName))
			.limit(1);

		if (existingMetric.length > 0) {
			await getDbOrThrow()
				.update(marketingStats)
				.set({
					value: value.toString(),
					change: change ? change.toString() : null,
					trend: trend || null,
					lastUpdated: new Date(),
				})
				.where(eq(marketingStats.metricName, metricName));
		} else {
			await getDbOrThrow()
				.insert(marketingStats)
				.values({
					metricName,
					value: value.toString(),
					change: change ? change.toString() : null,
					trend: trend || null,
					lastUpdated: new Date(),
				});
		}
	}

	/**
	 * Get contact form analytics
	 */
	async getContactAnalytics(startDate?: Date, endDate?: Date) {
		const actualStartDate = startDate || subDays(new Date(), 30);
		const actualEndDate = endDate || new Date();

		const submissions = await getDbOrThrow()
			.select()
			.from(contactSubmissions)
			.where(
				and(
					gte(contactSubmissions.createdAt, actualStartDate),
					lte(contactSubmissions.createdAt, actualEndDate),
				),
			)
			.orderBy(desc(contactSubmissions.createdAt));

		const summary = await getDbOrThrow()
			.select({
				total: count(),
				newCount: count(
					sql`CASE WHEN ${contactSubmissions.status} = 'new' THEN 1 END`,
				),
				inProgressCount: count(
					sql`CASE WHEN ${contactSubmissions.status} = 'in_progress' THEN 1 END`,
				),
				resolvedCount: count(
					sql`CASE WHEN ${contactSubmissions.status} = 'resolved' THEN 1 END`,
				),
				urgentCount: count(
					sql`CASE WHEN ${contactSubmissions.priority} = 'urgent' THEN 1 END`,
				),
			})
			.from(contactSubmissions)
			.where(
				and(
					gte(contactSubmissions.createdAt, actualStartDate),
					lte(contactSubmissions.createdAt, actualEndDate),
				),
			);

		return {
			submissions,
			summary: summary[0] || {
				total: 0,
				newCount: 0,
				inProgressCount: 0,
				resolvedCount: 0,
				urgentCount: 0,
			},
		};
	}

	/**
	 * Get feedback analytics
	 */
	async getFeedbackAnalytics(
		category?: string,
		startDate?: Date,
		endDate?: Date,
	) {
		const actualStartDate = startDate || subDays(new Date(), 30);
		const actualEndDate = endDate || new Date();

		let query = getDbOrThrow()
			.select()
			.from(userFeedback)
			.where(
				and(
					gte(userFeedback.createdAt, actualStartDate),
					lte(userFeedback.createdAt, actualEndDate),
				),
			);

		if (category) {
			query = query.where(eq(userFeedback.category, category));
		}

		const feedback = await query.orderBy(desc(userFeedback.createdAt));

		const summary = await getDbOrThrow()
			.select({
				total: count(),
				averageRating: sql<number>`AVG(${userFeedback.rating})`,
				positiveCount: count(
					sql`CASE WHEN ${userFeedback.sentiment} = 'positive' THEN 1 END`,
				),
				negativeCount: count(
					sql`CASE WHEN ${userFeedback.sentiment} = 'negative' THEN 1 END`,
				),
				resolvedCount: count(
					sql`CASE WHEN ${userFeedback.isResolved} = true THEN 1 END`,
				),
			})
			.from(userFeedback)
			.where(
				and(
					gte(userFeedback.createdAt, actualStartDate),
					lte(userFeedback.createdAt, actualEndDate),
				),
			);

		return {
			feedback,
			summary: summary[0] || {
				total: 0,
				averageRating: 0,
				positiveCount: 0,
				negativeCount: 0,
				resolvedCount: 0,
			},
		};
	}
}

export const marketingAnalyticsService = new MarketingAnalyticsService();
