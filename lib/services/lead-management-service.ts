/**
 * Lead Management Service
 * Business logic for lead tracking, conversion pipeline, and CRM functionality
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
import { leads, type Lead } from '@/lib/db/schemas/leads.schema';
import { leadActivities, type LeadActivity } from '@/lib/db/schemas/lead-activities.schema';
import { leadTasks, type LeadTask } from '@/lib/db/schemas/lead-tasks.schema';
import { clients } from '@/lib/db/schemas/clients.schema';
import { eq, and, desc, ilike, or, sql, gte, lte, isNull } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreateLeadInput {
	userId: string;
	firstName: string;
	lastName: string;
	email: string;
	phone?: string;
	company?: string;
	jobTitle?: string;
	website?: string;
	source: 'website' | 'referral' | 'social_media' | 'email_campaign' | 'cold_call' | 'trade_show' | 'advertisement' | 'partner' | 'other';
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	estimatedValue?: number;
	probability?: number;
	expectedCloseDate?: Date;
	assignedTo?: string;
	tags?: string[];
	notes?: string;
	metadata?: Record<string, unknown>;
}

interface CreateLeadActivityInput {
	userId: string;
	leadId: string;
	type: 'call' | 'email' | 'meeting' | 'proposal' | 'follow_up' | 'note' | 'task' | 'conversion' | 'status_change';
	subject: string;
	description?: string;
	scheduledDate?: Date;
	duration?: number;
	outcome?: string;
	nextSteps?: string;
	notes?: string;
	requiresFollowUp?: boolean;
	followUpDate?: Date;
	metadata?: Record<string, unknown>;
}

interface CreateLeadTaskInput {
	userId: string;
	leadId: string;
	title: string;
	description?: string;
	priority?: 'low' | 'medium' | 'high' | 'urgent';
	dueDate?: Date;
	reminderDate?: Date;
	assignedTo?: string;
	isRecurring?: boolean;
	recurrencePattern?: string;
	parentTaskId?: string;
	tags?: string[];
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface LeadStats {
	totalLeads: number;
	newLeads: number;
	qualifiedLeads: number;
	convertedLeads: number;
	totalValue: number;
	conversionRate: number;
	averageLeadScore: number;
	leadsByStatus: Array<{
		status: string;
		count: number;
		value: number;
	}>;
	leadsBySource: Array<{
		source: string;
		count: number;
		conversionRate: number;
	}>;
	topPerformingSources: Array<{
		source: string;
		leads: number;
		conversions: number;
		value: number;
	}>;
	recentActivities: Array<{
		id: string;
		leadName: string;
		activityType: string;
		description: string;
		createdAt: string;
	}>;
}

interface PipelineMetrics {
	stage: string;
	leads: number;
	value: number;
	conversionRate: number;
	averageTime: number; // in days
}

/**
 * Create a new lead
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
	try {
		// Calculate lead score based on available data
		let leadScore = 0;
		if (input.company) leadScore += 20;
		if (input.jobTitle) leadScore += 15;
		if (input.phone) leadScore += 10;
		if (input.website) leadScore += 5;
		if (input.estimatedValue && input.estimatedValue > 10000) leadScore += 25;
		if (input.priority === 'high') leadScore += 20;
		if (input.priority === 'urgent') leadScore += 30;

		const [lead] = await db.insert(leads).values({
			userId: input.userId,
			firstName: input.firstName,
			lastName: input.lastName,
			email: input.email,
			phone: input.phone,
			company: input.company,
			jobTitle: input.jobTitle,
			website: input.website,
			source: input.source,
			priority: input.priority || 'medium',
			leadScore: leadScore.toString(),
			estimatedValue: input.estimatedValue?.toString(),
			probability: input.probability?.toString(),
			expectedCloseDate: input.expectedCloseDate,
			assignedTo: input.assignedTo,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendLeadCreated(lead.id, input.userId);

		return lead;
	} catch (error) {
		console.error('Error creating lead:', error);
		throw new Error('Failed to create lead');
	}
}

/**
 * Get lead by ID
 */
export async function getLeadById(leadId: string, userId: string): Promise<Lead | null> {
	const lead = await db.query.leads.findFirst({
		where: and(
			eq(leads.id, leadId),
			eq(leads.userId, userId)
		),
	});

	return lead || null;
}

/**
 * Get all leads for a user with pagination and filtering
 */
export async function getPaginatedLeads(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		source?: string;
		priority?: string;
		assignedTo?: string;
	} = {}
): Promise<{
	leads: Lead[];
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
		source,
		priority,
		assignedTo
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(leads.userId, userId)];
	
	if (search) {
		whereConditions.push(
			or(
				ilike(leads.firstName, `%${search}%`),
				ilike(leads.lastName, `%${search}%`),
				ilike(leads.email, `%${search}%`),
				ilike(leads.company, `%${search}%`)
			)!
		);
	}
	
	if (status) {
		whereConditions.push(eq(leads.status, status as any));
	}
	
	if (source) {
		whereConditions.push(eq(leads.source, source as any));
	}
	
	if (priority) {
		whereConditions.push(eq(leads.priority, priority as any));
	}
	
	if (assignedTo) {
		whereConditions.push(eq(leads.assignedTo, assignedTo));
	}

	// Get leads
	const leadsList = await db
		.select()
		.from(leads)
		.where(and(...whereConditions))
		.orderBy(desc(leads.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(leads)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		leads: leadsList,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Update lead
 */
export async function updateLead(
	leadId: string,
	userId: string,
	updateData: Partial<CreateLeadInput>
): Promise<Lead> {
	try {
		const [updatedLead] = await db
			.update(leads)
			.set({
				firstName: updateData.firstName,
				lastName: updateData.lastName,
				email: updateData.email,
				phone: updateData.phone,
				company: updateData.company,
				jobTitle: updateData.jobTitle,
				website: updateData.website,
				source: updateData.source,
				priority: updateData.priority,
				estimatedValue: updateData.estimatedValue?.toString(),
				probability: updateData.probability?.toString(),
				expectedCloseDate: updateData.expectedCloseDate,
				assignedTo: updateData.assignedTo,
				tags: updateData.tags ? JSON.stringify(updateData.tags) : undefined,
				metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
				notes: updateData.notes,
				updatedAt: new Date(),
			})
			.where(and(
				eq(leads.id, leadId),
				eq(leads.userId, userId)
			))
			.returning();

		if (!updatedLead) {
			throw new Error('Lead not found');
		}

		return updatedLead;
	} catch (error) {
		console.error('Error updating lead:', error);
		throw new Error('Failed to update lead');
	}
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
	leadId: string,
	userId: string,
	status: string,
	notes?: string
): Promise<Lead> {
	try {
		const [updatedLead] = await db
			.update(leads)
			.set({
				status: status as any,
				notes: notes,
				updatedAt: new Date(),
			})
			.where(and(
				eq(leads.id, leadId),
				eq(leads.userId, userId)
			))
			.returning();

		if (!updatedLead) {
			throw new Error('Lead not found');
		}

		// If converting to client, mark as converted
		if (status === 'closed_won') {
			await db
				.update(leads)
				.set({
					convertedToClient: true,
					actualCloseDate: new Date(),
				})
				.where(eq(leads.id, leadId));
		}

		return updatedLead;
	} catch (error) {
		console.error('Error updating lead status:', error);
		throw new Error('Failed to update lead status');
	}
}

/**
 * Create a lead activity
 */
export async function createLeadActivity(input: CreateLeadActivityInput): Promise<LeadActivity> {
	try {
		const [activity] = await db.insert(leadActivities).values({
			userId: input.userId,
			leadId: input.leadId,
			type: input.type,
			subject: input.subject,
			description: input.description,
			scheduledDate: input.scheduledDate,
			duration: input.duration?.toString(),
			outcome: input.outcome,
			nextSteps: input.nextSteps,
			notes: input.notes,
			requiresFollowUp: input.requiresFollowUp ?? false,
			followUpDate: input.followUpDate,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
		}).returning();

		// Update lead's last contact date
		await db
			.update(leads)
			.set({
				lastContactDate: new Date(),
				contactAttempts: sql`${leads.contactAttempts} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(leads.id, input.leadId));

		// Send notification
		await NotificationHelpers.sendLeadActivityCreated(activity.id, input.userId);

		return activity;
	} catch (error) {
		console.error('Error creating lead activity:', error);
		throw new Error('Failed to create lead activity');
	}
}

/**
 * Create a lead task
 */
export async function createLeadTask(input: CreateLeadTaskInput): Promise<LeadTask> {
	try {
		const [task] = await db.insert(leadTasks).values({
			userId: input.userId,
			leadId: input.leadId,
			title: input.title,
			description: input.description,
			priority: input.priority || 'medium',
			dueDate: input.dueDate,
			reminderDate: input.reminderDate,
			assignedTo: input.assignedTo,
			isRecurring: input.isRecurring ?? false,
			recurrencePattern: input.recurrencePattern,
			parentTaskId: input.parentTaskId,
			tags: input.tags ? JSON.stringify(input.tags) : null,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendLeadTaskCreated(task.id, input.userId);

		return task;
	} catch (error) {
		console.error('Error creating lead task:', error);
		throw new Error('Failed to create lead task');
	}
}

/**
 * Get lead statistics
 */
export async function getLeadStats(userId: string): Promise<LeadStats> {
	// Get basic lead stats
	const [basicStats] = await db
		.select({
			totalLeads: sql<number>`count(*)`,
			newLeads: sql<number>`count(case when ${leads.status} = 'new' then 1 end)`,
			qualifiedLeads: sql<number>`count(case when ${leads.isQualified} = true then 1 end)`,
			convertedLeads: sql<number>`count(case when ${leads.convertedToClient} = true then 1 end)`,
			totalValue: sql<number>`sum(${leads.estimatedValue}::numeric)`,
			averageLeadScore: sql<number>`avg(${leads.leadScore}::numeric)`,
		})
		.from(leads)
		.where(eq(leads.userId, userId));

	// Get leads by status
	const leadsByStatus = await db
		.select({
			status: leads.status,
			count: sql<number>`count(*)`,
			value: sql<number>`sum(${leads.estimatedValue}::numeric})`,
		})
		.from(leads)
		.where(eq(leads.userId, userId))
		.groupBy(leads.status);

	// Get leads by source
	const leadsBySource = await db
		.select({
			source: leads.source,
			count: sql<number>`count(*)`,
			conversions: sql<number>`count(case when ${leads.convertedToClient} = true then 1 end)`,
		})
		.from(leads)
		.where(eq(leads.userId, userId))
		.groupBy(leads.source);

	// Get recent activities
	const recentActivities = await db
		.select({
			id: leadActivities.id,
			leadName: sql<string>`${leads.firstName} || ' ' || ${leads.lastName}`,
			activityType: leadActivities.type,
			description: leadActivities.subject,
			createdAt: leadActivities.createdAt,
		})
		.from(leadActivities)
		.innerJoin(leads, eq(leadActivities.leadId, leads.id))
		.where(eq(leadActivities.userId, userId))
		.orderBy(desc(leadActivities.createdAt))
		.limit(10);

	const totalLeads = basicStats?.totalLeads || 0;
	const convertedLeads = basicStats?.convertedLeads || 0;
	const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

	return {
		totalLeads,
		newLeads: basicStats?.newLeads || 0,
		qualifiedLeads: basicStats?.qualifiedLeads || 0,
		convertedLeads,
		totalValue: Number(basicStats?.totalValue || 0),
		conversionRate,
		averageLeadScore: Number(basicStats?.averageLeadScore || 0),
		leadsByStatus: leadsByStatus.map(status => ({
			status: status.status,
			count: status.count,
			value: Number(status.value || 0),
		})),
		leadsBySource: leadsBySource.map(source => ({
			source: source.source,
			count: source.count,
			conversionRate: source.count > 0 ? (source.conversions / source.count) * 100 : 0,
		})),
		topPerformingSources: leadsBySource
			.filter(source => source.count > 0)
			.sort((a, b) => b.conversions - a.conversions)
			.slice(0, 5)
			.map(source => ({
				source: source.source,
				leads: source.count,
				conversions: source.conversions,
				value: 0, // Would need to calculate from actual conversions
			})),
		recentActivities: recentActivities.map(activity => ({
			id: activity.id,
			leadName: activity.leadName,
			activityType: activity.activityType,
			description: activity.description,
			createdAt: activity.createdAt.toISOString(),
		})),
	};
}

/**
 * Get pipeline metrics
 */
export async function getPipelineMetrics(userId: string): Promise<PipelineMetrics[]> {
	const pipelineData = await db
		.select({
			status: leads.status,
			count: sql<number>`count(*)`,
			value: sql<number>`sum(${leads.estimatedValue}::numeric)`,
			avgTime: sql<number>`avg(extract(epoch from (now() - ${leads.createdAt})) / 86400)`,
		})
		.from(leads)
		.where(eq(leads.userId, userId))
		.groupBy(leads.status);

	const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0);
	const convertedLeads = pipelineData.find(stage => stage.status === 'closed_won')?.count || 0;

	return pipelineData.map(stage => ({
		stage: stage.status,
		leads: stage.count,
		value: Number(stage.value || 0),
		conversionRate: totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0,
		averageTime: Number(stage.avgTime || 0),
	}));
}

/**
 * Convert lead to client
 */
export async function convertLeadToClient(
	leadId: string,
	userId: string,
	clientData: {
		companyName: string;
		contactName?: string;
		email: string;
		phone?: string;
		address?: string;
		city?: string;
		state?: string;
		zipCode?: string;
		country?: string;
		currency?: string;
		paymentTerms?: string;
		notes?: string;
	}
): Promise<{ lead: Lead; clientId: string }> {
	try {
		// Create client
		const [client] = await db.insert(clients).values({
			userId: userId,
			companyName: clientData.companyName,
			contactName: clientData.contactName,
			email: clientData.email,
			phone: clientData.phone,
			address: clientData.address,
			city: clientData.city,
			state: clientData.state,
			zipCode: clientData.zipCode,
			country: clientData.country || 'US',
			currency: clientData.currency || 'USD',
			paymentTerms: clientData.paymentTerms || 'net30',
			notes: clientData.notes,
		}).returning();

		// Update lead
		const [updatedLead] = await db
			.update(leads)
			.set({
				status: 'closed_won',
				convertedToClient: true,
				clientId: client.id,
				actualCloseDate: new Date(),
				updatedAt: new Date(),
			})
			.where(and(
				eq(leads.id, leadId),
				eq(leads.userId, userId)
			))
			.returning();

		if (!updatedLead) {
			throw new Error('Lead not found');
		}

		// Create conversion activity
		await createLeadActivity({
			userId,
			leadId,
			type: 'conversion',
			subject: 'Lead converted to client',
			description: `Lead ${updatedLead.firstName} ${updatedLead.lastName} has been converted to client ${client.companyName}`,
			notes: 'Lead successfully converted to client',
		});

		return { lead: updatedLead, clientId: client.id };
	} catch (error) {
		console.error('Error converting lead to client:', error);
		throw new Error('Failed to convert lead to client');
	}
}

// Export all lead management service functions
export const LeadManagementService = {
	createLead,
	getLeadById,
	getPaginatedLeads,
	updateLead,
	updateLeadStatus,
	createLeadActivity,
	createLeadTask,
	getLeadStats,
	getPipelineMetrics,
	convertLeadToClient,
};
