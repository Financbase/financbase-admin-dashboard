import { db } from "@/lib/db";
import {
	type FreelanceContract,
	type FreelanceProject,
	type NewFreelanceContract,
	type NewFreelanceProject,
	type NewProjectExpense,
	type NewProjectMilestone,
	type ProjectExpense,
	type ProjectMilestone,
	freelanceContracts,
	freelanceProjects,
	projectExpenses,
	projectMilestones,
} from "@/lib/db/schemas/freelance.schema";
import { clients } from "@/lib/db/schemas/schema-financial";
import { and, desc, eq, sql } from "drizzle-orm";
import {} from "lucide-react";

/**
 * Create a new freelance project
 */
export async function createFreelanceProject(
	userId: string,
	projectData: Omit<NewFreelanceProject, "userId" | "createdAt" | "updatedAt">,
): Promise<FreelanceProject> {
	try {
		const [project] = await db
			.insert(freelanceProjects)
			.values({
				...projectData,
				userId,
			})
			.returning();

		return project;
	} catch (error) {
		console.error("Error creating freelance project:", error);
		throw new Error("Failed to create project");
	}
}

/**
 * Get all freelance projects for a user
 */
export async function getFreelanceProjects(
	userId: string,
	options?: {
		status?: string;
		clientId?: string;
		limit?: number;
		offset?: number;
	},
): Promise<FreelanceProject[]> {
	try {
		const conditions = [eq(freelanceProjects.userId, userId)];

		if (options?.status) {
			conditions.push(eq(freelanceProjects.status, options.status));
		}

		if (options?.clientId) {
			conditions.push(eq(freelanceProjects.clientId, options.clientId));
		}

		const whereClause = and(...conditions);

		const result = await db
			.select()
			.from(freelanceProjects)
			.where(whereClause)
			.orderBy(desc(freelanceProjects.createdAt))
			.limit(options?.limit || 50)
			.offset(options?.offset || 0);

		return result;
	} catch (error) {
		console.error("Error fetching freelance projects:", error);
		throw new Error("Failed to fetch projects");
	}
}

/**
 * Get a single freelance project by ID
 */
export async function getFreelanceProjectById(
	projectId: string,
	userId: string,
): Promise<FreelanceProject | null> {
	try {
		const [project] = await db
			.select()
			.from(freelanceProjects)
			.where(
				and(
					eq(freelanceProjects.id, projectId),
					eq(freelanceProjects.userId, userId),
				),
			)
			.limit(1);

		return project || null;
	} catch (error) {
		console.error("Error fetching freelance project:", error);
		throw new Error("Failed to fetch project");
	}
}

/**
 * Update a freelance project
 */
export async function updateFreelanceProject(
	projectId: string,
	userId: string,
	updateData: Partial<
		Omit<FreelanceProject, "id" | "userId" | "createdAt" | "updatedAt">
	>,
): Promise<FreelanceProject | null> {
	try {
		const [project] = await db
			.update(freelanceProjects)
			.set({
				...updateData,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(freelanceProjects.id, projectId),
					eq(freelanceProjects.userId, userId),
				),
			)
			.returning();

		return project || null;
	} catch (error) {
		console.error("Error updating freelance project:", error);
		throw new Error("Failed to update project");
	}
}

/**
 * Delete a freelance project
 */
export async function deleteFreelanceProject(
	projectId: string,
	userId: string,
): Promise<boolean> {
	try {
		const result = await db
			.delete(freelanceProjects)
			.where(
				and(
					eq(freelanceProjects.id, projectId),
					eq(freelanceProjects.userId, userId),
				),
			);

		return result.rowCount > 0;
	} catch (error) {
		console.error("Error deleting freelance project:", error);
		throw new Error("Failed to delete project");
	}
}

/**
 * Get freelance project profitability data
 */
export async function getProjectProfitability(
	projectId: string,
	userId: string,
): Promise<{
	project: FreelanceProject;
	totalBudget: number;
	totalSpent: number;
	totalRevenue: number;
	profitMargin: number;
	roi: number;
	milestones: ProjectMilestone[];
	expenses: ProjectExpense[];
} | null> {
	try {
		// Get project
		const project = await getFreelanceProjectById(projectId, userId);
		if (!project) return null;

		// Get milestones
		const milestones = await db
			.select()
			.from(projectMilestones)
			.where(eq(projectMilestones.projectId, projectId))
			.orderBy(desc(projectMilestones.createdAt));

		// Get expenses
		const expenses = await db
			.select()
			.from(projectExpenses)
			.where(eq(projectExpenses.projectId, projectId))
			.orderBy(desc(projectExpenses.createdAt));

		// Calculate totals
		const totalBudget = Number(project.budget || 0);
		const totalSpent = Number(project.spent || 0);

		// Calculate revenue from milestones
		const totalRevenue = milestones
			.filter((m) => m.status === "completed" && m.amount)
			.reduce((sum, m) => sum + Number(m.amount || 0), 0);

		// Calculate profit margin and ROI
		const profitMargin =
			totalRevenue > 0 ? ((totalRevenue - totalSpent) / totalRevenue) * 100 : 0;
		const roi =
			totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

		return {
			project,
			totalBudget,
			totalSpent,
			totalRevenue,
			profitMargin,
			roi,
			milestones,
			expenses,
		};
	} catch (error) {
		console.error("Error calculating project profitability:", error);
		throw new Error("Failed to calculate project profitability");
	}
}

/**
 * Add milestone to freelance project
 */
export async function addProjectMilestone(
	projectId: string,
	userId: string,
	milestoneData: Omit<
		NewProjectMilestone,
		"projectId" | "createdAt" | "updatedAt"
	>,
): Promise<ProjectMilestone> {
	try {
		// Verify project belongs to user
		const project = await getFreelanceProjectById(projectId, userId);
		if (!project) {
			throw new Error("Project not found");
		}

		const [milestone] = await db
			.insert(projectMilestones)
			.values({
				...milestoneData,
				projectId,
			})
			.returning();

		return milestone;
	} catch (error) {
		console.error("Error adding project milestone:", error);
		throw new Error("Failed to add milestone");
	}
}

/**
 * Update milestone status
 */
export async function updateMilestoneStatus(
	milestoneId: string,
	projectId: string,
	userId: string,
	status: string,
	completedDate?: Date,
): Promise<ProjectMilestone | null> {
	try {
		// Verify project belongs to user
		const project = await getFreelanceProjectById(projectId, userId);
		if (!project) {
			throw new Error("Project not found");
		}

		const [milestone] = await db
			.update(projectMilestones)
			.set({
				status,
				completedDate:
					status === "completed" ? completedDate || new Date() : null,
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(projectMilestones.id, milestoneId),
					eq(projectMilestones.projectId, projectId),
				),
			)
			.returning();

		return milestone || null;
	} catch (error) {
		console.error("Error updating milestone status:", error);
		throw new Error("Failed to update milestone");
	}
}

/**
 * Get freelance project statistics
 */
export async function getFreelanceProjectStats(
	userId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	totalBudget: number;
	totalSpent: number;
	totalRevenue: number;
	averageROI: number;
}> {
	try {
		const conditions = [eq(freelanceProjects.userId, userId)];

		if (startDate) {
			conditions.push(sql`${freelanceProjects.createdAt} >= ${startDate}`);
		}

		if (endDate) {
			conditions.push(sql`${freelanceProjects.createdAt} <= ${endDate}`);
		}

		const whereClause = and(...conditions);

		const [stats] = await db
			.select({
				totalProjects: sql<number>`count(*)`,
				activeProjects: sql<number>`count(CASE WHEN ${freelanceProjects.status} = 'in_progress' THEN 1 END)`,
				completedProjects: sql<number>`count(CASE WHEN ${freelanceProjects.status} = 'completed' THEN 1 END)`,
				totalBudget: sql<number>`COALESCE(sum(${freelanceProjects.budget}), 0)`,
				totalSpent: sql<number>`COALESCE(sum(${freelanceProjects.spent}), 0)`,
			})
			.from(freelanceProjects)
			.where(whereClause);

		// Get revenue from completed milestones
		const [revenueStats] = await db
			.select({
				totalRevenue: sql<number>`COALESCE(sum(${projectMilestones.amount}), 0)`,
			})
			.from(projectMilestones)
			.innerJoin(
				freelanceProjects,
				eq(projectMilestones.projectId, freelanceProjects.id),
			)
			.where(
				and(
					eq(freelanceProjects.userId, userId),
					eq(projectMilestones.status, "completed"),
				),
			);

		const totalRevenue = Number(revenueStats?.totalRevenue || 0);
		const totalSpent = Number(stats?.totalSpent || 0);
		const averageROI =
			totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent) * 100 : 0;

		return {
			totalProjects: Number(stats?.totalProjects || 0),
			activeProjects: Number(stats?.activeProjects || 0),
			completedProjects: Number(stats?.completedProjects || 0),
			totalBudget: Number(stats?.totalBudget || 0),
			totalSpent: totalSpent,
			totalRevenue: totalRevenue,
			averageROI: averageROI,
		};
	} catch (error) {
		console.error("Error fetching freelance project stats:", error);
		throw new Error("Failed to fetch project statistics");
	}
}
