import { getDbOrThrow } from "@/lib/db";
import {
	type Contractor,
	type NewContractor,
	type NewProject,
	type NewProjectTask,
	type NewServiceRequest,
	type Project,
	type ProjectTask,
	type ServiceRequest,
	contractors,
	projectTasks,
	projects,
	properties,
	serviceRequests,
} from "@/lib/db/schemas/real-estate-expanded.schema";
import { and, avg, count, desc, eq, sql, sum } from "drizzle-orm";
import { Clock } from "lucide-react";

/**
 * Create a new contractor profile
 */
export async function createContractor(
	userId: string,
	contractorData: Omit<NewContractor, "userId" | "createdAt" | "updatedAt">,
): Promise<Contractor> {
	const db = getDbOrThrow();

	const [contractor] = await db
		.insert(contractors)
		.values({
			...contractorData,
			userId,
		})
		.returning();

	return contractor;
}

/**
 * Get contractor by user ID
 */
export async function getContractor(
	userId: string,
): Promise<Contractor | null> {
	const db = getDbOrThrow();

	const [contractor] = await db
		.select()
		.from(contractors)
		.where(eq(contractors.userId, userId))
		.limit(1);

	return contractor || null;
}

/**
 * Create a new project
 */
export async function createProject(
	contractorId: string,
	projectData: Omit<NewProject, "contractorId" | "createdAt" | "updatedAt">,
): Promise<Project> {
	const db = getDbOrThrow();

	const [project] = await db
		.insert(projects)
		.values({
			...projectData,
			contractorId,
		})
		.returning();

	return project;
}

/**
 * Get projects for a contractor
 */
export async function getContractorProjects(
	contractorId: string,
	options?: {
		status?: string;
		projectType?: string;
		limit?: number;
		offset?: number;
	},
): Promise<Project[]> {
	const db = getDbOrThrow();

	const conditions = [eq(projects.contractorId, contractorId)];

	if (options?.status) {
		conditions.push(eq(projects.status, options.status));
	}

	if (options?.projectType) {
		conditions.push(eq(projects.projectType, options.projectType));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(projects)
		.where(whereClause)
		.orderBy(desc(projects.createdAt))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Create a project task
 */
export async function createProjectTask(
	projectId: string,
	taskData: Omit<NewProjectTask, "projectId" | "createdAt" | "updatedAt">,
): Promise<ProjectTask> {
	const db = getDbOrThrow();

	const [task] = await db
		.insert(projectTasks)
		.values({
			...taskData,
			projectId,
		})
		.returning();

	return task;
}

/**
 * Get tasks for a project
 */
export async function getProjectTasks(
	projectId: string,
	options?: {
		status?: string;
		priority?: string;
	},
): Promise<ProjectTask[]> {
	const db = getDbOrThrow();

	const conditions = [eq(projectTasks.projectId, projectId)];

	if (options?.status) {
		conditions.push(eq(projectTasks.status, options.status));
	}

	if (options?.priority) {
		conditions.push(eq(projectTasks.priority, options.priority));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(projectTasks)
		.where(whereClause)
		.orderBy(desc(projectTasks.priority), desc(projectTasks.dueDate));

	return result;
}

/**
 * Update task status
 */
export async function updateTaskStatus(
	taskId: string,
	contractorId: string,
	status: string,
	actualHours?: number,
	notes?: string,
): Promise<ProjectTask | null> {
	const db = getDbOrThrow();

	// Verify contractor owns the project
	const [task] = await db
		.select()
		.from(projectTasks)
		.innerJoin(projects, eq(projectTasks.projectId, projects.id))
		.where(
			and(eq(projectTasks.id, taskId), eq(projects.contractorId, contractorId)),
		)
		.limit(1);

	if (!task) return null;

	const updateData: any = { status };
	if (actualHours) {
		updateData.actualHours = actualHours;
	}
	if (status === "completed") {
		updateData.completedDate = new Date();
	}

	const [updatedTask] = await db
		.update(projectTasks)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(eq(projectTasks.id, taskId))
		.returning();

	return updatedTask || null;
}

/**
 * Create a service request
 */
export async function createServiceRequest(
	requestData: Omit<NewServiceRequest, "createdAt" | "updatedAt">,
): Promise<ServiceRequest> {
	const db = getDbOrThrow();

	const [request] = await db
		.insert(serviceRequests)
		.values(requestData)
		.returning();

	return request;
}

/**
 * Get service requests for a contractor
 */
export async function getContractorServiceRequests(
	contractorId: string,
	options?: {
		status?: string;
		priority?: string;
		category?: string;
		limit?: number;
		offset?: number;
	},
): Promise<ServiceRequest[]> {
	const db = getDbOrThrow();

	const conditions = [eq(serviceRequests.contractorId, contractorId)];

	if (options?.status) {
		conditions.push(eq(serviceRequests.status, options.status));
	}

	if (options?.priority) {
		conditions.push(eq(serviceRequests.priority, options.priority));
	}

	if (options?.category) {
		conditions.push(eq(serviceRequests.category, options.category));
	}

	const whereClause = and(...conditions);

	const result = await db
		.select()
		.from(serviceRequests)
		.where(whereClause)
		.orderBy(desc(serviceRequests.priority), desc(serviceRequests.requestDate))
		.limit(options?.limit || 50)
		.offset(options?.offset || 0);

	return result;
}

/**
 * Update service request status
 */
export async function updateServiceRequestStatus(
	requestId: string,
	contractorId: string,
	status: string,
	estimatedCost?: number,
	actualCost?: number,
	notes?: string,
): Promise<ServiceRequest | null> {
	const db = getDbOrThrow();

	const updateData: any = { status };
	if (estimatedCost) {
		updateData.estimatedCost = estimatedCost;
	}
	if (actualCost) {
		updateData.actualCost = actualCost;
	}
	if (notes) {
		updateData.contractorNotes = notes;
	}
	if (status === "completed") {
		updateData.completedDate = new Date();
	}

	const [request] = await db
		.update(serviceRequests)
		.set({
			...updateData,
			updatedAt: new Date(),
		})
		.where(
			and(
				eq(serviceRequests.id, requestId),
				eq(serviceRequests.contractorId, contractorId),
			),
		)
		.returning();

	return request || null;
}

/**
 * Get contractor performance metrics
 */
export async function getContractorPerformance(
	contractorId: string,
	startDate?: Date,
	endDate?: Date,
): Promise<{
	totalProjects: number;
	completedProjects: number;
	activeProjects: number;
	totalRevenue: number;
	averageProjectValue: number;
	completionRate: number;
	totalServiceRequests: number;
	completedServiceRequests: number;
	averageResponseTime: number;
}> {
	const db = getDbOrThrow();

	const conditions = [eq(projects.contractorId, contractorId)];

	if (startDate) {
		conditions.push(sql`${projects.createdAt} >= ${startDate}`);
	}

	if (endDate) {
		conditions.push(sql`${projects.createdAt} <= ${endDate}`);
	}

	const whereClause = and(...conditions);

	// Get project statistics
	const [projectStats] = await db
		.select({
			totalProjects: count(projects.id),
			completedProjects: sql<number>`count(CASE WHEN ${projects.status} = 'completed' THEN 1 END)`,
			activeProjects: sql<number>`count(CASE WHEN ${projects.status} = 'in_progress' THEN 1 END)`,
			totalRevenue: sql<number>`COALESCE(sum(${projects.actualCost}), 0)`,
			averageProjectValue: sql<number>`COALESCE(avg(${projects.actualCost}), 0)`,
		})
		.from(projects)
		.where(whereClause);

	// Get service request statistics
	const [serviceStats] = await db
		.select({
			totalServiceRequests: count(serviceRequests.id),
			completedServiceRequests: sql<number>`count(CASE WHEN ${serviceRequests.status} = 'completed' THEN 1 END)`,
		})
		.from(serviceRequests)
		.where(eq(serviceRequests.contractorId, contractorId));

	const totalProjects = Number(projectStats?.totalProjects || 0);
	const completedProjects = Number(projectStats?.completedProjects || 0);
	const completionRate =
		totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

	return {
		totalProjects,
		completedProjects,
		activeProjects: Number(projectStats?.activeProjects || 0),
		totalRevenue: Number(projectStats?.totalRevenue || 0),
		averageProjectValue: Number(projectStats?.averageProjectValue || 0),
		completionRate,
		totalServiceRequests: Number(serviceStats?.totalServiceRequests || 0),
		completedServiceRequests: Number(
			serviceStats?.completedServiceRequests || 0,
		),
		averageResponseTime: 0, // Would need to calculate based on request to acknowledgment time
	};
}
