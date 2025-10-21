import { db } from "@/lib/db";
import {
	agencyProjects,
	resourceAllocations,
	teamMembers,
} from "@/lib/db/schemas/agency.schema";
import { and, avg, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {
	ArrowUpDown,
	Clock,
	Filter,
	MessageCircle,
	Plus,
	Users,
	XCircle,
} from "lucide-react";

export interface CapacityForecast {
	period: string;
	totalCapacity: number;
	allocatedCapacity: number;
	availableCapacity: number;
	utilizationRate: number;
	teamMembers: {
		teamMemberId: string;
		teamMemberName: string;
		role: string;
		capacity: number;
		allocated: number;
		available: number;
		utilization: number;
		skills: string[];
	}[];
}

export interface SkillCapacityAnalysis {
	skill: string;
	totalCapacity: number;
	allocatedCapacity: number;
	availableCapacity: number;
	teamMembers: {
		teamMemberId: string;
		teamMemberName: string;
		capacity: number;
		allocated: number;
		available: number;
	}[];
	recommendations: string[];
}

export interface CapacityPlanningRecommendations {
	capacityGaps: {
		period: string;
		skill: string;
		needed: number;
		available: number;
		gap: number;
		recommendations: string[];
	}[];
	overcapacity: {
		period: string;
		skill: string;
		excess: number;
		recommendations: string[];
	}[];
	hiringNeeds: {
		role: string;
		skills: string[];
		urgency: "high" | "medium" | "low";
		reason: string;
		recommendations: string[];
	}[];
	resourceOptimization: {
		teamMemberId: string;
		teamMemberName: string;
		currentUtilization: number;
		targetUtilization: number;
		recommendations: string[];
	}[];
}

export class CapacityPlanningService {
	/**
	 * Forecast capacity for a specific period
	 */
	async forecastCapacity(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<CapacityForecast> {
		try {
			// Get all active team members
			const teamMembersList = await db
				.select()
				.from(teamMembers)
				.where(
					and(eq(teamMembers.userId, userId), eq(teamMembers.status, "active")),
				);

			const teamCapacity = [];
			let totalCapacity = 0;
			let totalAllocated = 0;

			for (const member of teamMembersList) {
				// Calculate member's capacity (hours per week * number of weeks)
				const weeksInPeriod = Math.ceil(
					(endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000),
				);
				const capacity =
					(member.availability?.hoursPerWeek || 40) * weeksInPeriod;

				// Get allocated hours for this period
				const allocations = await db
					.select()
					.from(resourceAllocations)
					.where(
						and(
							eq(resourceAllocations.teamMemberId, member.id),
							eq(resourceAllocations.userId, userId),
							gte(resourceAllocations.startDate, startDate),
							lte(resourceAllocations.endDate, endDate),
						),
					);

				const allocated = allocations.reduce(
					(sum, alloc) => sum + (Number(alloc.allocatedHours) || 0),
					0,
				);
				const available = Math.max(0, capacity - allocated);
				const utilization = capacity > 0 ? (allocated / capacity) * 100 : 0;

				teamCapacity.push({
					teamMemberId: member.id,
					teamMemberName: member.name,
					role: member.role,
					capacity,
					allocated,
					available,
					utilization,
					skills: member.skills || [],
				});

				totalCapacity += capacity;
				totalAllocated += allocated;
			}

			const availableCapacity = totalCapacity - totalAllocated;
			const utilizationRate =
				totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;

			return {
				period: `${startDate.toISOString().split("T")[0]} to ${endDate.toISOString().split("T")[0]}`,
				totalCapacity,
				allocatedCapacity: totalAllocated,
				availableCapacity,
				utilizationRate,
				teamMembers: teamCapacity,
			};
		} catch (error) {
			console.error("Error forecasting capacity:", error);
			throw new Error(
				`Failed to forecast capacity: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Analyze capacity by skill
	 */
	async analyzeSkillCapacity(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<SkillCapacityAnalysis[]> {
		try {
			// Get all team members with their skills
			const teamMembersList = await db
				.select()
				.from(teamMembers)
				.where(
					and(eq(teamMembers.userId, userId), eq(teamMembers.status, "active")),
				);

			// Collect all unique skills
			const allSkills = new Set<string>();
			teamMembersList.forEach((member) => {
				(member.skills || []).forEach((skill) => allSkills.add(skill));
			});

			const skillAnalysis: SkillCapacityAnalysis[] = [];

			for (const skill of allSkills) {
				// Find team members with this skill
				const membersWithSkill = teamMembersList.filter((member) =>
					(member.skills || []).includes(skill),
				);

				let totalCapacity = 0;
				let totalAllocated = 0;
				const teamMembers = [];

				for (const member of membersWithSkill) {
					const weeksInPeriod = Math.ceil(
						(endDate.getTime() - startDate.getTime()) /
							(7 * 24 * 60 * 60 * 1000),
					);
					const capacity =
						(member.availability?.hoursPerWeek || 40) * weeksInPeriod;

					// Get allocated hours for this skill (simplified - assumes all hours are for this skill)
					const allocations = await db
						.select()
						.from(resourceAllocations)
						.where(
							and(
								eq(resourceAllocations.teamMemberId, member.id),
								eq(resourceAllocations.userId, userId),
								gte(resourceAllocations.startDate, startDate),
								lte(resourceAllocations.endDate, endDate),
							),
						);

					const allocated = allocations.reduce(
						(sum, alloc) => sum + (Number(alloc.allocatedHours) || 0),
						0,
					);
					const available = Math.max(0, capacity - allocated);

					teamMembers.push({
						teamMemberId: member.id,
						teamMemberName: member.name,
						capacity,
						allocated,
						available,
					});

					totalCapacity += capacity;
					totalAllocated += allocated;
				}

				const availableCapacity = totalCapacity - totalAllocated;
				const recommendations = [];

				if (availableCapacity < 0) {
					recommendations.push(`Hire additional ${skill} specialists`);
					recommendations.push(`Train existing team members in ${skill}`);
					recommendations.push(`Consider external contractors for ${skill}`);
				} else if (availableCapacity > totalCapacity * 0.3) {
					recommendations.push(`Utilize ${skill} capacity for new projects`);
					recommendations.push("Cross-train team members in other skills");
					recommendations.push(`Consider reducing ${skill} team size`);
				}

				skillAnalysis.push({
					skill,
					totalCapacity,
					allocatedCapacity: totalAllocated,
					availableCapacity,
					teamMembers,
					recommendations,
				});
			}

			return skillAnalysis.sort(
				(a, b) => b.allocatedCapacity - a.allocatedCapacity,
			);
		} catch (error) {
			console.error("Error analyzing skill capacity:", error);
			throw new Error(
				`Failed to analyze skill capacity: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Generate capacity planning recommendations
	 */
	async generateCapacityPlanningRecommendations(
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<CapacityPlanningRecommendations> {
		try {
			const capacityForecast = await this.forecastCapacity(
				userId,
				startDate,
				endDate,
			);
			const skillAnalysis = await this.analyzeSkillCapacity(
				userId,
				startDate,
				endDate,
			);

			// Identify capacity gaps
			const capacityGaps = skillAnalysis
				.filter((skill) => skill.availableCapacity < 0)
				.map((skill) => ({
					period: capacityForecast.period,
					skill: skill.skill,
					needed: Math.abs(skill.availableCapacity),
					available: 0,
					gap: Math.abs(skill.availableCapacity),
					recommendations: skill.recommendations,
				}));

			// Identify overcapacity
			const overcapacity = skillAnalysis
				.filter((skill) => skill.availableCapacity > skill.totalCapacity * 0.3)
				.map((skill) => ({
					period: capacityForecast.period,
					skill: skill.skill,
					excess: skill.availableCapacity,
					recommendations: [
						`Utilize excess ${skill.skill} capacity`,
						"Cross-train team members in other skills",
						`Consider reducing ${skill.skill} team size`,
					],
				}));

			// Identify hiring needs
			const hiringNeeds = [];
			const criticalSkills = skillAnalysis.filter(
				(skill) => skill.availableCapacity < 0,
			);

			for (const skill of criticalSkills) {
				const urgency = skill.availableCapacity < -40 ? "high" : "medium";
				hiringNeeds.push({
					role: `${skill.skill} Specialist`,
					skills: [skill.skill],
					urgency,
					reason: `Insufficient ${skill.skill} capacity`,
					recommendations: [
						`Hire ${skill.skill} specialist immediately`,
						`Consider contract workers for ${skill.skill}`,
						`Train existing team members in ${skill.skill}`,
					],
				});
			}

			// Resource optimization recommendations
			const resourceOptimization = capacityForecast.teamMembers
				.filter((member) => member.utilization < 60 || member.utilization > 100)
				.map((member) => ({
					teamMemberId: member.teamMemberId,
					teamMemberName: member.teamMemberName,
					currentUtilization: member.utilization,
					targetUtilization: 80,
					recommendations:
						member.utilization < 60
							? [
									"Assign additional projects",
									"Provide training opportunities",
									"Consider cross-functional assignments",
								]
							: [
									"Reduce workload to prevent burnout",
									"Delegate tasks to other team members",
									"Extend project timelines",
								],
				}));

			return {
				capacityGaps,
				overcapacity,
				hiringNeeds,
				resourceOptimization,
			};
		} catch (error) {
			console.error(
				"Error generating capacity planning recommendations:",
				error,
			);
			throw new Error(
				`Failed to generate capacity planning recommendations: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Get capacity trends over time
	 */
	async getCapacityTrends(
		userId: string,
		months = 6,
	): Promise<{
		monthly: {
			month: string;
			totalCapacity: number;
			allocatedCapacity: number;
			utilizationRate: number;
			teamSize: number;
		}[];
		trends: {
			capacityTrend: "growing" | "stable" | "shrinking";
			utilizationTrend: "improving" | "stable" | "declining";
			teamGrowth: "growing" | "stable" | "shrinking";
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

				const forecast = await this.forecastCapacity(
					userId,
					monthStart,
					monthEnd,
				);

				monthlyData.push({
					month: monthStart.toISOString().substring(0, 7),
					totalCapacity: forecast.totalCapacity,
					allocatedCapacity: forecast.allocatedCapacity,
					utilizationRate: forecast.utilizationRate,
					teamSize: forecast.teamMembers.length,
				});
			}

			// Calculate trends
			const firstMonth = monthlyData[0];
			const lastMonth = monthlyData[monthlyData.length - 1];

			const capacityTrend =
				lastMonth.totalCapacity > firstMonth.totalCapacity * 1.1
					? "growing"
					: lastMonth.totalCapacity < firstMonth.totalCapacity * 0.9
						? "shrinking"
						: "stable";

			const utilizationTrend =
				lastMonth.utilizationRate > firstMonth.utilizationRate + 5
					? "improving"
					: lastMonth.utilizationRate < firstMonth.utilizationRate - 5
						? "declining"
						: "stable";

			const teamGrowth =
				lastMonth.teamSize > firstMonth.teamSize
					? "growing"
					: lastMonth.teamSize < firstMonth.teamSize
						? "shrinking"
						: "stable";

			return {
				monthly: monthlyData,
				trends: {
					capacityTrend,
					utilizationTrend,
					teamGrowth,
				},
			};
		} catch (error) {
			console.error("Error fetching capacity trends:", error);
			throw new Error(
				`Failed to fetch capacity trends: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}

	/**
	 * Simulate capacity impact of new projects
	 */
	async simulateProjectImpact(
		userId: string,
		projectRequirements: {
			skills: string[];
			estimatedHours: number;
			startDate: Date;
			endDate: Date;
		},
	): Promise<{
		feasible: boolean;
		impact: {
			skill: string;
			required: number;
			available: number;
			shortfall: number;
		}[];
		recommendations: string[];
	}> {
		try {
			const { skills, estimatedHours, startDate, endDate } =
				projectRequirements;
			const skillAnalysis = await this.analyzeSkillCapacity(
				userId,
				startDate,
				endDate,
			);

			const impact = [];
			let feasible = true;
			const recommendations = [];

			for (const skill of skills) {
				const skillData = skillAnalysis.find((s) => s.skill === skill);
				if (!skillData) {
					impact.push({
						skill,
						required: estimatedHours,
						available: 0,
						shortfall: estimatedHours,
					});
					feasible = false;
					recommendations.push(`No ${skill} capacity available`);
				} else {
					const required = estimatedHours / skills.length; // Distribute hours across skills
					const shortfall = Math.max(0, required - skillData.availableCapacity);

					impact.push({
						skill,
						required,
						available: skillData.availableCapacity,
						shortfall,
					});

					if (shortfall > 0) {
						feasible = false;
						recommendations.push(
							`Insufficient ${skill} capacity: need ${shortfall} more hours`,
						);
					}
				}
			}

			if (feasible) {
				recommendations.push("Project is feasible with current capacity");
			} else {
				recommendations.push(
					"Project requires additional capacity or timeline extension",
				);
			}

			return {
				feasible,
				impact,
				recommendations,
			};
		} catch (error) {
			console.error("Error simulating project impact:", error);
			throw new Error(
				`Failed to simulate project impact: ${error instanceof Error ? error.message : "Unknown error"}`,
			);
		}
	}
}
