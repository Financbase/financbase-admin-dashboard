import { getDbOrThrow } from "@/lib/db";
import { landingPageAnalytics } from "@/lib/db/schemas/analytics.schema";
import { and, count, desc, eq, gte, sql } from "drizzle-orm";
import { BarChart3, XCircle } from "lucide-react";

/**
 * Landing Page Analytics Service
 * Tracks and retrieves analytics data for landing pages
 */

export interface PageViewEvent {
	landingPageId: number;
	sessionId: string;
	userId?: string;
	referrer?: string;
	userAgent?: string;
	ipAddress?: string;
	deviceType?: "desktop" | "mobile" | "tablet";
}

export interface ConversionEvent {
	landingPageId: number;
	sessionId: string;
	userId?: string;
	type: string; // 'cta_click', 'form_submit', 'link_click'
	metadata?: Record<string, unknown>;
}

export interface AnalyticsSummary {
	totalViews: number;
	uniqueVisitors: number;
	conversions: number;
	conversionRate: number;
	topReferrers: Array<{ referrer: string; count: number }>;
	deviceBreakdown: Array<{ deviceType: string; count: number }>;
	viewsByDay: Array<{ date: string; count: number }>;
}

/**
 * Track a page view event
 */
export async function trackPageView(event: PageViewEvent): Promise<void> {
	try {
		await getDbOrThrow()
			.insert(landingPageAnalytics)
			.values({
				landingPageId: event.landingPageId,
				sessionId: event.sessionId,
				userId: event.userId || null,
				eventType: "page_view",
				referrer: event.referrer || null,
				userAgent: event.userAgent || null,
				ipAddress: event.ipAddress || null,
				deviceType: event.deviceType || null,
				timestamp: new Date(),
				createdAt: new Date(),
			});
	} catch (error) {
		console.error("Error tracking page view:", error);
		throw error;
	}
}

/**
 * Track a conversion event (CTA click, form submit, etc.)
 */
export async function trackConversion(event: ConversionEvent): Promise<void> {
	try {
		await getDbOrThrow()
			.insert(landingPageAnalytics)
			.values({
				landingPageId: event.landingPageId,
				sessionId: event.sessionId,
				userId: event.userId || null,
				eventType: event.type,
				eventData: event.metadata ? JSON.stringify(event.metadata) : null,
				timestamp: new Date(),
				createdAt: new Date(),
			});
	} catch (error) {
		console.error("Error tracking conversion:", error);
		throw error;
	}
}

/**
 * Get analytics summary for a landing page
 */
export async function getPageAnalytics(
	landingPageId: number,
	dateRange?: { start: Date; end: Date },
): Promise<AnalyticsSummary> {
	try {
		const conditions = [eq(landingPageAnalytics.landingPageId, landingPageId)];

		if (dateRange) {
			conditions.push(gte(landingPageAnalytics.timestamp, dateRange.start));
			conditions.push(
				sql`${landingPageAnalytics.timestamp} <= ${dateRange.end}`,
			);
		}

		// Total views
		const viewsResult = await getDbOrThrow()
			.select({ count: count() })
			.from(landingPageAnalytics)
			.where(
				and(...conditions, eq(landingPageAnalytics.eventType, "page_view")),
			);

		const totalViews = viewsResult[0]?.count || 0;

		// Unique visitors (distinct session IDs)
		const uniqueVisitorsResult = await getDbOrThrow()
			.select({
				count: sql<number>`COUNT(DISTINCT ${landingPageAnalytics.sessionId})::int`,
			})
			.from(landingPageAnalytics)
			.where(
				and(...conditions, eq(landingPageAnalytics.eventType, "page_view")),
			);

		const uniqueVisitors = uniqueVisitorsResult[0]?.count || 0;

		// Conversions (all non-page_view events)
		const conversionsResult = await getDbOrThrow()
			.select({ count: count() })
			.from(landingPageAnalytics)
			.where(
				and(
					...conditions,
					sql`${landingPageAnalytics.eventType} != 'page_view'`,
				),
			);

		const conversions = conversionsResult[0]?.count || 0;

		// Conversion rate
		const conversionRate =
			totalViews > 0 ? (conversions / totalViews) * 100 : 0;

		// Top referrers
		const topReferrersResult = await getDbOrThrow()
			.select({
				referrer: landingPageAnalytics.referrer,
				count: count(),
			})
			.from(landingPageAnalytics)
			.where(
				and(
					...conditions,
					eq(landingPageAnalytics.eventType, "page_view"),
					sql`${landingPageAnalytics.referrer} IS NOT NULL`,
				),
			)
			.groupBy(landingPageAnalytics.referrer)
			.orderBy(desc(count()))
			.limit(5);

		const topReferrers = topReferrersResult.map((r) => ({
			referrer: r.referrer || "Direct",
			count: r.count,
		}));

		// Device breakdown
		const deviceBreakdownResult = await getDbOrThrow()
			.select({
				deviceType: landingPageAnalytics.deviceType,
				count: count(),
			})
			.from(landingPageAnalytics)
			.where(
				and(...conditions, eq(landingPageAnalytics.eventType, "page_view")),
			)
			.groupBy(landingPageAnalytics.deviceType);

		const deviceBreakdown = deviceBreakdownResult.map((d) => ({
			deviceType: d.deviceType || "unknown",
			count: d.count,
		}));

		// Views by day (last 7 days or within date range)
		const viewsByDayResult = await getDbOrThrow()
			.select({
				date: sql<string>`DATE(${landingPageAnalytics.timestamp})`,
				count: count(),
			})
			.from(landingPageAnalytics)
			.where(
				and(...conditions, eq(landingPageAnalytics.eventType, "page_view")),
			)
			.groupBy(sql`DATE(${landingPageAnalytics.timestamp})`)
			.orderBy(sql`DATE(${landingPageAnalytics.timestamp}) DESC`)
			.limit(7);

		const viewsByDay = viewsByDayResult.map((v) => ({
			date: v.date,
			count: v.count,
		}));

		return {
			totalViews,
			uniqueVisitors,
			conversions,
			conversionRate: Math.round(conversionRate * 100) / 100,
			topReferrers,
			deviceBreakdown,
			viewsByDay: viewsByDay.reverse(),
		};
	} catch (error) {
		console.error("Error getting page analytics:", error);
		throw error;
	}
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(
	landingPageId: number,
	dateRange?: { start: Date; end: Date },
): Promise<
	Array<{
		step: string;
		count: number;
	}>
> {
	try {
		const conditions = [eq(landingPageAnalytics.landingPageId, landingPageId)];

		if (dateRange) {
			conditions.push(gte(landingPageAnalytics.timestamp, dateRange.start));
			conditions.push(
				sql`${landingPageAnalytics.timestamp} <= ${dateRange.end}`,
			);
		}

		// Get counts for each event type
		const funnelResult = await getDbOrThrow()
			.select({
				eventType: landingPageAnalytics.eventType,
				count: count(),
			})
			.from(landingPageAnalytics)
			.where(and(...conditions))
			.groupBy(landingPageAnalytics.eventType)
			.orderBy(desc(count()));

		return funnelResult.map((item) => ({
			step: item.eventType,
			count: item.count,
		}));
	} catch (error) {
		console.error("Error getting conversion funnel:", error);
		throw error;
	}
}

/**
 * Get recent activity for a landing page
 */
export async function getRecentActivity(
	landingPageId: number,
	limit = 50,
): Promise<
	Array<{
		id: number;
		eventType: string;
		timestamp: Date;
		deviceType: string | null;
		referrer: string | null;
	}>
> {
	try {
		const result = await getDbOrThrow()
			.select({
				id: landingPageAnalytics.id,
				eventType: landingPageAnalytics.eventType,
				timestamp: landingPageAnalytics.timestamp,
				deviceType: landingPageAnalytics.deviceType,
				referrer: landingPageAnalytics.referrer,
			})
			.from(landingPageAnalytics)
			.where(eq(landingPageAnalytics.landingPageId, landingPageId))
			.orderBy(desc(landingPageAnalytics.timestamp))
			.limit(limit);

		return result.map((r) => ({
			id: r.id,
			eventType: r.eventType,
			timestamp: r.timestamp || new Date(),
			deviceType: r.deviceType,
			referrer: r.referrer,
		}));
	} catch (error) {
		console.error("Error getting recent activity:", error);
		throw error;
	}
}
