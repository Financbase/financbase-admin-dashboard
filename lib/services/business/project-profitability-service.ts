import { getDbOrThrow } from "@/lib/db";
import {
	type Project,
	projectExpenses,
	projectMilestones,
	projects,
} from "@/lib/db/schemas/freelance.schema";
import { timeEntries } from "@/lib/db/schemas/schema-financial";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import {} from "lucide-react";

/**
 * Calculate project profitability metrics
 */
export async function calculateProjectProfitability(
	projectId: string,
	userId: string,
): Promise<{
	project: Project;
	financialMetrics: {
		totalBudget: number;
		totalSpent: number;
		totalRevenue: number;
		profit: number;
		profitMargin: number;
		roi: number;
		breakevenPoint: number;
	};
	timeMetrics: {
		totalHours: number;
		billableHours: number;
		unbilledHours: number;
		hourlyRate: number;
		effectiveRate: number;
	};
	expenseMetrics: {
		totalExpenses: number;
		billableExpenses: number;
		reimbursableExpenses: number;
		expenseRatio: number;
	};
	milestoneMetrics: {
		totalMilestones: number;
		completedMilestones: number;
		completionRate: number;
		onTimeRate: number;
	};
} | null> {
	const db = getDbOrThrow();

	// Get project
	const [project] = await db
		.select()
		.from(projects)
		.where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
		.limit(1);

	if (!project) return null;

	// Get milestones
	const milestones = await db
		.select()
		.from(projectMilestones)
		.from(projectMilestones)
		.where(eq(projectMilestones.projectId, projectId));

	// Get expenses
	const expenses = await db
		.select()
		.from(projectExpenses)
		.where(eq(projectExpenses.projectId, projectId));

	// Get time entries
	const timeEntries = await db
		.select()
		.from(timeEntries)
		.where(
			and(eq(timeEntries.projectId, projectId), eq(timeEntries.userId, userId)),
		);

	// Calculate financial metrics
	const totalBudget = Number(project.budget || 0);
	const totalSpent = Number(project.spent || 0);

	const totalRevenue = milestones
		.filter((m) => m.status === "completed" && m.amount)
		.reduce((sum, m) => sum + Number(m.amount || 0), 0);

	const profit = totalRevenue - totalSpent;
	const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
	const roi = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
	const breakevenPoint = totalSpent > 0 ? (totalSpent / totalRevenue) * 100 : 0;

	// Calculate time metrics
	const totalHours = timeEntries.reduce((sum, entry) => {
		return sum + (Number(entry.duration) || 0) / 3600; // Convert seconds to hours
	}, 0);

	const billableHours = timeEntries
		.filter((entry) => entry.isBillable)
		.reduce((sum, entry) => {
			return sum + (Number(entry.duration) || 0) / 3600;
		}, 0);

	const unbilledHours = timeEntries
		.filter((entry) => entry.isBillable && !entry.isBilled)
		.reduce((sum, entry) => {
			return sum + (Number(entry.duration) || 0) / 3600;
		}, 0);

	const hourlyRate = Number(project.hourlyRate || 0);
	const effectiveRate = totalHours > 0 ? totalRevenue / totalHours : 0;

	// Calculate expense metrics
	const totalExpenses = expenses.reduce((sum, expense) => {
		return sum + Number(expense.amount);
	}, 0);

	const billableExpenses = expenses
		.filter((expense) => expense.isBillable)
		.reduce((sum, expense) => {
			return sum + Number(expense.amount);
		}, 0);

	const reimbursableExpenses = expenses
		.filter((expense) => expense.isReimbursable)
		.reduce((sum, expense) => {
			return sum + Number(expense.amount);
		}, 0);

	const expenseRatio =
		totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0;

	// Calculate milestone metrics
	const totalMilestones = milestones.length;
	const completedMilestones = milestones.filter(
		(m) => m.status === "completed",
	).length;
	const completionRate =
		totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

	const onTimeMilestones = milestones.filter((m) => {
		if (m.status !== "completed" || !m.dueDate || !m.completedDate)
			return false;
		return new Date(m.completedDate) <= new Date(m.dueDate);
	}).length;

	const onTimeRate =
		completedMilestones > 0
			? (onTimeMilestones / completedMilestones) * 100
			: 0;

	return {
		project,
		financialMetrics: {
			totalBudget,
			totalSpent,
			totalRevenue,
			profit,
			profitMargin,
			roi,
			breakevenPoint,
		},
		timeMetrics: {
			totalHours,
			billableHours,
			unbilledHours,
			hourlyRate,
			effectiveRate,
		},
		expenseMetrics: {
			totalExpenses,
			billableExpenses,
			reimbursableExpenses,
			expenseRatio,
		},
		milestoneMetrics: {
			totalMilestones,
			completedMilestones,
			completionRate,
			onTimeRate,
		},
	};
}

/**
 * Get profitability trends over time
 */
export async function getProfitabilityTrends(
	projectId: string,
	userId: string,
	startDate: Date,
	endDate: Date,
): Promise<
	{
		date: string;
		revenue: number;
		expenses: number;
		profit: number;
		profitMargin: number;
	}[]
> {
	const db = getDbOrThrow();

	// Get daily revenue from milestones
	const revenueData = await db
		.select({
			date: sql<string>`DATE(${projectMilestones.completedDate})`,
			revenue: sql<number>`COALESCE(sum(${projectMilestones.amount}), 0)`,
		})
		.from(projectMilestones)
		.innerJoin(projects, eq(projectMilestones.projectId, projects.id))
		.where(
			and(
				eq(projects.id, projectId),
				eq(projects.userId, userId),
				eq(projectMilestones.status, "completed"),
				gte(projectMilestones.completedDate, startDate),
				lte(projectMilestones.completedDate, endDate),
			),
		)
		.groupBy(sql`DATE(${projectMilestones.completedDate})`);

	// Get daily expenses
	const expenseData = await db
		.select({
			date: sql<string>`DATE(${projectExpenses.date})`,
			expenses: sql<number>`COALESCE(sum(${projectExpenses.amount}), 0)`,
		})
		.from(projectExpenses)
		.where(
			and(
				eq(projectExpenses.projectId, projectId),
				gte(projectExpenses.date, startDate),
				lte(projectExpenses.date, endDate),
			),
		)
		.groupBy(sql`DATE(${projectExpenses.date})`);

	// Combine data
	const trendsMap = new Map<string, { revenue: number; expenses: number }>();

	revenueData.forEach((item) => {
		trendsMap.set(item.date, { revenue: Number(item.revenue), expenses: 0 });
	});

	expenseData.forEach((item) => {
		const existing = trendsMap.get(item.date) || { revenue: 0, expenses: 0 };
		trendsMap.set(item.date, { ...existing, expenses: Number(item.expenses) });
	});

	// Convert to array and calculate metrics
	return Array.from(trendsMap.entries())
		.map(([date, data]) => {
			const profit = data.revenue - data.expenses;
			const profitMargin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

			return {
				date,
				revenue: data.revenue,
				expenses: data.expenses,
				profit,
				profitMargin,
			};
		})
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Get project performance benchmarks
 */
export async function getProjectBenchmarks(
	userId: string,
	projectType?: string,
): Promise<{
	averageROI: number;
	averageProfitMargin: number;
	averageCompletionTime: number;
	topPerformingProjects: Array<{
		projectId: string;
		name: string;
		roi: number;
		profitMargin: number;
	}>;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(projects.userId, userId)];
	if (projectType) {
		conditions.push(eq(projects.projectType, projectType));
	}

	const whereClause = and(...conditions);

	// Get all projects with their metrics
	const projectMetrics = await db
		.select({
			projectId: projects.id,
			name: projects.name,
			budget: projects.budget,
			spent: projects.spent,
			startDate: projects.startDate,
			endDate: projects.endDate,
		})
		.from(projects)
		.where(whereClause);

	// Calculate metrics for each project
	const projectStats = await Promise.all(
		projectMetrics.map(async (project) => {
			const milestones = await db
				.select()
				.from(projectMilestones)
				.where(
					and(
						eq(projectMilestones.projectId, project.projectId),
						eq(projectMilestones.status, "completed"),
					),
				);

			const totalRevenue = milestones.reduce(
				(sum, m) => sum + Number(m.amount || 0),
				0,
			);
			const totalSpent = Number(project.spent || 0);
			const profit = totalRevenue - totalSpent;
			const roi = totalSpent > 0 ? (profit / totalSpent) * 100 : 0;
			const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

			const completionTime =
				project.startDate && project.endDate
					? (new Date(project.endDate).getTime() -
							new Date(project.startDate).getTime()) /
						(1000 * 60 * 60 * 24) // days
					: 0;

			return {
				projectId: project.projectId,
				name: project.name,
				roi,
				profitMargin,
				completionTime,
			};
		}),
	);

	// Calculate averages
	const averageROI =
		projectStats.reduce((sum, p) => sum + p.roi, 0) / projectStats.length || 0;
	const averageProfitMargin =
		projectStats.reduce((sum, p) => sum + p.profitMargin, 0) /
			projectStats.length || 0;
	const averageCompletionTime =
		projectStats.reduce((sum, p) => sum + p.completionTime, 0) /
			projectStats.length || 0;

	// Get top performing projects
	const topPerformingProjects = projectStats
		.sort((a, b) => b.roi - a.roi)
		.slice(0, 5)
		.map((p) => ({
			projectId: p.projectId,
			name: p.name,
			roi: p.roi,
			profitMargin: p.profitMargin,
		}));

	return {
		averageROI,
		averageProfitMargin,
		averageCompletionTime,
		topPerformingProjects,
	};
}
