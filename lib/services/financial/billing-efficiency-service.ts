/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from "@/lib/db";
import {
	agencyProjects,
	resourceAllocations,
	teamMembers,
} from "@/lib/db/schemas/agency.schema";
import { and, avg, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {} from "lucide-react";

export interface BillingEfficiencyMetrics {
	totalBillableHours: number;
	totalNonBillableHours: number;
	billingEfficiency: number; // Percentage of billable hours
	averageHourlyRate: number;
	totalRevenue: number;
	totalCost: number;
	profitMargin: number;
	utilizationRate: number;
}

export interface BillingEfficiencyByProject {
	projectId: string;
	projectName: string;
	clientName: string;
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	billingEfficiency: number;
	hourlyRate: number;
	revenue: number;
	cost: number;
	profit: number;
	profitMargin: number;
	status: string;
}

export interface BillingEfficiencyByTeamMember {
	teamMemberId: string;
	teamMemberName: string;
	role: string;
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	billingEfficiency: number;
	averageHourlyRate: number;
	revenue: number;
	cost: number;
	profit: number;
	projects: number;
}

export interface BillingOptimizationRecommendations {
	lowBillingEfficiency: {
		projectId: string;
		projectName: string;
		currentEfficiency: number;
		targetEfficiency: number;
		recommendations: string[];
	}[];
	highCostProjects: {
		projectId: string;
		projectName: string;
		cost: number;
		revenue: number;
		profitMargin: number;
		recommendations: string[];
	}[];
	underutilizedTeamMembers: {
		teamMemberId: string;
		teamMemberName: string;
		utilizationRate: number;
		targetUtilization: number;
		recommendations: string[];
	}[];
	rateOptimization: {
		teamMemberId: string;
		teamMemberName: string;
		currentRate: number;
		suggestedRate: number;
		reason: string;
	}[];
}

export class BillingEfficiencyService {
	/**
	 * Calculate overall billing efficiency metrics
	 */
	async calculateBillingEfficiency(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<BillingEfficiencyMetrics> {
		try {
			// Get all allocations for the period
			const allocations = await db
				.select({
					actualHours: resourceAllocations.actualHours,
					hourlyRate: resourceAllocations.hourlyRate,
					projectId: resourceAllocations.projectId,
				})
				.from(resourceAllocations)
				.where(
					and(
						eq(resourceAllocations.userId, userId),
						gte(resourceAllocations.startDate, startDate),
						lte(resourceAllocations.endDate, endDate),
					),
				);

			// Get project details for revenue calculation
			const projectIds = [...new Set(allocations.map((a) => a.projectId))];
			const projects = await db
				.select({
					id: agencyProjects.id,
					budget: agencyProjects.budget,
					status: agencyProjects.status,
				})
				.from(agencyProjects)
				.where(
					and(
						eq(agencyProjects.userId, userId),
						// In a real implementation, you'd use an IN clause
					),
				);

			const projectMap = new Map(projects.map((p) => [p.id, p]));

			let totalBillableHours = 0;
			let totalNonBillableHours = 0;
			let totalRevenue = 0;
			let totalCost = 0;

			for (const allocation of allocations) {
				const hours = Number(allocation.actualHours) || 0;
				const rate = Number(allocation.hourlyRate) || 0;
				const cost = hours * rate;
				const project = projectMap.get(allocation.projectId);

				// Determine if hours are billable based on project status
				const isBillable =
					project?.status === "active" || project?.status === "completed";

				if (isBillable) {
					totalBillableHours += hours;
					totalRevenue += Number(project?.budget) || 0;
				} else {
					totalNonBillableHours += hours;
				}

				totalCost += cost;
			}

			const totalHours = totalBillableHours + totalNonBillableHours;
			const billingEfficiency =
				totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;
			const averageHourlyRate =
				totalBillableHours > 0 ? totalRevenue / totalBillableHours : 0;
			const profitMargin =
				totalRevenue > 0
					? ((totalRevenue - totalCost) / totalRevenue) * 100
					: 0;
			const utilizationRate =
				totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;

			return {
				totalBillableHours,
				totalNonBillableHours,
				billingEfficiency,
				averageHourlyRate,
				totalRevenue,
				totalCost,
				profitMargin,
				utilizationRate,
			};
		} catch (error) {
			console.error("Error calculating billing efficiency:", error);
			throw new Error(
				`Failed to calculate billing efficiency: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get billing efficiency by project
	 */
	async getBillingEfficiencyByProject(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<BillingEfficiencyByProject[]> {
		try {
			// Get projects with their allocations
			const projects = await db
				.select({
					id: agencyProjects.id,
					name: agencyProjects.name,
					budget: agencyProjects.budget,
					status: agencyProjects.status,
					clientId: agencyProjects.clientId,
				})
				.from(agencyProjects)
				.where(
					and(
						eq(agencyProjects.userId, userId),
						gte(agencyProjects.startDate, startDate),
						lte(agencyProjects.endDate, endDate),
					),
				);

			const projectEfficiency: BillingEfficiencyByProject[] = [];

			for (const project of projects) {
				// Get allocations for this project
				const allocations = await db
					.select()
					.from(resourceAllocations)
					.where(
						and(
							eq(resourceAllocations.projectId, project.id),
							eq(resourceAllocations.userId, userId),
						),
					);

				const totalHours = allocations.reduce(
					(sum, alloc) => sum + (Number(alloc.actualHours) || 0),
					0,
				);
				const billableHours =
					project.status === "active" || project.status === "completed"
						? totalHours
						: 0;
				const nonBillableHours = totalHours - billableHours;
				const billingEfficiency =
					totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

				const hourlyRate =
					allocations.reduce(
						(sum, alloc) => sum + (Number(alloc.hourlyRate) || 0),
						0,
					) / allocations.length || 0;
				const revenue = Number(project.budget) || 0;
				const cost = allocations.reduce((sum, alloc) => {
					const hours = Number(alloc.actualHours) || 0;
					const rate = Number(alloc.hourlyRate) || 0;
					return sum + hours * rate;
				}, 0);
				const profit = revenue - cost;
				const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

				projectEfficiency.push({
					projectId: project.id,
					projectName: project.name,
					clientName: "Client Name", // Would need to join with clients table
					totalHours,
					billableHours,
					nonBillableHours,
					billingEfficiency,
					hourlyRate,
					revenue,
					cost,
					profit,
					profitMargin,
					status: project.status,
				});
			}

			return projectEfficiency.sort(
				(a, b) => b.billingEfficiency - a.billingEfficiency,
			);
		} catch (error) {
			console.error("Error fetching billing efficiency by project:", error);
			throw new Error(
				`Failed to fetch billing efficiency by project: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get billing efficiency by team member
	 */
	async getBillingEfficiencyByTeamMember(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<BillingEfficiencyByTeamMember[]> {
		try {
			// Get team members
			const teamMembersList = await db
				.select()
				.from(teamMembers)
				.where(
					and(eq(teamMembers.userId, userId), eq(teamMembers.status, "active")),
				);

			const memberEfficiency: BillingEfficiencyByTeamMember[] = [];

			for (const member of teamMembersList) {
				// Get allocations for this team member
				const allocations = await db
					.select({
						actualHours: resourceAllocations.actualHours,
						hourlyRate: resourceAllocations.hourlyRate,
						projectId: resourceAllocations.projectId,
					})
					.from(resourceAllocations)
					.where(
						and(
							eq(resourceAllocations.teamMemberId, member.id),
							eq(resourceAllocations.userId, userId),
							gte(resourceAllocations.startDate, startDate),
							lte(resourceAllocations.endDate, endDate),
						),
					);

				const totalHours = allocations.reduce(
					(sum, alloc) => sum + (Number(alloc.actualHours) || 0),
					0,
				);
				const billableHours = allocations.reduce((sum, alloc) => {
					// Simplified - assume all hours are billable for active projects
					return sum + (Number(alloc.actualHours) || 0);
				}, 0);
				const nonBillableHours = totalHours - billableHours;
				const billingEfficiency =
					totalHours > 0 ? (billableHours / totalHours) * 100 : 0;

				const averageHourlyRate =
					allocations.reduce(
						(sum, alloc) => sum + (Number(alloc.hourlyRate) || 0),
						0,
					) / allocations.length || 0;
				const revenue = allocations.reduce((sum, alloc) => {
					const hours = Number(alloc.actualHours) || 0;
					const rate = Number(alloc.hourlyRate) || 0;
					return sum + hours * rate;
				}, 0);
				const cost = member.costPerHour
					? totalHours * Number(member.costPerHour)
					: 0;
				const profit = revenue - cost;
				const projects = new Set(allocations.map((a) => a.projectId)).size;

				memberEfficiency.push({
					teamMemberId: member.id,
					teamMemberName: member.name,
					role: member.role,
					totalHours,
					billableHours,
					nonBillableHours,
					billingEfficiency,
					averageHourlyRate,
					revenue,
					cost,
					profit,
					projects,
				});
			}

			return memberEfficiency.sort(
				(a, b) => b.billingEfficiency - a.billingEfficiency,
			);
		} catch (error) {
			console.error("Error fetching billing efficiency by team member:", error);
			throw new Error(
				`Failed to fetch billing efficiency by team member: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate billing optimization recommendations
	 */
	async generateBillingOptimizationRecommendations(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<BillingOptimizationRecommendations> {
		try {
			const projectEfficiency = await this.getBillingEfficiencyByProject(
				userId,
				startDate,
				endDate,
			);
			const memberEfficiency = await this.getBillingEfficiencyByTeamMember(
				userId,
				startDate,
				endDate,
			);

			// Find projects with low billing efficiency
			const lowBillingEfficiency = projectEfficiency
				.filter((project) => project.billingEfficiency < 70)
				.map((project) => ({
					projectId: project.projectId,
					projectName: project.projectName,
					currentEfficiency: project.billingEfficiency,
					targetEfficiency: 85,
					recommendations: [
						"Review project scope and requirements",
						"Optimize team allocation",
						"Implement better time tracking",
						"Consider project management improvements",
					],
				}));

			// Find high-cost projects with low profit margins
			const highCostProjects = projectEfficiency
				.filter((project) => project.profitMargin < 20)
				.map((project) => ({
					projectId: project.projectId,
					projectName: project.projectName,
					cost: project.cost,
					revenue: project.revenue,
					profitMargin: project.profitMargin,
					recommendations: [
						"Review project pricing strategy",
						"Optimize resource allocation",
						"Reduce project scope if possible",
						"Negotiate better rates with team members",
					],
				}));

			// Find underutilized team members
			const underutilizedTeamMembers = memberEfficiency
				.filter((member) => member.billingEfficiency < 60)
				.map((member) => ({
					teamMemberId: member.teamMemberId,
					teamMemberName: member.teamMemberName,
					utilizationRate: member.billingEfficiency,
					targetUtilization: 80,
					recommendations: [
						"Assign additional billable projects",
						"Provide training for new skills",
						"Consider cross-functional assignments",
						"Review workload distribution",
					],
				}));

			// Rate optimization recommendations
			const rateOptimization = memberEfficiency
				.filter((member) => member.profit < 0 || member.profitMargin < 10)
				.map((member) => ({
					teamMemberId: member.teamMemberId,
					teamMemberName: member.teamMemberName,
					currentRate: member.averageHourlyRate,
					suggestedRate: member.averageHourlyRate * 1.15, // 15% increase
					reason: "Low profit margin or negative profit",
				}));

			return {
				lowBillingEfficiency,
				highCostProjects,
				underutilizedTeamMembers,
				rateOptimization,
			};
		} catch (error) {
			console.error(
				"Error generating billing optimization recommendations:",
				error,
			);
			throw new Error(
				`Failed to generate billing optimization recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get billing efficiency trends
	 */
	async getBillingEfficiencyTrends(
		userId: string,
		months = 6,
	): Promise<{
		monthly: {
			month: string;
			billingEfficiency: number;
			totalRevenue: number;
			totalCost: number;
			profitMargin: number;
		}[];
		trends: {
			efficiencyTrend: "improving" | "stable" | "declining";
			revenueTrend: "growing" | "stable" | "declining";
			profitTrend: "improving" | "stable" | "declining";
		};
	}> {
		try {
			const monthlyData = [];
			const endDate = new Date();

			for (let i = months - 1; i >= 0; i--) {
				const monthStart = new Date();
				monthStart.setMonth(monthStart.getMonth() - i);
				monthStart.setDate(1);

				const monthEnd = new Date(monthStart);
				monthEnd.setMonth(monthEnd.getMonth() + 1);
				monthEnd.setDate(0);

				const metrics = await this.calculateBillingEfficiency(
					userId,
					monthStart,
					monthEnd,
				);

				monthlyData.push({
					month: monthStart.toISOString().substring(0, 7),
					billingEfficiency: metrics.billingEfficiency,
					totalRevenue: metrics.totalRevenue,
					totalCost: metrics.totalCost,
					profitMargin: metrics.profitMargin,
				});
			}

			// Calculate trends
			const firstMonth = monthlyData[0];
			const lastMonth = monthlyData[monthlyData.length - 1];

			const efficiencyTrend =
				lastMonth.billingEfficiency > firstMonth.billingEfficiency + 5
					? "improving"
					: lastMonth.billingEfficiency < firstMonth.billingEfficiency - 5
						? "declining"
						: "stable";

			const revenueTrend =
				lastMonth.totalRevenue > firstMonth.totalRevenue * 1.1
					? "growing"
					: lastMonth.totalRevenue < firstMonth.totalRevenue * 0.9
						? "declining"
						: "stable";

			const profitTrend =
				lastMonth.profitMargin > firstMonth.profitMargin + 5
					? "improving"
					: lastMonth.profitMargin < firstMonth.profitMargin - 5
						? "declining"
						: "stable";

			return {
				monthly: monthlyData,
				trends: {
					efficiencyTrend,
					revenueTrend,
					profitTrend,
				},
			};
		} catch (error) {
			console.error("Error fetching billing efficiency trends:", error);
			throw new Error(
				`Failed to fetch billing efficiency trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
