import { and, asc, count, desc, eq, gte, lte, sum } from "drizzle-orm";
import {} from "lucide-react";
import { db } from "../db/connection";
import {
	type ClientProfitability,
	type NewClientProfitability,
	type NewProject,
	type NewProjectExpense,
	type NewProjectMilestone,
	type NewProjectTimeEntry,
	type Project,
	type ProjectExpense,
	type ProjectMilestone,
	type ProjectTimeEntry,
	clientProfitability,
	projectExpenses,
	projectMilestones,
	projectTimeEntries,
	projects,
} from "../db/schema-freelance";

export class FreelanceProjectService {
	/**
	 * Create a new project
	 */
	async createProject(projectData: NewProject): Promise<Project> {
		const [newProject] = await db
			.insert(projects)
			.values(projectData)
			.returning();
		return newProject;
	}

	/**
	 * Get all projects for a user
	 */
	async getProjects(
		userId: string,
		filters?: {
			status?: string;
			clientId?: string;
			contractType?: string;
		},
	): Promise<Project[]> {
		let query = db.select().from(projects).where(eq(projects.userId, userId));

		if (filters?.status) {
			query = query.where(eq(projects.status, filters.status as any));
		}
		if (filters?.clientId) {
			query = query.where(eq(projects.clientId, filters.clientId));
		}
		if (filters?.contractType) {
			query = query.where(
				eq(projects.contractType, filters.contractType as any),
			);
		}

		return await query.orderBy(desc(projects.createdAt));
	}

	/**
	 * Get a specific project by ID
	 */
	async getProjectById(
		projectId: string,
		userId: string,
	): Promise<Project | null> {
		const [project] = await db
			.select()
			.from(projects)
			.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
			.limit(1);

		return project || null;
	}

	/**
	 * Update a project
	 */
	async updateProject(
		projectId: string,
		userId: string,
		updates: Partial<NewProject>,
	): Promise<Project | null> {
		const [updatedProject] = await db
			.update(projects)
			.set({ ...updates, updatedAt: new Date() })
			.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
			.returning();

		return updatedProject || null;
	}

	/**
	 * Delete a project
	 */
	async deleteProject(projectId: string, userId: string): Promise<boolean> {
		const result = await db
			.delete(projects)
			.where(and(eq(projects.id, projectId), eq(projects.userId, userId)));

		return result.rowCount > 0;
	}

	/**
	 * Get project profitability metrics
	 */
	async getProjectProfitability(
		projectId: string,
		userId: string,
	): Promise<{
		totalRevenue: number;
		totalExpenses: number;
		netProfit: number;
		profitMargin: number;
		totalHours: number;
		averageHourlyRate: number;
	}> {
		// Get project details
		const project = await this.getProjectById(projectId, userId);
		if (!project) {
			throw new Error("Project not found");
		}

		// Calculate total revenue from invoices
		const revenueResult = await db
			.select({ total: sum(invoices.total) })
			.from(invoices)
			.where(
				and(
					eq(invoices.userId, userId),
					eq(invoices.clientId, project.clientId),
				),
			);

		// Calculate total expenses
		const expensesResult = await db
			.select({ total: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					eq(projectExpenses.projectId, projectId),
				),
			);

		// Calculate total hours
		const hoursResult = await db
			.select({ total: sum(projectTimeEntries.duration) })
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					eq(projectTimeEntries.projectId, projectId),
				),
			);

		const totalRevenue = Number.parseFloat(revenueResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const totalHours = Number.parseInt(hoursResult[0]?.total || "0") / 3600; // Convert seconds to hours
		const netProfit = totalRevenue - totalExpenses;
		const profitMargin =
			totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
		const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

		return {
			totalRevenue,
			totalExpenses,
			netProfit,
			profitMargin,
			totalHours,
			averageHourlyRate,
		};
	}

	/**
	 * Create a project milestone
	 */
	async createMilestone(
		milestoneData: NewProjectMilestone,
	): Promise<ProjectMilestone> {
		const [newMilestone] = await db
			.insert(projectMilestones)
			.values(milestoneData)
			.returning();
		return newMilestone;
	}

	/**
	 * Get milestones for a project
	 */
	async getProjectMilestones(
		projectId: string,
		userId: string,
	): Promise<ProjectMilestone[]> {
		return await db
			.select()
			.from(projectMilestones)
			.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectMilestones.projectId, projectId),
				),
			)
			.orderBy(asc(projectMilestones.dueDate));
	}

	/**
	 * Update milestone status
	 */
	async updateMilestoneStatus(
		milestoneId: string,
		userId: string,
		status: "pending" | "in_progress" | "completed" | "overdue",
	): Promise<ProjectMilestone | null> {
		const [updatedMilestone] = await db
			.update(projectMilestones)
			.set({
				status,
				completedDate: status === "completed" ? new Date() : null,
				updatedAt: new Date(),
			})
			.where(
				and(eq(projectMilestones.id, milestoneId), eq(projects.userId, userId)),
			)
			.returning();

		return updatedMilestone || null;
	}

	/**
	 * Track time for a project
	 */
	async trackTime(timeData: NewProjectTimeEntry): Promise<ProjectTimeEntry> {
		const [newTimeEntry] = await db
			.insert(projectTimeEntries)
			.values(timeData)
			.returning();
		return newTimeEntry;
	}

	/**
	 * Get time entries for a project
	 */
	async getProjectTimeEntries(
		projectId: string,
		userId: string,
		filters?: {
			startDate?: Date;
			endDate?: Date;
			billable?: boolean;
		},
	): Promise<ProjectTimeEntry[]> {
		let query = db
			.select()
			.from(projectTimeEntries)
			.innerJoin(projects, eq(projectTimeEntries.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectTimeEntries.projectId, projectId),
				),
			);

		if (filters?.startDate) {
			query = query.where(gte(projectTimeEntries.startTime, filters.startDate));
		}
		if (filters?.endDate) {
			query = query.where(lte(projectTimeEntries.startTime, filters.endDate));
		}
		if (filters?.billable !== undefined) {
			query = query.where(eq(projectTimeEntries.isBillable, filters.billable));
		}

		return await query.orderBy(desc(projectTimeEntries.startTime));
	}

	/**
	 * Add expense to a project
	 */
	async addProjectExpense(
		expenseData: NewProjectExpense,
	): Promise<ProjectExpense> {
		const [newExpense] = await db
			.insert(projectExpenses)
			.values(expenseData)
			.returning();
		return newExpense;
	}

	/**
	 * Get project expenses
	 */
	async getProjectExpenses(
		projectId: string,
		userId: string,
	): Promise<ProjectExpense[]> {
		return await db
			.select()
			.from(projectExpenses)
			.innerJoin(projects, eq(projectExpenses.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectExpenses.projectId, projectId),
				),
			)
			.orderBy(desc(projectExpenses.date));
	}

	/**
	 * Calculate client profitability over a period
	 */
	async calculateClientProfitability(
		clientId: string,
		userId: string,
		startDate: Date,
		endDate: Date,
	): Promise<ClientProfitability> {
		// Get all projects for this client in the period
		const clientProjects = await db
			.select()
			.from(projects)
			.where(
				and(
					eq(projects.userId, userId),
					eq(projects.clientId, clientId),
					gte(projects.startDate, startDate),
					lte(projects.endDate, endDate),
				),
			);

		const projectIds = clientProjects.map((p) => p.id);

		// Calculate total revenue
		const revenueResult = await db
			.select({ total: sum(invoices.total) })
			.from(invoices)
			.where(and(eq(invoices.userId, userId), eq(invoices.clientId, clientId)));

		// Calculate total expenses
		const expensesResult = await db
			.select({ total: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(
				and(
					eq(projectExpenses.userId, userId),
					// Filter by project IDs if any
					projectIds.length > 0
						? sql`${projectExpenses.projectId} = ANY(${projectIds})`
						: sql`1=1`,
				),
			);

		// Calculate total hours
		const hoursResult = await db
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
					projectIds.length > 0
						? sql`${projectTimeEntries.projectId} = ANY(${projectIds})`
						: sql`1=1`,
				),
			);

		const totalRevenue = Number.parseFloat(revenueResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const totalHours = Number.parseInt(hoursResult[0]?.total || "0") / 3600;
		const billableHours =
			Number.parseInt(hoursResult[0]?.billable || "0") / 3600;
		const netProfit = totalRevenue - totalExpenses;
		const profitMargin =
			totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
		const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

		// Create profitability record
		const profitabilityData: NewClientProfitability = {
			userId,
			clientId,
			periodStart: startDate,
			periodEnd: endDate,
			totalRevenue: totalRevenue.toString(),
			totalExpenses: totalExpenses.toString(),
			netProfit: netProfit.toString(),
			profitMargin: profitMargin.toString(),
			totalHours,
			billableHours,
			averageHourlyRate: averageHourlyRate.toString(),
			projectsCompleted: clientProjects.filter((p) => p.status === "completed")
				.length,
			projectsActive: clientProjects.filter((p) => p.status === "active")
				.length,
		};

		const [newProfitability] = await db
			.insert(clientProfitability)
			.values(profitabilityData)
			.returning();

		return newProfitability;
	}

	/**
	 * Get project dashboard data
	 */
	async getProjectDashboard(userId: string): Promise<{
		activeProjects: number;
		completedProjects: number;
		totalRevenue: number;
		totalExpenses: number;
		netProfit: number;
		averageHourlyRate: number;
		overdueMilestones: number;
	}> {
		// Get project counts
		const projectCounts = await db
			.select({
				status: projects.status,
				count: count(),
			})
			.from(projects)
			.where(eq(projects.userId, userId))
			.groupBy(projects.status);

		// Get financial metrics
		const revenueResult = await db
			.select({ total: sum(invoices.total) })
			.from(invoices)
			.where(eq(invoices.userId, userId));

		const expensesResult = await db
			.select({ total: sum(projectExpenses.amount) })
			.from(projectExpenses)
			.where(eq(projectExpenses.userId, userId));

		const hoursResult = await db
			.select({ total: sum(projectTimeEntries.duration) })
			.from(projectTimeEntries)
			.where(
				and(
					eq(projectTimeEntries.userId, userId),
					eq(projectTimeEntries.isBillable, true),
				),
			);

		// Get overdue milestones
		const overdueMilestones = await db
			.select({ count: count() })
			.from(projectMilestones)
			.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
			.where(
				and(
					eq(projects.userId, userId),
					eq(projectMilestones.status, "overdue"),
				),
			);

		const totalRevenue = Number.parseFloat(revenueResult[0]?.total || "0");
		const totalExpenses = Number.parseFloat(expensesResult[0]?.total || "0");
		const totalHours = Number.parseInt(hoursResult[0]?.total || "0") / 3600;
		const netProfit = totalRevenue - totalExpenses;
		const averageHourlyRate = totalHours > 0 ? totalRevenue / totalHours : 0;

		return {
			activeProjects:
				projectCounts.find((p) => p.status === "active")?.count || 0,
			completedProjects:
				projectCounts.find((p) => p.status === "completed")?.count || 0,
			totalRevenue,
			totalExpenses,
			netProfit,
			averageHourlyRate,
			overdueMilestones: overdueMilestones[0]?.count || 0,
		};
	}
}

import { sql } from "drizzle-orm";
// Import required schemas
import { invoices } from "../db/schema-actual";
