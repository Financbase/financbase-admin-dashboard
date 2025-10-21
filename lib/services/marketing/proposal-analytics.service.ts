import {
	and,
	asc,
	avg,
	count,
	desc,
	eq,
	gte,
	lte,
	sql,
	sum,
} from "drizzle-orm";
import {
	ArrowUpDown,
	BarChart3,
	Clock,
	Filter,
	PiggyBank,
	Plus,
} from "lucide-react";
import { db } from "../db/connection";
import {
	type Proposal,
	type ProposalActivity,
	type ProposalStep,
	proposalActivities,
	proposalSteps,
	proposalTemplates,
	proposals,
} from "../db/schema-proposals";

export interface ProposalAnalyticsData {
	// Overview metrics
	totalProposals: number;
	activeProposals: number;
	completedProposals: number;
	conversionRate: number;

	// Financial metrics
	totalValue: number;
	averageValue: number;
	wonValue: number;
	lostValue: number;

	// Performance metrics
	averageResponseTime: number; // in days
	averageCompletionTime: number; // in days

	// Trends
	proposalsByMonth: Array<{
		month: string;
		count: number;
		value: number;
		conversionRate: number;
	}>;

	// Category breakdown
	proposalsByCategory: Array<{
		category: string;
		count: number;
		value: number;
		conversionRate: number;
	}>;

	// Status distribution
	statusDistribution: Array<{
		status: string;
		count: number;
		percentage: number;
	}>;

	// Top performers
	topTemplates: Array<{
		templateId: string;
		name: string;
		usageCount: number;
		conversionRate: number;
	}>;

	// Recent activity
	recentActivity: Array<{
		id: string;
		action: string;
		description: string;
		createdAt: Date;
		proposalTitle: string;
	}>;
}

export class ProposalAnalyticsService {
	/**
	 * Get comprehensive proposal analytics for a user
	 */
	async getProposalAnalytics(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<ProposalAnalyticsData> {
		// Build date filter conditions
		const dateConditions = [];
		if (startDate) {
			dateConditions.push(gte(proposals.createdAt, startDate));
		}
		if (endDate) {
			dateConditions.push(lte(proposals.createdAt, endDate));
		}

		// Get all proposals with optional date filtering
		let proposalsQuery = db
			.select()
			.from(proposals)
			.where(eq(proposals.userId, userId));
		if (dateConditions.length > 0) {
			proposalsQuery = proposalsQuery.where(and(...dateConditions));
		}
		const allProposals = await proposalsQuery;

		// Basic metrics
		const totalProposals = allProposals.length;
		const activeProposals = allProposals.filter(
			(p) => p.status === "sent" || p.status === "viewed",
		).length;
		const completedProposals = allProposals.filter(
			(p) => p.status === "accepted",
		).length;

		// Financial metrics
		const totalValue = allProposals.reduce((sum, p) => {
			return sum + (Number.parseFloat(p.budget?.toString() || "0") || 0);
		}, 0);

		const wonValue = allProposals
			.filter((p) => p.status === "accepted")
			.reduce(
				(sum, p) => sum + (Number.parseFloat(p.budget?.toString() || "0") || 0),
				0,
			);

		const lostValue = allProposals
			.filter((p) => p.status === "rejected" || p.status === "expired")
			.reduce(
				(sum, p) => sum + (Number.parseFloat(p.budget?.toString() || "0") || 0),
				0,
			);

		// Performance metrics
		const responseTimes = allProposals
			.filter((p) => p.sentAt && (p.viewedAt || p.acceptedAt))
			.map((p) => {
				const responseDate = p.viewedAt || p.acceptedAt;
				return (
					(responseDate?.getTime() - p.sentAt?.getTime()) /
					(1000 * 60 * 60 * 24)
				); // Convert to days
			});

		const completionTimes = allProposals
			.filter((p) => p.createdAt && p.acceptedAt)
			.map((p) => {
				return (
					(p.acceptedAt?.getTime() - p.createdAt.getTime()) /
					(1000 * 60 * 60 * 24)
				); // Convert to days
			});

		// Monthly trends
		const proposalsByMonth = await this.getProposalsByMonth(
			userId,
			startDate,
			endDate,
		);

		// Category breakdown
		const proposalsByCategory = await this.getProposalsByCategory(
			userId,
			startDate,
			endDate,
		);

		// Status distribution
		const statusDistribution = await this.getStatusDistribution(userId);

		// Top templates
		const topTemplates = await this.getTopTemplates(userId);

		// Recent activity
		const recentActivity = await this.getRecentActivity(userId);

		return {
			totalProposals,
			activeProposals,
			completedProposals,
			conversionRate:
				totalProposals > 0 ? (completedProposals / totalProposals) * 100 : 0,

			totalValue,
			averageValue: totalProposals > 0 ? totalValue / totalProposals : 0,
			wonValue,
			lostValue,

			averageResponseTime:
				responseTimes.length > 0
					? responseTimes.reduce((sum, time) => sum + time, 0) /
						responseTimes.length
					: 0,
			averageCompletionTime:
				completionTimes.length > 0
					? completionTimes.reduce((sum, time) => sum + time, 0) /
						completionTimes.length
					: 0,

			proposalsByMonth,
			proposalsByCategory,
			statusDistribution,
			topTemplates,
			recentActivity,
		};
	}

	/**
	 * Get proposals grouped by month
	 */
	private async getProposalsByMonth(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<
		Array<{
			month: string;
			count: number;
			value: number;
			conversionRate: number;
		}>
	> {
		const dateConditions = [];
		if (startDate) {
			dateConditions.push(gte(proposals.createdAt, startDate));
		}
		if (endDate) {
			dateConditions.push(lte(proposals.createdAt, endDate));
		}

		const monthlyData = await db
			.select({
				month: sql<string>`TO_CHAR(${proposals.createdAt}, 'YYYY-MM')`,
				count: count(),
				totalValue: sum(proposals.budget),
				acceptedCount: sql<number>`COUNT(*) FILTER (WHERE ${proposals.status} = 'accepted')`,
			})
			.from(proposals)
			.where(and(eq(proposals.userId, userId), ...dateConditions))
			.groupBy(sql`TO_CHAR(${proposals.createdAt}, 'YYYY-MM')`)
			.orderBy(sql`TO_CHAR(${proposals.createdAt}, 'YYYY-MM')`);

		return monthlyData.map((item) => ({
			month: item.month,
			count: Number.parseInt(item.count?.toString() || "0"),
			value: Number.parseFloat(item.totalValue?.toString() || "0"),
			conversionRate:
				Number.parseInt(item.count?.toString() || "0") > 0
					? (Number.parseInt(item.acceptedCount?.toString() || "0") /
							Number.parseInt(item.count?.toString() || "0")) *
						100
					: 0,
		}));
	}

	/**
	 * Get proposals grouped by category
	 */
	private async getProposalsByCategory(
		userId: string,
		startDate?: Date,
		endDate?: Date,
	): Promise<
		Array<{
			category: string;
			count: number;
			value: number;
			conversionRate: number;
		}>
	> {
		// For now, we'll use a simple category grouping based on proposal titles
		// In a real implementation, you might want to add a category field to proposals
		const categoryGroups = {
			"Web Development": [
				"website",
				"web",
				"frontend",
				"backend",
				"full-stack",
			],
			"Mobile Development": ["mobile", "app", "ios", "android", "react-native"],
			Design: ["design", "ui", "ux", "graphic", "branding"],
			Consulting: ["consulting", "strategy", "planning", "analysis"],
			Marketing: ["marketing", "seo", "content", "social-media"],
			Other: [],
		};

		const allProposals = await this.getProposals(userId, startDate, endDate);

		const categoryData = Object.entries(categoryGroups)
			.map(([category, keywords]) => {
				const categoryProposals = allProposals.filter(
					(p) =>
						keywords.some(
							(keyword) =>
								p.title.toLowerCase().includes(keyword) ||
								p.description?.toLowerCase().includes(keyword),
						) ||
						(category === "Other" &&
							!keywords.some(
								(keyword) =>
									p.title.toLowerCase().includes(keyword) ||
									p.description?.toLowerCase().includes(keyword),
							)),
				);

				const count = categoryProposals.length;
				const value = categoryProposals.reduce(
					(sum, p) =>
						sum + (Number.parseFloat(p.budget?.toString() || "0") || 0),
					0,
				);
				const acceptedCount = categoryProposals.filter(
					(p) => p.status === "accepted",
				).length;

				return {
					category,
					count,
					value,
					conversionRate: count > 0 ? (acceptedCount / count) * 100 : 0,
				};
			})
			.filter((item) => item.count > 0);

		return categoryData.sort((a, b) => b.value - a.value);
	}

	/**
	 * Get status distribution
	 */
	private async getStatusDistribution(userId: string): Promise<
		Array<{
			status: string;
			count: number;
			percentage: number;
		}>
	> {
		const statusCounts = await db
			.select({
				status: proposals.status,
				count: count(),
			})
			.from(proposals)
			.where(eq(proposals.userId, userId))
			.groupBy(proposals.status);

		const total = statusCounts.reduce(
			(sum, item) => sum + Number.parseInt(item.count?.toString() || "0"),
			0,
		);

		return statusCounts
			.map((item) => ({
				status: item.status,
				count: Number.parseInt(item.count?.toString() || "0"),
				percentage:
					total > 0
						? (Number.parseInt(item.count?.toString() || "0") / total) * 100
						: 0,
			}))
			.sort((a, b) => b.count - a.count);
	}

	/**
	 * Get top performing templates
	 */
	private async getTopTemplates(userId: string): Promise<
		Array<{
			templateId: string;
			name: string;
			usageCount: number;
			conversionRate: number;
		}>
	> {
		// Get templates with their usage stats
		const templates = await db
			.select({
				id: proposalTemplates.id,
				name: proposalTemplates.name,
				usageCount: proposalTemplates.usageCount,
			})
			.from(proposalTemplates)
			.where(eq(proposalTemplates.userId, userId))
			.orderBy(desc(proposalTemplates.usageCount))
			.limit(10);

		// For each template, calculate conversion rate by looking at proposals created from it
		// This would require tracking which proposals were created from which templates
		// For now, we'll return basic usage stats

		return templates.map((template) => ({
			templateId: template.id,
			name: template.name,
			usageCount: Number.parseInt(template.usageCount?.toString() || "0"),
			conversionRate: 0, // Would need to implement tracking
		}));
	}

	/**
	 * Get recent activity
	 */
	private async getRecentActivity(userId: string): Promise<
		Array<{
			id: string;
			action: string;
			description: string;
			createdAt: Date;
			proposalTitle: string;
		}>
	> {
		const activities = await db
			.select({
				id: proposalActivities.id,
				action: proposalActivities.action,
				description: proposalActivities.description,
				createdAt: proposalActivities.createdAt,
				proposalTitle: proposals.title,
			})
			.from(proposalActivities)
			.innerJoin(proposals, eq(proposalActivities.proposalId, proposals.id))
			.where(eq(proposals.userId, userId))
			.orderBy(desc(proposalActivities.createdAt))
			.limit(20);

		return activities.map((activity) => ({
			id: activity.id,
			action: activity.action,
			description: activity.description,
			createdAt: activity.createdAt,
			proposalTitle: activity.proposalTitle,
		}));
	}

	/**
	 * Get proposal conversion funnel
	 */
	async getConversionFunnel(userId: string): Promise<{
		created: number;
		sent: number;
		viewed: number;
		accepted: number;
		conversionRates: {
			sentToCreated: number;
			viewedToSent: number;
			acceptedToViewed: number;
			overall: number;
		};
	}> {
		const allProposals = await db
			.select()
			.from(proposals)
			.where(eq(proposals.userId, userId));

		const created = allProposals.length;
		const sent = allProposals.filter((p) => p.sentAt).length;
		const viewed = allProposals.filter((p) => p.viewedAt).length;
		const accepted = allProposals.filter((p) => p.acceptedAt).length;

		return {
			created,
			sent,
			viewed,
			accepted,
			conversionRates: {
				sentToCreated: created > 0 ? (sent / created) * 100 : 0,
				viewedToSent: sent > 0 ? (viewed / sent) * 100 : 0,
				acceptedToViewed: viewed > 0 ? (accepted / viewed) * 100 : 0,
				overall: created > 0 ? (accepted / created) * 100 : 0,
			},
		};
	}

	/**
	 * Get proposal performance by time period
	 */
	async getPerformanceByPeriod(
		userId: string,
		period: "week" | "month" | "quarter" | "year",
	): Promise<{
		period: string;
		proposalsCreated: number;
		proposalsAccepted: number;
		totalValue: number;
		averageValue: number;
		conversionRate: number;
	}> {
		const now = new Date();
		let startDate: Date;

		switch (period) {
			case "week":
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case "month":
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case "quarter":
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case "year":
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
		}

		const proposalsInPeriod = await db
			.select()
			.from(proposals)
			.where(
				and(eq(proposals.userId, userId), gte(proposals.createdAt, startDate)),
			);

		const proposalsCreated = proposalsInPeriod.length;
		const proposalsAccepted = proposalsInPeriod.filter(
			(p) => p.acceptedAt,
		).length;
		const totalValue = proposalsInPeriod.reduce(
			(sum, p) => sum + (Number.parseFloat(p.budget?.toString() || "0") || 0),
			0,
		);

		return {
			period,
			proposalsCreated,
			proposalsAccepted,
			totalValue,
			averageValue: proposalsCreated > 0 ? totalValue / proposalsCreated : 0,
			conversionRate:
				proposalsCreated > 0 ? (proposalsAccepted / proposalsCreated) * 100 : 0,
		};
	}
}
