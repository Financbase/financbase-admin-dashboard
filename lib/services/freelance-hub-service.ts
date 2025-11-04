/**
 * Freelance Hub Service
 * Business logic for project management, time tracking, and billing
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { projects, type Project } from '@/lib/db/schemas/projects.schema';
import { timeEntries, type TimeEntry } from '@/lib/db/schemas/time-entries.schema';
import { tasks, type Task } from '@/lib/db/schemas/tasks.schema';
import { clients } from '@/lib/db/schemas/clients.schema';
import { eq, and, desc, ilike, or, sql, gte, lte, isNull } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateProjectInput {
	userId: string;
	clientId?: string;
	name: string;
	description?: string;
	status?: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	startDate?: Date;
	dueDate?: Date;
	budget?: number;
	hourlyRate?: number;
	currency?: string;
	isBillable?: boolean;
	allowOvertime?: boolean;
	requireApproval?: boolean;
	estimatedHours?: number;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CreateTimeEntryInput {
	userId: string;
	projectId: string;
	description: string;
	startTime: Date;
	endTime?: Date;
	duration?: number;
	isBillable?: boolean;
	hourlyRate?: number;
	requiresApproval?: boolean;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CreateTaskInput {
	userId: string;
	projectId: string;
	parentTaskId?: string;
	title: string;
	description?: string;
	status?: 'todo' | 'in_progress' | 'review' | 'completed' | 'cancelled';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	dueDate?: Date;
	estimatedHours?: number;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface ProjectStats {
	totalProjects: number;
	activeProjects: number;
	completedProjects: number;
	totalHours: number;
	totalBillableHours: number;
	totalRevenue: number;
	averageProjectDuration: number;
	projectsByStatus: Array<{
		status: string;
		count: number;
	}>;
	recentActivity: Array<{
		id: string;
		type: 'project' | 'time_entry' | 'task';
		description: string;
		createdAt: string;
	}>;
}

interface TimeTrackingStats {
	totalHours: number;
	billableHours: number;
	nonBillableHours: number;
	totalRevenue: number;
	averageHourlyRate: number;
	hoursByProject: Array<{
		projectId: string;
		projectName: string;
		hours: number;
		revenue: number;
	}>;
	weeklyHours: Array<{
		week: string;
		hours: number;
		billableHours: number;
	}>;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<Project> {
	try {
		const [project] = await db.insert(projects).values({
			userId: input.userId,
			clientId: input.clientId,
			name: input.name,
			description: input.description,
			status: input.status || 'planning',
			priority: input.priority || 'medium',
			startDate: input.startDate,
			dueDate: input.dueDate,
			budget: input.budget?.toString(),
			hourlyRate: input.hourlyRate?.toString(),
			currency: input.currency || 'USD',
			isBillable: input.isBillable ?? true,
			allowOvertime: input.allowOvertime ?? false,
			requireApproval: input.requireApproval ?? false,
			estimatedHours: input.estimatedHours?.toString(),
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendProjectCreated(project.id, input.userId);

		return project;
	} catch (error) {
		console.error('Error creating project:', error);
		throw new Error('Failed to create project');
	}
}

/**
 * Get project by ID
 */
export async function getProjectById(projectId: string, userId: string): Promise<Project | null> {
	const project = await db.query.projects.findFirst({
		where: and(
			eq(projects.id, projectId),
			eq(projects.userId, userId)
		),
	});

	return project || null;
}

/**
 * Get all projects for a user with pagination and filtering
 */
export async function getPaginatedProjects(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		priority?: string;
		clientId?: string;
	} = {}
): Promise<{
	projects: Project[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		page = 1,
		limit = 20,
		search,
		status,
		priority,
		clientId
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(projects.userId, userId)];
	
	if (search) {
		whereConditions.push(
			or(
				ilike(projects.name, `%${search}%`),
				ilike(projects.description, `%${search}%`)
			)!
		);
	}
	
	if (status) {
		whereConditions.push(eq(projects.status, status as any));
	}
	
	if (priority) {
		whereConditions.push(eq(projects.priority, priority as any));
	}
	
	if (clientId) {
		whereConditions.push(eq(projects.clientId, clientId));
	}

	// Get projects
	const projectsList = await db
		.select()
		.from(projects)
		.where(and(...whereConditions))
		.orderBy(desc(projects.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(projects)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		projects: projectsList,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Update project
 */
export async function updateProject(
	projectId: string,
	userId: string,
	updateData: Partial<CreateProjectInput>
): Promise<Project> {
	try {
		const [updatedProject] = await db
			.update(projects)
			.set({
				name: updateData.name,
				description: updateData.description,
				status: updateData.status,
				priority: updateData.priority,
				startDate: updateData.startDate,
				dueDate: updateData.dueDate,
				budget: updateData.budget?.toString(),
				hourlyRate: updateData.hourlyRate?.toString(),
				currency: updateData.currency,
				isBillable: updateData.isBillable,
				allowOvertime: updateData.allowOvertime,
				requireApproval: updateData.requireApproval,
				estimatedHours: updateData.estimatedHours?.toString(),
				tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
				metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
				notes: updateData.notes,
				updatedAt: new Date(),
			})
			.where(and(
				eq(projects.id, projectId),
				eq(projects.userId, userId)
			))
			.returning();

		if (!updatedProject) {
			throw new Error('Project not found');
		}

		return updatedProject;
	} catch (error) {
		console.error('Error updating project:', error);
		throw new Error('Failed to update project');
	}
}

/**
 * Create a time entry
 */
export async function createTimeEntry(input: CreateTimeEntryInput): Promise<TimeEntry> {
	try {
		// Calculate duration if not provided
		let duration = input.duration;
		if (!duration && input.endTime) {
			duration = (input.endTime.getTime() - input.startTime.getTime()) / (1000 * 60 * 60); // hours
		}

		// Get project hourly rate if not provided
		const project = await getProjectById(input.projectId, input.userId);
		const hourlyRate = input.hourlyRate || Number(project?.hourlyRate || 0);
		const totalAmount = duration ? duration * hourlyRate : 0;

		const [timeEntry] = await db.insert(timeEntries).values({
			userId: input.userId,
			projectId: input.projectId,
			description: input.description,
			startTime: input.startTime,
			endTime: input.endTime,
			duration: duration?.toString(),
			isBillable: input.isBillable ?? true,
			hourlyRate: hourlyRate.toString(),
			totalAmount: totalAmount.toString(),
			requiresApproval: input.requiresApproval ?? false,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Update project actual hours
		if (duration) {
			await db
				.update(projects)
				.set({
					actualHours: sql`${projects.actualHours} + ${duration}`,
					updatedAt: new Date(),
				})
				.where(eq(projects.id, input.projectId));
		}

		// Send notification
		await NotificationHelpers.sendTimeEntryCreated(timeEntry.id, input.userId);

		return timeEntry;
	} catch (error) {
		console.error('Error creating time entry:', error);
		throw new Error('Failed to create time entry');
	}
}

/**
 * Start time tracking
 */
export async function startTimeTracking(
	userId: string,
	projectId: string,
	description: string
): Promise<TimeEntry> {
	try {
		// Check if there's already a running time entry
		const [runningEntry] = await db
			.select()
			.from(timeEntries)
			.where(and(
				eq(timeEntries.userId, userId),
				eq(timeEntries.status, 'running')
			))
			.limit(1);

		if (runningEntry) {
			throw new Error('You already have a running time entry. Please stop it first.');
		}

		const timeEntry = await createTimeEntry({
			userId,
			projectId,
			description,
			startTime: new Date(),
			status: 'running',
		});

		return timeEntry;
	} catch (error) {
		console.error('Error starting time tracking:', error);
		throw new Error('Failed to start time tracking');
	}
}

/**
 * Stop time tracking
 */
export async function stopTimeTracking(timeEntryId: string, userId: string): Promise<TimeEntry> {
	try {
		const endTime = new Date();
		
		const [updatedEntry] = await db
			.update(timeEntries)
			.set({
				endTime,
				status: 'completed',
				updatedAt: new Date(),
			})
			.where(and(
				eq(timeEntries.id, timeEntryId),
				eq(timeEntries.userId, userId)
			))
			.returning();

		if (!updatedEntry) {
			throw new Error('Time entry not found');
		}

		// Calculate duration and total amount
		const startTime = new Date(updatedEntry.startTime);
		const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60); // hours
		const totalAmount = duration * Number(updatedEntry.hourlyRate || 0);

		// Update with calculated values
		const [finalEntry] = await db
			.update(timeEntries)
			.set({
				duration: duration.toString(),
				totalAmount: totalAmount.toString(),
			})
			.where(eq(timeEntries.id, timeEntryId))
			.returning();

		return finalEntry;
	} catch (error) {
		console.error('Error stopping time tracking:', error);
		throw new Error('Failed to stop time tracking');
	}
}

/**
 * Get time entries with pagination and filtering
 */
export async function getPaginatedTimeEntries(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		projectId?: string;
		startDate?: string;
		endDate?: string;
	} = {}
): Promise<{
	timeEntries: TimeEntry[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		page = 1,
		limit = 20,
		search,
		status,
		projectId,
		startDate,
		endDate
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(timeEntries.userId, userId)];
	
	if (search) {
		whereConditions.push(ilike(timeEntries.description, `%${search}%`));
	}
	
	if (status) {
		whereConditions.push(eq(timeEntries.status, status as any));
	}
	
	if (projectId) {
		whereConditions.push(eq(timeEntries.projectId, projectId));
	}
	
	if (startDate) {
		whereConditions.push(gte(timeEntries.startTime, new Date(startDate)));
	}
	
	if (endDate) {
		whereConditions.push(lte(timeEntries.startTime, new Date(endDate)));
	}

	// Get time entries
	const entries = await db
		.select()
		.from(timeEntries)
		.where(and(...whereConditions))
		.orderBy(desc(timeEntries.startTime))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(timeEntries)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		timeEntries: entries,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Create a task
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
	try {
		const [task] = await db.insert(tasks).values({
			userId: input.userId,
			projectId: input.projectId,
			parentTaskId: input.parentTaskId,
			title: input.title,
			description: input.description,
			status: input.status || 'todo',
			priority: input.priority || 'medium',
			dueDate: input.dueDate,
			estimatedHours: input.estimatedHours?.toString(),
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendTaskCreated(task.id, input.userId);

		return task;
	} catch (error) {
		console.error('Error creating task:', error);
		throw new Error('Failed to create task');
	}
}

/**
 * Get project statistics
 */
export async function getProjectStats(userId: string): Promise<ProjectStats> {
	// Get basic project stats
	const [basicStats] = await db
		.select({
			totalProjects: sql<number>`count(*)`,
			activeProjects: sql<number>`count(case when ${projects.status} = 'active' then 1 end)`,
			completedProjects: sql<number>`count(case when ${projects.status} = 'completed' then 1 end)`,
		})
		.from(projects)
		.where(eq(projects.userId, userId));

	// Get time tracking stats
	const [timeStats] = await db
		.select({
			totalHours: sql<number>`sum(${timeEntries.duration}::numeric)`,
			billableHours: sql<number>`sum(case when ${timeEntries.isBillable} = true then ${timeEntries.duration}::numeric else 0 end)`,
			totalRevenue: sql<number>`sum(${timeEntries.totalAmount}::numeric)`,
		})
		.from(timeEntries)
		.innerJoin(projects, eq(timeEntries.projectId, projects.id))
		.where(eq(projects.userId, userId));

	// Get projects by status
	const projectsByStatus = await db
		.select({
			status: projects.status,
			count: sql<number>`count(*)`,
		})
		.from(projects)
		.where(eq(projects.userId, userId))
		.groupBy(projects.status);

	// Get recent activity
	const recentActivity = await db
		.select({
			id: projects.id,
			type: sql<string>`'project'`,
			description: projects.name,
			createdAt: projects.createdAt,
		})
		.from(projects)
		.where(eq(projects.userId, userId))
		.orderBy(desc(projects.createdAt))
		.limit(10);

	const totalHours = Number(timeStats?.totalHours || 0);
	const totalProjects = basicStats?.totalProjects || 0;

	return {
		totalProjects,
		activeProjects: basicStats?.activeProjects || 0,
		completedProjects: basicStats?.completedProjects || 0,
		totalHours,
		totalBillableHours: Number(timeStats?.billableHours || 0),
		totalRevenue: Number(timeStats?.totalRevenue || 0),
		averageProjectDuration: totalProjects > 0 ? totalHours / totalProjects : 0,
		projectsByStatus: projectsByStatus.map(status => ({
			status: status.status,
			count: status.count,
		})),
		recentActivity: recentActivity.map(activity => ({
			id: activity.id,
			type: activity.type,
			description: activity.description,
			createdAt: activity.createdAt.toISOString(),
		})),
	};
}

/**
 * Get time tracking statistics
 */
export async function getTimeTrackingStats(userId: string): Promise<TimeTrackingStats> {
	// Get basic time stats
	const [basicStats] = await db
		.select({
			totalHours: sql<number>`sum(${timeEntries.duration}::numeric)`,
			billableHours: sql<number>`sum(case when ${timeEntries.isBillable} = true then ${timeEntries.duration}::numeric else 0 end)`,
			totalRevenue: sql<number>`sum(${timeEntries.totalAmount}::numeric)`,
		})
		.from(timeEntries)
		.innerJoin(projects, eq(timeEntries.projectId, projects.id))
		.where(eq(projects.userId, userId));

	// Get hours by project
	const hoursByProject = await db
		.select({
			projectId: projects.id,
			projectName: projects.name,
			hours: sql<number>`sum(${timeEntries.duration}::numeric)`,
			revenue: sql<number>`sum(${timeEntries.totalAmount}::numeric)`,
		})
		.from(timeEntries)
		.innerJoin(projects, eq(timeEntries.projectId, projects.id))
		.where(eq(projects.userId, userId))
		.groupBy(projects.id, projects.name);

	// Get weekly hours
	const weeklyHours = await db
		.select({
			week: sql<string>`to_char(${timeEntries.startTime}, 'YYYY-WW')`,
			hours: sql<number>`sum(${timeEntries.duration}::numeric)`,
			billableHours: sql<number>`sum(case when ${timeEntries.isBillable} = true then ${timeEntries.duration}::numeric else 0 end)`,
		})
		.from(timeEntries)
		.innerJoin(projects, eq(timeEntries.projectId, projects.id))
		.where(and(
			eq(projects.userId, userId),
			gte(timeEntries.startTime, new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${timeEntries.startTime}, 'YYYY-WW')`)
		.orderBy(sql`to_char(${timeEntries.startTime}, 'YYYY-WW')`);

	const totalHours = Number(basicStats?.totalHours || 0);
	const billableHours = Number(basicStats?.billableHours || 0);

	return {
		totalHours,
		billableHours,
		nonBillableHours: totalHours - billableHours,
		totalRevenue: Number(basicStats?.totalRevenue || 0),
		averageHourlyRate: billableHours > 0 ? Number(basicStats?.totalRevenue || 0) / billableHours : 0,
		hoursByProject: hoursByProject.map(project => ({
			projectId: project.projectId,
			projectName: project.projectName,
			hours: Number(project.hours),
			revenue: Number(project.revenue),
		})),
		weeklyHours: weeklyHours.map(week => ({
			week: week.week,
			hours: Number(week.hours),
			billableHours: Number(week.billableHours),
		})),
	};
}

// Export all freelance hub service functions
export const FreelanceHubService = {
	createProject,
	getProjectById,
	getPaginatedProjects,
	updateProject,
	createTimeEntry,
	startTimeTracking,
	stopTimeTracking,
	getPaginatedTimeEntries,
	createTask,
	getProjectStats,
	getTimeTrackingStats,
};
