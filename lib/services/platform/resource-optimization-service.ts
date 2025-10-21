import { db } from "@/lib/db";
import {
	agencyProjects,
	resourceAllocations,
	teamMembers,
	utilizationMetrics,
} from "@/lib/db/schemas/agency.schema";
import { and, avg, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {
	Filter,
	MessageCircle,
	PiggyBank,
	TrendingDown,
	TrendingUp,
	Users,
	XCircle,
} from "lucide-react";

export interface TeamMemberUtilization {
	teamMemberId: string;
	teamMemberName: string;
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	utilizationRate: number;
	targetUtilization: number;
	status: "underutilized" | "optimal" | "overutilized";
	projects: {
		projectId: string;
		projectName: string;
		hours: number;
		billable: boolean;
	}[];
	skills: string[];
	performance: {
		quality: number;
		efficiency: number;
		clientSatisfaction: number;
	};
}

export interface ResourceOptimizationRecommendations {
	underutilized: {
		teamMemberId: string;
		teamMemberName: string;
		currentUtilization: number;
		targetUtilization: number;
		recommendations: string[];
	}[];
	overutilized: {
		teamMemberId: string;
		teamMemberName: string;
		currentUtilization: number;
		targetUtilization: number;
		recommendations: string[];
	}[];
	skillGaps: {
		skill: string;
		needed: number;
		available: number;
		gap: number;
		recommendations: string[];
	}[];
	capacityPlanning: {
		period: string;
		totalCapacity: number;
		allocatedCapacity: number;
		availableCapacity: number;
		recommendations: string[];
	};
}

export class ResourceOptimizationService {
	/**
	 * Calculate team member utilization for a specific period
	 */
	async calculateTeamUtilization(
		userId: string,
		teamMemberId: string,
		startDate: Date,
		endDate: Date,
	): Promise<TeamMemberUtilization> {
		try {
			// Get team member details
			const [teamMember] = await db
				.select()
				.from(teamMembers)
				.where(
					and(eq(teamMembers.id, teamMemberId), eq(teamMembers.userId, userId)),
				)
				.limit(1);

			if (!teamMember) {
				throw new Error("Team member not found");
			}

			// Get allocations for the period
			const allocations = await db
				.select({
					projectId: resourceAllocations.projectId,
					projectName: agencyProjects.name,
					actualHours: resourceAllocations.actualHours,
					allocatedHours: resourceAllocations.allocatedHours,
					role: resourceAllocations.role,
				})
				.from(resourceAllocations)
				.leftJoin(
					agencyProjects,
					eq(resourceAllocations.projectId, agencyProjects.id),
				)
				.where(
					and(
						eq(resourceAllocations.teamMemberId, teamMemberId),
						eq(resourceAllocations.userId, userId),
						gte(resourceAllocations.startDate, startDate),
						lte(resourceAllocations.endDate, endDate),
					),
				);

			// Calculate utilization metrics
			const totalHours = allocations.reduce(
				(sum, alloc) => sum + (Number(alloc.actualHours) || 0),
				0,
			);
			const billableHours = allocations.reduce((sum, alloc) => {
				// Assume all hours are billable for now - in reality you'd check project status
				return sum + (Number(alloc.actualHours) || 0);
			}, 0);
			const nonBillableHours = totalHours - billableHours;
			const utilizationRate = teamMember.availability?.hoursPerWeek
				? (totalHours / (teamMember.availability.hoursPerWeek * 4)) * 100 // Assuming 4 weeks
				: 0;

			// Determine status
			let status: "underutilized" | "optimal" | "overutilized" = "optimal";
			if (utilizationRate < 70) status = "underutilized";
			else if (utilizationRate > 100) status = "overutilized";

			// Format projects data
			const projects = allocations.map((alloc) => ({
				projectId: alloc.projectId,
				projectName: alloc.projectName || "Unknown Project",
				hours: Number(alloc.actualHours) || 0,
				billable: true, // Simplified - in reality you'd check project billing status
			}));

			return {
				teamMemberId,
				teamMemberName: teamMember.name,
				totalHours,
				billableHours,
				nonBillableHours,
				utilizationRate,
				targetUtilization:
					Number(teamMember.availability?.hoursPerWeek || 40) * 4, // 4 weeks
				status,
				projects,
				skills: teamMember.skills || [],
				performance: {
					quality: 85, // Placeholder - would be calculated from actual performance data
					efficiency: 90, // Placeholder
					clientSatisfaction: 88, // Placeholder
				},
			};
		} catch (error) {
			console.error("Error calculating team utilization:", error);
			throw new Error(
				`Failed to calculate team utilization: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get utilization metrics for all team members
	 */
	async getAllTeamUtilization(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<TeamMemberUtilization[]> {
		try {
			// Get all team members
			const teamMembersList = await db
				.select()
				.from(teamMembers)
				.where(
					and(eq(teamMembers.userId, userId), eq(teamMembers.status, "active")),
				);

			const utilizationData: TeamMemberUtilization[] = [];

			for (const member of teamMembersList) {
				const utilization = await this.calculateTeamUtilization(
					userId,
					member.id,
					startDate,
					endDate,
				);
				utilizationData.push(utilization);
			}

			return utilizationData;
		} catch (error) {
			console.error("Error fetching all team utilization:", error);
			throw new Error(
				`Failed to fetch team utilization: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate resource optimization recommendations
	 */
	async generateOptimizationRecommendations(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ResourceOptimizationRecommendations> {
		try {
			const utilizationData = await this.getAllTeamUtilization(
				userId,
				startDate,
				endDate,
			);

			const underutilized = utilizationData
				.filter((member) => member.status === "underutilized")
				.map((member) => ({
					teamMemberId: member.teamMemberId,
					teamMemberName: member.teamMemberName,
					currentUtilization: member.utilizationRate,
					targetUtilization: member.targetUtilization,
					recommendations: [
						"Assign additional projects",
						"Provide training opportunities",
						"Consider cross-functional assignments",
						"Review workload distribution",
					],
				}));

			const overutilized = utilizationData
				.filter((member) => member.status === "overutilized")
				.map((member) => ({
					teamMemberId: member.teamMemberId,
					teamMemberName: member.teamMemberName,
					currentUtilization: member.utilizationRate,
					targetUtilization: member.targetUtilization,
					recommendations: [
						"Reduce workload to prevent burnout",
						"Delegate tasks to other team members",
						"Extend project timelines",
						"Consider hiring additional resources",
					],
				}));

			// Analyze skill gaps (simplified)
			const allSkills = utilizationData.flatMap((member) => member.skills);
			const skillCounts = allSkills.reduce(
				(acc, skill) => {
					acc[skill] = (acc[skill] || 0) + 1;
					return acc;
				},
				{} as Record<string, number>,
			);

			const skillGaps = Object.entries(skillCounts)
				.filter(([_, count]) => count < 2) // Skills with less than 2 people
				.map(([skill, count]) => ({
					skill,
					needed: 3, // Target number of people with this skill
					available: count,
					gap: 3 - count,
					recommendations: [
						`Train existing team members in ${skill}`,
						`Hire new team member with ${skill} expertise`,
						`Consider external contractors for ${skill}`,
					],
				}));

			// Calculate capacity planning
			const totalCapacity = utilizationData.reduce(
				(sum, member) => sum + member.targetUtilization,
				0,
			);
			const allocatedCapacity = utilizationData.reduce(
				(sum, member) => sum + member.totalHours,
				0,
			);
			const availableCapacity = totalCapacity - allocatedCapacity;

			const capacityPlanning = {
				period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
				totalCapacity,
				allocatedCapacity,
				availableCapacity,
				recommendations:
					availableCapacity > 0
						? [
								"Capacity available for new projects",
								"Consider taking on additional work",
							]
						: [
								"Capacity fully utilized",
								"Consider hiring additional resources",
								"Review project priorities",
							],
			};

			return {
				underutilized,
				overutilized,
				skillGaps,
				capacityPlanning,
			};
		} catch (error) {
			console.error("Error generating optimization recommendations:", error);
			throw new Error(
				`Failed to generate optimization recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get resource utilization trends
	 */
	async getUtilizationTrends(
		userId: string,
		months = 6,
	): Promise<{
		monthly: {
			month: string;
			averageUtilization: number;
			teamSize: number;
			totalHours: number;
			billableHours: number;
		}[];
		trends: {
			utilizationTrend: "improving" | "stable" | "declining";
			teamGrowth: "growing" | "stable" | "shrinking";
			efficiencyTrend: "improving" | "stable" | "declining";
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

				const utilizationData = await this.getAllTeamUtilization(
					userId,
					monthStart,
					monthEnd,
				);

				const averageUtilization =
					utilizationData.length > 0
						? utilizationData.reduce(
								(sum, member) => sum + member.utilizationRate,
								0,
							) / utilizationData.length
						: 0;

				const totalHours = utilizationData.reduce(
					(sum, member) => sum + member.totalHours,
					0,
				);
				const billableHours = utilizationData.reduce(
					(sum, member) => sum + member.billableHours,
					0,
				);

				monthlyData.push({
					month: monthStart.toISOString().substring(0, 7),
					averageUtilization,
					teamSize: utilizationData.length,
					totalHours,
					billableHours,
				});
			}

			// Calculate trends
			const firstMonth = monthlyData[0];
			const lastMonth = monthlyData[monthlyData.length - 1];

			const utilizationTrend =
				lastMonth.averageUtilization > firstMonth.averageUtilization + 5
					? "improving"
					: lastMonth.averageUtilization < firstMonth.averageUtilization - 5
						? "declining"
						: "stable";

			const teamGrowth =
				lastMonth.teamSize > firstMonth.teamSize
					? "growing"
					: lastMonth.teamSize < firstMonth.teamSize
						? "shrinking"
						: "stable";

			const efficiencyTrend =
				lastMonth.billableHours / lastMonth.totalHours >
				firstMonth.billableHours / firstMonth.totalHours + 0.05
					? "improving"
					: lastMonth.billableHours / lastMonth.totalHours <
							firstMonth.billableHours / firstMonth.totalHours - 0.05
						? "declining"
						: "stable";

			return {
				monthly: monthlyData,
				trends: {
					utilizationTrend,
					teamGrowth,
					efficiencyTrend,
				},
			};
		} catch (error) {
			console.error("Error fetching utilization trends:", error);
			throw new Error(
				`Failed to fetch utilization trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get project profitability by team composition
	 */
	async getProjectProfitabilityByTeam(
		userId: string,
		projectId: string,
	): Promise<{
		projectId: string;
		projectName: string;
		totalBudget: number;
		totalCost: number;
		profit: number;
		profitMargin: number;
		teamComposition: {
			teamMemberId: string;
			teamMemberName: string;
			role: string;
			hours: number;
			cost: number;
			contribution: number;
		}[];
	}> {
		try {
			// Get project details
			const [project] = await db
				.select()
				.from(agencyProjects)
				.where(
					and(
						eq(agencyProjects.id, projectId),
						eq(agencyProjects.userId, userId),
					),
				)
				.limit(1);

			if (!project) {
				throw new Error("Project not found");
			}

			// Get team allocations
			const allocations = await db
				.select()
				.from(resourceAllocations)
				.where(
					and(
						eq(resourceAllocations.projectId, projectId),
						eq(resourceAllocations.userId, userId),
					),
				);

			const totalBudget = Number(project.budget) || 0;
			const totalCost = allocations.reduce((sum, alloc) => {
				const hours = Number(alloc.actualHours) || 0;
				const rate = Number(alloc.hourlyRate) || 0;
				return sum + hours * rate;
			}, 0);
			const profit = totalBudget - totalCost;
			const profitMargin = totalBudget > 0 ? (profit / totalBudget) * 100 : 0;

			const teamComposition = allocations.map((alloc) => {
				const hours = Number(alloc.actualHours) || 0;
				const rate = Number(alloc.hourlyRate) || 0;
				const cost = hours * rate;
				const contribution = totalCost > 0 ? (cost / totalCost) * 100 : 0;

				return {
					teamMemberId: alloc.teamMemberId,
					teamMemberName: alloc.teamMemberName,
					role: alloc.role,
					hours,
					cost,
					contribution,
				};
			});

			return {
				projectId,
				projectName: project.name,
				totalBudget,
				totalCost,
				profit,
				profitMargin,
				teamComposition,
			};
		} catch (error) {
			console.error("Error calculating project profitability:", error);
			throw new Error(
				`Failed to calculate project profitability: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
