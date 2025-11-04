/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { freelanceDb } from "@/lib/db/connection-freelance";
import {
	type NewTimesheet,
	type NewTimesheetApproval,
	type NewTimesheetEntry,
	type NewTimesheetNotification,
	type NewTimesheetTemplate,
	type Timesheet,
	type TimesheetApproval,
	type TimesheetEntry,
	type TimesheetNotification,
	type TimesheetTemplate,
	timesheetApprovals,
	timesheetEntries,
	timesheetNotifications,
	timesheetTemplates,
	timesheets,
} from "@/lib/db/schemas/freelance.schema";
import { auth } from "@clerk/nextjs/server";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { Bell, Clock, MessageCircle, Server, Trash2 } from "lucide-react";

export interface CreateTimesheetInput {
	projectId: string;
	clientId?: string;
	taskName: string;
	description?: string;
	date: Date;
	startTime: Date;
	endTime: Date;
	hourlyRate?: number;
	isBillable?: boolean;
	tags?: string[];
	notes?: string;
	entries?: Omit<NewTimesheetEntry, "timesheetId">[];
}

export interface UpdateTimesheetInput {
	taskName?: string;
	description?: string;
	startTime?: Date;
	endTime?: Date;
	hourlyRate?: number;
	isBillable?: boolean;
	tags?: string[];
	notes?: string;
}

export interface TimesheetFilters {
	status?: string | string[];
	projectId?: string | string[];
	clientId?: string | string[];
	dateFrom?: Date;
	dateTo?: Date;
	userId?: string;
	// Advanced filtering options
	tags?: string | string[];
	isBillable?: boolean;
	minAmount?: number;
	maxAmount?: number;
	minDuration?: number;
	maxDuration?: number;
	submittedAfter?: Date;
	submittedBefore?: Date;
	approvedAfter?: Date;
	approvedBefore?: Date;
	sortBy?: "date" | "amount" | "duration" | "createdAt";
	sortOrder?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

export interface TimesheetStats {
	totalHours: number;
	totalAmount: number;
	approvedHours: number;
	approvedAmount: number;
	pendingHours: number;
	pendingAmount: number;
}

/**
 * Timesheet Service - Handles all timesheet-related operations
 */
export class TimesheetService {
	private db = freelanceDb;

	/**
	 * Create a new timesheet
	 */
	async createTimesheet(input: CreateTimesheetInput): Promise<Timesheet> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const durationMinutes = Math.floor(
			(input.endTime.getTime() - input.startTime.getTime()) / (1000 * 60),
		);
		const totalAmount = input.hourlyRate
			? (durationMinutes / 60) * input.hourlyRate
			: 0;

		const newTimesheet: NewTimesheet = {
			userId,
			projectId: input.projectId,
			clientId: input.clientId,
			taskName: input.taskName,
			description: input.description,
			date: input.date,
			startTime: input.startTime,
			endTime: input.endTime,
			durationMinutes,
			hourlyRate: input.hourlyRate?.toString(),
			totalAmount: totalAmount.toString(),
			isBillable: input.isBillable ?? true,
			tags: input.tags,
			notes: input.notes,
		};

		const [timesheet] = await this.db
			.insert(timesheets)
			.values(newTimesheet)
			.returning();

		// Create timesheet entries if provided
		if (input.entries && input.entries.length > 0) {
			const entriesWithTimesheetId = input.entries.map((entry) => ({
				...entry,
				timesheetId: timesheet.id,
			}));
			await this.db.insert(timesheetEntries).values(entriesWithTimesheetId);
		}

		return timesheet;
	}

	/**
	 * Get timesheets with filters
	 */
	async getTimesheets(filters: TimesheetFilters = {}): Promise<Timesheet[]> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = this.db.select().from(timesheets);

		// Apply filters
		const conditions = [];

		if (filters.status) {
			if (Array.isArray(filters.status)) {
				conditions.push(inArray(timesheets.status, filters.status));
			} else {
				conditions.push(eq(timesheets.status, filters.status));
			}
		}

		if (filters.projectId) {
			if (Array.isArray(filters.projectId)) {
				conditions.push(inArray(timesheets.projectId, filters.projectId));
			} else {
				conditions.push(eq(timesheets.projectId, filters.projectId));
			}
		}

		if (filters.clientId) {
			if (Array.isArray(filters.clientId)) {
				conditions.push(inArray(timesheets.clientId, filters.clientId));
			} else {
				conditions.push(eq(timesheets.clientId, filters.clientId));
			}
		}

		if (filters.userId) {
			conditions.push(eq(timesheets.userId, filters.userId));
		} else {
			conditions.push(eq(timesheets.userId, userId));
		}

		if (filters.dateFrom) {
			conditions.push(gte(timesheets.date, filters.dateFrom));
		}

		if (filters.dateTo) {
			conditions.push(lte(timesheets.date, filters.dateTo));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		return await query.orderBy(desc(timesheets.createdAt));
	}

	/**
	 * Get a single timesheet by ID
	 */
	async getTimesheetById(id: string): Promise<Timesheet | null> {
		const [timesheet] = await this.db
			.select()
			.from(timesheets)
			.where(eq(timesheets.id, id))
			.limit(1);

		return timesheet || null;
	}

	/**
	 * Update a timesheet
	 */
	async updateTimesheet(
		id: string,
		input: UpdateTimesheetInput,
	): Promise<Timesheet> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Check if timesheet exists and user owns it
		const existingTimesheet = await this.getTimesheetById(id);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.userId !== userId) {
			throw new Error("Unauthorized to update this timesheet");
		}

		// Calculate duration and amount if time is being updated
		let updateData: Partial<NewTimesheet> = { ...input };

		if (input.startTime && input.endTime) {
			const durationMinutes = Math.floor(
				(input.endTime.getTime() - input.startTime.getTime()) / (1000 * 60),
			);
			const totalAmount = input.hourlyRate
				? (durationMinutes / 60) * input.hourlyRate
				: Number.parseFloat(existingTimesheet.totalAmount || "0");

			updateData = {
				...updateData,
				durationMinutes,
				totalAmount: totalAmount.toString(),
			};
		}

		const [updatedTimesheet] = await this.db
			.update(timesheets)
			.set(updateData)
			.where(eq(timesheets.id, id))
			.returning();

		return updatedTimesheet;
	}

	/**
	 * Delete a timesheet
	 */
	async deleteTimesheet(id: string): Promise<void> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		// Check if timesheet exists and user owns it
		const existingTimesheet = await this.getTimesheetById(id);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.userId !== userId) {
			throw new Error("Unauthorized to delete this timesheet");
		}

		await this.db.delete(timesheets).where(eq(timesheets.id, id));
	}

	/**
	 * Submit a timesheet for approval
	 */
	async submitTimesheet(id: string): Promise<Timesheet> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const existingTimesheet = await this.getTimesheetById(id);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.userId !== userId) {
			throw new Error("Unauthorized to submit this timesheet");
		}

		if (existingTimesheet.status !== "draft") {
			throw new Error("Only draft timesheets can be submitted");
		}

		const [updatedTimesheet] = await this.db
			.update(timesheets)
			.set({
				status: "submitted",
				submittedAt: new Date(),
			})
			.where(eq(timesheets.id, id))
			.returning();

		// Create notification for client/approver
		await this.createTimesheetNotification(
			id,
			existingTimesheet.clientId || "",
			"submitted",
			"Timesheet submitted for approval",
		);

		return updatedTimesheet;
	}

	/**
	 * Approve a timesheet
	 */
	async approveTimesheet(
		id: string,
		approverId: string,
		comments?: string,
	): Promise<Timesheet> {
		const existingTimesheet = await this.getTimesheetById(id);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.status !== "submitted") {
			throw new Error("Only submitted timesheets can be approved");
		}

		const [updatedTimesheet] = await this.db
			.update(timesheets)
			.set({
				status: "approved",
				approvedAt: new Date(),
				approvedBy: approverId,
			})
			.where(eq(timesheets.id, id))
			.returning();

		// Create approval record
		await this.db.insert(timesheetApprovals).values({
			timesheetId: id,
			approverId,
			status: "approved",
			comments,
			approvedAt: new Date(),
		});

		// Create notification for freelancer
		await this.createTimesheetNotification(
			id,
			existingTimesheet.userId,
			"approved",
			"Timesheet approved",
		);

		return updatedTimesheet;
	}

	/**
	 * Reject a timesheet
	 */
	async rejectTimesheet(
		id: string,
		rejectorId: string,
		reason: string,
	): Promise<Timesheet> {
		const existingTimesheet = await this.getTimesheetById(id);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.status !== "submitted") {
			throw new Error("Only submitted timesheets can be rejected");
		}

		const [updatedTimesheet] = await this.db
			.update(timesheets)
			.set({
				status: "rejected",
				rejectedAt: new Date(),
				rejectedBy: rejectorId,
				rejectionReason: reason,
			})
			.where(eq(timesheets.id, id))
			.returning();

		// Create approval record
		await this.db.insert(timesheetApprovals).values({
			timesheetId: id,
			approverId: rejectorId,
			status: "rejected",
			comments: reason,
		});

		// Create notification for freelancer
		await this.createTimesheetNotification(
			id,
			existingTimesheet.userId,
			"rejected",
			`Timesheet rejected: ${reason}`,
		);

		return updatedTimesheet;
	}

	/**
	 * Get timesheet statistics for a user/project
	 */
	async getTimesheetStats(
		filters: TimesheetFilters = {},
	): Promise<TimesheetStats> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		let query = this.db
			.select({
				status: timesheets.status,
				durationMinutes: sql<number>`SUM(${timesheets.durationMinutes})`,
				totalAmount: sql<number>`SUM(CAST(${timesheets.totalAmount} AS DECIMAL))`,
			})
			.from(timesheets);

		// Apply filters
		const conditions = [];

		if (filters.projectId) {
			if (Array.isArray(filters.projectId)) {
				conditions.push(inArray(timesheets.projectId, filters.projectId));
			} else {
				conditions.push(eq(timesheets.projectId, filters.projectId));
			}
		}

		if (filters.userId) {
			conditions.push(eq(timesheets.userId, filters.userId));
		} else {
			conditions.push(eq(timesheets.userId, userId));
		}

		if (filters.dateFrom) {
			conditions.push(gte(timesheets.date, filters.dateFrom));
		}

		if (filters.dateTo) {
			conditions.push(lte(timesheets.date, filters.dateTo));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		query = query.groupBy(timesheets.status);

		const results = await query;

		const stats: TimesheetStats = {
			totalHours: 0,
			totalAmount: 0,
			approvedHours: 0,
			approvedAmount: 0,
			pendingHours: 0,
			pendingAmount: 0,
		};

		results.forEach((result) => {
			const hours = (result.durationMinutes || 0) / 60;
			const amount = Number.parseFloat(result.totalAmount || "0");

			stats.totalHours += hours;
			stats.totalAmount += amount;

			if (result.status === "approved") {
				stats.approvedHours += hours;
				stats.approvedAmount += amount;
			} else if (result.status === "submitted") {
				stats.pendingHours += hours;
				stats.pendingAmount += amount;
			}
		});

		return stats;
	}

	/**
	 * Create a timesheet notification
	 */
	private async createTimesheetNotification(
		timesheetId: string,
		recipientId: string,
		type: string,
		message: string,
	): Promise<void> {
		await this.db.insert(timesheetNotifications).values({
			timesheetId,
			recipientId,
			type,
			message,
			sentAt: new Date(),
		});
	}

	/**
	 * Get timesheet entries for a timesheet
	 */
	async getTimesheetEntries(timesheetId: string): Promise<TimesheetEntry[]> {
		return await this.db
			.select()
			.from(timesheetEntries)
			.where(eq(timesheetEntries.timesheetId, timesheetId))
			.orderBy(timesheetEntries.startTime);
	}

	/**
	 * Add entry to timesheet
	 */
	async addTimesheetEntry(
		timesheetId: string,
		entry: Omit<NewTimesheetEntry, "timesheetId">,
	): Promise<TimesheetEntry> {
		const { userId } = await auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const existingTimesheet = await this.getTimesheetById(timesheetId);
		if (!existingTimesheet) {
			throw new Error("Timesheet not found");
		}

		if (existingTimesheet.userId !== userId) {
			throw new Error("Unauthorized to modify this timesheet");
		}

		const newEntry: NewTimesheetEntry = {
			...entry,
			timesheetId,
		};

		const [createdEntry] = await this.db
			.insert(timesheetEntries)
			.values(newEntry)
			.returning();
		return createdEntry;
	}

	/**
	 * Get timesheet templates for a user
	 */
	async getTimesheetTemplates(userId?: string): Promise<TimesheetTemplate[]> {
		const { userId: currentUserId } = await auth();
		if (!currentUserId) {
			throw new Error("Unauthorized");
		}

		const targetUserId = userId || currentUserId;

		return await this.db
			.select()
			.from(timesheetTemplates)
			.where(
				and(
					eq(timesheetTemplates.userId, targetUserId),
					eq(timesheetTemplates.isActive, true),
				),
			)
			.orderBy(desc(timesheetTemplates.createdAt));
	}

	/**
	 * Create timesheet template
	 */
	async createTimesheetTemplate(
		template: Omit<NewTimesheetTemplate, "userId">,
	): Promise<TimesheetTemplate> {
		const { userId } = auth();
		if (!userId) {
			throw new Error("Unauthorized");
		}

		const newTemplate: NewTimesheetTemplate = {
			...template,
			userId,
		};

		const [createdTemplate] = await this.db
			.insert(timesheetTemplates)
			.values(newTemplate)
			.returning();
		return createdTemplate;
	}
}
