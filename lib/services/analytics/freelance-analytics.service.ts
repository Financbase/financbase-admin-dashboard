/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import {} from "lucide-react";
import { db } from "../db/connection";
import { clients, income, invoices } from "../db/schema-actual";
import {
	type ClientProfitability,
	type Project,
	type ProjectExpense,
	type ProjectTimeEntry,
	clientProfitability,
	projectExpenses,
	projectMilestones,
	projectTimeEntries,
	projects,
} from "../db/schema-freelance";

export interface ProjectROI {
	projectId: string;
	projectName: string;
	totalInvestment: number;
	totalReturn: number;
	roi: number;
	paybackPeriod: number; // in months
	profitMargin: number;
}

export interface ClientAnalytics {
	clientId: string;
	clientName: string;
	totalRevenue: number;
	totalExpenses: number;
	netProfit: number;
	profitMargin: number;
	averageHourlyRate: number;
	totalHours: number;
	projectsCompleted: number;
	averageProjectValue: number;
	paymentHistory: {
		averagePaymentTime: number; // in days
		onTimePaymentRate: number; // percentage
		totalInvoices: number;
		paidInvoices: number;
	};
	lifetimeValue: number;
	riskScore: number; // 1-10 scale
}

export interface TimeAnalytics {
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	averageHourlyRate: number;
	hourlyRateTrend: Array<{
		month: string;
		rate: number;
	}>;
	productivityMetrics: {
		hoursPerProject: number;
		projectsPerMonth: number;
		efficiencyScore: number;
	};
}

export interface RevenueAnalytics {
	totalRevenue: number;
	monthlyRevenue: Array<{
		month: string;
		revenue: number;
		growth: number;
	}>;
	revenueByClient: Array<{
		clientId: string;
		clientName: string;
		revenue: number;
		percentage: number;
	}>;
	revenueByProject: Array<{
		projectId: string;
		projectName: string;
		revenue: number;
		percentage: number;
	}>;
	recurringRevenue: number;
	oneTimeRevenue: number;
}

export interface FreelanceDashboard {
	overview: {
		activeProjects: number;
		completedProjects: number;
		totalRevenue: number;
		totalExpenses: number;
		netProfit: number;
		averageHourlyRate: number;
		clientCount: number;
	};
	topClients: ClientAnalytics[];
	projectROI: ProjectROI[];
	timeAnalytics: TimeAnalytics;
	revenueAnalytics: RevenueAnalytics;
	upcomingDeadlines: Array<{
		type: string;
		description: string;
		dueDate: Date;
		priority: "high" | "medium" | "low";
	}>;
}

export class FreelanceAnalyticsService {
	/**
	 * Get comprehensive freelance dashboard data
	 */
	async getFreelanceDashboard(
		userId: string,
		period?: {
			startDate: Date;
			endDate: Date;
		},
	): Promise<FreelanceDashboard> {
		const startDate =
			period?.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Last year
		const endDate = period?.endDate || new Date();

		// Get overview metrics
		const overview = await this.getOverviewMetrics(userId, startDate, endDate);

		// Get top clients
		const topClients = await this.getTopClients(userId, startDate, endDate, 5);

		// Get project ROI
		const projectROI = await this.getProjectROI(userId, startDate, endDate);

		// Get time analytics
		const timeAnalytics = await this.getTimeAnalytics(
			userId,
			startDate,
			endDate,
		);

		// Get revenue analytics
		const revenueAnalytics = await this.getRevenueAnalytics(
			userId,
			startDate,
			endDate,
		);

		// Get upcoming deadlines
		const upcomingDeadlines = await this.getUpcomingDeadlines(userId);

		return {
			overview,
			topClients,
			projectROI,
			timeAnalytics,
			revenueAnalytics,
			upcomingDeadlines,
		};
	}

	/**
	 * Get overview metrics
	 */
	private async getOverviewMetrics(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<FreelanceDashboard["overview"]> {
		// Project counts
		const projectCounts = await db
			.select({
				status: projects.status,
				count: count(),
			})
			.from(projects)
			.where(
				and(
					eq(projects.userId, userId),
					gte(projects.startDate, startDate),
					lte(projects.endDate, endDate),
				),
			)
			.groupBy(projects.status);

		// Revenue and expenses
		const revenueResult = await db
			.select({ total: sum(income.amount) })
			.from(income)
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			);

		const expensesResult = await db
			.select({ total: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					gte(projectExpenses.date, startDate),
					lte(projectExpenses.date, endDate),
				),
			);

		// Time analytics
		const timeResult = await db
			.select({
				total: sum(projectTimeEntries.duration),
				billable: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN ${projectTimeEntries.duration} ELSE 0 END`,
				),
			})
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					gte(projectTimeEntries.startTime, startDate),
					lte(projectTimeEntries.startTime, endDate),
				),
			);

		// Client count
		const clientCount = await db
			.select({ count: count() })
			.from(projects)
			.where(eq(projects.userId, userId))
			.groupBy(projects.clientId);

		const totalRevenue = Number.parseFloat(revenueResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const totalHours = Number.parseInt(timeResult[0]?.total || "0") / 3600;
		const billableHours =
			Number.parseInt(timeResult[0]?.billable || "0") / 3600;
		const averageHourlyRate =
			billableHours > 0 ? totalRevenue / billableHours : 0;

		return {
			activeProjects:
				projectCounts.find((p) => p.status === "active")?.count || 0,
			completedProjects:
				projectCounts.find((p) => p.status === "completed")?.count || 0,
			totalRevenue,
			totalExpenses,
			netProfit: totalRevenue - totalExpenses,
			averageHourlyRate,
			clientCount: clientCount.length,
		};
	}

	/**
	 * Get top clients by revenue
	 */
	async getTopClients(
		userId: string,
		startDate: Date,
		endDate: Date,
		limit = 10,
	): Promise<ClientAnalytics[]> {
		// Get client revenue data
		const clientRevenue = await db
			.select({
				clientId: projects.clientId,
				clientName: clients.companyName,
				revenue: sum(income.amount),
				expenses: sum(projectExpenses.amount),
			})
			.from(projects)
			.innerJoin(clients, eq(projects.clientId, clients.id))
			.leftJoin(income, eq(income.clientId, clients.id))
			.leftJoin(projectExpenses, eq(projectExpenses.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					gte(projects.startDate, startDate),
					lte(projects.endDate, endDate),
				),
			)
			.groupBy(projects.clientId, clients.companyName)
			.orderBy(desc(sum(income.amount)))
			.limit(limit);

		const clientAnalytics: ClientAnalytics[] = [];

		for (const client of clientRevenue) {
			const revenue = Number.parseFloat(client.revenue || "0");
			const expenses = Number.parseFloat(client.expenses || "0");
			const netProfit = revenue - expenses;
			const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

			// Get additional metrics for this client
			const clientMetrics = await this.getClientMetrics(
				userId,
				client.clientId,
				startDate,
				endDate,
			);

			clientAnalytics.push({
				clientId: client.clientId,
				clientName: client.clientName,
				totalRevenue: revenue,
				totalExpenses: expenses,
				netProfit,
				profitMargin,
				averageHourlyRate: clientMetrics.averageHourlyRate,
				totalHours: clientMetrics.totalHours,
				projectsCompleted: clientMetrics.projectsCompleted,
				averageProjectValue: clientMetrics.averageProjectValue,
				paymentHistory: clientMetrics.paymentHistory,
				lifetimeValue: revenue, // Simplified
				riskScore: clientMetrics.riskScore,
			});
		}

		return clientAnalytics;
	}

	/**
	 * Get project ROI analysis
	 */
	async getProjectROI(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ProjectROI[]> {
		const projectData = await db
			.select({
				projectId: projects.id,
				projectName: projects.name,
				totalRevenue: sum(income.amount),
				totalExpenses: sum(projectExpenses.amount),
				startDate: projects.startDate,
				endDate: projects.endDate,
			})
			.from(projects)
			.leftJoin(income, eq(income.clientId, projects.clientId))
			.leftJoin(projectExpenses, eq(projectExpenses.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					gte(projects.startDate, startDate),
					lte(projects.endDate, endDate),
				),
			)
			.groupBy(
				projects.id,
				projects.name,
				projects.startDate,
				projects.endDate,
			);

		const projectROI: ProjectROI[] = [];

		for (const project of projectData) {
			const totalReturn = Number.parseFloat(project.totalRevenue || "0");
			const totalInvestment = Number.parseFloat(project.totalExpenses || "0");
			const roi =
				totalInvestment > 0
					? ((totalReturn - totalInvestment) / totalInvestment) * 100
					: 0;
			const profitMargin =
				totalReturn > 0
					? ((totalReturn - totalInvestment) / totalReturn) * 100
					: 0;

			// Calculate payback period
			const projectDuration =
				project.startDate && project.endDate
					? (project.endDate.getTime() - project.startDate.getTime()) /
						(1000 * 60 * 60 * 24 * 30) // months
					: 0;
			const paybackPeriod =
				totalReturn > 0 ? (totalInvestment / totalReturn) * projectDuration : 0;

			projectROI.push({
				projectId: project.projectId,
				projectName: project.projectName,
				totalInvestment,
				totalReturn,
				roi,
				paybackPeriod,
				profitMargin,
			});
		}

		return projectROI.sort((a, b) => b.roi - a.roi);
	}

	/**
	 * Get time analytics
	 */
	async getTimeAnalytics(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<TimeAnalytics> {
		// Get time data by month
		const monthlyTime = await db
			.select({
				month: sql<string>`TO_CHAR(${projectTimeEntries.startTime}, 'YYYY-MM')`,
				total: sum(projectTimeEntries.duration),
				billable: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN ${projectTimeEntries.duration} ELSE 0 END`,
				),
				revenue: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN (${projectTimeEntries.duration} * ${projectTimeEntries.hourlyRate} / 3600) ELSE 0 END`,
				),
			})
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					gte(projectTimeEntries.startTime, startDate),
					lte(projectTimeEntries.startTime, endDate),
				),
			)
			.groupBy(sql`TO_CHAR(${projectTimeEntries.startTime}, 'YYYY-MM')`)
			.orderBy(sql`TO_CHAR(${projectTimeEntries.startTime}, 'YYYY-MM')`);

		// Get total time metrics
		const totalTime = await db
			.select({
				total: sum(projectTimeEntries.duration),
				billable: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN ${projectTimeEntries.duration} ELSE 0 END`,
				),
				revenue: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN (${projectTimeEntries.duration} * ${projectTimeEntries.hourlyRate} / 3600) ELSE 0 END`,
				),
			})
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					gte(projectTimeEntries.startTime, startDate),
					lte(projectTimeEntries.startTime, endDate),
				),
			);

		const totalHours = Number.parseInt(totalTime[0]?.total || "0") / 3600;
		const billableHours = Number.parseInt(totalTime[0]?.billable || "0") / 3600;
		const nonBillableHours = totalHours - billableHours;
		const totalRevenue = Number.parseFloat(totalTime[0]?.revenue || "0");
		const averageHourlyRate =
			billableHours > 0 ? totalRevenue / billableHours : 0;

		// Calculate hourly rate trend
		const hourlyRateTrend = monthlyTime.map((month) => ({
			month: month.month,
			rate:
				month.billable > 0
					? Number.parseFloat(month.revenue || "0") /
						(Number.parseInt(month.billable) / 3600)
					: 0,
		}));

		// Get productivity metrics
		const projectCount = await db
			.select({ count: count() })
			.from(projects)
			.where(
				and(
					eq(projects.userId, userId),
					gte(projects.startDate, startDate),
					lte(projects.endDate, endDate),
				),
			);

		const months = Math.max(
			1,
			(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30),
		);
		const hoursPerProject =
			projectCount[0]?.count > 0 ? totalHours / projectCount[0].count : 0;
		const projectsPerMonth = projectCount[0]?.count / months;
		const efficiencyScore =
			billableHours > 0 ? (billableHours / totalHours) * 100 : 0;

		return {
			totalHours,
			billableHours,
			nonBillableHours,
			averageHourlyRate,
			hourlyRateTrend,
			productivityMetrics: {
				hoursPerProject,
				projectsPerMonth,
				efficiencyScore,
			},
		};
	}

	/**
	 * Get revenue analytics
	 */
	async getRevenueAnalytics(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<RevenueAnalytics> {
		// Monthly revenue
		const monthlyRevenue = await db
			.select({
				month: sql<string>`TO_CHAR(${income.date}, 'YYYY-MM')`,
				revenue: sum(income.amount),
			})
			.from(income)
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			)
			.groupBy(sql`TO_CHAR(${income.date}, 'YYYY-MM')`)
			.orderBy(sql`TO_CHAR(${income.date}, 'YYYY-MM')`);

		// Revenue by client
		const revenueByClient = await db
			.select({
				clientId: income.clientId,
				clientName: clients.companyName,
				revenue: sum(income.amount),
			})
			.from(income)
			.innerJoin(clients, eq(income.clientId, clients.id))
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			)
			.groupBy(income.clientId, clients.companyName)
			.orderBy(desc(sum(income.amount)));

		// Revenue by project
		const revenueByProject = await db
			.select({
				projectId: projects.id,
				projectName: projects.name,
				revenue: sum(income.amount),
			})
			.from(income)
			.innerJoin(projects, eq(income.clientId, projects.clientId))
			.where(
				and(
					eq(income.userId, userId),
					gte(income.date, startDate),
					lte(income.date, endDate),
				),
			)
			.groupBy(projects.id, projects.name)
			.orderBy(desc(sum(income.amount)));

		const totalRevenue = monthlyRevenue.reduce(
			(sum, month) => sum + Number.parseFloat(month.revenue || "0"),
			0,
		);

		// Calculate growth rates
		const monthlyRevenueWithGrowth = monthlyRevenue.map((month, index) => {
			const revenue = Number.parseFloat(month.revenue || "0");
			const previousRevenue =
				index > 0
					? Number.parseFloat(monthlyRevenue[index - 1].revenue || "0")
					: revenue;
			const growth =
				previousRevenue > 0
					? ((revenue - previousRevenue) / previousRevenue) * 100
					: 0;

			return {
				month: month.month,
				revenue,
				growth,
			};
		});

		// Calculate percentages for client and project revenue
		const revenueByClientWithPercentage = revenueByClient.map((client) => ({
			...client,
			revenue: Number.parseFloat(client.revenue || "0"),
			percentage:
				totalRevenue > 0
					? (Number.parseFloat(client.revenue || "0") / totalRevenue) * 100
					: 0,
		}));

		const revenueByProjectWithPercentage = revenueByProject.map((project) => ({
			...project,
			revenue: Number.parseFloat(project.revenue || "0"),
			percentage:
				totalRevenue > 0
					? (Number.parseFloat(project.revenue || "0") / totalRevenue) * 100
					: 0,
		}));

		// Calculate recurring vs one-time revenue (simplified)
		const recurringRevenue = revenueByClientWithPercentage
			.filter((client) => client.percentage > 20) // Clients with >20% of revenue are considered recurring
			.reduce((sum, client) => sum + client.revenue, 0);

		const oneTimeRevenue = totalRevenue - recurringRevenue;

		return {
			totalRevenue,
			monthlyRevenue: monthlyRevenueWithGrowth,
			revenueByClient: revenueByClientWithPercentage,
			revenueByProject: revenueByProjectWithPercentage,
			recurringRevenue,
			oneTimeRevenue,
		};
	}

	/**
	 * Get upcoming deadlines
	 */
	private async getUpcomingDeadlines(userId: string): Promise<
		Array<{
			type: string;
			description: string;
			dueDate: Date;
			priority: "high" | "medium" | "low";
		}>
	> {
		const deadlines = [];

		// Get overdue milestones
		const overdueMilestones = await db
			.select({
				projectName: projects.name,
				milestoneName: projectMilestones.name,
				dueDate: projectMilestones.dueDate,
			})
			.from(projectMilestones)
			.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectMilestones.status, "overdue"),
				),
			);

		for (const milestone of overdueMilestones) {
			deadlines.push({
				type: "milestone",
				description: `${milestone.projectName}: ${milestone.milestoneName}`,
				dueDate: milestone.dueDate,
				priority: "high" as const,
			});
		}

		// Get upcoming milestones
		const upcomingMilestones = await db
			.select({
				projectName: projects.name,
				milestoneName: projectMilestones.name,
				dueDate: projectMilestones.dueDate,
			})
			.from(projectMilestones)
			.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectMilestones.status, "pending"),
					gte(projectMilestones.dueDate, new Date()),
					lte(
						projectMilestones.dueDate,
						new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
					), // Next 7 days
				),
			);

		for (const milestone of upcomingMilestones) {
			deadlines.push({
				type: "milestone",
				description: `${milestone.projectName}: ${milestone.milestoneName}`,
				dueDate: milestone.dueDate,
				priority: "medium" as const,
			});
		}

		return deadlines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
	}

	/**
	 * Get client-specific metrics
	 */
	private async getClientMetrics(
		userId: string,
		clientId: string,
		startDate: Date,
		endDate: Date,
	): Promise<{
		averageHourlyRate: number;
		totalHours: number;
		projectsCompleted: number;
		averageProjectValue: number;
		paymentHistory: {
			averagePaymentTime: number;
			onTimePaymentRate: number;
			totalInvoices: number;
			paidInvoices: number;
		};
		riskScore: number;
	}> {
		// Get time data for this client
		const timeData = await db
			.select({
				total: sum(projectTimeEntries.duration),
				revenue: sum(
					sql`CASE WHEN ${projectTimeEntries.isBillable} THEN (${projectTimeEntries.duration} * ${projectTimeEntries.hourlyRate} / 3600) ELSE 0 END`,
				),
			})
			.from(projectTimeEntries)
			.innerJoin(projects, eq(projectTimeEntries.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projects.clientId, clientId),
					gte(projectTimeEntries.startTime, startDate),
					lte(projectTimeEntries.startTime, endDate),
				),
			);

		// Get project data
		const projectData = await db
			.select({
				count: count(),
				completed: count(
					sql`CASE WHEN ${projects.status} = 'completed' THEN 1 END`,
				),
			})
			.from(projects)
			.where(and(eq(projects.userId, userId), eq(projects.clientId, clientId)));

		// Get payment data
		const paymentData = await db
			.select({
				total: count(),
				paid: count(sql`CASE WHEN ${invoices.status} = 'paid' THEN 1 END`),
				averagePaymentTime: sql<number>`AVG(EXTRACT(EPOCH FROM (${invoices.paidDate} - ${invoices.issueDate})) / 86400)`,
			})
			.from(invoices)
			.where(and(eq(invoices.userId, userId), eq(invoices.clientId, clientId)));

		const totalHours = Number.parseInt(timeData[0]?.total || "0") / 3600;
		const totalRevenue = Number.parseFloat(timeData[0]?.revenue || "0");
		const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;
		const projectsCompleted = projectData[0]?.completed || 0;
		const totalProjects = projectData[0]?.count || 0;
		const averageProjectValue =
			totalProjects > 0 ? totalRevenue / totalProjects : 0;

		const totalInvoices = paymentData[0]?.total || 0;
		const paidInvoices = paymentData[0]?.paid || 0;
		const onTimePaymentRate =
			totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;
		const averagePaymentTime = paymentData[0]?.averagePaymentTime || 0;

		// Calculate risk score (1-10, higher is riskier)
		let riskScore = 5; // Base score

		if (onTimePaymentRate < 70) riskScore += 2;
		if (averagePaymentTime > 45) riskScore += 2;
		if (totalRevenue < 1000) riskScore += 1;
		if (projectsCompleted < 2) riskScore += 1;

		return {
			averageHourlyRate,
			totalHours,
			projectsCompleted,
			averageProjectValue,
			paymentHistory: {
				averagePaymentTime,
				onTimePaymentRate,
				totalInvoices,
				paidInvoices,
			},
			riskScore: Math.min(10, Math.max(1, riskScore)),
		};
	}
}
